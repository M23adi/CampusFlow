# Prompt 04 — Assignments and Syllabus Progress

Read `memory.md`, `PRD.md`, `ARCHITECTURE.md`, `RULES.md`, and `DESIGN.md` first. Inspect the current implementation and preserve existing behavior.

Implement the **Assignments** and **Syllabus** areas fully, integrating them with the existing dashboard and storage model.

## Assignments

- Create `js/assignments.js`.
- Fields: title (required), course (required; guide the user to create a course if none exists), due date (required for v1), priority, status (`Not started`, `In progress`, `Submitted`), and optional notes.
- Add/edit/delete with confirmation, search and filters by status/course, and nearest-deadline sorting.
- Show days remaining, due-today, and overdue states using local calendar dates. Keep overdue assignments visible.
- Keep assignments separate from general tasks; do not auto-create duplicated tasks.
- Update dashboard deadline cards and counts from stored assignment data.

## Syllabus

- Create `js/syllabus.js`.
- Let the user add/edit/delete a course with name and optional short code/color.
- Let the user add/edit/delete units and topics inside a course. Include topic completion toggles.
- Calculate unit, course, and overall syllabus progress from actual topic completion state.
- Provide expand/collapse for units if practical and clear empty states when there are no courses, units, or topics.
- Confirm destructive actions when deleting nested data and explain the impact.
- Keep course references for tasks, assignments, and timetable robust if a course is renamed or removed.

## Quality constraints

- Reuse shared form, modal, status, toast, and card components.
- Store course relationships as IDs and validate before saving.
- Don't store redundant percentage values that can become stale.
- Ensure dashboard progress and deadline summaries update after mutations.
- Test valid/invalid forms, no-course behavior, empty courses, course/unit/topic deletion, completion math (including 0 topics), search/filters, persistence after refresh, and orphaned references.

Update `memory.md` with actual status and any model changes. Report checks honestly.
