import { useState, FormEvent } from 'react'

interface Guardian {
  name: string
  relationship: string
  phone: string
  email: string
}

export interface StudentFormData {
  first_name: string
  last_name: string
  email: string
  phone: string
  date_of_birth: string
  section_id: number | null
  address: string
  student_id: string
  guardians: Guardian[]
}

interface Props {
  onSubmit: (data: StudentFormData) => Promise<void>
  isLoading: boolean
  sections: { id: number; label: string }[]
  sectionRequired?: boolean
}

const EMPTY_GUARDIAN: Guardian = {
  name: '',
  relationship: '',
  phone: '',
  email: '',
}

const INITIAL_STATE: Omit<StudentFormData, 'guardians'> = {
  first_name: '',
  last_name: '',
  email: '',
  phone: '',
  date_of_birth: '',
  section_id: null,
  address: '',
  student_id: '',
}

const INPUT_CLASS =
  'block w-full px-3.5 py-3 bg-surface-container-lowest rounded-xl border border-outline-variant/25 focus:border-primary focus:ring-2 focus:ring-primary/10 focus:outline-none text-on-surface placeholder:text-outline/40 text-sm transition-all'

const LABEL_CLASS =
  'block text-xs font-semibold text-on-surface-variant uppercase tracking-wider mb-1.5'

const RELATIONSHIP_OPTIONS = [
  { value: 'parent', label: 'Parent' },
  { value: 'father', label: 'Father' },
  { value: 'mother', label: 'Mother' },
  { value: 'guardian', label: 'Guardian' },
]

export default function StudentEnrollmentForm({
  onSubmit,
  isLoading,
  sections,
  sectionRequired = false,
}: Props) {
  const [form, setForm] = useState({ ...INITIAL_STATE })
  const [guardians, setGuardians] = useState<Guardian[]>([])
  const [guardiansExpanded, setGuardiansExpanded] = useState(false)
  const [useCustomId, setUseCustomId] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function updateField<K extends keyof typeof INITIAL_STATE>(
    key: K,
    value: (typeof INITIAL_STATE)[K],
  ) {
    setForm(prev => ({ ...prev, [key]: value }))
  }

  function addGuardian() {
    setGuardians(prev => [...prev, { ...EMPTY_GUARDIAN }])
    setGuardiansExpanded(true)
  }

  function updateGuardian(index: number, field: keyof Guardian, value: string) {
    setGuardians(prev =>
      prev.map((g, i) => (i === index ? { ...g, [field]: value } : g)),
    )
  }

  function removeGuardian(index: number) {
    setGuardians(prev => prev.filter((_, i) => i !== index))
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)

    const payload: StudentFormData = {
      ...form,
      student_id: useCustomId ? form.student_id : '',
      guardians,
    }

    try {
      await onSubmit(payload)
      // Success — reset form
      setForm({ ...INITIAL_STATE })
      setGuardians([])
      setGuardiansExpanded(false)
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
          <label className={LABEL_CLASS} htmlFor="student-first-name">
            First Name <span className="text-error">*</span>
          </label>
          <input
            id="student-first-name"
            type="text"
            required
            placeholder="First name"
            className={INPUT_CLASS}
            value={form.first_name}
            onChange={e => updateField('first_name', e.target.value)}
          />
        </div>
        <div>
          <label className={LABEL_CLASS} htmlFor="student-last-name">
            Last Name <span className="text-error">*</span>
          </label>
          <input
            id="student-last-name"
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
          <label className={LABEL_CLASS} htmlFor="student-email">
            Email <span className="text-error">*</span>
          </label>
          <input
            id="student-email"
            type="email"
            required
            placeholder="student@institution.edu"
            className={INPUT_CLASS}
            value={form.email}
            onChange={e => updateField('email', e.target.value)}
          />
        </div>
        <div>
          <label className={LABEL_CLASS} htmlFor="student-phone">
            Phone
          </label>
          <input
            id="student-phone"
            type="tel"
            placeholder="Phone number"
            className={INPUT_CLASS}
            value={form.phone}
            onChange={e => updateField('phone', e.target.value)}
          />
        </div>
      </div>

      {/* Row 3: Date of Birth | Section */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className={LABEL_CLASS} htmlFor="student-dob">
            Date of Birth
          </label>
          <input
            id="student-dob"
            type="date"
            className={INPUT_CLASS}
            value={form.date_of_birth}
            onChange={e => updateField('date_of_birth', e.target.value)}
          />
        </div>
        <div>
          <label className={LABEL_CLASS} htmlFor="student-section">
            Section {sectionRequired && <span className="text-error">*</span>}
          </label>
          <select
            id="student-section"
            required={sectionRequired}
            className={INPUT_CLASS}
            value={form.section_id ?? ''}
            onChange={e =>
              updateField('section_id', e.target.value ? Number(e.target.value) : null)
            }
          >
            <option value="">Select section</option>
            {sections.map(sec => (
              <option key={sec.id} value={sec.id}>
                {sec.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Address */}
      <div>
        <label className={LABEL_CLASS} htmlFor="student-address">
          Address
        </label>
        <textarea
          id="student-address"
          rows={2}
          placeholder="Home address"
          className={INPUT_CLASS + ' resize-none'}
          value={form.address}
          onChange={e => updateField('address', e.target.value)}
        />
      </div>

      {/* Guardians section (collapsible) */}
      <div className="border border-outline-variant/20 rounded-xl overflow-hidden">
        <button
          type="button"
          onClick={() => setGuardiansExpanded(prev => !prev)}
          className="w-full flex items-center justify-between px-4 py-3 hover:bg-surface-container-low transition-colors"
        >
          <span className="flex items-center gap-2 text-sm font-semibold text-on-surface">
            <span className="material-symbols-outlined text-lg text-on-surface-variant">
              family_restroom
            </span>
            Guardians
            {guardians.length > 0 && (
              <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-primary/10 text-primary text-xs font-bold">
                {guardians.length}
              </span>
            )}
          </span>
          <span className="material-symbols-outlined text-on-surface-variant text-lg transition-transform" style={{ transform: guardiansExpanded ? 'rotate(180deg)' : undefined }}>
            expand_more
          </span>
        </button>

        {guardiansExpanded && (
          <div className="px-4 pb-4 space-y-4">
            {guardians.map((guardian, index) => (
              <div
                key={index}
                className="relative bg-surface-container-lowest rounded-xl border border-outline-variant/15 p-4 space-y-3"
              >
                {/* Remove button */}
                <button
                  type="button"
                  onClick={() => removeGuardian(index)}
                  className="absolute top-3 right-3 text-on-surface-variant hover:text-error transition-colors"
                  aria-label={`Remove guardian ${index + 1}`}
                >
                  <span className="material-symbols-outlined text-lg">close</span>
                </button>

                <p className="text-xs font-semibold text-on-surface-variant">
                  Guardian {index + 1}
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label
                      className={LABEL_CLASS}
                      htmlFor={`guardian-name-${index}`}
                    >
                      Name
                    </label>
                    <input
                      id={`guardian-name-${index}`}
                      type="text"
                      placeholder="Guardian name"
                      className={INPUT_CLASS}
                      value={guardian.name}
                      onChange={e => updateGuardian(index, 'name', e.target.value)}
                    />
                  </div>
                  <div>
                    <label
                      className={LABEL_CLASS}
                      htmlFor={`guardian-relationship-${index}`}
                    >
                      Relationship
                    </label>
                    <select
                      id={`guardian-relationship-${index}`}
                      className={INPUT_CLASS}
                      value={guardian.relationship}
                      onChange={e =>
                        updateGuardian(index, 'relationship', e.target.value)
                      }
                    >
                      <option value="">Select</option>
                      {RELATIONSHIP_OPTIONS.map(opt => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label
                      className={LABEL_CLASS}
                      htmlFor={`guardian-phone-${index}`}
                    >
                      Phone
                    </label>
                    <input
                      id={`guardian-phone-${index}`}
                      type="tel"
                      placeholder="Phone number"
                      className={INPUT_CLASS}
                      value={guardian.phone}
                      onChange={e => updateGuardian(index, 'phone', e.target.value)}
                    />
                  </div>
                  <div>
                    <label
                      className={LABEL_CLASS}
                      htmlFor={`guardian-email-${index}`}
                    >
                      Email
                    </label>
                    <input
                      id={`guardian-email-${index}`}
                      type="email"
                      placeholder="Guardian email"
                      className={INPUT_CLASS}
                      value={guardian.email}
                      onChange={e => updateGuardian(index, 'email', e.target.value)}
                    />
                  </div>
                </div>
              </div>
            ))}

            <button
              type="button"
              onClick={addGuardian}
              className="flex items-center gap-1.5 text-sm font-medium text-primary hover:text-primary/80 transition-colors"
            >
              <span className="material-symbols-outlined text-lg">add</span>
              Add Guardian
            </button>
          </div>
        )}

        {!guardiansExpanded && guardians.length === 0 && (
          <div className="px-4 pb-3">
            <button
              type="button"
              onClick={addGuardian}
              className="flex items-center gap-1.5 text-sm font-medium text-primary hover:text-primary/80 transition-colors"
            >
              <span className="material-symbols-outlined text-lg">add</span>
              Add Guardian
            </button>
          </div>
        )}
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
              placeholder="Enter custom student ID"
              className={INPUT_CLASS}
              value={form.student_id}
              onChange={e => updateField('student_id', e.target.value)}
              aria-label="Custom student ID"
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
            Enroll Student
          </span>
        )}
      </button>
    </form>
  )
}
