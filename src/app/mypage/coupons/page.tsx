import { requireCustomer } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Card, EmptyState, PageHeader } from "@/components/ui";
import { formatDate } from "@/lib/format";

export default async function MypageCouponsPage() {
  const customer = await requireCustomer();

  const coupons = await prisma.coupon.findMany({
    where: {
      isActive: true,
      validTo: { gte: new Date() },
      OR: [{ customerId: null }, { customerId: customer.id }],
    },
    orderBy: { validTo: "asc" },
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="割引クーポン"
        description="ご利用可能なクーポンです。ご予約時にコードをお伝えください。"
      />

      {coupons.length === 0 ? (
        <EmptyState>現在ご利用いただけるクーポンはありません。</EmptyState>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {coupons.map((coupon) => (
            <Card
              key={coupon.id}
              className="border-2 border-dashed border-brand-300 bg-brand-50"
            >
              {coupon.customerId && (
                <span className="mb-2 inline-block rounded-full bg-brand-600 px-2 py-0.5 text-[10px] font-bold text-white">
                  あなた限定
                </span>
              )}
              <p className="font-semibold text-brand-900">{coupon.title}</p>
              <p className="mt-1 text-sm text-brand-600">{coupon.description}</p>
              <p className="mt-2 text-lg font-bold text-brand-700">
                {coupon.discountType === "PERCENT"
                  ? `${coupon.discountValue}% OFF`
                  : `${coupon.discountValue}円 OFF`}
              </p>
              <p className="mt-1 font-mono text-sm tracking-widest text-brand-800">
                {coupon.code}
              </p>
              <p className="mt-2 text-xs text-brand-500">
                有効期限: {formatDate(coupon.validTo)}
              </p>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
