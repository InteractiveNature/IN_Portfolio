/**
 * themes.js - Theme management for Interactive Nature website
 */

// Theme definitions - Define multiple color schemes
export const themes = {
    default: {
        name: 'Default',
        colors: {
            primary: '#0a0a0a',
            secondary: '#f2f2f2',
            text: '#f2f2f2',
            textDark: '#0a0a0a',
            gradientColors: [
                '#C4D4DB', 
                '#9AC2C9', 
                '#B19CD9', 
                '#93B5C6', 
                '#BFD8BD'
            ]
        }
    },
    ocean: {
        name: 'Ocean',
        colors: {
            primary: '#051923',
            secondary: '#EEF5FC',
            text: '#EEF5FC',
            textDark: '#051923',
            gradientColors: [
                '#00A8E8', 
                '#0077B6', 
                '#5BC0EB', 
                '#7DCFB6', 
                '#00B4D8'
            ]
        }
    },
    sunset: {
        name: 'Sunset',
        colors: {
            primary: '#2F2E41',
            secondary: '#FFF8F0',
            text: '#FFF8F0',
            textDark: '#2F2E41',
            gradientColors: [
                '#FF9F1C', 
                '#FFBF69', 
                '#F15BB5', 
                '#E26D5C', 
                '#FB5607'
            ]
        }
    },
    nature: {
        name: 'Nature',
        colors: {
            primary: '#1A1A1D',
            secondary: '#F7F7F2',
            text: '#F7F7F2',
            textDark: '#1A1A1D',
            gradientColors: [
                '#8CB369', 
                '#5E8C61', 
                '#ACECA1', 
                '#A7C957', 
                '#92B4A7'
            ]
        }
    },
    light: {
        name: 'Light',
        colors: {
            primary: '#ffffff',      // White background
            secondary: '#f8f9fa',    // Light gray secondary
            text: '#212529',         // Dark text for contrast
            textDark: '#000000',     // Black text for buttons etc.
            gradientColors: [
                '#6366F1',  // Indigo
                '#8B5CF6',  // Purple
                '#EC4899',  // Pink
                '#F43F5E',  // Rose
                '#3B82F6'   // Blue
            ]
        }
    }
};

/**
 * ThemeManager class - Handles theme switching and application
 */
export class ThemeManager {
    constructor(initialTheme = 'default') {
        this.currentTheme = initialTheme;
        this.themeChangeListeners = [];
    }
    
    /**
     * Apply the specified theme to the document
     * @param {string} themeName - Name of the theme to apply
     * @returns {ThemeManager} - For chaining
     */
    applyTheme(themeName = this.currentTheme) {
        if (!themes[themeName]) {
            console.error(`Theme "${themeName}" not found.`);
            return this;
        }
        
        const theme = themes[themeName];
        this.currentTheme = themeName;
        
        // Set CSS variables based on theme
        document.documentElement.style.setProperty('--primary', theme.colors.primary);
        document.documentElement.style.setProperty('--secondary', theme.colors.secondary);
        document.documentElement.style.setProperty('--text', theme.colors.text);
        document.documentElement.style.setProperty('--text-dark', theme.colors.textDark);
        
        // Update gradient colors
        document.documentElement.style.setProperty('--gradient-color-1', theme.colors.gradientColors[0]);
        document.documentElement.style.setProperty('--gradient-color-2', theme.colors.gradientColors[1]);
        document.documentElement.style.setProperty('--gradient-color-3', theme.colors.gradientColors[2]);
        document.documentElement.style.setProperty('--gradient-color-4', theme.colors.gradientColors[3]);
        document.documentElement.style.setProperty('--gradient-color-5', theme.colors.gradientColors[4]);
        
        // Update the SVG gradient definition if it exists
        this.updateGradient(theme.colors.gradientColors);
        
        // Notify listeners of theme change
        this.notifyThemeChangeListeners(themeName);
        
        // Store theme preference in localStorage
        localStorage.setItem('interactiveNature.theme', themeName);
        
        return this;
    }
    
    /**
     * Update the gradient with new colors
     * @param {Array} colors - Array of gradient colors
     */
    updateGradient(colors) {
        // Update the SVG gradient definition if it exists
        const gradientEl = document.getElementById('iridescent-gradient');
        if (gradientEl) {
            const stops = gradientEl.querySelectorAll('stop');
            if (stops.length === colors.length) {
                stops.forEach((stop, index) => {
                    stop.setAttribute('stop-color', colors[index]);
                });
            }
        }
    }
    
    /**
     * Add a listener for theme changes
     * @param {Function} callback - Callback function to call when theme changes
     * @returns {ThemeManager} - For chaining
     */
    addThemeChangeListener(callback) {
        if (typeof callback === 'function') {
            this.themeChangeListeners.push(callback);
        }
        return this;
    }
    
    /**
     * Remove a theme change listener
     * @param {Function} callback - Callback function to remove
     * @returns {ThemeManager} - For chaining
     */
    removeThemeChangeListener(callback) {
        this.themeChangeListeners = this.themeChangeListeners.filter(
            listener => listener !== callback
        );
        return this;
    }
    
    /**
     * Notify all listeners of a theme change
     * @param {string} themeName - Name of the theme that was applied
     */
    notifyThemeChangeListeners(themeName) {
        this.themeChangeListeners.forEach(listener => {
            try {
                listener(themeName, themes[themeName]);
            } catch (error) {
                console.error('Error in theme change listener:', error);
            }
        });
    }
    
    /**
     * Get the current theme object
     * @returns {Object} - Current theme object
     */
    getTheme() {
        return themes[this.currentTheme];
    }
    
    /**
     * Get all available themes
     * @returns {Array} - Array of theme objects with id and name properties
     */
    getAvailableThemes() {
        return Object.keys(themes).map(key => ({
            id: key,
            name: themes[key].name
        }));
    }
    
    /**
     * Initialize theme from saved preference or default
     * @returns {ThemeManager} - For chaining
     */
    initFromSavedPreference() {
        const savedTheme = localStorage.getItem('interactiveNature.theme');
        if (savedTheme && themes[savedTheme]) {
            this.applyTheme(savedTheme);
        } else {
            this.applyTheme(this.currentTheme);
        }
        return this;
    }
}
