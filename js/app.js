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
// MENSAJES MOTIVADORES
// ===============================
const messages = [
  "🔥 Excellent job",
  "⭐ You're doing great",
  "👏 Keep it up",
  "💪 You can do it",
  "🎯 Perfect"
];

// ===============================
// DATOS
// ===============================
let currentStudent = null;
let lessonIndex = 0;
let mistakes = 0;
let chartInstance = null;

// ===============================
// LECCIÓN
// ===============================
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
const refreshBtn = document.getElementById("refreshBtn");

const studentsTable = document.getElementById("studentsTable");
const connectedList = document.getElementById("connectedList");
const exportBtn = document.getElementById("exportBtn");

// ===============================
// MENÚ HAMBURGUESA
// ===============================
const hamburger = document.getElementById("hamburger");
const nav = document.getElementById("nav");

hamburger.addEventListener("click", () => {
  nav.style.display = nav.style.display === "block" ? "none" : "block";
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
    student = {
      name: finalName,
      grade,
      group,
      score: 0,
      level: 1,
      stars: 0,
      online: true
    };
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
// SISTEMA DE LECCIÓN
// ===============================
startBtn.addEventListener("click", () => {
  unlockAudio();
  lessonIndex = 0;
  mistakes = 0;
  showQuestion();
});

function showQuestion() {
  const q = lesson[lessonIndex];
  questionText.textContent = `¿Cómo se dice "${q.en}" en español?`;
  answerInput.value = "";
  feedback.textContent = "";
}

checkBtn.addEventListener("click", () => {
  const userAnswer = answerInput.value.trim().toLowerCase();
  const correct = lesson[lessonIndex].es;

  if (userAnswer === correct) {

    soundCorrect.currentTime = 0;
    soundCorrect.play();

    const msg = messages[Math.floor(Math.random() * messages.length)];
    feedback.textContent = msg;
    feedback.style.color = "green";

    lessonIndex++;
    currentStudent.score += 5;
    currentStudent.stars += 1;

    if (lessonIndex >= lesson.length) {

      if (mistakes === 0) {
        currentStudent.level++;

        soundLevel.currentTime = 0;
        soundLevel.play();

        feedback.textContent = "🎉 SIGUIENTE NIVEL 🎉";
        feedback.style.color = "gold";
      } else {
        feedback.textContent = "❌ Fallaste, reinicia la lección";
        lessonIndex = 0;
        mistakes = 0;
        return;
      }
    } else {
      showQuestion();
    }

  } else {

    soundError.currentTime = 0;
    soundError.play();

    mistakes++;
    feedback.textContent = "❌ Incorrecto, reinicia toda la lección";
    feedback.style.color = "red";
    lessonIndex = 0;
    mistakes = 0;
  }

  assignMedal();
  saveProgress();
  updateUI();
});

// ===============================
// MEDALLAS
// ===============================
function assignMedal() {
  if (currentStudent.level >= 3) medalText.textContent = "🥇 Medalla Oro";
  else if (currentStudent.level === 2) medalText.textContent = "🥈 Medalla Plata";
  else medalText.textContent = "🥉 Medalla Bronce";
}

// ===============================
// GUARDAR PROGRESO
// ===============================
function saveProgress() {
  let students = JSON.parse(localStorage.getItem("students")) || [];
  students = students.map(s => {
    if (currentStudent && s.name === currentStudent.name) return currentStudent;
    return s;
  });
  localStorage.setItem("students", JSON.stringify(students));
}

function updateUI() {
  scoreText.textContent = `${currentStudent.score} puntos`;
  levelText.textContent = `Nivel ${currentStudent.level}`;
  starsText.textContent = `⭐ Estrellas: ${currentStudent.stars}`;
}

// ===============================
// LOGIN MAESTRO (CON SESIÓN RECORDADA)
// ===============================
openTeacherBtn.addEventListener("click", () => {
  loginCard.style.display = "none";
  mainContent.style.display = "none";
  teacherLogin.style.display = "block";
});

teacherLoginBtn.addEventListener("click", () => {
  if (teacherUser.value === "Jose de Jesus Ramos Flores" && teacherPass.value === "161286") {

    localStorage.setItem("teacherLogged", "true");

    teacherLogin.style.display = "none";
    teacherPanel.style.display = "block";
    loadTeacherPanel();

  } else {
    alert("❌ Usuario o contraseña incorrectos");
  }
});

// ===============================
// 🔴 CERRAR SESIÓN MAESTRO (LIMPIA SESIÓN)
// ===============================
closeTeacher.addEventListener("click", () => {

  localStorage.removeItem("teacherLogged");

  teacherPanel.style.display = "none";
  teacherLogin.style.display = "none";

  loginCard.style.display = "block";
  mainContent.style.display = "none";

  teacherUser.value = "";
  teacherPass.value = "";
});

// ===============================
// 🔄 BOTÓN ACTUALIZAR EN VIVO
// ===============================
refreshBtn.addEventListener("click", () => {
  loadTeacherPanel();
});

// ===============================
// PANEL MAESTRO
// ===============================
function loadTeacherPanel() {
  const students = JSON.parse(localStorage.getItem("students")) || [];

  connectedList.innerHTML = "";
  students.filter(s => s.online).forEach(s => {
    connectedList.innerHTML += `<li>${s.name} (${s.grade}-${s.group})</li>`;
  });

  studentsTable.innerHTML = "";
  const ordered = [...students].sort((a,b)=>b.score-a.score);

  ordered.forEach(s => {
    studentsTable.innerHTML += `
      <tr>
        <td>${s.name}</td>
        <td>${s.grade}</td>
        <td>${s.group}</td>
        <td>${s.score}</td>
        <td>${s.level}</td>
        <td>${s.stars}</td>
      </tr>`;
  });

  drawChart(ordered);
}

// ===============================
// EXPORTAR EXCEL
// ===============================
exportBtn.addEventListener("click", () => {
  const students = JSON.parse(localStorage.getItem("students")) || [];

  let csv = "Alumno,Grado,Grupo,Puntaje,Nivel,Estrellas\n";
  students.forEach(s => {
    csv += `${s.name},${s.grade},${s.group},${s.score},${s.level},${s.stars}\n`;
  });

  const blob = new Blob([csv], { type: "text/csv" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "alumnos.csv";
  a.click();
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

// ===============================
// 🟢 AUTO-ABRIR PANEL MAESTRO SI YA ESTABA LOGUEADO
// ===============================
window.addEventListener("load", () => {
  if (localStorage.getItem("teacherLogged") === "true") {
    loginCard.style.display = "none";
    mainContent.style.display = "none";
    teacherLogin.style.display = "none";
    teacherPanel.style.display = "block";
    loadTeacherPanel();
  }
});
