/**
 * CampusFlow — Central State Management
 * Single source of truth, subscriptions, safe mutations, and derived academic metrics.
 * Compliant with RULES.md and ARCHITECTURE.md.
 */

import { loadState, saveState, resetState } from './storage.js';
import { generateId, isDueToday, isOverdue, getLocalDateString, getCalendarDaysDiff, getWeekdayName } from './utils.js';

let currentState = loadState();
const listeners = new Set();

/**
 * Subscribe to state changes. Returns unsubscribe function.
 * @param {(state: object, eventType: string, payload?: any) => void} callback
 * @returns {() => void}
 */
export function subscribe(callback) {
  listeners.add(callback);
  return () => listeners.delete(callback);
}

/**
 * Notify all subscribers of state mutation.
 * @param {string} eventType
 * @param {any} [payload]
 */
function notify(eventType, payload) {
  for (const listener of listeners) {
    try {
      listener(currentState, eventType, payload);
    } catch (err) {
      console.error('CampusFlow State Listener Error:', err);
    }
  }
}

/**
 * Persist current state and notify.
 * @param {string} eventType
 * @param {any} [payload]
 */
function commit(eventType, payload) {
  saveState(currentState);
  notify(eventType, payload);
}

/**
 * Get current in-memory snapshot of state.
 * @returns {object}
 */
export function getState() {
  return currentState;
}

/**
 * Replace entire state (e.g. from JSON import).
 * @param {object} newState
 */
export function setFullState(newState) {
  currentState = newState;
  commit('STATE_REPLACED');
}

/**
 * Reset all state to blank or demo data.
 * @param {boolean} withDemo
 */
export function resetApp(withDemo = false) {
  currentState = resetState(withDemo);
  commit('STATE_RESET', { withDemo });
}

/* ==========================================================================
   Preferences
   ========================================================================== */
export function updatePreferences(partial) {
  currentState.preferences = { ...currentState.preferences, ...partial };
  commit('PREFERENCES_UPDATED', partial);
}

/* ==========================================================================
   Tasks
   ========================================================================== */
export function addTask(taskData) {
  const newTask = {
    id: generateId('task'),
    title: taskData.title.trim(),
    notes: (taskData.notes || '').trim(),
    courseId: taskData.courseId || null,
    dueDate: taskData.dueDate || '',
    priority: taskData.priority || 'medium',
    completed: false,
    createdAt: new Date().toISOString(),
    completedAt: null
  };
  currentState.tasks.unshift(newTask);
  commit('TASK_ADDED', newTask);
  return newTask;
}

export function updateTask(taskId, partial) {
  const idx = currentState.tasks.findIndex(t => t.id === taskId);
  if (idx === -1) return null;

  const current = currentState.tasks[idx];
  const updated = {
    ...current,
    ...partial,
    title: partial.title !== undefined ? partial.title.trim() : current.title,
    notes: partial.notes !== undefined ? partial.notes.trim() : current.notes
  };

  // If completed status changed, set timestamp
  if (partial.completed !== undefined) {
    updated.completedAt = partial.completed ? (current.completedAt || new Date().toISOString()) : null;
  }

  currentState.tasks[idx] = updated;
  commit('TASK_UPDATED', updated);
  return updated;
}

export function toggleTaskComplete(taskId) {
  const task = currentState.tasks.find(t => t.id === taskId);
  if (!task) return null;
  return updateTask(taskId, { completed: !task.completed });
}

export function deleteTask(taskId) {
  const prevLen = currentState.tasks.length;
  currentState.tasks = currentState.tasks.filter(t => t.id !== taskId);
  if (currentState.tasks.length !== prevLen) {
    commit('TASK_DELETED', { taskId });
    return true;
  }
  return false;
}

/* ==========================================================================
   Assignments
   ========================================================================== */
export function addAssignment(data) {
  const newAssignment = {
    id: generateId('assignment'),
    title: data.title.trim(),
    courseId: data.courseId,
    dueDate: data.dueDate,
    priority: data.priority || 'medium',
    status: data.status || 'not-started',
    notes: (data.notes || '').trim(),
    createdAt: new Date().toISOString()
  };
  currentState.assignments.unshift(newAssignment);
  commit('ASSIGNMENT_ADDED', newAssignment);
  return newAssignment;
}

export function updateAssignment(assignmentId, partial) {
  const idx = currentState.assignments.findIndex(a => a.id === assignmentId);
  if (idx === -1) return null;

  const current = currentState.assignments[idx];
  const updated = {
    ...current,
    ...partial,
    title: partial.title !== undefined ? partial.title.trim() : current.title,
    notes: partial.notes !== undefined ? partial.notes.trim() : current.notes
  };

  currentState.assignments[idx] = updated;
  commit('ASSIGNMENT_UPDATED', updated);
  return updated;
}

export function deleteAssignment(assignmentId) {
  const prevLen = currentState.assignments.length;
  currentState.assignments = currentState.assignments.filter(a => a.id !== assignmentId);
  if (currentState.assignments.length !== prevLen) {
    commit('ASSIGNMENT_DELETED', { assignmentId });
    return true;
  }
  return false;
}

/* ==========================================================================
   Courses & Syllabus (Courses -> Units -> Topics)
   ========================================================================== */
export function addCourse(courseData) {
  const newCourse = {
    id: generateId('course'),
    name: courseData.name.trim(),
    code: (courseData.code || '').trim().toUpperCase(),
    color: courseData.color || '#6558D9',
    units: []
  };
  currentState.courses.push(newCourse);
  commit('COURSE_ADDED', newCourse);
  return newCourse;
}

export function updateCourse(courseId, partial) {
  const course = currentState.courses.find(c => c.id === courseId);
  if (!course) return null;

  if (partial.name !== undefined) course.name = partial.name.trim();
  if (partial.code !== undefined) course.code = partial.code.trim().toUpperCase();
  if (partial.color !== undefined) course.color = partial.color;

  commit('COURSE_UPDATED', course);
  return course;
}

export function deleteCourse(courseId) {
  const prevLen = currentState.courses.length;
  currentState.courses = currentState.courses.filter(c => c.id !== courseId);
  if (currentState.courses.length !== prevLen) {
    // Safely nullify orphaned references across tasks, assignments, and timetable
    for (const t of currentState.tasks) {
      if (t.courseId === courseId) t.courseId = null;
    }
    for (const a of currentState.assignments) {
      if (a.courseId === courseId) a.courseId = null;
    }
    for (const cl of currentState.timetable) {
      if (cl.courseId === courseId) cl.courseId = null;
    }
    commit('COURSE_DELETED', { courseId });
    return true;
  }
  return false;
}

export function addUnit(courseId, unitData) {
  const course = currentState.courses.find(c => c.id === courseId);
  if (!course) return null;

  const newUnit = {
    id: generateId('unit'),
    title: unitData.title.trim(),
    topics: []
  };
  course.units.push(newUnit);
  commit('UNIT_ADDED', { courseId, unit: newUnit });
  return newUnit;
}

export function updateUnit(courseId, unitId, partial) {
  const course = currentState.courses.find(c => c.id === courseId);
  if (!course) return null;
  const unit = course.units.find(u => u.id === unitId);
  if (!unit) return null;

  if (partial.title !== undefined) unit.title = partial.title.trim();
  commit('UNIT_UPDATED', { courseId, unit });
  return unit;
}

export function deleteUnit(courseId, unitId) {
  const course = currentState.courses.find(c => c.id === courseId);
  if (!course) return false;
  const prevLen = course.units.length;
  course.units = course.units.filter(u => u.id !== unitId);
  if (course.units.length !== prevLen) {
    commit('UNIT_DELETED', { courseId, unitId });
    return true;
  }
  return false;
}

export function addTopic(courseId, unitId, topicData) {
  const course = currentState.courses.find(c => c.id === courseId);
  if (!course) return null;
  const unit = course.units.find(u => u.id === unitId);
  if (!unit) return null;

  const newTopic = {
    id: generateId('topic'),
    title: topicData.title.trim(),
    completed: false
  };
  unit.topics.push(newTopic);
  commit('TOPIC_ADDED', { courseId, unitId, topic: newTopic });
  return newTopic;
}

export function updateTopic(courseId, unitId, topicId, partial) {
  const course = currentState.courses.find(c => c.id === courseId);
  if (!course) return null;
  const unit = course.units.find(u => u.id === unitId);
  if (!unit) return null;
  const topic = unit.topics.find(t => t.id === topicId);
  if (!topic) return null;

  if (partial.title !== undefined) topic.title = partial.title.trim();
  if (partial.completed !== undefined) topic.completed = Boolean(partial.completed);

  commit('TOPIC_UPDATED', { courseId, unitId, topic });
  return topic;
}

export function toggleTopicComplete(courseId, unitId, topicId) {
  const course = currentState.courses.find(c => c.id === courseId);
  if (!course) return null;
  const unit = course.units.find(u => u.id === unitId);
  if (!unit) return null;
  const topic = unit.topics.find(t => t.id === topicId);
  if (!topic) return null;

  topic.completed = !topic.completed;
  commit('TOPIC_TOGGLED', { courseId, unitId, topic });
  return topic;
}

export function deleteTopic(courseId, unitId, topicId) {
  const course = currentState.courses.find(c => c.id === courseId);
  if (!course) return false;
  const unit = course.units.find(u => u.id === unitId);
  if (!unit) return false;
  const prevLen = unit.topics.length;
  unit.topics = unit.topics.filter(t => t.id !== topicId);
  if (unit.topics.length !== prevLen) {
    commit('TOPIC_DELETED', { courseId, unitId, topicId });
    return true;
  }
  return false;
}

/* ==========================================================================
   Timetable (Weekly Classes)
   ========================================================================== */
export function addTimetableEntry(data) {
  const newClass = {
    id: generateId('class'),
    courseId: data.courseId || null,
    subjectName: data.subjectName.trim(),
    dayOfWeek: parseInt(data.dayOfWeek, 10),
    startTime: data.startTime.trim(),
    endTime: data.endTime.trim(),
    room: (data.room || '').trim(),
    instructor: (data.instructor || '').trim()
  };
  currentState.timetable.push(newClass);
  currentState.timetable.sort((a, b) => a.startTime.localeCompare(b.startTime));
  commit('TIMETABLE_ADDED', newClass);
  return newClass;
}

export function updateTimetableEntry(classId, partial) {
  const idx = currentState.timetable.findIndex(c => c.id === classId);
  if (idx === -1) return null;

  const current = currentState.timetable[idx];
  const updated = {
    ...current,
    ...partial,
    subjectName: partial.subjectName !== undefined ? partial.subjectName.trim() : current.subjectName,
    room: partial.room !== undefined ? partial.room.trim() : current.room,
    instructor: partial.instructor !== undefined ? partial.instructor.trim() : current.instructor,
    dayOfWeek: partial.dayOfWeek !== undefined ? parseInt(partial.dayOfWeek, 10) : current.dayOfWeek
  };

  currentState.timetable[idx] = updated;
  currentState.timetable.sort((a, b) => a.startTime.localeCompare(b.startTime));
  commit('TIMETABLE_UPDATED', updated);
  return updated;
}

export function deleteTimetableEntry(classId) {
  const prevLen = currentState.timetable.length;
  currentState.timetable = currentState.timetable.filter(c => c.id !== classId);
  if (currentState.timetable.length !== prevLen) {
    commit('TIMETABLE_DELETED', { classId });
    return true;
  }
  return false;
}

/* ==========================================================================
   Focus Timer & Sessions
   ========================================================================== */
export function addFocusSession(sessionData) {
  const session = {
    id: generateId('focus'),
    startedAt: sessionData.startedAt || new Date().toISOString(),
    completedAt: sessionData.completedAt || new Date().toISOString(),
    durationMinutes: sessionData.durationMinutes || 25,
    mode: sessionData.mode || 'focus',
    taskId: sessionData.taskId || null,
    courseId: sessionData.courseId || null,
    notes: (sessionData.notes || '').trim(),
    completed: true
  };
  currentState.focusSessions.unshift(session);
  commit('FOCUS_SESSION_ADDED', session);
  return session;
}

export function addManualStudySession(data) {
  const targetDate = data.date ? new Date(data.date + 'T12:00:00') : new Date();
  const session = {
    id: generateId('focus'),
    startedAt: targetDate.toISOString(),
    completedAt: targetDate.toISOString(),
    durationMinutes: Math.max(1, parseInt(data.durationMinutes, 10) || 25),
    mode: 'focus',
    taskId: data.taskId || null,
    courseId: data.courseId || null,
    notes: (data.notes || '').trim(),
    completed: true
  };
  currentState.focusSessions.unshift(session);
  commit('FOCUS_SESSION_ADDED', session);
  return session;
}

export function deleteFocusSession(sessionId) {
  const prevLen = currentState.focusSessions.length;
  currentState.focusSessions = currentState.focusSessions.filter(s => s.id !== sessionId);
  if (currentState.focusSessions.length !== prevLen) {
    commit('FOCUS_SESSION_DELETED', { sessionId });
    return true;
  }
  return false;
}

export function updateTimerState(partial) {
  currentState.timerState = { ...currentState.timerState, ...partial };
  commit('TIMER_STATE_UPDATED', partial);
}

/* ==========================================================================
   Derived Academic Metrics & Calculations
   Never manually store stale derived numbers
   ========================================================================== */
export function getCourseById(courseId) {
  if (!courseId) return null;
  return currentState.courses.find(c => c.id === courseId) || null;
}

export function calculateUnitProgress(unit) {
  if (!unit || !unit.topics || unit.topics.length === 0) {
    return { completedCount: 0, totalCount: 0, percent: 0, hasTopics: false };
  }
  const completedCount = unit.topics.filter(t => t.completed).length;
  const totalCount = unit.topics.length;
  const percent = Math.round((completedCount / totalCount) * 100);
  return { completedCount, totalCount, percent, hasTopics: true };
}

export function calculateCourseProgress(course) {
  if (!course || !course.units || course.units.length === 0) {
    return { completedTopics: 0, totalTopics: 0, percent: 0, hasTopics: false };
  }
  let completedTopics = 0;
  let totalTopics = 0;

  for (const unit of course.units) {
    if (unit.topics) {
      for (const t of unit.topics) {
        totalTopics++;
        if (t.completed) completedTopics++;
      }
    }
  }

  const hasTopics = totalTopics > 0;
  const percent = hasTopics ? Math.round((completedTopics / totalTopics) * 100) : 0;
  return { completedTopics, totalTopics, percent, hasTopics };
}

export function calculateOverallSyllabusProgress() {
  const courses = currentState.courses;
  if (!courses || courses.length === 0) {
    return { completedTopics: 0, totalTopics: 0, percent: 0, hasTopics: false };
  }

  let completedTopics = 0;
  let totalTopics = 0;

  for (const course of courses) {
    const stats = calculateCourseProgress(course);
    completedTopics += stats.completedTopics;
    totalTopics += stats.totalTopics;
  }

  const hasTopics = totalTopics > 0;
  const percent = hasTopics ? Math.round((completedTopics / totalTopics) * 100) : 0;
  return { completedTopics, totalTopics, percent, hasTopics };
}

export function getTaskCounts() {
  const tasks = currentState.tasks;
  const openTasks = tasks.filter(t => !t.completed);
  const completedToday = tasks.filter(t => t.completed && t.completedAt && isDueToday(getLocalDateString(new Date(t.completedAt))));
  const overdueTasks = openTasks.filter(t => t.dueDate && isOverdue(t.dueDate));

  return {
    total: tasks.length,
    open: openTasks.length,
    completedToday: completedToday.length,
    overdue: overdueTasks.length
  };
}

export function getAssignmentCounts() {
  const assignments = currentState.assignments;
  const pending = assignments.filter(a => a.status !== 'submitted');
  const overdue = pending.filter(a => a.dueDate && isOverdue(a.dueDate));
  const dueToday = pending.filter(a => a.dueDate && isDueToday(a.dueDate));

  return {
    total: assignments.length,
    pending: pending.length,
    overdue: overdue.length,
    dueToday: dueToday.length
  };
}

export function getTodayFocusMinutes() {
  const todayStr = getLocalDateString();
  const sessions = currentState.focusSessions.filter(s => {
    if (!s.completed || s.mode !== 'focus') return false;
    const sessionDateStr = getLocalDateString(new Date(s.completedAt));
    return sessionDateStr === todayStr;
  });

  return sessions.reduce((acc, curr) => acc + (curr.durationMinutes || 0), 0);
}

/**
 * Detailed Study Session Analytics & Streaks
 */
export function getStudyStats() {
  const sessions = (currentState.focusSessions || []).filter(s => s.completed && s.mode === 'focus');

  let totalMinutes = 0;
  const sessionsByDate = new Map();
  const courseMinutesMap = new Map();

  for (const s of sessions) {
    const mins = s.durationMinutes || 0;
    totalMinutes += mins;

    const dateStr = getLocalDateString(new Date(s.completedAt));
    sessionsByDate.set(dateStr, (sessionsByDate.get(dateStr) || 0) + mins);

    if (s.courseId) {
      courseMinutesMap.set(s.courseId, (courseMinutesMap.get(s.courseId) || 0) + mins);
    }
  }

  // Calculate streak (consecutive calendar days)
  let currentStreak = 0;
  const today = new Date();
  const todayStr = getLocalDateString(today);
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);
  const yesterdayStr = getLocalDateString(yesterday);

  let checkDate = new Date(today);
  if (!sessionsByDate.has(todayStr) && sessionsByDate.has(yesterdayStr)) {
    checkDate = yesterday;
  }

  while (true) {
    const dStr = getLocalDateString(checkDate);
    if (sessionsByDate.has(dStr)) {
      currentStreak++;
      checkDate.setDate(checkDate.getDate() - 1);
    } else {
      break;
    }
  }

  // Last 7 Days Daily Breakdown
  const last7Days = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const dStr = getLocalDateString(d);
    const mins = sessionsByDate.get(dStr) || 0;
    last7Days.push({
      dateStr: dStr,
      weekdayShort: getWeekdayName(d.getDay(), 'short'),
      minutes: mins,
      isToday: i === 0
    });
  }

  // Course Breakdown
  const courseBreakdown = [];
  for (const course of currentState.courses) {
    const mins = courseMinutesMap.get(course.id) || 0;
    const percent = totalMinutes > 0 ? Math.round((mins / totalMinutes) * 100) : 0;
    courseBreakdown.push({
      courseId: course.id,
      courseName: course.name,
      courseCode: course.code,
      color: course.color,
      minutes: mins,
      percent
    });
  }
  courseBreakdown.sort((a, b) => b.minutes - a.minutes);

  return {
    totalMinutes,
    totalHours: (totalMinutes / 60).toFixed(1),
    totalSessions: sessions.length,
    currentStreak,
    last7Days,
    courseBreakdown,
    allSessions: sessions
  };
}

/**
 * Assignment Deadlines & Urgent Reminders
 */
export function getAssignmentAlerts(leadDays = 2) {
  const assignments = currentState.assignments || [];
  const pending = assignments.filter(a => a.status !== 'submitted');

  const overdue = [];
  const dueToday = [];
  const dueTomorrow = [];
  const dueSoon = [];

  for (const a of pending) {
    if (!a.dueDate) continue;
    const diff = getCalendarDaysDiff(a.dueDate);
    if (diff === null) continue;

    if (diff < 0) {
      overdue.push(a);
    } else if (diff === 0) {
      dueToday.push(a);
    } else if (diff === 1) {
      dueTomorrow.push(a);
    } else if (diff <= leadDays) {
      dueSoon.push(a);
    }
  }

  return {
    overdue,
    dueToday,
    dueTomorrow,
    dueSoon,
    totalUrgentCount: overdue.length + dueToday.length + dueTomorrow.length
  };
}

/* ==========================================================================
   AI Doubt Solver & Google Gemini Integration
   ========================================================================== */

export const DEFAULT_GEMINI_KEY = '';
export const DEFAULT_GEMINI_MODEL = 'gemini-2.5-flash';

/**
 * Get active Gemini API Key from preferences or default
 * @returns {string}
 */
export function getGeminiApiKey() {
  return (currentState.preferences && currentState.preferences.geminiApiKey) || DEFAULT_GEMINI_KEY;
}

/**
 * Get active Gemini Model
 * @returns {string}
 */
export function getGeminiModel() {
  return (currentState.preferences && currentState.preferences.geminiModel) || DEFAULT_GEMINI_MODEL;
}

/**
 * Send an academic query to Google Gemini API
 * @param {object} params
 * @param {string} params.prompt
 * @param {Array<{role: string, text: string}>} [params.conversationHistory=[]]
 * @param {string|null} [params.courseId=null]
 * @param {string} [params.studyMode='explain']
 * @returns {Promise<{success: boolean, text?: string, error?: string}>}
 */
export async function askGeminiDoubt({ prompt, conversationHistory = [], courseId = null, studyMode = 'explain' }) {
  const apiKey = getGeminiApiKey();
  if (!apiKey || !apiKey.trim()) {
    return {
      success: false,
      error: 'Google Gemini API key is missing. Please add your API key in Settings.'
    };
  }

  const model = getGeminiModel();

  // Find course info if linked
  let courseInfo = '';
  if (courseId) {
    const course = currentState.courses.find(c => c.id === courseId);
    if (course) {
      courseInfo = `Academic Course Context: ${course.name} (${course.code}). `;
    }
  }

  // Determine study mode instructions
  let modeInstruction = '';
  switch (studyMode) {
    case 'steps':
      modeInstruction = 'Style: Step-by-step tutorial. Break down the solution with clear chronological steps, logical proofs/derivation, and formulas where applicable.';
      break;
    case 'code':
      modeInstruction = 'Style: Code & Implementation. Provide clean, well-commented code snippets (in Java, C++, Python, or relevant language), discuss syntax, edge cases, and time/space complexity.';
      break;
    case 'quiz':
      modeInstruction = 'Style: Practice Quiz & Flashcards. Provide 2-3 conceptual practice questions or problem challenges with hints and hidden/foldout answers to test the student.';
      break;
    case 'explain':
    default:
      modeInstruction = 'Style: Intuitive Conceptual Explanation. Explain clearly with real-world analogies, simplified mental models, and bullet points.';
      break;
  }

  const systemInstruction = `You are CampusFlow AI Academic Assistant — an expert, friendly college study tutor. ${courseInfo}${modeInstruction} Guidelines: 1. Be clear, accurate, and structured. 2. Use markdown formatting with headers (###), bold key terms, and bullet points. 3. Format code inside triple backtick blocks. 4. Highlight key takeaways or exam tips.`;

  // Build contents array for Gemini API
  const contents = [];

  // Add previous turns
  if (Array.isArray(conversationHistory) && conversationHistory.length > 0) {
    for (const msg of conversationHistory) {
      if (msg.role === 'user') {
        contents.push({ role: 'user', parts: [{ text: msg.text }] });
      } else if (msg.role === 'assistant' || msg.role === 'model') {
        contents.push({ role: 'model', parts: [{ text: msg.text }] });
      }
    }
  }

  // Add current user prompt with system guidance prepended to first user turn or current prompt
  const fullUserText = contents.length === 0
    ? `[Instruction: ${systemInstruction}]\n\nQuestion / Doubt: ${prompt}`
    : prompt;

  contents.push({
    role: 'user',
    parts: [{ text: fullUserText }]
  });

  async function executeRequest(targetModel) {
    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${targetModel}:generateContent?key=${encodeURIComponent(apiKey.trim())}`;
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contents })
    });

    if (!response.ok) {
      const errJson = await response.json().catch(() => ({}));
      const errMsg = (errJson && errJson.error && errJson.error.message) || `HTTP ${response.status}: ${response.statusText}`;
      return { ok: false, status: response.status, error: errMsg };
    }

    const data = await response.json();
    const candidate = data.candidates && data.candidates[0];
    const textPart = candidate && candidate.content && candidate.content.parts && candidate.content.parts[0];
    const text = textPart ? textPart.text : '';

    return { ok: true, text };
  }

  try {
    let result = await executeRequest(model);

    // If 404 on current model, attempt fallback to gemini-flash-latest
    if (!result.ok && result.status === 404 && model !== 'gemini-flash-latest') {
      result = await executeRequest('gemini-flash-latest');
    }

    if (!result.ok) {
      return {
        success: false,
        error: result.error || 'Failed to generate response from Gemini API.'
      };
    }

    return {
      success: true,
      text: result.text
    };
  } catch (netErr) {
    return {
      success: false,
      error: `Network error: Could not connect to Gemini API. Please check your internet connection. (${netErr.message})`
    };
  }
}

/**
 * Fast test ping for Gemini API key validation
 * @param {string} apiKey
 * @param {string} [model='gemini-2.5-flash']
 * @returns {Promise<{success: boolean, message?: string, error?: string}>}
 */
export async function testGeminiConnection(apiKey, model = 'gemini-2.5-flash') {
  if (!apiKey || !apiKey.trim()) {
    return { success: false, error: 'Please enter an API key.' };
  }

  try {
    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${encodeURIComponent(apiKey.trim())}`;
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: 'Respond with "Ready" in 1 word.' }] }]
      })
    });

    if (!response.ok) {
      const errJson = await response.json().catch(() => ({}));
      const msg = (errJson && errJson.error && errJson.error.message) || `HTTP error ${response.status}`;
      return { success: false, error: msg };
    }

    return { success: true, message: `Connected successfully to Google Gemini (${model})!` };
  } catch (err) {
    return { success: false, error: `Connection failed: ${err.message}` };
  }
}

/**
 * Save a solved doubt to history
 * @param {object} doubtData
 */
export function saveDoubtRecord(doubtData) {
  const record = {
    id: generateId('doubt'),
    timestamp: new Date().toISOString(),
    prompt: doubtData.prompt,
    response: doubtData.response,
    courseId: doubtData.courseId || null,
    studyMode: doubtData.studyMode || 'explain'
  };

  if (!Array.isArray(currentState.doubtsHistory)) {
    currentState.doubtsHistory = [];
  }

  currentState.doubtsHistory.unshift(record);
  if (currentState.doubtsHistory.length > 50) {
    currentState.doubtsHistory = currentState.doubtsHistory.slice(0, 50);
  }

  commit('DOUBT_SAVED', record);
  return record;
}

/**
 * Clear saved doubts history
 */
export function clearDoubtsHistory() {
  currentState.doubtsHistory = [];
  commit('DOUBTS_CLEARED');
}
