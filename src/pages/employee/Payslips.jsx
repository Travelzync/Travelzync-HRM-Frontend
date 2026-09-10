import { useState, useEffect } from 'react'
import {
  FileText, DollarSign, Download, Printer, Eye,
  Calendar, CheckCircle2, AlertCircle, X, Loader2, Building2
} from 'lucide-react'
import { getMyPayrolls } from '../../services/payrollService'
import { getCurrentUser } from '../../services/authService'
import { showError } from '../../utils/toast'

export default function Payslips() {
  const [payrolls, setPayrolls] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedPayslip, setSelectedPayslip] = useState(null)
  const user = getCurrentUser()

  useEffect(() => {
    const fetchPayrolls = async () => {
      try {
        setLoading(true)
        const res = await getMyPayrolls()
        if (res?.payrolls) setPayrolls(res.payrolls)
      } catch (err) {
        showError(err.response?.data?.message || 'Failed to load payslips')
      } finally {
        setLoading(false)
      }
    }
    fetchPayrolls()
  }, [])

  const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

  const formatCurrency = (amt) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amt || 0)
  }

  // Summary KPIs
  const latestPayroll = payrolls[0] || null
  const totalEarned = payrolls.reduce((acc, p) => acc + (p.netSalary || 0), 0)

  // Handle Print
  const handlePrint = () => {
    window.print()
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
          <h2 style={{ fontSize: 22, fontWeight: 700, margin: 0 }}>My Payslips & Compensation</h2>
          <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.85)', margin: '4px 0 0 0' }}>
            View and download monthly salary slips, tax deductions, and payment receipts.
          </p>
        </div>

        <div style={{
          background: 'rgba(255, 255, 255, 0.15)', borderRadius: 12,
          padding: '10px 18px', display: 'flex', alignItems: 'center', gap: 14,
        }}>
          <div>
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.8)' }}>Latest Disbursed</div>
            <div style={{ fontSize: 18, fontWeight: 800 }}>
              {latestPayroll ? formatCurrency(latestPayroll.netSalary) : '₹0'}
            </div>
          </div>
          <div style={{ width: 1, height: 28, background: 'rgba(255,255,255,0.2)' }} />
          <div>
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.8)' }}>Pay Slips Available</div>
            <div style={{ fontSize: 18, fontWeight: 800 }}>{payrolls.length}</div>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16 }}>
        <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 14, padding: 18 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ width: 34, height: 34, borderRadius: 10, background: '#fef2f2', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#c0392b' }}>
              <DollarSign size={17} />
            </div>
            <span style={{ fontSize: 11, fontWeight: 600, color: '#c0392b', background: '#fee2e2', padding: '2px 8px', borderRadius: 10 }}>Total</span>
          </div>
          <h3 style={{ fontSize: 22, fontWeight: 800, color: '#0f172a', margin: '12px 0 2px 0' }}>{formatCurrency(totalEarned)}</h3>
          <p style={{ fontSize: 12, color: '#64748b', margin: 0 }}>Total Earnings Recorded</p>
        </div>

        <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 14, padding: 18 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ width: 34, height: 34, borderRadius: 10, background: '#f0fdf4', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#16a34a' }}>
              <CheckCircle2 size={17} />
            </div>
            <span style={{ fontSize: 11, fontWeight: 600, color: '#16a34a', background: '#dcfce7', padding: '2px 8px', borderRadius: 10 }}>Latest</span>
          </div>
          <h3 style={{ fontSize: 22, fontWeight: 800, color: '#0f172a', margin: '12px 0 2px 0' }}>
            {latestPayroll ? `${MONTHS[latestPayroll.month - 1]} ${latestPayroll.year}` : '-'}
          </h3>
          <p style={{ fontSize: 12, color: '#64748b', margin: 0 }}>Recent Disbursed Pay Period</p>
        </div>
      </div>

      {/* Payslips Table */}
      <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #e2e8f0', overflow: 'hidden' }}>
        <div style={{ padding: '18px 24px', borderBottom: '1px solid #f1f5f9' }}>
          <h3 style={{ fontSize: 16, fontWeight: 700, color: '#0f172a', margin: 0 }}>Payslip History</h3>
          <p style={{ fontSize: 12, color: '#64748b', margin: '2px 0 0 0' }}>
            Click on any monthly record to view, print, or download your detailed salary certificate.
          </p>
        </div>

        <div style={{ overflowX: 'auto' }}>
          {loading ? (
            <div style={{ padding: 48, textAlign: 'center', color: '#64748b' }}>
              <Loader2 size={24} className="animate-spin" style={{ margin: '0 auto 8px' }} />
              <p style={{ fontSize: 13 }}>Loading payslips...</p>
            </div>
          ) : payrolls.length === 0 ? (
            <div style={{ padding: 48, textAlign: 'center', color: '#64748b' }}>
              <FileText size={32} color="#cbd5e1" style={{ margin: '0 auto 8px' }} />
              <p style={{ fontSize: 14, fontWeight: 600, color: '#334155' }}>No payslips generated yet</p>
              <p style={{ fontSize: 12, color: '#94a3b8' }}>Your monthly salary slips will appear here once published by HR.</p>
            </div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
              <thead>
                <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#64748b', textAlign: 'left' }}>
                  <th style={{ padding: '12px 20px', fontWeight: 600 }}>Pay Period</th>
                  <th style={{ padding: '12px 20px', fontWeight: 600 }}>Working Days</th>
                  <th style={{ padding: '12px 20px', fontWeight: 600 }}>Present Days</th>
                  <th style={{ padding: '12px 20px', fontWeight: 600 }}>Gross Pay</th>
                  <th style={{ padding: '12px 20px', fontWeight: 600 }}>Deductions</th>
                  <th style={{ padding: '12px 20px', fontWeight: 600 }}>Net Take-Home</th>
                  <th style={{ padding: '12px 20px', fontWeight: 600 }}>Status</th>
                  <th style={{ padding: '12px 20px', fontWeight: 600, textAlign: 'center' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {payrolls.map((p) => (
                  <tr
                    key={p._id}
                    style={{ borderBottom: '1px solid #f1f5f9', transition: 'background 0.15s' }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = '#fafafa')}
                    onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                  >
                    <td style={{ padding: '14px 20px', fontWeight: 700, color: '#0f172a' }}>
                      {MONTHS[p.month - 1]} {p.year}
                    </td>
                    <td style={{ padding: '14px 20px', color: '#475569' }}>
                      {p.workingDays} Days
                    </td>
                    <td style={{ padding: '14px 20px', color: '#16a34a', fontWeight: 600 }}>
                      {p.presentDays} Days
                    </td>
                    <td style={{ padding: '14px 20px', color: '#334155' }}>
                      {formatCurrency(p.grossSalary)}
                    </td>
                    <td style={{ padding: '14px 20px', color: '#b91c1c' }}>
                      {formatCurrency((p.totalDeductions || 0) + (p.lopAmount || 0))}
                    </td>
                    <td style={{ padding: '14px 20px', fontWeight: 700, color: '#16a34a' }}>
                      {formatCurrency(p.netSalary)}
                    </td>
                    <td style={{ padding: '14px 20px' }}>
                      <span style={{
                        padding: '3px 9px', borderRadius: 8, fontSize: 11, fontWeight: 700, textTransform: 'capitalize',
                        background: p.status === 'paid' ? '#dcfce7' : '#dbeafe',
                        color: p.status === 'paid' ? '#15803d' : '#2563eb',
                      }}>
                        {p.status}
                      </span>
                    </td>
                    <td style={{ padding: '14px 20px', textAlign: 'center' }}>
                      <button
                        onClick={() => setSelectedPayslip(p)}
                        style={{
                          display: 'inline-flex', alignItems: 'center', gap: 5,
                          background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 8,
                          padding: '5px 10px', fontSize: 11.5, fontWeight: 600, color: '#334155',
                          cursor: 'pointer',
                        }}
                      >
                        <Eye size={13} color="#64748b" />
                        <span>View Payslip</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Executive Payslip Modal */}
      {selectedPayslip && (
        <div style={{
          position: 'fixed', inset: 0,
          background: 'rgba(15, 23, 42, 0.65)', backdropFilter: 'blur(5px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 1000, padding: 20,
        }}>
          <div style={{
            background: '#fff', borderRadius: 18, maxWidth: 640, width: '100%',
            padding: 32, boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
            maxHeight: '90vh', overflowY: 'auto', position: 'relative',
          }}>
            {/* Header with Print button & Close */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{
                  width: 40, height: 40, borderRadius: 10,
                  background: 'linear-gradient(135deg, #c0392b, #922b21)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: '#fff', fontWeight: 800, fontSize: 18,
                }}>
                  TZ
                </div>
                <div>
                  <h3 style={{ fontSize: 18, fontWeight: 800, color: '#0f172a', margin: 0 }}>TRAVELZYNC HRM</h3>
                  <p style={{ fontSize: 11, color: '#64748b', margin: 0 }}>Official Salary Slip / Pay Receipt</p>
                </div>
              </div>

              <div style={{ display: 'flex', gap: 8 }}>
                <button
                  onClick={handlePrint}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 5,
                    padding: '6px 12px', borderRadius: 8, border: '1px solid #e2e8f0',
                    background: '#f8fafc', color: '#334155', fontSize: 12, fontWeight: 600, cursor: 'pointer',
                  }}
                >
                  <Printer size={14} />
                  <span>Print</span>
                </button>

                <button
                  onClick={() => setSelectedPayslip(null)}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', padding: 4 }}
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* Employee metadata bar */}
            <div style={{
              background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 12,
              padding: '14px 18px', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)',
              gap: 12, fontSize: 12, marginBottom: 20,
            }}>
              <div>
                <span style={{ color: '#64748b', display: 'block', fontSize: 11 }}>Employee Name</span>
                <strong style={{ color: '#0f172a' }}>{user?.name || 'Employee'}</strong>
              </div>
              <div>
                <span style={{ color: '#64748b', display: 'block', fontSize: 11 }}>Employee ID</span>
                <strong style={{ color: '#0f172a' }}>{user?.employeeId || 'TZ-EMP-001'}</strong>
              </div>
              <div>
                <span style={{ color: '#64748b', display: 'block', fontSize: 11 }}>Pay Period</span>
                <strong style={{ color: '#c0392b' }}>{MONTHS[selectedPayslip.month - 1]} {selectedPayslip.year}</strong>
              </div>
              <div>
                <span style={{ color: '#64748b', display: 'block', fontSize: 11 }}>Working Days</span>
                <strong style={{ color: '#0f172a' }}>{selectedPayslip.workingDays} Days</strong>
              </div>
              <div>
                <span style={{ color: '#64748b', display: 'block', fontSize: 11 }}>Paid / Present Days</span>
                <strong style={{ color: '#16a34a' }}>{selectedPayslip.presentDays} Days</strong>
              </div>
              <div>
                <span style={{ color: '#64748b', display: 'block', fontSize: 11 }}>Payment Status</span>
                <strong style={{ color: selectedPayslip.status === 'paid' ? '#16a34a' : '#2563eb', textTransform: 'capitalize' }}>
                  {selectedPayslip.status}
                </strong>
              </div>
            </div>

            {/* Earnings vs Deductions 2-Column Table */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 20 }}>
              {/* Earnings */}
              <div style={{ border: '1px solid #e2e8f0', borderRadius: 10, overflow: 'hidden' }}>
                <div style={{ background: '#f0fdf4', padding: '10px 14px', borderBottom: '1px solid #e2e8f0', fontWeight: 700, color: '#166534', fontSize: 13 }}>
                  Earnings
                </div>
                <div style={{ padding: 14, display: 'flex', flexDirection: 'column', gap: 8, fontSize: 12.5 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#4b5563' }}>Basic Pay:</span>
                    <strong>{formatCurrency(selectedPayslip.salaryStructureId?.basicSalary)}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#4b5563' }}>House Rent Allowance (HRA):</span>
                    <strong>{formatCurrency(selectedPayslip.salaryStructureId?.hra)}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#4b5563' }}>Special Allowance:</span>
                    <strong>{formatCurrency(selectedPayslip.salaryStructureId?.specialAllowance)}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#4b5563' }}>Travel Allowance:</span>
                    <strong>{formatCurrency(selectedPayslip.salaryStructureId?.travelAllowance)}</strong>
                  </div>
                  <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: 8, display: 'flex', justifyContent: 'space-between', color: '#15803d', fontWeight: 700 }}>
                    <span>Gross Earnings:</span>
                    <span>{formatCurrency(selectedPayslip.grossSalary)}</span>
                  </div>
                </div>
              </div>

              {/* Deductions */}
              <div style={{ border: '1px solid #e2e8f0', borderRadius: 10, overflow: 'hidden' }}>
                <div style={{ background: '#fef2f2', padding: '10px 14px', borderBottom: '1px solid #e2e8f0', fontWeight: 700, color: '#991b1b', fontSize: 13 }}>
                  Deductions
                </div>
                <div style={{ padding: 14, display: 'flex', flexDirection: 'column', gap: 8, fontSize: 12.5 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#4b5563' }}>Provident Fund (PF):</span>
                    <strong>{formatCurrency(selectedPayslip.salaryStructureId?.providentFund)}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#4b5563' }}>Professional Tax (PT):</span>
                    <strong>{formatCurrency(selectedPayslip.salaryStructureId?.professionalTax)}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: '#dc2626' }}>
                    <span>Loss of Pay (LOP {selectedPayslip.lopDays || 0}d):</span>
                    <strong>{formatCurrency(selectedPayslip.lopAmount || 0)}</strong>
                  </div>
                  <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: 8, display: 'flex', justifyContent: 'space-between', color: '#b91c1c', fontWeight: 700 }}>
                    <span>Total Deductions:</span>
                    <span>{formatCurrency((selectedPayslip.totalDeductions || 0) + (selectedPayslip.lopAmount || 0))}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Net Pay Grand Box */}
            <div style={{
              background: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)',
              border: '1px solid #bbf7d0', borderRadius: 12, padding: '18px 24px',
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            }}>
              <div>
                <span style={{ fontSize: 12, color: '#166534', fontWeight: 600 }}>Total Net Salary Paid</span>
                <div style={{ fontSize: 26, fontWeight: 800, color: '#14532d' }}>
                  {formatCurrency(selectedPayslip.netSalary)}
                </div>
              </div>

              <div style={{ textAlign: 'right', fontSize: 11, color: '#166534' }}>
                <div>Computer Generated Payslip</div>
                <div style={{ fontWeight: 600 }}>No Physical Signature Required</div>
              </div>
            </div>

            <div style={{ marginTop: 22, textAlign: 'right' }}>
              <button
                type="button"
                onClick={() => setSelectedPayslip(null)}
                style={{ padding: '8px 20px', borderRadius: 8, border: '1px solid #e2e8f0', background: '#fff', fontSize: 13, color: '#64748b', cursor: 'pointer' }}
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
