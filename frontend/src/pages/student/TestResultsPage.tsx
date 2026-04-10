import { useEffect, useState, useMemo } from 'react'
import PageLayout from '@/components/layout/PageLayout'
import { Bone } from '@/components/shared/Skeleton'
import { studentService, type GradeResult } from '@/services/student/studentService'

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */

export default function StudentTestResultsPage() {
  const [grades, setGrades] = useState<GradeResult[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    studentService
      .getGrades()
      .then((list) => {
        if (!cancelled) setGrades(Array.isArray(list) ? list : [])
      })
      .catch((err) => {
        if (!cancelled) {
          const msg = (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail
          setError(msg ?? 'Failed to load results.')
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => { cancelled = true }
  }, [])

  /* ── Computed stats ────────────────────────────────────────────── */
  const stats = useMemo(() => {
    if (grades.length === 0) return null

    const total = grades.length
    let sumPct = 0
    const subjectTotals: Record<string, { sum: number; count: number }> = {}

    for (const g of grades) {
      const obtained = parseFloat(g.marks_obtained) || 0
      const maxMarks = g.total_marks || 100
      const pct = (obtained / maxMarks) * 100
      sumPct += pct

      if (!subjectTotals[g.subject_name]) {
        subjectTotals[g.subject_name] = { sum: 0, count: 0 }
      }
      subjectTotals[g.subject_name].sum += pct
      subjectTotals[g.subject_name].count += 1
    }

    const avgPct = sumPct / total

    let bestSubject = ''
    let bestAvg = 0
    for (const [name, { sum, count }] of Object.entries(subjectTotals)) {
      const avg = sum / count
      if (avg > bestAvg) {
        bestAvg = avg
        bestSubject = name
      }
    }

    return { total, avgPct, bestSubject, bestAvg }
  }, [grades])

  /* ── Grade color helper ────────────────────────────────────────── */
  function gradeColor(letter: string): string {
    if (!letter) return 'bg-surface-container-low text-on-surface-variant'
    const l = letter.toUpperCase()
    if (l.startsWith('A')) return 'bg-tertiary/10 text-tertiary'
    if (l.startsWith('B')) return 'bg-primary/10 text-primary'
    if (l.startsWith('C')) return 'bg-secondary-container text-on-secondary-container'
    if (l.startsWith('D')) return 'bg-error/10 text-error'
    if (l === 'F') return 'bg-error/20 text-error'
    return 'bg-surface-container-low text-on-surface-variant'
  }

  function progressColor(pct: number): string {
    if (pct >= 80) return 'bg-tertiary'
    if (pct >= 60) return 'bg-primary'
    if (pct >= 40) return 'bg-secondary'
    return 'bg-error'
  }

  function formatDate(iso: string): string {
    if (!iso) return '-'
    return new Date(iso).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })
  }

  return (
    <PageLayout>
      <main className="max-w-7xl mx-auto px-4 md:px-6 py-10 pb-32 space-y-10">
        {/* Header */}
        <div className="space-y-1">
          <span className="font-label text-xs font-semibold tracking-widest text-on-surface-variant uppercase mb-2 block">
            Academic Record
          </span>
          <h2 className="font-headline font-extrabold text-3xl md:text-4xl text-on-surface tracking-tight">
            Test Results &amp; Grades
          </h2>
        </div>

        {loading ? (
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Bone className="h-28 rounded-xl" />
              <Bone className="h-28 rounded-xl" />
              <Bone className="h-28 rounded-xl" />
            </div>
            <Bone className="w-full h-64 rounded-xl" />
          </div>
        ) : error ? (
          <div className="bg-error/10 text-error rounded-xl p-8 text-center">
            <span className="material-symbols-outlined text-4xl mb-2 block">error</span>
            <p className="font-headline text-lg font-bold">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="mt-4 px-6 py-2 bg-error text-on-error rounded-lg text-sm font-bold"
            >
              Retry
            </button>
          </div>
        ) : grades.length === 0 ? (
          /* ── Empty state ─────────────────────────────────────────── */
          <div className="bg-surface-container-lowest rounded-xl p-12 md:p-16 text-center relative overflow-hidden">
            <span
              className="material-symbols-outlined text-primary/10 select-none absolute top-6 right-6"
              style={{ fontSize: '8rem', fontVariationSettings: "'FILL' 1" }}
            >
              workspace_premium
            </span>
            <div className="relative z-10 max-w-md mx-auto space-y-4">
              <span className="material-symbols-outlined text-5xl text-on-surface-variant/40 block">
                quiz
              </span>
              <h3 className="font-headline font-extrabold text-2xl text-on-surface">
                No results published yet
              </h3>
              <p className="text-on-surface-variant leading-relaxed">
                Check back after exams. Once your teachers publish grades and feedback,
                they will appear here with detailed breakdowns.
              </p>
              <div className="flex items-center justify-center gap-2 pt-2">
                <span className="material-symbols-outlined text-tertiary text-base">info</span>
                <p className="text-sm text-on-surface-variant">
                  Check back after your next assessment period.
                </p>
              </div>
            </div>
          </div>
        ) : (
          <>
            {/* ── Summary cards ───────────────────────────────────── */}
            {stats && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* Total assessments */}
                <div className="bg-surface-container-lowest rounded-xl p-6 flex items-start gap-4">
                  <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <span className="material-symbols-outlined text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>
                      assignment
                    </span>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider mb-0.5">
                      Total Assessments
                    </p>
                    <p className="text-2xl font-headline font-extrabold text-on-surface">
                      {stats.total}
                    </p>
                  </div>
                </div>

                {/* Average marks */}
                <div className="bg-surface-container-lowest rounded-xl p-6 flex items-start gap-4">
                  <div className="w-11 h-11 rounded-xl bg-tertiary/10 flex items-center justify-center flex-shrink-0">
                    <span className="material-symbols-outlined text-tertiary" style={{ fontVariationSettings: "'FILL' 1" }}>
                      trending_up
                    </span>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider mb-0.5">
                      Average Score
                    </p>
                    <p className="text-2xl font-headline font-extrabold text-on-surface">
                      {stats.avgPct.toFixed(1)}%
                    </p>
                  </div>
                </div>

                {/* Best subject */}
                <div className="bg-surface-container-lowest rounded-xl p-6 flex items-start gap-4">
                  <div className="w-11 h-11 rounded-xl bg-secondary-container flex items-center justify-center flex-shrink-0">
                    <span className="material-symbols-outlined text-on-secondary-container" style={{ fontVariationSettings: "'FILL' 1" }}>
                      emoji_events
                    </span>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider mb-0.5">
                      Best Subject
                    </p>
                    <p className="text-lg font-headline font-extrabold text-on-surface truncate">
                      {stats.bestSubject}
                    </p>
                    <p className="text-xs text-on-surface-variant">{stats.bestAvg.toFixed(1)}% avg</p>
                  </div>
                </div>
              </div>
            )}

            {/* ── Results table ───────────────────────────────────── */}
            <div className="bg-surface-container-lowest rounded-xl overflow-hidden">
              {/* Desktop header */}
              <div className="hidden md:grid grid-cols-12 gap-4 px-6 py-3 bg-surface-container-low border-b border-outline-variant/20 text-xs font-bold text-on-surface-variant uppercase tracking-wider">
                <div className="col-span-2">Subject</div>
                <div className="col-span-2">Assessment</div>
                <div className="col-span-3">Marks</div>
                <div className="col-span-1 text-center">Grade</div>
                <div className="col-span-2">Date</div>
                <div className="col-span-2">Remarks</div>
              </div>

              <div className="divide-y divide-outline-variant/10">
                {grades.map((g, idx) => {
                  const obtained = parseFloat(g.marks_obtained) || 0
                  const maxMarks = g.total_marks || 100
                  const pct = (obtained / maxMarks) * 100

                  return (
                    <div
                      key={`${g.assessment_title}-${g.subject_name}-${idx}`}
                      className="grid grid-cols-1 md:grid-cols-12 gap-2 md:gap-4 px-4 md:px-6 py-4 md:items-center hover:bg-surface-container-low/50 transition-colors"
                    >
                      {/* Subject */}
                      <div className="md:col-span-2">
                        <p className="text-sm font-semibold text-on-surface">{g.subject_name}</p>
                        <p className="text-xs text-on-surface-variant md:hidden">{g.section}</p>
                      </div>

                      {/* Assessment */}
                      <div className="md:col-span-2">
                        <p className="text-sm text-on-surface">{g.assessment_title}</p>
                      </div>

                      {/* Marks with progress bar */}
                      <div className="md:col-span-3 space-y-1.5">
                        <div className="flex items-baseline gap-1.5">
                          <span className="text-sm font-bold text-on-surface">{obtained}</span>
                          <span className="text-xs text-on-surface-variant">/ {maxMarks}</span>
                          <span className="ml-auto text-xs font-semibold text-on-surface-variant">
                            {pct.toFixed(0)}%
                          </span>
                        </div>
                        <div className="w-full h-1.5 rounded-full bg-surface-container-high overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-500 ${progressColor(pct)}`}
                            style={{ width: `${Math.min(pct, 100)}%` }}
                          />
                        </div>
                      </div>

                      {/* Grade */}
                      <div className="md:col-span-1 flex md:justify-center">
                        <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-bold ${gradeColor(g.letter_grade)}`}>
                          {g.letter_grade || '-'}
                        </span>
                      </div>

                      {/* Date */}
                      <div className="md:col-span-2">
                        <p className="text-xs text-on-surface-variant">{formatDate(g.graded_at)}</p>
                      </div>

                      {/* Remarks */}
                      <div className="md:col-span-2">
                        <p className="text-xs text-on-surface-variant italic">
                          {g.remarks || '-'}
                        </p>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </>
        )}
      </main>
    </PageLayout>
  )
}
