import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import { getDatabase, ref, push, onChildAdded } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-database.js";

const firebaseConfig = {
  apiKey: "AIzaSyB6dx-0rPO3zKyJm7Pr6s1vmeWX-yI62HU",
  authDomain: "mi-chat-201ce.firebaseapp.com",
  projectId: "mi-chat-201ce",
  storageBucket: "mi-chat-201ce.firebasestorage.app",
  messagingSenderId: "957131962302",
  appId: "1:957131962302:web:fe755364cf088b0911abef"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getDatabase(app);

// UI Elements
const authDiv = document.getElementById('auth');
const chatArea = document.getElementById('chatArea');
const regEmail = document.getElementById('regEmail');
const regPass = document.getElementById('regPass');
const loginEmail = document.getElementById('loginEmail');
const loginPass = document.getElementById('loginPass');
const chatInput = document.getElementById('chatInput');
const messages = document.getElementById('messages');
const fileInput = document.getElementById('fileInput');

document.getElementById('registerBtn').onclick = () => {
  createUserWithEmailAndPassword(auth, regEmail.value, regPass.value)
    .then(() => alert("Registro exitoso, ahora inicia sesión."))
    .catch(e => alert(e.message));
};

document.getElementById('loginBtn').onclick = () => {
  signInWithEmailAndPassword(auth, loginEmail.value, loginPass.value)
    .catch(e => alert(e.message));
};

document.getElementById('logoutBtn').onclick = () => {
  signOut(auth);
};

document.getElementById('sendBtn').onclick = () => {
  const text = chatInput.value.trim();
  const file = fileInput.files[0];
  const data = { text, timestamp: Date.now() };

  if (file) {
    const reader = new FileReader();
    reader.onload = () => {
      data.file = {
        name: file.name,
        type: file.type,
        data: reader.result
      };
      push(ref(db, "messages"), data);
    };
    reader.readAsDataURL(file);
  } else if (text !== "") {
    push(ref(db, "messages"), data);
  }
  chatInput.value = "";
  fileInput.value = "";
};

onAuthStateChanged(auth, user => {
  if (user) {
    authDiv.style.display = "none";
    chatArea.style.display = "flex";
  } else {
    authDiv.style.display = "block";
    chatArea.style.display = "none";
  }
});

onChildAdded(ref(db, "messages"), (data) => {
  const val = data.val();
  const msg = document.createElement("div");
  msg.className = "message";
  if (val.file) {
    if (val.file.type.startsWith("image/")) {
      const img = document.createElement("img");
      img.src = val.file.data;
      img.style.maxWidth = "100%";
      msg.appendChild(img);
    } else if (val.file.type.startsWith("video/")) {
      const video = document.createElement("video");
      video.src = val.file.data;
      video.controls = true;
      video.style.maxWidth = "100%";
      msg.appendChild(video);
    }
  }
  if (val.text) {
    const text = document.createElement("p");
    text.textContent = val.text;
    msg.appendChild(text);
  }
  messages.appendChild(msg);
  messages.scrollTop = messages.scrollHeight;
});

document.getElementById("themeToggle").onclick = () => {
  const body = document.body;
  const current = body.getAttribute("data-theme");
  body.setAttribute("data-theme", current === "light" ? "dark" : "light");
  chatArea.classList.toggle("dark");
};
