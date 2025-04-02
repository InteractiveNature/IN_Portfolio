/**
 * auth.js - Authentication module for password-protected NDA projects
 */

/**
 * Check if user is authenticated for a specific project
 * @param {string} projectId - ID of the project to check authentication for
 * @returns {boolean} - Whether the user is authenticated
 */
export function isAuthenticated(projectId) {
    return sessionStorage.getItem(`auth_${projectId}`) === 'true';
}

/**
 * Authenticate user for a specific project
 * @param {string} projectId - ID of the project to authenticate for
 * @param {string} password - Password to validate
 * @returns {boolean} - Whether authentication was successful
 */
export function authenticateUser(projectId, password) {
    // Currently using a single password for all projects
    // This can be extended to support project-specific passwords
    if (password === 'password') { // Default password
        sessionStorage.setItem(`auth_${projectId}`, 'true');
        return true;
    }
    return false;
}

/**
 * Clear authentication for a specific project
 * @param {string} projectId - ID of the project to clear authentication for
 */
export function clearAuthentication(projectId) {
    sessionStorage.removeItem(`auth_${projectId}`);
}

/**
 * Clear all authentication data
 */
export function clearAllAuthentication() {
    // Find all auth items in sessionStorage and remove them
    Object.keys(sessionStorage).forEach(key => {
        if (key.startsWith('auth_')) {
            sessionStorage.removeItem(key);
        }
    });
}
