// ============ DATA ============
const postsData = [
    {
        id: 1,
        username: 'TechSavvy',
        avatar: 'https://via.placeholder.com/50?text=TS',
        time: '5 min ago',
        content: 'Just found an amazing new hacking tool! 🔐 Anyone else tried this?',
        image: 'https://via.placeholder.com/600x400?text=Hacking+Tool',
        likes: 210,
        comments: 45,
        shares: 0
    },
    {
        id: 2,
        username: 'CryptoNinja',
        avatar: 'https://via.placeholder.com/50?text=CN',
        time: '20 min ago',
        content: 'Cybersecurity tip of the day: Always use 2FA! 🔒',
        image: null,
        likes: 134,
        comments: 30,
        shares: 0
    },
    {
        id: 3,
        username: 'ShadowHunter',
        avatar: 'https://via.placeholder.com/50?text=SH',
        time: '22 min ago',
        content: 'Late night coding session... #programminglife',
        image: 'https://via.placeholder.com/600x400?text=Late+Night+Coding',
        likes: 189,
        comments: 22,
        shares: 0
    }
];

// ============ DOM ELEMENTS ============
const postsFeed = document.getElementById('postsFeed');
const submitPostBtn = document.getElementById('submitPostBtn');
const postContent = document.getElementById('postContent');
const addImageBtn = document.getElementById('addImageBtn');

// ============ INITIALIZATION ============
document.addEventListener('DOMContentLoaded', () => {
    renderPosts();
    setupEventListeners();
});

// ============ EVENT LISTENERS ============
function setupEventListeners() {
    submitPostBtn.addEventListener('click', createPost);
    postContent.addEventListener('keypress', (e) => {
        if (e.key === 'Enter' && e.ctrlKey) {
            createPost();
        }
    });
    addImageBtn.addEventListener('click', () => {
        alert('Image upload feature coming soon!');
    });
}

// ============ CREATE POST ============
function createPost() {
    const content = postContent.value.trim();
    
    if (!content) {
        alert('Please write something before posting!');
        return;
    }

    const newPost = {
        id: postsData.length + 1,
        username: 'GhostKernel',
        avatar: 'https://via.placeholder.com/50',
        time: 'now',
        content: content,
        image: null,
        likes: 0,
        comments: 0,
        shares: 0
    };

    postsData.unshift(newPost);
    postContent.value = '';
    renderPosts();
    
    // Animation effect
    showNotification('Post published successfully! ✅');
}

// ============ RENDER POSTS ============
function renderPosts() {
    postsFeed.innerHTML = '';

    postsData.forEach(post => {
        const postElement = createPostElement(post);
        postsFeed.appendChild(postElement);
    });
}

// ============ CREATE POST ELEMENT ============
function createPostElement(post) {
    const postDiv = document.createElement('div');
    postDiv.className = 'post';
    postDiv.innerHTML = `
        <div class="post-header">
            <div class="post-user-info">
                <img src="${post.avatar}" alt="${post.username}" class="post-avatar">
                <div class="post-user-details">
                    <div class="post-username">${post.username}</div>
                    <div class="post-time">${post.time}</div>
                </div>
            </div>
            <div class="post-options">
                <i class="fas fa-ellipsis-h"></i>
            </div>
        </div>

        <div class="post-content">
            ${post.content}
        </div>

        ${post.image ? `<img src="${post.image}" alt="Post image" class="post-image">` : ''}

        <div class="post-stats">
            <span class="stat-item">
                <i class="fas fa-heart"></i> ${post.likes} Likes
            </span>
            <span class="stat-item">
                <i class="fas fa-comment"></i> ${post.comments} Comments
            </span>
            <span class="stat-item">
                <i class="fas fa-share"></i> Share
            </span>
        </div>

        <div class="post-actions">
            <button class="action-btn like-btn" data-post-id="${post.id}">
                <i class="fas fa-heart"></i> Like
            </button>
            <button class="action-btn comment-btn">
                <i class="fas fa-comment"></i> Comment
            </button>
            <button class="action-btn share-btn">
                <i class="fas fa-share"></i> Share
            </button>
        </div>
    `;

    // Add event listeners
    const likeBtn = postDiv.querySelector('.like-btn');
    const commentBtn = postDiv.querySelector('.comment-btn');
    const shareBtn = postDiv.querySelector('.share-btn');

    likeBtn.addEventListener('click', () => toggleLike(likeBtn, post.id));
    commentBtn.addEventListener('click', () => showCommentForm(post.id));
    shareBtn.addEventListener('click', () => sharePost(post.id));

    return postDiv;
}

// ============ LIKE POST ============
function toggleLike(btn, postId) {
    btn.classList.toggle('liked');
    
    const post = postsData.find(p => p.id === postId);
    if (post) {
        if (btn.classList.contains('liked')) {
            post.likes++;
            showNotification('Post liked! ❤️');
        } else {
            post.likes--;
        }
        renderPosts();
    }
}

// ============ COMMENT POST ============
function showCommentForm(postId) {
    const comment = prompt('Write your comment:');
    
    if (comment && comment.trim()) {
        const post = postsData.find(p => p.id === postId);
        if (post) {
            post.comments++;
            renderPosts();
            showNotification('Comment added! 💬');
        }
    }
}

// ============ SHARE POST ============
function sharePost(postId) {
    const post = postsData.find(p => p.id === postId);
    if (post) {
        post.shares++;
        showNotification('Post shared! 📤');
    }
}

// ============ NOTIFICATIONS ============
function showNotification(message) {
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: var(--accent-green);
        color: var(--primary-dark);
        padding: 15px 25px;
        border-radius: 8px;
        font-weight: 600;
        box-shadow: 0 8px 32px rgba(0, 255, 136, 0.4);
        z-index: 2000;
        animation: slideUp 0.3s ease;
    `;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'fadeOut 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// ============ SMOOTH SCROLL ============
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({ behavior: 'smooth' });
        }
    });
});

// ============ CONSOLE LOG ============
console.log('🔐 CyberForum Loaded Successfully!');
console.log('👾 Welcome to the biggest hacking community!');
