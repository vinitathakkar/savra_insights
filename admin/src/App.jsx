import { BrowserRouter, Routes, Route, NavLink } from 'react-router-dom'
import { LayoutDashboard, Users } from 'lucide-react'
import Dashboard from './pages/Dashboard'
import Teachers from './pages/Teachers'
import './styles.css'

const navItems = [
  { path: '/', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/teachers', label: 'Teachers', icon: Users },
]

function Sidebar() {
  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <div className="logo-icon">S</div>
        <span className="logo-text">SAVRA</span>
      </div>

      <p className="sidebar-section-label">MAIN</p>
      <nav className="sidebar-nav">
        {navItems.map(({ path, label, icon: Icon }) => (
          <NavLink
            key={path}
            to={path}
            end={path === '/'}
            className={({ isActive }) => `nav-item${isActive ? ' nav-item--active' : ''}`}
          >
            <Icon size={17} />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="sidebar-divider" />

      <div className="sidebar-footer">
        <div className="avatar-circle">SR</div>
        <div className="avatar-info">
          <p className="avatar-role">School Admin</p>
          <p className="avatar-name">Shauryaman Ray</p>
        </div>
      </div>
    </aside>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <div className="app-shell">
        <Sidebar />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/teachers" element={<Teachers />} />
            <Route path="/teachers/:id" element={<Teachers />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  )
}


