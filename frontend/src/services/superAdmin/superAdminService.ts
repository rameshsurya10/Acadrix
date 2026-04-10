import api from '@/lib/api'

// ── Types ──────────────────────────────────────────────────────────

export interface DashboardStats {
  total_users: number
  admins: number
  principals: number
  teachers: number
  students: number
  recent_admins: RecentUser[]
  recent_principals: RecentUser[]
  recent_activity: AuditLogEntry[]
}

export interface RecentUser {
  id: number
  first_name: string
  last_name: string
  email: string
  date_joined: string
}

export interface UserItem {
  id: number
  email: string
  full_name: string
  first_name: string
  last_name: string
  role: string
  phone: string
  is_active: boolean
  date_joined: string
}

export interface UserDetail extends UserItem {
  last_login: string | null
}

export interface AuditLogEntry {
  id: number
  actor: number | null
  actor_name: string | null
  action: string
  target_user: number | null
  target_name: string | null
  detail: string
  created_at: string
}

export interface AnnouncementItem {
  id: number
  title: string
  body: string
  target_role: string
  is_active: boolean
  created_by: number | null
  created_by_name: string | null
  created_at: string
  updated_at: string
}

export interface SchoolSettings {
  school_name: string
  logo: string | null
  logo_url: string | null
  address: string
  phone: string
  email: string
  website: string
  timezone: string
  currency: string
  motto: string
  updated_at: string
}

export interface EnrollAdminRequest {
  first_name: string
  last_name: string
  email: string
  phone?: string
}

export interface EnrollPrincipalRequest {
  first_name: string
  last_name: string
  email: string
  phone?: string
  department?: number | null
  title?: string
  qualification?: string
}

// ── API calls ──────────────────────────────────────────────────────

export const superAdminService = {
  // Dashboard
  async getDashboardStats(): Promise<DashboardStats> {
    const { data } = await api.get('/super-admin/dashboard/')
    return data.data
  },

  // User Management
  async getUsers(params?: Record<string, string>): Promise<{ results: UserItem[]; count: number }> {
    const { data } = await api.get('/super-admin/users/', { params })
    return data
  },

  async getUser(id: number): Promise<UserDetail> {
    const { data } = await api.get(`/super-admin/users/${id}/`)
    return data
  },

  async toggleUserActive(id: number, isActive: boolean): Promise<UserItem> {
    const { data } = await api.patch(`/super-admin/users/${id}/toggle-active/`, { is_active: isActive })
    return data.data
  },

  async resetUserPassword(id: number): Promise<void> {
    await api.post(`/super-admin/users/${id}/reset-password/`)
  },

  // Enrollment
  async enrollAdmin(payload: EnrollAdminRequest) {
    const { data } = await api.post('/super-admin/enroll/admin/', payload)
    return data
  },

  async enrollPrincipal(payload: EnrollPrincipalRequest) {
    const { data } = await api.post('/super-admin/enroll/principal/', payload)
    return data
  },

  // School Settings
  async getSchoolSettings(): Promise<SchoolSettings> {
    const { data } = await api.get('/super-admin/settings/')
    return data.data
  },

  async updateSchoolSettings(payload: Partial<SchoolSettings>): Promise<SchoolSettings> {
    const { data } = await api.patch('/super-admin/settings/', payload)
    return data.data
  },

  // Audit Logs
  async getAuditLogs(params?: Record<string, string>): Promise<{ results: AuditLogEntry[]; count: number }> {
    const { data } = await api.get('/super-admin/audit-logs/', { params })
    return data
  },

  // Announcements
  async getAnnouncements(params?: Record<string, string>): Promise<{ results: AnnouncementItem[]; count: number }> {
    const { data } = await api.get('/super-admin/announcements/', { params })
    return data
  },

  async createAnnouncement(payload: { title: string; body: string; target_role: string }): Promise<AnnouncementItem> {
    const { data } = await api.post('/super-admin/announcements/', payload)
    return data
  },

  async updateAnnouncement(id: number, payload: Partial<AnnouncementItem>): Promise<AnnouncementItem> {
    const { data } = await api.patch(`/super-admin/announcements/${id}/`, payload)
    return data
  },

  async deleteAnnouncement(id: number): Promise<void> {
    await api.delete(`/super-admin/announcements/${id}/`)
  },

  // Payment Gateway
  async getGatewayConfig(): Promise<any> {
    const { data } = await api.get('/super-admin/payment-gateway/')
    return data.data ?? data
  },

  async updateGatewayConfig(payload: any): Promise<any> {
    const { data } = await api.patch('/super-admin/payment-gateway/', payload)
    return data.data ?? data
  },
}
