"use server";

import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { verifyPassword } from "@/lib/password";
import { createSession, destroySession } from "@/lib/session";

export type LoginState = {
  error?: string;
};

export async function loginAdminAction(
  _prevState: LoginState,
  formData: FormData
): Promise<LoginState> {
  const username = String(formData.get("username") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!username || !password) {
    return { error: "ユーザー名とパスワードを入力してください。" };
  }

  const admin = await prisma.admin.findUnique({ where: { username } });
  if (!admin || !(await verifyPassword(password, admin.passwordHash))) {
    return { error: "ユーザー名またはパスワードが正しくありません。" };
  }

  await createSession("admin", admin.id);
  redirect("/admin");
}

export async function loginCustomerAction(
  _prevState: LoginState,
  formData: FormData
): Promise<LoginState> {
  const loginId = String(formData.get("loginId") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!loginId || !password) {
    return { error: "ログインIDとパスワードを入力してください。" };
  }

  const customer = await prisma.customer.findUnique({ where: { loginId } });
  if (!customer || !(await verifyPassword(password, customer.passwordHash))) {
    return { error: "ログインIDまたはパスワードが正しくありません。" };
  }

  await createSession("customer", customer.id);
  redirect("/mypage");
}

export async function logoutAction() {
  await destroySession();
  redirect("/");
}
