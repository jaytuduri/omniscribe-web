export class ThemeManager {
    constructor() {
        this.themeToggle = document.getElementById('themeToggle');
        if (!this.themeToggle) {
            console.warn('Theme toggle element not found');
            return;
        }
        
        this.themeIcon = this.themeToggle.querySelector('i');
        this.systemDarkMode = window.matchMedia('(prefers-color-scheme: dark)');
        
        this.themes = ['system', 'light', 'dark'];
        this.icons = {
            system: 'fa-desktop',
            light: 'fa-sun',
            dark: 'fa-moon'
        };

        this.initialize();
    }

    getCurrentTheme() {
        return localStorage.getItem('theme') || 'system';
    }

    getNextTheme(currentTheme) {
        const currentIndex = this.themes.indexOf(currentTheme);
        return this.themes[(currentIndex + 1) % this.themes.length];
    }

    updateThemeIcon(theme) {
        this.themeIcon.classList.remove('fa-desktop', 'fa-sun', 'fa-moon');
        this.themeIcon.classList.add(this.icons[theme]);
    }

    setTheme(theme) {
        if (theme === 'system') {
            document.documentElement.dataset.theme = this.systemDarkMode.matches ? 'dark' : 'light';
        } else {
            document.documentElement.dataset.theme = theme;
        }
        localStorage.setItem('theme', theme);
        this.updateThemeIcon(theme);
    }

    initialize() {
        // Add click event listener
        this.themeToggle.addEventListener('click', () => {
            const currentTheme = this.getCurrentTheme();
            const nextTheme = this.getNextTheme(currentTheme);
            this.setTheme(nextTheme);
        });

        // Initialize theme
        this.setTheme(this.getCurrentTheme());

        // Listen for system theme changes
        this.systemDarkMode.addEventListener('change', (e) => {
            if (this.getCurrentTheme() === 'system') {
                document.documentElement.dataset.theme = e.matches ? 'dark' : 'light';
            }
        });
    }
}
