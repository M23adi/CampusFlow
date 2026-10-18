# Prompt 03 — Dashboard and Tasks

First read `memory.md`, `PRD.md`, `ARCHITECTURE.md`, `RULES.md`, and `DESIGN.md`. Inspect the implemented app and preserve its existing layout and working code.

Implement the **Tasks** and **Dashboard** features end to end.

## Tasks

- Create `js/tasks.js` for rendering, form handling, search, filters, sorting, and actions.
- Allow adding/editing tasks with title, optional notes, optional due date, priority (low/medium/high), optional course association, and completion state.
- Support mark complete/incomplete and delete with confirmation.
- Add useful filters (All/Open/Completed) and search.
- Validate and trim title; show accessible inline errors and success feedback.
- Clearly distinguish due today, overdue, and undated tasks. An undated task is never overdue.
- Ensure all changes update central state, persist, and survive refresh.

## Dashboard

- Create `js/dashboard.js`.
- Build the greeting and local date, task summaries, tasks due today, upcoming assignments placeholder if assignments are not yet implemented, today's timetable preview, syllabus progress preview, and a visible focus timer entry point.
- For features not yet implemented, show a designed empty/setup state rather than fake data or fake controls.
- Dashboard counts and lists must derive from current saved state. Re-render dashboard information whenever relevant data changes.
- Include helpful first-use empty states with calls to action.

## Quality constraints

- Reuse app-shell styles, tokens, modal/form patterns, toasts, and safe storage/state helpers.
- Avoid duplicate document event listeners when rerendering.
- Use local-calendar date logic to avoid timezone bugs.
- Test adding, editing, completing, filtering, searching, deleting, refreshing, and empty states. Test a due date in the past, today, tomorrow, and a task without a due date.
- Do not implement assignments, syllabus, timetable, or timer logic in this step except their appropriate links/empty states.

Report exactly what was tested and update `memory.md` with progress and any changed decisions.
