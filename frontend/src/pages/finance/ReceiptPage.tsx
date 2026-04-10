import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import PageLayout from '@/components/layout/PageLayout'
import { adminService, type PaymentReceipt } from '@/services/admin/adminService'

function fmt(val: string | number) {
  return Number(val).toLocaleString('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 2 })
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-IN', {
    day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit',
  })
}

function methodLabel(method: string) {
  const map: Record<string, string> = {
    cash: 'Cash',
    cheque: 'Cheque',
    card: 'Card',
    bank_transfer: 'Bank Transfer',
    upi: 'UPI',
    online: 'Online',
  }
  return map[method.toLowerCase()] ?? method
}

export default function ReceiptPage() {
  const { paymentId } = useParams<{ paymentId: string }>()
  const navigate = useNavigate()
  const [receipt, setReceipt] = useState<PaymentReceipt | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!paymentId) return
    adminService.getPaymentReceipt(Number(paymentId))
      .then(setReceipt)
      .catch(() => setError('Failed to load receipt. Please try again.'))
      .finally(() => setLoading(false))
  }, [paymentId])

  function handlePrint() {
    window.print()
  }

  if (loading) {
    return (
      <PageLayout>
        <main className="max-w-2xl mx-auto px-4 md:px-6 py-10 pb-32">
          <div className="bg-surface-container-lowest rounded-xl p-8 space-y-4">
            <div className="h-8 w-48 bg-surface-container-high rounded animate-pulse mx-auto" />
            <div className="h-4 w-32 bg-surface-container-high rounded animate-pulse mx-auto" />
            <div className="h-px bg-outline-variant/10 my-4" />
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-5 bg-surface-container-high rounded animate-pulse" />
            ))}
          </div>
        </main>
      </PageLayout>
    )
  }

  if (error || !receipt) {
    return (
      <PageLayout>
        <main className="max-w-2xl mx-auto px-4 md:px-6 py-10 pb-32">
          <div className="bg-surface-container-lowest rounded-xl p-12 text-center">
            <span className="material-symbols-outlined text-5xl text-error mb-4">error</span>
            <h3 className="font-headline font-bold text-lg text-on-surface mb-2">Receipt Not Found</h3>
            <p className="text-sm text-on-surface-variant mb-6">{error || 'The requested receipt could not be loaded.'}</p>
            <button
              onClick={() => navigate(-1)}
              className="px-5 py-2.5 rounded-xl bg-primary text-on-primary text-sm font-semibold hover:bg-primary/90 transition-colors"
            >
              Go Back
            </button>
          </div>
        </main>
      </PageLayout>
    )
  }

  return (
    <PageLayout>
      <main className="max-w-2xl mx-auto px-4 md:px-6 py-10 pb-32">
        {/* Back + Print actions (hidden in print) */}
        <div className="flex items-center justify-between mb-6 print:hidden">
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-1.5 text-sm text-on-surface-variant hover:text-on-surface transition-colors"
          >
            <span className="material-symbols-outlined text-lg">arrow_back</span>
            Back
          </button>
          <button
            onClick={handlePrint}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-on-primary text-sm font-semibold hover:bg-primary/90 transition-colors"
          >
            <span className="material-symbols-outlined text-lg">print</span>
            Print Receipt
          </button>
        </div>

        {/* Receipt Card */}
        <div className="bg-surface-container-lowest rounded-xl border border-outline-variant/10 overflow-hidden print:border print:border-gray-300 print:shadow-none">
          {/* School Header */}
          <div className="bg-primary bg-gradient-to-br from-primary to-primary-container px-8 py-8 text-center print:bg-white print:text-black">
            <h1 className="font-headline font-extrabold text-2xl text-on-primary print:text-black">{receipt.school_name}</h1>
            <p className="text-sm text-on-primary/80 mt-1 print:text-gray-600">{receipt.school_address}</p>
          </div>

          <div className="px-8 py-8">
            {/* Title */}
            <h2 className="font-headline font-bold text-xl text-center text-on-surface tracking-wide mb-6">PAYMENT RECEIPT</h2>

            {/* Receipt number + date */}
            <div className="flex flex-col sm:flex-row justify-between gap-2 mb-6 pb-6 border-b border-outline-variant/10">
              <div>
                <p className="text-xs text-on-surface-variant uppercase tracking-wider font-semibold mb-1">Receipt No.</p>
                <p className="font-mono font-bold text-on-surface">{receipt.receipt_number}</p>
              </div>
              <div className="sm:text-right">
                <p className="text-xs text-on-surface-variant uppercase tracking-wider font-semibold mb-1">Date</p>
                <p className="font-medium text-on-surface">{formatDate(receipt.paid_at)}</p>
              </div>
            </div>

            {/* Student Info */}
            <div className="mb-6 pb-6 border-b border-outline-variant/10">
              <h3 className="text-xs text-on-surface-variant uppercase tracking-wider font-semibold mb-3">Student Information</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <p className="text-xs text-on-surface-variant">Name</p>
                  <p className="font-medium text-on-surface">{receipt.student_name}</p>
                </div>
                <div>
                  <p className="text-xs text-on-surface-variant">Student ID</p>
                  <p className="font-medium text-on-surface font-mono">{receipt.student_id}</p>
                </div>
                <div>
                  <p className="text-xs text-on-surface-variant">Section</p>
                  <p className="font-medium text-on-surface">{receipt.section}</p>
                </div>
              </div>
            </div>

            {/* Payment Details Table */}
            <div className="mb-6 pb-6 border-b border-outline-variant/10">
              <h3 className="text-xs text-on-surface-variant uppercase tracking-wider font-semibold mb-3">Payment Details</h3>
              <table className="w-full text-sm" role="table" aria-label="Payment details">
                <thead>
                  <tr className="border-b border-outline-variant/10">
                    <th className="text-left py-2 font-semibold text-on-surface-variant text-xs uppercase">Description</th>
                    <th className="text-right py-2 font-semibold text-on-surface-variant text-xs uppercase">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-outline-variant/5">
                    <td className="py-3 text-on-surface">Tuition Fee Payment</td>
                    <td className="py-3 text-right font-bold text-on-surface">{fmt(receipt.amount)}</td>
                  </tr>
                  {receipt.notes && (
                    <tr>
                      <td colSpan={2} className="py-2 text-xs text-on-surface-variant italic">Note: {receipt.notes}</td>
                    </tr>
                  )}
                </tbody>
                <tfoot>
                  <tr className="border-t-2 border-outline-variant/20">
                    <td className="py-3 font-bold text-on-surface">Total Paid</td>
                    <td className="py-3 text-right font-bold text-lg text-primary">{fmt(receipt.amount)}</td>
                  </tr>
                </tfoot>
              </table>
            </div>

            {/* Method + Balance */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6 pb-6 border-b border-outline-variant/10">
              <div>
                <p className="text-xs text-on-surface-variant uppercase tracking-wider font-semibold mb-1">Method of Payment</p>
                <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-tertiary/10 text-tertiary">
                  {methodLabel(receipt.method)}
                </span>
              </div>
              <div className="sm:text-right">
                <p className="text-xs text-on-surface-variant uppercase tracking-wider font-semibold mb-1">Balance Remaining</p>
                <p className={`font-bold text-lg ${Number(receipt.balance_after) > 0 ? 'text-error' : 'text-tertiary'}`}>
                  {fmt(receipt.balance_after)}
                </p>
              </div>
            </div>

            {/* Processed by */}
            <div className="mb-6">
              <p className="text-xs text-on-surface-variant">Processed by: <span className="font-medium text-on-surface">{receipt.paid_by_name}</span></p>
            </div>

            {/* Footer */}
            <p className="text-center text-xs text-on-surface-variant italic">
              This is a computer-generated receipt. No signature is required.
            </p>
          </div>
        </div>
      </main>
    </PageLayout>
  )
}
