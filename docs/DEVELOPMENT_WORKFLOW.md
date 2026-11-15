# Reusable Development Workflow

This 6-step workflow applies to every new feature, refactor, or bugfix in the **FBA Super Admin Dashboard**.
Follow this process systematically to maintain quality, consistency, and tool independence.

---

## The 6-Step Workflow

```text
[ 1. Understand ] ──> [ 2. Analyze ] ──> [ 3. Plan ] ──> [ 4. Implement ] ──> [ 5. Validate ] ──> [ 6. Report ]
```

### 1. Understand
* Carefully review the requirements and user expectations.
* Clarify business edge cases (e.g. empty states, permission limits, responsive behaviors).
* Ask questions only when specifications are ambiguous.

### 2. Analyze
* Inspect existing files, components, and hooks.
* Identify existing UI primitives (`src/components/ui/`) that can be reused or composed.
* Understand the existing routing table (`src/app/router/`) and global Redux store (`src/app/store/`).

### 3. Plan
* Determine the exact set of files to create, update, or remove.
* Plan state flow: determine whether state belongs in local `useState` or global Redux.
* Explain significant technical or architectural decisions before writing code.

### 4. Implement
* Write clean, idiomatic, functional React 19 + TypeScript code.
* Follow the design tokens defined in `docs/DESIGN_SYSTEM.md`.
* Ensure forms use React Hook Form + Zod resolvers.
* Guarantee that every element works seamlessly across mobile, tablet, and desktop viewports.

### 5. Validate
* **TypeScript Compilation**: Run `tsc -b` to guarantee zero type errors.
* **Linting**: Ensure code conforms to ESLint guidelines without warnings or unused imports.
* **Responsiveness**: Verify mobile drawer, tablet collapse, and desktop layout.
* **Theme Switching**: Test both Light and Dark themes on new components.
* **Production Build**: Verify `vite build` completes successfully without bundle errors.

### 6. Report
* Provide a concise, structured summary of what was accomplished.
* List all modified and created files with forward-slash links.
* Report validation results (TypeScript, Build, Lint).
* Note any pending follow-ups or backend API contract requirements.

---

## Golden Rule for Small Changes
For trivial tweaks (such as fixing a typo or adjusting an icon), avoid unnecessary planning overhead—proceed directly to implement, validate, and report.

