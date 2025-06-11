let users = [];

function register() {
  const email = document.getElementById('regEmail').value;
  const pass = document.getElementById('regPass').value;
  if (!email.includes('@gmail.com')) {
    alert("Solo se permite Gmail");
    return;
  }
  users.push({ email, pass });
  alert("Registrado correctamente, ahora inicia sesión.");
}

function login() {
  const email = document.getElementById('loginEmail').value;
  const pass = document.getElementById('loginPass').value;
  const user = users.find(u => u.email === email && u.pass === pass);
  if (user) {
    document.getElementById('auth').style.display = 'none';
    document.getElementById('chatArea').style.display = 'flex';
  } else {
    alert("Credenciales incorrectas.");
  }
}

function sendMessage() {
  const input = document.getElementById('chatInput');
  const file = document.getElementById('fileInput').files[0];
  const messages = document.getElementById('messages');
  let msg = document.createElement('div');
  msg.className = 'message';

  if (file) {
    if (file.type.startsWith('image/')) {
      let img = document.createElement('img');
      img.src = URL.createObjectURL(file);
      img.style.maxWidth = '100%';
      msg.appendChild(img);
    } else if (file.type.startsWith('video/')) {
      let video = document.createElement('video');
      video.src = URL.createObjectURL(file);
      video.controls = true;
      video.style.maxWidth = '100%';
      msg.appendChild(video);
    }
  }

  if (input.value.trim() !== '') {
    msg.innerHTML += `<p>${input.value}</p>`;
  }

  if (msg.innerHTML === '') return;

  messages.appendChild(msg);
  input.value = '';
  document.getElementById('fileInput').value = '';
  messages.scrollTop = messages.scrollHeight;
}

function toggleTheme() {
  const body = document.body;
  const current = body.getAttribute("data-theme");
  body.setAttribute("data-theme", current === "light" ? "dark" : "light");
  document.getElementById('chatArea').classList.toggle('dark');
}
