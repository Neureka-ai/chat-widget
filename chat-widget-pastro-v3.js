// Interactive Chat Widget for n8n with Auto-Start, File Upload and Custom Welcome Message
(function() {
    // Initialize widget only once
    if (window.N8nChatWidgetLoaded) return;
    window.N8nChatWidgetLoaded = true;

    // Load font resource - using Poppins for a fresh look
    const fontElement = document.createElement('link');
    fontElement.rel = 'stylesheet';
    fontElement.href = 'https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap';
    document.head.appendChild(fontElement);

    // Apply widget styles with completely different design approach
    const widgetStyles = document.createElement('style');
    widgetStyles.textContent = `
        .chat-assist-widget {
            --chat-color-primary: var(--chat-widget-primary, #10b981);
            --chat-color-secondary: var(--chat-widget-secondary, #059669);
            --chat-color-tertiary: var(--chat-widget-tertiary, #047857);
            --chat-color-light: var(--chat-widget-light, #d1fae5);
            --chat-color-surface: var(--chat-widget-surface, #ffffff);
            --chat-color-text: var(--chat-widget-text, #1f2937);
            --chat-color-text-light: var(--chat-widget-text-light, #6b7280);
            --chat-color-border: var(--chat-widget-border, #e5e7eb);
            --chat-shadow-sm: 0 1px 3px rgba(16, 185, 129, 0.1);
            --chat-shadow-md: 0 4px 6px rgba(16, 185, 129, 0.15);
            --chat-shadow-lg: 0 10px 15px rgba(16, 185, 129, 0.2);
            --chat-radius-sm: 8px;
            --chat-radius-md: 12px;
            --chat-radius-lg: 20px;
            --chat-radius-full: 9999px;
            --chat-transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            font-family: 'Poppins', sans-serif;
        }

        /* [Todos os estilos CSS anteriores...] */

        /* NEW: File upload styles */
        .file-upload-container {
            position: relative;
            display: flex;
            align-items: center;
            margin-right: 8px;
        }

        .file-upload-input {
            display: none;
        }

        .file-upload-label {
            display: flex;
            align-items: center;
            justify-content: center;
            width: 40px;
            height: 40px;
            background: var(--chat-color-light);
            border-radius: var(--chat-radius-md);
            cursor: pointer;
            transition: var(--chat-transition);
        }

        .file-upload-label:hover {
            background: var(--chat-color-primary);
            color: white;
        }

        .file-upload-label svg {
            width: 18px;
            height: 18px;
        }

        .file-name-display {
            font-size: 12px;
            margin-left: 8px;
            color: var(--chat-color-text-light);
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
            max-width: 100px;
        }
    `;
    document.head.appendChild(widgetStyles);

    // Default configuration
    const defaultSettings = {
        webhook: {
            url: '',
            route: ''
        },
        branding: {
            logo: '',
            name: 'Assistente Virtual',
            welcomeText: 'Bem-vindo! Como posso ajudar?',
            responseTimeText: 'Respondendo em segundos...',
            poweredBy: {
                text: 'Powered by n8n',
                link: 'https://n8n.io'
            }
        },
        style: {
            primaryColor: '#10b981',
            secondaryColor: '#059669',
            position: 'right',
            backgroundColor: '#ffffff',
            fontColor: '#1f2937'
        },
        i18n: {
            pt: {
                inputPlaceholder: 'Digite sua mensagem...',
                fileUploadText: 'Anexar arquivo',
                sendButtonText: 'Enviar'
            }
        },
        allowFileUploads: true,
        acceptedFileTypes: '.pdf,.doc,.docx,.jpg,.png,.txt'
    };

    // Merge user settings with defaults
    const settings = window.ChatWidgetConfig ? {
        ...defaultSettings,
        webhook: { ...defaultSettings.webhook, ...window.ChatWidgetConfig.webhook },
        branding: { ...defaultSettings.branding, ...window.ChatWidgetConfig.branding },
        style: { ...defaultSettings.style, ...window.ChatWidgetConfig.style },
        i18n: { ...defaultSettings.i18n, ...window.ChatWidgetConfig.i18n },
        allowFileUploads: window.ChatWidgetConfig.allowFileUploads !== undefined ? 
                         window.ChatWidgetConfig.allowFileUploads : defaultSettings.allowFileUploads,
        acceptedFileTypes: window.ChatWidgetConfig.acceptedFileTypes || defaultSettings.acceptedFileTypes
    } : defaultSettings;

    // [Restante do código de inicialização do widget...]

    // Create chat interface with file upload
    const chatInterfaceHTML = `
        <div class="chat-body">
            <div class="chat-messages"></div>
            <div class="chat-controls">
                ${settings.allowFileUploads ? `
                <div class="file-upload-container">
                    <label for="chat-file-upload" class="file-upload-label" title="${settings.i18n.pt.fileUploadText}">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                            <polyline points="17 8 12 3 7 8"></polyline>
                            <line x1="12" y1="3" x2="12" y2="15"></line>
                        </svg>
                    </label>
                    <input type="file" id="chat-file-upload" class="file-upload-input" accept="${settings.acceptedFileTypes}">
                    <span class="file-name-display"></span>
                </div>
                ` : ''}
                <textarea class="chat-textarea" placeholder="${settings.i18n.pt.inputPlaceholder}" rows="1"></textarea>
                <button class="chat-submit">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M22 2L11 13"></path>
                        <path d="M22 2l-7 20-4-9-9-4 20-7z"></path>
                    </svg>
                </button>
            </div>
            <div class="chat-footer">
                <a class="chat-footer-link" href="${settings.branding.poweredBy.link}" target="_blank">
                    ${settings.branding.poweredBy.text}
                </a>
            </div>
        </div>
    `;

    // [Funções createSessionId, createTypingIndicator, linkifyText...]

    // Modified startChat function with custom welcome message
    function startChat() {
        conversationId = createSessionId();
        if (chatWelcome) chatWelcome.style.display = 'none';
        chatBody.classList.add('active');
        
        // Custom welcome message (same as your n8n original)
        const welcomeMessage = document.createElement('div');
        welcomeMessage.className = 'chat-bubble bot-bubble';
        welcomeMessage.innerHTML = `
            Olá! 😊 Eu sou seu assistente virtual especializado em energia solar. Confira o que posso fazer por você:<br><br>
            1. Responder dúvidas sobre energia solar ☀️<br>
            2. Agendar uma reunião no calendário 📅<br>
            3. Criar um chamado de suporte para falar com um atendente humano 👨‍💼<br>
            4. Analisar sua conta de luz e estimar quanto você pode economizar usando painéis solares 💡💰<br><br>
            Do que você precisa?
        `;
        messagesContainer.appendChild(welcomeMessage);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }

    // Modified submitMessage to handle file uploads
    async function submitMessage(messageText) {
        if (isWaitingForResponse) return;
        isWaitingForResponse = true;

        const fileInput = document.getElementById('chat-file-upload');
        const formData = new FormData();
        
        formData.append('action', 'sendMessage');
        formData.append('sessionId', conversationId);
        formData.append('route', settings.webhook.route);
        formData.append('chatInput', messageText);
        
        if (settings.allowFileUploads && fileInput.files.length > 0) {
            formData.append('file', fileInput.files[0]);
        }

        // [Rest of the message display and fetch logic...]
        
        // Clear file input after submission
        if (fileInput) {
            fileInput.value = '';
            const fileNameDisplay = document.querySelector('.file-name-display');
            if (fileNameDisplay) fileNameDisplay.textContent = '';
        }
    }

    // File upload change handler
    if (settings.allowFileUploads) {
        const fileInput = document.getElementById('chat-file-upload');
        if (fileInput) {
            fileInput.addEventListener('change', function(e) {
                const fileNameDisplay = document.querySelector('.file-name-display');
                if (this.files.length > 0) {
                    fileNameDisplay.textContent = this.files[0].name;
                } else {
                    fileNameDisplay.textContent = '';
                }
            });
        }
    }

    // Initialize chat automatically
    document.addEventListener('DOMContentLoaded', function() {
        startChat();
        
        // Hide start button if exists
        const startButton = document.querySelector('.chat-start-btn');
        if (startButton) startButton.style.display = 'none';
    });

    // [Rest of the event listeners...]
})();
