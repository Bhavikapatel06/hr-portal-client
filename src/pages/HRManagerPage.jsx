import React, { useState, useEffect, useCallback } from 'react'
import { useNavigate, Link, useParams } from 'react-router-dom'
import {
  Briefcase, Users, Upload, ChevronDown, ChevronUp, Star,
  Edit3, Calendar, CheckCircle2, Clock, XCircle, AlertCircle,
  Loader2, ArrowRight, FileText, Plus, Phone, Mail, MapPin,
  GraduationCap, Building2, DollarSign, Award, Send, X,
  ExternalLink, RefreshCw, UserCheck, Search, Filter,
  ArrowLeft, Menu
} from 'lucide-react'
import { mrfApi, candidateApi } from '../services/api.js'

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
function ScoreRing({ score = 0, size = 52 }) {
  const r = 20
  const circ = 2 * Math.PI * r
  const { text } = scoreColor(score)
  return (
    <div className="relative flex-shrink-0" style={{ width: size, height: size }}>
      <svg viewBox="0 0 48 48" className="w-full h-full -rotate-90">
        <circle cx="24" cy="24" r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="4" />
        <circle cx="24" cy="24" r={r} fill="none"
          stroke={score >= 80 ? '#4F8EF7' : '#94a3b8'}
          strokeWidth="4" strokeDasharray={circ}
          strokeDashoffset={circ - (score / 100) * circ}
          strokeLinecap="round" className="transition-all duration-700" />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className={`font-bold text-[11px] leading-none ${text}`}>{score}%</span>
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
    hrNotes: candidate.hrNotes || '',
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
            { label: 'Full Name',            key: 'name' },
            { label: 'Email',                key: 'email', type: 'email' },
            { label: 'Phone',                key: 'phone' },
            { label: 'Current Location',     key: 'currentLocation' },
            { label: 'Total Experience',     key: 'experience', placeholder: 'e.g. 4 years' },
            { label: 'Current Designation',  key: 'currentDesignation' },
            { label: 'Current Organisation', key: 'currentOrganization' },
            { label: 'Current CTC',          key: 'currentCTC', placeholder: 'e.g. 800000' },
            { label: 'Expected CTC',         key: 'expectedCTC', placeholder: 'e.g. 1200000' },
            { label: 'Notice Period',        key: 'noticePeriod', placeholder: 'e.g. 30 days' },
            { label: 'Qualification',        key: 'qualification' },
            { label: 'Key Skills',           key: 'skills', placeholder: 'React, Node.js, Python...' },
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
          <div className="flex flex-col gap-1.5 sm:col-span-2">
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wide">HR Notes</label>
            <textarea value={form.hrNotes} onChange={e => setForm(f => ({ ...f, hrNotes: e.target.value }))} rows={3}
              placeholder="Internal notes about this candidate..." className={`${inputCls} resize-none`} />
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

// ── Candidate Card ──────────────────────────────────────────────────────────
function CandidateCard({ candidate, rank }) {
  const navigate = useNavigate()
  const score = candidate.matchScore || candidate.score || 0
  const sc = scoreColor(score)
  const stageCfg = STAGE_CONFIG[candidate.stage] || STAGE_CONFIG['Shared with HOD']
  const StageIcon = stageCfg.icon

  return (
    <div className={`border rounded-xl hover:border-accent/30 hover:shadow-glow-sm transition-all duration-200 overflow-hidden ${
      rank === 1 ? 'border-emerald-500/30 bg-emerald-500/3' :
      rank === 2 ? 'border-accent/20 bg-accent/3' :
      'border-white/8 bg-ink-950/40'
    }`}>
      {/* Collapsed Header — always visible */}
      <div
        className="flex items-center gap-4 p-4 cursor-pointer hover:bg-white/2 transition-colors select-none"
        onClick={() => navigate(`/recruitment/candidate/${candidate._id}`)}
      >
        {/* Rank badge */}
        <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${
          rank === 1 ? 'bg-emerald-500 text-white' :
          rank === 2 ? 'bg-accent text-white' :
          rank === 3 ? 'bg-amber-500 text-white' :
          'bg-white/10 text-slate-400'
        }`}>
          {rank}
        </div>

        {/* Score ring */}
        <ScoreRing score={score} size={48} />

        {/* Name + designation */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="font-semibold text-white text-sm">{candidate.name || 'Unknown Candidate'}</p>
            {rank === 1 && (
              <span className="px-1.5 py-0.5 text-[9px] font-bold rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                ⭐ TOP MATCH
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500 mt-0.5 truncate">
            {candidate.currentDesignation || candidate.designation || '—'}{candidate.currentOrganization ? ` @ ${candidate.currentOrganization}` : ''}
          </p>
          <div className="flex items-center gap-3 mt-1 flex-wrap">
            {candidate.experience && (
              <span className="text-[10px] text-slate-500 flex items-center gap-1">
                <Briefcase size={9} /> {candidate.experience}
              </span>
            )}
            {candidate.currentLocation && (
              <span className="text-[10px] text-slate-500 flex items-center gap-1">
                <MapPin size={9} /> {candidate.currentLocation}
              </span>
            )}
            {candidate.noticePeriod && (
              <span className="text-[10px] text-slate-500 flex items-center gap-1">
                <Clock size={9} /> {candidate.noticePeriod} notice
              </span>
            )}
          </div>
        </div>

        {/* Score badge + stage badge */}
        <div className="flex flex-col items-end gap-2 flex-shrink-0">
          <span className={`px-2 py-0.5 rounded border text-[10px] font-bold ${sc.bg} ${sc.text}`}>
            {scoreLabel(score)}
          </span>
          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded border text-[10px] font-bold ${stageCfg.bg} ${stageCfg.color}`}>
            <StageIcon size={9} /> {candidate.stage || 'Applied'}
          </span>
        </div>

        {/* Navigation Indicator */}
        <div className="ml-2 flex-shrink-0 text-slate-500 hover:text-white transition-colors">
          <ArrowRight size={15} />
        </div>
      </div>
    </div>
  )
}

// ── Job Opening Card ───────────────────────────────────────────────────────
function JobCard({ mrf, activeTab, candidateCount, onPostJob, onViewCandidates, posting, onCloseJob, closing, isSelected }) {
  const URGENCY_COLOR = { 
    High: 'text-slate-200 bg-white/10 border border-white/20', 
    Medium: 'text-slate-300 bg-white/5 border border-white/10', 
    Low: 'text-slate-400 bg-white/5 border border-white/8' 
  }
  const urgCls = URGENCY_COLOR[mrf.levelOfUrgency] || URGENCY_COLOR.Medium

  const isAwaiting = activeTab === 'awaiting'
  const isActive = activeTab === 'active'
  const isClosed = activeTab === 'closed'
  const isFilled = activeTab === 'filled'

  let selectClass = ''
  if (isSelected) {
    if (isAwaiting) selectClass = 'card-selected'
    else if (isActive) selectClass = 'card-selected-live'
    else if (isClosed) selectClass = 'card-selected-closed'
    else if (isFilled) selectClass = 'card-selected-live'
  }

  const getFileUrl = (path) => {
    if (!path) return '';
    const serverUrl = import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL.replace('/api', '') : 'http://localhost:5000';
    return `${serverUrl}/${path}`;
  };

  return (
    <div 
      onClick={() => onViewCandidates(mrf)}
      className={`card card-interactive p-5 border flex flex-col justify-between h-full ${selectClass} ${
        isSelected ? '' : 'border-white/5 bg-ink-950/40'
      }`}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className={`px-1.5 py-0.5 text-[9px] font-bold rounded uppercase border ${
              mrf.requestType === 'JD' ? 'bg-blue-500/15 text-blue-400 border-blue-500/30' : 'bg-purple-500/15 text-purple-400 border-purple-500/30'
            }`}>{mrf.requestType === 'MRF' ? 'Requisition' : mrf.requestType || 'Requisition'}</span>
            <h3 className="font-semibold text-white text-[15px] truncate">{mrf.designation}</h3>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            <Building2 size={11} className="inline mr-1" />{mrf.department}
            {mrf.location && <><MapPin size={11} className="inline ml-2 mr-1 text-slate-500" />{mrf.location}</>}
          </p>
        </div>
        <div className="flex flex-col items-end gap-1 flex-shrink-0">
          {isAwaiting && (
            <span className="px-2 py-0.5 rounded border text-[10px] font-bold text-amber-400 bg-amber-500/10 border-amber-500/25">
              Awaiting Live Post
            </span>
          )}
          {isActive && (
            <span className="px-2 py-0.5 rounded border text-[10px] font-bold text-emerald-400 bg-emerald-500/10 border-emerald-500/25">
              ✓ Job Live
            </span>
          )}
          {isClosed && (
            <span className="px-2 py-0.5 rounded border text-[10px] font-bold text-red-400 bg-red-500/10 border-red-500/25">
              Closed
            </span>
          )}
          {isFilled && (
            <span className="px-2 py-0.5 rounded border text-[10px] font-bold text-emerald-400 bg-emerald-500/10 border-emerald-500/25">
              Fulfilled
            </span>
          )}
          <span className={`px-2 py-0.5 rounded border text-[10px] font-bold ${urgCls}`}>
            {mrf.levelOfUrgency || 'Medium'} Priority
          </span>
        </div>
      </div>

      {/* Meta Info Grid */}
      <div className="grid grid-cols-2 gap-2 text-xs text-slate-400 mt-3 pt-3 border-t border-white/5">
        <div><span>Vacancies:</span> <span className="text-white font-semibold ml-1">{mrf.noOfPositions || 1}</span></div>
        <div><span>Urgency:</span> <span className="text-white font-semibold ml-1">{mrf.levelOfUrgency || 'Medium'}</span></div>
        
        {isAwaiting && mrf.approvedAt && (
          <div className="col-span-2">
            <span>Approved On:</span> 
            <span className="text-white font-semibold ml-1">
              {new Date(mrf.approvedAt).toLocaleDateString('en-IN')}
            </span>
          </div>
        )}

        {(isClosed || isFilled) && mrf.closedAt && (
          <div className="col-span-2">
            <span>Closure Date:</span> 
            <span className="text-red-400 font-semibold ml-1">
              {new Date(mrf.closedAt).toLocaleDateString('en-IN')}
            </span>
          </div>
        )}

        {isFilled && mrf.offeredCandidateName && (
          <div className="col-span-2 mt-1 p-2 rounded bg-emerald-500/5 border border-emerald-500/10 text-xs">
            <div className="text-emerald-400 font-bold">Hired Candidate:</div>
            <div className="text-white font-medium">{mrf.offeredCandidateName}</div>
            {mrf.actualDOJ && (
              <div className="text-[10px] text-slate-400 mt-0.5">
                Joined Date: {new Date(mrf.actualDOJ).toLocaleDateString('en-IN')}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Attached Documents */}
      {(mrf.mrfFilePath || mrf.jdFilePath) && (
        <div className="flex gap-4 text-xs mt-3 pt-3 border-t border-white/5">
          {mrf.mrfFilePath && (
            <a 
              href={getFileUrl(mrf.mrfFilePath)} 
              target="_blank" 
              rel="noopener noreferrer" 
              onClick={(e) => e.stopPropagation()} 
              className="flex items-center gap-1 text-accent hover:underline font-semibold font-sans"
            >
              <FileText size={12} /> Requisition Doc
            </a>
          )}
          {mrf.jdFilePath && (
            <a 
              href={getFileUrl(mrf.jdFilePath)} 
              target="_blank" 
              rel="noopener noreferrer" 
              onClick={(e) => e.stopPropagation()} 
              className="flex items-center gap-1 text-accent hover:underline font-semibold font-sans"
            >
              <FileText size={12} /> JD Doc
            </a>
          )}
        </div>
      )}

      {/* Actions */}
      <div className="mt-auto pt-3 flex items-center gap-2">
        {isAwaiting && (
          <button 
            onClick={(e) => {
              e.stopPropagation();
              onPostJob(mrf._id);
            }} 
            disabled={posting === mrf._id}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 text-xs font-bold hover:bg-emerald-500 hover:text-white transition-all disabled:opacity-60 flex-1 justify-center shadow-glow-sm"
          >
            {posting === mrf._id ? <Loader2 size={12} className="animate-spin" /> : <ExternalLink size={12} />}
            Publish Live Job
          </button>
        )}

        {isActive && (
          <>
            <button 
              onClick={(e) => {
                e.stopPropagation();
                onViewCandidates(mrf);
              }}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold flex-1 justify-center transition-all ${
                isSelected 
                  ? 'bg-accent text-white border border-accent/20' 
                  : 'bg-accent/10 border border-accent/25 text-accent hover:bg-accent hover:text-white'
              }`}
            >
              <Users size={12} /> Candidates ({candidateCount})
            </button>
            <button 
              onClick={(e) => {
                e.stopPropagation();
                onCloseJob(mrf._id);
              }} 
              disabled={closing === mrf._id}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-red-500/10 border border-red-500/25 text-red-400 text-xs font-semibold hover:bg-red-500 hover:text-white transition-all disabled:opacity-60"
            >
              {closing === mrf._id ? <Loader2 size={12} className="animate-spin" /> : <XCircle size={12} />} Close
            </button>
          </>
        )}

        {(isClosed || isFilled) && (
          <button 
            onClick={(e) => {
              e.stopPropagation();
              onViewCandidates(mrf);
            }}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold flex-1 justify-center transition-all ${
              isSelected 
                ? 'bg-slate-700 text-white border border-slate-600' 
                : 'bg-white/5 border border-white/10 text-slate-300 hover:bg-white/15'
            }`}
          >
            <Users size={12} /> Candidates History ({candidateCount})
          </button>
        )}
      </div>
    </div>
  )
}

// ── Main HRManagerPage ─────────────────────────────────────────────────────
export default function HRManagerPage() {
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem('hr_user')) } catch { return null }
  })
  const [mrfs, setMrfs] = useState([])
  const [loading, setLoading] = useState(true)
  const [posting, setPosting] = useState(null)
  const [closing, setClosing] = useState(null)
  const [activeTab, setActiveTab] = useState('active') // 'awaiting' | 'active' | 'closed' | 'filled'

  const { jobId } = useParams()
  const navigate = useNavigate()

  // Candidate panel state
  const [selectedJob, setSelectedJob] = useState(null)
  const [candidates, setCandidates] = useState([])
  const [loadingCandidates, setLoadingCandidates] = useState(false)
  const [uploadingResumes, setUploadingResumes] = useState(false)
  const [candidateSearch, setCandidateSearch] = useState('')
  const [stageFilter, setStageFilter] = useState('All')
  const [showFilterMenu, setShowFilterMenu] = useState(false)

  // Modals
  const [schedulingCandidate, setSchedulingCandidate] = useState(null)
  const [editingCandidate, setEditingCandidate] = useState(null)

  const [toast, setToast] = useState(null)

  useEffect(() => { loadMRFs() }, [])

  const loadMRFs = async () => {
    setLoading(true)
    try {
      const all = await mrfApi.list()
      const approvedOnly = all.filter(m => m.mrfStatus === 'Approved')
      setMrfs(approvedOnly)
    } catch (e) { showToast('Failed to load data: ' + e.message, 'error') }
    finally { setLoading(false) }
  }

  const loadCandidates = useCallback(async (jobId) => {
    setLoadingCandidates(true)
    setCandidates([])
    try {
      const list = await candidateApi.listByJob(jobId)
      const sorted = [...(list || [])].sort((a, b) => (b.matchScore || b.score || 0) - (a.matchScore || a.score || 0))
      setCandidates(sorted)
    } catch (e) { showToast('Failed to load candidates: ' + e.message, 'error') }
    finally { setLoadingCandidates(false) }
  }, [])

  useEffect(() => {
    if (jobId) {
      if (mrfs.length > 0) {
        const found = mrfs.find(m => m._id === jobId)
        if (found) {
          setSelectedJob(found)
          loadCandidates(jobId)
        } else {
          mrfApi.get(jobId).then(data => {
            setSelectedJob(data)
            loadCandidates(jobId)
          }).catch(err => {
            showToast('Job opening not found: ' + err.message, 'error')
            navigate('/recruitment')
          })
        }
      } else {
        mrfApi.get(jobId).then(data => {
          setSelectedJob(data)
          loadCandidates(jobId)
        }).catch(err => {
          showToast('Job opening not found: ' + err.message, 'error')
          navigate('/recruitment')
        })
      }
    } else {
      setSelectedJob(null)
    }
  }, [jobId, mrfs])

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 4500)
  }

  const handlePostJob = async (id) => {
    setPosting(id)
    try {
      await mrfApi.createJob(id)
      showToast('Job posted successfully! Candidates can now apply. ✓')
      await loadMRFs()
    } catch (e) { showToast(e.message, 'error') }
    finally { setPosting(null) }
  }

  const handleCloseJob = async (id) => {
    if (!window.confirm('Are you sure you want to close this job opening? Candidates will no longer be able to apply.')) return;
    setClosing(id)
    try {
      await mrfApi.closeJob(id)
      showToast('Job opening closed successfully! ✓')
      await loadMRFs()
      
      // Toggle back to closed tab when closed
      setActiveTab('closed')
      navigate('/recruitment')
    } catch (e) { showToast(e.message, 'error') }
    finally { setClosing(null) }
  }

  const handleViewCandidates = (mrf) => {
    setCandidateSearch('')
    setStageFilter('All')
    navigate(`/recruitment/job/${mrf._id}`)
  }

  const handleResumeUpload = async (e) => {
    const files = Array.from(e.target.files)
    if (!files.length || !selectedJob) return
    setUploadingResumes(true)
    try {
      const result = await candidateApi.uploadResumes(selectedJob._id, files)
      showToast(`${files.length} resume(s) uploaded & scored successfully! ✓`)
      loadCandidates(selectedJob._id)
    } catch (e) { showToast('Upload failed: ' + e.message, 'error') }
    finally { setUploadingResumes(false); e.target.value = '' }
  }

  const handleSaveInterview = async (candidateId, data) => {
    try {
      await candidateApi.updateInterview(candidateId, data)
      showToast('Interview scheduled successfully! ✓')
      setSchedulingCandidate(null)
      loadCandidates(selectedJob._id)
    } catch (e) { showToast(e.message, 'error') }
  }

  const handleSaveCandidate = async (candidateId, data) => {
    try {
      await candidateApi.updateDetails(candidateId, data)
      showToast('Candidate details updated! ✓')
      setEditingCandidate(null)
      loadCandidates(selectedJob._id)
    } catch (e) { showToast(e.message, 'error') }
  }

  const handleStageChange = async (candidateId, stage) => {
    try {
      await candidateApi.updateDetails(candidateId, { stage })
      showToast(`Moved to ${stage} ✓`)
      loadCandidates(selectedJob._id)
      if (stage === 'Joined') {
        // If candidate joins, load MRFs again to fetch filled/fulfilled status
        loadMRFs()
      }
    } catch (e) { showToast(e.message, 'error') }
  }

  const handleTabChange = (tab) => {
    setActiveTab(tab)
    navigate('/recruitment')
  }

  // Segment job openings into the four status sections
  const awaitingJobs = mrfs.filter(m => m.positionStatus === 'Open' || (m.positionStatus !== 'In Progress' && m.positionStatus !== 'Closed'))
  const activeJobs   = mrfs.filter(m => m.positionStatus === 'In Progress')
  const closedJobs   = mrfs.filter(m => m.positionStatus === 'Closed' && m.requirementStatus !== 'Fulfilled')
  const filledJobs   = mrfs.filter(m => m.positionStatus === 'Closed' && m.requirementStatus === 'Fulfilled')

  const activeTabMRFs = 
    activeTab === 'awaiting' ? awaitingJobs :
    activeTab === 'active' ? activeJobs :
    activeTab === 'closed' ? closedJobs :
    filledJobs

  const getCandidateCount = (mrfId) =>
    selectedJob?._id === mrfId ? candidates.length : (mrfs.find(m => m._id === mrfId)?.candidateCount || 0)

  // Filter candidates for selected job
  const filteredCandidates = candidates
    .filter(c => stageFilter === 'All' || c.stage === stageFilter)
    .filter(c => {
      if (!candidateSearch.trim()) return true
      const q = candidateSearch.toLowerCase()
      return (c.name || '').toLowerCase().includes(q) ||
        (c.email || '').toLowerCase().includes(q) ||
        (c.currentDesignation || '').toLowerCase().includes(q) ||
        (c.skills || '').toLowerCase().includes(q)
    })

  // Pipeline stats for selected job
  const STAGE_COUNTS = Object.keys(STAGE_CONFIG).reduce((acc, s) => ({
    ...acc, [s]: candidates.filter(c => c.stage === s).length
  }), {})

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
      {schedulingCandidate && (
        <InterviewModal candidate={schedulingCandidate}
          onClose={() => setSchedulingCandidate(null)}
          onSave={handleSaveInterview} />
      )}
      {editingCandidate && (
        <EditCandidateModal candidate={editingCandidate}
          onClose={() => setEditingCandidate(null)}
          onSave={handleSaveCandidate} />
      )}      {loading ? (
        <div className="card p-24 flex items-center justify-center">
          <Loader2 size={24} className="animate-spin text-accent" />
        </div>
      ) : (
        <>
          {/* Summary KPIs as Tab Selectors */}
          {!selectedJob && (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 fade-up-1">
              {[
                { 
                  label: 'Awaiting Posting', 
                  value: awaitingJobs.length, 
                  color: 'text-amber-400', 
                  activeStyle: 'bg-amber-500/10 border-amber-500/50 shadow-[0_0_20px_rgba(245,166,35,0.15)] ring-1 ring-amber-500/20',
                  inactiveStyle: 'bg-amber-500/3 border-white/5 text-slate-400 hover:border-amber-500/20 hover:text-amber-300',
                  icon: Clock, 
                  tab: 'awaiting'
                },
                { 
                  label: 'Active Live Jobs', 
                  value: activeJobs.length, 
                  color: 'text-accent', 
                  activeStyle: 'bg-accent/10 border-accent/50 shadow-[0_0_20px_rgba(79,142,247,0.15)] ring-1 ring-accent/20',
                  inactiveStyle: 'bg-accent/3 border-white/5 text-slate-400 hover:border-accent/20 hover:text-accent',
                  icon: ExternalLink, 
                  tab: 'active'
                },
                { 
                  label: 'Closed Jobs', 
                  value: closedJobs.length, 
                  color: 'text-red-400', 
                  activeStyle: 'bg-red-500/10 border-red-500/50 shadow-[0_0_20px_rgba(239,68,68,0.15)] ring-1 ring-red-500/20',
                  inactiveStyle: 'bg-red-500/3 border-white/5 text-slate-400 hover:border-red-500/20 hover:text-red-300',
                  icon: XCircle, 
                  tab: 'closed'
                },
                { 
                  label: 'Filled Positions', 
                  value: filledJobs.length, 
                  color: 'text-emerald-400', 
                  activeStyle: 'bg-emerald-500/10 border-emerald-500/50 shadow-[0_0_20px_rgba(34,211,165,0.15)] ring-1 ring-emerald-500/20',
                  inactiveStyle: 'bg-emerald-500/3 border-white/5 text-slate-400 hover:border-emerald-500/20 hover:text-emerald-300',
                  icon: CheckCircle2, 
                  tab: 'filled'
                },
              ].map(({ label, value, color, activeStyle, inactiveStyle, icon: Icon, tab }) => {
                const isActive = activeTab === tab;
                return (
                  <div 
                    key={label} 
                    onClick={() => handleTabChange(tab)}
                    className={`kpi-card card p-5 border flex flex-col justify-between cursor-pointer transition-all duration-200 ${
                      isActive ? activeStyle : inactiveStyle
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <span className={`text-xs font-bold uppercase tracking-wider leading-snug ${isActive ? color : 'text-slate-500'}`}>{label}</span>
                      <Icon size={16} className={isActive ? color : 'text-slate-500'} />
                    </div>
                    <div className="flex items-baseline justify-between mt-4">
                      <p className={`font-display font-bold text-3xl ${isActive ? color : 'text-white'}`}>{value}</p>
                      <span className="text-[10px] font-semibold text-slate-500 hover:text-white transition-colors">Select Section →</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {selectedJob ? (
            // ── DEDICATED PIPELINE VIEW (FULL WIDTH) ──────────────────
            <div className="space-y-6 fade-up-3">
              <div className="flex justify-between items-center pb-3 border-b border-white/10 gap-4 relative z-50">
                <div className="flex items-start gap-3 min-w-0">
                  <button 
                    onClick={() => navigate('/recruitment')}
                    className="p-2 bg-white/5 border border-white/10 hover:bg-white/10 text-slate-300 hover:text-white rounded-xl transition-all flex items-center justify-center flex-shrink-0 mt-0.5"
                    title="Back to Job Openings"
                  >
                    <ArrowLeft size={16} />
                  </button>
                  <div className="min-w-0 flex flex-col gap-1.5 animate-fadeIn">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h2 className="font-display font-bold text-white text-base sm:text-lg truncate leading-none" title={selectedJob.designation}>
                        {selectedJob.designation}
                      </h2>
                      <span className={`px-1.5 py-0.5 text-[9px] font-bold rounded uppercase border flex-shrink-0 ${
                        selectedJob.requestType === 'JD' ? 'bg-blue-500/15 text-blue-400 border-blue-500/30' : 'bg-purple-500/15 text-purple-400 border-purple-500/30'
                      }`}>{selectedJob.requestType === 'MRF' ? 'Requisition' : selectedJob.requestType || 'Requisition'}</span>
                      {selectedJob.levelOfUrgency && (
                        <span className={`px-1.5 py-0.5 text-[9px] font-bold rounded border flex-shrink-0 ${
                          selectedJob.levelOfUrgency === 'High' ? 'text-red-400 bg-red-500/10 border-red-500/25' :
                          selectedJob.levelOfUrgency === 'Medium' ? 'text-amber-400 bg-amber-500/10 border-amber-500/25' :
                          'text-slate-400 bg-slate-400/10 border-slate-400/20'
                        }`}>{selectedJob.levelOfUrgency} Priority</span>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-slate-400">
                      {selectedJob.department && (
                        <span className="flex items-center gap-1"><Building2 size={11} className="text-slate-500" /> {selectedJob.department}</span>
                      )}
                      {selectedJob.location && (
                        <span className="flex items-center gap-1"><MapPin size={11} className="text-slate-500" /> {selectedJob.location}</span>
                      )}
                      {selectedJob.experience && (
                        <span className="flex items-center gap-1"><Clock size={11} className="text-slate-500" /> {selectedJob.experience}</span>
                      )}
                      {selectedJob.proposedSalary && (
                        <span className="flex items-center gap-1"><DollarSign size={11} className="text-slate-500" /> {selectedJob.proposedSalary}</span>
                      )}
                      <span>Vacancies: <strong className="text-white">{selectedJob.noOfPositions || 1}</strong></span>
                      {activeTab === 'active' && (
                        <span className="text-emerald-400 font-semibold flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> Active Live Job
                        </span>
                      )}
                      {activeTab === 'closed' && selectedJob.closedAt && (
                        <span className="text-red-400 font-semibold">
                          Closed: {new Date(selectedJob.closedAt).toLocaleDateString('en-IN')}
                        </span>
                      )}
                      {activeTab === 'filled' && selectedJob.offeredCandidateName && (
                        <span className="text-emerald-400 font-semibold">
                          Hired: {selectedJob.offeredCandidateName}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-shrink-0">
                  {activeTab !== 'awaiting' && (
                    <>
                      {/* Refresh button */}
                      <button 
                        onClick={() => loadCandidates(selectedJob._id)} 
                        disabled={loadingCandidates}
                        className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-slate-300 text-xs font-semibold hover:bg-white/10 transition-all"
                      >
                        <RefreshCw size={13} className={loadingCandidates ? 'animate-spin' : ''} />
                        <span className="hidden sm:inline">Refresh Candidates</span>
                      </button>

                      {/* Hamburger filter menu */}
                      <div className="relative">
                        <button
                          onClick={() => setShowFilterMenu(!showFilterMenu)}
                          className={`p-2 rounded-xl border transition-all flex items-center justify-center gap-1.5 text-xs font-semibold
                            ${showFilterMenu ? 'bg-accent border-accent text-white' : 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10'}`}
                          title="Filter Stages"
                        >
                          <Menu size={16} />
                          <span className="hidden sm:inline">
                            {stageFilter === 'All' ? 'All Candidates' : 'Approved by HOD'}
                          </span>
                        </button>

                        {showFilterMenu && (
                          <div className="absolute right-0 mt-2 w-48 rounded-xl bg-ink-900 border border-white/15 shadow-2xl z-50 overflow-hidden py-1">
                            <button
                              onClick={() => {
                                setStageFilter('All');
                                setShowFilterMenu(false);
                              }}
                              className={`w-full text-left px-4 py-2 text-xs font-semibold transition-colors flex items-center gap-2
                                ${stageFilter === 'All' ? 'text-accent bg-accent/10' : 'text-slate-300 hover:bg-white/5 hover:text-white'}`}
                            >
                              <Users size={12} /> All Candidates
                            </button>
                            <button
                              onClick={() => {
                                setStageFilter('Approved by HOD');
                                setShowFilterMenu(false);
                              }}
                              className={`w-full text-left px-4 py-2 text-xs font-semibold transition-colors flex items-center gap-2
                                ${stageFilter === 'Approved by HOD' ? 'text-accent bg-accent/10' : 'text-slate-300 hover:bg-white/5 hover:text-white'}`}
                            >
                              <CheckCircle2 size={12} /> Approved by HOD
                            </button>
                          </div>
                        )}
                      </div>
                    </>
                  )}
                </div>
              </div>

              {activeTab === 'awaiting' ? (
                  // Detailed Job information for approved MRFs waiting for post
                  <div className="space-y-6 animate-scaleUp">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-5">
                      <div>
                        <span className="px-2 py-1 rounded bg-amber-500/10 border border-amber-500/25 text-amber-400 text-[10px] font-bold uppercase tracking-wider">Awaiting Live Post</span>
                        <p className="text-xs text-slate-400 mt-2">
                          {selectedJob.department} · {selectedJob.location || '—'} · {selectedJob.noOfPositions || 1} vacancy(s)
                        </p>
                      </div>
                      <button 
                        onClick={() => handlePostJob(selectedJob._id)} 
                        disabled={posting === selectedJob._id}
                        className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-500 text-white font-bold text-sm hover:bg-emerald-600 active:scale-95 transition-all shadow-glow-sm flex-shrink-0"
                      >
                        {posting === selectedJob._id ? <Loader2 size={14} className="animate-spin" /> : <ExternalLink size={14} />}
                        Publish live Job Opening
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="p-4 rounded-xl bg-white/2 border border-white/5">
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Requirement Type</span>
                        <span className="text-sm text-white font-semibold mt-1 block">{selectedJob.reasonForRequest || 'New Position'}</span>
                      </div>
                      <div className="p-4 rounded-xl bg-white/2 border border-white/5">
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Level of Urgency</span>
                        <span className="text-sm text-white font-semibold mt-1 block">{selectedJob.levelOfUrgency || 'Medium'} Urgency</span>
                      </div>
                      <div className="p-4 rounded-xl bg-white/2 border border-white/5">
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Proposed Salary / CTC Range</span>
                        <span className="text-sm text-white font-semibold mt-1 block">{selectedJob.proposedSalary || 'Not specified'}</span>
                      </div>
                      <div className="p-4 rounded-xl bg-white/2 border border-white/5">
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Experience Required</span>
                        <span className="text-sm text-white font-semibold mt-1 block">{selectedJob.experience || 'Not specified'}</span>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="p-4 rounded-xl bg-white/2 border border-white/5">
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Key Skills & Qualifications</span>
                        <p className="text-xs text-slate-300 leading-relaxed">
                          <strong>Qualifications:</strong> {selectedJob.minimumQualification || '—'}<br/>
                          <strong>Key Skills:</strong> {selectedJob.otherKeySkills || '—'}
                        </p>
                      </div>
                      {selectedJob.justification && (
                        <div className="p-4 rounded-xl bg-white/2 border border-white/5">
                          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Justification</span>
                          <p className="text-xs text-slate-300 leading-relaxed whitespace-pre-wrap">{selectedJob.justification}</p>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  // Candidates Pipeline view for active/closed/filled jobs
                  <div className="space-y-6">
                    {/* Controls */}
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                      {/* Search */}
                      <div className="relative flex-1 max-w-sm">
                        <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                        <input 
                          value={candidateSearch} 
                          onChange={e => setCandidateSearch(e.target.value)}
                          placeholder="Search candidates..."
                          className="pl-8 pr-4 py-2 bg-white/5 border border-white/10 rounded-lg text-xs text-slate-300 placeholder-slate-600 focus:outline-none focus:border-accent/40 w-full" 
                        />
                      </div>
                      
                      {stageFilter === 'All' && activeTab === 'active' && (
                        <label className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-accent/15 border border-accent/20 text-accent text-xs font-semibold hover:bg-accent hover:text-white transition-all cursor-pointer shadow-glow-sm flex-shrink-0">
                          {uploadingResumes ? (
                            <Loader2 size={13} className="animate-spin text-accent" />
                          ) : (
                            <Upload size={13} />
                          )}
                          {uploadingResumes ? 'Processing Resumes...' : 'Bulk Upload Resumes'}
                          <input 
                            type="file" 
                            multiple 
                            accept=".pdf,.doc,.docx" 
                            onChange={handleResumeUpload} 
                            disabled={uploadingResumes} 
                            className="hidden" 
                          />
                        </label>
                      )}

                      <span className="text-xs text-slate-500 flex-shrink-0 sm:ml-auto">{filteredCandidates.length} candidate(s)</span>
                    </div>

                    {/* Candidate lists */}
                    {loadingCandidates ? (
                      <div className="p-20 flex items-center justify-center">
                        <Loader2 size={22} className="animate-spin text-accent" />
                      </div>
                    ) : filteredCandidates.length === 0 ? (
                      <div className="card p-16 flex flex-col items-center gap-4 text-center border border-white/5 bg-ink-950/40">
                        <Upload size={28} className="text-slate-500" />
                        <div>
                          <p className="text-white font-semibold text-sm">No candidates yet</p>
                          <p className="text-slate-500 text-xs mt-1">
                            {activeTab === 'active' 
                              ? 'Upload resumes above to get AI match scores, or wait for candidates to apply online.'
                              : 'No candidates in the archive for this position.'}
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <div className="flex items-center gap-4 px-4 text-[10px] font-bold text-slate-600 uppercase tracking-wider">
                          <div className="w-7">Rank</div>
                          <div className="w-12">Score</div>
                          <div className="flex-1">Candidate</div>
                          <div className="w-28 text-right">Match · Stage</div>
                          <div className="w-4" />
                        </div>

                        {filteredCandidates.map((candidate, idx) => (
                          <CandidateCard
                            key={candidate._id}
                            candidate={candidate}
                            rank={idx + 1}
                            onEdit={activeTab === 'active' ? setEditingCandidate : () => showToast('Cannot edit details of closed/filled job candidate', 'error')}
                            onSchedule={activeTab === 'active' ? setSchedulingCandidate : () => showToast('Cannot schedule interview for closed/filled job candidate', 'error')}
                            onStageChange={activeTab === 'active' ? handleStageChange : () => showToast('Cannot move stage of closed/filled job candidate', 'error')}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
          ) : (
            // ── GRID LIST VIEW ──────────────────────────────────────
            <div className="space-y-6 fade-up-3">
              <div className="flex items-center gap-2">
                <h2 className="font-display font-bold text-white text-base flex items-center gap-2">
                  {activeTab === 'awaiting' && <><Clock size={16} className="text-amber-400" /> Approved — Awaiting Job Posting</>}
                  {activeTab === 'active' && <><ExternalLink size={16} className="text-accent" /> Live Job Openings</>}
                  {activeTab === 'closed' && <><XCircle size={16} className="text-red-400" /> Closed Positions Archive</>}
                  {activeTab === 'filled' && <><CheckCircle2 size={16} className="text-emerald-400" /> Filled &amp; Fulfilled Positions</>}
                </h2>
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                  activeTab === 'awaiting' ? 'bg-amber-500/15 text-amber-400 border border-amber-500/25' :
                  activeTab === 'active' ? 'bg-accent/15 text-accent border border-accent/25' :
                  activeTab === 'closed' ? 'bg-red-500/15 text-red-400 border border-red-500/25' :
                  'bg-emerald-500/15 text-emerald-400 border border-emerald-500/25'
                }`}>
                  {activeTabMRFs.length} position(s)
                </span>
              </div>

              <p className="text-xs text-slate-500">
                {activeTab === 'awaiting' && 'Approved requisitions from HOD/Admin that are ready to be published. Click "Publish Live Job" or select one to view details and publish.'}
                {activeTab === 'closed' && 'Positions that were manually closed or cancelled. Click card to see full candidates and closure details.'}
                {activeTab === 'filled' && 'Positions that have been successfully filled. Hired candidate details and join dates are shown on the cards.'}
              </p>

              {activeTabMRFs.length === 0 ? (
                <div className="card p-20 flex flex-col items-center gap-4 text-center border border-white/5 bg-ink-950/40">
                  <CheckCircle2 size={30} className="text-slate-600" />
                  <div>
                    <p className="text-white font-semibold">No positions found</p>
                    <p className="text-slate-500 text-xs mt-1">
                      {activeTab === 'awaiting' && 'No approved Requisitions are currently awaiting live job posting.'}
                      {activeTab === 'active' && 'No active job openings are currently live.'}
                      {activeTab === 'closed' && 'No closed positions in the archive.'}
                      {activeTab === 'filled' && 'No filled positions yet.'}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 auto-rows-fr gap-4">
                  {activeTabMRFs.map(m => (
                    <JobCard 
                      key={m._id} 
                      mrf={m} 
                      activeTab={activeTab}
                      candidateCount={getCandidateCount(m._id)}
                      onPostJob={handlePostJob} 
                      posting={posting}
                      onViewCandidates={handleViewCandidates}
                      onCloseJob={handleCloseJob} 
                      closing={closing}
                      isSelected={false} 
                    />
                  ))}
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  )
}
