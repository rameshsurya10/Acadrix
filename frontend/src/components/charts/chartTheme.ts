/**
 * Chart theme constants — matched to the Acadrix brand color system.
 *
 * Every chart component in this folder imports from here so we have a single
 * source of truth for chart colors. Change a value here, every chart updates.
 */

export const CHART_COLORS = {
  primary: '#2b5ab5',
  primaryLight: '#5a7fce',
  primarySoft: '#E8EEFA',
  tertiary: '#14b8a6',        // teal — "good" / "paid"
  error: '#dc2626',           // red — "overdue" / "failed"
  warning: '#f59e0b',         // amber — "pending" / "partial"
  neutral: '#64748b',
  surface: '#f8f9fa',
  gridLine: '#e5e7eb',
  textPrimary: '#191c1d',
  textSecondary: '#5b5e60',
} as const

/** Palette for multi-series charts. Ordered by brand priority. */
export const CHART_PALETTE = [
  CHART_COLORS.primary,
  CHART_COLORS.tertiary,
  CHART_COLORS.warning,
  CHART_COLORS.error,
  CHART_COLORS.primaryLight,
  CHART_COLORS.neutral,
]

export const CHART_DEFAULTS = {
  fontSize: 12,
  fontFamily: 'Inter, system-ui, sans-serif',
  gridStroke: CHART_COLORS.gridLine,
  gridStrokeDasharray: '3 3',
  axisStroke: CHART_COLORS.neutral,
  tooltipBackground: '#ffffff',
  tooltipBorder: 'rgba(0, 0, 0, 0.08)',
  tooltipRadius: 12,
} as const
