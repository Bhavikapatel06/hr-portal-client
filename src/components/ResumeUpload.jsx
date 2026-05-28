import React, { useState, useRef, useCallback, useEffect } from 'react'
import {
  Upload, FileText, FileImage, File, X, CheckCircle2,
  Eye, AlertCircle, User, Mail, Phone, Briefcase, GraduationCap, Target,
} from 'lucide-react'
import { scoreCandidate, MATCH_COLORS } from '../utils/matchEngine.js'
import { saveCandidates, getCandidates } from '../services/manpowerStore.js'

// ─── Helpers ─────────────────────────────────────────────────────────────────

const formatSize = (bytes) => {
  if (bytes < 1024) return bytes + ' B'
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
}

const getFileIcon = (file) => {
  if (!file) return { icon: File, color: 'text-slate-400', bg: 'bg-slate-400/10 border-slate-400/20' }
  const t = file.type || ''
  if (t.includes('pdf'))  return { icon: FileText, color: 'text-red-400',  bg: 'bg-red-400/10 border-red-400/20' }
  if (t.includes('image')) return { icon: FileImage, color: 'text-blue-400', bg: 'bg-blue-400/10 border-blue-400/20' }
  if (t.includes('word') || t.includes('document') || (file.name || '').endsWith('.docx') || (file.name || '').endsWith('.doc'))
    return { icon: FileText, color: 'text-accent', bg: 'bg-accent/10 border-accent/20' }
  return { icon: File, color: 'text-slate-400', bg: 'bg-slate-400/10 border-slate-400/20' }
}

const MOCK_FIELDS = [
  { key: 'fullName',      icon: User,           label: 'Full Name',              placeholder: 'Enter candidate name…' },
  { key: 'email',         icon: Mail,           label: 'Email',                  placeholder: 'Enter email…' },
  { key: 'phone',         icon: Phone,          label: 'Phone',                  placeholder: 'Enter phone…' },
  { key: 'currentTitle',  icon: Briefcase,      label: 'Current / Last Title',   placeholder: 'e.g. Senior Engineer' },
  { key: 'totalExp',      icon: Briefcase,      label: 'Total Experience',       placeholder: 'e.g. 4 years' },
  { key: 'highestQual',   icon: GraduationCap,  label: 'Highest Qualification',  placeholder: 'e.g. B.Tech' },
]

// ─── Score badge ──────────────────────────────────────────────────────────────

function ScoreBadge({ score, level }) {
  if (score === undefined || score === null) return null
  const colors = MATCH_COLORS[level] || MATCH_COLORS.Low
  return (
    <span className={`badge ${colors.bg} ${colors.text} border ${colors.border} flex items-center gap-1`}>
      <Target size={10} /> {score}% · {level}
    </span>
  )
}

// ─── Candidate Card ───────────────────────────────────────────────────────────

function CandidateCard({ entry, onRemove, onUpdate, requirements }) {
  const { file, details, status, matchScore, matchLevel } = entry
  const { icon: Icon, color, bg } = getFileIcon(file)
  const [expanded, setExpanded] = useState(false)

  // Recompute score when details change
  const score = requirements
    ? scoreCandidate(details, requirements)
    : { score: null, matchLevel: null }

  const displayScore = matchScore
  const displayLevel = matchLevel

  return (
    <div className={`card overflow-hidden transition-all duration-200 ${expanded ? 'border-accent/30' : ''}`}>
      {/* File row */}
      <div className="flex items-center gap-3 p-4">
        <div className={`w-10 h-10 rounded-lg border flex items-center justify-center flex-shrink-0 ${bg}`}>
          <Icon size={18} className={color} />
        </div>

        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-white truncate">
            {details.fullName || file?.name || entry.fileName || 'Unknown'}
          </p>
          <p className="text-xs text-slate-500 mt-0.5">
            {file ? `${formatSize(file.size)} · ${file.type || 'Unknown type'}` : entry.fileName}
          </p>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0 flex-wrap justify-end">
          {status === 'parsed' && (
            <span className="badge bg-success/15 text-success border border-success/25">
              <CheckCircle2 size={11} /> Parsed
            </span>
          )}
          {status === 'pending' && (
            <span className="badge bg-gold/15 text-gold border border-gold/25">
              <AlertCircle size={11} /> Pending
            </span>
          )}

          {/* Match score badge */}
          <ScoreBadge score={displayScore} level={displayLevel} />

          <button onClick={() => setExpanded(e => !e)}
            className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 transition-colors text-slate-400 hover:text-white">
            <Eye size={14} />
          </button>

          <button onClick={() => onRemove(entry.id)}
            className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center hover:bg-danger/20 hover:border-danger/30 transition-colors text-slate-400 hover:text-danger">
            <X size={14} />
          </button>
        </div>
      </div>

      {/* Expanded detail entry */}
      {expanded && (
        <div className="border-t border-white/10 p-4 bg-ink-900/50">
          <p className="text-xs text-accent font-semibold uppercase tracking-widest mb-3">Candidate Details</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {MOCK_FIELDS.map(({ key, icon: FIcon, label, placeholder }) => (
              <div key={key}>
                <label className="label flex items-center gap-1.5">
                  <FIcon size={11} className="text-accent/70" /> {label}
                </label>
                <input
                  className="field text-xs"
                  placeholder={placeholder}
                  value={details[key] || ''}
                  onChange={e => onUpdate(entry.id, key, e.target.value)}
                />
              </div>
            ))}
          </div>

          {/* Notes */}
          <div className="mt-3">
            <label className="label">Skills / Notes / Remarks</label>
            <textarea
              className="field text-xs min-h-[60px] resize-none"
              placeholder="List skills, tools, or any notes — used for matching…"
              value={details.notes || ''}
              onChange={e => onUpdate(entry.id, 'notes', e.target.value)}
            />
          </div>

          {/* Live score preview */}
          {requirements && (
            <div className="mt-3 pt-3 border-t border-white/8 flex items-center gap-3">
              <Target size={14} className="text-accent flex-shrink-0" />
              <div className="flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs text-slate-400">Live match score:</span>
                  <ScoreBadge score={score.score} level={score.matchLevel} />
                </div>
                {score.breakdown && (
                  <p className="text-xs text-slate-600 mt-0.5">
                    Skills {score.breakdown.skills}% · Exp {score.breakdown.experience}% · Qual {score.breakdown.qualification}% · Title {score.breakdown.jobTitle}%
                  </p>
                )}
              </div>
              <p className="text-xs text-slate-600">Fill more fields to refine</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// ─── Main export ──────────────────────────────────────────────────────────────

let nextId = 1

export default function ResumeUpload({ onCandidatesChange, requirements }) {
  const [entries, setEntries] = useState([])
  const [dragging, setDragging] = useState(false)
  const inputRef = useRef(null)

  // Load persisted candidates on mount
  useEffect(() => {
    const stored = getCandidates()
    if (stored.length > 0) {
      const loaded = stored.map(c => ({ ...c, file: null }))
      const maxId = Math.max(...loaded.map(c => c.id), 0)
      nextId = maxId + 1
      setEntries(loaded)
      onCandidatesChange?.(loaded)
    }
  }, [])

  // Score + notify parent whenever entries or requirements change
  useEffect(() => {
    if (!entries.length) return
    const scored = entries.map(e => {
      const { score, matchLevel, breakdown } = scoreCandidate(e.details || {}, requirements || {})
      return { ...e, matchScore: score, matchLevel, matchBreakdown: breakdown }
    })
    // Persist
    saveCandidates(scored)
    onCandidatesChange?.(scored)
  }, [entries, requirements])

  const addFiles = useCallback((files) => {
    const newEntries = Array.from(files).map(file => ({
      id: nextId++,
      file,
      status: 'pending',
      details: {
        fullName: '', email: '', phone: '',
        currentTitle: '', totalExp: '', highestQual: '', notes: '',
        _fileName: file.name,
        _fileSize: file.size,
      },
    }))
    setEntries(prev => [...prev, ...newEntries])

    // Simulate auto-parse
    newEntries.forEach(entry => {
      setTimeout(() => {
        setEntries(prev => prev.map(e =>
          e.id === entry.id ? { ...e, status: 'parsed' } : e
        ))
      }, 1200 + Math.random() * 800)
    })
  }, [])

  const onDrop = useCallback((e) => {
    e.preventDefault(); setDragging(false)
    if (e.dataTransfer.files.length) addFiles(e.dataTransfer.files)
  }, [addFiles])

  const removeEntry = (id) => setEntries(prev => prev.filter(e => e.id !== id))

  const updateDetail = (id, key, value) =>
    setEntries(prev => prev.map(e =>
      e.id === id ? { ...e, details: { ...e.details, [key]: value } } : e
    ))

  const handleClearAll = () => {
    setEntries([])
    onCandidatesChange?.([])
  }

  const parsedCount = entries.filter(e => e.status === 'parsed').length
  const strongCount = entries.filter(e => e.matchLevel === 'Strong').length

  return (
    <div className="space-y-5 fade-up">

      {/* Manpower requirements notice */}
      {!requirements ? (
        <div className="flex items-start gap-3 px-4 py-3 rounded-xl bg-gold/8 border border-gold/20 text-sm text-slate-300">
          <AlertCircle size={16} className="text-gold mt-0.5 flex-shrink-0" />
          <span>
            No manpower file loaded. Upload one from the{' '}
            <span className="text-white font-medium">Manpower File</span> page for automatic matching.
          </span>
        </div>
      ) : (
        <div className="flex items-start gap-3 px-4 py-3 rounded-xl bg-success/8 border border-success/20 text-sm text-slate-300">
          <CheckCircle2 size={16} className="text-success mt-0.5 flex-shrink-0" />
          <span>
            Matching against: <span className="text-white font-medium">{requirements.designation || 'Role'}</span>
            {requirements.experience && <> · {requirements.experience} experience</>}
            {requirements.otherKeySkills && <> · Skills: {requirements.otherKeySkills}</>}
          </span>
        </div>
      )}

      {/* Drop zone */}
      <div
        onDrop={onDrop}
        onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
        onDragLeave={() => setDragging(false)}
        onClick={() => inputRef.current?.click()}
        className={`relative rounded-2xl border-2 border-dashed cursor-pointer
          flex flex-col items-center justify-center gap-3 p-10 text-center
          transition-all duration-200
          ${dragging
            ? 'border-accent bg-accent/8 scale-[1.01]'
            : 'border-white/15 bg-white/3 hover:border-accent/40 hover:bg-accent/4'
          }`}
      >
        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-200
          ${dragging ? 'bg-accent/20 border border-accent/40 shadow-glow' : 'bg-white/6 border border-white/12'}`}>
          <Upload size={24} className={dragging ? 'text-accent' : 'text-slate-400'} />
        </div>

        <div>
          <p className="font-display font-semibold text-white">
            {dragging ? 'Drop files here' : 'Upload Resumes'}
          </p>
          <p className="text-slate-500 text-sm mt-1">
            Drag & drop or <span className="text-accent">browse files</span>
          </p>
          <p className="text-slate-600 text-xs mt-1">PDF, Word, JPG, PNG supported</p>
        </div>

        <input
          ref={inputRef}
          type="file"
          multiple
          accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.webp"
          className="hidden"
          onChange={e => { if (e.target.files.length) { addFiles(e.target.files); e.target.value = '' } }}
        />
      </div>

      {/* Stats bar */}
      {entries.length > 0 && (
        <div className="flex items-center justify-between px-1 flex-wrap gap-2">
          <div className="flex items-center gap-4 text-sm flex-wrap gap-2">
            <span className="text-slate-400">
              <span className="text-white font-semibold">{entries.length}</span> resume{entries.length !== 1 ? 's' : ''} uploaded
            </span>
            <span className="text-slate-600">·</span>
            <span className="text-slate-400">
              <span className="text-success font-semibold">{parsedCount}</span> parsed
            </span>
            {requirements && strongCount > 0 && (
              <>
                <span className="text-slate-600">·</span>
                <span className="text-slate-400">
                  <span className="text-emerald-400 font-semibold">{strongCount}</span> strong match{strongCount !== 1 ? 'es' : ''}
                </span>
              </>
            )}
          </div>
          <button
            onClick={handleClearAll}
            className="text-xs text-slate-500 hover:text-danger transition-colors flex items-center gap-1"
          >
            <X size={12} /> Clear all
          </button>
        </div>
      )}

      {/* Candidate list */}
      {entries.length > 0 && (
        <div className="space-y-3">
          {entries.map(entry => (
            <CandidateCard
              key={entry.id}
              entry={entry}
              onRemove={removeEntry}
              onUpdate={updateDetail}
              requirements={requirements}
            />
          ))}
        </div>
      )}

      {/* Empty state */}
      {entries.length === 0 && (
        <div className="text-center py-6 text-slate-600 text-sm">
          No resumes uploaded yet. Drop files above to begin.
        </div>
      )}

    </div>
  )
}
