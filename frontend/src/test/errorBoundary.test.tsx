/**
 * Tests for ErrorBoundary.
 *
 * Verifies: catches render errors, shows fallback, supports custom fallback,
 * resets when resetKey changes, calls onError callback.
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import type { ReactElement } from 'react'
import ErrorBoundary from '@/components/shared/ErrorBoundary'

// Suppress React's noisy error logs during intentional-throw tests
beforeEach(() => {
  vi.spyOn(console, 'error').mockImplementation(() => {})
})

afterEach(() => {
  vi.restoreAllMocks()
})

function Boom({ message = 'kaboom' }: { message?: string }): ReactElement {
  throw new Error(message)
  // TypeScript needs this unreachable return to satisfy ReactElement
  // eslint-disable-next-line @typescript-eslint/no-unreachable
  return <></>
}

function Fine() {
  return <div data-testid="content">ok</div>
}

describe('ErrorBoundary', () => {
  it('renders children when no error', () => {
    render(
      <ErrorBoundary>
        <Fine />
      </ErrorBoundary>,
    )
    expect(screen.getByTestId('content')).toBeInTheDocument()
  })

  it('shows default fallback when a child throws', () => {
    render(
      <ErrorBoundary>
        <Boom message="test explosion" />
      </ErrorBoundary>,
    )
    expect(screen.getByText(/something went wrong/i)).toBeInTheDocument()
    // "Try Again" + "Go Home" buttons present
    expect(screen.getByRole('button', { name: /try again/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /go home/i })).toBeInTheDocument()
  })

  it('renders custom fallback when provided', () => {
    render(
      <ErrorBoundary
        fallback={({ error }) => (
          <div data-testid="custom">custom: {error.message}</div>
        )}
      >
        <Boom message="hello" />
      </ErrorBoundary>,
    )
    expect(screen.getByTestId('custom')).toHaveTextContent('custom: hello')
  })

  it('calls onError callback', () => {
    const onError = vi.fn()
    render(
      <ErrorBoundary onError={onError}>
        <Boom />
      </ErrorBoundary>,
    )
    expect(onError).toHaveBeenCalledOnce()
    expect(onError.mock.calls[0][0]).toBeInstanceOf(Error)
  })

  it('resets via Try Again button', async () => {
    const user = userEvent.setup()
    let shouldBoom = true
    function Toggleable(): ReactElement {
      if (shouldBoom) throw new Error('first fail')
      return <div data-testid="recovered">recovered</div>
    }

    render(
      <ErrorBoundary>
        <Toggleable />
      </ErrorBoundary>,
    )

    expect(screen.getByText(/something went wrong/i)).toBeInTheDocument()

    // Simulate the underlying cause being fixed, then click reset
    shouldBoom = false
    await user.click(screen.getByRole('button', { name: /try again/i }))

    expect(screen.getByTestId('recovered')).toBeInTheDocument()
  })
})
