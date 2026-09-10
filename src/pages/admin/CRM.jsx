import { useState, useEffect } from 'react'
import {
  Compass, Users, Package, DollarSign, Plus, CheckCircle2,
  Clock, Phone, Mail, MapPin, Search, Edit2, Trash2,
  Calendar, Tag, ChevronRight, Loader2, X, MessageSquare
} from 'lucide-react'
import {
  getCRMStats, getAllLeads, createLead, updateLead, addLeadNote, deleteLead,
  getAllPackages, createPackage, updatePackage, deletePackage,
  getAllBookings, createBooking, updateBooking, deleteBooking
} from '../../services/crmService'
import { getEmployees } from '../../services/employeeService'
import { showSuccess, showError } from '../../utils/toast'

const STAGES = [
  { id: 'new', label: 'New Lead', color: '#c0392b', bg: '#fef2f2' },
  { id: 'contacted', label: 'Contacted', color: '#7c3aed', bg: '#f5f3ff' },
  { id: 'quotation_sent', label: 'Quote Sent', color: '#d97706', bg: '#fffbeb' },
  { id: 'negotiation', label: 'Negotiation', color: '#ea580c', bg: '#fff7ed' },
  { id: 'converted', label: 'Converted', color: '#16a34a', bg: '#f0fdf4' },
  { id: 'lost', label: 'Lost', color: '#dc2626', bg: '#fef2f2' },
]

export default function AdminCRM() {
  const [activeTab, setActiveTab] = useState('pipeline')
  const [stats, setStats] = useState(null)
  const [leads, setLeads] = useState([])
  const [packages, setPackages] = useState([])
  const [bookings, setBookings] = useState([])
  const [employees, setEmployees] = useState([])
  const [loading, setLoading] = useState(true)

  // Modals
  const [leadModalOpen, setLeadModalOpen] = useState(false)
  const [packageModalOpen, setPackageModalOpen] = useState(false)
  const [bookingModalOpen, setBookingModalOpen] = useState(false)
  const [noteModalOpen, setNoteModalOpen] = useState(false)
  const [selectedLeadForNote, setSelectedLeadForNote] = useState(null)
  const [noteText, setNoteText] = useState('')
  const [actionLoading, setActionLoading] = useState(false)

  // Forms
  const [leadForm, setLeadForm] = useState({
    customerName: '',
    email: '',
    phone: '',
    destination: '',
    budget: '',
    travelersCount: 2,
    travelDate: '',
    source: 'website',
    assignedTo: '',
  })

  const [packageForm, setPackageForm] = useState({
    title: '',
    destination: '',
    durationDays: 4,
    durationNights: 3,
    pricePerPerson: '',
    inclusions: 'Flight, 4-Star Resort, Breakfast, Airport Transfer',
    exclusions: 'Personal Expenses, Lunch',
    overview: '',
  })

  const [bookingForm, setBookingForm] = useState({
    customerName: '',
    customerEmail: '',
    customerPhone: '',
    packageId: '',
    travelDate: '',
    travelersCount: 2,
    totalAmount: '',
    paidAmount: '',
    paymentStatus: 'unpaid',
  })

  const loadAllCRMData = async () => {
    try {
      setLoading(true)
      const [sRes, lRes, pRes, bRes, eRes] = await Promise.allSettled([
        getCRMStats(),
        getAllLeads(),
        getAllPackages(),
        getAllBookings(),
        getEmployees(),
      ])

      if (sRes.status === 'fulfilled' && sRes.value?.success) setStats(sRes.value.stats)
      if (lRes.status === 'fulfilled' && lRes.value?.success) setLeads(lRes.value.leads || [])
      if (pRes.status === 'fulfilled' && pRes.value?.success) setPackages(pRes.value.packages || [])
      if (bRes.status === 'fulfilled' && bRes.value?.success) setBookings(bRes.value.bookings || [])
      if (eRes.status === 'fulfilled' && eRes.value?.employees) setEmployees(eRes.value.employees || [])
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadAllCRMData()
  }, [])

  // Lead Actions
  const handleCreateLead = async (e) => {
    e.preventDefault()
    try {
      setActionLoading(true)
      await createLead(leadForm)
      showSuccess('New inquiry lead added successfully!')
      setLeadModalOpen(false)
      setLeadForm({
        customerName: '', email: '', phone: '', destination: '',
        budget: '', travelersCount: 2, travelDate: '', source: 'website', assignedTo: ''
      })
      loadAllCRMData()
    } catch (err) {
      showError(err.response?.data?.message || 'Failed to create lead')
    } finally {
      setActionLoading(false)
    }
  }

  const handleStageChange = async (leadId, newStage) => {
    try {
      await updateLead(leadId, { stage: newStage })
      showSuccess(`Lead moved to ${newStage.replace('_', ' ')}`)
      loadAllCRMData()
    } catch (err) {
      showError('Failed to update stage')
    }
  }

  const handleAddNote = async (e) => {
    e.preventDefault()
    if (!noteText.trim() || !selectedLeadForNote) return
    try {
      setActionLoading(true)
      await addLeadNote(selectedLeadForNote._id, noteText.trim())
      showSuccess('Client note added')
      setNoteModalOpen(false)
      setNoteText('')
      loadAllCRMData()
    } catch (err) {
      showError('Failed to add note')
    } finally {
      setActionLoading(false)
    }
  }

  const handleDeleteLead = async (id) => {
    if (!window.confirm('Delete this lead inquiry?')) return
    try {
      await deleteLead(id)
      showSuccess('Lead deleted')
      loadAllCRMData()
    } catch {
      showError('Failed to delete lead')
    }
  }

  // Package Actions
  const handleCreatePackage = async (e) => {
    e.preventDefault()
    try {
      setActionLoading(true)
      await createPackage({
        ...packageForm,
        inclusions: packageForm.inclusions.split(',').map((s) => s.trim()),
        exclusions: packageForm.exclusions.split(',').map((s) => s.trim()),
      })
      showSuccess('Tour package added to catalog!')
      setPackageModalOpen(false)
      loadAllCRMData()
    } catch (err) {
      showError(err.response?.data?.message || 'Failed to create package')
    } finally {
      setActionLoading(false)
    }
  }

  const handleDeletePackage = async (id) => {
    if (!window.confirm('Delete this package?')) return
    try {
      await deletePackage(id)
      showSuccess('Package removed')
      loadAllCRMData()
    } catch {
      showError('Failed to delete package')
    }
  }

  // Booking Actions
  const handleCreateBooking = async (e) => {
    e.preventDefault()
    try {
      setActionLoading(true)
      await createBooking(bookingForm)
      showSuccess('Booking registered successfully!')
      setBookingModalOpen(false)
      loadAllCRMData()
    } catch (err) {
      showError(err.response?.data?.message || 'Failed to create booking')
    } finally {
      setActionLoading(false)
    }
  }

  const handleUpdatePayment = async (booking, newStatus) => {
    try {
      const paid = newStatus === 'paid' ? booking.totalAmount : newStatus === 'unpaid' ? 0 : booking.totalAmount / 2
      await updateBooking(booking._id, { paymentStatus: newStatus, paidAmount: paid })
      showSuccess(`Payment marked as ${newStatus}`)
      loadAllCRMData()
    } catch {
      showError('Failed to update payment')
    }
  }

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
          <span style={{ fontSize: 11, fontWeight: 700, background: 'rgba(255,255,255,0.2)', padding: '3px 10px', borderRadius: 12, textTransform: 'uppercase' }}>
            ENTERPRISE TRAVEL CRM
          </span>
          <h2 style={{ fontSize: 22, fontWeight: 800, margin: '8px 0 4px 0' }}>
            Travel Operations & Sales Pipeline
          </h2>
          <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.85)', margin: 0 }}>
            Manage customer holiday inquiries, tour packages, bookings, and revenue.
          </p>
        </div>

        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <button
            onClick={() => setLeadModalOpen(true)}
            style={{
              display: 'flex', alignItems: 'center', gap: 6,
              background: '#fff', color: '#c0392b', border: 'none',
              borderRadius: 8, padding: '9px 16px', fontWeight: 700, fontSize: 12.5,
              cursor: 'pointer', boxShadow: '0 2px 6px rgba(0,0,0,0.12)',
            }}
          >
            <Plus size={15} /> Add Lead
          </button>
          <button
            onClick={() => setPackageModalOpen(true)}
            style={{
              display: 'flex', alignItems: 'center', gap: 6,
              background: 'rgba(255,255,255,0.15)', color: '#fff',
              border: '1px solid rgba(255,255,255,0.3)', borderRadius: 8,
              padding: '9px 16px', fontWeight: 700, fontSize: 12.5, cursor: 'pointer',
            }}
          >
            <Package size={15} /> New Package
          </button>
          <button
            onClick={() => setBookingModalOpen(true)}
            style={{
              display: 'flex', alignItems: 'center', gap: 6,
              background: '#16a34a', color: '#fff', border: 'none',
              borderRadius: 8, padding: '9px 16px', fontWeight: 700, fontSize: 12.5,
              cursor: 'pointer', boxShadow: '0 2px 6px rgba(22,163,74,0.3)',
            }}
          >
            <CheckCircle2 size={15} /> Book Tour
          </button>
        </div>
      </div>

      {/* 2. KPI Summary Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 14 }}>
        <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 12, padding: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: 12, color: '#64748b', fontWeight: 600 }}>Total Leads</span>
            <Users size={16} color="#c0392b" />
          </div>
          <h3 style={{ fontSize: 22, fontWeight: 800, color: '#0f172a', margin: '6px 0 0 0' }}>
            {stats?.totalLeads || leads.length}
          </h3>
        </div>

        <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 12, padding: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: 12, color: '#64748b', fontWeight: 600 }}>Conversion Rate</span>
            <CheckCircle2 size={16} color="#16a34a" />
          </div>
          <h3 style={{ fontSize: 22, fontWeight: 800, color: '#16a34a', margin: '6px 0 0 0' }}>
            {stats?.conversionRate || 0}%
          </h3>
        </div>

        <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 12, padding: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: 12, color: '#64748b', fontWeight: 600 }}>Active Packages</span>
            <Package size={16} color="#d97706" />
          </div>
          <h3 style={{ fontSize: 22, fontWeight: 800, color: '#0f172a', margin: '6px 0 0 0' }}>
            {packages.length}
          </h3>
        </div>

        <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 12, padding: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: 12, color: '#64748b', fontWeight: 600 }}>Total Bookings</span>
            <Calendar size={16} color="#c0392b" />
          </div>
          <h3 style={{ fontSize: 22, fontWeight: 800, color: '#0f172a', margin: '6px 0 0 0' }}>
            {bookings.length}
          </h3>
        </div>

        <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 12, padding: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: 12, color: '#64748b', fontWeight: 600 }}>Total Revenue</span>
            <DollarSign size={16} color="#16a34a" />
          </div>
          <h3 style={{ fontSize: 20, fontWeight: 800, color: '#0f172a', margin: '6px 0 0 0' }}>
            ₹{(stats?.totalRevenue || 0).toLocaleString()}
          </h3>
        </div>
      </div>

      {/* 3. Navigation Tabs */}
      <div style={{ display: 'flex', gap: 10, borderBottom: '1px solid #e2e8f0', paddingBottom: 8 }}>
        {[
          { id: 'pipeline', label: `Leads Pipeline (${leads.length})` },
          { id: 'packages', label: `Tour Packages (${packages.length})` },
          { id: 'bookings', label: `Bookings & Payments (${bookings.length})` },
        ].map((tab) => {
          const isActive = activeTab === tab.id
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                background: isActive ? '#fef2f2' : 'transparent',
                color: isActive ? '#c0392b' : '#64748b',
                border: 'none',
                borderRadius: 8,
                padding: '8px 16px',
                fontSize: 13,
                fontWeight: isActive ? 700 : 500,
                cursor: 'pointer',
              }}
            >
              {tab.label}
            </button>
          )
        })}
      </div>

      {/* 4. Tab Views */}
      {loading ? (
        <div style={{ padding: 40, textAlign: 'center', color: '#94a3b8' }}>
          <Loader2 className="animate-spin" size={24} style={{ margin: '0 auto 8px' }} />
          <span>Loading CRM data...</span>
        </div>
      ) : activeTab === 'pipeline' ? (
        /* ==================== LEADS PIPELINE ==================== */
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 14, alignItems: 'start' }}>
          {STAGES.map((stage) => {
            const stageLeads = leads.filter((l) => l.stage === stage.id)
            return (
              <div
                key={stage.id}
                style={{
                  background: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  borderRadius: 12,
                  padding: 12,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 10,
                  minHeight: 200,
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 4px' }}>
                  <span style={{ fontSize: 13, fontWeight: 700, color: stage.color }}>
                    {stage.label}
                  </span>
                  <span style={{ fontSize: 11, fontWeight: 700, background: stage.bg, color: stage.color, padding: '2px 7px', borderRadius: 8 }}>
                    {stageLeads.length}
                  </span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {stageLeads.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '24px 10px', color: '#94a3b8', fontSize: 12 }}>
                      No leads
                    </div>
                  ) : (
                    stageLeads.map((lead) => (
                      <div
                        key={lead._id}
                        style={{
                          background: '#fff',
                          border: '1px solid #e2e8f0',
                          borderRadius: 10,
                          padding: 12,
                          boxShadow: '0 1px 2px rgba(0,0,0,0.03)',
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                          <span style={{ fontSize: 10, fontWeight: 700, color: '#94a3b8' }}>{lead.leadId}</span>
                          <button
                            onClick={() => handleDeleteLead(lead._id)}
                            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#cbd5e1', padding: 2 }}
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>

                        <h4 style={{ fontSize: 14, fontWeight: 700, color: '#0f172a', margin: '4px 0 2px 0' }}>
                          {lead.customerName}
                        </h4>

                        <div style={{ fontSize: 12, color: '#c0392b', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4, marginTop: 2 }}>
                          <Compass size={12} /> {lead.destination}
                        </div>

                        <div style={{ fontSize: 11, color: '#64748b', marginTop: 4, display: 'flex', flexDirection: 'column', gap: 2 }}>
                          <div>📞 {lead.phone}</div>
                          {lead.budget > 0 && <div>💰 Budget: ₹{lead.budget.toLocaleString()}</div>}
                          <div>👥 {lead.travelersCount} Travelers</div>
                        </div>

                        {/* Stage Selector */}
                        <div style={{ marginTop: 10, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 6 }}>
                          <select
                            value={lead.stage}
                            onChange={(e) => handleStageChange(lead._id, e.target.value)}
                            style={{
                              fontSize: 11,
                              padding: '3px 6px',
                              borderRadius: 6,
                              border: '1px solid #cbd5e1',
                              background: '#f8fafc',
                              color: '#334155',
                              fontWeight: 600,
                              cursor: 'pointer',
                            }}
                          >
                            {STAGES.map((s) => (
                              <option key={s.id} value={s.id}>
                                {s.label}
                              </option>
                            ))}
                          </select>

                          <button
                            onClick={() => {
                              setSelectedLeadForNote(lead)
                              setNoteModalOpen(true)
                            }}
                            title="Add Client Note"
                            style={{
                              background: '#f1f5f9', border: 'none', borderRadius: 6,
                              padding: '4px 8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 3,
                              fontSize: 11, color: '#475569', fontWeight: 600,
                            }}
                          >
                            <MessageSquare size={11} />
                            <span>{lead.notes?.length || 0}</span>
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )
          })}
        </div>
      ) : activeTab === 'packages' ? (
        /* ==================== TOUR PACKAGES ==================== */
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 }}>
          {packages.length === 0 ? (
            <div style={{ padding: 40, textAlign: 'center', color: '#94a3b8' }}>
              No tour packages in catalog yet. Click "New Package" to add one.
            </div>
          ) : (
            packages.map((pkg) => (
              <div
                key={pkg._id}
                style={{
                  background: '#fff',
                  borderRadius: 14,
                  border: '1px solid #e2e8f0',
                  padding: 20,
                  boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  gap: 16,
                }}
              >
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: 10, fontWeight: 700, color: '#c0392b', background: '#fef2f2', padding: '2px 8px', borderRadius: 6 }}>
                      {pkg.packageCode}
                    </span>
                    <button
                      onClick={() => handleDeletePackage(pkg._id)}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8' }}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>

                  <h4 style={{ fontSize: 16, fontWeight: 800, color: '#0f172a', margin: '8px 0 4px 0' }}>
                    {pkg.title}
                  </h4>
                  <div style={{ fontSize: 12, color: '#64748b', display: 'flex', alignItems: 'center', gap: 4 }}>
                    <MapPin size={13} color="#c0392b" />
                    <span>{pkg.destination} • {pkg.durationDays}D / {pkg.durationNights}N</span>
                  </div>

                  <div style={{ marginTop: 12, fontSize: 18, fontWeight: 800, color: '#16a34a' }}>
                    ₹{pkg.pricePerPerson.toLocaleString()} <span style={{ fontSize: 11, color: '#64748b', fontWeight: 500 }}>/ person</span>
                  </div>

                  {pkg.inclusions?.length > 0 && (
                    <div style={{ marginTop: 10 }}>
                      <div style={{ fontSize: 11, fontWeight: 600, color: '#475569', marginBottom: 4 }}>Inclusions:</div>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                        {pkg.inclusions.map((inc, i) => (
                          <span
                            key={i}
                            style={{
                              fontSize: 10, background: '#f0fdf4', color: '#16a34a',
                              border: '1px solid #dcfce7', padding: '1px 6px', borderRadius: 4,
                            }}
                          >
                            ✓ {inc}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: 10, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: 11, fontWeight: 600, color: '#16a34a' }}>● Active in Catalog</span>
                  <button
                    onClick={() => {
                      setBookingForm((prev) => ({
                        ...prev,
                        packageId: pkg._id,
                        totalAmount: pkg.pricePerPerson * 2,
                      }))
                      setBookingModalOpen(true)
                    }}
                    style={{
                      background: '#c0392b', color: '#fff', border: 'none',
                      borderRadius: 6, padding: '5px 12px', fontSize: 11, fontWeight: 600, cursor: 'pointer',
                    }}
                  >
                    Book Now
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      ) : (
        /* ==================== BOOKINGS & PAYMENTS ==================== */
        <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 14, overflow: 'hidden' }}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid #f1f5f9' }}>
            <h3 style={{ fontSize: 15, fontWeight: 700, color: '#0f172a', margin: 0 }}>
              Confirmed Travel Bookings ({bookings.length})
            </h3>
          </div>

          {bookings.length === 0 ? (
            <div style={{ padding: 40, textAlign: 'center', color: '#94a3b8' }}>
              No bookings recorded yet.
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13, textAlign: 'left' }}>
                <thead>
                  <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#64748b' }}>
                    <th style={{ padding: '12px 18px', fontWeight: 600 }}>Booking ID & Client</th>
                    <th style={{ padding: '12px 18px', fontWeight: 600 }}>Package / Destination</th>
                    <th style={{ padding: '12px 18px', fontWeight: 600 }}>Travel Date</th>
                    <th style={{ padding: '12px 18px', fontWeight: 600 }}>Amount & Paid</th>
                    <th style={{ padding: '12px 18px', fontWeight: 600 }}>Payment Status</th>
                    <th style={{ padding: '12px 18px', fontWeight: 600, textAlign: 'right' }}>Update</th>
                  </tr>
                </thead>
                <tbody>
                  {bookings.map((b) => (
                    <tr key={b._id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '14px 18px' }}>
                        <div style={{ fontWeight: 700, color: '#0f172a' }}>{b.customerName}</div>
                        <div style={{ fontSize: 11, color: '#94a3b8' }}>{b.bookingId} • 📞 {b.customerPhone}</div>
                      </td>
                      <td style={{ padding: '14px 18px' }}>
                        <div style={{ fontWeight: 600, color: '#334155' }}>
                          {b.packageId?.title || b.customDestination || 'Custom Tour'}
                        </div>
                        <div style={{ fontSize: 11, color: '#64748b' }}>
                          {b.travelersCount} Travelers
                        </div>
                      </td>
                      <td style={{ padding: '14px 18px' }}>
                        {new Date(b.travelDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                      </td>
                      <td style={{ padding: '14px 18px' }}>
                        <div style={{ fontWeight: 700, color: '#0f172a' }}>₹{(b.totalAmount || 0).toLocaleString()}</div>
                        <div style={{ fontSize: 11, color: '#16a34a' }}>Paid: ₹{(b.paidAmount || 0).toLocaleString()}</div>
                      </td>
                      <td style={{ padding: '14px 18px' }}>
                        <span
                          style={{
                            fontSize: 11, fontWeight: 700, textTransform: 'uppercase',
                            padding: '3px 8px', borderRadius: 6,
                            background: b.paymentStatus === 'paid' ? '#dcfce7' : b.paymentStatus === 'partial' ? '#fef3c7' : '#fee2e2',
                            color: b.paymentStatus === 'paid' ? '#16a34a' : b.paymentStatus === 'partial' ? '#b45309' : '#dc2626',
                          }}
                        >
                          {b.paymentStatus}
                        </span>
                      </td>
                      <td style={{ padding: '14px 18px', textAlign: 'right' }}>
                        <select
                          value={b.paymentStatus}
                          onChange={(e) => handleUpdatePayment(b, e.target.value)}
                          style={{
                            fontSize: 11, padding: '4px 8px', borderRadius: 6,
                            border: '1px solid #cbd5e1', cursor: 'pointer',
                          }}
                        >
                          <option value="unpaid">Unpaid</option>
                          <option value="partial">Partial</option>
                          <option value="paid">Paid Full</option>
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ==================== MODALS ==================== */}

      {/* 1. Add Lead Modal */}
      {leadModalOpen && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.65)', backdropFilter: 'blur(5px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 20 }}>
          <div style={{ background: '#fff', borderRadius: 16, maxWidth: 480, width: '100%', padding: 24, boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)', position: 'relative', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h3 style={{ fontSize: 18, fontWeight: 700, color: '#0f172a', margin: 0 }}>
                Record Customer Travel Inquiry
              </h3>
              <button onClick={() => setLeadModalOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8' }}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateLead} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: '#334155', display: 'block', marginBottom: 4 }}>Customer Name *</label>
                <input type="text" required value={leadForm.customerName} onChange={(e) => setLeadForm({ ...leadForm, customerName: e.target.value })} style={{ width: '100%', padding: '8px 12px', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: 13 }} />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: '#334155', display: 'block', marginBottom: 4 }}>Phone *</label>
                  <input type="tel" required value={leadForm.phone} onChange={(e) => setLeadForm({ ...leadForm, phone: e.target.value })} style={{ width: '100%', padding: '8px 12px', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: 13 }} />
                </div>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: '#334155', display: 'block', marginBottom: 4 }}>Email</label>
                  <input type="email" value={leadForm.email} onChange={(e) => setLeadForm({ ...leadForm, email: e.target.value })} style={{ width: '100%', padding: '8px 12px', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: 13 }} />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: '#334155', display: 'block', marginBottom: 4 }}>Dream Destination *</label>
                  <input type="text" required placeholder="e.g. Maldives & Dubai" value={leadForm.destination} onChange={(e) => setLeadForm({ ...leadForm, destination: e.target.value })} style={{ width: '100%', padding: '8px 12px', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: 13 }} />
                </div>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: '#334155', display: 'block', marginBottom: 4 }}>Estimated Budget (₹)</label>
                  <input type="number" placeholder="150000" value={leadForm.budget} onChange={(e) => setLeadForm({ ...leadForm, budget: e.target.value })} style={{ width: '100%', padding: '8px 12px', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: 13 }} />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: '#334155', display: 'block', marginBottom: 4 }}>Travelers</label>
                  <input type="number" min="1" value={leadForm.travelersCount} onChange={(e) => setLeadForm({ ...leadForm, travelersCount: e.target.value })} style={{ width: '100%', padding: '8px 12px', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: 13 }} />
                </div>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: '#334155', display: 'block', marginBottom: 4 }}>Assign To Staff</label>
                  <select value={leadForm.assignedTo} onChange={(e) => setLeadForm({ ...leadForm, assignedTo: e.target.value })} style={{ width: '100%', padding: '8px 10px', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: 12 }}>
                    <option value="">Unassigned</option>
                    {employees.map((emp) => (
                      <option key={emp._id} value={emp._id}>{emp.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
                <button type="button" onClick={() => setLeadModalOpen(false)} style={{ flex: 1, padding: 10, borderRadius: 8, border: '1px solid #e2e8f0', background: '#fff', color: '#64748b', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>Cancel</button>
                <button type="submit" disabled={actionLoading} style={{ flex: 2, padding: 10, borderRadius: 8, border: 'none', background: 'linear-gradient(135deg, #c0392b, #922b21)', color: '#fff', fontSize: 13, fontWeight: 600, cursor: actionLoading ? 'not-allowed' : 'pointer' }}>Save Lead</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 2. Add Package Modal */}
      {packageModalOpen && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.65)', backdropFilter: 'blur(5px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 20 }}>
          <div style={{ background: '#fff', borderRadius: 16, maxWidth: 480, width: '100%', padding: 24, boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)', position: 'relative' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h3 style={{ fontSize: 18, fontWeight: 700, color: '#0f172a', margin: 0 }}>Add Tour Package</h3>
              <button onClick={() => setPackageModalOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8' }}><X size={18} /></button>
            </div>

            <form onSubmit={handleCreatePackage} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: '#334155', display: 'block', marginBottom: 4 }}>Package Title *</label>
                <input type="text" required placeholder="e.g. 5D/4N Romantic Bali Getaway" value={packageForm.title} onChange={(e) => setPackageForm({ ...packageForm, title: e.target.value })} style={{ width: '100%', padding: '8px 12px', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: 13 }} />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: '#334155', display: 'block', marginBottom: 4 }}>Destination *</label>
                  <input type="text" required placeholder="Bali, Indonesia" value={packageForm.destination} onChange={(e) => setPackageForm({ ...packageForm, destination: e.target.value })} style={{ width: '100%', padding: '8px 12px', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: 13 }} />
                </div>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: '#334155', display: 'block', marginBottom: 4 }}>Price / Person (₹) *</label>
                  <input type="number" required placeholder="45000" value={packageForm.pricePerPerson} onChange={(e) => setPackageForm({ ...packageForm, pricePerPerson: e.target.value })} style={{ width: '100%', padding: '8px 12px', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: 13 }} />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: '#334155', display: 'block', marginBottom: 4 }}>Days</label>
                  <input type="number" value={packageForm.durationDays} onChange={(e) => setPackageForm({ ...packageForm, durationDays: e.target.value })} style={{ width: '100%', padding: '8px 12px', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: 13 }} />
                </div>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: '#334155', display: 'block', marginBottom: 4 }}>Nights</label>
                  <input type="number" value={packageForm.durationNights} onChange={(e) => setPackageForm({ ...packageForm, durationNights: e.target.value })} style={{ width: '100%', padding: '8px 12px', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: 13 }} />
                </div>
              </div>

              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: '#334155', display: 'block', marginBottom: 4 }}>Inclusions (comma separated)</label>
                <input type="text" value={packageForm.inclusions} onChange={(e) => setPackageForm({ ...packageForm, inclusions: e.target.value })} style={{ width: '100%', padding: '8px 12px', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: 13 }} />
              </div>

              <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
                <button type="button" onClick={() => setPackageModalOpen(false)} style={{ flex: 1, padding: 10, borderRadius: 8, border: '1px solid #e2e8f0', background: '#fff', color: '#64748b', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>Cancel</button>
                <button type="submit" disabled={actionLoading} style={{ flex: 2, padding: 10, borderRadius: 8, border: 'none', background: 'linear-gradient(135deg, #c0392b, #922b21)', color: '#fff', fontSize: 13, fontWeight: 600, cursor: actionLoading ? 'not-allowed' : 'pointer' }}>Publish Package</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 3. Add Booking Modal */}
      {bookingModalOpen && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.65)', backdropFilter: 'blur(5px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 20 }}>
          <div style={{ background: '#fff', borderRadius: 16, maxWidth: 480, width: '100%', padding: 24, boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)', position: 'relative' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h3 style={{ fontSize: 18, fontWeight: 700, color: '#0f172a', margin: 0 }}>Register Tour Booking</h3>
              <button onClick={() => setBookingModalOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8' }}><X size={18} /></button>
            </div>

            <form onSubmit={handleCreateBooking} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: '#334155', display: 'block', marginBottom: 4 }}>Customer Name *</label>
                <input type="text" required value={bookingForm.customerName} onChange={(e) => setBookingForm({ ...bookingForm, customerName: e.target.value })} style={{ width: '100%', padding: '8px 12px', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: 13 }} />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: '#334155', display: 'block', marginBottom: 4 }}>Phone *</label>
                  <input type="tel" required value={bookingForm.customerPhone} onChange={(e) => setBookingForm({ ...bookingForm, customerPhone: e.target.value })} style={{ width: '100%', padding: '8px 12px', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: 13 }} />
                </div>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: '#334155', display: 'block', marginBottom: 4 }}>Travel Date *</label>
                  <input type="date" required value={bookingForm.travelDate} onChange={(e) => setBookingForm({ ...bookingForm, travelDate: e.target.value })} style={{ width: '100%', padding: '8px 12px', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: 13 }} />
                </div>
              </div>

              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: '#334155', display: 'block', marginBottom: 4 }}>Select Tour Package</label>
                <select value={bookingForm.packageId} onChange={(e) => setBookingForm({ ...bookingForm, packageId: e.target.value })} style={{ width: '100%', padding: '8px 10px', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: 12 }}>
                  <option value="">Custom Tour / Itinerary</option>
                  {packages.map((p) => (
                    <option key={p._id} value={p._id}>{p.title} (₹{p.pricePerPerson})</option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: '#334155', display: 'block', marginBottom: 4 }}>Total Amount (₹) *</label>
                  <input type="number" required value={bookingForm.totalAmount} onChange={(e) => setBookingForm({ ...bookingForm, totalAmount: e.target.value })} style={{ width: '100%', padding: '8px 12px', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: 13 }} />
                </div>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: '#334155', display: 'block', marginBottom: 4 }}>Paid Now (₹)</label>
                  <input type="number" value={bookingForm.paidAmount} onChange={(e) => setBookingForm({ ...bookingForm, paidAmount: e.target.value })} style={{ width: '100%', padding: '8px 12px', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: 13 }} />
                </div>
              </div>

              <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
                <button type="button" onClick={() => setBookingModalOpen(false)} style={{ flex: 1, padding: 10, borderRadius: 8, border: '1px solid #e2e8f0', background: '#fff', color: '#64748b', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>Cancel</button>
                <button type="submit" disabled={actionLoading} style={{ flex: 2, padding: 10, borderRadius: 8, border: 'none', background: '#16a34a', color: '#fff', fontSize: 13, fontWeight: 600, cursor: actionLoading ? 'not-allowed' : 'pointer' }}>Confirm Booking</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 4. Add Note Modal */}
      {noteModalOpen && selectedLeadForNote && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.65)', backdropFilter: 'blur(5px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 20 }}>
          <div style={{ background: '#fff', borderRadius: 16, maxWidth: 440, width: '100%', padding: 24, position: 'relative' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <h3 style={{ fontSize: 16, fontWeight: 700, color: '#0f172a', margin: 0 }}>
                Notes for {selectedLeadForNote.customerName}
              </h3>
              <button onClick={() => setNoteModalOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8' }}><X size={16} /></button>
            </div>

            {/* Existing notes */}
            <div style={{ maxHeight: 180, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 12 }}>
              {selectedLeadForNote.notes?.length === 0 ? (
                <div style={{ fontSize: 12, color: '#94a3b8', fontStyle: 'italic' }}>No notes yet. Add one below.</div>
              ) : (
                selectedLeadForNote.notes?.map((n, i) => (
                  <div key={i} style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 8, padding: 8, fontSize: 12 }}>
                    <div>{n.text}</div>
                    <div style={{ fontSize: 10, color: '#94a3b8', marginTop: 4 }}>
                      {new Date(n.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                ))
              )}
            </div>

            <form onSubmit={handleAddNote} style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <textarea rows={2} required placeholder="Add update or discussion note..." value={noteText} onChange={(e) => setNoteText(e.target.value)} style={{ width: '100%', padding: '8px 12px', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: 12 }} />
              <div style={{ display: 'flex', gap: 8 }}>
                <button type="button" onClick={() => setNoteModalOpen(false)} style={{ flex: 1, padding: 8, borderRadius: 8, border: '1px solid #e2e8f0', background: '#fff', fontSize: 12, cursor: 'pointer' }}>Close</button>
                <button type="submit" disabled={actionLoading} style={{ flex: 1, padding: 8, borderRadius: 8, border: 'none', background: '#c0392b', color: '#fff', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>Add Note</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
