import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import Navbar             from './components/Navbar.jsx'
import HRDashboard        from './pages/HRDashboard.jsx'
import ResumeTrackerPage  from './pages/ResumeTrackerPage.jsx'
import Login              from './pages/Login.jsx'
import CandidateApplyPage from './pages/CandidateApplyPage.jsx'
import CandidateStatusPage from './pages/CandidateStatusPage.jsx'

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

export default function App() {
  return (
    <div className="min-h-screen grid-bg flex flex-col">
      <Navbar />
      <main className="flex-1">
        <Routes>

          {/* Public routes */}
          <Route path="/login" element={
            <PublicOnly>
              <Login />
            </PublicOnly>
          } />

          {/* Protected — both roles */}
          <Route path="/dashboard" element={
            <Protected>
              <HRDashboard />
            </Protected>
          } />

          {/* Protected — HR Admin only */}
          <Route path="/resume-tracker" element={
            <Protected allowedRoles={['admin']}>
              <ResumeTrackerPage />
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