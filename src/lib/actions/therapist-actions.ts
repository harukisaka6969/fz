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
