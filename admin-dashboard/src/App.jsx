import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Sidebar from './components/common/Sidebar'
import Topbar from './components/common/Topbar'
import Dashboard from './pages/Dashboard'
import LiveExam from './pages/LiveExam'
import ExamsList from './pages/ExamsList'
import CreateExam from './pages/CreateExam'
import ExamResults from './pages/ExamResults'

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
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<Layout title="Overview Dashboard" subtitle="Welcome back, Prof. Sharma"><Dashboard /></Layout>} />
        <Route path="/live"      element={<Layout title="Live Exam Monitor"  subtitle="Physics — Unit 4 · Real-time"><LiveExam /></Layout>} />
        <Route path="/exams"     element={<Layout title="All Exams"          subtitle="Manage and track all examinations"><ExamsList /></Layout>} />
        <Route path="/create"    element={<Layout title="Create Exam"        subtitle="Set up a new examination"><CreateExam /></Layout>} />
        <Route path="/results"   element={<Layout title="Exam Results"       subtitle="Post-exam analytics and leaderboard"><ExamResults /></Layout>} />
        <Route path="/results/:examId" element={<Layout title="Exam Results" subtitle="Post-exam analytics and leaderboard"><ExamResults /></Layout>} />
      </Routes>
    </BrowserRouter>
  )
}