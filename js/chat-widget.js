/**
 * Chat widget - floating button + slide-up panel for AI chat.
 * POSTs to /api/chat with { message, history }.
 */
(function () {
  const history = [];

  const html = `
    <div class="chat-widget" id="chatWidget">
      <button type="button" class="chat-widget-btn" aria-label="Open chat" id="chatWidgetBtn">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
          <path d="M4.913 2.658c2.075-.27 4.19-.408 6.337-.408 2.147 0 4.262.139 6.337.408 1.92.25 3.921 1.086 5.68 2.246A12.987 12.987 0 0 1 21 12c0 .665-.053 1.32-.163 1.957a8 8 0 0 0-1.414-.012 10.95 10.95 0 0 0 .153-1.698 11.045 11.045 0 0 0-.337-5.77 11.047 11.047 0 0 0-5.77-5.77 11.045 11.045 0 0 0-5.77-.337 10.95 10.95 0 0 0-1.698.153 8 8 0 0 0-.012-1.414A12.987 12.987 0 0 1 12 3c.665 0 1.32.053 1.957.163a8 8 0 0 0-.012 1.414 10.95 10.95 0 0 0 .153 1.698 11.045 11.045 0 0 0-.337 5.77 11.047 11.047 0 0 0 5.77 5.77 11.045 11.045 0 0 0 5.77.337 10.95 10.95 0 0 0 1.698-.153 8 8 0 0 0 .012 1.414A12.987 12.987 0 0 1 12 21a12.987 12.987 0 0 1-5.656-1.096 11.047 11.047 0 0 0 2.246-5.68 11.045 11.045 0 0 0-.408-6.337 11.047 11.047 0 0 0-5.77-5.77z"/>
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

  const btn = document.getElementById('chatWidgetBtn');
  const panel = document.getElementById('chatWidgetPanel');
  const messagesEl = document.getElementById('chatWidgetMessages');
  const inputEl = document.getElementById('chatWidgetInput');
  const sendBtn = document.getElementById('chatWidgetSend');

  function togglePanel(open) {
    const isOpen = open !== undefined ? open : !panel.classList.contains('open');
    panel.classList.toggle('open', isOpen);
    btn.setAttribute('aria-label', isOpen ? 'Close chat' : 'Open chat');
    btn.setAttribute('aria-expanded', isOpen);
    if (isOpen) inputEl.focus();
  }

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && panel.classList.contains('open')) togglePanel(false);
  });

  function addMessage(role, content, isError = false) {
    const div = document.createElement('div');
    div.className = `chat-widget-message ${role}${isError ? ' error' : ''}`;
    div.textContent = content;
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

      addMessage('assistant', data.reply);
      history.push({ role: 'assistant', content: data.reply });
    } catch (err) {
      typingEl.remove();
      addMessage('assistant', 'Network error. Please check your connection and try again.', true);
      history.pop();
    } finally {
      setSendLoading(false);
    }
  }

  btn.addEventListener('click', () => togglePanel());
  panel.addEventListener('click', (e) => e.stopPropagation());
  document.addEventListener('click', (e) => {
    if (panel.classList.contains('open') && !panel.contains(e.target) && !btn.contains(e.target)) {
      togglePanel(false);
    }
  });
  sendBtn.addEventListener('click', sendMessage);
  inputEl.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  });
})();
