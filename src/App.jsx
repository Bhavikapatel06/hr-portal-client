import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import Navbar           from './components/Navbar.jsx'
import HRDashboard      from './pages/HRDashboard.jsx'
import ResumeTrackerPage from './pages/ResumeTrackerPage.jsx'
import Login            from './pages/Login.jsx'
import CandidateApplyPage from './pages/CandidateApplyPage.jsx'

// Simple role protection wrapper
function Protected({ children, allowedRoles }) {
  const role = localStorage.getItem('hr_role')
  if (!role) {
    return <Navigate to="/login" replace />
  }
  if (allowedRoles && !allowedRoles.includes(role)) {
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
          <Route path="/login" element={<Login />} />
          
          <Route path="/dashboard" element={
            <Protected>
              <HRDashboard />
            </Protected>
          } />
          
          <Route path="/resume-tracker" element={
            <Protected allowedRoles={['admin']}>
              <ResumeTrackerPage />
            </Protected>
          } />

          <Route path="/apply/:mrfId" element={
            <Protected allowedRoles={['candidate']}>
              <CandidateApplyPage />
            </Protected>
          } />

          {/* Fallback routes */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </main>
    </div>
  )
}
