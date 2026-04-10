import { useState, useEffect } from 'react'
import PageLayout from '@/components/layout/PageLayout'
import { superAdminService, type UserItem, type EnrollPrincipalRequest } from '@/services/superAdmin/superAdminService'
import { SkeletonTableRow } from '@/components/shared/Skeleton'
import api from '@/lib/api'

interface Department { id: number; name: string }

export default function PrincipalsPage() {
  const [principals, setPrincipals] = useState<UserItem[]>([])
  const [departments, setDepartments] = useState<Department[]>([])
  const [loading, setLoading] = useState(true)
  const [showEnroll, setShowEnroll] = useState(false)
  const [enrolling, setEnrolling] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [form, setForm] = useState<EnrollPrincipalRequest>({
    first_name: '', last_name: '', email: '', phone: '', department: null, title: '', qualification: '',
  })

  useEffect(() => {
    Promise.all([
      superAdminService.getUsers({ role: 'principal' }),
      api.get('/shared/departments/'),
    ]).then(([users, depts]) => {
      setPrincipals(users.results)
      setDepartments(depts.data.results || depts.data)
    }).catch(() => {}).finally(() => setLoading(false))
  }, [])

  async function loadPrincipals() {
    const data = await superAdminService.getUsers({ role: 'principal' })
    setPrincipals(data.results)
  }

  async function handleEnroll(e: React.FormEvent) {
    e.preventDefault()
    setEnrolling(true)
    setError(null)
    try {
      await superAdminService.enrollPrincipal(form)
      setSuccess(`Principal ${form.first_name} ${form.last_name} enrolled successfully!`)
      setForm({ first_name: '', last_name: '', email: '', phone: '', department: null, title: '', qualification: '' })
      setShowEnroll(false)
      loadPrincipals()
    } catch (err: any) {
      setError(err.response?.data?.email?.[0] || err.response?.data?.error || 'Failed to enroll principal.')
    } finally { setEnrolling(false) }
  }

  async function toggleActive(user: UserItem) {
    try {
      const updated = await superAdminService.toggleUserActive(user.id, !user.is_active)
      setPrincipals(prev => prev.map(u => u.id === updated.id ? updated : u))
    } catch { /* empty */ }
  }

  async function resetPassword(user: UserItem) {
    try {
      await superAdminService.resetUserPassword(user.id)
      setSuccess(`Password reset for ${user.full_name}.`)
    } catch { /* empty */ }
  }

  return (
    <PageLayout>
      <main className="max-w-7xl mx-auto px-4 md:px-6 py-10 pb-32">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
          <div>
            <span className="font-label text-xs font-semibold tracking-widest text-on-surface-variant uppercase mb-2 block">Super Admin</span>
            <h2 className="font-headline font-extrabold text-3xl md:text-4xl text-on-surface tracking-tight">Principal Management</h2>
          </div>
          <button
            onClick={() => { setShowEnroll(!showEnroll); setError(null); setSuccess(null) }}
            className="bg-primary text-on-primary px-5 py-3 rounded-lg font-bold text-sm flex items-center gap-2 hover:opacity-90 transition-all active:scale-95"
          >
            <span className="material-symbols-outlined text-sm">person_add</span> Enroll Principal
          </button>
        </div>

        {success && (
          <div className="bg-tertiary/10 text-tertiary px-4 py-3 rounded-lg mb-6 flex items-center gap-2">
            <span className="material-symbols-outlined text-sm">check_circle</span>
            <span className="text-sm font-medium">{success}</span>
            <button onClick={() => setSuccess(null)} className="ml-auto"><span className="material-symbols-outlined text-sm">close</span></button>
          </div>
        )}

        {showEnroll && (
          <div className="bg-surface-container-lowest p-6 rounded-xl mb-8">
            <h3 className="font-headline font-bold text-lg mb-4">Enroll New Principal</h3>
            {error && <p className="text-error text-sm mb-4">{error}</p>}
            <form onSubmit={handleEnroll} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input type="text" required placeholder="First Name" value={form.first_name}
                onChange={e => setForm(f => ({ ...f, first_name: e.target.value }))}
                className="px-4 py-3 rounded-lg bg-surface-container-low text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
              <input type="text" required placeholder="Last Name" value={form.last_name}
                onChange={e => setForm(f => ({ ...f, last_name: e.target.value }))}
                className="px-4 py-3 rounded-lg bg-surface-container-low text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
              <input type="email" required placeholder="Email" value={form.email}
                onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                className="px-4 py-3 rounded-lg bg-surface-container-low text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
              <input type="tel" placeholder="Phone (optional)" value={form.phone}
                onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                className="px-4 py-3 rounded-lg bg-surface-container-low text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
              <select value={form.department ?? ''} onChange={e => setForm(f => ({ ...f, department: e.target.value ? Number(e.target.value) : null }))}
                className="px-4 py-3 rounded-lg bg-surface-container-low text-sm focus:outline-none focus:ring-2 focus:ring-primary">
                <option value="">Department (optional)</option>
                {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
              </select>
              <input type="text" placeholder="Title (optional)" value={form.title}
                onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                className="px-4 py-3 rounded-lg bg-surface-container-low text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
              <div className="md:col-span-2">
                <input type="text" placeholder="Qualification (optional)" value={form.qualification}
                  onChange={e => setForm(f => ({ ...f, qualification: e.target.value }))}
                  className="w-full px-4 py-3 rounded-lg bg-surface-container-low text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
              </div>
              <div className="md:col-span-2 flex gap-3 justify-end">
                <button type="button" onClick={() => setShowEnroll(false)} className="px-5 py-2.5 rounded-lg text-sm font-bold text-on-surface-variant hover:bg-surface-container-high">Cancel</button>
                <button type="submit" disabled={enrolling} className="bg-primary text-on-primary px-6 py-2.5 rounded-lg text-sm font-bold hover:opacity-90 disabled:opacity-50">
                  {enrolling ? 'Enrolling...' : 'Enroll Principal'}
                </button>
              </div>
            </form>
          </div>
        )}

        <div className="bg-surface-container-low rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[600px]">
              <thead>
                <tr className="bg-surface-container-low border-b border-outline-variant/10">
                  <th className="px-6 py-4 font-label text-xs font-bold text-on-surface-variant uppercase tracking-widest">Principal</th>
                  <th className="px-6 py-4 font-label text-xs font-bold text-on-surface-variant uppercase tracking-widest">Email</th>
                  <th className="px-6 py-4 font-label text-xs font-bold text-on-surface-variant uppercase tracking-widest">Status</th>
                  <th className="px-6 py-4 font-label text-xs font-bold text-on-surface-variant uppercase tracking-widest">Joined</th>
                  <th className="px-6 py-4 font-label text-xs font-bold text-on-surface-variant uppercase tracking-widest text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-surface-container-lowest">
                {loading ? (
                  Array.from({ length: 3 }).map((_, i) => <SkeletonTableRow key={i} cols={5} />)
                ) : principals.length === 0 ? (
                  <tr><td colSpan={5} className="px-6 py-12 text-center text-on-surface-variant">No principals found.</td></tr>
                ) : (
                  principals.map((p) => (
                    <tr key={p.id} className="hover:bg-surface transition-colors border-b border-outline-variant/5">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-secondary/10 flex items-center justify-center font-bold text-secondary text-sm">
                            {p.first_name[0]}{p.last_name[0]}
                          </div>
                          <span className="font-bold text-sm">{p.full_name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-on-surface-variant">{p.email}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider ${p.is_active ? 'bg-tertiary/10 text-tertiary' : 'bg-error/10 text-error'}`}>
                          {p.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-on-surface-variant">{new Date(p.date_joined).toLocaleDateString()}</td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex gap-1 justify-end">
                          <button onClick={() => toggleActive(p)} className="p-2 hover:bg-surface-container-high rounded transition-colors" title={p.is_active ? 'Deactivate' : 'Activate'}>
                            <span className="material-symbols-outlined text-on-surface-variant text-lg">{p.is_active ? 'person_off' : 'person'}</span>
                          </button>
                          <button onClick={() => resetPassword(p)} className="p-2 hover:bg-surface-container-high rounded transition-colors" title="Reset Password">
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
