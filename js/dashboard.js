/**
 * CampusFlow — Personal Academic Dashboard
 * Live greeting, daily stats, timetable today, urgent deadlines, syllabus overview, and quick timer.
 * Compliant with RULES.md and DESIGN.md.
 */

import {
  getState,
  getTaskCounts,
  getAssignmentCounts,
  getTodayFocusMinutes,
  calculateOverallSyllabusProgress,
  calculateCourseProgress,
  getCourseById,
  toggleTaskComplete,
  getStudyStats,
  getAssignmentAlerts
} from './state.js';
import {
  getTimeGreeting,
  formatDisplayDate,
  formatDisplayTime,
  getDeadlineInfo,
  getWeekdayName,
  isDueToday
} from './utils.js';
import {
  ICONS,
  createEmptyState,
  createPriorityChip,
  showToast,
  triggerConfetti,
  getRandomStudyQuote,
  openRemindersModal
} from './ui.js';
import { openTaskFormModal } from './tasks.js';

/**
 * Render Dashboard View into the container.
 * @param {HTMLElement} container
 * @param {(viewName: string) => void} onNavigate
 */
export function renderDashboardView(container, onNavigate) {
  container.innerHTML = '';

  const state = getState();
  const now = new Date();
  const userName = state.preferences.userName || 'Student';
  const greeting = getTimeGreeting(now);
  const studyStats = getStudyStats();
  const alerts = getAssignmentAlerts(2);

  const fullDateStr = now.toLocaleDateString(undefined, {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  });

  // 1. Dashboard Header
  const header = document.createElement('div');
  header.className = 'page-header';

  const titleGroup = document.createElement('div');
  titleGroup.className = 'page-title-group';

  const title = document.createElement('h1');
  title.className = 'page-title';
  title.textContent = `${greeting}, ${userName} 👋`;

  const dateSub = document.createElement('p');
  dateSub.className = 'page-subtitle';
  dateSub.innerHTML = `<span>🗓️ ${fullDateStr}</span> • <span style="color:var(--color-primary);font-weight:700;">🔥 ${studyStats.currentStreak} Day Study Streak</span>`;

  titleGroup.appendChild(title);
  titleGroup.appendChild(dateSub);

  const headerActions = document.createElement('div');
  headerActions.className = 'page-actions';

  // Notification Bell Reminder Action
  const reminderBtn = document.createElement('button');
  reminderBtn.type = 'button';
  reminderBtn.className = 'btn btn-secondary';
  reminderBtn.style.position = 'relative';
  reminderBtn.innerHTML = `
    <span>🔔 Deadlines</span>
    ${alerts.totalUrgentCount > 0 ? `<span class="nav-badge" style="background-color:var(--color-danger);color:#fff;margin-left:4px;font-size:0.75rem;">${alerts.totalUrgentCount}</span>` : ''}
  `;
  reminderBtn.title = `${alerts.totalUrgentCount} urgent assignment deadlines`;
  reminderBtn.addEventListener('click', () => openRemindersModal(alerts, onNavigate, () => renderDashboardView(container, onNavigate)));

  const addTaskBtn = document.createElement('button');
  addTaskBtn.type = 'button';
  addTaskBtn.className = 'btn btn-primary';
  addTaskBtn.innerHTML = `${ICONS.plus} <span>New Task 📝</span>`;
  addTaskBtn.addEventListener('click', () => openTaskFormModal(null, () => renderDashboardView(container, onNavigate)));

  const focusBtn = document.createElement('button');
  focusBtn.type = 'button';
  focusBtn.className = 'btn btn-secondary';
  focusBtn.innerHTML = `${ICONS.timer} <span>Focus Session ⏱️</span>`;
  focusBtn.addEventListener('click', () => onNavigate('timer'));

  headerActions.appendChild(reminderBtn);
  headerActions.appendChild(addTaskBtn);
  headerActions.appendChild(focusBtn);
  header.appendChild(titleGroup);
  header.appendChild(headerActions);
  container.appendChild(header);

  // 1.5 Urgent Assignment Reminder Banner (if any urgent due dates)
  if (alerts.totalUrgentCount > 0) {
    const alertBanner = document.createElement('div');
    alertBanner.className = 'card';
    alertBanner.style.backgroundColor = alerts.overdue.length > 0 ? 'var(--color-danger-soft)' : 'var(--color-warning-soft)';
    alertBanner.style.borderColor = alerts.overdue.length > 0 ? 'var(--color-danger-border)' : 'var(--color-warning-border)';
    alertBanner.style.padding = 'var(--space-3) var(--space-4)';
    alertBanner.style.marginBottom = 'var(--space-5)';
    alertBanner.style.display = 'flex';
    alertBanner.style.alignItems = 'center';
    alertBanner.style.justifyContent = 'space-between';
    alertBanner.style.gap = 'var(--space-3)';

    let msg = '⏰ You have coursework deadlines approaching!';
    if (alerts.overdue.length > 0 && alerts.dueToday.length > 0) {
      msg = `🚨 You have ${alerts.overdue.length} overdue assignment(s) and ${alerts.dueToday.length} due today!`;
    } else if (alerts.overdue.length > 0) {
      msg = `🚨 You have ${alerts.overdue.length} assignment(s) past due date!`;
    } else if (alerts.dueToday.length > 0) {
      msg = `⏰ You have ${alerts.dueToday.length} assignment(s) due today! Don't miss the deadline.`;
    } else if (alerts.dueTomorrow.length > 0) {
      msg = `⚠️ ${alerts.dueTomorrow.length} assignment(s) due tomorrow! Finish your submission early.`;
    }

    const msgSpan = document.createElement('div');
    msgSpan.style.display = 'flex';
    msgSpan.style.alignItems = 'center';
    msgSpan.style.gap = 'var(--space-2)';
    msgSpan.style.fontWeight = '650';
    msgSpan.style.fontSize = '0.92rem';
    msgSpan.style.color = alerts.overdue.length > 0 ? 'var(--color-danger)' : 'var(--color-warning)';
    msgSpan.textContent = msg;

    const actionBtn = document.createElement('button');
    actionBtn.type = 'button';
    actionBtn.className = 'btn btn-sm btn-primary';
    actionBtn.textContent = 'View Reminders 🔔';
    actionBtn.addEventListener('click', () => openRemindersModal(alerts, onNavigate, () => renderDashboardView(container, onNavigate)));

    alertBanner.appendChild(msgSpan);
    alertBanner.appendChild(actionBtn);
    container.appendChild(alertBanner);
  }

  // 1.8 Motivational Student Tip Widget
  const quote = getRandomStudyQuote();
  const quoteCard = document.createElement('div');
  quoteCard.style.padding = '10px 16px';
  quoteCard.style.borderRadius = 'var(--radius-sm)';
  quoteCard.style.backgroundColor = 'var(--color-surface)';
  quoteCard.style.border = '1px solid var(--color-border)';
  quoteCard.style.marginBottom = 'var(--space-5)';
  quoteCard.style.display = 'flex';
  quoteCard.style.alignItems = 'center';
  quoteCard.style.justifyContent = 'space-between';
  quoteCard.style.fontSize = '0.86rem';

  const quoteLeft = document.createElement('div');
  quoteLeft.style.display = 'flex';
  quoteLeft.style.alignItems = 'center';
  quoteLeft.style.gap = 'var(--space-2)';
  quoteLeft.innerHTML = `<span>${quote.emoji}</span> <span><strong>Daily Study Spark:</strong> "${quote.text}"</span>`;

  const shuffleQuoteBtn = document.createElement('button');
  shuffleQuoteBtn.type = 'button';
  shuffleQuoteBtn.className = 'btn btn-ghost btn-sm';
  shuffleQuoteBtn.style.padding = '2px 8px';
  shuffleQuoteBtn.style.fontSize = '0.78rem';
  shuffleQuoteBtn.textContent = '🎲 New Tip';
  shuffleQuoteBtn.addEventListener('click', () => {
    const nextQ = getRandomStudyQuote();
    quoteLeft.innerHTML = `<span>${nextQ.emoji}</span> <span><strong>Daily Study Spark:</strong> "${nextQ.text}"</span>`;
  });

  quoteCard.appendChild(quoteLeft);
  quoteCard.appendChild(shuffleQuoteBtn);
  container.appendChild(quoteCard);

  // 2. Summary Stat Cards (4 columns)
  const taskStats = getTaskCounts();
  const assignmentStats = getAssignmentCounts();
  const focusMins = getTodayFocusMinutes();
  const syllabusStats = calculateOverallSyllabusProgress();

  const statsGrid = document.createElement('div');
  statsGrid.className = 'stats-grid';

  let taskMetaText = `${taskStats.completedToday} completed today`;
  if (taskStats.overdue > 0) {
    taskMetaText = `<span style="color:var(--color-danger);font-weight:600;">${taskStats.overdue} overdue</span>`;
  }

  // Stat 1: Open Tasks
  const taskStatCard = document.createElement('div');
  taskStatCard.className = 'stat-card';
  taskStatCard.style.cursor = 'pointer';
  taskStatCard.addEventListener('click', () => onNavigate('tasks'));
  taskStatCard.innerHTML = `
    <div class="stat-icon-wrap stat-icon-primary"><span style="font-size:1.3rem;">📝</span></div>
    <div class="stat-body">
      <div class="stat-label">Tasks To-Do</div>
      <div class="stat-value">${taskStats.open}</div>
      <div class="stat-meta">${taskMetaText}</div>
    </div>
  `;
  statsGrid.appendChild(taskStatCard);

  let assignMetaText = 'All in progress';
  if (assignmentStats.dueToday > 0) {
    assignMetaText = `<span style="color:var(--color-warning);font-weight:600;">${assignmentStats.dueToday} due today</span>`;
  } else if (assignmentStats.overdue > 0) {
    assignMetaText = `<span style="color:var(--color-danger);font-weight:600;">${assignmentStats.overdue} overdue</span>`;
  }

  // Stat 2: Assignments
  const assignStatCard = document.createElement('div');
  assignStatCard.className = 'stat-card';
  assignStatCard.style.cursor = 'pointer';
  assignStatCard.addEventListener('click', () => onNavigate('assignments'));
  assignStatCard.innerHTML = `
    <div class="stat-icon-wrap stat-icon-warning"><span style="font-size:1.3rem;">📚</span></div>
    <div class="stat-body">
      <div class="stat-label">Assignments Due</div>
      <div class="stat-value">${assignmentStats.pending}</div>
      <div class="stat-meta">${assignMetaText}</div>
    </div>
  `;
  statsGrid.appendChild(assignStatCard);

  // Stat 3: Focus & Streak
  const focusStatCard = document.createElement('div');
  focusStatCard.className = 'stat-card';
  focusStatCard.style.cursor = 'pointer';
  focusStatCard.addEventListener('click', () => onNavigate('timer'));
  focusStatCard.innerHTML = `
    <div class="stat-icon-wrap stat-icon-info"><span style="font-size:1.3rem;">🔥</span></div>
    <div class="stat-body">
      <div class="stat-label">Study Streak</div>
      <div class="stat-value">${studyStats.currentStreak} Days</div>
      <div class="stat-meta">${focusMins}m focused today (${studyStats.totalHours}h all-time)</div>
    </div>
  `;
  statsGrid.appendChild(focusStatCard);

  // Stat 4: Syllabus Completion
  const syllabusStatCard = document.createElement('div');
  syllabusStatCard.className = 'stat-card';
  syllabusStatCard.style.cursor = 'pointer';
  syllabusStatCard.addEventListener('click', () => onNavigate('syllabus'));
  syllabusStatCard.innerHTML = `
    <div class="stat-icon-wrap stat-icon-success"><span style="font-size:1.3rem;">🎓</span></div>
    <div class="stat-body">
      <div class="stat-label">Syllabus Progress</div>
      <div class="stat-value">${syllabusStats.hasTopics ? syllabusStats.percent + '%' : '—'}</div>
      <div class="stat-meta">${syllabusStats.completedTopics} of ${syllabusStats.totalTopics} topics covered</div>
    </div>
  `;
  statsGrid.appendChild(syllabusStatCard);
  container.appendChild(statsGrid);

  // 3. Main Dashboard Grid
  const grid = document.createElement('div');
  grid.className = 'dashboard-grid';

  // Left Section (Col 7): Today's Schedule & Tasks Due Today
  const leftCol = document.createElement('div');
  leftCol.className = 'col-7';
  leftCol.style.display = 'flex';
  leftCol.style.flexDirection = 'column';
  leftCol.style.gap = 'var(--space-5)';

  leftCol.appendChild(createTodayScheduleCard(state, now, onNavigate));
  leftCol.appendChild(createTasksDueTodayCard(state, () => renderDashboardView(container, onNavigate), onNavigate));
  grid.appendChild(leftCol);

  // Right Section (Col 5): Upcoming Assignments & Syllabus Snapshot
  const rightCol = document.createElement('div');
  rightCol.className = 'col-5';
  rightCol.style.display = 'flex';
  rightCol.style.flexDirection = 'column';
  rightCol.style.gap = 'var(--space-5)';

  rightCol.appendChild(createUpcomingDeadlinesCard(state, onNavigate));
  rightCol.appendChild(createSyllabusSnapshotCard(state, onNavigate));
  grid.appendChild(rightCol);

  container.appendChild(grid);
}

/**
 * Card: Today's Class Timetable
 */
function createTodayScheduleCard(state, now, onNavigate) {
  const card = document.createElement('div');
  card.className = 'card';

  const todayDayOfWeek = now.getDay(); // 0 = Sun ... 6 = Sat
  const weekdayName = getWeekdayName(todayDayOfWeek);
  const currentTimeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

  const todayClasses = state.timetable.filter(c => c.dayOfWeek === todayDayOfWeek);
  todayClasses.sort((a, b) => a.startTime.localeCompare(b.startTime));

  const header = document.createElement('div');
  header.className = 'card-header';
  header.innerHTML = `
    <div class="card-title-wrap">
      <span style="color:var(--color-primary)">${ICONS.timetable}</span>
      <h2 class="card-title">Today's Schedule (${weekdayName})</h2>
    </div>
  `;

  const viewAllBtn = document.createElement('button');
  viewAllBtn.type = 'button';
  viewAllBtn.className = 'btn btn-ghost btn-sm';
  viewAllBtn.textContent = 'Weekly View →';
  viewAllBtn.addEventListener('click', () => onNavigate('timetable'));
  header.appendChild(viewAllBtn);
  card.appendChild(header);

  if (todayClasses.length === 0) {
    const empty = createEmptyState({
      iconName: 'timetable',
      title: 'No classes today',
      description: 'You have no lectures or labs scheduled for today. Enjoy your study time!',
      actionText: 'View Full Timetable',
      onAction: () => onNavigate('timetable')
    });
    card.appendChild(empty);
    return card;
  }

  const list = document.createElement('div');
  list.style.display = 'flex';
  list.style.flexDirection = 'column';
  list.style.gap = 'var(--space-2)';

  for (const session of todayClasses) {
    const item = document.createElement('div');
    item.className = 'item-card';

    // Status: Ongoing, Upcoming, Finished
    let statusBadgeClass = 'chip-not-started';
    let statusText = 'Upcoming';
    if (currentTimeStr >= session.startTime && currentTimeStr <= session.endTime) {
      statusBadgeClass = 'chip-in-progress';
      statusText = 'Ongoing Now';
      item.style.borderColor = 'var(--color-primary)';
      item.style.backgroundColor = 'var(--color-primary-soft)';
    } else if (currentTimeStr > session.endTime) {
      statusBadgeClass = 'chip-completed';
      statusText = 'Finished';
      item.style.opacity = '0.7';
    }

    const course = getCourseById(session.courseId);
    const courseColor = course ? course.color : 'var(--color-primary)';

    const body = document.createElement('div');
    body.className = 'item-body';

    const titleRow = document.createElement('div');
    titleRow.style.display = 'flex';
    titleRow.style.alignItems = 'center';
    titleRow.style.gap = 'var(--space-2)';

    const colorDot = document.createElement('span');
    colorDot.className = 'course-dot';
    colorDot.style.backgroundColor = courseColor;

    const sessionTitle = document.createElement('span');
    sessionTitle.className = 'item-title';
    sessionTitle.textContent = session.subjectName;

    titleRow.appendChild(colorDot);
    titleRow.appendChild(sessionTitle);
    body.appendChild(titleRow);

    const meta = document.createElement('div');
    meta.className = 'item-meta';
    meta.innerHTML = `
      <span>🕒 ${formatDisplayTime(session.startTime)} – ${formatDisplayTime(session.endTime)}</span>
      ${session.room ? `<span>📍 ${session.room}</span>` : ''}
      ${session.instructor ? `<span>👤 ${session.instructor}</span>` : ''}
    `;
    body.appendChild(meta);
    item.appendChild(body);

    const badge = document.createElement('span');
    badge.className = `chip ${statusBadgeClass}`;
    badge.textContent = statusText;
    item.appendChild(badge);

    list.appendChild(item);
  }

  card.appendChild(list);
  return card;
}

/**
 * Card: Tasks Due Today
 */
function createTasksDueTodayCard(state, onRefresh, onNavigate) {
  const card = document.createElement('div');
  card.className = 'card';

  const openTasks = state.tasks.filter(t => !t.completed);
  const tasksDueToday = openTasks.filter(t => t.dueDate && isDueToday(t.dueDate));

  const header = document.createElement('div');
  header.className = 'card-header';
  header.innerHTML = `
    <div class="card-title-wrap">
      <span style="color:var(--color-primary)">${ICONS.tasks}</span>
      <h2 class="card-title">Tasks Due Today</h2>
      <span class="chip chip-due-soon">${tasksDueToday.length}</span>
    </div>
  `;

  const viewAllBtn = document.createElement('button');
  viewAllBtn.type = 'button';
  viewAllBtn.className = 'btn btn-ghost btn-sm';
  viewAllBtn.textContent = 'All Tasks →';
  viewAllBtn.addEventListener('click', () => onNavigate('tasks'));
  header.appendChild(viewAllBtn);
  card.appendChild(header);

  if (tasksDueToday.length === 0) {
    const empty = createEmptyState({
      iconName: 'check',
      title: 'Nothing due today!',
      description: 'You have no pressing task deadlines for today. Check your full list or add one.',
      actionText: 'View All Tasks',
      onAction: () => onNavigate('tasks')
    });
    card.appendChild(empty);
    return card;
  }

  const list = document.createElement('div');
  list.style.display = 'flex';
  list.style.flexDirection = 'column';
  list.style.gap = 'var(--space-2)';

  for (const task of tasksDueToday) {
    const item = document.createElement('div');
    item.className = 'item-card';

    const checkLabel = document.createElement('label');
    checkLabel.className = 'checkbox-wrap';
    const checkInput = document.createElement('input');
    checkInput.type = 'checkbox';
    checkInput.className = 'sr-only';
    checkInput.setAttribute('aria-label', `Complete task "${task.title}"`);
    const checkCustom = document.createElement('span');
    checkCustom.className = 'checkbox-custom';
    checkCustom.innerHTML = ICONS.check;

    checkInput.addEventListener('change', () => {
      toggleTaskComplete(task.id);
      triggerConfetti();
      showToast('Task completed! 🎉 Great progress.', 'success');
      onRefresh();
    });

    checkLabel.appendChild(checkInput);
    checkLabel.appendChild(checkCustom);
    item.appendChild(checkLabel);

    const body = document.createElement('div');
    body.className = 'item-body';

    const titleEl = document.createElement('div');
    titleEl.className = 'item-title';
    titleEl.textContent = task.title;
    body.appendChild(titleEl);

    const meta = document.createElement('div');
    meta.className = 'item-meta';
    if (task.courseId) {
      const course = getCourseById(task.courseId);
      if (course) {
        const courseTag = document.createElement('span');
        courseTag.className = 'course-tag';
        courseTag.textContent = course.code || course.name;
        meta.appendChild(courseTag);
      }
    }
    meta.appendChild(createPriorityChip(task.priority));
    body.appendChild(meta);
    item.appendChild(body);

    list.appendChild(item);
  }

  card.appendChild(list);
  return card;
}

/**
 * Card: Upcoming Assignments
 */
function createUpcomingDeadlinesCard(state, onNavigate) {
  const card = document.createElement('div');
  card.className = 'card';

  const header = document.createElement('div');
  header.className = 'card-header';
  header.innerHTML = `
    <div class="card-title-wrap">
      <span style="color:var(--color-warning)">${ICONS.assignments}</span>
      <h2 class="card-title">Next Deadlines</h2>
    </div>
  `;

  const viewAllBtn = document.createElement('button');
  viewAllBtn.type = 'button';
  viewAllBtn.className = 'btn btn-ghost btn-sm';
  viewAllBtn.textContent = 'View All →';
  viewAllBtn.addEventListener('click', () => onNavigate('assignments'));
  header.appendChild(viewAllBtn);
  card.appendChild(header);

  const pendingAssignments = state.assignments.filter(a => a.status !== 'submitted');
  pendingAssignments.sort((a, b) => a.dueDate.localeCompare(b.dueDate));
  const topUpcoming = pendingAssignments.slice(0, 3);

  if (topUpcoming.length === 0) {
    const empty = createEmptyState({
      iconName: 'assignments',
      title: 'No pending coursework',
      description: 'You have no pending assignments right now.',
      actionText: 'Add Assignment',
      onAction: () => onNavigate('assignments')
    });
    card.appendChild(empty);
    return card;
  }

  const list = document.createElement('div');
  list.style.display = 'flex';
  list.style.flexDirection = 'column';
  list.style.gap = 'var(--space-2)';

  for (const assign of topUpcoming) {
    const item = document.createElement('div');
    item.className = 'item-card';

    const body = document.createElement('div');
    body.className = 'item-body';

    const titleEl = document.createElement('div');
    titleEl.className = 'item-title';
    titleEl.textContent = assign.title;
    body.appendChild(titleEl);

    const meta = document.createElement('div');
    meta.className = 'item-meta';

    if (assign.courseId) {
      const course = getCourseById(assign.courseId);
      if (course) {
        const tag = document.createElement('span');
        tag.className = 'course-tag';
        tag.textContent = course.code || course.name;
        meta.appendChild(tag);
      }
    }

    const deadlineInfo = getDeadlineInfo(assign.dueDate);
    const chip = document.createElement('span');
    chip.className = `chip ${deadlineInfo.status === 'overdue' ? 'chip-overdue' : deadlineInfo.status === 'today' || deadlineInfo.status === 'soon' ? 'chip-due-soon' : 'chip-not-started'}`;
    chip.textContent = deadlineInfo.text;
    meta.appendChild(chip);

    body.appendChild(meta);
    item.appendChild(body);
    list.appendChild(item);
  }

  card.appendChild(list);
  return card;
}

/**
 * Card: Course Syllabus Snapshot
 */
function createSyllabusSnapshotCard(state, onNavigate) {
  const card = document.createElement('div');
  card.className = 'card';

  const header = document.createElement('div');
  header.className = 'card-header';
  header.innerHTML = `
    <div class="card-title-wrap">
      <span style="color:var(--color-success)">${ICONS.syllabus}</span>
      <h2 class="card-title">Syllabus Coverage</h2>
    </div>
  `;

  const viewAllBtn = document.createElement('button');
  viewAllBtn.type = 'button';
  viewAllBtn.className = 'btn btn-ghost btn-sm';
  viewAllBtn.textContent = 'View All →';
  viewAllBtn.addEventListener('click', () => onNavigate('syllabus'));
  header.appendChild(viewAllBtn);
  card.appendChild(header);

  if (state.courses.length === 0) {
    const empty = createEmptyState({
      iconName: 'syllabus',
      title: 'No courses added',
      description: 'Add your subjects and curriculum topics to monitor coverage.',
      actionText: 'Set Up Courses',
      onAction: () => onNavigate('syllabus')
    });
    card.appendChild(empty);
    return card;
  }

  const list = document.createElement('div');
  list.style.display = 'flex';
  list.style.flexDirection = 'column';
  list.style.gap = 'var(--space-3)';

  for (const course of state.courses) {
    const stats = calculateCourseProgress(course);

    const courseItem = document.createElement('div');
    courseItem.style.display = 'flex';
    courseItem.style.flexDirection = 'column';
    courseItem.style.gap = '6px';

    const infoRow = document.createElement('div');
    infoRow.style.display = 'flex';
    infoRow.style.alignItems = 'center';
    infoRow.style.justifyContent = 'space-between';

    const nameLabel = document.createElement('span');
    nameLabel.style.fontSize = '0.88rem';
    nameLabel.style.fontWeight = '600';
    nameLabel.textContent = `${course.code ? course.code + ' — ' : ''}${course.name}`;

    const percentLabel = document.createElement('span');
    percentLabel.style.fontSize = '0.82rem';
    percentLabel.style.fontWeight = '700';
    percentLabel.style.color = 'var(--color-primary)';
    percentLabel.textContent = stats.hasTopics ? `${stats.percent}%` : 'No topics';

    infoRow.appendChild(nameLabel);
    infoRow.appendChild(percentLabel);
    courseItem.appendChild(infoRow);

    const progressWrap = document.createElement('div');
    progressWrap.className = 'progress-container';

    const bar = document.createElement('div');
    bar.className = 'progress-bar';
    bar.style.width = stats.hasTopics ? `${stats.percent}%` : '0%';
    if (course.color) {
      bar.style.background = course.color;
    }

    progressWrap.appendChild(bar);
    courseItem.appendChild(progressWrap);
    list.appendChild(courseItem);
  }

  card.appendChild(list);
  return card;
}
