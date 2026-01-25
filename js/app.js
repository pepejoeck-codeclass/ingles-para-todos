// ===============================
// INGLÉS PARA TODOS – APP.JS COMPLETO DESDE CERO
// Con sonidos, niveles y modo maestro con contraseña
// ===============================

// -------------------------------
// 🔊 RUTAS DE SONIDO (AUTOMÁTICAS PARA GITHUB PAGES)
// -------------------------------
const basePath = window.location.pathname.replace(/\/[^/]*$/, "/");

let soundCorrect = new Audio(basePath + "sounds/correct.mp3");
let soundError   = new Audio(basePath + "sounds/wrong.mp3");
let soundLevel   = new Audio(basePath + "sounds/levelup.mp3");

let audioUnlocked = false;

function unlockAudio() {
  if (audioUnlocked) return;

  [soundCorrect, soundError, soundLevel].forEach(sound => {
    sound.volume = 1;
    sound.play().then(() => {
      sound.pause();
      sound.currentTime = 0;
    }).catch(() => {});
  });

  audioUnlocked = true;
  console.log("🔊 Audio desbloqueado");
}

// -------------------------------
// VARIABLES PRINCIPALES
// -------------------------------
let username = localStorage.getItem("username");
let score = 0;
let level = 1;
let stars = 0;

// 🔐 CONTRASEÑA MAESTRO
const TEACHER_PASSWORD = "161286";

// 💬 MENSAJES
const messages = [
  "🔥 Excellent job",
  "⭐ You're doing great",
  "👏 Keep it up",
  "💪 You can do it",
  "🎯 Perfect"
];

// -------------------------------
// PREGUNTAS
// -------------------------------
const questions = [
  { en: "Hello", es: "hola" },
  { en: "Goodbye", es: "adiós" },
  { en: "Please", es: "por favor" },
  { en: "Thank you", es: "gracias" }
];

let currentQuestion = null;

// -------------------------------
// INICIO
// -------------------------------
document.addEventListener("DOMContentLoaded", () => {

  const loginCard = document.getElementById("loginCard");
  const mainContent = document.getElementById("mainContent");

  const usernameInput = document.getElementById("usernameInput");
  const emailInput = document.getElementById("emailInput");
  const gradeInput = document.getElementById("gradeInput");
  const groupInput = document.getElementById("groupInput");
  const loginBtn = document.getElementById("loginBtn");
  const logoutBtn = document.getElementById("logoutBtn");

  const startBtn = document.getElementById("startGame");
  const checkBtn = document.getElementById("checkAnswer");
  const questionText = document.getElementById("questionText");
  const answerInput = document.getElementById("answerInput");

  const scoreText = document.getElementById("scoreText");
  const levelText = document.getElementById("levelText");
  const starsText = document.getElementById("starsText");
  const medalText = document.getElementById("medalText");

  const openTeacher = document.getElementById("openTeacher");
  const teacherPanel = document.getElementById("teacherPanel");
  const closeTeacher = document.getElementById("closeTeacher");
  const exportExcel = document.getElementById("exportExcel");

  const messageBox = document.getElementById("messageBox") || document.createElement("div");

  // AUTO LOGIN
  if (username) {
    loginCard.style.display = "none";
    mainContent.style.display = "block";
    loadProgress();
  }

  // LOGIN
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

  // -------------------------------
  // INICIAR JUEGO
  // -------------------------------
  startBtn.addEventListener("click", () => {
    unlockAudio();

    currentQuestion = questions[Math.floor(Math.random() * questions.length)];
    questionText.textContent = `¿Cómo se dice "${currentQuestion.en}" en español?`;
    answerInput.value = "";
    answerInput.focus();
  });

  // -------------------------------
  // REVISAR RESPUESTA
  // -------------------------------
  checkBtn.addEventListener("click", () => {
    if (!currentQuestion) return;

    const userAnswer = answerInput.value.trim().toLowerCase();

    if (userAnswer === currentQuestion.es) {
      score += 5;
      stars++;

      soundCorrect.currentTime = 0;
      soundCorrect.play();

      const msg = messages[Math.floor(Math.random() * messages.length)];
      alert(msg + " ⭐ +1 estrella");

    } else {
      soundError.currentTime = 0;
      soundError.play();

      alert(`❌ Incorrecto. Era: ${currentQuestion.es}`);
    }

    if (score >= level * 20) {
      level++;

      soundLevel.currentTime = 0;
      soundLevel.play();

      alert("🎉 Subiste de nivel");
    }

    assignMedal();
    saveProgress();
    updateStudentProgress();

    scoreText.textContent = score + " puntos";
    levelText.textContent = "Nivel " + level;
    starsText.textContent = "⭐ Estrellas: " + stars;

    questionText.textContent = "Pulsa para comenzar";
    currentQuestion = null;
  });

  // -------------------------------
  // 🔐 MODO MAESTRO
  // -------------------------------
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

  // -------------------------------
  // EXPORTAR EXCEL
  // -------------------------------
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

// -------------------------------
// 💾 PROGRESO
// -------------------------------
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

  document.getElementById("scoreText").textContent = score + " puntos";
  document.getElementById("levelText").textContent = "Nivel " + level;
  document.getElementById("starsText").textContent = "⭐ Estrellas: " + stars;

  assignMedal();
}

// -------------------------------
// 🏅 MEDALLAS
// -------------------------------
function assignMedal() {
  const medalText = document.getElementById("medalText");

  if (level >= 3) {
    medalText.textContent = "🥇 Medalla Oro";
  } else if (level === 2) {
    medalText.textContent = "🥈 Medalla Plata";
  } else {
    medalText.textContent = "🥉 Medalla Bronce";
  }
}

// -------------------------------
// 👨‍🎓 REGISTRO DE ALUMNOS
// -------------------------------
function registerStudent() {
  let students = JSON.parse(localStorage.getItem("studentsList")) || [];

  const grade = document.getElementById("gradeInput").value;
  const group = document.getElementById("groupInput").value;

  if (!students.find(s => s.username === username)) {
    students.push({ username, grade, group, score, level, stars });
  }

  localStorage.setItem("studentsList", JSON.stringify(students));
}

function updateStudentProgress() {
  let students = JSON.parse(localStorage.getItem("studentsList")) || [];

  students = students.map(s => {
    if (s.username === username) {
      s.score = score;
      s.level = level;
      s.stars = stars;
    }
    return s;
  });

  localStorage.setItem("studentsList", JSON.stringify(students));
}

// -------------------------------
// 📊 PANEL MAESTRO
// -------------------------------
function loadStudentsForTeacher() {
  const table = document.getElementById("studentsTable");
  table.innerHTML = "";

  let students = JSON.parse(localStorage.getItem("studentsList")) || [];

  if (students.length === 0) {
    table.innerHTML = "<tr><td colspan='6'>No hay alumnos registrados</td></tr>";
    return;
  }

  students.forEach(s => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${s.username}</td>
      <td>${s.grade}</td>
      <td>${s.group}</td>
      <td>${s.score}</td>
      <td>${s.level}</td>
      <td>${s.stars || 0}</td>
    `;
    table.appendChild(row);
  });
}
