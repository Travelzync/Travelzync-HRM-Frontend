import { useState, useEffect } from 'react'

let currentTheme = (typeof window !== 'undefined' && localStorage.getItem('travelzync_theme')) || 'light'
const listeners = new Set()

function applyThemeToDOM(theme) {
  if (typeof document === 'undefined') return
  document.documentElement.setAttribute('data-theme', theme)
  if (theme === 'dark') {
    document.documentElement.classList.add('dark')
  } else {
    document.documentElement.classList.remove('dark')
  }
}

export function useTheme() {
  const [theme, setTheme] = useState(currentTheme)

  useEffect(() => {
    listeners.add(setTheme)
    return () => {
      listeners.delete(setTheme)
    }
  }, [])

  const toggleTheme = () => {
    const nextTheme = currentTheme === 'dark' ? 'light' : 'dark'
    currentTheme = nextTheme
    try {
      localStorage.setItem('travelzync_theme', nextTheme)
    } catch (e) {
      console.warn('Could not persist theme to localStorage', e)
    }
    applyThemeToDOM(nextTheme)
    listeners.forEach((fn) => fn(nextTheme))
  }

  const setThemeExplicitly = (newTheme) => {
    if (newTheme !== 'light' && newTheme !== 'dark') return
    currentTheme = newTheme
    try {
      localStorage.setItem('travelzync_theme', newTheme)
    } catch (e) {
      console.warn('Could not persist theme to localStorage', e)
    }
    applyThemeToDOM(newTheme)
    listeners.forEach((fn) => fn(newTheme))
  }

  return {
    theme,
    toggleTheme,
    setTheme: setThemeExplicitly,
    isDark: theme === 'dark'
  }
}

export default useTheme
