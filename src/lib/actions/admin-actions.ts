"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { hashPassword } from "@/lib/password";
import { InvoiceStatus } from "@prisma/client";

function str(formData: FormData, key: string): string {
  return String(formData.get(key) ?? "").trim();
}

function num(formData: FormData, key: string): number {
  return Number(formData.get(key) ?? 0);
}

// ---------- Therapists ----------

function therapistData(formData: FormData) {
  return {
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
  };
}

export async function createTherapistAction(formData: FormData) {
  await requireAdmin();

  const count = await prisma.therapist.count();
  await prisma.therapist.create({
    data: { ...therapistData(formData), sortOrder: count },
  });

  revalidatePath("/admin/therapists");
  revalidatePath("/mypage");
}

export async function updateTherapistAction(formData: FormData) {
  await requireAdmin();
  const id = str(formData, "id");
  if (!id) return;

  await prisma.therapist.update({ where: { id }, data: therapistData(formData) });

  revalidatePath("/admin/therapists");
  revalidatePath(`/admin/therapists/${id}`);
  revalidatePath("/mypage");
  revalidatePath(`/mypage/therapists/${id}`);
  revalidatePath("/");
}

export async function deleteTherapistAction(formData: FormData) {
  await requireAdmin();
  const id = str(formData, "id");
  await prisma.therapist.delete({ where: { id } }).catch(() => {});
  revalidatePath("/admin/therapists");
  revalidatePath("/mypage");
}

// ---------- Blog ----------

export async function createBlogPostAction(formData: FormData) {
  await requireAdmin();

  const therapistId = str(formData, "therapistId");
  const title = str(formData, "title");
  const body = str(formData, "body");
  if (!therapistId || !title || !body) return;

  await prisma.blogPost.create({ data: { therapistId, title, body } });

  revalidatePath("/admin/blog");
  revalidatePath("/mypage/blog");
}

export async function toggleBlogPostPublishedAction(formData: FormData) {
  await requireAdmin();
  const id = str(formData, "id");
  const post = await prisma.blogPost.findUnique({ where: { id } });
  if (!post) return;
  await prisma.blogPost.update({
    where: { id },
    data: { isPublished: !post.isPublished },
  });
  revalidatePath("/admin/blog");
  revalidatePath("/mypage/blog");
}

export async function deleteBlogPostAction(formData: FormData) {
  await requireAdmin();
  const id = str(formData, "id");
  await prisma.blogPost.delete({ where: { id } }).catch(() => {});
  revalidatePath("/admin/blog");
  revalidatePath("/mypage/blog");
}

// ---------- Customers ----------

export async function createCustomerAction(formData: FormData) {
  await requireAdmin();

  const loginId = str(formData, "loginId");
  const password = str(formData, "password");
  const name = str(formData, "name");
  if (!loginId || !password || !name) return;

  const adminNote = str(formData, "adminNote");

  const created = await prisma.customer.create({
    data: {
      loginId,
      passwordHash: await hashPassword(password),
      name,
      phone: str(formData, "phone") || null,
      email: str(formData, "email") || null,
    },
  });

  if (adminNote) {
    await prisma.customerNote.create({
      data: { customerId: created.id, body: adminNote },
    });
  }

  revalidatePath("/admin");
}

export async function createCustomerNoteAction(formData: FormData) {
  await requireAdmin();
  const customerId = str(formData, "customerId");
  const body = str(formData, "body");
  if (!customerId || !body) return;

  await prisma.customerNote.create({ data: { customerId, body } });

  revalidatePath(`/admin/customers/${customerId}`);
}

// ---------- Menu ----------

export async function createMenuItemAction(formData: FormData) {
  await requireAdmin();

  await prisma.menuItem.create({
    data: {
      name: str(formData, "name"),
      description: str(formData, "description"),
      durationMin: num(formData, "durationMin"),
      price: num(formData, "price"),
    },
  });

  revalidatePath("/admin/menu");
  revalidatePath("/mypage/menu");
}

export async function toggleMenuItemActiveAction(formData: FormData) {
  await requireAdmin();
  const id = str(formData, "id");
  const item = await prisma.menuItem.findUnique({ where: { id } });
  if (!item) return;
  await prisma.menuItem.update({
    where: { id },
    data: { isActive: !item.isActive },
  });
  revalidatePath("/admin/menu");
  revalidatePath("/mypage/menu");
}

export async function deleteMenuItemAction(formData: FormData) {
  await requireAdmin();
  const id = str(formData, "id");
  await prisma.menuItem.delete({ where: { id } }).catch(() => {});
  revalidatePath("/admin/menu");
  revalidatePath("/mypage/menu");
}

// ---------- Coupons ----------

export async function createCouponAction(formData: FormData) {
  await requireAdmin();

  const customerId = str(formData, "customerId");

  await prisma.coupon.create({
    data: {
      code: str(formData, "code").toUpperCase(),
      title: str(formData, "title"),
      description: str(formData, "description"),
      discountType: str(formData, "discountType") === "PERCENT" ? "PERCENT" : "AMOUNT",
      discountValue: num(formData, "discountValue"),
      validFrom: new Date(str(formData, "validFrom")),
      validTo: new Date(str(formData, "validTo")),
      customerId: customerId || null,
    },
  });

  revalidatePath("/admin/coupons");
  revalidatePath("/mypage/coupons");
}

export async function toggleCouponActiveAction(formData: FormData) {
  await requireAdmin();
  const id = str(formData, "id");
  const coupon = await prisma.coupon.findUnique({ where: { id } });
  if (!coupon) return;
  await prisma.coupon.update({
    where: { id },
    data: { isActive: !coupon.isActive },
  });
  revalidatePath("/admin/coupons");
  revalidatePath("/mypage/coupons");
}

export async function deleteCouponAction(formData: FormData) {
  await requireAdmin();
  const id = str(formData, "id");
  await prisma.coupon.delete({ where: { id } }).catch(() => {});
  revalidatePath("/admin/coupons");
  revalidatePath("/mypage/coupons");
}

// ---------- Reviews ----------

export async function replyReviewAction(formData: FormData) {
  await requireAdmin();
  const id = str(formData, "id");
  const reply = str(formData, "reply");
  if (!id || !reply) return;

  await prisma.review.update({
    where: { id },
    data: { reply, repliedAt: new Date() },
  });

  revalidatePath("/admin/reviews");
  revalidatePath("/mypage/reviews");
}

export async function toggleReviewPublishedAction(formData: FormData) {
  await requireAdmin();
  const id = str(formData, "id");
  const review = await prisma.review.findUnique({ where: { id } });
  if (!review) return;
  await prisma.review.update({
    where: { id },
    data: { isPublished: !review.isPublished },
  });
  revalidatePath("/admin/reviews");
  revalidatePath("/mypage/reviews");
}

// ---------- Messages ----------

export async function sendAdminMessageAction(formData: FormData) {
  await requireAdmin();
  const customerId = str(formData, "customerId");
  const body = str(formData, "body");
  if (!customerId || !body) return;

  await prisma.message.create({
    data: { customerId, sender: "ADMIN", body, readByAdmin: true },
  });

  revalidatePath("/admin/messages");
  revalidatePath(`/admin/customers/${customerId}`);
  revalidatePath("/mypage/messages");
}

export async function sendBroadcastMessageAction(formData: FormData) {
  await requireAdmin();
  const body = str(formData, "body");
  if (!body) return;

  const customers = await prisma.customer.findMany({ select: { id: true } });
  if (customers.length === 0) return;

  await prisma.message.createMany({
    data: customers.map((c) => ({
      customerId: c.id,
      sender: "ADMIN" as const,
      body,
      readByAdmin: true,
    })),
  });

  revalidatePath("/admin/messages");
  revalidatePath("/mypage/messages");
}

export async function markMessagesReadByAdminAction(customerId: string) {
  await requireAdmin();
  await prisma.message.updateMany({
    where: { customerId, sender: "CUSTOMER", readByAdmin: false },
    data: { readByAdmin: true },
  });
}

// ---------- Billing ----------

export async function createInvoiceAction(formData: FormData) {
  await requireAdmin();

  const customerId = str(formData, "customerId");
  const itemName = str(formData, "itemName");
  const itemPrice = num(formData, "itemPrice");
  const quantity = num(formData, "quantity") || 1;
  if (!customerId || !itemName || !itemPrice) return;

  const dueAtRaw = str(formData, "dueAt");

  await prisma.invoice.create({
    data: {
      customerId,
      title: str(formData, "title") || itemName,
      discount: num(formData, "discount") || 0,
      dueAt: dueAtRaw ? new Date(dueAtRaw) : null,
      note: str(formData, "note") || null,
      items: {
        create: [{ name: itemName, price: itemPrice, quantity }],
      },
    },
  });

  revalidatePath("/admin/billing");
  revalidatePath(`/admin/customers/${customerId}`);
  revalidatePath("/mypage/billing");
}

export async function updateInvoiceStatusAction(formData: FormData) {
  await requireAdmin();
  const id = str(formData, "id");
  const status = str(formData, "status");
  if (!id || !["UNPAID", "PAID", "CANCELED"].includes(status)) return;

  await prisma.invoice.update({
    where: { id },
    data: {
      status: status as InvoiceStatus,
      paidAt: status === "PAID" ? new Date() : null,
    },
  });

  revalidatePath("/admin/billing");
  revalidatePath("/mypage/billing");
}

export async function deleteInvoiceAction(formData: FormData) {
  await requireAdmin();
  const id = str(formData, "id");
  await prisma.invoice.delete({ where: { id } }).catch(() => {});
  revalidatePath("/admin/billing");
  revalidatePath("/mypage/billing");
}

// ---------- Treatment history ----------

export async function createHistoryAction(formData: FormData) {
  await requireAdmin();

  const customerId = str(formData, "customerId");
  const dateRaw = str(formData, "date");
  if (!customerId || !dateRaw) return;

  const menuItemId = str(formData, "menuItemId") || null;
  let durationMin = num(formData, "durationMin");
  let price = num(formData, "price");

  if (menuItemId && (!durationMin || !price)) {
    const menuItem = await prisma.menuItem.findUnique({ where: { id: menuItemId } });
    if (menuItem) {
      durationMin = durationMin || menuItem.durationMin;
      price = price || menuItem.price;
    }
  }

  await prisma.treatmentHistory.create({
    data: {
      customerId,
      menuItemId,
      date: new Date(dateRaw),
      durationMin,
      price,
      note: str(formData, "note") || null,
    },
  });

  revalidatePath("/admin/history");
  revalidatePath(`/admin/customers/${customerId}`);
  revalidatePath("/mypage/history");
}

export async function deleteHistoryAction(formData: FormData) {
  await requireAdmin();
  const id = str(formData, "id");
  await prisma.treatmentHistory.delete({ where: { id } }).catch(() => {});
  revalidatePath("/admin/history");
  revalidatePath("/mypage/history");
}
