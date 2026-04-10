import { useEffect, useState, useRef } from 'react'
import PageLayout from '@/components/layout/PageLayout'
import { SkeletonProfileHeader, Bone } from '@/components/shared/Skeleton'
import { studentService, type StudentProfile, type AttendanceRecord, type DocumentItem } from '@/services/student/studentService'

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function docStatusBadge(status: string) {
  const s = status.toLowerCase()
  if (s === 'verified' || s === 'approved')
    return { label: 'Verified', cls: 'text-tertiary', icon: 'check_circle' }
  if (s === 'rejected')
    return { label: 'Rejected', cls: 'text-error', icon: 'cancel' }
  return { label: 'In Review', cls: 'text-outline', icon: 'schedule' }
}

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function initials(name: string) {
  return name
    .split(' ')
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase()
}

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */

export default function StudentProfilePage() {
  const [profile, setProfile] = useState<StudentProfile | null>(null)
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([])
  const [documents, setDocuments] = useState<DocumentItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    let cancelled = false

    async function load() {
      try {
        const [prof, att, docs] = await Promise.all([
          studentService.getProfile(),
          studentService.getAttendance(),
          studentService.getDocuments(),
        ])
        if (!cancelled) {
          setProfile(prof)
          setAttendance(att)
          setDocuments(docs)
        }
      } catch (err: unknown) {
        if (!cancelled) {
          const msg = (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail
          setError(msg ?? 'Failed to load profile data.')
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    load()
    return () => { cancelled = true }
  }, [])

  /* Attendance stats derived from records */
  const totalDays = attendance.length
  const presentDays = attendance.filter((r) => r.is_present).length
  const attendPct = totalDays > 0 ? (presentDays / totalDays) * 100 : 0

  /* Upload handler */
  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    try {
      const fd = new FormData()
      fd.append('file', file)
      fd.append('doc_type', 'general')
      const doc = await studentService.uploadDocument(fd)
      setDocuments((prev) => [doc, ...prev])
    } catch {
      /* fail silently -- toast could go here */
    } finally {
      setUploading(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  /* ── Loading ──────────────────────────────────────── */
  if (loading) {
    return (
      <PageLayout>
        <main className="max-w-6xl mx-auto px-4 md:px-6 py-8 pb-32 space-y-8">
          <div className="space-y-2 mb-4">
            <Bone className="w-28 h-3 rounded-md" />
            <Bone className="w-48 h-8 rounded-md" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
            <div className="md:col-span-5"><SkeletonProfileHeader /></div>
            <div className="md:col-span-7 space-y-6">
              <Bone className="w-full h-48 rounded-xl" />
              <Bone className="w-full h-64 rounded-xl" />
            </div>
          </div>
        </main>
      </PageLayout>
    )
  }

  /* ── Error ────────────────────────────────────────── */
  if (error || !profile) {
    return (
      <PageLayout>
        <main className="max-w-6xl mx-auto px-4 md:px-6 py-10 pb-32">
          <div className="bg-error/10 text-error rounded-xl p-8 text-center">
            <span className="material-symbols-outlined text-4xl mb-2 block">error</span>
            <p className="font-headline text-lg font-bold">{error ?? 'Profile not found'}</p>
            <button
              onClick={() => window.location.reload()}
              className="mt-4 px-6 py-2 bg-error text-on-error rounded-lg text-sm font-bold"
            >
              Retry
            </button>
          </div>
        </main>
      </PageLayout>
    )
  }

  const grade = profile.section_detail?.grade
  const sectionLabel = profile.section_detail
    ? `${grade?.label ?? `Grade ${grade?.level}`} - ${profile.section_detail.name}`
    : null

  return (
    <PageLayout>
      <main className="max-w-6xl mx-auto px-4 md:px-6 py-8 pb-32">
        {/* Header */}
        <div className="mb-10">
          <p className="font-label text-xs font-medium uppercase tracking-widest text-on-surface-variant mb-1">
            Academic Profile
          </p>
          <h1 className="font-headline font-bold text-4xl text-on-surface">Student Records</h1>
        </div>

        {/* Bento grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
          {/* ── Left column ─────────────────────────────── */}
          <div className="md:col-span-5 space-y-8">
            {/* Profile card */}
            <div className="bg-surface-container-lowest p-8 rounded-xl shadow-[0_32px_64px_-12px_rgba(0,0,0,0.04)] relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16" />
              <div className="flex flex-col items-center text-center">
                <div className="relative mb-6">
                  <div className="w-32 h-32 rounded-full p-1 bg-gradient-to-tr from-primary to-primary-container">
                    {profile.avatar_url ? (
                      <img
                        className="w-full h-full rounded-full object-cover bg-white"
                        alt={profile.full_name}
                        src={profile.avatar_url}
                      />
                    ) : (
                      <div className="w-full h-full rounded-full bg-surface-container-high flex items-center justify-center text-3xl font-bold text-on-surface-variant">
                        {initials(profile.full_name)}
                      </div>
                    )}
                  </div>
                  <div className="absolute bottom-1 right-1 w-6 h-6 bg-tertiary rounded-full border-4 border-surface-container-lowest" />
                </div>
                <h2 className="text-2xl font-headline font-bold text-on-surface">{profile.full_name}</h2>
                <p className="text-on-surface-variant font-medium mb-6">Student ID: {profile.student_id}</p>
                <div className="w-full grid grid-cols-2 gap-4 mb-4">
                  {sectionLabel && (
                    <div className="bg-surface-container-low p-4 rounded-lg text-left">
                      <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider mb-1">Section</p>
                      <p className="text-lg font-headline font-bold text-primary">{sectionLabel}</p>
                    </div>
                  )}
                  {profile.house && (
                    <div className="bg-surface-container-low p-4 rounded-lg text-left">
                      <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider mb-1">House</p>
                      <p className="text-lg font-headline font-bold text-tertiary">{profile.house}</p>
                    </div>
                  )}
                </div>
                {profile.enrollment_date && (
                  <p className="text-xs text-on-surface-variant">
                    Enrolled {new Date(profile.enrollment_date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                  </p>
                )}
              </div>
            </div>

            {/* Attendance pulse */}
            <div className="bg-surface-container-lowest p-6 rounded-xl shadow-[0_32px_64px_-12px_rgba(0,0,0,0.04)]">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider mb-1">Attendance Record</p>
                  <p className="text-3xl font-headline font-bold text-on-surface">{attendPct.toFixed(1)}%</p>
                </div>
                <div className={`flex items-center gap-2 px-3 py-1 rounded-full ${attendPct >= 90 ? 'bg-tertiary/10' : attendPct >= 75 ? 'bg-primary/10' : 'bg-error/10'}`}>
                  <div className={`w-2 h-2 rounded-full animate-pulse ${attendPct >= 90 ? 'bg-tertiary' : attendPct >= 75 ? 'bg-primary' : 'bg-error'}`} />
                  <span className={`text-xs font-bold uppercase tracking-tighter ${attendPct >= 90 ? 'text-tertiary' : attendPct >= 75 ? 'text-primary' : 'text-error'}`}>
                    {attendPct >= 90 ? 'Excellent' : attendPct >= 75 ? 'Good' : 'Needs Improvement'}
                  </span>
                </div>
              </div>
              <div className="h-2 w-full bg-surface-container-low rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-primary to-primary-container rounded-full transition-all duration-700"
                  style={{ width: `${Math.min(attendPct, 100)}%` }}
                />
              </div>
              <p className="text-xs text-on-surface-variant mt-2">{presentDays} present of {totalDays} total days</p>
            </div>

            {/* Guardians */}
            {profile.guardians.length > 0 && (
              <div className="bg-surface-container-lowest p-6 rounded-xl shadow-[0_32px_64px_-12px_rgba(0,0,0,0.04)]">
                <h3 className="text-lg font-headline font-bold text-on-surface mb-4">Guardians</h3>
                <div className="space-y-4">
                  {profile.guardians.map((g) => (
                    <div key={g.id} className="flex items-start gap-4 bg-surface-container-low p-4 rounded-lg">
                      <div className="w-10 h-10 rounded-full bg-secondary-container flex items-center justify-center flex-shrink-0">
                        <span className="material-symbols-outlined text-on-secondary-container text-lg">person</span>
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="font-bold text-sm text-on-surface truncate">{g.name}</p>
                          {g.is_primary && (
                            <span className="px-2 py-0.5 bg-primary/10 text-primary rounded-full text-[10px] font-bold uppercase">Primary</span>
                          )}
                        </div>
                        <p className="text-xs text-on-surface-variant capitalize">{g.relationship}</p>
                        {g.phone && <p className="text-xs text-on-surface-variant">{g.phone}</p>}
                        {g.email && <p className="text-xs text-on-surface-variant truncate">{g.email}</p>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* ── Right column ────────────────────────────── */}
          <div className="md:col-span-7 space-y-8">
            {/* Personal info card */}
            <div className="bg-surface-container-lowest rounded-xl p-8 shadow-[0_32px_64px_-12px_rgba(0,0,0,0.04)]">
              <h3 className="text-xl font-headline font-bold text-on-surface mb-6">Personal Information</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider mb-1">Email</p>
                  <p className="text-sm font-medium text-on-surface">{profile.email}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider mb-1">Date of Birth</p>
                  <p className="text-sm font-medium text-on-surface">
                    {profile.date_of_birth
                      ? new Date(profile.date_of_birth).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
                      : 'Not provided'}
                  </p>
                </div>
                <div className="sm:col-span-2">
                  <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider mb-1">Address</p>
                  <p className="text-sm font-medium text-on-surface">{profile.address || 'Not provided'}</p>
                </div>
              </div>
            </div>

            {/* Documents section */}
            <div className="bg-surface-container-low rounded-xl p-8">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-headline font-bold text-on-surface">Verification Documents</h3>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                  className="text-xs font-bold text-primary hover:underline disabled:opacity-50 flex items-center gap-1"
                >
                  <span className="material-symbols-outlined text-sm">upload</span>
                  {uploading ? 'Uploading...' : 'Upload New'}
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  className="hidden"
                  accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                  onChange={handleUpload}
                />
              </div>

              {documents.length === 0 ? (
                <div className="text-center py-12 text-on-surface-variant">
                  <span className="material-symbols-outlined text-4xl mb-2 block">folder_open</span>
                  <p className="text-sm">No documents uploaded yet</p>
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="mt-3 px-4 py-2 bg-primary text-on-primary rounded-lg text-sm font-bold"
                  >
                    Upload Document
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {documents.map((doc) => {
                    const badge = docStatusBadge(doc.status)
                    return (
                      <div
                        key={doc.id}
                        className="bg-surface-container-lowest p-4 rounded-lg flex items-center justify-between group hover:bg-surface-container-high transition-colors"
                      >
                        <div className="flex items-center gap-4 min-w-0">
                          <div className="w-10 h-10 rounded bg-secondary-container flex items-center justify-center text-primary flex-shrink-0">
                            <span className="material-symbols-outlined">description</span>
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-semibold text-on-surface truncate">{doc.file_name}</p>
                            <p className="text-[10px] text-on-surface-variant uppercase tracking-wide">
                              {doc.doc_type} &middot; {formatBytes(doc.file_size_bytes)}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0 ml-4">
                          <span className={`text-[10px] font-bold uppercase tracking-widest ${badge.cls}`}>
                            {badge.label}
                          </span>
                          <span
                            className={`material-symbols-outlined text-sm ${badge.cls}`}
                            style={{ fontVariationSettings: "'FILL' 1" }}
                          >
                            {badge.icon}
                          </span>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </PageLayout>
  )
}
