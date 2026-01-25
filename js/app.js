// ===============================
// 🔊 SONIDOS
// ===============================
const soundCorrect = new Audio("assets/sounds/correct.mp3");
const soundError   = new Audio("assets/sounds/wrong.mp3");
const soundLevel   = new Audio("assets/sounds/levelup.mp3");

let audioUnlocked = false;
function unlockAudio() {
  if (audioUnlocked) return;
  [soundCorrect, soundError, soundLevel].forEach(s => {
    s.muted = true;
    s.play().then(() => {
      s.pause(); s.currentTime = 0; s.muted = false;
    }).catch(()=>{});
  });
  audioUnlocked = true;
}

// ===============================
const messages = [
  "🔥 Excellent job",
  "⭐ You're doing great",
  "👏 Keep it up",
  "💪 You can do it",
  "🎯 Perfect"
];

const lesson = [
  { en: "Hello", es: "hola" },
  { en: "Goodbye", es: "adios" },
  { en: "Please", es: "por favor" },
  { en: "Thank you", es: "gracias" }
];

let lessonIndex = 0;
let currentStudent = null;
let chartInstance = null;
let autoRefresh = null;

// ===============================
// ELEMENTOS
// ===============================
const nav = document.getElementById("nav");
const hamburger = document.getElementById("hamburger");

const loginCard = document.getElementById("loginCard");
const mainContent = document.getElementById("mainContent");
const userDisplay = document.getElementById("userDisplay");

const gradeInput = document.getElementById("gradeInput");
const groupInput = document.getElementById("groupInput");
const usernameInput = document.getElementById("usernameInput");
const emailInput = document.getElementById("emailInput");
const loginBtn = document.getElementById("loginBtn");
const logoutBtn = document.getElementById("logoutBtn");

const startBtn = document.getElementById("startGame");
const checkBtn = document.getElementById("checkAnswer");
const questionText = document.getElementById("questionText");
const answerInput = document.getElementById("answerInput");
const feedback = document.getElementById("feedback");

const scoreText = document.getElementById("scoreText");
const levelText = document.getElementById("levelText");
const starsText = document.getElementById("starsText");
const medalText = document.getElementById("medalText");

// Maestro
const openTeacherBtn = document.getElementById("openTeacherBtn");
const teacherLogin = document.getElementById("teacherLogin");
const teacherPanel = document.getElementById("teacherPanel");
const teacherLoginBtn = document.getElementById("teacherLoginBtn");
const teacherUser = document.getElementById("teacherUser");
const teacherPass = document.getElementById("teacherPass");
const closeTeacher = document.getElementById("closeTeacher");

const studentsTable = document.getElementById("studentsTable");
const connectedList = document.getElementById("connectedList");
const exportBtn = document.getElementById("exportBtn");
const groupSelect = document.getElementById("groupSelect");

// ===============================
// 🍔 HAMBURGUESA
// ===============================
hamburger.addEventListener("click", () => {
  nav.style.display = nav.style.display === "block" ? "none" : "block";
});

// ===============================
// 🚪 CAMBIAR USUARIO (LOGOUT GENERAL)
// ===============================
logoutBtn.addEventListener("click", () => {
  if (!confirm("¿Quieres cerrar sesión y cambiar de usuario?")) return;

  // Marcar alumno como desconectado
  if (currentStudent) {
    let students = JSON.parse(localStorage.getItem("students")) || [];
    students = students.map(s => {
      if (s.name === currentStudent.name) s.online = false;
      return s;
    });
    localStorage.setItem("students", JSON.stringify(students));
  }

  // Limpiar estados
  currentStudent = null;
  lessonIndex = 0;

  // Ocultar todo
  mainContent.style.display = "none";
  teacherPanel.style.display = "none";
  teacherLogin.style.display = "none";

  // Mostrar login alumno
  loginCard.style.display = "block";

  // Limpiar campos
  usernameInput.value = "";
  emailInput.value = "";
  gradeInput.value = "";
  groupInput.value = "";
  feedback.textContent = "";
  questionText.textContent = "Pulsa para comenzar";

  // Detener actualización automática del maestro
  if (autoRefresh) clearInterval(autoRefresh);
});

// ===============================
// LOGIN ALUMNO
// ===============================
loginBtn.addEventListener("click", () => {
  const name = usernameInput.value.trim();
  const grade = gradeInput.value.trim();
  const group = groupInput.value.trim();
  const email = emailInput.value.trim();

  if ((!name && !email) || !grade || !group) {
    alert("Completa nombre o correo, grado y grupo");
    return;
  }

  const finalName = name || email;

  let students = JSON.parse(localStorage.getItem("students")) || [];

  let student = students.find(s => s.name === finalName && s.grade === grade && s.group === group);

  if (!student) {
    student = { name: finalName, grade, group, score: 0, level: 1, stars: 0, online: true };
    students.push(student);
  } else {
    student.online = true;
  }

  localStorage.setItem("students", JSON.stringify(students));
  currentStudent = student;

  loginCard.style.display = "none";
  mainContent.style.display = "block";
  userDisplay.textContent = "Welcome " + student.name;

  updateUI();
});

// ===============================
// JUEGO
// ===============================
startBtn.addEventListener("click", () => {
  unlockAudio();
  lessonIndex = 0;
  showQuestion();
});

checkBtn.addEventListener("click", () => {
  if (!currentStudent) return;

  const answer = answerInput.value.trim().toLowerCase();
  const correct = lesson[lessonIndex].es;

  if (answer === correct) {
    soundCorrect.play();
    feedback.textContent = messages[Math.floor(Math.random() * messages.length)];
    feedback.style.color = "green";

    currentStudent.score += 5;
    currentStudent.stars++;

    lessonIndex++;

    if (lessonIndex >= lesson.length) {
      currentStudent.level++;
      soundLevel.play();
      feedback.textContent = "🎉 SIGUIENTE NIVEL";
      lessonIndex = 0;
    } else {
      setTimeout(showQuestion, 1000);
    }

  } else {
    soundError.play();
    feedback.textContent = "❌ Incorrecto, reinicias la lección";
    feedback.style.color = "red";
    lessonIndex = 0;
    setTimeout(showQuestion, 1500);
  }

  saveStudent();
  updateUI();
});

// ===============================
function showQuestion() {
  questionText.textContent = `¿Cómo se dice "${lesson[lessonIndex].en}" en español?`;
  answerInput.value = "";
  answerInput.focus();
}

// ===============================
function updateUI() {
  scoreText.textContent = currentStudent.score + " puntos";
  levelText.textContent = "Nivel " + currentStudent.level;
  starsText.textContent = "⭐ Estrellas: " + currentStudent.stars;

  if (currentStudent.level >= 3) medalText.textContent = "🥇 Medalla Oro";
  else if (currentStudent.level === 2) medalText.textContent = "🥈 Medalla Plata";
  else medalText.textContent = "🥉 Medalla Bronce";
}

// ===============================
function saveStudent() {
  let students = JSON.parse(localStorage.getItem("students")) || [];
  students = students.map(s => s.name === currentStudent.name ? currentStudent : s);
  localStorage.setItem("students", JSON.stringify(students));
}

// ===============================
// LOGIN MAESTRO
// ===============================
openTeacherBtn.addEventListener("click", () => {
  loginCard.style.display = "none";
  mainContent.style.display = "none";
  teacherLogin.style.display = "block";
});

teacherLoginBtn.addEventListener("click", () => {
  if (teacherUser.value === "Jose de Jesus Ramos Flores" && teacherPass.value === "161286") {
    teacherLogin.style.display = "none";
    teacherPanel.style.display = "block";
    loadTeacherPanel();
    autoRefresh = setInterval(loadTeacherPanel, 5000);
  } else {
    alert("❌ Usuario o contraseña incorrectos");
  }
});

// ===============================
// CERRAR SESIÓN MAESTRO (BOTÓN INTERNO)
// ===============================
closeTeacher.addEventListener("click", () => {
  teacherPanel.style.display = "none";
  teacherLogin.style.display = "none";
  loginCard.style.display = "block";
  if (autoRefresh) clearInterval(autoRefresh);
});

// ===============================
// PANEL MAESTRO
// ===============================
function loadTeacherPanel() {
  let students = JSON.parse(localStorage.getItem("students")) || [];

  if (groupSelect.options.length === 1) {
    const groups = [...new Set(students.map(s => s.group))];
    groups.forEach(g => {
      const opt = document.createElement("option");
      opt.value = g;
      opt.textContent = g;
      groupSelect.appendChild(opt);
    });
  }

  const selectedGroup = groupSelect.value;

  let filtered = students;
  if (selectedGroup) filtered = students.filter(s => s.group === selectedGroup);

  connectedList.innerHTML = "";
  filtered.filter(s => s.online).forEach(s => {
    connectedList.innerHTML += `<li>${s.name} (${s.grade}-${s.group})</li>`;
  });

  studentsTable.innerHTML = "";
  filtered.sort((a,b)=>b.score-a.score).forEach(s => {
    studentsTable.innerHTML += `
      <tr>
        <td>${s.name}</td>
        <td>${s.grade}</td>
        <td>${s.group}</td>
        <td>${s.score}</td>
        <td>${s.level}</td>
        <td>${s.stars}</td>
      </tr>
    `;
  });

  drawChart(filtered);
}

groupSelect.addEventListener("change", loadTeacherPanel);

// ===============================
// GRÁFICA
// ===============================
function drawChart(students) {
  const ctx = document.getElementById("progressChart");

  if (chartInstance) chartInstance.destroy();

  chartInstance = new Chart(ctx, {
    type: "bar",
    data: {
      labels: students.map(s => s.name),
      datasets: [{
        label: "Puntaje",
        data: students.map(s => s.score)
      }]
    }
  });
}
