import { initUI } from "./ui.js";
import { initStorage, getScore, getLevel } from "./storage.js";
import { initGames } from "./gameLogic.js";
import { initI18n } from "./i18n.js";

document.addEventListener("DOMContentLoaded", () => {
  initStorage();
  initI18n();
  initUI();
  initGames();

  updateStats();
});

function updateStats() {
  document.getElementById("scoreText").textContent =
    getScore() + " puntos";

  document.getElementById("levelText").textContent =
    "Nivel " + getLevel();
}

