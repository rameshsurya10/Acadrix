import { useState, useEffect } from 'react'
import PageLayout from '@/components/layout/PageLayout'
import { superAdminService, type AnnouncementItem } from '@/services/superAdmin/superAdminService'
import { Bone } from '@/components/shared/Skeleton'

const TARGET_LABELS: Record<string, string> = {
  all: 'Everyone', admin: 'Admins', principal: 'Principals', teacher: 'Teachers', student: 'Students',
}

export default function AnnouncementsPage() {
  const [announcements, setAnnouncements] = useState<AnnouncementItem[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreate, setShowCreate] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [form, setForm] = useState({ title: '', body: '', target_role: 'all' })

  useEffect(() => { loadAnnouncements() }, [])

  async function loadAnnouncements() {
    try {
      const data = await superAdminService.getAnnouncements()
      setAnnouncements(data.results)
    } catch { /* empty */ }
    finally { setLoading(false) }
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError(null)
    try {
      await superAdminService.createAnnouncement(form)
      setForm({ title: '', body: '', target_role: 'all' })
      setShowCreate(false)
      loadAnnouncements()
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to create announcement.')
    } finally { setSaving(false) }
  }

  async function toggleActive(item: AnnouncementItem) {
    try {
      const updated = await superAdminService.updateAnnouncement(item.id, { is_active: !item.is_active })
      setAnnouncements(prev => prev.map(a => a.id === updated.id ? updated : a))
    } catch { /* empty */ }
  }

  async function handleDelete(id: number) {
    try {
      await superAdminService.deleteAnnouncement(id)
      setAnnouncements(prev => prev.filter(a => a.id !== id))
    } catch { /* empty */ }
  }

  return (
    <PageLayout>
      <main className="max-w-5xl mx-auto px-4 md:px-6 py-10 pb-32">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
          <div>
            <span className="font-label text-xs font-semibold tracking-widest text-on-surface-variant uppercase mb-2 block">Super Admin</span>
            <h2 className="font-headline font-extrabold text-3xl md:text-4xl text-on-surface tracking-tight">Announcements</h2>
          </div>
          <button onClick={() => setShowCreate(!showCreate)}
            className="bg-primary text-on-primary px-5 py-3 rounded-lg font-bold text-sm flex items-center gap-2 hover:opacity-90 transition-all active:scale-95">
            <span className="material-symbols-outlined text-sm">campaign</span> New Announcement
          </button>
        </div>

        {showCreate && (
          <div className="bg-surface-container-lowest p-6 rounded-xl mb-8">
            <h3 className="font-headline font-bold text-lg mb-4">Create Announcement</h3>
            {error && <p className="text-error text-sm mb-4">{error}</p>}
            <form onSubmit={handleCreate} className="space-y-4">
              <input type="text" required placeholder="Title" value={form.title}
                onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                className="w-full px-4 py-3 rounded-lg bg-surface-container-low text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
              <textarea required placeholder="Announcement body..." value={form.body}
                onChange={e => setForm(f => ({ ...f, body: e.target.value }))}
                rows={4} className="w-full px-4 py-3 rounded-lg bg-surface-container-low text-sm focus:outline-none focus:ring-2 focus:ring-primary resize-none" />
              <select value={form.target_role} onChange={e => setForm(f => ({ ...f, target_role: e.target.value }))}
                className="px-4 py-3 rounded-lg bg-surface-container-low text-sm focus:outline-none focus:ring-2 focus:ring-primary">
                <option value="all">Everyone</option>
                <option value="admin">Admins Only</option>
                <option value="principal">Principals Only</option>
                <option value="teacher">Teachers Only</option>
                <option value="student">Students Only</option>
              </select>
              <div className="flex gap-3 justify-end">
                <button type="button" onClick={() => setShowCreate(false)} className="px-5 py-2.5 rounded-lg text-sm font-bold text-on-surface-variant hover:bg-surface-container-high">Cancel</button>
                <button type="submit" disabled={saving} className="bg-primary text-on-primary px-6 py-2.5 rounded-lg text-sm font-bold hover:opacity-90 disabled:opacity-50">
                  {saving ? 'Publishing...' : 'Publish'}
                </button>
              </div>
            </form>
          </div>
        )}

        <div className="space-y-4">
          {loading ? (
            Array.from({ length: 3 }).map((_, i) => <Bone key={i} className="h-28 rounded-xl" />)
          ) : announcements.length === 0 ? (
            <div className="bg-surface-container-lowest p-12 rounded-xl text-center">
              <span className="material-symbols-outlined text-4xl text-on-surface-variant mb-2">campaign</span>
              <p className="text-on-surface-variant">No announcements yet.</p>
            </div>
          ) : (
            announcements.map(a => (
              <div key={a.id} className={`bg-surface-container-lowest p-6 rounded-xl border-l-4 ${a.is_active ? 'border-primary' : 'border-outline-variant/30 opacity-60'}`}>
                <div className="flex flex-col md:flex-row justify-between items-start gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-bold text-lg">{a.title}</h3>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-primary/10 text-primary">
                        {TARGET_LABELS[a.target_role] || a.target_role}
                      </span>
                      {!a.is_active && (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-on-surface-variant/10 text-on-surface-variant">Archived</span>
                      )}
                    </div>
                    <p className="text-sm text-on-surface-variant leading-relaxed mb-2">{a.body}</p>
                    <p className="text-xs text-on-surface-variant">
                      {a.created_by_name && `By ${a.created_by_name} · `}{new Date(a.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex gap-1">
                    <button onClick={() => toggleActive(a)} className="p-2 hover:bg-surface-container-high rounded transition-colors" title={a.is_active ? 'Archive' : 'Restore'}>
                      <span className="material-symbols-outlined text-on-surface-variant text-lg">{a.is_active ? 'archive' : 'unarchive'}</span>
                    </button>
                    <button onClick={() => handleDelete(a.id)} className="p-2 hover:bg-error/10 rounded transition-colors" title="Delete">
                      <span className="material-symbols-outlined text-error text-lg">delete</span>
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </main>
    </PageLayout>
  )
}
