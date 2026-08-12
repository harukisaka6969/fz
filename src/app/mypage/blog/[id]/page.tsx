import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireCustomer } from "@/lib/auth";
import { Card, PageHeader } from "@/components/ui";
import { formatDate } from "@/lib/format";

export default async function MypageBlogDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const customer = await requireCustomer();

  const post = await prisma.blogPost.findUnique({
    where: { id },
    include: { therapist: true },
  });

  const isRegistered = post
    ? await prisma.therapistCustomer.findUnique({
        where: {
          therapistId_customerId: { therapistId: post.therapistId, customerId: customer.id },
        },
      })
    : null;

  if (!post || !post.isPublished || !post.therapist.isVerified || !isRegistered) notFound();

  return (
    <div className="space-y-6">
      <PageHeader title={post.title} />
      <Card>
        <p className="text-xs text-brand-500">
          {post.therapist.name} ・ {formatDate(post.createdAt)}
        </p>
        <p className="mt-4 whitespace-pre-wrap text-sm leading-relaxed text-brand-800">
          {post.body}
        </p>
      </Card>
    </div>
  );
}
