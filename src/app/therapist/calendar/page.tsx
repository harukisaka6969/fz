import { requireTherapist } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  createAvailabilityRuleAction,
  deleteAvailabilityRuleAction,
  cancelOwnBookingAction,
  createOwnCustomerNoteAction,
} from "@/lib/actions/therapist-actions";
import { Card, EmptyState, PageHeader, SubmitButton } from "@/components/ui";
import { formatDate, formatDateTime } from "@/lib/format";
import WeeklyAvailabilityGrid from "./WeeklyAvailabilityGrid";

const DAY_LABELS = ["日", "月", "火", "水", "木", "金", "土"];

function ruleToHourKeys(rule: { dayOfWeek: number; startTime: string; endTime: string }): string[] {
  const startHour = Number(rule.startTime.split(":")[0]);
  const endHour = Number(rule.endTime.split(":")[0]);
  const keys: string[] = [];
  for (let h = startHour; h < endHour; h++) {
    keys.push(`${rule.dayOfWeek}-${h}`);
  }
  return keys;
}

export default async function TherapistCalendarPage() {
  const therapist = await requireTherapist();
  const now = new Date();

  const [rules, bookings, pastBookings] = await Promise.all([
    prisma.availabilityRule.findMany({
      where: { therapistId: therapist.id },
      orderBy: [{ dayOfWeek: "asc" }, { startTime: "asc" }],
    }),
    prisma.booking.findMany({
      where: { therapistId: therapist.id, status: "CONFIRMED", startAt: { gte: now } },
      orderBy: { startAt: "asc" },
      include: { customer: true, menuItem: true },
    }),
    prisma.booking.findMany({
      where: { therapistId: therapist.id, status: "CONFIRMED", startAt: { lt: now } },
      orderBy: { startAt: "desc" },
      include: { customer: true, menuItem: true },
    }),
  ]);

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

  const initialSelected = rules.flatMap(ruleToHourKeys);

  return (
    <div className="space-y-6">
      <PageHeader
        title="カレンダー"
        description="毎週の空き時間ルールと、確定している予約を確認できます。"
      />

      <Card>
        <h2 className="mb-3 text-sm font-bold text-brand-900">今後の予約</h2>
        {bookings.length === 0 ? (
          <EmptyState>今後の予約はまだありません。</EmptyState>
        ) : (
          <ul className="space-y-2">
            {bookings.map((b) => (
              <li
                key={b.id}
                className="flex items-center justify-between gap-4 rounded-lg bg-brand-50 px-3 py-2 text-sm"
              >
                <div>
                  <p className="font-semibold text-brand-900">
                    {formatDateTime(b.startAt)} 〜{" "}
                    {b.endAt.toTimeString().slice(0, 5)}
                  </p>
                  <p className="text-brand-600">
                    {b.customer.name} 様 ・ {b.menuItem?.name ?? "施術"}
                  </p>
                </div>
                <form action={cancelOwnBookingAction}>
                  <input type="hidden" name="id" value={b.id} />
                  <button
                    type="submit"
                    className="shrink-0 rounded-full border border-red-200 px-3 py-1 text-xs font-semibold text-red-600 hover:bg-red-50"
                  >
                    キャンセル
                  </button>
                </form>
              </li>
            ))}
          </ul>
        )}
      </Card>

      <Card>
        <h2 className="mb-1 text-sm font-bold text-brand-900">施術済みのお客様・メモ</h2>
        <p className="mb-3 text-xs text-brand-500">
          このメモはあなただけに表示され、お客様や他のセラピストには共有されません。
        </p>
        {pastCustomers.length === 0 ? (
          <EmptyState>まだ施術済みのお客様がいません。</EmptyState>
        ) : (
          <div className="space-y-4">
            {pastCustomers.map(({ customer, bookings: customerBookings, notes: customerNotes }) => (
              <div key={customer.id} className="rounded-xl border border-brand-100 p-4">
                <p className="font-semibold text-brand-900">{customer.name} 様</p>
                <ul className="mt-1 space-y-0.5 text-xs text-brand-500">
                  {customerBookings.map((b) => (
                    <li key={b.id}>
                      {formatDate(b.startAt)} ・ {b.menuItem?.name ?? "施術"}
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
            ))}
          </div>
        )}
      </Card>

      <Card>
        <h2 className="mb-3 text-sm font-bold text-brand-900">週間カレンダーで出勤時間を設定</h2>
        <WeeklyAvailabilityGrid initialSelected={initialSelected} />
      </Card>

      <Card>
        <h2 className="mb-3 text-sm font-bold text-brand-900">毎週の空き時間ルール</h2>
        {rules.length === 0 ? (
          <EmptyState>まだ空き時間ルールがありません。</EmptyState>
        ) : (
          <ul className="mb-4 space-y-2">
            {rules.map((rule) => (
              <li
                key={rule.id}
                className={`flex items-center justify-between gap-4 rounded-lg bg-brand-50 px-3 py-2 text-sm ${
                  !rule.isActive ? "opacity-50" : ""
                }`}
              >
                <div>
                  <p className="font-semibold text-brand-900">
                    毎週{DAY_LABELS[rule.dayOfWeek]}曜日 {rule.startTime}〜{rule.endTime}
                  </p>
                  <p className="text-xs text-brand-500">
                    {formatDate(rule.startDate)} 〜 {formatDate(rule.endDate)}
                  </p>
                </div>
                <form action={deleteAvailabilityRuleAction}>
                  <input type="hidden" name="id" value={rule.id} />
                  <button
                    type="submit"
                    className="shrink-0 rounded-full border border-red-200 px-3 py-1 text-xs font-semibold text-red-600 hover:bg-red-50"
                  >
                    削除
                  </button>
                </form>
              </li>
            ))}
          </ul>
        )}

        <h3 className="mb-3 mt-4 text-sm font-bold text-brand-900">新しいルールを追加</h3>
        <form action={createAvailabilityRuleAction} className="grid gap-3 sm:grid-cols-2">
          <label className="block text-sm">
            <span className="text-brand-700">曜日</span>
            <select
              name="dayOfWeek"
              required
              className="mt-1 w-full rounded-lg border border-brand-200 bg-white px-3 py-2 text-sm shadow-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-200"
            >
              {DAY_LABELS.map((label, i) => (
                <option key={i} value={i}>
                  {label}曜日
                </option>
              ))}
            </select>
          </label>
          <div />
          <label className="block text-sm">
            <span className="text-brand-700">開始時刻</span>
            <input
              name="startTime"
              type="time"
              required
              className="mt-1 w-full rounded-lg border border-brand-200 bg-white px-3 py-2 text-sm shadow-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-200"
            />
          </label>
          <label className="block text-sm">
            <span className="text-brand-700">終了時刻</span>
            <input
              name="endTime"
              type="time"
              required
              className="mt-1 w-full rounded-lg border border-brand-200 bg-white px-3 py-2 text-sm shadow-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-200"
            />
          </label>
          <label className="block text-sm">
            <span className="text-brand-700">開始日（この日から適用）</span>
            <input
              name="startDate"
              type="date"
              required
              className="mt-1 w-full rounded-lg border border-brand-200 bg-white px-3 py-2 text-sm shadow-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-200"
            />
          </label>
          <label className="block text-sm">
            <span className="text-brand-700">終了日（この日まで）</span>
            <input
              name="endDate"
              type="date"
              required
              className="mt-1 w-full rounded-lg border border-brand-200 bg-white px-3 py-2 text-sm shadow-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-200"
            />
          </label>
          <div className="sm:col-span-2">
            <SubmitButton>ルールを追加</SubmitButton>
          </div>
        </form>
      </Card>
    </div>
  );
}
