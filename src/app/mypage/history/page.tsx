import { requireCustomer } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Card, EmptyState, PageHeader } from "@/components/ui";
import { formatDate, formatYen } from "@/lib/format";

export default async function MypageHistoryPage() {
  const customer = await requireCustomer();

  const histories = await prisma.treatmentHistory.findMany({
    where: { customerId: customer.id },
    orderBy: { date: "desc" },
    include: { menuItem: true },
  });

  return (
    <div className="space-y-6">
      <PageHeader title="施術履歴" description="これまでご利用いただいた施術の記録です。" />

      {histories.length === 0 ? (
        <EmptyState>まだ施術履歴がありません。</EmptyState>
      ) : (
        <div className="space-y-3">
          {histories.map((h) => (
            <Card key={h.id}>
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-semibold text-brand-900">
                    {formatDate(h.date)}
                  </p>
                  <p className="text-sm text-brand-600">
                    {h.menuItem?.name ?? "施術"} ・ {h.durationMin}分
                  </p>
                </div>
                <p className="font-semibold text-brand-700">{formatYen(h.price)}</p>
              </div>
              {h.note && (
                <p className="mt-2 rounded-lg bg-brand-50 px-3 py-2 text-sm text-brand-700">
                  {h.note}
                </p>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
