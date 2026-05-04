import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Sidebar from './components/common/Sidebar'
import Topbar from './components/common/Topbar'
import Dashboard from './pages/Dashboard'
import LiveExam from './pages/LiveExam'
import ExamsList from './pages/ExamsList'
import CreateExam from './pages/CreateExam'
import ExamResults from './pages/ExamResults'
import AdminLogin from './pages/AdminLogin'

function ProtectedRoute({ children }) {
  const token = localStorage.getItem('adminToken')
  if (!token) {
    return <Navigate to="/login" replace />
  }
  return children
}

function Layout({ children, title, subtitle }) {
  return (
    <div className="app-layout">
      <Sidebar />
      <div className="main-area">
        <Topbar title={title} subtitle={subtitle} />
        <div className="page-content">{children}</div>
      </div>
    </div>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login"     element={<AdminLogin />} />
        <Route path="/"          element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<ProtectedRoute><Layout title="Overview Dashboard" subtitle="Welcome back, Prof. Sharma"><Dashboard /></Layout></ProtectedRoute>} />
        <Route path="/live"      element={<ProtectedRoute><Layout title="Live Exam Monitor"  subtitle="Physics — Unit 4 · Real-time"><LiveExam /></Layout></ProtectedRoute>} />
        <Route path="/exams"     element={<ProtectedRoute><Layout title="All Exams"          subtitle="Manage and track all examinations"><ExamsList /></Layout></ProtectedRoute>} />
        <Route path="/create"    element={<ProtectedRoute><Layout title="Create Exam"        subtitle="Set up a new examination"><CreateExam /></Layout></ProtectedRoute>} />
        <Route path="/results"   element={<ProtectedRoute><Layout title="Exam Results"       subtitle="Post-exam analytics and leaderboard"><ExamResults /></Layout></ProtectedRoute>} />
        <Route path="/results/:examId" element={<ProtectedRoute><Layout title="Exam Results" subtitle="Post-exam analytics and leaderboard"><ExamResults /></Layout></ProtectedRoute>} />
      </Routes>
    </BrowserRouter>
  )
}