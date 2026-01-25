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
// 🔊 SONIDOS (RUTA CORRECTA PARA TU SITIO)
// ===============================
let soundCorrect = new Audio("https://pepejoeck-codeclass.github.io/ingles-para-todos/sounds/correct.mp3");
let soundError   = new Audio("https://pepejoeck-codeclass.github.io/ingles-para-todos/sounds/wrong.mp3");
let soundLevel   = new Audio("https://pepejoeck-codeclass.github.io/ingles-para-todos/sounds/levelup.mp3");

let audioUnlocked = false;

// 🔓 DESBLOQUEAR AUDIO
function unlockAudio() {
  if (audioUnlocked) return;

  [soundCorrect, soundError, soundLevel].forEach(sound => {
    sound.play().then(() => {
      sound.pause();
      sound.currentTime = 0;
    }).catch(() => {});
  });

  audioUnlocked = true;
  console.log("🔊 Audio desbloqueado correctamente");
}

// ===============================
// INICIO
// ===============================
document.addEventListener("DOMContentLoaded", () => {

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
  const messageBox = document.getElementById("messageBox") || document.createElement("div");

  if (username) {
    loginCard.style.display = "none";
    mainContent.style.display = "block";
    loadProgress();
  }

  // ===== MENÚ HAMBURGUESA =====
  hamburger.addEventListener("click", () => {
    nav.classList.toggle("open");
  });

  // ===== TEMA OSCURO =====
  themeToggle.addEventListener("click", () => {
    document.body.classList.toggle("dark");
  });

  // ===== LOGIN =====
  loginBtn.addEventListener("click", () => {
    const name = usernameInput.value.trim();
    const email = emailInput.value.trim();

    if (!name && !email) {
      alert("Escribe tu nombre o tu correo");
      return;
    }

    username = email ? email.toLowerCase() : name;
    localStorage.setItem("username", username);

    loginCard.style.display = "none";
    mainContent.style.display = "block";

    loadProgress();
    registerStudent();
  });

  logoutBtn.addEventListener("click", () => {
    if (confirm("¿Quieres cerrar sesión y cambiar de usuario?")) {
      localStorage.removeItem("username");
      location.reload();
    }
  });

  // ===== JUEGO =====
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
      messageBox.textContent = msg + " ⭐ +1 estrella";

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

  // ===== MODO MAESTRO =====
  openTeacher.addEventListener("click", (e) => {
    e.preventDefault();

    const pass = prompt("🔐 Ingresa la contraseña del maestro:");
    if (pass !== TEACHER_PASSWORD) {
      alert("❌ Contraseña incorrecta");
      return;
    }
    teacherPanel.style.display = "block";
    loadStudentsForTeacher();
  });

  closeTeacher.addEventListener("click", () => {
    teacherPanel.style.display = "none";
  });

  // ===== EXPORTAR EXCEL =====
  exportExcel.addEventListener("click", () => {

    let students = JSON.parse(localStorage.getItem("studentsList")) || [];
    if (students.length === 0) {
      alert("No hay alumnos para exportar");
      return;
    }

    let csv = "Alumno,Grado,Grupo,Puntaje,Nivel,Estrellas\n";
    students.forEach(s => {
      csv += `${s.username},${s.grade},${s.group},${s.score},${s.level},${s.stars || 0}\n`;
    });

    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "resultados_alumnos.csv";
    a.click();

    URL.revokeObjectURL(url);
  });

});

// ===============================
// 💾 PROGRESO
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

// ===============================
// 🏅 MEDALLAS
// ===============================
function assignMedal() {
  const medalText = document.getElementById("medalText");
  medalText.textContent =
    level >= 3 ? "🥇 Medalla Oro" : level === 2 ? "🥈 Medalla Plata" : "🥉 Medalla Bronce";
}

// ===============================
// 👨‍🎓 REGISTRAR ALUMNOS
// ===============================
// ... (rest remains the same)
