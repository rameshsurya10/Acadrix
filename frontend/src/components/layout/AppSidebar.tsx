import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { NAV_CONFIG, type NavSection } from './navConfig'

function SidebarSection({ section, pathname }: { section: NavSection; pathname: string }) {
  const hasActiveItem = section.items.some(
    item => pathname === item.to || pathname.startsWith(item.to + '/'),
  )
  const [open, setOpen] = useState(section.defaultOpen || hasActiveItem)

  return (
    <div className="mb-1">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-4 py-2 rounded-lg text-[11px] font-bold uppercase tracking-widest text-on-surface-variant/60 hover:text-on-surface-variant hover:bg-surface-container-low transition-colors"
      >
        <span className="flex items-center gap-2">
          <span className="material-symbols-outlined text-[16px]">{section.icon}</span>
          {section.title}
        </span>
        <span
          className="material-symbols-outlined text-[16px] transition-transform duration-200"
          style={{ transform: open ? 'rotate(0deg)' : 'rotate(-90deg)' }}
        >
          expand_more
        </span>
      </button>

      {open && (
        <div className="mt-0.5 flex flex-col gap-0.5">
          {section.items.map(item => {
            const isActive = pathname === item.to || pathname.startsWith(item.to + '/')
            return (
              <Link
                key={item.to}
                to={item.to}
                className={[
                  'flex items-center gap-3 pl-8 pr-4 py-2.5 rounded-xl text-[13px] font-medium transition-colors no-underline',
                  isActive
                    ? 'bg-[#e8f0fe] text-[#1A73E8] font-semibold'
                    : 'text-on-surface-variant hover:bg-surface-container-low',
                ].join(' ')}
              >
                <span
                  className="material-symbols-outlined text-lg"
                  style={isActive ? { fontVariationSettings: "'FILL' 1" } : undefined}
                >
                  {item.icon}
                </span>
                <span>{item.label}</span>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default function AppSidebar() {
  const { user, logout } = useAuth()
  const { pathname } = useLocation()

  if (!user) return null

  const { sidebar } = NAV_CONFIG[user.role]

  return (
    <aside className="hidden md:flex flex-col w-60 bg-surface-container-lowest border-r border-outline-variant/10 sticky top-[53px] h-[calc(100vh-53px)] shrink-0">
      <nav className="flex flex-col gap-0.5 pt-3 px-2 flex-1 overflow-y-auto">
        {sidebar.map(section => (
          <SidebarSection key={section.title} section={section} pathname={pathname} />
        ))}
      </nav>

      {/* User Profile at bottom */}
      <div className="border-t border-outline-variant/10 px-3 py-3">
        <div className="flex items-center gap-3 px-3 py-2">
          <div className="w-9 h-9 rounded-full bg-primary-container flex items-center justify-center text-on-primary-container font-bold text-sm uppercase shrink-0">
            {user.full_name.charAt(0)}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-on-surface truncate">{user.full_name}</p>
            <p className="text-xs text-on-surface-variant truncate capitalize">{user.role.replace('_', ' ')}</p>
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
