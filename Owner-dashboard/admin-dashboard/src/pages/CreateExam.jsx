import { useNavigate } from 'react-router-dom'
import CreateExamForm from '../components/exam/CreateExamModal'

export default function CreateExam() {
  const navigate = useNavigate()

  return (
    <div style={{ maxWidth: 680, margin: '0 auto' }}>
      {/* Info banner */}
      <div style={{
        background: 'var(--blue-light)',
        border: '1px solid rgba(59,130,246,0.2)',
        borderRadius: 'var(--radius-md)',
        padding: '12px 16px',
        marginBottom: 20,
        fontSize: 13,
        color: 'var(--blue-text)',
        display: 'flex',
        alignItems: 'flex-start',
        gap: 10
      }}>
        <span style={{ fontSize: 16 }}>ℹ️</span>
        <div>
          <strong>How it works:</strong> Fill in the exam details and upload your question file.
          Once created, a unique exam link will be generated for your students.
          The AI question parser will extract questions from your PDF or DOCX automatically.
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <div>
            <div className="card-title">New Examination</div>
            <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 2 }}>
              Fill all required fields marked with *
            </div>
          </div>
        </div>
        <CreateExamForm onSuccess={() => setTimeout(() => navigate('/exams'), 1500)} />
      </div>

      {/* Coming soon panel */}
      <div className="card" style={{ marginTop: 16 }}>
        <div className="card-header">
          <div className="card-title">🤖 AI Question Parser</div>
          <span className="tag tag-ml">Coming Soon</span>
        </div>
        <div style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.7 }}>
          Upload a PDF or DOCX file with your questions and the Python ML model will:
          <ul style={{ marginLeft: 20, marginTop: 8 }}>
            <li>Extract all questions automatically</li>
            <li>Detect question type (MCQ / descriptive)</li>
            <li>Structure options and correct answers</li>
            <li>Tag estimated difficulty per question</li>
          </ul>
        </div>
      </div>
    </div>
  )
}