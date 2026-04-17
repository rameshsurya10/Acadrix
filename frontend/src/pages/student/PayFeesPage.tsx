import { useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import PageLayout from '@/components/layout/PageLayout'
import { studentService } from '@/services/student/studentService'
import { Bone } from '@/components/shared/Skeleton'
import { loadRazorpayCheckout, openRazorpayCheckout } from '@/lib/razorpay'
import { useTuition } from '@/hooks/queries/useTuition'
import { queryKeys } from '@/lib/queryClient'

function currency(val: string | number) {
  return `INR ${Number(val).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

export default function PayFeesPage() {
  const { data: tuition, isLoading: loading, error: queryError } = useTuition()
  const queryClient = useQueryClient()
  const [error, setError] = useState<string | null>(
    queryError ? 'Failed to load fee details.' : null
  )
  const [paying, setPaying] = useState(false)
  const [successReceipt, setSuccessReceipt] = useState<string | null>(null)

  const outstanding = tuition ? Number(tuition.outstanding_balance ?? 0) : 0
  const totalAmount = tuition ? Number(tuition.total_amount ?? 0) : 0
  const paidAmount = tuition ? Number(tuition.paid_amount ?? 0) : 0

  async function handlePayNow() {
    setError(null)
    setPaying(true)
    try {
      const scriptReady = await loadRazorpayCheckout()
      if (!scriptReady) {
        setError('Could not load the payment gateway. Check your connection and try again.')
        setPaying(false)
        return
      }

      const order = await studentService.createRazorpayOrder()

      openRazorpayCheckout({
        key: order.key,
        amount: order.amount,
        currency: order.currency,
        name: 'Acadrix',
        description: `Fee payment - ${order.receipt_id}`,
        order_id: order.order_id,
        prefill: {
          name: order.student_name,
          email: order.student_email,
        },
        theme: { color: '#2b5ab5' },
        handler: async (response) => {
          try {
            const result = await studentService.verifyRazorpayPayment({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            })
            setSuccessReceipt(result.receipt_id)
            // Invalidate tuition — React Query will refetch and any other
            // mounted component that displays tuition data also updates.
            queryClient.invalidateQueries({ queryKey: queryKeys.tuition() })
            queryClient.invalidateQueries({ queryKey: queryKeys.studentDashboard() })
          } catch (verifyErr: unknown) {
            const msg = (verifyErr as { response?: { data?: { error?: string } } })?.response?.data?.error
            setError(msg ?? 'Payment was received but verification failed. Please contact the school office with your transaction ID.')
          } finally {
            setPaying(false)
          }
        },
        modal: {
          ondismiss: () => setPaying(false),
        },
      })
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error
      setError(msg ?? 'Could not start the payment. Please try again.')
      setPaying(false)
    }
  }

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
                    {successReceipt && (
                      <div className="bg-tertiary/10 border border-tertiary/30 rounded-lg p-4 flex items-start gap-3">
                        <span className="material-symbols-outlined text-tertiary text-lg mt-0.5">check_circle</span>
                        <div className="text-sm">
                          <p className="font-semibold text-on-surface mb-0.5">Payment successful</p>
                          <p className="text-on-surface-variant">Receipt ID: {successReceipt}</p>
                        </div>
                      </div>
                    )}

                    <button
                      type="button"
                      onClick={handlePayNow}
                      disabled={paying}
                      className="w-full flex items-center justify-center gap-2 bg-primary text-on-primary px-6 py-4 rounded-xl font-bold text-sm shadow-lg shadow-primary/20 hover:bg-primary/90 hover:shadow-xl hover:shadow-primary/25 active:scale-[0.98] transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                      {paying ? (
                        <>
                          <span className="w-5 h-5 border-2 border-on-primary/30 border-t-on-primary rounded-full animate-spin" />
                          Processing...
                        </>
                      ) : (
                        <>
                          <span className="material-symbols-outlined text-lg">lock</span>
                          Pay {currency(outstanding)} Now
                        </>
                      )}
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
