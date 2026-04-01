import { Navigate, Outlet } from 'react-router-dom'
import { useAuth, UserRole } from '@/contexts/AuthContext'

const ROLE_HOME: Record<UserRole, string> = {
  admin: '/admin/dashboard',
  principal: '/principal/dashboard',
  teacher: '/teacher/dashboard',
  student: '/student/dashboard',
  parent: '/parent/payments',
}

interface Props {
  role: UserRole | 'any'
}

export default function ProtectedRoute({ role }: Props) {
  const { user, isLoading } = useAuth()

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface">
        <span className="material-symbols-outlined animate-spin text-primary text-4xl">
          progress_activity
        </span>
      </div>
    )
  }

  if (!user) return <Navigate to="/login" replace />

  if (role !== 'any' && user.role !== role) {
    return <Navigate to={ROLE_HOME[user.role]} replace />
  }

  return <Outlet />
}
