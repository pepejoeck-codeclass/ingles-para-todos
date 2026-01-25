// ===== SONIDOS =====
const soundCorrect = new Audio("assets/sounds/correct.mp3");
const soundWrong = new Audio("assets/sounds/wrong.mp3");
const soundLevelUp = new Audio("assets/sounds/levelup.mp3");

// ===== USUARIO Y PROGRESO =====
let username = localStorage.getItem("username") || null;
let score = 0;
let level = 1;
let unlockedLesson = 1;

// ===== DESBLOQUEAR SONIDOS =====
function unlockSounds() {
  [soundCorrect, soundWrong, soundLevelUp].forEach(sound => {
    sound.play().then(() => {
      sound.pause();
      sound.currentTime = 0;
    }).catch(() => {});
  });
}

document.addEventListener("DOMContentLoaded", () => {

  // ===== LOGIN =====
  const loginCard = document.getElementById("loginCard");
  const mainContent = document.getElementById("mainContent");
  const usernameInput = document.getElementById("usernameInput");
  const emailInput = document.getElementById("emailInput");
  const gradeInput = document.getElementById("gradeInput");
  const groupInput = document.getElementById("groupInput");
  const loginBtn = document.getElementById("loginBtn");
  const logoutBtn = document.getElementById("logoutBtn");

  if (username) {
    loginCard.style.display = "none";
    mainContent.style.display = "block";
    loadProgress();
  }

  loginBtn.addEventListener("click", () => {
    const name = usernameInput.value.trim();
    const email = emailInput.value.trim();

    if (!name && !email) {
      alert("Escribe tu nombre o tu correo 🙂");
      return;
    }

    username = email ? email.toLowerCase() : name;
    localStorage.setItem("username", username);

    loginCard.style.display = "none";
    mainContent.style.display = "block";

    loadProgress();
    registerStudent();
  });

  // ===== CERRAR SESIÓN =====
  logoutBtn.addEventListener("click", () => {
    if (confirm("¿Quieres cerrar sesión y cambiar de usuario?")) {
      localStorage.removeItem("username");
      location.reload();
    }
  });

  // ===== MENÚ =====
  const hamburger = document.getElementById("hamburger");
  const nav = document.getElementById("nav");
  hamburger.addEventListener("click", () => nav.classList.toggle("open"));

  // ===== TEMA =====
  document.getElementById("themeToggle")
    .addEventListener("click", () => document.body.classList.toggle("dark"));

  // ===== JUEGO =====
  const startBtn = document.getElementById("startGame");
  const checkBtn = document.getElementById("checkAnswer");
  const questionText = document.getElementById("questionText");
  const answerInput = document.getElementById("answerInput");
  const scoreText = document.getElementById("scoreText");
  const levelText = document.getElementById("levelText");

  const questions = [
    { en: "Hello", es: "Hola" },
    { en: "Goodbye", es: "Adiós" },
    { en: "Please", es: "Por favor" },
    { en: "Thank you", es: "Gracias" }
  ];

  let currentQuestion = null;

  startBtn.addEventListener("click", () => {
    unlockSounds();
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
      soundCorrect.play();
      alert("✅ Correcto +5 puntos");
    } else {
      soundWrong.play();
      alert(`❌ Incorrecto. Era: ${currentQuestion.es}`);
    }

    if (score >= level * 20) {
      level++;
      unlockedLesson = Math.max(unlockedLesson, level);
      soundLevelUp.play();
      alert("🎉 Subiste de nivel y desbloqueaste nueva lección");
    }

    saveProgress();
    updateStudentProgress();

    scoreText.textContent = score + " puntos";
    levelText.textContent = "Nivel " + level;

    questionText.textContent = "Pulsa para comenzar";
    currentQuestion = null;
  });

  // ===== MODO MAESTRO 👨‍🏫 =====
  const openTeacher = document.getElementById("openTeacher");
  const teacherPanel = document.getElementById("teacherPanel");
  const closeTeacher = document.getElementById("closeTeacher");

  openTeacher.addEventListener("click", () => {
    teacherPanel.style.display = "block";
    loadStudentsForTeacher();
  });

  closeTeacher.addEventListener("click", () => {
    teacherPanel.style.display = "none";
  });

});

// ===== PROGRESO POR USUARIO =====
function saveProgress() {
  if (!username) return;
  localStorage.setItem(`user_${username}_score`, score);
  localStorage.setItem(`user_${username}_level`, level);
  localStorage.setItem(`user_${username}_unlockedLesson`, unlockedLesson);
}

function loadProgress() {
  if (!username) return;

  score = parseInt(localStorage.getItem(`user_${username}_score`)) || 0;
  level = parseInt(localStorage.getItem(`user_${username}_level`)) || 1;
  unlockedLesson = parseInt(localStorage.getItem(`user_${username}_unlockedLesson`)) || 1;

  document.getElementById("scoreText").textContent = score + " puntos";
  document.getElementById("levelText").textContent = "Nivel " + level;
}

// ===== REGISTRAR ALUMNOS =====
function registerStudent() {
  let students = JSON.parse(localStorage.getItem("studentsList")) || [];

  const grade = document.getElementById("gradeInput").value;
  const group = document.getElementById("groupInput").value;

  if (!students.find(s => s.username === username)) {
    students.push({ username, grade, group, score, level });
  }

  localStorage.setItem("studentsList", JSON.stringify(students));
}

// ===== ACTUALIZAR PROGRESO DEL ALUMNO =====
function updateStudentProgress() {
  let students = JSON.parse(localStorage.getItem("studentsList")) || [];

  students = students.map(s => {
    if (s.username === username) {
      s.score = score;
      s.level = level;
    }
    return s;
  });

  localStorage.setItem("studentsList", JSON.stringify(students));
}

// ===== MOSTRAR EN PANEL MAESTRO =====
function loadStudentsForTeacher() {
  const table = document.getElementById("studentsTable");
  table.innerHTML = "";

  let students = JSON.parse(localStorage.getItem("studentsList")) || [];

  if (students.length === 0) {
    table.innerHTML = "<tr><td colspan='5'>No hay alumnos registrados</td></tr>";
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
    `;
    table.appendChild(row);
  });
}
