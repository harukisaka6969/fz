import { requireTherapist } from "@/lib/auth";
import TopBanner from "@/components/TopBanner";

export default async function TherapistLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const therapist = await requireTherapist();

  const tabs = [
    { href: "/therapist", label: "プロフィール" },
    { href: "/therapist/customers", label: "お客様" },
    { href: "/therapist/calendar", label: "カレンダー" },
    { href: "/therapist/blog", label: "ブログ" },
  ];

  return (
    <div className="flex min-h-screen flex-1 flex-col bg-brand-50">
      <TopBanner roleLabel="Therapist" displayName={therapist.name} tabs={tabs} />
      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-6">
        {children}
      </main>
    </div>
  );
}
