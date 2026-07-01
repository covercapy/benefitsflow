'use client'
import { createContext, useContext, useState, useEffect, ReactNode } from 'react'

export type Theme = 'dark' | 'light'
interface ThemeCtx { theme: Theme; toggle: () => void }
export const ThemeContext = createContext<ThemeCtx>({ theme: 'light', toggle: () => {} })
export function useTheme() { return useContext(ThemeContext) }
export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>('light')
  useEffect(() => {
    try {
      const saved = localStorage.getItem('bf_theme') as Theme
      if (saved === 'light' || saved === 'dark') setTheme(saved)
    } catch { /* */ }
  }, [])
  useEffect(() => {
    const root = document.documentElement
    if (theme === 'dark') {
      root.classList.add('dark')
    } else {
      root.classList.remove('dark')
    }
  }, [theme])
  function toggle() {
    setTheme(t => {
      const next = t === 'dark' ? 'light' : 'dark'
      try { localStorage.setItem('bf_theme', next) } catch { /* */ }
      return next
    })
  }
  return <ThemeContext.Provider value={{ theme, toggle }}>{children}</ThemeContext.Provider>
}
