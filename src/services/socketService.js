import { io } from 'socket.io-client'
import { API_BASE_URL } from './apiClient'

let socket = null

export const initSocket = () => {
  const token = localStorage.getItem('token')
  if (!token) return null

  // If already connected with the same token, return existing instance
  if (socket && socket.connected) {
    return socket
  }

  // Disconnect previous instance if any
  if (socket) {
    try {
      socket.disconnect()
    } catch {
      // silent
    }
  }

  socket = io(API_BASE_URL, {
    auth: { token },
    transports: ['polling', 'websocket'],
    reconnection: true,
    reconnectionAttempts: Infinity,
    reconnectionDelay: 2000,
    reconnectionDelayMax: 5000,
    timeout: 20000,
  })

  socket.on('connect', () => {
    // joined
  })

  socket.on('connect_error', (err) => {
    console.warn('Socket connection note:', err.message)
  })

  return socket
}

export const getSocket = () => {
  if (!socket || !socket.connected) {
    return initSocket()
  }
  return socket
}

export const disconnectSocket = () => {
  if (socket) {
    try {
      socket.disconnect()
    } catch {
      // silent
    }
    socket = null
  }
}

// Join channel room
export const joinChannelRoom = (channelSlug) => {
  const s = getSocket()
  if (s && channelSlug) {
    s.emit('join_channel', channelSlug)
  }
}

// Leave channel room
export const leaveChannelRoom = (channelSlug) => {
  const s = getSocket()
  if (s && channelSlug) {
    s.emit('leave_channel', channelSlug)
  }
}

// Emit typing indicator
export const sendTypingStatus = ({ channel, recipientId, isTyping }) => {
  const s = getSocket()
  if (s) {
    s.emit('typing', { channel, recipientId, isTyping })
  }
}

// Subscribe to a socket event with automatic cleanup return
export const subscribeToSocket = (event, callback) => {
  const s = getSocket()
  if (!s) return () => {}

  s.on(event, callback)
  return () => {
    try {
      s.off(event, callback)
    } catch {
      // silent
    }
  }
}
