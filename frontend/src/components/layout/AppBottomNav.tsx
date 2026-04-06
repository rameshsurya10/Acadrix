import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { NAV_CONFIG } from './navConfig'

export default function AppBottomNav() {
  const { user } = useAuth()
  const { pathname } = useLocation()

  if (!user) return null

  const { bottomNav } = NAV_CONFIG[user.role]

  return (
    <nav className="md:hidden fixed bottom-0 w-full z-50 rounded-t-2xl bg-white dark:bg-[#1f2122] shadow-[0_-4px_32px_rgba(25,28,29,0.04)] flex justify-around items-center h-20 px-4">
      {bottomNav.map(item => {
        const isActive = pathname === item.to || pathname.startsWith(item.to + '/')
        return (
          <Link
            key={item.to}
            to={item.to}
            className={[
              'flex flex-col items-center justify-center px-4 py-1 rounded-xl transition-all duration-200 no-underline',
              isActive
                ? 'bg-[#cfe6f2] dark:bg-[#2b5ab5]/20 text-[#2b5ab5] dark:text-[#4874cf]'
                : 'text-[#414754] dark:text-[#c1c6d6] hover:bg-[#f3f4f5]',
            ].join(' ')}
          >
            <span
              className="material-symbols-outlined"
              style={isActive ? { fontVariationSettings: "'FILL' 1" } : undefined}
            >
              {item.icon}
            </span>
            <span className="font-['Inter'] font-medium text-[10px] uppercase tracking-widest mt-1">
              {item.label}
            </span>
          </Link>
        )
      })}
    </nav>
  )
}
