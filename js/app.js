console.log("🔥 app.js cargado");

document.addEventListener("DOMContentLoaded", () => {
  const hamburger = document.getElementById("hamburger");
  const nav = document.getElementById("nav");
  const themeBtn = document.getElementById("themeToggle");

  const startBtn = document.getElementById("startGame");
  const checkBtn = document.getElementById("checkAnswer");
  const questionText = document.getElementById("questionText");
  const answerInput = document.getElementById("answerInput");

  const scoreText = document.getElementById("scoreText");
  const levelText = document.getElementById("levelText");

  // 🔹 ESTADO DEL JUEGO
  let score = 20;
  let level = 3;
  let currentQuestion = null;

  const questions = [
    { en: "Hello", es: "Hola" },
    { en: "Goodbye", es: "Adiós" },
    { en: "Please", es: "Por favor" },
    { en: "Thank you", es: "Gracias" }
  ];

  // 🔹 Inicializar UI
  scoreText.textContent = score + " puntos";
  levelText.textContent = "Nivel " + level;

  // Menú hamburguesa
  hamburger.addEventListener("click", () => {
    nav.classList.toggle("open");
  });

  // 🌙 Tema oscuro/claro
  themeBtn.addEventListener("click", () => {
    document.body.classList.toggle("dark");
  });

  // ▶ Iniciar ejercicio
  startBtn.addEventListener("click", () => {
    currentQuestion =
      questions[Math.floor(Math.random() * questions.length)];

    questionText.textContent = `¿Cómo se dice "${currentQuestion.en}" en español?`;

    answerInput.value = "";
    answerInput.style.display = "block";
    answerInput.focus();

    startBtn.style.display = "none";
    checkBtn.style.display = "block";
  });

  // ✅ Comprobar respuesta
  checkBtn.addEventListener("click", () => {
    if (!currentQuestion) return;

    const userAnswer = answerInput.value.trim().toLowerCase();

    if (!userAnswer) {
      alert("Escribe una respuesta 🙂");
      return;
    }

    if (userAnswer === currentQuestion.es.toLowerCase()) {
      score += 5;
      alert("✅ Correcto! +5 puntos");
    } else {
      alert(`❌ Incorrecto. Era: ${currentQuestion.es}`);
    }

    // 🏆 Subir nivel cada 20 puntos
    if (score >= level * 20) {
      level++;
      alert("🎉 Subiste de nivel!");
    }

    // 🔄 Actualizar UI
    scoreText.textContent = score + " puntos";
    levelText.textContent = "Nivel " + level;

    // 🔄 Reset UI
    questionText.textContent = "Pulsa para comenzar";
    answerInput.style.display = "none";
    checkBtn.style.display = "none";
    startBtn.style.display = "block";

    currentQuestion = null;
  });
});
