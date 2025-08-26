import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.12.5/firebase-app.js';
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, GoogleAuthProvider, signInWithPopup, onAuthStateChanged, signOut } from 'https://www.gstatic.com/firebasejs/10.12.5/firebase-auth.js';
import { firebaseConfig } from './firebase-config.js';

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();

const loginBtn = document.getElementById('loginBtn');
const loginEmail = document.getElementById('loginEmail');
const loginPassword = document.getElementById('loginPassword');
const loginMsg = document.getElementById('loginMsg');

const signupBtn = document.getElementById('signupBtn');
const signupEmail = document.getElementById('signupEmail');
const signupPassword = document.getElementById('signupPassword');
const signupMsg = document.getElementById('signupMsg');

document.getElementById('googleBtn').onclick = async () => {
  try {
    await signInWithPopup(auth, provider);
    location.href = 'index.html';
  } catch (e) {
    loginMsg.textContent = e.message;
  }
};

loginBtn.onclick = async () => {
  loginMsg.textContent = '';
  try {
    await signInWithEmailAndPassword(auth, loginEmail.value, loginPassword.value);
    location.href = 'index.html';
  } catch (e) {
    loginMsg.textContent = e.message;
  }
};

signupBtn.onclick = async () => {
  signupMsg.textContent = '';
  try {
    await createUserWithEmailAndPassword(auth, signupEmail.value, signupPassword.value);
    signupMsg.textContent = 'تم إنشاء الحساب. سيتم تحويلك...';
    setTimeout(()=> location.href = 'index.html', 600);
  } catch (e) {
    signupMsg.textContent = e.message;
  }
};

onAuthStateChanged(auth, (user)=>{
  if (user) {
    // already signed in
  }
});
