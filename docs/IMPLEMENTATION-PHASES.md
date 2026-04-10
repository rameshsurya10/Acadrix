# Acadrix — Implementation Phases

> What's done, what's pending, what to build next.

---

## Current State — What's DONE

### Roles Implemented (6/6)

| # | Role | Backend | Frontend | Pages | Status |
|---|------|---------|----------|-------|--------|
| 1 | Super Admin | 17 endpoints | 7 pages | All API-connected | DONE |
| 2 | Admin | 25+ endpoints | 13 pages | All API-connected | DONE |
| 3 | Finance | 6 endpoints | 4 routes (reuses admin pages) | All API-connected | DONE |
| 4 | Principal | 12 endpoints | 3 pages | All API-connected | DONE |
| 5 | Teacher | 14 endpoints | 4 pages | All API-connected | DONE |
| 6 | Student | 12 endpoints | 5 pages | All API-connected | DONE |
| - | Shared | 16 endpoints | 3 pages | All API-connected | DONE |

**Total: 35 frontend pages, 100+ API endpoints, all connected.**

### Backend Apps Built (7/7 core)

| App | What it does | Status |
|-----|-------------|--------|
| `accounts` | Auth, JWT, OTP, Google OAuth, roles, permissions | DONE |
| `super_admin` | SchoolSettings, AuditLog, Announcement, user management | DONE |
| `admin_panel` | Admissions, enrollment, notifications, ID config, fee templates, discounts, payments | DONE |
| `principal` | AI question generation, events, dashboard | DONE |
| `teacher` | Assessments, assignments, gradebook, health observations | DONE |
| `student` | Profiles, guardians, attendance, health, tuition, payments, documents | DONE |
| `shared` | Academic structure, messaging, faculty directory | DONE |

### What's NOT Built Yet (8 new apps needed)

| App | Module | Status |
|-----|--------|--------|
| `apps/academics/` | Report cards + certificates (TC, bonafide) | NOT STARTED |
| `apps/leave/` | Leave management (apply, approve, balance) | NOT STARTED |
| `apps/hr/` | HR, payroll, salary, payslips | NOT STARTED |
| `apps/transport/` | Vehicle, routes, GPS, bus tracking | NOT STARTED |
| `apps/library/` | Book catalog, issue/return, fines | NOT STARTED |
| `apps/enquiry/` | Pre-admission enquiries, follow-ups | NOT STARTED |
| `apps/notifications/` | SMS, WhatsApp, push, email templates | NOT STARTED |
| `apps/udise/` | Government UDISE+ compliance reports | NOT STARTED |

---

## Phase 0 — FINISH WHAT'S INCOMPLETE (Current Sprint)

These are gaps in the EXISTING roles that need to be fixed before moving to new modules.

### 0.1 Finance Role — Needs its own pages (not just reusing admin pages)

| Task | Current State | What to Build |
|------|--------------|---------------|
| Finance Dashboard | Exists but basic | Add revenue chart, monthly trends, overdue alerts |
| Fee Defaulters Page | MISSING | List students with overdue payments, days overdue, send reminder button |
| Receipt PDF Generation | MISSING | Auto-generate receipt PDF when payment is recorded |

### 0.2 Admin — Missing features on existing pages

| Task | Current State | What to Build |
|------|--------------|---------------|
| Students Page — View Profile button | Button exists, no onClick | Navigate to student detail page |
| Students Page — Documents button | Button exists, no onClick | Navigate to student documents |
| Admissions — No reject button | Only verify + complete | Add reject action with reason |
| Admissions — No confirmation dialogs | Status changes happen immediately | Add "Are you sure?" dialog |
| Profile Page — Read only | Cannot edit name/phone | Link to ProfileEditPage |
| Finance Page — Admin sees "Record Payment" | Admin shouldn't manage payments (finance role only) | Remove Record Payment from admin finance page |

### 0.3 Teacher — Missing features

| Task | Current State | What to Build |
|------|--------------|---------------|
| Mark Attendance Page | MISSING | Bulk attendance marking for a section (checkboxes per student) |
| Assignment Student View | MISSING on student side | Student sees assignments for their section |

### 0.4 Student — Missing features

| Task | Current State | What to Build |
|------|--------------|---------------|
| Test Results Page | Shows "Coming Soon" | Connect to GradeEntry data (need student-facing grades endpoint) |
| Timetable View | MISSING | Student sees their section's weekly timetable |

### 0.5 Shared — Missing features

| Task | Current State | What to Build |
|------|--------------|---------------|
| Messaging — Real-time | HTTP polling only | Consider WebSocket or 30-second polling |

---

## Phase 1 — CRITICAL MODULES (Must build to sell to Indian schools)

### 1.1 Report Cards + Certificates

| Item | Details |
|------|---------|
| **New app** | `apps/academics/` |
| **Models** | ReportCardTemplate, ReportCardConfig, GeneratedReportCard, CertificateTemplate, IssuedCertificate |
| **PDF library** | WeasyPrint or ReportLab |
| **Admin pages** | Report Card Templates, Generate Report Cards, Certificate Templates, Issue Certificate, Certificate History |
| **Student pages** | View Report Cards (download PDF), View Certificates |
| **Parent pages** | Download child's report card |
| **Endpoints** | 9 new API endpoints |

### 1.2 Leave Management

| Item | Details |
|------|---------|
| **New app** | `apps/leave/` |
| **Models** | LeaveType, LeaveBalance, LeaveApplication, LeaveApproval |
| **Admin pages** | Leave Config, Leave Approvals, Leave Balances, Leave Reports |
| **Teacher/Staff pages** | Apply Leave, My Leaves |
| **Endpoints** | 11 new API endpoints |

### 1.3 Razorpay Payment Gateway

| Item | Details |
|------|---------|
| **Extend** | `apps/admin_panel/` or new `apps/payments/` |
| **Models** | PaymentGatewayConfig, OnlinePaymentOrder, PaymentReceipt, RefundRecord |
| **Library** | `razorpay` Python SDK |
| **Super Admin page** | Gateway Config (API keys, test/live toggle) |
| **Student/Parent pages** | Pay Fees (Razorpay checkout), Payment Success |
| **Finance page** | Refund Management |
| **Endpoints** | 6 new API endpoints |

### 1.4 HR/Payroll

| Item | Details |
|------|---------|
| **New app** | `apps/hr/` |
| **Models** | StaffProfile, SalaryStructure, PayrollRun, PayslipEntry, StaffDocument |
| **Finance pages** | Payroll Dashboard, Process Payroll, Salary Structures |
| **Admin pages** | Staff Directory, Staff Profile |
| **Teacher page** | My Payslips |
| **Endpoints** | 10 new API endpoints |

### 1.5 U-DISE Reports

| Item | Details |
|------|---------|
| **New app** | `apps/udise/` |
| **Models** | UDISEProfile, UDISEAnnualData, UDISEExportLog |
| **Library** | `openpyxl` for Excel export |
| **Admin pages** | UDISE Profile, Annual Data, Export |
| **Endpoints** | 6 new API endpoints |

### 1.6 Complete Partial Features

| Item | Details |
|------|---------|
| Attendance bulk marking | New teacher page + bulk mark endpoint |
| Fee installments | InstallmentSchedule model, auto late fee calculation |
| Fee receipts | PDF receipt generation on payment |
| Student-facing grades | New endpoint for student to read own GradeEntry data |
| Timetable page | Student/teacher weekly timetable grid view |

---

## Phase 2 — IMPORTANT MODULES (Competitive advantage)

### 2.1 Transport Management

| Item | Details |
|------|---------|
| **New app** | `apps/transport/` |
| **Models** | Vehicle, Route, RouteStop, StudentTransport |
| **Admin pages** | Vehicle Management, Route Management, Assign Students |
| **Parent/Student page** | My Bus (route, timing, driver contact) |

### 2.2 Library Management

| Item | Details |
|------|---------|
| **New app** | `apps/library/` |
| **Models** | Book, BookIssue |
| **Admin pages** | Book Catalog, Issue Book, Return Book |
| **Student page** | My Books (currently issued, due dates) |

### 2.3 WhatsApp + SMS Notifications

| Item | Details |
|------|---------|
| **New app** | `apps/notifications/` |
| **Models** | NotificationTemplate, NotificationLog, NotificationConfig |
| **Providers** | MSG91 (SMS), WATI/Interakt (WhatsApp) |
| **Auto-triggers** | Absent notification, fee due, grade published, event reminder |

### 2.4 Enquiry Management

| Item | Details |
|------|---------|
| **New app** | `apps/enquiry/` |
| **Models** | Enquiry, EnquiryFollowUp |
| **Admin pages** | Enquiry List, Follow-up Tracking, Conversion Funnel |

### 2.5 Student ID Card Generation

| Item | Details |
|------|---------|
| **Library** | WeasyPrint + python-barcode |
| **Admin page** | ID Card Template Config, Bulk Generate |

### 2.6 Parent Portal (dedicated role)

| Item | Details |
|------|---------|
| **New role** | Add `parent` to User.Role |
| **Pages** | Parent Dashboard, Child Profile, Pay Fees, Report Cards, Bus Tracking, Messages |

### 2.7 Discipline/Behavior Management

| Item | Details |
|------|---------|
| **Models** | DisciplineIncident (add to student app) |
| **Pages** | Report Incident (teacher), Incident History (admin), Student Discipline Tab |

---

## Phase 3 — NICE-TO-HAVE (Add when resources allow)

| Module | Details |
|--------|---------|
| Hostel Management | Room allocation, mess fees, warden alerts |
| Inventory Management | School assets, procurement, stock |
| Visitor Management | Visitor logs, pass generation |
| Biometric Integration | API endpoints for fingerprint/face devices |
| Mobile Apps | React Native for Android/iOS |

---

## Summary — Total New Work

| Phase | New Apps | New Models | New Endpoints | New Pages | Estimated Weeks |
|-------|----------|-----------|---------------|-----------|-----------------|
| **Phase 0** (Fix incomplete) | 0 | 1 | 5 | 6 | 1-2 weeks |
| **Phase 1** (Critical) | 4 new apps | 18 | 42 | 20 | 6-8 weeks |
| **Phase 2** (Important) | 4 new apps | 10 | 25 | 15 | 6-8 weeks |
| **Phase 3** (Nice-to-have) | 3 new apps | 8 | 15 | 8 | 4-6 weeks |
| **TOTAL** | 11 new apps | 37 models | 87 endpoints | 49 pages | 17-24 weeks |

---

## What to Build RIGHT NOW

**Start with Phase 0** — fix the existing incomplete features. This takes 1-2 weeks and makes the current system fully polished before adding new modules.

Then **Phase 1** in this order:
1. Report Cards (most requested by schools)
2. Leave Management (daily operational need)
3. Razorpay (monetizes the product)
4. HR/Payroll (monthly need)
5. U-DISE (annual compliance)
6. Complete partials (attendance, timetable, receipts)
