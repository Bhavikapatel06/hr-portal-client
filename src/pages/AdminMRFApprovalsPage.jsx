import React, { useState, useEffect } from 'react'
import {
  ClipboardList, Clock, CheckCircle2, XCircle, Eye, FileText,
  Loader2, AlertCircle, Search, Filter, MessageSquare, Calendar,
  MapPin, Building2, Users, User, Hash, Trash2
} from 'lucide-react'
import { mrfApi } from '../services/api.js'

// ── Status configuration ───────────────────────────────────────────────────
const STATUS_CFG = {
  'Pending Owner Approval': { label: 'Pending Review', color: 'text-slate-300',   bg: 'bg-white/5 border-white/10',            dot: 'bg-slate-400' },
  'Approved':               { label: 'Approved',       color: 'text-accent',      bg: 'bg-accent/10 border-accent/20',         dot: 'bg-accent' },
  'Rejected':               { label: 'Rejected',       color: 'text-slate-500',   bg: 'bg-white/5 border-white/8',             dot: 'bg-slate-600' },
}

const URGENCY_COLOR = {
  High:   'text-slate-200 bg-white/10 border border-white/20',
  Medium: 'text-slate-300 bg-white/5 border border-white/10',
  Low:    'text-slate-400 bg-white/5 border border-white/8',
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
            <span className="font-bold text-sm tracking-wide">JOB REQUISITION FORM</span>
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
            JOB REQUISITION FORM
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
                  Approve Requisition
                </button>
                <button
                  onClick={() => setShowRejectInput(true)}
                  className="flex-1 py-3 rounded-xl bg-red-500 hover:bg-red-600 text-white font-bold text-sm flex items-center justify-center gap-2 transition-colors shadow-sm"
                >
                  <XCircle size={16} /> Reject Requisition
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
function StatCard({ label, value, icon: Icon, color, activeStyle, inactiveStyle, sub, isActive, onClick }) {
  return (
    <div 
      onClick={onClick}
      className={`kpi-card card p-5 border flex flex-col justify-between cursor-pointer transition-all duration-200 ${
        isActive ? activeStyle : inactiveStyle
      }`}
    >
      <div className="flex justify-between items-start">
        <span className={`text-xs font-bold uppercase tracking-wider leading-snug ${isActive ? color : 'text-slate-500'}`}>{label}</span>
        <Icon size={16} className={isActive ? color : 'text-slate-500'} />
      </div>
      <div className="mt-4">
        <p className={`font-display font-bold text-3xl ${isActive ? color : 'text-white'}`}>{value}</p>
        {sub && <p className={`text-[10px] font-semibold mt-1 ${isActive ? 'text-slate-300' : 'text-slate-500'}`}>{sub}</p>}
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

  useEffect(() => {
    if (viewingMrf) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [viewingMrf])

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

  const FILTER_TABS = [
    { key: 'All',                    label: 'All',              count: mrfs.length, icon: ClipboardList, color: 'text-accent' },
    { key: 'Pending Owner Approval', label: 'Pending Review',   count: pending,     icon: Clock,         color: 'text-amber-400' },
    { key: 'Approved',               label: 'Approved',         count: approved,    icon: CheckCircle2,  color: 'text-emerald-400' },
    { key: 'Rejected',               label: 'Rejected',         count: rejected,    icon: XCircle,       color: 'text-red-400' },
  ]

  // ── Filters + Search ───────────────────────────────────────────────────
  const filtered = mrfs
    .filter(m => {
      if (filter === 'All') return true
      if (filter === 'Pending Owner Approval' || filter === 'Approved' || filter === 'Rejected') {
        return m.mrfStatus === filter
      }
      return true
    })
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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-6">

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

      {/* Page Header removed */}

      {/* Tabs Filter + Search bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 fade-up-1 pt-2">
        <div className="flex items-center gap-2 flex-wrap">
          {FILTER_TABS.map(({ key, label, count, icon: Icon, color }) => {
            const isActive = filter === key
            return (
              <button
                key={key}
                onClick={() => setFilter(key)}
                className={`px-4 py-2 rounded-xl text-xs font-semibold border transition-all duration-200 active:scale-95 flex items-center gap-2
                  ${isActive
                    ? 'bg-accent text-white border-accent shadow-glow-sm shadow-[0_0_15px_rgba(79,142,247,0.3)]'
                    : 'bg-white/5 border-white/10 text-slate-400 hover:text-white hover:bg-white/10'}`}
              >
                <Icon size={12} className={isActive ? 'text-white' : color} />
                {label}
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                  isActive ? 'bg-white/20 text-white' : 'bg-white/5 text-slate-500'
                }`}>
                  {count}
                </span>
              </button>
            )
          })}
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          {filter !== 'All' && (
            <button
              onClick={() => setFilter('All')}
              className="flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl bg-accent/10 border border-accent/25 text-accent text-xs font-semibold hover:bg-accent hover:text-white transition-all shadow-glow-sm"
            >
              <Filter size={11} /> Clear Filter <XCircle size={11} />
            </button>
          )}

          {/* Search */}
          <div className="relative flex-shrink-0">
            <Search size={13} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search designation, dept, location..."
              className="pl-9 pr-4 py-2 bg-white/5 border border-white/10 rounded-xl text-xs text-slate-300 placeholder-slate-600 focus:outline-none focus:border-accent/40 w-full sm:w-64"
            />
          </div>
          <span className="text-xs text-slate-600 flex-shrink-0 text-right sm:text-left">{filtered.length} Requisition(s)</span>
        </div>
      </div>


      {/* MRF List */}
      {loading ? (
        <div className="card p-24 flex items-center justify-center">
          <Loader2 size={24} className="animate-spin text-accent" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="card p-16 flex flex-col items-center gap-4 text-center border border-white/5 bg-ink-950/40">
          <AlertCircle size={28} className="text-slate-500" />
          <p className="text-slate-400 text-sm">No requisitions found matching your filter or search.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 auto-rows-fr gap-4">
          {filtered.map((mrf) => {
            const statusCfg = STATUS_CFG[mrf.mrfStatus] || STATUS_CFG['Pending Owner Approval']
            const urgencyCls = URGENCY_COLOR[mrf.levelOfUrgency] || URGENCY_COLOR.Medium
            const isPending = mrf.mrfStatus === 'Pending Owner Approval'

            return (
              <div
                key={mrf._id}
                className={`card p-5 border transition-all duration-200 hover:-translate-y-0.5 flex flex-col justify-between h-full gap-4 ${
                  isPending ? 'border-amber-500/15 bg-amber-500/3' : 'border-white/5 bg-ink-950/40'
                }`}
              >
                {/* Card Header: title + status/urgency badges */}
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold border uppercase tracking-wider ${
                        mrf.requestType === 'JD'
                          ? 'bg-blue-500/15 text-blue-400 border-blue-500/30'
                          : 'bg-purple-500/15 text-purple-400 border-purple-500/30'
                      }`}>
                        {mrf.requestType || 'MRF'}
                      </span>
                      <h3 className="font-semibold text-white text-[15px] truncate" title={mrf.designation}>
                        {mrf.designation}
                      </h3>
                    </div>
                    <div className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                      <Building2 size={10} className="flex-shrink-0" />
                      <span className="truncate">{mrf.department}{mrf.section ? ` / ${mrf.section}` : ''}</span>
                    </div>
                  </div>
                  
                  <div className="flex flex-col gap-1 items-end flex-shrink-0">
                    <span className={`px-2 py-0.5 rounded border text-[10px] font-bold flex items-center gap-1.5 ${statusCfg.bg} ${statusCfg.color}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${statusCfg.dot}`} />
                      {statusCfg.label}
                    </span>
                    <span className={`px-1.5 py-0.5 rounded border text-[9px] font-bold ${urgencyCls}`}>
                      {mrf.levelOfUrgency || 'Medium'}
                    </span>
                  </div>
                </div>

                {/* Card Meta Grid */}
                <div className="grid grid-cols-2 gap-x-3 gap-y-2 text-xs text-slate-400 py-3 border-y border-white/5">
                  <div>
                    <span className="text-slate-500 block text-[10px] uppercase font-semibold">Location</span>
                    <span className="text-white font-semibold flex items-center gap-1 truncate" title={mrf.location}>
                      <MapPin size={10} className="text-slate-500 flex-shrink-0" />
                      {mrf.location || '—'}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px] uppercase font-semibold">Vacancy Type</span>
                    <span className="text-white font-semibold truncate" title={mrf.reasonForRequest}>
                      {mrf.reasonForRequest || '—'} ({mrf.noOfPositions || 1} pos)
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px] uppercase font-semibold">Requested By</span>
                    <span className="text-white font-semibold flex items-center gap-1 truncate" title={mrf.submittedBy}>
                      <User size={10} className="text-slate-500 flex-shrink-0" />
                      {mrf.submittedBy || '—'}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px] uppercase font-semibold">Reports To</span>
                    <span className="text-white font-semibold truncate" title={mrf.processOwnerName || '—'}>
                      {mrf.processOwnerName || '—'}
                    </span>
                  </div>
                </div>

                {/* Remarks + Rejection note */}
                {(mrf.vacancyRemarks || mrf.rejectionNote) && (
                  <div className="p-2.5 rounded-lg bg-white/3 border border-white/5 text-xs">
                    {mrf.rejectionNote ? (
                      <span className="text-red-300">
                        <strong>Rejection Note:</strong> {mrf.rejectionNote}
                      </span>
                    ) : (
                      <span className="text-slate-400">
                        <strong>Remarks:</strong> {mrf.vacancyRemarks}
                      </span>
                    )}
                  </div>
                )}

                {/* Action bar */}
                <div>
                  <div className="flex items-center gap-2 flex-wrap pt-2">
                    {/* View Requisition — always visible */}
                    <button
                      onClick={() => setViewingMrf(mrf)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-accent/10 border border-accent/25 text-accent text-xs font-semibold hover:bg-accent hover:text-white transition-all"
                    >
                      <Eye size={12} /> View
                    </button>

                    {/* Quick approve/reject buttons — only for pending */}
                    {isPending && (
                      <>
                        <button
                          onClick={() => handleApprove(mrf._id)}
                          disabled={actioning}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 text-xs font-semibold hover:bg-emerald-500 hover:text-white transition-all disabled:opacity-50"
                        >
                          {actioning ? <Loader2 size={11} className="animate-spin" /> : <CheckCircle2 size={12} />}
                          Approve
                        </button>
                        <button
                          onClick={() => { setViewingMrf(mrf) }}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-500/10 border border-red-500/25 text-red-400 text-xs font-semibold hover:bg-red-500 hover:text-white transition-all"
                        >
                          <XCircle size={12} /> Reject
                        </button>
                      </>
                    )}

                    <button
                      onClick={() => handleDelete(mrf._id)}
                      className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-red-500/10 border border-red-500/25 text-red-400 text-xs font-semibold hover:bg-red-500 hover:text-white transition-all ml-auto"
                      title="Delete Requisition"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                  
                  {mrf.mrfStatus !== 'Pending Owner Approval' && (
                    <div className="text-[10px] text-slate-600 text-right mt-1.5">
                      {mrf.mrfStatus === 'Approved' && '✓ Visible to HR Team'}
                      {mrf.mrfStatus === 'Rejected' && '↩ Returned to Dept. Head'}
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
