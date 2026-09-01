import { useState } from 'react'
import { Wallet, Eye, CheckCircle2, Info, X, DollarSign, ArrowUpRight, HelpCircle, Landmark } from 'lucide-react'

const SALARY_HISTORY_DATA = [
  { id: 1, month: 'August', year: '2026', grossSalary: 23000, deductions: 200, netSalary: 22800, status: 'Paid', paidAt: '25 Aug 2026 06:00 PM', paymentRef: 'TXN-20260825-4819' },
  { id: 2, month: 'July', year: '2026', grossSalary: 23000, deductions: 200, netSalary: 22800, status: 'Paid', paidAt: '25 Jul 2026 05:00 PM', paymentRef: 'TXN-20260725-3912' },
  { id: 3, month: 'June', year: '2026', grossSalary: 23000, deductions: 200, netSalary: 22800, status: 'Paid', paidAt: '25 Jun 2026 04:30 PM', paymentRef: 'TXN-20260625-1823' },
  { id: 4, month: 'May', year: '2026', grossSalary: 23000, deductions: 200, netSalary: 22800, status: 'Paid', paidAt: '25 May 2026 06:12 PM', paymentRef: 'TXN-20260525-0841' },
  { id: 5, month: 'April', year: '2026', grossSalary: 23000, deductions: 200, netSalary: 22800, status: 'Paid', paidAt: '25 Apr 2026 05:45 PM', paymentRef: 'TXN-20260425-9923' }
]

const ALLOWANCES_LIST = [
  { label: 'HRA', value: 3500 },
  { label: 'Travel Allowance', value: 1500 }
]

const DEDUCTIONS_LIST = [
  { label: 'Professional Tax', value: 200 }
]

export default function Salary() {
  const [selectedRecord, setSelectedRecord] = useState(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  const handleOpenModal = (record) => {
    setSelectedRecord(record)
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20, width: '100%', paddingBottom: 24 }}>
      
      {/* Title & Breadcrumbs */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        <h1 style={{ fontSize: 24, fontWeight: 700, color: '#1e293b' }}>My Salary</h1>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#64748b' }}>
          <span>Home</span>
          <span>&gt;</span>
          <span style={{ color: '#c0392b', fontWeight: 500 }}>My Salary</span>
        </div>
      </div>

      {/* Current Month Net Salary Banner */}
      <div style={{
        background: '#fff',
        borderRadius: 16,
        border: '1px solid #f1f5f9',
        boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
        padding: '24px 28px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 20
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
          <div style={{
            width: 52,
            height: 52,
            borderRadius: '50%',
            background: '#fff5f5',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#c0392b',
            boxShadow: '0 2px 8px rgba(192, 57, 43, 0.08)'
          }} className="payroll-wallet-icon">
            <Wallet size={24} />
          </div>
          <div>
            <p style={{ fontSize: 11, color: '#64748b', fontWeight: 600, textTransform: 'uppercase', marginBottom: 6 }}>Current Month (August 2026) Net Salary</p>
            <h2 style={{ fontSize: 26, fontWeight: 800, color: '#c0392b', margin: 0, display: 'flex', alignItems: 'center', gap: 4 }} className="payroll-net-val">
              ₹22,800
            </h2>
          </div>
        </div>

        <div style={{ textAlign: 'right' }}>
          <span style={{
            background: '#e8f5e9',
            color: '#2e7d32',
            padding: '4px 12px',
            borderRadius: 6,
            fontSize: 11,
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            display: 'inline-flex',
            alignItems: 'center',
            gap: 4
          }}>
            <CheckCircle2 size={12} />
            Paid
          </span>
          <p style={{ fontSize: 11, color: '#94a3b8', marginTop: 6, marginBottom: 0 }}>
            Paid At: 25 Aug 2026, 06:00 PM
          </p>
        </div>
      </div>

      {/* Salary History Table Card */}
      <div style={{
        background: '#fff',
        borderRadius: 16,
        border: '1px solid #f1f5f9',
        boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
        padding: 24
      }}>
        <h3 style={{ fontSize: 15, fontWeight: 700, color: '#1e293b', marginBottom: 16, marginTop: 0, display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ width: 4, height: 16, background: '#c0392b', borderRadius: 2 }} />
          Salary History
        </h3>

        <div style={{ overflowX: 'auto' }} className="hide-scroll">
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13, textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #f1f5f9', color: '#64748b' }}>
                {['#', 'Month', 'Year', 'Gross Salary', 'Total Deductions', 'Net Salary', 'Status', 'Paid At', 'Action'].map((h, i) => (
                  <th key={i} style={{ padding: '12px 8px', fontWeight: 600, fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {SALARY_HISTORY_DATA.map((row, index) => (
                <tr key={row.id} style={{
                  borderBottom: '1px solid #f8fafc',
                  background: index % 2 === 1 ? '#fafafa' : '#fff'
                }}>
                  <td style={{ padding: '14px 8px', color: '#64748b' }}>{row.id}</td>
                  <td style={{ padding: '14px 8px', fontWeight: 600, color: '#1e293b' }}>{row.month}</td>
                  <td style={{ padding: '14px 8px', color: '#64748b' }}>{row.year}</td>
                  <td style={{ padding: '14px 8px', color: '#334155', fontWeight: 500 }}>₹{row.grossSalary.toLocaleString()}</td>
                  <td style={{ padding: '14px 8px', color: '#c0392b', fontWeight: 500 }}>₹{row.deductions.toLocaleString()}</td>
                  <td style={{ padding: '14px 8px', color: '#2e7d32', fontWeight: 700 }}>₹{row.netSalary.toLocaleString()}</td>
                  <td style={{ padding: '14px 8px' }}>
                    <span style={{
                      background: '#e8f5e9',
                      color: '#2e7d32',
                      padding: '2px 8px',
                      borderRadius: 4,
                      fontSize: 10,
                      fontWeight: 700,
                      textTransform: 'uppercase'
                    }}>{row.status}</span>
                  </td>
                  <td style={{ padding: '14px 8px', color: '#64748b', fontSize: 12 }}>{row.paidAt}</td>
                  <td style={{ padding: '14px 8px' }}>
                    <button
                      onClick={() => handleOpenModal(row)}
                      style={{
                        background: '#fff5f5',
                        border: '1px solid #fca5a5',
                        color: '#c0392b',
                        padding: '4px 8px',
                        borderRadius: 6,
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        outline: 'none',
                        transition: 'all 0.2s'
                      }}
                      title="View Details"
                    >
                      <Eye size={14} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Salary Structure Section */}
      <div style={{
        background: '#fff',
        borderRadius: 16,
        border: '1px solid #f1f5f9',
        boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
        padding: 24
      }}>
        <h3 style={{ fontSize: 15, fontWeight: 700, color: '#1e293b', marginBottom: 16, marginTop: 0, display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ width: 4, height: 16, background: '#c0392b', borderRadius: 2 }} />
          Salary Structure
        </h3>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: 20
        }}>
          {/* Allowances */}
          <div style={{ background: '#f8fafc', borderRadius: 12, padding: 18, border: '1px solid #e2e8f0' }} className="salary-allowances-box">
            <span style={{ fontSize: 12, fontWeight: 700, color: '#15803d', textTransform: 'uppercase', letterSpacing: '0.04em', display: 'block', marginBottom: 12 }}>Allowances</span>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {ALLOWANCES_LIST.map((allowance, index) => (
                <div key={index} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                  <span style={{ color: '#64748b' }}>{allowance.label}</span>
                  <span style={{ fontWeight: 600, color: '#1e293b' }}>₹{allowance.value.toLocaleString()}</span>
                </div>
              ))}
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, borderTop: '1px solid #e2e8f0', paddingTop: 8, marginTop: 4 }}>
                <span style={{ fontWeight: 700, color: '#15803d' }}>Total Allowances</span>
                <span style={{ fontWeight: 700, color: '#15803d' }}>₹5,000</span>
              </div>
            </div>
          </div>

          {/* Deductions */}
          <div style={{ background: '#fff5f5', borderRadius: 12, padding: 18, border: '1px solid #fde8e8' }} className="salary-deductions-box">
            <span style={{ fontSize: 12, fontWeight: 700, color: '#c0392b', textTransform: 'uppercase', letterSpacing: '0.04em', display: 'block', marginBottom: 12 }}>Deductions</span>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {DEDUCTIONS_LIST.map((deduction, index) => (
                <div key={index} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                  <span style={{ color: '#64748b' }}>{deduction.label}</span>
                  <span style={{ fontWeight: 600, color: '#1e293b' }}>₹{deduction.value.toLocaleString()}</span>
                </div>
              ))}
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, borderTop: '1px solid #fde8e8', paddingTop: 8, marginTop: 4 }}>
                <span style={{ fontWeight: 700, color: '#c0392b' }}>Total Deductions</span>
                <span style={{ fontWeight: 700, color: '#c0392b' }}>
                  ₹{DEDUCTIONS_LIST.reduce((acc, curr) => acc + curr.value, 0).toLocaleString()}
                </span>
              </div>
            </div>
          </div>

          {/* Key details */}
          <div style={{ background: '#fff', borderRadius: 12, padding: 18, border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', gap: 10 }} className="salary-details-box">
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, borderBottom: '1px solid #f1f5f9', paddingBottom: 6 }}>
              <span style={{ color: '#64748b' }}>Basic Salary</span>
              <span style={{ fontWeight: 700, color: '#1e293b' }}>₹18,000</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, borderBottom: '1px solid #f1f5f9', paddingBottom: 6 }}>
              <span style={{ color: '#64748b' }}>Effective From</span>
              <span style={{ fontWeight: 500, color: '#1e293b' }}>01 Aug 2026</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
              <span style={{ color: '#64748b' }}>Active</span>
              <span style={{
                background: '#e8f5e9',
                color: '#2e7d32',
                padding: '2px 8px',
                borderRadius: 4,
                fontSize: 11,
                fontWeight: 600
              }}>Yes</span>
            </div>
          </div>
        </div>
      </div>

      {/* Remarks Banner */}
      <div style={{
        background: '#eff6ff',
        border: '1px solid #dbeafe',
        borderRadius: 12,
        padding: '14px 18px',
        display: 'flex',
        alignItems: 'center',
        gap: 12
      }} className="salary-remarks-banner">
        <Info size={18} color="#3b82f6" style={{ flexShrink: 0 }} />
        <span style={{ fontSize: 13, color: '#1e40af' }}>
          This is your salary structure and history. For any queries, please contact HR.
        </span>
      </div>

      {/* Details Modal */}
      {isModalOpen && selectedRecord && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          background: 'rgba(15, 23, 42, 0.4)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999
        }}>
          <div style={{
            background: '#fff',
            borderRadius: 16,
            width: '90%',
            maxWidth: '480px',
            padding: 24,
            boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)',
            position: 'relative'
          }} className="salary-modal-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #f1f5f9', paddingBottom: 12, marginBottom: 16 }}>
              <h3 style={{ fontSize: 16, fontWeight: 700, color: '#1e293b', margin: 0 }}>
                Payout Breakdown - {selectedRecord.month} {selectedRecord.year}
              </h3>
              <button
                onClick={handleCloseModal}
                style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer' }}
              >
                <X size={18} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                <span style={{ color: '#64748b' }}>Reference ID</span>
                <span style={{ fontWeight: 600, color: '#1e293b' }}>{selectedRecord.paymentRef}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                <span style={{ color: '#64748b' }}>Payment Date</span>
                <span style={{ fontWeight: 500, color: '#1e293b' }}>{selectedRecord.paidAt}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                <span style={{ color: '#64748b' }}>Gross Earnings</span>
                <span style={{ fontWeight: 500, color: '#1e293b' }}>₹{selectedRecord.grossSalary.toLocaleString()}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                <span style={{ color: '#64748b' }}>Total Deductions</span>
                <span style={{ fontWeight: 500, color: '#c0392b' }}>₹{selectedRecord.deductions.toLocaleString()}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, borderTop: '1px solid #f1f5f9', paddingTop: 10, marginTop: 4 }}>
                <span style={{ fontWeight: 700, color: '#1e293b' }}>Net Salary Credited</span>
                <span style={{ fontWeight: 700, color: '#2e7d32', fontSize: 15 }}>₹{selectedRecord.netSalary.toLocaleString()}</span>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 20 }}>
              <button
                onClick={handleCloseModal}
                style={{
                  background: '#c0392b',
                  color: '#fff',
                  border: 'none',
                  borderRadius: 8,
                  padding: '8px 16px',
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
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
