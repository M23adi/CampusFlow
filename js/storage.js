/**
 * CampusFlow — Local Storage Layer
 * Centralized, versioned localStorage access, export/import validation, and reset.
 * Compliant with RULES.md Section 6 and ARCHITECTURE.md.
 */

import { generateId, getLocalDateString } from './utils.js';

export const STORAGE_KEY = 'campusflow.appState';
export const CURRENT_SCHEMA_VERSION = 1;

/**
 * Generate fresh initial state with friendly, clearly-marked demo data.
 * Dates are calculated relative to today's local date so demo items are always relevant.
 * @returns {object}
 */
export function getInitialState() {
  const today = new Date();
  const todayStr = getLocalDateString(today);

  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);
  const tomorrowStr = getLocalDateString(tomorrow);

  const in3Days = new Date(today);
  in3Days.setDate(today.getDate() + 3);
  const in3DaysStr = getLocalDateString(in3Days);

  const in6Days = new Date(today);
  in6Days.setDate(today.getDate() + 6);
  const in6DaysStr = getLocalDateString(in6Days);

  const course1Id = generateId('course');
  const course2Id = generateId('course');
  const course3Id = generateId('course');

  const unit1Id = generateId('unit');
  const unit2Id = generateId('unit');
  const unit3Id = generateId('unit');

  return {
    schemaVersion: CURRENT_SCHEMA_VERSION,
    preferences: {
      userName: 'Alex',
      theme: 'light',
      focusMinutes: 25,
      shortBreakMinutes: 5,
      longBreakMinutes: 15,
      useSampleData: true,
      geminiApiKey: '',
      geminiModel: 'gemini-2.5-flash'
    },
    doubtsHistory: [],
    courses: [
      {
        id: course1Id,
        name: 'Data Mining & Warehousing',
        code: 'CS401',
        color: '#6558D9',
        units: [
          {
            id: unit1Id,
            title: 'Unit 1: Association Rules & Classification',
            topics: [
              { id: generateId('topic'), title: 'Apriori Algorithm & FP-Tree', completed: true },
              { id: generateId('topic'), title: 'Decision Trees & Information Gain', completed: true },
              { id: generateId('topic'), title: 'Naive Bayes Classifiers', completed: false }
            ]
          },
          {
            id: unit2Id,
            title: 'Unit 2: Clustering & Outlier Detection',
            topics: [
              { id: generateId('topic'), title: 'K-Means & Hierarchical Clustering', completed: false },
              { id: generateId('topic'), title: 'DBSCAN Density-Based Clustering', completed: false }
            ]
          }
        ]
      },
      {
        id: course2Id,
        name: 'Computer Networks',
        code: 'CS402',
        color: '#23856D',
        units: [
          {
            id: unit3Id,
            title: 'Unit 1: Transport & Routing Protocols',
            topics: [
              { id: generateId('topic'), title: 'TCP Flow & Congestion Control', completed: true },
              { id: generateId('topic'), title: 'BGP & OSPF Routing Mechanisms', completed: true },
              { id: generateId('topic'), title: 'DNS Architecture & Resolution', completed: false }
            ]
          }
        ]
      },
      {
        id: course3Id,
        name: 'Software Engineering',
        code: 'CS403',
        color: '#3976B8',
        units: [
          {
            id: generateId('unit'),
            title: 'Unit 1: Architecture & Agile Lifecycle',
            topics: [
              { id: generateId('topic'), title: 'Microservices vs Monolith Design', completed: true },
              { id: generateId('topic'), title: 'CI/CD Pipelines & Test Automation', completed: false }
            ]
          }
        ]
      }
    ],
    tasks: [
      {
        id: generateId('task'),
        title: 'Review lecture notes on Apriori Algorithm',
        notes: 'Summarize support and confidence formulas for quiz',
        courseId: course1Id,
        dueDate: todayStr,
        priority: 'high',
        completed: false,
        createdAt: new Date(Date.now() - 3600000 * 24).toISOString(),
        completedAt: null
      },
      {
        id: generateId('task'),
        title: 'Draft Computer Networks lab report on Wireshark TCP handshake',
        notes: 'Include SYN-ACK sequence numbers and packet screenshot',
        courseId: course2Id,
        dueDate: tomorrowStr,
        priority: 'medium',
        completed: false,
        createdAt: new Date(Date.now() - 3600000 * 12).toISOString(),
        completedAt: null
      },
      {
        id: generateId('task'),
        title: 'Read Software Engineering Chapter 4: System Architecture',
        notes: 'Focus on event-driven models',
        courseId: course3Id,
        dueDate: '',
        priority: 'low',
        completed: false,
        createdAt: new Date().toISOString(),
        completedAt: null
      },
      {
        id: generateId('task'),
        title: 'Submit elective course confirmation form',
        notes: 'Submitted to academic registrar',
        courseId: null,
        dueDate: todayStr,
        priority: 'medium',
        completed: true,
        createdAt: new Date(Date.now() - 3600000 * 48).toISOString(),
        completedAt: new Date(Date.now() - 3600000 * 2).toISOString()
      }
    ],
    assignments: [
      {
        id: generateId('assignment'),
        title: 'Problem Set 2: Association Rule Mining Implementation',
        courseId: course1Id,
        dueDate: in3DaysStr,
        priority: 'high',
        status: 'in-progress',
        notes: 'Implement FP-Growth on given retail market basket dataset',
        createdAt: new Date(Date.now() - 3600000 * 36).toISOString()
      },
      {
        id: generateId('assignment'),
        title: 'Packet Analysis & Routing Simulation Project',
        courseId: course2Id,
        dueDate: in6DaysStr,
        priority: 'medium',
        status: 'not-started',
        notes: 'Setup 4-node topology in Mininet and measure latency',
        createdAt: new Date().toISOString()
      }
    ],
    timetable: [
      {
        id: generateId('class'),
        courseId: course1Id,
        subjectName: 'Data Mining & Warehousing',
        dayOfWeek: 1, // Monday
        startTime: '09:00',
        endTime: '10:30',
        room: 'Lab 204',
        instructor: 'Dr. Evelyn Reed'
      },
      {
        id: generateId('class'),
        courseId: course2Id,
        subjectName: 'Computer Networks',
        dayOfWeek: 1, // Monday
        startTime: '11:00',
        endTime: '12:30',
        room: 'Hall B',
        instructor: 'Prof. Marcus Vance'
      },
      {
        id: generateId('class'),
        courseId: course3Id,
        subjectName: 'Software Engineering',
        dayOfWeek: 2, // Tuesday
        startTime: '10:00',
        endTime: '11:30',
        room: 'Room 312',
        instructor: 'Dr. Sarah Chen'
      },
      {
        id: generateId('class'),
        courseId: course1Id,
        subjectName: 'Data Mining Lab',
        dayOfWeek: 3, // Wednesday
        startTime: '14:00',
        endTime: '16:00',
        room: 'Computing Lab 3',
        instructor: 'Dr. Evelyn Reed'
      },
      {
        id: generateId('class'),
        courseId: course2Id,
        subjectName: 'Computer Networks',
        dayOfWeek: 4, // Thursday
        startTime: '09:30',
        endTime: '11:00',
        room: 'Hall B',
        instructor: 'Prof. Marcus Vance'
      },
      {
        id: generateId('class'),
        courseId: course3Id,
        subjectName: 'Software Engineering Workshop',
        dayOfWeek: 5, // Friday
        startTime: '13:00',
        endTime: '15:00',
        room: 'Design Studio A',
        instructor: 'Dr. Sarah Chen'
      }
    ],
    focusSessions: [
      {
        id: generateId('focus'),
        startedAt: new Date(Date.now() - 3600000 * 2).toISOString(),
        completedAt: new Date(Date.now() - 3600000 * 2 + 1500000).toISOString(),
        durationMinutes: 25,
        mode: 'focus',
        taskId: null,
        courseId: course1Id,
        notes: 'Covered Apriori support and confidence exercises',
        completed: true
      },
      {
        id: generateId('focus'),
        startedAt: new Date(Date.now() - 3600000 * 5).toISOString(),
        completedAt: new Date(Date.now() - 3600000 * 5 + 1800000).toISOString(),
        durationMinutes: 30,
        mode: 'focus',
        taskId: null,
        courseId: course2Id,
        notes: 'Analyzed Wireshark packet captures',
        completed: true
      },
      {
        id: generateId('focus'),
        startedAt: new Date(Date.now() - 86400000 * 1 - 3600000 * 3).toISOString(),
        completedAt: new Date(Date.now() - 86400000 * 1 - 3600000 * 3 + 2700000).toISOString(),
        durationMinutes: 45,
        mode: 'focus',
        taskId: null,
        courseId: course3Id,
        notes: 'Software architecture design patterns',
        completed: true
      },
      {
        id: generateId('focus'),
        startedAt: new Date(Date.now() - 86400000 * 2 - 3600000 * 4).toISOString(),
        completedAt: new Date(Date.now() - 86400000 * 2 - 3600000 * 4 + 3000000).toISOString(),
        durationMinutes: 50,
        mode: 'focus',
        taskId: null,
        courseId: course1Id,
        notes: 'Decision tree classification theory',
        completed: true
      },
      {
        id: generateId('focus'),
        startedAt: new Date(Date.now() - 86400000 * 3 - 3600000 * 2).toISOString(),
        completedAt: new Date(Date.now() - 86400000 * 3 - 3600000 * 2 + 2400000).toISOString(),
        durationMinutes: 40,
        mode: 'focus',
        taskId: null,
        courseId: course2Id,
        notes: 'BGP and routing protocol simulation',
        completed: true
      },
      {
        id: generateId('focus'),
        startedAt: new Date(Date.now() - 86400000 * 4 - 3600000 * 3).toISOString(),
        completedAt: new Date(Date.now() - 86400000 * 4 - 3600000 * 3 + 2100000).toISOString(),
        durationMinutes: 35,
        mode: 'focus',
        taskId: null,
        courseId: course3Id,
        notes: 'Refactoring unit tests and CI setup',
        completed: true
      }
    ],
    timerState: {
      mode: 'focus',
      status: 'idle',
      durationSeconds: 1500,
      endsAt: null,
      startedAt: null,
      linkedTaskId: null,
      linkedCourseId: null
    }
  };
}

/**
 * Check if localStorage is usable.
 * @returns {boolean}
 */
export function isStorageAvailable() {
  try {
    const testKey = '__campusflow_test__';
    localStorage.setItem(testKey, testKey);
    localStorage.removeItem(testKey);
    return true;
  } catch (e) {
    return false;
  }
}

/**
 * Load state from localStorage. Handles parsing errors, schema migrations, and fallbacks.
 * @returns {object}
 */
export function loadState() {
  if (!isStorageAvailable()) {
    console.warn('CampusFlow: localStorage is not available. Using in-memory default state.');
    return getInitialState();
  }

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      const freshState = getInitialState();
      saveState(freshState);
      return freshState;
    }

    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object') {
      console.warn('CampusFlow: Stored state was invalid. Restoring defaults.');
      return getInitialState();
    }

    // Schema migration / fallback defaults
    const state = migrateStateIfNeeded(parsed);
    return state;
  } catch (err) {
    console.error('CampusFlow: Failed to read from localStorage:', err);
    return getInitialState();
  }
}

/**
 * Ensure state shape complies with current schema, preserving existing user data.
 * @param {object} rawState
 * @returns {object}
 */
function migrateStateIfNeeded(rawState) {
  const defaults = getInitialState();

  const state = {
    schemaVersion: CURRENT_SCHEMA_VERSION,
    preferences: {
      ...defaults.preferences,
      ...(rawState.preferences || {}),
      geminiApiKey: (rawState.preferences && rawState.preferences.geminiApiKey) || defaults.preferences.geminiApiKey,
      geminiModel: (rawState.preferences && rawState.preferences.geminiModel) || defaults.preferences.geminiModel
    },
    courses: Array.isArray(rawState.courses) ? rawState.courses : [],
    tasks: Array.isArray(rawState.tasks) ? rawState.tasks : [],
    assignments: Array.isArray(rawState.assignments) ? rawState.assignments : [],
    timetable: Array.isArray(rawState.timetable) ? rawState.timetable : [],
    focusSessions: Array.isArray(rawState.focusSessions) ? rawState.focusSessions : [],
    doubtsHistory: Array.isArray(rawState.doubtsHistory) ? rawState.doubtsHistory : [],
    timerState: { ...defaults.timerState, ...(rawState.timerState || {}) }
  };

  return state;
}

/**
 * Save state safely to localStorage.
 * @param {object} state
 * @returns {{ success: boolean, error?: string }}
 */
export function saveState(state) {
  if (!isStorageAvailable()) {
    return { success: false, error: 'Local storage is unavailable in this browser.' };
  }

  try {
    const payload = JSON.stringify(state);
    localStorage.setItem(STORAGE_KEY, payload);
    return { success: true };
  } catch (err) {
    console.error('CampusFlow: Save to storage failed:', err);
    if (err.name === 'QuotaExceededError' || err.code === 22) {
      return { success: false, error: 'Storage quota exceeded. Please export and clear old focus sessions.' };
    }
    return { success: false, error: 'Failed to save data locally.' };
  }
}

/**
 * Reset all data to empty or freshly seeded demo state.
 * @param {boolean} [withDemoData=false]
 * @returns {object}
 */
export function resetState(withDemoData = false) {
  let newState;
  if (withDemoData) {
    newState = getInitialState();
  } else {
    newState = {
      schemaVersion: CURRENT_SCHEMA_VERSION,
      preferences: {
        userName: '',
        theme: 'light',
        focusMinutes: 25,
        shortBreakMinutes: 5,
        longBreakMinutes: 15,
        useSampleData: false
      },
      courses: [],
      tasks: [],
      assignments: [],
      timetable: [],
      focusSessions: [],
      timerState: {
        mode: 'focus',
        status: 'idle',
        durationSeconds: 1500,
        endsAt: null,
        startedAt: null,
        linkedTaskId: null,
        linkedCourseId: null
      }
    };
  }

  saveState(newState);
  return newState;
}

/**
 * Export state as a formatted JSON string for download.
 * @param {object} state
 * @returns {string}
 */
export function exportState(state) {
  return JSON.stringify(state, null, 2);
}

/**
 * Validate imported JSON shape against expected schema.
 * Rejects corrupt, malicious, or non-conforming objects.
 * @param {string} jsonString
 * @returns {{ valid: boolean, error?: string, data?: object }}
 */
export function validateImportedState(jsonString) {
  if (!jsonString || typeof jsonString !== 'string') {
    return { valid: false, error: 'Empty or invalid import payload.' };
  }

  try {
    const parsed = JSON.parse(jsonString);

    if (!parsed || typeof parsed !== 'object') {
      return { valid: false, error: 'Imported file does not contain a JSON object.' };
    }

    if (!parsed.schemaVersion || typeof parsed.schemaVersion !== 'number') {
      return { valid: false, error: 'Missing or invalid schemaVersion in import file.' };
    }

    if (!Array.isArray(parsed.tasks)) {
      return { valid: false, error: 'Invalid tasks array in import file.' };
    }

    if (!Array.isArray(parsed.assignments)) {
      return { valid: false, error: 'Invalid assignments array in import file.' };
    }

    if (!Array.isArray(parsed.courses)) {
      return { valid: false, error: 'Invalid courses array in import file.' };
    }

    if (!Array.isArray(parsed.timetable)) {
      return { valid: false, error: 'Invalid timetable array in import file.' };
    }

    // Basic structure verified, apply migration to normalize
    const cleanData = migrateStateIfNeeded(parsed);
    return { valid: true, data: cleanData };
  } catch (err) {
    return { valid: false, error: `JSON parsing error: ${err.message}` };
  }
}
