import { useState, useEffect } from 'react'
import {
  Compass, Users, Package, Phone, Mail, MapPin,
  Calendar, CheckCircle2, MessageSquare, Plus, Loader2, X
} from 'lucide-react'
import {
  getAllLeads, updateLead, addLeadNote, getAllPackages, createBooking
} from '../../services/crmService'
import { getCurrentUser } from '../../services/authService'
import { showSuccess, showError } from '../../utils/toast'

const STAGES = [
  { id: 'new', label: 'New Lead', color: '#c0392b', bg: '#fef2f2' },
  { id: 'contacted', label: 'Contacted', color: '#7c3aed', bg: '#f5f3ff' },
  { id: 'quotation_sent', label: 'Quote Sent', color: '#d97706', bg: '#fffbeb' },
  { id: 'negotiation', label: 'Negotiation', color: '#ea580c', bg: '#fff7ed' },
  { id: 'converted', label: 'Converted', color: '#16a34a', bg: '#f0fdf4' },
  { id: 'lost', label: 'Lost', color: '#dc2626', bg: '#fef2f2' },
]

export default function EmployeeCRM() {
  const currentUser = getCurrentUser()
  const [leads, setLeads] = useState([])
  const [packages, setPackages] = useState([])
  const [loading, setLoading] = useState(true)
  const [noteModalOpen, setNoteModalOpen] = useState(false)
  const [selectedLead, setSelectedLead] = useState(null)
  const [noteText, setNoteText] = useState('')
  const [bookingModalOpen, setBookingModalOpen] = useState(false)
  const [actionLoading, setActionLoading] = useState(false)

  const [bookingForm, setBookingForm] = useState({
    customerName: '',
    customerPhone: '',
    customerEmail: '',
    packageId: '',
    travelDate: '',
    totalAmount: '',
    paidAmount: '',
  })

  const loadData = async () => {
    try {
      setLoading(true)
      const [lRes, pRes] = await Promise.allSettled([
        getAllLeads(),
        getAllPackages(),
      ])
      if (lRes.status === 'fulfilled' && lRes.value?.success) {
        setLeads(lRes.value.leads || [])
      }
      if (pRes.status === 'fulfilled' && pRes.value?.success) {
        setPackages(pRes.value.packages || [])
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

  const handleStageChange = async (leadId, newStage) => {
    try {
      await updateLead(leadId, { stage: newStage })
      showSuccess(`Lead moved to ${newStage.replace('_', ' ')}`)
      loadData()
    } catch {
      showError('Failed to update stage')
    }
  }

  const handleAddNote = async (e) => {
    e.preventDefault()
    if (!noteText.trim() || !selectedLead) return
    try {
      setActionLoading(true)
      await addLeadNote(selectedLead._id, noteText.trim())
      showSuccess('Client update logged')
      setNoteModalOpen(false)
      setNoteText('')
      loadData()
    } catch {
      showError('Failed to add note')
    } finally {
      setActionLoading(false)
    }
  }

  const handleCreateBooking = async (e) => {
    e.preventDefault()
    try {
      setActionLoading(true)
      await createBooking(bookingForm)
      showSuccess('Booking registered successfully!')
      setBookingModalOpen(false)
      loadData()
    } catch (err) {
      showError(err.response?.data?.message || 'Failed to register booking')
    } finally {
      setActionLoading(false)
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* 1. Header Spotlight */}
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
          <span style={{ fontSize: 11, fontWeight: 700, background: 'rgba(255,255,255,0.2)', padding: '3px 10px', borderRadius: 12, textTransform: 'uppercase' }}>
            AGENT WORKSPACE
          </span>
          <h2 style={{ fontSize: 22, fontWeight: 800, margin: '8px 0 4px 0' }}>
            Travel Consultant CRM
          </h2>
          <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.85)', margin: 0 }}>
            Connect with customer travel inquiries, share itineraries, and confirm bookings.
          </p>
        </div>

        <button
          onClick={() => {
            setBookingForm({
              customerName: '', customerPhone: '', customerEmail: '',
              packageId: '', travelDate: '', totalAmount: '', paidAmount: '',
            })
            setBookingModalOpen(true)
          }}
          style={{
            display: 'flex', alignItems: 'center', gap: 6,
            background: '#fff', color: '#c0392b', border: 'none',
            borderRadius: 8, padding: '10px 18px', fontWeight: 700, fontSize: 13,
            cursor: 'pointer', boxShadow: '0 2px 6px rgba(0,0,0,0.15)',
          }}
        >
          <Plus size={16} /> Book Client Tour
        </button>
      </div>

      {/* 2. Customer Leads Section */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
          <h3 style={{ fontSize: 16, fontWeight: 700, color: '#0f172a', margin: 0 }}>
            Customer Inquiries & Opportunities ({leads.length})
          </h3>
        </div>

        {loading ? (
          <div style={{ padding: 40, textAlign: 'center', color: '#94a3b8' }}>
            <Loader2 className="animate-spin" size={24} style={{ margin: '0 auto 8px' }} />
            <span>Loading inquiries...</span>
          </div>
        ) : leads.length === 0 ? (
          <div style={{ background: '#fff', borderRadius: 12, padding: 30, textAlign: 'center', color: '#94a3b8', border: '1px solid #e2e8f0' }}>
            No customer inquiries assigned currently.
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 14 }}>
            {leads.map((lead) => {
              const currentStage = STAGES.find((s) => s.id === lead.stage) || STAGES[0]
              return (
                <div
                  key={lead._id}
                  style={{
                    background: '#fff',
                    borderRadius: 12,
                    border: '1px solid #e2e8f0',
                    padding: 16,
                    boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    gap: 12,
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: 10, fontWeight: 700, color: '#94a3b8' }}>{lead.leadId}</span>
                      <span
                        style={{
                          fontSize: 10, fontWeight: 700, textTransform: 'uppercase',
                          padding: '2px 7px', borderRadius: 6,
                          background: currentStage.bg, color: currentStage.color,
                        }}
                      >
                        {currentStage.label}
                      </span>
                    </div>

                    <h4 style={{ fontSize: 15, fontWeight: 700, color: '#0f172a', margin: '6px 0 2px 0' }}>
                      {lead.customerName}
                    </h4>

                    <div style={{ fontSize: 13, color: '#c0392b', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}>
                      <Compass size={13} /> {lead.destination}
                    </div>

                    <div style={{ fontSize: 12, color: '#64748b', marginTop: 8, display: 'flex', flexDirection: 'column', gap: 4 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <Phone size={12} color="#64748b" />
                        <a href={`tel:${lead.phone}`} style={{ color: '#c0392b', textDecoration: 'none', fontWeight: 600 }}>
                          {lead.phone}
                        </a>
                      </div>
                      {lead.email && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <Mail size={12} color="#64748b" />
                          <span>{lead.email}</span>
                        </div>
                      )}
                      {lead.budget > 0 && <div>💰 Est. Budget: ₹{lead.budget.toLocaleString()}</div>}
                    </div>
                  </div>

                  <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: 10, display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
                    <select
                      value={lead.stage}
                      onChange={(e) => handleStageChange(lead._id, e.target.value)}
                      style={{
                        fontSize: 11, padding: '4px 8px', borderRadius: 6,
                        border: '1px solid #cbd5e1', cursor: 'pointer', background: '#f8fafc',
                      }}
                    >
                      {STAGES.map((s) => (
                        <option key={s.id} value={s.id}>{s.label}</option>
                      ))}
                    </select>

                    <button
                      onClick={() => {
                        setSelectedLead(lead)
                        setNoteModalOpen(true)
                      }}
                      style={{
                        background: '#f1f5f9', border: 'none', borderRadius: 6,
                        padding: '5px 10px', fontSize: 11, fontWeight: 600, color: '#475569',
                        cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4,
                      }}
                    >
                      <MessageSquare size={12} />
                      <span>Notes ({lead.notes?.length || 0})</span>
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* 3. Catalog Reference */}
      <div>
        <h3 style={{ fontSize: 16, fontWeight: 700, color: '#0f172a', marginBottom: 12 }}>
          Popular Packages Catalog ({packages.length})
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 14 }}>
          {packages.map((pkg) => (
            <div
              key={pkg._id}
              style={{
                background: '#fff', border: '1px solid #e2e8f0', borderRadius: 12,
                padding: 16, boxShadow: '0 1px 2px rgba(0,0,0,0.02)',
              }}
            >
              <div style={{ fontSize: 10, fontWeight: 700, color: '#c0392b' }}>{pkg.packageCode}</div>
              <h4 style={{ fontSize: 14, fontWeight: 700, color: '#0f172a', margin: '4px 0 2px 0' }}>
                {pkg.title}
              </h4>
              <div style={{ fontSize: 12, color: '#64748b' }}>
                {pkg.destination} • {pkg.durationDays}D/{pkg.durationNights}N
              </div>
              <div style={{ marginTop: 8, fontSize: 16, fontWeight: 800, color: '#16a34a' }}>
                ₹{pkg.pricePerPerson.toLocaleString()} <span style={{ fontSize: 11, fontWeight: 500, color: '#64748b' }}>/ person</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Modals */}
      {noteModalOpen && selectedLead && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.65)', backdropFilter: 'blur(5px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 20 }}>
          <div style={{ background: '#fff', borderRadius: 16, maxWidth: 420, width: '100%', padding: 22 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <h3 style={{ fontSize: 16, fontWeight: 700, color: '#0f172a', margin: 0 }}>Client Notes: {selectedLead.customerName}</h3>
              <button onClick={() => setNoteModalOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8' }}><X size={16} /></button>
            </div>

            <div style={{ maxHeight: 160, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 12 }}>
              {selectedLead.notes?.length === 0 ? (
                <div style={{ fontSize: 12, color: '#94a3b8' }}>No notes yet.</div>
              ) : (
                selectedLead.notes.map((n, i) => (
                  <div key={i} style={{ background: '#f8fafc', padding: 8, borderRadius: 6, fontSize: 11.5, border: '1px solid #e2e8f0' }}>
                    <div>{n.text}</div>
                    <div style={{ fontSize: 9.5, color: '#94a3b8', marginTop: 3 }}>
                      {new Date(n.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                ))
              )}
            </div>

            <form onSubmit={handleAddNote} style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <textarea rows={2} required placeholder="Log client feedback / follow-up..." value={noteText} onChange={(e) => setNoteText(e.target.value)} style={{ width: '100%', padding: '8px 10px', borderRadius: 6, border: '1px solid #cbd5e1', fontSize: 12 }} />
              <div style={{ display: 'flex', gap: 8 }}>
                <button type="button" onClick={() => setNoteModalOpen(false)} style={{ flex: 1, padding: 8, borderRadius: 6, border: '1px solid #e2e8f0', background: '#fff', fontSize: 12, cursor: 'pointer' }}>Close</button>
                <button type="submit" disabled={actionLoading} style={{ flex: 1, padding: 8, borderRadius: 6, border: 'none', background: '#c0392b', color: '#fff', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>Save Note</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Book Client Modal */}
      {bookingModalOpen && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.65)', backdropFilter: 'blur(5px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 20 }}>
          <div style={{ background: '#fff', borderRadius: 16, maxWidth: 460, width: '100%', padding: 24 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
              <h3 style={{ fontSize: 17, fontWeight: 700, color: '#0f172a', margin: 0 }}>Register Customer Booking</h3>
              <button onClick={() => setBookingModalOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8' }}><X size={16} /></button>
            </div>

            <form onSubmit={handleCreateBooking} style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <div>
                <label style={{ fontSize: 11, fontWeight: 600, color: '#334155', display: 'block', marginBottom: 3 }}>Customer Name *</label>
                <input type="text" required value={bookingForm.customerName} onChange={(e) => setBookingForm({ ...bookingForm, customerName: e.target.value })} style={{ width: '100%', padding: '7px 10px', borderRadius: 6, border: '1px solid #cbd5e1', fontSize: 12 }} />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                <div>
                  <label style={{ fontSize: 11, fontWeight: 600, color: '#334155', display: 'block', marginBottom: 3 }}>Phone *</label>
                  <input type="tel" required value={bookingForm.customerPhone} onChange={(e) => setBookingForm({ ...bookingForm, customerPhone: e.target.value })} style={{ width: '100%', padding: '7px 10px', borderRadius: 6, border: '1px solid #cbd5e1', fontSize: 12 }} />
                </div>
                <div>
                  <label style={{ fontSize: 11, fontWeight: 600, color: '#334155', display: 'block', marginBottom: 3 }}>Travel Date *</label>
                  <input type="date" required value={bookingForm.travelDate} onChange={(e) => setBookingForm({ ...bookingForm, travelDate: e.target.value })} style={{ width: '100%', padding: '7px 10px', borderRadius: 6, border: '1px solid #cbd5e1', fontSize: 12 }} />
                </div>
              </div>

              <div>
                <label style={{ fontSize: 11, fontWeight: 600, color: '#334155', display: 'block', marginBottom: 3 }}>Select Package</label>
                <select value={bookingForm.packageId} onChange={(e) => setBookingForm({ ...bookingForm, packageId: e.target.value })} style={{ width: '100%', padding: '7px 10px', borderRadius: 6, border: '1px solid #cbd5e1', fontSize: 12 }}>
                  <option value="">Custom Itinerary</option>
                  {packages.map((p) => (
                    <option key={p._id} value={p._id}>{p.title} (₹{p.pricePerPerson})</option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                <div>
                  <label style={{ fontSize: 11, fontWeight: 600, color: '#334155', display: 'block', marginBottom: 3 }}>Total Amount (₹) *</label>
                  <input type="number" required value={bookingForm.totalAmount} onChange={(e) => setBookingForm({ ...bookingForm, totalAmount: e.target.value })} style={{ width: '100%', padding: '7px 10px', borderRadius: 6, border: '1px solid #cbd5e1', fontSize: 12 }} />
                </div>
                <div>
                  <label style={{ fontSize: 11, fontWeight: 600, color: '#334155', display: 'block', marginBottom: 3 }}>Paid Amount (₹)</label>
                  <input type="number" value={bookingForm.paidAmount} onChange={(e) => setBookingForm({ ...bookingForm, paidAmount: e.target.value })} style={{ width: '100%', padding: '7px 10px', borderRadius: 6, border: '1px solid #cbd5e1', fontSize: 12 }} />
                </div>
              </div>

              <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                <button type="button" onClick={() => setBookingModalOpen(false)} style={{ flex: 1, padding: 8, borderRadius: 6, border: '1px solid #e2e8f0', background: '#fff', fontSize: 12, cursor: 'pointer' }}>Cancel</button>
                <button type="submit" disabled={actionLoading} style={{ flex: 2, padding: 8, borderRadius: 6, border: 'none', background: '#16a34a', color: '#fff', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>Confirm Booking</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
