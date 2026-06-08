import React, { useState, useRef } from 'react'
import {
  ClipboardList, CheckCircle2, ChevronDown, Plus, X,
  Upload, FileText, FileImage, File, AlertCircle, Loader2, Sparkles,
  Eye, Edit3, MapPin, Briefcase, Users, GraduationCap, Zap, Building2,
  Calendar, Target, ArrowLeft
} from 'lucide-react'
import { mrfApi } from '../services/api.js'

// ─── Helpers ──────────────────────────────────────────────────────────────────

const INITIAL = {
  designation: '', department: '', function: '', reportsTo: '',
  location: '', experience: '', proposedSalaryMin: '', proposedSalaryMax: '',
  urgency: 'Medium', requestType: '', noOfPositions: '', replacementFor: '',
  justification: '', purposeOfJob: '', rolesAndResponsibilities: '',
  minimumQualification: '', preferredIndustries: '', otherKeySkills: '',
  itRequirements: '', genderPreference: 'Any', ageMin: '', ageMax: '',
}

const formatSize = (bytes) => {
  if (bytes < 1024) return bytes + ' B'
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
}

const getFileIcon = (file) => {
  const t = file.type
  if (t.includes('pdf'))
    return { icon: FileText, color: 'text-red-400', bg: 'bg-red-400/10 border-red-400/20' }
  if (t.includes('image'))
    return { icon: FileImage, color: 'text-blue-400', bg: 'bg-blue-400/10 border-blue-400/20' }
  if (t.includes('word') || t.includes('document') || file.name.endsWith('.docx') || file.name.endsWith('.doc'))
    return { icon: FileText, color: 'text-accent', bg: 'bg-accent/10 border-accent/20' }
  return { icon: File, color: 'text-slate-400', bg: 'bg-slate-400/10 border-slate-400/20' }
}

// ─── Sub-components ────────────────────────────────────────────────────────────

function Field({ label, children, required, className = '' }) {
  return (
    <div className={className}>
      <label className="label">
        {label}{required && <span className="text-danger ml-0.5">*</span>}
      </label>
      {children}
    </div>
  )
}

function SectionHeader({ num, title }) {
  return (
    <div className="flex items-center gap-3 mb-5">
      <div className="w-7 h-7 rounded-md bg-accent/15 border border-accent/25 flex items-center justify-center">
        <span className="text-accent text-xs font-bold font-mono">{num}</span>
      </div>
      <h3 className="font-display font-semibold text-white text-sm tracking-wide">{title}</h3>
      <div className="flex-1 h-px bg-white/10"></div>
    </div>
  )
}

// ─── Preview Row Helper ────────────────────────────────────────────────────────

function PreviewRow({ icon: Icon, label, value, color = 'text-accent', full = false }) {
  if (!value) return null
  return (
    <div className={`flex gap-3 py-3 border-b border-white/6 last:border-0 ${full ? 'col-span-2' : ''}`}>
      <div className="flex-shrink-0 mt-0.5">
        <Icon size={14} className={color} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs text-slate-500 mb-0.5">{label}</p>
        <p className="text-sm text-white leading-relaxed whitespace-pre-line">{value}</p>
      </div>
    </div>
  )
}

// ─── Preview Card ──────────────────────────────────────────────────────────────

function MRFPreview({ form, onEdit, onConfirm, submitting }) {
  const urgencyColor = form.urgency === 'High'
    ? 'bg-danger/15 text-danger border-danger/30'
    : form.urgency === 'Medium'
    ? 'bg-gold/15 text-gold border-gold/30'
    : 'bg-success/15 text-success border-success/30'

  const salary = form.proposedSalaryMin || form.proposedSalaryMax
    ? `${form.proposedSalaryMin ? '₹' + form.proposedSalaryMin : ''}${form.proposedSalaryMin && form.proposedSalaryMax ? ' – ' : ''}${form.proposedSalaryMax ? '₹' + form.proposedSalaryMax : ''} LPA`
    : null

  const ageRange = form.ageMin || form.ageMax
    ? `${form.ageMin || '?'} – ${form.ageMax || '?'} years`
    : null

  return (
    <div className="fade-up space-y-5">

      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-accent/15 border border-accent/25 flex items-center justify-center">
          <Eye size={16} className="text-accent" />
        </div>
        <div>
          <h2 className="font-display font-bold text-white text-lg">Preview Job Opening</h2>
          <p className="text-slate-500 text-xs">Review all details before confirming. Once confirmed, the job opening will be created.</p>
        </div>
      </div>

      {/* Main preview card */}
      <div className="card overflow-hidden">

        {/* Top banner */}
        <div className="bg-accent/8 border-b border-accent/15 px-6 py-4 flex items-start justify-between gap-4 flex-wrap">
          <div>
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <span className="section-tag text-[10px]">
                <Sparkles size={9} /> Job Opening Preview
              </span>
              <span className={`badge border text-[10px] ${urgencyColor}`}>
                {form.urgency} Priority
              </span>
              {form.requestType && (
                <span className="badge bg-white/8 text-slate-300 border border-white/10 text-[10px]">
                  {form.requestType}
                </span>
              )}
            </div>
            <h3 className="font-display font-bold text-xl text-white mt-1">
              {form.designation || '—'}
            </h3>
            <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2 text-xs text-slate-400">
              {form.department && (
                <span className="flex items-center gap-1">
                  <Building2 size={11} /> {form.department}
                </span>
              )}
              {form.location && (
                <span className="flex items-center gap-1">
                  <MapPin size={11} /> {form.location}
                </span>
              )}
              {form.experience && (
                <span className="flex items-center gap-1">
                  <Calendar size={11} /> {form.experience}
                </span>
              )}
              {form.noOfPositions && (
                <span className="flex items-center gap-1">
                  <Users size={11} /> {form.noOfPositions} position{form.noOfPositions > 1 ? 's' : ''}
                </span>
              )}
            </div>
          </div>
          {salary && (
            <div className="text-right flex-shrink-0">
              <p className="text-xs text-slate-500 uppercase tracking-wide">Proposed Salary</p>
              <p className="text-sm font-bold text-accent mt-0.5">{salary}</p>
            </div>
          )}
        </div>

        {/* Details grid */}
        <div className="p-6">

          {/* Section: Position */}
          <p className="text-xs text-accent font-semibold uppercase tracking-widest mb-3">Position Details</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8">
            <PreviewRow icon={Briefcase}     label="Reports To"           value={form.reportsTo} />
            <PreviewRow icon={Users}          label="No. of Positions"     value={form.noOfPositions} />
            <PreviewRow icon={Target}         label="Replacement For"      value={form.replacementFor} />
            <PreviewRow icon={Calendar}       label="Gender Preference"    value={form.genderPreference} />
            <PreviewRow icon={Calendar}       label="Age Range"            value={ageRange} />
            <PreviewRow icon={Zap}            label="IT Requirements"      value={form.itRequirements} />
          </div>

          {/* Section: Job Description */}
          {(form.purposeOfJob || form.rolesAndResponsibilities || form.justification) && (
            <>
              <div className="border-t border-white/8 mt-4 pt-4">
                <p className="text-xs text-teal-400 font-semibold uppercase tracking-widest mb-3">Job Description</p>
                <div className="space-y-0">
                  <PreviewRow icon={Target}     label="Purpose of Job"              value={form.purposeOfJob} color="text-teal-400" full />
                  <PreviewRow icon={ClipboardList} label="Roles & Responsibilities" value={form.rolesAndResponsibilities} color="text-teal-400" full />
                  <PreviewRow icon={AlertCircle}  label="Justification"             value={form.justification} color="text-teal-400" full />
                </div>
              </div>
            </>
          )}

          {/* Section: Qualifications & Skills */}
          {(form.minimumQualification || form.otherKeySkills || form.preferredIndustries) && (
            <>
              <div className="border-t border-white/8 mt-4 pt-4">
                <p className="text-xs text-emerald-400 font-semibold uppercase tracking-widest mb-3">Qualifications & Skills</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8">
                  <PreviewRow icon={GraduationCap} label="Minimum Qualification"   value={form.minimumQualification} color="text-emerald-400" />
                  <PreviewRow icon={Briefcase}      label="Preferred Industries"    value={form.preferredIndustries} color="text-emerald-400" />
                  <PreviewRow icon={Zap}            label="Key Skills Required"     value={form.otherKeySkills} color="text-emerald-400" full />
                </div>
              </div>
            </>
          )}

          {/* Skills tags */}
          {form.otherKeySkills && (
            <div className="mt-3 flex flex-wrap gap-2">
              {form.otherKeySkills.split(/[,;]/).map(s => s.trim()).filter(Boolean).map((skill, i) => (
                <span key={i} className="px-2 py-0.5 rounded-full bg-emerald-400/10 border border-emerald-400/20 text-emerald-300 text-xs">
                  {skill}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Warning note */}
      <div className="flex items-start gap-3 px-4 py-3 rounded-xl bg-gold/8 border border-gold/20">
        <AlertCircle size={15} className="text-gold mt-0.5 flex-shrink-0" />
        <p className="text-xs text-slate-300">
          Please review all details carefully. Once you click{' '}
          <span className="text-white font-semibold">Confirm & Create Job Opening</span>,
          the position will be published and candidates will be able to apply.
        </p>
      </div>

      {/* Action buttons */}
      <div className="flex items-center justify-between gap-4">
        <button
          type="button"
          onClick={onEdit}
          className="btn-ghost flex items-center gap-2"
        >
          <ArrowLeft size={15} />
          <Edit3 size={14} />
          Edit Details
        </button>

        <button
          type="button"
          onClick={onConfirm}
          disabled={submitting}
          className="btn-primary min-w-[240px] flex items-center justify-center gap-2"
        >
          {submitting
            ? <><Loader2 size={16} className="animate-spin" /> Creating Job Opening...</>
            : <><CheckCircle2 size={16} /> Confirm &amp; Create Job Opening</>
          }
        </button>
      </div>
    </div>
  )
}

// ─── Upload MRF File panel ────────────────────────────────────────────────────

function MRFUpload({ onParsed }) {
  const [draggingMrf, setDraggingMrf] = useState(false)
  const [draggingJd, setDraggingJd] = useState(false)
  const [mrfFile, setMrfFile] = useState(null)
  const [jdFile, setJdFile] = useState(null)
  const [parsing, setParsing]   = useState(false)
  const [error, setError]       = useState('')
  const mrfInputRef = useRef(null)
  const jdInputRef = useRef(null)

  const onDropMrf = (e) => {
    e.preventDefault(); setDraggingMrf(false)
    const f = e.dataTransfer.files[0]
    if (f) { setMrfFile(f); setError('') }
  }

  const onDropJd = (e) => {
    e.preventDefault(); setDraggingJd(false)
    const f = e.dataTransfer.files[0]
    if (f) { setJdFile(f); setError('') }
  }

  const handleParse = async () => {
    if (!mrfFile && !jdFile) return
    setParsing(true)
    setError('')
    try {
      let combinedParsed = {}
      if (mrfFile) {
        combinedParsed = await mrfApi.parseFile(mrfFile)
      }
      if (jdFile) {
        const jdParsed = await mrfApi.parseFile(jdFile)
        // Merge JD data into MRF data
        for (const key of Object.keys(jdParsed)) {
          if (jdParsed[key]) {
            if (combinedParsed[key] && key === 'rolesAndResponsibilities') {
              combinedParsed[key] = combinedParsed[key] + '\n\n' + jdParsed[key]
            } else if (combinedParsed[key] && key === 'otherKeySkills') {
              combinedParsed[key] = combinedParsed[key] + ', ' + jdParsed[key]
            } else if (!combinedParsed[key]) {
              combinedParsed[key] = jdParsed[key]
            }
          }
        }
      }
      onParsed && onParsed(combinedParsed)
    } catch (err) {
      setError(err.message || 'Failed to parse file(s). Please fill the form manually.')
    } finally {
      setParsing(false)
    }
  }

  return (
    <div className="space-y-5 fade-up">
      <div className="flex items-start gap-3 px-4 py-3 rounded-xl bg-accent/8 border border-accent/20 text-sm text-slate-300">
        <Sparkles size={16} className="text-accent mt-0.5 flex-shrink-0" />
        <span>
          Upload a filled MRF PDF and/or Job Description (JD) — our AI will extract the fields and prefill the form for you.
          You can then review, correct, and submit.
          <span className="text-white font-medium"> PDF, Word (.doc/.docx)</span> supported.
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* MRF Dropzone */}
        <div
          onDrop={onDropMrf}
          onDragOver={(e) => { e.preventDefault(); setDraggingMrf(true) }}
          onDragLeave={() => setDraggingMrf(false)}
          onClick={() => !parsing && mrfInputRef.current?.click()}
          className={`relative rounded-2xl border-2 border-dashed
            flex flex-col items-center justify-center gap-3 py-10 px-6 text-center
            transition-all duration-200
            ${parsing ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'}
            ${draggingMrf
              ? 'border-accent bg-accent/8 scale-[1.01]'
              : 'border-white/15 bg-white/3 hover:border-accent/40 hover:bg-accent/5'
            }`}
        >
          {parsing ? (
            <>
              <Loader2 size={32} className="text-accent animate-spin" />
              <p className="font-semibold text-white">Analyzing MRF…</p>
            </>
          ) : (
            <>
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-200
                ${draggingMrf ? 'bg-accent/20 border border-accent/40 shadow-glow' : 'bg-white/6 border border-white/10'}`}>
                <Upload size={20} className={draggingMrf ? 'text-accent' : 'text-slate-400'} />
              </div>
              <div>
                <p className="font-display font-semibold text-white">
                  {mrfFile ? mrfFile.name : (draggingMrf ? 'Drop MRF here' : 'Upload MRF File')}
                </p>
                <p className="text-slate-500 text-sm mt-1">
                  {mrfFile ? formatSize(mrfFile.size) : <>Required form</>}
                </p>
              </div>
            </>
          )}
          <input
            ref={mrfInputRef}
            type="file"
            accept=".pdf,.doc,.docx"
            className="hidden"
            onChange={(e) => {
              if (e.target.files[0]) { setMrfFile(e.target.files[0]); setError('') }
              e.target.value = ''
            }}
          />
        </div>

        {/* JD Dropzone */}
        <div
          onDrop={onDropJd}
          onDragOver={(e) => { e.preventDefault(); setDraggingJd(true) }}
          onDragLeave={() => setDraggingJd(false)}
          onClick={() => !parsing && jdInputRef.current?.click()}
          className={`relative rounded-2xl border-2 border-dashed
            flex flex-col items-center justify-center gap-3 py-10 px-6 text-center
            transition-all duration-200
            ${parsing ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'}
            ${draggingJd
              ? 'border-accent bg-accent/8 scale-[1.01]'
              : 'border-white/15 bg-white/3 hover:border-accent/40 hover:bg-accent/5'
            }`}
        >
          {parsing ? (
            <>
              <Loader2 size={32} className="text-accent animate-spin" />
              <p className="font-semibold text-white">Analyzing JD…</p>
            </>
          ) : (
            <>
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-200
                ${draggingJd ? 'bg-accent/20 border border-accent/40 shadow-glow' : 'bg-white/6 border border-white/10'}`}>
                <Upload size={20} className={draggingJd ? 'text-accent' : 'text-slate-400'} />
              </div>
              <div>
                <p className="font-display font-semibold text-white">
                  {jdFile ? jdFile.name : (draggingJd ? 'Drop JD here' : 'Upload JD File')}
                </p>
                <p className="text-slate-500 text-sm mt-1">
                  {jdFile ? formatSize(jdFile.size) : <>Optional description</>}
                </p>
              </div>
            </>
          )}
          <input
            ref={jdInputRef}
            type="file"
            accept=".pdf,.doc,.docx"
            className="hidden"
            onChange={(e) => {
              if (e.target.files[0]) { setJdFile(e.target.files[0]); setError('') }
              e.target.value = ''
            }}
          />
        </div>
      </div>

      {error && (
        <div className="flex items-start gap-2 px-4 py-3 rounded-xl bg-red-400/10 border border-red-400/25 text-sm text-red-300">
          <AlertCircle size={15} className="flex-shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {(mrfFile || jdFile) && !parsing && (
        <div className="flex items-center gap-3 justify-between">
          <button onClick={() => { setMrfFile(null); setJdFile(null); setError('') }} className="btn-ghost text-xs">
            <X size={13} /> Clear
          </button>
          <button onClick={handleParse} className="btn-primary px-8">
            <Sparkles size={15} /> Extract & Prefill Form
          </button>
        </div>
      )}
    </div>
  )
}

// ─── Main export ───────────────────────────────────────────────────────────────

export default function MRFForm({ onSubmitSuccess, showModeToggle = true, initialData = null }) {
  const [mode, setMode]           = useState('fill')
  const [step, setStep]           = useState('form')   // 'form' | 'preview' | 'success'
  const [form, setForm]           = useState(initialData || INITIAL)
  const [errors, setErrors]       = useState({})
  const [prefillBanner, setPrefillBanner] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  React.useEffect(() => {
    if (initialData) setForm(initialData)
  }, [initialData])

  const set = (key) => (e) => setForm(f => ({ ...f, [key]: e.target.value }))

  const handleParsed = (parsed) => {
    setForm(f => ({
      ...f,
      designation:              parsed.designation            || f.designation,
      department:               parsed.department             || f.department,
      location:                 parsed.location               || f.location,
      experience:               parsed.experience             || f.experience,
      noOfPositions:            parsed.noOfPositions          || f.noOfPositions,
      urgency:                  parsed.urgency                || f.urgency,
      purposeOfJob:             parsed.purposeOfJob           || f.purposeOfJob,
      otherKeySkills:           parsed.otherKeySkills         || f.otherKeySkills,
      minimumQualification:     parsed.minimumQualification   || f.minimumQualification,
      preferredIndustries:      parsed.preferredIndustries    || f.preferredIndustries,
      rolesAndResponsibilities: parsed.rolesAndResponsibilities || parsed.purposeOfJob || f.rolesAndResponsibilities,
    }))
    setPrefillBanner(true)
    setMode('fill')
  }

  const validate = () => {
    const e = {}
    if (!form.designation.trim())          e.designation = 'Required'
    if (!form.department.trim())           e.department = 'Required'
    if (!form.location.trim())             e.location = 'Required'
    if (!form.requestType)                 e.requestType = 'Required'
    if (!form.noOfPositions)               e.noOfPositions = 'Required'
    if (!form.purposeOfJob.trim())         e.purposeOfJob = 'Required'
    if (!form.minimumQualification.trim()) e.minimumQualification = 'Required'
    return e
  }

  // Step 1: Validate and go to preview
  const handlePreview = (e) => {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length) { setErrors(errs); return }
    setErrors({})
    setStep('preview')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  // Step 2: Admin confirms → create job opening
  const handleConfirm = async () => {
    setSubmitting(true)
    try {
      if (onSubmitSuccess) await onSubmitSuccess(form)
      setStep('success')
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } catch (err) {
      console.error('Submission failed:', err)
    } finally {
      setSubmitting(false)
    }
  }

  const handleReset = () => {
    setForm(INITIAL)
    setStep('form')
    setErrors({})
    setPrefillBanner(false)
  }

  const fieldClass = (key) => `field ${errors[key] ? '!border-danger/60 !ring-danger/20' : ''}`

  // ── Mode toggle ────────────────────────────────────────────────────────────
  const ModeToggle = () => {
    if (!showModeToggle) return null
    return (
      <div className="card p-1 flex gap-1 w-fit mb-6">
        {[
          { id: 'fill',   label: 'Fill Form',      icon: ClipboardList },
          { id: 'upload', label: 'Upload MRF File', icon: Upload },
        ].map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            type="button"
            onClick={() => setMode(id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200
              ${mode === id
                ? 'bg-accent text-white shadow-glow-sm'
                : 'text-slate-400 hover:text-white hover:bg-white/6'
              }`}
          >
            <Icon size={14} />
            {label}
          </button>
        ))}
      </div>
    )
  }

  // ── Upload mode ────────────────────────────────────────────────────────────
  if (mode === 'upload' && showModeToggle) {
    return (
      <div className="fade-up">
        <ModeToggle />
        <MRFUpload onParsed={handleParsed} />
      </div>
    )
  }

  // ── Preview step ───────────────────────────────────────────────────────────
  if (step === 'preview') {
    return (
      <div className="fade-up">
        {showModeToggle && <ModeToggle />}
        <MRFPreview
          form={form}
          onEdit={() => { setStep('form'); window.scrollTo({ top: 0, behavior: 'smooth' }) }}
          onConfirm={handleConfirm}
          submitting={submitting}
        />
      </div>
    )
  }

  // ── Success screen ─────────────────────────────────────────────────────────
  if (step === 'success') {
    if (!showModeToggle) return null
    return (
      <div className="fade-up">
        <ModeToggle />
        <div className="card p-10 flex flex-col items-center justify-center gap-4">
          <div
            className="w-16 h-16 rounded-full bg-success/15 border border-success/30 flex items-center justify-center mb-2"
            style={{ animation: 'glow-pulse 2s ease infinite' }}
          >
            <CheckCircle2 size={32} className="text-success" />
          </div>
          <h3 className="font-display font-bold text-xl text-white">Job Opening Created!</h3>
          <p className="text-slate-400 text-sm text-center max-w-xs">
            <span className="text-white font-semibold">{form.designation}</span> in{' '}
            <span className="text-white font-semibold">{form.department}</span> has been confirmed and published.
            Candidates can now apply.
          </p>
          <div className="flex gap-3 mt-2">
            <button onClick={handleReset} className="btn-primary">
              <Plus size={15} /> New MRF
            </button>
          </div>
        </div>
      </div>
    )
  }

  // ── Fill form (default) ────────────────────────────────────────────────────
  return (
    <div className="fade-up">
      <ModeToggle />

      {/* Prefill banner */}
      {prefillBanner && (
        <div className="flex items-start gap-3 px-4 py-3 rounded-xl bg-success/8 border border-success/20 text-sm text-slate-300 mb-5 fade-up">
          <CheckCircle2 size={15} className="text-success mt-0.5 flex-shrink-0" />
          <span>
            Form prefilled from uploaded MRF file.{' '}
            <span className="text-white font-medium">Please review and correct any fields before previewing.</span>
          </span>
          <button onClick={() => setPrefillBanner(false)} className="ml-auto text-slate-500 hover:text-white">
            <X size={13} />
          </button>
        </div>
      )}

      {/* Step indicator */}
      <div className="flex items-center gap-3 mb-6">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-full bg-accent flex items-center justify-center">
            <span className="text-white text-xs font-bold">1</span>
          </div>
          <span className="text-sm font-semibold text-white">Fill Details</span>
        </div>
        <div className="flex-1 h-px bg-white/10 max-w-[60px]" />
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-full bg-white/10 border border-white/20 flex items-center justify-center">
            <span className="text-slate-400 text-xs font-bold">2</span>
          </div>
          <span className="text-sm text-slate-500">Preview & Confirm</span>
        </div>
        <div className="flex-1 h-px bg-white/10 max-w-[60px]" />
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-full bg-white/10 border border-white/20 flex items-center justify-center">
            <span className="text-slate-400 text-xs font-bold">3</span>
          </div>
          <span className="text-sm text-slate-500">Job Created</span>
        </div>
      </div>

      <form onSubmit={handlePreview} noValidate className="space-y-8">

        {/* Section 1 */}
        <div className="card p-6 fade-up-1">
          <SectionHeader num="1" title="Position Details" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <Field label="Designation" required>
              <input className={fieldClass('designation')} placeholder="e.g. Senior Engineer"
                value={form.designation} onChange={set('designation')} />
              {errors.designation && <p className="text-danger text-xs mt-1">{errors.designation}</p>}
            </Field>
            <Field label="Department / Sub Function" required>
              <input className={fieldClass('department')} placeholder="e.g. Engineering"
                value={form.department} onChange={set('department')} />
              {errors.department && <p className="text-danger text-xs mt-1">{errors.department}</p>}
            </Field>
            <Field label="Reports To">
              <input className="field" placeholder="e.g. VP Engineering"
                value={form.reportsTo} onChange={set('reportsTo')} />
            </Field>
            <Field label="Location" required>
              <input className={fieldClass('location')} placeholder="e.g. Ahmedabad"
                value={form.location} onChange={set('location')} />
              {errors.location && <p className="text-danger text-xs mt-1">{errors.location}</p>}
            </Field>
            <Field label="Experience Required">
              <input className="field" placeholder="e.g. 3–5 years"
                value={form.experience} onChange={set('experience')} />
            </Field>
            <Field label="Proposed Salary (CTC Range)">
              <div className="flex gap-2">
                <input className="field" placeholder="Min ₹" value={form.proposedSalaryMin}
                  onChange={set('proposedSalaryMin')} />
                <input className="field" placeholder="Max ₹" value={form.proposedSalaryMax}
                  onChange={set('proposedSalaryMax')} />
              </div>
            </Field>
          </div>
          <div className="mt-4">
            <label className="label">Level of Urgency</label>
            <div className="flex gap-3">
              {['High', 'Medium', 'Low'].map(u => (
                <button type="button" key={u}
                  onClick={() => setForm(f => ({ ...f, urgency: u }))}
                  className={`px-4 py-2 rounded-lg text-sm font-semibold border transition-all duration-150 ${
                    form.urgency === u
                      ? u === 'High'   ? 'bg-danger/20 border-danger/50 text-danger'
                      : u === 'Medium' ? 'bg-gold/15 border-gold/40 text-gold'
                      :                  'bg-success/15 border-success/35 text-success'
                      : 'bg-white/5 border-white/10 text-slate-400 hover:bg-white/10'
                  }`}>
                  {u}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Section 2 */}
        <div className="card p-6 fade-up-2">
          <SectionHeader num="2" title="Reasons for Request" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <Field label="New / Replacement" required>
              <div className="relative">
                <select className={`field appearance-none pr-8 ${errors.requestType ? '!border-danger/60' : ''}`}
                  value={form.requestType} onChange={set('requestType')}>
                  <option value="">Select type…</option>
                  <option>New Position</option>
                  <option>Replacement</option>
                  <option>Additional Headcount</option>
                </select>
                <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
              </div>
              {errors.requestType && <p className="text-danger text-xs mt-1">{errors.requestType}</p>}
            </Field>
            <Field label="No. of Positions" required>
              <input type="number" min="1" className={fieldClass('noOfPositions')} placeholder="e.g. 2"
                value={form.noOfPositions} onChange={set('noOfPositions')} />
              {errors.noOfPositions && <p className="text-danger text-xs mt-1">{errors.noOfPositions}</p>}
            </Field>
            <Field label="Replacement For">
              <input className="field" placeholder="Name (if replacement)"
                value={form.replacementFor} onChange={set('replacementFor')} />
            </Field>
          </div>
          <div className="mt-4">
            <Field label="Justification for this Opening">
              <textarea className="field min-h-[90px] resize-none"
                placeholder="Describe the business need for this position…"
                value={form.justification} onChange={set('justification')} />
            </Field>
          </div>
        </div>

        {/* Section 3 */}
        <div className="card p-6 fade-up-3">
          <SectionHeader num="3" title="Job Description" />
          <div className="space-y-4">
            <Field label="Purpose of the Job" required>
              <textarea className={`field min-h-[80px] resize-none ${errors.purposeOfJob ? '!border-danger/60' : ''}`}
                placeholder="Brief summary of the role's primary objective…"
                value={form.purposeOfJob} onChange={set('purposeOfJob')} />
              {errors.purposeOfJob && <p className="text-danger text-xs mt-1">{errors.purposeOfJob}</p>}
            </Field>
            <Field label="Roles & Responsibilities (Proper Job Description)">
              <textarea className="field min-h-[130px] resize-none"
                placeholder={'1. Lead cross-functional teams...\n2. Manage end-to-end delivery...\n3. Stakeholder communication...'}
                value={form.rolesAndResponsibilities} onChange={set('rolesAndResponsibilities')} />
            </Field>
          </div>
        </div>

        {/* Section 4 */}
        <div className="card p-6 fade-up-4">
          <SectionHeader num="4" title="Qualification & Other Criteria" />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Minimum Qualification" required>
              <div className="relative">
                <select className={`field appearance-none pr-8 ${errors.minimumQualification ? '!border-danger/60' : ''}`}
                  value={form.minimumQualification} onChange={set('minimumQualification')}>
                  <option value="">Select qualification…</option>
                  <option>10th / SSC</option>
                  <option>12th / HSC</option>
                  <option>Diploma</option>
                  <option>Graduate (Any)</option>
                  <option>B.E. / B.Tech</option>
                  <option>MBA / PGDM</option>
                  <option>Post Graduate</option>
                  <option>Doctorate / PhD</option>
                </select>
                <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
              </div>
              {errors.minimumQualification && <p className="text-danger text-xs mt-1">{errors.minimumQualification}</p>}
            </Field>
            <Field label="Preferred Industries / Sectors">
              <input className="field" placeholder="e.g. FMCG, Manufacturing, IT"
                value={form.preferredIndustries} onChange={set('preferredIndustries')} />
            </Field>
            <Field label="Other Key Skills & In-hand Experience">
              <input className="field" placeholder="e.g. React, Node.js, Team Management"
                value={form.otherKeySkills} onChange={set('otherKeySkills')} />
            </Field>
            <Field label="IT Requirements (Laptop / Desktop / Special Software)">
              <input className="field" placeholder="e.g. MacBook Pro, Figma, SAP"
                value={form.itRequirements} onChange={set('itRequirements')} />
            </Field>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
            <div>
              <label className="label">Gender Preference</label>
              <div className="flex gap-3">
                {['Any', 'Male', 'Female'].map(g => (
                  <button type="button" key={g}
                    onClick={() => setForm(f => ({ ...f, genderPreference: g }))}
                    className={`px-4 py-2 rounded-lg text-sm font-medium border transition-all duration-150 ${
                      form.genderPreference === g
                        ? 'bg-accent/15 border-accent/40 text-accent'
                        : 'bg-white/5 border-white/10 text-slate-400 hover:bg-white/10'
                    }`}>
                    {g}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="label">Age Range</label>
              <div className="flex items-center gap-2">
                <input type="number" className="field" placeholder="Min" min={18} max={70}
                  value={form.ageMin} onChange={set('ageMin')} />
                <span className="text-slate-500 text-sm">–</span>
                <input type="number" className="field" placeholder="Max" min={18} max={70}
                  value={form.ageMax} onChange={set('ageMax')} />
                <span className="text-slate-500 text-xs whitespace-nowrap">yrs</span>
              </div>
            </div>
          </div>
        </div>

        {/* Submit row — now goes to Preview */}
        <div className="flex items-center justify-between gap-4">
          <button type="button" onClick={handleReset} className="btn-ghost">
            <X size={15} /> Clear Form
          </button>
          <button type="submit" className="btn-primary min-w-[200px] flex items-center justify-center gap-2">
            <Eye size={16} />
            {initialData ? 'Preview Changes' : 'Preview Job Opening'}
          </button>
        </div>

      </form>
    </div>
  )
}