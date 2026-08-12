import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireCustomer } from "@/lib/auth";
import { Card, EmptyState, PageHeader } from "@/components/ui";
import { formatDate } from "@/lib/format";

export default async function MypageBlogPage() {
  const customer = await requireCustomer();

  const posts = await prisma.blogPost.findMany({
    where: {
      isPublished: true,
      therapist: {
        isVerified: true,
        registeredCustomers: { some: { customerId: customer.id } },
      },
    },
    orderBy: { createdAt: "desc" },
    include: { therapist: true },
  });

  return (
    <div className="space-y-6">
      <PageHeader title="ブログ" description="セラピストからのお知らせ・日記です。" />

      {posts.length === 0 ? (
        <EmptyState>まだ記事がありません。</EmptyState>
      ) : (
        <div className="space-y-3">
          {posts.map((post) => (
            <Link key={post.id} href={`/mypage/blog/${post.id}`}>
              <Card className="transition hover:border-brand-300 hover:shadow-md">
                <p className="text-xs text-brand-500">
                  {post.therapist.name} ・ {formatDate(post.createdAt)}
                </p>
                <p className="mt-1 font-semibold text-brand-900">{post.title}</p>
                <p className="mt-1 line-clamp-2 text-sm text-brand-600">{post.body}</p>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
