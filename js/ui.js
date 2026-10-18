/**
 * CampusFlow — UI Component Helpers & Shared Rendering
 * Accessible Modals, Toast system, SVG icons, Empty States, and Chips.
 * Compliant with RULES.md Section 8 & 9 and DESIGN.md.
 */

// SVG Icon Definitions (stroke width 1.9, viewBox 0 0 24 24, fill none, stroke currentColor)
export const ICONS = {
  dashboard: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect width="7" height="9" x="3" y="3" rx="1"/><rect width="7" height="5" x="14" y="3" rx="1"/><rect width="7" height="9" x="14" y="12" rx="1"/><rect width="7" height="5" x="3" y="16" rx="1"/></svg>`,
  tasks: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m9 11 3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>`,
  assignments: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1-2.5-2.5Z"/><path d="M6 6h10"/><path d="M6 10h10"/><path d="M6 14h6"/></svg>`,
  syllabus: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/></svg>`,
  timetable: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10" y2="10"/><path d="M8 14h.01"/><path d="M12 14h.01"/><path d="M16 14h.01"/><path d="M8 18h.01"/><path d="M12 18h.01"/></svg>`,
  timer: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>`,
  settings: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/></svg>`,
  plus: `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14"/><path d="M12 5v14"/></svg>`,
  search: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>`,
  check: `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="20 6 9 17 4 12"/></svg>`,
  edit: `<svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/><path d="m15 5 4 4"/></svg>`,
  trash: `<svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" x2="10" y1="11" y2="17"/><line x1="14" x2="14" y1="11" y2="17"/></svg>`,
  close: `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>`,
  play: `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polygon points="6 3 20 12 6 21 6 3"/></svg>`,
  pause: `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="6" y="4" width="4" height="16" rx="1"/><rect x="14" y="4" width="4" height="16" rx="1"/></svg>`,
  reset: `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg>`,
  skip: `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polygon points="5 4 15 12 5 20 5 4"/><line x1="19" x2="19" y1="5" y2="19"/></svg>`,
  menu: `<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><line x1="4" x2="20" y1="12" y2="12"/><line x1="4" x2="20" y1="6" y2="6"/><line x1="4" x2="20" y1="18" y2="18"/></svg>`,
  chevronDown: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="6 9 12 15 18 9"/></svg>`,
  chevronUp: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="18 15 12 9 6 15"/></svg>`,
  info: `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>`,
  alert: `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10"/><line x1="12" x2="12" y1="8" y2="12"/><line x1="12" x2="12.01" y1="16" y2="16"/></svg>`,
  bell: `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/></svg>`,
  sound: `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14"/></svg>`,
  sparkles: `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m12 3-1.9 5.8a2 2 0 0 1-1.3 1.3L3 12l5.8 1.9a2 2 0 0 1 1.3 1.3L12 21l1.9-5.8a2 2 0 0 1 1.3-1.3L21 12l-5.8-1.9a2 2 0 0 1-1.3-1.3z"/></svg>`,
  fire: `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/></svg>`
};

/**
 * Helper to produce an SVG element string or DOM element
 * @param {string} iconName
 * @returns {string}
 */
export function getIconSvg(iconName) {
  return ICONS[iconName] || '';
}

/**
 * Toast Notification System
 */
let toastContainer = null;

function ensureToastContainer() {
  if (!toastContainer || !document.body.contains(toastContainer)) {
    toastContainer = document.querySelector('.toast-container');
    if (!toastContainer) {
      toastContainer = document.createElement('div');
      toastContainer.className = 'toast-container';
      toastContainer.setAttribute('role', 'status');
      toastContainer.setAttribute('aria-live', 'polite');
      document.body.appendChild(toastContainer);
    }
  }
  return toastContainer;
}

/**
 * Show accessible toast notification
 * @param {string} message
 * @param {'success'|'warning'|'danger'|'info'} [type='info']
 * @param {number} [duration=3500]
 */
export function showToast(message, type = 'info', duration = 3500) {
  const container = ensureToastContainer();

  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;

  const iconSpan = document.createElement('span');
  iconSpan.className = 'toast-icon';
  iconSpan.innerHTML = type === 'success' ? ICONS.check : type === 'warning' || type === 'danger' ? ICONS.alert : ICONS.info;

  const msgSpan = document.createElement('span');
  msgSpan.className = 'toast-message';
  msgSpan.textContent = message;

  const closeBtn = document.createElement('button');
  closeBtn.type = 'button';
  closeBtn.className = 'toast-close';
  closeBtn.setAttribute('aria-label', 'Dismiss notification');
  closeBtn.innerHTML = ICONS.close;

  const removeToast = () => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(8px)';
    setTimeout(() => {
      if (toast.parentNode) toast.parentNode.removeChild(toast);
    }, 180);
  };

  closeBtn.addEventListener('click', removeToast);

  toast.appendChild(iconSpan);
  toast.appendChild(msgSpan);
  toast.appendChild(closeBtn);
  container.appendChild(toast);

  if (duration > 0) {
    setTimeout(removeToast, duration);
  }
}

/**
 * Modal System
 */
let activeModalBackdrop = null;
let previousActiveElement = null;

/**
 * Display accessible modal dialog
 * @param {object} options
 * @param {string} options.title
 * @param {HTMLElement} options.contentNode
 * @param {() => void} [options.onClose]
 * @param {'md'|'lg'} [options.size='md']
 * @returns {{ close: () => void }}
 */
export function showModal({ title, contentNode, onClose, size = 'md' }) {
  closeActiveModal();

  previousActiveElement = document.activeElement;

  const backdrop = document.createElement('div');
  backdrop.className = 'modal-backdrop';
  backdrop.setAttribute('role', 'dialog');
  backdrop.setAttribute('aria-modal', 'true');
  backdrop.setAttribute('aria-label', title);

  const dialog = document.createElement('div');
  dialog.className = `modal-dialog ${size === 'lg' ? 'modal-lg' : ''}`;

  const header = document.createElement('div');
  header.className = 'modal-header';

  const titleEl = document.createElement('h2');
  titleEl.className = 'modal-title';
  titleEl.textContent = title;

  const closeBtn = document.createElement('button');
  closeBtn.type = 'button';
  closeBtn.className = 'modal-close-btn';
  closeBtn.setAttribute('aria-label', 'Close dialog');
  closeBtn.innerHTML = ICONS.close;

  header.appendChild(titleEl);
  header.appendChild(closeBtn);

  const body = document.createElement('div');
  body.className = 'modal-body';
  body.appendChild(contentNode);

  dialog.appendChild(header);
  dialog.appendChild(body);
  backdrop.appendChild(dialog);

  const handleClose = () => {
    if (backdrop.parentNode) {
      backdrop.parentNode.removeChild(backdrop);
    }
    activeModalBackdrop = null;
    document.removeEventListener('keydown', handleKeydown);
    if (previousActiveElement && previousActiveElement.focus) {
      previousActiveElement.focus();
    }
    if (typeof onClose === 'function') onClose();
  };

  const handleKeydown = (e) => {
    if (e.key === 'Escape') {
      e.preventDefault();
      handleClose();
    }
  };

  closeBtn.addEventListener('click', handleClose);
  backdrop.addEventListener('click', (e) => {
    if (e.target === backdrop) handleClose();
  });

  document.addEventListener('keydown', handleKeydown);
  document.body.appendChild(backdrop);
  activeModalBackdrop = backdrop;

  // Set focus to the first interactive element or close button
  setTimeout(() => {
    const focusable = dialog.querySelector('input, select, textarea, button:not(.modal-close-btn)');
    if (focusable) {
      focusable.focus();
    } else {
      closeBtn.focus();
    }
  }, 50);

  return { close: handleClose };
}

export function closeActiveModal() {
  if (activeModalBackdrop && activeModalBackdrop.parentNode) {
    activeModalBackdrop.parentNode.removeChild(activeModalBackdrop);
    activeModalBackdrop = null;
  }
}

/**
 * Accessible confirmation dialog for destructive or critical actions
 * @param {object} options
 * @param {string} options.title
 * @param {string} options.message
 * @param {string} [options.confirmText='Confirm']
 * @param {'danger'|'primary'} [options.confirmVariant='danger']
 * @param {() => void} options.onConfirm
 * @param {() => void} [options.onCancel]
 */
export function showConfirmModal({ title, message, confirmText = 'Confirm', confirmVariant = 'danger', onConfirm, onCancel }) {
  const content = document.createElement('div');

  const p = document.createElement('p');
  p.style.fontSize = '0.94rem';
  p.style.color = 'var(--color-text)';
  p.style.marginBottom = 'var(--space-5)';
  p.textContent = message;
  content.appendChild(p);

  const actions = document.createElement('div');
  actions.className = 'form-actions';
  actions.style.marginTop = '0';
  actions.style.paddingTop = 'var(--space-3)';

  const cancelBtn = document.createElement('button');
  cancelBtn.type = 'button';
  cancelBtn.className = 'btn btn-secondary';
  cancelBtn.textContent = 'Cancel';

  const confirmBtn = document.createElement('button');
  confirmBtn.type = 'button';
  confirmBtn.className = `btn btn-${confirmVariant}`;
  confirmBtn.textContent = confirmText;

  actions.appendChild(cancelBtn);
  actions.appendChild(confirmBtn);
  content.appendChild(actions);

  const modal = showModal({
    title,
    contentNode: content,
    onClose: onCancel
  });

  cancelBtn.addEventListener('click', () => {
    modal.close();
    if (onCancel) onCancel();
  });

  confirmBtn.addEventListener('click', () => {
    modal.close();
    if (onConfirm) onConfirm();
  });
}

/**
 * Render standard empty state card
 * @param {object} options
 * @param {string} options.iconName
 * @param {string} options.title
 * @param {string} options.description
 * @param {string} [options.actionText]
 * @param {() => void} [options.onAction]
 * @returns {HTMLElement}
 */
export function createEmptyState({ iconName, title, description, actionText, onAction }) {
  const wrap = document.createElement('div');
  wrap.className = 'empty-state';

  const iconDiv = document.createElement('div');
  iconDiv.className = 'empty-state-icon';
  iconDiv.innerHTML = getIconSvg(iconName || 'info');
  wrap.appendChild(iconDiv);

  const titleEl = document.createElement('h3');
  titleEl.className = 'empty-state-title';
  titleEl.textContent = title;
  wrap.appendChild(titleEl);

  const descEl = document.createElement('p');
  descEl.className = 'empty-state-desc';
  descEl.textContent = description;
  wrap.appendChild(descEl);

  if (actionText && typeof onAction === 'function') {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'btn btn-primary btn-sm';
    btn.textContent = actionText;
    btn.addEventListener('click', onAction);
    wrap.appendChild(btn);
  }

  return wrap;
}

/**
 * Create Priority Chip DOM Node
 * @param {'high'|'medium'|'low'} priority
 * @returns {HTMLElement}
 */
export function createPriorityChip(priority) {
  const span = document.createElement('span');
  const p = (priority || 'medium').toLowerCase();
  span.className = `priority-pill priority-${p}`;
  span.textContent = p.toUpperCase();
  return span;
}

/**
 * Create Status Chip DOM Node
 * @param {string} statusKey
 * @param {string} labelText
 * @returns {HTMLElement}
 */
export function createStatusChip(statusKey, labelText) {
  const span = document.createElement('span');
  span.className = `chip chip-${statusKey}`;
  span.textContent = labelText;
  return span;
}

/**
 * Lightweight pure-Canvas celebration confetti animation
 */
export function triggerConfetti() {
  const canvas = document.createElement('canvas');
  canvas.style.position = 'fixed';
  canvas.style.top = '0';
  canvas.style.left = '0';
  canvas.style.width = '100vw';
  canvas.style.height = '100vh';
  canvas.style.pointerEvents = 'none';
  canvas.style.zIndex = '9999';
  document.body.appendChild(canvas);

  const ctx = canvas.getContext('2d');
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  const colors = ['#6558D9', '#8276EC', '#23856D', '#A96B17', '#3976B8', '#FF6B8B', '#FFD166'];
  const confettiCount = 55;
  const particles = [];

  for (let i = 0; i < confettiCount; i++) {
    particles.push({
      x: window.innerWidth * (0.35 + Math.random() * 0.3),
      y: window.innerHeight * 0.45,
      vx: (Math.random() - 0.5) * 12,
      vy: (Math.random() - 0.7) * 14,
      size: 6 + Math.random() * 5,
      color: colors[Math.floor(Math.random() * colors.length)],
      rotation: Math.random() * 360,
      vRotation: (Math.random() - 0.5) * 12,
      opacity: 1
    });
  }

  let animationFrame;
  const render = () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    let alive = false;

    for (const p of particles) {
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.35; // gravity
      p.rotation += p.vRotation;
      p.opacity -= 0.016;

      if (p.opacity > 0) {
        alive = true;
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate((p.rotation * Math.PI) / 180);
        ctx.globalAlpha = p.opacity;
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.6);
        ctx.restore();
      }
    }

    if (alive) {
      animationFrame = requestAnimationFrame(render);
    } else {
      cancelAnimationFrame(animationFrame);
      if (canvas.parentNode) canvas.parentNode.removeChild(canvas);
    }
  };

  render();
}

/**
 * Motivational Study Quotes & Tips
 */
const STUDY_QUOTES = [
  { text: "Consistency beats intensity. 25 minutes of deep focus is better than 4 hours of distracted staring.", emoji: "🎯" },
  { text: "You don't have to be great to start, but you have to start to be great.", emoji: "🚀" },
  { text: "Focus on one unit at a time. The syllabus takes care of itself.", emoji: "📖" },
  { text: "Study with intent, take real breaks, and protect your study momentum.", emoji: "⚡" },
  { text: "Small daily improvements over time lead to stunning semester grades.", emoji: "🌱" },
  { text: "Your future self will thank you for the assignment you finish today.", emoji: "🎓" },
  { text: "Rest is not a reward for work; it is a requirement for excellence.", emoji: "☕" },
  { text: "Done is better than perfect. Get the draft down, then refine.", emoji: "💡" }
];

export function getRandomStudyQuote() {
  return STUDY_QUOTES[Math.floor(Math.random() * STUDY_QUOTES.length)];
}

/**
 * Ambient Study Audio Player (Web Audio API Native Synthesis)
 * Generates continuous soothing rain / pink noise for focus without external audio files.
 */
let ambientAudioInstance = null;

export function toggleAmbientSound(type = 'rain') {
  if (ambientAudioInstance) {
    ambientAudioInstance.stop();
    ambientAudioInstance = null;
    return false;
  }

  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return false;
    const ctx = new AudioContext();

    const bufferSize = ctx.sampleRate * 2;
    const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);

    let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      b0 = 0.99886 * b0 + white * 0.0555179;
      b1 = 0.99332 * b1 + white * 0.0750759;
      b2 = 0.96900 * b2 + white * 0.1538520;
      b3 = 0.86650 * b3 + white * 0.3104856;
      b4 = 0.55000 * b4 + white * 0.5329522;
      b5 = -0.7616 * b5 - white * 0.0168980;
      output[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.035;
      b6 = white * 0.115926;
    }

    const whiteNoise = ctx.createBufferSource();
    whiteNoise.buffer = noiseBuffer;
    whiteNoise.loop = true;

    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(type === 'binaural' ? 380 : 750, ctx.currentTime);

    const gainNode = ctx.createGain();
    gainNode.gain.setValueAtTime(0.06, ctx.currentTime);

    whiteNoise.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(ctx.destination);
    whiteNoise.start();

    ambientAudioInstance = {
      stop: () => {
        try {
          gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
          setTimeout(() => {
            whiteNoise.stop();
            ctx.close();
          }, 350);
        } catch (e) {}
      }
    };
    return true;
  } catch (err) {
    console.warn('Ambient audio error:', err);
    return false;
  }
}

export function isAmbientSoundActive() {
  return ambientAudioInstance !== null;
}

/**
 * Interactive Assignment Reminders & Deadline Alert Modal
 * @param {object} alerts from state.getAssignmentAlerts()
 * @param {(viewName: string) => void} onNavigate
 * @param {() => void} [onRefresh]
 */
export function openRemindersModal(alerts, onNavigate, onRefresh) {
  const container = document.createElement('div');
  container.style.display = 'flex';
  container.style.flexDirection = 'column';
  container.style.gap = 'var(--space-4)';

  const allAlerts = [
    ...alerts.overdue.map(a => ({ ...a, alertType: 'overdue', label: '🚨 Overdue' })),
    ...alerts.dueToday.map(a => ({ ...a, alertType: 'today', label: '⏰ Due Today' })),
    ...alerts.dueTomorrow.map(a => ({ ...a, alertType: 'tomorrow', label: '⚠️ Due Tomorrow' })),
    ...alerts.dueSoon.map(a => ({ ...a, alertType: 'soon', label: '📅 Due Soon' }))
  ];

  if (allAlerts.length === 0) {
    const empty = createEmptyState({
      iconName: 'check',
      title: 'No Urgent Deadlines! 🎉',
      description: 'You have no assignments due within the immediate alert window. Great job keeping on top of coursework!',
      actionText: 'View All Assignments',
      onAction: () => {
        closeActiveModal();
        if (typeof onNavigate === 'function') onNavigate('assignments');
      }
    });
    container.appendChild(empty);
  } else {
    const list = document.createElement('div');
    list.style.display = 'flex';
    list.style.flexDirection = 'column';
    list.style.gap = 'var(--space-3)';

    for (const item of allAlerts) {
      const card = document.createElement('div');
      card.className = 'item-card';
      if (item.alertType === 'overdue') {
        card.style.borderColor = 'var(--color-danger)';
        card.style.backgroundColor = 'var(--color-danger-soft)';
      } else if (item.alertType === 'today') {
        card.style.borderColor = 'var(--color-warning)';
        card.style.backgroundColor = 'var(--color-warning-soft)';
      }

      const body = document.createElement('div');
      body.className = 'item-body';

      const titleEl = document.createElement('div');
      titleEl.className = 'item-title';
      titleEl.textContent = item.title;
      body.appendChild(titleEl);

      const meta = document.createElement('div');
      meta.className = 'item-meta';
      meta.textContent = `Due date: ${item.dueDate}`;
      body.appendChild(meta);
      card.appendChild(body);

      const badge = document.createElement('span');
      badge.className = `chip ${item.alertType === 'overdue' ? 'chip-overdue' : item.alertType === 'today' || item.alertType === 'tomorrow' ? 'chip-due-soon' : 'chip-not-started'}`;
      badge.textContent = item.label;
      card.appendChild(badge);

      list.appendChild(card);
    }
    container.appendChild(list);

    const btnRow = document.createElement('div');
    btnRow.className = 'form-actions';
    btnRow.style.margin = '0';
    btnRow.style.padding = '0';

    const viewAllBtn = document.createElement('button');
    viewAllBtn.type = 'button';
    viewAllBtn.className = 'btn btn-primary';
    viewAllBtn.textContent = 'Go to Assignments & Deadlines 📚';
    viewAllBtn.addEventListener('click', () => {
      closeActiveModal();
      if (typeof onNavigate === 'function') onNavigate('assignments');
    });
    btnRow.appendChild(viewAllBtn);
    container.appendChild(btnRow);
  }

  showModal({
    title: '🔔 Assignment Due Date Reminders',
    contentNode: container
  });
}
