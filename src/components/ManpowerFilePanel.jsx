import React, { useState, useRef, useCallback, useEffect } from 'react'
import {
  Upload, FileText, FileImage, File, X, CheckCircle2,
  AlertCircle, RefreshCw, Trash2, Calendar, HardDrive,
  ChevronDown, Briefcase, GraduationCap, Zap, MapPin, Users,
} from 'lucide-react'
import {
  saveManpowerFile,
  getManpowerFile,
  clearManpowerFile,
  updateManpowerRequirements,
  formatSize,
  formatDate,
} from '../services/manpowerStore.js'
import { mrfApi } from '../services/api.js'

// ─── helpers ────────────────────────────────────────────────────────────────

const getFileIcon = (type = '', name = '') => {
  if (type.includes('pdf'))    return { icon: FileText, color: 'text-red-400',    bg: 'bg-red-400/10 border-red-400/20' }
  if (type.includes('image'))  return { icon: FileImage, color: 'text-blue-400',  bg: 'bg-blue-400/10 border-blue-400/20' }
  if (type.includes('word') || type.includes('document') || name.endsWith('.docx') || name.endsWith('.doc'))
                               return { icon: FileText, color: 'text-accent',     bg: 'bg-accent/10 border-accent/20' }
  return { icon: File, color: 'text-slate-400', bg: 'bg-slate-400/10 border-slate-400/20' }
}

const REQ_FIELDS = [
  { key: 'designation',          icon: Briefcase,      label: 'Designation / Role',      placeholder: 'e.g. Senior Engineer' },
  { key: 'department',           icon: Users,           label: 'Department',               placeholder: 'e.g. Engineering' },
  { key: 'location',             icon: MapPin,          label: 'Location',                 placeholder: 'e.g. Ahmedabad' },
  { key: 'experience',           icon: Briefcase,      label: 'Experience Required',      placeholder: 'e.g. 3–5 years' },
  { key: 'minimumQualification', icon: GraduationCap,  label: 'Minimum Qualification',    placeholder: 'e.g. B.E. / B.Tech', isSelect: true },
  { key: 'otherKeySkills',       icon: Zap,            label: 'Key Skills',               placeholder: 'e.g. React, Node.js, SQL' },
  { key: 'noOfPositions',        icon: Users,           label: 'No. of Positions',         placeholder: 'e.g. 3' },
]

const QUAL_OPTIONS = [
  '10th / SSC', '12th / HSC', 'Diploma', 'Graduate (Any)',
  'B.E. / B.Tech', 'MBA / PGDM', 'Post Graduate', 'Doctorate / PhD',
]

// ─── DropZone ────────────────────────────────────────────────────────────────

function DropZone({ onFile, compact = false, autoOpen = false }) {
  const [dragging, setDragging] = useState(false)
  const inputRef = useRef(null)
  const hasOpened = useRef(false)

  useEffect(() => {
    if (autoOpen && inputRef.current && !hasOpened.current) {
      hasOpened.current = true
      // Small timeout helps avoid React 18 Strict Mode double-invocation issues
      setTimeout(() => {
        inputRef.current?.click()
      }, 100)
    }
  }, [autoOpen])

  const handleFiles = (files) => {
    if (files[0]) onFile(files[0])
  }

  return (
    <div
      onDrop={(e) => { e.preventDefault(); setDragging(false); handleFiles(e.dataTransfer.files) }}
      onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
      onDragLeave={() => setDragging(false)}
      onClick={() => inputRef.current?.click()}
      className={`relative rounded-2xl border-2 border-dashed cursor-pointer flex flex-col items-center justify-center gap-3 text-center transition-all duration-200
        ${compact ? 'py-8 px-4' : 'py-14 px-6'}
        ${dragging
          ? 'border-accent bg-accent/8 scale-[1.01]'
          : 'border-white/15 bg-white/3 hover:border-accent/40 hover:bg-accent/5'
        }`}
    >
      <div className={`rounded-2xl flex items-center justify-center transition-all duration-200
        ${compact ? 'w-12 h-12' : 'w-14 h-14'}
        ${dragging ? 'bg-accent/20 border border-accent/40 shadow-glow' : 'bg-white/6 border border-white/10'}`}>
        <Upload size={compact ? 20 : 24} className={dragging ? 'text-accent' : 'text-slate-400'} />
      </div>
      <div>
        <p className="font-display font-semibold text-white text-sm">
          {dragging ? 'Drop the file here' : compact ? 'Upload Replacement' : 'Upload Manpower File'}
        </p>
        <p className="text-slate-500 text-xs mt-1">
          Drag & drop or <span className="text-accent">browse files</span>
        </p>
        <p className="text-slate-600 text-xs mt-0.5">PDF · Word · JPG · PNG</p>
      </div>
      <input
        ref={inputRef}
        type="file"
        accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.webp,.txt,.xlsx,.csv"
        className="hidden"
        onChange={(e) => { if (e.target.files[0]) { handleFiles(e.target.files); e.target.value = '' } }}
      />
    </div>
  )
}

// ─── RequirementsForm ─────────────────────────────────────────────────────────

function RequirementsForm({ initial, onSave, onCancel }) {
  const [form, setForm] = useState({
    designation: '', department: '', location: '', experience: '',
    minimumQualification: '', otherKeySkills: '', noOfPositions: '', urgency: 'Medium',
    purposeOfJob: '', preferredIndustries: '', ...initial,
  })

  const set = (key) => (e) => setForm(f => ({ ...f, [key]: e.target.value }))

  return (
    <div className="space-y-4">
      <p className="text-xs text-accent font-semibold uppercase tracking-widest mb-3">
        Confirm Requirements — these will be used for matching
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {REQ_FIELDS.map(({ key, icon: Icon, label, placeholder, isSelect }) => (
          <div key={key}>
            <label className="label flex items-center gap-1.5">
              <Icon size={11} className="text-accent/70" /> {label}
            </label>
            {isSelect ? (
              <div className="relative">
                <select className="field appearance-none pr-8" value={form[key]} onChange={set(key)}>
                  <option value="">Select…</option>
                  {QUAL_OPTIONS.map(q => <option key={q}>{q}</option>)}
                </select>
                <ChevronDown size={13} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
              </div>
            ) : (
              <input className="field text-xs" placeholder={placeholder} value={form[key]} onChange={set(key)} />
            )}
          </div>
        ))}
      </div>

      <div>
        <label className="label">Purpose / Summary of Role</label>
        <textarea className="field text-xs min-h-[60px] resize-none" placeholder="Brief description of the role…"
          value={form.purposeOfJob} onChange={set('purposeOfJob')} />
      </div>

      <div className="flex gap-3 justify-end pt-2">
        {onCancel && (
          <button type="button" onClick={onCancel} className="btn-ghost text-sm">Cancel</button>
        )}
        <button type="button" onClick={() => onSave(form)} className="btn-primary text-sm">
          <CheckCircle2 size={14} /> Save & Activate
        </button>
      </div>
    </div>
  )
}

// ─── Main export ──────────────────────────────────────────────────────────────

export default function ManpowerFilePanel({ onRequirementsChange, compact = false, initialFile = null }) {
  const [stored, setStored] = useState(null)       // persisted record
  const [phase, setPhase] = useState('idle')        // idle | confirm | replacing
  const [pendingFile, setPendingFile] = useState(null)
  const [parsing, setParsing] = useState(false)
  const [parsedRequirements, setParsedRequirements] = useState(null)
  const [parseError, setParseError] = useState(null)

  // Load on mount
  useEffect(() => {
    const rec = getManpowerFile()
    setStored(rec)
    if (rec) onRequirementsChange?.(rec.requirements)
  }, [])

  // ── File selected ─────────────────────────────────────────────
  const handleFile = useCallback(async (file) => {
    setPendingFile(file)
    setPhase('confirm')
    setParsing(true)
    setParseError(null)
    setParsedRequirements(null)
    try {
      const parsedData = await mrfApi.parseFile(file)
      setParsedRequirements(parsedData)
    } catch (err) {
      console.error('Failed to parse MRF file:', err)
      setParseError(err.message || 'Failed to parse file. Please fill out details manually.')
    } finally {
      setParsing(false)
    }
  }, [])

  // Auto-load initialFile if provided from parent bypass
  useEffect(() => {
    if (initialFile) {
      handleFile(initialFile)
    }
  }, [initialFile, handleFile])

  // ── Requirements confirmed ────────────────────────────────────
  const handleSave = useCallback((requirements) => {
    const file = pendingFile || { name: stored?.fileName, size: stored?.fileSize, type: stored?.fileType }
    const record = saveManpowerFile(file, requirements)
    setStored(record)
    setPhase('idle')
    setPendingFile(null)
    onRequirementsChange?.(record.requirements)
  }, [pendingFile, stored, onRequirementsChange])

  // ── Edit existing requirements ────────────────────────────────
  const handleEditRequirements = (requirements) => {
    const updated = updateManpowerRequirements(requirements)
    if (updated) {
      setStored(updated)
      onRequirementsChange?.(updated.requirements)
    }
    setPhase('idle')
  }

  // ── Clear ─────────────────────────────────────────────────────
  const handleClear = () => {
    clearManpowerFile()
    setStored(null)
    setPhase('idle')
    setPendingFile(null)
    onRequirementsChange?.(null)
  }

  const { icon: FileIcon, color: fileColor, bg: fileBg } = getFileIcon(stored?.fileType, stored?.fileName)

  // ══════════════════════════════════════════════════════════════
  //  PHASE: idle — no file stored
  // ══════════════════════════════════════════════════════════════
  if (!stored && phase === 'idle') {
    return (
      <div className="space-y-4 fade-up">
        <div className="flex items-start gap-3 px-4 py-3 rounded-xl bg-accent/8 border border-accent/20 text-sm text-slate-300">
          <AlertCircle size={16} className="text-accent mt-0.5 flex-shrink-0" />
          <span>
            Upload your manpower file <span className="text-white font-medium">once</span> — it will
            be saved and remain available across sessions. Upload a new file anytime to replace it automatically.
          </span>
        </div>
        <DropZone onFile={handleFile} compact={compact} autoOpen={true} />
      </div>
    )
  }

  // ══════════════════════════════════════════════════════════════
  //  PHASE: confirm — file selected, fill requirements
  // ══════════════════════════════════════════════════════════════
  if (phase === 'confirm') {
    return (
      <div className="space-y-5 fade-up">
        {/* File preview */}
        <div className="card p-4 flex items-center gap-3">
          <div className={`w-10 h-10 rounded-lg border flex items-center justify-center flex-shrink-0 ${fileBg || 'bg-slate-400/10 border-slate-400/20'}`}>
            <FileText size={18} className={fileColor || 'text-slate-400'} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-white truncate">{pendingFile?.name || stored?.fileName}</p>
            <p className="text-xs text-slate-500 mt-0.5">{formatSize(pendingFile?.size || stored?.fileSize)}</p>
          </div>
          <span className="badge bg-gold/15 text-gold border border-gold/25">
            <AlertCircle size={11} /> Confirm details
          </span>
        </div>

        {parsing ? (
          <div className="card p-8 flex flex-col items-center justify-center gap-3 text-center">
            <RefreshCw size={24} className="text-accent animate-spin" />
            <p className="text-slate-300 text-sm">Parsing manpower requirements document using AI...</p>
          </div>
        ) : (
          <div className="card p-5 space-y-4">
            {parseError && (
              <div className="flex items-start gap-2.5 px-4 py-3 rounded-xl bg-red-400/10 border border-red-400/20 text-xs text-red-300">
                <AlertCircle size={14} className="text-red-400 mt-0.5 flex-shrink-0" />
                <span>{parseError}</span>
              </div>
            )}
            <RequirementsForm
              key={JSON.stringify(parsedRequirements || {})}
              initial={parsedRequirements || stored?.requirements || {}}
              onSave={handleSave}
              onCancel={stored ? () => setPhase('idle') : null}
            />
          </div>
        )}
      </div>
    )
  }

  // ══════════════════════════════════════════════════════════════
  //  PHASE: idle — file stored, show info
  // ══════════════════════════════════════════════════════════════
  return (
    <div className="space-y-5 fade-up">

      {/* Active file banner */}
      <div className="card p-4 border-success/20 bg-success/5">
        <div className="flex items-start gap-3">
          <div className={`w-11 h-11 rounded-xl border flex items-center justify-center flex-shrink-0 ${fileBg}`}>
            <FileIcon size={20} className={fileColor} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <p className="text-sm font-semibold text-white truncate">{stored.fileName}</p>
              <span className="badge bg-success/15 text-success border border-success/25">
                <CheckCircle2 size={11} /> Active
              </span>
            </div>
            <div className="flex items-center gap-3 mt-1 text-xs text-slate-500">
              <span className="flex items-center gap-1"><HardDrive size={11} /> {formatSize(stored.fileSize)}</span>
              <span className="flex items-center gap-1"><Calendar size={11} /> {formatDate(stored.uploadedAt)}</span>
            </div>
          </div>
          <div className="flex gap-2 flex-shrink-0">
            <button
              onClick={() => setPhase('replacing')}
              title="Replace file"
              className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center hover:bg-accent/15 hover:border-accent/30 transition-colors text-slate-400 hover:text-accent"
            >
              <RefreshCw size={14} />
            </button>
            <button
              onClick={handleClear}
              title="Remove file"
              className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center hover:bg-red-400/15 hover:border-red-400/30 transition-colors text-slate-400 hover:text-red-400"
            >
              <Trash2 size={14} />
            </button>
          </div>
        </div>
      </div>

      {/* Replace zone */}
      {phase === 'replacing' && (
        <div className="space-y-3 fade-up">
          <p className="text-xs text-slate-400 px-1">Uploading a new file will <span className="text-white font-medium">replace</span> the current one.</p>
          <DropZone onFile={handleFile} compact />
          <button onClick={() => setPhase('idle')} className="btn-ghost text-xs w-full justify-center">
            Cancel replacement
          </button>
        </div>
      )}

      {/* Requirements summary */}
      {stored.requirements && (
        <div className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <p className="text-xs text-accent font-semibold uppercase tracking-widest">Confirmed Requirements</p>
            <button
              onClick={() => setPhase('confirm')}
              className="text-xs text-slate-400 hover:text-accent transition-colors flex items-center gap-1"
            >
              Edit
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {REQ_FIELDS.map(({ key, icon: Icon, label }) => {
              const val = stored.requirements[key]
              if (!val) return null
              return (
                <div key={key} className="flex items-start gap-2.5">
                  <div className="w-7 h-7 rounded-md bg-accent/10 border border-accent/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Icon size={12} className="text-accent/70" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 uppercase tracking-wide">{label}</p>
                    <p className="text-sm text-white font-medium mt-0.5">{val}</p>
                  </div>
                </div>
              )
            })}
          </div>
          {stored.requirements.purposeOfJob && (
            <div className="mt-4 pt-4 border-t border-white/8">
              <p className="text-xs text-slate-500 uppercase tracking-wide mb-1">Role Summary</p>
              <p className="text-sm text-slate-300">{stored.requirements.purposeOfJob}</p>
            </div>
          )}
        </div>
      )}

    </div>
  )
}
