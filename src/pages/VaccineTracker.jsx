import { useEffect, useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Search, Shield, User, X,
} from 'lucide-react'
import Header from '../components/Header'
import OfflineBanner from '../components/OfflineBanner'
import db from '../db/database'

function formatAge(dateOfBirth) {
  if (!dateOfBirth) return 'Age unavailable'
  const today = new Date()
  const dob = new Date(dateOfBirth)
  const totalMonths =
    (today.getFullYear() - dob.getFullYear()) * 12 +
    (today.getMonth() - dob.getMonth())
  if (Number.isNaN(totalMonths) || totalMonths < 1) return 'Under 1 month'
  if (totalMonths < 24) return `${totalMonths} month${totalMonths === 1 ? '' : 's'}`
  const years = Math.floor(totalMonths / 12)
  return `${years} year${years === 1 ? '' : 's'}`
}

function formatDate(value) {
  if (!value) return 'Unknown'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return 'Unknown'
  return date.toLocaleDateString('en-NG', { year: 'numeric', month: 'short', day: 'numeric' })
}

function getLatestVaccination(vaccinations = []) {
  return [...vaccinations].sort((a, b) => new Date(b.dateGiven) - new Date(a.dateGiven))[0] || null
}

function ChildCard({ child, vaccinations, onAdminister, onViewProfile }) {
  const administered = vaccinations.length > 0
  const latest = getLatestVaccination(vaccinations)

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: '1fr auto',
      gap: 16,
      padding: 18,
      borderRadius: 18,
      backgroundColor: 'var(--card-bg)',
      border: '1.5px solid var(--card-border)',
      boxShadow: '0 2px 14px rgba(0,0,0,0.04)',
    }}>
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
          <div style={{
            width: 46, height: 46, borderRadius: 14,
            backgroundColor: 'var(--accent-light)',
            border: '1px solid var(--card-border)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontFamily: 'Sora, sans-serif', fontWeight: 700, fontSize: 16,
            color: 'var(--text-primary)',
          }}>
            {child.fullName.split(' ').map((part) => part[0]).join('').slice(0, 2).toUpperCase()}
          </div>
          <div style={{ minWidth: 0 }}>
            <p style={{ margin: 0, fontSize: 15, fontWeight: 700, color: 'var(--text-primary)' }}>{child.fullName}</p>
            <p style={{ margin: '4px 0 0 0', fontSize: 12, color: 'var(--text-muted)' }}>
              {formatAge(child.dateOfBirth)} · {child.healthId}
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 16 }}>
          <span style={{
            padding: '5px 11px', borderRadius: 16,
            backgroundColor: child.syncStatus === 'synced' ? '#f0fdf4' : '#fef2f7',
            border: `1px solid ${child.syncStatus === 'synced' ? '#86efac' : '#fecaca'}`,
            color: child.syncStatus === 'synced' ? '#15803d' : '#b91c1c',
            fontSize: 11, fontWeight: 700,
          }}>
            {child.syncStatus === 'synced' ? 'Synced' : 'Not synced'}
          </span>
          <span style={{
            padding: '5px 11px', borderRadius: 16,
            backgroundColor: administered ? '#ecfdf5' : '#fef2f2',
            border: `1px solid ${administered ? '#bbf7d0' : '#fecaca'}`,
            color: administered ? '#15803d' : '#b91c1c',
            fontSize: 11, fontWeight: 700,
          }}>
            {administered ? 'Administered' : 'Not administered'}
          </span>
        </div>

        <div style={{ marginTop: 14 }}>
          {administered ? (
            <p style={{ margin: 0, fontSize: 12, color: 'var(--text-muted)' }}>
              Last vaccine: {latest.vaccineName} on {formatDate(latest.dateGiven)}
            </p>
          ) : (
            <p style={{ margin: 0, fontSize: 12, color: 'var(--text-muted)' }}>
              No vaccine has been recorded for this child yet.
            </p>
          )}
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, justifyContent: 'center' }}>
        <button
          onClick={onAdminister}
          style={{
            width: '100%', padding: '13px 14px', borderRadius: 14,
            border: 'none', backgroundColor: 'var(--primary)', color: '#ffffff',
            fontWeight: 700, cursor: 'pointer', fontSize: 13,
          }}
        >
          Administer
        </button>
        <button
          onClick={onViewProfile}
          style={{
            width: '100%', padding: '12px 14px', borderRadius: 14,
            border: '1px solid var(--card-border)', backgroundColor: 'var(--accent-light)',
            color: 'var(--text-primary)', fontWeight: 700, cursor: 'pointer', fontSize: 13,
          }}
        >
          View profile
        </button>
      </div>
    </div>
  )
}

function EmptyState({ message, icon: Icon = User }) {
  return (
    <div style={{
      textAlign: 'center', padding: '36px 24px',
      backgroundColor: 'var(--card-bg)', borderRadius: 16,
      border: '1.5px dashed var(--card-border)',
    }}>
      <Icon size={30} style={{ margin: '0 auto 10px', opacity: 0.35, color: 'var(--text-muted)', display: 'block' }} />
      <p style={{ color: 'var(--text-muted)', fontSize: 13, margin: 0 }}>{message}</p>
    </div>
  )
}

export default function VaccineTracker() {
  const navigate = useNavigate()
  const [searchQuery, setSearchQuery] = useState('')
  const [allChildren, setAllChildren] = useState([])
  const [childVaccinations, setChildVaccinations] = useState({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let alive = true

    async function loadData() {
      try {
        const allChildrenData = await db.children.orderBy('createdAt').reverse().toArray()
        const allVaccinations = await db.vaccinations.toArray()

        if (!alive) return

        const vacsByChild = {}
        allVaccinations.forEach((v) => {
          if (!vacsByChild[v.childLocalId]) vacsByChild[v.childLocalId] = []
          vacsByChild[v.childLocalId].push(v)
        })

        setAllChildren(allChildrenData)
        setChildVaccinations(vacsByChild)
      } catch (err) {
        console.error('VaccineTracker load error:', err)
      } finally {
        if (alive) setLoading(false)
      }
    }

    loadData()
    return () => { alive = false }
  }, [])

  const filteredChildren = useMemo(() => {
    const q = searchQuery.trim().toLowerCase()
    if (!q) return allChildren
    return allChildren.filter((c) =>
      c.fullName?.toLowerCase().includes(q) ||
      c.healthId?.toLowerCase().includes(q) ||
      c.guardianPhone?.toLowerCase().includes(q) ||
      c.motherName?.toLowerCase().includes(q)
    )
  }, [searchQuery, allChildren])

  const totalPatients = allChildren.length
  const administeredPatients = allChildren.filter((child) => (childVaccinations[child.localId] || []).length > 0).length
  const pendingPatients = totalPatients - administeredPatients

  const handleAdminister = (child) => {
    navigate('/administer', {
      state: {
        child: {
          localId: child.localId,
          healthId: child.healthId,
          name: child.fullName,
          clinic: child.clinic || child.village || 'Offline clinic record',
          dateOfBirth: child.dateOfBirth,
        },
        vaccine: {
          name: 'BCG',
          description: 'Bacillus Calmette-Guérin',
        },
      },
    })
  }

  const handleViewProfile = (child) => {
    navigate(`/patients/${child.localId}`, { state: { child } })
  }

  if (!loading && totalPatients === 0) {
    return (
      <div className="app-page" style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        <Header showBack />
        <main className="app-main" style={{
          flex: 1, padding: '28px 24px 100px',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <div style={{ textAlign: 'center', maxWidth: 380 }}>
            <div style={{
              width: 64, height: 64, borderRadius: 20, margin: '0 auto 20px',
              backgroundColor: 'var(--accent-light)', border: '1.5px solid var(--accent-border)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Shield size={28} style={{ color: 'var(--primary)' }} />
            </div>
            <h2 style={{
              fontFamily: 'Sora, sans-serif', fontWeight: 800,
              fontSize: 22, color: 'var(--text-primary)', margin: '0 0 10px 0',
            }}>
              No patients registered yet
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: 13, marginBottom: 24, lineHeight: 1.6 }}>
              Register a child first to begin tracking their vaccination schedule.
            </p>
            <button
              onClick={() => navigate('/register')}
              style={{
                padding: '13px 24px', borderRadius: 14, border: 'none', cursor: 'pointer',
                backgroundColor: 'var(--primary)', color: '#ffffff',
                fontFamily: 'Sora, sans-serif', fontWeight: 700, fontSize: 14,
                boxShadow: '0 6px 20px color-mix(in srgb, var(--primary-shadow) 35%, transparent)',
              }}
            >
              Register Child
            </button>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="app-page" style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Header showBack />
      <main className="app-main" style={{
        flex: 1,
        width: '100%',
        padding: '28px 24px 100px',
        display: 'flex',
        flexDirection: 'column',
        gap: 28,
        boxSizing: 'border-box',
      }}>
        <OfflineBanner />

        <div style={{ position: 'relative' }}>
          <div style={{
            position: 'absolute', left: 14, top: '50%',
            transform: 'translateY(-50%)', pointerEvents: 'none',
            color: '#9ca3af', display: 'flex', alignItems: 'center',
          }}>
            <Search size={15} />
          </div>
          <input
            type="text"
            placeholder="Search by name, ID, or phone…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: '100%',
              padding: '13px 40px 13px 40px',
              borderRadius: 14,
              border: '1.5px solid var(--card-border)',
              backgroundColor: 'var(--card-bg)',
              color: 'var(--text-primary)',
              fontSize: 14, fontWeight: 500,
              outline: 'none',
              boxSizing: 'border-box',
              boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
              transition: 'border-color 0.15s',
            }}
            onFocus={(e) => { e.currentTarget.style.borderColor = 'var(--primary)' }}
            onBlur={(e) => { e.currentTarget.style.borderColor = 'var(--card-border)' }}
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              style={{
                position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
                background: 'none', border: 'none', cursor: 'pointer',
                color: '#9ca3af', display: 'flex', alignItems: 'center', padding: 4,
              }}
            >
              <X size={14} />
            </button>
          )}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 16 }}>
          <div style={{
            padding: 18, borderRadius: 18, backgroundColor: 'var(--card-bg)',
            border: '1.5px solid var(--card-border)',
          }}>
            <p style={{ margin: 0, fontSize: 14, color: 'var(--text-secondary)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              Total patients
            </p>
            <p style={{ margin: '10px 0 0 0', fontSize: 28, fontWeight: 800, color: 'var(--text-primary)' }}>{totalPatients}</p>
          </div>
          <div style={{
            padding: 18, borderRadius: 18, backgroundColor: 'var(--card-bg)',
            border: '1.5px solid var(--card-border)',
          }}>
            <p style={{ margin: 0, fontSize: 14, color: 'var(--text-secondary)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              Administered
            </p>
            <p style={{ margin: '10px 0 0 0', fontSize: 28, fontWeight: 800 }}>{administeredPatients}</p>
          </div>
          <div style={{
            padding: 18, borderRadius: 18, backgroundColor: 'var(--card-bg)',
            border: '1.5px solid var(--card-border)',
          }}>
            <p style={{ margin: 0, fontSize: 14 , color: 'var(--text-secondary)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              Pending
            </p>
            <p style={{ margin: '10px 0 0 0', fontSize: 28, fontWeight: 800 }}>{pendingPatients}</p>
          </div>
        </div>

        <section>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
            <h2 style={{
              fontFamily: 'Sora, sans-serif', fontWeight: 700, fontSize: 11,
              textTransform: 'uppercase', letterSpacing: '0.1em',
              color: 'var(--text-muted)', margin: 0,
            }}>
              {searchQuery ? `Results for "${searchQuery}" (${filteredChildren.length})` : `All Patients (${totalPatients})`}
            </h2>
          </div>

          {filteredChildren.length === 0 ? (
            <EmptyState
              icon={Search}
              message={searchQuery ? `No patients found matching "${searchQuery}"` : 'No patients registered yet'}
            />
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {filteredChildren.map((child) => (
                <ChildCard
                  key={child.localId || child.healthId}
                  child={child}
                  vaccinations={childVaccinations[child.localId] || []}
                  onAdminister={() => handleAdminister(child)}
                  onViewProfile={() => handleViewProfile(child)}
                />
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  )
}
