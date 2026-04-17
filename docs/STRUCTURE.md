# Acadrix — Code Structure Guide

This document codifies the folder conventions we use across the backend and
frontend. Follow these patterns when adding new features — it's what Phases
0-3 are built on.

## Backend (Django)

```
backend/
├── config/                     # Django project (settings, URLs, Celery app)
│   ├── settings.py             # production settings
│   ├── settings_test.py        # SQLite + eager celery + locmem cache
│   ├── celery.py               # Celery app + autodiscover
│   └── urls.py                 # top-level URL dispatcher
│
├── apps/                       # One Django app per domain/role
│   ├── accounts/               # auth, users, OTP, parent login
│   ├── super_admin/            # system-level admin operations
│   ├── admin_panel/            # school-admin operations
│   ├── academics/              # report cards, certificates
│   ├── principal/              # principal dashboard, AI questions
│   ├── teacher/                # teaching, grading, assessments
│   ├── student/                # student profiles, tuition, payments
│   ├── shared/                 # cross-app primitives (Grade, Subject, cache)
│   ├── leave/                  # leave management
│   ├── hr/                     # HR + payroll
│   └── udise/                  # UDISE government compliance
│
└── tests/                      # Mirrors apps/ structure
    ├── accounts/
    ├── academics/
    ├── admin_panel/
    ├── infra/                  # cross-cutting tests (cache, storage)
    ├── principal/
    ├── student/
    └── teacher/
```

### Django app internal layout

Every app follows this pattern. **Not every file must exist** — only what the
app actually needs.

```
apps/<appname>/
├── __init__.py
├── apps.py                     # AppConfig (only if signals need wiring)
├── models.py                   # Django ORM models
├── serializers.py              # DRF serializers
├── views.py                    # DRF views / viewsets
├── urls.py                     # URL routes for this app
├── permissions.py              # custom permission classes
├── migrations/                 # Django-generated migration files
├── services/                   # BUSINESS LOGIC (no HTTP, no DRF)
│   ├── __init__.py
│   └── <domain>_<verb>.py      # e.g. pdf_generator.py, question_generator.py
├── tasks.py                    # Celery task wrappers (thin — call services)
├── signals.py                  # (only if the app has model signals)
└── templates/<appname>/        # Django templates for PDFs, emails
```

### Key patterns

**1. Business logic lives in `services/`, not views.**

Views should be thin: parse request → delegate to service → return response.
The service layer knows nothing about HTTP and can be unit-tested without
mocking DRF. See:
- `apps/shared/services/pdf_generator.py`
- `apps/shared/services/razorpay_client.py`
- `apps/principal/services/question_generator.py`

**2. Celery tasks are thin wrappers over services.**

Tasks should only:
- Fetch objects by ID from the DB (never pass full model instances as args)
- Call the service
- Log + raise for retry

See:
- `apps/accounts/tasks.py` → `send_otp_email_task`
- `apps/academics/tasks.py` → `generate_report_card_pdf_task`
- `apps/principal/tasks.py` → `generate_questions_from_document_task`

**3. Cross-app shared services live in `apps/shared/services/`.**

If a service is used by more than one app (e.g. PDF generator is used by
academics but also could be used by admin), put it in `apps/shared/services/`
rather than duplicating.

**4. Signals are wired via AppConfig.ready(), not module import.**

`apps/shared/apps.py` is the only current example (cache invalidation).
Follow that pattern if you need signals — never import signals at module top
level (breaks test collection).

**5. Tests mirror the app folder structure.**

Tests for `apps/principal/services/question_generator.py` go in
`tests/principal/test_question_generator.py`. One test module per service
file where practical.

**6. Settings are env-driven, never hardcoded.**

All secrets + provider keys come from `django-environ`. Never commit real
credentials. See `.env.example` for the full list of required vars.

## Frontend (Vite + React + React Router)

```
frontend/
├── public/                     # static assets + PWA manifest icons
│   ├── icon-192.png / icon-512.png / *-maskable-*.png
│   ├── apple-touch-icon.png
│   ├── favicon.png
│   └── offline.html            # PWA offline fallback
│
├── src/
│   ├── main.tsx                # entry point
│   ├── App.tsx                 # providers + router
│   ├── vite-env.d.ts           # ambient types (vite + PWA)
│   │
│   ├── pages/                  # Route components. Name matches route.
│   │   ├── auth/
│   │   ├── super-admin/
│   │   ├── admin/
│   │   ├── finance/
│   │   ├── principal/
│   │   ├── teacher/
│   │   ├── student/
│   │   ├── leave/
│   │   ├── shared/
│   │   └── public/
│   │
│   ├── components/             # Reusable UI components
│   │   ├── layout/             # PageLayout, sidebars, headers
│   │   ├── shared/             # ProtectedRoute, Skeleton, ErrorBoundary, DataState, PWAUpdatePrompt
│   │   ├── forms/              # FormInput, ChangePasswordForm (phase 2.2)
│   │   ├── charts/             # MetricCard, TrendLineChart, CategoryBarChart, StatusDonutChart (phase 2.3)
│   │   └── enrollment/         # EnrollmentForm variants
│   │
│   ├── services/               # API layer (Axios calls). One file per domain.
│   │   ├── shared/             # authService, facultyService
│   │   ├── admin/
│   │   ├── student/
│   │   ├── teacher/
│   │   ├── academics/
│   │   ├── leave/
│   │   └── hr/
│   │
│   ├── hooks/                  # Custom React hooks
│   │   ├── queries/            # React Query hooks — one file per query
│   │   │   ├── useTuition.ts
│   │   │   └── useStudentDashboard.ts
│   │   └── useInstallPrompt.ts
│   │
│   ├── contexts/               # React context providers
│   │   └── AuthContext.tsx
│   │
│   ├── lib/                    # Utilities + third-party client wrappers
│   │   ├── api.ts              # axios instance with JWT interceptor
│   │   ├── queryClient.ts      # TanStack Query client + queryKeys factory
│   │   ├── razorpay.ts         # Razorpay Checkout loader
│   │   ├── download.ts         # Blob download helper
│   │   └── forms/
│   │       └── schemas.ts      # zod schemas
│   │
│   ├── types/                  # Shared TypeScript types
│   │
│   └── test/                   # Vitest tests (co-located or here)
│
├── scripts/
│   └── generate-icons.py       # PWA icon generator (Pillow)
│
├── index.html                  # Vite entry
├── vite.config.ts              # Vite + PWA + Vitest config
├── package.json
└── tailwind.config.js
```

### Key frontend patterns

**1. Data fetching uses React Query hooks under `src/hooks/queries/`.**

Never call `api.get()` directly inside a component. Define a hook like
`useTuition()` in `src/hooks/queries/useTuition.ts`, then use it.

```tsx
// Good
const { data, isLoading } = useTuition()

// Avoid (unless you have a specific reason)
useEffect(() => { api.get('/student/tuition/').then(setData) }, [])
```

**2. Forms use react-hook-form + zod, schemas in `lib/forms/schemas.ts`.**

```tsx
const { register, handleSubmit, formState: { errors } } = useForm({
  resolver: zodResolver(changePasswordSchema),
})

<FormInput registration={register('password')} error={errMsg(errors.password)} />
```

See `components/forms/ChangePasswordForm.tsx` for a complete reference.

**3. Pages with loading/error/empty states use `<DataState>`.**

```tsx
<DataState query={useMyQuery()} isEmpty={(d) => d.length === 0}>
  {(data) => <List data={data} />}
</DataState>
```

Don't hand-roll `if (loading) … if (error) … if (!data) …` chains.

**4. Errors bubble up to the route-level `<ErrorBoundary>`.**

Render errors in page components are caught automatically. You don't need a
try/catch for render bugs — just for event handlers and async work that
doesn't go through React Query.

**5. Import paths use `@/` alias, not relative.**

```tsx
import { useAuth } from '@/contexts/AuthContext'     // good
import { useAuth } from '../../../contexts/AuthContext'   // avoid
```

The `@/` alias is configured in `vite.config.ts` and `tsconfig.json`.

## What NOT to do

- Don't drop business logic into Django views. It belongs in `services/`.
- Don't create new cache backends. Use `apps/shared/cache_utils.py`.
- Don't fetch data in components. Use a hook in `src/hooks/queries/`.
- Don't hand-roll forms. Use react-hook-form + zod + `<FormInput>`.
- Don't hardcode colours in chart components. Import from `chartTheme.ts`.
- Don't write raw SQL migrations. Write Python migration files.

## Testing conventions

**Backend:**
- Tests live in `backend/tests/`, mirroring the `apps/` structure.
- Use `pytest`, not `manage.py test` (both work — pytest is the default).
- Mock external services (anthropic, razorpay, MSG91, WeasyPrint) at the
  service layer so tests don't need network or system libs.
- Integration tests use `APIClient` + `force_authenticate` from DRF.

**Frontend:**
- Tests live in `src/test/`.
- Use Vitest + Testing Library + `user-event` for interactions.
- Mock API calls via `vi.mock('@/lib/api')`.
- React Query tests use a fresh `QueryClient` per test with `retry: false`.

Run everything:

```bash
# Backend
cd backend && ./venv/bin/pytest

# Frontend
cd frontend && npm run test:run
```
