/**
 * Razorpay Checkout script loader.
 *
 * The Razorpay checkout.js is loaded on-demand the first time a user clicks
 * "Pay" — we don't ship it with the main bundle.
 */

const RAZORPAY_SCRIPT_URL = 'https://checkout.razorpay.com/v1/checkout.js'

let scriptPromise: Promise<boolean> | null = null

export function loadRazorpayCheckout(): Promise<boolean> {
  if (typeof window === 'undefined') return Promise.resolve(false)
  if ((window as unknown as { Razorpay?: unknown }).Razorpay) return Promise.resolve(true)

  if (scriptPromise) return scriptPromise

  scriptPromise = new Promise((resolve) => {
    const script = document.createElement('script')
    script.src = RAZORPAY_SCRIPT_URL
    script.async = true
    script.onload = () => resolve(true)
    script.onerror = () => {
      scriptPromise = null
      resolve(false)
    }
    document.body.appendChild(script)
  })

  return scriptPromise
}

export interface RazorpayCheckoutOptions {
  key: string
  amount: number     // in paise
  currency: string
  name: string       // "Acadrix School"
  description: string
  order_id: string
  prefill?: { name?: string; email?: string; contact?: string }
  notes?: Record<string, string>
  theme?: { color?: string }
  handler: (response: RazorpayCheckoutResponse) => void
  modal?: { ondismiss?: () => void }
}

export interface RazorpayCheckoutResponse {
  razorpay_payment_id: string
  razorpay_order_id: string
  razorpay_signature: string
}

interface RazorpayConstructor {
  new (options: RazorpayCheckoutOptions): { open: () => void }
}

export function openRazorpayCheckout(options: RazorpayCheckoutOptions): void {
  const RazorpayCtor = (window as unknown as { Razorpay?: RazorpayConstructor }).Razorpay
  if (!RazorpayCtor) {
    throw new Error('Razorpay Checkout script not loaded')
  }
  const rzp = new RazorpayCtor(options)
  rzp.open()
}
