import { NavLink, useNavigate } from 'react-router-dom'
import { LogOut } from 'lucide-react'

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
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    navigate('/login');
  };

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
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div className="admin-avatar">PS</div>
            <div>
              <div className="admin-name">Prof. Sharma</div>
              <div className="admin-role">Administrator</div>
            </div>
          </div>
          <button 
            onClick={handleLogout}
            title="Logout"
            style={{ 
              background: 'transparent', border: 'none', color: 'rgba(255,255,255,0.4)', 
              cursor: 'pointer', padding: '4px', borderRadius: '4px', transition: '0.2s'
            }}
            onMouseOver={(e) => e.currentTarget.style.color = 'var(--color-cherry-glow)'}
            onMouseOut={(e) => e.currentTarget.style.color = 'rgba(255,255,255,0.4)'}
          >
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </div>
  )
}