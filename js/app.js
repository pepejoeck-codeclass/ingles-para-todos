// ===============================
// 🔊 SONIDOS (RUTAS CORRECTAS CON assets/sounds)
// ===============================
const soundCorrect = new Audio("/ingles-para-todos/assets/sounds/correct.mp3");
const soundError   = new Audio("/ingles-para-todos/assets/sounds/wrong.mp3");
const soundLevel   = new Audio("/ingles-para-todos/assets/sounds/levelup.mp3");

// desbloqueo obligatorio de audio (Chrome / móviles)
let audioUnlocked = false;

function unlockAudio() {
  if (audioUnlocked) return;

  [soundCorrect, soundError, soundLevel].forEach(sound => {
    sound.muted = true;
    sound.play().then(() => {
      sound.pause();
      sound.currentTime = 0;
      sound.muted = false;
    }).catch(() => {});
  });

  audioUnlocked = true;
  console.log("🔊 Audio desbloqueado correctamente");
}

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

  // LOGOUT
  logoutBtn.addEventListener("click", () => {
    if (confirm("¿Quieres cerrar sesión y cambiar de usuario?")) {
      localStorage.removeItem("username");
      location.reload();
    }
  });

  // MENÚ HAMBURGUESA
  hamburger.addEventListener("click", () => {
    nav.classList.toggle("open");
  });

  // MODO OSCURO
  themeToggle.addEventListener("click", () => {
    document.body.classList.toggle("dark");
  });

  // ===============================
  // 🎮 JUEGO
  // ===============================
  const questions = [
    { en: "Hello", es: "hola" },
    { en: "Goodbye", es: "adiós" },
    { en: "Please", es: "por favor" },
    { en: "Thank you", es: "gracias" }
  ];

  let currentQuestion = null;

  startBtn.addEventListener("click", () => {
    unlockAudio(); // 🔓 desbloquea sonido aquí

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

      // 🔊 sonido correcto
      soundCorrect.currentTime = 0;
      soundCorrect.play();

      const msg = messages[Math.floor(Math.random() * messages.length)];
      alert(msg + " ⭐ +1 estrella");

    } else {
      // 🔊 sonido error
      soundError.currentTime = 0;
      soundError.play();

      alert(`❌ Incorrecto. Era: ${currentQuestion.es}`);
    }

    if (score >= level * 20) {
      level++;

      // 🔊 sonido subir nivel
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

  // ===============================
  // 🔐 MODO MAESTRO
  // ===============================
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

  // ===============================
  // 📥 EXPORTAR A EXCEL
  // ===============================
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
  if (!username) return;

  score = parseInt(localStorage.getItem(`user_${username}_score`)) || 0;
  level = parseInt(localStorage.getItem(`user_${username}_level`)) || 1;
  stars = parseInt(localStorage.getItem(`user_${username}_stars`)) || 0;

  document.getElementById("scoreText").textContent = score + " puntos";
  document.getElementById("levelText").textContent = "Nivel " + level;
  document.getElementById("starsText").textContent = "⭐ Estrellas: " + stars;

  assignMedal();
}

// ===============================
// 🏅 MEDALLAS
// ===============================
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

// ===============================
// 👨‍🎓 REGISTRAR ALUMNOS
// ===============================
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

// ===============================
// 📊 PANEL MAESTRO
// ===============================
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
