# Design System: FBA Super Admin Dashboard

## 1. Design System Philosophy

The design system is centralized, token-based, and built on top of **CSS Variables** and **Tailwind CSS**.
Components must never introduce hardcoded hex codes, inline sizing hacks, or random padding. Everything maps back to design tokens.

---

## 2. Typography

We use Google Fonts loaded globally in `src/styles/fonts.css` and applied to `:root`:

* **Primary Font (`font-sans` / `--font-primary`):** `Inter`, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif
  * Used throughout the application by default (headings, body text, data tables, navigation, buttons).
* **Secondary Font (`font-secondary` / `--font-secondary`):** `Roboto`, sans-serif
  * Used for numerical data points, statistics, badges, and code snippets where high legibility is beneficial.

Because the primary font is configured on `:root` and `body`, components never need to declare font families manually.

---

## 3. Brand & Semantic Colors

All colors are defined as HSL/hex CSS variables in `src/styles/globals.css` to allow seamless transitions between Light and Dark themes.

### Brand Colors (Matching FBA Ecosystem)
* **Primary**: `#0a9fe0` (Vibrant FBA Cyan/Blue)
* **Primary Hover**: `#088bc4`
* **Primary Foreground**: `#ffffff`
* **Secondary**: `#f59e0b` (Warm Amber/Gold Accent)
* **Secondary Hover**: `#d97706`
* **Secondary Foreground**: `#ffffff`

### Semantic Tokens (Light vs. Dark Mode)

| Token | Light Theme | Dark Theme | Purpose |
| :--- | :--- | :--- | :--- |
| `--background` | `0 0% 100%` (White) | `222 47% 11%` (Slate 900) | Main background |
| `--foreground` | `222 47% 11%` (Slate 900) | `210 40% 98%` (Slate 50) | Primary text color |
| `--card` | `0 0% 100%` | `217 33% 17%` (Slate 800) | Card & container surface |
| `--card-foreground` | `222 47% 11%` | `210 40% 98%` | Card text color |
| `--muted` | `210 40% 96.1%` | `217 33% 20%` | Disabled or subtle backgrounds |
| `--muted-foreground` | `215 16% 47%` | `215 20% 65%` | Subtle / secondary text |
| `--border` | `214 32% 91%` | `217 33% 22%` | Structural card & table borders |
| `--input` | `214 32% 91%` | `217 33% 22%` | Input border color |
| `--destructive` | `0 84.2% 60.2%` | `0 62.8% 30.6%` | Error messages, danger buttons |
| `--ring` | `198 91% 46%` | `198 91% 46%` | Focus outline ring |

---

## 4. Theme System (Light & Dark)

* **Default Mode**: Light mode.
* **Storage**: Preference is stored in `localStorage.getItem("fba-super-admin-theme")`.
* **Application**: Applied via the `.dark` class on the root `<html>` element.
* **Components**: Every shadcn/ui component and custom element automatically inherits theme variables without needing inline conditional dark classes.

---

## 5. Layout Sizing & Responsive Padding Tokens

Defined in `src/styles/tokens.css` and mapped into Tailwind:

* **Sidebar Width**: `var(--sidebar-width)` = `260px` (Expanded)
* **Sidebar Collapsed Width**: `var(--sidebar-width-collapsed)` = `72px`
* **Navbar Height**: `var(--navbar-height)` = `64px`
* **Border Radius**: `var(--radius)` = `0.625rem` (10px)

### Responsive Section Padding Utility Classes
To ensure consistent padding across all screens:
* **Mobile (< 640px)**: `px-4 py-4`
* **Tablet (640px - 1023px)**: `sm:px-6 sm:py-6`
* **Desktop (1024px+)**: `lg:px-8 lg:py-8`

Reusable class: `p-page` $\rightarrow$ `px-4 py-4 sm:px-6 sm:py-6 lg:px-8 lg:py-8`

---

## 6. Component Guidelines

* Always import UI primitives from `@/components/ui/*`.
* Always use `cn(...)` from `@/lib/utils` for dynamic class concatenation.
* Never use fixed widths on page-level content containers; use `w-full` with responsive grids (`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4`).

