import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  TrendingUp, Users, Clock, CheckCircle2, AlertCircle,
  Briefcase, Plus, ShieldCheck, FileText, ArrowRight, Activity, Calendar,
  MapPin, GraduationCap, Building2, Flame, Filter, Download, Loader2,
  Award, UserCheck, XCircle, Search, Sparkles, Bell, RefreshCw, FileSpreadsheet, ExternalLink,
  PieChart, BarChart3, ClipboardList
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

// ── Trend helper for requisitions ────────────────────────────────────────────
function getTrendData(mrfList) {
  const weeks = []
  for (let i = 5; i >= 0; i--) {
    const d = new Date()
    d.setDate(d.getDate() - i * 7)
    weeks.push({
      start: new Date(d.getFullYear(), d.getMonth(), d.getDate() - d.getDay()),
      label: d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }),
      value: 0
    })
  }

  mrfList.forEach(m => {
    const created = new Date(m.createdAt)
    for (let i = 0; i < weeks.length; i++) {
      const nextWeekStart = new Date(weeks[i].start)
      nextWeekStart.setDate(nextWeekStart.getDate() + 7)
      if (created >= weeks[i].start && created < nextWeekStart) {
        weeks[i].value++
        break
      }
    }
  })

  const hasData = weeks.some(w => w.value > 0)
  if (!hasData) {
    return [
      { label: 'Wk 1', value: 5 },
      { label: 'Wk 2', value: 8 },
      { label: 'Wk 3', value: 12 },
      { label: 'Wk 4', value: 15 },
      { label: 'Wk 5', value: 19 },
      { label: 'Wk 6', value: mrfList.length || 24 }
    ]
  }
  return weeks.map(w => ({ label: w.label, value: w.value }))
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
  High: { label: 'High', dot: 'bg-accent', badge: 'bg-accent/10 border-accent/20 text-accent', ring: 'border-l-accent' },
  Medium: { label: 'Medium', dot: 'bg-[var(--text-secondary)]', badge: 'bg-[var(--bg-secondary)] border-[var(--border-color)] text-[var(--text-primary)]', ring: 'border-l-[var(--border-color)]' },
  Low: { label: 'Low', dot: 'bg-[var(--text-secondary)]', badge: 'bg-[var(--bg-secondary)] border-[var(--border-color)] text-[var(--text-secondary)]', ring: 'border-l-[var(--border-color)]' },
}

const STATUS = {
  'Open': { badge: 'bg-accent/10 border-accent/20 text-accent' },
  'In Progress': { badge: 'bg-[var(--bg-secondary)] border-[var(--border-color)] text-[var(--text-primary)]' },
  'Closed': { badge: 'bg-[var(--bg-secondary)] border-[var(--border-color)] text-slate-500' },
}

const DEPT_COLORS = [
  'from-accent/20 to-transparent',
  'from-slate-500/10 to-transparent',
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
              <span className={`px-1.5 py-0.5 text-[8px] font-bold rounded uppercase tracking-wider ${mrf.requestType === 'JD' ? 'bg-blue-500/15 text-blue-400 border border-blue-500/35' : 'bg-slate-600/15 text-slate-400 border border-slate-600/35'
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
            className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg btn-primary text-xs font-semibold group/btn"
          >
            Apply Now
            <ArrowRight size={12} className="group-hover/btn:translate-x-0.5 transition-transform" />
          </Link>
        </div>
      </div>
    </div>
  )
}

// ── Color palettes ─────────────────────────────────────────────────────────
const PALETTE = ['#06b6d4', '#6366f1', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6', '#14b8a6', '#f97316', '#64748b']

// ── Compact KPI Card ─────────────────────────────────────────────────────────
function CompactKPICard({ item }) {
  const Icon = item.icon
  return (
    <div className={`p-3.5 rounded-xl border flex flex-col justify-between hover:-translate-y-0.5 transition-all duration-200 ${item.bg}`}>
      <div className="flex items-center justify-between gap-3 w-full">
        <div className="min-w-0 flex-1">
          <span className="text-[10px] font-bold text-slate-400 tracking-wider uppercase block truncate">
            {item.label}
          </span>
          <p className={`font-display font-extrabold text-2xl mt-1 leading-none ${item.color}`}>
            {item.value}
          </p>
        </div>
        <div className={`p-2 rounded-lg bg-white/5 ${item.color} flex-shrink-0`}>
          <Icon size={14} />
        </div>
      </div>
      {item.change && (
        <p className="text-[9px] text-slate-500 font-semibold mt-1 truncate">
          {item.change}
        </p>
      )}
      {item.action && (
        <button
          onClick={item.action.onClick}
          className={`mt-2.5 w-full flex items-center justify-center gap-1 py-1 px-2 rounded-lg text-[9px] font-bold border transition-all duration-150 ${item.action.className}`}
        >
          {item.action.text}
          <ArrowRight size={10} />
        </button>
      )}
    </div>
  )
}

// ── Recent Candidates Card ───────────────────────────────────────────────────
function RecentCandidatesCard({ candidates }) {
  const recentCandidates = [...candidates]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 5)

  return (
    <div className="card p-4 flex flex-col justify-between overflow-hidden">
      <div>
        <h3 className="font-display font-bold text-white text-xs flex items-center gap-2 border-b border-white/5 pb-3">
          <Users size={14} className="text-accent" />
          Recent Candidates
        </h3>
        {recentCandidates.length === 0 ? (
          <p className="text-xs text-slate-500 italic py-6 text-center">No recent candidates</p>
        ) : (
          <div className="divide-y divide-white/5 mt-2">
            {recentCandidates.map(c => (
              <div key={c._id} className="py-2.5 flex justify-between items-center text-xs">
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-white truncate">{c.details?.fullName || 'Anonymous'}</p>
                  <p className="text-[10px] text-slate-500 truncate mt-0.5">{c.details?.currentTitle || 'No Title'}</p>
                </div>
                <div className="flex flex-col items-end gap-1 ml-3 flex-shrink-0">
                  <span className="px-1.5 py-0.5 rounded bg-white/5 border border-white/10 text-[9px] text-slate-400">
                    {c.overallStatus || 'Applied'}
                  </span>
                  <span className="text-[9px] text-slate-500">
                    {relativeDate(c.createdAt)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

// ── Upcoming Joining Dates Card ──────────────────────────────────────────────
function UpcomingJoiningDatesCard({ tracker }) {
  const upcomingJoins = [...tracker]
    .filter(t => t.tentativeDOJ || t.actualDOJ)
    .sort((a, b) => {
      const dateA = new Date(a.tentativeDOJ || a.actualDOJ)
      const dateB = new Date(b.tentativeDOJ || b.actualDOJ)
      return dateA - dateB
    })
    .slice(0, 5)

  return (
    <div className="card p-4 flex flex-col justify-between overflow-hidden">
      <div>
        <h3 className="font-display font-bold text-white text-xs flex items-center gap-2 border-b border-white/5 pb-3">
          <Calendar size={14} className="text-indigo-400" />
          Upcoming Joining Dates
        </h3>
        {upcomingJoins.length === 0 ? (
          <p className="text-xs text-slate-500 italic py-6 text-center">No upcoming joining dates</p>
        ) : (
          <div className="divide-y divide-white/5 mt-2">
            {upcomingJoins.map((t, idx) => (
              <div key={t._id || idx} className="py-2.5 flex justify-between items-center text-xs">
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-white truncate">{t.offeredCandidateName || 'TBD'}</p>
                  <p className="text-[10px] text-slate-500 truncate mt-0.5">{t.offeredDesignation || 'TBD'} · {t.department}</p>
                </div>
                <div className="flex flex-col items-end gap-1 ml-3 flex-shrink-0">
                  <span className="px-1.5 py-0.5 rounded bg-indigo-500/10 border border-indigo-500/20 text-[9px] text-indigo-400">
                    {new Date(t.tentativeDOJ || t.actualDOJ).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}
                  </span>
                  <span className="text-[9px] text-slate-500">
                    {t.offerStatus}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

// Report Donut / Pie chart (Compacted)
function ReportDonutChart({ data, size = 110, title }) {
  const total = data.reduce((s, d) => s + d.value, 0) || 1
  const r = 58
  const circ = 2 * Math.PI * r
  let acc = 0

  return (
    <div className="flex flex-col items-center gap-2 w-full">
      {title && <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{title}</p>}
      <div className="flex items-center gap-3 w-full justify-center">
        <div className="relative flex-shrink-0" style={{ width: size, height: size }}>
          <svg viewBox="0 0 200 200" className="w-full h-full -rotate-90">
            <circle cx="100" cy="100" r={r} fill="transparent" stroke="rgba(255,255,255,0.05)" strokeWidth="16" />
            {data.map((item, i) => {
              const pct = item.value / total
              const dashOffset = circ - pct * circ
              const rot = (acc / total) * 360
              acc += item.value
              const midAngle = (rot + pct * 180) * Math.PI / 180
              const tx = 100 + Math.cos(midAngle) * (r + 22)
              const ty = 100 + Math.sin(midAngle) * (r + 22)
              return (
                <g key={i}>
                  <circle cx="100" cy="100" r={r} fill="transparent" stroke={item.color}
                    strokeWidth="16" strokeDasharray={circ} strokeDashoffset={dashOffset}
                    transform={`rotate(${rot} 100 100)`} className="transition-all duration-700" />
                  {pct > 0.08 && (
                    <g style={{ transform: `rotate(90deg)`, transformOrigin: `${tx}px ${ty}px` }}>
                      <text x={tx} y={ty} fill={item.color} fontSize="11" fontWeight="bold"
                        textAnchor="middle" dominantBaseline="middle">
                        {Math.round(pct * 100)}%
                      </text>
                    </g>
                  )}
                </g>
              )
            })}
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-base font-bold text-white leading-none">{total}</span>
            <span className="text-[7px] text-slate-500 uppercase tracking-widest font-bold mt-0.5">Total</span>
          </div>
        </div>
        <div className="space-y-1.5 flex-1 min-w-0">
          {data.slice(0, 5).map((item, i) => (
            <div key={i} className="flex items-center justify-between text-[10px] border-b border-white/5 pb-1 last:border-0">
              <div className="flex items-center gap-1.5 min-w-0">
                <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: item.color }} />
                <span className="text-slate-400 truncate">{item.label}</span>
              </div>
              <span className="text-white font-bold ml-1.5 flex-shrink-0">
                {item.value}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// Report Vertical bar chart (Compacted)
function ReportBarChart({ data, height = 110, colorFn }) {
  const maxVal = Math.max(...data.map(d => d.value), 1)
  const Y_STEPS = 3
  const gridLines = Array.from({ length: Y_STEPS + 1 }, (_, i) => Math.round((maxVal / Y_STEPS) * (Y_STEPS - i)))

  return (
    <div className="p-2.5 rounded-xl bg-white/2 border border-white/5 w-full">
      <div className="flex gap-2" style={{ height }}>
        <div className="flex flex-col justify-between text-[9px] text-slate-500 font-bold w-6 items-end">
          {gridLines.map((g, i) => <span key={i}>{g}</span>)}
        </div>
        <div className="flex-1 border-b border-l border-white/10 relative flex items-end justify-around px-1 pt-2">
          {Array.from({ length: Y_STEPS }).map((_, i) => (
            <div key={i} className="absolute border-t border-white/5 w-full left-0"
              style={{ bottom: `${(i / Y_STEPS) * 100}%` }} />
          ))}
          {data.map((item, i) => {
            const pct = (item.value / maxVal) * 100
            const color = colorFn ? colorFn(i) : PALETTE[i % PALETTE.length]
            return (
              <div key={i} className="flex flex-col items-center flex-1 group h-full justify-end relative max-w-[40px]">
                <div className="absolute bottom-full mb-1 left-1/2 -translate-x-1/2 hidden group-hover:block
                  bg-ink-950 border border-white/10 rounded px-1.5 py-0.5 text-[9px] font-bold text-white whitespace-nowrap z-10 shadow-xl">
                  {item.value} {item.unit || ''}
                </div>
                <div className="w-full rounded-t transition-all duration-500"
                  style={{ height: `${pct}%`, backgroundColor: color, opacity: 0.85 }} />
                <div className="absolute top-full mt-1 text-[8px] text-slate-500 font-bold text-center truncate w-full" title={item.label}>
                  {item.label}
                </div>
              </div>
            )
          })}
        </div>
      </div>
      <div className="h-3" />
    </div>
  )
}

// Report Horizontal bar (progress style) (Compacted)
function HBarChart({ data }) {
  const max = Math.max(...data.map(d => d.value), 1)
  return (
    <div className="space-y-2 p-2.5 rounded-xl bg-white/2 border border-white/5 w-full">
      {data.map((item, i) => {
        const pct = Math.round((item.value / max) * 100)
        const color = item.color || PALETTE[i % PALETTE.length]
        return (
          <div key={i} className="space-y-0.5">
            <div className="flex justify-between text-[10px] font-semibold">
              <span className="text-slate-400 truncate max-w-[120px]">{item.label}</span>
              <span className="text-white font-bold">{item.value} <span className="text-slate-500 font-normal">({pct}%)</span></span>
            </div>
            <div className="h-2 bg-white/5 rounded-full overflow-hidden">
              <div className="h-full rounded-full transition-all duration-700"
                style={{ width: `${pct}%`, backgroundColor: color }} />
            </div>
          </div>
        )
      })}
    </div>
  )
}

// Report Line chart (trends) (Compacted)
function ReportLineChart({ data, color = '#ec4899', label = 'Count' }) {
  const W = 500, H = 120, PAD = 20
  const vals = data.map(d => d.value)
  const maxVal = Math.max(...vals, 1)
  const divisor = data.length > 1 ? data.length - 1 : 1
  const points = data.map((d, i) => ({
    x: PAD + (i / divisor) * (W - PAD * 2),
    y: PAD + (H - PAD * 2) * (1 - d.value / maxVal),
    label: d.label, val: d.value
  }))
  const pathD = points.length > 0
    ? `M ${points[0].x} ${points[0].y} ` + points.slice(1).map(p => `L ${p.x} ${p.y}`).join(' ')
    : ''
  const areaD = pathD
    ? `${pathD} L ${points[points.length - 1].x} ${PAD + H - PAD * 2} L ${points[0].x} ${PAD + H - PAD * 2} Z`
    : ''

  return (
    <div className="p-2.5 rounded-xl bg-white/2 border border-white/5 w-full flex flex-col justify-between">
      <div className="relative w-full" style={{ height: H }}>
        <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-full">
          <defs>
            <linearGradient id={`lg-${color.replace('#', '')}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity="0.25" />
              <stop offset="100%" stopColor={color} stopOpacity="0.02" />
            </linearGradient>
          </defs>
          <line x1={PAD} y1={PAD} x2={W - PAD} y2={PAD} stroke="rgba(255,255,255,0.04)" />
          <line x1={PAD} y1={PAD + (H - PAD * 2) / 2} x2={W - PAD} y2={PAD + (H - PAD * 2) / 2} stroke="rgba(255,255,255,0.04)" />
          <line x1={PAD} y1={H - PAD} x2={W - PAD} y2={H - PAD} stroke="rgba(255,255,255,0.1)" />
          {areaD && <path d={areaD} fill={`url(#lg-${color.replace('#', '')})`} />}
          {pathD && <path d={pathD} fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />}
          {points.map((p, i) => (
            <g key={i} className="group cursor-pointer">
              <circle cx={p.x} cy={p.y} r="4" fill={color} stroke="#12131a" strokeWidth="2" />
              <circle cx={p.x} cy={p.y} r="10" fill="transparent" />
              <text x={p.x} y={p.y - 8} fill="white" fontSize="9" textAnchor="middle" fontWeight="bold" className="hidden group-hover:block">{p.val}</text>
              <text x={p.x} y={H - 4} fill="#64748b" fontSize="8" fontWeight="bold" textAnchor="middle">{p.label}</text>
            </g>
          ))}
        </svg>
      </div>
      <div className="flex items-center gap-1 justify-center mt-1.5 text-[9px] font-bold" style={{ color }}>
        <span className="w-2 h-2 rounded-full" style={{ backgroundColor: color }} />
        {label}
      </div>
    </div>
  )
}

// Chart Section Wrapper (Compacted)
function ChartCard({ title, icon: Icon, iconColor, children }) {
  return (
    <div className="card p-3 border border-white/5 bg-ink-950/40 flex flex-col justify-between hover:border-white/10 transition-all duration-200">
      <h4 className="font-display font-bold text-white text-[11px] uppercase tracking-wider flex items-center gap-1.5 border-b border-white/5 pb-2 mb-2">
        {Icon && <Icon size={12} className={iconColor} />}
        <span className="truncate">{title}</span>
      </h4>
      <div className="flex-1 flex items-center justify-center min-h-[120px] w-full">
        {children}
      </div>
    </div>
  )
}

// Unified Performance Reports Section
function PerformanceReportsSection({ mrfs, sheetData, user, role }) {
  const records = (sheetData && sheetData.recruitmentTracker && sheetData.recruitmentTracker.length > 0)
    ? sheetData.recruitmentTracker
    : []
  
  const hasData = records.length > 0
  if (!hasData) {
    return (
      <div className="pt-8 border-t border-white/5 mt-10">
        <div>
          <h2 className="font-display font-extrabold text-white text-xl tracking-tight flex items-center gap-2">
            <Activity className="text-accent" size={20} />
            Performance & Analytics Reports
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Detailed metrics and pipeline breakdowns generated from live tracker data.
          </p>
        </div>
        <div className="card p-12 flex flex-col items-center justify-center gap-3 text-center border border-white/5 bg-ink-950/40 mt-6">
          <AlertCircle size={32} className="text-slate-600" />
          <p className="text-slate-400 font-semibold text-sm">No Google Sheet data available</p>
          <p className="text-slate-600 text-xs max-w-sm">
            Please connect your Google Sheet in the dashboard header or settings to unlock live analytics & charts.
          </p>
        </div>
      </div>
    )
  }

  // 1. Recruitment Summary Report calculations
  const pending   = mrfs.filter(m => m.mrfStatus === 'Pending Owner Approval' || m.mrfStatus === 'Pending').length
  const approved  = mrfs.filter(m => m.mrfStatus === 'Approved').length
  const rejected  = mrfs.filter(m => m.mrfStatus === 'Rejected').length
  const totalVacs = mrfs.filter(m => m.mrfStatus === 'Approved').reduce((s, m) => s + (parseInt(m.noOfPositions) || 0), 0)
  const filled    = records.filter(r => r['Offer Status'] === 'Joined').length
  const offered   = records.filter(r => ['Offered','Accepted','Joined'].includes(r['Offer Status'])).length

  // 2. Department Hiring Report calculations
  const deptVac = {}, deptFilled = {}, deptOpen = {}
  records.forEach(r => {
    const d = (r['Department'] || 'General').trim()
    const v = parseInt(r['Number of Vacancies']) || 1
    const isFilled = r['Offer Status'] === 'Joined' || r['Offer Status'] === 'Accepted'
    deptVac[d]    = (deptVac[d] || 0) + v
    deptFilled[d] = (deptFilled[d] || 0) + (isFilled ? v : 0)
    deptOpen[d]   = (deptOpen[d] || 0) + (!isFilled ? v : 0)
  })
  const top5 = Object.entries(deptVac).sort((a,b)=>b[1]-a[1]).slice(0,5)
  const deptLabels = top5.map(([k]) => k)

  // 3. Vacancy Status calculations
  const posMap = {}
  records.forEach(r => {
    const s = (r['Position Status'] || 'Open').trim()
    posMap[s] = (posMap[s] || 0) + 1
  })
  const reqMap = {}
  records.forEach(r => {
    const s = (r['Requirement Status'] || 'Pending').trim()
    reqMap[s] = (reqMap[s] || 0) + 1
  })
  const posData = Object.entries(posMap).map(([label, value], i) => ({ label, value, color: PALETTE[i % PALETTE.length] }))
  const reqData = Object.entries(reqMap).map(([label, value], i) => ({ label, value, color: PALETTE[(i + 3) % PALETTE.length] }))

  // 4. MRF Status calculations
  const mrfPending   = mrfs.filter(m => m.mrfStatus === 'Pending Owner Approval' || m.mrfStatus === 'Pending').length
  const mrfApproved  = mrfs.filter(m => m.mrfStatus === 'Approved').length
  const mrfRejected  = mrfs.filter(m => m.mrfStatus === 'Rejected').length
  const mrfDraft     = mrfs.filter(m => m.mrfStatus === 'Draft').length
  const byDept = {}
  mrfs.forEach(m => {
    const d = (m.department || 'General').trim()
    byDept[d] = (byDept[d] || 0) + 1
  })
  const deptData = Object.entries(byDept).sort((a,b)=>b[1]-a[1]).slice(0,6)

  // 5. Retirement Analysis calculations
  const exits = records.filter(r => {
    const name = r['Employee Name (Retirement/Resignation/Transfer Out)'] || ''
    return name && name !== 'None' && name.trim() !== ''
  })
  const monthMap = { Jan:0,Feb:0,Mar:0,Apr:0,May:0,Jun:0,Jul:0,Aug:0,Sep:0,Oct:0,Nov:0,Dec:0 }
  const MONTHS = Object.keys(monthMap)
  exits.forEach(r => {
    const d = r['Position Start Date']
    if (d) {
      try {
        const m = new Date(d).getMonth()
        if (m >= 0) monthMap[MONTHS[m]]++
      } catch {}
    }
  })
  const exitDeptMap = {}
  exits.forEach(r => {
    const d = (r['Department'] || 'General').trim()
    exitDeptMap[d] = (exitDeptMap[d] || 0) + 1
  })

  // 6. Resignation Analysis calculations
  const resigned = records.filter(r => {
    const name = r['Employee Name (Retirement/Resignation/Transfer Out)'] || ''
    return name && name !== 'None'
  })
  const resignMonthMap = { Jan:0,Feb:0,Mar:0,Apr:0,May:0,Jun:0 }
  const RESIGN_MONTHS = Object.keys(resignMonthMap)
  resigned.forEach(r => {
    const d = r['Position Start Date']
    if (d) {
      try {
        const m = new Date(d).getMonth()
        if (m >= 0 && m < 6) resignMonthMap[RESIGN_MONTHS[m]]++
      } catch {}
    }
  })
  const exitSourceMap = {}
  resigned.forEach(r => {
    const s = (r['Source of Hiring'] || 'Unknown').trim()
    exitSourceMap[s] = (exitSourceMap[s] || 0) + 1
  })

  // 7. Source of Hiring calculations
  const srcMap = {}
  records.forEach(r => {
    const s = (r['Source of Hiring'] || 'Unknown').trim()
    srcMap[s] = (srcMap[s] || 0) + 1
  })
  const srcData = Object.entries(srcMap).sort((a,b)=>b[1]-a[1]).map(([label, value], i) => ({ label, value, color: PALETTE[i % PALETTE.length] }))
  const filledBySrc = {}
  records.filter(r => r['Offer Status'] === 'Joined').forEach(r => {
    const s = (r['Source of Hiring'] || 'Unknown').trim()
    filledBySrc[s] = (filledBySrc[s] || 0) + 1
  })

  // 8. Offer vs Joining calculations
  const offerSummaryMap = {}
  records.forEach(r => {
    const s = (r['Offer Status'] || 'Not Offered').trim()
    offerSummaryMap[s] = (offerSummaryMap[s] || 0) + 1
  })
  const offerColors = { 'Offered':'#f59e0b','Accepted':'#6366f1','Joined':'#10b981','Declined':'#ef4444','Withdrawn':'#64748b','Not Offered':'#1e293b' }

  // 9. TAT Analysis calculations
  const withTAT = records.filter(r => r['TAT (Turnaround Time)'] && !isNaN(parseInt(r['TAT (Turnaround Time)'])))
  const avgTAT = withTAT.length
    ? Math.round(withTAT.reduce((s, r) => s + parseInt(r['TAT (Turnaround Time)']), 0) / withTAT.length)
    : 0
  const tatBuckets = { '<20 days': 0, '20-30 days': 0, '31-45 days': 0, '>45 days': 0 }
  withTAT.forEach(r => {
    const t = parseInt(r['TAT (Turnaround Time)'])
    if (t < 20) tatBuckets['<20 days']++
    else if (t <= 30) tatBuckets['20-30 days']++
    else if (t <= 45) tatBuckets['31-45 days']++
    else tatBuckets['>45 days']++
  })
  const tatDeptMap = {}
  withTAT.forEach(r => {
    const d = (r['Department'] || 'General').trim()
    const t = parseInt(r['TAT (Turnaround Time)'])
    if (!tatDeptMap[d]) tatDeptMap[d] = { total: 0, count: 0 }
    tatDeptMap[d].total += t
    tatDeptMap[d].count++
  })
  const deptAvgTAT = Object.entries(tatDeptMap).map(([label, v]) => ({ label, value: Math.round(v.total / v.count), unit: 'days' }))

  return (
    <div className="space-y-4">
      <div className={`grid grid-cols-1 md:grid-cols-2 gap-4 ${role === 'hr' ? '' : 'xl:grid-cols-3'}`}>

        <ChartCard title="Offer to Joining Funnel" icon={TrendingUp} iconColor="text-emerald-400">
          <HBarChart data={[
            { label: 'Total Vacancies',   value: totalVacs, color: '#06b6d4' },
            { label: 'Offered Candidates', value: offered,  color: '#6366f1' },
            { label: 'Joined / Onboarded', value: filled,   color: '#10b981' },
          ]} />
        </ChartCard>

        {role !== 'department_head' && (
          <>
            <ChartCard title="Dept Open Positions" icon={BarChart3} iconColor="text-cyan-400">
              <ReportBarChart data={deptLabels.map(l => ({ label: l, value: deptOpen[l] || 0 }))} colorFn={() => '#06b6d4'} />
            </ChartCard>
            <ChartCard title="Dept Filled Positions" icon={BarChart3} iconColor="text-emerald-400">
              <ReportBarChart data={deptLabels.map(l => ({ label: l, value: deptFilled[l] || 0 }))} colorFn={() => '#10b981'} />
            </ChartCard>
            <ChartCard title="Dept Total Vacancies" icon={PieChart} iconColor="text-indigo-400">
              <ReportDonutChart data={top5.map(([label, value], i) => ({ label, value, color: PALETTE[i % PALETTE.length] }))} />
            </ChartCard>
          </>
        )}

        <ChartCard title="Position Status" icon={PieChart} iconColor="text-indigo-400">
          <ReportDonutChart data={posData} />
        </ChartCard>

        <ChartCard title="Requirement Status" icon={PieChart} iconColor="text-cyan-400">
          <ReportDonutChart data={reqData} />
        </ChartCard>

        <ChartCard title="MRF Status Breakdown" icon={PieChart} iconColor="text-amber-400">
          <ReportDonutChart data={[
            { label: 'Pending Review', value: mrfPending,  color: '#f59e0b' },
            { label: 'Approved',       value: mrfApproved, color: '#10b981' },
            { label: 'Rejected',       value: mrfRejected, color: '#ef4444' },
            { label: 'Draft',          value: mrfDraft,    color: '#64748b' },
          ].filter(d => d.value > 0)} />
        </ChartCard>

        {role !== 'department_head' && (
          <ChartCard title="MRFs by Department" icon={BarChart3} iconColor="text-accent">
            <ReportBarChart data={deptData.map(([label, value]) => ({ label, value }))} />
          </ChartCard>
        )}

        <ChartCard title="Retirements by Month" icon={Calendar} iconColor="text-pink-400">
          <ReportLineChart data={MONTHS.map(m => ({ label: m, value: monthMap[m] }))} color="#ec4899" label="Exit Replacements" />
        </ChartCard>

        {role !== 'department_head' && (
          <ChartCard title="Retirements by Dept" icon={BarChart3} iconColor="text-rose-400">
            <ReportBarChart data={Object.entries(exitDeptMap).map(([label, value]) => ({ label, value }))} colorFn={() => '#f43f5e'} />
          </ChartCard>
        )}

        <ChartCard title="Exit Type Summary" icon={PieChart} iconColor="text-pink-400">
          <ReportDonutChart data={[
            { label: 'Exit Replacement', value: exits.length, color: '#ec4899' },
            { label: 'New Positions',    value: totalVacs - exits.length, color: '#64748b' },
          ].filter(d => d.value > 0)} />
        </ChartCard>

        <ChartCard title="Resignation Trend" icon={TrendingUp} iconColor="text-orange-400">
          <ReportLineChart data={RESIGN_MONTHS.map(m => ({ label: m, value: resignMonthMap[m] }))} color="#f97316" label="Exit replacements" />
        </ChartCard>

        <ChartCard title="Replacement Hire Source" icon={PieChart} iconColor="text-amber-400">
          <ReportDonutChart data={Object.entries(exitSourceMap).map(([label, value], i) => ({ label, value, color: PALETTE[i % PALETTE.length] }))} />
        </ChartCard>

        <ChartCard title="All Hiring Sources" icon={PieChart} iconColor="text-emerald-400">
          <ReportDonutChart data={srcData} />
        </ChartCard>

        <ChartCard title="Successful Hires by Source" icon={BarChart3} iconColor="text-cyan-400">
          <ReportBarChart data={Object.entries(filledBySrc).map(([label, value]) => ({ label, value }))} colorFn={() => '#10b981'} />
        </ChartCard>

        <ChartCard title="Offer Status Distribution" icon={PieChart} iconColor="text-purple-400">
          <ReportDonutChart data={Object.entries(offerSummaryMap).map(([label, value]) => ({ label, value, color: offerColors[label] || '#64748b' }))} />
        </ChartCard>

        <ChartCard title="Offer to Joining Funnel" icon={TrendingUp} iconColor="text-emerald-400">
          <HBarChart data={[
            { label: 'Total Offered',    value: offered,  color: '#f59e0b' },
            { label: 'Actually Joined',  value: filled,   color: '#10b981' },
          ]} />
        </ChartCard>

        <ChartCard title="TAT Distribution Buckets" icon={PieChart} iconColor="text-rose-400">
          <ReportDonutChart data={Object.entries(tatBuckets).map(([label, value], i) => ({ label, value, color: ['#10b981','#06b6d4','#f59e0b','#ef4444'][i] })).filter(d => d.value > 0)} />
        </ChartCard>

        {role !== 'department_head' && (
          <ChartCard title="Average TAT by Dept" icon={BarChart3} iconColor="text-amber-400">
            <ReportBarChart data={deptAvgTAT} colorFn={() => '#f59e0b'} />
          </ChartCard>
        )}

        <ChartCard title="Average Turnaround Time" icon={TrendingUp} iconColor="text-cyan-400">
          <div className="flex items-center justify-around py-3 w-full">
            <div className="text-center">
              <p className="text-2xl font-display font-bold text-cyan-400 leading-none">{avgTAT}</p>
              <p className="text-[9px] text-slate-500 mt-1 font-semibold">Avg. Days</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-display font-bold text-emerald-400 leading-none">{withTAT.length}</p>
              <p className="text-[9px] text-slate-500 mt-1 font-semibold">Tracked</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-display font-bold text-amber-400 leading-none">
                {withTAT.length ? Math.min(...withTAT.map(r => parseInt(r['TAT (Turnaround Time)']))) : 0}
              </p>
              <p className="text-[9px] text-slate-500 mt-1 font-semibold">Fastest</p>
            </div>
          </div>
        </ChartCard>
      </div>
    </div>
  )
}

// ── Main Dashboard ────────────────────────────────────────────────────────────
export default function OverviewDashboard() {
  const navigate = useNavigate()
  const [mrfs, setMrfs] = useState([])
  const [candidates, setCandidates] = useState([])
  const [sheetData, setSheetData] = useState(null)
  const [sheetId, setSheetId] = useState('')
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('All')
  const [role, setRole] = useState(() => localStorage.getItem('hr_role') || 'candidate')
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem('hr_user')) } catch { return null }
  })
  const [toast, setToast] = useState(null)
  const [updatingSheet, setUpdatingSheet] = useState(false)

  const handleUpdateSheetId = async (newId) => {
    if (!newId || !newId.trim()) return
    setUpdatingSheet(true)
    try {
      await sheetApi.updateConfig(newId.trim())
      setSheetId(newId.trim())
      await loadDashboardData()
    } catch (e) {
      console.error('Failed to update Google Sheet config:', e)
    } finally {
      setUpdatingSheet(false)
    }
  }

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
      const [mrfList, sheetRows, candidateList, sheetConfig] = await Promise.allSettled([
        mrfApi.list(),
        sheetApi.fetchAll(),
        candidateApi.list(),
        sheetApi.getConfig()
      ])

      if (mrfList.status === 'fulfilled') {
        setMrfs(mrfList.value || [])
      }
      if (sheetRows.status === 'fulfilled') {
        setSheetData(sheetRows.value || null)
      }
      if (candidateList.status === 'fulfilled') {
        setCandidates(candidateList.value || [])
      }
      if (sheetConfig.status === 'fulfilled') {
        setSheetId(sheetConfig.value?.sheetId || '')
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

  // ── Calculations for stats (Unified Google Sheets & MongoDB) ────────────────
  const useSheets = !!(sheetData && sheetData.hodMrf && sheetData.hodMrf.length > 0)

  const normalizedMRFs = useSheets
    ? (sheetData.hodMrf || []).map(r => ({
        _id: r['MRF ID'],
        designation: r['Designation'],
        department: r['Department'],
        section: r['Section'],
        location: r['Vacancy Location'],
        noOfPositions: parseInt(r['Number of Vacancies']) || 1,
        requirementType: r['Requirement Type'],
        experience: r['Experience Required'],
        proposedSalary: r['Proposed Salary'],
        levelOfUrgency: r['Level of Urgency'] || 'Medium',
        reasonForRequest: r['Vacancy Reason'],
        replacementFor: r['Replacement For'],
        justification: r['Justification'],
        purposeOfJob: r['Purpose of Job'],
        rolesResponsibilities: r['Roles & Responsibilities'],
        minimumQualification: r['Minimum Qualification'],
        otherKeySkills: r['Other Key Skills'],
        reportsTo: r['Reports To'],
        submittedBy: r['Submitted By'],
        approvedBy: r['Approved By'],
        approvedAt: r['Approved At'],
        createdAt: r['Created At'] || new Date(),
        specializations: r['Specializations'],
        ageRange: r['Age Range'],
        preferredIndustries: r['Preferred Industries'],
        itRequirements: r['IT Requirements'],
        mrfStatus: r['MRF Status'] || 'Pending Owner Approval',
      }))
    : mrfs

  const normalizedTracker = useSheets
    ? (sheetData.recruitmentTracker || []).map(r => ({
        _id: r['MRF ID'],
        designation: r['Designation'],
        department: r['Department'],
        location: r['Vacancy Location'],
        positionStatus: r['Position Status'] || 'Open',
        requirementStatus: r['Requirement Status'] || 'Pending',
        offerStatus: r['Offer Status'] || 'Not Offered',
        offeredCandidateName: r['Offered Candidate Name'],
        offeredDesignation: r['Offered Designation'],
        offerDate: r['Offer Date'],
        tentativeDOJ: r['Tentative DOJ'],
        actualDOJ: r['Actual DOJ'],
        tat: r['TAT (Days)'],
        preEmploymentMedicalStatus: r['pre employee medical status'],
        sourceOfHiring: r['Source of Hiring'],
        internalRefName: r['Internal Reference Name'],
        minimumQualification: r['Qualification'],
        lastOrganization: r['Last Organization'],
        candidateLocation: r['Last Location'],
        lastDesignation: r['Last Designation'],
        totalPreviousExp: r['Total Experience (Years)'],
        lastCTC: r['Last CTC (LPA)'],
        offeredCTC: r['Offered CTC (LPA)'],
        costOfCompany: r['COC (LPA)'],
        ctcDifferencePercent: r['CTC Difference (%)'],
        recruitmentRemarks: r['Recruitment Remarks'],
        employeeName: r['Exit Employee Name'],
        employeeDesignation: r['Exit Employee Designation'],
        positionStartDate: r['Exit Date'],
        additionalRemarks: r['Additional Remarks']
      }))
    : mrfs

  const normalizedCandidates = useSheets
    ? (sheetData.candidateDetails || []).map(r => ({
        _id: r['Candidate ID'],
        jobOpeningId: r['MRF ID'],
        details: {
          fullName: r['Full Name'],
          email: r['Email'],
          phone: r['Phone'],
          currentTitle: r['Current Title'],
          totalExp: r['Total Experience'],
          highestQual: r['Highest Qualification'],
          skills: r['Skills'],
          currentLocation: r['Current Location'],
          currentCompany: r['Current Company'],
          currentCtc: r['Current CTC'],
          expectedCtc: r['Expected CTC'],
          noticePeriod: r['Notice Period'],
          reasonForChange: r['Reason For Change'],
        },
        matchScore: parseInt(r['Match Score']) || 0,
        matchLevel: r['Match Level'],
        overallStatus: r['Overall Status'] || 'Applied',
        appliedVia: r['Applied Via'],
        createdAt: r['Applied At'] || new Date()
      }))
    : candidates

  const getOpenVacancies = () => {
    if (useSheets) {
      let sum = 0
      normalizedMRFs.forEach(m => {
        const tracker = normalizedTracker.find(t => t._id === m._id)
        const posStatus = tracker?.positionStatus || 'Open'
        if (m.mrfStatus === 'Approved' && (posStatus === 'Open' || posStatus === 'In Progress')) {
          sum += m.noOfPositions
        }
      })
      return sum
    } else {
      return mrfs
        .filter(m => m.mrfStatus === 'Approved' && (m.positionStatus === 'Open' || m.positionStatus === 'In Progress'))
        .reduce((sum, m) => sum + (parseInt(m.noOfPositions) || 0), 0)
    }
  }

  const openVacancies = getOpenVacancies()
  const pendingMRFs = normalizedMRFs.filter(m => m.mrfStatus === 'Pending Owner Approval').length
  const approvedMRFs = normalizedMRFs.filter(m => m.mrfStatus === 'Approved').length
  const rejectedMRFs = normalizedMRFs.filter(m => m.mrfStatus === 'Rejected').length
  const filledPositions = useSheets
    ? normalizedTracker.filter(t => t.offerStatus === 'Joined' || t.offerStatus === 'Accepted').length
    : mrfs.filter(m => m.offerStatus === 'Joined' || m.offerStatus === 'Accepted').length

  const upcomingRetirements = normalizedMRFs.filter(m =>
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
    const activeDepts = Array.from(new Set(normalizedMRFs.map(m => m.department).filter(Boolean)))
    const activeDeptsCount = activeDepts.length || 6

    const uniqueAdminUsers = Array.from(new Set([
      ...normalizedMRFs.map(m => m.submittedBy),
      ...normalizedMRFs.map(m => m.approvedBy)
    ].filter(Boolean)))
    const systemUsersCount = uniqueAdminUsers.length || 12

    const totalJoinedHires = normalizedTracker.filter(t => 
      t.offerStatus === 'Joined' || t.offerStatus === 'Accepted'
    ).length
    const totalEmployeesCount = 200 + totalJoinedHires

    const adminKPI = [
      { label: 'Pending Approvals', value: pendingMRFs, change: 'Requires review', color: 'text-accent', bg: 'bg-white/5 border-white/10', icon: Clock },
      { label: 'Approved Requisitions', value: approvedMRFs, change: 'Active postings', color: 'text-accent', bg: 'bg-white/5 border-white/10', icon: CheckCircle2 },
      { label: 'Total Open Positions', value: openVacancies, change: 'Across all depts', color: 'text-accent', bg: 'bg-white/5 border-white/10', icon: Briefcase },
      { label: 'Total Employees', value: totalEmployeesCount, change: 'Active head count', color: 'text-accent', bg: 'bg-white/5 border-white/10', icon: Users },
      { label: 'Active Departments', value: activeDeptsCount, change: 'Operating depts', color: 'text-accent', bg: 'bg-white/5 border-white/10', icon: Building2 },
      { label: 'System Users', value: systemUsersCount, change: 'Active console accounts', color: 'text-accent', bg: 'bg-white/5 border-white/10', icon: ShieldCheck }
    ]

    const deptWorkforceMap = {}
    normalizedMRFs.forEach(m => {
      const dept = m.department || 'Other'
      deptWorkforceMap[dept] = (deptWorkforceMap[dept] || 0) + (m.noOfPositions || 1)
    })

    let workforceData = Object.entries(deptWorkforceMap)
      .map(([label, value]) => ({ label, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 6)

    if (workforceData.length === 0) {
      workforceData = [
        { label: 'Engineering', value: 12 },
        { label: 'Product', value: 8 },
        { label: 'Design', value: 5 },
        { label: 'Marketing', value: 4 },
        { label: 'Sales', value: 6 },
        { label: 'HR', value: 2 }
      ]
    }

    const statusChartData = [
      { label: 'Approved', value: approvedMRFs, color: '#4F8EF7' },
      { label: 'Pending', value: pendingMRFs, color: '#7E8CA8' },
      { label: 'Rejected', value: rejectedMRFs, color: '#4A5870' }
    ]

    const googleSheetUrl = sheetId ? `https://docs.google.com/spreadsheets/d/${sheetId}/edit` : null

    return (
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-6">
        {/* Welcome banner */}
        <div className="fade-up flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-white/5 pb-4">
          <div>
            <span className="section-tag mb-1">
              <ShieldCheck size={11} className="animate-pulse" /> HR Admin Console
            </span>
            <h1 className="font-display font-bold text-lg text-white">
              Welcome back, {user?.name || 'Admin'}
            </h1>
          </div>
          <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
            {googleSheetUrl ? (
              <>
                <a
                  href={googleSheetUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500 text-emerald-400 hover:text-white border border-emerald-500/20 text-xs font-semibold transition-all duration-150"
                >
                  <FileSpreadsheet size={14} />
                  View Linked Sheet
                  <ExternalLink size={12} />
                </a>
                <button
                  onClick={() => {
                    const newId = prompt("Enter Google Spreadsheet ID:", sheetId)
                    if (newId !== null) handleUpdateSheetId(newId)
                  }}
                  disabled={updatingSheet}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-slate-300 text-xs font-semibold hover:bg-white/10 hover:text-white transition-all disabled:opacity-50"
                >
                  Change Sheet
                </button>
              </>
            ) : (
              <button
                onClick={() => {
                  const newId = prompt("Enter Google Spreadsheet ID:")
                  if (newId !== null) handleUpdateSheetId(newId)
                }}
                disabled={updatingSheet}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-accent/10 border border-accent/25 text-accent hover:bg-accent hover:text-white text-xs font-semibold transition-all shadow-glow-sm disabled:opacity-50"
              >
                <Plus size={14} />
                Link Google Sheet
              </button>
            )}
            <button
              onClick={loadDashboardData}
              disabled={loading}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-slate-300 text-xs font-semibold hover:bg-white/10 hover:text-white transition-all disabled:opacity-50"
            >
              <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
              Refresh Dashboard
            </button>
            <div className="text-xs text-slate-400 font-medium flex items-center gap-1.5 bg-white/5 border border-white/10 px-3 py-1.5 rounded-lg">
              Status: <span className="text-emerald-400 font-bold flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> Live</span>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="card p-24 flex flex-col items-center justify-center gap-3">
            <Loader2 className="w-8 h-8 text-accent animate-spin" />
            <p className="text-xs text-slate-500">Loading dashboard metrics...</p>
          </div>
        ) : (
          <>
            {/* KPI Metrics Panel on Top */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 fade-up-1">
              {adminKPI.map((item, idx) => (
                <CompactKPICard key={idx} item={item} />
              ))}
            </div>

            {/* Performance Reports grid full width */}
            <div className="fade-up-2 mt-6">
              <PerformanceReportsSection mrfs={normalizedMRFs} sheetData={sheetData} user={user} role={role} />
            </div>
          </>
        )}
      </div>
    )
  }

  // ── 3. HR MANAGER DASHBOARD VIEW ────────────────────────────────────────────
  if (role === 'hr') {
    const candidatePipelineCount = normalizedCandidates.length
    const interviewsScheduledCount = normalizedCandidates.filter(c => {
      const s = (c.overallStatus || '').toLowerCase()
      return s.includes('interview') || s.includes('scheduled')
    }).length
    const offersReleasedCount = normalizedCandidates.filter(c => {
      const s = (c.overallStatus || '').toLowerCase()
      return s.includes('offer') || s.includes('offered')
    }).length
    const positionsFilledCount = normalizedCandidates.filter(c => {
      const s = (c.overallStatus || '').toLowerCase()
      return s.includes('joined') || s.includes('hired') || s.includes('accepted')
    }).length

    const hrKPI = [
      { label: 'Job Requisitions', value: approvedMRFs, change: 'Approved sheets MRFs', color: 'text-accent', bg: 'bg-white/5 border-white/10', icon: CheckCircle2 },
      { label: 'Active Openings', value: openVacancies, change: 'Open positions in tracker', color: 'text-accent', bg: 'bg-white/5 border-white/10', icon: Briefcase },
      { label: 'Candidates Pipeline', value: candidatePipelineCount, change: 'Total resumes synced', color: 'text-accent', bg: 'bg-white/5 border-white/10', icon: Users },
      { label: 'Interviews Scheduled', value: interviewsScheduledCount, change: 'Awaiting feedback', color: 'text-accent', bg: 'bg-white/5 border-white/10', icon: Calendar },
      { label: 'Offers Released', value: offersReleasedCount, change: 'Pending signatures', color: 'text-accent', bg: 'bg-white/5 border-white/10', icon: Award },
      { label: 'Positions Filled', value: positionsFilledCount, change: 'Hired & joined', color: 'text-accent', bg: 'bg-white/5 border-white/10', icon: UserCheck }
    ]

    const trendData = getTrendData(normalizedMRFs)

    const stageData = [
      { label: 'Applied', value: normalizedCandidates.filter(c => (c.overallStatus || '').toLowerCase() === 'applied' || (c.overallStatus || '').toLowerCase() === 'new').length, color: '#a855f7' },
      { label: 'Screening', value: normalizedCandidates.filter(c => (c.overallStatus || '').toLowerCase().includes('screen')).length, color: '#06b6d4' },
      { label: 'Interview', value: interviewsScheduledCount, color: '#6366f1' },
      { label: 'Offer', value: offersReleasedCount, color: '#ec4899' }
    ]

    const googleSheetUrl = sheetId ? `https://docs.google.com/spreadsheets/d/${sheetId}/edit` : null

    return (
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-6">
        {/* Welcome banner */}
        <div className="fade-up flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-white/5 pb-4">
          <div>
            <span className="section-tag mb-1">
              <Activity size={11} className="animate-pulse" /> HR Recruiter Console
            </span>
            <h1 className="font-display font-bold text-lg text-white">
              Welcome back, {user?.name || 'HR Manager'}
            </h1>
          </div>
          <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
            {googleSheetUrl ? (
              <>
                <a
                  href={googleSheetUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500 text-emerald-400 hover:text-white border border-emerald-500/20 text-xs font-semibold transition-all duration-150"
                >
                  <FileSpreadsheet size={14} />
                  View Linked Sheet
                  <ExternalLink size={12} />
                </a>
                <button
                  onClick={() => {
                    const newId = prompt("Enter Google Spreadsheet ID:", sheetId)
                    if (newId !== null) handleUpdateSheetId(newId)
                  }}
                  disabled={updatingSheet}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-slate-300 text-xs font-semibold hover:bg-white/10 hover:text-white transition-all disabled:opacity-50"
                >
                  Change Sheet
                </button>
              </>
            ) : (
              <button
                onClick={() => {
                  const newId = prompt("Enter Google Spreadsheet ID:")
                  if (newId !== null) handleUpdateSheetId(newId)
                }}
                disabled={updatingSheet}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-accent/10 border border-accent/25 text-accent hover:bg-accent hover:text-white text-xs font-semibold transition-all shadow-glow-sm disabled:opacity-50"
              >
                <Plus size={14} />
                Link Google Sheet
              </button>
            )}
            <button
              onClick={loadDashboardData}
              disabled={loading}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-slate-300 text-xs font-semibold hover:bg-white/10 hover:text-white transition-all disabled:opacity-50"
            >
              <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
              Refresh Dashboard
            </button>
            <div className="text-xs text-slate-400 font-medium flex items-center gap-1.5 bg-white/5 border border-white/10 px-3 py-1.5 rounded-lg">
              Status: <span className="text-emerald-400 font-bold flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> Live</span>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="card p-24 flex flex-col items-center justify-center gap-3">
            <Loader2 className="w-8 h-8 text-accent animate-spin" />
            <p className="text-xs text-slate-500">Loading your recruiter dashboard...</p>
          </div>
        ) : (
          <>
            {/* KPI Metrics Panel on Top */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 fade-up-1">
              {hrKPI.map((item, idx) => (
                <CompactKPICard key={idx} item={item} />
              ))}
            </div>

            {/* Below KPIs Layout Split */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start fade-up-2 mt-6">
              {/* Performance Reports grid on the left */}
              <div className="lg:col-span-3">
                <PerformanceReportsSection mrfs={normalizedMRFs} sheetData={sheetData} user={user} role={role} />
              </div>

              {/* Recent Candidates & Upcoming Joining Dates Tables on the right */}
              <div className="lg:col-span-1 space-y-6">
                <RecentCandidatesCard candidates={normalizedCandidates} />
                <UpcomingJoiningDatesCard tracker={normalizedTracker} />
              </div>
            </div>
          </>
        )}
      </div>
    )
  }

  // ── 4. DEPARTMENT HEAD DASHBOARD VIEW ────────────────────────────────────────
  const deptName = user?.department || 'Operations'

  // Filter HOD MRFs and tracker and candidates by their department
  const myDeptMRFs = normalizedMRFs.filter(m => 
    m.department && m.department.toLowerCase() === deptName.toLowerCase()
  )
  
  const myDeptTracker = normalizedTracker.filter(t => 
    t.department && t.department.toLowerCase() === deptName.toLowerCase()
  )

  const myDeptCandidates = normalizedCandidates.filter(c => 
    myDeptMRFs.some(m => m._id === c.jobOpeningId)
  )

  const myDrafts = myDeptMRFs.filter(m => m.mrfStatus === 'Draft').length
  const myPending = myDeptMRFs.filter(m => m.mrfStatus === 'Pending Owner Approval' || m.mrfStatus === 'Pending').length
  const myApproved = myDeptMRFs.filter(m => m.mrfStatus === 'Approved').length
  const myRejected = myDeptMRFs.filter(m => m.mrfStatus === 'Rejected').length

  const myOpenPositions = myDeptMRFs
    .filter(m => m.mrfStatus === 'Approved')
    .reduce((s, m) => {
      const tracker = myDeptTracker.find(t => t._id === m._id)
      const posStatus = tracker?.positionStatus || 'Open'
      if (posStatus === 'Open' || posStatus === 'In Progress') {
        return s + (parseInt(m.noOfPositions) || 1)
      }
      return s
    }, 0)

  const pendingApprovalsCount = myDeptCandidates.filter(c => 
    c.overallStatus === 'Pending Head Approval' || c.overallStatus === 'Pending Owner Approval'
  ).length

  const activeTeamStrength = 42 + myDeptTracker.filter(t => t.offerStatus === 'Joined').length

  const myUpcomingExits = myDeptMRFs.filter(m =>
    m.reasonForRequest === 'Retirement' ||
    m.reasonForRequest === 'Resignation' ||
    (m.employeeName && m.employeeName !== 'None' && m.employeeName !== '')
  ).length
  const dhKPI = [
    {
      label: 'Pending Approvals',
      value: pendingApprovalsCount,
      change: 'Awaiting head feedback',
      color: 'text-purple-400',
      bg: 'bg-purple-500/10 border-purple-500/20',
      icon: Clock,
      action: {
        onClick: () => navigate('/my-mrfs'),
        text: 'Review Applications',
        className: 'bg-purple-500/10 hover:bg-purple-500 text-purple-400 hover:text-white border-purple-500/20'
      }
    },
    {
      label: 'Hiring Requests',
      value: myDeptMRFs.length,
      change: 'Total submitted requests',
      color: 'text-amber-400',
      bg: 'bg-amber-500/10 border-amber-500/20',
      icon: FileText,
      action: {
        onClick: () => navigate('/my-mrfs', { state: { openNewRequest: true } }),
        text: 'Create Requisition',
        className: 'bg-amber-500/10 hover:bg-amber-500 text-amber-400 hover:text-white border-amber-500/20'
      }
    },
    { label: 'Open Positions', value: myOpenPositions, change: 'Active vacancies', color: 'text-blue-400', bg: 'bg-blue-500/10 border-blue-500/20', icon: Briefcase },
    { label: 'Team Strength', value: activeTeamStrength, change: 'Current head count', color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20', icon: Users },
    { label: 'Upcoming Exits', value: myUpcomingExits, change: 'Next 30 days', color: 'text-pink-400', bg: 'bg-pink-500/10 border-pink-500/20', icon: Calendar }
  ]

  const googleSheetUrl = sheetId ? `https://docs.google.com/spreadsheets/d/${sheetId}/edit` : null

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      {/* Welcome Banner */}
      <div className="fade-up flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-white/5 pb-4">
        <div>
          <span className="section-tag mb-1">
            <Activity size={11} className="animate-pulse" /> Department Head Console
          </span>
          <h1 className="font-display font-bold text-lg text-white">
            Welcome back, {user?.name || 'Head'}
          </h1>
        </div>
        <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
          {googleSheetUrl && (
            <a
              href={googleSheetUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500 text-emerald-400 hover:text-white border border-emerald-500/20 text-xs font-semibold transition-all duration-150"
            >
              <FileSpreadsheet size={14} />
              View Linked Sheet
              <ExternalLink size={12} />
            </a>
          )}
          <button
            onClick={loadDashboardData}
            disabled={loading}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-slate-300 text-xs font-semibold hover:bg-white/10 hover:text-white transition-all disabled:opacity-50"
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            Refresh Dashboard
          </button>
          <div className="text-xs text-slate-400 font-medium bg-white/5 border border-white/10 px-3 py-1.5 rounded-lg">
            Department: <span className="text-amber-400 font-bold">{user?.department || 'Operations'}</span>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="card p-24 flex flex-col items-center justify-center gap-3">
          <Loader2 className="w-8 h-8 text-accent animate-spin" />
          <p className="text-xs text-slate-500">Loading your dashboard...</p>
        </div>
      ) : (
        <>
          {/* KPI Metrics Panel on Top */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 fade-up-1">
            {dhKPI.map((item, idx) => (
              <CompactKPICard key={idx} item={item} />
            ))}
          </div>

          {/* Performance Reports grid full width */}
          <div className="fade-up-2 mt-6">
            <PerformanceReportsSection mrfs={myDeptMRFs} sheetData={sheetData} user={user} role={role} />
          </div>
        </>
      )}
    </div>
  )
}
