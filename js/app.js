console.log("🔥 app.js cargado correctamente");

document.addEventListener("DOMContentLoaded", () => {
  console.log("🔥 DOM listo");

  const hamburger = document.getElementById("hamburger");
  const nav = document.getElementById("nav");
  const themeBtn = document.getElementById("themeToggle");
  const startBtn = document.getElementById("startGame");

  console.log("Elementos:", hamburger, nav, themeBtn, startBtn);

  if (hamburger && nav) {
    hamburger.addEventListener("click", () => {
      nav.classList.toggle("open");
      console.log("☰ click");
    });
  }

  if (themeBtn) {
    themeBtn.addEventListener("click", () => {
      document.body.style.background =
        document.body.style.background === "black" ? "white" : "black";
      console.log("🌙 click");
    });
  }

  if (startBtn) {
    startBtn.addEventListener("click", () => {
      alert("Correcto 🎉 +5 puntos");
      console.log("🎮 click");
    });
  }
});
