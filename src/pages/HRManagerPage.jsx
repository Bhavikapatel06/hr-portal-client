import React, { useState, useEffect, useCallback } from 'react'
import {
  Briefcase, Users, Upload, ChevronDown, ChevronUp, Star,
  Edit3, Calendar, CheckCircle2, Clock, XCircle, AlertCircle,
  Loader2, ArrowRight, FileText, Plus, Phone, Mail, MapPin,
  GraduationCap, Building2, DollarSign, Award, Send, X,
  ExternalLink, RefreshCw, UserCheck, Search, Filter
} from 'lucide-react'
import { mrfApi, candidateApi } from '../services/api.js'

// ── Helpers ────────────────────────────────────────────────────────────────
const getFileUrl = (path) => {
  if (!path) return '';
  const serverUrl = import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL.replace('/api', '') : 'http://localhost:5000';
  return `${serverUrl}/${path}`;
};

const scoreColor = (s) => {
  if (s >= 80) return { text: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/30' }
  if (s >= 60) return { text: 'text-amber-400',   bg: 'bg-amber-500/10 border-amber-500/30' }
  return              { text: 'text-red-400',      bg: 'bg-red-500/10 border-red-500/30' }
}

const scoreLabel = (s) => {
  if (s >= 80) return 'Strong Match'
  if (s >= 60) return 'Good Match'
  if (s >= 40) return 'Partial Match'
  return 'Weak Match'
}

const STAGE_CONFIG = {
  'Applied':        { color: 'text-slate-400',   bg: 'bg-slate-400/10 border-slate-400/25',    icon: FileText },
  'Screening':      { color: 'text-cyan-400',    bg: 'bg-cyan-400/10 border-cyan-400/25',      icon: Search },
  'Interview':      { color: 'text-indigo-400',  bg: 'bg-indigo-400/10 border-indigo-400/25',  icon: Calendar },
  'Offer':          { color: 'text-amber-400',   bg: 'bg-amber-400/10 border-amber-400/25',    icon: Award },
  'Joined':         { color: 'text-emerald-400', bg: 'bg-emerald-400/10 border-emerald-400/25',icon: UserCheck },
  'Rejected':       { color: 'text-red-400',     bg: 'bg-red-400/10 border-red-400/25',        icon: XCircle },
}

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
          stroke={score >= 80 ? '#10b981' : score >= 60 ? '#f59e0b' : '#ef4444'}
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
    stage: candidate.stage || 'Applied',
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
              {Object.keys(STAGE_CONFIG).map(s => <option key={s}>{s}</option>)}
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

// ── Candidate Card (expandable) ────────────────────────────────────────────
function CandidateCard({ candidate, rank, onEdit, onSchedule, onStageChange }) {
  const [expanded, setExpanded] = useState(false)
  const score = candidate.matchScore || candidate.score || 0
  const sc = scoreColor(score)
  const stageCfg = STAGE_CONFIG[candidate.stage] || STAGE_CONFIG['Applied']
  const StageIcon = stageCfg.icon

  return (
    <div className={`border rounded-xl transition-all duration-200 overflow-hidden ${
      rank === 1 ? 'border-emerald-500/30 bg-emerald-500/3' :
      rank === 2 ? 'border-accent/20 bg-accent/3' :
      'border-white/8 bg-ink-950/40'
    }`}>
      {/* Collapsed Header — always visible */}
      <div
        className="flex items-center gap-4 p-4 cursor-pointer hover:bg-white/2 transition-colors select-none"
        onClick={() => setExpanded(e => !e)}
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

        {/* Expand toggle */}
        <div className="ml-2 flex-shrink-0 text-slate-500">
          {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </div>
      </div>

      {/* Expanded Detail View */}
      {expanded && (
        <div className="border-t border-white/8 p-5 bg-white/2 space-y-5">

          {/* Contact + Profile Info Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {[
              { icon: Mail,           label: 'Email',           value: candidate.email },
              { icon: Phone,          label: 'Phone',           value: candidate.phone },
              { icon: MapPin,         label: 'Location',        value: candidate.currentLocation },
              { icon: GraduationCap,  label: 'Qualification',   value: candidate.qualification },
              { icon: Briefcase,      label: 'Experience',      value: candidate.experience },
              { icon: Building2,      label: 'Current Company', value: candidate.currentOrganization },
              { icon: DollarSign,     label: 'Current CTC',     value: candidate.currentCTC ? `₹${Number(candidate.currentCTC).toLocaleString('en-IN')}` : null },
              { icon: DollarSign,     label: 'Expected CTC',    value: candidate.expectedCTC ? `₹${Number(candidate.expectedCTC).toLocaleString('en-IN')}` : null },
              { icon: Clock,          label: 'Notice Period',   value: candidate.noticePeriod },
            ].filter(f => f.value).map(({ icon: Icon, label, value }) => (
              <div key={label} className="space-y-0.5">
                <p className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider flex items-center gap-1">
                  <Icon size={9} /> {label}
                </p>
                <p className="text-xs text-white font-medium">{value}</p>
              </div>
            ))}
          </div>

          {/* Skills */}
          {candidate.skills && (
            <div className="space-y-2">
              <p className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider">Key Skills</p>
              <div className="flex flex-wrap gap-1.5">
                {String(candidate.skills).split(',').map(s => s.trim()).filter(Boolean).map(s => (
                  <span key={s} className="px-2 py-0.5 rounded-full bg-white/6 border border-white/10 text-xs text-slate-300">{s}</span>
                ))}
              </div>
            </div>
          )}

          {/* Match Breakdown */}
          {candidate.matchBreakdown && (
            <div className="space-y-2">
              <p className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider">AI Match Breakdown</p>
              <div className="space-y-1.5">
                {Object.entries(candidate.matchBreakdown).map(([k, v]) => (
                  <div key={k} className="flex items-center gap-3">
                    <span className="text-xs text-slate-500 w-28 capitalize flex-shrink-0">{k.replace(/_/g,' ')}</span>
                    <div className="flex-1 h-2 bg-white/5 rounded-full overflow-hidden">
                      <div className="h-full rounded-full transition-all duration-700"
                        style={{ width: `${v}%`, backgroundColor: v >= 80 ? '#10b981' : v >= 60 ? '#f59e0b' : '#ef4444' }} />
                    </div>
                    <span className="text-xs font-bold text-white w-8 text-right">{v}%</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Interview info if scheduled */}
          {candidate.interviewDate && (
            <div className="p-3 rounded-lg bg-indigo-500/8 border border-indigo-500/20 text-xs space-y-1">
              <p className="font-bold text-indigo-400 flex items-center gap-1.5">
                <Calendar size={12} /> Interview Scheduled
              </p>
              <div className="grid grid-cols-3 gap-3 text-slate-400 mt-1.5">
                <div><span className="text-slate-500">Date:</span> <span className="text-white font-semibold">{new Date(candidate.interviewDate).toLocaleDateString('en-IN')}</span></div>
                {candidate.interviewTime && <div><span className="text-slate-500">Time:</span> <span className="text-white font-semibold">{candidate.interviewTime}</span></div>}
                {candidate.interviewMode && <div><span className="text-slate-500">Mode:</span> <span className="text-white font-semibold">{candidate.interviewMode}</span></div>}
                {candidate.interviewerName && <div><span className="text-slate-500">Interviewer:</span> <span className="text-white font-semibold">{candidate.interviewerName}</span></div>}
                {candidate.interviewRound && <div><span className="text-slate-500">Round:</span> <span className="text-white font-semibold">{candidate.interviewRound}</span></div>}
                {candidate.interviewLocation && <div><span className="text-slate-500">Location:</span> <span className="text-white font-semibold">{candidate.interviewLocation}</span></div>}
              </div>
              {candidate.interviewNotes && (
                <p className="text-slate-400 mt-2 border-t border-white/5 pt-2">
                  <span className="font-semibold text-slate-300">Notes:</span> {candidate.interviewNotes}
                </p>
              )}
            </div>
          )}

          {/* HR Notes */}
          {candidate.hrNotes && (
            <div className="p-3 rounded-lg bg-white/3 border border-white/8 text-xs">
              <p className="text-slate-500 font-semibold mb-1">HR Notes</p>
              <p className="text-slate-300">{candidate.hrNotes}</p>
            </div>
          )}

          {/* Move Stage */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs text-slate-500 font-semibold">Move to:</span>
            {Object.keys(STAGE_CONFIG).filter(s => s !== candidate.stage).map(s => {
              const cfg = STAGE_CONFIG[s]
              return (
                <button key={s} onClick={() => onStageChange(candidate._id, s)}
                  className={`px-2.5 py-1 rounded-lg border text-[10px] font-bold transition-all hover:opacity-100 opacity-70 hover:scale-105 ${cfg.bg} ${cfg.color}`}>
                  → {s}
                </button>
              )
            })}
          </div>

          {/* Action buttons */}
          <div className="flex gap-2 flex-wrap pt-2 border-t border-white/8">
            <button onClick={() => onSchedule(candidate)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-indigo-500/10 border border-indigo-500/25 text-indigo-400 text-xs font-semibold hover:bg-indigo-500 hover:text-white transition-all">
              <Calendar size={12} /> Schedule Interview
            </button>
            <button onClick={() => onEdit(candidate)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-accent/10 border border-accent/25 text-accent text-xs font-semibold hover:bg-accent hover:text-white transition-all">
              <Edit3 size={12} /> Edit Details
            </button>
            {candidate.resumeUrl && (
              <a href={candidate.resumeUrl} target="_blank" rel="noreferrer"
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-slate-400 text-xs font-semibold hover:bg-white/10 hover:text-white transition-all">
                <FileText size={12} /> View Resume
              </a>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

// ── Job Opening Card ───────────────────────────────────────────────────────
function JobCard({ mrf, isPosted, candidateCount, onPostJob, onViewCandidates, posting }) {
  const URGENCY_COLOR = { High: 'text-red-400 bg-red-500/10 border-red-500/25', Medium: 'text-amber-400 bg-amber-500/10 border-amber-500/25', Low: 'text-slate-400 bg-slate-400/10 border-slate-400/20' }
  const urgCls = URGENCY_COLOR[mrf.levelOfUrgency] || URGENCY_COLOR.Medium

  return (
    <div className={`card p-5 border transition-all duration-200 hover:-translate-y-0.5 ${
      isPosted ? 'border-emerald-500/20 bg-emerald-500/2' : 'border-amber-500/15 bg-amber-500/2'
    }`}>
      {/* Header */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className={`px-1.5 py-0.5 text-[9px] font-bold rounded uppercase border ${
              mrf.requestType === 'JD' ? 'bg-blue-500/15 text-blue-400 border-blue-500/30' : 'bg-purple-500/15 text-purple-400 border-purple-500/30'
            }`}>{mrf.requestType || 'MRF'}</span>
            <h3 className="font-semibold text-white text-[15px] truncate">{mrf.designation}</h3>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            <Building2 size={10} className="inline mr-1" />{mrf.department}
            {mrf.location && <><MapPin size={10} className="inline ml-2 mr-1" />{mrf.location}</>}
          </p>
        </div>
        <div className="flex flex-col items-end gap-1 flex-shrink-0">
          {isPosted ? (
            <span className="px-2 py-0.5 rounded border text-[10px] font-bold text-emerald-400 bg-emerald-500/10 border-emerald-500/25">
              ✓ Job Live
            </span>
          ) : (
            <span className="px-2 py-0.5 rounded border text-[10px] font-bold text-amber-400 bg-amber-500/10 border-amber-500/25">
              Approved — Not Posted
            </span>
          )}
          <span className={`px-2 py-0.5 rounded border text-[10px] font-bold ${urgCls}`}>
            {mrf.levelOfUrgency || 'Medium'} Priority
          </span>
        </div>
      </div>

      {/* Meta */}
      <div className="grid grid-cols-3 gap-2 text-xs text-slate-500 mt-3 pt-3 border-t border-white/5">
        <div><span>Vacancies:</span> <span className="text-white font-semibold ml-1">{mrf.noOfPositions || 1}</span></div>
        <div><span>Type:</span> <span className="text-white font-semibold ml-1">{mrf.reasonForRequest || '—'}</span></div>
        {isPosted && <div className="flex items-center gap-1">
          <Users size={10} className="text-accent" />
          <span className="text-accent font-semibold">{candidateCount} applied</span>
        </div>}
      </div>

      {/* Attached Documents */}
      {(mrf.mrfFilePath || mrf.jdFilePath) && (
        <div className="flex gap-4 text-xs mt-3 pt-3 border-t border-white/5">
          {mrf.mrfFilePath && (
            <a href={getFileUrl(mrf.mrfFilePath)} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-accent hover:underline font-semibold font-sans">
              <FileText size={12} /> View MRF Document
            </a>
          )}
          {mrf.jdFilePath && (
            <a href={getFileUrl(mrf.jdFilePath)} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-accent hover:underline font-semibold font-sans">
              <FileText size={12} /> View JD Document
            </a>
          )}
        </div>
      )}

      {/* Actions */}
      <div className="mt-4 pt-3 border-t border-white/6 flex items-center gap-2">
        {!isPosted ? (
          <button onClick={() => onPostJob(mrf._id)} disabled={posting === mrf._id}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 text-xs font-semibold hover:bg-emerald-500 hover:text-white transition-all disabled:opacity-60 flex-1 justify-center">
            {posting === mrf._id ? <Loader2 size={12} className="animate-spin" /> : <ExternalLink size={12} />}
            Post as Job Opening
          </button>
        ) : (
          <button onClick={() => onViewCandidates(mrf)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-accent/10 border border-accent/25 text-accent text-xs font-semibold hover:bg-accent hover:text-white transition-all flex-1 justify-center">
            <Users size={12} /> View Candidates ({candidateCount})
          </button>
        )}
      </div>
    </div>
  )
}

// ── Main HRManagerPage ─────────────────────────────────────────────────────
export default function HRManagerPage() {
  const [mrfs, setMrfs] = useState([])
  const [loading, setLoading] = useState(true)
  const [posting, setPosting] = useState(null)

  // Candidate panel state
  const [selectedJob, setSelectedJob] = useState(null)
  const [candidates, setCandidates] = useState([])
  const [loadingCandidates, setLoadingCandidates] = useState(false)
  const [uploadingResumes, setUploadingResumes] = useState(false)
  const [candidateSearch, setCandidateSearch] = useState('')
  const [stageFilter, setStageFilter] = useState('All')

  // Modals
  const [schedulingCandidate, setSchedulingCandidate] = useState(null)
  const [editingCandidate, setEditingCandidate] = useState(null)

  const [toast, setToast] = useState(null)

  useEffect(() => { loadMRFs() }, [])

  const loadMRFs = async () => {
    setLoading(true)
    try {
      const all = await mrfApi.list()
      setMrfs(all.filter(m => m.mrfStatus === 'Approved'))
    } catch (e) { showToast('Failed to load data: ' + e.message, 'error') }
    finally { setLoading(false) }
  }

  const loadCandidates = useCallback(async (jobId) => {
    setLoadingCandidates(true)
    setCandidates([])
    try {
      const list = await candidateApi.listByJob(jobId)
      // Sort by matchScore descending (best first)
      const sorted = [...(list || [])].sort((a, b) => (b.matchScore || b.score || 0) - (a.matchScore || a.score || 0))
      setCandidates(sorted)
    } catch (e) { showToast('Failed to load candidates: ' + e.message, 'error') }
    finally { setLoadingCandidates(false) }
  }, [])

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 4500)
  }

  const handlePostJob = async (id) => {
    setPosting(id)
    try {
      await mrfApi.createJob(id)
      showToast('Job posted successfully! Candidates can now apply. ✓')
      loadMRFs()
    } catch (e) { showToast(e.message, 'error') }
    finally { setPosting(null) }
  }

  const handleViewCandidates = (mrf) => {
    setSelectedJob(mrf)
    setCandidateSearch('')
    setStageFilter('All')
    loadCandidates(mrf._id)
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
    } catch (e) { showToast(e.message, 'error') }
  }

  // Derived data — "posted" means HR clicked "Post as Job" (positionStatus = In Progress)
  const postedJobs   = mrfs.filter(m => m.positionStatus === 'In Progress')
  const unpostedJobs = mrfs.filter(m => m.positionStatus !== 'In Progress')

  // Per-job candidate count (we'd need a global call ideally; approximate from loaded data)
  const getCandidateCount = (mrfId) =>
    selectedJob?._id === mrfId ? candidates.length : (mrfs.find(m => m._id === mrfId)?.candidateCount || 0)

  // Filtered candidates
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
      )}

      {/* ── Page Header ─────────────────────────────────────────────── */}
      <div className="fade-up flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <span className="section-tag mb-2.5">
            <Briefcase size={11} /> HR Manager — Recruitment
          </span>
          <h1 className="font-display font-bold text-2xl sm:text-3xl text-white mt-1">
            {selectedJob ? (
              <span className="flex items-center gap-2">
                <button onClick={() => setSelectedJob(null)} className="text-slate-400 hover:text-white transition-colors text-base font-normal">
                  ← Job Openings
                </button>
                <span className="text-slate-600">/</span>
                {selectedJob.designation}
              </span>
            ) : 'Job Openings & Recruitment'}
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            {selectedJob
              ? `${selectedJob.department} · ${selectedJob.location || '—'} · ${selectedJob.noOfPositions || 1} position(s) · Approved MRF`
              : 'Post approved MRFs as job openings. Manage candidates, scores, interviews, and hiring pipeline.'}
          </p>
        </div>
        {selectedJob && (
          <button onClick={() => loadCandidates(selectedJob._id)} disabled={loadingCandidates}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-slate-300 text-xs font-semibold hover:bg-white/10 transition-all">
            <RefreshCw size={13} className={loadingCandidates ? 'animate-spin' : ''} /> Refresh
          </button>
        )}
      </div>

      {loading ? (
        <div className="card p-24 flex items-center justify-center">
          <Loader2 size={24} className="animate-spin text-accent" />
        </div>
      ) : selectedJob ? (
        // ── CANDIDATE PANEL VIEW ──────────────────────────────────────
        <div className="space-y-6">

          {/* Pipeline summary bar */}
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-3 fade-up-1">
            {Object.entries(STAGE_COUNTS).map(([stage, count]) => {
              const cfg = STAGE_CONFIG[stage]
              const Icon = cfg.icon
              return (
                <button key={stage} onClick={() => setStageFilter(stageFilter === stage ? 'All' : stage)}
                  className={`card p-3 border text-center transition-all hover:-translate-y-0.5 duration-150 cursor-pointer ${
                    stageFilter === stage ? `${cfg.bg} ${cfg.color}` : 'border-white/5 bg-ink-950/40 text-slate-500'
                  }`}>
                  <Icon size={14} className="mx-auto mb-1" />
                  <p className="text-lg font-bold">{count}</p>
                  <p className="text-[9px] font-bold uppercase tracking-wide">{stage}</p>
                </button>
              )
            })}
          </div>

          {/* Upload Resumes + Search Bar */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 fade-up-2">
            {/* Bulk upload */}
            <label className={`relative cursor-pointer flex items-center gap-2 px-4 py-2.5 rounded-xl border text-xs font-semibold transition-all flex-shrink-0
              ${uploadingResumes ? 'bg-accent/20 border-accent/30 text-accent cursor-not-allowed' : 'bg-accent/10 border-accent/25 text-accent hover:bg-accent hover:text-white'}`}>
              <input type="file" multiple accept=".pdf,.doc,.docx" onChange={handleResumeUpload}
                disabled={uploadingResumes} className="absolute inset-0 opacity-0 w-full h-full cursor-pointer" />
              {uploadingResumes ? <Loader2 size={13} className="animate-spin" /> : <Upload size={13} />}
              {uploadingResumes ? 'Uploading & Scoring...' : 'Upload Resumes (Bulk)'}
            </label>

            {/* Stage filter label */}
            {stageFilter !== 'All' && (
              <button onClick={() => setStageFilter('All')}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-accent/10 border border-accent/25 text-accent text-xs font-semibold">
                <Filter size={11} /> {stageFilter} <X size={11} />
              </button>
            )}

            {/* Search */}
            <div className="relative flex-1 max-w-sm ml-auto">
              <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input value={candidateSearch} onChange={e => setCandidateSearch(e.target.value)}
                placeholder="Search by name, email, skills..."
                className="pl-8 pr-4 py-2 bg-white/5 border border-white/10 rounded-lg text-xs text-slate-300 placeholder-slate-600 focus:outline-none focus:border-accent/40 w-full" />
            </div>
            <span className="text-xs text-slate-600 flex-shrink-0">{filteredCandidates.length} candidate(s)</span>
          </div>

          {/* Candidate list */}
          {loadingCandidates ? (
            <div className="card p-20 flex items-center justify-center">
              <Loader2 size={22} className="animate-spin text-accent" />
            </div>
          ) : filteredCandidates.length === 0 ? (
            <div className="card p-16 flex flex-col items-center gap-4 text-center border border-white/5 bg-ink-950/40">
              <Upload size={28} className="text-slate-500" />
              <div>
                <p className="text-white font-semibold text-sm">No candidates yet</p>
                <p className="text-slate-500 text-xs mt-1">
                  Upload resumes above to get AI match scores, or wait for candidates to apply online.
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-3 fade-up-3">
              {/* Column headers */}
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
                  onEdit={setEditingCandidate}
                  onSchedule={setSchedulingCandidate}
                  onStageChange={handleStageChange}
                />
              ))}
            </div>
          )}
        </div>

      ) : (
        // ── JOB OPENINGS LIST VIEW ────────────────────────────────────
        <>
          {/* Summary KPIs */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 fade-up-1">
            {[
              { label: 'Approved MRFs',    value: mrfs.length,        color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20', icon: CheckCircle2 },
              { label: 'Jobs Posted',       value: postedJobs.length,  color: 'text-accent',      bg: 'bg-accent/10 border-accent/20',           icon: ExternalLink },
              { label: 'Awaiting Posting',  value: unpostedJobs.length,color: 'text-amber-400',   bg: 'bg-amber-500/10 border-amber-500/20',     icon: Clock },
              { label: 'Total Vacancies',   value: mrfs.reduce((s,m) => s + (parseInt(m.noOfPositions)||0), 0), color: 'text-cyan-400', bg: 'bg-cyan-500/10 border-cyan-500/20', icon: Users },
            ].map(({ label, value, color, bg, icon: Icon }) => (
              <div key={label} className={`card p-5 border flex flex-col justify-between hover:-translate-y-0.5 transition-all duration-200 ${bg}`}>
                <div className="flex justify-between items-start">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider leading-snug">{label}</span>
                  <Icon size={15} className={color} />
                </div>
                <p className={`font-display font-bold text-3xl mt-4 ${color}`}>{value}</p>
              </div>
            ))}
          </div>

          {/* Pending Post Section */}
          {unpostedJobs.length > 0 && (
            <div className="space-y-3 fade-up-2">
              <div className="flex items-center gap-2">
                <h2 className="font-display font-bold text-white text-base flex items-center gap-2">
                  <Clock size={15} className="text-amber-400" /> Approved — Awaiting Job Posting
                </h2>
                <span className="px-2 py-0.5 rounded bg-amber-500/15 border border-amber-500/25 text-amber-400 text-[10px] font-bold">
                  {unpostedJobs.length} MRF(s)
                </span>
              </div>
              <p className="text-xs text-slate-500">These MRFs are approved by HR Admin. Post them as job openings so candidates can apply.</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {unpostedJobs.map(mrf => (
                  <JobCard key={mrf._id} mrf={mrf} isPosted={false}
                    candidateCount={0} onPostJob={handlePostJob} posting={posting}
                    onViewCandidates={handleViewCandidates} />
                ))}
              </div>
            </div>
          )}

          {/* Live Jobs Section */}
          {postedJobs.length > 0 && (
            <div className="space-y-3 fade-up-3">
              <div className="flex items-center gap-2">
                <h2 className="font-display font-bold text-white text-base flex items-center gap-2">
                  <ExternalLink size={15} className="text-emerald-400" /> Live Job Openings
                </h2>
                <span className="px-2 py-0.5 rounded bg-emerald-500/15 border border-emerald-500/25 text-emerald-400 text-[10px] font-bold">
                  {postedJobs.length} job(s) live
                </span>
              </div>
              <p className="text-xs text-slate-500">Active job openings visible to candidates. Click "View Candidates" to manage applicants.</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {postedJobs.map(mrf => (
                  <JobCard key={mrf._id} mrf={mrf} isPosted={true}
                    candidateCount={getCandidateCount(mrf._id)}
                    onPostJob={handlePostJob} posting={posting}
                    onViewCandidates={handleViewCandidates} />
                ))}
              </div>
            </div>
          )}

          {mrfs.length === 0 && (
            <div className="card p-20 flex flex-col items-center gap-4 text-center border border-white/5 bg-ink-950/40">
              <CheckCircle2 size={30} className="text-slate-600" />
              <div>
                <p className="text-white font-semibold">No approved MRFs yet</p>
                <p className="text-slate-500 text-xs mt-1">Approved MRFs from HR Admin will appear here for job posting.</p>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}
