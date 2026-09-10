import { useState, useEffect } from 'react'
import {
  Package, Laptop, Smartphone, HardDrive, Cpu, ShieldCheck,
  Calendar, CheckCircle2, AlertCircle, Info, Loader2, Wrench
} from 'lucide-react'
import { getMyAssets } from '../../services/assetService'
import { getCurrentUser } from '../../services/authService'
import { showError } from '../../utils/toast'

export default function Assets() {
  const [assets, setAssets] = useState([])
  const [loading, setLoading] = useState(true)
  const user = getCurrentUser()

  useEffect(() => {
    const fetchAssets = async () => {
      try {
        setLoading(true)
        const res = await getMyAssets()
        if (res?.assets) setAssets(res.assets)
      } catch (err) {
        showError(err.response?.data?.message || 'Failed to load assigned assets')
      } finally {
        setLoading(false)
      }
    }
    fetchAssets()
  }, [])

  const formatDate = (d) => {
    if (!d) return '-'
    return new Date(d).toLocaleDateString(undefined, { day: '2-digit', month: 'short', year: 'numeric' })
  }

  const getCategoryIcon = (cat) => {
    switch (cat) {
      case 'laptop':
      case 'desktop':
        return <Laptop size={22} color="#c0392b" />
      case 'mobile':
      case 'sim_card':
        return <Smartphone size={22} color="#c0392b" />
      case 'accessory':
        return <HardDrive size={22} color="#16a34a" />
      default:
        return <Package size={22} color="#d97706" />
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
          <h2 style={{ fontSize: 22, fontWeight: 700, margin: 0 }}>My Company Assets</h2>
          <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.85)', margin: '4px 0 0 0' }}>
            View official company hardware and accessories issued to your custody.
          </p>
        </div>

        <div style={{
          background: 'rgba(255, 255, 255, 0.15)', borderRadius: 12,
          padding: '10px 18px', display: 'flex', alignItems: 'center', gap: 14,
        }}>
          <div>
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.8)' }}>Assigned Assets</div>
            <div style={{ fontSize: 20, fontWeight: 800 }}>{assets.length} Devices</div>
          </div>
          <div style={{ width: 1, height: 28, background: 'rgba(255,255,255,0.2)' }} />
          <div>
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.8)' }}>Custody Status</div>
            <div style={{ fontSize: 13, fontWeight: 700, color: '#86efac' }}>Active & Verified ✓</div>
          </div>
        </div>
      </div>

      {/* Asset Grid & List */}
      {loading ? (
        <div style={{ padding: 60, textAlign: 'center', color: '#64748b' }}>
          <Loader2 size={26} className="animate-spin" style={{ margin: '0 auto 10px' }} />
          <p style={{ fontSize: 13 }}>Loading assigned devices...</p>
        </div>
      ) : assets.length === 0 ? (
        <div style={{
          background: '#fff', borderRadius: 16, border: '1px solid #e2e8f0',
          padding: 48, textAlign: 'center', color: '#64748b',
        }}>
          <Package size={36} color="#cbd5e1" style={{ margin: '0 auto 12px' }} />
          <h3 style={{ fontSize: 16, fontWeight: 700, color: '#0f172a', margin: '0 0 6px 0' }}>
            No Assets Currently Assigned
          </h3>
          <p style={{ fontSize: 13, color: '#94a3b8', margin: 0, maxWidth: 400, marginLeft: 'auto', marginRight: 'auto' }}>
            You do not currently have any company equipment or SIM cards assigned. Contact your IT administrator or HR if you require hardware.
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Card Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 16 }}>
            {assets.map((item) => (
              <div
                key={item._id}
                style={{
                  background: '#fff', borderRadius: 14, border: '1px solid #e2e8f0',
                  padding: 20, boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
                  display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
                  transition: 'all 0.15s ease',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.borderColor = '#cbd5e1')}
                onMouseLeave={(e) => (e.currentTarget.style.borderColor = '#e2e8f0')}
              >
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{
                        width: 42, height: 42, borderRadius: 10,
                        background: '#f8fafc', border: '1px solid #f1f5f9',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                      }}>
                        {getCategoryIcon(item.category)}
                      </div>
                      <div>
                        <h4 style={{ fontSize: 15, fontWeight: 700, color: '#0f172a', margin: 0 }}>{item.name}</h4>
                        <span style={{ fontSize: 11, color: '#64748b' }}>{item.brand || 'Standard'} {item.modelNumber ? `• ${item.modelNumber}` : ''}</span>
                      </div>
                    </div>

                    <span style={{
                      padding: '2px 8px', borderRadius: 8, fontSize: 11, fontWeight: 600,
                      background: item.condition === 'new' || item.condition === 'good' ? '#dcfce7' : '#fef3c7',
                      color: item.condition === 'new' || item.condition === 'good' ? '#15803d' : '#b45309',
                      textTransform: 'capitalize',
                    }}>
                      {item.condition}
                    </span>
                  </div>

                  <div style={{
                    background: '#f8fafc', borderRadius: 10, padding: '12px 14px',
                    display: 'flex', flexDirection: 'column', gap: 6, fontSize: 12,
                    marginBottom: 14,
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: '#64748b' }}>Asset Code:</span>
                      <strong style={{ color: '#0f172a', fontFamily: 'monospace' }}>{item.assetCode}</strong>
                    </div>
                    {item.serialNumber && (
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: '#64748b' }}>Serial Number:</span>
                        <strong style={{ color: '#0f172a', fontFamily: 'monospace' }}>{item.serialNumber}</strong>
                      </div>
                    )}
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: '#64748b' }}>Handover Date:</span>
                      <span style={{ color: '#334155' }}>{formatDate(item.assignedDate)}</span>
                    </div>
                    {item.warrantyExpires && (
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: '#64748b' }}>Warranty Until:</span>
                        <span style={{ color: '#334155' }}>{formatDate(item.warrantyExpires)}</span>
                      </div>
                    )}
                  </div>

                  {item.notes && (
                    <p style={{ fontSize: 12, color: '#64748b', margin: '0 0 12px 0', fontStyle: 'italic' }}>
                      "{item.notes}"
                    </p>
                  )}
                </div>

                <div style={{
                  paddingTop: 12, borderTop: '1px solid #f1f5f9',
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                }}>
                  <span style={{
                    display: 'inline-flex', alignItems: 'center', gap: 5,
                    fontSize: 11, color: '#16a34a', fontWeight: 600,
                  }}>
                    <ShieldCheck size={14} /> Assigned in Custody
                  </span>

                  <span style={{ fontSize: 11, color: '#94a3b8' }}>TravelZync Asset</span>
                </div>
              </div>
            ))}
          </div>

          {/* Help notice */}
          <div style={{
            background: '#fff', borderRadius: 14, border: '1px solid #e2e8f0',
            padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 14,
          }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: '#fef2f2', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#c0392b' }}>
              <Info size={18} />
            </div>
            <div style={{ flex: 1 }}>
              <h5 style={{ fontSize: 13, fontWeight: 700, color: '#0f172a', margin: '0 0 2px 0' }}>
                Need hardware maintenance or equipment handover?
              </h5>
              <p style={{ fontSize: 12, color: '#64748b', margin: 0 }}>
                If you experience device issues or need to upgrade/return assets, please reach out to the IT Helpdesk or your department manager.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
