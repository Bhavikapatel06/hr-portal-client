import React, { useState } from 'react'
import {
  LayoutDashboard, Building2, MapPin, Users, Target,
  Coins, Clock, ArrowRightLeft, GraduationCap, Briefcase,
  ChevronDown, ChevronUp, FileSpreadsheet, Activity, HelpCircle, AlertCircle
} from 'lucide-react'

// ── 5 Canonical Dummy Records representing all 36 fields ─────────────────────
const DUMMY_DATA = [
  {
    'Location': 'Mumbai',
    'Designation': 'Senior Software Engineer',
    'Department': 'Engineering',
    'Section': 'R&D',
    'Number of Vacancies': '2',
    'Position Status': 'In Progress',
    'Requirement Status': 'In Progress',
    'Offer Status': 'Offered',
    'Vacancy Remarks': 'Replacement for Suresh Mehta due to relocation',
    'Process Owner Name': 'Anil Kumar',
    'Requirement Type (Lateral/Campus)': 'Lateral',
    'Pre-Employment Medical Status': 'Cleared',
    'Offer Date': '2026-05-15',
    'Tentative Date of Joining (DOJ)': '2026-06-15',
    'TAT (Turnaround Time)': '25',
    'Offered Candidate Name': 'Rahul Sharma',
    'Offered Designation': 'Senior Software Engineer',
    'Actual DOJ': '2026-06-12',
    'Source of Hiring': 'Naukri',
    'Internal Reference Name': 'None',
    'Qualification': 'B.Tech CSE',
    'Last Organization': 'TCS',
    'Location (Candidate)': 'Pune',
    'Last Designation': 'Software Engineer',
    'Total Previous Experience': '4 Years',
    'Last CTC': '1200000',
    'Offered CTC': '1600000',
    'Cost of Company (COC)': '1750000',
    'CTC Difference Amount': '400000',
    'CTC Difference (%)': '33.3%',
    'Recruitment Remarks': 'Selected after 3 technical rounds; joining within notice',
    'Employee Name (Retirement/Resignation/Transfer Out)': 'Suresh Mehta',
    'Employee Designation': 'Senior Developer',
    'Position Start Date': '2026-05-01',
    'Additional Remarks': 'Immediate joiner preferred, relocate expense approved',
    'Company Name': 'AIA Tech'
  },
  {
    'Location': 'Bangalore',
    'Designation': 'Product Manager',
    'Department': 'Product Management',
    'Section': 'Growth',
    'Number of Vacancies': '1',
    'Position Status': 'Open',
    'Requirement Status': 'In Progress',
    'Offer Status': 'Joined',
    'Vacancy Remarks': 'New headcount approved for growth team expansion',
    'Process Owner Name': "Sarah D'Souza",
    'Requirement Type (Lateral/Campus)': 'Lateral',
    'Pre-Employment Medical Status': 'Cleared',
    'Offer Date': '2026-04-10',
    'Tentative Date of Joining (DOJ)': '2026-05-10',
    'TAT (Turnaround Time)': '35',
    'Offered Candidate Name': 'Priya Nair',
    'Offered Designation': 'Product Manager',
    'Actual DOJ': '2026-05-10',
    'Source of Hiring': 'LinkedIn',
    'Internal Reference Name': 'Rohan Sen',
    'Qualification': 'MBA Marketing',
    'Last Organization': 'Razorpay',
    'Location (Candidate)': 'Bangalore',
    'Last Designation': 'Associate Product Manager',
    'Total Previous Experience': '3 Years',
    'Last CTC': '1800000',
    'Offered CTC': '2400000',
    'Cost of Company (COC)': '2600000',
    'CTC Difference Amount': '600000',
    'CTC Difference (%)': '33.3%',
    'Recruitment Remarks': 'Strong product sense and analytical skills',
    'Employee Name (Retirement/Resignation/Transfer Out)': 'None',
    'Employee Designation': 'None',
    'Position Start Date': '2026-04-01',
    'Additional Remarks': 'No exit replacement required',
    'Company Name': 'AIA Solutions'
  },
  {
    'Location': 'Delhi',
    'Designation': 'HR Executive',
    'Department': 'Human Resources',
    'Section': 'Operations',
    'Number of Vacancies': '1',
    'Position Status': 'Closed',
    'Requirement Status': 'Fulfilled',
    'Offer Status': 'Joined',
    'Vacancy Remarks': 'Replacement for Priya Patel',
    'Process Owner Name': 'Meenakshi Iyer',
    'Requirement Type (Lateral/Campus)': 'Campus',
    'Pre-Employment Medical Status': 'Cleared',
    'Offer Date': '2026-05-01',
    'Tentative Date of Joining (DOJ)': '2026-06-01',
    'TAT (Turnaround Time)': '20',
    'Offered Candidate Name': 'Neha Gupta',
    'Offered Designation': 'HR Executive',
    'Actual DOJ': '2026-06-01',
    'Source of Hiring': 'Campus Drive',
    'Internal Reference Name': 'None',
    'Qualification': 'MBA HR',
    'Last Organization': 'None',
    'Location (Candidate)': 'Delhi',
    'Last Designation': 'Intern',
    'Total Previous Experience': 'Fresher',
    'Last CTC': '350000',
    'Offered CTC': '600000',
    'Cost of Company (COC)': '650000',
    'CTC Difference Amount': '250000',
    'CTC Difference (%)': '71.4%',
    'Recruitment Remarks': 'Excellent academic record and presentation',
    'Employee Name (Retirement/Resignation/Transfer Out)': 'Priya Patel',
    'Employee Designation': 'HR Analyst',
    'Position Start Date': '2026-04-20',
    'Additional Remarks': 'Immediate onboarding success',
    'Company Name': 'AIA Tech'
  },
  {
    'Location': 'Hyderabad',
    'Designation': 'DevOps Engineer',
    'Department': 'Engineering',
    'Section': 'Cloud Operations',
    'Number of Vacancies': '1',
    'Position Status': 'In Progress',
    'Requirement Status': 'In Progress',
    'Offer Status': 'Accepted',
    'Vacancy Remarks': 'Resignation replacement for Amit Saxena',
    'Process Owner Name': 'Rajesh Rao',
    'Requirement Type (Lateral/Campus)': 'Lateral',
    'Pre-Employment Medical Status': 'Pending',
    'Offer Date': '2026-05-20',
    'Tentative Date of Joining (DOJ)': '2026-06-25',
    'TAT (Turnaround Time)': '40',
    'Offered Candidate Name': 'Vikram Reddy',
    'Offered Designation': 'DevOps Engineer',
    'Actual DOJ': '',
    'Source of Hiring': 'Referral',
    'Internal Reference Name': 'Kiran Kumar',
    'Qualification': 'B.Tech IT',
    'Last Organization': 'Infosys',
    'Location (Candidate)': 'Hyderabad',
    'Last Designation': 'Senior Systems Engineer',
    'Total Previous Experience': '5 Years',
    'Last CTC': '1400000',
    'Offered CTC': '1900000',
    'Cost of Company (COC)': '2100000',
    'CTC Difference Amount': '500000',
    'CTC Difference (%)': '35.7%',
    'Recruitment Remarks': 'AWS and Kubernetes expert',
    'Employee Name (Retirement/Resignation/Transfer Out)': 'Amit Saxena',
    'Employee Designation': 'DevOps Lead',
    'Position Start Date': '2026-05-05',
    'Additional Remarks': 'Candidate will join post notice period',
    'Company Name': 'AIA Tech'
  },
  {
    'Location': 'Pune',
    'Designation': 'QA Lead',
    'Department': 'Quality Assurance',
    'Section': 'Automation',
    'Number of Vacancies': '1',
    'Position Status': 'On Hold',
    'Requirement Status': 'On Hold',
    'Offer Status': 'Declined',
    'Vacancy Remarks': 'New expansion budget division',
    'Process Owner Name': 'Vikram Jaiswal',
    'Requirement Type (Lateral/Campus)': 'Lateral',
    'Pre-Employment Medical Status': 'Not Started',
    'Offer Date': '2026-04-05',
    'Tentative Date of Joining (DOJ)': '2026-05-15',
    'TAT (Turnaround Time)': '45',
    'Offered Candidate Name': 'Aditya Joshi',
    'Offered Designation': 'QA Lead',
    'Actual DOJ': '',
    'Source of Hiring': 'Consultant',
    'Internal Reference Name': 'None',
    'Qualification': 'MCA',
    'Last Organization': 'Wipro',
    'Location (Candidate)': 'Pune',
    'Last Designation': 'Senior QA Engineer',
    'Total Previous Experience': '6 Years',
    'Last CTC': '1500000',
    'Offered CTC': '2000000',
    'Cost of Company (COC)': '2200000',
    'CTC Difference Amount': '500000',
    'CTC Difference (%)': '33.3%',
    'Recruitment Remarks': 'Declined the offer for a counter-offer',
    'Employee Name (Retirement/Resignation/Transfer Out)': 'None',
    'Employee Designation': 'None',
    'Position Start Date': '2026-03-15',
    'Additional Remarks': 'Position put on hold temporarily',
    'Company Name': 'AIA Systems'
  }
];

// ── Shared Visual Sub-Components ─────────────────────────────────────────────

function DonutChart({ data, size = 130 }) {
  const total = data.reduce((s, item) => s + item.value, 0) || 1;
  const radius = 46;
  const circ = 2 * Math.PI * radius;
  let accumulatedPercent = 0;

  return (
    <div className="flex flex-col sm:flex-row items-center gap-5 p-4 rounded-xl bg-white/2 border border-white/5">
      <div className="relative flex-shrink-0" style={{ width: size, height: size }}>
        <svg viewBox="0 0 110 110" className="w-full h-full transform -rotate-90">
          <circle cx="55" cy="55" r={radius} fill="transparent" stroke="rgba(255,255,255,0.04)" strokeWidth="10" />
          {data.map((item, idx) => {
            const pct = (item.value / total) * 100;
            const strokeDashoffset = circ - (pct / 100) * circ;
            const strokeDasharray = circ;
            const rotate = (accumulatedPercent / 100) * 360;
            accumulatedPercent += pct;
            
            return (
              <circle
                key={idx}
                cx="55"
                cy="55"
                r={radius}
                fill="transparent"
                stroke={item.color}
                strokeWidth="10"
                strokeDasharray={strokeDasharray}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap={pct > 0 ? "round" : "butt"}
                className="transition-all duration-700 ease-out"
                transform={`rotate(${rotate} 55 55)`}
              />
            );
          })}
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          <span className="text-xl font-bold text-white leading-none">{total}</span>
          <span className="text-[8px] text-slate-500 uppercase tracking-widest mt-1 font-semibold">Total</span>
        </div>
      </div>
      <div className="space-y-1.5 flex-1 min-w-0 w-full">
        {data.map((item, idx) => {
          const pct = Math.round((item.value / total) * 100);
          return (
            <div key={idx} className="flex items-center justify-between text-[11px] font-medium leading-relaxed">
              <div className="flex items-center gap-2 min-w-0">
                <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: item.color }} />
                <span className="text-slate-400 truncate">{item.label}</span>
              </div>
              <span className="text-white font-semibold flex-shrink-0 ml-2">{item.value} ({pct}%)</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function HorizontalBarList({ data, title, accentColor = 'bg-accent/70' }) {
  const max = Math.max(...data.map(item => item.value), 1);
  return (
    <div className="p-4 rounded-xl bg-white/2 border border-white/5 space-y-3">
      {title && <h5 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">{title}</h5>}
      <div className="space-y-3">
        {data.map((item, idx) => {
          const pct = Math.round((item.value / max) * 100);
          return (
            <div key={idx} className="space-y-1">
              <div className="flex justify-between text-xs font-semibold">
                <span className="text-slate-300 truncate pr-2" title={item.label}>{item.label}</span>
                <span className="text-accent flex-shrink-0">{item.value}</span>
              </div>
              <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                <div 
                  className={`h-full ${item.bg || accentColor} rounded-full transition-all duration-500`} 
                  style={{ width: `${pct}%` }} 
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function VerticalSalaryChart({ data, title }) {
  // Find maximum salary amongst all series to scale vertical heights
  let maxSalary = 1;
  data.forEach(item => {
    maxSalary = Math.max(maxSalary, item.lastCTC, item.offeredCTC, item.coc);
  });
  if (maxSalary === 0) maxSalary = 1;

  return (
    <div className="p-5 rounded-xl bg-white/2 border border-white/5 space-y-4">
      {title && <h5 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest text-center">{title}</h5>}
      <div className="flex items-end justify-around border-b border-white/10 pb-3 gap-3 sm:gap-6 h-40">
        {data.map((item, idx) => {
          const lastPct = (item.lastCTC / maxSalary) * 100;
          const offeredPct = (item.offeredCTC / maxSalary) * 100;
          const cocPct = (item.coc / maxSalary) * 100;

          return (
            <div key={idx} className="flex flex-col items-center flex-1 h-full justify-end group min-w-0">
              <div className="flex items-end gap-1 h-full w-full justify-center">
                {/* Last CTC */}
                {item.lastCTC > 0 && (
                  <div 
                    className="w-3 sm:w-4 bg-slate-500/60 hover:bg-slate-400 rounded-t transition-all duration-300 relative"
                    style={{ height: `${lastPct}%` }}
                  >
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 hidden group-hover:block bg-ink-950 border border-white/10 rounded px-2 py-0.5 text-[9px] font-bold text-white whitespace-nowrap z-10 shadow-xl">
                      Last: ₹{(item.lastCTC / 100000).toFixed(1)}L
                    </div>
                  </div>
                )}
                {/* Offered CTC */}
                <div 
                  className="w-3 sm:w-4 bg-accent/70 hover:bg-accent rounded-t transition-all duration-300 relative"
                  style={{ height: `${offeredPct}%` }}
                >
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 hidden group-hover:block bg-ink-950 border border-white/10 rounded px-2 py-0.5 text-[9px] font-bold text-white whitespace-nowrap z-10 shadow-xl">
                    Offered: ₹{(item.offeredCTC / 100000).toFixed(1)}L
                  </div>
                </div>
                {/* Cost of Company */}
                <div 
                  className="w-3 sm:w-4 bg-accent/70 hover:bg-accent rounded-t transition-all duration-300 relative"
                  style={{ height: `${cocPct}%` }}
                >
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 hidden group-hover:block bg-ink-950 border border-white/10 rounded px-2 py-0.5 text-[9px] font-bold text-white whitespace-nowrap z-10 shadow-xl">
                    COC: ₹{(item.coc / 100000).toFixed(1)}L
                  </div>
                </div>
              </div>
              <span className="text-[10px] text-slate-500 font-semibold mt-2 text-center truncate w-full" title={item.candidate}>
                {item.candidate}
              </span>
            </div>
          );
        })}
      </div>
      {/* Legend */}
      <div className="flex flex-wrap justify-center gap-4 text-[10px] pt-1">
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-sm bg-slate-500/60" />
          <span className="text-slate-400">Last CTC</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-sm bg-accent/70" />
          <span className="text-slate-400">Offered CTC</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-sm bg-accent/70" />
          <span className="text-slate-400">Cost of Company (COC)</span>
        </div>
      </div>
    </div>
  );
}

// ── Main SheetsAnalytics Component ────────────────────────────────────────────

export default function SheetsAnalytics({ data }) {
  const [activeTab, setActiveTab] = useState('requisitions')

  // Check if data is valid sheets data
  const isDummy = !data || data.length === 0 || !data.some(row => row['Designation'] || row['Location'])
  const records = isDummy ? DUMMY_DATA : data

  // Helper cleanups
  const parseNum = (val) => parseInt(String(val).replace(/[^0-9]/g, '')) || 0
  const formatDate = (dStr) => {
    if (!dStr) return '—'
    try {
      const parsed = new Date(dStr)
      if (isNaN(parsed.getTime())) return dStr // return original string if date parsing fails
      return parsed.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
    } catch {
      return dStr
    }
  }

  // Calculate statistics from the spreadsheet rows
  // ── Overview & Requisitions
  let totalPositions = 0
  const positionStatusMap = {}
  const requirementStatusMap = {}
  const reqTypeMap = {}
  const companyMap = {}

  // ── Demographics & Roles
  const locationMap = {}
  const candidateLocMap = {}
  const deptMap = {}
  const sectionMap = {}
  const desigMap = {}
  const ownerMap = {}

  // ── Offer & Sourcing
  const offerStatusMap = {}
  const medicalStatusMap = {}
  const sourceMap = {}
  const refMap = {}
  const qualMap = {}

  // ── CTC Financials
  let totalHikeAmt = 0
  let totalHikePctSum = 0
  let totalHikePctCount = 0
  let maxHikePct = 0
  const lastOrgMap = {}
  const candidateSalaries = []

  // ── Onboarding & Timeline
  let totalTAT = 0
  let tatCount = 0
  const joinTimelines = []

  // ── Exit & Remarks
  const exitReplacements = []
  const remarksList = []

  // Iterate over records to extract stats
  records.forEach((row, idx) => {
    // Graceful support for both Recruitment Tracker sheet columns and DUMMY_DATA keys
    const getVal = (dummyKey, sheetKey) => row[sheetKey] !== undefined ? row[sheetKey] : row[dummyKey]

    // 1. Requisitions
    const vacs = parseNum(getVal('Number of Vacancies', 'Number of Vacancies')) || 1
    totalPositions += vacs

    const posStat = (getVal('Position Status', 'Position Status') || 'Open').trim()
    positionStatusMap[posStat] = (positionStatusMap[posStat] || 0) + 1

    const reqStat = (getVal('Requirement Status', 'Requirement Status') || 'In Progress').trim()
    requirementStatusMap[reqStat] = (requirementStatusMap[reqStat] || 0) + 1

    const reqType = (getVal('Requirement Type (Lateral/Campus)', 'Requirement Type') || 'Lateral').trim()
    reqTypeMap[reqType] = (reqTypeMap[reqType] || 0) + 1

    const compName = (getVal('Company Name', 'Company Name') || 'AIA').trim()
    companyMap[compName] = (companyMap[compName] || 0) + 1

    // 2. Demographics
    const loc = (getVal('Location', 'Vacancy Location') || 'Unspecified').trim()
    locationMap[loc] = (locationMap[loc] || 0) + vacs

    const cLoc = (getVal('Location (Candidate)', 'Last Location') || loc).trim()
    candidateLocMap[cLoc] = (candidateLocMap[cLoc] || 0) + 1

    const dept = (getVal('Department', 'Department') || 'General').trim()
    deptMap[dept] = (deptMap[dept] || 0) + vacs

    const sect = (getVal('Section', 'Section') || 'N/A').trim()
    if (sect && sect !== 'N/A') {
      sectionMap[sect] = (sectionMap[sect] || 0) + 1
    }

    const desig = (getVal('Designation', 'Designation') || 'General Role').trim()
    desigMap[desig] = (desigMap[desig] || 0) + vacs

    const owner = (getVal('Process Owner Name', 'Process Owner Name') || 'N/A').trim()
    ownerMap[owner] = (ownerMap[owner] || 0) + 1

    // 3. Offer & Sourcing
    const offerStat = (getVal('Offer Status', 'Offer Status') || 'Pending').trim()
    offerStatusMap[offerStat] = (offerStatusMap[offerStat] || 0) + 1

    const medStat = (getVal('Pre-Employment Medical Status', 'pre employee medical status') || 'Pending').trim()
    medicalStatusMap[medStat] = (medicalStatusMap[medStat] || 0) + 1

    const src = (getVal('Source of Hiring', 'Source of Hiring') || 'Direct').trim()
    sourceMap[src] = (sourceMap[src] || 0) + 1

    const ref = (getVal('Internal Reference Name', 'Internal Reference Name') || 'None').trim()
    if (ref && ref !== 'None' && ref !== 'N/A') {
      refMap[ref] = (refMap[ref] || 0) + 1
    }

    const qual = (getVal('Qualification', 'Qualification') || 'Degree').trim()
    qualMap[qual] = (qualMap[qual] || 0) + 1

    // 4. CTC Financials
    const lastCTC = parseNum(getVal('Last CTC', 'Last CTC (LPA)')) || 0
    const offeredCTC = parseNum(getVal('Offered CTC', 'Offered CTC (LPA)')) || 0
    const coc = parseNum(getVal('Cost of Company (COC)', 'COC (LPA)')) || offeredCTC

    if (offeredCTC > 0) {
      const diffAmt = parseNum(getVal('CTC Difference Amount', 'CTC Difference Amount')) || (offeredCTC - lastCTC)
      totalHikeAmt += diffAmt

      let diffPct = parseFloat(String(getVal('CTC Difference (%)', 'CTC Difference (%)')).replace(/[^0-9.]/g, ''))
      if (isNaN(diffPct)) {
        diffPct = lastCTC > 0 ? (diffAmt / lastCTC) * 100 : 0
      }
      if (diffPct > 0) {
        totalHikePctSum += diffPct
        totalHikePctCount++
        if (diffPct > maxHikePct) maxHikePct = diffPct
      }

      candidateSalaries.push({
        candidate: getVal('Offered Candidate Name', 'Offered Candidate Name') || `Cand ${idx + 1}`,
        lastCTC,
        offeredCTC,
        coc
      })
    }

    const lastOrg = (getVal('Last Organization', 'Last Organization') || 'N/A').trim()
    if (lastOrg && lastOrg !== 'N/A' && lastOrg !== 'None') {
      lastOrgMap[lastOrg] = (lastOrgMap[lastOrg] || 0) + 1
    }

    // 5. Onboarding & TAT
    const tat = parseNum(getVal('TAT (Turnaround Time)', 'TAT (Days)'))
    if (tat > 0) {
      totalTAT += tat
      tatCount++
    }

    const offeredName = getVal('Offered Candidate Name', 'Offered Candidate Name')
    if (offeredName) {
      joinTimelines.push({
        name: offeredName,
        offerDate: getVal('Offer Date', 'Offer Date'),
        tentativeDOJ: getVal('Tentative Date of Joining (DOJ)', 'Tentative DOJ'),
        actualDOJ: getVal('Actual DOJ', 'Actual DOJ'),
        status: getVal('Offer Status', 'Offer Status')
      })
    }

    // 6. Exits & Remarks
    const exitName = getVal('Employee Name (Retirement/Resignation/Transfer Out)', 'Exit Employee Name')
    if (exitName && exitName !== 'None' && exitName !== 'N/A' && exitName !== '') {
      exitReplacements.push({
        name: exitName,
        designation: getVal('Employee Designation', 'Exit Employee Designation') || 'Developer',
        reason: getVal('Reason for Request', 'Reason for Request') || 'Exit Replacement',
        start: getVal('Position Start Date', 'Exit Date') || '—'
      })
    }

    const remarks = [
      { type: 'Vacancy', txt: getVal('Vacancy Remarks', 'Vacancy Remarks') },
      { type: 'Recruitment', txt: getVal('Recruitment Remarks', 'Recruitment Remarks') },
      { type: 'Additional', txt: getVal('Additional Remarks', 'Additional Remarks') }
    ].filter(r => r.txt && r.txt !== 'None' && r.txt !== 'N/A' && r.txt !== '')
    if (remarks.length > 0) {
      remarksList.push({
        designation: desig,
        candidate: offeredName || '—',
        remarks
      })
    }
  })

  // Format maps for charts
  const posStatusData = [
    { label: 'Open', value: positionStatusMap['Open'] || 0, color: '#06b6d4' },
    { label: 'In Progress', value: positionStatusMap['In Progress'] || 0, color: '#6366f1' },
    { label: 'Closed', value: positionStatusMap['Closed'] || 0, color: '#10b981' },
    { label: 'On Hold', value: positionStatusMap['On Hold'] || 0, color: '#f59e0b' }
  ].filter(i => i.value > 0)

  const reqStatusData = [
    { label: 'In Progress', value: requirementStatusMap['In Progress'] || 0, color: '#6366f1' },
    { label: 'Fulfilled', value: requirementStatusMap['Fulfilled'] || 0, color: '#10b981' },
    { label: 'On Hold', value: requirementStatusMap['On Hold'] || 0, color: '#f59e0b' },
    { label: 'Cancelled', value: requirementStatusMap['Cancelled'] || 0, color: '#ef4444' }
  ].filter(i => i.value > 0)

  const offerStatusData = [
    { label: 'Offered', value: offerStatusMap['Offered'] || 0, color: '#f59e0b' },
    { label: 'Accepted', value: offerStatusMap['Accepted'] || 0, color: '#3b82f6' },
    { label: 'Joined', value: offerStatusMap['Joined'] || 0, color: '#10b981' },
    { label: 'Declined', value: offerStatusMap['Declined'] || 0, color: '#ef4444' }
  ].filter(i => i.value > 0)

  const medicalStatusData = [
    { label: 'Cleared', value: medicalStatusMap['Cleared'] || 0, color: '#10b981' },
    { label: 'Pending', value: medicalStatusMap['Pending'] || 0, color: '#f59e0b' },
    { label: 'Not Started', value: medicalStatusMap['Not Started'] || 0, color: '#94a3b8' },
    { label: 'Failed', value: medicalStatusMap['Failed'] || 0, color: '#ef4444' }
  ].filter(i => i.value > 0)

  const sortAndSliceMap = (m, colors = ['bg-accent/70', 'bg-slate-600/70', 'bg-accent/70', 'bg-slate-500/70', 'bg-slate-500/70']) => 
    Object.entries(m)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([label, value], idx) => ({
        label,
        value,
        bg: colors[idx % colors.length]
      }))

  const topDepts = sortAndSliceMap(deptMap)
  const topLocs = sortAndSliceMap(locationMap, ['bg-blue-500/70', 'bg-slate-500/70', 'bg-teal-500/70', 'bg-indigo-500/70', 'bg-slate-500/70'])
  const topCandLocs = sortAndSliceMap(candidateLocMap, ['bg-blue-500/70', 'bg-slate-500/70', 'bg-teal-500/70', 'bg-indigo-500/70', 'bg-slate-500/70'])
  const topSources = sortAndSliceMap(sourceMap, ['bg-slate-600/70', 'bg-slate-500/70', 'bg-indigo-500/70', 'bg-sky-500/70', 'bg-amber-500/70'])
  const topRefs = sortAndSliceMap(refMap)
  const topQuals = sortAndSliceMap(qualMap)
  const topLastOrgs = sortAndSliceMap(lastOrgMap, ['bg-slate-500/70', 'bg-sky-500/70', 'bg-blue-500/70', 'bg-indigo-500/70', 'bg-violet-500/70'])

  const avgHikePct = totalHikePctCount > 0 ? (totalHikePctSum / totalHikePctCount).toFixed(1) : '0'
  const avgTAT = tatCount > 0 ? Math.round(totalTAT / tatCount) : 0

  return (
    <div className="space-y-6">
      {/* Fallback Notice Badge */}
      {isDummy && (
        <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-600/10 border border-slate-600/20 text-slate-400 text-xs font-semibold select-none">
          <AlertCircle size={14} className="flex-shrink-0 animate-pulse" />
          <span>Showing 5 Sample Records. Configure GOOGLE_SHEET_ID in your server's .env file to visualize live spreadsheet data.</span>
        </div>
      )}

      {/* Tabs Menu */}
      <div className="flex border-b border-white/10 overflow-x-auto scrollbar-none gap-2">
        {[
          { id: 'requisitions', label: 'Requisitions & Statuses', icon: LayoutDashboard },
          { id: 'demographics', label: 'Demographics & Roles', icon: Building2 },
          { id: 'sourcing',     label: 'Offers & Sourcing',     icon: Target },
          { id: 'financials',   label: 'Financials & CTC',      icon: Coins },
          { id: 'timelines',    label: 'Timelines & Exits',     icon: Clock }
        ].map(tab => {
          const Icon = tab.icon
          const active = activeTab === tab.id
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold whitespace-nowrap border-b-2 transition-all -mb-px
                ${active 
                  ? 'border-accent text-accent' 
                  : 'border-transparent text-slate-400 hover:text-white'}`}
            >
              <Icon size={13} />
              {tab.label}
            </button>
          )
        })}
      </div>

      {/* Tab Contents */}
      <div className="fade-up duration-200">
        
        {/* T1: Requisitions & Statuses */}
        {activeTab === 'requisitions' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="card p-4 bg-white/2 border border-white/5">
                <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Total Positions Open</p>
                <p className="text-2xl font-bold text-accent mt-1">{totalPositions}</p>
                <p className="text-[10px] text-slate-600 mt-0.5">Vacancy headcount combined</p>
              </div>
              <div className="card p-4 bg-white/2 border border-white/5">
                <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Lateral Hires</p>
                <p className="text-2xl font-bold text-indigo-400 mt-1">{reqTypeMap['Lateral'] || 0}</p>
                <p className="text-[10px] text-slate-600 mt-0.5">Req type: Lateral hiring</p>
              </div>
              <div className="card p-4 bg-white/2 border border-white/5">
                <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Campus Hires</p>
                <p className="text-2xl font-bold text-slate-400 mt-1">{reqTypeMap['Campus'] || 0}</p>
                <p className="text-[10px] text-slate-600 mt-0.5">Req type: Fresher / Campus intake</p>
              </div>
              <div className="card p-4 bg-white/2 border border-white/5">
                <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Active Entities</p>
                <p className="text-2xl font-bold text-accent mt-1">{Object.keys(companyMap).length}</p>
                <p className="text-[10px] text-slate-600 mt-0.5">Entities: {Object.keys(companyMap).join(', ')}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest px-1">Position Status Distribution</h4>
                {posStatusData.length > 0 ? (
                  <DonutChart data={posStatusData} />
                ) : (
                  <div className="p-8 text-center text-xs italic text-slate-500 bg-white/2 border border-white/5 rounded-xl">No Position Status data found.</div>
                )}
              </div>
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest px-1">Requirement Status Split</h4>
                {reqStatusData.length > 0 ? (
                  <DonutChart data={reqStatusData} />
                ) : (
                  <div className="p-8 text-center text-xs italic text-slate-500 bg-white/2 border border-white/5 rounded-xl">No Requirement Status data found.</div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* T2: Demographics & Roles */}
        {activeTab === 'demographics' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <HorizontalBarList data={topDepts} title="Top Departments by Vacancies" accentColor="bg-accent/70" />
            <HorizontalBarList data={topLocs} title="Top Job Locations by Vacancies" accentColor="bg-blue-500/70" />
            <HorizontalBarList data={topCandLocs} title="Candidate Demographics (Hometown)" accentColor="bg-teal-500/70" />
            
            {/* Designations & Process Owners List */}
            <div className="p-4 rounded-xl bg-white/2 border border-white/5 space-y-4">
              <h5 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Job Requisition Owners</h5>
              <div className="divide-y divide-white/5">
                {Object.entries(ownerMap).map(([owner, count]) => (
                  <div key={owner} className="flex justify-between py-2 text-xs">
                    <span className="text-slate-300 font-semibold">{owner}</span>
                    <span className="text-slate-500">{count} Active MRF{count !== 1 ? 's' : ''}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* T3: Offer Status & Sourcing */}
        {activeTab === 'sourcing' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest px-1">Offer Status Metrics</h4>
                {offerStatusData.length > 0 ? (
                  <DonutChart data={offerStatusData} />
                ) : (
                  <div className="p-8 text-center text-xs italic text-slate-500 bg-white/2 border border-white/5 rounded-xl">No Offer Status data found.</div>
                )}
              </div>
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest px-1">Pre-Employment Medical Clearance</h4>
                {medicalStatusData.length > 0 ? (
                  <DonutChart data={medicalStatusData} />
                ) : (
                  <div className="p-8 text-center text-xs italic text-slate-500 bg-white/2 border border-white/5 rounded-xl">No Medical Status data found.</div>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              <HorizontalBarList data={topSources} title="Hiring Sources" accentColor="bg-slate-600/70" />
              <HorizontalBarList data={topQuals} title="Qualifications Demanded" accentColor="bg-amber-500/70" />
              
              {/* Internal Referral Names */}
              <div className="p-4 rounded-xl bg-white/2 border border-white/5 space-y-3">
                <h5 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Internal Referrals</h5>
                {topRefs.length > 0 ? (
                  <div className="space-y-2">
                    {topRefs.map((item, idx) => (
                      <div key={idx} className="flex justify-between text-xs py-1 border-b border-white/5 last:border-0">
                        <span className="text-slate-300 font-medium">{item.label}</span>
                        <span className="text-accent font-semibold">{item.value} candidate(s)</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-slate-500 italic py-6 text-center">No internal reference logs.</p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* T4: Financials & Compensation */}
        {activeTab === 'financials' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="card p-4 bg-white/2 border border-white/5 text-center">
                <p className="text-[11px] text-slate-500 font-bold uppercase tracking-wider">Avg Salary Hike (%)</p>
                <p className="text-3xl font-bold text-accent mt-1">{avgHikePct}%</p>
                <p className="text-[10px] text-slate-600 mt-0.5">Average CTC delta percentage</p>
              </div>
              <div className="card p-4 bg-white/2 border border-white/5 text-center">
                <p className="text-[11px] text-slate-500 font-bold uppercase tracking-wider">Highest Salary Hike</p>
                <p className="text-3xl font-bold text-indigo-400 mt-1">{maxHikePct.toFixed(1)}%</p>
                <p className="text-[10px] text-slate-600 mt-0.5">Maximum percentage CTC jump</p>
              </div>
              <div className="card p-4 bg-white/2 border border-white/5 text-center">
                <p className="text-[11px] text-slate-500 font-bold uppercase tracking-wider">Total Hike Amount</p>
                <p className="text-2xl font-bold text-accent mt-1">₹{(totalHikeAmt / 100000).toFixed(2)}L</p>
                <p className="text-[10px] text-slate-600 mt-0.5">Offered CTC - Previous CTC sum</p>
              </div>
              <div className="card p-4 bg-white/2 border border-white/5 text-center">
                <p className="text-[11px] text-slate-500 font-bold uppercase tracking-wider">Candidates Compensation</p>
                <p className="text-3xl font-bold text-accent mt-1">{candidateSalaries.length}</p>
                <p className="text-[10px] text-slate-600 mt-0.5">CTC offer packages mapped</p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                {candidateSalaries.length > 0 ? (
                  <VerticalSalaryChart data={candidateSalaries.slice(0, 5)} title="Salary Packages Comparison (LPA)" />
                ) : (
                  <div className="p-8 text-center text-xs italic text-slate-500 bg-white/2 border border-white/5 rounded-xl">No salary details logged yet.</div>
                )}
              </div>
              <div className="space-y-4">
                <HorizontalBarList data={topLastOrgs} title="Top Hired-From Organizations" accentColor="bg-violet-500/70" />
              </div>
            </div>
          </div>
        )}

        {/* T5: Timelines & Exits */}
        {activeTab === 'timelines' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="card p-4 bg-white/2 border border-white/5 flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-accent/10 border border-accent/20 flex items-center justify-center flex-shrink-0">
                  <Clock size={18} className="text-accent" />
                </div>
                <div>
                  <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Avg Turnaround Time (TAT)</p>
                  <p className="text-2xl font-bold text-white mt-0.5">{avgTAT} Days</p>
                  <p className="text-[9px] text-slate-600">Average recruitment cycle days</p>
                </div>
              </div>
              <div className="card p-4 bg-white/2 border border-white/5 flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-slate-500/10 border border-slate-500/20 flex items-center justify-center flex-shrink-0">
                  <Users size={18} className="text-slate-400" />
                </div>
                <div>
                  <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Exit Replacements</p>
                  <p className="text-2xl font-bold text-white mt-0.5">{exitReplacements.length}</p>
                  <p className="text-[9px] text-slate-600">Exit vacancies being filled</p>
                </div>
              </div>
              <div className="card p-4 bg-white/2 border border-white/5 flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-accent/10 border border-accent/20 flex items-center justify-center flex-shrink-0">
                  <Activity size={18} className="text-accent" />
                </div>
                <div>
                  <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Feedback Annotations</p>
                  <p className="text-2xl font-bold text-white mt-0.5">{remarksList.length}</p>
                  <p className="text-[9px] text-slate-600">Requisitions with active remarks</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Joined Conversion Flow */}
              <div className="p-4 rounded-xl bg-white/2 border border-white/5 space-y-4">
                <h5 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Onboarding DOJ Log</h5>
                {joinTimelines.length > 0 ? (
                  <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
                    {joinTimelines.map((cand, idx) => {
                      // Check DOJ delays
                      const tent = cand.tentativeDOJ ? new Date(cand.tentativeDOJ) : null
                      const act = cand.actualDOJ ? new Date(cand.actualDOJ) : null
                      let delayText = 'Pending Joining'
                      let delayColor = 'text-amber-400 bg-amber-500/10 border-amber-500/20'

                      if (cand.status === 'Joined' && act) {
                        if (tent && act.getTime() <= tent.getTime()) {
                          delayText = 'Joined On-Time'
                          delayColor = 'text-accent bg-accent/10 border-accent/20'
                        } else if (tent) {
                          const diff = Math.round((act.getTime() - tent.getTime()) / (1000 * 3600 * 24))
                          delayText = `Joined Delayed by ${diff}d`
                          delayColor = 'text-red-400 bg-red-500/10 border-red-500/20'
                        } else {
                          delayText = 'Joined'
                          delayColor = 'text-accent bg-accent/10 border-accent/20'
                        }
                      } else if (cand.status === 'Declined') {
                        delayText = 'Declined Offer'
                        delayColor = 'text-red-400 bg-red-500/10 border-red-500/20'
                      }

                      return (
                        <div key={idx} className="p-3 rounded-lg bg-white/3 border border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                          <div>
                            <p className="font-semibold text-white">{cand.name}</p>
                            <div className="flex gap-2 text-[10px] text-slate-500 mt-1">
                              <span>Offer: {formatDate(cand.offerDate)}</span>
                              <span>·</span>
                              <span>Target DOJ: {formatDate(cand.tentativeDOJ)}</span>
                            </div>
                          </div>
                          <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${delayColor}`}>
                              {delayText}
                            </span>
                            {cand.actualDOJ && <span className="text-[10px] text-slate-400">Actual DOJ: {formatDate(cand.actualDOJ)}</span>}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-xs text-slate-500 italic py-8 text-center">No onboarding date records available.</p>
                )}
              </div>

              {/* Exited Replacements */}
              <div className="p-4 rounded-xl bg-white/2 border border-white/5 space-y-4">
                <h5 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Exits Replacements Pipelines</h5>
                {exitReplacements.length > 0 ? (
                  <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
                    {exitReplacements.map((item, idx) => (
                      <div key={idx} className="p-3 rounded-lg bg-white/3 border border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                        <div>
                          <p className="font-semibold text-white">Left: {item.name}</p>
                          <p className="text-[10px] text-slate-500 mt-0.5">Role: {item.designation}</p>
                        </div>
                        <div className="text-right sm:text-right">
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-white/5 border border-white/10 text-slate-400">
                            {item.reason}
                          </span>
                          <p className="text-[10px] text-slate-500 mt-1.5">Approved: {formatDate(item.start)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-slate-500 italic py-8 text-center">No exit replacement requests logged.</p>
                )}
              </div>
            </div>

            {/* Remarks Feed */}
            {remarksList.length > 0 && (
              <div className="p-4 rounded-xl bg-white/2 border border-white/5 space-y-3">
                <h5 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Recruitment Annotations & Remarks</h5>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-64 overflow-y-auto pr-1">
                  {remarksList.map((item, idx) => (
                    <div key={idx} className="p-3 rounded-lg bg-white/3 border border-white/5 space-y-2 text-xs">
                      <div className="flex justify-between border-b border-white/5 pb-1 text-[11px] font-bold text-slate-400">
                        <span>{item.designation}</span>
                        {item.candidate && item.candidate !== '—' && <span className="text-accent">{item.candidate}</span>}
                      </div>
                      <div className="space-y-1.5">
                        {item.remarks.map((r, rIdx) => (
                          <p key={rIdx} className="leading-relaxed">
                            <span className="font-bold text-slate-500 text-[10px] uppercase mr-1.5">[{r.type}]</span>
                            <span className="text-slate-300">{r.txt}</span>
                          </p>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  )
}
