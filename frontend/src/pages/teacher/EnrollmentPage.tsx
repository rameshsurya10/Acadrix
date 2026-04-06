import { useState, useEffect, useCallback } from 'react'
import PageLayout from '@/components/layout/PageLayout'
import StudentEnrollmentForm, { type StudentFormData } from '@/components/enrollment/StudentEnrollmentForm'
import EnrollmentSuccessModal from '@/components/enrollment/EnrollmentSuccessModal'
import { teacherEnrollmentService } from '@/services/teacher/enrollmentService'
import api from '@/lib/api'

interface SuccessState {
  generatedId: string
  name: string
  email: string
  emailSent: boolean
}

interface Section {
  id: number
  label: string
}

interface SectionApiItem {
  id: number
  name: string
  grade?: { name: string } | null
  grade_name?: string
}

export default function TeacherEnrollmentPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [sections, setSections] = useState<Section[]>([])
  const [successState, setSuccessState] = useState<SuccessState | null>(null)

  useEffect(() => {
    async function loadSections() {
      try {
        const res = await api.get<{ data: SectionApiItem[] }>('/teacher/my-sections/')
        const rawSections: SectionApiItem[] = res.data.data ?? (res.data as unknown as SectionApiItem[])
        setSections(
          rawSections.map((s) => ({
            id: s.id,
            label: s.grade_name
              ? `${s.grade_name}-${s.name}`
              : s.grade?.name
                ? `${s.grade.name}-${s.name}`
                : s.name,
          })),
        )
      } catch {
        // Endpoint may not exist yet — degrade gracefully
      }
    }
    loadSections()
  }, [])

  const handleStudentSubmit = useCallback(
    async (data: StudentFormData) => {
      setIsLoading(true)
      try {
        const result = await teacherEnrollmentService.enrollStudent({
          first_name: data.first_name,
          last_name: data.last_name,
          email: data.email,
          phone: data.phone || undefined,
          date_of_birth: data.date_of_birth || undefined,
          address: data.address || undefined,
          section: data.section_id as number,
          student_id: data.student_id || undefined,
          guardians: data.guardians.length
            ? data.guardians.map((g, i) => ({ ...g, is_primary: i === 0 }))
            : undefined,
        })

        setSuccessState({
          generatedId: result.student_id ?? '',
          name: `${data.first_name} ${data.last_name}`,
          email: data.email,
          emailSent: result.email_sent,
        })
      } finally {
        setIsLoading(false)
      }
    },
    [],
  )

  function handleCloseModal() {
    setSuccessState(null)
  }

  function handleEnrollAnother() {
    setSuccessState(null)
  }

  return (
    <PageLayout>
      <main className="max-w-3xl mx-auto px-6 py-10 pb-32">
        {/* Header */}
        <div className="mb-8">
          <span className="font-label text-xs font-semibold tracking-widest text-on-surface-variant uppercase mb-2 block">
            Student Enrollment
          </span>
          <h2 className="font-headline font-extrabold text-4xl text-on-surface tracking-tight">
            Enroll Student
          </h2>
          <p className="text-on-surface-variant text-sm mt-2">
            Register a new student into your section.
          </p>
        </div>

        {/* Form container */}
        <div className="bg-surface-container-lowest rounded-2xl p-6 sm:p-8 shadow-sm">
          <StudentEnrollmentForm
            onSubmit={handleStudentSubmit}
            isLoading={isLoading}
            sections={sections}
            sectionRequired
          />
        </div>
      </main>

      {/* Success modal */}
      {successState && (
        <EnrollmentSuccessModal
          isOpen
          onClose={handleCloseModal}
          onEnrollAnother={handleEnrollAnother}
          role="student"
          generatedId={successState.generatedId}
          name={successState.name}
          email={successState.email}
          emailSent={successState.emailSent}
        />
      )}
    </PageLayout>
  )
}
