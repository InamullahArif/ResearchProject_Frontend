import { createSlice } from '@reduxjs/toolkit'

const initialState = {
  datasetInfo: null,
  health: null,
  predictionResult: null,
  analytics: null,
  singlePredictResult: null,
  toast: null,
}

const fraudSlice = createSlice({
  name: 'fraud',
  initialState,
  reducers: {
    setDatasetInfo(state, action) {
      state.datasetInfo = action.payload ?? null
    },
    setHealth(state, action) {
      state.health = action.payload ?? null
    },
    setPredictionResult(state, action) {
      state.predictionResult = action.payload ?? null
    },
    setAnalytics(state, action) {
      state.analytics = action.payload ?? null
    },
    setSinglePredictResult(state, action) {
      state.singlePredictResult = action.payload ?? null
    },
    showToast(state, action) {
      const { message, variant = 'info' } = action.payload ?? {}
      state.toast = message
        ? { message, variant, id: Date.now() }
        : null
    },
    dismissToast(state) {
      state.toast = null
    },
  },
})

export const {
  setDatasetInfo,
  setHealth,
  setPredictionResult,
  setAnalytics,
  setSinglePredictResult,
  showToast,
  dismissToast,
} = fraudSlice.actions

export default fraudSlice.reducer
