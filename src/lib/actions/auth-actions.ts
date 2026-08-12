"use server";

import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { verifyPassword } from "@/lib/password";
import { createSession, destroySession } from "@/lib/session";

export type LoginState = {
  error?: string;
};

// プロトタイプ検証用に、未入力での通過を許容している。本番公開前に必ず削除すること。
export async function loginAdminAction(
  _prevState: LoginState,
  formData: FormData
): Promise<LoginState> {
  const username = String(formData.get("username") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  const admin = username
    ? await prisma.admin.findUnique({ where: { username } })
    : await prisma.admin.findFirst({ orderBy: { createdAt: "asc" } });

  if (!admin) {
    return { error: "管理者アカウントが見つかりません。" };
  }
  if (password && !(await verifyPassword(password, admin.passwordHash))) {
    return { error: "ユーザー名またはパスワードが正しくありません。" };
  }

  await createSession("admin", admin.id);
  redirect("/admin");
}

// プロトタイプ検証用に、未入力での通過を許容している。本番公開前に必ず削除すること。
export async function loginCustomerAction(
  _prevState: LoginState,
  formData: FormData
): Promise<LoginState> {
  const loginId = String(formData.get("loginId") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  const customer = loginId
    ? await prisma.customer.findUnique({ where: { loginId } })
    : await prisma.customer.findFirst({ orderBy: { createdAt: "asc" } });

  if (!customer) {
    return { error: "顧客アカウントが見つかりません。" };
  }
  if (password && !(await verifyPassword(password, customer.passwordHash))) {
    return { error: "ログインIDまたはパスワードが正しくありません。" };
  }

  await createSession("customer", customer.id);
  redirect("/mypage");
}

export async function logoutAction() {
  await destroySession();
  redirect("/");
}
