import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged } 
    from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { getFirestore, doc, setDoc, getDoc, getDocs, collection, updateDoc, deleteDoc, writeBatch, query, where } 
    from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// --- CONFIGURACIÓN DE FIREBASE ---
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

// Inicializar Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// --- VARIABLES GLOBALES DEL JUEGO ---
let currentLevel = 1;
let questionsInSession = 0;
let correctInSession = 0;
const SESSION_LENGTH = 5; 

// --- BASE DE DATOS DE PREGUNTAS ---
const questionsDB = {
    1: [ 
        { q: "How do you say 'Hola' in English?", a: "hello" },
        { q: "How do you say 'Adiós' in English?", a: "goodbye" },
        { q: "How do you say 'Por favor' in English?", a: "please" },
        { q: "How do you say 'Gracias' in English?", a: "thank you" },
        { q: "How do you say 'Buenos días' in English?", a: "good morning" }
    ],
    2: [
        { q: "How do you say 'Gato' in English?", a: "cat" },
        { q: "How do you say 'Perro' in English?", a: "dog" },
        { q: "How do you say 'Pájaro' in English?", a: "bird" },
        { q: "How do you say 'León' in English?", a: "lion" },
        { q: "How do you say 'Pez' in English?", a: "fish" }
    ],
    3: [
        { q: "How do you say 'Rojo' in English?", a: "red" },
        { q: "How do you say 'Azul' in English?", a: "blue" },
        { q: "How do you say 'Verde' in English?", a: "green" },
        { q: "How do you say 'Amarillo' in English?", a: "yellow" },
        { q: "How do you say 'Negro' in English?", a: "black" }
    ]
};

document.addEventListener("DOMContentLoaded", () => {
    
    // --- SONIDOS ---
    const soundCorrect = new Audio("assets/sounds/correct.mp3");
    const soundError = new Audio("assets/sounds/wrong.mp3");
    const soundLevelUp = new Audio("assets/sounds/levelup.mp3"); 

    // --- CREDENCIALES MAESTRO ---
    // NOTA IMPORTANTE: Estas variables deben tener nombres distintos a los IDs del HTML
    const TEACHER_USERNAME_VAL = "Jose de Jesus Ramos Flores";
    const TEACHER_PASSWORD_VAL = "161286";

    // --- REFERENCIAS DOM ---
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
    const teacherLogoutBtn = document.getElementById("teacherLogoutBtn");
    const refreshTeacherBtn = document.getElementById("refreshTeacher");
    const viewStatsBtn = document.getElementById("viewStatsBtn");
    const downloadPdfBtn = document.getElementById("downloadPdfBtn");
    const exportExcelBtn = document.getElementById("exportExcelBtn");
    const resetMonthlyBtn = document.getElementById("resetMonthlyBtn");
    const startBtn = document.getElementById("startGame");
    const checkBtn = document.getElementById("checkAnswer");
    const forgotPasswordLink = document.getElementById("forgotPasswordLink");

    // Inputs Login Alumno
    const gradeInput = document.getElementById("gradeInput");
    const groupInput = document.getElementById("groupInput");
    const usernameInput = document.getElementById("usernameInput");
    const emailInput = document.getElementById("emailInput");
    const passwordInput = document.getElementById("passwordInput");

    // Inputs Maestro (IDs actualizados en HTML para evitar conflictos)
    const teacherUserInput = document.getElementById("teacherUserInputHTML");
    const teacherPassInput = document.getElementById("teacherPassInputHTML");
    
    // Panel Maestro elementos
    const groupSelect = document.getElementById("groupSelect");
    const studentsTable = document.getElementById("studentsTable");

    // HUD Juego
    const userDisplay = document.getElementById("userDisplay");
    const questionText = document.getElementById("questionText");
    const answerInput = document.getElementById("answerInput");
    const feedback = document.getElementById("feedback");
    const scoreText = document.getElementById("scoreText");
    const levelText = document.getElementById("levelText");
    const timeText = document.getElementById("timeText");
    const lessonProgressBar = document.getElementById("lessonProgressBar");

    // Contadores Teacher Dashboard
    const correctCountDisplay = document.getElementById("correctCount");
    const wrongCountDisplay = document.getElementById("wrongCount");
    const medalsCountDisplay = document.getElementById("medalsCount");

    // Variables de Estado
    let currentUserId = null; 
    let currentUserData = {};
    let timerInterval = null;
    let currentQuestion = null;

    // ==========================================
    // 1. SISTEMA DE AUTENTICACIÓN (LOGIN)
    // ==========================================

    // Escuchar cambios de sesión (se activa automático al loguearse)
    onAuthStateChanged(auth, async (user) => {
        if (user) {
            currentUserId = user.uid;
            console.log("Usuario autenticado:", user.email);
            await loadUserData(user.uid);
            showStudentInterface();
            updateLevelLocks();
        } else {
            currentUserId = null;
            currentUserData = {};
            // Solo mostramos login si no estamos en panel maestro
            if(teacherPanel.style.display === "none" && teacherLogin.style.display === "none") {
                showLoginInterface();
            }
        }
    });

    if(loginBtn) {
        loginBtn.addEventListener("click", async () => {
            const email = emailInput.value.trim();
            const password = passwordInput.value.trim();
            const name = usernameInput.value.trim();
            const grade = gradeInput.value.trim();
            const group = groupInput.value.trim().toUpperCase();

            if (!email || !password || password.length < 6) {
                Swal.fire("Error", "Ingresa un correo y contraseña válida (mínimo 6 caracteres).", "warning");
                return;
            }

            loginBtn.disabled = true;
            loginBtn.textContent = "🚀 Verificando...";

            try {
                // INTENTO DE INICIAR SESIÓN
                await signInWithEmailAndPassword(auth, email, password);
                // Si funciona, onAuthStateChanged hará el resto
            } catch (error) {
                console.error("Error Login:", error.code);
                
                // SI EL USUARIO NO EXISTE, INTENTAMOS REGISTRARLO
                if (error.code === 'auth/user-not-found' || error.code === 'auth/invalid-credential') {
                    
                    // Si intenta registrarse, DEBE llenar los otros datos
                    if (!name || !grade || !group) {
                        Swal.fire({
                            title: "Usuario Nuevo",
                            text: "Ese correo no existe. Para crear tu cuenta, llena Nombre, Grado y Grupo.",
                            icon: "info"
                        });
                        loginBtn.disabled = false;
                        loginBtn.textContent = "🚀 DESPEGAR";
                        return;
                    }

                    try {
                        // CREAR USUARIO NUEVO
                        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
                        const user = userCredential.user;
                        
                        // Guardar en base de datos
                        await setDoc(doc(db, "students", user.uid), {
                            uid: user.uid,
                            username: name, 
                            grade: grade, 
                            group: group, 
                            email: email,
                            password: password, 
                            score: 0, 
                            level: 1, 
                            timeWorked: 0,
                            totalCorrect: 0,
                            totalWrong: 0,
                            medals: { gold: 0, silver: 0, bronze: 0 },
                            history: [],
                            unlockedLevels: [1],
                            lastLogin: new Date().toISOString()
                        });
                        Swal.fire("¡Bienvenido!", "Cuenta creada exitosamente.", "success");
                    } catch (regError) { 
                        let msg = "Error al crear cuenta.";
                        if(regError.code === 'auth/email-already-in-use') msg = "Ese correo ya está registrado. Verifica tu contraseña.";
                        Swal.fire("Error Registro", msg, "error"); 
                    }
                } else if (error.code === 'auth/wrong-password') {
                    Swal.fire("Contraseña Incorrecta", "Inténtalo de nuevo.", "error");
                } else { 
                    Swal.fire("Error Acceso", error.message, "error"); 
                }
            }
            loginBtn.disabled = false;
            loginBtn.textContent = "🚀 DESPEGAR";
        });
    }

    // Recuperar contraseña
    if(forgotPasswordLink) {
        forgotPasswordLink.addEventListener("click", async (e) => {
            e.preventDefault();
            const { value: email } = await Swal.fire({
                title: 'Recuperar Contraseña',
                input: 'email',
                inputLabel: 'Escribe tu correo registrado',
                showCancelButton: true
            });

            if (email) {
                try {
                    const q = query(collection(db, "students"), where("email", "==", email));
                    const querySnapshot = await getDocs(q);
                    if (!querySnapshot.empty) {
                        const userData = querySnapshot.docs[0].data();
                        if(userData.password) Swal.fire(`Hola ${userData.username}`, `Tu contraseña es: <b>${userData.password}</b>`, 'info');
                        else Swal.fire('Atención', 'Este usuario no tiene contraseña visible.', 'warning');
                    } else { 
                        Swal.fire('Error', 'Correo no encontrado.', 'error'); 
                    }
                } catch(err) {
                    console.error(err);
                    Swal.fire('Error', 'Error de conexión.', 'error');
                }
            }
        });
    }

    // ==========================================
    // 2. LÓGICA DEL JUEGO
    // ==========================================

    async function loadUserData(uid) {
        try {
            const docRef = doc(db, "students", uid);
            const docSnap = await getDoc(docRef);
            if (docSnap.exists()) {
                currentUserData = docSnap.data();
                // Inicializar datos faltantes si es cuenta vieja
                if(!currentUserData.medals) currentUserData.medals = { gold:0, silver:0, bronze:0 };
                if(!currentUserData.unlockedLevels) currentUserData.unlockedLevels = [1];
                if(!currentUserData.totalCorrect) currentUserData.totalCorrect = 0;
                if(!currentUserData.totalWrong) currentUserData.totalWrong = 0;
                updateDisplay();
            }
        } catch (e) { console.error("Error cargando datos:", e); }
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
        scoreText.textContent = `Puntos: ${currentUserData.score || 0}`;
        levelText.textContent = `Nivel: ${currentLevel}`;
        userDisplay.textContent = `⚡ Alumno: ${currentUserData.username}`;
        
        const t = currentUserData.timeWorked || 0;
        const min = Math.floor(t / 60), sec = t % 60;
        if(timeText) timeText.textContent = `⏱ ${min}m ${sec}s`;
    }

    // Funciones globales para HTML
    window.selectLevel = (level) => {
        if (!currentUserData.unlockedLevels || !currentUserData.unlockedLevels.includes(level)) {
            Swal.fire({ icon: 'error', title: '¡Bloqueado!', text: 'Completa el nivel anterior primero.' });
            return;
        }
        currentLevel = level;
        questionsInSession = 0;
        correctInSession = 0;
        updateProgressBar();
        
        // UI Nav
        document.querySelectorAll('.nav-item').forEach(el => el.classList.remove('active'));
        if(level === 1) document.querySelector('.nav-item:nth-child(1)').classList.add('active');
        if(level === 2) document.getElementById('navL2').classList.add('active');
        if(level === 3) document.getElementById('navL3').classList.add('active');

        startQuestion();
    };

    function startQuestion() {
        const pool = questionsDB[currentLevel] || questionsDB[1];
        currentQuestion = pool[Math.floor(Math.random() * pool.length)];
        questionText.textContent = currentQuestion.q;
        feedback.textContent = "";
        answerInput.value = "";
        answerInput.focus();
    }

    if(checkBtn) {
        checkBtn.addEventListener("click", async () => {
            if (!currentQuestion) return;
            const userAns = answerInput.value.trim().toLowerCase();
            if(!userAns) return;

            questionsInSession++;
            
            if (userAns === currentQuestion.a) {
                feedback.textContent = "🔥 ¡Correcto!";
                feedback.style.color = "#28a745";
                soundCorrect.play().catch(()=>{});
                
                currentUserData.score += 10;
                currentUserData.totalCorrect = (currentUserData.totalCorrect || 0) + 1;
                correctInSession++;
            } else {
                feedback.textContent = `❌ Era: ${currentQuestion.a}`;
                feedback.style.color = "#dc3545";
                soundError.play().catch(()=>{});
                currentUserData.totalWrong = (currentUserData.totalWrong || 0) + 1;
            }

            updateProgressBar();
            updateDisplay();
            await saveProgress();

            if (questionsInSession >= SESSION_LENGTH) {
                setTimeout(finishSession, 1000);
            } else {
                setTimeout(startQuestion, 1500);
            }
        });
    }

    if(answerInput) {
        answerInput.addEventListener("keypress", function(event) {
            if (event.key === "Enter") {
                event.preventDefault();
                checkBtn.click();
            }
        });
    }

    function updateProgressBar() {
        const pct = (questionsInSession / SESSION_LENGTH) * 100;
        lessonProgressBar.style.width = pct + "%";
    }

    async function finishSession() {
        const percentage = (correctInSession / SESSION_LENGTH) * 100;
        let medal = null;
        let msg = "";

        if (percentage === 100) {
            medal = "gold"; msg = "🥇 ¡MEDALLA DE ORO!";
            soundLevelUp.play().catch(()=>{});
            currentUserData.medals.gold++;
            unlockNextLevel();
        } else if (percentage >= 80) {
            medal = "silver"; msg = "🥈 ¡MEDALLA DE PLATA!";
            soundLevelUp.play().catch(()=>{});
            currentUserData.medals.silver++;
            unlockNextLevel();
        } else {
            medal = "bronze"; msg = "🥉 Medalla de Bronce.";
            currentUserData.medals.bronze++;
        }

        if(!currentUserData.history) currentUserData.history = [];
        currentUserData.history.push({
            date: new Date().toLocaleDateString(),
            level: currentLevel,
            score: percentage,
            medal: medal
        });

        await saveProgress();
        updateDisplay();
        updateLevelLocks();

        Swal.fire({
            title: msg,
            text: `Aciertos: ${correctInSession} de ${SESSION_LENGTH}`,
            icon: medal === 'bronze' ? 'info' : 'success',
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
        if (next <= 3 && !currentUserData.unlockedLevels.includes(next)) {
            currentUserData.unlockedLevels.push(next);
            Swal.fire("NIVEL DESBLOQUEADO", `¡Lección ${next} abierta!`, "success");
        }
    }

    function updateLevelLocks() {
        if(!currentUserData || !currentUserData.unlockedLevels) return;
        [2, 3].forEach(lvl => {
            const el = document.getElementById(`navL${lvl}`);
            if(el) {
                if(currentUserData.unlockedLevels.includes(lvl)) {
                    el.classList.remove("locked");
                    const icon = el.querySelector('i');
                    if(icon) { icon.classList.remove('fa-lock'); icon.classList.add('fa-unlock'); }
                } else {
                    el.classList.add("locked");
                    const icon = el.querySelector('i');
                    if(icon) { icon.classList.remove('fa-unlock'); icon.classList.add('fa-lock'); }
                }
            }
        });
    }

    function startTimer() {
        if (timerInterval) clearInterval(timerInterval);
        timerInterval = setInterval(() => {
            if(currentUserData) {
                if(!currentUserData.timeWorked) currentUserData.timeWorked = 0;
                currentUserData.timeWorked++;
                if (currentUserData.timeWorked % 5 === 0) updateDisplay();
                if (currentUserData.timeWorked % 30 === 0) saveProgress();
            }
        }, 1000);
    }
    
    function stopTimer() { clearInterval(timerInterval); timerInterval = null; }

    // ==========================================
    // 3. PANEL DE MAESTRO (SOLUCIÓN LOGIN)
    // ==========================================

    if(teacherLoginBtn) {
        teacherLoginBtn.addEventListener("click", () => {
            // Depuración: ver qué está escribiendo
            console.log("Intentando login maestro...");
            
            const userVal = teacherUserInput.value.trim(); // Elimina espacios accidentales
            const passVal = teacherPassInput.value.trim();

            if (userVal === TEACHER_USERNAME_VAL && passVal === TEACHER_PASSWORD_VAL) {
                teacherLogin.style.display = "none";
                teacherPanel.style.display = "block";
                loadTeacherPanel();
                Swal.fire("Acceso Concedido", "Bienvenido Profesor", "success");
            } else { 
                Swal.fire("Acceso Denegado", "Usuario o contraseña incorrectos", "error"); 
            }
        });
    }

    if(teacherLogoutBtn) {
        teacherLogoutBtn.addEventListener("click", () => {
            teacherPanel.style.display = "none";
            teacherUserInput.value = "";
            teacherPassInput.value = "";
            loginCard.style.display = "block";
        });
    }

    // Funciones globales (window) para la tabla dinámica
    window.changeGroup = async (uid) => {
        const { value: newGroup } = await Swal.fire({
            title: 'Cambiar Grupo',
            input: 'text',
            showCancelButton: true
        });
        if (newGroup) {
            await updateDoc(doc(db, "students", uid), { group: newGroup.toUpperCase() });
            loadTeacherPanel();
            Swal.fire("Listo", "Grupo actualizado", "success");
        }
    };

    window.resetStudent = async (uid) => {
        if (confirm("¿Estás seguro de REINICIAR el progreso de este alumno a cero?")) {
            await updateDoc(doc(db, "students", uid), {
                score: 0, level: 1, timeWorked: 0,
                totalCorrect: 0, totalWrong: 0,
                medals: {gold:0, silver:0, bronze:0},
                unlockedLevels: [1], history: []
            });
            loadTeacherPanel();
            Swal.fire("Reiniciado", "El alumno empieza desde cero.", "success");
        }
    };

    window.deleteStudent = async (uid) => {
        if (confirm("¿ELIMINAR ALUMNO DEFINITIVAMENTE? Esta acción no se puede deshacer.")) {
            await deleteDoc(doc(db, "students", uid));
            loadTeacherPanel();
            Swal.fire("Eliminado", "Alumno borrado de la base de datos.", "success");
        }
    };

    window.viewStudentStats = (uid) => {
        const student = window.allStudentsData.find(s => s.uid === uid);
        if(!student) return;

        document.getElementById("statsModal").style.display = "flex"; 
        const indArea = document.getElementById("individualStatsArea");
        if(indArea) indArea.style.display = "block";
        
        const nameLabel = document.getElementById("individualName");
        if(nameLabel) nameLabel.textContent = `Detalle: ${student.username}`;

        const chartCanvas = document.getElementById('individualChart');
        if(chartCanvas) {
            const ctx = chartCanvas.getContext('2d');
            if(window.indChart instanceof Chart) window.indChart.destroy();
            
            window.indChart = new Chart(ctx, {
                type: 'doughnut',
                data: {
                    labels: ['Correctas ✅', 'Incorrectas ❌'],
                    datasets: [{
                        data: [student.totalCorrect || 0, student.totalWrong || 0],
                        backgroundColor: ['#28a745', '#dc3545']
                    }]
                }
            });
        }
        renderCharts(); 
    };

    async function loadTeacherPanel() {
        const selectedGroupBefore = groupSelect.value;
        studentsTable.innerHTML = "<tr><td colspan='6' style='text-align:center'>Cargando datos...</td></tr>";
        
        try {
            const querySnapshot = await getDocs(collection(db, "students"));
            window.allStudentsData = [];
            
            querySnapshot.forEach((doc) => { 
                let data = doc.data();
                data.uid = doc.id;
                window.allStudentsData.push(data); 
            });

            // Llenar select grupos
            const groups = [...new Set(window.allStudentsData.map(s => s.group))].sort();
            groupSelect.innerHTML = '<option value="">Todos los grupos</option>';
            groups.forEach(g => {
                if(g) {
                    const opt = document.createElement("option");
                    opt.value = g; opt.textContent = `Grupo ${g}`;
                    groupSelect.appendChild(opt);
                }
            });
            groupSelect.value = selectedGroupBefore;

            renderTable();
            renderCharts();

        } catch(e) {
            console.error("Error panel:", e);
            studentsTable.innerHTML = "<tr><td colspan='6' style='color:red'>Error cargando datos.</td></tr>";
        }
    }

    function renderTable() {
        const filter = groupSelect.value;
        let filtered = filter ? window.allStudentsData.filter(s => s.group === filter) : window.allStudentsData;
        
        filtered.sort((a, b) => (b.score || 0) - (a.score || 0)); // Ordenar por puntos

        studentsTable.innerHTML = "";
        
        if(filtered.length === 0) {
            studentsTable.innerHTML = "<tr><td colspan='6' style='text-align:center'>No hay alumnos.</td></tr>";
            return;
        }

        filtered.forEach(s => {
            const min = Math.floor((s.timeWorked || 0) / 60);
            const sec = (s.timeWorked || 0) % 60;
            const timeStr = `${min}m ${sec}s`;
            const correct = s.totalCorrect || 0;
            const level = Math.max(...(s.unlockedLevels || [1]));

            const row = document.createElement("tr");
            row.innerHTML = `
                <td>${s.username || "Sin Nombre"}</td>
                <td>${s.group || "-"}</td>
                <td style="text-align:center">${level}</td>
                <td style="font-weight:bold; color:blue;">${s.score || 0} pts</td>
                <td style="color:green; text-align:center">${correct}</td>
                <td>
                   <button onclick="viewStudentStats('${s.uid}')" class="action-btn btn-info" title="Ver"><i class="fas fa-chart-pie"></i></button>
                   <button onclick="changeGroup('${s.uid}')" class="action-btn btn-reset" style="background:#6c757d; color:white;" title="Grupo"><i class="fas fa-folder"></i></button>
                   <button onclick="resetStudent('${s.uid}')" class="action-btn btn-reset" title="Reiniciar"><i class="fas fa-sync"></i></button>
                   <button onclick="deleteStudent('${s.uid}')" class="action-btn btn-delete" title="Eliminar"><i class="fas fa-trash"></i></button>
                </td>`;
            studentsTable.appendChild(row);
        });
    }

    // ==========================================
    // 4. EXPORTACIÓN Y GRÁFICAS
    // ==========================================

    if(exportExcelBtn) {
        exportExcelBtn.addEventListener("click", () => {
            if(!window.allStudentsData || window.allStudentsData.length === 0) {
                Swal.fire("Vacío", "No hay datos.", "warning"); return;
            }
            
            const dataForExcel = window.allStudentsData.map(s => ({
                Nombre: s.username, Grupo: s.group, Correo: s.email,
                Pass: s.password || "Oculta", Puntos: s.score,
                Nivel: Math.max(...(s.unlockedLevels || [1])),
                Tiempo_Min: ((s.timeWorked||0)/60).toFixed(2),
                Correctas: s.totalCorrect || 0, Incorrectas: s.totalWrong || 0,
                Oro: (s.medals?.gold || 0), Plata: (s.medals?.silver || 0), Bronce: (s.medals?.bronze || 0)
            }));

            const ws = XLSX.utils.json_to_sheet(dataForExcel);
            const wb = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(wb, ws, "Reporte");
            XLSX.writeFile(wb, "Reporte_Escuela.xlsx");
        });
    }

    if(viewStatsBtn) {
        viewStatsBtn.addEventListener("click", () => {
            const modal = document.getElementById("statsModal");
            if(modal) modal.style.display = "flex";
            const indArea = document.getElementById("individualStatsArea");
            if(indArea) indArea.style.display = "none"; 
            setTimeout(renderCharts, 200);
        });
    }

    window.onclick = function(event) {
        const modal = document.getElementById("statsModal");
        if (event.target == modal) modal.style.display = "none";
    };

    function renderCharts() {
        const chartCanvas = document.getElementById('groupChart');
        if(!chartCanvas) return;
        
        const ctx = chartCanvas.getContext('2d');
        let totalGold = 0, totalSilver = 0, totalBronze = 0;
        let totalCorrect = 0, totalWrong = 0;
        
        if(window.allStudentsData) {
            window.allStudentsData.forEach(s => {
                if(s.medals) {
                    totalGold += s.medals.gold || 0;
                    totalSilver += s.medals.silver || 0;
                    totalBronze += s.medals.bronze || 0;
                }
                totalCorrect += s.totalCorrect || 0;
                totalWrong += s.totalWrong || 0;
            });
        }
        
        if(medalsCountDisplay) medalsCountDisplay.textContent = totalGold + totalSilver + totalBronze;
        if(correctCountDisplay) correctCountDisplay.textContent = totalCorrect;
        if(wrongCountDisplay) wrongCountDisplay.textContent = totalWrong;

        if(window.myChart instanceof Chart) window.myChart.destroy();

        window.myChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: ['Oro 🥇', 'Plata 🥈', 'Bronce 🥉'],
                datasets: [{
                    label: 'Total Medallas',
                    data: [totalGold, totalSilver, totalBronze],
                    backgroundColor: ['#FFD700', '#C0C0C0', '#CD7F32']
                }]
            },
            options: { scales: { y: { beginAtZero: true } } }
        });
    }

    if(downloadPdfBtn) {
        downloadPdfBtn.addEventListener("click", () => {
            const element = document.getElementById('reportContent');
            const opt = { 
                margin: 10, filename: 'Reporte.pdf', image: { type: 'jpeg', quality: 0.98 }, 
                html2canvas: { scale: 2 }, jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' } 
            };
            html2pdf().set(opt).from(element).save();
        });
    }

    if(refreshTeacherBtn) refreshTeacherBtn.addEventListener("click", loadTeacherPanel);
    if(groupSelect) groupSelect.addEventListener("change", renderTable); 

    if(resetMonthlyBtn) {
        resetMonthlyBtn.addEventListener("click", async () => {
            const confirmCode = prompt("⚠️ Escribe 'BORRAR' para reiniciar a TODOS los alumnos:");
            if (confirmCode === "BORRAR") {
                const batch = writeBatch(db);
                window.allStudentsData.forEach((student) => {
                    const ref = doc(db, "students", student.uid);
                    batch.update(ref, { 
                        score: 0, level: 1, timeWorked: 0, 
                        totalCorrect: 0, totalWrong: 0,
                        medals: {gold:0, silver:0, bronze:0}, 
                        unlockedLevels: [1], history: [] 
                    });
                });
                await batch.commit();
                Swal.fire("Reiniciado", "Escuela reiniciada.", "success");
                loadTeacherPanel();
            }
        });
    }

    // ==========================================
    // 5. UTILIDADES (LOGOUT Y UI)
    // ==========================================

    if(logoutBtn) {
        logoutBtn.addEventListener("click", () => {
            saveProgress(); 
            stopTimer();
            signOut(auth).then(() => { location.reload(); });
        });
    }

    if(openTeacherBtn) {
        openTeacherBtn.addEventListener("click", () => { 
            loginCard.style.display = "none"; 
            teacherLogin.style.display = "block"; 
        });
    }

    if(closeTeacherPanel) {
        closeTeacherPanel.addEventListener("click", () => { 
            teacherPanel.style.display = "none"; 
            loginCard.style.display = "block"; 
        });
    }
    
    if(closeTeacherLogin) {
        closeTeacherLogin.addEventListener("click", () => { 
            teacherLogin.style.display = "none"; 
            loginCard.style.display = "block"; 
        });
    }
    
    function showStudentInterface() {
        loginCard.style.display = "none";
        teacherPanel.style.display = "none";
        mainContent.style.display = "block";
        logoutBtn.style.display = "inline-block";
        startTimer();
        startQuestion();
    }

    function showLoginInterface() {
        loginCard.style.display = "block";
        mainContent.style.display = "none";
        teacherPanel.style.display = "none";
        logoutBtn.style.display = "none";
    }
});
