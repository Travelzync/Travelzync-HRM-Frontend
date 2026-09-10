import { useState, useEffect, useMemo } from 'react'
import {
  UserCheck, Plus, Search, Edit2, Trash2, Loader2,
  AlertCircle, CheckCircle2, X, Shield, Users as UsersIcon
} from 'lucide-react'
import {
  getUsers, createUser, updateUser, deleteUser
} from '../../services/userService'
import { showSuccess, showError, showWarning } from '../../utils/toast'

export default function Users() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [roleFilter, setRoleFilter] = useState('ALL')

  // Notifications
  const [successMsg, setSuccessMsg] = useState('')
  const [errorMsg, setErrorMsg] = useState('')

  // Modals
  const [createModalOpen, setCreateModalOpen] = useState(false)
  const [editModalOpen, setEditModalOpen] = useState(false)
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState(null)

  // Form states
  const [createForm, setCreateForm] = useState({
    name: '',
    email: '',
    password: '',
    role: 'employee',
  })

  const [editForm, setEditForm] = useState({
    name: '',
    email: '',
    role: 'employee',
    isActive: true,
  })

  const fetchUsers = async () => {
    try {
      setLoading(true)
      const res = await getUsers()
      if (res?.users) {
        setUsers(res.users)
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to load user accounts'
      setErrorMsg(msg)
      showError(msg)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchUsers()
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

  // Filtered users
  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      const name = u.name || ''
      const email = u.email || ''
      const empId = u.employeeId || ''
      const matchesSearch =
        name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        empId.toLowerCase().includes(searchQuery.toLowerCase())

      const matchesRole = roleFilter === 'ALL' || u.role === roleFilter
      return matchesSearch && matchesRole
    })
  }, [users, searchQuery, roleFilter])

  // Handle Create Submit
  const handleCreate = async (e) => {
    e.preventDefault()
    if (!createForm.name.trim() || !createForm.email.trim() || !createForm.password.trim()) {
      const msg = 'Please fill in all required fields.'
      setErrorMsg(msg)
      showWarning(msg)
      return
    }

    try {
      setActionLoading(true)
      const res = await createUser({
        name: createForm.name.trim(),
        email: createForm.email.trim().toLowerCase(),
        password: createForm.password,
        role: createForm.role,
      })

      const msg = res.message || 'User account created successfully!'
      setSuccessMsg(msg)
      showSuccess(msg)
      setCreateModalOpen(false)
      setCreateForm({ name: '', email: '', password: '', role: 'employee' })
      fetchUsers()
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to create user account'
      setErrorMsg(msg)
      showError(msg)
    } finally {
      setActionLoading(false)
    }
  }

  // Handle Edit Open
  const handleOpenEdit = (user) => {
    setSelectedUser(user)
    setEditForm({
      name: user.name || '',
      email: user.email || '',
      role: user.role || 'employee',
      isActive: user.isActive ?? true,
    })
    setEditModalOpen(true)
  }

  // Handle Edit Submit
  const handleEdit = async (e) => {
    e.preventDefault()
    if (!selectedUser) return
    if (!editForm.name.trim() || !editForm.email.trim()) {
      const msg = 'Name and email are required.'
      setErrorMsg(msg)
      showWarning(msg)
      return
    }

    try {
      setActionLoading(true)
      const res = await updateUser(selectedUser._id, {
        name: editForm.name.trim(),
        email: editForm.email.trim().toLowerCase(),
        role: editForm.role,
        isActive: editForm.isActive,
      })

      const msg = res.message || 'User account updated successfully!'
      setSuccessMsg(msg)
      showSuccess(msg)
      setEditModalOpen(false)
      setSelectedUser(null)
      fetchUsers()
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to update user account'
      setErrorMsg(msg)
      showError(msg)
    } finally {
      setActionLoading(false)
    }
  }

  // Handle Delete
  const handleDeleteConfirm = async () => {
    if (!selectedUser) return

    try {
      setActionLoading(true)
      const res = await deleteUser(selectedUser._id)
      const msg = res.message || 'User account deleted successfully!'
      setSuccessMsg(msg)
      showSuccess(msg)
      setDeleteModalOpen(false)
      setSelectedUser(null)
      fetchUsers()
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to delete user account'
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
            <UserCheck size={22} color="#fff" />
          </div>
          <div>
            <h1 style={{ fontSize: 22, fontWeight: 700, color: '#111827' }}>User Management</h1>
            <p style={{ fontSize: 13, color: '#94a3b8', marginTop: 3 }}>
              Manage system authentication credentials, access roles (Admin & Employee), and account statuses.
            </p>
          </div>
        </div>

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
          <span>Add User Account</span>
        </button>
      </div>

      {/* Controls: Search & Role Filter */}
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
            placeholder="Search by name, email, ID..."
            style={{
              border: 'none', background: 'none', outline: 'none',
              fontSize: 13, color: '#334155', width: '100%',
            }}
          />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <label style={{ fontSize: 12, fontWeight: 600, color: '#64748b' }}>Role:</label>
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            style={{
              background: '#fff', border: '1px solid #e2e8f0', borderRadius: 8,
              padding: '8px 12px', fontSize: 13, color: '#334155', outline: 'none',
            }}
          >
            <option value="ALL">All Roles ({users.length})</option>
            <option value="admin">Admins ({users.filter(u => u.role === 'admin').length})</option>
            <option value="employee">Employees ({users.filter(u => u.role === 'employee').length})</option>
          </select>
        </div>
      </div>

      {/* Users Table */}
      <div style={{
        background: '#fff', border: '1px solid #e2e8f0', borderRadius: 14,
        boxShadow: '0 1px 3px rgba(0,0,0,0.02)', overflow: 'hidden',
      }}>
        {loading ? (
          <div style={{ padding: 48, textAlign: 'center', color: '#64748b' }}>
            <Loader2 size={32} className="animate-spin" style={{ margin: '0 auto 12px', color: '#c0392b' }} />
            <p style={{ fontSize: 14 }}>Loading user accounts...</p>
          </div>
        ) : filteredUsers.length === 0 ? (
          <div style={{ padding: 48, textAlign: 'center', color: '#94a3b8' }}>
            <UserCheck size={40} color="#cbd5e1" style={{ margin: '0 auto 12px' }} />
            <p style={{ fontSize: 15, fontWeight: 600, color: '#475569' }}>No users found</p>
            <p style={{ fontSize: 13, marginTop: 4 }}>
              {searchQuery || roleFilter !== 'ALL'
                ? 'Try adjusting your search query or role filter.'
                : 'Click "+ Add User Account" to create a new user.'}
            </p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }} className="hide-scroll">
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13, textAlign: 'left' }}>
              <thead>
                <tr style={{ background: '#c0392b', color: '#fff', borderBottom: '2px solid #922b21' }}>
                  {['User', 'Email', 'Employee ID', 'Role', 'Status', 'Last Login', 'Actions'].map((h) => (
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
                {filteredUsers.map((user, idx) => {
                  const initials = user.name
                    ? user.name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase()
                    : 'U'

                  return (
                    <tr
                      key={user._id}
                      style={{
                        borderBottom: '1px solid #f1f5f9',
                        background: idx % 2 === 1 ? '#fff5f5' : '#fff',
                      }}
                    >
                      {/* Name */}
                      <td style={{ padding: '14px 16px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <div style={{
                            width: 34, height: 34, borderRadius: '50%',
                            background: user.role === 'admin'
                              ? 'linear-gradient(135deg, #7c3aed, #4c1d95)'
                              : 'linear-gradient(135deg, #c0392b, #922b21)',
                            color: '#fff', display: 'flex', alignItems: 'center',
                            justifyContent: 'center', fontWeight: 700, fontSize: 12,
                          }}>
                            {initials}
                          </div>
                          <div>
                            <p style={{ fontWeight: 600, color: '#111827', margin: 0 }}>
                              {user.name}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Email */}
                      <td style={{ padding: '14px 16px', color: '#334155' }}>
                        {user.email}
                      </td>

                      {/* Employee ID */}
                      <td style={{ padding: '14px 16px' }}>
                        {user.employeeId ? (
                          <span style={{ fontWeight: 600, color: '#c0392b' }}>
                            {user.employeeId}
                          </span>
                        ) : (
                          <span style={{ color: '#94a3b8', fontStyle: 'italic' }}>
                            {user.role === 'admin' ? 'Admin (No ID)' : '-'}
                          </span>
                        )}
                      </td>

                      {/* Role */}
                      <td style={{ padding: '14px 16px' }}>
                        <span style={{
                          display: 'inline-flex', alignItems: 'center', gap: 4,
                          padding: '3px 10px', borderRadius: 6,
                          fontSize: 11, fontWeight: 700, textTransform: 'uppercase',
                          background: user.role === 'admin' ? '#fef2f2' : '#f8fafc',
                          color: user.role === 'admin' ? '#c0392b' : '#475569',
                          border: user.role === 'admin' ? '1px solid #fee2e2' : '1px solid #e2e8f0',
                        }}>
                          {user.role === 'admin' ? <Shield size={12} /> : <UsersIcon size={12} />}
                          <span>{user.role}</span>
                        </span>
                      </td>

                      {/* Status */}
                      <td style={{ padding: '14px 16px' }}>
                        <span style={{
                          display: 'inline-block', padding: '3px 10px', borderRadius: 6,
                          fontSize: 11, fontWeight: 700,
                          background: user.isActive ? '#f0fdf4' : '#fef2f2',
                          color: user.isActive ? '#16a34a' : '#dc2626',
                        }}>
                          {user.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>

                      {/* Last Login */}
                      <td style={{ padding: '14px 16px', color: '#64748b', fontSize: 12 }}>
                        {user.lastLoginAt ? new Date(user.lastLoginAt).toLocaleString() : 'Never logged in'}
                      </td>

                      {/* Actions */}
                      <td style={{ padding: '14px 16px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <button
                            title="Edit User"
                            onClick={() => handleOpenEdit(user)}
                            style={{
                              background: '#f8fafc', border: '1px solid #e2e8f0',
                              borderRadius: 6, padding: '6px', cursor: 'pointer',
                              color: '#c0392b',
                            }}
                          >
                            <Edit2 size={14} />
                          </button>

                          {user.role !== 'admin' && (
                            <button
                              title="Delete User"
                              onClick={() => {
                                setSelectedUser(user)
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
                          )}
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ========================================================
          CREATE USER MODAL
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
              <h3 style={{ fontSize: 18, fontWeight: 700, color: '#c0392b', margin: 0 }}>Add New User Account</h3>
              <button
                onClick={() => setCreateModalOpen(false)}
                style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: '#374151', textTransform: 'uppercase', marginBottom: 4 }}>Full Name *</label>
                <input
                  required
                  type="text"
                  value={createForm.name}
                  onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })}
                  placeholder="e.g. Rahul Sharma"
                  style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 13, outline: 'none' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: '#374151', textTransform: 'uppercase', marginBottom: 4 }}>Email Address *</label>
                <input
                  required
                  type="email"
                  value={createForm.email}
                  onChange={(e) => setCreateForm({ ...createForm, email: e.target.value })}
                  placeholder="user@company.com"
                  style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 13, outline: 'none' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: '#374151', textTransform: 'uppercase', marginBottom: 4 }}>Password *</label>
                <input
                  required
                  type="password"
                  value={createForm.password}
                  onChange={(e) => setCreateForm({ ...createForm, password: e.target.value })}
                  placeholder="Minimum 6 characters"
                  style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 13, outline: 'none' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: '#374151', textTransform: 'uppercase', marginBottom: 4 }}>Account Role *</label>
                <select
                  value={createForm.role}
                  onChange={(e) => setCreateForm({ ...createForm, role: e.target.value })}
                  style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 13, outline: 'none', background: '#fff' }}
                >
                  <option value="employee">Employee (Generates Employee ID)</option>
                  <option value="admin">Administrator</option>
                </select>
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
                  <span>Create User</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================
          EDIT USER MODAL
      ======================================================== */}
      {editModalOpen && selectedUser && (
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
              <h3 style={{ fontSize: 18, fontWeight: 700, color: '#c0392b', margin: 0 }}>Edit User Account</h3>
              <button
                onClick={() => setEditModalOpen(false)}
                style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleEdit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: '#374151', textTransform: 'uppercase', marginBottom: 4 }}>Full Name</label>
                <input
                  required
                  type="text"
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 13, outline: 'none' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: '#374151', textTransform: 'uppercase', marginBottom: 4 }}>Email Address</label>
                <input
                  required
                  type="email"
                  value={editForm.email}
                  onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                  style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 13, outline: 'none' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: '#374151', textTransform: 'uppercase', marginBottom: 4 }}>Role</label>
                <select
                  value={editForm.role}
                  onChange={(e) => setEditForm({ ...editForm, role: e.target.value })}
                  style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 13, outline: 'none', background: '#fff' }}
                >
                  <option value="employee">Employee</option>
                  <option value="admin">Administrator</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: '#374151', textTransform: 'uppercase', marginBottom: 4 }}>Account Status</label>
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
                  <span>Update User</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================
          DELETE USER CONFIRMATION MODAL
      ======================================================== */}
      {deleteModalOpen && selectedUser && (
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
            <h3 style={{ fontSize: 18, fontWeight: 700, color: '#111827', margin: 0 }}>Delete User Account</h3>
            <p style={{ fontSize: 13, color: '#64748b', marginTop: 8 }}>
              Are you sure you want to delete user account <strong>{selectedUser.name}</strong> ({selectedUser.email})?
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
