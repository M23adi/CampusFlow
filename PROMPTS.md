# Antigravity Agent Prompts — CampusFlow

Use these prompts in order. Each detailed prompt is in `prompts/` and is intended to be sent as a separate task to your Antigravity coding agent.

| Order | File | Purpose |
|---|---|---|
| 1 | `prompts/01-build-plan.md` | Make the agent read the specs and produce a plan before coding. |
| 2 | `prompts/02-build-foundation.md` | Create the app shell, design tokens, navigation, state, and safe local storage. |
| 3 | `prompts/03-build-dashboard-tasks.md` | Implement dashboard and task management. |
| 4 | `prompts/04-build-assignments-syllabus.md` | Implement assignments, courses, units, topics, and syllabus progress. |
| 5 | `prompts/05-build-timetable-timer.md` | Implement weekly timetable and focus timer. |
| 6 | `prompts/06-polish-test.md` | Add final visual polish, accessibility, data import/export, and QA. |

Use `prompts/07-fix-a-bug.md` any time a specific bug appears after a phase.

## General instruction to place before a task prompt

You are working inside the existing CampusFlow project. Read `memory.md`, `PRD.md`, `ARCHITECTURE.md`, `RULES.md`, and `DESIGN.md` before making changes. Inspect the current files first. Follow the current architecture and design. Use only HTML, CSS, and vanilla JavaScript; do not add frameworks, libraries, build tools, APIs, or a backend. Implement only the phase requested, preserve working behavior, test what you can, report what actually passed, and update `memory.md` with real changes and known limitations.

## Suggested usage

- Paste one prompt per agent task; do not ask the agent to build every feature in a single request.
- After each phase, run the site and try the acceptance checks before proceeding.
- If the agent starts rewriting everything, remind it to make the smallest focused change and preserve existing working files.
- Do not paste secrets or private student data into sample seed files. Keep demo content obviously fictional and easy to clear.
