import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { NAV_CONFIG } from './navConfig'

export default function AppSidebar() {
  const { user, logout } = useAuth()
  const { pathname } = useLocation()

  if (!user) return null

  const { sidebar } = NAV_CONFIG[user.role]

  return (
    <aside className="hidden md:flex flex-col w-60 bg-surface-container-lowest border-r border-outline-variant/10 sticky top-[53px] h-[calc(100vh-53px)] shrink-0">
      <nav className="flex flex-col gap-1 pt-4 px-3 flex-1 overflow-y-auto">
        {sidebar.map(item => {
          const isActive = pathname === item.to || pathname.startsWith(item.to + '/')
          return (
            <Link
              key={item.to}
              to={item.to}
              className={[
                'flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-colors no-underline',
                isActive
                  ? 'bg-[#e8f0fe] text-[#1A73E8]'
                  : 'text-on-surface-variant hover:bg-surface-container-low',
              ].join(' ')}
            >
              <span
                className="material-symbols-outlined text-xl"
                style={isActive ? { fontVariationSettings: "'FILL' 1" } : undefined}
              >
                {item.icon}
              </span>
              <span>{item.label}</span>
            </Link>
          )
        })}
      </nav>

      {/* User Profile at bottom */}
      <div className="border-t border-outline-variant/10 px-3 py-3">
        <div className="flex items-center gap-3 px-3 py-2">
          <div className="w-9 h-9 rounded-full bg-primary-container flex items-center justify-center text-on-primary-container font-bold text-sm uppercase shrink-0">
            {user.full_name.charAt(0)}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-on-surface truncate">{user.full_name}</p>
            <p className="text-xs text-on-surface-variant truncate capitalize">{user.role}</p>
          </div>
          <button
            onClick={logout}
            className="text-outline hover:text-error transition-colors shrink-0"
            title="Sign out"
          >
            <span className="material-symbols-outlined text-xl">logout</span>
          </button>
        </div>
      </div>
    </aside>
  )
}
