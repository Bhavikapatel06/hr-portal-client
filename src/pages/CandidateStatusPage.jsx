import React, { useState } from 'react';
import { candidateApi } from '../services/api';
import { Briefcase, Clock, CheckCircle, XCircle, Calendar, AlertCircle, Search, Activity, Mail } from 'lucide-react';
import { relativeDate } from './HRDashboard.jsx';

const STATUS_MAP = {
  new: { label: 'Application Submitted', color: 'text-blue-400', badge: 'bg-blue-400/10 border-blue-400/20 text-blue-400', icon: Clock },
  shortlisted: { label: 'Under Consideration', color: 'text-yellow-400', badge: 'bg-yellow-400/10 border-yellow-400/20 text-yellow-400', icon: Briefcase },
  scheduled: { label: 'Interview Requested', color: 'text-purple-400', badge: 'bg-purple-400/10 border-purple-400/20 text-purple-400', icon: Calendar },
  selected: { label: 'Selected', color: 'text-success', badge: 'bg-success/10 border-success/20 text-success', icon: CheckCircle },
  rejected: { label: 'Not Selected', color: 'text-red-400', badge: 'bg-red-400/10 border-red-400/20 text-red-400', icon: XCircle },
  on_hold: { label: 'On Hold', color: 'text-orange-400', badge: 'bg-orange-400/10 border-orange-400/20 text-orange-400', icon: AlertCircle },
};

export default function CandidateStatusPage() {
  const [email, setEmail] = useState('');
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [error, setError] = useState('');

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!email.trim()) return;

    setLoading(true);
    setError('');
    setHasSearched(true);
    try {
      const data = await candidateApi.getStatusByEmail(email.trim());
      setApplications(data);
    } catch (err) {
      setError(err.message || 'Failed to fetch application status.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12 space-y-8 fade-up">
      
      <div className="text-center max-w-2xl mx-auto space-y-4">
        <span className="section-tag mb-2">
          <Activity size={12} /> My Applications
        </span>
        <h1 className="font-display font-bold text-3xl sm:text-4xl text-white tracking-tight">
          Track Your Status
        </h1>
        <p className="text-slate-400 text-sm leading-relaxed">
          Enter your registered email address to check the live status of all your applications and find out where you stand.
        </p>
      </div>

      <div className="card p-6 md:p-8 max-w-xl mx-auto fade-up-1 shadow-glow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 p-32 bg-accent/5 rounded-full blur-3xl -z-10 pointer-events-none" />
        <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="candidate@example.com"
              className="field"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="btn-primary whitespace-nowrap justify-center"
          >
            {loading ? (
              <span className="animate-pulse">Searching...</span>
            ) : (
              <>
                <Search size={15} /> Check Status
              </>
            )}
          </button>
        </form>
        {error && (
          <div className="mt-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm flex items-center gap-2">
            <AlertCircle size={14} />
            {error}
          </div>
        )}
      </div>

      {hasSearched && !loading && !error && (
        <div className="space-y-4 pt-6 fade-up-2">
          <div className="flex items-center justify-between border-b border-white/10 pb-4">
            <h2 className="text-xl font-bold font-display text-white">Results for <span className="text-accent font-normal">{email}</span></h2>
            <span className="text-slate-400 text-sm font-medium">{applications.length} application{applications.length !== 1 ? 's' : ''} found</span>
          </div>
          
          {applications.length === 0 ? (
            <div className="card p-12 text-center flex flex-col items-center justify-center gap-4">
              <div className="w-14 h-14 rounded-full bg-white/5 border border-white/10 flex items-center justify-center">
                <Search size={24} className="text-slate-500" />
              </div>
              <div>
                <p className="text-white font-medium">No applications found</p>
                <p className="text-slate-400 text-sm mt-1">We couldn't find any job applications linked to this email address.</p>
              </div>
            </div>
          ) : (
            <div className="grid gap-4">
              {applications.map((app) => {
                const statusInfo = STATUS_MAP[app.overallStatus] || { label: app.overallStatus, color: 'text-slate-400', badge: 'bg-slate-500/10 border-slate-500/20 text-slate-400', icon: Clock };
                const Icon = statusInfo.icon;

                return (
                  <div key={app._id} className="card p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-5 hover:-translate-y-0.5 transition-transform duration-200 group">
                    <div className="flex gap-4 items-start md:items-center">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center border shrink-0 ${statusInfo.badge.split(' ').slice(0,2).join(' ')}`}>
                        <Icon size={18} className={statusInfo.color.replace('text-', '') === 'success' ? 'text-success' : statusInfo.color} />
                      </div>
                      <div>
                        <h3 className="text-lg font-bold font-display text-white group-hover:text-accent transition-colors">
                          {app.jobOpeningId?.designation || 'Unknown Position'}
                        </h3>
                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1 text-sm text-slate-400">
                          <span className="flex items-center gap-1.5"><Briefcase size={12}/> {app.jobOpeningId?.department || '—'}</span>
                          <span>•</span>
                          <span className="flex items-center gap-1.5"><Clock size={12}/> Applied {relativeDate(app.createdAt)}</span>
                        </div>
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

