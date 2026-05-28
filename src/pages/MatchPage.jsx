import React, { useState, useEffect } from 'react'
import { Target, CheckCircle2, Link as LinkIcon } from 'lucide-react'
import { Link } from 'react-router-dom'
import MatchResults from '../components/MatchResults.jsx'
import { getManpowerFile, getCandidates } from '../services/manpowerStore.js'
import { rankCandidates } from '../utils/matchEngine.js'

export default function MatchPage() {
  const [requirements, setRequirements] = useState(null)
  const [rankedCandidates, setRankedCandidates] = useState([])

  useEffect(() => {
    const rec = getManpowerFile()
    const reqs = rec?.requirements || null
    setRequirements(reqs)

    const stored = getCandidates()
    if (stored.length > 0) {
      const ranked = rankCandidates(stored, reqs)
      setRankedCandidates(ranked)
    }
  }, [])

  const strongCount = rankedCandidates.filter(c => c.matchLevel === 'Strong').length

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-8">

      {/* Page header */}
      <div className="fade-up">
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div>
            <span className="section-tag mb-3">
              <Target size={11} /> AI Matching
            </span>
            <h1 className="font-display font-bold text-2xl sm:text-3xl text-white mt-2">
              Match Results
            </h1>
            <p className="text-slate-400 text-sm mt-1">
              Candidates ranked by how well they match your manpower requirements.
            </p>
          </div>

          {/* Live counters */}
          {rankedCandidates.length > 0 && (
            <div className="flex items-center gap-3">
              <div className="text-center px-4 py-2 rounded-xl bg-white/5 border border-white/10">
                <p className="font-bold text-lg text-white">{rankedCandidates.length}</p>
                <p className="text-xs text-slate-500">Candidates</p>
              </div>
              <div className="text-center px-4 py-2 rounded-xl bg-emerald-400/10 border border-emerald-400/20">
                <p className="font-bold text-lg text-emerald-400">{strongCount}</p>
                <p className="text-xs text-slate-500">Strong</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Requirements active bar */}
      {requirements?.designation && (
        <div className="flex items-center justify-between gap-3 px-4 py-3 rounded-xl bg-accent/8 border border-accent/20 fade-up-1 flex-wrap">
          <div className="flex items-center gap-2">
            <CheckCircle2 size={15} className="text-success flex-shrink-0" />
            <span className="text-sm text-slate-300">
              Matching for: <span className="text-white font-semibold">{requirements.designation}</span>
              {requirements.experience && <> · {requirements.experience}</>}
              {requirements.otherKeySkills && <> · {requirements.otherKeySkills}</>}
            </span>
          </div>
          <Link to="/manpower" className="text-xs text-accent hover:underline flex items-center gap-1">
            Edit requirements
          </Link>
        </div>
      )}

      {/* Match results */}
      <div className="fade-up-2">
        <MatchResults candidates={rankedCandidates} requirements={requirements} />
      </div>

    </div>
  )
}
