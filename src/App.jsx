import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import Navbar                    from './components/Navbar.jsx'
import OverviewDashboard         from './pages/OverviewDashboard.jsx'
import MyMRFsPage               from './pages/MyMRFsPage.jsx'
import AdminMRFApprovalsPage     from './pages/AdminMRFApprovalsPage.jsx'
import AdminSettingsPage         from './pages/AdminSettingsPage.jsx'
import HRManagerPage             from './pages/HRManagerPage.jsx'
import Login                     from './pages/Login.jsx'
import CandidateApplyPage        from './pages/CandidateApplyPage.jsx'
import CandidateStatusPage       from './pages/CandidateStatusPage.jsx'
import CandidateDetailsPage      from './pages/CandidateDetailsPage.jsx'
import InterviewerDashboard      from './pages/InterviewerDashboard.jsx'

// ── Auth helpers ─────────────────────────────────────────────────────────────
const isLoggedIn = () => !!localStorage.getItem('hr_token')
const getRole    = () => localStorage.getItem('hr_role') || ''

// ── Protected Route ──────────────────────────────────────────────────────────
function Protected({ children, allowedRoles }) {
  if (!isLoggedIn()) {
    return <Navigate to="/login" replace />
  }
  if (allowedRoles && !allowedRoles.includes(getRole())) {
    return <Navigate to="/dashboard" replace />
  }
  return children
}

// ── Redirect if already logged in ────────────────────────────────────────────
function PublicOnly({ children }) {
  if (isLoggedIn()) {
    return <Navigate to="/dashboard" replace />
  }
  return children
}

function DefaultDashboard() {
  if (getRole() === 'interviewer') return <InterviewerDashboard />
  return <OverviewDashboard />
}



export default function App() {
  return (
    <div className="min-h-screen flex flex-col bg-[var(--bg-primary)]">
      <Navbar />
      <main className="flex-1 min-w-0">
        <Routes>
          {/* Public routes */}
          <Route path="/login" element={
            <PublicOnly>
              <Login />
            </PublicOnly>
          } />

          {/* Universal dashboard — role decides what component renders */}
          {/* Staff dashboard */}
          <Route path="/dashboard" element={
            <Protected>
              <DefaultDashboard />
            </Protected>
          } />

          {/* HR Manager Recruitment Pipeline */}
          <Route path="/recruitment" element={
            <Protected allowedRoles={['hr']}>
              <HRManagerPage />
            </Protected>
          } />

          <Route path="/recruitment/job/:jobId" element={
            <Protected allowedRoles={['hr']}>
              <HRManagerPage />
            </Protected>
          } />

          <Route path="/recruitment/candidate/:candidateId" element={
            <Protected allowedRoles={['hr', 'admin', 'department_head', 'interviewer']}>
              <CandidateDetailsPage />
            </Protected>
          } />

          <Route path="/interviews" element={
            <Protected allowedRoles={['interviewer']}>
              <InterviewerDashboard />
            </Protected>
          } />

          {/* Operational MRF management — HR & Dept Head only */}
          <Route path="/my-mrfs" element={
            <Protected allowedRoles={['hr', 'department_head']}>
              <MyMRFsPage />
            </Protected>
          } />

          {/* Admin — MRF Approvals */}
          <Route path="/mrf-approvals" element={
            <Protected allowedRoles={['admin']}>
              <AdminMRFApprovalsPage />
            </Protected>
          } />

          {/* Admin — Settings */}
          <Route path="/settings" element={
            <Protected allowedRoles={['admin']}>
              <AdminSettingsPage />
            </Protected>
          } />





          {/* Protected — Candidate only */}
          <Route path="/apply/:mrfId" element={
            <Protected allowedRoles={['candidate']}>
              <CandidateApplyPage />
            </Protected>
          } />

          <Route path="/status" element={
            <Protected allowedRoles={['candidate']}>
              <CandidateStatusPage />
            </Protected>
          } />

          {/* Fallback */}
          <Route path="/" element={
            isLoggedIn()
              ? <Navigate to="/dashboard" replace />
              : <Navigate to="/login" replace />
          } />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </main>
    </div>
  )
}
