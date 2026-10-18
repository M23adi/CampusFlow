/**
 * CampusFlow — Syllabus & Course Progress Tracker
 * Courses -> Units -> Topics hierarchy, real-time completion percentages, and accordion views.
 * Compliant with RULES.md and ARCHITECTURE.md.
 */

import {
  getState,
  addCourse,
  updateCourse,
  deleteCourse,
  addUnit,
  updateUnit,
  deleteUnit,
  addTopic,
  updateTopic,
  toggleTopicComplete,
  deleteTopic,
  calculateCourseProgress,
  calculateUnitProgress,
  calculateOverallSyllabusProgress
} from './state.js';
import {
  showToast,
  showModal,
  showConfirmModal,
  createEmptyState,
  triggerConfetti,
  ICONS
} from './ui.js';

// Track expanded unit IDs in memory
const expandedUnits = new Set();

/**
 * Render Syllabus View into container.
 * @param {HTMLElement} container
 * @param {(viewName: string) => void} onNavigate
 */
export function renderSyllabusView(container, onNavigate) {
  container.innerHTML = '';

  const state = getState();
  const overall = calculateOverallSyllabusProgress();

  // Header
  const header = document.createElement('div');
  header.className = 'page-header';

  const titleGroup = document.createElement('div');
  titleGroup.className = 'page-title-group';

  const title = document.createElement('h1');
  title.className = 'page-title';
  title.textContent = 'Courses & Syllabus Tracker 🎓';

  const sub = document.createElement('p');
  sub.className = 'page-subtitle';
  sub.textContent = overall.hasTopics
    ? `${overall.percent}% syllabus completed across ${state.courses.length} courses (${overall.completedTopics}/${overall.totalTopics} topics) 📖`
    : `${state.courses.length} courses enrolled`;

  titleGroup.appendChild(title);
  titleGroup.appendChild(sub);

  const actions = document.createElement('div');
  actions.className = 'page-actions';

  const addCourseBtn = document.createElement('button');
  addCourseBtn.type = 'button';
  addCourseBtn.className = 'btn btn-primary';
  addCourseBtn.innerHTML = `${ICONS.plus} <span>Add Course ➕</span>`;
  addCourseBtn.addEventListener('click', () => openCourseModal(null, () => renderSyllabusView(container, onNavigate)));

  actions.appendChild(addCourseBtn);
  header.appendChild(titleGroup);
  header.appendChild(actions);
  container.appendChild(header);

  // If no courses exist
  if (state.courses.length === 0) {
    const empty = createEmptyState({
      iconName: 'syllabus',
      title: 'No courses added yet',
      description: 'Create your academic subjects to track lecture units, topics, and completion progress.',
      actionText: 'Add First Course',
      onAction: () => openCourseModal(null, () => renderSyllabusView(container, onNavigate))
    });
    container.appendChild(empty);
    return;
  }

  // Course Cards List
  const coursesList = document.createElement('div');
  coursesList.style.display = 'flex';
  coursesList.style.flexDirection = 'column';
  coursesList.style.gap = 'var(--space-6)';

  for (const course of state.courses) {
    const card = createCourseCard(course, () => renderSyllabusView(container, onNavigate));
    coursesList.appendChild(card);
  }

  container.appendChild(coursesList);
}

/**
 * Course Card with Units & Topics
 */
function createCourseCard(course, onRefresh) {
  const card = document.createElement('div');
  card.className = 'card';
  card.style.borderTop = `4px solid ${course.color || 'var(--color-primary)'}`;

  const progress = calculateCourseProgress(course);

  // Card Header: Course Title, Code, Progress, Actions
  const header = document.createElement('div');
  header.className = 'card-header';

  const titleGroup = document.createElement('div');
  titleGroup.style.display = 'flex';
  titleGroup.style.flexDirection = 'column';
  titleGroup.style.gap = '2px';

  const titleRow = document.createElement('div');
  titleRow.style.display = 'flex';
  titleRow.style.alignItems = 'center';
  titleRow.style.gap = 'var(--space-2)';

  if (course.code) {
    const codeBadge = document.createElement('span');
    codeBadge.className = 'priority-pill priority-medium';
    codeBadge.style.backgroundColor = 'var(--color-surface-soft)';
    codeBadge.style.color = 'var(--color-text)';
    codeBadge.textContent = course.code;
    titleRow.appendChild(codeBadge);
  }

  const titleEl = document.createElement('h2');
  titleEl.className = 'card-title';
  titleEl.textContent = course.name;
  titleRow.appendChild(titleEl);
  titleGroup.appendChild(titleRow);

  const sub = document.createElement('span');
  sub.className = 'card-subtitle';
  sub.textContent = progress.hasTopics
    ? `${progress.completedTopics} of ${progress.totalTopics} topics covered (${progress.percent}%)`
    : 'No topics added yet';
  titleGroup.appendChild(sub);

  header.appendChild(titleGroup);

  // Actions
  const actions = document.createElement('div');
  actions.className = 'item-actions';

  const addUnitBtn = document.createElement('button');
  addUnitBtn.type = 'button';
  addUnitBtn.className = 'btn btn-secondary btn-sm';
  addUnitBtn.innerHTML = `${ICONS.plus} <span>Add Unit</span>`;
  addUnitBtn.addEventListener('click', () => openUnitModal(course.id, null, onRefresh));
  actions.appendChild(addUnitBtn);

  const editBtn = document.createElement('button');
  editBtn.type = 'button';
  editBtn.className = 'btn btn-ghost btn-icon btn-sm';
  editBtn.setAttribute('aria-label', `Edit course: ${course.name}`);
  editBtn.innerHTML = ICONS.edit;
  editBtn.addEventListener('click', () => openCourseModal(course, onRefresh));
  actions.appendChild(editBtn);

  const deleteBtn = document.createElement('button');
  deleteBtn.type = 'button';
  deleteBtn.className = 'btn btn-danger-ghost btn-icon btn-sm';
  deleteBtn.setAttribute('aria-label', `Delete course: ${course.name}`);
  deleteBtn.innerHTML = ICONS.trash;
  deleteBtn.addEventListener('click', () => {
    showConfirmModal({
      title: 'Delete Course',
      message: `Permanently delete "${course.name}"? All nested units and topics will be removed.`,
      confirmText: 'Delete Course & Syllabus',
      confirmVariant: 'danger',
      onConfirm: () => {
        deleteCourse(course.id);
        showToast('Course removed', 'info');
        onRefresh();
      }
    });
  });
  actions.appendChild(deleteBtn);

  header.appendChild(actions);
  card.appendChild(header);

  // Course Progress Bar
  const progressWrap = document.createElement('div');
  progressWrap.className = 'progress-container';
  progressWrap.style.marginBottom = 'var(--space-4)';
  const bar = document.createElement('div');
  bar.className = 'progress-bar';
  bar.style.width = progress.hasTopics ? `${progress.percent}%` : '0%';
  bar.style.backgroundColor = course.color || 'var(--color-primary)';
  progressWrap.appendChild(bar);
  card.appendChild(progressWrap);

  // Units list
  if (!course.units || course.units.length === 0) {
    const noUnits = document.createElement('div');
    noUnits.style.textAlign = 'center';
    noUnits.style.padding = 'var(--space-4)';
    noUnits.style.color = 'var(--color-text-muted)';
    noUnits.style.fontSize = '0.88rem';
    noUnits.textContent = 'No units added to this course yet. Click "Add Unit" to structure your syllabus.';
    card.appendChild(noUnits);
  } else {
    const unitsContainer = document.createElement('div');
    unitsContainer.style.display = 'flex';
    unitsContainer.style.flexDirection = 'column';
    unitsContainer.style.gap = 'var(--space-3)';

    for (const unit of course.units) {
      const unitEl = createUnitAccordion(course, unit, onRefresh);
      unitsContainer.appendChild(unitEl);
    }
    card.appendChild(unitsContainer);
  }

  return card;
}

/**
 * Unit Accordion with Nested Topics
 */
function createUnitAccordion(course, unit, onRefresh) {
  const isExpanded = expandedUnits.has(unit.id);
  const unitStats = calculateUnitProgress(unit);

  const container = document.createElement('div');
  container.style.border = '1px solid var(--color-border)';
  container.style.borderRadius = 'var(--radius-sm)';
  container.style.backgroundColor = 'var(--color-surface-soft)';
  container.style.overflow = 'hidden';

  // Unit Header / Trigger
  const header = document.createElement('div');
  header.style.display = 'flex';
  header.style.alignItems = 'center';
  header.style.justifyContent = 'space-between';
  header.style.padding = 'var(--space-3) var(--space-4)';
  header.style.cursor = 'pointer';
  header.style.userSelect = 'none';

  const left = document.createElement('div');
  left.style.display = 'flex';
  left.style.alignItems = 'center';
  left.style.gap = 'var(--space-2)';

  const chevron = document.createElement('span');
  chevron.style.color = 'var(--color-text-muted)';
  chevron.innerHTML = isExpanded ? ICONS.chevronUp : ICONS.chevronDown;
  left.appendChild(chevron);

  const title = document.createElement('span');
  title.style.fontWeight = '650';
  title.style.fontSize = '0.92rem';
  title.textContent = unit.title;
  left.appendChild(title);

  const badge = document.createElement('span');
  badge.className = 'chip chip-not-started';
  badge.style.fontSize = '0.72rem';
  badge.textContent = unitStats.hasTopics ? `${unitStats.completedCount}/${unitStats.totalCount} done (${unitStats.percent}%)` : '0 topics';
  left.appendChild(badge);
  header.appendChild(left);

  // Unit Actions
  const actions = document.createElement('div');
  actions.className = 'item-actions';

  const addTopicBtn = document.createElement('button');
  addTopicBtn.type = 'button';
  addTopicBtn.className = 'btn btn-secondary btn-sm';
  addTopicBtn.innerHTML = `${ICONS.plus} <span>Topic</span>`;
  addTopicBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    openTopicModal(course.id, unit.id, null, () => {
      expandedUnits.add(unit.id);
      onRefresh();
    });
  });
  actions.appendChild(addTopicBtn);

  const editUnitBtn = document.createElement('button');
  editUnitBtn.type = 'button';
  editUnitBtn.className = 'btn btn-ghost btn-icon btn-sm';
  editUnitBtn.setAttribute('aria-label', `Edit unit: ${unit.title}`);
  editUnitBtn.innerHTML = ICONS.edit;
  editUnitBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    openUnitModal(course.id, unit, onRefresh);
  });
  actions.appendChild(editUnitBtn);

  const deleteUnitBtn = document.createElement('button');
  deleteUnitBtn.type = 'button';
  deleteUnitBtn.className = 'btn btn-danger-ghost btn-icon btn-sm';
  deleteUnitBtn.setAttribute('aria-label', `Delete unit: ${unit.title}`);
  deleteUnitBtn.innerHTML = ICONS.trash;
  deleteUnitBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    showConfirmModal({
      title: 'Delete Unit',
      message: `Delete unit "${unit.title}" and its ${unit.topics ? unit.topics.length : 0} topics?`,
      confirmText: 'Delete Unit',
      confirmVariant: 'danger',
      onConfirm: () => {
        deleteUnit(course.id, unit.id);
        showToast('Unit deleted', 'info');
        onRefresh();
      }
    });
  });
  actions.appendChild(deleteUnitBtn);

  header.appendChild(actions);

  header.addEventListener('click', () => {
    if (expandedUnits.has(unit.id)) {
      expandedUnits.delete(unit.id);
    } else {
      expandedUnits.add(unit.id);
    }
    onRefresh();
  });

  container.appendChild(header);

  // Expanded Content (Topics List)
  if (isExpanded) {
    const topicsBody = document.createElement('div');
    topicsBody.style.backgroundColor = 'var(--color-surface)';
    topicsBody.style.borderTop = '1px solid var(--color-border)';
    topicsBody.style.padding = 'var(--space-3) var(--space-4)';

    if (!unit.topics || unit.topics.length === 0) {
      const emptyTopic = document.createElement('div');
      emptyTopic.style.fontSize = '0.85rem';
      emptyTopic.style.color = 'var(--color-text-muted)';
      emptyTopic.style.padding = 'var(--space-2) 0';
      emptyTopic.textContent = 'No topics in this unit yet. Add topics to track your progress.';
      topicsBody.appendChild(emptyTopic);
    } else {
      const topicList = document.createElement('div');
      topicList.style.display = 'flex';
      topicList.style.flexDirection = 'column';
      topicList.style.gap = 'var(--space-2)';

      for (const topic of unit.topics) {
        const topicRow = createTopicRow(course, unit, topic, onRefresh);
        topicList.appendChild(topicRow);
      }
      topicsBody.appendChild(topicList);
    }

    container.appendChild(topicsBody);
  }

  return container;
}

/**
 * Single Topic Row with completion checkbox
 */
function createTopicRow(course, unit, topic, onRefresh) {
  const row = document.createElement('div');
  row.style.display = 'flex';
  row.style.alignItems = 'center';
  row.style.justifyContent = 'space-between';
  row.style.padding = '6px 8px';
  row.style.borderRadius = 'var(--radius-xs)';
  row.style.transition = 'background-color var(--transition-fast)';

  row.addEventListener('mouseenter', () => {
    row.style.backgroundColor = 'var(--color-surface-soft)';
  });
  row.addEventListener('mouseleave', () => {
    row.style.backgroundColor = 'transparent';
  });

  const left = document.createElement('div');
  left.style.display = 'flex';
  left.style.alignItems = 'center';
  left.style.gap = 'var(--space-3)';
  left.style.flex = '1';

  const checkLabel = document.createElement('label');
  checkLabel.className = 'checkbox-wrap';

  const checkInput = document.createElement('input');
  checkInput.type = 'checkbox';
  checkInput.className = 'sr-only';
  checkInput.checked = topic.completed;
  checkInput.setAttribute('aria-label', `Mark topic "${topic.title}" as completed`);

  const checkCustom = document.createElement('span');
  checkCustom.className = 'checkbox-custom';
  checkCustom.innerHTML = ICONS.check;

  checkInput.addEventListener('change', () => {
    const willBeCompleted = !topic.completed;
    toggleTopicComplete(course.id, unit.id, topic.id);
    if (willBeCompleted) {
      triggerConfetti();
      showToast('🎉 Topic covered! Great job studying this concept.', 'success');
    } else {
      showToast('Topic marked incomplete', 'info');
    }
    onRefresh();
  });

  checkLabel.appendChild(checkInput);
  checkLabel.appendChild(checkCustom);
  left.appendChild(checkLabel);

  const titleSpan = document.createElement('span');
  titleSpan.style.fontSize = '0.88rem';
  titleSpan.style.color = topic.completed ? 'var(--color-text-muted)' : 'var(--color-text)';
  titleSpan.style.textDecoration = topic.completed ? 'line-through' : 'none';
  titleSpan.textContent = topic.title;
  left.appendChild(titleSpan);

  row.appendChild(left);

  // Topic Actions
  const actions = document.createElement('div');
  actions.className = 'item-actions';

  const editBtn = document.createElement('button');
  editBtn.type = 'button';
  editBtn.className = 'btn btn-ghost btn-icon btn-sm';
  editBtn.setAttribute('aria-label', `Edit topic: ${topic.title}`);
  editBtn.innerHTML = ICONS.edit;
  editBtn.addEventListener('click', () => openTopicModal(course.id, unit.id, topic, onRefresh));
  actions.appendChild(editBtn);

  const deleteBtn = document.createElement('button');
  deleteBtn.type = 'button';
  deleteBtn.className = 'btn btn-danger-ghost btn-icon btn-sm';
  deleteBtn.setAttribute('aria-label', `Delete topic: ${topic.title}`);
  deleteBtn.innerHTML = ICONS.trash;
  deleteBtn.addEventListener('click', () => {
    deleteTopic(course.id, unit.id, topic.id);
    showToast('Topic deleted', 'info');
    onRefresh();
  });
  actions.appendChild(deleteBtn);

  row.appendChild(actions);
  return row;
}

/**
 * Open Modal to Add/Edit Course
 */
export function openCourseModal(existingCourse = null, onSaved) {
  const isEditing = Boolean(existingCourse);

  const form = document.createElement('form');
  form.noValidate = true;

  // Name
  const nameGroup = document.createElement('div');
  nameGroup.className = 'form-group';
  const nameLabel = document.createElement('label');
  nameLabel.className = 'form-label';
  nameLabel.innerHTML = `Course / Subject Name <span class="required-mark" aria-hidden="true">*</span>`;
  const nameInput = document.createElement('input');
  nameInput.type = 'text';
  nameInput.className = 'form-input';
  nameInput.placeholder = 'e.g. Distributed Operating Systems';
  nameInput.value = existingCourse ? existingCourse.name : '';
  const nameError = document.createElement('div');
  nameError.className = 'form-error';
  nameError.style.display = 'none';

  nameGroup.appendChild(nameLabel);
  nameGroup.appendChild(nameInput);
  nameGroup.appendChild(nameError);
  form.appendChild(nameGroup);

  // Row: Code & Color
  const row = document.createElement('div');
  row.className = 'form-row';

  const codeGroup = document.createElement('div');
  codeGroup.className = 'form-group';
  const codeLabel = document.createElement('label');
  codeLabel.className = 'form-label';
  codeLabel.textContent = 'Course Code / Acronym';
  const codeInput = document.createElement('input');
  codeInput.type = 'text';
  codeInput.className = 'form-input';
  codeInput.placeholder = 'e.g. CS401';
  codeInput.value = existingCourse ? existingCourse.code : '';
  codeGroup.appendChild(codeLabel);
  codeGroup.appendChild(codeInput);
  row.appendChild(codeGroup);

  const colorGroup = document.createElement('div');
  colorGroup.className = 'form-group';
  const colorLabel = document.createElement('label');
  colorLabel.className = 'form-label';
  colorLabel.textContent = 'Accent Color';
  const colorSelect = document.createElement('select');
  colorSelect.className = 'form-select';

  const colors = [
    { value: '#6558D9', label: 'Restrained Violet' },
    { value: '#23856D', label: 'Sage Emerald' },
    { value: '#3976B8', label: 'Ocean Blue' },
    { value: '#A96B17', label: 'Warm Amber' },
    { value: '#C64B59', label: 'Muted Rose' }
  ];
  for (const c of colors) {
    const opt = document.createElement('option');
    opt.value = c.value;
    opt.textContent = c.label;
    if (existingCourse && existingCourse.color === c.value) opt.selected = true;
    colorSelect.appendChild(opt);
  }
  colorGroup.appendChild(colorLabel);
  colorGroup.appendChild(colorSelect);
  row.appendChild(colorGroup);
  form.appendChild(row);

  // Form actions
  const actions = document.createElement('div');
  actions.className = 'form-actions';
  const cancelBtn = document.createElement('button');
  cancelBtn.type = 'button';
  cancelBtn.className = 'btn btn-secondary';
  cancelBtn.textContent = 'Cancel';
  const submitBtn = document.createElement('button');
  submitBtn.type = 'submit';
  submitBtn.className = 'btn btn-primary';
  submitBtn.textContent = isEditing ? 'Save Changes' : 'Create Course';

  actions.appendChild(cancelBtn);
  actions.appendChild(submitBtn);
  form.appendChild(actions);

  const modal = showModal({
    title: isEditing ? 'Edit Course' : 'Add New Course',
    contentNode: form
  });

  cancelBtn.addEventListener('click', () => modal.close());

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const nameVal = nameInput.value.trim();
    if (!nameVal) {
      nameError.textContent = 'Please enter a course name.';
      nameError.style.display = 'block';
      nameInput.classList.add('is-invalid');
      nameInput.focus();
      return;
    }

    const payload = {
      name: nameVal,
      code: codeInput.value.trim().toUpperCase(),
      color: colorSelect.value
    };

    if (isEditing) {
      updateCourse(existingCourse.id, payload);
      showToast('Course updated', 'success');
    } else {
      addCourse(payload);
      showToast('Course added to your syllabus', 'success');
    }

    modal.close();
    if (typeof onSaved === 'function') onSaved();
  });
}

/**
 * Open Modal to Add/Edit Unit
 */
export function openUnitModal(courseId, existingUnit = null, onSaved) {
  const isEditing = Boolean(existingUnit);

  const form = document.createElement('form');
  form.noValidate = true;

  const group = document.createElement('div');
  group.className = 'form-group';
  const label = document.createElement('label');
  label.className = 'form-label';
  label.innerHTML = `Unit / Module Title <span class="required-mark" aria-hidden="true">*</span>`;
  const input = document.createElement('input');
  input.type = 'text';
  input.className = 'form-input';
  input.placeholder = 'e.g. Unit 3: Concurrency Control & Transactions';
  input.value = existingUnit ? existingUnit.title : '';
  const error = document.createElement('div');
  error.className = 'form-error';
  error.style.display = 'none';

  group.appendChild(label);
  group.appendChild(input);
  group.appendChild(error);
  form.appendChild(group);

  const actions = document.createElement('div');
  actions.className = 'form-actions';
  const cancelBtn = document.createElement('button');
  cancelBtn.type = 'button';
  cancelBtn.className = 'btn btn-secondary';
  cancelBtn.textContent = 'Cancel';
  const submitBtn = document.createElement('button');
  submitBtn.type = 'submit';
  submitBtn.className = 'btn btn-primary';
  submitBtn.textContent = isEditing ? 'Save Changes' : 'Add Unit';

  actions.appendChild(cancelBtn);
  actions.appendChild(submitBtn);
  form.appendChild(actions);

  const modal = showModal({
    title: isEditing ? 'Edit Unit' : 'Add Unit to Course',
    contentNode: form
  });

  cancelBtn.addEventListener('click', () => modal.close());

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const titleVal = input.value.trim();
    if (!titleVal) {
      error.textContent = 'Please enter a unit title.';
      error.style.display = 'block';
      input.classList.add('is-invalid');
      input.focus();
      return;
    }

    if (isEditing) {
      updateUnit(courseId, existingUnit.id, { title: titleVal });
      showToast('Unit updated', 'success');
    } else {
      addUnit(courseId, { title: titleVal });
      showToast('Unit added', 'success');
    }

    modal.close();
    if (typeof onSaved === 'function') onSaved();
  });
}

/**
 * Open Modal to Add/Edit Topic
 */
export function openTopicModal(courseId, unitId, existingTopic = null, onSaved) {
  const isEditing = Boolean(existingTopic);

  const form = document.createElement('form');
  form.noValidate = true;

  const group = document.createElement('div');
  group.className = 'form-group';
  const label = document.createElement('label');
  label.className = 'form-label';
  label.innerHTML = `Topic Name <span class="required-mark" aria-hidden="true">*</span>`;
  const input = document.createElement('input');
  input.type = 'text';
  input.className = 'form-input';
  input.placeholder = 'e.g. Two-Phase Locking & Timestamp Ordering';
  input.value = existingTopic ? existingTopic.title : '';
  const error = document.createElement('div');
  error.className = 'form-error';
  error.style.display = 'none';

  group.appendChild(label);
  group.appendChild(input);
  group.appendChild(error);
  form.appendChild(group);

  const actions = document.createElement('div');
  actions.className = 'form-actions';
  const cancelBtn = document.createElement('button');
  cancelBtn.type = 'button';
  cancelBtn.className = 'btn btn-secondary';
  cancelBtn.textContent = 'Cancel';
  const submitBtn = document.createElement('button');
  submitBtn.type = 'submit';
  submitBtn.className = 'btn btn-primary';
  submitBtn.textContent = isEditing ? 'Save Changes' : 'Add Topic';

  actions.appendChild(cancelBtn);
  actions.appendChild(submitBtn);
  form.appendChild(actions);

  const modal = showModal({
    title: isEditing ? 'Edit Topic' : 'Add Topic to Unit',
    contentNode: form
  });

  cancelBtn.addEventListener('click', () => modal.close());

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const titleVal = input.value.trim();
    if (!titleVal) {
      error.textContent = 'Please enter a topic name.';
      error.style.display = 'block';
      input.classList.add('is-invalid');
      input.focus();
      return;
    }

    if (isEditing) {
      updateTopic(courseId, unitId, existingTopic.id, { title: titleVal });
      showToast('Topic updated', 'success');
    } else {
      addTopic(courseId, unitId, { title: titleVal });
      showToast('Topic added', 'success');
    }

    modal.close();
    if (typeof onSaved === 'function') onSaved();
  });
}
