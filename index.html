# ARCHIVO 1 — index.html (COMPLETO Y CORREGIDO)

```html
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <title>Inglés Para Todos</title>
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <link rel="stylesheet" href="css/styles.css">
</head>
<body>

<header>
  <h1>Inglés Para Todos</h1>

  <button id="logoutBtn" style="margin-top:10px;">🚪 Cambiar usuario</button>

  <div class="header-buttons">
    <button id="themeToggle">🌙</button>
    <button id="hamburger" class="hamburger">☰</button>
  </div>

  <nav id="nav">
    <a href="#" class="lesson" data-lesson="1">Lección 1</a>
    <a href="#" class="lesson locked" data-lesson="2">Lección 2 🔒</a>
    <a href="#" class="lesson locked" data-lesson="3">Lección 3 🔒</a>

    <a href="#">Juegos</a>
    <a href="#">Progreso</a>

    <!-- BOTÓN MODO MAESTRO (IMPORTANTE type=button) -->
    <button id="openTeacher" type="button" style="background:none;border:none;color:blue;cursor:pointer;font-size:16px;">
      👨‍🏫 Modo Maestro
    </button>
  </nav>
</header>

<!-- LOGIN -->
<section class="card" id="loginCard">
  <h2>Iniciar sesión</h2>

  <input type="text" id="gradeInput" placeholder="Grado (ej. 1°)" />
  <input type="text" id="groupInput" placeholder="Grupo (ej. A)" />

  <input type="text" id="usernameInput" placeholder="Escribe tu nombre completo" />

  <p>— o —</p>

  <input type="email" id="emailInput" placeholder="Escribe tu correo" />

  <button id="loginBtn">Entrar</button>
</section>

<!-- CONTENIDO PRINCIPAL -->
<main id="mainContent" style="display:none;">

  <!-- JUEGO -->
  <section class="card">
    <h2 id="questionText">Pulsa para comenzar</h2>

    <input type="text" id="answerInput" placeholder="Escribe tu respuesta..." />

    <button id="startGame">Iniciar ejercicio</button>
    <button id="checkAnswer">Responder</button>
  </section>

  <!-- PUNTAJE -->
  <section class="card">
    <h2>Puntaje</h2>
    <p id="scoreText">0 puntos</p>
    <p id="levelText">Nivel 1</p>
  </section>

  <!-- PANEL MAESTRO -->
  <section id="teacherPanel" class="card" style="display:none;">
    <h2>👨‍🏫 Panel del Maestro</h2>

    <table border="1" width="100%">
      <thead>
        <tr>
          <th>Alumno</th>
          <th>Grado</th>
          <th>Grupo</th>
          <th>Puntaje</th>
          <th>Nivel</th>
        </tr>
      </thead>
      <tbody id="studentsTable"></tbody>
    </table>

    <br>

    <button id="closeTeacher">❌ Cerrar</button>
  </section>
</main>

<script src="js/app.js"></script>
</body>
</html>
```

---

# ARCHIVO 2 — app.js (COMPLETO Y FUNCIONANDO)

```javascript
// ===== SONIDOS =====
const soundCorrect = new Audio("assets/sounds/correct.mp3");
const soundWrong = new Audio("assets/sounds/wrong.mp3");
const soundLevelUp = new Audio("assets/sounds/levelup.mp3");

let username = localStorage.getItem("username") || null;
let score = 0;
let level = 1;
let unlockedLesson = 1;

function unlockSounds() {
  [soundCorrect, soundWrong, soundLevelUp].forEach(sound => {
    sound.play().then(() => {
      sound.pause();
      sound.currentTime = 0;
    }).catch(() => {});
  });
}

document.addEventListener("DOMContentLoaded", () => {

  const loginCard = document.getElementById("loginCard");
  const mainContent = document.getElementById("mainContent");
  const usernameInput = document.getElementById("usernameInput");
  const emailInput = document.getElementById("emailInput");
  const gradeInput = document.getElementById("gradeInput");
  const groupInput = document.getElementById("groupInput");
  const loginBtn = document.getElementById("loginBtn");
  const logoutBtn = document.getElementById("logoutBtn");

  const openTeacher = document.getElementById("openTeacher");
  const teacherPanel = document.getElementById("teacherPanel");
  const closeTeacher = document.getElementById("closeTeacher");

  // ===== AUTO LOGIN =====
  if (username) {
    loginCard.style.display = "none";
    mainContent.style.display = "block";
    loadProgress();
  }

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

    loadProgress();
    registerStudent();
  });

  // ===== LOGOUT =====
  logoutBtn.addEventListener("click", () => {
    if (confirm("¿Quieres cerrar sesión y cambiar de usuario?")) {
      localStorage.removeItem("username");
      location.reload();
    }
  });

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
      soundLevelUp.play();
      alert("🎉 Subiste de nivel");
    }

    saveProgress();
    updateStudentProgress();

    scoreText.textContent = score + " puntos";
    levelText.textContent = "Nivel " + level;

    questionText.textContent = "Pulsa para comenzar";
    currentQuestion = null;
  });

  // ===== MODO MAESTRO FUNCIONANDO =====
  openTeacher.addEventListener("click", (e) => {
    e.preventDefault();
    teacherPanel.style.display = "block";
    loadStudentsForTeacher();
  });

  closeTeacher.addEventListener("click", () => {
    teacherPanel.style.display = "none";
  });

});

// ===== PROGRESO =====
function saveProgress() {
  if (!username) return;
  localStorage.setItem(`user_${username}_score`, score);
  localStorage.setItem(`user_${username}_level`, level);
}

function loadProgress() {
  if (!username) return;

  score = parseInt(localStorage.getItem(`user_${username}_score`)) || 0;
  level = parseInt(localStorage.getItem(`user_${username}_level`)) || 1;

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
```
