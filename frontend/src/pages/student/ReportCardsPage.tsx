import { useState, useEffect } from 'react'
import PageLayout from '@/components/layout/PageLayout'
import { academicsService, type GeneratedReportCard, type IssuedCertificate } from '@/services/academics/academicsService'
import { Bone } from '@/components/shared/Skeleton'

const STATUS_STYLES: Record<string, { dot: string; text: string; label: string }> = {
  draft:       { dot: 'bg-outline',   text: 'text-on-surface-variant', label: 'Draft' },
  final:       { dot: 'bg-primary',   text: 'text-primary',            label: 'Final' },
  distributed: { dot: 'bg-tertiary',  text: 'text-tertiary',           label: 'Distributed' },
}

type TabKey = 'report-cards' | 'certificates'

export default function ReportCardsPage() {
  const [activeTab, setActiveTab] = useState<TabKey>('report-cards')
  const [reportCards, setReportCards] = useState<GeneratedReportCard[]>([])
  const [certificates, setCertificates] = useState<IssuedCertificate[]>([])
  const [loadingCards, setLoadingCards] = useState(true)
  const [loadingCerts, setLoadingCerts] = useState(true)
  const [expandedCard, setExpandedCard] = useState<number | null>(null)
  const [expandedCert, setExpandedCert] = useState<number | null>(null)
  const [error, setError] = useState('')

  useEffect(() => {
    async function loadCards() {
      setLoadingCards(true)
      try {
        const data = await academicsService.getMyReportCards()
        setReportCards(data)
      } catch {
        setError('Failed to load report cards.')
      } finally {
        setLoadingCards(false)
      }
    }
    loadCards()
  }, [])

  useEffect(() => {
    async function loadCerts() {
      setLoadingCerts(true)
      try {
        const data = await academicsService.getMyCertificates()
        setCertificates(data)
      } catch {
        setError('Failed to load certificates.')
      } finally {
        setLoadingCerts(false)
      }
    }
    loadCerts()
  }, [])

  function formatDate(d: string) {
    return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
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
            <div className="flex gap-6 text-sm flex-wrap">
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
          <p className="text-on-surface-variant text-sm">Report card data available. Contact your school for a formatted copy.</p>
        )}
      </div>
    )
  }

  const tabs: { key: TabKey; label: string; icon: string }[] = [
    { key: 'report-cards', label: 'Report Cards', icon: 'description' },
    { key: 'certificates', label: 'Certificates', icon: 'workspace_premium' },
  ]

  return (
    <PageLayout sidebar>
      <main className="pb-20 md:pb-0">
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-6 md:py-10 space-y-8 md:space-y-12">
          {/* Header */}
          <div className="space-y-2">
            <span className="font-label text-xs font-semibold tracking-widest text-on-surface-variant uppercase mb-2 block">Academic Records</span>
            <h2 className="font-headline font-extrabold text-3xl md:text-4xl text-on-surface">My Report Cards & Certificates</h2>
          </div>

          {error && (
            <div className="bg-error/10 text-error px-4 py-3 rounded-lg text-sm font-medium flex items-center gap-2">
              <span className="material-symbols-outlined text-lg">error</span>
              {error}
            </div>
          )}

          {/* Tabs */}
          <div className="flex gap-1 bg-surface-container-low rounded-xl p-1 w-fit">
            {tabs.map(tab => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                  activeTab === tab.key
                    ? 'bg-primary text-on-primary shadow-md'
                    : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high'
                }`}
              >
                <span className="material-symbols-outlined text-lg">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </div>

          {/* Report Cards Tab */}
          {activeTab === 'report-cards' && (
            <div className="space-y-3">
              {loadingCards ? (
                Array.from({ length: 3 }).map((_, i) => <Bone key={i} className="h-20 rounded-xl w-full" />)
              ) : reportCards.length === 0 ? (
                <div className="py-16 text-center">
                  <span className="material-symbols-outlined text-5xl text-on-surface-variant/30">description</span>
                  <p className="text-on-surface-variant font-medium mt-3">No report cards available</p>
                  <p className="text-on-surface-variant/60 text-xs mt-1">Your report cards will appear here once they are generated.</p>
                </div>
              ) : (
                reportCards.map(card => {
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
                            <span className="material-symbols-outlined">description</span>
                          </div>
                          <div>
                            <p className="font-semibold text-on-surface">{card.template_name}</p>
                            <p className="text-xs text-on-surface-variant">{card.term_display} &middot; {card.board_type}</p>
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
                })
              )}
            </div>
          )}

          {/* Certificates Tab */}
          {activeTab === 'certificates' && (
            <div className="space-y-3">
              {loadingCerts ? (
                Array.from({ length: 3 }).map((_, i) => <Bone key={i} className="h-20 rounded-xl w-full" />)
              ) : certificates.length === 0 ? (
                <div className="py-16 text-center">
                  <span className="material-symbols-outlined text-5xl text-on-surface-variant/30">workspace_premium</span>
                  <p className="text-on-surface-variant font-medium mt-3">No certificates issued</p>
                  <p className="text-on-surface-variant/60 text-xs mt-1">Your certificates will appear here once they are issued.</p>
                </div>
              ) : (
                certificates.map(cert => {
                  const isExpanded = expandedCert === cert.id
                  return (
                    <div key={cert.id} className="bg-surface-container-lowest rounded-xl overflow-hidden transition-all">
                      <button
                        onClick={() => setExpandedCert(isExpanded ? null : cert.id)}
                        className="w-full px-5 py-4 flex items-center justify-between gap-4 hover:bg-surface transition-colors text-left"
                        aria-expanded={isExpanded}
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-lg bg-tertiary/10 text-tertiary flex items-center justify-center">
                            <span className="material-symbols-outlined">workspace_premium</span>
                          </div>
                          <div>
                            <p className="font-semibold text-on-surface">{cert.cert_type_display}</p>
                            <p className="text-xs text-on-surface-variant">Serial: {cert.serial_number}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <span className="text-xs text-on-surface-variant hidden sm:block">{formatDate(cert.issued_date)}</span>
                          <span className={`material-symbols-outlined text-on-surface-variant transition-transform ${isExpanded ? 'rotate-180' : ''}`}>expand_more</span>
                        </div>
                      </button>
                      {isExpanded && (
                        <div className="px-5 pb-5 pt-0 border-t border-outline-variant/10">
                          <div className="pt-4 space-y-4">
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                              <div>
                                <p className="text-xs text-on-surface-variant font-label uppercase tracking-widest">Type</p>
                                <p className="font-semibold text-on-surface mt-1">{cert.cert_type_display}</p>
                              </div>
                              <div>
                                <p className="text-xs text-on-surface-variant font-label uppercase tracking-widest">Serial No.</p>
                                <p className="font-semibold text-on-surface mt-1 font-mono">{cert.serial_number}</p>
                              </div>
                              <div>
                                <p className="text-xs text-on-surface-variant font-label uppercase tracking-widest">Issued Date</p>
                                <p className="font-semibold text-on-surface mt-1">{formatDate(cert.issued_date)}</p>
                              </div>
                              <div>
                                <p className="text-xs text-on-surface-variant font-label uppercase tracking-widest">Issued By</p>
                                <p className="font-semibold text-on-surface mt-1">{cert.issued_by_name}</p>
                              </div>
                            </div>
                            {cert.rendered_body && (
                              <div>
                                <h6 className="text-xs font-bold uppercase tracking-widest text-on-surface-variant font-label mb-2">Certificate Content</h6>
                                <div className="text-sm text-on-surface leading-relaxed whitespace-pre-wrap bg-surface-container-low px-4 py-3 rounded-lg">
                                  {cert.rendered_body}
                                </div>
                              </div>
                            )}
                            {cert.reason && (
                              <div>
                                <h6 className="text-xs font-bold uppercase tracking-widest text-on-surface-variant font-label mb-2">Reason</h6>
                                <p className="text-sm text-on-surface">{cert.reason}</p>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  )
                })
              )}
            </div>
          )}
        </div>
      </main>
    </PageLayout>
  )
}
