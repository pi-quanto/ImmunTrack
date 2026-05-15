import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Shield, Mail, Lock, Eye, EyeOff, AlertCircle, ArrowRight } from 'lucide-react'
import { useAuth } from '../AuthProvider/AuthContext'

const inputBase = (hasError = false) => ({
  width: '100%',
  padding: '13px 14px 13px 42px',
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

function Field({ label, icon: Icon, error, children }) {
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

export default function Login() {
  const navigate = useNavigate()
  const { login, authLoading, authError, clearError } = useAuth()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [fieldErrors, setFieldErrors] = useState({})

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
    if (!email.trim()) errs.email = 'Email is required.'
    if (!password) errs.password = 'Password is required.'
    setFieldErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    clearError()
    if (!validate()) return
    const ok = await login({ email: email.trim(), password })
    if (ok) navigate('/')
  }

  return (
    <div className="auth-page auth-page--login" style={{ height: '100%' }}>
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
        <div className="auth-card auth-card--solid">
          <div className="auth-card__desktop-header">
            <span className="auth-card__desktop-kicker">Sign In</span>
            <p className="auth-card__desktop-note">Use your staff credentials to open the dashboard.</p>
          </div>
          {authError && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              padding: '14px 16px',
              borderRadius: 14,
              marginBottom: 24,
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

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            
        <div style={{ position: 'relative' }}>
          <h1 style={{
            fontFamily: 'Sora, sans-serif',
            fontWeight: 600,
            fontSize: 26,
            color: '#131111',
            margin: 0,
            lineHeight: 1.3,
          }}>
            Welcome back
          </h1>
          <p style={{ fontSize: 14, color: 'rgba(18, 17, 17, 0.55)', margin: '8px 0 0 0' }}>
            Sign in to continue managing records
          </p>
        </div>
            <Field label="Email Address" icon={Mail} error={fieldErrors.email}>
              <input
                type="email"
                placeholder="you@clinic.ng"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value)
                  setFieldErrors((prev) => ({ ...prev, email: null }))
                  clearError()
                }}
                style={inputBase(!!fieldErrors.email)}
                onFocus={focusStyle}
                onBlur={blurStyle(!!fieldErrors.email)}
                autoComplete="email"
              />
            </Field>

            <Field label="Password" icon={Lock} error={fieldErrors.password}>
              <input
                type={showPass ? 'text' : 'password'}
                placeholder="Enter your password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value)
                  setFieldErrors((prev) => ({ ...prev, password: null }))
                  clearError()
                }}
                style={{ ...inputBase(!!fieldErrors.password), paddingRight: 44 }}
                onFocus={focusStyle}
                onBlur={blurStyle(!!fieldErrors.password)}
                autoComplete="current-password"
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

            <div style={{ textAlign: 'right', marginTop: -8 }}>
              <button
                type="button"
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: 13,
                  fontWeight: 600,
                  color: 'var(--primary)',
                  padding: 0,
                  fontFamily: 'Sora, sans-serif',
                }}
              >
                Forgot password?
              </button>
            </div>

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
                  Signing in...
                </>
              ) : (
                <>
                  Sign In <ArrowRight size={17} />
                </>
              )}
            </button>
          </form>

          <div style={{
            marginTop: 32,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 6,
          }}>
            <span style={{ fontSize: 14, color: '#6b7280' }}>Don't have an account?</span>
            <button
              type="button"
              onClick={() => navigate('/signup')}
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
              Create account
            </button>
          </div>
        </div>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}
