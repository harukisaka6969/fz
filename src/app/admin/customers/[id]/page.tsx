import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { updateCustomerNoteAction } from "@/lib/actions/admin-actions";
import {
  Card,
  EmptyState,
  InvoiceStatusBadge,
  PageHeader,
  StarRating,
  SubmitButton,
} from "@/components/ui";
import { formatDate, formatYen } from "@/lib/format";

export default async function AdminCustomerDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const customer = await prisma.customer.findUnique({
    where: { id },
    include: {
      histories: {
        orderBy: { date: "desc" },
        take: 5,
        include: { menuItem: true },
      },
      invoices: {
        orderBy: { issuedAt: "desc" },
        take: 5,
        include: { items: true },
      },
      reviews: { orderBy: { createdAt: "desc" }, take: 3 },
      messages: { orderBy: { createdAt: "desc" }, take: 3 },
    },
  });

  if (!customer) notFound();

  return (
    <div className="space-y-6">
      <PageHeader title={`${customer.name} さんの詳細`} />

      <div className="grid gap-3 sm:grid-cols-3">
        <InfoRow label="ログインID" value={customer.loginId} />
        <InfoRow label="電話番号" value={customer.phone ?? "-"} />
        <InfoRow label="メール" value={customer.email ?? "-"} />
      </div>

      <div className="flex flex-wrap gap-2">
        <Link
          href={`/admin/history?customer=${customer.id}`}
          className="rounded-full border border-brand-200 bg-white px-4 py-1.5 text-xs font-semibold text-brand-700 hover:bg-brand-100"
        >
          この方の施術履歴を見る
        </Link>
        <Link
          href={`/admin/billing?customer=${customer.id}`}
          className="rounded-full border border-brand-200 bg-white px-4 py-1.5 text-xs font-semibold text-brand-700 hover:bg-brand-100"
        >
          この方の請求を見る
        </Link>
        <Link
          href={`/admin/customers/${customer.id}/messages`}
          className="rounded-full border border-brand-200 bg-white px-4 py-1.5 text-xs font-semibold text-brand-700 hover:bg-brand-100"
        >
          この方とのメッセージ
        </Link>
      </div>

      <Card>
        <h2 className="mb-3 text-sm font-bold text-brand-900">
          管理者メモ（お客様には表示されません）
        </h2>
        <form action={updateCustomerNoteAction} className="space-y-3">
          <input type="hidden" name="customerId" value={customer.id} />
          <textarea
            name="adminNote"
            defaultValue={customer.adminNote ?? ""}
            rows={3}
            className="w-full rounded-lg border border-brand-200 bg-white px-3 py-2 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-200"
          />
          <SubmitButton>メモを保存</SubmitButton>
        </form>
      </Card>

      <Card>
        <h2 className="mb-3 text-sm font-bold text-brand-900">直近の施術履歴</h2>
        {customer.histories.length === 0 ? (
          <EmptyState>まだ施術履歴がありません。</EmptyState>
        ) : (
          <ul className="space-y-2">
            {customer.histories.map((h) => (
              <li
                key={h.id}
                className="flex items-center justify-between rounded-lg bg-brand-50 px-3 py-2 text-sm"
              >
                <span className="text-brand-800">
                  {formatDate(h.date)} ・ {h.menuItem?.name ?? "施術"}
                </span>
                <span className="font-semibold text-brand-700">
                  {formatYen(h.price)}
                </span>
              </li>
            ))}
          </ul>
        )}
      </Card>

      <Card>
        <h2 className="mb-3 text-sm font-bold text-brand-900">直近の請求</h2>
        {customer.invoices.length === 0 ? (
          <EmptyState>まだ請求がありません。</EmptyState>
        ) : (
          <ul className="space-y-2">
            {customer.invoices.map((inv) => (
              <li
                key={inv.id}
                className="flex items-center justify-between rounded-lg bg-brand-50 px-3 py-2 text-sm"
              >
                <span className="text-brand-800">{inv.title}</span>
                <span className="flex items-center gap-2">
                  <InvoiceStatusBadge status={inv.status} />
                  <span className="font-semibold text-brand-700">
                    {formatYen(
                      inv.items.reduce(
                        (sum, i) => sum + i.price * i.quantity,
                        0
                      ) - inv.discount
                    )}
                  </span>
                </span>
              </li>
            ))}
          </ul>
        )}
      </Card>

      <Card>
        <h2 className="mb-3 text-sm font-bold text-brand-900">レビュー</h2>
        {customer.reviews.length === 0 ? (
          <EmptyState>まだレビューがありません。</EmptyState>
        ) : (
          <ul className="space-y-2">
            {customer.reviews.map((r) => (
              <li key={r.id} className="rounded-lg bg-brand-50 px-3 py-2 text-sm">
                <StarRating rating={r.rating} /> {r.comment}
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-brand-100 bg-white px-4 py-3">
      <p className="text-xs text-brand-400">{label}</p>
      <p className="text-sm font-semibold text-brand-900">{value}</p>
    </div>
  );
}
