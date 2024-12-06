const funnyMessages = [
    "analyzing those sweet soundwaves",
    "decoding your audio mysteries",
    "teaching robots to understand humans",
    "converting beeps to words",
    "doing some audio magic",
    "turning sounds into letters",
    "making sense of the noise",
    "translating human speak",
    "processing audio vibes",
    "doing the transcription dance"
];

let messageInterval;

export function showScreen(screenId) {
    // Hide all screens
    document.querySelectorAll('.screen').forEach(screen => {
        screen.classList.remove('active');
    });
    
    // Show the requested screen
    const screen = document.getElementById(screenId);
    if (!screen) {
        console.error(`Screen with ID "${screenId}" not found`);
        return;
    }
    screen.classList.add('active');

    // Handle progress screen messages
    if (screenId === 'progressScreen') {
        startRotatingMessages();
    } else {
        stopRotatingMessages();
    }
}

function startRotatingMessages() {
    const progressMessage = document.getElementById('progressMessage');
    let messageIndex = 0;

    // Clear any existing interval
    stopRotatingMessages();

    // Immediately show first message
    progressMessage.textContent = funnyMessages[messageIndex];

    // Start rotating messages
    messageInterval = setInterval(() => {
        messageIndex = (messageIndex + 1) % funnyMessages.length;
        progressMessage.textContent = funnyMessages[messageIndex];
    }, 3000); // Change message every 3 seconds
}

function stopRotatingMessages() {
    if (messageInterval) {
        clearInterval(messageInterval);
        messageInterval = null;
    }
}

export function updateRecordButton(isRecording) {
    const recordButton = document.getElementById('recordButton');
    recordButton.innerHTML = isRecording ? 
        '<i class="fas fa-circle recording"></i> Stop Recording' :
        '<i class="fas fa-circle"></i> Start Recording';
}

export function hidePreviewSection() {
    document.getElementById('previewSection').style.display = 'none';
}

export function showPreviewSection() {
    document.getElementById('previewSection').style.display = 'block';
}

export function updatePreviewPlayer(audioUrl) {
    document.getElementById('previewPlayer').src = audioUrl;
    document.getElementById('audioPlayer').src = audioUrl;
}

export function updateTranscriptionText(text) {
    // Calculate word count
    const wordCount = text.trim().split(/\s+/).length;
    
    // Update word count display
    document.getElementById('transcriptionStats').innerHTML = `<i class="fas fa-font"></i> ${wordCount} words`;
    
    // Store full text for download
    const transcriptionText = document.getElementById('transcriptionText');
    transcriptionText.dataset.fullText = text;
    
    // Create preview (first 300 characters)
    const preview = text.length > 300 ? text.substring(0, 300) + '...' : text;
    
    // Update the display with preview
    transcriptionText.textContent = preview;
    
    // Show/hide toggle button based on text length
    const showMoreButton = document.getElementById('showFullTranscription');
    if (text.length > 300) {
        showMoreButton.classList.add('visible');
        showMoreButton.textContent = 'Show Full Transcription';
        showMoreButton.dataset.expanded = 'false';
        
        // Add click handler
        showMoreButton.onclick = () => {
            const isExpanded = showMoreButton.dataset.expanded === 'true';
            if (isExpanded) {
                transcriptionText.textContent = preview;
                showMoreButton.textContent = 'Show Full Transcription';
            } else {
                transcriptionText.textContent = text;
                showMoreButton.textContent = 'Show Less';
            }
            showMoreButton.dataset.expanded = (!isExpanded).toString();
        };
    } else {
        showMoreButton.classList.remove('visible');
    }
}

export function downloadTranscription(format) {
    const text = document.getElementById('transcriptionText').dataset.fullText;
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `transcription.${format}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

export function clearFileInput() {
    document.getElementById('fileInput').value = '';
}

export function getTranscriptionOptions() {
    return {
        language: document.getElementById('language').value,
        responseFormat: document.getElementById('responseFormat').value,
        prompt: document.getElementById('prompt').value.trim()
    };
}

export function formatTranscriptionResult(result, responseFormat) {
    if (responseFormat === 'verbose_json' && result.segments) {
        try {
            // Format timestamps and text
            return result.segments.map(segment => {
                const startTime = new Date(segment.start * 1000).toISOString().substr(11, 8);
                const endTime = new Date(segment.end * 1000).toISOString().substr(11, 8);
                return `[${startTime} - ${endTime}] ${segment.text}`;
            }).join('\n');
        } catch (e) {
            console.error('Error formatting timestamps:', e);
            return result.text;
        }
    }
    return result.text;
}

export function resetApp() {
    showScreen('inputScreen');
    hidePreviewSection();
    updateTranscriptionText('');
    updateRecordButton(false);
    clearFileInput();
    hideGeneratedContent();
}

export function generateContent(type) {
    // Placeholder function for AI content generation
    alert(`AI ${type} generation coming soon!`);
}

export function showGeneratedContent(title, content) {
    const generatedContent = document.getElementById('generatedContent');
    const generatedTitle = document.getElementById('generatedTitle');
    const generatedText = document.getElementById('generatedText');
    
    generatedTitle.textContent = title;
    generatedText.textContent = content;
    generatedContent.style.display = 'block';

    // Setup event listeners
    document.getElementById('closeGenerated').onclick = hideGeneratedContent;
    
    // Copy to clipboard
    document.getElementById('copyGenerated').onclick = async () => {
        try {
            await navigator.clipboard.writeText(content);
            showTemporaryMessage('Copied to clipboard!');
        } catch (error) {
            showTemporaryMessage('Failed to copy to clipboard', true);
        }
    };
    
    // Download text
    document.getElementById('downloadGenerated').onclick = () => {
        const filename = `${title.toLowerCase().replace(/\s+/g, '_')}.txt`;
        const blob = new Blob([content], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };
}

export function showTemporaryMessage(message, isError = false) {
    const messageDiv = document.getElementById('errorMessage');
    messageDiv.textContent = message;
    messageDiv.style.backgroundColor = isError ? '#ff4444' : '#44b544';
    messageDiv.style.display = 'block';
    
    setTimeout(() => {
        messageDiv.style.display = 'none';
    }, 3000);
}

export function hideGeneratedContent() {
    const generatedContent = document.getElementById('generatedContent');
    generatedContent.style.display = 'none';
}

// Make functions available globally
window.uiManager = {
    showScreen,
    updateRecordButton,
    hidePreviewSection,
    showPreviewSection,
    updatePreviewPlayer,
    updateTranscriptionText,
    clearFileInput,
    getTranscriptionOptions,
    formatTranscriptionResult,
    resetApp,
    downloadTranscription,
    generateContent,
    showGeneratedContent,
    hideGeneratedContent,
    showTemporaryMessage
};
