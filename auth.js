/**
 * Authentication Module
 * Handles user registration, login, logout, and session management
 * Uses LocalStorage for persistent data storage
 */

const auth = {
    // LocalStorage keys
    STORAGE_KEYS: {
        USERS: 'blog_users',
        CURRENT_USER: 'blog_current_user',
        SESSION: 'blog_session'
    },

    /**
     * Initialize authentication module
     */
    init() {
        // Create users array in LocalStorage if it doesn't exist
        if (!localStorage.getItem(this.STORAGE_KEYS.USERS)) {
            localStorage.setItem(this.STORAGE_KEYS.USERS, JSON.stringify([]));
        }
    },

    /**
     * Register a new user
     * @param {string} name - User's full name
     * @param {string} email - User's email address
     * @param {string} password - User's password
     * @returns {Object} - { success: boolean, message: string }
     */
    register(name, email, password) {
        try {
            // Get existing users
            const users = this.getUsers();

            // Check if user already exists
            const userExists = users.some(user => user.email.toLowerCase() === email.toLowerCase());
            
            if (userExists) {
                return {
                    success: false,
                    message: 'Email already registered. Please use a different email or login.'
                };
            }

            // Create new user object
            const newUser = {
                id: this.generateId(),
                name: name.trim(),
                email: email.toLowerCase().trim(),
                password: password, // In a real app, this would be hashed
                createdAt: new Date().toISOString()
            };

            // Add user to array
            users.push(newUser);

            // Save to LocalStorage
            localStorage.setItem(this.STORAGE_KEYS.USERS, JSON.stringify(users));

            return {
                success: true,
                message: 'Registration successful!'
            };
        } catch (error) {
            console.error('Registration error:', error);
            return {
                success: false,
                message: 'An error occurred during registration. Please try again.'
            };
        }
    },

    /**
     * Login a user
     * @param {string} email - User's email address
     * @param {string} password - User's password
     * @returns {Object} - { success: boolean, message: string, user?: Object }
     */
    login(email, password) {
        try {
            const users = this.getUsers();

            // Find user by email and password
            const user = users.find(
                u => u.email.toLowerCase() === email.toLowerCase().trim() && 
                     u.password === password
            );

            if (!user) {
                return {
                    success: false,
                    message: 'Invalid email or password. Please try again.'
                };
            }

            // Create session
            const session = {
                userId: user.id,
                email: user.email,
                loginTime: new Date().toISOString()
            };

            // Store session and current user
            localStorage.setItem(this.STORAGE_KEYS.SESSION, JSON.stringify(session));
            localStorage.setItem(this.STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));

            return {
                success: true,
                message: 'Login successful!',
                user: user
            };
        } catch (error) {
            console.error('Login error:', error);
            return {
                success: false,
                message: 'An error occurred during login. Please try again.'
            };
        }
    },

    /**
     * Logout current user
     */
    logout() {
        localStorage.removeItem(this.STORAGE_KEYS.SESSION);
        localStorage.removeItem(this.STORAGE_KEYS.CURRENT_USER);
    },

    /**
     * Check if user is logged in
     * @returns {boolean}
     */
    isLoggedIn() {
        const session = localStorage.getItem(this.STORAGE_KEYS.SESSION);
        return session !== null;
    },

    /**
     * Get current logged-in user
     * @returns {Object|null} - User object or null if not logged in
     */
    getCurrentUser() {
        try {
            const userJson = localStorage.getItem(this.STORAGE_KEYS.CURRENT_USER);
            return userJson ? JSON.parse(userJson) : null;
        } catch (error) {
            console.error('Error getting current user:', error);
            return null;
        }
    },

    /**
     * Get current user ID
     * @returns {string|null}
     */
    getCurrentUserId() {
        const user = this.getCurrentUser();
        return user ? user.id : null;
    },

    /**
     * Get all users from LocalStorage
     * @returns {Array}
     */
    getUsers() {
        try {
            const usersJson = localStorage.getItem(this.STORAGE_KEYS.USERS);
            return usersJson ? JSON.parse(usersJson) : [];
        } catch (error) {
            console.error('Error getting users:', error);
            return [];
        }
    },

    /**
     * Get user by ID
     * @param {string} userId - User ID
     * @returns {Object|null}
     */
    getUserById(userId) {
        const users = this.getUsers();
        return users.find(user => user.id === userId) || null;
    },

    /**
     * Generate unique ID for users and blogs
     * @returns {string}
     */
    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }
};

// Initialize auth module when script loads
auth.init();
