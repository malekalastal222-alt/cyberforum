// ============ STATE MANAGEMENT ============
const APP_STATE = {
    currentUser: null,
    users: JSON.parse(localStorage.getItem('users')) || [],
    posts: JSON.parse(localStorage.getItem('posts')) || [],
    messages: [],
    isLoggedIn: false
};

// ============ DOM ELEMENTS ============
// Auth Page
const authPage = document.getElementById('authPage');
const mainPage = document.getElementById('mainPage');
const loginForm = document.getElementById('loginForm');
const registerForm = document.getElementById('registerForm');
const loginUsername = document.getElementById('loginUsername');
const loginPassword = document.getElementById('loginPassword');
const regUsername = document.getElementById('regUsername');
const regEmail = document.getElementById('regEmail');
const regPassword = document.getElementById('regPassword');
const regConfirmPassword = document.getElementById('regConfirmPassword');
const tabBtns = document.querySelectorAll('.tab-btn');
const passwordStrength = document.getElementById('passwordStrength');
const usernameHint = document.getElementById('usernameHint');

// Main Page
const postsFeed = document.getElementById('postsFeed');
const submitPostBtn = document.getElementById('submitPostBtn');
const postContent = document.getElementById('postContent');
const profileUsername = document.getElementById('profileUsername');
const userPosts = document.getElementById('userPosts');
const userFollowers = document.getElementById('userFollowers');
const userFollowing = document.getElementById('userFollowing');
const logoutBtn = document.getElementById('logoutBtn');
const mobileLogout = document.getElementById('mobileLogout');
const openChatBtn = document.getElementById('openChatBtn');

// Chat
const chatModal = document.getElementById('chatModal');
const chatMessages = document.getElementById('chatMessages');
const chatInput = document.getElementById('chatInput');
const sendChatBtn = document.getElementById('sendChatBtn');
const closeChatBtn = document.getElementById('closeChatBtn');

// Mobile Menu
const mobileMenuBtn = document.getElementById('mobileMenuBtn');
const navMenu = document.getElementById('navMenu');

// ============ INITIALIZATION ============
document.addEventListener('DOMContentLoaded', () => {
    setupEventListeners();
    
    // Check if user is logged in
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
        APP_STATE.currentUser = JSON.parse(savedUser);
        APP_STATE.isLoggedIn = true;
        showMainPage();
    } else {
        showAuthPage();
    }
});

// ============ EVENT LISTENERS ============
function setupEventListeners() {
    // Auth Events
    tabBtns.forEach(btn => {
        btn.addEventListener('click', switchTab);
    });

    loginForm.addEventListener('submit', handleLogin);
    registerForm.addEventListener('submit', handleRegister);

    // Password Strength Checker
    regPassword.addEventListener('input', checkPasswordStrength);
    regUsername.addEventListener('input', checkUsernameAvailability);

    // Main Page Events
    submitPostBtn.addEventListener('click', createPost);
    postContent.addEventListener('keypress', (e) => {
        if (e.key === 'Enter' && e.ctrlKey) createPost();
    });

    logoutBtn.addEventListener('click', logout);
    mobileLogout.addEventListener('click', logout);
    openChatBtn.addEventListener('click', openChat);
    closeChatBtn.addEventListener('click', closeChat);
    sendChatBtn.addEventListener('click', sendMessage);

    chatInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') sendMessage();
    });

    // Mobile Menu
    mobileMenuBtn.addEventListener('click', toggleMobileMenu);

    // Close chat on outside click
    chatModal.addEventListener('click', (e) => {
        if (e.target === chatModal) closeChat();
    });
}

// ============ TAB SWITCHING ============
function switchTab(e) {
    const tabName = e.target.closest('.tab-btn').getAttribute('data-tab');

    // Update buttons
    tabBtns.forEach(btn => btn.classList.remove('active'));
    e.target.closest('.tab-btn').classList.add('active');

    // Update forms
    document.querySelectorAll('.auth-form').forEach(form => form.classList.remove('active'));
    if (tabName === 'login') {
        loginForm.classList.add('active');
    } else {
        registerForm.classList.add('active');
    }
}

// ============ PASSWORD STRENGTH ============
function checkPasswordStrength() {
    const password = regPassword.value;
    let strength = 'weak';

    if (password.length >= 8) {
        if (/[a-z]/.test(password) && /[A-Z]/.test(password) && /[0-9]/.test(password)) {
            strength = 'strong';
        } else if (/[A-Z]/.test(password) || /[0-9]/.test(password)) {
            strength = 'medium';
        }
    }

    passwordStrength.classList.remove('weak', 'medium', 'strong');
    passwordStrength.classList.add(strength);
}

// ============ USERNAME AVAILABILITY ============
function checkUsernameAvailability() {
    const username = regUsername.value.trim();
    
    if (!username) {
        usernameHint.textContent = '';
        return;
    }

    const exists = APP_STATE.users.some(user => user.username.toLowerCase() === username.toLowerCase());
    
    if (exists) {
        usernameHint.textContent = '❌ اسم المستخدم غير متاح';
        usernameHint.classList.remove('success');
        usernameHint.classList.add('error');
    } else {
        usernameHint.textContent = '✅ اسم المستخدم متاح';
        usernameHint.classList.remove('error');
        usernameHint.classList.add('success');
    }
}

// ============ AUTHENTICATION ============
function handleLogin(e) {
    e.preventDefault();

    const username = loginUsername.value.trim();
    const password = loginPassword.value;

    const user = APP_STATE.users.find(u => 
        u.username.toLowerCase() === username.toLowerCase() && u.password === password
    );

    if (user) {
        APP_STATE.currentUser = user;
        APP_STATE.isLoggedIn = true;
        localStorage.setItem('currentUser', JSON.stringify(user));
        
        showNotification(`أهلا بك ${user.username}! 🎉`, 'success');
        setTimeout(() => showMainPage(), 1000);
    } else {
        showNotification('اسم المستخدم أو كلمة المرور غير صحيحة ❌', 'error');
    }

    loginForm.reset();
}

function handleRegister(e) {
    e.preventDefault();

    const username = regUsername.value.trim();
    const email = regEmail.value.trim();
    const password = regPassword.value;
    const confirmPassword = regConfirmPassword.value;

    // Validation
    if (!username || !email || !password || !confirmPassword) {
        showNotification('يرجى ملء جميع الحقول ❌', 'error');
        return;
    }

    if (password !== confirmPassword) {
        showNotification('كلمات المرور غير متطابقة ❌', 'error');
        return;
    }

    if (password.length < 6) {
        showNotification('كلمة المرور يجب أن تكون 6 أحرف على الأقل ❌', 'error');
        return;
    }

    // Check if username exists
    if (APP_STATE.users.some(u => u.username.toLowerCase() === username.toLowerCase())) {
        showNotification('اسم المستخدم غير متاح ❌', 'error');
        return;
    }

    // Create new user
    const newUser = {
        id: Date.now(),
        username: username,
        email: email,
        password: password,
        avatar: `https://via.placeholder.com/150?text=${username}`,
        posts: 0,
        followers: 0,
        following: 0
    };

    APP_STATE.users.push(newUser);
    localStorage.setItem('users', JSON.stringify(APP_STATE.users));

    showNotification('تم إنشاء الحساب بنجاح! ✅ الآن يرجى تسجيل الدخول', 'success');

    // Switch to login
    setTimeout(() => {
        regUsername.value = username;
        regPassword.value = '';
        regEmail.value = '';
        regConfirmPassword.value = '';
        tabBtns[0].click();
    }, 1000);
}

function logout() {
    localStorage.removeItem('currentUser');
    APP_STATE.currentUser = null;
    APP_STATE.isLoggedIn = false;
    
    showNotification('تم تسجيل الخروج بنجاح 👋', 'success');
    setTimeout(() => showAuthPage(), 800);
}

// ============ PAGE TRANSITIONS ============
function showAuthPage() {
    mainPage.classList.remove('active');
    authPage.classList.add('active');
    navMenu.classList.remove('active');
}

function showMainPage() {
    authPage.classList.remove('active');
    mainPage.classList.add('active');
    updateUserProfile();
    renderPosts();
}

// ============ USER PROFILE ============
function updateUserProfile() {
    const user = APP_STATE.currentUser;
    profileUsername.textContent = user.username;
    userPosts.textContent = user.posts || 0;
    userFollowers.textContent = user.followers || 0;
    userFollowing.textContent = user.following || 0;
}

// ============ POSTS ============
function createPost() {
    const content = postContent.value.trim();

    if (!content) {
        showNotification('يرجى كتابة شيء قبل النشر ❌', 'error');
        return;
    }

    const newPost = {
        id: Date.now(),
        userId: APP_STATE.currentUser.id,
        username: APP_STATE.currentUser.username,
        avatar: APP_STATE.currentUser.avatar,
        content: content,
        image: null,
        likes: 0,
        comments: 0,
        shares: 0,
        timestamp: new Date().toLocaleString('ar-EG'),
        liked: false
    };

    APP_STATE.posts.unshift(newPost);
    APP_STATE.currentUser.posts++;
    localStorage.setItem('posts', JSON.stringify(APP_STATE.posts));
    localStorage.setItem('currentUser', JSON.stringify(APP_STATE.currentUser));

    postContent.value = '';
    updateUserProfile();
    renderPosts();

    showNotification('تم نشر منشورك بنجاح! ✅', 'success');
}

// ============ RENDER POSTS ============
function renderPosts() {
    postsFeed.innerHTML = '';

    APP_STATE.posts.forEach(post => {
        const postElement = createPostElement(post);
        postsFeed.appendChild(postElement);
    });

    if (APP_STATE.posts.length === 0) {
        postsFeed.innerHTML = `
            <div style="text-align: center; padding: 40px 20px; color: var(--text-muted);">
                <i class="fas fa-inbox" style="font-size: 3em; margin-bottom: 20px;"></i>
                <p>لا توجد منشورات حالياً 📭</p>
            </div>
        `;
    }
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
                    <div class="post-time">${post.timestamp}</div>
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
                <i class="fas fa-heart"></i> ${post.likes} إعجاب
            </span>
            <span class="stat-item">
                <i class="fas fa-comment"></i> ${post.comments} تعليق
            </span>
            <span class="stat-item">
                <i class="fas fa-share"></i> مشاركة
            </span>
        </div>

        <div class="post-actions">
            <button class="action-btn like-btn" data-post-id="${post.id}">
                <i class="fas fa-heart"></i> إعجاب
            </button>
            <button class="action-btn comment-btn">
                <i class="fas fa-comment"></i> تعليق
            </button>
            <button class="action-btn share-btn">
                <i class="fas fa-share"></i> مشاركة
            </button>
        </div>
    `;

    const likeBtn = postDiv.querySelector('.like-btn');
    const commentBtn = postDiv.querySelector('.comment-btn');
    const shareBtn = postDiv.querySelector('.share-btn');

    likeBtn.addEventListener('click', () => toggleLike(likeBtn, post.id));
    commentBtn.addEventListener('click', () => showCommentForm(post.id));
    shareBtn.addEventListener('click', () => sharePost(post.id));

    if (post.liked) {
        likeBtn.classList.add('liked');
    }

    return postDiv;
}

// ============ POST INTERACTIONS ============
function toggleLike(btn, postId) {
    const post = APP_STATE.posts.find(p => p.id === postId);
    
    if (post) {
        if (btn.classList.contains('liked')) {
            btn.classList.remove('liked');
            post.likes--;
            post.liked = false;
        } else {
            btn.classList.add('liked');
            post.likes++;
            post.liked = true;
            showNotification('أعجبت بهذا المنشور ❤️', 'success');
        }
        
        localStorage.setItem('posts', JSON.stringify(APP_STATE.posts));
        renderPosts();
    }
}

function showCommentForm(postId) {
    const comment = prompt('اكتب تعليقك:');
    
    if (comment && comment.trim()) {
        const post = APP_STATE.posts.find(p => p.id === postId);
        if (post) {
            post.comments++;
            localStorage.setItem('posts', JSON.stringify(APP_STATE.posts));
            renderPosts();
            showNotification('تم إضافة تعليقك! 💬', 'success');
        }
    }
}

function sharePost(postId) {
    const post = APP_STATE.posts.find(p => p.id === postId);
    if (post) {
        post.shares++;
        localStorage.setItem('posts', JSON.stringify(APP_STATE.posts));
        showNotification('تم مشاركة المنشور! 📤', 'success');
    }
}

// ============ CHAT ============
function openChat() {
    chatModal.classList.add('active');
    chatInput.focus();
    renderChatMessages();
}

function closeChat() {
    chatModal.classList.remove('active');
}

function sendMessage() {
    const text = chatInput.value.trim();

    if (!text) {
        showNotification('اكتب رسالة أولاً ❌', 'error');
        return;
    }

    const message = {
        id: Date.now(),
        sender: APP_STATE.currentUser.username,
        avatar: APP_STATE.currentUser.avatar,
        text: text,
        timestamp: new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }),
        isOwn: true
    };

    APP_STATE.messages.push(message);
    chatInput.value = '';
    renderChatMessages();

    // Simulate reply
    setTimeout(() => {
        const reply = {
            id: Date.now(),
            sender: 'CyberAdmin',
            avatar: 'https://via.placeholder.com/50?text=Admin',
            text: 'شكراً على رسالتك! 🤖',
            timestamp: new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }),
            isOwn: false
        };
        APP_STATE.messages.push(reply);
        renderChatMessages();
    }, 1000);
}

function renderChatMessages() {
    chatMessages.innerHTML = '';

    APP_STATE.messages.forEach(msg => {
        const msgDiv = document.createElement('div');
        msgDiv.className = `chat-message ${msg.isOwn ? 'own' : ''}`;
        msgDiv.innerHTML = `
            <img src="${msg.avatar}" alt="${msg.sender}" class="message-avatar">
            <div>
                <div class="message-content">
                    ${msg.text}
                </div>
                <div class="message-time">${msg.timestamp}</div>
            </div>
        `;
        chatMessages.appendChild(msgDiv);
    });

    // Scroll to bottom
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

// ============ MOBILE MENU ============
function toggleMobileMenu() {
    navMenu.classList.toggle('active');
}

// Close menu on link click
document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', () => {
        navMenu.classList.remove('active');
    });
});

// ============ NOTIFICATIONS ============
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 15px 25px;
        border-radius: 8px;
        font-weight: 600;
        z-index: 3000;
        box-shadow: 0 8px 32px rgba(0, 0, 0, 0.5);
        animation: slideDown 0.3s ease;
        backdrop-filter: blur(10px);
        border: 2px solid;
    `;

    if (type === 'success') {
        notification.style.background = 'rgba(0, 255, 136, 0.2)';
        notification.style.color = '#00ff88';
        notification.style.borderColor = '#00ff88';
    } else if (type === 'error') {
        notification.style.background = 'rgba(255, 107, 107, 0.2)';
        notification.style.color = '#ff6b6b';
        notification.style.borderColor = '#ff6b6b';
    }

    notification.textContent = message;
    document.body.appendChild(notification);

    setTimeout(() => {
        notification.style.animation = 'fadeIn 0.3s ease reverse';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

console.log('🔐 CyberForum - نسخة محدثة مع نظام تسجيل كامل!');
