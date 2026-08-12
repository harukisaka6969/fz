import { requireCustomer } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import TopBanner from "@/components/TopBanner";

export default async function MypageLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const customer = await requireCustomer();

  const unreadMessages = await prisma.message.count({
    where: {
      customerId: customer.id,
      sender: "ADMIN",
      readByCustomer: false,
    },
  });

  const tabs = [
    { href: "/mypage", label: "セラピスト" },
    { href: "/mypage/menu", label: "施術メニュー" },
    { href: "/mypage/coupons", label: "クーポン" },
    { href: "/mypage/history", label: "施術履歴" },
    { href: "/mypage/billing", label: "請求" },
    { href: "/mypage/reviews", label: "レビュー" },
    { href: "/mypage/blog", label: "ブログ" },
    { href: "/mypage/messages", label: "メッセージ", badge: unreadMessages },
  ];

  return (
    <div className="flex min-h-screen flex-1 flex-col bg-brand-50">
      <TopBanner roleLabel="Mypage" displayName={customer.name} tabs={tabs} />
      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-6">
        {children}
      </main>
    </div>
  );
}
