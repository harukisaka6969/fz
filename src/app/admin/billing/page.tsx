import Link from "next/link";
import { prisma } from "@/lib/prisma";
import {
  createInvoiceAction,
  deleteInvoiceAction,
  updateInvoiceStatusAction,
} from "@/lib/actions/admin-actions";
import { Card, EmptyState, InvoiceStatusBadge, PageHeader, SubmitButton } from "@/components/ui";
import { formatDate, formatYen } from "@/lib/format";

export default async function AdminBillingPage({
  searchParams,
}: {
  searchParams: Promise<{ customer?: string }>;
}) {
  const { customer: customerId } = await searchParams;

  const [invoices, customers, menuItems] = await Promise.all([
    prisma.invoice.findMany({
      where: customerId ? { customerId } : undefined,
      orderBy: { issuedAt: "desc" },
      include: { customer: true, items: true },
    }),
    prisma.customer.findMany({ orderBy: { name: "asc" } }),
    prisma.menuItem.findMany({ where: { isActive: true }, orderBy: { sortOrder: "asc" } }),
  ]);

  const filteredCustomer = customerId
    ? customers.find((c) => c.id === customerId)
    : null;

  return (
    <div className="space-y-6">
      <PageHeader
        title="請求管理"
        description="お客様への請求を作成し、支払い状況を管理します。"
      />

      <div className="flex flex-wrap items-center gap-2 text-sm">
        <Link
          href="/admin/billing"
          className={`rounded-full px-3 py-1 font-semibold ${
            !customerId ? "bg-brand-600 text-white" : "bg-white text-brand-700 border border-brand-200"
          }`}
        >
          全顧客
        </Link>
        {filteredCustomer && (
          <span className="rounded-full bg-brand-100 px-3 py-1 font-semibold text-brand-700">
            {filteredCustomer.name} 様の請求のみ表示中
          </span>
        )}
      </div>

      {invoices.length === 0 ? (
        <EmptyState>まだ請求がありません。</EmptyState>
      ) : (
        <div className="space-y-3">
          {invoices.map((inv) => {
            const subtotal = inv.items.reduce((sum, i) => sum + i.price * i.quantity, 0);
            const total = Math.max(0, subtotal - inv.discount);
            return (
              <Card key={inv.id}>
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="font-semibold text-brand-900">{inv.title}</p>
                    <p className="text-xs text-brand-500">
                      {inv.customer.name} 様 ・ {formatDate(inv.issuedAt)}
                      {inv.dueAt && ` ・ 支払期限 ${formatDate(inv.dueAt)}`}
                    </p>
                    <ul className="mt-2 space-y-0.5 text-sm text-brand-700">
                      {inv.items.map((item) => (
                        <li key={item.id}>
                          {item.name} × {item.quantity} = {formatYen(item.price * item.quantity)}
                        </li>
                      ))}
                    </ul>
                    {inv.discount > 0 && (
                      <p className="text-sm text-brand-500">
                        割引: -{formatYen(inv.discount)}
                      </p>
                    )}
                    <p className="mt-1 text-base font-bold text-brand-900">
                      合計 {formatYen(total)}
                    </p>
                  </div>
                  <div className="flex shrink-0 flex-col items-end gap-2">
                    <InvoiceStatusBadge status={inv.status} />
                    <form action={updateInvoiceStatusAction} className="flex items-center gap-1">
                      <input type="hidden" name="id" value={inv.id} />
                      <select
                        name="status"
                        defaultValue={inv.status}
                        className="rounded-lg border border-brand-200 bg-white px-2 py-1 text-xs"
                      >
                        <option value="UNPAID">未払い</option>
                        <option value="PAID">支払済み</option>
                        <option value="CANCELED">キャンセル</option>
                      </select>
                      <button
                        type="submit"
                        className="rounded-full border border-brand-200 px-2 py-1 text-xs font-semibold text-brand-700 hover:bg-brand-100"
                      >
                        更新
                      </button>
                    </form>
                    <form action={deleteInvoiceAction}>
                      <input type="hidden" name="id" value={inv.id} />
                      <button
                        type="submit"
                        className="rounded-full border border-red-200 px-2 py-1 text-xs font-semibold text-red-600 hover:bg-red-50"
                      >
                        削除
                      </button>
                    </form>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      <Card>
        <h2 className="mb-4 text-sm font-bold text-brand-900">新しい請求を作成</h2>
        <form action={createInvoiceAction} className="grid gap-3 sm:grid-cols-2">
          <label className="block text-sm">
            <span className="text-brand-700">対象顧客</span>
            <select
              name="customerId"
              required
              defaultValue={customerId ?? ""}
              className="mt-1 w-full rounded-lg border border-brand-200 bg-white px-3 py-2 text-sm shadow-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-200"
            >
              <option value="" disabled>
                選択してください
              </option>
              {customers.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </label>
          <label className="block text-sm">
            <span className="text-brand-700">タイトル</span>
            <input
              name="title"
              placeholder="例: 8月分ご利用料金"
              className="mt-1 w-full rounded-lg border border-brand-200 bg-white px-3 py-2 text-sm shadow-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-200"
            />
          </label>
          {menuItems.length > 0 && (
            <p className="text-xs text-brand-500 sm:col-span-2">
              メニュー料金の目安:{" "}
              {menuItems.map((m) => `${m.name}（${formatYen(m.price)}）`).join(" / ")}
            </p>
          )}
          <label className="block text-sm">
            <span className="text-brand-700">項目名</span>
            <input
              name="itemName"
              required
              placeholder="例: スタンダードコース"
              className="mt-1 w-full rounded-lg border border-brand-200 bg-white px-3 py-2 text-sm shadow-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-200"
            />
          </label>
          <label className="block text-sm">
            <span className="text-brand-700">数量</span>
            <input
              name="quantity"
              type="number"
              defaultValue={1}
              min={1}
              className="mt-1 w-full rounded-lg border border-brand-200 bg-white px-3 py-2 text-sm shadow-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-200"
            />
          </label>
          <label className="block text-sm">
            <span className="text-brand-700">単価（円）</span>
            <input
              name="itemPrice"
              type="number"
              required
              className="mt-1 w-full rounded-lg border border-brand-200 bg-white px-3 py-2 text-sm shadow-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-200"
            />
          </label>
          <label className="block text-sm">
            <span className="text-brand-700">割引（円）</span>
            <input
              name="discount"
              type="number"
              defaultValue={0}
              className="mt-1 w-full rounded-lg border border-brand-200 bg-white px-3 py-2 text-sm shadow-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-200"
            />
          </label>
          <label className="block text-sm">
            <span className="text-brand-700">支払期限</span>
            <input
              name="dueAt"
              type="date"
              className="mt-1 w-full rounded-lg border border-brand-200 bg-white px-3 py-2 text-sm shadow-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-200"
            />
          </label>
          <label className="block text-sm sm:col-span-2">
            <span className="text-brand-700">メモ</span>
            <input
              name="note"
              className="mt-1 w-full rounded-lg border border-brand-200 bg-white px-3 py-2 text-sm shadow-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-200"
            />
          </label>
          <div className="sm:col-span-2">
            <SubmitButton>請求を作成</SubmitButton>
          </div>
        </form>
      </Card>
    </div>
  );
}
