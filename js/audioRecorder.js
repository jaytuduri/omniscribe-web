let mediaRecorder = null;
let audioStream = null;
let audioChunks = [];
let isRecording = false;
let currentAudioBlob = null;

export function getSupportedMimeType(mimeTypes) {
    for (const type of mimeTypes) {
        if (MediaRecorder.isTypeSupported(type)) {
            console.log('Using MIME type:', type);
            return type;
        }
    }
    throw new Error('No supported audio MIME type found in this browser');
}

export function stopMediaTracks() {
    if (audioStream) {
        audioStream.getTracks().forEach(track => track.stop());
        audioStream = null;
    }
}

export async function initializeRecording(mimeTypes, onDataAvailable, onRecordingStop) {
    try {
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
        const mimeType = getSupportedMimeType(mimeTypes);
        
        mediaRecorder = new MediaRecorder(audioStream, {
            mimeType: mimeType,
            audioBitsPerSecond: 128000
        });
        
        console.log('MediaRecorder initialized with options:', {
            mimeType: mediaRecorder.mimeType,
            audioBitsPerSecond: 128000
        });
        
        mediaRecorder.ondataavailable = onDataAvailable;
        mediaRecorder.onstop = onRecordingStop;
        
        audioChunks = [];
        mediaRecorder.start(1000);
        console.log('Recording started');
        isRecording = true;
        
        return true;
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
        
        throw new Error(errorMessage);
    }
}

export async function stopRecording() {
    if (mediaRecorder && mediaRecorder.state !== 'inactive') {
        mediaRecorder.stop();
        mediaRecorder.stream.getTracks().forEach(track => track.stop());
        isRecording = false;
        return true;
    }
    return false;
}

export function getIsRecording() {
    return isRecording;
}

export function getCurrentAudioBlob() {
    return currentAudioBlob;
}

export function setCurrentAudioBlob(blob) {
    currentAudioBlob = blob;
}

export function getAudioChunks() {
    return audioChunks;
}

export function clearAudioData() {
    currentAudioBlob = null;
    audioChunks = [];
    stopMediaTracks();
    isRecording = false;
}
