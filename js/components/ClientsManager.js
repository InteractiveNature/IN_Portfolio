/**
 * ClientsManager.js - Manages client logos for Interactive Nature website
 */

export class ClientsManager {
    /**
     * Create a new clients manager
     * @param {Object} options - Configuration options
     */
    constructor(options = {}) {
        this.options = {
            selector: '.logo-container',
            scrollSpeed: 30, // seconds for full scroll
            pauseOnHover: true,
            ...options
        };
        
        this.element = document.querySelector(this.options.selector);
        this.clients = [];
        this.initialized = false;
    }
    
    /**
     * Initialize the clients manager
     * @returns {ClientsManager} - For chaining
     */
    init() {
        if (this.initialized) return this;
        if (!this.element) {
            console.warn('Client logo container element not found');
            return this;
        }
        
        this.initialized = true;
        this.setupScrollBehavior();
        
        return this;
    }
    
    /**
     * Set up scroll behavior for client logos
     */
    setupScrollBehavior() {
        if (!this.element) return;
        
        // Update animation duration based on config
        this.element.style.animationDuration = `${this.options.scrollSpeed}s`;
        
        // Add hover pause if enabled
        if (this.options.pauseOnHover) {
            this.element.addEventListener('mouseenter', () => {
                this.element.style.animationPlayState = 'paused';
            });
            
            this.element.addEventListener('mouseleave', () => {
                this.element.style.animationPlayState = 'running';
            });
        }
        
        // Ensure infinite scroll by duplicating logos if needed
        this.ensureInfiniteScroll();
    }
    
    /**
     * Ensure there are enough logos for infinite scroll
     */
    ensureInfiniteScroll() {
        const logoElements = this.element.querySelectorAll('img');
        
        // Check if we need to duplicate logos
        if (logoElements.length > 0 && logoElements.length < 10) {
            // Calculate how many duplicates we need
            const duplicatesNeeded = Math.ceil(10 / logoElements.length) - 1;
            
            // Clone the logos
            for (let i = 0; i < duplicatesNeeded; i++) {
                logoElements.forEach(logo => {
                    const clone = logo.cloneNode(true);
                    this.element.appendChild(clone);
                });
            }
        }
    }
    
    /**
     * Add a new client logo
     * @param {Object} clientConfig - Client configuration
     * @returns {HTMLElement} - The created client logo element
     */
    addClient(clientConfig) {
        if (!this.element) return null;
        
        const { name, logoSrc, logoAlt } = clientConfig;
        
        // Create client logo HTML
        const logoHTML = `<img src="${logoSrc}" alt="${logoAlt || name}" title="${name}">`;
        
        // Add logo to the container
        this.element.insertAdjacentHTML('beforeend', logoHTML);
        
        // Get the added logo element
        const logoElement = this.element.lastElementChild;
        
        // Add to clients array
        this.clients.push({
            config: clientConfig,
            element: logoElement
        });
        
        // Ensure infinite scroll after adding a new logo
        if (this.initialized) {
            this.ensureInfiniteScroll();
        }
        
        return logoElement;
    }
    
    /**
     * Remove a client logo
     * @param {number} index - Index of the client to remove
     * @returns {boolean} - True if removed successfully, false otherwise
     */
    removeClient(index) {
        if (index < 0 || index >= this.clients.length) return false;
        
        const client = this.clients[index];
        
        // Remove element from DOM
        if (client.element && client.element.parentNode) {
            client.element.parentNode.removeChild(client.element);
            
            // Remove any duplicates
            const allLogos = this.element.querySelectorAll('img');
            allLogos.forEach(logo => {
                if (logo.src === client.element.src) {
                    logo.parentNode.removeChild(logo);
                }
            });
        }
        
        // Remove from clients array
        this.clients.splice(index, 1);
        
        return true;
    }
    
    /**
     * Update an existing client logo
     * @param {number} index - Index of the client to update
     * @param {Object} clientConfig - New client configuration
     * @returns {HTMLElement} - The updated client logo element
     */
    updateClient(index, clientConfig) {
        if (index < 0 || index >= this.clients.length) return null;
        
        const client = this.clients[index];
        const { name, logoSrc, logoAlt } = clientConfig;
        
        // Update element attributes
        if (client.element) {
            client.element.src = logoSrc;
            client.element.alt = logoAlt || name;
            client.element.title = name;
            
            // Update any duplicates
            const allLogos = this.element.querySelectorAll('img');
            allLogos.forEach(logo => {
                if (logo.src === client.element.src) {
                    logo.src = logoSrc;
                    logo.alt = logoAlt || name;
                    logo.title = name;
                }
            });
            
            // Update config
            client.config = { ...client.config, ...clientConfig };
        }
        
        return client.element;
    }
    
    /**
     * Get all client logo elements
     * @returns {Array} - Array of client logo elements
     */
    getClientElements() {
        return this.clients.map(client => client.element);
    }
    
    /**
     * Change the scroll speed
     * @param {number} speed - New scroll speed in seconds
     */
    changeScrollSpeed(speed) {
        this.options.scrollSpeed = speed;
        if (this.element) {
            this.element.style.animationDuration = `${speed}s`;
        }
    }
    
    /**
     * Destroy the clients manager
     */
    destroy() {
        this.initialized = false;
    }
}
