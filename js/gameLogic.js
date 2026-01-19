import { addScore } from "./storage.js";

export function initGames() {
  const btn = document.getElementById("startGame");

  if (!btn) {
    console.error("❌ No se encontró el botón startGame");
    return;
  }

  btn.addEventListener("click", () => {
    alert("Correcto 🎉 +5 puntos");
    addScore(5);
    location.reload();
  });
}
