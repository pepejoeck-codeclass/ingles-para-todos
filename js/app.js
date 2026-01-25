// ===== SONIDOS =====
const soundCorrect = new Audio("assets/sounds/correct.mp3");
const soundWrong = new Audio("assets/sounds/wrong.mp3");
const soundLevelUp = new Audio("assets/sounds/levelup.mp3");

// ===== USUARIO ACTUAL =====
let username = localStorage.getItem("username") || null;
let grade = null;
let group = null;

let score = 0;
let level = 1;
let unlockedLesson = 1;

// 🔓 Desbloquear sonidos con la primera interacción
function unlockSounds() {
  [soundCorrect, soundWrong, soundLevelUp].forEach(sound => {
    sound.play().then(() => {
      sound.pause();
      sound.currentTime = 0;
    }).catch(() => {});
  });
}

console.log("🔥 app.js cargado correctamente");

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

  // Si ya había usuario guardado → entrar automático
  if (username) {
    loginCard.style.display = "none";
    mainContent.style.display = "block";
    loadUserData();
    loadProgress();
  }

  // ===== INICIAR SESIÓN =====
  loginBtn.addEventListener("click", () => {
    const name = usernameInput.value.trim();
    const email = emailInput.value.trim();
    const gradeValue = gradeInput.value.trim();
    const groupValue = groupInput.value.trim();

    if (!name && !email) {
      alert("Escribe tu nombre o tu correo 🙂");
      return;
    }

    if (!gradeValue || !groupValue) {
      alert("Escribe tu grado y tu grupo 🙂");
      return;
    }

    // Identificador del usuario
    if (email) {
      username = email.toLowerCase();
    } else {
      username = name;
    }

    grade = gradeValue;
    group = groupValue;

    localStorage.setItem("username", username);
    localStorage.setItem(`user_${username}_grade`, grade);
    localStorage.setItem(`user_${username}_group`, group);

    // 👉 REGISTRAR ALUMNO EN LISTA GENERAL DEL MAESTRO
    registerStudent(username, grade, group);

    loginCard.style.display = "none";
    mainContent.style.display = "block";

    loadProgress();
  });

  // ===== CERRAR SESIÓN (SIN BORRAR PROGRESO) =====
  logoutBtn.addEventListener("click", () => {
    if (confirm("¿Quieres cerrar sesión y cambiar de usuario?")) {
      localStorage.removeItem("username"); // solo cerrar sesión
      location.reload();
    }
  });

  // ===== ELEMENTOS DEL JUEGO =====
  const hamburger = document.getElementById("hamburger");
  const nav = document.getElementById("nav");
  const themeBtn = document.getElementById("themeToggle");

  const startBtn = document.getElementById("startGame");
  const checkBtn = document.getElementById("checkAnswer");
  const questionText = document.getElementById("questionText");
  const answerInput = document.getElementById("answerInput");

  const scoreText = document.getElementById("scoreText");
  const levelText = document.getElementById("levelText");

  let currentQuestion = null;

  const questions = [
    { en: "Hello", es: "Hola" },
    { en: "Goodbye", es: "Adiós" },
    { en: "Please", es: "Por favor" },
    { en: "Thank you", es: "Gracias" }
  ];

  // ===== MENÚ HAMBURGUESA =====
  hamburger.addEventListener("click", () => {
    nav.classList.toggle("open");
  });

  // ===== TEMA OSCURO =====
  themeBtn.addEventListener("click", () => {
    document.body.classList.toggle("dark");
  });

  // ===== INICIAR EJERCICIO =====
  startBtn.addEventListener("click", () => {
    unlockSounds();

    currentQuestion =
      questions[Math.floor(Math.random() * questions.length)];

    questionText.textContent =
      `¿Cómo se dice "${currentQuestion.en}" en español?`;

    answerInput.value = "";
    answerInput.focus();
  });

  // ===== RESPONDER =====
  checkBtn.addEventListener("click", () => {
    if (!currentQuestion) {
      alert("Primero inicia un ejercicio 🙂");
      return;
    }

    const userAnswer = answerInput.value.trim().toLowerCase();

    if (!userAnswer) {
      alert("Escribe una respuesta");
      return;
    }

    if (userAnswer === currentQuestion.es.toLowerCase()) {
      score += 5;
      soundCorrect.play();
      alert("✅ Correcto +5 puntos");
    } else {
      soundWrong.play();
      alert(`❌ Incorrecto. Era: ${currentQuestion.es}`);
    }

    // ===== SUBIR NIVEL =====
    if (score >= level * 20) {
      level++;
      unlockedLesson = Math.max(unlockedLesson, level);
      soundLevelUp.play();
      alert("🎉 Subiste de nivel");
    }

    saveProgress();

    scoreText.textContent = score + " puntos";
    levelText.textContent = "Nivel " + level;

    questionText.textContent = "Pulsa para comenzar";
    currentQuestion = null;
  });

});


// ===== REGISTRAR ALUMNOS PARA EL MAESTRO 👨‍🏫 =====
function registerStudent(username, grade, group) {
  let students = JSON.parse(localStorage.getItem("studentsList")) || [];

  const exists = students.find(s => s.username === username);

  if (!exists) {
    students.push({
      username: username,
      grade: grade,
      group: group,
      score: 0,
      level: 1
    });

    localStorage.setItem("studentsList", JSON.stringify(students));
  }
}


// ===== GUARDAR PROGRESO (POR USUARIO) =====
function saveProgress() {
  if (!username) return;

  localStorage.setItem(`user_${username}_score`, score);
  localStorage.setItem(`user_${username}_level`, level);
  localStorage.setItem(`user_${username}_unlockedLesson`, unlockedLesson);

  // Actualizar datos en lista del maestro
  let students = JSON.parse(localStorage.getItem("studentsList")) || [];

  students = students.map(student => {
    if (student.username === username) {
      return {
        ...student,
        score: score,
        level: level
      };
    }
    return student;
  });

  localStorage.setItem("studentsList", JSON.stringify(students));
}


// ===== CARGAR PROGRESO (POR USUARIO) =====
function loadProgress() {
  if (!username) return;

  score = parseInt(localStorage.getItem(`user_${username}_score`)) || 0;
  level = parseInt(localStorage.getItem(`user_${username}_level`)) || 1;
  unlockedLesson = parseInt(localStorage.getItem(`user_${username}_unlockedLesson`)) || 1;

  document.getElementById("scoreText").textContent = score + " puntos";
  document.getElementById("levelText").textContent = "Nivel " + level;
}


// ===== CARGAR DATOS DEL USUARIO =====
function loadUserData() {
  if (!username) return;

  grade = localStorage.getItem(`user_${username}_grade`);
  group = localStorage.getItem(`user_${username}_group`);
}
