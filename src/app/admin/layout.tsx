import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import TopBanner from "@/components/TopBanner";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const admin = await requireAdmin();

  const unreadMessages = await prisma.message.count({
    where: { sender: "CUSTOMER", readByAdmin: false },
  });

  const tabs = [
    { href: "/admin", label: "顧客一覧" },
    { href: "/admin/profile", label: "プロフィール" },
    { href: "/admin/menu", label: "施術メニュー" },
    { href: "/admin/coupons", label: "クーポン" },
    { href: "/admin/reviews", label: "レビュー" },
    { href: "/admin/messages", label: "メッセージ", badge: unreadMessages },
    { href: "/admin/billing", label: "請求" },
    { href: "/admin/history", label: "施術履歴" },
  ];

  return (
    <div className="flex min-h-screen flex-1 flex-col bg-brand-50">
      <TopBanner roleLabel="Admin" displayName={admin.username} tabs={tabs} />
      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-6">
        {children}
      </main>
    </div>
  );
}
