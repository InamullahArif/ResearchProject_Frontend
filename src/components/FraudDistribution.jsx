export function FraudDistribution({ data }) {
  const entries = normalizeDistribution(data)

  if (!entries.length) {
    return (
      <p className="text-sm text-slate-500">No distribution data available.</p>
    )
  }

  const max = Math.max(...entries.map((e) => e.value), 1)
  const palette = ['bg-emerald-500', 'bg-rose-500', 'bg-amber-500', 'bg-slate-500']

  return (
    <ul className="space-y-3">
      {entries.map((e, i) => (
        <li key={e.label}>
          <div className="mb-1 flex justify-between text-sm">
            <span className="font-medium text-slate-800">{e.label}</span>
            <span className="tabular-nums text-slate-600">{e.value}</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-slate-100">
            <div
              className={`h-full rounded-full ${palette[i % palette.length]}`}
              style={{ width: `${(e.value / max) * 100}%` }}
            />
          </div>
        </li>
      ))}
    </ul>
  )
}

function normalizeDistribution(data) {
  if (!data) return []
  if (Array.isArray(data)) {
    return data.map((item, i) => {
      if (item && typeof item === 'object') {
        const label = String(item.label ?? item.name ?? item.key ?? i)
        const value = Number(item.count ?? item.value ?? item.n ?? 0)
        return { label, value }
      }
      return { label: String(i), value: Number(item) || 0 }
    })
  }
  if (typeof data === 'object') {
    return Object.entries(data).map(([label, v]) => ({
      label,
      value: typeof v === 'number' ? v : Number(v) || 0,
    }))
  }
  return []
}
