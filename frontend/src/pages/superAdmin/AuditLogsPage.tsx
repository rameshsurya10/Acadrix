import { useState, useEffect } from 'react'
import PageLayout from '@/components/layout/PageLayout'
import { superAdminService, type AuditLogEntry } from '@/services/superAdmin/superAdminService'
import { Bone } from '@/components/shared/Skeleton'

const ACTION_ICONS: Record<string, string> = {
  create_admin: 'person_add', create_principal: 'person_add',
  deactivate_user: 'person_off', activate_user: 'person',
  update_settings: 'settings', reset_password: 'lock_reset',
}
const ACTION_LABELS: Record<string, string> = {
  create_admin: 'Created Admin', create_principal: 'Created Principal',
  deactivate_user: 'Deactivated User', activate_user: 'Activated User',
  update_settings: 'Updated Settings', reset_password: 'Reset Password',
}

export default function AuditLogsPage() {
  const [logs, setLogs] = useState<AuditLogEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [actionFilter, setActionFilter] = useState('')

  useEffect(() => { loadLogs() }, [actionFilter])

  async function loadLogs() {
    setLoading(true)
    try {
      const params: Record<string, string> = {}
      if (actionFilter) params.action = actionFilter
      const data = await superAdminService.getAuditLogs(params)
      setLogs(data.results)
    } catch { /* empty */ }
    finally { setLoading(false) }
  }

  return (
    <PageLayout>
      <main className="max-w-5xl mx-auto px-4 md:px-6 py-10 pb-32">
        <div className="mb-10">
          <span className="font-label text-xs font-semibold tracking-widest text-on-surface-variant uppercase mb-2 block">Super Admin</span>
          <h2 className="font-headline font-extrabold text-3xl md:text-4xl text-on-surface tracking-tight">Audit Logs</h2>
        </div>

        <div className="mb-6">
          <select value={actionFilter} onChange={e => setActionFilter(e.target.value)}
            className="px-4 py-3 rounded-lg bg-surface-container-lowest text-sm focus:outline-none focus:ring-2 focus:ring-primary">
            <option value="">All Actions</option>
            <option value="create_admin">Created Admin</option>
            <option value="create_principal">Created Principal</option>
            <option value="deactivate_user">Deactivated User</option>
            <option value="activate_user">Activated User</option>
            <option value="update_settings">Updated Settings</option>
            <option value="reset_password">Reset Password</option>
          </select>
        </div>

        <div className="bg-surface-container-lowest rounded-xl divide-y divide-outline-variant/10">
          {loading ? (
            Array.from({ length: 8 }).map((_, i) => <div key={i} className="p-4"><Bone className="h-12 rounded-lg" /></div>)
          ) : logs.length === 0 ? (
            <div className="p-12 text-center text-on-surface-variant">
              <span className="material-symbols-outlined text-4xl mb-2">history</span>
              <p>No audit logs found.</p>
            </div>
          ) : (
            logs.map(log => (
              <div key={log.id} className="p-4 flex items-start gap-4">
                <div className="w-10 h-10 rounded-lg bg-surface-container-high flex items-center justify-center flex-shrink-0">
                  <span className="material-symbols-outlined text-on-surface-variant">{ACTION_ICONS[log.action] || 'history'}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-bold text-sm">{ACTION_LABELS[log.action] || log.action}</span>
                    {log.actor_name && <span className="text-xs text-on-surface-variant">by {log.actor_name}</span>}
                  </div>
                  <p className="text-sm text-on-surface-variant truncate">{log.detail}</p>
                </div>
                <span className="text-xs text-on-surface-variant whitespace-nowrap flex-shrink-0">
                  {new Date(log.created_at).toLocaleString()}
                </span>
              </div>
            ))
          )}
        </div>
      </main>
    </PageLayout>
  )
}
