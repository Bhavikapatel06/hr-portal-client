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
      className={`
        relative w-14 h-7 rounded-full border transition-all duration-300 flex items-center px-1
        ${isLight
          ? 'bg-accent/15 border-accent/30'
          : 'bg-white/8 border-white/15'
        }
      `}
    >
      {/* Track icons */}
      <Sun size={11} className={`absolute left-1.5 transition-opacity duration-200 ${isLight ? 'opacity-100 text-accent' : 'opacity-30 text-slate-500'}`} />
      <Moon size={11} className={`absolute right-1.5 transition-opacity duration-200 ${!isLight ? 'opacity-100 text-slate-300' : 'opacity-30 text-slate-400'}`} />

      {/* Thumb */}
      <div className={`
        w-5 h-5 rounded-full shadow-sm flex items-center justify-center
        transition-all duration-300 transform
        ${isLight
          ? 'translate-x-7 bg-accent'
          : 'translate-x-0 bg-slate-300'
        }
      `}>
        {isLight
          ? <Sun size={10} className="text-white" />
          : <Moon size={10} className="text-slate-700" />
        }
      </div>
    </button>
  )
}