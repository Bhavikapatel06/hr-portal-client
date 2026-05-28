import React from 'react'
import { useNavigate } from 'react-router-dom'
import { BriefcaseBusiness, User, ShieldCheck } from 'lucide-react'

export default function Login() {
  const navigate = useNavigate()

  const handleRoleSelect = (role) => {
    localStorage.setItem('hr_role', role)
    // Dispatch custom event so Navbar updates immediately
    window.dispatchEvent(new Event('storage'))
    navigate('/dashboard')
  }

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full space-y-8 card p-8 border border-white/8 bg-ink-950/80 backdrop-blur-xl relative overflow-hidden">
        {/* Glow effect */}
        <div className="absolute -top-24 -left-24 w-48 h-48 rounded-full bg-accent/20 blur-3xl" />
        <div className="absolute -bottom-24 -right-24 w-48 h-48 rounded-full bg-purple-500/10 blur-3xl" />

        <div className="text-center relative">
          <div className="mx-auto w-12 h-12 rounded-2xl bg-accent flex items-center justify-center shadow-glow mb-4">
            <BriefcaseBusiness size={22} className="text-white" />
          </div>
          <h2 className="font-display font-bold text-2xl tracking-tight text-white">
            Welcome to HR Portal
          </h2>
          <p className="mt-2 text-xs text-slate-400">
            Select your access role to proceed to the application
          </p>
        </div>

        <div className="space-y-4 pt-6 relative">
          {/* Candidate Card */}
          <button
            onClick={() => handleRoleSelect('candidate')}
            className="w-full flex items-center gap-4 p-4 rounded-2xl bg-white/3 border border-white/10 hover:border-accent/40 hover:bg-accent/4 text-left transition-all duration-200 group hover:-translate-y-0.5"
          >
            <div className="w-10 h-10 rounded-xl bg-accent/10 border border-accent/20 flex items-center justify-center text-accent group-hover:bg-accent group-hover:text-white transition-colors">
              <User size={18} />
            </div>
            <div>
              <p className="font-display font-semibold text-white text-sm">Candidate / Applicant</p>
              <p className="text-xs text-slate-500 mt-0.5">View openings, apply, upload resume & check score compatibility</p>
            </div>
          </button>

          {/* HR Admin Card */}
          <button
            onClick={() => handleRoleSelect('admin')}
            className="w-full flex items-center gap-4 p-4 rounded-2xl bg-white/3 border border-white/10 hover:border-purple-500/40 hover:bg-purple-500/4 text-left transition-all duration-200 group hover:-translate-y-0.5"
          >
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 group-hover:bg-purple-500 group-hover:text-white transition-colors">
              <ShieldCheck size={18} />
            </div>
            <div>
              <p className="font-display font-semibold text-white text-sm">HR Administrator</p>
              <p className="text-xs text-slate-500 mt-0.5">Manage MRFs, view trackers, review candidates, score & schedule</p>
            </div>
          </button>
        </div>
      </div>
    </div>
  )
}
