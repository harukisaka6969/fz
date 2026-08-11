import { requireCustomer } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Card, EmptyState, InvoiceStatusBadge, PageHeader } from "@/components/ui";
import { formatDate, formatYen } from "@/lib/format";

export default async function MypageBillingPage() {
  const customer = await requireCustomer();

  const invoices = await prisma.invoice.findMany({
    where: { customerId: customer.id },
    orderBy: { issuedAt: "desc" },
    include: { items: true },
  });

  return (
    <div className="space-y-6">
      <PageHeader title="請求" description="ご請求内容とお支払い状況をご確認いただけます。" />

      {invoices.length === 0 ? (
        <EmptyState>現在請求はありません。</EmptyState>
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
                      発行日: {formatDate(inv.issuedAt)}
                      {inv.dueAt && ` ・ 支払期限: ${formatDate(inv.dueAt)}`}
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
                    {inv.note && <p className="mt-1 text-xs text-brand-500">{inv.note}</p>}
                    <p className="mt-1 text-base font-bold text-brand-900">
                      合計 {formatYen(total)}
                    </p>
                  </div>
                  <InvoiceStatusBadge status={inv.status} />
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
