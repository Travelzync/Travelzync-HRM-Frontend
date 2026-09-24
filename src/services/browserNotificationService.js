/**
 * Browser Web Native Notifications Service
 * Dispatches operating system desktop / browser notifications for real-time chat & HRM alerts.
 */

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

// Request permission with promise
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

  if (Notification.permission !== 'granted') {
    requestNotificationPermission().catch(() => {})
    return null
  }

  try {
    const defaultIcon = '/favicon.ico'
    const notif = new Notification(title, {
      icon: options.icon || defaultIcon,
      badge: options.badge || defaultIcon,
      body: options.body || '',
      tag: options.tag || undefined,
      renotify: options.renotify ?? true,
      silent: options.silent ?? false,
      ...options,
    })

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

// Auto-request notification permission on first user click if state is default
if (typeof window !== 'undefined' && 'Notification' in window) {
  const triggerOnInteraction = () => {
    if (Notification.permission === 'default') {
      Notification.requestPermission().catch(() => {})
    }
    window.removeEventListener('click', triggerOnInteraction)
    window.removeEventListener('keydown', triggerOnInteraction)
  }
  window.addEventListener('click', triggerOnInteraction, { once: true })
  window.addEventListener('keydown', triggerOnInteraction, { once: true })
}
