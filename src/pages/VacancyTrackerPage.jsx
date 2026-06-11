import React, { useState, useEffect } from 'react'
import {
  Search, Filter, MapPin, Building2, Users, Loader2, AlertCircle, FileSpreadsheet,
  Download, ArrowUpDown, Clock, ChevronDown
} from 'lucide-react'
import { mrfApi, sheetApi } from '../services/api.js'

export default function VacancyTrackerPage() {
  const [mrfs, setMrfs] = useState([])
  const [loading, setLoading] = useState(true)
  
  // Search & filter states
  const [search, setSearch] = useState('')
  const [deptFilter, setDeptFilter] = useState('All')
  const [locFilter, setLocFilter] = useState('All')
  const [posFilter, setPosFilter] = useState('All')
  const [reqFilter, setReqFilter] = useState('All')

  useEffect(() => {
    loadVacancies()
  }, [])

  const loadVacancies = async () => {
    setLoading(true)
    try {
      const all = await mrfApi.list()
      // Display approved requisitions (since approved MRFs automatically activate as jobs)
      setMrfs(all.filter(m => m.mrfStatus === 'Approved'))
    } catch (e) {
      console.error('Failed to load vacancies:', e)
    } finally {
      setLoading(false)
    }
  }

  // Extract unique filters from data
  const departments = ['All', ...Array.from(new Set(mrfs.map(m => m.department).filter(Boolean)))]
  const locations = ['All', ...Array.from(new Set(mrfs.map(m => m.location).filter(Boolean)))]
  const positionStatuses = ['All', 'Open', 'In Progress', 'Closed', 'On Hold']
  const requirementStatuses = ['All', 'Pending', 'In Progress', 'Fulfilled', 'Cancelled']

  // Filter application
  const filtered = mrfs.filter(m => {
    const matchesSearch = 
      (m.designation || '').toLowerCase().includes(search.toLowerCase()) ||
      (m.department || '').toLowerCase().includes(search.toLowerCase()) ||
      (m.location || '').toLowerCase().includes(search.toLowerCase()) ||
      (m.processOwnerName || '').toLowerCase().includes(search.toLowerCase())

    const matchesDept = deptFilter === 'All' || m.department === deptFilter
    const matchesLoc = locFilter === 'All' || m.location === locFilter
    const matchesPos = posFilter === 'All' || m.positionStatus === posFilter
    const matchesReq = reqFilter === 'All' || m.requirementStatus === reqFilter

    return matchesSearch && matchesDept && matchesLoc && matchesPos && matchesReq
  })

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      {/* Header */}
      <div className="fade-up">
        <span className="section-tag mb-2.5">
          <FileSpreadsheet size={11} className="text-success" /> Google Sheet Sync Ledger
        </span>
        <h1 className="font-display font-bold text-2xl sm:text-3xl text-white">
          Vacancy Operational Tracker
        </h1>
        <p className="text-slate-400 text-sm mt-1">
          Search, filter, and audit live open positions synced with the Google Sheet.
        </p>
      </div>

      {/* Control Panel: Filters */}
      <div className="card p-5 border border-white/5 bg-ink-950/40 space-y-4 fade-up-1">
        
        {/* Search Input */}
        <div className="relative">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by role, department, location, or process owner..."
            className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-accent/50 focus:ring-1 focus:ring-accent/10 transition-all"
          />
        </div>

        {/* Filter selectors row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs">
          
          {/* Dept Filter */}
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Department</span>
            <div className="relative">
              <select
                value={deptFilter}
                onChange={(e) => setDeptFilter(e.target.value)}
                className="field appearance-none pr-8 cursor-pointer text-xs !py-2 !px-3"
              >
                {departments.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
              <ChevronDown size={13} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
            </div>
          </div>

          {/* Location Filter */}
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Location</span>
            <div className="relative">
              <select
                value={locFilter}
                onChange={(e) => setLocFilter(e.target.value)}
                className="field appearance-none pr-8 cursor-pointer text-xs !py-2 !px-3"
              >
                {locations.map(l => <option key={l} value={l}>{l}</option>)}
              </select>
              <ChevronDown size={13} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
            </div>
          </div>

          {/* Position Status Filter */}
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Position Status</span>
            <div className="relative">
              <select
                value={posFilter}
                onChange={(e) => setPosFilter(e.target.value)}
                className="field appearance-none pr-8 cursor-pointer text-xs !py-2 !px-3"
              >
                {positionStatuses.map(ps => <option key={ps} value={ps}>{ps}</option>)}
              </select>
              <ChevronDown size={13} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
            </div>
          </div>

          {/* Requirement Status Filter */}
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Requirement Status</span>
            <div className="relative">
              <select
                value={reqFilter}
                onChange={(e) => setReqFilter(e.target.value)}
                className="field appearance-none pr-8 cursor-pointer text-xs !py-2 !px-3"
              >
                {requirementStatuses.map(rs => <option key={rs} value={rs}>{rs}</option>)}
              </select>
              <ChevronDown size={13} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
            </div>
          </div>

        </div>

      </div>

      {/* Data Table */}
      {loading ? (
        <div className="card p-24 flex items-center justify-center">
          <Loader2 size={24} className="animate-spin text-accent" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="card p-16 flex flex-col items-center gap-4 text-center border border-white/5 bg-ink-950/40 fade-up-2">
          <AlertCircle size={32} className="text-slate-600" />
          <p className="text-slate-400 text-sm">No vacancies match your search parameters.</p>
        </div>
      ) : (
        <div className="card border border-white/5 bg-ink-950/40 overflow-hidden shadow-xl fade-up-2">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-white/8 bg-white/2 text-slate-400 font-bold uppercase tracking-wider text-[9px] select-none">
                  <th className="p-4">Role Details</th>
                  <th className="p-4">Department & Sec</th>
                  <th className="p-4">Location</th>
                  <th className="p-4 text-center">Positions</th>
                  <th className="p-4 text-center">Position Status</th>
                  <th className="p-4 text-center">Requirement Status</th>
                  <th className="p-4">Process Owner</th>
                  <th className="p-4">Remarks</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filtered.map((mrf) => {
                  let posColor = 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20'
                  if (mrf.positionStatus === 'Closed') posColor = 'text-slate-500 bg-slate-400/10 border-slate-400/20'
                  if (mrf.positionStatus === 'On Hold') posColor = 'text-amber-400 bg-amber-500/10 border-amber-500/20'
                  
                  let reqColor = 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20'
                  if (mrf.requirementStatus === 'Fulfilled') reqColor = 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20'
                  if (mrf.requirementStatus === 'Cancelled') reqColor = 'text-red-400 bg-red-500/10 border-red-500/20'

                  return (
                    <tr key={mrf._id} className="hover:bg-white/1 transition-colors leading-relaxed">
                      <td className="p-4 min-w-[150px]">
                        <p className="font-semibold text-white text-sm">{mrf.designation}</p>
                        <p className="text-[10px] text-slate-500 mt-0.5">Exp: {mrf.experience || '—'} · Req: {mrf.requestType || 'MRF'}</p>
                      </td>
                      <td className="p-4 text-slate-300">
                        <span className="font-medium">{mrf.department}</span>
                        {mrf.section && <span className="block text-[10px] text-slate-500">{mrf.section}</span>}
                      </td>
                      <td className="p-4 text-slate-300">
                        <span className="flex items-center gap-1"><MapPin size={10} className="text-slate-500" /> {mrf.location || '—'}</span>
                      </td>
                      <td className="p-4 text-center font-bold text-white text-sm">{mrf.noOfPositions || 1}</td>
                      <td className="p-4 text-center">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-semibold border ${posColor}`}>
                          {mrf.positionStatus}
                        </span>
                      </td>
                      <td className="p-4 text-center">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-semibold border ${reqColor}`}>
                          {mrf.requirementStatus}
                        </span>
                      </td>
                      <td className="p-4 text-slate-300 font-medium">
                        {mrf.processOwnerName || '—'}
                      </td>
                      <td className="p-4 text-slate-500 max-w-[200px] truncate" title={mrf.vacancyRemarks || mrf.additionalRemarks}>
                        {mrf.vacancyRemarks || mrf.additionalRemarks || '—'}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
          <div className="p-4 bg-white/2 border-t border-white/5 flex items-center justify-between text-slate-500 text-[10px] font-semibold">
            <span>Showing {filtered.length} of {mrfs.length} entries</span>
            <span>Google Sheets Live Ledger Sync: Enabled</span>
          </div>
        </div>
      )}
    </div>
  )
}
