import { useState } from 'react'
import { uploadDataset } from '../api/fraudApi.js'
import { useAppDispatch } from '../hooks/useRedux.js'
import { setDatasetInfo, showToast } from '../store/fraudSlice.js'
import { getErrorMessage } from '../utils/errorMessage.js'
import { normalizeUploadInfo } from '../utils/normalize.js'
import { Spinner } from '../components/Spinner.jsx'

const PRESETS = [
  { value: 'generic', label: 'Generic' },
  { value: 'paysim', label: 'PaySim' },
  { value: 'uci_creditcard', label: 'UCI Credit Card' },
]

function formatColumns(cols) {
  if (!cols) return '—'
  if (Array.isArray(cols)) return cols.join(', ')
  if (typeof cols === 'object') return Object.keys(cols).join(', ')
  return String(cols)
}

export function Upload() {
  const dispatch = useAppDispatch()
  const [file, setFile] = useState(null)
  const [preset, setPreset] = useState('generic')
  const [loading, setLoading] = useState(false)
  const [info, setInfo] = useState(null)

  async function handleSubmit(e) {
    e.preventDefault()
    if (!file) {
      dispatch(showToast({ message: 'Choose a CSV file first.', variant: 'error' }))
      return
    }

    setLoading(true)
    try {
      const raw = await uploadDataset(file, preset)
      const normalized = normalizeUploadInfo(raw)
      setInfo(normalized)
      dispatch(setDatasetInfo(normalized))
      dispatch(
        showToast({ message: 'Dataset uploaded successfully.', variant: 'success' }),
      )
    } catch (err) {
      dispatch(
        showToast({
          message: getErrorMessage(err, 'Upload failed.'),
          variant: 'error',
        }),
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
          Upload dataset
        </h1>
        <p className="mt-1 text-slate-600">
          Send a CSV to the API and choose a column preset for preprocessing.
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-md"
      >
        <div className="grid gap-6 sm:grid-cols-2">
          <div className="space-y-2">
            <label
              htmlFor="csv"
              className="text-sm font-medium text-slate-800"
            >
              CSV file
            </label>
            <input
              id="csv"
              name="file"
              type="file"
              accept=".csv,text/csv"
              disabled={loading}
              onChange={(e) => {
                setFile(e.target.files?.[0] ?? null)
                setInfo(null)
              }}
              className="block w-full cursor-pointer rounded-xl border border-dashed border-slate-300 bg-slate-50/80 px-3 py-8 text-sm file:mr-4 file:rounded-lg file:border-0 file:bg-slate-900 file:px-4 file:py-2 file:text-sm file:font-medium file:text-white hover:border-slate-400 disabled:opacity-50"
            />
          </div>

          <div className="space-y-2">
            <label
              htmlFor="preset"
              className="text-sm font-medium text-slate-800"
            >
              Preset
            </label>
            <select
              id="preset"
              value={preset}
              disabled={loading}
              onChange={(e) => setPreset(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-200 disabled:opacity-50"
            >
              {PRESETS.map((p) => (
                <option key={p.value} value={p.value}>
                  {p.label}
                </option>
              ))}
            </select>
            <p className="text-xs text-slate-500">
              Matches backend presets: generic, paysim, uci_creditcard.
            </p>
          </div>
        </div>

        <div className="mt-6 flex items-center gap-3">
          <button
            type="submit"
            disabled={loading || !file}
            className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-medium text-white shadow-md transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? (
              <>
                <Spinner className="size-4 border-white/30 border-t-white" />
                Uploading…
              </>
            ) : (
              'Upload dataset'
            )}
          </button>
        </div>
      </form>

      {info ? (
        <section className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-md">
          <h2 className="text-lg font-semibold text-slate-900">
            Dataset summary
          </h2>
          <dl className="mt-4 grid gap-4 sm:grid-cols-3">
            <div>
              <dt className="text-xs font-medium uppercase text-slate-500">
                Rows
              </dt>
              <dd className="mt-1 text-xl font-semibold tabular-nums text-slate-900">
                {info.rowsCount ?? '—'}
              </dd>
            </div>
            <div className="sm:col-span-2">
              <dt className="text-xs font-medium uppercase text-slate-500">
                Columns
              </dt>
              <dd className="mt-1 break-words text-sm text-slate-800">
                {formatColumns(info.columns)}
              </dd>
            </div>
            <div>
              <dt className="text-xs font-medium uppercase text-slate-500">
                Has target
              </dt>
              <dd className="mt-1 text-xl font-semibold text-slate-900">
                {info.hasTarget === undefined || info.hasTarget === null
                  ? '—'
                  : typeof info.hasTarget === 'boolean'
                    ? info.hasTarget
                      ? 'Yes'
                      : 'No'
                    : String(info.hasTarget)}
              </dd>
            </div>
          </dl>
        </section>
      ) : null}
    </div>
  )
}
