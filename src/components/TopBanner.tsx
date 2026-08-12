"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { logoutAction } from "@/lib/actions/auth-actions";

export type BannerTab = {
  href: string;
  label: string;
  badge?: number;
};

export default function TopBanner({
  roleLabel,
  displayName,
  tabs,
}: {
  roleLabel: string;
  displayName: string;
  tabs: BannerTab[];
}) {
  const pathname = usePathname();

  const activeHref = tabs
    .filter((tab) => pathname === tab.href || pathname.startsWith(tab.href + "/"))
    .sort((a, b) => b.href.length - a.href.length)[0]?.href;

  return (
    <header className="sticky top-0 z-50 border-b border-brand-100 bg-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-4 py-3">
        <div className="flex items-center gap-2">
          <span className="rounded-full bg-brand-600 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-white">
            {roleLabel}
          </span>
          <span className="text-sm font-semibold text-brand-900">
            {displayName}
          </span>
        </div>
        <form action={logoutAction}>
          <button
            type="submit"
            className="text-xs font-medium text-brand-500 underline-offset-2 hover:text-brand-700 hover:underline"
          >
            ログアウト
          </button>
        </form>
      </div>
      <nav className="mx-auto flex max-w-5xl gap-1 overflow-x-auto px-2 pb-2">
        {tabs.map((tab) => {
          const active = tab.href === activeHref;
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={`relative flex shrink-0 items-center gap-1.5 rounded-full px-4 py-1.5 text-sm font-medium transition ${
                active
                  ? "bg-brand-600 text-white shadow-sm"
                  : "text-brand-700 hover:bg-brand-100"
              }`}
            >
              {tab.label}
              {!!tab.badge && (
                <span
                  className={`ml-0.5 inline-flex h-4 min-w-4 items-center justify-center rounded-full px-1 text-[10px] font-bold ${
                    active ? "bg-white text-brand-700" : "bg-brand-600 text-white"
                  }`}
                >
                  {tab.badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>
    </header>
  );
}
