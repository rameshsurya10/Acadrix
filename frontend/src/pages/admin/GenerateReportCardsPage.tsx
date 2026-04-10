import { useState, useEffect, useCallback } from 'react'
import PageLayout from '@/components/layout/PageLayout'
import { academicsService, type ReportCardTemplate, type ReportCardTerm, type GeneratedReportCard } from '@/services/academics/academicsService'
import { adminService, type Section } from '@/services/admin/adminService'
import { Bone } from '@/components/shared/Skeleton'

const STATUS_STYLES: Record<string, { dot: string; text: string; label: string }> = {
  draft:       { dot: 'bg-outline',   text: 'text-on-surface-variant', label: 'Draft' },
  final:       { dot: 'bg-primary',   text: 'text-primary',            label: 'Final' },
  distributed: { dot: 'bg-tertiary',  text: 'text-tertiary',           label: 'Distributed' },
}

export default function GenerateReportCardsPage() {
  const [templates, setTemplates] = useState<ReportCardTemplate[]>([])
  const [terms, setTerms] = useState<ReportCardTerm[]>([])
  const [sections, setSections] = useState<Section[]>([])
  const [reportCards, setReportCards] = useState<GeneratedReportCard[]>([])

  const [selectedTemplate, setSelectedTemplate] = useState('')
  const [selectedTerm, setSelectedTerm] = useState('')
  const [selectedSection, setSelectedSection] = useState('')

  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)
  const [cardsLoading, setCardsLoading] = useState(false)
  const [expandedCard, setExpandedCard] = useState<number | null>(null)
  const [error, setError] = useState('')
  const [successMsg, setSuccessMsg] = useState('')

  useEffect(() => {
    async function init() {
      setLoading(true)
      try {
        const tplRes = await academicsService.getTemplates()
        setTemplates(tplRes.results)
      } catch {
        setError('Failed to load templates.')
      } finally {
        setLoading(false)
      }
    }
    init()
  }, [])

  // Load terms when template changes
  useEffect(() => {
    if (!selectedTemplate) { setTerms([]); setSelectedTerm(''); return }
    async function loadTerms() {
      try {
        const res = await academicsService.getTerms({ template: selectedTemplate })
        setTerms(res.results)
        setSelectedTerm('')
      } catch {
        setError('Failed to load terms.')
      }
    }
    loadTerms()
  }, [selectedTemplate])

  // Load sections filtered by template's grade when template changes
  useEffect(() => {
    if (!selectedTemplate) { setSections([]); setSelectedSection(''); return }
    const tpl = templates.find(t => t.id === Number(selectedTemplate))
    if (!tpl) return
    async function loadSections() {
      try {
        const res = await adminService.getSections({ grade: String(tpl!.grade) })
        setSections(res)
        setSelectedSection('')
      } catch {
        setError('Failed to load sections.')
      }
    }
    loadSections()
  }, [selectedTemplate, templates])

  // Load generated report cards when template + term change
  const loadReportCards = useCallback(async () => {
    if (!selectedTemplate || !selectedTerm) { setReportCards([]); return }
    setCardsLoading(true)
    try {
      const params: Record<string, string> = { template: selectedTemplate, term: selectedTerm }
      const res = await academicsService.getReportCards(params)
      setReportCards(res.results)
    } catch {
      setError('Failed to load report cards.')
    } finally {
      setCardsLoading(false)
    }
  }, [selectedTemplate, selectedTerm])

  useEffect(() => { loadReportCards() }, [loadReportCards])

  async function handleGenerate() {
    if (!selectedTerm || !selectedSection) {
      setError('Please select a template, term, and section.')
      return
    }
    setGenerating(true)
    setError('')
    setSuccessMsg('')
    try {
      const res = await academicsService.generateReportCards({
        section_id: Number(selectedSection),
        term_id: Number(selectedTerm),
      })
      setSuccessMsg(res.message || `Successfully generated ${res.count} report cards.`)
      await loadReportCards()
    } catch {
      setError('Failed to generate report cards. Please try again.')
    } finally {
      setGenerating(false)
    }
  }

  function formatDate(d: string) {
    return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })
  }

  function renderSnapshot(snapshot: Record<string, unknown>) {
    if (!snapshot) return <p className="text-on-surface-variant text-sm">No data available.</p>

    const subjects = snapshot.subjects as Array<Record<string, unknown>> | undefined
    const attendance = snapshot.attendance as Record<string, unknown> | undefined
    const remarks = snapshot.remarks as string | undefined

    return (
      <div className="space-y-4">
        {subjects && subjects.length > 0 && (
          <div>
            <h6 className="text-xs font-bold uppercase tracking-widest text-on-surface-variant font-label mb-2">Subjects</h6>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-outline-variant/20">
                    <th className="text-left py-2 px-3 text-xs font-bold text-on-surface-variant">Subject</th>
                    <th className="text-left py-2 px-3 text-xs font-bold text-on-surface-variant">Marks</th>
                    <th className="text-left py-2 px-3 text-xs font-bold text-on-surface-variant">Grade</th>
                  </tr>
                </thead>
                <tbody>
                  {subjects.map((s, i) => (
                    <tr key={i} className="border-b border-outline-variant/10">
                      <td className="py-2 px-3 text-on-surface">{String(s.name ?? s.subject ?? '')}</td>
                      <td className="py-2 px-3 text-on-surface font-semibold">{String(s.marks ?? s.score ?? '-')}</td>
                      <td className="py-2 px-3">
                        <span className="bg-primary/10 text-primary text-xs px-2 py-0.5 rounded-full font-bold">
                          {String(s.grade ?? '-')}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
        {attendance && (
          <div>
            <h6 className="text-xs font-bold uppercase tracking-widest text-on-surface-variant font-label mb-2">Attendance</h6>
            <div className="flex gap-6 text-sm">
              <p><span className="text-on-surface-variant">Total Days:</span> <span className="font-semibold">{String(attendance.total_days ?? '-')}</span></p>
              <p><span className="text-on-surface-variant">Present:</span> <span className="font-semibold">{String(attendance.present ?? '-')}</span></p>
              <p><span className="text-on-surface-variant">Percentage:</span> <span className="font-semibold">{String(attendance.percentage ?? '-')}%</span></p>
            </div>
          </div>
        )}
        {remarks && (
          <div>
            <h6 className="text-xs font-bold uppercase tracking-widest text-on-surface-variant font-label mb-2">Remarks</h6>
            <p className="text-sm text-on-surface bg-surface-container-low px-4 py-3 rounded-lg">{remarks}</p>
          </div>
        )}
        {!subjects && !attendance && !remarks && (
          <p className="text-on-surface-variant text-sm">Raw data available. Contact administrator for formatted view.</p>
        )}
      </div>
    )
  }

  return (
    <PageLayout sidebar>
      <main className="pb-20 md:pb-0">
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-6 md:py-10 space-y-8 md:space-y-12">
          {/* Header */}
          <div className="space-y-2">
            <span className="font-label text-xs font-semibold tracking-widest text-on-surface-variant uppercase mb-2 block">Academics</span>
            <h2 className="font-headline font-extrabold text-3xl md:text-4xl text-on-surface">Generate Report Cards</h2>
          </div>

          {error && (
            <div className="bg-error/10 text-error px-4 py-3 rounded-lg text-sm font-medium flex items-center gap-2">
              <span className="material-symbols-outlined text-lg">error</span>
              {error}
              <button onClick={() => setError('')} className="ml-auto"><span className="material-symbols-outlined text-sm">close</span></button>
            </div>
          )}

          {successMsg && (
            <div className="bg-tertiary/10 text-tertiary px-4 py-3 rounded-lg text-sm font-medium flex items-center gap-2">
              <span className="material-symbols-outlined text-lg">check_circle</span>
              {successMsg}
              <button onClick={() => setSuccessMsg('')} className="ml-auto"><span className="material-symbols-outlined text-sm">close</span></button>
            </div>
          )}

          {/* Controls */}
          <div className="bg-surface-container-lowest rounded-xl p-6 md:p-8 space-y-6">
            <h3 className="text-lg font-bold font-headline">Generation Settings</h3>
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                <Bone className="h-12 rounded-lg" />
                <Bone className="h-12 rounded-lg" />
                <Bone className="h-12 rounded-lg" />
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                <div className="space-y-1.5">
                  <label htmlFor="gen-template" className="text-xs font-bold uppercase tracking-widest text-on-surface-variant font-label">Template *</label>
                  <select
                    id="gen-template"
                    value={selectedTemplate}
                    onChange={e => setSelectedTemplate(e.target.value)}
                    className="w-full bg-surface-container-low border-none rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-primary cursor-pointer"
                  >
                    <option value="">Select template</option>
                    {templates.map(t => <option key={t.id} value={t.id}>{t.name} ({t.board_type_display || t.board_type})</option>)}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label htmlFor="gen-term" className="text-xs font-bold uppercase tracking-widest text-on-surface-variant font-label">Term *</label>
                  <select
                    id="gen-term"
                    value={selectedTerm}
                    onChange={e => setSelectedTerm(e.target.value)}
                    disabled={!selectedTemplate}
                    className="w-full bg-surface-container-low border-none rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-primary cursor-pointer disabled:opacity-50"
                  >
                    <option value="">Select term</option>
                    {terms.map(t => <option key={t.id} value={t.id}>{t.term_display || t.term}</option>)}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label htmlFor="gen-section" className="text-xs font-bold uppercase tracking-widest text-on-surface-variant font-label">Section *</label>
                  <select
                    id="gen-section"
                    value={selectedSection}
                    onChange={e => setSelectedSection(e.target.value)}
                    disabled={!selectedTemplate}
                    className="w-full bg-surface-container-low border-none rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-primary cursor-pointer disabled:opacity-50"
                  >
                    <option value="">Select section</option>
                    {sections.map(s => <option key={s.id} value={s.id}>{s.display_name || s.name}</option>)}
                  </select>
                </div>
              </div>
            )}
            <div className="flex justify-end">
              <button
                onClick={handleGenerate}
                disabled={generating || !selectedTerm || !selectedSection}
                className="flex items-center gap-2 bg-primary text-on-primary px-6 py-3 rounded-xl font-bold text-sm hover:opacity-90 transition-opacity disabled:opacity-50"
              >
                {generating && <span className="material-symbols-outlined text-sm animate-spin">progress_activity</span>}
                <span className="material-symbols-outlined text-lg">auto_awesome</span>
                Generate Report Cards
              </button>
            </div>
          </div>

          {/* Generated Report Cards */}
          <div className="space-y-6">
            <div className="flex items-end justify-between border-b border-outline-variant/20 pb-4">
              <div className="space-y-1">
                <h3 className="text-lg md:text-xl font-bold font-headline">Generated Report Cards</h3>
                <p className="text-sm text-on-surface-variant">
                  {selectedTemplate && selectedTerm ? `Showing cards for selected template and term` : 'Select a template and term to view generated cards'}
                </p>
              </div>
              {reportCards.length > 0 && (
                <span className="text-xs font-bold text-on-surface-variant bg-surface-container-high px-3 py-1.5 rounded-full">
                  {reportCards.length} cards
                </span>
              )}
            </div>

            {cardsLoading ? (
              <div className="space-y-3">
                {Array.from({ length: 3 }).map((_, i) => <Bone key={i} className="h-20 rounded-xl w-full" />)}
              </div>
            ) : !selectedTemplate || !selectedTerm ? (
              <div className="py-16 text-center">
                <span className="material-symbols-outlined text-5xl text-on-surface-variant/30">filter_alt</span>
                <p className="text-on-surface-variant font-medium mt-3">Select a template and term above</p>
                <p className="text-on-surface-variant/60 text-xs mt-1">Generated report cards will appear here.</p>
              </div>
            ) : reportCards.length === 0 ? (
              <div className="py-16 text-center">
                <span className="material-symbols-outlined text-5xl text-on-surface-variant/30">description</span>
                <p className="text-on-surface-variant font-medium mt-3">No report cards generated yet</p>
                <p className="text-on-surface-variant/60 text-xs mt-1">Select a section and click Generate to create report cards.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {reportCards.map(card => {
                  const st = STATUS_STYLES[card.status] ?? STATUS_STYLES.draft
                  const isExpanded = expandedCard === card.id
                  return (
                    <div key={card.id} className="bg-surface-container-lowest rounded-xl overflow-hidden transition-all">
                      <button
                        onClick={() => setExpandedCard(isExpanded ? null : card.id)}
                        className="w-full px-5 py-4 flex items-center justify-between gap-4 hover:bg-surface transition-colors text-left"
                        aria-expanded={isExpanded}
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                            <span className="material-symbols-outlined">person</span>
                          </div>
                          <div>
                            <p className="font-semibold text-on-surface">{card.student_name}</p>
                            <p className="text-xs text-on-surface-variant">{card.student_id_str} &middot; {card.section}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-2">
                            <span className={`w-2 h-2 rounded-full ${st.dot}`} />
                            <span className={`${st.text} font-bold text-xs uppercase tracking-tighter`}>{st.label}</span>
                          </div>
                          <span className="text-xs text-on-surface-variant hidden sm:block">{formatDate(card.generated_at)}</span>
                          <span className={`material-symbols-outlined text-on-surface-variant transition-transform ${isExpanded ? 'rotate-180' : ''}`}>expand_more</span>
                        </div>
                      </button>
                      {isExpanded && (
                        <div className="px-5 pb-5 pt-0 border-t border-outline-variant/10">
                          <div className="pt-4">
                            {renderSnapshot(card.data_snapshot)}
                          </div>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      </main>
    </PageLayout>
  )
}
