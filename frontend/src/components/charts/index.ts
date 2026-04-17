/** Barrel export for the charts module. */
export { default as MetricCard } from './MetricCard'
export type { MetricCardProps } from './MetricCard'

export { default as TrendLineChart } from './TrendLineChart'
export type { TrendLineChartProps, TrendPoint } from './TrendLineChart'

export { default as CategoryBarChart } from './CategoryBarChart'
export type { CategoryBarChartProps, BarPoint } from './CategoryBarChart'

export { default as StatusDonutChart } from './StatusDonutChart'
export type { StatusDonutChartProps, DonutSlice } from './StatusDonutChart'

export { CHART_COLORS, CHART_PALETTE, CHART_DEFAULTS } from './chartTheme'
