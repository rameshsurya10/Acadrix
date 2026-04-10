import { useState, useEffect, useCallback, useMemo } from 'react'
import PageLayout from '@/components/layout/PageLayout'
import {
  adminService,
  type FeeTemplate,
  type FeeTemplateItem,
  type StudentDiscountItem,
  type Grade,
  type AcademicYear,
  type StudentProfile,
} from '@/services/admin/adminService'
import { SkeletonTableRow } from '@/components/shared/Skeleton'

// ── Constants ────────────────────────────────────────────────────────

const DISCOUNT_TYPES = [
  'Scholarship',
  'Sibling Discount',
  'Merit Award',
  'Financial Aid',
  'Staff Child',
  'Other',
] as const

const EMPTY_ITEM: FeeTemplateItem = { description: '', amount: '', is_optional: false, order: 0 }

// ── Helpers ──────────────────────────────────────────────────────────

function formatCurrency(val: string | number) {
  const num = typeof val === 'string' ? parseFloat(val) : val
  if (isNaN(num)) return '$0.00'
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(num)
}

function sumItems(items: FeeTemplateItem[]): number {
  return items.reduce((s, it) => s + (parseFloat(it.amount) || 0), 0)
}

// ── Component ────────────────────────────────────────────────────────

export default function FeeTemplatesPage() {
  // -- shared lookup data --
  const [grades, setGrades] = useState<Grade[]>([])
  const [academicYears, setAcademicYears] = useState<AcademicYear[]>([])
  const [students, setStudents] = useState<StudentProfile[]>([])

  // -- fee templates --
  const [templates, setTemplates] = useState<FeeTemplate[]>([])
  const [templatesLoading, setTemplatesLoading] = useState(true)
  const [templatesError, setTemplatesError] = useState('')

  // -- template form --
  const [showTemplateForm, setShowTemplateForm] = useState(false)
  const [editingTemplate, setEditingTemplate] = useState<FeeTemplate | null>(null)
  const [tplName, setTplName] = useState('')
  const [tplGrade, setTplGrade] = useState<number | ''>('')
  const [tplYear, setTplYear] = useState<number | ''>('')
  const [tplDueDate, setTplDueDate] = useState('')
  const [tplItems, setTplItems] = useState<FeeTemplateItem[]>([{ ...EMPTY_ITEM, order: 1 }])
  const [tplSaving, setTplSaving] = useState(false)
  const [tplFormError, setTplFormError] = useState('')

  // -- apply template --
  const [applyingId, setApplyingId] = useState<number | null>(null)
  const [applyMessage, setApplyMessage] = useState('')

  // -- discounts --
  const [discounts, setDiscounts] = useState<StudentDiscountItem[]>([])
  const [discountsLoading, setDiscountsLoading] = useState(true)
  const [discountsError, setDiscountsError] = useState('')
  const [discountStudentFilter, setDiscountStudentFilter] = useState('')

  // -- discount form --
  const [showDiscountForm, setShowDiscountForm] = useState(false)
  const [dscStudent, setDscStudent] = useState<number | ''>('')
  const [dscType, setDscType] = useState('')
  const [dscDescription, setDscDescription] = useState('')
  const [dscAmount, setDscAmount] = useState('')
  const [dscSaving, setDscSaving] = useState(false)
  const [dscFormError, setDscFormError] = useState('')

  // -- banner --
  const [banner, setBanner] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  // -- delete confirm --
  const [confirmDeleteTpl, setConfirmDeleteTpl] = useState<number | null>(null)
  const [confirmDeleteDsc, setConfirmDeleteDsc] = useState<number | null>(null)

  // ── Data fetching ──────────────────────────────────────────────────

  const loadTemplates = useCallback(async () => {
    setTemplatesLoading(true)
    setTemplatesError('')
    try {
      const res = await adminService.getFeeTemplates()
      setTemplates(res.results)
    } catch {
      setTemplatesError('Failed to load fee templates.')
    } finally {
      setTemplatesLoading(false)
    }
  }, [])

  const loadDiscounts = useCallback(async () => {
    setDiscountsLoading(true)
    setDiscountsError('')
    try {
      const params: Record<string, string> = {}
      if (discountStudentFilter) params.student = discountStudentFilter
      const res = await adminService.getDiscounts(params)
      setDiscounts(res.results)
    } catch {
      setDiscountsError('Failed to load discounts.')
    } finally {
      setDiscountsLoading(false)
    }
  }, [discountStudentFilter])

  useEffect(() => {
    loadTemplates()
    loadDiscounts()
    adminService.getGrades().then(setGrades).catch(() => {})
    adminService.getAcademicYears().then(setAcademicYears).catch(() => {})
    adminService.getStudents().then(r => setStudents(r.results)).catch(() => {})
  }, [loadTemplates, loadDiscounts])

  // ── Template form helpers ──────────────────────────────────────────

  function resetTemplateForm() {
    setShowTemplateForm(false)
    setEditingTemplate(null)
    setTplName('')
    setTplGrade('')
    setTplYear('')
    setTplDueDate('')
    setTplItems([{ ...EMPTY_ITEM, order: 1 }])
    setTplFormError('')
  }

  function openEditTemplate(t: FeeTemplate) {
    setEditingTemplate(t)
    setTplName(t.name)
    setTplGrade(t.grade)
    setTplYear(t.academic_year)
    setTplDueDate(t.due_date ?? '')
    setTplItems(
      t.items.length > 0
        ? t.items.map((it, i) => ({ ...it, order: i + 1 }))
        : [{ ...EMPTY_ITEM, order: 1 }],
    )
    setShowTemplateForm(true)
    setTplFormError('')
  }

  function addItem() {
    setTplItems(prev => [...prev, { ...EMPTY_ITEM, order: prev.length + 1 }])
  }

  function removeItem(idx: number) {
    setTplItems(prev => prev.filter((_, i) => i !== idx).map((it, i) => ({ ...it, order: i + 1 })))
  }

  function updateItem(idx: number, field: keyof FeeTemplateItem, value: string | boolean) {
    setTplItems(prev =>
      prev.map((it, i) => (i === idx ? { ...it, [field]: value } : it)),
    )
  }

  const tplTotal = useMemo(() => sumItems(tplItems), [tplItems])

  async function handleSaveTemplate() {
    if (!tplName.trim()) { setTplFormError('Template name is required.'); return }
    if (!tplGrade) { setTplFormError('Grade is required.'); return }
    if (!tplYear) { setTplFormError('Academic year is required.'); return }
    if (tplItems.length === 0 || !tplItems[0].description.trim()) {
      setTplFormError('At least one fee item is required.')
      return
    }

    setTplSaving(true)
    setTplFormError('')
    try {
      const payload: Partial<FeeTemplate> = {
        name: tplName.trim(),
        grade: Number(tplGrade),
        academic_year: Number(tplYear),
        due_date: tplDueDate || null,
        items: tplItems.filter(it => it.description.trim()).map((it, i) => ({
          ...it,
          order: i + 1,
          amount: String(parseFloat(it.amount) || 0),
        })),
      }

      if (editingTemplate) {
        await adminService.updateFeeTemplate(editingTemplate.id, payload)
        flash('success', 'Fee template updated successfully.')
      } else {
        await adminService.createFeeTemplate(payload)
        flash('success', 'Fee template created successfully.')
      }
      resetTemplateForm()
      loadTemplates()
    } catch {
      setTplFormError('Failed to save fee template. Please try again.')
    } finally {
      setTplSaving(false)
    }
  }

  async function handleDeleteTemplate(id: number) {
    try {
      await adminService.deleteFeeTemplate(id)
      flash('success', 'Fee template deleted.')
      setConfirmDeleteTpl(null)
      loadTemplates()
    } catch {
      flash('error', 'Failed to delete template.')
      setConfirmDeleteTpl(null)
    }
  }

  async function handleApplyTemplate(id: number) {
    setApplyingId(id)
    setApplyMessage('')
    try {
      const res = await adminService.applyFeeTemplate(id)
      setApplyMessage(res.message || `Applied to ${res.count} students.`)
      flash('success', res.message || `Fee template applied to ${res.count} students.`)
    } catch {
      flash('error', 'Failed to apply template.')
    } finally {
      setApplyingId(null)
    }
  }

  // ── Discount form helpers ──────────────────────────────────────────

  function resetDiscountForm() {
    setShowDiscountForm(false)
    setDscStudent('')
    setDscType('')
    setDscDescription('')
    setDscAmount('')
    setDscFormError('')
  }

  async function handleSaveDiscount() {
    if (!dscStudent) { setDscFormError('Student is required.'); return }
    if (!dscType) { setDscFormError('Discount type is required.'); return }
    if (!dscAmount || parseFloat(dscAmount) <= 0) { setDscFormError('Valid amount is required.'); return }

    setDscSaving(true)
    setDscFormError('')
    try {
      await adminService.createDiscount({
        student: Number(dscStudent),
        discount_type: dscType,
        description: dscDescription.trim(),
        amount: String(parseFloat(dscAmount)),
      })
      flash('success', 'Discount added successfully.')
      resetDiscountForm()
      loadDiscounts()
    } catch {
      setDscFormError('Failed to add discount. Please try again.')
    } finally {
      setDscSaving(false)
    }
  }

  async function handleDeleteDiscount(id: number) {
    try {
      await adminService.deleteDiscount(id)
      flash('success', 'Discount removed.')
      setConfirmDeleteDsc(null)
      loadDiscounts()
    } catch {
      flash('error', 'Failed to remove discount.')
      setConfirmDeleteDsc(null)
    }
  }

  // ── Banner helper ──────────────────────────────────────────────────

  function flash(type: 'success' | 'error', text: string) {
    setBanner({ type, text })
    setTimeout(() => setBanner(null), 5000)
  }

  // ── Render ─────────────────────────────────────────────────────────

  return (
    <PageLayout>
      <main className="max-w-7xl mx-auto px-4 md:px-6 py-10 pb-32">
        {/* Header */}
        <section className="mb-8 md:mb-12">
          <span className="font-label text-xs font-semibold tracking-widest text-on-surface-variant uppercase mb-2 block">
            Finance
          </span>
          <h2 className="font-headline text-3xl md:text-4xl font-extrabold text-on-surface tracking-tight">
            Fee Templates & Discounts
          </h2>
        </section>

        {/* Banner */}
        {banner && (
          <div
            className={`mb-6 px-5 py-3 rounded-lg flex items-center gap-3 text-sm font-medium ${
              banner.type === 'success'
                ? 'bg-tertiary/10 text-tertiary'
                : 'bg-error/10 text-error'
            }`}
          >
            <span className="material-symbols-outlined text-lg">
              {banner.type === 'success' ? 'check_circle' : 'error'}
            </span>
            {banner.text}
          </div>
        )}

        {/* ═══════════ SECTION 1: Fee Templates ═══════════ */}
        <section className="mb-16">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <h3 className="font-headline text-xl font-bold text-on-surface">Fee Templates</h3>
            {!showTemplateForm && (
              <button
                onClick={() => { resetTemplateForm(); setShowTemplateForm(true) }}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary text-on-primary rounded-lg font-semibold text-sm hover:opacity-90 transition-opacity"
              >
                <span className="material-symbols-outlined text-lg">add</span>
                New Template
              </button>
            )}
          </div>

          {/* Template Form */}
          {showTemplateForm && (
            <div className="bg-surface-container-lowest rounded-xl p-6 mb-6 border border-outline-variant/10">
              <h4 className="font-headline text-lg font-bold text-on-surface mb-5">
                {editingTemplate ? 'Edit Template' : 'Create Fee Template'}
              </h4>
              {tplFormError && (
                <p className="mb-4 text-sm text-error font-medium">{tplFormError}</p>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5">
                <div>
                  <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-1.5">
                    Template Name
                  </label>
                  <input
                    type="text"
                    value={tplName}
                    onChange={e => setTplName(e.target.value)}
                    placeholder="e.g. Tuition Fee 2026"
                    className="w-full px-4 py-2.5 bg-surface-container-low border-none rounded-lg text-sm text-on-surface placeholder:text-outline-variant focus:ring-2 focus:ring-primary/20"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-1.5">
                    Due Date
                  </label>
                  <input
                    type="date"
                    value={tplDueDate}
                    onChange={e => setTplDueDate(e.target.value)}
                    className="w-full px-4 py-2.5 bg-surface-container-low border-none rounded-lg text-sm text-on-surface focus:ring-2 focus:ring-primary/20"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-1.5">
                    Grade
                  </label>
                  <select
                    value={tplGrade}
                    onChange={e => setTplGrade(e.target.value ? Number(e.target.value) : '')}
                    className="w-full px-4 py-2.5 bg-surface-container-low border-none rounded-lg text-sm text-on-surface focus:ring-2 focus:ring-primary/20 cursor-pointer"
                  >
                    <option value="">Select grade</option>
                    {grades.map(g => (
                      <option key={g.id} value={g.id}>{g.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-1.5">
                    Academic Year
                  </label>
                  <select
                    value={tplYear}
                    onChange={e => setTplYear(e.target.value ? Number(e.target.value) : '')}
                    className="w-full px-4 py-2.5 bg-surface-container-low border-none rounded-lg text-sm text-on-surface focus:ring-2 focus:ring-primary/20 cursor-pointer"
                  >
                    <option value="">Select year</option>
                    {academicYears.map(y => (
                      <option key={y.id} value={y.id}>{y.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Dynamic fee items */}
              <div className="mb-5">
                <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-3">
                  Fee Items
                </label>
                <div className="space-y-3">
                  {tplItems.map((item, idx) => (
                    <div key={idx} className="flex flex-col sm:flex-row items-start sm:items-center gap-3 bg-surface-container-low p-3 rounded-lg">
                      <input
                        type="text"
                        placeholder="Description"
                        value={item.description}
                        onChange={e => updateItem(idx, 'description', e.target.value)}
                        className="flex-1 w-full sm:w-auto px-3 py-2 bg-surface-container-lowest border-none rounded-lg text-sm text-on-surface placeholder:text-outline-variant focus:ring-2 focus:ring-primary/20"
                      />
                      <input
                        type="number"
                        placeholder="Amount"
                        value={item.amount}
                        onChange={e => updateItem(idx, 'amount', e.target.value)}
                        min="0"
                        step="0.01"
                        className="w-full sm:w-32 px-3 py-2 bg-surface-container-lowest border-none rounded-lg text-sm text-on-surface placeholder:text-outline-variant focus:ring-2 focus:ring-primary/20"
                      />
                      <label className="flex items-center gap-1.5 text-xs text-on-surface-variant whitespace-nowrap cursor-pointer">
                        <input
                          type="checkbox"
                          checked={item.is_optional}
                          onChange={e => updateItem(idx, 'is_optional', e.target.checked)}
                          className="rounded border-outline-variant text-primary focus:ring-primary/30"
                        />
                        Optional
                      </label>
                      {tplItems.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeItem(idx)}
                          className="p-1.5 text-error hover:bg-error/10 rounded-lg transition-colors"
                          aria-label="Remove item"
                        >
                          <span className="material-symbols-outlined text-lg">close</span>
                        </button>
                      )}
                    </div>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={addItem}
                  className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:text-primary/80 transition-colors"
                >
                  <span className="material-symbols-outlined text-lg">add_circle</span>
                  Add Item
                </button>
                <p className="mt-2 text-sm font-bold text-on-surface">
                  Total: {formatCurrency(tplTotal)}
                </p>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={handleSaveTemplate}
                  disabled={tplSaving}
                  className="px-6 py-2.5 bg-primary text-on-primary rounded-lg font-semibold text-sm hover:opacity-90 transition-opacity disabled:opacity-50"
                >
                  {tplSaving ? 'Saving...' : editingTemplate ? 'Update Template' : 'Create Template'}
                </button>
                <button
                  onClick={resetTemplateForm}
                  className="px-5 py-2.5 bg-surface-container-high text-on-surface rounded-lg font-semibold text-sm hover:opacity-80 transition-opacity"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {/* Apply result message */}
          {applyMessage && (
            <div className="mb-4 px-4 py-2 rounded-lg bg-tertiary/10 text-tertiary text-sm font-medium flex items-center gap-2">
              <span className="material-symbols-outlined text-lg">group_add</span>
              {applyMessage}
            </div>
          )}

          {/* Templates table */}
          <div className="bg-surface-container-lowest rounded-xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-left min-w-[700px]">
                <thead>
                  <tr className="bg-surface-container-low text-on-surface-variant">
                    <th className="px-4 md:px-6 py-4 font-bold text-[10px] uppercase tracking-widest">Name</th>
                    <th className="px-4 md:px-6 py-4 font-bold text-[10px] uppercase tracking-widest">Grade</th>
                    <th className="px-4 md:px-6 py-4 font-bold text-[10px] uppercase tracking-widest">Academic Year</th>
                    <th className="px-4 md:px-6 py-4 font-bold text-[10px] uppercase tracking-widest">Total</th>
                    <th className="px-4 md:px-6 py-4 font-bold text-[10px] uppercase tracking-widest">Due Date</th>
                    <th className="px-4 md:px-6 py-4 font-bold text-[10px] uppercase tracking-widest">Status</th>
                    <th className="px-4 md:px-6 py-4 font-bold text-[10px] uppercase tracking-widest">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-surface-container-low">
                  {templatesLoading ? (
                    Array.from({ length: 4 }).map((_, i) => <SkeletonTableRow key={i} cols={7} />)
                  ) : templatesError ? (
                    <tr>
                      <td colSpan={7} className="px-6 py-12 text-center text-error text-sm">
                        {templatesError}
                      </td>
                    </tr>
                  ) : templates.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-6 py-12 text-center text-on-surface-variant text-sm">
                        No fee templates created yet.
                      </td>
                    </tr>
                  ) : (
                    templates.map(t => (
                      <tr key={t.id} className="hover:bg-surface-container-low/50 transition-colors">
                        <td className="px-4 md:px-6 py-4 font-semibold text-on-surface text-sm">{t.name}</td>
                        <td className="px-4 md:px-6 py-4 text-sm text-on-surface">{t.grade_label}</td>
                        <td className="px-4 md:px-6 py-4 text-sm text-on-surface">{t.academic_year_label}</td>
                        <td className="px-4 md:px-6 py-4 text-sm font-headline font-bold text-on-surface">
                          {formatCurrency(t.total_amount)}
                        </td>
                        <td className="px-4 md:px-6 py-4 text-sm text-on-surface-variant">
                          {t.due_date ?? '—'}
                        </td>
                        <td className="px-4 md:px-6 py-4">
                          <span
                            className={`inline-flex items-center px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-tighter ${
                              t.is_active
                                ? 'bg-tertiary/10 text-tertiary'
                                : 'bg-surface-container-high text-on-surface-variant'
                            }`}
                          >
                            {t.is_active ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className="px-4 md:px-6 py-4">
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => openEditTemplate(t)}
                              className="p-1.5 hover:bg-surface-container-high rounded-lg transition-colors"
                              aria-label={`Edit ${t.name}`}
                            >
                              <span className="material-symbols-outlined text-lg text-on-surface-variant">edit</span>
                            </button>
                            <button
                              onClick={() => handleApplyTemplate(t.id)}
                              disabled={applyingId === t.id}
                              className="p-1.5 hover:bg-primary/10 rounded-lg transition-colors disabled:opacity-50"
                              aria-label={`Apply ${t.name} to students`}
                              title="Apply to Students"
                            >
                              <span className="material-symbols-outlined text-lg text-primary">
                                {applyingId === t.id ? 'hourglass_empty' : 'group_add'}
                              </span>
                            </button>
                            {confirmDeleteTpl === t.id ? (
                              <div className="flex items-center gap-1 ml-1">
                                <button
                                  onClick={() => handleDeleteTemplate(t.id)}
                                  className="px-2 py-1 bg-error text-on-primary text-xs font-bold rounded"
                                >
                                  Confirm
                                </button>
                                <button
                                  onClick={() => setConfirmDeleteTpl(null)}
                                  className="px-2 py-1 bg-surface-container-high text-on-surface text-xs font-bold rounded"
                                >
                                  Cancel
                                </button>
                              </div>
                            ) : (
                              <button
                                onClick={() => setConfirmDeleteTpl(t.id)}
                                className="p-1.5 hover:bg-error/10 rounded-lg transition-colors"
                                aria-label={`Delete ${t.name}`}
                              >
                                <span className="material-symbols-outlined text-lg text-error">delete</span>
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* ═══════════ SECTION 2: Student Discounts ═══════════ */}
        <section>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <h3 className="font-headline text-xl font-bold text-on-surface">Student Discounts</h3>
            <div className="flex items-center gap-3">
              <select
                value={discountStudentFilter}
                onChange={e => setDiscountStudentFilter(e.target.value)}
                className="px-4 py-2.5 bg-surface-container-low border-none rounded-lg text-sm text-on-surface font-semibold focus:ring-primary cursor-pointer"
              >
                <option value="">All Students</option>
                {students.map(s => (
                  <option key={s.id} value={String(s.id)}>{s.full_name}</option>
                ))}
              </select>
              {!showDiscountForm && (
                <button
                  onClick={() => { resetDiscountForm(); setShowDiscountForm(true) }}
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary text-on-primary rounded-lg font-semibold text-sm hover:opacity-90 transition-opacity"
                >
                  <span className="material-symbols-outlined text-lg">add</span>
                  Add Discount
                </button>
              )}
            </div>
          </div>

          {/* Discount Form */}
          {showDiscountForm && (
            <div className="bg-surface-container-lowest rounded-xl p-6 mb-6 border border-outline-variant/10">
              <h4 className="font-headline text-lg font-bold text-on-surface mb-5">Add Discount</h4>
              {dscFormError && (
                <p className="mb-4 text-sm text-error font-medium">{dscFormError}</p>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5">
                <div>
                  <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-1.5">
                    Student
                  </label>
                  <select
                    value={dscStudent}
                    onChange={e => setDscStudent(e.target.value ? Number(e.target.value) : '')}
                    className="w-full px-4 py-2.5 bg-surface-container-low border-none rounded-lg text-sm text-on-surface focus:ring-2 focus:ring-primary/20 cursor-pointer"
                  >
                    <option value="">Select student</option>
                    {students.map(s => (
                      <option key={s.id} value={s.id}>
                        {s.full_name} ({s.student_id})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-1.5">
                    Discount Type
                  </label>
                  <select
                    value={dscType}
                    onChange={e => setDscType(e.target.value)}
                    className="w-full px-4 py-2.5 bg-surface-container-low border-none rounded-lg text-sm text-on-surface focus:ring-2 focus:ring-primary/20 cursor-pointer"
                  >
                    <option value="">Select type</option>
                    {DISCOUNT_TYPES.map(dt => (
                      <option key={dt} value={dt}>{dt}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-1.5">
                    Description
                  </label>
                  <input
                    type="text"
                    value={dscDescription}
                    onChange={e => setDscDescription(e.target.value)}
                    placeholder="Optional description"
                    className="w-full px-4 py-2.5 bg-surface-container-low border-none rounded-lg text-sm text-on-surface placeholder:text-outline-variant focus:ring-2 focus:ring-primary/20"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-1.5">
                    Amount ($)
                  </label>
                  <input
                    type="number"
                    value={dscAmount}
                    onChange={e => setDscAmount(e.target.value)}
                    placeholder="0.00"
                    min="0"
                    step="0.01"
                    className="w-full px-4 py-2.5 bg-surface-container-low border-none rounded-lg text-sm text-on-surface placeholder:text-outline-variant focus:ring-2 focus:ring-primary/20"
                  />
                </div>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={handleSaveDiscount}
                  disabled={dscSaving}
                  className="px-6 py-2.5 bg-primary text-on-primary rounded-lg font-semibold text-sm hover:opacity-90 transition-opacity disabled:opacity-50"
                >
                  {dscSaving ? 'Saving...' : 'Add Discount'}
                </button>
                <button
                  onClick={resetDiscountForm}
                  className="px-5 py-2.5 bg-surface-container-high text-on-surface rounded-lg font-semibold text-sm hover:opacity-80 transition-opacity"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {/* Discounts Table */}
          <div className="bg-surface-container-lowest rounded-xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-left min-w-[600px]">
                <thead>
                  <tr className="bg-surface-container-low text-on-surface-variant">
                    <th className="px-4 md:px-6 py-4 font-bold text-[10px] uppercase tracking-widest">Student</th>
                    <th className="px-4 md:px-6 py-4 font-bold text-[10px] uppercase tracking-widest">Type</th>
                    <th className="px-4 md:px-6 py-4 font-bold text-[10px] uppercase tracking-widest">Description</th>
                    <th className="px-4 md:px-6 py-4 font-bold text-[10px] uppercase tracking-widest">Amount</th>
                    <th className="px-4 md:px-6 py-4 font-bold text-[10px] uppercase tracking-widest hidden md:table-cell">Applied By</th>
                    <th className="px-4 md:px-6 py-4 font-bold text-[10px] uppercase tracking-widest hidden md:table-cell">Date</th>
                    <th className="px-4 md:px-6 py-4 font-bold text-[10px] uppercase tracking-widest">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-surface-container-low">
                  {discountsLoading ? (
                    Array.from({ length: 3 }).map((_, i) => <SkeletonTableRow key={i} cols={7} />)
                  ) : discountsError ? (
                    <tr>
                      <td colSpan={7} className="px-6 py-12 text-center text-error text-sm">
                        {discountsError}
                      </td>
                    </tr>
                  ) : discounts.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-6 py-12 text-center text-on-surface-variant text-sm">
                        No discounts found.
                      </td>
                    </tr>
                  ) : (
                    discounts.map(d => (
                      <tr key={d.id} className="hover:bg-surface-container-low/50 transition-colors">
                        <td className="px-4 md:px-6 py-4 font-semibold text-on-surface text-sm">{d.student_name}</td>
                        <td className="px-4 md:px-6 py-4">
                          <span className="inline-flex items-center px-2 py-1 rounded-full bg-tertiary/10 text-tertiary text-[10px] font-bold uppercase tracking-tighter">
                            {d.discount_type}
                          </span>
                        </td>
                        <td className="px-4 md:px-6 py-4 text-sm text-on-surface-variant">{d.description || '—'}</td>
                        <td className="px-4 md:px-6 py-4 font-headline font-bold text-on-surface text-sm">
                          {formatCurrency(d.amount)}
                        </td>
                        <td className="px-4 md:px-6 py-4 text-sm text-on-surface-variant hidden md:table-cell">
                          {d.applied_by_name ?? '—'}
                        </td>
                        <td className="px-4 md:px-6 py-4 text-sm text-on-surface-variant hidden md:table-cell">
                          {new Date(d.created_at).toLocaleDateString()}
                        </td>
                        <td className="px-4 md:px-6 py-4">
                          {confirmDeleteDsc === d.id ? (
                            <div className="flex items-center gap-1">
                              <button
                                onClick={() => handleDeleteDiscount(d.id)}
                                className="px-2 py-1 bg-error text-on-primary text-xs font-bold rounded"
                              >
                                Confirm
                              </button>
                              <button
                                onClick={() => setConfirmDeleteDsc(null)}
                                className="px-2 py-1 bg-surface-container-high text-on-surface text-xs font-bold rounded"
                              >
                                Cancel
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => setConfirmDeleteDsc(d.id)}
                              className="p-1.5 hover:bg-error/10 rounded-lg transition-colors"
                              aria-label={`Delete discount for ${d.student_name}`}
                            >
                              <span className="material-symbols-outlined text-lg text-error">delete</span>
                            </button>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      </main>
    </PageLayout>
  )
}
