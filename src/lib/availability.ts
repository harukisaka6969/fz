import { prisma } from "@/lib/prisma";

export type OpenSlot = {
  therapistId: string;
  therapistName: string;
  start: Date;
  end: Date;
};

const SLOT_STEP_MINUTES = 30;

function startOfDay(date: Date): Date {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

export async function getAvailableSlots({
  therapistIds,
  durationMin,
}: {
  /// Restricts candidate therapists (e.g. to only those the customer is registered
  /// with). Pass an empty array to yield no slots; omit to consider all verified therapists.
  therapistIds?: string[];
  durationMin: number;
}): Promise<OpenSlot[]> {
  if (therapistIds && therapistIds.length === 0) return [];

  const now = new Date();

  // Each therapist controls her own booking horizon (0 = bookings paused).
  const therapists = await prisma.therapist.findMany({
    where: {
      isVerified: true,
      bookingHorizonWeeks: { gt: 0 },
      ...(therapistIds ? { id: { in: therapistIds } } : {}),
    },
    select: { id: true, name: true, bookingHorizonWeeks: true },
  });
  if (therapists.length === 0) return [];

  const horizonDaysByTherapist = new Map(
    therapists.map((t) => [t.id, t.bookingHorizonWeeks * 7])
  );
  const maxHorizonDays = Math.max(...horizonDaysByTherapist.values());
  const rangeEnd = new Date(now.getTime() + maxHorizonDays * 24 * 60 * 60 * 1000);
  const involvedTherapistIds = therapists.map((t) => t.id);

  const rules = await prisma.availabilityRule.findMany({
    where: {
      isActive: true,
      therapistId: { in: involvedTherapistIds },
      startDate: { lte: rangeEnd },
      endDate: { gte: now },
    },
    include: { therapist: true },
  });

  if (rules.length === 0) return [];

  const bookings = await prisma.booking.findMany({
    where: {
      therapistId: { in: involvedTherapistIds },
      status: "CONFIRMED",
      startAt: { lte: rangeEnd },
      endAt: { gte: now },
    },
  });

  const slots: OpenSlot[] = [];

  for (let dayOffset = 0; dayOffset <= maxHorizonDays; dayOffset++) {
    const day = startOfDay(now);
    day.setDate(day.getDate() + dayOffset);
    const dow = day.getDay();

    for (const rule of rules) {
      if (rule.dayOfWeek !== dow) continue;
      if (dayOffset > (horizonDaysByTherapist.get(rule.therapistId) ?? 0)) continue;
      if (day < startOfDay(rule.startDate) || day > startOfDay(rule.endDate)) continue;

      const [startH, startM] = rule.startTime.split(":").map(Number);
      const [endH, endM] = rule.endTime.split(":").map(Number);

      const windowEnd = new Date(day);
      windowEnd.setHours(endH, endM, 0, 0);

      let cursor = new Date(day);
      cursor.setHours(startH, startM, 0, 0);

      while (true) {
        const slotStart = new Date(cursor);
        const slotEnd = new Date(cursor.getTime() + durationMin * 60000);
        if (slotEnd > windowEnd) break;

        if (slotStart >= now) {
          const overlapping = bookings.some(
            (b) =>
              b.therapistId === rule.therapistId &&
              slotStart < b.endAt &&
              slotEnd > b.startAt
          );
          if (!overlapping) {
            slots.push({
              therapistId: rule.therapistId,
              therapistName: rule.therapist.name,
              start: slotStart,
              end: slotEnd,
            });
          }
        }

        cursor = new Date(cursor.getTime() + SLOT_STEP_MINUTES * 60000);
      }
    }
  }

  slots.sort((a, b) => a.start.getTime() - b.start.getTime());
  return slots;
}
