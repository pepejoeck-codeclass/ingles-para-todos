import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged } 
    from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { getFirestore, doc, setDoc, getDoc, getDocs, collection, updateDoc, deleteDoc, writeBatch, query, where } 
    from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// Configuración de Firebase
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

// --- VARIABLES GLOBALES DEL JUEGO ---
let currentLevel = 1;
let questionsInSession = 0;
let correctInSession = 0;
const SESSION_LENGTH = 5; // Preguntas necesarias para intentar ganar medalla

// BASE DE DATOS DE PREGUNTAS (Extendible)
const questionsDB = {
    1: [ // Básicos
        { q: "How do you say 'Hola' in English?", a: "hello" },
        { q: "How do you say 'Adiós' in English?", a: "goodbye" },
        { q: "How do you say 'Por favor' in English?", a: "please" },
        { q: "How do you say 'Gracias' in English?", a: "thank you" },
        { q: "How do you say 'Buenos días' in English?", a: "good morning" }
    ],
    2: [ // Animales
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
    
    // --- SONIDOS (Usando solo los que tienes en assets/sounds) ---
    const soundCorrect = new Audio("assets/sounds/correct.mp3");
    const soundError = new Audio("assets/sounds/wrong.mp3");
    const soundLevelUp = new Audio("assets/sounds/levelup.mp3"); 

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
          viewStatsBtn = document.getElementById("viewStatsBtn"),
          downloadPdfBtn = document.getElementById("downloadPdfBtn"),
          resetMonthlyBtn = document.getElementById("resetMonthlyBtn"),
          startBtn = document.getElementById("startGame"),
          checkBtn = document.getElementById("checkAnswer"),
          themeToggle = document.getElementById("themeToggle"),
          hamburger = document.getElementById("hamburger"),
          nav = document.getElementById("nav"),
          groupSelect = document.getElementById("groupSelect"),
          studentsTable = document.getElementById("studentsTable"),
          forgotPasswordLink = document.getElementById("forgotPasswordLink");

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
          progressText = document.getElementById("progressText"),
          miniMedals = document.getElementById("miniMedals");

    let currentUserId = null; 
    let currentUserData = {};
    let timerInterval = null;
    let currentQuestion = null;

    // --- 1. AUTENTICACIÓN Y RECUPERACIÓN DE CONTRASEÑA ---

    onAuthStateChanged(auth, async (user) => {
        if (user) {
            currentUserId = user.uid;
            await loadUserData(user.uid);
            showStudentInterface();
            updateLevelLocks();
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
            Swal.fire("Error", "Ingresa correo y contraseña (min 6 caracteres).", "warning");
            return;
        }

        loginBtn.disabled = true;
        loginBtn.textContent = "Procesando...";

        try {
            // Intentar login normal
            await signInWithEmailAndPassword(auth, email, password);
        } catch (error) {
            // Si falla, intentamos registrar si llenó los datos
            if (error.code === 'auth/user-not-found' || error.code === 'auth/invalid-credential' || error.code === 'auth/wrong-password') {
                if (!name || !grade || !group) {
                    Swal.fire("Usuario Nuevo", "Para crear tu cuenta, llena Nombre, Grado y Grupo arriba.", "info");
                    loginBtn.disabled = false;
                    loginBtn.textContent = "Entrar / Registrarse";
                    return;
                }
                try {
                    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
                    const user = userCredential.user;
                    
                    // AQUÍ ESTÁ LA SOLUCIÓN DEL UNDEFINED:
                    // Guardamos explícitamente la contraseña en Firestore
                    await setDoc(doc(db, "students", user.uid), {
                        uid: user.uid,
                        username: name, grade: grade, group: group, email: email,
                        password: password, // <-- GUARDADO PARA RECUPERACIÓN
                        score: 0, level: 1, stars: 0, timeWorked: 0,
                        medals: { gold: 0, silver: 0, bronze: 0 },
                        history: [],
                        unlockedLevels: [1],
                        lastLogin: new Date().toISOString()
                    });
                    Swal.fire("¡Bienvenido!", "Cuenta creada exitosamente.", "success");
                } catch (regError) { 
                    Swal.fire("Error Registro", regError.message, "error"); 
                }
            } else { 
                Swal.fire("Error Acceso", error.message, "error"); 
            }
        }
        loginBtn.disabled = false;
        loginBtn.textContent = "Entrar / Registrarse";
    });

    // Función: Olvidé mi contraseña
    forgotPasswordLink.addEventListener("click", async (e) => {
        e.preventDefault();
        const { value: email } = await Swal.fire({
            title: 'Recuperar Contraseña',
            input: 'email',
            inputLabel: 'Escribe tu correo registrado',
            inputPlaceholder: 'alumno@gmail.com',
            showCancelButton: true
        });

        if (email) {
            const q = query(collection(db, "students"), where("email", "==", email));
            const querySnapshot = await getDocs(q);
            
            if (!querySnapshot.empty) {
                const userData = querySnapshot.docs[0].data();
                if(userData.password) {
                    Swal.fire(`Hola ${userData.username}`, `Tu contraseña es: <b>${userData.password}</b>`, 'info');
                } else {
                    Swal.fire('Atención', 'Eres un usuario antiguo. Tu contraseña no está guardada visiblemente. Pide a tu maestro que la restablezca.', 'warning');
                }
            } else {
                Swal.fire('Error', 'Correo no encontrado.', 'error');
            }
        }
    });

    // --- 2. LÓGICA DE JUEGO ---

    async function loadUserData(uid) {
        const docRef = doc(db, "students", uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
            currentUserData = docSnap.data();
            // Inicializar campos nuevos si no existen
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
        levelText.textContent = `Nivel Juego: ${currentLevel}`;
        starsText.textContent = `⭐ ${currentUserData.stars || 0}`;
        const t = currentUserData.timeWorked || 0;
        const min = Math.floor(t / 60), sec = t % 60;
        timeText.textContent = `⏱ ${min}m ${sec}s`;
        userDisplay.textContent = `👤 ${currentUserData.username}`;
        
        // Mostrar medallas resumen
        const m = currentUserData.medals || {gold:0, silver:0, bronze:0};
        miniMedals.innerHTML = `🥇${m.gold} 🥈${m.silver}`;
    }

    window.selectLevel = (level) => {
        if (!currentUserData.unlockedLevels.includes(level)) {
            Swal.fire({
                icon: 'error',
                title: 'Nivel Bloqueado 🔒',
                text: 'Necesitas medalla de ORO o PLATA en el nivel anterior para entrar.'
            });
            return;
        }
        currentLevel = level;
        questionsInSession = 0;
        correctInSession = 0;
        updateProgressBar();
        startQuestion();
        nav.classList.remove("active");
    };

    function startQuestion() {
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
            feedback.textContent = "🔥 ¡Excellent!";
            feedback.style.color = "green";
            soundCorrect.play().catch(()=>{}); // SONIDO CORRECT
            currentUserData.score += 10;
            currentUserData.stars += 1;
            correctInSession++;
        } else {
            feedback.textContent = `❌ Correct was: ${currentQuestion.a}`;
            feedback.style.color = "red";
            soundError.play().catch(()=>{}); // SONIDO WRONG
        }

        updateProgressBar();
        updateDisplay();

        if (questionsInSession >= SESSION_LENGTH) {
            await finishSession();
        } else {
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

        // LÓGICA DE SONIDOS Y MEDALLAS
        if (percentage === 100) {
            medal = "gold";
            msg = "🥇 PERFECT! GOLD MEDAL!";
            icon = "success";
            soundLevelUp.play().catch(()=>{}); // REUTILIZAMOS LEVELUP PARA GOLD
            currentUserData.medals.gold++;
            unlockNextLevel();
        } else if (percentage >= 80) {
            medal = "silver";
            msg = "🥈 Great job! SILVER MEDAL!";
            icon = "success";
            soundLevelUp.play().catch(()=>{}); // SONIDO LEVELUP
            currentUserData.medals.silver++;
            unlockNextLevel();
        } else {
            medal = "bronze";
            msg = "🥉 Keep practicing! Bronze medal.";
            icon = "warning";
            // No sound or generic sound
            currentUserData.medals.bronze++;
        }

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
            text: `Aciertos: ${correctInSession} de ${SESSION_LENGTH}`,
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
        // Solo tenemos 3 niveles definidos por ahora
        if (next <= 3 && !currentUserData.unlockedLevels.includes(next)) {
            currentUserData.unlockedLevels.push(next);
            Swal.fire("NIVEL DESBLOQUEADO", `Has abierto la Lección ${next}`, "success");
        }
    }

    function updateLevelLocks() {
        if(!currentUserData.unlockedLevels) return;
        
        const levels = [2, 3];
        levels.forEach(lvl => {
            const el = document.getElementById(`navL${lvl}`);
            if(currentUserData.unlockedLevels.includes(lvl)) {
                el.classList.remove("locked");
                // Quitamos el candado visualmente
                const icon = el.querySelector('i');
                if(icon) { icon.classList.remove('fa-lock'); icon.classList.add('fa-unlock'); }
            }
        });
    }

    // Timer
    function startTimer() {
        if (timerInterval) clearInterval(timerInterval);
        timerInterval = setInterval(() => {
            if(!currentUserData.timeWorked) currentUserData.timeWorked = 0;
            currentUserData.timeWorked++;
            if (currentUserData.timeWorked % 5 === 0) updateDisplay();
            if (currentUserData.timeWorked % 30 === 0) saveProgress();
        }, 1000);
    }
    function stopTimer() { clearInterval(timerInterval); timerInterval = null; }


    // --- 3. PANEL MAESTRO (Botones Restaurados) ---

    teacherLoginBtn.addEventListener("click", () => {
        if (teacherUser.value === TEACHER_USER && teacherPass.value === TEACHER_PASS) {
            teacherLogin.style.display = "none";
            teacherPanel.style.display = "block";
            loadTeacherPanel();
        } else { Swal.fire("Error", "Contraseña incorrecta", "error"); }
    });

    // FUNCIONES GLOBALES PARA LOS BOTONES DE LA TABLA
    // Se agregan a 'window' porque los botones HTML onclick no ven lo que está dentro del module
    
    window.changeGroup = async (uid) => {
        const { value: newGroup } = await Swal.fire({
            title: 'Cambiar Grupo',
            input: 'text',
            inputLabel: 'Nuevo Grupo (Ej: B)',
            showCancelButton: true
        });
        if (newGroup) {
            await updateDoc(doc(db, "students", uid), { group: newGroup.toUpperCase() });
            Swal.fire("Actualizado", "Grupo cambiado", "success");
            loadTeacherPanel();
        }
    };

    window.resetStudent = async (uid) => {
        const result = await Swal.fire({
            title: '¿Reiniciar Alumno?',
            text: "Se borrarán sus puntos, medallas y nivel volverá a 1.",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Sí, reiniciar'
        });

        if (result.isConfirmed) {
            await updateDoc(doc(db, "students", uid), {
                score: 0, stars: 0, level: 1, timeWorked: 0,
                medals: {gold:0, silver:0, bronze:0},
                unlockedLevels: [1],
                history: []
            });
            Swal.fire('Reiniciado', 'El alumno comienza desde cero.', 'success');
            loadTeacherPanel();
        }
    };

    window.deleteStudent = async (uid) => {
        const result = await Swal.fire({
            title: '¿Eliminar Alumno?',
            text: "Esta acción no se puede deshacer.",
            icon: 'error',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            confirmButtonText: 'Sí, eliminar'
        });

        if (result.isConfirmed) {
            await deleteDoc(doc(db, "students", uid));
            Swal.fire('Eliminado', 'Alumno borrado de la base de datos.', 'success');
            loadTeacherPanel();
        }
    };

    async function loadTeacherPanel() {
        const selectedGroupBefore = groupSelect.value;
        studentsTable.innerHTML = "<tr><td colspan='6'>Cargando datos...</td></tr>";
        
        const querySnapshot = await getDocs(collection(db, "students"));
        window.allStudentsData = [];
        
        querySnapshot.forEach((doc) => { 
            let data = doc.data();
            data.uid = doc.id;
            window.allStudentsData.push(data); 
        });

        // Llenar select de grupos
        const groups = [...new Set(window.allStudentsData.map(s => s.group))].sort();
        groupSelect.innerHTML = '<option value="">Todos los grupos</option>';
        groups.forEach(g => {
            const opt = document.createElement("option");
            opt.value = g; opt.textContent = `Grupo ${g}`;
            groupSelect.appendChild(opt);
        });
        groupSelect.value = selectedGroupBefore;

        // Filtrar y Ordenar
        const filter = groupSelect.value;
        let filtered = filter ? window.allStudentsData.filter(s => s.group === filter) : window.allStudentsData;
        filtered.sort((a, b) => b.score - a.score);

        studentsTable.innerHTML = "";
        
        // --- AQUÍ REGENERAMOS LOS BOTONES QUE TE FALTABAN ---
        filtered.forEach(s => {
            const m = s.medals || {gold:0, silver:0, bronze:0};
            const row = document.createElement("tr");
            row.innerHTML = `
                <td>${s.username}</td>
                <td>${s.group}</td>
                <td>${s.score}</td>
                <td>${Math.max(...(s.unlockedLevels || [1]))}</td>
                <td>🥇${m.gold} 🥈${m.silver} 🥉${m.bronze}</td>
                <td>
                   <button onclick="changeGroup('${s.uid}')" class="action-btn btn-group" title="Cambiar Grupo"><i class="fas fa-folder"></i></button>
                   <button onclick="resetStudent('${s.uid}')" class="action-btn btn-reset" title="Reiniciar Progreso"><i class="fas fa-sync"></i></button>
                   <button onclick="deleteStudent('${s.uid}')" class="action-btn btn-delete" title="Eliminar Alumno"><i class="fas fa-trash"></i></button>
                </td>`;
            studentsTable.appendChild(row);
        });
    }

    // --- GRÁFICAS Y EXPORTAR ---

    viewStatsBtn.addEventListener("click", () => {
        document.getElementById("statsModal").style.display = "block";
        setTimeout(renderCharts, 200); // Pequeño delay para asegurar que el modal abrió
    });

    function renderCharts() {
        const ctx = document.getElementById('groupChart').getContext('2d');
        let totalGold = 0, totalSilver = 0, totalBronze = 0;
        
        window.allStudentsData.forEach(s => {
            if(s.medals) {
                totalGold += s.medals.gold || 0;
                totalSilver += s.medals.silver || 0;
                totalBronze += s.medals.bronze || 0;
            }
        });

        if(window.myChart) window.myChart.destroy();

        window.myChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: ['Oro 🥇', 'Plata 🥈', 'Bronce 🥉'],
                datasets: [{
                    label: 'Total de Medallas del Grupo',
                    data: [totalGold, totalSilver, totalBronze],
                    backgroundColor: ['#FFD700', '#C0C0C0', '#CD7F32'],
                    borderWidth: 1
                }]
            },
            options: { scales: { y: { beginAtZero: true } } }
        });

        // Historial
        const list = document.getElementById("historyList");
        list.innerHTML = "";
        // Mostrar los últimos 10 eventos de todos los alumnos
        let allEvents = [];
        window.allStudentsData.forEach(s => {
            if(s.history) {
                s.history.forEach(h => allEvents.push({...h, user: s.username}));
            }
        });
        // Ordenar por fecha (simulada aquí por orden de inserción ya que no tenemos timestamp exacto en historial)
        allEvents = allEvents.slice(-10).reverse(); 

        allEvents.forEach(e => {
            const li = document.createElement("li");
            li.style.borderBottom = "1px solid #ddd";
            li.style.padding = "5px";
            li.innerHTML = `<b>${e.user}</b> obtuvo medalla <b>${(e.medal || 'Ninguna').toUpperCase()}</b> en Nivel ${e.level} (${e.score}%)`;
            list.appendChild(li);
        });
    }

    downloadPdfBtn.addEventListener("click", () => {
        const element = document.getElementById('reportContent');
        const opt = { margin: 10, filename: 'Reporte_Clase.pdf', image: { type: 'jpeg', quality: 0.98 }, html2canvas: { scale: 2 }, jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' } };
        html2pdf().set(opt).from(element).save();
    });

    resetMonthlyBtn.addEventListener("click", async () => {
        const confirmCode = prompt("Escribe 'BORRAR' para reiniciar a TODOS los alumnos a cero:");
        if (confirmCode === "BORRAR") {
            const querySnapshot = await getDocs(collection(db, "students"));
            const batch = writeBatch(db);
            querySnapshot.forEach((documento) => {
                const ref = doc(db, "students", documento.id);
                batch.update(ref, { score: 0, stars: 0, level: 1, timeWorked: 0, medals: {gold:0, silver:0, bronze:0}, unlockedLevels: [1], history: [] });
            });
            await batch.commit();
            Swal.fire("Reiniciado", "Toda la escuela ha sido reiniciada.", "success");
            loadTeacherPanel();
        }
    });

    refreshTeacherBtn.addEventListener("click", loadTeacherPanel);
    groupSelect.addEventListener("change", loadTeacherPanel);

    // --- INTERFAZ GENERAL ---
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
        startQuestion();
    }

    function showLoginInterface() {
        loginCard.style.display = "block";
        mainContent.style.display = "none";
        logoutBtn.style.display = "none";
    }
});
