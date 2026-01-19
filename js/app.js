console.log("🔥 app.js cargado");

document.addEventListener("DOMContentLoaded", () => {
  const hamburger = document.getElementById("hamburger");
  const nav = document.getElementById("nav");
  const themeBtn = document.getElementById("themeToggle");
  const startBtn = document.getElementById("startGame");

  const scoreText = document.getElementById("scoreText");
  const levelText = document.getElementById("levelText");

  let score = 20;
  let level = 3;

  const questions = [
    { en: "Hello", es: "Hola" },
    { en: "Goodbye", es: "Adiós" },
    { en: "Please", es: "Por favor" },
    { en: "Thank you", es: "Gracias" }
  ];

  // Menú hamburguesa
  if (hamburger && nav) {
    hamburger.addEventListener("click", () => {
      nav.classList.toggle("open");
    });
  }

  // Tema oscuro/claro
  if (themeBtn) {
    themeBtn.addEventListener("click", () => {
      document.body.classList.toggle("dark");
    });
  }

  // Iniciar ejercicio
  if (startBtn) {
    startBtn.addEventListener("click", () => {
      const q = questions[Math.floor(Math.random() * questions.length)];
      const answer = prompt(`¿Cómo se dice "${q.en}" en español?`);

      if (!answer) return;

      if (answer.trim().toLowerCase() === q.es.toLowerCase()) {
        score += 5;
        alert("✅ Correcto! +5 puntos");
      } else {
        alert(`❌ Incorrecto. Era: ${q.es}`);
      }

      // Subir nivel cada 20 puntos
      if (score >= level * 20) {
        level++;
        alert("🎉 Subiste de nivel!");
      }

      scoreText.textContent = score + " puntos";
      levelText.textContent = "Nivel " + level;
    });
  }
});
