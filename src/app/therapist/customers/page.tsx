import { requireTherapist } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { unregisterCustomerAction } from "@/lib/actions/therapist-actions";
import { Card, EmptyState, PageHeader } from "@/components/ui";
import { formatDate } from "@/lib/format";
import RegisterCustomerForm from "./RegisterCustomerForm";

export default async function TherapistCustomersPage() {
  const therapist = await requireTherapist();

  const registrations = await prisma.therapistCustomer.findMany({
    where: { therapistId: therapist.id },
    orderBy: { createdAt: "desc" },
    include: { customer: true },
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="お客様"
        description="メールアドレスで登録したお客様だけが、あなたのプロフィール・予約・ブログを見られます。"
      />

      <Card>
        <h2 className="mb-4 text-sm font-bold text-brand-900">お客様を登録する</h2>
        <RegisterCustomerForm />
      </Card>

      <Card>
        <h2 className="mb-3 text-sm font-bold text-brand-900">登録済みのお客様</h2>
        {registrations.length === 0 ? (
          <EmptyState>まだ登録されたお客様がいません。</EmptyState>
        ) : (
          <ul className="space-y-2">
            {registrations.map((r) => (
              <li
                key={r.id}
                className="flex items-center justify-between gap-4 rounded-lg bg-brand-50 px-3 py-2 text-sm"
              >
                <div>
                  <p className="font-semibold text-brand-900">{r.customer.name}</p>
                  <p className="text-xs text-brand-500">
                    {r.customer.email ?? "-"} ・ 登録日: {formatDate(r.createdAt)}
                  </p>
                </div>
                <form action={unregisterCustomerAction}>
                  <input type="hidden" name="customerId" value={r.customerId} />
                  <button
                    type="submit"
                    className="shrink-0 rounded-full border border-red-200 px-3 py-1 text-xs font-semibold text-red-600 hover:bg-red-50"
                  >
                    登録解除
                  </button>
                </form>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}
