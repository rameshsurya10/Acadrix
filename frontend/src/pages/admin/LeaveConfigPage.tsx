import { useState, useEffect, useCallback } from 'react'
import PageLayout from '@/components/layout/PageLayout'
import { leaveService, type LeaveType } from '@/services/leave/leaveService'

const APPLICABLE_OPTIONS = [
  { value: 'all', label: 'All Staff' },
  { value: 'teacher', label: 'Teachers' },
  { value: 'admin', label: 'Admins' },
  { value: 'finance', label: 'Finance' },
]

export default function LeaveConfigPage() {
  const [types, setTypes] = useState<LeaveType[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  // Create form
  const [showForm, setShowForm] = useState(false)
  const [formSaving, setFormSaving] = useState(false)
  const [formName, setFormName] = useState('')
  const [formCode, setFormCode] = useState('')
  const [formQuota, setFormQuota] = useState('')
  const [formApplicableTo, setFormApplicableTo] = useState('all')
  const [formCarries, setFormCarries] = useState(false)

  // Allocate state
  const [showAllocate, setShowAllocate] = useState(false)
  const [allocYear, setAllocYear] = useState('')
  const [allocSaving, setAllocSaving] = useState(false)

  const loadTypes = useCallback(async () => {
    setLoading(true)
    try {
      const data = await leaveService.getTypes()
      setTypes(data)
    } catch {
      setError('Failed to load leave types.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { loadTypes() }, [loadTypes])

  function resetForm() {
    setFormName('')
    setFormCode('')
    setFormQuota('')
    setFormApplicableTo('all')
    setFormCarries(false)
    setShowForm(false)
    setError('')
  }

  async function handleCreateType(e: React.FormEvent) {
    e.preventDefault()
    if (!formName.trim()) { setError('Name is required.'); return }
    if (!formCode.trim()) { setError('Code is required.'); return }
    if (!formQuota || Number(formQuota) <= 0) { setError('Quota must be greater than 0.'); return }

    setFormSaving(true)
    setError('')
    try {
      const created = await leaveService.createType({
        name: formName.trim(),
        code: formCode.trim().toUpperCase(),
        annual_quota: Number(formQuota),
        carries_forward: formCarries,
        applicable_to: formApplicableTo,
      })
      setTypes((prev) => [...prev, created])
      setSuccess(`Leave type "${created.name}" created.`)
      resetForm()
    } catch {
      setError('Failed to create leave type.')
    } finally {
      setFormSaving(false)
    }
  }

  async function handleAllocate(e: React.FormEvent) {
    e.preventDefault()
    if (!allocYear.trim()) { setError('Academic year is required.'); return }

    setAllocSaving(true)
    setError('')
    try {
      await leaveService.allocateBalances({ academic_year: allocYear.trim() })
      setSuccess('Balances allocated successfully.')
      setShowAllocate(false)
      setAllocYear('')
    } catch {
      setError('Failed to allocate balances.')
    } finally {
      setAllocSaving(false)
    }
  }

  return (
    <PageLayout>
      <div className="px-4 md:px-8 py-8">
        <span className="font-label text-xs font-semibold tracking-widest text-on-surface-variant uppercase mb-2 block">
          Administration
        </span>
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-8">
          <h2 className="font-headline font-extrabold text-3xl md:text-4xl text-on-surface">
            Leave Configuration
          </h2>
          <div className="flex gap-3">
            <button
              onClick={() => { setShowAllocate(!showAllocate); setShowForm(false) }}
              className="rounded-xl bg-tertiary/10 text-tertiary font-semibold px-5 py-2.5 text-sm hover:bg-tertiary/20 transition-colors"
            >
              Allocate Balances
            </button>
            <button
              onClick={() => { setShowForm(!showForm); setShowAllocate(false) }}
              className="rounded-xl bg-primary text-on-primary font-semibold px-5 py-2.5 text-sm hover:bg-primary/90 transition-colors"
            >
              {showForm ? 'Cancel' : 'New Leave Type'}
            </button>
          </div>
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

        {/* Allocate Balances Form */}
        {showAllocate && (
          <form
            onSubmit={handleAllocate}
            className="mb-6 rounded-2xl bg-surface-container-lowest border border-outline-variant/10 p-5 md:p-6"
          >
            <h3 className="font-semibold text-on-surface mb-4">Bulk Allocate Balances</h3>
            <div className="flex flex-col sm:flex-row gap-4 items-end">
              <div className="flex-1">
                <label htmlFor="allocYear" className="block text-sm font-medium text-on-surface-variant mb-1.5">
                  Academic Year (e.g. 2025-2026)
                </label>
                <input
                  id="allocYear"
                  type="text"
                  value={allocYear}
                  onChange={(e) => setAllocYear(e.target.value)}
                  placeholder="2025-2026"
                  className="w-full rounded-xl border border-outline-variant/30 bg-surface-container-lowest px-4 py-3 text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/40"
                />
              </div>
              <button
                type="submit"
                disabled={allocSaving}
                className="rounded-xl bg-tertiary text-on-primary font-semibold px-6 py-3 text-sm hover:bg-tertiary/90 disabled:opacity-50 transition-colors whitespace-nowrap"
              >
                {allocSaving ? 'Allocating...' : 'Allocate'}
              </button>
            </div>
          </form>
        )}

        {/* Create Leave Type Form */}
        {showForm && (
          <form
            onSubmit={handleCreateType}
            className="mb-6 rounded-2xl bg-surface-container-lowest border border-outline-variant/10 p-5 md:p-6 space-y-4"
          >
            <h3 className="font-semibold text-on-surface mb-2">Create Leave Type</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="typeName" className="block text-sm font-medium text-on-surface-variant mb-1.5">Name</label>
                <input
                  id="typeName"
                  type="text"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="Casual Leave"
                  className="w-full rounded-xl border border-outline-variant/30 bg-surface-container-lowest px-4 py-3 text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/40"
                />
              </div>
              <div>
                <label htmlFor="typeCode" className="block text-sm font-medium text-on-surface-variant mb-1.5">Code</label>
                <input
                  id="typeCode"
                  type="text"
                  value={formCode}
                  onChange={(e) => setFormCode(e.target.value)}
                  placeholder="CL"
                  className="w-full rounded-xl border border-outline-variant/30 bg-surface-container-lowest px-4 py-3 text-on-surface uppercase focus:outline-none focus:ring-2 focus:ring-primary/40"
                />
              </div>
              <div>
                <label htmlFor="typeQuota" className="block text-sm font-medium text-on-surface-variant mb-1.5">Annual Quota</label>
                <input
                  id="typeQuota"
                  type="number"
                  min={1}
                  value={formQuota}
                  onChange={(e) => setFormQuota(e.target.value)}
                  placeholder="12"
                  className="w-full rounded-xl border border-outline-variant/30 bg-surface-container-lowest px-4 py-3 text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/40"
                />
              </div>
              <div>
                <label htmlFor="typeApplicable" className="block text-sm font-medium text-on-surface-variant mb-1.5">Applicable To</label>
                <select
                  id="typeApplicable"
                  value={formApplicableTo}
                  onChange={(e) => setFormApplicableTo(e.target.value)}
                  className="w-full rounded-xl border border-outline-variant/30 bg-surface-container-lowest px-4 py-3 text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/40"
                >
                  {APPLICABLE_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>
            </div>
            <label htmlFor="typeCarries" className="flex items-center gap-3 cursor-pointer">
              <input
                id="typeCarries"
                type="checkbox"
                checked={formCarries}
                onChange={(e) => setFormCarries(e.target.checked)}
                className="h-5 w-5 rounded border-outline-variant/30 text-primary focus:ring-primary/40"
              />
              <span className="text-sm text-on-surface-variant">Carries forward to next year</span>
            </label>
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={formSaving}
                className="rounded-xl bg-primary text-on-primary font-semibold px-6 py-3 text-sm hover:bg-primary/90 disabled:opacity-50 transition-colors"
              >
                {formSaving ? 'Creating...' : 'Create Type'}
              </button>
            </div>
          </form>
        )}

        {/* Types Table */}
        <div className="rounded-2xl bg-surface-container-lowest border border-outline-variant/10 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-outline-variant/10 bg-surface-container-low">
                  <th className="text-left px-5 py-3.5 font-semibold text-on-surface-variant">Name</th>
                  <th className="text-left px-5 py-3.5 font-semibold text-on-surface-variant">Code</th>
                  <th className="text-center px-5 py-3.5 font-semibold text-on-surface-variant">Quota</th>
                  <th className="text-left px-5 py-3.5 font-semibold text-on-surface-variant">Applicable To</th>
                  <th className="text-center px-5 py-3.5 font-semibold text-on-surface-variant">Carries Forward</th>
                  <th className="text-center px-5 py-3.5 font-semibold text-on-surface-variant">Status</th>
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
                ) : types.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-5 py-12 text-center text-on-surface-variant">
                      No leave types configured yet.
                    </td>
                  </tr>
                ) : (
                  types.map((t) => (
                    <tr key={t.id} className="border-b border-outline-variant/5 hover:bg-surface-container-low/40 transition-colors">
                      <td className="px-5 py-4 font-medium text-on-surface">{t.name}</td>
                      <td className="px-5 py-4 text-on-surface-variant font-mono text-xs">{t.code}</td>
                      <td className="px-5 py-4 text-center text-on-surface">{t.annual_quota}</td>
                      <td className="px-5 py-4 text-on-surface-variant capitalize">{t.applicable_to}</td>
                      <td className="px-5 py-4 text-center">
                        {t.carries_forward ? (
                          <span className="text-tertiary material-symbols-outlined text-lg">check_circle</span>
                        ) : (
                          <span className="text-on-surface-variant/40 material-symbols-outlined text-lg">cancel</span>
                        )}
                      </td>
                      <td className="px-5 py-4 text-center">
                        <span
                          className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${
                            t.is_active
                              ? 'bg-tertiary/10 text-tertiary'
                              : 'bg-error/10 text-error'
                          }`}
                        >
                          {t.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </PageLayout>
  )
}
