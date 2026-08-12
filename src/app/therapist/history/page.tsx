import { requireTherapist } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createOwnCustomerNoteAction } from "@/lib/actions/therapist-actions";
import { Card, EmptyState, PageHeader, SubmitButton } from "@/components/ui";
import { formatDate, formatYen } from "@/lib/format";

export default async function TherapistHistoryPage() {
  const therapist = await requireTherapist();
  const now = new Date();

  const pastBookings = await prisma.booking.findMany({
    where: { therapistId: therapist.id, status: "CONFIRMED", startAt: { lt: now } },
    orderBy: { startAt: "desc" },
    include: { customer: true, menuItem: true },
  });

  const customerIds = [...new Set(pastBookings.map((b) => b.customerId))];
  const notes = await prisma.customerNote.findMany({
    where: { therapistId: therapist.id, customerId: { in: customerIds } },
    orderBy: { createdAt: "desc" },
  });

  const pastCustomers = customerIds.map((customerId) => {
    const customerBookings = pastBookings.filter((b) => b.customerId === customerId);
    return {
      customer: customerBookings[0].customer,
      bookings: customerBookings,
      notes: notes.filter((n) => n.customerId === customerId),
    };
  });

  const totalRevenue = pastBookings.reduce((sum, b) => sum + (b.menuItem?.price ?? 0), 0);
  const totalMinutes = pastBookings.reduce(
    (sum, b) => sum + (b.endAt.getTime() - b.startAt.getTime()) / 60000,
    0
  );
  const totalHours = totalMinutes / 60;

  return (
    <div className="space-y-6">
      <PageHeader title="施術履歴" description="これまでに施術済みのお客様と実績を確認できます。" />

      <div className="grid gap-3 sm:grid-cols-3">
        <Card>
          <p className="text-xs text-brand-400">施術回数</p>
          <p className="mt-1 text-2xl font-bold text-brand-900">{pastBookings.length}回</p>
        </Card>
        <Card>
          <p className="text-xs text-brand-400">合計売上</p>
          <p className="mt-1 text-2xl font-bold text-brand-900">{formatYen(totalRevenue)}</p>
        </Card>
        <Card>
          <p className="text-xs text-brand-400">合計稼働時間</p>
          <p className="mt-1 text-2xl font-bold text-brand-900">
            {totalHours.toLocaleString("ja-JP", { maximumFractionDigits: 1 })}時間
          </p>
        </Card>
      </div>

      <Card>
        <h2 className="mb-1 text-sm font-bold text-brand-900">施術済みのお客様・メモ</h2>
        <p className="mb-3 text-xs text-brand-500">
          このメモはあなただけに表示され、お客様や他のセラピストには共有されません。
        </p>
        {pastCustomers.length === 0 ? (
          <EmptyState>まだ施術済みのお客様がいません。</EmptyState>
        ) : (
          <div className="space-y-4">
            {pastCustomers.map(({ customer, bookings: customerBookings, notes: customerNotes }) => {
              const customerRevenue = customerBookings.reduce(
                (sum, b) => sum + (b.menuItem?.price ?? 0),
                0
              );
              return (
                <div key={customer.id} className="rounded-xl border border-brand-100 p-4">
                  <div className="flex items-baseline justify-between">
                    <p className="font-semibold text-brand-900">{customer.name} 様</p>
                    <p className="text-xs text-brand-500">
                      {customerBookings.length}回 ・ 累計 {formatYen(customerRevenue)}
                    </p>
                  </div>
                  <ul className="mt-1 space-y-0.5 text-xs text-brand-500">
                    {customerBookings.map((b) => (
                      <li key={b.id}>
                        {formatDate(b.startAt)} ・ {b.menuItem?.name ?? "施術"} ・{" "}
                        {formatYen(b.menuItem?.price ?? 0)}
                      </li>
                    ))}
                  </ul>

                  {customerNotes.length > 0 && (
                    <ul className="mt-3 space-y-2">
                      {customerNotes.map((note) => (
                        <li
                          key={note.id}
                          className="rounded-lg bg-brand-50 px-3 py-2 text-sm text-brand-800"
                        >
                          <p className="whitespace-pre-wrap">{note.body}</p>
                          <p className="mt-1 text-[10px] text-brand-400">
                            {formatDate(note.createdAt)}
                          </p>
                        </li>
                      ))}
                    </ul>
                  )}

                  <form action={createOwnCustomerNoteAction} className="mt-3 flex gap-2">
                    <input type="hidden" name="customerId" value={customer.id} />
                    <input
                      name="body"
                      required
                      placeholder="このお客様についてのメモを追加"
                      className="flex-1 rounded-lg border border-brand-200 bg-white px-3 py-2 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-200"
                    />
                    <SubmitButton className="shrink-0">追加</SubmitButton>
                  </form>
                </div>
              );
            })}
          </div>
        )}
      </Card>
    </div>
  );
}
