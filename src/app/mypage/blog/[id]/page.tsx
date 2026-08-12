import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Card, PageHeader } from "@/components/ui";
import { formatDate } from "@/lib/format";

export default async function MypageBlogDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const post = await prisma.blogPost.findUnique({
    where: { id },
    include: { therapist: true },
  });

  if (!post || !post.isPublished) notFound();

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
