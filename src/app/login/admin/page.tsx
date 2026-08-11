import Link from "next/link";
import AdminLoginForm from "./AdminLoginForm";

export default function AdminLoginPage() {
  return (
    <main className="flex flex-1 items-center justify-center bg-brand-50 px-4 py-16">
      <div className="w-full max-w-sm rounded-2xl border border-brand-100 bg-white p-8 shadow-lg">
        <p className="text-center text-xs font-semibold uppercase tracking-widest text-brand-500">
          Admin
        </p>
        <h1 className="mt-1 text-center text-xl font-bold text-brand-900">
          管理者ログイン
        </h1>
        <div className="mt-6">
          <AdminLoginForm />
        </div>
        <p className="mt-6 text-center text-sm text-brand-700">
          <Link href="/login/customer" className="underline hover:text-brand-900">
            お客様ログインはこちら
          </Link>
        </p>
        <p className="mt-2 text-center text-sm">
          <Link href="/" className="text-brand-400 hover:text-brand-600">
            トップへ戻る
          </Link>
        </p>
      </div>
    </main>
  );
}
