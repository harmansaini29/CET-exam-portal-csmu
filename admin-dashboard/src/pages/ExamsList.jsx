import { useState } from 'react'
import { useExamData } from '../hooks/useExamData'
import ExamCard from '../components/exam/ExamCard'
import { formatDate, formatDuration } from '../utils/formatters'

export default function ExamsList() {
  const { exams, loading } = useExamData()
  const [filter, setFilter] = useState('all')

  const filtered = exams.filter(e => {
    if (filter === 'all') return true
    if (filter === 'live') return e.status === 'live'
    if (filter === 'upcoming') return e.status === 'upcoming'
    if (filter === 'completed') return e.status === 'completed'
    return true
  })

  const tabs = [
    { key: 'all',       label: 'All',       count: exams.length },
    { key: 'live',      label: 'Live',      count: exams.filter(e => e.status === 'live').length },
    { key: 'upcoming',  label: 'Upcoming',  count: exams.filter(e => e.status === 'upcoming').length },
    { key: 'completed', label: 'Completed', count: exams.filter(e => e.status === 'completed').length },
  ]

  return (
    <div>
      <div className="section-header">
        <div className="filter-tabs">
          {tabs.map(t => (
            <button
              key={t.key}
              className={`filter-tab ${filter === t.key ? 'active' : ''}`}
              onClick={() => setFilter(t.key)}
            >
              {t.label}
              <span style={{
                marginLeft: 5, fontSize: 10,
                background: 'var(--border)', padding: '1px 5px',
                borderRadius: 8, color: 'var(--text-secondary)'
              }}>
                {t.count}
              </span>
            </button>
          ))}
        </div>
        <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
          {filtered.length} exam{filtered.length !== 1 ? 's' : ''}
        </span>
      </div>

      {loading ? (
        <div className="loading">Loading exams...</div>
      ) : filtered.length === 0 ? (
        <div className="empty-state">No exams found for this filter</div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {filtered.map(exam => (
            <div key={exam.id}>
              <ExamCard exam={exam} />
              {/* Extra detail row */}
              <div style={{
                display: 'flex', gap: 16, padding: '6px 16px 10px',
                fontSize: 11, color: 'var(--text-muted)',
                borderLeft: '3px solid var(--border-light)',
                marginLeft: 8, marginTop: 2
              }}>
                <span>📅 {formatDate(exam.start_time)}</span>
                <span>⏱ {formatDuration(exam.duration)}</span>
                <span>👥 {exam.enrolled} students</span>
                {exam.avg_score && <span>📊 Avg score: {exam.avg_score}%</span>}
                {exam.submitted > 0 && (
                  <span>✅ {exam.submitted}/{exam.enrolled} submitted</span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}