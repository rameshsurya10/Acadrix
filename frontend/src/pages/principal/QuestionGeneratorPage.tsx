import { useState, useEffect, useCallback, useRef } from 'react'
import PageLayout from '@/components/layout/PageLayout'
import api from '@/lib/api'
import { Bone, SkeletonLine } from '@/components/shared/Skeleton'

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface SourceDocument {
  id: number
  uploaded_by_name: string
  file_name: string
  file_size_bytes: number
  subject_context: string
  uploaded_at: string
}

interface GeneratedQuestion {
  id: number
  reference_id: string
  question_text: string
  key_answer: string
  topic: string
  subject_name: string
  source_document_name: string
  marks: number
  difficulty: string
  grading_rubric: string
  status: string
  approved_by_name: string | null
  approved_at: string | null
}

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })
}

function DifficultyBadge({ difficulty }: { difficulty: string }) {
  const lower = difficulty.toLowerCase()
  const colorMap: Record<string, string> = {
    easy: 'bg-tertiary/10 text-tertiary',
    medium: 'bg-primary/10 text-primary',
    hard: 'bg-error/10 text-error',
  }
  const colors = colorMap[lower] ?? 'bg-surface-container-high text-on-surface-variant'
  return (
    <span className={`${colors} text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-widest`}>
      {difficulty}
    </span>
  )
}

function StatusBadge({ status }: { status: string }) {
  const lower = status.toLowerCase()
  const colorMap: Record<string, string> = {
    draft: 'bg-surface-container-high text-on-surface-variant',
    approved: 'bg-tertiary/10 text-tertiary',
    rejected: 'bg-error/10 text-error',
  }
  const colors = colorMap[lower] ?? 'bg-surface-container-high text-on-surface-variant'
  return (
    <span className={`${colors} text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-widest`}>
      {status}
    </span>
  )
}

function QuestionSkeleton() {
  return (
    <div className="bg-surface-container-lowest rounded-xl p-6 space-y-3">
      <div className="flex justify-between">
        <SkeletonLine width="w-32" height="h-4" />
        <Bone className="w-16 h-5 rounded-full" />
      </div>
      <Bone className="w-full h-5 rounded-md" />
      <Bone className="w-3/4 h-5 rounded-md" />
      <div className="flex gap-2 pt-2">
        <Bone className="w-16 h-6 rounded" />
        <Bone className="w-16 h-6 rounded" />
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Main Page                                                          */
/* ------------------------------------------------------------------ */

export default function QuestionGeneratorPage() {
  // Documents
  const [documents, setDocuments] = useState<SourceDocument[]>([])
  const [docsLoading, setDocsLoading] = useState(true)

  // Upload state
  const [uploadFile, setUploadFile] = useState<File | null>(null)
  const [subjectContext, setSubjectContext] = useState('')
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Phase 3.1: subject picker + AI generation fields
  const [subjectOptions, setSubjectOptions] = useState<{ id: number; name: string }[]>([])
  const [selectedSubjectId, setSelectedSubjectId] = useState<number | ''>('')
  const [numQuestions, setNumQuestions] = useState(10)
  const [generating, setGenerating] = useState(false)
  const [generationNotice, setGenerationNotice] = useState<string | null>(null)

  // Questions
  const [questions, setQuestions] = useState<GeneratedQuestion[]>([])
  const [questionsLoading, setQuestionsLoading] = useState(true)
  const [questionsError, setQuestionsError] = useState<string | null>(null)

  // Question filters
  const [statusFilter, setStatusFilter] = useState<string>('')
  const [difficultyFilter, setDifficultyFilter] = useState<string>('')

  // Collapsible answer state
  const [expandedAnswers, setExpandedAnswers] = useState<Set<number>>(new Set())

  // Action loading state (approve/reject)
  const [actionLoading, setActionLoading] = useState<Set<number>>(new Set())

  // Fetch documents
  useEffect(() => {
    let cancelled = false
    async function fetchDocs() {
      try {
        setDocsLoading(true)
        const res = await api.get('/principal/documents/')
        if (cancelled) return
        const data = res.data.results ?? res.data.data ?? res.data
        setDocuments(Array.isArray(data) ? data : [])
      } catch {
        // Silent; documents area will show empty state
      } finally {
        if (!cancelled) setDocsLoading(false)
      }
    }
    fetchDocs()
    return () => {
      cancelled = true
    }
  }, [])

  // Fetch available subjects for the dropdown (Phase 3.1)
  useEffect(() => {
    let cancelled = false
    api
      .get('/shared/subjects/')
      .then((res) => {
        if (cancelled) return
        const data = res.data.results ?? res.data.data ?? res.data
        setSubjectOptions(Array.isArray(data) ? data.map((s: { id: number; name: string }) => ({ id: s.id, name: s.name })) : [])
      })
      .catch(() => {
        // Silent — subject picker will just be empty
      })
    return () => { cancelled = true }
  }, [])

  // Fetch questions (with filters)
  const fetchQuestions = useCallback(async () => {
    try {
      setQuestionsLoading(true)
      setQuestionsError(null)
      const params: Record<string, string> = {}
      if (statusFilter) params.status = statusFilter
      if (difficultyFilter) params.difficulty = difficultyFilter
      const res = await api.get('/principal/questions/', { params })
      const data = res.data.results ?? res.data.data ?? res.data
      setQuestions(Array.isArray(data) ? data : [])
    } catch (err: unknown) {
      setQuestionsError(err instanceof Error ? err.message : 'Failed to load questions.')
    } finally {
      setQuestionsLoading(false)
    }
  }, [statusFilter, difficultyFilter])

  useEffect(() => {
    fetchQuestions()
  }, [fetchQuestions])

  // Upload handler (Phase 3.1: dispatches AI question generation task)
  const handleUpload = useCallback(async () => {
    if (!uploadFile || !subjectContext.trim()) return
    try {
      setUploading(true)
      setUploadError(null)
      setGenerationNotice(null)
      const formData = new FormData()
      formData.append('file', uploadFile)
      formData.append('subject_context', subjectContext.trim())
      if (selectedSubjectId) {
        formData.append('subject_id', String(selectedSubjectId))
        formData.append('num_questions', String(numQuestions))
      }
      const res = await api.post('/principal/documents/', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      const newDoc: SourceDocument = res.data.data ?? res.data
      setDocuments((prev) => [newDoc, ...prev])
      setUploadFile(null)
      setSubjectContext('')
      if (fileInputRef.current) fileInputRef.current.value = ''

      // If a subject was selected, AI generation was dispatched — poll for results
      if (selectedSubjectId) {
        setGenerating(true)
        setGenerationNotice('Generating questions with AI. This usually takes 10-30 seconds.')
        const existingIds = new Set(questions.map((q) => q.id))
        const startedAt = Date.now()
        const pollInterval = 3000
        const maxDuration = 120_000 // 2 min
        const timer = window.setInterval(async () => {
          try {
            const pollRes = await api.get('/principal/questions/', {
              params: { source_document: newDoc.id },
            })
            const fresh = pollRes.data.results ?? pollRes.data.data ?? pollRes.data
            const freshList: GeneratedQuestion[] = Array.isArray(fresh) ? fresh : []
            const newOnes = freshList.filter((q) => !existingIds.has(q.id))
            if (newOnes.length > 0) {
              window.clearInterval(timer)
              setGenerating(false)
              setGenerationNotice(`Generated ${newOnes.length} questions. Refreshing list...`)
              fetchQuestions()
              window.setTimeout(() => setGenerationNotice(null), 4000)
            } else if (Date.now() - startedAt > maxDuration) {
              window.clearInterval(timer)
              setGenerating(false)
              setGenerationNotice('Generation is taking longer than expected. It may still finish in the background — refresh the questions list later.')
            }
          } catch {
            // Non-fatal — keep polling until the timeout
          }
        }, pollInterval)
      }
    } catch (err: unknown) {
      setUploadError(err instanceof Error ? err.message : 'Upload failed. Please try again.')
    } finally {
      setUploading(false)
    }
  }, [uploadFile, subjectContext, selectedSubjectId, numQuestions, questions, fetchQuestions])

  // Approve / Reject handlers
  const handleApprove = useCallback(async (questionId: number) => {
    setActionLoading((prev) => new Set(prev).add(questionId))
    try {
      await api.post(`/principal/questions/${questionId}/approve/`)
      setQuestions((prev) =>
        prev.map((q) => (q.id === questionId ? { ...q, status: 'approved' } : q)),
      )
    } catch {
      // Could add error toast
    } finally {
      setActionLoading((prev) => {
        const next = new Set(prev)
        next.delete(questionId)
        return next
      })
    }
  }, [])

  const handleReject = useCallback(async (questionId: number) => {
    setActionLoading((prev) => new Set(prev).add(questionId))
    try {
      await api.post(`/principal/questions/${questionId}/reject/`)
      setQuestions((prev) =>
        prev.map((q) => (q.id === questionId ? { ...q, status: 'rejected' } : q)),
      )
    } catch {
      // Could add error toast
    } finally {
      setActionLoading((prev) => {
        const next = new Set(prev)
        next.delete(questionId)
        return next
      })
    }
  }, [])

  const toggleAnswer = useCallback((id: number) => {
    setExpandedAnswers((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }, [])

  return (
    <PageLayout>
      <main className="max-w-7xl mx-auto px-4 md:px-6 py-10 pb-32 space-y-10">
        {/* Header */}
        <section>
          <span className="font-label text-xs font-semibold tracking-widest text-on-surface-variant uppercase mb-2 block">
            Content Intelligence
          </span>
          <h2 className="font-headline font-extrabold text-3xl md:text-4xl text-on-surface tracking-tight">
            Question Generator
          </h2>
          <p className="text-on-surface-variant max-w-2xl leading-relaxed mt-2 text-sm">
            Upload source documents and manage AI-generated assessment questions.
          </p>
        </section>

        {/* Upload + Documents */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Upload Panel */}
          <div className="lg:col-span-2 bg-surface-container-lowest rounded-xl p-6 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary to-primary-container" />
            <h3 className="font-headline font-bold text-lg mb-5">Upload Source Document</h3>

            <div className="space-y-4">
              {/* File Input */}
              <div
                className="border-2 border-dashed border-outline-variant/30 rounded-xl p-8 bg-surface-container-low text-center hover:border-primary/40 transition-colors cursor-pointer"
                onClick={() => fileInputRef.current?.click()}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') fileInputRef.current?.click()
                }}
                aria-label="Select file to upload"
              >
                <span className="material-symbols-outlined text-4xl text-primary mb-3 block">upload_file</span>
                {uploadFile ? (
                  <div>
                    <p className="font-medium text-on-surface">{uploadFile.name}</p>
                    <p className="text-xs text-on-surface-variant mt-1">
                      {formatFileSize(uploadFile.size)}
                    </p>
                  </div>
                ) : (
                  <p className="text-on-surface-variant text-sm">
                    Click to select a PDF, document, or scan (Max 50MB)
                  </p>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,.doc,.docx,.txt,.png,.jpg,.jpeg"
                  className="hidden"
                  onChange={(e) => setUploadFile(e.target.files?.[0] ?? null)}
                />
              </div>

              {/* Subject Context */}
              <div>
                <label
                  htmlFor="subject-context"
                  className="block text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mb-2"
                >
                  Subject Context
                </label>
                <input
                  id="subject-context"
                  type="text"
                  value={subjectContext}
                  onChange={(e) => setSubjectContext(e.target.value)}
                  placeholder="e.g. Modern History - Grade 11"
                  className="w-full bg-surface-container-low border-none rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary/20"
                />
              </div>

              {/* AI Question Generation (Phase 3.1) */}
              <div className="space-y-3 pt-1">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary text-base">auto_awesome</span>
                  <p className="text-xs font-bold text-on-surface uppercase tracking-widest">AI Question Generation</p>
                  <span className="text-[10px] text-on-surface-variant bg-surface-container-low px-2 py-0.5 rounded-full">Optional</span>
                </div>
                <p className="text-xs text-on-surface-variant leading-relaxed">
                  Select a subject to automatically generate exam questions from this document after upload.
                  Leave blank to upload without generating.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="sm:col-span-2">
                    <label htmlFor="subject-picker" className="block text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mb-2">
                      Subject
                    </label>
                    <select
                      id="subject-picker"
                      value={selectedSubjectId}
                      onChange={(e) => setSelectedSubjectId(e.target.value ? Number(e.target.value) : '')}
                      className="w-full bg-surface-container-low border-none rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary/20"
                    >
                      <option value="">— Skip AI generation —</option>
                      {subjectOptions.map((s) => (
                        <option key={s.id} value={s.id}>{s.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label htmlFor="num-questions" className="block text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mb-2">
                      Count
                    </label>
                    <input
                      id="num-questions"
                      type="number"
                      min={1}
                      max={50}
                      value={numQuestions}
                      onChange={(e) => setNumQuestions(Math.max(1, Math.min(50, Number(e.target.value) || 10)))}
                      disabled={!selectedSubjectId}
                      className="w-full bg-surface-container-low border-none rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary/20 disabled:opacity-50"
                    />
                  </div>
                </div>
              </div>

              {generationNotice && (
                <div role="status" className="flex items-start gap-2 bg-primary/5 border border-primary/10 rounded-lg px-3 py-2.5">
                  {generating ? (
                    <span className="w-4 h-4 border-2 border-primary/30 border-t-primary rounded-full animate-spin mt-0.5 flex-shrink-0" />
                  ) : (
                    <span className="material-symbols-outlined text-primary text-base mt-0.5">info</span>
                  )}
                  <p className="text-xs text-on-surface leading-relaxed">{generationNotice}</p>
                </div>
              )}

              {uploadError && (
                <p className="text-error text-xs font-medium" role="alert">
                  {uploadError}
                </p>
              )}

              <button
                onClick={handleUpload}
                disabled={uploading || !uploadFile || !subjectContext.trim()}
                className="w-full bg-gradient-to-r from-primary to-primary-container text-on-primary py-3 rounded-xl font-bold flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                <span className="material-symbols-outlined text-lg">
                  {uploading ? 'hourglass_top' : 'cloud_upload'}
                </span>
                {uploading ? 'Uploading...' : 'Upload Document'}
              </button>
            </div>
          </div>

          {/* Uploaded Documents List */}
          <div className="bg-surface-container-low rounded-xl p-6">
            <h3 className="font-headline font-bold text-lg mb-4">Uploaded Documents</h3>
            {docsLoading ? (
              <div className="space-y-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="space-y-2">
                    <SkeletonLine width="w-full" height="h-4" />
                    <SkeletonLine width="w-24" height="h-3" />
                  </div>
                ))}
              </div>
            ) : documents.length === 0 ? (
              <div className="text-center py-8">
                <span className="material-symbols-outlined text-3xl text-on-surface-variant/30 mb-2 block">
                  folder_open
                </span>
                <p className="text-on-surface-variant text-sm">No documents uploaded yet.</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-80 overflow-y-auto">
                {documents.map((doc) => (
                  <div
                    key={doc.id}
                    className="bg-surface-container-lowest p-3 rounded-lg"
                  >
                    <div className="flex items-start gap-3">
                      <span className="material-symbols-outlined text-primary text-lg mt-0.5">description</span>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-on-surface truncate">{doc.file_name}</p>
                        <p className="text-[10px] text-on-surface-variant mt-0.5">
                          {formatFileSize(doc.file_size_bytes)} &middot; {doc.subject_context}
                        </p>
                        <p className="text-[10px] text-on-surface-variant/60 mt-0.5">
                          {doc.uploaded_by_name} &middot; {formatDate(doc.uploaded_at)}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Questions Section */}
        <section className="space-y-6" aria-label="Generated questions">
          {/* Questions Header + Filters */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <h3 className="font-headline font-bold text-2xl">Questions</h3>
              {!questionsLoading && (
                <span className="bg-primary/10 text-primary px-3 py-1 rounded-full text-xs font-bold">
                  {questions.length} {questions.length === 1 ? 'question' : 'questions'}
                </span>
              )}
            </div>
            <div className="flex items-center gap-3">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-surface-container-lowest border border-outline-variant/20 rounded-lg px-3 py-2 text-sm font-medium text-on-surface-variant focus:ring-2 focus:ring-primary/20 cursor-pointer"
                aria-label="Filter by status"
              >
                <option value="">All Status</option>
                <option value="draft">Draft</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </select>
              <select
                value={difficultyFilter}
                onChange={(e) => setDifficultyFilter(e.target.value)}
                className="bg-surface-container-lowest border border-outline-variant/20 rounded-lg px-3 py-2 text-sm font-medium text-on-surface-variant focus:ring-2 focus:ring-primary/20 cursor-pointer"
                aria-label="Filter by difficulty"
              >
                <option value="">All Difficulty</option>
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
              </select>
            </div>
          </div>

          {/* Questions Error */}
          {questionsError && (
            <div className="bg-error/10 text-error rounded-xl p-6 text-center" role="alert">
              <p className="font-medium">{questionsError}</p>
              <button
                onClick={fetchQuestions}
                className="mt-3 px-4 py-2 bg-error text-on-error rounded-lg text-sm font-bold"
              >
                Retry
              </button>
            </div>
          )}

          {/* Questions Loading */}
          {questionsLoading && (
            <div className="space-y-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <QuestionSkeleton key={i} />
              ))}
            </div>
          )}

          {/* Questions Empty */}
          {!questionsLoading && !questionsError && questions.length === 0 && (
            <div className="bg-surface-container-lowest rounded-xl p-12 text-center">
              <span className="material-symbols-outlined text-5xl text-on-surface-variant/30 mb-3 block">
                help_center
              </span>
              <h4 className="font-headline font-bold text-lg text-on-surface mb-2">No questions found</h4>
              <p className="text-on-surface-variant text-sm">
                {statusFilter || difficultyFilter
                  ? 'Try adjusting your filters.'
                  : 'Upload a document and generate questions to get started.'}
              </p>
            </div>
          )}

          {/* Questions List */}
          {!questionsLoading && !questionsError && questions.length > 0 && (
            <div className="space-y-4">
              {questions.map((q) => {
                const isDraft = q.status.toLowerCase() === 'draft'
                const isExpanded = expandedAnswers.has(q.id)
                const isActioning = actionLoading.has(q.id)

                return (
                  <div
                    key={q.id}
                    className="bg-surface-container-lowest rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow group"
                  >
                    <div className="flex gap-4 md:gap-6 items-start">
                      {/* Marks Column */}
                      <div className="shrink-0 flex flex-col items-center gap-1">
                        <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-tighter">
                          Marks
                        </span>
                        <div className="w-10 h-10 rounded-lg bg-surface-container-high flex items-center justify-center font-bold text-primary text-sm">
                          {String(q.marks).padStart(2, '0')}
                        </div>
                      </div>

                      {/* Content Column */}
                      <div className="flex-1 min-w-0 space-y-3">
                        {/* Badges Row */}
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-[10px] font-mono text-on-surface-variant/60">
                            {q.reference_id}
                          </span>
                          <DifficultyBadge difficulty={q.difficulty} />
                          <StatusBadge status={q.status} />
                          {q.topic && (
                            <span className="bg-tertiary/10 text-tertiary text-[10px] font-black px-2 py-0.5 rounded uppercase tracking-widest">
                              {q.topic}
                            </span>
                          )}
                        </div>

                        {/* Question Text */}
                        <p className="text-base font-medium text-on-surface leading-snug">
                          {q.question_text}
                        </p>

                        {/* Subject + Source */}
                        <div className="flex flex-wrap gap-3 text-[10px] text-on-surface-variant">
                          {q.subject_name && (
                            <span className="flex items-center gap-1">
                              <span className="material-symbols-outlined text-xs">menu_book</span>
                              {q.subject_name}
                            </span>
                          )}
                          {q.source_document_name && (
                            <span className="flex items-center gap-1">
                              <span className="material-symbols-outlined text-xs">description</span>
                              {q.source_document_name}
                            </span>
                          )}
                        </div>

                        {/* Collapsible Key Answer */}
                        <div className="pt-2 border-t border-dashed border-outline-variant/20">
                          <button
                            type="button"
                            onClick={() => toggleAnswer(q.id)}
                            className="flex items-center gap-1 text-xs text-primary font-semibold hover:underline"
                            aria-expanded={isExpanded}
                          >
                            <span className="material-symbols-outlined text-sm">
                              {isExpanded ? 'expand_less' : 'expand_more'}
                            </span>
                            {isExpanded ? 'Hide Answer' : 'Show Answer'}
                          </button>
                          {isExpanded && (
                            <div className="mt-2 space-y-2">
                              <p className="text-sm text-on-surface-variant italic leading-relaxed">
                                <span className="font-bold not-italic text-[10px] uppercase mr-2 text-on-surface">
                                  Key Answer:
                                </span>
                                {q.key_answer}
                              </p>
                              {q.grading_rubric && (
                                <div className="mt-2">
                                  <p className="text-[10px] text-on-surface-variant font-bold uppercase tracking-widest mb-1">
                                    Grading Rubric:
                                  </p>
                                  <p className="text-xs text-on-surface-variant whitespace-pre-line">
                                    {q.grading_rubric}
                                  </p>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Actions Column */}
                      <div className="shrink-0 flex flex-col items-center gap-2">
                        {isDraft ? (
                          <>
                            <button
                              onClick={() => handleApprove(q.id)}
                              disabled={isActioning}
                              className="w-9 h-9 rounded-full border-2 border-tertiary/30 flex items-center justify-center hover:bg-tertiary hover:text-on-tertiary hover:border-tertiary transition-all text-tertiary disabled:opacity-50"
                              title="Approve"
                              aria-label={`Approve question ${q.reference_id}`}
                            >
                              <span className="material-symbols-outlined text-lg">done</span>
                            </button>
                            <button
                              onClick={() => handleReject(q.id)}
                              disabled={isActioning}
                              className="w-9 h-9 rounded-full border-2 border-error/30 flex items-center justify-center hover:bg-error hover:text-on-error hover:border-error transition-all text-error disabled:opacity-50"
                              title="Reject"
                              aria-label={`Reject question ${q.reference_id}`}
                            >
                              <span className="material-symbols-outlined text-lg">close</span>
                            </button>
                          </>
                        ) : (
                          <div className="text-center">
                            <StatusBadge status={q.status} />
                            {q.approved_by_name && (
                              <p className="text-[9px] text-on-surface-variant mt-1">
                                by {q.approved_by_name}
                              </p>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </section>
      </main>
    </PageLayout>
  )
}
