/**
 * DataState — a tiny wrapper that enforces consistent loading/error/empty
 * handling across the app.
 *
 * Usage with React Query:
 *   const query = useTuition()
 *   return (
 *     <DataState
 *       query={query}
 *       skeleton={<TuitionSkeleton />}
 *       empty={<EmptyTuition />}
 *       isEmpty={(data) => !data.line_items.length}
 *     >
 *       {(data) => <TuitionDetails data={data} />}
 *     </DataState>
 *   )
 *
 * Usage with manual loading/error tuples:
 *   <DataState loading={isLoading} error={error} data={items}>
 *     {(items) => <List items={items} />}
 *   </DataState>
 *
 * Why: 35+ pages currently hand-roll the same `if (loading) ... if (error) ...
 * if (!data) ...` pattern. Centralising it:
 *   1. Enforces that empty states exist (easy to forget)
 *   2. Standardises the look of loading/error/empty UI
 *   3. Reduces bugs from flipping isLoading -> error -> data transitions wrong
 */
import type { ReactNode } from 'react'

/** A minimal subset of the TanStack Query result shape we care about. */
interface QueryLike<T> {
  data: T | undefined
  isLoading: boolean
  isError: boolean
  error: unknown
  refetch?: () => unknown
}

interface DataStateProps<T> {
  /** A TanStack Query result. Pass either this OR the manual props below. */
  query?: QueryLike<T>
  /** Manual loading flag (if not using `query`). */
  loading?: boolean
  /** Manual error (if not using `query`). */
  error?: unknown
  /** Manual data (if not using `query`). */
  data?: T
  /** Custom skeleton/spinner shown while loading. */
  skeleton?: ReactNode
  /** Custom empty state shown when `isEmpty(data)` returns true. */
  empty?: ReactNode
  /** Predicate deciding whether the loaded data counts as empty. */
  isEmpty?: (data: T) => boolean
  /** Renders the success state. Receives the loaded data. */
  children: (data: T) => ReactNode
}

function extractErrorMessage(err: unknown): string {
  if (!err) return 'Something went wrong.'
  if (err instanceof Error) return err.message
  if (typeof err === 'object' && err && 'response' in err) {
    const response = (err as { response?: { data?: { detail?: string; error?: string } } }).response
    return response?.data?.detail ?? response?.data?.error ?? 'Request failed.'
  }
  return 'Something went wrong.'
}

export function DataState<T>({
  query,
  loading: loadingProp,
  error: errorProp,
  data: dataProp,
  skeleton,
  empty,
  isEmpty,
  children,
}: DataStateProps<T>) {
  const loading = query ? query.isLoading : loadingProp ?? false
  const isError = query ? query.isError : Boolean(errorProp)
  const error = query ? query.error : errorProp
  const data = query ? query.data : dataProp
  const refetch = query?.refetch

  if (loading) {
    return <>{skeleton ?? <DefaultSkeleton />}</>
  }

  if (isError) {
    return <DefaultError message={extractErrorMessage(error)} onRetry={refetch} />
  }

  if (data === undefined || data === null) {
    return <>{empty ?? <DefaultEmpty />}</>
  }

  if (isEmpty && isEmpty(data)) {
    return <>{empty ?? <DefaultEmpty />}</>
  }

  return <>{children(data)}</>
}

function DefaultSkeleton() {
  return (
    <div className="space-y-3" aria-busy="true" aria-live="polite">
      {Array.from({ length: 4 }).map((_, i) => (
        <div
          key={i}
          className="h-16 bg-surface-container-high rounded-xl animate-pulse"
          style={{ animationDelay: `${i * 80}ms` }}
        />
      ))}
    </div>
  )
}

function DefaultError({ message, onRetry }: { message: string; onRetry?: () => unknown }) {
  return (
    <div className="bg-error/10 text-error rounded-xl p-6 flex items-start gap-3" role="alert">
      <span className="material-symbols-outlined text-lg mt-0.5">error</span>
      <div className="flex-1 min-w-0">
        <p className="font-bold text-sm">Failed to load</p>
        <p className="text-xs mt-0.5 opacity-80">{message}</p>
        {onRetry && (
          <button
            type="button"
            onClick={() => onRetry()}
            className="mt-3 bg-error text-on-error text-xs font-bold px-3 py-1.5 rounded-lg hover:bg-error/90 transition-colors"
          >
            Try Again
          </button>
        )}
      </div>
    </div>
  )
}

function DefaultEmpty() {
  return (
    <div className="text-center py-12 px-6">
      <div className="w-14 h-14 mx-auto rounded-2xl bg-surface-container-high flex items-center justify-center mb-3">
        <span className="material-symbols-outlined text-on-surface-variant text-2xl">inbox</span>
      </div>
      <p className="text-on-surface font-semibold text-sm">Nothing to show yet</p>
      <p className="text-on-surface-variant text-xs mt-1">There's no data available for this view.</p>
    </div>
  )
}

export default DataState
