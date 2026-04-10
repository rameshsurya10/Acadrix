import api from '@/lib/api'

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

export interface StudentDashboardData {
  profile: { student_id: string; full_name: string; section: string | null; house: string }
  attendance: { total_days: number; present_days: number; percentage: number }
  upcoming_schedule: {
    subject: string
    teacher: string | null
    day: string
    start_time: string
    end_time: string
    location: string
  }[]
  activities: { id: number; name: string; role: string; schedule: string }[]
  tuition: {
    total_amount: string
    paid_amount: string
    outstanding_balance: string
    status: string
    due_date: string | null
    semester: string
  } | null
}

export interface StudentProfile {
  id: number
  student_id: string
  full_name: string
  email: string
  avatar_url: string | null
  section: number | null
  section_detail: {
    id: number
    name: string
    grade: { id: number; level: number; label: string }
    capacity: number
  } | null
  house: string
  date_of_birth: string | null
  address: string
  enrollment_date: string | null
  is_active: boolean
  guardians: {
    id: number
    name: string
    email: string
    phone: string
    relationship: string
    is_primary: boolean
  }[]
}

export interface TuitionAccount {
  id: number
  total_amount: string
  paid_amount: string
  outstanding_balance: string
  status: string
  due_date: string | null
  semester: string
  line_items: {
    id: number
    description: string
    amount: string
    credit_hours: number | null
    rate_per_hour: string | null
  }[]
}

export interface PaymentItem {
  id: number
  receipt_id: string
  amount: string
  method: string
  paid_by_name: string | null
  paid_at: string
  notes: string
}

export interface AttendanceRecord {
  id: number
  date: string
  is_present: boolean
  remarks: string
}

export interface DocumentItem {
  id: number
  doc_type: string
  file_url: string | null
  file_name: string
  file_size_bytes: number
  status: string
  verified_by_name: string | null
  uploaded_at: string
}

export interface Activity {
  id: number
  name: string
  role: string
  schedule: string
  is_active: boolean
}

export interface GradeResult {
  assessment_title: string
  subject_name: string
  section: string
  marks_obtained: string
  total_marks: number
  letter_grade: string
  remarks: string
  graded_at: string
}

/* ------------------------------------------------------------------ */
/*  Service                                                            */
/* ------------------------------------------------------------------ */

export const studentService = {
  /** Aggregated dashboard data. */
  async getDashboard(): Promise<StudentDashboardData> {
    const { data } = await api.get<{ data: StudentDashboardData }>('/student/dashboard/')
    return data.data
  },

  /** Student's own profile (API returns a list scoped to the logged-in user). */
  async getProfile(): Promise<StudentProfile> {
    const { data } = await api.get<{ results: StudentProfile[] }>('/student/profiles/')
    return data.results[0]
  },

  /** Partial update of own profile. */
  async updateProfile(id: number, payload: Partial<StudentProfile>): Promise<StudentProfile> {
    const { data } = await api.patch<StudentProfile>(`/student/profiles/${id}/`, payload)
    return data
  },

  /** Tuition account with line items. */
  async getTuition(): Promise<TuitionAccount> {
    const { data } = await api.get<{ data: TuitionAccount }>('/student/tuition/')
    return data.data
  },

  /** Payment history. */
  async getPayments(): Promise<PaymentItem[]> {
    const { data } = await api.get<{ results: PaymentItem[] }>('/student/payments/')
    return data.results
  },

  /** Attendance records. */
  async getAttendance(): Promise<AttendanceRecord[]> {
    const { data } = await api.get<{ results: AttendanceRecord[] }>('/student/attendance/')
    return data.results
  },

  /** Verification / uploaded documents. */
  async getDocuments(): Promise<DocumentItem[]> {
    const { data } = await api.get<{ results: DocumentItem[] }>('/student/documents/')
    return data.results
  },

  /** Upload a new document (multipart/form-data). */
  async uploadDocument(formData: FormData): Promise<DocumentItem> {
    const { data } = await api.post<DocumentItem>('/student/documents/', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    return data
  },

  /** Delete a document. */
  async deleteDocument(id: number): Promise<void> {
    await api.delete(`/student/documents/${id}/`)
  },

  /** Extracurricular activities. */
  async getActivities(): Promise<Activity[]> {
    const { data } = await api.get<{ results: Activity[] }>('/student/activities/')
    return data.results
  },

  /** Create a new activity. */
  async createActivity(payload: Omit<Activity, 'id' | 'is_active'>): Promise<Activity> {
    const { data } = await api.post<Activity>('/student/activities/', payload)
    return data
  },

  /** Update an activity. */
  async updateActivity(id: number, payload: Partial<Activity>): Promise<Activity> {
    const { data } = await api.patch<Activity>(`/student/activities/${id}/`, payload)
    return data
  },

  /** Delete an activity. */
  async deleteActivity(id: number): Promise<void> {
    await api.delete(`/student/activities/${id}/`)
  },

  /** Grades / test results. */
  async getGrades(): Promise<GradeResult[]> {
    const { data } = await api.get('/student/grades/')
    return data.data ?? data.results ?? data
  },
}
