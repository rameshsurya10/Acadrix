import { useState, useEffect } from 'react'
import PageLayout from '@/components/layout/PageLayout'
import api from '@/lib/api'
import { Bone, SkeletonMetricCard, SkeletonLine } from '@/components/shared/Skeleton'

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface UpcomingEvent {
  id: number
  title: string
  description: string
  event_date: string
  location: string
  created_by_name: string
}

interface DashboardData {
  total_students: number
  total_teachers: number
  questions: {
    total: number
    approved: number
    pending: number
    rejected: number
  }
  assessments: {
    total: number
    scheduled: number
    completed: number
  }
  upcoming_events: UpcomingEvent[]
}

/* ------------------------------------------------------------------ */
/*  Sub-components                                                     */
/* ------------------------------------------------------------------ */

function StatCard({
  icon,
  label,
  value,
  detail,
  accentClass,
}: {
  icon: string
  label: string
  value: string | number
  detail?: string
  accentClass?: string
}) {
  return (
    <div className="bg-surface-container-lowest p-6 rounded-xl shadow-[0_4px_32px_rgba(25,28,29,0.02)]">
      <div className="flex justify-between items-start mb-3">
        <div>
          <p className="font-label text-[10px] uppercase tracking-widest text-on-surface-variant font-semibold mb-1">
            {label}
          </p>
          <h3 className="text-3xl font-extrabold font-headline text-on-surface">{value}</h3>
        </div>
        <span className={`material-symbols-outlined text-2xl ${accentClass ?? 'text-primary'}`}>{icon}</span>
      </div>
      {detail && <p className="text-xs text-on-surface-variant">{detail}</p>}
    </div>
  )
}

function QuestionBar({
  label,
  count,
  total,
  colorClass,
}: {
  label: string
  count: number
  total: number
  colorClass: string
}) {
  const pct = total > 0 ? Math.round((count / total) * 100) : 0
  return (
    <div>
      <div className="flex justify-between text-xs mb-1">
        <span className="text-on-surface-variant font-medium">{label}</span>
        <span className="font-bold text-on-surface">
          {count} ({pct}%)
        </span>
      </div>
      <div className="w-full bg-surface-container-high h-2 rounded-full">
        <div className={`${colorClass} h-2 rounded-full transition-all duration-500`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  )
}

function formatEventDate(dateStr: string): string {
  const d = new Date(dateStr)
  return d.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })
}

function DashboardSkeleton() {
  return (
    <div className="max-w-7xl mx-auto px-4 md:px-6 py-10 pb-32 space-y-10">
      <div className="space-y-3">
        <Bone className="w-36 h-3 rounded-md" />
        <Bone className="w-72 h-9 rounded-md" />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-5">
        {Array.from({ length: 5 }).map((_, i) => (
          <SkeletonMetricCard key={i} />
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-surface-container-lowest p-6 rounded-xl space-y-4">
          <SkeletonLine width="w-40" height="h-5" />
          <Bone className="w-full h-4 rounded-full" />
          <Bone className="w-full h-4 rounded-full" />
          <Bone className="w-full h-4 rounded-full" />
        </div>
        <div className="space-y-4">
          <SkeletonLine width="w-36" height="h-5" />
          <Bone className="w-full h-24 rounded-xl" />
          <Bone className="w-full h-24 rounded-xl" />
        </div>
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Main Page                                                          */
/* ------------------------------------------------------------------ */

export default function PrincipalDashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    async function fetchDashboard() {
      try {
        setLoading(true)
        setError(null)
        const res = await api.get('/principal/dashboard/')
        if (cancelled) return
        setData(res.data.data ?? res.data)
      } catch (err: unknown) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Failed to load dashboard data.')
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    fetchDashboard()
    return () => {
      cancelled = true
    }
  }, [])

  if (loading) {
    return (
      <PageLayout>
        <DashboardSkeleton />
      </PageLayout>
    )
  }

  if (error) {
    return (
      <PageLayout>
        <main className="max-w-7xl mx-auto px-4 md:px-6 py-10 pb-32">
          <div className="bg-error/10 text-error rounded-xl p-8 text-center" role="alert">
            <span className="material-symbols-outlined text-4xl mb-3 block">error</span>
            <p className="font-medium mb-4">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="px-5 py-2 bg-error text-on-error rounded-lg text-sm font-bold"
            >
              Retry
            </button>
          </div>
        </main>
      </PageLayout>
    )
  }

  if (!data) return null

  const { questions, assessments, upcoming_events } = data

  return (
    <PageLayout>
      <main className="max-w-7xl mx-auto px-4 md:px-6 py-10 pb-32 space-y-10">
        {/* Header */}
        <section>
          <span className="font-label text-xs font-semibold tracking-widest text-on-surface-variant uppercase mb-2 block">
            Institutional Overview
          </span>
          <h2 className="font-headline font-extrabold text-3xl md:text-4xl text-on-surface tracking-tight">
            Principal's Dashboard
          </h2>
        </section>

        {/* Stats Cards */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-5" aria-label="Key metrics">
          <StatCard
            icon="school"
            label="Total Students"
            value={data.total_students.toLocaleString()}
            accentClass="text-primary"
          />
          <StatCard
            icon="groups"
            label="Total Teachers"
            value={data.total_teachers.toLocaleString()}
            accentClass="text-tertiary"
          />
          <StatCard
            icon="quiz"
            label="Questions"
            value={questions.total.toLocaleString()}
            detail={`${questions.approved} approved \u00b7 ${questions.pending} pending`}
            accentClass="text-secondary"
          />
          <StatCard
            icon="assignment"
            label="Assessments"
            value={assessments.total.toLocaleString()}
            detail={`${assessments.scheduled} scheduled \u00b7 ${assessments.completed} completed`}
            accentClass="text-primary"
          />
          <StatCard
            icon="event"
            label="Upcoming Events"
            value={upcoming_events.length}
            accentClass="text-tertiary"
          />
        </section>

        {/* Question Overview + Events */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Question Overview */}
          <section className="bg-surface-container-lowest p-6 rounded-xl shadow-[0_4px_32px_rgba(25,28,29,0.02)]" aria-label="Question overview">
            <h3 className="font-headline font-bold text-lg mb-6">Question Overview</h3>
            {questions.total === 0 ? (
              <div className="text-center py-8">
                <span className="material-symbols-outlined text-3xl text-on-surface-variant/30 mb-2 block">quiz</span>
                <p className="text-on-surface-variant text-sm">No questions generated yet.</p>
              </div>
            ) : (
              <div className="space-y-5">
                <QuestionBar label="Approved" count={questions.approved} total={questions.total} colorClass="bg-tertiary" />
                <QuestionBar label="Pending" count={questions.pending} total={questions.total} colorClass="bg-primary" />
                <QuestionBar label="Rejected" count={questions.rejected} total={questions.total} colorClass="bg-error" />

                {/* Summary pills */}
                <div className="flex flex-wrap gap-3 pt-2">
                  <span className="bg-tertiary/10 text-tertiary text-xs font-bold px-3 py-1.5 rounded-full">
                    {questions.approved} Approved
                  </span>
                  <span className="bg-primary/10 text-primary text-xs font-bold px-3 py-1.5 rounded-full">
                    {questions.pending} Pending
                  </span>
                  <span className="bg-error/10 text-error text-xs font-bold px-3 py-1.5 rounded-full">
                    {questions.rejected} Rejected
                  </span>
                </div>
              </div>
            )}
          </section>

          {/* Upcoming Events */}
          <section aria-label="Upcoming events">
            <h3 className="font-headline font-bold text-lg mb-4">Upcoming Events</h3>
            {upcoming_events.length === 0 ? (
              <div className="bg-surface-container-lowest rounded-xl p-8 text-center">
                <span className="material-symbols-outlined text-3xl text-on-surface-variant/30 mb-2 block">
                  event_busy
                </span>
                <p className="text-on-surface-variant text-sm">No upcoming events scheduled.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {upcoming_events.map((event) => (
                  <div
                    key={event.id}
                    className="bg-surface-container-lowest p-5 rounded-xl shadow-[0_4px_32px_rgba(25,28,29,0.02)] border-l-4 border-primary hover:shadow-md transition-shadow"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-bold text-on-surface">{event.title}</h4>
                      <span className="text-[10px] text-on-surface-variant uppercase font-semibold shrink-0 ml-3">
                        {formatEventDate(event.event_date)}
                      </span>
                    </div>
                    {event.description && (
                      <p className="text-sm text-on-surface-variant leading-relaxed mb-3 line-clamp-2">
                        {event.description}
                      </p>
                    )}
                    <div className="flex items-center gap-4 text-xs text-on-surface-variant">
                      {event.location && (
                        <span className="flex items-center gap-1">
                          <span className="material-symbols-outlined text-xs">location_on</span>
                          {event.location}
                        </span>
                      )}
                      {event.created_by_name && (
                        <span className="flex items-center gap-1">
                          <span className="material-symbols-outlined text-xs">person</span>
                          {event.created_by_name}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      </main>
    </PageLayout>
  )
}
