import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireCustomer } from "@/lib/auth";
import { createTherapistNoteAction } from "@/lib/actions/customer-actions";
import { Card, PageHeader, SubmitButton } from "@/components/ui";
import { formatDate } from "@/lib/format";

export default async function MypageTherapistDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const customer = await requireCustomer();

  const [therapist, notes] = await Promise.all([
    prisma.therapist.findUnique({ where: { id } }),
    prisma.therapistNote.findMany({
      where: { therapistId: id, customerId: customer.id },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  if (!therapist || !therapist.isVerified) notFound();

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
      <PageHeader title={`${therapist.name} さんのプロフィール`} />

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

        <Link
          href={`/mypage/book?therapist=${therapist.id}`}
          className="mt-5 block rounded-full bg-brand-600 px-4 py-2.5 text-center text-sm font-semibold text-white hover:bg-brand-700"
        >
          {therapist.name} さんに予約する
        </Link>
      </Card>

      <Card>
        <h2 className="mb-1 text-sm font-bold text-brand-900">自分だけのメモ</h2>
        <p className="mb-3 text-xs text-brand-500">
          このメモはあなただけに表示され、セラピストや運営には共有されません。
        </p>
        {notes.length === 0 ? (
          <p className="mb-3 text-sm text-brand-400">まだメモがありません。</p>
        ) : (
          <ul className="mb-4 space-y-2">
            {notes.map((note) => (
              <li key={note.id} className="rounded-lg bg-brand-50 px-3 py-2 text-sm text-brand-800">
                <p className="whitespace-pre-wrap">{note.body}</p>
                <p className="mt-1 text-[10px] text-brand-400">
                  {formatDate(note.createdAt)}
                </p>
              </li>
            ))}
          </ul>
        )}
        <form action={createTherapistNoteAction} className="space-y-3">
          <input type="hidden" name="therapistId" value={therapist.id} />
          <textarea
            name="body"
            required
            placeholder="例: 力加減がちょうど良かった、次回は◯◯コースを試したい 等"
            rows={3}
            className="w-full rounded-lg border border-brand-200 bg-white px-3 py-2 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-200"
          />
          <SubmitButton>メモを追加</SubmitButton>
        </form>
      </Card>
    </div>
  );
}
