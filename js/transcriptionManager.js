// Manages transcriptions including storage and UI rendering
const STORAGE_KEY = 'omniscribe_transcriptions';
const MAX_RECENT_TRANSCRIPTIONS = 6;

export class TranscriptionManager {
    constructor() {
        this.container = document.querySelector('.transcriptions-grid');
        if (!this.container) {
            console.warn('⚠️ Transcriptions grid container not found');
        }
    }

    // Storage Methods
    getAllTranscriptions() {
        const transcriptions = localStorage.getItem(STORAGE_KEY);
        const parsed = transcriptions ? JSON.parse(transcriptions) : [];
        console.log('📚 Retrieved all transcriptions:', parsed.length, 'items');
        return parsed;
    }

    getRecentTranscriptions() {
        const transcriptions = this.getAllTranscriptions();
        const recent = transcriptions
            .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
            .slice(0, MAX_RECENT_TRANSCRIPTIONS);
        console.log('🕒 Retrieved recent transcriptions:', recent.length, 'items');
        return recent;
    }

    saveTranscription(text, options = {}) {
        const transcriptions = this.getAllTranscriptions();
        const transcription = {
            id: Date.now().toString(),
            timestamp: new Date().toISOString(),
            text,
            options
        };
        
        transcriptions.push(transcription);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(transcriptions));
        console.log('💾 Saved new transcription:', { id: transcription.id, timestamp: transcription.timestamp });
        
        // Update UI after saving
        this.updateDisplay();
        return transcription;
    }

    deleteTranscription(id) {
        const transcriptions = this.getAllTranscriptions();
        const filteredTranscriptions = transcriptions.filter(t => t.id !== id);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(filteredTranscriptions));
        console.log('🗑️ Deleted transcription:', id);
        
        // Update UI after deleting
        this.updateDisplay();
    }

    clearAllTranscriptions() {
        localStorage.removeItem(STORAGE_KEY);
        console.log('🧹 Cleared all transcriptions');
        
        // Update UI after clearing
        this.updateDisplay();
    }

    getTranscription(id) {
        const transcriptions = this.getAllTranscriptions();
        const transcription = transcriptions.find(t => t.id === id);
        console.log('🔍 Retrieved transcription by ID:', id, transcription ? 'found' : 'not found');
        return transcription;
    }

    formatTimestamp(timestamp) {
        return new Date(timestamp).toLocaleString();
    }

    // UI Methods
    updateDisplay() {
        console.log('🔄 Updating recent transcriptions display');
        if (!this.container) return;

        const recentTranscriptions = this.getRecentTranscriptions();
        
        if (recentTranscriptions.length === 0) {
            this.showEmptyState();
            return;
        }
        
        this.displayTranscriptions(recentTranscriptions);
    }

    showEmptyState() {
        console.log('ℹ️ No recent transcriptions to display');
        this.container.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">
                    <i class="fas fa-file-audio"></i>
                    <i class="fas fa-wave-square"></i>
                </div>
                <p>Your recent transcriptions will appear here</p>
                <span class="empty-state-hint">Get started by uploading a file or recording!</span>
            </div>`;
    }

    displayTranscriptions(transcriptions) {
        console.log('📝 Displaying', transcriptions.length, 'recent transcriptions');
        this.container.innerHTML = transcriptions.map(transcription => `
            <div class="transcription-card" data-id="${transcription.id}">
                <div class="timestamp">
                    <i class="far fa-clock"></i> ${this.formatTimestamp(transcription.timestamp)}
                </div>
                <div class="preview">${transcription.text.substring(0, 150)}...</div>
            </div>
        `).join('');
        
        this.attachCardClickHandlers();
    }

    attachCardClickHandlers() {
        this.container.querySelectorAll('.transcription-card').forEach(card => {
            card.addEventListener('click', () => {
                const id = card.dataset.id;
                console.log('🖱️ Clicked transcription card:', id);
                const transcription = this.getTranscription(id);
                if (transcription) {
                    console.log('📋 Loading transcription into main view');
                    window.uiManager.updateTranscriptionText(transcription.text);
                    window.uiManager.showScreen('resultScreen');
                } else {
                    console.error('❌ Failed to load transcription:', id);
                }
            });
        });
    }
}