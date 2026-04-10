import { useState, useEffect, useCallback } from 'react'
import PageLayout from '@/components/layout/PageLayout'
import { adminService, type AcademicYear } from '@/services/admin/adminService'
import { SkeletonTableRow } from '@/components/shared/Skeleton'

const INPUT_CLASS = 'w-full px-4 py-3 bg-surface-container-low border-none rounded-lg focus:ring-2 focus:ring-primary text-sm'
const LABEL_CLASS = 'block text-xs font-bold uppercase tracking-wider text-on-surface-variant mb-2'

export default function AcademicYearsPage() {
  const [years, setYears] = useState<AcademicYear[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [deletingId, setDeletingId] = useState<number | null>(null)
  const [togglingId, setTogglingId] = useState<number | null>(null)

  const [form, setForm] = useState({
    label: '',
    start_date: '',
    end_date: '',
    is_current: false,
  })

  const fetchYears = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await adminService.getAcademicYears()
      setYears(data)
    } catch {
      setError('Failed to load academic years.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchYears()
  }, [fetchYears])

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    setSubmitting(true)
    setError(null)
    try {
      await adminService.createAcademicYear(form)
      setForm({ label: '', start_date: '', end_date: '', is_current: false })
      setShowForm(false)
      await fetchYears()
    } catch (err: any) {
      setError(err?.response?.data?.detail || err?.response?.data?.error || 'Failed to create academic year.')
    } finally {
      setSubmitting(false)
    }
  }

  async function handleToggleCurrent(year: AcademicYear) {
    setTogglingId(year.id)
    setError(null)
    try {
      await adminService.updateAcademicYear(year.id, { is_current: !year.is_current })
      await fetchYears()
    } catch (err: any) {
      setError(err?.response?.data?.detail || 'Failed to update academic year.')
    } finally {
      setTogglingId(null)
    }
  }

  async function handleDelete(id: number) {
    if (!window.confirm('Are you sure you want to delete this academic year?')) return
    setDeletingId(id)
    setError(null)
    try {
      await adminService.deleteAcademicYear(id)
      await fetchYears()
    } catch (err: any) {
      setError(err?.response?.data?.detail || 'Failed to delete academic year.')
    } finally {
      setDeletingId(null)
    }
  }

  function formatDate(dateStr: string) {
    if (!dateStr) return '--'
    return new Date(dateStr).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
  }

  return (
    <PageLayout>
      <main className="flex-grow container mx-auto px-4 md:px-6 py-6 md:py-10 pb-32">
        {/* Header */}
        <section className="mb-8 md:mb-10">
          <span className="font-label text-xs font-semibold tracking-widest text-on-surface-variant uppercase mb-2 block">
            Academic Management
          </span>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 md:gap-6">
            <div>
              <h2 className="font-headline font-extrabold text-3xl md:text-4xl text-on-surface tracking-tight">
                Academic Years
              </h2>
              <p className="text-on-surface-variant mt-2 text-sm">
                {loading ? 'Loading academic years...' : `${years.length} academic year${years.length !== 1 ? 's' : ''} configured.`}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setShowForm(prev => !prev)}
              className="bg-primary text-on-primary px-5 md:px-6 py-3 rounded-lg font-headline font-bold text-sm shadow-sm flex items-center gap-2 hover:bg-primary/90 transition-colors"
            >
              <span className="material-symbols-outlined text-sm">{showForm ? 'close' : 'add'}</span>
              {showForm ? 'Cancel' : 'New Academic Year'}
            </button>
          </div>
        </section>

        {/* Error */}
        {error && (
          <div className="mb-6 flex items-center gap-2 rounded-lg bg-error-container/40 border border-error/20 px-4 py-3">
            <span className="material-symbols-outlined text-error text-lg">error</span>
            <span className="text-sm text-on-error-container">{error}</span>
          </div>
        )}

        {/* Create Form */}
        {showForm && (
          <div className="bg-surface-container-lowest rounded-2xl p-5 sm:p-8 shadow-sm mb-8">
            <h3 className="font-headline font-bold text-xl text-on-surface mb-6">Create Academic Year</h3>
            <form onSubmit={handleCreate} className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className={LABEL_CLASS}>Label *</label>
                  <input
                    className={INPUT_CLASS}
                    required
                    value={form.label}
                    onChange={e => setForm(f => ({ ...f, label: e.target.value }))}
                    placeholder="e.g. 2025-2026"
                  />
                </div>
                <div className="flex items-end">
                  <label className="flex items-center gap-3 cursor-pointer py-3">
                    <input
                      type="checkbox"
                      checked={form.is_current}
                      onChange={e => setForm(f => ({ ...f, is_current: e.target.checked }))}
                      className="w-5 h-5 rounded border-outline-variant text-primary focus:ring-primary cursor-pointer"
                    />
                    <span className="text-sm font-semibold text-on-surface">Set as current year</span>
                  </label>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className={LABEL_CLASS}>Start Date *</label>
                  <input
                    className={INPUT_CLASS}
                    type="date"
                    required
                    value={form.start_date}
                    onChange={e => setForm(f => ({ ...f, start_date: e.target.value }))}
                  />
                </div>
                <div>
                  <label className={LABEL_CLASS}>End Date *</label>
                  <input
                    className={INPUT_CLASS}
                    type="date"
                    required
                    value={form.end_date}
                    onChange={e => setForm(f => ({ ...f, end_date: e.target.value }))}
                  />
                </div>
              </div>
              <button
                type="submit"
                disabled={submitting}
                className="w-full sm:w-auto bg-primary text-on-primary font-headline font-bold py-3 px-8 rounded-xl hover:bg-primary/90 shadow-lg shadow-primary/20 disabled:opacity-60 text-sm"
              >
                {submitting ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="w-4 h-4 border-2 border-on-primary/30 border-t-on-primary rounded-full animate-spin" />
                    Creating...
                  </span>
                ) : 'Create Academic Year'}
              </button>
            </form>
          </div>
        )}

        {/* Table */}
        <div className="bg-surface-container-lowest rounded-xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left min-w-[600px]">
              <thead>
                <tr className="bg-surface-container-low text-on-surface-variant">
                  <th className="px-4 md:px-6 py-4 font-bold text-[10px] uppercase tracking-widest">Label</th>
                  <th className="px-4 md:px-6 py-4 font-bold text-[10px] uppercase tracking-widest">Start Date</th>
                  <th className="px-4 md:px-6 py-4 font-bold text-[10px] uppercase tracking-widest">End Date</th>
                  <th className="px-4 md:px-6 py-4 font-bold text-[10px] uppercase tracking-widest">Status</th>
                  <th className="px-4 md:px-6 py-4 font-bold text-[10px] uppercase tracking-widest text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-container-low">
                {loading ? (
                  Array.from({ length: 3 }).map((_, i) => <SkeletonTableRow key={i} cols={5} />)
                ) : years.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center">
                      <span className="material-symbols-outlined text-4xl text-on-surface-variant mb-3 block">calendar_today</span>
                      <p className="text-on-surface-variant font-medium">No academic years found.</p>
                      <p className="text-sm text-on-surface-variant mt-1">Create your first academic year to get started.</p>
                    </td>
                  </tr>
                ) : (
                  years.map(year => (
                    <tr key={year.id} className="hover:bg-surface-container-low/50 transition-colors">
                      <td className="px-4 md:px-6 py-4 md:py-5">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-surface-container-high flex items-center justify-center">
                            <span className="material-symbols-outlined text-primary text-lg">date_range</span>
                          </div>
                          <span className="font-semibold text-on-surface text-sm">{year.label}</span>
                        </div>
                      </td>
                      <td className="px-4 md:px-6 py-4 md:py-5 text-sm text-on-surface-variant">
                        {formatDate(year.start_date)}
                      </td>
                      <td className="px-4 md:px-6 py-4 md:py-5 text-sm text-on-surface-variant">
                        {formatDate(year.end_date)}
                      </td>
                      <td className="px-4 md:px-6 py-4 md:py-5">
                        {year.is_current ? (
                          <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-tertiary/10 text-tertiary text-[10px] font-bold uppercase tracking-tighter">
                            Current
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-surface-container-high text-on-surface-variant text-[10px] font-bold uppercase tracking-tighter">
                            Inactive
                          </span>
                        )}
                      </td>
                      <td className="px-4 md:px-6 py-4 md:py-5">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            type="button"
                            onClick={() => handleToggleCurrent(year)}
                            disabled={togglingId === year.id}
                            className="p-2 text-on-surface-variant hover:text-primary transition-colors disabled:opacity-40"
                            title={year.is_current ? 'Unset as current' : 'Set as current'}
                          >
                            <span className="material-symbols-outlined text-lg">
                              {year.is_current ? 'toggle_on' : 'toggle_off'}
                            </span>
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(year.id)}
                            disabled={deletingId === year.id}
                            className="p-2 text-on-surface-variant hover:text-error transition-colors disabled:opacity-40"
                            title="Delete"
                          >
                            <span className="material-symbols-outlined text-lg">delete</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </PageLayout>
  )
}
