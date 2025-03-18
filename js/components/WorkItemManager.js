/**
 * WorkItemManager.js - Manages work/portfolio items for Interactive Nature website
 * Updated with simplified positioning for reliability
 */

export class WorkItemManager {
    /**
     * Create a new work item manager
     * @param {Object} options - Configuration options
     */
    constructor(options = {}) {
        this.options = {
            selector: '.work-grid',
            floatingEnabled: false, // Default to disabled for now
            mouseInteractionEnabled: false, // Default to disabled for now
            floatStrength: {
                x: 15,
                y: 10
            },
            rotationStrength: 0.02,
            scaleOnHover: true,
            maxScale: 1.05,
            ...options
        };
        
        this.element = document.querySelector(this.options.selector);
        this.workItems = [];
        this.mouseX = 0;
        this.mouseY = 0;
        this.windowCenterX = window.innerWidth / 2;
        this.windowCenterY = window.innerHeight / 2;
        this.initialized = false;
        this.animationFrame = null;
    }
    
    /**
     * Initialize the work item manager
     * @returns {WorkItemManager} - For chaining
     */
    init() {
        if (this.initialized) return this;
        if (!this.element) {
            console.warn('Work grid element not found');
            return this;
        }
        
        this.initialized = true;
        this.setupEventListeners();
        
        // Only enable floating effects if explicitly enabled and the method exists
        if (this.options.floatingEnabled && typeof this.initializeFloatingEffect === 'function') {
            this.initializeFloatingEffect();
        }
        
        return this;
    }
    
    /**
     * Set up event listeners
     */
    setupEventListeners() {
        // Track mouse position for hover effects only if enabled
        if (this.options.mouseInteractionEnabled) {
            document.addEventListener('mousemove', this.handleMouseMove.bind(this));
            
            // Handle window resize
            window.addEventListener('resize', this.handleResize.bind(this));
        }
        
        // Add intersection observer for scroll animations
        const observerOptions = {
            root: null,
            rootMargin: '0px',
            threshold: 0.1
        };
        
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    // Add fade-in animation when visible
                    entry.target.classList.add('animate-in');
                    
                    // Unobserve after animation
                    observer.unobserve(entry.target);
                }
            });
        }, observerOptions);
        
        // Observe the work grid
        if (this.element) {
            observer.observe(this.element);
        }
    }
    
    /**
     * Handle mouse movement
     * @param {MouseEvent} e - Mouse event
     */
    handleMouseMove(e) {
        this.mouseX = e.clientX;
        this.mouseY = e.clientY;
        
        // Update window center points
        this.windowCenterX = window.innerWidth / 2;
        this.windowCenterY = window.innerHeight / 2;
    }
    
    /**
     * Handle window resize
     */
    handleResize() {
        this.windowCenterX = window.innerWidth / 2;
        this.windowCenterY = window.innerHeight / 2;
    }
    
    /**
     * Initialize floating effect for work items
     * This method is now included to prevent errors, but simplified
     */
    initializeFloatingEffect() {
        this.workItems.forEach((item) => {
            if (!item.element) return;
            
            // Add simple hover effect instead of complex animation
            item.element.addEventListener('mouseenter', () => {
                item.element.style.transform = 'translateY(-10px) scale(1.02)';
            });
            
            item.element.addEventListener('mouseleave', () => {
                item.element.style.transform = '';
            });
        });
    }
    
    /**
 * Add a new work item with a link to its project page
 * @param {Object} workConfig - Work item configuration
 * @returns {HTMLElement} - The created work item element
 */
addWorkItem(workConfig) {
    if (!this.element) return null;
    
    const { title, description, imageSrc, imageAlt, projectUrl } = workConfig;
    
    // Create work item HTML with link to project page
    const itemHTML = `
        <a href="${projectUrl || `projects/${title.toLowerCase().replace(/\s+/g, '-')}.html`}" class="work-item-link">
            <div class="work-item">
                <img src="${imageSrc}" alt="${imageAlt || title}">
                <div class="work-overlay">
                    <h3>${title}</h3>
                    <p>${description}</p>
                    <span class="view-project">View Project</span>
                </div>
            </div>
        </a>
    `;
    
    // Add item to the grid
    this.element.insertAdjacentHTML('beforeend', itemHTML);
    
    // Get the added item element
    const itemElement = this.element.lastElementChild;
    
    // Add to work items array
    this.workItems.push({
        config: workConfig,
        element: itemElement
    });
    
    return itemElement;
}
    
    /**
     * Remove a work item
     * @param {number} index - Index of the work item to remove
     * @returns {boolean} - True if removed successfully, false otherwise
     */
    removeWorkItem(index) {
        if (index < 0 || index >= this.workItems.length) return false;
        
        const item = this.workItems[index];
        
        // Remove element from DOM
        if (item.element && item.element.parentNode) {
            item.element.parentNode.removeChild(item.element);
        }
        
        // Remove from work items array
        this.workItems.splice(index, 1);
        
        return true;
    }
    
    /**
     * Update an existing work item
     * @param {number} index - Index of the work item to update
     * @param {Object} workConfig - New work item configuration
     * @returns {HTMLElement} - The updated work item element
     */
    updateWorkItem(index, workConfig) {
        if (index < 0 || index >= this.workItems.length) return null;
        
        const item = this.workItems[index];
        const { title, description, imageSrc, imageAlt } = workConfig;
        
        // Update element content
        if (item.element) {
            const imgEl = item.element.querySelector('img');
            const titleEl = item.element.querySelector('h3');
            const descEl = item.element.querySelector('p');
            
            if (imgEl) {
                imgEl.src = imageSrc;
                imgEl.alt = imageAlt || title;
            }
            
            if (titleEl) titleEl.textContent = title;
            if (descEl) descEl.textContent = description;
            
            // Update config
            item.config = { ...item.config, ...workConfig };
        }
        
        return item.element;
    }
    
    /**
     * Destroy the work item manager
     */
    destroy() {
        if (this.animationFrame) {
            cancelAnimationFrame(this.animationFrame);
        }
        
        // Remove event listeners
        if (this.options.mouseInteractionEnabled) {
            document.removeEventListener('mousemove', this.handleMouseMove.bind(this));
            window.removeEventListener('resize', this.handleResize.bind(this));
        }
        
        this.initialized = false;
    }
}
