import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth, UserRole } from '@/contexts/AuthContext'
import ProtectedRoute from '@/components/shared/ProtectedRoute'

const ROLE_HOME: Record<UserRole, string> = {
  admin:     '/admin/dashboard',
  principal: '/principal/dashboard',
  teacher:   '/teacher/dashboard',
  student:   '/student/dashboard',
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

// Admin
import AdminDashboard from '@/pages/admin/DashboardPage'
import AdminAdmissions from '@/pages/admin/AdmissionsPage'
import AdminAssessments from '@/pages/admin/AssessmentsPage'
import AdminFinance from '@/pages/admin/FinancePage'
import AdminStudents from '@/pages/admin/StudentsPage'
import AdminProfile from '@/pages/admin/ProfilePage'

// Principal
import PrincipalDashboard from '@/pages/principal/DashboardPage'
import QuestionGenerator from '@/pages/principal/QuestionGeneratorPage'

// Teacher
import TeacherDashboard from '@/pages/teacher/DashboardPage'
import Gradebook from '@/pages/teacher/GradebookPage'
import TestCreation from '@/pages/teacher/TestCreationPage'

// Student
import StudentDashboard from '@/pages/student/DashboardPage'
import StudentProfile from '@/pages/student/ProfilePage'
import TestResults from '@/pages/student/TestResultsPage'
import Tuition from '@/pages/student/TuitionPage'

// Payments
import PaymentsPage from '@/pages/student/PaymentsPage'

// Enrollment
import AdminEnrollment from '@/pages/admin/EnrollmentPage'
import TeacherEnrollment from '@/pages/teacher/EnrollmentPage'

// Shared
import MessagingCenter from '@/pages/shared/MessagingPage'
import FacultyDirectory from '@/pages/shared/FacultyDirectoryPage'
import FacultyProfile from '@/pages/shared/FacultyProfilePage'

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Public */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/auth/google/callback" element={<GoogleCallbackPage />} />
          <Route path="/privacy" element={<PrivacyPolicyPage />} />
          <Route path="/terms" element={<TermsOfServicePage />} />
          <Route path="/help" element={<HelpCenterPage />} />
          <Route path="/" element={<RootRedirect />} />

          {/* Admin */}
          <Route path="/admin" element={<ProtectedRoute role="admin" />}>
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="admissions" element={<AdminAdmissions />} />
            <Route path="assessments" element={<AdminAssessments />} />
            <Route path="finance" element={<AdminFinance />} />
            <Route path="students" element={<AdminStudents />} />
            <Route path="profile" element={<AdminProfile />} />
            <Route path="enrollment" element={<AdminEnrollment />} />
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
            <Route path="enrollment" element={<TeacherEnrollment />} />
          </Route>

          {/* Student */}
          <Route path="/student" element={<ProtectedRoute role="student" />}>
            <Route path="dashboard" element={<StudentDashboard />} />
            <Route path="profile" element={<StudentProfile />} />
            <Route path="results" element={<TestResults />} />
            <Route path="tuition" element={<Tuition />} />
            <Route path="payments" element={<PaymentsPage />} />
          </Route>

          {/* Shared (all roles) */}
          <Route path="/messaging" element={<ProtectedRoute role="any" />}>
            <Route index element={<MessagingCenter />} />
          </Route>
          <Route path="/faculty" element={<ProtectedRoute role="any" />}>
            <Route index element={<FacultyDirectory />} />
            <Route path=":id" element={<FacultyProfile />} />
          </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}
