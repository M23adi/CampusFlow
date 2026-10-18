# Product Requirements Document (PRD)

## 1. Product summary

**Product name:** CampusFlow (working name)

**One-line pitch:** A calm, all-in-one college planner that brings daily tasks, assignment deadlines, syllabus progress, class timetable, and focus sessions into one student-friendly dashboard.

**Problem:** College students often keep tasks, assignment deadlines, course topics, and class schedules in different places. They need one fast, visually clear workspace that answers: “What do I have today?”, “What is due next?”, “How much syllabus have I covered?”, and “Can I focus for the next 25 minutes?”

**Product objective:** Build a polished, responsive single-page web app that helps a student organise academic life with minimal setup and no account or server.

## 2. Target user

A college student managing several subjects, weekly lectures, assignments, and exam preparation. They may be using the app between classes on a phone or while studying on a laptop. The interface should be welcoming to a first-time user and must not require technical knowledge.

## 3. Platform and constraints

- Use only semantic HTML, CSS, and vanilla JavaScript.
- No React, Vue, Angular, TypeScript, Tailwind, Bootstrap, jQuery, bundlers, npm packages, backend, or database.
- No API keys, login, cloud sync, or third-party services.
- Use `localStorage` for persistence and browser-native APIs only.
- The project must run as a static website. Prefer a simple `index.html` entry point.
- External fonts and icon libraries are not required. Use a system font stack and inline SVG/CSS icons.
- Core functionality must remain available offline after the files have loaded.

## 4. Core product principles

1. **Today first:** The dashboard should make the day's schedule and next actions visible immediately.
2. **Low friction:** Creating, editing, completing, and deleting an item should take only a few clear actions.
3. **Progress over pressure:** Show achievable next steps and progress without excessive warning colors or gamification.
4. **One coherent system:** Tasks, assignments, courses, syllabus topics, timetable sessions, and focus sessions should be connected where useful.
5. **Honest data:** Clearly label demo data; never imply that demo assignments or classes are the user's real schedule.
6. **Resilient by default:** Validate inputs, handle empty states, confirm destructive actions, and avoid losing data on ordinary refreshes.

## 5. Information architecture

Primary sections in the app shell:

- **Dashboard** — today's overview, timetable preview, upcoming deadlines, task summary, syllabus snapshot, and focus timer entry point.
- **Tasks** — to-do list with filters, priority, due date, subject/course, and completion status.
- **Assignments** — coursework tracker with subject, due date, priority, status, notes, and days remaining/overdue.
- **Syllabus** — courses, units/modules, topics, and completion progress.
- **Timetable** — weekly class timetable by weekday and time.
- **Focus** — focus timer with session history or today's focus total.
- **Settings / Data** — profile display name (optional), preferred timer duration, theme if implemented, export data, import data, and reset demo/app data.

Navigation may be a left sidebar on desktop and a compact sidebar/drawer or bottom navigation on mobile. Keep the number of primary destinations manageable.

## 6. Functional requirements

### 6.1 Dashboard

The dashboard must show:

- Greeting using the user's local time and optional editable name.
- Current date and weekday, formatted for the user's locale.
- A small summary of tasks: total open, completed today, and overdue where applicable.
- Today's timetable in chronological order, including current/upcoming class state where it can be determined locally.
- Tasks due today and assignments due soon, ordered by urgency.
- A syllabus progress snapshot for active courses.
- A prominent focus timer card or quick-start button.
- Clear empty states with actions, e.g. “Add your first task” or “Set up your timetable.”

The dashboard must be derived from the app's saved data, not hard-coded counts.

### 6.2 Tasks

Users can:

- Create a task with title (required), due date (optional), priority (low/medium/high), course (optional), notes (optional), and status.
- Edit a task, mark it complete/incomplete, and delete it after confirmation.
- Filter tasks by all/open/completed and optionally by priority or course.
- Search task titles and notes.
- Sort by due date or priority; tasks without dates should not appear incorrectly overdue.
- See overdue, due-today, and completed states through both text and styling—not color alone.

Validation: trim titles; reject empty titles; show inline feedback; do not create duplicate accidental submissions from a double click.

### 6.3 Assignments

Each assignment supports:

- Title (required), course (required or clearly prompted if no course exists), due date (required for the initial version), priority, status (`Not started`, `In progress`, `Submitted`), and optional notes/instructions.
- Create, edit, update status, search/filter, and delete with confirmation.
- List and dashboard ordering by nearest deadline, while overdue items remain visible.
- A clear days-left or overdue label. Calculate date-only differences using calendar dates, not millisecond rounding that can shift by timezone.
- Assignment status and task status are separate concepts. Do not silently create duplicate tasks when an assignment is created.

### 6.4 Syllabus tracker

Users can:

- Create and edit a course/subject, including a name and optional short code/color.
- Add, edit, reorder if practical, and delete units/modules for a course.
- Add topics under each unit; each topic has a title and a completion toggle. A topic may optionally have a status such as `Not started`, `In progress`, or `Done` if this can remain simple.
- See completion percentage for a unit and course, computed as completed topics divided by total topics.
- See a global progress snapshot on the dashboard.
- Distinguish an empty course from a course with 0% completion.
- Confirm deletion of a course/unit when nested data will also be removed. Tell the user what will be deleted.

Progress should be calculated from topic state, not manually typed percentages.

### 6.5 Daily / weekly timetable

Users can:

- See Monday through Sunday, with a clear selected-day view and an easy way to switch days.
- Add, edit, and delete a class session with subject/course, day of week, start time, end time, room/location (optional), and instructor (optional).
- Sort sessions by start time.
- Validate that end time is after start time. Warn about overlapping sessions on the same day, but allow the user to keep an overlap after confirmation if appropriate.
- Highlight today's column/day, and identify a class as upcoming, ongoing, or finished using local time.
- Show a useful no-classes state for an empty day.
- Avoid assuming a session is a real class merely because demo data is present.

### 6.6 Focus timer

Must include a working focus timer with:

- Default preset: 25 minutes focus, 5 minutes short break, optional 15-minute long break.
- Start, pause, resume, reset, and skip/end controls with unambiguous labels.
- Ability to set a custom duration within sensible bounds, e.g. 1–180 minutes.
- Clear display of remaining time and current mode.
- A progress ring or progress bar that updates smoothly enough without excessive DOM work.
- Completion feedback using an in-app notification and optional gentle browser notification only after a user gesture and permission; the timer must still work if notification permission is denied.
- Record completed focus sessions with timestamp, duration, and optional linked task/course. Count only completed sessions toward total focus time unless the UI explicitly labels partial sessions.
- Timer should not drift badly when a browser tab is throttled. Compute remaining time from an end timestamp rather than subtracting one second on every interval tick. Recalculate after `visibilitychange`/tab return.
- If the page reloads during a running session, restore the running timer state safely or explain that it was interrupted. Prefer persisting an end timestamp and session mode.

A timer must never claim a session completed when it was merely reset or skipped.

### 6.7 Data and settings

- Persist user-created data and preferences using `localStorage`.
- Use a versioned storage shape and handle malformed or obsolete data gracefully.
- Include export-to-JSON, import-from-JSON with validation, and reset-data actions. Confirm before destructive reset/import replacement.
- Never use `eval` or execute imported values as code.
- Import validation must check the expected schema before replacing current data.
- Include clear demo/reset behavior; first launch may pre-populate a small sample set, but clearly label the content as sample data and provide a way to clear it.
- If storage is unavailable or full, show a friendly warning rather than silently acting as though data was saved.

### 6.8 Feedback and accessibility

- Use inline form validation and toast/status messages for successful and failed actions.
- Modal/dialogs must be keyboard accessible, have a clear close control, and not trap users accidentally.
- Buttons and inputs need visible labels or accessible names.
- Use semantic landmarks and logical heading levels.
- All interactive controls must be keyboard accessible with visible focus indicators.
- Respect `prefers-reduced-motion`.
- Meet practical WCAG AA color contrast where feasible; never rely on color alone to communicate status.

## 7. Non-functional requirements

- Responsive at approximately 360px, 768px, 1024px, and 1440px widths.
- Initial load should be lightweight; no network dependency is necessary for core use.
- No uncaught console errors during normal flows.
- JavaScript should be separated into understandable modules/functions with consistent naming.
- Avoid repeated global event handlers, large monolithic functions, magic values, and duplicated business logic.
- Layout should avoid horizontal overflow on small screens.
- App should remain usable with empty datasets and with long titles/course names.

## 8. Out of scope for v1

- Multi-device/cloud synchronisation and account login.
- Push notifications or server-side reminders.
- AI-generated schedules or automatic syllabus imports.
- Shared calendars, collaboration, faculty portals, and LMS integrations.
- Native mobile application or installable PWA unless requested later.
- Attachments/uploads or file storage.

## 9. MVP acceptance checklist

- [ ] App opens as a static site using HTML/CSS/vanilla JS only.
- [ ] Dashboard values update when saved data changes.
- [ ] Tasks can be added, edited, searched, filtered, completed, deleted, and persisted after refresh.
- [ ] Assignments show correct status and due-date state, including overdue dates.
- [ ] Courses, units, and topics can be managed; syllabus progress is calculated correctly.
- [ ] Timetable sessions can be managed and display in the correct day/time order.
- [ ] Timer start/pause/resume/reset works; completion is recorded only once; return-from-background time is recalculated.
- [ ] Export/import/reset each works and has safe confirmation/validation.
- [ ] All buttons/links have real behavior—no placeholder controls.
- [ ] Empty states, error states, and validation messages are present.
- [ ] Keyboard interaction, focus states, labels, and reduced-motion preferences are supported.
- [ ] Mobile view has no horizontal overflow and main flows work on touch-sized controls.
- [ ] No framework or external runtime dependency was added.

## 10. Suggested implementation phases

1. Project scaffold, shared layout, tokens, navigation, storage layer, and seed data.
2. Tasks and dashboard derived from persisted data.
3. Assignments and due-date logic.
4. Courses, units, topics, and syllabus progress.
5. Weekly timetable.
6. Focus timer and session history.
7. Export/import/reset, accessibility, responsive polish, and manual QA.
