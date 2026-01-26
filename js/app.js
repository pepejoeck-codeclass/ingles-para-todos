document.addEventListener("DOMContentLoaded", () => {
    // ===============================
    // 🔊 SONIDOS (PRESERVADOS)
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
        { q: "How do you say 'Perro' in English?", a: "dog" },
        { q: "How do you say 'Rojo' in English?", a: "red" },
        { q: "How do you say 'Azul' in English?", a: "blue" }
    ];

    // REFERENCIAS
    const loginCard = document.getElementById("loginCard"),
          mainContent = document.getElementById("mainContent"),
          teacherPanel = document.getElementById("teacherPanel"),
          teacherLogin = document.getElementById("teacherLogin"),
          logoutBtn = document.getElementById("logoutBtn"),
          openTeacherBtn = document.getElementById("openTeacherBtn"),
          loginBtn = document.getElementById("loginBtn"),
          teacherLoginBtn = document.getElementById("teacherLoginBtn"),
          closeTeacherLogin = document.getElementById("closeTeacherLogin"),
          closeTeacherPanel = document.getElementById("closeTeacherPanel"),
          refreshTeacherBtn = document.getElementById("refreshTeacher"),
          exportBtn = document.getElementById("exportBtn"),
          startBtn = document.getElementById("startGame"),
          checkBtn = document.getElementById("checkAnswer"),
          themeToggle = document.getElementById("themeToggle"),
          hamburger = document.getElementById("hamburger"),
          nav = document.getElementById("nav"),
          groupSelect = document.getElementById("groupSelect"),
          studentsTable = document.getElementById("studentsTable");

    const gradeInput = document.getElementById("gradeInput"),
          groupInput = document.getElementById("groupInput"),
          usernameInput = document.getElementById("usernameInput"),
          userDisplay = document.getElementById("userDisplay"),
          teacherUser = document.getElementById("teacherUser"),
          teacherPass = document.getElementById("teacherPass"),
          questionText = document.getElementById("questionText"),
          answerInput = document.getElementById("answerInput"),
          feedback = document.getElementById("feedback"),
          scoreText = document.getElementById("scoreText"),
          levelText = document.getElementById("levelText"),
          starsText = document.getElementById("starsText"),
          timeText = document.getElementById("timeText");

    let currentUser = localStorage.getItem("username"),
        currentGrade = localStorage.getItem("grade"),
        currentGroup = localStorage.getItem("group"),
        score = 0, level = 1, stars = 0, timeWorked = 0,
        timerInterval = null, currentQuestion = null;

    // ===============================
    // 🛠️ FIX EXPERTO: HAMBURGUESA Y TEMA
    // ===============================
    
    // Hamburguesa - Usamos clase "active" para evitar fallos de lectura de CSS
    hamburger.addEventListener("click", () => {
        nav.classList.toggle("active");
        nav.style.display = nav.classList.contains("active") ? "block" : "none";
    });

    // Modo Oscuro - Aseguramos persistencia
    function checkTheme() {
        if (localStorage.getItem("theme") === "dark") {
            document.body.classList.add("dark");
        }
    }

    themeToggle.addEventListener("click", () => {
        document.body.classList.toggle("dark");
        const isDark = document.body.classList.contains("dark");
        localStorage.setItem("theme", isDark ? "dark" : "light");
    });

    // ===============================
    // 🕹️ LÓGICA DE JUEGO (MANTENIDA)
    // ===============================
    
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

    startBtn.addEventListener("click", () => {
        currentQuestion = questions[Math.floor(Math.random() * questions.length)];
        questionText.textContent = currentQuestion.q;
        feedback.textContent = "";
        answerInput.value = "";
        answerInput.focus();
    });

    checkBtn.addEventListener("click", () => {
        if (!currentQuestion) return;
        const userAns = answerInput.value.trim().toLowerCase();
        
        if (userAns === currentQuestion.a) {
            feedback.textContent = "🔥 ¡Excelente!";
            feedback.style.color = "green";
            soundCorrect.play().catch(() => {}); 
            score += 10; stars++;
            if (score % 50 === 0) {
                level++;
                soundLevel.play().catch(() => {});
            }
            currentQuestion = null;
        } else {
            feedback.textContent = "❌ Intenta de nuevo";
            feedback.style.color = "red";
            soundError.play().catch(() => {}); 
        }
        updateDisplay();
        saveProgress();
    });

    // ===============================
    // 👨‍🏫 PANEL MAESTRO (FILTRO REPARADO)
    // ===============================

    function updateGroupDropdown() {
        let allStudents = [];
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key.startsWith("user_")) allStudents.push(JSON.parse(localStorage.getItem(key)));
        }
        const groups = [...new Set(allStudents.map(s => s.group))];
        const currentSel = groupSelect.value;
        groupSelect.innerHTML = '<option value="">Todos los grupos</option>';
        groups.forEach(g => {
            const opt = document.createElement("option");
            opt.value = g; opt.textContent = `Grupo ${g}`;
            groupSelect.appendChild(opt);
        });
        groupSelect.value = currentSel;
    }

    function loadTeacherPanel() {
        studentsTable.innerHTML = "";
        let allStudents = [];
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key.startsWith("user_")) allStudents.push(JSON.parse(localStorage.getItem(key)));
        }

        const filter = groupSelect.value;
        let filtered = filter ? allStudents.filter(s => s.group === filter) : allStudents;
        filtered.sort((a, b) => b.score - a.score);

        filtered.forEach(s => {
            const row = document.createElement("tr");
            const min = Math.floor(s.timeWorked / 60);
            const sec = s.timeWorked % 60;
            row.innerHTML = `<td>${s.username}</td><td>${s.grade}</td><td>${s.group}</td><td>${s.score}</td><td>${s.level}</td><td>${s.stars}</td><td>${min}m ${sec}s</td>`;
            studentsTable.appendChild(row);
        });
    }

    groupSelect.addEventListener("change", loadTeacherPanel);

    // --- ACCIONES DE LOGIN ---
    loginBtn.addEventListener("click", () => {
        const name = usernameInput.value.trim(), g = gradeInput.value.trim(), gr = groupInput.value.trim().toUpperCase();
        if (!name || !g || !gr) return alert("Completa los datos");
        currentUser = name; currentGrade = g; currentGroup = gr;
        localStorage.setItem("username", name); localStorage.setItem("grade", g); localStorage.setItem("group", gr);
        showStudentInterface();
    });

    openTeacherBtn.addEventListener("click", () => {
        loginCard.style.display = "none";
        teacherLogin.style.display = "block";
    });

    teacherLoginBtn.addEventListener("click", () => {
        if (teacherUser.value === TEACHER_USER && teacherPass.value === TEACHER_PASS) {
            teacherLogin.style.display = "none";
            teacherPanel.style.display = "block";
            updateGroupDropdown();
            loadTeacherPanel();
        } else { alert("Maestro no reconocido"); }
    });

    closeTeacherPanel.addEventListener("click", () => {
        teacherPanel.style.display = "none";
        loginCard.style.display = "block";
    });

    closeTeacherLogin.addEventListener("click", () => {
        teacherLogin.style.display = "none";
        loginCard.style.display = "block";
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

    // EXPORTAR EXCEL
    exportBtn.addEventListener("click", () => {
        let csv = "\uFEFFAlumno,Grado,Grupo,Puntaje,Nivel,Estrellas,Tiempo\n";
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key.startsWith("user_")) {
                const s = JSON.parse(localStorage.getItem(key));
                const min = Math.floor(s.timeWorked / 60), sec = s.timeWorked % 60;
                csv += `${s.username},${s.grade},${s.group},${s.score},${s.level},${s.stars},${min}m ${sec}s\n`;
            }
        }
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = "Reporte_Ingles.csv";
        link.click();
    });

    init();
});
