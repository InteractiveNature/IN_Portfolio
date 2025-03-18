/**
 * ServicesManager.js - Manages service cards for Interactive Nature website
 */

export class ServicesManager {
    /**
     * Create a new services manager
     * @param {Object} options - Configuration options
     */
    constructor(options = {}) {
        this.options = {
            selector: '.services-grid',
            ...options
        };
        
        this.element = document.querySelector(this.options.selector);
        this.services = [];
        this.initialized = false;
    }
    
    /**
     * Initialize the services manager
     * @returns {ServicesManager} - For chaining
     */
    init() {
        if (this.initialized) return this;
        if (!this.element) {
            console.warn('Services grid element not found');
            return this;
        }
        
        this.initialized = true;
        this.setupEventListeners();
        
        return this;
    }
    
    /**
     * Set up event listeners
     */
    setupEventListeners() {
        // Add intersection observer for scroll animations
        const observerOptions = {
            root: null,
            rootMargin: '0px',
            threshold: 0.1
        };
        
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    // Add staggered animations to service cards
                    const cards = entry.target.querySelectorAll('.service-card');
                    cards.forEach((card, index) => {
                        setTimeout(() => {
                            card.classList.add('animate-in');
                        }, index * 100);
                    });
                    
                    // Unobserve after animation
                    observer.unobserve(entry.target);
                }
            });
        }, observerOptions);
        
        // Observe the services grid
        observer.observe(this.element);
    }
    
    /**
     * Add a new service card
     * @param {Object} serviceConfig - Service configuration
     * @returns {HTMLElement} - The created service card element
     */
    addService(serviceConfig) {
        if (!this.element) return null;
        
        const { title, description, learnMoreLink } = serviceConfig;
        
        // Create service card HTML
        const cardHTML = `
            <div class="service-card">
                <h3>${title}</h3>
                <p>${description}</p>
                <a href="${learnMoreLink}">Learn more 
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M5 12h14M12 5l7 7-7 7"/>
                    </svg>
                </a>
            </div>
        `;
        
        // Add card to the grid
        this.element.insertAdjacentHTML('beforeend', cardHTML);
        
        // Get the added card element
        const cardElement = this.element.lastElementChild;
        
        // Add to services array
        this.services.push({
            config: serviceConfig,
            element: cardElement
        });
        
        return cardElement;
    }
    
    /**
     * Remove a service card
     * @param {number} index - Index of the service to remove
     * @returns {boolean} - True if removed successfully, false otherwise
     */
    removeService(index) {
        if (index < 0 || index >= this.services.length) return false;
        
        const service = this.services[index];
        
        // Remove element from DOM
        if (service.element && service.element.parentNode) {
            service.element.parentNode.removeChild(service.element);
        }
        
        // Remove from services array
        this.services.splice(index, 1);
        
        return true;
    }
    
    /**
     * Update an existing service card
     * @param {number} index - Index of the service to update
     * @param {Object} serviceConfig - New service configuration
     * @returns {HTMLElement} - The updated service card element
     */
    updateService(index, serviceConfig) {
        if (index < 0 || index >= this.services.length) return null;
        
        const service = this.services[index];
        const { title, description, learnMoreLink } = serviceConfig;
        
        // Update element content
        if (service.element) {
            const titleEl = service.element.querySelector('h3');
            const descEl = service.element.querySelector('p');
            const linkEl = service.element.querySelector('a');
            
            if (titleEl) titleEl.textContent = title;
            if (descEl) descEl.textContent = description;
            if (linkEl) linkEl.href = learnMoreLink;
            
            // Update config
            service.config = { ...service.config, ...serviceConfig };
        }
        
        return service.element;
    }
    
    /**
     * Get all service elements
     * @returns {Array} - Array of service elements
     */
    getServiceElements() {
        return this.services.map(service => service.element);
    }
    
    /**
     * Destroy the services manager
     */
    destroy() {
        this.initialized = false;
    }
}