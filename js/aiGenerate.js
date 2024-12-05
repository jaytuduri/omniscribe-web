class AIGenerate {
    constructor() {
        this.modes = {
            summary: {
                name: 'Summary',
                icon: 'fas fa-compress-alt'
            },
            tweet: {
                name: 'Tweet Thread',
                icon: 'fab fa-twitter'
            },
            blog: {
                name: 'Blog Post',
                icon: 'fas fa-blog'
            },
            custom: {
                name: 'Custom',
                icon: 'fas fa-pencil-alt'
            }
        };
    }

    async generateContent(mode) {
        try {
            const transcriptionText = document.getElementById('transcriptionText');
            const text = transcriptionText.dataset.fullText;
            
            if (!text || !text.trim()) {
                throw new Error('No text to generate from');
            }

            // Show loading state in dropdown
            const linkElement = document.querySelector(`[onclick="aiGenerate.generateContent('${mode}')"]`);
            const originalHTML = linkElement.innerHTML;
            linkElement.innerHTML = `<i class="fas fa-spinner fa-spin"></i> Generating...`;
            linkElement.style.pointerEvents = 'none';

            let options = { temperature: 0.7 };

            // Handle custom prompt if mode is custom
            if (mode === 'custom') {
                const customPrompt = await this.getCustomPrompt();
                if (!customPrompt) {
                    linkElement.innerHTML = originalHTML;
                    linkElement.style.pointerEvents = 'auto';
                    return;
                }
                options.custom_prompt = customPrompt;
            }

            const result = await window.api.generateText(text, mode, options);
            
            window.uiManager.showGeneratedContent(
                `${this.modes[mode].name} Result`, 
                result.text
            );

            // Reset link state
            linkElement.innerHTML = originalHTML;
            linkElement.style.pointerEvents = 'auto';

        } catch (error) {
            console.error('Error in AI generation:', error);
            // Show error in UI
            const errorDiv = document.getElementById('errorMessage');
            errorDiv.textContent = `Error: ${error.message}`;
            errorDiv.style.display = 'block';

            // Reset link state
            const linkElement = document.querySelector(`[onclick="aiGenerate.generateContent('${mode}')"]`);
            linkElement.innerHTML = `<i class="${this.modes[mode].icon}"></i> ${this.modes[mode].name}`;
            linkElement.style.pointerEvents = 'auto';

            // Remove error message after 5 seconds
            setTimeout(() => {
                errorDiv.style.display = 'none';
            }, 5000);
        }
    }

    async getCustomPrompt() {
        return new Promise((resolve) => {
            const promptDiv = document.createElement('div');
            promptDiv.className = 'custom-prompt-modal';
            promptDiv.innerHTML = `
                <div class="modal-content">
                    <h3>Custom Generation Prompt</h3>
                    <textarea id="customPrompt" placeholder="Enter your custom prompt here..."></textarea>
                    <div class="button-group">
                        <button class="button primary" id="submitPrompt">Generate</button>
                        <button class="button secondary" id="cancelPrompt">Cancel</button>
                    </div>
                </div>
            `;
            document.body.appendChild(promptDiv);

            const submitButton = document.getElementById('submitPrompt');
            const cancelButton = document.getElementById('cancelPrompt');
            const textarea = document.getElementById('customPrompt');

            submitButton.addEventListener('click', () => {
                const prompt = textarea.value.trim();
                promptDiv.remove();
                resolve(prompt || null);
            });

            cancelButton.addEventListener('click', () => {
                promptDiv.remove();
                resolve(null);
            });

            textarea.focus();
        });
    }
}

// Initialize AI Generate
document.addEventListener('DOMContentLoaded', () => {
    window.aiGenerate = new AIGenerate();
});
