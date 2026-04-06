import { useState, useEffect, useCallback } from 'react'
import PageLayout from '@/components/layout/PageLayout'
import TeacherEnrollmentForm, { type TeacherFormData } from '@/components/enrollment/TeacherEnrollmentForm'
import StudentEnrollmentForm, { type StudentFormData } from '@/components/enrollment/StudentEnrollmentForm'
import EnrollmentSuccessModal from '@/components/enrollment/EnrollmentSuccessModal'
import { adminEnrollmentService } from '@/services/admin/enrollmentService'
import api from '@/lib/api'

type Tab = 'admin' | 'principal' | 'teacher' | 'student'

interface SuccessState {
  role: 'admin' | 'principal' | 'teacher' | 'student'
  generatedId: string
  name: string
  email: string
  emailSent: boolean
}

interface Department {
  id: number
  name: string
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

const INPUT_CLASS = 'w-full px-4 py-3 bg-surface-container-low border-none rounded-lg focus:ring-2 focus:ring-primary text-sm'
const LABEL_CLASS = 'block text-xs font-bold uppercase tracking-wider text-on-surface-variant mb-2'

export default function AdminEnrollmentPage() {
  const [activeTab, setActiveTab] = useState<Tab>('teacher')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [departments, setDepartments] = useState<Department[]>([])
  const [sections, setSections] = useState<Section[]>([])
  const [successState, setSuccessState] = useState<SuccessState | null>(null)

  // Admin form state
  const [adminForm, setAdminForm] = useState({ first_name: '', last_name: '', email: '', phone: '' })
  // Principal form state
  const [principalForm, setPrincipalForm] = useState({
    first_name: '', last_name: '', email: '', phone: '',
    department_id: null as number | null, title: '', qualification: '',
    specialization: '', employment_status: 'full_time',
  })

  useEffect(() => {
    async function loadData() {
      try {
        const [deptRes, secRes] = await Promise.all([
          api.get('/shared/departments/'),
          api.get('/shared/sections/'),
        ])

        const deptData = deptRes.data.data ?? deptRes.data.results ?? deptRes.data
        setDepartments(Array.isArray(deptData) ? deptData : [])

        const secData = secRes.data.data ?? secRes.data.results ?? secRes.data
        const rawSections: SectionApiItem[] = Array.isArray(secData) ? secData : []
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
        // Endpoints may not exist yet — degrade gracefully
      }
    }
    loadData()
  }, [])

  const handleTeacherSubmit = useCallback(
    async (data: TeacherFormData) => {
      setIsLoading(true)
      setError(null)
      try {
        const result = await adminEnrollmentService.enrollTeacher({
          first_name: data.first_name, last_name: data.last_name,
          email: data.email, phone: data.phone || undefined,
          department: data.department_id, title: data.title || undefined,
          qualification: data.qualification || undefined,
          employment_status: (data.employment_status as 'full_time' | 'part_time' | 'contract') || undefined,
          employee_id: data.employee_id || undefined,
        })
        setSuccessState({
          role: 'teacher', generatedId: result.employee_id ?? '',
          name: `${data.first_name} ${data.last_name}`, email: data.email, emailSent: result.email_sent,
        })
      } catch (err: any) {
        setError(err?.response?.data?.email?.[0] || err?.response?.data?.error || 'Failed to enroll teacher.')
      } finally {
        setIsLoading(false)
      }
    }, [],
  )

  const handleStudentSubmit = useCallback(
    async (data: StudentFormData) => {
      setIsLoading(true)
      setError(null)
      try {
        const result = await adminEnrollmentService.enrollStudent({
          first_name: data.first_name, last_name: data.last_name,
          email: data.email, phone: data.phone || undefined,
          date_of_birth: data.date_of_birth || undefined, address: data.address || undefined,
          section: data.section_id, student_id: data.student_id || undefined,
          guardians: data.guardians.length ? data.guardians.map((g, i) => ({ ...g, is_primary: i === 0 })) : undefined,
        })
        setSuccessState({
          role: 'student', generatedId: result.student_id ?? '',
          name: `${data.first_name} ${data.last_name}`, email: data.email, emailSent: result.email_sent,
        })
      } catch (err: any) {
        setError(err?.response?.data?.email?.[0] || err?.response?.data?.error || 'Failed to enroll student.')
      } finally {
        setIsLoading(false)
      }
    }, [],
  )

  async function handlePrincipalSubmit(e: React.FormEvent) {
    e.preventDefault()
    setIsLoading(true)
    setError(null)
    try {
      const result = await adminEnrollmentService.enrollPrincipal({
        first_name: principalForm.first_name, last_name: principalForm.last_name,
        email: principalForm.email, phone: principalForm.phone || undefined,
        department: principalForm.department_id, title: principalForm.title || undefined,
        qualification: principalForm.qualification || undefined,
        specialization: principalForm.specialization || undefined,
        employment_status: principalForm.employment_status as 'full_time' | 'part_time' | 'contract',
      })
      setSuccessState({
        role: 'principal', generatedId: result.employee_id ?? '',
        name: `${principalForm.first_name} ${principalForm.last_name}`,
        email: principalForm.email, emailSent: result.email_sent,
      })
      setPrincipalForm({ first_name: '', last_name: '', email: '', phone: '', department_id: null, title: '', qualification: '', specialization: '', employment_status: 'full_time' })
    } catch (err: any) {
      setError(err?.response?.data?.email?.[0] || err?.response?.data?.error || 'Failed to enroll principal.')
    } finally {
      setIsLoading(false)
    }
  }

  async function handleAdminSubmit(e: React.FormEvent) {
    e.preventDefault()
    setIsLoading(true)
    setError(null)
    try {
      const result = await adminEnrollmentService.enrollAdmin({
        first_name: adminForm.first_name, last_name: adminForm.last_name,
        email: adminForm.email, phone: adminForm.phone || undefined,
      })
      setSuccessState({
        role: 'admin', generatedId: '',
        name: `${adminForm.first_name} ${adminForm.last_name}`,
        email: adminForm.email, emailSent: result.email_sent,
      })
      setAdminForm({ first_name: '', last_name: '', email: '', phone: '' })
    } catch (err: any) {
      setError(err?.response?.data?.email?.[0] || err?.response?.data?.error || 'Failed to enroll admin.')
    } finally {
      setIsLoading(false)
    }
  }

  function handleCloseModal() { setSuccessState(null) }
  function handleEnrollAnother() { setSuccessState(null) }

  const TABS: { key: Tab; label: string; icon: string }[] = [
    { key: 'admin', label: 'Admin', icon: 'admin_panel_settings' },
    { key: 'principal', label: 'Principal', icon: 'supervised_user_circle' },
    { key: 'teacher', label: 'Teacher', icon: 'school' },
    { key: 'student', label: 'Student', icon: 'person' },
  ]

  return (
    <PageLayout>
      <main className="max-w-3xl mx-auto px-4 md:px-6 py-6 md:py-10 pb-32">
        {/* Header */}
        <div className="mb-6 md:mb-8">
          <span className="font-label text-xs font-semibold tracking-widest text-on-surface-variant uppercase mb-2 block">
            Enrollment Management
          </span>
          <h2 className="font-headline font-extrabold text-3xl md:text-4xl text-on-surface tracking-tight">
            Enroll Personnel
          </h2>
          <p className="text-on-surface-variant text-sm mt-2">
            Register new admins, principals, teachers, or students into the institution.
          </p>
        </div>

        {/* Tab toggle */}
        <div className="flex bg-surface-container-high rounded-full p-1 mb-6 md:mb-8 w-full md:w-fit overflow-x-auto">
          {TABS.map(tab => (
            <button
              key={tab.key}
              type="button"
              onClick={() => { setActiveTab(tab.key); setError(null) }}
              className={`flex-1 md:flex-none px-4 md:px-6 py-2.5 rounded-full text-sm font-bold transition-all whitespace-nowrap ${
                activeTab === tab.key
                  ? 'bg-primary text-on-primary shadow-md'
                  : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              <span className="flex items-center justify-center gap-2">
                <span className="material-symbols-outlined text-lg">{tab.icon}</span>
                <span className="hidden sm:inline">{tab.label}</span>
              </span>
            </button>
          ))}
        </div>

        {/* Error */}
        {error && (
          <div className="mb-6 flex items-center gap-2 rounded-lg bg-error-container/40 border border-error/20 px-4 py-3">
            <span className="material-symbols-outlined text-error text-lg">error</span>
            <span className="text-sm text-on-error-container">{error}</span>
          </div>
        )}

        {/* Form container */}
        <div className="bg-surface-container-lowest rounded-2xl p-5 sm:p-8 shadow-sm">
          {activeTab === 'teacher' ? (
            <TeacherEnrollmentForm onSubmit={handleTeacherSubmit} isLoading={isLoading} departments={departments} />
          ) : activeTab === 'student' ? (
            <StudentEnrollmentForm onSubmit={handleStudentSubmit} isLoading={isLoading} sections={sections} />
          ) : activeTab === 'principal' ? (
            <form onSubmit={handlePrincipalSubmit} className="space-y-6">
              <h3 className="font-headline font-bold text-xl text-on-surface">Enroll New Principal</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className={LABEL_CLASS}>First Name *</label>
                  <input className={INPUT_CLASS} required value={principalForm.first_name}
                    onChange={e => setPrincipalForm(p => ({ ...p, first_name: e.target.value }))} placeholder="First name" />
                </div>
                <div>
                  <label className={LABEL_CLASS}>Last Name *</label>
                  <input className={INPUT_CLASS} required value={principalForm.last_name}
                    onChange={e => setPrincipalForm(p => ({ ...p, last_name: e.target.value }))} placeholder="Last name" />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className={LABEL_CLASS}>Email *</label>
                  <input className={INPUT_CLASS} type="email" required value={principalForm.email}
                    onChange={e => setPrincipalForm(p => ({ ...p, email: e.target.value }))} placeholder="Email address" />
                </div>
                <div>
                  <label className={LABEL_CLASS}>Phone</label>
                  <input className={INPUT_CLASS} value={principalForm.phone}
                    onChange={e => setPrincipalForm(p => ({ ...p, phone: e.target.value }))} placeholder="Phone number" />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className={LABEL_CLASS}>Department</label>
                  <select className={INPUT_CLASS} value={principalForm.department_id ?? ''}
                    onChange={e => setPrincipalForm(p => ({ ...p, department_id: e.target.value ? Number(e.target.value) : null }))}>
                    <option value="">Select department</option>
                    {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className={LABEL_CLASS}>Title</label>
                  <input className={INPUT_CLASS} value={principalForm.title}
                    onChange={e => setPrincipalForm(p => ({ ...p, title: e.target.value }))} placeholder="e.g. Vice Principal" />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className={LABEL_CLASS}>Qualification</label>
                  <input className={INPUT_CLASS} value={principalForm.qualification}
                    onChange={e => setPrincipalForm(p => ({ ...p, qualification: e.target.value }))} placeholder="e.g. PhD Education" />
                </div>
                <div>
                  <label className={LABEL_CLASS}>Employment Status</label>
                  <select className={INPUT_CLASS} value={principalForm.employment_status}
                    onChange={e => setPrincipalForm(p => ({ ...p, employment_status: e.target.value }))}>
                    <option value="full_time">Full-time</option>
                    <option value="part_time">Part-time</option>
                    <option value="contract">Contract</option>
                  </select>
                </div>
              </div>
              <button type="submit" disabled={isLoading}
                className="w-full bg-primary text-on-primary font-headline font-bold py-3.5 rounded-xl hover:bg-primary/90 shadow-lg shadow-primary/20 disabled:opacity-60 text-sm mt-2">
                {isLoading ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="w-5 h-5 border-2 border-on-primary/30 border-t-on-primary rounded-full animate-spin" />
                    Enrolling...
                  </span>
                ) : 'Enroll Principal'}
              </button>
            </form>
          ) : (
            /* Admin form */
            <form onSubmit={handleAdminSubmit} className="space-y-6">
              <h3 className="font-headline font-bold text-xl text-on-surface">Enroll New Admin</h3>
              <p className="text-sm text-on-surface-variant">Admins have full system access including financial authority, HR management, and enrollment capabilities.</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className={LABEL_CLASS}>First Name *</label>
                  <input className={INPUT_CLASS} required value={adminForm.first_name}
                    onChange={e => setAdminForm(p => ({ ...p, first_name: e.target.value }))} placeholder="First name" />
                </div>
                <div>
                  <label className={LABEL_CLASS}>Last Name *</label>
                  <input className={INPUT_CLASS} required value={adminForm.last_name}
                    onChange={e => setAdminForm(p => ({ ...p, last_name: e.target.value }))} placeholder="Last name" />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className={LABEL_CLASS}>Email *</label>
                  <input className={INPUT_CLASS} type="email" required value={adminForm.email}
                    onChange={e => setAdminForm(p => ({ ...p, email: e.target.value }))} placeholder="Email address" />
                </div>
                <div>
                  <label className={LABEL_CLASS}>Phone</label>
                  <input className={INPUT_CLASS} value={adminForm.phone}
                    onChange={e => setAdminForm(p => ({ ...p, phone: e.target.value }))} placeholder="Phone number" />
                </div>
              </div>
              <div className="bg-primary/5 rounded-xl p-4 border border-primary/10">
                <div className="flex items-center gap-2 mb-2">
                  <span className="material-symbols-outlined text-primary text-lg">info</span>
                  <span className="text-sm font-bold text-on-surface">Note</span>
                </div>
                <p className="text-xs text-on-surface-variant">The new admin will receive a welcome email with instructions to set their password. They will have full system access once activated.</p>
              </div>
              <button type="submit" disabled={isLoading}
                className="w-full bg-primary text-on-primary font-headline font-bold py-3.5 rounded-xl hover:bg-primary/90 shadow-lg shadow-primary/20 disabled:opacity-60 text-sm mt-2">
                {isLoading ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="w-5 h-5 border-2 border-on-primary/30 border-t-on-primary rounded-full animate-spin" />
                    Enrolling...
                  </span>
                ) : 'Enroll Admin'}
              </button>
            </form>
          )}
        </div>
      </main>

      {/* Success modal */}
      {successState && (
        <EnrollmentSuccessModal
          isOpen
          onClose={handleCloseModal}
          onEnrollAnother={handleEnrollAnother}
          role={successState.role}
          generatedId={successState.generatedId}
          name={successState.name}
          email={successState.email}
          emailSent={successState.emailSent}
        />
      )}
    </PageLayout>
  )
}
