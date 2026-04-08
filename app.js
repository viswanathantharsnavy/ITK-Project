/**
 * Application Utilities Module
 * Handles navigation, UI updates, and general app functionality
 */

const app = {
    /**
     * Initialize navigation bar
     * Updates navigation based on login status
     */
    initNavigation() {
        const isLoggedIn = auth.isLoggedIn();
        const currentUser = auth.getCurrentUser();

        // Update navigation links
        const loginLink = document.getElementById('loginLink');
        const registerLink = document.getElementById('registerLink');
        const createBlogLink = document.getElementById('createBlogLink');
        const dashboardLink = document.getElementById('dashboardLink');
        const userName = document.getElementById('userName');
        const logoutBtn = document.getElementById('logoutBtn');

        if (isLoggedIn && currentUser) {
            // Hide login/register links
            if (loginLink) loginLink.style.display = 'none';
            if (registerLink) registerLink.style.display = 'none';

            // Show authenticated user options
            if (createBlogLink) createBlogLink.style.display = 'block';
            if (dashboardLink) dashboardLink.style.display = 'block';
            if (userName) {
                userName.style.display = 'inline-block';
                userName.textContent = `👤 ${currentUser.name}`;
            }
            if (logoutBtn) {
                logoutBtn.style.display = 'inline-block';
                logoutBtn.addEventListener('click', this.handleLogout);
            }
        } else {
            // Show login/register links
            if (loginLink) loginLink.style.display = 'block';
            if (registerLink) registerLink.style.display = 'block';

            // Hide authenticated user options
            if (createBlogLink) createBlogLink.style.display = 'none';
            if (dashboardLink) dashboardLink.style.display = 'none';
            if (userName) userName.style.display = 'none';
            if (logoutBtn) logoutBtn.style.display = 'none';
        }

        // Initialize mobile menu toggle
        this.initMobileMenu();
    },

    /**
     * Initialize mobile menu toggle
     */
    initMobileMenu() {
        const navToggle = document.getElementById('navToggle');
        const navMenu = document.getElementById('navMenu');

        if (navToggle && navMenu) {
            navToggle.addEventListener('click', () => {
                navMenu.classList.toggle('active');
            });

            // Close menu when clicking on a link
            navMenu.querySelectorAll('a, button').forEach(item => {
                item.addEventListener('click', () => {
                    navMenu.classList.remove('active');
                });
            });

            // Close menu when clicking outside
            document.addEventListener('click', (e) => {
                if (!navMenu.contains(e.target) && !navToggle.contains(e.target)) {
                    navMenu.classList.remove('active');
                }
            });
        }
    },

    /**
     * Handle logout
     */
    handleLogout() {
        if (confirm('Are you sure you want to logout?')) {
            auth.logout();
            window.location.href = 'index.html';
        }
    },

    /**
     * Redirect to login if not authenticated
     */
    requireAuth() {
        if (!auth.isLoggedIn()) {
            alert('Please login to access this page.');
            window.location.href = 'login.html';
            return false;
        }
        return true;
    },

    /**
     * Format date for display
     * @param {string} dateString - ISO date string
     * @returns {string}
     */
    formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    },

    /**
     * Show notification/toast message
     * @param {string} message - Message to display
     * @param {string} type - Type of notification (success, error, info)
     */
    showNotification(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background-color: ${type === 'success' ? '#27ae60' : type === 'error' ? '#e74c3c' : '#3498db'};
            color: white;
            padding: 1rem 1.5rem;
            border-radius: 5px;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
            z-index: 3000;
            animation: slideIn 0.3s ease;
        `;

        document.body.appendChild(notification);

        // Remove notification after 3 seconds
        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => {
                notification.remove();
            }, 300);
        }, 3000);
    },

    /**
     * Validate email format
     * @param {string} email - Email to validate
     * @returns {boolean}
     */
    isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    },

    /**
     * Validate password strength
     * @param {string} password - Password to validate
     * @returns {Object} - { valid: boolean, message: string }
     */
    validatePassword(password) {
        if (password.length < 6) {
            return {
                valid: false,
                message: 'Password must be at least 6 characters long'
            };
        }
        return {
            valid: true,
            message: ''
        };
    },

    /**
     * Debounce function for search inputs
     * @param {Function} func - Function to debounce
     * @param {number} wait - Wait time in milliseconds
     * @returns {Function}
     */
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    },

    /**
     * Scroll to top of page
     */
    scrollToTop() {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    }
};

// Add CSS animations for notifications
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(400px);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }

    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(400px);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);
