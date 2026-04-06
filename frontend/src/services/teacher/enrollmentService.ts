import api from '@/lib/api'
import type { AuthUser } from '@/contexts/AuthContext'

interface TeacherEnrollStudentRequest {
  first_name: string
  last_name: string
  email: string
  phone?: string
  date_of_birth?: string | null
  address?: string
  section: number
  house?: string
  student_id?: string | null
  guardians?: { name: string; relationship: string; phone?: string; email?: string; is_primary: boolean }[]
}

interface EnrollmentResponse {
  success: true
  data: { user: AuthUser; student_id: string; email_sent: boolean }
  message: string
}

export const teacherEnrollmentService = {
  async enrollStudent(data: TeacherEnrollStudentRequest): Promise<EnrollmentResponse['data']> {
    const { data: response } = await api.post<EnrollmentResponse>('/teacher/enroll/student/', data)
    return response.data
  },
}
