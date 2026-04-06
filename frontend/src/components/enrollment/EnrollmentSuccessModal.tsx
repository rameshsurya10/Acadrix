import { useState } from 'react'

interface EnrollmentSuccessModalProps {
  isOpen: boolean
  onClose: () => void
  onEnrollAnother: () => void
  role: 'admin' | 'principal' | 'teacher' | 'student'
  generatedId: string
  name: string
  email: string
  emailSent: boolean
}

export default function EnrollmentSuccessModal({
  isOpen,
  onClose,
  onEnrollAnother,
  role,
  generatedId,
  name,
  email,
  emailSent,
}: EnrollmentSuccessModalProps) {
  const [copied, setCopied] = useState(false)

  if (!isOpen) return null

  async function handleCopyId() {
    try {
      await navigator.clipboard.writeText(generatedId)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // Fallback: select text for manual copy
    }
  }

  function handlePrint() {
    const printWindow = window.open('', '_blank')
    if (!printWindow) return

    const doc = printWindow.document
    const container = doc.createElement('div')
    container.style.fontFamily = 'system-ui, sans-serif'
    container.style.padding = '40px'
    container.style.maxWidth = '500px'
    container.style.margin = '0 auto'

    const title = doc.createElement('h1')
    title.textContent = `${role.charAt(0).toUpperCase() + role.slice(1)} Enrollment Confirmation`
    title.style.fontSize = '20px'
    title.style.marginBottom = '24px'
    title.style.color = '#1a1a2e'
    container.appendChild(title)

    const fields = [
      { label: 'Generated ID', value: generatedId },
      { label: 'Name', value: name },
      { label: 'Email', value: email },
    ]

    fields.forEach(({ label, value }) => {
      const row = doc.createElement('div')
      row.style.marginBottom = '12px'

      const lbl = doc.createElement('strong')
      lbl.textContent = `${label}: `
      lbl.style.color = '#555'
      row.appendChild(lbl)

      const val = doc.createElement('span')
      val.textContent = value
      if (label === 'Generated ID') {
        val.style.fontSize = '18px'
        val.style.fontWeight = 'bold'
        val.style.color = '#3b6ce7'
      }
      row.appendChild(val)
      container.appendChild(row)
    })

    const footer = doc.createElement('p')
    footer.textContent = `Enrolled on ${new Date().toLocaleDateString()}`
    footer.style.marginTop = '32px'
    footer.style.color = '#999'
    footer.style.fontSize = '12px'
    container.appendChild(footer)

    doc.body.appendChild(container)
    doc.title = `Enrollment - ${generatedId}`
    printWindow.print()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal */}
      <div className="relative w-full max-w-md bg-surface rounded-2xl shadow-2xl p-6 sm:p-8 animate-in fade-in zoom-in">
        {/* Close button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 text-on-surface-variant hover:text-on-surface transition-colors"
          aria-label="Close"
        >
          <span className="material-symbols-outlined text-xl">close</span>
        </button>

        {/* Success icon */}
        <div className="flex justify-center mb-4">
          <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">
            <span className="material-symbols-outlined text-green-600 text-4xl">check_circle</span>
          </div>
        </div>

        {/* Heading */}
        <h2 className="text-center font-headline font-bold text-xl text-on-surface mb-1">
          {role.charAt(0).toUpperCase() + role.slice(1)} Enrolled!
        </h2>
        <p className="text-center text-sm text-on-surface-variant mb-6">
          The {role} account has been created successfully.
        </p>

        {/* Generated ID */}
        {generatedId && (
          <div className="bg-primary/5 border border-primary/15 rounded-xl p-4 text-center mb-4">
            <p className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider mb-1">
              Generated ID
            </p>
            <p className="text-2xl font-bold text-primary tracking-wide">{generatedId}</p>
          </div>
        )}

        {/* Details */}
        <div className="space-y-2 mb-4">
          <div className="flex items-center gap-2 text-sm">
            <span className="material-symbols-outlined text-on-surface-variant text-lg">person</span>
            <span className="text-on-surface">{name}</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <span className="material-symbols-outlined text-on-surface-variant text-lg">mail</span>
            <span className="text-on-surface">{email}</span>
          </div>
        </div>

        {/* Email sent indicator */}
        {emailSent && (
          <div className="flex items-center gap-2 bg-green-50 border border-green-200/50 rounded-lg px-3 py-2 mb-6">
            <span className="material-symbols-outlined text-green-600 text-lg">mark_email_read</span>
            <span className="text-sm text-green-700">Welcome email sent</span>
          </div>
        )}

        {/* Action buttons row */}
        <div className="flex gap-2 mb-4">
          {generatedId && (
            <button
              type="button"
              onClick={handleCopyId}
              className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl border border-outline-variant/25 text-sm font-medium text-on-surface-variant hover:bg-surface-container-low hover:border-outline-variant/40 transition-all"
            >
              <span className="material-symbols-outlined text-lg">
                {copied ? 'check' : 'content_copy'}
              </span>
              {copied ? 'Copied!' : 'Copy ID'}
            </button>
          )}
          <button
            type="button"
            onClick={handlePrint}
            className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl border border-outline-variant/25 text-sm font-medium text-on-surface-variant hover:bg-surface-container-low hover:border-outline-variant/40 transition-all"
          >
            <span className="material-symbols-outlined text-lg">print</span>
            Print
          </button>
        </div>

        {/* Primary actions */}
        <div className="flex gap-3">
          <button
            type="button"
            onClick={onEnrollAnother}
            className="flex-1 py-3 rounded-xl border border-primary/30 text-primary font-headline font-bold text-sm hover:bg-primary/5 transition-all"
          >
            Enroll Another
          </button>
          <button
            type="button"
            onClick={onClose}
            className="flex-1 bg-primary text-on-primary font-headline font-bold py-3 rounded-xl hover:bg-primary/90 shadow-lg shadow-primary/20 text-sm transition-all"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  )
}
