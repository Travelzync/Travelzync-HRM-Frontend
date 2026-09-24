import { useState, useEffect, useMemo } from 'react'
import {
  Users, Search, Plus, Edit2, Trash2, Eye, X, Loader2, AlertCircle,
  CheckCircle2, Building2, Briefcase, Mail, Phone, Calendar, MapPin, User
} from 'lucide-react'
import { getEmployees, createEmployee, updateEmployee, deleteEmployee } from '../../services/employeeService'
import { getDepartments } from '../../services/departmentService'
import { getDesignationsByDepartment, getDesignations } from '../../services/designationService'
import { API_BASE_URL } from '../../services/apiClient'
import { showSuccess, showError, showWarning } from '../../utils/toast'

export default function Employees() {
  const [employees, setEmployees] = useState([])
  const [departments, setDepartments] = useState([])
  const [designations, setDesignations] = useState([])
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [deptFilter, setDeptFilter] = useState('ALL')

  // Notification banners
  const [successMsg, setSuccessMsg] = useState('')
  const [errorMsg, setErrorMsg] = useState('')

  // Modals state
  const [createModalOpen, setCreateModalOpen] = useState(false)
  const [editModalOpen, setEditModalOpen] = useState(false)
  const [viewModalOpen, setViewModalOpen] = useState(false)
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)

  // Selected employee for view/edit/delete
  const [selectedEmployee, setSelectedEmployee] = useState(null)

  // Form states for create
  const [createForm, setCreateForm] = useState({
    employeeId: '',
    name: '',
    email: '',
    password: '',
    phone: '',
    dateOfBirth: '',
    gender: 'male',
    departmentId: '',
    designationId: '',
    joiningDate: new Date().toISOString().split('T')[0],
    employmentType: 'full-time',
    workLocation: '',
    profilePhoto: null,
  })

  // Form states for edit
  const [editForm, setEditForm] = useState({
    employeeId: '',
    name: '',
    email: '',
    phone: '',
    dateOfBirth: '',
    gender: 'male',
    departmentId: '',
    designationId: '',
    joiningDate: '',
    employmentType: 'full-time',
    workLocation: '',
    isActive: true,
    profilePhoto: null,
  })

  // Load initial data
  const fetchData = async () => {
    try {
      setLoading(true)
      const [empRes, deptRes] = await Promise.all([
        getEmployees(),
        getDepartments(),
      ])

      if (empRes?.employees) {
        setEmployees(empRes.employees)
      }
      if (deptRes?.departments) {
        setDepartments(deptRes.departments)
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to load employees data'
      setErrorMsg(msg)
      showError(msg)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  // Auto-dismiss notifications after 4s
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

  // Fetch designations when department changes in Create Form
  useEffect(() => {
    if (createForm.departmentId) {
      getDesignationsByDepartment(createForm.departmentId)
        .then((res) => {
          setDesignations(res.designations || [])
          setCreateForm((prev) => ({ ...prev, designationId: '' }))
        })
        .catch(() => setDesignations([]))
    } else {
      setDesignations([])
    }
  }, [createForm.departmentId])

  // Fetch designations when department changes in Edit Form
  const [editDesignations, setEditDesignations] = useState([])
  useEffect(() => {
    if (editForm.departmentId) {
      getDesignationsByDepartment(editForm.departmentId)
        .then((res) => {
          setEditDesignations(res.designations || [])
        })
        .catch(() => setEditDesignations([]))
    } else {
      setEditDesignations([])
    }
  }, [editForm.departmentId])

  // Filtered employees
  const filteredEmployees = useMemo(() => {
    return employees.filter((emp) => {
      const name = emp.userId?.name || ''
      const email = emp.userId?.email || ''
      const empId = emp.userId?.employeeId || ''
      const dept = emp.departmentId?.name || ''
      const matchesSearch =
        name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        empId.toLowerCase().includes(searchQuery.toLowerCase()) ||
        dept.toLowerCase().includes(searchQuery.toLowerCase())

      const matchesDept = deptFilter === 'ALL' || emp.departmentId?._id === deptFilter
      return matchesSearch && matchesDept
    })
  }, [employees, searchQuery, deptFilter])

  // Open Edit Modal with selected employee data
  const handleOpenEdit = (emp) => {
    setSelectedEmployee(emp)
    setEditForm({
      employeeId: emp.userId?.employeeId || '',
      name: emp.userId?.name || '',
      email: emp.userId?.email || '',
      phone: emp.phone || '',
      dateOfBirth: emp.dateOfBirth ? emp.dateOfBirth.split('T')[0] : '',
      gender: emp.gender || 'male',
      departmentId: emp.departmentId?._id || '',
      designationId: emp.designationId?._id || '',
      joiningDate: emp.joiningDate ? emp.joiningDate.split('T')[0] : '',
      employmentType: emp.employmentType || 'full-time',
      workLocation: emp.workLocation || '',
      isActive: emp.userId?.isActive ?? true,
      profilePhoto: null,
    })
    setEditModalOpen(true)
  }

  // Handle Create Submit
  const handleCreateSubmit = async (e) => {
    e.preventDefault()
    if (!createForm.name || !createForm.email || !createForm.password || !createForm.departmentId || !createForm.designationId || !createForm.joiningDate) {
      const msg = 'Please fill in all required fields.'
      setErrorMsg(msg)
      showWarning(msg)
      return
    }

    try {
      setActionLoading(true)
      const formData = new FormData()
      if (createForm.employeeId && createForm.employeeId.trim()) {
        formData.append('employeeId', createForm.employeeId.trim())
      }
      formData.append('name', createForm.name)
      formData.append('email', createForm.email)
      formData.append('password', createForm.password)
      formData.append('departmentId', createForm.departmentId)
      formData.append('designationId', createForm.designationId)
      formData.append('joiningDate', createForm.joiningDate)
      if (createForm.phone) formData.append('phone', createForm.phone)
      if (createForm.dateOfBirth) formData.append('dateOfBirth', createForm.dateOfBirth)
      if (createForm.gender) formData.append('gender', createForm.gender)
      if (createForm.employmentType) formData.append('employmentType', createForm.employmentType)
      if (createForm.workLocation) formData.append('workLocation', createForm.workLocation)
      if (createForm.profilePhoto) formData.append('profilePhoto', createForm.profilePhoto)

      const res = await createEmployee(formData)
      const msg = res.message || 'Employee created successfully!'
      setSuccessMsg(msg)
      showSuccess(msg)
      setCreateModalOpen(false)
      setCreateForm({
        employeeId: '',
        name: '',
        email: '',
        password: '',
        phone: '',
        dateOfBirth: '',
        gender: 'male',
        departmentId: '',
        designationId: '',
        joiningDate: new Date().toISOString().split('T')[0],
        employmentType: 'full-time',
        workLocation: '',
        profilePhoto: null,
      })
      fetchData()
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to create employee'
      setErrorMsg(msg)
      showError(msg)
    } finally {
      setActionLoading(false)
    }
  }

  // Handle Edit Submit
  const handleEditSubmit = async (e) => {
    e.preventDefault()
    if (!selectedEmployee) return

    try {
      setActionLoading(true)
      const formData = new FormData()
      if (editForm.employeeId && editForm.employeeId.trim()) {
        formData.append('employeeId', editForm.employeeId.trim())
      }
      formData.append('name', editForm.name)
      formData.append('email', editForm.email)
      formData.append('phone', editForm.phone)
      if (editForm.dateOfBirth) formData.append('dateOfBirth', editForm.dateOfBirth)
      formData.append('gender', editForm.gender)
      formData.append('departmentId', editForm.departmentId)
      formData.append('designationId', editForm.designationId)
      formData.append('joiningDate', editForm.joiningDate)
      formData.append('employmentType', editForm.employmentType)
      formData.append('workLocation', editForm.workLocation)
      formData.append('isActive', editForm.isActive)
      if (editForm.profilePhoto) formData.append('profilePhoto', editForm.profilePhoto)

      const res = await updateEmployee(selectedEmployee._id, formData)
      const msg = res.message || 'Employee updated successfully!'
      setSuccessMsg(msg)
      showSuccess(msg)
      setEditModalOpen(false)
      setSelectedEmployee(null)
      fetchData()
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to update employee'
      setErrorMsg(msg)
      showError(msg)
    } finally {
      setActionLoading(false)
    }
  }

  // Handle Delete
  const handleDeleteConfirm = async () => {
    if (!selectedEmployee) return

    try {
      setActionLoading(true)
      const res = await deleteEmployee(selectedEmployee._id)
      const msg = res.message || 'Employee deleted successfully!'
      setSuccessMsg(msg)
      showSuccess(msg)
      setDeleteModalOpen(false)
      setSelectedEmployee(null)
      fetchData()
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to delete employee'
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
            <Users size={22} color="#fff" />
          </div>
          <div>
            <h1 style={{ fontSize: 22, fontWeight: 700, color: '#111827' }}>Employee Management</h1>
            <p style={{ fontSize: 13, color: '#94a3b8', marginTop: 3 }}>
              Manage, onboard, update and track all employees in the organization.
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
            transition: 'opacity 0.15s',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.92')}
          onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}
        >
          <Plus size={16} />
          <span>Add Employee</span>
        </button>
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
            placeholder="Search by name, ID, email..."
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
            <option value="ALL">All Departments ({employees.length})</option>
            {departments.map((d) => (
              <option key={d._id} value={d._id}>
                {d.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Employees Table Card */}
      <div style={{
        background: '#fff', border: '1px solid #e2e8f0', borderRadius: 14,
        boxShadow: '0 1px 3px rgba(0,0,0,0.02)', overflow: 'hidden',
      }}>
        {loading ? (
          <div style={{ padding: 48, textAlign: 'center', color: '#64748b' }}>
            <Loader2 size={32} className="animate-spin" style={{ margin: '0 auto 12px', color: '#c0392b' }} />
            <p style={{ fontSize: 14 }}>Loading organization employees...</p>
          </div>
        ) : filteredEmployees.length === 0 ? (
          <div style={{ padding: 48, textAlign: 'center', color: '#94a3b8' }}>
            <Users size={40} color="#cbd5e1" style={{ margin: '0 auto 12px' }} />
            <p style={{ fontSize: 15, fontWeight: 600, color: '#475569' }}>No employees found</p>
            <p style={{ fontSize: 13, marginTop: 4 }}>
              {searchQuery || deptFilter !== 'ALL'
                ? 'Try adjusting your search query or department filter.'
                : 'Click "+ Add Employee" above to onboard your first team member.'}
            </p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }} className="hide-scroll">
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13, textAlign: 'left' }}>
              <thead>
                <tr style={{ background: '#c0392b', color: '#fff', borderBottom: '2px solid #922b21' }}>
                  {['Employee', 'Department & Role', 'Contact', 'Type & Location', 'Joining Date', 'Status', 'Actions'].map((h) => (
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
                {filteredEmployees.map((emp, idx) => {
                  const photoUrl = emp.profilePhoto
                    ? emp.profilePhoto.startsWith('http')
                      ? emp.profilePhoto
                      : `${API_BASE_URL}${emp.profilePhoto}`
                    : null

                  const initials = emp.userId?.name
                    ? emp.userId.name
                        .split(' ')
                        .map((n) => n[0])
                        .slice(0, 2)
                        .join('')
                        .toUpperCase()
                    : 'EP'

                  return (
                    <tr
                      key={emp._id}
                      style={{
                        borderBottom: '1px solid #f1f5f9',
                        background: idx % 2 === 1 ? '#fff5f5' : '#fff',
                        transition: 'background 0.15s',
                      }}
                    >
                      {/* Employee Name & ID */}
                      <td style={{ padding: '14px 16px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                          {photoUrl ? (
                            <img
                              src={photoUrl}
                              alt={emp.userId?.name}
                              style={{
                                width: 38, height: 38, borderRadius: '50%',
                                objectFit: 'cover', border: '1px solid #e2e8f0',
                              }}
                              onError={(e) => {
                                e.currentTarget.style.display = 'none'
                              }}
                            />
                          ) : (
                            <div style={{
                              width: 38, height: 38, borderRadius: '50%',
                              background: 'linear-gradient(135deg, #c0392b, #922b21)',
                              color: '#fff', display: 'flex', alignItems: 'center',
                              justifyContent: 'center', fontWeight: 700, fontSize: 13,
                              flexShrink: 0,
                            }}>
                              {initials}
                            </div>
                          )}
                          <div>
                            <p style={{ fontWeight: 600, color: '#111827', margin: 0 }}>
                              {emp.userId?.name || 'Unnamed'}
                            </p>
                            <p style={{ fontSize: 11, color: '#c0392b', fontWeight: 600, margin: '2px 0 0' }}>
                              {emp.userId?.employeeId || 'No ID'}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Department & Designation */}
                      <td style={{ padding: '14px 16px' }}>
                        <p style={{ fontWeight: 600, color: '#334155', margin: 0 }}>
                          {emp.designationId?.name || '-'}
                        </p>
                        <p style={{ fontSize: 11, color: '#64748b', margin: '2px 0 0' }}>
                          {emp.departmentId?.name || 'General'}
                        </p>
                      </td>

                      {/* Contact */}
                      <td style={{ padding: '14px 16px' }}>
                        <p style={{ color: '#334155', margin: 0 }}>{emp.userId?.email || '-'}</p>
                        <p style={{ fontSize: 11, color: '#64748b', margin: '2px 0 0' }}>{emp.phone || '-'}</p>
                      </td>

                      {/* Type & Location */}
                      <td style={{ padding: '14px 16px' }}>
                        <p style={{ textTransform: 'capitalize', color: '#334155', margin: 0 }}>
                          {emp.employmentType || 'full-time'}
                        </p>
                        <p style={{ fontSize: 11, color: '#64748b', margin: '2px 0 0' }}>
                          {emp.workLocation || 'Office'}
                        </p>
                      </td>

                      {/* Joining Date */}
                      <td style={{ padding: '14px 16px', color: '#475569' }}>
                        {emp.joiningDate ? new Date(emp.joiningDate).toLocaleDateString() : '-'}
                      </td>

                      {/* Status */}
                      <td style={{ padding: '14px 16px' }}>
                        <span style={{
                          display: 'inline-block',
                          padding: '3px 10px', borderRadius: 6,
                          fontSize: 11, fontWeight: 700,
                          background: emp.userId?.isActive ? '#f0fdf4' : '#fef2f2',
                          color: emp.userId?.isActive ? '#16a34a' : '#dc2626',
                        }}>
                          {emp.userId?.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>

                      {/* Actions */}
                      <td style={{ padding: '14px 16px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <button
                            title="View Employee Profile"
                            onClick={() => {
                              setSelectedEmployee(emp)
                              setViewModalOpen(true)
                            }}
                            style={{
                              background: '#f8fafc', border: '1px solid #e2e8f0',
                              borderRadius: 6, padding: '6px', cursor: 'pointer',
                              color: '#475569',
                            }}
                          >
                            <Eye size={14} />
                          </button>
                          <button
                            title="Edit Employee"
                            onClick={() => handleOpenEdit(emp)}
                            style={{
                              background: '#f8fafc', border: '1px solid #e2e8f0',
                              borderRadius: 6, padding: '6px', cursor: 'pointer',
                              color: '#c0392b',
                            }}
                          >
                            <Edit2 size={14} />
                          </button>
                          <button
                            title="Delete Employee"
                            onClick={() => {
                              setSelectedEmployee(emp)
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
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ========================================================
          CREATE EMPLOYEE MODAL
      ======================================================== */}
      {createModalOpen && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.45)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 9999, padding: 16,
        }}>
          <div style={{
            background: '#fff', borderRadius: 16, width: '100%', maxWidth: 640,
            maxHeight: '90vh', overflowY: 'auto', padding: 24,
            boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <div>
                <h3 style={{ fontSize: 18, fontWeight: 700, color: '#c0392b', margin: 0 }}>Add New Employee</h3>
                <p style={{ fontSize: 12, color: '#64748b', margin: '2px 0 0' }}>Enter details to onboard a new employee to TravelZync HRM.</p>
              </div>
              <button
                onClick={() => setCreateModalOpen(false)}
                style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {/* Employee ID (Optional / Auto) */}
              <div>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: '#374151', textTransform: 'uppercase', marginBottom: 4 }}>
                  Employee ID <span style={{ color: '#64748b', fontWeight: 400, textTransform: 'none' }}>(Optional - leave blank to auto-generate e.g. TZ-EMP-001)</span>
                </label>
                <input
                  type="text"
                  value={createForm.employeeId}
                  onChange={(e) => setCreateForm({ ...createForm, employeeId: e.target.value.toUpperCase() })}
                  placeholder="e.g. TZ-EMP-001"
                  style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 13, outline: 'none' }}
                />
              </div>

              {/* Name & Email */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: '#374151', textTransform: 'uppercase', marginBottom: 4 }}>Full Name *</label>
                  <input
                    required
                    type="text"
                    value={createForm.name}
                    onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })}
                    placeholder="e.g. John Doe"
                    style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 13, outline: 'none' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: '#374151', textTransform: 'uppercase', marginBottom: 4 }}>Work Email *</label>
                  <input
                    required
                    type="email"
                    value={createForm.email}
                    onChange={(e) => setCreateForm({ ...createForm, email: e.target.value })}
                    placeholder="john@travelzync.com"
                    style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 13, outline: 'none' }}
                  />
                </div>
              </div>

              {/* Password & Phone */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
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
                  <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: '#374151', textTransform: 'uppercase', marginBottom: 4 }}>Phone</label>
                  <input
                    type="tel"
                    value={createForm.phone}
                    onChange={(e) => setCreateForm({ ...createForm, phone: e.target.value })}
                    placeholder="+91 9876543210"
                    style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 13, outline: 'none' }}
                  />
                </div>
              </div>

              {/* Department & Designation */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
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
                  <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: '#374151', textTransform: 'uppercase', marginBottom: 4 }}>Designation *</label>
                  <select
                    required
                    disabled={!createForm.departmentId}
                    value={createForm.designationId}
                    onChange={(e) => setCreateForm({ ...createForm, designationId: e.target.value })}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 13, outline: 'none', background: '#fff' }}
                  >
                    <option value="">{createForm.departmentId ? 'Select Designation' : 'Select Department first'}</option>
                    {designations.map((des) => (
                      <option key={des._id} value={des._id}>{des.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Joining Date & Employment Type */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: '#374151', textTransform: 'uppercase', marginBottom: 4 }}>Joining Date *</label>
                  <input
                    required
                    type="date"
                    value={createForm.joiningDate}
                    onChange={(e) => setCreateForm({ ...createForm, joiningDate: e.target.value })}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 13, outline: 'none' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: '#374151', textTransform: 'uppercase', marginBottom: 4 }}>Employment Type</label>
                  <select
                    value={createForm.employmentType}
                    onChange={(e) => setCreateForm({ ...createForm, employmentType: e.target.value })}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 13, outline: 'none', background: '#fff' }}
                  >
                    <option value="full-time">Full-time</option>
                    <option value="part-time">Part-time</option>
                    <option value="contract">Contract</option>
                    <option value="internship">Internship</option>
                  </select>
                </div>
              </div>

              {/* Work Location, Gender, Date of Birth */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: '#374151', textTransform: 'uppercase', marginBottom: 4 }}>Work Location</label>
                  <input
                    type="text"
                    value={createForm.workLocation}
                    onChange={(e) => setCreateForm({ ...createForm, workLocation: e.target.value })}
                    placeholder="e.g. Bangalore / Remote"
                    style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 13, outline: 'none' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: '#374151', textTransform: 'uppercase', marginBottom: 4 }}>Gender</label>
                  <select
                    value={createForm.gender}
                    onChange={(e) => setCreateForm({ ...createForm, gender: e.target.value })}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 13, outline: 'none', background: '#fff' }}
                  >
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: '#374151', textTransform: 'uppercase', marginBottom: 4 }}>Date of Birth</label>
                  <input
                    type="date"
                    value={createForm.dateOfBirth}
                    onChange={(e) => setCreateForm({ ...createForm, dateOfBirth: e.target.value })}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 13, outline: 'none' }}
                  />
                </div>
              </div>

              {/* Profile Photo */}
              <div>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: '#374151', textTransform: 'uppercase', marginBottom: 4 }}>Profile Photo (Optional)</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setCreateForm({ ...createForm, profilePhoto: e.target.files[0] || null })}
                  style={{ width: '100%', fontSize: 13, color: '#64748b' }}
                />
              </div>

              {/* Buttons */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 12 }}>
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
                  <span>Save Employee</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================
          EDIT EMPLOYEE MODAL
      ======================================================== */}
      {editModalOpen && selectedEmployee && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.45)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 9999, padding: 16,
        }}>
          <div style={{
            background: '#fff', borderRadius: 16, width: '100%', maxWidth: 640,
            maxHeight: '90vh', overflowY: 'auto', padding: 24,
            boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <div>
                <h3 style={{ fontSize: 18, fontWeight: 700, color: '#c0392b', margin: 0 }}>Edit Employee</h3>
                <p style={{ fontSize: 12, color: '#64748b', margin: '2px 0 0' }}>Update details for {selectedEmployee.userId?.employeeId} ({selectedEmployee.userId?.name})</p>
              </div>
              <button
                onClick={() => setEditModalOpen(false)}
                style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {/* Employee ID */}
              <div>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: '#374151', textTransform: 'uppercase', marginBottom: 4 }}>
                  Employee ID
                </label>
                <input
                  type="text"
                  value={editForm.employeeId}
                  onChange={(e) => setEditForm({ ...editForm, employeeId: e.target.value.toUpperCase() })}
                  placeholder="e.g. TZ-EMP-001"
                  style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 13, outline: 'none' }}
                />
              </div>

              {/* Name & Email */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
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
                  <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: '#374151', textTransform: 'uppercase', marginBottom: 4 }}>Email</label>
                  <input
                    required
                    type="email"
                    value={editForm.email}
                    onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 13, outline: 'none' }}
                  />
                </div>
              </div>

              {/* Phone & Status */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: '#374151', textTransform: 'uppercase', marginBottom: 4 }}>Phone</label>
                  <input
                    type="tel"
                    value={editForm.phone}
                    onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 13, outline: 'none' }}
                  />
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
              </div>

              {/* Department & Designation */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: '#374151', textTransform: 'uppercase', marginBottom: 4 }}>Department</label>
                  <select
                    value={editForm.departmentId}
                    onChange={(e) => setEditForm({ ...editForm, departmentId: e.target.value, designationId: '' })}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 13, outline: 'none', background: '#fff' }}
                  >
                    <option value="">Select Department</option>
                    {departments.map((d) => (
                      <option key={d._id} value={d._id}>{d.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: '#374151', textTransform: 'uppercase', marginBottom: 4 }}>Designation</label>
                  <select
                    value={editForm.designationId}
                    onChange={(e) => setEditForm({ ...editForm, designationId: e.target.value })}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 13, outline: 'none', background: '#fff' }}
                  >
                    <option value="">Select Designation</option>
                    {editDesignations.map((des) => (
                      <option key={des._id} value={des._id}>{des.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Joining Date & Type */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: '#374151', textTransform: 'uppercase', marginBottom: 4 }}>Joining Date</label>
                  <input
                    type="date"
                    value={editForm.joiningDate}
                    onChange={(e) => setEditForm({ ...editForm, joiningDate: e.target.value })}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 13, outline: 'none' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: '#374151', textTransform: 'uppercase', marginBottom: 4 }}>Employment Type</label>
                  <select
                    value={editForm.employmentType}
                    onChange={(e) => setEditForm({ ...editForm, employmentType: e.target.value })}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 13, outline: 'none', background: '#fff' }}
                  >
                    <option value="full-time">Full-time</option>
                    <option value="part-time">Part-time</option>
                    <option value="contract">Contract</option>
                    <option value="internship">Internship</option>
                  </select>
                </div>
              </div>

              {/* Work Location, Gender, DOB */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: '#374151', textTransform: 'uppercase', marginBottom: 4 }}>Location</label>
                  <input
                    type="text"
                    value={editForm.workLocation}
                    onChange={(e) => setEditForm({ ...editForm, workLocation: e.target.value })}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 13, outline: 'none' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: '#374151', textTransform: 'uppercase', marginBottom: 4 }}>Gender</label>
                  <select
                    value={editForm.gender}
                    onChange={(e) => setEditForm({ ...editForm, gender: e.target.value })}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 13, outline: 'none', background: '#fff' }}
                  >
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: '#374151', textTransform: 'uppercase', marginBottom: 4 }}>DOB</label>
                  <input
                    type="date"
                    value={editForm.dateOfBirth}
                    onChange={(e) => setEditForm({ ...editForm, dateOfBirth: e.target.value })}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 13, outline: 'none' }}
                  />
                </div>
              </div>

              {/* Profile Photo */}
              <div>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: '#374151', textTransform: 'uppercase', marginBottom: 4 }}>Update Profile Photo</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setEditForm({ ...editForm, profilePhoto: e.target.files[0] || null })}
                  style={{ width: '100%', fontSize: 13, color: '#64748b' }}
                />
              </div>

              {/* Buttons */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 12 }}>
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
                  <span>Update Employee</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================
          VIEW EMPLOYEE DETAILS MODAL
      ======================================================== */}
      {viewModalOpen && selectedEmployee && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.45)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 9999, padding: 16,
        }}>
          <div style={{
            background: '#fff', borderRadius: 16, width: '100%', maxWidth: 520,
            padding: 24, boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)',
            position: 'relative',
          }}>
            <button
              onClick={() => setViewModalOpen(false)}
              style={{ position: 'absolute', top: 18, right: 18, background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}
            >
              <X size={20} />
            </button>

            {/* Profile Header */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, paddingBottom: 16, borderBottom: '1px solid #f1f5f9' }}>
              <div style={{
                width: 56, height: 56, borderRadius: '50%',
                background: 'linear-gradient(135deg, #c0392b, #922b21)',
                color: '#fff', display: 'flex', alignItems: 'center',
                justifyContent: 'center', fontSize: 18, fontWeight: 700,
                border: '2px solid #e2e8f0', flexShrink: 0,
              }}>
                {selectedEmployee.userId?.name ? selectedEmployee.userId.name.slice(0, 2).toUpperCase() : 'EP'}
              </div>
              <div>
                <h3 style={{ fontSize: 18, fontWeight: 700, color: '#111827', margin: 0 }}>
                  {selectedEmployee.userId?.name}
                </h3>
                <p style={{ color: '#c0392b', fontSize: 12, fontWeight: 600, margin: '2px 0 0' }}>
                  {selectedEmployee.userId?.employeeId}
                </p>
                <span style={{
                  display: 'inline-block', padding: '2px 8px', borderRadius: 4,
                  fontSize: 10, fontWeight: 700, textTransform: 'uppercase', marginTop: 4,
                  background: selectedEmployee.userId?.isActive ? '#f0fdf4' : '#fef2f2',
                  color: selectedEmployee.userId?.isActive ? '#16a34a' : '#dc2626',
                }}>
                  {selectedEmployee.userId?.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>
            </div>

            {/* Profile details grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, paddingTop: 16, fontSize: 13 }}>
              <div>
                <p style={{ color: '#94a3b8', fontSize: 11, fontWeight: 600, textTransform: 'uppercase', margin: 0 }}>Department</p>
                <p style={{ color: '#1e293b', fontWeight: 600, margin: '2px 0 0' }}>{selectedEmployee.departmentId?.name || '-'}</p>
              </div>
              <div>
                <p style={{ color: '#94a3b8', fontSize: 11, fontWeight: 600, textTransform: 'uppercase', margin: 0 }}>Designation</p>
                <p style={{ color: '#1e293b', fontWeight: 600, margin: '2px 0 0' }}>{selectedEmployee.designationId?.name || '-'}</p>
              </div>
              <div>
                <p style={{ color: '#94a3b8', fontSize: 11, fontWeight: 600, textTransform: 'uppercase', margin: 0 }}>Email</p>
                <p style={{ color: '#1e293b', margin: '2px 0 0' }}>{selectedEmployee.userId?.email || '-'}</p>
              </div>
              <div>
                <p style={{ color: '#94a3b8', fontSize: 11, fontWeight: 600, textTransform: 'uppercase', margin: 0 }}>Phone</p>
                <p style={{ color: '#1e293b', margin: '2px 0 0' }}>{selectedEmployee.phone || '-'}</p>
              </div>
              <div>
                <p style={{ color: '#94a3b8', fontSize: 11, fontWeight: 600, textTransform: 'uppercase', margin: 0 }}>Joining Date</p>
                <p style={{ color: '#1e293b', margin: '2px 0 0' }}>{selectedEmployee.joiningDate ? new Date(selectedEmployee.joiningDate).toLocaleDateString() : '-'}</p>
              </div>
              <div>
                <p style={{ color: '#94a3b8', fontSize: 11, fontWeight: 600, textTransform: 'uppercase', margin: 0 }}>Employment Type</p>
                <p style={{ color: '#1e293b', textTransform: 'capitalize', margin: '2px 0 0' }}>{selectedEmployee.employmentType || '-'}</p>
              </div>
              <div>
                <p style={{ color: '#94a3b8', fontSize: 11, fontWeight: 600, textTransform: 'uppercase', margin: 0 }}>Work Location</p>
                <p style={{ color: '#1e293b', margin: '2px 0 0' }}>{selectedEmployee.workLocation || '-'}</p>
              </div>
              <div>
                <p style={{ color: '#94a3b8', fontSize: 11, fontWeight: 600, textTransform: 'uppercase', margin: 0 }}>Gender</p>
                <p style={{ color: '#1e293b', textTransform: 'capitalize', margin: '2px 0 0' }}>{selectedEmployee.gender || '-'}</p>
              </div>
            </div>

            <div style={{ marginTop: 20, display: 'flex', justifyContent: 'flex-end' }}>
              <button
                onClick={() => setViewModalOpen(false)}
                style={{ background: '#e2e8f0', color: '#475569', border: 'none', borderRadius: 8, padding: '8px 16px', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          DELETE CONFIRMATION MODAL
      ======================================================== */}
      {deleteModalOpen && selectedEmployee && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.45)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 9999, padding: 16,
        }}>
          <div style={{
            background: '#fff', borderRadius: 16, width: '100%', maxWidth: 420,
            padding: 24, boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)', textAlign: 'center',
          }}>
            <div style={{
              width: 48, height: 48, borderRadius: '50%', background: '#fef2f2',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 16px',
            }}>
              <Trash2 size={24} color="#dc2626" />
            </div>
            <h3 style={{ fontSize: 18, fontWeight: 700, color: '#111827', margin: 0 }}>Delete Employee</h3>
            <p style={{ fontSize: 13, color: '#64748b', marginTop: 8 }}>
              Are you sure you want to permanently delete <strong>{selectedEmployee.userId?.name}</strong> ({selectedEmployee.userId?.employeeId})? This action cannot be undone.
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
