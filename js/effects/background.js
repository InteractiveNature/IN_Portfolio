/**
 * background.js - Background grid effect for Interactive Nature website
 */

export class Background {
    /**
     * Create a new background instance
     * @param {Object} options - Configuration options
     */
    constructor(options = {}) {
        this.options = {
            selector: '.bg-lines',
            numLines: 40,
            opacity: 0.2,
            lineColor: '#e60000',
            distortionFactor: 90,
            enabled: true,
            mobileNumLines: 20, // Reduced number of lines for mobile
            mobileDistortionFactor: 40, // Reduced distortion for mobile
            ...options
        };
        
        this.svg = null;
        this.lines = [];
        this.mouseX = 0;
        this.mouseY = 0;
        this.touchX = window.innerWidth / 2; // Default touch position
        this.touchY = window.innerHeight / 2; // Default touch position
        this.isMobile = this.checkIfMobile();
        this.windowWidth = window.innerWidth;
        this.windowHeight = window.innerHeight;
        this.animationFrame = null;
        this.autoAnimationOffset = 0; // For automatic animation on mobile
        this.autoAnimationSpeed = 0.5; // Speed of automatic animation
        
        // Calculate horizontal lines based on aspect ratio to create squares
        this.horizontalLines = this.calculateHorizontalLines();
    }
    
    /**
     * Check if the current device is mobile
     * @returns {boolean} - Whether the device is mobile
     */
    checkIfMobile() {
        return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || 
               (window.matchMedia && window.matchMedia('(max-width: 768px)').matches) ||
               ('ontouchstart' in window) || // Touch events are available
               (navigator.maxTouchPoints > 0); // Device supports touch
    }
    
    /**
     * Calculate the number of horizontal lines needed to create square cells
     * @returns {number} - Number of horizontal lines
     */
    calculateHorizontalLines() {
        return Math.round(this.options.numLines * (this.windowHeight / this.windowWidth));
    }
    
    /**
     * Initialize the background
     * @returns {Background} - For chaining
     */
    init() {
        if (!this.options.enabled) return this;
        
        this.svg = document.querySelector(this.options.selector);
        if (!this.svg) {
            console.warn('Background element not found');
            return this;
        }
        
        // Use fewer lines on mobile for better performance
        if (this.isMobile) {
            this.options.numLines = this.options.mobileNumLines;
            this.options.distortionFactor = this.options.mobileDistortionFactor;
            this.horizontalLines = this.calculateHorizontalLines();
        }
        
        this.createBackgroundLines();
        this.setupEventListeners();
        this.animateBackground();
        
        console.log(`Background grid initialized with ${this.options.numLines} lines, mobile: ${this.isMobile}`);
        
        return this;
    }
    
    /**
     * Create the background grid lines
     */
    createBackgroundLines() {
        // Clear any existing lines first
        this.svg.innerHTML = '';
        this.lines = [];
        
        const { numLines, lineColor } = this.options;
        
        // Create horizontal lines - using calculated horizontalLines for square cells
        for (let i = 0; i < this.horizontalLines; i++) {
            const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
            const yPos = (i / this.horizontalLines) * 100 + '%';
            
            line.setAttribute('x1', '0%');
            line.setAttribute('y1', yPos);
            line.setAttribute('x2', '100%');
            line.setAttribute('y2', yPos);
            line.setAttribute('stroke', lineColor);
            line.setAttribute('stroke-width', '2');
            
            this.svg.appendChild(line);
            this.lines.push(line);
        }
        
        // Create vertical lines - using original numLines
        for (let i = 0; i < numLines; i++) {
            const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
            const xPos = (i / numLines) * 100 + '%';
            
            line.setAttribute('x1', xPos);
            line.setAttribute('y1', '0%');
            line.setAttribute('x2', xPos);
            line.setAttribute('y2', '100%');
            line.setAttribute('stroke', lineColor);
            line.setAttribute('stroke-width', '1');
            
            this.svg.appendChild(line);
            this.lines.push(line);
        }
    }
    
    /**
     * Set up event listeners
     */
    setupEventListeners() {
        // Track mouse position
        document.addEventListener('mousemove', this.handleMouseMove.bind(this));
        
        // Add touch event support for mobile
        document.addEventListener('touchmove', this.handleTouchMove.bind(this), { passive: true });
        document.addEventListener('touchstart', this.handleTouchStart.bind(this), { passive: true });
        
        // Handle window resize
        window.addEventListener('resize', this.handleResize.bind(this));
        
        // Monitor line count to ensure they don't disappear
        setInterval(() => {
            if (this.lines.length < this.options.numLines * 2) {
                console.log("Restoring background lines");
                this.createBackgroundLines();
            }
        }, 5000);
    }
    
    /**
     * Handle touch start event
     * @param {TouchEvent} e - Touch event
     */
    handleTouchStart(e) {
        if (e.touches.length > 0) {
            this.touchX = e.touches[0].clientX;
            this.touchY = e.touches[0].clientY;
        }
    }
    
    /**
     * Handle touch move event
     * @param {TouchEvent} e - Touch event
     */
    handleTouchMove(e) {
        if (e.touches.length > 0) {
            this.touchX = e.touches[0].clientX;
            this.touchY = e.touches[0].clientY;
        }
    }
    
    /**
     * Handle mouse movement
     * @param {MouseEvent} e - Mouse event
     */
    handleMouseMove(e) {
        this.mouseX = e.clientX;
        this.mouseY = e.clientY;
    }
    
    /**
     * Handle window resize
     */
    handleResize() {
        this.windowWidth = window.innerWidth;
        this.windowHeight = window.innerHeight;
        
        // Update mobile status on resize
        this.isMobile = this.checkIfMobile();
        
        // Adjust number of lines based on device type
        if (this.isMobile) {
            this.options.numLines = this.options.mobileNumLines;
            this.options.distortionFactor = this.options.mobileDistortionFactor;
        } else {
            // Restore original values from options
            this.options.numLines = this.options.numLines;
            this.options.distortionFactor = this.options.distortionFactor;
        }
        
        // Recalculate horizontal lines when window is resized
        this.horizontalLines = this.calculateHorizontalLines();
        
        // Recreate the grid with the new dimensions
        this.createBackgroundLines();
    }
    
    /**
     * Update background effect based on mouse/touch position
     */
    updateBackgroundEffect() {
        const lines = this.svg.querySelectorAll('line');
        const { numLines, distortionFactor } = this.options;
        
        // Check if lines exist - if not, recreate them
        if (lines.length === 0) {
            this.createBackgroundLines();
            return; // Skip this frame and wait for next
        }
        
        // For mobile devices, use touch position or auto-animation if no touch
        let posX, posY;
        if (this.isMobile) {
            // Update auto-animation offset for continuous movement
            this.autoAnimationOffset += this.autoAnimationSpeed;
            
            // Use touch position if available, otherwise use auto-animation
            if (this.touchX !== null && this.touchY !== null) {
                posX = this.touchX;
                posY = this.touchY;
            } else {
                // Create a circular motion for auto-animation
                posX = this.windowWidth / 2 + Math.sin(this.autoAnimationOffset * 0.01) * (this.windowWidth / 4);
                posY = this.windowHeight / 2 + Math.cos(this.autoAnimationOffset * 0.01) * (this.windowHeight / 4);
            }
        } else {
            // Use mouse position for desktop
            posX = this.mouseX;
            posY = this.mouseY;
        }
        
        // Calculate distortion based on position
        const distortionX = (posX / this.windowWidth - 0.5) * distortionFactor;
        const distortionY = (posY / this.windowHeight - 0.5) * distortionFactor;
        
        lines.forEach((line, index) => {
            // Apply different distortion to horizontal and vertical lines
            if (line.getAttribute('y1') === line.getAttribute('y2')) {
                // Horizontal line - use horizontalLines for calculation
                const lineIndex = index % this.horizontalLines;
                line.setAttribute('y1', `calc(${lineIndex / this.horizontalLines * 100}% + ${distortionY * Math.sin(lineIndex / this.horizontalLines * Math.PI)}px)`);
                line.setAttribute('y2', `calc(${lineIndex / this.horizontalLines * 100}% + ${distortionY * Math.sin(lineIndex / this.horizontalLines * Math.PI)}px)`);
            } else {
                // Vertical line - use numLines for calculation
                const lineIndex = index % numLines;
                line.setAttribute('x1', `calc(${lineIndex / numLines * 100}% + ${distortionX * Math.sin(lineIndex / numLines * Math.PI)}px)`);
                line.setAttribute('x2', `calc(${lineIndex / numLines * 100}% + ${distortionX * Math.sin(lineIndex / numLines * Math.PI)}px)`);
            }
        });
    }
    
    /**
     * Animate the background
     */
    animateBackground() {
        this.updateBackgroundEffect();
        
        // Continue animation loop
        this.animationFrame = requestAnimationFrame(this.animateBackground.bind(this));
    }
    
    /**
     * Destroy the background instance
     */
    destroy() {
        if (this.animationFrame) {
            cancelAnimationFrame(this.animationFrame);
        }
        
        // Remove event listeners
        document.removeEventListener('mousemove', this.handleMouseMove.bind(this));
        window.removeEventListener('resize', this.handleResize.bind(this));
        
        // Clear SVG
        if (this.svg) {
            this.svg.innerHTML = '';
        }
    }
}
