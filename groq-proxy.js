const express = require('express');
const cors = require('cors');
const Groq = require('groq-sdk');

const app = express();
// Use environment variable for port or default to 3002
const PORT = process.env.PORT || 3002;

// Use environment variable for API key
// IMPORTANT: Replace this with environment variable when deploying
// Use: const apiKey = process.env.GROQ_API_KEY;
const apiKey = process.env.GROQ_API_KEY || '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';

const groq = new Groq({ apiKey });

// Configure CORS for both development and production
app.use(cors({
  // Add your GitHub Pages URL when deployed
  origin: ['http://localhost:5500', 'http://127.0.0.1:5500']
}));
// Increase JSON payload limit to handle base64-encoded images (50MB)
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Add a simple home page
app.get('/', (req, res) => {
  res.send(`
    <html>
      <head>
        <title>Groq API Proxy</title>
        <style>
          body { font-family: Arial, sans-serif; max-width: 600px; margin: 40px auto; padding: 20px; line-height: 1.6; }
          h1 { color: #2c3e50; }
          code { background: #f8f9fa; padding: 2px 5px; border-radius: 3px; }
          .success { color: #27ae60; }
        </style>
      </head>
      <body>
        <h1>Groq API Proxy Server</h1>
        <p class="success">✅ Your Groq API proxy server is running correctly!</p>
        <p>This server is designed to be used with your chatbot HTML frontend, not accessed directly.</p>
        <p>To use it:</p>
        <ol>
          <li>Keep this server running</li>
          <li>Open your <a href="http://127.0.0.1:5500/chatbot.html" target="_blank">chatbot.html</a> page</li>
          <li>Enter a prompt and enjoy Groq's fast responses</li>
        </ol>        <p>The server accepts POST requests to <code>/chat</code> with a JSON body containing:</p>
        <pre>{
  "model": "meta-llama/llama-4-scout-17b-16e-instruct",
  "messages": [{"role": "user", "content": "Your prompt here"}],
  "hasMultimodalContent": false
}</pre>
        <p>For multimodal messages (images), the request should have:</p>
        <pre>{
  "model": "meta-llama/llama-4-scout-17b-16e-instruct",
  "messages": [
    {
      "role": "user",
      "content": [
        {"type": "text", "text": "What's in this image?"},
        {"type": "image_url", "image_url": {"url": "data:image/jpeg;base64,/9j..."}}
      ]
    }
  ],
  "hasMultimodalContent": true
}</pre>
      </body>
    </html>
  `);
});

app.post('/chat', async (req, res) => {
  try {
    const { messages, model, hasMultimodalContent } = req.body;
    console.log('Received request for model:', model);
    console.log('Has multimodal content:', hasMultimodalContent ? 'Yes' : 'No');
    
    // Default to llama3-70b-8192 if no model is specified
    const modelToUse = model || "llama3-70b-8192";
    
    console.log('Using model:', modelToUse);
    
    // Add system instruction to prevent thinking tags if not already present
    const hasSystemMessage = messages.some(msg => msg.role === 'system');
    let processedMessages = [...messages];
    
    // Get model-specific instructions
    const modelInstructions = {
      "meta-llama/llama-4-scout-17b-16e-instruct": "You are a powerful multimodal AI assistant built on Llama 4. You can analyze both text and images. When describing images, be detailed but concise. When writing code, format it clearly with appropriate syntax highlighting.",
      "llama-3.3-70b-versatile": "You are a versatile AI assistant built on the Llama 3.3 architecture. Use your knowledge to provide detailed, accurate responses. When writing code, format it clearly with appropriate syntax highlighting. For JSON, ensure proper indentation.",
      "default": "You are a helpful AI assistant. Be clear and concise in your responses."
    };
    
    if (!hasSystemMessage) {
      // Add a system message based on the model being used
      const modelSpecificInstruction = modelInstructions[modelToUse] || modelInstructions.default;
      processedMessages.unshift({
        role: 'system',
        content: `${modelSpecificInstruction} Provide direct answers without showing your internal thinking process. Do not use <think> tags or similar constructs in your responses.`
      });
    } else {      // Update existing system message to include instruction about thinking tags
      processedMessages = processedMessages.map(msg => {
        if (msg.role === 'system') {
          return {
            ...msg,
            content: `${msg.content} Provide direct answers without showing your internal thinking process. Do not use <think> tags or similar constructs in your responses.`
          };
        }
        return msg;
      });
    }
      
    // Create the completion request options    
    const completionOptions = {
      messages: processedMessages,
      model: modelToUse,
      temperature: 0.7,
      top_p: 0.9
    };

    // Some models support additional parameters
    if (modelToUse.includes('llama-4')) {
      completionOptions.max_tokens = 1024;
    }
    
    console.log('Sending request to Groq API with options:', 
      JSON.stringify({
        model: modelToUse,
        messagesCount: processedMessages.length,
        hasMultimodalContent: hasMultimodalContent || false
      })
    );
    
    const chatCompletion = await groq.chat.completions.create(completionOptions);
    
    console.log('Response received from Groq API');
    res.json(chatCompletion);
  } catch (err) {
    console.error('Error from Groq API:', err.message);
    res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`Groq proxy server running on http://localhost:${PORT}`);
});