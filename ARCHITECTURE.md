# Technical Architecture

## 1. Approach

Build CampusFlow as a **static, client-side single-page application** with one HTML entry point, one stylesheet, and multiple small JavaScript ES modules. Avoid frameworks and build steps. Keep the app easy for a beginner to read and easy for an AI coding agent to modify without breaking unrelated areas.

## 2. Proposed project structure

```text
campusflow/
├── index.html
├── README.md
├── PRD.md
├── ARCHITECTURE.md
├── RULES.md
├── DESIGN.md
├── memory.md
├── assets/
│   └── (optional local assets only; icons can be inline SVG)
├── css/
│   ├── styles.css          # global tokens, reset, layout, reusable components
│   ├── components.css      # cards, forms, buttons, dialogs, toasts, badges
│   └── responsive.css      # tablet/mobile behavior and reduced-motion rules
├── js/
│   ├── app.js              # app entry, initialisation, navigation, global events
│   ├── state.js            # in-memory state and safe state updates
│   ├── storage.js          # localStorage load/save/migrate/export/import/reset
│   ├── utils.js            # date, ID, escape, formatting, validation helpers
│   ├── ui.js               # shared rendering helpers, modals, toasts, empty states
│   ├── dashboard.js        # dashboard view and derived summaries
│   ├── tasks.js            # task list, form, filters, task actions
│   ├── assignments.js      # assignment list/forms/status and deadline helpers
│   ├── syllabus.js          # course/unit/topic management and progress calculations
│   ├── timetable.js        # weekly schedule management and current-day status
│   ├── timer.js             # focus timer lifecycle and session tracking
│   └── settings.js         # preferences and data-management UI
└── prompts/
    └── (the supplied agent prompts)
```

The agent may adjust file names slightly if a concrete browser compatibility reason requires it, but must preserve modular boundaries. Do not make a giant `app.js` containing all feature logic. Do not add files that merely duplicate existing responsibilities.

## 3. Runtime and browser assumptions

- `index.html` loads `css/styles.css`, `css/components.css`, and `css/responsive.css`.
- Use `<script type="module" src="./js/app.js"></script>` for ES modules.
- Do not use Node.js APIs in browser code.
- Some browsers restrict ES modules opened under `file://`. If module loading fails, test with a lightweight static local server. Do not introduce a bundler to solve this.
- JavaScript and storage must degrade gracefully when local storage is disabled.

## 4. Data model

Suggested versioned top-level storage object:

```js
{
  schemaVersion: 1,
  preferences: {
    userName: "",
    theme: "light",
    focusMinutes: 25,
    shortBreakMinutes: 5,
    longBreakMinutes: 15,
    useSampleData: true
  },
  tasks: [
    {
      id: "task_<unique-id>",
      title: "Review lecture notes",
      notes: "",
      courseId: "course_<unique-id-or-null>",
      dueDate: "2026-10-20",
      priority: "medium",
      completed: false,
      createdAt: "2026-10-18T08:30:00.000Z",
      completedAt: null
    }
  ],
  assignments: [
    {
      id: "assignment_<unique-id>",
      title: "Data Mining assignment",
      courseId: "course_<unique-id>",
      dueDate: "2026-10-24",
      priority: "high",
      status: "in-progress",
      notes: "",
      createdAt: "2026-10-18T08:30:00.000Z"
    }
  ],
  courses: [
    {
      id: "course_<unique-id>",
      name: "Data Mining",
      code: "DM",
      color: "violet",
      units: [
        {
          id: "unit_<unique-id>",
          title: "Introduction",
          topics: [
            { "id": "topic_<unique-id>", "title": "Overview", "completed": true }
          ]
        }
      ]
    }
  ],
  timetable: [
    {
      id: "class_<unique-id>",
      courseId: "course_<unique-id-or-null>",
      subjectName: "Data Mining",
      dayOfWeek: 1,
      startTime: "09:00",
      endTime: "10:00",
      room: "Lab 2",
      instructor: ""
    }
  ],
  focusSessions: [
    {
      id: "focus_<unique-id>",
      startedAt: "2026-10-18T08:30:00.000Z",
      completedAt: "2026-10-18T08:55:00.000Z",
      durationMinutes: 25,
      mode: "focus",
      taskId: null,
      courseId: null,
      completed: true
    }
  ],
  timerState: {
    mode: "focus",
    status: "idle",
    durationSeconds: 1500,
    endsAt: null,
    startedAt: null,
    linkedTaskId: null,
    linkedCourseId: null
  }
}
```

This is a guide, not a reason to copy the sample dates literally. Use actual values for the current day when generating sample records. Keep date-only values such as due dates in `YYYY-MM-DD` form. Store actual event timestamps as ISO strings.

### Data integrity rules

- IDs must be unique and generated via `crypto.randomUUID()` where available, with a safe fallback.
- Store course associations as IDs, not duplicated course objects. If a course is deleted, clearly handle orphaned references (e.g. set affected references to `null` or remove dependent data after confirmation).
- Always validate data loaded from storage; `JSON.parse` can throw and stored data may be malformed.
- Use a storage schema version and a small migration function.
- Saving should be centralised rather than reimplemented differently in every module.
- Use one source of truth in application state; views should derive counts and progress instead of maintaining duplicate totals.

## 5. Responsibilities and dependency direction

- `storage.js`: the only module that directly reads/writes the app's `localStorage` key. It should expose `loadState`, `saveState`, `exportState`, `validateImportedState`, `importState`, and `resetState` or equivalent functions.
- `state.js`: owns current in-memory data and safe update/notification mechanisms. Feature modules request state changes through defined functions rather than mutating random global variables.
- `utils.js`: pure helpers for date-only parsing, local date keys, display formatting, time comparisons, ID generation, and safe text handling.
- Feature modules: own forms and rendering for their section, and call shared state/storage/UI helpers. They should not maintain duplicate task/course data.
- `ui.js`: reusable toasts, confirmation dialog, form errors, empty states, and safe DOM helpers.
- `app.js`: initialises storage and state, registers navigation and global listeners, displays the default dashboard, and coordinates rerendering.

Keep imports flowing toward shared utility/state modules. Avoid circular imports. If a circular dependency starts to appear, move the shared function into `ui.js`, `utils.js`, or a small coordination function in `app.js`.

## 6. Rendering strategy

Use simple DOM APIs and predictable rendering:

- Render each section through a clear function such as `renderDashboard(root, state)`.
- Use `document.createElement`, `textContent`, and explicit event listeners for user-provided content. Do not inject raw user data into `innerHTML`.
- If a template string is used for fixed markup, user-provided strings must be inserted safely; prefer DOM construction over escaping manually.
- After a successful mutation: update state, save, then rerender the affected section and any visible dashboard summaries.
- Keep event handling local to section containers or use small event delegation handlers. Do not attach duplicate document-level handlers on every render.
- Preserve keyboard focus where practical after form submission or modal close.

## 7. Date and time handling

- For a due date like `2026-10-20`, parse the year/month/day components and use local calendar-date arithmetic. Avoid `new Date("YYYY-MM-DD")` where UTC parsing can display the previous local day in some time zones.
- For “days left,” compare normalised local dates at midnight or compare date-only integer values. Do not round differences between arbitrary timestamps.
- Timetable entries use weekday numbers consistently: `0 = Sunday`, `1 = Monday`, …, `6 = Saturday` (or document a different scheme and apply it everywhere).
- For current class status, compare the current local weekday and `HH:mm` values consistently.
- For a running timer, save the exact `endsAt` timestamp. Update the display from the current time minus `endsAt`, not by assuming every interval tick fired on time.

## 8. Timer state lifecycle

Suggested states:

- `idle`: not started.
- `running`: an `endsAt` timestamp is available.
- `paused`: remaining seconds are saved; `endsAt` is cleared.
- `completed`: the session has been finalised once.

Transitions:

- Start: set `startedAt`, set `endsAt = Date.now() + remainingSeconds * 1000`, set status `running`.
- Pause: calculate remaining time from `endsAt - Date.now()`, set status `paused`, clear `endsAt`.
- Resume: set new `endsAt` from saved remaining seconds.
- Reset/skip: cancel current run and do **not** log a completed session.
- Natural finish: guard against duplicate completion, log one completed session, then set status to `completed` or offer the next mode.
- On tab visibility change and app initialisation: recalculate whether the end timestamp has passed.

## 9. Interaction patterns

- Use one consistent modal or inline form pattern for add/edit actions.
- Forms should prefill existing data during edit and have clear Cancel/Save actions.
- Confirm irreversible operations such as deleting a course with nested topics or resetting all data.
- Toast feedback should use a live region where appropriate (`role="status"` or `aria-live="polite"`).
- Do not use browser `alert()` or `prompt()` for ordinary app flows; a native `confirm()` is a fallback only if no accessible in-app dialog is implemented.

## 10. Error handling and testing

Test at minimum:

- First launch with no existing storage.
- Launch with valid saved data.
- Malformed local storage JSON and an older schema version.
- localStorage unavailable or quota exceeded.
- Empty tasks/assignments/courses/timetable.
- Due date today, tomorrow, and in the past.
- Assignment with a deleted/missing course.
- Timetable overlap and invalid end time.
- Timer pause/resume, reset, natural completion, refresh while running, and tab return after the timer should have ended.
- Import malformed JSON, wrong schema, and valid export reimport.
- Mobile navigation, keyboard focus, and long text.

No test runner is required for v1. Use a documented manual QA checklist and console checks. Pure date/progress helpers should be written in a way that is easy to test independently.
