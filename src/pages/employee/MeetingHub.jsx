import { useState, useEffect } from 'react'
import {
  Video, Calendar, Clock, MapPin, Users, Check, X,
  HelpCircle, ExternalLink, Sparkles, Loader2
} from 'lucide-react'
import { getMyMeetings, updateRSVP } from '../../services/meetingService'
import { showSuccess, showError } from '../../utils/toast'
import { getCurrentUser } from '../../services/authService'

export default function MeetingHub() {
  const currentUser = getCurrentUser()
  const [meetings, setMeetings] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('upcoming')
  const [actionLoading, setActionLoading] = useState(false)

  const loadMeetings = async () => {
    try {
      setLoading(true)
      const res = await getMyMeetings()
      if (res?.success) {
        setMeetings(res.meetings || [])
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadMeetings()
  }, [])

  const handleRSVP = async (meetingId, status) => {
    try {
      setActionLoading(true)
      const res = await updateRSVP(meetingId, status)
      showSuccess(res.message || `RSVP updated to ${status}`)
      loadMeetings()
    } catch (err) {
      showError('Failed to update RSVP')
    } finally {
      setActionLoading(false)
    }
  }

  const now = new Date()
  const todayStr = now.toISOString().split('T')[0]

  const upcomingMeetings = meetings.filter((m) => new Date(m.meetingDate) >= new Date(todayStr))
  const pastMeetings = meetings.filter((m) => new Date(m.meetingDate) < new Date(todayStr))
  const todayMeetings = meetings.filter((m) => m.meetingDate?.split('T')[0] === todayStr)

  const displayedMeetings =
    activeTab === 'upcoming'
      ? upcomingMeetings
      : activeTab === 'today'
      ? todayMeetings
      : pastMeetings

  const nextMeeting = upcomingMeetings[0]

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* 1. Hero Spotlight Banner */}
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
          gap: 20,
          boxShadow: '0 4px 14px rgba(192, 57, 43, 0.25)',
        }}
      >
        <div>
          <span
            style={{
              background: 'rgba(255,255,255,0.2)',
              borderRadius: 12,
              padding: '3px 10px',
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: 0.5,
              textTransform: 'uppercase',
            }}
          >
            MEETING HUB
          </span>
          <h2 style={{ fontSize: 22, fontWeight: 800, margin: '8px 0 4px 0' }}>
            Collaboration & Video Calls
          </h2>
          <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.85)', margin: 0 }}>
            Join scheduled company huddles, department syncs, and client briefings.
          </p>
        </div>

        {nextMeeting ? (
          <div
            style={{
              background: 'rgba(255,255,255,0.15)',
              backdropFilter: 'blur(8px)',
              borderRadius: 14,
              padding: '12px 18px',
              border: '1px solid rgba(255,255,255,0.2)',
              minWidth: 260,
            }}
          >
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.8)', fontWeight: 600 }}>
              NEXT UPCOMING MEETING
            </div>
            <div style={{ fontSize: 16, fontWeight: 800, marginTop: 3 }}>
              {nextMeeting.title}
            </div>
            <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.9)', marginTop: 4, display: 'flex', alignItems: 'center', gap: 6 }}>
              <Clock size={13} />
              <span>
                {new Date(nextMeeting.meetingDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })} • {nextMeeting.startTime}
              </span>
            </div>
            {nextMeeting.meetingLink && (
              <a
                href={nextMeeting.meetingLink}
                target="_blank"
                rel="noreferrer"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  marginTop: 10,
                  background: '#fff',
                  color: '#c0392b',
                  padding: '6px 14px',
                  borderRadius: 8,
                  fontSize: 12,
                  fontWeight: 700,
                  textDecoration: 'none',
                }}
              >
                <Video size={14} /> Join Call Now
              </a>
            )}
          </div>
        ) : (
          <div
            style={{
              background: 'rgba(255,255,255,0.12)',
              borderRadius: 12,
              padding: '10px 16px',
              fontSize: 13,
              color: 'rgba(255,255,255,0.9)',
            }}
          >
            🎉 No upcoming meetings right now
          </div>
        )}
      </div>

      {/* 2. Tabs Row */}
      <div style={{ display: 'flex', gap: 10, borderBottom: '1px solid #e2e8f0', paddingBottom: 8 }}>
        {[
          { id: 'upcoming', label: `Upcoming (${upcomingMeetings.length})` },
          { id: 'today', label: `Today's Syncs (${todayMeetings.length})` },
          { id: 'past', label: `Past Archive (${pastMeetings.length})` },
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

      {/* 3. Meetings Grid */}
      {loading ? (
        <div style={{ padding: 40, textAlign: 'center', color: '#94a3b8' }}>
          <Loader2 className="animate-spin" size={24} style={{ margin: '0 auto 8px' }} />
          <span>Loading meetings...</span>
        </div>
      ) : displayedMeetings.length === 0 ? (
        <div
          style={{
            background: '#fff',
            borderRadius: 14,
            border: '1px solid #e2e8f0',
            padding: 40,
            textAlign: 'center',
            color: '#64748b',
          }}
        >
          <Sparkles size={32} style={{ margin: '0 auto 10px', color: '#cbd5e1' }} />
          <h3 style={{ fontSize: 16, fontWeight: 700, color: '#1e293b', margin: 0 }}>
            No meetings in this view
          </h3>
          <p style={{ fontSize: 13, marginTop: 4 }}>You have a clear schedule!</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 18 }}>
          {displayedMeetings.map((m) => {
            const userRSVP = m.rsvps?.find(
              (r) => r.user?._id === currentUser?.userId || r.user === currentUser?.userId
            )?.status || 'accepted'

            return (
              <div
                key={m._id}
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
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 10 }}>
                    <span
                      style={{
                        fontSize: 10,
                        fontWeight: 700,
                        textTransform: 'uppercase',
                        borderRadius: 6,
                        padding: '3px 8px',
                        background: m.type === 'online' ? '#fef2f2' : '#fef3c7',
                        color: m.type === 'online' ? '#c0392b' : '#b45309',
                      }}
                    >
                      {m.type === 'online' ? '🌐 Virtual Meet' : '🏢 In-Person'}
                    </span>

                    <span
                      style={{
                        fontSize: 11,
                        fontWeight: 700,
                        color:
                          userRSVP === 'accepted'
                            ? '#16a34a'
                            : userRSVP === 'declined'
                            ? '#dc2626'
                            : '#d97706',
                        background:
                          userRSVP === 'accepted'
                            ? '#dcfce7'
                            : userRSVP === 'declined'
                            ? '#fee2e2'
                            : '#fef3c7',
                        padding: '2px 8px',
                        borderRadius: 10,
                      }}
                    >
                      RSVP: {userRSVP}
                    </span>
                  </div>

                  <h3 style={{ fontSize: 16, fontWeight: 700, color: '#0f172a', margin: '10px 0 6px 0' }}>
                    {m.title}
                  </h3>
                  {m.description && (
                    <p style={{ fontSize: 12.5, color: '#64748b', margin: '0 0 12px 0', lineHeight: 1.4 }}>
                      {m.description}
                    </p>
                  )}

                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: 12, color: '#475569' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <Calendar size={14} color="#64748b" />
                      <span>
                        {new Date(m.meetingDate).toLocaleDateString(undefined, {
                          weekday: 'short',
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <Clock size={14} color="#64748b" />
                      <span>
                        {m.startTime} – {m.endTime}
                      </span>
                    </div>

                    {m.room && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <MapPin size={14} color="#64748b" />
                        <span>Room: {m.room}</span>
                      </div>
                    )}

                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <Users size={14} color="#64748b" />
                      <span>Host: {m.host?.name || 'Management'}</span>
                    </div>
                  </div>
                </div>

                {/* Card Actions Footer */}
                <div
                  style={{
                    borderTop: '1px solid #f1f5f9',
                    paddingTop: 12,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: 10,
                  }}
                >
                  {/* RSVP buttons */}
                  <div style={{ display: 'flex', gap: 6 }}>
                    <button
                      onClick={() => handleRSVP(m._id, 'accepted')}
                      disabled={actionLoading}
                      title="Accept meeting"
                      style={{
                        background: userRSVP === 'accepted' ? '#16a34a' : '#f1f5f9',
                        color: userRSVP === 'accepted' ? '#fff' : '#475569',
                        border: 'none',
                        borderRadius: 6,
                        padding: '4px 8px',
                        fontSize: 11,
                        fontWeight: 600,
                        cursor: 'pointer',
                      }}
                    >
                      <Check size={12} />
                    </button>
                    <button
                      onClick={() => handleRSVP(m._id, 'declined')}
                      disabled={actionLoading}
                      title="Decline meeting"
                      style={{
                        background: userRSVP === 'declined' ? '#dc2626' : '#f1f5f9',
                        color: userRSVP === 'declined' ? '#fff' : '#475569',
                        border: 'none',
                        borderRadius: 6,
                        padding: '4px 8px',
                        fontSize: 11,
                        fontWeight: 600,
                        cursor: 'pointer',
                      }}
                    >
                      <X size={12} />
                    </button>
                  </div>

                  {m.meetingLink && (
                    <a
                      href={m.meetingLink}
                      target="_blank"
                      rel="noreferrer"
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 5,
                        background: 'linear-gradient(135deg, #c0392b, #922b21)',
                        color: '#fff',
                        padding: '6px 14px',
                        borderRadius: 8,
                        fontSize: 12,
                        fontWeight: 600,
                        textDecoration: 'none',
                        boxShadow: '0 2px 4px rgba(192, 57, 43, 0.25)',
                      }}
                    >
                      <Video size={13} />
                      <span>Join Call</span>
                    </a>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
