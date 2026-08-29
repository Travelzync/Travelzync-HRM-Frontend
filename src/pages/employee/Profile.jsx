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
      {/* Main Responsive Grid Layout */}
      <div style={{ display: 'flex', gap: 20, alignItems: 'flex-start' }} className="responsive-layout-container">
        
        {/* Left Column: Summary Card */}
        <div style={{ width: 280, flexShrink: 0, display: 'flex', flexDirection: 'column', gap: 16 }} className="responsive-right-column">
          
          <div style={{
            background: '#fff',
            borderRadius: 16,
            border: '1px solid #f1f5f9',
            boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column'
          }}>
            {/* Header Accent */}
            <div style={{
              height: 70,
              background: 'linear-gradient(135deg, #c0392b 0%, #922b21 100%)'
            }} />

            {/* Profile Header Contents */}
            <div style={{
              padding: '0 20px 24px 20px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              textAlign: 'center',
              marginTop: -45
            }}>
              {/* Avatar */}
              <div style={{ position: 'relative', marginBottom: 12 }}>
                <div style={{
                  width: 90,
                  height: 90,
                  borderRadius: '50%',
                  background: '#fff',
                  padding: 4,
                  boxShadow: '0 4px 6px rgba(0,0,0,0.05)'
                }}>
                  <div style={{
                    width: '100%',
                    height: '100%',
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #c0392b 0%, #7b241c 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 28,
                    fontWeight: 700,
                    color: '#fff'
                  }}>
                    AN
                  </div>
                </div>
                <div style={{
                  position: 'absolute',
                  bottom: 2,
                  right: 2,
                  background: '#c0392b',
                  color: '#fff',
                  width: 26,
                  height: 26,
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: '2px solid #fff',
                  cursor: 'pointer',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                }} title="Upload Photo">
                  <span style={{ fontSize: 12 }}>📷</span>
                </div>
              </div>

              {/* Name & Title */}
              <h2 style={{ fontSize: 18, fontWeight: 700, color: '#1e293b', margin: 0 }}>
                {profileData.fullName}
              </h2>
              <p style={{ fontSize: 13, color: '#64748b', marginTop: 4, marginBottom: 14 }}>
                {profileData.designation}
              </p>

              {/* Badges */}
              <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
                <span style={{
                  background: '#fef2f2',
                  color: '#c0392b',
                  padding: '3px 8px',
                  borderRadius: 6,
                  fontSize: 11,
                  fontWeight: 600
                }}>
                  {profileData.employeeId}
                </span>
                <span style={{
                  background: '#f0fdf4',
                  color: '#15803d',
                  padding: '3px 8px',
                  borderRadius: 6,
                  fontSize: 11,
                  fontWeight: 600,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 3
                }}>
                  <span style={{ width: 5, height: 5, borderRadius: '50%', background: '#22c55e' }} />
                  {profileData.status}
                </span>
              </div>

              {/* Edit Buttons */}
              <div style={{ width: '100%', borderTop: '1px solid #f1f5f9', paddingTop: 16 }}>
                {!isEditing ? (
                  <button
                    type="button"
                    onClick={handleEditClick}
                    style={{
                      width: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 8,
                      padding: '9px 16px',
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
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button
                      type="button"
                      onClick={handleCancelClick}
                      style={{
                        flex: 1,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 4,
                        padding: '9px 12px',
                        border: '1px solid #cbd5e1',
                        borderRadius: 8,
                        background: '#fff',
                        color: '#64748b',
                        fontSize: 12,
                        fontWeight: 600,
                        cursor: 'pointer',
                        outline: 'none'
                      }}
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={handleSaveClick}
                      style={{
                        flex: 1,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 4,
                        padding: '9px 12px',
                        border: 'none',
                        borderRadius: 8,
                        background: '#c0392b',
                        color: '#fff',
                        fontSize: 12,
                        fontWeight: 600,
                        cursor: 'pointer',
                        outline: 'none'
                      }}
                    >
                      Save
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Profile details info cards */}
        <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 16 }}>
          
          {/* Card 1: Personal Details */}
          <div style={{
            background: '#fff',
            borderRadius: 16,
            border: '1px solid #f1f5f9',
            boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
            padding: 24
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              borderBottom: '1px solid #f1f5f9',
              paddingBottom: 14,
              marginBottom: 16
            }}>
              <User size={18} color="#c0392b" />
              <h3 style={{ fontSize: 16, fontWeight: 700, color: '#1e293b', margin: 0 }}>
                Personal Information
              </h3>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16 }}>
              {/* Full Name */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                <span style={{ fontSize: 11, fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase' }}>Full Name</span>
                {isEditing ? (
                  <input
                    type="text"
                    value={tempData.fullName}
                    onChange={(e) => handleChange('fullName', e.target.value)}
                    style={{
                      padding: '6px 10px',
                      borderRadius: 6,
                      border: '1px solid #cbd5e1',
                      fontSize: 13,
                      outline: 'none',
                      color: '#1e293b'
                    }}
                  />
                ) : (
                  <span style={{ fontSize: 14, fontWeight: 500, color: '#334155' }}>{profileData.fullName}</span>
                )}
              </div>

              {/* Email Address */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                <span style={{ fontSize: 11, fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase' }}>Email Address</span>
                {isEditing ? (
                  <input
                    type="email"
                    value={tempData.email}
                    onChange={(e) => handleChange('email', e.target.value)}
                    style={{
                      padding: '6px 10px',
                      borderRadius: 6,
                      border: '1px solid #cbd5e1',
                      fontSize: 13,
                      outline: 'none',
                      color: '#1e293b'
                    }}
                  />
                ) : (
                  <span style={{ fontSize: 14, fontWeight: 500, color: '#334155', display: 'flex', alignItems: 'center', gap: 5 }}>
                    <Mail size={13} color="#94a3b8" />
                    {profileData.email}
                  </span>
                )}
              </div>

              {/* Contact Number */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                <span style={{ fontSize: 11, fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase' }}>Contact Number</span>
                {isEditing ? (
                  <input
                    type="text"
                    value={tempData.phone}
                    onChange={(e) => handleChange('phone', e.target.value)}
                    style={{
                      padding: '6px 10px',
                      borderRadius: 6,
                      border: '1px solid #cbd5e1',
                      fontSize: 13,
                      outline: 'none',
                      color: '#1e293b'
                    }}
                  />
                ) : (
                  <span style={{ fontSize: 14, fontWeight: 500, color: '#334155', display: 'flex', alignItems: 'center', gap: 5 }}>
                    <Phone size={13} color="#94a3b8" />
                    {profileData.phone}
                  </span>
                )}
              </div>

              {/* Date of Birth */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                <span style={{ fontSize: 11, fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase' }}>Date of Birth</span>
                {isEditing ? (
                  <input
                    type="text"
                    value={tempData.dob}
                    onChange={(e) => handleChange('dob', e.target.value)}
                    style={{
                      padding: '6px 10px',
                      borderRadius: 6,
                      border: '1px solid #cbd5e1',
                      fontSize: 13,
                      outline: 'none',
                      color: '#1e293b'
                    }}
                  />
                ) : (
                  <span style={{ fontSize: 14, fontWeight: 500, color: '#334155', display: 'flex', alignItems: 'center', gap: 5 }}>
                    <Calendar size={13} color="#94a3b8" />
                    {profileData.dob}
                  </span>
                )}
              </div>

              {/* Gender */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                <span style={{ fontSize: 11, fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase' }}>Gender</span>
                {isEditing ? (
                  <div style={{ display: 'flex', gap: 12, marginTop: 4 }}>
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
                  <span style={{ fontSize: 14, fontWeight: 500, color: '#334155' }}>{profileData.gender}</span>
                )}
              </div>
            </div>
          </div>

          {/* Card 2: Work Information */}
          <div style={{
            background: '#fff',
            borderRadius: 16,
            border: '1px solid #f1f5f9',
            boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
            padding: 24
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              borderBottom: '1px solid #f1f5f9',
              paddingBottom: 14,
              marginBottom: 16
            }}>
              <Briefcase size={18} color="#c0392b" />
              <h3 style={{ fontSize: 16, fontWeight: 700, color: '#1e293b', margin: 0 }}>
                Work Information
              </h3>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16 }}>
              {/* Department */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                <span style={{ fontSize: 11, fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase' }}>Department</span>
                <span style={{ fontSize: 14, fontWeight: 500, color: '#334155' }}>{profileData.department}</span>
              </div>

              {/* Designation */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                <span style={{ fontSize: 11, fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase' }}>Designation</span>
                <span style={{ fontSize: 14, fontWeight: 500, color: '#334155' }}>{profileData.designation}</span>
              </div>

              {/* Joining Date */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                <span style={{ fontSize: 11, fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase' }}>Joining Date</span>
                <span style={{ fontSize: 14, fontWeight: 500, color: '#334155' }}>{profileData.joiningDate}</span>
              </div>

              {/* Employment Type */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                <span style={{ fontSize: 11, fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase' }}>Employment Type</span>
                <span style={{ fontSize: 14, fontWeight: 500, color: '#334155' }}>{profileData.employmentType}</span>
              </div>

              {/* Work Location */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                <span style={{ fontSize: 11, fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase' }}>Work Location</span>
                <span style={{ fontSize: 14, fontWeight: 500, color: '#334155', display: 'flex', alignItems: 'center', gap: 5 }}>
                  <MapPin size={13} color="#94a3b8" />
                  {profileData.workLocation}
                </span>
              </div>

              {/* Reporting Manager */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                <span style={{ fontSize: 11, fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase' }}>Reporting Manager</span>
                <span style={{ fontSize: 14, fontWeight: 500, color: '#334155' }}>{profileData.reportingManager}</span>
              </div>
            </div>
          </div>
          
        </div>
      </div>
    </div>
  )
}
