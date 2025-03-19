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
            numLines: 10,
            opacity: 0.1,
            lineColor: '#e60000',
            distortionFactor: 100,
            enabled: true,
            ...options
        };
        
        this.svg = null;
        this.lines = [];
        this.mouseX = 0;
        this.mouseY = 0;
        this.windowWidth = window.innerWidth;
        this.windowHeight = window.innerHeight;
        this.animationFrame = null;
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
        
        this.createBackgroundLines();
        this.setupEventListeners();
        this.animateBackground();
        
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
        
        // Create horizontal lines
        for (let i = 0; i < numLines; i++) {
            const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
            const yPos = (i / numLines) * 100 + '%';
            
            line.setAttribute('x1', '0%');
            line.setAttribute('y1', yPos);
            line.setAttribute('x2', '100%');
            line.setAttribute('y2', yPos);
            line.setAttribute('stroke', lineColor);
            line.setAttribute('stroke-width', '1');
            
            this.svg.appendChild(line);
            this.lines.push(line);
        }
        
        // Create vertical lines
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
    }
    
    /**
     * Update background effect based on mouse position
     */
    updateBackgroundEffect() {
        const lines = this.svg.querySelectorAll('line');
        const { numLines, distortionFactor } = this.options;
        
        // Check if lines exist - if not, recreate them
        if (lines.length === 0) {
            this.createBackgroundLines();
            return; // Skip this frame and wait for next
        }
        
        lines.forEach((line, index) => {
            // Calculate distortion based on mouse position
            const distortionX = (this.mouseX / this.windowWidth - 0.5) * distortionFactor;
            const distortionY = (this.mouseY / this.windowHeight - 0.5) * distortionFactor;
            
            // Apply different distortion to horizontal and vertical lines
            if (line.getAttribute('y1') === line.getAttribute('y2')) {
                // Horizontal line
                line.setAttribute('y1', `calc(${(index % numLines) / numLines * 100}% + ${distortionY * Math.sin(index / numLines * Math.PI)}px)`);
                line.setAttribute('y2', `calc(${(index % numLines) / numLines * 100}% + ${distortionY * Math.sin(index / numLines * Math.PI)}px)`);
            } else {
                // Vertical line
                line.setAttribute('x1', `calc(${(index % numLines) / numLines * 100}% + ${distortionX * Math.sin(index / numLines * Math.PI)}px)`);
                line.setAttribute('x2', `calc(${(index % numLines) / numLines * 100}% + ${distortionX * Math.sin(index / numLines * Math.PI)}px)`);
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
