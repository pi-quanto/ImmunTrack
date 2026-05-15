import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Shield, Mail, Lock, Eye, EyeOff, User,
  AlertCircle, ArrowRight, Building2, ChevronDown,
} from 'lucide-react'
import { useAuth } from '../AuthProvider/AuthContext'

const ROLES = [
  'Vaccination Officer',
  'Nurse',
  'Doctor',
  'Clinic Administrator',
  'Health Record Officer',
]

const inputBase = (hasError = false, hasIcon = true) => ({
  width: '100%',
  padding: hasIcon ? '13px 14px 13px 42px' : '13px 16px',
  borderRadius: 12,
  border: `1.5px solid ${hasError ? '#fca5a5' : '#e5e7eb'}`,
  backgroundColor: '#ffffff',
  color: '#111827',
  fontSize: 14,
  fontWeight: 500,
  outline: 'none',
  boxSizing: 'border-box',
  transition: 'border-color 0.15s, box-shadow 0.15s',
  boxShadow: hasError ? '0 0 0 3px rgba(220,38,38,0.08)' : 'none',
})

function Field({ label, icon: Icon = null, error, children }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <label style={{
        fontSize: 11,
        fontWeight: 700,
        textTransform: 'uppercase',
        letterSpacing: '0.09em',
        color: '#6b7280',
        fontFamily: 'Sora, sans-serif',
      }}>
        {label}
      </label>
      <div style={{ position: 'relative' }}>
        {Icon && (
          <div style={{
            position: 'absolute',
            left: 14,
            top: '50%',
            transform: 'translateY(-50%)',
            pointerEvents: 'none',
            color: '#9ca3af',
            display: 'flex',
            alignItems: 'center',
          }}>
            <Icon size={15} />
          </div>
        )}
        {children}
      </div>
      {error && (
        <p style={{
          fontSize: 11,
          color: '#dc2626',
          fontWeight: 500,
          margin: '2px 0 0 0',
          display: 'flex',
          alignItems: 'center',
          gap: 5,
        }}>
          <AlertCircle size={11} /> {error}
        </p>
      )}
    </div>
  )
}

function SectionCard({ title, children }) {
  return (
    <div style={{
      borderRadius: 18,
      overflow: 'hidden',
      backgroundColor: '#ffffff',
      border: '1.5px solid #e9fbe9',
      boxShadow: '0 2px 12px color-mix(in srgb, var(--primary-shadow) 30%, transparent)',
    }}>
      <div style={{
        padding: '13px 20px',
        backgroundColor: 'var(--pg-bg)',
        borderBottom: '1.5px solid #e9fbe9',
      }}>
        <span style={{
          fontSize: 11,
          fontWeight: 700,
          textTransform: 'uppercase',
          letterSpacing: '0.1em',
          color: '#374151',
          fontFamily: 'Sora, sans-serif',
        }}>
          {title}
        </span>
      </div>
      <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: 18 }}>
        {children}
      </div>
    </div>
  )
}

export default function SignUp() {
  const navigate = useNavigate()
  const { register, authLoading, authError, clearError } = useAuth()

  const [form, setForm] = useState({
    name: '',
    email: '',
    clinic: '',
    role: 'Vaccination Officer',
    password: '',
    confirm: '',
  })
  const [showPass, setShowPass] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [fieldErrors, setFieldErrors] = useState({})

  const set = (key) => (e) => {
    setForm((prev) => ({ ...prev, [key]: e.target.value }))
    setFieldErrors((prev) => ({ ...prev, [key]: null }))
    clearError()
  }

  const focusStyle = (e) => {
    e.currentTarget.style.borderColor = '#86efac'
    e.currentTarget.style.boxShadow = '0 0 0 3px color-mix(in srgb, var(--accent) 35%, transparent)'
  }

  const blurStyle = (hasError) => (e) => {
    e.currentTarget.style.borderColor = hasError ? '#fca5a5' : '#e5e7eb'
    e.currentTarget.style.boxShadow = 'none'
  }

  const validate = () => {
    const errs = {}
    if (!form.name.trim()) errs.name = 'Full name is required.'
    if (!form.email.trim()) errs.email = 'Email is required.'
    if (!form.clinic.trim()) errs.clinic = 'Clinic name is required.'
    if (form.password.length < 8) errs.password = 'Password must be at least 8 characters.'
    if (form.password !== form.confirm) errs.confirm = 'Passwords do not match.'
    setFieldErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    clearError()
    if (!validate()) return
    const ok = await register({
      name: form.name.trim(),
      email: form.email.trim(),
      clinic: form.clinic.trim(),
      role: form.role,
      password: form.password,
    })
    if (ok) navigate('/')
  }

  return (
    <div className="auth-page auth-page--signup">
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>

     <div
            className="auth-hero"
            style={{ background: 'var(--banner-gradient)' }}
          >
            <div style={{
              position: 'absolute',
              top: -30,
              right: -30,
              width: 180,
              height: 180,
              borderRadius: '50%',
              backgroundColor: 'rgba(255,255,255,0.05)',
            }} />
            <div style={{
              position: 'absolute',
              bottom: -40,
              right: 50,
              width: 120,
              height: 120,
              borderRadius: '50%',
              backgroundColor: 'rgba(255,255,255,0.04)',
            }} />
            <div style={{
              position: 'absolute',
              top: '40%',
              right: '18%',
              width: 60,
              height: 60,
              borderRadius: '50%',
              backgroundColor: 'rgba(255,255,255,0.03)',
            }} />
    
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: 14, marginBottom: 14 }}>
              <div style={{
                width: 52,
                height: 52,
                borderRadius: 16,
                backgroundColor: 'rgba(255,255,255,0.14)',
                border: '1px solid rgba(255,255,255,0.12)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                <Shield size={26} style={{ color: '#86efac' }} />
              </div>
              <div>
                <p style={{
                  fontFamily: 'Sora, sans-serif',
                  fontWeight: 800,
                  fontSize: 22,
                  color: '#ffffff',
                  margin: 0,
                  lineHeight: 1,
                }}>
                  Vax-chain
                </p>
                <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', margin: '4px 0 0 0' }}>
                  Vaccination Management System
                </p>
              </div>
              
            </div >
              <div className='authimg'>  <img style={{borderRadius:"10%"}} src="https://media.istockphoto.com/id/1737003408/photo/shot-of-a-pregnant-woman-having-a-consultation-with-a-doctor.webp?a=1&b=1&s=612x612&w=0&k=20&c=qdDPHbHiRfjaP6THRZg1q6cmF6B1j5BEMLG8rhw5JUA=" alt="" /></div>
          </div>
      <div className="auth-content">
        <div className="auth-card auth-card--soft">
          <div className="auth-card__desktop-header">
            <span className="auth-card__desktop-kicker">Create Account</span>
            <p className="auth-card__desktop-note">Everything needed to get your clinic started is collected below.</p>
          </div>
          {authError && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              padding: '14px 16px',
              borderRadius: 14,
              marginBottom: 20,
              backgroundColor: '#fef2f2',
              border: '1.5px solid #fecaca',
            }}>
              <div style={{
                width: 32,
                height: 32,
                borderRadius: 9,
                flexShrink: 0,
                backgroundColor: '#fee2e2',
                border: '1px solid #fca5a5',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                <AlertCircle size={15} style={{ color: '#dc2626' }} />
              </div>
              <p style={{ fontSize: 13, color: '#dc2626', fontWeight: 500, margin: 0 }}>
                {authError}
              </p>
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <SectionCard title="Personal Details">
              <Field label="Full Name" icon={User} error={fieldErrors.name}>
                <input
                  type="text"
                  placeholder="Dr. Aisha Musa"
                  value={form.name}
                  onChange={set('name')}
                  style={inputBase(!!fieldErrors.name)}
                  onFocus={focusStyle}
                  onBlur={blurStyle(!!fieldErrors.name)}
                  autoComplete="name"
                />
              </Field>

              <Field label="Email Address" icon={Mail} error={fieldErrors.email}>
                <input
                  type="email"
                  placeholder="you@clinic.ng"
                  value={form.email}
                  onChange={set('email')}
                  style={inputBase(!!fieldErrors.email)}
                  onFocus={focusStyle}
                  onBlur={blurStyle(!!fieldErrors.email)}
                  autoComplete="email"
                />
              </Field>
            </SectionCard>

            <SectionCard title="Clinic & Role">
              <Field label="Clinic Name" icon={Building2} error={fieldErrors.clinic}>
                <input
                  type="text"
                  placeholder="Zaria Central Clinic"
                  value={form.clinic}
                  onChange={set('clinic')}
                  style={inputBase(!!fieldErrors.clinic)}
                  onFocus={focusStyle}
                  onBlur={blurStyle(!!fieldErrors.clinic)}
                />
              </Field>

              <Field label="Role">
                <ChevronDown size={15} style={{
                  position: 'absolute',
                  right: 14,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  pointerEvents: 'none',
                  color: '#9ca3af',
                }} />
                <select
                  value={form.role}
                  onChange={set('role')}
                  style={{
                    ...inputBase(false, false),
                    appearance: 'none',
                    cursor: 'pointer',
                    paddingLeft: 16,
                    paddingRight: 40,
                  }}
                  onFocus={focusStyle}
                  onBlur={blurStyle(false)}
                >
                  {ROLES.map((role) => (
                    <option key={role} value={role}>{role}</option>
                  ))}
                </select>
              </Field>
            </SectionCard>

            <SectionCard title="Security">
              <Field label="Password" icon={Lock} error={fieldErrors.password}>
                <input
                  type={showPass ? 'text' : 'password'}
                  placeholder="Min. 8 characters"
                  value={form.password}
                  onChange={set('password')}
                  style={{ ...inputBase(!!fieldErrors.password), paddingRight: 44 }}
                  onFocus={focusStyle}
                  onBlur={blurStyle(!!fieldErrors.password)}
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPass((state) => !state)}
                  style={{
                    position: 'absolute',
                    right: 14,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    padding: 0,
                    color: '#9ca3af',
                    display: 'flex',
                    alignItems: 'center',
                  }}
                >
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </Field>

              <Field label="Confirm Password" icon={Lock} error={fieldErrors.confirm}>
                <input
                  type={showConfirm ? 'text' : 'password'}
                  placeholder="Re-enter your password"
                  value={form.confirm}
                  onChange={set('confirm')}
                  style={{ ...inputBase(!!fieldErrors.confirm), paddingRight: 44 }}
                  onFocus={focusStyle}
                  onBlur={blurStyle(!!fieldErrors.confirm)}
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm((state) => !state)}
                  style={{
                    position: 'absolute',
                    right: 14,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    padding: 0,
                    color: '#9ca3af',
                    display: 'flex',
                    alignItems: 'center',
                  }}
                >
                  {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </Field>
            </SectionCard>

            <button
              type="submit"
              disabled={authLoading}
              onMouseEnter={(e) => {
                if (!authLoading) {
                  e.currentTarget.style.transform = 'translateY(-1px)'
                  e.currentTarget.style.boxShadow = '0 10px 28px rgba(21,128,61,0.42)'
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)'
                e.currentTarget.style.boxShadow = authLoading ? 'none' : '0 6px 22px rgba(21,128,61,0.35)'
              }}
              style={{
                width: '100%',
                padding: '17px 0',
                borderRadius: 14,
                border: 'none',
                cursor: authLoading ? 'not-allowed' : 'pointer',
                fontFamily: 'Sora, sans-serif',
                fontWeight: 800,
                fontSize: 15,
                letterSpacing: '0.04em',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 10,
                backgroundColor: authLoading ? '#d1d5db' : 'var(--primary)',
                color: authLoading ? '#9ca3af' : '#ffffff',
                boxShadow: authLoading ? 'none' : '0 6px 22px rgba(21,128,61,0.35)',
                transition: 'all 0.18s ease',
                marginTop: 4,
              }}
            >
              {authLoading ? (
                <>
                  <div style={{
                    width: 18,
                    height: 18,
                    border: '2.5px solid rgba(255,255,255,0.35)',
                    borderTopColor: '#ffffff',
                    borderRadius: '50%',
                    animation: 'spin 0.75s linear infinite',
                  }} />
                  Creating account...
                </>
              ) : (
                <>
                  Create Account <ArrowRight size={17} />
                </>
              )}
            </button>
          </form>

          <div style={{
            marginTop: 28,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 6,
          }}>
            <span style={{ fontSize: 14, color: '#6b7280' }}>Already have an account?</span>
            <button
              type="button"
              onClick={() => navigate('/login')}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                fontSize: 14,
                fontWeight: 700,
                color: 'var(--primary)',
                fontFamily: 'Sora, sans-serif',
                padding: 0,
              }}
            >
              Sign in
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
