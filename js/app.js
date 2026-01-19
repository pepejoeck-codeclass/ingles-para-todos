console.log("🔥 app.js cargado OK");

document.addEventListener("DOMContentLoaded", () => {
  const hamburger = document.getElementById("hamburger");
  const nav = document.getElementById("nav");
  const themeBtn = document.getElementById("themeToggle");

  const startBtn = document.getElementById("startGame");
  const scoreText = document.getElementById("scoreText");
  const levelText = document.getElementById("levelText");

  let score = 20;
  let level = 3;

  // 🔹 UI inicial
  scoreText.textContent = score + " puntos";
  levelText.textContent = "Nivel " + level;

  // ☰ menú
  hamburger.addEventListener("click", () => {
    nav.classList.toggle("open");
  });

  // 🌙 tema
  themeBtn.addEventListener("click", () => {
    document.body.classList.toggle("dark");
  });

  // 🎮 ejercicio simple
  startBtn.addEventListener("click", () => {
    const correct = confirm('¿"Hello" = Hola?');

    if (correct) {
      score += 5;
      alert("✅ Correcto +5 puntos");
    } else {
      alert("❌ Incorrecto");
    }

    if (score >= level * 20) {
      level++;
      alert("🎉 Subiste de nivel");
    }

    scoreText.textContent = score + " puntos";
    levelText.textContent = "Nivel " + level;
  });
});
