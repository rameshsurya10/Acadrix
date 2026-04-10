import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import PageLayout from '@/components/layout/PageLayout'
import { adminService, type AdmissionApplicationListItem, type AdmissionApplication } from '@/services/admin/adminService'
import { SkeletonApplicationCard, Bone } from '@/components/shared/Skeleton'

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  pending:            { label: 'Pending',          color: 'text-primary',  bg: 'bg-primary-fixed/30' },
  verified:           { label: 'Verified',         color: 'text-tertiary', bg: 'bg-tertiary-fixed/30' },
  missing_documents:  { label: 'Missing Documents',color: 'text-error',    bg: 'bg-error-container/50' },
  approved:           { label: 'Approved',         color: 'text-tertiary', bg: 'bg-tertiary-fixed/30' },
  rejected:           { label: 'Rejected',         color: 'text-error',    bg: 'bg-error-container/50' },
  finalized:          { label: 'Finalized',        color: 'text-secondary',bg: 'bg-secondary-container/50' },
}

const DOC_TYPE_LABELS: Record<string, string> = {
  birth_certificate: 'Birth Certificate',
  address_proof: 'Address Proof',
  transfer_certificate: 'Transfer Certificate',
  academic_transcript: 'Academic Transcript',
  medical: 'Medical Record',
  photo_id: 'Photo ID',
}

export default function AdmissionsPage() {
  const navigate = useNavigate()
  const [applications, setApplications] = useState<AdmissionApplicationListItem[]>([])
  const [selectedDetail, setSelectedDetail] = useState<AdmissionApplication | null>(null)
  const [loading, setLoading] = useState(true)
  const [detailLoading, setDetailLoading] = useState(false)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [updatingStatus, setUpdatingStatus] = useState(false)
  const [confirmAction, setConfirmAction] = useState<{ action: string; label: string } | null>(null)

  useEffect(() => {
    async function load() {
      setLoading(true)
      try {
        const params: Record<string, string> = { ordering: '-applied_at' }
        if (search) params.search = search
        if (statusFilter) params.status = statusFilter
        const result = await adminService.getApplications(params)
        setApplications(result.results)
        if (result.results.length > 0 && !selectedDetail) {
          loadDetail(result.results[0].id)
        }
      } catch (err) {
        console.error('Failed to load applications:', err)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [search, statusFilter])

  async function loadDetail(id: number) {
    setDetailLoading(true)
    try {
      const detail = await adminService.getApplication(id)
      setSelectedDetail(detail)
    } catch (err) {
      console.error('Failed to load application detail:', err)
    } finally {
      setDetailLoading(false)
    }
  }

  function requestStatusUpdate(action: string, label: string) {
    setConfirmAction({ action, label })
  }

  async function executeStatusUpdate() {
    if (!selectedDetail || !confirmAction) return
    setUpdatingStatus(true)
    try {
      const updated = await adminService.updateApplication(selectedDetail.id, { status: confirmAction.action as AdmissionApplication['status'] })
      setSelectedDetail(updated)
      setApplications(prev => prev.map(a => a.id === updated.id ? { ...a, status: updated.status } : a))
    } catch (err) {
      console.error('Failed to update status:', err)
    } finally {
      setUpdatingStatus(false)
      setConfirmAction(null)
    }
  }

  async function handleDocVerify(docId: number, status: string) {
    if (!selectedDetail) return
    try {
      await adminService.updateDocumentStatus(selectedDetail.id, docId, status)
      loadDetail(selectedDetail.id)
    } catch (err) {
      console.error('Failed to update document:', err)
    }
  }

  function getInitials(name: string) {
    return name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
  }

  function getStatus(s: string) {
    return STATUS_CONFIG[s] || { label: s, color: 'text-outline', bg: 'bg-surface-container-high' }
  }

  const pendingCount = applications.filter(a => ['pending', 'missing_documents'].includes(a.status)).length

  return (
    <PageLayout>
      <main className="max-w-7xl mx-auto px-4 md:px-8 py-6 md:py-10 pb-32">
        {/* Header */}
        <section className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 md:mb-12 gap-4 md:gap-6">
          <div className="space-y-2">
            <p className="font-label text-xs uppercase tracking-widest text-on-surface-variant font-semibold">Admissions Management</p>
            <h2 className="font-headline font-extrabold text-3xl md:text-4xl lg:text-5xl text-on-surface">New Admissions Portal</h2>
            <p className="text-on-surface-variant max-w-lg text-sm md:text-base">Manage pending applications, verify student documentation, and finalize enrollments.</p>
          </div>
          <button
            onClick={() => navigate('/admin/enrollment')}
            className="bg-gradient-to-r from-primary to-primary-container text-on-primary px-6 md:px-8 py-3 md:py-4 rounded-xl font-bold flex items-center gap-3 shadow-lg hover:shadow-primary/20 active:scale-95 transition-all"
          >
            <span className="material-symbols-outlined">person_add</span>
            Add New Student
          </button>
        </section>

        {/* Search & Filter */}
        <div className="bg-surface-container-low rounded-2xl p-3 md:p-4 mb-8 flex flex-col md:flex-row gap-3 md:gap-4 items-stretch md:items-center">
          <div className="relative flex-1 min-w-0">
            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant">search</span>
            <input
              className="w-full pl-12 pr-4 py-3 bg-surface-container-lowest border-none rounded-xl focus:ring-2 focus:ring-primary/20 text-sm"
              placeholder="Search by name, ID or guardian..."
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <div className="flex gap-2 flex-wrap">
            <select
              className="px-4 py-3 bg-surface-container-lowest text-on-surface-variant rounded-xl text-sm font-semibold border-none focus:ring-primary cursor-pointer"
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
            >
              <option value="">Status: All</option>
              <option value="pending">Pending</option>
              <option value="verified">Verified</option>
              <option value="missing_documents">Missing Documents</option>
              <option value="approved">Approved</option>
              <option value="finalized">Finalized</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-8 items-start">
          {/* Applications List */}
          <div className="lg:col-span-7 space-y-4">
            <div className="flex items-center justify-between px-2">
              <h3 className="font-headline font-bold text-lg">Applications</h3>
              {!loading && pendingCount > 0 && (
                <span className="text-xs font-semibold text-primary px-3 py-1 bg-primary-fixed rounded-full">{pendingCount} Pending Action</span>
              )}
            </div>

            {loading ? (
              <div className="space-y-4">
                {Array.from({ length: 4 }).map((_, i) => <SkeletonApplicationCard key={i} />)}
              </div>
            ) : applications.length === 0 ? (
              <div className="bg-surface-container-lowest p-12 rounded-2xl text-center">
                <span className="material-symbols-outlined text-4xl text-on-surface-variant mb-2 block">inbox</span>
                <p className="text-on-surface-variant">No applications found.</p>
              </div>
            ) : (
              applications.map(app => {
                const st = getStatus(app.status)
                const isSelected = selectedDetail?.id === app.id
                return (
                  <div
                    key={app.id}
                    onClick={() => loadDetail(app.id)}
                    className={`p-4 md:p-5 rounded-2xl flex items-center justify-between gap-4 cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-surface-container-lowest border-l-4 border-primary shadow-sm'
                        : 'bg-surface hover:bg-surface-container-high'
                    }`}
                  >
                    <div className="flex items-center gap-3 md:gap-4 min-w-0">
                      <div className={`w-10 h-10 md:w-12 md:h-12 rounded-xl flex items-center justify-center font-bold text-sm ${
                        isSelected ? 'bg-surface-container-low text-primary' : 'bg-surface-container-highest text-on-surface-variant'
                      }`}>
                        {getInitials(app.applicant_name)}
                      </div>
                      <div className="min-w-0">
                        <p className={`font-bold text-on-surface truncate ${isSelected ? '' : 'group-hover:text-primary'}`}>{app.applicant_name}</p>
                        <p className="text-xs text-on-surface-variant">ID: {app.application_id}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 md:gap-8 flex-shrink-0">
                      <span className={`flex items-center gap-2 text-xs font-bold ${st.color} ${st.bg} px-2 md:px-3 py-1.5 rounded-full`}>
                        <span className={`w-1.5 h-1.5 rounded-full bg-current ${app.status === 'pending' ? 'animate-pulse' : ''}`} />
                        <span className="hidden sm:inline">{st.label}</span>
                      </span>
                      <span className="material-symbols-outlined text-on-surface-variant hidden md:block">chevron_right</span>
                    </div>
                  </div>
                )
              })
            )}
          </div>

          {/* Detail Panel */}
          <div className="lg:col-span-5 space-y-6">
            {detailLoading ? (
              <div className="bg-surface-container-lowest rounded-3xl p-8 space-y-6">
                <div className="flex flex-col items-center space-y-4">
                  <Bone className="w-24 h-24 rounded-2xl" />
                  <Bone className="w-40 h-6 rounded-md" />
                  <Bone className="w-28 h-4 rounded-md" />
                </div>
                <Bone className="w-32 h-3 rounded-md" />
                <div className="space-y-4">
                  <Bone className="w-full h-16 rounded-xl" />
                  <Bone className="w-full h-16 rounded-xl" />
                  <Bone className="w-full h-16 rounded-xl" />
                </div>
              </div>
            ) : selectedDetail ? (
              <>
                <div className="bg-surface-container-lowest rounded-3xl p-6 md:p-8 shadow-sm relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16 blur-3xl" />
                  <div className="flex flex-col items-center mb-6 md:mb-8 relative z-10">
                    <div className="w-20 h-20 md:w-24 md:h-24 rounded-2xl bg-surface-container-low flex items-center justify-center font-bold text-2xl text-primary mb-4">
                      {getInitials(selectedDetail.applicant_name)}
                    </div>
                    <h3 className="font-headline font-bold text-xl md:text-2xl text-on-surface text-center">{selectedDetail.applicant_name}</h3>
                    <p className="text-on-surface-variant font-medium">{selectedDetail.grade_label || selectedDetail.program || 'General'} Enrollment</p>
                    <p className="text-xs text-on-surface-variant mt-1">{selectedDetail.applicant_email}</p>
                  </div>

                  {/* Documents */}
                  {selectedDetail.documents.length > 0 && (
                    <div className="space-y-4 md:space-y-6">
                      <h4 className="font-label text-xs uppercase tracking-widest text-on-surface-variant font-bold">Document Verification Checklist</h4>
                      {selectedDetail.documents.map(doc => (
                        <div
                          key={doc.id}
                          className={`flex items-center justify-between p-3 md:p-4 rounded-xl transition-all ${
                            doc.status === 'verified'
                              ? 'bg-surface hover:bg-surface-container-high'
                              : 'bg-surface-container-low border-2 border-dashed border-outline-variant/30'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                              doc.status === 'verified' ? 'bg-tertiary-fixed text-tertiary' : 'bg-surface-container-highest text-on-surface-variant'
                            }`}>
                              <span className="material-symbols-outlined text-lg" style={doc.status === 'verified' ? { fontVariationSettings: "'FILL' 1" } : {}}>
                                {doc.status === 'verified' ? 'check_circle' : 'description'}
                              </span>
                            </div>
                            <span className="text-sm font-semibold text-on-surface">{DOC_TYPE_LABELS[doc.doc_type] || doc.doc_type}</span>
                          </div>
                          <div className="flex gap-1">
                            {doc.file && (
                              <a href={doc.file} target="_blank" rel="noopener noreferrer" className="material-symbols-outlined text-on-surface-variant hover:text-primary p-2 rounded-lg hover:bg-surface-container-lowest transition-colors" title="Download">
                                download
                              </a>
                            )}
                            {doc.status !== 'verified' ? (
                              <button
                                onClick={() => handleDocVerify(doc.id, 'verified')}
                                className="material-symbols-outlined text-on-surface-variant hover:text-tertiary p-2 rounded-lg hover:bg-surface-container-lowest transition-colors"
                                title="Verify Document"
                              >
                                verified
                              </button>
                            ) : (
                              <span className="material-symbols-outlined text-tertiary p-2" style={{ fontVariationSettings: "'FILL' 1" }} title="Verified">
                                verified_user
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {selectedDetail.documents.length === 0 && (
                    <div className="text-center py-6 text-on-surface-variant text-sm">
                      No documents uploaded yet.
                    </div>
                  )}

                  {/* Confirmation Prompt */}
                  {confirmAction && (
                    <div className="mt-6 bg-surface-container-high rounded-xl p-4 flex items-center justify-between gap-4">
                      <p className="text-sm font-semibold text-on-surface">
                        Are you sure you want to <span className="lowercase">{confirmAction.label}</span> this application?
                      </p>
                      <div className="flex gap-2 flex-shrink-0">
                        <button
                          onClick={executeStatusUpdate}
                          disabled={updatingStatus}
                          className="px-4 py-2 bg-primary text-on-primary rounded-lg text-sm font-bold hover:opacity-90 transition-all disabled:opacity-50"
                        >
                          {updatingStatus ? 'Processing...' : 'Yes'}
                        </button>
                        <button
                          onClick={() => setConfirmAction(null)}
                          disabled={updatingStatus}
                          className="px-4 py-2 bg-surface-container-lowest text-on-surface-variant rounded-lg text-sm font-bold hover:bg-surface transition-all disabled:opacity-50"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="mt-4 md:mt-6 flex gap-3 md:gap-4">
                    {selectedDetail.status !== 'finalized' && selectedDetail.status !== 'rejected' && (
                      <button
                        onClick={() => requestStatusUpdate('finalized', 'Complete Admission')}
                        disabled={updatingStatus || confirmAction !== null}
                        className="flex-1 py-3 md:py-4 bg-tertiary text-on-tertiary rounded-xl font-bold shadow-md hover:opacity-90 transition-all active:scale-95 disabled:opacity-50"
                      >
                        Complete Admission
                      </button>
                    )}
                    {selectedDetail.status === 'pending' && (
                      <button
                        onClick={() => requestStatusUpdate('verified', 'Verify')}
                        disabled={updatingStatus || confirmAction !== null}
                        className="px-4 py-3 md:py-4 bg-primary text-on-primary rounded-xl font-bold hover:opacity-90 transition-all disabled:opacity-50"
                      >
                        Verify
                      </button>
                    )}
                    {selectedDetail.status !== 'finalized' && selectedDetail.status !== 'rejected' && (
                      <button
                        onClick={() => requestStatusUpdate('rejected', 'Reject')}
                        disabled={updatingStatus || confirmAction !== null}
                        className="px-4 py-3 md:py-4 bg-error text-on-primary rounded-xl font-bold hover:opacity-90 transition-all active:scale-95 disabled:opacity-50"
                      >
                        Reject
                      </button>
                    )}
                  </div>
                </div>

                {/* Guardian Info */}
                {selectedDetail.guardian_name && (
                  <div className="bg-primary/5 rounded-2xl p-5 md:p-6 border border-primary/10">
                    <div className="flex items-center gap-3 mb-3">
                      <span className="material-symbols-outlined text-primary">family_restroom</span>
                      <h5 className="font-headline font-bold text-on-surface">Guardian Information</h5>
                    </div>
                    <div className="space-y-2 text-sm text-on-surface-variant">
                      <p><span className="font-medium text-on-surface">{selectedDetail.guardian_name}</span></p>
                      {selectedDetail.guardian_phone && <p>Phone: {selectedDetail.guardian_phone}</p>}
                      {selectedDetail.guardian_email && <p>Email: {selectedDetail.guardian_email}</p>}
                    </div>
                  </div>
                )}
              </>
            ) : !loading && (
              <div className="bg-surface-container-lowest rounded-3xl p-12 text-center">
                <span className="material-symbols-outlined text-4xl text-on-surface-variant mb-3 block">touch_app</span>
                <p className="text-on-surface-variant">Select an application to view details.</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </PageLayout>
  )
}
