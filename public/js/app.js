// متغيرات عامة
let currentUser = null;
let connectedPlatforms = {};

// عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', function() {
    // التحقق من حالة تسجيل الدخول
    checkAuthStatus();

    // إضافة مستمعي الأحداث
    setupEventListeners();

    // تحميل حالة الاتصال بالمنصات
    loadConnectionStatus();
});

// إعداد مستمعي الأحداث
function setupEventListeners() {
    // نموذج تسجيل الدخول
    document.getElementById('login-form').addEventListener('submit', handleLogin);

    // نموذج تسجيل مستخدم جديد
    document.getElementById('register-form').addEventListener('submit', handleRegister);

    // أزرار التبديل بين نماذج تسجيل الدخول والتسجيل
    document.getElementById('show-register-form').addEventListener('click', showRegisterForm);
    document.getElementById('show-login-form').addEventListener('click', showLoginForm);

    // زر تسجيل الدخول
    document.getElementById('login-btn').addEventListener('click', showLoginForm);

    // زر تسجيل الخروج
    document.getElementById('logout-btn').addEventListener('click', handleLogout);

    // أزرار الاتصال بالمنصات
    document.querySelectorAll('.connect-btn').forEach(btn => {
        btn.addEventListener('click', handleConnectPlatform);
    });

    // أزرار فصل الاتصال بالمنصات
    document.querySelectorAll('.disconnect-btn').forEach(btn => {
        btn.addEventListener('click', handleDisconnectPlatform);
    });

    // نموذج إنشاء منشور
    document.getElementById('create-post-form').addEventListener('submit', handleCreatePost);

    // زر حفظ المسودة
    document.getElementById('save-draft-btn').addEventListener('click', handleSaveDraft);

    // روابط التنقل
    document.getElementById('home-link').addEventListener('click', showHomeSection);
    document.getElementById('posts-link').addEventListener('click', showPostsSection);
    document.getElementById('schedules-link').addEventListener('click', showSchedulesSection);
    document.getElementById('analytics-link').addEventListener('click', showAnalyticsSection);
}

// التحقق من حالة تسجيل الدخول
async function checkAuthStatus() {
    try {
        const response = await fetch('/api/auth/status');
        const data = await response.json();

        if (data.authenticated) {
            currentUser = data.user;
            showDashboard();
        } else {
            showLoginForm();
        }
    } catch (error) {
        console.error('خطأ في التحقق من حالة تسجيل الدخول:', error);
        showLoginForm();
    }
}

// عرض نموذج تسجيل الدخول
function showLoginForm(e) {
    if (e) e.preventDefault();

    document.getElementById('auth-section').classList.remove('d-none');
    document.getElementById('dashboard-section').classList.add('d-none');
    document.getElementById('login-form-container').classList.remove('d-none');
    document.getElementById('register-form-container').classList.add('d-none');
    document.getElementById('login-btn').classList.add('d-none');
    document.getElementById('logout-btn').classList.add('d-none');
}

// عرض نموذج تسجيل مستخدم جديد
function showRegisterForm(e) {
    if (e) e.preventDefault();

    document.getElementById('auth-section').classList.remove('d-none');
    document.getElementById('dashboard-section').classList.add('d-none');
    document.getElementById('login-form-container').classList.add('d-none');
    document.getElementById('register-form-container').classList.remove('d-none');
    document.getElementById('login-btn').classList.add('d-none');
    document.getElementById('logout-btn').classList.add('d-none');
}

// عرض لوحة التحكم
function showDashboard() {
    document.getElementById('auth-section').classList.add('d-none');
    document.getElementById('dashboard-section').classList.remove('d-none');
    document.getElementById('login-btn').classList.add('d-none');
    document.getElementById('logout-btn').classList.remove('d-none');

    // تحميل حالة الاتصال بالمنصات
    loadConnectionStatus();

    // تحميل المنشورات
    loadPosts();

    // تحميل الجداول
    loadSchedules();
}

// معالجة تسجيل الدخول
async function handleLogin(e) {
    e.preventDefault();

    const username = document.getElementById('login-username').value;
    const password = document.getElementById('login-password').value;

    try {
        const response = await fetch('/api/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username, password })
        });

        const data = await response.json();

        if (response.ok) {
            currentUser = data.user;
            showDashboard();
            showNotification('تم تسجيل الدخول بنجاح', 'success');
        } else {
            showNotification(data.message || 'فشل تسجيل الدخول', 'danger');
        }
    } catch (error) {
        console.error('خطأ في تسجيل الدخول:', error);
        showNotification('حدث خطأ في تسجيل الدخول', 'danger');
    }
}

// معالجة تسجيل مستخدم جديد
async function handleRegister(e) {
    e.preventDefault();

    const username = document.getElementById('register-username').value;
    const email = document.getElementById('register-email').value;
    const password = document.getElementById('register-password').value;
    const confirmPassword = document.getElementById('register-confirm-password').value;
    const terms = document.getElementById('register-terms').checked;

    // التحقق من صحة البيانات
    if (!username || !password) {
        showNotification('يجب توفير اسم المستخدم وكلمة المرور', 'danger');
        return;
    }

    if (password !== confirmPassword) {
        showNotification('كلمات المرور غير متطابقة', 'danger');
        return;
    }

    if (!terms) {
        showNotification('يجب الموافقة على الشروط والأحكام', 'danger');
        return;
    }

    // التحقق من قوة كلمة المرور
    if (password.length < 8) {
        showNotification('يجب أن تكون كلمة المرور 8 أحرف على الأقل', 'danger');
        return;
    }

    try {
        const response = await fetch('/api/auth/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username, email, password })
        });

        const data = await response.json();

        if (response.ok) {
            currentUser = data.user;
            showDashboard();
            showNotification('تم إنشاء الحساب بنجاح', 'success');
        } else {
            showNotification(data.message || 'فشل إنشاء الحساب', 'danger');
        }
    } catch (error) {
        console.error('خطأ في إنشاء الحساب:', error);
        showNotification('حدث خطأ في إنشاء الحساب', 'danger');
    }
}

// معالجة تسجيل الخروج
async function handleLogout() {
    try {
        const response = await fetch('/api/auth/logout', {
            method: 'POST'
        });

        if (response.ok) {
            currentUser = null;
            showLoginForm();
            showNotification('تم تسجيل الخروج بنجاح', 'success');
        } else {
            showNotification('فشل تسجيل الخروج', 'danger');
        }
    } catch (error) {
        console.error('خطأ في تسجيل الخروج:', error);
        showNotification('حدث خطأ في تسجيل الخروج', 'danger');
    }
}

// تحميل حالة الاتصال بالمنصات
async function loadConnectionStatus() {
    try {
        const response = await fetch('/api/social/status');
        const data = await response.json();

        if (response.ok) {
            connectedPlatforms = data.platforms;
            updatePlatformStatusUI();
        }
    } catch (error) {
        console.error('خطأ في تحميل حالة الاتصال:', error);
    }
}

// تحديث واجهة حالة الاتصال بالمنصات
function updatePlatformStatusUI() {
    const platforms = ['twitter', 'facebook', 'instagram', 'linkedin'];

    platforms.forEach(platform => {
        const statusBadge = document.getElementById(`${platform}-status`);
        const connectBtn = document.querySelector(`.connect-btn[data-platform="${platform}"]`);
        const disconnectBtn = document.querySelector(`.disconnect-btn[data-platform="${platform}"]`);

        if (connectedPlatforms[platform]) {
            statusBadge.textContent = 'متصل';
            statusBadge.classList.remove('bg-secondary');
            statusBadge.classList.add('bg-success');

            connectBtn.classList.add('d-none');
            disconnectBtn.classList.remove('d-none');
        } else {
            statusBadge.textContent = 'غير متصل';
            statusBadge.classList.remove('bg-success');
            statusBadge.classList.add('bg-secondary');

            connectBtn.classList.remove('d-none');
            disconnectBtn.classList.add('d-none');
        }
    });
}

// معالجة الاتصال بمنصة
async function handleConnectPlatform(e) {
    const platform = e.target.dataset.platform;

    // عرض نموذج الاتصال
    showConnectPlatformModal(platform);
}

// معالجة فصل الاتصال بمنصة
async function handleDisconnectPlatform(e) {
    const platform = e.target.dataset.platform;

    if (!confirm(`هل أنت متأكد من فصل الاتصال بحساب ${platform}؟`)) {
        return;
    }

    try {
        const response = await fetch(`/api/auth/disconnect/${platform}`, {
            method: 'POST'
        });

        const data = await response.json();

        if (response.ok) {
            connectedPlatforms[platform] = false;
            updatePlatformStatusUI();
            showNotification(data.message, 'success');
        } else {
            showNotification(data.message || 'فشل فصل الاتصال', 'danger');
        }
    } catch (error) {
        console.error(`خطأ في فصل الاتصال بـ ${platform}:`, error);
        showNotification(`حدث خطأ في فصل الاتصال بـ ${platform}`, 'danger');
    }
}

// عرض نموذج الاتصال بالمنصة
function showConnectPlatformModal(platform) {
    // إنشاء محتوى النموذج حسب المنصة
    let formContent = '';

    switch (platform) {
        case 'twitter':
            formContent = `
                <div class="mb-3">
                    <label for="twitter-api-key" class="form-label">مفتاح API</label>
                    <input type="text" class="form-control" id="twitter-api-key" required>
                </div>
                <div class="mb-3">
                    <label for="twitter-api-secret" class="form-label">مفتاح API السري</label>
                    <input type="text" class="form-control" id="twitter-api-secret" required>
                </div>
                <div class="mb-3">
                    <label for="twitter-access-token" class="form-label">رمز الوصول</label>
                    <input type="text" class="form-control" id="twitter-access-token" required>
                </div>
                <div class="mb-3">
                    <label for="twitter-access-token-secret" class="form-label">رمز الوصول السري</label>
                    <input type="text" class="form-control" id="twitter-access-token-secret" required>
                </div>
            `;
            break;
        case 'facebook':
        case 'instagram':
            formContent = `
                <div class="mb-3">
                    <label for="${platform}-app-id" class="form-label">معرف التطبيق</label>
                    <input type="text" class="form-control" id="${platform}-app-id" required>
                </div>
                <div class="mb-3">
                    <label for="${platform}-app-secret" class="form-label">مفتاح التطبيق السري</label>
                    <input type="text" class="form-control" id="${platform}-app-secret" required>
                </div>
                <div class="mb-3">
                    <label for="${platform}-access-token" class="form-label">رمز الوصول</label>
                    <input type="text" class="form-control" id="${platform}-access-token" required>
                </div>
            `;
            break;
        case 'linkedin':
            formContent = `
                <div class="mb-3">
                    <label for="linkedin-client-id" class="form-label">معرف العميل</label>
                    <input type="text" class="form-control" id="linkedin-client-id" required>
                </div>
                <div class="mb-3">
                    <label for="linkedin-client-secret" class="form-label">مفتاح العميل السري</label>
                    <input type="text" class="form-control" id="linkedin-client-secret" required>
                </div>
                <div class="mb-3">
                    <label for="linkedin-access-token" class="form-label">رمز الوصول</label>
                    <input type="text" class="form-control" id="linkedin-access-token" required>
                </div>
            `;
            break;
    }

    // إنشاء النموذج في النافذة المنبثقة
    const modalHtml = `
        <div class="modal fade" id="connect-platform-modal" tabindex="-1" aria-hidden="true">
            <div class="modal-dialog">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">ربط حساب ${platform}</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div class="modal-body">
                        <form id="connect-platform-form">
                            ${formContent}
                        </form>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">إلغاء</button>
                        <button type="button" class="btn btn-primary" id="connect-platform-submit">اتصال</button>
                    </div>
                </div>
            </div>
        </div>
    `;

    // إضافة النافذة المنبثقة إلى الصفحة
    const modalContainer = document.createElement('div');
    modalContainer.innerHTML = modalHtml;
    document.body.appendChild(modalContainer);

    // عرض النافذة المنبثقة
    const modal = new bootstrap.Modal(document.getElementById('connect-platform-modal'));
    modal.show();

    // إضافة مستمع الحدث لزر الاتصال
    document.getElementById('connect-platform-submit').addEventListener('click', () => {
        handleConnectPlatformSubmit(platform);
    });

    // إزالة النافذة المنبثقة عند الإغلاق
    document.getElementById('connect-platform-modal').addEventListener('hidden.bs.modal', () => {
        document.body.removeChild(modalContainer);
    });
}

// معالجة إرسال نموذج الاتصال بالمنصة
async function handleConnectPlatformSubmit(platform) {
    let credentials = {};

    switch (platform) {
        case 'twitter':
            credentials = {
                apiKey: document.getElementById('twitter-api-key').value,
                apiSecret: document.getElementById('twitter-api-secret').value,
                accessToken: document.getElementById('twitter-access-token').value,
                accessTokenSecret: document.getElementById('twitter-access-token-secret').value
            };
            break;
        case 'facebook':
        case 'instagram':
            credentials = {
                appId: document.getElementById(`${platform}-app-id`).value,
                appSecret: document.getElementById(`${platform}-app-secret`).value,
                accessToken: document.getElementById(`${platform}-access-token`).value
            };
            break;
        case 'linkedin':
            credentials = {
                clientId: document.getElementById('linkedin-client-id').value,
                clientSecret: document.getElementById('linkedin-client-secret').value,
                accessToken: document.getElementById('linkedin-access-token').value
            };
            break;
    }

    try {
        const response = await fetch(`/api/auth/connect/${platform}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(credentials)
        });

        const data = await response.json();

        if (response.ok) {
            connectedPlatforms[platform] = true;
            updatePlatformStatusUI();

            // إغلاق النافذة المنبثقة
            const modal = bootstrap.Modal.getInstance(document.getElementById('connect-platform-modal'));
            modal.hide();

            showNotification(data.message, 'success');
        } else {
            showNotification(data.message || 'فشل الاتصال', 'danger');
        }
    } catch (error) {
        console.error(`خطأ في الاتصال بـ ${platform}:`, error);
        showNotification(`حدث خطأ في الاتصال بـ ${platform}`, 'danger');
    }
}

// معالجة إنشاء منشور
async function handleCreatePost(e) {
    e.preventDefault();

    const content = document.getElementById('post-content').value;
    const imageFile = document.getElementById('post-image').files[0];
    const scheduleDate = document.getElementById('schedule-date').value;

    // الحصول على المنصات المحددة
    const platforms = [];
    document.querySelectorAll('.platform-checkbox:checked').forEach(checkbox => {
        platforms.push(checkbox.value);
    });

    if (!content && !imageFile) {
        showNotification('يجب توفير محتوى للمنشور أو صورة', 'danger');
        return;
    }

    if (platforms.length === 0) {
        showNotification('يجب تحديد منصة واحدة على الأقل للنشر', 'danger');
        return;
    }

    // إنشاء FormData للملفات
    const formData = new FormData();
    formData.append('content', content);
    formData.append('platforms', JSON.stringify(platforms));

    if (imageFile) {
        formData.append('image', imageFile);
    }

    if (scheduleDate) {
        formData.append('scheduledFor', scheduleDate);
    }

    try {
        const response = await fetch('/api/posts', {
            method: 'POST',
            body: formData
        });

        const data = await response.json();

        if (response.ok) {
            // إعادة تعيين النموذج
            document.getElementById('create-post-form').reset();

            // تحديث قائمة المنشورات
            loadPosts();

            showNotification(data.message, 'success');
        } else {
            showNotification(data.message || 'فشل إنشاء المنشور', 'danger');
        }
    } catch (error) {
        console.error('خطأ في إنشاء المنشور:', error);
        showNotification('حدث خطأ في إنشاء المنشور', 'danger');
    }
}

// معالجة حفظ المسودة
async function handleSaveDraft() {
    const content = document.getElementById('post-content').value;
    const imageFile = document.getElementById('post-image').files[0];

    // الحصول على المنصات المحددة
    const platforms = [];
    document.querySelectorAll('.platform-checkbox:checked').forEach(checkbox => {
        platforms.push(checkbox.value);
    });

    if (!content && !imageFile) {
        showNotification('يجب توفير محتوى للمنشور أو صورة', 'danger');
        return;
    }

    // إنشاء FormData للملفات
    const formData = new FormData();
    formData.append('content', content);
    formData.append('platforms', JSON.stringify(platforms));
    formData.append('status', 'draft');

    if (imageFile) {
        formData.append('image', imageFile);
    }

    try {
        const response = await fetch('/api/posts', {
            method: 'POST',
            body: formData
        });

        const data = await response.json();

        if (response.ok) {
            // إعادة تعيين النموذج
            document.getElementById('create-post-form').reset();

            // تحديث قائمة المنشورات
            loadPosts();

            showNotification(data.message, 'success');
        } else {
            showNotification(data.message || 'فشل حفظ المسودة', 'danger');
        }
    } catch (error) {
        console.error('خطأ في حفظ المسودة:', error);
        showNotification('حدث خطأ في حفظ المسودة', 'danger');
    }
}

// تحميل المنشورات
async function loadPosts() {
    try {
        const response = await fetch('/api/posts');
        const data = await response.json();

        if (response.ok) {
            displayPosts(data.posts);
        }
    } catch (error) {
        console.error('خطأ في تحميل المنشورات:', error);
    }
}

// عرض المنشورات
function displayPosts(posts) {
    const postsContainer = document.getElementById('posts-container');

    if (!posts || posts.length === 0) {
        postsContainer.innerHTML = '<div class="alert alert-info">لا توجد منشورات حتى الآن</div>';
        return;
    }

    let postsHtml = '';

    posts.forEach(post => {
        const statusBadge = getStatusBadge(post.status);
        const platformsIcons = getPlatformsIcons(post.platforms);

        postsHtml += `
            <div class="card mb-3">
                <div class="card-body">
                    <div class="d-flex justify-content-between align-items-start">
                        <div>
                            <div class="mb-2">${platformsIcons}</div>
                            <p class="card-text">${post.content || '(منشور بدون نص)'}</p>
                            ${post.imageUrl ? `<img src="${post.imageUrl}" class="img-fluid mb-2" alt="صورة المنشور">` : ''}
                        </div>
                        <div>
                            ${statusBadge}
                        </div>
                    </div>
                    <div class="d-flex justify-content-between align-items-center mt-3">
                        <small class="text-muted">${formatDate(post.createdAt)}</small>
                        <div>
                            ${post.status === 'draft' || post.status === 'scheduled' ? `
                                <button class="btn btn-sm btn-primary publish-post-btn" data-post-id="${post._id}">نشر</button>
                                <button class="btn btn-sm btn-outline-secondary edit-post-btn" data-post-id="${post._id}">تعديل</button>
                            ` : ''}
                            <button class="btn btn-sm btn-outline-danger delete-post-btn" data-post-id="${post._id}">حذف</button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    });

    postsContainer.innerHTML = postsHtml;

    // إضافة مستمعي الأحداث للأزرار
    document.querySelectorAll('.publish-post-btn').forEach(btn => {
        btn.addEventListener('click', handlePublishPost);
    });

    document.querySelectorAll('.edit-post-btn').forEach(btn => {
        btn.addEventListener('click', handleEditPost);
    });

    document.querySelectorAll('.delete-post-btn').forEach(btn => {
        btn.addEventListener('click', handleDeletePost);
    });
}

// الحصول على شارة الحالة
function getStatusBadge(status) {
    switch (status) {
        case 'draft':
            return '<span class="badge bg-secondary">مسودة</span>';
        case 'scheduled':
            return '<span class="badge bg-info">مجدول</span>';
        case 'published':
            return '<span class="badge bg-success">منشور</span>';
        case 'failed':
            return '<span class="badge bg-danger">فشل</span>';
        default:
            return '<span class="badge bg-secondary">' + status + '</span>';
    }
}

// الحصول على أيقونات المنصات
function getPlatformsIcons(platforms) {
    let iconsHtml = '';

    platforms.forEach(platform => {
        switch (platform) {
            case 'twitter':
                iconsHtml += '<i class="bi bi-twitter text-primary me-1"></i>';
                break;
            case 'facebook':
                iconsHtml += '<i class="bi bi-facebook text-primary me-1"></i>';
                break;
            case 'instagram':
                iconsHtml += '<i class="bi bi-instagram text-danger me-1"></i>';
                break;
            case 'linkedin':
                iconsHtml += '<i class="bi bi-linkedin text-info me-1"></i>';
                break;
        }
    });

    return iconsHtml;
}

// تنسيق التاريخ
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('ar-SA', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

// معالجة نشر منشور
async function handlePublishPost(e) {
    const postId = e.target.dataset.postId;

    try {
        const response = await fetch(`/api/posts/${postId}/publish`, {
            method: 'POST'
        });

        const data = await response.json();

        if (response.ok) {
            loadPosts();
            showNotification(data.message, 'success');
        } else {
            showNotification(data.message || 'فشل نشر المنشور', 'danger');
        }
    } catch (error) {
        console.error('خطأ في نشر المنشور:', error);
        showNotification('حدث خطأ في نشر المنشور', 'danger');
    }
}

// معالجة تعديل منشور
function handleEditPost(e) {
    const postId = e.target.dataset.postId;
    // هنا يمكن إضافة منطق لفتح نموذج تعديل المنشور
    showNotification('ميزة تعديل المنشور قيد التطوير', 'info');
}

// معالجة حذف منشور
async function handleDeletePost(e) {
    const postId = e.target.dataset.postId;

    if (!confirm('هل أنت متأكد من حذف هذا المنشور؟')) {
        return;
    }

    try {
        const response = await fetch(`/api/posts/${postId}`, {
            method: 'DELETE'
        });

        const data = await response.json();

        if (response.ok) {
            loadPosts();
            showNotification(data.message, 'success');
        } else {
            showNotification(data.message || 'فشل حذف المنشور', 'danger');
        }
    } catch (error) {
        console.error('خطأ في حذف المنشور:', error);
        showNotification('حدث خطأ في حذف المنشور', 'danger');
    }
}

// تحميل الجداول
async function loadSchedules() {
    try {
        const response = await fetch('/api/schedules');
        const data = await response.json();

        if (response.ok) {
            displaySchedules(data.schedules);
        }
    } catch (error) {
        console.error('خطأ في تحميل الجداول:', error);
    }
}

// عرض الجداول
function displaySchedules(schedules) {
    const schedulesContainer = document.getElementById('schedules-container');

    if (!schedules || schedules.length === 0) {
        schedulesContainer.innerHTML = '<div class="alert alert-info">لا توجد جداول حتى الآن</div>';
        return;
    }

    let schedulesHtml = '';

    schedules.forEach(schedule => {
        const activeBadge = schedule.active 
            ? '<span class="badge bg-success">نشط</span>' 
            : '<span class="badge bg-secondary">غير نشط</span>';

        const platformsIcons = getPlatformsIcons(schedule.platforms);

        schedulesHtml += `
            <div class="card mb-3">
                <div class="card-body">
                    <div class="d-flex justify-content-between align-items-start">
                        <div>
                            <div class="mb-2">${platformsIcons}</div>
                            <p class="card-text">${schedule.postId?.content || '(منشور بدون نص)'}</p>
                            <p class="card-text"><small class="text-muted">تعبير Cron: ${schedule.cronExpression}</small></p>
                            <p class="card-text"><small class="text-muted">التشغيل التالي: ${schedule.nextRun ? formatDate(schedule.nextRun) : 'غير محدد'}</small></p>
                        </div>
                        <div>
                            ${activeBadge}
                        </div>
                    </div>
                    <div class="d-flex justify-content-between align-items-center mt-3">
                        <small class="text-muted">عدد مرات التشغيل: ${schedule.runCount}</small>
                        <div>
                            <button class="btn btn-sm btn-outline-primary execute-schedule-btn" data-schedule-id="${schedule._id}">تنفيذ الآن</button>
                            <button class="btn btn-sm btn-outline-secondary toggle-schedule-btn" data-schedule-id="${schedule._id}">${schedule.active ? 'تعطيل' : 'تفعيل'}</button>
                            <button class="btn btn-sm btn-outline-danger delete-schedule-btn" data-schedule-id="${schedule._id}">حذف</button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    });

    schedulesContainer.innerHTML = schedulesHtml;

    // إضافة مستمعي الأحداث للأزرار
    document.querySelectorAll('.execute-schedule-btn').forEach(btn => {
        btn.addEventListener('click', handleExecuteSchedule);
    });

    document.querySelectorAll('.toggle-schedule-btn').forEach(btn => {
        btn.addEventListener('click', handleToggleSchedule);
    });

    document.querySelectorAll('.delete-schedule-btn').forEach(btn => {
        btn.addEventListener('click', handleDeleteSchedule);
    });
}

// معالجة تنفيذ جدولة
async function handleExecuteSchedule(e) {
    const scheduleId = e.target.dataset.scheduleId;

    try {
        const response = await fetch(`/api/schedules/${scheduleId}/execute`, {
            method: 'POST'
        });

        const data = await response.json();

        if (response.ok) {
            loadSchedules();
            showNotification(data.message, 'success');
        } else {
            showNotification(data.message || 'فشل تنفيذ الجدولة', 'danger');
        }
    } catch (error) {
        console.error('خطأ في تنفيذ الجدولة:', error);
        showNotification('حدث خطأ في تنفيذ الجدولة', 'danger');
    }
}

// معالجة تبديل حالة جدولة
async function handleToggleSchedule(e) {
    const scheduleId = e.target.dataset.scheduleId;

    try {
        const response = await fetch(`/api/schedules/${scheduleId}/toggle`, {
            method: 'PATCH'
        });

        const data = await response.json();

        if (response.ok) {
            loadSchedules();
            showNotification(data.message, 'success');
        } else {
            showNotification(data.message || 'فشل تبديل حالة الجدولة', 'danger');
        }
    } catch (error) {
        console.error('خطأ في تبديل حالة الجدولة:', error);
        showNotification('حدث خطأ في تبديل حالة الجدولة', 'danger');
    }
}

// معالجة حذف جدولة
async function handleDeleteSchedule(e) {
    const scheduleId = e.target.dataset.scheduleId;

    if (!confirm('هل أنت متأكد من حذف هذه الجدولة؟')) {
        return;
    }

    try {
        const response = await fetch(`/api/schedules/${scheduleId}`, {
            method: 'DELETE'
        });

        const data = await response.json();

        if (response.ok) {
            loadSchedules();
            showNotification(data.message, 'success');
        } else {
            showNotification(data.message || 'فشل حذف الجدولة', 'danger');
        }
    } catch (error) {
        console.error('خطأ في حذف الجدولة:', error);
        showNotification('حدث خطأ في حذف الجدولة', 'danger');
    }
}

// عرض قسم الرئيسية
function showHomeSection(e) {
    if (e) e.preventDefault();

    // إخفاء جميع الأقسام
    document.getElementById('home-section').classList.remove('d-none');
    document.getElementById('posts-section').classList.add('d-none');
    document.getElementById('schedules-section').classList.add('d-none');
    document.getElementById('analytics-section').classList.add('d-none');

    // تحديث روابط التنقل
    document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.remove('active');
    });
    document.getElementById('home-link').classList.add('active');
}

// عرض قسم المنشورات
function showPostsSection(e) {
    if (e) e.preventDefault();

    // إخفاء جميع الأقسام
    document.getElementById('home-section').classList.add('d-none');
    document.getElementById('posts-section').classList.remove('d-none');
    document.getElementById('schedules-section').classList.add('d-none');
    document.getElementById('analytics-section').classList.add('d-none');

    // تحديث روابط التنقل
    document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.remove('active');
    });
    document.getElementById('posts-link').classList.add('active');

    // تحميل المنشورات
    loadPosts();
}

// عرض قسم الجداول
function showSchedulesSection(e) {
    if (e) e.preventDefault();

    // إخفاء جميع الأقسام
    document.getElementById('home-section').classList.add('d-none');
    document.getElementById('posts-section').classList.add('d-none');
    document.getElementById('schedules-section').classList.remove('d-none');
    document.getElementById('analytics-section').classList.add('d-none');

    // تحديث روابط التنقل
    document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.remove('active');
    });
    document.getElementById('schedules-link').classList.add('active');

    // تحميل الجداول
    loadSchedules();
}

// عرض قسم التحليلات
function showAnalyticsSection(e) {
    if (e) e.preventDefault();

    // إخفاء جميع الأقسام
    document.getElementById('home-section').classList.add('d-none');
    document.getElementById('posts-section').classList.add('d-none');
    document.getElementById('schedules-section').classList.add('d-none');
    document.getElementById('analytics-section').classList.remove('d-none');

    // تحديث روابط التنقل
    document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.remove('active');
    });
    document.getElementById('analytics-link').classList.add('active');

    // تحميل التحليلات
    loadAnalytics();
}

// تحميل التحليلات
async function loadAnalytics() {
    // هنا يمكن إضافة منطق لتحميل بيانات التحليلات
    // حاليًا سنعرض بيانات وهمية
    const analyticsContainer = document.getElementById('analytics-container');

    const analyticsHtml = `
        <div class="row">
            <div class="col-md-3 mb-4">
                <div class="card text-center">
                    <div class="card-body">
                        <h5 class="card-title">إجمالي المنشورات</h5>
                        <h2 class="card-text">0</h2>
                    </div>
                </div>
            </div>
            <div class="col-md-3 mb-4">
                <div class="card text-center">
                    <div class="card-body">
                        <h5 class="card-title">إجمالي التفاعلات</h5>
                        <h2 class="card-text">0</h2>
                    </div>
                </div>
            </div>
            <div class="col-md-3 mb-4">
                <div class="card text-center">
                    <div class="card-body">
                        <h5 class="card-title">أكثر منصة نشاطًا</h5>
                        <h2 class="card-text">-</h2>
                    </other>
                </div>
            </div>
            <div class="col-md-3 mb-4">
                <div class="card text-center">
                    <div class="card-body">
                        <h5 class="card-title">أفضل وقت للنشر</h5>
                        <h2 class="card-text">-</h2>
                    </div>
                </div>
            </div>
        </div>
    `;

    analyticsContainer.innerHTML = analyticsHtml;
}

// عرض إشعار
function showNotification(message, type = 'info') {
    // إنشاء عنصر الإشعار
    const notification = document.createElement('div');
    notification.className = `alert alert-${type} alert-dismissible fade show position-fixed`;
    notification.style.top = '20px';
    notification.style.right = '20px';
    notification.style.zIndex = '9999';
    notification.style.minWidth = '300px';

    notification.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
    `;

    // إضافة الإشعار إلى الصفحة
    document.body.appendChild(notification);

    // إزالة الإشعار بعد 5 ثواني
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 5000);
}

// عرض نموذج تسجيل الدخول
function showLoginModal() {
    showLogin();
}
