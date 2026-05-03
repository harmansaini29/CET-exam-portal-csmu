import { NavLink } from 'react-router-dom'

const navItems = [
  { to: '/dashboard', icon: '▦', label: 'Dashboard' },
  { section: 'Exams' },
  { to: '/live',   icon: '◉', label: 'Live Monitor', badge: 'LIVE' },
  { to: '/exams',  icon: '☰', label: 'All Exams' },
  { to: '/create', icon: '+', label: 'Create Exam' },
  { section: 'Results' },
  { to: '/results', icon: '◑', label: 'Results' },
]

export default function Sidebar() {
  return (
    <div className="sidebar">
      <div className="sidebar-logo">
        <h1>⚡ ExamPortal</h1>
        <p>Admin Console</p>
      </div>

      <nav className="sidebar-nav">
        {navItems.map((item, i) => {
          if (item.section) return (
            <div key={i} className="nav-section-label">{item.section}</div>
          )
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
            >
              <span className="nav-icon">{item.icon}</span>
              {item.label}
              {item.badge && <span className="nav-badge">{item.badge}</span>}
            </NavLink>
          )
        })}
      </nav>

      <div className="sidebar-footer">
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div className="admin-avatar">PS</div>
          <div>
            <div className="admin-name">Prof. Sharma</div>
            <div className="admin-role">Administrator</div>
          </div>
        </div>
      </div>
    </div>
  )
}