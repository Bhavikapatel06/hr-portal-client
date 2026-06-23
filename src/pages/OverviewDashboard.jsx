import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  TrendingUp, Users, Clock, CheckCircle2, AlertCircle,
  Briefcase, Plus, ShieldCheck, FileText, ArrowRight, Activity, Calendar,
  MapPin, GraduationCap, Building2, Flame, Filter, Download, Loader2,
  Award, UserCheck, XCircle, Search, Sparkles, Bell
} from 'lucide-react'
import { mrfApi, sheetApi, candidateApi } from '../services/api.js'

// ── Date helper ──────────────────────────────────────────────────────────────
export function relativeDate(isoString) {
  if (!isoString) return '—'
  const diff = Date.now() - new Date(isoString).getTime()
  const days = Math.floor(diff / 86400000)
  if (days === 0) return 'Today'
  if (days === 1) return 'Yesterday'
  if (days < 7) return `${days}d ago`
  return new Date(isoString).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })
}

// ── Custom SVG Donut Chart ───────────────────────────────────────────────────
function DonutChart({ data, size = 120 }) {
  const total = data.reduce((sum, item) => sum + item.value, 0)
  const radius = 40
  const circumference = 2 * Math.PI * radius
  let accumulatedAngle = 0

  return (
    <div className="flex flex-col items-center gap-4 w-full">
      <div className="relative flex-shrink-0" style={{ width: size, height: size }}>
        <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
          <circle cx="50" cy="50" r={radius} fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="8" />
          {total > 0 && data.map((item, idx) => {
            const strokeLength = (item.value / total) * circumference
            const strokeOffset = circumference - strokeLength + accumulatedAngle
            accumulatedAngle -= strokeLength
            return (
              <circle
                key={idx}
                cx="50"
                cy="50"
                r={radius}
                fill="none"
                stroke={item.color}
                strokeWidth="8"
                strokeDasharray={circumference}
                strokeDashoffset={strokeOffset}
                strokeLinecap="round"
                className="transition-all duration-300 hover:stroke-[10px] cursor-pointer"
              />
            )
          })}
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-lg font-bold text-white leading-none font-display">{total}</span>
          <span className="text-[8px] text-slate-500 font-bold uppercase tracking-wider mt-1">Total</span>
        </div>
      </div>
      <div className="flex flex-wrap items-center justify-center gap-2 w-full mt-1">
        {data.map((item, idx) => {
          const percentage = total > 0 ? Math.round((item.value / total) * 100) : 0
          return (
            <div key={idx} className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-white/5 border border-white/10 text-[10px] text-slate-300">
              <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: item.color }} />
              <span className="font-medium text-slate-400">{item.label}</span>
              <span className="font-bold text-white">{item.value}</span>
              <span className="text-slate-500">({percentage}%)</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ── Custom SVG Line Chart ────────────────────────────────────────────────────
function LineChart({ data, width = 500, height = 180 }) {
  if (!data || data.length === 0) {
    return (
      <div className="w-full flex items-center justify-center h-[180px] border border-white/5 rounded-lg bg-ink-950/20 text-slate-500 text-xs">
        No trend data available
      </div>
    )
  }

  const maxVal = Math.max(...data.map(d => d.value), 10) || 10
  const paddingLeft = 35
  const paddingRight = 15
  const paddingTop = 20
  const paddingBottom = 25
  const chartWidth = width - paddingLeft - paddingRight
  const chartHeight = height - paddingTop - paddingBottom

  const points = data.map((d, idx) => {
    const divisor = data.length > 1 ? data.length - 1 : 1
    const x = paddingLeft + (idx / divisor) * chartWidth
    const y = paddingTop + chartHeight - (d.value / maxVal) * chartHeight
    return { x, y }
  })

  let pathD = ''
  if (points.length > 0) {
    pathD = `M ${points[0].x} ${points[0].y}`
    for (let i = 1; i < points.length; i++) {
      const p0 = points[i - 1]
      const p = points[i]
      const cpX1 = p0.x + chartWidth / (data.length > 1 ? data.length - 1 : 1) / 3
      const cpY1 = p0.y
      const cpX2 = p.x - chartWidth / (data.length > 1 ? data.length - 1 : 1) / 3
      const cpY2 = p.y
      pathD += ` C ${cpX1} ${cpY1}, ${cpX2} ${cpY2}, ${p.x} ${p.y}`
    }
  }

  const areaD = points.length > 0
    ? `${pathD} L ${points[points.length - 1].x} ${paddingTop + chartHeight} L ${points[0].x} ${paddingTop + chartHeight} Z`
    : ''

  const gridLinesCount = 4
  const gridLines = []
  for (let i = 0; i <= gridLinesCount; i++) {
    gridLines.push(paddingTop + (i / gridLinesCount) * chartHeight)
  }

  return (
    <div className="w-full">
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto overflow-visible">
        <defs>
          <linearGradient id="line-grad-purple" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#a855f7" stopOpacity="0.2" />
            <stop offset="100%" stopColor="#a855f7" stopOpacity="0.0" />
          </linearGradient>
        </defs>

        {/* Gridlines */}
        {gridLines.map((yVal, idx) => (
          <line
            key={idx}
            x1={paddingLeft}
            y1={yVal}
            x2={width - paddingRight}
            y2={yVal}
            stroke="rgba(255,255,255,0.05)"
            strokeDasharray={idx === gridLinesCount ? "0" : "3 3"}
          />
        ))}

        {areaD && <path d={areaD} fill="url(#line-grad-purple)" />}
        {pathD && <path d={pathD} fill="none" stroke="#a855f7" strokeWidth="2.5" strokeLinecap="round" />}

        {points.map((p, idx) => (
          <g key={idx} className="group cursor-pointer">
            <circle cx={p.x} cy={p.y} r="3.5" fill="#a855f7" stroke="#0a0a0f" strokeWidth="2" />
            <circle cx={p.x} cy={p.y} r="9" fill="#a855f7" opacity="0" className="hover:opacity-20 transition-opacity" />
            <g className="opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
              <rect x={p.x - 18} y={p.y - 24} width="36" height="16" rx="3" fill="#12131a" stroke="rgba(255,255,255,0.1)" strokeWidth="1" />
              <text x={p.x} y={p.y - 13} textAnchor="middle" fill="#fff" fontSize="8" fontWeight="bold">
                {data[idx].value}
              </text>
            </g>
          </g>
        ))}

        {data.map((d, idx) => {
          const divisor = data.length > 1 ? data.length - 1 : 1
          const x = paddingLeft + (idx / divisor) * chartWidth
          return (
            <text key={idx} x={x} y={height - 4} textAnchor="middle" fill="rgba(255,255,255,0.4)" fontSize="8" fontWeight="600">
              {d.label}
            </text>
          )
        })}

        <text x={paddingLeft - 6} y={paddingTop + 3} textAnchor="end" fill="rgba(255,255,255,0.4)" fontSize="8" fontWeight="600">
          {Math.round(maxVal)}
        </text>
        <text x={paddingLeft - 6} y={paddingTop + chartHeight / 2 + 3} textAnchor="end" fill="rgba(255,255,255,0.4)" fontSize="8" fontWeight="600">
          {Math.round(maxVal / 2)}
        </text>
        <text x={paddingLeft - 6} y={paddingTop + chartHeight + 3} textAnchor="end" fill="rgba(255,255,255,0.4)" fontSize="8" fontWeight="600">
          0
        </text>
      </svg>
    </div>
  )
}

// ── Custom SVG Bar Chart ─────────────────────────────────────────────────────
function BarChart({ data, width = 500, height = 180 }) {
  if (!data || data.length === 0) {
    return (
      <div className="w-full flex items-center justify-center h-[180px] border border-white/5 rounded-lg bg-ink-950/20 text-slate-500 text-xs">
        No data available
      </div>
    )
  }

  const maxVal = Math.max(...data.map(d => d.value), 10) || 10
  const paddingLeft = 35
  const paddingRight = 15
  const paddingTop = 20
  const paddingBottom = 25
  const chartWidth = width - paddingLeft - paddingRight
  const chartHeight = height - paddingTop - paddingBottom

  const gridLinesCount = 4
  const gridLines = []
  for (let i = 0; i <= gridLinesCount; i++) {
    gridLines.push(paddingTop + (i / gridLinesCount) * chartHeight)
  }

  const barWidth = Math.min(30, (chartWidth / data.length) * 0.5)
  const gap = (chartWidth - barWidth * data.length) / (data.length + 1)

  return (
    <div className="w-full text-center">
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto overflow-visible">
        <defs>
          <linearGradient id="bar-grad-purple" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#a855f7" />
            <stop offset="100%" stopColor="#6366f1" />
          </linearGradient>
        </defs>

        {/* Gridlines */}
        {gridLines.map((yVal, idx) => (
          <line
            key={idx}
            x1={paddingLeft}
            y1={yVal}
            x2={width - paddingRight}
            y2={yVal}
            stroke="rgba(255,255,255,0.05)"
            strokeDasharray={idx === gridLinesCount ? "0" : "3 3"}
          />
        ))}

        {/* Bars */}
        {data.map((d, idx) => {
          const x = paddingLeft + gap + idx * (barWidth + gap)
          const barHeight = (d.value / maxVal) * chartHeight
          const y = paddingTop + chartHeight - barHeight

          return (
            <g key={idx} className="group cursor-pointer">
              <rect
                x={x}
                y={y}
                width={barWidth}
                height={barHeight}
                rx="3"
                fill="url(#bar-grad-purple)"
                className="transition-all duration-300 hover:opacity-90"
              />
              <g className="opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                <rect x={x + barWidth / 2 - 15} y={y - 20} width="30" height="15" rx="3" fill="#12131a" stroke="rgba(255,255,255,0.1)" strokeWidth="1" />
                <text x={x + barWidth / 2} y={y - 10} textAnchor="middle" fill="#fff" fontSize="8" fontWeight="bold">
                  {d.value}
                </text>
              </g>
              <text x={x + barWidth / 2} y={height - 4} textAnchor="middle" fill="rgba(255,255,255,0.4)" fontSize="8" fontWeight="600">
                {d.label}
              </text>
            </g>
          )
        })}

        <text x={paddingLeft - 6} y={paddingTop + 3} textAnchor="end" fill="rgba(255,255,255,0.4)" fontSize="8" fontWeight="600">
          {Math.round(maxVal)}
        </text>
        <text x={paddingLeft - 6} y={paddingTop + chartHeight / 2 + 3} textAnchor="end" fill="rgba(255,255,255,0.4)" fontSize="8" fontWeight="600">
          {Math.round(maxVal / 2)}
        </text>
        <text x={paddingLeft - 6} y={paddingTop + chartHeight + 3} textAnchor="end" fill="rgba(255,255,255,0.4)" fontSize="8" fontWeight="600">
          0
        </text>
      </svg>
    </div>
  )
}

// ── Urgency and Status Constants ─────────────────────────────────────────────
const URGENCY = {
  High: { label: 'High', dot: 'bg-red-400', badge: 'bg-red-400/12 border-red-400/30 text-red-400', ring: 'border-l-red-400/40' },
  Medium: { label: 'Medium', dot: 'bg-gold', badge: 'bg-gold/12 border-gold/30 text-gold', ring: 'border-l-gold/40' },
  Low: { label: 'Low', dot: 'bg-slate-400', badge: 'bg-slate-400/10 border-slate-400/25 text-slate-400', ring: 'border-l-white/10' },
}

const STATUS = {
  'Open': { badge: 'bg-success/12 border-success/30 text-success' },
  'In Progress': { badge: 'bg-accent/12 border-accent/30 text-accent' },
  'Closed': { badge: 'bg-slate-400/10 border-slate-400/25 text-slate-500' },
}

const DEPT_COLORS = [
  'from-blue-500/20 to-blue-600/5',
  'from-purple-500/20 to-purple-600/5',
  'from-emerald-500/20 to-emerald-600/5',
  'from-orange-500/20 to-orange-600/5',
  'from-pink-500/20 to-pink-600/5',
  'from-cyan-500/20 to-cyan-600/5',
]

// ── Job Card Component for Candidates ────────────────────────────────────────
function JobCard({ mrf, idx }) {
  const urgency = URGENCY[mrf.levelOfUrgency] || URGENCY.Medium
  const status = STATUS[mrf.positionStatus] || STATUS.Open
  const gradient = DEPT_COLORS[idx % DEPT_COLORS.length]
  const skills = (mrf.otherKeySkills || '').split(',').map(s => s.trim()).filter(Boolean)
  const visibleSkills = skills.slice(0, 3)
  const extraSkills = skills.length - 3

  return (
    <div className={`card flex flex-col h-full overflow-hidden border-l-2 ${urgency.ring} hover:border-l-4 hover:-translate-y-0.5 transition-all duration-200 group`}>
      <div className={`h-1.5 bg-gradient-to-r ${gradient} w-full`} />
      <div className="p-5 flex flex-col gap-4 flex-1">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className={`px-1.5 py-0.5 text-[8px] font-bold rounded uppercase tracking-wider ${mrf.requestType === 'JD' ? 'bg-blue-500/15 text-blue-400 border border-blue-500/35' : 'bg-purple-500/15 text-purple-400 border border-purple-500/35'
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
  const [candidates, setCandidates] = useState([])
  const [sheetData, setSheetData] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('All')
  const [role, setRole] = useState(() => localStorage.getItem('hr_role') || 'candidate')
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem('hr_user')) } catch { return null }
  })
  const [toast, setToast] = useState(null)

  useEffect(() => {
    const handleStorageChange = () => {
      setRole(localStorage.getItem('hr_role') || 'candidate')
    }
    window.addEventListener('storage', handleStorageChange)
    return () => window.removeEventListener('storage', handleStorageChange)
  }, [])

  const loadDashboardData = async () => {
    setLoading(true)
    try {
      const [mrfList, sheetRows, candidateList] = await Promise.allSettled([
        mrfApi.list(),
        sheetApi.fetchAll(),
        candidateApi.list()
      ])

      if (mrfList.status === 'fulfilled') {
        setMrfs(mrfList.value || [])
      }
      if (sheetRows.status === 'fulfilled') {
        setSheetData(sheetRows.value?.recruitmentTracker || [])
      }
      if (candidateList.status === 'fulfilled') {
        setCandidates(candidateList.value || [])
      }
    } catch (err) {
      console.error('Error loading dashboard data:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadDashboardData()
  }, [])

  // ── FILTER LOGIC FOR CANDIDATE VIEW ─────────────────────────────────────────
  const FILTER_OPTIONS = ['All', 'High', 'Medium', 'Low', 'Open', 'In Progress', 'Closed']
  const approvedMrfs = mrfs.filter(m => m.mrfStatus === 'Approved')
  const filteredCandidatesJobs = filter === 'All'
    ? approvedMrfs
    : approvedMrfs.filter(m => m.levelOfUrgency === filter || m.positionStatus === filter)

  // ── Calculations for stats ──────────────────────────────────────────────────
  const openVacancies = mrfs
    .filter(m => m.mrfStatus === 'Approved' && (m.positionStatus === 'Open' || m.positionStatus === 'In Progress'))
    .reduce((sum, m) => sum + (parseInt(m.noOfPositions) || 0), 0)

  const pendingMRFs = mrfs.filter(m => m.mrfStatus === 'Pending Owner Approval').length
  const approvedMRFs = mrfs.filter(m => m.mrfStatus === 'Approved').length
  const rejectedMRFs = mrfs.filter(m => m.mrfStatus === 'Rejected').length
  const filledPositions = mrfs.filter(m => m.offerStatus === 'Joined' || m.offerStatus === 'Accepted').length
  const upcomingRetirements = mrfs.filter(m =>
    m.reasonForRequest === 'Retirement' ||
    m.reasonForRequest === 'Resignation' ||
    (m.employeeName && m.employeeName !== 'None' && m.employeeName !== '')
  ).length

  // ── 1. CANDIDATE DASHBOARD VIEW ─────────────────────────────────────────────
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
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 auto-rows-fr gap-4 fade-up-2">
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

  // ── 2. ADMIN DASHBOARD VIEW ─────────────────────────────────────────────────
  if (role === 'admin') {
    const adminKPI = [
      { label: 'Pending Approvals', value: pendingMRFs, change: '+6 this week', color: 'text-accent', bg: 'bg-white/5 border-white/10', icon: Clock },
      { label: 'Approved Requisitions', value: approvedMRFs, change: '+8 this week', color: 'text-accent', bg: 'bg-white/5 border-white/10', icon: CheckCircle2 },
      { label: 'Total Open Positions', value: openVacancies || 45, change: '+10 this week', color: 'text-accent', bg: 'bg-white/5 border-white/10', icon: Briefcase },
      { label: 'Total Employees', value: 245, change: '+12 last month', color: 'text-accent', bg: 'bg-white/5 border-white/10', icon: Users },
      { label: 'Active Departments', value: 14, change: 'No change', color: 'text-accent', bg: 'bg-white/5 border-white/10', icon: Building2 },
      { label: 'System Users', value: 87, change: '+5 this week', color: 'text-accent', bg: 'bg-white/5 border-white/10', icon: ShieldCheck }
    ]

    const workforceData = [
      { label: 'Engineering', value: 92 },
      { label: 'Product', value: 45 },
      { label: 'Design', value: 24 },
      { label: 'Marketing', value: 38 },
      { label: 'Sales', value: 42 },
      { label: 'HR', value: 14 }
    ]

    const statusChartData = [
      { label: 'Approved', value: approvedMRFs || 32, color: '#4F8EF7' },
      { label: 'Pending', value: pendingMRFs || 15, color: '#7E8CA8' },
      { label: 'Rejected', value: rejectedMRFs || 15, color: '#4A5870' }
    ]

    return (
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-6">
        {/* Welcome banner */}
        <div className="fade-up flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b border-white/5 pb-4">
          <div>
            <span className="section-tag mb-1">
              <ShieldCheck size={11} className="animate-pulse" /> HR Admin Console
            </span>
            <h1 className="font-display font-bold text-lg text-white">
              Welcome back, {user?.name || 'Admin'}
            </h1>
          </div>
          <div className="text-xs text-slate-400 font-medium flex items-center gap-1.5 bg-white/5 border border-white/10 px-3 py-1.5 rounded-lg">
            System status: <span className="text-emerald-400 font-bold flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> Operational</span>
          </div>
        </div>

        {loading ? (
          <div className="card p-24 flex flex-col items-center justify-center gap-3">
            <Loader2 className="w-8 h-8 text-accent animate-spin" />
            <p className="text-xs text-slate-500">Loading dashboard metrics...</p>
          </div>
        ) : (
          <>
            {/* KPI Cards Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 fade-up-1">
              {/* Hero Card: Pending Approvals */}
              <div className="col-span-2 sm:col-span-3 lg:col-span-2 card p-6 flex flex-col justify-between hover:-translate-y-0.5 transition-all duration-200 overflow-hidden">
                <div className="flex justify-between items-start">
                  <span className="text-[11px] font-bold text-slate-400 tracking-wider uppercase">Pending Approvals</span>
                  <Clock size={16} className="text-accent" />
                </div>
                <div className="mt-4 flex-1 flex flex-col justify-between">
                  <div>
                    <p className="font-display font-extrabold text-4xl text-white leading-none">{pendingMRFs}</p>
                    {pendingMRFs === 0 ? (
                      <p className="text-[10px] text-accent font-semibold mt-1.5 flex items-center gap-1">
                        All caught up! 🎉 No approvals pending.
                      </p>
                    ) : (
                      <p className="text-[10px] text-slate-500 font-semibold mt-1.5">
                        Requires action from admin owners
                      </p>
                    )}
                  </div>
                  <button
                    onClick={() => navigate('/mrf-approvals')}
                    className="mt-4 inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg bg-accent/10 hover:bg-accent text-accent hover:text-white border border-accent/25 text-xs font-semibold transition-all duration-150 w-fit"
                  >
                    Review Pending
                    <ArrowRight size={12} />
                  </button>
                </div>
              </div>

              {/* Card 2: Approved Requisitions */}
              <div className="card p-6 flex flex-col justify-between hover:-translate-y-0.5 transition-all duration-200 overflow-hidden">
                <div className="flex justify-between items-start">
                  <span className="text-[11px] font-bold text-slate-400 tracking-wider uppercase">Approved Requisitions</span>
                  <CheckCircle2 size={16} className="text-accent" />
                </div>
                <div className="mt-4">
                  <p className="font-display font-extrabold text-3xl text-white leading-none">{approvedMRFs}</p>
                  <p className="text-[10px] text-slate-500 font-semibold mt-1.5 flex items-center gap-1">
                    <TrendingUp size={10} /> Active hires
                  </p>
                </div>
              </div>

              {/* Card 3: Total Open Positions */}
              <div className="card p-6 flex flex-col justify-between hover:-translate-y-0.5 transition-all duration-200 overflow-hidden">
                <div className="flex justify-between items-start">
                  <span className="text-[11px] font-bold text-slate-400 tracking-wider uppercase">Open Positions</span>
                  <Briefcase size={16} className="text-accent" />
                </div>
                <div className="mt-4">
                  <p className="font-display font-extrabold text-3xl text-white leading-none">{openVacancies || 45}</p>
                  <p className="text-[10px] text-slate-500 font-semibold mt-1.5 flex items-center gap-1">
                    <TrendingUp size={10} /> Across departments
                  </p>
                </div>
              </div>

              {/* Card 4: Total Employees */}
              <div className="card p-6 flex flex-col justify-between hover:-translate-y-0.5 transition-all duration-200 overflow-hidden">
                <div className="flex justify-between items-start">
                  <span className="text-[11px] font-bold text-slate-400 tracking-wider uppercase">Total Employees</span>
                  <Users size={16} className="text-accent" />
                </div>
                <div className="mt-4">
                  <p className="font-display font-extrabold text-3xl text-white leading-none">245</p>
                  <p className="text-[10px] text-slate-500 font-semibold mt-1.5">
                    +12 last month
                  </p>
                </div>
              </div>

              {/* Card 5: System Users */}
              <div className="card p-6 flex flex-col justify-between hover:-translate-y-0.5 transition-all duration-200 overflow-hidden">
                <div className="flex justify-between items-start">
                  <span className="text-[11px] font-bold text-slate-400 tracking-wider uppercase">System Users</span>
                  <ShieldCheck size={16} className="text-accent" />
                </div>
                <div className="mt-4">
                  <p className="font-display font-extrabold text-3xl text-white leading-none">87</p>
                  <p className="text-[10px] text-slate-500 font-semibold mt-1.5">
                    Authorized roles
                  </p>
                </div>
              </div>
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 fade-up-2">
              {/* Workforce Overview Bar Chart */}
              <div className="card p-6 border border-white/5 bg-ink-950/40 flex flex-col justify-between overflow-hidden">
                <h3 className="font-display font-bold text-white text-[14px] flex items-center gap-2 border-b border-white/5 pb-3">
                  <Building2 size={15} className="text-purple-400" /> Workforce Overview
                </h3>
                <div className="mt-6 flex-1 flex items-center justify-center min-h-[180px]">
                  <BarChart data={workforceData} />
                </div>
              </div>

              {/* Requisition Status Donut */}
              <div className="card p-6 border border-white/5 bg-ink-950/40 flex flex-col justify-between overflow-hidden">
                <h3 className="font-display font-bold text-white text-[14px] flex items-center gap-2 border-b border-white/5 pb-3">
                  <Activity size={15} className="text-emerald-400" /> Requisition Status
                </h3>
                <div className="mt-6 flex-1 flex items-center justify-center min-h-[180px]">
                  <DonutChart data={statusChartData} />
                </div>
              </div>

              {/* Recent System Activities List */}
              <div className="card p-6 border border-white/5 bg-ink-950/40 flex flex-col justify-between overflow-hidden">
                <h3 className="font-display font-bold text-white text-[14px] flex items-center gap-2 border-b border-white/5 pb-3">
                  <Bell size={15} className="text-amber-400" /> Recent System Activities
                </h3>
                <div className="mt-4 flex-1 space-y-3.5 divide-y divide-white/5">
                  {[
                    { text: 'New user added: John Doe (HR Manager)', time: '10 min ago', icon: UserCheck, color: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20' },
                    { text: 'Department updated: Engineering', time: '1 hour ago', icon: Building2, color: 'text-purple-400 bg-purple-500/10 border-purple-500/20' },
                    { text: 'New requisition approved: Senior Frontend Developer', time: '2 hours ago', icon: CheckCircle2, color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' },
                    { text: 'System backup completed successfully', time: 'Yesterday', icon: ShieldCheck, color: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20' }
                  ].map((act, idx) => {
                    const ActIcon = act.icon
                    return (
                      <div key={idx} className="pt-3.5 first:pt-0 flex items-start gap-3 text-xs">
                        <div className={`p-1.5 rounded-lg border ${act.color} flex-shrink-0 mt-0.5`}>
                          <ActIcon size={12} />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-slate-300 font-medium leading-relaxed">{act.text}</p>
                          <span className="text-[10px] text-slate-500 font-semibold mt-0.5 block">{act.time}</span>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    )
  }

  // ── 3. HR MANAGER DASHBOARD VIEW ────────────────────────────────────────────
  if (role === 'hr') {
    const hrKPI = [
      { label: 'Job Requisitions', value: approvedMRFs || 24, change: '+4 from last week', color: 'text-accent', bg: 'bg-white/5 border-white/10', icon: CheckCircle2 },
      { label: 'Active Openings', value: openVacancies || 18, change: '+3 from last week', color: 'text-accent', bg: 'bg-white/5 border-white/10', icon: Briefcase },
      { label: 'Candidates Pipeline', value: candidates.length || 156, change: '+12 from last week', color: 'text-accent', bg: 'bg-white/5 border-white/10', icon: Users },
      { label: 'Interviews Scheduled', value: candidates.filter(c => c.overallStatus === 'Interview').length || 32, change: '+5 from last week', color: 'text-accent', bg: 'bg-white/5 border-white/10', icon: Calendar },
      { label: 'Offers Released', value: candidates.filter(c => c.overallStatus === 'Offer').length || 7, change: '+1 from last week', color: 'text-accent', bg: 'bg-white/5 border-white/10', icon: Award },
      { label: 'Positions Filled', value: candidates.filter(c => c.overallStatus === 'Joined').length || 25, change: '+6 from last month', color: 'text-accent', bg: 'bg-white/5 border-white/10', icon: UserCheck }
    ]

    const trendData = [
      { label: '14 Apr', value: 12 },
      { label: '21 Apr', value: 20 },
      { label: '28 Apr', value: 18 },
      { label: '5 May', value: 28 },
      { label: '12 May', value: 24 },
      { label: '19 May', value: 32 }
    ]

    const stageData = [
      { label: 'Shared w/ HOD', value: candidates.filter(c => c.overallStatus === 'Applied' || c.overallStatus === 'Screening').length || 62, color: '#4F8EF7' },
      { label: 'Approved',      value: candidates.filter(c => c.overallStatus === 'Approved by HOD' || c.overallStatus === 'Approved by Head').length || 38, color: '#3A7AE8' },
      { label: 'Interview',     value: candidates.filter(c => c.overallStatus === 'Interview').length || 32, color: '#7E8CA8' },
      { label: 'Offer / Hired', value: candidates.filter(c => c.overallStatus === 'Offer' || c.overallStatus === 'Joined').length || 8, color: '#2C5CC5' }
    ]

    return (
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-6">
        {/* Welcome banner */}
        <div className="fade-up flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b border-white/5 pb-4">
          <div>
            <span className="section-tag mb-1">
              <Activity size={11} className="animate-pulse" /> HR Recruiter Console
            </span>
            <h1 className="font-display font-bold text-lg text-white">
              Welcome back, {user?.name || 'HR Manager'}
            </h1>
          </div>
          <div className="text-xs text-slate-400 font-medium">
            Last sync: <span className="text-slate-300 font-bold">Just now</span>
          </div>
        </div>

        {loading ? (
          <div className="card p-24 flex flex-col items-center justify-center gap-3">
            <Loader2 className="w-8 h-8 text-accent animate-spin" />
            <p className="text-xs text-slate-500">Loading your recruiter dashboard...</p>
          </div>
        ) : (
          <>
            {/* Recruiter KPI Cards Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 fade-up-1">
              {/* Hero Card: Active Openings */}
              <div className="col-span-2 sm:col-span-3 lg:col-span-2 card p-6 flex flex-col justify-between hover:-translate-y-0.5 transition-all duration-200 overflow-hidden">
                <div className="flex justify-between items-start">
                  <span className="text-[11px] font-bold text-slate-400 tracking-wider uppercase">Active Openings</span>
                  <Briefcase size={16} className="text-accent" />
                </div>
                <div className="mt-4 flex-1 flex flex-col justify-between">
                  <div>
                    <p className="font-display font-extrabold text-4xl text-white leading-none">{openVacancies || 18}</p>
                    {openVacancies === 0 ? (
                      <p className="text-[10px] text-slate-500 font-semibold mt-1.5">No active requisitions live.</p>
                    ) : (
                      <p className="text-[10px] text-accent font-semibold mt-1.5">Actively sourcing & screening</p>
                    )}
                  </div>
                  <button
                    onClick={() => navigate('/recruitment')}
                    className="mt-4 inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg bg-accent/10 hover:bg-accent text-accent hover:text-white border border-accent/25 text-xs font-semibold transition-all duration-150 w-fit"
                  >
                    Manage Recruitment <ArrowRight size={12} />
                  </button>
                </div>
              </div>

              {/* Card 2: Candidates Pipeline */}
              <div className="card p-6 flex flex-col justify-between hover:-translate-y-0.5 transition-all duration-200 overflow-hidden">
                <div className="flex justify-between items-start">
                  <span className="text-[11px] font-bold text-slate-400 tracking-wider uppercase">Candidates</span>
                  <Users size={16} className="text-accent" />
                </div>
                <div className="mt-4">
                  <p className="font-display font-extrabold text-3xl text-white leading-none">{candidates.length || 156}</p>
                  <p className="text-[10px] text-slate-500 font-semibold mt-1.5 flex items-center gap-1">
                    <TrendingUp size={10} /> +12 this week
                  </p>
                </div>
              </div>

              {/* Card 3: Interviews Scheduled */}
              <div className="card p-6 flex flex-col justify-between hover:-translate-y-0.5 transition-all duration-200 overflow-hidden">
                <div className="flex justify-between items-start">
                  <span className="text-[11px] font-bold text-slate-400 tracking-wider uppercase">Interviews</span>
                  <Calendar size={16} className="text-accent" />
                </div>
                <div className="mt-4">
                  <p className="font-display font-extrabold text-3xl text-white leading-none">
                    {candidates.filter(c => c.overallStatus === 'Interview').length || 32}
                  </p>
                  <p className="text-[10px] text-slate-500 font-semibold mt-1.5">+5 from last week</p>
                </div>
              </div>

              {/* Card 4: Offers Released */}
              <div className="card p-6 flex flex-col justify-between hover:-translate-y-0.5 transition-all duration-200 overflow-hidden">
                <div className="flex justify-between items-start">
                  <span className="text-[11px] font-bold text-slate-400 tracking-wider uppercase">Offers Released</span>
                  <Award size={16} className="text-accent" />
                </div>
                <div className="mt-4">
                  <p className="font-display font-extrabold text-3xl text-white leading-none">
                    {candidates.filter(c => c.overallStatus === 'Offer').length || 7}
                  </p>
                  <p className="text-[10px] text-slate-500 font-semibold mt-1.5">Awaiting signatures</p>
                </div>
              </div>

              {/* Card 5: Positions Filled */}
              <div className="card p-6 flex flex-col justify-between hover:-translate-y-0.5 transition-all duration-200 overflow-hidden">
                <div className="flex justify-between items-start">
                  <span className="text-[11px] font-bold text-slate-400 tracking-wider uppercase">Hired & Joined</span>
                  <UserCheck size={16} className="text-accent" />
                </div>
                <div className="mt-4">
                  <p className="font-display font-extrabold text-3xl text-white leading-none">
                    {candidates.filter(c => c.overallStatus === 'Joined').length || 25}
                  </p>
                  <p className="text-[10px] text-slate-500 font-semibold mt-1.5">+6 this month</p>
                </div>
              </div>
            </div>

            {/* Line Chart, Donut Chart, and Candidate Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 fade-up-2">
              {/* Requisitions Overview Line Chart */}
              <div className="card p-6 border border-white/5 bg-ink-950/40 flex flex-col justify-between overflow-hidden">
                <h3 className="font-display font-bold text-white text-[14px] flex items-center gap-2 border-b border-white/5 pb-3">
                  <TrendingUp size={15} className="text-accent" /> Requisitions Overview (6 Weeks)
                </h3>
                <div className="mt-6 flex-1 flex items-center justify-center min-h-[180px]">
                  <LineChart data={trendData} />
                </div>
              </div>

              {/* Candidates by Stage Donut Chart */}
              <div className="card p-6 border border-white/5 bg-ink-950/40 flex flex-col justify-between overflow-hidden">
                <h3 className="font-display font-bold text-white text-[14px] flex items-center gap-2 border-b border-white/5 pb-3">
                  <Users size={15} className="text-white" /> Candidates by Stage
                </h3>
                <div className="mt-6 flex-1 flex items-center justify-center min-h-[180px]">
                  <DonutChart data={stageData} />
                </div>
              </div>

              {/* Recent Recruiter Activities */}
              <div className="card p-6 border border-white/5 bg-ink-950/40 flex flex-col justify-between overflow-hidden">
                <h3 className="font-display font-bold text-white text-[14px] flex items-center gap-2 border-b border-white/5 pb-3">
                  <Sparkles size={15} className="text-accent" /> Recent Recruiter Activities
                </h3>
                <div className="mt-4 flex-1 space-y-3.5 divide-y divide-white/5">
                  {[
                    { text: 'New candidate applied for Senior Frontend Developer', score: '94% match score', time: '15 min ago', icon: Sparkles, color: 'text-accent bg-accent/10 border-accent/20' },
                    { text: 'Interview scheduled with candidate Amit Patel',         score: '88% match score', time: '1 hour ago',  icon: Calendar,    color: 'text-accent bg-accent/10 border-accent/20' },
                    { text: 'Offer released for candidate Priya Sharma',             score: '91% match score', time: '3 hours ago', icon: Award,       color: 'text-slate-300 bg-white/5 border-white/10' },
                    { text: 'Candidate Priya Sharma accepted the offer',             score: 'Joined',          time: 'Yesterday',   icon: CheckCircle2, color: 'text-accent bg-accent/10 border-accent/20' }
                  ].map((act, idx) => {
                    const ActIcon = act.icon
                    return (
                      <div key={idx} className="pt-3.5 first:pt-0 flex items-start gap-3 text-xs">
                        <div className={`p-1.5 rounded-lg border ${act.color} flex-shrink-0 mt-0.5`}>
                          <ActIcon size={12} />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-slate-300 font-medium leading-relaxed">{act.text}</p>
                          <div className="flex justify-between items-center mt-1">
                            <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold border ${act.score === 'Joined' ? 'bg-accent/10 text-accent border-accent/15' : 'bg-white/5 text-slate-300 border-white/10'}`}>{act.score}</span>
                            <span className="text-[9px] text-slate-500 font-semibold">{act.time}</span>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    )
  }

  // ── 4. DEPARTMENT HEAD DASHBOARD VIEW ────────────────────────────────────────
  const myMrfs = mrfs.filter(m => m.submittedBy === user?.name || !m.submittedBy)
  const myDrafts = myMrfs.filter(m => m.mrfStatus === 'Draft').length
  const myPending = myMrfs.filter(m => m.mrfStatus === 'Pending Owner Approval').length
  const myApproved = myMrfs.filter(m => m.mrfStatus === 'Approved').length
  const myRejected = myMrfs.filter(m => m.mrfStatus === 'Rejected').length

  const myOpenPositions = myMrfs
    .filter(m => m.mrfStatus === 'Approved')
    .reduce((s, m) => s + (parseInt(m.noOfPositions) || 0), 0)

  const pendingCandidates = candidates.filter(c => 
    (c.stage === 'Pending Head Approval' || c.stage === 'Shared with HOD') &&
    (c.jobOpeningId?.department === user?.department || !user?.department)
  )
  const pendingApprovalsCount = pendingCandidates.length

  const dhKPI = [
    { label: 'Open Positions',    value: myOpenPositions || 12,        change: '+2 from last month', color: 'text-accent', bg: 'bg-white/5 border-white/10', icon: Briefcase },
    { label: 'Hiring Requests',   value: myMrfs.length || 8,           change: '+1 from last week',  color: 'text-accent', bg: 'bg-white/5 border-white/10', icon: FileText },
    { label: 'Pending Approvals', value: pendingApprovalsCount || 5,   change: '-2 from last week',  color: 'text-accent', bg: 'bg-white/5 border-white/10', icon: Clock },
    { label: 'Team Strength',     value: 48,                           change: '+3 from last month', color: 'text-accent', bg: 'bg-white/5 border-white/10', icon: Users },
    { label: 'Upcoming Exits',    value: upcomingRetirements || 3,     change: 'Next 30 days',       color: 'text-accent', bg: 'bg-white/5 border-white/10', icon: Calendar }
  ]

  const dhStatusData = [
    { label: 'Approved', value: myApproved || 10, color: '#4F8EF7' },
    { label: 'Pending', value: myPending || 5, color: '#7E8CA8' },
    { label: 'Rejected', value: myRejected || 4, color: '#4A5870' }
  ]

  const MRF_STATUS_CFG = {
    'Draft': { label: 'Draft', color: 'text-slate-400', bg: 'bg-white/5 border-white/8', dot: 'bg-slate-400' },
    'Pending Owner Approval': { label: 'Pending Review', color: 'text-slate-300', bg: 'bg-white/5 border-white/10', dot: 'bg-slate-400' },
    'Approved': { label: 'Approved', color: 'text-accent', bg: 'bg-accent/10 border-accent/20', dot: 'bg-accent' },
    'Rejected': { label: 'Rejected', color: 'text-slate-500', bg: 'bg-white/5 border-white/8', dot: 'bg-slate-600' },
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      {/* Welcome Banner */}
      <div className="fade-up flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b border-white/5 pb-4">
        <div>
          <span className="section-tag mb-1">
            <Activity size={11} className="animate-pulse" /> Department Head Console
          </span>
          <h1 className="font-display font-bold text-lg text-white">
            Welcome back, {user?.name || 'Head'}
          </h1>
        </div>
        <div className="text-xs text-slate-400 font-medium bg-white/5 border border-white/10 px-3 py-1.5 rounded-lg">
          Department: <span className="text-amber-400 font-bold">{user?.department || 'Operations'}</span>
        </div>
      </div>

      {loading ? (
        <div className="card p-24 flex flex-col items-center justify-center gap-3">
          <Loader2 className="w-8 h-8 text-accent animate-spin" />
          <p className="text-xs text-slate-500">Loading your dashboard...</p>
        </div>
      ) : (
        <>
          {/* HOD KPI Cards Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 fade-up-1">
            {/* Hero Card: Pending Approvals */}
            <div className="col-span-2 sm:col-span-3 lg:col-span-2 card p-6 flex flex-col justify-between hover:-translate-y-0.5 transition-all duration-200 overflow-hidden">
              <div className="flex justify-between items-start">
                <span className="text-[11px] font-bold text-slate-400 tracking-wider uppercase">Pending Approvals</span>
                <Clock size={16} className="text-accent" />
              </div>
              <div className="mt-4 flex-1 flex flex-col justify-between">
                <div>
                  <p className="font-display font-extrabold text-4xl text-white leading-none">{pendingApprovalsCount}</p>
                  {pendingApprovalsCount === 0 ? (
                    <p className="text-[10px] text-accent font-semibold mt-1.5 flex items-center gap-1">
                      All caught up! 🎉 No approvals pending.
                    </p>
                  ) : (
                    <p className="text-[10px] text-slate-500 font-semibold mt-1.5">
                      Candidates awaiting head feedback
                    </p>
                  )}
                </div>
                <button
                  onClick={() => navigate('/my-mrfs')}
                  className="mt-4 inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg bg-accent/10 hover:bg-accent text-accent hover:text-white border border-accent/25 text-xs font-semibold transition-all duration-150 w-fit"
                >
                  Review Applications <ArrowRight size={12} />
                </button>
              </div>
            </div>

            {/* Card 2: Hiring Requests */}
            <div className="card p-6 flex flex-col justify-between hover:-translate-y-0.5 transition-all duration-200 overflow-hidden">
              <div className="flex justify-between items-start">
                <span className="text-[11px] font-bold text-slate-400 tracking-wider uppercase">Hiring Requests</span>
                <FileText size={16} className="text-accent" />
              </div>
              <div className="mt-4 flex-1 flex flex-col justify-between">
                <div>
                  <p className="font-display font-extrabold text-3xl text-white leading-none">{myMrfs.length || 8}</p>
                  <p className="text-[10px] text-slate-500 font-semibold mt-1.5">Total requisitions</p>
                </div>
                <button
                  onClick={() => navigate('/my-mrfs', { state: { openNewRequest: true } })}
                  className="mt-3 text-[10px] text-accent font-bold hover:underline flex items-center gap-0.5 text-left"
                >
                  + Create Requisition
                </button>
              </div>
            </div>

            {/* Card 3: Open Positions */}
            <div className="card p-6 flex flex-col justify-between hover:-translate-y-0.5 transition-all duration-200 overflow-hidden">
              <div className="flex justify-between items-start">
                <span className="text-[11px] font-bold text-slate-400 tracking-wider uppercase">Open Positions</span>
                <Briefcase size={16} className="text-accent" />
              </div>
              <div className="mt-4">
                <p className="font-display font-extrabold text-3xl text-white leading-none">{myOpenPositions || 12}</p>
                <p className="text-[10px] text-slate-500 font-semibold mt-1.5 flex items-center gap-1">
                  <TrendingUp size={10} /> Active vacancies
                </p>
              </div>
            </div>

            {/* Card 4: Team Strength */}
            <div className="card p-6 flex flex-col justify-between hover:-translate-y-0.5 transition-all duration-200 overflow-hidden">
              <div className="flex justify-between items-start">
                <span className="text-[11px] font-bold text-slate-400 tracking-wider uppercase">Team Strength</span>
                <Users size={16} className="text-accent" />
              </div>
              <div className="mt-4">
                <p className="font-display font-extrabold text-3xl text-white leading-none">48</p>
                <p className="text-[10px] text-slate-500 font-semibold mt-1.5">
                  Current head count
                </p>
              </div>
            </div>

            {/* Card 5: Upcoming Exits */}
            <div className="card p-6 flex flex-col justify-between hover:-translate-y-0.5 transition-all duration-200 overflow-hidden">
              <div className="flex justify-between items-start">
                <span className="text-[11px] font-bold text-slate-400 tracking-wider uppercase">Upcoming Exits</span>
                <Calendar size={16} className="text-accent" />
              </div>
              <div className="mt-4">
                <p className="font-display font-extrabold text-3xl text-white leading-none">{upcomingRetirements || 3}</p>
                <p className="text-[10px] text-slate-500 font-semibold mt-1.5">
                  Next 30 days
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 fade-up-2">
            {/* Left side: Hiring Requests Status Donut */}
            <div className="card p-6 border border-white/5 bg-ink-950/40 flex flex-col justify-between overflow-hidden">
              <h3 className="font-display font-bold text-white text-[14px] flex items-center gap-2 border-b border-white/5 pb-3">
                <Activity size={15} className="text-emerald-400" /> Hiring Requests Status
              </h3>
              <div className="mt-6 flex-1 flex items-center justify-center min-h-[180px]">
                <DonutChart data={dhStatusData} />
              </div>
            </div>

            {/* Right side: Recent Requisitions Table */}
            <div className="lg:col-span-2 card p-6 border border-white/5 bg-ink-950/40 flex flex-col justify-between overflow-hidden">
              <div className="flex justify-between items-center border-b border-white/5 pb-4">
                <h3 className="font-display font-bold text-white text-base flex items-center gap-2">
                  <FileText size={16} className="text-accent" /> Recent Hiring Requests
                </h3>
                <Link to="/my-mrfs" className="text-xs text-accent font-semibold hover:underline flex items-center gap-1">
                  View All <ArrowRight size={12} />
                </Link>
              </div>

              {myMrfs.length === 0 ? (
                <div className="py-12 text-center text-slate-500 italic text-xs">
                  No requisitions created yet. Click "Create Requisition" to submit your first request.
                </div>
              ) : (
                <div className="divide-y divide-white/5 flex-1">
                  {[...myMrfs].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 4).map(mrf => {
                    const sCfg = MRF_STATUS_CFG[mrf.mrfStatus] || MRF_STATUS_CFG['Draft']
                    const isPosted = mrf.mrfStatus === 'Approved' && (mrf.positionStatus === 'Open' || mrf.positionStatus === 'In Progress')
                    return (
                      <div key={mrf._id} className="py-3.5 flex items-center justify-between gap-4">
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <p className="font-semibold text-white text-sm truncate">{mrf.designation}</p>
                            {isPosted && (
                              <span className="px-1.5 py-0.5 text-[8px] font-bold rounded bg-emerald-500/15 text-emerald-400 border border-emerald-500/25">
                                LIVE
                              </span>
                            )}
                          </div>
                          <p className="text-[10px] text-slate-500 mt-1">
                            {mrf.department}{mrf.location ? ` · ${mrf.location}` : ''} · {mrf.noOfPositions || 1} position(s)
                          </p>
                        </div>
                        <div className="flex flex-col items-end gap-1 flex-shrink-0">
                          <span className={`px-2 py-0.5 rounded border text-[10px] font-bold flex items-center gap-1 ${sCfg.bg} ${sCfg.color}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${sCfg.dot}`} />
                            {sCfg.label}
                          </span>
                          <span className="text-[10px] text-slate-600">
                            {new Date(mrf.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}
                          </span>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          </div>

        </>
      )}
    </div>
  )
}
