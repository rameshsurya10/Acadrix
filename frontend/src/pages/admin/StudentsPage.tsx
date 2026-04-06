import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import PageLayout from '@/components/layout/PageLayout'
import { adminService, type StudentProfile } from '@/services/admin/adminService'
import { SkeletonStudentRow } from '@/components/shared/Skeleton'

export default function StudentsPage() {
  const navigate = useNavigate()
  const [students, setStudents] = useState<StudentProfile[]>([])
  const [totalCount, setTotalCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [grades, setGrades] = useState<{ id: number; level: number; label: string }[]>([])
  const [gradeFilter, setGradeFilter] = useState('')

  const fetchStudents = useCallback(async (pageNum: number, append = false) => {
    try {
      if (append) setLoadingMore(true)
      else setLoading(true)

      const params: Record<string, string> = { page: String(pageNum), page_size: '25' }
      if (search) params.search = search
      if (gradeFilter) params.section__grade = gradeFilter

      const result = await adminService.getStudents(params)
      if (append) {
        setStudents(prev => [...prev, ...result.results])
      } else {
        setStudents(result.results)
      }
      setTotalCount(result.count)
    } catch (err) {
      console.error('Failed to load students:', err)
    } finally {
      setLoading(false)
      setLoadingMore(false)
    }
  }, [search, gradeFilter])

  useEffect(() => {
    setPage(1)
    fetchStudents(1)
  }, [fetchStudents])

  useEffect(() => {
    adminService.getGrades().then(setGrades).catch(() => {})
  }, [])

  function handleLoadMore() {
    const next = page + 1
    setPage(next)
    fetchStudents(next, true)
  }

  function getInitials(name: string) {
    return name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
  }

  function getSectionLabel(s: StudentProfile) {
    if (!s.section_detail) return '—'
    const g = s.section_detail.grade
    return `${g.label} • Section ${s.section_detail.name}`
  }

  return (
    <PageLayout>
      <main className="pt-6 md:pt-10 pb-32 px-4 md:px-8 max-w-7xl mx-auto">
        {/* Header */}
        <section className="mb-8 md:mb-10">
          <span className="font-label text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-2 block">Administrative Oversight</span>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 md:gap-6">
            <div>
              <h2 className="font-headline font-extrabold text-3xl md:text-4xl lg:text-5xl text-on-surface tracking-tight">Master Student Registry</h2>
              <p className="text-on-surface-variant mt-2 max-w-xl text-sm md:text-base">
                {loading ? 'Loading students...' : `${totalCount} students enrolled. Manage documentation, academic standing, and financial compliance.`}
              </p>
            </div>
            <button
              onClick={() => navigate('/admin/enrollment')}
              className="bg-primary-container text-on-primary px-5 md:px-6 py-3 rounded-lg font-headline font-bold text-sm shadow-sm flex items-center gap-2 hover:scale-95 duration-150"
            >
              <span className="material-symbols-outlined text-sm">person_add</span>
              New Enrollment
            </button>
          </div>
        </section>

        {/* Search & Filter */}
        <section className="bg-surface-container-lowest/80 backdrop-blur-xl p-3 md:p-4 rounded-xl mb-8 flex flex-col md:flex-row gap-3 md:gap-4 items-stretch md:items-center">
          <div className="flex-grow min-w-0 relative">
            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant">search</span>
            <input
              className="w-full pl-12 pr-4 py-3 bg-surface-container-low border-none rounded-lg focus:ring-2 focus:ring-primary text-sm"
              placeholder="Search by name, ID, or parent contact..."
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <div className="flex gap-2 flex-wrap">
            <select
              className="bg-surface-container-low border-none rounded-lg py-3 px-4 text-xs font-semibold uppercase tracking-wider text-on-surface-variant focus:ring-primary cursor-pointer"
              value={gradeFilter}
              onChange={e => setGradeFilter(e.target.value)}
            >
              <option value="">Grade: All</option>
              {grades.map(g => (
                <option key={g.id} value={g.id}>{g.label}</option>
              ))}
            </select>
          </div>
        </section>

        {/* Student List */}
        <div className="space-y-4">
          {loading ? (
            Array.from({ length: 4 }).map((_, i) => <SkeletonStudentRow key={i} />)
          ) : students.length === 0 ? (
            <div className="bg-surface-container-lowest p-12 rounded-xl text-center">
              <span className="material-symbols-outlined text-4xl text-on-surface-variant mb-3 block">school</span>
              <p className="text-on-surface-variant font-medium">No students found.</p>
              <p className="text-sm text-on-surface-variant mt-1">
                {search || gradeFilter ? 'Try adjusting your filters.' : 'Enroll your first student to get started.'}
              </p>
            </div>
          ) : (
            students.map(s => (
              <div key={s.id} className="group bg-surface-container-lowest hover:bg-surface-container-high transition-colors p-4 md:p-5 rounded-xl flex flex-col lg:flex-row lg:items-center justify-between gap-4 md:gap-6">
                <div className="flex items-center gap-4 md:gap-5">
                  {s.avatar_url ? (
                    <img src={s.avatar_url} alt={s.full_name} className="w-12 h-12 md:w-14 md:h-14 rounded-lg object-cover" />
                  ) : (
                    <div className="w-12 h-12 md:w-14 md:h-14 rounded-lg bg-surface-container-low flex items-center justify-center font-bold text-on-surface-variant">
                      {getInitials(s.full_name)}
                    </div>
                  )}
                  <div>
                    <h3 className="font-headline font-bold text-base md:text-lg text-on-surface">{s.full_name}</h3>
                    <p className="text-xs text-on-surface-variant font-medium">ID: {s.student_id}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-8 flex-grow max-w-2xl">
                  <div>
                    <p className="text-[10px] uppercase tracking-widest font-bold text-on-surface-variant mb-1">Grade / Sec</p>
                    <p className="font-semibold text-sm">{getSectionLabel(s)}</p>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-widest font-bold text-on-surface-variant mb-1">Enrolled</p>
                    <p className="font-medium text-sm text-on-surface-variant">
                      {s.enrollment_date ? new Date(s.enrollment_date).toLocaleDateString() : '—'}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-widest font-bold text-on-surface-variant mb-1">Guardian</p>
                    <p className="font-medium text-xs text-on-surface">
                      {s.guardians.length > 0 ? s.guardians[0].parent_name || s.guardians[0].relationship : 'None'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 lg:border-l border-outline-variant/20 lg:pl-6">
                  <button className="p-2 text-on-surface-variant hover:text-primary transition-colors" title="View Profile">
                    <span className="material-symbols-outlined">account_circle</span>
                  </button>
                  <button className="p-2 text-on-surface-variant hover:text-primary transition-colors" title="Documents">
                    <span className="material-symbols-outlined">folder_open</span>
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Load More */}
        {!loading && students.length < totalCount && (
          <div className="mt-10 flex justify-center">
            <button
              onClick={handleLoadMore}
              disabled={loadingMore}
              className="bg-surface-container-highest text-on-surface-variant px-8 py-3 rounded-full font-headline font-bold text-sm hover:bg-surface-container-high transition-all disabled:opacity-50"
            >
              {loadingMore ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-on-surface-variant/30 border-t-on-surface-variant rounded-full animate-spin" />
                  Loading...
                </span>
              ) : (
                `Load More (${students.length} of ${totalCount})`
              )}
            </button>
          </div>
        )}
      </main>
    </PageLayout>
  )
}
