const API_URL = 'https://omniscribe-production.up.railway.app/api/v1/audio/transcriptions';
let mediaRecorder = null;
let audioStream = null;
let audioChunks = [];
let isRecording = false;
let currentAudioBlob = null;

// Function to get supported MIME type
function getSupportedMimeType() {
    const types = [
        'audio/webm',
        'audio/webm;codecs=opus',
        'audio/ogg;codecs=opus',
        'audio/mp4',
        'audio/mpeg'
    ];
    
    for (const type of types) {
        if (MediaRecorder.isTypeSupported(type)) {
            console.log('Using MIME type:', type);
            return type;
        }
    }
    
    throw new Error('No supported audio MIME type found in this browser');
}

function showScreen(screenId) {
    // Hide all screens
    document.querySelectorAll('.screen').forEach(screen => {
        screen.classList.remove('active');
    });
    // Show the requested screen
    document.getElementById(screenId).classList.add('active');
}

function stopMediaTracks() {
    if (audioStream) {
        audioStream.getTracks().forEach(track => track.stop());
        audioStream = null;
    }
}

async function uploadAudio(file) {
    try {
        showScreen('progressScreen');
        
        // Get transcription options
        const language = document.getElementById('language').value;
        const responseFormat = document.getElementById('responseFormat').value;
        const prompt = document.getElementById('prompt').value.trim();
        
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
        const response = await fetch(API_URL, {
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
        
        let result;
        try {
            result = responseFormat === 'text' ? { text: responseText } : JSON.parse(responseText);
        } catch (e) {
            console.error('Error parsing response:', e);
            result = { text: responseText };
        }
        
        // Update UI with results
        const audioPlayer = document.getElementById('audioPlayer');
        audioPlayer.src = URL.createObjectURL(file);
        
        // Handle different response formats
        if (responseFormat === 'verbose_json' && result.segments) {
            try {
                // Format timestamps and text
                const formattedText = result.segments.map(segment => {
                    const startTime = new Date(segment.start * 1000).toISOString().substr(11, 8);
                    const endTime = new Date(segment.end * 1000).toISOString().substr(11, 8);
                    return `[${startTime} - ${endTime}] ${segment.text}`;
                }).join('\n');
                document.getElementById('transcriptionText').textContent = formattedText;
            } catch (e) {
                console.error('Error formatting timestamps:', e);
                // Fallback to displaying just the text
                document.getElementById('transcriptionText').textContent = result.text || responseText;
            }
        } else {
            // For text or json format, or when segments are not available
            document.getElementById('transcriptionText').textContent = result.text || responseText;
        }
        
        // Show the result screen
        showScreen('resultScreen');
        
    } catch (error) {
        console.error('Upload error:', error);
        alert('Error: ' + error.message);
        showScreen('inputScreen');
    }
}

async function initializeRecording() {
    try {
        // Stop any existing tracks
        stopMediaTracks();
        
        console.log('Requesting microphone access...');
        audioStream = await navigator.mediaDevices.getUserMedia({
            audio: {
                echoCancellation: true,
                noiseSuppression: true,
                sampleRate: 44100
            }
        });
        
        console.log('Microphone access granted, initializing MediaRecorder...');
        
        // Get supported MIME type
        const mimeType = getSupportedMimeType();
        
        mediaRecorder = new MediaRecorder(audioStream, {
            mimeType: mimeType,
            audioBitsPerSecond: 128000
        });
        
        console.log('MediaRecorder initialized with options:', {
            mimeType: mediaRecorder.mimeType,
            audioBitsPerSecond: 128000
        });
        
        mediaRecorder.ondataavailable = (event) => {
            if (event.data.size > 0) {
                audioChunks.push(event.data);
                console.log('Received audio chunk:', event.data.size, 'bytes');
            }
        };
        
        mediaRecorder.onstop = async () => {
            console.log('Recording stopped, processing audio...');
            if (audioChunks.length > 0) {
                currentAudioBlob = new Blob(audioChunks, { type: mediaRecorder.mimeType });
                console.log('Created audio blob:', currentAudioBlob.size, 'bytes,', currentAudioBlob.type);
                
                const previewPlayer = document.getElementById('previewPlayer');
                previewPlayer.src = URL.createObjectURL(currentAudioBlob);
                document.getElementById('previewSection').style.display = 'block';
                console.log('Audio preview ready');
            } else {
                console.error('No audio data recorded');
                alert('No audio data was recorded. Please try again.');
            }
        };
        
        // Start recording
        audioChunks = [];
        mediaRecorder.start(1000); // Collect data every second
        console.log('Recording started');
        
        document.getElementById('recordButton').textContent = 'Stop Recording';
        document.getElementById('recordButton').classList.add('recording');
        isRecording = true;
        
    } catch (error) {
        console.error('Recording initialization error:', error);
        let errorMessage = 'Unable to access microphone. ';
        
        if (error.message.includes('MIME type')) {
            errorMessage = 'Your browser does not support audio recording. Please try using Chrome, Firefox, or Edge.';
        } else if (error.name === 'NotAllowedError') {
            errorMessage += 'Please allow microphone access in your browser settings.';
        } else if (error.name === 'NotFoundError') {
            errorMessage += 'No microphone device found. Please connect a microphone.';
        } else if (error.name === 'NotReadableError') {
            errorMessage += 'Your microphone is busy or not responding. Please try again.';
        } else {
            errorMessage += error.message || 'Please check your microphone settings and try again.';
        }
        
        alert(errorMessage);
        
        // Reset UI
        document.getElementById('recordButton').textContent = 'Start Recording';
        document.getElementById('recordButton').classList.remove('recording');
        isRecording = false;
    }
}

function resetApp() {
    showScreen('inputScreen');
    document.getElementById('previewSection').style.display = 'none';
    document.getElementById('transcriptionText').textContent = '';
    document.getElementById('recordButton').textContent = 'Start Recording';
    document.getElementById('recordButton').classList.remove('recording');
    document.getElementById('fileInput').value = '';
    currentAudioBlob = null;
    audioChunks = [];
    stopMediaTracks();
    isRecording = false;
}

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
    // Handle record button click
    document.getElementById('recordButton').addEventListener('click', async () => {
        if (isRecording) {
            // Stop recording
            if (mediaRecorder && mediaRecorder.state !== 'inactive') {
                mediaRecorder.stop();
                stopMediaTracks();
            }
            document.getElementById('recordButton').textContent = 'Start New Recording';
            document.getElementById('recordButton').classList.remove('recording');
            isRecording = false;
        } else {
            // Hide preview section when starting new recording
            document.getElementById('previewSection').style.display = 'none';
            // Start new recording
            await initializeRecording();
        }
    });

    // Handle transcribe button click
    document.getElementById('transcribeButton').addEventListener('click', async () => {
        if (currentAudioBlob) {
            // Create a file with the correct extension based on MIME type
            let extension = 'webm';
            if (currentAudioBlob.type.includes('ogg')) {
                extension = 'ogg';
            } else if (currentAudioBlob.type.includes('mp4')) {
                extension = 'mp4';
            } else if (currentAudioBlob.type.includes('mpeg') || currentAudioBlob.type.includes('mp3')) {
                extension = 'mp3';
            }
            
            const file = new File([currentAudioBlob], `recording.${extension}`, { type: currentAudioBlob.type });
            console.log('Sending file for transcription:', file.name, file.type, file.size, 'bytes');
            await uploadAudio(file);
        }
    });

    // Handle file upload
    document.getElementById('fileInput').addEventListener('change', async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        
        // Show preview for uploaded file
        document.getElementById('previewPlayer').src = URL.createObjectURL(file);
        document.getElementById('previewSection').style.display = 'block';
        currentAudioBlob = file;
    });
});
