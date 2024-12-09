export class AIGenerate {
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
            blog_post: {
                name: 'Blog Post',
                icon: 'fas fa-blog'
            },
            custom: {
                name: 'Custom',
                icon: 'fas fa-pencil-alt'
            }
        };
    }

    initialize() {
        this.setupEventListeners();
    }

    setupEventListeners() {
        // Add event listeners for generate buttons
        const buttons = [
            { id: 'generateSummaryBtn', mode: 'summary' },
            { id: 'generateTweetBtn', mode: 'tweet' },
            { id: 'generateBlogPostBtn', mode: 'blog_post' },
            { id: 'generateCustomBtn', mode: 'custom' }
        ];

        buttons.forEach(({ id, mode }) => {
            const link = document.getElementById(id);
            if (link) {
                link.addEventListener('click', (e) => {
                    e.preventDefault();
                    this.generateContent(mode);
                });
                console.log(`✅ ${this.modes[mode].name} button handler attached`);
            } else {
                console.warn(`⚠️ ${this.modes[mode].name} button not found`);
            }
        });
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

    async generateContent(mode) {
        try {
            const transcriptionText = document.getElementById('transcriptionText');
            if (!transcriptionText) {
                throw new Error('Transcription text element not found');
            }
            
            const text = transcriptionText.dataset.fullText;
            if (!text || !text.trim()) {
                throw new Error('No text to generate from');
            }

            // Show loading state in button
            const link = document.getElementById(`generate${mode.charAt(0).toUpperCase() + mode.slice(1)}Btn`);
            if (!link) {
                throw new Error(`Generate ${mode} button not found`);
            }

            const originalHTML = link.innerHTML;
            link.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Generating...';
            link.style.pointerEvents = 'none';

            try {
                let options = { temperature: 0.7 };

                // Handle custom prompt if mode is custom
                if (mode === 'custom') {
                    const customPrompt = await this.getCustomPrompt();
                    if (!customPrompt) {
                        return;
                    }
                    options.custom_prompt = customPrompt;
                }

                // Pass mode directly without converting to uppercase
                const result = await window.api.generateText(text, mode, options);
                window.uiManager.showGeneratedContent(`${this.modes[mode].name} Result`, result.text);
            } finally {
                link.innerHTML = originalHTML;
                link.style.pointerEvents = 'auto';
            }
        } catch (error) {
            console.error('Error in AI generate:', error);
            window.uiManager.showTemporaryMessage(`Error: ${error.message}`, true);
        }
    }
}
