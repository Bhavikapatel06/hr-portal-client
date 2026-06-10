import React, { useState, useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard, BriefcaseBusiness, Bell, ClipboardList,
  Menu, X, LogOut, Activity, User, ShieldCheck
} from 'lucide-react'
import ThemeToggle from '../context/ThemeToggle.jsx'

export default function Navbar() {
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const [mobile, setMobile] = useState(false)
  const [role, setRole] = useState(() => localStorage.getItem('hr_role') || '')
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem('hr_user')) } catch { return null }
  })

  useEffect(() => {
    const handleStorageChange = () => {
      setRole(localStorage.getItem('hr_role') || '')
      try { setUser(JSON.parse(localStorage.getItem('hr_user'))) } catch { setUser(null) }
    }
    window.addEventListener('storage', handleStorageChange)
    return () => window.removeEventListener('storage', handleStorageChange)
  }, [])

  const handleLogout = () => {
    localStorage.removeItem('hr_token')
    localStorage.removeItem('hr_role')
    localStorage.removeItem('hr_user')
    setRole('')
    setUser(null)
    navigate('/login')
  }

  const navItems = role === 'admin'
    ? [
        { to: '/dashboard',      icon: LayoutDashboard, label: 'All Openings' },
        { to: '/resume-tracker', icon: ClipboardList,   label: 'Candidate Details' },
      ]
    : [
        { to: '/dashboard',      icon: LayoutDashboard, label: 'Job Openings' },
        { to: '/status',         icon: Activity,        label: 'My Applications' },
      ]

  if (pathname === '/login') return null

  const initials = user?.name
    ? user.name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
    : '?'

  return (
    <header className="navbar-bg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-5 h-16 flex items-center justify-between gap-4">

        {/* Brand */}
        <Link to="/dashboard" className="flex items-center gap-2.5 flex-shrink-0">
          <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center shadow-glow">
            <BriefcaseBusiness size={16} className="text-white" />
          </div>
          <div className="leading-none">
            <span className="font-display font-bold text-base tracking-tight" style={{ color: 'var(--text-primary)' }}>HR</span>
            <span className="font-display font-bold text-accent text-base tracking-tight">Portal</span>
          </div>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-1 flex-1 justify-center">
          {navItems.map(({ to, icon: Icon, label }) => {
            const active = pathname === to || pathname.startsWith(to + '/')
            return (
              <Link key={to} to={to}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-150
                  ${active
                    ? 'bg-accent/15 text-accent border border-accent/25'
                    : 'hover:bg-white/6'
                  }`}
                style={{ color: active ? undefined : 'var(--text-secondary)' }}
              >
                <Icon size={15} /> {label}
              </Link>
            )
          })}
        </nav>

        {/* Right Controls */}
        <div className="flex items-center gap-2.5">

          {/* Theme Toggle */}
          <ThemeToggle />

          {/* Role badge */}
          <div className={`hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-semibold ${
            role === 'admin'
              ? 'bg-purple-500/10 border-purple-500/20 text-purple-400'
              : 'bg-accent/10 border-accent/20 text-accent'
          }`}>
            {role === 'admin' ? <ShieldCheck size={12} /> : <User size={12} />}
            {role === 'admin' ? 'HR Admin' : 'Candidate'}
          </div>

          {/* Notification bell */}
          <button
            className="relative w-9 h-9 rounded-lg flex items-center justify-center transition-colors hidden sm:flex"
            style={{ background: 'var(--border-color)', border: '1px solid var(--border-color)' }}
          >
            <Bell size={15} style={{ color: 'var(--text-secondary)' }} />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-gold rounded-full" />
          </button>

          {/* User avatar */}
          {user && (
            <div className="hidden sm:flex items-center gap-2 px-2 py-1 rounded-lg"
              style={{ background: 'var(--border-color)', border: '1px solid var(--border-color)' }}
            >
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-white text-[10px] font-bold ${
                role === 'admin' ? 'bg-purple-500' : 'bg-accent'
              }`}>
                {initials}
              </div>
              <span className="text-xs font-medium max-w-[80px] truncate" style={{ color: 'var(--text-primary)' }}>
                {user.name}
              </span>
            </div>
          )}

          {/* Logout */}
          <button
            onClick={handleLogout}
            title="Log out"
            className="w-9 h-9 rounded-lg flex items-center justify-center hover:bg-red-500/15 hover:border-red-500/30 transition-colors"
            style={{ background: 'var(--border-color)', border: '1px solid var(--border-color)', color: 'var(--text-secondary)' }}
          >
            <LogOut size={15} />
          </button>

          {/* Mobile burger */}
          <button onClick={() => setMobile(o => !o)}
            className="md:hidden w-9 h-9 rounded-lg flex items-center justify-center transition-colors"
            style={{ background: 'var(--border-color)', border: '1px solid var(--border-color)', color: 'var(--text-secondary)' }}
          >
            {mobile ? <X size={16} /> : <Menu size={16} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobile && (
        <div className="md:hidden border-t px-4 py-3 space-y-1"
          style={{ borderColor: 'var(--border-color)', backgroundColor: 'var(--bg-primary)' }}
        >
          {user && (
            <div className="flex items-center gap-3 px-4 py-3 mb-2 border-b"
              style={{ borderColor: 'var(--border-color)' }}
            >
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold ${
                role === 'admin' ? 'bg-purple-500' : 'bg-accent'
              }`}>
                {initials}
              </div>
              <div>
                <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{user.name}</p>
                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{user.email}</p>
              </div>
            </div>
          )}

          {/* Theme toggle on mobile */}
          <div className="flex items-center justify-between px-4 py-3">
            <span className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>Theme</span>
            <ThemeToggle />
          </div>

          {navItems.map(({ to, icon: Icon, label }) => {
            const active = pathname === to || pathname.startsWith(to + '/')
            return (
              <Link key={to} to={to} onClick={() => setMobile(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all
                  ${active ? 'bg-accent/15 text-accent border border-accent/20' : ''}`}
                style={{ color: active ? undefined : 'var(--text-secondary)' }}
              >
                <Icon size={16} /> {label}
              </Link>
            )
          })}

          <button onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-red-400 hover:bg-red-500/10 transition-all mt-2">
            <LogOut size={16} /> Logout
          </button>
        </div>
      )}
    </header>
  )
}