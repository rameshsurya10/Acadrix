import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import PageLayout from '@/components/layout/PageLayout'
import api from '@/lib/api'
import { Bone, SkeletonCircle, SkeletonLine, SkeletonProfileHeader } from '@/components/shared/Skeleton'

interface Course {
  id: number
  subject: string
  section: string
  academic_year: string
  location: string
}

interface FacultyProfile {
  id: number
  employee_id: string
  name: string
  email: string
  phone: string | null
  avatar_url: string | null
  department: string
  title: string
  qualification: string
  specialization: string
  research_focus: string | null
  employment_status: string
  date_joined: string
  performance_score: number | null
  courses: Course[]
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

function InfoItem({ label, value, icon }: { label: string; value: string | null | undefined; icon: string }) {
  return (
    <div className="flex items-start gap-3 p-4 bg-surface-container-low rounded-xl">
      <span className="material-symbols-outlined text-primary text-xl mt-0.5">{icon}</span>
      <div className="min-w-0">
        <p className="font-label text-[10px] uppercase tracking-widest text-on-surface-variant mb-1">{label}</p>
        <p className="text-sm font-medium text-on-surface break-words">{value || 'Not specified'}</p>
      </div>
    </div>
  )
}

function ProfileSkeleton() {
  return (
    <div className="max-w-7xl mx-auto px-4 md:px-6 py-10 pb-32">
      <Bone className="w-20 h-8 rounded-lg mb-6" />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-surface-container-lowest rounded-xl p-6 text-center space-y-4">
            <SkeletonCircle size="w-36 h-36 mx-auto" />
            <SkeletonLine width="w-48" height="h-6" className="mx-auto" />
            <SkeletonLine width="w-32" height="h-4" className="mx-auto" />
            <SkeletonLine width="w-24" height="h-3" className="mx-auto" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Bone className="h-20 rounded-xl" />
            <Bone className="h-20 rounded-xl" />
          </div>
        </div>
        <div className="lg:col-span-2 space-y-6">
          <SkeletonProfileHeader />
          <Bone className="w-full h-48 rounded-xl" />
        </div>
      </div>
    </div>
  )
}

export default function FacultyProfilePage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  const [profile, setProfile] = useState<FacultyProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!id) return
    let cancelled = false
    async function fetchProfile() {
      try {
        setLoading(true)
        setError(null)
        const res = await api.get(`/shared/faculty/${id}/`)
        if (cancelled) return
        setProfile(res.data.data ?? res.data)
      } catch (err: unknown) {
        if (!cancelled) {
          const message = err instanceof Error ? err.message : 'Failed to load faculty profile.'
          setError(message)
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    fetchProfile()
    return () => {
      cancelled = true
    }
  }, [id])

  if (loading) {
    return (
      <PageLayout>
        <ProfileSkeleton />
      </PageLayout>
    )
  }

  if (error) {
    return (
      <PageLayout>
        <main className="max-w-7xl mx-auto px-4 md:px-6 py-10 pb-32">
          <div className="bg-error/10 text-error rounded-xl p-8 text-center" role="alert">
            <span className="material-symbols-outlined text-4xl mb-3 block">error</span>
            <p className="font-medium mb-4">{error}</p>
            <button
              onClick={() => navigate(-1)}
              className="px-5 py-2 bg-error text-on-error rounded-lg text-sm font-bold"
            >
              Go Back
            </button>
          </div>
        </main>
      </PageLayout>
    )
  }

  if (!profile) return null

  const formattedJoinDate = profile.date_joined
    ? new Date(profile.date_joined).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : null

  return (
    <PageLayout>
      <main className="max-w-7xl mx-auto px-4 md:px-6 py-10 pb-32">
        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-1 text-on-surface-variant text-sm font-medium mb-6 hover:text-primary transition-colors"
          aria-label="Go back"
        >
          <span className="material-symbols-outlined text-lg">arrow_back</span>
          Back
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          {/* Left Column: Identity */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-surface-container-lowest rounded-xl p-6 shadow-[0_4px_32px_rgba(25,28,29,0.04)] text-center">
              {/* Avatar */}
              <div className="relative inline-block mb-5">
                <div className="w-36 h-36 rounded-full overflow-hidden mx-auto border-4 border-surface-container-low bg-primary-container flex items-center justify-center">
                  {profile.avatar_url ? (
                    <img
                      className="w-full h-full object-cover"
                      src={profile.avatar_url}
                      alt={profile.name}
                    />
                  ) : (
                    <span className="text-on-primary-container font-bold text-4xl">
                      {getInitials(profile.name)}
                    </span>
                  )}
                </div>
                {profile.employment_status?.toLowerCase().includes('full') && (
                  <div className="absolute bottom-1 right-1 bg-tertiary p-1.5 rounded-full border-2 border-surface-container-lowest">
                    <span
                      className="material-symbols-outlined text-white text-sm"
                      style={{ fontVariationSettings: "'FILL' 1" }}
                    >
                      verified
                    </span>
                  </div>
                )}
              </div>

              <h1 className="font-headline font-bold text-2xl text-on-surface">{profile.name}</h1>
              <p className="font-label text-sm uppercase tracking-wider text-on-surface-variant mt-1">
                {profile.department}
              </p>
              <p className="text-xs text-on-surface-variant mt-1">{profile.title}</p>
              <p className="text-[10px] text-on-surface-variant/60 mt-2 font-mono">{profile.employee_id}</p>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-surface-container-low rounded-xl p-4 text-center">
                <p className="font-label text-[10px] uppercase tracking-widest text-on-surface-variant mb-1">
                  Performance
                </p>
                {profile.performance_score != null ? (
                  <>
                    <div className="flex items-center justify-center gap-1">
                      <span className="font-headline font-extrabold text-xl text-primary">
                        {profile.performance_score.toFixed(1)}
                      </span>
                      <span
                        className="material-symbols-outlined text-primary text-sm"
                        style={{ fontVariationSettings: "'FILL' 1" }}
                      >
                        star
                      </span>
                    </div>
                    <p className="text-[10px] text-on-surface-variant mt-1">Out of 5.0</p>
                  </>
                ) : (
                  <p className="text-sm text-on-surface-variant italic mt-1">N/A</p>
                )}
              </div>
              <div className="bg-surface-container-low rounded-xl p-4 text-center">
                <p className="font-label text-[10px] uppercase tracking-widest text-on-surface-variant mb-1">
                  Status
                </p>
                <p className="font-headline font-extrabold text-sm text-on-surface mt-1">
                  {profile.employment_status.replace(/_/g, '-')}
                </p>
              </div>
            </div>
          </div>

          {/* Right Column: Details + Courses */}
          <div className="lg:col-span-2 space-y-8">
            {/* Info Grid */}
            <section aria-label="Faculty details">
              <h3 className="font-headline font-bold text-lg mb-4">Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <InfoItem label="Email" value={profile.email} icon="mail" />
                <InfoItem label="Phone" value={profile.phone} icon="call" />
                <InfoItem label="Qualification" value={profile.qualification} icon="school" />
                <InfoItem label="Specialization" value={profile.specialization} icon="target" />
                <InfoItem label="Research Focus" value={profile.research_focus} icon="science" />
                <InfoItem label="Joined" value={formattedJoinDate} icon="calendar_today" />
              </div>
            </section>

            {/* Courses Table */}
            <section aria-label="Courses taught">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-headline font-bold text-lg">Courses</h3>
                {profile.courses.length > 0 && (
                  <span className="bg-primary/10 text-primary text-xs font-bold px-3 py-1 rounded-full">
                    {profile.courses.length} {profile.courses.length === 1 ? 'course' : 'courses'}
                  </span>
                )}
              </div>

              {profile.courses.length === 0 ? (
                <div className="bg-surface-container-lowest rounded-xl p-8 text-center">
                  <span className="material-symbols-outlined text-3xl text-on-surface-variant/30 mb-2 block">
                    menu_book
                  </span>
                  <p className="text-on-surface-variant text-sm">No courses assigned yet.</p>
                </div>
              ) : (
                <div className="bg-surface-container-lowest rounded-xl overflow-hidden shadow-[0_4px_32px_rgba(25,28,29,0.04)] ring-1 ring-outline-variant/10">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left" role="table" aria-label="Courses table">
                      <thead>
                        <tr className="bg-surface-container-low">
                          <th className="px-6 py-4 font-label text-[0.7rem] text-on-surface-variant uppercase tracking-wider">
                            Subject
                          </th>
                          <th className="px-6 py-4 font-label text-[0.7rem] text-on-surface-variant uppercase tracking-wider">
                            Section
                          </th>
                          <th className="px-6 py-4 font-label text-[0.7rem] text-on-surface-variant uppercase tracking-wider">
                            Academic Year
                          </th>
                          <th className="px-6 py-4 font-label text-[0.7rem] text-on-surface-variant uppercase tracking-wider">
                            Location
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-surface-container-low">
                        {profile.courses.map((course) => (
                          <tr key={course.id} className="hover:bg-surface-container-low/50 transition-colors">
                            <td className="px-6 py-4 text-sm font-medium text-on-surface">{course.subject}</td>
                            <td className="px-6 py-4 text-sm text-on-surface-variant">{course.section}</td>
                            <td className="px-6 py-4 text-sm text-on-surface-variant">{course.academic_year}</td>
                            <td className="px-6 py-4 text-sm text-on-surface-variant">
                              <div className="flex items-center gap-1">
                                <span className="material-symbols-outlined text-xs">location_on</span>
                                {course.location}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </section>
          </div>
        </div>
      </main>
    </PageLayout>
  )
}
