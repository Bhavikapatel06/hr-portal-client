import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  ArrowLeft, Briefcase, Calendar, CheckCircle2, Clock, Edit3,
  FileText, Loader2, Mail, MapPin, Phone, Star,
  Trash2, Upload, UserCheck, XCircle, ShieldAlert,
  Award, Download, ExternalLink, Search
} from 'lucide-react'
import { candidateApi } from '../services/api.js'

// ── Helpers ────────────────────────────────────────────────────────────────
const getFileUrl = (path) => {
  if (!path) return '';
  const serverUrl = import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL.replace('/api', '') : 'http://localhost:5000';
  return `${serverUrl}/${path}`;
};

const scoreColor = (s) => {
  if (s >= 80) return { text: 'text-accent', bg: 'bg-accent/10 border-accent/25' }
  if (s >= 60) return { text: 'text-slate-300', bg: 'bg-white/5 border-white/10' }
  return { text: 'text-slate-400', bg: 'bg-white/5 border-white/8' }
}

const scoreLabel = (s) => {
  if (s >= 80) return 'Strong Match'
  if (s >= 60) return 'Good Match'
  if (s >= 40) return 'Partial Match'
  return 'Weak Match'
}

const STAGE_CONFIG = {
  'Shared with HOD':      { color: 'text-slate-300',   bg: 'bg-white/5 border-white/10',    icon: Clock },
  'Approved by HOD':      { color: 'text-accent',      bg: 'bg-accent/10 border-accent/20', icon: CheckCircle2 },
  'Interview':            { color: 'text-slate-300',   bg: 'bg-white/5 border-white/10',    icon: Calendar },
  'Rejected':             { color: 'text-slate-500',   bg: 'bg-white/5 border-white/8',     icon: XCircle },
  'Offer':                { color: 'text-slate-300',   bg: 'bg-white/5 border-white/10',    icon: Award },
  'Joined':               { color: 'text-accent',      bg: 'bg-accent/10 border-accent/20', icon: UserCheck },
  // Legacy support
  'Applied':              { color: 'text-slate-400',   bg: 'bg-white/5 border-white/8',     icon: FileText },
  'Screening':            { color: 'text-slate-300',   bg: 'bg-white/5 border-white/10',    icon: Search },
  'Pending Head Approval':{ color: 'text-slate-300',   bg: 'bg-white/5 border-white/10',    icon: Clock },
  'Approved by Head':     { color: 'text-accent',      bg: 'bg-accent/10 border-accent/20', icon: CheckCircle2 },
}

const HIRING_STAGES = ['Shared with HOD', 'Rejected']

const inputCls = 'w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-accent/60 focus:ring-1 focus:ring-accent/20 transition-colors'
const selectCls = `${inputCls} appearance-none cursor-pointer`

// ── Score Ring SVG ─────────────────────────────────────────────────────────
function ScoreRing({ score = 0, size = 68 }) {
  const r = 28
  const circ = 2 * Math.PI * r
  const { text } = scoreColor(score)
  return (
    <div className="relative flex-shrink-0" style={{ width: size, height: size }}>
      <svg viewBox="0 0 64 64" className="w-full h-full -rotate-90">
        <circle cx="32" cy="32" r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="5" />
        <circle cx="32" cy="32" r={r} fill="none"
          stroke={score >= 80 ? '#4F8EF7' : '#94a3b8'}
          strokeWidth="5" strokeDasharray={circ}
          strokeDashoffset={circ - (score / 100) * circ}
          strokeLinecap="round" className="transition-all duration-700" />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className={`font-bold text-sm leading-none ${text}`}>{score}%</span>
      </div>
    </div>
  )
}

// ── Dimension Bar ───────────────────────────────────────────────────────────
function DimBar({ label, value }) {
  return (
    <div>
      <div className="flex justify-between text-xs mb-1">
        <span className="text-slate-400">{label}</span>
        <span className="font-semibold text-white">{value}%</span>
      </div>
      <div className="h-1.5 bg-white/8 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{
            width: `${value}%`,
            background: value >= 80 ? '#4F8EF7' : '#94a3b8'
          }}
        />
      </div>
    </div>
  )
}

// ── Interview Schedule Modal ───────────────────────────────────────────────
function InterviewModal({ candidate, onClose, onSave }) {
  const [form, setForm] = useState({
    interviewDate: candidate.interviewDate?.split('T')[0] || '',
    interviewTime: candidate.interviewTime || '',
    interviewMode: candidate.interviewMode || 'In-Person',
    interviewLocation: candidate.interviewLocation || '',
    interviewerName: candidate.interviewerName || '',
    interviewRound: candidate.interviewRound || 'Round 1',
    interviewNotes: candidate.interviewNotes || '',
    interviewStatus: candidate.interviewStatus || 'Scheduled',
  })
  const [saving, setSaving] = useState(false)

  const handleSave = async () => {
    setSaving(true)
    try { await onSave(candidate._id, form) } finally { setSaving(false) }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="card max-w-lg w-full p-6 border border-indigo-500/20 space-y-5 fade-up">
        <div className="flex items-center justify-between border-b border-white/8 pb-3">
          <h3 className="font-display font-bold text-white text-base flex items-center gap-2">
            <Calendar size={16} className="text-indigo-400" />
            Schedule Interview — {candidate.name}
          </h3>
          <button onClick={onClose} className="text-slate-500 hover:text-white text-lg leading-none">✕</button>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Interview Round</label>
            <select value={form.interviewRound} onChange={e => setForm(f => ({ ...f, interviewRound: e.target.value }))} className={selectCls}>
              {['Round 1 – HR Screen', 'Round 2 – Technical', 'Round 3 – Managerial', 'Final Round'].map(r => <option key={r}>{r}</option>)}
            </select>
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Mode</label>
            <select value={form.interviewMode} onChange={e => setForm(f => ({ ...f, interviewMode: e.target.value }))} className={selectCls}>
              {['In-Person', 'Video Call', 'Phone Screen', 'Panel'].map(m => <option key={m}>{m}</option>)}
            </select>
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Date</label>
            <input type="date" value={form.interviewDate} onChange={e => setForm(f => ({ ...f, interviewDate: e.target.value }))} className={inputCls} />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Time</label>
            <input type="time" value={form.interviewTime} onChange={e => setForm(f => ({ ...f, interviewTime: e.target.value }))} className={inputCls} />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Interviewer Name</label>
            <input value={form.interviewerName} onChange={e => setForm(f => ({ ...f, interviewerName: e.target.value }))} placeholder="Name of interviewer" className={inputCls} />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Location / Link</label>
            <input value={form.interviewLocation} onChange={e => setForm(f => ({ ...f, interviewLocation: e.target.value }))} placeholder="Room / Meet link" className={inputCls} />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Status</label>
            <select value={form.interviewStatus} onChange={e => setForm(f => ({ ...f, interviewStatus: e.target.value }))} className={selectCls}>
              {['Scheduled', 'Completed', 'Cancelled', 'No Show'].map(s => <option key={s}>{s}</option>)}
            </select>
          </div>
          <div className="flex flex-col gap-1.5 col-span-2">
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Notes / Feedback</label>
            <textarea value={form.interviewNotes} onChange={e => setForm(f => ({ ...f, interviewNotes: e.target.value }))} rows={3}
              placeholder="Interview feedback, key observations..." className={`${inputCls} resize-none`} />
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-2 border-t border-white/8">
          <button onClick={onClose} className="px-5 py-2 rounded-xl bg-white/5 border border-white/10 text-slate-400 hover:text-white font-semibold text-sm transition-colors">
            Cancel
          </button>
          <button onClick={handleSave} disabled={saving}
            className="btn-primary flex items-center gap-2 bg-indigo-600 border-indigo-500 hover:bg-indigo-700">
            {saving ? <Loader2 size={13} className="animate-spin" /> : <Calendar size={13} />}
            Save Interview
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Edit Candidate Modal ───────────────────────────────────────────────────
function EditCandidateModal({ candidate, onClose, onSave }) {
  const [form, setForm] = useState({
    name: candidate.name || '',
    email: candidate.email || '',
    phone: candidate.phone || '',
    currentLocation: candidate.currentLocation || '',
    experience: candidate.experience || '',
    currentDesignation: candidate.currentDesignation || '',
    currentOrganization: candidate.currentOrganization || '',
    currentCTC: candidate.currentCTC || '',
    expectedCTC: candidate.expectedCTC || '',
    noticePeriod: candidate.noticePeriod || '',
    qualification: candidate.qualification || '',
    skills: candidate.skills || '',
    stage: candidate.stage || 'Shared with HOD',
  })
  const [saving, setSaving] = useState(false)

  const handleSave = async () => {
    setSaving(true)
    try { await onSave(candidate._id, form) } finally { setSaving(false) }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm overflow-y-auto">
      <div className="card max-w-2xl w-full p-6 border border-accent/20 space-y-5 my-6 fade-up">
        <div className="flex items-center justify-between border-b border-white/8 pb-3">
          <h3 className="font-display font-bold text-white text-base flex items-center gap-2">
            <Edit3 size={16} className="text-accent" />
            Edit Candidate — {candidate.name}
          </h3>
          <button onClick={onClose} className="text-slate-500 hover:text-white text-lg leading-none">✕</button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-h-[60vh] overflow-y-auto pr-1">
          {[
            { label: 'Full Name', key: 'name' },
            { label: 'Email', key: 'email', type: 'email' },
            { label: 'Phone', key: 'phone' },
            { label: 'Current Location', key: 'currentLocation' },
            { label: 'Total Experience', key: 'experience', placeholder: 'e.g. 4 years' },
            { label: 'Current Designation', key: 'currentDesignation' },
            { label: 'Current Organisation', key: 'currentOrganization' },
            { label: 'Current CTC', key: 'currentCTC', placeholder: 'e.g. 800000' },
            { label: 'Expected CTC', key: 'expectedCTC', placeholder: 'e.g. 1200000' },
            { label: 'Notice Period', key: 'noticePeriod', placeholder: 'e.g. 30 days' },
            { label: 'Qualification', key: 'qualification' },
            { label: 'Key Skills', key: 'skills', placeholder: 'React, Node.js, Python...' },
          ].map(({ label, key, type, placeholder }) => (
            <div key={key} className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wide">{label}</label>
              <input type={type || 'text'} value={form[key]} placeholder={placeholder || label}
                onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))} className={inputCls} />
            </div>
          ))}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Pipeline Stage</label>
            <select value={form.stage} onChange={e => setForm(f => ({ ...f, stage: e.target.value }))} className={selectCls}>
              {HIRING_STAGES.map(s => <option key={s}>{s}</option>)}
            </select>
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-2 border-t border-white/8">
          <button onClick={onClose} className="px-5 py-2 rounded-xl bg-white/5 border border-white/10 text-slate-400 hover:text-white font-semibold text-sm">Cancel</button>
          <button onClick={handleSave} disabled={saving} className="btn-primary flex items-center gap-2">
            {saving ? <Loader2 size={13} className="animate-spin" /> : <CheckCircle2 size={13} />}
            Save Changes
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Main Page Component ───────────────────────────────────────────────────
export default function CandidateDetailsPage() {
  const { candidateId } = useParams()
  const navigate = useNavigate()
  const role = localStorage.getItem('hr_role') || ''

  const [candidate, setCandidate] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [toast, setToast] = useState(null)

  const [showInterviewModal, setShowInterviewModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => { fetchDetails() }, [candidateId])

  const fetchDetails = async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await candidateApi.get(candidateId)
      setCandidate(data)
    } catch (err) {
      setError(err.message || 'Failed to load candidate details')
    } finally {
      setLoading(false)
    }
  }

  const showToastMsg = (msg, type = 'success') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 4000)
  }

  const handleStageChange = async (newStage) => {
    try {
      const updated = await candidateApi.updateDetails(candidateId, { stage: newStage })
      setCandidate(updated)
      showToastMsg(`Candidate moved to ${newStage} successfully! ✓`)
    } catch (err) {
      showToastMsg(err.message, 'error')
    }
  }

  const handleSaveInterview = async (candidateId, interviewData) => {
    try {
      await candidateApi.updateInterview(candidateId, interviewData)
      showToastMsg('Interview details updated successfully! ✓')
      setShowInterviewModal(false)
      fetchDetails()
    } catch (err) {
      showToastMsg(err.message, 'error')
    }
  }

  const handleSaveCandidate = async (candidateId, updatedDetails) => {
    try {
      const updated = await candidateApi.updateDetails(candidateId, updatedDetails)
      setCandidate(updated)
      showToastMsg('Candidate profile details updated! ✓')
      setShowEditModal(false)
    } catch (err) {
      showToastMsg(err.message, 'error')
    }
  }

  const handleDeleteCandidate = async () => {
    if (!window.confirm('Are you sure you want to permanently delete this candidate application? This action is irreversible.')) return
    setDeleting(true)
    try {
      await candidateApi.delete(candidateId)
      showToastMsg('Candidate deleted successfully! Redirecting...', 'success')
      setTimeout(() => navigate('/recruitment'), 1500)
    } catch (err) {
      showToastMsg(err.message, 'error')
      setDeleting(false)
    }
  }

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-24 flex flex-col items-center justify-center gap-4">
        <Loader2 size={36} className="animate-spin text-accent" />
        <p className="text-slate-400 text-sm font-semibold">Loading Candidate Details...</p>
      </div>
    )
  }

  if (error || !candidate) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center space-y-6">
        <div className="card p-12 border border-red-500/10 bg-red-500/3 flex flex-col items-center gap-4">
          <ShieldAlert size={48} className="text-red-400" />
          <h2 className="text-xl font-bold text-white">Error Loading Profile</h2>
          <p className="text-slate-400 text-sm max-w-md">{error || 'Candidate details could not be found.'}</p>
          <button onClick={() => navigate('/recruitment')} className="btn-primary bg-red-600 hover:bg-red-700 flex items-center gap-2">
            <ArrowLeft size={14} /> Back to Recruitment
          </button>
        </div>
      </div>
    )
  }

  const score = candidate.matchScore || candidate.score || 0
  const sc = scoreColor(score)
  const resumeUrl = getFileUrl(candidate.filePath) || candidate.resumeUrl

  const stageCfg = STAGE_CONFIG[candidate.stage] || STAGE_CONFIG['Shared with HOD']
  const StageIcon = stageCfg.icon

  const isApprovedByHOD = ['Approved by HOD', 'Approved by Head', 'Interview', 'Offer', 'Joined'].includes(candidate.stage)

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-8">

      {/* Toast */}
      {toast && (
        <div className={`fixed top-20 right-5 z-50 px-4 py-3 rounded-xl shadow-xl text-sm font-medium border fade-up max-w-sm
          ${toast.type === 'error' ? 'bg-red-500/15 border-red-500/30 text-red-300' : 'bg-emerald-500/15 border-emerald-500/30 text-emerald-300'}`}>
          {toast.msg}
        </div>
      )}

      {/* Modals */}
      {showInterviewModal && (
        <InterviewModal candidate={candidate} onClose={() => setShowInterviewModal(false)} onSave={handleSaveInterview} />
      )}
      {showEditModal && (
        <EditCandidateModal candidate={candidate} onClose={() => setShowEditModal(false)} onSave={handleSaveCandidate} />
      )}

      {/* ── Header ───────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-white/5">
        <div className="space-y-1">
          {/* Small ← arrow button inline with candidate name */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate(candidate.jobOpeningId?._id ? `/recruitment/job/${candidate.jobOpeningId._id}` : '/recruitment')}
              className="w-8 h-8 flex items-center justify-center rounded-lg bg-white/5 border border-white/10 text-slate-400 hover:text-white hover:bg-white/10 transition-all flex-shrink-0"
              title="Back to Pipeline"
            >
              <ArrowLeft size={16} />
            </button>
            <h1 className="font-display font-bold text-2xl text-white flex items-center gap-3">
              {candidate.name}
              {score >= 80 && (
                <span className="px-2 py-0.5 text-[9px] font-bold rounded bg-accent/15 text-accent border border-accent/25">
                  ⭐ TOP MATCH
                </span>
              )}
            </h1>
          </div>
          <p className="text-slate-400 text-xs pl-11">
            Applied for <strong className="text-accent">{candidate.jobOpeningId?.designation || 'Position'}</strong> · Department: {candidate.jobOpeningId?.department || '—'}
          </p>
        </div>

        {(role === 'hr' || role === 'admin') && (
          <div className="flex gap-2 flex-wrap">
            <button onClick={() => setShowEditModal(true)} className="btn-ghost flex items-center gap-1.5 text-xs py-2">
              <Edit3 size={13} /> Edit Profile
            </button>
            <button onClick={handleDeleteCandidate} disabled={deleting}
              className="px-4 py-2 rounded-xl bg-red-500/10 border border-red-500/25 text-red-400 hover:bg-red-500 hover:text-white transition-all text-xs font-semibold flex items-center gap-1.5 disabled:opacity-55">
              {deleting ? <Loader2 size={13} className="animate-spin" /> : <Trash2 size={13} />} Delete Candidate
            </button>
          </div>
        )}
      </div>

      {/* ── Two-column grid ───────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">

        {/* ── LEFT: AI Match + Hiring Stage + Interview Details ────────── */}
        <div className="space-y-6">

          {/* AI Match Scoring */}
          <div className="card p-5 border border-white/5 space-y-4">
            <div className="flex items-center gap-4">
              <ScoreRing score={score} size={64} />
              <div>
                <h3 className="font-display font-bold text-white text-base leading-snug">AI Match Scoring</h3>
                <p className="text-xs text-slate-400 mt-0.5">Calculated based on MRF requirements &amp; JD matching parameters.</p>
              </div>
              <span className={`ml-auto px-2.5 py-1 rounded-full border text-xs font-bold ${sc.bg} ${sc.text}`}>
                {scoreLabel(score)}
              </span>
            </div>

            {candidate.matchBreakdown && (
              <div className="pt-4 border-t border-white/5 space-y-3">
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Matching Dimensions</p>
                <DimBar label="Skills Match"         value={candidate.matchBreakdown.skills ?? 0} />
                <DimBar label="Experience Alignment" value={candidate.matchBreakdown.experience ?? 0} />
                <DimBar label="Education Match"      value={candidate.matchBreakdown.education ?? 0} />
                <DimBar label="Project Similarity"   value={candidate.matchBreakdown.projectSimilarity ?? 0} />
                <DimBar label="Certification Match"  value={candidate.matchBreakdown.certification ?? 0} />
                <DimBar label="Location Match"       value={candidate.matchBreakdown.location ?? 0} />
              </div>
            )}
          </div>

          {/* Hiring Stage & Actions */}
          <div className="card p-5 border border-white/5 space-y-5">
            <div className="flex justify-between items-center">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Hiring Stage</span>
              <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full border text-xs font-bold ${stageCfg.bg} ${stageCfg.color}`}>
                <StageIcon size={12} /> {candidate.stage || 'Shared with HOD'}
              </span>
            </div>

            {role === 'department_head' ? (
              candidate.stage === 'Shared with HOD' ? (
                <div className="space-y-3 p-4 rounded-xl bg-white/5 border border-white/10">
                  <p className="text-xs font-bold text-accent uppercase tracking-wide">Awaiting Your Approval</p>
                  <p className="text-xs text-slate-400">Review the profile and resume of this candidate to approve or reject them for the next hiring steps.</p>
                  <div className="flex gap-2.5 pt-2">
                    <button onClick={() => handleStageChange('Approved by HOD')}
                      className="flex-1 px-4 py-2 rounded-xl bg-accent text-white font-bold text-xs hover:bg-accent-light active:scale-95 transition-all shadow-glow-sm">
                      Approve Candidate
                    </button>
                    <button onClick={() => handleStageChange('Rejected')}
                      className="flex-1 px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-slate-400 hover:bg-white/10 hover:text-white transition-all text-xs font-bold">
                      Reject Candidate
                    </button>
                  </div>
                </div>
              ) : (
                <div className="p-4 rounded-xl bg-white/5 border border-white/10 text-center text-xs text-slate-400">
                  Current Status: <strong className="text-white">{candidate.stage}</strong>
                </div>
              )
            ) : isApprovedByHOD ? (
              /* ── HOD-Approved: Offer / Hired / Reject + Schedule Interview ── */
              <div className="space-y-4">
                <div className="space-y-3">
                  <p className="text-xs font-semibold text-slate-400">Candidate Actions:</p>
                  <div className="flex gap-2.5">
                    <button
                      onClick={() => handleStageChange('Offer')}
                      disabled={candidate.stage === 'Offer'}
                      className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl border text-xs font-semibold transition-all shadow-glow-sm
                        ${candidate.stage === 'Offer'
                          ? 'bg-white/5 border-white/8 text-slate-500 cursor-default opacity-60'
                          : 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10 hover:text-white'}`}
                    >
                      <Award size={13} /> Offer
                    </button>
                    <button
                      onClick={() => handleStageChange('Joined')}
                      disabled={candidate.stage === 'Joined'}
                      className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl border text-xs font-semibold transition-all shadow-glow-sm
                        ${candidate.stage === 'Joined'
                          ? 'bg-accent/5 border-accent/10 text-accent/55 cursor-default opacity-60'
                          : 'bg-accent/15 border-accent/25 text-accent hover:bg-accent hover:text-white'}`}
                    >
                      <UserCheck size={13} /> Hired
                    </button>
                    <button
                      onClick={() => handleStageChange('Rejected')}
                      disabled={candidate.stage === 'Rejected'}
                      className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl border text-xs font-semibold transition-all
                        ${candidate.stage === 'Rejected'
                          ? 'bg-white/5 border-white/8 text-slate-500 cursor-default opacity-60'
                          : 'bg-white/5 border-white/10 text-slate-400 hover:bg-white/10 hover:text-white'}`}
                    >
                      <XCircle size={13} /> Reject
                    </button>
                  </div>
                </div>
                <div className="pt-1 border-t border-white/5">
                  <button
                    onClick={() => setShowInterviewModal(true)}
                    className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-indigo-500/10 border border-indigo-500/25 text-indigo-400 text-xs font-semibold hover:bg-indigo-500 hover:text-white transition-all shadow-glow-sm"
                  >
                    <Calendar size={13} /> Schedule Interview
                  </button>
                </div>
              </div>
            ) : (
              /* ── Not yet approved: Shared with HOD / Rejected stage buttons ── */
              <div className="space-y-3">
                <p className="text-xs font-semibold text-slate-400">Advance Candidate Stage:</p>
                <div className="grid grid-cols-2 gap-2">
                  {HIRING_STAGES.map(s => {
                    const isActive = candidate.stage === s
                    const cfg = STAGE_CONFIG[s] || STAGE_CONFIG['Shared with HOD']
                    const Icon = cfg.icon
                    return (
                      <button
                        key={s}
                        onClick={() => handleStageChange(s)}
                        disabled={isActive}
                        className={`px-3 py-2 rounded-xl border text-[11px] font-bold transition-all flex items-center justify-center gap-1.5
                          ${isActive
                            ? `${cfg.bg} ${cfg.color} cursor-default opacity-100`
                            : 'border-white/5 bg-ink-950/40 text-slate-400 hover:border-white/10 hover:text-white hover:bg-white/3'}`}
                      >
                        <Icon size={11} /> {s}
                      </button>
                    )
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Interview Details (only if scheduled) */}
          {candidate.interviewStatus === 'Scheduled' && (
            <div className="card p-5 border border-indigo-500/20 bg-indigo-500/3 space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-indigo-400 flex items-center gap-1.5 uppercase tracking-wide">
                  <Calendar size={14} /> Interview Details
                </span>
                <span className="px-2 py-0.5 rounded bg-indigo-500/15 border border-indigo-500/30 text-indigo-300 text-[10px] font-bold">
                  {candidate.interviewRound}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-4 text-xs">
                <div>
                  <span className="text-slate-500 block">Date &amp; Time</span>
                  <span className="text-white font-semibold mt-0.5 block">
                    {candidate.interviewDate ? new Date(candidate.interviewDate).toLocaleDateString('en-IN') : '—'} @ {candidate.interviewTime || '—'}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 block">Interview Mode</span>
                  <span className="text-white font-semibold mt-0.5 block">{candidate.interviewMode || '—'}</span>
                </div>
                <div className="col-span-2">
                  <span className="text-slate-500 block">Interviewer</span>
                  <span className="text-white font-semibold mt-0.5 block">{candidate.interviewerName || '—'}</span>
                </div>
                {candidate.interviewLocation && (
                  <div className="col-span-2">
                    <span className="text-slate-500 block">Location / Link</span>
                    {candidate.interviewLocation.startsWith('http') ? (
                      <a href={candidate.interviewLocation} target="_blank" rel="noreferrer" className="text-accent hover:underline flex items-center gap-1 mt-0.5 font-semibold">
                        <ExternalLink size={12} /> Meet Link
                      </a>
                    ) : (
                      <span className="text-white font-semibold mt-0.5 block">{candidate.interviewLocation}</span>
                    )}
                  </div>
                )}
              </div>

              {candidate.interviewNotes && (
                <div className="pt-3 border-t border-indigo-500/10 text-xs">
                  <span className="text-slate-500 block font-semibold">Feedback / Notes</span>
                  <p className="text-slate-300 mt-1 italic">"{candidate.interviewNotes}"</p>
                </div>
              )}
            </div>
          )}

        </div>

        {/* ── RIGHT: Contact Info + Resume ─────────────────────────────── */}
        <div className="space-y-6">

          {/* Contact & Personal Info */}
          <div className="card p-5 border border-white/5 space-y-4">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block">Contact &amp; Personal Info</span>

            <div className="space-y-3 text-xs">
              <div className="flex items-center gap-2.5 text-slate-300">
                <Mail size={14} className="text-slate-500 flex-shrink-0" />
                <span className="truncate">{candidate.email || 'No email provided'}</span>
              </div>
              <div className="flex items-center gap-2.5 text-slate-300">
                <Phone size={14} className="text-slate-500 flex-shrink-0" />
                <span>{candidate.phone || 'No phone provided'}</span>
              </div>
              <div className="flex items-center gap-2.5 text-slate-300">
                <MapPin size={14} className="text-slate-500 flex-shrink-0" />
                <span>{candidate.currentLocation || 'Location not specified'}</span>
              </div>
              <div className="flex items-center gap-2.5 text-slate-300">
                <Briefcase size={14} className="text-slate-500 flex-shrink-0" />
                <span>{candidate.experience || 'No experience details'}</span>
              </div>
            </div>

            <div className="divider my-4" />

            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block">Financial &amp; Career Details</span>
            <div className="grid grid-cols-2 gap-4 text-xs">
              <div>
                <span className="text-slate-500 block">Current Designation</span>
                <span className="text-white font-semibold mt-0.5 block">{candidate.currentDesignation || '—'}</span>
              </div>
              <div>
                <span className="text-slate-500 block">Current Company</span>
                <span className="text-white font-semibold mt-0.5 block">{candidate.currentOrganization || '—'}</span>
              </div>
              <div>
                <span className="text-slate-500 block">Current CTC</span>
                <span className="text-white font-semibold mt-0.5 block">
                  {candidate.currentCTC ? `${Number(candidate.currentCTC).toLocaleString('en-IN')} INR` : '—'}
                </span>
              </div>
              <div>
                <span className="text-slate-500 block">Expected CTC</span>
                <span className="text-white font-semibold mt-0.5 block">
                  {candidate.expectedCTC ? `${Number(candidate.expectedCTC).toLocaleString('en-IN')} INR` : '—'}
                </span>
              </div>
              <div>
                <span className="text-slate-500 block">Notice Period</span>
                <span className="text-white font-semibold mt-0.5 block">{candidate.noticePeriod || '—'}</span>
              </div>
              <div>
                <span className="text-slate-500 block">Qualification</span>
                <span className="text-white font-semibold mt-0.5 block">{candidate.qualification || '—'}</span>
              </div>
            </div>

            {candidate.skills && (
              <>
                <div className="divider my-4" />
                <div>
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-2">Key Skills</span>
                  <div className="flex flex-wrap gap-1.5">
                    {candidate.skills.split(',').map(s => (
                      <span key={s} className="px-2 py-0.5 rounded bg-white/5 border border-white/8 text-[10px] text-slate-300 font-medium">
                        {s.trim()}
                      </span>
                    ))}
                  </div>
                </div>
              </>
            )}

            <div className="divider my-4" />
            <div>
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-2">Resume</span>
              <div className="flex items-center justify-between bg-white/5 border border-white/8 p-3.5 rounded-xl gap-3">
                <div className="flex items-center gap-2 truncate">
                  <FileText size={15} className="text-accent flex-shrink-0" />
                  <span className="text-xs font-semibold text-white truncate">
                    {candidate.fileName || 'resume.pdf'}
                  </span>
                </div>
                <div className="flex gap-2 flex-shrink-0">
                  {resumeUrl ? (
                    <>
                      <a
                        href={resumeUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center gap-1 px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-xs font-semibold hover:bg-white/10 transition-colors"
                      >
                        <ExternalLink size={12} /> View
                      </a>
                      <a
                        href={resumeUrl}
                        download
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center gap-1 px-3 py-2 rounded-xl bg-accent/15 border border-accent/20 text-accent text-xs font-semibold hover:bg-accent hover:text-white transition-colors"
                      >
                        <Download size={12} /> Download
                      </a>
                    </>
                  ) : (
                    <span className="text-xs text-slate-500 italic px-2 py-1">Not Uploaded</span>
                  )}
                </div>
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  )
}
