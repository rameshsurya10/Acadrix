import { useEffect, useState } from 'react'
import PageLayout from '@/components/layout/PageLayout'
import { Bone, SkeletonTableRow } from '@/components/shared/Skeleton'
import { studentService, type PaymentItem } from '@/services/student/studentService'

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function currency(val: string | number) {
  return `$${Number(val).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
  })
}

function methodIcon(method: string) {
  const m = method.toLowerCase()
  if (m.includes('card') || m.includes('credit') || m.includes('debit')) return 'credit_card'
  if (m.includes('bank') || m.includes('transfer') || m.includes('ach')) return 'account_balance'
  if (m.includes('cash')) return 'payments'
  if (m.includes('check') || m.includes('cheque')) return 'receipt'
  return 'payment'
}

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */

export default function StudentPaymentsPage() {
  const [payments, setPayments] = useState<PaymentItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    studentService
      .getPayments()
      .then((d) => { if (!cancelled) setPayments(d) })
      .catch((err) => {
        if (!cancelled) {
          const msg = (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail
          setError(msg ?? 'Failed to load payment history.')
        }
      })
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [])

  const totalPaid = payments.reduce((sum, p) => sum + Number(p.amount), 0)

  return (
    <PageLayout>
      <main className="max-w-7xl mx-auto px-4 md:px-6 py-10 pb-32">
        {/* Header */}
        <div className="mb-10">
          <p className="font-label text-[0.75rem] uppercase tracking-widest text-on-surface-variant font-medium mb-2">
            Financial Overview
          </p>
          <h1 className="text-4xl font-extrabold tracking-tight text-on-surface font-headline">
            Payment History
          </h1>
        </div>

        {/* Summary stat cards */}
        {!loading && !error && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
            <div className="bg-surface-container-lowest rounded-xl p-6">
              <p className="text-[0.65rem] font-bold uppercase tracking-widest text-on-surface-variant mb-1">
                Total Paid
              </p>
              <p className="text-2xl font-headline font-extrabold text-primary">{currency(totalPaid)}</p>
            </div>
            <div className="bg-surface-container-lowest rounded-xl p-6">
              <p className="text-[0.65rem] font-bold uppercase tracking-widest text-on-surface-variant mb-1">
                Transactions
              </p>
              <p className="text-2xl font-headline font-extrabold text-on-surface">{payments.length}</p>
            </div>
            <div className="bg-surface-container-lowest rounded-xl p-6">
              <p className="text-[0.65rem] font-bold uppercase tracking-widest text-on-surface-variant mb-1">
                Last Payment
              </p>
              <p className="text-2xl font-headline font-extrabold text-tertiary">
                {payments.length > 0 ? formatDate(payments[0].paid_at) : '--'}
              </p>
            </div>
          </div>
        )}

        {/* ── Loading ──────────────────────────────── */}
        {loading && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="bg-surface-container-lowest p-6 rounded-xl space-y-3">
                  <Bone className="w-24 h-3 rounded-md" />
                  <Bone className="w-32 h-7 rounded-md" />
                </div>
              ))}
            </div>
            <div className="bg-surface-container-low rounded-xl overflow-hidden">
              <table className="w-full">
                <tbody>
                  <SkeletonTableRow cols={5} />
                  <SkeletonTableRow cols={5} />
                  <SkeletonTableRow cols={5} />
                  <SkeletonTableRow cols={5} />
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ── Error ────────────────────────────────── */}
        {!loading && error && (
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
        )}

        {/* ── Empty ────────────────────────────────── */}
        {!loading && !error && payments.length === 0 && (
          <div className="bg-surface-container-lowest rounded-xl p-12 text-center">
            <span className="material-symbols-outlined text-5xl text-on-surface-variant mb-3 block">receipt_long</span>
            <p className="font-headline text-xl font-bold text-on-surface mb-2">No payments yet</p>
            <p className="text-on-surface-variant text-sm max-w-md mx-auto">
              Your payment receipts will appear here once transactions are recorded against your account.
            </p>
          </div>
        )}

        {/* ── Table ────────────────────────────────── */}
        {!loading && !error && payments.length > 0 && (
          <>
            {/* Desktop table */}
            <div className="hidden md:block bg-surface-container-lowest rounded-xl overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-surface-container-low">
                      <th className="text-left py-4 px-6 font-label text-xs uppercase tracking-widest text-on-surface-variant">
                        Receipt
                      </th>
                      <th className="text-left py-4 px-6 font-label text-xs uppercase tracking-widest text-on-surface-variant">
                        Amount
                      </th>
                      <th className="text-left py-4 px-6 font-label text-xs uppercase tracking-widest text-on-surface-variant">
                        Method
                      </th>
                      <th className="text-left py-4 px-6 font-label text-xs uppercase tracking-widest text-on-surface-variant">
                        Paid By
                      </th>
                      <th className="text-left py-4 px-6 font-label text-xs uppercase tracking-widest text-on-surface-variant">
                        Date
                      </th>
                      <th className="text-left py-4 px-6 font-label text-xs uppercase tracking-widest text-on-surface-variant">
                        Notes
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-outline-variant/10">
                    {payments.map((p) => (
                      <tr key={p.id} className="hover:bg-surface-container-low/30 transition-colors">
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-tertiary/10 text-tertiary flex items-center justify-center flex-shrink-0">
                              <span className="material-symbols-outlined">receipt_long</span>
                            </div>
                            <span className="font-bold text-sm text-on-surface">{p.receipt_id}</span>
                          </div>
                        </td>
                        <td className="py-4 px-6 font-headline font-bold text-on-surface">
                          {currency(p.amount)}
                        </td>
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-2">
                            <span className="material-symbols-outlined text-on-surface-variant text-lg">
                              {methodIcon(p.method)}
                            </span>
                            <span className="text-sm text-on-surface capitalize">{p.method}</span>
                          </div>
                        </td>
                        <td className="py-4 px-6 text-sm text-on-surface-variant">
                          {p.paid_by_name ?? '--'}
                        </td>
                        <td className="py-4 px-6">
                          <p className="text-sm text-on-surface">{formatDate(p.paid_at)}</p>
                          <p className="text-xs text-on-surface-variant">{formatTime(p.paid_at)}</p>
                        </td>
                        <td className="py-4 px-6 text-sm text-on-surface-variant max-w-[200px] truncate">
                          {p.notes || '--'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Mobile cards */}
            <div className="md:hidden space-y-4">
              {payments.map((p) => (
                <div key={p.id} className="bg-surface-container-lowest p-5 rounded-xl">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-tertiary/10 text-tertiary flex items-center justify-center">
                        <span className="material-symbols-outlined">receipt_long</span>
                      </div>
                      <div>
                        <p className="font-bold text-sm text-on-surface">{p.receipt_id}</p>
                        <p className="text-xs text-on-surface-variant">{formatDate(p.paid_at)}</p>
                      </div>
                    </div>
                    <span className="font-headline font-bold text-primary">{currency(p.amount)}</span>
                  </div>
                  <div className="flex flex-wrap gap-x-6 gap-y-2 text-xs text-on-surface-variant">
                    <span className="flex items-center gap-1">
                      <span className="material-symbols-outlined text-sm">{methodIcon(p.method)}</span>
                      <span className="capitalize">{p.method}</span>
                    </span>
                    {p.paid_by_name && (
                      <span className="flex items-center gap-1">
                        <span className="material-symbols-outlined text-sm">person</span>
                        {p.paid_by_name}
                      </span>
                    )}
                  </div>
                  {p.notes && (
                    <p className="text-xs text-on-surface-variant mt-2 line-clamp-2">{p.notes}</p>
                  )}
                </div>
              ))}
            </div>
          </>
        )}
      </main>
    </PageLayout>
  )
}
