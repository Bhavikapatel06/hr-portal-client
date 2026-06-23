import React, { useState, useEffect } from 'react'
import {
  Settings, ShieldCheck, Bell, Lock, Users, Database,
  ChevronRight, ArrowLeft, Loader2, CheckCircle2, AlertCircle,
  ExternalLink, RefreshCw, FileSpreadsheet
} from 'lucide-react'
import { sheetApi } from '../services/api.js'

const SETTING_GROUPS = [
  {
    key: 'roles',
    icon: ShieldCheck,
    color: 'text-slate-400',
    bg: 'bg-slate-600/10 border-slate-600/20',
    title: 'Role & Permissions',
    desc: 'Manage HR Admin access control and approval authority',
    items: ['View and approve MRF permissions', 'Read-only access to all reports', 'Cannot create MRFs or job postings']
  },
  {
    key: 'notifications',
    icon: Bell,
    color: 'text-amber-400',
    bg: 'bg-amber-500/10 border-amber-500/20',
    title: 'Notifications',
    desc: 'Configure MRF submission and approval email alerts',
    items: ['Email on new MRF submissions', 'Notify dept. heads on approval/rejection', 'Weekly pipeline digest']
  },
  {
    key: 'security',
    icon: Lock,
    color: 'text-slate-400',
    bg: 'bg-slate-500/10 border-slate-500/20',
    title: 'Account Security',
    desc: 'Password, two-factor auth, and login sessions',
    items: ['Change password', 'Enable 2FA', 'Active session management']
  },
  {
    key: 'data',
    icon: Database,
    color: 'text-accent',
    bg: 'bg-accent/10 border-accent/20',
    title: 'Data & Reports',
    desc: 'Configure Google Sheet sync and analytics data sources',
    items: ['Link Google Sheet (Vacancy Tracker)', 'Data refresh interval', 'Export reports as CSV']
  },
]

export default function AdminSettingsPage() {
  const [activeGroup, setActiveGroup] = useState(null)
  
  // Google Sheets state
  const [sheetId, setSheetId] = useState('')
  const [loadingConfig, setLoadingConfig] = useState(false)
  const [savingConfig, setSavingConfig] = useState(false)
  const [syncing, setSyncing] = useState(false)
  const [successMsg, setSuccessMsg] = useState('')
  const [errorMsg, setErrorMsg] = useState('')
  const [syncResult, setSyncResult] = useState(null)

  useEffect(() => {
    if (activeGroup === 'data') {
      loadConfig()
    }
  }, [activeGroup])

  const loadConfig = async () => {
    setLoadingConfig(true)
    setErrorMsg('')
    try {
      const res = await sheetApi.getConfig()
      setSheetId(res.sheetId || '')
    } catch (e) {
      console.error(e)
      setErrorMsg('Failed to load Google Sheet config: ' + e.message)
    } finally {
      setLoadingConfig(false)
    }
  }

  const handleSaveConfig = async (e) => {
    e.preventDefault()
    setSavingConfig(true)
    setSuccessMsg('')
    setErrorMsg('')
    try {
      const res = await sheetApi.updateConfig(sheetId)
      setSuccessMsg('Google Sheet ID updated successfully!')
      setSheetId(res.sheetId || sheetId)
    } catch (e) {
      console.error(e)
      setErrorMsg('Failed to save Google Sheet ID: ' + e.message)
    } finally {
      setSavingConfig(false)
    }
  }

  const handleSyncAll = async () => {
    setSyncing(true)
    setSuccessMsg('')
    setErrorMsg('')
    setSyncResult(null)
    try {
      const res = await sheetApi.syncAll()
      setSyncResult(res)
      setSuccessMsg('Google Sheets synchronized successfully!')
    } catch (e) {
      console.error(e)
      setErrorMsg('Failed to sync database: ' + e.message)
    } finally {
      setSyncing(false)
    }
  }

  const renderActiveSetting = (group) => {
    if (group.key !== 'data') {
      return (
        <div className="space-y-4">
          <p className="text-sm text-slate-400">
            This configuration section is managed by system policies and security groups.
          </p>
          <div className="card p-5 border border-white/5 bg-ink-950/20">
            <h4 className="font-bold text-white text-sm mb-3">Policy Settings</h4>
            <ul className="space-y-2">
              {group.items.map((item, j) => (
                <li key={j} className="flex items-center gap-2 text-xs text-slate-400">
                  <span className={`w-1.5 h-1.5 rounded-full ${group.color} opacity-70`} />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )
    }

    // Google Sheets content
    return (
      <div className="space-y-6">
        {loadingConfig ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="animate-spin text-accent" size={24} />
          </div>
        ) : (
          <form onSubmit={handleSaveConfig} className="space-y-6">
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                Google Sheet Spreadsheet ID
              </label>
              <div className="flex flex-col sm:flex-row gap-3">
                <input
                  type="text"
                  value={sheetId}
                  onChange={(e) => setSheetId(e.target.value)}
                  placeholder="Enter Google Spreadsheet ID (e.g. 12Th5GDXGpfVySlRg...)"
                  className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-accent/40"
                  required
                />
                <button
                  type="submit"
                  disabled={savingConfig}
                  className="px-6 py-2.5 rounded-xl bg-accent text-white border border-accent font-semibold text-sm hover:bg-accent/80 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {savingConfig && <Loader2 className="animate-spin" size={14} />}
                  Save ID
                </button>
              </div>
              <p className="text-[10px] text-slate-500 leading-normal">
                The spreadsheet ID can be extracted from the Google Sheets URL. For example, in: <br />
                <code className="text-slate-400">https://docs.google.com/spreadsheets/d/<span className="text-accent font-bold">12Th5GDXGpfVySlRgDC58PRGa6HaJWUlfgTGocWKJ1Hs</span>/edit</code>
              </p>
            </div>

            {sheetId && (
              <div className="flex flex-wrap items-center gap-3 pt-2">
                <a
                  href={`https://docs.google.com/spreadsheets/d/${sheetId}/edit?usp=sharing`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 text-xs font-semibold hover:bg-emerald-500 hover:text-white transition-all shadow-glow-sm"
                >
                  <FileSpreadsheet size={13} />
                  Open Spreadsheet <ExternalLink size={11} />
                </a>

                <button
                  type="button"
                  onClick={handleSyncAll}
                  disabled={syncing}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-accent/10 border border-accent/25 text-accent text-xs font-semibold hover:bg-accent hover:text-white transition-all shadow-glow-sm disabled:opacity-50"
                >
                  {syncing ? <Loader2 className="animate-spin" size={13} /> : <RefreshCw size={13} />}
                  Sync Database to Sheet
                </button>
              </div>
            )}

            {syncResult && (
              <div className="card p-4 border border-emerald-500/20 bg-emerald-500/5 rounded-xl space-y-2 text-xs">
                <p className="font-bold text-white flex items-center gap-1.5">
                  <CheckCircle2 className="text-emerald-400" size={14} />
                  Synchronization Details:
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-slate-300">
                  <div>
                    <span className="text-slate-500 block text-[9px] uppercase font-bold">Job Openings</span>
                    <span className="font-semibold">{syncResult.mrfTotal} total</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[9px] uppercase font-bold">Rows Updated</span>
                    <span className="font-semibold">{syncResult.mrfUpdated} rows</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[9px] uppercase font-bold">Rows Appended</span>
                    <span className="font-semibold">{syncResult.mrfAppended} rows</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[9px] uppercase font-bold">Candidates Synced</span>
                    <span className="font-semibold">{syncResult.candidatesSynced} profiles</span>
                  </div>
                </div>
              </div>
            )}
          </form>
        )}
      </div>
    )
  }

  const selectedGroup = activeGroup ? SETTING_GROUPS.find(g => g.key === activeGroup) : null

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      {/* Header */}
      <div className="fade-up flex items-center justify-between gap-4">
        <div>
          <span className="section-tag mb-2.5">
            <Settings size={11} /> Admin Configuration
          </span>
          <h1 className="font-display font-bold text-2xl sm:text-3xl text-white mt-1">
            {selectedGroup ? selectedGroup.title : 'Settings'}
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            {selectedGroup ? selectedGroup.desc : 'Manage HR Portal preferences, notifications, and integration parameters.'}
          </p>
        </div>
        
        {selectedGroup && (
          <button
            onClick={() => {
              setActiveGroup(null)
              setSuccessMsg('')
              setErrorMsg('')
              setSyncResult(null)
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-slate-300 text-xs font-semibold hover:bg-white/10 hover:text-white transition-all"
          >
            <ArrowLeft size={13} /> Back to Settings
          </button>
        )}
      </div>

      {/* Messages */}
      {successMsg && (
        <div className="card px-4 py-3 rounded-xl border border-emerald-500/20 bg-emerald-500/5 text-emerald-300 text-xs font-medium flex items-center gap-2">
          <CheckCircle2 size={14} className="text-emerald-400" />
          {successMsg}
        </div>
      )}

      {errorMsg && (
        <div className="card px-4 py-3 rounded-xl border border-red-500/20 bg-red-500/5 text-red-300 text-xs font-medium flex items-center gap-2">
          <AlertCircle size={14} className="text-red-400" />
          {errorMsg}
        </div>
      )}

      {/* Settings list or Active Setting Form */}
      {selectedGroup ? (
        <div className="card p-6 border border-white/5 bg-ink-950/40 space-y-4 fade-up-1">
          {renderActiveSetting(selectedGroup)}
        </div>
      ) : (
        <div className="space-y-4 fade-up-1">
          {SETTING_GROUPS.map((group, i) => {
            const Icon = group.icon
            return (
              <div
                key={i}
                onClick={() => setActiveGroup(group.key)}
                className={`card p-5 border ${group.bg} hover:-translate-y-0.5 transition-all duration-200 cursor-pointer`}
              >
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
      )}

      {/* Version info */}
      <div className="fade-up-2 text-center pt-4 border-t border-white/5">
        <p className="text-xs text-slate-600 font-semibold">HR Portal v2.0 · HR Admin Module · Settings panel</p>
      </div>
    </div>
  )
}
