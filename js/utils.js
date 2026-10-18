/**
 * CampusFlow — Pure Utility Functions
 * Date-only handling, local arithmetic, unique IDs, text safety, and formatting.
 * Compliant with RULES.md and ARCHITECTURE.md.
 */

/**
 * Generate a unique ID with crypto.randomUUID() fallback.
 * @param {string} prefix Optional prefix (e.g. 'task', 'course')
 * @returns {string}
 */
export function generateId(prefix = 'id') {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return `${prefix}_${crypto.randomUUID()}`;
  }
  const timestamp = Date.now().toString(36);
  const randomPart = Math.random().toString(36).substring(2, 9);
  return `${prefix}_${timestamp}_${randomPart}`;
}

/**
 * Get current date string in local calendar format YYYY-MM-DD.
 * @param {Date} [d=new Date()]
 * @returns {string} YYYY-MM-DD
 */
export function getLocalDateString(d = new Date()) {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Parse a YYYY-MM-DD date string into a local Date object set at 00:00:00.
 * Avoids UTC timezone conversion shifts.
 * @param {string} dateStr
 * @returns {Date|null}
 */
export function parseLocalDate(dateStr) {
  if (!dateStr || typeof dateStr !== 'string') return null;
  const parts = dateStr.trim().split('-');
  if (parts.length !== 3) return null;
  const year = parseInt(parts[0], 10);
  const month = parseInt(parts[1], 10) - 1;
  const day = parseInt(parts[2], 10);
  if (isNaN(year) || isNaN(month) || isNaN(day)) return null;
  const date = new Date(year, month, day);
  // Verify valid calendar day (e.g. not Feb 31)
  if (date.getFullYear() !== year || date.getMonth() !== month || date.getDate() !== day) {
    return null;
  }
  return date;
}

/**
 * Calculate difference in whole local calendar days between two dates.
 * positive: targetDate is in the future.
 * 0: same day.
 * negative: targetDate is in the past.
 * @param {string} targetDateStr YYYY-MM-DD
 * @param {string} [baseDateStr=getLocalDateString()] YYYY-MM-DD
 * @returns {number|null}
 */
export function getCalendarDaysDiff(targetDateStr, baseDateStr = getLocalDateString()) {
  const target = parseLocalDate(targetDateStr);
  const base = parseLocalDate(baseDateStr);
  if (!target || !base) return null;

  const utcTarget = Date.UTC(target.getFullYear(), target.getMonth(), target.getDate());
  const utcBase = Date.UTC(base.getFullYear(), base.getMonth(), base.getDate());
  const msPerDay = 1000 * 60 * 60 * 24;
  return Math.round((utcTarget - utcBase) / msPerDay);
}

/**
 * Check if a date string is strictly before today in local calendar terms.
 * @param {string} dateStr YYYY-MM-DD
 * @returns {boolean}
 */
export function isOverdue(dateStr) {
  if (!dateStr) return false;
  const diff = getCalendarDaysDiff(dateStr);
  return diff !== null && diff < 0;
}

/**
 * Check if a date string is today in local calendar terms.
 * @param {string} dateStr YYYY-MM-DD
 * @returns {boolean}
 */
export function isDueToday(dateStr) {
  if (!dateStr) return false;
  const diff = getCalendarDaysDiff(dateStr);
  return diff === 0;
}

/**
 * Check if a date string is due soon (within next thresholdDays, default 3).
 * @param {string} dateStr YYYY-MM-DD
 * @param {number} [thresholdDays=3]
 * @returns {boolean}
 */
export function isDueSoon(dateStr, thresholdDays = 3) {
  if (!dateStr) return false;
  const diff = getCalendarDaysDiff(dateStr);
  return diff !== null && diff >= 0 && diff <= thresholdDays;
}

/**
 * Format a YYYY-MM-DD date string for display (e.g. "Today", "Tomorrow", "Yesterday", "Oct 24, 2026").
 * @param {string} dateStr
 * @returns {string}
 */
export function formatDisplayDate(dateStr) {
  if (!dateStr) return 'No due date';
  const diff = getCalendarDaysDiff(dateStr);
  if (diff === 0) return 'Today';
  if (diff === 1) return 'Tomorrow';
  if (diff === -1) return 'Yesterday';

  const date = parseLocalDate(dateStr);
  if (!date) return dateStr;

  return date.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: date.getFullYear() !== new Date().getFullYear() ? 'numeric' : undefined
  });
}

/**
 * Get human-readable relative label for deadline (e.g. "2 days left", "Overdue by 1 day", "Due today").
 * @param {string} dateStr
 * @returns {{ text: string, status: 'overdue'|'today'|'soon'|'future'|'none' }}
 */
export function getDeadlineInfo(dateStr) {
  if (!dateStr) return { text: 'No due date', status: 'none' };
  const diff = getCalendarDaysDiff(dateStr);
  if (diff === null) return { text: dateStr, status: 'none' };

  if (diff < 0) {
    const days = Math.abs(diff);
    return {
      text: days === 1 ? 'Overdue by 1 day' : `Overdue by ${days} days`,
      status: 'overdue'
    };
  }
  if (diff === 0) {
    return { text: 'Due today', status: 'today' };
  }
  if (diff === 1) {
    return { text: 'Due tomorrow', status: 'soon' };
  }
  if (diff <= 3) {
    return { text: `${diff} days left`, status: 'soon' };
  }
  return { text: `${diff} days left`, status: 'future' };
}

/**
 * Format HH:mm 24h time to 12h time (e.g. "09:00" -> "9:00 AM", "14:30" -> "2:30 PM").
 * @param {string} timeStr
 * @returns {string}
 */
export function formatDisplayTime(timeStr) {
  if (!timeStr) return '';
  const [hStr, mStr] = timeStr.split(':');
  let h = parseInt(hStr, 10);
  const m = mStr || '00';
  if (isNaN(h)) return timeStr;
  const ampm = h >= 12 ? 'PM' : 'AM';
  h = h % 12;
  if (h === 0) h = 12;
  return `${h}:${m} ${ampm}`;
}

/**
 * Compare two HH:mm strings. Returns negative if t1 < t2, 0 if equal, positive if t1 > t2.
 * @param {string} t1
 * @param {string} t2
 * @returns {number}
 */
export function compareTimes(t1, t2) {
  return t1.localeCompare(t2);
}

/**
 * Check whether two time intervals on the same day overlap.
 * @param {string} startA
 * @param {string} endA
 * @param {string} startB
 * @param {string} endB
 * @returns {boolean}
 */
export function timesOverlap(startA, endA, startB, endB) {
  return startA < endB && startB < endA;
}

/**
 * Format seconds into mm:ss display (e.g. 1500 -> "25:00").
 * @param {number} totalSeconds
 * @returns {string}
 */
export function formatTimerDigits(totalSeconds) {
  const safeSecs = Math.max(0, Math.floor(totalSeconds));
  const m = Math.floor(safeSecs / 60);
  const s = safeSecs % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

/**
 * Sanitize text to avoid HTML injection when inserting into attributes.
 * @param {string} str
 * @returns {string}
 */
export function escapeHTML(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
export const escapeHtml = escapeHTML;

/**
 * Get greeting based on current local hour.
 * @param {Date} [now=new Date()]
 * @returns {string} "Good morning" | "Good afternoon" | "Good evening"
 */
export function getTimeGreeting(now = new Date()) {
  const hour = now.getHours();
  if (hour >= 4 && hour < 12) return 'Good morning';
  if (hour >= 12 && hour < 17) return 'Good afternoon';
  return 'Good evening';
}

/**
 * Format weekday name for display (0 = Sunday, 1 = Monday, ..., 6 = Saturday).
 * @param {number} dayNumber
 * @param {'long'|'short'} [format='long']
 * @returns {string}
 */
export function getWeekdayName(dayNumber, format = 'long') {
  const longDays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const shortDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const idx = Math.max(0, Math.min(6, parseInt(dayNumber, 10) || 0));
  return format === 'short' ? shortDays[idx] : longDays[idx];
}
