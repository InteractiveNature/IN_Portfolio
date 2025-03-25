/**
 * main.js - Main JavaScript initialization for Interactive Nature website
 */

// Import modules
import { Cursor } from './effects/cursor.js';
import { Background } from './effects/background.js';
import { VideoBackground } from './effects/video-background.js';
import { WorkItemManager } from './components/WorkItemManager.js';
import { ServicesManager } from './components/ServicesManager.js';
import { ClientsManager } from './components/ClientsManager.js';
import { ThemeManager } from './themes.js';
import { 
    servicesConfig, 
    workConfig, 
    clientsConfig, 
    effectsConfig
} from './config.js';

// Initialize when DOM content is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Create theme manager and theme selector
    const themeManager = new ThemeManager();
    themeManager.initFromSavedPreference();
    
    // Add theme selector to header
   // const header = document.querySelector('header');
    //addThemeSelector(header, themeManager);
    
    // Initialize visual effects
    if (effectsConfig.cursor.enabled) {
        const cursor = new Cursor(effectsConfig.cursor);
        cursor.init();
    }
    
    if (effectsConfig.backgroundGrid.enabled) {
        const background = new Background(effectsConfig.backgroundGrid);
        background.init();
    }
    
    if (effectsConfig.videoBackground.enabled) {
        const videoBackground = new VideoBackground(effectsConfig.videoBackground);
        videoBackground.init();
    }
    
    // Initialize components
    initializeServices();
    initializeWorkItems();
    initializeClientLogos();
    initializeContactForm();
    
    // Add scroll animations
    addScrollAnimations();
});

/**
 * Add theme selector to the specified container
 * @param {HTMLElement} container - Container element to add the theme selector to
 * @param {ThemeManager} themeManager - Theme manager instance
 */
function addThemeSelector(container, themeManager) {
    if (!container) return;
    
    const themeSelector = document.createElement('div');
    themeSelector.className = 'theme-selector';
    
    const label = document.createElement('span');
    label.textContent = 'Theme:';
    
    const select = document.createElement('select');
    
    themeManager.getAvailableThemes().forEach(theme => {
        const option = document.createElement('option');
        option.value = theme.id;
        option.textContent = theme.name;
        option.selected = theme.id === themeManager.currentTheme;
        select.appendChild(option);
    });
    
    select.addEventListener('change', e => {
        themeManager.applyTheme(e.target.value);
    });
    
    themeSelector.appendChild(label);
    themeSelector.appendChild(select);
    
    container.appendChild(themeSelector);
}

/**
 * Initialize services section
 */
function initializeServices() {
    const servicesManager = new ServicesManager({
        selector: '.services-grid'
    });
    
    // Clear existing content
    if (servicesManager.element) {
        servicesManager.element.innerHTML = '';
    }
    
    // Add services from config
    servicesConfig.services.forEach(service => {
        servicesManager.addService(service);
    });
    
    // Initialize event listeners and animations
    servicesManager.init();
}

/**
 * Initialize work/portfolio items
 */
function initializeWorkItems() {
    const workItemManager = new WorkItemManager({
        selector: '.work-grid',
        edgeScrollEnabled: true,
        edgeScrollThreshold: 150,
        edgeScrollSpeed: 5,
        hoverInteractionEnabled: true,
        bounceAnimationEnabled: true
    });
    
    // Clear existing content
    if (workItemManager.element) {
        workItemManager.element.innerHTML = '';
    }
    
    // Add work items from config
    workConfig.projects.forEach(project => {
        workItemManager.addWorkItem(project);
    });
    
    // Initialize event listeners and animations
    workItemManager.init();
}

/**
 * Initialize client logos section
 */
function initializeClientLogos() {
    const clientsManager = new ClientsManager({
        selector: '.logo-container',
        scrollSpeed: 60 // Slowed down to 70% of original speed (30s)
    });
    
    // Clear existing content
    if (clientsManager.element) {
        clientsManager.element.innerHTML = '';
    }
    
    // Add client logos from config
    clientsConfig.clients.forEach(client => {
        clientsManager.addClient(client);
    });
    
    // Initialize scroll animation
    clientsManager.init();
}

/**
 * Initialize contact form with validation and submission
 */
function initializeContactForm() {
    const form = document.querySelector('.contact-form form');
    if (!form) return;
    
    form.addEventListener('submit', e => {
        e.preventDefault();
        
        // Get form data
        const formData = new FormData(form);
        const formValues = Object.fromEntries(formData.entries());
        
        // Validate form
        const isValid = validateForm(form);
        
        if (isValid) {
            // Show loading state
            const submitBtn = form.querySelector('button[type="submit"]');
            const originalText = submitBtn.textContent;
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<div class="loading"></div>';
            
            // Simulate form submission (replace with actual API call)
            setTimeout(() => {
                console.log('Form submitted:', formValues);
                
                // Show success message
                form.innerHTML = `
                    <div class="form-success">
                        <h3>Thank you for your message!</h3>
                        <p>We'll get back to you soon.</p>
                    </div>
                `;
                
                // Reset form after some time
                setTimeout(() => {
                    form.reset();
                    form.innerHTML = form.innerHTML.replace(/<div class="form-success">.*?<\/div>/s, '');
                    submitBtn.disabled = false;
                    submitBtn.textContent = originalText;
                }, 5000);
            }, 1500);
        }
    });
}

/**
 * Validate form fields
 * @param {HTMLFormElement} form - Form to validate
 * @returns {boolean} - Whether the form is valid
 */
function validateForm(form) {
    const inputs = form.querySelectorAll('input, textarea');
    let isValid = true;
    
    inputs.forEach(input => {
        if (input.hasAttribute('required') && !input.value.trim()) {
            isValid = false;
            highlightInvalidField(input, 'This field is required');
        } else if (input.type === 'email' && input.value.trim() && !isValidEmail(input.value)) {
            isValid = false;
            highlightInvalidField(input, 'Please enter a valid email address');
        } else {
            removeInvalidHighlight(input);
        }
    });
    
    return isValid;
}

/**
 * Highlight invalid form field
 * @param {HTMLElement} field - Form field to highlight
 * @param {string} message - Error message to display
 */
function highlightInvalidField(field, message) {
    // Remove existing error message
    removeInvalidHighlight(field);
    
    // Add error styles
    field.style.borderColor = '#ff4d4d';
    
    // Add error message
    const errorMsg = document.createElement('div');
    errorMsg.className = 'error-message';
    errorMsg.textContent = message;
    errorMsg.style.color = '#ff4d4d';
    errorMsg.style.fontSize = 'var(--font-size-xs)';
    errorMsg.style.marginTop = '0.25rem';
    
    field.parentNode.appendChild(errorMsg);
    
    // Add focus event to remove error on focus
    field.addEventListener('focus', () => {
        removeInvalidHighlight(field);
    }, { once: true });
}

/**
 * Remove invalid field highlighting
 * @param {HTMLElement} field - Form field to remove highlighting from
 */
function removeInvalidHighlight(field) {
    field.style.borderColor = '';
    
    const errorMsg = field.parentNode.querySelector('.error-message');
    if (errorMsg) {
        errorMsg.remove();
    }
}

/**
 * Validate email format
 * @param {string} email - Email to validate
 * @returns {boolean} - Whether the email is valid
 */
function isValidEmail(email) {
    const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(String(email).toLowerCase());
}

/**
 * Add scroll animations to sections
 */
function addScrollAnimations() {
    const sections = document.querySelectorAll('section');
    
    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.1
    };
    
    const sectionObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate-in');
                
                // Add staggered animation to children
                const children = entry.target.querySelectorAll('.stagger');
                children.forEach((child, index) => {
                    child.classList.add(`stagger-delay-${(index % 5) + 1}`);
                });
                
                // Unobserve after animation
                sectionObserver.unobserve(entry.target);
            }
        });
    }, observerOptions);
    
    sections.forEach(section => {
        sectionObserver.observe(section);
    });
}
