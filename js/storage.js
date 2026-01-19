export function initStorage() {
  if (!localStorage.getItem("score")) {
    localStorage.setItem("score", "0");
  }

  if (!localStorage.getItem("level")) {
    localStorage.setItem("level", "1");
  }
}

export function addScore(points) {
  let score = parseInt(localStorage.getItem("score"));
  score += points;
  localStorage.setItem("score", score);

  checkLevelUp();
}

export function getScore() {
  return parseInt(localStorage.getItem("score"));
}

export function getLevel() {
  return parseInt(localStorage.getItem("level"));
}

function checkLevelUp() {
  let score = getScore();
  let level = getLevel();

  if (score >= level * 10) {
    level++;
    localStorage.setItem("level", level);
    alert("🎉 ¡Subiste al nivel " + level + "!");
  }
}

