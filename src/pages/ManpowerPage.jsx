import React, { useState, useEffect } from 'react'
import { CheckCircle2, FileSearch, HardDrive, Calendar, Zap } from 'lucide-react'
import ManpowerFilePanel from '../components/ManpowerFilePanel.jsx'
import { getManpowerFile, formatSize, formatDate } from '../services/manpowerStore.js'

export default function ManpowerPage() {
  const [requirements, setRequirements] = useState(null)

  useEffect(() => {
    const rec = getManpowerFile()
    if (rec) setRequirements(rec.requirements)
  }, [])

  const handleRequirementsChange = (reqs) => {
    setRequirements(reqs)
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 space-y-8">

      {/* Page header */}
      <div className="fade-up">
        <span className="section-tag mb-3">
          <FileSearch size={11} /> Manpower File
        </span>
        <h1 className="font-display font-bold text-2xl sm:text-3xl text-white mt-2">
          Manpower Requirement File
        </h1>
        <p className="text-slate-400 text-sm mt-1">
          Upload your manpower file once — it stays saved across sessions. Update it anytime to automatically replace the old version.
        </p>
      </div>

      {/* How it works */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 fade-up-1">
        {[
          { icon: HardDrive,    title: 'Upload Once',     desc: 'File saved in browser storage — no re-upload needed on refresh.' },
          { icon: CheckCircle2, title: 'Auto-Replace',    desc: 'Uploading a new file automatically replaces the previous one.' },
          { icon: Zap,          title: 'Smart Matching',  desc: 'Requirements power the resume matching engine on the dashboard.' },
        ].map(({ icon: Icon, title, desc }) => (
          <div key={title} className="card p-4 flex gap-3">
            <div className="w-9 h-9 rounded-lg bg-accent/10 border border-accent/20 flex items-center justify-center flex-shrink-0">
              <Icon size={16} className="text-accent" />
            </div>
            <div>
              <p className="text-sm font-semibold text-white">{title}</p>
              <p className="text-xs text-slate-500 mt-0.5">{desc}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Main panel */}
      <div className="fade-up-2">
        <ManpowerFilePanel onRequirementsChange={handleRequirementsChange} />
      </div>

    </div>
  )
}
