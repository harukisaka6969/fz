export function Card({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`rounded-2xl border border-brand-100 bg-white p-5 shadow-sm ${className}`}
    >
      {children}
    </div>
  );
}

export function PageHeader({
  title,
  description,
}: {
  title: string;
  description?: string;
}) {
  return (
    <div className="mb-6">
      <h1 className="text-xl font-bold text-brand-900">{title}</h1>
      {description && (
        <p className="mt-1 text-sm text-brand-600">{description}</p>
      )}
    </div>
  );
}

export function EmptyState({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-dashed border-brand-200 bg-white/60 p-8 text-center text-sm text-brand-500">
      {children}
    </div>
  );
}

export function StarRating({ rating }: { rating: number }) {
  return (
    <span className="text-brand-500" aria-label={`評価 ${rating} / 5`}>
      {"★".repeat(rating)}
      <span className="text-brand-200">{"★".repeat(5 - rating)}</span>
    </span>
  );
}

const STATUS_STYLES: Record<string, string> = {
  UNPAID: "bg-amber-100 text-amber-700",
  PAID: "bg-emerald-100 text-emerald-700",
  CANCELED: "bg-neutral-200 text-neutral-600",
};

const STATUS_LABELS: Record<string, string> = {
  UNPAID: "未払い",
  PAID: "支払済み",
  CANCELED: "キャンセル",
};

export function InvoiceStatusBadge({ status }: { status: string }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
        STATUS_STYLES[status] ?? "bg-neutral-100 text-neutral-600"
      }`}
    >
      {STATUS_LABELS[status] ?? status}
    </span>
  );
}

export function SubmitButton({
  children,
  pending,
  className = "",
}: {
  children: React.ReactNode;
  pending?: boolean;
  className?: string;
}) {
  return (
    <button
      type="submit"
      disabled={pending}
      className={`rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white shadow transition hover:bg-brand-700 disabled:opacity-60 ${className}`}
    >
      {pending ? "処理中..." : children}
    </button>
  );
}
