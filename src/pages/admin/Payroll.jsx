import { useState, useMemo } from 'react'
import { 
  Search, 
  Filter, 
  Eye, 
  X, 
  Download, 
  Calendar, 
  Check, 
  DollarSign, 
  FileText,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  ClipboardList,
  MoreVertical,
  Plus
} from 'lucide-react'

const INITIAL_PAYROLLS = [
  { id: '01', month: 'Sep 2026', department: 'Development', employees: 2, totalDays: 60, presentDays: 58, absentDays: 2, basic: 75000, allowances: 12500, deductions: 5500, lop: 1000, status: 'Paid', generatedOn: '20 Sep 2026', payDate: '22 Sep 2026', payMethod: 'Bank Transfer', refNo: 'TXN111222333' },
  { id: '02', month: 'Sep 2026', department: 'HR', employees: 1, totalDays: 30, presentDays: 30, absentDays: 0, basic: 28000, allowances: 9000, deductions: 4000, lop: 0, status: 'Processed', generatedOn: '20 Sep 2026', payDate: '', payMethod: '', refNo: '' },
  { id: '03', month: 'Aug 2026', department: 'Development', employees: 2, totalDays: 60, presentDays: 59, absentDays: 1, basic: 75000, allowances: 13000, deductions: 5500, lop: 500, status: 'Paid', generatedOn: '20 Aug 2026', payDate: '22 Aug 2026', payMethod: 'Bank Transfer', refNo: 'TXN111222301' }
]

export default function Payroll() {
  const [payrolls, setPayrolls] = useState(INITIAL_PAYROLLS)
  const [searchQuery, setSearchQuery] = useState('')
  const [activeTab, setActiveTab] = useState('All Payrolls') // All Payrolls, Draft, Processed, Paid
  const [deptFilter, setDeptFilter] = useState('All Departments')
  const [statusFilter, setStatusFilter] = useState('All Statuses')
  const [monthFilter, setMonthFilter] = useState('Sep 2026')
  const [selectedPayrollId, setSelectedPayrollId] = useState(null)

  const selectedPayroll = useMemo(() => {
    return payrolls.find(p => p.id === selectedPayrollId)
  }, [payrolls, selectedPayrollId])

  const handleProcessPayroll = (id, newStatus) => {
    setPayrolls(prev => prev.map(p => {
      if (p.id === id) {
        return { 
          ...p, 
          status: newStatus,
          payDate: newStatus === 'Paid' ? '28 May 2026' : '',
          refNo: newStatus === 'Paid' ? 'TXN' + Math.floor(100000000 + Math.random() * 900000000) : ''
        }
      }
      return p
    }))
  }

  const formatCurrency = (val) => {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(val)
  }

  const stats = useMemo(() => {
    const totalCount = payrolls.length
    const draft = payrolls.filter(p => p.status === 'Draft').length
    const processed = payrolls.filter(p => p.status === 'Processed').length
    const paid = payrolls.filter(p => p.status === 'Paid').length
    const amountVal = payrolls.reduce((sum, p) => sum + p.basic + p.allowances - p.deductions - p.lop, 0)

    return { totalCount, draft, processed, paid, amountVal }
  }, [payrolls])

  const filteredPayrolls = useMemo(() => {
    return payrolls.filter(p => {
      const matchesSearch = p.month.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            p.department.toLowerCase().includes(searchQuery.toLowerCase())
      
      const matchesTab = activeTab === 'All Payrolls' || 
                         (activeTab === 'Draft' && p.status === 'Draft') ||
                         (activeTab === 'Processed' && p.status === 'Processed') ||
                         (activeTab === 'Paid' && p.status === 'Paid')

      const matchesDept = deptFilter === 'All Departments' || p.department === deptFilter
      const matchesStatus = statusFilter === 'All Statuses' || p.status === statusFilter
      const matchesMonth = monthFilter === 'All Months' || p.month === monthFilter

      return matchesSearch && matchesTab && matchesDept && matchesStatus && matchesMonth
    })
  }, [payrolls, searchQuery, activeTab, deptFilter, statusFilter, monthFilter])

  const getStatusStyle = (status) => {
    switch (status) {
      case 'Paid': return { bg: '#f0fdf4', text: '#15803d' } // green
      case 'Processed': return { bg: '#eff6ff', text: '#1d4ed8' } // blue
      default: return { bg: '#fff7ed', text: '#c2410c' } // orange/yellow (Draft)
    }
  }

  return (
    <div style={{ display: 'flex', gap: '24px', flex: 1, position: 'relative', height: '100%', overflow: 'hidden' }}>
      
      {/* Main panel content */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '20px', overflowY: 'auto' }} className="hide-scroll">
        
        {/* Title & Top button */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <h1 style={{ fontSize: '20px', fontWeight: 800, color: '#0f172a', margin: 0 }}>Payroll</h1>
            <p style={{ fontSize: '12px', color: '#64748b', marginTop: '4px', margin: 0 }}>Manage and process employee payrolls</p>
          </div>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button style={{ background: '#fff', border: '1px solid #cbd5e1', borderRadius: '8px', padding: '8px 16px', fontSize: '13px', fontWeight: 600, color: '#475569', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Download size={15} /> Export
            </button>
            <button style={{ background: '#c0392b', color: '#fff', border: 'none', borderRadius: '8px', padding: '8px 16px', fontSize: '13px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Plus size={16} /> Generate Payroll
            </button>
          </div>
        </div>

        {/* Stats Row */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px' }}>
          
          <div style={{ background: '#fff', borderRadius: '12px', padding: '16px 20px', border: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ width: '44px', height: '44px', borderRadius: '10px', background: 'rgba(192, 57, 43, 0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#c0392b' }}>
              <ClipboardList size={20} />
            </div>
            <div>
              <h4 style={{ fontSize: '20px', fontWeight: 800, color: '#1e293b', margin: 0 }}>{stats.totalCount}</h4>
              <p style={{ fontSize: '12px', color: '#94a3b8', margin: 0, fontWeight: 500 }}>Total Payrolls</p>
            </div>
          </div>

          <div style={{ background: '#fff', borderRadius: '12px', padding: '16px 20px', border: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ width: '44px', height: '44px', borderRadius: '10px', background: 'rgba(234, 179, 8, 0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#eab308' }}>
              <FileText size={20} />
            </div>
            <div>
              <h4 style={{ fontSize: '20px', fontWeight: 800, color: '#1e293b', margin: 0 }}>{stats.draft}</h4>
              <p style={{ fontSize: '12px', color: '#94a3b8', margin: 0, fontWeight: 500 }}>Draft</p>
            </div>
          </div>

          <div style={{ background: '#fff', borderRadius: '12px', padding: '16px 20px', border: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ width: '44px', height: '44px', borderRadius: '10px', background: 'rgba(37, 99, 235, 0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#2563eb' }}>
              <TrendingUp size={20} />
            </div>
            <div>
              <h4 style={{ fontSize: '20px', fontWeight: 800, color: '#1e293b', margin: 0 }}>{stats.processed}</h4>
              <p style={{ fontSize: '12px', color: '#94a3b8', margin: 0, fontWeight: 500 }}>Processed</p>
            </div>
          </div>

          <div style={{ background: '#fff', borderRadius: '12px', padding: '16px 20px', border: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ width: '44px', height: '44px', borderRadius: '10px', background: 'rgba(34, 197, 94, 0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#22c55e' }}>
              <Check size={20} />
            </div>
            <div>
              <h4 style={{ fontSize: '20px', fontWeight: 800, color: '#1e293b', margin: 0 }}>{stats.paid}</h4>
              <p style={{ fontSize: '12px', color: '#94a3b8', margin: 0, fontWeight: 500 }}>Paid</p>
            </div>
          </div>

          <div style={{ background: '#fff', borderRadius: '12px', padding: '16px 20px', border: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', gap: '16px', gridColumn: 'span 1' }}>
            <div style={{ width: '44px', height: '44px', borderRadius: '10px', background: 'rgba(34, 197, 94, 0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#22c55e' }}>
              <DollarSign size={20} />
            </div>
            <div>
              <h4 style={{ fontSize: '18px', fontWeight: 800, color: '#1e293b', margin: 0 }}>{formatCurrency(stats.amountVal)}</h4>
              <p style={{ fontSize: '11px', color: '#94a3b8', margin: 0, fontWeight: 500 }}>Total Amount</p>
            </div>
          </div>

        </div>

        {/* Filters Panel Row */}
        <div style={{
          background: '#fff',
          border: '1px solid #e2e8f0',
          borderRadius: '12px',
          padding: '16px 20px',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px'
        }}>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
            {/* Tabs */}
            <div style={{ display: 'flex', gap: '6px' }}>
              {['All Payrolls', 'Draft', 'Processed', 'Paid'].map(tab => {
                const isSelected = activeTab === tab
                return (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    style={{
                      background: isSelected ? '#c0392b' : 'transparent',
                      color: isSelected ? '#fff' : '#64748b',
                      border: 'none',
                      borderRadius: '6px',
                      padding: '8px 16px',
                      fontSize: '13px',
                      fontWeight: 600,
                      cursor: 'pointer',
                      transition: 'all 0.15s'
                    }}
                  >
                    {tab}
                  </button>
                )
              })}
            </div>

            {/* Dropdowns */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
              
              <select
                value={deptFilter}
                onChange={e => setDeptFilter(e.target.value)}
                style={{
                  background: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                  padding: '8px 12px',
                  fontSize: '13px',
                  color: '#475569',
                  fontWeight: 500,
                  outline: 'none',
                  cursor: 'pointer'
                }}
              >
                <option value="All Departments">All Departments</option>
                <option value="Development">Development</option>
                <option value="Design">Design</option>
                <option value="HR">HR</option>
                <option value="QA / Testing">QA / Testing</option>
                <option value="Finance">Finance</option>
              </select>

              <select
                value={statusFilter}
                onChange={e => setStatusFilter(e.target.value)}
                style={{
                  background: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                  padding: '8px 12px',
                  fontSize: '13px',
                  color: '#475569',
                  fontWeight: 500,
                  outline: 'none',
                  cursor: 'pointer'
                }}
              >
                <option value="All Statuses">All Statuses</option>
                <option value="Draft">Draft</option>
                <option value="Processed">Processed</option>
                <option value="Paid">Paid</option>
              </select>

              <select
                value={monthFilter}
                onChange={e => setMonthFilter(e.target.value)}
                style={{
                  background: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                  padding: '8px 12px',
                  fontSize: '13px',
                  color: '#475569',
                  fontWeight: 600,
                  outline: 'none',
                  cursor: 'pointer'
                }}
              >
                <option value="All Months">All Months</option>
                <option value="Sep 2026">Sep 2026</option>
                <option value="Aug 2026">Aug 2026</option>
              </select>

            </div>
          </div>

          {/* Search bar */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            background: '#f8fafc',
            border: '1px solid #e2e8f0',
            borderRadius: '8px',
            padding: '8px 12px',
            gap: '8px'
          }}>
            <Search size={16} color="#94a3b8" />
            <input
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search by payroll month or department name..."
              style={{
                border: 'none',
                background: 'none',
                outline: 'none',
                fontSize: '13px',
                color: '#334155',
                width: '100%',
                fontWeight: 500
              }}
            />
          </div>

        </div>

        {/* Payroll Table */}
        <div style={{
          background: '#fff',
          borderRadius: '12px',
          border: '1px solid #e2e8f0',
          boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
          overflowX: 'auto'
        }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '800px' }}>
            <thead>
              <tr style={{ background: '#c0392b', color: '#fff', borderBottom: '1px solid #e2e8f0' }}>
                <th style={{ padding: '12px 18px', fontSize: '12px', fontWeight: 700 }}>#</th>
                <th style={{ padding: '12px 18px', fontSize: '12px', fontWeight: 700 }}>Payroll Month</th>
                <th style={{ padding: '12px 18px', fontSize: '12px', fontWeight: 700 }}>Department</th>
                <th style={{ padding: '12px 18px', fontSize: '12px', fontWeight: 700 }}>No. of Employees</th>
                <th style={{ padding: '12px 18px', fontSize: '12px', fontWeight: 700 }}>Total Amount</th>
                <th style={{ padding: '12px 18px', fontSize: '12px', fontWeight: 700 }}>Status</th>
                <th style={{ padding: '12px 18px', fontSize: '12px', fontWeight: 700 }}>Generated On</th>
                <th style={{ padding: '12px 18px', fontSize: '12px', fontWeight: 700, width: '100px' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredPayrolls.length > 0 ? (
                filteredPayrolls.map((p) => {
                  const statusStyle = getStatusStyle(p.status)
                  const totalPaid = p.basic + p.allowances - p.deductions
                  const isSelected = selectedPayrollId === p.id
                  return (
                    <tr 
                      key={p.id}
                      onClick={() => setSelectedPayrollId(isSelected ? null : p.id)}
                      style={{ borderBottom: '1px solid #f1f5f9', cursor: 'pointer', background: isSelected ? '#f8fafc' : 'transparent' }}
                      className="hover:bg-slate-50"
                    >
                      <td style={{ padding: '14px 18px', fontSize: '13px', color: '#64748b', fontWeight: 600 }}>{p.id}</td>
                      <td style={{ padding: '14px 18px', fontSize: '13px', color: '#1e293b', fontWeight: 700 }}>{p.month}</td>
                      <td style={{ padding: '14px 18px', fontSize: '13px', color: '#475569', fontWeight: 500 }}>{p.department}</td>
                      <td style={{ padding: '14px 18px', fontSize: '13px', color: '#334155', fontWeight: 600 }}>{p.employees}</td>
                      <td style={{ padding: '14px 18px', fontSize: '13px', color: '#1e293b', fontWeight: 700 }}>{formatCurrency(totalPaid)}</td>
                      <td style={{ padding: '14px 18px' }}>
                        <span style={{
                          background: statusStyle.bg, color: statusStyle.text,
                          fontSize: '11px', fontWeight: 700, padding: '4px 8px', borderRadius: '6px'
                        }}>{p.status}</span>
                      </td>
                      <td style={{ padding: '14px 18px', fontSize: '13px', color: '#64748b', fontWeight: 500 }}>{p.generatedOn}</td>
                      <td style={{ padding: '14px 18px' }} onClick={e => e.stopPropagation()}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <button 
                            onClick={() => setSelectedPayrollId(p.id)}
                            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b', padding: '4px' }}
                          >
                            <Eye size={15} />
                          </button>
                          <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b', padding: '4px' }}>
                            <MoreVertical size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })
              ) : (
                <tr>
                  <td colSpan="8" style={{ padding: '48px 18px', textAlign: 'center', color: '#94a3b8', fontSize: '14px' }}>
                    No payroll sheets found matching criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination summary row */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '8px' }}>
          <span style={{ fontSize: '12px', color: '#64748b', fontWeight: 500 }}>Showing 1 to {filteredPayrolls.length} of {payrolls.length} payroll entries</span>
          <div style={{ display: 'flex', gap: '6px' }}>
            <button style={{ border: '1px solid #e2e8f0', background: '#fff', borderRadius: '6px', padding: '6px', cursor: 'not-allowed', color: '#cbd5e1' }}>
              <ChevronLeft size={16} />
            </button>
            <button style={{ minWidth: '32px', height: '32px', borderRadius: '6px', border: 'none', background: '#c0392b', color: '#fff', fontWeight: 600, fontSize: '12px' }}>
              1
            </button>
            <button style={{ border: '1px solid #e2e8f0', background: '#fff', borderRadius: '6px', padding: '6px', cursor: 'not-allowed', color: '#cbd5e1' }}>
              <ChevronRight size={16} />
            </button>
          </div>
        </div>

      </div>

      {/* DRAWER CONTAINER: Slides in from the right if selectedPayroll is not null */}
      {selectedPayroll && (
        <div style={{
          width: '320px',
          background: '#fff',
          borderLeft: '1px solid #e2e8f0',
          padding: '24px',
          display: 'flex',
          flexDirection: 'column',
          gap: '20px',
          boxShadow: '-2px 0 12px rgba(0,0,0,0.03)',
          overflowY: 'auto'
        }}>
          
          {/* Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h3 style={{ fontSize: '15px', fontWeight: 800, color: '#0f172a', margin: 0 }}>Payroll Details</h3>
              <p style={{ fontSize: '11px', color: '#64748b', marginTop: '2px', margin: 0 }}>{selectedPayroll.month} • {selectedPayroll.department}</p>
            </div>
            <button 
              onClick={() => setSelectedPayrollId(null)}
              style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: '4px' }}
            >
              <X size={18} />
            </button>
          </div>

          {/* Quick Stats Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
            <div style={{ background: '#f8fafc', padding: '10px', borderRadius: '8px', textAlign: 'center' }}>
              <p style={{ fontSize: '10px', color: '#64748b', margin: '0 0 2px' }}>Employees</p>
              <p style={{ fontSize: '14px', fontWeight: 800, color: '#1e293b', margin: 0 }}>{selectedPayroll.employees}</p>
            </div>
            <div style={{ background: '#f8fafc', padding: '10px', borderRadius: '8px', textAlign: 'center' }}>
              <p style={{ fontSize: '10px', color: '#64748b', margin: '0 0 2px' }}>Total Days</p>
              <p style={{ fontSize: '14px', fontWeight: 800, color: '#1e293b', margin: 0 }}>{selectedPayroll.totalDays}</p>
            </div>
            <div style={{ background: '#f8fafc', padding: '10px', borderRadius: '8px', textAlign: 'center' }}>
              <p style={{ fontSize: '10px', color: '#64748b', margin: '0 0 2px' }}>Present Days</p>
              <p style={{ fontSize: '14px', fontWeight: 800, color: '#22c55e', margin: 0 }}>{selectedPayroll.presentDays}</p>
            </div>
            <div style={{ background: '#f8fafc', padding: '10px', borderRadius: '8px', textAlign: 'center' }}>
              <p style={{ fontSize: '10px', color: '#64748b', margin: '0 0 2px' }}>Absent Days</p>
              <p style={{ fontSize: '14px', fontWeight: 800, color: '#ef4444', margin: 0 }}>{selectedPayroll.absentDays}</p>
            </div>
          </div>

          {/* Salary Breakdown List */}
          <div>
            <p style={{ color: '#64748b', fontWeight: 700, fontSize: '12px', margin: '0 0 8px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Amount Breakdown</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '13px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#64748b' }}>Basic Salary</span>
                <span style={{ fontWeight: 600, color: '#1e293b' }}>{formatCurrency(selectedPayroll.basic)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#64748b' }}>Allowances</span>
                <span style={{ fontWeight: 600, color: '#1e293b' }}>+ {formatCurrency(selectedPayroll.allowances)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', background: '#f8fafc', padding: '4px 6px', borderRadius: '4px' }}>
                <span style={{ color: '#1e293b', fontWeight: 600 }}>Gross Salary</span>
                <span style={{ fontWeight: 700, color: '#1e293b' }}>{formatCurrency(selectedPayroll.basic + selectedPayroll.allowances)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#64748b' }}>Deductions</span>
                <span style={{ fontWeight: 600, color: '#ef4444' }}>- {formatCurrency(selectedPayroll.deductions)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#64748b' }}>LOP (Loss Of Pay)</span>
                <span style={{ fontWeight: 600, color: '#ef4444' }}>- {formatCurrency(selectedPayroll.lop)}</span>
              </div>
              
              <div style={{ height: '1px', background: '#f1f5f9', margin: '4px 0' }} />

              <div style={{ display: 'flex', justifyContent: 'space-between', background: 'rgba(22, 163, 74, 0.05)', padding: '6px 8px', borderRadius: '6px' }}>
                <span style={{ color: '#15803d', fontWeight: 700 }}>Net Payable</span>
                <span style={{ fontWeight: 800, color: '#15803d', fontSize: '14px' }}>{formatCurrency(selectedPayroll.basic + selectedPayroll.allowances - selectedPayroll.deductions)}</span>
              </div>
            </div>
          </div>

          {/* Payment Info */}
          {selectedPayroll.status === 'Paid' && (
            <div>
              <p style={{ color: '#64748b', fontWeight: 700, fontSize: '12px', margin: '0 0 8px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Payment Information</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '13px', background: '#f8fafc', padding: '10px', borderRadius: '8px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#64748b' }}>Payment Date</span>
                  <span style={{ fontWeight: 600, color: '#334155' }}>{selectedPayroll.payDate}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#64748b' }}>Method</span>
                  <span style={{ fontWeight: 600, color: '#334155' }}>{selectedPayroll.payMethod}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', flexDirection: 'column', gap: '2px' }}>
                  <span style={{ color: '#64748b' }}>Reference No.</span>
                  <span style={{ fontWeight: 700, color: '#1e293b', fontSize: '11px', fontFamily: 'monospace' }}>{selectedPayroll.refNo}</span>
                </div>
              </div>
            </div>
          )}

          {/* Actions */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: 'auto' }}>
            
            <button
              style={{
                width: '100%', background: '#fff', border: '1px solid #cbd5e1', borderRadius: '6px',
                padding: '8px 12px', fontSize: '13px', fontWeight: 600, color: '#475569', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px'
              }}
            >
              <Download size={14} /> Download Payslip
            </button>

            {selectedPayroll.status !== 'Paid' && (
              <button
                onClick={() => handleProcessPayroll(selectedPayroll.id, 'Paid')}
                style={{
                  width: '100%', background: '#15803d', color: '#fff', border: 'none', borderRadius: '6px',
                  padding: '8px 12px', fontSize: '13px', fontWeight: 700, cursor: 'pointer'
                }}
              >
                Mark as Paid
              </button>
            )}

            {selectedPayroll.status === 'Draft' && (
              <button
                onClick={() => handleProcessPayroll(selectedPayroll.id, 'Processed')}
                style={{
                  width: '100%', background: '#1d4ed8', color: '#fff', border: 'none', borderRadius: '6px',
                  padding: '8px 12px', fontSize: '13px', fontWeight: 700, cursor: 'pointer'
                }}
              >
                Mark as Processed
              </button>
            )}

            <button
              style={{
                width: '100%', background: 'none', border: '1px solid rgba(192, 57, 43, 0.3)', color: '#c0392b', borderRadius: '6px',
                padding: '8px 12px', fontSize: '13px', fontWeight: 700, cursor: 'pointer'
              }}
            >
              View Employees
            </button>

          </div>

        </div>
      )}

    </div>
  )
}
