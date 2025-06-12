// archivos.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.9.1/firebase-app.js";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  onAuthStateChanged,
  signOut,
  updateProfile,
} import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/11.9.1/firebase-auth.js";
import {
  getFirestore,
  collection,
  addDoc,
  query,
  orderBy,
  onSnapshot,
  serverTimestamp,
} import { getFirestore } from "https://www.gstatic.com/firebasejs/11.9.1/firebase-firestore.js";
import {
  getStorage,
  ref,
  uploadBytes,
  getDownloadURL,
  listAll,
} import { getStorage } from "https://www.gstatic.com/firebasejs/11.9.1/firebase-storage.js";

// Configuración Firebase (igual que script.js)
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
const fileSection = document.getElementById("fileSection");

const uploadFileInput = document.getElementById("uploadFileInput");
const uploadFileBtn = document.getElementById("uploadFileBtn");
const fileList = document.getElementById("fileList");

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
    fileSection.style.display = "block";
    sidebar.classList.remove("open");
    cargarPerfil(user);
    listarArchivos();
  } else {
    authSection.style.display = "block";
    fileSection.style.display = "none";
    profilePic.src = "";
    userNameDisplay.textContent = "";
    fileList.innerHTML = "";
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

// Subir archivo
uploadFileBtn.addEventListener("click", async () => {
  const user = auth.currentUser;
  if (!user) return alert("Debes iniciar sesión para subir archivos");

  const file = uploadFileInput.files[0];
  if (!file) return alert("Selecciona un archivo para subir");

  const storageRef = ref(storage, `shared_files/${file.name}`);
  await uploadBytes(storageRef, file);

  alert("Archivo subido correctamente");
  uploadFileInput.value = "";
  listarArchivos();
});

// Listar archivos
async function listarArchivos() {
  fileList.innerHTML = "Cargando archivos...";
  const listRef = ref(storage, "shared_files/");

  try {
    const res = await listAll(listRef);
    if (res.items.length === 0) {
      fileList.innerHTML = "No hay archivos disponibles.";
      return;
    }

    fileList.innerHTML = "";
    for (const itemRef of res.items) {
      const url = await getDownloadURL(itemRef);
      const div = document.createElement("div");
      div.classList.add("file-item");
      div.innerHTML = `<a href="${url}" target="_blank" rel="noopener noreferrer">${itemRef.name}</a>`;
      fileList.appendChild(div);
    }
  } catch (error) {
    fileList.innerHTML = "Error al cargar archivos: " + error.message;
  }
}
