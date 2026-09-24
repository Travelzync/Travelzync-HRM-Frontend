/**
 * Browser Web Native Notifications Service
 * Dispatches operating system desktop / browser notifications for real-time chat & HRM alerts.
 */

export const requestNotificationPermission = async () => {
  if (typeof window === 'undefined' || !('Notification' in window)) {
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

export const sendBrowserNotification = (title, options = {}) => {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return null
  }

  if (Notification.permission !== 'granted') {
    // Attempt permission request
    requestNotificationPermission()
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
