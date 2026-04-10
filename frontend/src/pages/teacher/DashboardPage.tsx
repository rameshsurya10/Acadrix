import { useState, useEffect, useCallback } from 'react'
import PageLayout from '@/components/layout/PageLayout'
import { Bone, SkeletonMetricCard } from '@/components/shared/Skeleton'
import {
  teacherService,
  type TeacherDashboardData,
  type AssignmentItem,
  type HealthObservation,
} from '@/services/teacher/teacherService'

interface CourseOption {
  id: number
  subject_name: string
  section_display: string
}

interface StudentOption {
  id: number
  full_name: string
  student_id: string
}

export default function TeacherDashboardPage() {
  /* ── State ──────────────────────────────────────────────────────── */
  const [dashboard, setDashboard] = useState<TeacherDashboardData | null>(null)
  const [assignments, setAssignments] = useState<AssignmentItem[]>([])
  const [observations, setObservations] = useState<HealthObservation[]>([])
  const [courses, setCourses] = useState<CourseOption[]>([])
  const [students, setStudents] = useState<StudentOption[]>([])

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Assignment form
  const [showAssignForm, setShowAssignForm] = useState(false)
  const [assignForm, setAssignForm] = useState({ title: '', course: '', due_date: '', status: 'active' })
  const [assignSaving, setAssignSaving] = useState(false)

  // Health form
  const [healthForm, setHealthForm] = useState({ student: '', observation: '' })
  const [healthSaving, setHealthSaving] = useState(false)

  /* ── Data loading ───────────────────────────────────────────────── */
  const loadData = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const [dash, assignRes, obsRes, courseList, studentList] = await Promise.all([
        teacherService.getDashboard(),
        teacherService.getAssignments({ ordering: '-created_at', page_size: '5' }),
        teacherService.getHealthObservations({ ordering: '-created_at', page_size: '5' }),
        teacherService.getCourses(),
        teacherService.getStudentProfiles(),
      ])
      setDashboard(dash)
      setAssignments(assignRes.results.slice(0, 5))
      setObservations(obsRes.results.slice(0, 5))
      setCourses(courseList)
      setStudents(studentList)
    } catch (err) {
      console.error('Dashboard load failed:', err)
      setError('Failed to load dashboard data. Please try again.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { loadData() }, [loadData])

  /* ── Handlers ───────────────────────────────────────────────────── */
  async function handleCreateAssignment(e: React.FormEvent) {
    e.preventDefault()
    if (!assignForm.title.trim() || !assignForm.course) return
    try {
      setAssignSaving(true)
      const created = await teacherService.createAssignment({
        title: assignForm.title,
        course: Number(assignForm.course),
        due_date: assignForm.due_date || undefined,
        status: assignForm.status,
      })
      setAssignments(prev => [created, ...prev].slice(0, 5))
      setDashboard(prev => prev ? {
        ...prev,
        assignments: { ...prev.assignments, total: prev.assignments.total + 1, active: prev.assignments.active + (assignForm.status === 'active' ? 1 : 0) },
      } : prev)
      setAssignForm({ title: '', course: '', due_date: '', status: 'active' })
      setShowAssignForm(false)
    } catch (err) {
      console.error('Create assignment failed:', err)
    } finally {
      setAssignSaving(false)
    }
  }

  async function handleLogObservation(e: React.FormEvent) {
    e.preventDefault()
    if (!healthForm.student || !healthForm.observation.trim()) return
    try {
      setHealthSaving(true)
      const created = await teacherService.createHealthObservation({
        student: Number(healthForm.student),
        observation: healthForm.observation,
      })
      setObservations(prev => [created, ...prev].slice(0, 5))
      setDashboard(prev => prev ? {
        ...prev,
        health: { ...prev.health, total_observations: prev.health.total_observations + 1 },
      } : prev)
      setHealthForm({ student: '', observation: '' })
    } catch (err) {
      console.error('Log observation failed:', err)
    } finally {
      setHealthSaving(false)
    }
  }

  /* ── Helpers ────────────────────────────────────────────────────── */
  function statusBadge(status: string) {
    const map: Record<string, string> = {
      active: 'bg-tertiary/10 text-tertiary',
      draft: 'bg-surface-container-highest text-outline',
      completed: 'bg-primary/10 text-primary',
      overdue: 'bg-error/10 text-error',
    }
    return map[status] ?? 'bg-surface-container-high text-on-surface-variant'
  }

  function formatDate(dateStr: string | null) {
    if (!dateStr) return '--'
    return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  }

  function timeSince(dateStr: string) {
    const diff = Date.now() - new Date(dateStr).getTime()
    const hours = Math.floor(diff / 3600000)
    if (hours < 1) return 'Just now'
    if (hours < 24) return `${hours}h ago`
    const days = Math.floor(hours / 24)
    return `${days}d ago`
  }

  /* ── Render ─────────────────────────────────────────────────────── */
  return (
    <PageLayout>
      <main className="max-w-7xl mx-auto px-4 md:px-6 py-10 pb-32">
        {/* Header */}
        <div className="mb-10">
          <span className="font-label text-xs font-semibold tracking-widest text-on-surface-variant uppercase mb-2 block">Faculty Portal</span>
          <h2 className="font-headline font-extrabold text-3xl md:text-4xl text-on-surface tracking-tight">Teacher Dashboard</h2>
          <p className="text-on-surface-variant max-w-2xl mt-1">Manage assignments, track student wellness, and record academic growth in a streamlined workspace.</p>
        </div>

        {/* Error state */}
        {error && (
          <div className="mb-8 p-4 bg-error/10 rounded-xl flex items-center gap-3">
            <span className="material-symbols-outlined text-error">error</span>
            <p className="text-error text-sm font-medium flex-1">{error}</p>
            <button onClick={loadData} className="text-sm font-bold text-error underline">Retry</button>
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
          {loading ? (
            Array.from({ length: 4 }).map((_, i) => <SkeletonMetricCard key={i} />)
          ) : dashboard && (
            <>
              <div className="bg-surface-container-lowest p-6 rounded-xl">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <span className="material-symbols-outlined text-primary">assignment</span>
                  </div>
                  <span className="font-label text-xs font-bold uppercase tracking-wider text-on-surface-variant">Assignments</span>
                </div>
                <p className="font-headline font-extrabold text-3xl text-on-surface">{dashboard.assignments.total}</p>
                <p className="text-xs text-on-surface-variant mt-1">{dashboard.assignments.active} active</p>
              </div>

              <div className="bg-surface-container-lowest p-6 rounded-xl">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-lg bg-tertiary/10 flex items-center justify-center">
                    <span className="material-symbols-outlined text-tertiary">quiz</span>
                  </div>
                  <span className="font-label text-xs font-bold uppercase tracking-wider text-on-surface-variant">Assessments</span>
                </div>
                <p className="font-headline font-extrabold text-3xl text-on-surface">{dashboard.assessments.total}</p>
                <div className="flex flex-wrap gap-2 mt-1">
                  {Object.entries(dashboard.assessments.by_status).map(([s, n]) => (
                    <span key={s} className="text-[10px] font-bold text-on-surface-variant capitalize">{s}: {n}</span>
                  ))}
                </div>
              </div>

              <div className="bg-surface-container-lowest p-6 rounded-xl">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-lg bg-secondary-container flex items-center justify-center">
                    <span className="material-symbols-outlined text-on-secondary-container">grading</span>
                  </div>
                  <span className="font-label text-xs font-bold uppercase tracking-wider text-on-surface-variant">Graded</span>
                </div>
                <p className="font-headline font-extrabold text-3xl text-on-surface">{dashboard.grading.total_students_graded}</p>
                <p className="text-xs text-on-surface-variant mt-1">
                  Avg score: {dashboard.grading.average_score != null ? `${Number(dashboard.grading.average_score).toFixed(1)}%` : '--'}
                </p>
              </div>

              <div className="bg-surface-container-lowest p-6 rounded-xl">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-lg bg-error/10 flex items-center justify-center">
                    <span className="material-symbols-outlined text-error">health_and_safety</span>
                  </div>
                  <span className="font-label text-xs font-bold uppercase tracking-wider text-on-surface-variant">Health Logs</span>
                </div>
                <p className="font-headline font-extrabold text-3xl text-on-surface">{dashboard.health.total_observations}</p>
                <p className="text-xs text-on-surface-variant mt-1">{dashboard.health.students_observed} students observed</p>
              </div>
            </>
          )}
        </div>

        {/* Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
          {/* Recent Assignments (2/3 width) */}
          <section className="md:col-span-8 space-y-6">
            <div className="bg-surface-container-lowest p-8 rounded-xl">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-bold tracking-tight">Recent Assignments</h3>
                <button
                  onClick={() => setShowAssignForm(v => !v)}
                  className="flex items-center gap-2 bg-primary text-on-primary px-4 py-2 rounded-lg font-semibold text-sm hover:opacity-90 transition-opacity"
                >
                  <span className="material-symbols-outlined text-sm">{showAssignForm ? 'close' : 'add'}</span>
                  {showAssignForm ? 'Cancel' : 'Create Assignment'}
                </button>
              </div>

              {/* Inline Create Form */}
              {showAssignForm && (
                <form onSubmit={handleCreateAssignment} className="bg-surface-container-low p-5 rounded-lg mb-6 space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-xs font-bold uppercase text-on-surface-variant">Title</label>
                      <input
                        type="text"
                        required
                        value={assignForm.title}
                        onChange={e => setAssignForm(f => ({ ...f, title: e.target.value }))}
                        className="w-full bg-surface-container-lowest border-none rounded-lg px-4 py-3 text-on-surface focus:ring-2 focus:ring-primary/20 outline-none"
                        placeholder="Assignment title..."
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-bold uppercase text-on-surface-variant">Course</label>
                      <select
                        required
                        value={assignForm.course}
                        onChange={e => setAssignForm(f => ({ ...f, course: e.target.value }))}
                        className="w-full bg-surface-container-lowest border-none rounded-lg px-4 py-3 focus:ring-2 focus:ring-primary/20"
                      >
                        <option value="">Select course...</option>
                        {courses.map(c => (
                          <option key={c.id} value={c.id}>{c.subject_name} - {c.section_display}</option>
                        ))}
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-bold uppercase text-on-surface-variant">Due Date</label>
                      <input
                        type="date"
                        value={assignForm.due_date}
                        onChange={e => setAssignForm(f => ({ ...f, due_date: e.target.value }))}
                        className="w-full bg-surface-container-lowest border-none rounded-lg px-4 py-3 focus:ring-2 focus:ring-primary/20"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-bold uppercase text-on-surface-variant">Status</label>
                      <select
                        value={assignForm.status}
                        onChange={e => setAssignForm(f => ({ ...f, status: e.target.value }))}
                        className="w-full bg-surface-container-lowest border-none rounded-lg px-4 py-3 focus:ring-2 focus:ring-primary/20"
                      >
                        <option value="active">Active</option>
                        <option value="draft">Draft</option>
                      </select>
                    </div>
                  </div>
                  <div className="flex justify-end">
                    <button
                      type="submit"
                      disabled={assignSaving}
                      className="bg-primary text-on-primary px-6 py-2.5 rounded-lg font-semibold text-sm hover:opacity-90 transition-opacity disabled:opacity-50"
                    >
                      {assignSaving ? 'Saving...' : 'Publish Assignment'}
                    </button>
                  </div>
                </form>
              )}

              {/* Assignment List */}
              {loading ? (
                <div className="space-y-4">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="flex items-center justify-between p-4 bg-surface rounded-lg">
                      <div className="flex items-center gap-4">
                        <Bone className="w-6 h-6 rounded" />
                        <div className="space-y-2">
                          <Bone className="w-40 h-4 rounded-md" />
                          <Bone className="w-28 h-3 rounded-md" />
                        </div>
                      </div>
                      <Bone className="w-16 h-5 rounded-full" />
                    </div>
                  ))}
                </div>
              ) : assignments.length === 0 ? (
                <div className="text-center py-12">
                  <span className="material-symbols-outlined text-5xl text-on-surface-variant/30 mb-3 block">assignment</span>
                  <p className="text-on-surface-variant font-medium">No assignments yet</p>
                  <p className="text-xs text-on-surface-variant/60 mt-1">Create your first assignment to get started.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {assignments.map(a => (
                    <div key={a.id} className="flex items-center justify-between p-4 bg-surface rounded-lg hover:bg-surface-container-high transition-colors">
                      <div className="flex items-center gap-4">
                        <span className="material-symbols-outlined text-primary">description</span>
                        <div>
                          <p className="font-semibold text-on-surface">{a.title}</p>
                          <p className="text-xs text-on-surface-variant">
                            {a.course_name} &middot; Due: {formatDate(a.due_date)}
                          </p>
                        </div>
                      </div>
                      <span className={`text-xs font-bold px-3 py-1 rounded-full uppercase ${statusBadge(a.status)}`}>
                        {a.status}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>

          {/* Sidebar (1/3 width) */}
          <aside className="md:col-span-4 space-y-8">
            {/* Health Observation Form */}
            <div className="bg-surface-container-lowest p-8 rounded-xl">
              <div className="flex items-center gap-3 mb-6">
                <div className="relative flex items-center justify-center">
                  <span className="absolute inline-flex h-3 w-3 rounded-full bg-error opacity-75 animate-ping" />
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-error" />
                </div>
                <h3 className="text-xl font-bold tracking-tight">Health Observation</h3>
              </div>
              <form onSubmit={handleLogObservation} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold uppercase text-on-surface-variant mb-2">Student Select</label>
                  <select
                    required
                    value={healthForm.student}
                    onChange={e => setHealthForm(f => ({ ...f, student: e.target.value }))}
                    className="w-full bg-surface-container-low border-none rounded-lg px-4 py-3 focus:ring-2 focus:ring-primary/20"
                  >
                    <option value="">Select student...</option>
                    {students.map(s => (
                      <option key={s.id} value={s.id}>{s.full_name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase text-on-surface-variant mb-2">Observation</label>
                  <textarea
                    required
                    value={healthForm.observation}
                    onChange={e => setHealthForm(f => ({ ...f, observation: e.target.value }))}
                    className="w-full bg-surface-container-low border-none rounded-lg px-4 py-3 focus:ring-2 focus:ring-primary/20 h-24 resize-none"
                    placeholder="Record symptoms or energy levels..."
                  />
                </div>
                <button
                  type="submit"
                  disabled={healthSaving}
                  className="w-full py-3 bg-secondary-container text-on-secondary-container font-bold rounded-lg hover:opacity-90 transition-all disabled:opacity-50"
                >
                  {healthSaving ? 'Saving...' : 'Log Observation'}
                </button>
              </form>
            </div>

            {/* Recent Observations */}
            <div className="bg-surface-container-lowest p-8 rounded-xl">
              <h3 className="text-xl font-bold tracking-tight mb-4">Recent Observations</h3>
              {loading ? (
                <div className="space-y-4">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="space-y-2">
                      <Bone className="w-28 h-3 rounded-md" />
                      <Bone className="w-full h-4 rounded-md" />
                    </div>
                  ))}
                </div>
              ) : observations.length === 0 ? (
                <div className="text-center py-6">
                  <span className="material-symbols-outlined text-3xl text-on-surface-variant/30 mb-2 block">monitor_heart</span>
                  <p className="text-sm text-on-surface-variant">No observations logged yet.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {observations.map(o => (
                    <div key={o.id} className="border-l-2 border-primary-container/30 pl-4">
                      <p className="text-xs font-bold text-primary uppercase mb-1">{o.student_name} &middot; {timeSince(o.created_at)}</p>
                      <p className="text-sm text-on-surface leading-relaxed">{o.observation}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </aside>
        </div>
      </main>
    </PageLayout>
  )
}
