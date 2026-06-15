import React, { useState, useEffect } from 'react'
import {
  FileSpreadsheet, AlertCircle, BarChart3, PieChart, TrendingUp, Calendar, Info, Loader2
} from 'lucide-react'
import { mrfApi, sheetApi } from '../services/api.js'



// ── Chart 1: Professional SVG Donut with Percentage Labels ─────────────────
function DonutChart({ data, size = 200 }) {
  const total = data.reduce((s, item) => s + item.value, 0) || 1
  const radius = 60
  const circ = 2 * Math.PI * radius
  let accumulatedPercent = 0

  return (
    <div className="flex flex-col sm:flex-row items-center gap-8 justify-center p-4">
      <div className="relative flex-shrink-0" style={{ width: size, height: size }}>
        <svg viewBox="0 0 200 200" className="w-full h-full transform -rotate-90">
          <circle cx="100" cy="100" r={radius} fill="transparent" stroke="rgba(255,255,255,0.05)" strokeWidth="16" />
          {data.map((item, idx) => {
            const pct = (item.value / total) * 100
            const strokeDashoffset = circ - (pct / 100) * circ
            const rotate = (accumulatedPercent / 100) * 360
            accumulatedPercent += pct

            // Calculate center angle of the slice for percentage text placement
            const midAngle = ((rotate + (pct / 2) * 3.6) * Math.PI) / 180
            const textX = 100 + Math.cos(midAngle) * (radius + 20)
            const textY = 100 + Math.sin(midAngle) * (radius + 20)

            return (
              <g key={idx}>
                <circle
                  cx="100"
                  cy="100"
                  r={radius}
                  fill="transparent"
                  stroke={item.color}
                  strokeWidth="16"
                  strokeDasharray={circ}
                  strokeDashoffset={strokeDashoffset}
                  className="transition-all duration-700 ease-out"
                  transform={`rotate(${rotate} 100 100)`}
                />
                {pct > 5 && (
                  <g className="transform rotate-90" style={{ transformOrigin: `${textX}px ${textY}px` }}>
                    <text
                      x={textX}
                      y={textY}
                      fill={item.color}
                      fontSize="9"
                      fontWeight="bold"
                      textAnchor="middle"
                      dominantBaseline="middle"
                    >
                      {Math.round(pct)}%
                    </text>
                  </g>
                )}
              </g>
            )
          })}
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          <span className="text-2xl font-bold text-white leading-none">{total}</span>
          <span className="text-[9px] text-slate-500 uppercase tracking-widest mt-1.5 font-bold">Positions</span>
        </div>
      </div>

      <div className="space-y-2 flex-1 w-full max-w-xs">
        {data.map((item, idx) => {
          const pct = Math.round((item.value / total) * 100)
          return (
            <div key={idx} className="flex items-center justify-between text-xs py-1.5 border-b border-white/5 last:border-0 font-medium">
              <div className="flex items-center gap-2 min-w-0">
                <span className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: item.color }} />
                <span className="text-slate-400 truncate">{item.label}</span>
              </div>
              <span className="text-white font-bold ml-4">{item.value} ({pct}%)</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ── Chart 2: Department-wise Hiring Bar Chart ──────────────────────────────
function BarChart({ data, height = 200 }) {
  const maxVal = Math.max(...data.map(d => d.value), 1)
  const Y_GRID_COUNT = 4
  const gridLines = Array.from({ length: Y_GRID_COUNT + 1 }, (_, i) => Math.round((maxVal / Y_GRID_COUNT) * i))

  return (
    <div className="space-y-4 p-5 rounded-xl bg-white/2 border border-white/5">
      <div className="relative flex gap-4 w-full" style={{ height }}>
        {/* Y Axis Grid Labels */}
        <div className="flex flex-col justify-between text-[10px] text-slate-500 font-bold select-none h-full w-8 items-end pr-2">
          {gridLines.reverse().map((g, i) => <span key={i}>{g}</span>)}
        </div>

        {/* Chart Area */}
        <div className="flex-1 border-b border-l border-white/10 relative h-full flex items-end justify-around px-2 pt-4">
          {/* Background Grid Lines */}
          <div className="absolute inset-0 flex flex-col justify-between pointer-events-none select-none">
            {Array.from({ length: Y_GRID_COUNT }).map((_, i) => (
              <div key={i} className="border-t border-white/5 w-full h-px" />
            ))}
            <div className="h-px" /> {/* empty space at bottom */}
          </div>

          {/* Columns */}
          {data.map((item, idx) => {
            const pct = (item.value / maxVal) * 100
            return (
              <div key={idx} className="flex flex-col items-center flex-1 group h-full justify-end relative max-w-[60px]">
                <div 
                  className="w-full bg-gradient-to-t from-accent/30 to-accent/90 hover:from-accent hover:to-accent rounded-t transition-all duration-500 relative"
                  style={{ height: `${pct}%` }}
                >
                  {/* Tooltip */}
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 hidden group-hover:block bg-ink-950 border border-white/10 rounded px-2 py-0.5 text-[9px] font-bold text-white whitespace-nowrap z-10 shadow-xl">
                    {item.value} vacancies
                  </div>
                </div>
                {/* Horizontal Label */}
                <div className="absolute top-full mt-2 text-[10px] text-slate-500 font-bold text-center truncate w-full" title={item.label}>
                  {item.label}
                </div>
              </div>
            )
          })}
        </div>
      </div>
      <div className="h-4" /> {/* spacing for top-full labels */}
    </div>
  )
}

// ── Chart 3: Open vs Filled Positions Comparative Bar Chart ────────────────
function GroupedBarChart({ data, height = 200 }) {
  const maxVal = Math.max(...data.map(d => Math.max(d.open, d.filled)), 1)
  const Y_GRID_COUNT = 4
  const gridLines = Array.from({ length: Y_GRID_COUNT + 1 }, (_, i) => Math.round((maxVal / Y_GRID_COUNT) * i))

  return (
    <div className="space-y-4 p-5 rounded-xl bg-white/2 border border-white/5">
      <div className="relative flex gap-4 w-full" style={{ height }}>
        {/* Y Axis Grid */}
        <div className="flex flex-col justify-between text-[10px] text-slate-500 font-bold select-none h-full w-8 items-end pr-2">
          {gridLines.reverse().map((g, i) => <span key={i}>{g}</span>)}
        </div>

        {/* Columns Area */}
        <div className="flex-1 border-b border-l border-white/10 relative h-full flex items-end justify-around px-2 pt-4">
          <div className="absolute inset-0 flex flex-col justify-between pointer-events-none select-none">
            {Array.from({ length: Y_GRID_COUNT }).map((_, i) => (
              <div key={i} className="border-t border-white/5 w-full h-px" />
            ))}
            <div className="h-px" />
          </div>

          {/* Grouped Columns */}
          {data.map((item, idx) => {
            const openPct = (item.open / maxVal) * 100
            const filledPct = (item.filled / maxVal) * 100
            return (
              <div key={idx} className="flex flex-col items-center flex-1 h-full justify-end relative max-w-[80px] group">
                <div className="flex items-end gap-1 w-full justify-center h-full pb-px">
                  {/* Open Bar */}
                  <div 
                    className="w-4 bg-cyan-500/70 hover:bg-cyan-500 rounded-t transition-all duration-300 relative"
                    style={{ height: `${openPct}%` }}
                    title={`Open: ${item.open}`}
                  >
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 hidden group-hover:block bg-ink-950 border border-white/10 rounded px-2 py-0.5 text-[9px] font-bold text-white whitespace-nowrap z-10 shadow-xl">
                      Open: {item.open}
                    </div>
                  </div>
                  {/* Filled Bar */}
                  <div 
                    className="w-4 bg-emerald-500/70 hover:bg-emerald-500 rounded-t transition-all duration-300 relative"
                    style={{ height: `${filledPct}%` }}
                    title={`Filled: ${item.filled}`}
                  >
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 hidden group-hover:block bg-ink-950 border border-white/10 rounded px-2 py-0.5 text-[9px] font-bold text-white whitespace-nowrap z-10 shadow-xl">
                      Filled: {item.filled}
                    </div>
                  </div>
                </div>
                {/* Labels */}
                <div className="absolute top-full mt-2 text-[10px] text-slate-500 font-bold text-center truncate w-full" title={item.label}>
                  {item.label}
                </div>
              </div>
            )
          })}
        </div>
      </div>
      <div className="h-4" />

      {/* Legend */}
      <div className="flex justify-center gap-4 text-[10px] font-bold">
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-sm bg-cyan-500/70" />
          <span className="text-slate-400">Open Positions</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-sm bg-emerald-500/70" />
          <span className="text-slate-400">Filled Positions</span>
        </div>
      </div>
    </div>
  )
}

// ── Chart 4: Retirement & Resignation Exit Trends Line Chart ──────────────
function LineChart({ data, width = 500, height = 200 }) {
  const values = data.map(d => d.value)
  const maxVal = Math.max(...values, 1)

  // Map coordinates
  const padding = 30
  const chartWidth = width - padding * 2
  const chartHeight = height - padding * 2

  const divisor = data.length > 1 ? data.length - 1 : 1
  const points = data.map((d, idx) => {
    const x = padding + (idx / divisor) * chartWidth
    const y = padding + chartHeight - (d.value / maxVal) * chartHeight
    return { x, y, label: d.label, val: d.value }
  })

  const pathD = points.length > 0 
    ? `M ${points[0].x} ${points[0].y} ` + points.slice(1).map(p => `L ${p.x} ${p.y}`).join(' ')
    : ''

  const areaD = points.length > 0
    ? `${pathD} L ${points[points.length - 1].x} ${padding + chartHeight} L ${points[0].x} ${padding + chartHeight} Z`
    : ''

  return (
    <div className="p-4 rounded-xl bg-white/2 border border-white/5 space-y-2 flex flex-col items-center">
      <div className="relative w-full overflow-hidden" style={{ height }}>
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full">
          <defs>
            <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#ec4899" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#ec4899" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Grid lines */}
          <line x1={padding} y1={padding} x2={width - padding} y2={padding} stroke="rgba(255,255,255,0.03)" />
          <line x1={padding} y1={padding + chartHeight / 2} x2={width - padding} y2={padding + chartHeight / 2} stroke="rgba(255,255,255,0.03)" />
          <line x1={padding} y1={padding + chartHeight} x2={width - padding} y2={padding + chartHeight} stroke="rgba(255,255,255,0.1)" />

          {/* Area under curve */}
          {areaD && <path d={areaD} fill="url(#areaGradient)" />}

          {/* Polyline */}
          {pathD && <path d={pathD} fill="none" stroke="#ec4899" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />}

          {/* Interactive coordinates points */}
          {points.map((p, idx) => (
            <g key={idx} className="group cursor-pointer">
              <circle cx={p.x} cy={p.y} r="5" fill="#ec4899" stroke="#12131a" strokeWidth="2" />
              <circle cx={p.x} cy={p.y} r="10" fill="transparent" />
              {/* Tooltip on hover */}
              <text x={p.x} y={p.y - 12} fill="white" fontSize="9" textAnchor="middle" fontWeight="bold" className="hidden group-hover:block bg-ink-950 px-1">
                {p.val} Exits
              </text>
              {/* X-axis labels */}
              <text x={p.x} y={height - 10} fill="#64748b" fontSize="8" fontWeight="bold" textAnchor="middle">
                {p.label}
              </text>
            </g>
          ))}
        </svg>
      </div>
      <div className="flex items-center gap-1.5 text-[10px] text-pink-400 font-bold justify-center">
        <span className="w-2.5 h-2.5 rounded-full bg-pink-500" />
        <span>Exit Replacement requisitions over time</span>
      </div>
    </div>
  )
}

// ── Chart 5: Recruitment Pipeline Funnel Component ────────────────────────
function FunnelChart({ data }) {
  const max = Math.max(...data.map(d => d.value), 1)
  return (
    <div className="p-5 rounded-xl bg-white/2 border border-white/5 space-y-4">
      <div className="space-y-3">
        {data.map((stage, idx) => {
          const pct = Math.round((stage.value / max) * 100)
          return (
            <div key={idx} className="space-y-1">
              <div className="flex justify-between text-xs font-semibold">
                <span className="text-slate-400">{stage.label}</span>
                <span className="text-white font-semibold">{stage.value} candidates ({pct}%)</span>
              </div>
              <div className="h-3 bg-white/5 rounded-full overflow-hidden flex">
                <div 
                  className={`h-full ${stage.color} rounded-full transition-all duration-700`}
                  style={{ width: `${pct}%` }}
                />
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ── ReportsPage Dashboard ───────────────────────────────────────────────────

export default function ReportsPage() {
  const [sheetData, setSheetData] = useState([])
  const [mrfs, setMrfs] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadReportData = async () => {
      setLoading(true)
      try {
        const [mrfList, sheetRows] = await Promise.allSettled([
          mrfApi.list(),
          sheetApi.fetchAll()
        ])
        if (mrfList.status === 'fulfilled') setMrfs(mrfList.value || [])
        if (sheetRows.status === 'fulfilled') setSheetData(sheetRows.value || [])
      } catch (e) {
        console.error('Failed to load report data:', e)
      } finally {
        setLoading(false)
      }
    }
    loadReportData()
  }, [])

  const records = (sheetData && sheetData.recruitmentTracker && sheetData.recruitmentTracker.length > 0)
    ? sheetData.recruitmentTracker
    : []
  const hasData = records.length > 0

  // 1. Donut: Vacancy Status Distribution
  const posStatusMap = {}
  records.forEach(row => {
    const status = (row['Position Status'] || 'Open').trim()
    posStatusMap[status] = (posStatusMap[status] || 0) + 1
  })

  const posStatusData = [
    { label: 'Open', value: posStatusMap['Open'] || 0, color: '#06b6d4' },
    { label: 'In Progress', value: posStatusMap['In Progress'] || 0, color: '#6366f1' },
    { label: 'Closed', value: posStatusMap['Closed'] || 0, color: '#10b981' },
    { label: 'On Hold', value: posStatusMap['On Hold'] || 0, color: '#f59e0b' }
  ].filter(i => i.value > 0)

  // 2. Bar: Department-wise hiring
  const deptMap = {}
  records.forEach(row => {
    const dept = (row['Department'] || 'General').trim()
    const vacs = parseInt(row['Number of Vacancies']) || 1
    deptMap[dept] = (deptMap[dept] || 0) + vacs
  })

  const deptData = Object.entries(deptMap)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([label, value]) => ({ label, value }))

  // 3. Funnel: Sourcing Pipeline
  const offerCounts = { Offered: 0, Accepted: 0, Joined: 0, Declined: 0 }
  records.forEach(row => {
    const offer = (row['Offer Status'] || 'Not Offered').trim()
    if (offerCounts[offer] !== undefined) offerCounts[offer] += 1
  })

  const pipelineData = [
    { label: 'Offered Hires', value: offerCounts.Offered + offerCounts.Accepted + offerCounts.Joined + offerCounts.Declined, color: 'bg-amber-400' },
    { label: 'Offers Accepted', value: offerCounts.Accepted + offerCounts.Joined, color: 'bg-blue-400' },
    { label: 'Joined / Onboarded', value: offerCounts.Joined, color: 'bg-emerald-400' }
  ]

  // 4. Grouped: Open vs Filled
  const openFilledMap = {}
  records.forEach(row => {
    const dept = (row['Department'] || 'General').trim()
    const vacs = parseInt(row['Number of Vacancies']) || 1
    const offer = (row['Offer Status'] || '').trim()
    const isFilled = offer === 'Joined' || offer === 'Accepted'

    if (!openFilledMap[dept]) {
      openFilledMap[dept] = { open: 0, filled: 0 }
    }
    if (isFilled) {
      openFilledMap[dept].filled += vacs
    } else {
      openFilledMap[dept].open += vacs
    }
  })

  const openFilledData = Object.entries(openFilledMap)
    .slice(0, 5)
    .map(([dept, counts]) => ({
      label: dept,
      open: counts.open,
      filled: counts.filled
    }))

  // 5. Line: Exits over time — real data from sheet only
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  const exitCounts = Object.fromEntries(months.map(m => [m, 0]))

  records.forEach(row => {
    const exitDate = row['Position Start Date']
    const isExit = row['Employee Name (Retirement/Resignation/Transfer Out)'] && row['Employee Name (Retirement/Resignation/Transfer Out)'] !== 'None'
    if (isExit && exitDate) {
      try {
        const d = new Date(exitDate)
        const monthName = months[d.getMonth()]
        if (monthName) exitCounts[monthName] += 1
      } catch {}
    }
  })

  const exitsData = months.map(m => ({ label: m, value: exitCounts[m] }))


  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      {!hasData && !loading && (
        <div className="flex justify-center py-24 fade-up">
          <div className="text-center space-y-3">
            <AlertCircle size={36} className="text-slate-600 mx-auto" />
            <p className="text-slate-400 font-semibold">No Google Sheet data available</p>
            <p className="text-slate-600 text-xs">Connect your Google Sheet to see live analytics &amp; charts.</p>
          </div>
        </div>
      )}

      {hasData && (
        loading ? (
          <div className="card p-24 flex items-center justify-center">
            <Loader2 size={24} className="animate-spin text-accent" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Chart 1: Donut Vacancies Status */}
            <div className="card p-5 border border-white/5 bg-ink-950/40 space-y-4">
              <h3 className="font-display font-bold text-white text-[14px] flex items-center gap-2">
                <PieChart size={15} className="text-cyan-400" />
                Vacancy Status Distribution
              </h3>
              {posStatusData.length > 0 ? (
                <DonutChart data={posStatusData} />
              ) : (
                <div className="py-12 text-center text-slate-500 italic">No position status recorded.</div>
              )}
            </div>

            {/* Chart 2: Bar department comparisons */}
            <div className="card p-5 border border-white/5 bg-ink-950/40 space-y-4">
              <h3 className="font-display font-bold text-white text-[14px] flex items-center gap-2">
                <BarChart3 size={15} className="text-accent" />
                Department-wise Hiring (Total Vacancies)
              </h3>
              {deptData.length > 0 ? (
                <BarChart data={deptData} />
              ) : (
                <div className="py-12 text-center text-slate-500 italic">No department vacancy data recorded.</div>
              )}
            </div>

            {/* Chart 3: Pipeline Stages */}
            <div className="card p-5 border border-white/5 bg-ink-950/40 space-y-4">
              <h3 className="font-display font-bold text-white text-[14px] flex items-center gap-2">
                <TrendingUp size={15} className="text-amber-400" />
                Sourcing Recruitment Pipeline
              </h3>
              <FunnelChart data={pipelineData} />
            </div>

            {/* Chart 4: Grouped Bar Open vs Filled */}
            <div className="card p-5 border border-white/5 bg-ink-950/40 space-y-4">
              <h3 className="font-display font-bold text-white text-[14px] flex items-center gap-2">
                <BarChart3 size={15} className="text-emerald-400" />
                Open vs Filled Positions by Department
              </h3>
              {openFilledData.length > 0 ? (
                <GroupedBarChart data={openFilledData} />
              ) : (
                <div className="py-12 text-center text-slate-500 italic">No vacancy status data logged.</div>
              )}
            </div>

            {/* Chart 5: Line Exits Trend */}
            <div className="card md:col-span-2 p-5 border border-white/5 bg-ink-950/40 space-y-4">
              <h3 className="font-display font-bold text-white text-[14px] flex items-center gap-2">
                <Calendar size={15} className="text-pink-400" />
                Exit Replacements Trend (Retirement &amp; Resignations)
              </h3>
              <LineChart data={exitsData} />
            </div>

          </div>
        )
      )}
    </div>
  )
}
