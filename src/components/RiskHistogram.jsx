/**
 * Simple bar chart from API histogram data (flexible shapes).
 */
export function RiskHistogram({ data }) {
  const bars = normalizeHistogram(data)

  if (!bars.length) {
    return (
      <p className="text-sm text-slate-500">
        No histogram data yet. Run a prediction and refresh analytics.
      </p>
    )
  }

  const max = Math.max(...bars.map((b) => b.value), 1)
  const maxBarPx = 168

  return (
    <div className="flex gap-1 sm:gap-2">
      {bars.map((b, i) => {
        const h = Math.round((b.value / max) * maxBarPx)
        return (
          <div
            key={b.label ?? i}
            className="flex min-w-0 flex-1 flex-col items-center justify-end"
          >
            <div
              className="w-full max-w-[3rem] rounded-t-lg bg-slate-800/85 transition-[height]"
              style={{
                height: `${Math.max(h, b.value ? 3 : 0)}px`,
              }}
              title={`${b.label}: ${b.value}`}
            />
            <span className="mt-2 block max-w-full truncate text-center text-[10px] text-slate-500 sm:text-xs">
              {b.label}
            </span>
          </div>
        )
      })}
    </div>
  )
}

function normalizeHistogram(data) {
  if (!data) return []
  if (
    typeof data === 'object' &&
    Array.isArray(data.counts) &&
    Array.isArray(data.edges)
  ) {
    const { counts, edges } = data
    return counts.map((value, i) => {
      const lo = edges[i]
      const hi = edges[i + 1]
      const label =
        lo !== undefined && hi !== undefined
          ? `${Number(lo).toFixed(2)}–${Number(hi).toFixed(2)}`
          : String(i)
      return { label, value: Number(value) || 0 }
    })
  }
  if (Array.isArray(data)) {
    return data.map((item, i) => {
      if (typeof item === 'number') {
        return { label: String(i), value: item }
      }
      if (item && typeof item === 'object') {
        const value = pickNum(item, [
          'count',
          'value',
          'freq',
          'frequency',
          'n',
        ])
        const label = String(
          pickStr(item, ['bin', 'label', 'range', 'bucket']) ?? i,
        )
        return { label, value: value ?? 0 }
      }
      return { label: String(i), value: 0 }
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

function pickNum(obj, keys) {
  for (const k of keys) {
    if (obj[k] !== undefined && obj[k] !== null) return Number(obj[k])
  }
  return undefined
}

function pickStr(obj, keys) {
  for (const k of keys) {
    if (obj[k] !== undefined && obj[k] !== null) return String(obj[k])
  }
  return undefined
}
