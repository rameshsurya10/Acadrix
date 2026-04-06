# Authentication System Design — Acadrix

**Date:** 2026-04-03  
**Status:** Draft  
**Scope:** Multi-method progressive-disclosure login, enrollment-based auth, ID generation, guided tour

---

## 1. Overview

Redesign the Acadrix authentication system from a simple email+password login to an enrollment-based, progressive-disclosure login system where:

- No user can login unless pre-registered by an Admin
- Login adapts based on what the user enters (ID vs email)
- Different roles have different allowed login methods
- First-time ID users set their own password
- A guided tour runs on first login

### Roles (updated)

| Role | Description |
|------|-------------|
| Admin | System administrator, manages all settings |
| Principal | School principal / vice-principal, full profile |
| Teacher | Enrolled by admin, gets employee ID |
| Student | Enrolled by admin, gets student ID. Also acts as parent — no separate parent role |

**PARENT role is removed.** The `Student` role covers both student and parent functions.

---

## 2. ID Generation System

### Format

```
[PREFIX (3 chars uppercase)][YEAR (4 digits)]-[SUFFIX (2+ digits, auto-increment)]

Examples:
  MAJ1998-01    (first teacher at school "Majesty", founded 1998)
  MAJ1998-02    (second teacher)
  MAJ1998-142   (142nd student)
```

### Admin Settings (configurable per institution)

| Setting | Description | Example |
|---------|-------------|---------|
| `teacher_id_prefix` | 3 uppercase letters + 4-digit year | `MAJ1998` |
| `student_id_prefix` | 3 uppercase letters + 4-digit year | `MAJ1998` |
| `principal_id_prefix` | 3 uppercase letters + 4-digit year | `MAJ1998` |

**Note:** All roles can share the same prefix. The suffix auto-increments per role independently.

### Auto-increment Logic

- Query the highest existing suffix for the given prefix+role
- Increment by 1
- Pad to minimum 2 digits (01, 02, ... 99, 100, 101, ...)
- Admin can optionally provide a manual suffix — system validates uniqueness

### New Model: `IDConfiguration`

```python
class IDConfiguration(models.Model):
    """Admin-configurable ID prefixes per role."""
    role = models.CharField(max_length=20, choices=[
        ('principal', 'Principal'),
        ('teacher', 'Teacher'),
        ('student', 'Student'),
    ], unique=True)
    prefix = models.CharField(max_length=3)  # e.g., "MAJ"
    year = models.CharField(max_length=4)     # e.g., "1998"
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'id_configurations'

    @property
    def full_prefix(self):
        return f"{self.prefix}{self.year}"
```

---

## 3. Database Changes

### 3.1 User Model Changes

**File:** `backend/apps/accounts/models.py`

- Remove `PARENT` from `Role.choices`
- Email becomes optional for students (they may only have an ID)
- Add index on `is_active`

```python
class Role(models.TextChoices):
    ADMIN = 'admin', 'Admin'
    PRINCIPAL = 'principal', 'Principal'
    TEACHER = 'teacher', 'Teacher'
    STUDENT = 'student', 'Student'
    # PARENT removed — student accounts serve dual purpose
```

**Note:** `email` stays as `USERNAME_FIELD` for admin/principal. For ID-based login, a custom auth backend handles lookup.

### 3.2 New Model: `PrincipalProfile`

**File:** `backend/apps/principal/models.py`

```python
class PrincipalProfile(models.Model):
    user = models.OneToOneField(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE,
        related_name='principal_profile',
        limit_choices_to={'role': 'principal'},
    )
    employee_id = models.CharField(max_length=20, unique=True)
    department = models.ForeignKey(
        'shared.Department', on_delete=models.SET_NULL,
        null=True, related_name='principals',
    )
    title = models.CharField(max_length=60, blank=True)  # "Principal", "Vice Principal"
    qualification = models.CharField(max_length=200, blank=True)
    specialization = models.CharField(max_length=200, blank=True)
    date_joined = models.DateField(null=True, blank=True)
    employment_status = models.CharField(
        max_length=20,
        choices=[('full_time', 'Full-time'), ('part_time', 'Part-time'), ('contract', 'Contract')],
        default='full_time',
    )
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'principal_profiles'
        indexes = [models.Index(fields=['employee_id'])]
```

### 3.3 New Model: `OTP`

**File:** `backend/apps/accounts/models.py`

```python
class OTP(models.Model):
    """Email-based OTP for login and forgot-password flows."""
    email = models.EmailField(db_index=True)
    code = models.CharField(max_length=6)
    purpose = models.CharField(max_length=20, choices=[
        ('login', 'Login'),
        ('forgot_password', 'Forgot Password'),
    ])
    attempts = models.PositiveSmallIntegerField(default=0)
    is_used = models.BooleanField(default=False)
    expires_at = models.DateTimeField()
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'otps'
        indexes = [
            models.Index(fields=['email', 'purpose', 'is_used']),
        ]
```

**OTP rules:**
- 6-digit numeric code
- 5-minute expiry
- Max 5 verification attempts per OTP
- Max 3 OTP sends per email per 15-minute window (rate limiting)
- Auto-invalidate previous unused OTPs for same email+purpose when sending new one

### 3.4 New Model: `IDConfiguration`

**File:** `backend/apps/admin_panel/models.py`

As described in Section 2.

### 3.5 Guardian Model Update

**File:** `backend/apps/student/models.py`

- Remove `limit_choices_to={'role': 'parent'}` from Guardian.parent
- Change to reference the student's own user or store guardian as contact fields (not a separate login)

```python
class Guardian(models.Model):
    """Guardian contact info stored on student profile. No separate login."""
    student = models.ForeignKey(StudentProfile, on_delete=models.CASCADE, related_name='guardians')
    name = models.CharField(max_length=120)
    relationship = models.CharField(max_length=30, default='parent')
    phone = models.CharField(max_length=20, blank=True)
    email = models.EmailField(blank=True)
    is_primary = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'guardians'
```

### 3.6 PaymentMethod Update

- Remove `limit_choices_to={'role': 'parent'}` — change to reference student user instead

### 3.7 New Model: `UserTourProgress`

**File:** `backend/apps/accounts/models.py`

```python
class UserTourProgress(models.Model):
    """Tracks which guided tours a user has completed."""
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE,
        related_name='tour_progress',
    )
    tour_key = models.CharField(max_length=60)  # e.g., "first_login", "dashboard", "assessments"
    completed_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'user_tour_progress'
        unique_together = ['user', 'tour_key']
        indexes = [models.Index(fields=['user', 'tour_key'])]
```

---

## 4. Authentication Flows

### 4.1 Login Methods by Role

| Role | Email + Password | ID + Password | Email OTP | Google OAuth | Forgot Password |
|------|:---:|:---:|:---:|:---:|:---:|
| Admin | Yes | No | No | No | OTP to email |
| Principal | Yes | No | No | No | OTP to email |
| Teacher | Yes | Yes | Yes | Yes | OTP to email |
| Student | Yes | Yes | Yes | Yes | OTP to email |

### 4.2 Progressive Disclosure Flow

**Step 1 — Identify**

User sees a single input field: "Enter your ID or Email"

```
POST /api/v1/auth/identify/
Body: { "identifier": "MAJ1998-01" }  OR  { "identifier": "user@email.com" }
```

**Backend logic:**

```
1. Determine if identifier contains "@" → email path, otherwise → ID path

EMAIL PATH:
  2a. Query User where email = identifier AND is_active = True
      Use: User.objects.filter(email=identifier, is_active=True)
             .select_related('teacher_profile', 'student_profile', 'principal_profile')
             .only('id', 'email', 'role', 'first_name')
             .first()
  3a. If not found → 404 error: "No account found with this email. Please use your ID to log in."
  4a. If found AND role is admin/principal → return { method: "password" }
  5a. If found AND role is teacher/student → return { method: "otp", hint: "r***e@gmail.com" }
      Also send OTP email immediately.

ID PATH:
  2b. Query TeacherProfile OR StudentProfile OR PrincipalProfile where employee_id/student_id = identifier
      Use: Single query with UNION-style approach or sequential with short-circuit:
        - TeacherProfile.objects.select_related('user').filter(employee_id=identifier, is_active=True).first()
        - If not found: StudentProfile.objects.select_related('user').filter(student_id=identifier, is_active=True).first()
        - If not found: PrincipalProfile.objects.select_related('user').filter(employee_id=identifier, is_active=True).first()
  3b. If not found → 404 error: "No account found with this ID. Contact your administrator."
  4b. If found AND user.has_usable_password() → return { method: "password" }
  5b. If found AND NOT user.has_usable_password() → return { method: "set_password" }
```

**Response format:**

```json
{
  "success": true,
  "data": {
    "method": "otp" | "password" | "set_password",
    "hint": "r***e@gmail.com",
    "role": "teacher",
    "name": "Ramesh"
  }
}
```

**Step 2a — Password Login (ID or Admin/Principal email)**

```
POST /api/v1/auth/login/
Body: { "identifier": "MAJ1998-01", "password": "..." }
  OR: { "identifier": "admin@school.com", "password": "..." }
```

Backend resolves identifier to user (same lookup as identify), then authenticates with password. Returns JWT tokens.

**Step 2b — OTP Verification (Teacher/Student email)**

```
POST /api/v1/auth/verify-otp/
Body: { "email": "teacher@school.com", "otp": "472839" }
```

Backend verifies OTP, returns JWT tokens.

**Step 2c — Set Password (First-time ID login)**

```
POST /api/v1/auth/set-password/
Body: { "identifier": "MAJ1998-01", "password": "NewPass123!", "confirm_password": "NewPass123!" }
```

Backend sets the password on the user account, then returns JWT tokens (auto-login after setting password).

**Step 3 — Forgot Password (Admin/Principal only trigger, but available to all)**

```
POST /api/v1/auth/forgot-password/
Body: { "email": "principal@school.com" }
```

Sends OTP to email. Then:

```
POST /api/v1/auth/reset-password/
Body: { "email": "principal@school.com", "otp": "123456", "new_password": "...", "confirm_password": "..." }
```

### 4.3 Google OAuth Flow (Teacher/Student only)

```
1. User clicks "Sign in with Google" → GET /api/v1/auth/google/url/
2. Redirects to Google consent screen
3. Google callback → POST /api/v1/auth/google/callback/ { "code": "..." }
4. Backend exchanges code for Google profile (email, name)
5. Backend checks: User.objects.filter(email=google_email, is_active=True, role__in=['teacher', 'student']).first()
6. If found → return JWT tokens
7. If not found → return error: "This Google account is not registered. Contact your administrator."
8. If found but role is admin/principal → return error: "Google sign-in is not available for admin accounts. Please use email and password."
```

### 4.4 Custom Auth Backend

**File:** `backend/apps/accounts/backends.py`

```python
class MultiMethodAuthBackend:
    """
    Authenticates by:
    1. Email + password (all roles)
    2. Employee ID + password (teacher, principal)
    3. Student ID + password (student)
    """
    def authenticate(self, request, identifier=None, password=None, **kwargs):
        # Determine if identifier is email or ID
        # Look up user accordingly
        # Check password
        # Return user or None
```

---

## 5. API Endpoints Summary

### New Endpoints

| Method | URL | Purpose | Auth Required |
|--------|-----|---------|:---:|
| POST | `/api/v1/auth/identify/` | Detect login method from identifier | No |
| POST | `/api/v1/auth/verify-otp/` | Verify OTP and return tokens | No |
| POST | `/api/v1/auth/set-password/` | First-time password setup via ID | No |
| POST | `/api/v1/auth/forgot-password/` | Send forgot-password OTP | No |
| POST | `/api/v1/auth/reset-password/` | Reset password with OTP | No |
| GET | `/api/v1/admin/id-config/` | Get ID prefix configurations | Admin |
| PUT | `/api/v1/admin/id-config/{role}/` | Update ID prefix for a role | Admin |
| GET | `/api/v1/auth/tour-progress/` | Get completed tours for user | Yes |
| POST | `/api/v1/auth/tour-progress/` | Mark a tour as completed | Yes |

### Modified Endpoints

| Method | URL | Change |
|--------|-----|--------|
| POST | `/api/v1/auth/login/` | Accept `identifier` (email or ID) instead of just `email` |
| POST | `/api/v1/auth/google/callback/` | Add role validation — reject admin/principal, reject unregistered |

### Removed Endpoints

None removed — existing endpoints are modified to support new flows.

---

## 6. Security Measures

### OTP Security
- 6-digit numeric, cryptographically random (`secrets.choice`)
- 5-minute expiry
- Max 5 verification attempts per OTP — then invalidate
- Max 3 OTP sends per email per 15-minute window
- Previous unused OTPs invalidated when new one is sent
- OTP never returned in API response — only sent via email

### Password Requirements
- Minimum 8 characters
- At least 1 uppercase, 1 lowercase, 1 digit
- Django's built-in password validators (common password list, similarity check)

### Rate Limiting
- `/identify/` — 10 requests per minute per IP (prevent enumeration)
- `/verify-otp/` — 5 requests per minute per IP
- `/login/` — 5 requests per minute per IP (already configured)
- `/forgot-password/` — 3 requests per minute per IP

### Anti-Enumeration
- The `/identify/` endpoint reveals whether an ID/email exists. This is acceptable because:
  - IDs are institution-internal (not guessable like emails)
  - Emails are rate-limited
  - The progressive UI requires knowing the method before showing the next step
- Error messages are specific enough to guide users but don't leak sensitive data

---

## 7. Frontend Changes

### Login Page Redesign

**File:** `frontend/src/pages/auth/LoginPage.tsx`

The login page becomes a multi-step form with progressive disclosure, keeping the existing Acadrix design system (ParticleNetwork background, brand panel, Material Design 3 tokens).

**Step 1 — Identifier Input**
- Single input field: "Enter your ID or Email"
- Icon: `badge` (Material Symbol)
- "Continue" button
- Google OAuth button below (with "or continue with" divider)
- "Don't have an account? Contact Admin" footer

**Step 2a — Password** (ID users with existing password)
- Shows user's name and ID at top
- Password input field
- "Sign In" button
- "Forgot Password?" link (sends OTP to registered email)
- "Back" button to return to Step 1

**Step 2b — Set Password** (First-time ID users)
- Welcome message with user's name
- "Create Password" input
- "Confirm Password" input
- Password strength indicator
- "Create Account & Sign In" button
- "Back" button

**Step 2c — OTP Verification** (Email users — teacher/student)
- Shows masked email: "OTP sent to r***e@gmail.com"
- 6 individual digit inputs (auto-focus next on entry)
- "Verify & Sign In" button
- "Resend OTP" with countdown timer (30s)
- "Back" button

**Step 2d — Error** (Unregistered email/ID)
- Error alert with specific message
- Input field pre-filled for retry
- Guidance text: "Use your Student ID or Employee ID" or "Contact your administrator"

### Animations
- Smooth slide transition between steps (left/right)
- Shake animation on error
- Fade-in for step content

### Responsive Behavior
- **Desktop (md+):** Split layout — brand panel left (44%), form panel right
- **Tablet (sm-md):** Full-width form, brand logo above
- **Mobile (<sm):** Compact form, smaller padding, stacked OTP inputs

### New Frontend Service

**File:** `frontend/src/services/shared/authService.ts`

Add new methods:

```typescript
identify(identifier: string): Promise<{ method: 'otp' | 'password' | 'set_password', hint?: string, role: string, name: string }>
verifyOTP(email: string, otp: string): Promise<AuthTokens>
setPassword(identifier: string, password: string, confirmPassword: string): Promise<AuthTokens>
forgotPassword(email: string): Promise<void>
resetPassword(email: string, otp: string, newPassword: string, confirmPassword: string): Promise<AuthTokens>
getTourProgress(): Promise<string[]>
completeTour(tourKey: string): Promise<void>
```

---

## 8. Guided Tour System

### Technology
- Use `react-joyride` library for step-by-step guided tours
- Tours are defined per page/feature with target selectors and content

### First Login Tour
On first login (detected via `UserTourProgress` — no `first_login` entry), show a welcome tour:

1. "Welcome to Acadrix!" — overview
2. "This is your dashboard" — points to dashboard area
3. "Navigate using the sidebar" — points to navigation
4. "Your profile" — points to avatar/profile menu
5. "Need help?" — points to help button

### Tour Triggers
- `first_login` — runs automatically on first successful login
- Feature-specific tours — run when user first visits a page (e.g., `dashboard`, `assessments`, `gradebook`)
- "Take Tour" button — available on every page header for manual re-trigger

### Tour Data Storage
- Backend: `UserTourProgress` model tracks completed tours per user
- Frontend: Check tour status on page mount, show if not completed
- API: `GET /api/v1/auth/tour-progress/` returns list of completed tour keys

---

## 9. Database Query Optimization

All queries in the auth flow are optimized — zero N+1:

| Query | Optimization |
|-------|-------------|
| Identify by email | `User.objects.filter(email=x).select_related('teacher_profile', 'student_profile', 'principal_profile').only('id','email','role','first_name').first()` — single query with joins |
| Identify by ID (teacher) | `TeacherProfile.objects.select_related('user').filter(employee_id=x).only('user__id','user__email','user__role','user__first_name','user__password').first()` — single query |
| Identify by ID (student) | Same pattern as teacher — short-circuit: try teacher first, then student, then principal. Max 3 simple indexed queries, usually 1. |
| OTP lookup | `OTP.objects.filter(email=x, purpose=y, is_used=False, expires_at__gt=now).latest('created_at')` — indexed on (email, purpose, is_used) |
| Tour progress | `UserTourProgress.objects.filter(user=x).values_list('tour_key', flat=True)` — single query, indexed on user |
| ID auto-increment | `Profile.objects.filter(employee_id__startswith=prefix).order_by('-employee_id').values_list('employee_id', flat=True).first()` — indexed on employee_id |

**Indexes added:**
- `otps`: composite index on `(email, purpose, is_used)`
- `user_tour_progress`: composite index on `(user, tour_key)`
- Existing indexes on `employee_id`, `student_id`, `email` are sufficient

---

## 10. Migration Plan

### Database Migrations (in order)

1. Remove `PARENT` from User.Role choices
2. Add `OTP` model
3. Add `IDConfiguration` model
4. Add `PrincipalProfile` model
5. Add `UserTourProgress` model
6. Modify `Guardian` model — remove FK to parent user, change to contact-info fields
7. Modify `PaymentMethod` — remove parent role constraint, link to student user

### Data Migration

- Any existing users with `role='parent'` need to be handled:
  - If no parent users exist yet → no action needed
  - If parent users exist → convert to student role or deactivate

---

## 11. Files to Create

| File | Purpose |
|------|---------|
| `backend/apps/accounts/backends.py` | Custom MultiMethodAuthBackend |
| `backend/apps/accounts/utils.py` | OTP generation, email sending, ID generation helpers |

## 12. Files to Modify

| File | Changes |
|------|---------|
| `backend/apps/accounts/models.py` | Remove PARENT role, add OTP model, add UserTourProgress |
| `backend/apps/accounts/views.py` | Add IdentifyView, VerifyOTPView, SetPasswordView, ForgotPasswordView, ResetPasswordView, TourProgressView. Modify LoginView, GoogleOAuthCallbackView |
| `backend/apps/accounts/serializers.py` | Add serializers for identify, OTP, set-password, forgot/reset password, tour |
| `backend/apps/accounts/urls.py` | Add new URL patterns |
| `backend/apps/principal/models.py` | Add PrincipalProfile |
| `backend/apps/admin_panel/models.py` | Add IDConfiguration |
| `backend/apps/admin_panel/views.py` | Add IDConfigurationViewSet |
| `backend/apps/admin_panel/serializers.py` | Add IDConfigurationSerializer |
| `backend/apps/admin_panel/urls.py` | Add ID config routes |
| `backend/apps/student/models.py` | Modify Guardian (remove parent FK, use contact fields), modify PaymentMethod |
| `backend/config/settings.py` | Add custom auth backend, update throttle rates |
| `frontend/src/pages/auth/LoginPage.tsx` | Complete redesign — progressive disclosure multi-step form |
| `frontend/src/services/shared/authService.ts` | Add identify, verifyOTP, setPassword, forgotPassword, resetPassword, tourProgress methods |
| `frontend/src/contexts/AuthContext.tsx` | Update login flow to support multi-method auth |
| `frontend/package.json` | Add `react-joyride` dependency |

---

## 13. Out of Scope

- SMS/WhatsApp OTP (explicitly excluded by user)
- Self-registration (all accounts created by admin only)
- Two-factor authentication (not requested)
- Session management / concurrent login limits (not requested)
- Admin enrollment UI (separate feature — this spec covers auth only)
