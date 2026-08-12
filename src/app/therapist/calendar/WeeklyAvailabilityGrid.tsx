"use client";

import { useState } from "react";
import { saveWeeklyAvailabilityAction } from "@/lib/actions/therapist-actions";

const DAY_LABELS = ["日", "月", "火", "水", "木", "金", "土"];
const HOURS = Array.from({ length: 16 }, (_, i) => i + 8); // 8:00〜23:00 開始の枠(終了は+1時間)

function keyOf(day: number, hour: number): string {
  return `${day}-${hour}`;
}

export default function WeeklyAvailabilityGrid({
  initialSelected,
}: {
  initialSelected: string[];
}) {
  const [selected, setSelected] = useState<Set<string>>(new Set(initialSelected));
  const [paintMode, setPaintMode] = useState<"add" | "remove" | null>(null);

  function setCell(day: number, hour: number, on: boolean) {
    setSelected((prev) => {
      const next = new Set(prev);
      const key = keyOf(day, hour);
      if (on) next.add(key);
      else next.delete(key);
      return next;
    });
  }

  function handlePointerDown(day: number, hour: number) {
    const key = keyOf(day, hour);
    const mode = selected.has(key) ? "remove" : "add";
    setPaintMode(mode);
    setCell(day, hour, mode === "add");
  }

  function handlePointerEnter(day: number, hour: number) {
    if (!paintMode) return;
    setCell(day, hour, paintMode === "add");
  }

  return (
    <div className="space-y-4">
      <p className="text-xs text-brand-500">
        タップ（またはドラッグ）して出勤したい時間帯を選択してください。8:00〜24:00の1時間刻みです。
      </p>

      <div
        className="overflow-x-auto select-none"
        onPointerUp={() => setPaintMode(null)}
        onPointerLeave={() => setPaintMode(null)}
      >
        <table className="w-full min-w-[420px] border-separate border-spacing-0.5 text-xs">
          <thead>
            <tr>
              <th className="w-12" />
              {DAY_LABELS.map((label, day) => (
                <th key={day} className="pb-1 text-center font-semibold text-brand-700">
                  {label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {HOURS.map((hour) => (
              <tr key={hour}>
                <td className="whitespace-nowrap pr-1 text-right text-[10px] text-brand-400">
                  {hour}:00
                </td>
                {DAY_LABELS.map((_, day) => {
                  const isSelected = selected.has(keyOf(day, hour));
                  return (
                    <td key={day} className="p-0">
                      <button
                        type="button"
                        aria-pressed={isSelected}
                        onPointerDown={() => handlePointerDown(day, hour)}
                        onPointerEnter={() => handlePointerEnter(day, hour)}
                        className={`h-7 w-full rounded transition ${
                          isSelected
                            ? "bg-brand-600"
                            : "bg-brand-50 hover:bg-brand-100"
                        }`}
                      />
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <form action={saveWeeklyAvailabilityAction} className="grid gap-3 sm:grid-cols-3">
        <input type="hidden" name="slots" value={JSON.stringify([...selected])} />
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
        <div className="flex items-end">
          <button
            type="submit"
            className="w-full rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white shadow transition hover:bg-brand-700"
          >
            この内容で保存する
          </button>
        </div>
      </form>
      <p className="text-xs text-brand-400">
        ※保存すると、下の「毎週の空き時間ルール」欄も含めて、既存の空き時間ルールがこの内容にすべて置き換わります。
      </p>
    </div>
  );
}
