import { prisma } from "@/lib/prisma";
import { Card, EmptyState, PageHeader } from "@/components/ui";
import { formatYen } from "@/lib/format";

export default async function MypageMenuPage() {
  const items = await prisma.menuItem.findMany({
    where: { isActive: true },
    orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
  });

  return (
    <div className="space-y-6">
      <PageHeader title="施術メニュー" description="ご予約の際の参考にご覧ください。" />

      {items.length === 0 ? (
        <EmptyState>現在ご案内できるメニューがありません。</EmptyState>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {items.map((item) => (
            <Card key={item.id}>
              <p className="font-semibold text-brand-900">{item.name}</p>
              <p className="mt-1 text-sm text-brand-600">{item.description}</p>
              <p className="mt-3 flex items-center justify-between text-sm font-semibold text-brand-700">
                <span>{item.durationMin}分</span>
                <span>{formatYen(item.price)}</span>
              </p>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
