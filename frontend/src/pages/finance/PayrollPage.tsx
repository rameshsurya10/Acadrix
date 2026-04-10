import { useState, useEffect, useCallback } from 'react'
import PageLayout from '@/components/layout/PageLayout'
import { hrService, type PayrollRun, type PayslipEntry } from '@/services/hr/hrService'

const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

const STATUS_STYLES: Record<string, { label: string; bg: string; text: string }> = {
  draft:     { label: 'Draft',     bg: 'bg-secondary-container',    text: 'text-on-secondary-container' },
  processed: { label: 'Processed', bg: 'bg-primary/10',             text: 'text-primary' },
  finalized: { label: 'Finalized', bg: 'bg-tertiary/10',            text: 'text-tertiary' },
}

function formatCurrency(val: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(val)
}

export default function PayrollPage() {
  const [runs, setRuns] = useState<PayrollRun[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  // New run form
  const [showForm, setShowForm] = useState(false)
  const [formMonth, setFormMonth] = useState<number>(new Date().getMonth() + 1)
  const [formYear, setFormYear] = useState<number>(new Date().getFullYear())
  const [formSaving, setFormSaving] = useState(false)

  // Payslips drill-down
  const [selectedRun, setSelectedRun] = useState<PayrollRun | null>(null)
  const [payslips, setPayslips] = useState<PayslipEntry[]>([])
  const [payslipsLoading, setPayslipsLoading] = useState(false)

  // Processing state
  const [processingId, setProcessingId] = useState<number | null>(null)
  const [finalizingId, setFinalizingId] = useState<number | null>(null)

  const loadRuns = useCallback(async () => {
    setLoading(true)
    try {
      const data = await hrService.getPayrollRuns()
      setRuns(data)
    } catch {
      setError('Failed to load payroll runs.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { loadRuns() }, [loadRuns])

  async function handleCreateRun(e: React.FormEvent) {
    e.preventDefault()
    setFormSaving(true)
    setError('')
    try {
      const created = await hrService.createPayrollRun({ month: formMonth, year: formYear })
      setRuns((prev) => [created, ...prev])
      setSuccess(`Payroll run for ${MONTH_NAMES[formMonth - 1]} ${formYear} created.`)
      setShowForm(false)
    } catch {
      setError('Failed to create payroll run.')
    } finally {
      setFormSaving(false)
    }
  }

  async function handleProcess(run: PayrollRun) {
    setProcessingId(run.id)
    setError('')
    try {
      await hrService.processPayroll({ payroll_run_id: run.id })
      setRuns((prev) => prev.map((r) => (r.id === run.id ? { ...r, status: 'processed' } : r)))
      setSuccess(`Payroll for ${MONTH_NAMES[run.month - 1]} ${run.year} processed.`)
    } catch {
      setError('Failed to process payroll.')
    } finally {
      setProcessingId(null)
    }
  }

  async function handleFinalize(run: PayrollRun) {
    setFinalizingId(run.id)
    setError('')
    try {
      await hrService.finalizePayroll({ payroll_run_id: run.id })
      setRuns((prev) => prev.map((r) => (r.id === run.id ? { ...r, status: 'finalized' } : r)))
      setSuccess(`Payroll for ${MONTH_NAMES[run.month - 1]} ${run.year} finalized.`)
    } catch {
      setError('Failed to finalize payroll.')
    } finally {
      setFinalizingId(null)
    }
  }

  async function handleViewPayslips(run: PayrollRun) {
    if (selectedRun?.id === run.id) {
      setSelectedRun(null)
      setPayslips([])
      return
    }
    setSelectedRun(run)
    setPayslipsLoading(true)
    try {
      const data = await hrService.getPayslips({ payroll_run_id: String(run.id) })
      setPayslips(data)
    } catch {
      setError('Failed to load payslips.')
    } finally {
      setPayslipsLoading(false)
    }
  }

  return (
    <PageLayout>
      <div className="px-4 md:px-8 py-8">
        <span className="font-label text-xs font-semibold tracking-widest text-on-surface-variant uppercase mb-2 block">
          Finance
        </span>
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-8">
          <h2 className="font-headline font-extrabold text-3xl md:text-4xl text-on-surface">
            Payroll Management
          </h2>
          <button
            onClick={() => setShowForm(!showForm)}
            className="rounded-xl bg-primary text-on-primary font-semibold px-5 py-2.5 text-sm hover:bg-primary/90 transition-colors"
          >
            {showForm ? 'Cancel' : 'New Payroll Run'}
          </button>
        </div>

        {success && (
          <div className="mb-6 rounded-xl bg-tertiary/10 text-tertiary px-5 py-4 text-sm font-medium flex items-center gap-3">
            <span className="material-symbols-outlined text-lg">check_circle</span>
            {success}
            <button onClick={() => setSuccess('')} className="ml-auto text-tertiary/70 hover:text-tertiary" aria-label="Dismiss">
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

        {/* New Run Form */}
        {showForm && (
          <form
            onSubmit={handleCreateRun}
            className="mb-6 rounded-2xl bg-surface-container-lowest border border-outline-variant/10 p-5 md:p-6"
          >
            <h3 className="font-semibold text-on-surface mb-4">Create Payroll Run</h3>
            <div className="flex flex-col sm:flex-row gap-4 items-end">
              <div className="flex-1">
                <label htmlFor="prMonth" className="block text-sm font-medium text-on-surface-variant mb-1.5">Month</label>
                <select
                  id="prMonth"
                  value={formMonth}
                  onChange={(e) => setFormMonth(Number(e.target.value))}
                  className="w-full rounded-xl border border-outline-variant/30 bg-surface-container-lowest px-4 py-3 text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/40"
                >
                  {MONTH_NAMES.map((m, i) => (
                    <option key={i} value={i + 1}>{m}</option>
                  ))}
                </select>
              </div>
              <div className="flex-1">
                <label htmlFor="prYear" className="block text-sm font-medium text-on-surface-variant mb-1.5">Year</label>
                <input
                  id="prYear"
                  type="number"
                  value={formYear}
                  onChange={(e) => setFormYear(Number(e.target.value))}
                  min={2020}
                  max={2099}
                  className="w-full rounded-xl border border-outline-variant/30 bg-surface-container-lowest px-4 py-3 text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/40"
                />
              </div>
              <button
                type="submit"
                disabled={formSaving}
                className="rounded-xl bg-primary text-on-primary font-semibold px-6 py-3 text-sm hover:bg-primary/90 disabled:opacity-50 transition-colors whitespace-nowrap"
              >
                {formSaving ? 'Creating...' : 'Create'}
              </button>
            </div>
          </form>
        )}

        {/* Payroll Runs Table */}
        <div className="rounded-2xl bg-surface-container-lowest border border-outline-variant/10 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-outline-variant/10 bg-surface-container-low">
                  <th className="text-left px-5 py-3.5 font-semibold text-on-surface-variant">Month / Year</th>
                  <th className="text-center px-5 py-3.5 font-semibold text-on-surface-variant">Status</th>
                  <th className="text-right px-5 py-3.5 font-semibold text-on-surface-variant">Total Gross</th>
                  <th className="text-right px-5 py-3.5 font-semibold text-on-surface-variant">Deductions</th>
                  <th className="text-right px-5 py-3.5 font-semibold text-on-surface-variant">Total Net</th>
                  <th className="text-center px-5 py-3.5 font-semibold text-on-surface-variant">Payslips</th>
                  <th className="text-right px-5 py-3.5 font-semibold text-on-surface-variant">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  [1, 2, 3].map((i) => (
                    <tr key={i} className="border-b border-outline-variant/5">
                      {[1, 2, 3, 4, 5, 6, 7].map((j) => (
                        <td key={j} className="px-5 py-4">
                          <div className="h-4 rounded bg-surface-container-high animate-pulse" />
                        </td>
                      ))}
                    </tr>
                  ))
                ) : runs.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-5 py-12 text-center text-on-surface-variant">
                      No payroll runs yet.
                    </td>
                  </tr>
                ) : (
                  runs.map((run) => {
                    const badge = STATUS_STYLES[run.status] ?? STATUS_STYLES.draft
                    const isSelected = selectedRun?.id === run.id
                    return (
                      <tr
                        key={run.id}
                        className={`border-b border-outline-variant/5 cursor-pointer transition-colors ${
                          isSelected ? 'bg-primary/5' : 'hover:bg-surface-container-low/40'
                        }`}
                        onClick={() => handleViewPayslips(run)}
                      >
                        <td className="px-5 py-4 font-medium text-on-surface">
                          {MONTH_NAMES[run.month - 1]} {run.year}
                        </td>
                        <td className="px-5 py-4 text-center">
                          <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${badge.bg} ${badge.text}`}>
                            {badge.label}
                          </span>
                        </td>
                        <td className="px-5 py-4 text-right text-on-surface">{formatCurrency(run.total_gross)}</td>
                        <td className="px-5 py-4 text-right text-error">{formatCurrency(run.total_deductions)}</td>
                        <td className="px-5 py-4 text-right font-semibold text-on-surface">{formatCurrency(run.total_net)}</td>
                        <td className="px-5 py-4 text-center text-on-surface-variant">{run.payslip_count}</td>
                        <td className="px-5 py-4 text-right">
                          <div className="flex items-center justify-end gap-2" onClick={(e) => e.stopPropagation()}>
                            {run.status === 'draft' && (
                              <button
                                onClick={() => handleProcess(run)}
                                disabled={processingId === run.id}
                                className="rounded-lg bg-primary/10 text-primary font-semibold px-3 py-1.5 text-xs hover:bg-primary/20 disabled:opacity-50 transition-colors"
                              >
                                {processingId === run.id ? '...' : 'Process'}
                              </button>
                            )}
                            {run.status === 'processed' && (
                              <button
                                onClick={() => handleFinalize(run)}
                                disabled={finalizingId === run.id}
                                className="rounded-lg bg-tertiary/10 text-tertiary font-semibold px-3 py-1.5 text-xs hover:bg-tertiary/20 disabled:opacity-50 transition-colors"
                              >
                                {finalizingId === run.id ? '...' : 'Finalize'}
                              </button>
                            )}
                            {run.status === 'finalized' && (
                              <span className="text-xs text-on-surface-variant">Locked</span>
                            )}
                          </div>
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Payslip Entries Detail */}
        {selectedRun && (
          <div className="mt-6 rounded-2xl bg-surface-container-lowest border border-outline-variant/10 overflow-hidden">
            <div className="px-5 py-4 border-b border-outline-variant/10 bg-surface-container-low">
              <h3 className="font-semibold text-on-surface">
                Payslips for {MONTH_NAMES[selectedRun.month - 1]} {selectedRun.year}
              </h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-outline-variant/10">
                    <th className="text-left px-5 py-3 font-semibold text-on-surface-variant">Staff</th>
                    <th className="text-right px-5 py-3 font-semibold text-on-surface-variant">Basic</th>
                    <th className="text-right px-5 py-3 font-semibold text-on-surface-variant">HRA</th>
                    <th className="text-right px-5 py-3 font-semibold text-on-surface-variant">DA</th>
                    <th className="text-right px-5 py-3 font-semibold text-on-surface-variant">Gross</th>
                    <th className="text-right px-5 py-3 font-semibold text-on-surface-variant">Deductions</th>
                    <th className="text-right px-5 py-3 font-semibold text-on-surface-variant">Net</th>
                    <th className="text-center px-5 py-3 font-semibold text-on-surface-variant">Days</th>
                  </tr>
                </thead>
                <tbody>
                  {payslipsLoading ? (
                    [1, 2, 3].map((i) => (
                      <tr key={i} className="border-b border-outline-variant/5">
                        {[1, 2, 3, 4, 5, 6, 7, 8].map((j) => (
                          <td key={j} className="px-5 py-3">
                            <div className="h-4 rounded bg-surface-container-high animate-pulse" />
                          </td>
                        ))}
                      </tr>
                    ))
                  ) : payslips.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="px-5 py-8 text-center text-on-surface-variant">
                        No payslips in this run.
                      </td>
                    </tr>
                  ) : (
                    payslips.map((p) => (
                      <tr key={p.id} className="border-b border-outline-variant/5 hover:bg-surface-container-low/40 transition-colors">
                        <td className="px-5 py-3 font-medium text-on-surface">{p.staff_name}</td>
                        <td className="px-5 py-3 text-right text-on-surface-variant">{formatCurrency(p.basic)}</td>
                        <td className="px-5 py-3 text-right text-on-surface-variant">{formatCurrency(p.hra)}</td>
                        <td className="px-5 py-3 text-right text-on-surface-variant">{formatCurrency(p.da)}</td>
                        <td className="px-5 py-3 text-right font-medium text-on-surface">{formatCurrency(p.gross_salary)}</td>
                        <td className="px-5 py-3 text-right text-error">{formatCurrency(p.total_deductions)}</td>
                        <td className="px-5 py-3 text-right font-semibold text-on-surface">{formatCurrency(p.net_salary)}</td>
                        <td className="px-5 py-3 text-center text-on-surface-variant">
                          {p.days_present}/{p.working_days}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </PageLayout>
  )
}
