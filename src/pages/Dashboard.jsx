import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { UserPlus, Syringe, RefreshCw, Activity, Users, Shield, ChevronRight } from 'lucide-react'
import Header from '../components/Header'
import OfflineBanner from '../components/OfflineBanner'
import { useNetworkStatus } from '../hooks/useNetworkStatus'
import { useAuth } from '../AuthProvider/AuthContext'
import { getSyncOverview } from '../db/syncService'
import { fetchChildrenByDoctor } from '../api/childrenApi'

const ACTIONS = [
  {
    label: 'Register Child',
    description: 'Add a new child vaccination record to the system',
    icon: UserPlus,
    path: '/register',
    primary: true,
  },
  {
    label: 'View Tracker',
    description: 'Check scheduled doses and administer vaccines',
    icon: Syringe,
    path: '/tracker',
    primary: false,
  },
  {
    label: 'Sync Records',
    description: 'Push locally saved data to the server',
    icon: RefreshCw,
    path: '/sync',
    primary: false,
  },
]

export default function Dashboard() {
  const navigate = useNavigate()
  const { isOnline } = useNetworkStatus()
  const { user } = useAuth()
  const [patients, setPatients] = useState([])
  const [stats, setStats] = useState([
    {
      label: 'Registered Today',
      value: '0',
      icon: Users,
      color: 'var(--primary)',
      bg: 'var(--accent-light)',
      border: 'var(--accent-border)',
      trend: 'Offline registrations saved',
    },
    {
      label: 'Doses Given',
      value: '0',
      icon: Syringe,
      color: '#1d4ed8',
      bg: '#eff6ff',
      border: '#bfdbfe',
      trend: 'Local administration records',
    },
    {
      label: 'Pending Sync',
      value: '0',
      icon: RefreshCw,
      color: '#b45309',
      bg: '#fffbeb',
      border: '#fde68a',
      trend: 'Will sync when online',
    },
    {
      label: 'Failed Sync',
      value: '0',
      icon: Activity,
      color: '#b91c1c',
      bg: '#fef2f2',
      border: '#fecaca',
      trend: 'Needs retry',
    },
  ])

  const today = new Date().toLocaleDateString('en-NG', {
    weekday: 'long', day: 'numeric', month: 'long',
  })

  useEffect(() => {
    let alive = true

    const loadStats = async () => {
      try {
        const overview = await getSyncOverview()
        if (!alive) return

        setStats([
          {
            label: 'Registered Today',
            value: String(overview.counts.children),
            icon: Users,
            color: 'var(--primary)',
            bg: 'var(--accent-light)',
            border: 'var(--accent-border)',
            trend: 'Offline registrations saved',
          },
          {
            label: 'Doses Given',
            value: String(overview.counts.vaccinations),
            icon: Syringe,
            color: '#1d4ed8',
            bg: '#eff6ff',
            border: '#bfdbfe',
            trend: 'Local administration records',
          },
          {
            label: 'Pending Sync',
            value: String(overview.counts.pendingCount),
            icon: RefreshCw,
            color: '#b45309',
            bg: '#fffbeb',
            border: '#fde68a',
            trend: 'Will sync when online',
          },
          {
            label: 'Failed Sync',
            value: String(overview.counts.failedCount),
            icon: Activity,
            color: '#b91c1c',
            bg: '#fef2f2',
            border: '#fecaca',
            trend: overview.counts.failedCount > 0 ? 'Needs retry' : 'No sync failures',
          },
        ])
      } catch (error) {
        console.error('Failed to load dashboard stats:', error)
      }
    }

    loadStats()
    return () => { alive = false }
  }, [])

  useEffect(() => {
    let alive = true

    const loadPatients = async () => {
      try {
        const rows = await fetchChildrenByDoctor(user?.id)
        if (alive) setPatients(rows)
      } catch (error) {
        console.error('Failed to load patients:', error)
      }
    }

    loadPatients()
    return () => { alive = false }
  }, [user?.id])

  return (
    <div className="app-page" style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', backgroundColor: 'var(--pg-bg)' }}>
      <Header />
     

      <main
        className="app-main"
        style={{
          flex: 1,
          width: '100%',
          padding: '28px 24px 100px',
          display: 'flex',
          flexDirection: 'column',
          gap: 32,
          boxSizing: 'border-box',
        }}
      >
        <OfflineBanner/>
        {/* ── Greeting Banner ── */}
        <div
          style={{
            borderRadius: 20,
            padding: '28px 28px',
            background: 'var(--banner-gradient)',
            boxShadow: '0 10px 32px var(--primary-shadow)',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          {/* Decorative circles */}
          <div style={{
            position: 'absolute', top: -24, right: -20, width: 140, height: 140,
            borderRadius: '50%', backgroundColor: 'rgba(255,255,255,0.05)',
          }} />
          <div style={{
            position: 'absolute', bottom: -30, right: 30, width: 100, height: 100,
            borderRadius: '50%', backgroundColor: 'rgba(255,255,255,0.04)',
          }} />
          <div style={{
            position: 'absolute', top: '30%', right: '15%', width: 60, height: 60,
            borderRadius: '50%', backgroundColor: 'rgba(255,255,255,0.03)',
          }} />

          <div style={{ position: 'relative', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16 }}>
            <div style={{ flex: 1 }}>
              <p style={{
                fontSize: 11, fontWeight: 600, textTransform: 'uppercase',
                letterSpacing: '0.1em', color: 'rgba(255,255,255,0.5)', marginBottom: 8,
                fontFamily: 'Sora, sans-serif', margin: '0 0 8px 0',
              }}>
                {today}
              </p>
              <h1 style={{
                fontFamily: 'Sora, sans-serif', fontWeight: 800,
                fontSize: 24, color: '#ffffff', lineHeight: 1.25, margin: 0,
              }}>
                Good morning,
                <br />
                <span style={{ color: '#86efac' }}>{user?.name ?? 'Clinic Team'}</span>
              </h1>
            </div>

            <div style={{
              width: 52, height: 52, borderRadius: 16, flexShrink: 0,
              backgroundColor: 'rgba(255,255,255,0.12)',
              border: '1px solid rgba(255,255,255,0.1)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Shield size={24} style={{ color: 'rgba(255,255,255,0.85)' }} />
            </div>
          </div>

          {/* Network pill */}
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 8, marginTop: 20,
            padding: '7px 14px', borderRadius: 30,
            backgroundColor: 'rgba(255,255,255,0.08)',
            border: '1px solid rgba(255,255,255,0.1)',
          }}>
            <div style={{
              width: 8, height: 8, borderRadius: '50%',
              backgroundColor: isOnline ? '#4ade80' : '#fbbf24',
              boxShadow: isOnline ? '0 0 6px rgba(74,222,128,0.7)' : '0 0 6px rgba(251,191,36,0.7)',
            }} />
            <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.65)', fontWeight: 500 }}>
              {isOnline ? 'Connected — records syncing automatically' : 'Offline — saving locally'}
            </span>
          </div>
        </div>

        {/* ── Today's Stats ── */}
        <div>
          <h2 style={{
            fontFamily: 'Sora, sans-serif', fontWeight: 700, fontSize: 11,
            textTransform: 'uppercase', letterSpacing: '0.1em',
            color: '#6b7280', margin: '0 0 16px 0',
          }}>
            Today's Summary
          </h2>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
            gap: 14,
          }}>
            {stats.map(({ label, value, icon: Icon, color, bg, border, trend }) => (
              <div
                key={label}
                style={{
                  borderRadius: 18,
                  padding: '20px 20px 18px',
                  backgroundColor: 'var(--card-bg)',
                  border: '1px solid var(--card-border)',
                  boxShadow: '0 2px 12px color-mix(in srgb, var(--primary-shadow) 30%, transparent)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 14,
                }}
              >
                <div style={{
                  width: 42, height: 42, borderRadius: 12,
                  backgroundColor: bg,
                  border: `1px solid ${border}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <Icon size={18} style={{ color }} />
                </div>

                <div>
                  <p style={{
                    fontFamily: 'Sora, sans-serif', fontWeight: 800,
                    fontSize: 32, lineHeight: 1, color: 'var(--text-primary)', margin: 0,
                  }}>
                    {value}
                  </p>
                  <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', margin: '4px 0 0 0' }}>
                    {label}
                  </p>
                  <p style={{ fontSize: 11, color: 'var(--text-muted)', margin: '3px 0 0 0' }}>
                    {trend}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Quick Actions ── */}
        <div>
          <h2 style={{
            fontFamily: 'Sora, sans-serif', fontWeight: 700, fontSize: 11,
            textTransform: 'uppercase', letterSpacing: '0.1em',
            color: '#6b7280', margin: '0 0 16px 0',
          }}>
            Quick Actions
          </h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {ACTIONS.map(({ label, description, icon: Icon, path, primary }) => (
              <button
                key={path}
                onClick={() => navigate(path)}
                onMouseEnter={e => {
                  e.currentTarget.style.transform = 'translateY(-1px)'
                  e.currentTarget.style.boxShadow = primary
                    ? 'var(--btn-shadow-hover)'
                    : '0 4px 16px color-mix(in srgb, var(--primary-shadow) 18%, transparent)'
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.transform = 'translateY(0)'
                  e.currentTarget.style.boxShadow = primary
                    ? 'var(--btn-shadow)'
                    : '0 2px 8px color-mix(in srgb, var(--primary-shadow) 12%, transparent)'
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 18,
                  padding: '20px 22px',
                  borderRadius: 18,
                  border: primary ? 'none' : '1.5px solid #e5e7eb',
                  textAlign: 'left',
                  cursor: 'pointer',
                  transition: 'all 0.18s ease',
                  backgroundColor: primary ? 'var(--primary)' : 'var(--card-bg)',
                  boxShadow: primary
                    ? 'var(--btn-shadow)'
                    : '0 2px 8px color-mix(in srgb, var(--primary-shadow) 12%, transparent)',
                  width: '100%',
                  boxSizing: 'border-box',
                }}
              >
                <div style={{
                  width: 48, height: 48, borderRadius: 14, flexShrink: 0,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  backgroundColor: primary ? 'rgba(255,255,255,0.15)' : 'var(--accent-light)',
                  border: primary ? '1px solid rgba(255,255,255,0.12)' : '1px solid var(--accent-border)',
                }}>
                  <Icon size={21} style={{ color: primary ? '#ffffff' : 'var(--primary)' }} />
                </div>

                <div style={{ flex: 1 }}>
                  <p style={{
                    fontFamily: 'Sora, sans-serif', fontWeight: 700, fontSize: 15,
                    color: primary ? '#ffffff' : 'var(--text-primary)', margin: 0,
                  }}>
                    {label}
                  </p>
                  <p style={{
                    fontSize: 13, margin: '3px 0 0 0',
                    color: primary ? 'rgba(255,255,255,0.65)' : 'var(--text-secondary)',
                  }}>
                    {description}
                  </p>
                </div>

                <ChevronRight
                  size={17}
                  style={{ color: primary ? 'rgba(255,255,255,0.45)' : 'var(--text-muted)', flexShrink: 0 }}
                />
              </button>
            ))}
          </div>
        </div>

      </main>
    </div>
  )
}
