import { BrowserRouter, Routes, Route } from 'react-router-dom'
import SignIn from './pages/SignIn'
import SignUp from './pages/SignUp'
import LandingPage from './pages/LandingPage'
import Dashboard from './pages/Dashboard'
import Tasks from './pages/Tasks'
import DashboardLayout from './layouts/DashboardLayout'
import Habits from './pages/Habits'
import Analytics from './pages/Analytics'
import ProtectedRoute from './middleware/ProtectedRoute'
import Settings from './pages/Settings'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/signin" element={<SignIn />} />
        <Route path="/signup" element={<SignUp />} />
        <Route element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/tasks" element={<Tasks />} />
          <Route path="/habits" element={<Habits />} />
          <Route path="/analytics" element={<Analytics />} />
          <Route path="/settings" element={<Settings/>} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}