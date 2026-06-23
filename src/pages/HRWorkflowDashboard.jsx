import React, { useState, useEffect } from 'react'
import {
  Briefcase, CheckCircle2, Clock, Users, AlertCircle,
  Loader2, ArrowRight, Building2, MapPin, Flame,
  ChevronDown, ChevronUp, Link as LinkIcon, FileText,
  IndianRupee, Calendar, UserCheck, TrendingUp,
} from 'lucide-react'
import { Link } from 'react-router-dom'
import { mrfApi } from '../services/api.js'

const inputCls = 'w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-accent/60 focus:ring-1 focus:ring-accent/20 transition-colors'

function FormField({ label, children }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-semibold text-slate-400 uppercase tracking-wide">{label}</label>
      {children}
    </div>
  )
}

const URGENCY = {
  High:   'bg-red-400/12 border-red-400/30 text-red-400',
  Medium: 'bg-amber-400/12 border-amber-400/30 text-amber-400',
  Low:    'bg-slate-400/10 border-slate-400/25 text-slate-400',
}

function HRMRFCard({ mrf, onCreateJob, onRecordOffer, loading }) {
  const [expanded, setExpanded]       = useState(false)
  const [showOfferForm, setShowOfferForm] = useState(false)
  const [offerData, setOfferData]     = useState({
    offeredCandidateName: mrf.offeredCandidateName || '',
    offeredDesignation:   mrf.offeredDesignation   || '',
    offerDate:            mrf.offerDate ? mrf.offerDate.slice(0, 10) : '',
    tentativeDOJ:         mrf.tentativeDOJ ? mrf.tentativeDOJ.slice(0, 10) : '',
    actualDOJ:            mrf.actualDOJ ? mrf.actualDOJ.slice(0, 10) : '',
    offerStatus:          mrf.offerStatus || 'Offered',
    preEmploymentMedicalStatus: mrf.preEmploymentMedicalStatus || '',
    lastCTC:              mrf.lastCTC    || '',
    offeredCTC:           mrf.offeredCTC || '',
    sourceOfHiring:       mrf.sourceOfHiring || '',
    recruitmentRemarks:   mrf.recruitmentRemarks || '',
  })

  const isActive    = mrf.positionStatus === 'In Progress'
  const hasOffer    = mrf.offeredCandidateName

  const urgencyBadge = URGENCY[mrf.levelOfUrgency] || URGENCY.Medium

  const handleOfferChange = (e) => setOfferData(d => ({ ...d, [e.target.name]: e.target.value }))

  return (
    <div className={`card overflow-hidden border-l-2 transition-all duration-200 ${isActive ? 'border-l-accent/60' : 'border-l-emerald-400/60'}`}>
      <div className="h-1 bg-gradient-to-r from-accent/40 to-transparent/20 w-full" />
      <div className="p-5">

        {/* Header */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-white text-[15px] truncate">{mrf.designation}</h3>
            <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-1">
              <Building2 size={11} /><span>{mrf.department}</span>
              {mrf.section && <><span>·</span><span>{mrf.section}</span></>}
            </div>
          </div>
          <div className="flex flex-col items-end gap-1.5">
            <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold border ${urgencyBadge}`}>
              <Flame size={10} /> {mrf.levelOfUrgency || 'Medium'}
            </span>
            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${
              isActive
                ? 'bg-accent/10 border-accent/25 text-accent'
                : 'bg-accent/10 border-accent/25 text-accent'
            }`}>
              {isActive ? 'Recruiting' : 'Approved'}
            </span>
          </div>
        </div>

        {/* Meta */}
        <div className="grid grid-cols-2 gap-2 text-xs text-slate-400 mb-3">
          <span className="flex items-center gap-1"><MapPin size={10} />{mrf.location || '—'}</span>
          <span className="flex items-center gap-1"><Users size={10} />{mrf.noOfPositions} position(s)</span>
          <span className="flex items-center gap-1"><UserCheck size={10} />By: {mrf.submittedBy || '—'}</span>
          <span className="flex items-center gap-1"><TrendingUp size={10} />{mrf.candidateCount || 0} candidates</span>
        </div>

        {/* Offer summary badge */}
        {hasOffer && (
          <div className="mb-3 px-3 py-2 rounded-lg bg-accent/8 border border-accent/20 text-xs text-accent flex items-center gap-2">
            <CheckCircle2 size={12} />
            Offer Extended to: <span className="font-semibold">{mrf.offeredCandidateName}</span>
            <span className="ml-auto text-accent/60">{mrf.offerStatus}</span>
          </div>
        )}

        {/* Expand details */}
        <button
          onClick={() => setExpanded(e => !e)}
          className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-accent transition-colors mb-3"
        >
          {expanded ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
          {expanded ? 'Hide' : 'View'} MRF Details
        </button>

        {expanded && (
          <div className="space-y-2 text-xs text-slate-400 bg-white/3 border border-white/8 rounded-lg p-3 mb-4">
            {[
              ['Experience', mrf.experience],
              ['Min. Qualification', mrf.minimumQualification],
              ['Key Skills', mrf.otherKeySkills],
              ['Proposed Salary', mrf.proposedSalary],
              ['Purpose of Job', mrf.purposeOfJob],
              ['Approved By', mrf.approvedBy],
              ['Process Owner', mrf.processOwnerName],
            ].filter(([, v]) => v).map(([label, value]) => (
              <div key={label}>
                <span className="font-semibold text-slate-300">{label}: </span>
                <span>{value}</span>
              </div>
            ))}
          </div>
        )}

        {/* Offer Details Form */}
        {showOfferForm && (
          <div className="mb-4 space-y-3 p-4 bg-white/3 border border-white/10 rounded-xl">
            <p className="text-xs font-bold text-accent uppercase tracking-widest border-b border-accent/20 pb-2">
              Offer Details
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <FormField label="Offered Candidate Name">
                <input name="offeredCandidateName" value={offerData.offeredCandidateName}
                  onChange={handleOfferChange} placeholder="Full name" className={inputCls} />
              </FormField>
              <FormField label="Offered Designation">
                <input name="offeredDesignation" value={offerData.offeredDesignation}
                  onChange={handleOfferChange} placeholder="Role offered" className={inputCls} />
              </FormField>
              <FormField label="Offer Date">
                <input name="offerDate" type="date" value={offerData.offerDate}
                  onChange={handleOfferChange} className={inputCls} />
              </FormField>
              <FormField label="Tentative DOJ">
                <input name="tentativeDOJ" type="date" value={offerData.tentativeDOJ}
                  onChange={handleOfferChange} className={inputCls} />
              </FormField>
              <FormField label="Actual DOJ">
                <input name="actualDOJ" type="date" value={offerData.actualDOJ}
                  onChange={handleOfferChange} className={inputCls} />
              </FormField>
              <FormField label="Offer Status">
                <select name="offerStatus" value={offerData.offerStatus} onChange={handleOfferChange}
                  className={`${inputCls} appearance-none`}>
                  <option>Not Offered</option><option>Offered</option>
                  <option>Accepted</option><option>Joined</option>
                  <option>Declined</option><option>Withdrawn</option>
                </select>
              </FormField>
              <FormField label="Pre-Employment Medical">
                <select name="preEmploymentMedicalStatus" value={offerData.preEmploymentMedicalStatus}
                  onChange={handleOfferChange} className={`${inputCls} appearance-none`}>
                  <option value="">Select...</option>
                  <option>Pending</option><option>Fit</option><option>Unfit</option><option>Not Required</option>
                </select>
              </FormField>
              <FormField label="Source of Hiring">
                <input name="sourceOfHiring" value={offerData.sourceOfHiring}
                  onChange={handleOfferChange} placeholder="e.g. LinkedIn, Campus" className={inputCls} />
              </FormField>
              <FormField label="Last CTC">
                <input name="lastCTC" value={offerData.lastCTC}
                  onChange={handleOfferChange} placeholder="e.g. 8 LPA" className={inputCls} />
              </FormField>
              <FormField label="Offered CTC">
                <input name="offeredCTC" value={offerData.offeredCTC}
                  onChange={handleOfferChange} placeholder="e.g. 12 LPA" className={inputCls} />
              </FormField>
              <div className="sm:col-span-2">
                <FormField label="Recruitment Remarks">
                  <textarea name="recruitmentRemarks" value={offerData.recruitmentRemarks}
                    onChange={handleOfferChange} rows={2} placeholder="Notes..." className={`${inputCls} resize-none`} />
                </FormField>
              </div>
            </div>
            <div className="flex items-center gap-2 pt-1">
              <button
                onClick={() => { onRecordOffer(mrf._id, offerData); setShowOfferForm(false) }}
                disabled={loading}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-accent text-white text-xs font-semibold hover:bg-accent/80 transition-all disabled:opacity-50"
              >
                {loading ? <Loader2 size={12} className="animate-spin" /> : <CheckCircle2 size={12} />}
                Save Offer Details
              </button>
              <button onClick={() => setShowOfferForm(false)}
                className="px-3 py-2 rounded-xl text-xs text-slate-500 hover:text-white transition-colors">
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Action buttons */}
        <div className="flex items-center gap-2 pt-3 border-t border-white/8 flex-wrap">
          {!isActive ? (
            <button
              id={`create-job-btn-${mrf._id}`}
              onClick={() => onCreateJob(mrf._id)}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-accent text-white text-xs font-semibold hover:bg-accent/80 transition-all disabled:opacity-50"
            >
              {loading ? <Loader2 size={12} className="animate-spin" /> : <Briefcase size={12} />}
              Activate Job Opening
            </button>
          ) : (
            <>
              <Link
                to={`/resume-tracker?mrfId=${mrf._id}`}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-accent/10 border border-accent/25 text-accent text-xs font-semibold hover:bg-accent hover:text-white transition-all duration-150"
              >
                <Users size={12} />
                Candidates {mrf.candidateCount > 0 ? `(${mrf.candidateCount})` : ''}
                <ArrowRight size={11} />
              </Link>
              <button
                id={`offer-btn-${mrf._id}`}
                onClick={() => setShowOfferForm(o => !o)}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-accent/10 border border-accent/25 text-accent text-xs font-semibold hover:bg-accent hover:text-white transition-all duration-150"
              >
                <IndianRupee size={12} /> {hasOffer ? 'Update Offer' : 'Record Offer'}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default function HRWorkflowDashboard() {
  const [mrfs, setMrfs]           = useState([])
  const [loading, setLoading]     = useState(true)
  const [actioning, setActioning] = useState(false)
  const [filter, setFilter]       = useState('All')
  const [toast, setToast]         = useState(null)

  useEffect(() => { loadMRFs() }, [])

  const loadMRFs = async () => {
    setLoading(true)
    try {
      const all = await mrfApi.list()
      // HR sees only Approved and already-active (In Progress) MRFs
      setMrfs(all.filter(m => m.mrfStatus === 'Approved'))
    } catch (e) {
      showToast('Failed to load MRFs: ' + e.message, 'error')
    } finally {
      setLoading(false)
    }
  }

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 4000)
  }

  const handleCreateJob = async (id) => {
    setActioning(true)
    try {
      await mrfApi.createJob(id)
      showToast('Job Opening activated! Candidates can now apply. ✓')
      loadMRFs()
    } catch (e) {
      showToast(e.message, 'error')
    } finally {
      setActioning(false)
    }
  }

  const handleRecordOffer = async (id, data) => {
    setActioning(true)
    try {
      await mrfApi.recordOffer(id, data)
      showToast('Offer details saved & synced to Google Sheet. ✓')
      loadMRFs()
    } catch (e) {
      showToast(e.message, 'error')
    } finally {
      setActioning(false)
    }
  }

  const FILTERS = ['All', 'Approved', 'Recruiting']
  const filtered = filter === 'All' ? mrfs
    : filter === 'Recruiting' ? mrfs.filter(m => m.positionStatus === 'In Progress')
    : mrfs.filter(m => m.positionStatus !== 'In Progress')

  const recruitingCount = mrfs.filter(m => m.positionStatus === 'In Progress').length
  const pendingCount    = mrfs.filter(m => m.positionStatus !== 'In Progress').length
  const offeredCount    = mrfs.filter(m => m.offeredCandidateName).length

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-8">

      {toast && (
        <div className={`fixed top-20 right-5 z-50 px-4 py-3 rounded-xl shadow-xl text-sm font-medium border fade-up
          ${toast.type === 'error'
            ? 'bg-red-500/15 border-red-500/30 text-red-300'
            : 'bg-accent/15 border-accent/30 text-accent'}`}>
          {toast.msg}
        </div>
      )}

      {/* Header */}
      <div className="fade-up">
        <span className="section-tag mb-3"><Briefcase size={11} /> HR Recruitment Queue</span>
        <h1 className="font-display font-bold text-2xl sm:text-3xl text-white mt-2">
          HR Workflow Dashboard
        </h1>
        <p className="text-slate-400 text-sm mt-1">
          Activate approved MRFs as live job openings, manage candidates, and record offer details.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 fade-up-1">
        {[
          { label: 'Awaiting Activation', value: pendingCount,    color: 'text-amber-400',   bg: 'bg-amber-400/10 border-amber-400/20',    icon: Clock },
          { label: 'Actively Recruiting', value: recruitingCount, color: 'text-accent',       bg: 'bg-accent/10 border-accent/20',           icon: TrendingUp },
          { label: 'Offers Extended',     value: offeredCount,    color: 'text-accent', bg: 'bg-accent/10 border-accent/20', icon: CheckCircle2 },
        ].map(({ label, value, color, bg, icon: Icon }) => (
          <div key={label} className="card p-4">
            <div className={`w-9 h-9 rounded-lg border flex items-center justify-center mb-3 ${bg}`}>
              <Icon size={16} className={color} />
            </div>
            <p className={`font-display font-bold text-2xl ${color}`}>{value}</p>
            <p className="text-xs text-slate-500 mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      {/* Filter */}
      <div className="flex items-center gap-2 flex-wrap fade-up-2">
        {FILTERS.map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all duration-150
              ${filter === f
                ? 'bg-accent text-white border-accent shadow-glow-sm'
                : 'bg-white/5 border-white/10 text-slate-400 hover:text-white hover:bg-white/10'}`}
          >
            {f}
          </button>
        ))}
        <span className="ml-auto text-xs text-slate-600">{filtered.length} opening(s)</span>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="card p-12 flex items-center justify-center">
          <Loader2 size={24} className="animate-spin text-accent" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="card p-12 flex flex-col items-center gap-4 text-center">
          <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center">
            <AlertCircle size={24} className="text-slate-500" />
          </div>
          <p className="text-slate-400 text-sm">No approved MRFs in this view.</p>
          <p className="text-slate-600 text-xs">Once an Admin approves an MRF, it will appear here.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 fade-up-3">
          {filtered.map((mrf) => (
            <HRMRFCard
              key={mrf._id}
              mrf={mrf}
              onCreateJob={handleCreateJob}
              onRecordOffer={handleRecordOffer}
              loading={actioning}
            />
          ))}
        </div>
      )}
    </div>
  )
}
