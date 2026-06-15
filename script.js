// ==========================================
// DỮ LIỆU ẢNH MẪU (link trực tiếp ảnh)
// ==========================================
const imageData = [
    {
        id: 1,
        imageUrl: 'https://i.postimg.cc/k4QWmdW5/IMG-5378.png',
        link: 'https://www.mediafire.com/file/z2pgedvpzbpw2t5/Modun_livechu.zip/file',
        title: 'HỖ TRỢ KÉO TÂMFILE NHẸ TÂM + FPS + NHẠY'
    },
    {
        id: 2,
        imageUrl: 'https://i.postimg.cc/QdDhQ8hn/IMG-3684.png',
        link: 'https://www.mediafire.com/file/mmlvi4e07fxtkv7/MODULESADR.sh/file',
        title: 'SUPPORT ADR MODUN'
    },
    
];

// ==========================================
// QUẢN LÝ TRẠNG THÁI
// ==========================================
let currentUser = null;
let history = JSON.parse(localStorage.getItem('crackHistory')) || [];
let users = JSON.parse(localStorage.getItem('crackUsers')) || [];

// ==========================================
// HIỂN THỊ THÔNG BÁO
// ==========================================
function showNotification(message, type = 'info') {
    const container = document.getElementById('notificationContainer');
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
        <span class="notification-message">${message}</span>
        <button class="close-btn" onclick="this.parentElement.remove()">✕</button>
    `;
    container.appendChild(notification);

    setTimeout(() => {
        if (notification.parentElement) {
            notification.remove();
        }
    }, 4000);
}

// ==========================================
// RENDER ẢNH
// ==========================================
function renderImages() {
    const grid = document.getElementById('imageGrid');
    if (!grid) return;
    grid.innerHTML = imageData.map(img => `
        <div class="image-card" data-link="${img.link}" data-id="${img.id}">
            <img src="${img.imageUrl}" alt="${img.title}" loading="lazy" 
                 onerror="this.src='https://via.placeholder.com/400x300/1a1a2e/7b2ff7?text=Failed+to+load'">
            <div class="image-card-body">
                <p>${escapeHtml(img.title)}</p>
                <button class="btn-visit">🔗 Mở liên kết</button>
            </div>
        </div>
    `).join('');

    // Gắn sự kiện click cho từng card (delegation an toàn)
    document.querySelectorAll('.image-card').forEach(card => {
        const link = card.getAttribute('data-link');
        const id = card.getAttribute('data-id');
        card.addEventListener('click', (e) => {
            // Không bị ảnh hưởng nếu click vào button (vẫn mở)
            openLink(link, id);
        });
    });
}

// Helper tránh XSS
function escapeHtml(str) {
    return str.replace(/[&<>]/g, function(m) {
        if (m === '&') return '&amp;';
        if (m === '<') return '&lt;';
        if (m === '>') return '&gt;';
        return m;
    });
}

// ==========================================
// MỞ LIÊN KẾT & LƯU LỊCH SỬ
// ==========================================
function openLink(link, imageId) {
    if (!link) return;
    const imgInfo = imageData.find(img => img.id == imageId);
    
    const historyItem = {
        id: Date.now(),
        link: link,
        title: imgInfo ? imgInfo.title : 'Không xác định',
        time: new Date().toLocaleString('vi-VN'),
        imageId: imageId
    };
    history.unshift(historyItem);
    
    if (history.length > 50) history = history.slice(0, 50);
    
    localStorage.setItem('crackHistory', JSON.stringify(history));
    showNotification(`🔗 Đã mở: ${link.length > 50 ? link.substring(0, 50) + '...' : link}`, 'success');
    renderHistory();
    
    // Mở link trong tab mới
    window.open(link, '_blank');
}

// ==========================================
// SAO CHÉP LINK (global để onclick hoạt động)
// ==========================================
window.copyLink = function(link, event) {
    if (event) event.stopPropagation();
    navigator.clipboard.writeText(link).then(() => {
        showNotification('📋 Đã sao chép liên kết!', 'success');
    }).catch(() => {
        const textarea = document.createElement('textarea');
        textarea.value = link;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
        showNotification('📋 Đã sao chép liên kết!', 'success');
    });
};

// ==========================================
// RENDER LỊCH SỬ
// ==========================================
function renderHistory() {
    const historyList = document.getElementById('historyList');
    if (!historyList) return;
    
    if (history.length === 0) {
        historyList.innerHTML = '<li class="empty-history">📭 Chưa có lịch sử nào. Hãy bấm vào một liên kết!</li>';
        return;
    }

    historyList.innerHTML = history.map(item => `
        <li class="history-item">
            <span class="history-time">🕐 ${escapeHtml(item.time)}</span>
            <a class="history-link" href="${escapeHtml(item.link)}" target="_blank" title="${escapeHtml(item.title)}">
                ${item.link.length > 55 ? item.link.substring(0, 55) + '...' : escapeHtml(item.link)}
            </a>
            <button class="btn-copy" onclick="copyLink('${escapeHtml(item.link).replace(/'/g, "\\'")}', event)">
                📋 Copy
            </button>
        </li>
    `).join('');
}

// ==========================================
// KHỞI TẠO SỰ KIỆN AUTH
// ==========================================
function initAuthEvents() {
    // Chuyển tab đăng ký / đăng nhập
    const showRegisterBtn = document.getElementById('showRegister');
    const showLoginBtn = document.getElementById('showLogin');
    const loginBox = document.getElementById('loginBox');
    const registerBox = document.getElementById('registerBox');
    
    if (showRegisterBtn) {
        showRegisterBtn.addEventListener('click', () => {
            loginBox.style.display = 'none';
            registerBox.style.display = 'block';
        });
    }
    if (showLoginBtn) {
        showLoginBtn.addEventListener('click', () => {
            registerBox.style.display = 'none';
            loginBox.style.display = 'block';
        });
    }

    // Đăng ký
    const registerForm = document.getElementById('registerForm');
    if (registerForm) {
        registerForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const username = document.getElementById('regUsername').value.trim();
            const password = document.getElementById('regPassword').value;
            const confirmPassword = document.getElementById('regConfirmPassword').value;

            if (!username || !password) {
                showNotification('Vui lòng điền đầy đủ thông tin!', 'info');
                return;
            }
            if (password !== confirmPassword) {
                showNotification('Mật khẩu xác nhận không khớp!', 'info');
                return;
            }
            if (users.find(u => u.username === username)) {
                showNotification('Tên đăng nhập đã tồn tại!', 'info');
                return;
            }

            users.push({ username, password });
            localStorage.setItem('crackUsers', JSON.stringify(users));
            showNotification('Đăng ký thành công! Vui lòng đăng nhập.', 'success');
            
            registerBox.style.display = 'none';
            loginBox.style.display = 'block';
            document.getElementById('regUsername').value = '';
            document.getElementById('regPassword').value = '';
            document.getElementById('regConfirmPassword').value = '';
        });
    }

    // Đăng nhập
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const username = document.getElementById('loginUsername').value.trim();
            const password = document.getElementById('loginPassword').value;

            if (!username || !password) {
                showNotification('Vui lòng điền đầy đủ thông tin!', 'info');
                return;
            }

            const user = users.find(u => u.username === username && u.password === password);
            if (user) {
                currentUser = user;
                showNotification(`Chào ${username}! Đăng nhập thành công ✨`, 'success');
                
                setTimeout(() => {
                    document.getElementById('authContainer').classList.add('hidden');
                    document.getElementById('mainContainer').classList.add('active');
                    document.getElementById('displayUsername').textContent = currentUser.username;
                    renderImages();
                    renderHistory();
                }, 400);
            } else {
                showNotification('Sai tên đăng nhập hoặc mật khẩu!', 'info');
            }
        });
    }
}

// ==========================================
// KHỞI TẠO TOÀN BỘ
// ==========================================
function init() {
    // Reset form fields
    const loginUser = document.getElementById('loginUsername');
    const loginPass = document.getElementById('loginPassword');
    if (loginUser) loginUser.value = '';
    if (loginPass) loginPass.value = '';
    const regUser = document.getElementById('regUsername');
    const regPass = document.getElementById('regPassword');
    const regConfirm = document.getElementById('regConfirmPassword');
    if (regUser) regUser.value = '';
    if (regPass) regPass.value = '';
    if (regConfirm) regConfirm.value = '';

    // Đảm bảo giao diện auth hiển thị, main ẩn
    const authContainer = document.getElementById('authContainer');
    const mainContainer = document.getElementById('mainContainer');
    if (authContainer) authContainer.classList.remove('hidden');
    if (mainContainer) mainContainer.classList.remove('active');
    
    const loginBox = document.getElementById('loginBox');
    const registerBox = document.getElementById('registerBox');
    if (loginBox) loginBox.style.display = 'block';
    if (registerBox) registerBox.style.display = 'none';
    
    initAuthEvents();
    console.log('🚀 WebCrack đã sẵn sàng | 3 files riêng biệt');
}

// Chạy khi DOM tải xong
document.addEventListener('DOMContentLoaded', init);