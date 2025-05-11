#!/bin/bash

echo "Starting Groq API Proxy Server..."
node groq-proxy.js &
SERVER_PID=$!

echo "Wait for server to start..."
sleep 2

echo "Opening chatbot in browser..."
# Try to detect the OS and use the appropriate command
if [[ "$OSTYPE" == "darwin"* ]]; then
    # macOS
    open "http://localhost:3002/"
elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
    # Linux
    xdg-open "http://localhost:3002/" 2>/dev/null || firefox "http://localhost:3002/" 2>/dev/null || google-chrome "http://localhost:3002/" 2>/dev/null
else
    echo "Please navigate to: http://localhost:3002/"
fi

echo "Chatbot server is running. Press Ctrl+C to stop."
wait $SERVER_PID
