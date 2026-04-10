import { useState, useEffect, useCallback } from 'react'
import PageLayout from '@/components/layout/PageLayout'
import {
  adminService,
  type Course,
  type Subject,
  type Section,
  type AcademicYear,
  type FacultyMember,
} from '@/services/admin/adminService'
import { SkeletonTableRow } from '@/components/shared/Skeleton'

interface CourseFormState {
  subject: string
  section: string
  teacher: string
  academic_year: string
  location: string
}

const INITIAL_FORM: CourseFormState = {
  subject: '',
  section: '',
  teacher: '',
  academic_year: '',
  location: '',
}

export default function CoursesPage() {
  const [courses, setCourses] = useState<Course[]>([])
  const [subjects, setSubjects] = useState<Subject[]>([])
  const [sections, setSections] = useState<Section[]>([])
  const [academicYears, setAcademicYears] = useState<AcademicYear[]>([])
  const [faculty, setFaculty] = useState<FacultyMember[]>([])

  const [loading, setLoading] = useState(true)
  const [lookupsLoading, setLookupsLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [deletingId, setDeletingId] = useState<number | null>(null)

  const [yearFilter, setYearFilter] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState<CourseFormState>(INITIAL_FORM)
  const [formError, setFormError] = useState('')
  const [successMsg, setSuccessMsg] = useState('')

  // ── Load lookups ────────────────────────────────────────────────────
  useEffect(() => {
    async function loadLookups() {
      try {
        const [subj, sec, ay, fac] = await Promise.all([
          adminService.getSubjects(),
          adminService.getSections(),
          adminService.getAcademicYears(),
          adminService.getFaculty(),
        ])
        setSubjects(subj)
        setSections(sec)
        setAcademicYears(ay)
        setFaculty(fac)

        // Default filter to the current academic year if one exists
        const current = ay.find(y => y.is_current)
        if (current) setYearFilter(String(current.id))
      } catch (err) {
        console.error('Failed to load lookups:', err)
      } finally {
        setLookupsLoading(false)
      }
    }
    loadLookups()
  }, [])

  // ── Load courses ────────────────────────────────────────────────────
  const fetchCourses = useCallback(async () => {
    setLoading(true)
    try {
      const params: Record<string, string> = {}
      if (yearFilter) params.academic_year = yearFilter
      const data = await adminService.getCourses(params)
      setCourses(data)
    } catch (err) {
      console.error('Failed to load courses:', err)
    } finally {
      setLoading(false)
    }
  }, [yearFilter])

  useEffect(() => {
    fetchCourses()
  }, [fetchCourses])

  // ── Handlers ────────────────────────────────────────────────────────
  function handleFormChange(field: keyof CourseFormState, value: string) {
    setForm(prev => ({ ...prev, [field]: value }))
    setFormError('')
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    setFormError('')
    setSuccessMsg('')

    if (!form.subject || !form.section || !form.academic_year) {
      setFormError('Subject, section, and academic year are required.')
      return
    }

    setSubmitting(true)
    try {
      await adminService.createCourse({
        subject: Number(form.subject),
        section: Number(form.section),
        teacher: form.teacher ? Number(form.teacher) : null,
        academic_year: Number(form.academic_year),
        location: form.location,
      })
      setForm(INITIAL_FORM)
      setShowForm(false)
      setSuccessMsg('Course created successfully.')
      await fetchCourses()
      setTimeout(() => setSuccessMsg(''), 4000)
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'Failed to create course. Please try again.'
      setFormError(message)
    } finally {
      setSubmitting(false)
    }
  }

  async function handleDelete(id: number) {
    if (!window.confirm('Are you sure you want to delete this course assignment?')) return
    setDeletingId(id)
    try {
      await adminService.deleteCourse(id)
      setCourses(prev => prev.filter(c => c.id !== id))
      setSuccessMsg('Course deleted.')
      setTimeout(() => setSuccessMsg(''), 4000)
    } catch (err) {
      console.error('Failed to delete course:', err)
    } finally {
      setDeletingId(null)
    }
  }

  // ── Helpers ─────────────────────────────────────────────────────────
  function getAcademicYearLabel(id: number) {
    return academicYears.find(y => y.id === id)?.label ?? '—'
  }

  return (
    <PageLayout>
      <main className="max-w-7xl mx-auto px-4 md:px-6 py-6 md:py-10 pb-32">
        {/* Header */}
        <section className="mb-8 md:mb-10">
          <span className="font-label text-xs font-semibold tracking-widest text-on-surface-variant uppercase mb-2 block">
            Academic Management
          </span>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 md:gap-6">
            <div>
              <h2 className="font-headline font-extrabold text-3xl md:text-4xl text-on-surface tracking-tight">
                Courses & Assignments
              </h2>
              <p className="text-on-surface-variant mt-2 max-w-xl text-sm md:text-base">
                {loading
                  ? 'Loading courses...'
                  : `${courses.length} course${courses.length !== 1 ? 's' : ''} assigned. Manage subject-teacher-section mappings.`}
              </p>
            </div>
            <button
              onClick={() => setShowForm(prev => !prev)}
              className="bg-primary text-on-primary px-5 md:px-6 py-3 rounded-lg font-headline font-bold text-sm shadow-sm flex items-center gap-2 hover:scale-95 duration-150"
            >
              <span className="material-symbols-outlined text-sm">
                {showForm ? 'close' : 'add'}
              </span>
              {showForm ? 'Cancel' : 'New Course'}
            </button>
          </div>
        </section>

        {/* Success toast */}
        {successMsg && (
          <div className="mb-6 flex items-center gap-3 bg-tertiary/10 text-tertiary px-5 py-3 rounded-lg text-sm font-semibold">
            <span className="material-symbols-outlined text-lg">check_circle</span>
            {successMsg}
          </div>
        )}

        {/* Create Form */}
        {showForm && (
          <section className="bg-surface-container-lowest rounded-xl p-5 md:p-8 mb-8 md:mb-10">
            <h3 className="font-headline font-bold text-lg md:text-xl text-on-surface mb-6 flex items-center gap-2">
              <span className="material-symbols-outlined text-primary">library_add</span>
              Create Course Assignment
            </h3>

            {formError && (
              <div className="mb-4 flex items-center gap-3 bg-error/10 text-error px-4 py-3 rounded-lg text-sm font-semibold">
                <span className="material-symbols-outlined text-lg">error</span>
                {formError}
              </div>
            )}

            <form onSubmit={handleCreate} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
              {/* Subject */}
              <div>
                <label htmlFor="course-subject" className="text-[10px] font-label font-bold uppercase tracking-widest text-on-surface-variant mb-2 block">
                  Subject *
                </label>
                <select
                  id="course-subject"
                  className="w-full px-4 py-3 bg-surface-container-low border-none rounded-lg text-sm focus:ring-2 focus:ring-primary cursor-pointer"
                  value={form.subject}
                  onChange={e => handleFormChange('subject', e.target.value)}
                  disabled={lookupsLoading}
                >
                  <option value="">Select subject</option>
                  {subjects.filter(s => s.is_active).map(s => (
                    <option key={s.id} value={s.id}>{s.name} ({s.code})</option>
                  ))}
                </select>
              </div>

              {/* Section */}
              <div>
                <label htmlFor="course-section" className="text-[10px] font-label font-bold uppercase tracking-widest text-on-surface-variant mb-2 block">
                  Section *
                </label>
                <select
                  id="course-section"
                  className="w-full px-4 py-3 bg-surface-container-low border-none rounded-lg text-sm focus:ring-2 focus:ring-primary cursor-pointer"
                  value={form.section}
                  onChange={e => handleFormChange('section', e.target.value)}
                  disabled={lookupsLoading}
                >
                  <option value="">Select section</option>
                  {sections.map(s => (
                    <option key={s.id} value={s.id}>{s.grade_label} - Section {s.name}</option>
                  ))}
                </select>
              </div>

              {/* Teacher */}
              <div>
                <label htmlFor="course-teacher" className="text-[10px] font-label font-bold uppercase tracking-widest text-on-surface-variant mb-2 block">
                  Teacher
                </label>
                <select
                  id="course-teacher"
                  className="w-full px-4 py-3 bg-surface-container-low border-none rounded-lg text-sm focus:ring-2 focus:ring-primary cursor-pointer"
                  value={form.teacher}
                  onChange={e => handleFormChange('teacher', e.target.value)}
                  disabled={lookupsLoading}
                >
                  <option value="">Unassigned</option>
                  {faculty.map(f => (
                    <option key={f.id} value={f.id}>{f.name} ({f.employee_id})</option>
                  ))}
                </select>
              </div>

              {/* Academic Year */}
              <div>
                <label htmlFor="course-ay" className="text-[10px] font-label font-bold uppercase tracking-widest text-on-surface-variant mb-2 block">
                  Academic Year *
                </label>
                <select
                  id="course-ay"
                  className="w-full px-4 py-3 bg-surface-container-low border-none rounded-lg text-sm focus:ring-2 focus:ring-primary cursor-pointer"
                  value={form.academic_year}
                  onChange={e => handleFormChange('academic_year', e.target.value)}
                  disabled={lookupsLoading}
                >
                  <option value="">Select year</option>
                  {academicYears.map(y => (
                    <option key={y.id} value={y.id}>{y.label}{y.is_current ? ' (Current)' : ''}</option>
                  ))}
                </select>
              </div>

              {/* Location */}
              <div>
                <label htmlFor="course-location" className="text-[10px] font-label font-bold uppercase tracking-widest text-on-surface-variant mb-2 block">
                  Location / Room
                </label>
                <input
                  id="course-location"
                  type="text"
                  className="w-full px-4 py-3 bg-surface-container-low border-none rounded-lg text-sm focus:ring-2 focus:ring-primary"
                  placeholder="e.g. Room 204, Lab B"
                  value={form.location}
                  onChange={e => handleFormChange('location', e.target.value)}
                />
              </div>

              {/* Submit */}
              <div className="flex items-end">
                <button
                  type="submit"
                  disabled={submitting || lookupsLoading}
                  className="w-full bg-primary text-on-primary py-3 px-6 rounded-lg font-headline font-bold text-sm hover:scale-95 duration-150 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {submitting ? (
                    <>
                      <span className="w-4 h-4 border-2 border-on-primary/30 border-t-on-primary rounded-full animate-spin" />
                      Creating...
                    </>
                  ) : (
                    <>
                      <span className="material-symbols-outlined text-sm">check</span>
                      Create Course
                    </>
                  )}
                </button>
              </div>
            </form>
          </section>
        )}

        {/* Filter */}
        <section className="bg-surface-container-lowest/80 backdrop-blur-xl p-3 md:p-4 rounded-xl mb-8 flex flex-col md:flex-row gap-3 md:gap-4 items-stretch md:items-center">
          <div className="flex-grow min-w-0 flex items-center gap-2 text-on-surface-variant text-sm px-4">
            <span className="material-symbols-outlined text-lg">filter_list</span>
            <span className="font-medium">Filter by Academic Year</span>
          </div>
          <select
            className="bg-surface-container-low border-none rounded-lg py-3 px-4 text-xs font-semibold uppercase tracking-wider text-on-surface-variant focus:ring-primary cursor-pointer"
            value={yearFilter}
            onChange={e => setYearFilter(e.target.value)}
          >
            <option value="">All Years</option>
            {academicYears.map(y => (
              <option key={y.id} value={y.id}>{y.label}{y.is_current ? ' (Current)' : ''}</option>
            ))}
          </select>
        </section>

        {/* Table */}
        <div className="bg-surface-container-lowest rounded-xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left min-w-[700px]">
              <thead>
                <tr className="bg-surface-container-low text-on-surface-variant">
                  <th className="px-4 md:px-6 py-4 font-bold text-[10px] uppercase tracking-widest">Subject</th>
                  <th className="px-4 md:px-6 py-4 font-bold text-[10px] uppercase tracking-widest">Section</th>
                  <th className="px-4 md:px-6 py-4 font-bold text-[10px] uppercase tracking-widest">Teacher</th>
                  <th className="px-4 md:px-6 py-4 font-bold text-[10px] uppercase tracking-widest hidden md:table-cell">Academic Year</th>
                  <th className="px-4 md:px-6 py-4 font-bold text-[10px] uppercase tracking-widest hidden md:table-cell">Location</th>
                  <th className="px-4 md:px-6 py-4 font-bold text-[10px] uppercase tracking-widest w-16">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-container-low">
                {loading ? (
                  Array.from({ length: 5 }).map((_, i) => <SkeletonTableRow key={i} cols={6} />)
                ) : courses.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center">
                      <span className="material-symbols-outlined text-4xl text-on-surface-variant mb-3 block">menu_book</span>
                      <p className="text-on-surface-variant font-medium">No courses found.</p>
                      <p className="text-sm text-on-surface-variant mt-1">
                        {yearFilter ? 'Try selecting a different academic year.' : 'Create your first course assignment to get started.'}
                      </p>
                    </td>
                  </tr>
                ) : (
                  courses.map(course => (
                    <tr key={course.id} className="hover:bg-surface-container-low/50 transition-colors group">
                      <td className="px-4 md:px-6 py-4 md:py-5">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded bg-primary/10 text-primary flex items-center justify-center">
                            <span className="material-symbols-outlined text-lg">menu_book</span>
                          </div>
                          <span className="font-semibold text-on-surface text-sm">{course.subject_name}</span>
                        </div>
                      </td>
                      <td className="px-4 md:px-6 py-4 md:py-5">
                        <span className="text-xs px-3 py-1 bg-secondary-container text-on-secondary-container rounded-full font-medium">
                          {course.section_display}
                        </span>
                      </td>
                      <td className="px-4 md:px-6 py-4 md:py-5 text-sm text-on-surface">
                        {course.teacher_name ?? (
                          <span className="text-on-surface-variant italic">Unassigned</span>
                        )}
                      </td>
                      <td className="px-4 md:px-6 py-4 md:py-5 text-sm text-on-surface-variant hidden md:table-cell">
                        {getAcademicYearLabel(course.academic_year)}
                      </td>
                      <td className="px-4 md:px-6 py-4 md:py-5 text-sm text-on-surface-variant hidden md:table-cell">
                        {course.location || '—'}
                      </td>
                      <td className="px-4 md:px-6 py-4 md:py-5">
                        <button
                          onClick={() => handleDelete(course.id)}
                          disabled={deletingId === course.id}
                          className="p-2 text-on-surface-variant hover:text-error transition-colors disabled:opacity-50"
                          title="Delete course"
                          aria-label={`Delete course ${course.subject_name}`}
                        >
                          {deletingId === course.id ? (
                            <span className="w-4 h-4 border-2 border-error/30 border-t-error rounded-full animate-spin inline-block" />
                          ) : (
                            <span className="material-symbols-outlined text-lg">delete</span>
                          )}
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Footer count */}
          {!loading && courses.length > 0 && (
            <div className="px-4 md:px-6 py-4 bg-surface-container-low flex justify-between items-center">
              <p className="text-xs text-on-surface-variant">
                {courses.length} course{courses.length !== 1 ? 's' : ''} total
                {yearFilter ? ` for ${getAcademicYearLabel(Number(yearFilter))}` : ''}
              </p>
            </div>
          )}
        </div>
      </main>
    </PageLayout>
  )
}
