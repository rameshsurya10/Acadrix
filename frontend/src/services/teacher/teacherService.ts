import api from '@/lib/api'

// ── Types ─────────────────────────────────────────────────────────────

export interface TeacherDashboardData {
  assignments: { total: number; active: number }
  assessments: { total: number; by_status: Record<string, number> }
  grading: { total_students_graded: number; average_score: number | null }
  health: { total_observations: number; students_observed: number }
}

export interface AssessmentItem {
  id: number
  title: string
  course: number
  course_name: string
  subject: number
  subject_name: string
  total_marks: number
  scheduled_date: string | null
  duration_minutes: number
  status: string
  created_at: string
}

export interface GradeEntry {
  id: number
  student: number
  student_name: string
  assessment: number
  marks_obtained: string
  letter_grade: string
  remarks: string
  graded_by: number
  graded_at: string
}

export interface AssignmentItem {
  id: number
  title: string
  description: string
  course: number
  course_name: string
  teacher: number
  due_date: string
  status: string
  created_at: string
}

export interface HealthObservation {
  id: number
  student: number
  student_name: string
  teacher: number
  teacher_name: string
  observation: string
  created_at: string
}

// ── Helpers ───────────────────────────────────────────────────────────

/** Normalize backend responses that may be wrapped in {success, data} or paginated {count, results}. */
function unwrap<T>(raw: Record<string, unknown>): T {
  if ('results' in raw) return raw as unknown as T
  if ('data' in raw) return raw.data as T
  return raw as unknown as T
}

function unwrapList<T>(raw: Record<string, unknown>): { results: T[]; count: number } {
  if ('results' in raw && Array.isArray(raw.results)) {
    return { results: raw.results as T[], count: (raw.count as number) ?? (raw.results as T[]).length }
  }
  if ('data' in raw && Array.isArray(raw.data)) {
    return { results: raw.data as T[], count: (raw.data as T[]).length }
  }
  if (Array.isArray(raw)) {
    return { results: raw as unknown as T[], count: (raw as unknown as T[]).length }
  }
  return { results: [], count: 0 }
}

export interface TeacherSection {
  id: number
  name: string
  grade_label: string
  display_name: string
}

export interface TeacherAttendanceRecord {
  student_id: number
  student_name: string
  is_present: boolean
  remarks: string
}

export interface BulkAttendancePayload {
  section_id: number
  date: string
  records: { student_id: number; is_present: boolean; remarks: string }[]
}

// ── Service ───────────────────────────────────────────────────────────

export const teacherService = {
  // ── Dashboard ──────────────────────────────────────────────────────
  async getDashboard(): Promise<TeacherDashboardData> {
    const { data } = await api.get('/teacher/dashboard/')
    return unwrap<TeacherDashboardData>(data)
  },

  // ── Assessments ────────────────────────────────────────────────────
  async getAssessments(params?: Record<string, string>): Promise<{ results: AssessmentItem[]; count: number }> {
    const { data } = await api.get('/teacher/assessments/', { params })
    return unwrapList<AssessmentItem>(data)
  },

  async createAssessment(payload: Partial<AssessmentItem>): Promise<AssessmentItem> {
    const { data } = await api.post('/teacher/assessments/', payload)
    return data
  },

  async updateAssessment(id: number, payload: Partial<AssessmentItem>): Promise<AssessmentItem> {
    const { data } = await api.patch(`/teacher/assessments/${id}/`, payload)
    return data
  },

  async deleteAssessment(id: number): Promise<void> {
    await api.delete(`/teacher/assessments/${id}/`)
  },

  // ── Grades ─────────────────────────────────────────────────────────
  async getGradeEntries(params?: Record<string, string>): Promise<{ results: GradeEntry[]; count: number }> {
    const { data } = await api.get('/teacher/grades/', { params })
    return unwrapList<GradeEntry>(data)
  },

  async createGradeEntry(payload: Partial<GradeEntry>): Promise<GradeEntry> {
    const { data } = await api.post('/teacher/grades/', payload)
    return data
  },

  async updateGradeEntry(id: number, payload: Partial<GradeEntry>): Promise<GradeEntry> {
    const { data } = await api.patch(`/teacher/grades/${id}/`, payload)
    return data
  },

  // ── Assignments ────────────────────────────────────────────────────
  async getAssignments(params?: Record<string, string>): Promise<{ results: AssignmentItem[]; count: number }> {
    const { data } = await api.get('/teacher/assignments/', { params })
    return unwrapList<AssignmentItem>(data)
  },

  async createAssignment(payload: Partial<AssignmentItem>): Promise<AssignmentItem> {
    const { data } = await api.post('/teacher/assignments/', payload)
    return data
  },

  async updateAssignment(id: number, payload: Partial<AssignmentItem>): Promise<AssignmentItem> {
    const { data } = await api.patch(`/teacher/assignments/${id}/`, payload)
    return data
  },

  async deleteAssignment(id: number): Promise<void> {
    await api.delete(`/teacher/assignments/${id}/`)
  },

  // ── Health Observations ────────────────────────────────────────────
  async getHealthObservations(params?: Record<string, string>): Promise<{ results: HealthObservation[]; count: number }> {
    const { data } = await api.get('/teacher/health-observations/', { params })
    return unwrapList<HealthObservation>(data)
  },

  async createHealthObservation(payload: { student: number; observation: string }): Promise<HealthObservation> {
    const { data } = await api.post('/teacher/health-observations/', payload)
    return data
  },

  // ── Shared lookups (for dropdowns) ─────────────────────────────────
  async getCourses(): Promise<{ id: number; subject_name: string; section_display: string }[]> {
    const { data } = await api.get('/shared/courses/')
    return data.results ?? data
  },

  async getSubjects(): Promise<{ id: number; name: string; code: string }[]> {
    const { data } = await api.get('/shared/subjects/')
    return data.results ?? data
  },

  async getStudentProfiles(params?: Record<string, string>): Promise<{ id: number; full_name: string; student_id: string }[]> {
    const { data } = await api.get('/student/profiles/', { params })
    const list = data.results ?? data
    return list
  },

  // ── Sections (derived from courses) ────────────────────────────────
  async getMySections(): Promise<TeacherSection[]> {
    const courses = await this.getCourses()
    const sectionMap = new Map<string, TeacherSection>()
    for (const c of courses) {
      const display = c.section_display ?? `Section ${c.id}`
      if (!sectionMap.has(display)) {
        sectionMap.set(display, {
          id: c.id,
          name: display,
          grade_label: display,
          display_name: display,
        })
      }
    }
    return Array.from(sectionMap.values())
  },

  // ── Attendance ─────────────────────────────────────────────────────
  async getAttendance(params: { section_id: string; date: string }): Promise<TeacherAttendanceRecord[]> {
    const { data } = await api.get('/teacher/attendance/', { params })
    const list = data.results ?? data.data ?? data
    return Array.isArray(list) ? list : []
  },

  async bulkMarkAttendance(payload: BulkAttendancePayload): Promise<{ count: number }> {
    const { data } = await api.post('/teacher/attendance/bulk-mark/', payload)
    return data
  },
}
