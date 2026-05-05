import { useCallback, useEffect, useState } from 'react'
import { fetchAnalytics, fetchHealth, runPredict } from '../api/fraudApi.js'
import { API_BASE_URL } from '../api/client.js'
import { FraudDistribution } from '../components/FraudDistribution.jsx'
import { RiskHistogram } from '../components/RiskHistogram.jsx'
import { Spinner } from '../components/Spinner.jsx'
import { StatCard } from '../components/StatCard.jsx'
import { SuspiciousTable } from '../components/SuspiciousTable.jsx'
import { useAppDispatch, useAppSelector } from '../hooks/useRedux.js'
import {
  setAnalytics,
  setHealth,
  setPredictionResult,
  showToast,
} from '../store/fraudSlice.js'
import { getErrorMessage } from '../utils/errorMessage.js'
import {
  normalizeAnalytics,
  normalizeHealth,
  normalizePredictResult,
} from '../utils/normalize.js'

function fmtNum(n, digits = 2) {
  if (n === undefined || n === null || Number.isNaN(Number(n))) return '—'
  return Number(n).toLocaleString(undefined, {
    maximumFractionDigits: digits,
  })
}

function fmtPct(n) {
  if (n === undefined || n === null || Number.isNaN(Number(n))) return '—'
  const v = Number(n)
  const x = v <= 1 && v >= 0 ? v * 100 : v
  return `${fmtNum(x, 2)}%`
}

function shortPath(p) {
  if (p == null || p === '') return '—'
  const s = String(p)
  if (s.length <= 48) return s
  return `…${s.slice(-44)}`
}

export function Dashboard() {
  const predictionResult = useAppSelector((s) => s.fraud.predictionResult)
  const analytics = useAppSelector((s) => s.fraud.analytics)
  const healthRaw = useAppSelector((s) => s.fraud.health)
  const dispatch = useAppDispatch()

  const [loading, setLoading] = useState(false)
  const [analyticsLoading, setAnalyticsLoading] = useState(false)
  const [healthLoading, setHealthLoading] = useState(false)
  const [thresholdInput, setThresholdInput] = useState('')

  const pred = predictionResult
    ? normalizePredictResult(predictionResult)
    : null
  const ax = analytics ? normalizeAnalytics(analytics) : null
  const health = healthRaw ? normalizeHealth(healthRaw) : null

  const loadHealth = useCallback(async () => {
    setHealthLoading(true)
    try {
      const raw = await fetchHealth()
      dispatch(setHealth(raw))
    } catch (e) {
      dispatch(
        showToast({
          message: getErrorMessage(e, 'Could not reach /health.'),
          variant: 'error',
        }),
      )
    } finally {
      setHealthLoading(false)
    }
  }, [dispatch])

  useEffect(() => {
    loadHealth()
  }, [loadHealth])

  const thresholdArg =
    thresholdInput.trim() === '' ? undefined : Number(thresholdInput)

  async function handleRunPrediction() {
    setLoading(true)
    try {
      const raw = await runPredict(
        thresholdArg !== undefined && !Number.isNaN(thresholdArg)
          ? { threshold: thresholdArg }
          : {},
      )
      dispatch(setPredictionResult(raw))
      dispatch(
        showToast({ message: 'Prediction completed.', variant: 'success' }),
      )

      setAnalyticsLoading(true)
      try {
        const a = await fetchAnalytics()
        dispatch(setAnalytics(a))
      } catch (e) {
        dispatch(
          showToast({
            message: getErrorMessage(
              e,
              'Prediction OK, but analytics failed to load.',
            ),
            variant: 'error',
          }),
        )
      } finally {
        setAnalyticsLoading(false)
      }
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

  async function handleRefreshAnalytics() {
    setAnalyticsLoading(true)
    try {
      const a = await fetchAnalytics()
      dispatch(setAnalytics(a))
      dispatch(
        showToast({ message: 'Analytics updated.', variant: 'success' }),
      )
    } catch (err) {
      dispatch(
        showToast({
          message: getErrorMessage(err, 'Could not load analytics.'),
          variant: 'error',
        }),
      )
    } finally {
      setAnalyticsLoading(false)
    }
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
            Dashboard
          </h1>
          <p className="mt-1 text-slate-600">
            Upload a dataset, run batch scoring, then explore risk analytics.
            API base:{' '}
            <span className="font-mono text-sm text-slate-800">
              {API_BASE_URL}
            </span>
          </p>
        </div>
        <div className="flex flex-wrap items-end gap-2">
          <div className="flex flex-col gap-1">
            <label
              htmlFor="threshold"
              className="text-xs font-medium text-slate-500"
            >
              Fraud threshold (optional)
            </label>
            <input
              id="threshold"
              type="number"
              min={0}
              max={1}
              step={0.01}
              placeholder="API default"
              value={thresholdInput}
              onChange={(e) => setThresholdInput(e.target.value)}
              disabled={loading}
              className="w-36 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-200 disabled:opacity-50"
            />
          </div>
          <button
            type="button"
            onClick={handleRunPrediction}
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-medium text-white shadow-md transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? (
              <>
                <Spinner className="size-4 border-white/30 border-t-white" />
                Running…
              </>
            ) : (
              'Run prediction'
            )}
          </button>
          <button
            type="button"
            onClick={handleRefreshAnalytics}
            disabled={analyticsLoading}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-800 shadow-sm hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {analyticsLoading ? (
              <>
                <Spinner />
                Loading…
              </>
            ) : (
              'Refresh analytics'
            )}
          </button>
        </div>
      </div>

      <section className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-md">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-base font-semibold text-slate-900">
            API health
          </h2>
          <button
            type="button"
            onClick={loadHealth}
            disabled={healthLoading}
            className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
          >
            {healthLoading ? <Spinner className="size-3" /> : null}
            Refresh status
          </button>
        </div>
        {healthLoading && !health ? (
          <p className="mt-4 text-sm text-slate-500">Checking /health…</p>
        ) : health ? (
          <dl className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div>
              <dt className="text-xs font-medium uppercase text-slate-500">
                Status
              </dt>
              <dd className="mt-1 font-semibold text-slate-900">
                {health.status ?? '—'}
              </dd>
            </div>
            <div>
              <dt className="text-xs font-medium uppercase text-slate-500">
                Best model
              </dt>
              <dd className="mt-1 font-mono text-sm text-slate-800">
                {health.bestModel ?? '—'}
              </dd>
            </div>
            <div>
              <dt className="text-xs font-medium uppercase text-slate-500">
                Scoring bundle
              </dt>
              <dd className="mt-1 text-slate-800">
                {health.bundleLoaded === true
                  ? 'Loaded'
                  : health.bundleLoaded === false
                    ? 'Not loaded'
                    : '—'}
              </dd>
            </div>
            <div className="sm:col-span-2 lg:col-span-3">
              <dt className="text-xs font-medium uppercase text-slate-500">
                Model artifact
              </dt>
              <dd
                className="mt-1 break-all font-mono text-xs text-slate-700"
                title={health.modelArtifact ? String(health.modelArtifact) : ''}
              >
                {shortPath(health.modelArtifact)}
              </dd>
            </div>
            <div>
              <dt className="text-xs font-medium uppercase text-slate-500">
                API key required
              </dt>
              <dd className="mt-1 text-slate-800">
                {health.apiKeyRequired === true
                  ? 'Yes'
                  : health.apiKeyRequired === false
                    ? 'No'
                    : '—'}
              </dd>
            </div>
            <div className="sm:col-span-2">
              <dt className="text-xs font-medium uppercase text-slate-500">
                Supervised heads (bundle)
              </dt>
              <dd className="mt-1 text-sm text-slate-800">
                {health.supervisedModelsAvailable?.length
                  ? health.supervisedModelsAvailable.join(', ')
                  : '—'}
              </dd>
            </div>
          </dl>
        ) : (
          <p className="mt-4 text-sm text-slate-500">
            No health data yet. Use Refresh status.
          </p>
        )}
      </section>

      {!pred ? (
        <p className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          Run <strong>POST /predict</strong> after uploading a CSV on the Upload
          page to populate summary stats and analytics.
        </p>
      ) : null}

      <section>
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-slate-500">
          Prediction results
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
          <StatCard
            label="Total transactions"
            value={fmtNum(pred?.totalTransactions, 0)}
          />
          <StatCard label="Fraud count" value={fmtNum(pred?.fraudCount, 0)} />
          <StatCard label="Fraud %" value={fmtPct(pred?.fraudPercent)} />
          <StatCard
            label="Avg risk score"
            value={fmtNum(pred?.avgRiskScore, 4)}
          />
          <StatCard
            label="Threshold"
            value={
              pred?.threshold !== undefined && pred?.threshold !== null
                ? fmtNum(pred.threshold, 4)
                : '—'
            }
          />
          <StatCard
            label="Latency / row"
            value={
              pred?.latency !== undefined && pred?.latency !== null
                ? `${fmtNum(pred.latency, 2)} ms`
                : '—'
            }
          />
        </div>
        {(pred?.bestModel || pred?.modelArtifact) && (
          <div className="mt-4 rounded-xl border border-slate-100 bg-slate-50/80 px-4 py-3 text-sm text-slate-700">
            {pred.bestModel ? (
              <p>
                <span className="font-medium text-slate-600">Best model:</span>{' '}
                <span className="font-mono">{String(pred.bestModel)}</span>
              </p>
            ) : null}
            {pred.modelArtifact ? (
              <p className="mt-1 break-all font-mono text-xs text-slate-600">
                {String(pred.modelArtifact)}
              </p>
            ) : null}
          </div>
        )}
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-md">
          <h3 className="text-base font-semibold text-slate-900">
            Risk score histogram
          </h3>
          <p className="mt-1 text-sm text-slate-600">
            From <code className="text-xs">GET /analytics</code> — hybrid risk
            score distribution.
          </p>
          <div className="mt-6">
            <RiskHistogram data={ax?.riskHistogram} />
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-md">
          <h3 className="text-base font-semibold text-slate-900">
            Fraud distribution
          </h3>
          <p className="mt-1 text-sm text-slate-600">
            Ground truth vs predicted rates when labels exist; otherwise
            predicted-only fields from the API.
          </p>
          <div className="mt-6">
            <FraudDistribution data={ax?.fraudDistribution} />
          </div>
        </div>
      </section>

      {ax?.modelFeatureImportance ? (
        <section className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-md">
          <h3 className="text-base font-semibold text-slate-900">
            Model feature importance
          </h3>
          <p className="mt-1 text-sm text-slate-600">
            Tree pipeline importances when exposed by the scoring bundle.
          </p>
          <div className="mt-6">
            <FraudDistribution data={ax.modelFeatureImportance} />
          </div>
        </section>
      ) : null}

      <section className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-md">
        <h3 className="text-base font-semibold text-slate-900">
          Top suspicious transactions
        </h3>
        <p className="mt-1 text-sm text-slate-600">
          Highest-risk rows from the latest{' '}
          <code className="text-xs">GET /analytics</code> payload.
        </p>
        <div className="mt-4">
          <SuspiciousTable rows={ax?.topSuspicious} />
        </div>
      </section>
    </div>
  )
}
