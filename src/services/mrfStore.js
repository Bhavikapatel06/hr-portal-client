// ─────────────────────────────────────────────────────────────
//  services/mrfStore.js
//  Store and retrieve Manpower Request Form (MRF) submissions.
//  Seeds demo data on first load.
// ─────────────────────────────────────────────────────────────

const KEY = 'hr_mrfs_v2'

// ── Seed data (shown until user creates real MRFs) ────────────

const SEEDS = [
  {
    id: 'demo-1',
    designation: 'Senior React Developer',
    department: 'Engineering',
    function: 'Frontend',
    location: 'Ahmedabad',
    experience: '3–5 years',
    noOfPositions: '2',
    urgency: 'High',
    requestType: 'New Position',
    minimumQualification: 'B.E. / B.Tech',
    otherKeySkills: 'React, TypeScript, Node.js, REST APIs',
    preferredIndustries: 'SaaS, Fintech',
    purposeOfJob: 'Build and maintain scalable web applications for our SaaS platform.',
    rolesAndResponsibilities: 'Lead frontend architecture, mentor juniors, conduct code reviews.',
    proposedSalaryMin: '12', proposedSalaryMax: '18',
    status: 'Open',
    createdAt: new Date(Date.now() - 7 * 86400000).toISOString(),
  },
  {
    id: 'demo-2',
    designation: 'Product Manager',
    department: 'Product',
    function: 'Strategy',
    location: 'Mumbai',
    experience: '5–8 years',
    noOfPositions: '1',
    urgency: 'Medium',
    requestType: 'Replacement',
    minimumQualification: 'MBA / PGDM',
    otherKeySkills: 'Product Roadmap, Agile, Stakeholder Management, Analytics',
    preferredIndustries: 'B2B SaaS, E-commerce',
    purposeOfJob: 'Own product strategy and execution for enterprise product line.',
    rolesAndResponsibilities: 'Define roadmap, collaborate with engineering, represent customer needs.',
    proposedSalaryMin: '20', proposedSalaryMax: '30',
    status: 'Open',
    createdAt: new Date(Date.now() - 3 * 86400000).toISOString(),
  },
  {
    id: 'demo-3',
    designation: 'HR Business Partner',
    department: 'Human Resources',
    function: 'HR Operations',
    location: 'Ahmedabad',
    experience: '2–4 years',
    noOfPositions: '1',
    urgency: 'Low',
    requestType: 'New Position',
    minimumQualification: 'Post Graduate',
    otherKeySkills: 'Talent Acquisition, Employee Relations, HRIS, Payroll',
    preferredIndustries: 'Manufacturing, FMCG',
    purposeOfJob: 'Partner with business units to deliver strategic HR support.',
    rolesAndResponsibilities: 'Recruitment, performance management, policy implementation.',
    proposedSalaryMin: '6', proposedSalaryMax: '10',
    status: 'Open',
    createdAt: new Date(Date.now() - 1 * 86400000).toISOString(),
  },
  {
    id: 'demo-4',
    designation: 'Data Analyst',
    department: 'Analytics',
    function: 'Business Intelligence',
    location: 'Bangalore',
    experience: '1–3 years',
    noOfPositions: '3',
    urgency: 'High',
    requestType: 'Additional Headcount',
    minimumQualification: 'Graduate (Any)',
    otherKeySkills: 'SQL, Python, Tableau, Excel, Data Modeling',
    preferredIndustries: 'Technology, Consulting',
    purposeOfJob: 'Extract insights from data to drive product and business decisions.',
    rolesAndResponsibilities: 'Build dashboards, run ad-hoc analysis, present findings to stakeholders.',
    proposedSalaryMin: '5', proposedSalaryMax: '9',
    status: 'In Progress',
    createdAt: new Date(Date.now() - 14 * 86400000).toISOString(),
  },
  {
    id: 'demo-5',
    designation: 'Sales Executive',
    department: 'Sales',
    function: 'Business Development',
    location: 'Delhi',
    experience: '2–5 years',
    noOfPositions: '4',
    urgency: 'High',
    requestType: 'Additional Headcount',
    minimumQualification: 'Graduate (Any)',
    otherKeySkills: 'B2B Sales, CRM, Negotiation, Cold Calling, Lead Generation',
    preferredIndustries: 'IT, SaaS, Real Estate',
    purposeOfJob: 'Drive revenue growth through new client acquisition.',
    rolesAndResponsibilities: 'Prospecting, demos, closing deals, account management.',
    proposedSalaryMin: '4', proposedSalaryMax: '8',
    status: 'Open',
    createdAt: new Date(Date.now() - 10 * 86400000).toISOString(),
  },
]

// ── Helpers ───────────────────────────────────────────────────

export function seedIfEmpty() {
  if (!localStorage.getItem(KEY)) {
    localStorage.setItem(KEY, JSON.stringify(SEEDS))
  }
}

export function getMRFs() {
  try {
    const raw = localStorage.getItem(KEY)
    return raw ? JSON.parse(raw) : []
  } catch { return [] }
}

export function getMRFById(id) {
  return getMRFs().find(m => m.id === id) || null
}

export function saveMRF(data) {
  const mrfs = getMRFs()
  const id = data.id || `mrf-${Date.now()}`
  const existing = mrfs.findIndex(m => m.id === id)
  const record = {
    ...data,
    id,
    status: data.status || 'Open',
    createdAt: data.createdAt || new Date().toISOString(),
  }
  if (existing >= 0) mrfs[existing] = record
  else mrfs.unshift(record) // newest first
  try { localStorage.setItem(KEY, JSON.stringify(mrfs)) } catch (e) { console.error(e) }
  return record
}

export function updateMRFStatus(id, status) {
  const mrfs = getMRFs()
  const idx = mrfs.findIndex(m => m.id === id)
  if (idx >= 0) {
    mrfs[idx] = { ...mrfs[idx], status }
    localStorage.setItem(KEY, JSON.stringify(mrfs))
  }
}

export function relativeDate(isoString) {
  if (!isoString) return '—'
  const diff = Date.now() - new Date(isoString).getTime()
  const days = Math.floor(diff / 86400000)
  if (days === 0) return 'Today'
  if (days === 1) return 'Yesterday'
  if (days < 7) return `${days}d ago`
  return new Date(isoString).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })
}

export function extractRequirements(mrf) {
  return {
    designation:          mrf.designation          || '',
    department:           mrf.department           || '',
    location:             mrf.location             || '',
    experience:           mrf.experience           || '',
    minimumQualification: mrf.minimumQualification || '',
    otherKeySkills:       mrf.otherKeySkills       || '',
    noOfPositions:        mrf.noOfPositions        || '',
    urgency:              mrf.urgency              || 'Medium',
    purposeOfJob:         mrf.purposeOfJob         || '',
    preferredIndustries:  mrf.preferredIndustries  || '',
  }
}
