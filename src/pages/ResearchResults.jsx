import { useCallback, useEffect, useMemo, useState } from 'react'
import { fetchResearchSummary } from '../api/fraudApi.js'
import { Spinner } from '../components/Spinner.jsx'
import { StatCard } from '../components/StatCard.jsx'
import { getErrorMessage } from '../utils/errorMessage.js'

/* ------------------------------------------------------------------ formatting */
const mean = (v) => (Array.isArray(v) ? v[0] : v)
const sd = (v) => (Array.isArray(v) ? v[1] : null)

function fmt(v, digits = 3) {
  const m = mean(v)
  if (m === undefined || m === null || Number.isNaN(Number(m))) return '—'
  const s = sd(v)
  return s === null || s === undefined
    ? Number(m).toFixed(digits)
    : `${Number(m).toFixed(digits)} ± ${Number(s).toFixed(digits)}`
}

const fmtPct = (v, digits = 3) =>
  mean(v) === undefined || mean(v) === null ? '—' : `${(100 * mean(v)).toFixed(digits)}%`

const fmtInt = (v) =>
  v === undefined || v === null ? '—' : Math.round(Number(v)).toLocaleString()

const MODEL_LABELS = {
  'Gradient Boosting (HistGB)': 'Gradient boosting',
  'Proposed Hybrid Framework': 'Hybrid framework',
}
const label = (n) => MODEL_LABELS[n] ?? n

/* ------------------------------------------------------------------ building blocks */
function Card({ title, subtitle, children }) {
  return (
    <section className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-md">
      <h2 className="text-base font-semibold text-slate-900">{title}</h2>
      {subtitle ? <p className="mt-1 text-sm text-slate-500">{subtitle}</p> : null}
      <div className="mt-4">{children}</div>
    </section>
  )
}

/** Horizontal bars for a [0,1] metric, with the ± sd shown as text. */
function BarList({ items, metric = 'pr_auc', highlight }) {
  const max = Math.max(...items.map((i) => mean(i[metric]) ?? 0), 0.0001)
  return (
    <div className="space-y-2">
      {items.map((it) => {
        const m = mean(it[metric]) ?? 0
        const isHi = highlight && highlight(it)
        return (
          <div key={it.name} className="flex items-center gap-3 text-sm">
            <span className="w-48 shrink-0 truncate text-slate-700" title={it.name}>
              {label(it.name)}
            </span>
            <div className="h-3 min-w-0 flex-1 rounded-full bg-slate-100">
              <div
                className={`h-3 rounded-full ${isHi ? 'bg-emerald-600' : 'bg-slate-700/80'}`}
                style={{ width: `${Math.max((m / Math.max(max, 1)) * 100, 1)}%` }}
                title={`${it.name}: ${fmt(it[metric])}`}
              />
            </div>
            <span className="w-32 shrink-0 text-right tabular-nums text-slate-600">{fmt(it[metric])}</span>
          </div>
        )
      })}
    </div>
  )
}

function MetricTable({ rows, columns }) {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full text-left text-sm">
        <thead>
          <tr className="border-b border-slate-200 text-xs uppercase tracking-wide text-slate-500">
            <th className="py-2 pr-4 font-medium">Configuration</th>
            {columns.map((c) => (
              <th key={c.key} className="py-2 pr-4 font-medium">
                {c.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.name} className="border-b border-slate-100 last:border-0">
              <td className="py-2 pr-4 text-slate-800">{label(r.name)}</td>
              {columns.map((c) => (
                <td key={c.key} className="whitespace-nowrap py-2 pr-4 tabular-nums text-slate-700">
                  {c.render ? c.render(r[c.key], r) : fmt(r[c.key])}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

const DETECTION_COLS = [
  { key: 'precision', label: 'Precision' },
  { key: 'recall', label: 'Recall' },
  { key: 'f1', label: 'F1' },
  { key: 'pr_auc', label: 'PR-AUC' },
  { key: 'fpr', label: 'FPR', render: (v) => fmtPct(v) },
]
const FULL_COLS = [
  ...DETECTION_COLS.slice(0, 3),
  { key: 'roc_auc', label: 'ROC-AUC' },
  ...DETECTION_COLS.slice(3),
  { key: 'latency_ms', label: 'ms / txn', render: (v) => (mean(v) == null ? '—' : mean(v).toFixed(2)) },
  { key: 'throughput_tps', label: 'txn / s', render: (v) => fmtInt(mean(v)) },
]

/* ------------------------------------------------------------------ page */
export function ResearchResults() {
  const [summary, setSummary] = useState(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)
  const [ds, setDs] = useState('creditcard')

  const load = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const data = await fetchResearchSummary()
      setSummary(data)
      const keys = Object.keys(data?.datasets ?? {})
      if (keys.length && !keys.includes(ds)) setDs(keys[0])
    } catch (e) {
      setError(getErrorMessage(e, 'Could not load research results.'))
    } finally {
      setLoading(false)
    }
  }, [ds])

  useEffect(() => {
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const d = summary?.datasets?.[ds]
  const best = useMemo(() => {
    if (!d?.models) return null
    return [...d.models]
      .filter((m) => m.name !== 'Proposed Hybrid Framework')
      .sort((a, b) => mean(b.pr_auc) - mean(a.pr_auc))[0]
  }, [d])

  if (loading) {
    return (
      <div className="flex items-center gap-3 text-slate-600">
        <Spinner /> Loading research results…
      </div>
    )
  }
  if (error) {
    return (
      <div className="rounded-2xl border border-rose-200 bg-rose-50 p-6 text-sm text-rose-800">
        <p className="font-medium">{error}</p>
        <p className="mt-2">
          Make sure the backend is running and that <code>results/summary.json</code> exists
          (run <code>python experiments/build_summary.py results</code> in the backend folder).
        </p>
        <button
          onClick={load}
          className="mt-4 rounded-xl bg-slate-900 px-4 py-2 text-white hover:bg-slate-800"
        >
          Retry
        </button>
      </div>
    )
  }
  if (!d) return <p className="text-slate-600">No results available.</p>

  const fraudRate = d.transactions ? d.fraud / d.transactions : null
  const hybridAllSupervised = (d.hybrid_weights ?? []).every(
    (w) => Array.isArray(w) && w[0] === 1 && w[1] === 0 && w[2] === 0,
  )

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Research results</h1>
          <p className="mt-1 text-sm text-slate-500">
            Experiments from the paper. Mean ± standard deviation over {d.n_splits ?? 5} stratified
            70/15/15 splits; thresholds and weights chosen on validation data.
          </p>
        </div>
        <div className="flex rounded-xl border border-slate-200 bg-white p-1 shadow-sm">
          {Object.entries(summary.datasets).map(([key, v]) => (
            <button
              key={key}
              onClick={() => setDs(key)}
              className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
                ds === key ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              {v.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Transactions evaluated" value={fmtInt(d.transactions)} sub={`${fmtInt(d.fraud)} fraudulent`} />
        <StatCard label="Fraud rate" value={fraudRate == null ? '—' : `${(100 * fraudRate).toFixed(2)}%`} />
        <StatCard label="Best model (PR-AUC)" value={best ? fmt(best.pr_auc) : '—'} sub={best ? label(best.name) : ''} />
        <StatCard
          label="Best model latency"
          value={best?.latency_ms ? `${mean(best.latency_ms).toFixed(2)} ms` : '—'}
          sub="median per transaction, 1 CPU thread"
        />
      </div>

      <Card
        title="Model comparison"
        subtitle="PR-AUC is the main metric for highly imbalanced fraud data."
      >
        <BarList
          items={d.models}
          highlight={(it) => best && it.name === best.name}
        />
        {hybridAllSupervised ? (
          <p className="mt-4 rounded-xl bg-amber-50 p-3 text-sm text-amber-900">
            Validation-selected hybrid weights were α = 1, β = 0, γ = 0 in every split: adding the
            anomaly and deviation scores to the supervised probability never improved results, so the
            hybrid equals gradient boosting.
          </p>
        ) : null}
        <div className="mt-5">
          <MetricTable rows={d.models} columns={FULL_COLS} />
        </div>
      </Card>

      {d.ablation ? (
        <Card title="Ablation study" subtitle="Contribution of each component (gradient boosting base learner).">
          <BarList items={d.ablation} />
          <div className="mt-5">
            <MetricTable rows={d.ablation} columns={DETECTION_COLS} />
          </div>
        </Card>
      ) : null}

      {d.behaviour_cost_sensitive ? (
        <Card
          title="Effect of behavioural features"
          subtitle="Receiver-account features (earlier transactions, 24-hour velocity, amount deviation, new account)."
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <StatCard
              label="Without behavioural features"
              value={fmt(d.behaviour_cost_sensitive.no_behaviour)}
              sub="PR-AUC, cost-sensitive gradient boosting"
            />
            <StatCard
              label="With behavioural features"
              value={fmt(d.behaviour_cost_sensitive.with_behaviour)}
              sub="PR-AUC, cost-sensitive gradient boosting"
            />
          </div>
        </Card>
      ) : null}

      {d.imbalance ? (
        <Card title="Class imbalance strategies" subtitle="Same base learner and features; only the imbalance strategy changes.">
          <MetricTable rows={d.imbalance} columns={DETECTION_COLS} />
        </Card>
      ) : null}

      {d.temporal ? (
        <Card
          title="Time-ordered evaluation"
          subtitle={`Trained on the earliest 70% of transactions and tested on the latest 15% (fraud rate ${(
            100 * d.temporal.fraud_rate.train
          ).toFixed(2)}% in training vs ${(100 * d.temporal.fraud_rate.test).toFixed(2)}% in test). Mean ± sd over 3 model seeds.`}
        >
          <BarList items={d.temporal.models} />
          <div className="mt-5">
            <MetricTable rows={d.temporal.models} columns={[...DETECTION_COLS.slice(0, 3), { key: 'roc_auc', label: 'ROC-AUC' }, ...DETECTION_COLS.slice(3)]} />
          </div>
        </Card>
      ) : null}

      {d.anomaly_feature ? (
        <Card
          title="Anomaly scores as model inputs"
          subtitle="Instead of adding anomaly scores to the model's output, they are given to gradient boosting as extra features."
        >
          <MetricTable rows={d.anomaly_feature.variants} columns={DETECTION_COLS} />
        </Card>
      ) : null}

      {d.tuning ? (
        <Card title="Hyperparameter tuning" subtitle="Gradient boosting tuned on validation PR-AUC (12 configurations) vs the default settings.">
          <MetricTable
            rows={[
              { ...d.tuning.default, name: 'Default settings' },
              { ...d.tuning.tuned, name: 'Tuned on validation' },
            ]}
            columns={DETECTION_COLS}
          />
        </Card>
      ) : null}

      {d.importance ? (
        <Card title="Most important features" subtitle="Permutation importance for gradient boosting (drop in validation PR-AUC).">
          <BarList
            items={d.importance.map((f) => ({ name: f.feature, pr_auc: [Math.max(f.value, 0), null] }))}
          />
        </Card>
      ) : null}

      {d.leakage_pr_auc ? (
        <p className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
          Note: with PaySim's balance columns included, PR-AUC rises to {fmt(d.leakage_pr_auc)}. The dataset's
          documentation says these columns leak the fraud label, so they are excluded from all results above.
        </p>
      ) : null}

      <p className="text-xs text-slate-400">Results generated {summary.generated_at}.</p>
    </div>
  )
}
