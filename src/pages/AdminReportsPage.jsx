import React, { useState, useEffect } from 'react'
import { BarChart3, PieChart, TrendingUp, Calendar, ChevronDown, Info, Loader2, AlertCircle } from 'lucide-react'
import { mrfApi, sheetApi } from '../services/api.js'

// ── Dummy fallback data (5 sample records) ─────────────────────────────────
const DUMMY_SHEET = [
  { 'Location': 'Mumbai', 'Designation': 'Senior Software Engineer', 'Department': 'Engineering', 'Number of Vacancies': '2', 'Position Status': 'In Progress', 'Requirement Status': 'In Progress', 'Offer Status': 'Offered', 'Source of Hiring': 'Naukri', 'Tentative Date of Joining (DOJ)': '2026-06-15', 'Actual DOJ': '2026-06-12', 'TAT (Turnaround Time)': '25', 'Employee Name (Retirement/Resignation/Transfer Out)': 'Suresh Mehta', 'Position Start Date': '2026-05-01', 'Offered CTC': '1600000', 'Last CTC': '1200000' },
  { 'Location': 'Bangalore', 'Designation': 'Product Manager', 'Department': 'Product Management', 'Number of Vacancies': '1', 'Position Status': 'Open', 'Requirement Status': 'In Progress', 'Offer Status': 'Joined', 'Source of Hiring': 'LinkedIn', 'Tentative Date of Joining (DOJ)': '2026-05-10', 'Actual DOJ': '2026-05-10', 'TAT (Turnaround Time)': '35', 'Employee Name (Retirement/Resignation/Transfer Out)': 'None', 'Position Start Date': '2026-04-01', 'Offered CTC': '2400000', 'Last CTC': '1800000' },
  { 'Location': 'Delhi', 'Designation': 'HR Executive', 'Department': 'Human Resources', 'Number of Vacancies': '1', 'Position Status': 'Closed', 'Requirement Status': 'Fulfilled', 'Offer Status': 'Joined', 'Source of Hiring': 'Campus Drive', 'Tentative Date of Joining (DOJ)': '2026-06-01', 'Actual DOJ': '2026-06-01', 'TAT (Turnaround Time)': '20', 'Employee Name (Retirement/Resignation/Transfer Out)': 'Priya Patel', 'Position Start Date': '2026-04-20', 'Offered CTC': '600000', 'Last CTC': '350000' },
  { 'Location': 'Hyderabad', 'Designation': 'DevOps Engineer', 'Department': 'Engineering', 'Number of Vacancies': '1', 'Position Status': 'In Progress', 'Requirement Status': 'In Progress', 'Offer Status': 'Accepted', 'Source of Hiring': 'Referral', 'Tentative Date of Joining (DOJ)': '2026-06-25', 'Actual DOJ': '', 'TAT (Turnaround Time)': '40', 'Employee Name (Retirement/Resignation/Transfer Out)': 'Amit Saxena', 'Position Start Date': '2026-03-05', 'Offered CTC': '1900000', 'Last CTC': '1400000' },
  { 'Location': 'Pune', 'Designation': 'QA Lead', 'Department': 'Quality Assurance', 'Number of Vacancies': '1', 'Position Status': 'On Hold', 'Requirement Status': 'On Hold', 'Offer Status': 'Declined', 'Source of Hiring': 'Consultant', 'Tentative Date of Joining (DOJ)': '2026-05-15', 'Actual DOJ': '', 'TAT (Turnaround Time)': '45', 'Employee Name (Retirement/Resignation/Transfer Out)': 'None', 'Position Start Date': '2026-02-15', 'Offered CTC': '2000000', 'Last CTC': '1500000' },
]

// ── Color palettes ─────────────────────────────────────────────────────────
const PALETTE = ['#06b6d4', '#6366f1', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6', '#14b8a6', '#f97316', '#64748b']

// ─────────────────────────────────────────────────────────────────────────────
// Chart Components
// ─────────────────────────────────────────────────────────────────────────────

// Donut / Pie chart
function DonutChart({ data, size = 180, title }) {
  const total = data.reduce((s, d) => s + d.value, 0) || 1
  const r = 58
  const circ = 2 * Math.PI * r
  let acc = 0

  return (
    <div className="flex flex-col items-center gap-4">
      {title && <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">{title}</p>}
      <div className="flex flex-col sm:flex-row items-center gap-6">
        <div className="relative flex-shrink-0" style={{ width: size, height: size }}>
          <svg viewBox="0 0 160 160" className="w-full h-full -rotate-90">
            <circle cx="80" cy="80" r={r} fill="transparent" stroke="rgba(255,255,255,0.05)" strokeWidth="16" />
            {data.map((item, i) => {
              const pct = item.value / total
              const dashOffset = circ - pct * circ
              const rot = (acc / total) * 360
              acc += item.value
              const midAngle = (rot + pct * 180) * Math.PI / 180
              const tx = 80 + Math.cos(midAngle) * (r + 22)
              const ty = 80 + Math.sin(midAngle) * (r + 22)
              return (
                <g key={i}>
                  <circle cx="80" cy="80" r={r} fill="transparent" stroke={item.color}
                    strokeWidth="16" strokeDasharray={circ} strokeDashoffset={dashOffset}
                    transform={`rotate(${rot} 80 80)`} className="transition-all duration-700" />
                  {pct > 0.06 && (
                    <g style={{ transform: `rotate(90deg)`, transformOrigin: `${tx}px ${ty}px` }}>
                      <text x={tx} y={ty} fill={item.color} fontSize="9" fontWeight="bold"
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
            <span className="text-2xl font-bold text-white">{total}</span>
            <span className="text-[9px] text-slate-500 uppercase tracking-widest font-bold">Total</span>
          </div>
        </div>
        <div className="space-y-2 flex-1 w-full max-w-[200px]">
          {data.map((item, i) => (
            <div key={i} className="flex items-center justify-between text-xs border-b border-white/5 pb-1.5 last:border-0">
              <div className="flex items-center gap-2 min-w-0">
                <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: item.color }} />
                <span className="text-slate-400 truncate">{item.label}</span>
              </div>
              <span className="text-white font-bold ml-3">
                {item.value} <span className="text-slate-500 font-normal">({Math.round((item.value / total) * 100)}%)</span>
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// Vertical bar chart
function BarChart({ data, height = 180, colorFn }) {
  const maxVal = Math.max(...data.map(d => d.value), 1)
  const Y_STEPS = 4
  const gridLines = Array.from({ length: Y_STEPS + 1 }, (_, i) => Math.round((maxVal / Y_STEPS) * (Y_STEPS - i)))

  return (
    <div className="p-4 rounded-xl bg-white/2 border border-white/5">
      <div className="flex gap-3" style={{ height }}>
        <div className="flex flex-col justify-between text-[10px] text-slate-500 font-bold w-8 items-end">
          {gridLines.map((g, i) => <span key={i}>{g}</span>)}
        </div>
        <div className="flex-1 border-b border-l border-white/10 relative flex items-end justify-around px-2 pt-4">
          {Array.from({ length: Y_STEPS }).map((_, i) => (
            <div key={i} className="absolute border-t border-white/5 w-full left-0"
              style={{ bottom: `${(i / Y_STEPS) * 100}%` }} />
          ))}
          {data.map((item, i) => {
            const pct = (item.value / maxVal) * 100
            const color = colorFn ? colorFn(i) : PALETTE[i % PALETTE.length]
            return (
              <div key={i} className="flex flex-col items-center flex-1 group h-full justify-end relative max-w-[55px]">
                <div className="absolute bottom-full mb-1 left-1/2 -translate-x-1/2 hidden group-hover:block
                  bg-ink-950 border border-white/10 rounded px-2 py-0.5 text-[10px] font-bold text-white whitespace-nowrap z-10 shadow-xl">
                  {item.value} {item.unit || ''}
                </div>
                <div className="w-full rounded-t transition-all duration-500"
                  style={{ height: `${pct}%`, backgroundColor: color, opacity: 0.85 }} />
                <div className="absolute top-full mt-1.5 text-[9px] text-slate-500 font-bold text-center truncate w-full" title={item.label}>
                  {item.label}
                </div>
              </div>
            )
          })}
        </div>
      </div>
      <div className="h-5" />
    </div>
  )
}

// Horizontal bar (progress style)
function HBarChart({ data }) {
  const max = Math.max(...data.map(d => d.value), 1)
  return (
    <div className="space-y-3 p-4 rounded-xl bg-white/2 border border-white/5">
      {data.map((item, i) => {
        const pct = Math.round((item.value / max) * 100)
        const color = item.color || PALETTE[i % PALETTE.length]
        return (
          <div key={i} className="space-y-1">
            <div className="flex justify-between text-xs font-semibold">
              <span className="text-slate-400">{item.label}</span>
              <span className="text-white">{item.value} <span className="text-slate-500 font-normal">({pct}%)</span></span>
            </div>
            <div className="h-3 bg-white/5 rounded-full overflow-hidden">
              <div className="h-full rounded-full transition-all duration-700"
                style={{ width: `${pct}%`, backgroundColor: color }} />
            </div>
          </div>
        )
      })}
    </div>
  )
}

// Line chart (trends)
function LineChart({ data, color = '#ec4899', label = 'Count' }) {
  const W = 500, H = 160, PAD = 32
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
    <div className="p-4 rounded-xl bg-white/2 border border-white/5">
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
              <circle cx={p.x} cy={p.y} r="5" fill={color} stroke="#12131a" strokeWidth="2" />
              <circle cx={p.x} cy={p.y} r="12" fill="transparent" />
              <text x={p.x} y={p.y - 10} fill="white" fontSize="9" textAnchor="middle" fontWeight="bold" className="hidden group-hover:block">{p.val}</text>
              <text x={p.x} y={H - 10} fill="#64748b" fontSize="8" fontWeight="bold" textAnchor="middle">{p.label}</text>
            </g>
          ))}
        </svg>
      </div>
      <div className="flex items-center gap-1.5 justify-center mt-1 text-[10px] font-bold" style={{ color }}>
        <span className="w-2 h-2 rounded-full" style={{ backgroundColor: color }} />
        {label}
      </div>
    </div>
  )
}

// ── Chart Section Wrapper ──────────────────────────────────────────────────
function ChartCard({ title, icon: Icon, iconColor, children, wide }) {
  return (
    <div className={`card p-5 border border-white/5 bg-ink-950/40 space-y-4 ${wide ? 'md:col-span-2' : ''}`}>
      <h3 className="font-display font-bold text-white text-[14px] flex items-center gap-2">
        <Icon size={15} className={iconColor} />
        {title}
      </h3>
      {children}
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Report definitions — each has a label, description, and render function
// ─────────────────────────────────────────────────────────────────────────────
const REPORTS = [
  { key: 'recruitment_summary', label: 'Recruitment Summary',   icon: BarChart3,   color: 'text-accent' },
  { key: 'department_hiring',   label: 'Department Hiring',     icon: BarChart3,   color: 'text-cyan-400' },
  { key: 'vacancy_status',      label: 'Vacancy Status',        icon: PieChart,    color: 'text-indigo-400' },
  { key: 'mrf_status',          label: 'MRF Status',            icon: ClipboardList, color: 'text-amber-400' },
  { key: 'retirement_analysis', label: 'Retirement Analysis',   icon: Calendar,    color: 'text-pink-400' },
  { key: 'resignation_analysis',label: 'Resignation Analysis',  icon: TrendingUp,  color: 'text-orange-400' },
  { key: 'source_of_hiring',    label: 'Source of Hiring',      icon: PieChart,    color: 'text-emerald-400' },
  { key: 'offer_vs_joining',    label: 'Offer vs Joining',      icon: BarChart3,   color: 'text-purple-400' },
  { key: 'tat_analysis',        label: 'TAT Analysis',          icon: TrendingUp,  color: 'text-rose-400' },
]

// Custom import for ClipboardList (not imported at top level)
import { ClipboardList } from 'lucide-react'

// ── Individual report renderers ────────────────────────────────────────────
function RecruitmentSummaryReport({ mrfs, records }) {
  const pending   = mrfs.filter(m => m.mrfStatus === 'Pending Owner Approval').length
  const approved  = mrfs.filter(m => m.mrfStatus === 'Approved').length
  const rejected  = mrfs.filter(m => m.mrfStatus === 'Rejected').length
  const totalVacs = mrfs.filter(m => m.mrfStatus === 'Approved').reduce((s, m) => s + (parseInt(m.noOfPositions) || 0), 0)
  const filled    = records.filter(r => r['Offer Status'] === 'Joined').length
  const offered   = records.filter(r => ['Offered','Accepted','Joined'].includes(r['Offer Status'])).length

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <ChartCard title="MRF Pipeline Overview" icon={BarChart3} iconColor="text-accent">
        <BarChart data={[
          { label: 'Pending', value: pending },
          { label: 'Approved', value: approved },
          { label: 'Rejected', value: rejected },
        ]} colorFn={(i) => ['#f59e0b','#10b981','#ef4444'][i]} />
      </ChartCard>
      <ChartCard title="Offer to Joining Funnel" icon={TrendingUp} iconColor="text-emerald-400">
        <HBarChart data={[
          { label: 'Total Vacancies',   value: totalVacs, color: '#06b6d4' },
          { label: 'Offered Candidates', value: offered,  color: '#6366f1' },
          { label: 'Joined / Onboarded', value: filled,   color: '#10b981' },
        ]} />
      </ChartCard>
    </div>
  )
}

function DepartmentHiringReport({ records }) {
  const deptVac = {}, deptFilled = {}, deptOpen = {}
  records.forEach(r => {
    const d = (r['Department'] || 'General').trim()
    const v = parseInt(r['Number of Vacancies']) || 1
    const filled = r['Offer Status'] === 'Joined' || r['Offer Status'] === 'Accepted'
    deptVac[d]    = (deptVac[d] || 0) + v
    deptFilled[d] = (deptFilled[d] || 0) + (filled ? v : 0)
    deptOpen[d]   = (deptOpen[d] || 0) + (!filled ? v : 0)
  })
  const top5 = Object.entries(deptVac).sort((a,b)=>b[1]-a[1]).slice(0,5)
  const labels = top5.map(([k]) => k)

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <ChartCard title="Department-wise Open Positions" icon={BarChart3} iconColor="text-cyan-400">
        <BarChart data={labels.map(l => ({ label: l, value: deptOpen[l] || 0 }))} colorFn={() => '#06b6d4'} />
      </ChartCard>
      <ChartCard title="Department-wise Filled Positions" icon={BarChart3} iconColor="text-emerald-400">
        <BarChart data={labels.map(l => ({ label: l, value: deptFilled[l] || 0 }))} colorFn={() => '#10b981'} />
      </ChartCard>
      <ChartCard title="Department-wise Total Vacancy Count" icon={PieChart} iconColor="text-indigo-400" wide>
        <DonutChart data={top5.map(([label, value], i) => ({ label, value, color: PALETTE[i % PALETTE.length] }))} />
      </ChartCard>
    </div>
  )
}

function VacancyStatusReport({ records }) {
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

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <ChartCard title="Position Status Distribution" icon={PieChart} iconColor="text-indigo-400">
        <DonutChart data={posData} />
      </ChartCard>
      <ChartCard title="Requirement Status Distribution" icon={PieChart} iconColor="text-cyan-400">
        <DonutChart data={reqData} />
      </ChartCard>
    </div>
  )
}

function MRFStatusReport({ mrfs }) {
  const pending   = mrfs.filter(m => m.mrfStatus === 'Pending Owner Approval').length
  const approved  = mrfs.filter(m => m.mrfStatus === 'Approved').length
  const rejected  = mrfs.filter(m => m.mrfStatus === 'Rejected').length
  const draft     = mrfs.filter(m => m.mrfStatus === 'Draft').length
  const byDept = {}
  mrfs.forEach(m => {
    const d = (m.department || 'General').trim()
    byDept[d] = (byDept[d] || 0) + 1
  })
  const deptData = Object.entries(byDept).sort((a,b)=>b[1]-a[1]).slice(0,6)

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <ChartCard title="MRF Status Breakdown" icon={PieChart} iconColor="text-amber-400">
        <DonutChart data={[
          { label: 'Pending Review', value: pending,  color: '#f59e0b' },
          { label: 'Approved',       value: approved, color: '#10b981' },
          { label: 'Rejected',       value: rejected, color: '#ef4444' },
          { label: 'Draft',          value: draft,    color: '#64748b' },
        ].filter(d => d.value > 0)} />
      </ChartCard>
      <ChartCard title="MRFs by Department" icon={BarChart3} iconColor="text-accent">
        <BarChart data={deptData.map(([label, value]) => ({ label, value }))} />
      </ChartCard>
    </div>
  )
}

function RetirementAnalysisReport({ records }) {
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
  const deptMap = {}
  exits.forEach(r => {
    const d = (r['Department'] || 'General').trim()
    deptMap[d] = (deptMap[d] || 0) + 1
  })

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <ChartCard title="Upcoming Retirements by Month" icon={Calendar} iconColor="text-pink-400" wide>
        <LineChart data={MONTHS.map(m => ({ label: m, value: monthMap[m] }))} color="#ec4899" label="Exit Replacements per month" />
      </ChartCard>
      <ChartCard title="Retirements by Department" icon={BarChart3} iconColor="text-rose-400">
        <BarChart data={Object.entries(deptMap).map(([label, value]) => ({ label, value }))} colorFn={() => '#f43f5e'} />
      </ChartCard>
      <ChartCard title="Exit Type Summary" icon={PieChart} iconColor="text-pink-400">
        <DonutChart data={[
          { label: 'With Exit Replacement', value: exits.length, color: '#ec4899' },
          { label: 'New Positions',          value: records.length - exits.length, color: '#64748b' },
        ].filter(d => d.value > 0)} />
      </ChartCard>
    </div>
  )
}

function ResignationAnalysisReport({ records }) {
  const resigned = records.filter(r => {
    const name = r['Employee Name (Retirement/Resignation/Transfer Out)'] || ''
    return name && name !== 'None'
  })
  const monthMap = { Jan:0,Feb:0,Mar:0,Apr:0,May:0,Jun:0 }
  const MONTHS = Object.keys(monthMap)
  resigned.forEach(r => {
    const d = r['Position Start Date']
    if (d) {
      try {
        const m = new Date(d).getMonth()
        if (m >= 0 && m < 6) monthMap[MONTHS[m]]++
      } catch {}
    }
  })
  const sourceMap = {}
  resigned.forEach(r => {
    const s = (r['Source of Hiring'] || 'Unknown').trim()
    sourceMap[s] = (sourceMap[s] || 0) + 1
  })

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <ChartCard title="Resignation / Exit Replacements Trend" icon={TrendingUp} iconColor="text-orange-400" wide>
        <LineChart data={MONTHS.map(m => ({ label: m, value: monthMap[m] }))} color="#f97316" label="Exit replacements over months" />
      </ChartCard>
      <ChartCard title="Replacement Hire Source" icon={PieChart} iconColor="text-amber-400">
        <DonutChart data={Object.entries(sourceMap).map(([label, value], i) => ({ label, value, color: PALETTE[i % PALETTE.length] }))} />
      </ChartCard>
    </div>
  )
}

function SourceOfHiringReport({ records }) {
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

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <ChartCard title="All Hiring Sources Distribution" icon={PieChart} iconColor="text-emerald-400">
        <DonutChart data={srcData} />
      </ChartCard>
      <ChartCard title="Successful Hires by Source" icon={BarChart3} iconColor="text-cyan-400">
        <BarChart data={Object.entries(filledBySrc).map(([label, value]) => ({ label, value }))} colorFn={() => '#10b981'} />
      </ChartCard>
    </div>
  )
}

function OfferVsJoiningReport({ records }) {
  const offered   = records.filter(r => ['Offered','Accepted','Joined'].includes(r['Offer Status'] || '')).length
  const accepted  = records.filter(r => ['Accepted','Joined'].includes(r['Offer Status'] || '')).length
  const joined    = records.filter(r => r['Offer Status'] === 'Joined').length
  const declined  = records.filter(r => r['Offer Status'] === 'Declined').length
  const withdrawn = records.filter(r => r['Offer Status'] === 'Withdrawn').length

  const offerMap = {}
  records.forEach(r => {
    const s = (r['Offer Status'] || 'Not Offered').trim()
    offerMap[s] = (offerMap[s] || 0) + 1
  })

  const offerColors = { 'Offered':'#f59e0b','Accepted':'#6366f1','Joined':'#10b981','Declined':'#ef4444','Withdrawn':'#64748b','Not Offered':'#1e293b' }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <ChartCard title="Offer Status Distribution" icon={PieChart} iconColor="text-purple-400">
        <DonutChart data={Object.entries(offerMap).map(([label, value]) => ({ label, value, color: offerColors[label] || '#64748b' }))} />
      </ChartCard>
      <ChartCard title="Offer to Joining Funnel" icon={TrendingUp} iconColor="text-emerald-400">
        <HBarChart data={[
          { label: 'Total Offered',    value: offered,  color: '#f59e0b' },
          { label: 'Accepted Offers',  value: accepted, color: '#6366f1' },
          { label: 'Actually Joined',  value: joined,   color: '#10b981' },
          { label: 'Declined Offers',  value: declined, color: '#ef4444' },
          { label: 'Withdrawn',        value: withdrawn, color: '#64748b' },
        ]} />
      </ChartCard>
    </div>
  )
}

function TATAnalysisReport({ records }) {
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
  const deptTAT = {}
  withTAT.forEach(r => {
    const d = (r['Department'] || 'General').trim()
    const t = parseInt(r['TAT (Turnaround Time)'])
    if (!deptTAT[d]) deptTAT[d] = { total: 0, count: 0 }
    deptTAT[d].total += t
    deptTAT[d].count++
  })
  const deptAvgTAT = Object.entries(deptTAT).map(([label, v]) => ({ label, value: Math.round(v.total / v.count), unit: 'days' }))

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <ChartCard title="TAT Distribution Buckets" icon={PieChart} iconColor="text-rose-400">
        <DonutChart data={Object.entries(tatBuckets).map(([label, value], i) => ({ label, value, color: ['#10b981','#06b6d4','#f59e0b','#ef4444'][i] })).filter(d => d.value > 0)} />
      </ChartCard>
      <ChartCard title="Average TAT by Department" icon={BarChart3} iconColor="text-amber-400">
        <BarChart data={deptAvgTAT} colorFn={() => '#f59e0b'} />
      </ChartCard>
      <ChartCard title="Average Turnaround Time" icon={TrendingUp} iconColor="text-cyan-400" wide>
        <div className="flex items-center justify-center gap-8 py-6">
          <div className="text-center">
            <p className="text-5xl font-display font-bold text-cyan-400">{avgTAT}</p>
            <p className="text-sm text-slate-500 mt-2 font-semibold">Avg. Days</p>
          </div>
          <div className="text-center">
            <p className="text-5xl font-display font-bold text-emerald-400">{withTAT.length}</p>
            <p className="text-sm text-slate-500 mt-2 font-semibold">MRFs Tracked</p>
          </div>
          <div className="text-center">
            <p className="text-5xl font-display font-bold text-amber-400">
              {Math.min(...withTAT.map(r => parseInt(r['TAT (Turnaround Time)']))) || 0}
            </p>
            <p className="text-sm text-slate-500 mt-2 font-semibold">Fastest (days)</p>
          </div>
        </div>
      </ChartCard>
    </div>
  )
}

// ── Report renderer map ────────────────────────────────────────────────────
const RENDERERS = {
  recruitment_summary:  (mrfs, records) => <RecruitmentSummaryReport mrfs={mrfs} records={records} />,
  department_hiring:    (mrfs, records) => <DepartmentHiringReport records={records} />,
  vacancy_status:       (mrfs, records) => <VacancyStatusReport records={records} />,
  mrf_status:           (mrfs, records) => <MRFStatusReport mrfs={mrfs} />,
  retirement_analysis:  (mrfs, records) => <RetirementAnalysisReport records={records} />,
  resignation_analysis: (mrfs, records) => <ResignationAnalysisReport records={records} />,
  source_of_hiring:     (mrfs, records) => <SourceOfHiringReport records={records} />,
  offer_vs_joining:     (mrfs, records) => <OfferVsJoiningReport records={records} />,
  tat_analysis:         (mrfs, records) => <TATAnalysisReport records={records} />,
}

// ─────────────────────────────────────────────────────────────────────────────
// Main AdminReportsPage
// ─────────────────────────────────────────────────────────────────────────────
export default function AdminReportsPage() {
  const [sheetData, setSheetData] = useState([])
  const [mrfs, setMrfs] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedReport, setSelectedReport] = useState('mrf_status')
  const [dropdownOpen, setDropdownOpen] = useState(false)

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      try {
        const [mrfRes, sheetRes] = await Promise.allSettled([mrfApi.list(), sheetApi.fetchAll()])
        if (mrfRes.status === 'fulfilled') setMrfs(mrfRes.value || [])
        if (sheetRes.status === 'fulfilled') setSheetData(sheetRes.value || [])
      } catch (e) { console.error(e) }
      finally { setLoading(false) }
    }
    load()
  }, [])

  const isDummy = sheetData.length === 0 || !sheetData.some(r => r['Designation'] || r['Location'])
  const records = isDummy ? DUMMY_SHEET : sheetData

  const role = localStorage.getItem('hr_role') || ''
  const roleLabel = role === 'admin' ? 'HR Admin Analytics' : role === 'hr' ? 'HR Manager Reports' : 'Department Reports'

  const currentReport = REPORTS.find(r => r.key === selectedReport) || REPORTS[0]

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-4 pb-8 space-y-6">

      {isDummy && (
        <div className="fade-up flex justify-end">
          <div className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-purple-500/10 border border-purple-500/20 text-purple-400 text-xs font-semibold">
            <Info size={12} className="animate-pulse" /> Showing Sample Data — Connect Google Sheet for live data
          </div>
        </div>
      )}

      {/* Report Selector Dropdown */}
      <div className="fade-up-1 relative z-20 max-w-sm">
        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 block">Select Report</label>
        <button
          onClick={() => setDropdownOpen(o => !o)}
          className="w-full flex items-center justify-between gap-3 px-4 py-3 rounded-xl bg-white/6 border border-white/12 text-white font-semibold text-sm hover:bg-white/8 hover:border-accent/30 transition-all"
        >
          <div className="flex items-center gap-2.5">
            <currentReport.icon size={15} className={currentReport.color} />
            {currentReport.label}
          </div>
          <ChevronDown size={15} className={`text-slate-400 transition-transform duration-200 ${dropdownOpen ? 'rotate-180' : ''}`} />
        </button>

        {dropdownOpen && (
          <div className="absolute top-full mt-1 w-full bg-ink-950 border border-white/10 rounded-xl shadow-2xl overflow-hidden">
            {REPORTS.map((r) => (
              <button
                key={r.key}
                onClick={() => { setSelectedReport(r.key); setDropdownOpen(false) }}
                className={`w-full flex items-center gap-3 px-4 py-3 text-sm text-left transition-all
                  ${selectedReport === r.key
                    ? 'bg-accent/15 text-accent font-semibold'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
              >
                <r.icon size={14} className={r.color} />
                {r.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Report content */}
      {loading ? (
        <div className="card p-24 flex items-center justify-center">
          <Loader2 size={24} className="animate-spin text-accent" />
        </div>
      ) : (
        <div className="fade-up-2">
          {RENDERERS[selectedReport]?.(mrfs, records)}
        </div>
      )}
    </div>
  )
}
