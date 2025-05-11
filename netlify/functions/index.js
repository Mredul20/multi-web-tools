// Netlify serverless function for the root endpoint
exports.handler = async (event, context) => {
  // Set headers for CORS
  const headers = {
    'Access-Control-Allow-Origin': '*', // Or set to your specific domain in production
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Content-Type': 'text/html'
  };

  // Handle preflight OPTIONS request
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: ''
    };
  }

  // Return a simple HTML page for GET requests
  return {
    statusCode: 200,
    headers,
    body: `
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
          <p>This server is deployed as a Netlify Function to handle API requests for your chatbot.</p>
        </body>
      </html>
    `
  };
};
