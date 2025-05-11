// Utility functions for running code in the Multi Web Tools chatbot
function formatOutputValue(value) {
    if (value === undefined) return 'undefined';
    if (value === null) return 'null';
    
    if (typeof value === 'object') {
        try {
            return JSON.stringify(value, null, 2)
                .replace(/&/g, '&amp;')
                .replace(/</g, '&lt;')
                .replace(/>/g, '&gt;');
        } catch (e) {
            return String(value);
        }
    }
    
    return String(value)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
}

// Function to determine if code can be run
function canRunCode(language) {
    // List of languages we can run in the browser
    const runnableLanguages = ['javascript', 'js', 'html'];
    return runnableLanguages.includes(language.toLowerCase());
}

// Run code and display output
function runCode(code, language, outputElement) {
    if (language === 'javascript' || language === 'js') {
        try {
            // Create a secure sandbox for JavaScript execution
            const sandbox = document.createElement('iframe');
            sandbox.style.display = 'none';
            document.body.appendChild(sandbox);
            
            const sandboxWindow = sandbox.contentWindow;
            const output = [];
            
            // Prepare sandbox environment with safe console methods
            sandboxWindow.console = {
                log: function() {
                    const formattedArgs = Array.from(arguments).map(arg => {
                        if (typeof arg === 'object') {
                            try {
                                return JSON.stringify(arg, null, 2);
                            } catch (err) {
                                return '[Object]';
                            }
                        }
                        return String(arg);
                    });
                    output.push(`<div>${formattedArgs.join(' ')}</div>`);
                },
                error: function() {
                    const formattedArgs = Array.from(arguments).map(arg => {
                        if (typeof arg === 'object') {
                            try {
                                return JSON.stringify(arg, null, 2);
                            } catch (err) {
                                return '[Object]';
                            }
                        }
                        return String(arg);
                    });
                    output.push(`<div class="error">${formattedArgs.join(' ')}</div>`);
                },
                warn: function() {
                    const formattedArgs = Array.from(arguments).map(arg => {
                        if (typeof arg === 'object') {
                            try {
                                return JSON.stringify(arg, null, 2);
                            } catch (err) {
                                return '[Object]';
                            }
                        }
                        return String(arg);
                    });
                    output.push(`<div style="color: orange">${formattedArgs.join(' ')}</div>`);
                }
            };
            
            // Add a timeout to prevent infinite loops
            const timeoutPromise = new Promise((_, reject) => {
                setTimeout(() => reject(new Error('Execution timeout (10s)')), 10000);
            });
            
            // Execute with timeout
            const executePromise = new Promise((resolve) => {
                try {
                    // Execute code in sandbox with strict mode
                    const script = sandboxWindow.document.createElement('script');
                    script.textContent = `"use strict"; 
                        try {
                            const result = (function() { ${code} })();
                            window.parent.postMessage({type: 'result', value: result}, '*');
                        } catch (error) {
                            window.parent.postMessage({type: 'error', message: error.message}, '*');
                        }`;
                    
                    // Handle the message from the iframe
                    window.addEventListener('message', function execHandler(event) {
                        if (event.data && (event.data.type === 'result' || event.data.type === 'error')) {
                            window.removeEventListener('message', execHandler);
                            resolve(event.data);
                        }
                    });
                    
                    sandboxWindow.document.body.appendChild(script);
                } catch (error) {
                    resolve({type: 'error', message: error.message});
                }
            });
            
            // Race between execution and timeout
            Promise.race([executePromise, timeoutPromise])
                .then((result) => {
                    // Clean up the sandbox
                    document.body.removeChild(sandbox);
                    
                    // Display output
                    outputElement.innerHTML = '<div class="output-wrapper"></div>';
                    const outputWrapper = outputElement.querySelector('.output-wrapper');
                    
                    if (output.length > 0) {
                        outputWrapper.innerHTML = output.join('');
                        
                        if (result?.type === 'result' && result.value !== undefined) {
                            const returnDiv = document.createElement('div');
                            returnDiv.className = 'info';
                            returnDiv.innerHTML = `<strong>Return value:</strong> <pre>${formatOutputValue(result.value)}</pre>`;
                            outputWrapper.appendChild(returnDiv);
                        }
                    } else if (result?.type === 'result' && result.value !== undefined) {
                        const resultDiv = document.createElement('div');
                        resultDiv.className = 'success';
                        resultDiv.innerHTML = `<pre>${formatOutputValue(result.value)}</pre>`;
                        outputWrapper.appendChild(resultDiv);
                    } else if (result?.type !== 'error') {
                        outputWrapper.innerHTML = '<div class="success">Code executed successfully with no output.</div>';
                    }
                })
                .catch((error) => {
                    // Clean up the sandbox
                    document.body.removeChild(sandbox);
                    outputElement.innerHTML = `<div class="error">Error: ${error.message}</div>`;
                });
        } catch (error) {
            outputElement.innerHTML = `<div class="error">Error: ${error.message}</div>`;
        }
    } else if (language === 'html') {
        try {
            // Create sandbox iframe for HTML
            const iframe = document.createElement('iframe');
            iframe.style.width = '100%';
            iframe.style.height = '280px';
            iframe.style.border = '1px solid #ddd';
            iframe.style.borderRadius = '4px';
            iframe.setAttribute('sandbox', 'allow-scripts allow-forms');
            
            outputElement.innerHTML = '';
            outputElement.appendChild(iframe);
            
            // Set iframe content
            const doc = iframe.contentWindow.document;
            doc.open();
            doc.write(code);
            doc.close();
        } catch (error) {
            outputElement.innerHTML = `<div class="error">Error rendering HTML: ${error.message}</div>`;
        }
    } else {
        outputElement.innerHTML = `<div class="info">Running ${language} code is not supported in the browser.</div>`;
    }
}
