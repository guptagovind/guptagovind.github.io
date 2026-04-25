/**
 * Chat widget - floating button + slide-up panel for AI chat.
 * POSTs to /api/chat with { message, history }.
 */
(function () {
  const history = [];

  const CHAT_SESSION_DISMISSED = 'portfolio_chat_dismissed';
  const CHAT_SESSION_AUTO_DONE = 'portfolio_chat_auto_done';
  const AUTO_OPEN_MS = 5000;
  const DESKTOP_MIN_WIDTH = 768;

  const html = `
    <div class="chat-widget" id="chatWidget">
      <button type="button" class="chat-widget-btn" aria-label="Open chat" id="chatWidgetBtn">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path fill-rule="evenodd" d="M4.848 2.771A49.144 49.144 0 0 1 12 2.25c2.43 0 4.817.178 7.152.52 1.978.292 3.348 2.024 3.348 3.97v6.02c0 1.946-1.37 3.678-3.348 3.97a48.901 48.901 0 0 1-3.476.383.39.39 0 0 0-.297.17l-2.755 4.133a.75.75 0 0 1-1.248-.843l1.755-2.632a.39.39 0 0 0-.297-.17 48.9 48.9 0 0 1-3.476-.384c-1.978-.29-3.348-2.024-3.348-3.97V6.741c0-1.946 1.37-3.68 3.348-3.97Z" clip-rule="evenodd"/>
        </svg>
      </button>
      <div class="chat-widget-panel" id="chatWidgetPanel" role="dialog" aria-label="Chat with Govind">
        <div class="chat-widget-header">Ask me anything</div>
        <div class="chat-widget-messages" id="chatWidgetMessages"></div>
        <div class="chat-widget-input-area">
          <textarea class="chat-widget-input" id="chatWidgetInput" placeholder="Type your question..." rows="1"></textarea>
          <button type="button" class="chat-widget-send" id="chatWidgetSend" aria-label="Send">Send</button>
        </div>
      </div>
    </div>
  `;

  document.body.insertAdjacentHTML('beforeend', html);

  const widget = document.getElementById('chatWidget');
  const btn = document.getElementById('chatWidgetBtn');
  const panel = document.getElementById('chatWidgetPanel');
  const messagesEl = document.getElementById('chatWidgetMessages');
  const inputEl = document.getElementById('chatWidgetInput');
  const sendBtn = document.getElementById('chatWidgetSend');

  const AUTO_GREETING =
    "Hi! I'm Govind's AI assistant. Ask me anything about AI agents, services, or book a discovery call.";
  const MANUAL_GREETING =
    "Hi! Ask me about AI agents, LLM integration, or full-stack delivery. I can explain how Govind works with startups and enterprises.";

  function isDesktopViewport() {
    return window.innerWidth > DESKTOP_MIN_WIDTH;
  }

  function shouldSkipScheduledAutoOpen() {
    try {
      return (
        sessionStorage.getItem(CHAT_SESSION_DISMISSED) === '1' ||
        sessionStorage.getItem(CHAT_SESSION_AUTO_DONE) === '1'
      );
    } catch (e) {
      return false;
    }
  }

  function markAutoOpenDone() {
    try {
      sessionStorage.setItem(CHAT_SESSION_AUTO_DONE, '1');
    } catch (e) {}
  }

  function markDismissed() {
    try {
      sessionStorage.setItem(CHAT_SESSION_DISMISSED, '1');
    } catch (e) {}
  }

  function setPanelOpen(isOpen, options = {}) {
    const { fromAuto = false } = options;

    if (!isOpen) {
      markDismissed();
      widget.classList.remove('chat-widget--autostart');
      panel.classList.remove('open');
      btn.setAttribute('aria-label', 'Open chat');
      btn.setAttribute('aria-expanded', 'false');
      return;
    }

    if (fromAuto) {
      widget.classList.add('chat-widget--autostart');
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          panel.classList.add('open');
          btn.setAttribute('aria-label', 'Close chat');
          btn.setAttribute('aria-expanded', 'true');
          if (messagesEl.children.length === 0) {
            addMessage('assistant', AUTO_GREETING, false, true);
          }
          inputEl.focus();
        });
      });
      return;
    }

    widget.classList.remove('chat-widget--autostart');
    panel.classList.add('open');
    btn.setAttribute('aria-label', 'Close chat');
    btn.setAttribute('aria-expanded', 'true');
    if (messagesEl.children.length === 0) {
      addMessage('assistant', MANUAL_GREETING, false, true);
    }
    inputEl.focus();
  }

  function togglePanelFromButton() {
    if (panel.classList.contains('open')) {
      setPanelOpen(false);
    } else {
      setPanelOpen(true, { fromAuto: false });
    }
  }

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && panel.classList.contains('open')) setPanelOpen(false);
  });

  const CTA_URL = 'https://cal.com/govindgupta/discovery-call';

  function formatMessage(text) {
    const escaped = text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
    let result = escaped
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      .replace(/([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/g, '<a href="mailto:$1">$1</a>')
      .replace(/(https?:\/\/[^\s<]+)/g, '<a href="$1" target="_blank" rel="noopener">$1</a>')
      .replace(/(?<![.\w:])(linkedin\.com\/[a-zA-Z0-9_-]+(?:\/[a-zA-Z0-9_-]*)?)/g, '<a href="https://www.$1" target="_blank" rel="noopener">$1</a>')
      .replace(/(\/#services)/g, '<a href="/#services" class="chat-scroll-link">Services section</a>');
    result = result.replace(
      /<a href="https?:\/\/cal\.com\/govindgupta[^"]*"[^>]*>[^<]*<\/a>/gi,
      '<a href="' + CTA_URL + '" target="_blank" rel="noopener" class="chat-cta-btn">Book a Free Call</a>'
    );
    return result;
  }

  function addMessage(role, content, isError = false, useHtml = false) {
    const div = document.createElement('div');
    div.className = `chat-widget-message ${role}${isError ? ' error' : ''}`;
    if (useHtml && role === 'assistant') {
      div.innerHTML = formatMessage(content);
    } else {
      div.textContent = content;
    }
    messagesEl.appendChild(div);
    messagesEl.scrollTop = messagesEl.scrollHeight;
    return div;
  }

  function setSendLoading(loading) {
    sendBtn.disabled = loading;
    sendBtn.textContent = loading ? '...' : 'Send';
  }

  async function sendMessage() {
    const text = inputEl.value.trim();
    if (!text) return;

    inputEl.value = '';
    addMessage('user', text);
    history.push({ role: 'user', content: text });

    const typingEl = addMessage('assistant', 'Thinking...', false);
    typingEl.classList.add('typing');
    setSendLoading(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text, history: history.slice(0, -1) }),
      });

      const data = await res.json();
      typingEl.remove();

      if (!res.ok) {
        addMessage('assistant', data.error || 'Something went wrong. Please try again.', true);
        history.pop();
        return;
      }

      addMessage('assistant', data.reply, false, true);
      history.push({ role: 'assistant', content: data.reply });
    } catch (err) {
      typingEl.remove();
      addMessage('assistant', 'Network error. Please check your connection and try again.', true);
      history.pop();
    } finally {
      setSendLoading(false);
    }
  }

  btn.addEventListener('click', () => togglePanelFromButton());
  panel.addEventListener('click', (e) => e.stopPropagation());
  document.addEventListener('click', (e) => {
    if (panel.classList.contains('open') && !panel.contains(e.target) && !btn.contains(e.target)) {
      setPanelOpen(false);
    }
  });
  sendBtn.addEventListener('click', sendMessage);
  inputEl.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  });

  let autoOpenTimer = null;

  function clearAutoOpenTimer() {
    if (autoOpenTimer !== null) {
      clearTimeout(autoOpenTimer);
      autoOpenTimer = null;
    }
  }

  function scheduleAutoOpen() {
    clearAutoOpenTimer();
    if (!isDesktopViewport() || shouldSkipScheduledAutoOpen()) return;

    autoOpenTimer = window.setTimeout(() => {
      autoOpenTimer = null;
      if (!isDesktopViewport()) return;
      if (shouldSkipScheduledAutoOpen()) return;
      markAutoOpenDone();
      if (panel.classList.contains('open')) return;
      setPanelOpen(true, { fromAuto: true });
    }, AUTO_OPEN_MS);
  }

  scheduleAutoOpen();

  window.addEventListener(
    'resize',
    () => {
      if (!isDesktopViewport()) {
        clearAutoOpenTimer();
      } else if (!shouldSkipScheduledAutoOpen() && autoOpenTimer === null && !panel.classList.contains('open')) {
        scheduleAutoOpen();
      }
    },
    { passive: true }
  );
})();
