import Link from "next/link";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function Home() {
  const therapist = await prisma.therapist.findFirst();

  return (
    <main className="flex flex-1 flex-col bg-brand-50">
      <section className="flex flex-1 flex-col items-center justify-center px-4 py-20 text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-brand-500">
          Personal Salon
        </p>
        <h1 className="mt-3 text-3xl font-bold text-brand-900 sm:text-4xl">
          {therapist?.name ?? "めぐ"}
        </h1>
        {therapist?.catchCopy && (
          <p className="mt-3 max-w-md text-brand-700">{therapist.catchCopy}</p>
        )}

        <div className="mt-10 grid w-full max-w-md gap-4 sm:grid-cols-2">
          <Link
            href="/login/customer"
            className="rounded-xl bg-brand-600 px-6 py-4 text-sm font-semibold text-white shadow transition hover:bg-brand-700"
          >
            お客様ページへ
          </Link>
          <Link
            href="/login/admin"
            className="rounded-xl border border-brand-300 bg-white px-6 py-4 text-sm font-semibold text-brand-700 shadow-sm transition hover:bg-brand-50"
          >
            管理者ページへ
          </Link>
        </div>
      </section>
    </main>
  );
}
