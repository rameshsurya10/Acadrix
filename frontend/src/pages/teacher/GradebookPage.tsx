import { useState, useEffect, useCallback } from 'react'
import PageLayout from '@/components/layout/PageLayout'
import { Bone, SkeletonTableRow } from '@/components/shared/Skeleton'
import {
  teacherService,
  type AssessmentItem,
  type GradeEntry,
} from '@/services/teacher/teacherService'

interface StudentOption {
  id: number
  full_name: string
  student_id: string
}

export default function GradebookPage() {
  /* ── State ──────────────────────────────────────────────────────── */
  const [assessments, setAssessments] = useState<AssessmentItem[]>([])
  const [grades, setGrades] = useState<GradeEntry[]>([])
  const [students, setStudents] = useState<StudentOption[]>([])
  const [selectedAssessment, setSelectedAssessment] = useState<string>('')
  const [searchQuery, setSearchQuery] = useState('')

  const [loading, setLoading] = useState(true)
  const [gradesLoading, setGradesLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Inline edit
  const [editingId, setEditingId] = useState<number | null>(null)
  const [editForm, setEditForm] = useState({ marks_obtained: '', letter_grade: '', remarks: '' })
  const [editSaving, setEditSaving] = useState(false)

  // Add grade form
  const [showAddForm, setShowAddForm] = useState(false)
  const [addForm, setAddForm] = useState({ student: '', marks_obtained: '', letter_grade: '', remarks: '' })
  const [addSaving, setAddSaving] = useState(false)

  /* ── Load assessments + students on mount ────────────────────────── */
  const loadInitial = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const [aRes, sList] = await Promise.all([
        teacherService.getAssessments(),
        teacherService.getStudentProfiles(),
      ])
      setAssessments(aRes.results)
      setStudents(sList)
    } catch (err) {
      console.error('Gradebook load failed:', err)
      setError('Failed to load gradebook data. Please try again.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { loadInitial() }, [loadInitial])

  /* ── Load grades when assessment changes ─────────────────────────── */
  const loadGrades = useCallback(async (assessmentId: string) => {
    if (!assessmentId) {
      setGrades([])
      return
    }
    try {
      setGradesLoading(true)
      const res = await teacherService.getGradeEntries({ assessment: assessmentId })
      setGrades(res.results)
    } catch (err) {
      console.error('Grade entries load failed:', err)
    } finally {
      setGradesLoading(false)
    }
  }, [])

  useEffect(() => { loadGrades(selectedAssessment) }, [selectedAssessment, loadGrades])

  /* ── Filtered grades by search ──────────────────────────────────── */
  const filteredGrades = grades.filter(g =>
    g.student_name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  /* ── Computed stats ─────────────────────────────────────────────── */
  const avgScore = grades.length > 0
    ? (grades.reduce((sum, g) => sum + Number(g.marks_obtained), 0) / grades.length).toFixed(1)
    : null
  const topStudent = grades.length > 0
    ? grades.reduce((top, g) => Number(g.marks_obtained) > Number(top.marks_obtained) ? g : top, grades[0])
    : null

  /* ── Handlers ───────────────────────────────────────────────────── */
  function startEdit(grade: GradeEntry) {
    setEditingId(grade.id)
    setEditForm({
      marks_obtained: grade.marks_obtained,
      letter_grade: grade.letter_grade,
      remarks: grade.remarks,
    })
  }

  function cancelEdit() {
    setEditingId(null)
    setEditForm({ marks_obtained: '', letter_grade: '', remarks: '' })
  }

  async function saveEdit(id: number) {
    try {
      setEditSaving(true)
      const updated = await teacherService.updateGradeEntry(id, {
        marks_obtained: editForm.marks_obtained,
        letter_grade: editForm.letter_grade,
        remarks: editForm.remarks,
      })
      setGrades(prev => prev.map(g => g.id === id ? updated : g))
      setEditingId(null)
    } catch (err) {
      console.error('Update grade failed:', err)
    } finally {
      setEditSaving(false)
    }
  }

  async function handleAddGrade(e: React.FormEvent) {
    e.preventDefault()
    if (!addForm.student || !addForm.marks_obtained || !selectedAssessment) return
    try {
      setAddSaving(true)
      const created = await teacherService.createGradeEntry({
        student: Number(addForm.student),
        assessment: Number(selectedAssessment),
        marks_obtained: addForm.marks_obtained,
        letter_grade: addForm.letter_grade,
        remarks: addForm.remarks,
      })
      setGrades(prev => [...prev, created])
      setAddForm({ student: '', marks_obtained: '', letter_grade: '', remarks: '' })
      setShowAddForm(false)
    } catch (err) {
      console.error('Add grade failed:', err)
    } finally {
      setAddSaving(false)
    }
  }

  /* ── Helpers ────────────────────────────────────────────────────── */
  function getInitials(name: string) {
    return name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
  }

  function marksColor(marks: string, assessment: AssessmentItem | undefined) {
    if (!assessment) return 'text-on-surface'
    const pct = (Number(marks) / assessment.total_marks) * 100
    if (pct >= 90) return 'text-tertiary'
    if (pct >= 70) return 'text-primary'
    if (pct >= 50) return 'text-on-surface'
    return 'text-error'
  }

  function gradeStatusLabel(marks: string, assessment: AssessmentItem | undefined) {
    if (!assessment) return { label: '--', color: 'bg-surface-container-high text-on-surface-variant' }
    const pct = (Number(marks) / assessment.total_marks) * 100
    if (pct >= 90) return { label: 'Excellent', color: 'bg-tertiary/10 text-tertiary' }
    if (pct >= 70) return { label: 'Good', color: 'bg-primary/10 text-primary' }
    if (pct >= 50) return { label: 'Average', color: 'bg-secondary/10 text-secondary' }
    return { label: 'Needs Review', color: 'bg-error/10 text-error' }
  }

  const currentAssessment = assessments.find(a => String(a.id) === selectedAssessment)

  /* ── Render ─────────────────────────────────────────────────────── */
  return (
    <PageLayout>
      <main className="max-w-7xl mx-auto px-4 md:px-6 py-10 pb-32">
        {/* Header */}
        <section className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <span className="font-label text-xs font-semibold tracking-widest text-on-surface-variant uppercase mb-2 block">Classroom Overview</span>
            <h2 className="font-headline font-extrabold text-3xl md:text-4xl text-on-surface tracking-tight">Gradebook</h2>
          </div>
          {/* Quick Stats */}
          {!loading && selectedAssessment && grades.length > 0 && (
            <div className="flex gap-4">
              <div className="bg-surface-container-low p-4 rounded-xl flex items-center gap-4 min-w-[160px]">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <span className="material-symbols-outlined text-primary">analytics</span>
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">Class Avg</p>
                  <p className="text-xl font-headline font-bold text-on-surface">{avgScore}%</p>
                </div>
              </div>
              {topStudent && (
                <div className="bg-surface-container-low p-4 rounded-xl flex items-center gap-4 min-w-[200px]">
                  <div className="w-10 h-10 rounded-lg bg-tertiary/10 flex items-center justify-center">
                    <span className="material-symbols-outlined text-tertiary">workspace_premium</span>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">Top Student</p>
                    <p className="text-xl font-headline font-bold text-on-surface">{topStudent.student_name}</p>
                  </div>
                </div>
              )}
            </div>
          )}
        </section>

        {/* Error */}
        {error && (
          <div className="mb-8 p-4 bg-error/10 rounded-xl flex items-center gap-3">
            <span className="material-symbols-outlined text-error">error</span>
            <p className="text-error text-sm font-medium flex-1">{error}</p>
            <button onClick={loadInitial} className="text-sm font-bold text-error underline">Retry</button>
          </div>
        )}

        {/* Filter Bar */}
        <section className="bg-surface-container-lowest/80 backdrop-blur-xl rounded-2xl p-6 mb-8 shadow-sm flex flex-col lg:flex-row gap-6 items-center">
          <div className="relative w-full lg:w-1/3">
            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant">search</span>
            <input
              className="w-full bg-surface-container-low border-none rounded-xl py-3 pl-12 pr-4 focus:ring-2 focus:ring-primary/20 text-sm"
              placeholder="Search student by name..."
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex flex-wrap items-center gap-4 w-full lg:w-2/3 lg:justify-end">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-on-surface-variant uppercase tracking-tighter">Assessment:</span>
              {loading ? (
                <Bone className="w-40 h-9 rounded-lg" />
              ) : (
                <select
                  value={selectedAssessment}
                  onChange={e => setSelectedAssessment(e.target.value)}
                  className="bg-surface-container-low border-none rounded-lg text-sm font-medium py-2 px-4 focus:ring-primary/20"
                >
                  <option value="">Select assessment...</option>
                  {assessments.map(a => (
                    <option key={a.id} value={a.id}>{a.title} ({a.total_marks} marks)</option>
                  ))}
                </select>
              )}
            </div>
            {selectedAssessment && (
              <button
                onClick={() => setShowAddForm(v => !v)}
                className="bg-primary text-on-primary px-5 py-2 rounded-lg font-semibold text-sm hover:opacity-90 transition-opacity flex items-center gap-2"
              >
                <span className="material-symbols-outlined text-sm">{showAddForm ? 'close' : 'add'}</span>
                {showAddForm ? 'Cancel' : 'Add Grade'}
              </button>
            )}
          </div>
        </section>

        {/* Add Grade Form */}
        {showAddForm && selectedAssessment && (
          <form onSubmit={handleAddGrade} className="bg-surface-container-lowest p-6 rounded-2xl mb-8 shadow-sm">
            <h4 className="font-bold text-on-surface mb-4">New Grade Entry</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-bold uppercase text-on-surface-variant">Student</label>
                <select
                  required
                  value={addForm.student}
                  onChange={e => setAddForm(f => ({ ...f, student: e.target.value }))}
                  className="w-full bg-surface-container-low border-none rounded-lg px-4 py-3 focus:ring-2 focus:ring-primary/20"
                >
                  <option value="">Select student...</option>
                  {students.map(s => (
                    <option key={s.id} value={s.id}>{s.full_name}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold uppercase text-on-surface-variant">Marks</label>
                <input
                  type="number"
                  required
                  min={0}
                  max={currentAssessment?.total_marks ?? 100}
                  value={addForm.marks_obtained}
                  onChange={e => setAddForm(f => ({ ...f, marks_obtained: e.target.value }))}
                  className="w-full bg-surface-container-low border-none rounded-lg px-4 py-3 focus:ring-2 focus:ring-primary/20"
                  placeholder="0"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold uppercase text-on-surface-variant">Letter Grade</label>
                <input
                  type="text"
                  value={addForm.letter_grade}
                  onChange={e => setAddForm(f => ({ ...f, letter_grade: e.target.value }))}
                  className="w-full bg-surface-container-low border-none rounded-lg px-4 py-3 focus:ring-2 focus:ring-primary/20"
                  placeholder="A, B+, etc."
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold uppercase text-on-surface-variant">Remarks</label>
                <input
                  type="text"
                  value={addForm.remarks}
                  onChange={e => setAddForm(f => ({ ...f, remarks: e.target.value }))}
                  className="w-full bg-surface-container-low border-none rounded-lg px-4 py-3 focus:ring-2 focus:ring-primary/20"
                  placeholder="Optional remarks..."
                />
              </div>
            </div>
            <div className="flex justify-end mt-4">
              <button
                type="submit"
                disabled={addSaving}
                className="bg-primary text-on-primary px-6 py-2.5 rounded-lg font-semibold text-sm hover:opacity-90 disabled:opacity-50"
              >
                {addSaving ? 'Saving...' : 'Save Grade'}
              </button>
            </div>
          </form>
        )}

        {/* Prompt to select assessment */}
        {!loading && !selectedAssessment && (
          <div className="text-center py-20 bg-surface-container-lowest rounded-2xl">
            <span className="material-symbols-outlined text-6xl text-on-surface-variant/20 mb-4 block">grading</span>
            <p className="text-lg font-semibold text-on-surface-variant">Select an assessment to view grades</p>
            <p className="text-sm text-on-surface-variant/60 mt-1">Choose from the dropdown above to get started.</p>
          </div>
        )}

        {/* Grade Table */}
        {selectedAssessment && (
          <section className="bg-surface-container-low rounded-2xl overflow-hidden mb-12">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead className="bg-surface-container-low border-b border-outline-variant/10">
                  <tr>
                    <th className="px-8 py-5 text-xs font-bold uppercase tracking-widest text-on-surface-variant">Student</th>
                    <th className="px-6 py-5 text-xs font-bold uppercase tracking-widest text-on-surface-variant text-center">Marks ({currentAssessment?.total_marks ?? '--'})</th>
                    <th className="px-6 py-5 text-xs font-bold uppercase tracking-widest text-on-surface-variant">Grade</th>
                    <th className="px-6 py-5 text-xs font-bold uppercase tracking-widest text-on-surface-variant">Status</th>
                    <th className="px-6 py-5 text-xs font-bold uppercase tracking-widest text-on-surface-variant">Remarks</th>
                    <th className="px-8 py-5 text-xs font-bold uppercase tracking-widest text-on-surface-variant text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant/10">
                  {gradesLoading ? (
                    Array.from({ length: 4 }).map((_, i) => <SkeletonTableRow key={i} cols={6} />)
                  ) : filteredGrades.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-8 py-16 text-center">
                        <span className="material-symbols-outlined text-4xl text-on-surface-variant/20 mb-2 block">person_off</span>
                        <p className="text-on-surface-variant font-medium">
                          {searchQuery ? 'No matching students found' : 'No grades recorded for this assessment'}
                        </p>
                      </td>
                    </tr>
                  ) : (
                    filteredGrades.map((g, idx) => {
                      const isEditing = editingId === g.id
                      const status = gradeStatusLabel(g.marks_obtained, currentAssessment)
                      return (
                        <tr key={g.id} className={`${idx % 2 === 0 ? 'bg-surface-container-lowest' : 'bg-surface'} hover:bg-surface-container transition-colors group`}>
                          {/* Student */}
                          <td className="px-8 py-5">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-full bg-surface-container-high flex items-center justify-center font-bold text-primary">
                                {getInitials(g.student_name)}
                              </div>
                              <p className="font-semibold text-on-surface">{g.student_name}</p>
                            </div>
                          </td>
                          {/* Marks */}
                          <td className="px-6 py-5 text-center">
                            {isEditing ? (
                              <input
                                type="number"
                                min={0}
                                max={currentAssessment?.total_marks ?? 100}
                                value={editForm.marks_obtained}
                                onChange={e => setEditForm(f => ({ ...f, marks_obtained: e.target.value }))}
                                className="w-20 bg-surface-container-low border border-primary/30 rounded-lg px-3 py-1.5 text-center font-bold focus:ring-2 focus:ring-primary/20"
                              />
                            ) : (
                              <button
                                onClick={() => startEdit(g)}
                                className="inline-flex items-center gap-2 px-3 py-1.5 bg-surface-container-low rounded-lg border border-transparent hover:border-primary/30 transition-all cursor-pointer"
                              >
                                <span className={`font-headline font-bold text-lg ${marksColor(g.marks_obtained, currentAssessment)}`}>
                                  {g.marks_obtained}
                                </span>
                                <span className="material-symbols-outlined text-sm opacity-30 group-hover:opacity-100">edit</span>
                              </button>
                            )}
                          </td>
                          {/* Letter Grade */}
                          <td className="px-6 py-5">
                            {isEditing ? (
                              <input
                                type="text"
                                value={editForm.letter_grade}
                                onChange={e => setEditForm(f => ({ ...f, letter_grade: e.target.value }))}
                                className="w-16 bg-surface-container-low border border-primary/30 rounded-lg px-3 py-1.5 text-center font-bold focus:ring-2 focus:ring-primary/20"
                              />
                            ) : (
                              <span className="font-bold text-on-surface">{g.letter_grade || '--'}</span>
                            )}
                          </td>
                          {/* Status */}
                          <td className="px-6 py-5">
                            <span className={`${status.color} text-[10px] font-bold px-2 py-1 rounded uppercase tracking-tighter`}>
                              {status.label}
                            </span>
                          </td>
                          {/* Remarks */}
                          <td className="px-6 py-5">
                            {isEditing ? (
                              <input
                                type="text"
                                value={editForm.remarks}
                                onChange={e => setEditForm(f => ({ ...f, remarks: e.target.value }))}
                                className="w-full bg-surface-container-low border border-primary/30 rounded-lg px-3 py-1.5 text-sm focus:ring-2 focus:ring-primary/20"
                                placeholder="Remarks..."
                              />
                            ) : (
                              <span className="text-sm text-on-surface-variant">{g.remarks || '--'}</span>
                            )}
                          </td>
                          {/* Actions */}
                          <td className="px-8 py-5 text-right">
                            {isEditing ? (
                              <div className="flex items-center justify-end gap-2">
                                <button
                                  onClick={() => saveEdit(g.id)}
                                  disabled={editSaving}
                                  className="text-primary hover:text-primary/80 transition-colors disabled:opacity-50"
                                  aria-label="Save grade"
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
                              <button
                                onClick={() => startEdit(g)}
                                className="text-on-surface-variant hover:text-primary transition-colors"
                                aria-label="Edit grade"
                              >
                                <span className="material-symbols-outlined">edit</span>
                              </button>
                            )}
                          </td>
                        </tr>
                      )
                    })
                  )}
                </tbody>
              </table>
            </div>
            {/* Footer */}
            {filteredGrades.length > 0 && (
              <div className="px-8 py-4 flex justify-between items-center text-xs font-semibold text-on-surface-variant uppercase tracking-widest">
                <span>Showing {filteredGrades.length} of {grades.length} entries</span>
              </div>
            )}
          </section>
        )}
      </main>
    </PageLayout>
  )
}
