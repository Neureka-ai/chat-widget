// Chat Widget for CorrectMe - German Learning Assistant
(function() {
    'use strict';

    // Add widget styles
    const widgetStyles = document.createElement('style');
    widgetStyles.textContent = `
        :root {
            --chat-color-primary-pink: #f06292;
            --chat-color-secondary-pink: #f8bbd0;
            --chat-color-text-dark: #374151;
            --chat-color-text-light: #6b7280;
            --chat-color-background-light: #f9fafb;
            --chat-color-background-user: #fffbeb;
            --chat-color-background-bot: #fce7f3;
            --chat-color-border: #e5e7eb;
            --chat-radius-sm: 8px;
            --chat-radius-md: 12px;
            --chat-radius-lg: 16px;
            --chat-radius-full: 9999px;
            --chat-transition: all 0.2s ease-in-out;
            --chat-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
            --chat-shadow-hover: 0 6px 16px rgba(0, 0, 0, 0.12);
        }

        .chat-assist-widget * {
            box-sizing: border-box;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
        }

        .chat-assist-widget .chat-window {
            position: fixed;
            bottom: 100px;
            right: 20px;
            width: 380px;
            height: 600px;
            background: white;
            border-radius: var(--chat-radius-lg);
            box-shadow: var(--chat-shadow);
            display: none;
            flex-direction: column;
            overflow: hidden;
            z-index: 10000;
            border: 1px solid var(--chat-color-border);
        }

        .chat-assist-widget .chat-window.active {
            display: flex;
        }

        .chat-assist-widget .chat-header {
            padding: 12px 16px;
            display: flex;
            align-items: center;
            gap: 10px;
            background: #ffffff; /* HEADER BRANCO */
            color: var(--chat-color-text-dark);
            position: relative;
            flex-shrink: 0;
            border-bottom: 1px solid var(--chat-color-border);
        }

        .chat-assist-widget .chat-header-logo {
            height: 40px; /* Altura ajustada para o novo logo */
            width: auto;
            object-fit: contain;
        }

        .chat-assist-widget .chat-header-title {
            font-size: 16px;
            font-weight: 600;
            color: var(--chat-color-text-dark);
        }

        .chat-assist-widget .chat-close-btn {
            position: absolute;
            right: 12px;
            top: 50%;
            transform: translateY(-50%);
            background: transparent;
            border: none;
            color: var(--chat-color-text-light);
            cursor: pointer;
            padding: 4px;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: var(--chat-transition);
            border-radius: var(--chat-radius-full);
            width: 32px;
            height: 32px;
        }

        .chat-assist-widget .chat-close-btn:hover {
            background: #f3f4f6;
            color: var(--chat-color-text-dark);
        }

        .chat-assist-widget .chat-body {
            display: flex;
            flex-direction: column;
            height: 100%;
            overflow: hidden;
        }
        
        .chat-assist-widget .chat-messages {
            flex: 1;
            overflow-y: auto;
            padding: 16px;
            background: var(--chat-color-background-light);
            display: flex;
            flex-direction: column;
            gap: 16px;
        }

        .chat-assist-widget .message-container {
            display: flex;
            gap: 10px;
            align-items: flex-end;
            max-width: 85%;
        }

        .chat-assist-widget .message-container.user-message {
            flex-direction: row-reverse;
            align-self: flex-end;
        }

        .chat-assist-widget .message-icon {
            width: 32px;
            height: 32px;
            border-radius: var(--chat-radius-full);
            object-fit: cover;
            flex-shrink: 0;
            border: 2px solid var(--chat-color-border);
        }

        .chat-assist-widget .message-content {
            display: flex;
            flex-direction: column;
        }

        .chat-assist-widget .user-message .message-content {
            align-items: flex-end;
        }

        .chat-assist-widget .chat-bubble {
            padding: 10px 14px;
            border-radius: var(--chat-radius-md);
            max-width: 100%;
            word-wrap: break-word;
            line-height: 1.5;
            font-size: 14px;
            position: relative;
        }

        /* CAUDAS DAS BOLHAS DE CHAT */
        .chat-assist-widget .chat-bubble::after {
            content: '';
            position: absolute;
            bottom: 0;
            width: 0;
            height: 0;
            border: 10px solid transparent;
        }

        .chat-assist-widget .bot-bubble {
            background: var(--chat-color-background-bot);
            color: var(--chat-color-text-dark);
            border-radius: 0 var(--chat-radius-md) var(--chat-radius-md) var(--chat-radius-md);
        }

        .chat-assist-widget .user-bubble {
            background: var(--chat-color-background-user);
            color: var(--chat-color-text-dark);
            border-radius: var(--chat-radius-md) 0 var(--chat-radius-md) var(--chat-radius-md);
        }

        .chat-assist-widget .timestamp {
            font-size: 11px;
            color: var(--chat-color-text-light);
            margin-top: 6px;
            padding: 0 4px;
        }

        .chat-assist-widget .chat-controls {
            padding: 12px 16px;
            background: white;
            border-top: 1px solid var(--chat-color-border);
            display: flex;
            gap: 10px;
            align-items: center;
        }

        .chat-assist-widget .chat-input-area {
            flex: 1;
            display: flex;
            align-items: center;
            background: #f3f4f6;
            border-radius: var(--chat-radius-full);
            padding: 4px;
            border: 1px solid transparent;
            transition: var(--chat-transition);
        }
        
        .chat-assist-widget .chat-input-area:focus-within {
             border-color: var(--chat-color-secondary-pink);
             background: white;
        }

        .chat-assist-widget .chat-textarea {
            flex: 1;
            border: none;
            background: transparent;
            padding: 8px 12px;
            resize: none;
            font-family: inherit;
            font-size: 14px;
            line-height: 1.4;
            max-height: 100px;
            min-height: 24px;
            outline: none;
        }

        .chat-assist-widget .control-btn {
            width: 36px;
            height: 36px;
            background: transparent;
            border: none;
            border-radius: var(--chat-radius-full);
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            color: var(--chat-color-text-light);
            transition: var(--chat-transition);
            flex-shrink: 0;
        }

        .chat-assist-widget .control-btn:hover {
            color: var(--chat-color-text-dark);
            background: #e5e7eb;
        }

        .chat-assist-widget .chat-submit {
            background: var(--chat-color-primary-pink);
            color: white;
        }
        
        .chat-assist-widget .chat-submit:hover {
             background: #ec407a;
             color: white;
        }

        .chat-assist-widget .chat-submit:disabled {
            opacity: 0.5;
            cursor: not-allowed;
            background: #e5e7eb;
        }

        .chat-assist-widget .control-btn svg {
            width: 20px;
            height: 20px;
        }

        .chat-assist-widget .file-upload-input {
            display: none;
        }

        .chat-assist-widget .chat-launcher {
            position: fixed;
            bottom: 20px;
            right: 20px;
            width: 60px;
            height: 60px;
            background: linear-gradient(135deg, var(--chat-color-primary-pink), #ec407a);
            border: none;
            border-radius: var(--chat-radius-full);
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            box-shadow: var(--chat-shadow);
            transition: var(--chat-transition);
            z-index: 9999;
        }

        .chat-assist-widget .chat-launcher:hover {
            transform: translateY(-2px) scale(1.05);
            box-shadow: var(--chat-shadow-hover);
        }

        .chat-assist-widget .chat-launcher svg {
            width: 32px;
            height: 32px;
        }

        .chat-assist-widget .action-buttons-container {
            display: flex;
            flex-direction: column;
            gap: 8px;
            margin-top: 12px;
        }

        .chat-assist-widget .action-button {
            background: linear-gradient(135deg, var(--chat-color-secondary-pink), var(--chat-color-primary-pink));
            color: white;
            border: none;
            padding: 12px 16px;
            border-radius: var(--chat-radius-md);
            cursor: pointer;
            font-weight: 600;
            transition: var(--chat-transition);
            text-align: center;
        }

        .chat-assist-widget .action-button:hover {
            transform: translateY(-1px);
            box-shadow: 0 4px 12px rgba(240, 98, 146, 0.3);
        }

        .chat-assist-widget .dynamic-buttons-container {
            display: flex;
            flex-wrap: wrap;
            gap: 8px;
            margin-top: 12px;
        }

        .chat-assist-widget .dynamic-button {
            background: #ffffff;
            color: var(--chat-color-text-dark);
            border: 1px solid var(--chat-color-border);
            padding: 8px 12px;
            border-radius: var(--chat-radius-full);
            cursor: pointer;
            font-size: 13px;
            transition: var(--chat-transition);
        }

        .chat-assist-widget .dynamic-button:hover {
            background: var(--chat-color-secondary-pink);
            color: var(--chat-color-text-dark);
            border-color: var(--chat-color-primary-pink);
            transform: translateY(-2px);
            box-shadow: 0 2px 8px rgba(240, 98, 146, 0.2);
        }
    `;
    document.head.appendChild(widgetStyles);

    // Default configuration
    const defaultSettings = {
        webhook: { url: '', route: '' },
        branding: {
            logo: 'https://neureka-ai.com/wp-content/uploads/2025/08/LogoPretofundotransparente.png', // NOVO LOGO
            name: 'CorrectMe',
            welcomeText: 'Hallo! Wie kann ich dir heute helfen?',
            responseTimeText: 'Antwortet in wenigen Sekunden',
            poweredBy: { text: 'Powered by My Clever Bot', link: '#' }
        },
        style: {},
        suggestedQuestions: []
    };

    // Merge user settings with defaults
    const settings = window.ChatWidgetConfig ? {
        ...defaultSettings,
        ...window.ChatWidgetConfig,
        branding: { ...defaultSettings.branding, ...window.ChatWidgetConfig.branding },
    } : defaultSettings;

    // Session tracking
    let conversationId = '';
    let isWaitingForResponse = false;
    let isChatInitialized = false;

    // Create widget DOM structure
    const widgetRoot = document.createElement('div');
    widgetRoot.className = 'chat-assist-widget';
    
    const chatWindow = document.createElement('div');
    chatWindow.className = `chat-window`;
    
    // ÍCONES SVG MODERNOS
    const icons = {
        close: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>',
        launcher: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m3 21 1.65-3.8a9 9 0 1 1 3.4 2.9l-5.05.9"></path><path d="m9 10 2 2 4-4"></path></svg>',
        attachment: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m21.44 11.05-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"></path></svg>',
        send: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>'
    };
    
    const headerHTML = `
        <div class="chat-header">
            <img class="chat-header-logo" src="${settings.branding.logo}" alt="${settings.branding.name}">
            <span class="chat-header-title">${settings.branding.name}</span>
            <button class="chat-close-btn">${icons.close}</button>
        </div>
    `;

    const chatInterfaceHTML = `
        <div class="chat-body">
            <div class="chat-messages"></div>
            <div class="chat-controls">
                <div class="chat-input-area">
                    <label for="chat-file-upload" class="control-btn file-upload-label">
                        ${icons.attachment}
                    </label>
                    <input type="file" id="chat-file-upload" class="file-upload-input">
                    <textarea class="chat-textarea" placeholder="Digite sua mensagem..." rows="1"></textarea>
                </div>
                <button class="control-btn chat-submit">${icons.send}</button>
            </div>
        </div>
    `;
    
    chatWindow.innerHTML = headerHTML + chatInterfaceHTML;
    
    const launchButton = document.createElement('button');
    launchButton.className = `chat-launcher`;
    launchButton.innerHTML = icons.launcher;
    
    widgetRoot.appendChild(chatWindow);
    widgetRoot.appendChild(launchButton);
    document.body.appendChild(widgetRoot);

    // Get DOM elements
    const messagesContainer = widgetRoot.querySelector('.chat-messages');
    const messageTextarea = widgetRoot.querySelector('.chat-textarea');
    const sendButton = widgetRoot.querySelector('.chat-submit');
    const fileInput = widgetRoot.querySelector('#chat-file-upload');

    // Helper to generate a unique session ID
    const createSessionId = () => crypto.randomUUID();

    // Main function to start the chat
    const startChat = () => {
        if (isChatInitialized) return;
        isChatInitialized = true;
        conversationId = createSessionId();
        
        const welcomeMessage = document.createElement('div');
        welcomeMessage.className = 'message-container bot-message';
        welcomeMessage.innerHTML = `
            <img src="https://cdn-icons-png.flaticon.com/512/4140/4140047.png" class="message-icon" alt="CorrectMe Assistant">
            <div class="message-content">
                <div class="chat-bubble bot-bubble">
                    <p>Hallo! 😊 Ich bin dein deutscher Sprachassistent! / Olá! Sou seu assistente de alemão!<br><br>
                    Was möchtest du lernen? / O que você quer aprender?</p>
                    <div class="action-buttons-container">
                        <button class="action-button" data-action="Dúvidas">Estudar Gramática 📚</button>
                        <button class="action-button" data-action="Treinar escrita">Treinar Conversação 💬</button>
                    </div>
                </div>
                <span class="timestamp">${new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</span>
            </div>
        `;
        messagesContainer.appendChild(welcomeMessage);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;

        welcomeMessage.querySelectorAll('.action-button').forEach(button => {
            button.addEventListener('click', () => {
                const action = button.dataset.action;
                if (action === 'Dúvidas') {
                    submitMessage('Quero estudar gramática', false, 'gramaticaflow'); 
                    showGrammarTopics(); 
                } else if (action === 'Treinar escrita') {
                    submitMessage('Quero treinar conversação', false, 'treinoflow'); 
                    showConversationTopics();
                }
            });
        });
    };
    
    const addMessageToUI = (text, sender) => {
        const messageContainer = document.createElement('div');
        messageContainer.className = `message-container ${sender}-message`;

        const iconUrl = sender === 'user' 
            ? "https://cdn-icons-png.flaticon.com/512/4140/4140051.png"
            : "https://cdn-icons-png.flaticon.com/512/4140/4140047.png";
        
        const bubbleClass = sender === 'user' ? 'user-bubble' : 'bot-bubble';

        messageContainer.innerHTML = `
            <img src="${iconUrl}" class="message-icon" alt="${sender} icon">
            <div class="message-content">
                <div class="chat-bubble ${bubbleClass}">
                    <p>${text}</p>
                </div>
                <span class="timestamp">${new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</span>
            </div>
        `;
        messagesContainer.appendChild(messageContainer);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    };

    const showGrammarTopics = () => {
        const grammarTopics = [
            "O Alfabeto (ä, ö, ü, ß)", "Gênero (Genus)", "Declinação de Substantivos", "Verbos", "Preposições", "Pronomes Pessoais", "Conjugação de Verbos", "Verbos 'haben' e 'sein'"
        ];

        const botFollowUpContainer = document.createElement('div');
        botFollowUpContainer.className = 'message-container bot-message';
        
        let buttonsHTML = grammarTopics.map(topic => `<button class="dynamic-button" data-topic="${topic}">${topic}</button>`).join('');

        botFollowUpContainer.innerHTML = `
            <img src="https://cdn-icons-png.flaticon.com/512/4140/4140047.png" class="message-icon" alt="CorrectMe Assistant">
            <div class="message-content">
                <div class="chat-bubble bot-bubble">
                    <p>Ótimo! Escolha um tópico gramatical para começar:</p>
                    <div class="dynamic-buttons-container">${buttonsHTML}</div>
                </div>
                <span class="timestamp">${new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</span>
            </div>
        `;
        messagesContainer.appendChild(botFollowUpContainer);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;

        botFollowUpContainer.querySelectorAll('.dynamic-button').forEach(btn => {
            btn.addEventListener('click', () => {
                submitMessage(btn.dataset.topic, false, 'gramaticaflow');
            });
        });
    };

    const showConversationTopics = () => {
        const conversationTopics = [
           "Apresentações", "Família", "Hobbies", "Comidas e Bebidas", "Viagens", "Trabalho", "Clima", "Rotina diária"
        ];

        const botFollowUpContainer = document.createElement('div');
        botFollowUpContainer.className = 'message-container bot-message';

        let buttonsHTML = conversationTopics.map(topic => `<button class="dynamic-button" data-topic="${topic}">${topic}</button>`).join('');

        botFollowUpContainer.innerHTML = `
            <img src="https://cdn-icons-png.flaticon.com/512/4140/4140047.png" class="message-icon" alt="CorrectMe Assistant">
            <div class="message-content">
                <div class="chat-bubble bot-bubble">
                    <p>Perfeito! Sobre qual tópico gostaria de conversar?</p>
                    <div class="dynamic-buttons-container">${buttonsHTML}</div>
                </div>
                <span class="timestamp">${new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</span>
            </div>
        `;
        messagesContainer.appendChild(botFollowUpContainer);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;

        botFollowUpContainer.querySelectorAll('.dynamic-button').forEach(btn => {
            btn.addEventListener('click', () => {
                submitMessage(btn.dataset.topic, false, 'treinoflow');
            });
        });
    };
    
    const sendToN8nWorkflow = async (messageText, workflowType) => {
        // Mock response for demonstration
        console.log(`Sending to ${workflowType}:`, messageText);
        
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 1000));

        let botResponse = "Desculpe, não entendi. Poderia repetir?";
        if (workflowType === 'gramaticaflow') {
            botResponse = `Claro! Vamos falar sobre **${messageText}**. O que especificamente gostaria de saber?`;
        } else if (workflowType === 'treinoflow') {
            botResponse = `Ok, vamos praticar conversação sobre **${messageText}**. Pode começar com uma frase.`;
        }
        
        return { output: botResponse };
    };


    const submitMessage = async (messageText, isAction = false, workflow = 'default') => {
        const text = (messageText || messageTextarea.value).trim();
        if (!text || isWaitingForResponse) return;

        if (!isAction) {
            addMessageToUI(text, 'user');
        }
        
        messageTextarea.value = '';
        resizeTextarea();
        isWaitingForResponse = true;
        sendButton.disabled = true;

        try {
            const responseData = await sendToN8nWorkflow(text, workflow);
            if (responseData && responseData.output) {
                addMessageToUI(responseData.output, 'bot');
            }
        } catch (error) {
            console.error('Chat Widget Error:', error);
            addMessageToUI("Desculpe, ocorreu um erro. Tente novamente.", 'bot');
        } finally {
            isWaitingForResponse = false;
            sendButton.disabled = false;
        }
    };

    // Event listeners
    launchButton.addEventListener('click', () => {
        chatWindow.classList.toggle('active');
        if (!isChatInitialized) {
            startChat();
        }
    });

    widgetRoot.querySelector('.chat-close-btn').addEventListener('click', () => {
        chatWindow.classList.remove('active');
    });

    messageTextarea.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            submitMessage();
        }
    });

    const resizeTextarea = () => {
        messageTextarea.style.height = 'auto';
        messageTextarea.style.height = `${messageTextarea.scrollHeight}px`;
    };

    messageTextarea.addEventListener('input', resizeTextarea);

    sendButton.addEventListener('click', () => submitMessage());

})();
