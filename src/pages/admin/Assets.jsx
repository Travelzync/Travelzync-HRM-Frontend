import { useState, useEffect, useMemo } from 'react'
import {
  Package, Plus, Search, Filter, Laptop, Smartphone,
  HardDrive, Cpu, CheckCircle2, AlertTriangle, XCircle,
  UserCheck, RotateCcw, Edit2, Trash2, X, Loader2, Calendar, ShieldCheck
} from 'lucide-react'
import {
  getAllAssets, createAsset, updateAsset, assignAsset, returnAsset, deleteAsset
} from '../../services/assetService'
import { getEmployees } from '../../services/employeeService'
import { showSuccess, showError, showWarning } from '../../utils/toast'

const CATEGORY_OPTIONS = [
  { value: 'ALL', label: 'All Categories' },
  { value: 'laptop', label: 'Laptop' },
  { value: 'desktop', label: 'Desktop' },
  { value: 'mobile', label: 'Mobile' },
  { value: 'sim_card', label: 'SIM Card' },
  { value: 'accessory', label: 'Accessory' },
  { value: 'vehicle', label: 'Vehicle' },
  { value: 'other', label: 'Other' },
]

const CONDITION_OPTIONS = [
  { value: 'new', label: 'New' },
  { value: 'good', label: 'Good' },
  { value: 'fair', label: 'Fair' },
  { value: 'damaged', label: 'Damaged' },
  { value: 'in_repair', label: 'In Repair' },
]

export default function Assets() {
  const [assets, setAssets] = useState([])
  const [employees, setEmployees] = useState([])
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('ALL')
  const [statusFilter, setStatusFilter] = useState('ALL')

  // Modals
  const [addModalOpen, setAddModalOpen] = useState(false)
  const [editModalOpen, setEditModalOpen] = useState(false)
  const [assignModalOpen, setAssignModalOpen] = useState(false)
  const [returnModalOpen, setReturnModalOpen] = useState(false)
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [selectedAsset, setSelectedAsset] = useState(null)

  // Form States
  const [assetForm, setAssetForm] = useState({
    name: '',
    assetCode: '',
    serialNumber: '',
    category: 'laptop',
    brand: '',
    modelNumber: '',
    purchaseDate: '',
    warrantyExpires: '',
    condition: 'new',
    notes: '',
  })

  const [assignForm, setAssignForm] = useState({
    employeeId: '',
    assignedDate: new Date().toISOString().split('T')[0],
    notes: '',
  })

  const [returnForm, setReturnForm] = useState({
    condition: 'good',
    notes: '',
  })

  const fetchData = async () => {
    try {
      setLoading(true)
      const [assetsRes, empRes] = await Promise.all([
        getAllAssets(),
        getEmployees(),
      ])
      if (assetsRes?.assets) setAssets(assetsRes.assets)
      if (empRes?.employees) setEmployees(empRes.employees)
    } catch (err) {
      showError(err.response?.data?.message || 'Failed to load assets')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  // KPI Metrics
  const totalAssets = assets.length
  const assignedCount = assets.filter((a) => a.status === 'assigned').length
  const availableCount = assets.filter((a) => a.status === 'available').length
  const repairCount = assets.filter((a) => a.status === 'damaged' || a.condition === 'in_repair').length

  // Filtered Assets
  const filteredAssets = useMemo(() => {
    return assets.filter((item) => {
      const q = searchQuery.toLowerCase()
      const matchesSearch =
        (item.name || '').toLowerCase().includes(q) ||
        (item.assetCode || '').toLowerCase().includes(q) ||
        (item.serialNumber || '').toLowerCase().includes(q) ||
        (item.brand || '').toLowerCase().includes(q) ||
        (item.assignedTo?.userId?.name || '').toLowerCase().includes(q)

      const matchesCategory = categoryFilter === 'ALL' || item.category === categoryFilter
      const matchesStatus = statusFilter === 'ALL' || item.status === statusFilter
      return matchesSearch && matchesCategory && matchesStatus
    })
  }, [assets, searchQuery, categoryFilter, statusFilter])

  // Open Add
  const handleOpenAdd = () => {
    setAssetForm({
      name: '',
      assetCode: `AST-${new Date().getFullYear()}-${String(assets.length + 1).padStart(3, '0')}`,
      serialNumber: '',
      category: 'laptop',
      brand: '',
      modelNumber: '',
      purchaseDate: '',
      warrantyExpires: '',
      condition: 'new',
      notes: '',
    })
    setAddModalOpen(true)
  }

  // Handle Add Submit
  const handleAddSubmit = async (e) => {
    e.preventDefault()
    if (!assetForm.name.trim() || !assetForm.assetCode.trim()) {
      showWarning('Asset name and asset code are required')
      return
    }

    try {
      setActionLoading(true)
      const res = await createAsset(assetForm)
      showSuccess(res.message || 'Asset registered successfully!')
      setAddModalOpen(false)
      fetchData()
    } catch (err) {
      showError(err.response?.data?.message || 'Failed to create asset')
    } finally {
      setActionLoading(false)
    }
  }

  // Open Edit
  const handleOpenEdit = (item) => {
    setSelectedAsset(item)
    setAssetForm({
      name: item.name || '',
      assetCode: item.assetCode || '',
      serialNumber: item.serialNumber || '',
      category: item.category || 'laptop',
      brand: item.brand || '',
      modelNumber: item.modelNumber || '',
      purchaseDate: item.purchaseDate ? item.purchaseDate.split('T')[0] : '',
      warrantyExpires: item.warrantyExpires ? item.warrantyExpires.split('T')[0] : '',
      condition: item.condition || 'good',
      notes: item.notes || '',
    })
    setEditModalOpen(true)
  }

  // Handle Edit Submit
  const handleEditSubmit = async (e) => {
    e.preventDefault()
    if (!selectedAsset) return

    try {
      setActionLoading(true)
      const res = await updateAsset(selectedAsset._id, assetForm)
      showSuccess(res.message || 'Asset details updated successfully!')
      setEditModalOpen(false)
      setSelectedAsset(null)
      fetchData()
    } catch (err) {
      showError(err.response?.data?.message || 'Failed to update asset')
    } finally {
      setActionLoading(false)
    }
  }

  // Open Assign
  const handleOpenAssign = (item) => {
    setSelectedAsset(item)
    setAssignForm({
      employeeId: employees[0]?._id || '',
      assignedDate: new Date().toISOString().split('T')[0],
      notes: '',
    })
    setAssignModalOpen(true)
  }

  // Handle Assign Submit
  const handleAssignSubmit = async (e) => {
    e.preventDefault()
    if (!selectedAsset || !assignForm.employeeId) {
      showWarning('Please select an employee')
      return
    }

    try {
      setActionLoading(true)
      const res = await assignAsset(selectedAsset._id, assignForm)
      showSuccess(res.message || 'Asset assigned successfully!')
      setAssignModalOpen(false)
      setSelectedAsset(null)
      fetchData()
    } catch (err) {
      showError(err.response?.data?.message || 'Failed to assign asset')
    } finally {
      setActionLoading(false)
    }
  }

  // Open Return
  const handleOpenReturn = (item) => {
    setSelectedAsset(item)
    setReturnForm({
      condition: item.condition || 'good',
      notes: '',
    })
    setReturnModalOpen(true)
  }

  // Handle Return Submit
  const handleReturnSubmit = async (e) => {
    e.preventDefault()
    if (!selectedAsset) return

    try {
      setActionLoading(true)
      const res = await returnAsset(selectedAsset._id, returnForm)
      showSuccess(res.message || 'Asset returned to inventory!')
      setReturnModalOpen(false)
      setSelectedAsset(null)
      fetchData()
    } catch (err) {
      showError(err.response?.data?.message || 'Failed to return asset')
    } finally {
      setActionLoading(false)
    }
  }

  // Open Delete
  const handleOpenDelete = (item) => {
    setSelectedAsset(item)
    setDeleteModalOpen(true)
  }

  // Handle Delete Confirm
  const handleDeleteConfirm = async () => {
    if (!selectedAsset) return

    try {
      setActionLoading(true)
      const res = await deleteAsset(selectedAsset._id)
      showSuccess(res.message || 'Asset deleted successfully!')
      setDeleteModalOpen(false)
      setSelectedAsset(null)
      fetchData()
    } catch (err) {
      showError(err.response?.data?.message || 'Failed to delete asset')
    } finally {
      setActionLoading(false)
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24, width: '100%' }}>
      {/* Header Banner */}
      <div style={{
        background: 'linear-gradient(135deg, #c0392b 0%, #922b21 60%, #7b241c 100%)',
        borderRadius: 16, padding: '24px 28px', color: '#fff',
        display: 'flex', flexWrap: 'wrap', alignItems: 'center',
        justifyContent: 'space-between', gap: 20,
        boxShadow: '0 4px 12px rgba(192, 57, 43, 0.25)',
      }}>
        <div>
          <h2 style={{ fontSize: 22, fontWeight: 700, margin: 0 }}>Company Asset Management</h2>
          <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.85)', margin: '4px 0 0 0' }}>
            Track, assign, and audit hardware, mobile devices, SIMs, and office accessories.
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          style={{
            display: 'flex', alignItems: 'center', gap: 8,
            background: '#fff', color: '#c0392b', border: 'none',
            borderRadius: 10, padding: '10px 18px', fontSize: 13,
            fontWeight: 700, cursor: 'pointer',
            boxShadow: '0 2px 6px rgba(0,0,0,0.1)',
          }}
        >
          <Plus size={16} />
          <span>Add New Asset</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
        <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 14, padding: 18 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ width: 34, height: 34, borderRadius: 10, background: '#fef2f2', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#c0392b' }}>
              <Package size={17} />
            </div>
            <span style={{ fontSize: 11, fontWeight: 600, color: '#c0392b', background: '#fee2e2', padding: '2px 8px', borderRadius: 10 }}>Total</span>
          </div>
          <h3 style={{ fontSize: 22, fontWeight: 800, color: '#0f172a', margin: '12px 0 2px 0' }}>{totalAssets}</h3>
          <p style={{ fontSize: 12, color: '#64748b', margin: 0 }}>Total Registered Assets</p>
        </div>

        <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 14, padding: 18 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ width: 34, height: 34, borderRadius: 10, background: '#f0fdf4', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#16a34a' }}>
              <UserCheck size={17} />
            </div>
            <span style={{ fontSize: 11, fontWeight: 600, color: '#16a34a', background: '#dcfce7', padding: '2px 8px', borderRadius: 10 }}>Active</span>
          </div>
          <h3 style={{ fontSize: 22, fontWeight: 800, color: '#0f172a', margin: '12px 0 2px 0' }}>{assignedCount}</h3>
          <p style={{ fontSize: 12, color: '#64748b', margin: 0 }}>Assigned to Employees</p>
        </div>

        <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 14, padding: 18 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ width: 34, height: 34, borderRadius: 10, background: '#fefce8', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ca8a04' }}>
              <CheckCircle2 size={17} />
            </div>
            <span style={{ fontSize: 11, fontWeight: 600, color: '#ca8a04', background: '#fef9c3', padding: '2px 8px', borderRadius: 10 }}>Ready</span>
          </div>
          <h3 style={{ fontSize: 22, fontWeight: 800, color: '#0f172a', margin: '12px 0 2px 0' }}>{availableCount}</h3>
          <p style={{ fontSize: 12, color: '#64748b', margin: 0 }}>Available in Inventory</p>
        </div>

        <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 14, padding: 18 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ width: 34, height: 34, borderRadius: 10, background: '#fef2f2', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#dc2626' }}>
              <AlertTriangle size={17} />
            </div>
            <span style={{ fontSize: 11, fontWeight: 600, color: '#dc2626', background: '#fee2e2', padding: '2px 8px', borderRadius: 10 }}>Alert</span>
          </div>
          <h3 style={{ fontSize: 22, fontWeight: 800, color: '#0f172a', margin: '12px 0 2px 0' }}>{repairCount}</h3>
          <p style={{ fontSize: 12, color: '#64748b', margin: 0 }}>Damaged or In Repair</p>
        </div>
      </div>

      {/* Main Table Section */}
      <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #e2e8f0', overflow: 'hidden' }}>
        {/* Controls */}
        <div style={{
          padding: '16px 20px', borderBottom: '1px solid #f1f5f9',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          flexWrap: 'wrap', gap: 12,
        }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 8,
            background: '#f8fafc', border: '1px solid #e2e8f0',
            borderRadius: 8, padding: '7px 12px', width: 260,
          }}>
            <Search size={15} color="#94a3b8" />
            <input
              type="text"
              placeholder="Search code, name, brand, staff..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ border: 'none', background: 'none', outline: 'none', fontSize: 12, color: '#334155', width: '100%' }}
            />
          </div>

          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              style={{ padding: '6px 12px', borderRadius: 8, border: '1px solid #e2e8f0', background: '#f8fafc', fontSize: 12, color: '#334155', outline: 'none', cursor: 'pointer' }}
            >
              {CATEGORY_OPTIONS.map((c) => (
                <option key={c.value} value={c.value}>{c.label}</option>
              ))}
            </select>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              style={{ padding: '6px 12px', borderRadius: 8, border: '1px solid #e2e8f0', background: '#f8fafc', fontSize: 12, color: '#334155', outline: 'none', cursor: 'pointer' }}
            >
              <option value="ALL">All Status</option>
              <option value="available">Available</option>
              <option value="assigned">Assigned</option>
              <option value="damaged">Damaged</option>
              <option value="retired">Retired</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <div style={{ overflowX: 'auto' }}>
          {loading ? (
            <div style={{ padding: 48, textAlign: 'center', color: '#64748b' }}>
              <Loader2 size={24} className="animate-spin" style={{ margin: '0 auto 8px' }} />
              <p style={{ fontSize: 13 }}>Loading company asset inventory...</p>
            </div>
          ) : filteredAssets.length === 0 ? (
            <div style={{ padding: 48, textAlign: 'center', color: '#64748b' }}>
              <Package size={32} color="#cbd5e1" style={{ margin: '0 auto 8px' }} />
              <p style={{ fontSize: 14, fontWeight: 600, color: '#334155' }}>No assets found</p>
              <p style={{ fontSize: 12, color: '#94a3b8' }}>Click 'Add New Asset' to add hardware into inventory.</p>
            </div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
              <thead>
                <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#64748b', textAlign: 'left' }}>
                  <th style={{ padding: '12px 18px', fontWeight: 600 }}>Asset Code</th>
                  <th style={{ padding: '12px 18px', fontWeight: 600 }}>Asset Name</th>
                  <th style={{ padding: '12px 18px', fontWeight: 600 }}>Category</th>
                  <th style={{ padding: '12px 18px', fontWeight: 600 }}>Brand / Model</th>
                  <th style={{ padding: '12px 18px', fontWeight: 600 }}>Serial Number</th>
                  <th style={{ padding: '12px 18px', fontWeight: 600 }}>Condition</th>
                  <th style={{ padding: '12px 18px', fontWeight: 600 }}>Status</th>
                  <th style={{ padding: '12px 18px', fontWeight: 600 }}>Assigned To</th>
                  <th style={{ padding: '12px 18px', fontWeight: 600, textAlign: 'center' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredAssets.map((item) => {
                  const assignedEmp = item.assignedTo?.userId
                  return (
                    <tr
                      key={item._id}
                      style={{ borderBottom: '1px solid #f1f5f9', transition: 'background 0.15s' }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = '#fafafa')}
                      onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                    >
                      <td style={{ padding: '14px 18px', fontWeight: 700, color: '#0f172a' }}>
                        {item.assetCode}
                      </td>
                      <td style={{ padding: '14px 18px', fontWeight: 600, color: '#1e293b' }}>
                        {item.name}
                      </td>
                      <td style={{ padding: '14px 18px', textTransform: 'capitalize', color: '#475569' }}>
                        {item.category?.replace('_', ' ')}
                      </td>
                      <td style={{ padding: '14px 18px', color: '#475569' }}>
                        {item.brand || '-'} {item.modelNumber ? `(${item.modelNumber})` : ''}
                      </td>
                      <td style={{ padding: '14px 18px', fontFamily: 'monospace', fontSize: 12, color: '#64748b' }}>
                        {item.serialNumber || '-'}
                      </td>
                      <td style={{ padding: '14px 18px' }}>
                        <span style={{
                          padding: '3px 8px', borderRadius: 8, fontSize: 11, fontWeight: 600, textTransform: 'capitalize',
                          background: item.condition === 'new' ? '#dcfce7' : item.condition === 'good' ? '#f0fdf4' : item.condition === 'fair' ? '#fef3c7' : '#fee2e2',
                          color: item.condition === 'new' || item.condition === 'good' ? '#15803d' : item.condition === 'fair' ? '#b45309' : '#b91c1c',
                        }}>
                          {item.condition}
                        </span>
                      </td>
                      <td style={{ padding: '14px 18px' }}>
                        <span style={{
                          padding: '3px 9px', borderRadius: 10, fontSize: 11, fontWeight: 600, textTransform: 'capitalize',
                          background: item.status === 'assigned' ? '#e0e7ff' : item.status === 'available' ? '#dcfce7' : '#fee2e2',
                          color: item.status === 'assigned' ? '#4338ca' : item.status === 'available' ? '#15803d' : '#b91c1c',
                        }}>
                          {item.status}
                        </span>
                      </td>
                      <td style={{ padding: '14px 18px' }}>
                        {assignedEmp ? (
                          <div>
                            <div style={{ fontWeight: 600, color: '#0f172a' }}>{assignedEmp.name}</div>
                            <div style={{ fontSize: 11, color: '#94a3b8' }}>{assignedEmp.employeeId}</div>
                          </div>
                        ) : (
                          <span style={{ color: '#94a3b8', fontSize: 12 }}>Unassigned</span>
                        )}
                      </td>
                      <td style={{ padding: '14px 18px', textAlign: 'center' }}>
                        <div style={{ display: 'inline-flex', gap: 6 }}>
                          {item.status === 'available' ? (
                            <button
                              onClick={() => handleOpenAssign(item)}
                              title="Assign to Employee"
                              style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 6, padding: '4px 8px', cursor: 'pointer', color: '#16a34a', display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, fontWeight: 600 }}
                            >
                              <UserCheck size={12} />
                              <span>Assign</span>
                            </button>
                          ) : item.status === 'assigned' ? (
                            <button
                              onClick={() => handleOpenReturn(item)}
                              title="Return to Inventory"
                              style={{ background: '#fffbeb', border: '1px solid #fde68a', borderRadius: 6, padding: '4px 8px', cursor: 'pointer', color: '#b45309', display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, fontWeight: 600 }}
                            >
                              <RotateCcw size={12} />
                              <span>Return</span>
                            </button>
                          ) : null}

                          <button
                            onClick={() => handleOpenEdit(item)}
                            title="Edit Asset"
                            style={{ background: '#f1f5f9', border: 'none', borderRadius: 6, padding: 6, cursor: 'pointer', color: '#475569' }}
                          >
                            <Edit2 size={13} />
                          </button>

                          {item.status !== 'assigned' && (
                            <button
                              onClick={() => handleOpenDelete(item)}
                              title="Delete Asset"
                              style={{ background: '#fef2f2', border: 'none', borderRadius: 6, padding: 6, cursor: 'pointer', color: '#dc2626' }}
                            >
                              <Trash2 size={13} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Add Asset Modal */}
      {addModalOpen && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.65)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 20 }}>
          <div style={{ background: '#fff', borderRadius: 16, maxWidth: 520, width: '100%', padding: 24, boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
              <h3 style={{ fontSize: 17, fontWeight: 700, color: '#0f172a', margin: 0 }}>Register New Asset</h3>
              <button onClick={() => setAddModalOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8' }}><X size={18} /></button>
            </div>

            <form onSubmit={handleAddSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <div>
                  <label style={{ fontSize: 11, fontWeight: 600, color: '#334155', display: 'block', marginBottom: 3 }}>Asset Code *</label>
                  <input
                    type="text"
                    required
                    value={assetForm.assetCode}
                    onChange={(e) => setAssetForm({ ...assetForm, assetCode: e.target.value })}
                    style={{ width: '100%', padding: '8px 10px', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: 12, outline: 'none' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: 11, fontWeight: 600, color: '#334155', display: 'block', marginBottom: 3 }}>Category *</label>
                  <select
                    value={assetForm.category}
                    onChange={(e) => setAssetForm({ ...assetForm, category: e.target.value })}
                    style={{ width: '100%', padding: '8px 10px', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: 12, outline: 'none' }}
                  >
                    {CATEGORY_OPTIONS.filter((c) => c.value !== 'ALL').map((c) => (
                      <option key={c.value} value={c.value}>{c.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label style={{ fontSize: 11, fontWeight: 600, color: '#334155', display: 'block', marginBottom: 3 }}>Asset Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. MacBook Pro 16 M2 Pro"
                  value={assetForm.name}
                  onChange={(e) => setAssetForm({ ...assetForm, name: e.target.value })}
                  style={{ width: '100%', padding: '8px 10px', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: 12, outline: 'none' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <div>
                  <label style={{ fontSize: 11, fontWeight: 600, color: '#334155', display: 'block', marginBottom: 3 }}>Brand</label>
                  <input
                    type="text"
                    placeholder="e.g. Apple, Dell, Lenovo"
                    value={assetForm.brand}
                    onChange={(e) => setAssetForm({ ...assetForm, brand: e.target.value })}
                    style={{ width: '100%', padding: '8px 10px', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: 12, outline: 'none' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: 11, fontWeight: 600, color: '#334155', display: 'block', marginBottom: 3 }}>Model / Specs</label>
                  <input
                    type="text"
                    placeholder="e.g. A2780 (32GB RAM / 1TB)"
                    value={assetForm.modelNumber}
                    onChange={(e) => setAssetForm({ ...assetForm, modelNumber: e.target.value })}
                    style={{ width: '100%', padding: '8px 10px', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: 12, outline: 'none' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 10 }}>
                <div>
                  <label style={{ fontSize: 11, fontWeight: 600, color: '#334155', display: 'block', marginBottom: 3 }}>Serial Number</label>
                  <input
                    type="text"
                    placeholder="Hardware serial number"
                    value={assetForm.serialNumber}
                    onChange={(e) => setAssetForm({ ...assetForm, serialNumber: e.target.value })}
                    style={{ width: '100%', padding: '8px 10px', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: 12, outline: 'none' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: 11, fontWeight: 600, color: '#334155', display: 'block', marginBottom: 3 }}>Condition</label>
                  <select
                    value={assetForm.condition}
                    onChange={(e) => setAssetForm({ ...assetForm, condition: e.target.value })}
                    style={{ width: '100%', padding: '8px 10px', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: 12, outline: 'none' }}
                  >
                    {CONDITION_OPTIONS.map((c) => (
                      <option key={c.value} value={c.value}>{c.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <div>
                  <label style={{ fontSize: 11, fontWeight: 600, color: '#334155', display: 'block', marginBottom: 3 }}>Purchase Date</label>
                  <input
                    type="date"
                    value={assetForm.purchaseDate}
                    onChange={(e) => setAssetForm({ ...assetForm, purchaseDate: e.target.value })}
                    style={{ width: '100%', padding: '7px 10px', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: 12, outline: 'none' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: 11, fontWeight: 600, color: '#334155', display: 'block', marginBottom: 3 }}>Warranty Expires</label>
                  <input
                    type="date"
                    value={assetForm.warrantyExpires}
                    onChange={(e) => setAssetForm({ ...assetForm, warrantyExpires: e.target.value })}
                    style={{ width: '100%', padding: '7px 10px', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: 12, outline: 'none' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ fontSize: 11, fontWeight: 600, color: '#334155', display: 'block', marginBottom: 3 }}>Notes / Description</label>
                <textarea
                  rows="2"
                  value={assetForm.notes}
                  onChange={(e) => setAssetForm({ ...assetForm, notes: e.target.value })}
                  placeholder="Optional inventory notes..."
                  style={{ width: '100%', padding: '8px 10px', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: 12, outline: 'none' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 10 }}>
                <button
                  type="button"
                  onClick={() => setAddModalOpen(false)}
                  style={{ padding: '8px 16px', borderRadius: 8, border: '1px solid #e2e8f0', background: '#fff', fontSize: 13, color: '#64748b', cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  style={{ padding: '8px 18px', borderRadius: 8, border: 'none', background: 'linear-gradient(135deg, #c0392b, #922b21)', color: '#fff', fontSize: 13, fontWeight: 600, cursor: actionLoading ? 'not-allowed' : 'pointer' }}
                >
                  {actionLoading ? 'Saving...' : 'Add Asset'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Asset Modal */}
      {editModalOpen && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.65)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 20 }}>
          <div style={{ background: '#fff', borderRadius: 16, maxWidth: 520, width: '100%', padding: 24, boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
              <h3 style={{ fontSize: 17, fontWeight: 700, color: '#0f172a', margin: 0 }}>Edit Asset - {selectedAsset?.assetCode}</h3>
              <button onClick={() => setEditModalOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8' }}><X size={18} /></button>
            </div>

            <form onSubmit={handleEditSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div>
                <label style={{ fontSize: 11, fontWeight: 600, color: '#334155', display: 'block', marginBottom: 3 }}>Asset Name</label>
                <input
                  type="text"
                  required
                  value={assetForm.name}
                  onChange={(e) => setAssetForm({ ...assetForm, name: e.target.value })}
                  style={{ width: '100%', padding: '8px 10px', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: 12, outline: 'none' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <div>
                  <label style={{ fontSize: 11, fontWeight: 600, color: '#334155', display: 'block', marginBottom: 3 }}>Category</label>
                  <select
                    value={assetForm.category}
                    onChange={(e) => setAssetForm({ ...assetForm, category: e.target.value })}
                    style={{ width: '100%', padding: '8px 10px', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: 12, outline: 'none' }}
                  >
                    {CATEGORY_OPTIONS.filter((c) => c.value !== 'ALL').map((c) => (
                      <option key={c.value} value={c.value}>{c.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: 11, fontWeight: 600, color: '#334155', display: 'block', marginBottom: 3 }}>Condition</label>
                  <select
                    value={assetForm.condition}
                    onChange={(e) => setAssetForm({ ...assetForm, condition: e.target.value })}
                    style={{ width: '100%', padding: '8px 10px', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: 12, outline: 'none' }}
                  >
                    {CONDITION_OPTIONS.map((c) => (
                      <option key={c.value} value={c.value}>{c.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <div>
                  <label style={{ fontSize: 11, fontWeight: 600, color: '#334155', display: 'block', marginBottom: 3 }}>Brand</label>
                  <input
                    type="text"
                    value={assetForm.brand}
                    onChange={(e) => setAssetForm({ ...assetForm, brand: e.target.value })}
                    style={{ width: '100%', padding: '8px 10px', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: 12, outline: 'none' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: 11, fontWeight: 600, color: '#334155', display: 'block', marginBottom: 3 }}>Model / Specs</label>
                  <input
                    type="text"
                    value={assetForm.modelNumber}
                    onChange={(e) => setAssetForm({ ...assetForm, modelNumber: e.target.value })}
                    style={{ width: '100%', padding: '8px 10px', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: 12, outline: 'none' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ fontSize: 11, fontWeight: 600, color: '#334155', display: 'block', marginBottom: 3 }}>Serial Number</label>
                <input
                  type="text"
                  value={assetForm.serialNumber}
                  onChange={(e) => setAssetForm({ ...assetForm, serialNumber: e.target.value })}
                  style={{ width: '100%', padding: '8px 10px', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: 12, outline: 'none' }}
                />
              </div>

              <div>
                <label style={{ fontSize: 11, fontWeight: 600, color: '#334155', display: 'block', marginBottom: 3 }}>Notes</label>
                <textarea
                  rows="2"
                  value={assetForm.notes}
                  onChange={(e) => setAssetForm({ ...assetForm, notes: e.target.value })}
                  style={{ width: '100%', padding: '8px 10px', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: 12, outline: 'none' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 10 }}>
                <button
                  type="button"
                  onClick={() => setEditModalOpen(false)}
                  style={{ padding: '8px 16px', borderRadius: 8, border: '1px solid #e2e8f0', background: '#fff', fontSize: 13, color: '#64748b', cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  style={{ padding: '8px 18px', borderRadius: 8, border: 'none', background: 'linear-gradient(135deg, #c0392b, #922b21)', color: '#fff', fontSize: 13, fontWeight: 600, cursor: actionLoading ? 'not-allowed' : 'pointer' }}
                >
                  {actionLoading ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Assign Asset Modal */}
      {assignModalOpen && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.65)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 20 }}>
          <div style={{ background: '#fff', borderRadius: 16, maxWidth: 440, width: '100%', padding: 24 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h3 style={{ fontSize: 17, fontWeight: 700, color: '#0f172a', margin: 0 }}>Assign Asset</h3>
              <button onClick={() => setAssignModalOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8' }}><X size={18} /></button>
            </div>

            <p style={{ fontSize: 12.5, color: '#64748b', margin: '0 0 16px 0' }}>
              Assigning <strong>{selectedAsset?.name} ({selectedAsset?.assetCode})</strong> to staff.
            </p>

            <form onSubmit={handleAssignSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div>
                <label style={{ fontSize: 11, fontWeight: 600, color: '#334155', display: 'block', marginBottom: 4 }}>Select Employee *</label>
                <select
                  required
                  value={assignForm.employeeId}
                  onChange={(e) => setAssignForm({ ...assignForm, employeeId: e.target.value })}
                  style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: 12.5, outline: 'none' }}
                >
                  <option value="">-- Choose Employee --</option>
                  {employees.map((emp) => (
                    <option key={emp._id} value={emp._id}>
                      {emp.userId?.name} ({emp.userId?.employeeId}) - {emp.departmentId?.name || 'Staff'}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ fontSize: 11, fontWeight: 600, color: '#334155', display: 'block', marginBottom: 4 }}>Handover Date</label>
                <input
                  type="date"
                  value={assignForm.assignedDate}
                  onChange={(e) => setAssignForm({ ...assignForm, assignedDate: e.target.value })}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: 12, outline: 'none' }}
                />
              </div>

              <div>
                <label style={{ fontSize: 11, fontWeight: 600, color: '#334155', display: 'block', marginBottom: 4 }}>Handover Remarks</label>
                <textarea
                  rows="2"
                  placeholder="e.g. Handed over with charger and laptop bag..."
                  value={assignForm.notes}
                  onChange={(e) => setAssignForm({ ...assignForm, notes: e.target.value })}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: 12, outline: 'none' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 10 }}>
                <button type="button" onClick={() => setAssignModalOpen(false)} style={{ padding: '8px 16px', borderRadius: 8, border: '1px solid #e2e8f0', background: '#fff', fontSize: 13, color: '#64748b', cursor: 'pointer' }}>Cancel</button>
                <button type="submit" disabled={actionLoading} style={{ padding: '8px 18px', borderRadius: 8, border: 'none', background: '#16a34a', color: '#fff', fontSize: 13, fontWeight: 600, cursor: actionLoading ? 'not-allowed' : 'pointer' }}>
                  {actionLoading ? 'Assigning...' : 'Confirm Assignment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Return Asset Modal */}
      {returnModalOpen && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.65)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 20 }}>
          <div style={{ background: '#fff', borderRadius: 16, maxWidth: 420, width: '100%', padding: 24 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
              <h3 style={{ fontSize: 17, fontWeight: 700, color: '#0f172a', margin: 0 }}>Return Asset to Inventory</h3>
              <button onClick={() => setReturnModalOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8' }}><X size={18} /></button>
            </div>

            <p style={{ fontSize: 12.5, color: '#64748b', margin: '0 0 16px 0' }}>
              Confirm return of <strong>{selectedAsset?.name}</strong> from <strong>{selectedAsset?.assignedTo?.userId?.name}</strong>.
            </p>

            <form onSubmit={handleReturnSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div>
                <label style={{ fontSize: 11, fontWeight: 600, color: '#334155', display: 'block', marginBottom: 4 }}>Condition on Return</label>
                <select
                  value={returnForm.condition}
                  onChange={(e) => setReturnForm({ ...returnForm, condition: e.target.value })}
                  style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: 12.5, outline: 'none' }}
                >
                  {CONDITION_OPTIONS.map((c) => (
                    <option key={c.value} value={c.value}>{c.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ fontSize: 11, fontWeight: 600, color: '#334155', display: 'block', marginBottom: 4 }}>Inspection / Return Notes</label>
                <textarea
                  rows="2"
                  placeholder="e.g. Returned in good working condition..."
                  value={returnForm.notes}
                  onChange={(e) => setReturnForm({ ...returnForm, notes: e.target.value })}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: 12, outline: 'none' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 10 }}>
                <button type="button" onClick={() => setReturnModalOpen(false)} style={{ padding: '8px 16px', borderRadius: 8, border: '1px solid #e2e8f0', background: '#fff', fontSize: 13, color: '#64748b', cursor: 'pointer' }}>Cancel</button>
                <button type="submit" disabled={actionLoading} style={{ padding: '8px 18px', borderRadius: 8, border: 'none', background: '#b45309', color: '#fff', fontSize: 13, fontWeight: 600, cursor: actionLoading ? 'not-allowed' : 'pointer' }}>
                  {actionLoading ? 'Processing...' : 'Accept Return'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteModalOpen && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.65)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 20 }}>
          <div style={{ background: '#fff', borderRadius: 16, maxWidth: 380, width: '100%', padding: 24, textAlign: 'center' }}>
            <div style={{ width: 48, height: 48, borderRadius: 14, background: '#fee2e2', color: '#dc2626', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' }}>
              <Trash2 size={22} />
            </div>
            <h3 style={{ fontSize: 17, fontWeight: 700, color: '#0f172a', margin: '0 0 6px 0' }}>Delete Asset?</h3>
            <p style={{ fontSize: 13, color: '#64748b', margin: '0 0 20px 0', lineHeight: 1.5 }}>
              Are you sure you want to permanently remove <strong>{selectedAsset?.name} ({selectedAsset?.assetCode})</strong> from inventory?
            </p>

            <div style={{ display: 'flex', gap: 10 }}>
              <button type="button" onClick={() => setDeleteModalOpen(false)} style={{ flex: 1, padding: '9px 14px', borderRadius: 8, border: '1px solid #e2e8f0', background: '#fff', fontSize: 13, color: '#64748b', cursor: 'pointer' }}>Cancel</button>
              <button type="button" onClick={handleDeleteConfirm} disabled={actionLoading} style={{ flex: 1, padding: '9px 14px', borderRadius: 8, border: 'none', background: '#dc2626', color: '#fff', fontSize: 13, fontWeight: 600, cursor: actionLoading ? 'not-allowed' : 'pointer' }}>
                {actionLoading ? 'Deleting...' : 'Yes, Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
