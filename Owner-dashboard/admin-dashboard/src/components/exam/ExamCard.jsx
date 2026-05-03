import { useNavigate } from 'react-router-dom'
import { formatDate, formatDuration } from '../../utils/formatters'

const icons = { live: '◉', upcoming: '◷', completed: '✓' }
const iconClass = { live: 'live', upcoming: 'upcoming', completed: 'done' }

export default function ExamCard({ exam }) {
  const navigate = useNavigate()

  const handleClick = () => {
    if (exam.status === 'live') navigate('/live')
    else if (exam.status === 'completed') navigate(`/results/${exam.id}`)
  }

  return (
    <div className="exam-card" onClick={handleClick}>
      <div className={`exam-icon ${iconClass[exam.status] || 'done'}`}>
        {icons[exam.status]}
      </div>
      <div className="exam-info">
        <div className="exam-name">{exam.title}</div>
        <div className="exam-meta">
          {exam.enrolled} students · {formatDuration(exam.duration)} · {exam.type}
        </div>
      </div>
      <div className="exam-right">
        {exam.status === 'live' && (
          <span className="pill pill-live">Live</span>
        )}
        {exam.status === 'upcoming' && (
          <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>
            {formatDate(exam.start_time)}
          </div>
        )}
        {exam.status === 'completed' && (
          <div>
            <span className="pill pill-done">Done</span>
            {exam.avg_score && (
              <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>
                Avg {exam.avg_score}%
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}