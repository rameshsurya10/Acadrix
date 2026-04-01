# Scholar Metric — Product Requirements Document

**Document Version:** 1.0
**Date:** April 1, 2026
**Author:** rameshsurya10
**Product:** Scholar Metric (Acadrix Platform)
**Status:** In Development

---

## 1. Product Overview

**Scholar Metric** (branded as *Editorial Intelligence*) is a multi-role institutional school management platform with an editorial-grade, design-forward interface. It serves five distinct user roles within a school — Admin, Principal, Teacher, Student, and Parent — each with a dedicated set of screens and capabilities.

Design philosophy: **"The Digital Curator"** — high-contrast editorial aesthetics, no-border tonal layering, glassmorphism accents, and Material Design 3 color tokens. Rejects generic SaaS UI in favour of a curated, content-first experience.

---

## 2. Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18 + Vite 5 + TypeScript + Tailwind CSS 3 |
| Backend | Python Django 5 + Django REST Framework |
| Auth | JWT (djangorestframework-simplejwt) |
| Database | PostgreSQL |
| Dev ports | Frontend: 5173 · Backend: 8000 |

---

## 3. Project Structure

```
Acadrix/
├── frontend/          # React Vite app
│   ├── src/
│   │   ├── pages/     # 20 role-based pages
│   │   ├── components/
│   │   ├── contexts/  # AuthContext (JWT)
│   │   ├── services/  # API service layer
│   │   ├── lib/       # axios instance
│   │   └── types/
│   ├── tailwind.config.js
│   └── vite.config.ts
├── backend/           # Django REST API
│   ├── config/        # settings, urls, wsgi
│   └── apps/
│       ├── accounts/  # custom User model, JWT auth
│       ├── admin_panel/
│       ├── principal/
│       ├── teacher/
│       ├── student/
│       ├── parent/
│       └── shared/    # Messages, Tests, Results
├── database/          # Migrations, seeds, schema scripts
└── Acadrix/           # Original HTML prototypes (reference)
```

---

## 4. User Roles & Screens

### Admin
| Screen | Route | Description |
|--------|-------|-------------|
| Dashboard | `/admin/dashboard` | KPI cards, faculty table, admissions pipeline |
| Admissions | `/admin/admissions` | Application list, document verification checklist |
| Assessments | `/admin/assessments` | Test inventory, compliance stats, calendar ribbon |
| Finance | `/admin/finance` | Revenue overview, student billing accounts |
| Student Directory | `/admin/students` | Filterable master registry with GPA, billing status |
| Principal Profile | `/admin/profile` | Dr. Alistair Vance profile, system permissions |

### Principal
| Screen | Route | Description |
|--------|-------|-------------|
| Dashboard | `/principal/dashboard` | API score, master schedule, institutional media |
| AI Question Generator | `/principal/question-generator` | Upload PDF → generate 2-mark & 5-mark questions |

### Teacher
| Screen | Route | Description |
|--------|-------|-------------|
| Dashboard | `/teacher/dashboard` | Homework modules, performance entry, health observations |
| Gradebook | `/teacher/gradebook` | Class 10-A grades table, subject filters, alerts |
| Test Creation | `/teacher/tests` | Config panel, question inventory, publish/draft |

### Student
| Screen | Route | Description |
|--------|-------|-------------|
| Dashboard | `/student/dashboard` | GPA, attendance, subject bars, schedule ribbon |
| Profile | `/student/profile` | Student records, verification documents |
| Test Results | `/student/results` | A+ display, subject breakdown, trend analysis |
| Tuition | `/student/tuition` | Balance breakdown, payment history, milestones |

### Parent
| Screen | Route | Description |
|--------|-------|-------------|
| Payments | `/parent/payments` | Outstanding fees, payment method, receipts |

### Shared (multi-role)
| Screen | Route | Description |
|--------|-------|-------------|
| Messaging | `/messaging` | Inbox with role-tagged conversation list |
| Faculty Directory | `/faculty` | Staff cards, payroll stats, department health |
| Faculty Profile | `/faculty/:id` | Dr. Eleanor Vance — performance, schedule, salary |

---

## 5. Design System

- **Colors:** Material Design 3 token set — `primary: #2b5ab5`, `surface: #f8f9fa`, `on-surface: #191c1d`
- **Typography:** Manrope (headlines, extrabold) + Inter (body, labels)
- **Icons:** Material Symbols Outlined (variable font, Google)
- **Layout:** Bento grid with asymmetric `md:col-span-*` splits
- **Mobile nav:** Fixed BottomNavBar (hidden on desktop)
- **Desktop nav:** Sticky TopAppBar or left NavigationDrawer (role-dependent)
- **No-Line Rule:** No 1px borders — tonal surface layers used instead
- **Glassmorphism:** `bg-white/80 backdrop-blur-xl` on modals/overlays
- **Shadows:** Ambient only — `shadow-[0_32px_64px_-12px_rgba(0,0,0,0.04)]`

---

## 6. API Structure

Base URL: `/api/v1/`

| Prefix | App | Auth |
|--------|-----|------|
| `/api/v1/auth/` | accounts | Public (login), JWT protected (me, logout) |
| `/api/v1/admin/` | admin_panel | IsAdmin |
| `/api/v1/principal/` | principal | IsPrincipal |
| `/api/v1/teacher/` | teacher | IsTeacher |
| `/api/v1/student/` | student | IsStudent |
| `/api/v1/parent/` | parent | IsParent |
| `/api/v1/shared/` | shared | IsAuthenticated |
| `/api/docs/` | — | Swagger UI (drf-spectacular) |

---

## 7. Getting Started

### Frontend
```bash
cd frontend
npm install
npm run dev        # http://localhost:5173
```

### Backend
```bash
cd backend
python -m venv venv && source venv/bin/activate
pip install -r requirements-dev.txt
cp .env.example .env   # fill in DB credentials
python manage.py migrate
python manage.py runserver   # http://localhost:8000
```

### Database
```bash
createdb scholar_metric
# then run Django migrations above
```

---

## 8. Pending Work

- [ ] Wire frontend pages to live Django API endpoints
- [ ] Implement Django serializers and views for all apps
- [ ] Database seed data (sample students, teachers, tests)
- [ ] AI Question Generator — integrate LLM API (PDF upload → question generation)
- [ ] Authentication flow — role-based redirect after login
- [ ] Dark mode toggle (config exists in Tailwind, not yet applied)
