/**
 * Browser Web Native Notifications Service
 * Dispatches operating system desktop / browser notifications for real-time chat & HRM alerts.
 */

const DEFAULT_NOTIFICATION_ICON =
  'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%23c0392b"><path d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.89 2 2 2zm6-6v-5c0-3.07-1.64-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.63 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2z"/></svg>'

// Soft audio chime using Web Audio API (crisp, pleasant dual-tone chime)
export const playNotificationChime = () => {
  if (typeof window === 'undefined') return
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext
    if (!AudioContext) return
    const ctx = new AudioContext()
    if (ctx.state === 'suspended') {
      ctx.resume().catch(() => {})
    }

    const now = ctx.currentTime
    const osc1 = ctx.createOscillator()
    const osc2 = ctx.createOscillator()
    const gain = ctx.createGain()

    osc1.type = 'sine'
    osc1.frequency.setValueAtTime(587.33, now) // D5
    osc1.frequency.exponentialRampToValueAtTime(880, now + 0.12) // A5

    osc2.type = 'sine'
    osc2.frequency.setValueAtTime(880, now + 0.12) // A5
    osc2.frequency.exponentialRampToValueAtTime(1174.66, now + 0.25) // D6

    gain.gain.setValueAtTime(0.12, now)
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.45)

    osc1.connect(gain)
    osc2.connect(gain)
    gain.connect(ctx.destination)

    osc1.start(now)
    osc1.stop(now + 0.2)
    osc2.start(now + 0.12)
    osc2.stop(now + 0.45)
  } catch {
    // Audio autoplay restricted or unsupported
  }
}

// Check if browser notifications are supported
export const isNotificationSupported = () => {
  return typeof window !== 'undefined' && 'Notification' in window
}

// Get current permission status ('granted', 'denied', 'default', or 'unsupported')
export const getNotificationPermissionStatus = () => {
  if (!isNotificationSupported()) {
    return 'unsupported'
  }
  return Notification.permission
}

// Request permission with promise (must be triggered from user gesture like a button click)
export const requestNotificationPermission = async () => {
  if (!isNotificationSupported()) {
    return 'unsupported'
  }

  try {
    if (Notification.permission === 'default') {
      const permission = await Notification.requestPermission()
      return permission
    }
    return Notification.permission
  } catch (err) {
    console.warn('Error requesting browser notification permission:', err)
    return 'denied'
  }
}

// Send Native Desktop OS / Browser Notification
export const sendBrowserNotification = (title, options = {}) => {
  if (!isNotificationSupported()) {
    return null
  }

  // Play audio chime
  if (options.chime !== false) {
    playNotificationChime()
  }

  // Can only trigger if permission is explicitly granted
  if (Notification.permission !== 'granted') {
    return null
  }

  try {
    const notifOptions = {
      body: options.body || '',
      icon: options.icon || DEFAULT_NOTIFICATION_ICON,
      silent: options.silent ?? false,
    }

    if (options.tag) {
      notifOptions.tag = options.tag
      if (typeof options.renotify === 'boolean') {
        notifOptions.renotify = options.renotify
      }
    }

    const notif = new Notification(title, notifOptions)

    notif.onclick = (event) => {
      event.preventDefault()
      try {
        window.focus()
      } catch {
        // silent
      }
      if (options.url) {
        window.location.href = options.url
      }
      notif.close()
    }

    return notif
  } catch (err) {
    console.warn('Browser notification trigger failed:', err)
    return null
  }
}

// Helper to trigger a test desktop notification immediately
export const triggerTestNotification = () => {
  if (!isNotificationSupported()) {
    return { success: false, reason: 'unsupported' }
  }
  if (Notification.permission !== 'granted') {
    return { success: false, reason: Notification.permission }
  }
  const notif = sendBrowserNotification('TravelZync HRM • Test Alert', {
    body: 'Browser desktop notifications are working seamlessly! 🎉',
  })
  return { success: !!notif, reason: notif ? 'ok' : 'blocked' }
}
