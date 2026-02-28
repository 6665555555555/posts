// Simple client-side auth demo using localStorage and Web Crypto hashing
(() => {
  // Ensure DOM is ready before querying elements (prevents "null" errors when opened directly)
  document.addEventListener('DOMContentLoaded', () => {
  const $ = id => document.getElementById(id);

  const loginCard = $('login-card');
  const registerCard = $('register-card');
  const welcome = $('welcome');

  $('show-register').addEventListener('click', e => { e.preventDefault(); toggle('register'); });
  $('show-login').addEventListener('click', e => { e.preventDefault(); toggle('login'); });
  $('logout').addEventListener('click', e => { e.preventDefault(); doLogout(); });

  function toggle(view){
    if(view==='register'){
      registerCard.classList.remove('hidden');
      loginCard.classList.add('hidden');
      // Animate the card
      animateCard(registerCard);
    } else if(view==='login'){
      registerCard.classList.add('hidden');
      loginCard.classList.remove('hidden');
      // Animate the card
      animateCard(loginCard);
    }
  }

  function animateCard(card) {
    card.style.opacity = '0';
    card.style.transform = 'translateY(20px)';
    setTimeout(() => {
      card.style.transition = 'all 0.3s ease';
      card.style.opacity = '1';
      card.style.transform = 'translateY(0)';
    }, 50);
  }

  // Toggle password visibility
  document.querySelectorAll('.toggle-password').forEach(btn => {
    btn.addEventListener('click', () => {
      const targetId = btn.dataset.target;
      const input = document.getElementById(targetId);
      if (input) {
        const isPassword = input.type === 'password';
        input.type = isPassword ? 'text' : 'password';
        // Update icon
        btn.innerHTML = isPassword ? 
          `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M1 1l22 22"/>
            <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
          </svg>` :
          `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
            <circle cx="12" cy="12" r="3"/>
          </svg>`;
      }
    });
  });

  // Password strength indicator
  const passwordInput = $('reg-password');
  if (passwordInput) {
    passwordInput.addEventListener('input', () => {
      updatePasswordStrength(passwordInput.value);
    });
  }

  function updatePasswordStrength(password) {
    const strengthBar = document.querySelector('.strength-bar');
    const strengthText = document.querySelector('.strength-text');

    if (!strengthBar || !strengthText) return;

    let strength = 0;
    if (password.length >= 8) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[a-z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[\W_]/.test(password)) strength++;

    strengthBar.className = 'strength-bar';

    if (strength <= 2) {
      strengthBar.classList.add('weak');
      strengthText.textContent = 'ضعيفة';
      strengthText.style.color = 'var(--error)';
    } else if (strength <= 4) {
      strengthBar.classList.add('medium');
      strengthText.textContent = 'متوسطة';
      strengthText.style.color = 'var(--warning)';
    } else {
      strengthBar.classList.add('strong');
      strengthText.textContent = 'قوية';
      strengthText.style.color = 'var(--success)';
    }
  }

  // Toast notification system
  function showToast(type, title, message, duration = 5000) {
    const container = $('toast-container');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `toast ${type}`;

    const icons = {
      success: `<svg class="toast-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
        <polyline points="22 4 12 14.01 9 11.01"/>
      </svg>`,
      error: `<svg class="toast-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <circle cx="12" cy="12" r="10"/>
        <line x1="15" y1="9" x2="9" y2="15"/>
        <line x1="9" y1="9" x2="15" y2="15"/>
      </svg>`,
      warning: `<svg class="toast-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
        <line x1="12" y1="9" x2="12" y2="13"/>
        <line x1="12" y1="17" x2="12.01" y2="17"/>
      </svg>`,
      info: `<svg class="toast-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <circle cx="12" cy="12" r="10"/>
        <line x1="12" y1="16" x2="12" y2="12"/>
        <line x1="12" y1="8" x2="12.01" y2="8"/>
      </svg>`
    };

    toast.innerHTML = `
      ${icons[type]}
      <div class="toast-content">
        <div class="toast-title">${title}</div>
        <div class="toast-message">${message}</div>
      </div>
      <button class="toast-close">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <line x1="18" y1="6" x2="6" y2="18"/>
          <line x1="6" y1="6" x2="18" y2="18"/>
        </svg>
      </button>
    `;

    container.appendChild(toast);

    // Auto remove after duration
    const timeout = setTimeout(() => {
      removeToast(toast);
    }, duration);

    // Manual close
    toast.querySelector('.toast-close').addEventListener('click', () => {
      clearTimeout(timeout);
      removeToast(toast);
    });
  }

  function removeToast(toast) {
    toast.style.animation = 'slideOut 0.3s ease';
    setTimeout(() => {
      toast.remove();
    }, 300);
  }

  // Password hashing using SubtleCrypto -> SHA-256
  async function hashPassword(password){
    const enc = new TextEncoder();
    const data = enc.encode(password);
    const hash = await crypto.subtle.digest('SHA-256', data);
    return Array.from(new Uint8Array(hash)).map(b=>b.toString(16).padStart(2,'0')).join('');
  }

  function getUsers(){
    try{ return JSON.parse(localStorage.getItem('users')||'{}') }catch(e){ return {} }
  }
  function saveUsers(users){ localStorage.setItem('users', JSON.stringify(users)); }

  // validation helpers
  function usernameValid(u){ return /^[A-Za-z0-9_]{3,30}$/.test(u); }
  function isEmail(s){ return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s); }
  function isPhone(s){ return /^\+?\d{7,15}$/.test(s); }
  function passwordValid(p){
    if(p.length < 8) return false;
    if(!/[A-Z]/.test(p)) return false;
    if(!/[a-z]/.test(p)) return false;
    if(!/[0-9]/.test(p)) return false;
    if(!/[\W_]/.test(p)) return false;
    return true;
  }

  // Register
  $('register-form').addEventListener('submit', async e => {
    e.preventDefault();
    const username = $('reg-username').value.trim();
    const contact = $('reg-contact').value.trim();
    const first = $('reg-first').value.trim();
    const last = $('reg-last').value.trim();
    const pass = $('reg-password').value;
    const pass2 = $('reg-password-confirm').value;

    if(!usernameValid(username)) {
      showToast('error', 'خطأ في اسم المستخدم', 'اسم المستخدم يجب أن يكون بالإنجليزية وأحرف/أرقام/شرطة سفلية فقط، طول 3-30');
      return;
    }
    if(!(isEmail(contact) || isPhone(contact))) {
      showToast('error', 'خطأ في معلومات الاتصال', 'الرجاء إدخال بريد إلكتروني صالح أو رقم هاتف صالح (مثال: +123456789)');
      return;
    }
    if(pass !== pass2) {
      showToast('error', 'خطأ في كلمة المرور', 'كلمتا المرور غير متطابقتين');
      return;
    }
    if(!passwordValid(pass)) {
      showToast('error', 'كلمة مرور ضعيفة', 'كلمة المرور لا تفي بالشروط المطلوبة. يرجى التأكد من أن كلمة المرور تحتوي على 8 أحرف على الأقل، حرف كبير، حرف صغير، رقم، ورمز خاص.');
      return;
    }

    // Try to register via API first
    try {
      if (typeof api !== 'undefined' && api.register) {
        const response = await api.register({
          username,
          contact,
          firstName: first,
          lastName: last,
          password: pass
        });

        if (response && response.token) {
          api.setToken(response.token);
          showToast('success', 'تم إنشاء الحساب', 'تم إنشاء الحساب بنجاح. يمكنك الآن تسجيل الدخول.');
          $('register-form').reset();
          toggle('login');
          return;
        }
      }
    } catch (error) {
      console.error('API registration error:', error);
      // Fall back to local registration
    }

    // Local registration fallback
    const users = getUsers();
    // unique username
    if(users[username]) {
      showToast('error', 'اسم المستخدم محجوز', 'اسم المستخدم مستخدم مسبقاً، اختر اسماً آخر');
      return;
    }
    // ensure contact not used
    for(const k of Object.keys(users)){
      if(users[k].contact === contact) {
        showToast('error', 'معلومات الاتصال محجوزة', 'هذا البريد/الهاتف مستخدم لحساب آخر');
        return;
      }
    }

    const hashed = await hashPassword(pass);
    users[username] = { username, contact, first, last, passwordHash: hashed };
    saveUsers(users);
    showToast('success', 'تم إنشاء الحساب', 'تم إنشاء الحساب بنجاح. يمكنك الآن تسجيل الدخول.');
    $('register-form').reset();
    toggle('login');
  });

  // Login
  $('login-form').addEventListener('submit', async e => {
    e.preventDefault();
    const id = $('login-identifier').value.trim();
    const pass = $('login-password').value;

    // Try to login via API first
    try {
      if (typeof api !== 'undefined' && api.login) {
        const response = await api.login(id, pass);
        if (response && response.token) {
          api.setToken(response.token);
          showToast('success', 'مرحباً بك', `تم تسجيل الدخول بنجاح. أهلاً بك ${response.user.first || response.user.username}!`);
          showWelcome(response.user);
          $('login-form').reset();
          return;
        }
      }
    } catch (error) {
      console.error('API login error:', error);
      // Fall back to local authentication
    }

    // Local authentication fallback
    const users = getUsers();

    // find user by username or contact
    let user = null;
    if(users[id]) user = users[id];
    else {
      for(const k of Object.keys(users)){
        if(users[k].contact === id) { user = users[k]; break; }
      }
    }
    if(!user) {
      showToast('error', 'خطأ في تسجيل الدخول', 'المستخدم غير موجود. يرجى التحقق من اسم المستخدم أو معلومات الاتصال.');
      return;
    }
    const hashed = await hashPassword(pass);
    if(hashed !== user.passwordHash) {
      showToast('error', 'خطأ في كلمة المرور', 'كلمة المرور غير صحيحة. يرجى المحاولة مرة أخرى.');
      return;
    }

    // success
    showToast('success', 'مرحباً بك', `تم تسجيل الدخول بنجاح. أهلاً بك ${user.first || user.username}!`);
    showWelcome(user);
    $('login-form').reset();
  });

  async function showWelcome(user){
    $('welcome-title').textContent = `مرحبا ${user.first || user.username}`;
    const contactLine = user.contact ? `البريد/الهاتف: ${user.contact}` : '';
    $('welcome-msg').textContent = contactLine;
    // show dashboard
    const dashboard = $('dashboard');
    if(dashboard){
      dashboard.classList.remove('hidden');
      $('auth').classList.add('hidden');
      await renderDashboard();
    } else {
      welcome.classList.remove('hidden');
      $('auth').classList.add('hidden');
    }
  }

  async function doLogout(){
    // Try to logout via API first
    try {
      if (typeof api !== 'undefined' && api.logout) {
        await api.logout();
      }
    } catch (error) {
      console.error('API logout error:', error);
      // Continue with local logout even if API fails
    }

    // Local logout
    const dashboard = $('dashboard');
    if(dashboard) dashboard.classList.add('hidden');
    $('auth').classList.remove('hidden');
  }

  // ---------------- Posts and Socials ----------------
  function getPosts(){ try{ return JSON.parse(localStorage.getItem('posts')||'[]') }catch(e){return []} }
  function savePosts(list){ localStorage.setItem('posts', JSON.stringify(list)) }

  function getSocials(){ try{ return JSON.parse(localStorage.getItem('socials')||'{}') }catch(e){return {}} }
  function saveSocials(s){ localStorage.setItem('socials', JSON.stringify(s)) }

  async function renderDashboard(){
    await renderSocials();
    await renderPosts();
  }

  async function renderSocials(){
    // First, try to get social links from API
    try {
      if (typeof api !== 'undefined' && api.getSocialLinks) {
        const apiSocials = await api.getSocialLinks();
        if (apiSocials) {
          saveSocials(apiSocials);
        }
      }
    } catch (error) {
      console.error('Error fetching social links from API:', error);
      // Fall back to localStorage if API fails
    }

    // Display social links from localStorage
    const s = getSocials();
    $('social-facebook').value = s.facebook || '';
    $('social-youtube').value = s.youtube || '';
    $('social-tiktok').value = s.tiktok || '';
    $('social-linkedin').value = s.linkedin || '';
    $('social-instagram').value = s.instagram || '';
  }

  document.getElementById('open-socials').addEventListener('click', e=>{ e.preventDefault(); $('socials').classList.remove('hidden'); });
  document.getElementById('close-socials').addEventListener('click', e=>{ e.preventDefault(); $('socials').classList.add('hidden'); });

  document.getElementById('socials-form').addEventListener('submit', async e=>{
    e.preventDefault();
    const s = {
      facebook: $('social-facebook').value.trim(),
      youtube: $('social-youtube').value.trim(),
      tiktok: $('social-tiktok').value.trim(),
      linkedin: $('social-linkedin').value.trim(),
      instagram: $('social-instagram').value.trim()
    };

    // Save to localStorage
    saveSocials(s);

    // Also try to save to API if available
    try {
      if (typeof api !== 'undefined' && api.saveSocialLinks) {
        await api.saveSocialLinks(s);
        showToast('success', 'تم الحفظ', 'تم حفظ روابط الشبكات الاجتماعية بنجاح على الخادم');
      } else {
        showToast('success', 'تم الحفظ', 'تم حفظ روابط الشبكات الاجتماعية محلياً');
      }
    } catch (error) {
      console.error('Error saving social links to API:', error);
      showToast('warning', 'تنبيه', 'تم الحفظ محلياً فقط. لم يتم الاتصال بالخادم.');
    }

    $('socials').classList.add('hidden');
    renderSocials();
  });

  // WYSIWYG editor toolbar
  const editor = document.getElementById('post-editor');
  const preview = document.getElementById('post-preview');
  const toolbar = document.getElementById('editor-toolbar');
  const charCount = document.getElementById('char-count');

  // Character count functionality
  if (editor && charCount) {
    const updateCharCount = () => {
      const text = editor.innerText || '';
      const count = text.length;
      charCount.textContent = count;

      // Update character count styling based on limit
      const countContainer = charCount.parentElement;
      countContainer.classList.remove('warning', 'error');

      if (count > 240) {
        countContainer.classList.add('warning');
      }
      if (count > 280) {
        countContainer.classList.add('error');
      }
    };

    editor.addEventListener('input', updateCharCount);
    updateCharCount(); // Initialize count
  }

  if(toolbar){
    toolbar.addEventListener('click', ev=>{
      const btn = ev.target.closest('button[data-cmd]');
      if(!btn) return;
      const cmd = btn.dataset.cmd;
      if(cmd === 'createLink'){
        const url = prompt('أدخل رابط URL:', 'https://');
        if(url) document.execCommand('createLink', false, url);
      } else {
        document.execCommand(cmd, false, null);
      }
      editor.focus();
    });
  }

  // preview toggle
  const previewBtn = document.getElementById('toggle-preview');
  if(previewBtn){
    previewBtn.addEventListener('click', e=>{
      e.preventDefault();
      if(preview.classList.contains('hidden')){
        preview.innerHTML = editor.innerHTML || '<div style="opacity:.7">لا يوجد محتوى للمعاينة</div>';
        preview.classList.remove('hidden');
        editor.classList.add('hidden');
        previewBtn.textContent = 'إغلاق المعاينة';
      } else {
        preview.classList.add('hidden');
        editor.classList.remove('hidden');
        previewBtn.textContent = 'معاينة';
      }
    });
  }

  document.getElementById('post-form').addEventListener('submit', async e=>{
    e.preventDefault();
    const title = $('post-title').value.trim();
    const content = (document.getElementById('post-editor')?.innerHTML || '').trim();
    const schedule = $('post-schedule').value; // datetime-local -> may be empty
    // selected platforms from icon buttons
    const platforms = Array.from(document.querySelectorAll('.platform-btn.selected')).map(b=>b.dataset.platform);
    // consider empty if stripped text is empty
    const tempDiv = document.createElement('div'); tempDiv.innerHTML = content; const textOnly = tempDiv.textContent.trim();
    if(!title || !textOnly) {
      showToast('error', 'بيانات ناقصة', 'الرجاء إدخال العنوان والمحتوى للمنشور');
      return;
    }

    // Try to post via API first
    let apiPostId = null;
    try {
      if (typeof api !== 'undefined' && (api.createPost || api.schedulePost)) {
        // files (if any)
        const filesInput = document.getElementById('post-files');
        const files = [];
        if(filesInput && filesInput.files.length){
          for(const f of filesInput.files){ files.push({name:f.name,size:f.size,type:f.type}) }
        }
        // post type
        const typeEl = document.querySelector('input[name="post-type"]:checked');
        const ptype = typeEl? typeEl.value : 'text';

        const postData = {
          title,
          content,
          platforms,
          type: ptype,
          files
        };

        if(schedule){
          const scheduledAt = new Date(schedule).toISOString();
          if(new Date(scheduledAt) > new Date()) {
            const response = await api.schedulePost(postData, scheduledAt);
            apiPostId = response.id;
          }
        } else {
          const response = await api.createPost(postData);
          apiPostId = response.id;
        }
      }
    } catch (error) {
      console.error('API post error:', error);
      // Fall back to local posting
    }

    // Local posting
    const posts = getPosts();
    const id = apiPostId || 'p_' + Date.now();
    const createdAt = new Date().toISOString();
    let state = 'published';
    let scheduledAt = null;
    if(schedule){
      scheduledAt = new Date(schedule).toISOString();
      if(new Date(scheduledAt) > new Date()) state = 'scheduled';
    }
    // files (if any)
    const filesInput = document.getElementById('post-files');
    const files = [];
    if(filesInput && filesInput.files.length){
      for(const f of filesInput.files){ files.push({name:f.name,size:f.size,type:f.type}) }
    }
    // post type
    const typeEl = document.querySelector('input[name="post-type"]:checked');
    const ptype = typeEl? typeEl.value : 'text';
    const post = { id,title,content,platforms,createdAt,scheduledAt,state,publishedAt: state==='published'? new Date().toISOString(): null, files, type: ptype };
    posts.unshift(post);
    savePosts(posts);
    // clear editor
    $('post-form').reset();
    if(editor) editor.innerHTML = '';
    // reset platform selections
    document.querySelectorAll('.platform-btn.selected').forEach(b=>b.classList.remove('selected'));
    renderPosts();
    if(post.state === 'published') {
      showToast('success', 'تم النشر', 'تم نشر المنشور بنجاح على المنصات المحددة');
    } else {
      showToast('info', 'تم الجدولة', 'تم جدولة المنشور للنشر في الوقت المحدد');
    }
  });

  // Save as draft
  document.getElementById('save-draft').addEventListener('click', async e=>{
    e.preventDefault();
    const title = $('post-title').value.trim();
    const content = (document.getElementById('post-editor')?.innerHTML || '').trim();
    const platforms = Array.from(document.querySelectorAll('.platform-btn.selected')).map(b=>b.dataset.platform);
    const filesInput = document.getElementById('post-files');
    const files = [];
    if(filesInput && filesInput.files.length){ for(const f of filesInput.files){ files.push({name:f.name,size:f.size,type:f.type}) } }

    // Try to save draft via API first
    let apiDraftId = null;
    try {
      if (typeof api !== 'undefined' && api.saveDraft) {
        const typeEl = document.querySelector('input[name="post-type"]:checked');
        const ptype = typeEl? typeEl.value : 'text';

        const response = await api.saveDraft({
          title,
          content,
          platforms,
          type: ptype,
          files
        });

        if (response && response.id) {
          apiDraftId = response.id;
        }
      }
    } catch (error) {
      console.error('API save draft error:', error);
      // Fall back to local saving
    }

    // Local saving
    const posts = getPosts();
    const id = apiDraftId || 'p_' + Date.now();
    const createdAt = new Date().toISOString();
    const post = { id,title,content,platforms,createdAt,scheduledAt:null,state:'saved',publishedAt:null,files,type: document.querySelector('input[name="post-type"]:checked')?.value||'text' };
    posts.unshift(post); savePosts(posts); renderPosts(); $('post-form').reset(); document.querySelectorAll('.platform-btn.selected').forEach(b=>b.classList.remove('selected'));
    showToast('success', 'تم الحفظ', 'تم حفظ المسودة بنجاح. يمكنك العودة إليها لاحقاً من قسم المحفوظات');
  });

  async function renderPosts(){
    let posts = getPosts();

    // Try to fetch posts from API first
    try {
      if (typeof api !== 'undefined' && api.getPosts) {
        const apiPosts = await api.getPosts();
        if (apiPosts && (apiPosts.saved || apiPosts.scheduled || apiPosts.published)) {
          // Merge API posts with local posts
          const allPosts = [
            ...(apiPosts.saved || []).map(p => ({...p, state: 'saved'})),
            ...(apiPosts.scheduled || []).map(p => ({...p, state: 'scheduled'})),
            ...(apiPosts.published || []).map(p => ({...p, state: 'published'}))
          ];

          // Update local posts with API data
          const localPosts = getPosts();
          const mergedPosts = [...allPosts];

          // Add local posts that don't exist in API
          allPosts.forEach(apiPost => {
            const existsInLocal = localPosts.some(localPost => localPost.id === apiPost.id);
            if (!existsInLocal) {
              mergedPosts.push(apiPost);
            }
          });

          // Add local posts that don't exist in API
          localPosts.forEach(localPost => {
            const existsInApi = allPosts.some(apiPost => apiPost.id === localPost.id);
            if (!existsInApi) {
              mergedPosts.push(localPost);
            }
          });

          // Sort by creation date (newest first)
          mergedPosts.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

          posts = mergedPosts;
          savePosts(posts);
        }
      }
    } catch (error) {
      console.error('Error fetching posts from API:', error);
      // Fall back to local posts
    }

    // apply sidebar filter if set
    const activeFilter = document.querySelector('.side-btn.active')?.dataset.filter || 'new';
    const scheduled = posts.filter(p=>p.state==='scheduled');
    const published = posts.filter(p=>p.state==='published');
    const saved = posts.filter(p=>p.state==='saved');
    const sList = $('scheduled-list');
    const pList = $('published-list');
    sList.innerHTML = scheduled.length? scheduled.map(p=>{
      return `<div class="card" style="margin-bottom:8px">
          <strong>${escapeHtml(p.title)}</strong>
          <div style="font-size:13px;color:rgba(255,255,255,0.75)">مجدول للنشر: ${new Date(p.scheduledAt).toLocaleString()}</div>
          <div style="margin-top:6px">${p.content}</div>
          <div style="margin-top:6px;font-size:13px">منصات: ${p.platforms.join(', ')}</div>
          <div style="margin-top:6px"><button data-id="${p.id}" class="publish-now">انشر الآن</button> <button data-id="${p.id}" class="delete-post">حذف</button></div>
        </div>`;
    }).join('') : '<div>لا توجد منشورات مجدولة.</div>';
    pList.innerHTML = published.length? published.map(p=>{
      return `<div class="card" style="margin-bottom:8px">
        <strong>${escapeHtml(p.title)}</strong>
        <div style="font-size:13px;color:rgba(255,255,255,0.75)">نُشر: ${new Date(p.publishedAt).toLocaleString()}</div>
        <div style="margin-top:6px">${p.content}</div>
        <div style="margin-top:6px;font-size:13px">منصات: ${p.platforms.join(', ')}</div>
        <div style="margin-top:6px"><button data-id="${p.id}" class="delete-post">حذف</button></div>
      </div>`;
    }).join('') : '<div>لا توجد منشورات منشورة بعد.</div>';

    // if active filter is saved or new, adjust visible areas
    if(activeFilter === 'saved'){
      sList.innerHTML = '';
      pList.innerHTML = saved.length? saved.map(p=>{
        return `<div class="card" style="margin-bottom:8px"><strong>${escapeHtml(p.title)}</strong><div style="font-size:13px;color:rgba(255,255,255,0.75)">حفظت: ${new Date(p.createdAt).toLocaleString()}</div><div style="margin-top:6px">${p.content}</div><div style="margin-top:6px;font-size:13px">منصات: ${p.platforms.join(', ')}</div><div style="margin-top:6px"><button data-id="${p.id}" class="edit-post">تحرير</button> <button data-id="${p.id}" class="delete-post">حذف</button></div></div>`;
      }).join('') : '<div>لا توجد مسودات محفوظة.</div>';
    }
    if(activeFilter === 'new'){
      // show composer, nothing else special
    }

    // wire edit buttons
    document.querySelectorAll('.edit-post').forEach(btn=> btn.addEventListener('click', ev=>{
      const id = ev.currentTarget.dataset.id; editPost(id);
    }));

    // wire buttons
    document.querySelectorAll('.publish-now').forEach(btn=> btn.addEventListener('click', ev=>{
      const id = ev.currentTarget.dataset.id;
      publishNow(id);
    }));
    document.querySelectorAll('.delete-post').forEach(btn=> btn.addEventListener('click', ev=>{
      const id = ev.currentTarget.dataset.id;
      deletePost(id);
    }));
  }

  // sidebar buttons
  document.querySelectorAll('.side-btn').forEach(b=> b.addEventListener('click', async ev=>{
    document.querySelectorAll('.side-btn').forEach(x=>x.classList.remove('active'));
    ev.currentTarget.classList.add('active');
    const filter = ev.currentTarget.dataset.filter;
    // show/hide composer and lists accordingly
    const dashboard = $('dashboard');
    const composer = $('post-composer');
    const postsArea = $('posts-area');
    if(filter === 'new'){
      composer.scrollIntoView({behavior:'smooth'});
    }
    await renderPosts();
  }));

  // platform button toggle
  document.querySelectorAll('.platform-btn').forEach(b=> b.addEventListener('click', ev=>{
    ev.currentTarget.classList.toggle('selected');
  }));

  // file previews and input visibility + auto-open for media/files
  function renderFilePreviews(){
    const previews = document.getElementById('file-previews');
    const input = document.getElementById('post-files');
    previews.innerHTML = '';
    if(!input || !input.files || input.files.length===0) return;
    Array.from(input.files).forEach((file, idx)=>{
      const thumb = document.createElement('div'); thumb.className = 'file-thumb';
      const remove = document.createElement('button'); remove.className = 'remove'; remove.textContent = '×';
      remove.title = 'إزالة';
      remove.addEventListener('click', e=>{
        e.preventDefault();
        try{
          const dt = new DataTransfer();
          Array.from(input.files).forEach((f,i)=>{ if(i!==idx) dt.items.add(f) });
          input.files = dt.files;
          renderFilePreviews();
        }catch(err){ input.value = ''; renderFilePreviews(); }
      });
      thumb.appendChild(remove);
      if(file.type.startsWith('image/')){
        const img = document.createElement('img'); img.alt = file.name;
        img.src = URL.createObjectURL(file);
        thumb.appendChild(img);
      } else if(file.type.startsWith('video/')){
        const v = document.createElement('video'); v.src = URL.createObjectURL(file); v.muted = true; v.autoplay = false; v.playsInline = true; v.controls = false; thumb.appendChild(v);
      } else {
        const span = document.createElement('div'); span.textContent = file.name; span.style.padding = '6px'; span.style.fontSize='12px'; thumb.appendChild(span);
      }
      const meta = document.createElement('div'); meta.className='meta'; meta.textContent = Math.round(file.size/1024) + 'KB'; thumb.appendChild(meta);
      previews.appendChild(thumb);
    });
  }
  const filesInputEl = document.getElementById('post-files');
  if(filesInputEl) filesInputEl.addEventListener('change', renderFilePreviews);

  function updateFileInputVisibility(){
    const type = document.querySelector('input[name="post-type"]:checked')?.value || 'text';
    const label = document.getElementById('file-label');
    const filesInput = document.getElementById('post-files');
    if(type === 'text'){
      label.classList.add('hidden');
    } else if(type === 'media'){
      filesInput.accept = 'image/*,video/*';
      label.classList.remove('hidden');
      setTimeout(()=>{ try{ filesInput.click() }catch(e){} }, 60);
    } else if(type === 'files'){
      filesInput.accept = '*/*';
      label.classList.remove('hidden');
      setTimeout(()=>{ try{ filesInput.click() }catch(e){} }, 60);
    }
    renderFilePreviews();
  }
  document.querySelectorAll('input[name="post-type"]').forEach(r=> r.addEventListener('change', updateFileInputVisibility));
  updateFileInputVisibility();

  // drag & drop support: append multiple files
  function addFiles(filesList){
    const input = document.getElementById('post-files');
    if(!input) return;
    const dt = new DataTransfer();
    // keep existing
    Array.from(input.files || []).forEach(f=> dt.items.add(f));
    // add new
    Array.from(filesList).forEach(f=> dt.items.add(f));
    input.files = dt.files;
    renderFilePreviews();
  }

  const dropzone = document.getElementById('file-dropzone');
  if(dropzone){
    dropzone.addEventListener('click', e=>{ e.preventDefault(); const inp = document.getElementById('post-files'); if(inp) inp.click(); });
    dropzone.addEventListener('dragover', e=>{ e.preventDefault(); dropzone.classList.add('dragover'); });
    dropzone.addEventListener('dragleave', e=>{ e.preventDefault(); dropzone.classList.remove('dragover'); });
    dropzone.addEventListener('drop', e=>{
      e.preventDefault(); dropzone.classList.remove('dragover');
      if(e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files.length){
        addFiles(e.dataTransfer.files);
      }
    });
  }

  function editPost(id){
    const posts = getPosts();
    const p = posts.find(x=>x.id===id); 
    if(!p) {
      showToast('error', 'خطأ', 'المنشور غير موجود');
      return;
    }
    // populate composer for edit (simple replace)
    $('post-title').value = p.title; $('post-content').value = p.content; if(p.type) document.querySelector(`input[name="post-type"][value="${p.type}"]`).checked = true; updateFileInputVisibility();
    // select platforms
    document.querySelectorAll('.platform-btn.selected').forEach(b=>b.classList.remove('selected'));
    for(const pl of p.platforms || []){ const btn = document.querySelector(`.platform-btn[data-platform="${pl}"]`); if(btn) btn.classList.add('selected'); }
    // delete original post
    deletePost(id);
    showToast('info', 'التحرير', 'تم تحميل المنشور للتحرير. قم بإجراء التغييرات المطلوبة ثم انشر أو احفظ كمسودة');
  }

  async function publishNow(id){
    // Try to publish via API first
    try {
      if (typeof api !== 'undefined' && api.createPost) {
        const posts = getPosts();
        const post = posts.find(p=>p.id===id);
        if(post) {
          await api.createPost({
            title: post.title,
            content: post.content,
            platforms: post.platforms,
            type: post.type,
            files: post.files
          });
        }
      }
    } catch (error) {
      console.error('API publish now error:', error);
      // Fall back to local publishing
    }

    // Local publishing
    const posts = getPosts();
    const idx = posts.findIndex(p=>p.id===id);
    if(idx===-1) return;
    posts[idx].state = 'published';
    posts[idx].publishedAt = new Date().toISOString();
    posts[idx].scheduledAt = null;
    savePosts(posts);
    renderPosts();
    showToast('success', 'تم النشر', 'تم نشر المنشور بنجاح على المنصات المحددة');
  }

  async function deletePost(id){
    // Try to delete via API first
    try {
      if (typeof api !== 'undefined' && api.deletePost) {
        await api.deletePost(id);
      }
    } catch (error) {
      console.error('API delete post error:', error);
      // Continue with local deletion even if API fails
    }

    // Local deletion
    let posts = getPosts();
    posts = posts.filter(p=>p.id!==id);
    savePosts(posts);
    renderPosts();
    showToast('success', 'تم الحذف', 'تم حذف المنشور بنجاح');
  }

  function escapeHtml(s){ return String(s).replace(/[&<>"']/g, c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])) }

  // background scheduler: check every 5 seconds (demo). In production use server-side scheduling.
  setInterval(async ()=>{
    const posts = getPosts();
    let changed = false;
    const now = new Date();
    for(const p of posts){
      if(p.state === 'scheduled' && p.scheduledAt){
        if(new Date(p.scheduledAt) <= now){
          p.state = 'published'; p.publishedAt = new Date().toISOString(); p.scheduledAt = null; changed = true;
        }
      }
    }
    if(changed) { savePosts(posts); await renderPosts(); }
  }, 5000);

  });
})();


