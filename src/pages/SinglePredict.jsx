import { useState } from 'react'
import { predictSingle } from '../api/fraudApi.js'
import { StatCard } from '../components/StatCard.jsx'
import { Spinner } from '../components/Spinner.jsx'
import { useAppDispatch } from '../hooks/useRedux.js'
import { setSinglePredictResult, showToast } from '../store/fraudSlice.js'
import { getErrorMessage } from '../utils/errorMessage.js'
import { normalizeSinglePredict } from '../utils/normalize.js'

const initialForm = {
  timestamp: '',
  user_id: '',
  amount: '',
  merchant: '',
  channel: '',
  category: '',
  location: '',
  device_type: '',
}

function fmtProb(n) {
  if (n === undefined || n === null || Number.isNaN(Number(n))) return '—'
  const v = Number(n)
  const x = v <= 1 && v >= 0 ? v * 100 : v
  return `${x.toFixed(2)}%`
}

function fmtScore(n, digits = 4) {
  if (n === undefined || n === null || Number.isNaN(Number(n))) return '—'
  return Number(n).toLocaleString(undefined, { maximumFractionDigits: digits })
}

export function SinglePredict() {
  const dispatch = useAppDispatch()
  const [form, setForm] = useState(initialForm)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [explain, setExplain] = useState(false)

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }))
  }

  function buildPayload() {
    const payload = {
      timestamp: form.timestamp.trim(),
      user_id: form.user_id.trim(),
    }

    const amt = form.amount.trim()
    const n = Number(amt)
    payload.amount = Number.isNaN(n) ? amt : n

    const optional = [
      'merchant',
      'channel',
      'category',
      'location',
      'device_type',
    ]
    for (const k of optional) {
      const v = form[k].trim()
      if (v) payload[k] = v
    }

    return payload
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!form.timestamp.trim() || !form.user_id.trim() || !form.amount.trim()) {
      dispatch(
        showToast({
          message: 'Timestamp, user ID, and amount are required.',
          variant: 'error',
        }),
      )
      return
    }

    const payload = buildPayload()
    if (typeof payload.amount !== 'number' || Number.isNaN(payload.amount)) {
      dispatch(
        showToast({ message: 'Amount must be a valid number.', variant: 'error' }),
      )
      return
    }

    setLoading(true)
    try {
      const raw = await predictSingle(payload, { explain })
      setResult(raw)
      dispatch(setSinglePredictResult(raw))
      dispatch(
        showToast({ message: 'Prediction complete.', variant: 'success' }),
      )
    } catch (err) {
      dispatch(
        showToast({
          message: getErrorMessage(err, 'Prediction failed.'),
          variant: 'error',
        }),
      )
    } finally {
      setLoading(false)
    }
  }

  const out = result ? normalizeSinglePredict(result) : null

  const labelDisplay =
    out?.label !== undefined && out?.label !== null
      ? String(out.label).toLowerCase() === 'fraud' ||
        String(out.label) === '1'
        ? 'Fraud'
        : String(out.label).toLowerCase() === 'legitimate' ||
            String(out.label) === '0'
          ? 'Legitimate'
          : String(out.label)
      : '—'

  const fi = out?.featureImportance
  const fiEntries =
    fi && typeof fi === 'object' && !Array.isArray(fi)
      ? Object.entries(fi)
      : []
  const shap = out?.shapExplanations
  const shapList = Array.isArray(shap) ? shap : []

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
          Single prediction
        </h1>
        <p className="mt-1 text-slate-600">
          Calls <code className="text-xs">POST /predict-single</code> with a JSON
          body. Hybrid score combines supervised probability and anomaly signal.
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-md"
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <Field
            label="Timestamp"
            name="timestamp"
            placeholder="e.g. 2024-01-15T10:30:00"
            value={form.timestamp}
            onChange={(v) => update('timestamp', v)}
            disabled={loading}
            required
          />
          <Field
            label="User ID"
            name="user_id"
            placeholder="e.g. user_42"
            value={form.user_id}
            onChange={(v) => update('user_id', v)}
            disabled={loading}
            required
          />
          <Field
            label="Amount"
            name="amount"
            type="text"
            inputMode="decimal"
            placeholder="e.g. 120.50"
            value={form.amount}
            onChange={(v) => update('amount', v)}
            disabled={loading}
            required
          />
          <Field
            label="Merchant"
            name="merchant"
            placeholder="Optional"
            value={form.merchant}
            onChange={(v) => update('merchant', v)}
            disabled={loading}
          />
          <Field
            label="Channel"
            name="channel"
            placeholder="e.g. online, pos"
            value={form.channel}
            onChange={(v) => update('channel', v)}
            disabled={loading}
          />
          <Field
            label="Category"
            name="category"
            placeholder="Optional"
            value={form.category}
            onChange={(v) => update('category', v)}
            disabled={loading}
          />
          <Field
            label="Location"
            name="location"
            placeholder="Optional"
            value={form.location}
            onChange={(v) => update('location', v)}
            disabled={loading}
          />
          <Field
            label="Device type"
            name="device_type"
            placeholder="Optional"
            value={form.device_type}
            onChange={(v) => update('device_type', v)}
            disabled={loading}
          />
        </div>

        <div className="mt-6 flex flex-wrap items-center gap-4">
          <label className="inline-flex cursor-pointer items-center gap-2 text-sm text-slate-800">
            <input
              type="checkbox"
              checked={explain}
              onChange={(e) => setExplain(e.target.checked)}
              disabled={loading}
              className="size-4 rounded border-slate-300 text-slate-900 focus:ring-slate-300"
            />
            Explain (<code className="text-xs">explain=true</code>) — SHAP /
            importances when the bundle supports it
          </label>
        </div>

        <div className="mt-6">
          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-medium text-white shadow-md transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? (
              <>
                <Spinner className="size-4 border-white/30 border-t-white" />
                Scoring…
              </>
            ) : (
              'Submit'
            )}
          </button>
        </div>
      </form>

      {out ? (
        <>
          <section>
            <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-slate-500">
              Result
            </h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6">
              <StatCard
                label="Fraud probability (hybrid)"
                value={fmtProb(out.fraudProbability)}
              />
              <StatCard label="ML probability" value={fmtProb(out.mlProbability)} />
              <StatCard
                label="Anomaly score"
                value={fmtScore(out.anomalyScore, 4)}
              />
              <StatCard label="Label" value={labelDisplay} />
              <StatCard
                label="Risk level"
                value={
                  out.riskLevel !== undefined && out.riskLevel !== null
                    ? String(out.riskLevel)
                    : '—'
                }
              />
              <StatCard
                label="Latency"
                value={
                  out.latency !== undefined && out.latency !== null
                    ? `${fmtScore(out.latency, 3)} ms`
                    : '—'
                }
              />
            </div>
            {out.modelArtifact ? (
              <p className="mt-4 break-all font-mono text-xs text-slate-600">
                <span className="font-sans font-medium text-slate-700">
                  Model artifact:{' '}
                </span>
                {String(out.modelArtifact)}
              </p>
            ) : null}
          </section>

          {fiEntries.length > 0 ? (
            <section className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-md">
              <h3 className="text-base font-semibold text-slate-900">
                Feature importance
              </h3>
              <ul className="mt-4 max-h-48 space-y-2 overflow-y-auto text-sm">
                {fiEntries.map(([k, v]) => (
                  <li
                    key={k}
                    className="flex justify-between gap-4 border-b border-slate-100 pb-2"
                  >
                    <span className="font-mono text-slate-800">{k}</span>
                    <span className="tabular-nums text-slate-600">
                      {fmtScore(v, 6)}
                    </span>
                  </li>
                ))}
              </ul>
            </section>
          ) : null}

          {shapList.length > 0 ? (
            <section className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-md">
              <h3 className="text-base font-semibold text-slate-900">
                SHAP-style explanations
              </h3>
              <pre className="mt-4 max-h-64 overflow-auto rounded-xl bg-slate-50 p-4 text-xs text-slate-800">
                {JSON.stringify(shapList, null, 2)}
              </pre>
            </section>
          ) : null}
        </>
      ) : null}
    </div>
  )
}

function Field({
  label,
  name,
  value,
  onChange,
  disabled,
  type = 'text',
  placeholder,
  inputMode,
  className = '',
  required = false,
}) {
  return (
    <div className={className}>
      <label
        htmlFor={name}
        className="mb-1 block text-sm font-medium text-slate-800"
      >
        {label}
        {required ? <span className="text-rose-600"> *</span> : null}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        inputMode={inputMode}
        placeholder={placeholder}
        value={value}
        required={required}
        disabled={disabled}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-200 disabled:opacity-50"
      />
    </div>
  )
}
