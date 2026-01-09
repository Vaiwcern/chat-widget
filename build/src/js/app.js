// Chat Widget App
const messagesContainer = document.getElementById('messages');
const messageInput = document.getElementById('message-input');
const sendBtn = document.getElementById('send-btn');
const closeBtn = document.getElementById('close-btn');
const suggestedQuestionsContainer = document.getElementById('suggested-questions');
const launcherBtn = document.getElementById('chat-launcher');
const headerIcon = document.getElementById('header-icon');

// API Configuration
const API_BASE_URL = 'https://aiagent-9816974896.asia-southeast1.run.app';
const CREATE_SESSION_API = `${API_BASE_URL}/create_session`;
const CHAT_STREAM_API = `${API_BASE_URL}/chat/stream`;

// Session state
let userId = `user_${Date.now()}`;
let sessionId = null;

// Stream abort control
let abortController = null;
let isProcessing = false;

// Timer state for response time tracking
let timerState = {
    startTime: null,
    intervalId: null,
    currentMessageId: null
};

// Toggle between send (arrow) and stop (square) icons
function setSendMode() {
    const sendIcon = document.getElementById('send-icon');
    const stopIcon = document.getElementById('stop-icon');
    const sendBtn = document.getElementById('send-btn');
    const input = document.getElementById('message-input');
    if (sendIcon && stopIcon) {
        sendIcon.style.display = 'inline-block';
        stopIcon.style.display = 'none';
        sendBtn.disabled = false;
        input.disabled = false;
        // remove processing visual from the button
        sendBtn.classList.remove('processing');
        sendBtn.title = 'Gửi';
    }
    isProcessing = false;
}

function setStopMode() {
    const sendIcon = document.getElementById('send-icon');
    const stopIcon = document.getElementById('stop-icon');
    const sendBtn = document.getElementById('send-btn');
    const input = document.getElementById('message-input');
    if (sendIcon && stopIcon) {
        sendIcon.style.display = 'none';
        stopIcon.style.display = 'inline-block';
        sendBtn.disabled = false; // still clickable to stop
        input.disabled = true;
        // add processing visual (red circular background)
        sendBtn.classList.add('processing');
        sendBtn.title = 'Dừng';
    }
    isProcessing = true;
}

// Timer functions for response time tracking
function startTimer(messageId) {
    console.log('[Timer] Starting timer for message:', messageId);
    // Clear any existing timer
    stopTimer();
    
    timerState.startTime = Date.now();
    timerState.currentMessageId = messageId;
    
    // Update timer display every 100ms
    timerState.intervalId = setInterval(() => {
        updateTimerDisplay(messageId);
    }, 100);
    console.log('[Timer] Timer started, interval ID:', timerState.intervalId);
}

function updateTimerDisplay(messageId) {
    if (!timerState.startTime || timerState.currentMessageId !== messageId) {
        console.log('[Timer] Skipping update - conditions not met');
        return;
    }
    
    const elapsed = (Date.now() - timerState.startTime) / 1000; // in seconds
    const formattedTime = elapsed.toFixed(1) + 's';
    console.log('[Timer] Updating display:', formattedTime);
    
    const messageDiv = document.getElementById(messageId);
    if (messageDiv) {
        // Update or create timer element
        let timerEl = messageDiv.querySelector('.response-timer');
        if (!timerEl) {
            timerEl = document.createElement('span');
            timerEl.className = 'response-timer';
            messageDiv.appendChild(timerEl);
            console.log('[Timer] Created new timer element');
        }
        timerEl.textContent = formattedTime;
        console.log('[Timer] Timer element content:', timerEl.textContent);
    } else {
        console.log('[Timer] Message div not found:', messageId);
    }
}

function stopTimer(messageId) {
    console.log('[Timer] Stopping timer for:', messageId);
    if (timerState.intervalId) {
        clearInterval(timerState.intervalId);
        timerState.intervalId = null;
    }
    
    // If messageId provided, show final time
    if (messageId && timerState.startTime) {
        const elapsed = (Date.now() - timerState.startTime) / 1000;
        const formattedTime = elapsed.toFixed(1) + 's';
        console.log('[Timer] Final time:', formattedTime);
        
        const messageDiv = document.getElementById(messageId);
        if (messageDiv) {
            let timerEl = messageDiv.querySelector('.response-timer');
            if (!timerEl) {
                timerEl = document.createElement('span');
                timerEl.className = 'response-timer';
                messageDiv.appendChild(timerEl);
            }
            timerEl.textContent = formattedTime;
        }
    }
    
    timerState.startTime = null;
    timerState.currentMessageId = null;
}

// Show/hide chat widget
function showChat() {
    const widget = document.getElementById('chat-widget');
    if (widget) widget.classList.add('open');
    if (launcherBtn) launcherBtn.style.display = 'none';
    if (headerIcon) headerIcon.style.display = 'inline-flex';
    // initialize session when opening first time
    if (!sessionId) initializeSession();
}

function hideChat() {
    const widget = document.getElementById('chat-widget');
    if (widget) widget.classList.remove('open');
    if (launcherBtn) launcherBtn.style.display = 'flex';
    if (headerIcon) headerIcon.style.display = 'none';
}

// Initialize - Create session on load
async function initializeSession() {
    try {
        console.log('Creating session with URL:', CREATE_SESSION_API);
        const response = await fetch(CREATE_SESSION_API, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ user_id: userId })
        });
        
        console.log('Response status:', response.status);
        console.log('Response ok:', response.ok);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('Response data:', data);
        
        if (data.status === 'success') {
            sessionId = data.data.session_id;
            console.log('Session created:', sessionId);
        } else {
            console.error('Failed to create session:', data);
            addMessage('Lỗi: không thể khởi tạo session - ' + JSON.stringify(data), 'bot');
        }
    } catch (error) {
        console.error('Error creating session:', error);
        console.error('Error name:', error.name);
        console.error('Error message:', error.message);
        addMessage('Lỗi kết nối: ' + error.message, 'bot');
    }
}

// Send message with streaming
async function sendMessage() {
    console.log('[Debug] sendMessage called');
    // If currently processing, abort the stream
    if (isProcessing && abortController) {
        console.log('[Debug] Aborting current request');
        abortController.abort();
        setSendMode();
        return;
    }
    
    const message = messageInput.value.trim();
    
    console.log('[Debug] sendMessage called, message:', message, 'sessionId:', sessionId);
    
    if (!message) {
        console.warn('[Debug] Message is empty');
        return;
    }
    
    if (!sessionId) {
        console.warn('[Debug] No session ID');
        addMessage('Chưa khởi tạo session. Vui lòng tải lại trang.', 'bot');
        return;
    }
    
    // Add user message to UI
    addMessage(message, 'user');
    messageInput.value = '';
    clearSuggestedQuestions();
    
    // Add loading indicator (use processing UI)
    const botMessageId = addMessage('', 'bot');
    console.log('[Debug] Created bot message with ID:', botMessageId);
    const messageDiv = document.getElementById(botMessageId);
    if (messageDiv) messageDiv.classList.add('processing');
    showProcessing(botMessageId, 'Đang xử lý...');
    setStopMode();
    
    // Start response timer
    console.log('[Debug] About to call startTimer');
    startTimer(botMessageId);
    console.log('[Debug] startTimer completed');
    
    // Create abort controller for this request
    abortController = new AbortController();
    
    try {
        console.log('Fetching stream from:', CHAT_STREAM_API);
        
        const response = await fetch(CHAT_STREAM_API, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                user_id: userId,
                session_id: sessionId,
                message: message
            }),
            signal: abortController.signal
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let fullText = '';
        
        while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            
            const chunk = decoder.decode(value, { stream: true });
            fullText += chunk;
            
            // Process lines that end with \n\n
            const lines = fullText.split('\n\n');
            fullText = lines[lines.length - 1]; // Keep incomplete line
            
            for (let i = 0; i < lines.length - 1; i++) {
                const line = lines[i].trim();
                if (line.startsWith('data: ')) {
                    try {
                        const eventText = line.substring(6); // Remove 'data: '
                        const data = JSON.parse(eventText);
                        console.log('Event received:', data);
                        
                        if (data.type === 'agent_message') {
                            // show spinner + streaming text from agent_message
                            showProcessing(botMessageId, data.content || '<đang xử lý>...');
                            console.log('Agent intermediate:', data.content);
                        } else if (data.type === 'final_response') {
                            const responseData = JSON.parse(data.content);
                            const finalResponse = responseData.response;
                            const recommendedQuestions = responseData.recommend_next_questions || [];
                            
                            // Check if response contains HTML table markup
                            const isHtml = /(<\/?(table|tr|td|th|tbody|thead|tfoot)\b)/i.test(finalResponse);
                            
                            // Stream the final response content
                            await streamResponseContent(botMessageId, finalResponse, isHtml);

                            if (recommendedQuestions.length > 0) {
                                displaySuggestedQuestions(recommendedQuestions);
                            }
                        }
                    } catch (e) {
                        console.error('Error parsing event:', e);
                    }
                }
            }
        }
        
        // Process any remaining data
        if (fullText.trim()) {
            const line = fullText.trim();
            if (line.startsWith('data: ')) {
                try {
                    const eventText = line.substring(6);
                    const data = JSON.parse(eventText);
                    
                    if (data.type === 'final_response') {
                        const responseData = JSON.parse(data.content);
                        const finalResponse = responseData.response;
                        const recommendedQuestions = responseData.recommend_next_questions || [];

                        const isHtml = /(<\/?(table|tr|td|th|tbody|thead|tfoot)\b)/i.test(finalResponse);
                        await streamResponseContent(botMessageId, finalResponse, isHtml);

                        if (recommendedQuestions.length > 0) {
                            displaySuggestedQuestions(recommendedQuestions);
                        }
                    }
                } catch (e) {
                    console.error('Error parsing final event:', e);
                }
            }
        }
        
    } catch (error) {
        console.error('Error:', error);
        // Stop timer on error
        stopTimer(botMessageId);
        if (error.name === 'AbortError') {
            updateMessage(botMessageId, 'Đã dừng xử lý.');
        } else {
            updateMessage(botMessageId, 'Lỗi: ' + error.message);
        }
        setSendMode();
    } finally {
        // Stop timer on completion
        stopTimer(botMessageId);
        setSendMode();
    }
}

// Add message to chat
function addMessage(text, sender) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${sender}`;
    const messageId = `msg_${Date.now()}_${Math.random()}`;
    messageDiv.id = messageId;
    messageDiv.innerHTML = `<p>${escapeHtml(text)}</p>`;
    messagesContainer.appendChild(messageDiv);
    
    // Scroll to bottom
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
    
    return messageId;
}

// Update existing message
function updateMessage(messageId, text) {
    const messageDiv = document.getElementById(messageId);
    if (messageDiv) {
        const pElement = messageDiv.querySelector('p');
        if (pElement) {
            pElement.textContent = text;
        }
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }
}

// Show processing UI for intermediate agent messages (spinner + text)
// Show processing UI for intermediate agent messages (spinner + dynamic text)
function showProcessing(messageId, text) {
    const messageDiv = document.getElementById(messageId);
    if (messageDiv) {
        const pElement = messageDiv.querySelector('p');
        if (pElement) {
            const safeText = escapeHtml(text || '<đang xử lý>...');
            pElement.innerHTML = '<span class="spinner"></span><span class="processing-text">' + safeText + '</span>';
        }
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }
}

// Stream final response content line by line (for text) or append for HTML
async function streamResponseContent(messageId, content, isHtml) {
    const messageDiv = document.getElementById(messageId);
    if (!messageDiv) return;
    
    // Remove processing class to show background
    messageDiv.classList.remove('processing');
    
    const pElement = messageDiv.querySelector('p');
    if (!pElement) return;
    
    if (isHtml) {
        // For HTML (tables), render it all at once but with a small delay for smoothness
        await new Promise(resolve => setTimeout(resolve, 50));
        pElement.innerHTML = sanitizeHtml(content);
    } else {
        // For text, stream line by line
        pElement.innerHTML = '';
        const lines = content.split('\n');
        
        for (let i = 0; i < lines.length; i++) {
            await new Promise(resolve => setTimeout(resolve, 30)); // 30ms delay per line
            const line = escapeHtml(lines[i]);
            if (i > 0) pElement.innerHTML += '<br>';
            pElement.innerHTML += line;
            messagesContainer.scrollTop = messagesContainer.scrollHeight;
        }
    }
    
    // Move suggested questions to bottom of messages container
    if (suggestedQuestionsContainer && messagesContainer) {
        messagesContainer.appendChild(suggestedQuestionsContainer);
    }
    
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

// Display suggested questions
function displaySuggestedQuestions(questions) {
    suggestedQuestionsContainer.innerHTML = '';
    
    if (questions.length === 0) return;
    
    const title = document.createElement('div');
    title.className = 'suggested-title';
    title.textContent = 'Câu hỏi gợi ý:';
    suggestedQuestionsContainer.appendChild(title);
    
    questions.forEach(question => {
        const btn = document.createElement('button');
        btn.className = 'suggested-btn';
        btn.textContent = question;
        btn.onclick = () => {
            messageInput.value = question;
            messageInput.focus();
            // Auto-send when a suggested question is clicked
            sendMessage();
        };
        suggestedQuestionsContainer.appendChild(btn);
    });

    // Ensure the last message in messages container is visible above the suggestions
    try {
        const lastMsg = messagesContainer.lastElementChild;
        if (lastMsg) lastMsg.scrollIntoView({ behavior: 'smooth', block: 'end' });
    } catch (e) {
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }
}

// Clear suggested questions
function clearSuggestedQuestions() {
    suggestedQuestionsContainer.innerHTML = '';
}

// Escape HTML to prevent XSS
function escapeHtml(text) {
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    };
    return text.replace(/[&<>"']/g, m => map[m]);
}

// Basic HTML sanitizer (whitelist common table tags, strip scripts and event handlers)
function sanitizeHtml(html) {
    if (!html) return '';
    // Remove <script>...</script>
    let s = html.replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, '');
    // Strip event handler attributes like onclick, onerror
    s = s.replace(/\son\w+\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)/gi, '');
    // Neutralize javascript: URLs in href/src
    s = s.replace(/(href|src)\s*=\s*"javascript:[^\"]*"/gi, '$1="#"');
    s = s.replace(/(href|src)\s*=\s*'javascript:[^']*'/gi, "$1='#'");
    // Allow only a small set of tags (table-related and basic formatting)
    s = s.replace(/<(?!\/?(table|thead|tbody|tfoot|tr|td|th|p|br|strong|em|ul|ol|li|a|div|span)\b)[^>]+>/gi, '');
    return s;
}

function updateMessageHtml(messageId, html) {
    const messageDiv = document.getElementById(messageId);
    if (messageDiv) {
        const pElement = messageDiv.querySelector('p');
        if (pElement) {
            pElement.innerHTML = sanitizeHtml(html);
        }
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }
}

// Event listeners
console.log('Setting up event listeners...');
console.log('sendBtn:', sendBtn);
console.log('messageInput:', messageInput);
console.log('closeBtn:', closeBtn);

sendBtn.addEventListener('click', (e) => {
    console.log('Send button clicked');
    e.preventDefault();
    sendMessage();
});

messageInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        console.log('Enter key pressed');
        e.preventDefault();
        sendMessage();
    }
});

// Auto-resize textarea height based on content
messageInput.addEventListener('input', () => {
    messageInput.style.height = 'auto';
    const scrollHeight = messageInput.scrollHeight;
    messageInput.style.height = Math.min(scrollHeight, 120) + 'px';
});

closeBtn.addEventListener('click', () => {
    console.log('Close button clicked');
    // hide chat and show launcher
    hideChat();
});

// Initialize on load
window.addEventListener('load', () => {
    console.log('Window loaded, UI ready');
    // initial state: show launcher, hide chat widget
    const widget = document.getElementById('chat-widget');
    if (widget) widget.classList.remove('open');
    if (launcherBtn) launcherBtn.style.display = 'flex';
    if (headerIcon) headerIcon.style.display = 'none';
    // launcher opens the chat
    if (launcherBtn) launcherBtn.addEventListener('click', () => {
        showChat();
    });
    if (headerIcon) headerIcon.addEventListener('click', () => {
        // header icon can focus input
        messageInput.focus();
    });
});

console.log('Chat Widget script loaded. API URL: ' + API_BASE_URL);
