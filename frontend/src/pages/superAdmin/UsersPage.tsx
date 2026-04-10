import { useState, useEffect } from 'react'
import PageLayout from '@/components/layout/PageLayout'
import { superAdminService, type UserItem } from '@/services/superAdmin/superAdminService'
import { SkeletonTableRow } from '@/components/shared/Skeleton'

const ROLE_LABELS: Record<string, string> = {
  admin: 'Admin', principal: 'Principal', teacher: 'Teacher', student: 'Student',
}
const ROLE_COLORS: Record<string, string> = {
  admin: 'bg-primary/10 text-primary', principal: 'bg-secondary/10 text-secondary',
  teacher: 'bg-tertiary/10 text-tertiary', student: 'bg-on-surface-variant/10 text-on-surface-variant',
}

export default function UsersPage() {
  const [users, setUsers] = useState<UserItem[]>([])
  const [totalCount, setTotalCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [success, setSuccess] = useState<string | null>(null)

  useEffect(() => { loadUsers() }, [search, roleFilter, statusFilter])

  async function loadUsers() {
    setLoading(true)
    try {
      const params: Record<string, string> = {}
      if (search) params.search = search
      if (roleFilter) params.role = roleFilter
      if (statusFilter) params.is_active = statusFilter
      const data = await superAdminService.getUsers(params)
      setUsers(data.results)
      setTotalCount(data.count)
    } catch { /* empty */ }
    finally { setLoading(false) }
  }

  async function toggleActive(user: UserItem) {
    try {
      const updated = await superAdminService.toggleUserActive(user.id, !user.is_active)
      setUsers(prev => prev.map(u => u.id === updated.id ? updated : u))
      setSuccess(`${updated.full_name} ${updated.is_active ? 'activated' : 'deactivated'}.`)
    } catch { /* empty */ }
  }

  async function resetPassword(user: UserItem) {
    try {
      await superAdminService.resetUserPassword(user.id)
      setSuccess(`Password reset for ${user.full_name}.`)
    } catch { /* empty */ }
  }

  return (
    <PageLayout>
      <main className="max-w-7xl mx-auto px-4 md:px-6 py-10 pb-32">
        <div className="mb-10">
          <span className="font-label text-xs font-semibold tracking-widest text-on-surface-variant uppercase mb-2 block">Super Admin</span>
          <h2 className="font-headline font-extrabold text-3xl md:text-4xl text-on-surface tracking-tight">All Users</h2>
          <p className="text-on-surface-variant text-sm mt-2">{totalCount} users total</p>
        </div>

        {success && (
          <div className="bg-tertiary/10 text-tertiary px-4 py-3 rounded-lg mb-6 flex items-center gap-2">
            <span className="material-symbols-outlined text-sm">check_circle</span>
            <span className="text-sm font-medium">{success}</span>
            <button onClick={() => setSuccess(null)} className="ml-auto"><span className="material-symbols-outlined text-sm">close</span></button>
          </div>
        )}

        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-lg">search</span>
            <input type="text" placeholder="Search by name or email..." value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-3 rounded-lg bg-surface-container-lowest text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
          </div>
          <select value={roleFilter} onChange={e => setRoleFilter(e.target.value)}
            className="px-4 py-3 rounded-lg bg-surface-container-lowest text-sm focus:outline-none focus:ring-2 focus:ring-primary">
            <option value="">All Roles</option>
            <option value="admin">Admin</option>
            <option value="principal">Principal</option>
            <option value="teacher">Teacher</option>
            <option value="student">Student</option>
          </select>
          <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
            className="px-4 py-3 rounded-lg bg-surface-container-lowest text-sm focus:outline-none focus:ring-2 focus:ring-primary">
            <option value="">All Statuses</option>
            <option value="true">Active</option>
            <option value="false">Inactive</option>
          </select>
        </div>

        <div className="bg-surface-container-low rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[700px]">
              <thead>
                <tr className="bg-surface-container-low border-b border-outline-variant/10">
                  <th className="px-6 py-4 font-label text-xs font-bold text-on-surface-variant uppercase tracking-widest">User</th>
                  <th className="px-6 py-4 font-label text-xs font-bold text-on-surface-variant uppercase tracking-widest">Email</th>
                  <th className="px-6 py-4 font-label text-xs font-bold text-on-surface-variant uppercase tracking-widest">Role</th>
                  <th className="px-6 py-4 font-label text-xs font-bold text-on-surface-variant uppercase tracking-widest">Status</th>
                  <th className="px-6 py-4 font-label text-xs font-bold text-on-surface-variant uppercase tracking-widest">Joined</th>
                  <th className="px-6 py-4 font-label text-xs font-bold text-on-surface-variant uppercase tracking-widest text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-surface-container-lowest">
                {loading ? (
                  Array.from({ length: 5 }).map((_, i) => <SkeletonTableRow key={i} cols={6} />)
                ) : users.length === 0 ? (
                  <tr><td colSpan={6} className="px-6 py-12 text-center text-on-surface-variant">No users found.</td></tr>
                ) : (
                  users.map((u) => (
                    <tr key={u.id} className="hover:bg-surface transition-colors border-b border-outline-variant/5">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-lg flex items-center justify-center font-bold text-sm ${ROLE_COLORS[u.role] || 'bg-surface-container-high text-on-surface'}`}>
                            {u.first_name[0]}{u.last_name[0]}
                          </div>
                          <span className="font-bold text-sm">{u.full_name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-on-surface-variant">{u.email}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider ${ROLE_COLORS[u.role] || ''}`}>
                          {ROLE_LABELS[u.role] || u.role}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider ${u.is_active ? 'bg-tertiary/10 text-tertiary' : 'bg-error/10 text-error'}`}>
                          {u.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-on-surface-variant">{new Date(u.date_joined).toLocaleDateString()}</td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex gap-1 justify-end">
                          <button onClick={() => toggleActive(u)} className="p-2 hover:bg-surface-container-high rounded transition-colors">
                            <span className="material-symbols-outlined text-on-surface-variant text-lg">{u.is_active ? 'person_off' : 'person'}</span>
                          </button>
                          <button onClick={() => resetPassword(u)} className="p-2 hover:bg-surface-container-high rounded transition-colors">
                            <span className="material-symbols-outlined text-on-surface-variant text-lg">lock_reset</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </PageLayout>
  )
}
