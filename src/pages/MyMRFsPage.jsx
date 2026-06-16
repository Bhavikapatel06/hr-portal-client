import React, { useState, useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import {
  Plus, FileText, Clock, CheckCircle2, XCircle, AlertCircle,
  Building2, MapPin, Users, Loader2, Send, Save, Trash2,
  Briefcase, Upload, Eye, ShieldCheck, Flame, Edit3, ArrowRight, ArrowLeft,
  ExternalLink, CheckSquare
} from 'lucide-react'
import { mrfApi } from '../services/api.js'
import MRFForm from '../components/MRFForm.jsx'

// ── Status config ──────────────────────────────────────────────────────────
const STATUS_CONFIG = {
  'Draft':                    { label: 'Draft',            color: 'text-slate-400',   bg: 'bg-slate-400/10 border-slate-400/25',    icon: FileText },
  'Pending Owner Approval':   { label: 'Pending Approval', color: 'text-amber-400',   bg: 'bg-amber-400/10  border-amber-400/25',   icon: Clock },
  'Approved':                 { label: 'Approved',         color: 'text-emerald-400', bg: 'bg-emerald-400/10 border-emerald-400/25', icon: CheckCircle2 },
  'Rejected':                 { label: 'Rejected',         color: 'text-red-400',     bg: 'bg-red-400/10    border-red-400/25',     icon: XCircle },
}

// ── Empty form template ────────────────────────────────────────────────────
const EMPTY_FORM = {
  designation: '', department: '', section: '', location: '',
  noOfPositions: 1, requirementType: '', experience: '',
  reasonForRequest: '', replacementFor: '', justification: '',
  minimumQualification: '', specializations: '', ageRange: '',
  preferredIndustries: '', otherKeySkills: '', itRequirements: '',
  purposeOfJob: '', rolesResponsibilities: '', proposedSalary: '',
  levelOfUrgency: 'Medium', processOwnerName: '', vacancyRemarks: '',
  companyName: '', employeeName: '', employeeDesignation: '',
  additionalRemarks: '', requestType: 'MRF',
}

const inputCls = 'w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-accent/60 focus:ring-1 focus:ring-accent/20 transition-colors'
const selectCls = `${inputCls} appearance-none cursor-pointer`

const getFileUrl = (path) => {
  if (!path) return '';
  const serverUrl = import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL.replace('/api', '') : 'http://localhost:5000';
  return `${serverUrl}/${path}`;
};

function FormField({ label, required, children, span2 }) {
  return (
    <div className={`flex flex-col gap-1.5 ${span2 ? 'sm:col-span-2' : ''}`}>
      <label className="text-xs font-semibold text-slate-400 uppercase tracking-wide">
        {label} {required && <span className="text-red-400">*</span>}
      </label>
      {children}
    </div>
  )
}

// ── MRF Paper Template Modal (matches the physical form) ──────────────────
function MRFTemplateModal({ mrf, onClose, onApprove, onReject, role, actioningApproval }) {
  const [rejectNote, setRejectNote] = useState('')
  const [showRejectInput, setShowRejectInput] = useState(false)
  const isPending = mrf.mrfStatus === 'Pending Owner Approval'

  const Row = ({ label, value, wide }) => (
    <div className={`border border-gray-300 ${wide ? 'col-span-2' : ''}`}>
      <div className="bg-gray-100 px-2 py-1 text-[10px] font-bold text-gray-600 uppercase border-b border-gray-300">{label}</div>
      <div className="px-2 py-2 text-sm text-gray-900 min-h-[32px]">{value || '—'}</div>
    </div>
  )

  const SectionHeader = ({ title }) => (
    <div className="col-span-3 bg-gray-700 text-white text-center py-1.5 text-xs font-bold uppercase tracking-widest mt-1">
      {title}
    </div>
  )

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 bg-black/70 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white rounded-lg shadow-2xl max-w-3xl w-full my-4">
        {/* Modal header */}
        <div className="flex items-center justify-between px-6 py-3 border-b border-gray-200 bg-gray-50 rounded-t-lg">
          <div className="flex items-center gap-2">
            <FileText size={18} className="text-gray-600" />
            <span className="font-bold text-gray-800 text-sm">Manpower Request Form — Preview</span>
            <span className={`ml-2 px-2 py-0.5 rounded text-[10px] font-bold border ${
              STATUS_CONFIG[mrf.mrfStatus]?.bg || ''} ${STATUS_CONFIG[mrf.mrfStatus]?.color || ''}`}>
              {mrf.mrfStatus === 'Pending Owner Approval' ? 'Pending Approval' : mrf.mrfStatus}
            </span>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-700 text-lg font-bold leading-none">✕</button>
        </div>

        {/* Form body — paper style */}
        <div className="p-6 bg-white">
          {/* Title */}
          <div className="border-2 border-gray-800 mb-0">
            <div className="bg-gray-800 text-white text-center py-2 text-sm font-bold tracking-wider">
              MANPOWER REQUEST FORM
            </div>

            {/* Section 1 */}
            <div className="border-b border-gray-400 bg-gray-200 text-center py-1 text-[11px] font-bold uppercase tracking-wider">
              1. Position Details
            </div>
            <div className="grid grid-cols-3 border-t border-gray-300">
              <div className="border border-gray-300 col-span-1">
                <div className="bg-gray-100 px-2 py-0.5 text-[10px] font-bold text-gray-600 border-b border-gray-300">Designation</div>
                <div className="px-2 py-2 text-sm font-semibold text-gray-900 min-h-[36px]">{mrf.designation || '—'}</div>
              </div>
              <div className="border border-gray-300 col-span-1">
                <div className="bg-gray-100 px-2 py-0.5 text-[10px] font-bold text-gray-600 border-b border-gray-300">Department & Sub Function</div>
                <div className="px-2 py-2 text-sm text-gray-900 min-h-[36px]">{mrf.department}{mrf.section ? ` / ${mrf.section}` : ''}</div>
              </div>
              <div className="border border-gray-300 col-span-1">
                <div className="bg-gray-100 px-2 py-0.5 text-[10px] font-bold text-gray-600 border-b border-gray-300">Reports To</div>
                <div className="px-2 py-2 text-sm text-gray-900 min-h-[36px]">{mrf.processOwnerName || '—'}</div>
              </div>

              <div className="border border-gray-300 col-span-1">
                <div className="bg-gray-100 px-2 py-0.5 text-[10px] font-bold text-gray-600 border-b border-gray-300">Location</div>
                <div className="px-2 py-2 text-sm text-gray-900 min-h-[36px]">{mrf.location || '—'}</div>
              </div>
              <div className="border border-gray-300 col-span-1">
                <div className="bg-gray-100 px-2 py-0.5 text-[10px] font-bold text-gray-600 border-b border-gray-300">Experience</div>
                <div className="px-2 py-2 text-sm text-gray-900 min-h-[36px]">{mrf.experience || '—'}</div>
              </div>
              <div className="border border-gray-300 col-span-1">
                <div className="bg-gray-100 px-2 py-0.5 text-[10px] font-bold text-gray-600 border-b border-gray-300">Proposed Salary (CTC Range)</div>
                <div className="px-2 py-2 text-sm text-gray-900 min-h-[36px]">{mrf.proposedSalary || '—'}</div>
              </div>

              <div className="border border-gray-300 col-span-3 px-3 py-2 flex items-center gap-8">
                <span className="text-[11px] font-bold text-gray-600">Level of Urgency:</span>
                {['High', 'Medium', 'Low'].map(u => (
                  <label key={u} className="flex items-center gap-1.5 text-sm text-gray-800">
                    <span className={`w-4 h-4 border-2 border-gray-600 rounded-sm flex items-center justify-center text-[10px] font-bold
                      ${mrf.levelOfUrgency === u ? 'bg-gray-800 text-white' : 'bg-white'}`}>
                      {mrf.levelOfUrgency === u ? '✓' : ''}
                    </span>
                    {u}
                  </label>
                ))}
              </div>
            </div>

            {/* Section 2 */}
            <div className="border-b border-gray-400 bg-gray-200 text-center py-1 text-[11px] font-bold uppercase tracking-wider">
              2. Reasons for Request
            </div>
            <div className="grid grid-cols-3">
              <div className="border border-gray-300 col-span-1">
                <div className="bg-gray-100 px-2 py-0.5 text-[10px] font-bold text-gray-600 border-b border-gray-300">New / Replacement</div>
                <div className="px-2 py-2 text-sm text-gray-900 min-h-[36px]">{mrf.reasonForRequest || '—'}</div>
              </div>
              <div className="border border-gray-300 col-span-1">
                <div className="bg-gray-100 px-2 py-0.5 text-[10px] font-bold text-gray-600 border-b border-gray-300">No. of Position</div>
                <div className="px-2 py-2 text-sm text-gray-900 min-h-[36px]">{mrf.noOfPositions || 1}</div>
              </div>
              <div className="border border-gray-300 col-span-1">
                <div className="bg-gray-100 px-2 py-0.5 text-[10px] font-bold text-gray-600 border-b border-gray-300">Replacement For</div>
                <div className="px-2 py-2 text-sm text-gray-900 min-h-[36px]">{mrf.replacementFor || '—'}</div>
              </div>
              <div className="border border-gray-300 col-span-3">
                <div className="bg-gray-100 px-2 py-0.5 text-[10px] font-bold text-gray-600 border-b border-gray-300">Justification for this Opening</div>
                <div className="px-2 py-3 text-sm text-gray-900 min-h-[48px] whitespace-pre-wrap">{mrf.justification || '—'}</div>
              </div>
            </div>

            {/* Section 3 */}
            <div className="border-b border-gray-400 bg-gray-200 text-center py-1 text-[11px] font-bold uppercase tracking-wider">
              3. Job Description
            </div>
            <div className="grid grid-cols-1">
              <div className="border border-gray-300">
                <div className="bg-gray-100 px-2 py-0.5 text-[10px] font-bold text-gray-600 border-b border-gray-300">Purpose of the Job</div>
                <div className="px-2 py-3 text-sm text-gray-900 min-h-[40px] whitespace-pre-wrap">{mrf.purposeOfJob || '—'}</div>
              </div>
              <div className="border border-gray-300">
                <div className="bg-gray-100 px-2 py-0.5 text-[10px] font-bold text-gray-600 border-b border-gray-300">Roles and Responsibilities (With Proper Job Description)</div>
                <div className="px-2 py-3 text-sm text-gray-900 min-h-[60px] whitespace-pre-wrap">{mrf.rolesResponsibilities || '—'}</div>
              </div>
            </div>

            {/* Section 4 */}
            <div className="border-b border-gray-400 bg-gray-200 text-center py-1 text-[11px] font-bold uppercase tracking-wider">
              4. Qualification &amp; Other Criteria
            </div>
            <div className="grid grid-cols-3">
              <div className="border border-gray-300 col-span-1">
                <div className="bg-gray-100 px-2 py-0.5 text-[10px] font-bold text-gray-600 border-b border-gray-300">Minimum Qualification</div>
                <div className="px-2 py-2 text-sm text-gray-900 min-h-[36px]">{mrf.minimumQualification || '—'}</div>
              </div>
              <div className="border border-gray-300 col-span-1">
                <div className="bg-gray-100 px-2 py-0.5 text-[10px] font-bold text-gray-600 border-b border-gray-300">Specializations</div>
                <div className="px-2 py-2 text-sm text-gray-900 min-h-[36px]">{mrf.specializations || '—'}</div>
              </div>
              <div className="border border-gray-300 col-span-1">
                <div className="bg-gray-100 px-2 py-0.5 text-[10px] font-bold text-gray-600 border-b border-gray-300">Age in Range</div>
                <div className="px-2 py-2 text-sm text-gray-900 min-h-[36px]">{mrf.ageRange || '—'}</div>
              </div>
              <div className="border border-gray-300 col-span-3">
                <div className="bg-gray-100 px-2 py-0.5 text-[10px] font-bold text-gray-600 border-b border-gray-300">Preferred Industries / Sectors</div>
                <div className="px-2 py-2 text-sm text-gray-900 min-h-[36px]">{mrf.preferredIndustries || '—'}</div>
              </div>
              <div className="border border-gray-300 col-span-3">
                <div className="bg-gray-100 px-2 py-0.5 text-[10px] font-bold text-gray-600 border-b border-gray-300">Other Key Skills &amp; explain the kind of relevant experience</div>
                <div className="px-2 py-3 text-sm text-gray-900 min-h-[40px] whitespace-pre-wrap">{mrf.otherKeySkills || '—'}</div>
              </div>
              <div className="border border-gray-300 col-span-3">
                <div className="bg-gray-100 px-2 py-0.5 text-[10px] font-bold text-gray-600 border-b border-gray-300">IT Requirements (Laptop / Desktop / Special software etc)</div>
                <div className="px-2 py-2 text-sm text-gray-900 min-h-[36px]">{mrf.itRequirements || '—'}</div>
              </div>
            </div>

            {/* Additional metadata row */}
            {(mrf.employeeName || mrf.vacancyRemarks || mrf.companyName) && (
              <>
                <div className="border-b border-gray-400 bg-gray-200 text-center py-1 text-[11px] font-bold uppercase tracking-wider">
                  5. Additional Information
                </div>
                <div className="grid grid-cols-3">
                  <div className="border border-gray-300 col-span-1">
                    <div className="bg-gray-100 px-2 py-0.5 text-[10px] font-bold text-gray-600 border-b border-gray-300">Employee Name (Replacement)</div>
                    <div className="px-2 py-2 text-sm text-gray-900 min-h-[36px]">{mrf.employeeName || '—'}</div>
                  </div>
                  <div className="border border-gray-300 col-span-1">
                    <div className="bg-gray-100 px-2 py-0.5 text-[10px] font-bold text-gray-600 border-b border-gray-300">Employee Designation</div>
                    <div className="px-2 py-2 text-sm text-gray-900 min-h-[36px]">{mrf.employeeDesignation || '—'}</div>
                  </div>
                  <div className="border border-gray-300 col-span-1">
                    <div className="bg-gray-100 px-2 py-0.5 text-[10px] font-bold text-gray-600 border-b border-gray-300">Company Name</div>
                    <div className="px-2 py-2 text-sm text-gray-900 min-h-[36px]">{mrf.companyName || '—'}</div>
                  </div>
                  {mrf.vacancyRemarks && (
                    <div className="border border-gray-300 col-span-3">
                      <div className="bg-gray-100 px-2 py-0.5 text-[10px] font-bold text-gray-600 border-b border-gray-300">Vacancy Remarks</div>
                      <div className="px-2 py-2 text-sm text-gray-900 min-h-[36px]">{mrf.vacancyRemarks}</div>
                    </div>
                  )}
                </div>
              </>
            )}

            {/* Attached Documents row */}
            {(mrf.mrfFilePath || mrf.jdFilePath) && (
              <>
                <div className="border-b border-gray-400 bg-gray-200 text-center py-1 text-[11px] font-bold uppercase tracking-wider mt-1">
                  Attached Documents
                </div>
                <div className="grid grid-cols-2">
                  <div className="border border-gray-300 col-span-1">
                    <div className="bg-gray-100 px-2 py-0.5 text-[10px] font-bold text-gray-600 border-b border-gray-300">MRF Document</div>
                    <div className="px-2 py-2 text-sm text-gray-900 min-h-[36px]">
                      {mrf.mrfFilePath ? (
                        <a href={getFileUrl(mrf.mrfFilePath)} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-blue-600 hover:underline font-semibold">
                          <FileText size={14} /> {mrf.mrfFileName || 'Download MRF'}
                        </a>
                      ) : '—'}
                    </div>
                  </div>
                  <div className="border border-gray-300 col-span-1">
                    <div className="bg-gray-100 px-2 py-0.5 text-[10px] font-bold text-gray-600 border-b border-gray-300">JD Document</div>
                    <div className="px-2 py-2 text-sm text-gray-900 min-h-[36px]">
                      {mrf.jdFilePath ? (
                        <a href={getFileUrl(mrf.jdFilePath)} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-blue-600 hover:underline font-semibold">
                          <FileText size={14} /> {mrf.jdFileName || 'Download JD'}
                        </a>
                      ) : '—'}
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* Rejection note if any */}
            {mrf.mrfStatus === 'Rejected' && mrf.rejectionNote && (
              <div className="bg-red-50 border-t-2 border-red-400 px-4 py-3">
                <p className="text-xs font-bold text-red-600 uppercase mb-1">Rejection Note</p>
                <p className="text-sm text-red-800">{mrf.rejectionNote}</p>
              </div>
            )}
          </div>

          {/* Submitted by / date */}
          <div className="flex items-center justify-between mt-3 text-xs text-gray-500">
            <span>Submitted by: <strong className="text-gray-700">{mrf.submittedBy || 'Unknown'}</strong></span>
            <span>Date: <strong className="text-gray-700">{new Date(mrf.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</strong></span>
          </div>
        </div>

        {/* Admin Actions Footer */}
        {role === 'admin' && isPending && (
          <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 rounded-b-lg space-y-3">
            {showRejectInput ? (
              <div className="space-y-2">
                <p className="text-xs font-semibold text-gray-600">Enter rejection reason:</p>
                <textarea
                  value={rejectNote}
                  onChange={(e) => setRejectNote(e.target.value)}
                  rows={2}
                  placeholder="State the reason for rejection..."
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-red-400 resize-none"
                />
                <div className="flex gap-2 justify-end">
                  <button
                    onClick={() => setShowRejectInput(false)}
                    className="px-4 py-2 rounded-lg bg-gray-100 border border-gray-300 text-gray-600 text-xs font-semibold hover:bg-gray-200 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => onReject(mrf._id, rejectNote)}
                    disabled={actioningApproval}
                    className="px-4 py-2 rounded-lg bg-red-500 hover:bg-red-600 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors"
                  >
                    {actioningApproval ? <Loader2 size={12} className="animate-spin" /> : <XCircle size={12} />}
                    Confirm Rejection
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex gap-3">
                <button
                  onClick={() => onApprove(mrf._id)}
                  disabled={actioningApproval}
                  className="flex-1 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-sm flex items-center justify-center gap-2 transition-colors"
                >
                  {actioningApproval ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle2 size={15} />}
                  Approve MRF
                </button>
                <button
                  onClick={() => setShowRejectInput(true)}
                  className="flex-1 py-2.5 rounded-xl bg-red-500/90 hover:bg-red-600 text-white font-bold text-sm flex items-center justify-center gap-2 transition-colors"
                >
                  <XCircle size={15} /> Reject MRF
                </button>
              </div>
            )}
          </div>
        )}

        {/* Close button when already approved/rejected */}
        {(role !== 'admin' || !isPending) && (
          <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 rounded-b-lg flex justify-end">
            <button
              onClick={onClose}
              className="px-6 py-2 rounded-xl bg-gray-700 hover:bg-gray-800 text-white font-semibold text-sm transition-colors"
            >
              Close
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

// ── Upload Confirmation Modal ──────────────────────────────────────────────
function UploadConfirmationModal({ details, onConfirm, onEditCancel }) {
  if (!details) return null;

  const fields = [
    { label: 'Designation', value: details.designation },
    { label: 'Department', value: details.department },
    { label: 'Location', value: details.location },
    { label: 'Experience Required', value: details.experience },
    { label: 'Minimum Qualification', value: details.minimumQualification },
    { label: 'Other Key Skills', value: details.otherKeySkills },
    { label: 'Number of Positions', value: details.noOfPositions },
    { label: 'Level of Urgency', value: details.urgency },
    { label: 'Preferred Industries', value: details.preferredIndustries },
    { label: 'Purpose of Job', value: details.purposeOfJob, span2: true },
    { label: 'Roles & Responsibilities', value: details.rolesAndResponsibilities, span2: true },
  ];

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm overflow-y-auto">
      <div className="bg-ink-950 border border-white/10 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden animate-scaleUp">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-white/5 flex items-center gap-3 bg-white/3 flex-shrink-0">
          <div className="w-10 h-10 rounded-xl bg-accent/15 border border-accent/25 flex items-center justify-center text-accent">
            <CheckSquare size={20} />
          </div>
          <div>
            <h3 className="font-display font-bold text-white text-base">
              Verify Extracted {details.fileType} Details
            </h3>
            <p className="text-slate-400 text-xs mt-0.5">
              Review and confirm the information parsed from <strong>{details.fileName}</strong>.
            </p>
          </div>
        </div>

        {/* Content */}
        <div className="overflow-y-auto p-6 space-y-4 flex-1">
          {/* Warn if parsing could not extract details */}
          {details._parseNote && (
            <div className="flex items-start gap-2.5 p-3 rounded-xl bg-amber-500/10 border border-amber-500/25 text-amber-300 text-xs">
              <span className="text-amber-400 mt-0.5">⚠</span>
              <span>
                <strong>AI parsing could not extract details</strong> from this file ({details._parseNote}).
                Fields below are empty — please fill them in manually after confirming.
              </span>
            </div>
          )}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {fields.map((f, idx) => (
              <div key={idx} className={`bg-white/2 border border-white/5 rounded-xl p-3 ${f.span2 ? 'sm:col-span-2' : ''}`}>
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">{f.label}</span>
                <span className="text-xs text-white mt-1 block whitespace-pre-wrap leading-relaxed">
                  {f.value || '—'}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Footer — only Edit option; user must click Submit Request at the bottom of the form */}
        <div className="px-6 py-4 border-t border-white/5 bg-white/2 flex items-center gap-3 flex-shrink-0">
          <div className="flex-1 text-xs text-slate-500">
            <span className="text-amber-400 font-semibold">📋 Review complete?</span>&nbsp; Close this preview and click <strong className="text-white">Submit Request</strong> at the bottom when both MRF &amp; JD are ready.
          </div>
          <button
            onClick={onEditCancel}
            className="px-5 py-2.5 rounded-xl bg-accent/10 border border-accent/25 text-accent text-xs font-bold hover:bg-accent hover:text-white transition-all flex items-center gap-1.5"
          >
            <Edit3 size={13} /> Edit Details &amp; Close
          </button>
        </div>

      </div>
    </div>
  );
}

// ── Main Component ─────────────────────────────────────────────────────────
export default function MyMRFsPage() {
  const locationState = useLocation().state
  const [mrfs, setMrfs] = useState([])
  const [loading, setLoading] = useState(true)

  // MRF Creation variables (Dept Head)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [parsing, setParsing] = useState(false)
  const [form, setForm] = useState(EMPTY_FORM)
  const [saving, setSaving] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [isCreating, setIsCreating] = useState(false)

  // Stepper Wizard states
  const [activeStep, setActiveStep] = useState(1)
  const [mrfMethod, setMrfMethod] = useState('manual') // 'manual' | 'upload'
  const [jdMethod, setJdMethod] = useState('manual')   // 'manual' | 'upload'
  const [uploadingMrf, setUploadingMrf] = useState(false)
  const [uploadingJd, setUploadingJd] = useState(false)
  const [mrfFile, setMrfFile] = useState(null) // { name, path }
  const [jdFile, setJdFile] = useState(null)   // { name, path }
  const [confirmModal, setConfirmModal] = useState(null) // { message, onConfirm }
  const [extractedDetails, setExtractedDetails] = useState(null)

  // Action states
  const [actioningApproval, setActioningApproval] = useState(false)
  const [postingJobId, setPostingJobId] = useState(null)

  // MRF template viewer (Admin)
  const [viewingMrf, setViewingMrf] = useState(null)

  const [toast, setToast] = useState(null)
  const [filter, setFilter] = useState('All')

  const [role, setRole] = useState(() => localStorage.getItem('hr_role') || 'candidate')
  const userName = (() => { try { return JSON.parse(localStorage.getItem('hr_user'))?.name } catch { return 'You' } })()

  useEffect(() => {
    const handleStorageChange = () => {
      setRole(localStorage.getItem('hr_role') || 'candidate')
    }
    window.addEventListener('storage', handleStorageChange)
    return () => window.removeEventListener('storage', handleStorageChange)
  }, [])

  useEffect(() => {
    loadMRFs()
    if (locationState?.openNewRequest && role === 'department_head') {
      setIsCreating(true)
      setShowForm(true)
      setMrfMethod('manual')
      setJdMethod('manual')
      setMrfFile(null)
      setJdFile(null)
      setForm(EMPTY_FORM)
      setEditingId(null)
    }
  }, [locationState, role])

  const loadMRFs = async () => {
    setLoading(true)
    try {
      const all = await mrfApi.list()
      if (role === 'department_head') {
        // HOD sees their drafts and submitted MRFs
        setMrfs(all.filter(m => m.submittedBy === userName || !m.submittedBy))
      } else if (role === 'admin') {
        // Admin sees all non-draft MRFs to review
        setMrfs(all.filter(m => m.mrfStatus !== 'Draft'))
      } else {
        // HR sees only approved MRFs
        setMrfs(all.filter(m => m.mrfStatus === 'Approved'))
      }
    } catch (e) {
      showToast('Failed to load MRFs: ' + e.message, 'error')
    } finally {
      setLoading(false)
    }
  }

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 4000)
  }

  const handleFormChange = (e) => {
    const { name, value } = e.target
    setForm(f => ({ ...f, [name]: value }))
  }

  const handleMrfFileUpload = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploadingMrf(true)
    try {
      const res = await mrfApi.uploadAttachment(file)
      try {
        const parsed = await mrfApi.parseFile(file)
        // Show preview popup — do NOT submit yet
        setExtractedDetails({
          ...parsed,
          fileType: 'MRF',
          fileName: res.fileName,
          filePath: res.filePath,
        })
        showToast('MRF uploaded & parsed — review the details below ✓')
      } catch (parseErr) {
        console.warn('MRF parse unavailable:', parseErr.message)
        // No popup needed — just mark file ready
        setMrfFile({ name: res.fileName, path: res.filePath })
        setForm(prev => ({ ...prev, mrfFileName: res.fileName, mrfFilePath: res.filePath }))
        showToast('MRF file uploaded. AI parsing unavailable — fill details manually.', 'error')
      }
    } catch (err) {
      console.error('MRF upload error:', err)
      showToast(err.message || 'Failed to upload MRF document', 'error')
    } finally {
      setUploadingMrf(false)
      e.target.value = ''
    }
  }

  const handleJdFileUpload = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploadingJd(true)
    try {
      const res = await mrfApi.uploadAttachment(file)
      try {
        const parsed = await mrfApi.parseFile(file)
        // Show preview popup — do NOT submit yet
        setExtractedDetails({
          ...parsed,
          fileType: 'JD',
          fileName: res.fileName,
          filePath: res.filePath,
        })
        showToast('JD uploaded & parsed — review the details below ✓')
      } catch (parseErr) {
        console.warn('JD parse unavailable:', parseErr.message)
        setJdFile({ name: res.fileName, path: res.filePath })
        setForm(prev => ({ ...prev, jdFileName: res.fileName, jdFilePath: res.filePath }))
        showToast('JD file uploaded. AI parsing unavailable — fill details manually.', 'error')
      }
    } catch (err) {
      console.error('JD upload error:', err)
      showToast(err.message || 'Failed to upload JD document', 'error')
    } finally {
      setUploadingJd(false)
      e.target.value = ''
    }
  }

  // handleConfirmAndSubmit is REMOVED — upload popup no longer triggers submit.
  // Instead, "Edit Details & Close" loads parsed data into the form for review.
  // The actual submit only happens via the bottom "Submit Request" button.

  // "Edit Details & Close" in the upload preview popup — merges parsed data into form,
  // marks the file as ready, and dismisses the popup so user can review inline.
  const handleEditCancel = (details) => {
    setExtractedDetails(null)
    setForm(prev => {
      const updated = {
        ...prev,
        designation: details.designation || prev.designation,
        department: details.department || prev.department,
        location: details.location || prev.location,
        experience: details.experience || prev.experience,
        minimumQualification: details.minimumQualification || prev.minimumQualification,
        otherKeySkills: details.otherKeySkills || prev.otherKeySkills,
        noOfPositions: parseInt(details.noOfPositions) || prev.noOfPositions || 1,
        levelOfUrgency: ['High', 'Medium', 'Low'].includes(details.urgency) ? details.urgency : 'Medium',
        purposeOfJob: details.purposeOfJob || prev.purposeOfJob,
        rolesResponsibilities: details.rolesAndResponsibilities || prev.rolesResponsibilities,
        preferredIndustries: details.preferredIndustries || prev.preferredIndustries,
      }
      if (details.fileType === 'MRF') {
        updated.mrfFileName = details.fileName
        updated.mrfFilePath = details.filePath
      } else if (details.fileType === 'JD') {
        updated.jdFileName = details.fileName
        updated.jdFilePath = details.filePath
      }
      return updated
    })

    if (details.fileType === 'MRF') {
      setMrfFile({ name: details.fileName, path: details.filePath })
      // Switch to manual so user can review/edit extracted fields inline
      setMrfMethod('manual')
    } else if (details.fileType === 'JD') {
      setJdFile({ name: details.fileName, path: details.filePath })
      setJdMethod('manual')
    }
    showToast('Details loaded — review and edit if needed, then click Submit Request.')
  }

  const handleSaveDraft = async () => {
    if (!form.designation?.trim()) return showToast('Designation is required.', 'error')
    setSaving(true)
    try {
      const payload = {
        ...form,
        mrfFileName: mrfMethod === 'upload' && mrfFile ? mrfFile.name : '',
        mrfFilePath: mrfMethod === 'upload' && mrfFile ? mrfFile.path : '',
        jdFileName: jdMethod === 'upload' && jdFile ? jdFile.name : '',
        jdFilePath: jdMethod === 'upload' && jdFile ? jdFile.path : '',
      }
      if (editingId) {
        await mrfApi.update(editingId, { ...payload, mrfStatus: 'Draft' })
        showToast('Draft updated. ✓')
      } else {
        await mrfApi.saveDraft(payload)
        showToast('MRF saved as Draft. ✓')
      }
      setShowForm(false)
      setIsCreating(false)
      setForm(EMPTY_FORM)
      setEditingId(null)
      setMrfFile(null)
      setJdFile(null)
      setMrfMethod('manual')
      setJdMethod('manual')
      loadMRFs()
    } catch (e) {
      showToast(e.message, 'error')
    } finally {
      setSaving(false)
    }
  }

  const handleSubmit = async () => {
    if (!form.designation?.trim()) return showToast('Designation is required.', 'error')
    if (mrfMethod === 'manual' && !form.department?.trim()) return showToast('Department is required.', 'error')
    if (mrfMethod === 'upload' && !mrfFile) return showToast('Please upload an MRF document.', 'error')
    if (jdMethod === 'upload' && !jdFile) return showToast('Please upload a JD document.', 'error')
    setSubmitting(true)
    try {
      const payload = {
        ...form,
        mrfFileName: mrfMethod === 'upload' && mrfFile ? mrfFile.name : '',
        mrfFilePath: mrfMethod === 'upload' && mrfFile ? mrfFile.path : '',
        jdFileName: jdMethod === 'upload' && jdFile ? jdFile.name : '',
        jdFilePath: jdMethod === 'upload' && jdFile ? jdFile.path : '',
      }
      if (editingId) {
        await mrfApi.update(editingId, { ...payload, mrfStatus: 'Pending Owner Approval' })
        await mrfApi.submitDraft(editingId)
        showToast('MRF updated and submitted! ✓')
      } else {
        await mrfApi.submit({ ...payload, mrfStatus: 'Pending Owner Approval' })
        showToast('MRF submitted for approval! ✓')
      }
      setShowForm(false)
      setIsCreating(false)
      setForm(EMPTY_FORM)
      setEditingId(null)
      setMrfFile(null)
      setJdFile(null)
      setMrfMethod('manual')
      setJdMethod('manual')
      loadMRFs()
    } catch (e) {
      showToast(e.message, 'error')
    } finally {
      setSubmitting(false)
    }
  }

  const handleCloseForm = () => {
    setShowForm(false)
    setIsCreating(false)
    setEditingId(null)
    setForm(EMPTY_FORM)
    setMrfMethod('manual')
    setJdMethod('manual')
    setMrfFile(null)
    setJdFile(null)
    setActiveStep(1)
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this MRF?')) return
    try {
      setMrfs(prev => prev.filter(m => m._id !== id))
      await mrfApi.delete(id)
      showToast('MRF deleted.')
      const all = await mrfApi.list()
      if (role === 'department_head') {
        setMrfs(all.filter(m => m.submittedBy === userName || !m.submittedBy))
      } else if (role === 'admin') {
        setMrfs(all.filter(m => m.mrfStatus !== 'Draft'))
      } else {
        setMrfs(all.filter(m => m.mrfStatus === 'Approved'))
      }
    } catch (e) {
      showToast(e.message, 'error')
      loadMRFs()
    }
  }

  // ── Admin Review Approvals ─────────────────────────────────────────────
  const handleApprove = async (id) => {
    setActioningApproval(true)
    try {
      await mrfApi.approve(id)
      showToast('MRF approved successfully! ✓')
      setViewingMrf(null)
      loadMRFs()
    } catch (e) {
      showToast(e.message, 'error')
    } finally {
      setActioningApproval(false)
    }
  }

  const handleReject = async (id, note) => {
    setActioningApproval(true)
    try {
      await mrfApi.reject(id, note)
      showToast('MRF has been rejected.')
      setViewingMrf(null)
      loadMRFs()
    } catch (e) {
      showToast(e.message, 'error')
    } finally {
      setActioningApproval(false)
    }
  }

  // ── HR — Post Approved MRF as Job ─────────────────────────────────────
  const handlePostJob = async (id) => {
    setPostingJobId(id)
    try {
      await mrfApi.createJob(id)
      showToast('Job posted successfully! Candidates can now apply. ✓')
      loadMRFs()
    } catch (e) {
      showToast(e.message, 'error')
    } finally {
      setPostingJobId(null)
    }
  }

  // ── Filters ────────────────────────────────────────────────────────────
  const FILTERS = role === 'department_head'
    ? ['All', 'Draft', 'Pending Owner Approval', 'Approved', 'Rejected']
    : role === 'admin'
    ? ['All', 'Pending Owner Approval', 'Approved', 'Rejected']
    : ['All', 'Approved']

  const filteredMRFs = filter === 'All'
    ? mrfs
    : mrfs.filter(m => m.mrfStatus === filter)

  // ── Render ─────────────────────────────────────────────────────────────
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-8">

      {/* Toast */}
      {toast && (
        <div className={`fixed top-20 right-5 z-50 px-4 py-3 rounded-xl shadow-xl text-sm font-medium border fade-up
          ${toast.type === 'error'
            ? 'bg-red-500/15 border-red-500/30 text-red-300'
            : 'bg-emerald-500/15 border-emerald-500/30 text-emerald-300'}`}>
          {toast.msg}
        </div>
      )}

      {/* Upload preview popup — shows extracted details, user edits inline, then submits via bottom button */}
      {extractedDetails && (
        <UploadConfirmationModal
          details={extractedDetails}
          onConfirm={null}
          onEditCancel={() => handleEditCancel(extractedDetails)}
        />
      )}

      {/* Confirmation Modal */}
      {confirmModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="card max-w-sm w-full p-6 border border-emerald-500/25 space-y-4 text-center animate-scaleUp">
            <CheckCircle2 size={40} className="text-emerald-400 mx-auto" />
            <div className="space-y-1">
              <h4 className="font-display font-bold text-white text-base">Success</h4>
              <p className="text-xs text-slate-300">{confirmModal.message}</p>
            </div>
            <button
              onClick={() => {
                const onConfirm = confirmModal.onConfirm
                setConfirmModal(null)
                if (onConfirm) onConfirm()
              }}
              className="w-full btn-primary justify-center bg-emerald-500 hover:bg-emerald-600 border-emerald-500/30 text-white font-bold"
            >
              OK
            </button>
          </div>
        </div>
      )}

      {/* MRF Template Modal (Admin view) */}
      {viewingMrf && (
        <MRFTemplateModal
          mrf={viewingMrf}
          role={role}
          onClose={() => setViewingMrf(null)}
          onApprove={handleApprove}
          onReject={handleReject}
          actioningApproval={actioningApproval}
        />
      )}

      {/* Filter Tabs & Actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 fade-up-1">
        <div className="flex items-center gap-2 flex-wrap">
          {FILTERS.map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all duration-150
                ${filter === f
                  ? 'bg-accent text-white border-accent shadow-glow-sm'
                  : 'bg-white/5 border-white/10 text-slate-400 hover:text-white hover:bg-white/10'}`}
            >
              {f === 'Pending Owner Approval' ? 'Pending Approval' : f}
              {f !== 'All' && (
                <span className="ml-1 opacity-60">
                  ({mrfs.filter(m => m.mrfStatus === f).length})
                </span>
              )}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-3 ml-auto sm:ml-0 flex-shrink-0">
          <span className="text-xs text-slate-600">{filteredMRFs.length} requisition(s)</span>
          {role === 'department_head' && !isCreating && (
            <button
              id="new-mrf-btn"
              onClick={() => {
                setEditingId(null)
                setForm(EMPTY_FORM)
                setMrfMethod(null)
                setJdMethod(null)
                setMrfFile(null)
                setJdFile(null)
                setActiveStep(1)
                setIsCreating(true)
                setShowForm(true)
              }}
              className="btn-primary py-1.5 px-3 text-xs flex items-center gap-1.5"
            >
              <Plus size={13} /> Create MRF Request
            </button>
          )}
        </div>
      </div>

      {/* HOD: Direct Unified Requisition Form */}
      {showForm && (
        <div className="card p-6 fade-up border-accent/20 border space-y-8">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-white/5 pb-4">
            <h2 className="font-display font-bold text-lg text-white flex items-center gap-2">
              <Plus size={18} className="text-accent" />
              {editingId ? 'Edit Requisition Draft' : 'Create MRF Request'}
            </h2>
            <button onClick={handleCloseForm} className="text-slate-500 hover:text-white transition-colors text-xs">
              ✕ Close Form
            </button>
          </div>

          {/* Primary Requisition Details (Required for all MRF requests) */}
          <div className="space-y-4">
            <h3 className="font-display font-bold text-white text-base">Requisition Position Info</h3>
            <p className="text-xs text-slate-400">Specify the core details of the role. These fields are mandatory to identify the position.</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-white/3 border border-white/8 rounded-2xl p-5">
              <FormField label="Requisition Designation / Role" required>
                <input
                  name="designation"
                  value={form.designation}
                  onChange={handleFormChange}
                  placeholder="e.g. Senior React Developer"
                  className={inputCls}
                />
              </FormField>
              <FormField label="Department / Functional Area" required={mrfMethod === 'manual'}>
                <input
                  name="department"
                  value={form.department}
                  onChange={handleFormChange}
                  placeholder="e.g. Engineering"
                  className={inputCls}
                />
              </FormField>
            </div>
          </div>

          {/* Section 1: MRF Requisition Setup */}
          <div className="space-y-4 border-t border-white/5 pt-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
              <div>
                <h3 className="font-display font-bold text-white text-base">1. Manpower Request Form (MRF) Setup</h3>
                <p className="text-xs text-slate-400">Fill standard requisition details or upload an existing MRF document.</p>
              </div>
              
              {/* Tab Selector */}
              <div className="flex bg-white/5 border border-white/10 rounded-xl p-1">
                <button
                  type="button"
                  onClick={() => setMrfMethod('manual')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    mrfMethod === 'manual'
                      ? 'bg-accent text-white shadow-glow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Fill Manually
                </button>
                <button
                  type="button"
                  onClick={() => setMrfMethod('upload')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    mrfMethod === 'upload'
                      ? 'bg-accent text-white shadow-glow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Upload MRF File
                </button>
              </div>
            </div>

            {mrfMethod === 'upload' ? (
              <div className="border border-white/5 rounded-2xl p-6 bg-ink-950/20 max-w-xl animate-fadeIn">
                {!mrfFile ? (
                  <div className="relative border-2 border-dashed border-white/10 hover:border-accent/30 bg-white/2 rounded-2xl p-8 text-center cursor-pointer transition-all duration-200">
                    <input
                      type="file"
                      accept=".pdf,.doc,.docx"
                      onChange={handleMrfFileUpload}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      disabled={uploadingMrf}
                    />
                    {uploadingMrf ? (
                      <div className="flex flex-col items-center gap-3 py-2">
                        <Loader2 size={24} className="animate-spin text-accent" />
                        <p className="text-xs text-white font-semibold">Uploading Requisition Document...</p>
                        <p className="text-[10px] text-slate-500">Please wait while the file is uploaded</p>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center mx-auto text-slate-400">
                          <Upload size={18} />
                        </div>
                        <p className="text-xs text-slate-200 font-bold">Click or drag MRF document here</p>
                        <p className="text-[10px] text-slate-500 leading-normal">PDF, DOC, or DOCX (Max 5MB)</p>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="p-4 rounded-xl border border-emerald-500/25 bg-emerald-500/5 flex items-center justify-between gap-3 animate-scaleUp">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 flex-shrink-0">
                        <FileText size={16} />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-white truncate">{mrfFile.name}</p>
                        <p className="text-[10px] text-emerald-400 font-medium">Uploaded Successfully</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setMrfFile(null)
                        setForm(prev => ({ ...prev, mrfFileName: '', mrfFilePath: '' }))
                      }}
                      className="text-xs font-bold text-red-400 hover:text-red-300 transition-colors uppercase tracking-wider flex-shrink-0"
                    >
                      Change File
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-6 bg-white/2 border border-white/5 rounded-2xl p-5 animate-fadeIn">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  <FormField label="Section">
                    <input name="section" value={form.section} onChange={handleFormChange} placeholder="e.g. Cloud Systems" className={inputCls} />
                  </FormField>
                  <FormField label="Location">
                    <input name="location" value={form.location} onChange={handleFormChange} placeholder="e.g. Ahmedabad" className={inputCls} />
                  </FormField>
                  <FormField label="Experience Required">
                    <input name="experience" value={form.experience} onChange={handleFormChange} placeholder="e.g. 3-5 years" className={inputCls} />
                  </FormField>
                  <FormField label="Proposed Salary (CTC Range)">
                    <input name="proposedSalary" value={form.proposedSalary} onChange={handleFormChange} placeholder="e.g. 10-15 LPA" className={inputCls} />
                  </FormField>
                  <FormField label="Reports To (Process Owner)">
                    <input name="processOwnerName" value={form.processOwnerName} onChange={handleFormChange} placeholder="Reporting manager name" className={inputCls} />
                  </FormField>
                  <FormField label="Level of Urgency">
                    <select name="levelOfUrgency" value={form.levelOfUrgency || 'Medium'} onChange={handleFormChange} className={selectCls}>
                      <option>Medium</option>
                      <option>High</option>
                      <option>Low</option>
                    </select>
                  </FormField>
                  <FormField label="Company Name">
                    <input name="companyName" value={form.companyName} onChange={handleFormChange} placeholder="Business unit" className={inputCls} />
                  </FormField>
                  <FormField label="New / Replacement">
                    <select name="reasonForRequest" value={form.reasonForRequest} onChange={handleFormChange} className={selectCls}>
                      <option value="">Select...</option>
                      <option>New Position</option>
                      <option>Replacement</option>
                      <option>Additional Headcount</option>
                      <option>Transfer</option>
                      <option>Retirement</option>
                    </select>
                  </FormField>
                  <FormField label="No. of Positions">
                    <input name="noOfPositions" type="number" min="1" value={form.noOfPositions} onChange={handleFormChange} className={inputCls} />
                  </FormField>
                  {form.reasonForRequest === 'Replacement' && (
                    <FormField label="Replacement For">
                      <input name="replacementFor" value={form.replacementFor} onChange={handleFormChange} placeholder="Employee name" className={inputCls} />
                    </FormField>
                  )}
                  <FormField label="Justification for this Requisition" span2>
                    <textarea name="justification" value={form.justification} onChange={handleFormChange} rows={2} placeholder="Hiring justification..." className={`${inputCls} resize-none`} />
                  </FormField>
                </div>
              </div>
            )}
          </div>

          {/* Section 2: JD Setup */}
          <div className="space-y-4 border-t border-white/5 pt-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
              <div>
                <h3 className="font-display font-bold text-white text-base">2. Job Description (JD) Setup</h3>
                <p className="text-xs text-slate-400">Specify details manually or upload an existing JD document.</p>
              </div>
              
              {/* Tab Selector */}
              <div className="flex bg-white/5 border border-white/10 rounded-xl p-1">
                <button
                  type="button"
                  onClick={() => setJdMethod('manual')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    jdMethod === 'manual'
                      ? 'bg-accent text-white shadow-glow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Fill Manually
                </button>
                <button
                  type="button"
                  onClick={() => setJdMethod('upload')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    jdMethod === 'upload'
                      ? 'bg-accent text-white shadow-glow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Upload JD File
                </button>
              </div>
            </div>

            {jdMethod === 'upload' ? (
              <div className="border border-white/5 rounded-2xl p-6 bg-ink-950/20 max-w-xl animate-fadeIn">
                {!jdFile ? (
                  <div className="relative border-2 border-dashed border-white/10 hover:border-accent/30 bg-white/2 rounded-2xl p-8 text-center cursor-pointer transition-all duration-200">
                    <input
                      type="file"
                      accept=".pdf,.doc,.docx"
                      onChange={handleJdFileUpload}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      disabled={uploadingJd}
                    />
                    {uploadingJd ? (
                      <div className="flex flex-col items-center gap-3 py-2">
                        <Loader2 size={24} className="animate-spin text-accent" />
                        <p className="text-xs text-white font-semibold">Uploading JD Document...</p>
                        <p className="text-[10px] text-slate-500">Please wait while the file is uploaded</p>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center mx-auto text-slate-400">
                          <Upload size={18} />
                        </div>
                        <p className="text-xs text-slate-200 font-bold">Click or drag JD document here</p>
                        <p className="text-[10px] text-slate-500 leading-normal">PDF, DOC, or DOCX (Max 5MB)</p>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="p-4 rounded-xl border border-emerald-500/25 bg-emerald-500/5 flex items-center justify-between gap-3 animate-scaleUp">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 flex-shrink-0">
                        <FileText size={16} />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-white truncate">{jdFile.name}</p>
                        <p className="text-[10px] text-emerald-400 font-medium">Uploaded Successfully</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setJdFile(null)
                        setForm(prev => ({ ...prev, jdFileName: '', jdFilePath: '' }))
                      }}
                      className="text-xs font-bold text-red-400 hover:text-red-300 transition-colors uppercase tracking-wider flex-shrink-0"
                    >
                      Change File
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-6 bg-white/2 border border-white/5 rounded-2xl p-5 animate-fadeIn">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FormField label="Purpose of the Job" span2>
                    <textarea name="purposeOfJob" value={form.purposeOfJob} onChange={handleFormChange} rows={2} placeholder="Brief objective of the role..." className={`${inputCls} resize-none`} />
                  </FormField>
                  <FormField label="Roles & Responsibilities" span2>
                    <textarea name="rolesResponsibilities" value={form.rolesResponsibilities} onChange={handleFormChange} rows={3} placeholder="Key duties and tasks..." className={`${inputCls} resize-none`} />
                  </FormField>
                  <FormField label="Minimum Qualification">
                    <input name="minimumQualification" value={form.minimumQualification} onChange={handleFormChange} placeholder="e.g. B.Tech / MCA" className={inputCls} />
                  </FormField>
                  <FormField label="Specializations">
                    <input name="specializations" value={form.specializations} onChange={handleFormChange} placeholder="e.g. Java, Data Science" className={inputCls} />
                  </FormField>
                  <FormField label="Age in Range">
                    <input name="ageRange" value={form.ageRange} onChange={handleFormChange} placeholder="e.g. 25-35 years" className={inputCls} />
                  </FormField>
                  <FormField label="Preferred Industries / Sectors" span2>
                    <input name="preferredIndustries" value={form.preferredIndustries} onChange={handleFormChange} placeholder="e.g. IT, Manufacturing, FMCG" className={inputCls} />
                  </FormField>
                  <FormField label="Other Key Skills & Relevant Experience" span2>
                    <textarea name="otherKeySkills" value={form.otherKeySkills} onChange={handleFormChange} rows={2} placeholder="React, Node.js, SQL, etc." className={`${inputCls} resize-none`} />
                  </FormField>
                  <FormField label="IT Requirements (Laptop/Desktop/Software)" span2>
                    <input name="itRequirements" value={form.itRequirements} onChange={handleFormChange} placeholder="e.g. Laptop, AutoCAD, SAP" className={inputCls} />
                  </FormField>
                </div>
              </div>
            )}
          </div>

          {/* ── Readiness Checklist ────────────────────────────────────── */}
          {(() => {
            const mrfDone = mrfMethod === 'upload' ? !!mrfFile : !!form.designation?.trim()
            const jdDone  = jdMethod  === 'upload' ? !!jdFile  : !!form.purposeOfJob?.trim() || !!form.rolesResponsibilities?.trim() || !!form.otherKeySkills?.trim()
            const bothReady = mrfDone && jdDone
            return (
              <div className="pt-6 border-t border-white/10 mt-8 space-y-5 animate-fadeIn">

                {/* Status row */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                  <div className="flex gap-3 flex-1 flex-wrap">
                    <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border ${
                      mrfDone ? 'bg-emerald-500/10 border-emerald-500/25 text-emerald-400' : 'bg-white/5 border-white/10 text-slate-500'
                    }`}>
                      {mrfDone ? <CheckCircle2 size={12} /> : <AlertCircle size={12} />}
                      MRF {mrfDone ? 'Ready' : 'Incomplete'}
                    </div>
                    <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border ${
                      jdDone ? 'bg-emerald-500/10 border-emerald-500/25 text-emerald-400' : 'bg-white/5 border-white/10 text-slate-500'
                    }`}>
                      {jdDone ? <CheckCircle2 size={12} /> : <AlertCircle size={12} />}
                      JD {jdDone ? 'Ready' : 'Incomplete'}
                    </div>
                    {!bothReady && (
                      <p className="text-xs text-slate-500 self-center">Complete both MRF and JD sections to enable submission.</p>
                    )}
                  </div>
                </div>

                {/* Action buttons */}
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={handleCloseForm}
                    className="px-5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-slate-400 hover:text-white text-xs font-semibold transition-colors"
                  >
                    Cancel &amp; Close
                  </button>
                  <div className="flex gap-3 ml-auto">
                    <button
                      id="save-draft-btn"
                      onClick={handleSaveDraft}
                      disabled={saving || submitting}
                      className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white/6 border border-white/10 text-slate-300 text-xs font-semibold hover:bg-white/10 transition-all disabled:opacity-50"
                    >
                      {saving ? <Loader2 size={13} className="animate-spin" /> : <Save size={13} />}
                      {editingId ? 'Update Draft' : 'Save Draft'}
                    </button>
                    <button
                      id="submit-mrf-btn"
                      onClick={handleSubmit}
                      disabled={submitting || saving || !bothReady}
                      title={!bothReady ? 'Complete both MRF and JD before submitting' : ''}
                      className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-bold transition-all ${
                        bothReady
                          ? 'bg-emerald-500 hover:bg-emerald-600 text-white shadow-glow-sm shadow-emerald-500/20 cursor-pointer'
                          : 'bg-white/5 border border-white/10 text-slate-600 cursor-not-allowed'
                      }`}
                    >
                      {submitting ? <Loader2 size={13} className="animate-spin" /> : <Send size={13} />}
                      {editingId ? 'Update &amp; Submit Request' : 'Submit Request'}
                    </button>
                  </div>
                </div>
              </div>
            )
          })()}
        </div>
      )}

      {/* MRF List */}
      {loading ? (
        <div className="card p-24 flex items-center justify-center">
          <Loader2 size={24} className="animate-spin text-accent" />
        </div>
      ) : filteredMRFs.length === 0 ? (
        <div className="card p-16 flex flex-col items-center gap-4 text-center border border-white/5 bg-ink-950/40">
          <AlertCircle size={32} className="text-slate-500" />
          <p className="text-slate-400 text-sm">No requisitions found in this filter.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredMRFs.map((mrf) => {
            const status = STATUS_CONFIG[mrf.mrfStatus] || STATUS_CONFIG['Draft']
            const Icon = status.icon
            const isPending = mrf.mrfStatus === 'Pending Owner Approval'
            const isApproved = mrf.mrfStatus === 'Approved'
            const isPosted = mrf.positionStatus === 'In Progress'

            return (
              <div key={mrf._id} className="card p-5 border border-white/5 bg-ink-950/40 hover:-translate-y-0.5 transition-all duration-200 flex flex-col justify-between gap-4">

                {/* Card Header: title + status badge */}
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className={`px-2 py-0.5 text-[9px] font-bold rounded uppercase tracking-wider ${
                        mrf.requestType === 'JD'
                          ? 'bg-blue-500/15 text-blue-400 border border-blue-500/35'
                          : 'bg-purple-500/15 text-purple-400 border border-purple-500/35'
                      }`}>
                        {mrf.requestType || 'MRF'}
                      </span>
                      <h3 className="font-semibold text-white text-[15px] truncate">{mrf.designation}</h3>
                    </div>
                    <p className="text-xs text-slate-500">{mrf.department}{mrf.location ? ` · ${mrf.location}` : ''}</p>
                  </div>
                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold border flex-shrink-0 ${status.bg} ${status.color}`}>
                    <Icon size={11} /> {status.label}
                  </span>
                </div>

                {/* Card Meta */}
                <div className="grid grid-cols-2 gap-x-3 gap-y-1.5 text-xs text-slate-400 py-3 border-y border-white/5">
                  <div><span className="text-slate-500">Vacancies:</span> <span className="text-white font-semibold">{mrf.noOfPositions || 1}</span></div>
                  <div><span className="text-slate-500">Urgency:</span> <span className="text-white font-semibold">{mrf.levelOfUrgency || 'Medium'}</span></div>
                  <div><span className="text-slate-500">Type:</span> <span className="text-white font-semibold">{mrf.reasonForRequest || '—'}</span></div>
                  {mrf.processOwnerName && (
                    <div><span className="text-slate-500">Reports To:</span> <span className="text-white font-semibold">{mrf.processOwnerName}</span></div>
                  )}
                </div>

                {/* Attached Files */}
                {(mrf.mrfFilePath || mrf.jdFilePath) && (
                  <div className="flex gap-4 text-xs py-2 border-b border-white/5">
                    {mrf.mrfFilePath && (
                      <a href={getFileUrl(mrf.mrfFilePath)} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-accent hover:underline font-semibold font-sans">
                        <FileText size={12} /> MRF Doc
                      </a>
                    )}
                    {mrf.jdFilePath && (
                      <a href={getFileUrl(mrf.jdFilePath)} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-accent hover:underline font-semibold font-sans">
                        <FileText size={12} /> JD Doc
                      </a>
                    )}
                  </div>
                )}

                {/* Rejection Note */}
                {mrf.mrfStatus === 'Rejected' && mrf.rejectionNote && (
                  <div className="p-2.5 rounded-lg bg-red-500/8 border border-red-500/20 text-xs text-red-300">
                    <span className="font-semibold">Rejection Reason: </span>{mrf.rejectionNote}
                  </div>
                )}

                {/* Actions Footer */}
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <span className="text-[10px] text-slate-600">{new Date(mrf.createdAt).toLocaleDateString('en-IN')}</span>

                  <div className="flex gap-2 items-center flex-wrap">
                    {/* HOD Actions */}
                    {role === 'department_head' && mrf.mrfStatus === 'Draft' && (
                      <>
                        {/* Only show Edit/Delete for MRFs the HOD owns (or unowned/seeded) */}
                        {(!mrf.submittedBy || mrf.submittedBy === userName) && (
                          <button
                            onClick={() => {
                              setForm(mrf)
                              setEditingId(mrf._id)
                              setMrfMethod(mrf.mrfFilePath ? 'upload' : 'manual')
                              setJdMethod(mrf.jdFilePath ? 'upload' : 'manual')
                              setMrfFile(mrf.mrfFilePath ? { name: mrf.mrfFileName, path: mrf.mrfFilePath } : null)
                              setJdFile(mrf.jdFilePath ? { name: mrf.jdFileName, path: mrf.jdFilePath } : null)
                              setActiveStep(1)
                              setIsCreating(true)
                              setShowForm(true)
                              window.scrollTo({top:0,behavior:'smooth'})
                            }}
                            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-accent/10 border border-accent/25 text-accent text-xs font-semibold hover:bg-accent hover:text-white transition-all"
                          >
                            <Edit3 size={11} /> Edit
                          </button>
                        )}
                        {(!mrf.submittedBy || mrf.submittedBy === userName) && (
                          <button
                            onClick={() => handleDelete(mrf._id)}
                            className="p-1.5 rounded-lg bg-red-500/10 border border-red-500/25 text-red-400 hover:bg-red-500 hover:text-white transition-all"
                          >
                            <Trash2 size={12} />
                          </button>
                        )}
                      </>
                    )}

                    {/* HOD: candidate count for approved MRFs */}
                    {role === 'department_head' && isApproved && (
                      <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-slate-400 text-xs font-semibold">
                        <Users size={11} /> {mrf.candidateCount || 0} applied
                      </span>
                    )}

                    {/* Admin: View MRF button and Delete */}
                    {role === 'admin' && (
                      <>
                        <button
                          onClick={() => setViewingMrf(mrf)}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-accent/10 border border-accent/25 text-accent text-xs font-semibold hover:bg-accent hover:text-white transition-all"
                        >
                          <Eye size={12} /> View MRF
                        </button>
                        <button
                          onClick={() => handleDelete(mrf._id)}
                          className="flex items-center p-1.5 rounded-lg bg-red-500/10 border border-red-500/25 text-red-400 hover:bg-red-500 hover:text-white transition-all ml-1"
                        >
                          <Trash2 size={12} />
                        </button>
                      </>
                    )}

                    {/* HR: Post as Job */}
                    {role === 'hr' && isApproved && !isPosted && (
                      <button
                        onClick={() => handlePostJob(mrf._id)}
                        disabled={postingJobId === mrf._id}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 text-xs font-semibold hover:bg-emerald-500 hover:text-white transition-all disabled:opacity-60"
                      >
                        {postingJobId === mrf._id ? <Loader2 size={12} className="animate-spin" /> : <ExternalLink size={12} />}
                        Post as Job
                      </button>
                    )}
                    {role === 'hr' && isApproved && isPosted && (
                      <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold">
                        <CheckSquare size={11} /> Job Live
                      </span>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
