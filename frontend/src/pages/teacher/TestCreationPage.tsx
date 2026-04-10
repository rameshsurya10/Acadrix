import { useState, useEffect, useCallback } from 'react'
import PageLayout from '@/components/layout/PageLayout'
import { SkeletonTableRow } from '@/components/shared/Skeleton'
import {
  teacherService,
  type AssessmentItem,
} from '@/services/teacher/teacherService'

interface SubjectOption {
  id: number
  name: string
  code: string
}

interface CourseOption {
  id: number
  subject_name: string
  section_display: string
}

const STATUS_OPTIONS = ['draft', 'scheduled', 'live', 'completed'] as const

export default function TestCreationPage() {
  /* ── State ──────────────────────────────────────────────────────── */
  const [assessments, setAssessments] = useState<AssessmentItem[]>([])
  const [subjects, setSubjects] = useState<SubjectOption[]>([])
  const [courses, setCourses] = useState<CourseOption[]>([])

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [statusFilter, setStatusFilter] = useState<string>('')

  // Create form
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [createForm, setCreateForm] = useState({
    title: '', subject: '', course: '', total_marks: '', duration_minutes: '', scheduled_date: '', status: 'draft',
  })
  const [createSaving, setCreateSaving] = useState(false)

  // Inline edit
  const [editingId, setEditingId] = useState<number | null>(null)
  const [editForm, setEditForm] = useState({
    title: '', total_marks: '', duration_minutes: '', scheduled_date: '', status: '',
  })
  const [editSaving, setEditSaving] = useState(false)

  // Delete
  const [deletingId, setDeletingId] = useState<number | null>(null)

  /* ── Data loading ───────────────────────────────────────────────── */
  const loadData = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const [aRes, sList, cList] = await Promise.all([
        teacherService.getAssessments(),
        teacherService.getSubjects(),
        teacherService.getCourses(),
      ])
      setAssessments(aRes.results)
      setSubjects(sList)
      setCourses(cList)
    } catch (err) {
      console.error('Test creation page load failed:', err)
      setError('Failed to load assessment data. Please try again.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { loadData() }, [loadData])

  /* ── Filtered list ──────────────────────────────────────────────── */
  const filteredAssessments = statusFilter
    ? assessments.filter(a => a.status === statusFilter)
    : assessments

  /* ── Handlers ───────────────────────────────────────────────────── */
  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    if (!createForm.title.trim() || !createForm.course) return
    try {
      setCreateSaving(true)
      const created = await teacherService.createAssessment({
        title: createForm.title,
        subject: createForm.subject ? Number(createForm.subject) : undefined,
        course: Number(createForm.course),
        total_marks: Number(createForm.total_marks) || 100,
        duration_minutes: Number(createForm.duration_minutes) || 60,
        scheduled_date: createForm.scheduled_date || null,
        status: createForm.status,
      })
      setAssessments(prev => [created, ...prev])
      setCreateForm({ title: '', subject: '', course: '', total_marks: '', duration_minutes: '', scheduled_date: '', status: 'draft' })
      setShowCreateForm(false)
    } catch (err) {
      console.error('Create assessment failed:', err)
    } finally {
      setCreateSaving(false)
    }
  }

  function startEdit(a: AssessmentItem) {
    setEditingId(a.id)
    setEditForm({
      title: a.title,
      total_marks: String(a.total_marks),
      duration_minutes: String(a.duration_minutes),
      scheduled_date: a.scheduled_date ?? '',
      status: a.status,
    })
  }

  function cancelEdit() {
    setEditingId(null)
  }

  async function saveEdit(id: number) {
    try {
      setEditSaving(true)
      const updated = await teacherService.updateAssessment(id, {
        title: editForm.title,
        total_marks: Number(editForm.total_marks),
        duration_minutes: Number(editForm.duration_minutes),
        scheduled_date: editForm.scheduled_date || null,
        status: editForm.status,
      })
      setAssessments(prev => prev.map(a => a.id === id ? updated : a))
      setEditingId(null)
    } catch (err) {
      console.error('Update assessment failed:', err)
    } finally {
      setEditSaving(false)
    }
  }

  async function handleDelete(id: number) {
    try {
      setDeletingId(id)
      await teacherService.deleteAssessment(id)
      setAssessments(prev => prev.filter(a => a.id !== id))
    } catch (err) {
      console.error('Delete assessment failed:', err)
    } finally {
      setDeletingId(null)
    }
  }

  /* ── Helpers ────────────────────────────────────────────────────── */
  function statusBadge(status: string) {
    const map: Record<string, string> = {
      draft: 'bg-surface-container-highest text-outline',
      scheduled: 'bg-primary/10 text-primary',
      live: 'bg-tertiary/10 text-tertiary',
      completed: 'bg-secondary-container text-on-secondary-container',
      pending_approval: 'bg-error/10 text-error',
    }
    return map[status] ?? 'bg-surface-container-high text-on-surface-variant'
  }

  function formatDate(dateStr: string | null) {
    if (!dateStr) return '--'
    return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  }

  /* ── Render ─────────────────────────────────────────────────────── */
  return (
    <PageLayout>
      <main className="max-w-7xl mx-auto px-4 md:px-6 py-10 pb-32">
        {/* Header */}
        <section className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <span className="font-label text-xs font-semibold tracking-widest text-on-surface-variant uppercase mb-2 block">Assessment Lab</span>
            <h2 className="font-headline font-extrabold text-3xl md:text-4xl text-on-surface tracking-tight">Test Creation &amp; Publishing</h2>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowCreateForm(v => !v)}
              className="px-8 py-2.5 bg-primary text-on-primary font-bold rounded-lg shadow-md hover:shadow-lg transition-all active:scale-95 flex items-center gap-2"
            >
              <span className="material-symbols-outlined text-sm">{showCreateForm ? 'close' : 'add'}</span>
              {showCreateForm ? 'Cancel' : 'New Assessment'}
            </button>
          </div>
        </section>

        {/* Error */}
        {error && (
          <div className="mb-8 p-4 bg-error/10 rounded-xl flex items-center gap-3">
            <span className="material-symbols-outlined text-error">error</span>
            <p className="text-error text-sm font-medium flex-1">{error}</p>
            <button onClick={loadData} className="text-sm font-bold text-error underline">Retry</button>
          </div>
        )}

        {/* Create Form */}
        {showCreateForm && (
          <form onSubmit={handleCreate} className="bg-surface-container-lowest p-8 rounded-2xl mb-8 shadow-sm">
            <h3 className="text-lg font-bold font-headline mb-6 text-primary flex items-center gap-2">
              <span className="material-symbols-outlined text-xl">settings</span>
              New Assessment Configuration
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              <div className="space-y-1 sm:col-span-2 lg:col-span-3">
                <label className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">Title</label>
                <input
                  type="text"
                  required
                  value={createForm.title}
                  onChange={e => setCreateForm(f => ({ ...f, title: e.target.value }))}
                  className="w-full bg-surface-container-low border-none rounded-lg px-4 py-3 text-on-surface focus:ring-2 focus:ring-primary/20 outline-none"
                  placeholder="Assessment title..."
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">Subject</label>
                <select
                  value={createForm.subject}
                  onChange={e => setCreateForm(f => ({ ...f, subject: e.target.value }))}
                  className="w-full bg-surface-container-low border-none rounded-lg px-4 py-3 focus:ring-2 focus:ring-primary/20"
                >
                  <option value="">Select subject...</option>
                  {subjects.map(s => (
                    <option key={s.id} value={s.id}>{s.name} ({s.code})</option>
                  ))}
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">Course</label>
                <select
                  required
                  value={createForm.course}
                  onChange={e => setCreateForm(f => ({ ...f, course: e.target.value }))}
                  className="w-full bg-surface-container-low border-none rounded-lg px-4 py-3 focus:ring-2 focus:ring-primary/20"
                >
                  <option value="">Select course...</option>
                  {courses.map(c => (
                    <option key={c.id} value={c.id}>{c.subject_name} - {c.section_display}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">Total Marks</label>
                <input
                  type="number"
                  min={1}
                  value={createForm.total_marks}
                  onChange={e => setCreateForm(f => ({ ...f, total_marks: e.target.value }))}
                  className="w-full bg-surface-container-low border-none rounded-lg px-4 py-3 focus:ring-2 focus:ring-primary/20"
                  placeholder="100"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">Duration (minutes)</label>
                <input
                  type="number"
                  min={1}
                  value={createForm.duration_minutes}
                  onChange={e => setCreateForm(f => ({ ...f, duration_minutes: e.target.value }))}
                  className="w-full bg-surface-container-low border-none rounded-lg px-4 py-3 focus:ring-2 focus:ring-primary/20"
                  placeholder="60"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">Scheduled Date</label>
                <input
                  type="date"
                  value={createForm.scheduled_date}
                  onChange={e => setCreateForm(f => ({ ...f, scheduled_date: e.target.value }))}
                  className="w-full bg-surface-container-low border-none rounded-lg px-4 py-3 focus:ring-2 focus:ring-primary/20"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">Status</label>
                <select
                  value={createForm.status}
                  onChange={e => setCreateForm(f => ({ ...f, status: e.target.value }))}
                  className="w-full bg-surface-container-low border-none rounded-lg px-4 py-3 focus:ring-2 focus:ring-primary/20"
                >
                  {STATUS_OPTIONS.map(s => (
                    <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="flex justify-end mt-6">
              <button
                type="submit"
                disabled={createSaving}
                className="px-8 py-2.5 bg-primary text-on-primary font-bold rounded-lg shadow-md hover:shadow-lg transition-all active:scale-95 disabled:opacity-50"
              >
                {createSaving ? 'Creating...' : 'Create Assessment'}
              </button>
            </div>
          </form>
        )}

        {/* Filter Bar */}
        <div className="flex items-center gap-4 bg-surface-container-lowest p-3 rounded-xl shadow-sm mb-8">
          <div className="flex items-center gap-2 px-3">
            <span className="material-symbols-outlined text-on-surface-variant">filter_list</span>
            <span className="text-xs font-bold uppercase text-on-surface-variant tracking-wider">Status:</span>
          </div>
          <button
            onClick={() => setStatusFilter('')}
            className={`px-4 py-1.5 rounded-lg text-sm font-semibold transition-colors ${!statusFilter ? 'bg-primary text-on-primary' : 'hover:bg-surface-container-high text-on-surface-variant'}`}
          >
            All
          </button>
          {STATUS_OPTIONS.map(s => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-4 py-1.5 rounded-lg text-sm font-semibold transition-colors capitalize ${statusFilter === s ? 'bg-primary text-on-primary' : 'hover:bg-surface-container-high text-on-surface-variant'}`}
            >
              {s}
            </button>
          ))}
          <div className="ml-auto text-xs font-semibold text-on-surface-variant">
            {filteredAssessments.length} assessment{filteredAssessments.length !== 1 ? 's' : ''}
          </div>
        </div>

        {/* Assessment Table */}
        <section className="bg-surface-container-low rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-surface-container-low border-b border-outline-variant/10">
                <tr>
                  <th className="px-6 py-5 text-xs font-bold uppercase tracking-widest text-on-surface-variant">Title</th>
                  <th className="px-4 py-5 text-xs font-bold uppercase tracking-widest text-on-surface-variant">Subject</th>
                  <th className="px-4 py-5 text-xs font-bold uppercase tracking-widest text-on-surface-variant">Course</th>
                  <th className="px-4 py-5 text-xs font-bold uppercase tracking-widest text-on-surface-variant text-center">Marks</th>
                  <th className="px-4 py-5 text-xs font-bold uppercase tracking-widest text-on-surface-variant text-center">Duration</th>
                  <th className="px-4 py-5 text-xs font-bold uppercase tracking-widest text-on-surface-variant">Date</th>
                  <th className="px-4 py-5 text-xs font-bold uppercase tracking-widest text-on-surface-variant">Status</th>
                  <th className="px-6 py-5 text-xs font-bold uppercase tracking-widest text-on-surface-variant text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/10">
                {loading ? (
                  Array.from({ length: 5 }).map((_, i) => <SkeletonTableRow key={i} cols={8} />)
                ) : filteredAssessments.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-6 py-20 text-center">
                      <span className="material-symbols-outlined text-6xl text-on-surface-variant/20 mb-3 block">quiz</span>
                      <p className="text-lg font-semibold text-on-surface-variant">
                        {statusFilter ? `No ${statusFilter} assessments` : 'No assessments created yet'}
                      </p>
                      <p className="text-sm text-on-surface-variant/60 mt-1">
                        {statusFilter ? 'Try a different filter or create a new assessment.' : 'Click "New Assessment" to get started.'}
                      </p>
                    </td>
                  </tr>
                ) : (
                  filteredAssessments.map((a, idx) => {
                    const isEditing = editingId === a.id
                    const isDeleting = deletingId === a.id
                    return (
                      <tr key={a.id} className={`${idx % 2 === 0 ? 'bg-surface-container-lowest' : 'bg-surface'} hover:bg-surface-container transition-colors`}>
                        {/* Title */}
                        <td className="px-6 py-4">
                          {isEditing ? (
                            <input
                              type="text"
                              value={editForm.title}
                              onChange={e => setEditForm(f => ({ ...f, title: e.target.value }))}
                              className="w-full bg-surface-container-low border border-primary/30 rounded-lg px-3 py-1.5 text-sm font-semibold focus:ring-2 focus:ring-primary/20"
                            />
                          ) : (
                            <p className="font-semibold text-on-surface">{a.title}</p>
                          )}
                        </td>
                        {/* Subject */}
                        <td className="px-4 py-4 text-sm text-on-surface-variant">{a.subject_name || '--'}</td>
                        {/* Course */}
                        <td className="px-4 py-4 text-sm text-on-surface-variant">{a.course_name || '--'}</td>
                        {/* Marks */}
                        <td className="px-4 py-4 text-center">
                          {isEditing ? (
                            <input
                              type="number"
                              min={1}
                              value={editForm.total_marks}
                              onChange={e => setEditForm(f => ({ ...f, total_marks: e.target.value }))}
                              className="w-16 bg-surface-container-low border border-primary/30 rounded-lg px-2 py-1.5 text-center text-sm focus:ring-2 focus:ring-primary/20"
                            />
                          ) : (
                            <span className="font-bold text-on-surface">{a.total_marks}</span>
                          )}
                        </td>
                        {/* Duration */}
                        <td className="px-4 py-4 text-center">
                          {isEditing ? (
                            <input
                              type="number"
                              min={1}
                              value={editForm.duration_minutes}
                              onChange={e => setEditForm(f => ({ ...f, duration_minutes: e.target.value }))}
                              className="w-16 bg-surface-container-low border border-primary/30 rounded-lg px-2 py-1.5 text-center text-sm focus:ring-2 focus:ring-primary/20"
                            />
                          ) : (
                            <span className="text-sm text-on-surface-variant">{a.duration_minutes}m</span>
                          )}
                        </td>
                        {/* Date */}
                        <td className="px-4 py-4">
                          {isEditing ? (
                            <input
                              type="date"
                              value={editForm.scheduled_date}
                              onChange={e => setEditForm(f => ({ ...f, scheduled_date: e.target.value }))}
                              className="bg-surface-container-low border border-primary/30 rounded-lg px-2 py-1.5 text-sm focus:ring-2 focus:ring-primary/20"
                            />
                          ) : (
                            <span className="text-sm text-on-surface-variant">{formatDate(a.scheduled_date)}</span>
                          )}
                        </td>
                        {/* Status */}
                        <td className="px-4 py-4">
                          {isEditing ? (
                            <select
                              value={editForm.status}
                              onChange={e => setEditForm(f => ({ ...f, status: e.target.value }))}
                              className="bg-surface-container-low border border-primary/30 rounded-lg px-2 py-1.5 text-sm focus:ring-2 focus:ring-primary/20"
                            >
                              {STATUS_OPTIONS.map(s => (
                                <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                              ))}
                            </select>
                          ) : (
                            <span className={`${statusBadge(a.status)} text-[10px] font-bold px-2 py-1 rounded uppercase tracking-tighter`}>
                              {a.status}
                            </span>
                          )}
                        </td>
                        {/* Actions */}
                        <td className="px-6 py-4 text-right">
                          {isEditing ? (
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => saveEdit(a.id)}
                                disabled={editSaving}
                                className="text-primary hover:text-primary/80 transition-colors disabled:opacity-50"
                                aria-label="Save assessment"
                              >
                                <span className="material-symbols-outlined">{editSaving ? 'hourglass_empty' : 'check'}</span>
                              </button>
                              <button
                                onClick={cancelEdit}
                                className="text-on-surface-variant hover:text-error transition-colors"
                                aria-label="Cancel editing"
                              >
                                <span className="material-symbols-outlined">close</span>
                              </button>
                            </div>
                          ) : (
                            <div className="flex items-center justify-end gap-1">
                              <button
                                onClick={() => startEdit(a)}
                                className="p-1.5 rounded-lg text-on-surface-variant hover:text-primary hover:bg-primary/5 transition-colors"
                                aria-label="Edit assessment"
                              >
                                <span className="material-symbols-outlined text-xl">edit</span>
                              </button>
                              <button
                                onClick={() => handleDelete(a.id)}
                                disabled={isDeleting}
                                className="p-1.5 rounded-lg text-on-surface-variant hover:text-error hover:bg-error/5 transition-colors disabled:opacity-50"
                                aria-label="Delete assessment"
                              >
                                <span className="material-symbols-outlined text-xl">{isDeleting ? 'hourglass_empty' : 'delete'}</span>
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </PageLayout>
  )
}
