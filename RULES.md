# Agent Rules — Read Before Every Coding Task

These rules are mandatory. When a prompt conflicts with this file, this file wins unless the user explicitly asks to change a rule.

## 1. Stack restrictions

1. Use **HTML, CSS, and vanilla JavaScript only**.
2. Do not add frameworks, libraries, TypeScript, JSX, Tailwind, Bootstrap, jQuery, npm dependencies, a package manager, a bundler, or a compilation step.
3. Do not add a backend, database, authentication, cloud sync, remote API, or API key.
4. Prefer browser-native APIs and inline SVG/CSS icons. Use a system font stack by default.
5. Keep the app runnable as a static site. Explain when ES modules require a local static server instead of `file://`.

## 2. Read the context first

- At the beginning of every new task, read `memory.md`, `PRD.md`, `ARCHITECTURE.md`, and `DESIGN.md` plus this file.
- Inspect the current project tree and relevant existing code before editing anything.
- Preserve already-working functionality and established design tokens.
- If a requirement is ambiguous but a safe sensible default is available, implement the default and document it in `memory.md`; do not block progress with unnecessary questions.

## 3. Work in small stages

- Implement only the phase requested by the current prompt.
- Before coding, briefly state which files you will inspect/change and the intended result.
- After coding, report changed files, behaviors implemented, checks run, and any known limitations.
- Do not claim tests passed unless they were actually run.
- Avoid rewriting every file to implement a small change.
- If the task is too large for one pass, finish a coherent, working slice before moving to another feature.

## 4. Code quality

- Use clear names and small functions with one responsibility.
- Separate DOM rendering, business logic, and storage access.
- Avoid magic numbers; use constants for timer presets, storage keys, and status values.
- Avoid duplicate logic and circular module imports.
- Use semantic HTML and meaningful headings.
- Prefer `const`; use `let` only when reassignment is necessary. Avoid `var`.
- Use strict comparisons (`===`) and handle missing/null values explicitly.
- Do not leave dead code, commented-out alternate implementations, fake controls, or `TODO` placeholders in finished user-facing features.
- Keep comments for useful reasoning or non-obvious behavior; do not narrate every line.

## 5. Safety and data correctness

- Treat user-entered text and imported JSON as untrusted data.
- Never use `eval`, `new Function`, or execute data as code.
- Never interpolate user text directly into `innerHTML`. Prefer DOM APIs and `textContent`.
- Validate required fields and ranges before saving.
- Catch JSON parsing, storage, and import errors; show useful feedback.
- Confirm destructive actions and state what dependent data will be removed.
- Do not fabricate saved data, counts, deadlines, progress, or successful timer sessions.
- Store one source of truth and calculate derived values such as percentages and dashboard totals.

## 6. Persistence rules

- Keep all app storage behind the storage module and one namespaced key, e.g. `campusflow.appState`.
- Use a schema version and safe load/default behavior.
- Persist user changes and timer lifecycle state that should survive a refresh.
- Detect storage failure where possible and tell the user rather than silently claiming data was saved.
- Export should be valid JSON. Import must validate shape and types before replacing current state.
- Provide a safe way to clear sample data or reset the app.

## 7. Date, timetable, and timer rules

- Date-only values use `YYYY-MM-DD` and local calendar arithmetic. Avoid timezone off-by-one errors.
- A task without a due date must not be treated as overdue.
- A due date today is not overdue until the local calendar day has passed, unless the product explicitly adds a due time.
- Validate timetable `endTime > startTime`; sort entries chronologically.
- Show overlaps as warnings instead of silently moving a class.
- Compute timer remaining time from timestamps to reduce interval drift.
- Do not record reset or skipped timer sessions as completed.
- Guard timer completion so a session is recorded at most once.

## 8. Visual consistency

- Follow `DESIGN.md` and use shared CSS tokens.
- Prioritise a polished, friendly student-product look, not a generic admin dashboard.
- Maintain consistent spacing, type scale, corner radii, shadows, buttons, form controls, badges, and empty states.
- Avoid emoji as the main icon system. Use consistent simple inline SVG icons or CSS shapes.
- Avoid excessive gradients, glassmorphism, neon colors, or motion.
- All controls must have visible hover/focus/disabled states.
- Do not ship horizontal overflow at small screen widths.
- Honor `prefers-reduced-motion`.

## 9. Accessibility and usability

- Use labels for inputs, accessible names for icon-only buttons, and semantic landmarks.
- Keyboard users must be able to reach and operate every action.
- Show clear validation messages and success/failure feedback.
- Color must not be the only way status is conveyed.
- Modals must close predictably and return focus to the triggering control.
- Keep touch targets comfortably usable on mobile, approximately 44px where practical.

## 10. Definition of finished

A feature is not finished merely because it looks correct. Confirm that:

- Its primary actions work.
- It handles empty and invalid inputs.
- It saves and reloads correctly.
- Related dashboard counts/progress refresh correctly.
- It works at narrow widths and with keyboard navigation.
- No obvious console errors were introduced.
- Relevant docs and `memory.md` reflect changes to architecture, data shape, or product decisions.
