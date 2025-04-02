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
    const projectId = path.substring(path.lastIndexOf('/') + 1).replace('.html', '');
    
    // Check if this project has NDA protection
    const isNdaProject = document.body.hasAttribute('data-nda');
    
    if (isNdaProject) {
        // Load NDA protection styles
        loadNdaProtectionStyles();
        
        // Check if user is authenticated for this project
        if (!isAuthenticated(projectId)) {
            // Create password modal
            const passwordModal = new PasswordModal({
                onAuthenticated: () => {
                    // Reload the page after authentication
                    window.location.reload();
                }
            });
            
            // Show password modal
            passwordModal.show(projectId, window.location.href);
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
                    const passwordModal = new PasswordModal();
                    
                    // Show password modal
                    passwordModal.show(projectId, nextProjectLink.href);
                }
            });
        }
    }
}
