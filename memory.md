# CampusFlow — Project Memory

> Read this at the start of every new agent task. Update it when important project decisions or current implementation status changes.

## Product in one paragraph

CampusFlow is a polished, responsive college-student productivity web app. It brings together a personal dashboard, to-do tasks, assignment deadlines/status, course syllabus progress (courses → units → topics), daily/weekly timetable, and a focus timer. It should help a student decide what to do next without feeling cluttered or stressful.

## Non-negotiable constraints

- HTML, CSS, vanilla JavaScript only.
- No frameworks, external JS libraries, TypeScript, npm, bundlers, backend, logins, cloud sync, or API keys.
- Static-site app; browser `localStorage` is the persistence layer.
- Use ES modules if supported by the project structure; test with a simple local static server if `file://` blocks module imports.
- Use no external dependency for icons; prefer inline SVG/CSS and system fonts.
- Use semantic, accessible HTML and responsive CSS.
- Do not inject user-supplied text into `innerHTML`; prefer `textContent` and DOM methods.
- All visible primary controls must work; do not leave fake buttons or placeholder feature cards.

## Visual direction

- Working name: CampusFlow.
- Mood: calm, modern, friendly, organised, premium student productivity tool.
- Palette: warm/cool off-white canvas, white cards, deep ink text, muted secondary text, restrained violet primary accent, semantic green/amber/red states.
- Rounded cards around 16–22px, thin borders, subtle shadows, readable spacing, consistent outline icons.
- Desktop: left navigation sidebar and content grid. Mobile: compact top bar plus bottom nav/drawer and single-day timetable agenda.
- Avoid generic admin-template styling, excessive gradients, emoji icons, clutter, or too many bright colors.
- Refer to `DESIGN.md` for exact tokens and component guidance.

## Main features

1. Dashboard: greeting/date, task summary, timetable today, tasks and assignments due soon, syllabus progress, focus timer shortcut.
2. Tasks: create/edit/delete/complete, priority, optional due date/course, notes, search and filters.
3. Assignments: course, required due date, priority, notes, statuses (Not started / In progress / Submitted), deadline/overdue state.
4. Syllabus: courses, units, topics, topic completion, calculated unit/course/global progress.
5. Timetable: weekly days, start/end time, course/subject, room, instructor, overlap warnings, current-day agenda.
6. Focus timer: 25-minute focus default, 5-minute short break, optional 15-minute long break; start/pause/resume/reset/skip; custom duration; safe completion logging; restore/recalculate running state using an end timestamp.
7. Data/settings: local persistence, JSON export/import with validation, reset with confirmation, optional user name and timer settings.

## Data and correctness decisions

- Keep app state in one versioned object behind a storage module.
- Store date-only values as `YYYY-MM-DD`; use local calendar-date logic to avoid UTC/timezone off-by-one bugs.
- Store event times as ISO timestamps.
- A task without a due date is not overdue.
- Syllabus completion is derived from completed topics; do not manually store percentage values.
- Keep assignments and tasks as separate entities; do not silently duplicate an assignment into tasks.
- Store course references by ID; handle deleted courses and orphaned links safely.
- Timer remaining time is derived from `endsAt`; don't rely only on decrementing a counter every second.
- Reset/skip is not a completed focus session; guard against duplicate session logging.
- First-launch sample data must look like demo data and be removable.

## Architecture snapshot

Expected files:

- `index.html`
- `css/styles.css`, `css/components.css`, `css/responsive.css`
- `js/app.js`, `state.js`, `storage.js`, `utils.js`, `ui.js`, `dashboard.js`, `tasks.js`, `assignments.js`, `syllabus.js`, `timetable.js`, `timer.js`, `settings.js`
- `PRD.md`, `ARCHITECTURE.md`, `RULES.md`, `DESIGN.md`, `memory.md`

Keep feature logic modular. `storage.js` is the only module that directly talks to localStorage. Reuse UI patterns and tokens. Avoid circular imports and giant functions.

## Agent workflow

1. Read `memory.md`, `PRD.md`, `ARCHITECTURE.md`, `RULES.md`, and `DESIGN.md` first.
2. Inspect actual files before editing.
3. Work in small phases from `prompts/`; do not try to implement the whole product in one huge output.
4. Preserve working features and current visual design.
5. After each change, run checks available in the environment and report honestly what was or was not tested.
6. Update this file when architecture/data model/feature status changes.

## Current implementation status

**Complete MVP Built & Verified (2026-10-18):**
- Foundation: `index.html`, `css/styles.css`, `css/components.css`, `css/responsive.css`, `js/app.js`, `js/state.js`, `js/storage.js`, `js/utils.js`, `js/ui.js` implemented with clean vanilla ES modules.
- Dashboard: Live greeting, date, 4 stat summary cards, today's schedule agenda, tasks due today, next deadlines, and syllabus progress bars all dynamically derived from central state.
- Tasks: Full CRUD with modal form validation, course tagging, priority chips, due date badges (today, overdue, future, undated), search, and tabbed status filters (Open / All / Completed).
- Assignments: Coursework tracker with nearest-deadline sorting, due date calculation via local calendar dates, course association, status toggling (Not started / In progress / Submitted), and modal editing.
- Syllabus: Courses -> Units -> Topics hierarchy, unit expand/collapse accordions, topic completion checkboxes, unit/course/global % coverage math, and safe cascading course deletion.
- Timetable: Weekly schedule with Mon-Sun weekday navigation, chronological agenda view, start/end time validation (`endTime > startTime`), same-day overlap detection/warning, and current session highlighting.
- Focus Timer: Pomodoro & deep study modes (25m Focus, 5m Short Break, 15m Long Break), circular SVG progress ring, drift-free `endsAt` timestamp countdown that survives tab throttling, offline Web Audio chime, and duplicate-safe session logging.
- Preferences & Data: Light and Dark theme switching, JSON export and import with strict schema validation, reset to clean blank slate, and reload demo content.
- Browser Verification: End-to-end verified with browser subagent across all views with interactive creation, status toggles, countdown validation, and zero console errors.

**Study Tracking & Interactive Enhancements (2026-10-18):**
- Comprehensive Study Session Tracking & Analytics:
  - Centralized study sessions log in state (`focusSessions`) storing timestamp, duration minutes, subject/course, and notes.
  - Analytics calculations in `state.js` (`getStudyStats()`): consecutive daily study streak (`🔥`), total all-time focus hours, total sessions count, last 7-day daily study minutes, and subject time distribution.
  - Focus & Study Hub (`js/timer.js`): 3 sub-tabs for "⏱️ Live Timer", "📊 Study History & Analytics", and "🎧 Study Ambience".
  - Interactive HTML/CSS 7-day bar chart showing study minutes per day and course distribution percentage progress bars.
  - Full past session history log with deletion and manual retrospective logging modal (`+ Log Past Session`).
- Assignment Due Date Reminders & Alerts:
  - Calendar-day deadline calculation in `state.js` (`getAssignmentAlerts()`): categorizes overdue, due-today, due-tomorrow, and upcoming assignments with days remaining.
  - Urgent reminder banner prominently displayed at top of Dashboard with color-coded urgency and quick-access view buttons.
  - Notification Bell in desktop sidebar header and mobile topbar with a pulsing badge counter (`.pulse-badge`) showing urgent deadline count.
  - Interactive Reminders Modal (`openRemindersModal()`) offering one-click direct access to assignments and status completion.
- Interactive Study Aesthetic & Emojis:
  - Academic study emojis integrated throughout navigation, page headers, cards, status badges, and action buttons.
  - "Daily Study Spark" motivation widget with interactive "🎲 New Tip" quote generator.
  - Native Web Audio ambient sound synthesizer (rain, pink focus noise, campfire library) running completely offline with volume controls.
  - Zero-dependency HTML5 Canvas celebration confetti animation (`triggerConfetti()`) on task completion, assignment submission, and syllabus unit completion.

**AI Academic Doubt Solver Integration (2026-10-18):**
- Google Gemini AI Doubt Solver (`js/doubts.js`, `#doubts`):
  - Powered by Google Gemini 2.5 Flash (`models/gemini-2.5-flash:generateContent`) with fallback to `gemini-flash-latest`.
  - Configurable API key stored in `localStorage` under `state.preferences.geminiApiKey`, pre-configured with the student's key.
  - Academic study modes: 💡 Concept Explanation, 📝 Step-by-Step Solution, 💻 Code & Debugging, 🎯 Practice Quiz & Flashcards.
  - Course-aware context: optional linking to the student's active courses (*Data Mining*, *Computer Networks*, etc.) to tailor answers.
  - Starter prompt chips for quick academic exploration.
  - Formatted markdown rendering for headers, bold terms, bullet lists, inline code, and multi-language syntax blocks.
  - One-click copy code button (`📋 Copy`) and full answer copy (`📋 Copy Answer`).
  - One-click **"➕ Add to Tasks"** button that converts any AI solution directly into a CampusFlow to-do task.
- Google Gemini AI Configuration in Settings (`js/settings.js`):
  - API key input with show/hide password toggle.
  - Model selector dropdown (`gemini-2.5-flash`, `gemini-flash-latest`, `gemini-2.5-pro`).
  - Live "⚡ Test Connection" ping testing API connectivity in real time.
  - "Restore Default Key" button.

## Decisions / unresolved items

- Implemented both Light and Dark mode options with full design token support.
- Root launcher `index.html` added at workspace root for convenient one-click launching.
- Static server running on port 8085 for testing (`python -m http.server 8085`).

## Change log

- 2026-10-18: Completed all 6 MVP build stages. Generated full frontend app, validated via headless browser subagent, verified responsive styles, accessibility landmarks, and storage safety.
- 2026-10-18: Added Study Session Tracking (all-time history, 7-day bar chart, subject breakdown, manual session logger), Assignment Due Reminders (urgency banner, notification bell with pulse badge, interactive reminders modal), Web Audio ambient study sound synthesizer, and Canvas celebration confetti.
- 2026-10-18: Added AI Academic Doubt Solver powered by Google Gemini 2.5 Flash with course context filtering, study modes, multi-turn chat, markdown rendering, 1-click task conversion, and Settings API key tester.

