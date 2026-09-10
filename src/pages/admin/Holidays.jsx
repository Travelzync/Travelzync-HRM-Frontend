import { useState, useEffect, useMemo } from 'react'
import {
  Gift, Plus, Calendar, Edit2, Trash2, X, Loader2,
  Sparkles, CheckCircle2, AlertCircle, Info, Clock
} from 'lucide-react'
import {
  getAllHolidays, createHoliday, updateHoliday, deleteHoliday
} from '../../services/holidayService'
import { showSuccess, showError, showWarning } from '../../utils/toast'

const HOLIDAY_TYPES = [
  { value: 'ALL', label: 'All Holiday Types' },
  { value: 'public', label: 'Public Holiday' },
  { value: 'national', label: 'National Holiday' },
  { value: 'optional', label: 'Optional / Restricted' },
  { value: 'company_specific', label: 'Company Specific' },
]

export default function Holidays() {
  const [holidays, setHolidays] = useState([])
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(false)
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear())
  const [typeFilter, setTypeFilter] = useState('ALL')

  // Modals
  const [addModalOpen, setAddModalOpen] = useState(false)
  const [editModalOpen, setEditModalOpen] = useState(false)
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [selectedHoliday, setSelectedHoliday] = useState(null)

  const [form, setForm] = useState({
    name: '',
    date: '',
    endDate: '',
    type: 'public',
    description: '',
    isMandatory: true,
  })

  const fetchHolidays = async () => {
    try {
      setLoading(true)
      const res = await getAllHolidays({ year: selectedYear, type: typeFilter })
      if (res?.holidays) setHolidays(res.holidays)
    } catch (err) {
      showError(err.response?.data?.message || 'Failed to load holidays')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchHolidays()
  }, [selectedYear, typeFilter])

  // Summary Metrics
  const totalCount = holidays.length
  const publicCount = holidays.filter((h) => h.type === 'public' || h.type === 'national').length
  const optionalCount = holidays.filter((h) => h.type === 'optional').length

  const formatDate = (dateStr) => {
    if (!dateStr) return '-'
    const d = new Date(dateStr)
    return d.toLocaleDateString(undefined, {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    })
  }

  // Open Add
  const handleOpenAdd = () => {
    setForm({
      name: '',
      date: new Date().toISOString().split('T')[0],
      endDate: '',
      type: 'public',
      description: '',
      isMandatory: true,
    })
    setAddModalOpen(true)
  }

  // Handle Add Submit
  const handleAddSubmit = async (e) => {
    e.preventDefault()
    if (!form.name.trim() || !form.date) {
      showWarning('Holiday name and date are required')
      return
    }

    try {
      setActionLoading(true)
      const res = await createHoliday(form)
      showSuccess(res.message || 'Holiday added successfully!')
      setAddModalOpen(false)
      fetchHolidays()
    } catch (err) {
      showError(err.response?.data?.message || 'Failed to add holiday')
    } finally {
      setActionLoading(false)
    }
  }

  // Open Edit
  const handleOpenEdit = (h) => {
    setSelectedHoliday(h)
    setForm({
      name: h.name || '',
      date: h.date ? h.date.split('T')[0] : '',
      endDate: h.endDate ? h.endDate.split('T')[0] : '',
      type: h.type || 'public',
      description: h.description || '',
      isMandatory: h.isMandatory !== false,
    })
    setEditModalOpen(true)
  }

  // Handle Edit Submit
  const handleEditSubmit = async (e) => {
    e.preventDefault()
    if (!selectedHoliday) return

    try {
      setActionLoading(true)
      const res = await updateHoliday(selectedHoliday._id, form)
      showSuccess(res.message || 'Holiday updated successfully!')
      setEditModalOpen(false)
      setSelectedHoliday(null)
      fetchHolidays()
    } catch (err) {
      showError(err.response?.data?.message || 'Failed to update holiday')
    } finally {
      setActionLoading(false)
    }
  }

  // Open Delete
  const handleOpenDelete = (h) => {
    setSelectedHoliday(h)
    setDeleteModalOpen(true)
  }

  // Handle Delete Confirm
  const handleDeleteConfirm = async () => {
    if (!selectedHoliday) return

    try {
      setActionLoading(true)
      const res = await deleteHoliday(selectedHoliday._id)
      showSuccess(res.message || 'Holiday deleted successfully!')
      setDeleteModalOpen(false)
      setSelectedHoliday(null)
      fetchHolidays()
    } catch (err) {
      showError(err.response?.data?.message || 'Failed to delete holiday')
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
          <h2 style={{ fontSize: 22, fontWeight: 700, margin: 0 }}>Company Holiday Calendar</h2>
          <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.85)', margin: '4px 0 0 0' }}>
            Declare and manage public holidays, religious festivals, and company off-days.
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
          <span>Add Holiday</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
        <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 14, padding: 18 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ width: 34, height: 34, borderRadius: 10, background: '#fef2f2', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#c0392b' }}>
              <Calendar size={17} />
            </div>
            <span style={{ fontSize: 11, fontWeight: 600, color: '#c0392b', background: '#fee2e2', padding: '2px 8px', borderRadius: 10 }}>{selectedYear}</span>
          </div>
          <h3 style={{ fontSize: 22, fontWeight: 800, color: '#0f172a', margin: '12px 0 2px 0' }}>{totalCount}</h3>
          <p style={{ fontSize: 12, color: '#64748b', margin: 0 }}>Total Holidays in {selectedYear}</p>
        </div>

        <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 14, padding: 18 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ width: 34, height: 34, borderRadius: 10, background: '#f0fdf4', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#16a34a' }}>
              <CheckCircle2 size={17} />
            </div>
            <span style={{ fontSize: 11, fontWeight: 600, color: '#16a34a', background: '#dcfce7', padding: '2px 8px', borderRadius: 10 }}>Mandatory</span>
          </div>
          <h3 style={{ fontSize: 22, fontWeight: 800, color: '#0f172a', margin: '12px 0 2px 0' }}>{publicCount}</h3>
          <p style={{ fontSize: 12, color: '#64748b', margin: 0 }}>Public & National Off-Days</p>
        </div>

        <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 14, padding: 18 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ width: 34, height: 34, borderRadius: 10, background: '#fefce8', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ca8a04' }}>
              <Gift size={17} />
            </div>
            <span style={{ fontSize: 11, fontWeight: 600, color: '#ca8a04', background: '#fef9c3', padding: '2px 8px', borderRadius: 10 }}>Optional</span>
          </div>
          <h3 style={{ fontSize: 22, fontWeight: 800, color: '#0f172a', margin: '12px 0 2px 0' }}>{optionalCount}</h3>
          <p style={{ fontSize: 12, color: '#64748b', margin: 0 }}>Restricted / Floating Holidays</p>
        </div>
      </div>

      {/* Main Table Container */}
      <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #e2e8f0', overflow: 'hidden' }}>
        {/* Controls */}
        <div style={{
          padding: '16px 20px', borderBottom: '1px solid #f1f5f9',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          flexWrap: 'wrap', gap: 12,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: 13, fontWeight: 600, color: '#334155' }}>Year:</span>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(Number(e.target.value))}
              style={{ padding: '6px 14px', borderRadius: 8, border: '1px solid #cbd5e1', background: '#f8fafc', fontSize: 12.5, fontWeight: 600, color: '#0f172a', outline: 'none', cursor: 'pointer' }}
            >
              {[2025, 2026, 2027, 2028].map((y) => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
          </div>

          <div style={{ display: 'flex', gap: 10 }}>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              style={{ padding: '6px 12px', borderRadius: 8, border: '1px solid #e2e8f0', background: '#f8fafc', fontSize: 12, color: '#334155', outline: 'none', cursor: 'pointer' }}
            >
              {HOLIDAY_TYPES.map((t) => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Table */}
        <div style={{ overflowX: 'auto' }}>
          {loading ? (
            <div style={{ padding: 48, textAlign: 'center', color: '#64748b' }}>
              <Loader2 size={24} className="animate-spin" style={{ margin: '0 auto 8px' }} />
              <p style={{ fontSize: 13 }}>Loading holiday calendar...</p>
            </div>
          ) : holidays.length === 0 ? (
            <div style={{ padding: 48, textAlign: 'center', color: '#64748b' }}>
              <Gift size={32} color="#cbd5e1" style={{ margin: '0 auto 8px' }} />
              <p style={{ fontSize: 14, fontWeight: 600, color: '#334155' }}>No holidays registered for {selectedYear}</p>
              <p style={{ fontSize: 12, color: '#94a3b8' }}>Click 'Add Holiday' to schedule dates on the company calendar.</p>
            </div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
              <thead>
                <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#64748b', textAlign: 'left' }}>
                  <th style={{ padding: '12px 18px', fontWeight: 600 }}>Holiday Name</th>
                  <th style={{ padding: '12px 18px', fontWeight: 600 }}>Date</th>
                  <th style={{ padding: '12px 18px', fontWeight: 600 }}>Day</th>
                  <th style={{ padding: '12px 18px', fontWeight: 600 }}>Type</th>
                  <th style={{ padding: '12px 18px', fontWeight: 600 }}>Mandatory</th>
                  <th style={{ padding: '12px 18px', fontWeight: 600 }}>Description</th>
                  <th style={{ padding: '12px 18px', fontWeight: 600, textAlign: 'center' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {holidays.map((h) => (
                  <tr
                    key={h._id}
                    style={{ borderBottom: '1px solid #f1f5f9', transition: 'background 0.15s' }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = '#fafafa')}
                    onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                  >
                    <td style={{ padding: '14px 18px', fontWeight: 700, color: '#0f172a' }}>
                      {h.name}
                    </td>
                    <td style={{ padding: '14px 18px', color: '#1e293b', fontWeight: 500 }}>
                      {formatDate(h.date)} {h.endDate ? `→ ${formatDate(h.endDate)}` : ''}
                    </td>
                    <td style={{ padding: '14px 18px', color: '#64748b' }}>
                      {h.dayOfWeek || '-'}
                    </td>
                    <td style={{ padding: '14px 18px' }}>
                      <span style={{
                        padding: '3px 9px', borderRadius: 8, fontSize: 11, fontWeight: 600, textTransform: 'capitalize',
                        background: h.type === 'public' || h.type === 'national' ? '#dcfce7' : h.type === 'optional' ? '#fef3c7' : '#e0e7ff',
                        color: h.type === 'public' || h.type === 'national' ? '#15803d' : h.type === 'optional' ? '#b45309' : '#4338ca',
                      }}>
                        {h.type?.replace('_', ' ')}
                      </span>
                    </td>
                    <td style={{ padding: '14px 18px' }}>
                      {h.isMandatory ? (
                        <span style={{ color: '#16a34a', fontWeight: 600, fontSize: 12 }}>✓ Yes</span>
                      ) : (
                        <span style={{ color: '#94a3b8', fontSize: 12 }}>Optional</span>
                      )}
                    </td>
                    <td style={{ padding: '14px 18px', color: '#64748b', fontSize: 12 }}>
                      {h.description || '-'}
                    </td>
                    <td style={{ padding: '14px 18px', textAlign: 'center' }}>
                      <div style={{ display: 'inline-flex', gap: 6 }}>
                        <button
                          onClick={() => handleOpenEdit(h)}
                          title="Edit Holiday"
                          style={{ background: '#f1f5f9', border: 'none', borderRadius: 6, padding: 6, cursor: 'pointer', color: '#475569' }}
                        >
                          <Edit2 size={13} />
                        </button>
                        <button
                          onClick={() => handleOpenDelete(h)}
                          title="Delete Holiday"
                          style={{ background: '#fef2f2', border: 'none', borderRadius: 6, padding: 6, cursor: 'pointer', color: '#dc2626' }}
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Add Holiday Modal */}
      {addModalOpen && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.65)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 20 }}>
          <div style={{ background: '#fff', borderRadius: 16, maxWidth: 440, width: '100%', padding: 24 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h3 style={{ fontSize: 17, fontWeight: 700, color: '#0f172a', margin: 0 }}>Add Company Holiday</h3>
              <button onClick={() => setAddModalOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8' }}><X size={18} /></button>
            </div>

            <form onSubmit={handleAddSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div>
                <label style={{ fontSize: 11, fontWeight: 600, color: '#334155', display: 'block', marginBottom: 4 }}>Holiday Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Independence Day, Eid, Onam"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: 12.5, outline: 'none' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <div>
                  <label style={{ fontSize: 11, fontWeight: 600, color: '#334155', display: 'block', marginBottom: 4 }}>Date *</label>
                  <input
                    type="date"
                    required
                    value={form.date}
                    onChange={(e) => setForm({ ...form, date: e.target.value })}
                    style={{ width: '100%', padding: '8px 10px', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: 12, outline: 'none' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: 11, fontWeight: 600, color: '#334155', display: 'block', marginBottom: 4 }}>Holiday Type</label>
                  <select
                    value={form.type}
                    onChange={(e) => setForm({ ...form, type: e.target.value })}
                    style={{ width: '100%', padding: '8px 10px', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: 12, outline: 'none' }}
                  >
                    {HOLIDAY_TYPES.filter((t) => t.value !== 'ALL').map((t) => (
                      <option key={t.value} value={t.value}>{t.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label style={{ fontSize: 11, fontWeight: 600, color: '#334155', display: 'block', marginBottom: 4 }}>Description / Greetings</label>
                <textarea
                  rows="2"
                  placeholder="e.g. National holiday celebrating the declaration of independence..."
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: 12, outline: 'none' }}
                />
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <input
                  type="checkbox"
                  id="isMandatory"
                  checked={form.isMandatory}
                  onChange={(e) => setForm({ ...form, isMandatory: e.target.checked })}
                  style={{ cursor: 'pointer', width: 16, height: 16 }}
                />
                <label htmlFor="isMandatory" style={{ fontSize: 12, color: '#334155', cursor: 'pointer', fontWeight: 500 }}>
                  Mandatory Paid Company Off-Day
                </label>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 10 }}>
                <button type="button" onClick={() => setAddModalOpen(false)} style={{ padding: '8px 16px', borderRadius: 8, border: '1px solid #e2e8f0', background: '#fff', fontSize: 13, color: '#64748b', cursor: 'pointer' }}>Cancel</button>
                <button type="submit" disabled={actionLoading} style={{ padding: '8px 18px', borderRadius: 8, border: 'none', background: 'linear-gradient(135deg, #c0392b, #922b21)', color: '#fff', fontSize: 13, fontWeight: 600, cursor: actionLoading ? 'not-allowed' : 'pointer' }}>
                  {actionLoading ? 'Saving...' : 'Add to Calendar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Holiday Modal */}
      {editModalOpen && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.65)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 20 }}>
          <div style={{ background: '#fff', borderRadius: 16, maxWidth: 440, width: '100%', padding: 24 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h3 style={{ fontSize: 17, fontWeight: 700, color: '#0f172a', margin: 0 }}>Edit Holiday</h3>
              <button onClick={() => setEditModalOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8' }}><X size={18} /></button>
            </div>

            <form onSubmit={handleEditSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div>
                <label style={{ fontSize: 11, fontWeight: 600, color: '#334155', display: 'block', marginBottom: 4 }}>Holiday Title</label>
                <input
                  type="text"
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: 12.5, outline: 'none' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <div>
                  <label style={{ fontSize: 11, fontWeight: 600, color: '#334155', display: 'block', marginBottom: 4 }}>Date</label>
                  <input
                    type="date"
                    required
                    value={form.date}
                    onChange={(e) => setForm({ ...form, date: e.target.value })}
                    style={{ width: '100%', padding: '8px 10px', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: 12, outline: 'none' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: 11, fontWeight: 600, color: '#334155', display: 'block', marginBottom: 4 }}>Type</label>
                  <select
                    value={form.type}
                    onChange={(e) => setForm({ ...form, type: e.target.value })}
                    style={{ width: '100%', padding: '8px 10px', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: 12, outline: 'none' }}
                  >
                    {HOLIDAY_TYPES.filter((t) => t.value !== 'ALL').map((t) => (
                      <option key={t.value} value={t.value}>{t.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label style={{ fontSize: 11, fontWeight: 600, color: '#334155', display: 'block', marginBottom: 4 }}>Description</label>
                <textarea
                  rows="2"
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: 12, outline: 'none' }}
                />
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <input
                  type="checkbox"
                  id="editIsMandatory"
                  checked={form.isMandatory}
                  onChange={(e) => setForm({ ...form, isMandatory: e.target.checked })}
                  style={{ cursor: 'pointer', width: 16, height: 16 }}
                />
                <label htmlFor="editIsMandatory" style={{ fontSize: 12, color: '#334155', cursor: 'pointer', fontWeight: 500 }}>
                  Mandatory Paid Company Off-Day
                </label>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 10 }}>
                <button type="button" onClick={() => setEditModalOpen(false)} style={{ padding: '8px 16px', borderRadius: 8, border: '1px solid #e2e8f0', background: '#fff', fontSize: 13, color: '#64748b', cursor: 'pointer' }}>Cancel</button>
                <button type="submit" disabled={actionLoading} style={{ padding: '8px 18px', borderRadius: 8, border: 'none', background: 'linear-gradient(135deg, #c0392b, #922b21)', color: '#fff', fontSize: 13, fontWeight: 600, cursor: actionLoading ? 'not-allowed' : 'pointer' }}>
                  {actionLoading ? 'Saving...' : 'Save Changes'}
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
            <h3 style={{ fontSize: 17, fontWeight: 700, color: '#0f172a', margin: '0 0 6px 0' }}>Delete Holiday?</h3>
            <p style={{ fontSize: 13, color: '#64748b', margin: '0 0 20px 0' }}>
              Are you sure you want to remove <strong>{selectedHoliday?.name}</strong> from the holiday calendar?
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
