export async function uploadAudio(file, apiUrl, options = {}) {
    const { language, responseFormat, prompt } = options;
    
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
    const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
            'Accept': 'application/json',
        },
        body: formData
    });
    
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
}
