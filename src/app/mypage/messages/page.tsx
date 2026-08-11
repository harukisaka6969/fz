import { requireCustomer } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { sendCustomerMessageAction } from "@/lib/actions/customer-actions";
import { Card, EmptyState, PageHeader, SubmitButton } from "@/components/ui";
import { formatDateTime } from "@/lib/format";

export default async function MypageMessagesPage() {
  const customer = await requireCustomer();

  await prisma.message.updateMany({
    where: { customerId: customer.id, sender: "ADMIN", readByCustomer: false },
    data: { readByCustomer: true },
  });

  const messages = await prisma.message.findMany({
    where: { customerId: customer.id },
    orderBy: { createdAt: "asc" },
  });

  return (
    <div className="space-y-6">
      <PageHeader title="メッセージ" description="セラピストへのご連絡はこちらから。" />

      <Card>
        {messages.length === 0 ? (
          <EmptyState>まだメッセージはありません。お気軽にご連絡ください。</EmptyState>
        ) : (
          <ul className="space-y-3">
            {messages.map((m) => (
              <li
                key={m.id}
                className={`flex ${
                  m.sender === "CUSTOMER" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-2 text-sm ${
                    m.sender === "CUSTOMER"
                      ? "bg-brand-600 text-white"
                      : "bg-brand-50 text-brand-900"
                  }`}
                >
                  <p className="whitespace-pre-wrap">{m.body}</p>
                  <p
                    className={`mt-1 text-[10px] ${
                      m.sender === "CUSTOMER" ? "text-brand-100" : "text-brand-400"
                    }`}
                  >
                    {formatDateTime(m.createdAt)}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </Card>

      <Card>
        <form action={sendCustomerMessageAction} className="space-y-3">
          <textarea
            name="body"
            required
            rows={3}
            placeholder="メッセージを入力"
            className="w-full rounded-lg border border-brand-200 bg-white px-3 py-2 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-200"
          />
          <SubmitButton>送信する</SubmitButton>
        </form>
      </Card>
    </div>
  );
}
