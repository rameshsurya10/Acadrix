import { useState, FormEvent } from 'react'

export interface TeacherFormData {
  first_name: string
  last_name: string
  email: string
  phone: string
  department_id: number | null
  title: string
  qualification: string
  employment_status: string
  employee_id: string
}

interface Props {
  onSubmit: (data: TeacherFormData) => Promise<void>
  isLoading: boolean
  departments: { id: number; name: string }[]
}

const INITIAL_STATE: TeacherFormData = {
  first_name: '',
  last_name: '',
  email: '',
  phone: '',
  department_id: null,
  title: '',
  qualification: '',
  employment_status: '',
  employee_id: '',
}

const INPUT_CLASS =
  'block w-full px-3.5 py-3 bg-surface-container-lowest rounded-xl border border-outline-variant/25 focus:border-primary focus:ring-2 focus:ring-primary/10 focus:outline-none text-on-surface placeholder:text-outline/40 text-sm transition-all'

const LABEL_CLASS =
  'block text-xs font-semibold text-on-surface-variant uppercase tracking-wider mb-1.5'

export default function TeacherEnrollmentForm({ onSubmit, isLoading, departments }: Props) {
  const [form, setForm] = useState<TeacherFormData>({ ...INITIAL_STATE })
  const [useCustomId, setUseCustomId] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function updateField<K extends keyof TeacherFormData>(key: K, value: TeacherFormData[K]) {
    setForm(prev => ({ ...prev, [key]: value }))
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)

    const payload: TeacherFormData = {
      ...form,
      employee_id: useCustomId ? form.employee_id : '',
    }

    try {
      await onSubmit(payload)
      // Success — reset form
      setForm({ ...INITIAL_STATE })
      setUseCustomId(false)
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: Record<string, unknown> } }
      if (axiosErr.response?.data) {
        const data = axiosErr.response.data
        const firstError = Object.values(data).flat()[0]
        setError(typeof firstError === 'string' ? firstError : 'Enrollment failed. Please try again.')
      } else {
        setError('Enrollment failed. Please try again.')
      }
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Error alert */}
      {error && (
        <div
          role="alert"
          className="flex items-center gap-2 rounded-lg bg-error-container/40 border border-error/20 px-4 py-3"
        >
          <span className="material-symbols-outlined text-error text-lg">error</span>
          <span className="text-sm text-on-error-container">{error}</span>
        </div>
      )}

      {/* Row 1: First Name | Last Name */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className={LABEL_CLASS} htmlFor="teacher-first-name">
            First Name <span className="text-error">*</span>
          </label>
          <input
            id="teacher-first-name"
            type="text"
            required
            placeholder="First name"
            className={INPUT_CLASS}
            value={form.first_name}
            onChange={e => updateField('first_name', e.target.value)}
          />
        </div>
        <div>
          <label className={LABEL_CLASS} htmlFor="teacher-last-name">
            Last Name <span className="text-error">*</span>
          </label>
          <input
            id="teacher-last-name"
            type="text"
            required
            placeholder="Last name"
            className={INPUT_CLASS}
            value={form.last_name}
            onChange={e => updateField('last_name', e.target.value)}
          />
        </div>
      </div>

      {/* Row 2: Email | Phone */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className={LABEL_CLASS} htmlFor="teacher-email">
            Email <span className="text-error">*</span>
          </label>
          <input
            id="teacher-email"
            type="email"
            required
            placeholder="teacher@institution.edu"
            className={INPUT_CLASS}
            value={form.email}
            onChange={e => updateField('email', e.target.value)}
          />
        </div>
        <div>
          <label className={LABEL_CLASS} htmlFor="teacher-phone">
            Phone
          </label>
          <input
            id="teacher-phone"
            type="tel"
            placeholder="Phone number"
            className={INPUT_CLASS}
            value={form.phone}
            onChange={e => updateField('phone', e.target.value)}
          />
        </div>
      </div>

      {/* Row 3: Department | Title */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className={LABEL_CLASS} htmlFor="teacher-department">
            Department
          </label>
          <select
            id="teacher-department"
            className={INPUT_CLASS}
            value={form.department_id ?? ''}
            onChange={e =>
              updateField('department_id', e.target.value ? Number(e.target.value) : null)
            }
          >
            <option value="">Select department</option>
            {departments.map(dept => (
              <option key={dept.id} value={dept.id}>
                {dept.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className={LABEL_CLASS} htmlFor="teacher-title">
            Title
          </label>
          <input
            id="teacher-title"
            type="text"
            placeholder="e.g. Senior Lecturer"
            className={INPUT_CLASS}
            value={form.title}
            onChange={e => updateField('title', e.target.value)}
          />
        </div>
      </div>

      {/* Row 4: Qualification | Employment Status */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className={LABEL_CLASS} htmlFor="teacher-qualification">
            Qualification
          </label>
          <input
            id="teacher-qualification"
            type="text"
            placeholder="e.g. M.Sc Computer Science"
            className={INPUT_CLASS}
            value={form.qualification}
            onChange={e => updateField('qualification', e.target.value)}
          />
        </div>
        <div>
          <label className={LABEL_CLASS} htmlFor="teacher-employment-status">
            Employment Status
          </label>
          <select
            id="teacher-employment-status"
            className={INPUT_CLASS}
            value={form.employment_status}
            onChange={e => updateField('employment_status', e.target.value)}
          >
            <option value="">Select status</option>
            <option value="full_time">Full Time</option>
            <option value="part_time">Part Time</option>
            <option value="contract">Contract</option>
          </select>
        </div>
      </div>

      {/* Custom ID toggle */}
      <div>
        <label className="inline-flex items-center gap-2 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={useCustomId}
            onChange={e => setUseCustomId(e.target.checked)}
            className="w-4 h-4 rounded border-outline-variant/40 text-primary focus:ring-primary/20"
          />
          <span className="text-sm text-on-surface-variant">Use custom ID</span>
        </label>

        {useCustomId && (
          <div className="mt-2">
            <input
              type="text"
              placeholder="Enter custom employee ID"
              className={INPUT_CLASS}
              value={form.employee_id}
              onChange={e => updateField('employee_id', e.target.value)}
              aria-label="Custom employee ID"
            />
          </div>
        )}
      </div>

      {/* Submit */}
      <button
        type="submit"
        disabled={isLoading}
        className="w-full bg-primary text-on-primary font-headline font-bold py-3 rounded-xl hover:bg-primary/90 shadow-lg shadow-primary/20 disabled:opacity-60 disabled:cursor-not-allowed text-sm transition-all"
      >
        {isLoading ? (
          <span className="flex items-center justify-center gap-2">
            <span className="w-5 h-5 border-2 border-on-primary/30 border-t-on-primary rounded-full animate-spin" />
            Enrolling...
          </span>
        ) : (
          <span className="flex items-center justify-center gap-2">
            <span className="material-symbols-outlined text-lg">person_add</span>
            Enroll Teacher
          </span>
        )}
      </button>
    </form>
  )
}
