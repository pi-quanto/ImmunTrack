import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import {
  CheckCircle2, Syringe, ChevronDown, Calendar,
  Hash, Shield, AlertCircle, MapPin,
} from 'lucide-react'
import Header from '../components/Header'
import OfflineBanner from '../components/OfflineBanner'
import { useAuth } from '../AuthProvider/AuthContext'
import { useNetworkStatus } from '../hooks/useNetworkStatus'
import { saveVaccinationRecord } from '../db/syncService'
import { syncPendingRecords } from '../db/syncService'

const ADMIN_SITES = [
  'Right Arm (Deltoid)',
  'Left Arm (Deltoid)',
  'Right Thigh',
  'Left Thigh',
  'Oral (Drops)',
]

const AVAILABLE_VACCINES = [
  { name: 'BCG',         description: 'Bacillus Calmette-Guérin' },
  { name: 'OPV',         description: 'Oral Polio Vaccine' },
  { name: 'DPT',         description: 'Diphtheria, Pertussis, Tetanus' },
  { name: 'Hepatitis B', description: 'Hepatitis B vaccine' },
  { name: 'Measles Vaccine',     description: 'Measles vaccine' },
  { name: 'Yellow Fever Vaccine',description: 'Yellow Fever vaccine' },
  { name: 'Meningitis Vaccine',  description: 'Meningitis vaccine' },
]

/* ── Shared input style (matches ChildRegistration) ── */
const inputBase = (hasIcon = true, hasError = false) => ({

  width: '100%',
  padding: hasIcon ? '13px 14px 13px 40px' : '13px 16px',
  borderRadius: 12,
  border: `1.5px solid ${hasError ? '#fca5a5' : 'var(--card-border)'}`,
  backgroundColor: 'var(--card-bg)',
  color: 'var(--text-primary)',
  fontSize: 14,
  fontWeight: 500,
  outline: 'none',
  boxSizing: 'border-box',
  transition: 'border-color 0.15s, box-shadow 0.15s',
  boxShadow: hasError ? '0 0 0 3px rgba(220,38,38,0.08)' : 'none',
})

/* ── Field wrapper (matches ChildRegistration) ── */
function Field({ label, icon: Icon = null, error = null, children }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <label style={{
        fontSize: 11, fontWeight: 700, textTransform: 'uppercase',
        letterSpacing: '0.09em', color: 'var(--text-secondary)',
        fontFamily: 'Sora, sans-serif',
      }}>
        {label}
      </label>
      <div style={{ position: 'relative' }}>
        {Icon && (
          <div style={{
            position: 'absolute', left: 14, top: '50%',
            transform: 'translateY(-50%)', pointerEvents: 'none',
            color: 'var(--text-muted)', display: 'flex', alignItems: 'center',
          }}>
            <Icon size={15} />
          </div>
        )}
        {children}
      </div>
      {error && (
        <p style={{
          fontSize: 11, color: '#dc2626', fontWeight: 500,
          margin: '2px 0 0 0', display: 'flex', alignItems: 'center', gap: 5,
        }}>
          <AlertCircle size={11} /> {error}
        </p>
      )}
    </div>
  )
}

/* ── Section card (matches ChildRegistration) ── */
function SectionCard({ icon: Icon, title, children }) {
  return (
    <div style={{
      borderRadius: 20, overflow: 'hidden',
      backgroundColor: 'var(--card-bg)',
      border: '1.5px solid var(--card-border)',
      boxShadow: '0 2px 16px color-mix(in srgb, var(--primary-shadow) 34%, transparent)',
    }}>
      <div style={{
        display: 'flex', alignItems: 'center', gap: 10,
        padding: '16px 22px',
        backgroundColor: 'var(--pg-bg)',
        borderBottom: '1.5px solid var(--card-border)',
      }}>
        <div style={{
          width: 30, height: 30, borderRadius: 9,
          backgroundColor: 'var(--accent-light)', border: '1px solid var(--accent-border)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <Icon size={15} style={{ color: 'var(--primary)' }} />
        </div>
        <span style={{
          fontSize: 11, fontWeight: 700, textTransform: 'uppercase',
          letterSpacing: '0.1em', color: 'var(--text-primary)',
          fontFamily: 'Sora, sans-serif',
        }}>
          {title}
        </span>
      </div>
      <div style={{ padding: '22px', display: 'flex', flexDirection: 'column', gap: 20 }}>
        {children}
      </div>
    </div>
  )
}

/* ── Read-only detail row ── */
function DetailRow({ label, value, accent = false }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      <span style={{
        fontSize: 10, fontWeight: 700, textTransform: 'uppercase',
        letterSpacing: '0.09em', color: 'rgba(255,255,255,0.45)',
        fontFamily: 'Sora, sans-serif',
      }}>
        {label}
      </span>
      <span style={{
        fontSize: 14, fontWeight: accent ? 700 : 500,
        color: accent ? '#86efac' : 'rgba(255,255,255,0.85)',
        fontFamily: accent ? 'Sora, sans-serif' : 'inherit',
      }}>
        {value}
      </span>
    </div>
  )
}

/* ── Main page ── */
export default function ConfirmAdministration() {
  const location = useLocation()
  const navigate = useNavigate()
  const { isOffline } = useNetworkStatus()
  const { user } = useAuth()

  const initialVaccine = location.state?.vaccine
  const child   = location.state?.child   ?? { name: 'Amina Bello', id: 'IT-2024-8831', clinic: 'Zaria Central Clinic', localId: null }

  const today = new Date().toISOString().split('T')[0]
  const [selectedVaccineName, setSelectedVaccineName] = useState(initialVaccine?.name ?? AVAILABLE_VACCINES[0].name)
  const selectedVaccine = AVAILABLE_VACCINES.find((v) => v.name === selectedVaccineName) ?? AVAILABLE_VACCINES[0]
  const [adminSite,   setAdminSite]   = useState('Right Arm (Deltoid)')
  const [batchNumber, setBatchNumber] = useState('')
  const [dateGiven,   setDateGiven]   = useState(today)
  const [loading,     setLoading]     = useState(false)
  const [saved,       setSaved]       = useState(false)
  const [error,       setError]       = useState(null)

  const initials = child.name.split(' ').map((n) => n[0]).join('')

  const focusStyle = (e) => {
    e.currentTarget.style.borderColor = '#86efac'
    e.currentTarget.style.boxShadow   = '0 0 0 3px color-mix(in srgb, var(--accent) 35%, transparent)'
  }
  const blurStyle = (hasError) => (e) => {
    e.currentTarget.style.borderColor = hasError ? '#fca5a5' : 'var(--card-border)'
    e.currentTarget.style.boxShadow   = 'none'
  }

  const handleConfirm = async () => {
    if (!batchNumber.trim()) {
      setError('Batch number is required to confirm administration.')
      return
    }

    setLoading(true)
    setError(null)

    try {
      await saveVaccinationRecord({
        child,
        vaccine: selectedVaccine,
        adminSite,
        batchNumber,
        dateGiven,
        doseNumber: 1,
        doctorId: user?.id ?? null,
        administeredBy: user?.name ?? 'Clinic staff',
      })

      // Try to sync if online
      if (isOffline === false) {
        try {
          await syncPendingRecords()
        } catch (syncError) {
          console.warn('Auto-sync failed, will sync later:', syncError)
        }
      }

      setSaved(true)
      setTimeout(() => navigate('/tracker'), 1800)
    } catch (err) {
      setError('Failed to save. Please try again.')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  /* Success screen */
  if (saved) {
    return (
      <div className="app-page" style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', backgroundColor: 'var(--pg-bg)' }}>
        <Header
          title="Administration"
          subtitle="The record has been stored safely and will return you to the tracker shortly."
          eyebrow="Dose saved"
          showBack
        />
        <div style={{
          flex: 1, display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
          padding: '40px 32px', gap: 24,
        }}>
          <div style={{
            width: 84, height: 84, borderRadius: '50%',
            backgroundColor: 'var(--accent-light)', border: '2px solid var(--accent-border)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 10px 30px rgba(21,128,61,0.22)',
          }}>
            <CheckCircle2 size={42} style={{ color: 'var(--primary)' }} />
          </div>
          <div style={{ textAlign: 'center' }}>
            <h2 style={{
              fontFamily: 'Sora, sans-serif', fontWeight: 800,
              fontSize: 22, color: '#111827', margin: 0,
            }}>
              Dose Recorded
            </h2>
            <p style={{ fontSize: 14, color: '#6b7280', margin: '8px 0 0 0', lineHeight: 1.6 }}>
              {selectedVaccine.name} for {child.name} saved locally.
              <br />
              {isOffline ? 'Will sync when back online.' : 'Syncing now…'}
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="app-page" style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', backgroundColor: 'var(--pg-bg)' }}>
      <Header showBack />
    

      <main className="app-main" style={{
        flex: 1,
        width: '100%',
        padding: '28px 24px 100px',
        display: 'flex',
        flexDirection: 'column',
        gap: 20,
        boxSizing: 'border-box',
      }}>
          <OfflineBanner />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>

        {/* ── Patient + vaccine banner ── */}
        <div style={{
          borderRadius: 20,
          background: 'var(--banner-gradient)',
          boxShadow: '0 10px 32px var(--primary-shadow)',
          overflow: 'hidden',
          position: 'relative',
        }}>
          {/* Decorative circles */}
          <div style={{
            position: 'absolute', top: -20, right: -20, width: 120, height: 120,
            borderRadius: '50%', backgroundColor: 'rgba(255,255,255,0.05)',
          }} />
          <div style={{
            position: 'absolute', bottom: -20, right: 40, width: 80, height: 80,
            borderRadius: '50%', backgroundColor: 'rgba(255,255,255,0.04)',
          }} />

          {/* Patient row */}
          <div style={{
            position: 'relative',
            display: 'flex', alignItems: 'center', gap: 16,
            padding: '24px 24px 20px',
          }}>
            <div style={{
              width: 52, height: 52, borderRadius: 16, flexShrink: 0,
              backgroundColor: 'rgba(255,255,255,0.15)',
              border: '1px solid rgba(255,255,255,0.12)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontFamily: 'Sora, sans-serif', fontWeight: 800,
              fontSize: 18, color: '#ffffff',
            }}>
              {initials}
            </div>
            <div style={{ flex: 1 }}>
              <p style={{
                fontSize: 10, fontWeight: 600, textTransform: 'uppercase',
                letterSpacing: '0.1em', color: 'rgba(255,255,255,0.45)',
                fontFamily: 'Sora, sans-serif', margin: '0 0 4px 0',
              }}>
                Patient
              </p>
              <h2 style={{
                fontFamily: 'Sora, sans-serif', fontWeight: 800,
                fontSize: 18, color: '#ffffff', margin: 0, lineHeight: 1.2,
              }}>
                {child.name}
              </h2>
              <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', margin: '3px 0 0 0' }}>
                {child.id}
              </p>
            </div>
          </div>

          {/* Vaccine detail row */}
          <div style={{
            position: 'relative',
            display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
            gap: 20, padding: '20px 24px 24px',
            borderTop: '1px solid rgba(255,255,255,0.1)',
          }}>
            <DetailRow label="Vaccine"     value={selectedVaccine.name}                 accent />
            <DetailRow label="Dose"        value="Dose 1"                       accent />
            <DetailRow label="Description" value={selectedVaccine.description} />
            <DetailRow label="Scheduled"   value={dateGiven || 'Today'} />
          </div>
        </div>

        {/* ── Offline notice ── */}
        {isOffline && (
          <div style={{
            display: 'flex', alignItems: 'center', gap: 12,
            padding: '16px 18px', borderRadius: 16,
            backgroundColor: '#fffbeb',
            border: '1.5px solid #fde68a',
            boxShadow: '0 2px 10px rgba(217,119,6,0.08)',
          }}>
            <div style={{
              width: 36, height: 36, borderRadius: 10,
              backgroundColor: '#fef3c7', border: '1px solid #fde68a',
              display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
            }}>
              <Shield size={16} style={{ color: '#d97706' }} />
            </div>
            <div>
              <p style={{
                fontFamily: 'Sora, sans-serif', fontWeight: 700,
                fontSize: 13, color: '#92400e', margin: 0,
              }}>
                Offline Mode
              </p>
              <p style={{ fontSize: 12, color: '#b45309', margin: '2px 0 0 0' }}>
                Saved locally and will sync automatically when back online.
              </p>
            </div>
          </div>
        )}

        {/* ── Administration details form ── */}
        <SectionCard icon={Syringe} title="Administration Details">

          <Field label="Vaccine" icon={Syringe}>
            <div style={{ position: 'relative' }}>
              <Syringe size={15} style={{
                position: 'absolute', left: 14, top: '50%',
                transform: 'translateY(-50%)', pointerEvents: 'none', color: '#9ca3af',
              }} />
              <select
                value={selectedVaccineName}
                onChange={(e) => setSelectedVaccineName(e.target.value)}
                style={{
                  ...inputBase(true),
                  appearance: 'none',
                  cursor: 'pointer',
                  paddingRight: 40,
                }}
                onFocus={focusStyle}
                onBlur={blurStyle(false)}
              >
                {AVAILABLE_VACCINES.map((option) => (
                  <option key={option.name} value={option.name}>{option.name}</option>
                ))}
              </select>
              <ChevronDown size={15} style={{
                position: 'absolute', right: 14, top: '50%',
                transform: 'translateY(-50%)', pointerEvents: 'none', color: '#9ca3af',
              }} />
            </div>
          </Field>

          <Field label="Site of Administration" icon={MapPin}>
            <div style={{ position: 'relative' }}>
              <MapPin size={15} style={{
                position: 'absolute', left: 14, top: '50%',
                transform: 'translateY(-50%)', pointerEvents: 'none', color: '#9ca3af',
              }} />
              <select
                value={adminSite}
                onChange={(e) => setAdminSite(e.target.value)}
                style={{
                  ...inputBase(true),
                  appearance: 'none',
                  cursor: 'pointer',
                  paddingRight: 40,
                }}
                onFocus={focusStyle}
                onBlur={blurStyle(false)}
              >
                {ADMIN_SITES.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
              <ChevronDown size={15} style={{
                position: 'absolute', right: 14, top: '50%',
                transform: 'translateY(-50%)', pointerEvents: 'none', color: '#9ca3af',
              }} />
            </div>
          </Field>

          <Field label="Batch Number" error={error}>
            <Hash size={15} style={{
              position: 'absolute', left: 14, top: '50%',
              transform: 'translateY(-50%)', pointerEvents: 'none', color: '#9ca3af',
            }} />
            <input
              type="text"
              placeholder="e.g., BCH-9921"
              value={batchNumber}
              onChange={(e) => { setBatchNumber(e.target.value); setError(null) }}
              style={inputBase(true, !!error)}
              onFocus={focusStyle}
              onBlur={blurStyle(!!error)}
            />
          </Field>

          <Field label="Date Administered" icon={Calendar}>
            <Calendar size={15} style={{
              position: 'absolute', left: 14, top: '50%',
              transform: 'translateY(-50%)', pointerEvents: 'none', color: '#9ca3af',
            }} />
            <input
              type="date"
              value={dateGiven}
              onChange={(e) => setDateGiven(e.target.value)}
              style={inputBase(true)}
              onFocus={focusStyle}
              onBlur={blurStyle(false)}
            />
          </Field>

        </SectionCard>

        {/* ── Action buttons ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 4 }}>
          <button
            onClick={handleConfirm}
            disabled={loading}
            onMouseEnter={e => { if (!loading) { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 10px 28px rgba(21,128,61,0.42)' } }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = loading ? 'none' : '0 6px 22px rgba(21,128,61,0.35)' }}
            style={{
              width: '100%',
              padding: '18px 0',
              borderRadius: 16,
              border: 'none',
              cursor: loading ? 'not-allowed' : 'pointer',
              fontFamily: 'Sora, sans-serif',
              fontWeight: 800,
              fontSize: 15,
              letterSpacing: '0.04em',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 10,
              backgroundColor: loading ? '#d1d5db' : 'var(--primary)',
              color: loading ? '#9ca3af' : '#ffffff',
              boxShadow: loading ? 'none' : '0 6px 22px rgba(21,128,61,0.35)',
              transition: 'all 0.18s ease',
              boxSizing: 'border-box',
            }}
          >
            {loading ? (
              <>
                <div style={{
                  width: 18, height: 18,
                  border: '2.5px solid rgba(255,255,255,0.35)',
                  borderTopColor: '#ffffff',
                  borderRadius: '50%',
                  animation: 'spin 0.75s linear infinite',
                }} />
                Saving Record…
              </>
            ) : (
              <>
                <CheckCircle2 size={18} />
                Confirm & Save Dose
              </>
            )}
          </button>

          <button
            onClick={() => navigate(-1)}
            onMouseEnter={e => { e.currentTarget.style.backgroundColor = '#f3f4f6' }}
            onMouseLeave={e => { e.currentTarget.style.backgroundColor = '#ffffff' }}
            style={{
              width: '100%',
              padding: '15px 0',
              borderRadius: 16,
              border: '1.5px solid #e5e7eb',
              cursor: 'pointer',
              fontFamily: 'Sora, sans-serif',
              fontWeight: 700,
              fontSize: 14,
              color: '#6b7280',
              backgroundColor: '#ffffff',
              transition: 'all 0.18s ease',
              boxSizing: 'border-box',
            }}
          >
            Cancel
          </button>
        </div>

      </main>
    </div>
  )
}
