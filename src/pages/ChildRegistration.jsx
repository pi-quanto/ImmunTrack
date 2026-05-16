import { useState } from 'react'
import {
  CheckCircle2, Copy, Printer, X, ChevronDown,
  User, Phone, MapPin, Calendar, Baby,
} from 'lucide-react'
import Header from '../components/Header'
import OfflineBanner from '../components/OfflineBanner'
import { useAuth } from '../AuthProvider/AuthContext'
import { generateHealthId } from '../db/database'
import { saveChildRegistration } from '../db/syncService'

const VILLAGES = [
  'Kano Ward', 'Zaria Central', 'Daura North', 'Kaduna South',
  'Jos Plateau', 'Sokoto East', 'Maiduguri Central', 'Bauchi West',
]

/* ── Sex Toggle ────────────────────────────────────── */
function SexToggle({ value, onChange }) {
  return (
    <div style={{
      display: 'flex', borderRadius: 14, padding: 4, gap: 4,
      backgroundColor: 'var(--pg-bg)', border: '1.5px solid var(--accent-border)',
    }}>
      {['Male', 'Female'].map((sex) => (
        <button
          key={sex}
          type="button"
          onClick={() => onChange(sex)}
          style={{
            flex: 1, padding: '11px 0', borderRadius: 10,
            fontSize: 13, fontWeight: 700, border: 'none', cursor: 'pointer',
            fontFamily: 'Sora, sans-serif',
            transition: 'all 0.18s ease',
            backgroundColor: value === sex ? 'var(--primary)' : 'transparent',
            color: value === sex ? '#000000' : 'var(--text-secondary)',
            boxShadow: value === sex ? '0 3px 10px rgba(21,128,61,0.28)' : 'none',
          }}
        >
          {sex}
        </button>
      ))}
    </div>
  )
}

/* ── Reusable Field ────────────────────────────────── */
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
        <p style={{ fontSize: 11, color: '#dc2626', fontWeight: 500, margin: '2px 0 0 0' }}>
          {error}
        </p>
      )}
    </div>
  )
}

/* ── Input base style helper ───────────────────────── */
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

/* ── Section Card ──────────────────────────────────── */
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

/* ── Success Modal ─────────────────────────────────── */
function SuccessModal({ healthId, onClose }) {
  const [copied, setCopied] = useState(false)

  const handleCopy = () => {
    navigator.clipboard.writeText(healthId)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 100,
      display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
      padding: '0 16px 28px',
      backgroundColor: 'rgba(0,0,0,0.55)',
      backdropFilter: 'blur(6px)',
    }}>
      <style>{`
        @keyframes slideUp {
          from { transform: translateY(40px); opacity: 0; }
          to   { transform: translateY(0);    opacity: 1; }
        }
      `}</style>

      <div style={{
        width: '100%', maxWidth: 480, borderRadius: 24,
        backgroundColor: '#ffffff',
        boxShadow: '0 24px 60px rgba(0,0,0,0.22)',
        padding: '32px 28px 28px',
        position: 'relative',
        animation: 'slideUp 0.3s ease',
      }}>
        {/* Close */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute', top: 16, right: 16,
            width: 34, height: 34, borderRadius: 10,
            backgroundColor: '#f3f4f6', border: 'none',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', color: '#6b7280',
          }}
        >
          <X size={15} />
        </button>

        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: 22 }}>

          {/* Success icon */}
          <div style={{
            width: 72, height: 72, borderRadius: '50%',
            backgroundColor: 'var(--accent-light)', border: '2px solid var(--accent-border)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 8px 24px rgba(21,128,61,0.20)',
          }}>
            <CheckCircle2 size={36} style={{ color: 'var(--primary)' }} />
          </div>

          <div>
            <h2 style={{
              fontFamily: 'Sora, sans-serif', fontWeight: 800,
              fontSize: 21, color: '#111827', margin: 0,
            }}>
              Registration Successful
            </h2>
            <p style={{ fontSize: 13, color: '#6b7280', margin: '7px 0 0 0', lineHeight: 1.55 }}>
              Child record saved. Ready for next scheduled dose.
            </p>
          </div>

          {/* Health ID card */}
          <div style={{
            width: '100%', borderRadius: 16, padding: '20px 22px',
            backgroundColor: 'var(--pg-bg)',
            border: '2px dashed #86efac',
          }}>
            <p style={{
              fontSize: 10, fontWeight: 700, textTransform: 'uppercase',
              letterSpacing: '0.1em', color: 'var(--primary)', margin: '0 0 7px 0',
            }}>
              Assigned Health ID
            </p>
            <p style={{
              fontFamily: 'Sora, sans-serif', fontWeight: 800,
              fontSize: 30, letterSpacing: '0.12em', color: 'var(--primary-dark)',
              margin: 0,
            }}>
              {healthId}
            </p>
          </div>

          {/* Action buttons */}
          <div style={{ display: 'flex', gap: 10, width: '100%' }}>
            <button
              onClick={handleCopy}
              style={{
                flex: 1, padding: '14px 0', borderRadius: 14,
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                fontSize: 13, fontWeight: 700, cursor: 'pointer',
                fontFamily: 'Sora, sans-serif',
                backgroundColor: copied ? 'var(--accent-light)' : '#f9fafb',
                color: copied ? 'var(--primary)' : '#374151',
                border: `1.5px solid ${copied ? '#86efac' : '#e5e7eb'}`,
                transition: 'all 0.18s',
              }}
            >
              <Copy size={14} />
              {copied ? 'Copied!' : 'Copy ID'}
            </button>

            <button
              onClick={onClose}
              style={{
                flex: 1, padding: '14px 0', borderRadius: 14,
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                fontSize: 13, fontWeight: 700, cursor: 'pointer',
                fontFamily: 'Sora, sans-serif',
                backgroundColor: 'var(--primary)',
                color: '#ffffff',
                border: 'none',
                boxShadow: '0 4px 16px rgba(21,128,61,0.32)',
              }}
            >
              <Printer size={14} />
              Print Card
            </button>
          </div>

          <button
            onClick={onClose}
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              fontSize: 13, color: '#9ca3af', fontWeight: 500, padding: 0,
            }}
          >
            Done — register another child
          </button>
        </div>
      </div>
    </div>
  )
}

/* ── Duplicate Modal ───────────────────────────────── */
function DuplicateModal({ match, onCancel, onConfirm }) {
  const getMatchMessage = () => {
    switch (match.matchType) {
      case 'healthId':
        return `A child with Health ID ${match.healthId} is already registered.`
      case 'identity':
        return `A child named "${match.fullName}" with the same date of birth is already in the system.`
      case 'contact':
        return `A similar name and phone number match an existing record for "${match.fullName}".`
      default:
        return 'A similar record already exists for this child.'
    }
  }

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 100,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '24px',
      backgroundColor: 'rgba(0,0,0,0.55)',
      backdropFilter: 'blur(6px)',
    }}>
      <div style={{
        width: '100%', maxWidth: 440, borderRadius: 24,
        backgroundColor: '#ffffff',
        boxShadow: '0 24px 60px rgba(0,0,0,0.22)',
        padding: '32px 28px 28px',
        textAlign: 'center',
      }}>
        <div style={{
          width: 64, height: 64, borderRadius: '50%',
          backgroundColor: '#fef2f2', border: '2px solid #fee2e2',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          margin: '0 auto 20px',
        }}>
          <Baby size={32} style={{ color: '#ef4444' }} />
        </div>

        <h2 style={{
          fontFamily: 'Sora, sans-serif', fontWeight: 800,
          fontSize: 20, color: '#111827', margin: '0 0 10px 0',
        }}>
          Possible Duplicate Found
        </h2>

        <p style={{ fontSize: 14, color: '#6b7280', lineHeight: 1.6, margin: '0 0 24px 0' }}>
          {getMatchMessage()} <br />
          Please verify if this is the same child before creating a new record.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <button
            onClick={onCancel}
            style={{
              padding: '14px 0', borderRadius: 14,
              fontSize: 14, fontWeight: 700, cursor: 'pointer',
              fontFamily: 'Sora, sans-serif',
              backgroundColor: '#f9fafb', color: '#374151',
              border: '1.5px solid #e5e7eb',
            }}
          >
            Cancel and Review
          </button>
          <button
            onClick={onConfirm}
            style={{
              padding: '14px 0', borderRadius: 14,
              fontSize: 14, fontWeight: 700, cursor: 'pointer',
              fontFamily: 'Sora, sans-serif',
              backgroundColor: '#ef4444', color: '#ffffff',
              border: 'none',
              boxShadow: '0 4px 12px rgba(239,68,68,0.25)',
            }}
          >
            I've checked, it's a different child
          </button>
        </div>
      </div>
    </div>
  )
}

/* ── Main Page ─────────────────────────────────────── */
export default function ChildRegistration() {
  const { user } = useAuth()
  const [form, setForm] = useState({
    fullName: '', dob: '', sex: 'Male',
    guardianName: '', phone: '', village: '',
  })
  const [loading,        setLoading]        = useState(false)
  const [successModal,   setSuccessModal]   = useState(null)
  const [duplicateModal, setDuplicateModal] = useState(null)
  const [errors,         setErrors]         = useState({})

  const update = (field) => (e) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }))
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: null }))
  }

  const validate = () => {
    const e = {}
    if (!form.fullName.trim())     e.fullName     = 'Full name is required'
    if (!form.dob)                 e.dob          = 'Date of birth is required'
    if (!form.guardianName.trim()) e.guardianName = 'Guardian name is required'
    if (!form.phone.trim())        e.phone        = 'Phone number is required'
    if (!form.village)             e.village      = 'Please select a village'
    return e
  }

  const handleSubmit = async (e, forceSave = false) => {
    if (e) e.preventDefault()
    const validationErrors = validate()
    if (Object.keys(validationErrors).length > 0) { setErrors(validationErrors); return }

    setLoading(true)
    try {
      // If we are forcing save, we don't want to show the duplicate modal again
      // We pass a special flag in context or simply bypass the check in the service
      // For now, our saveChildRegistration always checks. 
      // We'll update the service slightly to allow a 'force' flag if needed, 
      // but usually for health records, you'd rather they edit the existing one.
      
      const healthId = generateHealthId()
      const result = await saveChildRegistration(form, {
        healthId,
        clinic: user?.clinic ?? null,
        doctorId: user?.id ?? null,
        bypassDuplicateCheck: forceSave, // Optional: if we want to allow forced saves
      })

      if (result.isDuplicate && !forceSave) {
        setDuplicateModal(result)
        setLoading(false)
        return
      }

      setSuccessModal({ healthId: result.healthId })
      setForm({ fullName: '', dob: '', sex: 'Male', guardianName: '', phone: '', village: '' })
      setDuplicateModal(null)
    } catch (err) {
      console.error('Save failed:', err)
    } finally {
      setLoading(false)
    }
  }

  const focusStyle = (e) => {
    e.currentTarget.style.borderColor = '#86efac'
    e.currentTarget.style.boxShadow   = '0 0 0 3px color-mix(in srgb, var(--accent) 35%, transparent)'
  }
  const blurStyle = (field) => (e) => {
    e.currentTarget.style.borderColor = errors[field] ? '#fca5a5' : 'var(--card-border)'
    e.currentTarget.style.boxShadow   = 'none'
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
        gap: 8,
        boxSizing: 'border-box',
      }}>
  <OfflineBanner />
        {/* Page intro */}
        <div style={{ marginBottom: 24 }}>
          <h1 style={{
            fontFamily: 'Sora, sans-serif', fontWeight: 800,
            fontSize: 24, color: '#111827', margin: 0,
          }}>
            Register New Child
          </h1>
          <p style={{ fontSize: 13, color: '#6b7280', margin: '8px 0 0 0', lineHeight: 1.65 }}>
            Ensure all health record details are accurate before saving.
            Records are stored locally until synced.
          </p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

          {/* ── Child Information ── */}
          <SectionCard icon={Baby} title="Child Information">

            <Field label="Full Name" icon={User} error={errors.fullName}>
              <input
                type="text"
                placeholder="e.g., Amina Bello"
                value={form.fullName}
                onChange={update('fullName')}
                style={inputBase(true, !!errors.fullName)}
                onFocus={focusStyle}
                onBlur={blurStyle('fullName')}
              />
            </Field>

            <Field label="Date of Birth" icon={Calendar} error={errors.dob}>
              <input
                type="date"
                value={form.dob}
                onChange={update('dob')}
                style={inputBase(true, !!errors.dob)}
                onFocus={focusStyle}
                onBlur={blurStyle('dob')}
              />
            </Field>

            <Field label="Sex">
              <SexToggle value={form.sex} onChange={(v) => setForm((p) => ({ ...p, sex: v }))} />
            </Field>

          </SectionCard>

          {/* ── Guardian & Contact ── */}
          <SectionCard icon={User} title="Guardian & Contact">

            <Field label="Guardian Name" icon={User} error={errors.guardianName}>
              <input
                type="text"
                placeholder="Parent or guardian full name"
                value={form.guardianName}
                onChange={update('guardianName')}
                style={inputBase(true, !!errors.guardianName)}
                onFocus={focusStyle}
                onBlur={blurStyle('guardianName')}
              />
            </Field>

            <Field label="Phone Number" icon={Phone} error={errors.phone}>
              <div style={{ display: 'flex', gap: 10 }}>
                <div style={{
                  ...inputBase(false),
                  width: 96, flexShrink: 0,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 13, color: '#374151', fontWeight: 600,
                  backgroundColor: '#f9fafb',
                }}>
                  🇳🇬 +234
                </div>
                <input
                  type="tel"
                  placeholder="8012345678"
                  value={form.phone}
                  onChange={update('phone')}
                  style={{ ...inputBase(false, !!errors.phone), flex: 1 }}
                  onFocus={focusStyle}
                  onBlur={blurStyle('phone')}
                />
              </div>
            </Field>

            <Field label="Village / Ward" icon={MapPin} error={errors.village}>
              <div style={{ position: 'relative' }}>
                <select
                  value={form.village}
                  onChange={update('village')}
                  style={{
                    ...inputBase(true, !!errors.village),
                    appearance: 'none',
                    cursor: 'pointer',
                    paddingRight: 40,
                  }}
                  onFocus={focusStyle}
                  onBlur={blurStyle('village')}
                >
                  <option value="">Select ward or village</option>
                  {VILLAGES.map((v) => <option key={v} value={v}>{v}</option>)}
                </select>
                <ChevronDown
                  size={15}
                  style={{
                    position: 'absolute', right: 14, top: '50%',
                    transform: 'translateY(-50%)', pointerEvents: 'none',
                    color: '#9ca3af',
                  }}
                />
              </div>
            </Field>

          </SectionCard>

          {/* ── Submit ── */}
          <style>{`
            @keyframes spin { to { transform: rotate(360deg); } }
          `}</style>

          <button
            type="submit"
            disabled={loading}
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
              marginTop: 6,
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
              'Register Child'
            )}
          </button>

        </form>
      </main>

      {successModal && (
        <SuccessModal
          healthId={successModal.healthId}
          onClose={() => setSuccessModal(null)}
        />
      )}

      {duplicateModal && (
        <DuplicateModal
          match={duplicateModal}
          onCancel={() => setDuplicateModal(null)}
          onConfirm={() => handleSubmit(null, true)}
        />
      )}
    </div>
  )
}
