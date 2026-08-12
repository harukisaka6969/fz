"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireCustomer } from "@/lib/auth";

export async function sendCustomerMessageAction(formData: FormData) {
  const customer = await requireCustomer();
  const body = String(formData.get("body") ?? "").trim();
  if (!body) return;

  await prisma.message.create({
    data: {
      customerId: customer.id,
      sender: "CUSTOMER",
      body,
      readByCustomer: true,
    },
  });

  revalidatePath("/mypage/messages");
  revalidatePath("/admin/messages");
  revalidatePath(`/admin/customers/${customer.id}`);
}

export async function postReviewAction(formData: FormData) {
  const customer = await requireCustomer();
  const rating = Math.min(5, Math.max(1, Number(formData.get("rating") ?? 5)));
  const comment = String(formData.get("comment") ?? "").trim();
  if (!comment) return;

  await prisma.review.create({
    data: { customerId: customer.id, rating, comment },
  });

  revalidatePath("/mypage/reviews");
  revalidatePath("/admin/reviews");
}

/// A customer's private note about a therapist. Only visible to that customer, never to the therapist/admin.
export async function createTherapistNoteAction(formData: FormData) {
  const customer = await requireCustomer();
  const therapistId = String(formData.get("therapistId") ?? "").trim();
  const body = String(formData.get("body") ?? "").trim();
  if (!therapistId || !body) return;

  await prisma.therapistNote.create({
    data: { customerId: customer.id, therapistId, body },
  });

  revalidatePath(`/mypage/therapists/${therapistId}`);
}

export async function bookSlotAction(formData: FormData) {
  const customer = await requireCustomer();
  const therapistId = String(formData.get("therapistId") ?? "").trim();
  const menuItemId = String(formData.get("menuItemId") ?? "").trim();
  const startAtRaw = String(formData.get("startAt") ?? "").trim();
  const endAtRaw = String(formData.get("endAt") ?? "").trim();
  if (!therapistId || !menuItemId || !startAtRaw || !endAtRaw) return;

  const therapist = await prisma.therapist.findUnique({ where: { id: therapistId } });
  if (!therapist || !therapist.isVerified) return;

  const startAt = new Date(startAtRaw);
  const endAt = new Date(endAtRaw);

  const overlapping = await prisma.booking.findFirst({
    where: {
      therapistId,
      status: "CONFIRMED",
      startAt: { lt: endAt },
      endAt: { gt: startAt },
    },
  });
  if (overlapping) return;

  await prisma.booking.create({
    data: { therapistId, customerId: customer.id, menuItemId, startAt, endAt },
  });

  revalidatePath("/mypage/book");
  revalidatePath("/therapist/calendar");
}

export async function cancelBookingAction(formData: FormData) {
  const customer = await requireCustomer();
  const id = String(formData.get("id") ?? "").trim();

  await prisma.booking
    .updateMany({
      where: { id, customerId: customer.id },
      data: { status: "CANCELED" },
    })
    .catch(() => {});

  revalidatePath("/mypage/book");
  revalidatePath("/therapist/calendar");
}
