import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.12.5/firebase-app.js';
import { getAuth, onAuthStateChanged, signOut } from 'https://www.gstatic.com/firebasejs/10.12.5/firebase-auth.js';
import { getFirestore, collection, addDoc, serverTimestamp, onSnapshot, query, orderBy, doc, deleteDoc, updateDoc } from 'https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js';
import { getStorage, ref, uploadBytes, getDownloadURL, deleteObject } from 'https://www.gstatic.com/firebasejs/10.12.5/firebase-storage.js';
import { firebaseConfig } from './firebase-config.js';

const ADMIN_EMAIL = 'yassenhassouna39@gmail.com';

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

// Tabs
const tabs = document.querySelectorAll('[data-tab]');
const tabPanels = { stats: document.getElementById('tab-stats'), courses: document.getElementById('tab-courses'), users: document.getElementById('tab-users') };
tabs.forEach(btn=> btn.addEventListener('click', ()=> showTab(btn.dataset.tab)));
function showTab(name) { for (const k in tabPanels) tabPanels[k].classList.add('hidden'); tabPanels[name].classList.remove('hidden'); }

// UI refs
const adminUserBox = document.getElementById('adminUserBox');
const uploadBtn = document.getElementById('uploadBtn');
const titleEl = document.getElementById('title');
const descriptionEl = document.getElementById('description');
const fileEl = document.getElementById('file');
const uploadMsg = document.getElementById('uploadMsg');
const courseList = document.getElementById('courseList');
const usersList = document.getElementById('usersList');

onAuthStateChanged(auth, (user)=>{
  if (!user) { location.href = 'login.html'; return; }
  adminUserBox.innerHTML = `أهلاً ${user.email} • <button class="btn" id="logoutBtn">خروج</button>`;
  document.getElementById('logoutBtn').onclick = ()=> signOut(auth);
  if (user.email !== ADMIN_EMAIL) {
    alert('هذه الصفحة مخصصة للأدمن فقط');
    location.href = 'index.html';
  }
});

// Upload new course
if (uploadBtn) {
  uploadBtn.onclick = async ()=>{
    uploadMsg.textContent = '';
    const file = fileEl.files[0];
    if (!file) { uploadMsg.textContent = 'اختر ملفاً أولاً'; return; }
    try {
      const safeName = Date.now() + '_' + file.name.replace(/\s+/g,'_');
      const storageRef = ref(storage, 'courses/' + safeName);
      await uploadBytes(storageRef, file);
      const url = await getDownloadURL(storageRef);
      await addDoc(collection(db,'courses'), {
        title: titleEl.value || file.name,
        description: descriptionEl.value || '',
        fileUrl: url,
        filePath: 'courses/' + safeName,
        createdAt: serverTimestamp(),
        addedBy: (auth.currentUser && auth.currentUser.email) || 'unknown'
      });
      uploadMsg.textContent = 'تم الرفع والحفظ بنجاح ✅';
      titleEl.value = ''; descriptionEl.value=''; fileEl.value='';
    } catch (e) {
      uploadMsg.textContent = e.message;
    }
  };
}

// List & manage courses
const cq = query(collection(db,'courses'), orderBy('createdAt','desc'));
onSnapshot(cq, (snap)=>{
  if (snap.empty) { courseList.innerHTML = '<div class="card">لا توجد كورسات بعد.</div>'; return; }
  courseList.innerHTML = Array.from(snap.docs).map(d=> courseRow(d.id, d.data())).join('');
  // attach handlers
  snap.docs.forEach(d=> attachCourseHandlers(d.id, d.data()));
});

function courseRow(id, data) {
  return `
  <div class="card" data-course="${id}">
    <div style="display:flex;justify-content:space-between;gap:8px;align-items:center">
      <div>
        <div><strong>${data.title || 'بدون عنوان'}</strong></div>
        <div class="small">${data.description || ''}</div>
        <a class="btn success" style="margin-top:6px" href="${data.fileUrl}" target="_blank">تحميل</a>
      </div>
      <button class="btn" data-del="${id}">حذف</button>
    </div>
  </div>`;
}
function attachCourseHandlers(id, data) {
  const delBtn = document.querySelector(`[data-del="${id}"]`);
  if (delBtn) delBtn.onclick = async ()=>{
    if (!confirm('تأكيد حذف الكورس؟')) return;
    try {
      if (data.filePath) { await deleteObject(ref(storage, data.filePath)); }
      await deleteDoc(doc(db,'courses', id));
    } catch(e) { alert(e.message); }
  };
}

// Users list
const uq = query(collection(db,'users'), orderBy('createdAt','desc'));
onSnapshot(uq, (snap)=>{
  if (snap.empty) { usersList.innerHTML = '<div class="card">لا يوجد مستخدمون بعد.</div>'; return; }
  usersList.innerHTML = '<div class="grid">' + Array.from(snap.docs).map(d=> userRow(d.id, d.data())).join('') + '</div>';
  snap.docs.forEach(d=> attachUserHandlers(d.id, d.data()));
});

function userRow(id, data) {
  const isAdmin = (data.email === ADMIN_EMAIL);
  return `
  <div class="card" data-user="${id}">
    <div style="display:flex;justify-content:space-between;gap:8px;align-items:center">
      <div>
        <div><strong>${data.email}</strong> ${isAdmin ? '<span class="badge">أدمن</span>' : ''}</div>
        <div class="small">UID: ${id}</div>
        <div class="small">الحالة: ${data.disabled ? 'محظور' : 'مفعّل'}</div>
      </div>
      <div style="display:flex;gap:8px">
        ${!isAdmin ? `<button class="btn" data-toggle="${id}">${data.disabled ? 'فك الحظر' : 'حظر'}</button>` : ''}
        ${!isAdmin ? `<button class="btn" data-remove="${id}">حذف من السجل</button>` : ''}
      </div>
    </div>
  </div>`;
}
function attachUserHandlers(id, data) {
  const tBtn = document.querySelector(`[data-toggle="${id}"]`);
  if (tBtn) tBtn.onclick = async ()=>{
    try { await updateDoc(doc(db,'users', id), { disabled: !data.disabled }); }
    catch(e) { alert(e.message); }
  };
  const rBtn = document.querySelector(`[data-remove="${id}"]`);
  if (rBtn) rBtn.onclick = async ()=>{
    if (!confirm('سيتم حذف سجل المستخدم من Firestore فقط (لن يُحذف من Authentication). متابعة؟')) return;
    try { await deleteDoc(doc(db,'users', id)); }
    catch(e) { alert(e.message); }
  };
}

// Stats
function refreshStats() {
  onSnapshot(collection(db,'courses'), s=>{ document.getElementById('stat-courses').textContent = s.size; document.getElementById('stat-updated').textContent = new Date().toLocaleString(); });
  onSnapshot(collection(db,'users'), s=>{ document.getElementById('stat-users').textContent = s.size; document.getElementById('stat-updated').textContent = new Date().toLocaleString(); });
}
refreshStats();

// Default tab
showTab('stats');
