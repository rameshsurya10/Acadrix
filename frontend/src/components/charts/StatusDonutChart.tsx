/**
 * StatusDonutChart — small donut chart for status breakdowns
 * (e.g. "Paid 60% / Overdue 30% / Partial 10%").
 *
 * Usage:
 *   <StatusDonutChart
 *     data={[
 *       { label: 'Paid', value: 320, color: CHART_COLORS.tertiary },
 *       { label: 'Overdue', value: 80, color: CHART_COLORS.error },
 *     ]}
 *     total={400}
 *     centerLabel="Accounts"
 *   />
 */
import { Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts'
import { CHART_COLORS, CHART_DEFAULTS, CHART_PALETTE } from './chartTheme'

export interface DonutSlice {
  label: string
  value: number
  color?: string
}

export interface StatusDonutChartProps {
  data: DonutSlice[]
  height?: number
  /** Label shown in the centre of the donut. */
  centerLabel?: string
  /** Big number in the centre. If omitted, computed as sum of values. */
  total?: number
  showLegend?: boolean
}

export default function StatusDonutChart({
  data,
  height = 220,
  centerLabel,
  total,
  showLegend = true,
}: StatusDonutChartProps) {
  const computed = total ?? data.reduce((sum, d) => sum + d.value, 0)

  return (
    <div className="relative">
      <ResponsiveContainer width="100%" height={height}>
        <PieChart>
          <Pie
            data={data}
            dataKey="value"
            nameKey="label"
            cx="50%"
            cy="50%"
            innerRadius="60%"
            outerRadius="85%"
            paddingAngle={2}
            strokeWidth={0}
          >
            {data.map((slice, i) => (
              <Cell key={slice.label} fill={slice.color ?? CHART_PALETTE[i % CHART_PALETTE.length]} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              background: CHART_DEFAULTS.tooltipBackground,
              border: `1px solid ${CHART_DEFAULTS.tooltipBorder}`,
              borderRadius: CHART_DEFAULTS.tooltipRadius,
              boxShadow: '0 8px 24px -8px rgba(0, 0, 0, 0.12)',
              fontSize: CHART_DEFAULTS.fontSize,
            }}
          />
          {showLegend && (
            <Legend
              verticalAlign="bottom"
              iconType="circle"
              wrapperStyle={{ fontSize: CHART_DEFAULTS.fontSize, color: CHART_COLORS.textSecondary }}
            />
          )}
        </PieChart>
      </ResponsiveContainer>
      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none" style={{ height: showLegend ? `${height - 30}px` : `${height}px` }}>
        <p className="text-3xl font-extrabold text-on-surface font-headline leading-none">{computed.toLocaleString('en-IN')}</p>
        {centerLabel && (
          <p className="text-[0.65rem] font-bold uppercase tracking-widest text-on-surface-variant mt-1 font-label">
            {centerLabel}
          </p>
        )}
      </div>
    </div>
  )
}
