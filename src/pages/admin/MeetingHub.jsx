import { useState, useEffect } from 'react'
import {
  Video, Calendar, Clock, MapPin, Plus, Trash2, Edit2,
  ExternalLink, Users, Loader2, X, CheckCircle2
} from 'lucide-react'
import {
  getAllMeetings, createMeeting, updateMeeting, deleteMeeting
} from '../../services/meetingService'
import { getDepartments } from '../../services/departmentService'
import { showSuccess, showError } from '../../utils/toast'

export default function AdminMeetingHub() {
  const [meetings, setMeetings] = useState([])
  const [departments, setDepartments] = useState([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [editingMeeting, setEditingMeeting] = useState(null)

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    meetingDate: new Date().toISOString().split('T')[0],
    startTime: '10:00 AM',
    endTime: '11:00 AM',
    type: 'online',
    meetingLink: '',
    room: '',
    department: '',
    isAllStaff: true,
  })

  const loadData = async () => {
    try {
      setLoading(true)
      const [mRes, dRes] = await Promise.allSettled([
        getAllMeetings(),
        getDepartments(),
      ])

      if (mRes.status === 'fulfilled' && mRes.value?.success) {
        setMeetings(mRes.value.meetings || [])
      }
      if (dRes.status === 'fulfilled' && dRes.value?.departments) {
        setDepartments(dRes.value.departments || [])
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const handleOpenAdd = () => {
    setEditingMeeting(null)
    setFormData({
      title: '',
      description: '',
      meetingDate: new Date().toISOString().split('T')[0],
      startTime: '10:00 AM',
      endTime: '11:00 AM',
      type: 'online',
      meetingLink: 'https://meet.google.com/new',
      room: '',
      department: '',
      isAllStaff: true,
    })
    setModalOpen(true)
  }

  const handleOpenEdit = (m) => {
    setEditingMeeting(m)
    setFormData({
      title: m.title || '',
      description: m.description || '',
      meetingDate: m.meetingDate ? m.meetingDate.split('T')[0] : '',
      startTime: m.startTime || '',
      endTime: m.endTime || '',
      type: m.type || 'online',
      meetingLink: m.meetingLink || '',
      room: m.room || '',
      department: m.department?._id || '',
      isAllStaff: Boolean(m.isAllStaff),
    })
    setModalOpen(true)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!formData.title || !formData.meetingDate || !formData.startTime || !formData.endTime) {
      showError('Please fill in title, date, start time, and end time')
      return
    }

    try {
      setSaving(true)
      if (editingMeeting) {
        await updateMeeting(editingMeeting._id, formData)
        showSuccess('Meeting updated successfully!')
      } else {
        await createMeeting(formData)
        showSuccess('Meeting scheduled and published!')
      }
      setModalOpen(false)
      loadData()
    } catch (err) {
      showError(err.response?.data?.message || 'Failed to save meeting')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to cancel and delete this meeting?')) return
    try {
      await deleteMeeting(id)
      showSuccess('Meeting deleted successfully')
      loadData()
    } catch (err) {
      showError('Failed to delete meeting')
    }
  }

  const totalOnline = meetings.filter((m) => m.type === 'online').length
  const totalInPerson = meetings.filter((m) => m.type === 'in-person').length
  const todayStr = new Date().toISOString().split('T')[0]
  const todayCount = meetings.filter((m) => m.meetingDate?.split('T')[0] === todayStr).length

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* 1. Header Banner */}
      <div
        style={{
          background: 'linear-gradient(135deg, #c0392b 0%, #922b21 60%, #7b241c 100%)',
          borderRadius: 16,
          padding: '24px 28px',
          color: '#fff',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 16,
          boxShadow: '0 4px 12px rgba(192, 57, 43, 0.25)',
        }}
      >
        <div>
          <h2 style={{ fontSize: 22, fontWeight: 700, margin: 0 }}>
            Meeting Hub & Conference Management
          </h2>
          <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.85)', margin: '4px 0 0 0' }}>
            Schedule company-wide briefings, department meetings, and virtual conferencing calls.
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            backgroundColor: '#fff',
            color: '#c0392b',
            border: 'none',
            borderRadius: 8,
            padding: '10px 18px',
            fontWeight: 700,
            fontSize: 13,
            cursor: 'pointer',
            boxShadow: '0 2px 6px rgba(0,0,0,0.15)',
          }}
        >
          <Plus size={16} /> Schedule Meeting
        </button>
      </div>

      {/* 2. Top Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
        <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 14, padding: 18 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: 12, color: '#64748b', fontWeight: 600 }}>Total Meetings</span>
            <Calendar size={16} color="#c0392b" />
          </div>
          <h3 style={{ fontSize: 22, fontWeight: 800, color: '#0f172a', margin: '8px 0 0 0' }}>
            {meetings.length}
          </h3>
        </div>

        <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 14, padding: 18 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: 12, color: '#64748b', fontWeight: 600 }}>Today's Syncs</span>
            <Clock size={16} color="#d97706" />
          </div>
          <h3 style={{ fontSize: 22, fontWeight: 800, color: '#0f172a', margin: '8px 0 0 0' }}>
            {todayCount}
          </h3>
        </div>

        <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 14, padding: 18 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: 12, color: '#64748b', fontWeight: 600 }}>Virtual Video Calls</span>
            <Video size={16} color="#c0392b" />
          </div>
          <h3 style={{ fontSize: 22, fontWeight: 800, color: '#0f172a', margin: '8px 0 0 0' }}>
            {totalOnline}
          </h3>
        </div>

        <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 14, padding: 18 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: 12, color: '#64748b', fontWeight: 600 }}>In-Person Rooms</span>
            <MapPin size={16} color="#16a34a" />
          </div>
          <h3 style={{ fontSize: 22, fontWeight: 800, color: '#0f172a', margin: '8px 0 0 0' }}>
            {totalInPerson}
          </h3>
        </div>
      </div>

      {/* 3. Meetings Table */}
      <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 14, overflow: 'hidden' }}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid #f1f5f9' }}>
          <h3 style={{ fontSize: 15, fontWeight: 700, color: '#0f172a', margin: 0 }}>
            Scheduled Sessions ({meetings.length})
          </h3>
        </div>

        {loading ? (
          <div style={{ padding: 40, textAlign: 'center', color: '#94a3b8' }}>
            <Loader2 className="animate-spin" size={24} style={{ margin: '0 auto 8px' }} />
            <span>Loading meetings...</span>
          </div>
        ) : meetings.length === 0 ? (
          <div style={{ padding: 40, textAlign: 'center', color: '#94a3b8' }}>
            No meetings scheduled yet. Click "Schedule Meeting" to create one.
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13, textAlign: 'left' }}>
              <thead>
                <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#64748b' }}>
                  <th style={{ padding: '12px 18px', fontWeight: 600 }}>Title & Description</th>
                  <th style={{ padding: '12px 18px', fontWeight: 600 }}>Date & Time</th>
                  <th style={{ padding: '12px 18px', fontWeight: 600 }}>Format / Location</th>
                  <th style={{ padding: '12px 18px', fontWeight: 600 }}>Audience</th>
                  <th style={{ padding: '12px 18px', fontWeight: 600, textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {meetings.map((m) => (
                  <tr key={m._id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '14px 18px' }}>
                      <div style={{ fontWeight: 700, color: '#0f172a' }}>{m.title}</div>
                      {m.description && (
                        <div style={{ fontSize: 11, color: '#64748b', marginTop: 2 }}>{m.description}</div>
                      )}
                    </td>
                    <td style={{ padding: '14px 18px' }}>
                      <div style={{ fontWeight: 600, color: '#334155' }}>
                        {new Date(m.meetingDate).toLocaleDateString(undefined, {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </div>
                      <div style={{ fontSize: 11, color: '#64748b' }}>
                        {m.startTime} – {m.endTime}
                      </div>
                    </td>
                    <td style={{ padding: '14px 18px' }}>
                      <span
                        style={{
                          fontSize: 11,
                          fontWeight: 700,
                          borderRadius: 6,
                          padding: '2px 7px',
                          background: m.type === 'online' ? '#fef2f2' : '#fef3c7',
                          color: m.type === 'online' ? '#c0392b' : '#b45309',
                        }}
                      >
                        {m.type === 'online' ? 'Online Video' : 'In-Person'}
                      </span>
                      {m.meetingLink && (
                        <div style={{ marginTop: 4 }}>
                          <a
                            href={m.meetingLink}
                            target="_blank"
                            rel="noreferrer"
                            style={{
                              fontSize: 11,
                              color: '#c0392b',
                              fontWeight: 600,
                              textDecoration: 'none',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: 3,
                            }}
                          >
                            <span>Link</span>
                            <ExternalLink size={10} />
                          </a>
                        </div>
                      )}
                      {m.room && <div style={{ fontSize: 11, color: '#64748b', marginTop: 2 }}>Room: {m.room}</div>}
                    </td>
                    <td style={{ padding: '14px 18px' }}>
                      {m.isAllStaff ? (
                        <span style={{ fontSize: 11, fontWeight: 600, color: '#15803d', background: '#dcfce7', padding: '2px 7px', borderRadius: 6 }}>
                          All Staff
                        </span>
                      ) : m.department ? (
                        <span style={{ fontSize: 11, fontWeight: 600, color: '#7e22ce', background: '#f3e8ff', padding: '2px 7px', borderRadius: 6 }}>
                          {m.department.name}
                        </span>
                      ) : (
                        <span style={{ fontSize: 11, color: '#64748b' }}>Selected</span>
                      )}
                    </td>
                    <td style={{ padding: '14px 18px', textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: 6 }}>
                        <button
                          onClick={() => handleOpenEdit(m)}
                          title="Edit meeting"
                          style={{
                            background: '#f8fafc',
                            border: '1px solid #e2e8f0',
                            borderRadius: 6,
                            padding: 6,
                            cursor: 'pointer',
                            color: '#475569',
                          }}
                        >
                          <Edit2 size={13} />
                        </button>
                        <button
                          onClick={() => handleDelete(m._id)}
                          title="Delete meeting"
                          style={{
                            background: '#fef2f2',
                            border: '1px solid #fee2e2',
                            borderRadius: 6,
                            padding: 6,
                            cursor: 'pointer',
                            color: '#dc2626',
                          }}
                        >
                          <Trash2 size={13} />
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

      {/* 4. Schedule / Edit Modal */}
      {modalOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(15, 23, 42, 0.65)',
            backdropFilter: 'blur(5px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: 20,
          }}
        >
          <div
            style={{
              background: '#fff',
              borderRadius: 16,
              maxWidth: 520,
              width: '100%',
              padding: 24,
              boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)',
              position: 'relative',
              maxHeight: '90vh',
              overflowY: 'auto',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h3 style={{ fontSize: 18, fontWeight: 700, color: '#0f172a', margin: 0 }}>
                {editingMeeting ? 'Edit Scheduled Meeting' : 'Schedule New Meeting'}
              </h3>
              <button
                onClick={() => setModalOpen(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8' }}
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: '#334155', display: 'block', marginBottom: 4 }}>
                  Meeting Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Weekly Operations Sync"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: 13 }}
                />
              </div>

              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: '#334155', display: 'block', marginBottom: 4 }}>
                  Agenda / Description
                </label>
                <textarea
                  rows={2}
                  placeholder="Topics to discuss, preparation details..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: 13 }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: '#334155', display: 'block', marginBottom: 4 }}>
                    Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.meetingDate}
                    onChange={(e) => setFormData({ ...formData, meetingDate: e.target.value })}
                    style={{ width: '100%', padding: '8px 10px', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: 12 }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: '#334155', display: 'block', marginBottom: 4 }}>
                    Start Time *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="10:00 AM"
                    value={formData.startTime}
                    onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                    style={{ width: '100%', padding: '8px 10px', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: 12 }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: '#334155', display: 'block', marginBottom: 4 }}>
                    End Time *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="11:00 AM"
                    value={formData.endTime}
                    onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                    style={{ width: '100%', padding: '8px 10px', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: 12 }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: '#334155', display: 'block', marginBottom: 4 }}>
                    Format
                  </label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    style={{ width: '100%', padding: '8px 10px', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: 12 }}
                  >
                    <option value="online">Online Video Call</option>
                    <option value="in-person">In-Person Meeting</option>
                    <option value="hybrid">Hybrid</option>
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: '#334155', display: 'block', marginBottom: 4 }}>
                    Target Department
                  </label>
                  <select
                    value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value, isAllStaff: false })}
                    style={{ width: '100%', padding: '8px 10px', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: 12 }}
                  >
                    <option value="">All Staff / Open</option>
                    {departments.map((d) => (
                      <option key={d._id} value={d._id}>
                        {d.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: '#334155', display: 'block', marginBottom: 4 }}>
                  Video Call Link (Google Meet / Zoom)
                </label>
                <input
                  type="url"
                  placeholder="https://meet.google.com/xyz-abcd-efg"
                  value={formData.meetingLink}
                  onChange={(e) => setFormData({ ...formData, meetingLink: e.target.value })}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: 13 }}
                />
              </div>

              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: '#334155', display: 'block', marginBottom: 4 }}>
                  Room / Location (if In-Person)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Conference Room 1"
                  value={formData.room}
                  onChange={(e) => setFormData({ ...formData, room: e.target.value })}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: 13 }}
                />
              </div>

              <div style={{ display: 'flex', gap: 10, marginTop: 10 }}>
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  style={{
                    flex: 1,
                    padding: '10px',
                    borderRadius: 8,
                    border: '1px solid #e2e8f0',
                    background: '#fff',
                    color: '#64748b',
                    fontSize: 13,
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  style={{
                    flex: 2,
                    padding: '10px',
                    borderRadius: 8,
                    border: 'none',
                    background: 'linear-gradient(135deg, #c0392b, #922b21)',
                    color: '#fff',
                    fontSize: 13,
                    fontWeight: 600,
                    cursor: saving ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 6,
                  }}
                >
                  {saving ? <Loader2 size={15} className="animate-spin" /> : <CheckCircle2 size={15} />}
                  <span>{editingMeeting ? 'Save Changes' : 'Publish Meeting'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
