import React, { useState, useEffect, useRef } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import {
  ArrowLeft, CheckCircle2, AlertTriangle, User, Mail, Phone,
  Briefcase, GraduationCap, Zap, MapPin, Calendar, FileText,
  Sparkles, Building2, Clock, ChevronRight, Send, Upload, X,
} from 'lucide-react'
import { mrfApi, candidateApi } from '../services/api.js'
import { scoreCandidate, MATCH_COLORS } from '../utils/matchEngine.js'

const FORM_FIELDS = [
  { key: 'fullName',        Icon: User,          label: 'Full Name',            ph: 'Your full name',              required: true  },
  { key: 'phone',           Icon: Phone,         label: 'Contact No.',          ph: 'Primary phone number',        required: true  },
  { key: 'alternatePhone',  Icon: Phone,         label: 'Alternate Number',     ph: 'Alternate contact number',    required: false },
  { key: 'email',           Icon: Mail,          label: 'Mail ID',              ph: 'Email address',               required: true  },
  { key: 'highestQual',     Icon: GraduationCap, label: 'Qualification',        ph: 'e.g. B.Tech, MCom',           required: false },
  { key: 'totalExp',        Icon: Briefcase,     label: 'Total Experience',     ph: 'e.g. 4 Years',                required: false },
  { key: 'currentLocation', Icon: MapPin,        label: 'Current Location',     ph: 'e.g. Ahmedabad',              required: false },
  { key: 'currentCompany',  Icon: Briefcase,     label: 'Current Company',      ph: 'e.g. XYZ Pvt Ltd',            required: false },
  { key: 'currentCtc',      Icon: Zap,           label: 'Current CTC',          ph: 'e.g. 4 LPA',                  required: false },
  { key: 'expectedCtc',     Icon: Zap,           label: 'Expected CTC',         ph: 'e.g. 5.5 LPA',                required: false },
  { key: 'noticePeriod',    Icon: Calendar,      label: 'Notice Period',        ph: 'e.g. 1 Month',                required: false },
  { key: 'reasonForChange', Icon: FileText,      label: 'Reason for Change',    ph: 'e.g. Better Growth',          required: false },
]

const URGENCY_COLOR = {
  High:   'text-red-400 bg-red-400/10 border-red-400/25',
  Medium: 'text-yellow-400 bg-yellow-400/10 border-yellow-400/25',
  Low:    'text-slate-400 bg-slate-400/10 border-slate-400/20',
}

export default function CandidateApplyPage() {
  const { mrfId } = useParams()
  const navigate = useNavigate()
  const fileInputRef = useRef(null)

  const [opening,    setOpening]    = useState(null)
  const [loading,    setLoading]    = useState(true)
  const [uploading,  setUploading]  = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [success,    setSuccess]    = useState(false)
  const [errorMsg,   setErrorMsg]   = useState(null)
  const [errors,     setErrors]     = useState({})

  const [form, setForm] = useState({
    fullName: '', phone: '', alternatePhone: '', email: '',
    totalExp: '', highestQual: '', currentLocation: '', currentCompany: '',
    currentCtc: '', expectedCtc: '', noticePeriod: '', reasonForChange: '',
    skills: '', notes: '',
  })

  const [resumeInfo, setResumeInfo] = useState({
    fileName: '',
    filePath: '',
    fileSize: 0,
  })

  // Load opening details
  useEffect(() => {
    mrfApi.get(mrfId)
      .then(data => setOpening(data))
      .catch(() => setErrorMsg('Failed to load job opening. Please try again.'))
      .finally(() => setLoading(false))
  }, [mrfId])

  const set = (key) => (e) => {
    setForm(f => ({ ...f, [key]: e.target.value }))
    if (errors[key]) setErrors(prev => ({ ...prev, [key]: '' }))
  }

  // Handle resume upload
  const handleResumeFile = async (e) => {
    const files = e.target.files
    if (!files || !files.length) return
    setUploading(true)
    setErrorMsg(null)
    try {
      const parsed = await candidateApi.parseResume(mrfId, files[0])
      
      const d = parsed.details || {}
      setForm(f => ({
        ...f,
        fullName:        d.fullName        || f.fullName,
        email:           d.email           || f.email,
        phone:           d.phone           || f.phone,
        totalExp:        d.totalExp        || f.totalExp,
        highestQual:     d.highestQual     || f.highestQual,
        skills:          d.skills          || f.skills,
        notes:           d.notes           || f.notes,
      }))

      setResumeInfo({
        fileName: parsed.fileName || files[0].name,
        filePath: parsed.filePath || '',
        fileSize: parsed.fileSize || files[0].size,
      })
    } catch (err) {
      console.error('Resume parsing failed:', err)
      setErrorMsg('Failed to parse resume automatically. Please enter details manually below.')
    } finally {
      setUploading(false)
    }
  }

  const handleRemoveResume = () => {
    setResumeInfo({ fileName: '', filePath: '', fileSize: 0 })
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const validate = () => {
    const e = {}
    if (!form.fullName.trim()) e.fullName = 'Name is required'
    if (!form.phone.trim())    e.phone    = 'Contact number is required'
    if (!form.email.trim())    e.email    = 'Email is required'
    return e
  }

  const handleSubmit = async (ev) => {
    ev.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length) { setErrors(errs); return }
    setErrors({})
    setSubmitting(true)
    setErrorMsg(null)
    try {
      await candidateApi.applyToJob(mrfId, { ...form, ...resumeInfo })
      setSuccess(true)
    } catch (err) {
      setErrorMsg(err.message || 'Failed to submit application. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  // Live match score calculation
  const matchResult = opening
    ? scoreCandidate(
        { ...form, currentTitle: opening.designation, notes: `${form.skills || ''} ${form.notes || ''}` },
        {
          designation:          opening.designation,
          department:           opening.department,
          experience:           opening.experience,
          minimumQualification: opening.minimumQualification,
          otherKeySkills:       opening.otherKeySkills,
        }
      )
    : null

  // ── Loading state ──────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center">
        <div className="animate-spin w-10 h-10 border-2 border-accent border-t-transparent rounded-full mx-auto" />
        <p className="text-slate-400 text-sm mt-4">Loading job details…</p>
      </div>
    )
  }

  if (!opening) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center space-y-4">
        <div className="w-16 h-16 rounded-2xl bg-red-400/10 border border-red-400/20 flex items-center justify-center mx-auto">
          <AlertTriangle size={28} className="text-red-400" />
        </div>
        <h2 className="font-display font-bold text-white text-xl">Opening Not Found</h2>
        <p className="text-slate-500 text-sm">This vacancy may have been filled or removed.</p>
        <Link to="/dashboard" className="btn-primary inline-flex mt-2">Back to Job Openings</Link>
      </div>
    )
  }

  // ── Success screen ─────────────────────────────────────────────────────────
  if (success) {
    return (
      <div className="max-w-xl mx-auto px-4 py-16">
        <div className="card p-10 text-center space-y-5 relative overflow-hidden fade-up">
          <div className="absolute inset-0 bg-gradient-to-br from-success/5 to-transparent pointer-events-none" />
          <div className="w-20 h-20 rounded-full bg-success/15 border border-success/30 flex items-center justify-center mx-auto"
               style={{ animation: 'glow-pulse 2s ease infinite' }}>
            <CheckCircle2 size={36} className="text-success" />
          </div>
          <div>
            <h2 className="font-display font-bold text-2xl text-white">Application Submitted!</h2>
            <p className="text-slate-400 text-sm mt-2 leading-relaxed">
              Thank you, <span className="text-white font-semibold">{form.fullName}</span>! Your application for{' '}
              <span className="text-accent font-semibold">{opening.designation}</span> has been received.
            </p>
            <p className="text-xs text-slate-500 mt-2">Our HR team will review your profile and reach out to you.</p>
          </div>
          <div className="pt-4 border-t border-white/8 flex gap-3 justify-center flex-wrap">
            <Link to="/dashboard" className="btn-primary">
              <Sparkles size={14} /> View More Openings
            </Link>
          </div>
        </div>
      </div>
    )
  }

  const urgencyStyle = URGENCY_COLOR[opening.levelOfUrgency] || URGENCY_COLOR.Medium
  const mc = matchResult ? (MATCH_COLORS[matchResult.matchLevel] || MATCH_COLORS.Low) : null

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 space-y-6">

      {/* Back */}
      <Link to="/dashboard" className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-accent transition-colors">
        <ArrowLeft size={13} /> Back to Job Openings
      </Link>

      {/* Error banner */}
      {errorMsg && (
        <div className="card p-4 border-l-2 border-l-red-400 bg-red-500/10 flex items-start gap-3 fade-up">
          <AlertTriangle className="text-red-400 mt-0.5 flex-shrink-0" size={16} />
          <p className="text-xs text-slate-300 flex-1">{errorMsg}</p>
          <button onClick={() => setErrorMsg(null)} className="text-slate-500 hover:text-white text-xs">✕</button>
        </div>
      )}

      {/* ── Job Card ────────────────────────────────────────────────────────── */}
      <div className="card overflow-hidden relative fade-up">
        <div className="h-1 bg-gradient-to-r from-accent via-purple-500 to-pink-500 w-full" />
        <div className="p-6">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-2 flex-wrap">
                <span className="section-tag">
                  <Sparkles size={10} /> Active Vacancy
                </span>
                {opening.levelOfUrgency && (
                  <span className={`badge border text-[11px] ${urgencyStyle}`}>
                    {opening.levelOfUrgency} Priority
                  </span>
                )}
              </div>
              <h1 className="font-display font-bold text-2xl sm:text-3xl text-white leading-tight">
                {opening.designation}
              </h1>
              <div className="flex flex-wrap gap-x-4 gap-y-1.5 mt-3 text-xs text-slate-400">
                {opening.department && (
                  <span className="flex items-center gap-1.5">
                    <Building2 size={12} className="text-slate-500" /> {opening.department}
                  </span>
                )}
                {opening.location && (
                  <span className="flex items-center gap-1.5">
                    <MapPin size={12} className="text-slate-500" /> {opening.location}
                  </span>
                )}
                {opening.experience && (
                  <span className="flex items-center gap-1.5">
                    <Clock size={12} className="text-slate-500" /> {opening.experience}
                  </span>
                )}
                {opening.noOfPositions && (
                  <span className="flex items-center gap-1.5">
                    <User size={12} className="text-slate-500" /> {opening.noOfPositions} position{opening.noOfPositions != 1 ? 's' : ''}
                  </span>
                )}
              </div>
            </div>
            {(opening.proposedSalaryMin || opening.proposedSalary) && (
              <div className="text-right flex-shrink-0 bg-accent/8 border border-accent/20 rounded-xl px-4 py-3">
                <p className="text-[10px] text-slate-500 uppercase tracking-widest">CTC Range</p>
                <p className="text-sm font-bold text-accent mt-0.5">
                  {opening.proposedSalaryMin
                    ? `₹${opening.proposedSalaryMin}–${opening.proposedSalaryMax} LPA`
                    : opening.proposedSalary}
                </p>
              </div>
            )}
          </div>

          {/* Skills */}
          {opening.otherKeySkills && (
            <div className="mt-4 flex flex-wrap gap-1.5">
              {opening.otherKeySkills.split(',').map(s => s.trim()).filter(Boolean).map(skill => (
                <span key={skill} className="px-2 py-0.5 rounded-full bg-white/6 border border-white/10 text-xs text-slate-300">
                  {skill}
                </span>
              ))}
            </div>
          )}

          {/* Role description */}
          {opening.purposeOfJob && (
            <div className="mt-4 pt-4 border-t border-white/6">
              <p className="text-xs text-slate-500 uppercase tracking-wider mb-1.5">Role Summary</p>
              <p className="text-xs text-slate-400 leading-relaxed">{opening.purposeOfJob}</p>
            </div>
          )}

          {/* Qualification */}
          {opening.minimumQualification && (
            <div className="mt-3 flex items-center gap-1.5 text-xs text-slate-500">
              <GraduationCap size={12} />
              <span>Min. Qualification: <span className="text-slate-300">{opening.minimumQualification}</span></span>
            </div>
          )}
        </div>
      </div>

      {/* ── Step 1: Upload Resume (Optional) ────────────────────────────────── */}
      <div className="card p-6 space-y-4 fade-up">
        <div className="flex items-center justify-between">
          <h3 className="font-display font-semibold text-white text-sm">Step 1: Upload Your Resume</h3>
          {resumeInfo.fileName && (
            <span className="badge bg-success/12 text-success border border-success/25 text-[11px]">
              <CheckCircle2 size={11} /> Parsed
            </span>
          )}
        </div>
        
        {!resumeInfo.fileName ? (
          <div
            onClick={() => fileInputRef.current?.click()}
            className={`rounded-xl border-2 border-dashed border-white/10 bg-white/3 hover:border-accent/40 hover:bg-accent/4 cursor-pointer py-10 px-6 text-center transition-all duration-200 flex flex-col items-center gap-3
              ${uploading ? 'pointer-events-none opacity-50' : ''}`}
          >
            {uploading ? (
              <div className="animate-spin w-8 h-8 border-2 border-accent border-t-transparent rounded-full" />
            ) : (
              <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center">
                <Upload size={18} className="text-slate-400" />
              </div>
            )}
            <div>
              <p className="font-semibold text-white text-sm">{uploading ? 'Analyzing Resume...' : 'Select Resume File'}</p>
              <p className="text-xs text-slate-500 mt-1">PDF, Word (.docx/.doc), JPG, PNG or TXT formats</p>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.webp,.txt"
              className="hidden"
              onChange={handleResumeFile}
            />
          </div>
        ) : (
          <div className="p-4 border border-success/20 bg-success/5 rounded-xl flex items-center gap-3 fade-up">
            <div className="w-8 h-8 rounded-lg bg-success/15 border border-success/30 flex items-center justify-center flex-shrink-0 text-success">
              <CheckCircle2 size={16} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-white truncate">{resumeInfo.fileName}</p>
              <p className="text-[10px] text-slate-400 mt-0.5">Resume parsed and evaluated. You can modify details in Step 2.</p>
            </div>
            <button
              onClick={handleRemoveResume}
              className="text-[11px] text-slate-500 hover:text-red-400 transition-colors flex items-center gap-1 bg-white/5 px-2.5 py-1 rounded-lg border border-white/10"
            >
              <X size={11} /> Replace
            </button>
          </div>
        )}
      </div>

      {/* ── Section: Match Compatibility Score ── */}
      {(resumeInfo.fileName || form.fullName) && matchResult && matchResult.score > 0 && mc && (
        <div className="card p-5 bg-ink-950/50 flex items-start gap-4 fade-up">
          <div className="relative w-16 h-16 flex items-center justify-center flex-shrink-0">
            <svg className="absolute inset-0 -rotate-90" width="64" height="64" viewBox="0 0 64 64">
              <circle cx="32" cy="32" r="26" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="5" />
              <circle
                cx="32" cy="32" r="26"
                fill="none"
                stroke={mc.ring}
                strokeWidth="5"
                strokeLinecap="round"
                strokeDasharray={2 * Math.PI * 26}
                strokeDashoffset={2 * Math.PI * 26 - (matchResult.score / 100) * (2 * Math.PI * 26)}
                style={{ transition: 'stroke-dashoffset 0.8s ease' }}
              />
            </svg>
            <span className="text-white font-bold text-sm font-mono">{matchResult.score}%</span>
          </div>
          <div className="flex-1 space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500">Resume Match Level:</span>
              <span className={`badge ${mc.bg} ${mc.text} ${mc.border} border text-[10px]`}>{matchResult.matchLevel}</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed mt-1">
              Based on our automated matching engine, your skills and qualifications align with this role's profile. You can review and adjust your profile details below.
            </p>
          </div>
        </div>
      )}

      {/* ── Step 2: Applicant Details Form ──────────────────────────────────── */}
      {resumeInfo.fileName && (
        <form onSubmit={handleSubmit} className="card p-6 space-y-6 fade-up" noValidate>

        {/* Form header */}
        <div className="flex items-center gap-3 pb-4 border-b border-white/8">
          <div className="w-9 h-9 rounded-xl bg-accent/15 border border-accent/25 flex items-center justify-center">
            <Send size={16} className="text-accent" />
          </div>
          <div>
            <h2 className="font-display font-semibold text-white text-base">Step 2: Confirm Profile Details</h2>
            <p className="text-xs text-slate-500 mt-0.5">Please review the details below — fields marked * are required</p>
          </div>
        </div>

        {/* Fields grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {FORM_FIELDS.map(({ key, Icon: FIcon, label, ph, required }) => (
            <div key={key}>
              <label className="label flex items-center gap-1.5 text-xs text-slate-400 mb-1">
                <FIcon size={11} className="text-accent/60" />
                {label}{required && <span className="text-red-400 ml-0.5">*</span>}
              </label>
              <input
                className={`field text-sm ${errors[key] ? '!border-red-400/50 !ring-red-400/15' : ''}`}
                placeholder={ph}
                value={form[key]}
                onChange={set(key)}
              />
              {errors[key] && <p className="text-red-400 text-[11px] mt-1">{errors[key]}</p>}
            </div>
          ))}
        </div>

        {/* Skills */}
        <div>
          <label className="label text-xs text-slate-400 mb-1">Key Skills</label>
          <input
            className="field text-sm"
            placeholder="React, Excel, SQL, communication..."
            value={form.skills}
            onChange={set('skills')}
          />
        </div>

        {/* Remarks */}
        <div>
          <label className="label text-xs text-slate-400 mb-1">Remarks / Cover Note</label>
          <textarea
            className="field text-sm min-h-[90px] resize-none"
            placeholder="Why are you interested in this role? Any additional information you'd like to share…"
            value={form.notes}
            onChange={set('notes')}
          />
        </div>

        {/* Submit */}
        <div className="flex items-center justify-between pt-3 border-t border-white/8 flex-wrap gap-3">
          <p className="text-xs text-slate-600">
            Applying for <span className="text-slate-400 font-medium">{opening.designation}</span>
            {opening.department && <> · {opening.department}</>}
          </p>
          <button
            type="submit"
            disabled={submitting}
            className={`btn-primary px-8 text-sm ${submitting ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {submitting ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Submitting…
              </>
            ) : (
              <>
                <Send size={15} /> Submit Application
                <ChevronRight size={14} className="opacity-60" />
              </>
            )}
          </button>
        </div>
      </form>
      )}

    </div>
  )
}