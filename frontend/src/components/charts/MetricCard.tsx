/**
 * MetricCard — a single-number KPI tile with optional delta indicator.
 *
 * Usage:
 *   <MetricCard
 *     label="Total Students"
 *     value={1248}
 *     delta={12}
 *     deltaLabel="vs. last month"
 *     icon="school"
 *     tone="primary"
 *   />
 *
 * Design goals:
 *   - Works standalone OR in a grid next to charts
 *   - Delta coloring is automatic based on sign (+green, −red)
 *   - Matches the existing dashboard card style
 */
import { clsx } from 'clsx'

export interface MetricCardProps {
  label: string
  value: string | number
  /** Positive or negative numeric delta. Omit to hide the delta row. */
  delta?: number
  /** Label after the delta value, e.g. "vs. last month" */
  deltaLabel?: string
  /** Material icon name */
  icon?: string
  /** Colour scheme for the icon badge */
  tone?: 'primary' | 'tertiary' | 'warning' | 'error' | 'neutral'
  /** Override how the delta sign colour works. Default: positive=good (tertiary). */
  invertDelta?: boolean
  className?: string
}

const TONE_STYLES = {
  primary: 'bg-primary/10 text-primary',
  tertiary: 'bg-tertiary/10 text-tertiary',
  warning: 'bg-amber-500/10 text-amber-600',
  error: 'bg-error/10 text-error',
  neutral: 'bg-surface-container-high text-on-surface-variant',
}

function formatDelta(n: number): string {
  const sign = n > 0 ? '+' : ''
  return `${sign}${n}%`
}

export default function MetricCard({
  label,
  value,
  delta,
  deltaLabel,
  icon,
  tone = 'primary',
  invertDelta = false,
  className = '',
}: MetricCardProps) {
  const deltaIsGood = invertDelta ? (delta ?? 0) < 0 : (delta ?? 0) > 0
  const deltaColour =
    delta === undefined || delta === 0
      ? 'text-on-surface-variant'
      : deltaIsGood
      ? 'text-tertiary'
      : 'text-error'

  return (
    <div
      className={clsx(
        'bg-surface-container-lowest rounded-xl p-5 transition-all hover:shadow-sm',
        className,
      )}
    >
      <div className="flex items-start justify-between gap-3 mb-3">
        <p className="text-xs font-bold uppercase tracking-widest text-on-surface-variant font-label leading-tight">
          {label}
        </p>
        {icon && (
          <div
            className={clsx(
              'w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0',
              TONE_STYLES[tone],
            )}
          >
            <span className="material-symbols-outlined text-lg">{icon}</span>
          </div>
        )}
      </div>
      <p className="text-3xl font-extrabold text-on-surface leading-none font-headline mb-1">
        {value}
      </p>
      {delta !== undefined && (
        <p className={clsx('text-xs font-semibold flex items-center gap-1', deltaColour)}>
          <span className="material-symbols-outlined text-sm">
            {delta > 0 ? 'trending_up' : delta < 0 ? 'trending_down' : 'trending_flat'}
          </span>
          {formatDelta(delta)}
          {deltaLabel && (
            <span className="text-on-surface-variant/70 font-normal ml-1">{deltaLabel}</span>
          )}
        </p>
      )}
    </div>
  )
}
