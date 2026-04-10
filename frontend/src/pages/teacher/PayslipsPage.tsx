import { useState, useEffect } from 'react'
import PageLayout from '@/components/layout/PageLayout'
import { hrService, type PayslipEntry } from '@/services/hr/hrService'

const MONTH_NAMES = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']

const STATUS_STYLES: Record<string, { label: string; bg: string; text: string }> = {
  draft:     { label: 'Draft',     bg: 'bg-secondary-container',    text: 'text-on-secondary-container' },
  processed: { label: 'Processed', bg: 'bg-primary/10',             text: 'text-primary' },
  finalized: { label: 'Finalized', bg: 'bg-tertiary/10',            text: 'text-tertiary' },
}

function formatCurrency(val: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(val)
}

export default function PayslipsPage() {
  const [payslips, setPayslips] = useState<PayslipEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [expandedId, setExpandedId] = useState<number | null>(null)

  useEffect(() => {
    async function load() {
      try {
        const data = await hrService.getMyPayslips()
        setPayslips(data)
      } catch {
        setError('Failed to load payslips.')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  function toggleExpand(id: number) {
    setExpandedId((prev) => (prev === id ? null : id))
  }

  return (
    <PageLayout>
      <div className="px-4 md:px-8 py-8">
        <span className="font-label text-xs font-semibold tracking-widest text-on-surface-variant uppercase mb-2 block">
          My Account
        </span>
        <h2 className="font-headline font-extrabold text-3xl md:text-4xl text-on-surface mb-8">
          My Payslips
        </h2>

        {error && (
          <div className="mb-6 rounded-xl bg-error/10 text-error px-5 py-4 text-sm font-medium flex items-center gap-3">
            <span className="material-symbols-outlined text-lg">error</span>
            {error}
          </div>
        )}

        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-24 rounded-2xl bg-surface-container-high animate-pulse" />
            ))}
          </div>
        ) : payslips.length === 0 ? (
          <div className="text-center py-16">
            <span className="material-symbols-outlined text-5xl text-on-surface-variant/30 mb-4 block">
              receipt_long
            </span>
            <p className="text-on-surface-variant">No payslips available yet.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {payslips.map((slip) => {
              const badge = STATUS_STYLES[slip.status] ?? STATUS_STYLES.draft
              const isExpanded = expandedId === slip.id
              return (
                <div
                  key={slip.id}
                  className="rounded-2xl bg-surface-container-lowest border border-outline-variant/10 overflow-hidden"
                >
                  {/* Summary Row */}
                  <button
                    onClick={() => toggleExpand(slip.id)}
                    className="w-full px-5 py-5 flex items-center justify-between gap-4 text-left hover:bg-surface-container-low/40 transition-colors"
                    aria-expanded={isExpanded}
                    aria-label={`Payslip details for ${MONTH_NAMES[(slip.working_days > 0 ? slip.working_days : 1) - 1] ?? 'period'}`}
                  >
                    <div className="flex items-center gap-4 min-w-0">
                      <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-primary/10 text-primary shrink-0">
                        <span className="material-symbols-outlined text-xl">receipt_long</span>
                      </div>
                      <div className="min-w-0">
                        <p className="font-semibold text-on-surface">Payslip #{slip.id}</p>
                        <p className="text-xs text-on-surface-variant">
                          {slip.days_present} of {slip.working_days} working days
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 shrink-0">
                      <div className="text-right hidden sm:block">
                        <p className="text-xs text-on-surface-variant">Gross</p>
                        <p className="font-medium text-on-surface">{formatCurrency(slip.gross_salary)}</p>
                      </div>
                      <div className="text-right hidden sm:block">
                        <p className="text-xs text-on-surface-variant">Deductions</p>
                        <p className="font-medium text-error">{formatCurrency(slip.total_deductions)}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-on-surface-variant">Net Pay</p>
                        <p className="font-bold text-on-surface text-lg">{formatCurrency(slip.net_salary)}</p>
                      </div>
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${badge.bg} ${badge.text}`}
                      >
                        {badge.label}
                      </span>
                      <span className={`material-symbols-outlined text-on-surface-variant transition-transform ${isExpanded ? 'rotate-180' : ''}`}>
                        expand_more
                      </span>
                    </div>
                  </button>

                  {/* Expanded Detail */}
                  {isExpanded && (
                    <div className="px-5 pb-5 border-t border-outline-variant/10">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-5">
                        {/* Earnings */}
                        <div>
                          <p className="text-xs font-semibold text-on-surface-variant uppercase tracking-wide mb-3">Earnings</p>
                          <div className="space-y-2">
                            {[
                              { label: 'Basic', amount: slip.basic },
                              { label: 'HRA', amount: slip.hra },
                              { label: 'DA', amount: slip.da },
                              { label: 'Bonus', amount: slip.bonus },
                            ].map((item) => (
                              <div key={item.label} className="flex justify-between text-sm">
                                <span className="text-on-surface-variant">{item.label}</span>
                                <span className="font-medium text-on-surface">{formatCurrency(item.amount)}</span>
                              </div>
                            ))}
                            <div className="flex justify-between text-sm pt-2 border-t border-outline-variant/10">
                              <span className="font-semibold text-on-surface">Total Earnings</span>
                              <span className="font-bold text-on-surface">{formatCurrency(slip.gross_salary)}</span>
                            </div>
                          </div>
                        </div>

                        {/* Deductions */}
                        <div>
                          <p className="text-xs font-semibold text-on-surface-variant uppercase tracking-wide mb-3">Deductions</p>
                          <div className="space-y-2">
                            {[
                              { label: 'Provident Fund', amount: slip.pf_employee },
                              { label: 'ESI', amount: slip.esi_employee },
                              { label: 'Professional Tax', amount: slip.professional_tax },
                              { label: 'TDS', amount: slip.tds },
                            ].map((item) => (
                              <div key={item.label} className="flex justify-between text-sm">
                                <span className="text-on-surface-variant">{item.label}</span>
                                <span className="font-medium text-error">{formatCurrency(item.amount)}</span>
                              </div>
                            ))}
                            <div className="flex justify-between text-sm pt-2 border-t border-outline-variant/10">
                              <span className="font-semibold text-on-surface">Total Deductions</span>
                              <span className="font-bold text-error">{formatCurrency(slip.total_deductions)}</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Net Summary */}
                      <div className="mt-5 rounded-xl bg-primary/5 px-5 py-4 flex items-center justify-between">
                        <span className="font-semibold text-on-surface">Net Salary</span>
                        <span className="text-2xl font-extrabold text-primary">{formatCurrency(slip.net_salary)}</span>
                      </div>

                      {/* Attendance */}
                      <div className="mt-4 flex gap-6 text-sm">
                        <div>
                          <span className="text-on-surface-variant">Working Days: </span>
                          <span className="font-medium text-on-surface">{slip.working_days}</span>
                        </div>
                        <div>
                          <span className="text-on-surface-variant">Present: </span>
                          <span className="font-medium text-tertiary">{slip.days_present}</span>
                        </div>
                        <div>
                          <span className="text-on-surface-variant">Absent: </span>
                          <span className="font-medium text-error">{slip.days_absent}</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>
    </PageLayout>
  )
}
