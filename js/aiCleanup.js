export class AICleanup {
    constructor() {
        // Wait a bit before setting up event listeners to ensure DOM is ready
        setTimeout(() => this.setupEventListeners(), 0);
    }

    setupEventListeners() {
        const cleanupButton = document.getElementById('aiCleanupButton');
        if (cleanupButton) {
            cleanupButton.addEventListener('click', () => this.performCleanup());
            console.log('✅ AI Cleanup button handler attached');
        } else {
            console.warn('⚠️ AI Cleanup button not found');
        }
    }

    async performCleanup() {
        try {
            const transcriptionText = document.getElementById('transcriptionText');
            if (!transcriptionText) {
                throw new Error('Transcription text element not found');
            }
            
            const text = transcriptionText.dataset.fullText;
            if (!text || !text.trim()) {
                throw new Error('No text to clean up');
            }

            // Show loading state
            const cleanupButton = document.getElementById('aiCleanupButton');
            if (!cleanupButton) {
                throw new Error('Cleanup button not found');
            }

            const originalText = cleanupButton.innerHTML;
            cleanupButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Cleaning...';
            cleanupButton.disabled = true;

            try {
                const result = await window.api.generateText(text, 'CLEANUP');
                window.uiManager.showGeneratedContent('AI Cleanup Result', result.text);
            } finally {
                // Reset button state
                cleanupButton.innerHTML = originalText;
                cleanupButton.disabled = false;
            }
        } catch (error) {
            console.error('Error in AI cleanup:', error);
            window.uiManager.showTemporaryMessage(`Error: ${error.message}`, true);
        }
    }
}
