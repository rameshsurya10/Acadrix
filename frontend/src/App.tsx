import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from '@/contexts/AuthContext'
import ProtectedRoute from '@/components/shared/ProtectedRoute'

// Auth
import LoginPage from '@/pages/auth/LoginPage'

// Admin
import AdminDashboard from '@/pages/admin/DashboardPage'
import AdminAdmissions from '@/pages/admin/AdmissionsPage'
import AdminAssessments from '@/pages/admin/AssessmentsPage'
import AdminFinance from '@/pages/admin/FinancePage'
import AdminStudents from '@/pages/admin/StudentsPage'

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

// Parent
import ParentPayments from '@/pages/parent/PaymentsPage'

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
          <Route path="/" element={<Navigate to="/login" replace />} />

          {/* Admin */}
          <Route path="/admin" element={<ProtectedRoute role="admin" />}>
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="admissions" element={<AdminAdmissions />} />
            <Route path="assessments" element={<AdminAssessments />} />
            <Route path="finance" element={<AdminFinance />} />
            <Route path="students" element={<AdminStudents />} />
          </Route>

          {/* Principal */}
          <Route path="/principal" element={<ProtectedRoute role="principal" />}>
            <Route path="dashboard" element={<PrincipalDashboard />} />
            <Route path="question-generator" element={<QuestionGenerator />} />
          </Route>

          {/* Teacher */}
          <Route path="/teacher" element={<ProtectedRoute role="teacher" />}>
            <Route path="dashboard" element={<TeacherDashboard />} />
            <Route path="gradebook" element={<Gradebook />} />
            <Route path="tests" element={<TestCreation />} />
          </Route>

          {/* Student */}
          <Route path="/student" element={<ProtectedRoute role="student" />}>
            <Route path="dashboard" element={<StudentDashboard />} />
            <Route path="profile" element={<StudentProfile />} />
            <Route path="results" element={<TestResults />} />
            <Route path="tuition" element={<Tuition />} />
          </Route>

          {/* Parent */}
          <Route path="/parent" element={<ProtectedRoute role="parent" />}>
            <Route path="payments" element={<ParentPayments />} />
          </Route>

          {/* Shared (multi-role) */}
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
