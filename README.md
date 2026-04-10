# Acadrix (Scholar Metric)

A comprehensive, multi-role school management platform for K-12 institutions in India. Covers the full student lifecycle from admissions through graduation with role-based dashboards, fee management, report cards, HR/payroll, and AI-powered question generation.

| Layer | Technology |
|-------|-----------|
| Frontend | React 18 + Vite 5 + TypeScript + Tailwind CSS 3 |
| Backend | Django 5 + Django REST Framework |
| Auth | JWT (simplejwt) + Email OTP + Google OAuth2 |
| Database | PostgreSQL |
| API Docs | Swagger UI (drf-spectacular) |
| Dev Ports | Frontend `:5173` / Backend `:8000` |

---

## Quick Start

### Prerequisites

- Python 3.11+
- Node.js 18+
- PostgreSQL 14+

### Backend

```bash
cd backend
python -m venv venv && source venv/bin/activate
pip install -r requirements.txt
cp .env.example .env   # fill in DB credentials, secrets
python manage.py migrate
python manage.py runserver
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

The frontend proxies `/api` requests to `localhost:8000` via Vite config.

### Environment Variables

Copy `backend/.env.example` and configure:

| Variable | Purpose |
|----------|---------|
| `SECRET_KEY` | Django secret key |
| `DB_NAME`, `DB_USER`, `DB_PASSWORD`, `DB_HOST`, `DB_PORT` | PostgreSQL connection |
| `CORS_ALLOWED_ORIGINS` | Frontend URL (default `http://localhost:5173`) |
| `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` | Google OAuth2 credentials |
| `JWT_ACCESS_TOKEN_LIFETIME_MINUTES` | Access token TTL (default 60) |
| `JWT_REFRESH_TOKEN_LIFETIME_DAYS` | Refresh token TTL (default 7) |

---

## User Roles (6)

| Role | Access Level |
|------|-------------|
| **Super Admin** | Creates admins & principals, school settings, audit logs, announcements |
| **Admin** | Enrollment, admissions, fee templates, report cards, certificates, ID config |
| **Finance** | Revenue, payments, discounts, defaulters, payroll, salary structures |
| **Principal** | School KPIs, AI question generation, events, enrollment |
| **Teacher** | Gradebook, assessments, attendance, assignments, health observations |
| **Student** | Dashboard, grades, tuition, payments, profile, report cards, leave |

---

## Project Structure

```
Acadrix/
├── frontend/
│   └── src/
│       ├── pages/              # 35+ role-based page components
│       │   ├── admin/          # 13 pages (dashboard, admissions, finance, enrollment...)
│       │   ├── super-admin/    # 7 pages (users, settings, audit logs...)
│       │   ├── finance/        # 4 pages (dashboard, payments, payroll...)
│       │   ├── principal/      # 3 pages (dashboard, question generator, enrollment)
│       │   ├── teacher/        # 6 pages (dashboard, gradebook, tests, attendance...)
│       │   ├── student/        # 8 pages (dashboard, profile, results, tuition...)
│       │   ├── leave/          # 2 pages (apply, my leaves)
│       │   └── shared/         # 3 pages (messaging, faculty directory, timetable)
│       ├── components/         # Layout (sidebar, header, nav), shared, enrollment forms
│       ├── services/           # API service layer organized by domain
│       ├── contexts/           # AuthContext (JWT state, login/logout)
│       ├── types/              # TypeScript interfaces for all entities
│       └── lib/                # Axios instance with JWT interceptor
│
├── backend/
│   ├── config/                 # settings.py, urls.py, wsgi.py
│   └── apps/
│       ├── accounts/           # User model, JWT auth, OTP, Google OAuth, permissions
│       ├── super_admin/        # SchoolSettings, AuditLog, Announcement
│       ├── admin_panel/        # Admissions, enrollment, fees, discounts, ID config
│       ├── principal/          # AI question generation, events
│       ├── teacher/            # Assessments, assignments, gradebook, attendance
│       ├── student/            # Profiles, tuition, payments, documents, activities
│       ├── shared/             # Academic structure, messaging, faculty directory
│       ├── academics/          # Report cards, certificates
│       ├── leave/              # Leave types, balances, applications, approvals
│       ├── hr/                 # Staff profiles, salary structures, payroll
│       └── udise/              # Government UDISE compliance
│
└── docs/                       # Roadmap and implementation phases
```

---

## Backend Architecture

### Django Apps (11)

Each app follows the pattern: **models -> serializers -> views -> urls**.

| App | Models | Key Responsibility |
|-----|--------|--------------------|
| `accounts` | User, OTP, UserTourProgress | Authentication (email/password, OTP, Google OAuth), JWT, permissions |
| `super_admin` | SchoolSettings, AuditLog, Announcement | System-level config and audit trail |
| `admin_panel` | AdmissionApplication, FeeTemplate, StudentDiscount, IDConfiguration | Admissions pipeline, enrollment workflows, fee management |
| `principal` | PrincipalProfile, SourceDocument, GeneratedQuestion, InstitutionEvent | AI question generation from uploaded PDFs, events |
| `teacher` | TeacherProfile, Assessment, Assignment, GradeEntry, HealthObservation | Teaching, grading, attendance |
| `student` | StudentProfile, Guardian, Document, Attendance, TuitionAccount, Payment | Student lifecycle, billing, records |
| `shared` | Department, Subject, Grade, Section, Course, ScheduleSlot, Conversation, Message | Academic structure, messaging |
| `academics` | ReportCardTemplate, GeneratedReportCard, CertificateTemplate, IssuedCertificate | Report cards (CBSE/ICSE/State), certificates (TC, bonafide) |
| `leave` | LeaveType, LeaveBalance, LeaveApplication, LeaveApproval | Leave management with approval workflow |
| `hr` | StaffProfile, SalaryStructure, PayrollRun, PayslipEntry | HR records, payroll processing |
| `udise` | UDISE data models | Government compliance reporting |

### Authentication Flow

```
1. POST /auth/identify/        -> Returns login method (password or OTP)
2. POST /auth/login/           -> Email/ID + password -> JWT tokens
   POST /auth/verify-otp/      -> Email + OTP code -> JWT tokens
   POST /auth/google/callback/ -> Google OAuth code -> JWT tokens
3. JWT access token (60 min) + refresh token (7 days, auto-rotate)
4. POST /auth/token/refresh/   -> New access token
5. POST /auth/logout/          -> Blacklist refresh token
```

### Custom Permissions

```python
IsSuperAdmin, IsAdmin, IsFinance, IsPrincipal, IsTeacher, IsStudent
IsAdminOrPrincipal, IsFinanceOrAdmin, IsStaff
```

### Rate Limiting

| Scope | Limit |
|-------|-------|
| `login` | 5/minute |
| `identify` | 10/minute |
| `otp` | 5/minute |
| `forgot_password` | 3/minute |
| Anonymous | 20/minute |
| Authenticated | 60/minute |

---

## API Endpoints (100+)

All endpoints are prefixed with `/api/v1/`.

### Auth (`/auth/`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/auth/identify/` | Detect login method for an identifier |
| POST | `/auth/login/` | Email/ID + password login |
| POST | `/auth/verify-otp/` | Verify email OTP |
| POST | `/auth/set-password/` | Set initial password (first login) |
| POST | `/auth/forgot-password/` | Request password reset OTP |
| POST | `/auth/reset-password/` | Reset password with OTP |
| GET | `/auth/me/` | Current user profile |
| PATCH | `/auth/me/` | Update profile |
| POST | `/auth/change-password/` | Change password |
| POST | `/auth/logout/` | Logout (blacklist refresh) |
| POST | `/auth/token/refresh/` | Refresh access token |
| GET | `/auth/google/url/` | Google OAuth redirect URL |
| POST | `/auth/google/callback/` | Google OAuth callback |
| GET/POST | `/auth/tour-progress/` | Guided tour completion state |

### Super Admin (`/super-admin/`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| CRUD | `/super-admin/users/` | Global user management |
| GET/POST | `/super-admin/audit-logs/` | System audit trail |
| GET/POST | `/super-admin/announcements/` | Broadcast announcements |
| GET | `/super-admin/dashboard/` | System-wide KPIs |
| POST | `/super-admin/enroll/{role}/` | Enroll admin, finance, or principal |
| GET/PUT | `/super-admin/settings/` | School settings (singleton) |

### Admin (`/admin/`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| CRUD | `/admin/applications/` | Admission applications |
| CRUD | `/admin/applications/{id}/documents/` | Application documents |
| POST | `/admin/enroll/{role}/` | Enroll teacher, student, principal |
| CRUD | `/admin/fee-templates/` | Fee structures per grade |
| CRUD | `/admin/discounts/` | Student scholarships & discounts |
| POST | `/admin/apply-fee-template/` | Apply fees to student |
| POST | `/admin/record-payment/` | Record a payment |
| GET | `/admin/fee-defaulters/` | Overdue accounts |
| GET | `/admin/payments/{id}/receipt/` | Payment receipt |
| GET | `/admin/finance-overview/` | Revenue summary |
| GET | `/admin/dashboard-stats/` | Dashboard KPIs |

### Principal (`/principal/`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| CRUD | `/principal/documents/` | Upload source PDFs for AI |
| CRUD | `/principal/questions/` | AI-generated questions |
| CRUD | `/principal/events/` | Institution events |
| GET | `/principal/dashboard/` | School KPIs |

### Teacher (`/teacher/`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET/PATCH | `/teacher/profile/` | Teacher profile |
| CRUD | `/teacher/assignments/` | Assignments |
| CRUD | `/teacher/assessments/` | Tests & exams |
| CRUD | `/teacher/grades/` | Grade entries per student |
| CRUD | `/teacher/health-observations/` | Student health notes |
| POST | `/teacher/attendance/bulk-mark/` | Bulk attendance marking |
| GET | `/teacher/dashboard/` | Schedule, assignments, performance |

### Student (`/student/`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET/PATCH | `/student/profiles/` | Student profile |
| CRUD | `/student/documents/` | Student documents |
| GET | `/student/attendance/` | Attendance records |
| GET | `/student/grades/` | Test results |
| CRUD | `/student/activities/` | Extracurricular activities |
| GET | `/student/payments/` | Payment history |
| CRUD | `/student/payment-methods/` | Saved payment methods |
| GET | `/student/tuition/` | Tuition balance & line items |
| GET | `/student/dashboard/` | GPA, attendance, schedule |

### Shared (`/shared/`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| CRUD | `/shared/academic-years/` | Academic year calendar |
| CRUD | `/shared/departments/` | Departments |
| CRUD | `/shared/subjects/` | Subjects |
| GET | `/shared/grades/` | Grade levels |
| CRUD | `/shared/sections/` | Sections (A, B, C) |
| CRUD | `/shared/courses/` | Subject + Section + Teacher |
| CRUD | `/shared/schedule-slots/` | Timetable slots |
| CRUD | `/shared/conversations/` | Messaging conversations |
| CRUD | `/shared/messages/` | Messages within conversations |
| GET | `/shared/faculty/` | Staff directory |
| GET | `/shared/users/search/` | User search |

### Academics (`/academics/`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| CRUD | `/academics/templates/` | Report card templates |
| CRUD | `/academics/report-cards/` | Generated report cards |
| CRUD | `/academics/certificate-templates/` | Certificate templates |
| CRUD | `/academics/certificates/` | Issued certificates |

### Leave (`/leave/`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET/POST | `/leave/types/` | Leave types (CL, SL, EL) |
| GET | `/leave/balance/` | Leave balance per type |
| CRUD | `/leave/applications/` | Leave applications |
| CRUD | `/leave/approvals/` | Leave approval actions |

### HR (`/hr/`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| CRUD | `/hr/staff-profiles/` | Staff HR records |
| CRUD | `/hr/salary-structures/` | Salary config |
| GET/POST | `/hr/payroll/` | Monthly payroll runs |
| GET | `/hr/payslips/` | Payslip entries |
| CRUD | `/hr/staff-documents/` | Staff documents (Aadhar, PAN, etc.) |

---

## Frontend Architecture

### Routing

React Router v6 with role-based `<ProtectedRoute>` wrappers. Each role has a dedicated route group:

```
/login                    -> Login page (multi-method)
/super-admin/*            -> Super admin pages (role: super_admin)
/admin/*                  -> Admin pages (role: admin)
/finance/*                -> Finance pages (role: finance)
/principal/*              -> Principal pages (role: principal)
/teacher/*                -> Teacher pages (role: teacher)
/student/*                -> Student pages (role: student)
/leave/*                  -> Leave pages (any authenticated)
/messaging, /faculty/*    -> Shared pages (any authenticated)
```

Authenticated users are redirected to their role's dashboard. Unauthenticated users are redirected to `/login`.

### Auth Context

`AuthContext` manages JWT state globally:

- Stores tokens in `localStorage` (`acadrix_token`, `acadrix_refresh`)
- Provides `login()`, `logout()`, `googleLogin()` methods
- `useAuth()` hook for accessing user state from any component

### API Service Layer

Services are organized by domain under `src/services/`:

```
services/
├── shared/         authService, facultyService
├── admin/          admissionService, enrollmentService, financeService
├── student/        profileService, tuitionService, gradesService
├── teacher/        assessmentService, gradebookService, attendanceService
├── academics/      reportCardsService, certificatesService
├── leave/          leaveService, approvalsService
└── hr/             salaryService, payrollService
```

All services use a shared Axios instance (`lib/api.ts`) that automatically attaches JWT tokens and handles 401 redirects.

### Design System

Design philosophy: **"The Digital Curator"** - editorial-grade UI with:

- **No-border tonal layering** using MD3 surface colors instead of borders
- **Glassmorphism accents** on modals and overlays
- **Colors:** Primary `#2b5ab5`, neutral surface tones
- **Typography:** Manrope (headlines), Inter (body)
- **Icons:** Material Symbols Outlined (variable font)
- **Shadows:** Ambient-only (`shadow-[0_32px_64px_-12px_rgba(0,0,0,0.04)]`)
- **Mobile:** Fixed bottom nav bar; Desktop: sticky sidebar

---

## Key Features

### Admissions Pipeline
Applications flow through: `pending -> verified -> approved -> finalized` with document verification at each stage.

### Fee Management
Fee templates are defined per grade per academic year. When a student enrolls, fees are auto-applied to their tuition account. Supports scholarships, sibling discounts, merit awards, and financial aid.

### Report Cards
Configurable templates per grade and board (CBSE, ICSE, State, Custom). Term-based with grade thresholds. Data is snapshot-frozen at generation time for audit integrity. Status: `draft -> final -> distributed`.

### Certificates
Template-based certificates (Transfer, Bonafide, Character, Migration) with `{{placeholder}}` rendering, serial number tracking, and issuer attribution.

### AI Question Generation
Principals upload source PDFs. The system generates 2-mark and 5-mark questions with key answers, topics, difficulty levels, and rubrics. Questions can be linked to teacher assessments.

### Leave Management
Configurable leave types with annual quotas and carry-forward rules. Approval workflow with balance tracking: `remaining = allocated + carried_forward - used`.

### Payroll
Salary structures with Indian payroll components (Basic, HRA, DA, PF, ESI, TDS). Monthly payroll runs generate individual payslips with attendance-based calculations.

### Messaging
Role-tagged conversations with categories (internal, parents, system). Supports attachments and read tracking.

---

## Database

PostgreSQL with 40+ tables across 11 Django apps. Key relationships:

```
AcademicYear -> Grade -> Section -> Course -> ScheduleSlot
                                  -> StudentProfile -> TuitionAccount -> Payment
                                                    -> Attendance
                                                    -> Guardian
                                                    -> Document
Course -> Assessment -> GradeEntry
       -> Assignment
User -> Role-specific Profile (Student/Teacher/Principal/Staff)
```

All models include `created_at` / `updated_at` timestamps. Important records use soft delete.

---

## Security

- JWT with refresh token rotation and blacklisting
- Rate limiting on auth endpoints (5 login attempts/min, 3 password resets/min)
- Custom role-based permissions on every endpoint
- OTP with attempt limiting (5 max) and 30-minute expiration
- CORS restricted to configured origins
- Production hardening: HSTS, secure cookies, X-Frame-Options DENY, content type nosniff
- Audit logging for critical operations (user creation, deactivation, password resets)

---

## API Documentation

In development mode, Swagger UI is available at `/api/docs/` with the OpenAPI schema at `/api/schema/`.

---

## License

Private - All rights reserved.
