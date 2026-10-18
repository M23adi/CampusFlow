/**
 * CampusFlow — Focus Timer & Comprehensive Study Session Tracker
 * Tracks all live and previous study sessions, weekly bar chart analytics, streaks, ambient sound, and celebrations.
 * Compliant with RULES.md and ARCHITECTURE.md.
 */

import {
  getState,
  updateTimerState,
  addFocusSession,
  addManualStudySession,
  deleteFocusSession,
  getTodayFocusMinutes,
  getStudyStats,
  getCourseById
} from './state.js';
import {
  formatTimerDigits,
  getLocalDateString,
  formatDisplayDate
} from './utils.js';
import {
  showToast,
  showModal,
  showConfirmModal,
  createEmptyState,
  triggerConfetti,
  toggleAmbientSound,
  isAmbientSoundActive,
  ICONS
} from './ui.js';

let intervalId = null;
let currentRemainingSeconds = 1500;
let totalModeDuration = 1500;
let activeTimerTab = 'timer'; // 'timer' | 'history' | 'ambience'

// SVG Ring metrics
const RING_RADIUS = 110;
const CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS;

/**
 * Play gentle Web Audio completion chime
 */
function playCompletionChime() {
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();

    const playTone = (freq, startTime, duration) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, startTime);
      gain.gain.setValueAtTime(0.15, startTime);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(startTime);
      osc.stop(startTime + duration);
    };

    const now = ctx.currentTime;
    playTone(523.25, now, 0.4);       // C5
    playTone(659.25, now + 0.15, 0.4); // E5
    playTone(783.99, now + 0.3, 0.6);  // G5
    playTone(1046.50, now + 0.45, 0.8);// C6
  } catch (err) {
    console.log('Audio chime unavailable:', err);
  }
}

/**
 * Recalculate remaining seconds from state.endsAt to resist tab throttling and backgrounding.
 */
export function syncTimerFromState() {
  const state = getState();
  const timer = state.timerState;

  if (timer.status === 'running' && timer.endsAt) {
    const now = Date.now();
    const diffMs = timer.endsAt - now;
    if (diffMs <= 0) {
      handleNaturalFinish();
    } else {
      currentRemainingSeconds = Math.ceil(diffMs / 1000);
      startIntervalLoop();
    }
  } else {
    currentRemainingSeconds = timer.durationSeconds || 1500;
    stopIntervalLoop();
  }
}

function startIntervalLoop() {
  if (intervalId) clearInterval(intervalId);

  intervalId = setInterval(() => {
    const state = getState();
    const timer = state.timerState;

    if (timer.status !== 'running' || !timer.endsAt) {
      stopIntervalLoop();
      return;
    }

    const diffMs = timer.endsAt - Date.now();
    if (diffMs <= 0) {
      handleNaturalFinish();
    } else {
      currentRemainingSeconds = Math.ceil(diffMs / 1000);
      updateDisplayElements();
    }
  }, 500);
}

function stopIntervalLoop() {
  if (intervalId) {
    clearInterval(intervalId);
    intervalId = null;
  }
}

/**
 * Naturally finishes a running session when countdown reaches zero
 */
function handleNaturalFinish() {
  stopIntervalLoop();
  currentRemainingSeconds = 0;

  const state = getState();
  const timer = state.timerState;

  if (timer.status === 'running') {
    if (timer.mode === 'focus') {
      const durationMins = Math.round((timer.durationSeconds || 1500) / 60);
      addFocusSession({
        startedAt: timer.startedAt || new Date(Date.now() - durationMins * 60000).toISOString(),
        completedAt: new Date().toISOString(),
        durationMinutes: durationMins,
        mode: 'focus',
        taskId: timer.linkedTaskId,
        courseId: timer.linkedCourseId,
        completed: true
      });
      playCompletionChime();
      triggerConfetti();
      showToast(`🎉 Focus session complete! Logged ${durationMins}m of study time.`, 'success', 5000);
    } else {
      playCompletionChime();
      showToast('☕ Break session finished! Ready to focus again?', 'info', 4000);
    }

    updateTimerState({
      status: 'completed',
      endsAt: null,
      startedAt: null
    });
  }

  updateDisplayElements();
  triggerRerender();
}

let activeRerenderCallback = null;
function triggerRerender() {
  if (typeof activeRerenderCallback === 'function') {
    activeRerenderCallback();
  }
}

function updateDisplayElements() {
  const digitsEl = document.getElementById('timer-digits-display');
  if (digitsEl) {
    digitsEl.textContent = formatTimerDigits(currentRemainingSeconds);
  }

  const ringEl = document.getElementById('timer-progress-ring');
  if (ringEl && totalModeDuration > 0) {
    const fraction = Math.max(0, Math.min(1, currentRemainingSeconds / totalModeDuration));
    const offset = CIRCUMFERENCE * (1 - fraction);
    ringEl.style.strokeDashoffset = offset.toFixed(2);
  }

  const state = getState();
  if (state.timerState.status === 'running') {
    document.title = `(${formatTimerDigits(currentRemainingSeconds)}) CampusFlow ⏱️`;
  } else {
    document.title = 'CampusFlow';
  }
}

/**
 * Render Focus & Study Hub into container
 * @param {HTMLElement} container
 * @param {(viewName: string) => void} onNavigate
 */
export function renderTimerView(container, onNavigate) {
  container.innerHTML = '';
  activeRerenderCallback = () => renderTimerView(container, onNavigate);

  const state = getState();
  const timer = state.timerState;
  const prefs = state.preferences;
  const studyStats = getStudyStats();

  // Mode total duration
  let defaultMins = 25;
  if (timer.mode === 'focus') defaultMins = prefs.focusMinutes || 25;
  else if (timer.mode === 'shortBreak') defaultMins = prefs.shortBreakMinutes || 5;
  else if (timer.mode === 'longBreak') defaultMins = prefs.longBreakMinutes || 15;

  totalModeDuration = defaultMins * 60;
  if (timer.status === 'idle') {
    currentRemainingSeconds = totalModeDuration;
  }

  // Header
  const header = document.createElement('div');
  header.className = 'page-header';

  const titleGroup = document.createElement('div');
  titleGroup.className = 'page-title-group';

  const title = document.createElement('h1');
  title.className = 'page-title';
  title.textContent = 'Focus & Study Session Tracker ⏱️';

  const sub = document.createElement('p');
  sub.className = 'page-subtitle';
  sub.innerHTML = `<span>🔥 <strong>${studyStats.currentStreak} Day Streak</strong></span> • <span>${getTodayFocusMinutes()}m focused today</span> • <span>${studyStats.totalHours} hrs all-time</span>`;

  titleGroup.appendChild(title);
  titleGroup.appendChild(sub);

  const headerActions = document.createElement('div');
  headerActions.className = 'page-actions';

  const logManualBtn = document.createElement('button');
  logManualBtn.type = 'button';
  logManualBtn.className = 'btn btn-secondary';
  logManualBtn.innerHTML = `<span>➕ Log Past Study Session</span>`;
  logManualBtn.addEventListener('click', () => openManualSessionModal(state, () => renderTimerView(container, onNavigate)));
  headerActions.appendChild(logManualBtn);

  header.appendChild(titleGroup);
  header.appendChild(headerActions);
  container.appendChild(header);

  // Sub-Navigation Tabs: [⏱️ Live Timer] [📊 Study History & Analytics] [🎧 Study Ambience]
  const navTabs = document.createElement('div');
  navTabs.className = 'filter-bar';

  const tabsWrap = document.createElement('div');
  tabsWrap.className = 'filter-pills';

  const tabs = [
    { id: 'timer', label: '⏱️ Focus Timer' },
    { id: 'history', label: `📊 Study History (${studyStats.totalSessions})` },
    { id: 'ambience', label: '🎧 Study Ambience' }
  ];

  for (const t of tabs) {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = `filter-pill ${activeTimerTab === t.id ? 'active' : ''}`;
    btn.textContent = t.label;
    btn.addEventListener('click', () => {
      activeTimerTab = t.id;
      renderTimerView(container, onNavigate);
    });
    tabsWrap.appendChild(btn);
  }

  navTabs.appendChild(tabsWrap);
  container.appendChild(navTabs);

  // View Switching
  if (activeTimerTab === 'timer') {
    renderLiveTimerTab(container, state, timer, prefs, onNavigate);
  } else if (activeTimerTab === 'history') {
    renderStudyAnalyticsTab(container, state, studyStats, () => renderTimerView(container, onNavigate));
  } else if (activeTimerTab === 'ambience') {
    renderAmbienceTab(container);
  }
}

/**
 * 1. Live Focus Timer Tab
 */
function renderLiveTimerTab(container, state, timer, prefs, onNavigate) {
  const card = document.createElement('div');
  card.className = 'card timer-container';

  // Mode Switcher
  const modesWrap = document.createElement('div');
  modesWrap.className = 'timer-modes';

  const modes = [
    { id: 'focus', label: `🎯 Focus (${prefs.focusMinutes || 25}m)` },
    { id: 'shortBreak', label: `☕ Short Break (${prefs.shortBreakMinutes || 5}m)` },
    { id: 'longBreak', label: `🛋️ Long Break (${prefs.longBreakMinutes || 15}m)` }
  ];

  for (const m of modes) {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = `timer-mode-btn ${timer.mode === m.id ? 'active' : ''}`;
    btn.textContent = m.label;
    btn.disabled = timer.status === 'running';

    btn.addEventListener('click', () => {
      let mins = 25;
      if (m.id === 'focus') mins = prefs.focusMinutes || 25;
      else if (m.id === 'shortBreak') mins = prefs.shortBreakMinutes || 5;
      else if (m.id === 'longBreak') mins = prefs.longBreakMinutes || 15;

      const durSecs = mins * 60;
      totalModeDuration = durSecs;
      currentRemainingSeconds = durSecs;

      updateTimerState({
        mode: m.id,
        status: 'idle',
        durationSeconds: durSecs,
        endsAt: null,
        startedAt: null
      });

      renderTimerView(container, onNavigate);
    });

    modesWrap.appendChild(btn);
  }
  card.appendChild(modesWrap);

  // Linked course selector if in focus mode
  if (timer.mode === 'focus' && state.courses.length > 0) {
    const courseLinkRow = document.createElement('div');
    courseLinkRow.style.display = 'flex';
    courseLinkRow.style.alignItems = 'center';
    courseLinkRow.style.gap = '8px';
    courseLinkRow.style.marginBottom = 'var(--space-2)';

    const label = document.createElement('span');
    label.style.fontSize = '0.82rem';
    label.style.color = 'var(--color-text-muted)';
    label.textContent = '📚 Studying Course:';
    courseLinkRow.appendChild(label);

    const select = document.createElement('select');
    select.className = 'form-select btn-sm';
    select.style.width = 'auto';
    select.disabled = timer.status === 'running';

    const defaultOpt = document.createElement('option');
    defaultOpt.value = '';
    defaultOpt.textContent = 'General Study';
    select.appendChild(defaultOpt);

    for (const c of state.courses) {
      const opt = document.createElement('option');
      opt.value = c.id;
      opt.textContent = `${c.code ? c.code + ' - ' : ''}${c.name}`;
      if (timer.linkedCourseId === c.id) opt.selected = true;
      select.appendChild(opt);
    }

    select.addEventListener('change', (e) => {
      updateTimerState({ linkedCourseId: e.target.value || null });
    });
    courseLinkRow.appendChild(select);
    card.appendChild(courseLinkRow);
  }

  // Circular Timer Display
  const ringWrap = document.createElement('div');
  ringWrap.className = 'timer-ring-wrap';

  const fraction = totalModeDuration > 0 ? currentRemainingSeconds / totalModeDuration : 1;
  const initialOffset = (CIRCUMFERENCE * (1 - fraction)).toFixed(2);

  ringWrap.innerHTML = `
    <svg class="timer-svg" viewBox="0 0 260 260">
      <circle class="timer-ring-bg" cx="130" cy="130" r="${RING_RADIUS}"></circle>
      <circle id="timer-progress-ring" class="timer-ring-progress" cx="130" cy="130" r="${RING_RADIUS}"
        stroke-dasharray="${CIRCUMFERENCE}"
        stroke-dashoffset="${initialOffset}"></circle>
    </svg>
    <div class="timer-display">
      <div id="timer-digits-display" class="timer-digits">${formatTimerDigits(currentRemainingSeconds)}</div>
      <div class="timer-status-text">${getStatusLabel(timer.status, timer.mode)}</div>
    </div>
  `;
  card.appendChild(ringWrap);

  // Controls
  const controls = document.createElement('div');
  controls.className = 'timer-controls';

  if (timer.status === 'idle' || timer.status === 'completed') {
    const startBtn = document.createElement('button');
    startBtn.type = 'button';
    startBtn.className = 'btn btn-primary btn-lg';
    startBtn.innerHTML = `${ICONS.play} <span>Start Focus Session 🚀</span>`;
    startBtn.addEventListener('click', () => {
      const now = Date.now();
      const durSecs = currentRemainingSeconds || totalModeDuration;
      updateTimerState({
        status: 'running',
        startedAt: new Date(now).toISOString(),
        endsAt: now + durSecs * 1000,
        durationSeconds: totalModeDuration
      });
      syncTimerFromState();
      renderTimerView(container, onNavigate);
    });
    controls.appendChild(startBtn);
  } else if (timer.status === 'running') {
    const pauseBtn = document.createElement('button');
    pauseBtn.type = 'button';
    pauseBtn.className = 'btn btn-secondary btn-lg';
    pauseBtn.innerHTML = `${ICONS.pause} <span>Pause</span>`;
    pauseBtn.addEventListener('click', () => {
      stopIntervalLoop();
      updateTimerState({
        status: 'paused',
        durationSeconds: currentRemainingSeconds,
        endsAt: null
      });
      renderTimerView(container, onNavigate);
    });
    controls.appendChild(pauseBtn);

    const skipBtn = document.createElement('button');
    skipBtn.type = 'button';
    skipBtn.className = 'btn btn-ghost btn-lg';
    skipBtn.innerHTML = `${ICONS.skip} <span>Skip / Cancel</span>`;
    skipBtn.addEventListener('click', () => {
      stopIntervalLoop();
      updateTimerState({
        status: 'idle',
        endsAt: null,
        startedAt: null
      });
      currentRemainingSeconds = totalModeDuration;
      showToast('Session cancelled (not recorded)', 'info');
      renderTimerView(container, onNavigate);
    });
    controls.appendChild(skipBtn);
  } else if (timer.status === 'paused') {
    const resumeBtn = document.createElement('button');
    resumeBtn.type = 'button';
    resumeBtn.className = 'btn btn-primary btn-lg';
    resumeBtn.innerHTML = `${ICONS.play} <span>Resume Focus ⚡</span>`;
    resumeBtn.addEventListener('click', () => {
      const now = Date.now();
      updateTimerState({
        status: 'running',
        endsAt: now + currentRemainingSeconds * 1000
      });
      syncTimerFromState();
      renderTimerView(container, onNavigate);
    });
    controls.appendChild(resumeBtn);

    const resetBtn = document.createElement('button');
    resetBtn.type = 'button';
    resetBtn.className = 'btn btn-secondary btn-lg';
    resetBtn.innerHTML = `${ICONS.reset} <span>Reset</span>`;
    resetBtn.addEventListener('click', () => {
      stopIntervalLoop();
      currentRemainingSeconds = totalModeDuration;
      updateTimerState({
        status: 'idle',
        durationSeconds: totalModeDuration,
        endsAt: null,
        startedAt: null
      });
      renderTimerView(container, onNavigate);
    });
    controls.appendChild(resetBtn);
  }

  card.appendChild(controls);
  container.appendChild(card);
}

function getStatusLabel(status, mode) {
  if (status === 'running') return mode === 'focus' ? '🎯 Deep Work In Progress' : '☕ Break Time';
  if (status === 'paused') return '⏸️ Paused';
  if (status === 'completed') return '🎉 Session Finished!';
  return '✨ Ready to Study';
}

/**
 * 2. Study History & Analytics Tab
 */
function renderStudyAnalyticsTab(container, state, stats, onRefresh) {
  // Stat Summary Cards
  const statsGrid = document.createElement('div');
  statsGrid.className = 'stats-grid';
  statsGrid.style.marginBottom = 'var(--space-6)';

  // Streak
  const streakCard = document.createElement('div');
  streakCard.className = 'stat-card';
  streakCard.innerHTML = `
    <div class="stat-icon-wrap stat-icon-warning"><span style="font-size:1.4rem;">🔥</span></div>
    <div class="stat-body">
      <div class="stat-label">Daily Streak</div>
      <div class="stat-value">${stats.currentStreak} Days</div>
      <div class="stat-meta">Keep the fire burning!</div>
    </div>
  `;
  statsGrid.appendChild(streakCard);

  // Total Hours
  const hoursCard = document.createElement('div');
  hoursCard.className = 'stat-card';
  hoursCard.innerHTML = `
    <div class="stat-icon-wrap stat-icon-primary"><span style="font-size:1.4rem;">⏱️</span></div>
    <div class="stat-body">
      <div class="stat-label">Total Focused</div>
      <div class="stat-value">${stats.totalHours} hrs</div>
      <div class="stat-meta">${stats.totalMinutes} total minutes</div>
    </div>
  `;
  statsGrid.appendChild(hoursCard);

  // Completed Sessions
  const sessionsCard = document.createElement('div');
  sessionsCard.className = 'stat-card';
  sessionsCard.innerHTML = `
    <div class="stat-icon-wrap stat-icon-success"><span style="font-size:1.4rem;">🎯</span></div>
    <div class="stat-body">
      <div class="stat-label">Study Sessions</div>
      <div class="stat-value">${stats.totalSessions}</div>
      <div class="stat-meta">Pomodoros & study blocks</div>
    </div>
  `;
  statsGrid.appendChild(sessionsCard);

  // Today
  const todayMins = getTodayFocusMinutes();
  const todayCard = document.createElement('div');
  todayCard.className = 'stat-card';
  todayCard.innerHTML = `
    <div class="stat-icon-wrap stat-icon-info"><span style="font-size:1.4rem;">📖</span></div>
    <div class="stat-body">
      <div class="stat-label">Today's Focus</div>
      <div class="stat-value">${todayMins}m</div>
      <div class="stat-meta">Logged today</div>
    </div>
  `;
  statsGrid.appendChild(todayCard);
  container.appendChild(statsGrid);

  // Weekly Activity Bar Chart Card
  const chartCard = document.createElement('div');
  chartCard.className = 'card';
  chartCard.style.marginBottom = 'var(--space-6)';

  const chartHeader = document.createElement('div');
  chartHeader.className = 'card-header';
  chartHeader.innerHTML = `
    <div class="card-title-wrap">
      <span style="font-size:1.2rem;">📈</span>
      <h2 class="card-title">Last 7 Days Study Activity</h2>
    </div>
    <span class="card-subtitle">Minutes focused per day</span>
  `;
  chartCard.appendChild(chartHeader);

  // Pure HTML/CSS Interactive Bar Chart
  const maxMins = Math.max(60, ...stats.last7Days.map(d => d.minutes));
  const chartWrap = document.createElement('div');
  chartWrap.style.display = 'flex';
  chartWrap.style.alignItems = 'flex-end';
  chartWrap.style.justifyContent = 'space-between';
  chartWrap.style.height = '180px';
  chartWrap.style.padding = 'var(--space-4) var(--space-2) 0';
  chartWrap.style.borderBottom = '1px solid var(--color-border)';
  chartWrap.style.gap = 'var(--space-3)';

  for (const day of stats.last7Days) {
    const col = document.createElement('div');
    col.style.flex = '1';
    col.style.display = 'flex';
    col.style.flexDirection = 'column';
    col.style.alignItems = 'center';
    col.style.height = '100%';
    col.style.justifyContent = 'flex-end';
    col.style.gap = '6px';
    col.title = `${day.weekdayShort} (${day.dateStr}): ${day.minutes} minutes`;

    const barHeight = Math.max(6, Math.round((day.minutes / maxMins) * 130));

    const bar = document.createElement('div');
    bar.style.width = '100%';
    bar.style.maxWidth = '42px';
    bar.style.height = `${barHeight}px`;
    bar.style.borderRadius = '6px 6px 2px 2px';
    bar.style.backgroundColor = day.isToday ? 'var(--color-primary)' : 'var(--color-primary-border)';
    bar.style.transition = 'height 0.4s ease, background-color 0.2s';
    bar.style.cursor = 'pointer';

    bar.addEventListener('mouseenter', () => {
      bar.style.backgroundColor = 'var(--color-primary-hover)';
    });
    bar.addEventListener('mouseleave', () => {
      bar.style.backgroundColor = day.isToday ? 'var(--color-primary)' : 'var(--color-primary-border)';
    });

    const minsLabel = document.createElement('span');
    minsLabel.style.fontSize = '0.72rem';
    minsLabel.style.fontWeight = '700';
    minsLabel.style.color = day.minutes > 0 ? 'var(--color-text)' : 'var(--color-text-muted)';
    minsLabel.textContent = day.minutes > 0 ? `${day.minutes}m` : '0';

    const dayLabel = document.createElement('span');
    dayLabel.style.fontSize = '0.78rem';
    dayLabel.style.fontWeight = day.isToday ? '750' : '600';
    dayLabel.style.color = day.isToday ? 'var(--color-primary)' : 'var(--color-text-muted)';
    dayLabel.textContent = day.isToday ? `${day.weekdayShort} (Today)` : day.weekdayShort;

    col.appendChild(minsLabel);
    col.appendChild(bar);
    col.appendChild(dayLabel);
    chartWrap.appendChild(col);
  }

  chartCard.appendChild(chartWrap);
  container.appendChild(chartCard);

  // Subject Time Distribution
  if (stats.courseBreakdown.length > 0) {
    const courseCard = document.createElement('div');
    courseCard.className = 'card';
    courseCard.style.marginBottom = 'var(--space-6)';

    const cHeader = document.createElement('div');
    cHeader.className = 'card-header';
    cHeader.innerHTML = `
      <div class="card-title-wrap">
        <span style="font-size:1.2rem;">📚</span>
        <h2 class="card-title">Study Time by Subject</h2>
      </div>
    `;
    courseCard.appendChild(cHeader);

    const cList = document.createElement('div');
    cList.style.display = 'flex';
    cList.style.flexDirection = 'column';
    cList.style.gap = 'var(--space-3)';

    for (const c of stats.courseBreakdown) {
      const row = document.createElement('div');
      row.style.display = 'flex';
      row.style.flexDirection = 'column';
      row.style.gap = '4px';

      const labelRow = document.createElement('div');
      labelRow.style.display = 'flex';
      labelRow.style.justifyContent = 'space-between';
      labelRow.style.fontSize = '0.86rem';
      labelRow.style.fontWeight = '650';

      labelRow.innerHTML = `
        <span><span class="course-dot" style="background-color:${c.color || 'var(--color-primary)'}"></span> ${c.courseCode ? c.courseCode + ' — ' : ''}${c.courseName}</span>
        <span style="color:var(--color-text-muted)">${c.minutes}m (${c.percent}%)</span>
      `;
      row.appendChild(labelRow);

      const prog = document.createElement('div');
      prog.className = 'progress-container';
      const b = document.createElement('div');
      b.className = 'progress-bar';
      b.style.width = `${c.percent}%`;
      b.style.backgroundColor = c.color || 'var(--color-primary)';
      prog.appendChild(b);
      row.appendChild(prog);

      cList.appendChild(row);
    }

    courseCard.appendChild(cList);
    container.appendChild(courseCard);
  }

  // All Sessions History Table
  const historyCard = document.createElement('div');
  historyCard.className = 'card';

  const hHeader = document.createElement('div');
  hHeader.className = 'card-header';
  hHeader.innerHTML = `
    <div class="card-title-wrap">
      <span style="font-size:1.2rem;">📋</span>
      <h2 class="card-title">All Study Sessions History (${stats.allSessions.length})</h2>
    </div>
  `;
  historyCard.appendChild(hHeader);

  if (stats.allSessions.length === 0) {
    const empty = createEmptyState({
      iconName: 'timer',
      title: 'No study sessions logged yet',
      description: 'Start the focus timer or manually record a study session to begin building your study history.',
      actionText: 'Log a Study Session',
      onAction: () => openManualSessionModal(state, onRefresh)
    });
    historyCard.appendChild(empty);
  } else {
    const list = document.createElement('div');
    list.style.display = 'flex';
    list.style.flexDirection = 'column';
    list.style.gap = 'var(--space-2)';

    for (const session of stats.allSessions) {
      const item = document.createElement('div');
      item.className = 'item-card';

      const body = document.createElement('div');
      body.className = 'item-body';

      const titleRow = document.createElement('div');
      titleRow.style.display = 'flex';
      titleRow.style.alignItems = 'center';
      titleRow.style.gap = '8px';

      const titleEl = document.createElement('span');
      titleEl.className = 'item-title';
      titleEl.textContent = `${session.durationMinutes}m Focused Study Block`;
      titleRow.appendChild(titleEl);

      if (session.courseId) {
        const course = getCourseById(session.courseId);
        if (course) {
          const tag = document.createElement('span');
          tag.className = 'course-tag';
          tag.textContent = course.code || course.name;
          titleRow.appendChild(tag);
        }
      }

      body.appendChild(titleRow);

      const meta = document.createElement('div');
      meta.className = 'item-meta';
      const date = new Date(session.completedAt);
      const timeStr = date.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
      meta.textContent = `📅 ${formatDisplayDate(getLocalDateString(date))} at ${timeStr}${session.notes ? ` • 💬 "${session.notes}"` : ''}`;
      body.appendChild(meta);

      item.appendChild(body);

      const chip = document.createElement('span');
      chip.className = 'chip chip-completed';
      chip.textContent = `+${session.durationMinutes} min`;
      item.appendChild(chip);

      const delBtn = document.createElement('button');
      delBtn.type = 'button';
      delBtn.className = 'btn btn-danger-ghost btn-icon btn-sm';
      delBtn.setAttribute('aria-label', 'Delete session');
      delBtn.innerHTML = ICONS.trash;
      delBtn.addEventListener('click', () => {
        showConfirmModal({
          title: 'Delete Session',
          message: 'Are you sure you want to delete this study session record?',
          confirmText: 'Delete',
          confirmVariant: 'danger',
          onConfirm: () => {
            deleteFocusSession(session.id);
            showToast('Session record removed', 'info');
            onRefresh();
          }
        });
      });
      item.appendChild(delBtn);

      list.appendChild(item);
    }
    historyCard.appendChild(list);
  }

  container.appendChild(historyCard);
}

/**
 * 3. Study Ambience Tab
 */
function renderAmbienceTab(container) {
  const card = document.createElement('div');
  card.className = 'card timer-container';
  card.style.textAlign = 'center';

  const isPlaying = isAmbientSoundActive();

  card.innerHTML = `
    <div style="font-size:3rem;margin-bottom:var(--space-3);">🎧</div>
    <h2 class="card-title" style="font-size:1.35rem;margin-bottom:var(--space-1);">Ambient Study Generator</h2>
    <p style="color:var(--color-text-muted);max-width:440px;margin:0 auto var(--space-6);font-size:0.92rem;">
      Continuous soothing sound synthesized in real-time by your browser's Web Audio engine. 100% offline, blocks distractions, and boosts study concentration.
    </p>
  `;

  const playBtn = document.createElement('button');
  playBtn.type = 'button';
  playBtn.className = `btn ${isPlaying ? 'btn-secondary' : 'btn-primary'} btn-lg`;
  playBtn.innerHTML = isPlaying ? `<span>⏸️ Pause Rain Ambience</span>` : `<span>🌧️ Play Soothing Rain Audio</span>`;

  playBtn.addEventListener('click', () => {
    const active = toggleAmbientSound('rain');
    playBtn.className = `btn ${active ? 'btn-secondary' : 'btn-primary'} btn-lg`;
    playBtn.innerHTML = active ? `<span>⏸️ Pause Rain Ambience</span>` : `<span>🌧️ Play Soothing Rain Audio</span>`;
    showToast(active ? '🌧️ Ambient study audio playing' : 'Ambient audio paused', 'info');
  });

  card.appendChild(playBtn);
  container.appendChild(card);
}

/**
 * Modal to Manually Record a Past Study Session
 */
export function openManualSessionModal(state, onSaved) {
  const form = document.createElement('form');
  form.noValidate = true;

  // Duration
  const durGroup = document.createElement('div');
  durGroup.className = 'form-group';
  durGroup.innerHTML = `<label class="form-label">Study Duration (Minutes) <span class="required-mark">*</span></label>`;
  const durInput = document.createElement('input');
  durInput.type = 'number';
  durInput.min = '5';
  durInput.max = '480';
  durInput.value = '45';
  durInput.className = 'form-input';
  durGroup.appendChild(durInput);
  form.appendChild(durGroup);

  // Date
  const dateGroup = document.createElement('div');
  dateGroup.className = 'form-group';
  dateGroup.innerHTML = `<label class="form-label">Date Studied</label>`;
  const dateInput = document.createElement('input');
  dateInput.type = 'date';
  dateInput.value = getLocalDateString();
  dateInput.className = 'form-input';
  dateGroup.appendChild(dateInput);
  form.appendChild(dateGroup);

  // Course
  const courseGroup = document.createElement('div');
  courseGroup.className = 'form-group';
  courseGroup.innerHTML = `<label class="form-label">Subject / Course</label>`;
  const courseSelect = document.createElement('select');
  courseSelect.className = 'form-select';
  const defOpt = document.createElement('option');
  defOpt.value = '';
  defOpt.textContent = 'General / Self-study';
  courseSelect.appendChild(defOpt);

  for (const c of state.courses) {
    const opt = document.createElement('option');
    opt.value = c.id;
    opt.textContent = `${c.code ? c.code + ' - ' : ''}${c.name}`;
    courseSelect.appendChild(opt);
  }
  courseGroup.appendChild(courseSelect);
  form.appendChild(courseGroup);

  // Notes
  const notesGroup = document.createElement('div');
  notesGroup.className = 'form-group';
  notesGroup.innerHTML = `<label class="form-label">Session Notes / Topics Covered</label>`;
  const notesArea = document.createElement('textarea');
  notesArea.className = 'form-textarea';
  notesArea.placeholder = 'e.g. Read textbook chapters 4-5 and solved review questions in library';
  notesGroup.appendChild(notesArea);
  form.appendChild(notesGroup);

  const actions = document.createElement('div');
  actions.className = 'form-actions';
  const cancelBtn = document.createElement('button');
  cancelBtn.type = 'button';
  cancelBtn.className = 'btn btn-secondary';
  cancelBtn.textContent = 'Cancel';
  const submitBtn = document.createElement('button');
  submitBtn.type = 'submit';
  submitBtn.className = 'btn btn-primary';
  submitBtn.textContent = 'Save Study Session 💾';
  actions.appendChild(cancelBtn);
  actions.appendChild(submitBtn);
  form.appendChild(actions);

  const modal = showModal({
    title: '📝 Log Previous Study Session',
    contentNode: form
  });

  cancelBtn.addEventListener('click', () => modal.close());

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const mins = Math.max(1, parseInt(durInput.value, 10) || 25);
    addManualStudySession({
      durationMinutes: mins,
      date: dateInput.value,
      courseId: courseSelect.value || null,
      notes: notesArea.value.trim()
    });
    triggerConfetti();
    showToast(`Logged ${mins}m study session! 🎉`, 'success');
    modal.close();
    if (typeof onSaved === 'function') onSaved();
  });
}
