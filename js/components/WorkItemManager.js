/**
 * WorkItemManager.js - Manages work/portfolio items for Interactive Nature website
 * Updated with horizontal gallery layout and interactive features
 */

export class WorkItemManager {
    /**
     * Create a new work item manager
     * @param {Object} options - Configuration options
     */
    constructor(options = {}) {
        this.options = {
            selector: '.work-grid',
            edgeScrollEnabled: true, // Enable edge scrolling by default
            edgeScrollThreshold: 150, // Pixels from edge to trigger scrolling
            edgeScrollSpeed: 5, // Pixels per frame to scroll
            hoverInteractionEnabled: true, // Enable hover interactions
            bounceAnimationEnabled: true, // Enable bounce animation at gallery ends
            ...options
        };
        
        this.element = document.querySelector(this.options.selector);
        this.workItems = [];
        this.mouseX = 0;
        this.mouseY = 0;
        this.isScrolling = false;
        this.scrollDirection = 0; // -1 for left, 1 for right
        this.reachedStart = false;
        this.reachedEnd = false;
        this.initialized = false;
        this.animationFrame = null;
        this.isMobile = false; // Removed mobile check to enable horizontal scrolling on all devices
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
        
        // Initialize edge scrolling if enabled (for all devices)
        if (this.options.edgeScrollEnabled) {
            this.initializeEdgeScrolling();
        }
        
        return this;
    }
    
    /**
     * Set up event listeners
     */
    setupEventListeners() {
        // Track mouse position for hover and edge scrolling effects
        document.addEventListener('mousemove', this.handleMouseMove.bind(this));
        
        // Handle window resize
        window.addEventListener('resize', this.handleResize.bind(this));
        
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
        
        // Check if mouse is over the gallery element
        if (this.element) {
            const rect = this.element.getBoundingClientRect();
            
            // Expanded detection area - check if mouse is within or near the gallery bounds
            const expandedTop = rect.top - 50;
            const expandedBottom = rect.bottom + 50;
            const expandedLeft = rect.left - 100; // Extend detection area to the left
            const expandedRight = rect.right + 100; // Extend detection area to the right
            
            if (
                this.mouseX >= expandedLeft &&
                this.mouseX <= expandedRight &&
                this.mouseY >= expandedTop &&
                this.mouseY <= expandedBottom
            ) {
                // Check if mouse is near the left or right edge with expanded detection
                if (this.options.edgeScrollEnabled) {
                    // Left edge - expanded detection area
                    if (this.mouseX < rect.left + this.options.edgeScrollThreshold) {
                        this.startScrolling(-1); // Scroll left
                    }
                    // Right edge - expanded detection area
                    else if (this.mouseX > rect.right - this.options.edgeScrollThreshold) {
                        this.startScrolling(1); // Scroll right
                    }
                    // Not near edges
                    else {
                        this.stopScrolling();
                    }
                }
            } else {
                // Mouse is outside expanded gallery area
                this.stopScrolling();
            }
        }
    }
    
    /**
     * Handle window resize
     */
    handleResize() {
        // Keep edge scrolling enabled on all devices
        // Just update dimensions and layout as needed
        if (this.element) {
            // Recalculate dimensions if needed
            const maxScrollLeft = this.element.scrollWidth - this.element.clientWidth;
            
            // Reset scroll position if we're at the end and resize makes content shorter
            if (this.element.scrollLeft > maxScrollLeft) {
                this.element.scrollLeft = maxScrollLeft > 0 ? maxScrollLeft : 0;
            }
        }
    }
    
    /**
     * Initialize edge scrolling functionality
     */
    initializeEdgeScrolling() {
        // Set up animation frame for smooth scrolling
        this.animationFrame = requestAnimationFrame(this.updateScroll.bind(this));
        
        // Add scroll event listener to detect manual scrolling
        this.element.addEventListener('scroll', () => {
            // Check if we've reached the start or end of the gallery
            const maxScrollLeft = this.element.scrollWidth - this.element.clientWidth;
            
            if (this.element.scrollLeft <= 0) {
                this.reachedStart = true;
            } else if (this.element.scrollLeft >= maxScrollLeft) {
                this.reachedEnd = true;
            } else {
                this.reachedStart = false;
                this.reachedEnd = false;
            }
        });
        
        // Add touch event support for mobile devices
        this.initializeTouchScrolling();
    }
    
    /**
     * Initialize touch scrolling for mobile devices
     */
    initializeTouchScrolling() {
        if (!this.element) return;
        
        let startX, startScrollLeft, isDragging = false;
        
        // Touch start event
        this.element.addEventListener('touchstart', (e) => {
            startX = e.touches[0].pageX;
            startScrollLeft = this.element.scrollLeft;
            isDragging = true;
        }, { passive: true });
        
        // Touch move event
        this.element.addEventListener('touchmove', (e) => {
            if (!isDragging) return;
            
            // Calculate distance moved
            const x = e.touches[0].pageX;
            const distance = startX - x;
            
            // Scroll the container
            this.element.scrollLeft = startScrollLeft + distance;
        }, { passive: true });
        
        // Touch end event
        this.element.addEventListener('touchend', () => {
            isDragging = false;
        }, { passive: true });
        
        // Touch cancel event
        this.element.addEventListener('touchcancel', () => {
            isDragging = false;
        }, { passive: true });
    }
    
    /**
     * Start scrolling in a direction
     * @param {number} direction - Direction to scroll (-1 for left, 1 for right)
     */
    startScrolling(direction) {
        this.isScrolling = true;
        this.scrollDirection = direction;
    }
    
    /**
     * Stop scrolling
     */
    stopScrolling() {
        this.isScrolling = false;
        this.scrollDirection = 0;
    }
    
    /**
     * Update scroll position based on current scroll direction
     */
    updateScroll() {
        if (this.isScrolling && this.element) {
            // Calculate new scroll position with increased speed
            const scrollSpeed = this.options.edgeScrollSpeed * 2; // Double the scroll speed
            const newScrollLeft = this.element.scrollLeft + (this.scrollDirection * scrollSpeed);
            
            // Check if we've reached the start or end of the gallery
            const maxScrollLeft = this.element.scrollWidth - this.element.clientWidth;
            
            // Check if we're at the start
            if (newScrollLeft <= 0 && this.scrollDirection < 0) {
                if (!this.reachedStart && this.options.bounceAnimationEnabled) {
                    this.triggerBounceAnimation('left');
                }
                this.element.scrollLeft = 0;
                this.reachedStart = true;
            } 
            // Check if we're at the end
            else if (newScrollLeft >= maxScrollLeft && this.scrollDirection > 0) {
                if (!this.reachedEnd && this.options.bounceAnimationEnabled) {
                    this.triggerBounceAnimation('right');
                }
                this.element.scrollLeft = maxScrollLeft;
                this.reachedEnd = true;
            } 
            // Normal scrolling
            else {
                this.element.scrollLeft = newScrollLeft;
                this.reachedStart = false;
                this.reachedEnd = false;
            }
        }
        
        // Continue animation loop
        this.animationFrame = requestAnimationFrame(this.updateScroll.bind(this));
    }
    
    /**
     * Trigger bounce animation at gallery ends
     * @param {string} direction - Direction of bounce ('left' or 'right')
     */
    triggerBounceAnimation(direction) {
        // Find the first or last work item
        const itemIndex = direction === 'left' ? 0 : this.workItems.length - 1;
        const item = this.workItems[itemIndex];
        
        if (item && item.element) {
            // Remove any existing bounce animations
            item.element.classList.remove('bounce-animation-left');
            item.element.classList.remove('bounce-animation-right');
            
            // Force reflow to restart animation
            void item.element.offsetWidth;
            
            // Add appropriate bounce animation based on direction
            if (direction === 'left') {
                item.element.classList.add('bounce-animation-left');
            } else {
                item.element.classList.add('bounce-animation-right');
            }
            
            // Remove classes after animation completes
            setTimeout(() => {
                if (item.element) {
                    item.element.classList.remove('bounce-animation-left');
                    item.element.classList.remove('bounce-animation-right');
                }
            }, 600); // Animation duration
        }
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
