"use client";

import { useRouter } from "next/navigation";

export default function BookingSelectors({
  therapists,
  menuItems,
  selectedTherapistId,
  selectedMenuItemId,
}: {
  therapists: { id: string; name: string }[];
  menuItems: { id: string; name: string; durationMin: number }[];
  selectedTherapistId: string;
  selectedMenuItemId: string;
}) {
  const router = useRouter();

  function navigate(therapistId: string, menuItemId: string) {
    const params = new URLSearchParams();
    if (therapistId) params.set("therapist", therapistId);
    if (menuItemId) params.set("menu", menuItemId);
    router.push(`/mypage/book?${params.toString()}`);
  }

  return (
    <div className="grid gap-3 sm:grid-cols-2">
      <label className="block text-sm">
        <span className="text-brand-700">セラピスト</span>
        <select
          value={selectedTherapistId}
          onChange={(e) => navigate(e.target.value, selectedMenuItemId)}
          className="mt-1 w-full rounded-lg border border-brand-200 bg-white px-3 py-2 text-sm shadow-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-200"
        >
          <option value="">指定なし（空いている方から）</option>
          {therapists.map((t) => (
            <option key={t.id} value={t.id}>
              {t.name}
            </option>
          ))}
        </select>
      </label>
      <label className="block text-sm">
        <span className="text-brand-700">施術メニュー</span>
        <select
          value={selectedMenuItemId}
          onChange={(e) => navigate(selectedTherapistId, e.target.value)}
          className="mt-1 w-full rounded-lg border border-brand-200 bg-white px-3 py-2 text-sm shadow-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-200"
        >
          <option value="">選択してください</option>
          {menuItems.map((m) => (
            <option key={m.id} value={m.id}>
              {m.name}（{m.durationMin}分）
            </option>
          ))}
        </select>
      </label>
    </div>
  );
}
