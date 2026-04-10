import type { UserRole } from '@/contexts/AuthContext'

export interface NavItem {
  label: string
  icon: string
  to: string
}

export interface NavSection {
  title: string
  icon: string
  items: NavItem[]
  defaultOpen?: boolean
}

export interface RoleNavConfig {
  topNav: NavItem[]
  bottomNav: NavItem[]
  sidebar: NavSection[]
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
    {
      title: 'Overview', icon: 'space_dashboard', defaultOpen: true,
      items: [
        { label: 'Dashboard',    icon: 'grid_view',      to: '/student/dashboard' },
        { label: 'Timetable',    icon: 'calendar_month', to: '/timetable' },
        { label: 'Profile',      icon: 'person',         to: '/student/profile' },
      ],
    },
    {
      title: 'Academics', icon: 'school', defaultOpen: true,
      items: [
        { label: 'Results',      icon: 'assignment',   to: '/student/results' },
        { label: 'Report Cards', icon: 'description',  to: '/student/report-cards' },
      ],
    },
    {
      title: 'Finance', icon: 'payments', defaultOpen: true,
      items: [
        { label: 'Tuition',  icon: 'payments',         to: '/student/tuition' },
        { label: 'Payments', icon: 'credit_card',       to: '/student/payments' },
        { label: 'Pay Fees', icon: 'account_balance',   to: '/student/pay' },
      ],
    },
    {
      title: 'Communication', icon: 'chat',
      items: [
        { label: 'Messages', icon: 'chat', to: '/messaging' },
      ],
    },
  ],
}

export const NAV_CONFIG: Record<UserRole, RoleNavConfig> = {
  super_admin: {
    topNav: [
      { label: 'Dashboard',  icon: 'grid_view',  to: '/super-admin/dashboard' },
      { label: 'Users',      icon: 'group',       to: '/super-admin/users' },
      { label: 'Finance',    icon: 'payments',    to: '/finance/dashboard' },
      { label: 'Settings',   icon: 'settings',    to: '/super-admin/settings' },
    ],
    bottomNav: [
      { label: 'Dashboard',  icon: 'grid_view',  to: '/super-admin/dashboard' },
      { label: 'Users',      icon: 'group',       to: '/super-admin/users' },
      { label: 'Academics',  icon: 'school',      to: '/admin/classes' },
      { label: 'Settings',   icon: 'settings',    to: '/super-admin/settings' },
    ],
    sidebar: [
      {
        title: 'Super Admin', icon: 'shield_person', defaultOpen: true,
        items: [
          { label: 'Dashboard',       icon: 'grid_view',              to: '/super-admin/dashboard' },
          { label: 'Admins',          icon: 'admin_panel_settings',   to: '/super-admin/admins' },
          { label: 'Principals',      icon: 'supervised_user_circle', to: '/super-admin/principals' },
          { label: 'All Users',       icon: 'group',                  to: '/super-admin/users' },
          { label: 'Announcements',   icon: 'campaign',               to: '/super-admin/announcements' },
          { label: 'Audit Logs',      icon: 'history',                to: '/super-admin/audit-logs' },
          { label: 'Settings',        icon: 'settings',               to: '/super-admin/settings' },
          { label: 'Payment Gateway', icon: 'credit_card',            to: '/super-admin/payment-gateway' },
        ],
      },
      {
        title: 'School Management', icon: 'domain',
        items: [
          { label: 'Students',       icon: 'people',         to: '/admin/students' },
          { label: 'Admissions',     icon: 'how_to_reg',     to: '/admin/admissions' },
          { label: 'Enrollment',     icon: 'person_add',     to: '/admin/enrollment' },
        ],
      },
      {
        title: 'Academics', icon: 'school',
        items: [
          { label: 'Academic Years', icon: 'calendar_month',   to: '/admin/academic-years' },
          { label: 'Classes',        icon: 'school',           to: '/admin/classes' },
          { label: 'Subjects',       icon: 'menu_book',        to: '/admin/subjects' },
          { label: 'Courses',        icon: 'assignment',       to: '/admin/courses' },
          { label: 'Assessments',    icon: 'quiz',             to: '/admin/assessments' },
          { label: 'Report Cards',   icon: 'description',      to: '/admin/report-card-templates' },
          { label: 'Certificates',   icon: 'workspace_premium', to: '/admin/certificate-templates' },
        ],
      },
      {
        title: 'Finance', icon: 'payments',
        items: [
          { label: 'Fee Templates', icon: 'receipt_long', to: '/finance/fee-templates' },
          { label: 'Payments',      icon: 'add_card',     to: '/finance/payments' },
          { label: 'Discounts',     icon: 'loyalty',      to: '/finance/discounts' },
          { label: 'Defaulters',    icon: 'warning',      to: '/finance/defaulters' },
          { label: 'Payroll',       icon: 'account_balance', to: '/finance/payroll' },
        ],
      },
      {
        title: 'HR & Leave', icon: 'groups',
        items: [
          { label: 'Leave Approvals', icon: 'approval', to: '/admin/leave-approvals' },
        ],
      },
      {
        title: 'Community', icon: 'forum',
        items: [
          { label: 'Faculty',  icon: 'badge', to: '/faculty' },
          { label: 'Messages', icon: 'chat',  to: '/messaging' },
        ],
      },
    ],
  },

  student: STUDENT_NAV,

  teacher: {
    topNav: [
      { label: 'Dashboard', icon: 'grid_view', to: '/teacher/dashboard' },
      { label: 'Gradebook', icon: 'grade',      to: '/teacher/gradebook' },
      { label: 'Tests',     icon: 'quiz',       to: '/teacher/tests' },
      { label: 'Faculty',   icon: 'badge',      to: '/faculty' },
    ],
    bottomNav: [
      { label: 'Dashboard', icon: 'grid_view', to: '/teacher/dashboard' },
      { label: 'Grades',    icon: 'grade',      to: '/teacher/gradebook' },
      { label: 'Tests',     icon: 'quiz',       to: '/teacher/tests' },
      { label: 'Messages',  icon: 'chat',       to: '/messaging' },
    ],
    sidebar: [
      {
        title: 'Teaching', icon: 'school', defaultOpen: true,
        items: [
          { label: 'Dashboard',      icon: 'grid_view',     to: '/teacher/dashboard' },
          { label: 'Assessment Lab', icon: 'quiz',           to: '/teacher/tests' },
          { label: 'Gradebook',      icon: 'grade',          to: '/teacher/gradebook' },
          { label: 'Attendance',     icon: 'fact_check',     to: '/teacher/attendance' },
          { label: 'Timetable',      icon: 'calendar_month', to: '/timetable' },
          { label: 'Enrollment',     icon: 'person_add',     to: '/teacher/enrollment' },
        ],
      },
      {
        title: 'My Account', icon: 'person',
        items: [
          { label: 'Apply Leave', icon: 'event_busy',  to: '/leave/apply' },
          { label: 'My Leaves',   icon: 'date_range',  to: '/leave/my-leaves' },
          { label: 'Payslips',    icon: 'receipt_long', to: '/teacher/payslips' },
        ],
      },
      {
        title: 'Community', icon: 'forum',
        items: [
          { label: 'Faculty',  icon: 'badge', to: '/faculty' },
          { label: 'Messages', icon: 'chat',  to: '/messaging' },
        ],
      },
    ],
  },

  admin: {
    topNav: [
      { label: 'Dashboard', icon: 'grid_view', to: '/admin/dashboard' },
      { label: 'Students',  icon: 'people',     to: '/admin/students' },
      { label: 'Academics', icon: 'school',     to: '/admin/classes' },
      { label: 'Messages',  icon: 'chat',       to: '/messaging' },
    ],
    bottomNav: [
      { label: 'Dashboard', icon: 'grid_view', to: '/admin/dashboard' },
      { label: 'Students',  icon: 'people',     to: '/admin/students' },
      { label: 'Academics', icon: 'school',     to: '/admin/classes' },
      { label: 'Messages',  icon: 'chat',       to: '/messaging' },
    ],
    sidebar: [
      {
        title: 'Administration', icon: 'dashboard', defaultOpen: true,
        items: [
          { label: 'Dashboard',  icon: 'grid_view', to: '/admin/dashboard' },
          { label: 'Students',   icon: 'people',     to: '/admin/students' },
          { label: 'Admissions', icon: 'how_to_reg', to: '/admin/admissions' },
          { label: 'Enrollment', icon: 'person_add', to: '/admin/enrollment' },
        ],
      },
      {
        title: 'Academics', icon: 'school',
        items: [
          { label: 'Academic Years', icon: 'calendar_month',   to: '/admin/academic-years' },
          { label: 'Classes',        icon: 'school',           to: '/admin/classes' },
          { label: 'Subjects',       icon: 'menu_book',        to: '/admin/subjects' },
          { label: 'Courses',        icon: 'assignment',       to: '/admin/courses' },
          { label: 'Assessments',    icon: 'quiz',             to: '/admin/assessments' },
          { label: 'Report Cards',   icon: 'description',      to: '/admin/report-card-templates' },
          { label: 'Certificates',   icon: 'workspace_premium', to: '/admin/certificate-templates' },
        ],
      },
      {
        title: 'Compliance', icon: 'assured_workload',
        items: [
          { label: 'U-DISE Profile', icon: 'assured_workload', to: '/admin/udise-profile' },
          { label: 'U-DISE Data',    icon: 'analytics',        to: '/admin/udise-data' },
        ],
      },
      {
        title: 'Finance & HR', icon: 'payments',
        items: [
          { label: 'Finance Overview', icon: 'payments', to: '/admin/finance' },
          { label: 'Leave Approvals',  icon: 'approval', to: '/admin/leave-approvals' },
          { label: 'Leave Config',     icon: 'tune',     to: '/admin/leave-config' },
        ],
      },
      {
        title: 'Community', icon: 'forum',
        items: [
          { label: 'Faculty',  icon: 'badge', to: '/faculty' },
          { label: 'Messages', icon: 'chat',  to: '/messaging' },
        ],
      },
    ],
  },

  finance: {
    topNav: [
      { label: 'Dashboard',     icon: 'grid_view',   to: '/finance/dashboard' },
      { label: 'Fee Templates', icon: 'receipt_long', to: '/finance/fee-templates' },
      { label: 'Payments',      icon: 'payments',     to: '/finance/payments' },
      { label: 'Discounts',     icon: 'loyalty',      to: '/finance/discounts' },
    ],
    bottomNav: [
      { label: 'Dashboard', icon: 'grid_view',   to: '/finance/dashboard' },
      { label: 'Templates', icon: 'receipt_long', to: '/finance/fee-templates' },
      { label: 'Payments',  icon: 'payments',     to: '/finance/payments' },
      { label: 'Discounts', icon: 'loyalty',      to: '/finance/discounts' },
    ],
    sidebar: [
      {
        title: 'Billing', icon: 'receipt_long', defaultOpen: true,
        items: [
          { label: 'Dashboard',      icon: 'grid_view',    to: '/finance/dashboard' },
          { label: 'Fee Templates',  icon: 'receipt_long',  to: '/finance/fee-templates' },
          { label: 'Record Payment', icon: 'add_card',      to: '/finance/payments' },
          { label: 'Discounts',      icon: 'loyalty',       to: '/finance/discounts' },
          { label: 'Defaulters',     icon: 'warning',       to: '/finance/defaulters' },
        ],
      },
      {
        title: 'Payroll', icon: 'account_balance',
        items: [
          { label: 'Payroll',  icon: 'account_balance', to: '/finance/payroll' },
          { label: 'Salaries', icon: 'price_check',     to: '/finance/salary-structures' },
        ],
      },
      {
        title: 'Other', icon: 'more_horiz',
        items: [
          { label: 'Students', icon: 'people', to: '/admin/students' },
          { label: 'Messages', icon: 'chat',   to: '/messaging' },
        ],
      },
    ],
  },

  principal: {
    topNav: [
      { label: 'Dashboard',    icon: 'grid_view',    to: '/principal/dashboard' },
      { label: 'AI Generator', icon: 'auto_awesome', to: '/principal/question-generator' },
      { label: 'Faculty',      icon: 'people',       to: '/faculty' },
      { label: 'Messages',     icon: 'chat',         to: '/messaging' },
    ],
    bottomNav: [
      { label: 'Dashboard', icon: 'grid_view',    to: '/principal/dashboard' },
      { label: 'AI Gen',    icon: 'auto_awesome', to: '/principal/question-generator' },
      { label: 'Faculty',   icon: 'people',       to: '/faculty' },
      { label: 'Messages',  icon: 'chat',         to: '/messaging' },
    ],
    sidebar: [
      {
        title: 'Principal', icon: 'school', defaultOpen: true,
        items: [
          { label: 'Dashboard',        icon: 'grid_view',    to: '/principal/dashboard' },
          { label: 'AI Generator',     icon: 'auto_awesome', to: '/principal/question-generator' },
          { label: 'Enrollment',       icon: 'person_add',   to: '/principal/enrollment' },
          { label: 'Finance Overview', icon: 'payments',     to: '/admin/finance' },
        ],
      },
      {
        title: 'Community', icon: 'forum',
        items: [
          { label: 'Faculty',  icon: 'badge', to: '/faculty' },
          { label: 'Messages', icon: 'chat',  to: '/messaging' },
        ],
      },
    ],
  },
}
