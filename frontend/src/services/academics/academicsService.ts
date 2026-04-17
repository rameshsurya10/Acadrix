import api from '@/lib/api'

// ── Types ─────────────────────────────────────────────────────────────

export interface ReportCardTemplate {
  id: number
  name: string
  board_type: string
  board_type_display: string
  grade: number
  grade_label: string
  academic_year: number
  academic_year_label: string
  grading_scale: string
  grading_scale_display: string
  co_scholastic_areas: { area: string; grade: string }[]
  show_attendance: boolean
  show_remarks: boolean
  show_rank: boolean
  header_text: string
  footer_text: string
  is_active: boolean
  terms: ReportCardTerm[]
  created_at: string
}

export interface ReportCardTerm {
  id: number
  template: number
  term: string
  term_display: string
  assessment_ids: number[]
  grade_thresholds: { min: number; max: number; grade: string }[]
}

export interface GeneratedReportCard {
  id: number
  student_name: string
  student_id_str: string
  section: string
  template_name: string
  term_display: string
  board_type: string
  status: string
  data_snapshot: Record<string, unknown>
  generated_at: string
}

export interface CertificateTemplate {
  id: number
  name: string
  cert_type: string
  cert_type_display: string
  body_template: string
  is_active: boolean
  created_at: string
}

export interface IssuedCertificate {
  id: number
  student_name: string
  student_id_str: string
  serial_number: string
  cert_type_display: string
  issued_date: string
  issued_by_name: string
  rendered_body: string
  reason: string
  created_at: string
}

// ── Service ───────────────────────────────────────────────────────────

export const academicsService = {
  // ── Report Card Templates ──────────────────────────────────────────

  async getTemplates(params?: Record<string, string>): Promise<{ results: ReportCardTemplate[]; count: number }> {
    const { data } = await api.get('/academics/report-templates/', { params })
    return { results: data.results ?? data.data ?? data, count: data.count ?? (data.results ?? data.data ?? data).length }
  },

  async createTemplate(payload: Partial<ReportCardTemplate>): Promise<ReportCardTemplate> {
    const { data } = await api.post('/academics/report-templates/', payload)
    return data.data ?? data
  },

  async updateTemplate(id: number, payload: Partial<ReportCardTemplate>): Promise<ReportCardTemplate> {
    const { data } = await api.patch(`/academics/report-templates/${id}/`, payload)
    return data.data ?? data
  },

  async deleteTemplate(id: number): Promise<void> {
    await api.delete(`/academics/report-templates/${id}/`)
  },

  // ── Report Card Terms ──────────────────────────────────────────────

  async getTerms(params?: Record<string, string>): Promise<{ results: ReportCardTerm[]; count: number }> {
    const { data } = await api.get('/academics/report-terms/', { params })
    return { results: data.results ?? data.data ?? data, count: data.count ?? (data.results ?? data.data ?? data).length }
  },

  async createTerm(payload: Partial<ReportCardTerm>): Promise<ReportCardTerm> {
    const { data } = await api.post('/academics/report-terms/', payload)
    return data.data ?? data
  },

  async updateTerm(id: number, payload: Partial<ReportCardTerm>): Promise<ReportCardTerm> {
    const { data } = await api.patch(`/academics/report-terms/${id}/`, payload)
    return data.data ?? data
  },

  // ── Generate Report Cards ──────────────────────────────────────────

  async generateReportCards(payload: { section_id: number; term_id: number }): Promise<{ success: boolean; message: string; count: number }> {
    const { data } = await api.post('/academics/generate-report-cards/', payload)
    return data
  },

  // ── Generated Report Cards ─────────────────────────────────────────

  async getReportCards(params?: Record<string, string>): Promise<{ results: GeneratedReportCard[]; count: number }> {
    const { data } = await api.get('/academics/report-cards/', { params })
    return { results: data.results ?? data.data ?? data, count: data.count ?? (data.results ?? data.data ?? data).length }
  },

  async getMyReportCards(): Promise<GeneratedReportCard[]> {
    const { data } = await api.get('/academics/my/report-cards/')
    return data.results ?? data.data ?? data
  },

  // ── Certificate Templates ──────────────────────────────────────────

  async getCertTemplates(params?: Record<string, string>): Promise<{ results: CertificateTemplate[]; count: number }> {
    const { data } = await api.get('/academics/certificate-templates/', { params })
    return { results: data.results ?? data.data ?? data, count: data.count ?? (data.results ?? data.data ?? data).length }
  },

  async createCertTemplate(payload: Partial<CertificateTemplate>): Promise<CertificateTemplate> {
    const { data } = await api.post('/academics/certificate-templates/', payload)
    return data.data ?? data
  },

  async updateCertTemplate(id: number, payload: Partial<CertificateTemplate>): Promise<CertificateTemplate> {
    const { data } = await api.patch(`/academics/certificate-templates/${id}/`, payload)
    return data.data ?? data
  },

  // ── Issue Certificate ──────────────────────────────────────────────

  async issueCertificate(payload: Record<string, unknown>): Promise<{ success: boolean; data: IssuedCertificate; message: string }> {
    const { data } = await api.post('/academics/issue-certificate/', payload)
    return data
  },

  // ── Issued Certificates ────────────────────────────────────────────

  async getCertificates(params?: Record<string, string>): Promise<{ results: IssuedCertificate[]; count: number }> {
    const { data } = await api.get('/academics/certificates/', { params })
    return { results: data.results ?? data.data ?? data, count: data.count ?? (data.results ?? data.data ?? data).length }
  },

  async getMyCertificates(): Promise<IssuedCertificate[]> {
    const { data } = await api.get('/academics/my/certificates/')
    return data.results ?? data.data ?? data
  },

  // ── PDF Downloads ──────────────────────────────────────────────────

  async downloadReportCardPdf(reportCardId: number): Promise<Blob> {
    const response = await api.get(`/academics/report-cards/${reportCardId}/pdf/`, {
      responseType: 'blob',
    })
    return response.data as Blob
  },

  async downloadCertificatePdf(certificateId: number): Promise<Blob> {
    const response = await api.get(`/academics/certificates/${certificateId}/pdf/`, {
      responseType: 'blob',
    })
    return response.data as Blob
  },
}
