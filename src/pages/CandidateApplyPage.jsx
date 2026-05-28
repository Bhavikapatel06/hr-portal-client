import React, { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import {
  ArrowLeft, Upload, CheckCircle2, AlertTriangle, Target,
  User, Mail, Phone, Briefcase, GraduationCap, Zap, MapPin,
  Calendar, FileText, Sparkles, Building2, Clock, CheckSquare,
} from 'lucide-react'
import { mrfApi, candidateApi } from '../services/api.js'
import { MATCH_COLORS } from '../utils/matchEngine.js'

const DETAIL_FIELDS = [
  { key: 'fullName',        Icon: User,          label: 'Full Name *',          ph: 'Candidate full name' },
  { key: 'email',           Icon: Mail,          label: 'Email *',              ph: 'Email address' },
  { key: 'phone',           Icon: Phone,         label: 'Phone *',              ph: 'Phone number' },
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

export default function CandidateApplyPage() {
  const { mrfId } = useParams()
  const navigate = useNavigate()
  const fileInputRef = useRef(null)

  // States
  const [opening, setOpening] = useState(null)
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [candidate, setCandidate] = useState(null)
  const [formData, setFormData] = useState({})
  const [errors, setErrors] = useState({})
  const [errorMsg, setErrorMsg] = useState(null)
  const [success, setSuccess] = useState(false)

  // Load opening details
  useEffect(() => {
    const loadOpening = async () => {
      try {
        const data = await mrfApi.get(mrfId)
        setOpening(data)
      } catch (err) {
        console.error('Failed to load opening:', err)
        setErrorMsg('Failed to load job opening details. Please try again.')
      } finally {
        setLoading(false)
      }
    }
    loadOpening()
  }, [mrfId])

  // Handle resume upload
  const handleResumeFile = async (e) => {
    const files = e.target.files
    if (!files || !files.length) return
    setUploading(true)
    setErrorMsg(null)
    try {
      // Upload resume to backend — uses existing candidateApi
      const results = await candidateApi.uploadResumes(mrfId, [files[0]])
      
      if (results && results.length > 0) {
        const newCand = results[results.length - 1]
        
        // Use real match score from backend
        setCandidate({
          _id:        newCand._id,
          fileName:   newCand.fileName,
          matchScore: newCand.matchScore  || 0,
          matchLevel: newCand.matchLevel  || 'Low',
          details:    newCand.details     || {},
        })

        // Auto fill form with parsed details from backend
        const d = newCand.details || {}
        setFormData({
          fullName:        d.fullName        || '',
          email:           d.email           || '',
          phone:           d.phone           || '',
          currentTitle:    d.currentTitle    || '',
          totalExp:        d.totalExp        || '',
          highestQual:     d.highestQual     || '',
          skills:          d.skills          || '',
          currentLocation: d.currentLocation || '',
          currentCompany:  d.currentCompany  || '',
          currentCtc:      d.currentCtc      || '',
          expectedCtc:     d.expectedCtc     || '',
          noticePeriod:    d.noticePeriod    || '',
          reasonForChange: d.reasonForChange || '',
          alternatePhone:  d.alternatePhone  || '',
          notes:           d.notes           || '',
        })
      }
    } catch (err) {
      console.error('Upload failed:', err)
      setErrorMsg('Failed to upload and parse resume. Please enter details manually.')
    } finally {
      setUploading(false)
    }
  }

  // Validate manual form fields
  const validateForm = () => {
    const errs = {}
    if (!formData.fullName?.trim()) errs.fullName = 'Required'
    if (!formData.email?.trim())    errs.email = 'Required'
    if (!formData.phone?.trim())    errs.phone = 'Required'
    return errs
  }

  const handleFieldChange = (key, val) => {
    setFormData(prev => ({ ...prev, [key]: val }))
  }

  // Submit final application details
  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!candidate) {
      setErrorMsg('Please upload your resume first!')
      return
    }
    const errs = validateForm()
    if (Object.keys(errs).length) {
      setErrors(errs)
      return
    }
    setErrors({})
    setSubmitting(true)
    try {
      // Save details to backend (this triggers DB update, re-score & CSV local write!)
      await candidateApi.updateDetails(candidate._id || candidate.id, formData)
      setSuccess(true)
    } catch (err) {
      console.error('Submit application failed:', err)
      setErrorMsg('Failed to submit application. Please check your network connection.')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center">
        <div className="animate-spin w-8 h-8 border-2 border-accent border-t-transparent rounded-full mx-auto" />
        <p className="text-slate-400 text-sm mt-3">Loading job details...</p>
      </div>
    )
  }

  if (!opening) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center card bg-ink-950/80 border-white/8">
        <AlertTriangle size={36} className="text-red-400 mx-auto mb-3" />
        <h2 className="font-display font-bold text-white text-lg">Job Opening Not Found</h2>
        <p className="text-slate-500 text-sm mt-1">This vacancy may have been filled or deleted.</p>
        <Link to="/dashboard" className="btn-primary mt-4 inline-flex">Go back to Job Openings</Link>
      </div>
    )
  }

  if (success) {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 text-center card bg-ink-950/80 border-white/8 space-y-6 fade-up relative overflow-hidden">
        {/* Glow effect */}
        <div className="absolute -top-24 -left-24 w-48 h-48 rounded-full bg-success/10 blur-3xl" />
        
        <div className="w-16 h-16 rounded-full bg-success/15 border border-success/30 flex items-center justify-center mx-auto mb-2">
          <CheckCircle2 size={32} className="text-success" />
        </div>
        <div>
          <h2 className="font-display font-bold text-2xl text-white">Application Submitted!</h2>
          <p className="text-slate-400 text-sm mt-2">
            Thank you for applying for the <span className="text-white font-semibold">{opening.designation}</span> position.
          </p>
          <p className="text-xs text-slate-500 mt-1">
            Your application was processed and recorded in the database.
          </p>
        </div>
        <div className="pt-4 border-t border-white/8 flex gap-3 justify-center">
          <Link to="/dashboard" className="btn-primary">View More Openings</Link>
        </div>
      </div>
    )
  }

  // Matching score colors
  const mc = candidate ? (MATCH_COLORS[candidate.matchLevel] || MATCH_COLORS.Low) : null

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      
      {/* Back Link */}
      <Link to="/dashboard" className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-accent transition-colors">
        <ArrowLeft size={13} /> Back to Job Openings
      </Link>

      {/* error banner */}
      {errorMsg && (
        <div className="card p-4 border-l-2 border-l-red-400 bg-red-500/10 flex items-start gap-3 fade-up">
          <AlertTriangle className="text-red-400 mt-0.5 flex-shrink-0" size={16} />
          <p className="text-xs text-slate-400 flex-1">{errorMsg}</p>
        </div>
      )}

      {/* ── Section 1: Job Header ── */}
      <div className="card p-6 bg-ink-950/80 relative overflow-hidden">
        <div className="absolute -top-16 -right-16 w-36 h-36 rounded-full bg-accent/5 blur-2xl" />
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <span className="section-tag mb-2">
              <Sparkles size={10} /> Active Vacancy
            </span>
            <h1 className="font-display font-bold text-xl sm:text-2xl text-white mt-1">
              {opening.designation}
            </h1>
            <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2 text-xs text-slate-400">
              <span className="flex items-center gap-1"><Building2 size={11} /> {opening.department}</span>
              <span className="flex items-center gap-1"><MapPin size={11} /> {opening.location || 'Remote'}</span>
              <span className="flex items-center gap-1"><Clock size={11} /> {opening.experience || 'Not specified'}</span>
            </div>
          </div>
          {opening.proposedSalary && (
            <div className="text-right flex-shrink-0">
              <p className="text-xs text-slate-500 uppercase tracking-wide">Proposed Salary</p>
              <p className="text-sm font-bold text-accent mt-0.5">{opening.proposedSalary}</p>
            </div>
          )}
        </div>
        {opening.purposeOfJob && (
          <div className="mt-4 pt-4 border-t border-white/6">
            <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Role Description</p>
            <p className="text-xs text-slate-400 leading-relaxed">{opening.purposeOfJob}</p>
          </div>
        )}
      </div>

      {/* ── Section 2: Resume Upload ── */}
      {!candidate ? (
        <div className="card p-6 space-y-4">
          <h3 className="font-display font-semibold text-white text-sm">Step 1: Upload Your Resume</h3>
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
        </div>
      ) : (
        <div className="card p-4 border-l-2 border-l-success/50 bg-success/4 flex items-center gap-3 fade-up">
          <div className="w-8 h-8 rounded-lg bg-success/15 border border-success/30 flex items-center justify-center flex-shrink-0 text-success">
            <CheckCircle2 size={16} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-white truncate">{candidate.fileName}</p>
            <p className="text-[10px] text-slate-500 mt-0.5">Resume parsed and evaluated successfully.</p>
          </div>
         <button
  onClick={async () => {
    // Delete old candidate from DB before replacing
    if (candidate && candidate._id) {
      try {
        await candidateApi.delete(candidate._id)
      } catch (err) {
        console.log('Could not delete old candidate:', err)
      }
    }
    setCandidate(null)
    setFormData({})
  }}
  className="text-[11px] text-slate-500 hover:text-red-400 transition-colors"
>
  Replace Resume
</button>
        </div>
      )}

      {/* ── Section 3: Match Compatibility Score ── */}
      {candidate && mc && (
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
                strokeDashoffset={2 * Math.PI * 26 - (candidate.matchScore / 100) * (2 * Math.PI * 26)}
                style={{ transition: 'stroke-dashoffset 0.8s ease' }}
              />
            </svg>
            <span className="text-white font-bold text-sm font-mono">{candidate.matchScore}%</span>
          </div>
          <div className="flex-1 space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500">Resume Match Level:</span>
              <span className={`badge ${mc.bg} ${mc.text} ${mc.border} border text-[10px]`}>{candidate.matchLevel}</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed mt-1">
              Based on our automated matching engine, your skills and qualifications align with this role's profile. You can review and adjust your profile details below.
            </p>
          </div>
        </div>
      )}

      {/* ── Section 4: Applicant Details Form ── */}
      {candidate && (
        <form onSubmit={handleSubmit} className="card p-6 space-y-5 fade-up">
          <div className="flex items-center gap-2 mb-2">
            <CheckSquare size={15} className="text-accent" />
            <h3 className="font-display font-semibold text-white text-sm">Step 2: Confirm Profile Details</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {DETAIL_FIELDS.map(({ key, Icon: FIcon, label, ph }) => (
              <div key={key}>
                <label className="label flex items-center gap-1.5 text-xs text-slate-400 mb-1">
                  <FIcon size={11} className="text-accent/60" /> {label}
                </label>
                <input
                  className={`field text-xs ${errors[key] ? '!border-red-400/40 !ring-red-400/10' : ''}`}
                  placeholder={ph}
                  value={formData[key] || ''}
                  onChange={e => handleFieldChange(key, e.target.value)}
                />
              </div>
            ))}
          </div>

          <div>
            <label className="label text-xs text-slate-400 mb-1">Other Remarks / Cover Note</label>
            <textarea
              className="field text-xs min-h-[80px] resize-none"
              placeholder="Why are you a good fit for this role? Share additional background context..."
              value={formData.notes || ''}
              onChange={e => handleFieldChange('notes', e.target.value)}
            />
          </div>

          <div className="flex gap-3 justify-end pt-2 border-t border-white/6">
            <button
              type="submit"
              disabled={submitting}
              className={`btn-primary px-8 text-sm ${submitting ? 'opacity-40 cursor-not-allowed' : ''}`}
            >
              {submitting ? 'Submitting Application...' : 'Submit Application'}
            </button>
          </div>
        </form>
      )}

    </div>
  )
}
