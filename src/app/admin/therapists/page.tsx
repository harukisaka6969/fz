import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { createTherapistAction } from "@/lib/actions/admin-actions";
import { Card, PageHeader, SubmitButton } from "@/components/ui";

export default async function AdminTherapistsPage() {
  const therapists = await prisma.therapist.findMany({
    orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="セラピスト管理"
        description="お客様ページに表示されるセラピスト一覧です。プロフィールの編集は各カードから行えます。"
      />

      <div className="grid gap-3 sm:grid-cols-2">
        {therapists.map((t) => (
          <Link key={t.id} href={`/admin/therapists/${t.id}`}>
            <Card className="h-full transition hover:border-brand-300 hover:shadow-md">
              <div className="flex items-center justify-between">
                <p className="font-semibold text-brand-900">{t.name}</p>
                <span
                  className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                    t.isVerified
                      ? "bg-emerald-100 text-emerald-700"
                      : "bg-neutral-200 text-neutral-600"
                  }`}
                >
                  {t.isVerified ? "認証済み・お客様に公開中" : "未認証・非公開"}
                </span>
              </div>
              <p className="mt-1 text-sm text-brand-600">{t.catchCopy}</p>
              <p className="mt-2 line-clamp-2 text-xs text-brand-500">{t.bio}</p>
            </Card>
          </Link>
        ))}
      </div>

      <Card>
        <h2 className="mb-4 text-sm font-bold text-brand-900">新しいセラピストを追加</h2>
        <form action={createTherapistAction} className="grid gap-4 sm:grid-cols-2">
          <TherapistFields />
          <div className="sm:col-span-2">
            <SubmitButton>追加する</SubmitButton>
          </div>
        </form>
      </Card>
    </div>
  );
}

export function TherapistFields({
  defaults,
}: {
  defaults?: {
    name: string;
    catchCopy: string;
    bio: string;
    age: number | null;
    height: number | null;
    bodyType: string | null;
    bloodType: string | null;
    areaOfWork: string | null;
    workingHours: string | null;
    photoUrl: string | null;
    snsUrl: string | null;
  };
}) {
  return (
    <>
      <Field label="源氏名" name="name" defaultValue={defaults?.name} required full />
      <Field label="キャッチコピー" name="catchCopy" defaultValue={defaults?.catchCopy} full />
      <label className="block text-sm sm:col-span-2">
        <span className="text-brand-700">自己紹介</span>
        <textarea
          name="bio"
          rows={4}
          defaultValue={defaults?.bio}
          className="mt-1 w-full rounded-lg border border-brand-200 bg-white px-3 py-2 text-sm shadow-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-200"
        />
      </label>
      <Field label="年齢" name="age" type="number" defaultValue={defaults?.age ?? undefined} />
      <Field label="身長(cm)" name="height" type="number" defaultValue={defaults?.height ?? undefined} />
      <Field label="体型" name="bodyType" defaultValue={defaults?.bodyType ?? undefined} />
      <Field label="血液型" name="bloodType" defaultValue={defaults?.bloodType ?? undefined} />
      <Field label="対応エリア" name="areaOfWork" defaultValue={defaults?.areaOfWork ?? undefined} />
      <Field label="対応時間" name="workingHours" defaultValue={defaults?.workingHours ?? undefined} />
      <Field label="プロフィール写真URL" name="photoUrl" defaultValue={defaults?.photoUrl ?? undefined} full />
      <Field label="SNS URL" name="snsUrl" defaultValue={defaults?.snsUrl ?? undefined} full />
    </>
  );
}

function Field({
  label,
  name,
  type = "text",
  defaultValue,
  required = false,
  full = false,
}: {
  label: string;
  name: string;
  type?: string;
  defaultValue?: string | number;
  required?: boolean;
  full?: boolean;
}) {
  return (
    <label className={`block text-sm ${full ? "sm:col-span-2" : ""}`}>
      <span className="text-brand-700">{label}</span>
      <input
        name={name}
        type={type}
        required={required}
        defaultValue={defaultValue}
        className="mt-1 w-full rounded-lg border border-brand-200 bg-white px-3 py-2 text-sm shadow-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-200"
      />
    </label>
  );
}
