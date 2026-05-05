export function StatCard({ label, value, sub }) {
  return (
    <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-md">
      <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
        {label}
      </p>
      <p className="mt-2 text-2xl font-semibold tabular-nums text-slate-900">
        {value ?? '—'}
      </p>
      {sub ? (
        <p className="mt-1 text-xs text-slate-500">{sub}</p>
      ) : null}
    </div>
  )
}
