import api from '@/lib/api'

// ── Types ─────────────────────────────────────────────────────────────

export interface StaffProfile {
  id: number
  user: number
  full_name: string
  email: string
  employee_id: string
  designation: string
  department: number
  department_name: string
  employment_type: string
  date_of_joining: string
  bank_name: string
  pan_number: string
  aadhar_number: string
  is_active: boolean
}

export interface SalaryStructure {
  id: number
  user: number
  user_name?: string
  basic: number
  hra: number
  da: number
  conveyance: number
  medical: number
  special_allowance: number
  pf_employee_pct: number
  esi_employee_pct: number
  professional_tax: number
  tds_pct: number
  gross: number
  total_deductions: number
  net: number
  effective_from: string
  is_active: boolean
}

export interface PayrollRun {
  id: number
  month: number
  year: number
  academic_year_label: string
  status: 'draft' | 'processed' | 'finalized'
  total_gross: number
  total_deductions: number
  total_net: number
  payslip_count: number
  processed_at: string | null
}

export interface PayslipEntry {
  id: number
  staff: number
  staff_name: string
  staff_email: string
  basic: number
  hra: number
  da: number
  gross_salary: number
  pf_employee: number
  esi_employee: number
  professional_tax: number
  tds: number
  total_deductions: number
  net_salary: number
  working_days: number
  days_present: number
  days_absent: number
  bonus: number
  status: 'draft' | 'processed' | 'finalized'
}

export interface CreateStaffPayload {
  user: number
  employee_id: string
  designation: string
  department: number
  employment_type: string
  date_of_joining: string
  bank_name?: string
  pan_number?: string
  aadhar_number?: string
}

export interface CreateSalaryStructurePayload {
  user: number
  basic: number
  hra: number
  da: number
  conveyance: number
  medical: number
  special_allowance: number
  pf_employee_pct: number
  esi_employee_pct: number
  professional_tax: number
  tds_pct: number
  effective_from: string
}

export interface CreatePayrollRunPayload {
  month: number
  year: number
}

export interface ProcessPayrollPayload {
  payroll_run_id: number
}

export interface FinalizePayrollPayload {
  payroll_run_id: number
}

// ── Service ───────────────────────────────────────────────────────────

export const hrService = {
  async getStaff(params?: Record<string, string>) {
    const { data } = await api.get<StaffProfile[]>('/hr/staff-profiles/', { params })
    return data
  },

  async createStaff(payload: CreateStaffPayload) {
    const { data } = await api.post<StaffProfile>('/hr/staff-profiles/', payload)
    return data
  },

  async getSalaryStructures(params?: Record<string, string>) {
    const { data } = await api.get<SalaryStructure[]>('/hr/salary-structures/', { params })
    return data
  },

  async createSalaryStructure(payload: CreateSalaryStructurePayload) {
    const { data } = await api.post<SalaryStructure>('/hr/salary-structures/', payload)
    return data
  },

  async getPayrollRuns(params?: Record<string, string>) {
    const { data } = await api.get<PayrollRun[]>('/hr/payroll-runs/', { params })
    return data
  },

  async createPayrollRun(payload: CreatePayrollRunPayload) {
    const { data } = await api.post<PayrollRun>('/hr/payroll-runs/', payload)
    return data
  },

  async processPayroll(payload: ProcessPayrollPayload) {
    const { data } = await api.post('/hr/process-payroll/', payload)
    return data
  },

  async finalizePayroll(payload: FinalizePayrollPayload) {
    const { data } = await api.post('/hr/finalize-payroll/', payload)
    return data
  },

  async getPayslips(params?: Record<string, string>) {
    const { data } = await api.get<PayslipEntry[]>('/hr/payslips/', { params })
    return data
  },

  async getMyPayslips() {
    const { data } = await api.get<PayslipEntry[]>('/hr/my-payslips/')
    return data
  },
}
