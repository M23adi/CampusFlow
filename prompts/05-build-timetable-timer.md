# Prompt 05 — Timetable and Focus Timer

Read `memory.md`, `PRD.md`, `ARCHITECTURE.md`, `RULES.md`, and `DESIGN.md` before coding. Inspect all existing related code and preserve completed features.

Implement the **Timetable** and **Focus** features with real behavior.

## Timetable

- Create `js/timetable.js`.
- Support adding/editing/deleting classes with subject/course, day of week, start time, end time, optional room, and optional instructor.
- Use one weekday convention consistently (`0 = Sunday` through `6 = Saturday`).
- Validate that end time is after start time; warn about same-day overlaps and let the user confirm if they intentionally keep them.
- Sort by start time. Highlight today's day and identify sessions as upcoming, ongoing, or finished using local time.
- On desktop, use a readable weekly view if suitable; on mobile, use a selected-day agenda. Never force a seven-column grid into a narrow phone screen.
- Update the dashboard's “today” schedule from saved data.

## Focus timer

- Create `js/timer.js`.
- Implement focus (default 25 min), short break (5 min), and optional long break (15 min) modes.
- Provide Start, Pause, Resume, Reset, Skip/End, and duration controls with correct enabled states.
- Show remaining time, current mode, and a progress ring/bar. Offer a linked task/course only if linking can be done cleanly with the existing model.
- Persist state using an end timestamp so timer accuracy does not depend on every interval callback firing. Recalculate when the tab becomes visible and on app initialisation.
- Record a completed session only once when it naturally reaches zero. Reset or skip must not create a completed session.
- Add daily focus-time summary and a small session-history view/list.
- If browser notification permission is implemented, request it only following an explicit user action; do not make notifications necessary for timer operation.

## Quality constraints

- Do not break tasks, assignments, course progress, or dashboard rendering.
- Test all timer transitions, page refresh during a run, return after a backgrounded tab, timer completion, reset/skip not logging a completed session, timetable sorting, invalid time ranges, overlaps, and mobile agenda view.
- Avoid stale intervals or multiple interval loops. Clean them up on rerender/unmount-style transitions.
- Update `memory.md` with the real status and architecture changes.
