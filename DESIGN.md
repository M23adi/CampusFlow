# Visual Design System

## 1. Design direction

**Mood:** Calm, modern, organised, slightly playful, and academically focused. Think premium student productivity app rather than a school management portal.

**Design keywords:** warm neutral canvas, deep ink text, restrained violet accent, crisp cards, generous whitespace, compact useful data, friendly status chips, clean line icons.

**Primary experience:** In a few seconds, a student should understand today's classes, the next deadline, and the best next action.

Avoid: dense spreadsheet-like tables as the default, tiny labels, too many colors, overdone gradients, heavy glassmorphism, unnecessary animations, and dashboards filled with numbers that do not guide action.

## 2. Design tokens

Create CSS custom properties in `:root`. Treat these as a starting palette and adjust only for demonstrated contrast/layout reasons.

```css
:root {
  color-scheme: light;
  --color-bg: #F6F7FB;
  --color-surface: #FFFFFF;
  --color-surface-soft: #F0F1F8;
  --color-text: #202238;
  --color-text-muted: #777B91;
  --color-border: #E5E7F0;
  --color-primary: #6558D9;
  --color-primary-hover: #5145C5;
  --color-primary-soft: #EEECFF;
  --color-success: #23856D;
  --color-success-soft: #E7F6F0;
  --color-warning: #A96B17;
  --color-warning-soft: #FFF4DF;
  --color-danger: #C64B59;
  --color-danger-soft: #FDECEF;
  --color-info: #3976B8;
  --color-info-soft: #EAF3FF;
  --shadow-card: 0 8px 24px rgba(35, 38, 75, 0.05);
  --shadow-popover: 0 16px 40px rgba(35, 38, 75, 0.14);
  --radius-sm: 10px;
  --radius-md: 16px;
  --radius-lg: 22px;
  --radius-pill: 999px;
  --space-1: 4px;
  --space-2: 8px;
  --space-3: 12px;
  --space-4: 16px;
  --space-5: 20px;
  --space-6: 24px;
  --space-8: 32px;
  --space-10: 40px;
  --sidebar-width: 248px;
  --content-max-width: 1440px;
  --font-sans: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
}
```

Use the system fallback even if an external font is not available. Never let missing network access break the layout.

## 3. Typography

- Page title: 28–32px, weight 700, tight but readable line height.
- Section title: 18–20px, weight 650–700.
- Card title: 15–17px, weight 600.
- Body: 14–16px, line height around 1.5.
- Metadata/labels: 12–13px, medium weight; do not use muted text for critical information.
- Timer digits: large, tabular numerals, visually stable width.
- Keep heading hierarchy consistent. Avoid using font size alone to communicate status.

## 4. App shell and layout

### Desktop (roughly 1024px and wider)

- Persistent left sidebar around 230–250px wide.
- App logo/wordmark at top; simple geometric mark plus “CampusFlow”.
- Navigation items with consistent line icons and clear active state.
- User/data/settings controls anchored toward the bottom of the sidebar where space permits.
- Main content fills remaining width, max-width roughly 1400px, with 28–36px outer padding.
- Dashboard uses a responsive grid with a clear hierarchy: greeting/header, summary cards, then timetable/deadlines/focus/syllabus cards.

### Tablet (around 768–1023px)

- Sidebar may collapse to a narrower icon rail only if tooltips/accessible labels exist; otherwise use a compact sidebar.
- Reduce grid columns and outer padding.
- Ensure card content does not become cramped.

### Mobile (below around 768px)

- Use a compact top bar and a bottom navigation bar or a simple slide-in navigation drawer.
- Main content padding around 16px.
- Summary cards can become a two-column grid or horizontal scroll only if the affordance is obvious; prefer wrapping instead of hidden overflow.
- Timetable should become a single-day agenda by default, with weekday tabs/buttons rather than trying to squeeze seven columns on a phone.
- Modals/forms should fit the viewport and allow scrolling.
- Keep key actions reachable by thumb; no hover-only actions.

## 5. Dashboard hierarchy

Suggested content order:

1. Header: “Good morning/afternoon/evening, [name]” and today’s date; primary CTA such as “Add task”.
2. Compact summary cards: tasks open, assignments due soon, focus time today, syllabus completion. Numbers must come from state.
3. Main row: Today’s timetable (larger card) and “Up next” or quick focus card.
4. Secondary row: Upcoming assignments/tasks and course syllabus progress.
5. A small helpful empty-state prompt if important data is missing.

Keep the most useful card dominant. Avoid making every card equally colorful. Use accent color sparingly for primary action, active navigation, focus progress, and key progress indicators.

## 6. Components

### Buttons

- Primary: violet fill, white text, medium/bold label, at least 42px high, 10–12px radius.
- Secondary: white/surface background with subtle border.
- Tertiary/ghost: no heavy border; use for low-emphasis actions.
- Destructive: restrained danger style; confirmation for irreversible operations.
- Icon-only: square/round control with accessible name and visible focus.

### Cards

- White surface, thin neutral border, 16–22px radius, subtle shadow.
- Padding 18–24px desktop; 16–18px mobile.
- Consistent header row: title, optional descriptive label, optional action.
- Cards should be easy to scan and must have a meaningful empty state.

### Status chips

Use both readable text and a subtle semantic tint:

- Not started/open: neutral gray.
- In progress: violet or blue.
- Completed/submitted: green.
- Due soon: amber.
- Overdue/error: red.

Do not rely only on the background color; include text or an icon with an accessible label.

### Forms

- Always-visible labels above inputs; placeholders are examples, not labels.
- Inputs around 44–48px high, clear border, obvious focused state.
- Group related fields and use short helper text only when needed.
- Inline validation appears near the field.
- Save and Cancel should be easy to find; avoid unclear icon-only form submission.

### Lists

- Provide distinct title, optional metadata, due date/status, and an obvious completion/action affordance.
- Use subtle dividers or spacing rather than borders around every nested element.
- Truncate only secondary metadata; allow titles to wrap.
- Make an appropriate section empty state when there is no data.

### Dialogs and toasts

- Dialog: focused panel, clear title, short description, visible close/cancel action, primary action placed consistently.
- Toast: concise success/error text, polite live announcement, disappears without blocking work; allow enough time to read.
- Avoid browser alerts for ordinary feedback.

### Icons

- Use a consistent family of simple outline icons built as inline SVG, with stroke width around 1.8–2.
- Preferred icons include home, checklist, book/open-book, calendar, clock, chart/progress, settings, plus, search, check, edit, trash, chevron, play, pause, rotate/reset.
- Do not use emoji as primary functional icons.
- Decorative icons must be hidden from assistive technologies; icon-only controls need accessible names.

## 7. Feature-specific design

### Tasks

- A clear “Add task” action near the header.
- Filters as compact tabs/pills: All, Open, Completed; search is easy to find.
- Show priority and due-date chips, but don't crowd the row.
- Completed tasks should appear visually quieter and be filterable.

### Assignments

- A deadline-forward list with due date, course, priority, and submission status.
- Overdue and due-soon labels should be easy to spot without turning the entire screen red.
- Add an optional compact “next deadline” emphasis on the dashboard.

### Syllabus

- Courses as cards or a clean list with a consistent color accent and completion bar.
- Inside a course, units expand/collapse; topic rows have accessible completion toggles.
- Course percentage must be computed from actual topics. If no topics exist, show “No topics added” rather than “0% complete” alone.

### Timetable

- On desktop, weekly grid with readable hours, day labels, and compact class blocks.
- On mobile, selected day and chronological agenda list.
- Use course accent colors subtly; text remains high contrast.
- Distinguish current/upcoming/finished sessions with label/text, not color alone.
- Add/edit class through a simple form with day, start/end, subject, room, and instructor.

### Focus timer

- Dedicated, calm focus card/page with a large central timer display.
- Use a circular progress ring via SVG or a clean progress bar.
- Primary action changes from Start to Pause/Resume as state changes.
- Display mode (“Focus”, “Short break”, “Long break”) clearly.
- Show a small total-focus-time stat and optionally the linked task.
- Reduced motion should disable animated ring transitions without stopping timer function.

## 8. Motion

- Use subtle transitions around 120–200ms for hover, focus, expand, and panel changes.
- Avoid parallax, bouncing, constant pulsing, and large animated gradients.
- Timer digits update with minimal jitter; don't animate each digit aggressively.
- Respect `prefers-reduced-motion: reduce` and remove nonessential transitions.

## 9. Responsive and accessibility rules

- Test 360px, 390px, 768px, 1024px, and 1440px widths.
- No page-wide horizontal overflow.
- Focus rings should be obvious, at least a 2px outline with a small offset.
- Ensure sensible contrast for muted labels, borders, badges, and buttons.
- Avoid controls smaller than around 44px where practical.
- Use semantic table markup if a true table is used; don't make visual grids inaccessible.
- Use `aria-current="page"` for active navigation where applicable and `aria-live` for dynamic messages.

## 10. Final visual quality bar

Before considering the design complete, inspect the actual rendered page at desktop and mobile widths. Fix alignment, clipping, inconsistent spacing, weak hierarchy, unreadable contrast, overflowing dialogs, tiny controls, and generic browser-default styling. A page that technically works but looks unfinished is not done.
