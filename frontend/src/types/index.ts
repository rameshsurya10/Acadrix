// ─── Shared ─────────────────────────────────────────────────────────────────

export type Role = 'admin' | 'principal' | 'teacher' | 'student'

export interface PaginatedResponse<T> {
  count: number
  next: string | null
  previous: string | null
  results: T[]
}

// ─── Users ──────────────────────────────────────────────────────────────────

export interface User {
  id: number
  email: string
  full_name: string
  role: Role
  avatar_url?: string
  is_active: boolean
}

// ─── Student ─────────────────────────────────────────────────────────────────

export interface Student {
  id: number
  user: User
  student_id: string
  grade: string
  section: string
  house: string
  gpa: number
  attendance_pct: number
}

// ─── Teacher / Faculty ───────────────────────────────────────────────────────

export interface Faculty {
  id: number
  user: User
  employee_id: string
  department: string
  designation: string
  salary: number
  performance_rating: number
  tenure_years: number
}

// ─── Assessment ──────────────────────────────────────────────────────────────

export interface Test {
  id: number
  title: string
  subject: string
  grade: string
  status: 'draft' | 'scheduled' | 'live' | 'completed'
  total_marks: number
  created_by: number
  scheduled_at?: string
}

export interface TestResult {
  id: number
  student: Student
  test: Test
  marks_obtained: number
  grade_label: string
  rank: number
  percentile: number
}

// ─── Finance ─────────────────────────────────────────────────────────────────

export interface Invoice {
  id: number
  student: Student
  title: string
  amount: number
  due_date: string
  status: 'paid' | 'pending' | 'overdue'
}

// ─── Messaging ───────────────────────────────────────────────────────────────

export interface Message {
  id: number
  sender: User
  recipient: User
  subject: string
  body: string
  is_read: boolean
  created_at: string
}
