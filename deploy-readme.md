<<<<<<< HEAD
# Deploying the Multi Web Tools Chatbot

This document explains how to deploy your chatbot application to make it accessible online.

## Understanding the Architecture

Your application has two main components:
1. **Frontend**: HTML, CSS, and client-side JavaScript files
2. **Backend**: Node.js server (`groq-proxy.js`) that securely connects to the Groq API

## Deployment Options

### Option 1: Deploy Frontend to GitHub Pages + Backend to a Cloud Service

This is the recommended approach for maintaining security and functionality.

#### Step 1: Deploy the Backend

Deploy your Node.js backend to one of these services:
- [Render](https://render.com/) (Has a free tier)
- [Railway](https://railway.app/)
- [Vercel](https://vercel.com/) 
- [Heroku](https://www.heroku.com/)
- [Netlify Functions](https://www.netlify.com/products/functions/)

**For Render.com (easy deployment):**

1. Sign up for a Render account
2. Create a new Web Service
3. Connect your GitHub repository
4. Configure as follows:
   - Build Command: `npm install`
   - Start Command: `node groq-proxy.js`
5. Add your Groq API key as an environment variable named `GROQ_API_KEY`
6. Deploy the service

#### Step 2: Update the Frontend Code

1. Edit `chatbot.js` to use your deployed backend URL:
   ```javascript
   // Change this line
   const API_URL = 'http://localhost:3002'; // Local development
   // To this:
   const API_URL = 'https://your-deployed-backend-url.com'; // Production URL
   ```

2. Update `groq-proxy.js` to use environment variables for API keys:
   ```javascript
   // Change this
   const groq = new Groq({ apiKey: 'your-api-key-here' });
   
   // To this:
   const groq = new Groq({ 
     apiKey: process.env.GROQ_API_KEY || 'development-key-here'
   });
   ```

3. Add CORS configuration to allow requests from your GitHub Pages domain:
   ```javascript
   app.use(cors({
     origin: ['http://localhost:5500', 'https://yourusername.github.io']
   }));
   ```

#### Step 3: Deploy Frontend to GitHub Pages

1. Create a GitHub repository
2. Push your code to the repository
3. Go to Settings > Pages
4. Select the branch to deploy (usually `main` or `master`)
5. Your site will be available at `https://yourusername.github.io/repository-name/`

### Option 2: Use a Complete Hosting Service

Services like [Netlify](https://www.netlify.com/) or [Vercel](https://vercel.com/) can host both your frontend and backend together.

1. Sign up for an account
2. Connect your GitHub repository
3. Configure build settings
4. Add your API key as an environment variable
5. Deploy the application

## Security Considerations

1. **Never** commit API keys to your repository
2. Always use environment variables for sensitive information
3. Consider adding rate limiting to protect your API usage

## Local Development vs. Production

- Use the local server (`http://localhost:3002`) during development
- Switch to the deployed backend URL for production
- You can use environment variables or configuration files to manage this switch

## Testing the Deployment

After deployment, test thoroughly:
1. Can you send messages?
2. Are responses received correctly?
3. Do all features (code execution, image uploads) work?

## Troubleshooting

- Check browser console for errors
- Verify CORS settings are correct
- Ensure API keys are properly set in environment variables
- Check server logs for backend errors
=======
# Deploying the Multi Web Tools Chatbot

This document explains how to deploy your chatbot application to make it accessible online.

## Understanding the Architecture

Your application has two main components:
1. **Frontend**: HTML, CSS, and client-side JavaScript files
2. **Backend**: Node.js server (`groq-proxy.js`) that securely connects to the Groq API

## Deployment Options

### Option 1: Deploy Frontend to GitHub Pages + Backend to a Cloud Service

This is the recommended approach for maintaining security and functionality.

#### Step 1: Deploy the Backend

Deploy your Node.js backend to one of these services:
- [Render](https://render.com/) (Has a free tier)
- [Railway](https://railway.app/)
- [Vercel](https://vercel.com/) 
- [Heroku](https://www.heroku.com/)
- [Netlify Functions](https://www.netlify.com/products/functions/)

**For Render.com (easy deployment):**

1. Sign up for a Render account
2. Create a new Web Service
3. Connect your GitHub repository
4. Configure as follows:
   - Build Command: `npm install`
   - Start Command: `node groq-proxy.js`
5. Add your Groq API key as an environment variable named `GROQ_API_KEY`
6. Deploy the service

#### Step 2: Update the Frontend Code

1. Edit `chatbot.js` to use your deployed backend URL:
   ```javascript
   // Change this line
   const API_URL = 'http://localhost:3002'; // Local development
   // To this:
   const API_URL = 'https://your-deployed-backend-url.com'; // Production URL
   ```

2. Update `groq-proxy.js` to use environment variables for API keys:
   ```javascript
   // Change this
   const groq = new Groq({ apiKey: 'your-api-key-here' });
   
   // To this:
   const groq = new Groq({ 
     apiKey: process.env.GROQ_API_KEY || 'development-key-here'
   });
   ```

3. Add CORS configuration to allow requests from your GitHub Pages domain:
   ```javascript
   app.use(cors({
     origin: ['http://localhost:5500', 'https://yourusername.github.io']
   }));
   ```

#### Step 3: Deploy Frontend to GitHub Pages

1. Create a GitHub repository
2. Push your code to the repository
3. Go to Settings > Pages
4. Select the branch to deploy (usually `main` or `master`)
5. Your site will be available at `https://yourusername.github.io/repository-name/`

### Option 2: Use a Complete Hosting Service

Services like [Netlify](https://www.netlify.com/) or [Vercel](https://vercel.com/) can host both your frontend and backend together.

1. Sign up for an account
2. Connect your GitHub repository
3. Configure build settings
4. Add your API key as an environment variable
5. Deploy the application

## Security Considerations

1. **Never** commit API keys to your repository
2. Always use environment variables for sensitive information
3. Consider adding rate limiting to protect your API usage

## Local Development vs. Production

- Use the local server (`http://localhost:3002`) during development
- Switch to the deployed backend URL for production
- You can use environment variables or configuration files to manage this switch

## Testing the Deployment

After deployment, test thoroughly:
1. Can you send messages?
2. Are responses received correctly?
3. Do all features (code execution, image uploads) work?

## Troubleshooting

- Check browser console for errors
- Verify CORS settings are correct
- Ensure API keys are properly set in environment variables
- Check server logs for backend errors
>>>>>>> master
