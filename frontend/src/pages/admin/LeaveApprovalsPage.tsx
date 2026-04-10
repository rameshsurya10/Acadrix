import { useState, useEffect, useCallback } from 'react'
import PageLayout from '@/components/layout/PageLayout'
import { leaveService, type LeaveApplication } from '@/services/leave/leaveService'

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

export default function LeaveApprovalsPage() {
  const [pending, setPending] = useState<LeaveApplication[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [processing, setProcessing] = useState<number | null>(null)
  const [remarksMap, setRemarksMap] = useState<Record<number, string>>({})

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const data = await leaveService.getPendingApprovals()
      setPending(data)
    } catch {
      setError('Failed to load pending approvals.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  async function handleAction(id: number, action: 'approved' | 'rejected') {
    setProcessing(id)
    setError('')
    try {
      await leaveService.approveLeave(id, {
        action,
        remarks: remarksMap[id]?.trim() || undefined,
      })
      setPending((prev) => prev.filter((l) => l.id !== id))
    } catch {
      setError(`Failed to ${action === 'approved' ? 'approve' : 'reject'} leave.`)
    } finally {
      setProcessing(null)
    }
  }

  return (
    <PageLayout>
      <div className="px-4 md:px-8 py-8">
        <span className="font-label text-xs font-semibold tracking-widest text-on-surface-variant uppercase mb-2 block">
          Administration
        </span>
        <h2 className="font-headline font-extrabold text-3xl md:text-4xl text-on-surface mb-8">
          Leave Approvals
        </h2>

        {error && (
          <div className="mb-6 rounded-xl bg-error/10 text-error px-5 py-4 text-sm font-medium flex items-center gap-3">
            <span className="material-symbols-outlined text-lg">error</span>
            {error}
          </div>
        )}

        {pending.length === 0 && !loading && (
          <div className="text-center py-16">
            <span className="material-symbols-outlined text-5xl text-on-surface-variant/30 mb-4 block">
              task_alt
            </span>
            <p className="text-on-surface-variant">No pending leave approvals.</p>
          </div>
        )}

        <div className="space-y-4">
          {loading
            ? [1, 2, 3].map((i) => (
                <div key={i} className="h-40 rounded-2xl bg-surface-container-high animate-pulse" />
              ))
            : pending.map((leave) => (
                <div
                  key={leave.id}
                  className="rounded-2xl bg-surface-container-lowest border border-outline-variant/10 p-5 md:p-6"
                >
                  <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="inline-flex items-center justify-center w-9 h-9 rounded-full bg-primary/10 text-primary text-sm font-bold">
                          {leave.applicant_name.charAt(0).toUpperCase()}
                        </span>
                        <div>
                          <p className="font-semibold text-on-surface">{leave.applicant_name}</p>
                          <p className="text-xs text-on-surface-variant">
                            Applied {formatDate(leave.applied_at)}
                          </p>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-3 text-sm">
                        <div>
                          <p className="text-xs text-on-surface-variant">Type</p>
                          <p className="font-medium text-on-surface">{leave.leave_type_name}</p>
                        </div>
                        <div>
                          <p className="text-xs text-on-surface-variant">Dates</p>
                          <p className="font-medium text-on-surface">
                            {formatDate(leave.start_date)} &ndash; {formatDate(leave.end_date)}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-on-surface-variant">Days</p>
                          <p className="font-medium text-on-surface">
                            {leave.days_count}{leave.is_half_day ? ' (Half)' : ''}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-on-surface-variant">Reason</p>
                          <p className="font-medium text-on-surface truncate" title={leave.reason}>
                            {leave.reason}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col gap-3 md:w-64 shrink-0">
                      <input
                        type="text"
                        placeholder="Remarks (optional)"
                        value={remarksMap[leave.id] ?? ''}
                        onChange={(e) =>
                          setRemarksMap((prev) => ({ ...prev, [leave.id]: e.target.value }))
                        }
                        className="w-full rounded-xl border border-outline-variant/30 bg-surface-container-lowest px-3 py-2 text-sm text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none focus:ring-2 focus:ring-primary/40"
                        aria-label={`Remarks for ${leave.applicant_name}`}
                      />
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleAction(leave.id, 'approved')}
                          disabled={processing === leave.id}
                          className="flex-1 rounded-xl bg-tertiary text-on-primary font-semibold py-2.5 text-sm hover:bg-tertiary/90 disabled:opacity-50 transition-colors"
                        >
                          {processing === leave.id ? '...' : 'Approve'}
                        </button>
                        <button
                          onClick={() => handleAction(leave.id, 'rejected')}
                          disabled={processing === leave.id}
                          className="flex-1 rounded-xl bg-error/10 text-error font-semibold py-2.5 text-sm hover:bg-error/20 disabled:opacity-50 transition-colors"
                        >
                          {processing === leave.id ? '...' : 'Reject'}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
        </div>
      </div>
    </PageLayout>
  )
}
