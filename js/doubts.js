/**
 * CampusFlow — AI Academic Doubt Solver
 * Instant concept explanations, step-by-step homework help, code debugging, and exam preparation.
 * Powered by Google Gemini API. Compliant with RULES.md and ARCHITECTURE.md.
 */

import {
  getState,
  askGeminiDoubt,
  getGeminiApiKey,
  getGeminiModel,
  addTask
} from './state.js';
import { escapeHtml } from './utils.js';
import { showToast, triggerConfetti, ICONS } from './ui.js';

// Session-persistent conversation messages for the current page session
let activeChatHistory = [];
let currentStudyMode = 'explain';
let selectedCourseId = '';
let isGenerating = false;

/**
 * Render Doubts View into container
 * @param {HTMLElement} container
 * @param {(viewName: string) => void} onNavigate
 */
export function renderDoubtsView(container, onNavigate) {
  container.innerHTML = '';

  const state = getState();
  const courses = state.courses || [];
  const apiKey = getGeminiApiKey();
  const model = getGeminiModel();

  // Page Header
  const header = document.createElement('div');
  header.className = 'page-header';

  const titleGroup = document.createElement('div');
  titleGroup.className = 'page-title-group';

  const title = document.createElement('h1');
  title.className = 'page-title';
  title.innerHTML = '<span>💡 AI Academic Doubt Solver</span>';

  const sub = document.createElement('p');
  sub.className = 'page-subtitle';
  sub.textContent = 'Instant 24/7 concept explanations, code debugging, and step-by-step problem solving powered by Google Gemini.';

  titleGroup.appendChild(title);
  titleGroup.appendChild(sub);
  header.appendChild(titleGroup);

  // Top action bar
  const headerActions = document.createElement('div');
  headerActions.style.display = 'flex';
  headerActions.style.alignItems = 'center';
  headerActions.style.gap = 'var(--space-2)';

  // Status badge
  const statusBadge = document.createElement('span');
  statusBadge.className = 'badge';
  if (apiKey) {
    statusBadge.className += ' badge-success';
    statusBadge.innerHTML = '🟢 ' + model;
    statusBadge.title = 'Google Gemini API is configured and ready';
  } else {
    statusBadge.className += ' badge-warning';
    statusBadge.innerHTML = '⚠️ Key Missing';
    statusBadge.title = 'API key required in Settings';
  }
  headerActions.appendChild(statusBadge);

  // Settings shortcut
  const settingsBtn = document.createElement('button');
  settingsBtn.type = 'button';
  settingsBtn.className = 'btn btn-ghost btn-sm';
  settingsBtn.textContent = '⚙️ AI Config';
  settingsBtn.title = 'Configure Gemini API Key in Settings';
  settingsBtn.addEventListener('click', () => onNavigate('settings'));
  headerActions.appendChild(settingsBtn);

  // Clear chat button
  const clearBtn = document.createElement('button');
  clearBtn.type = 'button';
  clearBtn.className = 'btn btn-ghost btn-sm';
  clearBtn.textContent = '🗑️ Clear Chat';
  clearBtn.title = 'Reset conversation thread';
  clearBtn.addEventListener('click', () => {
    activeChatHistory = [];
    renderDoubtsView(container, onNavigate);
    showToast('Conversation cleared.', 'info');
  });
  headerActions.appendChild(clearBtn);

  header.appendChild(headerActions);
  container.appendChild(header);

  // Doubt Solver Main Workspace Card
  const workspaceCard = document.createElement('div');
  workspaceCard.className = 'card';
  workspaceCard.style.display = 'flex';
  workspaceCard.style.flexDirection = 'column';
  workspaceCard.style.padding = '0';
  workspaceCard.style.overflow = 'hidden';
  workspaceCard.style.minHeight = '620px';

  // Toolbar: Course Context & Study Mode Selectors
  const toolbar = document.createElement('div');
  toolbar.style.padding = 'var(--space-3) var(--space-4)';
  toolbar.style.borderBottom = '1px solid var(--color-border)';
  toolbar.style.backgroundColor = 'var(--color-surface-soft)';
  toolbar.style.display = 'flex';
  toolbar.style.flexWrap = 'wrap';
  toolbar.style.alignItems = 'center';
  toolbar.style.justifyContent = 'space-between';
  toolbar.style.gap = 'var(--space-3)';

  // Left: Course selector
  const courseWrap = document.createElement('div');
  courseWrap.style.display = 'flex';
  courseWrap.style.alignItems = 'center';
  courseWrap.style.gap = 'var(--space-2)';

  const courseLabel = document.createElement('label');
  courseLabel.style.fontSize = '0.85rem';
  courseLabel.style.fontWeight = '600';
  courseLabel.textContent = '📚 Course:';
  courseLabel.htmlFor = 'doubt-course-select';

  const courseSelect = document.createElement('select');
  courseSelect.id = 'doubt-course-select';
  courseSelect.className = 'form-select';
  courseSelect.style.fontSize = '0.85rem';
  courseSelect.style.padding = '4px 10px';
  courseSelect.style.width = 'auto';

  const generalOpt = document.createElement('option');
  generalOpt.value = '';
  generalOpt.textContent = 'General / All Subjects';
  courseSelect.appendChild(generalOpt);

  for (const c of courses) {
    const opt = document.createElement('option');
    opt.value = c.id;
    opt.textContent = `${c.code || ''} ${c.name}`.trim();
    if (c.id === selectedCourseId) opt.selected = true;
    courseSelect.appendChild(opt);
  }

  courseSelect.addEventListener('change', (e) => {
    selectedCourseId = e.target.value;
  });

  courseWrap.appendChild(courseLabel);
  courseWrap.appendChild(courseSelect);
  toolbar.appendChild(courseWrap);

  // Right: Study Mode Chips
  const modesWrap = document.createElement('div');
  modesWrap.style.display = 'flex';
  modesWrap.style.alignItems = 'center';
  modesWrap.style.gap = '6px';
  modesWrap.style.flexWrap = 'wrap';

  const modes = [
    { id: 'explain', label: '💡 Concept' },
    { id: 'steps', label: '📝 Steps' },
    { id: 'code', label: '💻 Code' },
    { id: 'quiz', label: '🎯 Quiz Me' }
  ];

  for (const m of modes) {
    const modeBtn = document.createElement('button');
    modeBtn.type = 'button';
    modeBtn.className = `btn btn-sm ${currentStudyMode === m.id ? 'btn-primary' : 'btn-outline'}`;
    modeBtn.style.padding = '3px 10px';
    modeBtn.style.fontSize = '0.8rem';
    modeBtn.textContent = m.label;
    modeBtn.addEventListener('click', () => {
      currentStudyMode = m.id;
      // Update UI active buttons
      for (const btn of modesWrap.querySelectorAll('button')) {
        btn.className = 'btn btn-sm btn-outline';
      }
      modeBtn.className = 'btn btn-sm btn-primary';
    });
    modesWrap.appendChild(modeBtn);
  }
  toolbar.appendChild(modesWrap);
  workspaceCard.appendChild(toolbar);

  // Chat Messages Scroll Container
  const chatMessages = document.createElement('div');
  chatMessages.id = 'doubts-chat-messages';
  chatMessages.style.flex = '1';
  chatMessages.style.padding = 'var(--space-5)';
  chatMessages.style.overflowY = 'auto';
  chatMessages.style.display = 'flex';
  chatMessages.style.flexDirection = 'column';
  chatMessages.style.gap = 'var(--space-4)';
  chatMessages.style.maxHeight = '520px';

  // Render previous messages or welcome starter chips
  if (activeChatHistory.length === 0) {
    chatMessages.appendChild(createWelcomePromptWidget((starterPrompt) => {
      sendDoubtMessage(starterPrompt, chatMessages, onNavigate);
    }));
  } else {
    for (const msg of activeChatHistory) {
      appendChatMessage(chatMessages, msg, onNavigate);
    }
  }

  workspaceCard.appendChild(chatMessages);

  // Bottom Input Form
  const inputContainer = document.createElement('div');
  inputContainer.style.padding = 'var(--space-4)';
  inputContainer.style.borderTop = '1px solid var(--color-border)';
  inputContainer.style.backgroundColor = 'var(--color-surface)';

  const inputForm = document.createElement('form');
  inputForm.style.display = 'flex';
  inputForm.style.gap = 'var(--space-2)';
  inputForm.style.alignItems = 'flex-end';

  const textarea = document.createElement('textarea');
  textarea.className = 'form-input';
  textarea.placeholder = 'Ask any question or academic doubt... (e.g. "Explain Dijkstra algorithm with an example" or "Why does page fault occur?")';
  textarea.style.resize = 'none';
  textarea.style.height = '52px';
  textarea.style.maxHeight = '140px';
  textarea.style.lineHeight = '1.4';
  textarea.rows = 2;

  // Auto-resize textarea
  textarea.addEventListener('input', () => {
    textarea.style.height = 'auto';
    textarea.style.height = Math.min(textarea.scrollHeight, 140) + 'px';
  });

  // Submit on Enter (without Shift)
  textarea.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      inputForm.dispatchEvent(new Event('submit', { cancelable: true }));
    }
  });

  const sendBtn = document.createElement('button');
  sendBtn.type = 'submit';
  sendBtn.className = 'btn btn-primary';
  sendBtn.style.height = '52px';
  sendBtn.style.padding = '0 var(--space-4)';
  sendBtn.style.display = 'flex';
  sendBtn.style.alignItems = 'center';
  sendBtn.style.gap = 'var(--space-2)';
  sendBtn.innerHTML = `<span>Ask</span> <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>`;

  inputForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const query = textarea.value.trim();
    if (!query || isGenerating) return;

    textarea.value = '';
    textarea.style.height = '52px';
    sendDoubtMessage(query, chatMessages, onNavigate);
  });

  inputForm.appendChild(textarea);
  inputForm.appendChild(sendBtn);
  inputContainer.appendChild(inputForm);

  // Footer tip
  const footerHint = document.createElement('div');
  footerHint.style.display = 'flex';
  footerHint.style.justifyContent = 'space-between';
  footerHint.style.fontSize = '0.75rem';
  footerHint.style.color = 'var(--color-text-muted)';
  footerHint.style.marginTop = 'var(--space-2)';
  footerHint.innerHTML = `
    <span>💡 Tip: Press <strong>Enter</strong> to send, <strong>Shift+Enter</strong> for newline</span>
    <span>Google Gemini 2.5 Flash • Context-aware Academic Tutor</span>
  `;
  inputContainer.appendChild(footerHint);

  workspaceCard.appendChild(inputContainer);
  container.appendChild(workspaceCard);
}

/**
 * Create starter suggested prompts when chat is empty
 * @param {(prompt: string) => void} onSelectPrompt
 * @returns {HTMLElement}
 */
function createWelcomePromptWidget(onSelectPrompt) {
  const wrap = document.createElement('div');
  wrap.className = 'welcome-prompt-widget';
  wrap.style.display = 'flex';
  wrap.style.flexDirection = 'column';
  wrap.style.alignItems = 'center';
  wrap.style.justifyContent = 'center';
  wrap.style.padding = 'var(--space-8) var(--space-4)';
  wrap.style.textAlign = 'center';

  const iconCircle = document.createElement('div');
  iconCircle.style.width = '64px';
  iconCircle.style.height = '64px';
  iconCircle.style.borderRadius = '50%';
  iconCircle.style.backgroundColor = 'var(--color-primary-soft)';
  iconCircle.style.color = 'var(--color-primary)';
  iconCircle.style.display = 'flex';
  iconCircle.style.alignItems = 'center';
  iconCircle.style.justifyContent = 'center';
  iconCircle.style.fontSize = '2rem';
  iconCircle.style.marginBottom = 'var(--space-3)';
  iconCircle.textContent = '🎓';
  wrap.appendChild(iconCircle);

  const title = document.createElement('h3');
  title.style.fontSize = '1.2rem';
  title.style.fontWeight = '700';
  title.style.marginBottom = 'var(--space-2)';
  title.textContent = 'What do you want to master today?';
  wrap.appendChild(title);

  const desc = document.createElement('p');
  desc.style.maxWidth = '520px';
  desc.style.fontSize = '0.9rem';
  desc.style.color = 'var(--color-text-muted)';
  desc.style.marginBottom = 'var(--space-6)';
  desc.textContent = 'Ask any question, paste homework problems, request code debugging, or choose a topic below to begin.';
  wrap.appendChild(desc);

  // Suggestions Grid
  const grid = document.createElement('div');
  grid.style.display = 'grid';
  grid.style.gridTemplateColumns = 'repeat(auto-fit, minmax(240px, 1fr))';
  grid.style.gap = 'var(--space-3)';
  grid.style.width = '100%';
  grid.style.maxWidth = '640px';

  const suggestions = [
    { icon: '🌳', text: 'Explain Binary Search Tree vs AVL Tree with balance factor' },
    { icon: '⚡', text: 'How does Dijkstra Algorithm find shortest paths step-by-step?' },
    { icon: '💾', text: 'Explain Page Faults and Virtual Memory replacement in OS' },
    { icon: '🌐', text: 'Explain TCP 3-Way Handshake vs UDP with sequence flow' },
    { icon: '🎯', text: 'Create 3 challenging exam practice questions for Data Mining' }
  ];

  for (const s of suggestions) {
    const card = document.createElement('button');
    card.type = 'button';
    card.className = 'btn btn-outline';
    card.style.textAlign = 'left';
    card.style.padding = '10px 14px';
    card.style.display = 'flex';
    card.style.alignItems = 'flex-start';
    card.style.gap = '10px';
    card.style.fontSize = '0.85rem';
    card.style.fontWeight = '500';
    card.style.lineHeight = '1.35';
    card.style.borderRadius = 'var(--radius-md)';
    card.style.transition = 'all 0.2s ease';

    card.innerHTML = `<span style="font-size:1.15rem;flex-shrink:0;">${s.icon}</span> <span>${s.text}</span>`;
    card.addEventListener('click', () => onSelectPrompt(s.text));
    grid.appendChild(card);
  }

  wrap.appendChild(grid);
  return wrap;
}

/**
 * Send user query to Google Gemini and render response
 * @param {string} query
 * @param {HTMLElement} chatContainer
 * @param {(view: string) => void} onNavigate
 */
async function sendDoubtMessage(query, chatContainer, onNavigate) {
  if (isGenerating) return;
  isGenerating = true;

  // Clear welcome widget if present
  const welcomeWidget = chatContainer.querySelector('.welcome-prompt-widget');
  if (welcomeWidget) {
    chatContainer.removeChild(welcomeWidget);
  }

  // 1. Add User Message
  const userMsg = {
    role: 'user',
    text: query,
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  };
  activeChatHistory.push(userMsg);
  appendChatMessage(chatContainer, userMsg, onNavigate);

  // 2. Add Loading Indicator
  const loadingEl = document.createElement('div');
  loadingEl.className = 'doubt-loading-indicator';
  loadingEl.style.display = 'flex';
  loadingEl.style.alignItems = 'center';
  loadingEl.style.gap = 'var(--space-3)';
  loadingEl.style.padding = 'var(--space-3) var(--space-4)';
  loadingEl.style.backgroundColor = 'var(--color-surface)';
  loadingEl.style.borderRadius = 'var(--radius-md)';
  loadingEl.style.maxWidth = '360px';
  loadingEl.style.border = '1px solid var(--color-border)';

  loadingEl.innerHTML = `
    <div class="ai-avatar" style="width:28px;height:28px;border-radius:50%;background-color:var(--color-primary-soft);color:var(--color-primary);display:flex;align-items:center;justify-content:center;font-size:0.9rem;">🤖</div>
    <div style="font-size:0.86rem;color:var(--color-text-muted);display:flex;align-items:center;gap:6px;">
      <span>AI tutor is analyzing doubt</span>
      <span class="loading-dots"><span>.</span><span>.</span><span>.</span></span>
    </div>
  `;
  chatContainer.appendChild(loadingEl);
  chatContainer.scrollTop = chatContainer.scrollHeight;

  // 3. Make Gemini API Call
  const response = await askGeminiDoubt({
    prompt: query,
    conversationHistory: activeChatHistory.slice(0, -1),
    courseId: selectedCourseId || null,
    studyMode: currentStudyMode
  });

  // Remove loading indicator
  if (loadingEl.parentNode) {
    loadingEl.parentNode.removeChild(loadingEl);
  }

  isGenerating = false;

  if (response.success) {
    const assistantMsg = {
      role: 'assistant',
      text: response.text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      courseId: selectedCourseId,
      studyMode: currentStudyMode
    };
    activeChatHistory.push(assistantMsg);
    appendChatMessage(chatContainer, assistantMsg, onNavigate);
    triggerConfetti(0.3);
  } else {
    const errorMsg = {
      role: 'assistant',
      isError: true,
      text: `⚠️ **Unable to complete doubt explanation:**\n\n${response.error}\n\n*Please verify your Google Gemini API key in Settings.*`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    activeChatHistory.push(errorMsg);
    appendChatMessage(chatContainer, errorMsg, onNavigate);
  }

  chatContainer.scrollTop = chatContainer.scrollHeight;
}

/**
 * Append a single message bubble to the chat container
 * @param {HTMLElement} container
 * @param {object} msg
 * @param {(view: string) => void} onNavigate
 */
function appendChatMessage(container, msg, onNavigate) {
  const isUser = msg.role === 'user';

  const row = document.createElement('div');
  row.style.display = 'flex';
  row.style.flexDirection = isUser ? 'row-reverse' : 'row';
  row.style.alignItems = 'flex-start';
  row.style.gap = 'var(--space-3)';
  row.style.marginBottom = 'var(--space-2)';

  // Avatar
  const avatar = document.createElement('div');
  avatar.style.width = '34px';
  avatar.style.height = '34px';
  avatar.style.borderRadius = '50%';
  avatar.style.display = 'flex';
  avatar.style.alignItems = 'center';
  avatar.style.justifyContent = 'center';
  avatar.style.fontWeight = '700';
  avatar.style.fontSize = '0.9rem';
  avatar.style.flexShrink = '0';

  if (isUser) {
    avatar.style.backgroundColor = 'var(--color-primary)';
    avatar.style.color = '#FFFFFF';
    avatar.textContent = (getState().preferences.userName || 'S').charAt(0).toUpperCase();
  } else {
    avatar.style.backgroundColor = msg.isError ? 'var(--color-danger-soft)' : 'var(--color-primary-soft)';
    avatar.style.color = msg.isError ? 'var(--color-danger)' : 'var(--color-primary)';
    avatar.textContent = msg.isError ? '⚠️' : '🤖';
  }
  row.appendChild(avatar);

  // Message Card Body
  const bubble = document.createElement('div');
  bubble.style.maxWidth = '80%';
  bubble.style.borderRadius = 'var(--radius-md)';
  bubble.style.padding = 'var(--space-3) var(--space-4)';
  bubble.style.lineHeight = '1.5';
  bubble.style.fontSize = '0.92rem';
  bubble.style.boxShadow = '0 1px 3px rgba(0,0,0,0.06)';

  if (isUser) {
    bubble.style.backgroundColor = 'var(--color-primary-soft)';
    bubble.style.color = 'var(--color-text)';
    bubble.style.borderTopRightRadius = '4px';
    bubble.textContent = msg.text;
  } else {
    bubble.style.backgroundColor = 'var(--color-surface)';
    bubble.style.border = '1px solid var(--color-border)';
    bubble.style.color = 'var(--color-text)';
    bubble.style.borderTopLeftRadius = '4px';

    // Render formatted markdown
    const contentDiv = document.createElement('div');
    contentDiv.className = 'doubt-markdown-content';
    contentDiv.innerHTML = formatMarkdownToSafeHtml(msg.text);
    bubble.appendChild(contentDiv);

    // Code copy buttons listener
    const codeBlocks = contentDiv.querySelectorAll('pre');
    for (const pre of codeBlocks) {
      const copyBtn = document.createElement('button');
      copyBtn.type = 'button';
      copyBtn.className = 'btn btn-ghost btn-sm';
      copyBtn.style.position = 'absolute';
      copyBtn.style.top = '6px';
      copyBtn.style.right = '6px';
      copyBtn.style.padding = '2px 8px';
      copyBtn.style.fontSize = '0.75rem';
      copyBtn.textContent = '📋 Copy';

      pre.style.position = 'relative';
      copyBtn.addEventListener('click', () => {
        const codeText = pre.querySelector('code')?.innerText || pre.innerText;
        navigator.clipboard.writeText(codeText).then(() => {
          copyBtn.textContent = '✓ Copied!';
          setTimeout(() => { copyBtn.textContent = '📋 Copy'; }, 2000);
        });
      });
      pre.appendChild(copyBtn);
    }

    // Action Footer for Assistant Replies
    if (!msg.isError) {
      const actionRow = document.createElement('div');
      actionRow.style.display = 'flex';
      actionRow.style.alignItems = 'center';
      actionRow.style.gap = 'var(--space-3)';
      actionRow.style.marginTop = 'var(--space-3)';
      actionRow.style.paddingTop = 'var(--space-2)';
      actionRow.style.borderTop = '1px solid var(--color-border-subtle)';
      actionRow.style.fontSize = '0.8rem';

      // Copy Explanation
      const copyTextBtn = document.createElement('button');
      copyTextBtn.type = 'button';
      copyTextBtn.className = 'btn btn-ghost btn-sm';
      copyTextBtn.style.padding = '2px 6px';
      copyTextBtn.style.fontSize = '0.78rem';
      copyTextBtn.innerHTML = '📋 Copy Answer';
      copyTextBtn.addEventListener('click', () => {
        navigator.clipboard.writeText(msg.text).then(() => {
          showToast('Explanation copied to clipboard!', 'success');
        });
      });
      actionRow.appendChild(copyTextBtn);

      // Add to Tasks Button
      const addTaskBtn = document.createElement('button');
      addTaskBtn.type = 'button';
      addTaskBtn.className = 'btn btn-ghost btn-sm';
      addTaskBtn.style.padding = '2px 6px';
      addTaskBtn.style.fontSize = '0.78rem';
      addTaskBtn.innerHTML = '➕ Add to Tasks';
      addTaskBtn.addEventListener('click', () => {
        const firstLine = msg.text.split('\n')[0].replace(/[#*`]/g, '').trim();
        const taskTitle = 'Review: ' + (firstLine.length > 50 ? firstLine.slice(0, 48) + '...' : firstLine);
        addTask({
          title: taskTitle,
          notes: msg.text.slice(0, 500) + '...',
          priority: 'medium',
          courseId: msg.courseId || null,
          dueDate: null
        });
        showToast('Study task added to your Tasks To-Do list! 📝', 'success');
      });
      actionRow.appendChild(addTaskBtn);

      bubble.appendChild(actionRow);
    }
  }

  // Timestamp
  const timeSpan = document.createElement('div');
  timeSpan.style.fontSize = '0.72rem';
  timeSpan.style.color = 'var(--color-text-muted)';
  timeSpan.style.marginTop = '4px';
  timeSpan.style.textAlign = isUser ? 'right' : 'left';
  timeSpan.textContent = msg.timestamp || '';
  bubble.appendChild(timeSpan);

  row.appendChild(bubble);
  container.appendChild(row);
}

/**
 * Clean, safe Markdown to HTML parser for academic responses
 * Handles headers, bold, italics, code blocks, bullet lists, and paragraphs.
 * @param {string} text
 * @returns {string}
 */
function formatMarkdownToSafeHtml(text) {
  if (!text) return '';

  // 1. Extract and protect code blocks
  const codeBlocks = [];
  let processed = text.replace(/```([a-zA-Z0-9_-]*)\n([\s\S]*?)```/g, (match, lang, code) => {
    const placeholder = `__CODE_BLOCK_${codeBlocks.length}__`;
    codeBlocks.push({ lang: lang || 'text', code: escapeHtml(code.trim()) });
    return placeholder;
  });

  // 2. Escape general text
  processed = escapeHtml(processed);

  // 3. Inline code `code`
  processed = processed.replace(/`([^`]+)`/g, '<code class="inline-code">$1</code>');

  // 4. Bold **text**
  processed = processed.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');

  // 5. Italic *text*
  processed = processed.replace(/\*([^*]+)\*/g, '<em>$1</em>');

  // 6. Headers ### Title
  processed = processed.replace(/^### (.*$)/gim, '<h4 style="margin:12px 0 6px;font-size:1.05rem;font-weight:700;">$1</h4>');
  processed = processed.replace(/^## (.*$)/gim, '<h3 style="margin:16px 0 8px;font-size:1.15rem;font-weight:750;">$1</h3>');
  processed = processed.replace(/^# (.*$)/gim, '<h2 style="margin:18px 0 10px;font-size:1.25rem;font-weight:800;">$1</h2>');

  // 7. Bullet lists - Item
  processed = processed.replace(/^\s*[-*]\s+(.*$)/gim, '<li style="margin-left:20px;list-style-type:disc;">$1</li>');

  // 8. Numbered lists 1. Item
  processed = processed.replace(/^\s*(\d+)\.\s+(.*$)/gim, '<li style="margin-left:20px;list-style-type:decimal;">$2</li>');

  // 9. Convert line breaks
  processed = processed.replace(/\n\n+/g, '<br><br>');
  processed = processed.replace(/\n/g, '<br>');

  // 10. Restore code blocks
  for (let i = 0; i < codeBlocks.length; i++) {
    const block = codeBlocks[i];
    const htmlCode = `<pre class="doubt-code-block" style="background-color:var(--color-surface-soft);border:1px solid var(--color-border);border-radius:var(--radius-sm);padding:12px;margin:10px 0;overflow-x:auto;font-family:monospace;font-size:0.86rem;line-height:1.45;"><code class="language-${block.lang}">${block.code}</code></pre>`;
    processed = processed.replace(`__CODE_BLOCK_${i}__`, htmlCode);
  }

  return processed;
}
