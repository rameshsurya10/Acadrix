import api from '@/lib/api'

// ── Types ─────────────────────────────────────────────────────────────

export interface DashboardStats {
  total_students: number
  total_teachers: number
  pending_admissions: number
  capacity_percent: number
  total_capacity: number
  unread_notifications: number
}

export interface AdmissionApplication {
  id: number
  application_id: string
  applicant_name: string
  applicant_email: string
  applicant_phone: string
  date_of_birth: string | null
  grade_applying: number | null
  grade_label: string | null
  program: string
  guardian_name: string
  guardian_phone: string
  guardian_email: string
  status: 'pending' | 'verified' | 'missing_documents' | 'approved' | 'rejected' | 'finalized'
  notes: string
  reviewed_by: number | null
  reviewed_by_name: string | null
  student_created: number | null
  applied_at: string
  updated_at: string
  documents: AdmissionDocument[]
}

export interface AdmissionApplicationListItem {
  id: number
  application_id: string
  applicant_name: string
  applicant_email: string
  grade_applying: number | null
  grade_label: string | null
  program: string
  status: string
  applied_at: string
  updated_at: string
}

export interface AdmissionDocument {
  id: number
  application: number
  doc_type: string
  file: string
  file_name: string
  status: 'pending' | 'verified' | 'missing'
  verified_at: string | null
  uploaded_at: string
}

export interface AdminNotification {
  id: number
  recipient: number
  title: string
  body: string
  priority: 'high' | 'normal' | 'low'
  category: string
  is_read: boolean
  created_at: string
}

export interface FacultyMember {
  id: number
  employee_id: string
  name: string
  email: string
  avatar_url: string | null
  department: string | null
  department_id: number | null
  title: string
  qualification: string
  specialization: string
  employment_status: string
  performance_score: number | null
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
  guardians: { id: number; parent_name: string; parent_email: string; relationship: string; is_primary: boolean }[]
  created_at: string
  updated_at: string
}

export interface AssessmentItem {
  id: number
  title: string
  teacher_name: string | null
  teacher_id: number | null
  subject_name: string | null
  section: string | null
  total_marks: number
  scheduled_date: string | null
  duration_minutes: number
  status: string
  created_at: string
}

export interface AssessmentStats {
  total: number
  drafts: number
  live: number
  scheduled: number
  pending_approval: number
  completed: number
}

export interface TuitionAccountItem {
  id: number
  student_id: string
  student_name: string
  section: string | null
  total_amount: string
  paid_amount: string
  outstanding: string
  status: 'paid' | 'pending' | 'overdue' | 'partial'
  due_date: string | null
  semester: string
}

export interface FinanceStats {
  total_revenue: string
  total_collected: string
  outstanding: string
  collection_rate: number
  total_accounts: number
  paid_count: number
  overdue_count: number
  pending_count: number
  partial_count: number
}

// ── Service ───────────────────────────────────────────────────────────

export const adminService = {
  // Dashboard
  async getDashboardStats(): Promise<DashboardStats> {
    const { data } = await api.get('/admin/dashboard-stats/')
    return data
  },

  // Admissions
  async getApplications(params?: Record<string, string>): Promise<{ results: AdmissionApplicationListItem[]; count: number }> {
    const { data } = await api.get('/admin/applications/', { params })
    return { results: data.results ?? data, count: data.count ?? data.length }
  },

  async getApplication(id: number): Promise<AdmissionApplication> {
    const { data } = await api.get(`/admin/applications/${id}/`)
    return data
  },

  async updateApplication(id: number, payload: Partial<AdmissionApplication>): Promise<AdmissionApplication> {
    const { data } = await api.patch(`/admin/applications/${id}/`, payload)
    return data
  },

  async updateDocumentStatus(applicationPk: number, docId: number, status: string): Promise<AdmissionDocument> {
    const { data } = await api.patch(`/admin/applications/${applicationPk}/documents/${docId}/`, { status })
    return data
  },

  // Notifications
  async getNotifications(params?: Record<string, string>): Promise<{ results: AdminNotification[]; count: number }> {
    const { data } = await api.get('/admin/notifications/', { params })
    return { results: data.results ?? data, count: data.count ?? data.length }
  },

  async markNotificationRead(id: number): Promise<void> {
    await api.patch(`/admin/notifications/${id}/mark_read/`)
  },

  async markAllNotificationsRead(): Promise<void> {
    await api.patch('/admin/notifications/mark_all_read/')
  },

  // Faculty (from shared)
  async getFaculty(params?: Record<string, string>): Promise<FacultyMember[]> {
    const { data } = await api.get('/shared/faculty/', { params })
    return data.data ?? data
  },

  // Students
  async getStudents(params?: Record<string, string>): Promise<{ results: StudentProfile[]; count: number }> {
    const { data } = await api.get('/student/profiles/', { params })
    return { results: data.results ?? data, count: data.count ?? data.length }
  },

  // Assessments (admin oversight)
  async getAssessments(params?: Record<string, string>): Promise<{ data: AssessmentItem[]; stats: AssessmentStats }> {
    const { data } = await api.get('/admin/assessments/', { params })
    return { data: data.data, stats: data.stats }
  },

  // Finance
  async getFinanceOverview(params?: Record<string, string>): Promise<{
    data: TuitionAccountItem[]
    stats: FinanceStats
    pagination: { total: number; page: number; page_size: number }
  }> {
    const { data } = await api.get('/admin/finance-overview/', { params })
    return { data: data.data, stats: data.stats, pagination: data.pagination }
  },

  // Shared data
  async getGrades(): Promise<{ id: number; level: number; label: string }[]> {
    const { data } = await api.get('/shared/grades/')
    return data.results ?? data
  },

  async getSections(params?: Record<string, string>): Promise<{ id: number; name: string; grade: number }[]> {
    const { data } = await api.get('/shared/sections/', { params })
    return data.results ?? data
  },
}
