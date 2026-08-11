import { prisma } from "@/lib/prisma";
import {
  createMenuItemAction,
  deleteMenuItemAction,
  toggleMenuItemActiveAction,
} from "@/lib/actions/admin-actions";
import { Card, EmptyState, PageHeader, SubmitButton } from "@/components/ui";
import { formatYen } from "@/lib/format";

export default async function AdminMenuPage() {
  const items = await prisma.menuItem.findMany({
    orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="施術メニュー管理"
        description="お客様ページに表示するコース内容と料金を管理します。"
      />

      {items.length === 0 ? (
        <EmptyState>まだメニューが登録されていません。</EmptyState>
      ) : (
        <div className="space-y-3">
          {items.map((item) => (
            <Card key={item.id} className={!item.isActive ? "opacity-50" : ""}>
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="font-semibold text-brand-900">
                    {item.name}
                    {!item.isActive && (
                      <span className="ml-2 text-xs font-normal text-brand-400">
                        （非表示）
                      </span>
                    )}
                  </p>
                  <p className="mt-1 text-sm text-brand-600">{item.description}</p>
                  <p className="mt-2 text-sm font-semibold text-brand-700">
                    {item.durationMin}分 ・ {formatYen(item.price)}
                  </p>
                </div>
                <div className="flex shrink-0 gap-2">
                  <form action={toggleMenuItemActiveAction}>
                    <input type="hidden" name="id" value={item.id} />
                    <button
                      type="submit"
                      className="rounded-full border border-brand-200 px-3 py-1 text-xs font-semibold text-brand-700 hover:bg-brand-100"
                    >
                      {item.isActive ? "非表示にする" : "表示する"}
                    </button>
                  </form>
                  <form action={deleteMenuItemAction}>
                    <input type="hidden" name="id" value={item.id} />
                    <button
                      type="submit"
                      className="rounded-full border border-red-200 px-3 py-1 text-xs font-semibold text-red-600 hover:bg-red-50"
                    >
                      削除
                    </button>
                  </form>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      <Card>
        <h2 className="mb-4 text-sm font-bold text-brand-900">新しいメニューを追加</h2>
        <form action={createMenuItemAction} className="grid gap-3 sm:grid-cols-2">
          <label className="block text-sm sm:col-span-2">
            <span className="text-brand-700">メニュー名</span>
            <input
              name="name"
              required
              className="mt-1 w-full rounded-lg border border-brand-200 bg-white px-3 py-2 text-sm shadow-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-200"
            />
          </label>
          <label className="block text-sm sm:col-span-2">
            <span className="text-brand-700">説明</span>
            <textarea
              name="description"
              rows={2}
              className="mt-1 w-full rounded-lg border border-brand-200 bg-white px-3 py-2 text-sm shadow-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-200"
            />
          </label>
          <label className="block text-sm">
            <span className="text-brand-700">施術時間（分）</span>
            <input
              name="durationMin"
              type="number"
              required
              className="mt-1 w-full rounded-lg border border-brand-200 bg-white px-3 py-2 text-sm shadow-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-200"
            />
          </label>
          <label className="block text-sm">
            <span className="text-brand-700">料金（円）</span>
            <input
              name="price"
              type="number"
              required
              className="mt-1 w-full rounded-lg border border-brand-200 bg-white px-3 py-2 text-sm shadow-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-200"
            />
          </label>
          <div className="sm:col-span-2">
            <SubmitButton>追加する</SubmitButton>
          </div>
        </form>
      </Card>
    </div>
  );
}
