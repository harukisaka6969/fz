import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import {
  markMessagesReadByAdminAction,
  sendAdminMessageAction,
} from "@/lib/actions/admin-actions";
import { Card, EmptyState, PageHeader, SubmitButton } from "@/components/ui";
import { formatDateTime } from "@/lib/format";

export default async function AdminCustomerMessagesPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const customer = await prisma.customer.findUnique({ where: { id } });
  if (!customer) notFound();

  await markMessagesReadByAdminAction(id);

  const messages = await prisma.message.findMany({
    where: { customerId: id },
    orderBy: { createdAt: "asc" },
  });

  return (
    <div className="space-y-6">
      <PageHeader title={`${customer.name}とのメッセージ`} />

      <Card>
        {messages.length === 0 ? (
          <EmptyState>まだメッセージはありません。</EmptyState>
        ) : (
          <ul className="space-y-3">
            {messages.map((m) => (
              <li
                key={m.id}
                className={`flex ${
                  m.sender === "ADMIN" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-2 text-sm ${
                    m.sender === "ADMIN"
                      ? "bg-brand-600 text-white"
                      : "bg-brand-50 text-brand-900"
                  }`}
                >
                  <p className="whitespace-pre-wrap">{m.body}</p>
                  <p
                    className={`mt-1 text-[10px] ${
                      m.sender === "ADMIN" ? "text-brand-100" : "text-brand-400"
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
        <form action={sendAdminMessageAction} className="space-y-3">
          <input type="hidden" name="customerId" value={id} />
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
