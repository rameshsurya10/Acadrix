import { Navigate, Outlet } from 'react-router-dom'
import { useAuth, UserRole } from '@/contexts/AuthContext'

const ROLE_HOME: Record<UserRole, string> = {
  admin: '/admin/dashboard',
  principal: '/principal/dashboard',
  teacher: '/teacher/dashboard',
  student: '/student/dashboard',
}

interface Props {
  role: UserRole | 'any'
}

export default function ProtectedRoute({ role }: Props) {
  const { user, isLoading } = useAuth()

  if (isLoading) {
    return (
      <div className="min-h-screen bg-surface flex flex-col">
        <div className="h-16 bg-surface-container-lowest border-b border-outline-variant/10 flex items-center px-6 gap-4">
          <div className="w-8 h-8 rounded-lg bg-surface-container-high animate-pulse" />
          <div className="w-24 h-4 rounded bg-surface-container-high animate-pulse" />
        </div>
        <div className="flex-1 flex items-center justify-center">
          <div className="space-y-4 w-full max-w-sm px-8">
            <div className="w-40 h-5 rounded bg-surface-container-high animate-pulse mx-auto" />
            <div className="w-full h-3 rounded bg-surface-container-high animate-pulse" />
            <div className="w-3/4 h-3 rounded bg-surface-container-high animate-pulse" />
          </div>
        </div>
      </div>
    )
  }

  if (!user) return <Navigate to="/login" replace />

  if (role !== 'any') {
    if (user.role !== role) {
      return <Navigate to={ROLE_HOME[user.role]} replace />
    }
  }

  return <Outlet />
}
