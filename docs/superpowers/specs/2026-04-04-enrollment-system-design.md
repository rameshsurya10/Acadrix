# Enrollment System Design — Acadrix

**Date:** 2026-04-04  
**Status:** Draft  
**Scope:** Role-based user enrollment (Teacher, Student) with permission hierarchy, auto-ID generation, and email notification

---

## 1. Overview

Build an enrollment system where authorized users can create Teacher and Student accounts. The system integrates with the existing auth flow (progressive disclosure login, ID-based first-login password setup) and ID generation (IDConfiguration).

### Enrollment Hierarchy

| Creator Role | Can Enroll | Scope |
|-------------|-----------|-------|
| Super Admin / System | Admin, Principal | School-wide (manual/seed) |
| Admin | Teacher, Student | School-wide — any section, any grade |
| Principal | Teacher, Student | School-wide — any section, any grade |
| Teacher | Student | Only their assigned sections (via Course model) |

### Key Decisions (confirmed)

- Email is **required** for all enrollees (guarantees all login methods work)
- Guardian info is **optional** during enrollment — can be added later
- Teacher enrollment creates account only — class/subject assignment done separately
- Admission finalization can **also** create student accounts (existing flow + new auto-create)
- Notification: email sent if provided + generated ID shown on screen for printing
- Accounts created with `set_unusable_password()` — password set on first login

---

## 2. API Endpoints

### 2.1 Enroll Teacher

```
POST /api/v1/admin/enroll/teacher/
POST /api/v1/principal/enroll/teacher/
```

**Permissions:** Admin or Principal only

**Request Body:**
```json
{
  "first_name": "John",
  "last_name": "Doe",
  "email": "john@school.com",
  "phone": "",
  "department": 1,
  "title": "Physics Teacher",
  "qualification": "M.Sc Physics",
  "specialization": "Quantum Mechanics",
  "date_joined": "2026-04-04",
  "employment_status": "full_time",
  "employee_id": null
}
```

- `employee_id`: if null, auto-generated using IDConfiguration. If provided, used as-is (validated for uniqueness).

**Response (201):**
```json
{
  "success": true,
  "data": {
    "user": { "id": 15, "email": "john@school.com", "role": "teacher", "full_name": "John Doe" },
    "employee_id": "MAJ1998-14",
    "email_sent": true
  },
  "message": "Teacher enrolled successfully."
}
```

**Backend Logic:**
1. Validate email uniqueness in User table
2. Generate ID via `generate_id('teacher')` or use provided `employee_id`
3. Create User with `role='teacher'`, `set_unusable_password()`
4. Create TeacherProfile with all fields
5. Send welcome email with generated ID
6. Return response with ID for on-screen display

### 2.2 Enroll Student

```
POST /api/v1/admin/enroll/student/
POST /api/v1/principal/enroll/student/
POST /api/v1/teacher/enroll/student/
```

**Permissions:**
- Admin/Principal: school-wide (any section)
- Teacher: only sections from their assigned Courses

**Request Body:**
```json
{
  "first_name": "Jane",
  "last_name": "Smith",
  "email": "jane@email.com",
  "phone": "",
  "date_of_birth": "2012-05-15",
  "address": "123 Main St",
  "section": 3,
  "house": "Aquila",
  "student_id": null,
  "guardians": [
    {
      "name": "Mary Smith",
      "relationship": "mother",
      "phone": "9876543210",
      "email": "mary@email.com",
      "is_primary": true
    }
  ]
}
```

- `student_id`: if null, auto-generated. If provided, validated for uniqueness.
- `guardians`: optional array. Can be empty `[]` or omitted.
- `section`: required for teacher enrollment (must be a section they teach). Optional for admin/principal.

**Response (201):**
```json
{
  "success": true,
  "data": {
    "user": { "id": 16, "email": "jane@email.com", "role": "student", "full_name": "Jane Smith" },
    "student_id": "MAJ1998-42",
    "email_sent": true
  },
  "message": "Student enrolled successfully."
}
```

**Backend Logic:**
1. Validate email uniqueness
2. If teacher is enrolling: verify section belongs to one of their Courses
3. Generate ID or use provided `student_id`
4. Create User with `role='student'`, `set_unusable_password()`
5. Create StudentProfile with all fields
6. Create Guardian records if provided
7. Send welcome email with ID
8. Return response

### 2.3 Admission Finalize → Auto-Create Student

**Modify existing endpoint:**
```
PATCH /api/v1/admin/applications/{id}/
Body: { "status": "finalized" }
```

When status changes to `finalized` AND `student_created` is null:
1. Auto-create User + StudentProfile from application data
2. Map: `applicant_name` → `first_name`/`last_name`, `applicant_email` → `email`
3. Map: `guardian_name`/`guardian_phone`/`guardian_email` → Guardian record
4. Map: `grade_applying` → find default section for that grade
5. If email already exists as a User → return error: "A student account with this email already exists."
6. Set `student_created` FK on the application
7. Send welcome email

### 2.4 List Enrolled Users (for management pages)

These endpoints already exist or are straightforward list views:

```
GET /api/v1/admin/teachers/        — all teachers (admin/principal)
GET /api/v1/admin/students/        — all students (admin/principal)
GET /api/v1/teacher/my-students/   — students in teacher's sections only
```

---

## 3. Permission Enforcement

### Teacher Section Scope

Teachers can only enroll students into sections they're assigned to via the `Course` model:

```python
# Get sections this teacher is assigned to
teacher_sections = Course.objects.filter(
    teacher=request.user,
    academic_year__is_current=True,  # only current year
).values_list('section_id', flat=True).distinct()

# Validate requested section
if request.data.get('section') not in teacher_sections:
    raise PermissionDenied("You can only enroll students in your assigned sections.")
```

**Query optimization:** Single query with `values_list` + `distinct()` — no N+1.

### New Permission Class

```python
class IsAdminOrPrincipal(IsRole):
    allowed_roles = ['admin', 'principal']
```

This already exists in `accounts/permissions.py`.

### Endpoint Permission Matrix

| Endpoint | Admin | Principal | Teacher | Student |
|----------|:---:|:---:|:---:|:---:|
| Enroll Teacher | Yes | Yes | No | No |
| Enroll Student | Yes (any) | Yes (any) | Yes (own sections) | No |
| List Teachers | Yes | Yes | No | No |
| List Students | Yes (all) | Yes (all) | Yes (own) | No |
| Finalize Admission | Yes | No | No | No |

---

## 4. Database Changes

### No new models needed.

All required models exist:
- `User` — account with role
- `TeacherProfile` — teacher details with `employee_id`
- `StudentProfile` — student details with `student_id`
- `PrincipalProfile` — principal details with `employee_id`
- `Guardian` — contact info on student
- `IDConfiguration` — prefix/year settings
- `Course` — teacher ↔ section assignment (used for scope enforcement)

### Minor Changes

1. **`accounts/permissions.py`** — Remove `IsParent` (parent role no longer exists)

2. **`shared/models.py` — AcademicYear** — check if `is_current` field exists. If not, add a boolean field to identify the active academic year (needed for scoping teacher sections to current year).

---

## 5. Frontend Changes

### 5.1 Enrollment Page (new)

**Route:** `/admin/enrollment` (Admin/Principal), `/teacher/enrollment` (Teacher)

**Sidebar:** New "Enrollment" item under appropriate role nav sections

**Layout:**
- Tab toggle: "Enroll Teacher" | "Enroll Student" (teacher role only sees "Enroll Student")
- Form with required/optional field groupings
- Success modal showing generated ID with "Copy ID" and "Print" buttons
- Recent enrollments table below the form

### 5.2 Quick-Add on Management Pages

**Existing pages:**
- `/admin/students` → "Add Student" button → opens enrollment modal/drawer
- Admin Teachers page (if exists) → "Add Teacher" button → opens enrollment modal/drawer

The modal uses the same form component as the enrollment page (shared component).

### 5.3 Enrollment Form Component (shared)

**Teacher Enrollment Form:**
- First Name* | Last Name*
- Email* | Phone
- Department (dropdown) | Title
- Qualification | Specialization
- Date Joined | Employment Status (dropdown)
- Custom ID (optional — collapse/expand "Use custom ID")

**Student Enrollment Form:**
- First Name* | Last Name*
- Email* | Phone
- Date of Birth | Address
- Grade → Section (cascading dropdowns) | House
- Custom ID (optional)
- Guardian section (collapsible, repeatable):
  - Name | Relationship | Phone | Email | Is Primary

### 5.4 Success Screen

After successful enrollment:
```
┌─────────────────────────────────────┐
│  ✓ Student Enrolled Successfully!   │
│                                     │
│  Student ID: MAJ1998-42             │
│  Name: Jane Smith                   │
│  Email: jane@email.com              │
│                                     │
│  [📋 Copy ID]  [🖨 Print]  [📧 Resend Email] │
│                                     │
│  [Enroll Another]  [Go to Students] │
└─────────────────────────────────────┘
```

### 5.5 Admission Finalization Update

On the existing Admissions page, when admin clicks "Finalize":
- Show confirmation dialog: "This will create a student account for {name}. Continue?"
- After success, show the same success screen with generated ID

---

## 6. Welcome Email Template

**Subject:** Welcome to Acadrix — Your Account is Ready

**Body:**
```
Hello {first_name},

You have been enrolled in Acadrix as a {role}.

Your login ID: {generated_id}

To get started:
1. Go to {login_url}
2. Enter your ID: {generated_id}
3. Set your password on first login

If you have any questions, contact your administrator.

— Acadrix Team
```

---

## 7. Validation Rules

| Rule | Error Message |
|------|--------------|
| Email already registered | "A user with this email already exists." |
| Custom ID already taken | "This ID is already in use." |
| Teacher enrolling to wrong section | "You can only enroll students in your assigned sections." |
| No IDConfiguration for role | "ID configuration not set up. Contact your administrator." |
| Missing required fields | Standard DRF validation errors |
| Email format invalid | Standard DRF email validation |

---

## 8. Query Optimization

All enrollment queries are optimized — zero N+1:

| Operation | Query Strategy |
|-----------|---------------|
| Check email uniqueness | `User.objects.filter(email=x).exists()` — single indexed query |
| Generate ID | `Profile.objects.filter(id__startswith=prefix).order_by('-id').values_list().first()` — single indexed query |
| Teacher section check | `Course.objects.filter(teacher=user).values_list('section_id', flat=True).distinct()` — single query |
| Create user + profile | 2 INSERT queries (unavoidable, transactional) |
| Create guardians | Bulk create: `Guardian.objects.bulk_create(guardians)` — single INSERT |
| List students (teacher) | `StudentProfile.objects.filter(section__in=teacher_sections).select_related('user', 'section')` |

---

## 9. Files to Create

| File | Purpose |
|------|---------|
| `backend/apps/admin_panel/enrollment_views.py` | EnrollTeacherView, EnrollStudentView for admin/principal |
| `backend/apps/admin_panel/enrollment_serializers.py` | Enrollment serializers with validation |
| `backend/apps/teacher/enrollment_views.py` | EnrollStudentView for teacher (section-scoped) |
| `backend/apps/teacher/enrollment_serializers.py` | Teacher enrollment serializer with section validation |
| `backend/apps/accounts/emails.py` | Welcome email template and send function |
| `frontend/src/pages/admin/EnrollmentPage.tsx` | Enrollment page for admin/principal |
| `frontend/src/pages/teacher/EnrollmentPage.tsx` | Enrollment page for teacher |
| `frontend/src/components/enrollment/TeacherEnrollmentForm.tsx` | Shared teacher enrollment form |
| `frontend/src/components/enrollment/StudentEnrollmentForm.tsx` | Shared student enrollment form |
| `frontend/src/components/enrollment/EnrollmentSuccessModal.tsx` | Success modal with ID display, copy, print |
| `frontend/src/services/admin/enrollmentService.ts` | Admin enrollment API calls |
| `frontend/src/services/teacher/enrollmentService.ts` | Teacher enrollment API calls |

## 10. Files to Modify

| File | Changes |
|------|---------|
| `backend/apps/admin_panel/urls.py` | Add enrollment routes |
| `backend/apps/teacher/urls.py` | Add teacher enrollment route |
| `backend/apps/admin_panel/views.py` | Modify admission finalize to auto-create student |
| `backend/apps/accounts/permissions.py` | Remove `IsParent` |
| `backend/apps/shared/models.py` | Add `is_current` to AcademicYear if not present |
| `frontend/src/App.tsx` | Add enrollment page routes |
| `frontend/src/components/layout/navConfig.ts` | Add "Enrollment" nav item for admin/principal/teacher |

---

## 11. Out of Scope

- Bulk enrollment (CSV import) — separate feature
- Student transfer between sections — separate feature
- Teacher class/subject assignment — done from course management, not enrollment
- Deactivation/removal of enrolled users — separate feature
- Enrollment approval workflow — enrollment is immediate, no approval needed
