/**
 * PasswordModal.js - Password modal component for NDA projects
 */

import { authenticateUser, isAuthenticated } from '../auth.js';

export class PasswordModal {
    /**
     * Create a new password modal
     * @param {Object} options - Configuration options
     */
    constructor(options = {}) {
        this.options = {
            onAuthenticated: null, // Callback when authentication is successful
            ...options
        };
        
        this.currentProjectId = null;
        this.currentProjectUrl = null;
        this.modalElement = null;
        this.errorMessageElement = null;
        this.passwordInput = null;
        
        this.handleSubmit = this.handleSubmit.bind(this);
        this.handleClose = this.handleClose.bind(this);
        this.handleKeyDown = this.handleKeyDown.bind(this);
        
        this.createModal();
    }
    
    /**
     * Create the modal element
     */
    createModal() {
        // Create modal container
        this.modalElement = document.createElement('div');
        this.modalElement.className = 'password-modal';
        
        // Create modal content
        const modalContent = document.createElement('div');
        modalContent.className = 'modal-content';
        
        // Create title
        const title = document.createElement('h2');
        title.textContent = 'Protected Project';
        
        // Create close button - positioned at the top right
        const closeButton = document.createElement('button');
        closeButton.className = 'close-modal';
        closeButton.innerHTML = '&times;';
        closeButton.addEventListener('click', this.handleClose);
        
        // Create description
        const description = document.createElement('p');
        description.textContent = 'This project is under NDA. Please enter the password to view.';
        
        // Create form
        const form = document.createElement('form');
        form.id = 'password-form';
        form.addEventListener('submit', this.handleSubmit);
        
        // Create password input
        this.passwordInput = document.createElement('input');
        this.passwordInput.type = 'password';
        this.passwordInput.id = 'project-password';
        this.passwordInput.placeholder = 'Enter password';
        this.passwordInput.required = true;
        
        // Create error message container
        this.errorMessageElement = document.createElement('div');
        this.errorMessageElement.className = 'error-message';
        
        // Create submit button
        const submitButton = document.createElement('button');
        submitButton.type = 'submit';
        submitButton.className = 'cta-button';
        submitButton.textContent = 'Submit';
        
        // Assemble the modal
        form.appendChild(this.passwordInput);
        form.appendChild(this.errorMessageElement);
        form.appendChild(submitButton);
        
        modalContent.appendChild(closeButton);
        modalContent.appendChild(title);
        modalContent.appendChild(description);
        modalContent.appendChild(form);
        
        this.modalElement.appendChild(modalContent);
        
        // Add to document
        document.body.appendChild(this.modalElement);
        
        // Add keyboard event listener
        document.addEventListener('keydown', this.handleKeyDown);
    }
    
    /**
     * Show the modal for a specific project
     * @param {string} projectId - ID of the project
     * @param {string} projectUrl - URL of the project page
     */
    show(projectId, projectUrl) {
        this.currentProjectId = projectId;
        this.currentProjectUrl = projectUrl;
        
        // Reset form
        this.passwordInput.value = '';
        this.errorMessageElement.textContent = '';
        
        // Show modal with animation
        this.modalElement.classList.add('active');
        setTimeout(() => {
            this.passwordInput.focus();
        }, 300);
    }
    
    /**
     * Hide the modal
     */
    hide() {
        this.modalElement.classList.remove('active');
    }
    
    /**
     * Handle form submission
     * @param {Event} e - Submit event
     */
    handleSubmit(e) {
        e.preventDefault();
        
        const password = this.passwordInput.value.trim();
        
        if (!password) {
            this.showError('Please enter a password');
            return;
        }
        
        const isValid = authenticateUser(this.currentProjectId, password);
        
        if (isValid) {
            this.hide();
            
            // Call onAuthenticated callback if provided
            if (typeof this.options.onAuthenticated === 'function') {
                this.options.onAuthenticated(this.currentProjectId, this.currentProjectUrl);
            } else {
                // Default behavior: redirect to project page
                window.location.href = this.currentProjectUrl;
            }
        } else {
            this.showError('Incorrect password. Please try again.');
            this.passwordInput.value = '';
            this.passwordInput.focus();
        }
    }
    
    /**
     * Handle close button click
     */
    handleClose() {
        this.hide();
    }
    
    /**
     * Handle keyboard events
     * @param {KeyboardEvent} e - Keyboard event
     */
    handleKeyDown(e) {
        // Close modal on Escape key
        if (e.key === 'Escape' && this.modalElement.classList.contains('active')) {
            this.hide();
        }
    }
    
    /**
     * Show error message
     * @param {string} message - Error message to display
     */
    showError(message) {
        this.errorMessageElement.textContent = message;
        
        // Shake animation for error feedback
        this.passwordInput.classList.add('shake');
        setTimeout(() => {
            this.passwordInput.classList.remove('shake');
        }, 500);
    }
    
    /**
     * Check if a project requires authentication and handle accordingly
     * @param {string} projectId - ID of the project
     * @param {string} projectUrl - URL of the project page
     * @returns {boolean} - Whether the navigation was intercepted
     */
    checkAndHandleProtectedProject(projectId, projectUrl) {
        // If already authenticated, allow direct navigation
        if (isAuthenticated(projectId)) {
            return false;
        }
        
        // Show password modal
        this.show(projectId, projectUrl);
        return true; // Navigation intercepted
    }
    
    /**
     * Destroy the modal
     */
    destroy() {
        document.removeEventListener('keydown', this.handleKeyDown);
        
        if (this.modalElement && this.modalElement.parentNode) {
            this.modalElement.parentNode.removeChild(this.modalElement);
        }
    }
}
