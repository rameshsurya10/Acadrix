import { useState, useEffect } from 'react'
import PageLayout from '@/components/layout/PageLayout'
import { superAdminService, type SchoolSettings } from '@/services/superAdmin/superAdminService'
import { Bone } from '@/components/shared/Skeleton'

export default function SettingsPage() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [form, setForm] = useState<Partial<SchoolSettings>>({})

  useEffect(() => {
    superAdminService.getSchoolSettings()
      .then(s => setForm(s))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError(null)
    setSuccess(false)
    try {
      const updated = await superAdminService.updateSchoolSettings(form)
      setForm(updated)
      setSuccess(true)
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to update settings.')
    } finally { setSaving(false) }
  }

  function field(label: string, key: keyof SchoolSettings, type = 'text') {
    return (
      <div>
        <label className="font-label text-xs font-bold text-on-surface-variant uppercase tracking-wider block mb-2">{label}</label>
        <input
          type={type} value={(form[key] as string) || ''}
          onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
          className="w-full px-4 py-3 rounded-lg bg-surface-container-low text-sm focus:outline-none focus:ring-2 focus:ring-primary"
        />
      </div>
    )
  }

  return (
    <PageLayout>
      <main className="max-w-4xl mx-auto px-4 md:px-6 py-10 pb-32">
        <div className="mb-10">
          <span className="font-label text-xs font-semibold tracking-widest text-on-surface-variant uppercase mb-2 block">Super Admin</span>
          <h2 className="font-headline font-extrabold text-3xl md:text-4xl text-on-surface tracking-tight">School Settings</h2>
        </div>

        {loading ? (
          <div className="space-y-4">
            {Array.from({ length: 6 }).map((_, i) => <Bone key={i} className="h-14 rounded-lg" />)}
          </div>
        ) : (
          <form onSubmit={handleSave} className="bg-surface-container-lowest p-8 rounded-xl">
            {success && (
              <div className="bg-tertiary/10 text-tertiary px-4 py-3 rounded-lg mb-6 flex items-center gap-2">
                <span className="material-symbols-outlined text-sm">check_circle</span>
                <span className="text-sm font-medium">Settings saved successfully!</span>
              </div>
            )}
            {error && <p className="text-error text-sm mb-4">{error}</p>}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {field('School Name', 'school_name')}
              {field('Email', 'email', 'email')}
              {field('Phone', 'phone', 'tel')}
              {field('Website', 'website', 'url')}
              {field('Currency', 'currency')}
              {field('Timezone', 'timezone')}
              {field('Motto', 'motto')}
              <div className="md:col-span-2">
                <label className="font-label text-xs font-bold text-on-surface-variant uppercase tracking-wider block mb-2">Address</label>
                <textarea value={form.address || ''} onChange={e => setForm(f => ({ ...f, address: e.target.value }))}
                  rows={3} className="w-full px-4 py-3 rounded-lg bg-surface-container-low text-sm focus:outline-none focus:ring-2 focus:ring-primary resize-none" />
              </div>
            </div>

            <div className="flex justify-end mt-8">
              <button type="submit" disabled={saving}
                className="bg-primary text-on-primary px-8 py-3 rounded-lg font-bold text-sm hover:opacity-90 disabled:opacity-50 transition-all active:scale-95">
                {saving ? 'Saving...' : 'Save Settings'}
              </button>
            </div>
          </form>
        )}
      </main>
    </PageLayout>
  )
}
