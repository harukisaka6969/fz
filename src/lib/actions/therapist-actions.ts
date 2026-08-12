"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireTherapist } from "@/lib/auth";

function str(formData: FormData, key: string): string {
  return String(formData.get(key) ?? "").trim();
}

function num(formData: FormData, key: string): number {
  return Number(formData.get(key) ?? 0);
}

export async function updateOwnTherapistProfileAction(formData: FormData) {
  const therapist = await requireTherapist();

  await prisma.therapist.update({
    where: { id: therapist.id },
    data: {
      name: str(formData, "name"),
      catchCopy: str(formData, "catchCopy"),
      bio: str(formData, "bio"),
      age: formData.get("age") ? num(formData, "age") : null,
      height: formData.get("height") ? num(formData, "height") : null,
      bodyType: str(formData, "bodyType") || null,
      bloodType: str(formData, "bloodType") || null,
      areaOfWork: str(formData, "areaOfWork") || null,
      workingHours: str(formData, "workingHours") || null,
      photoUrl: str(formData, "photoUrl") || null,
      snsUrl: str(formData, "snsUrl") || null,
    },
  });

  revalidatePath("/therapist");
  revalidatePath("/mypage");
  revalidatePath(`/mypage/therapists/${therapist.id}`);
  revalidatePath("/");
}

export async function createAvailabilityRuleAction(formData: FormData) {
  const therapist = await requireTherapist();

  const dayOfWeek = num(formData, "dayOfWeek");
  const startTime = str(formData, "startTime");
  const endTime = str(formData, "endTime");
  const startDateRaw = str(formData, "startDate");
  const endDateRaw = str(formData, "endDate");
  if (!startTime || !endTime || !startDateRaw || !endDateRaw) return;

  await prisma.availabilityRule.create({
    data: {
      therapistId: therapist.id,
      dayOfWeek,
      startTime,
      endTime,
      startDate: new Date(startDateRaw),
      endDate: new Date(endDateRaw),
    },
  });

  revalidatePath("/therapist/calendar");
  revalidatePath("/mypage/book");
}

function fmtHour(hour: number): string {
  return `${String(hour).padStart(2, "0")}:00`;
}

/// Replaces this therapist's entire weekly availability with the hour cells selected
/// in the tap-to-toggle grid, merging consecutive hours per day into ranges.
export async function saveWeeklyAvailabilityAction(formData: FormData) {
  const therapist = await requireTherapist();

  const startDateRaw = str(formData, "startDate");
  const endDateRaw = str(formData, "endDate");
  if (!startDateRaw || !endDateRaw) return;

  let selectedKeys: string[] = [];
  try {
    selectedKeys = JSON.parse(str(formData, "slots") || "[]");
  } catch {
    return;
  }

  const hoursByDay = new Map<number, number[]>();
  for (const key of selectedKeys) {
    const [dayStr, hourStr] = key.split("-");
    const day = Number(dayStr);
    const hour = Number(hourStr);
    if (!Number.isInteger(day) || !Number.isInteger(hour)) continue;
    if (!hoursByDay.has(day)) hoursByDay.set(day, []);
    hoursByDay.get(day)!.push(hour);
  }

  const ranges: { dayOfWeek: number; startTime: string; endTime: string }[] = [];
  for (const [day, hours] of hoursByDay) {
    const sorted = [...hours].sort((a, b) => a - b);
    let rangeStart: number | null = null;
    let prev: number | null = null;
    for (const hour of sorted) {
      if (rangeStart === null) {
        rangeStart = hour;
      } else if (prev !== null && hour !== prev + 1) {
        ranges.push({ dayOfWeek: day, startTime: fmtHour(rangeStart), endTime: fmtHour(prev + 1) });
        rangeStart = hour;
      }
      prev = hour;
    }
    if (rangeStart !== null && prev !== null) {
      ranges.push({ dayOfWeek: day, startTime: fmtHour(rangeStart), endTime: fmtHour(prev + 1) });
    }
  }

  await prisma.availabilityRule.deleteMany({ where: { therapistId: therapist.id } });

  if (ranges.length > 0) {
    await prisma.availabilityRule.createMany({
      data: ranges.map((r) => ({
        therapistId: therapist.id,
        dayOfWeek: r.dayOfWeek,
        startTime: r.startTime,
        endTime: r.endTime,
        startDate: new Date(startDateRaw),
        endDate: new Date(endDateRaw),
      })),
    });
  }

  revalidatePath("/therapist/calendar");
  revalidatePath("/mypage/book");
}

export async function deleteAvailabilityRuleAction(formData: FormData) {
  const therapist = await requireTherapist();
  const id = str(formData, "id");

  await prisma.availabilityRule
    .delete({ where: { id, therapistId: therapist.id } })
    .catch(() => {});

  revalidatePath("/therapist/calendar");
  revalidatePath("/mypage/book");
}

export async function createOwnBlogPostAction(formData: FormData) {
  const therapist = await requireTherapist();
  const title = str(formData, "title");
  const body = str(formData, "body");
  if (!title || !body) return;

  await prisma.blogPost.create({
    data: { therapistId: therapist.id, title, body },
  });

  revalidatePath("/therapist/blog");
  revalidatePath("/mypage/blog");
}

export async function toggleOwnBlogPostPublishedAction(formData: FormData) {
  const therapist = await requireTherapist();
  const id = str(formData, "id");

  const post = await prisma.blogPost.findFirst({
    where: { id, therapistId: therapist.id },
  });
  if (!post) return;

  await prisma.blogPost.update({
    where: { id },
    data: { isPublished: !post.isPublished },
  });

  revalidatePath("/therapist/blog");
  revalidatePath("/mypage/blog");
}

export async function deleteOwnBlogPostAction(formData: FormData) {
  const therapist = await requireTherapist();
  const id = str(formData, "id");

  await prisma.blogPost
    .delete({ where: { id, therapistId: therapist.id } })
    .catch(() => {});

  revalidatePath("/therapist/blog");
  revalidatePath("/mypage/blog");
}

/// A therapist's private note about a customer. Never shown to the customer or other therapists.
export async function createOwnCustomerNoteAction(formData: FormData) {
  const therapist = await requireTherapist();
  const customerId = str(formData, "customerId");
  const body = str(formData, "body");
  if (!customerId || !body) return;

  await prisma.customerNote.create({
    data: { customerId, therapistId: therapist.id, body },
  });

  revalidatePath("/therapist/calendar");
}

export type RegisterCustomerState = {
  error?: string;
  success?: string;
};

/// Registers a customer (found by email) so they can see this therapist. Without
/// this link the customer cannot see the therapist at all, even if she is verified.
export async function registerCustomerByEmailAction(
  _prevState: RegisterCustomerState,
  formData: FormData
): Promise<RegisterCustomerState> {
  const therapist = await requireTherapist();
  const email = str(formData, "email").toLowerCase();
  if (!email) {
    return { error: "メールアドレスを入力してください。" };
  }

  const customer = await prisma.customer.findFirst({
    where: { email: { equals: email, mode: "insensitive" } },
  });
  if (!customer) {
    return { error: "そのメールアドレスのお客様は見つかりませんでした。" };
  }

  const existing = await prisma.therapistCustomer.findUnique({
    where: { therapistId_customerId: { therapistId: therapist.id, customerId: customer.id } },
  });
  if (existing) {
    return { error: `${customer.name} はすでに登録済みです。` };
  }

  await prisma.therapistCustomer.create({
    data: { therapistId: therapist.id, customerId: customer.id },
  });

  revalidatePath("/therapist/customers");
  return { success: `${customer.name} を登録しました。` };
}

export async function unregisterCustomerAction(formData: FormData) {
  const therapist = await requireTherapist();
  const customerId = str(formData, "customerId");

  await prisma.therapistCustomer
    .delete({
      where: { therapistId_customerId: { therapistId: therapist.id, customerId } },
    })
    .catch(() => {});

  revalidatePath("/therapist/customers");
}

export async function cancelOwnBookingAction(formData: FormData) {
  const therapist = await requireTherapist();
  const id = str(formData, "id");

  await prisma.booking
    .updateMany({
      where: { id, therapistId: therapist.id },
      data: { status: "CANCELED" },
    })
    .catch(() => {});

  revalidatePath("/therapist/calendar");
  revalidatePath("/mypage/book");
}
