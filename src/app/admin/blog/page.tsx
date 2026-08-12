import { prisma } from "@/lib/prisma";
import {
  createBlogPostAction,
  deleteBlogPostAction,
  toggleBlogPostPublishedAction,
} from "@/lib/actions/admin-actions";
import { Card, EmptyState, PageHeader, SubmitButton } from "@/components/ui";
import { formatDateTime } from "@/lib/format";

export default async function AdminBlogPage() {
  const [posts, therapists] = await Promise.all([
    prisma.blogPost.findMany({
      orderBy: { createdAt: "desc" },
      include: { therapist: true },
    }),
    prisma.therapist.findMany({ orderBy: { sortOrder: "asc" } }),
  ]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="ブログ管理"
        description="各セラピストのブログ記事を投稿・管理します。"
      />

      {posts.length === 0 ? (
        <EmptyState>まだ記事がありません。</EmptyState>
      ) : (
        <div className="space-y-3">
          {posts.map((post) => (
            <Card key={post.id} className={!post.isPublished ? "opacity-50" : ""}>
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold text-brand-500">
                    {post.therapist.name} ・ {formatDateTime(post.createdAt)}
                    {!post.isPublished && "（非公開）"}
                  </p>
                  <p className="mt-1 font-semibold text-brand-900">{post.title}</p>
                  <p className="mt-1 whitespace-pre-wrap text-sm text-brand-700">{post.body}</p>
                </div>
                <div className="flex shrink-0 flex-col gap-2">
                  <form action={toggleBlogPostPublishedAction}>
                    <input type="hidden" name="id" value={post.id} />
                    <button
                      type="submit"
                      className="w-full rounded-full border border-brand-200 px-3 py-1 text-xs font-semibold text-brand-700 hover:bg-brand-100"
                    >
                      {post.isPublished ? "非公開にする" : "公開する"}
                    </button>
                  </form>
                  <form action={deleteBlogPostAction}>
                    <input type="hidden" name="id" value={post.id} />
                    <button
                      type="submit"
                      className="w-full rounded-full border border-red-200 px-3 py-1 text-xs font-semibold text-red-600 hover:bg-red-50"
                    >
                      削除
                    </button>
                  </form>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      <Card>
        <h2 className="mb-4 text-sm font-bold text-brand-900">新しい記事を投稿</h2>
        <form action={createBlogPostAction} className="grid gap-3">
          <label className="block text-sm">
            <span className="text-brand-700">投稿者(セラピスト)</span>
            <select
              name="therapistId"
              required
              className="mt-1 w-full rounded-lg border border-brand-200 bg-white px-3 py-2 text-sm shadow-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-200"
            >
              {therapists.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </select>
          </label>
          <label className="block text-sm">
            <span className="text-brand-700">タイトル</span>
            <input
              name="title"
              required
              className="mt-1 w-full rounded-lg border border-brand-200 bg-white px-3 py-2 text-sm shadow-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-200"
            />
          </label>
          <label className="block text-sm">
            <span className="text-brand-700">本文</span>
            <textarea
              name="body"
              required
              rows={5}
              className="mt-1 w-full rounded-lg border border-brand-200 bg-white px-3 py-2 text-sm shadow-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-200"
            />
          </label>
          <div>
            <SubmitButton>投稿する</SubmitButton>
          </div>
        </form>
      </Card>
    </div>
  );
}
