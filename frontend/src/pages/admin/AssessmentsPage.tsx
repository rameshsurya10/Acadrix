import { useState, useEffect } from 'react'
import PageLayout from '@/components/layout/PageLayout'
import { adminService, type AssessmentItem, type AssessmentStats } from '@/services/admin/adminService'
import { Bone, SkeletonTableRow } from '@/components/shared/Skeleton'

const STATUS_STYLES: Record<string, { dot: string; text: string; label: string }> = {
  live:              { dot: 'bg-tertiary',           text: 'text-tertiary',           label: 'Live' },
  draft:             { dot: 'bg-outline',            text: 'text-on-surface-variant', label: 'Draft' },
  scheduled:         { dot: 'bg-primary-container',  text: 'text-primary',            label: 'Scheduled' },
  pending_approval:  { dot: 'bg-error animate-pulse',text: 'text-error',              label: 'Overdue Approval' },
  completed:         { dot: 'bg-secondary',          text: 'text-secondary',          label: 'Completed' },
}

const SUBJECT_ICONS: Record<string, string> = {
  science: 'science', physics: 'science', chemistry: 'science', biology: 'biotech',
  math: 'calculate', mathematics: 'calculate', calculus: 'calculate', algebra: 'calculate',
  english: 'history_edu', literature: 'history_edu', history: 'history_edu',
  computer: 'computer', art: 'palette', music: 'music_note',
}

function getSubjectIcon(name: string | null) {
  if (!name) return 'quiz'
  const lower = name.toLowerCase()
  for (const [key, icon] of Object.entries(SUBJECT_ICONS)) {
    if (lower.includes(key)) return icon
  }
  return 'quiz'
}

export default function AssessmentsPage() {
  const [assessments, setAssessments] = useState<AssessmentItem[]>([])
  const [stats, setStats] = useState<AssessmentStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')

  useEffect(() => {
    async function load() {
      setLoading(true)
      try {
        const params: Record<string, string> = {}
        if (search) params.search = search
        if (statusFilter) params.status = statusFilter
        const result = await adminService.getAssessments(params)
        setAssessments(result.data)
        setStats(result.stats)
      } catch (err) {
        console.error('Failed to load assessments:', err)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [search, statusFilter])

  function formatDate(d: string | null) {
    if (!d) return 'TBD'
    return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  }

  return (
    <PageLayout sidebar>
      <main className="pb-20 md:pb-0">
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-6 md:py-10 space-y-8 md:space-y-12">
          {/* Header */}
          <div className="space-y-2">
            <p className="text-xs font-bold tracking-[0.2em] text-primary uppercase font-label">Administrative Oversight</p>
            <h3 className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-on-surface font-headline leading-tight">Assessment Oversight</h3>
          </div>

          <section className="grid grid-cols-1 md:grid-cols-12 gap-6 md:gap-8">
            {/* Stats */}
            {loading ? (
              <>
                <div className="md:col-span-8">
                  <Bone className="w-full h-60 rounded-lg" />
                </div>
                <div className="md:col-span-4">
                  <Bone className="w-full h-60 rounded-lg" />
                </div>
              </>
            ) : stats && (
              <>
                <div className="md:col-span-8 bg-surface-container-lowest rounded-lg p-6 md:p-8 flex flex-col justify-between min-h-[200px] md:min-h-[240px] relative overflow-hidden group">
                  <div className="relative z-10">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant/60 font-label">Institutional Health</span>
                    <h4 className="text-xl md:text-2xl font-bold mt-2 font-headline">Assessment Ecosystem</h4>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 relative z-10 mt-6 md:mt-8">
                    <div>
                      <p className="text-2xl md:text-3xl font-extrabold text-primary font-headline">{stats.total}</p>
                      <p className="text-xs text-on-surface-variant font-medium">Total Tests</p>
                    </div>
                    <div>
                      <p className="text-2xl md:text-3xl font-extrabold text-tertiary font-headline">{stats.drafts}</p>
                      <p className="text-xs text-on-surface-variant font-medium">Drafts</p>
                    </div>
                    <div>
                      <p className="text-2xl md:text-3xl font-extrabold text-on-surface font-headline">{stats.live}</p>
                      <p className="text-xs text-on-surface-variant font-medium">Active (Live)</p>
                    </div>
                    <div>
                      <p className="text-2xl md:text-3xl font-extrabold text-secondary font-headline">{stats.completed}</p>
                      <p className="text-xs text-on-surface-variant font-medium">Completed</p>
                    </div>
                  </div>
                  <div className="absolute -right-10 -bottom-10 opacity-5 group-hover:opacity-10 transition-opacity">
                    <span className="material-symbols-outlined text-[160px] md:text-[200px]" style={{ fontVariationSettings: "'FILL' 1" }}>analytics</span>
                  </div>
                </div>

                <div className="md:col-span-4 bg-primary rounded-lg p-6 md:p-8 text-on-primary flex flex-col justify-center gap-4 md:gap-6 shadow-xl shadow-primary/20 bg-gradient-to-br from-primary to-primary-container">
                  <h4 className="text-lg md:text-xl font-bold font-headline">Quick Actions</h4>
                  <p className="text-sm opacity-90 leading-relaxed">
                    {stats.pending_approval > 0
                      ? `${stats.pending_approval} assessments need your approval.`
                      : 'All assessments are up to date.'}
                  </p>
                  <div className="space-y-3">
                    {stats.pending_approval > 0 && (
                      <button
                        onClick={() => setStatusFilter('pending_approval')}
                        className="w-full py-3 px-4 bg-white text-primary font-bold rounded-lg text-sm flex items-center justify-center gap-2 hover:bg-surface-container-lowest transition-all"
                      >
                        <span className="material-symbols-outlined text-sm">warning</span>
                        Review Pending ({stats.pending_approval})
                      </button>
                    )}
                    <button
                      onClick={() => setStatusFilter('draft')}
                      className="w-full py-3 px-4 border border-white/30 text-white font-bold rounded-lg text-sm flex items-center justify-center gap-2 hover:bg-white/10 transition-all"
                    >
                      <span className="material-symbols-outlined text-sm">visibility</span>
                      View Drafts ({stats.drafts})
                    </button>
                  </div>
                </div>
              </>
            )}

            {/* Master Test Inventory */}
            <div className="md:col-span-12 space-y-6">
              <div className="flex flex-col md:flex-row items-start md:items-end justify-between border-b border-outline-variant/20 pb-4 gap-4">
                <div className="space-y-1">
                  <h5 className="text-lg md:text-xl font-bold font-headline">Master Test Inventory</h5>
                  <p className="text-sm text-on-surface-variant">Real-time oversight of all assessments</p>
                </div>
                <div className="flex gap-3 md:gap-4 flex-wrap w-full md:w-auto">
                  <div className="bg-surface-container-low px-4 py-2 rounded-full flex items-center gap-2 flex-1 md:flex-none">
                    <span className="material-symbols-outlined text-sm text-on-surface-variant">search</span>
                    <input
                      className="bg-transparent border-none text-xs focus:ring-0 w-full md:w-48 text-on-surface"
                      placeholder="Search by teacher or title..."
                      type="text"
                      value={search}
                      onChange={e => setSearch(e.target.value)}
                    />
                  </div>
                  <select
                    className="bg-surface-container-high p-2 rounded-full text-xs border-none focus:ring-primary cursor-pointer"
                    value={statusFilter}
                    onChange={e => setStatusFilter(e.target.value)}
                  >
                    <option value="">All Status</option>
                    <option value="live">Live</option>
                    <option value="draft">Draft</option>
                    <option value="scheduled">Scheduled</option>
                    <option value="pending_approval">Pending Approval</option>
                    <option value="completed">Completed</option>
                  </select>
                </div>
              </div>

              <div className="overflow-x-auto -mx-4 md:mx-0">
                <table className="w-full border-separate border-spacing-y-2 min-w-[700px]">
                  <thead>
                    <tr className="text-left bg-surface-container-low">
                      <th className="px-4 md:px-6 py-4 text-xs font-bold uppercase tracking-widest text-on-surface-variant/70 font-label rounded-l-lg">Assessment Title</th>
                      <th className="px-4 md:px-6 py-4 text-xs font-bold uppercase tracking-widest text-on-surface-variant/70 font-label">Faculty</th>
                      <th className="px-4 md:px-6 py-4 text-xs font-bold uppercase tracking-widest text-on-surface-variant/70 font-label hidden md:table-cell">Class</th>
                      <th className="px-4 md:px-6 py-4 text-xs font-bold uppercase tracking-widest text-on-surface-variant/70 font-label">Status</th>
                      <th className="px-4 md:px-6 py-4 text-xs font-bold uppercase tracking-widest text-on-surface-variant/70 font-label hidden md:table-cell">Date</th>
                      <th className="px-4 md:px-6 py-4 text-xs font-bold uppercase tracking-widest text-on-surface-variant/70 font-label rounded-r-lg">Marks</th>
                    </tr>
                  </thead>
                  <tbody className="text-sm">
                    {loading ? (
                      Array.from({ length: 4 }).map((_, i) => <SkeletonTableRow key={i} cols={6} />)
                    ) : assessments.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="px-6 py-12 text-center text-on-surface-variant">
                          No assessments found.{statusFilter && ' Try clearing the filter.'}
                        </td>
                      </tr>
                    ) : (
                      assessments.map(a => {
                        const st = STATUS_STYLES[a.status] || { dot: 'bg-outline', text: 'text-on-surface-variant', label: a.status }
                        const isAlert = a.status === 'pending_approval'
                        return (
                          <tr key={a.id} className={`${isAlert ? 'bg-error-container/20 hover:bg-error-container/30' : 'bg-surface-container-lowest hover:bg-surface'} transition-colors group`}>
                            <td className="px-4 md:px-6 py-4 md:py-5 rounded-l-lg">
                              <div className="flex items-center gap-3">
                                <div className={`w-8 h-8 rounded flex items-center justify-center ${isAlert ? 'bg-error/10 text-error' : 'bg-primary/10 text-primary'}`}>
                                  <span className="material-symbols-outlined text-lg">{isAlert ? 'warning' : getSubjectIcon(a.subject_name)}</span>
                                </div>
                                <span className="font-semibold text-on-surface">{a.title}</span>
                              </div>
                            </td>
                            <td className="px-4 md:px-6 py-4 md:py-5 text-on-surface-variant">{a.teacher_name || '—'}</td>
                            <td className="px-4 md:px-6 py-4 md:py-5 hidden md:table-cell">
                              {a.subject_name && (
                                <span className="text-xs px-3 py-1 bg-secondary-container text-on-secondary-container rounded-full font-medium">
                                  {a.subject_name}{a.section ? ` / ${a.section}` : ''}
                                </span>
                              )}
                            </td>
                            <td className="px-4 md:px-6 py-4 md:py-5">
                              <div className="flex items-center gap-2">
                                <span className={`w-2 h-2 rounded-full ${st.dot}`} />
                                <span className={`${st.text} font-bold text-xs uppercase tracking-tighter`}>{st.label}</span>
                              </div>
                            </td>
                            <td className="px-4 md:px-6 py-4 md:py-5 text-on-surface-variant hidden md:table-cell">{formatDate(a.scheduled_date)}</td>
                            <td className="px-4 md:px-6 py-4 md:py-5 rounded-r-lg font-semibold">{a.total_marks}</td>
                          </tr>
                        )
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </section>
        </div>
      </main>
    </PageLayout>
  )
}
