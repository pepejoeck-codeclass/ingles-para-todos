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

// --- VARIABLES ---
let currentLevel = 1;
let questionsInSession = 0;
let correctInSession = 0;
const SESSION_LENGTH = 5;

// PREGUNTAS
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
    
    // SONIDOS
    const soundCorrect = new Audio("assets/sounds/correct.mp3");
    const soundError = new Audio("assets/sounds/wrong.mp3");
    const soundLevelUp = new Audio("assets/sounds/levelup.mp3"); 

    const TEACHER_USER = "Jose de Jesus Ramos Flores";
    const TEACHER_PASS = "161286";

    // DOM Elements
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
          teacherLogoutBtn = document.getElementById("teacherLogoutBtn"), // NUEVO
          refreshTeacherBtn = document.getElementById("refreshTeacher"),
          viewStatsBtn = document.getElementById("viewStatsBtn"),
          downloadPdfBtn = document.getElementById("downloadPdfBtn"),
          exportExcelBtn = document.getElementById("exportExcelBtn"), // NUEVO
          resetMonthlyBtn = document.getElementById("resetMonthlyBtn"),
          startBtn = document.getElementById("startGame"),
          checkBtn = document.getElementById("checkAnswer"),
          nav = document.getElementById("nav"),
          groupSelect = document.getElementById("groupSelect"),
          studentsTable = document.getElementById("studentsTable"),
          forgotPasswordLink = document.getElementById("forgotPasswordLink");

    // Inputs y Textos
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
          timeText = document.getElementById("timeText"),
          lessonProgressBar = document.getElementById("lessonProgressBar");

    // NUEVOS CAMPOS DASHBOARD
    const correctCountDisplay = document.getElementById("correctCount");
    const wrongCountDisplay = document.getElementById("wrongCount");
    const medalsCountDisplay = document.getElementById("medalsCount");

    let currentUserId = null; 
    let currentUserData = {};
    let timerInterval = null;
    let currentQuestion = null;

    // --- 1. AUTENTICACIÓN ---

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
        loginBtn.textContent = "🚀 Verificando...";

        try {
            await signInWithEmailAndPassword(auth, email, password);
        } catch (error) {
            if (error.code === 'auth/user-not-found' || error.code === 'auth/invalid-credential' || error.code === 'auth/wrong-password') {
                if (!name || !grade || !group) {
                    Swal.fire("Usuario Nuevo", "Para crear tu cuenta, llena Nombre, Grado y Grupo arriba.", "info");
                    loginBtn.disabled = false;
                    loginBtn.textContent = "🚀 DESPEGAR";
                    return;
                }
                try {
                    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
                    const user = userCredential.user;
                    
                    await setDoc(doc(db, "students", user.uid), {
                        uid: user.uid,
                        username: name, grade: grade, group: group, email: email,
                        password: password,
                        score: 0, level: 1, stars: 0, timeWorked: 0,
                        totalCorrect: 0, // NUEVO
                        totalWrong: 0,   // NUEVO
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
        loginBtn.textContent = "🚀 DESPEGAR";
    });

    forgotPasswordLink.addEventListener("click", async (e) => {
        e.preventDefault();
        const { value: email } = await Swal.fire({
            title: 'Recuperar Contraseña',
            input: 'email',
            inputLabel: 'Escribe tu correo registrado',
            showCancelButton: true
        });

        if (email) {
            const q = query(collection(db, "students"), where("email", "==", email));
            const querySnapshot = await getDocs(q);
            if (!querySnapshot.empty) {
                const userData = querySnapshot.docs[0].data();
                if(userData.password) Swal.fire(`Hola ${userData.username}`, `Tu contraseña es: <b>${userData.password}</b>`, 'info');
                else Swal.fire('Atención', 'Usuario antiguo. Pide al maestro restablecer.', 'warning');
            } else { Swal.fire('Error', 'Correo no encontrado.', 'error'); }
        }
    });

    // --- 2. JUEGO Y DATOS ---

    async function loadUserData(uid) {
        const docRef = doc(db, "students", uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
            currentUserData = docSnap.data();
            // Inicializar nuevos campos si no existen
            if(!currentUserData.medals) currentUserData.medals = { gold:0, silver:0, bronze:0 };
            if(!currentUserData.unlockedLevels) currentUserData.unlockedLevels = [1];
            if(!currentUserData.totalCorrect) currentUserData.totalCorrect = 0;
            if(!currentUserData.totalWrong) currentUserData.totalWrong = 0;
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
        scoreText.textContent = `${currentUserData.score || 0}`;
        levelText.textContent = `Nivel: ${currentLevel}`;
        
        // CONTADORES NUEVOS
        correctCountDisplay.textContent = currentUserData.totalCorrect || 0;
        wrongCountDisplay.textContent = currentUserData.totalWrong || 0;
        
        const m = currentUserData.medals || {gold:0, silver:0, bronze:0};
        const totalMedals = (m.gold || 0) + (m.silver || 0) + (m.bronze || 0);
        medalsCountDisplay.textContent = totalMedals;

        const t = currentUserData.timeWorked || 0;
        const min = Math.floor(t / 60), sec = t % 60;
        timeText.textContent = `⏱ ${min}m ${sec}s`;
        
        userDisplay.textContent = `⚡ Alumno: ${currentUserData.username}`;
    }

    window.selectLevel = (level) => {
        if (!currentUserData.unlockedLevels.includes(level)) {
            Swal.fire({ icon: 'error', title: '¡Alto ahí!', text: 'Debes ganar medalla de Oro o Plata en el nivel anterior.' });
            return;
        }
        currentLevel = level;
        questionsInSession = 0;
        correctInSession = 0;
        updateProgressBar();
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
            currentUserData.totalCorrect = (currentUserData.totalCorrect || 0) + 1; // Suma acumulada
            correctInSession++;
        } else {
            feedback.textContent = `❌ Era: ${currentQuestion.a}`;
            feedback.style.color = "red";
            soundError.play().catch(()=>{});
            
            currentUserData.totalWrong = (currentUserData.totalWrong || 0) + 1; // Suma acumulada
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
    }

    async function finishSession() {
        const percentage = (correctInSession / SESSION_LENGTH) * 100;
        let medal = null;
        let msg = "";

        if (percentage === 100) {
            medal = "gold";
            msg = "🥇 ¡PERFECTO! MEDALLA DE ORO";
            soundLevelUp.play().catch(()=>{});
            currentUserData.medals.gold++;
            unlockNextLevel();
        } else if (percentage >= 80) {
            medal = "silver";
            msg = "🥈 ¡MUY BIEN! MEDALLA DE PLATA";
            soundLevelUp.play().catch(()=>{});
            currentUserData.medals.silver++;
            unlockNextLevel();
        } else {
            medal = "bronze";
            msg = "🥉 Sigue practicando. Bronce.";
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
        updateDisplay(); // Actualiza contadores de medallas
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
            Swal.fire("NIVEL DESBLOQUEADO", `Has abierto la Lección ${next}`, "success");
        }
    }

    function updateLevelLocks() {
        if(!currentUserData.unlockedLevels) return;
        [2, 3].forEach(lvl => {
            const el = document.getElementById(`navL${lvl}`);
            if(currentUserData.unlockedLevels.includes(lvl)) {
                el.classList.remove("locked");
                const icon = el.querySelector('i');
                if(icon) { icon.classList.remove('fa-lock'); icon.classList.add('fa-unlock'); }
            }
        });
    }

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


    // --- 3. PANEL MAESTRO (SUPER EDICIÓN) ---

    teacherLoginBtn.addEventListener("click", () => {
        if (teacherUser.value === TEACHER_USER && teacherPass.value === TEACHER_PASS) {
            teacherLogin.style.display = "none";
            teacherPanel.style.display = "block";
            loadTeacherPanel();
        } else { Swal.fire("Error", "Credenciales Incorrectas", "error"); }
    });

    // BOTÓN CERRAR SESIÓN MAESTRO (RESTAURADO)
    teacherLogoutBtn.addEventListener("click", () => {
        teacherPanel.style.display = "none";
        teacherUser.value = "";
        teacherPass.value = "";
        loginCard.style.display = "block";
        Swal.fire("Sesión Cerrada", "Modo maestro finalizado", "info");
    });

    // Funciones globales de botones tabla
    window.changeGroup = async (uid) => {
        const { value: newGroup } = await Swal.fire({
            title: 'Cambiar Grupo',
            input: 'text',
            showCancelButton: true
        });
        if (newGroup) {
            await updateDoc(doc(db, "students", uid), { group: newGroup.toUpperCase() });
            loadTeacherPanel();
        }
    };

    window.resetStudent = async (uid) => {
        if (confirm("¿Reiniciar alumno a CERO?")) {
            await updateDoc(doc(db, "students", uid), {
                score: 0, stars: 0, level: 1, timeWorked: 0,
                totalCorrect: 0, totalWrong: 0,
                medals: {gold:0, silver:0, bronze:0},
                unlockedLevels: [1], history: []
            });
            loadTeacherPanel();
        }
    };

    window.deleteStudent = async (uid) => {
        if (confirm("¿ELIMINAR ALUMNO DEFINITIVAMENTE?")) {
            await deleteDoc(doc(db, "students", uid));
            loadTeacherPanel();
        }
    };

    // VER DETALLES INDIVIDUALES (REPORTE)
    window.viewStudentStats = (uid) => {
        const student = window.allStudentsData.find(s => s.uid === uid);
        if(!student) return;

        document.getElementById("statsModal").style.display = "block";
        document.getElementById("individualStatsArea").style.display = "block";
        document.getElementById("individualName").textContent = `Detalle: ${student.username}`;

        // Gráfica Individual
        const ctx = document.getElementById('individualChart').getContext('2d');
        if(window.indChart) window.indChart.destroy();
        
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
        renderCharts(); // Renderiza también la global
    };

    async function loadTeacherPanel() {
        const selectedGroupBefore = groupSelect.value;
        studentsTable.innerHTML = "<tr><td colspan='6'>Cargando...</td></tr>";
        
        const querySnapshot = await getDocs(collection(db, "students"));
        window.allStudentsData = [];
        
        querySnapshot.forEach((doc) => { 
            let data = doc.data();
            data.uid = doc.id;
            window.allStudentsData.push(data); 
        });

        const groups = [...new Set(window.allStudentsData.map(s => s.group))].sort();
        groupSelect.innerHTML = '<option value="">Todos</option>';
        groups.forEach(g => {
            const opt = document.createElement("option");
            opt.value = g; opt.textContent = `Gpo ${g}`;
            groupSelect.appendChild(opt);
        });
        groupSelect.value = selectedGroupBefore;

        const filter = groupSelect.value;
        let filtered = filter ? window.allStudentsData.filter(s => s.group === filter) : window.allStudentsData;
        filtered.sort((a, b) => b.score - a.score);

        studentsTable.innerHTML = "";
        
        filtered.forEach(s => {
            // Cálculo de tiempo para la tabla
            const min = Math.floor((s.timeWorked || 0) / 60);
            const sec = (s.timeWorked || 0) % 60;
            const timeStr = `${min}m ${sec}s`;
            const correct = s.totalCorrect || 0;

            const row = document.createElement("tr");
            row.innerHTML = `
                <td>${s.username}</td>
                <td>${s.group}</td>
                <td>${Math.max(...(s.unlockedLevels || [1]))}</td>
                <td style="font-weight:bold; color:blue;">${timeStr}</td>
                <td style="color:green;">${correct}</td>
                <td>
                   <button onclick="viewStudentStats('${s.uid}')" class="action-btn btn-info" title="Ver Gráfica"><i class="fas fa-chart-pie"></i></button>
                   <button onclick="changeGroup('${s.uid}')" class="action-btn btn-group" title="Cambiar Grupo"><i class="fas fa-folder"></i></button>
                   <button onclick="resetStudent('${s.uid}')" class="action-btn btn-reset" title="Reiniciar"><i class="fas fa-sync"></i></button>
                   <button onclick="deleteStudent('${s.uid}')" class="action-btn btn-delete" title="Eliminar"><i class="fas fa-trash"></i></button>
                </td>`;
            studentsTable.appendChild(row);
        });
    }

    // --- GRÁFICAS, PDF Y EXCEL ---

    // 1. Exportar a Excel
    exportExcelBtn.addEventListener("click", () => {
        if(!window.allStudentsData || window.allStudentsData.length === 0) {
            Swal.fire("Vacío", "No hay datos para exportar", "warning");
            return;
        }
        
        // Crear datos limpios para Excel
        const dataForExcel = window.allStudentsData.map(s => ({
            Nombre: s.username,
            Grupo: s.group,
            Correo: s.email,
            Contraseña: s.password || "Oculta", // Si quieres mostrarla
            Puntos: s.score,
            Nivel_Juego: Math.max(...(s.unlockedLevels || [1])),
            Tiempo_Minutos: ((s.timeWorked||0)/60).toFixed(2),
            Total_Correctas: s.totalCorrect || 0,
            Total_Incorrectas: s.totalWrong || 0,
            Medallas_Oro: (s.medals?.gold || 0),
            Medallas_Plata: (s.medals?.silver || 0),
            Medallas_Bronce: (s.medals?.bronze || 0)
        }));

        const ws = XLSX.utils.json_to_sheet(dataForExcel);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Reporte Alumnos");
        XLSX.writeFile(wb, "Reporte_Escuela_Ingles.xlsx");
    });

    viewStatsBtn.addEventListener("click", () => {
        document.getElementById("statsModal").style.display = "block";
        document.getElementById("individualStatsArea").style.display = "none"; // Ocultar individual al abrir general
        setTimeout(renderCharts, 200);
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
                    label: 'Total Medallas Escuela',
                    data: [totalGold, totalSilver, totalBronze],
                    backgroundColor: ['#FFD700', '#C0C0C0', '#CD7F32']
                }]
            },
            options: { scales: { y: { beginAtZero: true } } }
        });
    }

    downloadPdfBtn.addEventListener("click", () => {
        const element = document.getElementById('reportContent');
        const opt = { margin: 10, filename: 'Reporte_Grafico.pdf', image: { type: 'jpeg', quality: 0.98 }, html2canvas: { scale: 2 }, jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' } };
        html2pdf().set(opt).from(element).save();
    });

    refreshTeacherBtn.addEventListener("click", loadTeacherPanel);
    groupSelect.addEventListener("change", loadTeacherPanel);

    resetMonthlyBtn.addEventListener("click", async () => {
        const confirmCode = prompt("Escribe 'BORRAR' para reiniciar a TODOS los alumnos a cero:");
        if (confirmCode === "BORRAR") {
            const querySnapshot = await getDocs(collection(db, "students"));
            const batch = writeBatch(db);
            querySnapshot.forEach((documento) => {
                const ref = doc(db, "students", documento.id);
                batch.update(ref, { 
                    score: 0, stars: 0, level: 1, timeWorked: 0, 
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

    // --- UTILS UI ---
    logoutBtn.addEventListener("click", () => {
        saveProgress(); stopTimer();
        signOut(auth).then(() => { location.reload(); });
    });
    openTeacherBtn.addEventListener("click", () => { loginCard.style.display = "none"; teacherLogin.style.display = "block"; });
    closeTeacherPanel.addEventListener("click", () => { teacherPanel.style.display = "none"; loginCard.style.display = "block"; });
    closeTeacherLogin.addEventListener("click", () => { teacherLogin.style.display = "none"; loginCard.style.display = "block"; });
    
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
