/**
 * Sanity tests for chart components.
 *
 * Recharts uses SVG under the hood. In jsdom, SVG rendering is limited so
 * we can't assert on chart geometry — but we can verify the components
 * mount, render labels, and don't throw on valid data.
 *
 * Also verifies MetricCard's delta sign logic — pure React component,
 * no SVG involved, so this is where we do the meaningful assertions.
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import MetricCard from '@/components/charts/MetricCard'
import CategoryBarChart from '@/components/charts/CategoryBarChart'
import StatusDonutChart from '@/components/charts/StatusDonutChart'
import { CHART_COLORS } from '@/components/charts/chartTheme'

// Recharts calls ResizeObserver — stub it out for jsdom
class ResizeObserverStub {
  observe() {}
  unobserve() {}
  disconnect() {}
}

beforeEach(() => {
  (globalThis as unknown as { ResizeObserver: unknown }).ResizeObserver = ResizeObserverStub
  // Recharts uses getBoundingClientRect for ResponsiveContainer sizing
  Element.prototype.getBoundingClientRect = vi.fn(() => ({
    width: 500,
    height: 300,
    top: 0,
    left: 0,
    right: 500,
    bottom: 300,
    x: 0,
    y: 0,
    toJSON() { return this },
  })) as unknown as Element['getBoundingClientRect']
})

afterEach(() => {
  vi.restoreAllMocks()
})

describe('MetricCard', () => {
  it('renders label + value', () => {
    render(<MetricCard label="Total Students" value={1248} />)
    expect(screen.getByText('Total Students')).toBeInTheDocument()
    expect(screen.getByText('1248')).toBeInTheDocument()
  })

  it('shows upward trend icon for positive delta', () => {
    render(<MetricCard label="Revenue" value="₹5,20,000" delta={12} deltaLabel="vs. last month" />)
    expect(screen.getByText('+12%')).toBeInTheDocument()
    expect(screen.getByText('trending_up')).toBeInTheDocument()
    expect(screen.getByText('vs. last month')).toBeInTheDocument()
  })

  it('shows downward trend icon for negative delta', () => {
    render(<MetricCard label="Errors" value={8} delta={-25} />)
    expect(screen.getByText('-25%')).toBeInTheDocument()
    expect(screen.getByText('trending_down')).toBeInTheDocument()
  })

  it('hides delta row when delta is undefined', () => {
    render(<MetricCard label="Total" value={100} />)
    expect(screen.queryByText(/trending/)).not.toBeInTheDocument()
  })

  it('renders icon badge when icon prop provided', () => {
    render(<MetricCard label="Students" value={500} icon="school" />)
    expect(screen.getByText('school')).toBeInTheDocument()
  })
})

describe('CategoryBarChart', () => {
  it('mounts without crashing for valid data', () => {
    const { container } = render(
      <CategoryBarChart
        data={[
          { label: 'Grade 1', value: 120 },
          { label: 'Grade 2', value: 95 },
        ]}
      />,
    )
    // Recharts renders an SVG
    expect(container.querySelector('svg')).toBeTruthy()
  })

  it('mounts for empty data without throwing', () => {
    expect(() => render(<CategoryBarChart data={[]} />)).not.toThrow()
  })
})

describe('StatusDonutChart', () => {
  it('shows the computed total in the centre', () => {
    render(
      <StatusDonutChart
        data={[
          { label: 'Paid', value: 320, color: CHART_COLORS.tertiary },
          { label: 'Overdue', value: 80, color: CHART_COLORS.error },
        ]}
        centerLabel="Accounts"
      />,
    )
    expect(screen.getByText('400')).toBeInTheDocument()
    expect(screen.getByText('Accounts')).toBeInTheDocument()
  })

  it('uses explicit total when provided', () => {
    render(
      <StatusDonutChart
        data={[{ label: 'A', value: 10 }]}
        total={999}
        centerLabel="Override"
      />,
    )
    expect(screen.getByText('999')).toBeInTheDocument()
  })
})
