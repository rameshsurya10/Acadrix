import { useState, useEffect, useCallback } from 'react'
import PageLayout from '@/components/layout/PageLayout'
import {
  adminService,
  type Subject,
  type Department,
} from '@/services/admin/adminService'
import { SkeletonTableRow } from '@/components/shared/Skeleton'

const INPUT_CLASS = 'w-full px-4 py-3 bg-surface-container-low border-none rounded-lg focus:ring-2 focus:ring-primary text-sm'
const LABEL_CLASS = 'block text-xs font-bold uppercase tracking-wider text-on-surface-variant mb-2'

export default function SubjectsPage() {
  // ── Subjects state ────────────────────────────────────────────────────
  const [subjects, setSubjects] = useState<Subject[]>([])
  const [loadingSubjects, setLoadingSubjects] = useState(true)
  const [showSubjectForm, setShowSubjectForm] = useState(false)
  const [subjectForm, setSubjectForm] = useState({ name: '', code: '', department: '' })
  const [submittingSubject, setSubmittingSubject] = useState(false)
  const [togglingSubjectId, setTogglingSubjectId] = useState<number | null>(null)
  const [deletingSubjectId, setDeletingSubjectId] = useState<number | null>(null)
  const [deptFilter, setDeptFilter] = useState('')

  // ── Departments state ─────────────────────────────────────────────────
  const [departments, setDepartments] = useState<Department[]>([])
  const [loadingDepts, setLoadingDepts] = useState(true)
  const [showDeptForm, setShowDeptForm] = useState(false)
  const [deptForm, setDeptForm] = useState({ name: '', code: '' })
  const [submittingDept, setSubmittingDept] = useState(false)
  const [deletingDeptId, setDeletingDeptId] = useState<number | null>(null)

  // ── Shared ────────────────────────────────────────────────────────────
  const [error, setError] = useState<string | null>(null)

  // ── Fetch helpers ─────────────────────────────────────────────────────
  const fetchDepartments = useCallback(async () => {
    setLoadingDepts(true)
    try {
      const data = await adminService.getDepartments()
      setDepartments(data)
    } catch {
      setError('Failed to load departments.')
    } finally {
      setLoadingDepts(false)
    }
  }, [])

  const fetchSubjects = useCallback(async () => {
    setLoadingSubjects(true)
    try {
      const params: Record<string, string> = {}
      if (deptFilter) params.department = deptFilter
      const data = await adminService.getSubjects(params)
      setSubjects(data)
    } catch {
      setError('Failed to load subjects.')
    } finally {
      setLoadingSubjects(false)
    }
  }, [deptFilter])

  useEffect(() => {
    fetchDepartments()
  }, [fetchDepartments])

  useEffect(() => {
    fetchSubjects()
  }, [fetchSubjects])

  // ── Subject handlers ──────────────────────────────────────────────────
  async function handleCreateSubject(e: React.FormEvent) {
    e.preventDefault()
    setSubmittingSubject(true)
    setError(null)
    try {
      await adminService.createSubject({
        name: subjectForm.name,
        code: subjectForm.code,
        department: Number(subjectForm.department),
      })
      setSubjectForm({ name: '', code: '', department: '' })
      setShowSubjectForm(false)
      await fetchSubjects()
    } catch (err: any) {
      setError(err?.response?.data?.detail || err?.response?.data?.error || 'Failed to create subject.')
    } finally {
      setSubmittingSubject(false)
    }
  }

  async function handleToggleActive(subject: Subject) {
    setTogglingSubjectId(subject.id)
    setError(null)
    try {
      await adminService.updateSubject(subject.id, { is_active: !subject.is_active })
      await fetchSubjects()
    } catch (err: any) {
      setError(err?.response?.data?.detail || 'Failed to update subject.')
    } finally {
      setTogglingSubjectId(null)
    }
  }

  async function handleDeleteSubject(id: number) {
    if (!window.confirm('Delete this subject?')) return
    setDeletingSubjectId(id)
    setError(null)
    try {
      await adminService.deleteSubject(id)
      await fetchSubjects()
    } catch (err: any) {
      setError(err?.response?.data?.detail || 'Failed to delete subject.')
    } finally {
      setDeletingSubjectId(null)
    }
  }

  // ── Department handlers ───────────────────────────────────────────────
  async function handleCreateDept(e: React.FormEvent) {
    e.preventDefault()
    setSubmittingDept(true)
    setError(null)
    try {
      await adminService.createDepartment({ name: deptForm.name, code: deptForm.code })
      setDeptForm({ name: '', code: '' })
      setShowDeptForm(false)
      await fetchDepartments()
    } catch (err: any) {
      setError(err?.response?.data?.detail || err?.response?.data?.error || 'Failed to create department.')
    } finally {
      setSubmittingDept(false)
    }
  }

  async function handleDeleteDept(id: number) {
    if (!window.confirm('Delete this department? Subjects linked to it may be affected.')) return
    setDeletingDeptId(id)
    setError(null)
    try {
      await adminService.deleteDepartment(id)
      await Promise.all([fetchDepartments(), fetchSubjects()])
    } catch (err: any) {
      setError(err?.response?.data?.detail || 'Failed to delete department.')
    } finally {
      setDeletingDeptId(null)
    }
  }

  return (
    <PageLayout>
      <main className="flex-grow container mx-auto px-4 md:px-6 py-6 md:py-10 pb-32">
        {/* Header */}
        <section className="mb-8 md:mb-10">
          <span className="font-label text-xs font-semibold tracking-widest text-on-surface-variant uppercase mb-2 block">
            Academic Management
          </span>
          <h2 className="font-headline font-extrabold text-3xl md:text-4xl text-on-surface tracking-tight">
            Subjects & Departments
          </h2>
          <p className="text-on-surface-variant mt-2 text-sm">
            Manage the curriculum subjects and their organizational departments.
          </p>
        </section>

        {/* Error */}
        {error && (
          <div className="mb-6 flex items-center gap-2 rounded-lg bg-error-container/40 border border-error/20 px-4 py-3">
            <span className="material-symbols-outlined text-error text-lg">error</span>
            <span className="text-sm text-on-error-container">{error}</span>
          </div>
        )}

        {/* ═══ SUBJECTS SECTION ═══ */}
        <section className="mb-10 md:mb-14">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-5">
            <h3 className="font-headline font-bold text-xl text-on-surface flex items-center gap-2">
              <span className="material-symbols-outlined text-primary">menu_book</span>
              Subjects
            </h3>
            <button
              type="button"
              onClick={() => setShowSubjectForm(prev => !prev)}
              className="bg-primary text-on-primary px-4 py-2.5 rounded-lg font-headline font-bold text-sm flex items-center gap-2 hover:bg-primary/90 transition-colors"
            >
              <span className="material-symbols-outlined text-sm">{showSubjectForm ? 'close' : 'add'}</span>
              {showSubjectForm ? 'Cancel' : 'Add Subject'}
            </button>
          </div>

          {/* Subject create form */}
          {showSubjectForm && (
            <div className="bg-surface-container-lowest rounded-2xl p-5 sm:p-6 shadow-sm mb-5">
              <form onSubmit={handleCreateSubject} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className={LABEL_CLASS}>Name *</label>
                    <input
                      className={INPUT_CLASS}
                      required
                      value={subjectForm.name}
                      onChange={e => setSubjectForm(f => ({ ...f, name: e.target.value }))}
                      placeholder="e.g. Mathematics"
                    />
                  </div>
                  <div>
                    <label className={LABEL_CLASS}>Code *</label>
                    <input
                      className={INPUT_CLASS}
                      required
                      value={subjectForm.code}
                      onChange={e => setSubjectForm(f => ({ ...f, code: e.target.value }))}
                      placeholder="e.g. MATH101"
                    />
                  </div>
                  <div>
                    <label className={LABEL_CLASS}>Department *</label>
                    <select
                      className={INPUT_CLASS}
                      required
                      value={subjectForm.department}
                      onChange={e => setSubjectForm(f => ({ ...f, department: e.target.value }))}
                    >
                      <option value="">Select department</option>
                      {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                    </select>
                  </div>
                </div>
                <button
                  type="submit"
                  disabled={submittingSubject}
                  className="w-full sm:w-auto bg-primary text-on-primary font-headline font-bold py-3 px-8 rounded-xl hover:bg-primary/90 disabled:opacity-60 text-sm"
                >
                  {submittingSubject ? (
                    <span className="flex items-center justify-center gap-2">
                      <span className="w-4 h-4 border-2 border-on-primary/30 border-t-on-primary rounded-full animate-spin" />
                      Adding...
                    </span>
                  ) : 'Add Subject'}
                </button>
              </form>
            </div>
          )}

          {/* Department filter */}
          <div className="bg-surface-container-lowest/80 backdrop-blur-xl p-3 md:p-4 rounded-xl mb-5 flex items-center gap-3">
            <span className="material-symbols-outlined text-on-surface-variant">filter_list</span>
            <select
              className="bg-surface-container-low border-none rounded-lg py-3 px-4 text-xs font-semibold uppercase tracking-wider text-on-surface-variant focus:ring-primary cursor-pointer"
              value={deptFilter}
              onChange={e => setDeptFilter(e.target.value)}
            >
              <option value="">Department: All</option>
              {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
            </select>
          </div>

          {/* Subjects table */}
          <div className="bg-surface-container-lowest rounded-xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-left min-w-[600px]">
                <thead>
                  <tr className="bg-surface-container-low text-on-surface-variant">
                    <th className="px-4 md:px-6 py-4 font-bold text-[10px] uppercase tracking-widest">Subject</th>
                    <th className="px-4 md:px-6 py-4 font-bold text-[10px] uppercase tracking-widest">Code</th>
                    <th className="px-4 md:px-6 py-4 font-bold text-[10px] uppercase tracking-widest hidden md:table-cell">Department</th>
                    <th className="px-4 md:px-6 py-4 font-bold text-[10px] uppercase tracking-widest">Status</th>
                    <th className="px-4 md:px-6 py-4 font-bold text-[10px] uppercase tracking-widest text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-surface-container-low">
                  {loadingSubjects ? (
                    Array.from({ length: 4 }).map((_, i) => <SkeletonTableRow key={i} cols={5} />)
                  ) : subjects.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-12 text-center">
                        <span className="material-symbols-outlined text-4xl text-on-surface-variant mb-3 block">menu_book</span>
                        <p className="text-on-surface-variant font-medium">No subjects found.</p>
                        <p className="text-sm text-on-surface-variant mt-1">
                          {deptFilter ? 'Try selecting a different department.' : 'Add your first subject to get started.'}
                        </p>
                      </td>
                    </tr>
                  ) : (
                    subjects.map(sub => (
                      <tr key={sub.id} className="hover:bg-surface-container-low/50 transition-colors">
                        <td className="px-4 md:px-6 py-4 md:py-5">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-surface-container-high flex items-center justify-center">
                              <span className="material-symbols-outlined text-primary text-lg">book</span>
                            </div>
                            <span className="font-semibold text-on-surface text-sm">{sub.name}</span>
                          </div>
                        </td>
                        <td className="px-4 md:px-6 py-4 md:py-5">
                          <span className="inline-flex items-center px-2.5 py-1 rounded-md bg-surface-container-high text-on-surface-variant text-xs font-mono font-bold">
                            {sub.code}
                          </span>
                        </td>
                        <td className="px-4 md:px-6 py-4 md:py-5 text-sm text-on-surface-variant hidden md:table-cell">
                          {sub.department_name}
                        </td>
                        <td className="px-4 md:px-6 py-4 md:py-5">
                          {sub.is_active ? (
                            <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-tertiary/10 text-tertiary text-[10px] font-bold uppercase tracking-tighter">
                              Active
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-error/10 text-error text-[10px] font-bold uppercase tracking-tighter">
                              Inactive
                            </span>
                          )}
                        </td>
                        <td className="px-4 md:px-6 py-4 md:py-5">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              type="button"
                              onClick={() => handleToggleActive(sub)}
                              disabled={togglingSubjectId === sub.id}
                              className="p-2 text-on-surface-variant hover:text-primary transition-colors disabled:opacity-40"
                              title={sub.is_active ? 'Deactivate' : 'Activate'}
                            >
                              <span className="material-symbols-outlined text-lg">
                                {sub.is_active ? 'toggle_on' : 'toggle_off'}
                              </span>
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteSubject(sub.id)}
                              disabled={deletingSubjectId === sub.id}
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
        </section>

        {/* ═══ DEPARTMENTS SECTION ═══ */}
        <section>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-5">
            <h3 className="font-headline font-bold text-xl text-on-surface flex items-center gap-2">
              <span className="material-symbols-outlined text-primary">apartment</span>
              Departments
            </h3>
            <button
              type="button"
              onClick={() => setShowDeptForm(prev => !prev)}
              className="bg-primary text-on-primary px-4 py-2.5 rounded-lg font-headline font-bold text-sm flex items-center gap-2 hover:bg-primary/90 transition-colors"
            >
              <span className="material-symbols-outlined text-sm">{showDeptForm ? 'close' : 'add'}</span>
              {showDeptForm ? 'Cancel' : 'Add Department'}
            </button>
          </div>

          {/* Department create form */}
          {showDeptForm && (
            <div className="bg-surface-container-lowest rounded-2xl p-5 sm:p-6 shadow-sm mb-5">
              <form onSubmit={handleCreateDept} className="flex flex-col sm:flex-row gap-4 items-end">
                <div className="flex-1">
                  <label className={LABEL_CLASS}>Name *</label>
                  <input
                    className={INPUT_CLASS}
                    required
                    value={deptForm.name}
                    onChange={e => setDeptForm(f => ({ ...f, name: e.target.value }))}
                    placeholder="e.g. Science"
                  />
                </div>
                <div className="flex-1">
                  <label className={LABEL_CLASS}>Code *</label>
                  <input
                    className={INPUT_CLASS}
                    required
                    value={deptForm.code}
                    onChange={e => setDeptForm(f => ({ ...f, code: e.target.value }))}
                    placeholder="e.g. SCI"
                  />
                </div>
                <button
                  type="submit"
                  disabled={submittingDept}
                  className="bg-primary text-on-primary font-headline font-bold py-3 px-6 rounded-xl hover:bg-primary/90 disabled:opacity-60 text-sm whitespace-nowrap"
                >
                  {submittingDept ? (
                    <span className="flex items-center gap-2">
                      <span className="w-4 h-4 border-2 border-on-primary/30 border-t-on-primary rounded-full animate-spin" />
                      Adding...
                    </span>
                  ) : 'Add Department'}
                </button>
              </form>
            </div>
          )}

          {/* Departments table */}
          <div className="bg-surface-container-lowest rounded-xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-left min-w-[500px]">
                <thead>
                  <tr className="bg-surface-container-low text-on-surface-variant">
                    <th className="px-4 md:px-6 py-4 font-bold text-[10px] uppercase tracking-widest">Department</th>
                    <th className="px-4 md:px-6 py-4 font-bold text-[10px] uppercase tracking-widest">Code</th>
                    <th className="px-4 md:px-6 py-4 font-bold text-[10px] uppercase tracking-widest">Status</th>
                    <th className="px-4 md:px-6 py-4 font-bold text-[10px] uppercase tracking-widest text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-surface-container-low">
                  {loadingDepts ? (
                    Array.from({ length: 3 }).map((_, i) => <SkeletonTableRow key={i} cols={4} />)
                  ) : departments.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="px-6 py-12 text-center">
                        <span className="material-symbols-outlined text-4xl text-on-surface-variant mb-3 block">apartment</span>
                        <p className="text-on-surface-variant font-medium">No departments found.</p>
                        <p className="text-sm text-on-surface-variant mt-1">Create your first department to organize subjects.</p>
                      </td>
                    </tr>
                  ) : (
                    departments.map(dept => (
                      <tr key={dept.id} className="hover:bg-surface-container-low/50 transition-colors">
                        <td className="px-4 md:px-6 py-4 md:py-5">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-surface-container-high flex items-center justify-center">
                              <span className="material-symbols-outlined text-primary text-lg">domain</span>
                            </div>
                            <div>
                              <span className="font-semibold text-on-surface text-sm block">{dept.name}</span>
                              {dept.description && (
                                <span className="text-xs text-on-surface-variant line-clamp-1">{dept.description}</span>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-4 md:px-6 py-4 md:py-5">
                          <span className="inline-flex items-center px-2.5 py-1 rounded-md bg-surface-container-high text-on-surface-variant text-xs font-mono font-bold">
                            {dept.code}
                          </span>
                        </td>
                        <td className="px-4 md:px-6 py-4 md:py-5">
                          {dept.is_active ? (
                            <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-tertiary/10 text-tertiary text-[10px] font-bold uppercase tracking-tighter">
                              Active
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-error/10 text-error text-[10px] font-bold uppercase tracking-tighter">
                              Inactive
                            </span>
                          )}
                        </td>
                        <td className="px-4 md:px-6 py-4 md:py-5 text-right">
                          <button
                            type="button"
                            onClick={() => handleDeleteDept(dept.id)}
                            disabled={deletingDeptId === dept.id}
                            className="p-2 text-on-surface-variant hover:text-error transition-colors disabled:opacity-40"
                            title="Delete department"
                          >
                            <span className="material-symbols-outlined text-lg">delete</span>
                          </button>
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
