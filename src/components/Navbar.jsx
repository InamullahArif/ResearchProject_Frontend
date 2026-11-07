import { NavLink } from 'react-router-dom'

const linkClass = ({ isActive }) =>
  `rounded-xl px-3 py-2 text-sm font-medium transition-colors ${
    isActive
      ? 'bg-slate-900 text-white'
      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
  }`

export function Navbar() {
  return (
    <header className="border-b border-slate-200/80 bg-white/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-lg font-semibold tracking-tight text-slate-900">
            FraudGuard
          </span>
          <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-600">
            API Console
          </span>
        </div>

        <nav className="flex flex-wrap items-center gap-1">
          {/* <NavLink to="/" end className={linkClass}>
            Upload
          </NavLink> */}
          <NavLink to="/dashboard" className={linkClass}>
            Dashboard
          </NavLink>
          <NavLink to="/single-predict" className={linkClass}>
            Single Predict
          </NavLink>
          <NavLink to="/research" className={linkClass}>
            Research Results
          </NavLink>
        </nav>
      </div>
    </header>
  )
}
