import { useState, useEffect, useMemo } from 'react'
import PageLayout from '@/components/layout/PageLayout'
import api from '@/lib/api'
import { useAuth } from '@/contexts/AuthContext'

interface Section {
  id: number
  name: string
  grade: { id: number; level: number; label: string }
}

interface ScheduleSlot {
  id: number
  course: number
  course_display: string
  day: string
  day_display: string
  start_time: string
  end_time: string
  location: string
}

const WEEKDAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

const SUBJECT_COLORS: string[] = [
  'bg-primary/10 text-primary border-primary/20',
  'bg-tertiary/10 text-tertiary border-tertiary/20',
  'bg-secondary/10 text-secondary border-secondary/20',
  'bg-error/10 text-error border-error/20',
  'bg-[#0d9488]/10 text-[#0d9488] border-[#0d9488]/20',
  'bg-[#7c3aed]/10 text-[#7c3aed] border-[#7c3aed]/20',
  'bg-[#c2410c]/10 text-[#c2410c] border-[#c2410c]/20',
  'bg-[#0369a1]/10 text-[#0369a1] border-[#0369a1]/20',
]

function formatTime(time: string): string {
  if (!time) return ''
  const [h, m] = time.split(':')
  const hour = parseInt(h, 10)
  const suffix = hour >= 12 ? 'PM' : 'AM'
  const display = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour
  return `${display}:${m} ${suffix}`
}

export default function TimetablePage() {
  const { user } = useAuth()
  const [sections, setSections] = useState<Section[]>([])
  const [selectedSection, setSelectedSection] = useState<string>('')
  const [slots, setSlots] = useState<ScheduleSlot[]>([])
  const [loading, setLoading] = useState(true)
  const [slotsLoading, setSlotsLoading] = useState(false)

  const isStudent = user?.role === 'student'
  const isTeacher = user?.role === 'teacher'

  // Load sections for admin/principal/finance/super_admin
  useEffect(() => {
    if (isStudent || isTeacher) return
    async function loadSections() {
      try {
        const res = await api.get('/shared/sections/', { params: { page_size: 200 } })
        const data: Section[] = res.data.results ?? res.data
        setSections(data)
        if (data.length > 0) {
          setSelectedSection(String(data[0].id))
        }
      } catch (err) {
        console.error('Failed to load sections:', err)
      }
    }
    loadSections()
  }, [isStudent, isTeacher])

  // Load schedule slots
  useEffect(() => {
    async function loadSlots() {
      setSlotsLoading(true)
      try {
        let url = '/shared/schedule-slots/'
        const params: Record<string, string> = { page_size: '200' }

        if (isTeacher) {
          // Teacher sees their own slots — no section filter needed
        } else if (isStudent) {
          // Student auto-detects from their profile
          params.my_schedule = 'true'
        } else if (selectedSection) {
          params['course__section'] = selectedSection
        } else {
          setSlotsLoading(false)
          setLoading(false)
          return
        }

        const res = await api.get(url, { params })
        const data: ScheduleSlot[] = res.data.results ?? res.data
        setSlots(data)
      } catch (err) {
        console.error('Failed to load schedule slots:', err)
        setSlots([])
      } finally {
        setSlotsLoading(false)
        setLoading(false)
      }
    }
    loadSlots()
  }, [selectedSection, isStudent, isTeacher])

  // Build color map by unique course_display
  const colorMap = useMemo(() => {
    const subjects = Array.from(new Set(slots.map(s => s.course_display)))
    const map = new Map<string, string>()
    subjects.forEach((subj, i) => {
      map.set(subj, SUBJECT_COLORS[i % SUBJECT_COLORS.length])
    })
    return map
  }, [slots])

  // Derive unique time periods from data, sorted by start_time
  const timePeriods = useMemo(() => {
    const periodSet = new Map<string, { start_time: string; end_time: string }>()
    for (const slot of slots) {
      const key = `${slot.start_time}-${slot.end_time}`
      if (!periodSet.has(key)) {
        periodSet.set(key, { start_time: slot.start_time, end_time: slot.end_time })
      }
    }
    return Array.from(periodSet.values()).sort((a, b) => a.start_time.localeCompare(b.start_time))
  }, [slots])

  // Build a lookup: key = "start_time-end_time|day_display" => slot
  const slotLookup = useMemo(() => {
    const map = new Map<string, ScheduleSlot>()
    for (const slot of slots) {
      const key = `${slot.start_time}-${slot.end_time}|${slot.day_display}`
      map.set(key, slot)
    }
    return map
  }, [slots])

  const showSectionSelector = !isStudent && !isTeacher

  return (
    <PageLayout>
      <main className="pt-6 md:pt-10 pb-32 px-4 md:px-8 max-w-7xl mx-auto">
        {/* Header */}
        <section className="mb-8 md:mb-10">
          <span className="font-label text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-2 block">
            Academic Schedule
          </span>
          <h2 className="font-headline font-extrabold text-3xl md:text-4xl lg:text-5xl text-on-surface tracking-tight">
            Weekly Timetable
          </h2>
          <p className="text-on-surface-variant mt-2 max-w-xl text-sm md:text-base">
            {isStudent
              ? 'Your class schedule for the current week.'
              : isTeacher
                ? 'Your teaching schedule for the current week.'
                : 'View the weekly class schedule by section.'}
          </p>
        </section>

        {/* Section Selector */}
        {showSectionSelector && (
          <section className="bg-surface-container-lowest/80 backdrop-blur-xl p-3 md:p-4 rounded-xl mb-8 flex items-center gap-4">
            <span className="material-symbols-outlined text-on-surface-variant">filter_list</span>
            <select
              className="bg-surface-container-low border-none rounded-lg py-3 px-4 text-sm font-semibold text-on-surface-variant focus:ring-primary cursor-pointer flex-grow max-w-xs"
              value={selectedSection}
              onChange={e => setSelectedSection(e.target.value)}
            >
              <option value="">Select Section</option>
              {sections.map(sec => (
                <option key={sec.id} value={sec.id}>
                  {sec.grade.label} - Section {sec.name}
                </option>
              ))}
            </select>
          </section>
        )}

        {/* Timetable Grid */}
        {loading || slotsLoading ? (
          <div className="bg-surface-container-lowest rounded-xl p-8">
            <div className="space-y-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="flex gap-4">
                  <div className="w-24 h-12 rounded-lg bg-surface-container-high animate-pulse" />
                  {Array.from({ length: 6 }).map((_, j) => (
                    <div key={j} className="flex-1 h-12 rounded-lg bg-surface-container-high animate-pulse" />
                  ))}
                </div>
              ))}
            </div>
          </div>
        ) : slots.length === 0 ? (
          <div className="bg-surface-container-lowest p-12 rounded-xl text-center">
            <span className="material-symbols-outlined text-4xl text-on-surface-variant mb-3 block">calendar_month</span>
            <p className="text-on-surface-variant font-medium">No schedule data found.</p>
            <p className="text-sm text-on-surface-variant mt-1">
              {showSectionSelector && !selectedSection
                ? 'Please select a section to view the timetable.'
                : 'No classes have been scheduled yet.'}
            </p>
          </div>
        ) : (
          <div className="bg-surface-container-lowest rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[700px]" role="table" aria-label="Weekly timetable">
                <thead>
                  <tr className="border-b border-outline-variant/10">
                    <th className="p-3 md:p-4 text-left text-[10px] uppercase tracking-widest font-bold text-on-surface-variant w-28">
                      Time
                    </th>
                    {WEEKDAYS.map(day => (
                      <th key={day} className="p-3 md:p-4 text-center text-[10px] uppercase tracking-widest font-bold text-on-surface-variant">
                        {day}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {timePeriods.map((period) => (
                    <tr key={`${period.start_time}-${period.end_time}`} className="border-b border-outline-variant/5 last:border-b-0">
                      <td className="p-3 md:p-4 align-top">
                        <p className="text-xs font-bold text-on-surface">{formatTime(period.start_time)}</p>
                        <p className="text-[10px] text-on-surface-variant">{formatTime(period.end_time)}</p>
                      </td>
                      {WEEKDAYS.map(day => {
                        const key = `${period.start_time}-${period.end_time}|${day}`
                        const slot = slotLookup.get(key)
                        if (!slot) {
                          return (
                            <td key={day} className="p-2 md:p-3 text-center align-top">
                              <span className="text-xs text-on-surface-variant/40">—</span>
                            </td>
                          )
                        }
                        const colorClass = colorMap.get(slot.course_display) ?? SUBJECT_COLORS[0]
                        return (
                          <td key={day} className="p-2 md:p-3 align-top">
                            <div className={`rounded-lg border p-2 md:p-3 ${colorClass} transition-all hover:scale-[1.02]`}>
                              <p className="text-xs font-bold leading-tight truncate">{slot.course_display}</p>
                              {slot.location && (
                                <p className="text-[10px] mt-1 opacity-70 flex items-center gap-1">
                                  <span className="material-symbols-outlined text-[10px]">location_on</span>
                                  {slot.location}
                                </p>
                              )}
                            </div>
                          </td>
                        )
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>
    </PageLayout>
  )
}
