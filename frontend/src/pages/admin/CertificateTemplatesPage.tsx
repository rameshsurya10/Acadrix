import { useState, useEffect, useCallback } from 'react'
import PageLayout from '@/components/layout/PageLayout'
import { academicsService, type CertificateTemplate } from '@/services/academics/academicsService'
import { SkeletonTableRow } from '@/components/shared/Skeleton'

const CERT_TYPES = [
  { value: 'tc', label: 'Transfer Certificate' },
  { value: 'bonafide', label: 'Bonafide Certificate' },
  { value: 'character', label: 'Character Certificate' },
  { value: 'conduct', label: 'Conduct Certificate' },
  { value: 'study', label: 'Study Certificate' },
  { value: 'custom', label: 'Custom' },
]

const TYPE_BADGE: Record<string, string> = {
  tc: 'bg-error/10 text-error',
  bonafide: 'bg-primary/10 text-primary',
  character: 'bg-tertiary/10 text-tertiary',
  conduct: 'bg-secondary/10 text-secondary',
  study: 'bg-outline/10 text-on-surface-variant',
  custom: 'bg-outline/10 text-on-surface-variant',
}

const PLACEHOLDERS = [
  '{{student_name}}',
  '{{father_name}}',
  '{{class}}',
  '{{date_of_birth}}',
  '{{admission_date}}',
  '{{school_name}}',
]

interface CertForm {
  name: string
  cert_type: string
  body_template: string
}

const EMPTY_FORM: CertForm = {
  name: '',
  cert_type: 'bonafide',
  body_template: '',
}

export default function CertificateTemplatesPage() {
  const [templates, setTemplates] = useState<CertificateTemplate[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [form, setForm] = useState<CertForm>(EMPTY_FORM)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  const loadData = useCallback(async () => {
    setLoading(true)
    try {
      const res = await academicsService.getCertTemplates()
      setTemplates(res.results)
    } catch {
      setError('Failed to load certificate templates.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { loadData() }, [loadData])

  function openCreate() {
    setEditingId(null)
    setForm(EMPTY_FORM)
    setShowForm(true)
    setError('')
  }

  function openEdit(t: CertificateTemplate) {
    setEditingId(t.id)
    setForm({
      name: t.name,
      cert_type: t.cert_type,
      body_template: t.body_template,
    })
    setShowForm(true)
    setError('')
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.name.trim() || !form.body_template.trim()) {
      setError('Please fill in all required fields.')
      return
    }
    setSubmitting(true)
    setError('')
    try {
      const payload = {
        name: form.name.trim(),
        cert_type: form.cert_type,
        body_template: form.body_template.trim(),
      }
      if (editingId) {
        await academicsService.updateCertTemplate(editingId, payload)
      } else {
        await academicsService.createCertTemplate(payload)
      }
      setShowForm(false)
      setForm(EMPTY_FORM)
      setEditingId(null)
      await loadData()
    } catch {
      setError('Failed to save template. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  function insertPlaceholder(placeholder: string) {
    setForm(prev => ({
      ...prev,
      body_template: prev.body_template + placeholder,
    }))
  }

  return (
    <PageLayout sidebar>
      <main className="pb-20 md:pb-0">
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-6 md:py-10 space-y-8 md:space-y-12">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div className="space-y-2">
              <span className="font-label text-xs font-semibold tracking-widest text-on-surface-variant uppercase mb-2 block">Academics</span>
              <h2 className="font-headline font-extrabold text-3xl md:text-4xl text-on-surface">Certificate Templates</h2>
            </div>
            <button
              onClick={openCreate}
              className="flex items-center gap-2 bg-primary text-on-primary px-5 py-3 rounded-xl font-bold text-sm hover:opacity-90 transition-opacity self-start md:self-auto"
            >
              <span className="material-symbols-outlined text-lg">add</span>
              New Template
            </button>
          </div>

          {error && (
            <div className="bg-error/10 text-error px-4 py-3 rounded-lg text-sm font-medium flex items-center gap-2">
              <span className="material-symbols-outlined text-lg">error</span>
              {error}
            </div>
          )}

          {/* Create / Edit Form */}
          {showForm && (
            <div className="bg-surface-container-lowest rounded-xl p-6 md:p-8 space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold font-headline">{editingId ? 'Edit Template' : 'Create New Template'}</h3>
                <button onClick={() => { setShowForm(false); setEditingId(null) }} className="text-on-surface-variant hover:text-on-surface transition-colors">
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="space-y-1.5">
                    <label htmlFor="cert-name" className="text-xs font-bold uppercase tracking-widest text-on-surface-variant font-label">Name *</label>
                    <input
                      id="cert-name"
                      type="text"
                      value={form.name}
                      onChange={e => setForm(prev => ({ ...prev, name: e.target.value }))}
                      className="w-full bg-surface-container-low border-none rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-primary"
                      placeholder="e.g. Bonafide Certificate 2025"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label htmlFor="cert-type" className="text-xs font-bold uppercase tracking-widest text-on-surface-variant font-label">Type *</label>
                    <select
                      id="cert-type"
                      value={form.cert_type}
                      onChange={e => setForm(prev => ({ ...prev, cert_type: e.target.value }))}
                      className="w-full bg-surface-container-low border-none rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-primary cursor-pointer"
                    >
                      {CERT_TYPES.map(ct => <option key={ct.value} value={ct.value}>{ct.label}</option>)}
                    </select>
                  </div>
                </div>

                {/* Placeholders help */}
                <div className="space-y-2">
                  <p className="text-xs font-bold uppercase tracking-widest text-on-surface-variant font-label">Available Placeholders</p>
                  <div className="flex flex-wrap gap-2">
                    {PLACEHOLDERS.map(p => (
                      <button
                        key={p}
                        type="button"
                        onClick={() => insertPlaceholder(p)}
                        className="text-xs bg-surface-container-high text-on-surface-variant px-3 py-1.5 rounded-full hover:bg-primary/10 hover:text-primary transition-colors font-mono"
                      >
                        {p}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="cert-body" className="text-xs font-bold uppercase tracking-widest text-on-surface-variant font-label">Body Template *</label>
                  <textarea
                    id="cert-body"
                    value={form.body_template}
                    onChange={e => setForm(prev => ({ ...prev, body_template: e.target.value }))}
                    rows={8}
                    className="w-full bg-surface-container-low border-none rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-primary font-mono resize-y"
                    placeholder={'This is to certify that {{student_name}}, son/daughter of {{father_name}}, is a bonafide student of {{school_name}} studying in class {{class}}.\n\nDate of Birth: {{date_of_birth}}\nDate of Admission: {{admission_date}}'}
                  />
                </div>

                <div className="flex justify-end gap-3 pt-2">
                  <button type="button" onClick={() => { setShowForm(false); setEditingId(null) }} className="px-5 py-3 rounded-lg text-sm font-semibold text-on-surface-variant hover:bg-surface-container-high transition-colors">
                    Cancel
                  </button>
                  <button type="submit" disabled={submitting} className="flex items-center gap-2 bg-primary text-on-primary px-6 py-3 rounded-lg font-bold text-sm hover:opacity-90 transition-opacity disabled:opacity-50">
                    {submitting && <span className="material-symbols-outlined text-sm animate-spin">progress_activity</span>}
                    {editingId ? 'Update Template' : 'Create Template'}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Templates Table */}
          <div className="overflow-x-auto -mx-4 md:mx-0">
            <table className="w-full border-separate border-spacing-y-2 min-w-[600px]">
              <thead>
                <tr className="text-left bg-surface-container-low">
                  <th className="px-4 md:px-6 py-4 text-xs font-bold uppercase tracking-widest text-on-surface-variant/70 font-label rounded-l-lg">Name</th>
                  <th className="px-4 md:px-6 py-4 text-xs font-bold uppercase tracking-widest text-on-surface-variant/70 font-label">Type</th>
                  <th className="px-4 md:px-6 py-4 text-xs font-bold uppercase tracking-widest text-on-surface-variant/70 font-label">Status</th>
                  <th className="px-4 md:px-6 py-4 text-xs font-bold uppercase tracking-widest text-on-surface-variant/70 font-label rounded-r-lg">Actions</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {loading ? (
                  Array.from({ length: 3 }).map((_, i) => <SkeletonTableRow key={i} cols={4} />)
                ) : templates.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-16 text-center">
                      <div className="flex flex-col items-center gap-3">
                        <span className="material-symbols-outlined text-5xl text-on-surface-variant/30">workspace_premium</span>
                        <p className="text-on-surface-variant font-medium">No certificate templates yet</p>
                        <p className="text-on-surface-variant/60 text-xs">Create your first template to start issuing certificates.</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  templates.map(t => {
                    const badge = TYPE_BADGE[t.cert_type] ?? TYPE_BADGE.custom
                    return (
                      <tr key={t.id} className="bg-surface-container-lowest hover:bg-surface transition-colors">
                        <td className="px-4 md:px-6 py-4 md:py-5 rounded-l-lg">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded bg-tertiary/10 text-tertiary flex items-center justify-center">
                              <span className="material-symbols-outlined text-lg">workspace_premium</span>
                            </div>
                            <span className="font-semibold text-on-surface">{t.name}</span>
                          </div>
                        </td>
                        <td className="px-4 md:px-6 py-4 md:py-5">
                          <span className={`text-xs px-3 py-1 rounded-full font-bold uppercase tracking-tight ${badge}`}>
                            {t.cert_type_display || t.cert_type}
                          </span>
                        </td>
                        <td className="px-4 md:px-6 py-4 md:py-5">
                          <div className="flex items-center gap-2">
                            <span className={`w-2 h-2 rounded-full ${t.is_active ? 'bg-tertiary' : 'bg-outline'}`} />
                            <span className={`text-xs font-bold uppercase tracking-tighter ${t.is_active ? 'text-tertiary' : 'text-on-surface-variant'}`}>
                              {t.is_active ? 'Active' : 'Inactive'}
                            </span>
                          </div>
                        </td>
                        <td className="px-4 md:px-6 py-4 md:py-5 rounded-r-lg">
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => openEdit(t)}
                              className="w-8 h-8 rounded-lg flex items-center justify-center text-on-surface-variant hover:bg-primary/10 hover:text-primary transition-colors"
                              aria-label={`Edit ${t.name}`}
                            >
                              <span className="material-symbols-outlined text-lg">edit</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </PageLayout>
  )
}
