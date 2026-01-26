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

let selectedGroupFilter = "";
let groupsLoadedOnce = false;

// ===============================
// 🔐 RESPALDO
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
// 🔄 RESTAURAR SI SE BORRÓ TODO
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
// 🧠 EJERCICIOS (HOLA / ADIÓS / POR FAVOR / GRACIAS)
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

  const feedback = document.getElementById("feedback");
  const groupSelect = document.getElementById("groupSelect");

  // ===============================
  // 🍔 MENÚ HAMBURGUESA
  // ===============================
  const hamburger = document.getElementById("hamburger");
  const nav = document.getElementById("nav");

  if (hamburger && nav) {
    hamburger.addEventListener("click", () => {
      nav.style.display = (nav.style.display === "block") ? "none" : "block";
    });
  }

  // ===============================
  // AUTO LOGIN
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
  // ✅ RESPONDER EJERCICIO
  // ===============================
  checkBtn.addEventListener("click", () => {
    if (!currentQuestion) return;

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
  // FILTRO GRUPO MAESTRO
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
    saveProgress();
  }, 60000);
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
}

// ===============================
// 👀 CONECTADOS
// ===============================
function registerConnectedUser() {
  const user = { username, grade, group };
  connectedUsers.push(user);
  localStorage.setItem("connectedUsers", JSON.stringify(connectedUsers));
}
