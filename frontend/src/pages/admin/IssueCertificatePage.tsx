import { useState, useEffect, useRef } from 'react'
import PageLayout from '@/components/layout/PageLayout'
import { academicsService, type CertificateTemplate, type IssuedCertificate } from '@/services/academics/academicsService'
import { adminService, type StudentProfile } from '@/services/admin/adminService'
import { Bone } from '@/components/shared/Skeleton'

export default function IssueCertificatePage() {
  const [students, setStudents] = useState<StudentProfile[]>([])
  const [certTemplates, setCertTemplates] = useState<CertificateTemplate[]>([])
  const [loading, setLoading] = useState(true)

  const [studentSearch, setStudentSearch] = useState('')
  const [selectedStudent, setSelectedStudent] = useState<StudentProfile | null>(null)
  const [selectedTemplate, setSelectedTemplate] = useState('')
  const [showDropdown, setShowDropdown] = useState(false)

  // TC-specific fields
  const [dateOfLeaving, setDateOfLeaving] = useState('')
  const [reasonForLeaving, setReasonForLeaving] = useState('')
  const [conduct, setConduct] = useState('good')
  const [qualifiedForPromotion, setQualifiedForPromotion] = useState(true)

  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [issuedCert, setIssuedCert] = useState<IssuedCertificate | null>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    async function init() {
      setLoading(true)
      try {
        const [studRes, certRes] = await Promise.all([
          adminService.getStudents(),
          academicsService.getCertTemplates(),
        ])
        setStudents(studRes.results)
        setCertTemplates(certRes.results)
      } catch {
        setError('Failed to load data.')
      } finally {
        setLoading(false)
      }
    }
    init()
  }, [])

  // Close dropdown on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowDropdown(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const filteredStudents = students.filter(s =>
    s.full_name.toLowerCase().includes(studentSearch.toLowerCase()) ||
    s.student_id.toLowerCase().includes(studentSearch.toLowerCase())
  )

  const selectedTemplateFull = certTemplates.find(t => t.id === Number(selectedTemplate))
  const isTc = selectedTemplateFull?.cert_type === 'tc'

  function selectStudent(s: StudentProfile) {
    setSelectedStudent(s)
    setStudentSearch(s.full_name)
    setShowDropdown(false)
  }

  async function handleIssue() {
    if (!selectedStudent || !selectedTemplate) {
      setError('Please select a student and certificate template.')
      return
    }
    setSubmitting(true)
    setError('')
    setIssuedCert(null)
    try {
      const payload: Record<string, unknown> = {
        student_id: selectedStudent.id,
        template_id: Number(selectedTemplate),
      }
      if (isTc) {
        payload.date_of_leaving = dateOfLeaving
        payload.reason_for_leaving = reasonForLeaving
        payload.conduct = conduct
        payload.qualified_for_promotion = qualifiedForPromotion
      }
      const res = await academicsService.issueCertificate(payload)
      setIssuedCert(res.data)
    } catch {
      setError('Failed to issue certificate. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  function handlePrint() {
    window.print()
  }

  function handleReset() {
    setSelectedStudent(null)
    setStudentSearch('')
    setSelectedTemplate('')
    setDateOfLeaving('')
    setReasonForLeaving('')
    setConduct('good')
    setQualifiedForPromotion(true)
    setIssuedCert(null)
    setError('')
  }

  return (
    <PageLayout sidebar>
      <main className="pb-20 md:pb-0">
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-6 md:py-10 space-y-8 md:space-y-12">
          {/* Header */}
          <div className="space-y-2">
            <span className="font-label text-xs font-semibold tracking-widest text-on-surface-variant uppercase mb-2 block">Academics</span>
            <h2 className="font-headline font-extrabold text-3xl md:text-4xl text-on-surface">Issue Certificate</h2>
          </div>

          {error && (
            <div className="bg-error/10 text-error px-4 py-3 rounded-lg text-sm font-medium flex items-center gap-2">
              <span className="material-symbols-outlined text-lg">error</span>
              {error}
              <button onClick={() => setError('')} className="ml-auto"><span className="material-symbols-outlined text-sm">close</span></button>
            </div>
          )}

          {/* Issued certificate result */}
          {issuedCert ? (
            <div className="space-y-6">
              <div className="bg-tertiary/10 text-tertiary px-4 py-3 rounded-lg text-sm font-medium flex items-center gap-2">
                <span className="material-symbols-outlined text-lg">check_circle</span>
                Certificate issued successfully! Serial: {issuedCert.serial_number}
              </div>

              {/* Printable certificate */}
              <div className="bg-surface-container-lowest rounded-xl p-8 md:p-12 print:p-0 print:rounded-none print:shadow-none" id="certificate-print">
                <div className="border-2 border-primary/20 rounded-lg p-8 md:p-12 space-y-6 max-w-3xl mx-auto">
                  <div className="text-center space-y-2 border-b border-outline-variant/20 pb-6">
                    <span className="material-symbols-outlined text-4xl text-primary print:hidden">workspace_premium</span>
                    <h3 className="text-2xl md:text-3xl font-extrabold font-headline text-on-surface">{issuedCert.cert_type_display}</h3>
                    <p className="text-xs text-on-surface-variant uppercase tracking-widest font-label">Serial No: {issuedCert.serial_number}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-xs text-on-surface-variant font-label uppercase tracking-widest">Student Name</p>
                      <p className="font-semibold text-on-surface mt-1">{issuedCert.student_name}</p>
                    </div>
                    <div>
                      <p className="text-xs text-on-surface-variant font-label uppercase tracking-widest">Student ID</p>
                      <p className="font-semibold text-on-surface mt-1">{issuedCert.student_id_str}</p>
                    </div>
                    <div>
                      <p className="text-xs text-on-surface-variant font-label uppercase tracking-widest">Date of Issue</p>
                      <p className="font-semibold text-on-surface mt-1">
                        {new Date(issuedCert.issued_date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-on-surface-variant font-label uppercase tracking-widest">Issued By</p>
                      <p className="font-semibold text-on-surface mt-1">{issuedCert.issued_by_name}</p>
                    </div>
                  </div>

                  {issuedCert.rendered_body && (
                    <div className="text-sm text-on-surface leading-relaxed whitespace-pre-wrap bg-surface-container-low rounded-lg p-6 mt-4">
                      {issuedCert.rendered_body}
                    </div>
                  )}

                  {issuedCert.reason && (
                    <div className="text-sm">
                      <p className="text-xs text-on-surface-variant font-label uppercase tracking-widest">Reason</p>
                      <p className="text-on-surface mt-1">{issuedCert.reason}</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex gap-3 print:hidden">
                <button
                  onClick={handlePrint}
                  className="flex items-center gap-2 bg-primary text-on-primary px-6 py-3 rounded-xl font-bold text-sm hover:opacity-90 transition-opacity"
                >
                  <span className="material-symbols-outlined text-lg">print</span>
                  Print Certificate
                </button>
                <button
                  onClick={handleReset}
                  className="flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm text-on-surface-variant hover:bg-surface-container-high transition-colors"
                >
                  <span className="material-symbols-outlined text-lg">add</span>
                  Issue Another
                </button>
              </div>
            </div>
          ) : (
            /* Issue Form */
            <div className="bg-surface-container-lowest rounded-xl p-6 md:p-8 space-y-6">
              <h3 className="text-lg font-bold font-headline">Certificate Details</h3>

              {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <Bone className="h-12 rounded-lg" />
                  <Bone className="h-12 rounded-lg" />
                </div>
              ) : (
                <div className="space-y-5">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    {/* Student search */}
                    <div className="space-y-1.5 relative" ref={dropdownRef}>
                      <label htmlFor="issue-student" className="text-xs font-bold uppercase tracking-widest text-on-surface-variant font-label">Student *</label>
                      <div className="relative">
                        <span className="material-symbols-outlined text-sm text-on-surface-variant absolute left-3 top-1/2 -translate-y-1/2">search</span>
                        <input
                          id="issue-student"
                          type="text"
                          value={studentSearch}
                          onChange={e => {
                            setStudentSearch(e.target.value)
                            setShowDropdown(true)
                            if (selectedStudent && e.target.value !== selectedStudent.full_name) {
                              setSelectedStudent(null)
                            }
                          }}
                          onFocus={() => setShowDropdown(true)}
                          className="w-full bg-surface-container-low border-none rounded-lg pl-10 pr-4 py-3 text-sm focus:ring-2 focus:ring-primary"
                          placeholder="Search by name or ID..."
                        />
                      </div>
                      {showDropdown && studentSearch && (
                        <div className="absolute z-20 top-full left-0 right-0 mt-1 bg-surface-container-lowest rounded-lg shadow-xl border border-outline-variant/10 max-h-60 overflow-y-auto">
                          {filteredStudents.length === 0 ? (
                            <p className="px-4 py-3 text-sm text-on-surface-variant">No students found.</p>
                          ) : (
                            filteredStudents.slice(0, 20).map(s => (
                              <button
                                key={s.id}
                                onClick={() => selectStudent(s)}
                                className="w-full px-4 py-3 text-left hover:bg-surface-container-low transition-colors flex items-center gap-3 text-sm"
                              >
                                <div className="w-8 h-8 rounded bg-primary/10 text-primary flex items-center justify-center text-xs font-bold">
                                  {s.full_name.charAt(0)}
                                </div>
                                <div>
                                  <p className="font-semibold text-on-surface">{s.full_name}</p>
                                  <p className="text-xs text-on-surface-variant">{s.student_id} {s.section_detail ? `- ${s.section_detail.name}` : ''}</p>
                                </div>
                              </button>
                            ))
                          )}
                        </div>
                      )}
                      {selectedStudent && (
                        <p className="text-xs text-tertiary font-medium mt-1">
                          Selected: {selectedStudent.full_name} ({selectedStudent.student_id})
                        </p>
                      )}
                    </div>

                    {/* Certificate template */}
                    <div className="space-y-1.5">
                      <label htmlFor="issue-template" className="text-xs font-bold uppercase tracking-widest text-on-surface-variant font-label">Certificate Template *</label>
                      <select
                        id="issue-template"
                        value={selectedTemplate}
                        onChange={e => setSelectedTemplate(e.target.value)}
                        className="w-full bg-surface-container-low border-none rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-primary cursor-pointer"
                      >
                        <option value="">Select template</option>
                        {certTemplates.filter(t => t.is_active).map(t => (
                          <option key={t.id} value={t.id}>{t.name} ({t.cert_type_display || t.cert_type})</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* TC additional fields */}
                  {isTc && (
                    <div className="border-t border-outline-variant/20 pt-5 space-y-5">
                      <p className="text-xs font-bold uppercase tracking-widest text-on-surface-variant font-label">Transfer Certificate Details</p>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div className="space-y-1.5">
                          <label htmlFor="tc-leave-date" className="text-xs font-bold uppercase tracking-widest text-on-surface-variant font-label">Date of Leaving</label>
                          <input
                            id="tc-leave-date"
                            type="date"
                            value={dateOfLeaving}
                            onChange={e => setDateOfLeaving(e.target.value)}
                            className="w-full bg-surface-container-low border-none rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-primary"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <label htmlFor="tc-conduct" className="text-xs font-bold uppercase tracking-widest text-on-surface-variant font-label">Conduct</label>
                          <select
                            id="tc-conduct"
                            value={conduct}
                            onChange={e => setConduct(e.target.value)}
                            className="w-full bg-surface-container-low border-none rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-primary cursor-pointer"
                          >
                            <option value="excellent">Excellent</option>
                            <option value="good">Good</option>
                            <option value="satisfactory">Satisfactory</option>
                            <option value="needs_improvement">Needs Improvement</option>
                          </select>
                        </div>
                        <div className="space-y-1.5 md:col-span-2">
                          <label htmlFor="tc-reason" className="text-xs font-bold uppercase tracking-widest text-on-surface-variant font-label">Reason for Leaving</label>
                          <input
                            id="tc-reason"
                            type="text"
                            value={reasonForLeaving}
                            onChange={e => setReasonForLeaving(e.target.value)}
                            className="w-full bg-surface-container-low border-none rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-primary"
                            placeholder="e.g. Transfer to another school"
                          />
                        </div>
                        <div className="flex items-center gap-2">
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={qualifiedForPromotion}
                              onChange={e => setQualifiedForPromotion(e.target.checked)}
                              className="rounded border-outline text-primary focus:ring-primary"
                            />
                            <span className="text-sm text-on-surface">Qualified for Promotion</span>
                          </label>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="flex justify-end pt-2">
                    <button
                      onClick={handleIssue}
                      disabled={submitting || !selectedStudent || !selectedTemplate}
                      className="flex items-center gap-2 bg-primary text-on-primary px-6 py-3 rounded-xl font-bold text-sm hover:opacity-90 transition-opacity disabled:opacity-50"
                    >
                      {submitting && <span className="material-symbols-outlined text-sm animate-spin">progress_activity</span>}
                      <span className="material-symbols-outlined text-lg">workspace_premium</span>
                      Issue Certificate
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </PageLayout>
  )
}
