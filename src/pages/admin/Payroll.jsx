import { useState, useEffect, useMemo } from 'react'
import {
  DollarSign, Plus, Search, Calendar, CheckCircle2,
  Clock, AlertCircle, Eye, Check, CreditCard, ArrowRight,
  X, Loader2, FileText, Settings, User, Building2
} from 'lucide-react'
import {
  getAllPayrolls, generatePayroll, processPayroll, markPayrollAsPaid,
  getAllSalaryStructures, createSalaryStructure, updateSalaryStructure
} from '../../services/payrollService'
import { getEmployees } from '../../services/employeeService'
import { showSuccess, showError, showWarning } from '../../utils/toast'

export default function Payroll() {
  const [activeTab, setActiveTab] = useState('payrolls') // 'payrolls' | 'structures'
  const [payrolls, setPayrolls] = useState([])
  const [structures, setStructures] = useState([])
  const [employees, setEmployees] = useState([])
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(false)

  // Filters
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1)
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear())
  const [searchQuery, setSearchQuery] = useState('')

  // Modals
  const [generateModalOpen, setGenerateModalOpen] = useState(false)
  const [structureModalOpen, setStructureModalOpen] = useState(false)
  const [payModalOpen, setPayModalOpen] = useState(false)
  const [detailsModalOpen, setDetailsModalOpen] = useState(false)
  const [selectedPayroll, setSelectedPayroll] = useState(null)
  const [selectedStructure, setSelectedStructure] = useState(null)

  // Forms
  const [generateForm, setGenerateForm] = useState({
    employeeId: '',
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear(),
  })

  const [structureForm, setStructureForm] = useState({
    employeeId: '',
    basicSalary: '',
    hra: '',
    specialAllowance: '',
    travelAllowance: '',
    providentFund: '',
    professionalTax: '',
  })

  const [paymentForm, setPaymentForm] = useState({
    paymentReference: '',
    remarks: '',
  })

  const fetchData = async () => {
    try {
      setLoading(true)
      const [pRes, sRes, eRes] = await Promise.all([
        getAllPayrolls({ month: selectedMonth, year: selectedYear }),
        getAllSalaryStructures(),
        getEmployees(),
      ])
      if (pRes?.payrolls) setPayrolls(pRes.payrolls)
      if (sRes?.salaryStructures) setStructures(sRes.salaryStructures)
      if (eRes?.employees) setEmployees(eRes.employees)
    } catch (err) {
      showError(err.response?.data?.message || 'Failed to load payroll records')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [selectedMonth, selectedYear])

  // Currency Formatter
  const formatCurrency = (amt) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amt || 0)
  }

  // Summary KPIs
  const totalOutflow = payrolls.reduce((acc, p) => acc + (p.netSalary || 0), 0)
  const paidOutflow = payrolls.filter((p) => p.status === 'paid').reduce((acc, p) => acc + (p.netSalary || 0), 0)
  const pendingCount = payrolls.filter((p) => p.status !== 'paid').length
  const structureCount = structures.length

  // Filtered Payrolls
  const filteredPayrolls = useMemo(() => {
    return payrolls.filter((p) => {
      const emp = p.employeeId
      const empName = emp?.userId?.name || ''
      const empId = emp?.userId?.employeeId || ''
      const q = searchQuery.toLowerCase()
      return empName.toLowerCase().includes(q) || empId.toLowerCase().includes(q)
    })
  }, [payrolls, searchQuery])

  // Handle Generate Payroll
  const handleGenerateSubmit = async (e) => {
    e.preventDefault()
    if (!generateForm.employeeId) {
      showWarning('Please select an employee')
      return
    }

    try {
      setActionLoading(true)
      const res = await generatePayroll(generateForm)
      showSuccess(res.message || 'Monthly payroll generated successfully!')
      setGenerateModalOpen(false)
      fetchData()
    } catch (err) {
      showError(err.response?.data?.message || 'Failed to generate payroll')
    } finally {
      setActionLoading(false)
    }
  }

  // Handle Process Payroll
  const handleProcessPayroll = async (id) => {
    try {
      setActionLoading(true)
      const res = await processPayroll(id)
      showSuccess(res.message || 'Payroll marked as processed')
      fetchData()
    } catch (err) {
      showError(err.response?.data?.message || 'Failed to process payroll')
    } finally {
      setActionLoading(false)
    }
  }

  // Open Pay Modal
  const handleOpenPay = (p) => {
    setSelectedPayroll(p)
    setPaymentForm({
      paymentReference: `TXN-${Date.now().toString().slice(-6)}`,
      remarks: 'Salary transferred via NEFT/IMPS',
    })
    setPayModalOpen(true)
  }

  // Handle Mark Paid Submit
  const handlePaySubmit = async (e) => {
    e.preventDefault()
    if (!selectedPayroll) return

    try {
      setActionLoading(true)
      const res = await markPayrollAsPaid(selectedPayroll._id, paymentForm)
      showSuccess(res.message || 'Payroll marked as paid!')
      setPayModalOpen(false)
      setSelectedPayroll(null)
      fetchData()
    } catch (err) {
      showError(err.response?.data?.message || 'Failed to mark as paid')
    } finally {
      setActionLoading(false)
    }
  }

  // Open Configure Structure Modal
  const handleOpenStructure = (s = null) => {
    setSelectedStructure(s)
    if (s) {
      setStructureForm({
        employeeId: s.employeeId?._id || s.employeeId || '',
        basicSalary: s.basicSalary || '',
        hra: s.hra || '',
        specialAllowance: s.specialAllowance || '',
        travelAllowance: s.travelAllowance || '',
        providentFund: s.providentFund || '',
        professionalTax: s.professionalTax || '',
      })
    } else {
      setStructureForm({
        employeeId: employees[0]?._id || '',
        basicSalary: '',
        hra: '',
        specialAllowance: '',
        travelAllowance: '',
        providentFund: '',
        professionalTax: '',
      })
    }
    setStructureModalOpen(true)
  }

  // Submit Structure
  const handleStructureSubmit = async (e) => {
    e.preventDefault()
    try {
      setActionLoading(true)
      const payload = {
        ...structureForm,
        basicSalary: Number(structureForm.basicSalary) || 0,
        hra: Number(structureForm.hra) || 0,
        specialAllowance: Number(structureForm.specialAllowance) || 0,
        travelAllowance: Number(structureForm.travelAllowance) || 0,
        providentFund: Number(structureForm.providentFund) || 0,
        professionalTax: Number(structureForm.professionalTax) || 0,
      }

      if (selectedStructure) {
        await updateSalaryStructure(selectedStructure._id, payload)
        showSuccess('Salary structure updated successfully!')
      } else {
        await createSalaryStructure(payload)
        showSuccess('Salary structure created successfully!')
      }
      setStructureModalOpen(false)
      setSelectedStructure(null)
      fetchData()
    } catch (err) {
      showError(err.response?.data?.message || 'Failed to save salary structure')
    } finally {
      setActionLoading(false)
    }
  }

  // Month names
  const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

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
          <h2 style={{ fontSize: 22, fontWeight: 700, margin: 0 }}>Payroll & Compensation</h2>
          <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.85)', margin: '4px 0 0 0' }}>
            Automate monthly salary processing, attendance LOP deductions, and payslip generation.
          </p>
        </div>

        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <button
            onClick={() => handleOpenStructure()}
            style={{
              display: 'flex', alignItems: 'center', gap: 6,
              background: 'rgba(255,255,255,0.2)', color: '#fff',
              border: '1px solid rgba(255,255,255,0.4)', borderRadius: 10,
              padding: '10px 16px', fontSize: 13, fontWeight: 600, cursor: 'pointer',
            }}
          >
            <Settings size={15} />
            <span>Salary Structures</span>
          </button>

          <button
            onClick={() => {
              setGenerateForm({
                employeeId: employees[0]?._id || '',
                month: selectedMonth,
                year: selectedYear,
              })
              setGenerateModalOpen(true)
            }}
            style={{
              display: 'flex', alignItems: 'center', gap: 8,
              background: '#fff', color: '#c0392b', border: 'none',
              borderRadius: 10, padding: '10px 18px', fontSize: 13,
              fontWeight: 700, cursor: 'pointer',
              boxShadow: '0 2px 6px rgba(0,0,0,0.1)',
            }}
          >
            <Plus size={16} />
            <span>Generate Payroll</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
        <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 14, padding: 18 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ width: 34, height: 34, borderRadius: 10, background: '#fef2f2', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#c0392b' }}>
              <DollarSign size={17} />
            </div>
            <span style={{ fontSize: 11, fontWeight: 600, color: '#c0392b', background: '#fee2e2', padding: '2px 8px', borderRadius: 10 }}>Monthly</span>
          </div>
          <h3 style={{ fontSize: 22, fontWeight: 800, color: '#0f172a', margin: '12px 0 2px 0' }}>{formatCurrency(totalOutflow)}</h3>
          <p style={{ fontSize: 12, color: '#64748b', margin: 0 }}>Total Net Payroll ({MONTHS[selectedMonth - 1]} {selectedYear})</p>
        </div>

        <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 14, padding: 18 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ width: 34, height: 34, borderRadius: 10, background: '#f0fdf4', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#16a34a' }}>
              <CheckCircle2 size={17} />
            </div>
            <span style={{ fontSize: 11, fontWeight: 600, color: '#16a34a', background: '#dcfce7', padding: '2px 8px', borderRadius: 10 }}>Disbursed</span>
          </div>
          <h3 style={{ fontSize: 22, fontWeight: 800, color: '#0f172a', margin: '12px 0 2px 0' }}>{formatCurrency(paidOutflow)}</h3>
          <p style={{ fontSize: 12, color: '#64748b', margin: 0 }}>Salaries Paid Out</p>
        </div>

        <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 14, padding: 18 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ width: 34, height: 34, borderRadius: 10, background: '#fefce8', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ca8a04' }}>
              <Clock size={17} />
            </div>
            <span style={{ fontSize: 11, fontWeight: 600, color: '#ca8a04', background: '#fef9c3', padding: '2px 8px', borderRadius: 10 }}>Action</span>
          </div>
          <h3 style={{ fontSize: 22, fontWeight: 800, color: '#0f172a', margin: '12px 0 2px 0' }}>{pendingCount}</h3>
          <p style={{ fontSize: 12, color: '#64748b', margin: 0 }}>Pending Payment Processing</p>
        </div>

        <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 14, padding: 18 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ width: 34, height: 34, borderRadius: 10, background: '#f5f3ff', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#8b5cf6' }}>
              <Settings size={17} />
            </div>
            <span style={{ fontSize: 11, fontWeight: 600, color: '#8b5cf6', background: '#ede9fe', padding: '2px 8px', borderRadius: 10 }}>Active</span>
          </div>
          <h3 style={{ fontSize: 22, fontWeight: 800, color: '#0f172a', margin: '12px 0 2px 0' }}>{structureCount} Staff</h3>
          <p style={{ fontSize: 12, color: '#64748b', margin: 0 }}>Configured Salary Structures</p>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 10, borderBottom: '1px solid #e2e8f0', paddingBottom: 8 }}>
        <button
          onClick={() => setActiveTab('payrolls')}
          style={{
            padding: '8px 16px', borderRadius: 8, border: 'none',
            background: activeTab === 'payrolls' ? '#c0392b' : 'transparent',
            color: activeTab === 'payrolls' ? '#fff' : '#64748b',
            fontWeight: 600, fontSize: 13, cursor: 'pointer',
          }}
        >
          Monthly Payrolls
        </button>

        <button
          onClick={() => setActiveTab('structures')}
          style={{
            padding: '8px 16px', borderRadius: 8, border: 'none',
            background: activeTab === 'structures' ? '#c0392b' : 'transparent',
            color: activeTab === 'structures' ? '#fff' : '#64748b',
            fontWeight: 600, fontSize: 13, cursor: 'pointer',
          }}
        >
          Salary Structures ({structures.length})
        </button>
      </div>

      {/* TAB 1: Monthly Payrolls */}
      {activeTab === 'payrolls' && (
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
              borderRadius: 8, padding: '7px 12px', width: 240,
            }}>
              <Search size={15} color="#94a3b8" />
              <input
                type="text"
                placeholder="Search staff, ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{ border: 'none', background: 'none', outline: 'none', fontSize: 12, color: '#334155', width: '100%' }}
              />
            </div>

            <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
              <span style={{ fontSize: 12, fontWeight: 600, color: '#334155' }}>Period:</span>
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(Number(e.target.value))}
                style={{ padding: '6px 10px', borderRadius: 8, border: '1px solid #cbd5e1', background: '#f8fafc', fontSize: 12, outline: 'none', cursor: 'pointer' }}
              >
                {MONTHS.map((m, idx) => (
                  <option key={m} value={idx + 1}>{m}</option>
                ))}
              </select>

              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(Number(e.target.value))}
                style={{ padding: '6px 10px', borderRadius: 8, border: '1px solid #cbd5e1', background: '#f8fafc', fontSize: 12, outline: 'none', cursor: 'pointer' }}
              >
                {[2025, 2026, 2027].map((y) => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Table */}
          <div style={{ overflowX: 'auto' }}>
            {loading ? (
              <div style={{ padding: 48, textAlign: 'center', color: '#64748b' }}>
                <Loader2 size={24} className="animate-spin" style={{ margin: '0 auto 8px' }} />
                <p style={{ fontSize: 13 }}>Loading payroll entries...</p>
              </div>
            ) : filteredPayrolls.length === 0 ? (
              <div style={{ padding: 48, textAlign: 'center', color: '#64748b' }}>
                <DollarSign size={32} color="#cbd5e1" style={{ margin: '0 auto 8px' }} />
                <p style={{ fontSize: 14, fontWeight: 600, color: '#334155' }}>No payroll generated for {MONTHS[selectedMonth - 1]} {selectedYear}</p>
                <p style={{ fontSize: 12, color: '#94a3b8' }}>Click 'Generate Payroll' above to calculate employee monthly salaries.</p>
              </div>
            ) : (
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                <thead>
                  <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#64748b', textAlign: 'left' }}>
                    <th style={{ padding: '12px 18px', fontWeight: 600 }}>Employee</th>
                    <th style={{ padding: '12px 18px', fontWeight: 600 }}>Period</th>
                    <th style={{ padding: '12px 18px', fontWeight: 600 }}>Working / Present</th>
                    <th style={{ padding: '12px 18px', fontWeight: 600 }}>LOP Days</th>
                    <th style={{ padding: '12px 18px', fontWeight: 600 }}>Gross Pay</th>
                    <th style={{ padding: '12px 18px', fontWeight: 600 }}>Deductions</th>
                    <th style={{ padding: '12px 18px', fontWeight: 600 }}>Net Pay</th>
                    <th style={{ padding: '12px 18px', fontWeight: 600 }}>Status</th>
                    <th style={{ padding: '12px 18px', fontWeight: 600, textAlign: 'center' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredPayrolls.map((p) => {
                    const emp = p.employeeId
                    const empName = emp?.userId?.name || 'Staff'
                    const empId = emp?.userId?.employeeId || '-'

                    return (
                      <tr
                        key={p._id}
                        style={{ borderBottom: '1px solid #f1f5f9', transition: 'background 0.15s' }}
                        onMouseEnter={(e) => (e.currentTarget.style.background = '#fafafa')}
                        onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                      >
                        <td style={{ padding: '14px 18px' }}>
                          <div style={{ fontWeight: 600, color: '#0f172a' }}>{empName}</div>
                          <div style={{ fontSize: 11, color: '#94a3b8' }}>{empId}</div>
                        </td>
                        <td style={{ padding: '14px 18px', color: '#475569' }}>
                          {MONTHS[p.month - 1]} {p.year}
                        </td>
                        <td style={{ padding: '14px 18px', color: '#334155' }}>
                          {p.workingDays}d / <strong style={{ color: '#16a34a' }}>{p.presentDays}d</strong>
                        </td>
                        <td style={{ padding: '14px 18px', color: p.lopDays > 0 ? '#dc2626' : '#64748b' }}>
                          {p.lopDays || 0}d
                        </td>
                        <td style={{ padding: '14px 18px', color: '#0f172a' }}>
                          {formatCurrency(p.grossSalary)}
                        </td>
                        <td style={{ padding: '14px 18px', color: '#b91c1c' }}>
                          {formatCurrency(p.totalDeductions + (p.lopAmount || 0))}
                        </td>
                        <td style={{ padding: '14px 18px', fontWeight: 700, color: '#16a34a' }}>
                          {formatCurrency(p.netSalary)}
                        </td>
                        <td style={{ padding: '14px 18px' }}>
                          <span style={{
                            padding: '3px 9px', borderRadius: 10, fontSize: 11, fontWeight: 700, textTransform: 'capitalize',
                            background: p.status === 'paid' ? '#dcfce7' : p.status === 'processed' ? '#dbeafe' : '#fef3c7',
                            color: p.status === 'paid' ? '#15803d' : p.status === 'processed' ? '#2563eb' : '#b45309',
                          }}>
                            {p.status}
                          </span>
                        </td>
                        <td style={{ padding: '14px 18px', textAlign: 'center' }}>
                          <div style={{ display: 'inline-flex', gap: 6 }}>
                            {p.status === 'draft' && (
                              <button
                                onClick={() => handleProcessPayroll(p._id)}
                                title="Process Payroll"
                                style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 6, padding: '4px 8px', fontSize: 11, fontWeight: 600, color: '#c0392b', cursor: 'pointer' }}
                              >
                                Process
                              </button>
                            )}
                            {p.status === 'processed' && (
                              <button
                                onClick={() => handleOpenPay(p)}
                                title="Mark Salary as Paid"
                                style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 6, padding: '4px 8px', fontSize: 11, fontWeight: 600, color: '#16a34a', cursor: 'pointer' }}
                              >
                                Pay Out
                              </button>
                            )}
                            <button
                              onClick={() => { setSelectedPayroll(p); setDetailsModalOpen(true); }}
                              title="View Payslip Breakdown"
                              style={{ background: '#f1f5f9', border: 'none', borderRadius: 6, padding: 6, cursor: 'pointer', color: '#475569' }}
                            >
                              <Eye size={13} />
                            </button>
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
      )}

      {/* TAB 2: Salary Structures */}
      {activeTab === 'structures' && (
        <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #e2e8f0', overflow: 'hidden' }}>
          <div style={{ overflowX: 'auto' }}>
            {structures.length === 0 ? (
              <div style={{ padding: 48, textAlign: 'center', color: '#64748b' }}>
                <Settings size={32} color="#cbd5e1" style={{ margin: '0 auto 8px' }} />
                <p style={{ fontSize: 14, fontWeight: 600, color: '#334155' }}>No salary structures configured</p>
                <p style={{ fontSize: 12, color: '#94a3b8' }}>Click 'Salary Structures' in the banner to configure compensation.</p>
              </div>
            ) : (
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                <thead>
                  <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#64748b', textAlign: 'left' }}>
                    <th style={{ padding: '12px 18px', fontWeight: 600 }}>Employee</th>
                    <th style={{ padding: '12px 18px', fontWeight: 600 }}>Basic Pay</th>
                    <th style={{ padding: '12px 18px', fontWeight: 600 }}>HRA</th>
                    <th style={{ padding: '12px 18px', fontWeight: 600 }}>Allowances</th>
                    <th style={{ padding: '12px 18px', fontWeight: 600 }}>PF & Taxes</th>
                    <th style={{ padding: '12px 18px', fontWeight: 600 }}>Gross Salary</th>
                    <th style={{ padding: '12px 18px', fontWeight: 600 }}>Net Salary</th>
                    <th style={{ padding: '12px 18px', fontWeight: 600, textAlign: 'center' }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {structures.map((s) => {
                    const emp = s.employeeId
                    const empName = emp?.userId?.name || 'Employee'
                    const empId = emp?.userId?.employeeId || '-'
                    const allowances = (s.specialAllowance || 0) + (s.travelAllowance || 0)
                    const deductions = (s.providentFund || 0) + (s.professionalTax || 0)

                    return (
                      <tr key={s._id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                        <td style={{ padding: '14px 18px' }}>
                          <div style={{ fontWeight: 600, color: '#0f172a' }}>{empName}</div>
                          <div style={{ fontSize: 11, color: '#94a3b8' }}>{empId}</div>
                        </td>
                        <td style={{ padding: '14px 18px', color: '#0f172a' }}>{formatCurrency(s.basicSalary)}</td>
                        <td style={{ padding: '14px 18px', color: '#475569' }}>{formatCurrency(s.hra)}</td>
                        <td style={{ padding: '14px 18px', color: '#475569' }}>{formatCurrency(allowances)}</td>
                        <td style={{ padding: '14px 18px', color: '#b91c1c' }}>{formatCurrency(deductions)}</td>
                        <td style={{ padding: '14px 18px', fontWeight: 600, color: '#0f172a' }}>{formatCurrency(s.grossSalary)}</td>
                        <td style={{ padding: '14px 18px', fontWeight: 700, color: '#16a34a' }}>{formatCurrency(s.netSalary)}</td>
                        <td style={{ padding: '14px 18px', textAlign: 'center' }}>
                          <button
                            onClick={() => handleOpenStructure(s)}
                            style={{ background: '#f1f5f9', border: 'none', borderRadius: 6, padding: '5px 10px', cursor: 'pointer', fontSize: 11.5, fontWeight: 600, color: '#334155' }}
                          >
                            Edit
                          </button>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}

      {/* Generate Payroll Modal */}
      {generateModalOpen && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.65)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 20 }}>
          <div style={{ background: '#fff', borderRadius: 16, maxWidth: 440, width: '100%', padding: 24 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h3 style={{ fontSize: 17, fontWeight: 700, color: '#0f172a', margin: 0 }}>Generate Monthly Payroll</h3>
              <button onClick={() => setGenerateModalOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8' }}><X size={18} /></button>
            </div>

            <form onSubmit={handleGenerateSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div>
                <label style={{ fontSize: 11, fontWeight: 600, color: '#334155', display: 'block', marginBottom: 4 }}>Select Employee *</label>
                <select
                  required
                  value={generateForm.employeeId}
                  onChange={(e) => setGenerateForm({ ...generateForm, employeeId: e.target.value })}
                  style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: 12.5, outline: 'none' }}
                >
                  <option value="">-- Choose Employee --</option>
                  {employees.map((emp) => (
                    <option key={emp._id} value={emp._id}>
                      {emp.userId?.name} ({emp.userId?.employeeId})
                    </option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <div>
                  <label style={{ fontSize: 11, fontWeight: 600, color: '#334155', display: 'block', marginBottom: 4 }}>Month</label>
                  <select
                    value={generateForm.month}
                    onChange={(e) => setGenerateForm({ ...generateForm, month: Number(e.target.value) })}
                    style={{ width: '100%', padding: '8px 10px', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: 12, outline: 'none' }}
                  >
                    {MONTHS.map((m, idx) => (
                      <option key={m} value={idx + 1}>{m}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: 11, fontWeight: 600, color: '#334155', display: 'block', marginBottom: 4 }}>Year</label>
                  <select
                    value={generateForm.year}
                    onChange={(e) => setGenerateForm({ ...generateForm, year: Number(e.target.value) })}
                    style={{ width: '100%', padding: '8px 10px', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: 12, outline: 'none' }}
                  >
                    {[2025, 2026, 2027].map((y) => (
                      <option key={y} value={y}>{y}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div style={{ background: '#f8fafc', padding: 12, borderRadius: 8, fontSize: 11.5, color: '#64748b' }}>
                ℹ️ The payroll engine automatically queries employee attendance, leaves, and calculates Loss of Pay (LOP) deductions against the active salary structure.
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 8 }}>
                <button type="button" onClick={() => setGenerateModalOpen(false)} style={{ padding: '8px 16px', borderRadius: 8, border: '1px solid #e2e8f0', background: '#fff', fontSize: 13, color: '#64748b', cursor: 'pointer' }}>Cancel</button>
                <button type="submit" disabled={actionLoading} style={{ padding: '8px 18px', borderRadius: 8, border: 'none', background: 'linear-gradient(135deg, #c0392b, #922b21)', color: '#fff', fontSize: 13, fontWeight: 600, cursor: actionLoading ? 'not-allowed' : 'pointer' }}>
                  {actionLoading ? 'Calculating...' : 'Run Payroll'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Salary Structure Modal */}
      {structureModalOpen && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.65)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 20 }}>
          <div style={{ background: '#fff', borderRadius: 16, maxWidth: 480, width: '100%', padding: 24 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h3 style={{ fontSize: 17, fontWeight: 700, color: '#0f172a', margin: 0 }}>Configure Salary Structure</h3>
              <button onClick={() => setStructureModalOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8' }}><X size={18} /></button>
            </div>

            <form onSubmit={handleStructureSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {!selectedStructure && (
                <div>
                  <label style={{ fontSize: 11, fontWeight: 600, color: '#334155', display: 'block', marginBottom: 4 }}>Select Employee *</label>
                  <select
                    required
                    value={structureForm.employeeId}
                    onChange={(e) => setStructureForm({ ...structureForm, employeeId: e.target.value })}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: 12.5, outline: 'none' }}
                  >
                    <option value="">-- Choose Employee --</option>
                    {employees.map((emp) => (
                      <option key={emp._id} value={emp._id}>
                        {emp.userId?.name} ({emp.userId?.employeeId})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <div>
                  <label style={{ fontSize: 11, fontWeight: 600, color: '#334155', display: 'block', marginBottom: 3 }}>Basic Salary (₹) *</label>
                  <input
                    type="number"
                    required
                    placeholder="e.g. 45000"
                    value={structureForm.basicSalary}
                    onChange={(e) => setStructureForm({ ...structureForm, basicSalary: e.target.value })}
                    style={{ width: '100%', padding: '8px 10px', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: 12, outline: 'none' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: 11, fontWeight: 600, color: '#334155', display: 'block', marginBottom: 3 }}>HRA (₹)</label>
                  <input
                    type="number"
                    placeholder="e.g. 18000"
                    value={structureForm.hra}
                    onChange={(e) => setStructureForm({ ...structureForm, hra: e.target.value })}
                    style={{ width: '100%', padding: '8px 10px', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: 12, outline: 'none' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <div>
                  <label style={{ fontSize: 11, fontWeight: 600, color: '#334155', display: 'block', marginBottom: 3 }}>Special Allowance (₹)</label>
                  <input
                    type="number"
                    placeholder="e.g. 10000"
                    value={structureForm.specialAllowance}
                    onChange={(e) => setStructureForm({ ...structureForm, specialAllowance: e.target.value })}
                    style={{ width: '100%', padding: '8px 10px', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: 12, outline: 'none' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: 11, fontWeight: 600, color: '#334155', display: 'block', marginBottom: 3 }}>Travel Allowance (₹)</label>
                  <input
                    type="number"
                    placeholder="e.g. 3000"
                    value={structureForm.travelAllowance}
                    onChange={(e) => setStructureForm({ ...structureForm, travelAllowance: e.target.value })}
                    style={{ width: '100%', padding: '8px 10px', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: 12, outline: 'none' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <div>
                  <label style={{ fontSize: 11, fontWeight: 600, color: '#334155', display: 'block', marginBottom: 3 }}>Provident Fund (₹)</label>
                  <input
                    type="number"
                    placeholder="e.g. 1800"
                    value={structureForm.providentFund}
                    onChange={(e) => setStructureForm({ ...structureForm, providentFund: e.target.value })}
                    style={{ width: '100%', padding: '8px 10px', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: 12, outline: 'none' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: 11, fontWeight: 600, color: '#334155', display: 'block', marginBottom: 3 }}>Professional Tax (₹)</label>
                  <input
                    type="number"
                    placeholder="e.g. 200"
                    value={structureForm.professionalTax}
                    onChange={(e) => setStructureForm({ ...structureForm, professionalTax: e.target.value })}
                    style={{ width: '100%', padding: '8px 10px', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: 12, outline: 'none' }}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 10 }}>
                <button type="button" onClick={() => setStructureModalOpen(false)} style={{ padding: '8px 16px', borderRadius: 8, border: '1px solid #e2e8f0', background: '#fff', fontSize: 13, color: '#64748b', cursor: 'pointer' }}>Cancel</button>
                <button type="submit" disabled={actionLoading} style={{ padding: '8px 18px', borderRadius: 8, border: 'none', background: 'linear-gradient(135deg, #c0392b, #922b21)', color: '#fff', fontSize: 13, fontWeight: 600, cursor: actionLoading ? 'not-allowed' : 'pointer' }}>
                  {actionLoading ? 'Saving...' : 'Save Structure'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Pay Out Modal */}
      {payModalOpen && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.65)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 20 }}>
          <div style={{ background: '#fff', borderRadius: 16, maxWidth: 420, width: '100%', padding: 24 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
              <h3 style={{ fontSize: 17, fontWeight: 700, color: '#0f172a', margin: 0 }}>Disburse Salary</h3>
              <button onClick={() => setPayModalOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8' }}><X size={18} /></button>
            </div>

            <p style={{ fontSize: 13, color: '#64748b', margin: '0 0 16px 0' }}>
              Marking salary payment of <strong>{formatCurrency(selectedPayroll?.netSalary)}</strong> for <strong>{selectedPayroll?.employeeId?.userId?.name}</strong>.
            </p>

            <form onSubmit={handlePaySubmit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div>
                <label style={{ fontSize: 11, fontWeight: 600, color: '#334155', display: 'block', marginBottom: 4 }}>Transaction Reference *</label>
                <input
                  type="text"
                  required
                  value={paymentForm.paymentReference}
                  onChange={(e) => setPaymentForm({ ...paymentForm, paymentReference: e.target.value })}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: 12.5, outline: 'none' }}
                />
              </div>

              <div>
                <label style={{ fontSize: 11, fontWeight: 600, color: '#334155', display: 'block', marginBottom: 4 }}>Disbursement Remarks</label>
                <textarea
                  rows="2"
                  value={paymentForm.remarks}
                  onChange={(e) => setPaymentForm({ ...paymentForm, remarks: e.target.value })}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: 12, outline: 'none' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 8 }}>
                <button type="button" onClick={() => setPayModalOpen(false)} style={{ padding: '8px 16px', borderRadius: 8, border: '1px solid #e2e8f0', background: '#fff', fontSize: 13, color: '#64748b', cursor: 'pointer' }}>Cancel</button>
                <button type="submit" disabled={actionLoading} style={{ padding: '8px 18px', borderRadius: 8, border: 'none', background: '#16a34a', color: '#fff', fontSize: 13, fontWeight: 600, cursor: actionLoading ? 'not-allowed' : 'pointer' }}>
                  {actionLoading ? 'Recording...' : 'Confirm Payment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Details & Payslip Preview Modal */}
      {detailsModalOpen && selectedPayroll && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.65)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 20 }}>
          <div style={{ background: '#fff', borderRadius: 16, maxWidth: 520, width: '100%', padding: 26, boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
              <div>
                <h3 style={{ fontSize: 18, fontWeight: 800, color: '#0f172a', margin: 0 }}>Payslip Breakdown</h3>
                <p style={{ fontSize: 12, color: '#64748b', margin: '2px 0 0 0' }}>
                  {selectedPayroll.employeeId?.userId?.name} ({selectedPayroll.employeeId?.userId?.employeeId}) • {MONTHS[selectedPayroll.month - 1]} {selectedPayroll.year}
                </p>
              </div>
              <button onClick={() => setDetailsModalOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8' }}><X size={18} /></button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, margin: '16px 0', fontSize: 12.5 }}>
              {/* Earnings */}
              <div style={{ background: '#f0fdf4', border: '1px solid #dcfce7', borderRadius: 10, padding: 14 }}>
                <h4 style={{ fontSize: 13, fontWeight: 700, color: '#166534', margin: '0 0 10px 0' }}>Earnings</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#4b5563' }}>Basic Salary:</span>
                    <strong>{formatCurrency(selectedPayroll.salaryStructureId?.basicSalary)}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#4b5563' }}>HRA:</span>
                    <strong>{formatCurrency(selectedPayroll.salaryStructureId?.hra)}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#4b5563' }}>Allowances:</span>
                    <strong>{formatCurrency((selectedPayroll.salaryStructureId?.specialAllowance || 0) + (selectedPayroll.salaryStructureId?.travelAllowance || 0))}</strong>
                  </div>
                  <div style={{ borderTop: '1px solid #bbf7d0', paddingTop: 6, display: 'flex', justifyContent: 'space-between', color: '#15803d' }}>
                    <span>Gross Earnings:</span>
                    <strong>{formatCurrency(selectedPayroll.grossSalary)}</strong>
                  </div>
                </div>
              </div>

              {/* Deductions */}
              <div style={{ background: '#fef2f2', border: '1px solid #fee2e2', borderRadius: 10, padding: 14 }}>
                <h4 style={{ fontSize: 13, fontWeight: 700, color: '#991b1b', margin: '0 0 10px 0' }}>Deductions</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#4b5563' }}>Provident Fund:</span>
                    <strong>{formatCurrency(selectedPayroll.salaryStructureId?.providentFund)}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#4b5563' }}>Professional Tax:</span>
                    <strong>{formatCurrency(selectedPayroll.salaryStructureId?.professionalTax)}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: '#dc2626' }}>
                    <span>LOP ({selectedPayroll.lopDays || 0}d):</span>
                    <strong>{formatCurrency(selectedPayroll.lopAmount || 0)}</strong>
                  </div>
                  <div style={{ borderTop: '1px solid #fecaca', paddingTop: 6, display: 'flex', justifyContent: 'space-between', color: '#b91c1c' }}>
                    <span>Total Deductions:</span>
                    <strong>{formatCurrency((selectedPayroll.totalDeductions || 0) + (selectedPayroll.lopAmount || 0))}</strong>
                  </div>
                </div>
              </div>
            </div>

            {/* Net Salary Box */}
            <div style={{
              background: '#f8fafc', borderRadius: 10, padding: '12px 16px',
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              border: '1px solid #e2e8f0',
            }}>
              <div>
                <span style={{ fontSize: 11, color: '#64748b' }}>Net Disbursable Amount</span>
                <div style={{ fontSize: 20, fontWeight: 800, color: '#16a34a' }}>
                  {formatCurrency(selectedPayroll.netSalary)}
                </div>
              </div>

              <span style={{
                padding: '4px 10px', borderRadius: 8, fontSize: 12, fontWeight: 700, textTransform: 'capitalize',
                background: selectedPayroll.status === 'paid' ? '#dcfce7' : '#dbeafe',
                color: selectedPayroll.status === 'paid' ? '#15803d' : '#2563eb',
              }}>
                {selectedPayroll.status}
              </span>
            </div>

            <div style={{ marginTop: 18, textAlign: 'right' }}>
              <button
                type="button"
                onClick={() => setDetailsModalOpen(false)}
                style={{ padding: '8px 18px', borderRadius: 8, border: '1px solid #e2e8f0', background: '#fff', fontSize: 13, color: '#64748b', cursor: 'pointer' }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
