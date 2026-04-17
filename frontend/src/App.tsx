import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { AuthProvider, useAuth, UserRole } from '@/contexts/AuthContext'
import ProtectedRoute from '@/components/shared/ProtectedRoute'
import PWAUpdatePrompt from '@/components/shared/PWAUpdatePrompt'
import ErrorBoundary from '@/components/shared/ErrorBoundary'
import { queryClient } from '@/lib/queryClient'
import type { ReactNode } from 'react'

/** Wraps its children in an ErrorBoundary keyed on the current pathname,
 * so navigating away from a crashed page automatically clears the error. */
function RoutedErrorBoundary({ children }: { children: ReactNode }) {
  const { pathname } = useLocation()
  return <ErrorBoundary resetKey={pathname}>{children}</ErrorBoundary>
}

const ROLE_HOME: Record<UserRole, string> = {
  super_admin: '/super-admin/dashboard',
  admin:       '/admin/dashboard',
  finance:     '/finance/dashboard',
  principal:   '/principal/dashboard',
  teacher:     '/teacher/dashboard',
  student:     '/student/dashboard',
}

function RootRedirect() {
  const { user, isLoading } = useAuth()
  if (isLoading) return (
    <div className="min-h-screen bg-[#f8f9fa] flex flex-col">
      {/* Skeleton header */}
      <div className="h-16 bg-surface-container-lowest border-b border-outline-variant/10 flex items-center px-6 gap-4">
        <div className="w-8 h-8 rounded-lg bg-surface-container-high animate-pulse" />
        <div className="w-24 h-4 rounded bg-surface-container-high animate-pulse" />
      </div>
      <div className="flex-1 flex items-center justify-center">
        <div className="space-y-6 w-full max-w-md px-8">
          <div className="w-48 h-6 rounded bg-surface-container-high animate-pulse mx-auto" />
          <div className="w-full h-4 rounded bg-surface-container-high animate-pulse" />
          <div className="w-3/4 h-4 rounded bg-surface-container-high animate-pulse" />
          <div className="w-1/2 h-4 rounded bg-surface-container-high animate-pulse" />
        </div>
      </div>
    </div>
  )
  if (!user) return <Navigate to="/login" replace />
  return <Navigate to={ROLE_HOME[user.role]} replace />
}

// Auth
import LoginPage from '@/pages/auth/LoginPage'
import GoogleCallbackPage from '@/pages/auth/GoogleCallbackPage'

// Public
import PrivacyPolicyPage from '@/pages/public/PrivacyPolicyPage'
import TermsOfServicePage from '@/pages/public/TermsOfServicePage'
import HelpCenterPage from '@/pages/public/HelpCenterPage'

// Super Admin
import SuperAdminDashboard from '@/pages/superAdmin/DashboardPage'
import SuperAdminAdmins from '@/pages/superAdmin/AdminsPage'
import SuperAdminPrincipals from '@/pages/superAdmin/PrincipalsPage'
import SuperAdminUsers from '@/pages/superAdmin/UsersPage'
import SuperAdminSettings from '@/pages/superAdmin/SettingsPage'
import SuperAdminAnnouncements from '@/pages/superAdmin/AnnouncementsPage'
import SuperAdminAuditLogs from '@/pages/superAdmin/AuditLogsPage'

// Admin
import AdminDashboard from '@/pages/admin/DashboardPage'
import AdminAdmissions from '@/pages/admin/AdmissionsPage'
import AdminAssessments from '@/pages/admin/AssessmentsPage'
import AdminFinance from '@/pages/admin/FinancePage'
import AdminStudents from '@/pages/admin/StudentsPage'
import AdminProfile from '@/pages/admin/ProfilePage'
import AdminAcademicYears from '@/pages/admin/AcademicYearsPage'
import AdminClasses from '@/pages/admin/ClassesPage'
import AdminSubjects from '@/pages/admin/SubjectsPage'
import AdminCourses from '@/pages/admin/CoursesPage'
import AdminProfileEdit from '@/pages/admin/ProfileEditPage'
import AdminFeeTemplates from '@/pages/admin/FeeTemplatesPage'

// Finance
import FinanceDashboard from '@/pages/finance/DashboardPage'
import FinanceDefaulters from '@/pages/finance/DefaultersPage'
import FinanceReceipt from '@/pages/finance/ReceiptPage'

// Principal
import PrincipalDashboard from '@/pages/principal/DashboardPage'
import QuestionGenerator from '@/pages/principal/QuestionGeneratorPage'

// Teacher
import TeacherDashboard from '@/pages/teacher/DashboardPage'
import Gradebook from '@/pages/teacher/GradebookPage'
import TestCreation from '@/pages/teacher/TestCreationPage'
import TeacherAttendance from '@/pages/teacher/AttendancePage'

// Student
import StudentDashboard from '@/pages/student/DashboardPage'
import StudentProfile from '@/pages/student/ProfilePage'
import TestResults from '@/pages/student/TestResultsPage'
import Tuition from '@/pages/student/TuitionPage'

// Payments
import PaymentsPage from '@/pages/student/PaymentsPage'

// UDISE
import UDISEProfile from '@/pages/admin/UDISEProfilePage'
import UDISEData from '@/pages/admin/UDISEDataPage'

// Payment Gateway (Super Admin)
import PaymentGateway from '@/pages/superAdmin/PaymentGatewayPage'

// Pay Fees (Student)
import PayFees from '@/pages/student/PayFeesPage'

// Report Cards & Certificates
import AdminReportCardTemplates from '@/pages/admin/ReportCardTemplatesPage'
import AdminGenerateReportCards from '@/pages/admin/GenerateReportCardsPage'
import AdminCertificateTemplates from '@/pages/admin/CertificateTemplatesPage'
import AdminIssueCertificate from '@/pages/admin/IssueCertificatePage'
import StudentReportCards from '@/pages/student/ReportCardsPage'

// Enrollment
import AdminEnrollment from '@/pages/admin/EnrollmentPage'
import TeacherEnrollment from '@/pages/teacher/EnrollmentPage'

// Leave Management
import ApplyLeave from '@/pages/leave/ApplyLeavePage'
import MyLeaves from '@/pages/leave/MyLeavesPage'
import LeaveApprovals from '@/pages/admin/LeaveApprovalsPage'
import LeaveConfig from '@/pages/admin/LeaveConfigPage'

// HR / Payroll
import Payroll from '@/pages/finance/PayrollPage'
import SalaryStructures from '@/pages/finance/SalaryStructuresPage'
import TeacherPayslips from '@/pages/teacher/PayslipsPage'

// Shared
import MessagingCenter from '@/pages/shared/MessagingPage'
import FacultyDirectory from '@/pages/shared/FacultyDirectoryPage'
import FacultyProfile from '@/pages/shared/FacultyProfilePage'
import Timetable from '@/pages/shared/TimetablePage'

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>
          <RoutedErrorBoundary>
          <Routes>
          {/* Public */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/auth/google/callback" element={<GoogleCallbackPage />} />
          <Route path="/privacy" element={<PrivacyPolicyPage />} />
          <Route path="/terms" element={<TermsOfServicePage />} />
          <Route path="/help" element={<HelpCenterPage />} />
          <Route path="/" element={<RootRedirect />} />

          {/* Super Admin */}
          <Route path="/super-admin" element={<ProtectedRoute role="super_admin" />}>
            <Route path="dashboard" element={<SuperAdminDashboard />} />
            <Route path="admins" element={<SuperAdminAdmins />} />
            <Route path="principals" element={<SuperAdminPrincipals />} />
            <Route path="users" element={<SuperAdminUsers />} />
            <Route path="settings" element={<SuperAdminSettings />} />
            <Route path="announcements" element={<SuperAdminAnnouncements />} />
            <Route path="audit-logs" element={<SuperAdminAuditLogs />} />
            <Route path="payment-gateway" element={<PaymentGateway />} />
          </Route>

          {/* Admin */}
          <Route path="/admin" element={<ProtectedRoute role="admin" />}>
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="admissions" element={<AdminAdmissions />} />
            <Route path="assessments" element={<AdminAssessments />} />
            <Route path="finance" element={<AdminFinance />} />
            <Route path="students" element={<AdminStudents />} />
            <Route path="profile" element={<AdminProfile />} />
            <Route path="profile/edit" element={<AdminProfileEdit />} />
            <Route path="enrollment" element={<AdminEnrollment />} />
            <Route path="academic-years" element={<AdminAcademicYears />} />
            <Route path="classes" element={<AdminClasses />} />
            <Route path="subjects" element={<AdminSubjects />} />
            <Route path="courses" element={<AdminCourses />} />
            <Route path="report-card-templates" element={<AdminReportCardTemplates />} />
            <Route path="generate-report-cards" element={<AdminGenerateReportCards />} />
            <Route path="certificate-templates" element={<AdminCertificateTemplates />} />
            <Route path="issue-certificate" element={<AdminIssueCertificate />} />
            <Route path="udise-profile" element={<UDISEProfile />} />
            <Route path="udise-data" element={<UDISEData />} />
            <Route path="leave-approvals" element={<LeaveApprovals />} />
            <Route path="leave-config" element={<LeaveConfig />} />
          </Route>

          {/* Finance */}
          <Route path="/finance" element={<ProtectedRoute role="finance" />}>
            <Route path="dashboard" element={<FinanceDashboard />} />
            <Route path="fee-templates" element={<AdminFeeTemplates />} />
            <Route path="payments" element={<AdminFinance />} />
            <Route path="discounts" element={<AdminFeeTemplates />} />
            <Route path="defaulters" element={<FinanceDefaulters />} />
            <Route path="receipt/:paymentId" element={<FinanceReceipt />} />
            <Route path="payroll" element={<Payroll />} />
            <Route path="salary-structures" element={<SalaryStructures />} />
          </Route>

          {/* Principal */}
          <Route path="/principal" element={<ProtectedRoute role="principal" />}>
            <Route path="dashboard" element={<PrincipalDashboard />} />
            <Route path="question-generator" element={<QuestionGenerator />} />
            <Route path="enrollment" element={<AdminEnrollment />} />
          </Route>

          {/* Teacher */}
          <Route path="/teacher" element={<ProtectedRoute role="teacher" />}>
            <Route path="dashboard" element={<TeacherDashboard />} />
            <Route path="gradebook" element={<Gradebook />} />
            <Route path="tests" element={<TestCreation />} />
            <Route path="attendance" element={<TeacherAttendance />} />
            <Route path="enrollment" element={<TeacherEnrollment />} />
            <Route path="payslips" element={<TeacherPayslips />} />
          </Route>

          {/* Student */}
          <Route path="/student" element={<ProtectedRoute role="student" />}>
            <Route path="dashboard" element={<StudentDashboard />} />
            <Route path="profile" element={<StudentProfile />} />
            <Route path="results" element={<TestResults />} />
            <Route path="tuition" element={<Tuition />} />
            <Route path="payments" element={<PaymentsPage />} />
            <Route path="pay" element={<PayFees />} />
            <Route path="report-cards" element={<StudentReportCards />} />
          </Route>

          {/* Leave (all authenticated roles) */}
          <Route path="/leave" element={<ProtectedRoute role="any" />}>
            <Route path="apply" element={<ApplyLeave />} />
            <Route path="my-leaves" element={<MyLeaves />} />
          </Route>

          {/* Shared (all roles) */}
          <Route path="/messaging" element={<ProtectedRoute role="any" />}>
            <Route index element={<MessagingCenter />} />
          </Route>
          <Route path="/faculty" element={<ProtectedRoute role="any" />}>
            <Route index element={<FacultyDirectory />} />
            <Route path=":id" element={<FacultyProfile />} />
          </Route>
          <Route path="/timetable" element={<ProtectedRoute role="any" />}>
            <Route index element={<Timetable />} />
          </Route>
          </Routes>
          </RoutedErrorBoundary>
        </AuthProvider>
      </BrowserRouter>
      <PWAUpdatePrompt />
      {import.meta.env.DEV && <ReactQueryDevtools initialIsOpen={false} buttonPosition="bottom-right" />}
    </QueryClientProvider>
  )
}
