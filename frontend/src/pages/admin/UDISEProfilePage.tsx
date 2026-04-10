import { useState, useEffect } from 'react'
import PageLayout from '@/components/layout/PageLayout'
import { udiseService, type UDISEProfile } from '@/services/udise/udiseService'
import { Bone } from '@/components/shared/Skeleton'

const SCHOOL_CATEGORIES = [
  { value: 'primary', label: 'Primary' },
  { value: 'upper_primary', label: 'Upper Primary' },
  { value: 'secondary', label: 'Secondary' },
  { value: 'higher_secondary', label: 'Higher Secondary' },
  { value: 'composite', label: 'Composite' },
]

const SCHOOL_TYPES = [
  { value: 'boys', label: 'Boys' },
  { value: 'girls', label: 'Girls' },
  { value: 'co_ed', label: 'Co-Education' },
]

export default function UDISEProfilePage() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [form, setForm] = useState<Partial<UDISEProfile>>({})

  useEffect(() => {
    udiseService.getProfile()
      .then(p => setForm(p))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError(null)
    setSuccess(false)
    try {
      const updated = await udiseService.updateProfile(form)
      setForm(updated)
      setSuccess(true)
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to update U-DISE profile.')
    } finally {
      setSaving(false)
    }
  }

  function textField(label: string, key: keyof UDISEProfile, type = 'text', placeholder = '') {
    return (
      <div className="space-y-1.5">
        <label className="font-label text-xs font-bold text-on-surface-variant uppercase tracking-wider block">
          {label}
        </label>
        <input
          type={type}
          value={(form[key] as string | number) ?? ''}
          onChange={e => setForm(f => ({ ...f, [key]: type === 'number' ? Number(e.target.value) : e.target.value }))}
          placeholder={placeholder}
          className="w-full px-4 py-3 rounded-lg bg-surface-container-low text-sm focus:outline-none focus:ring-2 focus:ring-primary"
        />
      </div>
    )
  }

  function selectField(label: string, key: keyof UDISEProfile, options: { value: string; label: string }[]) {
    return (
      <div className="space-y-1.5">
        <label className="font-label text-xs font-bold text-on-surface-variant uppercase tracking-wider block">
          {label}
        </label>
        <select
          value={(form[key] as string) ?? ''}
          onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
          className="w-full px-4 py-3 rounded-lg bg-surface-container-low text-sm focus:outline-none focus:ring-2 focus:ring-primary cursor-pointer"
        >
          <option value="">Select...</option>
          {options.map(o => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
      </div>
    )
  }

  return (
    <PageLayout sidebar>
      <main className="pb-20 md:pb-0">
        <div className="max-w-4xl mx-auto px-4 md:px-6 py-6 md:py-10">
          {/* Header */}
          <div className="mb-10">
            <span className="font-label text-xs font-semibold tracking-widest text-on-surface-variant uppercase mb-2 block">
              Government Compliance
            </span>
            <h2 className="font-headline font-extrabold text-3xl md:text-4xl text-on-surface tracking-tight">
              U-DISE School Profile
            </h2>
          </div>

          {loading ? (
            <div className="space-y-4">
              {Array.from({ length: 8 }).map((_, i) => <Bone key={i} className="h-14 rounded-lg" />)}
            </div>
          ) : (
            <form onSubmit={handleSave} className="bg-surface-container-lowest p-6 md:p-8 rounded-xl space-y-8">
              {success && (
                <div className="bg-tertiary/10 text-tertiary px-4 py-3 rounded-lg flex items-center gap-2">
                  <span className="material-symbols-outlined text-sm">check_circle</span>
                  <span className="text-sm font-medium">U-DISE profile saved successfully!</span>
                </div>
              )}
              {error && (
                <div className="bg-error/10 text-error px-4 py-3 rounded-lg text-sm font-medium flex items-center gap-2">
                  <span className="material-symbols-outlined text-lg">error</span>
                  {error}
                </div>
              )}

              {/* Identification */}
              <div>
                <h3 className="text-sm font-bold uppercase tracking-widest text-on-surface-variant font-label mb-4">
                  Identification
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {textField('U-DISE Code', 'udise_code', 'text', '01234567890')}
                  {textField('Block Code', 'block_code', 'text', '0001')}
                  {textField('District Code', 'district_code', 'text', '001')}
                  {textField('State Code', 'state_code', 'text', '01')}
                </div>
              </div>

              {/* Classification */}
              <div>
                <h3 className="text-sm font-bold uppercase tracking-widest text-on-surface-variant font-label mb-4">
                  Classification
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {selectField('School Category', 'school_category', SCHOOL_CATEGORIES)}
                  {selectField('School Type', 'school_type', SCHOOL_TYPES)}
                  {textField('Management Type', 'management_type', 'text', 'e.g. Private Aided')}
                  {textField('Medium of Instruction', 'medium', 'text', 'e.g. English')}
                </div>
              </div>

              {/* Affiliation */}
              <div>
                <h3 className="text-sm font-bold uppercase tracking-widest text-on-surface-variant font-label mb-4">
                  Affiliation
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {textField('Year Established', 'year_established', 'number', '1990')}
                  {textField('Affiliation Board', 'affiliation_board', 'text', 'e.g. CBSE')}
                  {textField('Affiliation Number', 'affiliation_number', 'text', 'e.g. 3430256')}
                </div>
              </div>

              {/* Actions */}
              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  disabled={saving}
                  className="flex items-center gap-2 bg-primary text-on-primary px-6 py-3 rounded-xl font-bold text-sm hover:opacity-90 transition-opacity disabled:opacity-50"
                >
                  {saving && <span className="material-symbols-outlined text-sm animate-spin">progress_activity</span>}
                  Save Profile
                </button>
              </div>
            </form>
          )}
        </div>
      </main>
    </PageLayout>
  )
}
