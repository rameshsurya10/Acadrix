/**
 * PWAUpdatePrompt — bottom-center toast that asks the user to reload when
 * a new service worker version is ready.
 *
 * The `useRegisterSW` hook from virtual:pwa-register is injected at build
 * time by vite-plugin-pwa. It handles service worker registration and
 * exposes `needRefresh` state.
 *
 * We use `registerType: 'prompt'` in vite.config.ts so users are asked
 * before updating — not auto-refreshed mid-action.
 */
import { useRegisterSW } from 'virtual:pwa-register/react'

export default function PWAUpdatePrompt() {
  const {
    needRefresh: [needRefresh, setNeedRefresh],
    offlineReady: [offlineReady, setOfflineReady],
    updateServiceWorker,
  } = useRegisterSW({
    onRegisterError(error) {
      console.error('Service worker registration failed:', error)
    },
  })

  function close() {
    setOfflineReady(false)
    setNeedRefresh(false)
  }

  if (!needRefresh && !offlineReady) return null

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 max-w-sm w-[calc(100%-2rem)]"
    >
      <div className="bg-surface-container-lowest shadow-2xl shadow-primary/20 rounded-2xl border border-outline-variant/20 p-4 flex items-start gap-3">
        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
          <span className="material-symbols-outlined text-primary text-xl">
            {needRefresh ? 'system_update' : 'check_circle'}
          </span>
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-on-surface text-sm mb-0.5">
            {needRefresh ? 'Update available' : 'App ready offline'}
          </p>
          <p className="text-xs text-on-surface-variant">
            {needRefresh
              ? 'A new version is ready. Reload to apply.'
              : 'Acadrix will work without a network connection.'}
          </p>
          {needRefresh && (
            <div className="flex gap-2 mt-3">
              <button
                type="button"
                onClick={() => updateServiceWorker(true)}
                className="bg-primary text-on-primary text-xs font-bold px-3 py-1.5 rounded-lg hover:bg-primary/90 transition-colors"
              >
                Reload
              </button>
              <button
                type="button"
                onClick={close}
                className="text-on-surface-variant text-xs font-semibold px-3 py-1.5 rounded-lg hover:bg-surface-container-low transition-colors"
              >
                Later
              </button>
            </div>
          )}
        </div>
        {!needRefresh && (
          <button
            type="button"
            onClick={close}
            aria-label="Dismiss"
            className="text-on-surface-variant hover:text-on-surface transition-colors flex-shrink-0"
          >
            <span className="material-symbols-outlined text-lg">close</span>
          </button>
        )}
      </div>
    </div>
  )
}
