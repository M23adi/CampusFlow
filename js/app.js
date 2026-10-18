/**
 * CampusFlow — Application Entry & Navigation Controller
 * Single-page router, responsive sidebar drawer, timer lifecycle synchronization.
 * Compliant with RULES.md and ARCHITECTURE.md.
 */

import { getState, subscribe, getTaskCounts, getAssignmentCounts, getAssignmentAlerts } from './state.js';
import { syncTimerFromState } from './timer.js';
import { openRemindersModal } from './ui.js';
import { renderDashboardView } from './dashboard.js';
import { renderTasksView } from './tasks.js';
import { renderAssignmentsView } from './assignments.js';
import { renderSyllabusView } from './syllabus.js';
import { renderTimetableView } from './timetable.js';
import { renderTimerView } from './timer.js';
import { renderDoubtsView } from './doubts.js';
import { renderSettingsView } from './settings.js';

let currentView = 'dashboard';

/**
 * Initialize Application
 */
export function initApp() {
  const state = getState();

  // 1. Initialize Theme
  const theme = state.preferences.theme || 'light';
  document.documentElement.setAttribute('data-theme', theme);

  // 2. Initialize Navigation and Hash Routing
  setupNavigation();

  // 3. Keep Timer synchronized across backgrounding/visibility change
  syncTimerFromState();
  document.addEventListener('visibilitychange', () => {
    syncTimerFromState();
  });

  // 4. Subscribe to State changes to update navigation badges and active profile
  subscribe(() => {
    updateNavBadges();
    updateUserProfileDisplay();
  });

  // 5. Initial Nav Badges & Profile
  updateNavBadges();
  updateUserProfileDisplay();

  // 6. Route to initial view from hash or default to dashboard
  const initialHash = window.location.hash.replace('#', '').trim();
  const validViews = ['dashboard', 'tasks', 'assignments', 'syllabus', 'timetable', 'timer', 'doubts', 'settings'];
  if (validViews.includes(initialHash)) {
    navigateTo(initialHash);
  } else {
    navigateTo('dashboard');
  }

  // Listen for browser back/forward buttons
  window.addEventListener('hashchange', () => {
    const hash = window.location.hash.replace('#', '').trim();
    if (validViews.includes(hash) && hash !== currentView) {
      navigateTo(hash, false);
    }
  });

  console.log('🎓 CampusFlow Initialized successfully.');
}

/**
 * Setup navigation clicks and mobile drawer handlers
 */
function setupNavigation() {
  const navButtons = document.querySelectorAll('[data-view-target]');
  for (const btn of navButtons) {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const targetView = btn.getAttribute('data-view-target');
      if (targetView) {
        navigateTo(targetView);
        closeMobileSidebar();
      }
    });
  }

  // Reminders alert button in desktop sidebar and mobile topbar
  const handleRemindersClick = (e) => {
    e.preventDefault();
    openRemindersModal(getAssignmentAlerts(), navigateTo);
  };

  const sidebarRemindersBtn = document.getElementById('btn-sidebar-reminders');
  if (sidebarRemindersBtn) {
    sidebarRemindersBtn.addEventListener('click', handleRemindersClick);
  }

  const topbarRemindersBtn = document.getElementById('btn-topbar-reminders');
  if (topbarRemindersBtn) {
    topbarRemindersBtn.addEventListener('click', handleRemindersClick);
  }

  // Mobile drawer hamburger toggle
  const menuBtn = document.getElementById('btn-mobile-menu');
  const sidebar = document.getElementById('app-sidebar');
  const backdrop = document.getElementById('sidebar-backdrop');

  if (menuBtn && sidebar && backdrop) {
    menuBtn.addEventListener('click', () => {
      sidebar.classList.toggle('is-open');
      backdrop.classList.toggle('is-open');
    });

    backdrop.addEventListener('click', () => {
      closeMobileSidebar();
    });
  }
}

function closeMobileSidebar() {
  const sidebar = document.getElementById('app-sidebar');
  const backdrop = document.getElementById('sidebar-backdrop');
  if (sidebar) sidebar.classList.remove('is-open');
  if (backdrop) backdrop.classList.remove('is-open');
}

/**
 * Navigate to a specific view
 * @param {string} viewName
 * @param {boolean} [updateHash=true]
 */
export function navigateTo(viewName, updateHash = true) {
  currentView = viewName;

  if (updateHash) {
    window.location.hash = viewName;
  }

  // Update active state in sidebar and mobile nav
  const allNavLinks = document.querySelectorAll('[data-view-target]');
  for (const link of allNavLinks) {
    const isTarget = link.getAttribute('data-view-target') === viewName;
    link.classList.toggle('active', isTarget);
    link.setAttribute('aria-current', isTarget ? 'page' : 'false');
  }

  // Render target view into main content
  const mainContainer = document.getElementById('main-content-view');
  if (!mainContainer) return;

  // Scroll to top of content
  window.scrollTo(0, 0);

  switch (viewName) {
    case 'dashboard':
      renderDashboardView(mainContainer, navigateTo);
      break;
    case 'tasks':
      renderTasksView(mainContainer, navigateTo);
      break;
    case 'assignments':
      renderAssignmentsView(mainContainer, navigateTo);
      break;
    case 'syllabus':
      renderSyllabusView(mainContainer, navigateTo);
      break;
    case 'timetable':
      renderTimetableView(mainContainer, navigateTo);
      break;
    case 'timer':
      renderTimerView(mainContainer, navigateTo);
      break;
    case 'doubts':
      renderDoubtsView(mainContainer, navigateTo);
      break;
    case 'settings':
      renderSettingsView(mainContainer, navigateTo);
      break;
    default:
      renderDashboardView(mainContainer, navigateTo);
      break;
  }
}

/**
 * Update task, assignment, and alert count badges in the navigation menu
 */
function updateNavBadges() {
  const taskStats = getTaskCounts();
  const assignStats = getAssignmentCounts();
  const alerts = getAssignmentAlerts();

  const taskBadge = document.getElementById('nav-badge-tasks');
  if (taskBadge) {
    taskBadge.textContent = taskStats.open;
    taskBadge.style.display = taskStats.open > 0 ? 'inline-block' : 'none';
  }

  const assignBadge = document.getElementById('nav-badge-assignments');
  if (assignBadge) {
    assignBadge.textContent = assignStats.pending;
    assignBadge.style.display = assignStats.pending > 0 ? 'inline-block' : 'none';
  }

  const sidebarRemBadge = document.getElementById('sidebar-reminder-badge');
  if (sidebarRemBadge) {
    sidebarRemBadge.textContent = alerts.totalUrgentCount;
    sidebarRemBadge.style.display = alerts.totalUrgentCount > 0 ? 'inline-block' : 'none';
  }

  const topbarRemBadge = document.getElementById('topbar-reminder-badge');
  if (topbarRemBadge) {
    topbarRemBadge.textContent = alerts.totalUrgentCount;
    topbarRemBadge.style.display = alerts.totalUrgentCount > 0 ? 'inline-block' : 'none';
  }
}

/**
 * Update User name and initial in sidebar footer
 */
function updateUserProfileDisplay() {
  const state = getState();
  const name = state.preferences.userName || 'Student';

  const nameEl = document.getElementById('profile-display-name');
  if (nameEl) nameEl.textContent = name;

  const avatarEl = document.getElementById('profile-avatar-initial');
  if (avatarEl) {
    avatarEl.textContent = name.charAt(0).toUpperCase() || 'S';
  }
}

// Automatically start app when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initApp);
} else {
  initApp();
}
