import { requireTherapist } from "@/lib/auth";
import { updateOwnTherapistProfileAction } from "@/lib/actions/therapist-actions";
import { Card, PageHeader, SubmitButton } from "@/components/ui";
import { TherapistFields } from "@/app/admin/therapists/page";

export default async function TherapistProfilePage() {
  const therapist = await requireTherapist();

  return (
    <div className="space-y-6">
      <PageHeader
        title="プロフィール編集"
        description="お客様ページに表示される、あなたのプロフィールです。"
      />

      <Card>
        <form action={updateOwnTherapistProfileAction} className="grid gap-4 sm:grid-cols-2">
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
          <div className="sm:col-span-2">
            <SubmitButton>保存する</SubmitButton>
          </div>
        </form>
      </Card>
    </div>
  );
}
