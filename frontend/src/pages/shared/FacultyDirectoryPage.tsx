import { useState, useEffect, useMemo, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import PageLayout from '@/components/layout/PageLayout'
import api from '@/lib/api'
import { Bone, SkeletonCircle, SkeletonLine } from '@/components/shared/Skeleton'

interface FacultyMember {
  id: number
  employee_id: string
  name: string
  email: string
  avatar_url: string | null
  department: string
  department_id: number
  title: string
  qualification: string
  specialization: string
  employment_status: string
  performance_score: number | null
}

interface Department {
  id: number
  name: string
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

function StatusBadge({ status }: { status: string }) {
  const lower = status.toLowerCase()
  const colorMap: Record<string, string> = {
    'full-time': 'bg-tertiary/10 text-tertiary',
    'full_time': 'bg-tertiary/10 text-tertiary',
    'part-time': 'bg-primary/10 text-primary',
    'part_time': 'bg-primary/10 text-primary',
    contract: 'bg-secondary-container text-on-secondary-container',
    inactive: 'bg-error/10 text-error',
  }
  const colors = colorMap[lower] ?? 'bg-surface-container-high text-on-surface-variant'
  return (
    <span className={`${colors} text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider`}>
      {status.replace(/_/g, '-')}
    </span>
  )
}

function FacultyCardSkeleton() {
  return (
    <div className="bg-surface-container-lowest rounded-xl p-6 space-y-4">
      <div className="flex items-center gap-4">
        <SkeletonCircle size="w-14 h-14" />
        <div className="space-y-2 flex-1">
          <SkeletonLine width="w-40" height="h-5" />
          <SkeletonLine width="w-24" height="h-3" />
        </div>
      </div>
      <Bone className="w-full h-px" />
      <div className="flex justify-between">
        <SkeletonLine width="w-20" height="h-5" />
        <SkeletonLine width="w-16" height="h-5" />
      </div>
    </div>
  )
}

export default function FacultyDirectoryPage() {
  const navigate = useNavigate()

  const [faculty, setFaculty] = useState<FacultyMember[]>([])
  const [departments, setDepartments] = useState<Department[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [search, setSearch] = useState('')
  const [selectedDept, setSelectedDept] = useState<number | ''>('')

  useEffect(() => {
    let cancelled = false
    async function fetchData() {
      try {
        setLoading(true)
        setError(null)
        const [facultyRes, deptRes] = await Promise.all([
          api.get('/shared/faculty/'),
          api.get('/shared/departments/'),
        ])
        if (cancelled) return
        setFaculty(facultyRes.data.data ?? facultyRes.data)
        const depts = deptRes.data.results ?? deptRes.data.data ?? deptRes.data
        setDepartments(Array.isArray(depts) ? depts : [])
      } catch (err: unknown) {
        if (!cancelled) {
          const message = err instanceof Error ? err.message : 'Failed to load faculty directory.'
          setError(message)
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    fetchData()
    return () => {
      cancelled = true
    }
  }, [])

  const filtered = useMemo(() => {
    let list = faculty
    if (selectedDept !== '') {
      list = list.filter((f) => f.department_id === selectedDept)
    }
    if (search.trim()) {
      const q = search.toLowerCase()
      list = list.filter(
        (f) =>
          f.name.toLowerCase().includes(q) ||
          f.email.toLowerCase().includes(q) ||
          f.department.toLowerCase().includes(q) ||
          f.title.toLowerCase().includes(q),
      )
    }
    return list
  }, [faculty, selectedDept, search])

  const handleCardClick = useCallback(
    (id: number) => {
      navigate(`/faculty/${id}`)
    },
    [navigate],
  )

  return (
    <PageLayout>
      <main className="max-w-7xl mx-auto px-4 md:px-6 py-10 pb-32">
        {/* Header */}
        <section className="mb-10">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <span className="font-label text-xs font-semibold tracking-widest text-on-surface-variant uppercase mb-2 block">
                Academic Operations
              </span>
              <h2 className="font-headline font-extrabold text-3xl md:text-4xl text-on-surface tracking-tight">
                Faculty &amp; Staff Registry
              </h2>
            </div>

            {/* Search + Filter */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant/50 text-lg">
                  search
                </span>
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search faculty..."
                  className="pl-10 pr-4 py-2.5 bg-surface-container-lowest border border-outline-variant/20 rounded-xl text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary/30 w-full sm:w-64"
                  aria-label="Search faculty members"
                />
              </div>
              <select
                value={selectedDept}
                onChange={(e) => setSelectedDept(e.target.value === '' ? '' : Number(e.target.value))}
                className="bg-surface-container-lowest border border-outline-variant/20 rounded-xl px-4 py-2.5 text-sm font-medium text-on-surface-variant focus:ring-2 focus:ring-primary/20 cursor-pointer"
                aria-label="Filter by department"
              >
                <option value="">All Departments</option>
                {departments.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </section>

        {/* Error State */}
        {error && (
          <div className="bg-error/10 text-error rounded-xl p-6 text-center mb-8" role="alert">
            <span className="material-symbols-outlined text-3xl mb-2 block">error</span>
            <p className="font-medium">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="mt-3 px-4 py-2 bg-error text-on-error rounded-lg text-sm font-bold"
            >
              Retry
            </button>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <FacultyCardSkeleton key={i} />
            ))}
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && filtered.length === 0 && (
          <div className="text-center py-20">
            <span className="material-symbols-outlined text-5xl text-on-surface-variant/30 mb-4 block">person_search</span>
            <h3 className="font-headline font-bold text-xl text-on-surface mb-2">No faculty members found</h3>
            <p className="text-on-surface-variant text-sm">
              {search || selectedDept !== ''
                ? 'Try adjusting your search or filter criteria.'
                : 'No faculty members have been added yet.'}
            </p>
          </div>
        )}

        {/* Faculty Grid */}
        {!loading && !error && filtered.length > 0 && (
          <section
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            aria-label="Faculty members"
          >
            {filtered.map((member) => (
              <button
                key={member.id}
                type="button"
                onClick={() => handleCardClick(member.id)}
                className="bg-surface-container-lowest rounded-xl p-6 shadow-[0_4px_32px_rgba(25,28,29,0.02)] border border-transparent hover:border-primary-container/20 transition-all text-left group focus:outline-none focus:ring-2 focus:ring-primary/30 focus:ring-offset-2"
                aria-label={`View profile of ${member.name}`}
              >
                {/* Top: Avatar + Name */}
                <div className="flex items-center gap-4 mb-5">
                  <div className="w-14 h-14 rounded-lg overflow-hidden shrink-0 bg-primary-container flex items-center justify-center">
                    {member.avatar_url ? (
                      <img
                        className="w-full h-full object-cover"
                        src={member.avatar_url}
                        alt={member.name}
                        loading="lazy"
                      />
                    ) : (
                      <span className="text-on-primary-container font-bold text-lg">
                        {getInitials(member.name)}
                      </span>
                    )}
                  </div>
                  <div className="min-w-0">
                    <h4 className="font-bold font-headline text-on-surface truncate">{member.name}</h4>
                    <p className="text-[11px] text-on-surface-variant truncate">{member.title}</p>
                  </div>
                </div>

                {/* Department + Status badges */}
                <div className="flex flex-wrap items-center gap-2 mb-5">
                  <span className="bg-secondary-container text-on-secondary-container text-[10px] px-2.5 py-0.5 rounded-full font-semibold uppercase tracking-wider">
                    {member.department}
                  </span>
                  <StatusBadge status={member.employment_status} />
                </div>

                {/* Performance Score */}
                <div className="flex items-center justify-between pt-4 border-t border-surface-container-high">
                  <span className="text-[10px] text-on-surface-variant uppercase font-semibold tracking-wider">
                    Performance
                  </span>
                  {member.performance_score != null ? (
                    <div className="flex items-center gap-1">
                      <span className="material-symbols-outlined text-primary text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>
                        star
                      </span>
                      <span className="font-bold text-sm text-on-surface">{member.performance_score.toFixed(1)}</span>
                      <span className="text-[10px] text-on-surface-variant">/ 5</span>
                    </div>
                  ) : (
                    <span className="text-xs text-on-surface-variant italic">N/A</span>
                  )}
                </div>
              </button>
            ))}
          </section>
        )}
      </main>
    </PageLayout>
  )
}
