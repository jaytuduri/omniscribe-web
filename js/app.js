import config from './config.js';
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

    // Initialize theme
    setTheme(getCurrentTheme());

    // Listen for system theme changes
    systemDarkMode.addEventListener('change', (e) => {
        if (getCurrentTheme() === 'system') {
            document.documentElement.dataset.theme = e.matches ? 'dark' : 'light';
        }
    });
}

// File Upload Handling
async function handleFileUpload(file) {
    if (!config.MIME_TYPES.includes(file.type)) {
        ui.showTemporaryMessage('Please select a valid audio or video file', true);
        return;
    }

    // Show preview immediately after file selection
    ui.updatePreviewPlayer(URL.createObjectURL(file));
    ui.showPreviewSection();
}

// Transcription Handling
async function handleTranscription(file) {
    try {
        ui.showScreen('progressScreen');

        const options = ui.getTranscriptionOptions();
        const response = await api.uploadAudio(file, options);

        ui.updateTranscriptionText(response.text);
        ui.showScreen('resultScreen');
    } catch (error) {
        console.error('Upload failed:', error);
        ui.showTemporaryMessage(error.message, true);
        ui.showScreen('inputScreen');
    }
}

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
    initializeThemeSwitcher();
    ui.initializeUI();  // Initialize all UI components

    // File Input Change
    const fileInput = document.getElementById('fileInput');
    let currentFile = null;

    fileInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            currentFile = file;
            handleFileUpload(file);
        }
    });

    // Transcribe Button Click
    const transcribeButton = document.getElementById('transcribeButton');
    transcribeButton.addEventListener('click', () => {
        if (currentFile) {
            handleTranscription(currentFile);
        }
    });

    // Record Button Click
    const recordButton = document.getElementById('recordButton');
    recordButton.addEventListener('click', () => {
        if (audioRecorder.isRecording()) {
            audioRecorder.stopRecording();
            ui.updateRecordButton(false);
        } else {
            audioRecorder.startRecording()
                .then(() => {
                    ui.updateRecordButton(true);
                })
                .catch(error => {
                    console.error('Recording failed:', error);
                    ui.showTemporaryMessage(error.message, true);
                });
        }
    });

    // Audio Recorder Events
    audioRecorder.onStop(async (blob) => {
        try {
            currentFile = new File([blob], 'recording.webm', { type: blob.type });
            ui.updatePreviewPlayer(URL.createObjectURL(currentFile));
            ui.showPreviewSection();
        } catch (error) {
            console.error('Recording processing failed:', error);
            ui.showTemporaryMessage(error.message, true);
        }
    });

    // Reset Button Click
    const resetButton = document.getElementById('resetButton');
    resetButton.addEventListener('click', () => {
        currentFile = null;
        ui.resetApp();
        ui.showScreen('inputScreen');
    });
});
