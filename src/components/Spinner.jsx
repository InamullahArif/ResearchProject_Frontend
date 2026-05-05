export function Spinner({ className = '' }) {
  return (
    <span
      className={`inline-block size-4 animate-spin rounded-full border-2 border-slate-300 border-t-slate-700 ${className}`}
      role="status"
      aria-label="Loading"
    />
  )
}
