document.addEventListener('DOMContentLoaded', () => {
    const chatToggle = document.querySelector('.chat-toggle');
    const closeBtn = document.querySelector('.close-btn');
    const chatWidgetContainer = document.querySelector('.chat-widget-container');
    const sendBtn = document.getElementById('send-btn');
    const chatInput = document.getElementById('chat-input');
    const chatMessages = document.querySelector('.chat-messages');
    let sessionId = null;
    let userId = null;

    // --- Toggle Chat Widget ---
    chatToggle.addEventListener('click', () => {
        toggleChatWidget();
    });

    closeBtn.addEventListener('click', () => {
        toggleChatWidget();
    });

    function toggleChatWidget() {
        chatWidgetContainer.classList.toggle('hidden');
        if (!chatWidgetContainer.classList.contains('hidden')) {
            chatToggle.style.display = 'none';
            chatInput.focus();
            if (!sessionId) {
                createSession();
            }
        } else {
            chatToggle.style.display = 'flex';
        }
    }

    // --- Session Management ---
    async function createSession() {
        try {
            const response = await fetch('https://aiagent-9816974896.asia-southeast1.run.app/create_session', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ user_id: userId }),
            });

            if (!response.ok) {
                throw new Error('Failed to create session');
            }

            const data = await response.json();
            sessionId = data.data.session_id;
            console.log('Session created:', sessionId);
        } catch (error) {
            console.error('Error creating session:', error);
            addMessage("Sorry, I'm having trouble connecting. Please try again later.", 'bot');
        }
    }

    // --- Message Sending ---
    sendBtn.addEventListener('click', sendMessage);
    chatInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            sendMessage();
        }
    });

    async function sendMessage() {
        const messageText = chatInput.value.trim();
        if (messageText === '' || !sessionId) return;

        addMessage(messageText, 'user');
        chatInput.value = '';

        try {
            const response = await fetch('https://aiagent-9816974896.asia-southeast1.run.app/chat/stream', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    user_id: userId,
                    session_id: sessionId,
                    message: messageText,
                }),
            });

            if (!response.body) return;

            const reader = response.body.pipeThrough(new TextDecoderStream()).getReader();
            let buffer = '';

            while (true) {
                const { value, done } = await reader.read();
                if (done) {
                    const tempMessage = document.querySelector('.temp-message');
                    if (tempMessage) {
                        tempMessage.remove();
                    }
                    break;
                }

                buffer += value;

                let lines = buffer.split('\n');
                buffer = lines.pop(); 

                for (const line of lines) {
                    if (line.startsWith('data:')) {
                        const jsonString = line.substring(5).trim();
                        if (jsonString) {
                            try {
                                const data = JSON.parse(jsonString);
                                handleStreamData(data);
                            } catch (error) {
                                console.error('Error parsing stream data:', error);
                            }
                        }
                    }
                }
            }
        } catch (error) {
            console.error('Error during chat:', error);
            addMessage("Sorry, an error occurred. Please try again.", 'bot');
        }
    }

    // --- Stream Handling ---
    function handleStreamData(data) {
        console.log('Received data:', data);
        const tempMessage = document.querySelector('.temp-message');
        if (tempMessage) {
            tempMessage.remove();
        }

        if (data.type === 'notification') {
            addTemporaryMessage(data.content);
        } else if (data.type === 'display') {
            let content;
            if (data.format === 'html') {
                content = data.content;
            } else if (data.format === 'file') {
                content = `<a href="${data.content}" target="_blank">${data.content}</a>`;
            } else {
                if (typeof data.content === 'string') {
                    try {
                        // The content is a string representation of a JSON object, so we need to parse it.
                        // The string is using single quotes, so we need to replace them with double quotes.
                        const contentData = JSON.parse(data.content.replace(/'/g, '"'));
                        content = contentData.response;
                    } catch (error) {
                        console.error('Error parsing content data:', error);
                        content = data.content;
                    }
                } else {
                    content = data.content.response;
                }
            }
            addMessage(content, 'bot', data.format);
        }
    }

    // --- UI Updates ---
    function addMessage(text, sender, format = 'text') {
        const messageElement = document.createElement('div');
        messageElement.classList.add('message', sender);
        if (format === 'html') {
            messageElement.innerHTML = text;
        } else {
            messageElement.textContent = String(text);
        }
        chatMessages.appendChild(messageElement);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    function addTemporaryMessage(text) {
        const tempMessage = document.createElement('div');
        tempMessage.classList.add('message', 'bot', 'temp-message');
        tempMessage.textContent = text;
        chatMessages.appendChild(tempMessage);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    // --- Initialization ---
    function generateUserId() {
        return 'user-' + Math.random().toString(36).substring(2, 15);
    }

    chatWidgetContainer.classList.add('hidden');
    chatToggle.style.display = 'flex';
    userId = generateUserId();
});
