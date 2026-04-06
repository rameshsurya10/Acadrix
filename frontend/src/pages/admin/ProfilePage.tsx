import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import PageLayout from '@/components/layout/PageLayout'
import { useAuth } from '@/contexts/AuthContext'
import { adminService, type DashboardStats, type AdminNotification } from '@/services/admin/adminService'
import { Bone, SkeletonProfileHeader, SkeletonMetricCard, SkeletonMessageCard } from '@/components/shared/Skeleton'

export default function AdminProfilePage() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [notifications, setNotifications] = useState<AdminNotification[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      try {
        const [s, n] = await Promise.all([
          adminService.getDashboardStats(),
          adminService.getNotifications({ ordering: '-created_at' }),
        ])
        setStats(s)
        setNotifications(n.results.slice(0, 5))
      } catch (err) {
        console.error('Profile load failed:', err)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  async function handleMarkAllRead() {
    try {
      await adminService.markAllNotificationsRead()
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })))
    } catch (err) {
      console.error('Failed to mark all read:', err)
    }
  }

  async function handleMarkRead(id: number) {
    try {
      await adminService.markNotificationRead(id)
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n))
    } catch (err) {
      console.error('Failed to mark read:', err)
    }
  }

  function timeSince(dateStr: string) {
    const diff = Date.now() - new Date(dateStr).getTime()
    const mins = Math.floor(diff / 60000)
    if (mins < 60) return `${mins}m ago`
    const hours = Math.floor(mins / 60)
    if (hours < 24) return `${hours}h ago`
    const days = Math.floor(hours / 24)
    return `${days}d ago`
  }

  function getInitials(name: string) {
    return name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
  }

  const CATEGORY_ICONS: Record<string, { icon: string; bg: string }> = {
    audit:       { icon: 'gavel',         bg: 'bg-secondary-fixed' },
    board:       { icon: 'gavel',         bg: 'bg-secondary-fixed' },
    maintenance: { icon: 'campaign',      bg: 'bg-primary-fixed' },
    system:      { icon: 'campaign',      bg: 'bg-primary-fixed' },
    contract:    { icon: 'assignment_ind',bg: 'bg-surface-container-high' },
    hr:          { icon: 'assignment_ind',bg: 'bg-surface-container-high' },
  }

  return (
    <PageLayout>
      <main className="max-w-7xl mx-auto px-4 md:px-6 py-6 md:py-8 pb-32">
        {/* Profile Header */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 mb-8 md:mb-10">
          {loading ? (
            <>
              <div className="md:col-span-2"><SkeletonProfileHeader /></div>
              <Bone className="h-64 rounded-xl" />
            </>
          ) : (
            <>
              <div className="md:col-span-2 bg-surface-container-lowest rounded-xl p-6 md:p-8 flex flex-col md:flex-row gap-6 md:gap-8 items-start relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full -mr-32 -mt-32" />
                <div className="relative z-10 w-24 h-24 md:w-40 md:h-40 rounded-2xl overflow-hidden shadow-sm bg-primary/10 flex items-center justify-center">
                  {user?.avatar_url ? (
                    <img src={user.avatar_url} alt={user.full_name} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-3xl md:text-5xl font-bold text-primary">{user ? getInitials(user.full_name) : '?'}</span>
                  )}
                </div>
                <div className="relative z-10 flex-1">
                  <div className="inline-block px-3 py-1 bg-secondary-fixed text-on-secondary-fixed-variant rounded-full text-[10px] font-bold uppercase tracking-widest mb-3 md:mb-4">
                    Super Administrator
                  </div>
                  <h1 className="text-2xl md:text-4xl font-headline font-extrabold text-on-surface mb-1 md:mb-2">{user?.full_name || 'Admin'}</h1>
                  <p className="text-on-surface-variant font-medium text-base md:text-lg mb-4 md:mb-6">{user?.email}</p>
                  <div className="grid grid-cols-2 gap-3 md:gap-4">
                    <div className="p-3 md:p-4 bg-surface-container-low rounded-lg">
                      <p className="text-[10px] font-label font-bold uppercase text-outline mb-1 tracking-wider">Role</p>
                      <p className="text-on-surface font-semibold text-sm">Super Admin</p>
                    </div>
                    <div className="p-3 md:p-4 bg-surface-container-low rounded-lg">
                      <p className="text-[10px] font-label font-bold uppercase text-outline mb-1 tracking-wider">ID</p>
                      <p className="text-on-surface font-semibold text-sm">#{user?.id || '—'}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Permissions Card */}
              <div className="bg-surface-container-lowest rounded-xl p-5 md:p-6">
                <h3 className="text-sm font-label font-bold uppercase text-outline tracking-widest mb-4 md:mb-6">System Permissions</h3>
                <div className="space-y-3 md:space-y-4">
                  {[
                    { icon: 'account_balance', label: 'Financial Authority' },
                    { icon: 'group_add', label: 'HR Management' },
                    { icon: 'clinical_notes', label: 'Curriculum Audit' },
                    { icon: 'shield', label: 'System Administration' },
                  ].map(perm => (
                    <div key={perm.label} className="flex items-center justify-between p-3 bg-surface-container-low rounded-lg">
                      <div className="flex items-center gap-3">
                        <span className="material-symbols-outlined text-primary text-xl">{perm.icon}</span>
                        <span className="text-sm font-medium">{perm.label}</span>
                      </div>
                      <span className="material-symbols-outlined text-tertiary text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>verified</span>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </section>

        {/* Oversight Stats */}
        <section className="mb-8 md:mb-10">
          <h2 className="text-xl md:text-2xl font-headline font-bold text-on-surface mb-4 md:mb-6 flex items-center gap-2">
            <span className="material-symbols-outlined text-primary">analytics</span>
            Institutional Oversight
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {loading ? (
              Array.from({ length: 4 }).map((_, i) => <SkeletonMetricCard key={i} />)
            ) : stats && (
              <>
                <div className="bg-surface-container-lowest rounded-xl p-4 md:p-6 border-l-4 border-primary shadow-sm">
                  <p className="text-[10px] font-label font-bold uppercase text-outline tracking-wider mb-2">Total Students</p>
                  <h4 className="text-xl md:text-2xl font-headline font-extrabold text-on-surface">{stats.total_students}</h4>
                </div>
                <div className="bg-surface-container-lowest rounded-xl p-4 md:p-6 border-l-4 border-primary-container shadow-sm">
                  <p className="text-[10px] font-label font-bold uppercase text-outline tracking-wider mb-2">Total Teachers</p>
                  <h4 className="text-xl md:text-2xl font-headline font-extrabold text-on-surface">{stats.total_teachers}</h4>
                  <div className="mt-3 md:mt-4 w-full bg-surface-container-low h-1.5 rounded-full overflow-hidden">
                    <div className="bg-primary-container h-full" style={{ width: `${stats.capacity_percent}%` }} />
                  </div>
                </div>
                <div className="bg-surface-container-lowest rounded-xl p-4 md:p-6 border-l-4 border-secondary shadow-sm">
                  <p className="text-[10px] font-label font-bold uppercase text-outline tracking-wider mb-2">Pending Admissions</p>
                  <h4 className="text-xl md:text-2xl font-headline font-extrabold text-on-surface">{stats.pending_admissions}</h4>
                </div>
                <div className="bg-surface-container-lowest rounded-xl p-4 md:p-6 border-l-4 border-tertiary shadow-sm">
                  <p className="text-[10px] font-label font-bold uppercase text-outline tracking-wider mb-2">Capacity</p>
                  <h4 className="text-xl md:text-2xl font-headline font-extrabold text-tertiary">{stats.capacity_percent}%</h4>
                  <p className="mt-2 md:mt-4 text-xs font-medium text-on-surface-variant">{stats.total_capacity} total seats</p>
                </div>
              </>
            )}
          </div>
        </section>

        {/* Notifications & Quick Actions */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
          <div className="lg:col-span-2">
            <div className="flex items-center justify-between mb-4 md:mb-6">
              <h2 className="text-xl md:text-2xl font-headline font-bold text-on-surface flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">notifications</span>
                Notifications
              </h2>
              {notifications.some(n => !n.is_read) && (
                <button onClick={handleMarkAllRead} className="text-primary font-bold text-sm hover:underline">Mark all read</button>
              )}
            </div>
            <div className="space-y-3 md:space-y-4">
              {loading ? (
                Array.from({ length: 3 }).map((_, i) => <SkeletonMessageCard key={i} />)
              ) : notifications.length === 0 ? (
                <div className="bg-surface-container-lowest p-8 md:p-12 rounded-xl text-center">
                  <span className="material-symbols-outlined text-3xl text-on-surface-variant mb-2 block">notifications_off</span>
                  <p className="text-on-surface-variant">No notifications yet.</p>
                </div>
              ) : (
                notifications.map(notif => {
                  const cat = CATEGORY_ICONS[notif.category] || CATEGORY_ICONS.system
                  return (
                    <div
                      key={notif.id}
                      onClick={() => handleMarkRead(notif.id)}
                      className={`bg-surface-container-lowest p-4 md:p-6 rounded-xl flex items-start gap-3 md:gap-4 hover:shadow-md transition-shadow cursor-pointer group ${notif.is_read ? 'opacity-60' : ''}`}
                    >
                      <div className={`w-10 h-10 md:w-12 md:h-12 rounded-full ${cat.bg} flex items-center justify-center flex-shrink-0`}>
                        <span className="material-symbols-outlined">{cat.icon}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1 gap-2">
                          <h4 className="font-bold text-on-surface group-hover:text-primary transition-colors truncate text-sm">{notif.title}</h4>
                          <span className="text-[10px] font-medium text-outline flex-shrink-0">{timeSince(notif.created_at).toUpperCase()}</span>
                        </div>
                        <p className="text-sm text-on-surface-variant line-clamp-2">{notif.body}</p>
                        <div className="mt-2 md:mt-3 flex items-center gap-2">
                          {notif.priority === 'high' && (
                            <span className="px-2 py-0.5 bg-error-container text-on-error-container text-[10px] font-bold rounded uppercase">High Priority</span>
                          )}
                          <span className="px-2 py-0.5 bg-surface-container-high text-on-surface-variant text-[10px] font-bold rounded uppercase">{notif.category}</span>
                        </div>
                      </div>
                    </div>
                  )
                })
              )}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="space-y-4 md:space-y-6">
            <h2 className="text-lg md:text-xl font-headline font-bold text-on-surface">Administrative Tools</h2>
            <div className="bg-surface-container-lowest rounded-xl p-4 md:p-6">
              <div className="grid grid-cols-2 gap-3">
                {[
                  { icon: 'school', label: 'Students', path: '/admin/students' },
                  { icon: 'person_add', label: 'Enroll', path: '/admin/enrollment' },
                  { icon: 'groups', label: 'Faculty', path: '/faculty' },
                  { icon: 'receipt_long', label: 'Billing', path: '/admin/finance' },
                ].map(tool => (
                  <button
                    key={tool.label}
                    onClick={() => navigate(tool.path)}
                    className="flex flex-col items-center justify-center p-3 md:p-4 bg-surface-container-low rounded-lg hover:bg-primary-fixed group transition-all"
                  >
                    <span className="material-symbols-outlined text-primary mb-2 group-hover:scale-110 transition-transform">{tool.icon}</span>
                    <span className="text-[10px] font-bold uppercase tracking-tighter">{tool.label}</span>
                  </button>
                ))}
              </div>
            </div>
            <div className="bg-primary p-5 md:p-6 rounded-xl text-on-primary">
              <h5 className="font-headline font-bold mb-2">Quick Actions</h5>
              <p className="text-sm opacity-90 mb-4">
                {stats && stats.pending_admissions > 0
                  ? `${stats.pending_admissions} admissions pending review.`
                  : 'All systems nominal.'}
              </p>
              <button
                onClick={() => navigate('/admin/admissions')}
                className="w-full py-2 bg-on-primary text-primary font-bold rounded-lg text-sm hover:bg-primary-fixed transition-colors"
              >
                Review Admissions
              </button>
            </div>
          </div>
        </section>
      </main>
    </PageLayout>
  )
}
