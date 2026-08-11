import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { createCustomerAction } from "@/lib/actions/admin-actions";
import { Card, EmptyState, PageHeader, SubmitButton } from "@/components/ui";

export default async function AdminDashboardPage() {
  const customers = await prisma.customer.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      _count: {
        select: { invoices: true, histories: true, reviews: true },
      },
      messages: {
        where: { sender: "CUSTOMER", readByAdmin: false },
        select: { id: true },
      },
      invoices: {
        where: { status: "UNPAID" },
        select: { id: true },
      },
    },
  });

  return (
    <div className="space-y-8">
      <PageHeader
        title="顧客一覧"
        description="お客様ごとの施術履歴・請求・メッセージはこちらから確認できます。"
      />

      {customers.length === 0 ? (
        <EmptyState>まだ登録された顧客がいません。</EmptyState>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {customers.map((customer) => (
            <Link key={customer.id} href={`/admin/customers/${customer.id}`}>
              <Card className="h-full transition hover:border-brand-300 hover:shadow-md">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-semibold text-brand-900">
                      {customer.name}
                    </p>
                    <p className="text-xs text-brand-500">
                      ID: {customer.loginId}
                    </p>
                  </div>
                  {customer.messages.length > 0 && (
                    <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-brand-600 px-1.5 text-[10px] font-bold text-white">
                      {customer.messages.length}
                    </span>
                  )}
                </div>
                <dl className="mt-3 grid grid-cols-3 gap-2 text-center text-xs text-brand-600">
                  <div className="rounded-lg bg-brand-50 py-2">
                    <dt className="text-brand-400">施術回数</dt>
                    <dd className="font-semibold text-brand-800">
                      {customer._count.histories}
                    </dd>
                  </div>
                  <div className="rounded-lg bg-brand-50 py-2">
                    <dt className="text-brand-400">未払い</dt>
                    <dd className="font-semibold text-brand-800">
                      {customer.invoices.length}
                    </dd>
                  </div>
                  <div className="rounded-lg bg-brand-50 py-2">
                    <dt className="text-brand-400">レビュー</dt>
                    <dd className="font-semibold text-brand-800">
                      {customer._count.reviews}
                    </dd>
                  </div>
                </dl>
              </Card>
            </Link>
          ))}
        </div>
      )}

      <Card>
        <h2 className="mb-4 text-sm font-bold text-brand-900">新規顧客登録</h2>
        <form action={createCustomerAction} className="grid gap-3 sm:grid-cols-2">
          <Field label="お名前" name="name" required />
          <Field label="ログインID" name="loginId" required />
          <Field label="初期パスワード" name="password" required />
          <Field label="電話番号" name="phone" />
          <Field label="メールアドレス" name="email" type="email" />
          <Field label="メモ（管理者のみ閲覧）" name="adminNote" />
          <div className="sm:col-span-2">
            <SubmitButton>登録する</SubmitButton>
          </div>
        </form>
      </Card>
    </div>
  );
}

function Field({
  label,
  name,
  type = "text",
  required = false,
}: {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
}) {
  return (
    <label className="block text-sm">
      <span className="text-brand-700">{label}</span>
      <input
        name={name}
        type={type}
        required={required}
        className="mt-1 w-full rounded-lg border border-brand-200 bg-white px-3 py-2 text-sm shadow-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-200"
      />
    </label>
  );
}
