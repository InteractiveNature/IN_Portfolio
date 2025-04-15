/**
 * ProjectGalleryManager.js - Manages the dynamic project gallery with staggered transitions
 * and service blocks integration
 */

export class ProjectGalleryManager {
    /**
     * Create a new project gallery manager
     * @param {Object} options - Configuration options
     */
    constructor(options = {}) {
        this.options = {
            selector: '.project-gallery-grid',
            visibleItems: 9, // Number of items visible at once
            minDisplayTime: 10000, // Minimum time (ms) an item stays visible (10 seconds)
            maxDisplayTime: 30000, // Maximum time (ms) an item stays visible (30 seconds)
            transitionDuration: 1000, // Duration of fade transition in ms
            ...options
        };
        
        this.element = document.querySelector(this.options.selector);
        this.allProjects = []; // Will hold all available projects
        this.displayedProjects = []; // Currently displayed projects
        this.galleryItems = []; // DOM elements for gallery items
        this.transitionTimers = []; // Timers for each gallery item
        this.serviceBlocks = []; // Service blocks in the gallery
        this.initialized = false;
        
        // Service blocks configuration
        this.servicesConfig = {
            title: 'Our Services',
            description: 'We blend technical precision with creative vision to deliver extraordinary spatial experiences.',
            services: [
                {
                    title: 'Technical Event Production',
                    description: 'Comprehensive technical drafting and production services for events of any scale.',
                    link: 'services/technical-event-production.html'
                },
                {
                    title: 'Digital Environment Design',
                    description: 'Virtual production environments, 3D visualizations, and pre-visualization services.',
                    link: 'services/digital-environment-design.html'
                },
                {
                    title: 'Interactive Installations',
                    description: 'Custom-designed interactive environments that respond to human presence and movement.',
                    link: 'services/interactive-installations.html'
                },
                {
                    title: 'Projection Mapping & Art',
                    description: 'Transform any surface into a canvas for dynamic visual storytelling.',
                    link: 'services/projection-mapping-art.html'
                }
            ],
            // Define which gallery items will be replaced with service blocks
            // Using a stair-step pattern as requested, with one service per row
            blockPositions: {
                title: 'a', // Top left for title
                services: ['d', 'h', 'j', 'n'] // Stair-step pattern with one service per row
            }
            // Note: The grid areas 'p', 'q', 'r', 's' are used for regular gallery items
        };
    }
    
    /**
     * Initialize the project gallery manager
     * @returns {ProjectGalleryManager} - For chaining
     */
    init() {
        if (this.initialized) return this;
        if (!this.element) {
            console.warn('Project gallery grid element not found');
            return this;
        }
        
        this.initialized = true;
        this.createGalleryItems();
        this.setupInitialProjects();
        this.startTransitions();
        
        // Handle visibility changes to pause/resume transitions when tab is inactive
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                this.pauseTransitions();
            } else {
                this.resumeTransitions();
            }
        });
        
        return this;
    }
    
    /**
     * Create gallery item elements with varying sizes
     */
    createGalleryItems() {
        // Clear existing content
        if (this.element) {
            this.element.innerHTML = '';
        }
        
        // Define size classes for brick wall layout with irregular blocks
        const sizeClasses = [
            'gallery-item-a', // Top left block
            'gallery-item-b', // Top center block
            'gallery-item-c', // Top right block
            'gallery-item-d', // Upper left block
            'gallery-item-e', // Upper center-left block
            'gallery-item-f', // Upper center-right block
            'gallery-item-g', // Upper right block
            'gallery-item-h', // Middle left block
            'gallery-item-i', // Middle right block
            'gallery-item-j', // Lower middle left block
            'gallery-item-k', // Lower middle right block
            'gallery-item-l', // Lower left block
            'gallery-item-m', // Lower center-left block
            'gallery-item-n', // Lower center-right block
            'gallery-item-o', // Lower right block
            'gallery-item-p', // Middle center-left block (new)
            'gallery-item-q', // Middle center-right block (new)
            'gallery-item-r', // Bottom left block
            'gallery-item-s'  // Bottom right block (new)
        ];
        
        // Create gallery items with varying sizes
        for (let i = 0; i < Math.min(this.options.visibleItems, sizeClasses.length); i++) {
            const itemElement = document.createElement('div');
            itemElement.className = `gallery-item ${sizeClasses[i]}`;
            
            // Create two containers for smooth transitions
            const container1 = document.createElement('div');
            container1.className = 'gallery-item-container active';
            
            const container2 = document.createElement('div');
            container2.className = 'gallery-item-container';
            
            itemElement.appendChild(container1);
            itemElement.appendChild(container2);
            
            this.element.appendChild(itemElement);
            this.galleryItems.push({
                element: itemElement,
                containers: [container1, container2],
                activeContainerIndex: 0,
                currentProject: null,
                nextTransitionTime: 0,
                sizeClass: sizeClasses[i]
            });
        }
        
        // Create service blocks after creating gallery items
        this.createServiceBlocks();
    }
    
    /**
     * Create service blocks in the gallery
     */
    createServiceBlocks() {
        // Create the title block
        this.createServiceTitleBlock();
        
        // Create the service blocks
        this.createServiceItemBlocks();
    }
    
    /**
     * Create the service title block in the top left
     */
    createServiceTitleBlock() {
        // Find the gallery item for the title block
        const titleItemIndex = this.galleryItems.findIndex(item => 
            item.sizeClass === `gallery-item-${this.servicesConfig.blockPositions.title}`);
        
        if (titleItemIndex === -1) return;
        
        const titleItem = this.galleryItems[titleItemIndex];
        
        // Clear the containers
        titleItem.containers.forEach(container => {
            container.innerHTML = '';
        });
        
        // Create the title block
        const titleBlock = document.createElement('div');
        titleBlock.className = 'service-title-block';
        
        const title = document.createElement('h2');
        title.textContent = this.servicesConfig.title;
        
        const description = document.createElement('p');
        description.textContent = this.servicesConfig.description;
        
        titleBlock.appendChild(title);
        titleBlock.appendChild(description);
        
        // Add to the active container
        titleItem.containers[titleItem.activeContainerIndex].appendChild(titleBlock);
        
        // Mark this item as a service block
        titleItem.isServiceBlock = true;
        
        // Remove from transition timers
        if (this.transitionTimers[titleItemIndex]) {
            clearTimeout(this.transitionTimers[titleItemIndex]);
            this.transitionTimers[titleItemIndex] = null;
        }
        
        // Add to service blocks
        this.serviceBlocks.push({
            type: 'title',
            element: titleItem.element,
            container: titleItem.containers[titleItem.activeContainerIndex],
            galleryItemIndex: titleItemIndex
        });
    }
    
    /**
     * Create service item blocks in the specified positions
     */
    createServiceItemBlocks() {
        // Create each service block
        this.servicesConfig.services.forEach((service, index) => {
            // Get the position for this service
            const position = this.servicesConfig.blockPositions.services[index];
            if (!position) return;
            
            // Find the gallery item for this position
            const itemIndex = this.galleryItems.findIndex(item => 
                item.sizeClass === `gallery-item-${position}`);
            
            if (itemIndex === -1) return;
            
            const item = this.galleryItems[itemIndex];
            
            // Clear the containers
            item.containers.forEach(container => {
                container.innerHTML = '';
            });
            
            // Create the service block
            const serviceBlock = document.createElement('a');
            serviceBlock.className = 'service-block';
            serviceBlock.href = service.link;
            
            const title = document.createElement('h3');
            title.textContent = service.title;
            
            const description = document.createElement('p');
            description.textContent = service.description;
            
            serviceBlock.appendChild(title);
            serviceBlock.appendChild(description);
            
            // Add to the active container
            item.containers[item.activeContainerIndex].appendChild(serviceBlock);
            
            // Mark this item as a service block
            item.isServiceBlock = true;
            
            // Remove from transition timers
            if (this.transitionTimers[itemIndex]) {
                clearTimeout(this.transitionTimers[itemIndex]);
                this.transitionTimers[itemIndex] = null;
            }
            
            // Add to service blocks
            this.serviceBlocks.push({
                type: 'service',
                service: service,
                element: item.element,
                container: item.containers[item.activeContainerIndex],
                galleryItemIndex: itemIndex
            });
        });
    }
    
    /**
     * Set up initial projects to display
     */
    setupInitialProjects() {
        if (this.allProjects.length === 0) {
            console.warn('No projects available for gallery');
            return;
        }
        
        // Clear displayed projects
        this.displayedProjects = [];
        
        // Track used project IDs and video sources to prevent duplicates
        const usedIds = new Set();
        const usedVideoSources = new Set();
        
        // Assign unique projects to gallery items
        this.galleryItems.forEach((item) => {
            // Skip service blocks
            if (item.isServiceBlock) {
                return;
            }
            
            // Find a project that hasn't been used yet
            let project = null;
            let attempts = 0;
            const maxAttempts = this.allProjects.length * 2; // Avoid infinite loop
            
            while (!project && attempts < maxAttempts) {
                attempts++;
                
                // Get a random project
                const randomIndex = Math.floor(Math.random() * this.allProjects.length);
                const candidate = this.allProjects[randomIndex];
                
                // Check if this project or its video is already used
                if (usedIds.has(candidate.id)) {
                    continue; // Skip this project
                }
                
                // Check if this video source is already used
                if (candidate.videoSrc && usedVideoSources.has(candidate.videoSrc)) {
                    continue; // Skip this project
                }
                
                // This project is unique, use it
                project = candidate;
                
                // Mark as used
                usedIds.add(project.id);
                if (project.videoSrc) {
                    usedVideoSources.add(project.videoSrc);
                }
            }
            
            // If we couldn't find a unique project, use any project as fallback
            if (!project && this.allProjects.length > 0) {
                project = this.allProjects[Math.floor(Math.random() * this.allProjects.length)];
            }
            
            if (project) {
                this.displayedProjects.push(project);
                this.updateGalleryItem(item, project);
            }
        });
    }
    
    /**
     * Start transition timers for all gallery items
     */
    startTransitions() {
        this.galleryItems.forEach((item, index) => {
            // Skip service blocks
            if (item.isServiceBlock) {
                return;
            }
            
            // Set random display time for each item
            const displayTime = this.getRandomDisplayTime();
            
            // Schedule next transition
            const timer = setTimeout(() => {
                this.transitionItem(index);
            }, displayTime);
            
            // Store timer reference
            this.transitionTimers[index] = timer;
            
            // Store next transition time for pause/resume functionality
            item.nextTransitionTime = Date.now() + displayTime;
        });
    }
    
    /**
     * Pause all transitions (for when tab is inactive)
     */
    pauseTransitions() {
        // Clear all timers
        this.transitionTimers.forEach((timer, index) => {
            clearTimeout(timer);
            this.transitionTimers[index] = null;
        });
    }
    
    /**
     * Resume transitions after pause
     */
    resumeTransitions() {
        const now = Date.now();
        
        // Restart timers with adjusted times
        this.galleryItems.forEach((item, index) => {
            // Skip service blocks
            if (item.isServiceBlock) {
                return;
            }
            
            if (this.transitionTimers[index] === null) {
                let remainingTime = Math.max(0, item.nextTransitionTime - now);
                
                // If the transition should have already happened, do it soon
                if (remainingTime <= 0) {
                    remainingTime = Math.random() * 2000 + 1000; // 1-3 seconds
                }
                
                // Schedule next transition
                this.transitionTimers[index] = setTimeout(() => {
                    this.transitionItem(index);
                }, remainingTime);
            }
        });
    }
    
    /**
     * Transition a specific gallery item to a new project
     * @param {number} index - Index of the gallery item to transition
     */
    transitionItem(index) {
        const item = this.galleryItems[index];
        if (!item) return;
        
        // Skip service blocks
        if (item.isServiceBlock) {
            return;
        }
        
        // Get a new project that's not currently displayed
        const newProject = this.getNewRandomProject();
        if (!newProject) return;
        
        // Update the inactive container with the new project
        const inactiveContainerIndex = item.activeContainerIndex === 0 ? 1 : 0;
        const inactiveContainer = item.containers[inactiveContainerIndex];
        
        // Prepare the inactive container with new content
        this.updateContainer(inactiveContainer, newProject);
        
        // Perform the transition
        item.containers[item.activeContainerIndex].classList.remove('active');
        inactiveContainer.classList.add('active');
        
        // Update tracking
        if (item.currentProject) {
            // Remove old project from displayed list
            const oldIndex = this.displayedProjects.findIndex(p => p.id === item.currentProject.id);
            if (oldIndex !== -1) {
                this.displayedProjects.splice(oldIndex, 1);
            }
        }
        
        // Add new project to displayed list
        this.displayedProjects.push(newProject);
        
        // Update item tracking
        item.currentProject = newProject;
        item.activeContainerIndex = inactiveContainerIndex;
        
        // Schedule next transition
        const displayTime = this.getRandomDisplayTime();
        this.transitionTimers[index] = setTimeout(() => {
            this.transitionItem(index);
        }, displayTime);
        
        // Update next transition time
        item.nextTransitionTime = Date.now() + displayTime;
    }
    
    /**
     * Update a gallery item with a project
     * @param {Object} item - Gallery item object
     * @param {Object} project - Project data
     */
    updateGalleryItem(item, project) {
        // Update the active container
        const activeContainer = item.containers[item.activeContainerIndex];
        this.updateContainer(activeContainer, project);
        
        // Store current project
        item.currentProject = project;
    }
    
    /**
     * Update a container with project content
     * @param {HTMLElement} container - Container element
     * @param {Object} project - Project data
     */
    updateContainer(container, project) {
        // Clear existing content
        container.innerHTML = '';
        
        // Create link wrapper
        const link = document.createElement('a');
        link.href = project.projectUrl || '#';
        link.className = 'gallery-item-link';
        if (project.isNDA) {
            link.setAttribute('data-nda', 'true');
            link.setAttribute('data-project-id', project.id || project.title.toLowerCase().replace(/\s+/g, '-'));
        }
        
        // Create content based on type (image or video)
        if (project.videoSrc) {
            // Create video element
            const video = document.createElement('video');
            video.autoplay = true;
            video.loop = true;
            video.muted = true;
            video.playsInline = true;
            video.src = project.videoSrc;
            
            // Add poster image if available
            if (project.imageSrc) {
                video.poster = project.imageSrc;
            }
            
            link.appendChild(video);
        } else if (project.imageSrc) {
            // Create image element
            const img = document.createElement('img');
            img.src = project.imageSrc;
            img.alt = project.imageAlt || project.title;
            img.loading = 'lazy';
            
            link.appendChild(img);
        }
        
        // Add overlay with project info
        const overlay = document.createElement('div');
        overlay.className = 'gallery-item-overlay';
        
        const title = document.createElement('h3');
        title.textContent = project.title;
        
        const description = document.createElement('p');
        description.textContent = project.description;
        
        overlay.appendChild(title);
        overlay.appendChild(description);
        
        link.appendChild(overlay);
        container.appendChild(link);
    }
    
    /**
     * Get a random display time between min and max
     * @returns {number} - Random display time in ms
     */
    getRandomDisplayTime() {
        return Math.floor(
            Math.random() * 
            (this.options.maxDisplayTime - this.options.minDisplayTime) + 
            this.options.minDisplayTime
        );
    }
    
    /**
     * Get a new random project that's not currently displayed
     * @returns {Object|null} - Random project or null if none available
     */
    getNewRandomProject() {
        // Create Sets for faster lookups
        const displayedIds = new Set(this.displayedProjects.map(p => p.id));
        const displayedVideoSources = new Set();
        const displayedImageSources = new Set();
        
        // Collect all currently displayed video and image sources
        this.displayedProjects.forEach(p => {
            if (p.videoSrc) displayedVideoSources.add(p.videoSrc);
            if (p.imageSrc) displayedImageSources.add(p.imageSrc);
        });
        
        // Filter out projects that are currently displayed or have media that's currently showing
        const availableProjects = this.allProjects.filter(project => {
            // Don't show projects with the same ID
            if (displayedIds.has(project.id)) {
                return false;
            }
            
            // Don't show projects with the same video source that's already playing
            if (project.videoSrc && displayedVideoSources.has(project.videoSrc)) {
                return false;
            }
            
            // Don't show projects with the same image that's already displayed
            if (project.imageSrc && displayedImageSources.has(project.imageSrc)) {
                return false;
            }
            
            return true;
        });
        
        // If we have available projects, return a random one
        if (availableProjects.length > 0) {
            return availableProjects[Math.floor(Math.random() * availableProjects.length)];
        }
        
        // If no available projects with unique media, try to find projects with at least unique videos
        const projectsWithUniqueVideos = this.allProjects.filter(project => {
            // Skip projects with the same ID
            if (displayedIds.has(project.id)) {
                return false;
            }
            
            // Only include if video is unique or doesn't exist
            return !project.videoSrc || !displayedVideoSources.has(project.videoSrc);
        });
        
        if (projectsWithUniqueVideos.length > 0) {
            return projectsWithUniqueVideos[Math.floor(Math.random() * projectsWithUniqueVideos.length)];
        }
        
        // Last resort: use any project that's not currently displayed
        const anyNonDisplayedProject = this.allProjects.filter(project => !displayedIds.has(project.id));
        if (anyNonDisplayedProject.length > 0) {
            return anyNonDisplayedProject[Math.floor(Math.random() * anyNonDisplayedProject.length)];
        }
        
        // Absolute last resort: use any project
        return this.allProjects[Math.floor(Math.random() * this.allProjects.length)];
    }
    
    /**
     * Get multiple random projects
     * @param {number} count - Number of projects to get
     * @returns {Array} - Array of random projects
     */
    getRandomProjects(count) {
        // Copy all projects
        const projects = [...this.allProjects];
        const result = [];
        
        // Shuffle and take the first 'count' projects
        for (let i = 0; i < Math.min(count, projects.length); i++) {
            const randomIndex = Math.floor(Math.random() * projects.length);
            result.push(projects[randomIndex]);
            projects.splice(randomIndex, 1);
        }
        
        return result;
    }
    
    /**
     * Set the projects data
     * @param {Array} projects - Array of project data
     * @returns {ProjectGalleryManager} - For chaining
     */
    setProjects(projects) {
        // Add unique IDs to projects if they don't have them
        this.allProjects = projects.map(project => {
            if (!project.id) {
                project.id = project.title.toLowerCase().replace(/\s+/g, '-');
            }
            return project;
        });
        
        // If already initialized, reset displayed projects
        if (this.initialized) {
            this.resetGallery();
        }
        
        return this;
    }
    
    /**
     * Reset the gallery with new projects
     */
    resetGallery() {
        // Clear all timers
        this.transitionTimers.forEach(timer => clearTimeout(timer));
        this.transitionTimers = [];
        
        // Reset displayed projects
        this.displayedProjects = [];
        
        // Set up new projects
        this.setupInitialProjects();
        this.startTransitions();
    }
    
    /**
     * Destroy the project gallery manager
     */
    destroy() {
        // Clear all timers
        this.transitionTimers.forEach(timer => clearTimeout(timer));
        
        // Remove event listeners
        document.removeEventListener('visibilitychange', this.handleVisibilityChange);
        
        this.initialized = false;
    }
}
