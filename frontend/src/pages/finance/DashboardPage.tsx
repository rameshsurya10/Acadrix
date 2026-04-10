import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import PageLayout from '@/components/layout/PageLayout'
import { adminService, type FinanceStats } from '@/services/admin/adminService'
import { SkeletonMetricCard } from '@/components/shared/Skeleton'

export default function FinanceDashboardPage() {
  const navigate = useNavigate()
  const [stats, setStats] = useState<FinanceStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    adminService.getFinanceOverview()
      .then(res => setStats(res.stats))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  function fmt(val: string | number) {
    return Number(val).toLocaleString('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 })
  }

  return (
    <PageLayout>
      <main className="max-w-7xl mx-auto px-4 md:px-6 py-10 pb-32">
        <div className="mb-10">
          <span className="font-label text-xs font-semibold tracking-widest text-on-surface-variant uppercase mb-2 block">Finance</span>
          <h2 className="font-headline font-extrabold text-3xl md:text-4xl text-on-surface tracking-tight">Financial Overview</h2>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
          {loading ? (
            Array.from({ length: 4 }).map((_, i) => <SkeletonMetricCard key={i} />)
          ) : stats && (
            <>
              <div className="bg-primary bg-gradient-to-br from-primary to-primary-container p-6 rounded-xl text-on-primary">
                <p className="font-label text-xs font-medium text-on-primary/80 uppercase tracking-wider mb-4">Total Revenue</p>
                <span className="font-headline font-bold text-2xl">{fmt(stats.total_revenue)}</span>
              </div>
              <div className="bg-surface-container-lowest p-6 rounded-xl">
                <p className="font-label text-xs font-medium text-on-surface-variant uppercase tracking-wider mb-4">Collected</p>
                <div className="flex items-end justify-between">
                  <span className="font-headline font-bold text-2xl">{fmt(stats.total_collected)}</span>
                  <span className="text-sm font-bold text-tertiary">{stats.collection_rate}%</span>
                </div>
                <div className="mt-3 h-2 bg-surface-container-high rounded-full overflow-hidden">
                  <div className="h-full bg-tertiary rounded-full" style={{ width: `${stats.collection_rate}%` }} />
                </div>
              </div>
              <div className="bg-surface-container-lowest p-6 rounded-xl">
                <p className="font-label text-xs font-medium text-on-surface-variant uppercase tracking-wider mb-4">Outstanding</p>
                <div className="flex items-end justify-between">
                  <span className="font-headline font-bold text-2xl">{fmt(stats.outstanding)}</span>
                  {stats.overdue_count > 0 && <div className="w-2 h-2 rounded-full bg-error animate-pulse" />}
                </div>
              </div>
              <div className="bg-surface-container-lowest p-6 rounded-xl">
                <p className="font-label text-xs font-medium text-on-surface-variant uppercase tracking-wider mb-4">Accounts</p>
                <div className="flex items-end justify-between">
                  <span className="font-headline font-bold text-2xl">{stats.total_accounts}</span>
                  <span className="material-symbols-outlined text-on-surface-variant">account_balance</span>
                </div>
                <p className="text-xs text-on-surface-variant mt-2">
                  {stats.paid_count} paid · {stats.overdue_count} overdue · {stats.pending_count} pending
                </p>
              </div>
            </>
          )}
        </div>

        {/* Quick Actions */}
        <h3 className="font-headline font-bold text-xl mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <button onClick={() => navigate('/finance/fee-templates')}
            className="bg-surface-container-lowest p-6 rounded-xl text-left hover:shadow-md transition-shadow group">
            <span className="material-symbols-outlined text-primary text-2xl mb-3">receipt_long</span>
            <h4 className="font-bold text-sm mb-1">Fee Templates</h4>
            <p className="text-xs text-on-surface-variant">Create and manage fee structures by grade</p>
          </button>
          <button onClick={() => navigate('/finance/payments')}
            className="bg-surface-container-lowest p-6 rounded-xl text-left hover:shadow-md transition-shadow group">
            <span className="material-symbols-outlined text-tertiary text-2xl mb-3">add_card</span>
            <h4 className="font-bold text-sm mb-1">Record Payment</h4>
            <p className="text-xs text-on-surface-variant">Record cash, cheque, or card payments</p>
          </button>
          <button onClick={() => navigate('/finance/discounts')}
            className="bg-surface-container-lowest p-6 rounded-xl text-left hover:shadow-md transition-shadow group">
            <span className="material-symbols-outlined text-secondary text-2xl mb-3">loyalty</span>
            <h4 className="font-bold text-sm mb-1">Discounts & Scholarships</h4>
            <p className="text-xs text-on-surface-variant">Manage per-student fee adjustments</p>
          </button>
        </div>
      </main>
    </PageLayout>
  )
}
