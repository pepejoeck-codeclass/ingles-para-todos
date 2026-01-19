export function initUI() {
  const hamburger = document.getElementById("hamburger");
  const nav = document.getElementById("nav");

  hamburger.addEventListener("click", () => {
    nav.classList.toggle("open");
  });

  const themeBtn = document.getElementById("themeToggle");
  themeBtn.addEventListener("click", toggleTheme);

  const savedTheme = localStorage.getItem("theme");
  if (savedTheme) {
    document.documentElement.setAttribute("data-theme", savedTheme);
  }
}

function toggleTheme() {
  const current =
    document.documentElement.getAttribute("data-theme") || "light";

  const next = current === "dark" ? "light" : "dark";
  document.documentElement.setAttribute("data-theme", next);
  localStorage.setItem("theme", next);
}

