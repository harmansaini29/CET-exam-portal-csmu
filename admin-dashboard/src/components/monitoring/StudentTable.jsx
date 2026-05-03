import { getRiskColor, getRiskLabel } from '../../utils/formatters'

export default function StudentTable({ students = [] }) {
  if (!students.length) return (
    <div className="empty-state">No student data available</div>
  )

  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr>
            <th>Student</th>
            <th>Batch</th>
            <th>Progress</th>
            <th>Status</th>
            <th>Risk Score</th>
          </tr>
        </thead>
        <tbody>
          {students.map(s => {
            const risk = getRiskLabel(s.risk_score)
            return (
              <tr key={s.id}>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{
                      width: 28, height: 28, borderRadius: '50%',
                      background: '#eff6ff', color: '#1d4ed8',
                      display: 'flex', alignItems: 'center',
                      justifyContent: 'center', fontSize: 10,
                      fontWeight: 600, flexShrink: 0
                    }}>
                      {s.initials}
                    </div>
                    <span style={{ fontWeight: 500 }}>{s.name}</span>
                  </div>
                </td>
                <td style={{ color: 'var(--text-secondary)', fontSize: 12 }}>{s.batch}</td>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div className="progress-wrap">
                      <div
                        className="progress-fill"
                        style={{
                          width: `${s.progress}%`,
                          background: s.progress === 100 ? '#22c55e' : '#3b82f6'
                        }}
                      />
                    </div>
                    <span style={{ fontSize: 11, color: 'var(--text-secondary)' }}>
                      {s.progress}%
                    </span>
                  </div>
                </td>
                <td>
                  <span className={`pill ${s.submitted ? 'pill-submitted' : 'pill-active'}`}>
                    {s.submitted ? 'Submitted' : 'Active'}
                  </span>
                </td>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div className="risk-bar-wrap" style={{ width: 60 }}>
                      <div
                        className="risk-bar"
                        style={{
                          width: `${s.risk_score}%`,
                          background: getRiskColor(s.risk_score)
                        }}
                      />
                    </div>
                    <span className={`pill ${risk.cls}`} style={{ fontSize: 10 }}>
                      {risk.label}
                    </span>
                  </div>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}