// Interactive Chat Widget for n8n
(function() {
    // Initialize widget only once
    if (window.N8nChatWidgetLoaded) return;
    window.N8nChatWidgetLoaded = true;

    // Load font resource - using Poppins for a fresh look
    const fontElement = document.createElement('link');
    fontElement.rel = 'stylesheet';
    fontElement.href = 'https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap';
    document.head.appendChild(fontElement);

    // Apply widget styles with a modern design approach
    const widgetStyles = document.createElement('style');
    widgetStyles.textContent = `
        .chat-assist-widget {
            --chat-color-primary: var(--chat-widget-primary, #97B4BB);
            --chat-color-secondary: var(--chat-widget-secondary, #187874);
            --chat-color-tertiary: var(--chat-widget-tertiary, #a1b3df);
            --chat-color-light: var(--chat-widget-light, #d4eaf9);
            --chat-color-surface: var(--chat-widget-surface, #ffffff);
            --chat-color-text: var(--chat-widget-text, #1f2937);
            --chat-color-text-light: var(--chat-widget-text-light, #6b7280);
            --chat-color-border: var(--chat-widget-border, #e5e7eb);
            --chat-shadow-sm: 0 1px 3px rgba(7, 247, 191, 0.1);
            --chat-shadow-md: 0 4px 6px rgba(7, 247, 191, 0.15);
            --chat-shadow-lg: 0 10px 15px rgba(7, 247, 191, 0.2);
            --chat-radius-sm: 8px;
            --chat-radius-md: 12px;
            --chat-radius-lg: 20px;
            --chat-radius-full: 9999px;
            --chat-transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            font-family: 'Poppins', sans-serif;
        }

        .chat-assist-widget .chat-window {
            position: fixed;
            bottom: 90px;
            z-index: 10000;
            width: 380px;
            height: 1030px;
            background: var(--chat-color-surface);
            border-radius: var(--chat-radius-lg);
            box-shadow: var(--chat-shadow-lg);
            border: 1px solid var(--chat-color-light);
            overflow: hidden;
            display: none;
            flex-direction: column;
            transition: var(--chat-transition);
            opacity: 0;
            transform: translateY(20px) scale(0.85);
        }

        .chat-assist-widget .chat-window.right-side {
            right: 20px;
        }

        .chat-assist-widget .chat-window.left-side {
            left: 20px;
        }

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
            padding: 1px;
        }

        .chat-assist-widget .chat-header-title {
            font-size: 16px;
            font-weight: 600;
            color: white;
        }

        .chat-assist-widget .chat-close-btn {
            position: absolute;
            right: 16px;
            top: 50%;
            transform: translateY(-50%);
            background: rgba(255, 255, 255, 0.2);
            border: none;
            color: white;
            cursor: pointer;
            padding: 4px;
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

        .chat-assist-widget .chat-body {
            display: none;
            flex-direction: column;
            height: 100%;
            overflow: hidden;
        }

        .chat-assist-widget .chat-body.active {
            display: flex;
        }
        
        .chat-assist-widget {
            --chat-widget-primarybubble: #3498db; /* Azul mais claro */
            --chat-widget-secondarybubble: #2980b9; /* Azul médio */
        }
        
        .chat-assist-widget .chat-messages {
            flex: 1;
            overflow-y: auto;
            padding: 20px;
            background: #f9fafb;
            display: flex;
            flex-direction: column;
            gap: 12px;
        }

        .chat-assist-widget .chat-messages::-webkit-scrollbar {
            width: 6px;
        }

        .chat-assist-widget .chat-messages::-webkit-scrollbar-track {
            background: transparent;
        }

        .chat-assist-widget .chat-messages::-webkit-scrollbar-thumb {
            background-color: rgba(16, 185, 129, 0.3);
            border-radius: var(--chat-radius-full);
        }
        
        .chat-assist-widget .file-name {
            font-size: 12px;
            color: #ffffff;
            margin-top: 4px;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
            max-width: 200px;
        }
        
        .chat-assist-widget .chat-bubble {
            max-width: calc(100% - 40px);
            padding: 12px 16px;
            margin: 0;
            border-radius: var(--chat-radius-md);
            max-width: 95%;
            word-wrap: break-word;
            font-size: 13px;
            line-height: 1.2;
            position: relative;
            display: block;
            align-items: flex-start;
            gap: 8px;
            white-space: pre-line;
        }

        .chat-assist-widget .chat-bubble.user-bubble {
            background: linear-gradient(135deg, var(--chat-widget-primarybubble) 0%, var(--chat-widget-secondarybubble) 100%);
            color: white;
            align-self: flex-end;
            border-bottom-right-radius: 4px;
            box-shadow: var(--chat-shadow-sm);
        }

        .chat-assist-widget .chat-bubble.bot-bubble {
            background: white;
            color: var(--chat-color-text);
            align-self: flex-start;
            border-bottom-left-radius: 4px;
            box-shadow: var(--chat-shadow-sm);
            border: 1px solid var(--chat-color-light);
        }

        .chat-assist-widget .message-icon {
            width: 28px;
            height: 28px;
            border-radius: 50%;
            flex-shrink: 0;
            margin-top: 4px;
        }
        
        .chat-assist-widget .timestamp {
            display: block;
            font-size: 10px;
            color: var(--chat-color-text-light);
            opacity: 0.7;
            margin-top: 4px;
        }

        .chat-assist-widget .message-container {
            display: flex;
            align-items: flex-start;
            gap: 8px;
            margin-bottom: 26px;
            width: 100%;
        }
        
        .chat-assist-widget .message-container.bot-message {
            justify-content: flex-start;
        }

        .chat-assist-widget .message-container.bot-message .timestamp {
            text-align: left;
            margin-left: 8px;
        }
        
        .chat-assist-widget .message-container.user-message {
            justify-content: flex-end;
        }

        .chat-assist-widget .message-container.user-message .timestamp {
            text-align: right;
            margin-right: 8px;
        }

        .chat-assist-widget .message-content {
            display: flex;
            flex-direction: column;
            max-width: calc(100% - 40px);
        }

        .chat-assist-widget .typing-indicator {
            display: flex;
            align-items: center;
            gap: 4px;
            padding: 14px 18px;
            background: white;
            border-radius: var(--chat-radius-md);
            border-bottom-left-radius: 4px;
            max-width: 80px;
            align-self: flex-start;
            box-shadow: var(--chat-shadow-sm);
            border: 1px solid var(--chat-color-light);
        }

        .chat-assist-widget .typing-dot {
            width: 8px;
            height: 8px;
            background: var(--chat-color-primary);
            border-radius: var(--chat-radius-full);
            opacity: 0.7;
            animation: typingAnimation 1.4s infinite ease-in-out;
        }

        .chat-assist-widget .typing-dot:nth-child(1) { animation-delay: 0s; }
        .chat-assist-widget .typing-dot:nth-child(2) { animation-delay: 0.2s; }
        .chat-assist-widget .typing-dot:nth-child(3) { animation-delay: 0.4s; }

        @keyframes typingAnimation {
            0%, 60%, 100% { transform: translateY(0); }
            30% { transform: translateY(-4px); }
        }

        .chat-assist-widget .chat-controls {
            padding: 12px;
            flex-shrink: 0;
            background: var(--chat-color-surface);
            border-top: 1px solid var(--chat-color-light);
            display: flex;
            gap: 10px;
            align-items: center; /* Align items for consistent height  */
        }

        .chat-assist-widget .file-upload-container {
            position: relative;
            display: flex;
            align-items: center;
        }

        .chat-assist-widget .file-upload-input {
            display: none;
        }

        .chat-assist-widget .file-upload-label {
            display: flex;
            align-items: center;
            justify-content: center;
            width: 48px; /* Changed size */
            height: 48px; /* Changed size */
            background: var(--chat-color-light);
            border-radius: var(--chat-radius-md);
            cursor: pointer;
            transition: var(--chat-transition);
        }

        .chat-assist-widget .file-upload-label:hover {
            background: var(--chat-color-primary);
            color: white;
        }

        .chat-assist-widget .file-upload-label svg {
            width: 22px; /* Adjusted icon size */
            height: 22px; /* Adjusted icon size */
        }

        .chat-assist-widget .chat-textarea {
            flex: 1;
            padding: 14px 16px;
            border: 1px solid var(--chat-color-light);
            border-radius: var(--chat-radius-md);
            background: var(--chat-color-surface);
            color: var(--chat-color-text);
            resize: none;
            font-family: inherit;
            font-size: 13px;
            line-height: 1.5;
            max-height: 120px;
            min-height: 48px;
            box-sizing: border-box; /* Ensures padding is included in height */
            transition: var(--chat-transition);
        }

        .chat-assist-widget .chat-textarea:focus {
            outline: none;
            border-color: var(--chat-color-primary);
            box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.2);
        }

        .chat-assist-widget .chat-textarea::placeholder {
            color: var(--chat-color-text-light);
        }

        .chat-assist-widget .chat-submit:hover {
          background: var(--chat-color-primary);
          color: white;
        }

        .chat-assist-widget .chat-submit svg {
            width: 24px;
            height: 24px;
        }

        .chat-assist-widget .chat-submit {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 48px; 
          height: 48px; 
          background: var(--chat-color-light);
          border-radius: var(--chat-radius-md);
          cursor: pointer;
          transition: var(--chat-transition);
        }
        
        .chat-assist-widget .chat-launcher {
            position: fixed;
            bottom: 20px;
            height: 56px;
            border-radius: var(--chat-radius-full);
            background: linear-gradient(135deg, var(--chat-color-primary) 0%, var(--chat-color-secondary) 100%);
            color: white;
            border: none;
            cursor: pointer;
            //box-shadow: var(--chat-shadow-md);
            z-index: 999;
            transition: var(--chat-transition);
            display: flex;
            align-items: center;
            padding: 0 20px 0 16px;
            gap: 8px;
        }

        .chat-assist-widget .chat-launcher.right-side {
            right: 20px;
        }

        .chat-assist-widget .chat-launcher.left-side {
            left: 20px;
        }

        .chat-assist-widget .chat-launcher:hover {
            transform: scale(1.05);
            box-shadow: var(--chat-shadow-lg);
        }

        .chat-assist-widget .chat-launcher svg {
            width: 24px;
            height: 24px;
        }
        
        .chat-assist-widget .chat-launcher-text {
            font-weight: 600;
            font-size: 15px;
            white-space: nowrap;
        }

        .chat-assist-widget .chat-footer {
            padding: 10px;
            text-align: center;
            background: var(--chat-color-surface);
            border-top: 1px solid var(--chat-color-light);
            flex-shrink: 0;
        }

        .chat-assist-widget .chat-footer-link {
            color: var(--chat-color-primary);
            text-decoration: none;
            font-size: 12px;
            opacity: 0.8;
            transition: var(--chat-transition);
            font-family: inherit;
        }

        .chat-assist-widget .chat-footer-link:hover {
            opacity: 1;
        }

        .chat-assist-widget .chat-link {
            color: var(--chat-color-primary);
            text-decoration: underline;
            word-break: break-all;
            transition: var(--chat-transition);
        }

        .chat-assist-widget .chat-link:hover {
            color: var(--chat-color-secondary);
        }

        .chat-assist-widget .chat-image {
            max-width: 100%;
            border-radius: var(--chat-radius-sm);
            margin-top: 8px;
            display: block;
            box-shadow: var(--chat-shadow-sm);
        }

        .chat-assist-widget .image-container {
            display: flex;
            flex-direction: column;
            gap: 4px;
        }

        .chat-assist-widget .image-caption {
            font-size: 12px;
            color: var(--chat-color-text-light);
            text-align: center;
        }

        .action-buttons-container {
            display: flex;
            flex-wrap: wrap;
            gap: 8px;
            margin-top: 12px;
        }
        
        .action-button {
            flex: 1 1 calc(50% - 4px);
            min-width: 120px;
            padding: 10px 12px;
            border: none;
            border-radius: 8px;
            cursor: pointer;
            font-weight: 500;
            font-size: 14px;
            transition: all 0.2s ease;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            display: flex;
            align-items: center;
            justify-content: center;
            opacity: 0.9;
        }
        
        .action-button:hover {
            transform: translateY(-2px);
            box-shadow: 0 4px 8px rgba(0,0,0,0.15);
            opacity: 1;
        }
        
        .blue-button {
            background-color: rgba(100, 149, 237, 0.7);
            color: white;
        }
        
        .green-button {
            background-color: rgba(144, 238, 144, 0.7);
            color: #333;
        }
        
        .orange-button {
            background-color: rgba(255, 182, 193, 0.7);
            color: #333;
        }
        
        .yellow-button {
            background-color: rgba(255, 255, 153, 0.7);
            color: #333;
        }

        .dynamic-buttons-container {
            display: flex;
            flex-wrap: wrap; 
            gap: 8px;
            margin-top: 12px;
            align-self: flex-start; 
        } 

        .dynamic-button {
            padding: 7px 9px;
            border: 1px solid var(--chat-color-light);
            border-radius: 6px;
            background-color: #f3f4f6;
            color: var(--chat-color-text);
            cursor: pointer;
            font-weight: 400;
            font-size: 13px;
            transition: all 0.2s ease;
            box-shadow: 0 2px 4px rgba(0,0,0,0.05);
            text-align: left;
            flex: 0 0 48%;
            box-sizing: border-box;
        }

        .dynamic-button:hover {
            background-color: var(--chat-color-primary);
            border-color: var(--chat-color-primary);
            color: white;
            transform: translateY(-1px);
            box-shadow: 0 4px 8px rgba(0,0,0,0.1);
        }

        @media (max-width: 1500px) {
            .chat-assist-widget .chat-window {
                width: 95vw !important;
                max-width: 400px !important;
                height: 60vh !important;
                bottom: 10px !important;
                left: 50% !important;
                transform: translateX(-50%) !important;
                border-radius: 16px !important;
                box-shadow: 0 10px 25px rgba(0,0,0,0.2);
            }
        }

        @media (max-width: 3200px) and (orientation: landscape) {
            .chat-assist-widget .chat-window {
                width: 65vw !important;
                max-width: 500px !important;
                height: 80vh !important;
                top: 50% !important;
                left: 50% !important;
                bottom: auto !important;
                transform: translate(-50%, -50%) !important;
                border-radius: 16px !important;
                box-shadow: 0 5px 30px rgba(0,0,0,0.15);
            }
        }
    `;
    document.head.appendChild(widgetStyles);

    // Default configuration
    const defaultSettings = {
        webhook: { url: '', route: '' },
        branding: {
            logo: '',
            name: 'Chat Assistant',
            welcomeText: 'Hello! How can I help you today?',
            responseTimeText: 'Responds in a few seconds',
            poweredBy: { text: 'Powered by Neureka AI', link: 'https://neureka-ai.com' }
        },
        style: {
            primaryColor: '#10b981',
            secondaryColor: '#059669',
            position: 'right',
            backgroundColor: '#ffffff',
            fontColor: '#1f2937'
        },
        suggestedQuestions: []
    };

    // Merge user settings with defaults
    const settings = window.ChatWidgetConfig ? {
        webhook: { ...defaultSettings.webhook, ...window.ChatWidgetConfig.webhook },
        branding: { ...defaultSettings.branding, ...window.ChatWidgetConfig.branding },
        style: { ...defaultSettings.style, ...window.ChatWidgetConfig.style },
        suggestedQuestions: window.ChatWidgetConfig.suggestedQuestions || defaultSettings.suggestedQuestions
    } : defaultSettings;

    // Session tracking
    let conversationId = '';
    let isWaitingForResponse = false;
    let isChatInitialized = false; // <-- New flag to track if chat has started

    // Create widget DOM structure
    const widgetRoot = document.createElement('div');
    widgetRoot.className = 'chat-assist-widget';
    
    // Apply custom colors from settings
    widgetRoot.style.setProperty('--chat-widget-primary', settings.style.primaryColor);
    widgetRoot.style.setProperty('--chat-widget-secondary', settings.style.secondaryColor);
    widgetRoot.style.setProperty('--chat-widget-surface', settings.style.backgroundColor);
    widgetRoot.style.setProperty('--chat-widget-text', settings.style.fontColor);

    // Create chat panel
    const chatWindow = document.createElement('div');
    chatWindow.className = `chat-window ${settings.style.position === 'left' ? 'left-side' : 'right-side'}`;
    
    // Create header HTML (removed the welcome screen part)
    const headerHTML = `
        <div class="chat-header">
            <img class="chat-header-logo" src="${settings.branding.logo}" alt="${settings.branding.name}">
            <span class="chat-header-title">${settings.branding.name}</span>
            <button class="chat-close-btn">×</button>
        </div>
    `;

    // Create main chat interface HTML (now active by default)
    const chatInterfaceHTML = `
        <div class="chat-body active">
            <div class="chat-messages"></div>
            <div class="chat-controls">
            <div class="file-upload-container">
                <label for="chat-file-upload" class="file-upload-label">
                                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"></path></svg>
                </label>
                <input type="file" id="chat-file-upload" class="file-upload-input" accept=".pdf,.doc,.docx,.jpg,.png,.jpeg,.gif">
            </div>
                <textarea class="chat-textarea" placeholder="Digite aqui..." rows="1"></textarea>
            <button class="chat-submit">
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                    <path fill-rule="evenodd" d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25Zm.53 5.47a.75.75 0 0 0-1.06 0l-3 3a.75.75 0 1 0 1.06 1.06l1.72-1.72v5.69a.75.75 0 0 0 1.5 0v-5.69l1.72 1.72a.75.75 0 1 0 1.06-1.06l-3-3Z" clip-rule="evenodd" />
                </svg>
            </button>
            </div>
            <div class="chat-footer">
                <a class="chat-footer-link" href="${settings.branding.poweredBy.link}" target="_blank">${settings.branding.poweredBy.text}</a>
            </div>
        </div>
    `;
    
    chatWindow.innerHTML = headerHTML + chatInterfaceHTML;
    
    // Create launcher button
    const launchButton = document.createElement('button');
    launchButton.className = `chat-launcher ${settings.style.position === 'left' ? 'left-side' : 'right-side'}`;
    launchButton.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path></svg>
        <span class="chat-launcher-text">Ajuda?</span>`;
    
    // Add elements to DOM
    widgetRoot.appendChild(chatWindow);
    widgetRoot.appendChild(launchButton);
    document.body.appendChild(widgetRoot);

    // Get DOM elements after they are created
    const messagesContainer = chatWindow.querySelector('.chat-messages');
    const messageTextarea = chatWindow.querySelector('.chat-textarea');
    const sendButton = chatWindow.querySelector('.chat-submit');
    const fileInput = chatWindow.querySelector('#chat-file-upload');
    const fileNameDisplay = chatWindow.querySelector('.file-name-display');

    // Helper to generate a unique session ID
    const createSessionId = () => crypto.randomUUID();

    // Helper to reset the file input after sending a message
    const resetFileInput = () => {
        fileInput.value = '';
        if (fileNameDisplay) fileNameDisplay.textContent = '';
        // No need to reset background color as it's not being set anymore
    };

    // Helper to create the "typing..." animation element
    const createTypingIndicator = () => {
        const indicator = document.createElement('div');
        indicator.className = 'typing-indicator';
        indicator.innerHTML = `<div class="typing-dot"></div><div class="typing-dot"></div><div class="typing-dot"></div>`;
        return indicator;
    };

    // Helper to convert URLs in text to clickable links
    const linkifyText = (text) => {
        const urlPattern = /(\b(https?|ftp):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/gim;
        return text.replace(urlPattern, url => `<a href="${url}" target="_blank" rel="noopener noreferrer" class="chat-link">${url}</a>`);
    };

    // Helper to detect and render images from URLs in the text
    const renderImages = (text) => {
        const imgPattern = /(https?:\/\/.*\.(?:png|jpg|jpeg|gif|webp|svg)(?:\?\S*)?)/gi;
        return text.replace(imgPattern, url => `<div class="image-container"><img src="${url}" class="chat-image" alt="Image from link"><span class="image-caption">Image</span></div>`);
    };
    
    // Helper to render basic markdown
    const renderMarkdown = (text) => {
        return text
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') // Bold
            .replace(/\*(.*?)\*/g, '<em>$1</em>')       // Italic
            .replace(/^- (.*)$/gm, '<li>$1</li>');     // List items
    };

    // Function to add the calendar iframe to the conversation
    const addCalendarToChat = () => {
        const iframeContainer = document.createElement('div');
        iframeContainer.className = 'message-container bot-message';
        iframeContainer.innerHTML = `
            <img src="https://cdn-icons-png.flaticon.com/512/4712/4712035.png" class="message-icon" alt="Chatbot">
            <div class="message-content">
                <div class="chat-bubble bot-bubble">
                    <iframe 
                        src="https://calendar.app.google/tps9rXCFtW3VUoiBA" 
                        width="470" height="1800" frameborder="0" 
                        style="border-radius: 8px; margin-top: 8px;">
                    </iframe>
                </div>
                <span class="timestamp">${new Date().toLocaleString('pt-BR')}</span>
            </div>
        `;
        messagesContainer.appendChild(iframeContainer);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    };

    // Function to show the dynamic buttons for different doubt topics
    const showDoubtTopics = () => {
        const botFollowUpContainer = document.createElement('div');
        botFollowUpContainer.className = 'message-container bot-message';
        botFollowUpContainer.innerHTML = `
            <img src="https://cdn-icons-png.flaticon.com/512/4712/4712035.png" class="message-icon" alt="Chatbot">
            <div class="message-content">
                <div class="chat-bubble bot-bubble">
                    <p>Sobre qual tópico você tem dúvidas? Escolha uma opção abaixo:</p>
                    <div class="dynamic-buttons-container">
                        <button class="dynamic-button" data-topic="Energia Solar">Energia Solar</button>
                        <button class="dynamic-button" data-topic="Sistema Fotovoltaico">Sistema Fotovoltaico</button>
                        <button class="dynamic-button" data-topic="Componentes Solares">Componentes Solares</button>
                        <button class="dynamic-button" data-topic="Benefícios Solares">Benefícios Solares</button>
                        <button class="dynamic-button" data-topic="Vida Útil">Vida Útil</button>
                        <button class="dynamic-button" data-topic="Retorno Investimento">Retorno Investimento</button>
                        <button class="dynamic-button" data-topic="Conta Luz">Conta Luz</button>
                        <button class="dynamic-button" data-topic="Manutenção Sistema">Manutenção Sistema</button>
                        <button class="dynamic-button" data-topic="Compensação Energia">Compensação Energia</button>
                        <button class="dynamic-button" data-topic="Tipos de Sistemas">Tipos de Sistemas</button>
                        <button class="dynamic-button" data-topic="Espaço da Instalação">Espaço da Instalação</button>
                        <button class="dynamic-button" data-topic="Falta de Energia">Falta de Energia</button>
                        <button class="dynamic-button" data-topic="Off-grid, On-grid e Híbrido">Off-grid e Híbrido</button>
                        <button class="dynamic-button" data-topic="Clima e Sujeira">Clima e Sujeira</button>
                        <button class="dynamic-button" data-topic="Tempo de Payback">Tempo de Payback</button>
                        <button class="dynamic-button" data-topic="Créditos por Residência">Créditos por Residência</button>
                        <button class="dynamic-button" data-topic="Incentivos Fiscais">Incentivos Fiscais</button>
                        <button class="dynamic-button" data-topic="Impacto Posição">Impacto Posição</button>
                        <button class="dynamic-button" data-topic="O que é eletromobilidade?">O que é eletromobilidade?</button>
                        <button class="dynamic-button" data-topic="Estação de Recarga">Estação de Recarga</button>
                        <button class="dynamic-button" data-topic="Recarga Solar">Recarga Solar</button>
                        <button class="dynamic-button" data-topic="Benefícios Eletromobilidade">Benefícios Eletromobilidade</button>
                    </div>
                </div>
                <span class="timestamp">${new Date().toLocaleString('pt-BR')}</span>
            </div>
        `;
        messagesContainer.appendChild(botFollowUpContainer);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;

        // Add event listeners to the new dynamic buttons
        botFollowUpContainer.querySelectorAll('.dynamic-button').forEach(btn => {
            btn.addEventListener('click', () => {
                submitMessage(btn.dataset.topic);
            });
        });
    };

    // Main function to start the chat and display the initial message
    const startChat = () => {
        conversationId = createSessionId();
        
        const welcomeContainer = document.createElement('div');
        welcomeContainer.className = 'message-container bot-message';
        welcomeContainer.innerHTML = `
            <img src="https://cdn-icons-png.flaticon.com/512/4712/4712035.png" class="message-icon" alt="Chatbot">
            <div class="message-content">
                <div class="chat-bubble bot-bubble">
                    <p>Olá! 😊 Eu sou seu assistente virtual especializado em energia solar. Confira o que posso fazer por você:<br>
                    1. Responder dúvidas sobre energia solar ☀️<br>
                    2. Agendar uma reunião no calendário 📅<br>
                    3. Criar um chamado para falar com alguém 👨‍💼<br>
                    4. Analisar sua conta de luz e estimar quanto você pode economizar usando painéis solares 💡💰<br>
                    Do que você precisa?</p>
                    <div class="action-buttons-container">
                        <button class="action-button blue-button" data-action="Dúvida">Dúvida</button>
                        <button class="action-button green-button" data-action="Agendamento">Agendamento</button>
                        <button class="action-button orange-button" data-action="Ticket">Ticket</button>
                        <button class="action-button yellow-button" data-action="Energia">Energia</button>
                    </div>
                </div>
                <span class="timestamp">${new Date().toLocaleString('pt-BR')}</span>
            </div>
        `;
        messagesContainer.appendChild(welcomeContainer);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;

        // Add event listeners to the initial action buttons
        welcomeContainer.querySelectorAll('.action-button').forEach(button => {
            button.addEventListener('click', () => {
                const action = button.dataset.action;
                if (action === 'Dúvida') {
                    submitMessage('Dúvida', true); // Send user message first
                    showDoubtTopics(); // Then show options
                } else if (action === 'Agendamento') {
                    submitMessage('Agendamento');
                    addCalendarToChat();
                } else {
                    const messageMap = {
                        'Ticket': 'Ticket de suporte',
                        'Energia': 'Análise de energia'
                    };
                    submitMessage(messageMap[action] || action);
                }
            });
        });
    };

    // Function to handle sending a message (user or internal)
    async function submitMessage(messageText, isInternal = false) {
        if (isWaitingForResponse && !isInternal) return;
        
        const trimmedMessage = messageText.trim();
        if (!trimmedMessage && fileInput.files.length === 0) return;

        // Display user message bubble
        const userMessageContainer = document.createElement('div');
        userMessageContainer.className = 'message-container user-message';
        let fileInfo = fileInput.files.length > 0 ? `<div class="file-name">Arquivo: ${fileInput.files[0].name}</div>` : '';
        
        userMessageContainer.innerHTML = `
            <div class="message-content">
                <div class="chat-bubble user-bubble">
                    <p>${renderImages(trimmedMessage)}</p>
                    ${fileInfo}
                </div>
                <span class="timestamp">${new Date().toLocaleString('pt-BR')}</span>
            </div>
            <img src="https://cdn-icons-png.flaticon.com/512/4202/4202836.png" class="message-icon" alt="Usuário">
        `;
        messagesContainer.appendChild(userMessageContainer);
        
        if (!isInternal) {
            messageTextarea.value = '';
            autoResizeTextarea();
        }

        // Show typing indicator and scroll down
        let typingIndicator;
        if (!isInternal) {
            isWaitingForResponse = true;
            typingIndicator = createTypingIndicator();
            messagesContainer.appendChild(typingIndicator);
        }
        messagesContainer.scrollTop = messagesContainer.scrollHeight;

        // Prepare data for webhook
        const formData = new FormData();
        formData.append('action', 'sendMessage');
        formData.append('sessionId', conversationId);
        formData.append('route', settings.webhook.route);
        formData.append('chatInput', trimmedMessage);
        if (fileInput.files.length > 0) {
            formData.append('file', fileInput.files[0]);
        }

        // Do not send to webhook if it's an internal action (like showing topics)
        if (isInternal) {
            resetFileInput();
            return;
        }

        try {
            const response = await fetch(settings.webhook.url, {
                method: 'POST',
                body: formData
            });
            const responseData = await response.json();
            
            // Remove typing indicator
            if (typingIndicator) messagesContainer.removeChild(typingIndicator);

            // Display bot response
            const rawResponse = Array.isArray(responseData) ? responseData[0].output : responseData.output;
            let processedResponse = renderMarkdown(rawResponse);
            processedResponse = renderImages(processedResponse);
            processedResponse = linkifyText(processedResponse);

            const botMessageContainer = document.createElement('div');
            botMessageContainer.className = 'message-container bot-message';
            botMessageContainer.innerHTML = `
                <img src="https://cdn-icons-png.flaticon.com/512/4712/4712035.png" class="message-icon" alt="Chatbot">
                <div class="message-content">
                    <div class="chat-bubble bot-bubble">
                        <p>${processedResponse}</p>
                    </div>
                    <span class="timestamp">${new Date().toLocaleString('pt-BR')}</span>
                </div>
            `;
            messagesContainer.appendChild(botMessageContainer);

        } catch (error) {
            console.error('Chat Widget Error:', error);
            if (typingIndicator) messagesContainer.removeChild(typingIndicator);
            // Display error message in chat
            const errorMessage = document.createElement('div');
            errorMessage.className = 'message-container bot-message';
            errorMessage.innerHTML = `<p class="chat-bubble bot-bubble">Desculpe, ocorreu um erro. Tente novamente.</p>`;
            messagesContainer.appendChild(errorMessage);
        } finally {
            isWaitingForResponse = false;
            resetFileInput();
            messagesContainer.scrollTop = messagesContainer.scrollHeight;
        }
    }

    // --- Event Listeners ---

    // Toggle chat window visibility and start chat on first open
    launchButton.addEventListener('click', () => {
        chatWindow.classList.toggle('visible');
        if (chatWindow.classList.contains('visible') && !isChatInitialized) {
            startChat();
            isChatInitialized = true;
        }
    });

    // Close chat window
    chatWindow.querySelector('.chat-close-btn').addEventListener('click', () => chatWindow.classList.remove('visible'));
    
    // Handle file selection
    fileInput.addEventListener('change', () => {
        if (fileInput.files.length > 0) {
            fileNameDisplay.textContent = fileInput.files[0].name;
            messageTextarea.focus();
        }
    });
    
    // Send message on button click
    sendButton.addEventListener('click', () => submitMessage(messageTextarea.value));
    
    // Send message on Enter key press (but not Shift+Enter)
    messageTextarea.addEventListener('keypress', (event) => {
        if (event.key === 'Enter' && !event.shiftKey) {
            event.preventDefault();
            submitMessage(messageTextarea.value);
        }
    });
 
    // Auto-resize textarea height based on content
    function autoResizeTextarea() {
        messageTextarea.style.height = 'auto';
        const newHeight = Math.min(messageTextarea.scrollHeight, 120);
        messageTextarea.style.height = `${newHeight}px`;
    }
    
// Versão minimizada testada - cole no final do seu arquivo
    
    // Adjust textarea size on input
    messageTextarea.addEventListener('input', autoResizeTextarea);

})();
