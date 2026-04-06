/**
 * Reusable skeleton loading primitives.
 * Uses the project's Material Design 3 surface tokens for consistency.
 */

interface BoneProps {
  className?: string
}

/** Base shimmer block — the building block for all skeletons. */
export function Bone({ className = '' }: BoneProps) {
  return <div className={`animate-pulse bg-surface-container-high rounded ${className}`} />
}

/** Text line placeholder. */
export function SkeletonLine({ width = 'w-full', height = 'h-4', className = '' }: { width?: string; height?: string; className?: string }) {
  return <Bone className={`${width} ${height} rounded-md ${className}`} />
}

/** Circle placeholder (avatar, icon). */
export function SkeletonCircle({ size = 'w-10 h-10' }: { size?: string }) {
  return <Bone className={`${size} rounded-full`} />
}

/** Metric card skeleton (number + label). */
export function SkeletonMetricCard({ className = '' }: { className?: string }) {
  return (
    <div className={`bg-surface-container-lowest p-6 rounded-xl space-y-4 ${className}`}>
      <Bone className="w-24 h-3 rounded-md" />
      <Bone className="w-20 h-8 rounded-md" />
      <Bone className="w-16 h-3 rounded-md" />
    </div>
  )
}

/** Table row skeleton. */
export function SkeletonTableRow({ cols = 4 }: { cols?: number }) {
  return (
    <tr className="border-b border-outline-variant/5">
      {Array.from({ length: cols }).map((_, i) => (
        <td key={i} className="px-6 py-4">
          {i === 0 ? (
            <div className="flex items-center gap-3">
              <Bone className="w-10 h-10 rounded-lg" />
              <div className="space-y-2">
                <Bone className="w-28 h-4 rounded-md" />
                <Bone className="w-20 h-3 rounded-md" />
              </div>
            </div>
          ) : (
            <Bone className="w-20 h-4 rounded-md" />
          )}
        </td>
      ))}
    </tr>
  )
}

/** Student row skeleton (for StudentsPage bento layout). */
export function SkeletonStudentRow() {
  return (
    <div className="bg-surface-container-lowest p-5 rounded-xl flex flex-col lg:flex-row lg:items-center justify-between gap-6">
      <div className="flex items-center gap-5">
        <Bone className="w-14 h-14 rounded-lg" />
        <div className="space-y-2">
          <Bone className="w-36 h-5 rounded-md" />
          <Bone className="w-24 h-3 rounded-md" />
        </div>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-8 flex-grow max-w-3xl">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="space-y-2">
            <Bone className="w-16 h-3 rounded-md" />
            <Bone className="w-20 h-4 rounded-md" />
          </div>
        ))}
      </div>
      <div className="flex items-center gap-2">
        <Bone className="w-8 h-8 rounded" />
        <Bone className="w-8 h-8 rounded" />
        <Bone className="w-8 h-8 rounded" />
      </div>
    </div>
  )
}

/** Application card skeleton (for AdmissionsPage). */
export function SkeletonApplicationCard() {
  return (
    <div className="bg-surface p-5 rounded-2xl flex items-center justify-between gap-4">
      <div className="flex items-center gap-4">
        <Bone className="w-12 h-12 rounded-xl" />
        <div className="space-y-2">
          <Bone className="w-32 h-4 rounded-md" />
          <Bone className="w-24 h-3 rounded-md" />
        </div>
      </div>
      <Bone className="w-20 h-6 rounded-full" />
    </div>
  )
}

/** Notification / message card skeleton. */
export function SkeletonMessageCard() {
  return (
    <div className="bg-surface-container-lowest p-6 rounded-xl flex items-start gap-4">
      <Bone className="w-12 h-12 rounded-full flex-shrink-0" />
      <div className="flex-1 space-y-3">
        <div className="flex justify-between">
          <Bone className="w-48 h-4 rounded-md" />
          <Bone className="w-16 h-3 rounded-md" />
        </div>
        <Bone className="w-full h-3 rounded-md" />
        <Bone className="w-3/4 h-3 rounded-md" />
      </div>
    </div>
  )
}

/** Full-page skeleton for dashboard-like layouts. */
export function SkeletonDashboard() {
  return (
    <div className="max-w-7xl mx-auto px-6 py-10 pb-32 space-y-8">
      {/* Header */}
      <div className="space-y-3 mb-10">
        <Bone className="w-32 h-3 rounded-md" />
        <Bone className="w-64 h-8 rounded-md" />
      </div>
      {/* Metric cards */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
        <div className="md:col-span-8 grid grid-cols-1 sm:grid-cols-3 gap-4">
          <SkeletonMetricCard />
          <SkeletonMetricCard />
          <SkeletonMetricCard />
        </div>
        <div className="md:col-span-4">
          <Bone className="w-full h-44 rounded-xl" />
        </div>
      </div>
      {/* Table */}
      <div className="space-y-4">
        <Bone className="w-40 h-6 rounded-md" />
        <div className="bg-surface-container-low rounded-xl overflow-hidden">
          <table className="w-full">
            <tbody>
              <SkeletonTableRow cols={4} />
              <SkeletonTableRow cols={4} />
              <SkeletonTableRow cols={4} />
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

/** Profile header skeleton. */
export function SkeletonProfileHeader() {
  return (
    <div className="bg-surface-container-lowest rounded-xl p-8 flex flex-col md:flex-row gap-8 items-start">
      <Bone className="w-32 h-32 md:w-40 md:h-40 rounded-2xl" />
      <div className="flex-1 space-y-4">
        <Bone className="w-24 h-5 rounded-full" />
        <Bone className="w-56 h-8 rounded-md" />
        <Bone className="w-40 h-5 rounded-md" />
        <div className="grid grid-cols-2 gap-4 mt-4">
          <Bone className="h-16 rounded-lg" />
          <Bone className="h-16 rounded-lg" />
        </div>
      </div>
    </div>
  )
}
