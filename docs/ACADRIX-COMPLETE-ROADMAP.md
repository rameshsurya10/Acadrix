# Acadrix — Complete System Roadmap & Gap Analysis

> **Last updated:** 2026-04-07
> **Compared against:** Vedmarg, Edunext, SchoolERP.co.in, Entrar, Schoollog
> **Target market:** Indian K-12 schools (CBSE, ICSE, State Board)

---

## 1. Current System Inventory

### 1.1 Roles (6 total)

| # | Role | Login Method | Creates | Home Page |
|---|------|-------------|---------|-----------|
| 1 | **Super Admin** | Email + Password | Admin, Finance, Principal | `/super-admin/dashboard` |
| 2 | **Admin** | Email + Password | Principal, Teacher, Student | `/admin/dashboard` |
| 3 | **Finance** | Email + Password | Nobody (manages billing) | `/finance/dashboard` |
| 4 | **Principal** | Email/ID + Password | Teacher, Student | `/principal/dashboard` |
| 5 | **Teacher** | Email OTP / ID + Password / Google | Student (own sections) | `/teacher/dashboard` |
| 6 | **Student** | Email OTP / ID + Password / Google | Nobody | `/student/dashboard` |

### 1.2 Role Hierarchy

```
Super Admin (Owner / Trust Chairman)
  |-- Admin (Correspondent / Secretary)
  |-- Finance (Accountant / Bursar)
  |-- Principal (Headmaster / Academic Director)
  |     |-- Teacher (Faculty)
  |     |     |-- Student (Learner)
```

### 1.3 Backend Apps

| App | Models | Status |
|-----|--------|--------|
| `accounts` | User, OTP, UserTourProgress | Built |
| `super_admin` | SchoolSettings, AuditLog, Announcement | Built |
| `admin_panel` | AdmissionApplication, AdmissionDocument, AdminNotification, IDConfiguration, FeeTemplate, FeeTemplateItem, StudentDiscount | Built |
| `principal` | PrincipalProfile, SourceDocument, GeneratedQuestion, AssessmentQuestion, InstitutionEvent | Built |
| `teacher` | TeacherProfile, Assignment, Assessment, GradeEntry, HealthObservation | Built |
| `student` | StudentProfile, Guardian, HealthRecord, ExtracurricularActivity, Document, Attendance, TuitionAccount, TuitionLineItem, Payment, PaymentMethod | Built |
| `shared` | Department, AcademicYear, Grade, Section, Subject, Course, ScheduleSlot, Conversation, Message | Built |

### 1.4 Frontend Pages (39 total)

| Role | Pages | Status |
|------|-------|--------|
| Super Admin | 7 pages | All API-connected |
| Admin | 12 pages | All API-connected |
| Finance | 4 pages | All API-connected |
| Principal | 3 pages | All API-connected |
| Teacher | 4 pages | All API-connected |
| Student | 5 pages | All API-connected |
| Shared | 3 pages | All API-connected |
| Auth | 2 pages | All API-connected |
| Public | 3 pages | Static content |

---

## 2. Feature Comparison — Acadrix vs Indian School ERPs

### 2.1 Module Status

| # | Module | Status | What Exists | What's Missing |
|---|--------|--------|-------------|----------------|
| 1 | Student Management | PARTIAL | StudentProfile, Guardian, Admission, Enrollment, IDConfiguration | Sibling auto-linking, student dossier view, ID card PDF generation |
| 2 | Fee Management | PARTIAL | FeeTemplate, FeeTemplateItem, StudentDiscount, TuitionAccount, Payment | Installment scheduling, late fee auto-calc, defaulter reports, receipt PDFs, fee reminders |
| 3 | Attendance Management | PARTIAL | Attendance model, AttendanceViewSet | Bulk marking UI, parent absent notifications, class-wise/monthly reports, teacher marks attendance page |
| 4 | Transport Management | MISSING | Nothing | GPS tracking, routes, drivers, transport fees, parent bus tracking |
| 5 | Library Management | MISSING | Nothing | Book catalog, ISBN, issue/return, fines, DDC classification |
| 6 | Timetable Management | PARTIAL | ScheduleSlot, Course models, CRUD API | Auto-generation algorithm, conflict detection, substitution, dedicated timetable page |
| 7 | Examination Management | PARTIAL | Assessment, GradeEntry, TestCreation page, Gradebook page | Hall tickets, seating arrangement, mark sheet PDFs, report cards (CBSE/ICSE format) |
| 8 | HR/Payroll Management | MISSING | TeacherProfile.salary field only | Salary structures, payroll processing, payslips, PF/ESI, tax deductions, staff attendance |
| 9 | Communication | PARTIAL | Conversation, Message models, MessagingPage | SMS (DLT), WhatsApp Business API, push notifications, automated alerts |
| 10 | Report Card / Certificate Generation | MISSING | Nothing | CBSE/ICSE marksheets, TC, bonafide, character, migration certificates |
| 11 | Hostel Management | MISSING | Nothing | Room allocation, mess fees, leave, warden alerts |
| 12 | Inventory Management | MISSING | Nothing | School assets, procurement, stock tracking |
| 13 | Visitor Management | MISSING | Nothing | Visitor logs, pass generation |
| 14 | Leave Management | MISSING | Nothing | Leave types, balances, applications, approvals, reports |
| 15 | Homework/Assignment Management | PARTIAL | Assignment model, AssignmentViewSet | Student submission model, file upload, teacher review/grading |
| 16 | Event Management | PARTIAL | InstitutionEvent model | Photo gallery, event calendar page, RSVP tracking |
| 17 | Enquiry Management | MISSING | Nothing | Pre-admission enquiries, follow-ups, conversion tracking |
| 18 | Employee Management | PARTIAL | TeacherProfile, PrincipalProfile | Staff document storage (Aadhar, PAN), experience history |
| 19 | Discipline/Behavior Management | MISSING | Nothing | Incident recording, warnings, disciplinary actions |
| 20 | Healthcare/Medical Management | PARTIAL | HealthRecord, HealthObservation | Vaccination tracking, allergy/blood group, medical room log |
| 21 | Certificate Management | MISSING | Nothing | TC generation, bonafide, character, conduct certificates |
| 22 | Parent Portal | PARTIAL | ParentDashboardView API, PaymentsPage | No parent role/login, no parent-specific pages |
| 23 | Mobile Apps | MISSING | Responsive web only | Native Android/iOS apps |
| 24 | Document Management | PARTIAL | Document model (6 types), uploads | No staff documents, no bulk upload, no expiry tracking |
| 25 | Student ID Card Generation | MISSING | IDConfiguration (prefix/year) | PDF generation with photo, barcode, school logo |
| 26 | Online Payment Gateway | MISSING | Manual payment recording only | Razorpay/Paytm integration, checkout flow, webhooks |
| 27 | Biometric Integration | MISSING | Nothing | Fingerprint/face recognition API |
| 28 | WhatsApp Integration | MISSING | Nothing | Business API, DLT templates, auto-notifications |
| 29 | U-DISE Reports | MISSING | Nothing | UDISE+ profile, annual data, export in government format |

### 2.2 Summary

| Status | Count |
|--------|-------|
| Fully Complete | 0 |
| Partial | 12 |
| Missing | 17 |

---

## 3. Priority Classification

### 3.1 CRITICAL — Cannot sell without these (6 modules)

| # | Module | Rationale |
|---|--------|-----------|
| C1 | **Report Card + Certificate Generation** | #1 requested feature. CBSE/ICSE mandate specific formats. TC is legally required. |
| C2 | **Leave Management** | Daily operational need for all staff and students. |
| C3 | **Online Payment Gateway (Razorpay)** | Parents expect online payment. Monetizes the fee module. |
| C4 | **HR/Payroll Management** | Every school pays staff monthly. Payslips, PF/ESI, tax. |
| C5 | **U-DISE Reports** | Government-mandated annual submission. Penalty for non-compliance. |
| C6 | **Complete Partial Modules** | Attendance bulk marking, fee receipts, parent notifications, timetable page. |

### 3.2 IMPORTANT — Competitive disadvantage without (7 modules)

| # | Module | Rationale |
|---|--------|-----------|
| I1 | **Transport Management** | 40-60% of schools use buses. GPS tracking is a selling point. |
| I2 | **Library Management** | CBSE/ICSE schools expect digital cataloging. |
| I3 | **WhatsApp + SMS Integration** | #1 communication channel for Indian parents. |
| I4 | **Enquiry Management** | Pre-admission funnel drives school revenue. |
| I5 | **Student ID Card Generation** | Schools print ID cards annually. |
| I6 | **Parent Role + Portal** | Dedicated parent login with fee view, attendance, homework, bus tracking. |
| I7 | **Discipline/Behavior Management** | Track incidents for parent meetings and report cards. |

### 3.3 NICE-TO-HAVE — Add later (4 modules)

| # | Module | Rationale |
|---|--------|-----------|
| N1 | Hostel Management | Only boarding schools need this. |
| N2 | Inventory Management | Schools manage this manually or with Tally. |
| N3 | Visitor Management | Security-conscious urban schools only. |
| N4 | Biometric Integration | High-budget schools only. API-ready design is enough. |

---

## 4. Detailed Implementation Plan — CRITICAL Modules

---

### C1: Report Card + Certificate Generation

#### Models

```python
# apps/academics/models.py (new app)

class ReportCardTemplate(Model):
    name              = CharField(max_length=120)
    board_type        = CharField(choices=['cbse', 'icse', 'state_board', 'custom'])
    grade             = FK(Grade, CASCADE)
    academic_year     = FK(AcademicYear, CASCADE)
    grading_scale     = CharField(choices=['marks', 'grades', 'both'])
    header_text       = TextField(blank=True)
    footer_text       = TextField(blank=True)
    principal_sign    = ImageField(blank=True)
    school_seal       = ImageField(blank=True)
    is_active         = BooleanField(default=True)
    # Meta: unique_together = [grade, academic_year]

class ReportCardConfig(Model):
    template          = FK(ReportCardTemplate, CASCADE)
    term              = CharField(choices=['term1', 'term2', 'annual'])
    assessments       = M2M(Assessment)  # which exams to include
    co_scholastic     = JSONField(default=list)  # [{area, grade}]
    show_attendance   = BooleanField(default=True)
    show_remarks      = BooleanField(default=True)

class GeneratedReportCard(Model):
    student           = FK(StudentProfile, CASCADE)
    template          = FK(ReportCardTemplate, CASCADE)
    term              = CharField(max_length=20)
    academic_year     = FK(AcademicYear, CASCADE)
    pdf_file          = FileField(upload_to='report_cards/')
    generated_by      = FK(User, SET_NULL, null=True)
    generated_at      = DateTimeField(auto_now_add=True)
    status            = CharField(choices=['draft', 'final', 'distributed'])

class CertificateTemplate(Model):
    name              = CharField(max_length=120)
    cert_type         = CharField(choices=['tc', 'bonafide', 'character', 'migration', 'conduct', 'study'])
    body_template     = TextField()  # with {{placeholders}}
    header_image      = ImageField(blank=True)
    is_active         = BooleanField(default=True)

class IssuedCertificate(Model):
    student           = FK(StudentProfile, CASCADE)
    template          = FK(CertificateTemplate, CASCADE)
    serial_number     = CharField(max_length=30, unique=True)
    issued_date       = DateField()
    issued_by         = FK(User, SET_NULL, null=True)
    pdf_file          = FileField(upload_to='certificates/')
    reason            = TextField(blank=True)
    # TC-specific fields:
    date_of_admission = DateField(null=True, blank=True)
    date_of_leaving   = DateField(null=True, blank=True)
    class_at_leaving  = CharField(max_length=30, blank=True)
    reason_for_leaving = CharField(max_length=100, blank=True)
    conduct           = CharField(max_length=100, blank=True)
    qualified_for_promotion = BooleanField(null=True)
    working_days      = IntegerField(null=True)
    days_present      = IntegerField(null=True)
```

#### API Endpoints

| Method | URL | Permission | Description |
|--------|-----|-----------|-------------|
| GET/POST | `/api/v1/academics/report-card-templates/` | IsAdmin | CRUD report card templates |
| GET/PATCH/DELETE | `/api/v1/academics/report-card-templates/{id}/` | IsAdmin | Detail |
| POST | `/api/v1/academics/report-cards/generate/` | IsAdmin | Bulk generate for section+term |
| GET | `/api/v1/academics/report-cards/student/{id}/` | IsStudent/IsStaff | Get student's report cards |
| GET | `/api/v1/academics/report-cards/{id}/download/` | IsAuthenticated | Download PDF |
| GET/POST | `/api/v1/academics/certificate-templates/` | IsAdmin | CRUD certificate templates |
| POST | `/api/v1/academics/certificates/issue/` | IsAdmin | Issue certificate to student |
| GET | `/api/v1/academics/certificates/student/{id}/` | IsStudent/IsStaff | List certificates |
| GET | `/api/v1/academics/certificates/{id}/download/` | IsAuthenticated | Download PDF |

#### Frontend Pages

| Page | URL | Role | Features |
|------|-----|------|----------|
| Report Card Templates | `/admin/report-card-templates` | Admin | Create/edit templates per grade/board |
| Generate Report Cards | `/admin/generate-report-cards` | Admin | Select section+term, preview, bulk generate |
| View Report Card | `/student/report-cards` | Student | View/download own report cards |
| Certificate Templates | `/admin/certificate-templates` | Admin | Create certificate templates with placeholders |
| Issue Certificate | `/admin/issue-certificate` | Admin | Search student, select type, generate |
| Certificate History | `/admin/certificates` | Admin | Log of all issued certificates |

#### Workflow

1. Admin configures report card template per grade (CBSE scholastic + co-scholastic areas)
2. Teachers enter grades via Gradebook throughout the term
3. At term-end, admin selects section + term, clicks "Generate Report Cards"
4. System pulls GradeEntry data, attendance summary, renders PDF per student
5. Admin reviews, finalizes, marks as distributed
6. Students/parents download from dashboard
7. For certificates: admin searches student, selects template (TC/bonafide), fills fields
8. System generates PDF with serial number, school seal, principal signature

---

### C2: Leave Management

#### Models

```python
# apps/leave/models.py (new app)

class LeaveType(Model):
    name              = CharField(max_length=60)  # Casual, Sick, Earned, Maternity
    code              = CharField(max_length=10, unique=True)  # CL, SL, EL
    annual_quota      = IntegerField(default=12)
    carries_forward   = BooleanField(default=False)
    applicable_to     = CharField(choices=['staff', 'student', 'both'])
    is_active         = BooleanField(default=True)

class LeaveBalance(Model):
    user              = FK(User, CASCADE)
    leave_type        = FK(LeaveType, CASCADE)
    academic_year     = FK(AcademicYear, CASCADE)
    allocated         = IntegerField(default=0)
    used              = IntegerField(default=0)
    carried_forward   = IntegerField(default=0)
    # Meta: unique_together = [user, leave_type, academic_year]

    @property
    def remaining(self):
        return self.allocated + self.carried_forward - self.used

class LeaveApplication(Model):
    applicant         = FK(User, CASCADE, related_name='leave_applications')
    leave_type        = FK(LeaveType, CASCADE)
    start_date        = DateField()
    end_date          = DateField()
    is_half_day       = BooleanField(default=False)
    reason            = TextField()
    attachment        = FileField(blank=True)  # medical certificate
    status            = CharField(choices=['pending', 'approved', 'rejected', 'cancelled'], default='pending')
    applied_at        = DateTimeField(auto_now_add=True)

    @property
    def days_count(self):
        if self.is_half_day:
            return 0.5
        return (self.end_date - self.start_date).days + 1

class LeaveApproval(Model):
    application       = FK(LeaveApplication, CASCADE, related_name='approvals')
    approver          = FK(User, CASCADE)
    action            = CharField(choices=['approved', 'rejected'])
    remarks           = TextField(blank=True)
    acted_at          = DateTimeField(auto_now_add=True)
```

#### API Endpoints

| Method | URL | Permission | Description |
|--------|-----|-----------|-------------|
| GET/POST | `/api/v1/leave/types/` | IsAdmin | CRUD leave types |
| GET | `/api/v1/leave/balance/` | IsAuthenticated | Own leave balances |
| GET | `/api/v1/leave/balance/{user_id}/` | IsAdmin | View any user's balance |
| POST | `/api/v1/leave/apply/` | IsAuthenticated | Submit leave application |
| GET | `/api/v1/leave/applications/` | IsAuthenticated | List own applications |
| GET | `/api/v1/leave/applications/pending/` | IsAdmin/IsPrincipal | Pending approvals |
| POST | `/api/v1/leave/applications/{id}/approve/` | IsAdmin/IsPrincipal | Approve |
| POST | `/api/v1/leave/applications/{id}/reject/` | IsAdmin/IsPrincipal | Reject |
| POST | `/api/v1/leave/applications/{id}/cancel/` | IsAuthenticated | Cancel own |
| POST | `/api/v1/leave/allocate/` | IsAdmin | Bulk allocate balances for new academic year |
| GET | `/api/v1/leave/reports/` | IsAdmin | Monthly/yearly summary |

#### Frontend Pages

| Page | URL | Role | Features |
|------|-----|------|----------|
| Apply Leave | `/leave/apply` | All staff | Form: dates, type, reason, attachment |
| My Leaves | `/leave/my-leaves` | All staff | Own applications with status |
| Leave Approvals | `/admin/leave-approvals` | Admin, Principal | Pending requests, approve/reject |
| Leave Balances | `/admin/leave-balances` | Admin | All staff balances by department |
| Leave Config | `/admin/leave-config` | Admin | Configure types, quotas |
| Leave Reports | `/admin/leave-reports` | Admin | Department-wise consumption |

#### Workflow

1. Admin configures leave types (CL=12, SL=10, EL=15) at academic year start
2. System auto-allocates balances to all active staff
3. Teacher opens Leave Apply page, selects dates + type, submits
4. Principal/Admin gets notification of pending leave
5. Approver reviews, approves/rejects with remarks
6. System deducts from balance on approval
7. If medical leave > 2 days, system requires medical certificate attachment
8. Monthly reports show department-wise leave consumption

---

### C3: Online Payment Gateway (Razorpay)

#### Models

```python
# apps/payments/models.py (new app or extend student app)

class PaymentGatewayConfig(Model):
    gateway           = CharField(choices=['razorpay', 'paytm', 'ccavenue'], default='razorpay')
    key_id            = CharField(max_length=100)  # encrypted
    key_secret        = CharField(max_length=100)  # encrypted
    is_active         = BooleanField(default=True)
    is_test_mode      = BooleanField(default=True)
    webhook_secret    = CharField(max_length=100, blank=True)
    updated_at        = DateTimeField(auto_now=True)

class OnlinePaymentOrder(Model):
    student           = FK(StudentProfile, CASCADE)
    tuition_account   = FK(TuitionAccount, CASCADE)
    amount            = DecimalField(max_digits=10, decimal_places=2)
    currency          = CharField(max_length=3, default='INR')
    gateway_order_id  = CharField(max_length=60, unique=True)
    gateway_payment_id = CharField(max_length=60, blank=True)
    gateway_signature = CharField(max_length=200, blank=True)
    status            = CharField(choices=['created', 'authorized', 'captured', 'failed', 'refunded'], default='created')
    created_at        = DateTimeField(auto_now_add=True)
    completed_at      = DateTimeField(null=True, blank=True)

class PaymentReceipt(Model):
    payment           = FK(Payment, CASCADE)  # links to existing Payment model
    receipt_number    = CharField(max_length=30, unique=True)
    pdf_file          = FileField(upload_to='receipts/')
    generated_at      = DateTimeField(auto_now_add=True)

class RefundRecord(Model):
    online_payment    = FK(OnlinePaymentOrder, CASCADE)
    amount            = DecimalField(max_digits=10, decimal_places=2)
    reason            = TextField()
    gateway_refund_id = CharField(max_length=60, blank=True)
    status            = CharField(choices=['initiated', 'processed', 'failed'], default='initiated')
    initiated_by      = FK(User, SET_NULL, null=True)
    created_at        = DateTimeField(auto_now_add=True)
```

#### API Endpoints

| Method | URL | Permission | Description |
|--------|-----|-----------|-------------|
| POST | `/api/v1/payments/initiate/` | IsAuthenticated | Create Razorpay order, return order_id |
| POST | `/api/v1/payments/verify/` | IsAuthenticated | Verify Razorpay signature after payment |
| POST | `/api/v1/payments/webhook/` | AllowAny | Razorpay webhook (payment.captured, failed, refund) |
| GET | `/api/v1/payments/receipts/{id}/download/` | IsAuthenticated | Download receipt PDF |
| POST | `/api/v1/payments/refund/` | IsFinanceOrAdmin | Initiate refund |
| GET/PATCH | `/api/v1/payments/gateway-config/` | IsSuperAdmin | View/update gateway credentials |

#### Frontend Pages

| Page | URL | Role | Features |
|------|-----|------|----------|
| Pay Fees | `/student/pay` | Student/Parent | Select fees, click Pay, Razorpay checkout modal |
| Payment Success | `/student/payment-success` | Student/Parent | Confirmation + receipt download |
| Gateway Config | `/super-admin/payment-gateway` | Super Admin | Enter Razorpay keys, toggle test/live |
| Refund Management | `/finance/refunds` | Finance | View/initiate refunds |

#### Workflow

1. Super Admin enters Razorpay API keys in Gateway Config (test mode first)
2. Student/parent opens Tuition page, sees outstanding fees
3. Clicks "Pay Now", system creates Razorpay order via API
4. Frontend opens Razorpay checkout modal (JS SDK) — card only for Indian merchants (Visa/MC/Amex)
5. Student completes payment
6. Frontend calls verify endpoint with payment_id + signature
7. Backend verifies, marks payment captured, updates TuitionAccount
8. Receipt PDF auto-generated with school header + payment details
9. Webhook handles async events (delayed captures, failures)

**Note — India Merchant Limitations:**
- No UPI support via Stripe
- Razorpay supports UPI, cards, netbanking, wallets
- Card support: Visa, Mastercard, Amex, RuPay
- Must comply with RBI auto-debit mandate for recurring payments

---

### C4: HR/Payroll Management

#### Models

```python
# apps/hr/models.py (new app)

class StaffProfile(Model):
    """For non-teaching staff (peons, clerks, drivers, etc.)"""
    user              = OneToOneField(User, CASCADE)
    employee_id       = CharField(max_length=20, unique=True)
    designation       = CharField(max_length=60)
    department        = FK(Department, SET_NULL, null=True)
    date_of_joining   = DateField()
    date_of_leaving   = DateField(null=True, blank=True)
    employment_type   = CharField(choices=['full_time', 'part_time', 'contract', 'temporary'])
    # Bank details
    bank_account_no   = CharField(max_length=20, blank=True)
    bank_name         = CharField(max_length=100, blank=True)
    ifsc_code         = CharField(max_length=11, blank=True)
    # Government IDs
    pan_number        = CharField(max_length=10, blank=True)
    aadhar_number     = CharField(max_length=12, blank=True)
    uan_number        = CharField(max_length=12, blank=True)  # PF
    esi_number        = CharField(max_length=17, blank=True)
    is_active         = BooleanField(default=True)

class SalaryStructure(Model):
    """Defines salary components for a staff member."""
    staff             = FK(User, CASCADE)  # works for teachers too
    basic             = DecimalField(max_digits=10, decimal_places=2)
    hra               = DecimalField(max_digits=10, decimal_places=2, default=0)
    da                = DecimalField(max_digits=10, decimal_places=2, default=0)
    conveyance        = DecimalField(max_digits=10, decimal_places=2, default=0)
    medical           = DecimalField(max_digits=10, decimal_places=2, default=0)
    special_allowance = DecimalField(max_digits=10, decimal_places=2, default=0)
    # Deductions
    pf_employee       = DecimalField(max_digits=10, decimal_places=2, default=0)  # 12% of basic
    pf_employer       = DecimalField(max_digits=10, decimal_places=2, default=0)
    esi_employee      = DecimalField(max_digits=10, decimal_places=2, default=0)
    professional_tax  = DecimalField(max_digits=10, decimal_places=2, default=0)
    tds               = DecimalField(max_digits=10, decimal_places=2, default=0)
    effective_from    = DateField()

    @property
    def gross(self):
        return self.basic + self.hra + self.da + self.conveyance + self.medical + self.special_allowance

    @property
    def total_deductions(self):
        return self.pf_employee + self.esi_employee + self.professional_tax + self.tds

    @property
    def net(self):
        return self.gross - self.total_deductions

class PayrollRun(Model):
    month             = IntegerField()  # 1-12
    year              = IntegerField()
    academic_year     = FK(AcademicYear, CASCADE)
    status            = CharField(choices=['draft', 'processed', 'finalized'], default='draft')
    processed_by      = FK(User, SET_NULL, null=True)
    processed_at      = DateTimeField(null=True)
    total_gross       = DecimalField(max_digits=12, decimal_places=2, default=0)
    total_deductions  = DecimalField(max_digits=12, decimal_places=2, default=0)
    total_net         = DecimalField(max_digits=12, decimal_places=2, default=0)

class PayslipEntry(Model):
    payroll_run       = FK(PayrollRun, CASCADE, related_name='payslips')
    staff             = FK(User, CASCADE)
    gross_salary      = DecimalField(max_digits=10, decimal_places=2)
    total_deductions  = DecimalField(max_digits=10, decimal_places=2)
    net_salary        = DecimalField(max_digits=10, decimal_places=2)
    days_worked       = IntegerField(default=0)
    days_absent       = IntegerField(default=0)
    leave_deduction   = DecimalField(max_digits=10, decimal_places=2, default=0)
    pf_employee       = DecimalField(max_digits=10, decimal_places=2, default=0)
    pf_employer       = DecimalField(max_digits=10, decimal_places=2, default=0)
    esi               = DecimalField(max_digits=10, decimal_places=2, default=0)
    professional_tax  = DecimalField(max_digits=10, decimal_places=2, default=0)
    tds               = DecimalField(max_digits=10, decimal_places=2, default=0)
    bonus             = DecimalField(max_digits=10, decimal_places=2, default=0)
    status            = CharField(choices=['generated', 'sent', 'acknowledged'], default='generated')
    # Meta: unique_together = [payroll_run, staff]

class StaffDocument(Model):
    staff             = FK(User, CASCADE, related_name='staff_documents')
    doc_type          = CharField(choices=['aadhar', 'pan', 'qualification', 'experience', 'appointment', 'bank_passbook', 'photo'])
    file              = FileField(upload_to='staff_documents/')
    file_name         = CharField(max_length=200)
    uploaded_at       = DateTimeField(auto_now_add=True)
```

#### API Endpoints

| Method | URL | Permission | Description |
|--------|-----|-----------|-------------|
| GET/POST | `/api/v1/hr/staff/` | IsAdmin | List/create non-teaching staff |
| GET/PATCH | `/api/v1/hr/staff/{id}/` | IsAdmin | View/update staff profile |
| GET/POST | `/api/v1/hr/salary-structures/` | IsFinanceOrAdmin | List/create salary structures |
| GET/PATCH | `/api/v1/hr/salary-structures/{id}/` | IsFinanceOrAdmin | View/update |
| GET/POST | `/api/v1/hr/payroll-runs/` | IsFinanceOrAdmin | List/create payroll runs |
| POST | `/api/v1/hr/payroll-runs/{id}/process/` | IsFinanceOrAdmin | Calculate salaries |
| POST | `/api/v1/hr/payroll-runs/{id}/finalize/` | IsFinanceOrAdmin | Lock payroll |
| GET | `/api/v1/hr/payslips/` | IsAuthenticated | Own payslips (staff) or all (admin) |
| GET | `/api/v1/hr/payslips/{id}/download/` | IsAuthenticated | Download payslip PDF |
| GET/POST | `/api/v1/hr/staff/{id}/documents/` | IsAdmin | Staff document CRUD |

#### Frontend Pages

| Page | URL | Role | Features |
|------|-----|------|----------|
| Staff Directory | `/admin/staff` | Admin | List all staff (teaching + non-teaching) |
| Staff Profile | `/admin/staff/{id}` | Admin | View/edit details, documents, salary |
| Payroll Dashboard | `/finance/payroll` | Finance | Monthly overview, initiate payroll run |
| Process Payroll | `/finance/payroll/{id}` | Finance | Review calculated salaries, adjust, finalize |
| My Payslips | `/teacher/payslips` or `/staff/payslips` | Teacher/Staff | View/download own payslips |
| Salary Structure | `/finance/salary-structures` | Finance | Configure per-employee salary components |

#### Workflow

1. Admin creates staff profiles with personal details and bank info
2. Finance sets salary structure per staff member (basic + allowances + deductions)
3. At month-end, finance initiates payroll run for current month
4. System calculates net salary for each active employee:
   - Gross = basic + HRA + DA + conveyance + medical + special
   - Deductions = PF(12%) + ESI(0.75%) + professional tax + TDS
   - Adjust for leave: absent days deducted proportionally
5. Finance reviews each payslip, adjusts bonuses/arrears if needed
6. Finance finalizes — payroll locked, no more edits
7. Payslips generated as PDFs
8. Staff can view/download their own payslips

---

### C5: U-DISE Reports

#### Models

```python
# apps/udise/models.py (new app)

class UDISEProfile(Model):
    """One-time school profile for UDISE+ portal."""
    udise_code        = CharField(max_length=11, unique=True)
    block_code        = CharField(max_length=10, blank=True)
    district_code     = CharField(max_length=10, blank=True)
    state_code        = CharField(max_length=10, blank=True)
    school_category   = CharField(choices=['primary', 'upper_primary', 'secondary', 'higher_secondary', 'composite'])
    school_type       = CharField(choices=['boys', 'girls', 'co_ed'])
    management_type   = CharField(choices=['govt', 'private_aided', 'private_unaided', 'central_govt'])
    medium            = CharField(max_length=60)  # English, Hindi, Tamil, etc.
    year_established  = IntegerField()
    affiliation_board = CharField(max_length=60)  # CBSE, ICSE, State Board
    affiliation_number = CharField(max_length=30, blank=True)

class UDISEAnnualData(Model):
    academic_year     = FK(AcademicYear, CASCADE)
    # Student enrollment (auto-populated from StudentProfile)
    enrollment_data   = JSONField(default=dict)  # {class: {boys: N, girls: N, sc: N, st: N, obc: N, general: N}}
    # Teacher data (auto-populated from TeacherProfile)
    teacher_data      = JSONField(default=dict)  # {qualification: count, male: N, female: N}
    # Infrastructure (from SchoolSettings or manual)
    infrastructure    = JSONField(default=dict)  # {classrooms, labs, toilets_boys, toilets_girls, drinking_water, computers, internet, library_books, playground_area}
    # Special categories
    cwsn_count        = IntegerField(default=0)  # Children with Special Needs
    rte_count         = IntegerField(default=0)  # RTE admissions
    minority_count    = IntegerField(default=0)
    mid_day_meal      = BooleanField(default=False)
    has_boundary_wall = BooleanField(default=False)
    has_ramp          = BooleanField(default=False)
    status            = CharField(choices=['draft', 'validated', 'exported'], default='draft')
    updated_at        = DateTimeField(auto_now=True)

class UDISEExportLog(Model):
    academic_year     = FK(AcademicYear, CASCADE)
    exported_by       = FK(User, SET_NULL, null=True)
    exported_at       = DateTimeField(auto_now_add=True)
    format            = CharField(choices=['csv', 'excel'])
    file              = FileField(upload_to='udise_exports/')
```

#### API Endpoints

| Method | URL | Permission | Description |
|--------|-----|-----------|-------------|
| GET/POST | `/api/v1/udise/profile/` | IsAdmin | School UDISE profile (one-time setup) |
| GET/POST | `/api/v1/udise/annual-data/` | IsAdmin | Annual data entry/view |
| POST | `/api/v1/udise/auto-populate/` | IsAdmin | Pull counts from existing models |
| POST | `/api/v1/udise/validate/` | IsAdmin | Validate data completeness |
| POST | `/api/v1/udise/export/` | IsAdmin | Export in UDISE+ format (CSV/Excel) |
| GET | `/api/v1/udise/exports/` | IsAdmin | Export history |

#### Frontend Pages

| Page | URL | Role | Features |
|------|-----|------|----------|
| UDISE Profile | `/admin/udise-profile` | Admin | One-time school profile setup |
| UDISE Annual Data | `/admin/udise-data` | Admin | Annual data entry with auto-populate button |
| UDISE Export | `/admin/udise-export` | Admin | Validate, preview, export as CSV/Excel |

#### Workflow

1. Admin enters school's UDISE code and static profile (one-time)
2. Before government deadline, admin opens UDISE Annual Data page
3. Clicks "Auto-Populate" — system counts:
   - Students by class/gender/category from StudentProfile
   - Teachers by qualification from TeacherProfile
   - Infrastructure from SchoolSettings
4. Admin fills any gaps (CWSN count, MDM status, boundary wall, ramp)
5. System validates completeness (flags missing mandatory fields)
6. Admin exports as CSV in UDISE+ portal upload format
7. Admin manually uploads CSV to government UDISE+ portal
8. Export logged for audit

---

### C6: Complete Partial Modules

#### C6.1: Attendance — Bulk Marking

**What exists:** Attendance model (student, date, is_present, remarks), ReadOnlyModelViewSet for students

**What to add:**

| Item | Details |
|------|---------|
| **Model changes** | Add `marked_by` FK to Attendance, add `course` FK (optional — for period-wise) |
| **New endpoint** | `POST /api/v1/teacher/attendance/bulk-mark/` — accepts `{section_id, date, students: [{id, is_present, remarks}]}` |
| **New endpoint** | `GET /api/v1/admin/attendance/report/?section=&start_date=&end_date=` — class-wise attendance report |
| **New page** | `MarkAttendancePage` for teachers — select section, shows student list with checkboxes, submit |
| **New page** | `AttendanceReportPage` for admin — section filter, date range, percentage chart |

#### C6.2: Fee Management — Installments & Receipts

**What exists:** FeeTemplate, TuitionAccount, Payment, manual recording

**What to add:**

| Item | Details |
|------|---------|
| **New model** | `InstallmentSchedule` — template FK, installment_number, due_date, amount, description |
| **New model** | `FeeReminder` — student FK, reminder_date, method (sms/email/whatsapp), status, sent_at |
| **New endpoint** | `GET /api/v1/admin/fee-defaulters/` — list students with overdue payments |
| **New endpoint** | `GET /api/v1/payments/{id}/receipt/download/` — generate receipt PDF |
| **Late fee logic** | Auto-calculate late fee after due date (configurable per-day/flat rate) |
| **New page** | `FeeDefaultersPage` — list overdue students with amount, days overdue, send reminder button |
| **Receipt PDF** | Auto-generate on payment recording — school header, student details, amount, receipt number |

#### C6.3: Timetable — Dedicated Page

**What exists:** ScheduleSlot model, CRUD ViewSet

**What to add:**

| Item | Details |
|------|---------|
| **New page** | `TimetablePage` — weekly grid view per section. Rows = periods (time slots), Columns = days. Each cell shows subject + teacher. Click to add/edit. |
| **Conflict detection** | Before saving a slot, check if the teacher already has a class at that time |
| **View modes** | Per section (admin), per teacher (teacher sees own schedule), per student (student sees section timetable) |

#### C6.4: Parent Portal

**What exists:** ParentDashboardView (matches Guardian.email to logged-in user), no parent role

**What to add:**

| Item | Details |
|------|---------|
| **No new role needed** | Parents login as regular users; ParentDashboardView matches by Guardian.email |
| **New nav** | Detect if logged-in user has Guardian records → show parent nav items |
| **New pages** | Parent-specific: My Children (list), Child Dashboard (attendance, grades, fees), Pay Fees, Messages |

---

## 5. Important Modules — Detailed Specs

### I1: Transport Management

#### Models

```python
# apps/transport/models.py (new app)

class Vehicle(Model):
    registration_no   = CharField(max_length=20, unique=True)
    vehicle_type      = CharField(choices=['bus', 'van', 'auto'])
    capacity          = IntegerField()
    driver_name       = CharField(max_length=120)
    driver_phone      = CharField(max_length=20)
    driver_license    = CharField(max_length=30, blank=True)
    conductor_name    = CharField(max_length=120, blank=True)
    conductor_phone   = CharField(max_length=20, blank=True)
    gps_device_id     = CharField(max_length=60, blank=True)
    insurance_expiry  = DateField(null=True, blank=True)
    fitness_expiry    = DateField(null=True, blank=True)
    is_active         = BooleanField(default=True)

class Route(Model):
    name              = CharField(max_length=120)  # "Route 1 - North"
    vehicle           = FK(Vehicle, CASCADE)
    start_location    = CharField(max_length=200)
    end_location      = CharField(max_length=200)
    distance_km       = DecimalField(max_digits=6, decimal_places=2, null=True)
    monthly_fee       = DecimalField(max_digits=8, decimal_places=2)
    is_active         = BooleanField(default=True)

class RouteStop(Model):
    route             = FK(Route, CASCADE, related_name='stops')
    name              = CharField(max_length=120)
    pickup_time       = TimeField()
    drop_time         = TimeField()
    latitude          = DecimalField(max_digits=10, decimal_places=7, null=True)
    longitude         = DecimalField(max_digits=10, decimal_places=7, null=True)
    order             = IntegerField()

class StudentTransport(Model):
    student           = FK(StudentProfile, CASCADE, related_name='transport')
    route             = FK(Route, CASCADE)
    stop              = FK(RouteStop, CASCADE)
    academic_year     = FK(AcademicYear, CASCADE)
    is_active         = BooleanField(default=True)
```

#### Frontend Pages

| Page | URL | Role | Features |
|------|-----|------|----------|
| Vehicle Management | `/admin/vehicles` | Admin | CRUD vehicles with driver info |
| Route Management | `/admin/routes` | Admin | CRUD routes with stops, map view |
| Assign Students | `/admin/transport-assign` | Admin | Assign students to routes/stops |
| My Bus | `/student/bus` | Student/Parent | Route info, stop timing, driver contact |

---

### I2: Library Management

#### Models

```python
# apps/library/models.py (new app)

class Book(Model):
    isbn              = CharField(max_length=13, blank=True)
    title             = CharField(max_length=300)
    author            = CharField(max_length=200)
    publisher         = CharField(max_length=200, blank=True)
    edition           = CharField(max_length=30, blank=True)
    category          = CharField(max_length=60)  # Science, Fiction, Reference
    ddc_number        = CharField(max_length=20, blank=True)  # Dewey Decimal
    accession_number  = CharField(max_length=20, unique=True)
    total_copies      = IntegerField(default=1)
    available_copies  = IntegerField(default=1)
    shelf_location    = CharField(max_length=30, blank=True)
    is_active         = BooleanField(default=True)

class BookIssue(Model):
    book              = FK(Book, CASCADE, related_name='issues')
    issued_to         = FK(User, CASCADE)
    issued_date       = DateField(auto_now_add=True)
    due_date          = DateField()
    returned_date     = DateField(null=True, blank=True)
    fine_amount       = DecimalField(max_digits=6, decimal_places=2, default=0)
    status            = CharField(choices=['issued', 'returned', 'overdue', 'lost'], default='issued')
```

#### Frontend Pages

| Page | URL | Role | Features |
|------|-----|------|----------|
| Book Catalog | `/admin/library` | Admin | CRUD books, search by title/author/ISBN |
| Issue Book | `/admin/library/issue` | Admin | Scan/search book + student, issue |
| Return Book | `/admin/library/return` | Admin | Scan/search, return, calculate fine |
| My Books | `/student/library` | Student | Currently issued books, due dates |

---

### I3: WhatsApp + SMS Integration

#### Models

```python
# apps/notifications/models.py (new app)

class NotificationTemplate(Model):
    name              = CharField(max_length=120)
    channel           = CharField(choices=['sms', 'whatsapp', 'email', 'push'])
    event_trigger     = CharField(choices=['fee_due', 'absent', 'grade_published', 'event', 'custom'])
    body_template     = TextField()  # with {{placeholders}}
    dlt_template_id   = CharField(max_length=30, blank=True)  # for SMS DLT compliance
    is_active         = BooleanField(default=True)

class NotificationLog(Model):
    template          = FK(NotificationTemplate, SET_NULL, null=True)
    recipient         = FK(User, CASCADE)
    channel           = CharField(max_length=20)
    message           = TextField()
    status            = CharField(choices=['pending', 'sent', 'delivered', 'failed'])
    sent_at           = DateTimeField(null=True)
    error_message     = TextField(blank=True)

class NotificationConfig(Model):
    """SMS/WhatsApp provider credentials."""
    provider          = CharField(choices=['twilio', 'msg91', 'wati', 'interakt'])
    api_key           = CharField(max_length=200)
    sender_id         = CharField(max_length=20, blank=True)  # SMS sender ID
    whatsapp_number   = CharField(max_length=20, blank=True)
    is_active         = BooleanField(default=True)
```

---

### I4: Enquiry Management

#### Models

```python
# apps/enquiry/models.py (new app)

class Enquiry(Model):
    student_name      = CharField(max_length=120)
    parent_name       = CharField(max_length=120)
    phone             = CharField(max_length=20)
    email             = EmailField(blank=True)
    grade_interested  = FK(Grade, SET_NULL, null=True)
    source            = CharField(choices=['walk_in', 'phone', 'website', 'referral', 'advertisement', 'social_media'])
    status            = CharField(choices=['new', 'contacted', 'visited', 'applied', 'enrolled', 'lost'], default='new')
    notes             = TextField(blank=True)
    assigned_to       = FK(User, SET_NULL, null=True)
    follow_up_date    = DateField(null=True, blank=True)
    created_at        = DateTimeField(auto_now_add=True)

class EnquiryFollowUp(Model):
    enquiry           = FK(Enquiry, CASCADE, related_name='follow_ups')
    action            = CharField(max_length=200)  # "Called, interested in Grade 5"
    next_follow_up    = DateField(null=True, blank=True)
    created_by        = FK(User, SET_NULL, null=True)
    created_at        = DateTimeField(auto_now_add=True)
```

---

### I5: Student ID Card Generation

**What to add:**

| Item | Details |
|------|---------|
| **Library** | `WeasyPrint` or `ReportLab` for PDF, `python-barcode` for barcodes |
| **Endpoint** | `POST /api/v1/admin/id-cards/generate/` — accepts student IDs, generates PDF with school logo, photo, name, ID, barcode, grade, blood group |
| **Template model** | `IDCardTemplate` — layout config (portrait/landscape), fields to include, logo position, colors |
| **Frontend** | ID Card page — select students or section, preview, bulk generate, download PDF |

---

### I6: Parent Role + Portal

**Design decision:** No new role in User model. Instead, detect parent status by matching `Guardian.email` to the logged-in user's email.

| Item | Details |
|------|---------|
| **Backend** | `GET /api/v1/student/parent-dashboard/` already exists |
| **Frontend detection** | After login, if user role is not student/teacher/etc but has Guardian matches → show parent dashboard |
| **Alternative** | Add `parent` to User.Role choices, create parent accounts linked to Guardian records |
| **Recommended** | Add parent role for clean separation |

---

### I7: Discipline/Behavior Management

#### Models

```python
# could be added to student app

class DisciplineIncident(Model):
    student           = FK(StudentProfile, CASCADE, related_name='incidents')
    reported_by       = FK(User, CASCADE)
    incident_date     = DateField()
    category          = CharField(choices=['minor', 'moderate', 'major', 'critical'])
    description       = TextField()
    action_taken      = TextField(blank=True)
    parent_notified   = BooleanField(default=False)
    status            = CharField(choices=['reported', 'investigating', 'resolved', 'escalated'], default='reported')
    created_at        = DateTimeField(auto_now_add=True)
```

---

## 6. Complete Page Map — All Roles After Implementation

### Super Admin (21 pages)

| # | Page | URL | Description |
|---|------|-----|-------------|
| 1 | Dashboard | `/super-admin/dashboard` | System overview, user counts, activity |
| 2 | Admins | `/super-admin/admins` | Manage admin accounts |
| 3 | Finance Staff | `/super-admin/finance-staff` | Manage finance accounts |
| 4 | Principals | `/super-admin/principals` | Manage principal accounts |
| 5 | All Users | `/super-admin/users` | View all users, activate/deactivate |
| 6 | Announcements | `/super-admin/announcements` | Create/manage announcements |
| 7 | Audit Logs | `/super-admin/audit-logs` | System activity log |
| 8 | School Settings | `/super-admin/settings` | Institution configuration |
| 9 | Payment Gateway | `/super-admin/payment-gateway` | Razorpay API key config |
| 10 | UDISE Profile | `/super-admin/udise-profile` | Government compliance profile |
| 11-21 | *Inherits all Admin + Finance pages* | `/admin/*`, `/finance/*` | Full access to everything |

### Admin (20 pages)

| # | Page | URL | Description |
|---|------|-----|-------------|
| 1 | Dashboard | `/admin/dashboard` | Institutional overview |
| 2 | Students | `/admin/students` | Student registry |
| 3 | Admissions | `/admin/admissions` | Application processing |
| 4 | Enrollment | `/admin/enrollment` | Enroll new users |
| 5 | Academic Years | `/admin/academic-years` | Manage academic years |
| 6 | Classes | `/admin/classes` | Grades + sections |
| 7 | Subjects | `/admin/subjects` | Subjects + departments |
| 8 | Courses | `/admin/courses` | Course assignments |
| 9 | Assessments | `/admin/assessments` | Assessment oversight |
| 10 | Finance Overview | `/admin/finance` | Read-only fee/payment view |
| 11 | Report Card Templates | `/admin/report-card-templates` | Configure marksheet formats |
| 12 | Generate Report Cards | `/admin/generate-report-cards` | Bulk generate per section |
| 13 | Certificate Templates | `/admin/certificate-templates` | TC/bonafide/character templates |
| 14 | Issue Certificate | `/admin/issue-certificate` | Issue to individual student |
| 15 | Leave Approvals | `/admin/leave-approvals` | Approve/reject staff leave |
| 16 | Leave Config | `/admin/leave-config` | Configure leave types/quotas |
| 17 | Staff Directory | `/admin/staff` | All staff (teaching + non-teaching) |
| 18 | Attendance Report | `/admin/attendance-report` | Class-wise attendance overview |
| 19 | UDISE Annual Data | `/admin/udise-data` | Government data submission |
| 20 | Profile | `/admin/profile` | Own profile management |

### Finance (8 pages)

| # | Page | URL | Description |
|---|------|-----|-------------|
| 1 | Dashboard | `/finance/dashboard` | Revenue, collections, outstanding |
| 2 | Fee Templates | `/finance/fee-templates` | Create/manage fee structures |
| 3 | Record Payment | `/finance/payments` | Record cash/cheque/card payments |
| 4 | Discounts | `/finance/discounts` | Per-student scholarships/waivers |
| 5 | Fee Defaulters | `/finance/defaulters` | Overdue students list + reminders |
| 6 | Payroll Dashboard | `/finance/payroll` | Monthly salary processing |
| 7 | Process Payroll | `/finance/payroll/{id}` | Review/finalize payslips |
| 8 | Salary Structures | `/finance/salary-structures` | Per-employee salary config |

### Principal (8 pages)

| # | Page | URL | Description |
|---|------|-----|-------------|
| 1 | Dashboard | `/principal/dashboard` | Academic metrics, events |
| 2 | AI Question Generator | `/principal/question-generator` | Upload docs, generate questions |
| 3 | Enrollment | `/principal/enrollment` | Enroll teachers/students |
| 4 | Finance Overview | `/admin/finance` | Read-only fee/payment view |
| 5 | Leave Approvals | `/admin/leave-approvals` | Approve/reject teacher leave |
| 6 | Attendance Overview | `/admin/attendance-report` | Read-only school attendance |
| 7 | Faculty | `/faculty` | Faculty directory |
| 8 | Messages | `/messaging` | Internal messaging |

### Teacher (10 pages)

| # | Page | URL | Description |
|---|------|-----|-------------|
| 1 | Dashboard | `/teacher/dashboard` | Stats, assignments, observations |
| 2 | Assessment Lab | `/teacher/tests` | Create/manage assessments |
| 3 | Gradebook | `/teacher/gradebook` | Enter/edit student grades |
| 4 | Mark Attendance | `/teacher/attendance` | Daily attendance marking |
| 5 | Assignments | `/teacher/assignments` | Post homework (future: student submissions) |
| 6 | My Payslips | `/teacher/payslips` | View/download own payslips |
| 7 | Apply Leave | `/leave/apply` | Submit leave application |
| 8 | My Leaves | `/leave/my-leaves` | View leave status/balance |
| 9 | Enrollment | `/teacher/enrollment` | Enroll students (own sections) |
| 10 | Messages | `/messaging` | Internal messaging |

### Student (10 pages)

| # | Page | URL | Description |
|---|------|-----|-------------|
| 1 | Dashboard | `/student/dashboard` | Profile, attendance, schedule, tuition |
| 2 | Profile | `/student/profile` | Personal info, guardians, documents |
| 3 | Test Results | `/student/results` | Grades and report cards |
| 4 | Report Cards | `/student/report-cards` | Download CBSE/ICSE marksheets |
| 5 | Tuition | `/student/tuition` | Fee breakdown, balance |
| 6 | Pay Fees | `/student/pay` | Online payment (Razorpay) |
| 7 | Payments | `/student/payments` | Payment history, receipts |
| 8 | Timetable | `/student/timetable` | Weekly class schedule |
| 9 | Library | `/student/library` | Currently issued books |
| 10 | Messages | `/messaging` | Internal messaging |

### Parent (6 pages)

| # | Page | URL | Description |
|---|------|-----|-------------|
| 1 | Dashboard | `/parent/dashboard` | Children overview, tuition |
| 2 | Child Profile | `/parent/child/{id}` | Attendance, grades, fees |
| 3 | Pay Fees | `/parent/pay` | Online payment for child |
| 4 | Report Cards | `/parent/report-cards` | Download child's marksheets |
| 5 | Bus Tracking | `/parent/bus` | Child's bus route and timing |
| 6 | Messages | `/messaging` | Communication with school |

---

## 7. Technology Additions Needed

| Need | Library/Service | Purpose |
|------|----------------|---------|
| PDF Generation | `WeasyPrint` or `ReportLab` | Report cards, certificates, payslips, receipts, ID cards |
| Barcode/QR | `python-barcode`, `qrcode` | Student ID cards, book barcodes |
| Payment Gateway | `razorpay` Python SDK | Online fee collection |
| SMS | MSG91 or Twilio | DLT-approved SMS notifications |
| WhatsApp | WATI or Interakt API | WhatsApp Business notifications |
| Excel Export | `openpyxl` | UDISE reports, financial exports |
| Background Tasks | `Celery` + `Redis` | Bulk operations (payroll, report cards, reminders) |

---

## 8. Build Phases — Timeline

### Phase 1: Critical (Weeks 1-8)

| Week | Module | Deliverables |
|------|--------|-------------|
| 1-2 | Report Card Generation | Models, API, PDF templates (CBSE format), admin config page |
| 2-3 | Certificate Management | TC + bonafide templates, issue workflow, PDF generation |
| 3-4 | Leave Management | Models, apply/approve flow, balance tracking, reports |
| 4-5 | Razorpay Payment Gateway | Integration, checkout flow, webhooks, receipt PDFs |
| 5-6 | HR/Payroll | Staff profiles, salary structures, payroll run, payslips |
| 6-7 | U-DISE Reports | Profile, auto-populate, validation, CSV export |
| 7-8 | Complete Partials | Attendance bulk marking, fee defaulters, timetable page |

### Phase 2: Important (Weeks 9-16)

| Week | Module | Deliverables |
|------|--------|-------------|
| 9-10 | Transport Management | Vehicle/route/stop CRUD, student assignment, parent view |
| 10-11 | Library Management | Book catalog, issue/return, fines, student view |
| 11-12 | WhatsApp + SMS | Provider config, templates, auto-triggers (absent, fee due) |
| 12-13 | Enquiry Management | Enquiry CRUD, follow-ups, conversion funnel |
| 13-14 | Student ID Cards | Template config, PDF generation with photo/barcode |
| 14-15 | Parent Portal | Parent role, dedicated pages, child switching |
| 15-16 | Discipline Management | Incident recording, parent notification, report card integration |

### Phase 3: Nice-to-have (Weeks 17-20)

| Week | Module |
|------|--------|
| 17-18 | Hostel Management |
| 18-19 | Inventory Management |
| 19-20 | Visitor Management + Biometric API |

---

## 9. Risk Matrix

| Risk | Impact | Mitigation |
|------|--------|-----------|
| PDF generation performance (bulk report cards) | Medium | Use Celery for async generation, generate in batches |
| Razorpay webhook reliability | High | Implement idempotency keys, retry logic, manual reconciliation page |
| CBSE/ICSE format changes | Medium | Template-based approach allows admin to reconfigure without code changes |
| DLT SMS compliance | High | Pre-register templates with telecom operator, validate before sending |
| Data migration from existing school systems | High | Build CSV import for students, staff, fee data; provide migration guide |
| Multi-school (multi-tenant) scaling | High (future) | Current single-tenant works for V1; plan tenant scoping for V2 |

---

*This document is the single source of truth for Acadrix development priorities. Update it as modules are completed.*
