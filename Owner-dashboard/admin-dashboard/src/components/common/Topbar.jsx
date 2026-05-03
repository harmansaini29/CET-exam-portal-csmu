import { NavLink } from 'react-router-dom'

export default function Topbar({ title, subtitle }) {
  return (
    <div className="topbar">
      <div className="topbar-left">
        <h2>{title}</h2>
        {subtitle && <p>{subtitle}</p>}
      </div>
      <div className="topbar-right">
        <div className="live-badge">
          <span className="live-dot" />
          1 Exam Live
        </div>
        <NavLink to="/create">
          <button className="btn btn-primary btn-sm">+ New Exam</button>
        </NavLink>
      </div>
    </div>
  )
}