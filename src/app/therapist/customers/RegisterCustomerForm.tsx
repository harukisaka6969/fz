"use client";

import { useActionState } from "react";
import {
  registerCustomerByEmailAction,
  type RegisterCustomerState,
} from "@/lib/actions/therapist-actions";

const initialState: RegisterCustomerState = {};

export default function RegisterCustomerForm() {
  const [state, formAction, pending] = useActionState(
    registerCustomerByEmailAction,
    initialState
  );

  return (
    <form action={formAction} className="space-y-3">
      <label className="block text-sm">
        <span className="text-brand-700">お客様のメールアドレス</span>
        <input
          name="email"
          type="email"
          required
          placeholder="customer@example.com"
          className="mt-1 w-full rounded-lg border border-brand-200 bg-white px-3 py-2 text-sm shadow-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-200"
        />
      </label>
      {state.error && (
        <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-600">{state.error}</p>
      )}
      {state.success && (
        <p className="rounded-md bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
          {state.success}
        </p>
      )}
      <button
        type="submit"
        disabled={pending}
        className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white shadow transition hover:bg-brand-700 disabled:opacity-60"
      >
        {pending ? "登録中..." : "登録する"}
      </button>
    </form>
  );
}
