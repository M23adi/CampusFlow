/**
 * CampusFlow — Assignments Management Module
 * Coursework tracking, nearest deadline sorting, status workflows, and validation.
 * Compliant with RULES.md and ARCHITECTURE.md.
 */

import {
  getState,
  addAssignment,
  updateAssignment,
  deleteAssignment,
  getCourseById
} from './state.js';
import {
  formatDisplayDate,
  getDeadlineInfo,
  isOverdue,
  isDueToday
} from './utils.js';
import {
  showToast,
  showModal,
  showConfirmModal,
  createEmptyState,
  createPriorityChip,
  createStatusChip,
  triggerConfetti,
  ICONS
} from './ui.js';

let currentFilter = 'active'; // 'active' | 'all' | 'submitted' | 'overdue'
let searchQuery = '';
let courseFilter = '';

/**
 * Render Assignments View into container.
 * @param {HTMLElement} container
 * @param {(viewName: string) => void} onNavigate
 */
export function renderAssignmentsView(container, onNavigate) {
  container.innerHTML = '';

  const state = getState();

  // Header & Add Action
  const header = document.createElement('div');
  header.className = 'page-header';

  const titleGroup = document.createElement('div');
  titleGroup.className = 'page-title-group';

  const title = document.createElement('h1');
  title.className = 'page-title';
  title.textContent = 'Assignments & Deadlines 📚';

  const sub = document.createElement('p');
  sub.className = 'page-subtitle';
  const pendingCount = state.assignments.filter(a => a.status !== 'submitted').length;
  sub.textContent = `${pendingCount} ${pendingCount === 1 ? 'assignment' : 'assignments'} pending submission ⏰`;

  titleGroup.appendChild(title);
  titleGroup.appendChild(sub);

  const actions = document.createElement('div');
  actions.className = 'page-actions';

  const addBtn = document.createElement('button');
  addBtn.type = 'button';
  addBtn.className = 'btn btn-primary';
  addBtn.innerHTML = `${ICONS.plus} <span>Add Assignment ➕</span>`;
  addBtn.addEventListener('click', () => openAssignmentModal(null, () => renderAssignmentsView(container, onNavigate), onNavigate));

  actions.appendChild(addBtn);
  header.appendChild(titleGroup);
  header.appendChild(actions);
  container.appendChild(header);

  // Filter Bar
  const filterBar = document.createElement('div');
  filterBar.className = 'filter-bar';

  const pillsWrap = document.createElement('div');
  pillsWrap.className = 'filter-pills';
  pillsWrap.setAttribute('role', 'tablist');

  const filterTabs = [
    { id: 'active', label: '⏳ Pending' },
    { id: 'all', label: '📋 All' },
    { id: 'overdue', label: '🚨 Overdue' },
    { id: 'submitted', label: '✅ Submitted' }
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
      renderAssignmentsView(container, onNavigate);
    });
    pillsWrap.appendChild(pill);
  }

  // Course selector filter if courses exist
  const searchWrap = document.createElement('div');
  searchWrap.className = 'search-input-wrap';
  searchWrap.innerHTML = ICONS.search;

  const searchInput = document.createElement('input');
  searchInput.type = 'search';
  searchInput.className = 'form-input search-input';
  searchInput.placeholder = 'Search assignments...';
  searchInput.value = searchQuery;
  searchInput.setAttribute('aria-label', 'Search assignments');
  searchInput.addEventListener('input', (e) => {
    searchQuery = e.target.value.toLowerCase();
    renderAssignmentsList(listContainer, container, onNavigate);
  });

  searchWrap.appendChild(searchInput);
  filterBar.appendChild(pillsWrap);
  filterBar.appendChild(searchWrap);
  container.appendChild(filterBar);

  // List Container
  const listContainer = document.createElement('div');
  listContainer.className = 'assignments-list';
  container.appendChild(listContainer);

  renderAssignmentsList(listContainer, container, onNavigate);
}

/**
 * Render the filtered assignments list
 */
function renderAssignmentsList(listContainer, pageContainer, onNavigate) {
  listContainer.innerHTML = '';

  const state = getState();
  let assignments = [...state.assignments];

  // 1. Status Filter
  if (currentFilter === 'active') {
    assignments = assignments.filter(a => a.status !== 'submitted');
  } else if (currentFilter === 'submitted') {
    assignments = assignments.filter(a => a.status === 'submitted');
  } else if (currentFilter === 'overdue') {
    assignments = assignments.filter(a => a.status !== 'submitted' && a.dueDate && isOverdue(a.dueDate));
  }

  // 2. Search Query
  if (searchQuery.trim()) {
    assignments = assignments.filter(a =>
      a.title.toLowerCase().includes(searchQuery) ||
      (a.notes && a.notes.toLowerCase().includes(searchQuery))
    );
  }

  // 3. Sorting by nearest deadline
  assignments.sort((a, b) => {
    if (a.status === 'submitted' && b.status !== 'submitted') return 1;
    if (a.status !== 'submitted' && b.status === 'submitted') return -1;
    return a.dueDate.localeCompare(b.dueDate);
  });

  if (assignments.length === 0) {
    let emptyTitle = 'No assignments found';
    let emptyDesc = 'You have no assignments in this view.';
    if (currentFilter === 'active' && !searchQuery) {
      emptyTitle = 'All assignments submitted!';
      emptyDesc = 'You have completed all your pending coursework. Take a well-earned break.';
    }

    const empty = createEmptyState({
      iconName: 'assignments',
      title: emptyTitle,
      description: emptyDesc,
      actionText: 'Add Assignment',
      onAction: () => openAssignmentModal(null, () => renderAssignmentsView(pageContainer, onNavigate), onNavigate)
    });
    listContainer.appendChild(empty);
    return;
  }

  for (const assign of assignments) {
    const card = createAssignmentCard(assign, () => renderAssignmentsView(pageContainer, onNavigate), onNavigate);
    listContainer.appendChild(card);
  }
}

/**
 * Single Assignment Card
 */
function createAssignmentCard(assign, onRefresh, onNavigate) {
  const card = document.createElement('div');
  const isSubmitted = assign.status === 'submitted';
  card.className = `item-card ${isSubmitted ? 'is-completed' : ''}`;

  const course = getCourseById(assign.courseId);

  // Body
  const body = document.createElement('div');
  body.className = 'item-body';

  const titleRow = document.createElement('div');
  titleRow.style.display = 'flex';
  titleRow.style.alignItems = 'center';
  titleRow.style.gap = 'var(--space-2)';

  const titleEl = document.createElement('span');
  titleEl.className = 'item-title';
  titleEl.textContent = assign.title;
  titleRow.appendChild(titleEl);
  body.appendChild(titleRow);

  if (assign.notes) {
    const notesEl = document.createElement('div');
    notesEl.style.fontSize = '0.82rem';
    notesEl.style.color = 'var(--color-text-muted)';
    notesEl.style.marginTop = '2px';
    notesEl.textContent = assign.notes;
    body.appendChild(notesEl);
  }

  // Meta row: Course, Due Date, Priority, Status
  const meta = document.createElement('div');
  meta.className = 'item-meta';

  if (course) {
    const courseTag = document.createElement('span');
    courseTag.className = 'course-tag';
    const dot = document.createElement('span');
    dot.className = 'course-dot';
    dot.style.backgroundColor = course.color || 'var(--color-primary)';
    courseTag.appendChild(dot);
    courseTag.appendChild(document.createTextNode(course.code || course.name));
    meta.appendChild(courseTag);
  } else {
    const unlinked = document.createElement('span');
    unlinked.className = 'course-tag';
    unlinked.style.color = 'var(--color-text-muted)';
    unlinked.textContent = 'Unlinked Course';
    meta.appendChild(unlinked);
  }

  // Due Date / Deadline status
  const deadlineInfo = getDeadlineInfo(assign.dueDate);
  const dateChip = document.createElement('span');

  if (isSubmitted) {
    dateChip.className = 'chip chip-completed';
    dateChip.textContent = `Submitted (${formatDisplayDate(assign.dueDate)})`;
  } else if (isOverdue(assign.dueDate)) {
    dateChip.className = 'chip chip-overdue';
    dateChip.textContent = deadlineInfo.text;
  } else if (isDueToday(assign.dueDate)) {
    dateChip.className = 'chip chip-due-soon';
    dateChip.textContent = 'Due Today';
  } else {
    dateChip.className = 'chip chip-not-started';
    dateChip.textContent = `Due ${formatDisplayDate(assign.dueDate)} (${deadlineInfo.text})`;
  }
  meta.appendChild(dateChip);

  // Status Selector
  const statusSelect = document.createElement('select');
  statusSelect.className = 'form-select btn-sm';
  statusSelect.style.width = 'auto';
  statusSelect.style.height = '30px';
  statusSelect.style.padding = '0 8px';
  statusSelect.style.fontSize = '0.78rem';
  statusSelect.style.fontWeight = '650';

  const statusOpts = [
    { value: 'not-started', label: 'Not started' },
    { value: 'in-progress', label: 'In progress' },
    { value: 'submitted', label: 'Submitted ✓' }
  ];

  for (const opt of statusOpts) {
    const o = document.createElement('option');
    o.value = opt.value;
    o.textContent = opt.label;
    if (assign.status === opt.value) o.selected = true;
    statusSelect.appendChild(o);
  }

  statusSelect.addEventListener('change', (e) => {
    const newStatus = e.target.value;
    updateAssignment(assign.id, { status: newStatus });
    if (newStatus === 'submitted') {
      triggerConfetti();
      showToast('🎉 Assignment submitted! Excellent accomplishment.', 'success');
    } else {
      showToast(`Assignment status updated to "${newStatus}"`, 'success');
    }
    onRefresh();
  });
  meta.appendChild(statusSelect);

  // Priority
  if (assign.priority) {
    meta.appendChild(createPriorityChip(assign.priority));
  }

  body.appendChild(meta);
  card.appendChild(body);

  // Actions
  const actions = document.createElement('div');
  actions.className = 'item-actions';

  const editBtn = document.createElement('button');
  editBtn.type = 'button';
  editBtn.className = 'btn btn-ghost btn-icon btn-sm';
  editBtn.setAttribute('aria-label', `Edit assignment: ${assign.title}`);
  editBtn.innerHTML = ICONS.edit;
  editBtn.addEventListener('click', () => openAssignmentModal(assign, onRefresh, onNavigate));

  const deleteBtn = document.createElement('button');
  deleteBtn.type = 'button';
  deleteBtn.className = 'btn btn-danger-ghost btn-icon btn-sm';
  deleteBtn.setAttribute('aria-label', `Delete assignment: ${assign.title}`);
  deleteBtn.innerHTML = ICONS.trash;
  deleteBtn.addEventListener('click', () => {
    showConfirmModal({
      title: 'Delete Assignment',
      message: `Are you sure you want to permanently delete "${assign.title}"?`,
      confirmText: 'Delete Assignment',
      confirmVariant: 'danger',
      onConfirm: () => {
        deleteAssignment(assign.id);
        showToast('Assignment deleted', 'info');
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
 * Open Modal to Add or Edit an Assignment
 */
export function openAssignmentModal(existingAssign = null, onSaved, onNavigate) {
  const isEditing = Boolean(existingAssign);
  const state = getState();

  // If no courses exist, guide user to create one
  if (state.courses.length === 0) {
    showConfirmModal({
      title: 'Course Required',
      message: 'Assignments must be associated with a course. Would you like to create your first course now in the Syllabus section?',
      confirmText: 'Go to Syllabus',
      confirmVariant: 'primary',
      onConfirm: () => {
        if (typeof onNavigate === 'function') onNavigate('syllabus');
      }
    });
    return;
  }

  const form = document.createElement('form');
  form.noValidate = true;

  // Title
  const titleGroup = document.createElement('div');
  titleGroup.className = 'form-group';
  const titleLabel = document.createElement('label');
  titleLabel.className = 'form-label';
  titleLabel.innerHTML = `Assignment Title <span class="required-mark" aria-hidden="true">*</span>`;
  const titleInput = document.createElement('input');
  titleInput.type = 'text';
  titleInput.className = 'form-input';
  titleInput.placeholder = 'e.g. Midterm Lab Report on Distributed Systems';
  titleInput.value = existingAssign ? existingAssign.title : '';
  const titleError = document.createElement('div');
  titleError.className = 'form-error';
  titleError.style.display = 'none';

  titleGroup.appendChild(titleLabel);
  titleGroup.appendChild(titleInput);
  titleGroup.appendChild(titleError);
  form.appendChild(titleGroup);

  // Row: Course & Due Date
  const row1 = document.createElement('div');
  row1.className = 'form-row';

  // Course selector
  const courseGroup = document.createElement('div');
  courseGroup.className = 'form-group';
  const courseLabel = document.createElement('label');
  courseLabel.className = 'form-label';
  courseLabel.innerHTML = `Course <span class="required-mark" aria-hidden="true">*</span>`;
  const courseSelect = document.createElement('select');
  courseSelect.className = 'form-select';

  for (const c of state.courses) {
    const opt = document.createElement('option');
    opt.value = c.id;
    opt.textContent = `${c.code ? c.code + ' - ' : ''}${c.name}`;
    if (existingAssign && existingAssign.courseId === c.id) opt.selected = true;
    courseSelect.appendChild(opt);
  }
  courseGroup.appendChild(courseLabel);
  courseGroup.appendChild(courseSelect);
  row1.appendChild(courseGroup);

  // Due Date
  const dateGroup = document.createElement('div');
  dateGroup.className = 'form-group';
  const dateLabel = document.createElement('label');
  dateLabel.className = 'form-label';
  dateLabel.innerHTML = `Due Date <span class="required-mark" aria-hidden="true">*</span>`;
  const dateInput = document.createElement('input');
  dateInput.type = 'date';
  dateInput.className = 'form-input';
  dateInput.value = existingAssign ? existingAssign.dueDate : '';
  const dateError = document.createElement('div');
  dateError.className = 'form-error';
  dateError.style.display = 'none';

  dateGroup.appendChild(dateLabel);
  dateGroup.appendChild(dateInput);
  dateGroup.appendChild(dateError);
  row1.appendChild(dateGroup);
  form.appendChild(row1);

  // Row: Priority & Status
  const row2 = document.createElement('div');
  row2.className = 'form-row';

  const prioGroup = document.createElement('div');
  prioGroup.className = 'form-group';
  const prioLabel = document.createElement('label');
  prioLabel.className = 'form-label';
  prioLabel.textContent = 'Priority';
  const prioSelect = document.createElement('select');
  prioSelect.className = 'form-select';
  for (const p of [
    { value: 'medium', label: 'Medium Priority' },
    { value: 'high', label: 'High Priority' },
    { value: 'low', label: 'Low Priority' }
  ]) {
    const opt = document.createElement('option');
    opt.value = p.value;
    opt.textContent = p.label;
    if (existingAssign && existingAssign.priority === p.value) opt.selected = true;
    prioSelect.appendChild(opt);
  }
  prioGroup.appendChild(prioLabel);
  prioGroup.appendChild(prioSelect);
  row2.appendChild(prioGroup);

  const statusGroup = document.createElement('div');
  statusGroup.className = 'form-group';
  const statusLabel = document.createElement('label');
  statusLabel.className = 'form-label';
  statusLabel.textContent = 'Status';
  const statusSelect = document.createElement('select');
  statusSelect.className = 'form-select';
  for (const s of [
    { value: 'not-started', label: 'Not started' },
    { value: 'in-progress', label: 'In progress' },
    { value: 'submitted', label: 'Submitted' }
  ]) {
    const opt = document.createElement('option');
    opt.value = s.value;
    opt.textContent = s.label;
    if (existingAssign && existingAssign.status === s.value) opt.selected = true;
    statusSelect.appendChild(opt);
  }
  statusGroup.appendChild(statusLabel);
  statusGroup.appendChild(statusSelect);
  row2.appendChild(statusGroup);
  form.appendChild(row2);

  // Notes
  const notesGroup = document.createElement('div');
  notesGroup.className = 'form-group';
  const notesLabel = document.createElement('label');
  notesLabel.className = 'form-label';
  notesLabel.textContent = 'Notes & Submission Requirements';
  const notesArea = document.createElement('textarea');
  notesArea.className = 'form-textarea';
  notesArea.placeholder = 'e.g. Upload PDF to portal and submit physical signed sheet...';
  notesArea.value = existingAssign ? existingAssign.notes : '';
  notesGroup.appendChild(notesLabel);
  notesGroup.appendChild(notesArea);
  form.appendChild(notesGroup);

  // Form actions
  const formActions = document.createElement('div');
  formActions.className = 'form-actions';

  const cancelBtn = document.createElement('button');
  cancelBtn.type = 'button';
  cancelBtn.className = 'btn btn-secondary';
  cancelBtn.textContent = 'Cancel';

  const submitBtn = document.createElement('button');
  submitBtn.type = 'submit';
  submitBtn.className = 'btn btn-primary';
  submitBtn.textContent = isEditing ? 'Save Changes' : 'Create Assignment';

  formActions.appendChild(cancelBtn);
  formActions.appendChild(submitBtn);
  form.appendChild(formActions);

  const modal = showModal({
    title: isEditing ? 'Edit Assignment' : 'Add New Assignment',
    contentNode: form
  });

  cancelBtn.addEventListener('click', () => modal.close());

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    let valid = true;
    const titleVal = titleInput.value.trim();
    if (!titleVal) {
      titleError.textContent = 'Please enter an assignment title.';
      titleError.style.display = 'block';
      titleInput.classList.add('is-invalid');
      titleInput.focus();
      valid = false;
    } else {
      titleError.style.display = 'none';
      titleInput.classList.remove('is-invalid');
    }

    const dateVal = dateInput.value.trim();
    if (!dateVal) {
      dateError.textContent = 'Please select a due date.';
      dateError.style.display = 'block';
      dateInput.classList.add('is-invalid');
      if (valid) dateInput.focus();
      valid = false;
    } else {
      dateError.style.display = 'none';
      dateInput.classList.remove('is-invalid');
    }

    if (!valid) return;

    const payload = {
      title: titleVal,
      courseId: courseSelect.value,
      dueDate: dateVal,
      priority: prioSelect.value,
      status: statusSelect.value,
      notes: notesArea.value.trim()
    };

    if (isEditing) {
      updateAssignment(existingAssign.id, payload);
      showToast('Assignment updated', 'success');
    } else {
      addAssignment(payload);
      showToast('Assignment created', 'success');
    }

    modal.close();
    if (typeof onSaved === 'function') onSaved();
  });
}
