import React, { useState, useEffect } from 'react'
import {
  ClipboardList, Clock, CheckCircle2, XCircle, Eye, FileText,
  Loader2, AlertCircle, Search, Filter, MessageSquare, Calendar,
  MapPin, Building2, Users, User, Hash, Trash2
} from 'lucide-react'
import { mrfApi } from '../services/api.js'

// ── Status configuration ───────────────────────────────────────────────────
const STATUS_CFG = {
  'Pending Owner Approval': { label: 'Pending Review', color: 'text-amber-400',   bg: 'bg-amber-400/10 border-amber-400/30',   dot: 'bg-amber-400' },
  'Approved':               { label: 'Approved',       color: 'text-emerald-400', bg: 'bg-emerald-400/10 border-emerald-400/30', dot: 'bg-emerald-400' },
  'Rejected':               { label: 'Rejected',       color: 'text-red-400',     bg: 'bg-red-400/10 border-red-400/30',         dot: 'bg-red-400' },
}

const URGENCY_COLOR = {
  High:   'text-red-400 bg-red-400/10 border-red-400/30',
  Medium: 'text-amber-400 bg-amber-400/10 border-amber-400/30',
  Low:    'text-slate-400 bg-slate-400/10 border-slate-400/25',
}

// ── MRF Paper Template Modal ───────────────────────────────────────────────
function MRFTemplateModal({ mrf, onClose, onApprove, onReject, actioning }) {
  const [rejectNote, setRejectNote] = useState('')
  const [showRejectInput, setShowRejectInput] = useState(false)
  const isPending = mrf.mrfStatus === 'Pending Owner Approval'

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/75 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white rounded-xl shadow-2xl max-w-3xl w-full my-4 overflow-hidden">

        {/* Modal header bar */}
        <div className="flex items-center justify-between px-6 py-3 bg-gray-800 text-white">
          <div className="flex items-center gap-3">
            <FileText size={16} />
            <span className="font-bold text-sm tracking-wide">MANPOWER REQUEST FORM</span>
            {STATUS_CFG[mrf.mrfStatus] && (
              <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${STATUS_CFG[mrf.mrfStatus].bg} ${STATUS_CFG[mrf.mrfStatus].color}`}>
                {STATUS_CFG[mrf.mrfStatus].label}
              </span>
            )}
          </div>
          <button onClick={onClose} className="text-gray-300 hover:text-white text-lg leading-none font-bold">✕</button>
        </div>

        {/* Scrollable form body */}
        <div className="overflow-y-auto max-h-[70vh] p-6 bg-white">

          {/* Form title */}
          <div className="border-2 border-gray-800 text-center py-2 text-sm font-bold text-gray-800 tracking-widest mb-0">
            MANPOWER REQUEST FORM
          </div>

          {/* Table-style paper form */}
          <div className="border-l-2 border-r-2 border-b-2 border-gray-800">

            {/* Section 1 */}
            <div className="bg-gray-200 border-b border-gray-400 text-center py-1 text-[11px] font-bold uppercase tracking-wider text-gray-700">
              1. Position Details
            </div>
            <div className="grid grid-cols-3 border-b border-gray-300">
              <Cell label="Designation" value={mrf.designation} bold />
              <Cell label="Department &amp; Sub Function" value={`${mrf.department || '—'}${mrf.section ? ` / ${mrf.section}` : ''}`} />
              <Cell label="Reports To" value={mrf.processOwnerName} />
            </div>
            <div className="grid grid-cols-3 border-b border-gray-300">
              <Cell label="Location" value={mrf.location} />
              <Cell label="Experience" value={mrf.experience} />
              <Cell label="Proposed Salary (CTC Range)" value={mrf.proposedSalary} />
            </div>
            <div className="border-b border-gray-300 px-3 py-2 flex items-center gap-8">
              <span className="text-[11px] font-bold text-gray-600">Level of Urgency:</span>
              {['High', 'Medium', 'Low'].map(u => (
                <label key={u} className="flex items-center gap-1.5 text-sm text-gray-800 cursor-default">
                  <span className={`w-4 h-4 border-2 border-gray-600 rounded-sm flex items-center justify-center text-[10px] font-bold
                    ${mrf.levelOfUrgency === u ? 'bg-gray-800 text-white border-gray-800' : 'bg-white'}`}>
                    {mrf.levelOfUrgency === u ? '✓' : ''}
                  </span>
                  {u}
                </label>
              ))}
            </div>

            {/* Section 2 */}
            <div className="bg-gray-200 border-b border-gray-400 text-center py-1 text-[11px] font-bold uppercase tracking-wider text-gray-700">
              2. Reasons for Request
            </div>
            <div className="grid grid-cols-3 border-b border-gray-300">
              <Cell label="New / Replacement" value={mrf.reasonForRequest} />
              <Cell label="No. of Positions" value={mrf.noOfPositions} />
              <Cell label="Replacement For" value={mrf.replacementFor} />
            </div>
            <div className="border-b border-gray-300">
              <Cell label="Justification for this Opening" value={mrf.justification} tall />
            </div>

            {/* Section 3 */}
            <div className="bg-gray-200 border-b border-gray-400 text-center py-1 text-[11px] font-bold uppercase tracking-wider text-gray-700">
              3. Job Description
            </div>
            <div className="border-b border-gray-300">
              <Cell label="Purpose of the Job" value={mrf.purposeOfJob} />
            </div>
            <div className="border-b border-gray-300">
              <Cell label="Roles and Responsibilities (With Proper Job Description)" value={mrf.rolesResponsibilities} tall />
            </div>

            {/* Section 4 */}
            <div className="bg-gray-200 border-b border-gray-400 text-center py-1 text-[11px] font-bold uppercase tracking-wider text-gray-700">
              4. Qualification &amp; Other Criteria
            </div>
            <div className="grid grid-cols-3 border-b border-gray-300">
              <Cell label="Minimum Qualification" value={mrf.minimumQualification} />
              <Cell label="Specializations" value={mrf.specializations} />
              <Cell label="Age in Range" value={mrf.ageRange} />
            </div>
            <div className="border-b border-gray-300">
              <Cell label="Preferred Industries / Sectors" value={mrf.preferredIndustries} />
            </div>
            <div className="border-b border-gray-300">
              <Cell label="Other Key Skills &amp; explain the kind of relevant experience" value={mrf.otherKeySkills} tall />
            </div>
            <div>
              <Cell label="IT Requirements (Laptop / Desktop / Special software etc)" value={mrf.itRequirements} />
            </div>

            {/* Optional section 5 */}
            {(mrf.employeeName || mrf.companyName || mrf.vacancyRemarks) && (
              <>
                <div className="bg-gray-200 border-t border-b border-gray-400 text-center py-1 text-[11px] font-bold uppercase tracking-wider text-gray-700">
                  5. Additional Information
                </div>
                <div className="grid grid-cols-3 border-b border-gray-300">
                  <Cell label="Employee Name (Retirement/Resignation)" value={mrf.employeeName} />
                  <Cell label="Employee Designation" value={mrf.employeeDesignation} />
                  <Cell label="Company Name" value={mrf.companyName} />
                </div>
                {mrf.vacancyRemarks && (
                  <div>
                    <Cell label="Vacancy Remarks" value={mrf.vacancyRemarks} />
                  </div>
                )}
              </>
            )}
          </div>

          {/* Submitted by / date info */}
          <div className="flex items-center justify-between mt-3 px-1 text-xs text-gray-500">
            <span>Requested By: <strong className="text-gray-700">{mrf.submittedBy || 'Unknown'}</strong></span>
            <span>MRF ID: <strong className="text-gray-700 font-mono">{mrf._id?.slice(-8).toUpperCase()}</strong></span>
            <span>Date: <strong className="text-gray-700">{new Date(mrf.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</strong></span>
          </div>

          {/* Rejection note (if rejected) */}
          {mrf.mrfStatus === 'Rejected' && mrf.rejectionNote && (
            <div className="mt-4 p-3 rounded-lg bg-red-50 border border-red-200">
              <p className="text-xs font-bold text-red-600 uppercase mb-1">Admin Rejection Comment</p>
              <p className="text-sm text-red-800">{mrf.rejectionNote}</p>
            </div>
          )}
        </div>

        {/* Actions Footer */}
        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
          {isPending ? (
            showRejectInput ? (
              <div className="space-y-3">
                <p className="text-xs font-semibold text-gray-600">Enter rejection comment for Department Head:</p>
                <textarea
                  value={rejectNote}
                  onChange={(e) => setRejectNote(e.target.value)}
                  rows={3}
                  placeholder="Explain why the MRF is being rejected, what needs to be corrected..."
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-red-400 resize-none"
                />
                <div className="flex gap-2 justify-end">
                  <button
                    onClick={() => setShowRejectInput(false)}
                    className="px-4 py-2 rounded-lg bg-gray-100 border border-gray-300 text-gray-600 text-xs font-semibold hover:bg-gray-200 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => onReject(mrf._id, rejectNote)}
                    disabled={actioning}
                    className="px-5 py-2 rounded-lg bg-red-500 hover:bg-red-600 text-white text-xs font-bold flex items-center gap-1.5 transition-colors"
                  >
                    {actioning ? <Loader2 size={12} className="animate-spin" /> : <XCircle size={13} />}
                    Confirm Rejection
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex gap-3">
                <button
                  onClick={() => onApprove(mrf._id)}
                  disabled={actioning}
                  className="flex-1 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-sm flex items-center justify-center gap-2 transition-colors shadow-sm"
                >
                  {actioning ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle2 size={16} />}
                  Approve MRF
                </button>
                <button
                  onClick={() => setShowRejectInput(true)}
                  className="flex-1 py-3 rounded-xl bg-red-500 hover:bg-red-600 text-white font-bold text-sm flex items-center justify-center gap-2 transition-colors shadow-sm"
                >
                  <XCircle size={16} /> Reject with Comments
                </button>
              </div>
            )
          ) : (
            <div className="flex justify-end">
              <button
                onClick={onClose}
                className="px-8 py-2.5 rounded-xl bg-gray-700 hover:bg-gray-800 text-white font-semibold text-sm transition-colors"
              >
                Close
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// ── Helper sub-components ─────────────────────────────────────────────────
function Cell({ label, value, bold, tall }) {
  return (
    <div className="border border-gray-300">
      <div className="bg-gray-100 px-2 py-0.5 text-[10px] font-bold text-gray-600 border-b border-gray-300 uppercase tracking-wider">{label}</div>
      <div className={`px-2 py-2 text-sm text-gray-900 ${bold ? 'font-semibold' : ''} ${tall ? 'min-h-[56px]' : 'min-h-[32px]'} whitespace-pre-wrap`}>
        {value || '—'}
      </div>
    </div>
  )
}

// ── Stat Card ─────────────────────────────────────────────────────────────
function StatCard({ label, value, icon: Icon, color, bg, sub }) {
  return (
    <div className={`card p-5 border flex flex-col justify-between hover:-translate-y-0.5 transition-all duration-200 ${bg}`}>
      <div className="flex justify-between items-start">
        <span className="text-xs font-bold text-slate-500 uppercase tracking-wider leading-snug">{label}</span>
        <Icon size={16} className={color} />
      </div>
      <div className="mt-4">
        <p className={`font-display font-bold text-3xl ${color}`}>{value}</p>
        {sub && <p className="text-[10px] text-slate-500 font-semibold mt-1">{sub}</p>}
      </div>
    </div>
  )
}

// ── Main AdminMRFApprovalsPage ─────────────────────────────────────────────
export default function AdminMRFApprovalsPage() {
  const [mrfs, setMrfs] = useState([])
  const [loading, setLoading] = useState(true)
  const [viewingMrf, setViewingMrf] = useState(null)
  const [actioning, setActioning] = useState(false)
  const [filter, setFilter] = useState('All')
  const [search, setSearch] = useState('')
  const [toast, setToast] = useState(null)

  useEffect(() => { loadMRFs() }, [])

  const loadMRFs = async () => {
    setLoading(true)
    try {
      const all = await mrfApi.list()
      // Admin sees all non-draft MRFs
      setMrfs(all.filter(m => m.mrfStatus !== 'Draft'))
    } catch (e) {
      showToast('Failed to load MRFs: ' + e.message, 'error')
    } finally {
      setLoading(false)
    }
  }

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 4500)
  }

  const handleApprove = async (id) => {
    setActioning(true)
    try {
      await mrfApi.approve(id)
      showToast('MRF approved successfully! HR team can now create a job posting. ✓')
      setViewingMrf(null)
      loadMRFs()
    } catch (e) { showToast(e.message, 'error') }
    finally { setActioning(false) }
  }

  const handleReject = async (id, note) => {
    setActioning(true)
    try {
      await mrfApi.reject(id, note)
      showToast('MRF rejected. Department Head will be notified with your comments.')
      setViewingMrf(null)
      loadMRFs()
    } catch (e) { showToast(e.message, 'error') }
    finally { setActioning(false) }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this MRF completely? This action cannot be undone.')) return
    setActioning(true)
    try {
      await mrfApi.delete(id)
      showToast('MRF deleted.')
      loadMRFs()
    } catch (e) { showToast(e.message, 'error') }
    finally { setActioning(false) }
  }

  // ── Stats ──────────────────────────────────────────────────────────────
  const pending   = mrfs.filter(m => m.mrfStatus === 'Pending Owner Approval').length
  const approved  = mrfs.filter(m => m.mrfStatus === 'Approved').length
  const rejected  = mrfs.filter(m => m.mrfStatus === 'Rejected').length
  const openVacs  = mrfs.filter(m => m.mrfStatus === 'Approved' && (m.positionStatus === 'Open' || m.positionStatus === 'In Progress'))
                       .reduce((s, m) => s + (parseInt(m.noOfPositions) || 0), 0)
  const filled    = mrfs.filter(m => m.offerStatus === 'Joined' || m.offerStatus === 'Accepted').length
  const exits     = mrfs.filter(m => m.reasonForRequest === 'Retirement' || m.reasonForRequest === 'Resignation' || (m.employeeName && m.employeeName !== 'None')).length

  // ── Filters + Search ───────────────────────────────────────────────────
  const FILTER_TABS = [
    { key: 'All',                    label: 'All',              count: mrfs.length },
    { key: 'Pending Owner Approval', label: 'Pending Review',   count: pending },
    { key: 'Approved',               label: 'Approved',         count: approved },
    { key: 'Rejected',               label: 'Rejected',         count: rejected },
  ]

  const filtered = mrfs
    .filter(m => filter === 'All' || m.mrfStatus === filter)
    .filter(m => {
      if (!search.trim()) return true
      const q = search.toLowerCase()
      return (
        (m.designation || '').toLowerCase().includes(q) ||
        (m.department || '').toLowerCase().includes(q) ||
        (m.location || '').toLowerCase().includes(q) ||
        (m.submittedBy || '').toLowerCase().includes(q)
      )
    })

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-8">

      {/* Toast */}
      {toast && (
        <div className={`fixed top-20 right-5 z-50 px-4 py-3 rounded-xl shadow-xl text-sm font-medium border fade-up max-w-sm
          ${toast.type === 'error' ? 'bg-red-500/15 border-red-500/30 text-red-300' : 'bg-emerald-500/15 border-emerald-500/30 text-emerald-300'}`}>
          {toast.msg}
        </div>
      )}

      {/* MRF Template Modal */}
      {viewingMrf && (
        <MRFTemplateModal
          mrf={viewingMrf}
          onClose={() => setViewingMrf(null)}
          onApprove={handleApprove}
          onReject={handleReject}
          actioning={actioning}
        />
      )}

      {/* Page Header */}
      <div className="fade-up">
        <span className="section-tag mb-2.5">
          <ClipboardList size={11} /> HR Admin — MRF Review
        </span>
        <h1 className="font-display font-bold text-2xl sm:text-3xl text-white mt-1">
          MRF Approvals
        </h1>
        <p className="text-slate-400 text-sm mt-1">
          Review manpower requests submitted by Department Heads. Click <strong className="text-white">View MRF</strong> to open the full form and Approve or Reject.
        </p>
      </div>

      {/* KPI Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 fade-up-1">
        <StatCard label="Pending Review"  value={pending}  icon={Clock}         color="text-amber-400"   bg="bg-amber-500/10 border-amber-500/20"   sub="Awaiting decision" />
        <StatCard label="Approved MRFs"   value={approved} icon={CheckCircle2}  color="text-emerald-400" bg="bg-emerald-500/10 border-emerald-500/20" sub="Cleared for HR" />
        <StatCard label="Rejected MRFs"   value={rejected} icon={XCircle}       color="text-red-400"     bg="bg-red-500/10 border-red-500/20"         sub="Returned to HOD" />
        <StatCard label="Active Vacancies" value={openVacs} icon={Users}        color="text-cyan-400"    bg="bg-cyan-500/10 border-cyan-500/20"        sub="Open headcount" />
        <StatCard label="Filled Positions" value={filled}  icon={CheckCircle2}  color="text-indigo-400"  bg="bg-indigo-500/10 border-indigo-500/20"    sub="Joined/Accepted" />
        <StatCard label="Upcoming Exits"   value={exits}   icon={AlertCircle}   color="text-pink-400"    bg="bg-pink-500/10 border-pink-500/20"         sub="Retirement/Resign" />
      </div>

      {/* Filter tabs + Search bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 fade-up-2">
        <div className="flex items-center gap-2 flex-wrap">
          {FILTER_TABS.map(({ key, label, count }) => (
            <button
              key={key}
              onClick={() => setFilter(key)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all duration-150
                ${filter === key
                  ? 'bg-accent text-white border-accent shadow-glow-sm'
                  : 'bg-white/5 border-white/10 text-slate-400 hover:text-white hover:bg-white/10'}`}
            >
              {label}
              <span className="ml-1.5 opacity-60">({count})</span>
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative ml-auto flex-shrink-0">
          <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search designation, dept, location..."
            className="pl-8 pr-4 py-2 bg-white/5 border border-white/10 rounded-lg text-xs text-slate-300 placeholder-slate-600 focus:outline-none focus:border-accent/40 w-64"
          />
        </div>
        <span className="text-xs text-slate-600 flex-shrink-0">{filtered.length} MRF(s)</span>
      </div>

      {/* MRF List */}
      {loading ? (
        <div className="card p-24 flex items-center justify-center">
          <Loader2 size={24} className="animate-spin text-accent" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="card p-16 flex flex-col items-center gap-4 text-center border border-white/5 bg-ink-950/40">
          <AlertCircle size={28} className="text-slate-500" />
          <p className="text-slate-400 text-sm">No MRFs found matching your filter or search.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((mrf) => {
            const statusCfg = STATUS_CFG[mrf.mrfStatus] || STATUS_CFG['Pending Owner Approval']
            const urgencyCls = URGENCY_COLOR[mrf.levelOfUrgency] || URGENCY_COLOR.Medium
            const isPending = mrf.mrfStatus === 'Pending Owner Approval'

            return (
              <div
                key={mrf._id}
                className={`card p-5 border transition-all duration-200 hover:-translate-y-0.5 ${
                  isPending ? 'border-amber-500/15 bg-amber-500/3' : 'border-white/5 bg-ink-950/40'
                }`}
              >
                {/* Row layout for easy scanning */}
                <div className="flex flex-wrap items-start gap-4">

                  {/* MRF ID + Type badge */}
                  <div className="flex-shrink-0 w-20">
                    <div className="text-[10px] text-slate-600 uppercase font-bold">MRF ID</div>
                    <div className="text-xs font-mono font-bold text-slate-300 mt-0.5">
                      #{mrf._id?.slice(-6).toUpperCase()}
                    </div>
                    <span className={`mt-1 inline-block px-1.5 py-0.5 rounded text-[9px] font-bold border ${
                      mrf.requestType === 'JD'
                        ? 'bg-blue-500/15 text-blue-400 border-blue-500/30'
                        : 'bg-purple-500/15 text-purple-400 border-purple-500/30'
                    }`}>
                      {mrf.requestType || 'MRF'}
                    </span>
                  </div>

                  {/* Designation + Dept */}
                  <div className="flex-1 min-w-[160px]">
                    <div className="text-[10px] text-slate-600 uppercase font-bold">Designation</div>
                    <div className="font-semibold text-white text-sm mt-0.5">{mrf.designation}</div>
                    <div className="text-xs text-slate-500 mt-0.5 flex items-center gap-1">
                      <Building2 size={10} /> {mrf.department}{mrf.section ? ` / ${mrf.section}` : ''}
                    </div>
                  </div>

                  {/* Vacancy type + count */}
                  <div className="flex-shrink-0 w-32">
                    <div className="text-[10px] text-slate-600 uppercase font-bold">Vacancy Type</div>
                    <div className="text-xs text-white font-semibold mt-0.5">{mrf.reasonForRequest || '—'}</div>
                    <div className="text-[10px] text-slate-500 mt-0.5 flex items-center gap-1">
                      <Users size={9} /> {mrf.noOfPositions || 1} position(s)
                    </div>
                  </div>

                  {/* Location */}
                  <div className="flex-shrink-0 w-28">
                    <div className="text-[10px] text-slate-600 uppercase font-bold">Location</div>
                    <div className="text-xs text-white mt-0.5 flex items-center gap-1">
                      <MapPin size={10} className="text-slate-500 flex-shrink-0" />
                      {mrf.location || '—'}
                    </div>
                  </div>

                  {/* Requested by + date */}
                  <div className="flex-shrink-0 w-36">
                    <div className="text-[10px] text-slate-600 uppercase font-bold">Requested By</div>
                    <div className="text-xs text-white mt-0.5 flex items-center gap-1">
                      <User size={10} className="text-slate-500 flex-shrink-0" />
                      {mrf.submittedBy || '—'}
                    </div>
                    <div className="text-[10px] text-slate-500 mt-0.5 flex items-center gap-1">
                      <Calendar size={9} />
                      {new Date(mrf.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </div>
                  </div>

                  {/* Urgency + Status */}
                  <div className="flex-shrink-0 flex flex-col gap-1.5 items-end ml-auto">
                    <span className={`px-2 py-0.5 rounded border text-[10px] font-bold flex items-center gap-1 ${urgencyCls}`}>
                      {mrf.levelOfUrgency || 'Medium'} Urgency
                    </span>
                    <span className={`px-2 py-0.5 rounded border text-[10px] font-bold flex items-center gap-1.5 ${statusCfg.bg} ${statusCfg.color}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${statusCfg.dot}`} />
                      {statusCfg.label}
                    </span>
                  </div>
                </div>

                {/* Remarks + Rejection note */}
                {(mrf.vacancyRemarks || mrf.rejectionNote) && (
                  <div className="mt-3 pt-3 border-t border-white/5 flex items-start gap-2 text-xs">
                    <MessageSquare size={12} className="text-slate-500 flex-shrink-0 mt-0.5" />
                    {mrf.rejectionNote ? (
                      <span className="text-red-300"><strong>Rejection Comment:</strong> {mrf.rejectionNote}</span>
                    ) : (
                      <span className="text-slate-400"><strong>Remarks:</strong> {mrf.vacancyRemarks}</span>
                    )}
                  </div>
                )}

                {/* Action bar */}
                <div className="mt-4 pt-3 border-t border-white/6 flex items-center gap-2">
                  {/* View MRF — always visible */}
                  <button
                    onClick={() => setViewingMrf(mrf)}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-accent/10 border border-accent/25 text-accent text-xs font-semibold hover:bg-accent hover:text-white transition-all"
                  >
                    <Eye size={13} /> View MRF
                  </button>

                  {/* Quick approve/reject buttons — only for pending */}
                  {isPending && (
                    <>
                      <button
                        onClick={() => handleApprove(mrf._id)}
                        disabled={actioning}
                        className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 text-xs font-semibold hover:bg-emerald-500 hover:text-white transition-all disabled:opacity-50"
                      >
                        {actioning ? <Loader2 size={11} className="animate-spin" /> : <CheckCircle2 size={12} />}
                        Approve
                      </button>
                      <button
                        onClick={() => { setViewingMrf(mrf) }}
                        className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-red-500/10 border border-red-500/25 text-red-400 text-xs font-semibold hover:bg-red-500 hover:text-white transition-all"
                      >
                        <XCircle size={12} /> Reject
                      </button>
                    </>
                  )}

                  <button
                    onClick={() => handleDelete(mrf._id)}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-red-500/10 border border-red-500/25 text-red-400 text-xs font-semibold hover:bg-red-500 hover:text-white transition-all ml-1"
                  >
                    <Trash2 size={13} /> Delete
                  </button>

                  <span className="ml-auto text-[10px] text-slate-600">
                    {mrf.mrfStatus === 'Approved' && '✓ Visible to HR Team'}
                    {mrf.mrfStatus === 'Rejected' && '↩ Returned to Dept. Head'}
                  </span>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
