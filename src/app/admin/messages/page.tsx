import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Card, EmptyState, PageHeader } from "@/components/ui";
import { formatDateTime } from "@/lib/format";

export default async function AdminMessagesPage() {
  const customers = await prisma.customer.findMany({
    include: {
      messages: { orderBy: { createdAt: "desc" }, take: 1 },
    },
  });

  const unreadCounts = await prisma.message.groupBy({
    by: ["customerId"],
    where: { sender: "CUSTOMER", readByAdmin: false },
    _count: { id: true },
  });
  const unreadMap = new Map(unreadCounts.map((u) => [u.customerId, u._count.id]));

  const sorted = [...customers].sort((a, b) => {
    const at = a.messages[0]?.createdAt?.getTime() ?? 0;
    const bt = b.messages[0]?.createdAt?.getTime() ?? 0;
    return bt - at;
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="メッセージ"
        description="お客様ごとのやり取りを確認・返信できます。"
      />

      {sorted.length === 0 ? (
        <EmptyState>まだ顧客が登録されていません。</EmptyState>
      ) : (
        <div className="space-y-2">
          {sorted.map((customer) => {
            const last = customer.messages[0];
            const unread = unreadMap.get(customer.id) ?? 0;
            return (
              <Link key={customer.id} href={`/admin/customers/${customer.id}/messages`}>
                <Card className="flex items-center justify-between gap-3 transition hover:border-brand-300 hover:shadow-md">
                  <div className="min-w-0">
                    <p className="font-semibold text-brand-900">{customer.name}</p>
                    <p className="truncate text-sm text-brand-500">
                      {last ? last.body : "まだメッセージはありません"}
                    </p>
                  </div>
                  <div className="flex shrink-0 flex-col items-end gap-1">
                    {last && (
                      <span className="text-[10px] text-brand-400">
                        {formatDateTime(last.createdAt)}
                      </span>
                    )}
                    {unread > 0 && (
                      <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-brand-600 px-1.5 text-[10px] font-bold text-white">
                        {unread}
                      </span>
                    )}
                  </div>
                </Card>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
