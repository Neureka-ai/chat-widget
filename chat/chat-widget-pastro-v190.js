/**
 * @summary Widget de Chat Interativo para n8n.
 * @description Este script injeta um widget de chat completo e personalizável em uma página web.
 * Ele é auto-contido, criando sua própria UI, estilos e lógica de comunicação com um webhook.
 * O script é envolvido em uma IIFE (Immediately Invoked Function Expression) para evitar poluir o escopo global.
 */
(function() {
    // --- 1. BLOCO DE INICIALIZAÇÃO E VERIFICAÇÃO ---
    // Garante que o widget seja carregado apenas uma vez, mesmo que o script seja incluído várias vezes.
    if (window.N8nChatWidgetLoaded) {
        return;
    }
    window.N8nChatWidgetLoaded = true;

    // --- 2. CONFIGURAÇÃO E CONSTANTES ---
    // Configurações padrão que podem ser sobrescritas pelo objeto window.ChatWidgetConfig na página hospedeira.
    const DEFAULT_SETTINGS = {
        webhook: {
            url: '', // URL do webhook para onde as mensagens são enviadas.
            route: '' // Rota específica ou parâmetro para o webhook.
        },
        branding: {
            logo: 'https://cdn-icons-png.flaticon.com/512/4712/4712035.png',
            name: 'Assistente Virtual',
            welcomeText: 'Olá! Como posso ajudar você hoje?',
            poweredBy: {
                text: 'Powered by Neureka AI',
                link: 'https://neureka-ai.com'
            }
        },
        style: {
            primaryColor: '#10b981',
            secondaryColor: '#059669',
            position: 'right', // 'left' ou 'right'
            backgroundColor: '#ffffff',
            fontColor: '#1f2937'
        },
        initialActions: {
            message: 'Olá! 😊 Eu sou seu assistente virtual especializado em energia solar. Confira o que posso fazer por você:\n1. Responder dúvidas sobre energia solar ☀️\n2. Agendar uma reunião no calendário 📅\n3. Criar um chamado para falar com alguém 👨‍💼\n4. Analisar sua conta de luz e estimar quanto você pode economizar 💡💰\nDo que você precisa?',
            buttons: [{
                text: 'Dúvida',
                action: 'showDoubtTopics',
                style: 'blue-button'
            }, {
                text: 'Agendamento',
                action: 'showCalendar',
                style: 'green-button'
            }, {
                text: 'Ticket',
                action: 'submitMessage',
                payload: 'Criar um ticket de suporte',
                style: 'orange-button'
            }, {
                text: 'Análise de Conta',
                action: 'submitMessage',
                payload: 'Analisar minha conta de luz',
                style: 'yellow-button'
            }, ]
        }
    };

    /**
     * Mescla as configurações do usuário com as configurações padrão.
     * @param {object} defaultConfig - O objeto de configuração padrão.
     * @param {object} userConfig - O objeto de configuração fornecido pelo usuário (window.ChatWidgetConfig).
     * @returns {object} O objeto de configuração final mesclado.
     */
    function mergeSettings(defaultConfig, userConfig = {}) {
        const settings = { ...defaultConfig
        };
        for (const key in defaultConfig) {
            if (userConfig[key]) {
                settings[key] = { ...defaultConfig[key],
                    ...userConfig[key]
                };
            }
        }
        return settings;
    }

    const settings = mergeSettings(DEFAULT_SETTINGS, window.ChatWidgetConfig);

    // Variáveis de estado da sessão
    let conversationId = null;
    let isWaitingForResponse = false;
    let isChatInitialized = false;

    // --- 3. INJEÇÃO DE ESTILOS E FONTES ---
    /**
     * Injeta dinamicamente a fonte e a folha de estilos do widget no <head> do documento.
     */
    function injectStylesAndFonts() {
        // Carrega a fonte Poppins do Google Fonts
        const fontElement = document.createElement('link');
        fontElement.rel = 'stylesheet';
        fontElement.href = 'https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap';
        document.head.appendChild(fontElement);

        // Estilos CSS para o widget. Usar variáveis CSS permite fácil customização via JavaScript.
        const widgetStyles = document.createElement('style');
        widgetStyles.textContent = `
            :root {
                --chat-color-primary: ${settings.style.primaryColor};
                --chat-color-secondary: ${settings.style.secondaryColor};
                --chat-color-surface: ${settings.style.backgroundColor};
                --chat-color-text: ${settings.style.fontColor};
                --chat-color-tertiary: #a1b3df;
                --chat-color-light: #d4eaf9;
                --chat-color-text-light: #6b7280;
                --chat-color-border: #e5e7eb;
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

            .chat-window {
                position: fixed;
                bottom: 90px;
                z-index: 10000;
                width: 380px;
                height: 70vh;
                max-height: 600px;
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
            .chat-window.right-side { right: 20px; }
            .chat-window.left-side { left: 20px; }
            .chat-window.visible {
                display: flex;
                opacity: 1;
                transform: translateY(0) scale(1);
            }

            .chat-header {
                padding: 16px;
                display: flex;
                align-items: center;
                gap: 12px;
                background: linear-gradient(135deg, var(--chat-color-primary) 0%, var(--chat-color-secondary) 100%);
                color: white;
                position: relative;
                flex-shrink: 0;
            }
            .chat-header-logo {
                width: 40px; height: 40px; border-radius: var(--chat-radius-full);
                object-fit: cover; background: white; padding: 2px;
            }
            .chat-header-title { font-size: 16px; font-weight: 600; }
            .chat-close-btn {
                position: absolute; right: 12px; top: 50%;
                transform: translateY(-50%);
                background: rgba(255, 255, 255, 0.2); border: none;
                color: white; cursor: pointer; padding: 4px;
                display: flex; align-items: center; justify-content: center;
                transition: var(--chat-transition); font-size: 18px;
                border-radius: var(--chat-radius-full); width: 28px; height: 28px;
            }
            .chat-close-btn:hover {
                background: rgba(255, 255, 255, 0.3);
                transform: translateY(-50%) scale(1.1);
            }

            .chat-body {
                display: flex; flex-direction: column;
                height: 100%; overflow: hidden;
            }

            .chat-messages {
                flex: 1; overflow-y: auto; padding: 20px;
                background: #f9fafb; display: flex; flex-direction: column; gap: 12px;
            }
            .chat-messages::-webkit-scrollbar { width: 6px; }
            .chat-messages::-webkit-scrollbar-track { background: transparent; }
            .chat-messages::-webkit-scrollbar-thumb { background-color: var(--chat-color-primary); border-radius: var(--chat-radius-full); }

            .message-container { display: flex; align-items: flex-start; gap: 8px; width: 100%; }
            .message-container.bot-message { justify-content: flex-start; }
            .message-container.user-message { justify-content: flex-end; }
            .message-content { display: flex; flex-direction: column; max-width: calc(100% - 48px); }
            .message-icon { width: 32px; height: 32px; border-radius: 50%; flex-shrink: 0; }
            
            .chat-bubble {
                padding: 12px 16px; border-radius: var(--chat-radius-md);
                word-wrap: break-word; font-size: 14px; line-height: 1.5;
                white-space: pre-wrap;
            }
            .chat-bubble.user-bubble {
                background: linear-gradient(135deg, #3498db, #2980b9);
                color: white; align-self: flex-end; border-bottom-right-radius: 4px;
            }
            .chat-bubble.bot-bubble {
                background: white; color: var(--chat-color-text);
                align-self: flex-start; border-bottom-left-radius: 4px;
                border: 1px solid var(--chat-color-border);
            }
            .timestamp {
                display: block; font-size: 10px; color: var(--chat-color-text-light);
                margin-top: 6px;
            }
            .user-message .timestamp { text-align: right; margin-right: 8px; }
            .bot-message .timestamp { text-align: left; margin-left: 8px; }

            .file-info { font-size: 12px; color: #ffffff; margin-top: 8px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 200px; background: rgba(0,0,0,0.2); padding: 4px 8px; border-radius: 4px; }
            .chat-image { max-width: 100%; border-radius: var(--chat-radius-sm); margin-top: 8px; display: block; }
            .chat-link { color: var(--chat-color-primary); text-decoration: underline; word-break: break-all; }
            .chat-link:hover { color: var(--chat-color-secondary); }

            .typing-indicator { display: flex; align-items: center; gap: 4px; padding: 14px 18px; background: white; border-radius: var(--chat-radius-md); border-bottom-left-radius: 4px; max-width: 80px; align-self: flex-start; border: 1px solid var(--chat-color-border); }
            .typing-dot { width: 8px; height: 8px; background: var(--chat-color-primary); border-radius: var(--chat-radius-full); animation: typingAnimation 1.4s infinite ease-in-out; }
            .typing-dot:nth-child(2) { animation-delay: 0.2s; }
            .typing-dot:nth-child(3) { animation-delay: 0.4s; }
            @keyframes typingAnimation { 0%, 60%, 100% { transform: translateY(0); } 30% { transform: translateY(-4px); } }

            .chat-controls { padding: 12px; flex-shrink: 0; background: var(--chat-color-surface); border-top: 1px solid var(--chat-color-border); display: flex; gap: 10px; align-items: flex-end; }
            .file-upload-input { display: none; }
            .control-btn { display: flex; align-items: center; justify-content: center; width: 48px; height: 48px; background: #f3f4f6; border-radius: var(--chat-radius-md); cursor: pointer; transition: var(--chat-transition); border: 1px solid var(--chat-color-border); color: var(--chat-color-text-light); }
            .control-btn:hover { background: var(--chat-color-primary); color: white; }
            .control-btn svg { width: 22px; height: 22px; }

            .chat-textarea { flex: 1; padding: 14px 16px; border: 1px solid var(--chat-color-border); border-radius: var(--chat-radius-md); background: var(--chat-color-surface); color: var(--chat-color-text); resize: none; font-family: inherit; font-size: 14px; line-height: 1.5; max-height: 120px; min-height: 48px; box-sizing: border-box; transition: var(--chat-transition); }
            .chat-textarea:focus { outline: none; border-color: var(--chat-color-primary); box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.2); }
            .chat-textarea::placeholder { color: var(--chat-color-text-light); }
            
            .chat-footer { padding: 10px; text-align: center; background: var(--chat-color-surface); border-top: 1px solid var(--chat-color-border); flex-shrink: 0; }
            .chat-footer-link { color: var(--chat-color-text-light); text-decoration: none; font-size: 12px; transition: var(--chat-transition); }
            .chat-footer-link:hover { color: var(--chat-color-primary); }

            .chat-launcher { position: fixed; bottom: 20px; height: 56px; border-radius: var(--chat-radius-full); background: linear-gradient(135deg, var(--chat-color-primary) 0%, var(--chat-color-secondary) 100%); color: white; border: none; cursor: pointer; box-shadow: var(--chat-shadow-md); z-index: 9999; transition: var(--chat-transition); display: flex; align-items: center; padding: 0 20px 0 16px; gap: 8px; }
            .chat-launcher.right-side { right: 20px; }
            .chat-launcher.left-side { left: 20px; }
            .chat-launcher:hover { transform: scale(1.05); box-shadow: var(--chat-shadow-lg); }
            .chat-launcher svg { width: 24px; height: 24px; }
            .chat-launcher-text { font-weight: 600; font-size: 15px; white-space: nowrap; }

            .action-buttons-container, .dynamic-buttons-container { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 12px; }
            .action-button, .dynamic-button { padding: 10px 12px; border: none; border-radius: 8px; cursor: pointer; font-weight: 500; font-size: 14px; transition: all 0.2s ease; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
            .action-button:hover, .dynamic-button:hover { transform: translateY(-2px); box-shadow: 0 4px 8px rgba(0,0,0,0.15); opacity: 1; }
            .dynamic-button { background-color: #f3f4f6; color: var(--chat-color-text); flex: 1 1 calc(50% - 4px); }
            .dynamic-button:hover { background-color: var(--chat-color-primary); color: white; }
            .blue-button { background-color: #3b82f6; color: white; }
            .green-button { background-color: #10b981; color: white; }
            .orange-button { background-color: #f97316; color: white; }
            .yellow-button { background-color: #f59e0b; color: white; }

            /* Media Queries para Responsividade */
            @media (max-width: 480px) {
                .chat-window {
                    width: 100vw; height: 100vh; max-height: 100%;
                    bottom: 0; right: 0; left: 0; border-radius: 0;
                }
                .chat-launcher { bottom: 10px; right: 10px; }
            }
        `;
        document.head.appendChild(widgetStyles);
    }

    // --- 4. CRIAÇÃO DA UI (ELEMENTOS DO DOM) ---
    let domElements = {}; // Objeto para armazenar referências aos elementos do DOM

    /**
     * Cria a estrutura HTML do widget e a anexa ao corpo do documento.
     */
    function createWidgetUI() {
        const widgetRoot = document.createElement('div');
        widgetRoot.className = 'chat-assist-widget';

        const chatWindowHTML = `
            <div class="chat-window ${settings.style.position}-side">
                <div class="chat-header">
                    <img class="chat-header-logo" src="${settings.branding.logo}" alt="Logo">
                    <span class="chat-header-title">${settings.branding.name}</span>
                    <button class="chat-close-btn" aria-label="Fechar Chat">×</button>
                </div>
                <div class="chat-body">
                    <div class="chat-messages"></div>
                    <div class="chat-controls">
                        <label for="chat-file-upload" class="control-btn file-upload-label" aria-label="Anexar arquivo">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"></path></svg>
                        </label>
                        <input type="file" id="chat-file-upload" class="file-upload-input" accept=".pdf,.doc,.docx,.jpg,.png,.jpeg,.gif">
                        <textarea class="chat-textarea" placeholder="Digite aqui..." rows="1"></textarea>
                        <button class="control-btn chat-submit" aria-label="Enviar Mensagem">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M2,21L23,12L2,3V10L17,12L2,14V21Z" /></svg>
                        </button>
                    </div>
                    <div class="chat-footer">
                        <a class="chat-footer-link" href="${settings.branding.poweredBy.link}" target="_blank" rel="noopener noreferrer">${settings.branding.poweredBy.text}</a>
                    </div>
                </div>
            </div>
        `;

        const launchButtonHTML = `
            <button class="chat-launcher ${settings.style.position}-side">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path></svg>
                <span class="chat-launcher-text">Ajuda?</span>
            </button>
        `;

        widgetRoot.innerHTML = chatWindowHTML + launchButtonHTML;
        document.body.appendChild(widgetRoot);

        // Armazena referências aos elementos para evitar buscas repetidas no DOM
        domElements = {
            widgetRoot,
            chatWindow: widgetRoot.querySelector('.chat-window'),
            launchButton: widgetRoot.querySelector('.chat-launcher'),
            closeButton: widgetRoot.querySelector('.chat-close-btn'),
            messagesContainer: widgetRoot.querySelector('.chat-messages'),
            messageTextarea: widgetRoot.querySelector('.chat-textarea'),
            sendButton: widgetRoot.querySelector('.chat-submit'),
            fileInput: widgetRoot.querySelector('#chat-file-upload'),
            fileLabel: widgetRoot.querySelector('.file-upload-label'),
        };
    }

    // --- 5. FUNÇÕES AUXILIARES ---
    const createSessionId = () => crypto.randomUUID();
    const getCurrentTimestamp = () => new Date().toLocaleTimeString('pt-BR', {
        hour: '2-digit',
        minute: '2-digit'
    });

    /**
     * Redimensiona a altura do textarea automaticamente com base no conteúdo.
     */
    function autoResizeTextarea() {
        const {
            messageTextarea
        } = domElements;
        messageTextarea.style.height = 'auto';
        const newHeight = Math.min(messageTextarea.scrollHeight, 120);
        messageTextarea.style.height = `${newHeight}px`;
    }

    /**
     * Processa o texto para encontrar URLs e envolvê-las em tags <a>.
     * @param {string} text - O texto a ser processado.
     * @returns {string} O texto com links HTML.
     */
    function linkifyText(text) {
        const urlPattern = /(\b(https?|ftp):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/gi;
        return text.replace(urlPattern, url => `<a href="${url}" target="_blank" rel="noopener noreferrer" class="chat-link">${url}</a>`);
    }

    /**
     * Adiciona ou remove o indicador de "digitando...".
     * @param {boolean} show - True para mostrar, false para remover.
     */
    function toggleTypingIndicator(show) {
        const existingIndicator = domElements.messagesContainer.querySelector('.typing-indicator');
        if (show && !existingIndicator) {
            const indicator = document.createElement('div');
            indicator.className = 'typing-indicator';
            indicator.innerHTML = `<div class="typing-dot"></div><div class="typing-dot"></div><div class="typing-dot"></div>`;
            domElements.messagesContainer.appendChild(indicator);
        } else if (!show && existingIndicator) {
            existingIndicator.remove();
        }
        scrollToBottom();
    }

    /**
     * Rola o contêiner de mensagens para o final.
     */
    function scrollToBottom() {
        const {
            messagesContainer
        } = domElements;
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }

    /**
     * Cria e adiciona uma mensagem à interface do chat.
     * Esta é uma função centralizada para exibir todas as mensagens.
     * @param {object} options - Opções da mensagem.
     * @param {string} options.text - O texto da mensagem.
     * @param {'user' | 'bot'} options.sender - Quem enviou a mensagem.
     * @param {File} [options.file] - Arquivo anexado.
     * @param {Array} [options.buttons] - Array de botões de ação para exibir.
     * @param {string} [options.iframeSrc] - URL para um iframe a ser exibido.
     */
    function addMessageToChat({
        text,
        sender,
        file = null,
        buttons = [],
        iframeSrc = null
    }) {
        const messageContainer = document.createElement('div');
        messageContainer.className = `message-container ${sender}-message`;

        const userIcon = 'https://cdn-icons-png.flaticon.com/512/4202/4202836.png';
        const botIcon = settings.branding.logo;

        let fileHTML = '';
        if (file) {
            fileHTML = `<div class="file-info">Arquivo: ${file.name}</div>`;
        }

        let buttonsHTML = '';
        if (buttons.length > 0) {
            buttonsHTML += `<div class="${buttons[0].payload ? 'dynamic' : 'action'}-buttons-container">`;
            buttons.forEach(btn => {
                buttonsHTML += `<button class="${btn.payload ? 'dynamic' : 'action'}-button ${btn.style || ''}" data-action='${btn.action}' data-payload='${JSON.stringify(btn.payload || btn.text)}'>${btn.text}</button>`;
            });
            buttonsHTML += `</div>`;
        }

        let iframeHTML = '';
        if (iframeSrc) {
            iframeHTML = `<iframe src="${iframeSrc}" width="100%" height="400" frameborder="0" style="border-radius: 8px; margin-top: 8px;"></iframe>`;
        }

        const processedText = linkifyText(text.replace(/</g, "&lt;").replace(/>/g, "&gt;"));

        messageContainer.innerHTML = `
            ${sender === 'bot' ? `<img src="${botIcon}" class="message-icon" alt="Bot Icon">` : ''}
            <div class="message-content">
                <div class="chat-bubble ${sender}-bubble">
                    <p>${processedText}</p>
                    ${fileHTML}
                    ${iframeHTML}
                    ${buttonsHTML}
                </div>
                <span class="timestamp">${getCurrentTimestamp()}</span>
            </div>
            ${sender === 'user' ? `<img src="${userIcon}" class="message-icon" alt="User Icon">` : ''}
        `;

        domElements.messagesContainer.appendChild(messageContainer);
        scrollToBottom();
    }

    // --- 6. LÓGICA PRINCIPAL DO CHAT ---

    /**
     * Inicia uma nova conversa de chat.
     */
    function startChat() {
        if (isChatInitialized) return;
        conversationId = createSessionId();
        addMessageToChat({
            text: settings.initialActions.message,
            sender: 'bot',
            buttons: settings.initialActions.buttons
        });
        isChatInitialized = true;
    }

    /**
     * Manipula as ações dos botões clicados no chat.
     * @param {string} action - A ação a ser executada.
     * @param {string} payload - O dado associado à ação.
     */
    function handleButtonAction(action, payload) {
        const parsedPayload = JSON.parse(payload);
        addMessageToChat({
            text: typeof parsedPayload === 'object' ? parsedPayload.text : parsedPayload,
            sender: 'user'
        });

        switch (action) {
            case 'showDoubtTopics':
                showDoubtTopics();
                break;
            case 'showCalendar':
                addMessageToChat({
                    text: "Claro! Aqui está minha agenda para você marcar um horário.",
                    sender: 'bot',
                    iframeSrc: 'https://calendar.app.google/tps9rXCFtW3VUoiBA'
                });
                break;
            case 'submitMessage':
                sendMessageToServer(parsedPayload);
                break;
            default:
                sendMessageToServer(parsedPayload);
        }
    }

    /**
     * Exibe a lista de tópicos de dúvidas como botões.
     */
    function showDoubtTopics() {
        const topics = [
            { text: "Energia Solar", payload: { text: "O que é Energia Solar?" } },
            { text: "Sistema Fotovoltaico", payload: { text: "Como funciona um Sistema Fotovoltaico?" } },
            { text: "Componentes", payload: { text: "Quais são os componentes de um sistema solar?" } },
            { text: "Benefícios", payload: { text: "Quais os benefícios da energia solar?" } },
            { text: "Vida Útil", payload: { text: "Qual a vida útil de um painel solar?" } },
            { text: "Retorno do Investimento", payload: { text: "Em quanto tempo tenho retorno do investimento?" } },
        ];
        addMessageToChat({
            text: 'Sobre qual tópico você tem dúvidas? Escolha uma opção:',
            sender: 'bot',
            buttons: topics.map(t => ({...t, action: 'submitMessage', style: 'dynamic-button' }))
        });
    }

    /**
     * Envia a mensagem do usuário (texto e/ou arquivo) para o servidor webhook.
     * @param {string} messageText - O texto da mensagem.
     * @param {File} [file] - O arquivo a ser enviado.
     */
    async function sendMessageToServer(messageText, file = null) {
        if (isWaitingForResponse) return;

        const trimmedMessage = messageText.trim();
        if (!trimmedMessage && !file) return;

        isWaitingForResponse = true;
        toggleTypingIndicator(true);

        const formData = new FormData();
        formData.append('sessionId', conversationId);
        formData.append('route', settings.webhook.route);
        formData.append('chatInput', trimmedMessage);
        if (file) {
            formData.append('file', file);
        }

        try {
            const response = await fetch(settings.webhook.url, {
                method: 'POST',
                body: formData
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const responseData = await response.json();
            const botResponse = Array.isArray(responseData) ? responseData[0].output : responseData.output;

            addMessageToChat({
                text: botResponse || "Não recebi uma resposta válida.",
                sender: 'bot'
            });

        } catch (error) {
            console.error('Chat Widget Error:', error);
            addMessageToChat({
                text: "Desculpe, ocorreu um erro de comunicação. Por favor, tente novamente mais tarde.",
                sender: 'bot'
            });
        } finally {
            isWaitingForResponse = false;
            toggleTypingIndicator(false);
        }
    }

    /**
     * Função chamada quando o usuário envia uma mensagem pela interface.
     */
    function handleUserSubmit() {
        const {
            messageTextarea,
            fileInput
        } = domElements;
        const messageText = messageTextarea.value;
        const file = fileInput.files[0];

        if (messageText.trim() === "" && !file) return;

        addMessageToChat({
            text: messageText,
            sender: 'user',
            file: file
        });
        sendMessageToServer(messageText, file);

        // Limpa os campos após o envio
        messageTextarea.value = '';
        fileInput.value = '';
        autoResizeTextarea();
    }

    // --- 7. REGISTRO DE EVENTOS ---
    /**
     * Adiciona todos os event listeners necessários para a interatividade do widget.
     */
    function initializeEventListeners() {
        const {
            launchButton,
            closeButton,
            sendButton,
            messageTextarea,
            fileInput,
            widgetRoot,
        } = domElements;

        launchButton.addEventListener('click', () => {
            domElements.chatWindow.classList.toggle('visible');
            if (domElements.chatWindow.classList.contains('visible')) {
                startChat();
            }
        });

        closeButton.addEventListener('click', () => {
            domElements.chatWindow.classList.remove('visible');
        });

        sendButton.addEventListener('click', handleUserSubmit);

        messageTextarea.addEventListener('keypress', (event) => {
            if (event.key === 'Enter' && !event.shiftKey) {
                event.preventDefault();
                handleUserSubmit();
            }
        });

        messageTextarea.addEventListener('input', autoResizeTextarea);

        fileInput.addEventListener('change', () => {
            if (fileInput.files.length > 0) {
                const fileName = fileInput.files[0].name;
                messageTextarea.placeholder = `Anexado: ${fileName}`;
                messageTextarea.focus();
            } else {
                messageTextarea.placeholder = 'Digite aqui...';
            }
        });

        // Delegação de eventos para os botões dinâmicos
        widgetRoot.addEventListener('click', (event) => {
            const button = event.target.closest('.action-button, .dynamic-button');
            if (button) {
                const {
                    action,
                    payload
                } = button.dataset;
                if (action && payload) {
                    handleButtonAction(action, payload);
                }
            }
        });
    }

    // --- 8. INICIALIZAÇÃO DO WIDGET ---
    injectStylesAndFonts();
    createWidgetUI();
    initializeEventListeners();

})();
