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
let timeWorked = 0;
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
// 🌙 MODO OSCURO (ARREGLADO)
// ===============================
function applyDarkMode() {
  const dark = localStorage.getItem("darkMode") === "true";
  document.body.classList.toggle("dark", dark);
}

// ===============================
// RESPALDO AUTOMÁTICO
// ===============================
function backupAllStudents() {
  let students = [];

  for (let key in localStorage) {
    if (key.startsWith("user_")) {
      const data = JSON.parse(localStorage.getItem(key));
      if (data) students.push(data);
    }
  }

  localStorage.setItem("backupStudents", JSON.stringify(students));
}

// ===============================
// RESTAURAR RESPALDO SI SE BORRÓ TODO
// ===============================
function restoreBackupIfNeeded() {
  let hasStudents = false;

  for (let key in localStorage) {
    if (key.startsWith("user_")) {
      hasStudents = true;
      break;
    }
  }

  if (!hasStudents) {
    const backup = JSON.parse(localStorage.getItem("backupStudents"));

    if (backup && backup.length > 0) {
      backup.forEach(s => {
        localStorage.setItem(`user_${s.username}`, JSON.stringify(s));
      });

      alert("🔄 Progreso restaurado automáticamente");
    }
  }
}

restoreBackupIfNeeded();

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

  applyDarkMode();

  const darkBtn = document.getElementById("darkModeBtn");
  if (darkBtn) {
    darkBtn.addEventListener("click", () => {
      const enabled = document.body.classList.toggle("dark");
      localStorage.setItem("darkMode", enabled);
    });
  }

  const loginCard = document.getElementById("loginCard");
  const mainContent = document.getElementById("mainContent");
  const teacherPanel = document.getElementById("teacherPanel");
  const teacherLogin = document.getElementById("teacherLogin");

  const logoutBtn = document.getElementById("logoutBtn");

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

  const scoreText = document.getElementById("scoreText");
  const levelText = document.getElementById("levelText");
  const starsText = document.getElementById("starsText");
  const timeText  = document.getElementById("timeText");

  const feedback = document.getElementById("feedback");

  // 🍔 MENÚ HAMBURGUESA
  const hamburger = document.getElementById("hamburger");
  const nav = document.getElementById("nav");

  if (hamburger && nav) {
    hamburger.addEventListener("click", () => {
      nav.style.display = (nav.style.display === "block") ? "none" : "block";
    });
  }

  // 👨‍🏫 BOTÓN MODO MAESTRO
  const openTeacherBtn = document.getElementById("openTeacherBtn");

  openTeacherBtn.addEventListener("click", () => {
    loginCard.style.display = "none";
    mainContent.style.display = "none";
    teacherLogin.style.display = "block";
  });

  // 🔐 LOGIN MAESTRO
  const teacherUser = document.getElementById("teacherUser");
  const teacherPass = document.getElementById("teacherPass");
  const teacherLoginBtn = document.getElementById("teacherLoginBtn");

  teacherLoginBtn.addEventListener("click", () => {
    if (
      teacherUser.value === TEACHER_USER &&
      teacherPass.value === TEACHER_PASS
    ) {
      teacherLogged = true;
      teacherLogin.style.display = "none";
      teacherPanel.style.display = "block";
      loadTeacherPanel();
    } else {
      alert("❌ Usuario o contraseña incorrectos");
    }
  });

  // ❌ CERRAR SESIÓN MAESTRO
  const closeTeacher = document.getElementById("closeTeacher");

  closeTeacher.addEventListener("click", () => {
    teacherLogged = false;
    teacherPanel.style.display = "none";
    loginCard.style.display = "block";
  });

  // AUTO LOGIN ALUMNO
  if (username && grade && group) {
    loginCard.style.display = "none";
    mainContent.style.display = "block";
    userDisplay.textContent = "👤 Welcome " + username;

    loadProgress();
    startTimer();
    registerConnectedUser();
  }

  // LOGIN ALUMNO
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

  // ▶️ INICIAR EJERCICIO
  startBtn.addEventListener("click", () => {
    currentQuestion = questions[Math.floor(Math.random() * questions.length)];
    questionText.textContent = currentQuestion.q;
    feedback.textContent = "";
    answerInput.value = "";
    answerInput.focus();
  });

  // ✅ RESPONDER
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

  // 🚪 CERRAR SESIÓN ALUMNO
  logoutBtn.addEventListener("click", () => {
    removeConnectedUser();
    stopTimer();

    localStorage.removeItem("username");
    localStorage.removeItem("grade");
    localStorage.removeItem("group");

    location.reload();
  });

  // 🔄 AUTO ACTUALIZAR MAESTRO
  setInterval(() => {
    if (teacherLogged) {
      loadTeacherPanel();
    }
  }, 5000);

});

// ===============================
// ⏱ TIEMPO (ARREGLADO PROFESIONAL)
// ===============================
function startTimer() {
  if (timerInterval) return;

  timerInterval = setInterval(() => {
    timeWorked++; // ahora cuenta en SEGUNDOS
    updateDisplay();
    saveProgress();
  }, 1000); // cada segundo
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
  backupAllStudents();
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

function updateDisplay() {
  document.getElementById("scoreText").textContent = score + " puntos";
  document.getElementById("levelText").textContent = "Nivel " + level;
  document.getElementById("starsText").textContent = "⭐ Estrellas: " + stars;

  const timeText = document.getElementById("timeText");
  if (timeText) {
    timeText.textContent = "⏱ Tiempo: " + timeWorked + " min";
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
// 👨‍🏫 PANEL MAESTRO (CON TIEMPO)
// ===============================
function loadTeacherPanel() {
  const table = document.getElementById("studentsTable");
  const connectedList = document.getElementById("connectedList");
  const groupSelect = document.getElementById("groupSelect");

  table.innerHTML = "";
  connectedList.innerHTML = "";

  let groups = new Set();
  let students = [];

  for (let key in localStorage) {
    if (key.startsWith("user_")) {
      const s = JSON.parse(localStorage.getItem(key));
      if (s) students.push(s);
    }
  }

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
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${s.username}</td>
      <td>${s.grade}</td>
      <td>${s.group}</td>
      <td>${s.score}</td>
      <td>${s.level}</td>
      <td>${s.stars}</td>
      <td>${s.timeWorked || 0} min</td>
    `;
    table.appendChild(row);
  });

  connectedUsers.forEach(u => {
    const li = document.createElement("li");
    li.textContent = `${u.username} (${u.grade}${u.group})`;
    connectedList.appendChild(li);
  });
}
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
let timeWorked = 0;
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
// 🌙 MODO OSCURO (ARREGLADO)
// ===============================
function applyDarkMode() {
  const dark = localStorage.getItem("darkMode") === "true";
  document.body.classList.toggle("dark", dark);
}

// ===============================
// RESPALDO AUTOMÁTICO
// ===============================
function backupAllStudents() {
  let students = [];

  for (let key in localStorage) {
    if (key.startsWith("user_")) {
      const data = JSON.parse(localStorage.getItem(key));
      if (data) students.push(data);
    }
  }

  localStorage.setItem("backupStudents", JSON.stringify(students));
}

// ===============================
// RESTAURAR RESPALDO SI SE BORRÓ TODO
// ===============================
function restoreBackupIfNeeded() {
  let hasStudents = false;

  for (let key in localStorage) {
    if (key.startsWith("user_")) {
      hasStudents = true;
      break;
    }
  }

  if (!hasStudents) {
    const backup = JSON.parse(localStorage.getItem("backupStudents"));

    if (backup && backup.length > 0) {
      backup.forEach(s => {
        localStorage.setItem(`user_${s.username}`, JSON.stringify(s));
      });

      alert("🔄 Progreso restaurado automáticamente");
    }
  }
}

restoreBackupIfNeeded();

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

  applyDarkMode();

  const darkBtn = document.getElementById("darkModeBtn");
  if (darkBtn) {
    darkBtn.addEventListener("click", () => {
      const enabled = document.body.classList.toggle("dark");
      localStorage.setItem("darkMode", enabled);
    });
  }

  const loginCard = document.getElementById("loginCard");
  const mainContent = document.getElementById("mainContent");
  const teacherPanel = document.getElementById("teacherPanel");
  const teacherLogin = document.getElementById("teacherLogin");

  const logoutBtn = document.getElementById("logoutBtn");

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

  const scoreText = document.getElementById("scoreText");
  const levelText = document.getElementById("levelText");
  const starsText = document.getElementById("starsText");
  const timeText  = document.getElementById("timeText");

  const feedback = document.getElementById("feedback");

  // 🍔 MENÚ HAMBURGUESA
  const hamburger = document.getElementById("hamburger");
  const nav = document.getElementById("nav");

  if (hamburger && nav) {
    hamburger.addEventListener("click", () => {
      nav.style.display = (nav.style.display === "block") ? "none" : "block";
    });
  }

  // 👨‍🏫 BOTÓN MODO MAESTRO
  const openTeacherBtn = document.getElementById("openTeacherBtn");

  openTeacherBtn.addEventListener("click", () => {
    loginCard.style.display = "none";
    mainContent.style.display = "none";
    teacherLogin.style.display = "block";
  });

  // 🔐 LOGIN MAESTRO
  const teacherUser = document.getElementById("teacherUser");
  const teacherPass = document.getElementById("teacherPass");
  const teacherLoginBtn = document.getElementById("teacherLoginBtn");

  teacherLoginBtn.addEventListener("click", () => {
    if (
      teacherUser.value === TEACHER_USER &&
      teacherPass.value === TEACHER_PASS
    ) {
      teacherLogged = true;
      teacherLogin.style.display = "none";
      teacherPanel.style.display = "block";
      loadTeacherPanel();
    } else {
      alert("❌ Usuario o contraseña incorrectos");
    }
  });

  // ❌ CERRAR SESIÓN MAESTRO
  const closeTeacher = document.getElementById("closeTeacher");

  closeTeacher.addEventListener("click", () => {
    teacherLogged = false;
    teacherPanel.style.display = "none";
    loginCard.style.display = "block";
  });

  // AUTO LOGIN ALUMNO
  if (username && grade && group) {
    loginCard.style.display = "none";
    mainContent.style.display = "block";
    userDisplay.textContent = "👤 Welcome " + username;

    loadProgress();
    startTimer();
    registerConnectedUser();
  }

  // LOGIN ALUMNO
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

  // ▶️ INICIAR EJERCICIO
  startBtn.addEventListener("click", () => {
    currentQuestion = questions[Math.floor(Math.random() * questions.length)];
    questionText.textContent = currentQuestion.q;
    feedback.textContent = "";
    answerInput.value = "";
    answerInput.focus();
  });

  // ✅ RESPONDER
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

  // 🚪 CERRAR SESIÓN ALUMNO
  logoutBtn.addEventListener("click", () => {
    removeConnectedUser();
    stopTimer();

    localStorage.removeItem("username");
    localStorage.removeItem("grade");
    localStorage.removeItem("group");

    location.reload();
  });

  // 🔄 AUTO ACTUALIZAR MAESTRO
  setInterval(() => {
    if (teacherLogged) {
      loadTeacherPanel();
    }
  }, 5000);

});

// ===============================
// ⏱ TIEMPO (ARREGLADO)
// ===============================
function startTimer() {
  if (timerInterval) return;

  timerInterval = setInterval(() => {
    timeWorked++;
    updateDisplay();
    saveProgress();
  }, 60000);
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
  backupAllStudents();
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

function updateDisplay() {
  document.getElementById("scoreText").textContent = score + " puntos";
  document.getElementById("levelText").textContent = "Nivel " + level;
  document.getElementById("starsText").textContent = "⭐ Estrellas: " + stars;

  const timeText = document.getElementById("timeText");
  if (timeText) {
    const minutes = Math.floor(timeWorked / 60);
    const seconds = timeWorked % 60;
    timeText.textContent = `⏱ Tiempo: ${minutes} min ${seconds} s`;
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
// 👨‍🏫 PANEL MAESTRO (CON TIEMPO)
// ===============================
function loadTeacherPanel() {
  const table = document.getElementById("studentsTable");
  const connectedList = document.getElementById("connectedList");
  const groupSelect = document.getElementById("groupSelect");

  table.innerHTML = "";
  connectedList.innerHTML = "";

  let groups = new Set();
  let students = [];

  for (let key in localStorage) {
    if (key.startsWith("user_")) {
      const s = JSON.parse(localStorage.getItem(key));
      if (s) students.push(s);
    }
  }

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
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${s.username}</td>
      <td>${s.grade}</td>
      <td>${s.group}</td>
      <td>${s.score}</td>
      <td>${s.level}</td>
      <td>${s.stars}</td>
      <td>${s.timeWorked || 0} min</td>
    `;
    table.appendChild(row);
  });

  connectedUsers.forEach(u => {
    const li = document.createElement("li");
    li.textContent = `${u.username} (${u.grade}${u.group})`;
    connectedList.appendChild(li);
  });
}
