/**
 * CampusFlow — Tasks Management Module
 * Filtering, searching, sorting, modal creation/editing, completion toggles, and deletion.
 * Compliant with RULES.md and ARCHITECTURE.md.
 */

import {
  getState,
  addTask,
  updateTask,
  toggleTaskComplete,
  deleteTask,
  getCourseById
} from './state.js';
import {
  formatDisplayDate,
  isOverdue,
  isDueToday,
  getDeadlineInfo
} from './utils.js';
import {
  showToast,
  showModal,
  showConfirmModal,
  createEmptyState,
  createPriorityChip,
  triggerConfetti,
  ICONS
} from './ui.js';

let currentFilter = 'open'; // 'all' | 'open' | 'completed'
let searchQuery = '';

/**
 * Render the entire Tasks View into the provided container.
 * @param {HTMLElement} container
 * @param {() => void} [onNavigate]
 */
export function renderTasksView(container, onNavigate) {
  container.innerHTML = '';

  const state = getState();

  // Header & Add Action
  const header = document.createElement('div');
  header.className = 'page-header';

  const titleGroup = document.createElement('div');
  titleGroup.className = 'page-title-group';

  const title = document.createElement('h1');
  title.className = 'page-title';
  title.textContent = 'Tasks & To-Dos 📝';

  const sub = document.createElement('p');
  sub.className = 'page-subtitle';
  const openCount = state.tasks.filter(t => !t.completed).length;
  sub.textContent = `${openCount} ${openCount === 1 ? 'task' : 'tasks'} waiting for your attention`;

  titleGroup.appendChild(title);
  titleGroup.appendChild(sub);

  const actions = document.createElement('div');
  actions.className = 'page-actions';

  const addBtn = document.createElement('button');
  addBtn.type = 'button';
  addBtn.className = 'btn btn-primary';
  addBtn.innerHTML = `${ICONS.plus} <span>Add Task ➕</span>`;
  addBtn.addEventListener('click', () => openTaskFormModal(null, () => renderTasksView(container, onNavigate)));

  actions.appendChild(addBtn);
  header.appendChild(titleGroup);
  header.appendChild(actions);
  container.appendChild(header);

  // Filter Bar (Tabs & Search)
  const filterBar = document.createElement('div');
  filterBar.className = 'filter-bar';

  const pillsWrap = document.createElement('div');
  pillsWrap.className = 'filter-pills';
  pillsWrap.setAttribute('role', 'tablist');

  const filterTabs = [
    { id: 'open', label: '⏳ Open' },
    { id: 'all', label: '📋 All Tasks' },
    { id: 'completed', label: '✅ Completed' }
  ];

  for (const tab of filterTabs) {
    const pill = document.createElement('button');
    pill.type = 'button';
    pill.className = `filter-pill ${currentFilter === tab.id ? 'active' : ''}`;
    pill.textContent = tab.label;
    pill.setAttribute('role', 'tab');
    pill.setAttribute('aria-selected', currentFilter === tab.id ? 'true' : 'false');
    pill.addEventListener('click', () => {
      currentFilter = tab.id;
      renderTasksView(container, onNavigate);
    });
    pillsWrap.appendChild(pill);
  }

  const searchWrap = document.createElement('div');
  searchWrap.className = 'search-input-wrap';
  searchWrap.innerHTML = ICONS.search;

  const searchInput = document.createElement('input');
  searchInput.type = 'search';
  searchInput.className = 'form-input search-input';
  searchInput.placeholder = 'Search tasks or notes...';
  searchInput.value = searchQuery;
  searchInput.setAttribute('aria-label', 'Search tasks');
  searchInput.addEventListener('input', (e) => {
    searchQuery = e.target.value.toLowerCase();
    renderTasksList(listContainer, container, onNavigate);
  });

  searchWrap.appendChild(searchInput);
  filterBar.appendChild(pillsWrap);
  filterBar.appendChild(searchWrap);
  container.appendChild(filterBar);

  // List Container
  const listContainer = document.createElement('div');
  listContainer.className = 'tasks-list';
  container.appendChild(listContainer);

  renderTasksList(listContainer, container, onNavigate);
}

/**
 * Render the filtered tasks list
 */
function renderTasksList(listContainer, pageContainer, onNavigate) {
  listContainer.innerHTML = '';

  const state = getState();
  let tasks = [...state.tasks];

  // 1. Status Filter
  if (currentFilter === 'open') {
    tasks = tasks.filter(t => !t.completed);
  } else if (currentFilter === 'completed') {
    tasks = tasks.filter(t => t.completed);
  }

  // 2. Search Query Filter
  if (searchQuery.trim()) {
    tasks = tasks.filter(t =>
      t.title.toLowerCase().includes(searchQuery) ||
      (t.notes && t.notes.toLowerCase().includes(searchQuery))
    );
  }

  // 3. Sorting: open tasks sorted by due date (nearest first, undated last), then priority
  tasks.sort((a, b) => {
    if (a.completed !== b.completed) return a.completed ? 1 : -1;
    if (a.dueDate && b.dueDate) return a.dueDate.localeCompare(b.dueDate);
    if (a.dueDate && !b.dueDate) return -1;
    if (!a.dueDate && b.dueDate) return 1;

    const priorityWeight = { high: 3, medium: 2, low: 1 };
    return (priorityWeight[b.priority] || 2) - (priorityWeight[a.priority] || 2);
  });

  if (tasks.length === 0) {
    let emptyTitle = 'No tasks found';
    let emptyDesc = 'You have no tasks matching this filter.';
    if (currentFilter === 'open' && !searchQuery) {
      emptyTitle = 'All caught up!';
      emptyDesc = 'You have completed all your tasks. Add a new one to keep your momentum going.';
    }

    const empty = createEmptyState({
      iconName: 'tasks',
      title: emptyTitle,
      description: emptyDesc,
      actionText: 'Add New Task',
      onAction: () => openTaskFormModal(null, () => renderTasksView(pageContainer, onNavigate))
    });
    listContainer.appendChild(empty);
    return;
  }

  for (const task of tasks) {
    const card = createTaskCard(task, () => renderTasksView(pageContainer, onNavigate));
    listContainer.appendChild(card);
  }
}

/**
 * Build single Task Card DOM node
 */
function createTaskCard(task, onRefresh) {
  const card = document.createElement('div');
  card.className = `item-card ${task.completed ? 'is-completed' : ''}`;

  // Checkbox
  const checkLabel = document.createElement('label');
  checkLabel.className = 'checkbox-wrap';
  checkLabel.title = task.completed ? 'Mark incomplete' : 'Mark completed';

  const checkInput = document.createElement('input');
  checkInput.type = 'checkbox';
  checkInput.className = 'sr-only';
  checkInput.checked = task.completed;
  checkInput.setAttribute('aria-label', `Mark task "${task.title}" as ${task.completed ? 'incomplete' : 'complete'}`);

  const checkCustom = document.createElement('span');
  checkCustom.className = 'checkbox-custom';
  checkCustom.innerHTML = ICONS.check;

  checkInput.addEventListener('change', () => {
    const willBeCompleted = !task.completed;
    toggleTaskComplete(task.id);
    if (willBeCompleted) {
      triggerConfetti();
      showToast('Task completed! 🎉 Great job keeping your momentum.', 'success');
    } else {
      showToast('Task marked incomplete', 'info');
    }
    onRefresh();
  });

  checkLabel.appendChild(checkInput);
  checkLabel.appendChild(checkCustom);
  card.appendChild(checkLabel);

  // Body
  const body = document.createElement('div');
  body.className = 'item-body';

  const titleEl = document.createElement('div');
  titleEl.className = 'item-title';
  titleEl.textContent = task.title;
  body.appendChild(titleEl);

  if (task.notes) {
    const notesEl = document.createElement('div');
    notesEl.style.fontSize = '0.82rem';
    notesEl.style.color = 'var(--color-text-muted)';
    notesEl.style.marginTop = '2px';
    notesEl.textContent = task.notes;
    body.appendChild(notesEl);
  }

  // Metadata Row (Course, Due Date, Priority)
  const meta = document.createElement('div');
  meta.className = 'item-meta';

  if (task.courseId) {
    const course = getCourseById(task.courseId);
    if (course) {
      const courseTag = document.createElement('span');
      courseTag.className = 'course-tag';
      const dot = document.createElement('span');
      dot.className = 'course-dot';
      dot.style.backgroundColor = course.color || 'var(--color-primary)';
      courseTag.appendChild(dot);
      const nameNode = document.createTextNode(course.code || course.name);
      courseTag.appendChild(nameNode);
      meta.appendChild(courseTag);
    }
  }

  // Due Date Chip
  if (task.dueDate) {
    const deadline = getDeadlineInfo(task.dueDate);
    const dateChip = document.createElement('span');
    if (!task.completed && isOverdue(task.dueDate)) {
      dateChip.className = 'chip chip-overdue';
      dateChip.textContent = deadline.text;
    } else if (!task.completed && isDueToday(task.dueDate)) {
      dateChip.className = 'chip chip-due-soon';
      dateChip.textContent = 'Due Today';
    } else {
      dateChip.className = 'chip chip-not-started';
      dateChip.textContent = formatDisplayDate(task.dueDate);
    }
    meta.appendChild(dateChip);
  }

  // Priority
  if (task.priority) {
    meta.appendChild(createPriorityChip(task.priority));
  }

  body.appendChild(meta);
  card.appendChild(body);

  // Actions
  const actions = document.createElement('div');
  actions.className = 'item-actions';

  const editBtn = document.createElement('button');
  editBtn.type = 'button';
  editBtn.className = 'btn btn-ghost btn-icon btn-sm';
  editBtn.setAttribute('aria-label', `Edit task: ${task.title}`);
  editBtn.innerHTML = ICONS.edit;
  editBtn.addEventListener('click', () => openTaskFormModal(task, onRefresh));

  const deleteBtn = document.createElement('button');
  deleteBtn.type = 'button';
  deleteBtn.className = 'btn btn-danger-ghost btn-icon btn-sm';
  deleteBtn.setAttribute('aria-label', `Delete task: ${task.title}`);
  deleteBtn.innerHTML = ICONS.trash;
  deleteBtn.addEventListener('click', () => {
    showConfirmModal({
      title: 'Delete Task',
      message: `Are you sure you want to permanently delete "${task.title}"?`,
      confirmText: 'Delete Task',
      confirmVariant: 'danger',
      onConfirm: () => {
        deleteTask(task.id);
        showToast('Task deleted', 'info');
        onRefresh();
      }
    });
  });

  actions.appendChild(editBtn);
  actions.appendChild(deleteBtn);
  card.appendChild(actions);

  return card;
}

/**
 * Open Modal to Add or Edit a Task
 * @param {object|null} existingTask
 * @param {() => void} onSaved
 */
export function openTaskFormModal(existingTask = null, onSaved) {
  const isEditing = Boolean(existingTask);
  const state = getState();

  const form = document.createElement('form');
  form.className = 'task-form';
  form.noValidate = true;

  // Title
  const titleGroup = document.createElement('div');
  titleGroup.className = 'form-group';
  const titleLabel = document.createElement('label');
  titleLabel.className = 'form-label';
  titleLabel.innerHTML = `Task Title <span class="required-mark" aria-hidden="true">*</span>`;
  const titleInput = document.createElement('input');
  titleInput.type = 'text';
  titleInput.className = 'form-input';
  titleInput.required = true;
  titleInput.placeholder = 'e.g. Read Operating Systems Chapter 3';
  titleInput.value = existingTask ? existingTask.title : '';
  const titleError = document.createElement('div');
  titleError.className = 'form-error';
  titleError.style.display = 'none';

  titleGroup.appendChild(titleLabel);
  titleGroup.appendChild(titleInput);
  titleGroup.appendChild(titleError);
  form.appendChild(titleGroup);

  // Row: Course & Priority
  const row1 = document.createElement('div');
  row1.className = 'form-row';

  // Course dropdown
  const courseGroup = document.createElement('div');
  courseGroup.className = 'form-group';
  const courseLabel = document.createElement('label');
  courseLabel.className = 'form-label';
  courseLabel.textContent = 'Linked Course (Optional)';
  const courseSelect = document.createElement('select');
  courseSelect.className = 'form-select';

  const defaultCourseOpt = document.createElement('option');
  defaultCourseOpt.value = '';
  defaultCourseOpt.textContent = 'None / General';
  courseSelect.appendChild(defaultCourseOpt);

  for (const c of state.courses) {
    const opt = document.createElement('option');
    opt.value = c.id;
    opt.textContent = `${c.code ? c.code + ' - ' : ''}${c.name}`;
    if (existingTask && existingTask.courseId === c.id) opt.selected = true;
    courseSelect.appendChild(opt);
  }
  courseGroup.appendChild(courseLabel);
  courseGroup.appendChild(courseSelect);
  row1.appendChild(courseGroup);

  // Priority dropdown
  const prioGroup = document.createElement('div');
  prioGroup.className = 'form-group';
  const prioLabel = document.createElement('label');
  prioLabel.className = 'form-label';
  prioLabel.textContent = 'Priority';
  const prioSelect = document.createElement('select');
  prioSelect.className = 'form-select';

  const prios = [
    { value: 'medium', label: 'Medium Priority' },
    { value: 'high', label: 'High Priority' },
    { value: 'low', label: 'Low Priority' }
  ];
  for (const p of prios) {
    const opt = document.createElement('option');
    opt.value = p.value;
    opt.textContent = p.label;
    if (existingTask && existingTask.priority === p.value) opt.selected = true;
    prioSelect.appendChild(opt);
  }
  prioGroup.appendChild(prioLabel);
  prioGroup.appendChild(prioSelect);
  row1.appendChild(prioGroup);
  form.appendChild(row1);

  // Due Date
  const dateGroup = document.createElement('div');
  dateGroup.className = 'form-group';
  const dateLabel = document.createElement('label');
  dateLabel.className = 'form-label';
  dateLabel.textContent = 'Due Date (Optional)';
  const dateInput = document.createElement('input');
  dateInput.type = 'date';
  dateInput.className = 'form-input';
  dateInput.value = existingTask ? existingTask.dueDate : '';
  const dateHelper = document.createElement('div');
  dateHelper.className = 'form-helper';
  dateHelper.textContent = 'Leave blank if this task is unscheduled or self-paced.';
  dateGroup.appendChild(dateLabel);
  dateGroup.appendChild(dateInput);
  dateGroup.appendChild(dateHelper);
  form.appendChild(dateGroup);

  // Notes
  const notesGroup = document.createElement('div');
  notesGroup.className = 'form-group';
  const notesLabel = document.createElement('label');
  notesLabel.className = 'form-label';
  notesLabel.textContent = 'Notes / Details';
  const notesArea = document.createElement('textarea');
  notesArea.className = 'form-textarea';
  notesArea.placeholder = 'Any additional details, links, or notes...';
  notesArea.value = existingTask ? existingTask.notes : '';
  notesGroup.appendChild(notesLabel);
  notesGroup.appendChild(notesArea);
  form.appendChild(notesGroup);

  // Form Action buttons
  const formActions = document.createElement('div');
  formActions.className = 'form-actions';

  const cancelBtn = document.createElement('button');
  cancelBtn.type = 'button';
  cancelBtn.className = 'btn btn-secondary';
  cancelBtn.textContent = 'Cancel';

  const submitBtn = document.createElement('button');
  submitBtn.type = 'submit';
  submitBtn.className = 'btn btn-primary';
  submitBtn.textContent = isEditing ? 'Save Changes' : 'Create Task';

  formActions.appendChild(cancelBtn);
  formActions.appendChild(submitBtn);
  form.appendChild(formActions);

  const modal = showModal({
    title: isEditing ? 'Edit Task' : 'Add New Task',
    contentNode: form
  });

  cancelBtn.addEventListener('click', () => modal.close());

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const titleVal = titleInput.value.trim();
    if (!titleVal) {
      titleError.textContent = 'Please enter a task title.';
      titleError.style.display = 'block';
      titleInput.classList.add('is-invalid');
      titleInput.focus();
      return;
    }

    const taskPayload = {
      title: titleVal,
      notes: notesArea.value.trim(),
      courseId: courseSelect.value || null,
      priority: prioSelect.value,
      dueDate: dateInput.value
    };

    if (isEditing) {
      updateTask(existingTask.id, taskPayload);
      showToast('Task updated successfully', 'success');
    } else {
      addTask(taskPayload);
      showToast('Task added to your list', 'success');
    }

    modal.close();
    if (typeof onSaved === 'function') onSaved();
  });
}
