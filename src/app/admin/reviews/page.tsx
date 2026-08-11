import { prisma } from "@/lib/prisma";
import {
  replyReviewAction,
  toggleReviewPublishedAction,
} from "@/lib/actions/admin-actions";
import { Card, EmptyState, PageHeader, StarRating, SubmitButton } from "@/components/ui";
import { formatDateTime } from "@/lib/format";

export default async function AdminReviewsPage() {
  const reviews = await prisma.review.findMany({
    orderBy: { createdAt: "desc" },
    include: { customer: true },
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="レビュー管理"
        description="お客様からのレビューに返信したり、公開・非公開を切り替えられます。"
      />

      {reviews.length === 0 ? (
        <EmptyState>まだレビューがありません。</EmptyState>
      ) : (
        <div className="space-y-3">
          {reviews.map((review) => (
            <Card key={review.id} className={!review.isPublished ? "opacity-50" : ""}>
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold text-brand-900">
                    {review.customer.name}
                    <span className="ml-2 text-xs font-normal text-brand-400">
                      {formatDateTime(review.createdAt)}
                    </span>
                  </p>
                  <div className="mt-1">
                    <StarRating rating={review.rating} />
                  </div>
                  <p className="mt-2 text-sm text-brand-700">{review.comment}</p>
                </div>
                <form action={toggleReviewPublishedAction} className="shrink-0">
                  <input type="hidden" name="id" value={review.id} />
                  <button
                    type="submit"
                    className="rounded-full border border-brand-200 px-3 py-1 text-xs font-semibold text-brand-700 hover:bg-brand-100"
                  >
                    {review.isPublished ? "非公開にする" : "公開する"}
                  </button>
                </form>
              </div>

              {review.reply ? (
                <div className="mt-3 rounded-lg bg-brand-50 px-3 py-2 text-sm text-brand-800">
                  <p className="text-xs font-semibold text-brand-500">返信</p>
                  <p>{review.reply}</p>
                </div>
              ) : (
                <form action={replyReviewAction} className="mt-3 flex gap-2">
                  <input type="hidden" name="id" value={review.id} />
                  <input
                    name="reply"
                    placeholder="返信を入力"
                    required
                    className="flex-1 rounded-lg border border-brand-200 bg-white px-3 py-2 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-200"
                  />
                  <SubmitButton className="shrink-0">返信</SubmitButton>
                </form>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
