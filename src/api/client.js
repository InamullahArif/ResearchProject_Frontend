import axios from 'axios'

/** Base URL for the Fraud Detection API (override with VITE_API_BASE_URL). */
export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ?? 'http://127.0.0.1:8000'

/** When set, sent as `X-API-Key` on requests (matches backend `FRAUD_API_KEY`). */
export const FRAUD_API_KEY = import.meta.env.VITE_FRAUD_API_KEY ?? ''

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 120_000,
  headers: {
    Accept: 'application/json',
  },
})

if (FRAUD_API_KEY) {
  apiClient.defaults.headers.common['X-API-Key'] = FRAUD_API_KEY
}
