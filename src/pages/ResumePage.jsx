import React, { useState, useEffect, useCallback } from 'react'
import { FolderOpen, CheckCircle2 } from 'lucide-react'
import ResumeUpload from '../components/ResumeUpload.jsx'
import { getManpowerFile } from '../services/manpowerStore.js'
import { rankCandidates } from '../utils/matchEngine.js'
import { saveCandidates } from '../services/manpowerStore.js'

export default function ResumePage() {
  const [requirements, setRequirements] = useState(null)

  useEffect(() => {
    const rec = getManpowerFile()
    if (rec?.requirements) setRequirements(rec.requirements)
  }, [])

  const handleCandidatesChange = useCallback((candidates) => {
    const ranked = rankCandidates(candidates, requirements)
    saveCandidates(ranked)
  }, [requirements])

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-8">

      {/* Page header */}
      <div className="fade-up">
        <span className="section-tag mb-3">
          <FolderOpen size={11} /> Resume Management
        </span>
        <h1 className="font-display font-bold text-2xl sm:text-3xl text-white mt-2">
          Upload Resumes
        </h1>
        <p className="text-slate-400 text-sm mt-1">
          Upload candidate resumes, fill in their details, and the system will automatically
          score them against your active manpower requirements.
        </p>
      </div>

      {/* Active requirements badge */}
      {requirements?.designation && (
        <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-accent/8 border border-accent/20 fade-up-1">
          <CheckCircle2 size={15} className="text-success flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-sm text-white font-medium">Matching against: <span className="text-accent">{requirements.designation}</span></p>
            <p className="text-xs text-slate-500 mt-0.5">
              {[requirements.experience, requirements.minimumQualification, requirements.otherKeySkills]
                .filter(Boolean).join(' · ')}
            </p>
          </div>
        </div>
      )}

      {/* Upload component */}
      <div className="fade-up-2">
        <ResumeUpload
          onCandidatesChange={handleCandidatesChange}
          requirements={requirements}
        />
      </div>

    </div>
  )
}
