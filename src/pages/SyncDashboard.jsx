import { useEffect, useState } from 'react'
import {
  RefreshCw, CloudOff, Cloud, CheckCircle2, AlertTriangle,
  UserPlus, Syringe, ClipboardList, Clock,
} from 'lucide-react'
import Header from '../components/Header'
import OfflineBanner from '../components/OfflineBanner'
import { useNetworkStatus } from '../hooks/useNetworkStatus'
import db from '../db/database'
import { getSyncOverview, syncPendingRecords } from '../db/syncService'

const LOG_STATUS = {
  pending: {
    color: '#d97706', bg: '#ffffff', border: '#e5e7eb',
    iconBg: '#fffbeb', label: 'Pending',
  },
  synced: {
    color: 'var(--primary)', bg: 'var(--card-bg)', border: 'var(--card-border)',
    iconBg: 'var(--accent-light)', label: 'Synced',
  },
  failed: {
    color: '#dc2626', bg: '#fef2f2', border: '#fecaca',
    iconBg: '#fee2e2', label: 'Failed',
  },
}

function iconForType(type) {
  if (type === 'vaccination') return Syringe
  if (type === 'inventory') return ClipboardList
  return UserPlus
}

function SyncLogItem({ item, onRetry }) {
  const cfg = LOG_STATUS[item.status] ?? LOG_STATUS.pending
  const Icon = iconForType(item.type)

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: 16,
      padding: '18px 20px',
      borderRadius: 18,
      backgroundColor: cfg.bg,
      border: `1.5px solid ${cfg.border}`,
      boxShadow: '0 2px 10px color-mix(in srgb, var(--primary-shadow) 24%, transparent)',
      boxSizing: 'border-box',
    }}>
      <div style={{
        width: 44, height: 44, borderRadius: 13, flexShrink: 0,
        backgroundColor: cfg.iconBg,
        border: `1px solid ${cfg.border}`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <Icon size={19} style={{ color: cfg.color }} />
      </div>

      <div style={{ flex: 1, minWidth: 0 }}>
        <span style={{
          fontSize: 10, fontWeight: 700, textTransform: 'uppercase',
          letterSpacing: '0.09em', color: cfg.color,
          fontFamily: 'Sora, sans-serif',
        }}>
          {cfg.label}
        </span>
        <p style={{
          fontFamily: 'Sora, sans-serif', fontWeight: 700, fontSize: 14,
          color: 'var(--text-primary)', margin: '2px 0 0 0',
          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
        }}>
          {item.title}
        </p>
        <p style={{ fontSize: 12, color: 'var(--text-muted)', margin: '2px 0 0 0' }}>
          {item.subtitle}
        </p>
      </div>

      <div style={{ flexShrink: 0, display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6 }}>
        {item.status === 'failed' && (
          <button
            onClick={() => onRetry(item)}
            onMouseEnter={e => { e.currentTarget.style.backgroundColor = '#dc2626'; e.currentTarget.style.color = '#ffffff' }}
            onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = '#dc2626' }}
            style={{
              fontSize: 12, fontWeight: 700, padding: '6px 14px', borderRadius: 10,
              border: '1.5px solid #dc2626', color: '#dc2626',
              backgroundColor: 'transparent', cursor: 'pointer',
              fontFamily: 'Sora, sans-serif', transition: 'all 0.15s',
            }}
          >
            Retry
          </button>
        )}
        {item.status === 'pending' && (
          <Clock size={17} style={{ color: '#d97706', animation: 'pulse 2s infinite' }} />
        )}
        {item.status === 'synced' && (
          <CheckCircle2 size={17} style={{ color: 'var(--primary)' }} />
        )}
        {item.status === 'failed' && (
          <AlertTriangle size={17} style={{ color: '#dc2626' }} />
        )}
        <span style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 500 }}>{item.time}</span>
      </div>
    </div>
  )
}

export default function SyncDashboard() {
  const { isOnline } = useNetworkStatus()
  const [syncing, setSyncing] = useState(false)
  const [logs, setLogs] = useState([])
  const [pendingCount, setPendingCount] = useState(0)
  const [syncedCount, setSyncedCount] = useState(0)
  const [failedCount, setFailedCount] = useState(0)

  const loadOverview = async () => {
    const overview = await getSyncOverview()
    setLogs(overview.logs)
    setPendingCount(overview.counts.pendingCount)
    setSyncedCount(overview.counts.syncedCount)
    setFailedCount(overview.counts.failedCount)
  }

  useEffect(() => {
    loadOverview().catch((error) => {
      console.error('Failed to load sync overview:', error)
    })
  }, [])

  const totalItems = pendingCount + syncedCount + failedCount
  const progressPercent = totalItems > 0 ? Math.round((syncedCount / totalItems) * 100) : 0

  const handleSync = async () => {
    if (!isOnline) return
    setSyncing(true)
    try {
      await syncPendingRecords()
      await loadOverview()
    } catch (error) {
      console.error('Sync failed:', error)
    } finally {
      setSyncing(false)
    }
  }

  const handleRetry = async (item) => {
    await db.syncQueue.update(item.id, {
      status: 'pending',
      lastError: null,
      updatedAt: new Date().toISOString(),
    })
    await loadOverview()
  }

  const disabled = !isOnline || syncing || pendingCount === 0

  return (
    <div className="app-page" style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', backgroundColor: 'var(--pg-bg)' }}>
      <Header />

      <main className="app-main" style={{
        flex: 1,
        width: '100%',
        padding: '28px 24px 100px',
        display: 'flex',
        flexDirection: 'column',
        gap: 32,
        boxSizing: 'border-box',
      }}>
        <OfflineBanner />

        <style>{`@keyframes spin { to { transform: rotate(360deg); } } @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.45} }`}</style>

        <div style={{
          borderRadius: 20,
          padding: '28px 28px',
          background: 'var(--banner-gradient)',
          boxShadow: '0 10px 32px var(--primary-shadow)',
          position: 'relative',
          overflow: 'hidden',
        }}>
          <div style={{
            position: 'absolute', top: -24, right: -20, width: 140, height: 140,
            borderRadius: '50%', backgroundColor: 'rgba(255,255,255,0.05)',
          }} />
          <div style={{
            position: 'absolute', bottom: -30, right: 30, width: 100, height: 100,
            borderRadius: '50%', backgroundColor: 'rgba(255,255,255,0.04)',
          }} />

          <div style={{ position: 'relative', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16 }}>
            <div style={{ flex: 1 }}>
              <p style={{
                fontSize: 11, fontWeight: 600, textTransform: 'uppercase',
                letterSpacing: '0.1em', color: 'rgba(255,255,255,0.5)',
                fontFamily: 'Sora, sans-serif', margin: '0 0 8px 0',
              }}>
                Current Status
              </p>
              <h1 style={{
                fontFamily: 'Sora, sans-serif', fontWeight: 800,
                fontSize: 24, color: '#ffffff', lineHeight: 1.25, margin: 0,
              }}>
                {pendingCount} {pendingCount === 1 ? 'item' : 'items'}
                <br />
                <span style={{ color: '#86efac' }}>waiting to sync</span>
              </h1>
            </div>
            <div style={{
              width: 52, height: 52, borderRadius: 16, flexShrink: 0,
              backgroundColor: 'rgba(255,255,255,0.12)',
              border: '1px solid rgba(255,255,255,0.1)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <RefreshCw
                size={22}
                style={{
                  color: 'rgba(255,255,255,0.85)',
                  animation: syncing ? 'spin 1s linear infinite' : 'none',
                }}
              />
            </div>
          </div>

          <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.45)', margin: '12px 0 18px 0' }}>
            {isOnline ? 'Ready to push local records to your database' : 'Offline mode active - records stay in IndexedDB until a connection returns'}
          </p>

          <div style={{
            width: '100%', borderRadius: 99, overflow: 'hidden',
            height: 6, backgroundColor: 'rgba(255,255,255,0.12)', marginBottom: 20,
          }}>
            <div style={{
              height: '100%', borderRadius: 99,
              width: `${progressPercent}%`,
              backgroundColor: '#4ade80',
              transition: 'width 0.7s ease',
            }} />
          </div>

          <button
            onClick={handleSync}
            disabled={disabled}
            style={{
              width: '100%',
              padding: '15px 0',
              borderRadius: 14,
              border: 'none',
              cursor: disabled ? 'not-allowed' : 'pointer',
              fontFamily: 'Sora, sans-serif',
              fontWeight: 800,
              fontSize: 14,
              letterSpacing: '0.03em',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 10,
              backgroundColor: disabled ? 'rgba(255,255,255,0.1)' : '#ffffff',
              color: disabled ? 'rgba(255,255,255,0.35)' : 'var(--primary-dark)',
              transition: 'all 0.18s ease',
              boxSizing: 'border-box',
            }}
          >
            {syncing ? (
              <>
                <div style={{
                  width: 16, height: 16,
                  border: '2.5px solid color-mix(in srgb, var(--primary-shadow) 85%, transparent)',
                  borderTopColor: 'var(--primary-dark)',
                  borderRadius: '50%',
                  animation: 'spin 0.75s linear infinite',
                }} />
                Syncing Records...
              </>
            ) : !isOnline ? (
              <><CloudOff size={16} /> Offline - Cannot Sync</>
            ) : pendingCount === 0 ? (
              <><CheckCircle2 size={16} /> All Records Synced</>
            ) : (
              <><RefreshCw size={16} /> Sync Now ({pendingCount} records)</>
            )}
          </button>
        </div>

        <div>
          <h2 style={{
            fontFamily: 'Sora, sans-serif', fontWeight: 700, fontSize: 11,
            textTransform: 'uppercase', letterSpacing: '0.1em',
            color: '#6b7280', margin: '0 0 16px 0',
          }}>
            Summary
          </h2>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 14 }}>
            {[
              {
                label: 'Synced Records', value: syncedCount,
                icon: Cloud, color: 'var(--primary)', bg: 'var(--accent-light)', border: 'var(--accent-border)',
                trend: 'Validated database writes',
              },
              {
                label: 'Pending Upload', value: pendingCount,
                icon: RefreshCw, color: '#b45309', bg: '#fffbeb', border: '#fde68a',
                trend: 'Saved locally in IndexedDB',
              },
              {
                label: 'Failed Sync', value: failedCount,
                icon: AlertTriangle, color: '#b91c1c', bg: '#fef2f2', border: '#fecaca',
                trend: failedCount > 0 ? 'Retry these records' : 'No sync failures',
              },
            ].map(({ label, value, icon: Icon, color, bg, border, trend }) => (
              <div key={label} style={{
                borderRadius: 18,
                padding: '20px 20px 18px',
                backgroundColor: 'var(--card-bg)',
                border: '1px solid var(--card-border)',
                boxShadow: '0 2px 12px color-mix(in srgb, var(--primary-shadow) 30%, transparent)',
                display: 'flex',
                flexDirection: 'column',
                gap: 14,
              }}>
                <div style={{
                  width: 42, height: 42, borderRadius: 12,
                  backgroundColor: bg, border: `1px solid ${border}`,
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

        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <h2 style={{
              fontFamily: 'Sora, sans-serif', fontWeight: 700, fontSize: 11,
              textTransform: 'uppercase', letterSpacing: '0.1em',
              color: '#6b7280', margin: 0,
            }}>
              Synchronization Log
            </h2>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {logs.length > 0 ? logs.map((item) => (
              <SyncLogItem key={item.id} item={item} onRetry={handleRetry} />
            )) : (
              <div style={{
                borderRadius: 18,
                padding: '24px 20px',
                backgroundColor: 'var(--card-bg)',
                border: '1px solid var(--card-border)',
                color: 'var(--text-secondary)',
                fontSize: 14,
              }}>
                No offline records have been queued yet.
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
