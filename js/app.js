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

const TEACHER_USER = "Jose de Jesus Ramos Flores";
const TEACHER_PASS = "161286";

const messages = [
  "🔥 Excellent job",
  "⭐ You're doing great",
  "👏 Keep it up",
  "💪 You can do it",
  "🎯 Perfect"
];

let selectedGroupFilter = "";
let groupsLoadedOnce = false;   // 🔥 CLAVE PARA NO RESETEAR FILTRO

// ===============================
// 🔐 RESTAURAR RESPALDO SI SE BORRÓ TODO
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
    if (backup) {
      backup.forEach(s => {
        localStorage.setItem(`user_${s.username}`, JSON.stringify(s));
      });
      alert("🔄 Progreso restaurado automáticamente desde respaldo");
    }
  }
}

restoreBackupIfNeeded();

// ===============================
// INICIO
// ===============================
document.addEventListener("DOMContentLoaded", () => {

  const loginCard = document.getElementById("loginCard");
  const teacherLogin = document.getElementById("teacherLogin");
  const mainContent = document.getElementById("mainContent");
  const teacherPanel = document.getElementById("teacherPanel");

  const openTeacherBtn = document.getElementById("openTeacherBtn");
  const teacherLoginBtn = document.getElementById("teacherLoginBtn");
  const closeTeacher = document.getElementById("closeTeacher");
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
  const medalText = document.getElementById("medalText");
  const timeText = document.getElementById("timeText");

  const feedback = document.getElementById("feedback");

  const groupSelect = document.getElementById("groupSelect");

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
      alert("Completa nombre (o correo), grado y grupo");
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
  // BOTÓN MODO MAESTRO
  // ===============================
  openTeacherBtn.addEventListener("click", () => {
    loginCard.style.display = "none";
    teacherLogin.style.display = "block";
  });

  // ===============================
  // LOGIN MAESTRO
  // ===============================
  teacherLoginBtn.addEventListener("click", () => {
    const user = document.getElementById("teacherUser").value;
    const pass = document.getElementById("teacherPass").value;

    if (user === TEACHER_USER && pass === TEACHER_PASS) {
      teacherLogin.style.display = "none";
      teacherPanel.style.display = "block";

      loadTeacherPanel();
      setInterval(loadTeacherPanel, 5000);
    } else {
      alert("Usuario o contraseña incorrectos");
    }
  });

  // ===============================
  // CERRAR SESIÓN MAESTRO
  // ===============================
  closeTeacher.addEventListener("click", () => {
    teacherPanel.style.display = "none";
    teacherLogin.style.display = "none";
    loginCard.style.display = "block";
  });

  // ===============================
  // CERRAR SESIÓN ALUMNO
  // ===============================
  logoutBtn.addEventListener("click", () => {
    localStorage.removeItem("username");
    localStorage.removeItem("grade");
    localStorage.removeItem("group");

    stopTimer();
    removeConnectedUser();

    location.reload();
  });

  // ===============================
  // FILTRO POR GRUPO (NO SE BORRA JAMÁS)
  // ===============================
  groupSelect.addEventListener("change", () => {
    selectedGroupFilter = groupSelect.value;
    updateTeacherTableOnly();
  });

});

// ===============================
// ⏱ TIEMPO
// ===============================
function startTimer() {
  timerInterval = setInterval(() => {
    timeWorked++;
    document.getElementById("timeText").textContent = "⏱ Tiempo: " + timeWorked + " min";
    saveProgress();
  }, 60000);
}

function stopTimer() {
  clearInterval(timerInterval);
}

// ===============================
// 💾 PROGRESO + RESPALDO
// ===============================
function saveProgress() {
  const data = { username, grade, group, score, level, stars, timeWorked };
  localStorage.setItem(`user_${username}`, JSON.stringify(data));

  // 🔐 RESPALDO AUTOMÁTICO
  backupAllStudents();
}

function loadProgress() {
  const data = JSON.parse(localStorage.getItem(`user_${username}`));
  if (!data) return;

  score = data.score;
  level = data.level;
  stars = data.stars;
  timeWorked = data.timeWorked || 0;

  document.getElementById("scoreText").textContent = score + " puntos";
  document.getElementById("levelText").textContent = "Nivel " + level;
  document.getElementById("starsText").textContent = "⭐ Estrellas: " + stars;
  document.getElementById("timeText").textContent = "⏱ Tiempo: " + timeWorked + " min";

  assignMedal();
}

// ===============================
// 🔐 RESPALDO GENERAL
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
// 🏅 MEDALLAS
// ===============================
function assignMedal() {
  const medalText = document.getElementById("medalText");

  if (level >= 3) medalText.textContent = "🥇 Medalla Oro";
  else if (level === 2) medalText.textContent = "🥈 Medalla Plata";
  else medalText.textContent = "🥉 Medalla Bronce";
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
  const studentsTable = document.getElementById("studentsTable");
  const connectedList = document.getElementById("connectedList");
  const groupSelect = document.getElementById("groupSelect");

  studentsTable.innerHTML = "";
  connectedList.innerHTML = "";

  connectedUsers = JSON.parse(localStorage.getItem("connectedUsers")) || [];

  connectedUsers.forEach(u => {
    const li = document.createElement("li");
    li.textContent = `${u.username} (${u.grade} ${u.group})`;
    connectedList.appendChild(li);
  });

  let students = [];

  for (let key in localStorage) {
    if (key.startsWith("user_")) {
      const data = JSON.parse(localStorage.getItem(key));
      if (data) students.push(data);
    }
  }

  // 🔥 SOLO LLENAR GRUPOS UNA VEZ
  if (!groupsLoadedOnce) {
    let groups = [...new Set(students.map(s => s.group))];
    groupSelect.innerHTML = `<option value="">Todos los grupos</option>`;
    groups.forEach(g => {
      const opt = document.createElement("option");
      opt.value = g;
      opt.textContent = g;
      groupSelect.appendChild(opt);
    });
    groupsLoadedOnce = true;
  }

  updateTeacherTableOnly();
}

// ===============================
// 🔄 ACTUALIZAR SOLO TABLA (NO FILTRO)
// ===============================
function updateTeacherTableOnly() {
  const studentsTable = document.getElementById("studentsTable");
  studentsTable.innerHTML = "";

  let students = [];

  for (let key in localStorage) {
    if (key.startsWith("user_")) {
      const data = JSON.parse(localStorage.getItem(key));
      if (data) students.push(data);
    }
  }

  let filtered = students;
  if (selectedGroupFilter) {
    filtered = students.filter(s => s.group === selectedGroupFilter);
  }

  filtered.sort((a, b) => b.score - a.score);

  filtered.forEach(s => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${s.username}</td>
      <td>${s.grade}</td>
      <td>${s.group}</td>
      <td>${s.score}</td>
      <td>${s.level}</td>
      <td>${s.stars}</td>
      <td>${s.timeWorked} min</td>
    `;
    studentsTable.appendChild(tr);
  });

  drawChart(filtered);
}

// ===============================
// 📈 GRÁFICA
// ===============================
function drawChart(students) {
  const ctx = document.getElementById("progressChart").getContext("2d");

  const labels = students.map(s => s.username);
  const data = students.map(s => s.score);

  if (window.myChart) window.myChart.destroy();

  window.myChart = new Chart(ctx, {
    type: "bar",
    data: {
      labels,
      datasets: [{
        label: "Puntaje",
        data,
        backgroundColor: "rgba(54, 162, 235, 0.6)"
      }]
    }
  });
}
