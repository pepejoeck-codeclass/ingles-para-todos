const translations = {
  es: {
    title: "Inglés Para Todos",
    lessons: "Lecciones",
    games: "Juegos",
    progress: "Progreso"
  },
  en: {
    title: "English For Everyone",
    lessons: "Lessons",
    games: "Games",
    progress: "Progress"
  }
};

export function initI18n() {
  const lang = localStorage.getItem("lang") || "es";
  applyLang(lang);
}

export function applyLang(lang) {
  document.querySelectorAll("[data-i18n]").forEach(el => {
    const key = el.dataset.i18n;
    el.textContent = translations[lang][key];
  });

  localStorage.setItem("lang", lang);
}

