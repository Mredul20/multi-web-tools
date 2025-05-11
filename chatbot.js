<<<<<<< HEAD
// filepath: d:\Mredul\Multi Web Tools\chatbot.js
// Main JavaScript logic for chatbot.html, separated for clarity

function initChatbot() {
    console.log("Initializing chatbot...");
    
    // Check if the server is running on initialization
    checkServerStatus();
    // Theme toggle functionality
    const themeToggle = document.getElementById('theme-toggle');
    const sunIcon = document.querySelector('.sun-icon');
    const moonIcon = document.querySelector('.moon-icon');

    // Model-specific information
    const modelInfo = {
        "meta-llama/llama-4-scout-17b-16e-instruct": {
            description: "Latest Llama 4 model with multimodal vision capabilities. This model can analyze images, extract information from visuals, and answer questions about uploaded pictures. Note: Large images will be automatically compressed to improve processing speed and reliability.",
            examplePrompts: [
                "Upload an image and ask 'What's in this image?'",
                "Upload a picture of code and ask 'What does this code do?'",
                "Upload an image of a landmark and ask 'Where is this located?'",
                "Upload a diagram and ask 'Explain this process'"
            ],
            supportsImages: true
        },
        "llama-3.3-70b-versatile": {
            description: "Latest model in the Llama family with powerful capabilities for reasoning, coding, and general knowledge. This model provides lower latency and higher quality responses than previous versions.",
            examplePrompts: [
                "Explain the importance of fast language models",
                "Write a React component that implements a login form",
                "Compare and contrast different approaches to machine learning",
                "What advancements could we see in AI in the next decade?"
            ]
        },
        "deepseek-r1-distill-llama-70b": {
            description: "A reasoning-focused model with fast inference capabilities, optimized for complex reasoning tasks. Try asking about scientific problems, logical puzzles, or programming challenges.",
            examplePrompts: [
                "Explain why fast inference is critical for reasoning models",
                "Design a system to detect fraudulent financial transactions",
                "Analyze the advantages and limitations of quantum computing"
            ]
        }
    };

    // Check for saved theme preference or use system preference
    const savedTheme = localStorage.getItem('theme') || 
        (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    document.documentElement.setAttribute('data-theme', savedTheme);
    updateThemeIcon(savedTheme);

    themeToggle.addEventListener('click', () => {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
        updateThemeIcon(newTheme);
    });

    function updateThemeIcon(theme) {
        if (theme === 'dark') {
            sunIcon.style.display = 'none';
            moonIcon.style.display = 'block';
        } else {
            sunIcon.style.display = 'block';
            moonIcon.style.display = 'none';
        }
    }

    // Chat functionality
    const conversationDiv = document.getElementById('conversation');
    const promptInput = document.getElementById('prompt');
    const sendButton = document.getElementById('send-button');
    const modelSelect = document.getElementById('model-select');
    const loadingDiv = document.getElementById('loading');
    const modelInfoDiv = document.getElementById('model-info');
    
    // Log elements to ensure they're being found correctly
    console.log("Elements found:", {
        conversationDiv: !!conversationDiv,
        promptInput: !!promptInput,
        sendButton: !!sendButton,
        modelSelect: !!modelSelect
    });

    // Show model info when selected
    modelSelect.addEventListener('change', function() {
        const selectedModel = this.value;
        if (modelInfo[selectedModel]) {
            modelInfoDiv.innerHTML = '';
            const descriptionP = document.createElement('p');
            descriptionP.textContent = modelInfo[selectedModel].description;
            modelInfoDiv.appendChild(descriptionP);
            if (modelInfo[selectedModel].examplePrompts && modelInfo[selectedModel].examplePrompts.length > 0) {
                const examplesDiv = document.createElement('div');
                examplesDiv.style.marginTop = '10px';
                const examplesTitle = document.createElement('strong');
                examplesTitle.textContent = 'Example prompts:';
                examplesDiv.appendChild(examplesTitle);
                const examplesList = document.createElement('ul');
                examplesList.style.margin = '5px 0 0 0';
                examplesList.style.paddingLeft = '20px';
                modelInfo[selectedModel].examplePrompts.forEach(prompt => {
                    const listItem = document.createElement('li');
                    const promptLink = document.createElement('a');
                    promptLink.href = '#';
                    promptLink.textContent = prompt;
                    promptLink.style.color = '#3498db';
                    promptLink.style.textDecoration = 'none';
                    promptLink.addEventListener('click', function(e) {
                        e.preventDefault();
                        promptInput.value = prompt;
                        promptInput.focus();
                    });
                    listItem.appendChild(promptLink);
                    examplesList.appendChild(listItem);
                });
                examplesDiv.appendChild(examplesList);
                modelInfoDiv.appendChild(examplesDiv);
            }
            modelInfoDiv.style.display = 'block';
        } else {
            modelInfoDiv.style.display = 'none';
        }
    });

    // Store conversation history and image data
    let conversationHistory = [
        { role: "system", content: "You are a helpful AI assistant powered by Groq. When asked about code or programming topics, provide well-structured explanations with examples. Format code blocks using triple backticks with the appropriate language identifier. For JSON responses, ensure proper formatting with indentation for readability." },
        { role: "assistant", content: "Hello! I'm your AI assistant powered by Groq. How can I help you today?" }
    ];
    let uploadedImage = null;

    // Handle sending messages
    async function sendMessage() {
        console.log("sendMessage function called");
        const prompt = promptInput.value.trim();
        const selectedModel = modelSelect.value;
        const hasImage = uploadedImage !== null;
        const supportsImages = modelInfo[selectedModel]?.supportsImages || false;
        console.log("Prompt:", prompt, "Model:", selectedModel, "Has Image:", hasImage);
        
        if (!prompt && !hasImage) return;
        
        if (hasImage) {
            addMessageToUI('user', prompt, uploadedImage);
        } else {
            addMessageToUI('user', prompt);
        }
        
        let messageContent;
        if (hasImage && supportsImages) {
            messageContent = [
                { type: "text", text: prompt },
                { type: "image_url", image_url: { url: uploadedImage } }
            ];
            conversationHistory.push({ role: "user", content: messageContent });
        } else {
            messageContent = prompt;
            conversationHistory.push({ role: "user", content: messageContent });
        }
        
        promptInput.value = '';
        promptInput.style.height = 'auto';
        
        if (hasImage) clearUploadedImage();
        
        loadingDiv.style.display = 'flex';        try {
            // Determine if we're running locally or in production
            const isLocalhost = location.hostname === 'localhost' || location.hostname === '127.0.0.1';
            
            // Set API base URL based on environment
            const API_URL = isLocalhost 
                ? 'http://localhost:3002'  // Local development with node server
                : '/api';                 // Production with Netlify Functions
            
            console.log(`Using API endpoint: ${API_URL}`);
            
            // First check if the server is running
            let serverCheck;
            try {
                console.log("Checking if API is available...");
                // Attempt to connect with a timeout
                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), 5000);
                
                serverCheck = await fetch(`${API_URL}`, { 
                    method: 'GET',
                    signal: controller.signal 
                });
                
                clearTimeout(timeoutId);
                console.log("API is available!");
            } catch (serverError) {
                console.error("API connection error:", serverError);
                if (isLocalhost) {
                    throw new Error(`Failed to connect to the local backend server. Please make sure the server is running at ${API_URL}.`);
                } else {
                    throw new Error(`Failed to connect to the API. Please try again later.`);
                }
            }
            
            console.log("Sending chat request to API...");
            const response = await fetch(`${API_URL}/chat`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    model: selectedModel,
                    messages: conversationHistory,
                    hasMultimodalContent: hasImage && supportsImages
                })
            });
            
            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Server error: ${response.status} ${errorText}`);
            }
            
            const data = await response.json();
            console.log("Response received from server");
            
            if (data.choices && data.choices[0] && data.choices[0].message) {
                let aiResponse = data.choices[0].message.content || 'No content in response.';
                
                if (typeof aiResponse === 'object') {
                    const textParts = aiResponse.filter(part => part.type === 'text');
                    if (textParts.length > 0) {
                        aiResponse = textParts.map(part => part.text).join('\n');
                    } else {
                        aiResponse = 'No text content in response.';
                    }
                }
                
                aiResponse = aiResponse.replace(/<think>[\s\S]*?<\/think>/g, '').trim();
                const thinkPattern = /<think>[\s\S]*$/;
                aiResponse = aiResponse.replace(thinkPattern, '').trim();
                aiResponse = aiResponse.replace(/^<think>/i, '').trim();
                
                addMessageToUI('ai', aiResponse);
                conversationHistory.push({ role: "assistant", content: aiResponse });
            } else {
                addMessageToUI('ai', 'Sorry, I encountered an error processing your request.');
            }
        } catch (error) {
            console.error("Error in chat:", error);
            let errorMessage = `Error: ${error.message}`;
              // Determine if we're running locally or in production
            const isLocalhost = location.hostname === 'localhost' || location.hostname === '127.0.0.1';
            
            if (error.name === 'AbortError') {
                errorMessage = 'Connection timed out. Please try again later.';
            } else if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
                if (isLocalhost) {
                    errorMessage = 'Could not connect to the backend server. Please make sure the server is running at http://localhost:3002. Run "node groq-proxy.js" in your terminal to start the server.';
                } else {
                    errorMessage = 'Could not connect to the API server. This might be due to a network issue or the server might be temporarily unavailable. Please try again later.';
                }
            } else if (error.message.includes('entity too large') || error.message.includes('payload')) {
                errorMessage = 'The image you uploaded is too large. Please try a smaller image or reduce its resolution.';
            }            // Create a styled error message
            const formattedErrorMessage = `
                <div style="background-color: #ffeef0; border-left: 4px solid #d73a49; padding: 10px 15px; margin: 10px 0; border-radius: 4px;">
                    <strong style="color: #d73a49;">Error:</strong> 
                    <span>${errorMessage}</span>
                    ${isLocalhost && error.message.includes('server') ? 
                        `<div style="margin-top: 10px; font-size: 0.9em;">
                            <strong>Troubleshooting:</strong>
                            <ol style="margin-top: 5px; padding-left: 25px;">
                                <li>Make sure the server is running by executing <code>node groq-proxy.js</code> in your terminal</li>
                                <li>Check that port 3002 is available and not blocked by a firewall</li>
                                <li>Try running the <code>start-chatbot.bat</code> (Windows) or <code>start-chatbot.sh</code> (Mac/Linux) file</li>
                            </ol>
                        </div>` 
                        : ''
                    }
                </div>
            `;
            
            addMessageToUI('ai', formattedErrorMessage);
        } finally {
            loadingDiv.style.display = 'none';
        }
    }

    // Helper: Format language name for display
    function formatLanguageName(language) {
        if (!language) return 'Code';
        const languageMap = {
            'js': 'JavaScript', 'javascript': 'JavaScript', 'ts': 'TypeScript', 'typescript': 'TypeScript',
            'py': 'Python', 'python': 'Python', 'html': 'HTML', 'css': 'CSS', 'java': 'Java', 'c': 'C',
            'cpp': 'C++', 'cs': 'C#', 'csharp': 'C#', 'php': 'PHP', 'rb': 'Ruby', 'ruby': 'Ruby', 'go': 'Go',
            'rust': 'Rust', 'sh': 'Shell', 'bash': 'Bash', 'shell': 'Shell', 'sql': 'SQL', 'json': 'JSON',
            'xml': 'XML', 'md': 'Markdown', 'markdown': 'Markdown'
        };
        return languageMap[language.toLowerCase()] || language.charAt(0).toUpperCase() + language.slice(1);
    }

    // Helper: Can run code in browser
    function canRunCode(language) {
        const runnableLanguages = ['javascript', 'js', 'html'];
        return runnableLanguages.includes(language.toLowerCase());
    }

    // Helper: Format output values
    function formatOutputValue(value) {
        if (value === undefined) return 'undefined';
        if (value === null) return 'null';
        if (typeof value === 'object') {
            try {
                return JSON.stringify(value, null, 2)
                    .replace(/&/g, '&amp;')
                    .replace(/</g, '&lt;')
                    .replace(/>/g, '&gt;')
                    .replace(/\n/g, '<br>')
                    .replace(/ /g, '&nbsp;');
            } catch (e) { return String(value); }
        }
        return String(value)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;');
    }

    // Add message to UI
    function addMessageToUI(sender, content, imageUrl = null) {
        const conversationDiv = document.getElementById('conversation');
        const messageContainer = document.createElement('div');
        messageContainer.className = 'message-container';
        const message = document.createElement('div');
        message.className = `${sender === 'user' ? 'user-message' : 'ai-message'} message`;
        const messageInner = document.createElement('div');
        messageInner.className = 'message-inner';
        const avatar = document.createElement('div');
        avatar.className = `message-avatar ${sender === 'user' ? 'user-avatar' : 'ai-avatar'}`;
        avatar.textContent = sender === 'user' ? 'U' : 'G';
        const messageContent = document.createElement('div');
        messageContent.className = 'message-content';
        let cleanContent = content;
        const paragraph = document.createElement('p');
        
        if (imageUrl) {
            const imgContainer = document.createElement('div');
            imgContainer.className = 'message-image-container';
            const img = document.createElement('img');
            img.src = imageUrl;
            img.className = 'message-image';
            img.alt = 'Uploaded image';
            img.addEventListener('click', () => {
                const overlay = document.createElement('div');
                overlay.className = 'image-preview-overlay';
                overlay.onclick = () => overlay.remove();
                const previewImg = document.createElement('img');
                previewImg.src = imageUrl;
                previewImg.className = 'image-preview-large';
                overlay.appendChild(previewImg);
                document.body.appendChild(overlay);
            });
            imgContainer.appendChild(img);
            messageContent.appendChild(imgContainer);
        }
          if (sender === 'ai') {
            // Check if the content contains HTML elements (specifically for error messages)
            const containsHTML = /<div|<span|<strong|<ol|<ul|<li|<code/.test(cleanContent);
            
            if (containsHTML) {
                // Content already has HTML formatting (for error messages)
                paragraph.innerHTML = cleanContent;
            } else {
                // Normal AI response that needs code formatting
                const codeBlockPattern = /```([a-zA-Z0-9]*)\n([\s\S]*?)```/g;
                let formattedContent = cleanContent;
                let match;
                let matchIndex = 0;
                
                while ((match = codeBlockPattern.exec(cleanContent)) !== null) {
                    const language = match[1] || '';
                    const code = match[2];
                    const blockId = `code-block-${Date.now()}-${matchIndex++}`;
                    const escapedCode = code
                        .replace(/&/g, '&amp;')
                        .replace(/</g, '&lt;')
                        .replace(/>/g, '&gt;');
                    const langDisplay = formatLanguageName(language);
                    
                    const html = `
                        <div class="code-block">
                            <div class="code-header">
                                <span class="language-tag language-${language || 'code'}">${langDisplay}</span>
                                <div class="code-actions">
                                    <button class="copy-btn" data-code="${blockId}">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"></path></svg>
                                        Copy
                                    </button>
                                    ${canRunCode(language) ? `
                                        <button class="run-btn" data-code="${blockId}" data-language="${language}">
                                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
                                            Run
                                        </button>
                                    ` : ''}
                                </div>
                            </div>
                            <pre><code id="${blockId}" ${language ? `class="language-${language}"` : ''}>${escapedCode}</code></pre>
                            <div id="${blockId}-output" class="code-output" style="display: none;"></div>
                        </div>
                    `;
                    formattedContent = formattedContent.replace(match[0], html);
                }
                
                formattedContent = formattedContent.replace(/`([^`]+)`/g, (match, code) => {
                    const escapedCode = code
                        .replace(/&/g, '&amp;')
                        .replace(/</g, '&lt;')
                        .replace(/>/g, '&gt;');
                    return `<code>${escapedCode}</code>`;
                });
                
                formattedContent = formattedContent.replace(/{<br>"([^"]+)":/g, '{\n"$1":');
                paragraph.innerHTML = formattedContent.split('\n').join('<br>');
            }
        } else {
            paragraph.textContent = cleanContent || '';
        }
        
        const meta = document.createElement('div');
        meta.className = 'message-meta';
        meta.textContent = sender === 'user' ? 'You' : 'Groq AI';
        
        messageContent.appendChild(paragraph);
        messageContent.appendChild(meta);
        messageInner.appendChild(avatar);
        messageInner.appendChild(messageContent);
        message.appendChild(messageInner);
        messageContainer.appendChild(message);
        conversationDiv.appendChild(messageContainer);
        
        if (sender === 'ai') {
            if (window.Prism) {
                message.querySelectorAll('pre code').forEach((codeElement) => {
                    if (codeElement.className && codeElement.className.includes('language-')) {
                        Prism.highlightElement(codeElement);
                    }
                });
            }
            
            const copyButtons = message.querySelectorAll('.copy-btn');
            copyButtons.forEach(button => {
                button.addEventListener('click', () => {
                    const codeId = button.getAttribute('data-code');
                    const codeElement = document.getElementById(codeId);
                    const codeText = codeElement.textContent;
                    navigator.clipboard.writeText(codeText).then(() => {
                        const originalText = button.innerHTML;
                        button.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6L9 17l-5-5"></path></svg> Copied!';
                        setTimeout(() => { button.innerHTML = originalText; }, 2000);
                    });
                });
            });
            
            const runButtons = message.querySelectorAll('.run-btn');
            runButtons.forEach(button => {
                button.addEventListener('click', () => {
                    const codeId = button.getAttribute('data-code');
                    const language = button.getAttribute('data-language');
                    const codeElement = document.getElementById(codeId);
                    const codeText = codeElement.textContent;
                    const outputElement = document.getElementById(`${codeId}-output`);
                    outputElement.style.display = 'block';
                    outputElement.textContent = 'Running code...';
                    runCode(codeText, language, outputElement);
                });
            });
        }
        
        conversationDiv.scrollTop = conversationDiv.scrollHeight;
    }

    // Add Enter key and send button event listeners
    sendButton.addEventListener('click', function() {
        console.log("Send button clicked");
        sendMessage();
    });
    
    promptInput.addEventListener('keydown', function(e) {
        if (e.key === 'Enter' && !e.shiftKey) {
            console.log("Enter key pressed");
            e.preventDefault();
            sendMessage();
        }
    });

    // Image handling functionality
    const imageUpload = document.getElementById('image-upload');
    const imagePreview = document.getElementById('image-preview');
    const uploadedImageElement = document.getElementById('uploaded-image');
    const removeImageButton = document.getElementById('remove-image');

    function clearUploadedImage() {
        uploadedImage = null;
        imagePreview.style.display = 'none';
        uploadedImageElement.src = '#';
    }

    imageUpload.addEventListener('change', function(e) {
        if (this.files && this.files[0]) {
            const reader = new FileReader();
            reader.onload = function(e) {
                uploadedImage = e.target.result;
                uploadedImageElement.src = uploadedImage;
                imagePreview.style.display = 'inline-block';
            };
            reader.readAsDataURL(this.files[0]);
        }
    });

    removeImageButton.addEventListener('click', clearUploadedImage);
}

// Function to check if the backend server is running
async function checkServerStatus() {
    const statusMessage = document.createElement('div');
    statusMessage.style.display = 'none';
    statusMessage.style.padding = '10px 15px';
    statusMessage.style.borderRadius = '4px';
    statusMessage.style.marginBottom = '10px';
    statusMessage.style.fontSize = '0.9rem';
    
    // Determine if we're running locally or in production
    const isLocalhost = location.hostname === 'localhost' || location.hostname === '127.0.0.1';
    
    // Set API URL based on environment
    const API_URL = isLocalhost 
        ? 'http://localhost:3002'  // Local development
        : '/api';                 // Production with Netlify Functions
    
    try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 3000);
        
        const response = await fetch(API_URL, {
            method: 'GET',
            signal: controller.signal
        });
        
        clearTimeout(timeoutId);
        
        if (response.ok) {
            statusMessage.textContent = '✅ API is connected and ready!';
            statusMessage.style.backgroundColor = '#e6ffed';
            statusMessage.style.color = '#22863a';
            statusMessage.style.border = '1px solid #b4e6b4';
            
            // Auto-hide success message after 5 seconds
            setTimeout(() => {
                statusMessage.style.display = 'none';
            }, 5000);
        } else {
            statusMessage.textContent = '⚠️ API responded with an error. You may experience issues with the chatbot.';
            statusMessage.style.backgroundColor = '#fff8c5';
            statusMessage.style.color = '#b08800';
            statusMessage.style.border = '1px solid #efd677';
        }
    } catch (error) {
        if (isLocalhost) {
            statusMessage.textContent = '❌ Could not connect to the local server. Please run "node groq-proxy.js" in your terminal to start the server.';
        } else {
            statusMessage.textContent = '⚠️ API connection issue. The service might be temporarily unavailable.';
        }
        statusMessage.style.backgroundColor = '#ffeef0';
        statusMessage.style.color = '#d73a49';
        statusMessage.style.border = '1px solid #f9c2c8';
    }
    
    // Insert the status message at the top of the conversation
    statusMessage.style.display = 'block';
    const conversation = document.getElementById('conversation');
    conversation.insertBefore(statusMessage, conversation.firstChild);
}

// Initialize the chatbot when the page loads
document.addEventListener('DOMContentLoaded', initChatbot);

// Fallback initialization if DOMContentLoaded has already fired
if (document.readyState === 'complete' || document.readyState === 'interactive') {
    setTimeout(initChatbot, 100);
}
=======
// filepath: d:\Mredul\Multi Web Tools\chatbot.js
// Main JavaScript logic for chatbot.html, separated for clarity

function initChatbot() {
    console.log("Initializing chatbot...");
    
    // Check if the server is running on initialization
    checkServerStatus();
    // Theme toggle functionality
    const themeToggle = document.getElementById('theme-toggle');
    const sunIcon = document.querySelector('.sun-icon');
    const moonIcon = document.querySelector('.moon-icon');

    // Model-specific information
    const modelInfo = {
        "meta-llama/llama-4-scout-17b-16e-instruct": {
            description: "Latest Llama 4 model with multimodal vision capabilities. This model can analyze images, extract information from visuals, and answer questions about uploaded pictures. Note: Large images will be automatically compressed to improve processing speed and reliability.",
            examplePrompts: [
                "Upload an image and ask 'What's in this image?'",
                "Upload a picture of code and ask 'What does this code do?'",
                "Upload an image of a landmark and ask 'Where is this located?'",
                "Upload a diagram and ask 'Explain this process'"
            ],
            supportsImages: true
        },
        "llama-3.3-70b-versatile": {
            description: "Latest model in the Llama family with powerful capabilities for reasoning, coding, and general knowledge. This model provides lower latency and higher quality responses than previous versions.",
            examplePrompts: [
                "Explain the importance of fast language models",
                "Write a React component that implements a login form",
                "Compare and contrast different approaches to machine learning",
                "What advancements could we see in AI in the next decade?"
            ]
        },
        "deepseek-r1-distill-llama-70b": {
            description: "A reasoning-focused model with fast inference capabilities, optimized for complex reasoning tasks. Try asking about scientific problems, logical puzzles, or programming challenges.",
            examplePrompts: [
                "Explain why fast inference is critical for reasoning models",
                "Design a system to detect fraudulent financial transactions",
                "Analyze the advantages and limitations of quantum computing"
            ]
        }
    };

    // Check for saved theme preference or use system preference
    const savedTheme = localStorage.getItem('theme') || 
        (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    document.documentElement.setAttribute('data-theme', savedTheme);
    updateThemeIcon(savedTheme);

    themeToggle.addEventListener('click', () => {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
        updateThemeIcon(newTheme);
    });

    function updateThemeIcon(theme) {
        if (theme === 'dark') {
            sunIcon.style.display = 'none';
            moonIcon.style.display = 'block';
        } else {
            sunIcon.style.display = 'block';
            moonIcon.style.display = 'none';
        }
    }

    // Chat functionality
    const conversationDiv = document.getElementById('conversation');
    const promptInput = document.getElementById('prompt');
    const sendButton = document.getElementById('send-button');
    const modelSelect = document.getElementById('model-select');
    const loadingDiv = document.getElementById('loading');
    const modelInfoDiv = document.getElementById('model-info');
    
    // Log elements to ensure they're being found correctly
    console.log("Elements found:", {
        conversationDiv: !!conversationDiv,
        promptInput: !!promptInput,
        sendButton: !!sendButton,
        modelSelect: !!modelSelect
    });

    // Show model info when selected
    modelSelect.addEventListener('change', function() {
        const selectedModel = this.value;
        if (modelInfo[selectedModel]) {
            modelInfoDiv.innerHTML = '';
            const descriptionP = document.createElement('p');
            descriptionP.textContent = modelInfo[selectedModel].description;
            modelInfoDiv.appendChild(descriptionP);
            if (modelInfo[selectedModel].examplePrompts && modelInfo[selectedModel].examplePrompts.length > 0) {
                const examplesDiv = document.createElement('div');
                examplesDiv.style.marginTop = '10px';
                const examplesTitle = document.createElement('strong');
                examplesTitle.textContent = 'Example prompts:';
                examplesDiv.appendChild(examplesTitle);
                const examplesList = document.createElement('ul');
                examplesList.style.margin = '5px 0 0 0';
                examplesList.style.paddingLeft = '20px';
                modelInfo[selectedModel].examplePrompts.forEach(prompt => {
                    const listItem = document.createElement('li');
                    const promptLink = document.createElement('a');
                    promptLink.href = '#';
                    promptLink.textContent = prompt;
                    promptLink.style.color = '#3498db';
                    promptLink.style.textDecoration = 'none';
                    promptLink.addEventListener('click', function(e) {
                        e.preventDefault();
                        promptInput.value = prompt;
                        promptInput.focus();
                    });
                    listItem.appendChild(promptLink);
                    examplesList.appendChild(listItem);
                });
                examplesDiv.appendChild(examplesList);
                modelInfoDiv.appendChild(examplesDiv);
            }
            modelInfoDiv.style.display = 'block';
        } else {
            modelInfoDiv.style.display = 'none';
        }
    });

    // Store conversation history and image data
    let conversationHistory = [
        { role: "system", content: "You are a helpful AI assistant powered by Groq. When asked about code or programming topics, provide well-structured explanations with examples. Format code blocks using triple backticks with the appropriate language identifier. For JSON responses, ensure proper formatting with indentation for readability." },
        { role: "assistant", content: "Hello! I'm your AI assistant powered by Groq. How can I help you today?" }
    ];
    let uploadedImage = null;

    // Handle sending messages
    async function sendMessage() {
        console.log("sendMessage function called");
        const prompt = promptInput.value.trim();
        const selectedModel = modelSelect.value;
        const hasImage = uploadedImage !== null;
        const supportsImages = modelInfo[selectedModel]?.supportsImages || false;
        console.log("Prompt:", prompt, "Model:", selectedModel, "Has Image:", hasImage);
        
        if (!prompt && !hasImage) return;
        
        if (hasImage) {
            addMessageToUI('user', prompt, uploadedImage);
        } else {
            addMessageToUI('user', prompt);
        }
        
        let messageContent;
        if (hasImage && supportsImages) {
            messageContent = [
                { type: "text", text: prompt },
                { type: "image_url", image_url: { url: uploadedImage } }
            ];
            conversationHistory.push({ role: "user", content: messageContent });
        } else {
            messageContent = prompt;
            conversationHistory.push({ role: "user", content: messageContent });
        }
        
        promptInput.value = '';
        promptInput.style.height = 'auto';
        
        if (hasImage) clearUploadedImage();
        
        loadingDiv.style.display = 'flex';        try {
            // Determine if we're running locally or in production
            const isLocalhost = location.hostname === 'localhost' || location.hostname === '127.0.0.1';
            
            // Set API base URL based on environment
            const API_URL = isLocalhost 
                ? 'http://localhost:3002'  // Local development with node server
                : '/api';                 // Production with Netlify Functions
            
            console.log(`Using API endpoint: ${API_URL}`);
            
            // First check if the server is running
            let serverCheck;
            try {
                console.log("Checking if API is available...");
                // Attempt to connect with a timeout
                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), 5000);
                
                serverCheck = await fetch(`${API_URL}`, { 
                    method: 'GET',
                    signal: controller.signal 
                });
                
                clearTimeout(timeoutId);
                console.log("API is available!");
            } catch (serverError) {
                console.error("API connection error:", serverError);
                if (isLocalhost) {
                    throw new Error(`Failed to connect to the local backend server. Please make sure the server is running at ${API_URL}.`);
                } else {
                    throw new Error(`Failed to connect to the API. Please try again later.`);
                }
            }
            
            console.log("Sending chat request to API...");
            const response = await fetch(`${API_URL}/chat`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    model: selectedModel,
                    messages: conversationHistory,
                    hasMultimodalContent: hasImage && supportsImages
                })
            });
            
            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Server error: ${response.status} ${errorText}`);
            }
            
            const data = await response.json();
            console.log("Response received from server");
            
            if (data.choices && data.choices[0] && data.choices[0].message) {
                let aiResponse = data.choices[0].message.content || 'No content in response.';
                
                if (typeof aiResponse === 'object') {
                    const textParts = aiResponse.filter(part => part.type === 'text');
                    if (textParts.length > 0) {
                        aiResponse = textParts.map(part => part.text).join('\n');
                    } else {
                        aiResponse = 'No text content in response.';
                    }
                }
                
                aiResponse = aiResponse.replace(/<think>[\s\S]*?<\/think>/g, '').trim();
                const thinkPattern = /<think>[\s\S]*$/;
                aiResponse = aiResponse.replace(thinkPattern, '').trim();
                aiResponse = aiResponse.replace(/^<think>/i, '').trim();
                
                addMessageToUI('ai', aiResponse);
                conversationHistory.push({ role: "assistant", content: aiResponse });
            } else {
                addMessageToUI('ai', 'Sorry, I encountered an error processing your request.');
            }
        } catch (error) {
            console.error("Error in chat:", error);
            let errorMessage = `Error: ${error.message}`;
              // Determine if we're running locally or in production
            const isLocalhost = location.hostname === 'localhost' || location.hostname === '127.0.0.1';
            
            if (error.name === 'AbortError') {
                errorMessage = 'Connection timed out. Please try again later.';
            } else if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
                if (isLocalhost) {
                    errorMessage = 'Could not connect to the backend server. Please make sure the server is running at http://localhost:3002. Run "node groq-proxy.js" in your terminal to start the server.';
                } else {
                    errorMessage = 'Could not connect to the API server. This might be due to a network issue or the server might be temporarily unavailable. Please try again later.';
                }
            } else if (error.message.includes('entity too large') || error.message.includes('payload')) {
                errorMessage = 'The image you uploaded is too large. Please try a smaller image or reduce its resolution.';
            }            // Create a styled error message
            const formattedErrorMessage = `
                <div style="background-color: #ffeef0; border-left: 4px solid #d73a49; padding: 10px 15px; margin: 10px 0; border-radius: 4px;">
                    <strong style="color: #d73a49;">Error:</strong> 
                    <span>${errorMessage}</span>
                    ${isLocalhost && error.message.includes('server') ? 
                        `<div style="margin-top: 10px; font-size: 0.9em;">
                            <strong>Troubleshooting:</strong>
                            <ol style="margin-top: 5px; padding-left: 25px;">
                                <li>Make sure the server is running by executing <code>node groq-proxy.js</code> in your terminal</li>
                                <li>Check that port 3002 is available and not blocked by a firewall</li>
                                <li>Try running the <code>start-chatbot.bat</code> (Windows) or <code>start-chatbot.sh</code> (Mac/Linux) file</li>
                            </ol>
                        </div>` 
                        : ''
                    }
                </div>
            `;
            
            addMessageToUI('ai', formattedErrorMessage);
        } finally {
            loadingDiv.style.display = 'none';
        }
    }

    // Helper: Format language name for display
    function formatLanguageName(language) {
        if (!language) return 'Code';
        const languageMap = {
            'js': 'JavaScript', 'javascript': 'JavaScript', 'ts': 'TypeScript', 'typescript': 'TypeScript',
            'py': 'Python', 'python': 'Python', 'html': 'HTML', 'css': 'CSS', 'java': 'Java', 'c': 'C',
            'cpp': 'C++', 'cs': 'C#', 'csharp': 'C#', 'php': 'PHP', 'rb': 'Ruby', 'ruby': 'Ruby', 'go': 'Go',
            'rust': 'Rust', 'sh': 'Shell', 'bash': 'Bash', 'shell': 'Shell', 'sql': 'SQL', 'json': 'JSON',
            'xml': 'XML', 'md': 'Markdown', 'markdown': 'Markdown'
        };
        return languageMap[language.toLowerCase()] || language.charAt(0).toUpperCase() + language.slice(1);
    }

    // Helper: Can run code in browser
    function canRunCode(language) {
        const runnableLanguages = ['javascript', 'js', 'html'];
        return runnableLanguages.includes(language.toLowerCase());
    }

    // Helper: Format output values
    function formatOutputValue(value) {
        if (value === undefined) return 'undefined';
        if (value === null) return 'null';
        if (typeof value === 'object') {
            try {
                return JSON.stringify(value, null, 2)
                    .replace(/&/g, '&amp;')
                    .replace(/</g, '&lt;')
                    .replace(/>/g, '&gt;')
                    .replace(/\n/g, '<br>')
                    .replace(/ /g, '&nbsp;');
            } catch (e) { return String(value); }
        }
        return String(value)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;');
    }

    // Add message to UI
    function addMessageToUI(sender, content, imageUrl = null) {
        const conversationDiv = document.getElementById('conversation');
        const messageContainer = document.createElement('div');
        messageContainer.className = 'message-container';
        const message = document.createElement('div');
        message.className = `${sender === 'user' ? 'user-message' : 'ai-message'} message`;
        const messageInner = document.createElement('div');
        messageInner.className = 'message-inner';
        const avatar = document.createElement('div');
        avatar.className = `message-avatar ${sender === 'user' ? 'user-avatar' : 'ai-avatar'}`;
        avatar.textContent = sender === 'user' ? 'U' : 'G';
        const messageContent = document.createElement('div');
        messageContent.className = 'message-content';
        let cleanContent = content;
        const paragraph = document.createElement('p');
        
        if (imageUrl) {
            const imgContainer = document.createElement('div');
            imgContainer.className = 'message-image-container';
            const img = document.createElement('img');
            img.src = imageUrl;
            img.className = 'message-image';
            img.alt = 'Uploaded image';
            img.addEventListener('click', () => {
                const overlay = document.createElement('div');
                overlay.className = 'image-preview-overlay';
                overlay.onclick = () => overlay.remove();
                const previewImg = document.createElement('img');
                previewImg.src = imageUrl;
                previewImg.className = 'image-preview-large';
                overlay.appendChild(previewImg);
                document.body.appendChild(overlay);
            });
            imgContainer.appendChild(img);
            messageContent.appendChild(imgContainer);
        }
          if (sender === 'ai') {
            // Check if the content contains HTML elements (specifically for error messages)
            const containsHTML = /<div|<span|<strong|<ol|<ul|<li|<code/.test(cleanContent);
            
            if (containsHTML) {
                // Content already has HTML formatting (for error messages)
                paragraph.innerHTML = cleanContent;
            } else {
                // Normal AI response that needs code formatting
                const codeBlockPattern = /```([a-zA-Z0-9]*)\n([\s\S]*?)```/g;
                let formattedContent = cleanContent;
                let match;
                let matchIndex = 0;
                
                while ((match = codeBlockPattern.exec(cleanContent)) !== null) {
                    const language = match[1] || '';
                    const code = match[2];
                    const blockId = `code-block-${Date.now()}-${matchIndex++}`;
                    const escapedCode = code
                        .replace(/&/g, '&amp;')
                        .replace(/</g, '&lt;')
                        .replace(/>/g, '&gt;');
                    const langDisplay = formatLanguageName(language);
                    
                    const html = `
                        <div class="code-block">
                            <div class="code-header">
                                <span class="language-tag language-${language || 'code'}">${langDisplay}</span>
                                <div class="code-actions">
                                    <button class="copy-btn" data-code="${blockId}">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"></path></svg>
                                        Copy
                                    </button>
                                    ${canRunCode(language) ? `
                                        <button class="run-btn" data-code="${blockId}" data-language="${language}">
                                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
                                            Run
                                        </button>
                                    ` : ''}
                                </div>
                            </div>
                            <pre><code id="${blockId}" ${language ? `class="language-${language}"` : ''}>${escapedCode}</code></pre>
                            <div id="${blockId}-output" class="code-output" style="display: none;"></div>
                        </div>
                    `;
                    formattedContent = formattedContent.replace(match[0], html);
                }
                
                formattedContent = formattedContent.replace(/`([^`]+)`/g, (match, code) => {
                    const escapedCode = code
                        .replace(/&/g, '&amp;')
                        .replace(/</g, '&lt;')
                        .replace(/>/g, '&gt;');
                    return `<code>${escapedCode}</code>`;
                });
                
                formattedContent = formattedContent.replace(/{<br>"([^"]+)":/g, '{\n"$1":');
                paragraph.innerHTML = formattedContent.split('\n').join('<br>');
            }
        } else {
            paragraph.textContent = cleanContent || '';
        }
        
        const meta = document.createElement('div');
        meta.className = 'message-meta';
        meta.textContent = sender === 'user' ? 'You' : 'Groq AI';
        
        messageContent.appendChild(paragraph);
        messageContent.appendChild(meta);
        messageInner.appendChild(avatar);
        messageInner.appendChild(messageContent);
        message.appendChild(messageInner);
        messageContainer.appendChild(message);
        conversationDiv.appendChild(messageContainer);
        
        if (sender === 'ai') {
            if (window.Prism) {
                message.querySelectorAll('pre code').forEach((codeElement) => {
                    if (codeElement.className && codeElement.className.includes('language-')) {
                        Prism.highlightElement(codeElement);
                    }
                });
            }
            
            const copyButtons = message.querySelectorAll('.copy-btn');
            copyButtons.forEach(button => {
                button.addEventListener('click', () => {
                    const codeId = button.getAttribute('data-code');
                    const codeElement = document.getElementById(codeId);
                    const codeText = codeElement.textContent;
                    navigator.clipboard.writeText(codeText).then(() => {
                        const originalText = button.innerHTML;
                        button.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6L9 17l-5-5"></path></svg> Copied!';
                        setTimeout(() => { button.innerHTML = originalText; }, 2000);
                    });
                });
            });
            
            const runButtons = message.querySelectorAll('.run-btn');
            runButtons.forEach(button => {
                button.addEventListener('click', () => {
                    const codeId = button.getAttribute('data-code');
                    const language = button.getAttribute('data-language');
                    const codeElement = document.getElementById(codeId);
                    const codeText = codeElement.textContent;
                    const outputElement = document.getElementById(`${codeId}-output`);
                    outputElement.style.display = 'block';
                    outputElement.textContent = 'Running code...';
                    runCode(codeText, language, outputElement);
                });
            });
        }
        
        conversationDiv.scrollTop = conversationDiv.scrollHeight;
    }

    // Add Enter key and send button event listeners
    sendButton.addEventListener('click', function() {
        console.log("Send button clicked");
        sendMessage();
    });
    
    promptInput.addEventListener('keydown', function(e) {
        if (e.key === 'Enter' && !e.shiftKey) {
            console.log("Enter key pressed");
            e.preventDefault();
            sendMessage();
        }
    });

    // Image handling functionality
    const imageUpload = document.getElementById('image-upload');
    const imagePreview = document.getElementById('image-preview');
    const uploadedImageElement = document.getElementById('uploaded-image');
    const removeImageButton = document.getElementById('remove-image');

    function clearUploadedImage() {
        uploadedImage = null;
        imagePreview.style.display = 'none';
        uploadedImageElement.src = '#';
    }

    imageUpload.addEventListener('change', function(e) {
        if (this.files && this.files[0]) {
            const reader = new FileReader();
            reader.onload = function(e) {
                uploadedImage = e.target.result;
                uploadedImageElement.src = uploadedImage;
                imagePreview.style.display = 'inline-block';
            };
            reader.readAsDataURL(this.files[0]);
        }
    });

    removeImageButton.addEventListener('click', clearUploadedImage);
}

// Function to check if the backend server is running
async function checkServerStatus() {
    const statusMessage = document.createElement('div');
    statusMessage.style.display = 'none';
    statusMessage.style.padding = '10px 15px';
    statusMessage.style.borderRadius = '4px';
    statusMessage.style.marginBottom = '10px';
    statusMessage.style.fontSize = '0.9rem';
    
    // Determine if we're running locally or in production
    const isLocalhost = location.hostname === 'localhost' || location.hostname === '127.0.0.1';
    
    // Set API URL based on environment
    const API_URL = isLocalhost 
        ? 'http://localhost:3002'  // Local development
        : '/api';                 // Production with Netlify Functions
    
    try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 3000);
        
        const response = await fetch(API_URL, {
            method: 'GET',
            signal: controller.signal
        });
        
        clearTimeout(timeoutId);
        
        if (response.ok) {
            statusMessage.textContent = '✅ API is connected and ready!';
            statusMessage.style.backgroundColor = '#e6ffed';
            statusMessage.style.color = '#22863a';
            statusMessage.style.border = '1px solid #b4e6b4';
            
            // Auto-hide success message after 5 seconds
            setTimeout(() => {
                statusMessage.style.display = 'none';
            }, 5000);
        } else {
            statusMessage.textContent = '⚠️ API responded with an error. You may experience issues with the chatbot.';
            statusMessage.style.backgroundColor = '#fff8c5';
            statusMessage.style.color = '#b08800';
            statusMessage.style.border = '1px solid #efd677';
        }
    } catch (error) {
        if (isLocalhost) {
            statusMessage.textContent = '❌ Could not connect to the local server. Please run "node groq-proxy.js" in your terminal to start the server.';
        } else {
            statusMessage.textContent = '⚠️ API connection issue. The service might be temporarily unavailable.';
        }
        statusMessage.style.backgroundColor = '#ffeef0';
        statusMessage.style.color = '#d73a49';
        statusMessage.style.border = '1px solid #f9c2c8';
    }
    
    // Insert the status message at the top of the conversation
    statusMessage.style.display = 'block';
    const conversation = document.getElementById('conversation');
    conversation.insertBefore(statusMessage, conversation.firstChild);
}

// Initialize the chatbot when the page loads
document.addEventListener('DOMContentLoaded', initChatbot);

// Fallback initialization if DOMContentLoaded has already fired
if (document.readyState === 'complete' || document.readyState === 'interactive') {
    setTimeout(initChatbot, 100);
}
>>>>>>> master
