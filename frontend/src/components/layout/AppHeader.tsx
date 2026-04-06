import { Link } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'

export default function AppHeader() {
  const { user } = useAuth()

  if (!user) return null

  return (
    <header className="sticky top-0 z-50 bg-white dark:bg-[#1a1c1e] border-b border-outline-variant/10 px-4 sm:px-6 py-2.5 flex items-center justify-between">
      <Link to="/" className="flex items-center no-underline">
        <img src="/logo_name.png" alt="Acadrix" className="h-10 sm:h-9 w-auto object-contain" />
      </Link>

      {/* Mobile only: avatar (profile is in sidebar on desktop) */}
      <div className="md:hidden flex items-center">
        <div className="w-9 h-9 rounded-full bg-primary-container flex items-center justify-center text-on-primary-container font-bold text-sm uppercase">
          {user.full_name.charAt(0)}
        </div>
      </div>
    </header>
  )
}
