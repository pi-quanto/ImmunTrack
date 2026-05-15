import { forwardRef } from 'react'
import { Wifi, WifiOff, ArrowLeft, Activity, Palette } from 'lucide-react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useNetworkStatus } from '../hooks/useNetworkStatus'
import { useTheme } from './ThemeContext'

const PAGE_CONTEXT = {
  '/': {
    eyebrow: 'Clinic overview',
    title: 'Clinic Dashboard',
    subtitle: 'Monitor registrations, doses, and sync status from one mobile-first workspace.',
  },
  '/register': {
    eyebrow: 'Care intake',
    title: 'Child Registration',
    subtitle: 'Capture accurate child and guardian details before records sync to the server.',
  },
  '/tracker': {
    eyebrow: 'Vaccination flow',
    title: 'Vaccine Tracker',
    subtitle: 'Review the active child record and move due doses through administration safely.',
  },
  '/administer': {
    eyebrow: 'Dose confirmation',
    title: 'Confirm Administration',
    subtitle: 'Verify the dose details, batch number, and administration site before saving.',
  },
  '/sync': {
    eyebrow: 'Data operations',
    title: 'Sync Dashboard',
    subtitle: 'Check queue health, resolve conflicts, and track what is ready for upload.',
  },
  '/settings': {
    eyebrow: 'Workspace preferences',
    title: 'Settings',
    subtitle: 'Adjust theme, review local storage, and manage your clinic session.',
  },
}

// forwardRef lets Dashboard pass a ref directly to the <header> DOM element.
// This is how the scroll listener in Dashboard will add/remove 'header-hidden'
// on the exact DOM node — no prop drilling, no state re-renders.
const Header = forwardRef(function Header(
  { title, subtitle, eyebrow, showBack = false, onMenuClick },
  ref
) {
  const { isOnline } = useNetworkStatus()
  const { theme } = useTheme()
  const location = useLocation()
  const navigate = useNavigate()
  const context = PAGE_CONTEXT[location.pathname] ?? PAGE_CONTEXT['/']
  const resolvedTitle    = title    ?? context.title
  const resolvedSubtitle = subtitle ?? context.subtitle
  const resolvedEyebrow  = eyebrow  ?? context.eyebrow

  return (
    // ref is forwarded here — Dashboard will hold a pointer to this DOM node
    <header ref={ref} className="app-header">
      <button
        onClick={showBack ? () => navigate(-1) : onMenuClick}
        aria-label={showBack ? 'Go back' : 'Current workspace'}
        className="app-header__action"
      >
        {showBack ? <ArrowLeft size={19} /> : <Activity size={19} />}
      </button>

      <div className="app-header__content">
        <div className="app-header__topline" style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
          <span className="app-header__eyebrow">{resolvedEyebrow}</span>
          <div
            className="app-header__status"
            style={{
              backgroundColor: isOnline ? 'rgba(74,222,128,0.16)' : 'rgba(255,255,255,0.08)',
              borderColor:     isOnline ? 'rgba(74,222,128,0.28)' : 'rgba(255,255,255,0.10)',
              color:           isOnline ? 'var(--accent-border)'  : 'rgba(255,255,255,0.65)',
            }}
          >
            {isOnline
              ? <Wifi     size={12} strokeWidth={2.2} />
              : <WifiOff  size={12} strokeWidth={2.2} />
            }
            <span>{isOnline ? 'Online' : 'Offline'}</span>
          </div>
          <div style={{
            padding: '6px 12px', borderRadius: 999,
            backgroundColor: 'rgba(255,255,255,0.12)',
            border: '1px solid rgba(255,255,255,0.10)',
            color: '#ffffff',
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: '0.06em',
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
          }}>
            <Palette size={12} />
            {theme.name}
          </div>
        </div>

        <div className="app-header__text">
          <h1 className="app-header__title">{resolvedTitle}</h1>
          <p  className="app-header__subtitle">{resolvedSubtitle}</p>
        </div>
      </div>
    </header>
  )
})

export default Header
