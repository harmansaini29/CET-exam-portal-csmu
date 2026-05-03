import { useLiveUpdates } from '../hooks/useLiveUpdates'
import StatCard from '../components/common/StatCard'
import LiveActivityLine from '../components/charts/LiveActivityLine'
import StudentTable from '../components/monitoring/StudentTable'
import ViolationFeed from '../components/monitoring/ViolationFeed'
import { getRiskColor } from '../utils/formatters'

export default function LiveExam() {
  const { analytics, violations, students, connected, loading } = useLiveUpdates(true)
  const stats = analytics?.live_stats

  return (
    <div>
      {/* Connection status */}
      <div style={{ display:'flex', alignItems:'center', gap:6, marginBottom:16, fontSize:12, color:'var(--text-muted)' }}>
        <span className={`ws-dot ${connected ? 'on' : 'off'}`} />
        {connected
          ? 'Receiving live updates from Python backend every 5s'
          : 'Reconnecting...'}
      </div>

      {/* Stats */}
      <div className="stats-grid">
        <StatCard label="Submitted"   value={loading ? '—' : stats?.submitted ?? 0}   sub="completed exam"       color="green"  icon="✅" />
        <StatCard label="In Progress" value={loading ? '—' : stats?.in_progress ?? 0} sub="currently attempting" color="blue"   icon="✍️" />
        <StatCard label="Not Started" value={loading ? '—' : stats?.not_started ?? 0} sub="yet to begin"         color="yellow" icon="⏳" />
        <StatCard label="Violations"  value={loading ? '—' : stats?.violations ?? 0}  sub="total alerts"         color="red"    icon="🚨" />
      </div>

      {/* Live chart */}
      <div className="card mb-20">
        <div className="card-header">
          <div>
            <div className="card-title">Live Submission Timeline</div>
            <div style={{ fontSize:12, color:'var(--text-secondary)', marginTop:2 }}>
              Updates every 5 seconds from Python WebSocket
            </div>
          </div>
          <span className="tag tag-live">● Live</span>
        </div>
        <LiveActivityLine timeline={analytics?.submission_timeline} />
      </div>

      {/* Student table + risk scores */}
      <div className="grid-2 mb-20">
        <div className="card">
          <div className="card-header">
            <div className="card-title">Student Activity</div>
            <span style={{ fontSize:12, color:'var(--text-secondary)' }}>
              {students.length} students
            </span>
          </div>
          <StudentTable students={students} />
        </div>

        <div className="card">
          <div className="card-header">
            <div className="card-title">ML Risk Scores</div>
            <span className="tag tag-ml">Model</span>
          </div>
          <div style={{ fontSize:11, color:'var(--text-muted)', marginBottom:12 }}>
            Based on tab switches, idle time, answer patterns
          </div>
          {students
            .slice()
            .sort((a, b) => b.risk_score - a.risk_score)
            .map(s => (
              <div key={s.id} className="risk-row">
                <div style={{ display:'flex', alignItems:'center', gap:8, flex:1 }}>
                  <div style={{
                    width:26, height:26, borderRadius:'50%',
                    background:'#eff6ff', color:'#1d4ed8',
                    display:'flex', alignItems:'center',
                    justifyContent:'center', fontSize:10,
                    fontWeight:600, flexShrink:0
                  }}>
                    {s.initials}
                  </div>
                  <span className="risk-name">{s.name}</span>
                </div>
                <div className="risk-bar-wrap">
                  <div
                    className="risk-bar"
                    style={{ width:`${s.risk_score}%`, background: getRiskColor(s.risk_score) }}
                  />
                </div>
                <span
                  className="risk-score-val"
                  style={{ color: getRiskColor(s.risk_score) }}
                >
                  {s.risk_score}
                </span>
              </div>
            ))}
          <div style={{ fontSize:11, color:'var(--text-muted)', marginTop:12, paddingTop:12, borderTop:'1px solid var(--border-light)' }}>
            Scores update every 5s · 70+ = High · 40–69 = Medium · below 40 = Low
          </div>
        </div>
      </div>

      {/* Violations */}
      <div className="card">
        <div className="card-header">
          <div className="card-title">Violation Feed</div>
          <span className="tag tag-live">{violations.length} alerts</span>
        </div>
        <ViolationFeed violations={violations} />
      </div>
    </div>
  )
}