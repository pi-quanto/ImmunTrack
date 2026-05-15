import { useNavigate, useLocation } from 'react-router-dom'
import { Plus, Syringe, RefreshCw, LayoutDashboard, Settings as SettingsIcon, Users } from 'lucide-react'
import { useTheme } from './ThemeContext'

const tabs = [
  { label: 'Dashboard', icon: LayoutDashboard, path: '/'          },
  { label: 'Children',  icon: Users,            path: '/children' },
  { label: 'Tracker',   icon: Syringe,          path: '/tracker'  },
  { label: 'Sync',      icon: RefreshCw,        path: '/sync'     },
  { label: 'Settings',  icon: SettingsIcon,     path: '/settings' },
]

export default function BottomNav() {
  const navigate = useNavigate()
  const location = useLocation()
  const { theme } = useTheme()

  return (
    <>
      <nav  className="app-nav">
        <div className="app-nav__brand">
          <span className="app-nav__eyebrow">VAX-CHAIN</span>
          <h2 className="app-nav__title">Clinic Workspace</h2>
          <p className="app-nav__subtitle">
            Move between registration, tracking, and sync without crowding the content area.
          </p>
          <div style={{
          marginTop: 16,
          display: 'inline-flex',
          alignItems: 'center',
          gap: 8,
          padding: '10px 14px',
          borderRadius: 18,
          backgroundColor: 'var(--accent-light)',
          border: '1px solid var(--accent-border)',
          color: 'var(--primary)',
          fontSize: 12,
          fontWeight: 700,
          maxWidth: '100%',
          boxSizing: 'border-box',
        }}>
          <span style={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: 'var(--dot-online)', display: 'inline-block' }} />
          {theme.name}
        </div>
      </div>

      <div className="app-nav__inner">
        {tabs.map(({ label, icon: Icon, path }) => {
          const isActive = location.pathname === path

          return (
            <button
              key={path}
              onClick={() => navigate(path)}
              className={`app-nav__button${isActive ? ' is-active' : ''}`}
              style={{
                backgroundColor: isActive ? 'var(--nav-active-bg)' : 'var(--nav-item-bg)',
                borderColor: isActive ? 'var(--nav-active-border)' : 'transparent',
              }}
            >
              {isActive && <span className="app-nav__dot" />}
              <Icon
                size={21}
                strokeWidth={isActive ? 2.3 : 1.8}
                className="app-nav__icon"
                style={{ color: isActive ? 'var(--primary)' : 'var(--nav-item-muted)' }}
              />
              <span
                className="app-nav__label"
                style={{ color: isActive ? 'var(--primary)' : 'var(--nav-item-muted)' }}
              >
                {label}
              </span>
            </button>
          )
        })}
      </div>
    </nav>

      <button
        onClick={() => navigate('/register')}
        style={{
          position: 'fixed', right: 18, bottom: 88,
          width: 56, height: 56, borderRadius: '50%',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          backgroundColor: 'var(--primary)', color: 'white', border: 'none',
          boxShadow: '0 18px 40px rgba(16,185,129,0.24)', cursor: 'pointer',
          zIndex: 2000,
        }}
        aria-label="Register child"
      >
        <Plus size={26} />
      </button>
    </>
  )
}
