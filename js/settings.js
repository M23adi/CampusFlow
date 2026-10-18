/**
 * CampusFlow — Preferences & Data Safety Management
 * Profile customization, theme toggling, JSON export/import validation, demo data cleanup, and reset.
 * Compliant with RULES.md Section 6 and ARCHITECTURE.md.
 */

import {
  getState,
  updatePreferences,
  setFullState,
  resetApp,
  testGeminiConnection,
  DEFAULT_GEMINI_KEY,
  DEFAULT_GEMINI_MODEL
} from './state.js';
import {
  exportState,
  validateImportedState,
  isStorageAvailable
} from './storage.js';
import {
  showToast,
  showConfirmModal,
  ICONS
} from './ui.js';

/**
 * Render Settings View into container
 * @param {HTMLElement} container
 * @param {(viewName: string) => void} onNavigate
 */
export function renderSettingsView(container, onNavigate) {
  container.innerHTML = '';

  const state = getState();
  const prefs = state.preferences;

  // Header
  const header = document.createElement('div');
  header.className = 'page-header';

  const titleGroup = document.createElement('div');
  titleGroup.className = 'page-title-group';

  const title = document.createElement('h1');
  title.className = 'page-title';
  title.textContent = 'Settings & Data Management';

  const sub = document.createElement('p');
  sub.className = 'page-subtitle';
  sub.textContent = 'Manage your student profile, focus defaults, backup exports, and storage.';

  titleGroup.appendChild(title);
  titleGroup.appendChild(sub);
  header.appendChild(titleGroup);
  container.appendChild(header);

  const grid = document.createElement('div');
  grid.style.display = 'flex';
  grid.style.flexDirection = 'column';
  grid.style.gap = 'var(--space-6)';

  // Section 1: Profile & Preferences Card
  const profileCard = document.createElement('div');
  profileCard.className = 'card';

  const profHeader = document.createElement('div');
  profHeader.className = 'card-header';
  profHeader.innerHTML = `
    <div class="card-title-wrap">
      <span style="color:var(--color-primary)">${ICONS.settings}</span>
      <h2 class="card-title">Profile & Appearance</h2>
    </div>
  `;
  profileCard.appendChild(profHeader);

  const profForm = document.createElement('form');
  profForm.noValidate = true;

  const profRow = document.createElement('div');
  profRow.className = 'form-row';

  // Display Name
  const nameGroup = document.createElement('div');
  nameGroup.className = 'form-group';
  const nameLabel = document.createElement('label');
  nameLabel.className = 'form-label';
  nameLabel.textContent = 'Display Name';
  const nameInput = document.createElement('input');
  nameInput.type = 'text';
  nameInput.className = 'form-input';
  nameInput.placeholder = 'e.g. Alex or Jordan';
  nameInput.value = prefs.userName || '';
  nameGroup.appendChild(nameLabel);
  nameGroup.appendChild(nameInput);
  profRow.appendChild(nameGroup);

  // Theme selection
  const themeGroup = document.createElement('div');
  themeGroup.className = 'form-group';
  const themeLabel = document.createElement('label');
  themeLabel.className = 'form-label';
  themeLabel.textContent = 'Theme';
  const themeSelect = document.createElement('select');
  themeSelect.className = 'form-select';

  const lightOpt = document.createElement('option');
  lightOpt.value = 'light';
  lightOpt.textContent = 'Light Mode (Clean Calm)';
  if (prefs.theme === 'light') lightOpt.selected = true;

  const darkOpt = document.createElement('option');
  darkOpt.value = 'dark';
  darkOpt.textContent = 'Dark Mode (Deep Ink)';
  if (prefs.theme === 'dark') darkOpt.selected = true;

  themeSelect.appendChild(lightOpt);
  themeSelect.appendChild(darkOpt);
  themeGroup.appendChild(themeLabel);
  themeGroup.appendChild(themeSelect);
  profRow.appendChild(themeGroup);

  profForm.appendChild(profRow);

  // Timer defaults
  const timerTitle = document.createElement('h3');
  timerTitle.style.fontSize = '0.95rem';
  timerTitle.style.fontWeight = '700';
  timerTitle.style.margin = 'var(--space-3) 0 var(--space-2)';
  timerTitle.textContent = 'Focus Timer Defaults';
  profForm.appendChild(timerTitle);

  const timerRow = document.createElement('div');
  timerRow.className = 'form-row';

  const focusMinsGroup = document.createElement('div');
  focusMinsGroup.className = 'form-group';
  focusMinsGroup.innerHTML = `<label class="form-label">Focus (Minutes)</label>`;
  const focusInput = document.createElement('input');
  focusInput.type = 'number';
  focusInput.min = '1';
  focusInput.max = '180';
  focusInput.className = 'form-input';
  focusInput.value = prefs.focusMinutes || 25;
  focusMinsGroup.appendChild(focusInput);
  timerRow.appendChild(focusMinsGroup);

  const shortBreakGroup = document.createElement('div');
  shortBreakGroup.className = 'form-group';
  shortBreakGroup.innerHTML = `<label class="form-label">Short Break (Minutes)</label>`;
  const shortBreakInput = document.createElement('input');
  shortBreakInput.type = 'number';
  shortBreakInput.min = '1';
  shortBreakInput.max = '60';
  shortBreakInput.className = 'form-input';
  shortBreakInput.value = prefs.shortBreakMinutes || 5;
  shortBreakGroup.appendChild(shortBreakInput);
  timerRow.appendChild(shortBreakGroup);

  const longBreakGroup = document.createElement('div');
  longBreakGroup.className = 'form-group';
  longBreakGroup.innerHTML = `<label class="form-label">Long Break (Minutes)</label>`;
  const longBreakInput = document.createElement('input');
  longBreakInput.type = 'number';
  longBreakInput.min = '1';
  longBreakInput.max = '90';
  longBreakInput.className = 'form-input';
  longBreakInput.value = prefs.longBreakMinutes || 15;
  longBreakGroup.appendChild(longBreakInput);
  timerRow.appendChild(longBreakGroup);

  profForm.appendChild(timerRow);

  const profActions = document.createElement('div');
  profActions.className = 'form-actions';
  const savePrefsBtn = document.createElement('button');
  savePrefsBtn.type = 'submit';
  savePrefsBtn.className = 'btn btn-primary';
  savePrefsBtn.textContent = 'Save Preferences';
  profActions.appendChild(savePrefsBtn);
  profForm.appendChild(profActions);

  profForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const newTheme = themeSelect.value;
    const newName = nameInput.value.trim();
    const fMins = Math.max(1, Math.min(180, parseInt(focusInput.value, 10) || 25));
    const sMins = Math.max(1, Math.min(60, parseInt(shortBreakInput.value, 10) || 5));
    const lMins = Math.max(1, Math.min(90, parseInt(longBreakInput.value, 10) || 15));

    updatePreferences({
      userName: newName,
      theme: newTheme,
      focusMinutes: fMins,
      shortBreakMinutes: sMins,
      longBreakMinutes: lMins
    });

    document.documentElement.setAttribute('data-theme', newTheme);
    showToast('Preferences saved successfully', 'success');
  });

  profileCard.appendChild(profForm);
  grid.appendChild(profileCard);

  // Section 2: Google Gemini AI Configuration Card
  const aiCard = document.createElement('div');
  aiCard.className = 'card';

  const aiHeader = document.createElement('div');
  aiHeader.className = 'card-header';
  aiHeader.innerHTML = `
    <div class="card-title-wrap">
      <span style="font-size:1.3rem;">🤖</span>
      <h2 class="card-title">Google Gemini AI Configuration</h2>
    </div>
  `;
  aiCard.appendChild(aiHeader);

  const aiDesc = document.createElement('p');
  aiDesc.style.fontSize = '0.9rem';
  aiDesc.style.color = 'var(--color-text-muted)';
  aiDesc.textContent = 'CampusFlow uses Google Gemini directly in your browser to power the 24/7 AI Doubt Solver, concept explanations, and practice question generator.';
  aiCard.appendChild(aiDesc);

  const aiForm = document.createElement('form');
  aiForm.noValidate = true;
  aiForm.style.marginTop = 'var(--space-4)';

  const aiRow = document.createElement('div');
  aiRow.className = 'form-row';

  // API Key Input
  const keyGroup = document.createElement('div');
  keyGroup.className = 'form-group';
  keyGroup.style.flex = '2';
  const keyLabel = document.createElement('label');
  keyLabel.className = 'form-label';
  keyLabel.textContent = 'Google Gemini API Key';

  const keyInputWrap = document.createElement('div');
  keyInputWrap.style.display = 'flex';
  keyInputWrap.style.gap = '8px';

  const keyInput = document.createElement('input');
  keyInput.type = 'password';
  keyInput.className = 'form-input';
  keyInput.value = prefs.geminiApiKey || DEFAULT_GEMINI_KEY;
  keyInput.placeholder = 'Paste your Google Gemini API Key';

  const toggleKeyBtn = document.createElement('button');
  toggleKeyBtn.type = 'button';
  toggleKeyBtn.className = 'btn btn-outline btn-sm';
  toggleKeyBtn.textContent = '👁️ Show';
  toggleKeyBtn.addEventListener('click', () => {
    if (keyInput.type === 'password') {
      keyInput.type = 'text';
      toggleKeyBtn.textContent = '🔒 Hide';
    } else {
      keyInput.type = 'password';
      toggleKeyBtn.textContent = '👁️ Show';
    }
  });

  keyInputWrap.appendChild(keyInput);
  keyInputWrap.appendChild(toggleKeyBtn);
  keyGroup.appendChild(keyLabel);
  keyGroup.appendChild(keyInputWrap);
  aiRow.appendChild(keyGroup);

  // Model Selection
  const modelGroup = document.createElement('div');
  modelGroup.className = 'form-group';
  modelGroup.style.flex = '1';
  const modelLabel = document.createElement('label');
  modelLabel.className = 'form-label';
  modelLabel.textContent = 'Gemini Model';

  const modelSelect = document.createElement('select');
  modelSelect.className = 'form-select';
  const availableModels = [
    { id: 'gemini-2.5-flash', name: 'Gemini 2.5 Flash (Recommended)' },
    { id: 'gemini-flash-latest', name: 'Gemini Flash Latest' },
    { id: 'gemini-2.5-pro', name: 'Gemini 2.5 Pro (Deep Reasoning)' }
  ];

  for (const m of availableModels) {
    const opt = document.createElement('option');
    opt.value = m.id;
    opt.textContent = m.name;
    if (m.id === (prefs.geminiModel || DEFAULT_GEMINI_MODEL)) {
      opt.selected = true;
    }
    modelSelect.appendChild(opt);
  }
  modelGroup.appendChild(modelLabel);
  modelGroup.appendChild(modelSelect);
  aiRow.appendChild(modelGroup);

  aiForm.appendChild(aiRow);

  // Test status element
  const statusMsg = document.createElement('div');
  statusMsg.style.fontSize = '0.85rem';
  statusMsg.style.margin = 'var(--space-3) 0';
  statusMsg.style.display = 'none';

  // Action Buttons row
  const aiBtns = document.createElement('div');
  aiBtns.style.display = 'flex';
  aiBtns.style.gap = 'var(--space-3)';
  aiBtns.style.alignItems = 'center';
  aiBtns.style.flexWrap = 'wrap';

  const saveAiBtn = document.createElement('button');
  saveAiBtn.type = 'submit';
  saveAiBtn.className = 'btn btn-primary';
  saveAiBtn.textContent = 'Save AI Configuration';

  const testBtn = document.createElement('button');
  testBtn.type = 'button';
  testBtn.className = 'btn btn-outline';
  testBtn.textContent = '⚡ Test Connection';
  testBtn.addEventListener('click', async () => {
    testBtn.disabled = true;
    testBtn.textContent = 'Testing...';
    statusMsg.style.display = 'block';
    statusMsg.style.color = 'var(--color-text-muted)';
    statusMsg.textContent = 'Connecting to Google Gemini API...';

    const testRes = await testGeminiConnection(keyInput.value.trim(), modelSelect.value);
    testBtn.disabled = false;
    testBtn.textContent = '⚡ Test Connection';

    if (testRes.success) {
      statusMsg.style.color = 'var(--color-success)';
      statusMsg.innerHTML = `🟢 <strong>${testRes.message}</strong>`;
      showToast('Gemini API connection verified! 🎓', 'success');
    } else {
      statusMsg.style.color = 'var(--color-danger)';
      statusMsg.innerHTML = `🔴 <strong>Error:</strong> ${testRes.error}`;
      showToast('Gemini API test failed', 'error');
    }
  });

  const resetKeyBtn = document.createElement('button');
  resetKeyBtn.type = 'button';
  resetKeyBtn.className = 'btn btn-ghost btn-sm';
  resetKeyBtn.textContent = 'Restore Default Key';
  resetKeyBtn.addEventListener('click', () => {
    keyInput.value = DEFAULT_GEMINI_KEY;
    modelSelect.value = DEFAULT_GEMINI_MODEL;
    showToast('Default API Key restored. Click Save to persist.', 'info');
  });

  aiBtns.appendChild(saveAiBtn);
  aiBtns.appendChild(testBtn);
  aiBtns.appendChild(resetKeyBtn);

  aiForm.appendChild(statusMsg);
  aiForm.appendChild(aiBtns);

  aiForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const newKey = keyInput.value.trim();
    const newModel = modelSelect.value;
    updatePreferences({
      geminiApiKey: newKey,
      geminiModel: newModel
    });
    showToast('Google Gemini AI preferences saved!', 'success');
  });

  aiCard.appendChild(aiForm);
  grid.appendChild(aiCard);

  // Section 3: Data Backup & Safety Card
  const backupCard = document.createElement('div');
  backupCard.className = 'card';

  const backupHeader = document.createElement('div');
  backupHeader.className = 'card-header';
  backupHeader.innerHTML = `
    <div class="card-title-wrap">
      <span style="color:var(--color-success)">${ICONS.tasks}</span>
      <h2 class="card-title">Data Backup & Sync</h2>
    </div>
  `;
  backupCard.appendChild(backupHeader);

  const backupDesc = document.createElement('p');
  backupDesc.style.fontSize = '0.9rem';
  backupDesc.style.color = 'var(--color-text-muted)';
  backupDesc.textContent = 'CampusFlow stores 100% of your data locally inside your browser with no cloud account required. You can export a full JSON snapshot anytime or restore from a previous file.';
  backupCard.appendChild(backupDesc);

  const backupBtnsRow = document.createElement('div');
  backupBtnsRow.style.display = 'flex';
  backupBtnsRow.style.gap = 'var(--space-3)';
  backupBtnsRow.style.flexWrap = 'wrap';
  backupBtnsRow.style.margin = 'var(--space-4) 0';

  // Export JSON Button
  const exportBtn = document.createElement('button');
  exportBtn.type = 'button';
  exportBtn.className = 'btn btn-secondary';
  exportBtn.innerHTML = `<span>Export All Data (JSON)</span>`;
  exportBtn.addEventListener('click', () => {
    const jsonStr = exportState(getState());
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `campusflow-backup-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast('Data exported successfully', 'success');
  });
  backupBtnsRow.appendChild(exportBtn);

  // Import JSON Button
  const fileInput = document.createElement('input');
  fileInput.type = 'file';
  fileInput.accept = '.json,application/json';
  fileInput.className = 'sr-only';

  const importBtn = document.createElement('button');
  importBtn.type = 'button';
  importBtn.className = 'btn btn-secondary';
  importBtn.innerHTML = `<span>Import from JSON File</span>`;
  importBtn.addEventListener('click', () => fileInput.click());

  fileInput.addEventListener('change', (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target.result;
      const validation = validateImportedState(content);
      if (!validation.valid) {
        showToast(`Import Failed: ${validation.error}`, 'danger', 5000);
        return;
      }

      showConfirmModal({
        title: 'Confirm Data Import',
        message: 'Importing this backup will replace your current tasks, assignments, courses, and schedules. Proceed?',
        confirmText: 'Replace & Import',
        confirmVariant: 'primary',
        onConfirm: () => {
          setFullState(validation.data);
          document.documentElement.setAttribute('data-theme', validation.data.preferences.theme || 'light');
          showToast('Data imported successfully!', 'success');
          renderSettingsView(container, onNavigate);
        }
      });
    };
    reader.readAsText(file);
    fileInput.value = '';
  });

  backupBtnsRow.appendChild(importBtn);
  backupBtnsRow.appendChild(fileInput);
  backupCard.appendChild(backupBtnsRow);
  grid.appendChild(backupCard);

  // Section 3: Reset & Clear Card
  const resetCard = document.createElement('div');
  resetCard.className = 'card';
  resetCard.style.borderColor = 'var(--color-danger-border)';

  const resetHeader = document.createElement('div');
  resetHeader.className = 'card-header';
  resetHeader.innerHTML = `
    <div class="card-title-wrap">
      <span style="color:var(--color-danger)">${ICONS.trash}</span>
      <h2 class="card-title" style="color:var(--color-danger)">Danger Zone</h2>
    </div>
  `;
  resetCard.appendChild(resetHeader);

  const resetDesc = document.createElement('p');
  resetDesc.style.fontSize = '0.9rem';
  resetDesc.style.color = 'var(--color-text-muted)';
  resetDesc.textContent = 'Clear sample demo data to start clean, or reset all stored application data to factory defaults.';
  resetCard.appendChild(resetDesc);

  const resetBtnsRow = document.createElement('div');
  resetBtnsRow.style.display = 'flex';
  resetBtnsRow.style.gap = 'var(--space-3)';
  resetBtnsRow.style.flexWrap = 'wrap';
  resetBtnsRow.style.marginTop = 'var(--space-4)';

  // Reset to Clean Blank Slate
  const clearAllBtn = document.createElement('button');
  clearAllBtn.type = 'button';
  clearAllBtn.className = 'btn btn-danger';
  clearAllBtn.textContent = 'Reset to Blank Slate';
  clearAllBtn.addEventListener('click', () => {
    showConfirmModal({
      title: 'Reset All Data',
      message: 'This will erase all tasks, courses, timetable classes, and assignments. Are you sure you want to reset?',
      confirmText: 'Erase Everything',
      confirmVariant: 'danger',
      onConfirm: () => {
        resetApp(false);
        showToast('App reset to clean slate', 'info');
        renderSettingsView(container, onNavigate);
      }
    });
  });
  resetBtnsRow.appendChild(clearAllBtn);

  // Reload Demo Content
  const reloadDemoBtn = document.createElement('button');
  reloadDemoBtn.type = 'button';
  reloadDemoBtn.className = 'btn btn-secondary';
  reloadDemoBtn.textContent = 'Reload Sample Demo Content';
  reloadDemoBtn.addEventListener('click', () => {
    showConfirmModal({
      title: 'Reload Sample Data',
      message: 'This will reset your data with the standard CampusFlow demo courses, assignments, and schedule. Proceed?',
      confirmText: 'Load Demo Data',
      confirmVariant: 'primary',
      onConfirm: () => {
        resetApp(true);
        showToast('Sample demo data loaded', 'success');
        renderSettingsView(container, onNavigate);
      }
    });
  });
  resetBtnsRow.appendChild(reloadDemoBtn);

  resetCard.appendChild(resetBtnsRow);
  grid.appendChild(resetCard);

  container.appendChild(grid);
}
