import { useState, useEffect, useCallback } from 'react'
import PageLayout from '@/components/layout/PageLayout'
import { Bone } from '@/components/shared/Skeleton'
import {
  teacherService,
  type TeacherSection,
} from '@/services/teacher/teacherService'

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function todayISO(): string {
  const d = new Date()
  const yyyy = d.getFullYear()
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const dd = String(d.getDate()).padStart(2, '0')
  return `${yyyy}-${mm}-${dd}`
}

interface StudentRow {
  id: number
  full_name: string
  student_id: string
  is_present: boolean
  remarks: string
}

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */

export default function TeacherAttendancePage() {
  /* ── Sections ──────────────────────────────────────────────────── */
  const [sections, setSections] = useState<TeacherSection[]>([])
  const [selectedSection, setSelectedSection] = useState('')
  const [sectionsLoading, setSectionsLoading] = useState(true)

  /* ── Date ──────────────────────────────────────────────────────── */
  const [date, setDate] = useState(todayISO)

  /* ── Students ──────────────────────────────────────────────────── */
  const [students, setStudents] = useState<StudentRow[]>([])
  const [studentsLoading, setStudentsLoading] = useState(false)

  /* ── Submission ────────────────────────────────────────────────── */
  const [submitting, setSubmitting] = useState(false)
  const [successMsg, setSuccessMsg] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  /* ── Load sections on mount ────────────────────────────────────── */
  useEffect(() => {
    let cancelled = false
    setSectionsLoading(true)
    teacherService
      .getMySections()
      .then((list) => {
        if (!cancelled) {
          setSections(list)
          if (list.length > 0) setSelectedSection(String(list[0].id))
        }
      })
      .catch(() => {
        if (!cancelled) setError('Failed to load sections.')
      })
      .finally(() => {
        if (!cancelled) setSectionsLoading(false)
      })
    return () => { cancelled = true }
  }, [])

  /* ── Load students when section changes ─────────────────────────── */
  const loadStudents = useCallback(async () => {
    if (!selectedSection) {
      setStudents([])
      return
    }
    try {
      setStudentsLoading(true)
      setError(null)
      setSuccessMsg(null)

      const profiles = await teacherService.getStudentProfiles({ section: selectedSection })

      // Try to get existing attendance for this section + date
      let existingMap: Record<number, { is_present: boolean; remarks: string }> = {}
      try {
        const existing = await teacherService.getAttendance({ section_id: selectedSection, date })
        for (const r of existing) {
          existingMap[r.student_id] = { is_present: r.is_present, remarks: r.remarks }
        }
      } catch {
        // Endpoint may not exist yet — default all to present
      }

      const rows: StudentRow[] = profiles.map((p) => ({
        id: p.id,
        full_name: p.full_name,
        student_id: p.student_id,
        is_present: existingMap[p.id]?.is_present ?? true,
        remarks: existingMap[p.id]?.remarks ?? '',
      }))
      setStudents(rows)
    } catch {
      setError('Failed to load students.')
    } finally {
      setStudentsLoading(false)
    }
  }, [selectedSection, date])

  useEffect(() => {
    loadStudents()
  }, [loadStudents])

  /* ── Toggle helpers ────────────────────────────────────────────── */
  const allPresent = students.length > 0 && students.every((s) => s.is_present)

  function toggleAll() {
    const newVal = !allPresent
    setStudents((prev) => prev.map((s) => ({ ...s, is_present: newVal })))
  }

  function toggleStudent(id: number) {
    setStudents((prev) =>
      prev.map((s) => (s.id === id ? { ...s, is_present: !s.is_present } : s)),
    )
  }

  function setRemarks(id: number, remarks: string) {
    setStudents((prev) =>
      prev.map((s) => (s.id === id ? { ...s, remarks } : s)),
    )
  }

  /* ── Submit ────────────────────────────────────────────────────── */
  async function handleSubmit() {
    if (!selectedSection || students.length === 0) return
    try {
      setSubmitting(true)
      setError(null)
      setSuccessMsg(null)
      const result = await teacherService.bulkMarkAttendance({
        section_id: Number(selectedSection),
        date,
        records: students.map((s) => ({
          student_id: s.id,
          is_present: s.is_present,
          remarks: s.remarks,
        })),
      })
      setSuccessMsg(`Attendance saved for ${result.count ?? students.length} students.`)
    } catch {
      setError('Failed to save attendance. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  /* ── Counts ────────────────────────────────────────────────────── */
  const presentCount = students.filter((s) => s.is_present).length
  const absentCount = students.length - presentCount

  /* ── Render ────────────────────────────────────────────────────── */
  return (
    <PageLayout>
      <main className="max-w-7xl mx-auto px-4 md:px-6 py-10 pb-32 space-y-8">
        {/* Header */}
        <div className="space-y-1">
          <span className="font-label text-xs font-semibold tracking-widest text-on-surface-variant uppercase mb-2 block">
            Class Management
          </span>
          <h2 className="font-headline font-extrabold text-3xl md:text-4xl text-on-surface tracking-tight">
            Mark Attendance
          </h2>
        </div>

        {/* Controls */}
        <div className="bg-surface-container-lowest rounded-xl p-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Section selector */}
            <div>
              <label htmlFor="section-select" className="block text-sm font-bold text-on-surface-variant mb-1.5">
                Section
              </label>
              {sectionsLoading ? (
                <Bone className="w-full h-10 rounded-lg" />
              ) : (
                <select
                  id="section-select"
                  value={selectedSection}
                  onChange={(e) => setSelectedSection(e.target.value)}
                  className="w-full h-10 px-3 rounded-lg border border-outline-variant bg-surface-container-lowest text-on-surface text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  {sections.length === 0 && <option value="">No sections assigned</option>}
                  {sections.map((s) => (
                    <option key={s.id} value={String(s.id)}>
                      {s.display_name}
                    </option>
                  ))}
                </select>
              )}
            </div>

            {/* Date picker */}
            <div>
              <label htmlFor="date-input" className="block text-sm font-bold text-on-surface-variant mb-1.5">
                Date
              </label>
              <input
                id="date-input"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                max={todayISO()}
                className="w-full h-10 px-3 rounded-lg border border-outline-variant bg-surface-container-lowest text-on-surface text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="bg-error/10 text-error rounded-xl p-4 flex items-center gap-3">
            <span className="material-symbols-outlined">error</span>
            <p className="text-sm font-semibold">{error}</p>
          </div>
        )}

        {/* Success */}
        {successMsg && (
          <div className="bg-tertiary/10 text-tertiary rounded-xl p-4 flex items-center gap-3">
            <span className="material-symbols-outlined">check_circle</span>
            <p className="text-sm font-semibold">{successMsg}</p>
          </div>
        )}

        {/* Summary chips */}
        {students.length > 0 && !studentsLoading && (
          <div className="flex flex-wrap gap-3">
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-surface-container-low rounded-full text-sm font-semibold text-on-surface-variant">
              <span className="material-symbols-outlined text-base">groups</span>
              {students.length} students
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-tertiary/10 text-tertiary rounded-full text-sm font-semibold">
              <span className="material-symbols-outlined text-base">check</span>
              {presentCount} present
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-error/10 text-error rounded-full text-sm font-semibold">
              <span className="material-symbols-outlined text-base">close</span>
              {absentCount} absent
            </span>
          </div>
        )}

        {/* Student list */}
        {studentsLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <Bone key={i} className="w-full h-14 rounded-xl" />
            ))}
          </div>
        ) : students.length === 0 ? (
          <div className="bg-surface-container-lowest rounded-xl p-12 text-center">
            <span className="material-symbols-outlined text-5xl text-on-surface-variant/40 mb-3 block">
              person_off
            </span>
            <p className="text-on-surface-variant font-semibold">
              {selectedSection ? 'No students found in this section.' : 'Select a section to begin.'}
            </p>
          </div>
        ) : (
          <div className="bg-surface-container-lowest rounded-xl overflow-hidden">
            {/* Table header */}
            <div className="flex items-center gap-4 px-4 md:px-6 py-3 bg-surface-container-low border-b border-outline-variant/20">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={allPresent}
                  onChange={toggleAll}
                  className="w-4.5 h-4.5 rounded border-outline-variant accent-primary cursor-pointer"
                  aria-label="Toggle all present"
                />
                <span className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">
                  {allPresent ? 'Deselect All' : 'Select All'}
                </span>
              </label>
              <span className="ml-auto text-xs font-bold text-on-surface-variant uppercase tracking-wider hidden sm:block">
                Remarks
              </span>
            </div>

            {/* Rows */}
            <div className="divide-y divide-outline-variant/10">
              {students.map((s) => (
                <div
                  key={s.id}
                  className={`flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 px-4 md:px-6 py-3 transition-colors ${
                    s.is_present ? 'bg-surface-container-lowest' : 'bg-error/5'
                  }`}
                >
                  <label className="flex items-center gap-3 cursor-pointer select-none min-w-0 flex-1">
                    <input
                      type="checkbox"
                      checked={s.is_present}
                      onChange={() => toggleStudent(s.id)}
                      className="w-4.5 h-4.5 rounded border-outline-variant accent-primary cursor-pointer flex-shrink-0"
                      aria-label={`Mark ${s.full_name} as ${s.is_present ? 'absent' : 'present'}`}
                    />
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-on-surface truncate">{s.full_name}</p>
                      <p className="text-xs text-on-surface-variant">{s.student_id}</p>
                    </div>
                  </label>
                  <span
                    className={`text-xs font-bold px-2 py-0.5 rounded-full self-start sm:self-center flex-shrink-0 ${
                      s.is_present ? 'bg-tertiary/10 text-tertiary' : 'bg-error/10 text-error'
                    }`}
                  >
                    {s.is_present ? 'Present' : 'Absent'}
                  </span>
                  <input
                    type="text"
                    value={s.remarks}
                    onChange={(e) => setRemarks(s.id, e.target.value)}
                    placeholder="Add remarks..."
                    className="w-full sm:w-48 h-8 px-2.5 rounded-lg border border-outline-variant/40 bg-surface-container-low text-on-surface text-xs focus:outline-none focus:ring-2 focus:ring-primary placeholder:text-on-surface-variant/50"
                    aria-label={`Remarks for ${s.full_name}`}
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Submit */}
        {students.length > 0 && !studentsLoading && (
          <div className="flex justify-end">
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="inline-flex items-center gap-2 px-8 py-3 bg-primary text-on-primary rounded-xl font-bold text-sm shadow-md hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? (
                <>
                  <span className="material-symbols-outlined animate-spin text-base">progress_activity</span>
                  Saving...
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-base">save</span>
                  Submit Attendance
                </>
              )}
            </button>
          </div>
        )}
      </main>
    </PageLayout>
  )
}
