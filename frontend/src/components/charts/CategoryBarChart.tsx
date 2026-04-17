/**
 * CategoryBarChart — responsive bar chart for categorical data.
 *
 * Usage:
 *   <CategoryBarChart
 *     data={[
 *       { label: 'Grade 1', value: 120 },
 *       { label: 'Grade 2', value: 95 },
 *     ]}
 *     color="primary"
 *   />
 */
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { CHART_COLORS, CHART_DEFAULTS } from './chartTheme'

export interface BarPoint {
  label: string
  value: number
}

type ColorKey = 'primary' | 'tertiary' | 'warning' | 'error' | 'neutral'

const COLOR_MAP: Record<ColorKey, string> = {
  primary: CHART_COLORS.primary,
  tertiary: CHART_COLORS.tertiary,
  warning: CHART_COLORS.warning,
  error: CHART_COLORS.error,
  neutral: CHART_COLORS.neutral,
}

export interface CategoryBarChartProps {
  data: BarPoint[]
  height?: number
  color?: ColorKey
  /** Render bars horizontally (long category labels). Default false. */
  horizontal?: boolean
}

export default function CategoryBarChart({
  data,
  height = 240,
  color = 'primary',
  horizontal = false,
}: CategoryBarChartProps) {
  const barColor = COLOR_MAP[color]

  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart
        data={data}
        layout={horizontal ? 'vertical' : 'horizontal'}
        margin={{ top: 8, right: 12, left: horizontal ? 60 : 4, bottom: 4 }}
      >
        <CartesianGrid
          strokeDasharray={CHART_DEFAULTS.gridStrokeDasharray}
          stroke={CHART_DEFAULTS.gridStroke}
          vertical={horizontal}
          horizontal={!horizontal}
        />
        {horizontal ? (
          <>
            <XAxis
              type="number"
              stroke={CHART_DEFAULTS.axisStroke}
              tick={{ fontSize: CHART_DEFAULTS.fontSize, fill: CHART_COLORS.textSecondary }}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              dataKey="label"
              type="category"
              stroke={CHART_DEFAULTS.axisStroke}
              tick={{ fontSize: CHART_DEFAULTS.fontSize, fill: CHART_COLORS.textSecondary }}
              tickLine={false}
              axisLine={false}
              width={80}
            />
          </>
        ) : (
          <>
            <XAxis
              dataKey="label"
              stroke={CHART_DEFAULTS.axisStroke}
              tick={{ fontSize: CHART_DEFAULTS.fontSize, fill: CHART_COLORS.textSecondary }}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              stroke={CHART_DEFAULTS.axisStroke}
              tick={{ fontSize: CHART_DEFAULTS.fontSize, fill: CHART_COLORS.textSecondary }}
              tickLine={false}
              axisLine={false}
            />
          </>
        )}
        <Tooltip
          cursor={{ fill: 'rgba(0, 0, 0, 0.04)' }}
          contentStyle={{
            background: CHART_DEFAULTS.tooltipBackground,
            border: `1px solid ${CHART_DEFAULTS.tooltipBorder}`,
            borderRadius: CHART_DEFAULTS.tooltipRadius,
            boxShadow: '0 8px 24px -8px rgba(0, 0, 0, 0.12)',
            fontSize: CHART_DEFAULTS.fontSize,
          }}
          labelStyle={{ fontWeight: 700, color: CHART_COLORS.textPrimary }}
        />
        <Bar dataKey="value" fill={barColor} radius={[8, 8, 0, 0]} maxBarSize={48} />
      </BarChart>
    </ResponsiveContainer>
  )
}
