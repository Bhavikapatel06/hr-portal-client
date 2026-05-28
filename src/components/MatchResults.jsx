import React, { useState, useMemo } from 'react'
import { Users, Filter, ChevronDown, AlertTriangle, Upload, Star } from 'lucide-react'
import { MATCH_COLORS } from '../utils/matchEngine.js'
import { useNavigate } from 'react-router-dom'

// ─── Score Ring SVG ──────────────────────────────────────────────────────────

function ScoreRing({ score, level }) {
  const colors = MATCH_COLORS[level] || MATCH_COLORS.Low
  const r = 26
  const circ = 2 * Math.PI * r
  const dash = (score / 100) * circ

  return (
    <div className="relative w-16 h-16 flex items-center justify-center flex-shrink-0">
      <svg className="absolute inset-0 -rotate-90" width="64" height="64" viewBox="0 0 64 64">
        {/* Track */}
        <circle cx="32" cy="32" r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="5" />
        {/* Progress */}
        <circle
          cx="32" cy="32" r={r}
          fill="none"
          stroke={colors.ring}
          strokeWidth="5"
          strokeLinecap="round"
          strokeDasharray={circ}
          strokeDashoffset={circ - dash}
          style={{ transition: 'stroke-dashoffset 0.8s ease' }}
        />
      </svg>
      <span className="text-white font-bold text-sm font-mono">{score}</span>
    </div>
  )
}

// ─── Dimension Bar ───────────────────────────────────────────────────────────

function DimBar({ label, value, color }) {
  return (
    <div>
      <div className="flex justify-between text-xs mb-1">
        <span className="text-slate-500">{label}</span>
        <span className={`font-semibold ${color}`}>{value}%</span>
      </div>
      <div className="h-1.5 bg-white/8 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{ width: `${value}%`, backgroundColor: color.replace('text-', '') === color ? '#4F8EF7' : undefined,
            background: value >= 80 ? '#34d399' : value >= 60 ? '#4F8EF7' : value >= 35 ? '#F5A623' : '#94a3b8'
          }}
        />
      </div>
    </div>
  )
}

// ─── Candidate Match Card ────────────────────────────────────────────────────

function MatchCard({ candidate, rank }) {
  const [expanded, setExpanded] = useState(false)
  const { details = {}, matchScore = 0, matchLevel = 'Low', matchBreakdown = {} } = candidate
  const colors = MATCH_COLORS[matchLevel]

  const initials = (details.fullName || details._fileName || '?')
    .split(' ').slice(0, 2).map(w => w[0]?.toUpperCase() || '').join('') || '?'

  return (
    <div className={`card overflow-hidden transition-all duration-200 ${expanded ? 'border-accent/20' : ''}`}>
      <div className="flex items-center gap-4 p-4">

        {/* Rank + avatar */}
        <div className="relative flex-shrink-0">
          <div className="w-10 h-10 rounded-full bg-accent/15 border border-accent/25 flex items-center justify-center text-accent font-bold text-sm">
            {initials}
          </div>
          {rank <= 3 && (
            <div className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-gold border border-ink-800 flex items-center justify-center">
              <Star size={8} className="text-ink-900 fill-ink-900" />
            </div>
          )}
        </div>

        {/* Name + file */}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-white truncate">
            {details.fullName || '(No name entered)'}
          </p>
          <p className="text-xs text-slate-500 truncate mt-0.5">
            {details.currentTitle || 'Title not provided'} · {details.totalExp ? details.totalExp + ' exp.' : '—'}
          </p>
          {details.email && (
            <p className="text-xs text-slate-600 truncate mt-0.5">{details.email}</p>
          )}
        </div>

        {/* Score ring */}
        <ScoreRing score={matchScore} level={matchLevel} />

        {/* Badge + expand */}
        <div className="flex flex-col items-end gap-2 flex-shrink-0">
          <span className={`badge ${colors.bg} ${colors.text} border ${colors.border}`}>
            {matchLevel}
          </span>
          <button
            onClick={() => setExpanded(e => !e)}
            className="w-7 h-7 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 transition-colors text-slate-400 hover:text-white"
          >
            <ChevronDown size={13} className={`transition-transform duration-200 ${expanded ? 'rotate-180' : ''}`} />
          </button>
        </div>
      </div>

      {/* Expanded breakdown */}
      {expanded && (
        <div className="border-t border-white/8 p-4 bg-ink-900/40 space-y-3">
          <p className="text-xs text-accent font-semibold uppercase tracking-widest mb-3">Score Breakdown</p>
          <DimBar label="Skills Match"        value={matchBreakdown.skills       ?? 0} color="text-accent" />
          <DimBar label="Experience"          value={matchBreakdown.experience   ?? 0} color="text-accent" />
          <DimBar label="Qualification"       value={matchBreakdown.qualification ?? 0} color="text-accent" />
          <DimBar label="Job Title Match"     value={matchBreakdown.jobTitle     ?? 0} color="text-accent" />

          {/* Candidate details */}
          <div className="pt-3 border-t border-white/8 grid grid-cols-2 gap-2">
            {[
              ['Qualification', details.highestQual],
              ['Phone',         details.phone],
              ['Skills / Notes', details.notes],
            ].map(([lbl, val]) => val ? (
              <div key={lbl} className="col-span-1">
                <p className="text-xs text-slate-600 uppercase tracking-wide">{lbl}</p>
                <p className="text-xs text-slate-300 mt-0.5">{val}</p>
              </div>
            ) : null)}
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Empty states ─────────────────────────────────────────────────────────────

function EmptyNoManpower({ navigate }) {
  return (
    <div className="card p-10 flex flex-col items-center justify-center gap-4 text-center fade-up">
      <div className="w-16 h-16 rounded-2xl bg-gold/10 border border-gold/25 flex items-center justify-center mb-2">
        <AlertTriangle size={28} className="text-gold" />
      </div>
      <h3 className="font-display font-bold text-lg text-white">No Manpower File Loaded</h3>
      <p className="text-slate-400 text-sm max-w-xs">
        Upload a manpower file first so the system knows what requirements to match against.
      </p>
      <button onClick={() => navigate('/manpower')} className="btn-primary mt-2">
        <Upload size={14} /> Upload Manpower File
      </button>
    </div>
  )
}

function EmptyNoCandidates() {
  return (
    <div className="card p-10 flex flex-col items-center justify-center gap-3 text-center fade-up">
      <div className="w-16 h-16 rounded-2xl bg-accent/10 border border-accent/20 flex items-center justify-center mb-2">
        <Users size={28} className="text-accent" />
      </div>
      <h3 className="font-display font-bold text-lg text-white">No Candidates Yet</h3>
      <p className="text-slate-400 text-sm max-w-xs">
        Upload resumes and fill in candidate details — they'll appear here with match scores.
      </p>
    </div>
  )
}

// ─── Main export ──────────────────────────────────────────────────────────────

const LEVELS = ['All', 'Strong', 'Good', 'Partial', 'Low']

export default function MatchResults({ candidates = [], requirements = null }) {
  const navigate = useNavigate()
  const [filterLevel, setFilterLevel] = useState('All')

  const rankedCandidates = useMemo(() => {
    return [...candidates].sort((a, b) => (b.matchScore ?? 0) - (a.matchScore ?? 0))
  }, [candidates])

  const filtered = useMemo(() => {
    if (filterLevel === 'All') return rankedCandidates
    return rankedCandidates.filter(c => c.matchLevel === filterLevel)
  }, [rankedCandidates, filterLevel])

  const counts = useMemo(() => {
    const c = { All: rankedCandidates.length }
    rankedCandidates.forEach(r => { c[r.matchLevel] = (c[r.matchLevel] || 0) + 1 })
    return c
  }, [rankedCandidates])

  if (!requirements) return <EmptyNoManpower navigate={navigate} />
  if (candidates.length === 0) return <EmptyNoCandidates />

  const avgScore = Math.round(rankedCandidates.reduce((s, c) => s + (c.matchScore || 0), 0) / rankedCandidates.length)

  return (
    <div className="space-y-5 fade-up">

      {/* Stats bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Total Candidates', value: candidates.length, color: 'text-accent', bg: 'bg-accent/10 border-accent/20' },
          { label: 'Average Score', value: avgScore + '%', color: 'text-gold', bg: 'bg-gold/10 border-gold/20' },
          { label: 'Strong Matches', value: counts.Strong || 0, color: 'text-emerald-400', bg: 'bg-emerald-400/10 border-emerald-400/20' },
          { label: 'Good Matches', value: counts.Good || 0, color: 'text-accent', bg: 'bg-accent/10 border-accent/20' },
        ].map(({ label, value, color, bg }) => (
          <div key={label} className="card p-4 text-center">
            <p className={`font-display font-bold text-2xl ${color}`}>{value}</p>
            <p className="text-xs text-slate-500 mt-1">{label}</p>
          </div>
        ))}
      </div>

      {/* Filter bar */}
      <div className="flex items-center gap-2 flex-wrap">
        <Filter size={14} className="text-slate-500" />
        {LEVELS.map(level => {
          const colors = level === 'All' ? null : MATCH_COLORS[level]
          const active = filterLevel === level
          return (
            <button
              key={level}
              onClick={() => setFilterLevel(level)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all duration-150 ${
                active
                  ? level === 'All'
                    ? 'bg-accent text-white border-accent shadow-glow-sm'
                    : `${colors?.bg} ${colors?.text} ${colors?.border}`
                  : 'bg-white/5 border-white/10 text-slate-400 hover:bg-white/10'
              }`}
            >
              {level} {counts[level] !== undefined ? `(${counts[level]})` : ''}
            </button>
          )
        })}
      </div>

      {/* Results list */}
      {filtered.length === 0 ? (
        <p className="text-center text-slate-600 text-sm py-8">No candidates match this filter.</p>
      ) : (
        <div className="space-y-3">
          {filtered.map((c, i) => (
            <MatchCard key={c.id} candidate={c} rank={rankedCandidates.indexOf(c) + 1} />
          ))}
        </div>
      )}

    </div>
  )
}
