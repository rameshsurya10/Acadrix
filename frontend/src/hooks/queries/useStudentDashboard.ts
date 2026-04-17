/**
 * React Query hook for the student dashboard endpoint.
 *
 * This is the most-visited page for student/parent users, so it's worth
 * refetching on window focus (e.g. when the parent switches back from
 * another tab after checking email).
 */
import { useQuery } from '@tanstack/react-query'
import { studentService, type StudentDashboardData } from '@/services/student/studentService'
import { queryKeys } from '@/lib/queryClient'

export function useStudentDashboard() {
  return useQuery<StudentDashboardData>({
    queryKey: queryKeys.studentDashboard(),
    queryFn: () => studentService.getDashboard(),
    staleTime: 30_000,
    refetchOnWindowFocus: true, // keep dashboard fresh on tab-switch
  })
}
