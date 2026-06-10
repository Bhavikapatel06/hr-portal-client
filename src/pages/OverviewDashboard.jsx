import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  TrendingUp, Users, Clock, CheckCircle2, AlertCircle,
  Briefcase, Plus, ShieldCheck, FileText, ArrowRight, Activity, Calendar,
  MapPin, GraduationCap, Building2, Flame, Filter, Download, Loader2
} from 'lucide-react'
import { mrfApi, sheetApi, candidateApi } from '../services/api.js'

// ── Date formatter ────────────────────────────────────────────────────────────
export function relativeDate(isoString) {
  if (!isoString) return '—'
  const diff = Date.now() - new Date(isoString).getTime()
  const days = Math.floor(diff / 86400000)
  if (days === 0) return 'Today'
  if (days === 1) return 'Yesterday'
  if (days < 7) return `${days}d ago`
  return new Date(isoString).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })
}

// ── Job Card Configs ──────────────────────────────────────────────────────────
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

// ── Candidate Job Card Component ──────────────────────────────────────────────
function JobCard({ mrf, idx }) {
  const urgency  = URGENCY[mrf.levelOfUrgency]  || URGENCY.Medium
  const status   = STATUS[mrf.positionStatus]    || STATUS.Open
  const gradient = DEPT_COLORS[idx % DEPT_COLORS.length]
  const skills   = (mrf.otherKeySkills || '').split(',').map(s => s.trim()).filter(Boolean)
  const visibleSkills = skills.slice(0, 3)
  const extraSkills   = skills.length - 3

  return (
    <div className={`card flex flex-col overflow-hidden border-l-2 ${urgency.ring} hover:border-l-4 hover:-translate-y-0.5 transition-all duration-200 group`}>
      <div className={`h-1.5 bg-gradient-to-r ${gradient} w-full`} />
      <div className="p-5 flex flex-col gap-4 flex-1">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className={`px-1.5 py-0.5 text-[8px] font-bold rounded uppercase tracking-wider ${
                mrf.requestType === 'JD' ? 'bg-blue-500/15 text-blue-400 border border-blue-500/35' : 'bg-purple-500/15 text-purple-400 border border-purple-500/35'
              }`}>
                {mrf.requestType || 'MRF'}
              </span>
              <h3 className="font-display font-bold text-white text-[15px] leading-snug group-hover:text-accent transition-colors truncate">
                {mrf.designation}
              </h3>
            </div>
            <div className="flex items-center gap-1.5 mt-1 text-xs text-slate-500">
              <Building2 size={11} />
              <span>{mrf.department}</span>
              {mrf.section && <><span>·</span><span>{mrf.section}</span></>}
            </div>
          </div>
          <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
            <span className={`badge border ${urgency.badge} flex items-center gap-1`}>
              <span className={`w-1.5 h-1.5 rounded-full ${urgency.dot}`} />
              {urgency.label}
            </span>
            <span className={`badge border ${status.badge}`}>{mrf.positionStatus}</span>
          </div>
        </div>

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
            <span>{mrf.noOfPositions || 1} position(s)</span>
          </div>
          <div className="flex items-center gap-1.5 text-slate-400">
            <GraduationCap size={11} className="text-slate-500 flex-shrink-0" />
            <span className="truncate">{mrf.minimumQualification || '—'}</span>
          </div>
        </div>

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

        {mrf.purposeOfJob && (
          <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed border-t border-white/6 pt-3">
            {mrf.purposeOfJob}
          </p>
        )}

        <div className="flex items-center justify-between pt-1 mt-auto">
          <div className="flex items-center gap-1.5 text-xs text-slate-600">
            <Clock size={11} />
            {relativeDate(mrf.createdAt)}
            {mrf.proposedSalary && (
              <span className="ml-2 text-slate-600">₹{mrf.proposedSalary}</span>
            )}
          </div>
          <Link
            to={`/apply/${mrf._id || mrf.id}`}
            className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-success/10 border border-success/25 text-success text-xs font-semibold hover:bg-success hover:text-white transition-all duration-150 group/btn"
          >
            Apply Now
            <ArrowRight size={12} className="group-hover/btn:translate-x-0.5 transition-transform" />
          </Link>
        </div>
      </div>
    </div>
  )
}

// ── Main Dashboard ────────────────────────────────────────────────────────────

export default function OverviewDashboard() {
  const navigate = useNavigate()
  const [mrfs, setMrfs] = useState([])
  const [sheetData, setSheetData] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('All')
  const [role, setRole] = useState(() => localStorage.getItem('hr_role') || 'candidate')
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem('hr_user')) } catch { return null }
  })

  useEffect(() => {
    const handleStorageChange = () => {
      setRole(localStorage.getItem('hr_role') || 'candidate')
    }
    window.addEventListener('storage', handleStorageChange)
    return () => window.removeEventListener('storage', handleStorageChange)
  }, [])

  useEffect(() => {
    const loadDashboardData = async () => {
      setLoading(true)
      try {
        const [mrfList, sheetRows] = await Promise.allSettled([
          mrfApi.list(),
          sheetApi.fetchAll()
        ])
        
        if (mrfList.status === 'fulfilled') {
          setMrfs(mrfList.value || [])
        }
        if (sheetRows.status === 'fulfilled') {
          setSheetData(sheetRows.value || [])
        }
      } catch (err) {
        console.error('Error loading overview data:', err)
      } finally {
        setLoading(false)
      }
    }
    loadDashboardData()
  }, [])

  // ── FILTER OPTIONS & LOGIC FOR CANDIDATE VIEW ─────────────────────────────────
  const FILTER_OPTIONS = ['All', 'High', 'Medium', 'Low', 'Open', 'In Progress', 'Closed']
  
  const approvedMrfs = mrfs.filter(m => m.mrfStatus === 'Approved')
  
  const filteredCandidatesJobs = filter === 'All'
    ? approvedMrfs
    : approvedMrfs.filter(m => m.levelOfUrgency === filter || m.positionStatus === filter)

  // ── Staff calculations of KPIs ──────────────────────────────────────────────
  const openVacancies = mrfs
    .filter(m => m.mrfStatus === 'Approved' && (m.positionStatus === 'Open' || m.positionStatus === 'In Progress'))
    .reduce((sum, m) => sum + (parseInt(m.noOfPositions) || 0), 0)

  const pendingMRFs = mrfs.filter(m => m.mrfStatus === 'Pending Owner Approval').length
  const approvedMRFs = mrfs.filter(m => m.mrfStatus === 'Approved').length
  const filledPositions = mrfs.filter(m => m.offerStatus === 'Joined' || m.offerStatus === 'Accepted').length
  const upcomingRetirements = mrfs.filter(m => 
    m.reasonForRequest === 'Retirement' || 
    m.reasonForRequest === 'Resignation' ||
    (m.employeeName && m.employeeName !== 'None' && m.employeeName !== '')
  ).length

  const userMrfs = role === 'department_head'
    ? mrfs.filter(m => m.submittedBy === user?.name || !m.submittedBy)
    : mrfs

  const recentRequests = [...userMrfs]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 4)

  const STATS_CARDS = [
    {
      label: 'Open Vacancies',
      value: openVacancies,
      sub: 'Headcount requested',
      icon: TrendingUp,
      color: 'text-cyan-400',
      bg: 'bg-cyan-500/10 border-cyan-500/20 shadow-cyan-500/5'
    },
    {
      label: 'Pending MRFs',
      value: pendingMRFs,
      sub: 'Awaiting approvals',
      icon: Clock,
      color: 'text-amber-400',
      bg: 'bg-amber-500/10 border-amber-500/20 shadow-amber-500/5'
    },
    {
      label: 'Approved MRFs',
      value: approvedMRFs,
      sub: 'Live recruitment pipelines',
      icon: CheckCircle2,
      color: 'text-emerald-400',
      bg: 'bg-emerald-500/10 border-emerald-500/20 shadow-emerald-500/5'
    },
    {
      label: 'Filled Positions',
      value: filledPositions,
      sub: 'Offers joined/accepted',
      icon: Users,
      color: 'text-indigo-400',
      bg: 'bg-indigo-500/10 border-indigo-500/20 shadow-indigo-500/5'
    },
    {
      label: 'Upcoming Exits',
      value: upcomingRetirements,
      sub: 'Retirement/Resignations',
      icon: AlertCircle,
      color: 'text-pink-400',
      bg: 'bg-pink-500/10 border-pink-500/20 shadow-pink-500/5'
    }
  ]

  // ── Candidate dashboard view rendering ──────────────────────────────────────
  if (role === 'candidate') {
    return (
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-6">
        <div className="fade-up">
          <span className="section-tag mb-2.5">
            <Briefcase size={11} /> Active Careers
          </span>
          <h1 className="font-display font-bold text-2xl sm:text-3xl text-white">
            Explore Job Openings
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Apply to active requisitions and track your candidature status.
          </p>
        </div>

        {/* Filter bar */}
        <div className="fade-up-1 flex items-center gap-2 flex-wrap">
          <Filter size={13} className="text-slate-500" />
          {FILTER_OPTIONS.map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all duration-150
                ${filter === f
                  ? 'bg-accent text-white border-accent shadow-glow-sm'
                  : 'bg-white/5 border-white/10 text-slate-400 hover:text-white hover:bg-white/10'}`}
            >
              {f}
              {f !== 'All' && (
                <span className="ml-1 text-[10px] opacity-60">
                  ({approvedMrfs.filter(m => m.levelOfUrgency === f || m.positionStatus === f).length})
                </span>
              )}
            </button>
          ))}
          <span className="ml-auto text-xs text-slate-600">{filteredCandidatesJobs.length} result(s)</span>
        </div>

        {/* Jobs Grid */}
        {loading ? (
          <div className="card p-24 flex items-center justify-center">
            <Loader2 size={24} className="animate-spin text-accent" />
          </div>
        ) : filteredCandidatesJobs.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 fade-up-2">
            {filteredCandidatesJobs.map((mrf, idx) => (
              <JobCard key={mrf._id} mrf={mrf} idx={idx} />
            ))}
          </div>
        ) : (
          <div className="card p-16 flex flex-col items-center justify-center gap-3 text-center border border-white/5 bg-ink-950/40 fade-up-2">
            <AlertCircle size={24} className="text-slate-500" />
            <p className="text-slate-400 text-sm">No career openings match this filter currently.</p>
          </div>
        )}
      </div>
    )
  }

  // ── ADMIN DASHBOARD VIEW ──────────────────────────────────────────────────
  if (role === 'admin') {
    const rejectedMRFs = mrfs.filter(m => m.mrfStatus === 'Rejected').length
    const ADMIN_KPI = [
      { label: 'Pending Approvals',  value: pendingMRFs,        sub: 'Awaiting HR Admin review',     icon: Clock,        color: 'text-amber-400',   bg: 'bg-amber-500/10 border-amber-500/20' },
      { label: 'Approved MRFs',      value: approvedMRFs,       sub: 'Cleared for HR team',           icon: CheckCircle2, color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20' },
      { label: 'Rejected MRFs',      value: rejectedMRFs,       sub: 'Returned to dept. heads',       icon: AlertCircle,  color: 'text-red-400',     bg: 'bg-red-500/10 border-red-500/20' },
      { label: 'Active Vacancies',   value: openVacancies,      sub: 'Open headcount positions',      icon: TrendingUp,   color: 'text-cyan-400',    bg: 'bg-cyan-500/10 border-cyan-500/20' },
      { label: 'Filled Positions',   value: filledPositions,    sub: 'Offers joined / accepted',      icon: Users,        color: 'text-indigo-400',  bg: 'bg-indigo-500/10 border-indigo-500/20' },
      { label: 'Upcoming Exits',     value: upcomingRetirements, sub: 'Retirement / Resignation',    icon: Briefcase,    color: 'text-pink-400',    bg: 'bg-pink-500/10 border-pink-500/20' },
    ]
    return (
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-8">
        {/* Welcome banner */}
        <div className="fade-up flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <span className="section-tag mb-2.5">
              <ShieldCheck size={11} className="animate-pulse" /> HR Admin Dashboard
            </span>
            <h1 className="font-display font-bold text-2xl sm:text-3xl text-white mt-1">
              Welcome, {user?.name || 'Admin'}
            </h1>
            <p className="text-slate-400 text-sm mt-1">
              Manpower Requisition overview — review and approve pending MRFs from Department Heads.
            </p>
          </div>
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => navigate('/mrf-approvals')}
              className="btn-primary flex items-center gap-2 bg-purple-600 border-purple-500 hover:bg-purple-700"
            >
              <ShieldCheck size={15} />
              Review Pending MRFs {pendingMRFs > 0 && `(${pendingMRFs})`}
            </button>
            <button
              onClick={() => navigate('/analytics')}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-slate-300 font-semibold text-xs transition-all"
            >
              View Reports <ArrowRight size={13} />
            </button>
          </div>
        </div>

        {loading ? (
          <div className="card p-24 flex flex-col items-center justify-center gap-3">
            <Loader2 className="w-8 h-8 text-accent animate-spin" />
            <p className="text-xs text-slate-500">Loading dashboard metrics...</p>
          </div>
        ) : (
          <>
            {/* 6 KPI Cards */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 fade-up-1">
              {ADMIN_KPI.map(({ label, value, sub, icon: Icon, color, bg }) => (
                <div key={label} className={`card p-5 border flex flex-col justify-between hover:-translate-y-0.5 transition-all duration-200 shadow-glow-sm ${bg}`}>
                  <div className="flex justify-between items-start">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider leading-snug">{label}</span>
                    <Icon size={15} className={color} />
                  </div>
                  <div className="mt-4">
                    <p className={`font-display font-bold text-3xl ${color}`}>{value}</p>
                    <p className="text-[10px] text-slate-500 font-semibold mt-1 truncate">{sub}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Recent Pending MRFs panel */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 card p-5 border border-amber-500/15 bg-amber-500/3 fade-up-2">
                <div className="flex justify-between items-center border-b border-white/5 pb-3 mb-4">
                  <h3 className="font-display font-bold text-white text-[15px] flex items-center gap-2">
                    <Clock size={16} className="text-amber-400" /> Pending MRF Approvals
                  </h3>
                  <Link to="/mrf-approvals" className="text-xs text-accent font-semibold hover:underline flex items-center gap-1">
                    View All <ArrowRight size={12} />
                  </Link>
                </div>
                {mrfs.filter(m => m.mrfStatus === 'Pending Owner Approval').length === 0 ? (
                  <div className="py-10 text-center text-slate-500 italic text-sm">
                    ✓ No pending MRFs — all caught up!
                  </div>
                ) : (
                  <div className="divide-y divide-white/5">
                    {mrfs.filter(m => m.mrfStatus === 'Pending Owner Approval').slice(0, 5).map(mrf => (
                      <div key={mrf._id} className="py-3 flex items-center justify-between gap-4 text-xs">
                        <div className="min-w-0">
                          <p className="font-semibold text-white truncate">{mrf.designation}</p>
                          <p className="text-[10px] text-slate-500 mt-0.5">
                            {mrf.department}{mrf.location ? ` · ${mrf.location}` : ''} · {mrf.noOfPositions || 1} position(s)
                          </p>
                          <p className="text-[10px] text-slate-600 mt-0.5">By: {mrf.submittedBy || 'Unknown'}</p>
                        </div>
                        <div className="flex flex-col items-end gap-1 flex-shrink-0">
                          <span className="px-2 py-0.5 rounded border text-[10px] font-bold text-amber-400 bg-amber-500/10 border-amber-500/25">
                            Pending Review
                          </span>
                          <span className="text-[10px] text-slate-600">
                            {new Date(mrf.createdAt).toLocaleDateString('en-IN')}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* MRF Status Summary */}
              <div className="card p-5 border border-white/5 bg-ink-950/40 fade-up-3 space-y-4">
                <h3 className="font-display font-bold text-white text-[15px] flex items-center gap-2 border-b border-white/5 pb-3">
                  <TrendingUp size={16} className="text-cyan-400" /> MRF Status Summary
                </h3>
                <div className="space-y-0">
                  {[
                    { label: 'Total Submitted',   value: mrfs.filter(m => m.mrfStatus !== 'Draft').length, color: 'text-white' },
                    { label: 'Pending Review',     value: pendingMRFs,     color: 'text-amber-400' },
                    { label: 'Approved',           value: approvedMRFs,    color: 'text-emerald-400' },
                    { label: 'Rejected',           value: rejectedMRFs,    color: 'text-red-400' },
                    { label: 'Open Vacancies',     value: openVacancies,   color: 'text-cyan-400' },
                    { label: 'Upcoming Exits',     value: upcomingRetirements, color: 'text-pink-400' },
                  ].map(({ label, value, color }) => (
                    <div key={label} className="flex items-center justify-between text-xs py-2.5 border-b border-white/5 last:border-0">
                      <span className="text-slate-500">{label}</span>
                      <span className={`font-bold text-sm ${color}`}>{value}</span>
                    </div>
                  ))}
                </div>
                <Link to="/analytics" className="text-[11px] text-accent font-semibold hover:underline flex items-center gap-1 pt-1">
                  Full Reports & Analytics <ArrowRight size={11} />
                </Link>
              </div>
            </div>
          </>
        )}
      </div>
    )
  }

  // ── DEPT HEAD DASHBOARD VIEW ──────────────────────────────────────────────
  // (Only role left using this component since HR redirects to /recruitment)
  const myMrfs = mrfs.filter(m => m.submittedBy === user?.name || !m.submittedBy)
  const myDrafts    = myMrfs.filter(m => m.mrfStatus === 'Draft').length
  const myPending   = myMrfs.filter(m => m.mrfStatus === 'Pending Owner Approval').length
  const myApproved  = myMrfs.filter(m => m.mrfStatus === 'Approved').length
  const myRejected  = myMrfs.filter(m => m.mrfStatus === 'Rejected').length
  const myPosted    = myMrfs.filter(m => m.mrfStatus === 'Approved' && (m.positionStatus === 'Open' || m.positionStatus === 'In Progress')).length
  const myOpenPositions = myMrfs
    .filter(m => m.mrfStatus === 'Approved')
    .reduce((s, m) => s + (parseInt(m.noOfPositions) || 0), 0)

  const DH_KPI = [
    { label: 'My Drafts',         value: myDrafts,        sub: 'Unsent MRF drafts',           icon: FileText,     color: 'text-slate-400',   bg: 'bg-slate-400/10 border-slate-400/20' },
    { label: 'Pending Approval',  value: myPending,       sub: 'Sent to HR Admin',             icon: Clock,        color: 'text-amber-400',   bg: 'bg-amber-500/10 border-amber-500/20' },
    { label: 'Approved',          value: myApproved,      sub: 'Cleared for recruitment',       icon: CheckCircle2, color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20' },
    { label: 'Positions Open',    value: myOpenPositions,  sub: 'Active headcount',             icon: Users,        color: 'text-cyan-400',    bg: 'bg-cyan-500/10 border-cyan-500/20' },
    { label: 'Job Postings Live', value: myPosted,        sub: 'Candidates applying now',       icon: Briefcase,    color: 'text-indigo-400',  bg: 'bg-indigo-500/10 border-indigo-500/20' },
  ]

  // Status config for MRF tracker rows
  const MRF_STATUS_CFG = {
    'Draft':                   { label: 'Draft',           color: 'text-slate-400',   bg: 'bg-slate-400/10 border-slate-400/25',   dot: 'bg-slate-400' },
    'Pending Owner Approval':  { label: 'Pending Review',  color: 'text-amber-400',   bg: 'bg-amber-400/10 border-amber-400/30',   dot: 'bg-amber-400' },
    'Approved':                { label: 'Approved',        color: 'text-emerald-400', bg: 'bg-emerald-400/10 border-emerald-400/30', dot: 'bg-emerald-400' },
    'Rejected':                { label: 'Rejected',        color: 'text-red-400',     bg: 'bg-red-400/10 border-red-400/30',         dot: 'bg-red-400' },
  }

  // Posted jobs with candidate counts (from approved MRFs)
  const postedJobs = myMrfs.filter(m => m.mrfStatus === 'Approved' && (m.positionStatus === 'Open' || m.positionStatus === 'In Progress'))

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      {/* Welcome Banner */}
      <div className="fade-up flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <span className="section-tag mb-2.5">
            <Activity size={11} className="animate-pulse" /> Department Head Dashboard
          </span>
          <h1 className="font-display font-bold text-2xl sm:text-3xl text-white mt-1">
            Welcome, {user?.name || 'Head'}
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Track your manpower requisitions, job postings, and candidate pipeline at a glance.
          </p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => navigate('/my-mrfs', { state: { openNewRequest: true } })}
            className="btn-primary flex items-center gap-2"
          >
            <Plus size={15} /> New MRF / JD
          </button>
          <button
            onClick={() => navigate('/analytics')}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 text-slate-300 font-semibold text-xs transition-all duration-150"
          >
            Reports & Analytics <ArrowRight size={13} />
          </button>
        </div>
      </div>

      {loading ? (
        <div className="card p-24 flex flex-col items-center justify-center gap-3">
          <Loader2 className="w-8 h-8 text-accent animate-spin" />
          <p className="text-xs text-slate-500">Loading your dashboard...</p>
        </div>
      ) : (
        <>
          {/* 5 KPI Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 fade-up-1">
            {DH_KPI.map(({ label, value, sub, icon: Icon, color, bg }) => (
              <div key={label} className={`card p-5 border flex flex-col justify-between hover:-translate-y-0.5 transition-all duration-200 shadow-glow-sm ${bg}`}>
                <div className="flex justify-between items-start">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider leading-snug">{label}</span>
                  <Icon size={15} className={color} />
                </div>
                <div className="mt-4">
                  <p className={`font-display font-bold text-3xl ${color}`}>{value}</p>
                  <p className="text-[10px] text-slate-500 font-semibold mt-1 truncate">{sub}</p>
                </div>
              </div>
            ))}
          </div>

          {/* My MRF Tracker — full width, larger text */}
          <div className="card p-6 space-y-5 border border-white/5 bg-ink-950/40 fade-up-2">
            <div className="flex justify-between items-center border-b border-white/5 pb-4">
              <h3 className="font-display font-bold text-white text-lg flex items-center gap-2">
                <FileText size={18} className="text-accent" />
                My MRF Tracker
              </h3>
              <Link to="/my-mrfs" className="text-sm text-accent font-semibold hover:underline flex items-center gap-1">
                Manage All <ArrowRight size={14} />
              </Link>
            </div>

            {myMrfs.length === 0 ? (
              <div className="py-16 text-center">
                <FileText size={32} className="text-slate-600 mx-auto mb-3" />
                <p className="text-slate-400 text-base font-semibold">No MRFs created yet</p>
                <p className="text-slate-600 text-sm mt-1">Click "New MRF/JD" to submit your first manpower requisition.</p>
              </div>
            ) : (
              <div className="divide-y divide-white/5">
                {[...myMrfs].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 10).map(mrf => {
                  const sCfg = MRF_STATUS_CFG[mrf.mrfStatus] || MRF_STATUS_CFG['Draft']
                  const isPosted = mrf.mrfStatus === 'Approved' && (mrf.positionStatus === 'Open' || mrf.positionStatus === 'In Progress')
                  const candidateCount = mrf.candidateCount || 0
                  return (
                    <div key={mrf._id} className="py-4 flex items-center justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2.5">
                          <p className="font-semibold text-white text-base truncate">{mrf.designation}</p>
                          {isPosted && (
                            <span className="px-2 py-0.5 text-[9px] font-bold rounded bg-emerald-500/15 text-emerald-400 border border-emerald-500/25 flex-shrink-0">
                              JOB LIVE
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-500 mt-1">
                          {mrf.department}{mrf.location ? ` · ${mrf.location}` : ''} · {mrf.noOfPositions || 1} position(s)
                        </p>
                      </div>

                      {/* Right side: inline badges + date below */}
                      <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
                        <div className="flex items-center gap-2">
                          {/* Candidate count (if posted) */}
                          {isPosted && candidateCount > 0 && (
                            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-accent/10 border border-accent/20">
                              <Users size={11} className="text-accent" />
                              <span className="text-accent font-bold text-xs">{candidateCount} applied</span>
                            </div>
                          )}
                          {/* Status badge */}
                          <span className={`px-2.5 py-1 rounded border text-xs font-bold flex items-center gap-1.5 ${sCfg.bg} ${sCfg.color}`}>
                            <span className={`w-2 h-2 rounded-full ${sCfg.dot}`} />
                            {sCfg.label}
                          </span>
                        </div>
                        <span className="text-xs text-slate-600">
                          {new Date(mrf.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}
                        </span>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}

            {myMrfs.length > 10 && (
              <Link to="/my-mrfs" className="text-sm text-accent font-semibold hover:underline flex items-center gap-1 pt-2">
                View all {myMrfs.length} MRFs <ArrowRight size={13} />
              </Link>
            )}
          </div>

        </>
      )}
    </div>
  )
}
