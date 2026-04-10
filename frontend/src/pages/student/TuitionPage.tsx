import { useEffect, useState } from 'react'
import PageLayout from '@/components/layout/PageLayout'
import { Bone, SkeletonMetricCard } from '@/components/shared/Skeleton'
import { studentService, type TuitionAccount } from '@/services/student/studentService'

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function statusBadge(status: string) {
  const s = status.toLowerCase()
  if (s === 'paid' || s === 'settled') return { cls: 'bg-tertiary/10 text-tertiary', icon: 'check_circle' }
  if (s === 'overdue') return { cls: 'bg-error/10 text-error', icon: 'error' }
  return { cls: 'bg-primary/10 text-primary', icon: 'schedule' }
}

function currency(val: string | number) {
  return `$${Number(val).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */

export default function StudentTuitionPage() {
  const [tuition, setTuition] = useState<TuitionAccount | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    studentService
      .getTuition()
      .then((d) => { if (!cancelled) setTuition(d) })
      .catch((err) => {
        if (!cancelled) {
          const msg = (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail
          setError(msg ?? 'Failed to load tuition data.')
        }
      })
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [])

  /* ── Loading ──────────────────────────────────── */
  if (loading) {
    return (
      <PageLayout>
        <main className="max-w-7xl mx-auto px-4 md:px-6 py-12 pb-32 space-y-8">
          <div className="space-y-2">
            <Bone className="w-28 h-3 rounded-md" />
            <Bone className="w-56 h-8 rounded-md" />
            <Bone className="w-80 h-4 rounded-md" />
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <Bone className="w-full h-64 rounded-xl" />
              <Bone className="w-full h-48 rounded-xl" />
            </div>
            <div className="space-y-6">
              <SkeletonMetricCard />
              <SkeletonMetricCard />
            </div>
          </div>
        </main>
      </PageLayout>
    )
  }

  /* ── Error ────────────────────────────────────── */
  if (error) {
    return (
      <PageLayout>
        <main className="max-w-7xl mx-auto px-4 md:px-6 py-12 pb-32">
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
        </main>
      </PageLayout>
    )
  }

  /* ── Empty ────────────────────────────────────── */
  if (!tuition) {
    return (
      <PageLayout>
        <main className="max-w-7xl mx-auto px-4 md:px-6 py-12 pb-32">
          <div className="mb-12">
            <span className="font-label text-[0.75rem] font-medium uppercase tracking-widest text-on-surface-variant mb-2 block">Account Statement</span>
            <h2 className="font-headline text-4xl md:text-5xl font-extrabold tracking-tight text-on-surface mb-4">Tuition &amp; Fees</h2>
          </div>
          <div className="bg-surface-container-lowest rounded-xl p-12 text-center">
            <span className="material-symbols-outlined text-5xl text-on-surface-variant mb-3 block">account_balance_wallet</span>
            <p className="font-headline text-xl font-bold text-on-surface mb-2">No tuition account found</p>
            <p className="text-on-surface-variant text-sm max-w-md mx-auto">
              Your tuition details will appear here once your enrollment billing has been set up by the administration.
            </p>
          </div>
        </main>
      </PageLayout>
    )
  }

  /* ── Data ──────────────────────────────────────── */
  const total = Number(tuition.total_amount)
  const paid = Number(tuition.paid_amount)
  const outstanding = Number(tuition.outstanding_balance)
  const paidPct = total > 0 ? (paid / total) * 100 : 0
  const badge = statusBadge(tuition.status)

  return (
    <PageLayout>
      <main className="max-w-7xl mx-auto px-4 md:px-6 py-12 pb-32">
        {/* Header */}
        <div className="mb-12">
          <span className="font-label text-[0.75rem] font-medium uppercase tracking-widest text-on-surface-variant mb-2 block">
            Account Statement
          </span>
          <h2 className="font-headline text-4xl md:text-5xl font-extrabold tracking-tight text-on-surface mb-4">
            Tuition &amp; Fees
          </h2>
          <p className="text-on-surface-variant max-w-2xl leading-relaxed">
            Review your financial summary for the <span className="font-semibold text-on-surface">{tuition.semester}</span> period.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          {/* ── Left: Billing details ───────────────── */}
          <div className="lg:col-span-2 space-y-8">
            {/* Summary card */}
            <section className="bg-surface-container-lowest rounded-xl p-8 shadow-sm relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-primary to-primary-container opacity-5 rounded-bl-full" />
              <div className="flex flex-col sm:flex-row justify-between sm:items-start gap-4 mb-8">
                <div>
                  <h3 className="font-headline text-2xl font-bold text-on-surface">{tuition.semester} Balance</h3>
                  {tuition.due_date && (
                    <p className="text-on-surface-variant text-sm mt-1">
                      Due: {new Date(tuition.due_date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                    </p>
                  )}
                </div>
                <div className="text-right">
                  <span className="text-3xl font-headline font-extrabold text-primary">{currency(outstanding)}</span>
                  <div className="mt-2 flex items-center justify-end gap-1">
                    <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${badge.cls}`}>
                      <span className="material-symbols-outlined text-sm">{badge.icon}</span>
                      {tuition.status}
                    </span>
                  </div>
                </div>
              </div>

              {/* Progress bar */}
              <div className="mb-8">
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-on-surface-variant">Paid: {currency(paid)}</span>
                  <span className="text-on-surface-variant">Total: {currency(total)}</span>
                </div>
                <div className="h-3 w-full bg-surface-container-low rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-primary to-primary-container rounded-full transition-all duration-700"
                    style={{ width: `${Math.min(paidPct, 100)}%` }}
                  />
                </div>
                <p className="text-xs text-on-surface-variant mt-1">{paidPct.toFixed(1)}% paid</p>
              </div>

              {/* Line items */}
              {tuition.line_items.length > 0 && (
                <div className="space-y-4">
                  {tuition.line_items.map((item) => (
                    <div key={item.id} className="flex justify-between items-center py-4 border-b border-outline-variant/20 last:border-0">
                      <div>
                        <p className="font-medium text-on-surface">{item.description}</p>
                        {item.credit_hours != null && item.rate_per_hour != null && (
                          <p className="text-xs text-on-surface-variant">
                            {item.credit_hours} credit hours @ {currency(item.rate_per_hour)}/hr
                          </p>
                        )}
                      </div>
                      <span className="font-headline font-bold">{currency(item.amount)}</span>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </div>

          {/* ── Right: Summary sidebar ──────────────── */}
          <aside className="space-y-8">
            {/* Quick stats */}
            <div className="bg-surface-container-lowest rounded-xl p-6 shadow-sm space-y-5">
              <h4 className="font-headline text-sm font-bold uppercase tracking-widest text-on-surface-variant">
                Financial Summary
              </h4>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-on-surface-variant">Total Amount</span>
                  <span className="font-bold text-on-surface">{currency(total)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-on-surface-variant">Amount Paid</span>
                  <span className="font-bold text-tertiary">{currency(paid)}</span>
                </div>
                <div className="pt-3 border-t border-outline-variant/20 flex justify-between items-center">
                  <span className="text-sm font-bold text-on-surface">Outstanding</span>
                  <span className="text-xl font-headline font-extrabold text-primary">{currency(outstanding)}</span>
                </div>
              </div>
            </div>

            {/* Semester badge */}
            <div className="bg-surface-container-low rounded-xl p-6">
              <div className="flex items-center gap-3 mb-3">
                <span className="material-symbols-outlined text-primary">school</span>
                <h4 className="font-headline text-sm font-bold uppercase tracking-widest text-on-surface-variant">
                  Semester
                </h4>
              </div>
              <p className="text-lg font-headline font-bold text-on-surface">{tuition.semester}</p>
              {tuition.due_date && (
                <p className="text-xs text-on-surface-variant mt-1">
                  Payment due {new Date(tuition.due_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                </p>
              )}
            </div>

            {/* Financial support card */}
            <div className="bg-surface-container-highest rounded-xl p-8 border border-outline-variant/10 shadow-sm">
              <div className="mb-6">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-4">
                  <span className="material-symbols-outlined">account_balance_wallet</span>
                </div>
                <h4 className="font-headline text-lg font-bold text-on-surface">Need Help?</h4>
                <p className="text-sm text-on-surface-variant mt-2 leading-relaxed">
                  If you have questions about your tuition or need a payment extension, contact the finance office.
                </p>
              </div>
            </div>
          </aside>
        </div>
      </main>
    </PageLayout>
  )
}
