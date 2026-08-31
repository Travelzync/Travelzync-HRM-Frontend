import { useState } from 'react'
import { User, Mail, Phone, Calendar, MapPin, Briefcase, ShieldCheck, Edit, Save, X } from 'lucide-react'

export default function Profile() {
  const [isEditing, setIsEditing] = useState(false)

  // Profile data states
  const [profileData, setProfileData] = useState({
    fullName: 'Ashfak Nasar',
    employeeId: 'TZ-2458',
    email: 'ashfak.nasar@travelzync.com',
    phone: '8078566945',
    dob: '16 Apr 2004',
    gender: 'Male',
    department: 'Engineering',
    designation: 'Junior Frontend Developer',
    joiningDate: '01 Aug 2026',
    employmentType: 'Full Time',
    workLocation: 'Calicut, Kerala',
    reportingManager: 'Aswin',
    role: 'Employee',
    status: 'Active',
    accountCreated: '01 Aug 2026'
  })

  // Temp form state for editing
  const [tempData, setTempData] = useState({ ...profileData })

  const handleEditClick = () => {
    setTempData({ ...profileData })
    setIsEditing(true)
  }

  const handleCancelClick = () => {
    setIsEditing(false)
  }

  const handleSaveClick = (e) => {
    e.preventDefault()
    setProfileData({ ...tempData })
    setIsEditing(false)
  }

  const handleChange = (field, val) => {
    setTempData(prev => ({
      ...prev,
      [field]: val
    }))
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20, width: '100%', paddingBottom: 24 }}>
      {/* Title & Breadcrumbs */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        <h1 style={{ fontSize: 24, fontWeight: 700, color: '#1e293b' }}>My Profile</h1>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#64748b' }}>
          <span>Home</span>
          <span>&gt;</span>
          <span style={{ color: '#c0392b', fontWeight: 500 }}>My Profile</span>
        </div>
      </div>

      {/* Main Profile Header Card (Horizontal Card) */}
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
        <div style={{ display: 'flex', alignItems: 'center', gap: 20, flexWrap: 'wrap' }}>
          {/* Avatar Area */}
          <div style={{ position: 'relative' }}>
            <div style={{
              width: 90,
              height: 90,
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #c0392b 0%, #922b21 100%)',
              border: '4px solid #fff5f5',
              boxShadow: '0 4px 10px rgba(192, 57, 43, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 32,
              fontWeight: 700,
              color: '#fff'
            }}>
              AN
            </div>
            <div style={{
              position: 'absolute',
              bottom: 0,
              right: 0,
              background: '#c0392b',
              color: '#fff',
              width: 28,
              height: 28,
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '2px solid #fff',
              cursor: 'pointer',
              boxShadow: '0 2px 5px rgba(0,0,0,0.1)'
            }} title="Change Photo">
              <span style={{ fontSize: 14 }}>📷</span>
            </div>
          </div>

          {/* Name & Quick Info */}
          <div>
            <h2 style={{ fontSize: 22, fontWeight: 700, color: '#1e293b', margin: 0 }}>
              {profileData.fullName}
            </h2>
            <p style={{ fontSize: 14, color: '#64748b', marginTop: 4, marginBottom: 10 }}>
              {profileData.designation}
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
              <span style={{
                background: '#fef2f2',
                color: '#c0392b',
                padding: '4px 10px',
                borderRadius: 6,
                fontSize: 12,
                fontWeight: 600
              }}>
                {profileData.employeeId}
              </span>
              <span style={{
                background: '#f0fdf4',
                color: '#15803d',
                padding: '4px 10px',
                borderRadius: 6,
                fontSize: 12,
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: 4
              }}>
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#22c55e' }} />
                {profileData.status}
              </span>
            </div>
          </div>
        </div>

        {/* Edit Button */}
        <div>
          {!isEditing ? (
            <button
              onClick={handleEditClick}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                padding: '10px 20px',
                border: '1px solid #c0392b',
                borderRadius: 8,
                background: '#fff',
                color: '#c0392b',
                fontSize: 13,
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.2s',
                outline: 'none'
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.background = '#fff5f5'
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.background = '#fff'
              }}
            >
              <Edit size={14} /> Edit Profile
            </button>
          ) : (
            <div style={{ display: 'flex', gap: 10 }}>
              <button
                onClick={handleCancelClick}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  padding: '10px 16px',
                  border: '1px solid #cbd5e1',
                  borderRadius: 8,
                  background: '#fff',
                  color: '#64748b',
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: 'pointer',
                  outline: 'none'
                }}
              >
                <X size={14} /> Cancel
              </button>
              <button
                onClick={handleSaveClick}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  padding: '10px 18px',
                  border: 'none',
                  borderRadius: 8,
                  background: '#c0392b',
                  color: '#fff',
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: 'pointer',
                  outline: 'none'
                }}
              >
                <Save size={14} /> Save
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Two Column Layout: Personal & Work Info */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
        gap: 20
      }}>
        {/* Card 1: Personal Information */}
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
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            borderBottom: '1px solid #f1f5f9',
            paddingBottom: 12,
            marginBottom: 4
          }}>
            <User size={18} color="#c0392b" />
            <h3 style={{ fontSize: 16, fontWeight: 700, color: '#1e293b', margin: 0 }}>
              Personal Information
            </h3>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {/* Rows with thin horizontal border style */}
            {[
              {
                label: 'Full Name',
                field: 'fullName',
                val: profileData.fullName,
                editable: true
              },
              {
                label: 'Employee ID',
                val: profileData.employeeId,
                editable: false
              },
              {
                label: 'Email',
                field: 'email',
                val: profileData.email,
                editable: true,
                icon: Mail
              },
              {
                label: 'Phone',
                field: 'phone',
                val: profileData.phone,
                editable: true,
                icon: Phone
              },
              {
                label: 'Date of Birth',
                field: 'dob',
                val: profileData.dob,
                editable: true,
                icon: Calendar
              },
              {
                label: 'Gender',
                field: 'gender',
                val: profileData.gender,
                editable: true,
                isGender: true
              }
            ].map((row, idx) => (
              <div key={idx} style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                fontSize: 13,
                borderBottom: '1px solid #fafafa',
                paddingBottom: 8
              }}>
                <span style={{ color: '#64748b', display: 'flex', alignItems: 'center', gap: 6 }}>
                  {row.icon && <row.icon size={13} color="#94a3b8" />}
                  {row.label}
                </span>

                {isEditing && row.editable ? (
                  row.isGender ? (
                    <div style={{ display: 'flex', gap: 12 }}>
                      <label style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 13, cursor: 'pointer' }}>
                        <input
                          type="radio"
                          name="gender"
                          value="Male"
                          checked={tempData.gender === 'Male'}
                          onChange={(e) => handleChange('gender', e.target.value)}
                          style={{ accentColor: '#c0392b' }}
                        />
                        Male
                      </label>
                      <label style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 13, cursor: 'pointer' }}>
                        <input
                          type="radio"
                          name="gender"
                          value="Female"
                          checked={tempData.gender === 'Female'}
                          onChange={(e) => handleChange('gender', e.target.value)}
                          style={{ accentColor: '#c0392b' }}
                        />
                        Female
                      </label>
                    </div>
                  ) : (
                    <input
                      type="text"
                      value={tempData[row.field]}
                      onChange={(e) => handleChange(row.field, e.target.value)}
                      style={{
                        padding: '4px 8px',
                        borderRadius: 6,
                        border: '1px solid #cbd5e1',
                        fontSize: 13,
                        outline: 'none',
                        color: '#1e293b',
                        textAlign: 'right'
                      }}
                    />
                  )
                ) : (
                  <span style={{ fontWeight: 500, color: '#1e293b' }}>{row.val}</span>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Card 2: Work Information */}
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
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            borderBottom: '1px solid #f1f5f9',
            paddingBottom: 12,
            marginBottom: 4
          }}>
            <Briefcase size={18} color="#c0392b" />
            <h3 style={{ fontSize: 16, fontWeight: 700, color: '#1e293b', margin: 0 }}>
              Work Information
            </h3>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {[
              { label: 'Department', val: profileData.department },
              { label: 'Designation', val: profileData.designation },
              { label: 'Joining Date', val: profileData.joiningDate },
              { label: 'Employment Type', val: profileData.employmentType },
              { label: 'Work Location', val: profileData.workLocation, icon: MapPin },
              { label: 'Reporting Manager', val: profileData.reportingManager }
            ].map((row, idx) => (
              <div key={idx} style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                fontSize: 13,
                borderBottom: '1px solid #fafafa',
                paddingBottom: 8
              }}>
                <span style={{ color: '#64748b', display: 'flex', alignItems: 'center', gap: 6 }}>
                  {row.icon && <row.icon size={13} color="#94a3b8" />}
                  {row.label}
                </span>
                <span style={{ fontWeight: 500, color: '#1e293b' }}>{row.val}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Card 3: Account Information (Full Width) */}
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
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          borderBottom: '1px solid #f1f5f9',
          paddingBottom: 12,
          marginBottom: 4
        }}>
          <ShieldCheck size={18} color="#c0392b" />
          <h3 style={{ fontSize: 16, fontWeight: 700, color: '#1e293b', margin: 0 }}>
            Account Information
          </h3>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
          {/* Role */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <span style={{ fontSize: 12, color: '#64748b', fontWeight: 600 }}>Role</span>
            <span style={{ fontSize: 14, fontWeight: 500, color: '#1e293b' }}>{profileData.role}</span>
          </div>

          {/* Account Status */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <span style={{ fontSize: 12, color: '#64748b', fontWeight: 600 }}>Account Status</span>
            <div>
              <span style={{
                background: '#f0fdf4',
                color: '#15803d',
                padding: '3px 10px',
                borderRadius: 6,
                fontSize: 12,
                fontWeight: 600
              }}>
                {profileData.status}
              </span>
            </div>
          </div>

          {/* Account Created On */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <span style={{ fontSize: 12, color: '#64748b', fontWeight: 600 }}>Account Created On</span>
            <span style={{ fontSize: 14, fontWeight: 500, color: '#1e293b' }}>{profileData.accountCreated}</span>
          </div>
        </div>
      </div>
    </div>
  )
}
