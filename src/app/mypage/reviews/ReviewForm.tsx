"use client";

import { useActionState, useState } from "react";
import { postReviewAction } from "@/lib/actions/customer-actions";

async function action(
  _prevState: { done: boolean },
  formData: FormData
): Promise<{ done: boolean }> {
  await postReviewAction(formData);
  return { done: true };
}

export default function ReviewForm() {
  const [state, formAction, pending] = useActionState(action, { done: false });
  const [formKey, setFormKey] = useState(0);
  const [prevState, setPrevState] = useState(state);

  if (state !== prevState) {
    setPrevState(state);
    if (state.done) setFormKey((k) => k + 1);
  }

  return (
    <form action={formAction} key={formKey} className="space-y-3">
      <label className="block text-sm">
        <span className="text-brand-700">評価</span>
        <select
          name="rating"
          defaultValue="5"
          className="mt-1 w-full rounded-lg border border-brand-200 bg-white px-3 py-2 text-sm shadow-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-200"
        >
          <option value="5">★★★★★ とても満足</option>
          <option value="4">★★★★☆ 満足</option>
          <option value="3">★★★☆☆ 普通</option>
          <option value="2">★★☆☆☆ やや不満</option>
          <option value="1">★☆☆☆☆ 不満</option>
        </select>
      </label>
      <label className="block text-sm">
        <span className="text-brand-700">コメント</span>
        <textarea
          name="comment"
          required
          rows={3}
          className="mt-1 w-full rounded-lg border border-brand-200 bg-white px-3 py-2 text-sm shadow-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-200"
        />
      </label>
      {state.done && (
        <p className="rounded-md bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
          レビューを投稿しました。ありがとうございます！
        </p>
      )}
      <button
        type="submit"
        disabled={pending}
        className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white shadow transition hover:bg-brand-700 disabled:opacity-60"
      >
        {pending ? "投稿中..." : "レビューを投稿する"}
      </button>
    </form>
  );
}
