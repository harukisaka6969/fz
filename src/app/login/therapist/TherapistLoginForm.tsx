"use client";

import { useActionState } from "react";
import { loginTherapistAction, type LoginState } from "@/lib/actions/auth-actions";

const initialState: LoginState = {};

export default function TherapistLoginForm() {
  const [state, formAction, pending] = useActionState(
    loginTherapistAction,
    initialState
  );

  return (
    <form action={formAction} className="space-y-4">
      <div>
        <label htmlFor="loginId" className="block text-sm font-medium text-brand-900">
          ログインID
        </label>
        <input
          id="loginId"
          name="loginId"
          type="text"
          autoComplete="username"
          className="mt-1 w-full rounded-lg border border-brand-200 bg-white px-3 py-2 text-sm shadow-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-200"
        />
      </div>
      <div>
        <label htmlFor="password" className="block text-sm font-medium text-brand-900">
          パスワード
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          className="mt-1 w-full rounded-lg border border-brand-200 bg-white px-3 py-2 text-sm shadow-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-200"
        />
      </div>
      {state.error && (
        <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-600">
          {state.error}
        </p>
      )}
      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white shadow transition hover:bg-brand-700 disabled:opacity-60"
      >
        {pending ? "ログイン中..." : "セラピストとしてログイン"}
      </button>
    </form>
  );
}
