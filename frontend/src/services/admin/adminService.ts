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
  guardians: { id: number; name: string; email: string; phone: string; relationship: string; is_primary: boolean }[]
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

// ── Academic Structure ────────────────────────────────────────────────

export interface AcademicYear {
  id: number
  label: string
  start_date: string
  end_date: string
  is_current: boolean
  created_at: string
}

export interface Grade {
  id: number
  level: number
  label: string
  created_at: string
}

export interface Section {
  id: number
  grade: number
  grade_label: string
  name: string
  display_name: string
  capacity: number
  academic_year: number
  created_at: string
}

export interface Subject {
  id: number
  name: string
  code: string
  department: number
  department_name: string
  is_active: boolean
  created_at: string
}

export interface Department {
  id: number
  name: string
  code: string
  description: string
  is_active: boolean
}

export interface Course {
  id: number
  subject: number
  subject_name: string
  section: number
  section_display: string
  teacher: number | null
  teacher_name: string | null
  academic_year: number
  location: string
}

// ── Finance: Fee Templates & Discounts ──────────────────────────────

export interface FeeTemplate {
  id: number
  grade: number
  grade_label: string
  academic_year: number
  academic_year_label: string
  name: string
  due_date: string | null
  is_active: boolean
  total_amount: string
  items: FeeTemplateItem[]
  created_at: string
  updated_at: string
}

export interface FeeTemplateItem {
  id?: number
  description: string
  amount: string
  is_optional: boolean
  order: number
}

export interface StudentDiscountItem {
  id: number
  student: number
  student_name: string
  discount_type: string
  description: string
  amount: string
  applied_by: number | null
  applied_by_name: string | null
  created_at: string
}

export interface RecordPaymentRequest {
  student_id: number
  amount: number
  method: string
  notes?: string
}

export interface RecordPaymentResponse {
  receipt_id: string
  amount: string
  method: string
  paid_at: string
}

export interface FeeDefaulter {
  student_id: string
  student_name: string
  section: string | null
  total_amount: string
  paid_amount: string
  outstanding_balance: string
  status: string
  due_date: string | null
  days_overdue: number
}

export interface PaymentReceipt {
  receipt_number: string
  school_name: string
  school_address: string
  student_name: string
  student_id: string
  section: string
  amount: string
  method: string
  paid_at: string
  paid_by_name: string
  notes: string
  balance_after: string
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

  // ── Academic Structure CRUD ─────────────────────────────────────────

  // Academic Years
  async getAcademicYears(): Promise<AcademicYear[]> {
    const { data } = await api.get('/shared/academic-years/')
    return data.results ?? data
  },
  async createAcademicYear(payload: Partial<AcademicYear>): Promise<AcademicYear> {
    const { data } = await api.post('/shared/academic-years/', payload)
    return data
  },
  async updateAcademicYear(id: number, payload: Partial<AcademicYear>): Promise<AcademicYear> {
    const { data } = await api.patch(`/shared/academic-years/${id}/`, payload)
    return data
  },
  async deleteAcademicYear(id: number): Promise<void> {
    await api.delete(`/shared/academic-years/${id}/`)
  },

  // Grades
  async getGrades(): Promise<Grade[]> {
    const { data } = await api.get('/shared/grades/')
    return data.results ?? data
  },
  async createGrade(payload: Partial<Grade>): Promise<Grade> {
    const { data } = await api.post('/shared/grades/', payload)
    return data
  },
  async updateGrade(id: number, payload: Partial<Grade>): Promise<Grade> {
    const { data } = await api.patch(`/shared/grades/${id}/`, payload)
    return data
  },
  async deleteGrade(id: number): Promise<void> {
    await api.delete(`/shared/grades/${id}/`)
  },

  // Sections
  async getSections(params?: Record<string, string>): Promise<Section[]> {
    const { data } = await api.get('/shared/sections/', { params })
    return data.results ?? data
  },
  async createSection(payload: Partial<Section>): Promise<Section> {
    const { data } = await api.post('/shared/sections/', payload)
    return data
  },
  async updateSection(id: number, payload: Partial<Section>): Promise<Section> {
    const { data } = await api.patch(`/shared/sections/${id}/`, payload)
    return data
  },
  async deleteSection(id: number): Promise<void> {
    await api.delete(`/shared/sections/${id}/`)
  },

  // Subjects
  async getSubjects(params?: Record<string, string>): Promise<Subject[]> {
    const { data } = await api.get('/shared/subjects/', { params })
    return data.results ?? data
  },
  async createSubject(payload: Partial<Subject>): Promise<Subject> {
    const { data } = await api.post('/shared/subjects/', payload)
    return data
  },
  async updateSubject(id: number, payload: Partial<Subject>): Promise<Subject> {
    const { data } = await api.patch(`/shared/subjects/${id}/`, payload)
    return data
  },
  async deleteSubject(id: number): Promise<void> {
    await api.delete(`/shared/subjects/${id}/`)
  },

  // Departments
  async getDepartments(): Promise<Department[]> {
    const { data } = await api.get('/shared/departments/')
    return data.results ?? data
  },
  async createDepartment(payload: Partial<Department>): Promise<Department> {
    const { data } = await api.post('/shared/departments/', payload)
    return data
  },
  async updateDepartment(id: number, payload: Partial<Department>): Promise<Department> {
    const { data } = await api.patch(`/shared/departments/${id}/`, payload)
    return data
  },
  async deleteDepartment(id: number): Promise<void> {
    await api.delete(`/shared/departments/${id}/`)
  },

  // Courses
  async getCourses(params?: Record<string, string>): Promise<Course[]> {
    const { data } = await api.get('/shared/courses/', { params })
    return data.results ?? data
  },
  async createCourse(payload: Partial<Course>): Promise<Course> {
    const { data } = await api.post('/shared/courses/', payload)
    return data
  },
  async updateCourse(id: number, payload: Partial<Course>): Promise<Course> {
    const { data } = await api.patch(`/shared/courses/${id}/`, payload)
    return data
  },
  async deleteCourse(id: number): Promise<void> {
    await api.delete(`/shared/courses/${id}/`)
  },

  // ── Fee Templates ───────────────────────────────────────────────────

  async getFeeTemplates(params?: Record<string, string>): Promise<{ results: FeeTemplate[]; count: number }> {
    const { data } = await api.get('/admin/fee-templates/', { params })
    return { results: data.results ?? data, count: data.count ?? data.length }
  },

  async createFeeTemplate(payload: Partial<FeeTemplate>): Promise<FeeTemplate> {
    const { data } = await api.post('/admin/fee-templates/', payload)
    return data
  },

  async updateFeeTemplate(id: number, payload: Partial<FeeTemplate>): Promise<FeeTemplate> {
    const { data } = await api.patch(`/admin/fee-templates/${id}/`, payload)
    return data
  },

  async deleteFeeTemplate(id: number): Promise<void> {
    await api.delete(`/admin/fee-templates/${id}/`)
  },

  async applyFeeTemplate(templateId: number): Promise<{ success: boolean; message: string; count: number }> {
    const { data } = await api.post('/admin/apply-fee-template/', { template_id: templateId })
    return data
  },

  // ── Student Discounts ───────────────────────────────────────────────

  async getDiscounts(params?: Record<string, string>): Promise<{ results: StudentDiscountItem[]; count: number }> {
    const { data } = await api.get('/admin/discounts/', { params })
    return { results: data.results ?? data, count: data.count ?? data.length }
  },

  async createDiscount(payload: Partial<StudentDiscountItem>): Promise<StudentDiscountItem> {
    const { data } = await api.post('/admin/discounts/', payload)
    return data
  },

  async deleteDiscount(id: number): Promise<void> {
    await api.delete(`/admin/discounts/${id}/`)
  },

  // ── Record Payment ──────────────────────────────────────────────────

  async recordPayment(payload: RecordPaymentRequest): Promise<{ success: boolean; data: RecordPaymentResponse; message: string }> {
    const { data } = await api.post('/admin/record-payment/', payload)
    return data
  },

  // ── Fee Defaulters ──────────────────────────────────────────────────

  async getFeeDefaulters(params?: Record<string, string>): Promise<FeeDefaulter[]> {
    const { data } = await api.get('/admin/fee-defaulters/', { params })
    return data.data ?? data.results ?? data
  },

  // ── Payment Receipt ─────────────────────────────────────────────────

  async getPaymentReceipt(paymentId: number): Promise<PaymentReceipt> {
    const { data } = await api.get(`/admin/payments/${paymentId}/receipt/`)
    return data.data
  },
}
