export function showScreen(screenId) {
    // Hide all screens
    document.querySelectorAll('.screen').forEach(screen => {
        screen.classList.remove('active');
    });
    // Show the requested screen
    document.getElementById(screenId).classList.add('active');
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
}

export function updateTranscriptionText(text) {
    document.getElementById('transcriptionText').textContent = text;
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
