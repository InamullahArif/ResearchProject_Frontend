import { useCallback, useEffect } from 'react'
import { Navbar } from './Navbar.jsx'
import { Toast } from './Toast.jsx'
import { dismissToast } from '../store/fraudSlice.js'
import { useAppDispatch, useAppSelector } from '../hooks/useRedux.js'

export function Layout({ children }) {
  const toast = useAppSelector((s) => s.fraud.toast)
  const dispatch = useAppDispatch()

  const onDismissToast = useCallback(() => {
    dispatch(dismissToast())
  }, [dispatch])

  useEffect(() => {
    if (!toast) return
    const t = setTimeout(onDismissToast, 6000)
    return () => clearTimeout(t)
  }, [toast, onDismissToast])

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 text-slate-900">
      <Navbar />
      <main className="mx-auto max-w-6xl px-4 py-8">{children}</main>
      <Toast toast={toast} onDismiss={onDismissToast} />
    </div>
  )
}
