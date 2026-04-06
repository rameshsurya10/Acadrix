import { useState, useEffect } from 'react'
import PageLayout from '@/components/layout/PageLayout'
import { adminService, type TuitionAccountItem, type FinanceStats } from '@/services/admin/adminService'
import { SkeletonMetricCard, SkeletonTableRow } from '@/components/shared/Skeleton'

const STATUS_BADGES: Record<string, { label: string; bg: string; text: string }> = {
  paid:    { label: 'Paid',    bg: 'bg-tertiary-container/10', text: 'text-tertiary' },
  overdue: { label: 'Overdue', bg: 'bg-error-container',       text: 'text-error' },
  pending: { label: 'Pending', bg: 'bg-secondary-container',   text: 'text-on-secondary-container' },
  partial: { label: 'Partial', bg: 'bg-primary-fixed/30',      text: 'text-primary' },
}

function formatCurrency(val: string | number) {
  const num = typeof val === 'string' ? parseFloat(val) : val
  if (isNaN(num)) return '$0.00'
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(num)
}

export default function FinancePage() {
  const [accounts, setAccounts] = useState<TuitionAccountItem[]>([])
  const [stats, setStats] = useState<FinanceStats | null>(null)
  const [pagination, setPagination] = useState({ total: 0, page: 1, page_size: 25 })
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')

  useEffect(() => {
    async function load() {
      setLoading(true)
      try {
        const params: Record<string, string> = { page: String(pagination.page), page_size: '25' }
        if (search) params.search = search
        if (statusFilter) params.status = statusFilter
        const result = await adminService.getFinanceOverview(params)
        setAccounts(result.data)
        setStats(result.stats)
        setPagination(result.pagination)
      } catch (err) {
        console.error('Failed to load finance:', err)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [search, statusFilter, pagination.page])

  function goPage(dir: number) {
    setPagination(prev => ({ ...prev, page: prev.page + dir }))
  }

  function getInitials(name: string) {
    return name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
  }

  const totalPages = Math.ceil(pagination.total / pagination.page_size) || 1

  return (
    <PageLayout>
      <main className="flex-grow container mx-auto px-4 md:px-6 py-6 md:py-10 pb-32">
        {/* Header */}
        <section className="mb-8 md:mb-12">
          <p className="font-label text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-2">Financial Overview</p>
          <h2 className="font-headline text-3xl md:text-4xl font-extrabold text-on-surface tracking-tight">Institutional Billing</h2>
        </section>

        {/* Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-8 mb-8 md:mb-12">
          {loading ? (
            <>
              <div className="sm:col-span-2"><SkeletonMetricCard className="min-h-[180px] md:min-h-[220px]" /></div>
              <SkeletonMetricCard />
              <SkeletonMetricCard />
            </>
          ) : stats && (
            <>
              {/* Total Revenue */}
              <div className="sm:col-span-2 bg-surface-container-lowest p-6 md:p-8 rounded-xl flex flex-col justify-between min-h-[180px] md:min-h-[220px]">
                <div>
                  <div className="flex justify-between items-start mb-4">
                    <span className="p-2 bg-secondary-container rounded-lg">
                      <span className="material-symbols-outlined text-primary">account_balance_wallet</span>
                    </span>
                    {stats.collection_rate > 0 && (
                      <span className="text-tertiary font-bold flex items-center gap-1 text-sm">
                        <span className="material-symbols-outlined text-sm">trending_up</span>
                        {stats.collection_rate}%
                      </span>
                    )}
                  </div>
                  <p className="text-sm font-medium text-on-surface-variant">Total Annual Revenue</p>
                  <h3 className="font-headline text-3xl md:text-5xl font-black text-on-surface mt-2">{formatCurrency(stats.total_revenue)}</h3>
                </div>
                <div className="mt-6 flex gap-2">
                  <span className="w-full h-1 bg-surface-container-high rounded-full overflow-hidden">
                    <span className="block h-full bg-primary" style={{ width: `${stats.collection_rate}%` }} />
                  </span>
                </div>
              </div>

              {/* Collection Rate */}
              <div className="bg-surface-container-low p-6 md:p-8 rounded-xl flex flex-col justify-between">
                <div>
                  <p className="text-sm font-medium text-on-surface-variant mb-1">Collection Rate</p>
                  <h3 className="font-headline text-2xl md:text-3xl font-bold text-on-surface">{stats.collection_rate}%</h3>
                </div>
                <div className="text-xs text-on-surface-variant mt-4 space-y-1">
                  <p>{stats.paid_count} paid</p>
                  <p>{stats.partial_count} partial</p>
                </div>
              </div>

              {/* Outstanding */}
              <div className="bg-error-container p-6 md:p-8 rounded-xl flex flex-col justify-between">
                <div>
                  <p className="text-sm font-medium text-on-error-container mb-1">Outstanding</p>
                  <h3 className="font-headline text-2xl md:text-3xl font-bold text-error">{formatCurrency(stats.outstanding)}</h3>
                </div>
                <div className="flex items-center gap-2 mt-4">
                  {stats.overdue_count > 0 && <div className="w-2 h-2 rounded-full bg-error animate-pulse" />}
                  <p className="text-[10px] uppercase tracking-tighter font-bold text-on-error-container">{stats.overdue_count} Overdue Accounts</p>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Search & Filter */}
        <div className="flex flex-col md:flex-row justify-between items-stretch md:items-center gap-4 md:gap-6 mb-6 md:mb-8">
          <div className="w-full md:w-96 relative">
            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline">search</span>
            <input
              className="w-full pl-12 pr-4 py-3 bg-surface-container-lowest border-none rounded-lg focus:ring-2 focus:ring-primary/20 text-sm placeholder:text-outline-variant"
              placeholder="Search accounts, students, or IDs..."
              type="text"
              value={search}
              onChange={e => { setSearch(e.target.value); setPagination(p => ({ ...p, page: 1 })) }}
            />
          </div>
          <div className="flex items-center gap-3">
            <select
              className="flex-1 md:flex-none px-4 md:px-6 py-3 bg-surface-container-low border-none rounded-lg text-on-surface font-semibold text-sm focus:ring-primary cursor-pointer"
              value={statusFilter}
              onChange={e => { setStatusFilter(e.target.value); setPagination(p => ({ ...p, page: 1 })) }}
            >
              <option value="">All Status</option>
              <option value="paid">Paid</option>
              <option value="overdue">Overdue</option>
              <option value="pending">Pending</option>
              <option value="partial">Partial</option>
            </select>
          </div>
        </div>

        {/* Accounts Table */}
        <div className="bg-surface-container-lowest rounded-xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left min-w-[600px]">
              <thead>
                <tr className="bg-surface-container-low text-on-surface-variant">
                  <th className="px-4 md:px-6 py-4 font-bold text-[10px] uppercase tracking-widest">Student / Account</th>
                  <th className="px-4 md:px-6 py-4 font-bold text-[10px] uppercase tracking-widest">Status</th>
                  <th className="px-4 md:px-6 py-4 font-bold text-[10px] uppercase tracking-widest hidden md:table-cell">Semester</th>
                  <th className="px-4 md:px-6 py-4 font-bold text-[10px] uppercase tracking-widest">Amount Due</th>
                  <th className="px-4 md:px-6 py-4 font-bold text-[10px] uppercase tracking-widest hidden md:table-cell">Paid</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-container-low">
                {loading ? (
                  Array.from({ length: 5 }).map((_, i) => <SkeletonTableRow key={i} cols={5} />)
                ) : accounts.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-on-surface-variant">
                      No tuition accounts found.
                    </td>
                  </tr>
                ) : (
                  accounts.map(acct => {
                    const badge = STATUS_BADGES[acct.status] || STATUS_BADGES.pending
                    const outstanding = parseFloat(acct.outstanding)
                    return (
                      <tr key={acct.id} className="hover:bg-surface-container-low/50 transition-colors">
                        <td className="px-4 md:px-6 py-4 md:py-5">
                          <div className="flex items-center gap-3 md:gap-4">
                            <div className="w-9 h-9 md:w-10 md:h-10 rounded-full bg-surface-container-high flex items-center justify-center font-bold text-primary font-headline text-sm">
                              {getInitials(acct.student_name)}
                            </div>
                            <div>
                              <p className="font-semibold text-on-surface text-sm">{acct.student_name}</p>
                              <p className="text-xs text-on-surface-variant">ID: {acct.student_id}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 md:px-6 py-4 md:py-5">
                          <span className={`inline-flex items-center px-2 py-1 rounded-full ${badge.bg} ${badge.text} text-[10px] font-bold uppercase tracking-tighter`}>
                            {badge.label}
                          </span>
                        </td>
                        <td className="px-4 md:px-6 py-4 md:py-5 hidden md:table-cell">
                          <p className="text-sm text-on-surface">{acct.semester || '—'}</p>
                        </td>
                        <td className={`px-4 md:px-6 py-4 md:py-5 font-headline font-bold ${outstanding > 0 ? 'text-error' : 'text-on-surface'}`}>
                          {formatCurrency(acct.outstanding)}
                        </td>
                        <td className="px-4 md:px-6 py-4 md:py-5 hidden md:table-cell font-headline font-bold text-on-surface">
                          {formatCurrency(acct.paid_amount)}
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>
          {/* Pagination */}
          {!loading && (
            <div className="px-4 md:px-6 py-4 bg-surface-container-low flex justify-between items-center">
              <p className="text-xs text-on-surface-variant">
                Page {pagination.page} of {totalPages} ({pagination.total} accounts)
              </p>
              <div className="flex gap-2">
                <button
                  className="p-1 hover:bg-surface-container-high rounded disabled:opacity-30"
                  disabled={pagination.page <= 1}
                  onClick={() => goPage(-1)}
                >
                  <span className="material-symbols-outlined text-sm">chevron_left</span>
                </button>
                <button
                  className="p-1 hover:bg-surface-container-high rounded disabled:opacity-30"
                  disabled={pagination.page >= totalPages}
                  onClick={() => goPage(1)}
                >
                  <span className="material-symbols-outlined text-sm">chevron_right</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </main>
    </PageLayout>
  )
}
