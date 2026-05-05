import { useDispatch, useSelector } from 'react-redux'

/** Typed-ish helpers for this app’s single store shape. */
export function useAppDispatch() {
  return useDispatch()
}

export function useAppSelector(selector) {
  return useSelector(selector)
}
