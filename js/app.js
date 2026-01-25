// ===== SONIDOS =====
const soundCorrect = new Audio("assets/sounds/correct.mp3");
const soundWrong = new Audio("assets/sounds/wrong.mp3");
const soundLevelUp = new Audio("assets/sounds/levelup.mp3");

let username = localStorage.getItem("username");
let score = 0;
let level = 1;

document.addEventListener("DOMContentLoaded", () => {

  const loginCard = document.getElementById("loginCard");
  const mainContent = document.getElementById("mainContent");
  const nav = document.getElementById("nav");

  const hamburger = document.getElementById("hamburger");
  const themeToggle = document.getElementById("themeToggle");
  const logoutBtn = document.getElementById("logoutBtn");

  const openTeacher = document.getElementById("openTeacher");
  const teacherPanel = document.getElementById("teacherPanel");
  const closeTeacher = document.getElementById("closeTeacher");

  const loginBtn = document.getElementById("loginBtn");
  const usernameInput = document.getElementById("usernameInput");
  const emailInput = document.getElementById("emailInput");
  const gradeInput = document.getElementById("gradeInput");
  const groupInput = document.getElementById("groupInput");

  const startBtn = document.getElementById("startGame");
  const checkBtn = document.getElementById("checkAnswer");
  const questionText = document.getElementById("questionText");
  const answerInput = document.getElementById("answerInput");
  const scoreText = document.getElementById("scoreText");
  const levelText = document.getElementById("levelText");

  // ===== MENÚ HAMBURGUESA (YA FUNCIONA) =====
  hamburger.addEventListener("click", () => {
    nav.classList.toggle("open");
  });

  // ===== MODO OSCURO =====
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
  });

  // ===== LOGOUT =====
  logoutBtn.addEventListener("click", () => {
    if (confirm("¿Quieres cambiar de usuario?")) {
      localStorage.removeItem("username");
      location.reload();
    }
  });

  // ===== MODO MAESTRO =====
  openTeacher.addEventListener("click", () => {
    nav.classList.remove("open");
    teacherPanel.style.display = "block";
    loadStudentsForTeacher();
  });

  closeTeacher.addEventListener("click", () => {
    teacherPanel.style.display = "none";
  });

});

// ===== PANEL MAESTRO (VACÍO POR AHORA PERO FUNCIONA) =====
function loadStudentsForTeacher() {
  const table = document.getElementById("studentsTable");
  table.innerHTML = "<tr><td colspan='5'>Aquí aparecerán tus alumnos 👨‍🏫</td></tr>";
}
