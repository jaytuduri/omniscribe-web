export class ComponentLoader {
    static async loadComponent(elementId, componentPath) {
        try {
            const response = await fetch(componentPath);
            if (!response.ok) {
                throw new Error(`Failed to load component: ${componentPath}`);
            }
            const html = await response.text();
            document.getElementById(elementId).innerHTML = html;
        } catch (error) {
            console.error('Error loading component:', error);
        }
    }

    static async loadAllComponents() {
        const components = [
            { id: 'headerContainer', path: '../components/header.html' },
            { id: 'inputScreenContainer', path: '../components/input-screen.html' },
            { id: 'progressScreenContainer', path: '../components/progress-screen.html' },
            { id: 'resultScreenContainer', path: '../components/result-screen.html' },
            { id: 'footerContainer', path: '../components/footer.html' }
        ];

        for (const component of components) {
            await this.loadComponent(component.id, component.path);
        }
        
        // Give the browser a moment to parse the new DOM elements
        await new Promise(resolve => {
            requestAnimationFrame(() => {
                requestAnimationFrame(() => {
                    // Dispatch event when all components are loaded and DOM is ready
                    window.dispatchEvent(new Event('componentsLoaded'));
                    resolve();
                });
            });
        });
    }
}

// Load all components when the DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    ComponentLoader.loadAllComponents();
});
