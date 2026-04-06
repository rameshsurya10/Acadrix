import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import PageLayout from '@/components/layout/PageLayout'
import { adminService, type DashboardStats, type FacultyMember, type AdmissionApplicationListItem } from '@/services/admin/adminService'
import { Bone, SkeletonMetricCard, SkeletonTableRow } from '@/components/shared/Skeleton'

export default function AdminDashboardPage() {
  const navigate = useNavigate()
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [faculty, setFaculty] = useState<FacultyMember[]>([])
  const [applications, setApplications] = useState<AdmissionApplicationListItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      try {
        const [s, f, a] = await Promise.all([
          adminService.getDashboardStats(),
          adminService.getFaculty(),
          adminService.getApplications({ ordering: '-applied_at', page_size: '3' }),
        ])
        setStats(s)
        setFaculty(f.slice(0, 5))
        setApplications(a.results.slice(0, 3))
      } catch (err) {
        console.error('Dashboard load failed:', err)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  function getInitials(name: string) {
    return name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
  }

  function getStatusColor(status: string) {
    switch (status) {
      case 'verified': case 'approved': case 'finalized': return 'tertiary'
      case 'pending': return 'primary'
      case 'missing_documents': case 'rejected': return 'error'
      default: return 'outline'
    }
  }

  function getStatusLabel(status: string) {
    return status.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
  }

  function timeSince(dateStr: string) {
    const diff = Date.now() - new Date(dateStr).getTime()
    const hours = Math.floor(diff / 3600000)
    if (hours < 1) return 'Just now'
    if (hours < 24) return `${hours}h ago`
    const days = Math.floor(hours / 24)
    return `${days}d ago`
  }

  return (
    <PageLayout>
      <main className="max-w-7xl mx-auto px-4 md:px-6 py-10 pb-32">
        <div className="mb-10">
          <span className="font-label text-xs font-semibold tracking-widest text-on-surface-variant uppercase mb-2 block">Administrative Portal</span>
          <h2 className="font-headline font-extrabold text-3xl md:text-4xl text-on-surface tracking-tight">Institutional Oversight</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 md:gap-8">
          {/* Metric Cards */}
          {loading ? (
            <>
              <div className="md:col-span-8 grid grid-cols-1 sm:grid-cols-3 gap-4">
                <SkeletonMetricCard />
                <SkeletonMetricCard />
                <SkeletonMetricCard />
              </div>
              <div className="md:col-span-4"><Bone className="w-full h-44 rounded-xl" /></div>
            </>
          ) : stats && (
            <>
              <div className="md:col-span-8 grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-surface-container-lowest p-6 rounded-xl">
                  <p className="font-label text-xs font-medium text-on-surface-variant uppercase tracking-wider mb-4">Active Teachers</p>
                  <div className="flex items-end justify-between">
                    <span className="font-headline font-bold text-3xl">{stats.total_teachers}</span>
                    <span className="material-symbols-outlined text-tertiary text-lg">groups</span>
                  </div>
                </div>
                <div className="bg-surface-container-lowest p-6 rounded-xl">
                  <p className="font-label text-xs font-medium text-on-surface-variant uppercase tracking-wider mb-4">Pending Admissions</p>
                  <div className="flex items-end justify-between">
                    <span className="font-headline font-bold text-3xl">{stats.pending_admissions}</span>
                    {stats.pending_admissions > 0 && <div className="w-2 h-2 rounded-full bg-error animate-pulse" />}
                  </div>
                </div>
                <div className="bg-primary bg-gradient-to-br from-primary to-primary-container p-6 rounded-xl text-on-primary">
                  <p className="font-label text-xs font-medium text-on-primary/80 uppercase tracking-wider mb-4">Capacity</p>
                  <div className="flex items-end justify-between">
                    <span className="font-headline font-bold text-3xl">{stats.capacity_percent}%</span>
                    <span className="material-symbols-outlined opacity-50">analytics</span>
                  </div>
                </div>
              </div>
              <div className="md:col-span-4 bg-secondary-container p-6 rounded-xl flex flex-col justify-between">
                <div>
                  <h3 className="font-headline font-bold text-xl text-on-secondary-container mb-2">Quick Stats</h3>
                  <p className="text-sm text-on-secondary-container/80 leading-relaxed mb-4">
                    {stats.total_students} students enrolled across {stats.total_capacity} total seats.
                    {stats.unread_notifications > 0 && ` You have ${stats.unread_notifications} unread notifications.`}
                  </p>
                </div>
                <button
                  onClick={() => navigate('/admin/enrollment')}
                  className="bg-on-secondary-container text-surface-container-lowest py-3 px-6 rounded-lg font-bold text-sm hover:opacity-90 transition-opacity"
                >
                  Enroll New
                </button>
              </div>
            </>
          )}

          {/* Faculty Directory */}
          <section className="md:col-span-12">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
              <div>
                <h3 className="font-headline font-bold text-xl md:text-2xl">Faculty Directory</h3>
                <p className="text-on-surface-variant text-sm mt-1">Manage departmental roles and credentials.</p>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => navigate('/faculty')}
                  className="bg-surface-container-high text-on-surface px-4 py-2 rounded-lg font-bold text-sm flex items-center gap-2 hover:bg-surface-container-highest transition-colors"
                >
                  <span className="material-symbols-outlined text-sm">visibility</span> View All
                </button>
                <button
                  onClick={() => navigate('/admin/enrollment')}
                  className="bg-primary text-on-primary px-4 py-2 rounded-lg font-bold text-sm flex items-center gap-2 hover:opacity-90 transition-all active:scale-95"
                >
                  <span className="material-symbols-outlined text-sm">add</span> Add Faculty
                </button>
              </div>
            </div>
            <div className="bg-surface-container-low rounded-xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse min-w-[600px]">
                  <thead>
                    <tr className="bg-surface-container-low border-b border-outline-variant/10">
                      <th className="px-6 py-4 font-label text-xs font-bold text-on-surface-variant uppercase tracking-widest">Faculty Member</th>
                      <th className="px-6 py-4 font-label text-xs font-bold text-on-surface-variant uppercase tracking-widest">Department</th>
                      <th className="px-6 py-4 font-label text-xs font-bold text-on-surface-variant uppercase tracking-widest">Status</th>
                      <th className="px-6 py-4 font-label text-xs font-bold text-on-surface-variant uppercase tracking-widest text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-surface-container-lowest">
                    {loading ? (
                      <>
                        <SkeletonTableRow cols={4} />
                        <SkeletonTableRow cols={4} />
                        <SkeletonTableRow cols={4} />
                      </>
                    ) : faculty.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="px-6 py-12 text-center text-on-surface-variant">
                          No faculty members found. <button onClick={() => navigate('/admin/enrollment')} className="text-primary font-bold hover:underline">Enroll a teacher</button>
                        </td>
                      </tr>
                    ) : (
                      faculty.map((f) => (
                        <tr key={f.id} className="hover:bg-surface transition-colors border-b border-outline-variant/5">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              {f.avatar_url ? (
                                <img src={f.avatar_url} alt={f.name} className="w-10 h-10 rounded-lg object-cover" />
                              ) : (
                                <div className="w-10 h-10 rounded-lg bg-secondary-fixed flex items-center justify-center font-bold text-on-secondary-fixed text-sm">
                                  {getInitials(f.name)}
                                </div>
                              )}
                              <div>
                                <p className="font-bold text-sm">{f.name}</p>
                                <p className="text-xs text-on-surface-variant">{f.title || 'Faculty'}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4"><span className="text-sm font-medium">{f.department || '—'}</span></td>
                          <td className="px-6 py-4">
                            <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider ${
                              f.employment_status === 'full_time' ? 'bg-tertiary/10 text-tertiary' :
                              f.employment_status === 'part_time' ? 'bg-primary/10 text-primary' :
                              'bg-on-surface-variant/10 text-on-surface-variant'
                            }`}>
                              {f.employment_status?.replace('_', ' ') || 'Active'}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <button
                              onClick={() => navigate(`/faculty/${f.id}`)}
                              className="p-2 hover:bg-surface-container-high rounded transition-colors"
                            >
                              <span className="material-symbols-outlined text-on-surface-variant">visibility</span>
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </section>

          {/* Admissions Pipeline */}
          <section className="md:col-span-12 mt-4">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
              <div>
                <h3 className="font-headline font-bold text-xl md:text-2xl">Recent Admissions</h3>
                <p className="text-on-surface-variant text-sm mt-1">Latest enrollment applications.</p>
              </div>
              <button
                onClick={() => navigate('/admin/admissions')}
                className="text-primary font-bold text-sm hover:underline mt-2 md:mt-0"
              >
                View All Applications
              </button>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {loading ? (
                <>
                  <Bone className="h-52 rounded-xl" />
                  <Bone className="h-52 rounded-xl" />
                  <Bone className="h-52 rounded-xl" />
                </>
              ) : applications.length === 0 ? (
                <div className="lg:col-span-3 bg-surface-container-low p-8 rounded-xl text-center">
                  <span className="material-symbols-outlined text-4xl text-on-surface-variant mb-2">inbox</span>
                  <p className="text-on-surface-variant">No recent applications.</p>
                </div>
              ) : (
                <>
                  {applications.map((app) => (
                    <div
                      key={app.id}
                      className="bg-surface-container-lowest p-6 rounded-xl border-l-4 cursor-pointer hover:shadow-md transition-shadow"
                      style={{ borderColor: `var(--color-${getStatusColor(app.status)})` }}
                      onClick={() => navigate('/admin/admissions')}
                    >
                      <div className="flex justify-between items-start mb-4">
                        <span className={`bg-${getStatusColor(app.status)}-fixed text-on-${getStatusColor(app.status)}-fixed-variant px-2 py-1 rounded text-[10px] font-bold uppercase tracking-widest`}>
                          {getStatusLabel(app.status)}
                        </span>
                        <span className="text-xs text-on-surface-variant font-medium">{timeSince(app.applied_at)}</span>
                      </div>
                      <h4 className="font-bold text-lg mb-1">{app.applicant_name}</h4>
                      <p className="text-xs text-on-surface-variant mb-2">{app.grade_label || app.program || 'General'}</p>
                      <p className="text-xs text-on-surface-variant">ID: {app.application_id}</p>
                    </div>
                  ))}
                  <div
                    onClick={() => navigate('/admin/admissions')}
                    className="bg-surface-container-low p-6 rounded-xl border-2 border-dashed border-outline-variant flex flex-col items-center justify-center text-center cursor-pointer hover:bg-surface-container-high transition-colors"
                  >
                    <div className="w-12 h-12 rounded-full bg-surface-container-lowest flex items-center justify-center mb-4 shadow-sm">
                      <span className="material-symbols-outlined text-primary">person_add</span>
                    </div>
                    <h4 className="font-bold text-lg mb-1">New Enrollment</h4>
                    <p className="text-xs text-on-surface-variant">Initiate a new student admission.</p>
                  </div>
                </>
              )}
            </div>
          </section>
        </div>
      </main>
    </PageLayout>
  )
}
