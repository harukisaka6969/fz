import { requireTherapist } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  createAvailabilityRuleAction,
  deleteAvailabilityRuleAction,
  cancelOwnBookingAction,
  setBookingHorizonAction,
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

  const [rules, bookings] = await Promise.all([
    prisma.availabilityRule.findMany({
      where: { therapistId: therapist.id },
      orderBy: [{ dayOfWeek: "asc" }, { startTime: "asc" }],
    }),
    prisma.booking.findMany({
      where: { therapistId: therapist.id, status: "CONFIRMED", startAt: { gte: now } },
      orderBy: { startAt: "asc" },
      include: { customer: true, menuItem: true },
    }),
  ]);

  const initialSelected = rules.flatMap(ruleToHourKeys);

  return (
    <div className="space-y-6">
      <PageHeader
        title="カレンダー"
        description="毎週の空き時間ルールと、確定している予約を確認できます。"
      />

      <Card>
        <h2 className="mb-1 text-sm font-bold text-brand-900">予約の受付期間</h2>
        <p className="mb-3 text-xs text-brand-500">
          お客様が予約できるのは、今日からここで設定した期間までです。現在:{" "}
          <span className="font-semibold text-brand-700">
            {therapist.bookingHorizonWeeks === 0
              ? "予約を停止中"
              : `${therapist.bookingHorizonWeeks}週間先まで`}
          </span>
        </p>
        <div className="flex flex-wrap gap-2">
          {[
            { weeks: 2, label: "2週間先まで受付" },
            { weeks: 3, label: "3週間先まで受付" },
            { weeks: 4, label: "4週間先まで受付" },
          ].map(({ weeks, label }) => (
            <form key={weeks} action={setBookingHorizonAction}>
              <input type="hidden" name="weeks" value={weeks} />
              <button
                type="submit"
                className={`rounded-full px-4 py-1.5 text-xs font-semibold transition ${
                  therapist.bookingHorizonWeeks === weeks
                    ? "bg-brand-600 text-white"
                    : "border border-brand-300 bg-white text-brand-700 hover:bg-brand-100"
                }`}
              >
                {label}
              </button>
            </form>
          ))}
          <form action={setBookingHorizonAction}>
            <input type="hidden" name="weeks" value={0} />
            <button
              type="submit"
              className={`rounded-full px-4 py-1.5 text-xs font-semibold transition ${
                therapist.bookingHorizonWeeks === 0
                  ? "bg-red-600 text-white"
                  : "border border-red-200 bg-white text-red-600 hover:bg-red-50"
              }`}
            >
              今は予約を制限する
            </button>
          </form>
        </div>
      </Card>

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
                    {b.customer.name} ・ {b.menuItem?.name ?? "施術"}
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
