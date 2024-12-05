class AICleanup {
    constructor() {
        this.setupEventListeners();
    }

    setupEventListeners() {
        const cleanupButton = document.getElementById('aiCleanupButton');
        if (cleanupButton) {
            cleanupButton.addEventListener('click', () => this.performCleanup());
        }
    }

    async performCleanup() {
        try {
            const transcriptionText = document.getElementById('transcriptionText');
            const text = transcriptionText.dataset.fullText;
            
            if (!text || !text.trim()) {
                throw new Error('No text to clean up');
            }

            // Show loading state
            const cleanupButton = document.getElementById('aiCleanupButton');
            const originalText = cleanupButton.innerHTML;
            cleanupButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Cleaning...';
            cleanupButton.disabled = true;

            const result = await window.api.generateText(text, 'CLEANUP');
            
            // Show generated content
            window.uiManager.showGeneratedContent('AI Cleanup Result', result.text);

            // Reset button state
            cleanupButton.innerHTML = originalText;
            cleanupButton.disabled = false;

        } catch (error) {
            console.error('Error in AI cleanup:', error);
            // Show error in UI
            const errorDiv = document.getElementById('errorMessage');
            errorDiv.textContent = `Error: ${error.message}`;
            errorDiv.style.display = 'block';
            
            // Reset button state
            const cleanupButton = document.getElementById('aiCleanupButton');
            cleanupButton.innerHTML = '<i class="fas fa-magic"></i> AI Cleanup';
            cleanupButton.disabled = false;

            // Remove error message after 5 seconds
            setTimeout(() => {
                errorDiv.style.display = 'none';
            }, 5000);
        }
    }
}

// Initialize AI Cleanup
document.addEventListener('DOMContentLoaded', () => {
    window.aiCleanup = new AICleanup();
});
