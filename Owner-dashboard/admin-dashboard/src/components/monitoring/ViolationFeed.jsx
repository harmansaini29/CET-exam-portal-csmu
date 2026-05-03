import { useEffect, useRef } from 'react'

const severityIcon = { high: '🚨', medium: '⚠️', low: '📋' }

export default function ViolationFeed({ violations = [] }) {
  const prevLen = useRef(violations.length)

  useEffect(() => {
    prevLen.current = violations.length
  }, [violations])

  if (!violations.length) return (
    <div className="empty-state">No violations detected yet</div>
  )

  return (
    <div className="violation-list">
      {violations.map((v, i) => (
        <div
          key={v.id}
          className={`violation-item ${i < violations.length - prevLen.current ? 'new' : ''}`}
        >
          <div className="v-icon">
            {severityIcon[v.severity] || '⚠️'}
          </div>
          <div className="v-body">
            <div className="v-name">{v.student_name}</div>
            <div className="v-desc">
              {v.type}
              {v.count > 1 && ` × ${v.count}`} — {v.exam_title}
            </div>
          </div>
          <div className="v-time">{v.time}</div>
        </div>
      ))}
    </div>
  )
}