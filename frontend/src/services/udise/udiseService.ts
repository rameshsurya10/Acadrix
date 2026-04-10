import api from '@/lib/api'

// ── Types ─────────────────────────────────────────────────────────────

export interface UDISEProfile {
  udise_code: string
  block_code: string
  district_code: string
  state_code: string
  school_category: string
  school_type: string
  management_type: string
  medium: string
  year_established: number
  affiliation_board: string
  affiliation_number: string
}

export interface UDISEAnnualData {
  id: number
  academic_year: number
  academic_year_label: string
  enrollment_data: Record<string, Record<string, number>>
  teacher_data: Record<string, number>
  infrastructure: Record<string, any>
  cwsn_count: number
  rte_count: number
  minority_count: number
  mid_day_meal: boolean
  has_boundary_wall: boolean
  has_ramp: boolean
  status: string
}

export interface UDISEExportLog {
  id: number
  academic_year: number
  exported_by_name: string
  exported_at: string
  format: string
  record_count: number
}

// ── Service ───────────────────────────────────────────────────────────

export const udiseService = {
  async getProfile(): Promise<UDISEProfile> {
    const { data } = await api.get('/udise/profile/')
    return data.data ?? data
  },

  async updateProfile(payload: Partial<UDISEProfile>): Promise<UDISEProfile> {
    const { data } = await api.patch('/udise/profile/', payload)
    return data.data ?? data
  },

  async getAnnualData(params?: Record<string, string>): Promise<UDISEAnnualData[]> {
    const { data } = await api.get('/udise/annual-data/', { params })
    return data.results ?? data.data ?? data
  },

  async createAnnualData(payload: Partial<UDISEAnnualData>): Promise<UDISEAnnualData> {
    const { data } = await api.post('/udise/annual-data/', payload)
    return data.data ?? data
  },

  async updateAnnualData(id: number, payload: Partial<UDISEAnnualData>): Promise<UDISEAnnualData> {
    const { data } = await api.patch(`/udise/annual-data/${id}/`, payload)
    return data.data ?? data
  },

  async autoPopulate(payload: { academic_year: number }): Promise<UDISEAnnualData> {
    const { data } = await api.post('/udise/auto-populate/', payload)
    return data.data ?? data
  },

  async validateData(payload: { academic_year: number }): Promise<{ valid: boolean; errors: string[] }> {
    const { data } = await api.post('/udise/validate/', payload)
    return data.data ?? data
  },

  async exportData(payload: { academic_year: number; format: string }): Promise<void> {
    const response = await api.post('/udise/export/', payload, { responseType: 'blob' })
    const url = window.URL.createObjectURL(new Blob([response.data]))
    const link = document.createElement('a')
    link.href = url
    const disposition = response.headers['content-disposition']
    const filename = disposition
      ? disposition.split('filename=')[1]?.replace(/"/g, '') ?? `udise_export.${payload.format}`
      : `udise_export.${payload.format}`
    link.setAttribute('download', filename)
    document.body.appendChild(link)
    link.click()
    link.remove()
    window.URL.revokeObjectURL(url)
  },

  async getExportLogs(): Promise<UDISEExportLog[]> {
    const { data } = await api.get('/udise/export-logs/')
    return data.results ?? data.data ?? data
  },
}
