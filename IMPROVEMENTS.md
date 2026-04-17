# Acadrix - Improvement Roadmap

A phased plan to close the gaps identified in the codebase analysis. Work through phases in order. Each phase has a clear focus so you don't context-switch.

---

## Phase 0 - Foundation Decisions

These must be settled before writing any code in later phases. They shape everything downstream.

### 0.1 Student/Parent Shared Login (Architectural Decision)
**Decision:** No separate `parent` role. The `student` account is used by **both the student and the parent**.

**Rationale:**
- Avoids creating a 7th role, new permissions, new app, new dashboards
- Matches how most Indian school ERPs actually work
- Parent's phone number is the OTP destination during enrollment
- One source of truth for "the family" - same fees, same grades, same attendance

**Implementation notes:**
- `StudentProfile` already has `Guardian` records (parent name, phone, email, primary flag)
- During enrollment, capture the **parent's phone/email** as the login identifier (not the student's)
- Student dashboard needs a small "Viewing as: Student / Parent" UI affordance
- Some pages should be parent-only (fee payment, leave application for the child)
- Some pages should be student-only (homework submission, profile photo upload)
- Use a `view_mode` query param or context toggle - no auth changes needed

**Files to touch later:**
- `frontend/src/pages/student/*` - add view-mode toggle
- `backend/apps/student/serializers.py` - expose guardian info on dashboard
- `backend/apps/accounts/views.py` - allow OTP to be sent to guardian phone if registered

---

### 0.2 Test Strategy
**Decision:** pytest for backend, Vitest for frontend, Playwright for E2E.

- Set up `backend/pytest.ini` and `backend/conftest.py`
- Set up `frontend/vitest.config.ts`
- Add a `tests/` folder per Django app
- Add `frontend/src/__tests__/`
- Aim for tests on **new code** going forward, not retroactive coverage

---

### 0.3 Containerization Baseline
**Decision:** Docker + docker-compose for local + production.

- `Dockerfile` for backend (Python 3.11)
- `Dockerfile` for frontend (Node 20 build -> nginx serve)
- `docker-compose.yml` with postgres + redis + backend + frontend
- `.dockerignore` files

---

## Phase 1 - Production Blockers

Without these, the app cannot go live in any real school. Do them first.

### 1.1 Background Job System (Celery + Redis) [done]
**Why:** OTP emails, payroll runs, report card generation, AI calls all block the request thread today.

**What was done:**
- `celery[redis]==5.4.0`, `django-redis==5.4.0`, `redis==5.0.4` added to requirements.txt
- `backend/config/celery.py` with autodiscover + namespaced config
- `backend/config/__init__.py` imports the celery_app
- Django settings: CELERY_*, CACHES (django-redis), REDIS_URL
- `backend/apps/accounts/tasks.py` with `send_otp_email_task` + `send_otp_sms_task` (auto-retry x3, exponential backoff, idempotent)
- Views updated: `send_otp_email_task.delay(otp.id)` instead of synchronous send
- `worker` service added to docker-compose (concurrency=4, max-tasks-per-child=100)
- `settings_test.py` patched with `CELERY_TASK_ALWAYS_EAGER=True` and locmem cache
- Existing test mocks updated from `apps.accounts.views.*` to `apps.accounts.utils.*`
- New test file `tests/accounts/test_tasks.py` (5 tests covering eager dispatch + skipping used/missing OTPs)
- Bonus: fixed pre-existing `sslmode=require` Postgres bug (now configurable via `DB_SSLMODE`, defaults to `prefer`)

**Still pending tasks (other apps):**
- `hr.tasks.process_payroll_run` - convert when payroll is touched
- `academics.tasks.generate_report_card` - convert in Phase 1.5 (PDF generation)
- `principal.tasks.generate_questions_from_pdf` - convert in Phase 3.1 (LLM integration)

---

### 1.2 SMS Provider Integration (MSG91) [done]
**Why:** Email-only OTP excludes most Indian parents.

**What was done:**
- Integrated MSG91 Flow API v5 directly into `send_otp_sms()` (no extra service module needed - the function is already isolated)
- Settings added: `MSG91_AUTH_KEY`, `MSG91_OTP_TEMPLATE_ID`, `MSG91_SENDER_ID`, `MSG91_COUNTRY_CODE`
- `.env.example` updated with the new vars + DLT setup note
- **Dev fallback preserved**: when `MSG91_AUTH_KEY` is empty, the function still prints the OTP to console. This means local dev never needs an MSG91 account.
- Errors (HTTP / network / malformed JSON / MSG91 error response) raise so the Celery task layer auto-retries
- 9 new tests in `tests/accounts/test_sms.py` covering dev fallback, success path, HTTP errors, network errors, malformed JSON, and MSG91 error responses
- DLT requirement: production users must register a template at msg91.com containing `##OTP##` as the placeholder, then set `MSG91_OTP_TEMPLATE_ID`

**Bonus fixes:**
- `.env.example` had `DATABASE_URL` but settings.py reads individual `DB_*` vars - fixed
- Added `REDIS_URL`, `DB_SSLMODE`, and Celery override hints to `.env.example`

---

### 1.3 Payment Gateway Integration (Razorpay) [done]
**Why:** Currently `Payment` records are inserted manually. No real money moves.

**What was done:**
- `razorpay==1.4.2` added to requirements
- Settings: `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`, `RAZORPAY_WEBHOOK_SECRET`, `RAZORPAY_CURRENCY`
- `backend/apps/shared/services/razorpay_client.py` - service layer (`create_order`, `verify_payment_signature`, `verify_webhook_signature`)
- `Payment` model extended with `razorpay_order_id` (unique, nullable), `razorpay_payment_id`, `razorpay_signature`, `gateway_status` enum
- Migration `0005_payment_razorpay_fields` created
- Three new endpoints:
  - `POST /api/v1/student/payments/razorpay/create-order/` - creates Razorpay order + pending Payment row
  - `POST /api/v1/student/payments/razorpay/verify/` - verifies signature, captures payment atomically
  - `POST /api/v1/webhooks/razorpay/` - server-to-server webhook (AllowAny + signature check)
- **Atomic money update**: `Payment.gateway_status=captured` + `TuitionAccount.paid_amount` + status recalc all happen in `transaction.atomic()` with `select_for_update`
- **Idempotency**: verify endpoint is a no-op on already-captured payments; webhook is a safety net if verify call fails
- **Frontend**: `loadRazorpayCheckout()` script loader (`src/lib/razorpay.ts`), `createRazorpayOrder` + `verifyRazorpayPayment` added to studentService, PayFeesPage button wired with loading state + success banner
- **Tests** (`tests/student/test_razorpay.py`): 17 tests across 3 layers (signature crypto, endpoints, webhooks) including: valid/invalid signatures, idempotency, cross-user access control, webhook tamper detection, unknown order handling

**Production setup checklist:**
1. Sign up at razorpay.com, get test keys
2. Set `RAZORPAY_KEY_ID` + `RAZORPAY_KEY_SECRET` in prod env
3. Configure webhook URL in Razorpay dashboard -> `https://your-domain/api/v1/webhooks/razorpay/`
4. Subscribe webhook to `payment.captured` + `payment.failed` events
5. Copy webhook secret -> `RAZORPAY_WEBHOOK_SECRET`
6. Test with Razorpay test cards (`4111 1111 1111 1111`)
7. When ready, swap `rzp_test_*` keys for `rzp_live_*`

---

### 1.4 File Storage (S3-Compatible) [done]
**Why:** Documents (Aadhar, photos, certs) are sitting on local disk. Lost on every redeploy.

**What was done:**
- `django-storages[boto3]==1.14.3` added to requirements
- Django 5 `STORAGES` dict configured conditionally based on `USE_S3_STORAGE` env flag
- When off: local `FileSystemStorage` (existing behavior, zero disruption for local dev)
- When on: `S3Storage` routing **all 12 upload surfaces** through the bucket without touching any model
- Supports AWS S3 + Cloudflare R2 + Backblaze B2 + MinIO via `AWS_S3_ENDPOINT_URL`
- Signed URLs enabled by default (`AWS_QUERYSTRING_AUTH=True`) — private by default, 1-hour expiry
- `AWS_S3_FILE_OVERWRITE=False` — never clobber existing files, suffixes instead
- `AWS_LOCATION=media` — bucket subfolder for namespacing
- `.env.example` updated with 9 storage vars + per-provider endpoint URL examples
- 7 tests in `tests/infra/test_storage.py` verifying backend selection + upload_to paths

**Affected upload fields (all auto-routed):**
- `User.avatar`, `SchoolSettings.logo`
- `Document.file` (student docs), `AdmissionDocument.file`
- `LeaveApplication.attachment`, `Message.attachment`
- `StaffDocument.file`, `SourceDocument.file`
- `InstitutionEvent.photo`
- Report card signatures + seals, certificate headers

**Not done (deferred):**
- Management command to migrate existing local files to S3 — skipped because no prod data yet
- Avatar image resizing via Pillow — tracked as follow-up; simple to add via a signal

**Bucket CORS requirements (for frontend uploads):**
```json
{
  "CORSRules": [{
    "AllowedOrigins": ["https://your-frontend.com"],
    "AllowedMethods": ["GET", "PUT", "POST", "HEAD"],
    "AllowedHeaders": ["*"],
    "MaxAgeSeconds": 3000
  }]
}
```

---

### 1.5 PDF Generation (Report Cards & Certificates) [done]
**Why:** Right now you can't print a single certificate. The whole `academics` app produces unusable HTML.

**What was done:**
- `weasyprint==62.3` added to requirements
- Backend `Dockerfile` updated with system libs: `libcairo2`, `libpango-1.0-0`, `libpangoft2-1.0-0`, `libharfbuzz0b`, `libjpeg-dev`, `fonts-dejavu-core`, `fonts-liberation`
- `backend/apps/shared/services/pdf_generator.py` - service with 3 public helpers:
  - `render_html_to_pdf(html, base_url=None)` - generic HTML -> PDF
  - `render_report_card_pdf(report_card)` - uses Django template + data snapshot
  - `render_certificate_pdf(certificate)` - chooses template by cert_type
- 4 HTML templates under `apps/academics/templates/academics/pdfs/`:
  - `_base.html` - shared school header, CSS, page numbering, signature block
  - `report_card.html` - student info, marks table, summary, attendance, co-scholastic, remarks
  - `transfer_certificate.html` - 13-row formal TC format
  - `bonafide_certificate.html` - narrative paragraph format
  - `generic_certificate.html` - fallback for character/migration/conduct/study
- 2 Celery tasks in `apps/academics/tasks.py` for async bulk PDF generation (retries x3 on failure)
- 2 new `@action` endpoints added to existing viewsets:
  - `GET /api/v1/academics/report-cards/{id}/pdf/`
  - `GET /api/v1/academics/certificates/{id}/pdf/`
- Both endpoints stream PDFs directly via `HttpResponse` with proper `Content-Type` and `Content-Disposition`
- Graceful degradation: returns `503` with clear error if WeasyPrint system libs are missing
- Frontend: `downloadBlob()` helper in `lib/download.ts`, `downloadReportCardPdf` + `downloadCertificatePdf` added to academicsService, Download PDF buttons wired into the expanded detail panels on `ReportCardsPage.tsx` (with spinner state)
- **10 tests** in `tests/academics/test_pdf.py` covering: service unit tests (mocked WeasyPrint), endpoint tests (admin + student + cross-user rejection + 503 fallback), cert-type template routing, real WeasyPrint rendering (auto-skipped when system libs missing)

**Not done (deferred):**
- Caching generated PDFs to S3 — can be added later via the `*_task` wrappers
- Landscape orientation for wide mark sheets — current templates are A4 portrait only

---

### 1.6 Caching Layer (Redis) [done]
**Why:** Dashboard queries run on every page load. Will collapse at scale.

**What was done:**
- Redis cache backend was already wired in 1.1 (django-redis)
- New module `apps/shared/cache_utils.py` with a **version-key invalidation pattern**:
  - `cache_or_compute(group, parts, timeout, compute)` - read-through helper
  - `bump_version(group)` - atomic group invalidation (no KEYS scan needed)
  - `invalidate_dashboards()` / `invalidate_reference_data()` convenience helpers
- Two cache groups defined: `dashboard` (per-role stats) and `reference` (grades, faculty)
- **Cached endpoints:**
  - `GET /admin/dashboard-stats/` - 60s, per-user key (unread_notifications is user-scoped)
  - `GET /principal/dashboard/` - 120s, global
  - `GET /super-admin/dashboard/` - 120s, global
  - `GET /shared/grades/` - 600s, global
  - `GET /shared/faculty/` - 300s, **unfiltered only** (filtered requests bypass cache)
- **Skipped:** `/admin/finance-overview/` — has pagination + search params that would explode the cache key space
- **Signal-based invalidation** in `apps/shared/signals.py`:
  - User/StudentProfile/TeacherProfile save/delete -> invalidate dashboards (and reference for users)
  - AdmissionApplication save/delete -> invalidate dashboards
  - Payment save -> invalidate dashboards (collection stats)
  - Grade/Subject/Department/AcademicYear save/delete -> invalidate reference
- Wired via new `apps/shared/apps.py` `SharedConfig.ready()` hook
- **10 tests** in `tests/infra/test_cache.py` covering:
  - Version key format and bumping
  - `cache_or_compute` hit/miss semantics (compute called once, not twice)
  - Independent invalidation of dashboard vs reference groups
  - End-to-end: dashboard endpoint returns cached data on second call
  - Per-user key isolation: admin A's cache doesn't leak to admin B
  - Auto-invalidation: creating a new student bumps the dashboard version
  - Auto-invalidation: creating a new grade bumps the reference version

**Why version keys instead of explicit cache.delete():**
Every cached lookup includes the group's current version in its key. Bumping
the version number makes all prior cache entries unreachable without touching
them — Redis reaps them via TTL. This avoids enumerating keys (Redis `KEYS *`
is O(n) and dangerous in production).

---

## Phase 2 - Frontend Performance & UX

The backend can be perfect but the frontend will feel slow. Fix that here.

### 2.1 State Management (React Query / TanStack Query) [done]
**Why:** Every page re-fetches on every mount. No caching, no background refresh, no optimistic updates.

**What was done:**
- `@tanstack/react-query@^5.51.0` + `@tanstack/react-query-devtools@^5.51.0` added to package.json
- `frontend/src/lib/queryClient.ts` with tuned defaults:
  - `staleTime: 30_000` (30s) - prevents aggressive refetches
  - `gcTime: 5min` - cache survives navigation round-trips
  - `refetchOnWindowFocus: false` - opt-in per hook, not global
  - `retry: 1` (was 3) - 2s instead of 6s on failure
  - `mutations.retry: 0` - never auto-retry mutations (not idempotent)
- Centralised `queryKeys` factory for consistent cache key tracking across components
- `App.tsx` wrapped in `<QueryClientProvider>` with React Query Devtools (DEV only)
- Hooks directory pattern: `src/hooks/queries/use*.ts`
- Two hooks created as examples:
  - `useTuition()` - 60s staleTime (tuition changes rarely)
  - `useStudentDashboard()` - 30s staleTime + `refetchOnWindowFocus: true` (most-visited page)
- **Two pages migrated** as reference implementations:
  - `PayFeesPage.tsx` - replaced useState/useEffect/cancelled-flag with `useTuition()`. After Razorpay success, uses `queryClient.invalidateQueries()` instead of manual refetch (any other component showing tuition data updates automatically)
  - `DashboardPage.tsx` - replaced useState/useEffect with `useStudentDashboard()`. Retry button now calls `refetch()` instead of `window.location.reload()` (no state loss)
- **3 Vitest tests** in `src/test/queryHooks.test.tsx` demonstrating the wrapper pattern (fresh QueryClient per test, mocked service layer)

**Migration path for remaining pages:**
The hooks directory pattern is in place. Remaining ~33 pages can migrate incrementally - each page refactor is ~15 min of mechanical work:
1. Import a hook from `@/hooks/queries/...`
2. Replace useState/useEffect loading with `const { data, isLoading, error } = useFoo()`
3. Replace manual refetch calls with `queryClient.invalidateQueries({ queryKey: ... })`

**Key decisions:**
- Kept `AuthContext` as-is (auth state is genuinely global + written frequently, not a good React Query use case)
- Devtools only in DEV via `import.meta.env.DEV` (tree-shaken from production bundle)

---

### 2.2 Form Library (react-hook-form + zod) [done]
**Why:** 35+ pages with hand-rolled forms = duplicated validation logic.

**What was done:**
- Dependencies added: `react-hook-form@^7.52.0`, `zod@^3.23.0`, `@hookform/resolvers@^3.9.0`
- `src/lib/forms/schemas.ts` — shared primitive schemas + composite schemas:
  - `emailSchema`, `passwordSchema`, `strongPasswordSchema` (requires upper/lower/digit)
  - `indianPhoneSchema` (auto-strips +91 prefix + formatting, returns clean 10 digits)
  - `otpSchema`, `idSchema`, `identifierSchema`
  - `passwordsMatch()` refinement helper
  - Pre-built composites: `changePasswordSchema`, `loginWithPasswordSchema`, `parentLoginPhoneSchema`, `otpVerifySchema`
- `src/components/forms/FormInput.tsx` — reusable input component that:
  - Integrates with `register()` via a `registration` prop
  - Auto-shows error messages with red border + aria-invalid
  - Supports icons, hints, and right-side adornments (show/hide password)
  - Forwards refs so react-hook-form can focus on error
  - Matches the existing LoginPage input style exactly (zero visual diff when migrating)
- `src/components/forms/ChangePasswordForm.tsx` — **reference implementation**
  - Uses `useForm<ChangePasswordInput>({ resolver: zodResolver(changePasswordSchema) })`
  - No useState per field — react-hook-form manages all state
  - Client-side validation catches bad input BEFORE hitting the API
  - Show/hide password toggles per field
  - Disabled button with spinner while `isSubmitting`
  - Displays server errors in a dedicated alert block
- **25 new tests** across 2 files:
  - `formSchemas.test.ts` — 21 tests covering every schema's happy path + edge cases (phone normalization, password strength rules, mismatch detection)
  - `changePasswordForm.test.tsx` — 4 integration tests (validation blocks submit, mismatch detection, successful post, server error display)

**Migration path for remaining forms:**
The infrastructure is now in place. Any form can be migrated in ~20 min:
1. Define or reuse a schema from `src/lib/forms/schemas.ts`
2. Replace `useState` fields with `useForm({ resolver: zodResolver(schema) })`
3. Replace `<input>` tags with `<FormInput registration={register('fieldName')} error={errors.fieldName?.message} />`
4. Replace manual validation with `handleSubmit(onSubmit)`

High-priority targets for next migrations:
- `ProfileEditPage.tsx` (can drop in `<ChangePasswordForm />` directly)
- `LoginPage.tsx` (multi-step — biggest win for users)
- Enrollment forms (student, teacher, principal)
- Leave application form

**Key decisions:**
- Schemas live in `lib/forms/schemas.ts` (not co-located with forms) so multiple forms can share them
- `FormInput` matches the existing design system exactly — no visual regressions during migration
- Tests use `@testing-library/user-event` instead of `fireEvent` for more realistic interaction simulation

---

### 2.3 Charts Library [done]
**Why:** Dashboards mention KPIs but I saw no charting imports.

**What was done:**
- `recharts@^2.12.0` added to package.json
- `src/components/charts/chartTheme.ts` — single source of truth for chart colors, palette, fonts
- 4 reusable components in `src/components/charts/`:
  - `MetricCard` — single KPI tile with optional delta indicator (auto-colored green/red)
  - `TrendLineChart` — responsive time-series line chart
  - `CategoryBarChart` — responsive bar chart with horizontal/vertical layout
  - `StatusDonutChart` — donut with centered total + legend (for "paid/overdue/pending" breakdowns)
- `src/components/charts/index.ts` — barrel export
- **9 tests** in `src/test/charts.test.tsx` covering: MetricCard delta logic (positive/negative/zero/hidden), bar chart mounting, donut center total computation
- **Code splitting wins** — recharts goes into its own `vendor-charts` chunk so pages not using charts skip the 85KB download entirely
- Chart components are ResponsiveContainer-based — fill parent width, no hardcoded pixels
- All charts share the same tooltip style, grid pattern, font — consistent UI across dashboards

**Migration path for dashboards:**
The chart components are ready to drop into existing dashboard pages:
```tsx
import { MetricCard, TrendLineChart, StatusDonutChart } from '@/components/charts'

<div className="grid grid-cols-4 gap-4">
  <MetricCard label="Students" value={1248} delta={12} icon="school" />
  <MetricCard label="Revenue" value="₹5.2L" delta={8} icon="payments" tone="tertiary" />
</div>
<TrendLineChart data={enrollmentHistory} yLabel="Students" />
```

---

### 2.4 Error Boundary [done]
**Why:** Single render error blanks the whole app today.

**What was done:**
- `src/components/shared/ErrorBoundary.tsx` — class-based Error Boundary with:
  - `getDerivedStateFromError` + `componentDidCatch` lifecycle methods
  - Auto-reset via `resetKey` prop (changes → boundary resets → children re-mount)
  - Custom `fallback` render prop for per-context error UI
  - `onError` callback for Sentry/logging (wire in Phase 5.1)
  - Default fallback has: friendly message, dev-only stack trace `<details>`, Try Again + Go Home buttons
- `App.tsx` wrapped all routes in `<RoutedErrorBoundary>` which keys on `useLocation().pathname` — navigating away from a broken page auto-clears the error (no reload needed)
- **5 tests** in `src/test/errorBoundary.test.tsx` covering: children render when OK, default fallback on throw, custom fallback, onError callback fires, reset via button click

**What it catches:**
- React render-time errors (bad JSX, null-ref crashes, undefined prop access)

**What it does NOT catch** (handle separately):
- Event handler errors → wrap in try/catch
- Async errors → React Query's `error` state (already wired)
- SSR errors → we don't SSR

---

### 2.5 Loading/Skeleton Discipline [done]
**Why:** Your `Skeleton` component exists but coverage is unclear. Many pages handle loading + error but forget empty states.

**What was done:**
- `src/components/shared/DataState.tsx` — generic wrapper that:
  - Accepts either a React Query result (`query` prop) OR manual loading/error/data props
  - Renders: loading → skeleton, error → error card with Retry button, undefined → empty, isEmpty() → empty, else → children
  - Has smart error message extraction (handles `Error`, axios response shape, plain strings)
  - Default skeleton is `aria-busy` for screen readers
  - Custom skeleton/empty/fallback are all overridable
- **8 tests** in `src/test/dataState.test.tsx` covering: loading skeleton, custom skeleton, error with retry, axios error shape extraction, undefined data as empty, `isEmpty()` predicate, data renders when not empty, manual mode without query prop

**Migration path:**
Any page using React Query can now replace the ~15 lines of if-loading/if-error/if-empty with one component:
```tsx
// Before
if (isLoading) return <Skeleton />
if (error) return <ErrorUI />
if (!data || data.length === 0) return <Empty />
return <List data={data} />

// After
<DataState query={query} isEmpty={(d) => d.length === 0}>
  {(data) => <List data={data} />}
</DataState>
```

**Not done (out of scope for an audit component):**
- Page-by-page migration of all 35+ existing pages — can happen incrementally as pages get touched
- Specific skeletons per page layout (dashboard skeleton, table skeleton, form skeleton) — the default skeleton is good enough for now; custom ones can be added as props when needed

---

### 2.6 PWA / Offline Support [done]
**Why:** Rural schools have patchy internet. Teachers need offline attendance marking.

**What was done:**
- `vite-plugin-pwa@^0.20.5` + `workbox-window@^7.1.0` added
- `vite.config.ts` configured with `VitePWA` plugin:
  - Strategy: `generateSW` (Workbox handles SW generation)
  - `registerType: 'prompt'` (user gets "Reload for new version" button — no silent auto-refresh mid-action)
  - `navigateFallback: '/offline.html'` for offline navigation
  - Runtime caching rules:
    - **API** (`/api/*`): NetworkFirst with 5s timeout, 5min TTL, 100 entries max
    - **Google Fonts CSS**: CacheFirst, 1 year TTL
    - **Google Fonts files**: CacheFirst, 1 year TTL
  - Pre-caches all JS/CSS/HTML/icons/fonts at install time (19 files, 946KB)
- Web app manifest at build time:
  - name, short_name, theme_color (`#2b5ab5`), background_color (`#f8f9fa`)
  - `display: standalone`, `orientation: portrait`, `lang: en-IN`
  - 4 icon variants: 192/512 `any` + 192/512 `maskable`
- **PWA icons** generated via Pillow (`scripts/generate-icons.py`):
  - Placeholder: brand-colored square with white "A" letter
  - Masked variant has 80% safe zone for Android launcher crops
  - Also: apple-touch-icon.png (180x180), favicon.png
- **Offline fallback page** (`public/offline.html`):
  - Standalone HTML (no React, no bundle dependency — works when SW can't load the app)
  - Auto-reloads when `navigator.online` becomes true
  - Matches Acadrix brand styling
- **Install prompt hook** (`src/hooks/useInstallPrompt.ts`):
  - Listens for `beforeinstallprompt` on Chrome/Edge/Android
  - Detects iOS Safari (where `beforeinstallprompt` never fires) so UI can show manual "Add to Home Screen" hint
  - Detects `display-mode: standalone` to hide install button if already installed
- **PWA update banner** (`src/components/shared/PWAUpdatePrompt.tsx`):
  - Uses `useRegisterSW` from `virtual:pwa-register/react`
  - Bottom-center toast with Reload/Later buttons when new SW is ready
  - Separate "App ready offline" message on first SW activation
  - Mounted globally in `App.tsx`
- `index.html` updated with full PWA meta tag set:
  - `theme-color`, favicon (fixed broken `/vite.svg` reference)
  - Apple-specific: `apple-touch-icon`, `apple-mobile-web-app-capable`, `apple-mobile-web-app-title`
  - Google Fonts preconnect for faster font loading
  - Microsoft Tile color
- `src/vite-env.d.ts` created with `vite-plugin-pwa/react` type reference
- TypeScript strict-mode issues from Phase 2.2 Forms fixed (`FormInput` prop type, `errMsg` helper for react-hook-form's FieldError union)

**Build output:**
```
PWA v0.20.5
mode      generateSW
precache  19 entries (945.88 KiB)
files generated
  dist/sw.js
  dist/workbox-a665390a.js
  dist/manifest.webmanifest
```

**Deferred:**
- Offline queue for attendance marking (out of scope — needs IndexedDB + sync logic. Track as 3.x when building offline attendance)
- Push notifications (would need a backend worker + web-push service)
- Background sync API (Chrome/Edge only, limited use)

---

## Phase 3 - Filling the Stubs

Models exist, integrations don't. Make these features real.

### 3.1 AI Question Generator (LLM Integration) [done]
**Why:** `SourceDocument` and `GeneratedQuestion` models exist but no LLM client.

**What was done:**
- `anthropic==0.34.0` + `pypdf==4.3.0` added to requirements
- Settings: `ANTHROPIC_API_KEY`, `ANTHROPIC_MODEL` (default `claude-sonnet-4-5`), `ANTHROPIC_MAX_INPUT_CHARS` (default 40000)
- `apps/principal/services/question_generator.py` — full pipeline with public entry points:
  - `extract_pdf_text(file_handle)` — pypdf-based extraction, handles per-page failures, auto-truncates to token budget
  - `generate_questions_for_document(doc, subject, num_questions, skip_if_existing)` — end-to-end pipeline (PDF → LLM → save)
- **Prompt template** in-file — customizable by school (currently tuned for Indian K-12 with 2-mark/5-mark split + difficulty variance + grading rubric)
- Custom exceptions: `LLMNotConfigured`, `LLMError`, `PDFExtractionError` — each handled differently by Celery (retry vs skip)
- JSON extracted via `<json>...</json>` regex with fallback to raw-JSON parsing
- Idempotency via `skip_if_existing` — re-running the Celery task is safe
- `apps/principal/tasks.py` — Celery task wrapper with auto-retry (max 2) and exception classification
- `SourceDocumentViewSet.perform_create` — dispatches task async when `subject_id` is supplied in upload
- **9 backend tests** in `tests/principal/test_question_generator.py`: parse-JSON happy path, malformed JSON, missing array, LLM not configured, happy path pipeline (mocked Anthropic client), idempotency, LLM error on bad response, PDF extraction error propagation
- **Frontend** `QuestionGeneratorPage.tsx` extended with:
  - Subject dropdown (populated from `/shared/subjects/`)
  - Number of questions input (1-50, clamped)
  - Subject is optional — users can upload without generation
  - Polling-based status banner: after upload, polls `/principal/questions/?source_document=ID` every 3s for up to 2 min, auto-refreshes the questions list when new ones appear
  - Graceful timeout message if generation takes >2 min

**Production setup:**
1. Sign up at [console.anthropic.com](https://console.anthropic.com), get an API key
2. Set `ANTHROPIC_API_KEY=sk-ant-...` in prod env
3. Optional: change model via `ANTHROPIC_MODEL` (default is claude-sonnet-4-5)
4. Upload a PDF with subject selected → questions appear within 30s

**Not done (follow-ups):**
- OCR for scanned/image-only PDFs (would need pytesseract + Tesseract — separate scope)
- Chunking for 200+ page textbooks (currently truncates at 40k chars)
- Fine-tuning the prompt per board (CBSE/ICSE/State) — the PROMPT_TEMPLATE is one block, can be extended to branch

---

### 3.2 Realtime Messaging (Django Channels + WebSockets)
**Why:** REST polling will kill DB at 1000+ users.

**What to add:**
- `channels` + `channels-redis`
- ASGI server (`daphne` or `uvicorn`)
- Consumer for conversations: `MessageConsumer`
- Frontend: native `WebSocket` or `socket.io-client`
- Push new messages instead of polling

---

### 3.3 Bulk Import/Export
**Why:** Schools enroll students in batches of 100s at year start.

**What to add:**
- `openpyxl` or `pandas` for Excel handling
- Endpoints:
  - `POST /admin/bulk-enroll/students/` - upload CSV/XLSX
  - `POST /admin/bulk-enroll/teachers/` - upload CSV/XLSX
  - `POST /teacher/grades/bulk-upload/` - upload marks
  - `GET /admin/students/export/` - download as XLSX
- Run as Celery task with progress tracking
- Validation report: which rows passed, which failed, why

---

### 3.4 UDISE+ Government Integration
**Why:** Models exist but no actual government portal integration.

**What to add:**
- Research UDISE+ API (or scrape if no API)
- Map your models to UDISE schema
- Generate government-ready XML/JSON exports
- Add a "Submission Status" field tracking gov receipt

---

### 3.5 Homework Submission Flow
**Why:** Assignments exist but students can't submit.

**What to add:**
- `AssignmentSubmission` model (assignment, student, file, submitted_at, grade)
- `POST /student/assignments/{id}/submit/` endpoint
- File upload (uses S3 from Phase 1.4)
- Teacher grading view

---

### 3.6 Online Exam UI
**Why:** `Assessment` model exists but there's no exam-taking interface.

**What to add:**
- Question bank linked to assessments
- Student exam page with timer, autosave, submit
- Auto-grading for objective questions
- Anti-cheat: tab-switch detection, full-screen lock

---

## Phase 4 - Security & Compliance

### 4.1 Two-Factor Auth (TOTP)
**Why:** Once logged in, password is the only barrier. Admins need more.

**What to add:**
- `django-otp` + `pyotp`
- TOTP setup flow for admin/finance/super_admin
- QR code generation for Google Authenticator
- Backup codes
- Enforce 2FA on first login for these roles

---

### 4.2 Comprehensive Audit Logging
**Why:** Only super_admin actions logged. Finance/grade fraud is invisible.

**What to add:**
- Generic audit middleware that logs:
  - Every payment recorded (who, amount, student, when)
  - Every grade entry/edit (who, before, after)
  - Every leave approval (who, decision)
  - Every certificate issued
- Use `django-auditlog` or roll your own with signals

---

### 4.3 GDPR / India DPDP Act Compliance
**Why:** Indian DPDP Act (2023) requires data export and deletion.

**What to add:**
- `GET /auth/me/data-export/` - returns full user data as JSON/ZIP
- `POST /auth/me/delete-account/` - soft delete + 30-day grace
- Privacy policy update covering DPDP rights
- Cookie consent banner

---

### 4.4 Soft-Delete Discipline
**Why:** Hard-deleting a student wipes their financial history.

**What to add:**
- `SoftDeleteModel` abstract base class with `is_deleted`, `deleted_at`
- Default manager filters out deleted records
- All-objects manager for admin access
- Apply to: User, StudentProfile, Payment, GradeEntry, Assessment

---

### 4.5 Per-User Rate Limiting
**Why:** Current limits are per-IP. Shared NAT bypasses them.

**What to add:**
- DRF custom throttle classes scoped by `user.id`
- Keep IP throttling for anonymous endpoints
- Add per-role limits (students 60/min, admins 200/min)

---

## Phase 5 - Observability & Operations

### 5.1 Error Tracking (Sentry)
**What to add:**
- `sentry-sdk` (backend) + `@sentry/react` (frontend)
- Source map upload in CI
- Release tracking
- Performance monitoring sample at 10%

---

### 5.2 Structured Logging
**What to add:**
- `structlog` for backend
- JSON log format in production
- Request ID propagation
- Log to stdout (let the orchestrator collect)

---

### 5.3 Health Check Endpoints
**What to add:**
- `GET /healthz/` - liveness (always returns 200)
- `GET /readyz/` - readiness (checks DB + Redis)
- Used by load balancers and Kubernetes

---

### 5.4 Metrics (Prometheus)
**What to add:**
- `django-prometheus`
- `/metrics` endpoint
- Custom counters: payments processed, OTPs sent, report cards generated
- Histograms: API latency per endpoint

---

### 5.5 Backups
**What to add:**
- Automated daily Postgres dumps to S3
- 30-day retention
- Quarterly restore drill (documented runbook)

---

### 5.6 CI/CD Pipeline
**What to add:**
- `.github/workflows/test.yml` - run tests on PR
- `.github/workflows/deploy.yml` - deploy on merge to main
- Lint check (ruff, eslint), type check (mypy, tsc), security scan
- Cache dependencies for speed

---

## Phase 6 - Localization

### 6.1 Multi-Language Support
**Why:** Hindi, Tamil, Telugu, Marathi expected by Indian schools.

**What to add:**
- Backend: Django built-in i18n (`makemessages`, `compilemessages`)
- Frontend: `react-i18next`
- Start with Hindi + English
- All UI strings in translation files
- User preference stored on profile
- Date/number formatting per locale

---

## Phase 7 - Domain Modules (Nice-to-Have)

Pick based on the school's actual needs. Each is a fresh Django app + frontend pages.

| Module | Models | Why It Matters |
|--------|--------|----------------|
| **Library** | Book, Issue, Return, Fine | Universal in Indian schools |
| **Transport** | Route, Stop, BusVehicle, Driver, StudentRoute | Safety + parent visibility |
| **Hostel** | Room, Bed, MealPlan, HostelFee | Boarding schools only |
| **Inventory** | Asset, Category, Allocation | Lab equipment tracking |
| **Exam Hall Seating** | SeatingPlan, RoomSeat | Auto-generated for board exams |
| **Live Class** | ClassSession (zoom/meet links) | Hybrid learning |
| **Discussion Forums** | ForumTopic, ForumPost | Class Q&A |
| **Biometric Attendance** | BiometricDevice, ScanLog | Hardware integration |

---

## Suggested Timeline

If a small team (2 backend + 2 frontend) works through this sequentially:

| Phase | Estimated Effort |
|-------|------------------|
| Phase 0 - Foundation | 1 week |
| Phase 1 - Production blockers | 4-6 weeks |
| Phase 2 - Frontend perf/UX | 3-4 weeks |
| Phase 3 - Filling stubs | 4-6 weeks |
| Phase 4 - Security/compliance | 2-3 weeks |
| Phase 5 - Observability | 2 weeks |
| Phase 6 - Localization | 2 weeks |
| Phase 7 - Domain modules | Ongoing (per school) |

**Total to production-ready:** ~4-5 months of focused work.

---

## How to Use This Document

1. **Don't skip phases.** Phase 1 depends on Phase 0 decisions. Phase 3 depends on Phase 1 infrastructure.
2. **One sub-task at a time.** When you start 1.1, finish it before opening 1.2.
3. **Tick off as you go.** Add `[done]` next to each sub-task you complete.
4. **Test each sub-task** before merging. No partial features.
5. **Each phase ends with a working app** - never leave the main branch broken.

---

## Tracking

| Phase | Status | Started | Finished | Notes |
|-------|--------|---------|----------|-------|
| 0 - Foundation | done | 2026-04-10 | 2026-04-10 | Parent login + pytest + vitest + Docker. Migrations need to be run on user's machine. |
| 1 - Production blockers | done | 2026-04-10 | 2026-04-10 | All 6 sub-tasks complete. 137 tests passing, 1 skipped (real WeasyPrint - skipped without system libs) |
| 2 - Frontend perf/UX | done | 2026-04-10 | 2026-04-11 | All 6 sub-tasks complete. 53 frontend tests passing. Build: 108KB gzipped main bundle, PWA installable |
| 2 - Frontend perf/UX | not started | - | - | - |
| 3 - Filling stubs | not started | - | - | - |
| 4 - Security/compliance | not started | - | - | - |
| 5 - Observability | not started | - | - | - |
| 6 - Localization | not started | - | - | - |
| 7 - Domain modules | not started | - | - | - |
