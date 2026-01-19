console.log("🔥 app.js cargado");

document.addEventListener("DOMContentLoaded", () => {
  console.log("🔥 DOM listo");

  const hamburger = document.getElementById("hamburger");
  const nav = document.getElementById("nav");
  const themeBtn = document.getElementById("themeToggle");
  const startBtn = document.getElementById("startGame");

  console.log("Elementos:", hamburger, nav, themeBtn, startBtn);

  // Menú hamburguesa
  if (hamburger && nav) {
    hamburger.addEventListener("click", () => {
      nav.classList.toggle("open");
      console.log("☰ click");
    });
  }

  // Tema oscuro/claro
  if (themeBtn) {
    themeBtn.addEventListener("click", () => {
      const currentBg = document.body.style.background;
      document.body.style.background =
        currentBg === "black" ? "white" : "black";
      console.log("🌙 click");
    });
  }

  // Botón ejercicio
  if (startBtn) {
    startBtn.addEventListener("click", () => {
      alert("Correcto 🎉 +5 puntos");
      console.log("🎮 click");
    });
  }
});
