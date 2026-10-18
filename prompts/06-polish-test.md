# Prompt 06 — Final Polish, Responsive QA, and Data Safety

Read `memory.md`, `PRD.md`, `ARCHITECTURE.md`, `RULES.md`, and `DESIGN.md`. Inspect the complete implemented app before changing anything. This is a quality pass, not a redesign from scratch.

Audit and improve the whole app against the product and design specifications.

## Visual QA

- Inspect dashboard, tasks, assignments, syllabus, timetable, focus timer, and settings/data screens at approximately 360px, 390px, 768px, 1024px, and 1440px widths.
- Fix overflow, cramped cards, incorrect alignment, inconsistent spacing/type sizes, unreadable contrast, clipping, form/dialog overflow, tiny controls, and generic default browser styling.
- Verify desktop and mobile navigation states and active section styling.
- Use consistent buttons, status chips, forms, modal patterns, empty states, and icons.
- Respect reduced motion.

## Functional QA

- Verify every visible button, link, tab, input, form, filter, and menu item has real and correct behavior.
- Verify CRUD and persistence after refresh for each data type.
- Check first-use/demo-data/clear-data paths.
- Check task and assignment date edge cases, syllabus completion math, missing course associations, timetable overlaps, and timer lifecycle edge cases.
- Add JSON export/import/reset with validation and confirmation if not already present.
- Test malformed localStorage content, invalid import, storage-unavailable errors, and storage quota failure behavior where feasible.
- Remove dead controls, console errors, duplicated event listeners, fake counters, hardcoded derived values, and debugging output.

## Accessibility QA

- Check keyboard navigation, focus indicators, labels, icon-button names, modal focus/close behavior, live feedback announcements, and non-color-only statuses.
- Check reduced-motion handling and touch targets on mobile.

## Output

1. Make the fixes directly; don't only provide recommendations.
2. Run available checks and manually inspect the running app if possible.
3. Provide a concise QA checklist with Pass / Not tested / Needs attention states. Do not claim an item passes unless it was actually checked.
4. List known limitations and the exact command or method to run the static site.
5. Update `memory.md` with the final real status and remaining issues.
