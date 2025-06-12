// script.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  onAuthStateChanged,
  signOut,
  updateProfile,
} from "https://www.gstatic.com/firebasejs/9.23.0/firebase-auth.js";
import {
  getFirestore,
  collection,
  addDoc,
  query,
  orderBy,
  onSnapshot,
  serverTimestamp,
} from "https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js";
import {
  getStorage,
  ref,
  uploadBytes,
  getDownloadURL,
} from "https://www.gstatic.com/firebasejs/9.23.0/firebase-storage.js";

// Tu configuración Firebase aquí
const firebaseConfig = {
  apiKey: "TU_API_KEY",
  authDomain: "TU_AUTH_DOMAIN",
  projectId: "TU_PROJECT_ID",
  storageBucket: "TU_STORAGE_BUCKET",
  messagingSenderId: "TU_MESSAGING_SENDER_ID",
  appId: "TU_APP_ID",
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

// Elementos DOM
const regEmail = document.getElementById("regEmail");
const regPass = document.getElementById("regPass");
const registerBtn = document.getElementById("registerBtn");

const loginEmail = document.getElementById("loginEmail");
const loginPass = document.getElementById("loginPass");
const loginBtn = document.getElementById("loginBtn");

const authSection = document.getElementById("auth");
const chatArea = document.getElementById("chatArea");

const messagesDiv = document.getElementById("messages");
const chatInput = document.getElementById("chatInput");
const sendBtn = document.getElementById("sendBtn");
const fileInput = document.getElementById("fileInput");

const menuBtn = document.getElementById("menuBtn");
const sidebar = document.getElementById("sidebar");
const closeBtn = document.getElementById("closeBtn");

const logoutNav = document.getElementById("logoutNav");

const themeToggle = document.getElementById("themeToggle");

// Perfil usuario
const profilePic = document.getElementById("profilePic");
const userNameDisplay = document.getElementById("userNameDisplay");
const userNameInput = document.getElementById("userNameInput");
const userPhotoInput = document.getElementById("userPhotoInput");
const saveProfileBtn = document.getElementById("saveProfileBtn");

// Manejo menú lateral
menuBtn.addEventListener("click", () => sidebar.classList.add("open"));
closeBtn.addEventListener("click", () => sidebar.classList.remove("open"));

// Cambiar tema
themeToggle.addEventListener("click", () => {
  const body = document.body;
  const current = body.getAttribute("data-theme");
  if (current === "light") {
    body.setAttribute("data-theme", "dark");
    themeToggle.textContent = "☀️ Cambiar Tema";
  } else {
    body.setAttribute("data-theme", "light");
    themeToggle.textContent = "🌙 Cambiar Tema";
  }
});

// Registro
registerBtn.addEventListener("click", async () => {
  try {
    await createUserWithEmailAndPassword(auth, regEmail.value, regPass.value);
    alert("Registrado correctamente, ahora inicia sesión.");
  } catch (error) {
    alert("Error al registrar: " + error.message);
  }
});

// Login
loginBtn.addEventListener("click", async () => {
  try {
    await signInWithEmailAndPassword(auth, loginEmail.value, loginPass.value);
  } catch (error) {
    alert("Error al iniciar sesión: " + error.message);
  }
});

// Logout
logoutNav.addEventListener("click", async (e) => {
  e.preventDefault();
  await signOut(auth);
});

// Estado de autenticación
onAuthStateChanged(auth, (user) => {
  if (user) {
    authSection.style.display = "none";
    chatArea.style.display = "block";
    sidebar.classList.remove("open");
    cargarPerfil(user);
    cargarMensajes();
  } else {
    authSection.style.display = "block";
    chatArea.style.display = "none";
    clearMensajes();
    profilePic.src = "";
    userNameDisplay.textContent = "";
  }
});

// Guardar perfil (nombre y foto)
saveProfileBtn.addEventListener("click", async () => {
  const user = auth.currentUser;
  if (!user) return alert("Debes iniciar sesión");

  let photoURL = user.photoURL;
  if (userPhotoInput.files[0]) {
    const file = userPhotoInput.files[0];
    const storageRef = ref(storage, `profiles/${user.uid}/${file.name}`);
    await uploadBytes(storageRef, file);
    photoURL = await getDownloadURL(storageRef);
  }

  const displayName = userNameInput.value.trim();
  if (displayName === "") {
    alert("Ingresa un nombre de usuario");
    return;
  }

  await updateProfile(user, { displayName, photoURL });
  alert("Perfil actualizado");
  cargarPerfil(user);
});

// Cargar perfil
function cargarPerfil(user) {
  profilePic.src = user.photoURL || "https://via.placeholder.com/40";
  userNameDisplay.textContent = user.displayName || "Usuario sin nombre";
  userNameInput.value = user.displayName || "";
}

// Limpiar mensajes
function clearMensajes() {
  messagesDiv.innerHTML = "";
  if (window.unsubscribeMessages) {
    window.unsubscribeMessages();
    window.unsubscribeMessages = null;
  }
}

// Cargar mensajes en tiempo real
function cargarMensajes() {
  clearMensajes();

  const messagesQuery = query(
    collection(db, "messages"),
    orderBy("createdAt", "asc")
  );

  window.unsubscribeMessages = onSnapshot(messagesQuery, (snapshot) => {
    messagesDiv.innerHTML = "";
    snapshot.forEach((doc) => {
      const msg = doc.data();
      const div = document.createElement("div");
      div.classList.add("message");

      const avatar = document.createElement("img");
      avatar.classList.add("avatar");
      avatar.src = msg.photoURL || "https://via.placeholder.com/40";
      avatar.alt = msg.displayName || "Usuario";

      const content = document.createElement("div");
      content.classList.add("content");

      const userNameEl = document.createElement("div");
      userNameEl.classList.add("user-name");
      userNameEl.textContent = msg.displayName || "Usuario";

      if (msg.type === "text") {
        content.textContent = msg.text;
      } else if (msg.type === "image") {
        const img = document.createElement("img");
        img.src = msg.url;
        img.style.maxWidth = "200px";
        content.appendChild(img);
      } else if (msg.type === "video") {
        const video = document.createElement("video");
        video.src = msg.url;
        video.controls = true;
        video.style.maxWidth = "200px";
        content.appendChild(video);
      }

      div.appendChild(avatar);
      div.appendChild(content);
      div.insertBefore(userNameEl, content);
      messagesDiv.appendChild(div);
      messagesDiv.scrollTop = messagesDiv.scrollHeight;
    });
  });
}

// Enviar mensaje o archivo
sendBtn.addEventListener("click", async () => {
  const user = auth.currentUser;
  if (!user) return alert("Debes iniciar sesión para enviar mensajes");

  const file = fileInput.files[0];
  if (file) {
    const fileType = file.type.split("/")[0];
    const storageRef = ref(storage, `chat_files/${user.uid}/${file.name}`);

    await uploadBytes(storageRef, file);
    const url = await getDownloadURL(storageRef);

    await addDoc(collection(db, "messages"), {
      uid: user.uid,
      displayName: user.displayName,
      photoURL: user.photoURL,
      createdAt: serverTimestamp(),
      type: fileType === "video" ? "video" : "image",
      url,
    });

    fileInput.value = "";
  } else if (chatInput.value.trim() !== "") {
    await addDoc(collection(db, "messages"), {
      uid: user.uid,
      displayName: user.displayName,
      photoURL: user.photoURL,
      text: chatInput.value.trim(),
      createdAt: serverTimestamp(),
      type: "text",
    });
    chatInput.value = "";
  }
});
