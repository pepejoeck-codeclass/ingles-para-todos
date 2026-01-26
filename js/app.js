document.addEventListener("DOMContentLoaded", () => {
    // ===============================
    // 🔊 SONIDOS
    // ===============================
    const soundCorrect = new Audio("assets/sounds/correct.mp3");
    const soundError = new Audio("assets/sounds/wrong.mp3");
    const soundLevel = new Audio("assets/sounds/levelup.mp3");

    const TEACHER_USER = "Jose de Jesus Ramos Flores";
    const TEACHER_PASS = "161286";

    const questions = [
        { q: "How do you say 'Hola' in English?", a: "hello" },
        { q: "How do you say 'Adiós' in English?", a: "goodbye" },
        { q: "How do you say 'Por favor' in English?", a: "please" },
        { q: "How do you say 'Gracias' in English?", a: "thank you" },
        { q: "How do you say 'Gato' in English?", a: "cat" },
        { q: "How do you say 'Perro' in English?", a: "dog" }
    ];

    // REFERENCIAS
    const loginCard = document.getElementById("loginCard");
    const mainContent = document.getElementById("mainContent");
    const teacherPanel = document.getElementById("teacherPanel");
    const teacherLogin = document.getElementById("teacherLogin");
    const logoutBtn = document.getElementById("logoutBtn");
    const openTeacherBtn = document.getElementById("openTeacherBtn");
    const loginBtn = document.getElementById("loginBtn");
    const teacherLoginBtn = document.getElementById("teacherLoginBtn");
    const closeTeacherLogin = document.getElementById("closeTeacherLogin");
    const closeTeacherPanel = document.getElementById("closeTeacherPanel");
    const refreshTeacherBtn = document.getElementById("refreshTeacher");
    const exportBtn = document.getElementById("exportBtn");
    const startBtn = document.getElementById("startGame");
    const checkBtn = document.getElementById("checkAnswer");
    const themeToggle = document.getElementById("themeToggle");
    const hamburger = document.getElementById("hamburger");
    const nav = document.getElementById("nav");

    const gradeInput = document.getElementById("gradeInput");
    const groupInput = document.getElementById("groupInput");
    const usernameInput = document.getElementById("usernameInput");
    const emailInput = document.getElementById("emailInput");
    const userDisplay = document.getElementById("userDisplay");
    const teacherUser = document.getElementById("teacherUser");
    const teacherPass = document.getElementById("teacherPass");
    const questionText = document.getElementById("questionText");
    const answerInput = document.getElementById("answerInput");
    const feedback = document.getElementById("feedback");
    const scoreText = document.getElementById("scoreText");
    const levelText = document.getElementById("levelText");
    const starsText = document.getElementById("starsText");
    const timeText = document.getElementById("timeText");
    const studentsTable = document.getElementById("studentsTable");
    const groupSelect = document.getElementById("groupSelect");

    let currentUser = localStorage.getItem("username");
    let currentGrade = localStorage.getItem("grade");
    let currentGroup = localStorage.getItem("group");
    
    let score = 0, level = 1, stars = 0, timeWorked = 0;
    let timerInterval = null, currentQuestion = null;

    // ===============================
    // 🛠️ REPARACIÓN: BOTÓN HAMBURGUESA
    // ===============================
    hamburger.addEventListener("click", () => {
        // Usamos getComputedStyle para leer el estado real del CSS
        const display = window.getComputedStyle(nav).display;
        nav.style.display = (display === "none") ? "block" : "none";
    });

    // ===============================
    // 🌙 REPARACIÓN: MODO OSCURO
    // ===============================
    function checkTheme() {
        if (localStorage.getItem("theme") === "dark") {
            document.body.classList.add("dark");
        }
    }

    themeToggle.addEventListener("click", () => {
        document.body.classList.toggle("dark");
        const mode = document.body.classList.contains("dark") ? "dark" : "light";
        localStorage.setItem("theme", mode);
    });

    // ===============================
    // 📥 NUEVO: EXPORTAR A EXCEL (CSV)
    // ===============================
    exportBtn.addEventListener("click", () => {
        let csv = "\uFEFFAlumno,Grado,Grupo,Puntaje,Nivel,Estrellas,Tiempo\n";
        
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key.startsWith("user_")) {
                const s = JSON.parse(localStorage.getItem(key));
                const min = Math.floor(s.timeWorked / 60);
                const sec = s.timeWorked % 60;
                csv += `${s.username},${s.grade},${s.group},${s.score},${s.level},${s.stars},${min}m ${sec}s\n`;
            }
        }

        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.setAttribute("href", url);
        link.setAttribute("download", "Reporte_Alumnos.csv");
        link.click();
    });

    // --- EL RESTO DE TU LÓGICA (NO MODIFICADA) ---
    init();

    function init() {
        checkTheme();
        if (currentUser && currentGrade && currentGroup) { showStudentInterface(); } 
        else { showLoginInterface(); }
    }

    function loadUserData() {
        const data = JSON.parse(localStorage.getItem(`user_${currentUser}`));
        if (data) {
            score = data.score || 0; level = data.level || 1;
            stars = data.stars || 0; timeWorked = data.timeWorked || 0;
        }
        updateDisplay();
    }

    function saveProgress() {
        if (!currentUser) return;
        const data = {
            username: currentUser, grade: currentGrade, group: currentGroup,
            score: score, level: level, stars: stars, timeWorked: timeWorked
        };
        localStorage.setItem(`user_${currentUser}`, JSON.stringify(data));
    }

    function updateDisplay() {
        scoreText.textContent = `${score} puntos`;
        levelText.textContent = `Nivel ${level}`;
        starsText.textContent = `⭐ Estrellas: ${stars}`;
        const min = Math.floor(timeWorked / 60);
        const sec = timeWorked % 60;
        timeText.textContent = `⏱ Tiempo: ${min}m ${sec}s`;
    }

    function startTimer() {
        if (timerInterval) clearInterval(timerInterval);
        timerInterval = setInterval(() => {
            timeWorked++;
            updateDisplay();
            if (timeWorked % 5 === 0) saveProgress();
        }, 1000);
    }

    function stopTimer() { clearInterval(timerInterval); timerInterval = null; }

    loginBtn.addEventListener("click", () => {
        const name = usernameInput.value.trim();
        const g = gradeInput.value.trim();
        const gr = groupInput.value.trim().toUpperCase();
        if (!name || !g || !gr) return alert("Completa los datos");
        currentUser = name; currentGrade = g; currentGroup = gr;
        localStorage.setItem("username", currentUser);
        localStorage.setItem("grade", currentGrade);
        localStorage.setItem("group", currentGroup);
        showStudentInterface();
    });

    openTeacherBtn.addEventListener("click", () => {
        loginCard.style.display = "none";
        teacherLogin.style.display = "block";
    });

    closeTeacherLogin.addEventListener("click", () => {
        teacherLogin.style.display = "none";
        loginCard.style.display = "block";
    });

    teacherLoginBtn.addEventListener("click", () => {
        if (teacherUser.value === TEACHER_USER && teacherPass.value === TEACHER_PASS) {
            teacherLogin.style.display = "none";
            teacherPanel.style.display = "block";
            loadTeacherPanel();
        } else { alert("Error"); }
    });

    closeTeacherPanel.addEventListener("click", () => {
        teacherPanel.style.display = "none";
        loginCard.style.display = "block";
    });

    startBtn.addEventListener("click", () => {
        currentQuestion = questions[Math.floor(Math.random() * questions.length)];
        questionText.textContent = currentQuestion.q;
        feedback.textContent = "";
        answerInput.value = "";
        answerInput.focus();
    });

    checkBtn.addEventListener("click", () => {
        if (!currentQuestion) return;
        if (answerInput.value.trim().toLowerCase() === currentQuestion.a) {
            feedback.textContent = "🔥 ¡Bien!";
            score += 10; stars++;
            if (score % 50 === 0) level++;
            currentQuestion = null;
        } else { feedback.textContent = "❌ Error"; }
        updateDisplay(); saveProgress();
    });

    logoutBtn.addEventListener("click", () => {
        saveProgress(); stopTimer();
        localStorage.removeItem("username");
        location.reload();
    });

    function showStudentInterface() {
        loginCard.style.display = "none";
        mainContent.style.display = "block";
        logoutBtn.style.display = "inline-block";
        userDisplay.textContent = `👤 Bienvenido, ${currentUser}`;
        loadUserData(); startTimer();
    }

    function showLoginInterface() {
        loginCard.style.display = "block";
        mainContent.style.display = "none";
    }

    function loadTeacherPanel() {
        studentsTable.innerHTML = "";
        let allStudents = [];
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key.startsWith("user_")) allStudents.push(JSON.parse(localStorage.getItem(key)));
        }

        const groups = new Set(allStudents.map(s => s.group));
        groupSelect.innerHTML = '<option value="">Todos los grupos</option>';
        groups.forEach(g => {
            const opt = document.createElement("option");
            opt.value = g; opt.textContent = `Grupo ${g}`;
            groupSelect.appendChild(opt);
        });

        allStudents.forEach(s => {
            const row = document.createElement("tr");
            const min = Math.floor(s.timeWorked / 60);
            const sec = s.timeWorked % 60;
            row.innerHTML = `<td>${s.username}</td><td>${s.grade}</td><td>${s.group}</td><td>${s.score}</td><td>${s.level}</td><td>${s.stars}</td><td>${min}m ${sec}s</td>`;
            studentsTable.appendChild(row);
        });
    }
});
