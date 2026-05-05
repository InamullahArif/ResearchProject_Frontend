import { apiClient } from './client.js'

/**
 * POST /upload-dataset — multipart CSV + preset name.
 * @param {File} file
 * @param {'generic'|'paysim'|'uci_creditcard'} preset
 */
export async function uploadDataset(file, preset) {
  const formData = new FormData()
  formData.append('file', file)
  formData.append('preset', preset)

  // Let Axios set multipart boundary (omit Content-Type)
  const { data } = await apiClient.post('/upload-dataset', formData)
  return data
}

/** GET /health — liveness and active model artifact (public). */
export async function fetchHealth() {
  const { data } = await apiClient.get('/health')
  return data
}

/**
 * POST /predict — run batch prediction on uploaded data.
 * @param {{ threshold?: number }} [opts]
 */
export async function runPredict(opts = {}) {
  const { threshold } = opts
  const params =
    threshold !== undefined &&
    threshold !== null &&
    threshold !== '' &&
    !Number.isNaN(Number(threshold))
      ? { threshold: Number(threshold) }
      : undefined
  const { data } = await apiClient.post('/predict', null, { params })
  return data
}

/**
 * GET /analytics — charts and top suspicious rows (after prediction).
 * @param {{ top_k?: number, bins?: number }} [opts]
 */
export async function fetchAnalytics(opts = {}) {
  const { top_k, bins } = opts
  const params = {}
  if (top_k != null && top_k !== '') params.top_k = Number(top_k)
  if (bins != null && bins !== '') params.bins = Number(bins)
  const { data } = await apiClient.get('/analytics', {
    params: Object.keys(params).length ? params : undefined,
  })
  return data
}

/**
 * POST /predict-single — score one transaction.
 * @param {Record<string, unknown>} payload
 * @param {{ explain?: boolean }} [opts]
 */
export async function predictSingle(payload, opts = {}) {
  const { explain = false } = opts
  const { data } = await apiClient.post('/predict-single', payload, {
    params: { explain },
  })
  return data
}
