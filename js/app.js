console.log("🔥 app.js cargado correctamente");

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

  let score = 0;
  let level = 1;
  let currentQuestion = null;

  const questions = [
    { en: "Hello", es: "Hola" },
    { en: "Goodbye", es: "Adiós" },
    { en: "Please", es: "Por favor" },
    { en: "Thank you", es: "Gracias" }
  ];

  // MENÚ
  hamburger.addEventListener("click", () => {
    nav.classList.toggle("open");
  });

  // TEMA OSCURO
  themeBtn.addEventListener("click", () => {
    document.body.classList.toggle("dark");
  });

  // INICIAR EJERCICIO
  startBtn.addEventListener("click", () => {
    currentQuestion =
      questions[Math.floor(Math.random() * questions.length)];

    questionText.textContent =
      `¿Cómo se dice "${currentQuestion.en}" en español?`;

    answerInput.value = "";
    answerInput.focus();
  });

  // RESPONDER
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
  soundCorrect.play(); // 🔊 sonido correcto

  // Animación correcta
  document.querySelector(".card").classList.add("correct");
  setTimeout(() => {
    document.querySelector(".card").classList.remove("correct");
  }, 500);

  alert("✅ Correcto +5 puntos");
} else {
  soundWrong.play(); // 🔊 sonido incorrecto

  // Animación incorrecta
  document.querySelector(".card").classList.add("wrong");
  setTimeout(() => {
    document.querySelector(".card").classList.remove("wrong");
  }, 500);

  alert(`❌ Incorrecto. Era: ${currentQuestion.es}`);
}

    // SUBIR NIVEL CADA 20 PUNTOS
    if (score >= level * 20) {
  level++;
  soundLevelUp.play(); // 🔊 subir nivel

  // Animación de nivel
  const levelCard = document.getElementById("levelText");
  levelCard.classList.add("level-up");
  setTimeout(() => {
    levelCard.classList.remove("level-up");
  }, 1000);

  alert("🎉 Subiste de nivel");
}

    scoreText.textContent = score + " puntos";
    levelText.textContent = "Nivel " + level;

    questionText.textContent = "Pulsa para comenzar";
    currentQuestion = null;
  });
});
