import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import BottomNav from './components/BottomNav'
import Dashboard from './pages/Dashboard'
import ChildRegistration from './pages/ChildRegistration'
import VaccineTracker from './pages/VaccineTracker'
import ConfirmAdministration from './pages/ConfirmAdministration'
import SyncDashboard from './pages/SyncDashboard'
import SignUp from './pages/Signup'
import Login from './pages/Login'
import Settings from './pages/Settings'
import PatientProfile from './pages/PatientProfile'
import ChildrenManagement from './pages/ChildrenManagement'
import { useAuth } from './AuthProvider/AuthContext.jsx'

function PrivateRoute({ children }) {
  const { isAuthenticated, loading } = useAuth()
  if (loading) return null
  return isAuthenticated ? children : <Navigate to="/login" replace />
}

function PublicRoute({ children }) {
  const { isAuthenticated, loading } = useAuth()
  if (loading) return null
  return !isAuthenticated ? children : <Navigate to="/" replace />
}

function AuthenticatedLayout() {
  return (
    <div className="app-shell">
      <Routes>
        <Route path="/" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
        <Route path="/register" element={<PrivateRoute><ChildRegistration /></PrivateRoute>} />
        <Route path="/children" element={<PrivateRoute><ChildrenManagement /></PrivateRoute>} />
        <Route path="/tracker" element={<PrivateRoute><VaccineTracker /></PrivateRoute>} />
        <Route path="/administer" element={<PrivateRoute><ConfirmAdministration /></PrivateRoute>} />
        <Route path="/sync" element={<PrivateRoute><SyncDashboard /></PrivateRoute>} />
        <Route path="/settings" element={<PrivateRoute><Settings /></PrivateRoute>} />
        <Route path="/patient-profile" element={<PrivateRoute><PatientProfile /></PrivateRoute>} />
        <Route path="/patients/:patientId" element={<PrivateRoute><PatientProfile /></PrivateRoute>} />
        <Route path="*" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
      </Routes>
      <BottomNav />
    </div>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
        <Route path="/signup" element={<PublicRoute><SignUp /></PublicRoute>} />
        <Route path="/*" element={<AuthenticatedLayout />} />
      </Routes>
    </BrowserRouter>
  )
}
