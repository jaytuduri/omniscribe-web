import config from './config.js';
import * as audioRecorder from './audioRecorder.js';
import * as api from './api.js';
import * as ui from './uiManager.js';
import { TranscriptionManager } from './transcriptionManager.js';
import { AICleanup } from './aiCleanup.js';
import { AIGenerate } from './aiGenerate.js';
import { ThemeManager } from './themeManager.js';

// Track current file being processed
let currentFile = null;

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
        window.transcriptionManager.saveTranscription(formattedResult, options);
        
        ui.showScreen('resultScreen');
    } catch (error) {
        console.error('Transcription error:', error);
        ui.showTemporaryMessage('Error during transcription. Please try again.', true);
        ui.showScreen('inputScreen');
    }
}

// Event Listeners
window.addEventListener('componentsLoaded', async () => {
    console.log('🚀 Initializing application');
    
    // Initialize core features
    ui.initializeUI();
    
    // Wait for components to be fully loaded
    await new Promise(resolve => {
        const checkComponents = () => {
            const allComponents = document.querySelector('.transcriptions-grid') && 
                                document.getElementById('themeToggle');
            if (allComponents) {
                resolve();
            } else {
                setTimeout(checkComponents, 100);
            }
        };
        checkComponents();
    });
    
    // Initialize managers after components are loaded
    window.themeManager = new ThemeManager();
    window.transcriptionManager = new TranscriptionManager();
    window.transcriptionManager.updateDisplay();
    
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
        clearHistoryBtn.addEventListener('click', () => {
            if (confirm('Are you sure you want to clear all transcription history?')) {
                window.transcriptionManager.clearAllTranscriptions();
            }
        });
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
        viewSavedBtn.onclick = () => {
            const transcriptions = window.transcriptionManager.getAllTranscriptions();
            ui.showSavedTranscriptions(transcriptions);
        };
        actionButtons.appendChild(viewSavedBtn);
    } else {
        console.warn('⚠️ Action buttons container not found');
    }

    // File Input Change
    const fileInput = document.getElementById('fileInput');
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
    viewSavedTranscriptions: () => {
        const transcriptions = window.transcriptionManager.getAllTranscriptions();
        ui.showSavedTranscriptions(transcriptions);
    },
    updateRecentTranscriptions: () => window.transcriptionManager.updateDisplay(),
    deleteTranscription: (id) => window.transcriptionManager.deleteTranscription(id)
};
