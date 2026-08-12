import { requireCustomer } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getAvailableSlots } from "@/lib/availability";
import { bookSlotAction, cancelBookingAction } from "@/lib/actions/customer-actions";
import { Card, EmptyState, PageHeader } from "@/components/ui";
import { formatDate, formatTime, formatWeekday } from "@/lib/format";
import BookingSelectors from "./BookingSelectors";

export default async function MypageBookPage({
  searchParams,
}: {
  searchParams: Promise<{ therapist?: string; menu?: string }>;
}) {
  const customer = await requireCustomer();
  const { therapist: therapistId = "", menu: menuItemId = "" } = await searchParams;

  const [therapists, menuItems, myBookings] = await Promise.all([
    prisma.therapist.findMany({ orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }] }),
    prisma.menuItem.findMany({ where: { isActive: true }, orderBy: { sortOrder: "asc" } }),
    prisma.booking.findMany({
      where: { customerId: customer.id, status: "CONFIRMED", startAt: { gte: new Date() } },
      orderBy: { startAt: "asc" },
      include: { therapist: true, menuItem: true },
    }),
  ]);

  const selectedMenuItem = menuItems.find((m) => m.id === menuItemId);

  const slots = selectedMenuItem
    ? await getAvailableSlots({
        therapistId: therapistId || undefined,
        durationMin: selectedMenuItem.durationMin,
      })
    : [];

  const slotsByDate = new Map<string, typeof slots>();
  for (const slot of slots) {
    const key = formatDate(slot.start);
    if (!slotsByDate.has(key)) slotsByDate.set(key, []);
    slotsByDate.get(key)!.push(slot);
  }

  return (
    <div className="space-y-6">
      <PageHeader title="予約" description="施術メニューを選んで、空いている時間からご予約いただけます。" />

      {myBookings.length > 0 && (
        <Card>
          <h2 className="mb-3 text-sm font-bold text-brand-900">あなたの予約</h2>
          <ul className="space-y-2">
            {myBookings.map((b) => (
              <li
                key={b.id}
                className="flex items-center justify-between gap-4 rounded-lg bg-brand-50 px-3 py-2 text-sm"
              >
                <div>
                  <p className="font-semibold text-brand-900">
                    {formatDate(b.startAt)}（{formatWeekday(b.startAt)}）{formatTime(b.startAt)}〜
                    {formatTime(b.endAt)}
                  </p>
                  <p className="text-brand-600">
                    {b.therapist.name} ・ {b.menuItem?.name ?? "施術"}
                  </p>
                </div>
                <form action={cancelBookingAction}>
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
        </Card>
      )}

      <Card>
        <BookingSelectors
          therapists={therapists.map((t) => ({ id: t.id, name: t.name }))}
          menuItems={menuItems.map((m) => ({
            id: m.id,
            name: m.name,
            durationMin: m.durationMin,
          }))}
          selectedTherapistId={therapistId}
          selectedMenuItemId={menuItemId}
        />
      </Card>

      {!selectedMenuItem ? (
        <EmptyState>施術メニューを選ぶと、空いている時間が表示されます。</EmptyState>
      ) : slotsByDate.size === 0 ? (
        <EmptyState>
          現在ご案内できる空き時間がありません。しばらくしてから再度お試しください。
        </EmptyState>
      ) : (
        <div className="space-y-4">
          {[...slotsByDate.entries()].map(([date, daySlots]) => (
            <Card key={date}>
              <h3 className="mb-3 text-sm font-bold text-brand-900">
                {date}（{formatWeekday(daySlots[0].start)}）
              </h3>
              <div className="flex flex-wrap gap-2">
                {daySlots.map((slot) => (
                  <form
                    key={`${slot.therapistId}-${slot.start.toISOString()}`}
                    action={bookSlotAction}
                  >
                    <input type="hidden" name="therapistId" value={slot.therapistId} />
                    <input type="hidden" name="menuItemId" value={selectedMenuItem.id} />
                    <input type="hidden" name="startAt" value={slot.start.toISOString()} />
                    <input type="hidden" name="endAt" value={slot.end.toISOString()} />
                    <button
                      type="submit"
                      className="rounded-full border border-brand-300 bg-white px-3 py-1.5 text-xs font-semibold text-brand-700 hover:bg-brand-600 hover:text-white"
                    >
                      {formatTime(slot.start)}
                      {!therapistId && (
                        <span className="ml-1 text-[10px] text-brand-400">
                          {slot.therapistName}
                        </span>
                      )}
                    </button>
                  </form>
                ))}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
