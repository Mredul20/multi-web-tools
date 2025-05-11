// Simple OpenRouter proxy server for local development
const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');

const app = express();
const PORT = 3001;

// Replace with your actual OpenRouter API key
const OPENROUTER_API_KEY = 'sk-or-v1-fba3ca80fc891ee6b988636132402335f485f712f9a7448309089e64953d932';
const OPENROUTER_TITLE = 'Multi Web Tools Chatbot';

app.use(cors());
app.use(express.json());

app.post('/chat', async (req, res) => {
  try {
    const { messages, model, max_tokens, temperature } = req.body;
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + OPENROUTER_API_KEY,
        'HTTP-Referer': 'http://localhost',
        'X-Title': OPENROUTER_TITLE
      },
      body: JSON.stringify({
        model: model || 'openai/gpt-3.5-turbo',
        messages,
        max_tokens: max_tokens || 512,
        temperature: temperature || 0.7
      })
    });
    const text = await response.text();
    if (!response.ok) {
      console.error('OpenRouter API error:', response.status, text);
      return res.status(response.status).json({ error: text });
    }
    let data;
    try {
      data = JSON.parse(text);
    } catch (parseErr) {
      console.error('JSON parse error:', parseErr, text);
      return res.status(500).json({ error: 'Invalid JSON from OpenRouter' });
    }
    res.json(data);
  } catch (err) {
    console.error('Proxy server error:', err);
    res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`OpenRouter proxy server running on http://localhost:${PORT}`);
});
