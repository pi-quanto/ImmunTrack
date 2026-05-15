import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Trash2, Edit2, Eye, Plus, Search, AlertCircle, CheckCircle2,
} from 'lucide-react'
import Header from '../components/Header'
import OfflineBanner from '../components/OfflineBanner'
import { useAuth } from '../AuthProvider/AuthContext'
import db from '../db/database'

function formatDate(dateString) {
  if (!dateString) return 'N/A'
  return new Date(dateString).toLocaleDateString('en-NG', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

function formatAge(dateOfBirth) {
  if (!dateOfBirth) return 'N/A'
  const today = new Date()
  const dob = new Date(dateOfBirth)
  const totalMonths = (today.getFullYear() - dob.getFullYear()) * 12 + (today.getMonth() - dob.getMonth())
  if (Number.isNaN(totalMonths) || totalMonths < 1) return 'Under 1 month'
  if (totalMonths < 24) return `${totalMonths}mo`
  const years = Math.floor(totalMonths / 12)
  return `${years}y`
}

export default function ChildrenManagement() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [children, setChildren] = useState([])
  const [filteredChildren, setFilteredChildren] = useState([])
  const [searchQuery, setSearchQuery] = useState('')
  const [loading, setLoading] = useState(true)
  const [selectedChild, setSelectedChild] = useState(null)
  const [showDetailModal, setShowDetailModal] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [childToDelete, setChildToDelete] = useState(null)
  const [message, setMessage] = useState(null)

  // Load all children
  useEffect(() => {
    const loadChildren = async () => {
      try {
        const allChildren = await db.children.toArray()
        setChildren(allChildren)
        setFilteredChildren(allChildren)
      } catch (error) {
        console.error('Failed to load children:', error)
        setMessage({ type: 'error', text: 'Failed to load children' })
      } finally {
        setLoading(false)
      }
    }
    loadChildren()
  }, [])

  // Filter children based on search
  useEffect(() => {
    const filtered = children.filter((child) => {
      const query = searchQuery.toLowerCase()
      return (
        child.fullName?.toLowerCase().includes(query) ||
        child.healthId?.toLowerCase().includes(query) ||
        child.phone?.includes(query)
      )
    })
    setFilteredChildren(filtered)
  }, [searchQuery, children])

  const handleView = (child) => {
    setSelectedChild(child)
    setShowDetailModal(true)
  }

  const handleEdit = (child) => {
    navigate('/patient-profile', { state: { child } })
  }

  const handleDeleteClick = (child) => {
    setChildToDelete(child)
    setShowDeleteConfirm(true)
  }

  const handleConfirmDelete = async () => {
    try {
      if (childToDelete?.id) {
        await db.children.delete(childToDelete.id)
        setChildren(children.filter((c) => c.id !== childToDelete.id))
        setMessage({ type: 'success', text: `${childToDelete.fullName} deleted successfully` })
      }
    } catch (error) {
      console.error('Delete failed:', error)
      setMessage({ type: 'error', text: 'Failed to delete child record' })
    } finally {
      setShowDeleteConfirm(false)
      setChildToDelete(null)
    }
  }

  if (loading) {
    return (
      <div className="app-page" style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', backgroundColor: 'var(--pg-bg)' }}>
        <Header title="Children Registry" showBack />
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <p style={{ color: '#6b7280' }}>Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="app-page" style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', backgroundColor: 'var(--pg-bg)' }}>
      <Header title="Children Registry" subtitle={`${filteredChildren.length} child${filteredChildren.length !== 1 ? 'ren' : ''}`} showBack />

      <main className="app-main" style={{
        flex: 1, width: '100%', padding: '24px', boxSizing: 'border-box', overflowY: 'auto',
      }}>
        <OfflineBanner />

        {/* Message Alert */}
        {message && (
          <div style={{
            padding: '12px 16px', marginBottom: 16, borderRadius: 8,
            backgroundColor: message.type === 'success' ? '#f0fdf4' : '#fef2f2',
            border: `1px solid ${message.type === 'success' ? '#86efac' : '#fca5a5'}`,
            display: 'flex', gap: 8, alignItems: 'center',
          }}>
            {message.type === 'success' ? <CheckCircle2 size={18} color="#16a34a" /> : <AlertCircle size={18} color="#dc2626" />}
            <span style={{ fontSize: 14, color: message.type === 'success' ? '#16a34a' : '#dc2626' }}>{message.text}</span>
            <button
              onClick={() => setMessage(null)}
              style={{ marginLeft: 'auto', background: 'none', border: 'none', cursor: 'pointer', fontSize: 18, color: '#999' }}
            >
              ×
            </button>
          </div>
        )}

        {/* Search and Add Button */}
        <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: 250, position: 'relative' }}>
            <Search size={18} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} />
            <input
              type="text"
              placeholder="Search by name, ID, or phone…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: '100%', padding: '12px 16px 12px 40px', fontSize: 14,
                border: `1px solid var(--card-border)`, borderRadius: 14,
                backgroundColor: '#f8fafc', color: '#111827', fontFamily: 'inherit',
                boxShadow: '0 4px 18px rgba(15,23,42,0.04)',
              }}
            />
          </div>
          <button
            onClick={() => navigate('/register')}
            style={{
              display: 'flex', alignItems: 'center', gap: 8,
              padding: '10px 16px', backgroundColor: 'var(--primary)', color: 'white',
              border: 'none', borderRadius: 8, cursor: 'pointer', fontSize: 14,
              fontWeight: 600, boxShadow: '0 2px 8px rgba(21,128,61,0.15)',
            }}
          >
            <Plus size={18} />
            Add Child
          </button>
        </div>

        {/* Table */}
        {filteredChildren.length === 0 ? (
          <div style={{
            padding: '40px 24px', textAlign: 'center', backgroundColor: 'var(--card-bg)',
            borderRadius: 8, border: `1px solid var(--card-border)`,
          }}>
            <p style={{ fontSize: 16, color: '#6b7280', marginBottom: 8 }}>No children found</p>
            <p style={{ fontSize: 13, color: '#9ca3af' }}>Register a new child to get started</p>
          </div>
        ) : (
          <div style={{
            backgroundColor: 'var(--card-bg)', borderRadius: 8, border: `1px solid var(--card-border)`,
            overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
          }}>
            <div style={{
              overflowX: 'auto',
            }}>
              <table style={{
                width: '100%', borderCollapse: 'collapse', fontSize: 14,
              }}>
                <thead>
                  <tr style={{ backgroundColor: 'var(--accent-light)', borderBottom: `1px solid var(--card-border)` }}>
                    <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 600, color: 'var(--primary)' }}>Name</th>
                    <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 600, color: 'var(--primary)' }}>Health ID</th>
                    <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 600, color: 'var(--primary)' }}>Age</th>
                    <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 600, color: 'var(--primary)' }}>Gender</th>
                    <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 600, color: 'var(--primary)' }}>Guardian</th>
                    <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 600, color: 'var(--primary)' }}>Phone</th>
                    <th style={{ padding: '12px 16px', textAlign: 'center', fontWeight: 600, color: 'var(--primary)' }}>Status</th>
                    <th style={{ padding: '12px 16px', textAlign: 'center', fontWeight: 600, color: 'var(--primary)' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredChildren.map((child, idx) => (
                    <tr key={child.id} style={{
                      borderBottom: `1px solid var(--card-border)`,
                      backgroundColor: idx % 2 === 0 ? 'var(--accent-light)' : 'var(--card-bg)',
                    }}>
                      <td style={{ padding: '12px 16px', color: '#111827', fontWeight: 500 }}>{child.fullName}</td>
                      <td style={{ padding: '12px 16px', color: '#6b7280', fontFamily: 'monospace', fontSize: 12 }}>
                        {child.healthId}
                      </td>
                      <td style={{ padding: '12px 16px', color: '#6b7280' }}>{formatAge(child.dateOfBirth)}</td>
                      <td style={{ padding: '12px 16px', color: '#6b7280' }}>{child.sex || 'N/A'}</td>
                      <td style={{ padding: '12px 16px', color: '#6b7280' }}>{child.guardianName}</td>
                      <td style={{ padding: '12px 16px', color: '#6b7280' }}>{child.phone}</td>
                      <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                        <span style={{
                          display: 'inline-flex', alignItems: 'center', gap: 4,
                          padding: '4px 8px', borderRadius: 12, fontSize: 11, fontWeight: 600,
                          backgroundColor: child.syncStatus === 'synced' ? '#f0fdf4' : '#fef3c7',
                          color: child.syncStatus === 'synced' ? '#16a34a' : '#d97706',
                        }}>
                          {child.syncStatus === 'synced' ? <CheckCircle2 size={12} /> : <AlertCircle size={12} />}
                          {child.syncStatus === 'synced' ? 'Synced' : 'Pending'}
                        </span>
                      </td>
                      <td style={{ padding: '12px 16px', textAlign: 'center', display: 'flex', gap: 6, justifyContent: 'center' }}>
                        <button
                          onClick={() => handleView(child)}
                          title="View details"
                          style={{
                            background: 'none', border: 'none', cursor: 'pointer', color: '#0ea5e9', fontSize: 16, padding: 4,
                          }}
                        >
                          <Eye size={18} />
                        </button>
                        <button
                          onClick={() => handleEdit(child)}
                          title="Edit"
                          style={{
                            background: 'none', border: 'none', cursor: 'pointer', color: '#f59e0b', fontSize: 16, padding: 4,
                          }}
                        >
                          <Edit2 size={18} />
                        </button>
                        <button
                          onClick={() => handleDeleteClick(child)}
                          title="Delete"
                          style={{
                            background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444', fontSize: 16, padding: 4,
                          }}
                        >
                          <Trash2 size={18} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>

      {/* Detail Modal */}
      {showDetailModal && selectedChild && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 1000, padding: 16,
        }}>
          <div style={{
            backgroundColor: 'var(--card-bg)', borderRadius: 12, padding: 24, maxWidth: 500, width: '100%',
            maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 20px 25px rgba(0,0,0,0.15)',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h2 style={{ margin: 0, fontSize: 20, fontWeight: 700, color: '#111827' }}>Child Details</h2>
              <button
                onClick={() => setShowDetailModal(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 24, color: '#9ca3af' }}
              >
                ×
              </button>
            </div>

            <div style={{ display: 'grid', gap: 12 }}>
              <DetailRow label="Full Name" value={selectedChild.fullName} />
              <DetailRow label="Health ID" value={selectedChild.healthId} />
              <DetailRow label="Date of Birth" value={formatDate(selectedChild.dateOfBirth)} />
              <DetailRow label="Age" value={formatAge(selectedChild.dateOfBirth)} />
              <DetailRow label="Gender" value={selectedChild.sex} />
              <DetailRow label="Guardian" value={selectedChild.guardianName} />
              <DetailRow label="Phone" value={selectedChild.phone} />
              <DetailRow label="Village/Address" value={selectedChild.village} />
              <DetailRow label="Registered" value={formatDate(selectedChild.createdAt)} />
              <DetailRow label="Status" value={selectedChild.syncStatus === 'synced' ? '✓ Synced' : '⟳ Pending'} />
            </div>

            <button
              onClick={() => setShowDetailModal(false)}
              style={{
                width: '100%', marginTop: 20, padding: '10px 16px',
                backgroundColor: 'var(--primary)', color: 'white', border: 'none',
                borderRadius: 8, cursor: 'pointer', fontSize: 14, fontWeight: 600,
              }}
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && childToDelete && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 1000, padding: 16,
        }}>
          <div style={{
            backgroundColor: 'var(--card-bg)', borderRadius: 12, padding: 24, maxWidth: 400, width: '100%',
            boxShadow: '0 20px 25px rgba(0,0,0,0.15)',
          }}>
            <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: '#dc2626', marginBottom: 8 }}>Delete Child Record?</h2>
            <p style={{ color: '#6b7280', marginBottom: 24, lineHeight: 1.5 }}>
              Are you sure you want to delete <strong>{childToDelete.fullName}</strong>? This action cannot be undone.
            </p>
            <div style={{ display: 'flex', gap: 12 }}>
              <button
                onClick={() => setShowDeleteConfirm(false)}
                style={{
                  flex: 1, padding: '10px 16px', border: `1px solid var(--card-border)`,
                  backgroundColor: 'var(--accent-light)', borderRadius: 8, cursor: 'pointer', fontSize: 14, fontWeight: 600,
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                style={{
                  flex: 1, padding: '10px 16px', backgroundColor: '#dc2626', color: 'white',
                  border: 'none', borderRadius: 8, cursor: 'pointer', fontSize: 14, fontWeight: 600,
                }}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function DetailRow({ label, value }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '140px 1fr' }}>
      <span style={{ color: '#6b7280', fontSize: 13, fontWeight: 500 }}>{label}:</span>
      <span style={{ color: '#111827', fontSize: 13, fontWeight: 500 }}>{value || 'N/A'}</span>
    </div>
  )
}
