/**
 * Blog Module
 * Handles blog CRUD operations (Create, Read, Update, Delete)
 * Uses LocalStorage for persistent data storage
 */

const blog = {
    // LocalStorage key for blogs
    STORAGE_KEY: 'blog_posts',

    /**
     * Initialize blog module
     */
    init() {
        // Create blogs array in LocalStorage if it doesn't exist
        if (!localStorage.getItem(this.STORAGE_KEY)) {
            localStorage.setItem(this.STORAGE_KEY, JSON.stringify([]));
        }
    },

    /**
     * Create a new blog post
     * @param {string} title - Blog title
     * @param {string} content - Blog content
     * @param {string} imageUrl - Optional image URL
     * @returns {Object} - { success: boolean, message: string, blog?: Object }
     */
    createBlog(title, content, imageUrl = '') {
        try {
            // Check if user is logged in
            if (!auth.isLoggedIn()) {
                return {
                    success: false,
                    message: 'You must be logged in to create a blog.'
                };
            }

            const currentUser = auth.getCurrentUser();
            if (!currentUser) {
                return {
                    success: false,
                    message: 'User session expired. Please login again.'
                };
            }

            // Get existing blogs
            const blogs = this.getAllBlogs();

            // Create new blog object
            const newBlog = {
                id: auth.generateId(),
                title: title.trim(),
                content: content.trim(),
                imageUrl: imageUrl.trim() || null,
                authorId: currentUser.id,
                authorName: currentUser.name,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            };

            // Add blog to array (newest first)
            blogs.unshift(newBlog);

            // Save to LocalStorage
            localStorage.setItem(this.STORAGE_KEY, JSON.stringify(blogs));

            // Trigger custom event for real-time updates
            window.dispatchEvent(new CustomEvent('blogCreated', { detail: newBlog }));

            return {
                success: true,
                message: 'Blog created successfully!',
                blog: newBlog
            };
        } catch (error) {
            console.error('Create blog error:', error);
            return {
                success: false,
                message: 'An error occurred while creating the blog. Please try again.'
            };
        }
    },

    /**
     * Get all blog posts
     * @returns {Array}
     */
    getAllBlogs() {
        try {
            const blogsJson = localStorage.getItem(this.STORAGE_KEY);
            return blogsJson ? JSON.parse(blogsJson) : [];
        } catch (error) {
            console.error('Error getting blogs:', error);
            return [];
        }
    },

    /**
     * Get blog by ID
     * @param {string} blogId - Blog ID
     * @returns {Object|null}
     */
    getBlogById(blogId) {
        const blogs = this.getAllBlogs();
        return blogs.find(blog => blog.id === blogId) || null;
    },

    /**
     * Get blogs by user ID
     * @param {string} userId - User ID
     * @returns {Array}
     */
    getBlogsByUserId(userId) {
        const blogs = this.getAllBlogs();
        return blogs.filter(blog => blog.authorId === userId);
    },

    /**
     * Get current user's blogs
     * @returns {Array}
     */
    getUserBlogs() {
        const userId = auth.getCurrentUserId();
        if (!userId) return [];
        return this.getBlogsByUserId(userId);
    },

    /**
     * Update a blog post
     * @param {string} blogId - Blog ID
     * @param {string} title - New title
     * @param {string} content - New content
     * @param {string} imageUrl - New image URL
     * @returns {Object} - { success: boolean, message: string }
     */
    updateBlog(blogId, title, content, imageUrl = '') {
        try {
            // Check if user is logged in
            if (!auth.isLoggedIn()) {
                return {
                    success: false,
                    message: 'You must be logged in to update a blog.'
                };
            }

            const blogs = this.getAllBlogs();
            const blogIndex = blogs.findIndex(blog => blog.id === blogId);

            if (blogIndex === -1) {
                return {
                    success: false,
                    message: 'Blog not found.'
                };
            }

            const blog = blogs[blogIndex];
            const currentUserId = auth.getCurrentUserId();

            // Check authorization
            if (blog.authorId !== currentUserId) {
                return {
                    success: false,
                    message: 'You are not authorized to edit this blog.'
                };
            }

            // Update blog
            blogs[blogIndex] = {
                ...blog,
                title: title.trim(),
                content: content.trim(),
                imageUrl: imageUrl.trim() || null,
                updatedAt: new Date().toISOString()
            };

            // Save to LocalStorage
            localStorage.setItem(this.STORAGE_KEY, JSON.stringify(blogs));

            // Trigger custom event for real-time updates
            window.dispatchEvent(new CustomEvent('blogUpdated', { detail: blogs[blogIndex] }));

            return {
                success: true,
                message: 'Blog updated successfully!'
            };
        } catch (error) {
            console.error('Update blog error:', error);
            return {
                success: false,
                message: 'An error occurred while updating the blog. Please try again.'
            };
        }
    },

    /**
     * Delete a blog post
     * @param {string} blogId - Blog ID
     * @returns {Object} - { success: boolean, message: string }
     */
    deleteBlog(blogId) {
        try {
            // Check if user is logged in
            if (!auth.isLoggedIn()) {
                return {
                    success: false,
                    message: 'You must be logged in to delete a blog.'
                };
            }

            const blogs = this.getAllBlogs();
            const blog = blogs.find(b => b.id === blogId);

            if (!blog) {
                return {
                    success: false,
                    message: 'Blog not found.'
                };
            }

            const currentUserId = auth.getCurrentUserId();

            // Check authorization
            if (blog.authorId !== currentUserId) {
                return {
                    success: false,
                    message: 'You are not authorized to delete this blog.'
                };
            }

            // Remove blog from array
            const filteredBlogs = blogs.filter(b => b.id !== blogId);

            // Save to LocalStorage
            localStorage.setItem(this.STORAGE_KEY, JSON.stringify(filteredBlogs));

            // Trigger custom event for real-time updates
            window.dispatchEvent(new CustomEvent('blogDeleted', { detail: blogId }));

            return {
                success: true,
                message: 'Blog deleted successfully!'
            };
        } catch (error) {
            console.error('Delete blog error:', error);
            return {
                success: false,
                message: 'An error occurred while deleting the blog. Please try again.'
            };
        }
    },

    /**
     * Check if user can edit/delete a blog
     * @param {Object} blog - Blog object
     * @returns {boolean}
     */
    canModify(blog) {
        if (!auth.isLoggedIn()) return false;
        const currentUserId = auth.getCurrentUserId();
        return blog && blog.authorId === currentUserId;
    },

    /**
     * Format date for display
     * @param {string} dateString - ISO date string
     * @returns {string}
     */
    formatDate(dateString) {
        const date = new Date(dateString);
        const now = new Date();
        const diffTime = Math.abs(now - date);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays === 1) {
            return 'Today';
        } else if (diffDays === 2) {
            return 'Yesterday';
        } else if (diffDays <= 7) {
            return `${diffDays - 1} days ago`;
        } else {
            return date.toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
            });
        }
    },

    /**
     * Get preview text from content
     * @param {string} content - Full blog content
     * @param {number} maxLength - Maximum preview length (default: 150)
     * @returns {string}
     */
    getPreview(content, maxLength = 150) {
        if (content.length <= maxLength) {
            return content;
        }
        return content.substring(0, maxLength).trim() + '...';
    },

    /**
     * Display all blogs in the news feed
     * @param {string} searchQuery - Optional search query to filter blogs
     */
    displayAllBlogs(searchQuery = '') {
        const container = document.getElementById('blogsContainer');
        const noResults = document.getElementById('noResults');
        
        if (!container) return;

        let blogs = this.getAllBlogs();

        // Filter by search query if provided
        if (searchQuery && searchQuery.trim()) {
            const query = searchQuery.toLowerCase().trim();
            blogs = blogs.filter(blog => 
                blog.title.toLowerCase().includes(query)
            );
        }

        // Sort by creation date (newest first)
        blogs.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

        if (blogs.length === 0) {
            container.innerHTML = '';
            if (noResults) {
                noResults.style.display = 'block';
            }
            return;
        }

        if (noResults) {
            noResults.style.display = 'none';
        }

        container.innerHTML = blogs.map(blog => this.createBlogCard(blog)).join('');

        // Add event listeners for "Read More" buttons
        container.querySelectorAll('.read-more-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const blogId = e.target.dataset.blogId;
                this.showBlogModal(blogId);
            });
        });
    },

    /**
     * Display user's blogs in dashboard
     */
    displayUserBlogs() {
        const container = document.getElementById('myBlogsContainer');
        const noBlogsMessage = document.getElementById('noBlogsMessage');
        
        if (!container) return;

        const blogs = this.getUserBlogs();

        // Sort by creation date (newest first)
        blogs.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

        if (blogs.length === 0) {
            container.innerHTML = '';
            if (noBlogsMessage) {
                noBlogsMessage.style.display = 'block';
            }
            return;
        }

        if (noBlogsMessage) {
            noBlogsMessage.style.display = 'none';
        }

        container.innerHTML = blogs.map(blog => this.createBlogCard(blog, true)).join('');

        // Add event listeners
        container.querySelectorAll('.edit-blog-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const blogId = e.target.dataset.blogId;
                this.editBlog(blogId);
            });
        });

        container.querySelectorAll('.delete-blog-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const blogId = e.target.dataset.blogId;
                this.confirmDelete(blogId);
            });
        });

        container.querySelectorAll('.read-more-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const blogId = e.target.dataset.blogId;
                this.showBlogModal(blogId);
            });
        });
    },

    /**
     * Create HTML card for a blog
     * @param {Object} blog - Blog object
     * @param {boolean} showActions - Whether to show edit/delete buttons
     * @returns {string}
     */
    createBlogCard(blog, showActions = false) {
        const preview = this.getPreview(blog.content, 150);
        const date = this.formatDate(blog.createdAt);
        const canModify = this.canModify(blog);

        return `
            <div class="blog-card" data-blog-id="${blog.id}">
                ${blog.imageUrl ? `<img src="${blog.imageUrl}" alt="${blog.title}" class="blog-image" onerror="this.style.display='none'">` : ''}
                <div class="blog-content">
                    <h3 class="blog-title">${this.escapeHtml(blog.title)}</h3>
                    <div class="blog-meta">
                        <span>✍️ ${this.escapeHtml(blog.authorName)}</span>
                        <span>📅 ${date}</span>
                    </div>
                    <p class="blog-preview">${this.escapeHtml(preview)}</p>
                    <div class="blog-actions">
                        <button class="btn btn-primary btn-small read-more-btn" data-blog-id="${blog.id}">Read More</button>
                        ${showActions && canModify ? `
                            <button class="btn btn-success btn-small edit-blog-btn" data-blog-id="${blog.id}">Edit</button>
                            <button class="btn btn-danger btn-small delete-blog-btn" data-blog-id="${blog.id}">Delete</button>
                        ` : ''}
                        ${!showActions && canModify ? `
                            <button class="btn btn-success btn-small edit-blog-btn" data-blog-id="${blog.id}">Edit</button>
                            <button class="btn btn-danger btn-small delete-blog-btn" data-blog-id="${blog.id}">Delete</button>
                        ` : ''}
                    </div>
                </div>
            </div>
        `;
    },

    /**
     * Show blog in modal for full content
     * @param {string} blogId - Blog ID
     */
    showBlogModal(blogId) {
        const blog = this.getBlogById(blogId);
        if (!blog) {
            alert('Blog not found!');
            return;
        }

        const date = this.formatDate(blog.createdAt);
        const canModify = this.canModify(blog);

        const modal = document.createElement('div');
        modal.className = 'modal active';
        modal.innerHTML = `
            <div class="modal-content" style="max-width: 700px;">
                <h3>${this.escapeHtml(blog.title)}</h3>
                <div class="blog-meta" style="margin-bottom: 1rem;">
                    <span>✍️ ${this.escapeHtml(blog.authorName)}</span>
                    <span>📅 ${date}</span>
                </div>
                ${blog.imageUrl ? `<img src="${blog.imageUrl}" alt="${blog.title}" style="width: 100%; max-height: 400px; object-fit: cover; border-radius: 5px; margin-bottom: 1rem;" onerror="this.style.display='none'">` : ''}
                <div style="line-height: 1.8; color: #2c3e50; white-space: pre-wrap; margin-bottom: 1rem;">${this.escapeHtml(blog.content)}</div>
                <div class="modal-actions">
                    ${canModify ? `
                        <button class="btn btn-success edit-blog-btn-modal" data-blog-id="${blogId}">Edit</button>
                        <button class="btn btn-danger delete-blog-btn-modal" data-blog-id="${blogId}">Delete</button>
                    ` : ''}
                    <button class="btn btn-secondary close-modal-btn">Close</button>
                </div>
            </div>
        `;

        document.body.appendChild(modal);

        // Event listeners
        modal.querySelector('.close-modal-btn').addEventListener('click', () => {
            modal.remove();
        });

        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.remove();
            }
        });

        if (canModify) {
            modal.querySelector('.edit-blog-btn-modal').addEventListener('click', () => {
                modal.remove();
                this.editBlog(blogId);
            });

            modal.querySelector('.delete-blog-btn-modal').addEventListener('click', () => {
                modal.remove();
                this.confirmDelete(blogId);
            });
        }
    },

    /**
     * Edit a blog
     * @param {string} blogId - Blog ID
     */
    editBlog(blogId) {
        const blog = this.getBlogById(blogId);
        if (!blog) {
            alert('Blog not found!');
            return;
        }

        // Redirect to edit page with blog data in URL or use a form
        // For simplicity, we'll create an edit form in a modal
        const modal = document.createElement('div');
        modal.className = 'modal active';
        modal.innerHTML = `
            <div class="modal-content" style="max-width: 600px;">
                <h3>Edit Blog</h3>
                <form id="editBlogForm" class="blog-form">
                    <div class="form-group">
                        <label for="editBlogTitle">Title <span class="required">*</span></label>
                        <input type="text" id="editBlogTitle" class="form-control" value="${this.escapeHtml(blog.title)}" required>
                        <span class="error-message" id="editBlogTitleError"></span>
                    </div>
                    <div class="form-group">
                        <label for="editBlogContent">Content <span class="required">*</span></label>
                        <textarea id="editBlogContent" class="form-control" rows="10" required>${this.escapeHtml(blog.content)}</textarea>
                        <div class="char-counter">
                            <span id="editContentCharCount">${blog.content.length}</span> / 10000 characters
                        </div>
                        <span class="error-message" id="editBlogContentError"></span>
                    </div>
                    <div class="form-group">
                        <label for="editBlogImageUrl">Image URL (Optional)</label>
                        <input type="url" id="editBlogImageUrl" class="form-control" value="${blog.imageUrl || ''}">
                        <span class="error-message" id="editBlogImageUrlError"></span>
                    </div>
                    <div class="modal-actions">
                        <button type="button" class="btn btn-secondary cancel-edit-btn">Cancel</button>
                        <button type="submit" class="btn btn-primary">Update Blog</button>
                    </div>
                </form>
            </div>
        `;

        document.body.appendChild(modal);

        // Character counter
        const contentTextarea = modal.querySelector('#editBlogContent');
        const charCount = modal.querySelector('#editContentCharCount');
        contentTextarea.addEventListener('input', () => {
            const count = contentTextarea.value.length;
            charCount.textContent = count;
            charCount.style.color = count > 10000 ? '#e74c3c' : '#7f8c8d';
        });

        // Form submission
        modal.querySelector('#editBlogForm').addEventListener('submit', (e) => {
            e.preventDefault();
            const title = modal.querySelector('#editBlogTitle').value.trim();
            const content = modal.querySelector('#editBlogContent').value.trim();
            const imageUrl = modal.querySelector('#editBlogImageUrl').value.trim();

            // Validation
            const titleError = modal.querySelector('#editBlogTitleError');
            const contentError = modal.querySelector('#editBlogContentError');
            const imageUrlError = modal.querySelector('#editBlogImageUrlError');

            titleError.textContent = '';
            contentError.textContent = '';
            imageUrlError.textContent = '';

            let isValid = true;

            if (!title || title.length < 3) {
                titleError.textContent = 'Title must be at least 3 characters';
                isValid = false;
            }

            if (!content || content.length < 50) {
                contentError.textContent = 'Content must be at least 50 characters';
                isValid = false;
            }

            if (imageUrl && !this.isValidUrl(imageUrl)) {
                imageUrlError.textContent = 'Please enter a valid URL';
                isValid = false;
            }

            if (isValid) {
                const result = this.updateBlog(blogId, title, content, imageUrl);
                if (result.success) {
                    alert('Blog updated successfully!');
                    modal.remove();
                    // Refresh the current page
                    if (window.location.pathname.includes('dashboard')) {
                        this.displayUserBlogs();
                    } else {
                        this.displayAllBlogs();
                    }
                } else {
                    alert('Error: ' + result.message);
                }
            }
        });

        modal.querySelector('.cancel-edit-btn').addEventListener('click', () => {
            modal.remove();
        });

        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.remove();
            }
        });
    },

    /**
     * Confirm delete action
     * @param {string} blogId - Blog ID
     */
    confirmDelete(blogId) {
        const blog = this.getBlogById(blogId);
        if (!blog) {
            alert('Blog not found!');
            return;
        }

        const modal = document.createElement('div');
        modal.className = 'modal active';
        modal.innerHTML = `
            <div class="modal-content">
                <h3>Delete Blog</h3>
                <p>Are you sure you want to delete "<strong>${this.escapeHtml(blog.title)}</strong>"? This action cannot be undone.</p>
                <div class="modal-actions">
                    <button class="btn btn-secondary cancel-delete-btn">Cancel</button>
                    <button class="btn btn-danger confirm-delete-btn" data-blog-id="${blogId}">Delete</button>
                </div>
            </div>
        `;

        document.body.appendChild(modal);

        modal.querySelector('.cancel-delete-btn').addEventListener('click', () => {
            modal.remove();
        });

        modal.querySelector('.confirm-delete-btn').addEventListener('click', () => {
            const result = this.deleteBlog(blogId);
            modal.remove();
            if (result.success) {
                alert('Blog deleted successfully!');
                // Refresh the current page
                if (window.location.pathname.includes('dashboard')) {
                    this.displayUserBlogs();
                } else {
                    this.displayAllBlogs();
                }
            } else {
                alert('Error: ' + result.message);
            }
        });

        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.remove();
            }
        });
    },

    /**
     * Escape HTML to prevent XSS
     * @param {string} text - Text to escape
     * @returns {string}
     */
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    },

    /**
     * Validate URL
     * @param {string} url - URL to validate
     * @returns {boolean}
     */
    isValidUrl(url) {
        try {
            new URL(url);
            return true;
        } catch {
            return false;
        }
    }
};

// Initialize blog module when script loads
blog.init();

// Listen for blog events to update UI in real-time
window.addEventListener('blogCreated', () => {
    if (document.getElementById('blogsContainer')) {
        blog.displayAllBlogs();
    }
});

window.addEventListener('blogUpdated', () => {
    if (document.getElementById('blogsContainer')) {
        const searchInput = document.getElementById('searchInput');
        blog.displayAllBlogs(searchInput ? searchInput.value : '');
    }
    if (document.getElementById('myBlogsContainer')) {
        blog.displayUserBlogs();
    }
});

window.addEventListener('blogDeleted', () => {
    if (document.getElementById('blogsContainer')) {
        const searchInput = document.getElementById('searchInput');
        blog.displayAllBlogs(searchInput ? searchInput.value : '');
    }
    if (document.getElementById('myBlogsContainer')) {
        blog.displayUserBlogs();
    }
});
