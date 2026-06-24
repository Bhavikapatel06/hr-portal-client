import React, { useEffect, useState } from 'react';
import { candidateApi } from '../services/api';
import { Briefcase, Clock, CheckCircle, XCircle, Calendar, AlertCircle, Activity } from 'lucide-react';
import { relativeDate } from './OverviewDashboard.jsx';

const STATUS_MAP = {
  new: { label: 'Application Submitted', color: 'text-slate-500', badge: 'bg-slate-500/10 border-slate-500/20 text-slate-500', icon: Clock },
  shortlisted: { label: 'Under Consideration', color: 'text-[var(--text-primary)]', badge: 'bg-[var(--bg-secondary)] border-[var(--border-color)] text-[var(--text-primary)]', icon: Briefcase },
  scheduled: { label: 'Interview Requested', color: 'text-[var(--text-primary)]', badge: 'bg-[var(--bg-secondary)] border-[var(--border-color)] text-[var(--text-primary)]', icon: Calendar },
  Interview: { label: 'Interview Scheduled', color: 'text-[var(--text-primary)]', badge: 'bg-[var(--bg-secondary)] border-[var(--border-color)] text-[var(--text-primary)]', icon: Calendar },
  Offer: { label: 'Offer Extended', color: 'text-accent', badge: 'bg-accent/10 border-accent/20 text-accent', icon: CheckCircle },
  Joined: { label: 'Joined', color: 'text-accent', badge: 'bg-accent/10 border-accent/20 text-accent', icon: CheckCircle },
  selected: { label: 'Selected', color: 'text-accent', badge: 'bg-accent/10 border-accent/20 text-accent', icon: CheckCircle },
  rejected: { label: 'Not Selected', color: 'text-slate-500', badge: 'bg-slate-500/10 border-slate-500/20 text-slate-500', icon: XCircle },
  Rejected: { label: 'Not Selected', color: 'text-slate-500', badge: 'bg-slate-500/10 border-slate-500/20 text-slate-500', icon: XCircle },
  on_hold: { label: 'On Hold', color: 'text-slate-500', badge: 'bg-slate-500/10 border-slate-500/20 text-slate-500', icon: AlertCircle },
  'Shared with HOD': { label: 'Under Review', color: 'text-[var(--text-primary)]', badge: 'bg-[var(--bg-secondary)] border-[var(--border-color)] text-[var(--text-primary)]', icon: Briefcase },
  'Approved by HOD': { label: 'Under Review', color: 'text-[var(--text-primary)]', badge: 'bg-[var(--bg-secondary)] border-[var(--border-color)] text-[var(--text-primary)]', icon: Briefcase },
  'Pending Head Approval': { label: 'Under Review', color: 'text-[var(--text-primary)]', badge: 'bg-[var(--bg-secondary)] border-[var(--border-color)] text-[var(--text-primary)]', icon: Briefcase },
  'Approved by Head': { label: 'Under Review', color: 'text-[var(--text-primary)]', badge: 'bg-[var(--bg-secondary)] border-[var(--border-color)] text-[var(--text-primary)]', icon: Briefcase },
};

/**
 * Candidate Applications Page
 *
 * Data Isolation: The page automatically loads applications belonging to the
 * currently logged-in candidate (using their email from localStorage / JWT).
 * The previous email search box has been removed so candidates can never
 * peek at another candidate's data.
 */
export default function CandidateStatusPage() {
  const user = (() => {
    try { return JSON.parse(localStorage.getItem('hr_user')) || {}; } catch { return {}; }
  })();

  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!user?.email) {
        setError('You must be logged in to view your applications.');
        setLoading(false);
        return;
      }
      try {
        // Backend uses JWT to scope this strictly to the logged-in candidate.
        const data = await candidateApi.getStatusByEmail(user.email);
        if (!cancelled) setApplications(Array.isArray(data) ? data : []);
      } catch (err) {
        if (!cancelled) setError(err.message || 'Failed to load your applications.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12 space-y-8 fade-up" data-testid="candidate-status-page">

      <div className="text-center max-w-2xl mx-auto space-y-4">
        <span className="section-tag mb-2">
          <Activity size={12} /> My Applications
        </span>
        <h1 className="font-display font-bold text-3xl sm:text-4xl text-white tracking-tight">
          Track Your Status
        </h1>
        <p className="text-slate-400 text-sm leading-relaxed">
          Showing all applications submitted by <span className="text-accent font-medium" data-testid="candidate-email">{user?.email || '—'}</span>.
        </p>
      </div>

      {loading && (
        <div className="card p-12 text-center">
          <div className="text-slate-400 text-sm animate-pulse">Loading your applications...</div>
        </div>
      )}

      {!loading && error && (
        <div className="card p-6 border border-red-500/20 bg-red-500/5">
          <div className="flex items-center gap-3 text-red-400">
            <AlertCircle size={16} />
            <span className="text-sm">{error}</span>
          </div>
        </div>
      )}

      {!loading && !error && (
        <div className="space-y-4 pt-2 fade-up-2">
          <div className="flex items-center justify-between border-b border-white/10 pb-4">
            <h2 className="text-xl font-bold font-display text-white">Your Applications</h2>
            <span className="text-slate-400 text-sm font-medium" data-testid="applications-count">
              {applications.length} application{applications.length !== 1 ? 's' : ''} found
            </span>
          </div>

          {applications.length === 0 ? (
            <div className="card p-12 text-center flex flex-col items-center justify-center gap-4">
              <div className="w-14 h-14 rounded-full bg-white/5 border border-white/10 flex items-center justify-center">
                <Briefcase size={24} className="text-slate-500" />
              </div>
              <div>
                <p className="text-white font-medium">No applications yet</p>
                <p className="text-slate-400 text-sm mt-1">When you apply to a job opening, it will appear here.</p>
              </div>
            </div>
          ) : (
            <div className="grid gap-4" data-testid="applications-list">
              {applications.map((app) => {
                const statusInfo = STATUS_MAP[app.overallStatus] || {
                  label: app.overallStatus,
                  color: 'text-slate-400',
                  badge: 'bg-slate-500/10 border-slate-500/20 text-slate-400',
                  icon: Clock,
                };
                const Icon = statusInfo.icon;

                return (
                  <div
                    key={app._id}
                    data-testid={`application-card-${app._id}`}
                    className="card p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-5 hover:-translate-y-0.5 transition-transform duration-200 group"
                  >
                    <div className="flex gap-4 items-start md:items-center">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center border shrink-0 ${statusInfo.badge.split(' ').slice(0, 2).join(' ')}`}>
                        <Icon size={18} className={statusInfo.color} />
                      </div>
                      <div>
                        <h3 className="text-lg font-bold font-display text-white group-hover:text-accent transition-colors">
                          {app.jobOpeningId?.designation || 'Unknown Position'}
                        </h3>
                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1 text-sm text-slate-400">
                          <span className="flex items-center gap-1.5"><Briefcase size={12} /> {app.jobOpeningId?.department || '—'}</span>
                          <span>•</span>
                          <span className="flex items-center gap-1.5"><Clock size={12} /> Applied {relativeDate(app.createdAt)}</span>
                        </div>

                        {/* Interview details (if scheduled and notified) */}
                        {app.interview?.scheduled && app.interview?.candidateNotified && (
                          <div className="mt-3 text-xs text-slate-400 flex flex-wrap items-center gap-x-3 gap-y-1">
                            <span className="flex items-center gap-1.5">
                              <Calendar size={12} className="text-accent" />
                              Interview: {app.interview.date || 'TBD'} {app.interview.time ? `at ${app.interview.time}` : ''}
                            </span>
                            {(app.interview.venue || app.interview.link) && (
                              <>
                                <span>•</span>
                                <span className="truncate max-w-[260px]">
                                  {app.interview.venue || app.interview.link}
                                </span>
                              </>
                            )}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className={`badge border px-3 py-1.5 ${statusInfo.badge}`}>
                      {statusInfo.label}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
