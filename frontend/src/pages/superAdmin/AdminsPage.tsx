import { useState, useEffect } from 'react'
import PageLayout from '@/components/layout/PageLayout'
import { superAdminService, type UserItem, type EnrollAdminRequest } from '@/services/superAdmin/superAdminService'
import { SkeletonTableRow } from '@/components/shared/Skeleton'

export default function AdminsPage() {
  const [admins, setAdmins] = useState<UserItem[]>([])
  const [loading, setLoading] = useState(true)
  const [showEnroll, setShowEnroll] = useState(false)
  const [enrolling, setEnrolling] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [form, setForm] = useState<EnrollAdminRequest>({ first_name: '', last_name: '', email: '', phone: '' })

  useEffect(() => { loadAdmins() }, [])

  async function loadAdmins() {
    try {
      const data = await superAdminService.getUsers({ role: 'admin' })
      setAdmins(data.results)
    } catch { /* empty */ }
    finally { setLoading(false) }
  }

  async function handleEnroll(e: React.FormEvent) {
    e.preventDefault()
    setEnrolling(true)
    setError(null)
    try {
      await superAdminService.enrollAdmin(form)
      setSuccess(`Admin ${form.first_name} ${form.last_name} enrolled successfully!`)
      setForm({ first_name: '', last_name: '', email: '', phone: '' })
      setShowEnroll(false)
      loadAdmins()
    } catch (err: any) {
      const msg = err.response?.data?.email?.[0] || err.response?.data?.error || 'Failed to enroll admin.'
      setError(msg)
    } finally { setEnrolling(false) }
  }

  async function toggleActive(user: UserItem) {
    try {
      const updated = await superAdminService.toggleUserActive(user.id, !user.is_active)
      setAdmins(prev => prev.map(u => u.id === updated.id ? updated : u))
    } catch { /* empty */ }
  }

  async function resetPassword(user: UserItem) {
    try {
      await superAdminService.resetUserPassword(user.id)
      setSuccess(`Password reset for ${user.full_name}. They will be prompted to set a new password.`)
    } catch { /* empty */ }
  }

  return (
    <PageLayout>
      <main className="max-w-7xl mx-auto px-4 md:px-6 py-10 pb-32">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
          <div>
            <span className="font-label text-xs font-semibold tracking-widest text-on-surface-variant uppercase mb-2 block">Super Admin</span>
            <h2 className="font-headline font-extrabold text-3xl md:text-4xl text-on-surface tracking-tight">Admin Management</h2>
          </div>
          <button
            onClick={() => { setShowEnroll(!showEnroll); setError(null); setSuccess(null) }}
            className="bg-primary text-on-primary px-5 py-3 rounded-lg font-bold text-sm flex items-center gap-2 hover:opacity-90 transition-all active:scale-95"
          >
            <span className="material-symbols-outlined text-sm">person_add</span> Enroll Admin
          </button>
        </div>

        {success && (
          <div className="bg-tertiary/10 text-tertiary px-4 py-3 rounded-lg mb-6 flex items-center gap-2">
            <span className="material-symbols-outlined text-sm">check_circle</span>
            <span className="text-sm font-medium">{success}</span>
            <button onClick={() => setSuccess(null)} className="ml-auto"><span className="material-symbols-outlined text-sm">close</span></button>
          </div>
        )}

        {/* Enrollment Form */}
        {showEnroll && (
          <div className="bg-surface-container-lowest p-6 rounded-xl mb-8">
            <h3 className="font-headline font-bold text-lg mb-4">Enroll New Admin</h3>
            {error && <p className="text-error text-sm mb-4">{error}</p>}
            <form onSubmit={handleEnroll} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                type="text" required placeholder="First Name" value={form.first_name}
                onChange={e => setForm(f => ({ ...f, first_name: e.target.value }))}
                className="px-4 py-3 rounded-lg bg-surface-container-low text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <input
                type="text" required placeholder="Last Name" value={form.last_name}
                onChange={e => setForm(f => ({ ...f, last_name: e.target.value }))}
                className="px-4 py-3 rounded-lg bg-surface-container-low text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <input
                type="email" required placeholder="Email" value={form.email}
                onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                className="px-4 py-3 rounded-lg bg-surface-container-low text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <input
                type="tel" placeholder="Phone (optional)" value={form.phone}
                onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                className="px-4 py-3 rounded-lg bg-surface-container-low text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <div className="md:col-span-2 flex gap-3 justify-end">
                <button type="button" onClick={() => setShowEnroll(false)} className="px-5 py-2.5 rounded-lg text-sm font-bold text-on-surface-variant hover:bg-surface-container-high">Cancel</button>
                <button type="submit" disabled={enrolling} className="bg-primary text-on-primary px-6 py-2.5 rounded-lg text-sm font-bold hover:opacity-90 disabled:opacity-50">
                  {enrolling ? 'Enrolling...' : 'Enroll Admin'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Admins Table */}
        <div className="bg-surface-container-low rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[600px]">
              <thead>
                <tr className="bg-surface-container-low border-b border-outline-variant/10">
                  <th className="px-6 py-4 font-label text-xs font-bold text-on-surface-variant uppercase tracking-widest">Admin</th>
                  <th className="px-6 py-4 font-label text-xs font-bold text-on-surface-variant uppercase tracking-widest">Email</th>
                  <th className="px-6 py-4 font-label text-xs font-bold text-on-surface-variant uppercase tracking-widest">Status</th>
                  <th className="px-6 py-4 font-label text-xs font-bold text-on-surface-variant uppercase tracking-widest">Joined</th>
                  <th className="px-6 py-4 font-label text-xs font-bold text-on-surface-variant uppercase tracking-widest text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-surface-container-lowest">
                {loading ? (
                  Array.from({ length: 3 }).map((_, i) => <SkeletonTableRow key={i} cols={5} />)
                ) : admins.length === 0 ? (
                  <tr><td colSpan={5} className="px-6 py-12 text-center text-on-surface-variant">No admins found.</td></tr>
                ) : (
                  admins.map((a) => (
                    <tr key={a.id} className="hover:bg-surface transition-colors border-b border-outline-variant/5">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center font-bold text-primary text-sm">
                            {a.first_name[0]}{a.last_name[0]}
                          </div>
                          <span className="font-bold text-sm">{a.full_name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-on-surface-variant">{a.email}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider ${a.is_active ? 'bg-tertiary/10 text-tertiary' : 'bg-error/10 text-error'}`}>
                          {a.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-on-surface-variant">{new Date(a.date_joined).toLocaleDateString()}</td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex gap-1 justify-end">
                          <button onClick={() => toggleActive(a)} className="p-2 hover:bg-surface-container-high rounded transition-colors" title={a.is_active ? 'Deactivate' : 'Activate'}>
                            <span className="material-symbols-outlined text-on-surface-variant text-lg">{a.is_active ? 'person_off' : 'person'}</span>
                          </button>
                          <button onClick={() => resetPassword(a)} className="p-2 hover:bg-surface-container-high rounded transition-colors" title="Reset Password">
                            <span className="material-symbols-outlined text-on-surface-variant text-lg">lock_reset</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </PageLayout>
  )
}
