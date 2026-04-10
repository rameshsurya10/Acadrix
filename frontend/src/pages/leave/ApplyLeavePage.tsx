import { useState, useEffect } from 'react'
import PageLayout from '@/components/layout/PageLayout'
import { leaveService, type LeaveType } from '@/services/leave/leaveService'

export default function ApplyLeavePage() {
  const [leaveTypes, setLeaveTypes] = useState<LeaveType[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  // Form state
  const [leaveTypeId, setLeaveTypeId] = useState<number | ''>('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [isHalfDay, setIsHalfDay] = useState(false)
  const [reason, setReason] = useState('')

  useEffect(() => {
    async function loadTypes() {
      try {
        const types = await leaveService.getTypes()
        setLeaveTypes(types.filter((t) => t.is_active))
      } catch {
        setError('Failed to load leave types.')
      } finally {
        setLoading(false)
      }
    }
    loadTypes()
  }, [])

  function resetForm() {
    setLeaveTypeId('')
    setStartDate('')
    setEndDate('')
    setIsHalfDay(false)
    setReason('')
    setError('')
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!leaveTypeId) { setError('Please select a leave type.'); return }
    if (!startDate) { setError('Please select a start date.'); return }
    if (!endDate) { setError('Please select an end date.'); return }
    if (!reason.trim()) { setError('Please provide a reason.'); return }
    if (new Date(endDate) < new Date(startDate)) { setError('End date cannot be before start date.'); return }

    setSubmitting(true)
    setError('')
    try {
      await leaveService.applyLeave({
        leave_type: Number(leaveTypeId),
        start_date: startDate,
        end_date: endDate,
        is_half_day: isHalfDay,
        reason: reason.trim(),
      })
      setSuccess(true)
      resetForm()
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to submit leave application.'
      setError(msg)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <PageLayout>
      <div className="px-4 md:px-8 py-8 max-w-2xl mx-auto">
        <span className="font-label text-xs font-semibold tracking-widest text-on-surface-variant uppercase mb-2 block">
          Leave
        </span>
        <h2 className="font-headline font-extrabold text-3xl md:text-4xl text-on-surface mb-8">
          Apply for Leave
        </h2>

        {success && (
          <div className="mb-6 rounded-xl bg-tertiary/10 text-tertiary px-5 py-4 text-sm font-medium flex items-center gap-3">
            <span className="material-symbols-outlined text-lg">check_circle</span>
            Leave application submitted successfully!
            <button
              onClick={() => setSuccess(false)}
              className="ml-auto text-tertiary/70 hover:text-tertiary"
              aria-label="Dismiss"
            >
              <span className="material-symbols-outlined text-lg">close</span>
            </button>
          </div>
        )}

        {error && (
          <div className="mb-6 rounded-xl bg-error/10 text-error px-5 py-4 text-sm font-medium flex items-center gap-3">
            <span className="material-symbols-outlined text-lg">error</span>
            {error}
          </div>
        )}

        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-12 rounded-xl bg-surface-container-high animate-pulse" />
            ))}
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Leave Type */}
            <div>
              <label htmlFor="leaveType" className="block text-sm font-medium text-on-surface-variant mb-1.5">
                Leave Type
              </label>
              <select
                id="leaveType"
                value={leaveTypeId}
                onChange={(e) => setLeaveTypeId(e.target.value ? Number(e.target.value) : '')}
                className="w-full rounded-xl border border-outline-variant/30 bg-surface-container-lowest px-4 py-3 text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/40"
              >
                <option value="">Select a leave type</option>
                {leaveTypes.map((lt) => (
                  <option key={lt.id} value={lt.id}>
                    {lt.name} (Quota: {lt.annual_quota} days)
                  </option>
                ))}
              </select>
            </div>

            {/* Date Range */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="startDate" className="block text-sm font-medium text-on-surface-variant mb-1.5">
                  Start Date
                </label>
                <input
                  id="startDate"
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full rounded-xl border border-outline-variant/30 bg-surface-container-lowest px-4 py-3 text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/40"
                />
              </div>
              <div>
                <label htmlFor="endDate" className="block text-sm font-medium text-on-surface-variant mb-1.5">
                  End Date
                </label>
                <input
                  id="endDate"
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full rounded-xl border border-outline-variant/30 bg-surface-container-lowest px-4 py-3 text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/40"
                />
              </div>
            </div>

            {/* Half Day */}
            <label htmlFor="halfDay" className="flex items-center gap-3 cursor-pointer">
              <input
                id="halfDay"
                type="checkbox"
                checked={isHalfDay}
                onChange={(e) => setIsHalfDay(e.target.checked)}
                className="h-5 w-5 rounded border-outline-variant/30 text-primary focus:ring-primary/40"
              />
              <span className="text-sm text-on-surface-variant">Half day leave</span>
            </label>

            {/* Reason */}
            <div>
              <label htmlFor="reason" className="block text-sm font-medium text-on-surface-variant mb-1.5">
                Reason
              </label>
              <textarea
                id="reason"
                rows={4}
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Describe the reason for your leave..."
                className="w-full rounded-xl border border-outline-variant/30 bg-surface-container-lowest px-4 py-3 text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none focus:ring-2 focus:ring-primary/40 resize-none"
              />
            </div>

            {/* Attachment (visual only -- backend support TBD) */}
            <div>
              <label htmlFor="attachment" className="block text-sm font-medium text-on-surface-variant mb-1.5">
                Attachment (optional)
              </label>
              <input
                id="attachment"
                type="file"
                className="w-full text-sm text-on-surface-variant file:mr-4 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-medium file:bg-primary/10 file:text-primary hover:file:bg-primary/20 cursor-pointer"
              />
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={submitting}
              className="w-full rounded-xl bg-primary text-on-primary font-semibold py-3.5 text-sm hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {submitting ? 'Submitting...' : 'Submit Application'}
            </button>
          </form>
        )}
      </div>
    </PageLayout>
  )
}
