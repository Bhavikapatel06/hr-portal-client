import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
  LayoutDashboard, CheckCircle2, TrendingUp, Users, Target,
  ArrowRight, Plus, MapPin, Briefcase, GraduationCap,
  AlertTriangle, Clock, Building2, Flame, Filter, Download, FileText,
} from 'lucide-react'
import { mrfApi, candidateApi } from '../services/api.js'

export function relativeDate(isoString) {
  if (!isoString) return '—'
  const diff = Date.now() - new Date(isoString).getTime()
  const days = Math.floor(diff / 86400000)
  if (days === 0) return 'Today'
  if (days === 1) return 'Yesterday'
  if (days < 7) return `${days}d ago`
  return new Date(isoString).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })
}


// ─── Config ──────────────────────────────────────────────────────────────────

const URGENCY = {
  High:   { label: 'High',   dot: 'bg-red-400',    badge: 'bg-red-400/12 border-red-400/30 text-red-400',    ring: 'border-l-red-400/40' },
  Medium: { label: 'Medium', dot: 'bg-gold',        badge: 'bg-gold/12 border-gold/30 text-gold',              ring: 'border-l-gold/40' },
  Low:    { label: 'Low',    dot: 'bg-slate-400',   badge: 'bg-slate-400/10 border-slate-400/25 text-slate-400', ring: 'border-l-white/10' },
}

const STATUS = {
  'Open':        { badge: 'bg-success/12 border-success/30 text-success' },
  'In Progress': { badge: 'bg-accent/12 border-accent/30 text-accent' },
  'Closed':      { badge: 'bg-slate-400/10 border-slate-400/25 text-slate-500' },
}

const DEPT_COLORS = [
  'from-blue-500/20 to-blue-600/5',
  'from-purple-500/20 to-purple-600/5',
  'from-emerald-500/20 to-emerald-600/5',
  'from-orange-500/20 to-orange-600/5',
  'from-pink-500/20 to-pink-600/5',
  'from-cyan-500/20 to-cyan-600/5',
]

// ─── Job Card ─────────────────────────────────────────────────────────────────

function JobCard({ mrf, idx, role }) {
  const urgency  = URGENCY[mrf.urgency]  || URGENCY.Medium
  const status   = STATUS[mrf.status]    || STATUS.Open
  const gradient = DEPT_COLORS[idx % DEPT_COLORS.length]
  const skills   = (mrf.otherKeySkills || '').split(',').map(s => s.trim()).filter(Boolean)
  const visibleSkills = skills.slice(0, 3)
  const extraSkills   = skills.length - 3

  return (
    <div className={`card flex flex-col overflow-hidden border-l-2 ${urgency.ring} hover:border-l-4 hover:-translate-y-0.5 transition-all duration-200 group`}>

      {/* Top gradient accent */}
      <div className={`h-1.5 bg-gradient-to-r ${gradient} w-full`} />

      <div className="p-5 flex flex-col gap-4 flex-1">
        {/* Header row */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <h3 className="font-display font-bold text-white text-[15px] leading-snug group-hover:text-accent transition-colors truncate">
              {mrf.designation}
            </h3>
            <div className="flex items-center gap-1.5 mt-1 text-xs text-slate-500">
              <Building2 size={11} />
              <span>{mrf.department}</span>
              {mrf.function && <><span>·</span><span>{mrf.function}</span></>}
            </div>
          </div>
          <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
            <span className={`badge border ${urgency.badge} flex items-center gap-1`}>
              <span className={`w-1.5 h-1.5 rounded-full ${urgency.dot}`} />
              {urgency.label}
            </span>
            <span className={`badge border ${status.badge}`}>{mrf.status}</span>
          </div>
        </div>

        {/* Meta grid */}
        <div className="grid grid-cols-2 gap-x-3 gap-y-2 text-xs">
          <div className="flex items-center gap-1.5 text-slate-400">
            <MapPin size={11} className="text-slate-500 flex-shrink-0" />
            <span className="truncate">{mrf.location || '—'}</span>
          </div>
          <div className="flex items-center gap-1.5 text-slate-400">
            <Briefcase size={11} className="text-slate-500 flex-shrink-0" />
            <span className="truncate">{mrf.experience || '—'}</span>
          </div>
          <div className="flex items-center gap-1.5 text-slate-400">
            <Users size={11} className="text-slate-500 flex-shrink-0" />
            <span>{mrf.noOfPositions || 1} position{mrf.noOfPositions != 1 ? 's' : ''}</span>
          </div>
          <div className="flex items-center gap-1.5 text-slate-400">
            <GraduationCap size={11} className="text-slate-500 flex-shrink-0" />
            <span className="truncate">{mrf.minimumQualification || '—'}</span>
          </div>
        </div>

        {/* Skills */}
        {visibleSkills.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {visibleSkills.map(s => (
              <span key={s} className="px-2 py-0.5 rounded-full bg-white/6 border border-white/10 text-xs text-slate-300">
                {s}
              </span>
            ))}
            {extraSkills > 0 && (
              <span className="px-2 py-0.5 rounded-full bg-white/4 text-xs text-slate-500">
                +{extraSkills} more
              </span>
            )}
          </div>
        )}

        {/* Purpose snippet */}
        {mrf.purposeOfJob && (
          <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed border-t border-white/6 pt-3">
            {mrf.purposeOfJob}
          </p>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between pt-1 mt-auto">
          <div className="flex items-center gap-1.5 text-xs text-slate-600">
            <Clock size={11} />
            {relativeDate(mrf.createdAt)}
            {mrf.proposedSalaryMin && (
              <span className="ml-2 text-slate-600">
                ₹{mrf.proposedSalaryMin}–{mrf.proposedSalaryMax} LPA
              </span>
            )}
          </div>
          {role === 'admin' ? (
            <div className="flex items-center gap-2">
              <a
                href={candidateApi.getMrfDownloadUrl(mrf._id || mrf.id)}
                download
                title="Download MRF as PDF"
                className="w-9 h-9 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 hover:border-white/20 transition-all duration-150 text-slate-400 hover:text-white"
                onClick={(e) => e.stopPropagation()}
              >
                <Download size={15} />
              </a>
              <Link
                to={`/resume-tracker?mrfId=${mrf._id || mrf.id}`}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-accent/10 border border-accent/25 text-accent text-xs font-semibold hover:bg-accent hover:text-white transition-all duration-150 group/btn"
              >
                Candidate Details {mrf.candidateCount > 0 ? `(${mrf.candidateCount})` : ''}
                <ArrowRight size={12} className="group-hover/btn:translate-x-0.5 transition-transform" />
              </Link>
            </div>
          ) : (
            <Link
              to={`/apply/${mrf._id || mrf.id}`}
              className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-success/10 border border-success/25 text-success text-xs font-semibold hover:bg-success hover:text-white transition-all duration-150 group/btn"
            >
              Apply Now
              <ArrowRight size={12} className="group-hover/btn:translate-x-0.5 transition-transform" />
            </Link>
          )}
        </div>
      </div>
    </div>
  )
}

// ─── Main export ──────────────────────────────────────────────────────────────

const FILTER_OPTIONS = ['All', 'High', 'Medium', 'Low', 'Open', 'In Progress', 'Closed']

export default function HRDashboard() {
  const [mrfs, setMrfs]       = useState([])
  const [filter, setFilter]   = useState('All')
  const [candidates, setCandidates] = useState([])
  const [role, setRole] = useState(() => localStorage.getItem('hr_role') || 'candidate')

  useEffect(() => {
    const handleStorageChange = () => {
      setRole(localStorage.getItem('hr_role') || 'candidate')
    }
    window.addEventListener('storage', handleStorageChange)
    return () => window.removeEventListener('storage', handleStorageChange)
  }, [])

  useEffect(() => {
    const loadData = async () => {
      try {
        const [mrfList, candidateList] = await Promise.all([
          mrfApi.list(),
          candidateApi.list()
        ]);
        setMrfs(mrfList);
        setCandidates(candidateList);
      } catch (err) {
        console.error('Failed to load dashboard data:', err);
      }
    };
    loadData();
  }, [])

  // Filter logic
  const filtered = filter === 'All'
    ? mrfs
    : mrfs.filter(m =>
        m.urgency === filter || m.status === filter
      )

  // Stats
  const totalPositions = mrfs.reduce((s, m) => s + (parseInt(m.noOfPositions) || 0), 0)
  const highUrgency    = mrfs.filter(m => m.urgency === 'High').length
  const openCount      = mrfs.filter(m => m.status === 'Open').length

  const STATS = [
    { label: 'Total Openings',      value: openCount,           icon: TrendingUp,     color: 'text-accent',     bg: 'bg-accent/10 border-accent/20' },
    { label: 'Positions Available', value: totalPositions,      icon: Users,          color: 'text-success',    bg: 'bg-success/10 border-success/20' },
    { label: 'High Urgency',        value: highUrgency,         icon: Flame,          color: 'text-red-400',    bg: 'bg-red-400/10 border-red-400/20' },
    { label: 'Candidates Tracked',  value: candidates.length,   icon: Target,         color: 'text-purple-400', bg: 'bg-purple-400/10 border-purple-400/20' },
  ]

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-8">

      {/* ── Header ───────────────────────────────────────────── */}
      <div className="fade-up">
        <span className="section-tag mb-3">
          <LayoutDashboard size={11} /> All Openings
        </span>
        <div className="flex items-end justify-between flex-wrap gap-4 mt-2">
          <div>
            <h1 className="font-display font-bold text-2xl sm:text-3xl text-white">
              {role === 'admin' ? 'Manpower Overview' : 'Job Openings'}
            </h1>
            <p className="text-slate-400 text-sm mt-1">
              {role === 'admin'
                ? 'All active job openings. Click Candidate Details on any card to manage candidates.'
                : 'All active job openings. Find your matching roles and apply now!'}
            </p>
          </div>
          {role === 'admin' && (
            <Link to="/resume-tracker" className="btn-primary">
              <Plus size={15} /> New MRF
            </Link>
          )}
        </div>
      </div>

      {/* ── Stats ────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 fade-up-1">
        {STATS.map(({ label, value, icon: Icon, color, bg }) => (
          <div key={label} className="card p-4">
            <div className={`w-9 h-9 rounded-lg border flex items-center justify-center mb-3 ${bg}`}>
              <Icon size={16} className={color} />
            </div>
            <p className={`font-display font-bold text-2xl ${color}`}>{value}</p>
            <p className="text-xs text-slate-500 mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      {/* ── Filter bar ───────────────────────────────────────── */}
      <div className="fade-up-2 flex items-center gap-2 flex-wrap">
        <Filter size={13} className="text-slate-500" />
        {FILTER_OPTIONS.map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all duration-150
              ${filter === f
                ? 'bg-accent text-white border-accent shadow-glow-sm'
                : 'bg-white/5 border-white/10 text-slate-400 hover:text-white hover:bg-white/10'
              }`}
          >
            {f}
            {f !== 'All' && (
              <span className="ml-1 text-[10px] opacity-60">
                ({mrfs.filter(m => m.urgency === f || m.status === f).length})
              </span>
            )}
          </button>
        ))}
        <span className="ml-auto text-xs text-slate-600">{filtered.length} result{filtered.length !== 1 ? 's' : ''}</span>
      </div>

      {/* ── Job grid ─────────────────────────────────────────── */}
      {filtered.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 fade-up-3">
          {filtered.map((mrf, idx) => (
            <JobCard key={mrf._id || mrf.id} mrf={mrf} idx={idx} role={role} />
          ))}
        </div>
      ) : (
        <div className="card p-12 flex flex-col items-center justify-center gap-4 text-center fade-up-3">
          <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center">
            <AlertTriangle size={24} className="text-slate-500" />
          </div>
          <p className="text-slate-400 text-sm">No openings match this filter.</p>
          <button onClick={() => setFilter('All')} className="btn-ghost text-sm">Clear filter</button>
        </div>
      )}

    </div>
  )
}
