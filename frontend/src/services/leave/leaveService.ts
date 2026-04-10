import api from '@/lib/api'

// ── Types ─────────────────────────────────────────────────────────────

export interface LeaveType {
  id: number
  name: string
  code: string
  annual_quota: number
  carries_forward: boolean
  applicable_to: string
  is_active: boolean
}

export interface LeaveBalance {
  id: number
  user: number
  user_name: string
  leave_type: number
  leave_type_name: string
  allocated: number
  used: number
  carried_forward: number
  remaining: number
}

export interface LeaveApproval {
  approver_name: string
  action: string
  remarks: string
  acted_at: string
}

export interface LeaveApplication {
  id: number
  applicant: number
  applicant_name: string
  leave_type: number
  leave_type_name: string
  start_date: string
  end_date: string
  is_half_day: boolean
  reason: string
  days_count: number
  status: 'pending' | 'approved' | 'rejected' | 'cancelled'
  applied_at: string
  approval?: LeaveApproval
}

export interface CreateLeaveTypePayload {
  name: string
  code: string
  annual_quota: number
  carries_forward: boolean
  applicable_to: string
}

export interface ApplyLeavePayload {
  leave_type: number
  start_date: string
  end_date: string
  is_half_day: boolean
  reason: string
}

export interface ApproveLeavePayload {
  action: 'approved' | 'rejected'
  remarks?: string
}

export interface AllocateBalancesPayload {
  academic_year: string
  leave_type_id?: number
}

// ── Service ───────────────────────────────────────────────────────────

export const leaveService = {
  async getTypes() {
    const { data } = await api.get<LeaveType[]>('/leave/types/')
    return data
  },

  async createType(payload: CreateLeaveTypePayload) {
    const { data } = await api.post<LeaveType>('/leave/types/', payload)
    return data
  },

  async getBalances(params?: Record<string, string>) {
    const { data } = await api.get<LeaveBalance[]>('/leave/balances/', { params })
    return data
  },

  async applyLeave(payload: ApplyLeavePayload) {
    const { data } = await api.post<LeaveApplication>('/leave/apply/', payload)
    return data
  },

  async getMyLeaves(params?: Record<string, string>) {
    const { data } = await api.get<LeaveApplication[]>('/leave/my-leaves/', { params })
    return data
  },

  async getPendingApprovals() {
    const { data } = await api.get<LeaveApplication[]>('/leave/pending/')
    return data
  },

  async approveLeave(id: number, payload: ApproveLeavePayload) {
    const { data } = await api.post<LeaveApplication>(`/leave/${id}/approve/`, payload)
    return data
  },

  async cancelLeave(id: number) {
    const { data } = await api.post<LeaveApplication>(`/leave/${id}/cancel/`)
    return data
  },

  async allocateBalances(payload: AllocateBalancesPayload) {
    const { data } = await api.post('/leave/allocate/', payload)
    return data
  },

  async getReport(params?: Record<string, string>) {
    const { data } = await api.get('/leave/report/', { params })
    return data
  },
}
