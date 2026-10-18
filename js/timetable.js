/**
 * CampusFlow — Weekly Timetable Module
 * Class schedule management, weekday navigation, overlap detection, ongoing/upcoming status.
 * Compliant with RULES.md Section 7 and ARCHITECTURE.md.
 */

import {
  getState,
  addTimetableEntry,
  updateTimetableEntry,
  deleteTimetableEntry,
  getCourseById
} from './state.js';
import {
  formatDisplayTime,
  getWeekdayName,
  timesOverlap
} from './utils.js';
import {
  showToast,
  showModal,
  showConfirmModal,
  createEmptyState,
  ICONS
} from './ui.js';

let selectedDay = new Date().getDay(); // Default to today's weekday

/**
 * Render Timetable View into container
 * @param {HTMLElement} container
 * @param {(viewName: string) => void} onNavigate
 */
export function renderTimetableView(container, onNavigate) {
  container.innerHTML = '';

  const state = getState();
  const now = new Date();
  const todayDayOfWeek = now.getDay();

  // Header
  const header = document.createElement('div');
  header.className = 'page-header';

  const titleGroup = document.createElement('div');
  titleGroup.className = 'page-title-group';

  const title = document.createElement('h1');
  title.className = 'page-title';
  title.textContent = 'Weekly Class Schedule 🗓️';

  const sub = document.createElement('p');
  sub.className = 'page-subtitle';
  sub.textContent = `${state.timetable.length} classes scheduled across the week 🏫`;

  titleGroup.appendChild(title);
  titleGroup.appendChild(sub);

  const actions = document.createElement('div');
  actions.className = 'page-actions';

  const addBtn = document.createElement('button');
  addBtn.type = 'button';
  addBtn.className = 'btn btn-primary';
  addBtn.innerHTML = `${ICONS.plus} <span>Add Class ➕</span>`;
  addBtn.addEventListener('click', () => openClassModal(null, selectedDay, () => renderTimetableView(container, onNavigate)));

  actions.appendChild(addBtn);
  header.appendChild(titleGroup);
  header.appendChild(actions);
  container.appendChild(header);

  // Weekday Navigation Pills (Mon through Sun)
  const daysBar = document.createElement('div');
  daysBar.className = 'filter-bar';

  const pillsWrap = document.createElement('div');
  pillsWrap.className = 'filter-pills';
  pillsWrap.style.flexWrap = 'wrap';

  // Order Monday(1) through Sunday(0)
  const weekDaysOrder = [1, 2, 3, 4, 5, 6, 0];

  for (const d of weekDaysOrder) {
    const isSelected = selectedDay === d;
    const isToday = todayDayOfWeek === d;
    const classesForDay = state.timetable.filter(c => c.dayOfWeek === d);

    const pill = document.createElement('button');
    pill.type = 'button';
    pill.className = `filter-pill ${isSelected ? 'active' : ''}`;
    pill.innerHTML = `
      <span>${getWeekdayName(d, 'short')}</span>
      ${isToday ? '<span style="color:var(--color-primary);font-size:0.68rem;font-weight:700;">(Today)</span>' : ''}
      <span class="nav-badge" style="margin-left:4px;font-size:0.68rem;padding:1px 5px;">${classesForDay.length}</span>
    `;
    pill.addEventListener('click', () => {
      selectedDay = d;
      renderTimetableView(container, onNavigate);
    });
    pillsWrap.appendChild(pill);
  }

  daysBar.appendChild(pillsWrap);
  container.appendChild(daysBar);

  // Schedule for Selected Day
  const scheduleSection = document.createElement('div');
  scheduleSection.className = 'day-schedule-wrap';

  renderDaySchedule(scheduleSection, selectedDay, container, onNavigate);
  container.appendChild(scheduleSection);
}

/**
 * Render chronological list of classes for the selected day
 */
function renderDaySchedule(section, dayOfWeek, pageContainer, onNavigate) {
  section.innerHTML = '';

  const state = getState();
  const now = new Date();
  const isToday = now.getDay() === dayOfWeek;
  const currentTimeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

  const classes = state.timetable.filter(c => c.dayOfWeek === dayOfWeek);
  classes.sort((a, b) => a.startTime.localeCompare(b.startTime));

  const dayHeading = document.createElement('div');
  dayHeading.style.display = 'flex';
  dayHeading.style.alignItems = 'center';
  dayHeading.style.justifyContent = 'space-between';
  dayHeading.style.marginBottom = 'var(--space-4)';

  const headingText = document.createElement('h2');
  headingText.style.fontSize = '1.15rem';
  headingText.style.fontWeight = '700';
  headingText.textContent = `${getWeekdayName(dayOfWeek)} Agenda ${isToday ? '• Today' : ''}`;
  dayHeading.appendChild(headingText);

  section.appendChild(dayHeading);

  if (classes.length === 0) {
    const empty = createEmptyState({
      iconName: 'timetable',
      title: `No classes on ${getWeekdayName(dayOfWeek)}`,
      description: 'You have no lectures or practical sessions scheduled for this day.',
      actionText: 'Add a Class',
      onAction: () => openClassModal(null, dayOfWeek, () => renderTimetableView(pageContainer, onNavigate))
    });
    section.appendChild(empty);
    return;
  }

  const list = document.createElement('div');
  list.style.display = 'flex';
  list.style.flexDirection = 'column';
  list.style.gap = 'var(--space-3)';

  // Check for time overlaps among this day's classes
  const overlappingIds = new Set();
  for (let i = 0; i < classes.length; i++) {
    for (let j = i + 1; j < classes.length; j++) {
      if (timesOverlap(classes[i].startTime, classes[i].endTime, classes[j].startTime, classes[j].endTime)) {
        overlappingIds.add(classes[i].id);
        overlappingIds.add(classes[j].id);
      }
    }
  }

  for (const session of classes) {
    const card = createClassCard(session, isToday, currentTimeStr, overlappingIds.has(session.id), () => renderTimetableView(pageContainer, onNavigate));
    list.appendChild(card);
  }

  section.appendChild(list);
}

/**
 * Single Class Session Card
 */
function createClassCard(session, isToday, currentTimeStr, hasOverlap, onRefresh) {
  const card = document.createElement('div');
  card.className = 'item-card';

  const course = getCourseById(session.courseId);
  const color = course ? course.color : 'var(--color-primary)';
  card.style.borderLeft = `4px solid ${color}`;

  // State indicators
  let statusBadgeClass = 'chip-not-started';
  let statusText = 'Scheduled';

  if (isToday) {
    if (currentTimeStr >= session.startTime && currentTimeStr <= session.endTime) {
      statusBadgeClass = 'chip-in-progress';
      statusText = 'Ongoing Now';
      card.style.backgroundColor = 'var(--color-primary-soft)';
      card.style.borderColor = 'var(--color-primary)';
    } else if (currentTimeStr > session.endTime) {
      statusBadgeClass = 'chip-completed';
      statusText = 'Completed Today';
      card.style.opacity = '0.7';
    } else {
      statusBadgeClass = 'chip-due-soon';
      statusText = 'Upcoming Today';
    }
  }

  const body = document.createElement('div');
  body.className = 'item-body';

  const titleRow = document.createElement('div');
  titleRow.style.display = 'flex';
  titleRow.style.alignItems = 'center';
  titleRow.style.gap = 'var(--space-2)';

  const titleEl = document.createElement('span');
  titleEl.className = 'item-title';
  titleEl.textContent = session.subjectName;
  titleRow.appendChild(titleEl);

  if (hasOverlap) {
    const warn = document.createElement('span');
    warn.className = 'priority-pill priority-high';
    warn.textContent = 'Time Overlap';
    warn.title = 'This class overlaps with another session on this day';
    titleRow.appendChild(warn);
  }

  body.appendChild(titleRow);

  const meta = document.createElement('div');
  meta.className = 'item-meta';
  meta.innerHTML = `
    <span>🕒 <strong>${formatDisplayTime(session.startTime)} – ${formatDisplayTime(session.endTime)}</strong></span>
    ${session.room ? `<span>📍 ${session.room}</span>` : ''}
    ${session.instructor ? `<span>👤 ${session.instructor}</span>` : ''}
  `;
  body.appendChild(meta);
  card.appendChild(body);

  // Status Badge
  const badge = document.createElement('span');
  badge.className = `chip ${statusBadgeClass}`;
  badge.textContent = statusText;
  card.appendChild(badge);

  // Actions
  const actions = document.createElement('div');
  actions.className = 'item-actions';

  const editBtn = document.createElement('button');
  editBtn.type = 'button';
  editBtn.className = 'btn btn-ghost btn-icon btn-sm';
  editBtn.setAttribute('aria-label', `Edit class: ${session.subjectName}`);
  editBtn.innerHTML = ICONS.edit;
  editBtn.addEventListener('click', () => openClassModal(session, session.dayOfWeek, onRefresh));
  actions.appendChild(editBtn);

  const deleteBtn = document.createElement('button');
  deleteBtn.type = 'button';
  deleteBtn.className = 'btn btn-danger-ghost btn-icon btn-sm';
  deleteBtn.setAttribute('aria-label', `Delete class: ${session.subjectName}`);
  deleteBtn.innerHTML = ICONS.trash;
  deleteBtn.addEventListener('click', () => {
    showConfirmModal({
      title: 'Delete Class',
      message: `Delete "${session.subjectName}" from your schedule?`,
      confirmText: 'Delete Class',
      confirmVariant: 'danger',
      onConfirm: () => {
        deleteTimetableEntry(session.id);
        showToast('Class removed from schedule', 'info');
        onRefresh();
      }
    });
  });
  actions.appendChild(deleteBtn);

  card.appendChild(actions);
  return card;
}

/**
 * Open Modal to Add or Edit a Timetable Entry
 */
export function openClassModal(existingClass = null, defaultDay = 1, onSaved) {
  const isEditing = Boolean(existingClass);
  const state = getState();

  const form = document.createElement('form');
  form.noValidate = true;

  // Row 1: Subject / Name & Linked Course
  const row1 = document.createElement('div');
  row1.className = 'form-row';

  const nameGroup = document.createElement('div');
  nameGroup.className = 'form-group';
  const nameLabel = document.createElement('label');
  nameLabel.className = 'form-label';
  nameLabel.innerHTML = `Subject / Class Name <span class="required-mark" aria-hidden="true">*</span>`;
  const nameInput = document.createElement('input');
  nameInput.type = 'text';
  nameInput.className = 'form-input';
  nameInput.placeholder = 'e.g. Data Mining Lecture';
  nameInput.value = existingClass ? existingClass.subjectName : '';
  const nameError = document.createElement('div');
  nameError.className = 'form-error';
  nameError.style.display = 'none';

  nameGroup.appendChild(nameLabel);
  nameGroup.appendChild(nameInput);
  nameGroup.appendChild(nameError);
  row1.appendChild(nameGroup);

  const courseGroup = document.createElement('div');
  courseGroup.className = 'form-group';
  const courseLabel = document.createElement('label');
  courseLabel.className = 'form-label';
  courseLabel.textContent = 'Linked Course (Optional)';
  const courseSelect = document.createElement('select');
  courseSelect.className = 'form-select';
  const defaultOpt = document.createElement('option');
  defaultOpt.value = '';
  defaultOpt.textContent = 'None';
  courseSelect.appendChild(defaultOpt);

  for (const c of state.courses) {
    const opt = document.createElement('option');
    opt.value = c.id;
    opt.textContent = `${c.code ? c.code + ' - ' : ''}${c.name}`;
    if (existingClass && existingClass.courseId === c.id) opt.selected = true;
    courseSelect.appendChild(opt);
  }
  courseGroup.appendChild(courseLabel);
  courseGroup.appendChild(courseSelect);
  row1.appendChild(courseGroup);
  form.appendChild(row1);

  // Row 2: Day of Week, Start Time, End Time
  const row2 = document.createElement('div');
  row2.className = 'form-row';

  const dayGroup = document.createElement('div');
  dayGroup.className = 'form-group';
  const dayLabel = document.createElement('label');
  dayLabel.className = 'form-label';
  dayLabel.textContent = 'Day of Week';
  const daySelect = document.createElement('select');
  daySelect.className = 'form-select';

  const daysOrder = [1, 2, 3, 4, 5, 6, 0];
  const initialDay = existingClass ? existingClass.dayOfWeek : defaultDay;
  for (const d of daysOrder) {
    const opt = document.createElement('option');
    opt.value = d;
    opt.textContent = getWeekdayName(d);
    if (initialDay === d) opt.selected = true;
    daySelect.appendChild(opt);
  }
  dayGroup.appendChild(dayLabel);
  dayGroup.appendChild(daySelect);
  row2.appendChild(dayGroup);

  const startGroup = document.createElement('div');
  startGroup.className = 'form-group';
  const startLabel = document.createElement('label');
  startLabel.className = 'form-label';
  startLabel.innerHTML = `Start Time <span class="required-mark" aria-hidden="true">*</span>`;
  const startInput = document.createElement('input');
  startInput.type = 'time';
  startInput.className = 'form-input';
  startInput.value = existingClass ? existingClass.startTime : '09:00';
  startGroup.appendChild(startLabel);
  startGroup.appendChild(startInput);
  row2.appendChild(startGroup);

  const endGroup = document.createElement('div');
  endGroup.className = 'form-group';
  const endLabel = document.createElement('label');
  endLabel.className = 'form-label';
  endLabel.innerHTML = `End Time <span class="required-mark" aria-hidden="true">*</span>`;
  const endInput = document.createElement('input');
  endInput.type = 'time';
  endInput.className = 'form-input';
  endInput.value = existingClass ? existingClass.endTime : '10:30';
  const timeError = document.createElement('div');
  timeError.className = 'form-error';
  timeError.style.display = 'none';

  endGroup.appendChild(endLabel);
  endGroup.appendChild(endInput);
  endGroup.appendChild(timeError);
  row2.appendChild(endGroup);
  form.appendChild(row2);

  // Row 3: Room / Location & Instructor
  const row3 = document.createElement('div');
  row3.className = 'form-row';

  const roomGroup = document.createElement('div');
  roomGroup.className = 'form-group';
  const roomLabel = document.createElement('label');
  roomLabel.className = 'form-label';
  roomLabel.textContent = 'Room / Hall / Link';
  const roomInput = document.createElement('input');
  roomInput.type = 'text';
  roomInput.className = 'form-input';
  roomInput.placeholder = 'e.g. Hall B or Zoom';
  roomInput.value = existingClass ? existingClass.room : '';
  roomGroup.appendChild(roomLabel);
  roomGroup.appendChild(roomInput);
  row3.appendChild(roomGroup);

  const instGroup = document.createElement('div');
  instGroup.className = 'form-group';
  const instLabel = document.createElement('label');
  instLabel.className = 'form-label';
  instLabel.textContent = 'Professor / Instructor';
  const instInput = document.createElement('input');
  instInput.type = 'text';
  instInput.className = 'form-input';
  instInput.placeholder = 'e.g. Dr. Vance';
  instInput.value = existingClass ? existingClass.instructor : '';
  instGroup.appendChild(instLabel);
  instGroup.appendChild(instInput);
  row3.appendChild(instGroup);
  form.appendChild(row3);

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
  submitBtn.textContent = isEditing ? 'Save Changes' : 'Add Class';

  actions.appendChild(cancelBtn);
  actions.appendChild(submitBtn);
  form.appendChild(actions);

  const modal = showModal({
    title: isEditing ? 'Edit Class Session' : 'Add Class Session',
    contentNode: form
  });

  cancelBtn.addEventListener('click', () => modal.close());

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    let valid = true;
    const nameVal = nameInput.value.trim();
    if (!nameVal) {
      nameError.textContent = 'Please enter a class name.';
      nameError.style.display = 'block';
      nameInput.classList.add('is-invalid');
      nameInput.focus();
      valid = false;
    } else {
      nameError.style.display = 'none';
      nameInput.classList.remove('is-invalid');
    }

    const startVal = startInput.value;
    const endVal = endInput.value;
    if (!startVal || !endVal || endVal <= startVal) {
      timeError.textContent = 'End time must be after start time.';
      timeError.style.display = 'block';
      endInput.classList.add('is-invalid');
      if (valid) endInput.focus();
      valid = false;
    } else {
      timeError.style.display = 'none';
      endInput.classList.remove('is-invalid');
    }

    if (!valid) return;

    const targetDay = parseInt(daySelect.value, 10);

    // Overlap check
    const existingClassesOnDay = state.timetable.filter(c =>
      c.dayOfWeek === targetDay && (!existingClass || c.id !== existingClass.id)
    );
    const hasOverlap = existingClassesOnDay.some(c => timesOverlap(startVal, endVal, c.startTime, c.endTime));

    const executeSave = () => {
      const payload = {
        subjectName: nameVal,
        courseId: courseSelect.value || null,
        dayOfWeek: targetDay,
        startTime: startVal,
        endTime: endVal,
        room: roomInput.value.trim(),
        instructor: instInput.value.trim()
      };

      if (isEditing) {
        updateTimetableEntry(existingClass.id, payload);
        showToast('Class updated', 'success');
      } else {
        addTimetableEntry(payload);
        showToast('Class added to schedule', 'success');
      }

      modal.close();
      if (typeof onSaved === 'function') onSaved();
    };

    if (hasOverlap) {
      showConfirmModal({
        title: 'Schedule Overlap Warning',
        message: 'This class overlaps with another session already scheduled at this time. Keep this overlap anyway?',
        confirmText: 'Keep Overlap & Save',
        confirmVariant: 'primary',
        onConfirm: executeSave
      });
    } else {
      executeSave();
    }
  });
}
