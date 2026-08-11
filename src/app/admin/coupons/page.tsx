import { prisma } from "@/lib/prisma";
import {
  createCouponAction,
  deleteCouponAction,
  toggleCouponActiveAction,
} from "@/lib/actions/admin-actions";
import { Card, EmptyState, PageHeader, SubmitButton } from "@/components/ui";
import { formatDate } from "@/lib/format";

export default async function AdminCouponsPage() {
  const [coupons, customers] = await Promise.all([
    prisma.coupon.findMany({
      orderBy: { createdAt: "desc" },
      include: { customer: true },
    }),
    prisma.customer.findMany({ orderBy: { name: "asc" } }),
  ]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="割引クーポン管理"
        description="全体向け、または特定のお客様向けのクーポンを発行します。"
      />

      {coupons.length === 0 ? (
        <EmptyState>まだクーポンがありません。</EmptyState>
      ) : (
        <div className="space-y-3">
          {coupons.map((coupon) => (
            <Card key={coupon.id} className={!coupon.isActive ? "opacity-50" : ""}>
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="font-semibold text-brand-900">
                    {coupon.title}{" "}
                    <span className="ml-1 rounded bg-brand-100 px-1.5 py-0.5 font-mono text-xs text-brand-700">
                      {coupon.code}
                    </span>
                  </p>
                  <p className="mt-1 text-sm text-brand-600">{coupon.description}</p>
                  <p className="mt-2 text-sm font-semibold text-brand-700">
                    {coupon.discountType === "PERCENT"
                      ? `${coupon.discountValue}% OFF`
                      : `${coupon.discountValue}円 OFF`}
                    <span className="ml-2 font-normal text-brand-400">
                      {formatDate(coupon.validFrom)}〜{formatDate(coupon.validTo)}
                    </span>
                  </p>
                  <p className="mt-1 text-xs text-brand-500">
                    対象: {coupon.customer ? `${coupon.customer.name} 様限定` : "全顧客"}
                  </p>
                </div>
                <div className="flex shrink-0 gap-2">
                  <form action={toggleCouponActiveAction}>
                    <input type="hidden" name="id" value={coupon.id} />
                    <button
                      type="submit"
                      className="rounded-full border border-brand-200 px-3 py-1 text-xs font-semibold text-brand-700 hover:bg-brand-100"
                    >
                      {coupon.isActive ? "停止" : "再開"}
                    </button>
                  </form>
                  <form action={deleteCouponAction}>
                    <input type="hidden" name="id" value={coupon.id} />
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
        <h2 className="mb-4 text-sm font-bold text-brand-900">新しいクーポンを発行</h2>
        <form action={createCouponAction} className="grid gap-3 sm:grid-cols-2">
          <label className="block text-sm">
            <span className="text-brand-700">クーポンコード</span>
            <input
              name="code"
              required
              className="mt-1 w-full rounded-lg border border-brand-200 bg-white px-3 py-2 text-sm shadow-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-200"
            />
          </label>
          <label className="block text-sm">
            <span className="text-brand-700">タイトル</span>
            <input
              name="title"
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
            <span className="text-brand-700">割引タイプ</span>
            <select
              name="discountType"
              className="mt-1 w-full rounded-lg border border-brand-200 bg-white px-3 py-2 text-sm shadow-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-200"
            >
              <option value="AMOUNT">金額（円）</option>
              <option value="PERCENT">割合（%）</option>
            </select>
          </label>
          <label className="block text-sm">
            <span className="text-brand-700">割引値</span>
            <input
              name="discountValue"
              type="number"
              required
              className="mt-1 w-full rounded-lg border border-brand-200 bg-white px-3 py-2 text-sm shadow-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-200"
            />
          </label>
          <label className="block text-sm">
            <span className="text-brand-700">開始日</span>
            <input
              name="validFrom"
              type="date"
              required
              className="mt-1 w-full rounded-lg border border-brand-200 bg-white px-3 py-2 text-sm shadow-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-200"
            />
          </label>
          <label className="block text-sm">
            <span className="text-brand-700">終了日</span>
            <input
              name="validTo"
              type="date"
              required
              className="mt-1 w-full rounded-lg border border-brand-200 bg-white px-3 py-2 text-sm shadow-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-200"
            />
          </label>
          <label className="block text-sm sm:col-span-2">
            <span className="text-brand-700">対象顧客（未選択で全顧客向け）</span>
            <select
              name="customerId"
              className="mt-1 w-full rounded-lg border border-brand-200 bg-white px-3 py-2 text-sm shadow-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-200"
            >
              <option value="">全顧客</option>
              {customers.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </label>
          <div className="sm:col-span-2">
            <SubmitButton>発行する</SubmitButton>
          </div>
        </form>
      </Card>
    </div>
  );
}
