import { prisma } from "@/lib/prisma";
import { updateTherapistProfileAction } from "@/lib/actions/admin-actions";
import { Card, PageHeader, SubmitButton } from "@/components/ui";

export default async function AdminProfilePage() {
  const therapist = await prisma.therapist.findFirst();

  return (
    <div className="space-y-6">
      <PageHeader
        title="プロフィール編集"
        description="お客様ページに表示されるプロフィール情報です。"
      />

      <Card>
        <form action={updateTherapistProfileAction} className="grid gap-4 sm:grid-cols-2">
          <Field label="源氏名" name="name" defaultValue={therapist?.name} required full />
          <Field
            label="キャッチコピー"
            name="catchCopy"
            defaultValue={therapist?.catchCopy}
            full
          />
          <div className="sm:col-span-2">
            <label className="block text-sm">
              <span className="text-brand-700">自己紹介</span>
              <textarea
                name="bio"
                rows={5}
                defaultValue={therapist?.bio}
                className="mt-1 w-full rounded-lg border border-brand-200 bg-white px-3 py-2 text-sm shadow-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-200"
              />
            </label>
          </div>
          <Field label="年齢" name="age" type="number" defaultValue={therapist?.age ?? undefined} />
          <Field
            label="身長(cm)"
            name="height"
            type="number"
            defaultValue={therapist?.height ?? undefined}
          />
          <Field label="体型" name="bodyType" defaultValue={therapist?.bodyType ?? undefined} />
          <Field label="血液型" name="bloodType" defaultValue={therapist?.bloodType ?? undefined} />
          <Field
            label="対応エリア"
            name="areaOfWork"
            defaultValue={therapist?.areaOfWork ?? undefined}
          />
          <Field
            label="対応時間"
            name="workingHours"
            defaultValue={therapist?.workingHours ?? undefined}
          />
          <Field
            label="プロフィール写真URL"
            name="photoUrl"
            defaultValue={therapist?.photoUrl ?? undefined}
            full
          />
          <Field label="SNS URL" name="snsUrl" defaultValue={therapist?.snsUrl ?? undefined} full />

          <div className="sm:col-span-2">
            <SubmitButton>保存する</SubmitButton>
          </div>
        </form>
      </Card>
    </div>
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
