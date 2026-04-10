import { useState, useEffect, useCallback } from 'react'
import PageLayout from '@/components/layout/PageLayout'
import { leaveService, type LeaveBalance, type LeaveApplication } from '@/services/leave/leaveService'

const STATUS_STYLES: Record<string, { label: string; bg: string; text: string }> = {
  pending:   { label: 'Pending',   bg: 'bg-secondary-container',   text: 'text-on-secondary-container' },
  approved:  { label: 'Approved',  bg: 'bg-tertiary/10',           text: 'text-tertiary' },
  rejected:  { label: 'Rejected',  bg: 'bg-error/10',              text: 'text-error' },
  cancelled: { label: 'Cancelled', bg: 'bg-surface-container-high', text: 'text-on-surface-variant' },
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

export default function MyLeavesPage() {
  const [balances, setBalances] = useState<LeaveBalance[]>([])
  const [leaves, setLeaves] = useState<LeaveApplication[]>([])
  const [loading, setLoading] = useState(true)
  const [cancelling, setCancelling] = useState<number | null>(null)
  const [error, setError] = useState('')

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const [bal, apps] = await Promise.all([
        leaveService.getBalances(),
        leaveService.getMyLeaves(),
      ])
      setBalances(bal)
      setLeaves(apps)
    } catch {
      setError('Failed to load leave data.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  async function handleCancel(id: number) {
    setCancelling(id)
    try {
      await leaveService.cancelLeave(id)
      setLeaves((prev) => prev.map((l) => (l.id === id ? { ...l, status: 'cancelled' } : l)))
    } catch {
      setError('Failed to cancel leave.')
    } finally {
      setCancelling(null)
    }
  }

  function balanceColor(remaining: number, allocated: number): string {
    if (allocated === 0) return 'text-on-surface-variant'
    const pct = remaining / allocated
    if (pct > 0.5) return 'text-tertiary'
    if (pct > 0.2) return 'text-primary'
    return 'text-error'
  }

  return (
    <PageLayout>
      <div className="px-4 md:px-8 py-8">
        <span className="font-label text-xs font-semibold tracking-widest text-on-surface-variant uppercase mb-2 block">
          Leave
        </span>
        <h2 className="font-headline font-extrabold text-3xl md:text-4xl text-on-surface mb-8">
          My Leaves
        </h2>

        {error && (
          <div className="mb-6 rounded-xl bg-error/10 text-error px-5 py-4 text-sm font-medium flex items-center gap-3">
            <span className="material-symbols-outlined text-lg">error</span>
            {error}
          </div>
        )}

        {/* Balances Summary */}
        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-28 rounded-2xl bg-surface-container-high animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {balances.map((b) => (
              <div
                key={b.id}
                className="rounded-2xl bg-surface-container-lowest border border-outline-variant/10 p-5"
              >
                <p className="text-xs font-semibold text-on-surface-variant uppercase tracking-wide mb-2">
                  {b.leave_type_name}
                </p>
                <p className={`text-2xl font-extrabold ${balanceColor(b.remaining, b.allocated)}`}>
                  {b.remaining}
                </p>
                <p className="text-xs text-on-surface-variant mt-1">
                  of {b.allocated} allocated &middot; {b.used} used
                  {b.carried_forward > 0 && ` \u00b7 ${b.carried_forward} carried`}
                </p>
              </div>
            ))}
            {balances.length === 0 && (
              <p className="col-span-full text-sm text-on-surface-variant">No balances allocated yet.</p>
            )}
          </div>
        )}

        {/* Leave Applications Table */}
        <div className="rounded-2xl bg-surface-container-lowest border border-outline-variant/10 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-outline-variant/10 bg-surface-container-low">
                  <th className="text-left px-5 py-3.5 font-semibold text-on-surface-variant">Type</th>
                  <th className="text-left px-5 py-3.5 font-semibold text-on-surface-variant">Dates</th>
                  <th className="text-center px-5 py-3.5 font-semibold text-on-surface-variant">Days</th>
                  <th className="text-left px-5 py-3.5 font-semibold text-on-surface-variant">Status</th>
                  <th className="text-left px-5 py-3.5 font-semibold text-on-surface-variant">Reason</th>
                  <th className="text-right px-5 py-3.5 font-semibold text-on-surface-variant">Action</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  [1, 2, 3].map((i) => (
                    <tr key={i} className="border-b border-outline-variant/5">
                      {[1, 2, 3, 4, 5, 6].map((j) => (
                        <td key={j} className="px-5 py-4">
                          <div className="h-4 rounded bg-surface-container-high animate-pulse" />
                        </td>
                      ))}
                    </tr>
                  ))
                ) : leaves.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-5 py-12 text-center text-on-surface-variant">
                      No leave applications found.
                    </td>
                  </tr>
                ) : (
                  leaves.map((leave) => {
                    const badge = STATUS_STYLES[leave.status] ?? STATUS_STYLES.pending
                    return (
                      <tr key={leave.id} className="border-b border-outline-variant/5 hover:bg-surface-container-low/40 transition-colors">
                        <td className="px-5 py-4 font-medium text-on-surface">{leave.leave_type_name}</td>
                        <td className="px-5 py-4 text-on-surface-variant whitespace-nowrap">
                          {formatDate(leave.start_date)} &ndash; {formatDate(leave.end_date)}
                          {leave.is_half_day && (
                            <span className="ml-2 text-xs bg-primary/10 text-primary rounded-full px-2 py-0.5">
                              Half
                            </span>
                          )}
                        </td>
                        <td className="px-5 py-4 text-center text-on-surface">{leave.days_count}</td>
                        <td className="px-5 py-4">
                          <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${badge.bg} ${badge.text}`}>
                            {badge.label}
                          </span>
                        </td>
                        <td className="px-5 py-4 text-on-surface-variant max-w-[200px] truncate" title={leave.reason}>
                          {leave.reason}
                        </td>
                        <td className="px-5 py-4 text-right">
                          {leave.status === 'pending' && (
                            <button
                              onClick={() => handleCancel(leave.id)}
                              disabled={cancelling === leave.id}
                              className="text-xs font-semibold text-error hover:text-error/80 disabled:opacity-50"
                            >
                              {cancelling === leave.id ? 'Cancelling...' : 'Cancel'}
                            </button>
                          )}
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </PageLayout>
  )
}
