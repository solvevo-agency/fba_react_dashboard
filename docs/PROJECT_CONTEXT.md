# Project Context: FBA Super Admin Dashboard

## 1. Executive Summary & Objective

The **FBA Super Admin Dashboard** is the centralized management frontend for the Future Behavior Analysis (FBA) ecosystem.
It empowers super administrators to manage courses, instructors, modules, student progress, quiz assessments, certifications, payments, and site content.

This application is built with a lightweight, clean, and maintainable architecture emphasizing simplicity, predictability, and consistent visual styling.

---

## 2. Technology Stack

| Layer | Technology | Description |
| :--- | :--- | :--- |
| **Runtime & Tooling** | Vite + Bun / Node | Lightning-fast development & optimized ES module builds |
| **Framework & Lang** | React 19 + TypeScript | Functional components with strict TypeScript types (`strict: true`) |
| **Styling** | Tailwind CSS + CSS Variables | Centralized design tokens supporting Light and Dark modes |
| **Component Primitives**| shadcn/ui (Radix UI) | Accessible, unstyled primitives styled with Tailwind CSS |
| **State Management** | Redux Toolkit (`@reduxjs/toolkit`) | Global auth and UI state; RTK Query ready for API integration |
| **Routing** | React Router DOM v7 | Nested route layouts, public/protected route guards |
| **Forms & Validation** | React Hook Form + Zod | Strictly typed form schemas, performant un-controlled inputs |
| **Toasts & Feedback** | Sonner | Clean, accessible stacked notification toasts |
| **Icons** | Lucide React | Consistent, lightweight vector icons |
| **Charts** | Recharts | Responsive charting and KPI visualizations |

---

## 3. Directory Structure & Responsibilities

```text
fba-super-admin/
│
├── docs/
│   ├── PROJECT_CONTEXT.md       # High-level architecture, technology & domain specs
│   ├── DESIGN_SYSTEM.md         # Design tokens, typography, colors, layout rules
│   └── DEVELOPMENT_WORKFLOW.md  # Standard 6-step feature lifecycle
│
├── public/                      # Static assets & favicon
│
├── src/
│   ├── app/
│   │   ├── router/              # App router & Route guard components
│   │   ├── store/               # Redux Toolkit store & typed hooks (useAppDispatch, useAppSelector)
│   │   └── providers/           # Redux provider, Theme provider, Toaster provider
│   │
│   ├── assets/                  # Branding images, logo, graphics
│   │
│   ├── components/
│   │   ├── ui/                  # shadcn/ui components (Button, Input, Dialog, Dropdown, etc.)
│   │   ├── common/              # Common UI widgets (EmptyState, PageHeader, StatCard, Loading)
│   │   └── layout/              # Sidebar, Navbar, MobileDrawer, ThemeToggle, UserMenu
│   │
│   ├── features/
│   │   └── auth/                # Auth slice, types, validation schema, login form
│   │
│   ├── layouts/
│   │   ├── AuthLayout.tsx       # Centered layout for Login & password reset
│   │   └── DashboardLayout.tsx  # Responsive shell: Sidebar + Top Navbar + Main Content
│   │
│   ├── pages/
│   │   ├── LoginPage.tsx        # Login page with validation and mock auth
│   │   ├── DashboardPage.tsx    # Welcome overview with KPI cards and placeholder analytics
│   │   └── NotFoundPage.tsx     # 404 page with navigation recovery
│   │
│   ├── hooks/                   # Generic custom hooks (useTheme, useMediaQuery, etc.)
│   ├── lib/                     # Utility helpers (cn class merger)
│   ├── services/                # API client setup (prepared for future backend integration)
│   ├── styles/
│   │   ├── globals.css          # Base styles, Tailwind directives, theme variables
│   │   ├── tokens.css           # Design tokens: sizing, radius, padding variables
│   │   └── fonts.css            # Google Font imports (Inter primary, Roboto secondary)
│   │
│   ├── types/                   # Shared TypeScript definitions
│   │
│   ├── App.tsx                  # Root application wrapper
│   └── main.tsx                 # React entrypoint
│
├── AI_RULES.md                  # Universal rules for all AI assistants
├── .env.example                 # Environment variable templates
├── .gitignore                   # Git ignore specifications
├── components.json              # shadcn/ui configuration
├── package.json                 # Dependency manifest
├── tsconfig.json                # TypeScript root configuration
├── tsconfig.app.json            # Application TypeScript configuration
└── vite.config.ts               # Vite configuration with path aliases (@/)
```

---

## 4. Authentication & Routing Architecture

* **Initial State**: Mock authentication layer stored in Redux and synchronized with `localStorage`.
* **Public Routes**: `/login` (redirects already-authenticated users to `/dashboard`).
* **Protected Routes**: `/dashboard` and future sub-routes (redirects unauthenticated users to `/login`).
* **Fallback Route**: `*` renders `NotFoundPage`.
* **Readiness**: The state slice is architected so switching from mock auth to live backend JWT endpoints requires only swapping the mock dispatch in `authSlice` or hooking RTK Query.

