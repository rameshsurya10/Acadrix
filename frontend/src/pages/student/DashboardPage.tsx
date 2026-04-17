import PageLayout from '@/components/layout/PageLayout'
import { SkeletonDashboard } from '@/components/shared/Skeleton'
import { useAuth } from '@/contexts/AuthContext'
import { useStudentDashboard } from '@/hooks/queries/useStudentDashboard'

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function statusColor(status: string) {
  const s = status.toLowerCase()
  if (s === 'paid' || s === 'settled') return 'bg-tertiary/10 text-tertiary'
  if (s === 'overdue') return 'bg-error/10 text-error'
  return 'bg-primary/10 text-primary'
}

const BORDER_COLORS = ['border-primary', 'border-secondary', 'border-tertiary']

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */

export default function StudentDashboardPage() {
  const { user } = useAuth()
  const { data, isLoading, error, refetch } = useStudentDashboard()

  if (isLoading) {
    return (
      <PageLayout>
        <SkeletonDashboard />
      </PageLayout>
    )
  }

  if (error || !data) {
    const errorMsg =
      (error as { response?: { data?: { detail?: string } } })?.response?.data?.detail
      ?? 'Failed to load dashboard.'
    return (
      <PageLayout>
        <main className="max-w-7xl mx-auto px-4 md:px-6 py-10 pb-32">
          <div className="bg-error/10 text-error rounded-xl p-8 text-center">
            <span className="material-symbols-outlined text-4xl mb-2 block">error</span>
            <p className="font-headline text-lg font-bold">{errorMsg}</p>
            <button
              onClick={() => refetch()}
              className="mt-4 px-6 py-2 bg-error text-on-error rounded-lg text-sm font-bold"
            >
              Retry
            </button>
          </div>
        </main>
      </PageLayout>
    )
  }

  const { profile, attendance, upcoming_schedule, activities, tuition } = data
  const attendPct = attendance.percentage ?? 0

  return (
    <PageLayout>
      <main className="max-w-7xl mx-auto px-4 md:px-6 py-10 pb-32">
        {/* ── Hero ─────────────────────────────────────────────── */}
        <section className="mb-10 flex flex-col md:flex-row gap-8 items-end">
          <div className="flex-1">
            <p className="text-[0.75rem] font-bold tracking-[0.15em] uppercase text-on-surface-variant mb-2 font-label">
              Student Profile
            </p>
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-on-surface font-headline mb-2">
              {profile.full_name || user?.full_name || 'Student'}
            </h1>
            <div className="flex flex-wrap gap-3">
              {profile.section && (
                <span className="px-4 py-1.5 bg-secondary-container text-on-secondary-container rounded-full text-sm font-medium">
                  {profile.section}
                </span>
              )}
              <span className="px-4 py-1.5 bg-surface-container-high text-on-surface-variant rounded-full text-sm font-medium">
                ID: {profile.student_id}
              </span>
              {profile.house && (
                <span className="px-4 py-1.5 bg-tertiary-fixed text-on-tertiary-fixed-variant rounded-full text-sm font-medium">
                  {profile.house}
                </span>
              )}
            </div>
          </div>

          {/* Attendance quick stat */}
          <div className="w-full md:w-auto flex gap-4">
            <div className="flex-1 md:w-48 p-4 bg-surface-container-lowest rounded-xl">
              <p className="text-[0.65rem] font-bold uppercase tracking-widest text-on-surface-variant mb-1">Attendance</p>
              <p className="text-2xl font-bold text-primary">{attendPct.toFixed(1)}%</p>
              <p className="text-xs text-on-surface-variant mt-1">
                {attendance.present_days}/{attendance.total_days} days
              </p>
            </div>
          </div>
        </section>

        {/* ── Bento Grid ───────────────────────────────────────── */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">

          {/* Attendance card with progress bar */}
          <div className="md:col-span-8 bg-surface-container-lowest rounded-xl p-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold tracking-tight font-headline">Attendance Overview</h2>
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">calendar_today</span>
                <span className="text-sm font-bold text-on-surface-variant">
                  {attendance.present_days} of {attendance.total_days} days
                </span>
              </div>
            </div>

            {/* Big progress bar */}
            <div className="mb-6">
              <div className="flex justify-between items-end mb-2">
                <span className="text-sm font-semibold text-on-surface">Attendance rate</span>
                <span className="text-sm font-bold text-primary">{attendPct.toFixed(1)}%</span>
              </div>
              <div className="h-3 w-full bg-surface-container-low rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-primary to-primary-container rounded-full transition-all duration-700"
                  style={{ width: `${Math.min(attendPct, 100)}%` }}
                />
              </div>
            </div>

            {/* Mini stat row */}
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-surface-container-low p-4 rounded-lg">
                <p className="text-[0.65rem] font-bold uppercase tracking-widest text-on-surface-variant mb-1">Present</p>
                <p className="text-xl font-bold text-tertiary">{attendance.present_days}</p>
              </div>
              <div className="bg-surface-container-low p-4 rounded-lg">
                <p className="text-[0.65rem] font-bold uppercase tracking-widest text-on-surface-variant mb-1">Absent</p>
                <p className="text-xl font-bold text-error">{attendance.total_days - attendance.present_days}</p>
              </div>
              <div className="bg-surface-container-low p-4 rounded-lg">
                <p className="text-[0.65rem] font-bold uppercase tracking-widest text-on-surface-variant mb-1">Total</p>
                <p className="text-xl font-bold text-on-surface">{attendance.total_days}</p>
              </div>
            </div>
          </div>

          {/* Activities side column */}
          <div className="md:col-span-4 space-y-6">
            <div className="bg-surface-container-low rounded-xl p-6">
              <h3 className="text-xl font-bold tracking-tight font-headline mb-6">Activities</h3>

              {activities.length === 0 ? (
                <div className="text-center py-8 text-on-surface-variant">
                  <span className="material-symbols-outlined text-3xl mb-2 block">sports_kabaddi</span>
                  <p className="text-sm">No activities yet</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {activities.map((act) => (
                    <div key={act.id} className="flex items-center gap-4 bg-surface-container-lowest p-3 rounded-xl">
                      <div className="w-12 h-12 rounded-lg bg-secondary-container flex items-center justify-center">
                        <span className="material-symbols-outlined text-on-secondary-container">interests</span>
                      </div>
                      <div className="min-w-0">
                        <p className="font-bold text-sm truncate">{act.name}</p>
                        <p className="text-xs text-on-surface-variant truncate">
                          {act.role} {act.schedule ? `\u00b7 ${act.schedule}` : ''}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Tuition summary */}
            {tuition && (
              <div className="bg-surface-container-lowest rounded-xl p-6 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-full -mr-10 -mt-10" />
                <h3 className="text-xl font-bold tracking-tight font-headline mb-4">Tuition</h3>
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-on-surface-variant">Semester</span>
                    <span className="font-bold text-on-surface">{tuition.semester}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-on-surface-variant">Outstanding</span>
                    <span className="font-bold text-primary">${Number(tuition.outstanding_balance).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-on-surface-variant">Status</span>
                    <span className={`px-3 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider ${statusColor(tuition.status)}`}>
                      {tuition.status}
                    </span>
                  </div>
                  {tuition.due_date && (
                    <div className="flex justify-between text-sm">
                      <span className="text-on-surface-variant">Due</span>
                      <span className="font-medium text-on-surface">
                        {new Date(tuition.due_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ── Schedule Ribbon ──────────────────────────────────── */}
        <section className="mt-10">
          <h3 className="text-sm font-bold uppercase tracking-[0.2em] text-on-surface-variant mb-4 font-label">
            Upcoming Schedule
          </h3>

          {upcoming_schedule.length === 0 ? (
            <div className="bg-surface-container-lowest rounded-xl p-8 text-center text-on-surface-variant">
              <span className="material-symbols-outlined text-3xl mb-2 block">event_busy</span>
              <p className="text-sm">No upcoming classes scheduled</p>
            </div>
          ) : (
            <div className="flex overflow-x-auto gap-4 pb-4 -mx-4 px-4 md:mx-0 md:px-0">
              {upcoming_schedule.map((s, i) => (
                <div
                  key={`${s.subject}-${s.day}-${s.start_time}`}
                  className={`min-w-[280px] bg-surface-container-lowest p-5 rounded-xl border-l-4 ${BORDER_COLORS[i % BORDER_COLORS.length]}`}
                >
                  <p className="text-[0.65rem] font-bold text-on-surface-variant mb-1 uppercase">
                    {s.day} &middot; {s.start_time} &ndash; {s.end_time}
                  </p>
                  <h4 className="font-bold mb-1">{s.subject}</h4>
                  <p className="text-sm text-on-surface-variant">
                    {s.location}
                    {s.teacher ? ` \u00b7 ${s.teacher}` : ''}
                  </p>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>
    </PageLayout>
  )
}
