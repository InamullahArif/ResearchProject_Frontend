const styles = {
  success: 'bg-emerald-50 text-emerald-900 border-emerald-200',
  error: 'bg-red-50 text-red-900 border-red-200',
  info: 'bg-slate-50 text-slate-900 border-slate-200',
}

/** Presentational only — auto-dismiss timer lives in `Layout` to avoid extra hook surface. */
export function Toast({ toast, onDismiss }) {
  if (!toast) return null

  const variant = styles[toast.variant] ?? styles.info

  return (
    <div
      className={`fixed bottom-6 right-6 z-50 max-w-md rounded-2xl border px-4 py-3 text-sm shadow-md ${variant}`}
      role="alert"
    >
      <div className="flex items-start justify-between gap-3">
        <p className="leading-snug">{toast.message}</p>
        <button
          type="button"
          onClick={onDismiss}
          className="shrink-0 rounded-lg px-2 py-0.5 text-slate-500 hover:bg-black/5"
          aria-label="Dismiss"
        >
          ×
        </button>
      </div>
    </div>
  )
}
