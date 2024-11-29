import { API_URL, MIME_TYPES } from './config.js';
import * as audioRecorder from './audioRecorder.js';
import * as api from './api.js';
import * as ui from './uiManager.js';

// Theme Switcher
function initializeThemeSwitcher() {
    const themeToggle = document.getElementById('themeToggle');
    const themeIcon = themeToggle.querySelector('i');
    const systemDarkMode = window.matchMedia('(prefers-color-scheme: dark)');

    // Theme cycle: system -> light -> dark -> system
    const themes = ['system', 'light', 'dark'];
    const icons = {
        system: 'fa-desktop',
        light: 'fa-sun',
        dark: 'fa-moon'
    };

    function getCurrentTheme() {
        return localStorage.getItem('theme') || 'system';
    }

    function getNextTheme(currentTheme) {
        const currentIndex = themes.indexOf(currentTheme);
        return themes[(currentIndex + 1) % themes.length];
    }

    function updateThemeIcon(theme) {
        // Remove all possible icons
        themeIcon.classList.remove('fa-desktop', 'fa-sun', 'fa-moon');
        // Add the correct icon
        themeIcon.classList.add(icons[theme]);
    }

    function setTheme(theme) {
        if (theme === 'system') {
            document.documentElement.dataset.theme = systemDarkMode.matches ? 'dark' : 'light';
        } else {
            document.documentElement.dataset.theme = theme;
        }
        localStorage.setItem('theme', theme);
        updateThemeIcon(theme);
    }

    // Add click event listener
    themeToggle.addEventListener('click', () => {
        const currentTheme = getCurrentTheme();
        const nextTheme = getNextTheme(currentTheme);
        setTheme(nextTheme);
    });

    // Listen for system theme changes
    systemDarkMode.addEventListener('change', (e) => {
        if (getCurrentTheme() === 'system') {
            document.documentElement.dataset.theme = e.matches ? 'dark' : 'light';
        }
    });

    // Set initial theme
    setTheme(getCurrentTheme());
}

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
    initializeThemeSwitcher();

    // Handle record button click
    document.getElementById('recordButton').addEventListener('click', async () => {
        if (audioRecorder.getIsRecording()) {
            // Stop recording
            await audioRecorder.stopRecording();
            ui.updateRecordButton(false);
        } else {
            // Hide preview section when starting new recording
            ui.hidePreviewSection();
            
            try {
                // Start new recording
                await audioRecorder.initializeRecording(
                    MIME_TYPES,
                    (event) => {
                        if (event.data.size > 0) {
                            audioRecorder.getAudioChunks().push(event.data);
                            console.log('Received audio chunk:', event.data.size, 'bytes');
                        }
                    },
                    async () => {
                        console.log('Recording stopped, processing audio...');
                        const chunks = audioRecorder.getAudioChunks();
                        if (chunks.length > 0) {
                            const blob = new Blob(chunks, { type: chunks[0].type });
                            console.log('Created audio blob:', blob.size, 'bytes,', blob.type);
                            
                            audioRecorder.setCurrentAudioBlob(blob);
                            ui.updatePreviewPlayer(URL.createObjectURL(blob));
                            ui.showPreviewSection();
                            console.log('Audio preview ready');
                        } else {
                            console.error('No audio data recorded');
                            alert('No audio data was recorded. Please try again.');
                        }
                    }
                );
                ui.updateRecordButton(true);
            } catch (error) {
                alert(error.message);
                ui.updateRecordButton(false);
            }
        }
    });

    // Handle transcribe button click
    document.getElementById('transcribeButton').addEventListener('click', async () => {
        const currentAudioBlob = audioRecorder.getCurrentAudioBlob();
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
            
            try {
                ui.showScreen('progressScreen');
                const options = ui.getTranscriptionOptions();
                const result = await api.uploadAudio(file, API_URL, options);
                
                ui.updatePreviewPlayer(URL.createObjectURL(file));
                const formattedText = ui.formatTranscriptionResult(result, options.responseFormat);
                ui.updateTranscriptionText(formattedText);
                ui.showScreen('resultScreen');
            } catch (error) {
                console.error('Upload error:', error);
                alert('Error: ' + error.message);
                ui.showScreen('inputScreen');
            }
        }
    });

    // Handle file upload
    document.getElementById('fileInput').addEventListener('change', async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        
        // Show preview for uploaded file
        ui.updatePreviewPlayer(URL.createObjectURL(file));
        ui.showPreviewSection();
        audioRecorder.setCurrentAudioBlob(file);
    });

    // Handle reset button click
    document.getElementById('resetButton').addEventListener('click', () => {
        ui.resetApp();
        audioRecorder.clearAudioData();
    });
});
