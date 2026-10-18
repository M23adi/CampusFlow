# Prompt 07 — Fix a Bug Without Breaking Other Features

Read `memory.md`, `RULES.md`, and the relevant parts of `PRD.md`, `ARCHITECTURE.md`, and `DESIGN.md` first.

Bug report:
**[Describe the exact problem here, including steps to reproduce and expected vs actual behavior.]**

Work carefully:

1. Reproduce the issue or inspect enough code/logs to identify a grounded cause. Do not guess and immediately rewrite large files.
2. Identify the smallest set of files responsible.
3. Explain the likely root cause briefly, then make a focused fix.
4. Preserve existing visual design, data model, and working features. Do not add a library/framework or backend.
5. Add validation or regression protection where appropriate.
6. Test the original reproduction path plus adjacent edge cases and at least one unrelated core flow.
7. Report changed files, the fix, the checks actually run, and any remaining uncertainty.
8. Update `memory.md` if a lasting design/architecture decision or known issue changed.

Keep all code consistent with the supplied agent rules. A UI workaround is not enough if the underlying data/state bug remains.
