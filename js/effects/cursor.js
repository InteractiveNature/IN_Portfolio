/**
 * cursor.js - Custom cursor implementation for Interactive Nature website
 */

export class Cursor {
    /**
     * Create a new cursor instance
     * @param {Object} options - Configuration options
     */
    constructor(options = {}) {
        this.options = {
            cursorSelector: '.cursor',
            growClass: 'grow',
            interactiveElements: 'a, button, input, textarea, select, .service-card, .work-item',
            easeFactor: 0.2,
            size: 16,
            growSize: 3,
            enabled: true,
            ...options
        };
        
        this.cursor = null;
        this.mouseX = 0;
        this.mouseY = 0;
        this.cursorX = 0;
        this.cursorY = 0;
        this.isGrowing = false;
        this.animationFrame = null;
    }
    
    /**
     * Initialize the cursor
     * @returns {Cursor} - For chaining
     */
    init() {
        if (!this.options.enabled) return this;
        
        this.cursor = document.querySelector(this.options.cursorSelector);
        if (!this.cursor) {
            console.warn('Custom cursor element not found');
            return this;
        }
        
        // Set initial cursor size
        this.cursor.style.width = `${this.options.size}px`;
        this.cursor.style.height = `${this.options.size}px`;
        
        this.setupEventListeners();
        this.animateCursor();
        
        return this;
    }
    
    /**
     * Set up event listeners
     */
    setupEventListeners() {
        // Track mouse position
        document.addEventListener('mousemove', this.handleMouseMove.bind(this));
        
        // Handle interactive elements
        const interactiveElements = document.querySelectorAll(this.options.interactiveElements);
        interactiveElements.forEach(element => {
            element.addEventListener('mouseenter', this.handleElementEnter.bind(this));
            element.addEventListener('mouseleave', this.handleElementLeave.bind(this));
        });
        
        // Handle document changes (for dynamically added elements)
        const observer = new MutationObserver(mutations => {
            mutations.forEach(mutation => {
                if (mutation.addedNodes.length) {
                    mutation.addedNodes.forEach(node => {
                        if (node.nodeType === Node.ELEMENT_NODE) {
                            // Check if the added node is interactive
                            if (node.matches(this.options.interactiveElements)) {
                                node.addEventListener('mouseenter', this.handleElementEnter.bind(this));
                                node.addEventListener('mouseleave', this.handleElementLeave.bind(this));
                            }
                            
                            // Check any children that might be interactive
                            const childInteractiveElements = node.querySelectorAll(this.options.interactiveElements);
                            childInteractiveElements.forEach(element => {
                                element.addEventListener('mouseenter', this.handleElementEnter.bind(this));
                                element.addEventListener('mouseleave', this.handleElementLeave.bind(this));
                            });
                        }
                    });
                }
            });
        });
        
        // Observe document body for changes
        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
        
        // Handle cursor leaving/entering window
        document.addEventListener('mouseout', (e) => {
            if (e.relatedTarget === null) {
                this.cursor.style.opacity = '0';
            }
        });
        
        document.addEventListener('mouseover', () => {
            this.cursor.style.opacity = '1';
        });
    }
    
    /**
     * Handle mouse movement
     * @param {MouseEvent} e - Mouse event
     */
    handleMouseMove(e) {
        this.mouseX = e.clientX;
        this.mouseY = e.clientY;
        
        // Calculate mouse position for gradient shift
        const horizontalPosition = (this.mouseX / window.innerWidth) * 100;
        document.documentElement.style.setProperty('--gradient-position', `${horizontalPosition}%`);
    }
    
    /**
     * Handle mouse entering an interactive element
     */
    handleElementEnter() {
        this.isGrowing = true;
        this.cursor.classList.add(this.options.growClass);
    }
    
    /**
     * Handle mouse leaving an interactive element
     */
    handleElementLeave() {
        this.isGrowing = false;
        this.cursor.classList.remove(this.options.growClass);
    }
    
    /**
     * Animate the cursor
     */
    animateCursor() {
        // Calculate smooth movement with easing
        const { easeFactor } = this.options;
        this.cursorX += (this.mouseX - this.cursorX) * easeFactor;
        this.cursorY += (this.mouseY - this.cursorY) * easeFactor;
        
        // Apply position
        this.cursor.style.left = `${this.cursorX}px`;
        this.cursor.style.top = `${this.cursorY}px`;
        
        // Continue animation loop
        this.animationFrame = requestAnimationFrame(this.animateCursor.bind(this));
    }
    
    /**
     * Destroy the cursor instance
     */
    destroy() {
        if (this.animationFrame) {
            cancelAnimationFrame(this.animationFrame);
        }
        
        // Remove any event listeners if needed
        document.removeEventListener('mousemove', this.handleMouseMove.bind(this));
        
        // Reset cursor
        if (this.cursor) {
            this.cursor.style.opacity = '0';
            setTimeout(() => {
                this.cursor.remove();
            }, 300);
        }
    }
}
