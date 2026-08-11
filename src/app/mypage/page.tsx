import { prisma } from "@/lib/prisma";
import { Card, EmptyState, PageHeader } from "@/components/ui";

export default async function MypageProfilePage() {
  const therapist = await prisma.therapist.findFirst();

  if (!therapist) {
    return (
      <div className="space-y-6">
        <PageHeader title="プロフィール" />
        <EmptyState>プロフィールはまだ準備中です。</EmptyState>
      </div>
    );
  }

  const details = [
    ["年齢", therapist.age ? `${therapist.age}歳` : null],
    ["身長", therapist.height ? `${therapist.height}cm` : null],
    ["体型", therapist.bodyType],
    ["血液型", therapist.bloodType],
    ["対応エリア", therapist.areaOfWork],
    ["対応時間", therapist.workingHours],
  ].filter(([, value]) => value) as [string, string][];

  return (
    <div className="space-y-6">
      <PageHeader title="プロフィール" />

      <Card>
        <div className="flex flex-col items-center text-center sm:flex-row sm:items-start sm:text-left sm:gap-6">
          <div className="h-28 w-28 shrink-0 overflow-hidden rounded-full bg-brand-100">
            {therapist.photoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={therapist.photoUrl}
                alt={therapist.name}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-3xl font-bold text-brand-400">
                {therapist.name.slice(0, 1)}
              </div>
            )}
          </div>
          <div className="mt-4 sm:mt-0">
            <h2 className="text-lg font-bold text-brand-900">{therapist.name}</h2>
            <p className="mt-1 text-sm text-brand-600">{therapist.catchCopy}</p>
          </div>
        </div>

        <p className="mt-5 whitespace-pre-wrap text-sm leading-relaxed text-brand-800">
          {therapist.bio}
        </p>

        {details.length > 0 && (
          <dl className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3">
            {details.map(([label, value]) => (
              <div key={label} className="rounded-lg bg-brand-50 px-3 py-2">
                <dt className="text-xs text-brand-400">{label}</dt>
                <dd className="text-sm font-semibold text-brand-800">{value}</dd>
              </div>
            ))}
          </dl>
        )}

        {therapist.snsUrl && (
          <a
            href={therapist.snsUrl}
            target="_blank"
            rel="noreferrer"
            className="mt-5 inline-block text-sm font-semibold text-brand-600 underline"
          >
            SNSをチェックする →
          </a>
        )}
      </Card>
    </div>
  );
}
