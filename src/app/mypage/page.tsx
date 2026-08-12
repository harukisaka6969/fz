import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Card, EmptyState, PageHeader } from "@/components/ui";

export default async function MypageTherapistsPage() {
  const therapists = await prisma.therapist.findMany({
    where: { isVerified: true },
    orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="セラピスト"
        description="在籍しているセラピストです。気になる方のプロフィールをご覧ください。"
      />

      {therapists.length === 0 ? (
        <EmptyState>現在ご案内できるセラピストがいません。</EmptyState>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {therapists.map((t) => (
            <Link key={t.id} href={`/mypage/therapists/${t.id}`}>
              <Card className="h-full transition hover:border-brand-300 hover:shadow-md">
                <div className="flex items-center gap-4">
                  <div className="h-16 w-16 shrink-0 overflow-hidden rounded-full bg-brand-100">
                    {t.photoUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={t.photoUrl}
                        alt={t.name}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-xl font-bold text-brand-400">
                        {t.name.slice(0, 1)}
                      </div>
                    )}
                  </div>
                  <div>
                    <p className="font-semibold text-brand-900">{t.name}</p>
                    <p className="mt-1 text-sm text-brand-600">{t.catchCopy}</p>
                  </div>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
