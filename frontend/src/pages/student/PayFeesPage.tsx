import { useState, useEffect } from 'react'
import PageLayout from '@/components/layout/PageLayout'
import { studentService, type TuitionAccount } from '@/services/student/studentService'
import { Bone } from '@/components/shared/Skeleton'

function currency(val: string | number) {
  return `INR ${Number(val).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

export default function PayFeesPage() {
  const [tuition, setTuition] = useState<TuitionAccount | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    studentService
      .getTuition()
      .then(d => { if (!cancelled) setTuition(d) })
      .catch(err => {
        if (!cancelled) {
          const msg = (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail
          setError(msg ?? 'Failed to load fee details.')
        }
      })
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [])

  const outstanding = tuition ? Number(tuition.outstanding_balance ?? 0) : 0
  const totalAmount = tuition ? Number(tuition.total_amount ?? 0) : 0
  const paidAmount = tuition ? Number(tuition.paid_amount ?? 0) : 0

  return (
    <PageLayout sidebar>
      <main className="pb-20 md:pb-0">
        <div className="max-w-3xl mx-auto px-4 md:px-6 py-6 md:py-10 space-y-8">
          {/* Header */}
          <div>
            <span className="font-label text-xs font-semibold tracking-widest text-on-surface-variant uppercase mb-2 block">
              Payments
            </span>
            <h2 className="font-headline font-extrabold text-3xl md:text-4xl text-on-surface tracking-tight">
              Pay Fees Online
            </h2>
          </div>

          {loading ? (
            <div className="space-y-4">
              {Array.from({ length: 3 }).map((_, i) => <Bone key={i} className="h-24 rounded-xl" />)}
            </div>
          ) : error ? (
            <div className="bg-error/10 text-error px-4 py-3 rounded-lg text-sm font-medium flex items-center gap-2">
              <span className="material-symbols-outlined text-lg">error</span>
              {error}
            </div>
          ) : (
            <>
              {/* Balance Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-surface-container-lowest rounded-xl p-5 space-y-1">
                  <p className="text-xs font-bold uppercase tracking-widest text-on-surface-variant font-label">Total Fees</p>
                  <p className="text-2xl font-extrabold text-on-surface">{currency(totalAmount)}</p>
                </div>
                <div className="bg-surface-container-lowest rounded-xl p-5 space-y-1">
                  <p className="text-xs font-bold uppercase tracking-widest text-on-surface-variant font-label">Paid</p>
                  <p className="text-2xl font-extrabold text-tertiary">{currency(paidAmount)}</p>
                </div>
                <div className="bg-surface-container-lowest rounded-xl p-5 space-y-1">
                  <p className="text-xs font-bold uppercase tracking-widest text-on-surface-variant font-label">Outstanding</p>
                  <p className={`text-2xl font-extrabold ${outstanding > 0 ? 'text-error' : 'text-tertiary'}`}>
                    {currency(outstanding)}
                  </p>
                </div>
              </div>

              {/* Payment Methods Info */}
              <div className="bg-surface-container-lowest rounded-xl p-6 md:p-8 space-y-5">
                <h3 className="text-sm font-bold uppercase tracking-widest text-on-surface-variant font-label flex items-center gap-2">
                  <span className="material-symbols-outlined text-lg">account_balance</span>
                  Payment Methods
                </h3>
                <div className="flex flex-wrap gap-3">
                  {['UPI', 'Debit Card', 'Credit Card', 'Netbanking', 'RuPay', 'Wallets'].map(method => (
                    <span
                      key={method}
                      className="text-xs bg-surface-container-low text-on-surface-variant px-3 py-1.5 rounded-full font-medium"
                    >
                      {method}
                    </span>
                  ))}
                </div>

                {outstanding > 0 ? (
                  <div className="space-y-4 pt-2">
                    <div className="bg-primary/5 border border-primary/10 rounded-lg p-4 flex items-start gap-3">
                      <span className="material-symbols-outlined text-primary text-lg mt-0.5">info</span>
                      <div className="text-sm text-on-surface-variant">
                        <p className="font-medium text-on-surface mb-1">Online Payment via Razorpay</p>
                        <p>
                          Online payment via Razorpay will be available once the gateway is configured
                          by the school administration. Please contact the school office for alternative
                          payment methods in the meantime.
                        </p>
                      </div>
                    </div>

                    <button
                      disabled
                      className="w-full flex items-center justify-center gap-2 bg-primary/50 text-on-primary px-6 py-4 rounded-xl font-bold text-sm cursor-not-allowed"
                    >
                      <span className="material-symbols-outlined text-lg">lock</span>
                      Pay {currency(outstanding)} Now
                    </button>
                    <p className="text-xs text-center text-on-surface-variant">
                      Secured by Razorpay. Supports Visa, Mastercard, Amex, RuPay, UPI, and Netbanking.
                    </p>
                  </div>
                ) : (
                  <div className="bg-tertiary/10 text-tertiary px-4 py-6 rounded-lg text-center">
                    <span className="material-symbols-outlined text-4xl mb-2 block">check_circle</span>
                    <p className="font-bold text-lg">All Fees Paid</p>
                    <p className="text-sm mt-1 opacity-80">You have no outstanding balance. Thank you!</p>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </main>
    </PageLayout>
  )
}
