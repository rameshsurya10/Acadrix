import { useState, useEffect } from 'react'
import PageLayout from '@/components/layout/PageLayout'
import { superAdminService } from '@/services/superAdmin/superAdminService'
import { Bone } from '@/components/shared/Skeleton'

const GATEWAYS = [
  { value: 'razorpay', label: 'Razorpay' },
]

interface GatewayConfig {
  gateway: string
  key_id: string
  key_secret: string
  webhook_secret: string
  test_mode: boolean
}

const EMPTY: GatewayConfig = {
  gateway: 'razorpay',
  key_id: '',
  key_secret: '',
  webhook_secret: '',
  test_mode: true,
}

export default function PaymentGatewayPage() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [form, setForm] = useState<GatewayConfig>(EMPTY)
  const [showSecret, setShowSecret] = useState(false)
  const [showWebhook, setShowWebhook] = useState(false)

  useEffect(() => {
    superAdminService.getGatewayConfig()
      .then((cfg: GatewayConfig) => setForm({ ...EMPTY, ...cfg }))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError(null)
    setSuccess(false)
    try {
      const updated = await superAdminService.updateGatewayConfig(form)
      setForm({ ...EMPTY, ...updated })
      setSuccess(true)
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to save gateway configuration.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <PageLayout sidebar>
      <main className="pb-20 md:pb-0">
        <div className="max-w-4xl mx-auto px-4 md:px-6 py-6 md:py-10">
          {/* Header */}
          <div className="mb-10">
            <span className="font-label text-xs font-semibold tracking-widest text-on-surface-variant uppercase mb-2 block">
              Configuration
            </span>
            <h2 className="font-headline font-extrabold text-3xl md:text-4xl text-on-surface tracking-tight">
              Payment Gateway
            </h2>
          </div>

          {loading ? (
            <div className="space-y-4">
              {Array.from({ length: 5 }).map((_, i) => <Bone key={i} className="h-14 rounded-lg" />)}
            </div>
          ) : (
            <form onSubmit={handleSave} className="bg-surface-container-lowest p-6 md:p-8 rounded-xl space-y-8">
              {success && (
                <div className="bg-tertiary/10 text-tertiary px-4 py-3 rounded-lg flex items-center gap-2">
                  <span className="material-symbols-outlined text-sm">check_circle</span>
                  <span className="text-sm font-medium">Gateway configuration saved successfully!</span>
                </div>
              )}
              {error && (
                <div className="bg-error/10 text-error px-4 py-3 rounded-lg text-sm font-medium flex items-center gap-2">
                  <span className="material-symbols-outlined text-lg">error</span>
                  {error}
                </div>
              )}

              {/* Info banner */}
              <div className="bg-primary/5 border border-primary/10 rounded-lg p-4 flex items-start gap-3">
                <span className="material-symbols-outlined text-primary text-lg mt-0.5">info</span>
                <div className="text-sm text-on-surface-variant space-y-1">
                  <p className="font-medium text-on-surface">Indian Merchant Gateway</p>
                  <p>Supports Visa, Mastercard, Amex, RuPay, UPI, Netbanking, and Wallets. Razorpay is RBI-compliant and supports automatic payment receipts.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Gateway */}
                <div className="space-y-1.5">
                  <label htmlFor="pg-gateway" className="font-label text-xs font-bold text-on-surface-variant uppercase tracking-wider block">
                    Gateway Provider
                  </label>
                  <select
                    id="pg-gateway"
                    value={form.gateway}
                    onChange={e => setForm(f => ({ ...f, gateway: e.target.value }))}
                    className="w-full px-4 py-3 rounded-lg bg-surface-container-low text-sm focus:outline-none focus:ring-2 focus:ring-primary cursor-pointer"
                  >
                    {GATEWAYS.map(g => (
                      <option key={g.value} value={g.value}>{g.label}</option>
                    ))}
                  </select>
                </div>

                {/* Key ID */}
                <div className="space-y-1.5">
                  <label htmlFor="pg-key-id" className="font-label text-xs font-bold text-on-surface-variant uppercase tracking-wider block">
                    Key ID
                  </label>
                  <input
                    id="pg-key-id"
                    type="text"
                    value={form.key_id}
                    onChange={e => setForm(f => ({ ...f, key_id: e.target.value }))}
                    placeholder="rzp_live_xxxxxxxxxx"
                    className="w-full px-4 py-3 rounded-lg bg-surface-container-low text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>

                {/* Key Secret */}
                <div className="space-y-1.5">
                  <label htmlFor="pg-key-secret" className="font-label text-xs font-bold text-on-surface-variant uppercase tracking-wider block">
                    Key Secret
                  </label>
                  <div className="relative">
                    <input
                      id="pg-key-secret"
                      type={showSecret ? 'text' : 'password'}
                      value={form.key_secret}
                      onChange={e => setForm(f => ({ ...f, key_secret: e.target.value }))}
                      placeholder="Enter key secret"
                      className="w-full px-4 py-3 pr-12 rounded-lg bg-surface-container-low text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                    <button
                      type="button"
                      onClick={() => setShowSecret(p => !p)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-on-surface transition-colors"
                      aria-label={showSecret ? 'Hide secret' : 'Show secret'}
                    >
                      <span className="material-symbols-outlined text-lg">
                        {showSecret ? 'visibility_off' : 'visibility'}
                      </span>
                    </button>
                  </div>
                </div>

                {/* Webhook Secret */}
                <div className="space-y-1.5">
                  <label htmlFor="pg-webhook" className="font-label text-xs font-bold text-on-surface-variant uppercase tracking-wider block">
                    Webhook Secret
                  </label>
                  <div className="relative">
                    <input
                      id="pg-webhook"
                      type={showWebhook ? 'text' : 'password'}
                      value={form.webhook_secret}
                      onChange={e => setForm(f => ({ ...f, webhook_secret: e.target.value }))}
                      placeholder="Enter webhook secret"
                      className="w-full px-4 py-3 pr-12 rounded-lg bg-surface-container-low text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                    <button
                      type="button"
                      onClick={() => setShowWebhook(p => !p)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-on-surface transition-colors"
                      aria-label={showWebhook ? 'Hide webhook secret' : 'Show webhook secret'}
                    >
                      <span className="material-symbols-outlined text-lg">
                        {showWebhook ? 'visibility_off' : 'visibility'}
                      </span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Test Mode Toggle */}
              <div className="flex items-center gap-3">
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.test_mode}
                    onChange={e => setForm(f => ({ ...f, test_mode: e.target.checked }))}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-outline/30 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-primary rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary" />
                </label>
                <div>
                  <p className="text-sm font-medium text-on-surface">Test Mode</p>
                  <p className="text-xs text-on-surface-variant">
                    {form.test_mode
                      ? 'Using test credentials. No real charges will be made.'
                      : 'Live mode. Real payments will be processed.'}
                  </p>
                </div>
              </div>

              {/* Actions */}
              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  disabled={saving}
                  className="flex items-center gap-2 bg-primary text-on-primary px-6 py-3 rounded-xl font-bold text-sm hover:opacity-90 transition-opacity disabled:opacity-50"
                >
                  {saving && <span className="material-symbols-outlined text-sm animate-spin">progress_activity</span>}
                  Save Configuration
                </button>
              </div>
            </form>
          )}
        </div>
      </main>
    </PageLayout>
  )
}
