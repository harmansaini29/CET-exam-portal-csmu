import { useExamData } from '../hooks/useExamData'
import { useLiveUpdates } from '../hooks/useLiveUpdates'
import StatCard from '../components/common/StatCard'
import SubmissionDonut from '../components/charts/SubmissionDonut'
import LiveActivityLine from '../components/charts/LiveActivityLine'
import ScoreDistribution from '../components/charts/ScoreDistribution'
import ViolationFeed from '../components/monitoring/ViolationFeed'
import ExamCard from '../components/exam/ExamCard'

export default function Dashboard() {
  const { liveExam, upcomingExams, completedExams, loading: examLoading } = useExamData()
  const { analytics, violations, connected, loading: analyticsLoading } = useLiveUpdates(true)

  const loading = examLoading || analyticsLoading
  const stats = analytics?.live_stats

  return (
    <div>
      {/* WebSocket status */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 16, fontSize: 12, color: 'var(--text-muted)' }}>
        <span className={`ws-dot ${connected ? 'on' : 'off'}`} />
        {connected ? 'Live updates connected' : 'Connecting to live feed...'}
      </div>

      {/* Stat Cards */}
      <div className="stats-grid">
        <StatCard
          label="Total Enrolled"
          value={loading ? '—' : stats?.enrolled ?? 0}
          sub="in live exam"
          color="blue"
          icon="👥"
        />
        <StatCard
          label="Submitted"
          value={loading ? '—' : stats?.submitted ?? 0}
          sub={stats ? `of ${stats.enrolled} students` : ''}
          color="green"
          icon="✅"
        />
        <StatCard
          label="Violations"
          value={loading ? '—' : stats?.violations ?? 0}
          sub="tab switches + exits"
          color="yellow"
          icon="⚠️"
        />
        <StatCard
          label="High Risk"
          value={loading ? '—' : stats?.high_risk ?? 0}
          sub="ML flagged students"
          color="red"
          icon="🚨"
        />
      </div>

      {/* Charts Row */}
      <div className="grid-2 mb-20">
        <div className="card">
          <div className="card-header">
            <div>
              <div className="card-title">Submission Progress</div>
              <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 2 }}>
                Live exam snapshot
              </div>
            </div>
            <span className="tag tag-live">● Live</span>
          </div>
          <SubmissionDonut stats={stats} />
        </div>

        <div className="card">
          <div className="card-header">
            <div>
              <div className="card-title">Activity Timeline</div>
              <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 2 }}>
                Submissions over time
              </div>
            </div>
            <span className="tag tag-live">● Live</span>
          </div>
          <LiveActivityLine timeline={analytics?.submission_timeline} />
        </div>
      </div>

      {/* Violations + Upcoming */}
      <div className="grid-2 mb-20">
        <div className="card">
          <div className="card-header">
            <div className="card-title">Recent Violations</div>
            <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
              {violations.length} total
            </span>
          </div>
          <ViolationFeed violations={violations.slice(0, 4)} />
        </div>

        <div className="card">
          <div className="card-header">
            <div className="card-title">Exams</div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {liveExam && <ExamCard exam={liveExam} />}
            {upcomingExams.slice(0, 2).map(e => <ExamCard key={e.id} exam={e} />)}
            {completedExams.slice(0, 1).map(e => <ExamCard key={e.id} exam={e} />)}
          </div>
        </div>
      </div>

      {/* Score Distribution */}
      <div className="card">
        <div className="card-header">
          <div>
            <div className="card-title">Score Distribution</div>
            <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 2 }}>
              Based on submitted exams
            </div>
          </div>
          <span className="tag tag-ml">ML Model</span>
        </div>
        <ScoreDistribution data={analytics?.score_distribution} />
      </div>
    </div>
  )
}