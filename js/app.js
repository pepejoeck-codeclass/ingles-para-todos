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
        { q: "How do you say 'Perro' in English?", a: "dog" },
        { q: "How do you say 'Rojo' in English?", a: "red" },
        { q: "How do you say 'Azul' in English?", a: "blue" }
    ];

    // REFERENCIAS AL DOM
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
          emailInput = document.getElementById("emailInput"),
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

    // --- INICIALIZACIÓN ---
    init();

    function init() {
        checkTheme();
        if (currentUser && currentGrade && currentGroup) { showStudentInterface(); } 
        else { showLoginInterface(); }
    }

    // --- MODO OSCURO Y HAMBURGUESA ---
    hamburger.addEventListener("click", () => {
        const display = window.getComputedStyle(nav).display;
        nav.style.display = (display === "none") ? "block" : "none";
    });

    function checkTheme() {
        if (localStorage.getItem("theme") === "dark") document.body.classList.add("dark");
    }

    themeToggle.addEventListener("click", () => {
        document.body.classList.toggle("dark");
        localStorage.setItem("theme", document.body.classList.contains("dark") ? "dark" : "light");
    });

    // --- LÓGICA DE JUEGO ---
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

    // REPARACIÓN: SONIDOS EN RESPUESTA
    checkBtn.addEventListener("click", () => {
        if (!currentQuestion) return;
        const userAns = answerInput.value.trim().toLowerCase();
        
        if (userAns === currentQuestion.a) {
            feedback.textContent = "🔥 ¡Excelente!";
            feedback.style.color = "green";
            soundCorrect.play().catch(() => {}); // Sonido Correcto
            score += 10; stars++;
            if (score % 50 === 0) {
                level++;
                soundLevel.play().catch(() => {});
            }
            currentQuestion = null;
        } else {
            feedback.textContent = "❌ Intenta de nuevo";
            feedback.style.color = "red";
            soundError.play().catch(() => {}); // Sonido Error
        }
        updateDisplay();
        saveProgress();
    });

    // --- LOGINES ---
    loginBtn.addEventListener("click", () => {
        const name = usernameInput.value.trim();
        const g = gradeInput.value.trim();
        const gr = groupInput.value.trim().toUpperCase();
        if (!name || !g || !gr) return alert("Completa los datos");
        currentUser = name; currentGrade = g; currentGroup = gr;
        localStorage.setItem("username", name);
        localStorage.setItem("grade", g);
        localStorage.setItem("group", gr);
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
            updateGroupDropdown(); // Poblar lista de grupos
            loadTeacherPanel();    // Cargar tabla
        } else { alert("Usuario o Contraseña de maestro incorrectos"); }
    });

    closeTeacherPanel.addEventListener("click", () => {
        teacherPanel.style.display = "none";
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

    // --- REPARACIÓN: PANEL MAESTRO Y FILTRO ---
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

        // Aplicar Filtro de Grupo
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

    // Evento para que el filtro funcione al cambiar la opción
    groupSelect.addEventListener("change", loadTeacherPanel);
    refreshTeacherBtn.addEventListener("click", () => {
        updateGroupDropdown();
        loadTeacherPanel();
    });

    // EXPORTAR EXCEL
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
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = "Reporte_Ingles.csv";
        link.click();
    });
});document.addEventListener("DOMContentLoaded", () => {
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
        { q: "How do you say 'Perro' in English?", a: "dog" },
        { q: "How do you say 'Rojo' in English?", a: "red" },
        { q: "How do you say 'Azul' in English?", a: "blue" }
    ];

    // REFERENCIAS AL DOM
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
          emailInput = document.getElementById("emailInput"),
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

    // --- INICIALIZACIÓN ---
    init();

    function init() {
        checkTheme();
        if (currentUser && currentGrade && currentGroup) { showStudentInterface(); } 
        else { showLoginInterface(); }
    }

    // --- MODO OSCURO Y HAMBURGUESA ---
    hamburger.addEventListener("click", () => {
        const display = window.getComputedStyle(nav).display;
        nav.style.display = (display === "none") ? "block" : "none";
    });

    function checkTheme() {
        if (localStorage.getItem("theme") === "dark") document.body.classList.add("dark");
    }

    themeToggle.addEventListener("click", () => {
        document.body.classList.toggle("dark");
        localStorage.setItem("theme", document.body.classList.contains("dark") ? "dark" : "light");
    });

    // --- LÓGICA DE JUEGO ---
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

    // REPARACIÓN: SONIDOS EN RESPUESTA
    checkBtn.addEventListener("click", () => {
        if (!currentQuestion) return;
        const userAns = answerInput.value.trim().toLowerCase();
        
        if (userAns === currentQuestion.a) {
            feedback.textContent = "🔥 ¡Excelente!";
            feedback.style.color = "green";
            soundCorrect.play().catch(() => {}); // Sonido Correcto
            score += 10; stars++;
            if (score % 50 === 0) {
                level++;
                soundLevel.play().catch(() => {});
            }
            currentQuestion = null;
        } else {
            feedback.textContent = "❌ Intenta de nuevo";
            feedback.style.color = "red";
            soundError.play().catch(() => {}); // Sonido Error
        }
        updateDisplay();
        saveProgress();
    });

    // --- LOGINES ---
    loginBtn.addEventListener("click", () => {
        const name = usernameInput.value.trim();
        const g = gradeInput.value.trim();
        const gr = groupInput.value.trim().toUpperCase();
        if (!name || !g || !gr) return alert("Completa los datos");
        currentUser = name; currentGrade = g; currentGroup = gr;
        localStorage.setItem("username", name);
        localStorage.setItem("grade", g);
        localStorage.setItem("group", gr);
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
            updateGroupDropdown(); // Poblar lista de grupos
            loadTeacherPanel();    // Cargar tabla
        } else { alert("Usuario o Contraseña de maestro incorrectos"); }
    });

    closeTeacherPanel.addEventListener("click", () => {
        teacherPanel.style.display = "none";
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

    // --- REPARACIÓN: PANEL MAESTRO Y FILTRO ---
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

        // Aplicar Filtro de Grupo
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

    // Evento para que el filtro funcione al cambiar la opción
    groupSelect.addEventListener("change", loadTeacherPanel);
    refreshTeacherBtn.addEventListener("click", () => {
        updateGroupDropdown();
        loadTeacherPanel();
    });

    // EXPORTAR EXCEL
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
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = "Reporte_Ingles.csv";
        link.click();
    });
});
