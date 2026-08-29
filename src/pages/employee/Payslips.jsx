import { useState } from 'react'
import { Calendar, DollarSign, Clock, FileText, CheckCircle2, ChevronDown, Info, ShieldCheck, Download, CreditCard, Landmark } from 'lucide-react'

const JUNIOR_DEV_PAYROLL = {
  'August 2026': {
    month: 'August 2026',
    year: '2026',
    status: 'Paid',
    paidAt: '25 Aug 2026 06:00 PM',
    processedAt: '24 Aug 2026 04:30 PM',
    paymentRef: 'TXN-20260825-4819',
    remarks: 'Monthly salary credit',
    bankName: 'Canara Bank',
    accountNo: '•••• •••• 4810',
    
    // Salary Summary
    basicSalary: 18000,
    allowances: 5000, // HRA 3500 + Travel 1500
    grossSalary: 23000,
    deductions: 2000, // PF 1800 + PT 200
    netSalary: 21000,
    
    // Attendance Summary
    workingDays: 22,
    presentDays: 20,
    leaveDays: 1,
    absentDays: 1,
    paidDays: 21,
    lopDays: 1,
    lopAmount: 1000, // LOP deduction for absent day
    
    // Salary Structure
    structure: {
      basic: 18000,
      hra: 3500,
      travel: 1500,
      profTax: 200,
      provFund: 1800,
      effectiveFrom: '01 Aug 2026',
      active: 'Yes'
    }
  },
  'July 2026': {
    month: 'July 2026',
    year: '2026',
    status: 'Paid',
    paidAt: '25 Jul 2026 05:00 PM',
    processedAt: '24 Jul 2026 03:15 PM',
    paymentRef: 'TXN-20260725-3912',
    remarks: 'Monthly salary credit',
    bankName: 'Canara Bank',
    accountNo: '•••• •••• 4810',
    
    // Salary Summary
    basicSalary: 18000,
    allowances: 5000,
    grossSalary: 23000,
    deductions: 2000,
    netSalary: 21000,
    
    // Attendance Summary
    workingDays: 23,
    presentDays: 23,
    leaveDays: 0,
    absentDays: 0,
    paidDays: 23,
    lopDays: 0,
    lopAmount: 0,
    
    // Salary Structure
    structure: {
      basic: 18000,
      hra: 3500,
      travel: 1500,
      profTax: 200,
      provFund: 1800,
      effectiveFrom: '01 Jul 2026',
      active: 'Yes'
    }
  }
}

export default function Payslips() {
  const [selectedMonth, setSelectedMonth] = useState('August 2026')
  const [downloading, setDownloading] = useState(false)
  const currentData = JUNIOR_DEV_PAYROLL[selectedMonth]

  const handleDownload = () => {
    setDownloading(true)
    setTimeout(() => {
      setDownloading(false)
      alert(`Payslip PDF for ${selectedMonth} downloaded successfully.`)
    }, 1500)
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20, width: '100%', paddingBottom: 24 }}>
      {/* Month Selector & Status Header Card */}
      <div style={{
        background: '#fff',
        borderRadius: 16,
        border: '1px solid #f1f5f9',
        boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
        padding: '20px 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 16
      }}>
        {/* Left Side: Selector */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{
            width: 44,
            height: 44,
            borderRadius: 10,
            background: '#fff5f5',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#c0392b'
          }}>
            <Calendar size={22} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <label style={{ fontSize: 11, color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>Select Pay Period</label>
            <div style={{ position: 'relative', display: 'inline-block' }}>
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                style={{
                  padding: '6px 36px 6px 12px',
                  borderRadius: 8,
                  border: '1px solid #c0392b',
                  background: '#fff',
                  fontSize: 14,
                  fontWeight: 600,
                  color: '#1e293b',
                  outline: 'none',
                  cursor: 'pointer',
                  appearance: 'none'
                }}
              >
                <option value="August 2026">August 2026</option>
                <option value="July 2026">July 2026</option>
              </select>
              <ChevronDown size={14} color="#c0392b" style={{ position: 'absolute', right: 12, top: 10, pointerEvents: 'none' }} />
            </div>
          </div>
        </div>

        {/* Right Side: Status Badge & Download Action */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
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
              {currentData.status}
            </span>
            <p style={{ fontSize: 11, color: '#94a3b8', marginTop: 6, marginBottom: 0 }}>
              Paid At: {currentData.paidAt}
            </p>
          </div>
          <button
            onClick={handleDownload}
            disabled={downloading}
            style={{
              background: '#c0392b',
              color: '#fff',
              border: 'none',
              borderRadius: 8,
              padding: '10px 18px',
              fontSize: 13,
              fontWeight: 600,
              cursor: downloading ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              opacity: downloading ? 0.7 : 1,
              boxShadow: '0 2px 4px rgba(192,57,43,0.1)',
              transition: 'all 0.2s'
            }}
          >
            {downloading ? (
              <>
                <span className="animate-spin" style={{ display: 'inline-block', width: 14, height: 14, border: '2px solid #fff', borderTopColor: 'transparent', borderRadius: '50%' }} />
                Generating...
              </>
            ) : (
              <>
                <Download size={15} /> Download Payslip
              </>
            )}
          </button>
        </div>
      </div>

      {/* Salary Summary Card */}
      <div style={{
        background: '#fff',
        borderRadius: 16,
        border: '1px solid #f1f5f9',
        boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
        padding: 24
      }}>
        <h3 style={{ fontSize: 15, fontWeight: 700, color: '#1e293b', marginBottom: 16, marginTop: 0, display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ width: 4, height: 16, background: '#c0392b', borderRadius: 2 }} />
          Salary Summary
        </h3>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
          gap: 16
        }}>
          {[
            { label: 'Basic Salary', val: `₹${currentData.basicSalary.toLocaleString()}`, color: '#1e293b' },
            { label: 'Total Allowances', val: `₹${currentData.allowances.toLocaleString()}`, color: '#2e7d32' },
            { label: 'Gross Salary', val: `₹${currentData.grossSalary.toLocaleString()}`, color: '#1e293b' },
            { label: 'Total Deductions', val: `₹${currentData.deductions.toLocaleString()}`, color: '#c0392b' },
            { label: 'Net Take-home', val: `₹${currentData.netSalary.toLocaleString()}`, color: '#2e7d32', bg: '#f1f8e9', border: '1px solid #d4e157' }
          ].map((item, index) => (
            <div
              key={index}
              style={{
                padding: '16px 20px',
                borderRadius: 12,
                border: item.border || '1px solid #f1f5f9',
                background: item.bg || '#f8fafc',
                display: 'flex',
                flexDirection: 'column',
                gap: 6
              }}
            >
              <span style={{ fontSize: 11, fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}>{item.label}</span>
              <span style={{ fontSize: 20, fontWeight: 700, color: item.color }}>{item.val}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Attendance Summary Card */}
      <div style={{
        background: '#fff',
        borderRadius: 16,
        border: '1px solid #f1f5f9',
        boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
        padding: 24
      }}>
        <h3 style={{ fontSize: 15, fontWeight: 700, color: '#1e293b', marginBottom: 16, marginTop: 0, display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ width: 4, height: 16, background: '#c0392b', borderRadius: 2 }} />
          Attendance & LOP Summary
        </h3>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(110px, 1fr))',
          gap: 12
        }}>
          {[
            { label: 'Working Days', val: currentData.workingDays },
            { label: 'Present Days', val: currentData.presentDays },
            { label: 'Leave Days', val: currentData.leaveDays },
            { label: 'Absent Days', val: currentData.absentDays },
            { label: 'Paid Days', val: currentData.paidDays },
            { label: 'LOP Days', val: currentData.lopDays, color: currentData.lopDays > 0 ? '#c0392b' : '#334155' },
            { label: 'LOP Amount', val: `₹${currentData.lopAmount.toLocaleString()}`, color: currentData.lopAmount > 0 ? '#c0392b' : '#334155' }
          ].map((item, index) => (
            <div
              key={index}
              style={{
                padding: '12px 14px',
                borderRadius: 10,
                border: '1px solid #f1f5f9',
                textAlign: 'center',
                background: '#fff'
              }}
            >
              <span style={{ fontSize: 10, fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', display: 'block', marginBottom: 4 }}>{item.label}</span>
              <span style={{ fontSize: 16, fontWeight: 700, color: item.color || '#334155' }}>{item.val}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Two Column Layout: Transaction & Salary Structure */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
        gap: 20
      }}>
        {/* Column 1: Payroll Details */}
        <div style={{
          background: '#fff',
          borderRadius: 16,
          border: '1px solid #f1f5f9',
          boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
          padding: 24,
          display: 'flex',
          flexDirection: 'column',
          gap: 16
        }}>
          <h3 style={{ fontSize: 15, fontWeight: 700, color: '#1e293b', margin: 0, paddingBottom: 12, borderBottom: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ width: 4, height: 16, background: '#c0392b', borderRadius: 2 }} />
            Transaction Details
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {[
              { label: 'Payment Status', val: currentData.status, isBadge: true },
              { label: 'Bank Name', val: currentData.bankName, icon: Landmark },
              { label: 'Bank Account', val: currentData.accountNo, icon: CreditCard },
              { label: 'Processed At', val: currentData.processedAt },
              { label: 'Paid At', val: currentData.paidAt },
              { label: 'Payment Reference', val: currentData.paymentRef },
              { label: 'Remarks', val: currentData.remarks }
            ].map((row, index) => (
              <div key={index} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 13, borderBottom: '1px solid #fafafa', paddingBottom: 8 }}>
                <span style={{ color: '#64748b', display: 'flex', alignItems: 'center', gap: 6 }}>
                  {row.icon && <row.icon size={13} color="#94a3b8" />}
                  {row.label}
                </span>
                {row.isBadge ? (
                  <span style={{
                    background: '#e8f5e9',
                    color: '#2e7d32',
                    padding: '2px 8px',
                    borderRadius: 4,
                    fontSize: 11,
                    fontWeight: 600
                  }}>{row.val}</span>
                ) : (
                  <span style={{ fontWeight: 500, color: '#1e293b' }}>{row.val}</span>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Column 2: Salary Structure */}
        <div style={{
          background: '#fff',
          borderRadius: 16,
          border: '1px solid #f1f5f9',
          boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
          padding: 24,
          display: 'flex',
          flexDirection: 'column',
          gap: 16
        }}>
          <h3 style={{ fontSize: 15, fontWeight: 700, color: '#1e293b', margin: 0, paddingBottom: 12, borderBottom: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ width: 4, height: 16, background: '#c0392b', borderRadius: 2 }} />
            Allowances & Structure
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, paddingBottom: 4 }}>
              <span style={{ color: '#64748b' }}>Basic Salary</span>
              <span style={{ fontWeight: 600, color: '#1e293b' }}>₹{currentData.structure.basic.toLocaleString()}</span>
            </div>
            
            {/* Allowances Subheading */}
            <div style={{ fontSize: 11, fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', marginTop: 4 }}>Allowances</div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, paddingLeft: 10 }}>
              <span style={{ color: '#64748b' }}>House Rent Allowance (HRA)</span>
              <span style={{ fontWeight: 500, color: '#1e293b' }}>₹{currentData.structure.hra.toLocaleString()}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, paddingLeft: 10 }}>
              <span style={{ color: '#64748b' }}>Travel Allowance</span>
              <span style={{ fontWeight: 500, color: '#1e293b' }}>₹{currentData.structure.travel.toLocaleString()}</span>
            </div>

            {/* Deductions Subheading */}
            <div style={{ fontSize: 11, fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', marginTop: 4 }}>Deductions</div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, paddingLeft: 10 }}>
              <span style={{ color: '#64748b' }}>Professional Tax (PT)</span>
              <span style={{ fontWeight: 500, color: '#c0392b' }}>₹{currentData.structure.profTax}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, paddingLeft: 10 }}>
              <span style={{ color: '#64748b' }}>Provident Fund (PF)</span>
              <span style={{ fontWeight: 500, color: '#c0392b' }}>₹{currentData.structure.provFund.toLocaleString()}</span>
            </div>

            <div style={{ borderTop: '1px solid #f1f5f9', marginTop: 8, paddingTop: 10, display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
              <span style={{ color: '#64748b' }}>Effective Date</span>
              <span style={{ fontWeight: 500, color: '#1e293b' }}>{currentData.structure.effectiveFrom}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
              <span style={{ color: '#64748b' }}>Active Status</span>
              <span style={{
                background: '#e8f5e9',
                color: '#2e7d32',
                padding: '1px 6px',
                borderRadius: 4,
                fontSize: 11,
                fontWeight: 600
              }}>{currentData.structure.active}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Note Banner */}
      <div style={{
        background: '#eff6ff',
        border: '1px solid #dbeafe',
        borderRadius: 12,
        padding: '14px 18px',
        display: 'flex',
        alignItems: 'center',
        gap: 12
      }}>
        <Info size={18} color="#3b82f6" style={{ flexShrink: 0 }} />
        <span style={{ fontSize: 13, color: '#1e40af' }}>
          This payroll summary and allowance breakdown is for the month of <strong>{selectedMonth}</strong>.
        </span>
      </div>
    </div>
  )
}
