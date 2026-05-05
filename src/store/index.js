import { configureStore } from '@reduxjs/toolkit'
import fraudReducer from './fraudSlice.js'

export const store = configureStore({
  reducer: {
    fraud: fraudReducer,
  },
})
