# 🎓 CampusFlow — Student Academic Productivity Workspace

> A calm, beautiful, all-in-one college student productivity planner and academic workspace built with **HTML5, CSS3, and vanilla JavaScript ES modules only** — zero frameworks, zero build tools, and zero npm dependencies.

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Vanilla JS](https://img.shields.io/badge/Vanilla-JavaScript_ES6+-F7DF1E?logo=javascript&logoColor=black)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)
[![No Dependencies](https://img.shields.io/badge/Dependencies-0_None-success.svg)](package.json)
[![AI Powered](https://img.shields.io/badge/AI-Google_Gemini_2.5_Flash-4285F4?logo=google&logoColor=white)](https://ai.google.dev/)

---

## ✨ Features Overview

### 1. 📊 Personal Academic Dashboard
- **Live Greeting & Date:** Dynamic local time-based greeting and date display.
- **Academic Stat Cards:** Real-time counters for pending tasks, assignments due, current study streak (`🔥`), all-time focus hours, and syllabus coverage progress.
- **🚨 Urgent Deadline Alert Banner:** Auto-detects overdue and due-today coursework with color-coded urgency and one-click reminder views.
- **🎲 Daily Study Spark:** High-yield academic productivity tips with an interactive quote shuffler.
- **Today's Class Schedule:** Chronological daily schedule agenda with current session highlighting.

### 2. 📝 Tasks & To-Dos
- Priority levels (Urgent, High, Medium, Low) with semantic chips.
- Course and subject tagging.
- Tabbed filters (Open / All / Completed) with instant title/notes search.
- Interactive checkboxes with HTML5 Canvas confetti celebrations (`🎉`).

### 3. 📚 Assignments & Deadline Tracker
- Local calendar-day calculation (`YYYY-MM-DD`) avoiding timezone drift.
- Categorization into Overdue, Due Today, Due Tomorrow, and Upcoming.
- Status progression: *Not Started* ➔ *In Progress* ➔ *Submitted*.
- **Interactive Notification Bell (`🔔`):** Header and topbar bell with pulsing badge count (`.pulse-badge`) and full modal summary.

### 4. 🎓 Syllabus Progress Tracker
- 3-level academic hierarchy: Courses ➔ Units ➔ Topics.
- Topic completion checkboxes with real-time percentage coverage calculation.
- Course expansion accordions and safe cascading course deletion.

### 5. 🗓️ Weekly Class Timetable
- Monday–Sunday day picker with current day detection.
- Start and end time validation with same-day class overlap warnings.
- Instructor and room assignment details.

### 6. ⏱️ Focus & Study Hub
- **Live Focus Timer:** Pomodoro and deep study modes (25m Focus, 5m Short Break, 15m Long Break) with circular SVG progress ring and drift-free `endsAt` timestamp arithmetic.
- **📊 7-Day Study Bar Chart:** Pure HTML/CSS visualization of daily focus minutes over the last 7 calendar days.
- **Subject Focus Breakdown:** Visual percentage bars tracking study time invested per course.
- **Session History & Manual Logger:** Chronological log of past sessions with retrospective logging (`+ Log Past Session`).
- **🎧 Study Ambience Generator:** Built-in Web Audio ambient sound synthesizer (*Gentle Rain*, *Pink Focus Noise*, *Campfire Library*) running offline with zero external audio files.

### 7. 💡 AI Academic Doubt Solver (Google Gemini 2.5 Flash)
- **24/7 Conceptual Tutor:** Instant conceptual explanations, step-by-step problem solving, code debugging, and exam preparation.
- **Course-Aware Context:** Option to link questions to your active courses (*Data Mining*, *Computer Networks*, etc.).
- **Study Modes:** 💡 Concept Explanation, 📝 Step-by-Step Solution, 💻 Code & Debugging, 🎯 Practice Quiz & Flashcards.
- **1-Click Actions:** Copy code snippets (`📋 Copy`) and convert explanations directly into study tasks (`➕ Add to Tasks`).
- **Privacy & Security:** API keys are stored solely in your personal browser `localStorage` and are never committed to git or sent to any third-party server.

### 8. ⚙️ Settings, Themes & Data Safety
- Instant **Light and Dark Mode** switching with customized CSS design tokens.
- **Google Gemini AI Configuration:** In-app API key input, model selector (`gemini-2.5-flash`, `gemini-flash-latest`, `gemini-2.5-pro`), and live "⚡ Test Connection" ping.
- **100% Offline & Local:** Stored in browser `localStorage`.
- **JSON Backup & Restore:** Complete export and import with schema validation.

---

## 🚀 Quick Start (Running Locally)

CampusFlow requires **no build tools, bundlers, or package installations**.

### Option A: Open Directly (Static Server)
Because the app uses native ES modules (`import`/`export`), run any lightweight static server:

```bash
# Using Python (built into most systems)
python -m http.server 8080

# Or using Node.js / npx
npx serve .
```

Then open `http://localhost:8080` in your browser.

---

## 🔑 Configuring the AI Doubt Solver (Google Gemini)

1. Get a free API key from [Google AI Studio](https://aistudio.google.com/).
2. Open **CampusFlow** in your browser.
3. Navigate to **⚙️ Settings & Data** (or click **⚙️ AI Config** inside the Doubt Solver).
4. Paste your API key into the **Google Gemini API Key** field.
5. Click **⚡ Test Connection** to verify your key.
6. Click **Save AI Configuration**.

> **Note:** Your API key is stored safely in your own browser's private `localStorage`. It is never committed to GitHub or shared with anyone else.

---

## 📁 Architecture & File Structure

```text
campusflow/
├── index.html              # Single HTML app shell and semantic landmarks
├── css/
│   ├── styles.css          # Design tokens, reset, typography, layout
│   ├── components.css      # Cards, modals, buttons, forms, badges, timer, chat
│   └── responsive.css      # Mobile drawer, topbar, bottom nav, media queries
├── js/
│   ├── app.js              # Application entry, router, navigation badges
│   ├── state.js            # Centralized state, Gemini API client, analytics
│   ├── storage.js          # Versioned localStorage persistence, export/import
│   ├── utils.js            # Date arithmetic, ID generation, sanitization
│   ├── ui.js               # Modal helpers, toasts, Canvas confetti, ambient audio
│   ├── dashboard.js        # Personal academic dashboard
│   ├── tasks.js            # Task list, form validation, filter tabs
│   ├── assignments.js      # Assignment deadlines, status progression, reminders
│   ├── syllabus.js         # Course/Unit/Topic progress hierarchy
│   ├── timetable.js        # Weekly timetable agenda and overlap detection
│   ├── timer.js            # Focus timer, 7-day bar chart, study history logger
│   ├── doubts.js           # AI Academic Doubt Solver chat interface
│   └── settings.js         # Profile, theme, Gemini AI config, JSON backup
├── memory.md               # Continuous project memory and architecture log
├── ARCHITECTURE.md         # Full technical architecture specification
├── DESIGN.md               # Visual design tokens, colors, typography
└── RULES.md                # Strict design and architectural constraints
```

---

## 📄 License

MIT License — Feel free to use and adapt this project for your academic studies!
