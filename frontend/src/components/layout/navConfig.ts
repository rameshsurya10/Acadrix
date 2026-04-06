import type { UserRole } from '@/contexts/AuthContext'

export interface NavItem {
  label: string
  icon: string
  to: string
}

export interface RoleNavConfig {
  topNav: NavItem[]
  bottomNav: NavItem[]
  sidebar: NavItem[]
}

const STUDENT_NAV: RoleNavConfig = {
  topNav: [
    { label: 'Dashboard', icon: 'grid_view',   to: '/student/dashboard' },
    { label: 'Results',   icon: 'assignment',   to: '/student/results' },
    { label: 'Tuition',   icon: 'payments',     to: '/student/tuition' },
    { label: 'Payments',  icon: 'credit_card',  to: '/student/payments' },
  ],
  bottomNav: [
    { label: 'Dashboard', icon: 'grid_view',   to: '/student/dashboard' },
    { label: 'Results',   icon: 'assignment',   to: '/student/results' },
    { label: 'Payments',  icon: 'credit_card',  to: '/student/payments' },
    { label: 'Profile',   icon: 'person',       to: '/student/profile' },
  ],
  sidebar: [
    { label: 'Dashboard', icon: 'grid_view',   to: '/student/dashboard' },
    { label: 'Results',   icon: 'assignment',   to: '/student/results' },
    { label: 'Tuition',   icon: 'payments',     to: '/student/tuition' },
    { label: 'Payments',  icon: 'credit_card',  to: '/student/payments' },
    { label: 'Messages',  icon: 'chat',         to: '/messaging' },
    { label: 'Profile',   icon: 'person',       to: '/student/profile' },
  ],
}

export const NAV_CONFIG: Record<UserRole, RoleNavConfig> = {
  student: STUDENT_NAV,

  teacher: {
    topNav: [
      { label: 'Dashboard', icon: 'grid_view',   to: '/teacher/dashboard' },
      { label: 'Gradebook', icon: 'grade',        to: '/teacher/gradebook' },
      { label: 'Tests',     icon: 'quiz',         to: '/teacher/tests' },
      { label: 'Faculty',   icon: 'badge',        to: '/faculty' },
    ],
    bottomNav: [
      { label: 'Dashboard', icon: 'grid_view',   to: '/teacher/dashboard' },
      { label: 'Grades',    icon: 'grade',        to: '/teacher/gradebook' },
      { label: 'Tests',     icon: 'quiz',         to: '/teacher/tests' },
      { label: 'Messages',  icon: 'chat',         to: '/messaging' },
    ],
    sidebar: [
      { label: 'Dashboard',      icon: 'grid_view',   to: '/teacher/dashboard' },
      { label: 'Assessment Lab', icon: 'quiz',         to: '/teacher/tests' },
      { label: 'Gradebook',      icon: 'grade',        to: '/teacher/gradebook' },
      { label: 'Enrollment',    icon: 'person_add',   to: '/teacher/enrollment' },
      { label: 'Faculty',        icon: 'badge',        to: '/faculty' },
      { label: 'Messages',       icon: 'chat',         to: '/messaging' },
    ],
  },

  admin: {
    topNav: [
      { label: 'Dashboard',   icon: 'grid_view',   to: '/admin/dashboard' },
      { label: 'Students',    icon: 'people',       to: '/admin/students' },
      { label: 'Finance',     icon: 'payments',     to: '/admin/finance' },
      { label: 'Messages',    icon: 'chat',         to: '/messaging' },
    ],
    bottomNav: [
      { label: 'Dashboard',   icon: 'grid_view',   to: '/admin/dashboard' },
      { label: 'Students',    icon: 'people',       to: '/admin/students' },
      { label: 'Finance',     icon: 'payments',     to: '/admin/finance' },
      { label: 'Messages',    icon: 'chat',         to: '/messaging' },
    ],
    sidebar: [
      { label: 'Dashboard',   icon: 'grid_view',   to: '/admin/dashboard' },
      { label: 'Students',    icon: 'people',       to: '/admin/students' },
      { label: 'Admissions',  icon: 'how_to_reg',   to: '/admin/admissions' },
      { label: 'Enrollment',  icon: 'person_add',   to: '/admin/enrollment' },
      { label: 'Assessments', icon: 'quiz',         to: '/admin/assessments' },
      { label: 'Finance',     icon: 'payments',     to: '/admin/finance' },
      { label: 'Faculty',     icon: 'badge',        to: '/faculty' },
      { label: 'Messages',    icon: 'chat',         to: '/messaging' },
    ],
  },

  principal: {
    topNav: [
      { label: 'Dashboard',    icon: 'grid_view',     to: '/principal/dashboard' },
      { label: 'AI Generator', icon: 'auto_awesome',  to: '/principal/question-generator' },
      { label: 'Faculty',      icon: 'people',        to: '/faculty' },
      { label: 'Messages',     icon: 'chat',          to: '/messaging' },
    ],
    bottomNav: [
      { label: 'Dashboard', icon: 'grid_view',        to: '/principal/dashboard' },
      { label: 'AI Gen',    icon: 'auto_awesome',     to: '/principal/question-generator' },
      { label: 'Faculty',   icon: 'people',           to: '/faculty' },
      { label: 'Messages',  icon: 'chat',             to: '/messaging' },
    ],
    sidebar: [
      { label: 'Dashboard',    icon: 'grid_view',     to: '/principal/dashboard' },
      { label: 'AI Generator', icon: 'auto_awesome',  to: '/principal/question-generator' },
      { label: 'Enrollment',  icon: 'person_add',    to: '/principal/enrollment' },
      { label: 'Faculty',      icon: 'badge',         to: '/faculty' },
      { label: 'Messages',     icon: 'chat',          to: '/messaging' },
    ],
  },
}
