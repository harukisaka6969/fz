import { requireCustomer } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Card, EmptyState, PageHeader, StarRating } from "@/components/ui";
import { formatDate } from "@/lib/format";
import ReviewForm from "./ReviewForm";

export default async function MypageReviewsPage() {
  const customer = await requireCustomer();

  const [myReviews, publishedReviews] = await Promise.all([
    prisma.review.findMany({
      where: { customerId: customer.id },
      orderBy: { createdAt: "desc" },
    }),
    prisma.review.findMany({
      where: { isPublished: true, customerId: { not: customer.id } },
      orderBy: { createdAt: "desc" },
      include: { customer: true },
      take: 10,
    }),
  ]);

  return (
    <div className="space-y-8">
      <PageHeader title="レビュー" description="施術の感想を投稿してください。" />

      <Card>
        <h2 className="mb-3 text-sm font-bold text-brand-900">レビューを投稿する</h2>
        <ReviewForm />
      </Card>

      <div>
        <h2 className="mb-3 text-sm font-bold text-brand-900">あなたの投稿</h2>
        {myReviews.length === 0 ? (
          <EmptyState>まだレビューを投稿していません。</EmptyState>
        ) : (
          <div className="space-y-3">
            {myReviews.map((r) => (
              <Card key={r.id}>
                <StarRating rating={r.rating} />
                <p className="mt-2 text-sm text-brand-800">{r.comment}</p>
                <p className="mt-1 text-xs text-brand-400">{formatDate(r.createdAt)}</p>
                {r.reply && (
                  <div className="mt-3 rounded-lg bg-brand-50 px-3 py-2 text-sm text-brand-800">
                    <p className="text-xs font-semibold text-brand-500">お返事</p>
                    <p>{r.reply}</p>
                  </div>
                )}
              </Card>
            ))}
          </div>
        )}
      </div>

      <div>
        <h2 className="mb-3 text-sm font-bold text-brand-900">他のお客様のレビュー</h2>
        {publishedReviews.length === 0 ? (
          <EmptyState>まだ公開レビューがありません。</EmptyState>
        ) : (
          <div className="space-y-3">
            {publishedReviews.map((r) => (
              <Card key={r.id}>
                <StarRating rating={r.rating} />
                <p className="mt-2 text-sm text-brand-800">{r.comment}</p>
                <p className="mt-1 text-xs text-brand-400">
                  {r.customer.name} ・ {formatDate(r.createdAt)}
                </p>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
