import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged } 
    from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { getFirestore, doc, setDoc, getDoc, getDocs, collection, updateDoc, deleteDoc, writeBatch, query, where } 
    from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyCN3meUPPTmrN_4kgcMCTrpHJahQQzxU7s",
  authDomain: "ingles-pepejoeck.firebaseapp.com",
  databaseURL: "https://ingles-pepejoeck-default-rtdb.firebaseio.com",
  projectId: "ingles-pepejoeck",
  storageBucket: "ingles-pepejoeck.firebasestorage.app",
  messagingSenderId: "519995763844",
  appId: "1:519995763844:web:350df130a6673b4002a6d1",
  measurementId: "G-5MEQGW13ZE"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Variables Globales de Juego
let currentLevel = 1;
let questionsInSession = 0;
let correctInSession = 0;
const SESSION_LENGTH = 5; // Preguntas por "examen" para ganar medalla

// Base de datos de preguntas por Nivel
const questionsDB = {
    1: [ // Básicos
        { q: "How do you say 'Hola' in English?", a: "hello" },
        { q: "How do you say 'Adiós' in English?", a: "goodbye" },
        { q: "How do you say 'Por favor' in English?", a: "please" },
        { q: "How do you say 'Gracias' in English?", a: "thank you" },
        { q: "How do you say 'Buenos días' in English?", a: "good morning" }
    ],
    2: [ // Animales (Se desbloquea con Oro/Plata en Nivel 1)
        { q: "How do you say 'Gato' in English?", a: "cat" },
        { q: "How do you say 'Perro' in English?", a: "dog" },
        { q: "How do you say 'Pájaro' in English?", a: "bird" },
        { q: "How do you say 'León' in English?", a: "lion" },
        { q: "How do you say 'Pez' in English?", a: "fish" }
    ],
    3: [ // Colores
        { q: "How do you say 'Rojo' in English?", a: "red" },
        { q: "How do you say 'Azul' in English?", a: "blue" },
        { q: "How do you say 'Verde' in English?", a: "green" },
        { q: "How do you say 'Amarillo' in English?", a: "yellow" },
        { q: "How do you say 'Negro' in English?", a: "black" }
    ]
};

document.addEventListener("DOMContentLoaded", () => {
    // SONIDOS (Asegúrate de tener estos archivos o comenta las líneas si fallan)
    const soundCorrect = new Audio("assets/sounds/correct.mp3");
    const soundError = new Audio("assets/sounds/wrong.mp3");
    const soundLevel = new Audio("assets/sounds/levelup.mp3"); 
    const soundPerfect = new Audio("assets/sounds/perfect.mp3"); // NUEVO: Sonido para Gold

    const TEACHER_USER = "Jose de Jesus Ramos Flores";
    const TEACHER_PASS = "161286";

    // Elementos DOM
    const loginCard = document.getElementById("loginCard"),
          mainContent = document.getElementById("mainContent"),
          teacherPanel = document.getElementById("teacherPanel"),
          teacherLogin = document.getElementById("teacherLogin");

    const logoutBtn = document.getElementById("logoutBtn"),
          openTeacherBtn = document.getElementById("openTeacherBtn"),
          loginBtn = document.getElementById("loginBtn"),
          teacherLoginBtn = document.getElementById("teacherLoginBtn"),
          closeTeacherLogin = document.getElementById("closeTeacherLogin"),
          closeTeacherPanel = document.getElementById("closeTeacherPanel"),
          refreshTeacherBtn = document.getElementById("refreshTeacher"),
          viewStatsBtn = document.getElementById("viewStatsBtn"), // NUEVO
          downloadPdfBtn = document.getElementById("downloadPdfBtn"), // NUEVO
          startBtn = document.getElementById("startGame"),
          checkBtn = document.getElementById("checkAnswer"),
          themeToggle = document.getElementById("themeToggle"),
          hamburger = document.getElementById("hamburger"),
          nav = document.getElementById("nav"),
          groupSelect = document.getElementById("groupSelect"),
          studentsTable = document.getElementById("studentsTable"),
          forgotPasswordLink = document.getElementById("forgotPasswordLink"); // NUEVO

    const gradeInput = document.getElementById("gradeInput"),
          groupInput = document.getElementById("groupInput"),
          usernameInput = document.getElementById("usernameInput"),
          emailInput = document.getElementById("emailInput"),
          passwordInput = document.getElementById("passwordInput"),
          userDisplay = document.getElementById("userDisplay"),
          teacherUser = document.getElementById("teacherUser"),
          teacherPass = document.getElementById("teacherPass"),
          questionText = document.getElementById("questionText"),
          answerInput = document.getElementById("answerInput"),
          feedback = document.getElementById("feedback"),
          scoreText = document.getElementById("scoreText"),
          levelText = document.getElementById("levelText"),
          starsText = document.getElementById("starsText"),
          timeText = document.getElementById("timeText"),
          lessonProgressBar = document.getElementById("lessonProgressBar"),
          progressText = document.getElementById("progressText");

    let currentUserId = null; 
    let currentUserData = {};
    let timerInterval = null;
    let currentQuestion = null;

    // --- AUTENTICACIÓN Y REGISTRO ---

    onAuthStateChanged(auth, async (user) => {
        if (user) {
            currentUserId = user.uid;
            await loadUserData(user.uid);
            showStudentInterface();
            updateLevelLocks(); // Revisar candados al entrar
        } else {
            currentUserId = null;
            currentUserData = {};
            showLoginInterface();
        }
    });

    loginBtn.addEventListener("click", async () => {
        const email = emailInput.value.trim();
        const password = passwordInput.value.trim();
        const name = usernameInput.value.trim();
        const grade = gradeInput.value.trim();
        const group = groupInput.value.trim().toUpperCase();

        if (!email || !password || password.length < 6) {
            Swal.fire("Error", "Ingresa correo y contraseña (min 6 caracteres).", "error");
            return;
        }

        loginBtn.disabled = true;
        loginBtn.textContent = "Procesando...";

        try {
            await signInWithEmailAndPassword(auth, email, password);
        } catch (error) {
            if (error.code === 'auth/user-not-found' || error.code === 'auth/invalid-credential' || error.code === 'auth/wrong-password') {
                if (!name || !grade || !group) {
                    Swal.fire("Usuario no encontrado", "Para registrarte llena Nombre, Grado y Grupo.", "info");
                    loginBtn.disabled = false;
                    loginBtn.textContent = "Entrar / Registrarse";
                    return;
                }
                try {
                    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
                    const user = userCredential.user;
                    // IMPORTANTE: Guardamos la contraseña en Firestore solo porque pediste "Recuperarla mostrándola".
                    // En una app real de alta seguridad esto no se recomienda, pero para escuela funciona perfecto.
                    await setDoc(doc(db, "students", user.uid), {
                        uid: user.uid,
                        username: name, grade: grade, group: group, email: email,
                        password: password, // Guardada para la función "Olvidé contraseña"
                        score: 0, level: 1, stars: 0, timeWorked: 0,
                        medals: { gold: 0, silver: 0, bronze: 0 }, // NUEVO: Medallas
                        history: [], // NUEVO: Historial
                        unlockedLevels: [1], // NUEVO: Nivel 1 desbloqueado por defecto
                        lastLogin: new Date().toISOString()
                    });
                    Swal.fire("¡Bienvenido!", "Cuenta creada exitosamente.", "success");
                } catch (regError) { Swal.fire("Error", regError.message, "error"); }
            } else { Swal.fire("Error", error.message, "error"); }
        }
        loginBtn.disabled = false;
        loginBtn.textContent = "Entrar / Registrarse";
    });

    // --- NUEVO: RECUPERAR CONTRASEÑA ---
    forgotPasswordLink.addEventListener("click", async (e) => {
        e.preventDefault();
        const { value: email } = await Swal.fire({
            title: 'Recuperar Contraseña',
            input: 'email',
            inputLabel: 'Introduce tu correo Gmail registrado',
            inputPlaceholder: 'alumno@gmail.com'
        });

        if (email) {
            // Buscamos en Firestore el usuario con ese correo
            const q = query(collection(db, "students"), where("email", "==", email));
            const querySnapshot = await getDocs(q);
            
            if (!querySnapshot.empty) {
                const userData = querySnapshot.docs[0].data();
                // Mostramos la contraseña (Simulación segura solicitada)
                Swal.fire(`Hola ${userData.username}`, `Tu contraseña es: <b>${userData.password}</b>`, 'info');
            } else {
                Swal.fire('Error', 'Este correo no está registrado.', 'error');
            }
        }
    });

    // --- LÓGICA DE DATOS ---

    async function loadUserData(uid) {
        const docRef = doc(db, "students", uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
            currentUserData = docSnap.data();
            // Asegurar campos nuevos si el usuario es antiguo
            if(!currentUserData.medals) currentUserData.medals = { gold:0, silver:0, bronze:0 };
            if(!currentUserData.unlockedLevels) currentUserData.unlockedLevels = [1];
            updateDisplay();
        }
    }

    async function saveProgress() {
        if (!currentUserId) return;
        currentUserData.timeWorked = (currentUserData.timeWorked || 0);
        currentUserData.lastLogin = new Date().toISOString();
        try {
            await setDoc(doc(db, "students", currentUserId), currentUserData, { merge: true });
        } catch (e) { console.error("Error guardando", e); }
    }

    function updateDisplay() {
        if(!currentUserData) return;
        scoreText.textContent = `${currentUserData.score || 0} pts`;
        levelText.textContent = `Nivel: ${currentLevel}`; // Muestra el nivel que se está jugando
        starsText.textContent = `⭐ ${currentUserData.stars || 0}`;
        const t = currentUserData.timeWorked || 0;
        const min = Math.floor(t / 60), sec = t % 60;
        timeText.textContent = `⏱ ${min}m ${sec}s`;
        userDisplay.textContent = `👤 ${currentUserData.username || 'Alumno'}`;
    }

    // --- JUEGO Y MEDALLAS ---

    // Función para cambiar de nivel desde el menú
    window.selectLevel = (level) => {
        if (!currentUserData.unlockedLevels.includes(level)) {
            Swal.fire("Bloqueado 🔒", "Debes ganar medalla de ORO o PLATA en el nivel anterior para desbloquear este.", "warning");
            return;
        }
        currentLevel = level;
        questionsInSession = 0;
        correctInSession = 0;
        updateProgressBar();
        startQuestion();
        nav.classList.remove("active"); // Cerrar menú móvil
    };

    function startQuestion() {
        // Seleccionar preguntas del nivel actual
        const pool = questionsDB[currentLevel] || questionsDB[1];
        currentQuestion = pool[Math.floor(Math.random() * pool.length)];
        
        questionText.textContent = currentQuestion.q;
        feedback.textContent = "";
        answerInput.value = "";
        answerInput.focus();
    }

    startBtn.addEventListener("click", startQuestion);

    checkBtn.addEventListener("click", async () => {
        if (!currentQuestion) return;
        
        const userAns = answerInput.value.trim().toLowerCase();
        questionsInSession++;
        
        if (userAns === currentQuestion.a) {
            feedback.textContent = "🔥 ¡Correcto!";
            feedback.style.color = "green";
            soundCorrect.play().catch(()=>{});
            currentUserData.score += 10;
            currentUserData.stars += 1;
            correctInSession++;
        } else {
            feedback.textContent = `❌ Era: ${currentQuestion.a}`;
            feedback.style.color = "red";
            soundError.play().catch(()=>{});
        }

        updateProgressBar();
        updateDisplay();

        // Verificar si terminamos la lección (5 preguntas)
        if (questionsInSession >= SESSION_LENGTH) {
            await finishSession();
        } else {
            // Siguiente pregunta automática tras 1.5s
            setTimeout(startQuestion, 1500);
        }
        await saveProgress(); 
    });

    function updateProgressBar() {
        const pct = (questionsInSession / SESSION_LENGTH) * 100;
        lessonProgressBar.style.width = pct + "%";
        progressText.textContent = `${questionsInSession}/${SESSION_LENGTH}`;
    }

    async function finishSession() {
        const percentage = (correctInSession / SESSION_LENGTH) * 100;
        let medal = null;
        let msg = "";
        let icon = "info";

        if (percentage === 100) {
            medal = "gold";
            msg = "🥇 PERFECT! You got a GOLD medal!";
            icon = "success";
            soundPerfect.play().catch(()=>{});
            currentUserData.medals.gold++;
            unlockNextLevel();
        } else if (percentage >= 80) {
            medal = "silver";
            msg = "🥈 Great job! SILVER medal!";
            icon = "success";
            soundLevel.play().catch(()=>{});
            currentUserData.medals.silver++;
            unlockNextLevel();
        } else {
            medal = "bronze";
            msg = "🥉 Practice more! Bronze medal.";
            icon = "warning";
            currentUserData.medals.bronze++;
        }

        // Guardar en historial
        const historyRecord = {
            date: new Date().toLocaleDateString(),
            level: currentLevel,
            score: percentage,
            medal: medal
        };
        if(!currentUserData.history) currentUserData.history = [];
        currentUserData.history.push(historyRecord);

        await saveProgress();
        updateLevelLocks();

        Swal.fire({
            title: msg,
            text: `Score: ${correctInSession}/${SESSION_LENGTH}`,
            icon: icon,
            confirmButtonText: 'Continuar'
        }).then(() => {
            questionsInSession = 0;
            correctInSession = 0;
            updateProgressBar();
            startQuestion();
        });
    }

    function unlockNextLevel() {
        const next = currentLevel + 1;
        if (!currentUserData.unlockedLevels.includes(next)) {
            currentUserData.unlockedLevels.push(next);
            Swal.fire("LEVEL UNLOCKED!", `Has desbloqueado la Lección ${next}`, "success");
        }
    }

    function updateLevelLocks() {
        if(!currentUserData.unlockedLevels) return;
        // Leccion 2
        const l2 = document.getElementById("navL2");
        if(currentUserData.unlockedLevels.includes(2)) {
            l2.classList.remove("locked");
            l2.innerHTML = "Lección 2 (Animales)";
        }
        // Leccion 3
        const l3 = document.getElementById("navL3");
        if(currentUserData.unlockedLevels.includes(3)) {
            l3.classList.remove("locked");
            l3.innerHTML = "Lección 3 (Colores)";
        }
    }

    // --- TEMPORIZADOR ---
    function startTimer() {
        if (timerInterval) clearInterval(timerInterval);
        timerInterval = setInterval(() => {
            if(!currentUserData.timeWorked) currentUserData.timeWorked = 0;
            currentUserData.timeWorked++;
            if (currentUserData.timeWorked % 5 === 0) updateDisplay(); // Actualizar visual
            if (currentUserData.timeWorked % 30 === 0) saveProgress(); // Guardar cada 30s
        }, 1000);
    }
    function stopTimer() { clearInterval(timerInterval); timerInterval = null; }


    // --- MAESTRO Y GRÁFICAS ---

    teacherLoginBtn.addEventListener("click", () => {
        if (teacherUser.value === TEACHER_USER && teacherPass.value === TEACHER_PASS) {
            teacherLogin.style.display = "none";
            teacherPanel.style.display = "block";
            loadTeacherPanel();
        } else { Swal.fire("Error", "Credenciales incorrectas", "error"); }
    });

    // Cargar tabla de estudiantes
    async function loadTeacherPanel() {
        const selectedGroupBefore = groupSelect.value;
        studentsTable.innerHTML = "<tr><td colspan='8'>Cargando...</td></tr>";
        
        const querySnapshot = await getDocs(collection(db, "students"));
        window.allStudentsData = []; // Guardar global para las gráficas
        
        querySnapshot.forEach((doc) => { 
            let data = doc.data();
            data.uid = doc.id;
            window.allStudentsData.push(data); 
        });

        // Grupos únicos
        const groups = [...new Set(window.allStudentsData.map(s => s.group))].sort();
        groupSelect.innerHTML = '<option value="">Todos los grupos</option>';
        groups.forEach(g => {
            const opt = document.createElement("option");
            opt.value = g; 
            opt.textContent = `Grupo ${g}`;
            groupSelect.appendChild(opt);
        });
        groupSelect.value = selectedGroupBefore;

        const filter = groupSelect.value;
        let filtered = filter ? window.allStudentsData.filter(s => s.group === filter) : window.allStudentsData;
        filtered.sort((a, b) => b.score - a.score);

        studentsTable.innerHTML = "";
        filtered.forEach(s => {
            const m = s.medals || {gold:0, silver:0, bronze:0};
            const row = document.createElement("tr");
            row.innerHTML = `
                <td>${s.username}</td><td>${s.grade}</td><td>${s.group}</td>
                <td>${s.score}</td><td>${s.unlockedLevels ? Math.max(...s.unlockedLevels) : 1}</td>
                <td>🥇${m.gold} 🥈${m.silver}</td>
                <td>
                   <button onclick="deleteStudent('${s.uid}')" style="background:red; color:white; border:none; border-radius:3px;">X</button>
                </td>`;
            studentsTable.appendChild(row);
        });
    }

    // --- NUEVO: Gráficas y PDF ---
    viewStatsBtn.addEventListener("click", () => {
        document.getElementById("statsModal").style.display = "block";
        renderCharts();
    });

    function renderCharts() {
        const ctx = document.getElementById('groupChart').getContext('2d');
        
        // Calcular totales
        let totalGold = 0, totalSilver = 0, totalBronze = 0;
        window.allStudentsData.forEach(s => {
            if(s.medals) {
                totalGold += s.medals.gold || 0;
                totalSilver += s.medals.silver || 0;
                totalBronze += s.medals.bronze || 0;
            }
        });

        if(window.myChart) window.myChart.destroy(); // Limpiar anterior

        window.myChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: ['Oro 🥇', 'Plata 🥈', 'Bronce 🥉'],
                datasets: [{
                    label: 'Medallas Totales del Grupo',
                    data: [totalGold, totalSilver, totalBronze],
                    backgroundColor: ['#FFD700', '#C0C0C0', '#CD7F32']
                }]
            }
        });

        // Llenar lista historial simple
        const list = document.getElementById("historyList");
        list.innerHTML = "";
        window.allStudentsData.forEach(s => {
            if(s.history && s.history.length > 0) {
                const last = s.history[s.history.length - 1];
                const li = document.createElement("li");
                li.innerHTML = `<b>${s.username}</b>: ${last.medal ? last.medal.toUpperCase() : 'Intento'} en Nivel ${last.level} (${last.score}%)`;
                list.appendChild(li);
            }
        });
    }

    downloadPdfBtn.addEventListener("click", () => {
        const element = document.getElementById('reportContent');
        html2pdf(element);
    });

    refreshTeacherBtn.addEventListener("click", loadTeacherPanel);
    groupSelect.addEventListener("change", loadTeacherPanel);

    // Funciones globales para botones HTML
    window.deleteStudent = async (uid) => {
        if(confirm("¿Eliminar alumno?")) {
            await deleteDoc(doc(db, "students", uid));
            loadTeacherPanel();
        }
    };

    // UI Generales
    logoutBtn.addEventListener("click", () => {
        saveProgress(); stopTimer();
        signOut(auth).then(() => { location.reload(); });
    });
    openTeacherBtn.addEventListener("click", () => { loginCard.style.display = "none"; teacherLogin.style.display = "block"; });
    closeTeacherPanel.addEventListener("click", () => { teacherPanel.style.display = "none"; loginCard.style.display = "block"; });
    closeTeacherLogin.addEventListener("click", () => { teacherLogin.style.display = "none"; loginCard.style.display = "block"; });
    
    themeToggle.addEventListener("click", () => {
        document.body.classList.toggle("dark");
        localStorage.setItem("theme", document.body.classList.contains("dark") ? "dark" : "light");
    });
    if (localStorage.getItem("theme") === "dark") document.body.classList.add("dark");

    hamburger.addEventListener("click", (e) => { e.stopPropagation(); nav.classList.toggle("active"); });

    function showStudentInterface() {
        loginCard.style.display = "none";
        mainContent.style.display = "block";
        logoutBtn.style.display = "inline-block";
        startTimer();
        startQuestion(); // Inicia la primera pregunta
    }

    function showLoginInterface() {
        loginCard.style.display = "block";
        mainContent.style.display = "none";
        logoutBtn.style.display = "none";
    }
});
