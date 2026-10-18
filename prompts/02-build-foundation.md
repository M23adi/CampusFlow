# Prompt 02 — Build the App Foundation

Read `memory.md`, `PRD.md`, `ARCHITECTURE.md`, `RULES.md`, and `DESIGN.md` first. Inspect the current project before editing it.

Implement only the foundation of CampusFlow:

- Create `index.html` and the CSS files in the architecture document.
- Create `js/app.js`, `js/state.js`, `js/storage.js`, `js/utils.js`, and `js/ui.js` with clean module boundaries.
- Build a polished responsive application shell, CampusFlow wordmark, desktop navigation, mobile navigation, page header, reusable cards/buttons/forms, toast/status region, and modal/confirmation pattern.
- Establish the design tokens from `DESIGN.md`.
- Implement safe versioned localStorage loading/saving, defaults, malformed-data fallback, unique ID generation, and clearly marked removable sample data.
- Add navigation between all primary views, with clearly designed initial placeholder/empty states for features that will be built in later stages. Placeholders must not look like functional controls if they do nothing.
- Make the Dashboard the default view.

Constraints:

- Use only HTML, CSS, and vanilla JavaScript. No libraries, APIs, backends, build tools, or frameworks.
- Keep user text safe; prefer DOM methods and `textContent` over injecting content through `innerHTML`.
- Make navigation keyboard accessible and mobile-friendly.
- Avoid implementing feature modules beyond minimal scaffolding in this phase.

At the end, run the checks available in this environment. Report files changed, how to launch/test the static app, and any known limitations. Update `memory.md` with actual implementation status. Do not claim a feature works unless it has been implemented and checked.
