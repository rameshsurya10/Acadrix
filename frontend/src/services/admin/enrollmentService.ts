import api from '@/lib/api'
import type { AuthUser } from '@/contexts/AuthContext'

interface EnrollTeacherRequest {
  first_name: string
  last_name: string
  email: string
  phone?: string
  department?: number | null
  title?: string
  qualification?: string
  specialization?: string
  date_joined?: string | null
  employment_status?: 'full_time' | 'part_time' | 'contract'
  employee_id?: string | null
}

interface EnrollStudentRequest {
  first_name: string
  last_name: string
  email: string
  phone?: string
  date_of_birth?: string | null
  address?: string
  section?: number | null
  house?: string
  student_id?: string | null
  guardians?: { name: string; relationship: string; phone?: string; email?: string; is_primary: boolean }[]
}

interface EnrollmentResponse {
  success: true
  data: { user: AuthUser; employee_id?: string; student_id?: string; email_sent: boolean }
  message: string
}

interface EnrollPrincipalRequest {
  first_name: string
  last_name: string
  email: string
  phone?: string
  department?: number | null
  title?: string
  qualification?: string
  specialization?: string
  date_joined?: string | null
  employment_status?: 'full_time' | 'part_time' | 'contract'
  employee_id?: string | null
}

interface EnrollAdminRequest {
  first_name: string
  last_name: string
  email: string
  phone?: string
}

export const adminEnrollmentService = {
  async enrollTeacher(data: EnrollTeacherRequest): Promise<EnrollmentResponse['data']> {
    const { data: response } = await api.post<EnrollmentResponse>('/admin/enroll/teacher/', data)
    return response.data
  },

  async enrollStudent(data: EnrollStudentRequest): Promise<EnrollmentResponse['data']> {
    const { data: response } = await api.post<EnrollmentResponse>('/admin/enroll/student/', data)
    return response.data
  },

  async enrollPrincipal(data: EnrollPrincipalRequest): Promise<EnrollmentResponse['data']> {
    const { data: response } = await api.post<EnrollmentResponse>('/admin/enroll/principal/', data)
    return response.data
  },

  async enrollAdmin(data: EnrollAdminRequest): Promise<EnrollmentResponse['data']> {
    const { data: response } = await api.post<EnrollmentResponse>('/admin/enroll/admin/', data)
    return response.data
  },
}
