// ===============================
// VARIABLES PRINCIPALES
// ===============================
let username = localStorage.getItem("username");
let score = 0;
let level = 1;
let stars = 0;

// 🔐 CONTRASEÑA MAESTRO
const TEACHER_PASSWORD = "161286";

// 💬 MENSAJES MOTIVADORES
const messages = [
  "🔥 Excellent job",
  "⭐ You're doing great",
  "👏 Keep it up",
  "💪 You can do it",
  "🎯 Perfect"
];

// ===============================
// 🔊 SONIDOS (RUTA CORRECTA GITHUB)
// ===============================
let soundCorrect;
let soundError;
let soundLevel;
let audioUnlocked = false;

function initSounds() {
  // ⚠️ CAMBIA "InglesParaTodos" POR EL NOMBRE EXACTO DE TU REPOSITORIO
  soundCorrect = new Audio("/InglesParaTodos/sounds/correct.mp3");
  soundError   = new Audio("/InglesParaTodos/sounds/wrong.mp3");
  soundLevel   = new Audio("/InglesParaTodos/sounds/levelup.mp3");

  soundCorrect.volume = 1;
  soundError.volume = 1;
  soundLevel.volume = 1;

  console.log("🔊 Sonidos listos");
}

// 🔓 DESBLOQUEAR AUDIO CON PRIMER CLIC
function unlockAudio() {
  if (audioUnlocked) return;

  [soundCorrect, soundError, soundLevel].forEach(sound => {
    sound.play().then(() => {
      sound.pause();
      sound.currentTime = 0;
    }).catch(() => {});
  });

  audioUnlocked = true;
  console.log("🔓 Audio desbloqueado");
}

// ===============================
// INICIO
// ===============================
document.addEventListener("DOMContentLoaded", () => {

  initSounds();

  const loginCard = document.getElementById("loginCard");
  const mainContent = document.getElementById("mainContent");
  const nav = document.getElementById("nav");

  const usernameInput = document.getElementById("usernameInput");
  const emailInput = document.getElementById("emailInput");
  const gradeInput = document.getElementById("gradeInput");
  const groupInput = document.getElementById("groupInput");
  const loginBtn = document.getElementById("loginBtn");
  const logoutBtn = document.getElementById("logoutBtn");

  const hamburger = document.getElementById("hamburger");
  const themeToggle = document.getElementById("themeToggle");

  const openTeacher = document.getElementById("openTeacher");
  const teacherPanel = document.getElementById("teacherPanel");
  const closeTeacher = document.getElementById("closeTeacher");
  const exportExcel = document.getElementById("exportExcel");

  const startBtn = document.getElementById("startGame");
  const checkBtn = document.getElementById("checkAnswer");
  const questionText = document.getElementById("questionText");
  const answerInput = document.getElementById("answerInput");
  const scoreText = document.getElementById("scoreText");
  const levelText = document.getElementById("levelText");
  const starsText = document.getElementById("starsText");
  const medalText = document.getElementById("medalText");
  const messageBox = document.getElementById("messageBox");

  if (username) {
    loginCard.style.display = "none";
    mainContent.style.display = "block";
    loadProgress();
  }

  // JUEGO
  const questions = [
    { en: "Hello", es: "Hola" },
    { en: "Goodbye", es: "Adiós" },
    { en: "Please", es: "Por favor" },
    { en: "Thank you", es: "Gracias" }
  ];

  let currentQuestion = null;

  startBtn.addEventListener("click", () => {
    unlockAudio();

    currentQuestion = questions[Math.floor(Math.random() * questions.length)];
    questionText.textContent = `¿Cómo se dice "${currentQuestion.en}" en español?`;
    answerInput.value = "";
    answerInput.focus();
  });

  checkBtn.addEventListener("click", () => {
    if (!currentQuestion) return;

    const userAnswer = answerInput.value.trim().toLowerCase();

    if (userAnswer === currentQuestion.es.toLowerCase()) {
      score += 5;
      stars++;

      soundCorrect.currentTime = 0;
      soundCorrect.play();

      const msg = messages[Math.floor(Math.random() * messages.length)];
      messageBox.textContent = msg;

    } else {
      soundError.currentTime = 0;
      soundError.play();

      messageBox.textContent = "❌ Incorrecto";
    }

    if (score >= level * 20) {
      level++;

      soundLevel.currentTime = 0;
      soundLevel.play();

      messageBox.textContent = "🎉 Subiste de nivel";
    }

    assignMedal();
    saveProgress();
    updateStudentProgress();

    scoreText.textContent = score + " puntos";
    levelText.textContent = "Nivel " + level;
    starsText.textContent = "⭐ Estrellas: " + stars;

    currentQuestion = null;
  });

});

// ===============================
// 💾 PROGRESO Y MEDALLAS
// ===============================
function saveProgress() {
  if (!username) return;
  localStorage.setItem(`user_${username}_score`, score);
  localStorage.setItem(`user_${username}_level`, level);
  localStorage.setItem(`user_${username}_stars`, stars);
}

function loadProgress() {
  score = parseInt(localStorage.getItem(`user_${username}_score`)) || 0;
  level = parseInt(localStorage.getItem(`user_${username}_level`)) || 1;
  stars = parseInt(localStorage.getItem(`user_${username}_stars`)) || 0;
}

function assignMedal() {
  const medalText = document.getElementById("medalText");

  if (level >= 3) medalText.textContent = "🥇 Medalla Oro";
  else if (level === 2) medalText.textContent = "🥈 Medalla Plata";
  else medalText.textContent = "🥉 Medalla Bronce";
}
