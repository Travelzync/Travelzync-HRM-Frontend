import { useState, useEffect, useMemo } from 'react'
import { Link } from 'react-router-dom'
import {
  Building2, Plus, Search, Edit2, Trash2, Loader2,
  AlertCircle, CheckCircle2, X, Briefcase
} from 'lucide-react'
import {
  getDepartments, createDepartment, updateDepartment, deleteDepartment
} from '../../services/departmentService'
import { showSuccess, showError, showWarning } from '../../utils/toast'

export default function Departments() {
  const [departments, setDepartments] = useState([])
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  // Notifications
  const [successMsg, setSuccessMsg] = useState('')
  const [errorMsg, setErrorMsg] = useState('')

  // Modals
  const [createModalOpen, setCreateModalOpen] = useState(false)
  const [editModalOpen, setEditModalOpen] = useState(false)
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [selectedDepartment, setSelectedDepartment] = useState(null)

  // Forms
  const [createForm, setCreateForm] = useState({ name: '', description: '' })
  const [editForm, setEditForm] = useState({ name: '', description: '', isActive: true })

  const fetchDepartments = async () => {
    try {
      setLoading(true)
      const res = await getDepartments()
      if (res?.departments) {
        setDepartments(res.departments)
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to load departments'
      setErrorMsg(msg)
      showError(msg)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchDepartments()
  }, [])

  useEffect(() => {
    if (successMsg) {
      const timer = setTimeout(() => setSuccessMsg(''), 4000)
      return () => clearTimeout(timer)
    }
  }, [successMsg])

  useEffect(() => {
    if (errorMsg) {
      const timer = setTimeout(() => setErrorMsg(''), 6000)
      return () => clearTimeout(timer)
    }
  }, [errorMsg])

  const filteredDepartments = useMemo(() => {
    return departments.filter((d) =>
      d.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (d.description && d.description.toLowerCase().includes(searchQuery.toLowerCase()))
    )
  }, [departments, searchQuery])

  // Handle Create
  const handleCreate = async (e) => {
    e.preventDefault()
    if (!createForm.name.trim()) {
      const msg = 'Department name is required'
      setErrorMsg(msg)
      showWarning(msg)
      return
    }

    try {
      setActionLoading(true)
      const res = await createDepartment(createForm)
      const msg = res.message || 'Department created successfully!'
      setSuccessMsg(msg)
      showSuccess(msg)
      setCreateModalOpen(false)
      setCreateForm({ name: '', description: '' })
      fetchDepartments()
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to create department'
      setErrorMsg(msg)
      showError(msg)
    } finally {
      setActionLoading(false)
    }
  }

  // Handle Edit Open
  const handleOpenEdit = (dept) => {
    setSelectedDepartment(dept)
    setEditForm({
      name: dept.name,
      description: dept.description || '',
      isActive: dept.isActive ?? true,
    })
    setEditModalOpen(true)
  }

  // Handle Edit Submit
  const handleEdit = async (e) => {
    e.preventDefault()
    if (!selectedDepartment) return
    if (!editForm.name.trim()) {
      const msg = 'Department name is required'
      setErrorMsg(msg)
      showWarning(msg)
      return
    }

    try {
      setActionLoading(true)
      const res = await updateDepartment(selectedDepartment._id, editForm)
      const msg = res.message || 'Department updated successfully!'
      setSuccessMsg(msg)
      showSuccess(msg)
      setEditModalOpen(false)
      setSelectedDepartment(null)
      fetchDepartments()
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to update department'
      setErrorMsg(msg)
      showError(msg)
    } finally {
      setActionLoading(false)
    }
  }

  // Handle Delete
  const handleDeleteConfirm = async () => {
    if (!selectedDepartment) return

    try {
      setActionLoading(true)
      const res = await deleteDepartment(selectedDepartment._id)
      const msg = res.message || 'Department deleted successfully!'
      setSuccessMsg(msg)
      showSuccess(msg)
      setDeleteModalOpen(false)
      setSelectedDepartment(null)
      fetchDepartments()
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to delete department'
      setErrorMsg(msg)
      showError(msg)
    } finally {
      setActionLoading(false)
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20, width: '100%' }}>
      {/* Notifications */}
      {successMsg && (
        <div style={{
          background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 10,
          padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 10,
          color: '#166534', fontSize: 13, fontWeight: 500,
        }}>
          <CheckCircle2 size={18} color="#16a34a" />
          <span>{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div style={{
          background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 10,
          padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 10,
          color: '#991b1b', fontSize: 13, fontWeight: 500,
        }}>
          <AlertCircle size={18} color="#dc2626" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Header Banner */}
      <div style={{
        background: '#fff', borderRadius: 14, border: '1px solid #f1f5f9',
        padding: '24px 28px', boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        flexWrap: 'wrap', gap: 16,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{
            width: 48, height: 48, borderRadius: 12,
            background: 'linear-gradient(135deg, #c0392b, #922b21)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Building2 size={22} color="#fff" />
          </div>
          <div>
            <h1 style={{ fontSize: 22, fontWeight: 700, color: '#111827' }}>Department Management</h1>
            <p style={{ fontSize: 13, color: '#94a3b8', marginTop: 3 }}>
              Organize company departments, teams and organizational units.
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <Link
            to="/admin/designations"
            style={{
              display: 'flex', alignItems: 'center', gap: 6,
              background: '#fff5f5', color: '#c0392b', border: '1px solid #fecaca',
              borderRadius: 8, padding: '9px 16px', fontSize: 13, fontWeight: 600,
              textDecoration: 'none', transition: 'background 0.15s',
            }}
          >
            <Briefcase size={15} />
            <span>Manage Designations</span>
          </Link>

          <button
            onClick={() => setCreateModalOpen(true)}
            style={{
              background: 'linear-gradient(135deg, #c0392b, #922b21)',
              color: '#fff', border: 'none', borderRadius: 8,
              padding: '10px 18px', fontSize: 13, fontWeight: 600,
              cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8,
              boxShadow: '0 2px 8px rgba(192,57,43,0.3)',
            }}
          >
            <Plus size={16} />
            <span>Add Department</span>
          </button>
        </div>
      </div>

      {/* Search and Stats */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 8,
          background: '#fff', border: '1px solid #e2e8f0',
          borderRadius: 8, padding: '8px 14px', width: 280,
          boxShadow: '0 1px 2px rgba(0,0,0,0.02)',
        }}>
          <Search size={15} color="#94a3b8" />
          <input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search departments..."
            style={{
              border: 'none', background: 'none', outline: 'none',
              fontSize: 13, color: '#334155', width: '100%',
            }}
          />
        </div>

        <div style={{ display: 'flex', gap: 16 }}>
          <span style={{ fontSize: 13, color: '#64748b' }}>
            Total Departments: <strong style={{ color: '#111827' }}>{departments.length}</strong>
          </span>
          <span style={{ fontSize: 13, color: '#64748b' }}>
            Active: <strong style={{ color: '#16a34a' }}>{departments.filter(d => d.isActive).length}</strong>
          </span>
        </div>
      </div>

      {/* Departments Table */}
      <div style={{
        background: '#fff', border: '1px solid #e2e8f0', borderRadius: 14,
        boxShadow: '0 1px 3px rgba(0,0,0,0.02)', overflow: 'hidden',
      }}>
        {loading ? (
          <div style={{ padding: 48, textAlign: 'center', color: '#64748b' }}>
            <Loader2 size={32} className="animate-spin" style={{ margin: '0 auto 12px', color: '#c0392b' }} />
            <p style={{ fontSize: 14 }}>Loading departments...</p>
          </div>
        ) : filteredDepartments.length === 0 ? (
          <div style={{ padding: 48, textAlign: 'center', color: '#94a3b8' }}>
            <Building2 size={40} color="#cbd5e1" style={{ margin: '0 auto 12px' }} />
            <p style={{ fontSize: 15, fontWeight: 600, color: '#475569' }}>No departments found</p>
            <p style={{ fontSize: 13, marginTop: 4 }}>
              {searchQuery ? 'Try adjusting your search filter.' : 'Click "+ Add Department" to create your first department.'}
            </p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }} className="hide-scroll">
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13, textAlign: 'left' }}>
              <thead>
                <tr style={{ background: '#c0392b', color: '#fff', borderBottom: '2px solid #922b21' }}>
                  {['Department Name', 'Description', 'Created Date', 'Status', 'Actions'].map((h) => (
                    <th key={h} style={{
                      padding: '12px 16px', fontWeight: 600, fontSize: 11,
                      textTransform: 'uppercase', letterSpacing: '0.04em',
                    }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredDepartments.map((dept, idx) => (
                  <tr
                    key={dept._id}
                    style={{
                      borderBottom: '1px solid #f1f5f9',
                      background: idx % 2 === 1 ? '#fff5f5' : '#fff',
                    }}
                  >
                    <td style={{ padding: '14px 16px', fontWeight: 600, color: '#111827' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{
                          width: 32, height: 32, borderRadius: 8,
                          background: '#fff5f5', color: '#c0392b',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                        }}>
                          <Building2 size={16} />
                        </div>
                        <span>{dept.name}</span>
                      </div>
                    </td>
                    <td style={{ padding: '14px 16px', color: '#64748b', maxWidth: 320 }}>
                      {dept.description || 'No description provided'}
                    </td>
                    <td style={{ padding: '14px 16px', color: '#64748b' }}>
                      {dept.createdAt ? new Date(dept.createdAt).toLocaleDateString() : '-'}
                    </td>
                    <td style={{ padding: '14px 16px' }}>
                      <span style={{
                        display: 'inline-block',
                        padding: '3px 10px', borderRadius: 6,
                        fontSize: 11, fontWeight: 700,
                        background: dept.isActive ? '#f0fdf4' : '#fef2f2',
                        color: dept.isActive ? '#16a34a' : '#dc2626',
                      }}>
                        {dept.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td style={{ padding: '14px 16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <button
                          title="Edit Department"
                          onClick={() => handleOpenEdit(dept)}
                          style={{
                            background: '#f8fafc', border: '1px solid #e2e8f0',
                            borderRadius: 6, padding: '6px', cursor: 'pointer',
                            color: '#c0392b',
                          }}
                        >
                          <Edit2 size={14} />
                        </button>
                        <button
                          title="Delete Department"
                          onClick={() => {
                            setSelectedDepartment(dept)
                            setDeleteModalOpen(true)
                          }}
                          style={{
                            background: '#fef2f2', border: '1px solid #fecaca',
                            borderRadius: 6, padding: '6px', cursor: 'pointer',
                            color: '#dc2626',
                          }}
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ========================================================
          CREATE DEPARTMENT MODAL
      ======================================================== */}
      {createModalOpen && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.45)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 9999, padding: 16,
        }}>
          <div style={{
            background: '#fff', borderRadius: 16, width: '100%', maxWidth: 480,
            padding: 24, boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
              <h3 style={{ fontSize: 18, fontWeight: 700, color: '#c0392b', margin: 0 }}>Add New Department</h3>
              <button
                onClick={() => setCreateModalOpen(false)}
                style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: '#374151', textTransform: 'uppercase', marginBottom: 4 }}>Department Name *</label>
                <input
                  required
                  type="text"
                  value={createForm.name}
                  onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })}
                  placeholder="e.g. Human Resources, Engineering"
                  style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 13, outline: 'none' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: '#374151', textTransform: 'uppercase', marginBottom: 4 }}>Description</label>
                <textarea
                  rows={3}
                  value={createForm.description}
                  onChange={(e) => setCreateForm({ ...createForm, description: e.target.value })}
                  placeholder="Brief description of responsibilities and scope"
                  style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 13, outline: 'none', resize: 'vertical' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 10 }}>
                <button
                  type="button"
                  onClick={() => setCreateModalOpen(false)}
                  style={{ background: '#e2e8f0', color: '#475569', border: 'none', borderRadius: 8, padding: '9px 16px', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  style={{
                    background: 'linear-gradient(135deg, #c0392b, #922b21)',
                    color: '#fff', border: 'none', borderRadius: 8, padding: '9px 18px',
                    fontSize: 13, fontWeight: 600, cursor: actionLoading ? 'not-allowed' : 'pointer',
                    display: 'flex', alignItems: 'center', gap: 6,
                  }}
                >
                  {actionLoading ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
                  <span>Save Department</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================
          EDIT DEPARTMENT MODAL
      ======================================================== */}
      {editModalOpen && selectedDepartment && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.45)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 9999, padding: 16,
        }}>
          <div style={{
            background: '#fff', borderRadius: 16, width: '100%', maxWidth: 480,
            padding: 24, boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
              <h3 style={{ fontSize: 18, fontWeight: 700, color: '#c0392b', margin: 0 }}>Edit Department</h3>
              <button
                onClick={() => setEditModalOpen(false)}
                style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleEdit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: '#374151', textTransform: 'uppercase', marginBottom: 4 }}>Department Name *</label>
                <input
                  required
                  type="text"
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 13, outline: 'none' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: '#374151', textTransform: 'uppercase', marginBottom: 4 }}>Description</label>
                <textarea
                  rows={3}
                  value={editForm.description}
                  onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                  style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 13, outline: 'none', resize: 'vertical' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: '#374151', textTransform: 'uppercase', marginBottom: 4 }}>Status</label>
                <select
                  value={editForm.isActive ? 'active' : 'inactive'}
                  onChange={(e) => setEditForm({ ...editForm, isActive: e.target.value === 'active' })}
                  style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 13, outline: 'none', background: '#fff' }}
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 10 }}>
                <button
                  type="button"
                  onClick={() => setEditModalOpen(false)}
                  style={{ background: '#e2e8f0', color: '#475569', border: 'none', borderRadius: 8, padding: '9px 16px', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  style={{
                    background: 'linear-gradient(135deg, #c0392b, #922b21)',
                    color: '#fff', border: 'none', borderRadius: 8, padding: '9px 18px',
                    fontSize: 13, fontWeight: 600, cursor: actionLoading ? 'not-allowed' : 'pointer',
                    display: 'flex', alignItems: 'center', gap: 6,
                  }}
                >
                  {actionLoading ? <Loader2 size={16} className="animate-spin" /> : <Edit2 size={16} />}
                  <span>Update Department</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================
          DELETE CONFIRMATION MODAL
      ======================================================== */}
      {deleteModalOpen && selectedDepartment && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.45)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 9999, padding: 16,
        }}>
          <div style={{
            background: '#fff', borderRadius: 16, width: '100%', maxWidth: 400,
            padding: 24, boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)', textAlign: 'center',
          }}>
            <div style={{
              width: 48, height: 48, borderRadius: '50%', background: '#fef2f2',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 16px',
            }}>
              <Trash2 size={24} color="#dc2626" />
            </div>
            <h3 style={{ fontSize: 18, fontWeight: 700, color: '#111827', margin: 0 }}>Delete Department</h3>
            <p style={{ fontSize: 13, color: '#64748b', marginTop: 8 }}>
              Are you sure you want to delete <strong>{selectedDepartment.name}</strong>?
            </p>

            <div style={{ display: 'flex', justifyContent: 'center', gap: 10, marginTop: 20 }}>
              <button
                disabled={actionLoading}
                onClick={() => setDeleteModalOpen(false)}
                style={{ background: '#e2e8f0', color: '#475569', border: 'none', borderRadius: 8, padding: '9px 18px', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}
              >
                Cancel
              </button>
              <button
                disabled={actionLoading}
                onClick={handleDeleteConfirm}
                style={{
                  background: '#dc2626', color: '#fff', border: 'none', borderRadius: 8,
                  padding: '9px 20px', fontSize: 13, fontWeight: 600, cursor: actionLoading ? 'not-allowed' : 'pointer',
                  display: 'flex', alignItems: 'center', gap: 6,
                }}
              >
                {actionLoading ? <Loader2 size={16} className="animate-spin" /> : null}
                <span>Delete</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
