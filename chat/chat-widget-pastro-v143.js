// Interactive Chat Widget for n8n - Versão Corrigida e Otimizada
(function() {
    // Garante que o widget só é inicializado uma vez
    if (window.N8nChatWidgetLoaded) return;
    window.N8nChatWidgetLoaded = true;

    // Função principal que executa após o carregamento completo do DOM
    function initializeWidget() {
        // --- 1. CONFIGURAÇÕES E ESTILOS ---

        // Carrega a fonte Poppins para um visual moderno
        const fontElement = document.createElement('link');
        fontElement.rel = 'stylesheet';
        fontElement.href = 'https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap';
        document.head.appendChild(fontElement);

        // Aplica os estilos do widget
        const widgetStyles = document.createElement('style');
        widgetStyles.textContent = `
            :root {
                --chat-color-primary: var(--chat-widget-primary, #97B4BB);
                --chat-color-secondary: var(--chat-widget-secondary, #187874);
                --chat-color-surface: var(--chat-widget-surface, #ffffff);
                --chat-color-text: var(--chat-widget-text, #1f2937);
                --chat-color-text-light: var(--chat-widget-text-light, #6b7280);
                --chat-color-light: var(--chat-widget-light, #dff7d4);
                --chat-color-border: var(--chat-widget-border, #e5e7eb);
                --chat-widget-primarybubble: #3498db;
                --chat-widget-secondarybubble: #2980b9;
                --chat-shadow-sm: 0 1px 3px rgba(0, 0, 0, 0.05);
                --chat-shadow-md: 0 4px 6px rgba(0, 0, 0, 0.1);
                --chat-shadow-lg: 0 10px 15px rgba(0, 0, 0, 0.1);
                --chat-radius-sm: 8px;
                --chat-radius-md: 12px;
                --chat-radius-lg: 20px;
                --chat-radius-full: 9999px;
                --chat-transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            }

            .chat-assist-widget {
                font-family: 'Poppins', sans-serif;
            }

            .chat-assist-widget .chat-window {
                position: fixed;
                bottom: 90px;
                z-index: 1000;
                width: 380px;
                height: 730px;
                background: var(--chat-color-surface);
                border-radius: var(--chat-radius-lg);
                box-shadow: var(--chat-shadow-lg);
                border: 1px solid var(--chat-color-border);
                overflow: hidden;
                display: none;
                flex-direction: column;
                transition: var(--chat-transition);
                opacity: 0;
                transform: translateY(20px) scale(0.95);
            }

            .chat-assist-widget .chat-window.right-side { right: 20px; }
            .chat-assist-widget .chat-window.left-side { left: 20px; }

            .chat-assist-widget .chat-window.visible {
                display: flex;
                opacity: 1;
                transform: translateY(0) scale(1);
            }

            .chat-assist-widget .chat-header {
                padding: 16px;
                display: flex;
                align-items: center;
                gap: 12px;
                background: linear-gradient(135deg, var(--chat-color-primary) 0%, var(--chat-color-secondary) 100%);
                color: white;
                position: relative;
                flex-shrink: 0;
            }

            .chat-assist-widget .chat-header-logo {
                width: 128px;
                height: 64px;
                border-radius: var(--chat-radius-sm);
                object-fit: contain;
                background: white;
                padding: 2px;
            }

            .chat-assist-widget .chat-header-title { font-size: 16px; font-weight: 600; color: white; }

            .chat-assist-widget .chat-close-btn {
                position: absolute;
                right: 16px;
                top: 50%;
                transform: translateY(-50%);
                background: rgba(255, 255, 255, 0.2);
                border: none;
                color: white;
                cursor: pointer;
                display: flex;
                align-items: center;
                justify-content: center;
                transition: var(--chat-transition);
                font-size: 18px;
                border-radius: var(--chat-radius-full);
                width: 28px;
                height: 28px;
            }

            .chat-assist-widget .chat-close-btn:hover {
                background: rgba(255, 255, 255, 0.3);
                transform: translateY(-50%) scale(1.1);
            }

            .chat-assist-widget .chat-welcome {
                position: absolute;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                padding: 24px;
                text-align: center;
                width: 100%;
                max-width: 320px;
            }

            .chat-assist-widget .chat-welcome-title { font-size: 14px; font-weight: 700; color: var(--chat-color-text); margin-bottom: 24px; line-height: 1.3; }

            .chat-assist-widget .chat-start-btn {
                display: flex;
                align-items: center;
                justify-content: center;
                gap: 10px;
                width: 100%;
                padding: 14px 20px;
                background: linear-gradient(135deg, var(--chat-color-primary) 0%, var(--chat-color-secondary) 100%);
                color: white;
                border: none;
                border-radius: var(--chat-radius-md);
                cursor: pointer;
                font-size: 15px;
                transition: var(--chat-transition);
                font-weight: 600;
                font-family: inherit;
                margin-bottom: 16px;
                box-shadow: var(--chat-shadow-md);
            }

            .chat-assist-widget .chat-start-btn:hover { transform: translateY(-2px); box-shadow: var(--chat-shadow-lg); }
            .chat-assist-widget .chat-response-time { font-size: 14px; color: var(--chat-color-text-light); margin: 0; }

            .chat-assist-widget .chat-body { display: none; flex-direction: column; height: 100%; }
            .chat-assist-widget .chat-body.active { display: flex; }
            
            .chat-assist-widget .chat-messages {
                flex: 1;
                overflow-y: auto;
                padding: 20px;
                background: #f9fafb;
                display: flex;
                flex-direction: column;
                gap: 12px;
            }

            .chat-assist-widget .chat-messages::-webkit-scrollbar { width: 6px; }
            .chat-assist-widget .chat-messages::-webkit-scrollbar-track { background: transparent; }
            .chat-assist-widget .chat-messages::-webkit-scrollbar-thumb { background-color: var(--chat-color-border); border-radius: var(--chat-radius-full); }
            
            .chat-assist-widget .file-name { font-size: 12px; color: #ffffff; margin-top: 4px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 200px; }
            
            .chat-assist-widget .chat-bubble { padding: 12px 16px; border-radius: var(--chat-radius-md); max-width: 85%; word-wrap: break-word; font-size: 13px; line-height: 1.5; white-space: pre-line; }

            .chat-assist-widget .chat-bubble p { margin: 0; }
            .chat-assist-widget .chat-bubble p:not(:last-child) { margin-bottom: 8px; }

            .chat-assist-widget .chat-bubble.user-bubble { background: linear-gradient(135deg, var(--chat-widget-primarybubble) 0%, var(--chat-widget-secondarybubble) 100%); color: white; border-bottom-right-radius: 4px; box-shadow: var(--chat-shadow-sm); }
            .chat-assist-widget .chat-bubble.bot-bubble { background: white; color: var(--chat-color-text); border-bottom-left-radius: 4px; box-shadow: var(--chat-shadow-sm); border: 1px solid var(--chat-color-border); }

            .chat-assist-widget .message-icon { width: 28px; height: 28px; border-radius: 50%; flex-shrink: 0; margin-top: 4px; }
            .chat-assist-widget .timestamp { display: block; font-size: 10px; color: var(--chat-color-text-light); opacity: 0.7; margin-top: 4px; }

            .chat-assist-widget .message-container { display: flex; align-items: flex-start; gap: 8px; margin-bottom: 26px; width: 100%; }
            .chat-assist-widget .message-container.bot-message { justify-content: flex-start; }
            .chat-assist-widget .message-container.bot-message .timestamp { text-align: left; margin-left: 8px; }
            .chat-assist-widget .message-container.user-message { justify-content: flex-end; }
            .chat-assist-widget .message-container.user-message .timestamp { text-align: right; margin-right: 8px; }
            .chat-assist-widget .message-content { display: flex; flex-direction: column; max-width: calc(100% - 40px); }

            .chat-assist-widget .typing-indicator { display: flex; align-items: center; gap: 4px; padding: 14px 18px; background: white; border-radius: var(--chat-radius-md); border-bottom-left-radius: 4px; max-width: 80px; align-self: flex-start; box-shadow: var(--chat-shadow-sm); border: 1px solid var(--chat-color-border); }
            .chat-assist-widget .typing-dot { width: 8px; height: 8px; background: var(--chat-color-primary); border-radius: var(--chat-radius-full); opacity: 0.7; animation: typingAnimation 1.4s infinite ease-in-out; }
            .chat-assist-widget .typing-dot:nth-child(1) { animation-delay: 0s; }
            .chat-assist-widget .typing-dot:nth-child(2) { animation-delay: 0.2s; }
            .chat-assist-widget .typing-dot:nth-child(3) { animation-delay: 0.4s; }
            @keyframes typingAnimation { 0%, 60%, 100% { transform: translateY(0); } 30% { transform: translateY(-4px); } }

            .chat-assist-widget .chat-controls { padding: 12px; flex-shrink: 0; background: var(--chat-color-surface); border-top: 1px solid var(--chat-color-border); display: flex; gap: 10px; }
            .chat-assist-widget .file-upload-container { position: relative; display: flex; align-items: center; }
            .chat-assist-widget .file-upload-input { display: none; }
            .chat-assist-widget .file-upload-label { display: flex; align-items: center; justify-content: center; width: 40px; height: 40px; background: var(--chat-color-light); border-radius: var(--chat-radius-md); cursor: pointer; transition: var(--chat-transition); }
            .chat-assist-widget .file-upload-label:hover { background: var(--chat-color-primary); color: white; }
            .chat-assist-widget .file-upload-label svg { width: 18px; height: 18px; }

            .chat-assist-widget .chat-textarea { flex: 1; padding: 14px 16px; border: 1px solid var(--chat-color-border); border-radius: var(--chat-radius-md); background: var(--chat-color-surface); color: var(--chat-color-text); resize: none; font-family: inherit; font-size: 13px; line-height: 1.5; max-height: 120px; min-height: 48px; transition: var(--chat-transition); }
            .chat-assist-widget .chat-textarea:focus { outline: none; border-color: var(--chat-color-primary); box-shadow: 0 0 0 3px rgba(151, 180, 187, 0.3); }
            .chat-assist-widget .chat-textarea::placeholder { color: var(--chat-color-text-light); }

            .chat-assist-widget .chat-submit { background: linear-gradient(135deg, var(--chat-color-primary) 0%, var(--chat-color-secondary) 100%); color: white; border: none; border-radius: var(--chat-radius-md); width: 48px; height: 48px; cursor: pointer; transition: var(--chat-transition); display: flex; align-items: center; justify-content: center; flex-shrink: 0; box-shadow: var(--chat-shadow-sm); }
            .chat-assist-widget .chat-submit:hover { transform: scale(1.05); box-shadow: var(--chat-shadow-md); }
            .chat-assist-widget .chat-submit svg { width: 22px; height: 22px; }

            .chat-assist-widget .chat-launcher { position: fixed; bottom: 20px; height: 56px; border-radius: var(--chat-radius-full); background: linear-gradient(135deg, var(--chat-color-primary) 0%, var(--chat-color-secondary) 100%); color: white; border: none; cursor: pointer; box-shadow: var(--chat-shadow-md); z-index: 999; transition: var(--chat-transition); display: flex; align-items: center; padding: 0 20px 0 16px; gap: 8px; }
            .chat-assist-widget .chat-launcher.right-side { right: 20px; }
            .chat-assist-widget .chat-launcher.left-side { left: 20px; }
            .chat-assist-widget .chat-launcher:hover { transform: scale(1.05); box-shadow: var(--chat-shadow-lg); }
            .chat-assist-widget .chat-launcher svg { width: 24px; height: 24px; }
            .chat-assist-widget .chat-launcher-text { font-weight: 600; font-size: 15px; white-space: nowrap; }

            .chat-assist-widget .chat-footer { padding: 10px; text-align: center; background: var(--chat-color-surface); border-top: 1px solid var(--chat-color-border); flex-shrink: 0; }
            .chat-assist-widget .chat-footer-link { color: var(--chat-color-primary); text-decoration: none; font-size: 12px; opacity: 0.8; transition: var(--chat-transition); font-family: inherit; }
            .chat-assist-widget .chat-footer-link:hover { opacity: 1; }

            .chat-assist-widget .chat-link { color: var(--chat-widget-primarybubble); text-decoration: underline; word-break: break-all; transition: var(--chat-transition); }
            .chat-assist-widget .chat-link:hover { color: var(--chat-widget-secondarybubble); }

            .chat-assist-widget .chat-image { max-width: 100%; border-radius: var(--chat-radius-sm); margin: 8px 0; display: block; box-shadow: var(--chat-shadow-sm); }
            .chat-assist-widget .image-container { display: flex; flex-direction: column; gap: 4px; }
            .chat-assist-widget .image-caption { font-size: 12px; color: var(--chat-color-text-light); text-align: center; }

            .action-buttons-container { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 12px; }
            .action-button { flex: 1 1 calc(50% - 4px); min-width: 120px; padding: 10px 12px; border: none; border-radius: 8px; cursor: pointer; font-weight: 500; font-size: 14px; transition: all 0.2s ease; box-shadow: var(--chat-shadow-sm); display: flex; align-items: center; justify-content: center; opacity: 0.9; }
            .action-button:hover { transform: translateY(-2px); box-shadow: var(--chat-shadow-md); opacity: 1; }
            .blue-button { background-color: rgba(100, 149, 237, 0.8); color: white; }
            .green-button { background-color: rgba(144, 238, 144, 0.8); color: #333; }
            .orange-button { background-color: rgba(255, 182, 193, 0.8); color: #333; }
            .yellow-button { background-color: rgba(255, 255, 153, 0.8); color: #333; }

            .dynamic-buttons-container { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 12px; align-self: flex-start; } 
            .dynamic-button { padding: 8px 12px; border: 1px solid var(--chat-color-border); border-radius: 6px; background-color: #f3f4f6; color: var(--chat-color-text); cursor: pointer; font-weight: 500; font-size: 13px; transition: all 0.2s ease; box-shadow: var(--chat-shadow-sm); text-align: left; flex: 1 1 calc(50% - 4px); box-sizing: border-box; }
            .dynamic-button:hover { background-color: var(--chat-color-light); border-color: var(--chat-color-primary); transform: translateY(-1px); box-shadow: var(--chat-shadow-md); }

            @media (max-width: 480px) {
                .chat-assist-widget .chat-window { width: 100%; height: 100%; max-height: 100%; bottom: 0; right: 0; border-radius: 0; }
                .chat-assist-widget .chat-launcher { bottom: 15px; right: 15px; }
            }
        `;
        document.head.appendChild(widgetStyles);

        // Configurações padrão do widget
        const defaultSettings = {
            webhook: { url: '', route: '' },
            branding: {
                logo: '',
                name: 'Assistente Virtual',
                welcomeText: 'Olá! Como posso ajudar hoje?',
                responseTimeText: 'Responde em alguns segundos',
                poweredBy: { text: 'Powered by Neureka AI', link: 'https://neureka-ai.com' }
            },
            style: {
                primaryColor: '#97B4BB',
                secondaryColor: '#187874',
                position: 'right',
                backgroundColor: '#ffffff',
                fontColor: '#1f2937'
            }
        };

        // Junta as configurações do utilizador com as padrão
        const settings = window.ChatWidgetConfig ? {
            webhook: { ...defaultSettings.webhook, ...window.ChatWidgetConfig.webhook },
            branding: { ...defaultSettings.branding, ...window.ChatWidgetConfig.branding },
            style: { ...defaultSettings.style, ...window.ChatWidgetConfig.style }
        } : defaultSettings;

        // --- 2. CRIAÇÃO DOS ELEMENTOS DO DOM ---

        // Cria o elemento raiz do widget
        const widgetRoot = document.createElement('div');
        widgetRoot.className = 'chat-assist-widget';
        
        // Aplica as cores personalizadas
        widgetRoot.style.setProperty('--chat-widget-primary', settings.style.primaryColor);
        widgetRoot.style.setProperty('--chat-widget-secondary', settings.style.secondaryColor);
        widgetRoot.style.setProperty('--chat-widget-surface', settings.style.backgroundColor);
        widgetRoot.style.setProperty('--chat-widget-text', settings.style.fontColor);

        // Cria a janela do chat
        const chatWindow = document.createElement('div');
        chatWindow.className = `chat-window ${settings.style.position === 'left' ? 'left-side' : 'right-side'}`;
        
        // HTML para o ecrã de boas-vindas e para a interface principal
        chatWindow.innerHTML = `
            <div class="chat-header">
                <img class="chat-header-logo" src="${settings.branding.logo}" alt="${settings.branding.name}">
                <span class="chat-header-title">${settings.branding.name}</span>
                <button class="chat-close-btn">×</button>
            </div>
            <div class="chat-body">
                <div class="chat-messages"></div>
                <div class="chat-controls">
                    <div class="file-upload-container">
                        <label for="chat-file-upload" class="file-upload-label">
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg>
                        </label>
                        <input type="file" id="chat-file-upload" class="file-upload-input" accept=".pdf,.doc,.docx,.jpg,.png,.jpeg,.gif">
                        <div class="file-name-display"></div>
                    </div>
                    <textarea class="chat-textarea" placeholder="Digite aqui..." rows="1"></textarea>
                    <button class="chat-submit">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 2L11 13"></path><path d="M22 2l-7 20-4-9-9-4 20-7z"></path></svg>
                    </button>
                </div>
                <div class="chat-footer">
                    <a class="chat-footer-link" href="${settings.branding.poweredBy.link}" target="_blank">${settings.branding.poweredBy.text}</a>
                </div>
            </div>
            <div class="chat-welcome">
                <h2 class="chat-welcome-title">${settings.branding.welcomeText}</h2>
                <button class="chat-start-btn">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
                    Começar Conversa
                </button>
                <p class="chat-response-time">${settings.branding.responseTimeText}</p>
            </div>
        `;
        
        // Cria o botão de lançamento
        const launchButton = document.createElement('button');
        launchButton.className = `chat-launcher ${settings.style.position === 'left' ? 'left-side' : 'right-side'}`;
        launchButton.innerHTML = `
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path></svg>
            <span class="chat-launcher-text">Ajuda?</span>`;
        
        // Adiciona os elementos ao DOM
        widgetRoot.appendChild(chatWindow);
        widgetRoot.appendChild(launchButton);
        document.body.appendChild(widgetRoot);

        // --- 3. LÓGICA E MANIPULADORES DE EVENTOS ---

        // Obtém referências aos elementos do DOM
        const chatBody = chatWindow.querySelector('.chat-body');
        const messagesContainer = chatWindow.querySelector('.chat-messages');
        const messageTextarea = chatWindow.querySelector('.chat-textarea');
        const sendButton = chatWindow.querySelector('.chat-submit');
        const chatWelcome = chatWindow.querySelector('.chat-welcome');
        const fileInput = chatWindow.querySelector('#chat-file-upload');
        const fileNameDisplay = chatWindow.querySelector('.file-name-display');
        const startButton = chatWindow.querySelector('.chat-start-btn');
        const closeButton = chatWindow.querySelector('.chat-close-btn');

        // Variáveis de estado
        let conversationId = '';
        let isWaitingForResponse = false;

        // Funções Auxiliares de Renderização
        const createSessionId = () => crypto.randomUUID();
        const linkifyText = (text) => text.replace(/(\b(https?|ftp):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/gim, url => `<a href="${url}" target="_blank" rel="noopener noreferrer" class="chat-link">${url}</a>`);
        const renderImages = (text) => text.replace(/(https?:\/\/.*\.(?:png|jpg|jpeg|gif|webp|svg)(?:\?\S*)?)/gi, url => `<div class="image-container"><img src="${url}" class="chat-image" alt="Imagem do link"><span class="image-caption">Imagem</span></div>`);
        const renderMarkdown = (text) => text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/\*(.*?)\*/g, '<em>$1</em>').replace(/^- (.*)$/gm, '<li>$1</li>');

        // Função para adicionar uma mensagem à conversa
        function appendMessage(sender, content, options = {}) {
            const { isInternal = false, hasButtons = false } = options;
            const isUser = sender === 'user';
            const messageContainer = document.createElement('div');
            messageContainer.className = `message-container ${isUser ? 'user-message' : 'bot-message'}`;

            const iconUrl = isUser ? 'https://cdn-icons-png.flaticon.com/512/4202/4202836.png' : 'https://cdn-icons-png.flaticon.com/512/4712/4712035.png';
            const altText = isUser ? 'Utilizador' : 'Chatbot';
            
            let processedContent = content;
            if (!hasButtons) {
                if (!isUser) processedContent = renderMarkdown(processedContent);
                processedContent = renderImages(processedContent);
                processedContent = linkifyText(processedContent);
                if (!processedContent.trim().startsWith('<')) {
                    processedContent = `<p>${processedContent}</p>`;
                }
            }

            messageContainer.innerHTML = `
                ${!isUser ? `<img src="${iconUrl}" class="message-icon" alt="${altText}">` : ''}
                <div class="message-content">
                    <div class="chat-bubble ${isUser ? 'user-bubble' : 'bot-bubble'}">
                        ${processedContent}
                    </div>
                    <span class="timestamp">${new Date().toLocaleString('pt-BR')}</span>
                </div>
                ${isUser ? `<img src="${iconUrl}" class="message-icon" alt="${altText}">` : ''}
            `;

            messagesContainer.appendChild(messageContainer);
            messagesContainer.scrollTop = messagesContainer.scrollHeight;
            return messageContainer;
        }

        // Inicia a conversa
        function startChat() {
            conversationId = createSessionId();
            chatWelcome.style.display = 'none';
            chatBody.classList.add('active');
            
            const welcomeHTML = `
                <p>Olá! 😊 Eu sou seu assistente virtual especializado em energia solar. Confira o que posso fazer por si:<br>
                1. Responder a dúvidas sobre energia solar ☀️<br>
                2. Agendar uma reunião no calendário 📅<br>
                3. Criar um pedido de suporte para falar com alguém 👨‍💼<br>
                4. Analisar a sua fatura de eletricidade e estimar quanto pode poupar 💡💰<br>
                Do que precisa?</p>
                <div class="action-buttons-container">
                    <button class="action-button blue-button" data-action="Dúvida">Dúvida</button>
                    <button class="action-button green-button" data-action="Agendamento">Agendamento</button>
                    <button class="action-button orange-button" data-action="Ticket">Ticket</button>
                    <button class="action-button yellow-button" data-action="Energia">Análise</button>
                </div>`;
            
            const welcomeMessage = appendMessage('bot', welcomeHTML, { hasButtons: true });
            
            welcomeMessage.querySelectorAll('.action-button').forEach(button => {
                button.addEventListener('click', () => {
                    const action = button.dataset.action;
                    if (action === 'Dúvida') {
                        submitMessage('Dúvida', { isInternal: true });
                        showDoubtTopics();
                    } else if (action === 'Agendamento') {
                        submitMessage('Agendamento');
                        addCalendarToChat();
                    } else {
                        const messageMap = { 'Ticket': 'Ticket de suporte', 'Energia': 'Análise de energia' };
                        submitMessage(messageMap[action] || action);
                    }
                });
            });
        }
        
        // Mostra os tópicos de dúvidas
        function showDoubtTopics() {
            const topicsHTML = `
                <p>Sobre qual tópico tem dúvidas? Escolha uma opção:</p>
                <div class="dynamic-buttons-container">
                    <button class="dynamic-button" data-topic="Energia Solar">Energia Solar</button>
                    <button class="dynamic-button" data-topic="Sistema Fotovoltaico">Sistema Fotovoltaico</button>
                    <button class="dynamic-button" data-topic="Componentes Solares">Componentes Solares</button>
                    <button class="dynamic-button" data-topic="Benefícios Solares">Benefícios Solares</button>
                    <button class="dynamic-button" data-topic="Vida Útil">Vida Útil</button>
                    <button class="dynamic-button" data-topic="Retorno do Investimento">Retorno do Investimento</button>
                    <button class="dynamic-button" data-topic="Fatura de Eletricidade">Fatura de Eletricidade</button>
                    <button class="dynamic-button" data-topic="Manutenção do Sistema">Manutenção do Sistema</button>
                    <button class="dynamic-button" data-topic="O que é eletromobilidade?">O que é eletromobilidade?</button>
                    <button class="dynamic-button" data-topic="Estação de Recarga">Estação de Recarga</button>
                </div>`;
            const topicsMessage = appendMessage('bot', topicsHTML, { hasButtons: true });
            topicsMessage.querySelectorAll('.dynamic-button').forEach(btn => {
                btn.addEventListener('click', () => submitMessage(btn.dataset.topic));
            });
        }
        
        // Adiciona o calendário ao chat
        const addCalendarToChat = () => {
            const calendarHTML = `<iframe src="https://calendar.app.google/tps9rXCFtW3VUoiBA" width="100%" height="400" frameborder="0" style="border-radius: 8px; margin-top: 8px;"></iframe>`;
            appendMessage('bot', calendarHTML, { hasButtons: true });
        };

        // Envia a mensagem
        async function submitMessage(messageText, options = {}) {
            const { isInternal = false } = options;
            if (isWaitingForResponse && !isInternal) return;
            
            const trimmedMessage = messageText.trim();
            if (!trimmedMessage && fileInput.files.length === 0) return;

            appendMessage('user', trimmedMessage);
            if (!isInternal) {
                messageTextarea.value = '';
                autoResizeTextarea();
            }
            if (isInternal) return;

            isWaitingForResponse = true;
            const typingIndicator = appendMessage('bot', '<div class="typing-indicator"><div class="typing-dot"></div><div class="typing-dot"></div><div class="typing-dot"></div></div>', { hasButtons: true });

            const formData = new FormData();
            formData.append('sessionId', conversationId);
            formData.append('chatInput', trimmedMessage);
            if (fileInput.files.length > 0) {
                formData.append('file', fileInput.files[0]);
            }

            try {
                const response = await fetch(settings.webhook.url, { method: 'POST', body: formData });
                if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
                const responseData = await response.json();
                
                messagesContainer.removeChild(typingIndicator);
                
                const rawResponse = Array.isArray(responseData) ? responseData[0].output : responseData.output;
                appendMessage('bot', rawResponse || "Não obtive uma resposta.");

            } catch (error) {
                console.error('Chat Widget Error:', error);
                if (typingIndicator.parentNode) messagesContainer.removeChild(typingIndicator);
                appendMessage('bot', "Desculpe, ocorreu um erro de comunicação. Por favor, tente novamente.");
            } finally {
                isWaitingForResponse = false;
                fileInput.value = '';
                if (fileNameDisplay) fileNameDisplay.textContent = '';
            }
        }

        // Redimensiona a textarea
        function autoResizeTextarea() {
            messageTextarea.style.height = 'auto';
            messageTextarea.style.height = `${Math.min(messageTextarea.scrollHeight, 120)}px`;
        }

        // Listeners de eventos
        startButton.addEventListener('click', startChat);
        launchButton.addEventListener('click', () => chatWindow.classList.toggle('visible'));
        closeButton.addEventListener('click', () => chatWindow.classList.remove('visible'));
        sendButton.addEventListener('click', () => submitMessage(messageTextarea.value));
        
        fileInput.addEventListener('change', () => {
            if (fileInput.files.length > 0) {
                fileNameDisplay.textContent = fileInput.files[0].name;
                messageTextarea.focus();
            }
        });
        
        messageTextarea.addEventListener('keypress', (event) => {
            if (event.key === 'Enter' && !event.shiftKey) {
                event.preventDefault();
                submitMessage(messageTextarea.value);
            }
        });
        
        messageTextarea.addEventListener('input', autoResizeTextarea);
    }

    // Garante que o DOM está pronto antes de executar o script
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initializeWidget);
    } else {
        initializeWidget();
    }

})();
