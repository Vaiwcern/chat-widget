/**
 * AI HRM Chat Widget - Embeddable Version
 * Auto-injects CSS and creates chat widget on any page
 */
(function() {
    'use strict';

    // Prevent multiple instantiations
    if (window.AIHRMWidget) {
        console.warn('AI HRM Widget already initialized');
        return;
    }

    // Configuration
    const DEFAULT_CONFIG = {
        apiBaseUrl: 'https://aiagent-9816974896.asia-southeast1.run.app',
        title: 'AI HRM',
        placeholder: 'Nhập tin nhắn...',
        launcherIcon: null  // Will use default
    };

    // Widget instance
    window.AIHRMWidget = {
        config: { ...DEFAULT_CONFIG },
        
        init: function(options = {}) {
            // Merge config
            this.config = { ...DEFAULT_CONFIG, ...options };
            
            // Inject CSS
            this.injectStyles();
            
            // Create widget DOM
            this.createWidget();
            
            // Initialize chat logic
            this.initializeChat();
            
            console.log('AI HRM Widget initialized');
        },

        injectStyles: function() {
            if (document.getElementById('ai-hrm-styles')) return;
            
            const link = document.createElement('link');
            link.id = 'ai-hrm-styles';
            link.rel = 'stylesheet';
            link.href = this.getAssetUrl('widget.css');
            document.head.appendChild(link);
        },

        getAssetUrl: function(path) {
            // Get base URL - use data attribute if set, otherwise auto-detect
            const baseUrl = document.currentScript?.dataset.baseUrl || 
                           (document.querySelector('script[src*="embed.js"]')?.src.replace('/embed.js', '') || '.');
            return `${baseUrl}/${path}`;
        },

        createWidget: function() {
            // Check if widget container already exists
            let container = document.getElementById('ai-hrm-widget');
            if (container) {
                container.innerHTML = '';
            } else {
                container = document.createElement('div');
                container.id = 'ai-hrm-widget';
                document.body.appendChild(container);
            }

            container.innerHTML = `
                <div id="ai-hrm-chat" class="ai-hrm-chat ai-hrm-closed">
                    <div class="ai-hrm-header">
                        <div class="ai-hrm-header-title">
                            <span class="ai-hrm-icon">🤖</span>
                            <h3>${this.config.title}</h3>
                        </div>
                        <button class="ai-hrm-close" aria-label="Close">×</button>
                    </div>
                    <div class="ai-hrm-messages" id="ai-hrm-messages">
                        <div class="ai-hrm-message ai-hrm-bot">
                            <p>Chào bạn! Tôi là một trợ lý AI được phát triển bởi Đội ngũ AI tại AlphaNDT. Bạn có câu hỏi nào liên quan đến Nhân sự không?</p>
                        </div>
                        <div class="ai-hrm-suggested" id="ai-hrm-suggested"></div>
                    </div>
                    <div class="ai-hrm-input-area">
                        <textarea class="ai-hrm-input" id="ai-hrm-input" placeholder="${this.config.placeholder}" rows="1"></textarea>
                        <button class="ai-hrm-send" id="ai-hrm-send" title="Gửi">
                            <svg class="ai-hrm-send-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <line x1="22" y1="2" x2="11" y2="13"></line>
                                <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
                            </svg>
                            <svg class="ai-hrm-stop-icon" width="20" height="20" viewBox="0 0 24 24" fill="currentColor" style="display:none">
                                <rect x="6" y="6" width="12" height="12" rx="2"></rect>
                            </svg>
                        </button>
                    </div>
                </div>
                <button class="ai-hrm-launcher" id="ai-hrm-launcher" title="Mở AI HRM">
                    <span class="ai-hrm-launcher-icon">💬</span>
                </button>
            `;

            // Add event listeners
            this.bindEvents();
        },

        bindEvents: function() {
            const self = this;
            const chatEl = document.getElementById('ai-hrm-chat');
            const launcher = document.getElementById('ai-hrm-launcher');
            const closeBtn = document.querySelector('.ai-hrm-close');
            const sendBtn = document.getElementById('ai-hrm-send');
            const input = document.getElementById('ai-hrm-input');

            // Toggle chat
            launcher?.addEventListener('click', () => self.toggleChat());
            closeBtn?.addEventListener('click', () => self.toggleChat());

            // Send message
            sendBtn?.addEventListener('click', () => self.sendMessage());
            input?.addEventListener('keypress', (e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    self.sendMessage();
                }
            });

            // Auto-resize textarea
            input?.addEventListener('input', () => {
                input.style.height = 'auto';
                const scrollHeight = input.scrollHeight;
                input.style.height = Math.min(scrollHeight, 120) + 'px';
            });
        },

        toggleChat: function() {
            const chatEl = document.getElementById('ai-hrm-chat');
            const launcher = document.getElementById('ai-hrm-launcher');
            
            if (chatEl.classList.contains('ai-hrm-closed')) {
                chatEl.classList.remove('ai-hrm-closed');
                launcher.style.display = 'none';
                // Initialize session on first open
                if (!this.sessionId) {
                    this.initializeSession();
                }
            } else {
                chatEl.classList.add('ai-hrm-closed');
                launcher.style.display = 'flex';
            }
        },

        initializeSession: async function() {
            try {
                const userId = `user_${Date.now()}`;
                const response = await fetch(`${this.config.apiBaseUrl}/create_session`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ user_id: userId })
                });
                
                if (response.ok) {
                    const data = await response.json();
                    if (data.status === 'success') {
                        this.sessionId = data.data.session_id;
                        this.userId = userId;
                    }
                }
            } catch (error) {
                console.error('Failed to initialize session:', error);
            }
        },

        sendMessage: async function() {
            const input = document.getElementById('ai-hrm-input');
            const message = input?.value.trim();
            
            if (!message || !this.sessionId) {
                if (!this.sessionId) {
                    this.addMessage('Chưa khởi tạo session. Vui lòng tải lại trang.', 'bot');
                }
                return;
            }

            // Add user message
            this.addMessage(message, 'user');
            input.value = '';
            input.style.height = 'auto';

            // Add bot loading message
            const botMessageId = this.addMessage('Đang xử lý...', 'bot', true);

            // Update button to stop mode
            this.setStopMode(true);

            try {
                const response = await fetch(`${this.config.apiBaseUrl}/chat/stream`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        user_id: this.userId,
                        session_id: this.sessionId,
                        message: message
                    })
                });

                if (!response.ok) throw new Error(`HTTP ${response.status}`);

                const reader = response.body.getReader();
                const decoder = new TextDecoder();
                let fullText = '';

                while (true) {
                    const { done, value } = await reader.read();
                    if (done) break;
                    
                    const chunk = decoder.decode(value, { stream: true });
                    fullText += chunk;
                    
                    const lines = fullText.split('\n\n');
                    fullText = lines[lines.length - 1];
                    
                    for (let i = 0; i < lines.length - 1; i++) {
                        const line = lines[i].trim();
                        if (line.startsWith('data: ')) {
                            try {
                                const eventText = line.substring(6);
                                const data = JSON.parse(eventText);
                                
                                if (data.type === 'final_response') {
                                    const responseData = JSON.parse(data.content);
                                    const finalResponse = responseData.response;
                                    const questions = responseData.recommend_next_questions || [];
                                    
                                    this.updateMessage(botMessageId, finalResponse);
                                    
                                    if (questions.length > 0) {
                                        this.displaySuggestedQuestions(questions);
                                    }
                                }
                            } catch (e) {
                                console.error('Parse error:', e);
                            }
                        }
                    }
                }
            } catch (error) {
                this.updateMessage(botMessageId, 'Lỗi: ' + error.message);
            } finally {
                this.setStopMode(false);
            }
        },

        addMessage: function(text, sender, isLoading = false) {
            const container = document.getElementById('ai-hrm-messages');
            const suggested = document.getElementById('ai-hrm-suggested');
            
            const msgDiv = document.createElement('div');
            msgDiv.className = `ai-hrm-message ai-hrm-${sender}`;
            if (isLoading) msgDiv.classList.add('ai-hrm-loading');
            
            const msgId = `msg_${Date.now()}_${Math.random()}`;
            msgDiv.id = msgId;
            msgDiv.innerHTML = `<p>${this.escapeHtml(text)}</p>`;
            
            container.insertBefore(msgDiv, suggested);
            this.scrollToBottom();
            
            return msgId;
        },

        updateMessage: function(messageId, html) {
            const msgDiv = document.getElementById(messageId);
            if (msgDiv) {
                msgDiv.classList.remove('ai-hrm-loading');
                const p = msgDiv.querySelector('p');
                if (p) {
                    p.innerHTML = this.sanitizeHtml(html);
                }
                this.scrollToBottom();
            }
        },

        displaySuggestedQuestions: function(questions) {
            const container = document.getElementById('ai-hrm-suggested');
            container.innerHTML = '<div class="ai-hrm-suggested-title">Câu hỏi gợi ý:</div>';
            
            questions.forEach(q => {
                const btn = document.createElement('button');
                btn.className = 'ai-hrm-suggested-btn';
                btn.textContent = q;
                btn.onclick = () => {
                    document.getElementById('ai-hrm-input').value = q;
                    this.sendMessage();
                };
                container.appendChild(btn);
            });
            
            this.scrollToBottom();
        },

        setStopMode: function(isProcessing) {
            const sendBtn = document.getElementById('ai-hrm-send');
            const input = document.getElementById('ai-hrm-input');
            const sendIcon = sendBtn?.querySelector('.ai-hrm-send-icon');
            const stopIcon = sendBtn?.querySelector('.ai-hrm-stop-icon');
            
            if (sendIcon && stopIcon) {
                if (isProcessing) {
                    sendIcon.style.display = 'none';
                    stopIcon.style.display = 'inline-block';
                    sendBtn.classList.add('ai-hrm-processing');
                    input.disabled = true;
                } else {
                    sendIcon.style.display = 'inline-block';
                    stopIcon.style.display = 'none';
                    sendBtn.classList.remove('ai-hrm-processing');
                    input.disabled = false;
                }
            }
        },

        scrollToBottom: function() {
            const container = document.getElementById('ai-hrm-messages');
            if (container) container.scrollTop = container.scrollHeight;
        },

        escapeHtml: function(text) {
            const map = { '&': '&amp;', '<': '<', '>': '>', '"': '"', "'": '&#039;' };
            return text.replace(/[&<>"']/g, m => map[m]);
        },

        sanitizeHtml: function(html) {
            if (!html) return '';
            let s = html.replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, '');
            s = s.replace(/\son\w+\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)/gi, '');
            return s;
        },

        initializeChat: function() {
            // Placeholder for any additional initialization
        }
    };

    // Auto-initialize if data-init attribute is present
    if (document.currentScript?.dataset.autoInit !== 'false') {
        window.AIHRMWidget.init();
    }

})();

