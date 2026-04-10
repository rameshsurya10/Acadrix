import { useState, useEffect, useCallback } from 'react'
import PageLayout from '@/components/layout/PageLayout'
import { academicsService, type ReportCardTemplate } from '@/services/academics/academicsService'
import { adminService, type Grade, type AcademicYear } from '@/services/admin/adminService'
import { SkeletonTableRow } from '@/components/shared/Skeleton'

const BOARD_TYPES = [
  { value: 'cbse', label: 'CBSE' },
  { value: 'icse', label: 'ICSE' },
  { value: 'state', label: 'State Board' },
  { value: 'custom', label: 'Custom' },
]

const GRADING_SCALES = [
  { value: 'marks', label: 'Marks' },
  { value: 'grades', label: 'Grades' },
  { value: 'both', label: 'Both' },
]

const BOARD_BADGE: Record<string, string> = {
  cbse: 'bg-primary/10 text-primary',
  icse: 'bg-tertiary/10 text-tertiary',
  state: 'bg-secondary/10 text-secondary',
  custom: 'bg-outline/10 text-on-surface-variant',
}

interface TemplateForm {
  name: string
  board_type: string
  grade: string
  academic_year: string
  grading_scale: string
  show_attendance: boolean
  show_remarks: boolean
  show_rank: boolean
}

const EMPTY_FORM: TemplateForm = {
  name: '',
  board_type: 'cbse',
  grade: '',
  academic_year: '',
  grading_scale: 'marks',
  show_attendance: true,
  show_remarks: true,
  show_rank: false,
}

export default function ReportCardTemplatesPage() {
  const [templates, setTemplates] = useState<ReportCardTemplate[]>([])
  const [grades, setGrades] = useState<Grade[]>([])
  const [years, setYears] = useState<AcademicYear[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [form, setForm] = useState<TemplateForm>(EMPTY_FORM)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  const loadData = useCallback(async () => {
    setLoading(true)
    try {
      const [tplRes, gradeRes, yearRes] = await Promise.all([
        academicsService.getTemplates(),
        adminService.getGrades(),
        adminService.getAcademicYears(),
      ])
      setTemplates(tplRes.results)
      setGrades(gradeRes)
      setYears(yearRes)
    } catch {
      setError('Failed to load data. Please try again.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { loadData() }, [loadData])

  function openCreate() {
    setEditingId(null)
    setForm(EMPTY_FORM)
    setShowForm(true)
    setError('')
  }

  function openEdit(t: ReportCardTemplate) {
    setEditingId(t.id)
    setForm({
      name: t.name,
      board_type: t.board_type,
      grade: String(t.grade),
      academic_year: String(t.academic_year),
      grading_scale: t.grading_scale,
      show_attendance: t.show_attendance,
      show_remarks: t.show_remarks,
      show_rank: t.show_rank,
    })
    setShowForm(true)
    setError('')
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.name.trim() || !form.grade || !form.academic_year) {
      setError('Please fill in all required fields.')
      return
    }
    setSubmitting(true)
    setError('')
    try {
      const payload = {
        name: form.name.trim(),
        board_type: form.board_type,
        grade: Number(form.grade),
        academic_year: Number(form.academic_year),
        grading_scale: form.grading_scale,
        show_attendance: form.show_attendance,
        show_remarks: form.show_remarks,
        show_rank: form.show_rank,
      }
      if (editingId) {
        await academicsService.updateTemplate(editingId, payload)
      } else {
        await academicsService.createTemplate(payload)
      }
      setShowForm(false)
      setForm(EMPTY_FORM)
      setEditingId(null)
      await loadData()
    } catch {
      setError('Failed to save template. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  async function handleDelete(id: number) {
    if (!window.confirm('Are you sure you want to delete this template?')) return
    try {
      await academicsService.deleteTemplate(id)
      await loadData()
    } catch {
      setError('Failed to delete template.')
    }
  }

  return (
    <PageLayout sidebar>
      <main className="pb-20 md:pb-0">
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-6 md:py-10 space-y-8 md:space-y-12">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div className="space-y-2">
              <span className="font-label text-xs font-semibold tracking-widest text-on-surface-variant uppercase mb-2 block">Academics</span>
              <h2 className="font-headline font-extrabold text-3xl md:text-4xl text-on-surface">Report Card Templates</h2>
            </div>
            <button
              onClick={openCreate}
              className="flex items-center gap-2 bg-primary text-on-primary px-5 py-3 rounded-xl font-bold text-sm hover:opacity-90 transition-opacity self-start md:self-auto"
            >
              <span className="material-symbols-outlined text-lg">add</span>
              New Template
            </button>
          </div>

          {/* Error */}
          {error && (
            <div className="bg-error/10 text-error px-4 py-3 rounded-lg text-sm font-medium flex items-center gap-2">
              <span className="material-symbols-outlined text-lg">error</span>
              {error}
            </div>
          )}

          {/* Create / Edit Form */}
          {showForm && (
            <div className="bg-surface-container-lowest rounded-xl p-6 md:p-8 space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold font-headline">{editingId ? 'Edit Template' : 'Create New Template'}</h3>
                <button onClick={() => { setShowForm(false); setEditingId(null) }} className="text-on-surface-variant hover:text-on-surface transition-colors">
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>
              <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                <div className="space-y-1.5">
                  <label htmlFor="tpl-name" className="text-xs font-bold uppercase tracking-widest text-on-surface-variant font-label">Name *</label>
                  <input
                    id="tpl-name"
                    type="text"
                    value={form.name}
                    onChange={e => setForm(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full bg-surface-container-low border-none rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-primary"
                    placeholder="e.g. Term 1 Report Card"
                  />
                </div>
                <div className="space-y-1.5">
                  <label htmlFor="tpl-board" className="text-xs font-bold uppercase tracking-widest text-on-surface-variant font-label">Board Type *</label>
                  <select
                    id="tpl-board"
                    value={form.board_type}
                    onChange={e => setForm(prev => ({ ...prev, board_type: e.target.value }))}
                    className="w-full bg-surface-container-low border-none rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-primary cursor-pointer"
                  >
                    {BOARD_TYPES.map(b => <option key={b.value} value={b.value}>{b.label}</option>)}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label htmlFor="tpl-grade" className="text-xs font-bold uppercase tracking-widest text-on-surface-variant font-label">Grade *</label>
                  <select
                    id="tpl-grade"
                    value={form.grade}
                    onChange={e => setForm(prev => ({ ...prev, grade: e.target.value }))}
                    className="w-full bg-surface-container-low border-none rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-primary cursor-pointer"
                  >
                    <option value="">Select grade</option>
                    {grades.map(g => <option key={g.id} value={g.id}>{g.label}</option>)}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label htmlFor="tpl-year" className="text-xs font-bold uppercase tracking-widest text-on-surface-variant font-label">Academic Year *</label>
                  <select
                    id="tpl-year"
                    value={form.academic_year}
                    onChange={e => setForm(prev => ({ ...prev, academic_year: e.target.value }))}
                    className="w-full bg-surface-container-low border-none rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-primary cursor-pointer"
                  >
                    <option value="">Select year</option>
                    {years.map(y => <option key={y.id} value={y.id}>{y.label}</option>)}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label htmlFor="tpl-scale" className="text-xs font-bold uppercase tracking-widest text-on-surface-variant font-label">Grading Scale</label>
                  <select
                    id="tpl-scale"
                    value={form.grading_scale}
                    onChange={e => setForm(prev => ({ ...prev, grading_scale: e.target.value }))}
                    className="w-full bg-surface-container-low border-none rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-primary cursor-pointer"
                  >
                    {GRADING_SCALES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                  </select>
                </div>

                {/* Checkboxes */}
                <div className="flex flex-col justify-end gap-3">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={form.show_attendance} onChange={e => setForm(prev => ({ ...prev, show_attendance: e.target.checked }))} className="rounded border-outline text-primary focus:ring-primary" />
                    <span className="text-sm text-on-surface">Show Attendance</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={form.show_remarks} onChange={e => setForm(prev => ({ ...prev, show_remarks: e.target.checked }))} className="rounded border-outline text-primary focus:ring-primary" />
                    <span className="text-sm text-on-surface">Show Remarks</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={form.show_rank} onChange={e => setForm(prev => ({ ...prev, show_rank: e.target.checked }))} className="rounded border-outline text-primary focus:ring-primary" />
                    <span className="text-sm text-on-surface">Show Rank</span>
                  </label>
                </div>

                <div className="md:col-span-2 lg:col-span-3 flex justify-end gap-3 pt-2">
                  <button type="button" onClick={() => { setShowForm(false); setEditingId(null) }} className="px-5 py-3 rounded-lg text-sm font-semibold text-on-surface-variant hover:bg-surface-container-high transition-colors">
                    Cancel
                  </button>
                  <button type="submit" disabled={submitting} className="flex items-center gap-2 bg-primary text-on-primary px-6 py-3 rounded-lg font-bold text-sm hover:opacity-90 transition-opacity disabled:opacity-50">
                    {submitting && <span className="material-symbols-outlined text-sm animate-spin">progress_activity</span>}
                    {editingId ? 'Update Template' : 'Create Template'}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Templates Table */}
          <div className="space-y-4">
            <div className="overflow-x-auto -mx-4 md:mx-0">
              <table className="w-full border-separate border-spacing-y-2 min-w-[800px]">
                <thead>
                  <tr className="text-left bg-surface-container-low">
                    <th className="px-4 md:px-6 py-4 text-xs font-bold uppercase tracking-widest text-on-surface-variant/70 font-label rounded-l-lg">Name</th>
                    <th className="px-4 md:px-6 py-4 text-xs font-bold uppercase tracking-widest text-on-surface-variant/70 font-label">Board</th>
                    <th className="px-4 md:px-6 py-4 text-xs font-bold uppercase tracking-widest text-on-surface-variant/70 font-label">Grade</th>
                    <th className="px-4 md:px-6 py-4 text-xs font-bold uppercase tracking-widest text-on-surface-variant/70 font-label hidden md:table-cell">Year</th>
                    <th className="px-4 md:px-6 py-4 text-xs font-bold uppercase tracking-widest text-on-surface-variant/70 font-label hidden md:table-cell">Scale</th>
                    <th className="px-4 md:px-6 py-4 text-xs font-bold uppercase tracking-widest text-on-surface-variant/70 font-label">Terms</th>
                    <th className="px-4 md:px-6 py-4 text-xs font-bold uppercase tracking-widest text-on-surface-variant/70 font-label">Status</th>
                    <th className="px-4 md:px-6 py-4 text-xs font-bold uppercase tracking-widest text-on-surface-variant/70 font-label rounded-r-lg">Actions</th>
                  </tr>
                </thead>
                <tbody className="text-sm">
                  {loading ? (
                    Array.from({ length: 4 }).map((_, i) => <SkeletonTableRow key={i} cols={8} />)
                  ) : templates.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="px-6 py-16 text-center">
                        <div className="flex flex-col items-center gap-3">
                          <span className="material-symbols-outlined text-5xl text-on-surface-variant/30">description</span>
                          <p className="text-on-surface-variant font-medium">No templates yet</p>
                          <p className="text-on-surface-variant/60 text-xs">Create your first report card template to get started.</p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    templates.map(t => {
                      const boardStyle = BOARD_BADGE[t.board_type] ?? BOARD_BADGE.custom
                      return (
                        <tr key={t.id} className="bg-surface-container-lowest hover:bg-surface transition-colors group">
                          <td className="px-4 md:px-6 py-4 md:py-5 rounded-l-lg">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded bg-primary/10 text-primary flex items-center justify-center">
                                <span className="material-symbols-outlined text-lg">description</span>
                              </div>
                              <span className="font-semibold text-on-surface">{t.name}</span>
                            </div>
                          </td>
                          <td className="px-4 md:px-6 py-4 md:py-5">
                            <span className={`text-xs px-3 py-1 rounded-full font-bold uppercase tracking-tight ${boardStyle}`}>
                              {t.board_type_display || t.board_type}
                            </span>
                          </td>
                          <td className="px-4 md:px-6 py-4 md:py-5 text-on-surface-variant">{t.grade_label}</td>
                          <td className="px-4 md:px-6 py-4 md:py-5 text-on-surface-variant hidden md:table-cell">{t.academic_year_label}</td>
                          <td className="px-4 md:px-6 py-4 md:py-5 text-on-surface-variant hidden md:table-cell capitalize">{t.grading_scale_display || t.grading_scale}</td>
                          <td className="px-4 md:px-6 py-4 md:py-5">
                            <span className="bg-secondary-container text-on-secondary-container text-xs px-2.5 py-1 rounded-full font-bold">
                              {t.terms?.length ?? 0}
                            </span>
                          </td>
                          <td className="px-4 md:px-6 py-4 md:py-5">
                            <div className="flex items-center gap-2">
                              <span className={`w-2 h-2 rounded-full ${t.is_active ? 'bg-tertiary' : 'bg-outline'}`} />
                              <span className={`text-xs font-bold uppercase tracking-tighter ${t.is_active ? 'text-tertiary' : 'text-on-surface-variant'}`}>
                                {t.is_active ? 'Active' : 'Inactive'}
                              </span>
                            </div>
                          </td>
                          <td className="px-4 md:px-6 py-4 md:py-5 rounded-r-lg">
                            <div className="flex items-center gap-1">
                              <button
                                onClick={() => openEdit(t)}
                                className="w-8 h-8 rounded-lg flex items-center justify-center text-on-surface-variant hover:bg-primary/10 hover:text-primary transition-colors"
                                aria-label={`Edit ${t.name}`}
                              >
                                <span className="material-symbols-outlined text-lg">edit</span>
                              </button>
                              <button
                                onClick={() => handleDelete(t.id)}
                                className="w-8 h-8 rounded-lg flex items-center justify-center text-on-surface-variant hover:bg-error/10 hover:text-error transition-colors"
                                aria-label={`Delete ${t.name}`}
                              >
                                <span className="material-symbols-outlined text-lg">delete</span>
                              </button>
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
        </div>
      </main>
    </PageLayout>
  )
}
