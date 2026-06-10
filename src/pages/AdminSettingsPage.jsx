import React from 'react'
import { Settings, ShieldCheck, Bell, Lock, Users, Database, ChevronRight } from 'lucide-react'

const SETTING_GROUPS = [
  {
    icon: ShieldCheck,
    color: 'text-purple-400',
    bg: 'bg-purple-500/10 border-purple-500/20',
    title: 'Role & Permissions',
    desc: 'Manage HR Admin access control and approval authority',
    items: ['View and approve MRF permissions', 'Read-only access to all reports', 'Cannot create MRFs or job postings']
  },
  {
    icon: Bell,
    color: 'text-amber-400',
    bg: 'bg-amber-500/10 border-amber-500/20',
    title: 'Notifications',
    desc: 'Configure MRF submission and approval email alerts',
    items: ['Email on new MRF submissions', 'Notify dept. heads on approval/rejection', 'Weekly pipeline digest']
  },
  {
    icon: Lock,
    color: 'text-cyan-400',
    bg: 'bg-cyan-500/10 border-cyan-500/20',
    title: 'Account Security',
    desc: 'Password, two-factor auth, and login sessions',
    items: ['Change password', 'Enable 2FA', 'Active session management']
  },
  {
    icon: Database,
    color: 'text-emerald-400',
    bg: 'bg-emerald-500/10 border-emerald-500/20',
    title: 'Data & Reports',
    desc: 'Configure Google Sheet sync and analytics data sources',
    items: ['Link Google Sheet (Vacancy Tracker)', 'Data refresh interval', 'Export reports as CSV']
  },
]

export default function AdminSettingsPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      {/* Header */}
      <div className="fade-up">
        <span className="section-tag mb-2.5">
          <Settings size={11} /> Admin Configuration
        </span>
        <h1 className="font-display font-bold text-2xl sm:text-3xl text-white mt-1">Settings</h1>
        <p className="text-slate-400 text-sm mt-1">
          Manage HR Admin portal preferences, notifications, and account configuration.
        </p>
      </div>

      {/* Settings groups */}
      <div className="space-y-4 fade-up-1">
        {SETTING_GROUPS.map((group, i) => {
          const Icon = group.icon
          return (
            <div key={i} className={`card p-5 border ${group.bg} hover:-translate-y-0.5 transition-all duration-200 cursor-pointer`}>
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-4 flex-1">
                  <div className={`p-2.5 rounded-xl border ${group.bg}`}>
                    <Icon size={18} className={group.color} />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-display font-bold text-white text-[15px]">{group.title}</h3>
                    <p className="text-xs text-slate-500 mt-0.5">{group.desc}</p>
                    <ul className="mt-3 space-y-1.5">
                      {group.items.map((item, j) => (
                        <li key={j} className="flex items-center gap-2 text-xs text-slate-400">
                          <span className={`w-1.5 h-1.5 rounded-full ${group.color} opacity-70`} />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
                <ChevronRight size={16} className="text-slate-600 flex-shrink-0 mt-1" />
              </div>
            </div>
          )
        })}
      </div>

      {/* Version info */}
      <div className="fade-up-2 text-center pt-4 border-t border-white/5">
        <p className="text-xs text-slate-600">HR Portal v2.0 · HR Admin Module · Settings panel</p>
      </div>
    </div>
  )
}
