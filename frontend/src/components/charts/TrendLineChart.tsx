/**
 * TrendLineChart — responsive line chart for time-series data.
 *
 * Usage:
 *   <TrendLineChart
 *     data={[
 *       { label: 'Jan', value: 420 },
 *       { label: 'Feb', value: 510 },
 *       { label: 'Mar', value: 488 },
 *     ]}
 *     height={240}
 *     yLabel="Students"
 *   />
 */
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { CHART_COLORS, CHART_DEFAULTS } from './chartTheme'

export interface TrendPoint {
  label: string
  value: number
}

export interface TrendLineChartProps {
  data: TrendPoint[]
  height?: number
  color?: string
  yLabel?: string
}

export default function TrendLineChart({
  data,
  height = 220,
  color = CHART_COLORS.primary,
  yLabel,
}: TrendLineChartProps) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={data} margin={{ top: 8, right: 12, left: 4, bottom: 4 }}>
        <CartesianGrid
          strokeDasharray={CHART_DEFAULTS.gridStrokeDasharray}
          stroke={CHART_DEFAULTS.gridStroke}
          vertical={false}
        />
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
          label={
            yLabel
              ? {
                  value: yLabel,
                  angle: -90,
                  position: 'insideLeft',
                  fontSize: 11,
                  fill: CHART_COLORS.textSecondary,
                }
              : undefined
          }
        />
        <Tooltip
          contentStyle={{
            background: CHART_DEFAULTS.tooltipBackground,
            border: `1px solid ${CHART_DEFAULTS.tooltipBorder}`,
            borderRadius: CHART_DEFAULTS.tooltipRadius,
            boxShadow: '0 8px 24px -8px rgba(0, 0, 0, 0.12)',
            fontSize: CHART_DEFAULTS.fontSize,
          }}
          labelStyle={{ fontWeight: 700, color: CHART_COLORS.textPrimary }}
        />
        <Line
          type="monotone"
          dataKey="value"
          stroke={color}
          strokeWidth={2.5}
          dot={{ r: 4, strokeWidth: 2, fill: '#fff' }}
          activeDot={{ r: 6, strokeWidth: 2, fill: color }}
        />
      </LineChart>
    </ResponsiveContainer>
  )
}
