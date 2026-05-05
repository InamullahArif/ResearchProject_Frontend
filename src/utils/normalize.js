/** Normalize GET /health response. */
export function normalizeHealth(raw) {
  const supervised = pick(raw, [
    'supervised_models_available',
    'supervisedModelsAvailable',
  ])
  return {
    status: pick(raw, ['status']),
    bestModel: pick(raw, ['best_model', 'bestModel']),
    bundleLoaded: pick(raw, ['bundle_loaded', 'bundleLoaded']),
    modelArtifact: pick(raw, ['model_artifact', 'modelArtifact']),
    apiKeyRequired: pick(raw, ['api_key_required', 'apiKeyRequired']),
    supervisedModelsAvailable: Array.isArray(supervised) ? supervised : [],
    raw,
  }
}

/** Pick first defined value from object keys (snake_case / camelCase tolerant). */
export function pick(obj, keys, fallback = undefined) {
  if (!obj || typeof obj !== 'object') return fallback
  for (const k of keys) {
    if (obj[k] !== undefined && obj[k] !== null) return obj[k]
  }
  return fallback
}

/** Normalize upload-dataset API response for the UI. */
export function normalizeUploadInfo(raw) {
  return {
    rowsCount: pick(raw, ['rows', 'rows_count', 'rowsCount', 'row_count', 'n_rows']),
    columns: pick(raw, ['columns', 'column_names', 'cols']),
    hasTarget: pick(raw, ['has_target', 'hasTarget', 'target']),
    raw,
  }
}

/** Normalize POST /predict response. */
export function normalizePredictResult(raw) {
  const total = pick(raw, [
    'total_transactions',
    'totalTransactions',
    'n_transactions',
    'total',
  ])
  const fraudCount = pick(raw, ['fraud_count', 'fraudCount', 'frauds'])
  const fraudPct = pick(raw, ['fraud_percent', 'fraudPercent', 'fraud_percentage'])
  const avgRisk = pick(raw, [
    'average_risk_score',
    'avg_risk_score',
    'avgRiskScore',
    'average_risk',
  ])
  const latency = pick(raw, [
    'avg_latency_ms_per_row',
    'latency',
    'latency_ms',
    'latencyMs',
    'inference_ms',
  ])
  const threshold = pick(raw, ['threshold', 'alert_threshold', 'alertThreshold'])
  const modelArtifact = pick(raw, ['model_artifact', 'modelArtifact'])
  const bestModel = pick(raw, ['best_model', 'bestModel'])

  return {
    totalTransactions: total,
    fraudCount,
    fraudPercent: fraudPct,
    avgRiskScore: avgRisk,
    latency,
    threshold,
    modelArtifact,
    bestModel,
    raw,
  }
}

/** Normalize GET /analytics response. */
export function normalizeAnalytics(raw) {
  const histogram = pick(raw, [
    'risk_histogram',
    'riskHistogram',
    'histogram',
    'risk_score_histogram',
  ])
  const fraudDistribution = pick(raw, [
    'fraud_distribution',
    'fraudDistribution',
    'distribution',
  ])
  const topSuspicious = pick(raw, [
    'top_suspicious',
    'top_suspicious_transactions',
    'topSuspicious',
    'suspicious',
  ])
  const modelFeatureImportance = pick(raw, [
    'model_feature_importance',
    'modelFeatureImportance',
    'feature_importance',
  ])

  return {
    riskHistogram: histogram ?? null,
    fraudDistribution: fraudDistribution ?? null,
    topSuspicious: Array.isArray(topSuspicious) ? topSuspicious : [],
    modelFeatureImportance:
      modelFeatureImportance && typeof modelFeatureImportance === 'object'
        ? modelFeatureImportance
        : null,
    raw,
  }
}

/** Normalize POST /predict-single response. */
export function normalizeSinglePredict(raw) {
  return {
    fraudProbability: pick(raw, [
      'fraud_probability',
      'fraudProbability',
      'probability',
      'score',
    ]),
    mlProbability: pick(raw, ['ml_probability', 'mlProbability']),
    anomalyScore: pick(raw, ['anomaly_score', 'anomalyScore']),
    label: pick(raw, ['label', 'prediction', 'class']),
    riskLevel: pick(raw, ['risk_level', 'riskLevel', 'severity']),
    latency: pick(raw, ['latency', 'latency_ms', 'latencyMs']),
    modelArtifact: pick(raw, ['model_artifact', 'modelArtifact']),
    featureImportance: pick(raw, ['feature_importance', 'featureImportance']),
    shapExplanations: pick(raw, ['shap_explanations', 'shapExplanations']),
    raw,
  }
}
