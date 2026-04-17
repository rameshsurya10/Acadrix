/**
 * ErrorBoundary — catches React render errors in a subtree and shows a
 * friendly fallback instead of white-screening the whole app.
 *
 * Usage:
 *   <ErrorBoundary resetKey={location.pathname}>
 *     <AdminRoutes />
 *   </ErrorBoundary>
 *
 * `resetKey` is any value that changes when the user navigates — the
 * boundary resets when it changes, so navigating away from a broken page
 * automatically clears the error without a full reload.
 *
 * Only catches:
 *   - Render errors (bad JSX, null-ref crashes, etc.)
 *
 * Does NOT catch (handle separately):
 *   - Event handler errors → wrap in try/catch
 *   - Async errors → React Query's `error` state
 *   - Errors during SSR → we don't SSR
 */
import { Component } from 'react'
import type { ErrorInfo, ReactNode } from 'react'

interface Props {
  children: ReactNode
  /** Reset the boundary when this value changes. Typically location.pathname. */
  resetKey?: string | number
  /** Optional custom fallback renderer. Receives the error and a reset function. */
  fallback?: (args: { error: Error; reset: () => void }) => ReactNode
  /** Called whenever the boundary catches an error. Use for logging / Sentry. */
  onError?: (error: Error, info: ErrorInfo) => void
}

interface State {
  error: Error | null
}

export default class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null }

  static getDerivedStateFromError(error: Error): State {
    return { error }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    // Phase 5.1 (Sentry) will wire into this callback
    this.props.onError?.(error, info)
    // Always log to the browser console so devs see it in DevTools
    console.error('[ErrorBoundary]', error, info.componentStack)
  }

  componentDidUpdate(prevProps: Props) {
    // Auto-reset when the resetKey changes (e.g. route navigation)
    if (this.state.error && prevProps.resetKey !== this.props.resetKey) {
      this.reset()
    }
  }

  reset = () => {
    this.setState({ error: null })
  }

  render() {
    if (this.state.error) {
      if (this.props.fallback) {
        return this.props.fallback({ error: this.state.error, reset: this.reset })
      }
      return <DefaultErrorFallback error={this.state.error} reset={this.reset} />
    }
    return this.props.children
  }
}

function DefaultErrorFallback({ error, reset }: { error: Error; reset: () => void }) {
  const isDev = import.meta.env.DEV

  return (
    <div className="min-h-[60vh] flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-surface-container-lowest rounded-2xl p-8 text-center space-y-4 shadow-[0_32px_64px_-12px_rgba(0,0,0,0.04)]">
        <div className="w-16 h-16 mx-auto rounded-2xl bg-error/10 flex items-center justify-center">
          <span className="material-symbols-outlined text-error text-3xl">error</span>
        </div>
        <h2 className="font-headline font-extrabold text-xl text-on-surface">Something went wrong</h2>
        <p className="text-sm text-on-surface-variant">
          This page ran into a problem. You can try again, or use the navigation to go somewhere else.
        </p>

        {isDev && (
          <details className="text-left bg-error/5 rounded-lg p-3 text-xs font-mono text-error/80">
            <summary className="cursor-pointer font-semibold mb-2">Error details (dev only)</summary>
            <pre className="whitespace-pre-wrap break-words">{error.message}</pre>
            {error.stack && (
              <pre className="whitespace-pre-wrap break-words mt-2 opacity-70">{error.stack}</pre>
            )}
          </details>
        )}

        <div className="flex gap-2 justify-center pt-2">
          <button
            type="button"
            onClick={reset}
            className="bg-primary text-on-primary font-bold px-4 py-2 rounded-lg text-sm hover:bg-primary/90 transition-colors"
          >
            Try Again
          </button>
          <button
            type="button"
            onClick={() => { window.location.href = '/' }}
            className="bg-surface-container-high text-on-surface font-bold px-4 py-2 rounded-lg text-sm hover:bg-surface-container transition-colors"
          >
            Go Home
          </button>
        </div>
      </div>
    </div>
  )
}
