/**
 * Global TanStack Query client for Acadrix.
 *
 * Defaults are tuned for a data-heavy SPA:
 *  - 30s staleTime prevents aggressive refetches on every remount
 *  - No refetchOnWindowFocus (opt-in per query when actually needed)
 *  - 1 retry on failure (instead of the default 3 which adds 6s+ of spinning)
 *  - 5 min gcTime so cached data survives a normal navigation round-trip
 */
import { QueryClient } from '@tanstack/react-query'

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,          // 30s — treat data as fresh for this long
      gcTime: 5 * 60_000,         // 5min — keep unused cache entries around
      refetchOnWindowFocus: false, // opt-in per hook, not global
      refetchOnReconnect: true,
      retry: 1,                    // 1 retry then fail
      retryDelay: (attempt) => Math.min(1000 * 2 ** attempt, 8000),
    },
    mutations: {
      retry: 0, // mutations should NEVER auto-retry (not idempotent in general)
    },
  },
})

/**
 * Centralised query key registry. Using a factory keeps keys consistent
 * across hooks and components. When invalidating, prefer the factory too:
 *    queryClient.invalidateQueries({ queryKey: queryKeys.tuition() })
 */
export const queryKeys = {
  // Auth / current user
  me: () => ['me'] as const,

  // Student endpoints
  tuition: () => ['student', 'tuition'] as const,
  studentDashboard: () => ['student', 'dashboard'] as const,
  studentPayments: () => ['student', 'payments'] as const,
  studentGrades: () => ['student', 'grades'] as const,
  studentAttendance: () => ['student', 'attendance'] as const,

  // Reference data (changes rarely)
  grades: () => ['shared', 'grades'] as const,
  subjects: () => ['shared', 'subjects'] as const,
  faculty: (params?: { search?: string; department?: string }) =>
    ['shared', 'faculty', params ?? {}] as const,

  // Admin dashboards
  adminDashboardStats: () => ['admin', 'dashboard-stats'] as const,
  principalDashboard: () => ['principal', 'dashboard'] as const,
  superAdminDashboard: () => ['super-admin', 'dashboard'] as const,
}
