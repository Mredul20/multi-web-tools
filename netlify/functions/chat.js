// Netlify serverless function to handle Groq API requests
const Groq = require('groq-sdk');

exports.handler = async (event, context) => {
  // Set headers for CORS
  const headers = {
    'Access-Control-Allow-Origin': '*', // Or set to your specific domain in production
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Content-Type': 'application/json'
  };

  // Handle preflight OPTIONS request
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: ''
    };
  }

  // Only allow POST requests
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    // Parse the request body
    const body = JSON.parse(event.body);
    const { messages, model, hasMultimodalContent } = body;
    
    // Use environment variable for API key
    const apiKey = process.env.GROQ_API_KEY;
    
    if (!apiKey) {
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ 
          error: 'Missing GROQ_API_KEY environment variable' 
        })
      };
    }

    const groq = new Groq({ apiKey });
    
    // Default to llama3-70b-8192 if no model is specified
    const modelToUse = model || "llama3-70b-8192";
    
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
    } else {
      // Update existing system message to include instruction about thinking tags
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
    
    const chatCompletion = await groq.chat.completions.create(completionOptions);
    
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(chatCompletion)
    };
  } catch (err) {
    console.error('Error from Groq API:', err.message);
    
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: err.message })
    };
  }
};
