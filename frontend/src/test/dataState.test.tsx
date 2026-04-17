/**
 * Tests for DataState wrapper.
 *
 * Verifies: loading skeleton, error with retry, empty state, data renders,
 * custom isEmpty predicate, manual props mode (no query prop).
 */
import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import DataState from '@/components/shared/DataState'

function makeQuery<T>(overrides: Partial<{ data: T; isLoading: boolean; isError: boolean; error: unknown }> = {}) {
  return {
    data: undefined as T | undefined,
    isLoading: false,
    isError: false,
    error: null as unknown,
    refetch: vi.fn(),
    ...overrides,
  }
}

describe('DataState', () => {
  it('renders default skeleton when loading', () => {
    const query = makeQuery({ isLoading: true })
    render(
      <DataState query={query}>
        {() => <div>should not see this</div>}
      </DataState>,
    )
    expect(screen.queryByText('should not see this')).not.toBeInTheDocument()
    // Default skeleton uses aria-busy
    expect(document.querySelector('[aria-busy="true"]')).toBeInTheDocument()
  })

  it('renders custom skeleton when provided', () => {
    const query = makeQuery({ isLoading: true })
    render(
      <DataState query={query} skeleton={<div data-testid="custom-skel">wait</div>}>
        {() => <div>content</div>}
      </DataState>,
    )
    expect(screen.getByTestId('custom-skel')).toBeInTheDocument()
  })

  it('renders error state with retry button', async () => {
    const refetch = vi.fn()
    const query = makeQuery<{ items: string[] }>({
      isError: true,
      error: new Error('API is down'),
    })
    query.refetch = refetch

    const user = userEvent.setup()
    render(
      <DataState query={query}>
        {() => <div>never</div>}
      </DataState>,
    )

    expect(screen.getByText(/failed to load/i)).toBeInTheDocument()
    expect(screen.getByText(/api is down/i)).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: /try again/i }))
    expect(refetch).toHaveBeenCalledOnce()
  })

  it('extracts error message from axios response shape', () => {
    const query = makeQuery<{ items: string[] }>({
      isError: true,
      error: { response: { data: { detail: 'Permission denied' } } },
    })
    render(
      <DataState query={query}>
        {() => <div />}
      </DataState>,
    )
    expect(screen.getByText(/permission denied/i)).toBeInTheDocument()
  })

  it('renders empty state when data is undefined', () => {
    const query = makeQuery<number[]>({ data: undefined })
    render(
      <DataState query={query}>
        {() => <div>content</div>}
      </DataState>,
    )
    expect(screen.getByText(/nothing to show yet/i)).toBeInTheDocument()
  })

  it('uses isEmpty predicate to detect empty data', () => {
    const query = makeQuery<number[]>({ data: [] })
    render(
      <DataState query={query} isEmpty={(d) => d.length === 0}>
        {() => <div>data!</div>}
      </DataState>,
    )
    expect(screen.getByText(/nothing to show yet/i)).toBeInTheDocument()
    expect(screen.queryByText('data!')).not.toBeInTheDocument()
  })

  it('renders data when loaded and not empty', () => {
    const query = makeQuery({ data: [1, 2, 3] })
    render(
      <DataState query={query} isEmpty={(d) => d.length === 0}>
        {(data) => <div data-testid="ok">{data.length} items</div>}
      </DataState>,
    )
    expect(screen.getByTestId('ok').textContent).toBe('3 items')
  })

  it('works in manual mode without a query prop', () => {
    render(
      <DataState data={{ name: 'Alice' }}>
        {(d) => <div>hello {d.name}</div>}
      </DataState>,
    )
    expect(screen.getByText('hello Alice')).toBeInTheDocument()
  })
})
