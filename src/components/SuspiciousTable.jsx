export function SuspiciousTable({ rows }) {
  if (!rows?.length) {
    return (
      <p className="text-sm text-slate-500">No suspicious transactions to show.</p>
    )
  }

  const first = rows[0]
  const keys =
    first && typeof first === 'object' && !Array.isArray(first)
      ? Object.keys(first)
      : ['value']

  return (
    <div className="overflow-x-auto rounded-xl border border-slate-200">
      <table className="w-full min-w-[28rem] text-left text-sm">
        <thead className="bg-slate-50 text-xs font-semibold uppercase text-slate-600">
          <tr>
            {keys.map((k) => (
              <th key={k} className="whitespace-nowrap px-3 py-2">
                {humanizeKey(k)}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {rows.map((row, ri) => (
            <tr key={ri} className="bg-white hover:bg-slate-50/80">
              {keys.map((k) => (
                <td key={k} className="max-w-[12rem] truncate px-3 py-2 tabular-nums text-slate-800">
                  {formatCell(row?.[k])}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function humanizeKey(k) {
  return k.replace(/_/g, ' ')
}

function formatCell(v) {
  if (v === null || v === undefined) return '—'
  if (typeof v === 'number') return Number.isInteger(v) ? v : v.toFixed(4)
  if (typeof v === 'boolean') return v ? 'yes' : 'no'
  if (typeof v === 'object') return JSON.stringify(v)
  return String(v)
}
