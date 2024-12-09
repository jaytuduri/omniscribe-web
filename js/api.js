import config from './config.js';

export async function uploadAudio(file, options = {}) {
    const { language, responseFormat = 'text', prompt } = options;
    
    // Create FormData and append file and options
    const formData = new FormData();
    formData.append('file', file);
    formData.append('response_format', responseFormat);
    
    // Only append non-empty values
    if (language) {
        formData.append('language', language);
    }
    if (prompt) {
        formData.append('prompt', prompt);
    }
    
    console.log('Uploading file:', file.name, 'Size:', file.size, 'Type:', file.type);
    
    try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 60000); // 1 minute timeout
        
        const response = await fetch(config.API_BASE_URL + '/api/v1/audio/transcriptions', {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
            },
            body: formData,
            signal: controller.signal
        });
        
        clearTimeout(timeout);
        
        console.log('Response status:', response.status);
        const responseText = await response.text();
        console.log('Response text:', responseText);
        
        if (!response.ok) {
            let errorMessage;
            try {
                const errorData = JSON.parse(responseText);
                errorMessage = errorData.error || 'Transcription failed';
            } catch (e) {
                errorMessage = `Server error (${response.status}): ${responseText}`;
            }
            throw new Error(errorMessage);
        }
        
        try {
            return responseFormat === 'text' ? { text: responseText } : JSON.parse(responseText);
        } catch (e) {
            console.error('Error parsing response:', e);
            return { text: responseText };
        }
    } catch (error) {
        if (error.name === 'AbortError') {
            throw new Error('Request timed out. The file might be too large or the server is taking too long to respond.');
        }
        throw error;
    }
}

export async function generateText(text, mode, options = {}) {
    const endpoint = mode.toLowerCase() === 'cleanup' ? '/api/v1/text/cleanup' : '/api/v1/text/generate';
    const apiUrl = `${config.API_BASE_URL}${endpoint}`;
    const { temperature = 0.7, custom_prompt } = options;
    
    const requestBody = {
        text,
        temperature
    };

    // Only add mode and custom_prompt for generate endpoint
    if (endpoint === '/api/v1/text/generate') {
        requestBody.mode = mode.toLowerCase();
        if (custom_prompt) {
            requestBody.custom_prompt = custom_prompt;
        }
    }
    
    console.log('Generating text:', { mode, endpoint, ...options });
    const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Origin': window.location.origin
        },
        body: JSON.stringify(requestBody)
    });
    
    console.log('Response status:', response.status);
    const responseText = await response.text();
    console.log('Response text:', responseText);
    
    if (!response.ok) {
        let errorMessage;
        try {
            const errorData = JSON.parse(responseText);
            errorMessage = errorData.error || 'Text generation failed';
        } catch (e) {
            errorMessage = `Server error (${response.status}): ${responseText}`;
        }
        throw new Error(errorMessage);
    }
    
    try {
        return JSON.parse(responseText);
    } catch (e) {
        console.error('Error parsing response:', e);
        return { text: responseText };
    }
}

// Make API functions available globally
window.api = {
    uploadAudio,
    generateText
};
