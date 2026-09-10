import { useState, useEffect, useMemo } from 'react'
import { Link } from 'react-router-dom'
import {
  Briefcase, Plus, Search, Edit2, Trash2, Loader2,
  AlertCircle, CheckCircle2, X, Building2
} from 'lucide-react'
import {
  getDesignations, createDesignation, updateDesignation, deleteDesignation
} from '../../services/designationService'
import { getDepartments } from '../../services/departmentService'
import { showSuccess, showError, showWarning } from '../../utils/toast'

export default function Designations() {
  const [designations, setDesignations] = useState([])
  const [departments, setDepartments] = useState([])
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [deptFilter, setDeptFilter] = useState('ALL')

  // Notifications
  const [successMsg, setSuccessMsg] = useState('')
  const [errorMsg, setErrorMsg] = useState('')

  // Modals
  const [createModalOpen, setCreateModalOpen] = useState(false)
  const [editModalOpen, setEditModalOpen] = useState(false)
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [selectedDesignation, setSelectedDesignation] = useState(null)

  // Forms
  const [createForm, setCreateForm] = useState({ name: '', departmentId: '', description: '' })
  const [editForm, setEditForm] = useState({ name: '', departmentId: '', description: '', isActive: true })

  const fetchData = async () => {
    try {
      setLoading(true)
      const [desRes, deptRes] = await Promise.all([
        getDesignations(),
        getDepartments(),
      ])

      if (desRes?.designations) {
        setDesignations(desRes.designations)
      }
      if (deptRes?.departments) {
        setDepartments(deptRes.departments)
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to load designations'
      setErrorMsg(msg)
      showError(msg)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
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

  const filteredDesignations = useMemo(() => {
    return designations.filter((d) => {
      const nameMatch = d.name.toLowerCase().includes(searchQuery.toLowerCase())
      const descMatch = d.description && d.description.toLowerCase().includes(searchQuery.toLowerCase())
      const deptMatch = d.departmentId?.name && d.departmentId.name.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesSearch = nameMatch || descMatch || deptMatch

      const matchesDept = deptFilter === 'ALL' || d.departmentId?._id === deptFilter
      return matchesSearch && matchesDept
    })
  }, [designations, searchQuery, deptFilter])

  // Handle Create
  const handleCreate = async (e) => {
    e.preventDefault()
    if (!createForm.name.trim() || !createForm.departmentId) {
      const msg = 'Designation name and department are required'
      setErrorMsg(msg)
      showWarning(msg)
      return
    }

    try {
      setActionLoading(true)
      const res = await createDesignation(createForm)
      const msg = res.message || 'Designation created successfully!'
      setSuccessMsg(msg)
      showSuccess(msg)
      setCreateModalOpen(false)
      setCreateForm({ name: '', departmentId: '', description: '' })
      fetchData()
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to create designation'
      setErrorMsg(msg)
      showError(msg)
    } finally {
      setActionLoading(false)
    }
  }

  // Handle Edit Open
  const handleOpenEdit = (des) => {
    setSelectedDesignation(des)
    setEditForm({
      name: des.name,
      departmentId: des.departmentId?._id || '',
      description: des.description || '',
      isActive: des.isActive ?? true,
    })
    setEditModalOpen(true)
  }

  // Handle Edit Submit
  const handleEdit = async (e) => {
    e.preventDefault()
    if (!selectedDesignation) return
    if (!editForm.name.trim() || !editForm.departmentId) {
      const msg = 'Designation name and department are required'
      setErrorMsg(msg)
      showWarning(msg)
      return
    }

    try {
      setActionLoading(true)
      const res = await updateDesignation(selectedDesignation._id, editForm)
      const msg = res.message || 'Designation updated successfully!'
      setSuccessMsg(msg)
      showSuccess(msg)
      setEditModalOpen(false)
      setSelectedDesignation(null)
      fetchData()
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to update designation'
      setErrorMsg(msg)
      showError(msg)
    } finally {
      setActionLoading(false)
    }
  }

  // Handle Delete
  const handleDeleteConfirm = async () => {
    if (!selectedDesignation) return

    try {
      setActionLoading(true)
      const res = await deleteDesignation(selectedDesignation._id)
      const msg = res.message || 'Designation deleted successfully!'
      setSuccessMsg(msg)
      showSuccess(msg)
      setDeleteModalOpen(false)
      setSelectedDesignation(null)
      fetchData()
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to delete designation'
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
            <Briefcase size={22} color="#fff" />
          </div>
          <div>
            <h1 style={{ fontSize: 22, fontWeight: 700, color: '#111827' }}>Designation Management</h1>
            <p style={{ fontSize: 13, color: '#94a3b8', marginTop: 3 }}>
              Manage job titles, positions, and department hierarchy.
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <Link
            to="/admin/departments"
            style={{
              display: 'flex', alignItems: 'center', gap: 6,
              background: '#fff5f5', color: '#c0392b', border: '1px solid #fecaca',
              borderRadius: 8, padding: '9px 16px', fontSize: 13, fontWeight: 600,
              textDecoration: 'none',
            }}
          >
            <Building2 size={15} />
            <span>Departments</span>
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
            <span>Add Designation</span>
          </button>
        </div>
      </div>

      {/* Controls: Search & Department filter */}
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        flexWrap: 'wrap', gap: 12,
      }}>
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
            placeholder="Search designations..."
            style={{
              border: 'none', background: 'none', outline: 'none',
              fontSize: 13, color: '#334155', width: '100%',
            }}
          />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <label style={{ fontSize: 12, fontWeight: 600, color: '#64748b' }}>Department:</label>
          <select
            value={deptFilter}
            onChange={(e) => setDeptFilter(e.target.value)}
            style={{
              background: '#fff', border: '1px solid #e2e8f0', borderRadius: 8,
              padding: '8px 12px', fontSize: 13, color: '#334155', outline: 'none',
            }}
          >
            <option value="ALL">All Departments</option>
            {departments.map((d) => (
              <option key={d._id} value={d._id}>
                {d.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Designations Table */}
      <div style={{
        background: '#fff', border: '1px solid #e2e8f0', borderRadius: 14,
        boxShadow: '0 1px 3px rgba(0,0,0,0.02)', overflow: 'hidden',
      }}>
        {loading ? (
          <div style={{ padding: 48, textAlign: 'center', color: '#64748b' }}>
            <Loader2 size={32} className="animate-spin" style={{ margin: '0 auto 12px', color: '#c0392b' }} />
            <p style={{ fontSize: 14 }}>Loading designations...</p>
          </div>
        ) : filteredDesignations.length === 0 ? (
          <div style={{ padding: 48, textAlign: 'center', color: '#94a3b8' }}>
            <Briefcase size={40} color="#cbd5e1" style={{ margin: '0 auto 12px' }} />
            <p style={{ fontSize: 15, fontWeight: 600, color: '#475569' }}>No designations found</p>
            <p style={{ fontSize: 13, marginTop: 4 }}>
              {searchQuery || deptFilter !== 'ALL'
                ? 'Try adjusting your search query or department filter.'
                : 'Click "+ Add Designation" to define your organization’s first role.'}
            </p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }} className="hide-scroll">
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13, textAlign: 'left' }}>
              <thead>
                <tr style={{ background: '#c0392b', color: '#fff', borderBottom: '2px solid #922b21' }}>
                  {['Designation Title', 'Department', 'Description', 'Status', 'Actions'].map((h) => (
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
                {filteredDesignations.map((des, idx) => (
                  <tr
                    key={des._id}
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
                          <Briefcase size={16} />
                        </div>
                        <span>{des.name}</span>
                      </div>
                    </td>
                    <td style={{ padding: '14px 16px', color: '#334155', fontWeight: 500 }}>
                      {des.departmentId?.name || 'Unassigned'}
                    </td>
                    <td style={{ padding: '14px 16px', color: '#64748b', maxWidth: 300 }}>
                      {des.description || '-'}
                    </td>
                    <td style={{ padding: '14px 16px' }}>
                      <span style={{
                        display: 'inline-block',
                        padding: '3px 10px', borderRadius: 6,
                        fontSize: 11, fontWeight: 700,
                        background: des.isActive ? '#f0fdf4' : '#fef2f2',
                        color: des.isActive ? '#16a34a' : '#dc2626',
                      }}>
                        {des.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td style={{ padding: '14px 16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <button
                          title="Edit Designation"
                          onClick={() => handleOpenEdit(des)}
                          style={{
                            background: '#f8fafc', border: '1px solid #e2e8f0',
                            borderRadius: 6, padding: '6px', cursor: 'pointer',
                            color: '#c0392b',
                          }}
                        >
                          <Edit2 size={14} />
                        </button>
                        <button
                          title="Delete Designation"
                          onClick={() => {
                            setSelectedDesignation(des)
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
          CREATE DESIGNATION MODAL
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
              <h3 style={{ fontSize: 18, fontWeight: 700, color: '#c0392b', margin: 0 }}>Add New Designation</h3>
              <button
                onClick={() => setCreateModalOpen(false)}
                style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: '#374151', textTransform: 'uppercase', marginBottom: 4 }}>Department *</label>
                <select
                  required
                  value={createForm.departmentId}
                  onChange={(e) => setCreateForm({ ...createForm, departmentId: e.target.value })}
                  style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 13, outline: 'none', background: '#fff' }}
                >
                  <option value="">Select Department</option>
                  {departments.filter(d => d.isActive).map((d) => (
                    <option key={d._id} value={d._id}>{d.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: '#374151', textTransform: 'uppercase', marginBottom: 4 }}>Designation Title *</label>
                <input
                  required
                  type="text"
                  value={createForm.name}
                  onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })}
                  placeholder="e.g. Senior Software Engineer, HR Manager"
                  style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 13, outline: 'none' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: '#374151', textTransform: 'uppercase', marginBottom: 4 }}>Description</label>
                <textarea
                  rows={3}
                  value={createForm.description}
                  onChange={(e) => setCreateForm({ ...createForm, description: e.target.value })}
                  placeholder="Responsibilities or requirements"
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
                  <span>Save Designation</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================
          EDIT DESIGNATION MODAL
      ======================================================== */}
      {editModalOpen && selectedDesignation && (
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
              <h3 style={{ fontSize: 18, fontWeight: 700, color: '#c0392b', margin: 0 }}>Edit Designation</h3>
              <button
                onClick={() => setEditModalOpen(false)}
                style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleEdit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: '#374151', textTransform: 'uppercase', marginBottom: 4 }}>Department *</label>
                <select
                  required
                  value={editForm.departmentId}
                  onChange={(e) => setEditForm({ ...editForm, departmentId: e.target.value })}
                  style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 13, outline: 'none', background: '#fff' }}
                >
                  <option value="">Select Department</option>
                  {departments.map((d) => (
                    <option key={d._id} value={d._id}>{d.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: '#374151', textTransform: 'uppercase', marginBottom: 4 }}>Designation Title *</label>
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
                  <span>Update Designation</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================
          DELETE CONFIRMATION MODAL
      ======================================================== */}
      {deleteModalOpen && selectedDesignation && (
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
            <h3 style={{ fontSize: 18, fontWeight: 700, color: '#111827', margin: 0 }}>Delete Designation</h3>
            <p style={{ fontSize: 13, color: '#64748b', marginTop: 8 }}>
              Are you sure you want to delete <strong>{selectedDesignation.name}</strong>?
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
