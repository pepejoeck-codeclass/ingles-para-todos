// ===== SONIDOS =====
const soundCorrect = new Audio("assets/sounds/correct.mp3");
const soundWrong = new Audio("assets/sounds/wrong.mp3");
const soundLevelUp = new Audio("assets/sounds/levelup.mp3");

// ===== USUARIO Y PROGRESO (POR USUARIO) =====
let username = localStorage.getItem("username") || null;

let score = 0;
let level = 1;
let unlockedLesson = 1;

// 🔓 Desbloquear sonidos con la primera interacción
function unlockSounds() {
  soundCorrect.play().then(() => {
    soundCorrect.pause();
    soundCorrect.currentTime = 0;
  }).catch(() => {});

  soundWrong.play().then(() => {
    soundWrong.pause();
    soundWrong.currentTime = 0;
  }).catch(() => {});

  soundLevelUp.play().then(() => {
    soundLevelUp.pause();
    soundLevelUp.currentTime = 0;
  }).catch(() => {});
}

console.log("🔥 app.js cargado correctamente");

document.addEventListener("DOMContentLoaded", () => {

  // ===== LOGIN =====
  const loginCard = document.getElementById("loginCard");
  const mainContent = document.getElementById("mainContent");
  const usernameInput = document.getElementById("usernameInput");
  const loginBtn = document.getElementById("loginBtn");
  const emailInput = document.getElementById("emailInput");
  const logoutBtn = document.getElementById("logoutBtn");

  // Si ya había usuario guardado → entrar automático
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

  // Si usó correo, ese será su identificador
  if (email) {
    username = email.toLowerCase();
  } else {
    username = name;
  }

  localStorage.setItem("username", username);

  loginCard.style.display = "none";
  mainContent.style.display = "block";

  loadProgress();
});

  // ===== CERRAR SESIÓN (SIN BORRAR PROGRESO) =====
  logoutBtn.addEventListener("click", () => {
    if (confirm("¿Quieres cerrar sesión y cambiar de usuario?")) {
      localStorage.removeItem("username"); // SOLO cerrar sesión
      location.reload();
    }
  });

  // ===== ELEMENTOS =====
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

  // ===== BLOQUEAR LECCIONES =====
  document.querySelectorAll(".lesson").forEach(lesson => {
    lesson.addEventListener("click", (e) => {
      const lessonNumber = parseInt(lesson.dataset.lesson);

      if (lessonNumber > unlockedLesson) {
        e.preventDefault();
        alert("🔒 Termina la lección anterior para desbloquear esta");
      } else {
        alert("📘 Estás en la Lección " + lessonNumber);
      }
    });
  });

  // ===== INICIAR EJERCICIO =====
  startBtn.addEventListener("click", () => {

    unlockSounds(); // activar sonidos

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

      document.querySelector(".card").classList.add("correct");
      setTimeout(() => {
        document.querySelector(".card").classList.remove("correct");
      }, 500);

      alert("✅ Correcto +5 puntos");
    } else {
      soundWrong.play();

      document.querySelector(".card").classList.add("wrong");
      setTimeout(() => {
        document.querySelector(".card").classList.remove("wrong");
      }, 500);

      alert(`❌ Incorrecto. Era: ${currentQuestion.es}`);
    }

    // ===== SUBIR NIVEL Y DESBLOQUEAR LECCIÓN =====
    if (score >= level * 20) {
      level++;

      // desbloquear siguiente lección
      unlockedLesson = Math.max(unlockedLesson, level);

      soundLevelUp.play();

      alert("🎉 Subiste de nivel y desbloqueaste nueva lección");
    }

    // Guardar progreso del usuario
    saveProgress();

    scoreText.textContent = score + " puntos";
    levelText.textContent = "Nivel " + level;

    updateLessonsMenu();

    questionText.textContent = "Pulsa para comenzar";
    currentQuestion = null;
  });

});


// ===== GUARDAR PROGRESO (POR USUARIO) =====
function saveProgress() {
  if (!username) return;

  localStorage.setItem(`user_${username}_score`, score);
  localStorage.setItem(`user_${username}_level`, level);
  localStorage.setItem(`user_${username}_unlockedLesson`, unlockedLesson);
}


// ===== CARGAR PROGRESO (POR USUARIO) =====
function loadProgress() {
  if (!username) return;

  score = parseInt(localStorage.getItem(`user_${username}_score`)) || 0;
  level = parseInt(localStorage.getItem(`user_${username}_level`)) || 1;
  unlockedLesson = parseInt(localStorage.getItem(`user_${username}_unlockedLesson`)) || 1;

  document.getElementById("scoreText").textContent = score + " puntos";
  document.getElementById("levelText").textContent = "Nivel " + level;

  updateLessonsMenu();
}


// ===== ACTUALIZAR MENÚ DE LECCIONES =====
function updateLessonsMenu() {
  const lessons = document.querySelectorAll(".lesson");

  lessons.forEach(lesson => {
    const lessonNumber = parseInt(lesson.dataset.lesson);

    if (lessonNumber <= unlockedLesson) {
      lesson.classList.remove("locked");
      lesson.textContent = "Lección " + lessonNumber;
    } else {
      lesson.classList.add("locked");
      lesson.textContent = "Lección " + lessonNumber + " 🔒";
    }
  });
}
