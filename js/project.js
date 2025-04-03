/**
 * project.js - JavaScript for project detail pages
 */

import { isAuthenticated } from './auth.js';
import { PasswordModal } from './components/PasswordModal.js';

document.addEventListener('DOMContentLoaded', () => {
    // Initialize background effects
    initializeBackgroundEffects();
    
    // Check if this is an NDA project
    checkNdaProtection();
    
    // Initialize gallery lightbox
    initializeGallery();
    
    // Initialize next project navigation
    initializeNextProject();
});

/**
 * Initialize background effects for project page
 */
function initializeBackgroundEffects() {
    // Add any project-specific background effects here
}

/**
 * Check if this project requires NDA protection
 */
function checkNdaProtection() {
    // Get project ID from the URL
    const path = window.location.pathname;
    const urlProjectId = path.substring(path.lastIndexOf('/') + 1).replace('.html', '');
    
    // Get project title from the page
    const projectTitle = document.querySelector('.project-hero-content h1')?.textContent || '';
    
    // Generate project ID from title (same logic as in WorkItemManager.js)
    // This ensures consistency between the project ID used in the work grid and the project page
    const titleProjectId = projectTitle.toLowerCase().replace(/\s+/g, '-');
    
    // Try both project IDs to ensure compatibility
    const projectIds = [urlProjectId, titleProjectId];
    let isUserAuthenticated = false;
    
    // Check if user is authenticated with any of the possible project IDs
    for (const id of projectIds) {
        if (isAuthenticated(id)) {
            isUserAuthenticated = true;
            break;
        }
    }
    
    // Check if this project has NDA protection
    const isNdaProject = document.body.hasAttribute('data-nda');
    
    if (isNdaProject) {
        // Load NDA protection styles
        loadNdaProtectionStyles();
        
        // Check if user is authenticated for this project
        if (!isUserAuthenticated) {
            // Create password modal
            const passwordModal = new PasswordModal({
                onAuthenticated: (authenticatedProjectId) => {
                    // Also authenticate with the URL-based project ID to ensure compatibility
                    if (authenticatedProjectId !== urlProjectId) {
                        sessionStorage.setItem(`auth_${urlProjectId}`, 'true');
                    }
                    if (authenticatedProjectId !== titleProjectId && titleProjectId) {
                        sessionStorage.setItem(`auth_${titleProjectId}`, 'true');
                    }
                    
                    // Reload the page after authentication
                    window.location.reload();
                }
            });
            
            // Show password modal with the title-based project ID (if available) or URL-based ID
            const projectId = titleProjectId || urlProjectId;
            passwordModal.show(projectId, window.location.href);
        } else {
            // Ensure any existing password modals are removed from the DOM
            const existingModals = document.querySelectorAll('.password-modal');
            existingModals.forEach(modal => {
                if (modal && modal.parentNode) {
                    modal.parentNode.removeChild(modal);
                }
            });
        }
    }
}

/**
 * Load NDA protection styles
 */
function loadNdaProtectionStyles() {
    // Check if styles are already loaded
    if (!document.querySelector('link[href="../css/nda-protection.css"]')) {
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = '../css/nda-protection.css';
        document.head.appendChild(link);
    }
}

/**
 * Initialize gallery lightbox functionality
 */
function initializeGallery() {
    const galleryItems = document.querySelectorAll('.gallery-item img');
    
    galleryItems.forEach(item => {
        item.addEventListener('click', () => {
            // Create lightbox
            const lightbox = document.createElement('div');
            lightbox.className = 'lightbox';
            
            // Create lightbox content
            const lightboxContent = document.createElement('div');
            lightboxContent.className = 'lightbox-content';
            
            // Create close button
            const closeButton = document.createElement('button');
            closeButton.className = 'close-lightbox';
            closeButton.innerHTML = '&times;';
            closeButton.addEventListener('click', () => {
                document.body.removeChild(lightbox);
            });
            
            // Create image
            const img = document.createElement('img');
            img.src = item.src;
            img.alt = item.alt;
            
            // Assemble lightbox
            lightboxContent.appendChild(closeButton);
            lightboxContent.appendChild(img);
            lightbox.appendChild(lightboxContent);
            
            // Add to document
            document.body.appendChild(lightbox);
            
            // Add keyboard event listener
            const handleKeyDown = (e) => {
                if (e.key === 'Escape') {
                    document.body.removeChild(lightbox);
                    document.removeEventListener('keydown', handleKeyDown);
                }
            };
            
            document.addEventListener('keydown', handleKeyDown);
            
            // Add click event to close lightbox when clicking outside the image
            lightbox.addEventListener('click', (e) => {
                if (e.target === lightbox) {
                    document.body.removeChild(lightbox);
                    document.removeEventListener('keydown', handleKeyDown);
                }
            });
        });
    });
}

/**
 * Initialize next project navigation
 */
function initializeNextProject() {
    const nextProjectLink = document.querySelector('.next-project-link');
    
    if (nextProjectLink) {
        // Check if the next project is an NDA project
        const isNdaProject = nextProjectLink.hasAttribute('data-nda');
        
        if (isNdaProject) {
            // Get project ID
            const projectId = nextProjectLink.getAttribute('data-project-id');
            
            // Add click handler to show password modal
            nextProjectLink.addEventListener('click', (e) => {
                // Prevent default navigation
                e.preventDefault();
                
                // Check if already authenticated
                if (isAuthenticated(projectId)) {
                    // Allow navigation if authenticated
                    window.location.href = nextProjectLink.href;
                } else {
                    // Create password modal
                    const passwordModal = new PasswordModal({
                        onAuthenticated: (authenticatedProjectId) => {
                            // Also authenticate with the URL-based project ID to ensure compatibility
                            const url = nextProjectLink.href;
                            const urlProjectId = url.substring(url.lastIndexOf('/') + 1).replace('.html', '');
                            if (authenticatedProjectId !== urlProjectId) {
                                sessionStorage.setItem(`auth_${urlProjectId}`, 'true');
                            }
                            
                            // Navigate to the next project after authentication
                            window.location.href = nextProjectLink.href;
                        }
                    });
                    
                    // Show password modal
                    passwordModal.show(projectId, nextProjectLink.href);
                }
            });
        }
    }
}
