import React, { useState, useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard, BriefcaseBusiness, Bell, ClipboardList,
  Menu, X, LogOut, Activity, User, ShieldCheck,
  Settings, Users, AlertTriangle
} from 'lucide-react'
import { notificationApi } from '../services/api'
import ThemeToggle from '../context/ThemeToggle.jsx'

export default function Navbar() {
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const [mobile, setMobile] = useState(false)
  const [role, setRole] = useState(() => localStorage.getItem('hr_role') || '')
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem('hr_user')) } catch { return null }
  })

  const [notifications, setNotifications] = useState([])
  const [showNotifications, setShowNotifications] = useState(false)

  // Logout confirmation modal
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false)

  const loadNotifications = async () => {
    if (!user) return
    try {
      const data = await notificationApi.list()
      setNotifications(data)
    } catch (e) {
      console.error('Failed to load notifications', e)
    }
  }

  useEffect(() => {
    const handleStorageChange = () => {
      setRole(localStorage.getItem('hr_role') || '')
      try { setUser(JSON.parse(localStorage.getItem('hr_user'))) } catch { setUser(null) }
    }
    window.addEventListener('storage', handleStorageChange)
    loadNotifications()
    const intv = setInterval(loadNotifications, 30000)
    return () => {
      window.removeEventListener('storage', handleStorageChange)
      clearInterval(intv)
    }
  }, [user?.email])

  // ESC closes the logout modal
  useEffect(() => {
    if (!showLogoutConfirm) return
    const onKey = (e) => { if (e.key === 'Escape') setShowLogoutConfirm(false) }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [showLogoutConfirm])

  const handleMarkRead = async (id) => {
    try {
      await notificationApi.markRead(id)
      setNotifications(prev => prev.map(n => n._id === id ? { ...n, isRead: true } : n))
    } catch (e) { console.error(e) }
  }

  const handleMarkAllRead = async () => {
    try {
      await notificationApi.markAllRead()
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })))
    } catch (e) { console.error(e) }
  }

  const handleDelete = async (id, e) => {
    e.stopPropagation()
    try {
      await notificationApi.delete(id)
      setNotifications(prev => prev.filter(n => n._id !== id))
    } catch (e) { console.error(e) }
  }

  const handleClearAll = async () => {
    try {
      await notificationApi.clearAll()
      setNotifications([])
    } catch (e) { console.error(e) }
  }

  // Step 1: ask for confirmation
  const requestLogout = () => {
    setMobile(false)
    setShowLogoutConfirm(true)
  }

  // Step 2: actually log out after user confirms
  const confirmLogout = () => {
    localStorage.removeItem('hr_token')
    localStorage.removeItem('hr_role')
    localStorage.removeItem('hr_user')
    setRole('')
    setUser(null)
    setShowLogoutConfirm(false)
    window.dispatchEvent(new Event('storage'))
    navigate('/login')
  }

  const getNavItems = () => {
    switch (role) {
      case 'admin':
        return [
          { to: '/dashboard',      icon: LayoutDashboard, label: 'Dashboard' },
          { to: '/mrf-approvals',  icon: ClipboardList,   label: 'Requisitions' },
          { to: '/settings',       icon: Settings,        label: 'Settings' },
        ]
      case 'department_head':
        return [
          { to: '/dashboard',      icon: LayoutDashboard, label: 'Dashboard' },
          { to: '/my-mrfs',        icon: ClipboardList,   label: 'Requisitions' },
        ]
      case 'hr':
        return [
          { to: '/dashboard',      icon: LayoutDashboard, label: 'Dashboard' },
          { to: '/recruitment',    icon: BriefcaseBusiness, label: 'Recruitment' },
          { to: '/my-mrfs',        icon: ClipboardList,   label: 'Requisitions' },
        ]
      case 'interviewer':
        return [
          { to: '/dashboard',      icon: LayoutDashboard, label: 'Dashboard' },
          { to: '/interviews',     icon: Users,           label: 'Interviews' },
        ]
      case 'candidate':
        return [
          { to: '/dashboard',      icon: LayoutDashboard, label: 'Job Openings' },
          { to: '/status',         icon: Activity,        label: 'My Applications' },
        ]
      default:
        return []
    }
  }

  const navItems = getNavItems()

  const getRoleDetails = () => {
    switch (role) {
      case 'admin':           return { label: 'Admin',       badgeCls: 'bg-accent/10 border-accent/20 text-accent', avatarCls: 'bg-accent', icon: ShieldCheck }
      case 'department_head': return { label: 'Dept Head',   badgeCls: 'bg-accent/10 border-accent/20 text-accent', avatarCls: 'bg-accent', icon: User }
      case 'hr':              return { label: 'HR',          badgeCls: 'bg-accent/10 border-accent/20 text-accent', avatarCls: 'bg-accent', icon: User }
      case 'interviewer':     return { label: 'Interviewer', badgeCls: 'bg-accent/10 border-accent/20 text-accent', avatarCls: 'bg-accent', icon: User }
      case 'candidate':
      default:                return { label: 'Candidate',   badgeCls: 'bg-accent/10 border-accent/20 text-accent', avatarCls: 'bg-accent', icon: User }
    }
  }

  const roleDetails = getRoleDetails()

  if (pathname === '/login') return null

  const initials = user?.name
    ? user.name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
    : '?'

  return (
    <>
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
                  ${active ? 'bg-accent/15 text-accent border border-accent/25' : 'hover:bg-white/6'}`}
                style={{ color: active ? undefined : 'var(--text-secondary)' }}
              >
                <Icon size={15} /> {label}
              </Link>
            )
          })}
        </nav>

        {/* Right Controls */}
        <div className="flex items-center gap-2.5">
          <ThemeToggle />

          {/* Notification bell */}
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative w-9 h-9 rounded-lg flex items-center justify-center transition-colors"
              style={{ background: 'var(--border-color)', border: '1px solid var(--border-color)' }}
            >
              <Bell size={15} style={{ color: 'var(--text-secondary)' }} />
              {notifications.some(n => !n.isRead) && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-slate-500 rounded-full" />
              )}
            </button>

            {showNotifications && (
              <div className="fixed top-[64px] left-1/2 -translate-x-1/2 w-[calc(100vw-32px)] sm:absolute sm:top-auto sm:left-auto sm:translate-x-0 sm:right-0 sm:mt-2 sm:w-80 bg-ink-900 border border-white/10 rounded-xl shadow-xl overflow-hidden z-50">
                <div className="px-4 py-3 border-b border-white/10 flex justify-between items-center bg-white/5">
                  <h3 className="text-sm font-semibold text-white">Notifications</h3>
                  <div className="flex items-center gap-3">
                    {notifications.some(n => !n.isRead) && (
                      <button onClick={handleMarkAllRead} className="text-[11px] font-medium text-accent hover:text-accent-light transition-colors">Mark all read</button>
                    )}
                    {notifications.length > 0 && (
                      <button onClick={handleClearAll} className="text-[11px] font-medium text-red-400 hover:text-red-300 transition-colors">Clear all</button>
                    )}
                  </div>
                </div>
                <div className="max-h-80 overflow-y-auto">
                  {notifications.length === 0 ? (
                    <div className="p-8 text-center flex flex-col items-center justify-center">
                      <Bell size={24} className="text-white/10 mb-2" />
                      <div className="text-sm text-slate-400">No notifications</div>
                    </div>
                  ) : (
                    notifications.map(n => (
                      <div key={n._id} onClick={() => { handleMarkRead(n._id); if (n.link) navigate(n.link); setShowNotifications(false); }}
                           className={`group relative p-3 border-b border-white/5 cursor-pointer hover:bg-white/5 transition-colors ${!n.isRead ? 'bg-white/5 border-l-2 border-l-accent' : ''}`}>
                        <div className="flex justify-between items-start mb-1 pr-6">
                          <p className={`text-sm font-medium ${!n.isRead ? 'text-white' : 'text-slate-300'}`}>{n.title}</p>
                          <span className="text-[10px] text-slate-500 whitespace-nowrap ml-2 flex-shrink-0">
                            {new Date(n.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-xs text-slate-400 line-clamp-2 pr-6">{n.message}</p>
                        <button
                          onClick={(e) => handleDelete(n._id, e)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 rounded-md text-slate-500 hover:text-red-400 hover:bg-red-400/10 opacity-0 group-hover:opacity-100 transition-all sm:opacity-0 opacity-100"
                          title="Remove notification"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* User avatar */}
          {user && (
            <div className="hidden sm:flex items-center gap-2.5 px-3 py-1 rounded-lg"
              style={{ background: 'var(--border-color)', border: '1px solid var(--border-color)' }}
            >
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-sm ${roleDetails.avatarCls}`}>
                {initials}
              </div>
              <div className="flex flex-col text-left">
                <span className="text-xs font-semibold leading-tight" style={{ color: 'var(--text-primary)' }}>
                  {user.name}
                </span>
                <span className="text-[9px] text-slate-400 font-medium leading-none mt-0.5">
                  {roleDetails.label}
                </span>
              </div>
            </div>
          )}

          {/* Logout — now opens confirmation modal */}
          <button
            onClick={requestLogout}
            title="Log out"
            data-testid="logout-button"
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
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold ${roleDetails.avatarCls}`}>
                {initials}
              </div>
              <div>
                <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{user.name}</p>
                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{user.email}</p>
              </div>
            </div>
          )}

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

          <button onClick={requestLogout}
            data-testid="logout-button-mobile"
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-red-400 hover:bg-red-500/10 transition-all mt-2">
            <LogOut size={16} /> Logout
          </button>
        </div>
      )}
    </header>

    {/* ── Logout Confirmation Modal ───────────────────────────────────────── */}
    {showLogoutConfirm && (
      <div
        className="fixed inset-0 z-[100] flex items-center justify-center p-4"
        role="dialog"
        aria-modal="true"
        aria-labelledby="logout-modal-title"
        data-testid="logout-confirm-modal"
      >
        {/* backdrop */}
        <div
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          onClick={() => setShowLogoutConfirm(false)}
        />
        {/* dialog */}
        <div
          className="relative w-full max-w-sm rounded-2xl border shadow-2xl overflow-hidden"
          style={{
            background: 'var(--bg-primary, #0f172a)',
            borderColor: 'var(--border-color, rgba(255,255,255,0.1))',
          }}
        >
          <div className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-red-500/15 border border-red-500/30 flex items-center justify-center">
                <AlertTriangle size={18} className="text-red-400" />
              </div>
              <h2
                id="logout-modal-title"
                className="font-display font-bold text-lg"
                style={{ color: 'var(--text-primary, #fff)' }}
              >
                Confirm Logout
              </h2>
            </div>
            <p
              className="text-sm leading-relaxed"
              style={{ color: 'var(--text-secondary, #94a3b8)' }}
            >
              Are you sure you want to logout? You will need to sign in again to access your dashboard.
            </p>
          </div>
          <div
            className="px-6 py-4 flex items-center justify-end gap-3 border-t"
            style={{
              borderColor: 'var(--border-color, rgba(255,255,255,0.08))',
              background: 'var(--bg-secondary, rgba(255,255,255,0.02))',
            }}
          >
            <button
              type="button"
              onClick={() => setShowLogoutConfirm(false)}
              data-testid="logout-cancel-button"
              className="px-4 py-2 rounded-lg text-sm font-medium border transition-colors"
              style={{
                borderColor: 'var(--border-color, rgba(255,255,255,0.1))',
                color: 'var(--text-secondary, #cbd5e1)',
                background: 'transparent',
              }}
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={confirmLogout}
              data-testid="logout-confirm-button"
              className="px-4 py-2 rounded-lg text-sm font-semibold bg-red-500 hover:bg-red-600 text-white shadow-sm transition-colors flex items-center gap-2"
            >
              <LogOut size={14} /> Logout
            </button>
          </div>
        </div>
      </div>
    )}
    </>
  )
}
