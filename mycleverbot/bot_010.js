// Chat Widget for CorrectMe - German Learning Assistant
(function() {
    'use strict';

    // Add widget styles
    const widgetStyles = document.createElement('style');
    widgetStyles.textContent = `
        .chat-assist-widget {
            --chat-color-primary: #6b21a8;
            --chat-color-secondary: #4c1d95;
            --chat-color-accent: #7c3aed;
            --chat-radius-sm: 8px;
            --chat-radius-md: 12px;
            --chat-radius-lg: 16px;
            --chat-radius-full: 50%;
            --chat-transition: all 0.3s ease;
            --chat-shadow: 0 4px 20px rgba(107, 33, 168, 0.15);
            --chat-shadow-hover: 0 8px 30px rgba(107, 33, 168, 0.25);
        }

        .chat-assist-widget * {
            box-sizing: border-box;
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
            border: 1px solid rgba(107, 33, 168, 0.1);
        }

        .chat-assist-widget .chat-window.active {
            display: flex;
        }

        .chat-assist-widget .chat-header {
            padding: 16px;
            display: flex;
            align-items: center;
            gap: 12px;
            background: linear-gradient(135deg, #6b21a8 0%, #4c1d95 50%, #7c3aed 100%);
            color: white;
            position: relative;
            flex-shrink: 0;
            box-shadow: 0 4px 20px rgba(107, 33, 168, 0.3);
        }

        .chat-assist-widget .chat-header-logo {
            width: 240px;
            height: 120px;
            border-radius: var(--chat-radius-sm);
            object-fit: contain;
            background: transparent;
            padding: 0;
            filter: brightness(0) invert(1); /* Torna o logo branco para contrastar com o fundo roxo */
        }

        .chat-assist-widget .chat-header-title {
            font-size: 18px;
            font-weight: 700;
            color: white;
            text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
            letter-spacing: 0.5px;
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
            --chat-widget-primarybubble: #6b21a8;
            --chat-widget-secondarybubble: #4c1d95;
        }
        
        .chat-assist-widget .chat-messages {
            flex: 1;
            overflow-y: auto;
            padding: 20px 10px;
            background: #f9fafb;
            display: flex;
            flex-direction: column;
            gap: 12px;
            min-height: 300px;
        }

        .chat-assist-widget .chat-messages::-webkit-scrollbar {
            width: 6px;
        }

        .chat-assist-widget .chat-messages::-webkit-scrollbar-track {
            background: transparent;
        }

        .chat-assist-widget .chat-messages::-webkit-scrollbar-thumb {
            background-color: rgba(107, 33, 168, 0.3);
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

        .chat-assist-widget .message-container {
            display: flex;
            gap: 8px;
            align-items: flex-start;
            max-width: 100%;
        }

        .chat-assist-widget .message-container.user-message {
            flex-direction: row-reverse;
        }

        .chat-assist-widget .message-icon {
            width: 36px;
            height: 36px;
            border-radius: var(--chat-radius-full);
            object-fit: cover;
            flex-shrink: 0;
            border: 2px solid rgba(107, 33, 168, 0.1);
        }

        .chat-assist-widget .message-content {
            flex: 1;
            min-width: 0;
        }

        .chat-assist-widget .chat-bubble {
            padding: 12px 16px;
            border-radius: var(--chat-radius-md);
            max-width: 100%;
            word-wrap: break-word;
            line-height: 1.4;
            font-size: 14px; /* AJUSTE DE FONTE PARA TUTOR E ALUNO */
        }

        .chat-assist-widget .bot-bubble {
            background: linear-gradient(135deg, #fdf2f8, #fce7f3);
            color: #4c1d95;
            box-shadow: 0 2px 8px rgba(107, 33, 168, 0.1);
        }

        .chat-assist-widget .user-bubble {
            background: linear-gradient(135deg, #fefce8, #fef9c3);
            color: #92400e;
            border: none;
        }

        .chat-assist-widget .timestamp {
            font-size: 11px;
            color: #9ca3af;
            margin-top: 4px;
            display: block;
        }

        .chat-assist-widget .chat-controls {
            padding: 15px;
            background: white;
            border-top: 1px solid #e5e7eb;
            display: flex;
            gap: 8px;
            align-items: flex-end;
        }

        .chat-assist-widget .file-upload-container {
            position: relative;
            display: flex;
            align-items: center;
        }

        .chat-assist-widget .file-upload-label {
            width: 40px;
            height: 40px;
            background: linear-gradient(135deg, #6b21a8, #4c1d95);
            border: none;
            border-radius: var(--chat-radius-full);
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            transition: var(--chat-transition);
            flex-shrink: 0;
        }

        .chat-assist-widget .file-upload-label:hover {
            transform: scale(1.05);
            box-shadow: 0 4px 12px rgba(107, 33, 168, 0.3);
        }

        .chat-assist-widget .file-upload-label svg {
            width: 18px;
            height: 18px;
        }

        .chat-assist-widget .file-upload-input {
            display: none;
        }

        .chat-assist-widget .chat-textarea {
            flex: 1;
            border: 1px solid #d1d5db;
            border-radius: var(--chat-radius-md);
            padding: 12px 16px;
            resize: none;
            font-family: inherit;
            font-size: 14px;
            line-height: 1.4;
            max-height: 120px;
            min-height: 40px;
            transition: var(--chat-transition);
        }

        .chat-assist-widget .chat-textarea:focus {
            outline: none;
            border-color: #6b21a8;
            box-shadow: 0 0 0 3px rgba(107, 33, 168, 0.1);
        }

        .chat-assist-widget .chat-submit {
            width: 40px;
            height: 40px;
            background: linear-gradient(135deg, #6b21a8, #4c1d95);
            border: none;
            border-radius: var(--chat-radius-full);
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            transition: var(--chat-transition);
            flex-shrink: 0;
        }

        .chat-assist-widget .chat-submit:hover {
            transform: scale(1.05);
            box-shadow: 0 4px 12px rgba(107, 33, 168, 0.3);
        }

        .chat-assist-widget .chat-submit:disabled {
            opacity: 0.6;
            cursor: not-allowed;
            transform: none;
        }

        .chat-assist-widget .chat-submit svg {
            width: 18px;
            height: 18px;
        }

        .chat-assist-widget .chat-footer {
            padding: 10px 15px;
            background: #f9fafb;
            border-top: 1px solid #e5e7eb;
            text-align: center;
        }

        .chat-assist-widget .chat-footer-link {
            color: #6b7280;
            text-decoration: none;
            font-size: 12px;
            transition: var(--chat-transition);
        }

        .chat-assist-widget .chat-footer-link:hover {
            color: #6b21a8;
        }

        .chat-assist-widget .chat-launcher {
            position: fixed;
            bottom: 20px;
            right: 20px;
            width: auto;
            height: 50px;
            background: linear-gradient(135deg, #6b21a8, #4c1d95, #7c3aed);
            border: none;
            border-radius: 25px;
            cursor: pointer;
            display: flex;
            align-items: center;
            gap: 8px;
            padding: 0 20px 0 15px;
            color: white;
            font-weight: 600;
            box-shadow: var(--chat-shadow);
            transition: var(--chat-transition);
            z-index: 9999;
        }

        .chat-assist-widget .chat-launcher:hover {
            transform: translateY(-2px);
            box-shadow: var(--chat-shadow-hover);
        }

        .chat-assist-widget .chat-launcher svg {
            width: 20px;
            height: 20px;
        }

        .chat-assist-widget .chat-launcher-text {
            font-size: 14px;
            white-space: nowrap;
        }

        .chat-assist-widget .action-buttons-container {
            display: flex;
            flex-direction: column;
            gap: 8px;
            margin-top: 12px;
        }

        .chat-assist-widget .action-button {
            background: linear-gradient(135deg, #f8bbd0, #f06292); /* COR DOS BOTÕES ALTERADA PARA ROSA SUAVE */
            color: white;
            border: none;
            padding: 12px 16px;
            border-radius: var(--chat-radius-md);
            cursor: pointer;
            font-weight: 600;
            transition: var(--chat-transition);
            text-align: center;
            min-width: 120px;
        }

        .chat-assist-widget .action-button:hover {
            transform: translateY(-1px);
            box-shadow: 0 4px 12px rgba(240, 98, 146, 0.3); /* SOMBRA DOS BOTÕES ALTERADA PARA ROSA SUAVE */
        }

        .chat-assist-widget .dynamic-buttons-container {
            display: flex;
            flex-wrap: wrap;
            gap: 6px;
            margin-top: 12px;
            max-height: 200px;
            overflow-y: auto;
            padding-right: 4px;
        }

        .chat-assist-widget .dynamic-button {
            background: linear-gradient(135deg, #f3f4f6, #e5e7eb);
            color: #374151;
            border: 1px solid #d1d5db;
            padding: 8px 12px;
            border-radius: var(--chat-radius-sm);
            cursor: pointer;
            font-size: 12px;
            transition: var(--chat-transition);
            flex: 0 0 calc(50% - 3px);
            max-height: 60px;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
        }

        .chat-assist-widget .dynamic-button:hover {
            background: linear-gradient(135deg, #f8bbd0, #f06292); /* EFEITO HOVER DOS TÓPICOS ALTERADO PARA ROSA SUAVE */
            color: white;
            border-color: #f06292;
            transform: translateY(-2px) scale(1.02);
            box-shadow: 0 2px 8px rgba(240, 98, 146, 0.2);
        }

        .chat-assist-widget .dynamic-buttons-container::-webkit-scrollbar {
            width: 4px;
        }

        .chat-assist-widget .dynamic-buttons-container::-webkit-scrollbar-track {
            background: transparent;
        }

        .chat-assist-widget .dynamic-buttons-container::-webkit-scrollbar-thumb {
            background-color: rgba(107, 33, 168, 0.3);
            border-radius: var(--chat-radius-full);
        }

        /* Responsive Design */
        @media (max-width: 768px) {
            .chat-assist-widget .chat-window {
                width: 95vw !important;
                height: 80vh !important;
                bottom: 80px !important;
                right: 2.5vw !important;
                left: 2.5vw !important;
            }
            
            .chat-assist-widget .chat-header {
                padding: 12px !important;
            }
            
            .chat-assist-widget .chat-header-logo {
                width: 150px !important;
                height: 75px !important;
            }
            
            .chat-assist-widget .chat-header-title {
                font-size: 16px !important;
            }
            
            .chat-assist-widget .chat-messages {
                padding: 15px 8px !important;
            }
            
            .chat-assist-widget .chat-controls {
                padding: 10px !important;
            }
            
            .chat-assist-widget .chat-textarea {
                padding: 12px 14px !important;
                font-size: 12px !important;
                min-height: 44px !important;
            }
            
            .chat-assist-widget .file-upload-label {
                width: 44px !important;
                height: 44px !important;
            }
            
            .chat-assist-widget .chat-submit {
                width: 44px !important;
                height: 44px !important;
            }
            
            .dynamic-buttons-container {
                max-height: 300px !important;
                gap: 4px !important;
            }
            
            .dynamic-button {
                padding: 5px 6px !important;
                font-size: 10px !important;
                flex: 0 0 49% !important;
            }
            
            .action-button {
                padding: 8px 10px !important;
                font-size: 12px !important;
                min-width: 100px !important;
            }
        }

        @media (max-width: 480px) {
            .chat-assist-widget .chat-window {
                width: 98vw !important;
                height: 85vh !important;
                bottom: 70px !important;
            }
            
            .chat-assist-widget .chat-launcher {
                bottom: 10px !important;
                right: 10px !important;
                height: 45px !important;
                padding: 0 12px 0 10px !important;
            }
            
            .chat-assist-widget .chat-launcher-text {
                font-size: 12px !important;
            }
            
            .dynamic-button {
                flex: 0 0 100% !important;
                font-size: 11px !important;
            }
            
            .action-button {
                flex: 1 1 100% !important;
                margin-bottom: 8px !important;
            }
        }

        @media (max-width: 3200px) and (orientation: landscape) {
            .chat-assist-widget .chat-window {
                width: 65vw !important;
                max-width: 500px !important;
                height: 80vh !important;
                top: auto !important;
                left: auto !important;
                bottom: 80px !important;
                right: 20px !important;
                transform: none !important;
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
            logo: 'https://neureka-ai.com/wp-content/uploads/2025/08/LogobrancofundoTransparentev1.png',
            name: 'Do erro à excelência, palavra por palavra',
            welcomeText: 'Hallo! Wie kann ich dir heute helfen?',
            responseTimeText: 'Antwortet in wenigen Sekunden',
            poweredBy: { text: 'Powered by My Clever Bot', link: '#' }
        },
        style: {
            primaryColor: '#6b21a8',
            secondaryColor: '#4c1d95',
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
    let isChatInitialized = false;

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
    
    // Create header HTML
    const headerHTML = `
        <div class="chat-header">
            <img class="chat-header-logo" src="${settings.branding.logo}" alt="${settings.branding.name}">
            <span class="chat-header-title">${settings.branding.name}</span>
            <button class="chat-close-btn">×</button>
        </div>
    `;

    // Create main chat interface HTML
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
                <textarea class="chat-textarea" placeholder="Schreibe hier... / Digite aqui..." rows="1"></textarea>
                    <button class="chat-submit">
                        <svg xmlns="http://www.w3.org/2000/svg" 
                                viewBox="0 0 24 24" 
                                fill="none" 
                                stroke="currentColor" 
                                stroke-width="2" 
                                stroke-linecap="round" 
                                stroke-linejoin="round">
                            <path d="M22 2L11 13" />
                            <path d="M22 2L15 22L11 13L2 9L22 2Z" />
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
        <span class="chat-launcher-text">Deutsch lernen?</span>`;
    
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

    // Helper to render markdown safely
    const renderMarkdown = (text) => {
        if (typeof window.renderMarkdown === 'function') {
            return window.renderMarkdown(text);
        }
        return text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                   .replace(/\*(.*?)\*/g, '<em>$1</em>')
                   .replace(/\n/g, '<br>');
    };

    // Helper to render images
    const renderImages = (text) => {
        return text.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1" style="max-width: 100%; height: auto; border-radius: 8px; margin: 8px 0;">');
    };

    // Helper to make links clickable
    const linkifyText = (text) => {
        return text.replace(/(https?:\/\/[^\s]+)/g, '<a href="$1" target="_blank" style="color: #6b21a8; text-decoration: underline;">$1</a>');
    };

    // Function to send message to n8n workflow based on topic type
    const sendToN8nWorkflow = async (messageText, workflowType) => {
        const formData = new FormData();
        formData.append('action', 'sendMessage');
        formData.append('sessionId', conversationId);
        formData.append('chatInput', messageText);
        formData.append('workflowType', workflowType); // 'gramaticaflow' or 'treinoflow'

        if (fileInput.files.length > 0) {
            formData.append('file', fileInput.files[0]);
        }

        try {
            const response = await fetch(settings.webhook.url, {
                method: 'POST',
                body: formData
            });
            const responseData = await response.json();

            // Display bot response
            const rawResponse = Array.isArray(responseData) ? responseData[0].output : responseData.output;
            let processedResponse = renderMarkdown(rawResponse);
            processedResponse = renderImages(processedResponse);
            processedResponse = linkifyText(processedResponse);

            const botMessageContainer = document.createElement('div');
            botMessageContainer.className = 'message-container bot-message';
            botMessageContainer.innerHTML = `
                <img src="https://cdn-icons-png.flaticon.com/512/4140/4140047.png" class="message-icon" alt="CorrectMe Assistant">
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
            // Display error message in chat
            const errorMessage = document.createElement('div');
            errorMessage.className = 'message-container bot-message';
            errorMessage.innerHTML = `<p class="chat-bubble bot-bubble">Desculpe, ocorreu um erro. Tente novamente.</p>`;
            messagesContainer.appendChild(errorMessage);
        }
    };

    // Function to show grammar topics (68 items)
    const showGrammarTopics = () => {
        const grammarTopics = [
            "1. O Alfabeto (ä, ö, ü, ß)",
            "2. Gênero (Genus)",
            "3. Declinação de Substantivos",
            "4. Verbos",
            "5. Preposições",
            "6. Pronomes Pessoais",
            "7. Conjugação de Verbos",
            "8. Os Verbos 'haben' e 'sein'",
            "9. Verbos Separáveis e Inseparáveis",
            "10. Estrutura Verbal",
            "11. Verbos Modais",
            "12. Infinitivo sem 'zu'",
            "13. Verbos Reflexivos",
            "14. Verbos Recíprocos",
            "15. Presente (Gegenwart)",
            "16. Perfeito (Vergangenheit)",
            "17. Particípio II",
            "18. 'Sein' e 'haben' no Perfeito e Präteritum",
            "19. Verbos Modais no Perfeito e Präteritum",
            "20. Futuro I (Zukunft)",
            "21. Sintaxe",
            "22. Conjunções",
            "23. Subjunções",
            "24. Advérbios Conjuntivos",
            "25. Orações Relativas",
            "26. Orações de Infinitivo",
            "27. Elementos da Frase",
            "28. Regra de Construção de Frases",
            "29. Tendências de Construção",
            "30. Negação",
            "31. Declinação de Adjetivos",
            "32. Grau Comparativo de Adjetivos",
            "33. Comparação",
            "34. Substantivação de Adjetivos",
            "35. Präteritum",
            "36. Plusquamperfekt",
            "37. Futuro II",
            "38. Visão Geral dos Tempos",
            "39. Voz Passiva",
            "40. Konjunktiv I",
            "41. Konjunktiv II",
            "42. Tempos do Konjunktiv",
            "43. Outros Temas Gramaticais Centrais",
            "44. Imperativo",
            "45. Discurso Direto e Indireto",
            "46. Pronomes Indefinidos",
            "47. Pronomes Interrogativos",
            "48. Pronomes Demonstrativos",
            "49. Explicação das Partículas",
            "50. Partículas Modais",
            "51. O Pronome Indefinido 'man'",
            "52. O Impessoal 'es'",
            "53. Numerais Cardinais",
            "54. Numerais Ordinais",
            "55. Numerais Iterativos",
            "56. Numerais Multiplicativos",
            "57. Frações",
            "58. Numerais Coletivos",
            "59. Numerais de Espécie",
            "60. Numerais Indefinidos",
            "61. Sintaxe Avançada e Aspectos Estilísticos",
            "62. Palavras Compostas",
            "63. Tipos de Frases",
            "64. Forma Progressiva",
            "65. Explicações Avançadas",
            "66. Erros Frequentes",
            "67. Artigo Zero",
            "68. 'Viel' e 'wenig'"
        ];

        const botFollowUpContainer = document.createElement('div');
        botFollowUpContainer.className = 'message-container bot-message';
        
        let buttonsHTML = '';
        grammarTopics.forEach(topic => {
            buttonsHTML += `<button class="dynamic-button" data-topic="${topic}">${topic}</button>`;
        });

        botFollowUpContainer.innerHTML = `
            <img src="https://cdn-icons-png.flaticon.com/512/4140/4140047.png" class="message-icon" alt="CorrectMe Assistant">
            <div class="message-content">
                <div class="chat-bubble bot-bubble">
                    <p>Escolha um tópico gramatical para estudar:</p>
                    <div class="dynamic-buttons-container">
                        ${buttonsHTML}
                    </div>
                </div>
                <span class="timestamp">${new Date().toLocaleString('pt-BR')}</span>
            </div>
        `;
        messagesContainer.appendChild(botFollowUpContainer);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;

        // Add event listeners to the grammar buttons
        botFollowUpContainer.querySelectorAll('.dynamic-button').forEach(btn => {
            btn.addEventListener('click', () => {
                submitMessage(btn.dataset.topic);
            });
        });
    };

    // Function to show conversation topics (50 items)
    const showConversationTopics = () => {
        const conversationTopics = [
            "Apresentações pessoais (nome, nacionalidade, profissão)",
            "Alfabeto e soletração",
            "Números, datas e horas",
            "Família e relações pessoais",
            "Cores e objetos do dia a dia",
            "Profissões e local de trabalho",
            "Países, línguas e nacionalidades",
            "Hobbies e tempo livre",
            "Comidas e bebidas (em casa e no restaurante)",
            "Compras no supermercado ou loja",
            "Moradia e descrição da casa/apartamento",
            "Transporte e meios de locomoção",
            "Dar direções e perguntar caminhos",
            "Dias da semana e rotinas diárias",
            "Clima e estações do ano",
            "Planejar viagens e férias",
            "Atividades culturais (cinema, museu, teatro)",
            "Saúde e doenças simples (ir ao médico, sintomas)",
            "Festas e celebrações (aniversário, feriados)",
            "Escrever e-mails e cartas simples",
            "Vida escolar e universitária",
            "Rotina de trabalho e entrevistas de emprego",
            "Mídia e tecnologia básica (telefone, computador)",
            "Compras online e reclamações",
            "Descrições físicas e de personalidade",
            "Animais de estimação e natureza",
            "Esportes e hábitos saudáveis",
            "Erros comuns e mal-entendidos",
            "Tradições e costumes em países de língua alemã",
            "Sonhos e planos para o futuro",
            "Vida em diferentes países e culturas",
            "Educação e sistema escolar alemão",
            "Meio ambiente e sustentabilidade",
            "Problemas do cotidiano (roubo, perda, acidentes)",
            "Tecnologia e redes sociais",
            "Entrevistas e currículos profissionais",
            "Voluntariado e engajamento social",
            "Expressar sentimentos e opiniões",
            "Histórias de vida e biografias",
            "Contar experiências passadas com detalhes",
            "Discussões sobre política e sociedade",
            "Trabalho e economia (mercado de trabalho, carreira)",
            "Ciência e inovação tecnológica",
            "Mídia e fake news",
            "Mudança climática e problemas globais",
            "Imigração e multiculturalismo",
            "Arte, literatura e música",
            "Filosofia cotidiana e dilemas morais",
            "Estilo de vida saudável e nutrição consciente",
            "Tendências culturais e sociais atuais"
        ];

        const botFollowUpContainer = document.createElement('div');
        botFollowUpContainer.className = 'message-container bot-message';

        let buttonsHTML = '';
        conversationTopics.forEach(topic => {
            buttonsHTML += `<button class="dynamic-button" data-topic="${topic}">${topic}</button>`;
        });

        botFollowUpContainer.innerHTML = `
            <img src="https://cdn-icons-png.flaticon.com/512/4140/4140047.png" class="message-icon" alt="CorrectMe Assistant">
            <div class="message-content">
                <div class="chat-bubble bot-bubble">
                    <p>Escolha um tópico para praticar conversação:</p>
                    <div class="dynamic-buttons-container">
                        ${buttonsHTML}
                    </div>
                </div>
                <span class="timestamp">${new Date().toLocaleString('pt-BR')}</span>
            </div>
        `;
        messagesContainer.appendChild(botFollowUpContainer);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;

        // Add event listeners to the conversation buttons
        botFollowUpContainer.querySelectorAll('.dynamic-button').forEach(btn => {
            btn.addEventListener('click', () => {
                submitMessage(btn.dataset.topic);
            });
        });
    };

    // Main function to start the chat and display the initial message
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
                    Was möchtest du lernen? / O que você quer aprender?<br><br>
                    1. Grammatik lernen / Estudar gramática 📚<br>
                    2. Konversation üben / Treinar conversação 💬<br><br>
                    Wähle eine Option: / Escolha uma opção:</p>
                    <div class="action-buttons-container">
                        <button class="action-button blue-button" data-action="Dúvidas">Dúvidas / Fragen</button>
                        <button class="action-button green-button" data-action="Treinar escrita">Treinar escrita / Schreiben üben</button>
                    </div>
                </div>
                <span class="timestamp">${new Date().toLocaleString('pt-BR')}</span>
            </div>
        `;
        messagesContainer.appendChild(welcomeMessage);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;

        // Add event listeners to action buttons
        welcomeMessage.querySelectorAll('.action-button').forEach(button => {
            button.addEventListener('click', () => {
                const action = button.dataset.action;
                if (action === 'Dúvidas') {
                    submitMessage('Dúvidas', true); // Send user message first
                    showGrammarTopics(); // Then show grammar options
                } else if (action === 'Treinar escrita') {
                    submitMessage('Treinar escrita', true); // Send user message first
                    showConversationTopics(); // Then show conversation options
                }
            });
        });
    };

    // Function to submit message
    const submitMessage = async (messageText, skipUserMessage = false) => {
        if (!messageText.trim() || isWaitingForResponse) return;

        // Display user message
        if (!skipUserMessage) {
            const userMessageContainer = document.createElement('div');
            userMessageContainer.className = 'message-container user-message';
            userMessageContainer.innerHTML = `
                <img src="https://cdn-icons-png.flaticon.com/512/4140/4140051.png" class="message-icon" alt="Estudante">
                <div class="message-content">
                    <div class="chat-bubble user-bubble">
                        <p>${messageText}</p>
                    </div>
                    <span class="timestamp">${new Date().toLocaleString('pt-BR')}</span>
                </div>
            `;
            messagesContainer.appendChild(userMessageContainer);
            messagesContainer.scrollTop = messagesContainer.scrollHeight;
        }

        isWaitingForResponse = true;
        sendButton.disabled = true;

        // Determine workflow type based on message content
        let workflowType = 'default';
        if (messageText.includes('Dúvidas') || messageText.includes('gramática') || messageText.includes('gramatical')) {
            workflowType = 'gramaticaflow';
        } else if (messageText.includes('Treinar escrita') || messageText.includes('conversação') || messageText.includes('conversa')) {
            workflowType = 'treinoflow';
        }

        // Send to appropriate n8n workflow
        await sendToN8nWorkflow(messageText, workflowType);

        isWaitingForResponse = false;
        sendButton.disabled = false;
        messageTextarea.value = '';
        messageTextarea.style.height = 'auto';
    };

    // Event listeners
    launchButton.addEventListener('click', () => {
        chatWindow.classList.add('active');
        if (!isChatInitialized) {
            startChat();
        }
    });

    chatWindow.querySelector('.chat-close-btn').addEventListener('click', () => {
        chatWindow.classList.remove('active');
    });

    messageTextarea.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            submitMessage(messageTextarea.value);
        }
    });

    messageTextarea.addEventListener('input', () => {
        messageTextarea.style.height = 'auto';
        messageTextarea.style.height = Math.min(messageTextarea.scrollHeight, 120) + 'px';
    });

    sendButton.addEventListener('click', () => {
        submitMessage(messageTextarea.value);
    });

    // File upload handling
    fileInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            console.log('File selected:', file.name);
            // You can add file preview or validation here
        }
    });

    // Auto-resize textarea
    const resizeTextarea = () => {
        messageTextarea.style.height = 'auto';
        messageTextarea.style.height = Math.min(messageTextarea.scrollHeight, 120) + 'px';
    };

    messageTextarea.addEventListener('input', resizeTextarea);

    // Initialize chat when widget is loaded
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            // Widget is ready
        });
    } else {
        // Widget is ready
    }
})();
