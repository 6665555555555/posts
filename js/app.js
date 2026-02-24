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
    } else if(view==='login'){
      registerCard.classList.add('hidden');
      loginCard.classList.remove('hidden');
    }
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

    if(!usernameValid(username)) return alert('اسم المستخدم يجب أن يكون بالإنجليزية وأحرف/أرقام/شرط سفلية فقط، طول 3-30');
    if(!(isEmail(contact) || isPhone(contact))) return alert('الرجاء إدخال بريد إلكتروني صالح أو رقم هاتف صالح (مثال: +123456789)');
    if(pass !== pass2) return alert('كلمتا المرور غير متطابقتين');
    if(!passwordValid(pass)) return alert('كلمة المرور لا تفي بالشروط المطلوبة');

    const users = getUsers();
    // unique username
    if(users[username]) return alert('اسم المستخدم مستخدم مسبقاً، اختر اسماً آخر');
    // ensure contact not used
    for(const k of Object.keys(users)){
      if(users[k].contact === contact) return alert('هذا البريد/الهاتف مستخدم لحساب آخر');
    }

    const hashed = await hashPassword(pass);
    users[username] = { username, contact, first, last, passwordHash: hashed };
    saveUsers(users);
    alert('تم إنشاء الحساب بنجاح. يمكنك الآن تسجيل الدخول.');
    $('register-form').reset();
    toggle('login');
  });

  // Login
  $('login-form').addEventListener('submit', async e => {
    e.preventDefault();
    const id = $('login-identifier').value.trim();
    const pass = $('login-password').value;
    const users = getUsers();

    // find user by username or contact
    let user = null;
    if(users[id]) user = users[id];
    else {
      for(const k of Object.keys(users)){
        if(users[k].contact === id) { user = users[k]; break; }
      }
    }
    if(!user) return alert('المستخدم غير موجود');
    const hashed = await hashPassword(pass);
    if(hashed !== user.passwordHash) return alert('كلمة المرور غير صحيحة');

    // success
    showWelcome(user);
    $('login-form').reset();
  });

  function showWelcome(user){
    $('welcome-title').textContent = `مرحبا ${user.first || user.username}`;
    const contactLine = user.contact ? `البريد/الهاتف: ${user.contact}` : '';
    $('welcome-msg').textContent = contactLine;
    // show dashboard
    const dashboard = $('dashboard');
    if(dashboard){
      dashboard.classList.remove('hidden');
      $('auth').classList.add('hidden');
      renderDashboard();
    } else {
      welcome.classList.remove('hidden');
      $('auth').classList.add('hidden');
    }
  }

  function doLogout(){
    const dashboard = $('dashboard');
    if(dashboard) dashboard.classList.add('hidden');
    $('auth').classList.remove('hidden');
  }

  // ---------------- Posts and Socials ----------------
  function getPosts(){ try{ return JSON.parse(localStorage.getItem('posts')||'[]') }catch(e){return []} }
  function savePosts(list){ localStorage.setItem('posts', JSON.stringify(list)) }

  function getSocials(){ try{ return JSON.parse(localStorage.getItem('socials')||'{}') }catch(e){return {}} }
  function saveSocials(s){ localStorage.setItem('socials', JSON.stringify(s)) }

  function renderDashboard(){
    renderSocials();
    renderPosts();
  }

  function renderSocials(){
    const s = getSocials();
    $('social-facebook').value = s.facebook || '';
    $('social-youtube').value = s.youtube || '';
    $('social-tiktok').value = s.tiktok || '';
    $('social-linkedin').value = s.linkedin || '';
  }

  document.getElementById('open-socials').addEventListener('click', e=>{ e.preventDefault(); $('socials').classList.remove('hidden'); });
  document.getElementById('close-socials').addEventListener('click', e=>{ e.preventDefault(); $('socials').classList.add('hidden'); });

  document.getElementById('socials-form').addEventListener('submit', e=>{
    e.preventDefault();
    const s = {
      facebook: $('social-facebook').value.trim(),
      youtube: $('social-youtube').value.trim(),
      tiktok: $('social-tiktok').value.trim(),
      linkedin: $('social-linkedin').value.trim()
    };
    saveSocials(s);
    alert('تم حفظ روابط الشبكات الاجتماعية');
    $('socials').classList.add('hidden');
    renderSocials();
  });

  // WYSIWYG editor toolbar
  const editor = document.getElementById('post-editor');
  const preview = document.getElementById('post-preview');
  const toolbar = document.getElementById('editor-toolbar');
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

  document.getElementById('post-form').addEventListener('submit', e=>{
    e.preventDefault();
    const title = $('post-title').value.trim();
    const content = (document.getElementById('post-editor')?.innerHTML || '').trim();
    const schedule = $('post-schedule').value; // datetime-local -> may be empty
    // selected platforms from icon buttons
    const platforms = Array.from(document.querySelectorAll('.platform-btn.selected')).map(b=>b.dataset.platform);
    // consider empty if stripped text is empty
    const tempDiv = document.createElement('div'); tempDiv.innerHTML = content; const textOnly = tempDiv.textContent.trim();
    if(!title || !textOnly) return alert('الرجاء إدخال العنوان والمحتوى');
    const posts = getPosts();
    const id = 'p_' + Date.now();
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
    if(post.state === 'published') alert('تم نشر المنشور محلياً'); else alert('تم جدولة المنشور');
  });

  // Save as draft
  document.getElementById('save-draft').addEventListener('click', e=>{
    e.preventDefault();
    const title = $('post-title').value.trim();
    const content = (document.getElementById('post-editor')?.innerHTML || '').trim();
    const platforms = Array.from(document.querySelectorAll('.platform-btn.selected')).map(b=>b.dataset.platform);
    const filesInput = document.getElementById('post-files');
    const files = [];
    if(filesInput && filesInput.files.length){ for(const f of filesInput.files){ files.push({name:f.name,size:f.size,type:f.type}) } }
    const posts = getPosts();
    const id = 'p_' + Date.now();
    const createdAt = new Date().toISOString();
    const post = { id,title,content,platforms,createdAt,scheduledAt:null,state:'saved',publishedAt:null,files,type: document.querySelector('input[name="post-type"]:checked')?.value||'text' };
    posts.unshift(post); savePosts(posts); renderPosts(); $('post-form').reset(); document.querySelectorAll('.platform-btn.selected').forEach(b=>b.classList.remove('selected')); alert('تم حفظ المسودة');
  });

  function renderPosts(){
    const posts = getPosts();
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
  document.querySelectorAll('.side-btn').forEach(b=> b.addEventListener('click', ev=>{
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
    renderPosts();
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
    const p = posts.find(x=>x.id===id); if(!p) return alert('المنشور غير موجود');
    // populate composer for edit (simple replace)
    $('post-title').value = p.title; $('post-content').value = p.content; if(p.type) document.querySelector(`input[name="post-type"][value="${p.type}"]`).checked = true; updateFileInputVisibility();
    // select platforms
    document.querySelectorAll('.platform-btn.selected').forEach(b=>b.classList.remove('selected'));
    for(const pl of p.platforms || []){ const btn = document.querySelector(`.platform-btn[data-platform="${pl}"]`); if(btn) btn.classList.add('selected'); }
    // delete original post
    deletePost(id);
  }

  function publishNow(id){
    const posts = getPosts();
    const idx = posts.findIndex(p=>p.id===id);
    if(idx===-1) return;
    posts[idx].state = 'published';
    posts[idx].publishedAt = new Date().toISOString();
    posts[idx].scheduledAt = null;
    savePosts(posts);
    renderPosts();
    alert('تم نشر المنشور');
  }

  function deletePost(id){
    let posts = getPosts();
    posts = posts.filter(p=>p.id!==id);
    savePosts(posts);
    renderPosts();
  }

  function escapeHtml(s){ return String(s).replace(/[&<>"']/g, c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])) }

  // background scheduler: check every 5 seconds (demo). In production use server-side scheduling.
  setInterval(()=>{
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
    if(changed) { savePosts(posts); renderPosts(); }
  }, 5000);

  });
})();


