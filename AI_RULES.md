# Universal AI Development Rules

These rules apply to any AI coding assistant or human developer working on the **FBA Super Admin Dashboard**.
This project is deliberately tool-independent and does not depend on proprietary agent frameworks or platform-specific configurations.

---

## 1. Core Principles

1. **Read Documentation First**: Read `AI_RULES.md`, `docs/PROJECT_CONTEXT.md`, `docs/DESIGN_SYSTEM.md`, and `docs/DEVELOPMENT_WORKFLOW.md` before making architectural or code decisions.
2. **Inspect Before Modifying**: Always inspect existing components, styles, state slices, and routes before introducing new code.
3. **Follow the Established Architecture**: Maintain the feature-based folder structure and component hierarchy defined in `PROJECT_CONTEXT.md`.
4. **Maximum Component Reusability**: Prioritize using and extending shadcn/ui primitives (`src/components/ui/`) and common components (`src/components/common/`) rather than creating ad-hoc elements.
5. **Zero Unnecessary Abstractions & Dependencies**: Do not introduce helper libraries, redundant layers, or wrapper functions unless they solve an active, concrete problem.
6. **Strict TypeScript**: Write type-safe TypeScript. Do not use `any` or loose type assertions. Keep interfaces and types co-located with their features or in `src/types/`.
7. **Single Responsibility**: Keep components small, focused, clean, and declarative. Separate view presentation from business/state logic.
8. **Responsive By Default**: Every single UI component must seamlessly adapt across mobile (< 640px), tablet (640px - 1023px), laptop (1024px - 1279px), and desktop (1280px+).
9. **Never Hardcode Brand Colors**: Always use centralized CSS variables and Tailwind semantic classes (e.g., `bg-primary`, `text-primary-foreground`, `border-border`). Hardcoded hex codes like `#0a9fe0` inside components are strictly prohibited.
10. **Targeted Diffs**: Touch only files relevant to the active feature or bug fix. Avoid reformatting or changing unrelated code.
11. **Validate All Changes**: Ensure TypeScript compiles cleanly (`tsc -b`), lint rules pass, and the application builds without warnings or errors.
12. **Keep Docs Synchronized**: Whenever adding a new global pattern, route, or design token change, update the relevant markdown files in `docs/`.

---

## 2. Development Responsibilities

An AI assistant or developer acts as an end-to-end engineering partner and should alternate between these four roles as needed:

* **Architect**: Clarify user requirements, evaluate trade-offs, and map out the file touchpoints and data flow before implementing.
* **Developer**: Implement maintainable, strictly typed code adhering to React 19 / Vite / Redux Toolkit / Tailwind standards.
* **Designer**: Ensure visual alignment with the design tokens, typography, hierarchy, padding tokens, and both Light and Dark theme modes.
* **Reviewer**: Verify edge cases, responsiveness, keyboard accessibility, loading/error states, and code cleanliness.

---

## 3. UI Component Standards

* **UI Foundation**: Use **shadcn/ui** primitives (Radix UI + Tailwind CSS) as the first choice for all interactive controls (Buttons, Dialogs, Dropdown Menus, Selects, Checkboxes, Tooltips, Tables, Forms).
* **Forms**: Always use **React Hook Form** with **Zod** schema resolvers. Ensure proper validation messages, focus states, and disabled states during submission.
* **Notifications**: Use **Sonner** (`toast.success()`, `toast.error()`, `toast.info()`) for feedback.
* **Icons**: Use **Lucide React** (`lucide-react`) exclusively with consistent icon sizes (`w-4 h-4` for compact, `w-5 h-5` standard).

