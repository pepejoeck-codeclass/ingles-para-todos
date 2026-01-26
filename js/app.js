// ===============================
// 🔊 SONIDOS
// ===============================
const soundCorrect = new Audio("assets/sounds/correct.mp3");
const soundError   = new Audio("assets/sounds/wrong.mp3");
const soundLevel   = new Audio("assets/sounds/levelup.mp3");

// ===============================
// VARIABLES GLOBALES
// ===============================
let username = localStorage.getItem("username");
let grade = localStorage.getItem("grade");
let group = localStorage.getItem("group");

let score = 0;
let level = 1;
let stars = 0;
let timeWorked = 0; // en segundos
let timerInterval = null;

let connectedUsers = JSON.parse(localStorage.getItem("connectedUsers")) || [];

// ===============================
// 🔐 DATOS MAESTRO
// ===============================
const TEACHER_USER = "Jose de Jesus Ramos Flores";
const TEACHER_PASS = "161286";

let teacherLogged = false;
let selectedGroup = "";

// ===============================
// 🧠 EJERCICIOS
// ===============================
const questions = [
  { q: "How do you say 'Hola' in English?", a: "hello" },
  { q: "How do you say 'Adiós' in English?", a: "goodbye" },
  { q: "How do you say 'Por favor' in English?", a: "please" },
  { q: "How do you say 'Gracias' in English?", a: "thank you" }
];

let currentQuestion = null;

// ===============================
// INICIO
// ===============================
document.addEventListener("DOMContentLoaded", () => {

  const loginCard = document.getElementById("loginCard");
  const mainContent = document.getElementById("mainContent");
  const teacherPanel = document.getElementById("teacherPanel");
  const teacherLogin = document.getElementById("teacherLogin");

  const logoutBtn = document.getElementById("logoutBtn");
  const openTeacherBtn = document.getElementById("openTeacherBtn");

  const loginBtn = document.getElementById("loginBtn");
  const gradeInput = document.getElementById("gradeInput");
  const groupInput = document.getElementById("groupInput");
  const usernameInput = document.getElementById("usernameInput");
  const emailInput = document.getElementById("emailInput");

  const userDisplay = document.getElementById("userDisplay");

  const startBtn = document.getElementById("startGame");
  const checkBtn = document.getElementById("checkAnswer");
  const questionText = document.getElementById("questionText");
  const answerInput = document.getElementById("answerInput");

  const feedback = document.getElementById("feedback");

  const teacherUser = document.getElementById("teacherUser");
  const teacherPass = document.getElementById("teacherPass");
  const teacherLoginBtn = document.getElementById("teacherLoginBtn");
  const closeTeacher = document.getElementById("closeTeacher");

  // ===============================
  // 🍔 MENÚ HAMBURGUESA
// ===============================
  const hamburger = document.getElementById("hamburger");
  const nav = document.getElementById("nav");

  hamburger.addEventListener("click", () => {
    nav.style.display = (nav.style.display === "block") ? "none" : "block";
  });

  // ===============================
  // 🌙 MODO OSCURO (ARREGLADO)
  // ===============================
  const themeToggle = document.getElementById("themeToggle");

  if (localStorage.getItem("theme") === "dark") {
    document.body.classList.add("dark");
  }

  themeToggle.addEventListener("click", () => {
    document.body.classList.toggle("dark");

    if (document.body.classList.contains("dark")) {
      localStorage.setItem("theme", "dark");
    } else {
      localStorage.setItem("theme", "light");
    }
  });

  // ===============================
  // 👨‍🏫 BOTÓN MODO MAESTRO
  // ===============================
  openTeacherBtn.addEventListener("click", () => {
    loginCard.style.display = "none";
    mainContent.style.display = "none";
    teacherLogin.style.display = "block";
  });

  // ===============================
  // 🔐 LOGIN MAESTRO
  // ===============================
  teacherLoginBtn.addEventListener("click", () => {
    if (teacherUser.value === TEACHER_USER && teacherPass.value === TEACHER_PASS) {
      teacherLogged = true;
      teacherLogin.style.display = "none";
      teacherPanel.style.display = "block";
      loadTeacherPanel();
    } else {
      alert("❌ Usuario o contraseña incorrectos");
    }
  });

  closeTeacher.addEventListener("click", () => {
    teacherLogged = false;
    teacherPanel.style.display = "none";
    loginCard.style.display = "block";
  });

  // ===============================
  // AUTO LOGIN ALUMNO
  // ===============================
  if (username && grade && group) {
    loginCard.style.display = "none";
    mainContent.style.display = "block";
    userDisplay.textContent = "👤 Welcome " + username;

    loadProgress();
    startTimer();
    registerConnectedUser();
  }

  // ===============================
  // LOGIN ALUMNO
  // ===============================
  loginBtn.addEventListener("click", () => {
    const name = usernameInput.value.trim() || emailInput.value.trim();
    const g = gradeInput.value.trim();
    const gr = groupInput.value.trim();

    if (!name || !g || !gr) {
      alert("Completa nombre, grado y grupo");
      return;
    }

    username = name;
    grade = g;
    group = gr;

    localStorage.setItem("username", username);
    localStorage.setItem("grade", grade);
    localStorage.setItem("group", group);

    loginCard.style.display = "none";
    mainContent.style.display = "block";

    userDisplay.textContent = "👤 Welcome " + username;

    loadProgress();
    startTimer();
    registerConnectedUser();
  });

  // ===============================
  // ▶️ INICIAR EJERCICIO
  // ===============================
  startBtn.addEventListener("click", () => {
    currentQuestion = questions[Math.floor(Math.random() * questions.length)];
    questionText.textContent = currentQuestion.q;
    feedback.textContent = "";
    answerInput.value = "";
    answerInput.focus();
  });

  // ===============================
  // ✅ RESPONDER
  // ===============================
  checkBtn.addEventListener("click", () => {
    if (!currentQuestion) {
      alert("Primero presiona 'Iniciar ejercicio'");
      return;
    }

    const answer = answerInput.value.trim().toLowerCase();

    if (answer === currentQuestion.a) {
      feedback.textContent = "🔥 Excellent job!";
      soundCorrect.play();

      score += 10;
      stars++;

      if (score % 50 === 0) {
        level++;
        soundLevel.play();
      }
    } else {
      feedback.textContent = "❌ Try again";
      soundError.play();
    }

    updateDisplay();
    saveProgress();
  });

  // ===============================
  // 🚪 CERRAR SESIÓN
  // ===============================
  logoutBtn.addEventListener("click", () => {
    removeConnectedUser();
    stopTimer();

    localStorage.removeItem("username");
    localStorage.removeItem("grade");
    localStorage.removeItem("group");

    location.reload();
  });

  // ===============================
  // 🔄 AUTO ACTUALIZAR PANEL MAESTRO
  // ===============================
  setInterval(() => {
    if (teacherLogged) loadTeacherPanel();
  }, 5000);

});

// ===============================
// ⏱ TIEMPO (FUNCIONANDO)
// ===============================
function startTimer() {
  if (timerInterval) return;

  timerInterval = setInterval(() => {
    timeWorked++; // segundos
    updateDisplay();
    saveProgress();
  }, 1000);
}

function stopTimer() {
  clearInterval(timerInterval);
  timerInterval = null;
}

// ===============================
// 💾 PROGRESO
// ===============================
function saveProgress() {
  const data = { username, grade, group, score, level, stars, timeWorked };
  localStorage.setItem(`user_${username}`, JSON.stringify(data));
}

function loadProgress() {
  const data = JSON.parse(localStorage.getItem(`user_${username}`));
  if (!data) return;

  score = data.score;
  level = data.level;
  stars = data.stars;
  timeWorked = data.timeWorked || 0;

  updateDisplay();
}

// ===============================
// 📊 MOSTRAR DATOS
// ===============================
function updateDisplay() {
  document.getElementById("scoreText").textContent = score + " puntos";
  document.getElementById("levelText").textContent = "Nivel " + level;
  document.getElementById("starsText").textContent = "⭐ Estrellas: " + stars;

  const timeText = document.getElementById("timeText");
  if (timeText) {
    const min = Math.floor(timeWorked / 60);
    const sec = timeWorked % 60;
    timeText.textContent = `⏱ Tiempo: ${min} min ${sec} s`;
  }
}

// ===============================
// 👀 CONECTADOS
// ===============================
function registerConnectedUser() {
  const user = { username, grade, group };
  connectedUsers.push(user);
  localStorage.setItem("connectedUsers", JSON.stringify(connectedUsers));
}

function removeConnectedUser() {
  connectedUsers = connectedUsers.filter(u => u.username !== username);
  localStorage.setItem("connectedUsers", JSON.stringify(connectedUsers));
}

// ===============================
// 👨‍🏫 PANEL MAESTRO
// ===============================
function loadTeacherPanel() {
  const table = document.getElementById("studentsTable");
  const connectedList = document.getElementById("connectedList");
  const groupSelect = document.getElementById("groupSelect");

  table.innerHTML = "";
  connectedList.innerHTML = "";

  let students = [];

  for (let key in localStorage) {
    if (key.startsWith("user_")) {
      const s = JSON.parse(localStorage.getItem(key));
      if (s) students.push(s);
    }
  }

  let groups = new Set();
  students.forEach(s => groups.add(s.group));

  if (groupSelect.options.length === 1) {
    groups.forEach(g => {
      const opt = document.createElement("option");
      opt.value = g;
      opt.textContent = g;
      groupSelect.appendChild(opt);
    });
  }

  groupSelect.onchange = () => {
    selectedGroup = groupSelect.value;
    loadTeacherPanel();
  };

  let filtered = selectedGroup
    ? students.filter(s => s.group === selectedGroup)
    : students;

  filtered.sort((a, b) => b.score - a.score);

  filtered.forEach(s => {
    const min = Math.floor((s.timeWorked || 0) / 60);
    const sec = (s.timeWorked || 0) % 60;

    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${s.username}</td>
      <td>${s.grade}</td>
      <td>${s.group}</td>
      <td>${s.score}</td>
      <td>${s.level}</td>
      <td>${s.stars}</td>
      <td>${min}m ${sec}s</td>
    `;
    table.appendChild(row);
  });

  connectedUsers.forEach(u => {
    const li = document.createElement("li");
    li.textContent = `${u.username} (${u.grade}${u.group})`;
    connectedList.appendChild(li);
  });
}
