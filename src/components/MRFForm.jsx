import React, { useState, useRef, useCallback } from 'react'
import {
  ClipboardList, CheckCircle2, ChevronDown, Plus, X,
  Upload, FileText, FileImage, File, AlertCircle, ToggleLeft, ToggleRight
} from 'lucide-react'

// ─── Helpers ────────────────────────────────────────────────────────────────

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

// ─── Sub-components ─────────────────────────────────────────────────────────

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

// ─── Upload MRF File panel ───────────────────────────────────────────────────

function MRFUpload({ onUploadSuccess }) {
  const [dragging, setDragging] = useState(false)
  const [files, setFiles] = useState([])
  const [uploaded, setUploaded] = useState(false)
  const inputRef = useRef(null)

  const addFiles = useCallback((incoming) => {
    const arr = Array.from(incoming)
    setFiles(arr)
  }, [])

  const onDrop = (e) => {
    e.preventDefault(); setDragging(false)
    if (e.dataTransfer.files.length) addFiles(e.dataTransfer.files)
  }

  const handleSubmit = () => {
    if (!files.length) return
    // TODO: send files to backend via resumeApi / mrfApi
    setUploaded(true)
    onUploadSuccess && onUploadSuccess(files)
  }

  if (uploaded) {
    return (
      <div className="card p-10 flex flex-col items-center justify-center gap-4 fade-up">
        <div
          className="w-16 h-16 rounded-full bg-success/15 border border-success/30 flex items-center justify-center mb-2"
          style={{ animation: 'glow-pulse 2s ease infinite' }}
        >
          <CheckCircle2 size={32} className="text-success" />
        </div>
        <h3 className="font-display font-bold text-xl text-white">MRF Uploaded!</h3>
        <p className="text-slate-400 text-sm text-center max-w-xs">
          <span className="text-white font-semibold">{files[0]?.name}</span> has been submitted successfully.
        </p>
        <button onClick={() => { setFiles([]); setUploaded(false) }} className="btn-primary mt-2">
          <Plus size={15} /> Upload Another
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-5 fade-up">
      {/* Info banner */}
      <div className="flex items-start gap-3 px-4 py-3 rounded-xl bg-accent/8 border border-accent/20 text-sm text-slate-300">
        <AlertCircle size={16} className="text-accent mt-0.5 flex-shrink-0" />
        <span>
          Already have a filled MRF? Upload it directly here — supported formats are
          <span className="text-white font-medium"> PDF, Word (.doc/.docx), JPG, PNG</span>.
        </span>
      </div>

      {/* Drop zone */}
      <div
        onDrop={onDrop}
        onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
        onDragLeave={() => setDragging(false)}
        onClick={() => inputRef.current?.click()}
        className={`relative rounded-2xl border-2 border-dashed cursor-pointer
          flex flex-col items-center justify-center gap-3 py-14 px-6 text-center
          transition-all duration-200
          ${dragging
            ? 'border-accent bg-accent/8 scale-[1.01]'
            : 'border-white/15 bg-white/3 hover:border-accent/40 hover:bg-accent/5'
          }`}
      >
        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-200
          ${dragging ? 'bg-accent/20 border border-accent/40 shadow-glow' : 'bg-white/6 border border-white/10'}`}>
          <Upload size={24} className={dragging ? 'text-accent' : 'text-slate-400'} />
        </div>
        <div>
          <p className="font-display font-semibold text-white">
            {dragging ? 'Drop your MRF here' : 'Upload Manpower Request Form'}
          </p>
          <p className="text-slate-500 text-sm mt-1">
            Drag & drop or <span className="text-accent">browse files</span>
          </p>
          <p className="text-slate-600 text-xs mt-1">PDF · Word · JPG · PNG</p>
        </div>
        <input
          ref={inputRef}
          type="file"
          multiple={false}
          accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.webp"
          className="hidden"
          onChange={(e) => {
            if (e.target.files.length) { addFiles(e.target.files); e.target.value = '' }
          }}
        />
      </div>

      {/* Selected file preview */}
      {files.length > 0 && (
        <div className="card p-4 flex items-center gap-3">
          {(() => {
            const { icon: Icon, color, bg } = getFileIcon(files[0])
            return (
              <div className={`w-10 h-10 rounded-lg border flex items-center justify-center flex-shrink-0 ${bg}`}>
                <Icon size={18} className={color} />
              </div>
            )
          })()}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-white truncate">{files[0].name}</p>
            <p className="text-xs text-slate-500 mt-0.5">{formatSize(files[0].size)}</p>
          </div>
          <button
            onClick={(e) => { e.stopPropagation(); setFiles([]) }}
            className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center
                       hover:bg-danger/20 hover:border-danger/30 transition-colors text-slate-400 hover:text-danger"
          >
            <X size={14} />
          </button>
        </div>
      )}

      {/* Submit */}
      <div className="flex justify-end">
        <button
          onClick={handleSubmit}
          disabled={!files.length}
          className={`btn-primary px-8 ${!files.length ? 'opacity-40 cursor-not-allowed' : ''}`}
        >
          <ClipboardList size={15} /> Submit MRF File
        </button>
      </div>
    </div>
  )
}

// ─── Main export ─────────────────────────────────────────────────────────────

export default function MRFForm({ onSubmitSuccess, showModeToggle = true }) {
  // 'fill' = manual form  |  'upload' = file upload
  const [mode, setMode] = useState('fill')

  const [form, setForm] = useState(INITIAL)
  const [submitted, setSubmitted] = useState(false)
  const [errors, setErrors] = useState({})

  const set = (key) => (e) => setForm(f => ({ ...f, [key]: e.target.value }))

  const validate = () => {
    const e = {}
    if (!form.designation.trim())         e.designation = 'Required'
    if (!form.department.trim())          e.department = 'Required'
    if (!form.location.trim())            e.location = 'Required'
    if (!form.requestType)                e.requestType = 'Required'
    if (!form.noOfPositions)              e.noOfPositions = 'Required'
    if (!form.purposeOfJob.trim())        e.purposeOfJob = 'Required'
    if (!form.minimumQualification.trim()) e.minimumQualification = 'Required'
    return e
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length) { setErrors(errs); return }
    setErrors({})
    try {
      if (onSubmitSuccess) {
        await onSubmitSuccess(form)
      }
      setSubmitted(true)
    } catch (err) {
      console.error('Submission failed:', err)
    }
  }

  const handleReset = () => { setForm(INITIAL); setSubmitted(false); setErrors({}) }
  const fieldClass = (key) => `field ${errors[key] ? '!border-danger/60 !ring-danger/20' : ''}`

  // ── Mode toggle bar ────────────────────────────────────────────────────────
  const ModeToggle = () => {
    if (!showModeToggle) return null
    return (
      <div className="card p-1 flex gap-1 w-fit mb-6">
        {[
          { id: 'fill',   label: 'Fill Form',       icon: ClipboardList },
          { id: 'upload', label: 'Upload MRF File',  icon: Upload },
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
        <MRFUpload onUploadSuccess={onSubmitSuccess} />
      </div>
    )
  }

  // ── Success screen (fill mode) ─────────────────────────────────────────────
  if (submitted) {
    if (!showModeToggle) return null  // parent controls post-submit state
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
          <h3 className="font-display font-bold text-xl text-white">MRF Submitted!</h3>
          <p className="text-slate-400 text-sm text-center max-w-xs">
            Manpower Request for{' '}
            <span className="text-white font-semibold">{form.designation}</span> in{' '}
            <span className="text-white font-semibold">{form.department}</span> has been recorded.
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

      <form onSubmit={handleSubmit} noValidate className="space-y-8">

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

        {/* Submit row */}
        <div className="flex items-center justify-between gap-4">
          <button type="button" onClick={handleReset} className="btn-ghost">
            <X size={15} /> Clear Form
          </button>
          <button type="submit" className="btn-primary px-8">
            <ClipboardList size={15} /> Submit MRF
          </button>
        </div>

      </form>
    </div>
  )
}
