import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  BriefcaseBusiness, ShieldCheck, Loader2, AlertCircle,
  CheckCircle2, UserCircle2, Eye, EyeOff
} from 'lucide-react'

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

export default function Login() {
  const navigate = useNavigate()
  const [tab, setTab] = useState('login')

  // Login state
  const [loginForm, setLoginForm] = useState({ email: '', password: '' })
  const [loginError, setLoginError] = useState('')
  const [loginLoading, setLoginLoading] = useState(false)

  // Register state
  const [regForm, setRegForm] = useState({ name: '', email: '', password: '', confirmPassword: '', role: 'candidate' })
  const [regError, setRegError] = useState('')
  const [regLoading, setRegLoading] = useState(false)
  const [regSuccess, setRegSuccess] = useState(false)

  const [showPass, setShowPass] = useState(false)
  const [showConfirmPass, setShowConfirmPass] = useState(false)

  // ── Login ──────────────────────────────────────────────────────────────────
  const handleLogin = async (e) => {
    e.preventDefault()
    setLoginError('')
    setLoginLoading(true)
    try {
      const res = await fetch(`${API}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: loginForm.email, password: loginForm.password }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message || 'Login failed')

      localStorage.setItem('hr_token', data.token)
      localStorage.setItem('hr_role', data.user.role)
      localStorage.setItem('hr_user', JSON.stringify(data.user))
      window.dispatchEvent(new Event('storage'))
      navigate('/dashboard')
    } catch (err) {
      setLoginError(err.message)
    } finally {
      setLoginLoading(false)
    }
  }

  // ── Register ───────────────────────────────────────────────────────────────
  const handleRegister = async (e) => {
    e.preventDefault()
    setRegError('')
    if (regForm.password !== regForm.confirmPassword) {
      setRegError('Passwords do not match.')
      return
    }
    if (regForm.password.length < 6) {
      setRegError('Password must be at least 6 characters.')
      return
    }
    setRegLoading(true)
    try {
      const res = await fetch(`${API}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: regForm.name,
          email: regForm.email,
          password: regForm.password,
          role: regForm.role,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message || 'Registration failed')

      localStorage.setItem('hr_token', data.token)
      localStorage.setItem('hr_role', data.user.role)
      localStorage.setItem('hr_user', JSON.stringify(data.user))
      window.dispatchEvent(new Event('storage'))

      setRegSuccess(true)
      setTimeout(() => navigate('/dashboard'), 1500)
    } catch (err) {
      setRegError(err.message)
    } finally {
      setRegLoading(false)
    }
  }

  const inputClass = "w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-accent/40 focus:border-accent/50 transition-all duration-150"

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 grid-bg">
      <div className="max-w-md w-full">

        {/* Logo */}
        <div className="text-center mb-8">
          <div className="mx-auto w-14 h-14 rounded-2xl bg-accent flex items-center justify-center shadow-glow mb-4">
            <BriefcaseBusiness size={26} className="text-white" />
          </div>
          <h1 className="font-display font-bold text-3xl text-white tracking-tight">HR Portal</h1>
          <p className="text-slate-500 text-sm mt-1">AI-Powered Recruitment Platform</p>
        </div>

        {/* Card */}
        <div className="card p-8 border border-white/8 bg-ink-950/80 backdrop-blur-xl relative overflow-hidden">
          <div className="absolute -top-24 -left-24 w-48 h-48 rounded-full bg-accent/15 blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -right-24 w-48 h-48 rounded-full bg-slate-600/10 blur-3xl pointer-events-none" />

          {/* Tab switcher */}
          <div className="relative flex bg-white/5 rounded-xl p-1 mb-7 gap-1">
            {['login', 'register'].map(t => (
              <button
                key={t}
                onClick={() => { setTab(t); setLoginError(''); setRegError('') }}
                className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${
                  tab === t
                    ? 'bg-accent text-white shadow-glow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {t === 'login' ? 'Sign In' : 'Create Account'}
              </button>
            ))}
          </div>

          {/* ── LOGIN FORM ── */}
          {tab === 'login' && (
            <form onSubmit={handleLogin} className="space-y-4 relative">

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-2 uppercase tracking-wide">
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  placeholder="you@company.com"
                  value={loginForm.email}
                  onChange={e => setLoginForm(f => ({ ...f, email: e.target.value }))}
                  className={inputClass}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-2 uppercase tracking-wide">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPass ? 'text' : 'password'}
                    required
                    placeholder="Enter your password"
                    value={loginForm.password}
                    onChange={e => setLoginForm(f => ({ ...f, password: e.target.value }))}
                    className={inputClass + ' pr-12'}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass(s => !s)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white transition-colors"
                  >
                    {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {loginError && (
                <div className="flex items-center gap-2 px-3 py-2.5 rounded-lg bg-danger/10 border border-danger/25 text-danger text-xs">
                  <AlertCircle size={13} className="flex-shrink-0" />
                  {loginError}
                </div>
              )}

              <button
                type="submit"
                disabled={loginLoading}
                className="btn-primary w-full mt-2 flex items-center justify-center gap-2"
              >
                {loginLoading
                  ? <><Loader2 size={15} className="animate-spin" /> Signing in...</>
                  : 'Sign In'
                }
              </button>

              {/* Demo credentials */}
              <div className="mt-4 p-3 rounded-xl bg-white/3 border border-white/8">
                <p className="text-xs text-slate-500 font-semibold mb-2 uppercase tracking-wide">Demo Credentials</p>
                <div className="space-y-1">
                  {[
                    { email: 'admin@hrportal.com',    password: 'admin123',     label: 'HR Admin',       icon: ShieldCheck, color: 'text-slate-400' },
                    { email: 'depthead@hrportal.com', password: 'depthead123',  label: 'Dept. Head',     icon: UserCircle2, color: 'text-slate-400' },
                    { email: 'hr@hrportal.com',       password: 'hr123456',     label: 'HR Manager',     icon: UserCircle2, color: 'text-accent' },
                    { email: 'interviewer@hrportal.com', password: 'interviewer123', label: 'Interviewer', icon: UserCircle2, color: 'text-accent' },
                    { email: 'candidate@hrportal.com',password: 'candidate123', label: 'Candidate',      icon: UserCircle2, color: 'text-slate-400' },
                  ].map(({ email, password, label, icon: Icon, color }) => (
                    <button
                      key={email}
                      type="button"
                      onClick={() => setLoginForm({ email, password })}
                      className="w-full flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-white/5 transition-colors text-left"
                    >
                      <Icon size={13} className={`${color} flex-shrink-0`} />
                      <span className="text-xs text-slate-400">
                        {label} — <span className="text-white">{email}</span>
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </form>
          )}

          {/* ── REGISTER FORM ── */}
          {tab === 'register' && (
            <form onSubmit={handleRegister} className="space-y-4 relative">

              {regSuccess && (
                <div className="flex items-center gap-2 px-3 py-2.5 rounded-lg bg-accent/10 border border-accent/25 text-accent text-sm">
                  <CheckCircle2 size={15} />
                  Account created! Redirecting...
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-2 uppercase tracking-wide">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="Your full name"
                  value={regForm.name}
                  onChange={e => setRegForm(f => ({ ...f, name: e.target.value }))}
                  className={inputClass}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-2 uppercase tracking-wide">
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  placeholder="you@company.com"
                  value={regForm.email}
                  onChange={e => setRegForm(f => ({ ...f, email: e.target.value }))}
                  className={inputClass}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-2 uppercase tracking-wide">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPass ? 'text' : 'password'}
                    required
                    placeholder="Min. 6 characters"
                    value={regForm.password}
                    onChange={e => setRegForm(f => ({ ...f, password: e.target.value }))}
                    className={inputClass + ' pr-12'}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass(s => !s)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white transition-colors"
                  >
                    {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-2 uppercase tracking-wide">
                  Confirm Password
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPass ? 'text' : 'password'}
                    required
                    placeholder="Repeat password"
                    value={regForm.confirmPassword}
                    onChange={e => setRegForm(f => ({ ...f, confirmPassword: e.target.value }))}
                    className={inputClass + ' pr-12'}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPass(s => !s)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white transition-colors"
                  >
                    {showConfirmPass ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {/* Role Selection */}
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-2 uppercase tracking-wide">
                  I am a...
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { role: 'candidate',       label: 'Candidate',     sub: 'Looking for jobs',    icon: UserCircle2, active: 'bg-accent/15 border-accent/40 text-accent' },
                    { role: 'department_head', label: 'Dept. Head',    sub: 'Submit MRF requests',  icon: ShieldCheck, active: 'bg-slate-500/15 border-slate-500/40 text-slate-400' },
                    { role: 'hr',              label: 'HR Manager',    sub: 'Manage recruitment',   icon: UserCircle2, active: 'bg-accent/15 border-accent/40 text-accent' },
                    { role: 'interviewer',     label: 'Interviewer',   sub: 'Confirm slots',        icon: UserCircle2, active: 'bg-accent/15 border-accent/40 text-accent' },
                    { role: 'admin',           label: 'HR Admin',      sub: 'Full access',          icon: ShieldCheck, active: 'bg-slate-600/15 border-slate-600/40 text-slate-400' },
                  ].map(({ role: r, label, sub, icon: Icon, active }) => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => setRegForm(f => ({ ...f, role: r }))}
                      className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border transition-all duration-150 ${
                        regForm.role === r
                          ? active
                          : 'bg-white/3 border-white/10 text-slate-400 hover:bg-white/6'
                      }`}
                    >
                      <Icon size={18} />
                      <div className="text-center">
                        <p className="text-xs font-semibold">{label}</p>
                        <p className="text-[10px] opacity-70 mt-0.5">{sub}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {regError && (
                <div className="flex items-center gap-2 px-3 py-2.5 rounded-lg bg-danger/10 border border-danger/25 text-danger text-xs">
                  <AlertCircle size={13} className="flex-shrink-0" />
                  {regError}
                </div>
              )}

              <button
                type="submit"
                disabled={regLoading || regSuccess}
                className="btn-primary w-full mt-2 flex items-center justify-center gap-2"
              >
                {regLoading
                  ? <><Loader2 size={15} className="animate-spin" /> Creating Account...</>
                  : 'Create Account'
                }
              </button>
            </form>
          )}
        </div>

        <p className="text-center text-xs text-slate-600 mt-6">
          HR Portal © 2026 · AI-Powered Recruitment
        </p>
      </div>
    </div>
  )
}
