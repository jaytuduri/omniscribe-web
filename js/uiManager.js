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
    let messageDiv = document.getElementById('errorMessage');
    
    // Create the message div if it doesn't exist
    if (!messageDiv) {
        messageDiv = document.createElement('div');
        messageDiv.id = 'errorMessage';
        messageDiv.style.position = 'fixed';
        messageDiv.style.top = '20px';
        messageDiv.style.left = '50%';
        messageDiv.style.transform = 'translateX(-50%)';
        messageDiv.style.padding = '10px 20px';
        messageDiv.style.borderRadius = '5px';
        messageDiv.style.zIndex = '1000';
        document.body.appendChild(messageDiv);
    }
    
    messageDiv.textContent = message;
    messageDiv.style.backgroundColor = isError ? '#ff4444' : '#44b544';
    messageDiv.style.color = '#ffffff';
    messageDiv.style.display = 'block';
    
    setTimeout(() => {
        if (messageDiv && messageDiv.parentNode) {
            messageDiv.style.display = 'none';
        }
    }, 3000);
}

export function hideGeneratedContent() {
    const generatedContent = document.getElementById('generatedContent');
    generatedContent.style.display = 'none';
}

export function initializeUI() {
    initializeTranscriptionOptions();
}

function initializeTranscriptionOptions() {
    const toggleButton = document.getElementById('toggleOptions');
    const optionsSection = document.querySelector('.transcription-options');

    if (toggleButton && optionsSection) {
        toggleButton.addEventListener('click', () => {
            toggleButton.classList.toggle('active');
            optionsSection.classList.toggle('collapsed');
            
            // Set a specific height when expanded to enable smooth animation
            if (!optionsSection.classList.contains('collapsed')) {
                const height = optionsSection.scrollHeight;
                optionsSection.style.height = height + 'px';
            } else {
                optionsSection.style.height = '0';
            }
        });
    }
}

export function showSavedTranscriptions(transcriptions) {
    const transcriptionsList = document.createElement('div');
    transcriptionsList.className = 'transcriptions-list';

    transcriptions.forEach(transcription => {
        const item = document.createElement('div');
        item.className = 'transcription-item';
        
        const header = document.createElement('div');
        header.className = 'transcription-header';
        
        const timestamp = document.createElement('span');
        timestamp.textContent = formatTimestamp(transcription.timestamp);
        
        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'delete-btn';
        deleteBtn.innerHTML = '<i class="fas fa-trash"></i>';
        deleteBtn.onclick = () => {
            window.app.deleteTranscription(transcription.id);
            item.remove();
        };
        
        const text = document.createElement('div');
        text.className = 'transcription-text';
        text.textContent = transcription.text.substring(0, 100) + (transcription.text.length > 100 ? '...' : '');
        
        const loadBtn = document.createElement('button');
        loadBtn.className = 'load-btn';
        loadBtn.textContent = 'Load';
        loadBtn.onclick = () => {
            updateTranscriptionText(transcription.text);
            hideGeneratedContent();
            showScreen('mainScreen');
        };
        
        header.appendChild(timestamp);
        header.appendChild(deleteBtn);
        item.appendChild(header);
        item.appendChild(text);
        item.appendChild(loadBtn);
        transcriptionsList.appendChild(item);
    });

    const content = document.querySelector('#generatedContent .content');
    content.innerHTML = '';
    content.appendChild(transcriptionsList);
    showGeneratedContent('Saved Transcriptions', '');
}

// Make functions available globally
window.uiManager = {
    showScreen,
    updateRecordButton,
    hidePreviewSection,
    showPreviewSection,
    updatePreviewPlayer,
    updateTranscriptionText,
    downloadTranscription,
    clearFileInput,
    getTranscriptionOptions,
    formatTranscriptionResult,
    resetApp,
    generateContent,
    showGeneratedContent,
    hideGeneratedContent,
    showTemporaryMessage,
    initializeUI,
    showSavedTranscriptions
};
