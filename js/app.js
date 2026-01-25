// ===============================
// 🔊 SONIDOS (RUTAS CORRECTAS PARA GITHUB PAGES)
// ===============================
const soundCorrect = new Audio("assets/sounds/correct.mp3");
const soundError   = new Audio("assets/sounds/wrong.mp3");
const soundLevel   = new Audio("assets/sounds/levelup.mp3");

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
// VARIABLES
// ===============================
let username = localStorage.getItem("username");
let score = 0;
let level = 1;
let stars = 0;

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

  const startBtn = document.getElementById("startGame");
  const checkBtn = document.getElementById("checkAnswer");
  const questionText = document.getElementById("questionText");
  const answerInput = document.getElementById("answerInput");

  const scoreText = document.getElementById("scoreText");
  const levelText = document.getElementById("levelText");
  const starsText = document.getElementById("starsText");
  const medalText = document.getElementById("medalText");
  const feedback = document.getElementById("feedback");

  // AUTO LOGIN
  if (username) {
    loginCard.style.display = "none";
    mainContent.style.display = "block";
    loadProgress();
  }

  // ===============================
  // 🎮 JUEGO
  // ===============================
  const questions = [
    { en: "Hello", es: "hola" },
    { en: "Goodbye", es: "adios" },
    { en: "Please", es: "por favor" },
    { en: "Thank you", es: "gracias" }
  ];

  let currentQuestion = null;

  startBtn.addEventListener("click", () => {
    unlockAudio(); // 🔓 DESBLOQUEO DE AUDIO AQUÍ

    currentQuestion = questions[Math.floor(Math.random() * questions.length)];
    questionText.textContent = `¿Cómo se dice "${currentQuestion.en}" en español?`;
    answerInput.value = "";
    answerInput.focus();
    feedback.textContent = "";
  });

  checkBtn.addEventListener("click", () => {
    if (!currentQuestion) return;

    const userAnswer = normalize(answerInput.value);
    const correctAnswer = normalize(currentQuestion.es);

    if (userAnswer === correctAnswer) {
      score += 5;
      stars++;

      // 🔊 SONIDO CORRECTO
      soundCorrect.currentTime = 0;
      soundCorrect.play();

      const msg = messages[Math.floor(Math.random() * messages.length)];
      feedback.textContent = msg + " ⭐ +1 estrella";
      feedback.style.color = "green";

    } else {
      // 🔊 SONIDO ERROR
      soundError.currentTime = 0;
      soundError.play();

      feedback.textContent = `❌ Incorrecto. Era: ${currentQuestion.es}`;
      feedback.style.color = "red";
    }

    if (score >= level * 20) {
      level++;

      // 🔊 SONIDO SUBIR NIVEL
      soundLevel.currentTime = 0;
      soundLevel.play();

      feedback.textContent = "🎉 Subiste de nivel";
      feedback.style.color = "gold";
    }

    assignMedal();
    saveProgress();

    scoreText.textContent = score + " puntos";
    levelText.textContent = "Nivel " + level;
    starsText.textContent = "⭐ Estrellas: " + stars;

    currentQuestion = null;
  });

});

// ===============================
// ✍️ NORMALIZAR TEXTO (QUITAR ACENTOS Y MAYÚSCULAS)
// ===============================
function normalize(text) {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();
}

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

  if (level >= 3) medalText.textContent = "🥇 Medalla Oro";
  else if (level === 2) medalText.textContent = "🥈 Medalla Plata";
  else medalText.textContent = "🥉 Medalla Bronce";
}
