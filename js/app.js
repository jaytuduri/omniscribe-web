import config from './config.js';
import * as audioRecorder from './audioRecorder.js';
import * as api from './api.js';
import * as ui from './uiManager.js';
import * as transcriptionManager from './transcriptionManager.js';
import { AICleanup } from './aiCleanup.js';
import { AIGenerate } from './aiGenerate.js';

// Theme Switcher
function initializeThemeSwitcher() {
    const themeToggle = document.getElementById('themeToggle');
    if (!themeToggle) {
        console.warn('Theme toggle element not found');
        return;
    }
    
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
        return false;
    }

    // Show preview immediately after file selection
    ui.updatePreviewPlayer(URL.createObjectURL(file));
    ui.showPreviewSection();
    return true;
}

// Transcription Handling
async function handleTranscription(file) {
    try {
        ui.showScreen('progressScreen');
        const options = ui.getTranscriptionOptions();
        const result = await api.uploadAudio(file, options);
        const formattedResult = ui.formatTranscriptionResult(result, options.responseFormat);
        ui.updateTranscriptionText(formattedResult);
        
        // Save the transcription
        transcriptionManager.saveTranscription(formattedResult, options);
        
        ui.showScreen('resultScreen');
    } catch (error) {
        console.error('Transcription error:', error);
        ui.showTemporaryMessage('Error during transcription. Please try again.', true);
        ui.showScreen('inputScreen');
    }
}

// Add new function to handle viewing saved transcriptions
function viewSavedTranscriptions() {
    const transcriptions = transcriptionManager.getAllTranscriptions();
    ui.showSavedTranscriptions(transcriptions);
}

// Add new function to delete a transcription
function deleteTranscription(id) {
    transcriptionManager.deleteTranscription(id);
}

// Update the input screen with recent transcriptions
function updateRecentTranscriptions() {
    console.log('🔄 Updating recent transcriptions display');
    const recentTranscriptions = transcriptionManager.getRecentTranscriptions();
    const container = document.querySelector('.transcriptions-grid');
    
    if (!container) {
        console.warn('⚠️ Transcriptions grid container not found');
        return;
    }
    
    if (recentTranscriptions.length === 0) {
        console.log('ℹ️ No recent transcriptions to display');
        container.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-history"></i>
                <p>No recent transcriptions</p>
            </div>`;
        return;
    }
    
    console.log('📝 Displaying', recentTranscriptions.length, 'recent transcriptions');
    container.innerHTML = recentTranscriptions.map(transcription => `
        <div class="transcription-card" data-id="${transcription.id}">
            <div class="timestamp">
                <i class="far fa-clock"></i> ${transcriptionManager.formatTimestamp(transcription.timestamp)}
            </div>
            <div class="preview">${transcription.text.substring(0, 150)}...</div>
        </div>
    `).join('');
    
    // Add click handlers to cards
    container.querySelectorAll('.transcription-card').forEach(card => {
        card.addEventListener('click', () => {
            const id = card.dataset.id;
            console.log('🖱️ Clicked transcription card:', id);
            const transcription = transcriptionManager.getTranscription(id);
            if (transcription) {
                console.log('📋 Loading transcription into main view');
                ui.updateTranscriptionText(transcription.text);
                ui.showScreen('resultScreen');
            } else {
                console.error('❌ Failed to load transcription:', id);
            }
        });
    });
}

// Handle clearing all transcriptions
function handleClearHistory() {
    console.log('🗑️ Clear history button clicked');
    if (confirm('Are you sure you want to clear all transcription history?')) {
        console.log('✅ User confirmed clearing history');
        transcriptionManager.clearAllTranscriptions();
        updateRecentTranscriptions();
    } else {
        console.log('❌ User cancelled clearing history');
    }
}

// Event Listeners
window.addEventListener('componentsLoaded', async () => {
    console.log('🚀 Initializing application');
    
    // Initialize core features
    ui.initializeUI();
    
    // Initialize theme switcher after components are loaded
    initializeThemeSwitcher();
    
    // Initialize recent transcriptions
    console.log('📋 Initializing recent transcriptions');
    updateRecentTranscriptions();
    
    // Initialize AI features
    console.log('🤖 Initializing AI features');
    window.aiCleanup = new AICleanup();
    window.aiGenerate = new AIGenerate();
    window.aiGenerate.initialize();
    
    // Add event listeners for result screen buttons
    const setupResultScreenButtons = () => {
        const downloadTxtBtn = document.getElementById('downloadTxtBtn');
        if (downloadTxtBtn) {
            downloadTxtBtn.addEventListener('click', (e) => {
                e.preventDefault();
                ui.downloadTranscription('txt');
            });
        }

        const generateSummaryBtn = document.getElementById('generateSummaryBtn');
        if (generateSummaryBtn) {
            generateSummaryBtn.addEventListener('click', (e) => {
                e.preventDefault();
                ui.generateContent('summary');
            });
        }

        const generateNotesBtn = document.getElementById('generateNotesBtn');
        if (generateNotesBtn) {
            generateNotesBtn.addEventListener('click', (e) => {
                e.preventDefault();
                ui.generateContent('notes');
            });
        }

        const generateActionItemsBtn = document.getElementById('generateActionItemsBtn');
        if (generateActionItemsBtn) {
            generateActionItemsBtn.addEventListener('click', (e) => {
                e.preventDefault();
                ui.generateContent('action-items');
            });
        }

        const resetButton = document.getElementById('resetButton');
        if (resetButton) {
            resetButton.addEventListener('click', () => {
                currentFile = null;
                ui.resetApp();
                ui.showScreen('inputScreen');
            });
        }
    };

    // Setup result screen buttons
    setupResultScreenButtons();

    // Add clear history button handler
    const clearHistoryBtn = document.getElementById('clearHistoryBtn');
    if (clearHistoryBtn) {
        clearHistoryBtn.addEventListener('click', handleClearHistory);
        console.log('✅ Clear history button handler attached');
    } else {
        console.warn('⚠️ Clear history button not found');
    }

    // Add "View Saved" button to the action buttons container
    const actionButtons = document.querySelector('.action-buttons');
    if (actionButtons) {
        console.log('📎 Adding View Saved button to action buttons');
        const viewSavedBtn = document.createElement('button');
        viewSavedBtn.className = 'button secondary';
        viewSavedBtn.innerHTML = '<i class="fas fa-history"></i> View Saved';
        viewSavedBtn.onclick = viewSavedTranscriptions;
        actionButtons.appendChild(viewSavedBtn);
    } else {
        console.warn('⚠️ Action buttons container not found');
    }

    // File Input Change
    const fileInput = document.getElementById('fileInput');
    let currentFile = null;

    fileInput.addEventListener('change', async (e) => {
        const file = e.target.files[0];
        if (file) {
            const success = await handleFileUpload(file);
            if (success) {
                currentFile = file;
            }
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
});

// Make functions available globally
window.app = {
    handleFileUpload,
    handleTranscription,
    deleteTranscription,
    viewSavedTranscriptions,
    updateRecentTranscriptions
};
