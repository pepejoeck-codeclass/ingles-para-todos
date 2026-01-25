// 🔊 SONIDOS (RUTA CORRECTA EN GITHUB PAGES)
const soundCorrect = new Audio("/ingles-para-todos/assets/sounds/correct.mp3");
const soundError   = new Audio("/ingles-para-todos/assets/sounds/wrong.mp3");
const soundLevel   = new Audio("/ingles-para-todos/assets/sounds/levelup.mp3");

// 🔐 CONTRASEÑA MAESTRO
const TEACHER_PASSWORD = "161286";

// VARIABLES DE USUARIO
let username = localStorage.getItem("username");
let grade = localStorage.getItem("grade");
let group = localStorage.getItem("group");

let score = 0;
let level = 1;
let stars = 0;

// 📚 LECCIÓN (TODAS DEBEN SER CORRECTAS)
const lesson = [
  { en: "Hello", es: "hola" },
  { en: "Goodbye", es: "adiós" },
  { en: "Please", es: "por favor" },
  { en: "Thank you", es: "gracias" }
];

let currentIndex = 0;
let mistakes = 0;

document.addEventListener("DOMContentLoaded", () => {

  const loginCard = document.getElementById("loginCard");
  const mainContent = document.getElementById("mainContent");

  const gradeInput = document.getElementById("gradeInput");
  const groupInput = document.getElementById("groupInput");
  const usernameInput = document.getElementById("usernameInput");
  const emailInput = document.getElementById("emailInput");

  const loginBtn = document.getElementById("loginBtn");
  const logoutBtn = document.getElementById("logoutBtn");

  const hamburger = document.getElementById("hamburger");
  const nav = document.getElementById("nav");

  const startBtn = document.getElementById("startGame");
  const checkBtn = document.getElementById("checkAnswer");

  const questionText = document.getElementById("questionText");
  const answerInput = document.getElementById("answerInput");
  const feedback = document.getElementById("feedback");

  const scoreText = document.getElementById("scoreText");
  const levelText = document.getElementById("levelText");
  const starsText = document.getElementById("starsText");
  const medalText = document.getElementById("medalText");
  const userDisplay = document.getElementById("userDisplay");

  const openTeacherBtn = document.getElementById("openTeacherBtn");
  const teacherPanel = document.getElementById("teacherPanel");
  const closeTeacher = document.getElementById("closeTeacher");
  const exportBtn = document.getElementById("exportBtn");

  // ☰ MENÚ HAMBURGUESA
  hamburger.addEventListener("click", () => {
    nav.style.display = nav.style.display === "block" ? "none" : "block";
  });

  // 🔁 AUTO LOGIN
  if (username) {
    loginCard.style.display = "none";
    mainContent.style.display = "block";
    userDisplay.textContent = "Welcome " + username;
    loadProgress();
  }

  // 🔐 LOGIN (NOMBRE O CORREO + GRADO + GRUPO)
  loginBtn.addEventListener("click", () => {

    let name = usernameInput.value.trim();
    const email = emailInput.value.trim();
    const g = gradeInput.value.trim();
    const gr = groupInput.value.trim();

    if ((!name && !email) || !g || !gr) {
      alert("Completa nombre o correo, grado y grupo");
      return;
    }

    if (!name && email) name = email;

    username = name;
    grade = g;
    group = gr;

    localStorage.setItem("username", username);
    localStorage.setItem("grade", grade);
    localStorage.setItem("group", group);

    registerStudent();

    loginCard.style.display = "none";
    mainContent.style.display = "block";
    userDisplay.textContent = "Welcome " + username;

    loadProgress();
  });

  // 🚪 LOGOUT
  logoutBtn.addEventListener("click", () => {
    localStorage.clear();
    location.reload();
  });

  // ▶️ INICIAR LECCIÓN
  startBtn.addEventListener("click", () => {
    currentIndex = 0;
    mistakes = 0;
    showQuestion();
  });

  function showQuestion() {
    const q = lesson[currentIndex];
    questionText.textContent = `¿Cómo se dice "${q.en}" en español?`;
    answerInput.value = "";
    feedback.textContent = "";
  }

  // ✅ RESPONDER
  checkBtn.addEventListener("click", () => {

    const userAnswer = answerInput.value.trim().toLowerCase();
    const correct = lesson[currentIndex].es;

    if (userAnswer === correct) {
      soundCorrect.play();
      currentIndex++;
      score += 5;
      stars++;

      if (currentIndex >= lesson.length) {
        if (mistakes === 0) {
          level++;
          soundLevel.play();
          feedback.textContent = "🎉 ¡Lección perfecta! Subiste de nivel";
        } else {
          feedback.textContent = "❌ Fallaste antes, repite toda la lección";
          resetLesson();
          return;
        }
      } else {
        showQuestion();
      }

    } else {
      soundError.play();
      feedback.textContent = "❌ Incorrecto, la lección se reinicia";
      resetLesson();
      return;
    }

    assignMedal();
    saveProgress();
    updateStudent();

    scoreText.textContent = score + " puntos";
    levelText.textContent = "Nivel " + level;
    starsText.textContent = "⭐ Estrellas: " + stars;
  });

  function resetLesson() {
    currentIndex = 0;
    mistakes = 0;
  }

  // 👨‍🏫 MODO MAESTRO FUERA DEL MENÚ
  openTeacherBtn.addEventListener("click", () => {

    const pass = prompt("Contraseña del maestro:");

    if (pass !== TEACHER_PASSWORD) {
      alert("❌ Contraseña incorrecta");
      return;
    }

    teacherPanel.style.display = "block";
    loadTeacherPanel();
  });

  closeTeacher.addEventListener("click", () => {
    teacherPanel.style.display = "none";
  });

  exportBtn.addEventListener("click", exportToCSV);

});

// 💾 GUARDAR PROGRESO POR ALUMNO
function saveProgress() {
  localStorage.setItem(`user_${username}_score`, score);
  localStorage.setItem(`user_${username}_level`, level);
  localStorage.setItem(`user_${username}_stars`, stars);
}

// 🔁 CARGAR PROGRESO
function loadProgress() {
  score = parseInt(localStorage.getItem(`user_${username}_score`)) || 0;
  level = parseInt(localStorage.getItem(`user_${username}_level`)) || 1;
  stars = parseInt(localStorage.getItem(`user_${username}_stars`)) || 0;

  document.getElementById("scoreText").textContent = score + " puntos";
  document.getElementById("levelText").textContent = "Nivel " + level;
  document.getElementById("starsText").textContent = "⭐ Estrellas: " + stars;

  assignMedal();
}

// 🏅 MEDALLAS AUTOMÁTICAS
function assignMedal() {
  const medalText = document.getElementById("medalText");

  if (level >= 5) medalText.textContent = "🥇 Medalla Oro";
  else if (level >= 3) medalText.textContent = "🥈 Medalla Plata";
  else medalText.textContent = "🥉 Medalla Bronce";
}

// 👨‍🎓 REGISTRO DE ALUMNOS
function registerStudent() {
  let students = JSON.parse(localStorage.getItem("studentsList")) || [];

  if (!students.find(s => s.name === username)) {
    students.push({
      name: username,
      grade,
      group,
      score: 0,
      level: 1,
      stars: 0
    });
  }

  localStorage.setItem("studentsList", JSON.stringify(students));
}

// 🔄 ACTUALIZAR ALUMNO
function updateStudent() {
  let students = JSON.parse(localStorage.getItem("studentsList")) || [];

  students.forEach(s => {
    if (s.name === username) {
      s.score = score;
      s.level = level;
      s.stars = stars;
    }
  });

  localStorage.setItem("studentsList", JSON.stringify(students));
}

// 📊 PANEL MAESTRO
function loadTeacherPanel() {
  const table = document.getElementById("studentsTable");
  table.innerHTML = "";

  let students = JSON.parse(localStorage.getItem("studentsList")) || [];

  // RANKING
  students.sort((a, b) => b.score - a.score);

  students.forEach(s => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${s.name}</td>
      <td>${s.grade}</td>
      <td>${s.group}</td>
      <td>${s.score}</td>
      <td>${s.level}</td>
      <td>${s.stars}</td>
    `;
    table.appendChild(row);
  });

  drawChart(students);
}

// 📊 GRÁFICA
function drawChart(students) {
  const ctx = document.getElementById("progressChart");

  const labels = students.map(s => s.name);
  const data = students.map(s => s.score);

  new Chart(ctx, {
    type: "bar",
    data: {
      labels: labels,
      datasets: [{
        label: "Puntaje",
        data: data
      }]
    }
  });
}

// 📥 EXPORTAR A EXCEL
function exportToCSV() {
  let students = JSON.parse(localStorage.getItem("studentsList")) || [];

  let csv = "Alumno,Grado,Grupo,Puntaje,Nivel,Estrellas\n";
  students.forEach(s => {
    csv += `${s.name},${s.grade},${s.group},${s.score},${s.level},${s.stars}\n`;
  });

  const blob = new Blob([csv], { type: "text/csv" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = "alumnos_progreso.csv";
  link.click();
}
