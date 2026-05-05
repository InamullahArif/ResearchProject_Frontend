# FraudGuard — Financial Fraud Detection UI

Production-oriented React console for a Financial Fraud Detection API: dataset upload, batch prediction with analytics, and single-transaction scoring.

## Stack

- **React 19** (Vite 8)
- **Tailwind CSS v4** (`@tailwindcss/vite`)
- **Redux Toolkit** + **React Redux** — global UI state (dataset summary, predictions, analytics, toasts, optional API key). State is **in-memory only**; the API key is **not** written to `localStorage`.
- **Axios** — shared client with `X-API-Key` header when the key is set in Redux
- **React Router** — `Upload`, `Dashboard`, `Single Predict`

## Project layout

```
src/
├── api/           # Axios instance + fraud endpoints
├── components/    # Navbar, layout, charts, tables, toast, etc.
├── pages/         # Upload, Dashboard, SinglePredict
├── hooks/         # useRedux helpers
├── store/         # Redux store + fraudSlice
├── utils/
├── App.jsx
└── main.jsx
```

## Setup

```bash
npm install
npm run dev
```

Dev server defaults to port **3000** (see `vite.config.js`).

## Configuration

| Variable | Description |
|----------|-------------|
| `VITE_API_BASE_URL` | API base URL (default: `http://127.0.0.1:8000`) |

Example:

```bash
VITE_API_BASE_URL=http://127.0.0.1:8000 npm run dev
```

Optional **API key** is entered in the navbar; it is stored in **Redux** and sent as `X-API-Key`. It is cleared when you refresh the page unless you re-enter it.

## API endpoints (expected)

| Method | Path | UI |
|--------|------|-----|
| `POST` | `/upload-dataset` | Upload page |
| `POST` | `/predict` | Dashboard — Run prediction |
| `GET` | `/analytics` | Dashboard — after prediction / refresh |
| `POST` | `/predict-single` | Single Predict page |

## Scripts

- `npm run dev` — Vite dev server
- `npm run build` — production build
- `npm run preview` — preview production build
- `npm run lint` — ESLint

## Redux store

The store is configured in `src/store/index.js`. The `fraud` slice holds:

- `apiKey` — optional `X-API-Key` (trimmed in the Axios interceptor)
- `datasetInfo`, `predictionResult`, `analytics`, `singlePredictResult`
- `toast` — transient notifications

Axios reads `apiKey` via `bindApiKeyReader` in `src/api/client.js` so requests stay in sync with Redux without persisting secrets to the browser storage APIs.
