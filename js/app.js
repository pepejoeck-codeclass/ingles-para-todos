// ===============================
// 🔊 SONIDOS
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

let currentStudent = null;
let lessonIndex = 0;
let mistakes = 0;
let chartInstance = null;
let autoRefresh = null;

const lesson = [
  { en: "Hello", es: "hola" },
  { en: "Goodbye", es: "adios" },
  { en: "Please", es: "por favor" },
  { en: "Thank you", es: "gracias" }
];

// ===============================
// ELEMENTOS
// ===============================
const loginCard = document.getElementById("loginCard");
const mainContent = document.getElementById("mainContent");
const userDisplay = document.getElementById("userDisplay");

const usernameInput = document.getElementById("usernameInput");
const gradeInput = document.getElementById("gradeInput");
const groupInput = document.getElementById("groupInput");
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

const filterGrade = document.getElementById("filterGrade");
const filterGroup = document.getElementById("filterGroup");
const groupSelect = document.getElementById("groupSelect");

// Ficha
const studentCard = document.getElementById("studentCard");
const cardInfo = document.getElementById("cardInfo");
const closeCard = document.getElementById("closeCard");

// ===============================
// LOGIN ALUMNO (SIN CAMBIOS)
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
  teacherLogin.style.display = "none";
  teacherPanel.style.display = "none";

  userDisplay.textContent = "Welcome " + student.name;
  updateUI();
});

// ===============================
// CERRAR SESIÓN ALUMNO
// ===============================
logoutBtn.addEventListener("click", () => {
  if (currentStudent) {
    let students = JSON.parse(localStorage.getItem("students")) || [];
    students.forEach(s => {
      if (s.name === currentStudent.name) s.online = false;
    });
    localStorage.setItem("students", JSON.stringify(students));
  }
  location.reload();
});

// ===============================
// LOGIN MAESTRO
// ===============================
openTeacherBtn.addEventListener("click", () => {
  loginCard.style.display = "none";
  mainContent.style.display = "none";
  teacherPanel.style.display = "none";
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
// CERRAR SESIÓN MAESTRO
// ===============================
closeTeacher.addEventListener("click", () => {
  teacherPanel.style.display = "none";
  teacherLogin.style.display = "none";
  loginCard.style.display = "block";

  clearInterval(autoRefresh);
  teacherUser.value = "";
  teacherPass.value = "";

  alert("Sesión de maestro cerrada 👋");
});

// ===============================
// PANEL MAESTRO CON GRUPOS AUTOMÁTICOS
// ===============================
function loadTeacherPanel() {
  let students = JSON.parse(localStorage.getItem("students")) || [];

  // 🔹 LLENAR SELECT DE GRUPOS AUTOMÁTICAMENTE
  const groups = [...new Set(students.map(s => s.group))];
  groupSelect.innerHTML = `<option value="">Todos los grupos</option>`;
  groups.forEach(g => {
    const opt = document.createElement("option");
    opt.value = g;
    opt.textContent = g;
    groupSelect.appendChild(opt);
  });

  const selectedGroup = groupSelect.value;
  const fg = filterGrade.value.toLowerCase();
  const fgr = filterGroup.value.toLowerCase();

  students = students.filter(s =>
    (!selectedGroup || s.group === selectedGroup) &&
    (!fg || s.grade.toLowerCase().includes(fg)) &&
    (!fgr || s.group.toLowerCase().includes(fgr))
  );

  connectedList.innerHTML = "";
  students.filter(s => s.online).forEach(s => {
    connectedList.innerHTML += `<li>${s.name} (${s.grade}-${s.group})</li>`;
  });

  studentsTable.innerHTML = "";
  const ordered = [...students].sort((a,b)=>b.score-a.score);

  ordered.forEach(s => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${s.name}</td>
      <td>${s.grade}</td>
      <td>${s.group}</td>
      <td>${s.score}</td>
      <td>${s.level}</td>
      <td>${s.stars}</td>
    `;
    row.addEventListener("click", () => showStudentCard(s));
    studentsTable.appendChild(row);
  });

  drawChart(ordered);
}

// ===============================
// ACTUALIZAR AL CAMBIAR GRUPO
// ===============================
groupSelect.addEventListener("change", loadTeacherPanel);

// ===============================
// FICHA INDIVIDUAL
// ===============================
function showStudentCard(s) {
  studentCard.style.display = "block";
  cardInfo.innerHTML = `
    <strong>Nombre:</strong> ${s.name}<br>
    <strong>Grado:</strong> ${s.grade}<br>
    <strong>Grupo:</strong> ${s.group}<br>
    <strong>Puntaje:</strong> ${s.score}<br>
    <strong>Nivel:</strong> ${s.level}<br>
    <strong>Estrellas:</strong> ${s.stars}
  `;
}

closeCard.addEventListener("click", () => {
  studentCard.style.display = "none";
});

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
