# Project Guidelines & Development Rules

This document defines the architecture, design standards, styling constraints, component shells, and development rules for this project. All contributors and AI agents must strictly adhere to these rules.

---

## 1. Technology Stack & Language Constraints

- **Language**: **JavaScript ONLY**.
  - **STRICTLY NO TYPESCRIPT**. Do not introduce `.ts`, `.tsx`, `tsconfig.json`, or TypeScript dependencies into any part of the project.
- **Backend**:
  - Node.js runtime with Express.
  - ES Modules (`"type": "module"` with `import`/`export`).
- **Frontend**:
  - React initialized with **Vite** (`.jsx` / `.js`).
- **Styling Engine**:
  - **Tailwind CSS (v4)** via `@tailwindcss/vite`.
- **Icon Library**:
  - **Remixicon** (`remixicon` package) exclusively. Use `ri-*` icon classes (e.g., `ri-close-line`, `ri-checkbox-circle-fill`, `ri-delete-bin-line`).
- **Package Manager**:
  - Use **`pnpm`** as the package manager for installing packages, managing dependencies, and running scripts.

---

## 2. Design, Color Scheme & Styling Rules

- **Concrete Color Scheme (Light & Dark)**:
  - All color tokens are centrally defined in `frontend/src/index.theme.css` and mapped to Tailwind in `frontend/src/index.css`.
  - **STRICTLY NO RAW COLORS IN APPLICATION CODE**:
    - **Never** use hardcoded hex (`#ffffff`, `#1e293b`), rgb/rgba, or raw arbitrary color values inside JSX components or CSS files.
    - **All colors must come directly from theme tokens** via Tailwind classes:
      - Surfaces: `bg-background`, `bg-card`, `bg-popover`, `bg-muted`, `bg-secondary`
      - Text: `text-foreground`, `text-card-foreground`, `text-muted-foreground`, `text-secondary-foreground`
      - Brand: `bg-primary`, `text-primary`, `hover:bg-primary-hover`
      - Borders: `border-border`, `border-input`
      - Semantics: `bg-success`, `text-success`, `bg-success-subtle`, `bg-error`, `text-error`, `bg-error-subtle`, `bg-warning`, `text-warning`, `bg-warning-subtle`, `bg-info`, `text-info`, `bg-info-subtle`
- **Solid Colors Only**:
  - Keep colors flat, opaque, and solid.
  - **NO gradients** (`linear-gradient`, `radial-gradient`, mesh gradients, etc.).
- **NO Glow, Neon, or Flashy Effects**:
  - **NO glowing effects** (e.g., neon `box-shadow` glows, intense drop shadows).
  - **NO lightning or shining beam effects**.
- **Aesthetic**:
  - Clean, high-density, modern, and utilitarian (Linear/Vercel/Stripe style).
  - 1px crisp solid borders (`border-border`), well-defined solid card surfaces, clear typography, and consistent 8px rhythm.

---

## 3. Standardized Global Components & Shells

The following reusable global components and composable shells are pre-built and **must** be reused across the application:

### A. Notification Toast (`useToast()`)
- **Location**: `frontend/src/context/ToastContext.jsx`
- **Usage**:
  ```javascript
  import { useToast } from "../context/ToastContext.jsx";
  const toast = useToast();
  toast.success("Short link created!");
  toast.error("Failed to generate link.");
  toast.warning("This link will expire soon.");
  toast.info("Monthly stats updated.");
  ```

### B. Confirm/Cancel Action Popup Bar (`useConfirm()`)
- **Location**: `frontend/src/context/ConfirmContext.jsx`
- **Purpose**: Used whenever deleting records or performing dangerous / confirmation actions.
- **Usage**:
  ```javascript
  import { useConfirm } from "../context/ConfirmContext.jsx";
  const confirm = useConfirm();
  const isConfirmed = await confirm({
    title: "Delete Short Link?",
    message: "This action cannot be undone. Are you sure you want to delete this link?",
    confirmText: "Delete",
    cancelText: "Cancel",
    variant: "destructive" // "destructive" | "warning" | "primary"
  });
  ```

### C. Composable Card Shell (`Card.jsx`)
- **Location**: `frontend/src/components/atoms/Card.jsx`
- **Subcomponents**: `Card`, `CardHeader`, `CardTitle`, `CardDescription`, `CardContent`, `CardFooter`.
- **Usage**:
  ```jsx
  <Card>
    <CardHeader action={<Button size="sm">Action</Button>}>
      <CardTitle>Card Title</CardTitle>
      <CardDescription>Subtitle description text</CardDescription>
    </CardHeader>
    <CardContent>Content goes here</CardContent>
    <CardFooter>Footer meta text</CardFooter>
  </Card>
  ```

### D. Metric & KPI StatCard (`StatCard.jsx`)
- **Location**: `frontend/src/components/molecules/StatCard.jsx`
- **Usage**:
  ```jsx
  <StatCard title="Total Clicks" value="14,290" change="+18.4%" icon="ri-cursor-line" description="Across all shortened links" />
  ```

### E. Form Field & Input (`FormField.jsx`, `Input.jsx`)
- **Location**: `frontend/src/components/molecules/FormField.jsx`, `frontend/src/components/atoms/Input.jsx`
- **Usage**:
  ```jsx
  <FormField id="destination" label="Destination URL" placeholder="https://..." icon="ri-global-line" error={errorMsg} required />
  ```

### F. Empty State Shell (`EmptyState.jsx`)
- **Location**: `frontend/src/components/molecules/EmptyState.jsx`
- **Usage**:
  ```jsx
  <EmptyState icon="ri-inbox-line" title="No links found" description="Create your first link above." action={<Button size="sm">Create Link</Button>} />
  ```

### G. Utility Atoms (`Button.jsx`, `Badge.jsx`, `Kbd.jsx`, `CopyButton.jsx`, `ThemeToggle.jsx`, `Spinner.jsx`, `Modal.jsx`)
- **Button**: `primary`, `secondary`, `destructive`, `outline`, `ghost` variants with icon & loading support.
- **Badge**: `primary`, `neutral`, `success`, `error`, `warning`, `info` solid status badges.
- **Kbd**: Keyboard shortcut chip (`<Kbd>⌘K</Kbd>`).
- **CopyButton**: Single-click clipboard copy with instant visual checkmark and optional toast.
- **ThemeToggle**: Instant light/dark mode switcher.
- **Modal**: General popup dialog with header, scrollable body, and footer slots.

---

## 4. Token-Efficiency & Composition Rule (For AI & Developers)

To prevent verbose code generation and excessive token consumption:

1. **NEVER Re-invent Container Shells**:
   - **Do NOT** write 50-line raw `div` blocks with custom borders, padding, and text styling for cards, metric stats, forms, or empty states.
   - **ALWAYS** compose using `Card`, `StatCard`, `FormField`, and `EmptyState`.
2. **Declarative Brevity**:
   - New pages and sections should be composed declaratively in ~20 to 40 lines of clean JSX.
   - All visual styling, border colors, dark/light adaptations, and spacing are handled by the pre-made shells.
3. **Check Before Creating**:
   - Before writing any new UI element, inspect `frontend/src/components/` (`atoms/`, `molecules/`, `organisms/`).
   - If an element is needed a second time, extract it into a component immediately (The Rule of Two).

---

## 5. Frontend Directory Structure

```text
frontend/src/
├── components/
│   ├── atoms/
│   │   ├── Badge.jsx
│   │   ├── Button.jsx
│   │   ├── Card.jsx          # Composable card shell (Header, Title, Description, Content, Footer)
│   │   ├── Input.jsx         # Solid input atom
│   │   ├── Kbd.jsx           # Keyboard shortcut chip atom
│   │   ├── Spinner.jsx       # Spinning loader atom
│   │   └── ThemeToggle.jsx   # Light/dark mode toggle atom
│   ├── molecules/
│   │   ├── ConfirmModal.jsx  # Confirmation popup modal
│   │   ├── CopyButton.jsx    # 1-click clipboard copy with checkmark
│   │   ├── EmptyState.jsx    # Standard empty state shell
│   │   ├── FormField.jsx     # Label + Input + Error molecule
│   │   ├── Modal.jsx         # General dialog modal
│   │   ├── StatCard.jsx      # High-density KPI metric shell
│   │   └── Toast.jsx         # Notification toast item
│   └── organisms/
│       └── ToastContainer.jsx
├── context/
│   ├── ConfirmContext.jsx    # useConfirm() hook provider
│   ├── ToastContext.jsx      # useToast() hook provider
│   └── GlobalProvider.jsx    # Combined context wrapper
├── index.theme.css           # Concrete light/dark color definitions
└── index.css                 # Tailwind v4 theme mapping & base styling
```
