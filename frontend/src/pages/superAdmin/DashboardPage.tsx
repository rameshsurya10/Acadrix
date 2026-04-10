import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import PageLayout from '@/components/layout/PageLayout'
import { superAdminService, type DashboardStats } from '@/services/superAdmin/superAdminService'
import { Bone, SkeletonMetricCard } from '@/components/shared/Skeleton'

export default function SuperAdminDashboardPage() {
  const navigate = useNavigate()
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    superAdminService.getDashboardStats()
      .then(setStats)
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  function timeSince(dateStr: string) {
    const diff = Date.now() - new Date(dateStr).getTime()
    const hours = Math.floor(diff / 3600000)
    if (hours < 1) return 'Just now'
    if (hours < 24) return `${hours}h ago`
    return `${Math.floor(hours / 24)}d ago`
  }

  const ACTION_LABELS: Record<string, string> = {
    create_admin: 'Created Admin',
    create_principal: 'Created Principal',
    deactivate_user: 'Deactivated User',
    activate_user: 'Activated User',
    update_settings: 'Updated Settings',
    reset_password: 'Reset Password',
  }

  return (
    <PageLayout>
      <main className="max-w-7xl mx-auto px-4 md:px-6 py-10 pb-32">
        <div className="mb-10">
          <span className="font-label text-xs font-semibold tracking-widest text-on-surface-variant uppercase mb-2 block">Super Admin</span>
          <h2 className="font-headline font-extrabold text-3xl md:text-4xl text-on-surface tracking-tight">System Overview</h2>
        </div>

        {/* Metric Cards */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-10">
          {loading ? (
            Array.from({ length: 5 }).map((_, i) => <SkeletonMetricCard key={i} />)
          ) : stats && (
            <>
              <div className="bg-primary bg-gradient-to-br from-primary to-primary-container p-6 rounded-xl text-on-primary">
                <p className="font-label text-xs font-medium text-on-primary/80 uppercase tracking-wider mb-4">Total Users</p>
                <span className="font-headline font-bold text-3xl">{stats.total_users}</span>
              </div>
              <div className="bg-surface-container-lowest p-6 rounded-xl">
                <p className="font-label text-xs font-medium text-on-surface-variant uppercase tracking-wider mb-4">Admins</p>
                <div className="flex items-end justify-between">
                  <span className="font-headline font-bold text-3xl">{stats.admins}</span>
                  <span className="material-symbols-outlined text-primary text-lg">admin_panel_settings</span>
                </div>
              </div>
              <div className="bg-surface-container-lowest p-6 rounded-xl">
                <p className="font-label text-xs font-medium text-on-surface-variant uppercase tracking-wider mb-4">Principals</p>
                <div className="flex items-end justify-between">
                  <span className="font-headline font-bold text-3xl">{stats.principals}</span>
                  <span className="material-symbols-outlined text-secondary text-lg">supervised_user_circle</span>
                </div>
              </div>
              <div className="bg-surface-container-lowest p-6 rounded-xl">
                <p className="font-label text-xs font-medium text-on-surface-variant uppercase tracking-wider mb-4">Teachers</p>
                <div className="flex items-end justify-between">
                  <span className="font-headline font-bold text-3xl">{stats.teachers}</span>
                  <span className="material-symbols-outlined text-tertiary text-lg">groups</span>
                </div>
              </div>
              <div className="bg-surface-container-lowest p-6 rounded-xl">
                <p className="font-label text-xs font-medium text-on-surface-variant uppercase tracking-wider mb-4">Students</p>
                <div className="flex items-end justify-between">
                  <span className="font-headline font-bold text-3xl">{stats.students}</span>
                  <span className="material-symbols-outlined text-on-surface-variant text-lg">school</span>
                </div>
              </div>
            </>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Admins */}
          <section>
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-headline font-bold text-xl">Recent Admins</h3>
              <button onClick={() => navigate('/super-admin/admins')} className="text-primary font-bold text-sm hover:underline">View All</button>
            </div>
            <div className="bg-surface-container-lowest rounded-xl divide-y divide-outline-variant/10">
              {loading ? (
                Array.from({ length: 3 }).map((_, i) => <div key={i} className="p-4"><Bone className="h-12 rounded-lg" /></div>)
              ) : !stats?.recent_admins.length ? (
                <div className="p-8 text-center text-on-surface-variant">No admins enrolled yet.</div>
              ) : (
                stats.recent_admins.map((u) => (
                  <div key={u.id} className="p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center font-bold text-primary text-sm">
                        {u.first_name[0]}{u.last_name[0]}
                      </div>
                      <div>
                        <p className="font-bold text-sm">{u.first_name} {u.last_name}</p>
                        <p className="text-xs text-on-surface-variant">{u.email}</p>
                      </div>
                    </div>
                    <span className="text-xs text-on-surface-variant">{timeSince(u.date_joined)}</span>
                  </div>
                ))
              )}
            </div>
          </section>

          {/* Recent Principals */}
          <section>
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-headline font-bold text-xl">Recent Principals</h3>
              <button onClick={() => navigate('/super-admin/principals')} className="text-primary font-bold text-sm hover:underline">View All</button>
            </div>
            <div className="bg-surface-container-lowest rounded-xl divide-y divide-outline-variant/10">
              {loading ? (
                Array.from({ length: 3 }).map((_, i) => <div key={i} className="p-4"><Bone className="h-12 rounded-lg" /></div>)
              ) : !stats?.recent_principals.length ? (
                <div className="p-8 text-center text-on-surface-variant">No principals enrolled yet.</div>
              ) : (
                stats.recent_principals.map((u) => (
                  <div key={u.id} className="p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-secondary/10 flex items-center justify-center font-bold text-secondary text-sm">
                        {u.first_name[0]}{u.last_name[0]}
                      </div>
                      <div>
                        <p className="font-bold text-sm">{u.first_name} {u.last_name}</p>
                        <p className="text-xs text-on-surface-variant">{u.email}</p>
                      </div>
                    </div>
                    <span className="text-xs text-on-surface-variant">{timeSince(u.date_joined)}</span>
                  </div>
                ))
              )}
            </div>
          </section>

          {/* Recent Activity */}
          <section className="lg:col-span-2">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-headline font-bold text-xl">Recent Activity</h3>
              <button onClick={() => navigate('/super-admin/audit-logs')} className="text-primary font-bold text-sm hover:underline">View All</button>
            </div>
            <div className="bg-surface-container-lowest rounded-xl divide-y divide-outline-variant/10">
              {loading ? (
                Array.from({ length: 4 }).map((_, i) => <div key={i} className="p-4"><Bone className="h-10 rounded-lg" /></div>)
              ) : !stats?.recent_activity.length ? (
                <div className="p-8 text-center text-on-surface-variant">No activity yet.</div>
              ) : (
                stats.recent_activity.map((log) => (
                  <div key={log.id} className="p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="material-symbols-outlined text-on-surface-variant">history</span>
                      <div>
                        <p className="font-medium text-sm">
                          {ACTION_LABELS[log.action] || log.action}
                        </p>
                        <p className="text-xs text-on-surface-variant">{log.detail}</p>
                      </div>
                    </div>
                    <span className="text-xs text-on-surface-variant whitespace-nowrap">{timeSince(log.created_at)}</span>
                  </div>
                ))
              )}
            </div>
          </section>
        </div>
      </main>
    </PageLayout>
  )
}
