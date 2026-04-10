import { useState, useEffect, useCallback } from 'react'
import PageLayout from '@/components/layout/PageLayout'
import {
  adminService,
  type Grade,
  type Section,
  type AcademicYear,
} from '@/services/admin/adminService'
import { SkeletonTableRow } from '@/components/shared/Skeleton'

const INPUT_CLASS = 'w-full px-4 py-3 bg-surface-container-low border-none rounded-lg focus:ring-2 focus:ring-primary text-sm'
const LABEL_CLASS = 'block text-xs font-bold uppercase tracking-wider text-on-surface-variant mb-2'

export default function ClassesPage() {
  // ── Grades state ──────────────────────────────────────────────────────
  const [grades, setGrades] = useState<Grade[]>([])
  const [loadingGrades, setLoadingGrades] = useState(true)
  const [showGradeForm, setShowGradeForm] = useState(false)
  const [gradeForm, setGradeForm] = useState({ level: '', label: '' })
  const [submittingGrade, setSubmittingGrade] = useState(false)
  const [deletingGradeId, setDeletingGradeId] = useState<number | null>(null)

  // ── Sections state ────────────────────────────────────────────────────
  const [sections, setSections] = useState<Section[]>([])
  const [loadingSections, setLoadingSections] = useState(true)
  const [showSectionForm, setShowSectionForm] = useState(false)
  const [sectionForm, setSectionForm] = useState({ name: '', capacity: '', grade: '', academic_year: '' })
  const [submittingSection, setSubmittingSection] = useState(false)
  const [deletingSectionId, setDeletingSectionId] = useState<number | null>(null)
  const [gradeFilter, setGradeFilter] = useState('')

  // ── Shared ────────────────────────────────────────────────────────────
  const [academicYears, setAcademicYears] = useState<AcademicYear[]>([])
  const [error, setError] = useState<string | null>(null)

  // ── Fetch helpers ─────────────────────────────────────────────────────
  const fetchGrades = useCallback(async () => {
    setLoadingGrades(true)
    try {
      const data = await adminService.getGrades()
      setGrades(data)
    } catch {
      setError('Failed to load grades.')
    } finally {
      setLoadingGrades(false)
    }
  }, [])

  const fetchSections = useCallback(async () => {
    setLoadingSections(true)
    try {
      const params: Record<string, string> = {}
      if (gradeFilter) params.grade = gradeFilter
      const data = await adminService.getSections(params)
      setSections(data)
    } catch {
      setError('Failed to load sections.')
    } finally {
      setLoadingSections(false)
    }
  }, [gradeFilter])

  useEffect(() => {
    fetchGrades()
    adminService.getAcademicYears().then(setAcademicYears).catch(() => {})
  }, [fetchGrades])

  useEffect(() => {
    fetchSections()
  }, [fetchSections])

  // ── Grade handlers ────────────────────────────────────────────────────
  async function handleCreateGrade(e: React.FormEvent) {
    e.preventDefault()
    setSubmittingGrade(true)
    setError(null)
    try {
      await adminService.createGrade({ level: Number(gradeForm.level), label: gradeForm.label })
      setGradeForm({ level: '', label: '' })
      setShowGradeForm(false)
      await fetchGrades()
    } catch (err: any) {
      setError(err?.response?.data?.detail || err?.response?.data?.error || 'Failed to create grade.')
    } finally {
      setSubmittingGrade(false)
    }
  }

  async function handleDeleteGrade(id: number) {
    if (!window.confirm('Delete this grade? All associated sections will also be removed.')) return
    setDeletingGradeId(id)
    setError(null)
    try {
      await adminService.deleteGrade(id)
      await Promise.all([fetchGrades(), fetchSections()])
    } catch (err: any) {
      setError(err?.response?.data?.detail || 'Failed to delete grade.')
    } finally {
      setDeletingGradeId(null)
    }
  }

  // ── Section handlers ──────────────────────────────────────────────────
  async function handleCreateSection(e: React.FormEvent) {
    e.preventDefault()
    setSubmittingSection(true)
    setError(null)
    try {
      await adminService.createSection({
        name: sectionForm.name,
        capacity: Number(sectionForm.capacity),
        grade: Number(sectionForm.grade),
        academic_year: Number(sectionForm.academic_year),
      })
      setSectionForm({ name: '', capacity: '', grade: '', academic_year: '' })
      setShowSectionForm(false)
      await fetchSections()
    } catch (err: any) {
      setError(err?.response?.data?.detail || err?.response?.data?.error || 'Failed to create section.')
    } finally {
      setSubmittingSection(false)
    }
  }

  async function handleDeleteSection(id: number) {
    if (!window.confirm('Delete this section?')) return
    setDeletingSectionId(id)
    setError(null)
    try {
      await adminService.deleteSection(id)
      await fetchSections()
    } catch (err: any) {
      setError(err?.response?.data?.detail || 'Failed to delete section.')
    } finally {
      setDeletingSectionId(null)
    }
  }

  // ── Helpers ───────────────────────────────────────────────────────────
  function getAcademicYearLabel(id: number) {
    return academicYears.find(ay => ay.id === id)?.label ?? '--'
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
            Classes & Sections
          </h2>
          <p className="text-on-surface-variant mt-2 text-sm">
            Configure grade levels and their sections for the institution.
          </p>
        </section>

        {/* Error */}
        {error && (
          <div className="mb-6 flex items-center gap-2 rounded-lg bg-error-container/40 border border-error/20 px-4 py-3">
            <span className="material-symbols-outlined text-error text-lg">error</span>
            <span className="text-sm text-on-error-container">{error}</span>
          </div>
        )}

        {/* ═══ GRADES SECTION ═══ */}
        <section className="mb-10 md:mb-14">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-5">
            <h3 className="font-headline font-bold text-xl text-on-surface flex items-center gap-2">
              <span className="material-symbols-outlined text-primary">school</span>
              Grades
            </h3>
            <button
              type="button"
              onClick={() => setShowGradeForm(prev => !prev)}
              className="bg-primary text-on-primary px-4 py-2.5 rounded-lg font-headline font-bold text-sm flex items-center gap-2 hover:bg-primary/90 transition-colors"
            >
              <span className="material-symbols-outlined text-sm">{showGradeForm ? 'close' : 'add'}</span>
              {showGradeForm ? 'Cancel' : 'Add Grade'}
            </button>
          </div>

          {/* Grade create form */}
          {showGradeForm && (
            <div className="bg-surface-container-lowest rounded-2xl p-5 sm:p-6 shadow-sm mb-5">
              <form onSubmit={handleCreateGrade} className="flex flex-col sm:flex-row gap-4 items-end">
                <div className="flex-1">
                  <label className={LABEL_CLASS}>Level *</label>
                  <input
                    className={INPUT_CLASS}
                    type="number"
                    required
                    min={1}
                    value={gradeForm.level}
                    onChange={e => setGradeForm(f => ({ ...f, level: e.target.value }))}
                    placeholder="e.g. 1"
                  />
                </div>
                <div className="flex-1">
                  <label className={LABEL_CLASS}>Label *</label>
                  <input
                    className={INPUT_CLASS}
                    required
                    value={gradeForm.label}
                    onChange={e => setGradeForm(f => ({ ...f, label: e.target.value }))}
                    placeholder="e.g. Grade 1"
                  />
                </div>
                <button
                  type="submit"
                  disabled={submittingGrade}
                  className="bg-primary text-on-primary font-headline font-bold py-3 px-6 rounded-xl hover:bg-primary/90 disabled:opacity-60 text-sm whitespace-nowrap"
                >
                  {submittingGrade ? (
                    <span className="flex items-center gap-2">
                      <span className="w-4 h-4 border-2 border-on-primary/30 border-t-on-primary rounded-full animate-spin" />
                      Adding...
                    </span>
                  ) : 'Add Grade'}
                </button>
              </form>
            </div>
          )}

          {/* Grades table */}
          <div className="bg-surface-container-lowest rounded-xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-left min-w-[400px]">
                <thead>
                  <tr className="bg-surface-container-low text-on-surface-variant">
                    <th className="px-4 md:px-6 py-4 font-bold text-[10px] uppercase tracking-widest">Level</th>
                    <th className="px-4 md:px-6 py-4 font-bold text-[10px] uppercase tracking-widest">Label</th>
                    <th className="px-4 md:px-6 py-4 font-bold text-[10px] uppercase tracking-widest hidden md:table-cell">Created</th>
                    <th className="px-4 md:px-6 py-4 font-bold text-[10px] uppercase tracking-widest text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-surface-container-low">
                  {loadingGrades ? (
                    Array.from({ length: 3 }).map((_, i) => <SkeletonTableRow key={i} cols={4} />)
                  ) : grades.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="px-6 py-12 text-center">
                        <span className="material-symbols-outlined text-4xl text-on-surface-variant mb-3 block">school</span>
                        <p className="text-on-surface-variant font-medium">No grades found.</p>
                        <p className="text-sm text-on-surface-variant mt-1">Add your first grade level to get started.</p>
                      </td>
                    </tr>
                  ) : (
                    grades.map(g => (
                      <tr key={g.id} className="hover:bg-surface-container-low/50 transition-colors">
                        <td className="px-4 md:px-6 py-4 md:py-5">
                          <span className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-primary/10 text-primary font-bold text-sm">
                            {g.level}
                          </span>
                        </td>
                        <td className="px-4 md:px-6 py-4 md:py-5 font-semibold text-on-surface text-sm">{g.label}</td>
                        <td className="px-4 md:px-6 py-4 md:py-5 text-sm text-on-surface-variant hidden md:table-cell">
                          {g.created_at ? new Date(g.created_at).toLocaleDateString() : '--'}
                        </td>
                        <td className="px-4 md:px-6 py-4 md:py-5 text-right">
                          <button
                            type="button"
                            onClick={() => handleDeleteGrade(g.id)}
                            disabled={deletingGradeId === g.id}
                            className="p-2 text-on-surface-variant hover:text-error transition-colors disabled:opacity-40"
                            title="Delete grade"
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

        {/* ═══ SECTIONS SECTION ═══ */}
        <section>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-5">
            <h3 className="font-headline font-bold text-xl text-on-surface flex items-center gap-2">
              <span className="material-symbols-outlined text-primary">view_column</span>
              Sections
            </h3>
            <button
              type="button"
              onClick={() => setShowSectionForm(prev => !prev)}
              className="bg-primary text-on-primary px-4 py-2.5 rounded-lg font-headline font-bold text-sm flex items-center gap-2 hover:bg-primary/90 transition-colors"
            >
              <span className="material-symbols-outlined text-sm">{showSectionForm ? 'close' : 'add'}</span>
              {showSectionForm ? 'Cancel' : 'Add Section'}
            </button>
          </div>

          {/* Section create form */}
          {showSectionForm && (
            <div className="bg-surface-container-lowest rounded-2xl p-5 sm:p-6 shadow-sm mb-5">
              <form onSubmit={handleCreateSection} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className={LABEL_CLASS}>Grade *</label>
                    <select
                      className={INPUT_CLASS}
                      required
                      value={sectionForm.grade}
                      onChange={e => setSectionForm(f => ({ ...f, grade: e.target.value }))}
                    >
                      <option value="">Select grade</option>
                      {grades.map(g => <option key={g.id} value={g.id}>{g.label}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className={LABEL_CLASS}>Academic Year *</label>
                    <select
                      className={INPUT_CLASS}
                      required
                      value={sectionForm.academic_year}
                      onChange={e => setSectionForm(f => ({ ...f, academic_year: e.target.value }))}
                    >
                      <option value="">Select year</option>
                      {academicYears.map(ay => <option key={ay.id} value={ay.id}>{ay.label}</option>)}
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className={LABEL_CLASS}>Section Name *</label>
                    <input
                      className={INPUT_CLASS}
                      required
                      value={sectionForm.name}
                      onChange={e => setSectionForm(f => ({ ...f, name: e.target.value }))}
                      placeholder="e.g. A"
                    />
                  </div>
                  <div>
                    <label className={LABEL_CLASS}>Capacity *</label>
                    <input
                      className={INPUT_CLASS}
                      type="number"
                      required
                      min={1}
                      value={sectionForm.capacity}
                      onChange={e => setSectionForm(f => ({ ...f, capacity: e.target.value }))}
                      placeholder="e.g. 40"
                    />
                  </div>
                </div>
                <button
                  type="submit"
                  disabled={submittingSection}
                  className="w-full sm:w-auto bg-primary text-on-primary font-headline font-bold py-3 px-8 rounded-xl hover:bg-primary/90 disabled:opacity-60 text-sm"
                >
                  {submittingSection ? (
                    <span className="flex items-center justify-center gap-2">
                      <span className="w-4 h-4 border-2 border-on-primary/30 border-t-on-primary rounded-full animate-spin" />
                      Adding...
                    </span>
                  ) : 'Add Section'}
                </button>
              </form>
            </div>
          )}

          {/* Filter */}
          <div className="bg-surface-container-lowest/80 backdrop-blur-xl p-3 md:p-4 rounded-xl mb-5 flex items-center gap-3">
            <span className="material-symbols-outlined text-on-surface-variant">filter_list</span>
            <select
              className="bg-surface-container-low border-none rounded-lg py-3 px-4 text-xs font-semibold uppercase tracking-wider text-on-surface-variant focus:ring-primary cursor-pointer"
              value={gradeFilter}
              onChange={e => setGradeFilter(e.target.value)}
            >
              <option value="">Grade: All</option>
              {grades.map(g => <option key={g.id} value={g.id}>{g.label}</option>)}
            </select>
          </div>

          {/* Sections table */}
          <div className="bg-surface-container-lowest rounded-xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-left min-w-[600px]">
                <thead>
                  <tr className="bg-surface-container-low text-on-surface-variant">
                    <th className="px-4 md:px-6 py-4 font-bold text-[10px] uppercase tracking-widest">Section</th>
                    <th className="px-4 md:px-6 py-4 font-bold text-[10px] uppercase tracking-widest">Grade</th>
                    <th className="px-4 md:px-6 py-4 font-bold text-[10px] uppercase tracking-widest">Capacity</th>
                    <th className="px-4 md:px-6 py-4 font-bold text-[10px] uppercase tracking-widest hidden md:table-cell">Academic Year</th>
                    <th className="px-4 md:px-6 py-4 font-bold text-[10px] uppercase tracking-widest text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-surface-container-low">
                  {loadingSections ? (
                    Array.from({ length: 4 }).map((_, i) => <SkeletonTableRow key={i} cols={5} />)
                  ) : sections.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-12 text-center">
                        <span className="material-symbols-outlined text-4xl text-on-surface-variant mb-3 block">view_column</span>
                        <p className="text-on-surface-variant font-medium">No sections found.</p>
                        <p className="text-sm text-on-surface-variant mt-1">
                          {gradeFilter ? 'Try selecting a different grade.' : 'Add sections to your grades.'}
                        </p>
                      </td>
                    </tr>
                  ) : (
                    sections.map(sec => (
                      <tr key={sec.id} className="hover:bg-surface-container-low/50 transition-colors">
                        <td className="px-4 md:px-6 py-4 md:py-5">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-surface-container-high flex items-center justify-center font-bold text-primary text-sm">
                              {sec.name}
                            </div>
                            <span className="font-semibold text-on-surface text-sm">{sec.display_name}</span>
                          </div>
                        </td>
                        <td className="px-4 md:px-6 py-4 md:py-5 text-sm text-on-surface">{sec.grade_label}</td>
                        <td className="px-4 md:px-6 py-4 md:py-5">
                          <span className="inline-flex items-center gap-1 text-sm text-on-surface-variant">
                            <span className="material-symbols-outlined text-sm">group</span>
                            {sec.capacity}
                          </span>
                        </td>
                        <td className="px-4 md:px-6 py-4 md:py-5 text-sm text-on-surface-variant hidden md:table-cell">
                          {getAcademicYearLabel(sec.academic_year)}
                        </td>
                        <td className="px-4 md:px-6 py-4 md:py-5 text-right">
                          <button
                            type="button"
                            onClick={() => handleDeleteSection(sec.id)}
                            disabled={deletingSectionId === sec.id}
                            className="p-2 text-on-surface-variant hover:text-error transition-colors disabled:opacity-40"
                            title="Delete section"
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
