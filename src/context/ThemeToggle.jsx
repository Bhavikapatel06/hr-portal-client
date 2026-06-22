import React from 'react'
import { Sun, Moon } from 'lucide-react'
import { useTheme } from './ThemeContext'

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme()
  const isLight = theme === 'light'

  return (
    <button
      onClick={toggleTheme}
      title={isLight ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
      className="w-9 h-9 rounded-lg flex items-center justify-center transition-all duration-200 hover:scale-105"
      style={{
        background: isLight ? 'rgba(59,111,237,0.10)' : 'rgba(255,255,255,0.06)',
        border: `1px solid ${isLight ? 'rgba(59,111,237,0.25)' : 'rgba(255,255,255,0.12)'}`,
        color: isLight ? '#3B6FED' : '#A8B2C7',
      }}
    >
      {isLight ? <Sun size={16} /> : <Moon size={16} />}
    </button>
  )
}