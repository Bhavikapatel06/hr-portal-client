import React, { useState, useEffect, useCallback, useRef } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import {
  ArrowLeft, ClipboardList, Upload, CheckCircle2, Target,
  FileText, FileImage, File as FileFallback, X, User, Mail,
  Phone, Briefcase, GraduationCap, Zap, Calendar, Clock,
  Video, MapPin, Star, ChevronDown, AlertCircle, Plus,
  CheckSquare, XSquare, PauseCircle, Circle, AlertTriangle,
  BarChart3, Pencil, Download,
} from 'lucide-react'

import MRFForm        from '../components/MRFForm.jsx'
import ManpowerFilePanel from '../components/ManpowerFilePanel.jsx'
import MatchResults   from '../components/MatchResults.jsx'
import { mrfApi, candidateApi } from '../services/api.js'
import { scoreCandidate, rankCandidates, MATCH_COLORS } from '../utils/matchEngine.js'

const extractRequirements = (mrf) => ({
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
})

// ─── Helpers ──────────────────────────────────────────────────────────────────

const fmtBytes = (b) => {
  if (!b) return ''
  if (b < 1024 * 1024) return (b / 1024).toFixed(0) + ' KB'
  return (b / (1024 * 1024)).toFixed(1) + ' MB'
}

const getFileIcon = (type = '', name = '') => {
  if (type.includes('pdf'))
    return { Icon: FileText,     color: 'text-red-400',   bg: 'bg-red-400/10 border-red-400/25' }
  if (type.includes('image'))
    return { Icon: FileImage,    color: 'text-blue-400',  bg: 'bg-blue-400/10 border-blue-400/25' }
  if (type.includes('word') || name.endsWith('.docx') || name.endsWith('.doc'))
    return { Icon: FileText,     color: 'text-accent',    bg: 'bg-accent/10 border-accent/25' }
  return   { Icon: FileFallback, color: 'text-slate-400', bg: 'bg-slate-400/10 border-slate-400/25' }
}

// Attempt to extract a human name from a filename
const guessName = (fileName = '') =>
  fileName
    .replace(/\.[^.]+$/, '')
    .replace(/[_\-\.]+/g, ' ')
    .replace(/\b(resume|cv|curriculum|vitae|final|new|updated)\b/gi, '')
    .trim()
    .split(' ')
    .filter(w => w.length > 1)
    .map(w => w[0].toUpperCase() + w.slice(1).toLowerCase())
    .join(' ')
    .trim() || fileName

const hasReqData = (r) => r && (r.designation || r.otherKeySkills || r.experience || r.minimumQualification)

let _nextId = Date.now()
const mkId = () => ++_nextId

const mkCandidate = (file) => ({
  id:          mkId(),
  file,
  parseStatus: 'pending',
  details: {
    fullName:     guessName(file.name),
    email:        '',
    phone:        '',
    currentTitle: '',
    totalExp:     '',
    highestQual:  '',
    skills:       '',
    notes:        '',
    _fileName:    file.name,
    _fileSize:    file.size,
  },
  matchScore:      null,
  matchLevel:      null,
  matchBreakdown:  {},
  overallStatus:   'new',     // 'new' | 'shortlisted' | 'rejected' | 'selected' | 'on_hold'
  interview: {
    scheduled: false,
    date:      '',
    time:      '',
    mode:      'online',      // 'online' | 'offline'
    type:      'Technical',   // 'Initial' | 'Technical' | 'HR' | 'Final'
    link:      '',
    venue:     '',
    notes:     '',
  },
  feedback: {
    given:     false,
    decision:  '',            // 'shortlisted' | 'selected' | 'rejected' | 'on_hold'
    rating:    0,
    notes:     '',
    decidedAt: '',
  },
})

// Re-score a single candidate against requirements
const rescore = (candidate, requirements) => {
  if (!requirements) return { ...candidate }
  const combined = { ...candidate.details, notes: `${candidate.details.skills || ''} ${candidate.details.notes || ''}` }
  const { score, matchLevel, breakdown } = scoreCandidate(combined, requirements)
  return { ...candidate, matchScore: score, matchLevel, matchBreakdown: breakdown }
}

// ─── Step Header ─────────────────────────────────────────────────────────────

function StepHeader({ num, title, status, badge }) {
  const cfg = {
    done:   { ring: 'bg-success/15 border-success/40 text-success',  text: 'text-white' },
    active: { ring: 'bg-accent/15  border-accent/40  text-accent',   text: 'text-white' },
    locked: { ring: 'bg-white/6    border-white/12   text-slate-600', text: 'text-slate-500' },
  }[status] || { ring: 'bg-white/6 border-white/12 text-slate-600', text: 'text-slate-500' }

  return (
    <div className="flex items-center gap-3 mb-5">
      <div className={`w-8 h-8 rounded-lg border flex items-center justify-center flex-shrink-0 font-bold text-sm ${cfg.ring}`}>
        {status === 'done' ? <CheckCircle2 size={15} /> : num}
      </div>
      <h2 className={`font-display font-semibold text-base tracking-wide ${cfg.text}`}>{title}</h2>
      {badge && (
        <span className="badge bg-accent/12 text-accent border border-accent/25 text-[11px]">{badge}</span>
      )}
      <div className="flex-1 h-px bg-white/8" />
    </div>
  )
}

// ─── STEP 1 — Manpower Requirements ──────────────────────────────────────────

function Step1({ requirements, confirmed, inputMode, setInputMode, onMrfSubmit, onFileReqs, onEdit }) {
  if (confirmed && requirements) {
    return (
      <div className="card p-4 border-l-2 border-l-success/50 bg-success/4 flex items-start gap-3 fade-up">
        <div className="w-9 h-9 rounded-xl bg-success/15 border border-success/30 flex items-center justify-center flex-shrink-0 mt-0.5">
          <CheckCircle2 size={17} className="text-success" />
        </div>
        <div className="flex-1 min-w-0 space-y-1">
          {requirements.designation && (
            <p className="text-sm font-semibold text-white">{requirements.designation}
              {requirements.department && <span className="text-slate-400 font-normal ml-2">· {requirements.department}</span>}
            </p>
          )}
          <div className="flex flex-wrap gap-x-4 gap-y-0.5 text-xs text-slate-400">
            {requirements.location           && <span>📍 {requirements.location}</span>}
            {requirements.experience         && <span>🕐 {requirements.experience}</span>}
            {requirements.minimumQualification && <span>🎓 {requirements.minimumQualification}</span>}
            {requirements.noOfPositions      && <span>👥 {requirements.noOfPositions} position{requirements.noOfPositions != 1 ? 's' : ''}</span>}
          </div>
          {requirements.otherKeySkills && (
            <p className="text-xs text-slate-500">Skills: {requirements.otherKeySkills}</p>
          )}
        </div>
        <button onClick={onEdit} className="flex items-center gap-1 text-xs text-slate-500 hover:text-accent transition-colors flex-shrink-0">
          <Pencil size={11} /> Edit
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-4 fade-up">
      {/* Mode toggle */}
      <div className="flex gap-2 flex-wrap">
        {[
          { id: 'fill', icon: ClipboardList, label: 'Fill MRF Form Manually' },
          { id: 'file', icon: Upload,        label: 'Upload MRF File' },
        ].map(({ id, icon: Icon, label }) => (
          <button
            key={id}
            onClick={() => setInputMode(id)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold border transition-all duration-150
              ${inputMode === id
                ? 'bg-accent text-white border-accent shadow-glow-sm'
                : 'bg-white/5 border-white/10 text-slate-400 hover:text-white hover:bg-white/8'
              }`}
          >
            <Icon size={14} /> {label}
          </button>
        ))}
      </div>

      {inputMode === 'fill' ? (
        <div className="card p-6">
          <MRFForm showModeToggle={false} onSubmitSuccess={onMrfSubmit} />
        </div>
      ) : (
        <div className="card p-6">
          <ManpowerFilePanel onRequirementsChange={onFileReqs} />
        </div>
      )}
    </div>
  )
}

// ─── STEP 2 — Resume Upload + Candidate Detail Entry ─────────────────────────

const DETAIL_FIELDS = [
  { key: 'fullName',        Icon: User,          label: 'Full Name',            ph: 'Candidate full name' },
  { key: 'email',           Icon: Mail,          label: 'Email',                ph: 'Email address' },
  { key: 'phone',           Icon: Phone,         label: 'Phone',                ph: 'Phone number' },
  { key: 'alternatePhone',  Icon: Phone,         label: 'Alternate Phone',      ph: 'Alternate contact number' },
  { key: 'currentTitle',    Icon: Briefcase,     label: 'Current / Last Title', ph: 'e.g. Software Engineer' },
  { key: 'totalExp',        Icon: Briefcase,     label: 'Experience',           ph: 'e.g. 4 years' },
  { key: 'highestQual',     Icon: GraduationCap, label: 'Qualification',        ph: 'e.g. B.Tech' },
  { key: 'skills',          Icon: Zap,           label: 'Key Skills',           ph: 'React, Node.js, SQL…' },
  { key: 'currentLocation', Icon: MapPin,        label: 'Current Location',     ph: 'e.g. Ahmedabad' },
  { key: 'currentCompany',  Icon: Briefcase,     label: 'Current Company',      ph: 'e.g. XYZ Pvt Ltd' },
  { key: 'currentCtc',      Icon: Zap,           label: 'Current CTC',          ph: 'e.g. 4.5 LPA' },
  { key: 'expectedCtc',     Icon: Zap,           label: 'Expected CTC',         ph: 'e.g. 6.5 LPA' },
  { key: 'noticePeriod',    Icon: Calendar,      label: 'Notice Period',        ph: 'e.g. 1 Month' },
  { key: 'reasonForChange', Icon: FileText,      label: 'Reason for Change',    ph: 'e.g. Better Growth' },
]

const STATUS_CFG = {
  new:         { label: 'New',         color: 'text-slate-400',   bg: 'bg-slate-400/10 border-slate-400/20' },
  shortlisted: { label: 'Shortlisted', color: 'text-accent',      bg: 'bg-accent/10 border-accent/20' },
  scheduled:   { label: 'Scheduled',   color: 'text-gold',        bg: 'bg-gold/10 border-gold/20' },
  selected:    { label: 'Selected ✓',  color: 'text-success',     bg: 'bg-success/10 border-success/20' },
  rejected:    { label: 'Rejected',    color: 'text-red-400',     bg: 'bg-red-400/10 border-red-400/20' },
  on_hold:     { label: 'On Hold',     color: 'text-gold',        bg: 'bg-gold/10 border-gold/20' },
}

function CandidateCard({ c, requirements, onUpdate, onRemove }) {
  const [expanded, setExpanded] = useState(false)
  const [editMode, setEditMode] = useState(false)
  const [localDetails, setLocalDetails] = useState(c.details || {})

  useEffect(() => {
    setLocalDetails(c.details || {})
  }, [c.details])

  const { Icon, color, bg } = getFileIcon(c.file?.type || '', c.details._fileName)
  const mc  = MATCH_COLORS[c.matchLevel] || MATCH_COLORS.Low
  const sc  = STATUS_CFG[c.overallStatus] || STATUS_CFG.new

  const updateDetail = (key, val) => {
    setLocalDetails(prev => ({ ...prev, [key]: val }))
  }

  const handleSave = () => {
    onUpdate(c.id, 'details', localDetails)
    setEditMode(false)
  }

  // Live re-score preview based on local edits
  const liveScore = requirements
    ? scoreCandidate({ ...localDetails, notes: `${localDetails.skills || ''} ${localDetails.notes || ''}` }, requirements)
    : null

  return (
    <div className={`card overflow-hidden transition-all duration-200 ${expanded ? 'border-accent/25' : ''}`}>
      {/* ─ Row ─ */}
      <div className="flex items-center gap-3 p-4">
        <div className={`w-10 h-10 rounded-xl border flex items-center justify-center flex-shrink-0 ${bg}`}>
          <Icon size={18} className={color} />
        </div>

        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-white truncate">
            {localDetails.fullName || localDetails._fileName}
          </p>
          <p className="text-xs text-slate-500 truncate mt-0.5">
            {localDetails._fileName} {localDetails._fileSize ? `· ${fmtBytes(localDetails._fileSize)}` : ''}
          </p>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0 flex-wrap justify-end">
          {/* Parse badge */}
          <span className={`badge border ${c.parseStatus === 'parsed' ? 'bg-success/12 text-success border-success/25' : 'bg-gold/12 text-gold border-gold/25'}`}>
            {c.parseStatus === 'parsed' ? <><CheckCircle2 size={10} /> Parsed</> : <><AlertCircle size={10} /> Pending</>}
          </span>

          {/* Match score */}
          {c.matchScore !== null && (
            <span className={`badge border ${mc.bg} ${mc.text} ${mc.border}`}>
              <Target size={10} /> {c.matchScore}%
            </span>
          )}

          {/* Overall status */}
          <span className={`badge border ${sc.bg} ${sc.color} hidden sm:inline-flex`}>{sc.label}</span>

          {/* Expand */}
          <button onClick={() => setExpanded(e => !e)}
            className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 transition-colors text-slate-400 hover:text-white">
            <ChevronDown size={13} className={`transition-transform duration-200 ${expanded ? 'rotate-180' : ''}`} />
          </button>

          {/* Remove */}
          <button onClick={() => onRemove(c.id)}
            className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center hover:bg-red-400/15 hover:border-red-400/25 transition-colors text-slate-400 hover:text-red-400">
            <X size={13} />
          </button>
        </div>
      </div>

      {/* ─ Expanded detail form ─ */}
      {expanded && (
        <div className="border-t border-white/8 p-5 bg-ink-900/50 space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-xs text-accent font-semibold uppercase tracking-widest">Candidate Details</p>
            {!editMode && (
              <p className="text-[10px] text-slate-500 italic">Double click any field to edit</p>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3" onDoubleClick={() => setEditMode(true)}>
            {DETAIL_FIELDS.map(({ key, Icon: FIcon, label, ph }) => (
              <div key={key}>
                <label className="label flex items-center gap-1.5">
                  <FIcon size={11} className="text-accent/60" /> {label}
                </label>
                {editMode ? (
                  <input
                    className="field text-xs"
                    placeholder={ph}
                    value={localDetails[key] || ''}
                    onChange={e => updateDetail(key, e.target.value)}
                  />
                ) : (
                  <div className="text-xs text-white bg-white/5 border border-transparent px-3 py-2 rounded-lg cursor-pointer hover:bg-white/10 select-none min-h-[34px] flex items-center">
                    {localDetails[key] || <span className="text-slate-500 italic">Not provided</span>}
                  </div>
                )}
              </div>
            ))}
          </div>

          <div onDoubleClick={() => setEditMode(true)}>
            <label className="label">Additional Notes</label>
            {editMode ? (
              <textarea
                className="field text-xs min-h-[60px] resize-none"
                placeholder="Any extra information, observations or remarks…"
                value={localDetails.notes || ''}
                onChange={e => updateDetail('notes', e.target.value)}
              />
            ) : (
              <div className="text-xs text-white bg-white/5 border border-transparent px-3 py-2 rounded-lg cursor-pointer hover:bg-white/10 select-none min-h-[60px]">
                {localDetails.notes || <span className="text-slate-500 italic">No additional notes</span>}
              </div>
            )}
          </div>

          {editMode && (
            <div className="pt-3 border-t border-white/8 flex justify-end gap-3">
              <button onClick={() => { setEditMode(false); setLocalDetails(c.details || {}) }} className="btn-ghost text-xs px-4 py-1.5">
                Cancel
              </button>
              <button onClick={handleSave} className="btn-primary text-xs px-4 py-1.5">
                <CheckCircle2 size={13} /> Save Details
              </button>
            </div>
          )}

          {/* Live match preview */}
          {liveScore && !editMode && (
            <div className="pt-3 border-t border-white/8 flex items-start gap-3">
              <BarChart3 size={14} className="text-accent flex-shrink-0 mt-0.5" />
              <div className="flex-1 space-y-1.5">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs text-slate-500">Match score:</span>
                  <span className={`badge border ${(MATCH_COLORS[liveScore.matchLevel] || MATCH_COLORS.Low).bg} ${(MATCH_COLORS[liveScore.matchLevel] || MATCH_COLORS.Low).text} ${(MATCH_COLORS[liveScore.matchLevel] || MATCH_COLORS.Low).border}`}>
                    {liveScore.score}% · {liveScore.matchLevel}
                  </span>
                </div>
                {liveScore.breakdown && (
                  <div className="grid grid-cols-4 gap-2">
                    {[
                      ['Skills', liveScore.breakdown.skills],
                      ['Exp',    liveScore.breakdown.experience],
                      ['Qual',   liveScore.breakdown.qualification],
                      ['Title',  liveScore.breakdown.jobTitle],
                    ].map(([lbl, val]) => (
                      <div key={lbl} className="text-center">
                        <div className="h-1 bg-white/8 rounded-full overflow-hidden mb-1">
                          <div className="h-full rounded-full bg-accent/60" style={{ width: `${val}%` }} />
                        </div>
                        <p className="text-[10px] text-slate-600">{lbl} {val}%</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function Step2({ candidates, requirements, onUpdate, onRemove, onClearAll }) {
  const parsed   = candidates.filter(c => c.parseStatus === 'parsed').length

  return (
    <div className="space-y-4 fade-up">
      {/* Stats bar */}
      {candidates.length > 0 && (
        <div className="flex items-center justify-between px-1 text-sm flex-wrap gap-2">
          <div className="flex items-center gap-4">
            <span className="text-slate-400"><span className="text-white font-semibold">{candidates.length}</span> uploaded</span>
            <span className="text-slate-400"><span className="text-success font-semibold">{parsed}</span> parsed</span>
            {requirements && (
              <span className="text-slate-400">
                <span className="text-emerald-400 font-semibold">{candidates.filter(c => c.matchLevel === 'Strong').length}</span> strong matches
              </span>
            )}
          </div>
          <button onClick={onClearAll} className="text-xs text-slate-500 hover:text-red-400 transition-colors flex items-center gap-1">
            <X size={11} /> Clear all
          </button>
        </div>
      )}

      {/* List */}
      {candidates.length > 0 ? (
        <div className="space-y-3">
          {candidates.map(c => (
            <CandidateCard key={c.id} c={c} requirements={requirements} onUpdate={onUpdate} onRemove={onRemove} />
          ))}
        </div>
      ) : (
        <p className="text-center text-slate-600 text-sm py-4">No resumes uploaded yet.</p>
      )}
    </div>
  )
}

// ─── STEP 4 — Interview Scheduling ───────────────────────────────────────────

const INTERVIEW_TYPES = ['Initial', 'Technical', 'HR', 'Final']

function InterviewCard({ c, requirements, onUpdate }) {
  const [open, setOpen] = useState(false)
  const mc = MATCH_COLORS[c.matchLevel] || MATCH_COLORS.Low

  const setIv = (key, val) => onUpdate(c.id, 'interview', { ...c.interview, [key]: val })

  const confirmSchedule = () => {
    if (!c.interview.date || !c.interview.time) return
    onUpdate(c.id, 'interview', { ...c.interview, scheduled: true })
    onUpdate(c.id, 'overallStatus', 'scheduled')

    const email = c.details.email || '';
    if (!email) {
      alert('Schedule updated successfully! (Note: No email address found for candidate, so email draft could not be generated)');
      return;
    }

    const jobTitle = requirements?.designation || 'the position';
    const candidateName = c.details.fullName || 'Candidate';
    const interviewType = c.interview.type;
    const date = c.interview.date;
    const time = c.interview.time;
    const mode = c.interview.mode;
    const location = mode === 'online' ? `Meeting Link: ${c.interview.link || 'TBA'}` : `Venue: ${c.interview.venue || 'TBA'}`;
    const notes = c.interview.notes ? `\\nAdditional Info: ${c.interview.notes}` : '';

    const subject = `Interview Schedule - ${jobTitle}`;
    const body = `Hi ${candidateName},

Congratulations! You have been scheduled for an interview for the position of ${jobTitle}.

Here are the details of your interview:
- Interview Type: ${interviewType}
- Date: ${date}
- Time: ${time}
- Mode: ${mode === 'online' ? 'Online' : 'In-Person'}
- ${location}${notes}

Please let us know if you have any questions or require to reschedule.

Best regards,
HR Team`;

    const mailtoUrl = `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.location.href = mailtoUrl;
  }

  return (
    <div className={`card overflow-hidden transition-all duration-200 ${c.interview.scheduled ? 'border-success/20 bg-success/3' : ''}`}>
      {/* Row */}
      <div className="flex items-center gap-3 p-4">
        <div className="w-9 h-9 rounded-full bg-accent/15 border border-accent/25 flex items-center justify-center text-accent font-bold text-sm flex-shrink-0">
          {(c.details.fullName || c.details._fileName || '?').charAt(0).toUpperCase()}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-white truncate">{c.details.fullName || c.details._fileName}</p>
          <p className="text-xs text-slate-500 mt-0.5">{c.details.currentTitle || '—'} {c.details.totalExp ? `· ${c.details.totalExp}` : ''}</p>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          {c.matchScore !== null && (
            <span className={`badge border ${mc.bg} ${mc.text} ${mc.border}`}>{c.matchScore}%</span>
          )}
          {c.interview.scheduled && (
            <span className="badge bg-success/12 text-success border border-success/25 hidden sm:inline-flex">
              <CheckCircle2 size={10} /> Scheduled
            </span>
          )}
          <button
            onClick={() => setOpen(o => !o)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all
              ${open ? 'bg-accent text-white border-accent' : 'bg-white/5 border-white/10 text-slate-400 hover:text-white hover:bg-white/10'}`}
          >
            <Calendar size={12} /> {c.interview.scheduled ? 'View / Edit' : 'Schedule'}
          </button>
        </div>
      </div>

      {/* Scheduled summary strip */}
      {c.interview.scheduled && !open && (
        <div className="px-4 pb-3 flex items-center gap-3 text-xs text-slate-400 flex-wrap gap-y-1">
          <span className="flex items-center gap-1"><Calendar size={11} /> {c.interview.date}</span>
          <span className="flex items-center gap-1"><Clock size={11} /> {c.interview.time}</span>
          <span className="flex items-center gap-1">
            {c.interview.mode === 'online' ? <Video size={11} /> : <MapPin size={11} />}
            {c.interview.mode === 'online' ? 'Online' : 'Offline'} · {c.interview.type}
          </span>
          {c.interview.link && <span className="text-accent truncate max-w-[200px]">{c.interview.link}</span>}
        </div>
      )}

      {/* Form */}
      {open && (
        <div className="border-t border-white/8 p-5 bg-ink-900/50 space-y-4">
          <p className="text-xs text-accent font-semibold uppercase tracking-widest">Schedule Interview</p>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label flex items-center gap-1.5"><Calendar size={11} className="text-accent/60" /> Date</label>
              <input type="date" className="field text-sm" value={c.interview.date} onChange={e => setIv('date', e.target.value)} />
            </div>
            <div>
              <label className="label flex items-center gap-1.5"><Clock size={11} className="text-accent/60" /> Time</label>
              <input type="time" className="field text-sm" value={c.interview.time} onChange={e => setIv('time', e.target.value)} />
            </div>
          </div>

          {/* Mode */}
          <div>
            <label className="label">Interview Mode</label>
            <div className="flex gap-2">
              {[
                { id: 'online',  Icon: Video,  label: 'Online' },
                { id: 'offline', Icon: MapPin, label: 'Offline / In-Person' },
              ].map(({ id, Icon, label }) => (
                <button key={id} type="button" onClick={() => setIv('mode', id)}
                  className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium border transition-all
                    ${c.interview.mode === id ? 'bg-accent/15 text-accent border-accent/35' : 'bg-white/5 border-white/10 text-slate-400 hover:bg-white/8'}`}>
                  <Icon size={14} /> {label}
                </button>
              ))}
            </div>
          </div>

          {/* Type */}
          <div>
            <label className="label">Interview Type</label>
            <div className="flex gap-2 flex-wrap">
              {INTERVIEW_TYPES.map(t => (
                <button key={t} type="button" onClick={() => setIv('type', t)}
                  className={`px-3 py-2 rounded-lg text-xs font-semibold border transition-all
                    ${c.interview.type === t ? 'bg-accent/15 text-accent border-accent/35' : 'bg-white/5 border-white/10 text-slate-400 hover:bg-white/10'}`}>
                  {t}
                </button>
              ))}
            </div>
          </div>

          {/* Link / Venue */}
          {c.interview.mode === 'online' ? (
            <div>
              <label className="label flex items-center gap-1.5"><Video size={11} className="text-accent/60" /> Meeting Link</label>
              <input className="field text-sm" placeholder="https://meet.google.com/…" value={c.interview.link} onChange={e => setIv('link', e.target.value)} />
            </div>
          ) : (
            <div>
              <label className="label flex items-center gap-1.5"><MapPin size={11} className="text-accent/60" /> Venue / Address</label>
              <input className="field text-sm" placeholder="Office address or meeting room" value={c.interview.venue} onChange={e => setIv('venue', e.target.value)} />
            </div>
          )}

          <div>
            <label className="label">Notes</label>
            <textarea className="field text-sm min-h-[54px] resize-none" placeholder="Topics to cover, preparation notes…"
              value={c.interview.notes} onChange={e => setIv('notes', e.target.value)} />
          </div>

          <div className="flex gap-3 pt-1">
            <button onClick={confirmSchedule} disabled={!c.interview.date || !c.interview.time}
              className={`btn-primary flex-1 justify-center ${(!c.interview.date || !c.interview.time) ? 'opacity-40 cursor-not-allowed' : ''}`}>
              <CheckCircle2 size={14} /> {c.interview.scheduled ? 'Update Schedule & Email' : 'Confirm Schedule & Email'}
            </button>
            <button onClick={() => setOpen(false)} className="btn-ghost">Done</button>
          </div>
        </div>
      )}
    </div>
  )
}

function Step4({ candidates, requirements, onUpdate }) {
  if (!candidates.length) {
    return (
      <div className="card p-8 text-center fade-up">
        <AlertCircle size={24} className="text-slate-600 mx-auto mb-2" />
        <p className="text-slate-600 text-sm">Upload resumes in Step 2 to schedule interviews.</p>
      </div>
    )
  }
  const scheduled = candidates.filter(c => c.interview.scheduled).length
  return (
    <div className="space-y-3 fade-up">
      {scheduled > 0 && (
        <p className="text-xs text-slate-500 px-1 flex items-center gap-1.5">
          <CheckCircle2 size={12} className="text-success" />
          {scheduled} of {candidates.length} interview{candidates.length !== 1 ? 's' : ''} scheduled
        </p>
      )}
      {candidates.map(c => <InterviewCard key={c.id} c={c} requirements={requirements} onUpdate={onUpdate} />)}
    </div>
  )
}

// ─── STEP 5 — Interview Feedback ─────────────────────────────────────────────

const DECISIONS = [
  { id: 'shortlisted', label: 'Shortlist', Icon: Circle,       color: 'text-accent',   bg: 'bg-accent/15 border-accent/35' },
  { id: 'selected',    label: 'Select',    Icon: CheckSquare,  color: 'text-success',  bg: 'bg-success/15 border-success/35' },
  { id: 'rejected',    label: 'Reject',    Icon: XSquare,      color: 'text-red-400',  bg: 'bg-red-400/15 border-red-400/35' },
  { id: 'on_hold',     label: 'On Hold',   Icon: PauseCircle,  color: 'text-gold',     bg: 'bg-gold/15 border-gold/35' },
]

function FeedbackCard({ c, onUpdate }) {
  const [open, setOpen] = useState(false)
  const mc  = MATCH_COLORS[c.matchLevel] || MATCH_COLORS.Low
  const dec = DECISIONS.find(d => d.id === c.feedback.decision)

  const setFb = (key, val) => onUpdate(c.id, 'feedback', { ...c.feedback, [key]: val })

  const save = () => {
    if (!c.feedback.decision) return
    onUpdate(c.id, 'feedback', { ...c.feedback, given: true, decidedAt: new Date().toISOString() })
    if (c.feedback.decision !== 'shortlisted') onUpdate(c.id, 'overallStatus', c.feedback.decision)
    setOpen(false)
  }

  return (
    <div className={`card overflow-hidden transition-all duration-200
      ${c.feedback.given
        ? c.feedback.decision === 'selected' ? 'border-success/25 bg-success/3'
        : c.feedback.decision === 'rejected' ? 'border-red-400/20 bg-red-400/3'
        : 'border-accent/20'
        : ''}`}>
      {/* Row */}
      <div className="flex items-center gap-3 p-4">
        <div className="w-9 h-9 rounded-full bg-accent/15 border border-accent/25 flex items-center justify-center text-accent font-bold text-sm flex-shrink-0">
          {(c.details.fullName || '?').charAt(0).toUpperCase()}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-white truncate">{c.details.fullName || c.details._fileName}</p>
          <div className="flex items-center gap-3 text-xs text-slate-500 mt-0.5 flex-wrap">
            {c.interview.date && <span className="flex items-center gap-1"><Calendar size={10} /> {c.interview.date}</span>}
            {c.interview.time && <span className="flex items-center gap-1"><Clock size={10} /> {c.interview.time}</span>}
            {c.interview.mode && (
              <span className="flex items-center gap-1 capitalize">
                {c.interview.mode === 'online' ? <Video size={10} /> : <MapPin size={10} />}
                {c.interview.mode} · {c.interview.type}
              </span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          {c.matchScore !== null && <span className={`badge border ${mc.bg} ${mc.text} ${mc.border}`}>{c.matchScore}%</span>}
          {c.feedback.given && dec && (
            <span className={`badge border ${dec.bg} ${dec.color}`}>{dec.label}</span>
          )}
          {c.feedback.rating > 0 && (
            <span className="text-gold flex items-center gap-0.5 text-xs">
              <Star size={11} className="fill-gold" /> {c.feedback.rating}/5
            </span>
          )}
          <button onClick={() => setOpen(o => !o)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all
              ${open ? 'bg-accent text-white border-accent' : 'bg-white/5 border-white/10 text-slate-400 hover:text-white hover:bg-white/10'}`}>
            <Star size={12} /> {c.feedback.given ? 'Update' : 'Add Feedback'}
          </button>
        </div>
      </div>

      {open && (
        <div className="border-t border-white/8 p-5 bg-ink-900/50 space-y-4">
          <p className="text-xs text-accent font-semibold uppercase tracking-widest">Interview Feedback</p>

          {/* Decision */}
          <div>
            <label className="label">Decision</label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {DECISIONS.map(({ id, label, Icon: DIcon, color, bg }) => (
                <button key={id} type="button" onClick={() => setFb('decision', id)}
                  className={`flex items-center justify-center gap-1.5 py-3 rounded-xl text-sm font-semibold border transition-all
                    ${c.feedback.decision === id ? `${bg} ${color}` : 'bg-white/5 border-white/10 text-slate-400 hover:bg-white/10'}`}>
                  <DIcon size={14} /> {label}
                </button>
              ))}
            </div>
          </div>

          {/* Star rating */}
          <div>
            <label className="label">Rating</label>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map(n => (
                <button key={n} type="button" onClick={() => setFb('rating', n)}
                  className={`w-9 h-9 flex items-center justify-center transition-all
                    ${n <= c.feedback.rating ? 'text-gold' : 'text-slate-600 hover:text-gold/50'}`}>
                  <Star size={22} className={n <= c.feedback.rating ? 'fill-gold' : ''} />
                </button>
              ))}
              {c.feedback.rating > 0 && (
                <span className="text-xs text-slate-500 self-center ml-1">{c.feedback.rating}/5</span>
              )}
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="label">Feedback Notes</label>
            <textarea className="field text-sm min-h-[80px] resize-none"
              placeholder="Strengths, weaknesses, overall impression, recommendation…"
              value={c.feedback.notes} onChange={e => setFb('notes', e.target.value)} />
          </div>

          <div className="flex gap-3">
            <button onClick={save} disabled={!c.feedback.decision}
              className={`btn-primary flex-1 justify-center ${!c.feedback.decision ? 'opacity-40 cursor-not-allowed' : ''}`}>
              <CheckCircle2 size={14} /> Save Feedback
            </button>
            <button onClick={() => setOpen(false)} className="btn-ghost">Close</button>
          </div>
        </div>
      )}
    </div>
  )
}

function Step5({ candidates, onUpdate }) {
  const scheduled = candidates.filter(c => c.interview.scheduled)
  if (!scheduled.length) {
    return (
      <div className="card p-8 text-center fade-up">
        <AlertCircle size={24} className="text-slate-600 mx-auto mb-2" />
        <p className="text-slate-600 text-sm">Schedule interviews in Step 4 to record feedback.</p>
      </div>
    )
  }
  const decided  = scheduled.filter(c => c.feedback.given).length
  const selected = scheduled.filter(c => c.feedback.decision === 'selected').length
  return (
    <div className="space-y-3 fade-up">
      <div className="flex items-center gap-4 text-xs px-1">
        <span className="text-slate-500"><span className="text-white font-semibold">{decided}</span> / {scheduled.length} feedback recorded</span>
        {selected > 0 && <span className="text-success font-semibold">🎉 {selected} candidate{selected !== 1 ? 's' : ''} selected!</span>}
      </div>
      {scheduled.map(c => <FeedbackCard key={c.id} c={c} onUpdate={onUpdate} />)}
    </div>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function ResumeTrackerPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const mrfId = searchParams.get('mrfId')

  // ── State ──────────────────────────────────────────────────────────────────
  const [inputMode,    setInputMode]    = useState('fill')
  const [reqConfirmed, setReqConfirmed] = useState(false)
  const [requirements, setRequirements] = useState(null)
  const [mrfTitle,     setMrfTitle]     = useState(null)
  const [candidates,   setCandidates]   = useState([])
  const [apiError,     setApiError]     = useState(null)

  // ── Load on mount ──────────────────────────────────────────────────────────
  useEffect(() => {
    if (!mrfId) {
      setRequirements(null)
      setReqConfirmed(false)
      setMrfTitle(null)
      setCandidates([])
      return
    }

    const loadData = async () => {
      try {
        const mrf = await mrfApi.get(mrfId)
        if (mrf) {
          const reqs = extractRequirements(mrf)
          setRequirements(reqs)
          setReqConfirmed(true)
          setMrfTitle(mrf.designation)
          
          // Load candidates for this job opening from backend
          const candidatesList = await candidateApi.listByJob(mrfId)
          setCandidates(candidatesList || [])
          setApiError(null)
        }
      } catch (err) {
        console.error('Failed to load job opening/candidates:', err)
        setApiError('Could not load requirements or candidates. Please check if backend server is running.')
      }
    }
    loadData()
  }, [mrfId])

  // ── Handlers ───────────────────────────────────────────────────────────────
  const handleMrfSubmit = useCallback(async (formData) => {
    try {
      const saved = await mrfApi.submit(formData)
      const reqs = extractRequirements(saved)
      setRequirements(reqs)
      setReqConfirmed(true)
      setMrfTitle(saved.designation)
      setSearchParams({ mrfId: saved._id })
      setApiError(null)
    } catch (err) {
      console.error('Failed to save manual MRF:', err)
      setApiError('Failed to save MRF. Make sure the Node/Express backend is running on port 5000 and MongoDB is active.')
      throw err;
    }
  }, [setSearchParams])

  const handleFileReqs = useCallback(async (reqs) => {
    if (reqs && hasReqData(reqs)) {
      try {
        const saved = await mrfApi.submit(reqs)
        const parsedReqs = extractRequirements(saved)
        setRequirements(parsedReqs)
        setReqConfirmed(true)
        setMrfTitle(saved.designation)
        setSearchParams({ mrfId: saved._id })
        setApiError(null)
      } catch (err) {
        console.error('Failed to save file-based MRF:', err)
        setApiError('Failed to save MRF. Make sure the Node/Express backend is running on port 5000 and MongoDB is active.')
        throw err;
      }
    }
  }, [setSearchParams])

  const handleAddFiles = useCallback(async (files) => {
    if (!mrfId) return
    try {
      const updatedCandidates = await candidateApi.uploadResumes(mrfId, Array.from(files))
      setCandidates(updatedCandidates)
      setApiError(null)
    } catch (err) {
      console.error('Failed to upload/parse resumes:', err)
      setApiError('Failed to upload resumes. Check if backend server is running and database is available.')
    }
  }, [mrfId])

  const handleUpdate = useCallback(async (id, field, value) => {
    try {
      let updatedCandidate;
      if (field === 'details') {
        updatedCandidate = await candidateApi.updateDetails(id, value);
      } else if (field === 'interview') {
        updatedCandidate = await candidateApi.updateInterview(id, value);
      } else if (field === 'feedback') {
        updatedCandidate = await candidateApi.saveFeedback(id, value);
      } else {
        return;
      }
      setCandidates(prev => prev.map(c => (c.id === id || c._id === id) ? updatedCandidate : c));
      setApiError(null)
    } catch (err) {
      console.error(`Failed to update candidate ${field}:`, err);
      setApiError(`Failed to update candidate details: ${err.message}`)
    }
  }, [])

  const handleRemove = useCallback(async (id) => {
    try {
      await candidateApi.delete(id);
      setCandidates(prev => prev.filter(c => c.id !== id && c._id !== id));
      setApiError(null)
    } catch (err) {
      console.error('Failed to delete candidate:', err);
      setApiError(`Failed to delete candidate: ${err.message}`)
    }
  }, [])

  const handleClearAll = useCallback(async () => {
    try {
      await Promise.all(candidates.map(c => candidateApi.delete(c._id || c.id)));
      setCandidates([]);
      setApiError(null)
    } catch (err) {
      console.error('Failed to clear candidates:', err);
      setApiError(`Failed to clear candidates: ${err.message}`)
    }
  }, [candidates])

  const handleDownloadExcel = useCallback(() => {
    if (!candidates.length) return;

    const headers = [
      'Sr No',
      'Candidate Name',
      'Contact No',
      'Alternet number',
      'Mail ID',
      'Current Opening',
      'Department',
      'Job Location',
      'Qualification',
      'Total Experience',
      'Current Location',
      'Current Company',
      'Current CTC',
      'Expected CTC',
      'Notice Period',
      'Reason For Change',
      'Candidate Status',
      'Remarks'
    ];

    const rows = candidates.map((c, index) => {
      const d = c.details || {};
      const statusMap = {
        new: 'New',
        shortlisted: 'Shortlisted',
        scheduled: 'Scheduled',
        selected: 'Selected',
        rejected: 'Rejected',
        on_hold: 'On Hold'
      };

      return [
        index + 1,
        d.fullName || '',
        d.phone || '',
        d.alternatePhone || '',
        d.email || '',
        requirements?.designation || '',
        requirements?.department || '',
        requirements?.location || '',
        d.highestQual || '',
        d.totalExp || '',
        d.currentLocation || '',
        d.currentCompany || '',
        d.currentCtc || '',
        d.expectedCtc || '',
        d.noticePeriod || '',
        d.reasonForChange || '',
        statusMap[c.overallStatus] || c.overallStatus || 'New',
        d.notes || ''
      ];
    });

    const csvContent = [
      headers.join(','),
      ...rows.map(row => 
        row.map(val => {
          const str = String(val).replace(/"/g, '""');
          return str.includes(',') || str.includes('\n') || str.includes('"') ? `"${str}"` : str;
        }).join(',')
      )
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `Candidate_Report_${requirements?.designation || 'Candidates'}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // Silently export directly to the local folder at Book1.csv
    if (mrfId) {
      candidateApi.exportLocal(mrfId).catch(err => console.error('Failed to write to local directory:', err));
    }
  }, [candidates, requirements, mrfId]);

  // ── Derived ────────────────────────────────────────────────────────────────
  const ranked        = [...candidates].sort((a, b) => (b.matchScore || 0) - (a.matchScore || 0))
  const scheduledCount = candidates.filter(c => c.interview.scheduled).length
  const selectedCount  = candidates.filter(c => c.feedback.decision === 'selected').length
  const strongCount    = candidates.filter(c => c.matchLevel === 'Strong').length

  const s1 = reqConfirmed                              ? 'done'   : 'active'
  const s2 = reqConfirmed ? (candidates.length > 0 ? 'done' : 'active') : 'locked'
  const s3 = candidates.length && requirements         ? 'active'  : 'locked'
  const s4 = candidates.length                         ? (scheduledCount ? 'done' : 'active') : 'locked'
  const s5 = scheduledCount                            ? (selectedCount  ? 'done' : 'active') : 'locked'

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">

      {apiError && (
        <div className="card p-4 border-l-2 border-l-red-400 bg-red-500/10 flex items-start gap-3 mb-6 fade-up">
          <AlertCircle className="text-red-400 mt-0.5 flex-shrink-0" size={16} />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-white">Server Connection Error</p>
            <p className="text-xs text-slate-400 mt-1">{apiError}</p>
          </div>
          <button onClick={() => setApiError(null)} className="text-xs text-slate-500 hover:text-white transition-colors">
            Dismiss
          </button>
        </div>
      )}

      {/* ── Header ─────────────────────────────────────────── */}
      <div className="fade-up mb-8">
        <Link to="/dashboard" className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-accent transition-colors mb-5">
          <ArrowLeft size={13} /> Back to All Openings
        </Link>

        <div className="flex items-start justify-between flex-wrap gap-4">
          <div>
            <span className="section-tag mb-3">
              <ClipboardList size={11} /> Resume Tracker
            </span>
            <h1 className="font-display font-bold text-2xl sm:text-3xl text-white mt-2">
              {mrfTitle || 'Candidate Pipeline'}
            </h1>
            <p className="text-slate-400 text-sm mt-1">
              Complete hiring workflow — MRF → Resumes → Matching → Interviews → Feedback
            </p>
          </div>

          {/* Pipeline counters */}
          {candidates.length > 0 && (
            <div className="flex items-center gap-2 flex-wrap text-xs">
              <span className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-slate-300">
                <span className="text-white font-bold">{candidates.length}</span> candidates
              </span>
              {strongCount > 0 && (
                <span className="px-3 py-1.5 rounded-lg bg-emerald-400/10 border border-emerald-400/25 text-emerald-400">
                  <span className="font-bold">{strongCount}</span> strong
                </span>
              )}
              {scheduledCount > 0 && (
                <span className="px-3 py-1.5 rounded-lg bg-accent/10 border border-accent/25 text-accent">
                  <span className="font-bold">{scheduledCount}</span> scheduled
                </span>
              )}
              {selectedCount > 0 && (
                <span className="px-3 py-1.5 rounded-lg bg-success/10 border border-success/25 text-success">
                  🎉 <span className="font-bold">{selectedCount}</span> selected
                </span>
              )}
              <button
                onClick={handleDownloadExcel}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-400/10 border border-emerald-400/25 text-emerald-400 font-semibold hover:bg-emerald-400 hover:text-white transition-all cursor-pointer"
              >
                <Download size={13} /> Export Excel
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ── Vertical step flow ─────────────────────────────── */}
      <div className="space-y-0">

        {/* STEP 1 */}
        <div className="pb-8 border-b border-white/8 fade-up-1">
          <StepHeader num="1" title="Manpower Requirements" status={s1}
            badge={reqConfirmed && requirements?.designation ? requirements.designation : null} />
          <Step1
            requirements={requirements}
            confirmed={reqConfirmed}
            inputMode={inputMode}
            setInputMode={setInputMode}
            onMrfSubmit={handleMrfSubmit}
            onFileReqs={handleFileReqs}
            onEdit={() => setReqConfirmed(false)}
          />
        </div>

        {/* STEP 2 */}
        <div className={`py-8 border-b border-white/8 fade-up-2 transition-opacity duration-300 ${!reqConfirmed ? 'opacity-40 pointer-events-none select-none' : ''}`}>
          <StepHeader num="2" title="Applied Candidates" status={s2}
            badge={candidates.length > 0 ? `${candidates.length} candidates` : null} />
          {!reqConfirmed ? (
            <div className="card p-8 text-center">
              <AlertTriangle size={22} className="text-slate-600 mx-auto mb-2" />
              <p className="text-slate-600 text-sm">Set manpower requirements in Step 1 first.</p>
            </div>
          ) : (
            <Step2
              candidates={candidates}
              requirements={requirements}
              onUpdate={handleUpdate}
              onRemove={handleRemove}
              onClearAll={handleClearAll}
            />
          )}
        </div>

        {/* STEP 3 */}
        <div className={`py-8 border-b border-white/8 fade-up-3 transition-opacity duration-300 ${!candidates.length ? 'opacity-40 pointer-events-none select-none' : ''}`}>
          <StepHeader num="3" title="Match Results" status={s3}
            badge={strongCount > 0 ? `${strongCount} strong match${strongCount !== 1 ? 'es' : ''}` : ranked.length > 0 ? `${ranked.length} ranked` : null} />
          {!candidates.length ? (
            <div className="card p-8 text-center">
              <AlertTriangle size={22} className="text-slate-600 mx-auto mb-2" />
              <p className="text-slate-600 text-sm">Upload resumes in Step 2 to see match results.</p>
            </div>
          ) : (
            <MatchResults candidates={ranked} requirements={requirements} />
          )}
        </div>

        {/* STEP 4 */}
        <div className={`py-8 border-b border-white/8 fade-up-3 transition-opacity duration-300 ${!candidates.length ? 'opacity-40 pointer-events-none select-none' : ''}`}>
          <StepHeader num="4" title="Interview Status / Schedule" status={s4}
            badge={scheduledCount > 0 ? `${scheduledCount} scheduled` : null} />
          <Step4 candidates={candidates} onUpdate={handleUpdate} />
        </div>

        {/* STEP 5 */}
        <div className={`pt-8 fade-up-4 transition-opacity duration-300 ${!scheduledCount ? 'opacity-40 pointer-events-none select-none' : ''}`}>
          <StepHeader num="5" title="Interview Feedback & Decision" status={s5}
            badge={selectedCount > 0 ? `${selectedCount} selected` : null} />
          <Step5 candidates={candidates} onUpdate={handleUpdate} />
        </div>

      </div>
    </div>
  )
}
