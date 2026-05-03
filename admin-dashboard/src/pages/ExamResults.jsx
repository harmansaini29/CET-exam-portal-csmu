import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { getCompletedExams } from '../api/examApi'
import { getExamAnalytics } from '../api/analyticsApi'
import ScoreDistribution from '../components/charts/ScoreDistribution'

export default function ExamResults() {
  const { examId } = useParams()
  const [exams, setExams]         = useState([])
  const [selected, setSelected]   = useState(examId || '')
  const [analytics, setAnalytics] = useState(null)
  const [loading, setLoading]     = useState(true)

  useEffect(() => {
    getCompletedExams().then(data => {
      setExams(data)
      if (!selected && data.length > 0) setSelected(data[0].id)
    })
  }, [])

  useEffect(() => {
    if (!selected) return
    setLoading(true)
    getExamAnalytics(selected).then(data => {
      setAnalytics(data)
      setLoading(false)
    })
  }, [selected])

  const medals = ['🥇', '🥈', '🥉']

  return (
    <div>
      {/* Exam selector */}
      <div className="card mb-20">
        <div style={{ display:'flex', alignItems:'center', gap:12, flexWrap:'wrap' }}>
          <label style={{ fontSize:13, fontWeight:500, color:'var(--text-secondary)' }}>
            Select Exam:
          </label>
          <select
            className="form-input"
            style={{ width:'auto', minWidth:240 }}
            value={selected}
            onChange={e => setSelected(e.target.value)}
          >
            {exams.map(e => (
              <option key={e.id} value={e.id}>{e.title}</option>
            ))}
          </select>
          {analytics && (
            <div style={{ display:'flex', gap:16, marginLeft:'auto', fontSize:12, color:'var(--text-secondary)' }}>
              <span>Avg: <strong style={{ color:'var(--text-primary)' }}>{analytics.avg_score}%</strong></span>
              <span>Highest: <strong style={{ color:'var(--green-text)' }}>{analytics.highest_score}%</strong></span>
              <span>Lowest: <strong style={{ color:'var(--red-text)' }}>{analytics.lowest_score}%</strong></span>
            </div>
          )}
        </div>
      </div>

      {loading ? (
        <div className="loading">Loading results...</div>
      ) : (
        <>
          <div className="grid-2 mb-20">
            {/* Leaderboard */}
            <div className="card">
              <div className="card-header">
                <div className="card-title">🏆 Leaderboard</div>
                <span style={{ fontSize:12, color:'var(--text-secondary)' }}>
                  Top performers
                </span>
              </div>
              <div>
                {analytics?.leaderboard?.map((s, i) => (
                  <div key={s.id} className="lb-item">
                    <div className="lb-rank">
                      {i < 3 ? medals[i] : <span style={{ color:'var(--text-muted)', fontSize:12 }}>{i + 1}</span>}
                    </div>
                    <div className="lb-avatar">{s.initials}</div>
                    <div className="lb-name">{s.name}</div>
                    <div className="lb-score">{s.score}%</div>
                    <div className="lb-time">{s.time_taken}m</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Question difficulty */}
            <div className="card">
              <div className="card-header">
                <div className="card-title">Question Difficulty</div>
                <span className="tag tag-ml">ML Tagged</span>
              </div>
              <div style={{ fontSize:11, color:'var(--text-muted)', marginBottom:12 }}>
                % of students who answered correctly
              </div>
              {analytics?.question_difficulty?.map(q => (
                <div key={q.q} style={{ display:'flex', alignItems:'center', gap:10, marginBottom:8 }}>
                  <span style={{ width:28, fontSize:11, color:'var(--text-secondary)', fontWeight:500 }}>
                    {q.q}
                  </span>
                  <div style={{ flex:1, background:'var(--bg)', borderRadius:4, height:8, overflow:'hidden' }}>
                    <div style={{
                      width:`${q.correct}%`, height:'100%', borderRadius:4,
                      background: q.correct >= 75 ? '#22c55e' : q.correct >= 50 ? '#f59e0b' : '#ef4444',
                      transition: 'width 0.5s'
                    }} />
                  </div>
                  <span style={{ fontSize:11, color:'var(--text-secondary)', width:32, textAlign:'right' }}>
                    {q.correct}%
                  </span>
                  <span className={`pill pill-${q.tag.toLowerCase()}`} style={{ fontSize:10 }}>
                    {q.tag}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Score distribution */}
          <div className="card">
            <div className="card-header">
              <div className="card-title">Score Distribution</div>
              <span className="tag tag-ml">Analytics</span>
            </div>
            <ScoreDistribution data={analytics?.score_distribution} />
          </div>
        </>
      )}
    </div>
  )
}