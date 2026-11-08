# FraudGuard — Financial Fraud Detection UI

React console for the Financial Fraud Detection API ([ResearchProject_Backend](https://github.com/InamullahArif/ResearchProject_Backend)): dataset upload, batch prediction with analytics, single-transaction scoring, and a **Research Results** page presenting the evaluation from the paper *A Machine Learning-Based Real-Time Financial Fraud Detection Framework for Digital Transaction Monitoring*.

## Stack

- **React 19** (Vite 8)
- **Tailwind CSS v4** (`@tailwindcss/vite`)
- **Redux Toolkit** + **React Redux** — global UI state (dataset summary, predictions, analytics, toasts). State is **in-memory only**.
- **Axios** — shared client; sends the `X-API-Key` header when `VITE_FRAUD_API_KEY` is set
- **React Router** — `Upload`, `Dashboard`, `Single Predict`, `Research Results`

## Project layout

```
src/
├── api/           # Axios instance + fraud endpoints
├── components/    # Navbar, layout, charts, tables, toast, etc.
├── pages/         # Upload, Dashboard, SinglePredict, ResearchResults
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
| `VITE_FRAUD_API_KEY` | Optional; sent as `X-API-Key` if the backend sets `FRAUD_API_KEY` |

Example:

```bash
VITE_API_BASE_URL=http://127.0.0.1:8000 npm run dev
```

Put these in a `.env` file in the project root (not committed).

## API endpoints (expected)

| Method | Path | UI |
|--------|------|-----|
| `POST` | `/upload-dataset` | Upload page |
| `POST` | `/predict` | Dashboard — Run prediction |
| `GET` | `/analytics` | Dashboard — after prediction / refresh |
| `POST` | `/predict-single` | Single Predict page |
| `GET` | `/research/summary` | Research Results page |

## Research Results page

`/research` shows the paper's experiments for the credit card and PaySim datasets: model comparison (precision, recall, F1, ROC-AUC, PR-AUC, false positive rate, latency, throughput), ablation, behavioural-feature effect, class imbalance strategies, time-ordered evaluation, anomaly scores as model inputs, hyperparameter tuning and feature importance. The data comes from the backend's `results/summary.json`, served at `GET /research/summary`. The page shows saved results and doesn't re-run experiments; see the backend's `experiments/README.md` to regenerate them.

## Scripts

- `npm run dev` — Vite dev server
- `npm run build` — production build
- `npm run preview` — preview production build
- `npm run lint` — ESLint

## Redux store

The store is configured in `src/store/index.js`. The `fraud` slice holds:

- `datasetInfo`, `predictionResult`, `analytics`, `singlePredictResult`
- `toast` — transient notifications

## License

Released under the [MIT License](LICENSE).
