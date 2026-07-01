import { useEffect, useMemo, useState } from 'react'
import { ThemeContext } from './theme-context.js'

const STORAGE_KEY = 'transportflow-theme'
const THEMES = ['light', 'dark']

function getInitialTheme() {
  if (typeof window === 'undefined') return 'light'

  const storedTheme = window.localStorage.getItem(STORAGE_KEY)
  if (THEMES.includes(storedTheme)) return storedTheme

  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(getInitialTheme)

  useEffect(() => {
    document.documentElement.dataset.theme = theme
    document.documentElement.style.colorScheme = theme
    window.localStorage.setItem(STORAGE_KEY, theme)
  }, [theme])

  const value = useMemo(() => ({
    theme,
    setTheme,
    toggleTheme: () => setTheme((currentTheme) => (currentTheme === 'dark' ? 'light' : 'dark')),
  }), [theme])

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}
