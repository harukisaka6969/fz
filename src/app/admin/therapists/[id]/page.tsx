import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { updateTherapistAction, deleteTherapistAction } from "@/lib/actions/admin-actions";
import { Card, PageHeader, SubmitButton } from "@/components/ui";
import { TherapistFields } from "../page";

export default async function AdminTherapistEditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const therapist = await prisma.therapist.findUnique({ where: { id } });
  if (!therapist) notFound();

  return (
    <div className="space-y-6">
      <PageHeader title={`${therapist.name} さんのプロフィール編集`} />

      <Card>
        <form action={updateTherapistAction} className="grid gap-4 sm:grid-cols-2">
          <input type="hidden" name="id" value={therapist.id} />
          <TherapistFields
            defaults={{
              name: therapist.name,
              catchCopy: therapist.catchCopy,
              bio: therapist.bio,
              age: therapist.age,
              height: therapist.height,
              bodyType: therapist.bodyType,
              bloodType: therapist.bloodType,
              areaOfWork: therapist.areaOfWork,
              workingHours: therapist.workingHours,
              photoUrl: therapist.photoUrl,
              snsUrl: therapist.snsUrl,
            }}
          />
          <div className="flex items-center gap-3 sm:col-span-2">
            <SubmitButton>保存する</SubmitButton>
          </div>
        </form>
      </Card>

      <Card>
        <h2 className="mb-3 text-sm font-bold text-brand-900">削除</h2>
        <p className="mb-3 text-xs text-brand-500">
          削除すると、このセラピストのブログ記事も合わせて削除されます。元に戻せません。
        </p>
        <form action={deleteTherapistAction}>
          <input type="hidden" name="id" value={therapist.id} />
          <button
            type="submit"
            className="rounded-full border border-red-200 px-4 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-50"
          >
            このセラピストを削除する
          </button>
        </form>
      </Card>
    </div>
  );
}
