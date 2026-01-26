document.addEventListener("DOMContentLoaded", () => {
    // ===============================
    // 🔊 SONIDOS
    // ===============================
    const soundCorrect = new Audio("assets/sounds/correct.mp3");
    const soundError = new Audio("assets/sounds/wrong.mp3");
    const soundLevel = new Audio("assets/sounds/levelup.mp3");

    // ===============================
    // 🔐 DATOS MAESTRO
    // ===============================
    const TEACHER_USER = "Jose de Jesus Ramos Flores";
    const TEACHER_PASS = "161286";

    // ===============================
    // 🧠 EJERCICIOS
    // ===============================
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

    // ===============================
    // REFERENCIAS AL DOM (HTML)
    // ===============================
    const loginCard = document.getElementById("loginCard");
    const mainContent = document.getElementById("mainContent");
    const teacherPanel = document.getElementById("teacherPanel");
    const teacherLogin = document.getElementById("teacherLogin");

    // Botones
    const logoutBtn = document.getElementById("logoutBtn");
    const openTeacherBtn = document.getElementById("openTeacherBtn");
    const loginBtn = document.getElementById("loginBtn");
    const teacherLoginBtn = document.getElementById("teacherLoginBtn");
    const closeTeacherLogin = document.getElementById("closeTeacherLogin");
    const closeTeacherPanel = document.getElementById("closeTeacherPanel");
    const refreshTeacherBtn = document.getElementById("refreshTeacher");
    const startBtn = document.getElementById("startGame");
    const checkBtn = document.getElementById("checkAnswer");
    const themeToggle = document.getElementById("themeToggle");
    const hamburger = document.getElementById("hamburger");
    const nav = document.getElementById("nav");

    // Inputs y Textos
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

    // ===============================
    // VARIABLES DE ESTADO
    // ===============================
    let currentUser = localStorage.getItem("username");
    let currentGrade = localStorage.getItem("grade");
    let currentGroup = localStorage.getItem("group");
    
    // Variables de juego
    let score = 0;
    let level = 1;
    let stars = 0;
    let timeWorked = 0; // segundos totales
    let timerInterval = null;
    let currentQuestion = null;

    // ===============================
    // 🚀 INICIALIZACIÓN
    // ===============================
    init();

    function init() {
        checkTheme();
        
        // Si ya hay usuario logueado, mostrar el contenido
        if (currentUser && currentGrade && currentGroup) {
            showStudentInterface();
        } else {
            showLoginInterface();
        }
    }

    // ===============================
    // 🕹️ LÓGICA DEL JUEGO
    // ===============================
    
    function loadUserData() {
        const key = `user_${currentUser}`;
        const data = JSON.parse(localStorage.getItem(key));

        if (data) {
            score = data.score || 0;
            level = data.level || 1;
            stars = data.stars || 0;
            timeWorked = data.timeWorked || 0;
        } else {
            // Usuario nuevo
            score = 0; level = 1; stars = 0; timeWorked = 0;
        }
        updateDisplay();
    }

    function saveProgress() {
        if (!currentUser) return;
        const data = {
            username: currentUser,
            grade: currentGrade,
            group: currentGroup,
            score: score,
            level: level,
            stars: stars,
            timeWorked: timeWorked,
            lastLogin: new Date().toISOString()
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
            // Actualizamos la vista del tiempo cada segundo
            const min = Math.floor(timeWorked / 60);
            const sec = timeWorked % 60;
            timeText.textContent = `⏱ Tiempo: ${min}m ${sec}s`;
            
            // Guardamos progreso cada 5 segundos para no saturar
            if (timeWorked % 5 === 0) saveProgress();
        }, 1000);
    }

    function stopTimer() {
        clearInterval(timerInterval);
        timerInterval = null;
    }

    // ===============================
    // 🖱️ EVENT LISTENERS (INTERACCIÓN)
    // ===============================

    // --- LOGIN ALUMNO ---
    loginBtn.addEventListener("click", () => {
        const name = usernameInput.value.trim() || emailInput.value.trim();
        const g = gradeInput.value.trim();
        const gr = groupInput.value.trim().toUpperCase();

        if (!name || !g || !gr) {
            alert("⚠️ Por favor completa Nombre, Grado y Grupo.");
            return;
        }

        currentUser = name;
        currentGrade = g;
        currentGroup = gr;

        localStorage.setItem("username", currentUser);
        localStorage.setItem("grade", currentGrade);
        localStorage.setItem("group", currentGroup);

        showStudentInterface();
    });

    // --- LOGIN MAESTRO ---
    openTeacherBtn.addEventListener("click", () => {
        loginCard.style.display = "none";
        mainContent.style.display = "none";
        teacherLogin.style.display = "block";
        stopTimer(); // Detener timer si el alumno estaba jugando y el maestro entró
    });

    closeTeacherLogin.addEventListener("click", () => {
        teacherLogin.style.display = "none";
        if (currentUser) {
            mainContent.style.display = "block";
            startTimer();
        } else {
            loginCard.style.display = "block";
        }
    });

    teacherLoginBtn.addEventListener("click", () => {
        if (teacherUser.value === TEACHER_USER && teacherPass.value === TEACHER_PASS) {
            teacherLogin.style.display = "none";
            teacherPanel.style.display = "block";
            loadTeacherPanel(); // Cargar tabla
        } else {
            alert("❌ Usuario o contraseña incorrectos");
        }
    });

    closeTeacherPanel.addEventListener("click", () => {
        teacherPanel.style.display = "none";
        loginCard.style.display = "block";
        // Limpiamos campos maestro por seguridad
        teacherUser.value = "";
        teacherPass.value = "";
    });

    refreshTeacherBtn.addEventListener("click", loadTeacherPanel);

    // --- JUEGO ---
    startBtn.addEventListener("click", () => {
        currentQuestion = questions[Math.floor(Math.random() * questions.length)];
        questionText.textContent = currentQuestion.q;
        feedback.textContent = "";
        answerInput.value = "";
        answerInput.focus();
    });

    checkAnswer.addEventListener("click", () => {
        if (!currentQuestion) {
            alert("Primero pulsa 'Nueva Pregunta'");
            return;
        }
        const answer = answerInput.value.trim().toLowerCase();
        
        if (answer === currentQuestion.a) {
            feedback.textContent = "🔥 Excellent job!";
            feedback.style.color = "green";
            try { soundCorrect.play(); } catch(e){}
            
            score += 10;
            stars++;
            if (score % 50 === 0) {
                level++;
                try { soundLevel.play(); } catch(e){}
                alert("🆙 LEVEL UP! Ahora eres Nivel " + level);
            }
            
            // Limpiar pregunta para obligar a pedir otra
            currentQuestion = null;
            questionText.textContent = "¡Bien hecho! Pulsa 'Nueva Pregunta'";
            
        } else {
            feedback.textContent = "❌ Try again";
            feedback.style.color = "red";
            try { soundError.play(); } catch(e){}
        }
        updateDisplay();
        saveProgress();
    });

    // Permitir responder con Enter
    answerInput.addEventListener("keypress", (e) => {
        if (e.key === "Enter") checkAnswer.click();
    });

    // --- UI GENERAL ---
    logoutBtn.addEventListener("click", () => {
        saveProgress(); // Guardar antes de salir
        stopTimer();
        localStorage.removeItem("username");
        localStorage.removeItem("grade");
        localStorage.removeItem("group");
        location.reload(); // Recargar página para reiniciar todo limpio
    });

    hamburger.addEventListener("click", () => {
        nav.style.display = (nav.style.display === "block") ? "none" : "block";
    });

    themeToggle.addEventListener("click", () => {
        document.body.classList.toggle("dark");
        localStorage.setItem("theme", document.body.classList.contains("dark") ? "dark" : "light");
    });

    // ===============================
    // 🛠️ FUNCIONES AUXILIARES
    // ===============================

    function showStudentInterface() {
        loginCard.style.display = "none";
        teacherLogin.style.display = "none";
        mainContent.style.display = "block";
        openTeacherBtn.style.display = "none"; // Ocultar botón maestro al alumno
        logoutBtn.style.display = "inline-block"; // Mostrar botón salir

        userDisplay.textContent = `👤 Welcome, ${currentUser}`;
        
        loadUserData();
        startTimer();
    }

    function showLoginInterface() {
        loginCard.style.display = "block";
        mainContent.style.display = "none";
        logoutBtn.style.display = "none";
        openTeacherBtn.style.display = "inline-block";
    }

    function checkTheme() {
        if (localStorage.getItem("theme") === "dark") {
            document.body.classList.add("dark");
        }
    }

    // ===============================
    // 👨‍🏫 LÓGICA DEL PANEL DE MAESTRO
    // ===============================
    function loadTeacherPanel() {
        studentsTable.innerHTML = "";
        
        // 1. Recolectar todos los usuarios guardados en LocalStorage
        let allStudents = [];
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key.startsWith("user_")) {
                try {
                    const studentData = JSON.parse(localStorage.getItem(key));
                    allStudents.push(studentData);
                } catch (e) {
                    console.error("Error leyendo datos de alumno", e);
                }
            }
        }

        // 2. Llenar el select de grupos (evitar duplicados)
        const groups = new Set(allStudents.map(s => s.group));
        // Guardar la selección actual si existe
        const currentSelection = groupSelect.value;
        
        // Limpiar select (manteniendo la opción 'Todos')
        groupSelect.innerHTML = '<option value="">Todos los grupos</option>';
        
        groups.forEach(g => {
            const opt = document.createElement("option");
            opt.value = g;
            opt.textContent = `Grupo ${g}`;
            groupSelect.appendChild(opt);
        });

        // Restaurar selección o resetear
        groupSelect.value = currentSelection;

        // 3. Filtrar según selección
        let filteredStudents = allStudents;
        if (groupSelect.value) {
            filteredStudents = allStudents.filter(s => s.group === groupSelect.value);
        }

        // 4. Ordenar por puntaje (Mayor a menor)
        filteredStudents.sort((a, b) => b.score - a.score);

        // 5. Dibujar tabla
        filteredStudents.forEach(s => {
            const row = document.createElement("tr");
            
            const min = Math.floor((s.timeWorked || 0) / 60);
            const sec = (s.timeWorked || 0) % 60;

            row.innerHTML = `
                <td>${s.username}</td>
                <td>${s.grade}</td>
                <td>${s.group}</td>
                <td style="font-weight:bold; color:#007bff;">${s.score}</td>
                <td>${s.level}</td>
                <td>${s.stars}</td>
                <td>${min}m ${sec}s</td>
            `;
            studentsTable.appendChild(row);
        });
    }

    // Evento al cambiar el filtro de grupo
    groupSelect.addEventListener("change", loadTeacherPanel);

});document.addEventListener("DOMContentLoaded", () => {
    // ===============================
    // 🔊 SONIDOS
    // ===============================
    const soundCorrect = new Audio("assets/sounds/correct.mp3");
    const soundError = new Audio("assets/sounds/wrong.mp3");
    const soundLevel = new Audio("assets/sounds/levelup.mp3");

    // ===============================
    // 🔐 DATOS MAESTRO
    // ===============================
    const TEACHER_USER = "Jose de Jesus Ramos Flores";
    const TEACHER_PASS = "161286";

    // ===============================
    // 🧠 EJERCICIOS
    // ===============================
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

    // ===============================
    // REFERENCIAS AL DOM (HTML)
    // ===============================
    const loginCard = document.getElementById("loginCard");
    const mainContent = document.getElementById("mainContent");
    const teacherPanel = document.getElementById("teacherPanel");
    const teacherLogin = document.getElementById("teacherLogin");

    // Botones
    const logoutBtn = document.getElementById("logoutBtn");
    const openTeacherBtn = document.getElementById("openTeacherBtn");
    const loginBtn = document.getElementById("loginBtn");
    const teacherLoginBtn = document.getElementById("teacherLoginBtn");
    const closeTeacherLogin = document.getElementById("closeTeacherLogin");
    const closeTeacherPanel = document.getElementById("closeTeacherPanel");
    const refreshTeacherBtn = document.getElementById("refreshTeacher");
    const startBtn = document.getElementById("startGame");
    const checkBtn = document.getElementById("checkAnswer");
    const themeToggle = document.getElementById("themeToggle");
    const hamburger = document.getElementById("hamburger");
    const nav = document.getElementById("nav");

    // Inputs y Textos
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

    // ===============================
    // VARIABLES DE ESTADO
    // ===============================
    let currentUser = localStorage.getItem("username");
    let currentGrade = localStorage.getItem("grade");
    let currentGroup = localStorage.getItem("group");
    
    // Variables de juego
    let score = 0;
    let level = 1;
    let stars = 0;
    let timeWorked = 0; // segundos totales
    let timerInterval = null;
    let currentQuestion = null;

    // ===============================
    // 🚀 INICIALIZACIÓN
    // ===============================
    init();

    function init() {
        checkTheme();
        
        // Si ya hay usuario logueado, mostrar el contenido
        if (currentUser && currentGrade && currentGroup) {
            showStudentInterface();
        } else {
            showLoginInterface();
        }
    }

    // ===============================
    // 🕹️ LÓGICA DEL JUEGO
    // ===============================
    
    function loadUserData() {
        const key = `user_${currentUser}`;
        const data = JSON.parse(localStorage.getItem(key));

        if (data) {
            score = data.score || 0;
            level = data.level || 1;
            stars = data.stars || 0;
            timeWorked = data.timeWorked || 0;
        } else {
            // Usuario nuevo
            score = 0; level = 1; stars = 0; timeWorked = 0;
        }
        updateDisplay();
    }

    function saveProgress() {
        if (!currentUser) return;
        const data = {
            username: currentUser,
            grade: currentGrade,
            group: currentGroup,
            score: score,
            level: level,
            stars: stars,
            timeWorked: timeWorked,
            lastLogin: new Date().toISOString()
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
            // Actualizamos la vista del tiempo cada segundo
            const min = Math.floor(timeWorked / 60);
            const sec = timeWorked % 60;
            timeText.textContent = `⏱ Tiempo: ${min}m ${sec}s`;
            
            // Guardamos progreso cada 5 segundos para no saturar
            if (timeWorked % 5 === 0) saveProgress();
        }, 1000);
    }

    function stopTimer() {
        clearInterval(timerInterval);
        timerInterval = null;
    }

    // ===============================
    // 🖱️ EVENT LISTENERS (INTERACCIÓN)
    // ===============================

    // --- LOGIN ALUMNO ---
    loginBtn.addEventListener("click", () => {
        const name = usernameInput.value.trim() || emailInput.value.trim();
        const g = gradeInput.value.trim();
        const gr = groupInput.value.trim().toUpperCase();

        if (!name || !g || !gr) {
            alert("⚠️ Por favor completa Nombre, Grado y Grupo.");
            return;
        }

        currentUser = name;
        currentGrade = g;
        currentGroup = gr;

        localStorage.setItem("username", currentUser);
        localStorage.setItem("grade", currentGrade);
        localStorage.setItem("group", currentGroup);

        showStudentInterface();
    });

    // --- LOGIN MAESTRO ---
    openTeacherBtn.addEventListener("click", () => {
        loginCard.style.display = "none";
        mainContent.style.display = "none";
        teacherLogin.style.display = "block";
        stopTimer(); // Detener timer si el alumno estaba jugando y el maestro entró
    });

    closeTeacherLogin.addEventListener("click", () => {
        teacherLogin.style.display = "none";
        if (currentUser) {
            mainContent.style.display = "block";
            startTimer();
        } else {
            loginCard.style.display = "block";
        }
    });

    teacherLoginBtn.addEventListener("click", () => {
        if (teacherUser.value === TEACHER_USER && teacherPass.value === TEACHER_PASS) {
            teacherLogin.style.display = "none";
            teacherPanel.style.display = "block";
            loadTeacherPanel(); // Cargar tabla
        } else {
            alert("❌ Usuario o contraseña incorrectos");
        }
    });

    closeTeacherPanel.addEventListener("click", () => {
        teacherPanel.style.display = "none";
        loginCard.style.display = "block";
        // Limpiamos campos maestro por seguridad
        teacherUser.value = "";
        teacherPass.value = "";
    });

    refreshTeacherBtn.addEventListener("click", loadTeacherPanel);

    // --- JUEGO ---
    startBtn.addEventListener("click", () => {
        currentQuestion = questions[Math.floor(Math.random() * questions.length)];
        questionText.textContent = currentQuestion.q;
        feedback.textContent = "";
        answerInput.value = "";
        answerInput.focus();
    });

    checkAnswer.addEventListener("click", () => {
        if (!currentQuestion) {
            alert("Primero pulsa 'Nueva Pregunta'");
            return;
        }
        const answer = answerInput.value.trim().toLowerCase();
        
        if (answer === currentQuestion.a) {
            feedback.textContent = "🔥 Excellent job!";
            feedback.style.color = "green";
            try { soundCorrect.play(); } catch(e){}
            
            score += 10;
            stars++;
            if (score % 50 === 0) {
                level++;
                try { soundLevel.play(); } catch(e){}
                alert("🆙 LEVEL UP! Ahora eres Nivel " + level);
            }
            
            // Limpiar pregunta para obligar a pedir otra
            currentQuestion = null;
            questionText.textContent = "¡Bien hecho! Pulsa 'Nueva Pregunta'";
            
        } else {
            feedback.textContent = "❌ Try again";
            feedback.style.color = "red";
            try { soundError.play(); } catch(e){}
        }
        updateDisplay();
        saveProgress();
    });

    // Permitir responder con Enter
    answerInput.addEventListener("keypress", (e) => {
        if (e.key === "Enter") checkAnswer.click();
    });

    // --- UI GENERAL ---
    logoutBtn.addEventListener("click", () => {
        saveProgress(); // Guardar antes de salir
        stopTimer();
        localStorage.removeItem("username");
        localStorage.removeItem("grade");
        localStorage.removeItem("group");
        location.reload(); // Recargar página para reiniciar todo limpio
    });

    hamburger.addEventListener("click", () => {
        nav.style.display = (nav.style.display === "block") ? "none" : "block";
    });

    themeToggle.addEventListener("click", () => {
        document.body.classList.toggle("dark");
        localStorage.setItem("theme", document.body.classList.contains("dark") ? "dark" : "light");
    });

    // ===============================
    // 🛠️ FUNCIONES AUXILIARES
    // ===============================

    function showStudentInterface() {
        loginCard.style.display = "none";
        teacherLogin.style.display = "none";
        mainContent.style.display = "block";
        openTeacherBtn.style.display = "none"; // Ocultar botón maestro al alumno
        logoutBtn.style.display = "inline-block"; // Mostrar botón salir

        userDisplay.textContent = `👤 Welcome, ${currentUser}`;
        
        loadUserData();
        startTimer();
    }

    function showLoginInterface() {
        loginCard.style.display = "block";
        mainContent.style.display = "none";
        logoutBtn.style.display = "none";
        openTeacherBtn.style.display = "inline-block";
    }

    function checkTheme() {
        if (localStorage.getItem("theme") === "dark") {
            document.body.classList.add("dark");
        }
    }

    // ===============================
    // 👨‍🏫 LÓGICA DEL PANEL DE MAESTRO
    // ===============================
    function loadTeacherPanel() {
        studentsTable.innerHTML = "";
        
        // 1. Recolectar todos los usuarios guardados en LocalStorage
        let allStudents = [];
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key.startsWith("user_")) {
                try {
                    const studentData = JSON.parse(localStorage.getItem(key));
                    allStudents.push(studentData);
                } catch (e) {
                    console.error("Error leyendo datos de alumno", e);
                }
            }
        }

        // 2. Llenar el select de grupos (evitar duplicados)
        const groups = new Set(allStudents.map(s => s.group));
        // Guardar la selección actual si existe
        const currentSelection = groupSelect.value;
        
        // Limpiar select (manteniendo la opción 'Todos')
        groupSelect.innerHTML = '<option value="">Todos los grupos</option>';
        
        groups.forEach(g => {
            const opt = document.createElement("option");
            opt.value = g;
            opt.textContent = `Grupo ${g}`;
            groupSelect.appendChild(opt);
        });

        // Restaurar selección o resetear
        groupSelect.value = currentSelection;

        // 3. Filtrar según selección
        let filteredStudents = allStudents;
        if (groupSelect.value) {
            filteredStudents = allStudents.filter(s => s.group === groupSelect.value);
        }

        // 4. Ordenar por puntaje (Mayor a menor)
        filteredStudents.sort((a, b) => b.score - a.score);

        // 5. Dibujar tabla
        filteredStudents.forEach(s => {
            const row = document.createElement("tr");
            
            const min = Math.floor((s.timeWorked || 0) / 60);
            const sec = (s.timeWorked || 0) % 60;

            row.innerHTML = `
                <td>${s.username}</td>
                <td>${s.grade}</td>
                <td>${s.group}</td>
                <td style="font-weight:bold; color:#007bff;">${s.score}</td>
                <td>${s.level}</td>
                <td>${s.stars}</td>
                <td>${min}m ${sec}s</td>
            `;
            studentsTable.appendChild(row);
        });
    }

    // Evento al cambiar el filtro de grupo
    groupSelect.addEventListener("change", loadTeacherPanel);

});
