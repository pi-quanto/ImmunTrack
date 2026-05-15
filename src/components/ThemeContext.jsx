import { createContext, useContext, useState, useEffect } from 'react'

export const THEMES = {
  green: {
    id: 'green',
    name: 'Forest Green',
    swatch: ['#14532d', '#15803d', '#86efac'],
    vars: {
      '--pg-bg':           '#f0fdf4',
      '--shell-bg':        'linear-gradient(180deg, #edf8ef 0%, #f7fcf8 18%, #f7f9f7 100%)',
      '--banner-gradient': 'linear-gradient(135deg, #14532d 0%, #166534 55%, #15803d 100%)',
      '--primary':         '#15803d',
      '--primary-dark':    '#14532d',
      '--primary-mid':     '#166534',
      '--primary-shadow':  'rgba(20,83,45,0.30)',
      '--primary-shadow2': 'rgba(20,83,45,0.42)',
      '--text-primary':    '#0d1f16',
      '--text-secondary':  '#5a7566',
      '--text-muted':      '#93a89c',
      '--accent':          '#86efac',
      '--accent-light':    '#dcfce7',
      '--accent-border':   '#bbf7d0',
      '--accent-muted':    '#e9fbe9',
      '--dot-online':      '#4ade80',
      '--dot-glow':        'rgba(74,222,128,0.7)',
      '--card-bg':         '#ffffff',
      '--card-border':     '#e9fbe9',
      '--section-bg':      '#f0fdf4',
      '--section-border':  '#e9fbe9',
      '--btn-shadow':      '0 6px 22px rgba(21,128,61,0.35)',
      '--btn-shadow-hover':'0 10px 28px rgba(21,128,61,0.42)',
      '--nav-bg':          'rgba(255,255,255,0.98)',
      '--nav-border':      '#e8f5e9',
      '--nav-shadow':      '0 -4px 24px rgba(20,83,45,0.10)',
      '--nav-item-bg':     'rgba(255,255,255,0.56)',
      '--nav-item-muted':  '#9ca3af',
      '--nav-active-border':'rgba(21,128,61,0.12)',
      '--nav-active-bg':   '#dcfce7',
      '--nav-active-dot':  '#16a34a',
    },
  },
  blue: {
    id: 'blue',
    name: 'Ocean Blue',
    swatch: ['#1e3a5f', '#1d4ed8', '#93c5fd'],
    vars: {
      '--pg-bg':           '#eff6ff',
      '--shell-bg':        'linear-gradient(180deg, #eef5ff 0%, #f7fbff 18%, #f8fbff 100%)',
      '--banner-gradient': 'linear-gradient(135deg, #1e3a5f 0%, #1e40af 55%, #1d4ed8 100%)',
      '--primary':         '#1d4ed8',
      '--primary-dark':    '#1e3a5f',
      '--primary-mid':     '#1e40af',
      '--primary-shadow':  'rgba(30,58,95,0.30)',
      '--primary-shadow2': 'rgba(30,58,95,0.42)',
      '--text-primary':    '#10213b',
      '--text-secondary':  '#51657f',
      '--text-muted':      '#91a1b8',
      '--accent':          '#93c5fd',
      '--accent-light':    '#dbeafe',
      '--accent-border':   '#bfdbfe',
      '--accent-muted':    '#eff6ff',
      '--dot-online':      '#60a5fa',
      '--dot-glow':        'rgba(96,165,250,0.7)',
      '--card-bg':         '#ffffff',
      '--card-border':     '#dbeafe',
      '--section-bg':      '#eff6ff',
      '--section-border':  '#dbeafe',
      '--btn-shadow':      '0 6px 22px rgba(29,78,216,0.35)',
      '--btn-shadow-hover':'0 10px 28px rgba(29,78,216,0.42)',
      '--nav-bg':          'rgba(255,255,255,0.98)',
      '--nav-border':      '#dbeafe',
      '--nav-shadow':      '0 -4px 24px rgba(30,58,95,0.10)',
      '--nav-item-bg':     'rgba(255,255,255,0.65)',
      '--nav-item-muted':  '#8191aa',
      '--nav-active-border':'rgba(29,78,216,0.14)',
      '--nav-active-bg':   '#dbeafe',
      '--nav-active-dot':  '#1d4ed8',
    },
  },
  purple: {
    id: 'purple',
    name: 'Royal Purple',
    swatch: ['#3b0764', '#7c3aed', '#c4b5fd'],
    vars: {
      '--pg-bg':           '#faf5ff',
      '--shell-bg':        'linear-gradient(180deg, #fbf6ff 0%, #fcf9ff 18%, #faf7ff 100%)',
      '--banner-gradient': 'linear-gradient(135deg, #3b0764 0%, #6b21a8 55%, #7c3aed 100%)',
      '--primary':         '#7c3aed',
      '--primary-dark':    '#3b0764',
      '--primary-mid':     '#6b21a8',
      '--primary-shadow':  'rgba(59,7,100,0.30)',
      '--primary-shadow2': 'rgba(59,7,100,0.42)',
      '--text-primary':    '#25113d',
      '--text-secondary':  '#6a5b7c',
      '--text-muted':      '#a79ab7',
      '--accent':          '#c4b5fd',
      '--accent-light':    '#ede9fe',
      '--accent-border':   '#ddd6fe',
      '--accent-muted':    '#f5f3ff',
      '--dot-online':      '#a78bfa',
      '--dot-glow':        'rgba(167,139,250,0.7)',
      '--card-bg':         '#ffffff',
      '--card-border':     '#ede9fe',
      '--section-bg':      '#faf5ff',
      '--section-border':  '#ede9fe',
      '--btn-shadow':      '0 6px 22px rgba(124,58,237,0.35)',
      '--btn-shadow-hover':'0 10px 28px rgba(124,58,237,0.42)',
      '--nav-bg':          'rgba(255,255,255,0.98)',
      '--nav-border':      '#ede9fe',
      '--nav-shadow':      '0 -4px 24px rgba(59,7,100,0.10)',
      '--nav-item-bg':     'rgba(255,255,255,0.65)',
      '--nav-item-muted':  '#9d8db0',
      '--nav-active-border':'rgba(124,58,237,0.14)',
      '--nav-active-bg':   '#ede9fe',
      '--nav-active-dot':  '#7c3aed',
    },
  },
  midnight: {
    id: 'midnight',
    name: 'Midnight Black',
    swatch: ['#000000', '#111111', '#f8fafc'],
    vars: {
      '--pg-bg':           '#000000',
      '--shell-bg':        'linear-gradient(180deg, #000000 0%, #050505 22%, #0b0b0b 100%)',
      '--banner-gradient': 'linear-gradient(135deg, #000000 0%, #080808 55%, #111111 100%)',
      '--primary':         '#f8fafc',
      '--primary-dark':    '#ffffff',
      '--primary-mid':     '#d4d4d8',
      '--primary-shadow':  'rgba(0,0,0,0.72)',
      '--primary-shadow2': 'rgba(0,0,0,0.82)',
      '--text-primary':    '#ffffff',
      '--text-secondary':  '#d4d4d8',
      '--text-muted':      '#a1a1aa',
      '--accent':          '#e5e7eb',
      '--accent-light':    '#111111',
      '--accent-border':   '#404040',
      '--accent-muted':    '#090909',
      '--dot-online':      '#4ade80',
      '--dot-glow':        'rgba(74,222,128,0.7)',
      '--card-bg':         '#000000',
      '--card-border':     '#404040',
      '--section-bg':      '#000000',
      '--section-border':  '#404040',
      '--btn-shadow':      '0 6px 22px rgba(0,0,0,0.50)',
      '--btn-shadow-hover':'0 10px 28px rgba(0,0,0,0.65)',
      '--nav-bg':          'rgba(0,0,0,0.96)',
      '--nav-border':      '#404040',
      '--nav-shadow':      '0 -4px 24px rgba(0,0,0,0.56)',
      '--nav-item-bg':     'rgba(10,10,10,0.98)',
      '--nav-item-muted':  '#a1a1aa',
      '--nav-active-border':'rgba(255,255,255,0.18)',
      '--nav-active-bg':   '#111111',
      '--nav-active-dot':  '#ffffff',
    },
  },
}

const ThemeContext = createContext(null)

export function ThemeProvider({ children }) {
  const [themeId, setThemeId] = useState(() => {
    return localStorage.getItem('immuntrack_theme') || 'green'
  })

  const theme = THEMES[themeId] || THEMES.green

  useEffect(() => {
    const root = document.documentElement
    Object.entries(theme.vars).forEach(([key, value]) => {
      root.style.setProperty(key, value)
    })
    localStorage.setItem('immuntrack_theme', themeId)
  }, [themeId, theme])

  const setTheme = (id) => {
    if (THEMES[id]) setThemeId(id)
  }

  return (
    <ThemeContext.Provider value={{ theme, themeId, setTheme, themes: THEMES }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const ctx = useContext(ThemeContext)
  if (!ctx) throw new Error('useTheme must be used inside ThemeProvider')
  return ctx
}
