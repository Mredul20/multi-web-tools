# Deploying Multi Web Tools to Netlify

This guide explains how to deploy the Multi Web Tools application, including the chatbot feature, to Netlify.

## Prerequisites

1. A [Netlify](https://www.netlify.com/) account
2. A [Groq](https://groq.com/) API key

## Deployment Steps

### 1. Set Up Your Repository

First, push your code to a GitHub repository:

```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/yourusername/multi-web-tools.git
git push -u origin main
```

### 2. Connect to Netlify

1. Log in to your Netlify account
2. Click "Add new site" > "Import an existing project"
3. Select GitHub as your Git provider
4. Authorize Netlify to access your GitHub account
5. Select the repository you created

### 3. Configure Build Settings

In the Netlify deploy settings, configure the following:

- **Build command**: Leave blank (we're not building anything)
- **Publish directory**: `.` (the root directory)

### 4. Set Environment Variables

After deployment, go to Site settings > Environment variables and add:

- `GROQ_API_KEY`: Your Groq API key

### 5. Deploy

Click "Deploy site" and wait for Netlify to deploy your application.

## How It Works

The application uses Netlify Functions (serverless functions) as a backend replacement for the original Node.js server. Here's how it works:

1. **Frontend**: The chatbot interface in `chatbot.html` and `chatbot.js` remains largely the same
2. **Backend**: Instead of `groq-proxy.js` running on a local server, we use Netlify Functions in the `netlify/functions` directory
3. **API Endpoints**:
   - `/api/chat` - Replaces the original `/chat` endpoint for AI conversations
   - `/api` - Replaces the original root endpoint for checking if the server is running

## Local Development

For local development, you still need to run the original Node.js server:

```bash
node groq-proxy.js
```

Then open `chatbot.html` in your browser.

The updated code in `chatbot.js` automatically detects if you're running locally or in production and adjusts the API endpoints accordingly.

## Troubleshooting

### API Key Issues

If the chatbot returns an error about a missing API key, make sure you've:

1. Set the `GROQ_API_KEY` environment variable in Netlify
2. Redeployed the site after setting the environment variable

### CORS Issues

If you encounter CORS errors, check:

1. The Netlify Function's CORS headers are properly set
2. Your frontend code is accessing the correct API endpoint

### Function Timeouts

Netlify Functions have a default timeout of 10 seconds. If your responses take longer, you might need to adjust your function settings in the `netlify.toml` file.
