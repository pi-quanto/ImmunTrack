import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  LogOut, HardDrive, Palette, User, Shield,
  MapPin, Briefcase, Mail, ChevronRight, Trash2,
  Database, Wifi, WifiOff, CheckCircle2,
} from 'lucide-react'
import Header from '../components/Header'
import { useAuth } from '../AuthProvider/AuthContext'
import { useTheme, THEMES } from '../components/ThemeContext'
import { useNetworkStatus } from '../hooks/useNetworkStatus'
import { getSyncOverview } from '../db/syncService'
import db from '../db/database'

function SectionLabel({ children }) {
  return (
    <h2 style={{
      fontFamily: 'Sora, sans-serif', fontWeight: 700, fontSize: 11,
      textTransform: 'uppercase', letterSpacing: '0.1em',
      color: 'var(--text-secondary)', margin: 0,
    }}>
      {children}
    </h2>
  )
}

function SettingsCard({ children, style = {} }) {
  return (
    <div style={{
      borderRadius: 20,
      backgroundColor: 'var(--card-bg)',
      border: '1.5px solid var(--card-border)',
      boxShadow: '0 2px 12px color-mix(in srgb, var(--primary-shadow) 18%, transparent)',
      overflow: 'hidden',
      ...style,
    }}>
      {children}
    </div>
  )
}

function SettingsRow({ icon: Icon, label, value, onClick, danger = false, last = false }) {
  return (
    <button
      onClick={onClick}
      disabled={!onClick}
      style={{
        width: '100%', display: 'flex', alignItems: 'center', gap: 14,
        padding: '16px 20px',
        borderBottom: last ? 'none' : '1px solid var(--card-border)',
        background: 'none', border: 'none', borderBottom: last ? 'none' : '1px solid var(--card-border)',
        cursor: onClick ? 'pointer' : 'default', textAlign: 'left',
        boxSizing: 'border-box', transition: 'background 0.15s',
      }}
      onMouseEnter={e => { if (onClick) e.currentTarget.style.backgroundColor = 'var(--section-bg)' }}
      onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'transparent' }}
    >
      <div style={{
        width: 36, height: 36, borderRadius: 10, flexShrink: 0,
        backgroundColor: danger ? '#fef2f2' : 'var(--accent-light)',
        border: `1px solid ${danger ? '#fecaca' : 'var(--accent-border)'}`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <Icon size={16} style={{ color: danger ? '#dc2626' : 'var(--primary)' }} />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{
          fontFamily: 'Sora, sans-serif', fontWeight: 600, fontSize: 14,
          color: danger ? '#dc2626' : 'var(--text-primary)', margin: 0,
        }}>
          {label}
        </p>
        {value && (
          <p style={{ fontSize: 12, color: 'var(--text-muted)', margin: '2px 0 0 0', wordBreak: 'break-all' }}>
            {value}
          </p>
        )}
      </div>
      {onClick && <ChevronRight size={16} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />}
    </button>
  )
}

function StatPill({ label, value, color }) {
  return (
    <div style={{
      flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center',
      gap: 4, padding: '16px 8px',
      backgroundColor: 'var(--card-bg)',
      border: '1px solid var(--card-border)',
      borderRadius: 16,
    }}>
      <span style={{
        fontFamily: 'Sora, sans-serif', fontWeight: 800, fontSize: 22,
        color: color || 'var(--primary)',
      }}>
        {value}
      </span>
      <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', textAlign: 'center' }}>
        {label}
      </span>
    </div>
  )
}

export default function Settings() {
  const navigate = useNavigate()
  const { user, logout } = useAuth()
  const { themeId, setTheme, themes } = useTheme()
  const { isOnline } = useNetworkStatus()

  const [storageInfo, setStorageInfo] = useState({ quota: null, usage: null })
  const [dbCounts,    setDbCounts]    = useState({ children: 0, vaccinations: 0, syncQueue: 0 })
  const [clearing,    setClearing]    = useState(false)
  const [cleared,     setCleared]     = useState(false)

  useEffect(() => {
    const load = async () => {
      try {
        if (navigator.storage?.estimate) {
          const est = await navigator.storage.estimate()
          setStorageInfo({
            quota: est.quota ? (est.quota / 1024 / 1024).toFixed(1) : null,
            usage: est.usage ? (est.usage / 1024).toFixed(1) : '0',
          })
        }
      } catch {}

      try {
        const overview = await getSyncOverview()
        setDbCounts(overview.counts)
      } catch {
        setDbCounts({ children: 0, vaccinations: 0, syncQueue: 0 })
      }
    }

    load()

    const intervalId = window.setInterval(load, 2500)
    const handleFocus = () => { load() }
    window.addEventListener('focus', handleFocus)

    return () => {
      window.clearInterval(intervalId)
      window.removeEventListener('focus', handleFocus)
    }
  }, [])

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const handleClearCache = async () => {
    setClearing(true)
    try {
      // Clear browser cache
      if ('caches' in window) {
        const cacheKeys = await caches.keys()
        await Promise.all(cacheKeys.map((key) => caches.delete(key)))
      }

      // Clear all sync history from the local queue
      await db.syncQueue.clear()

      // Reload counts
      const overview = await getSyncOverview()
      setDbCounts(overview.counts)
    } finally {
      await new Promise(r => setTimeout(r, 400))
    }
    setClearing(false)
    setCleared(true)
    setTimeout(() => setCleared(false), 2500)
  }

  const initials = user?.name?.split(' ').map(n => n[0]).join('') ?? 'U'

  return (
    <div className="app-page settings-page" style={{
      display: 'flex', flexDirection: 'column', minHeight: '100vh',
      backgroundColor: 'var(--pg-bg)',
    }}>
      <Header title="Settings" />

      <main className="app-main settings-main" style={{
        flex: 1, width: '100%',
        padding: '28px 24px 100px',
        display: 'flex', flexDirection: 'column', gap: 28,
        boxSizing: 'border-box',
      }}>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>

        {/* ── User profile banner ── */}
        <div style={{
          borderRadius: 20, overflow: 'hidden',
          background: 'var(--banner-gradient)',
          boxShadow: '0 10px 32px var(--primary-shadow)',
          position: 'relative',
        }}>
          {/* Decorative circles */}
          <div style={{
            position: 'absolute', top: -24, right: -20, width: 140, height: 140,
            borderRadius: '50%', backgroundColor: 'rgba(255,255,255,0.05)',
          }} />
          <div style={{
            position: 'absolute', bottom: -30, right: 30, width: 100, height: 100,
            borderRadius: '50%', backgroundColor: 'rgba(255,255,255,0.04)',
          }} />

          <div style={{ position: 'relative', padding: '24px 24px 20px', display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{
              width: 58, height: 58, borderRadius: 18, flexShrink: 0,
              backgroundColor: 'rgba(255,255,255,0.15)',
              border: '1px solid rgba(255,255,255,0.12)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontFamily: 'Sora, sans-serif', fontWeight: 800, fontSize: 20, color: '#ffffff',
            }}>
              {initials}
            </div>
            <div style={{ flex: 1 }}>
              <p style={{
                fontSize: 10, fontWeight: 700, textTransform: 'uppercase',
                letterSpacing: '0.1em', color: 'rgba(255,255,255,0.5)',
                fontFamily: 'Sora, sans-serif', margin: '0 0 4px 0',
              }}>
                Signed in as
              </p>
              <h2 style={{
                fontFamily: 'Sora, sans-serif', fontWeight: 800,
                fontSize: 19, color: '#ffffff', margin: 0, lineHeight: 1.2,
              }}>
                {user?.name ?? 'User'}
              </h2>
              <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.55)', margin: '3px 0 0 0' }}>
                {user?.email}
              </p>
            </div>
            <div style={{
              padding: '5px 12px', borderRadius: 20, flexShrink: 0,
              backgroundColor: isOnline ? 'rgba(74,222,128,0.15)' : 'rgba(255,255,255,0.08)',
              border: `1px solid ${isOnline ? 'rgba(74,222,128,0.3)' : 'rgba(255,255,255,0.1)'}`,
              display: 'flex', alignItems: 'center', gap: 5,
            }}>
              {isOnline
                ? <Wifi size={11} style={{ color: 'var(--accent)' }} />
                : <WifiOff size={11} style={{ color: 'rgba(255,255,255,0.4)' }} />
              }
              <span style={{ fontSize: 11, fontWeight: 700, color: isOnline ? 'var(--accent)' : 'rgba(255,255,255,0.4)', fontFamily: 'Sora, sans-serif' }}>
                {isOnline ? 'Online' : 'Offline'}
              </span>
            </div>
          </div>

          <div style={{
            position: 'relative',
            display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))',
            gap: 1, borderTop: '1px solid rgba(255,255,255,0.08)',
            backgroundColor: 'rgba(255,255,255,0.06)',
          }}>
            {[
              { icon: Briefcase, label: user?.role ?? '—' },
              { icon: MapPin,    label: user?.clinic ?? '—' },
            ].map(({ icon: Icon, label }, i) => (
              <div key={i} style={{
                display: 'flex', alignItems: 'center', gap: 8,
                padding: '12px 20px', backgroundColor: 'rgba(0,0,0,0.08)',
              }}>
                <Icon size={13} style={{ color: 'rgba(255,255,255,0.45)', flexShrink: 0 }} />
                <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.6)', fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {label}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* ── Appearance / Theme ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <SectionLabel>Appearance</SectionLabel>

          <SettingsCard>
            <div style={{ padding: '20px' }}>
              <p style={{
                fontFamily: 'Sora, sans-serif', fontWeight: 700, fontSize: 13,
                color: 'var(--text-primary)', margin: '0 0 4px 0',
              }}>
                App Theme
              </p>
              <p style={{ fontSize: 12, color: 'var(--text-muted)', margin: '0 0 18px 0' }}>
                Changes the colour scheme across every screen
              </p>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                {Object.values(themes).map((t) => {
                  const isActive = themeId === t.id
                  return (
                    <button
                      key={t.id}
                      onClick={() => setTheme(t.id)}
                      style={{
                        display: 'flex', alignItems: 'center', gap: 12,
                        padding: '14px 16px', borderRadius: 14,
                        border: isActive ? `2px solid ${t.swatch[1]}` : '1.5px solid var(--card-border)',
                        backgroundColor: isActive ? `${t.swatch[1]}12` : 'var(--section-bg)',
                        cursor: 'pointer', textAlign: 'left',
                        transition: 'all 0.18s ease', boxSizing: 'border-box',
                        boxShadow: isActive ? `0 0 0 3px ${t.swatch[1]}25` : 'none',
                      }}
                    >
                      {/* Swatch stack */}
                      <div style={{ display: 'flex', gap: 3, flexShrink: 0 }}>
                        {t.swatch.map((c, i) => (
                          <div key={i} style={{
                            width: 14, height: 32, borderRadius: 6,
                            backgroundColor: c, flexShrink: 0,
                          }} />
                        ))}
                      </div>

                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{
                          fontFamily: 'Sora, sans-serif', fontWeight: 700,
                          fontSize: 12, color: 'var(--text-primary)', margin: 0,
                          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                        }}>
                          {t.name}
                        </p>
                      </div>

                      {isActive && (
                        <CheckCircle2 size={16} style={{ color: t.swatch[1], flexShrink: 0 }} />
                      )}
                    </button>
                  )
                })}
              </div>
            </div>
          </SettingsCard>
        </div>

        {/* ── Offline Storage ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <SectionLabel>Offline Storage</SectionLabel>

          {/* Stats row */}
          <div style={{ display: 'flex', gap: 10 }}>
            <StatPill label="Children" value={dbCounts.children} />
            <StatPill label="Doses" value={dbCounts.vaccinations} />
            <StatPill label="Sync Queue" value={dbCounts.syncQueue} color={dbCounts.syncQueue > 0 ? '#d97706' : undefined} />
          </div>

          <SettingsCard>
            <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--card-border)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{
                  width: 36, height: 36, borderRadius: 10, flexShrink: 0,
                  backgroundColor: 'var(--accent-light)',
                  border: '1px solid var(--accent-border)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <Database size={16} style={{ color: 'var(--primary)' }} />
                </div>
                <div style={{ flex: 1 }}>
                  <p style={{ fontFamily: 'Sora, sans-serif', fontWeight: 700, fontSize: 13, color: 'var(--text-primary)', margin: 0 }}>
                    Storage Usage
                  </p>
                  <p style={{ fontSize: 12, color: 'var(--text-muted)', margin: '2px 0 0 0' }}>
                    {storageInfo.usage !== null
                      ? `${storageInfo.usage} KB used${storageInfo.quota ? ` of ${storageInfo.quota} MB available` : ''}`
                      : 'Estimating…'
                    }
                  </p>
                </div>
              </div>

              {/* Usage bar */}
              {storageInfo.usage !== null && storageInfo.quota !== null && (
                <div style={{
                  marginTop: 14, width: '100%', height: 6, borderRadius: 99,
                  backgroundColor: 'var(--accent-light)', overflow: 'hidden',
                }}>
                  <div style={{
                    height: '100%', borderRadius: 99,
                    backgroundColor: 'var(--primary)',
                    width: `${Math.min((parseFloat(storageInfo.usage) / 1024 / parseFloat(storageInfo.quota)) * 100, 100)}%`,
                    transition: 'width 0.7s ease',
                  }} />
                </div>
              )}
            </div>

            <div style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <p style={{ fontFamily: 'Sora, sans-serif', fontWeight: 700, fontSize: 13, color: 'var(--text-primary)', margin: 0 }}>
                  Local Cache
                </p>
                <p style={{ fontSize: 12, color: 'var(--text-muted)', margin: '2px 0 0 0' }}>
                  Clears synced records and temporary data
                </p>
              </div>
              <button
                onClick={handleClearCache}
                disabled={clearing}
                style={{
                  display: 'flex', alignItems: 'center', gap: 6,
                  padding: '8px 14px', borderRadius: 10,
                  border: '1.5px solid var(--card-border)',
                  backgroundColor: cleared ? 'var(--pg-bg)' : 'var(--section-bg)',
                  cursor: clearing ? 'not-allowed' : 'pointer',
                  fontFamily: 'Sora, sans-serif', fontWeight: 700,
                  fontSize: 12, color: cleared ? 'var(--primary)' : 'var(--text-secondary)',
                  transition: 'all 0.18s',
                  flexShrink: 0,
                }}
              >
                {clearing ? (
                  <div style={{
                    width: 13, height: 13,
                    border: '2px solid #d1d5db', borderTopColor: '#6b7280',
                    borderRadius: '50%', animation: 'spin 0.75s linear infinite',
                  }} />
                ) : cleared ? (
                  <CheckCircle2 size={13} style={{ color: 'var(--primary)' }} />
                ) : (
                  <Trash2 size={13} />
                )}
                {clearing ? 'Clearing…' : cleared ? 'Cleared!' : 'Clear'}
              </button>
            </div>
          </SettingsCard>
        </div>

        {/* ── Account ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <SectionLabel>Account</SectionLabel>
          <SettingsCard>
            <SettingsRow
              icon={Mail}
              label="Email Address"
              value={user?.email}
              last
            />
          </SettingsCard>

          <SettingsCard>
            <SettingsRow
              icon={Shield}
              label="App Version"
              value="ImmunTrack v1.0.0 — Offline-first PWA"
              last
            />
          </SettingsCard>

          <button
            onClick={handleLogout}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 8px 22px rgba(220,38,38,0.3)' }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 14px rgba(220,38,38,0.2)' }}
            style={{
              width: '100%', padding: '17px 0',
              borderRadius: 16, border: 'none',
              cursor: 'pointer', fontFamily: 'Sora, sans-serif',
              fontWeight: 800, fontSize: 15, letterSpacing: '0.04em',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
              backgroundColor: '#dc2626', color: '#ffffff',
              boxShadow: '0 4px 14px rgba(220,38,38,0.2)',
              transition: 'all 0.18s ease', boxSizing: 'border-box',
            }}
          >
            <LogOut size={18} />
            Sign Out
          </button>
        </div>

      </main>
    </div>
  )
}
