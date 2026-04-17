/**
 * Test wrapper pattern for React Query hooks.
 *
 * Every hook test needs a fresh QueryClient (shared state bleeds between
 * tests otherwise). This helper creates a per-test client with retry:false
 * so failed queries surface immediately instead of re-running for 8s.
 */
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useTuition } from '@/hooks/queries/useTuition'

vi.mock('@/services/student/studentService', () => ({
  studentService: {
    getTuition: vi.fn(),
  },
}))

import { studentService } from '@/services/student/studentService'

function renderWithQuery(ui: React.ReactElement) {
  const client = new QueryClient({
    defaultOptions: {
      queries: { retry: false, gcTime: 0 },
    },
  })
  return render(
    <QueryClientProvider client={client}>{ui}</QueryClientProvider>,
  )
}

function TuitionProbe() {
  const { data, isLoading, error } = useTuition()
  if (isLoading) return <div data-testid="status">loading</div>
  if (error) return <div data-testid="status">error</div>
  return <div data-testid="status">{data?.status ?? 'no-data'}</div>
}

describe('useTuition', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('shows loading state then renders data on success', async () => {
    vi.mocked(studentService.getTuition).mockResolvedValue({
      id: 1,
      student_id: 'SM-001',
      student_name: 'Test',
      total_amount: '10000',
      paid_amount: '5000',
      outstanding_balance: '5000',
      status: 'partial',
      due_date: null,
      semester: 'Term 1',
      line_items: [],
    } as unknown as Awaited<ReturnType<typeof studentService.getTuition>>)

    renderWithQuery(<TuitionProbe />)

    expect(screen.getByTestId('status').textContent).toBe('loading')
    await waitFor(() => {
      expect(screen.getByTestId('status').textContent).toBe('partial')
    })
    expect(studentService.getTuition).toHaveBeenCalledTimes(1)
  })

  it('surfaces errors', async () => {
    vi.mocked(studentService.getTuition).mockRejectedValue(new Error('boom'))

    renderWithQuery(<TuitionProbe />)

    await waitFor(() => {
      expect(screen.getByTestId('status').textContent).toBe('error')
    })
  })
})
