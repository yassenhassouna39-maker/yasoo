import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.12.5/firebase-app.js';
import { getAuth, onAuthStateChanged, signOut } from 'https://www.gstatic.com/firebasejs/10.12.5/firebase-auth.js';
import { getFirestore, collection, query, orderBy, onSnapshot } from 'https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js';
import { firebaseConfig } from './firebase-config.js';

const ADMIN_EMAIL = 'yassenhassouna39@gmail.com';

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

const coursesEl = document.getElementById('courses');
const adminLink = document.getElementById('adminLink');
const userBox = document.getElementById('userBox');
const loginLink = document.getElementById('loginLink');

function courseCard(doc) {
  const data = doc.data();
  return `
    <div class="card">
      <h3>${data.title ?? 'بدون عنوان'}</h3>
      <p class="small">${data.description ?? ''}</p>
      <div style="display:flex;gap:8px;margin-top:8px">
        <a class="btn success" href="${data.fileUrl}" target="_blank" rel="noopener">تحميل الكورس</a>
      </div>
      <p class="small">أضيف بواسطة: ${data.addedBy ?? 'غير معروف'}</p>
    </div>
  `;
}

const q = query(collection(db, 'courses'), orderBy('createdAt','desc'));
onSnapshot(q, (snap)=>{
  if (snap.empty) {
    coursesEl.innerHTML = '<div class="card">لا توجد كورسات بعد.</div>';
  } else {
    coursesEl.innerHTML = Array.from(snap.docs).map(courseCard).join('');
  }
});

onAuthStateChanged(auth, (user)=>{
  if (user) {
    userBox.innerHTML = \`مسجل كـ: \${user.email} • <button class="btn" id="logoutBtn">خروج</button>\`;
    if (user.email === ADMIN_EMAIL) {
      adminLink.classList.remove('hidden');
    } else {
      adminLink.classList.add('hidden');
    }
    document.getElementById('logoutBtn').onclick = ()=> signOut(auth);
    loginLink.textContent = 'حسابي';
  } else {
    userBox.textContent = 'غير مسجل';
    adminLink.classList.add('hidden');
    loginLink.textContent = 'تسجيل الدخول';
  }
});
