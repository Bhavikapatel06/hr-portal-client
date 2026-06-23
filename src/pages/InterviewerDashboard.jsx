import React, { useEffect, useMemo, useState } from 'react'
import { Calendar, CheckCircle2, Clock, Loader2, RefreshCw, XCircle, MessageSquare, Briefcase, MapPin } from 'lucide-react'
import { candidateApi } from '../services/api.js'

const statusStyles = {
  pending: 'bg-amber-500/10 border-amber-500/25 text-amber-300',
  accepted: 'bg-accent/10 border-accent/25 text-accent',
  rejected: 'bg-red-500/10 border-red-500/25 text-red-300',
}

export default function InterviewerDashboard() {
  const [user] = useState(() => {
    try { return JSON.parse(localStorage.getItem('hr_user')) } catch { return null }
  })
  const [requests, setRequests] = useState([])
  const [loading, setLoading] = useState(true)
  const [savingId, setSavingId] = useState('')
  const [reasons, setReasons] = useState({})
  const [toast, setToast] = useState(null)

  const loadRequests = async () => {
    if (!user?.email) return
    setLoading(true)
    try {
      const data = await candidateApi.listMyInterviews(user.email)
      setRequests(data)
    } catch (err) {
      setToast({ type: 'error', msg: err.message })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadRequests() }, [user?.email])

  const summary = useMemo(() => ({
    pending: requests.filter(r => (r.interviewerAvailabilityStatus || 'pending') === 'pending').length,
    accepted: requests.filter(r => r.interviewerAvailabilityStatus === 'accepted').length,
    rejected: requests.filter(r => r.interviewerAvailabilityStatus === 'rejected').length,
  }), [requests])

  const respond = async (candidateId, status) => {
    setSavingId(candidateId)
    try {
      const updated = await candidateApi.respondToInterview(candidateId, {
        status,
        reason: reasons[candidateId] || '',
      })
      setRequests(prev => prev.map(r => r._id === candidateId ? updated : r))
      setToast({ type: 'success', msg: status === 'accepted' ? 'Availability accepted.' : 'Availability rejected and reason sent to HR.' })
    } catch (err) {
      setToast({ type: 'error', msg: err.message })
    } finally {
      setSavingId('')
    }
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      {toast && (
        <div className={`fixed top-20 right-5 z-50 px-4 py-3 rounded-xl shadow-xl text-sm font-medium border max-w-sm
          ${toast.type === 'error' ? 'bg-red-500/15 border-red-500/30 text-red-300' : 'bg-accent/15 border-accent/30 text-accent'}`}>
          {toast.msg}
        </div>
      )}

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-white/5 pb-4">
        <div>
          <span className="section-tag mb-1">
            <Calendar size={11} /> Interviewer Console
          </span>
          <h1 className="font-display font-bold text-lg text-white">
            Welcome back, {user?.name || 'Interviewer'}
          </h1>
        </div>
        <button
          onClick={loadRequests}
          disabled={loading}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-slate-300 text-xs font-semibold hover:bg-white/10 hover:text-white transition-all disabled:opacity-50"
        >
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          Refresh
        </button>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Pending', value: summary.pending, icon: Clock },
          { label: 'Accepted', value: summary.accepted, icon: CheckCircle2 },
          { label: 'Rejected', value: summary.rejected, icon: XCircle },
        ].map(({ label, value, icon: Icon }) => (
          <div key={label} className="card p-4 border border-white/5">
            <Icon size={15} className="text-accent mb-2" />
            <p className="text-2xl font-bold text-white font-display">{value}</p>
            <p className="text-xs text-slate-500 font-semibold">{label}</p>
          </div>
        ))}
      </div>

      {loading ? (
        <div className="card p-20 flex items-center justify-center">
          <Loader2 size={24} className="animate-spin text-accent" />
        </div>
      ) : requests.length === 0 ? (
        <div className="card p-16 text-center">
          <Calendar size={28} className="text-slate-500 mx-auto mb-3" />
          <p className="text-white font-semibold">No interview requests yet</p>
          <p className="text-slate-500 text-sm mt-1">Requests from HR will appear here when they assign you an interview slot.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {requests.map(req => {
            const status = req.interviewerAvailabilityStatus || 'pending'
            const saving = savingId === req._id
            return (
              <div key={req._id} className="card p-5 border border-white/5 space-y-4">
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h2 className="font-display font-bold text-white">{req.name}</h2>
                      <span className={`px-2 py-0.5 rounded border text-[10px] font-bold uppercase ${statusStyles[status] || statusStyles.pending}`}>
                        {status}
                      </span>
                    </div>
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-2 text-xs text-slate-400">
                      <span className="flex items-center gap-1"><Briefcase size={12} /> {req.jobOpeningId?.designation || req.currentDesignation || 'Candidate Interview'}</span>
                      {req.jobOpeningId?.location && <span className="flex items-center gap-1"><MapPin size={12} /> {req.jobOpeningId.location}</span>}
                    </div>
                  </div>
                  <div className="text-xs text-slate-300 bg-white/5 border border-white/10 rounded-lg px-3 py-2">
                    <span className="font-bold text-white">{req.interviewDate || 'Date pending'}</span>
                    <span className="mx-2 text-slate-600">|</span>
                    <span>{req.interviewTime || 'Time pending'}</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                  <div className="p-3 rounded-lg bg-white/3 border border-white/5">
                    <span className="text-slate-500 block mb-1">Mode</span>
                    <span className="text-white font-semibold">{req.interviewMode || 'In-Person'}</span>
                  </div>
                  <div className="p-3 rounded-lg bg-white/3 border border-white/5 md:col-span-2">
                    <span className="text-slate-500 block mb-1">Location / Link</span>
                    <span className="text-white font-semibold break-all">{req.interviewLocation || 'Not specified'}</span>
                  </div>
                </div>

                {status === 'pending' ? (
                  <div className="space-y-3 pt-2 border-t border-white/8">
                    <textarea
                      value={reasons[req._id] || ''}
                      onChange={e => setReasons(prev => ({ ...prev, [req._id]: e.target.value }))}
                      placeholder="Reason or note for HR, especially if rejecting"
                      rows={2}
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-accent/60 resize-none"
                    />
                    <div className="flex flex-wrap justify-end gap-3">
                      <button onClick={() => respond(req._id, 'rejected')} disabled={saving} className="px-4 py-2 rounded-lg bg-red-500/10 border border-red-500/25 text-red-300 text-xs font-bold hover:bg-red-500 hover:text-white transition-all flex items-center gap-1.5">
                        {saving ? <Loader2 size={13} className="animate-spin" /> : <XCircle size={13} />} Reject
                      </button>
                      <button onClick={() => respond(req._id, 'accepted')} disabled={saving} className="btn-primary text-xs flex items-center gap-1.5">
                        {saving ? <Loader2 size={13} className="animate-spin" /> : <CheckCircle2 size={13} />} Accept Availability
                      </button>
                    </div>
                  </div>
                ) : req.interviewerReason && (
                  <div className="flex items-start gap-2 text-xs text-slate-300 bg-white/3 border border-white/5 rounded-lg p-3">
                    <MessageSquare size={13} className="text-slate-500 mt-0.5" />
                    {req.interviewerReason}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
