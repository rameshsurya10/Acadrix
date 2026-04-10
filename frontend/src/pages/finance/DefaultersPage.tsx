import { useState, useEffect, useMemo } from 'react'
import PageLayout from '@/components/layout/PageLayout'
import { adminService, type FeeDefaulter } from '@/services/admin/adminService'
import { SkeletonMetricCard } from '@/components/shared/Skeleton'

const STATUS_OPTIONS = ['All', 'Overdue', 'Pending', 'Partial'] as const

function statusBadge(status: string) {
  const s = status.toLowerCase()
  if (s === 'overdue') return 'bg-error/10 text-error'
  if (s === 'pending') return 'bg-yellow-100 text-yellow-700'
  if (s === 'partial') return 'bg-blue-100 text-blue-700'
  return 'bg-surface-container-high text-on-surface-variant'
}

function daysColor(days: number) {
  if (days > 30) return 'text-error font-bold'
  if (days > 15) return 'text-yellow-600 font-semibold'
  return 'text-on-surface-variant'
}

function fmt(val: string | number) {
  return Number(val).toLocaleString('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 })
}

export default function DefaultersPage() {
  const [defaulters, setDefaulters] = useState<FeeDefaulter[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('All')
  const [search, setSearch] = useState('')
  const [toast, setToast] = useState('')

  useEffect(() => {
    adminService.getFeeDefaulters()
      .then(setDefaulters)
      .catch(() => setError('Failed to load fee defaulters.'))
      .finally(() => setLoading(false))
  }, [])

  const filtered = useMemo(() => {
    let list = defaulters
    if (statusFilter !== 'All') {
      list = list.filter(d => d.status.toLowerCase() === statusFilter.toLowerCase())
    }
    if (search.trim()) {
      const q = search.trim().toLowerCase()
      list = list.filter(d =>
        d.student_name.toLowerCase().includes(q) ||
        d.student_id.toLowerCase().includes(q)
      )
    }
    return list
  }, [defaulters, statusFilter, search])

  const summaryStats = useMemo(() => {
    const totalDefaulters = defaulters.length
    const totalOutstanding = defaulters.reduce((sum, d) => sum + Number(d.outstanding_balance), 0)
    const mostOverdue = defaulters.reduce((max, d) => Math.max(max, d.days_overdue), 0)
    const critical = defaulters.filter(d => d.days_overdue > 30).length
    return { totalDefaulters, totalOutstanding, mostOverdue, critical }
  }, [defaulters])

  function handleReminder() {
    setToast('Reminder feature coming soon')
    setTimeout(() => setToast(''), 3000)
  }

  return (
    <PageLayout>
      <main className="max-w-7xl mx-auto px-4 md:px-6 py-10 pb-32">
        {/* Header */}
        <div className="mb-10">
          <span className="font-label text-xs font-semibold tracking-widest text-on-surface-variant uppercase mb-2 block">Finance</span>
          <h2 className="font-headline font-extrabold text-3xl md:text-4xl text-on-surface tracking-tight">Fee Defaulters</h2>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {loading ? (
            Array.from({ length: 4 }).map((_, i) => <SkeletonMetricCard key={i} />)
          ) : (
            <>
              <div className="bg-surface-container-lowest p-6 rounded-xl">
                <p className="font-label text-xs font-medium text-on-surface-variant uppercase tracking-wider mb-4">Total Defaulters</p>
                <div className="flex items-end justify-between">
                  <span className="font-headline font-bold text-2xl">{summaryStats.totalDefaulters}</span>
                  <span className="material-symbols-outlined text-on-surface-variant">group</span>
                </div>
              </div>
              <div className="bg-surface-container-lowest p-6 rounded-xl">
                <p className="font-label text-xs font-medium text-on-surface-variant uppercase tracking-wider mb-4">Total Outstanding</p>
                <div className="flex items-end justify-between">
                  <span className="font-headline font-bold text-2xl text-error">{fmt(summaryStats.totalOutstanding)}</span>
                  <span className="material-symbols-outlined text-error">account_balance_wallet</span>
                </div>
              </div>
              <div className="bg-surface-container-lowest p-6 rounded-xl">
                <p className="font-label text-xs font-medium text-on-surface-variant uppercase tracking-wider mb-4">Most Overdue</p>
                <div className="flex items-end justify-between">
                  <span className="font-headline font-bold text-2xl">{summaryStats.mostOverdue} days</span>
                  <span className="material-symbols-outlined text-yellow-600">schedule</span>
                </div>
              </div>
              <div className="bg-error bg-gradient-to-br from-error to-error/80 p-6 rounded-xl text-on-error">
                <p className="font-label text-xs font-medium text-on-error/80 uppercase tracking-wider mb-4">Critical (&gt;30 days)</p>
                <div className="flex items-end justify-between">
                  <span className="font-headline font-bold text-2xl">{summaryStats.critical}</span>
                  <span className="material-symbols-outlined text-on-error">warning</span>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1 max-w-sm">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-xl">search</span>
            <input
              type="text"
              placeholder="Search by student name or ID..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-surface-container-lowest border border-outline-variant/20 text-sm text-on-surface placeholder:text-on-surface-variant focus:outline-none focus:ring-2 focus:ring-primary/30"
              aria-label="Search students"
            />
          </div>
          <div className="flex gap-2 flex-wrap">
            {STATUS_OPTIONS.map(opt => (
              <button
                key={opt}
                onClick={() => setStatusFilter(opt)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  statusFilter === opt
                    ? 'bg-primary text-on-primary'
                    : 'bg-surface-container-lowest text-on-surface-variant hover:bg-surface-container-low'
                }`}
                aria-pressed={statusFilter === opt}
              >
                {opt}
              </button>
            ))}
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="bg-error/10 text-error px-4 py-3 rounded-xl mb-6 text-sm">{error}</div>
        )}

        {/* Table */}
        {!loading && !error && filtered.length === 0 ? (
          <div className="bg-surface-container-lowest rounded-xl p-12 text-center">
            <span className="material-symbols-outlined text-5xl text-tertiary mb-4">check_circle</span>
            <h3 className="font-headline font-bold text-lg text-on-surface mb-2">No fee defaulters found</h3>
            <p className="text-sm text-on-surface-variant">All students are up to date!</p>
          </div>
        ) : !loading && (
          <div className="bg-surface-container-lowest rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm" role="table" aria-label="Fee defaulters table">
                <thead>
                  <tr className="border-b border-outline-variant/10">
                    <th className="text-left px-4 py-3 font-semibold text-on-surface-variant text-xs uppercase tracking-wider">Student</th>
                    <th className="text-left px-4 py-3 font-semibold text-on-surface-variant text-xs uppercase tracking-wider">Section</th>
                    <th className="text-right px-4 py-3 font-semibold text-on-surface-variant text-xs uppercase tracking-wider">Total Fees</th>
                    <th className="text-right px-4 py-3 font-semibold text-on-surface-variant text-xs uppercase tracking-wider">Paid</th>
                    <th className="text-right px-4 py-3 font-semibold text-on-surface-variant text-xs uppercase tracking-wider">Outstanding</th>
                    <th className="text-center px-4 py-3 font-semibold text-on-surface-variant text-xs uppercase tracking-wider">Status</th>
                    <th className="text-left px-4 py-3 font-semibold text-on-surface-variant text-xs uppercase tracking-wider">Due Date</th>
                    <th className="text-center px-4 py-3 font-semibold text-on-surface-variant text-xs uppercase tracking-wider">Days Overdue</th>
                    <th className="text-center px-4 py-3 font-semibold text-on-surface-variant text-xs uppercase tracking-wider">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(d => (
                    <tr key={d.student_id} className="border-b border-outline-variant/5 hover:bg-surface-container-low/50 transition-colors">
                      <td className="px-4 py-3">
                        <p className="font-medium text-on-surface">{d.student_name}</p>
                        <p className="text-xs text-on-surface-variant">{d.student_id}</p>
                      </td>
                      <td className="px-4 py-3 text-on-surface-variant">{d.section ?? '-'}</td>
                      <td className="px-4 py-3 text-right text-on-surface">{fmt(d.total_amount)}</td>
                      <td className="px-4 py-3 text-right text-on-surface">{fmt(d.paid_amount)}</td>
                      <td className="px-4 py-3 text-right font-bold text-error">{fmt(d.outstanding_balance)}</td>
                      <td className="px-4 py-3 text-center">
                        <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-semibold capitalize ${statusBadge(d.status)}`}>
                          {d.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-on-surface-variant">
                        {d.due_date ? new Date(d.due_date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '-'}
                      </td>
                      <td className={`px-4 py-3 text-center ${daysColor(d.days_overdue)}`}>
                        {d.days_overdue > 0 ? d.days_overdue : '-'}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <button
                          onClick={handleReminder}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-primary/10 text-primary text-xs font-semibold hover:bg-primary/20 transition-colors"
                          aria-label={`Send reminder to ${d.student_name}`}
                        >
                          <span className="material-symbols-outlined text-sm">notifications</span>
                          Remind
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Loading skeleton table */}
        {loading && (
          <div className="bg-surface-container-lowest rounded-xl p-4 space-y-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-12 bg-surface-container-high rounded-lg animate-pulse" />
            ))}
          </div>
        )}

        {/* Toast */}
        {toast && (
          <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-inverse-surface text-inverse-on-surface px-5 py-3 rounded-xl shadow-lg text-sm font-medium z-50 animate-fade-in">
            {toast}
          </div>
        )}
      </main>
    </PageLayout>
  )
}
