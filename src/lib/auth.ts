import { redirect } from "next/navigation";
import { getSession } from "./session";
import { prisma } from "./prisma";

export async function requireAdmin() {
  const session = await getSession();
  if (!session || session.role !== "admin") {
    redirect("/login/admin");
  }
  const admin = await prisma.admin.findUnique({ where: { id: session.id } });
  if (!admin) {
    redirect("/login/admin");
  }
  return admin;
}

export async function requireCustomer() {
  const session = await getSession();
  if (!session || session.role !== "customer") {
    redirect("/login/customer");
  }
  const customer = await prisma.customer.findUnique({
    where: { id: session.id },
  });
  if (!customer) {
    redirect("/login/customer");
  }
  return customer;
}

export async function requireTherapist() {
  const session = await getSession();
  if (!session || session.role !== "therapist") {
    redirect("/login/therapist");
  }
  const therapist = await prisma.therapist.findUnique({
    where: { id: session.id },
  });
  if (!therapist) {
    redirect("/login/therapist");
  }
  return therapist;
}

export async function getCurrentSession() {
  return getSession();
}
