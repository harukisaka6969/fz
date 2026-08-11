import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { createHistoryAction, deleteHistoryAction } from "@/lib/actions/admin-actions";
import { Card, EmptyState, PageHeader, SubmitButton } from "@/components/ui";
import { formatDate, formatYen } from "@/lib/format";

export default async function AdminHistoryPage({
  searchParams,
}: {
  searchParams: Promise<{ customer?: string }>;
}) {
  const { customer: customerId } = await searchParams;

  const [histories, customers, menuItems] = await Promise.all([
    prisma.treatmentHistory.findMany({
      where: customerId ? { customerId } : undefined,
      orderBy: { date: "desc" },
      include: { customer: true, menuItem: true },
    }),
    prisma.customer.findMany({ orderBy: { name: "asc" } }),
    prisma.menuItem.findMany({ orderBy: { sortOrder: "asc" } }),
  ]);

  const filteredCustomer = customerId
    ? customers.find((c) => c.id === customerId)
    : null;

  return (
    <div className="space-y-6">
      <PageHeader
        title="施術履歴管理"
        description="お客様ごとの施術内容を記録します。"
      />

      <div className="flex flex-wrap items-center gap-2 text-sm">
        <Link
          href="/admin/history"
          className={`rounded-full px-3 py-1 font-semibold ${
            !customerId ? "bg-brand-600 text-white" : "bg-white text-brand-700 border border-brand-200"
          }`}
        >
          全顧客
        </Link>
        {filteredCustomer && (
          <span className="rounded-full bg-brand-100 px-3 py-1 font-semibold text-brand-700">
            {filteredCustomer.name} 様の履歴のみ表示中
          </span>
        )}
      </div>

      {histories.length === 0 ? (
        <EmptyState>まだ施術履歴がありません。</EmptyState>
      ) : (
        <div className="space-y-2">
          {histories.map((h) => (
            <Card key={h.id} className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-semibold text-brand-900">
                  {formatDate(h.date)} ・ {h.customer.name} 様
                </p>
                <p className="text-sm text-brand-600">
                  {h.menuItem?.name ?? "施術"} ・ {h.durationMin}分 ・ {formatYen(h.price)}
                </p>
                {h.note && <p className="mt-1 text-xs text-brand-500">{h.note}</p>}
              </div>
              <form action={deleteHistoryAction}>
                <input type="hidden" name="id" value={h.id} />
                <button
                  type="submit"
                  className="shrink-0 rounded-full border border-red-200 px-3 py-1 text-xs font-semibold text-red-600 hover:bg-red-50"
                >
                  削除
                </button>
              </form>
            </Card>
          ))}
        </div>
      )}

      <Card>
        <h2 className="mb-4 text-sm font-bold text-brand-900">施術記録を追加</h2>
        <form action={createHistoryAction} className="grid gap-3 sm:grid-cols-2">
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
            <span className="text-brand-700">施術日時</span>
            <input
              name="date"
              type="datetime-local"
              required
              className="mt-1 w-full rounded-lg border border-brand-200 bg-white px-3 py-2 text-sm shadow-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-200"
            />
          </label>
          <label className="block text-sm">
            <span className="text-brand-700">メニュー（任意）</span>
            <select
              name="menuItemId"
              defaultValue=""
              className="mt-1 w-full rounded-lg border border-brand-200 bg-white px-3 py-2 text-sm shadow-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-200"
            >
              <option value="">選択なし</option>
              {menuItems.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name}
                </option>
              ))}
            </select>
          </label>
          <div />
          <label className="block text-sm">
            <span className="text-brand-700">施術時間（分・任意）</span>
            <input
              name="durationMin"
              type="number"
              placeholder="メニュー選択時は自動設定"
              className="mt-1 w-full rounded-lg border border-brand-200 bg-white px-3 py-2 text-sm shadow-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-200"
            />
          </label>
          <label className="block text-sm">
            <span className="text-brand-700">料金（円・任意）</span>
            <input
              name="price"
              type="number"
              placeholder="メニュー選択時は自動設定"
              className="mt-1 w-full rounded-lg border border-brand-200 bg-white px-3 py-2 text-sm shadow-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-200"
            />
          </label>
          <label className="block text-sm sm:col-span-2">
            <span className="text-brand-700">施術メモ</span>
            <textarea
              name="note"
              rows={2}
              className="mt-1 w-full rounded-lg border border-brand-200 bg-white px-3 py-2 text-sm shadow-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-200"
            />
          </label>
          <div className="sm:col-span-2">
            <SubmitButton>記録を追加</SubmitButton>
          </div>
        </form>
      </Card>
    </div>
  );
}
