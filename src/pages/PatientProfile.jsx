import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { User, Phone, Calendar, MapPin, Users, Save, CheckCircle2 } from 'lucide-react'
import Header from '../components/Header'
import OfflineBanner from '../components/OfflineBanner'
import { fetchChildProfile, updateChildProfile } from '../api/childrenApi'

const inputBase = {
  width: '100%',
  padding: '13px 14px',
  borderRadius: 12,
  border: '1.5px solid var(--card-border)',
  backgroundColor: 'var(--card-bg)',
  color: 'var(--text-primary)',
  fontSize: 14,
  fontWeight: 500,
  outline: 'none',
  boxSizing: 'border-box',
}

function Field({ label, icon: Icon, children }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <label style={{
        fontSize: 11,
        fontWeight: 700,
        textTransform: 'uppercase',
        letterSpacing: '0.09em',
        color: 'var(--text-secondary)',
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
          color: 'var(--text-muted)',
          display: 'flex',
          alignItems: 'center',
        }}>
          <Icon size={15} />
        </div>
        {children}
      </div>
    </div>
  )
}

function SectionCard({ title, children }) {
  return (
    <section style={{
      borderRadius: 18,
      overflow: 'hidden',
      backgroundColor: 'var(--card-bg)',
      border: '1px solid var(--section-border)',
      boxShadow: '0 2px 12px color-mix(in srgb, var(--primary-shadow) 18%, transparent)',
    }}>
      <div style={{
        padding: '14px 18px',
        borderBottom: '1px solid var(--section-border)',
        backgroundColor: 'var(--section-bg)',
      }}>
        <h2 style={{
          margin: 0,
          fontSize: 12,
          fontWeight: 800,
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
          color: 'var(--text-primary)',
          fontFamily: 'Sora, sans-serif',
        }}>
          {title}
        </h2>
      </div>
      <div style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 18 }}>
        {children}
      </div>
    </section>
  )
}

export default function PatientProfile() {
  const navigate = useNavigate()
  const { patientId } = useParams()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  const [form, setForm] = useState({
    fullName: '',
    dateOfBirth: '',
    sex: 'Male',
    guardianName: '',
    phone: '',
    village: '',
  })

  useEffect(() => {
    let alive = true

    const loadProfile = async () => {
      try {
        const child = await fetchChildProfile(patientId)
        if (!alive) return

        setForm({
          fullName: child.fullName || '',
          dateOfBirth: child.dateOfBirth || '',
          sex: child.sex || 'Male',
          guardianName: child.guardianName || '',
          phone: child.phone || '',
          village: child.village || '',
        })
      } catch (error) {
        console.error('Failed to load child profile:', error)
      } finally {
        if (alive) setLoading(false)
      }
    }

    loadProfile()
    return () => { alive = false }
  }, [patientId])

  const setField = (key) => (e) => {
    setForm((prev) => ({ ...prev, [key]: e.target.value }))
    setMessage('')
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const result = await updateChildProfile(patientId, form)
      setMessage(result.offline ? 'Saved locally. Changes will sync when your server is reachable.' : 'Patient details updated successfully.')
    } catch (error) {
      setMessage(error.message || 'Failed to update patient details.')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="app-page" style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', backgroundColor: 'var(--pg-bg)' }}>
        <Header title="Patient Profile" showBack />
        <main className="app-main" style={{ flex: 1, padding: '28px 24px 100px' }}>
          <div style={{ color: 'var(--text-secondary)' }}>Loading patient details...</div>
        </main>
      </div>
    )
  }

  return (
    <div className="app-page" style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', backgroundColor: 'var(--pg-bg)' }}>
      <Header title="Patient Profile" subtitle="Review and update the complete child record." eyebrow="Patient record" showBack />

      <main className="app-main" style={{
        flex: 1,
        width: '100%',
        padding: '28px 24px 100px',
        display: 'flex',
        flexDirection: 'column',
        gap: 24,
        boxSizing: 'border-box',
      }}>
        <OfflineBanner />

        <SectionCard title="Full Details">
          <Field label="Full Name" icon={User}>
            <input value={form.fullName} onChange={setField('fullName')} style={{ ...inputBase, paddingLeft: 42 }} />
          </Field>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16 }}>
            <Field label="Date of Birth" icon={Calendar}>
              <input type="date" value={form.dateOfBirth} onChange={setField('dateOfBirth')} style={{ ...inputBase, paddingLeft: 42 }} />
            </Field>

            <Field label="Sex" icon={Users}>
              <select value={form.sex} onChange={setField('sex')} style={{ ...inputBase, paddingLeft: 42 }}>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
              </select>
            </Field>
          </div>

          <Field label="Guardian Name" icon={User}>
            <input value={form.guardianName} onChange={setField('guardianName')} style={{ ...inputBase, paddingLeft: 42 }} />
          </Field>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16 }}>
            <Field label="Phone" icon={Phone}>
              <input value={form.phone} onChange={setField('phone')} style={{ ...inputBase, paddingLeft: 42 }} />
            </Field>

            <Field label="Address / Village" icon={MapPin}>
              <input value={form.village} onChange={setField('village')} style={{ ...inputBase, paddingLeft: 42 }} />
            </Field>
          </div>
        </SectionCard>

        {message && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            padding: '14px 16px',
            borderRadius: 14,
            backgroundColor: 'var(--section-bg)',
            border: '1px solid var(--section-border)',
            color: 'var(--text-primary)',
          }}>
            <CheckCircle2 size={16} style={{ color: 'var(--primary)' }} />
            <span style={{ fontSize: 13 }}>{message}</span>
          </div>
        )}

        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          <button
            onClick={handleSave}
            disabled={saving}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              padding: '14px 18px',
              borderRadius: 14,
              border: 'none',
              backgroundColor: 'var(--primary)',
              color: '#000000',
              fontWeight: 800,
              cursor: saving ? 'not-allowed' : 'pointer',
              boxShadow: 'var(--btn-shadow)',
            }}
          >
            <Save size={16} />
            {saving ? 'Saving...' : 'Save Changes'}
          </button>

          <button
            onClick={() => navigate(-1)}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              padding: '14px 18px',
              borderRadius: 14,
              border: '1px solid var(--card-border)',
              backgroundColor: 'var(--card-bg)',
              color: 'var(--text-primary)',
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            Back to Dashboard
          </button>
        </div>
      </main>
    </div>
  )
}
