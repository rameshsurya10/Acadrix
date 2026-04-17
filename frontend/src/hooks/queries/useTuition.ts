/**
 * React Query hook for the student's tuition account.
 *
 * Usage:
 *   const { data: tuition, isLoading, error } = useTuition()
 *
 * Invalidation:
 *   After a payment succeeds, call:
 *     queryClient.invalidateQueries({ queryKey: queryKeys.tuition() })
 *   to force a refetch.
 */
import { useQuery } from '@tanstack/react-query'
import { studentService, type TuitionAccount } from '@/services/student/studentService'
import { queryKeys } from '@/lib/queryClient'

export function useTuition() {
  return useQuery<TuitionAccount>({
    queryKey: queryKeys.tuition(),
    queryFn: () => studentService.getTuition(),
    staleTime: 60_000, // tuition changes rarely — 1 min is safe
  })
}
