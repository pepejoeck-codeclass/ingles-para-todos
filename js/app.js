import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged } 
    from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { getFirestore, doc, setDoc, getDoc, getDocs, collection, updateDoc, deleteDoc, writeBatch, query, where } 
    from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// === 1. CONFIGURACIÓN FIREBASE ===
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

// === 2. VARIABLES Y DATOS ===
let currentLevel = 1;
let questionsInSession = 0;
let correctInSession = 0;
const SESSION_LENGTH = 5; 
let currentUserId = null; 
let currentUserData = {};
let timerInterval = null;
let currentQuestion = null;

const questionsDB = {
    1: [ { q: "How do you say 'Hola' in English?", a: "hello" }, { q: "How do you say 'Adiós' in English?", a: "goodbye" }, { q: "How do you say 'Por favor' in English?", a: "please" }, { q: "How do you say 'Gracias' in English?", a: "thank you" }, { q: "How do you say 'Buenos días' in English?", a: "good morning" } ],
    2: [ { q: "How do you say 'Gato' in English?", a: "cat" }, { q: "How do you say 'Perro' in English?", a: "dog" }, { q: "How do you say 'Pájaro' in English?", a: "bird" }, { q: "How do you say 'León' in English?", a: "lion" }, { q: "How do you say 'Pez' in English?", a: "fish" } ],
    3: [ { q: "How do you say 'Rojo' in English?", a: "red" }, { q: "How do you say 'Azul' in English?", a: "blue" }, { q: "How do you say 'Verde' in English?", a: "green" }, { q: "How do you say 'Amarillo' in English?", a: "yellow" }, { q: "How do you say 'Negro' in English?", a: "black" } ]
};

// === 3. INICIO DE LA APLICACIÓN ===
document.addEventListener("DOMContentLoaded", () => {
    console.log("Sistema Iniciado correctamente");
    
    // -- ELEMENTOS DOM --
    const loginCard = document.getElementById("loginCard");
    const mainContent = document.getElementById("mainContent");
    const teacherPanel = document.getElementById("teacherPanel");
    const teacherLogin = document.getElementById("teacherLogin");
    
    // Botones
    const openTeacherBtn = document.getElementById("openTeacherBtn");
    const loginBtn = document.getElementById("loginBtn");
    const teacherLoginBtn = document.getElementById("teacherLoginBtn");
    const logoutBtn = document.getElementById("logoutBtn");
    const teacherLogoutBtn = document.getElementById("teacherLogoutBtn");
    const closeTeacherLogin = document.getElementById("closeTeacherLogin");
    const checkBtn = document.getElementById("checkAnswer");

    // ==========================================
    // A. LÓGICA DE LOGIN MAESTRO (LOCAL)
    // ==========================================
    if(openTeacherBtn) {
        openTeacherBtn.addEventListener("click", () => {
            loginCard.style.display = "none";
            teacherLogin.style.display = "block";
        });
    }

    if(teacherLoginBtn) {
        teacherLoginBtn.addEventListener("click", () => {
            // Capturar valores DIRECTAMENTE al hacer click
            const inputUser = document.getElementById("inputMaestroUsuario").value.trim();
            const inputPass = document.getElementById("inputMaestroPass").value.trim();
            
            console.log("Intentando entrar como maestro:", inputUser); // Debug

            if (inputUser === "Jose de Jesus Ramos Flores" && inputPass === "161286") {
                teacherLogin.style.display = "none";
                teacherPanel.style.display = "block";
                loadTeacherPanel(); // Cargar tabla
                Swal.fire("Acceso Concedido", "Bienvenido Profesor", "success");
            } else {
                Swal.fire("Error", "Credenciales incorrectas", "error");
            }
        });
    }

    if(closeTeacherLogin) {
        closeTeacherLogin.addEventListener("click", () => {
            teacherLogin.style.display = "none";
            loginCard.style.display = "block";
        });
    }

    if(teacherLogoutBtn) {
        teacherLogoutBtn.addEventListener("click", () => {
            teacherPanel.style.display = "none";
            document.getElementById("inputMaestroUsuario").value = ""; // Limpiar campos
            document.getElementById("inputMaestroPass").value = "";
            loginCard.style.display = "block";
        });
    }

    // ==========================================
    // B. LÓGICA DE LOGIN ALUMNO (FIREBASE)
    // ==========================================
    
    // Escuchador de estado (Login persistente)
    onAuthStateChanged(auth, async (user) => {
        if (user) {
            console.log("Usuario logueado:", user.email);
            currentUserId = user.uid;
            // Solo cambiar pantalla si NO estamos en modo maestro
            if(teacherPanel.style.display === "none") {
                await loadUserData(user.uid);
                loginCard.style.display = "none";
                teacherLogin.style.display = "none";
                mainContent.style.display = "block";
                startTimer();
                startQuestion();
            }
        } else {
            console.log("Nadie logueado");
            currentUserId = null;
            // Solo mostrar login si no estamos en panel maestro
            if(teacherPanel.style.display === "none" && teacherLogin.style.display === "none") {
                loginCard.style.display = "block";
                mainContent.style.display = "none";
            }
        }
    });

    if(loginBtn) {
        loginBtn.addEventListener("click", async () => {
            const email = document.getElementById("emailInput").value.trim();
            const password = document.getElementById("passwordInput").value.trim();
            
            // Datos opcionales para registro
            const name = document.getElementById("usernameInput").value.trim();
            const grade = document.getElementById("gradeInput").value.trim();
            const group = document.getElementById("groupInput").value.trim().toUpperCase();

            if (!email || !password || password.length < 6) {
                Swal.fire("Atención", "Ingresa correo y contraseña (min 6 caracteres)", "warning");
                return;
            }

            loginBtn.disabled = true;
            loginBtn.textContent = "⌛ Cargando...";

            try {
                // 1. Intentar iniciar sesión
                await signInWithEmailAndPassword(auth, email, password);
                // Si funciona, el onAuthStateChanged se encarga del resto
            } catch (error) {
                console.log("Error login:", error.code);
                
                // 2. Si no existe, intentar registrar
                if (error.code === 'auth/user-not-found' || error.code === 'auth/invalid-credential') {
                    if (!name || !grade || !group) {
                        Swal.fire("Usuario Nuevo", "El correo no existe. Para registrarte llena Nombre, Grado y Grupo.", "info");
                        loginBtn.disabled = false;
                        loginBtn.innerHTML = '<i class="fas fa-rocket"></i> DESPEGAR';
                        return;
                    }

                    try {
                        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
                        const user = userCredential.user;
                        
                        await setDoc(doc(db, "students", user.uid), {
                            uid: user.uid, username: name, grade: grade, group: group, email: email, password: password,
                            score: 0, level: 1, timeWorked: 0, totalCorrect: 0, totalWrong: 0,
                            medals: { gold: 0, silver: 0, bronze: 0 }, history: [], unlockedLevels: [1],
                            lastLogin: new Date().toISOString()
                        });
                        Swal.fire("Registrado", "Cuenta creada. ¡A jugar!", "success");
                    } catch (regError) {
                        Swal.fire("Error Registro", regError.message, "error");
                    }
                } else if (error.code === 'auth/wrong-password') {
                    Swal.fire("Error", "Contraseña incorrecta", "error");
                } else {
                    Swal.fire("Error", error.message, "error");
                }
            }
            loginBtn.disabled = false;
            loginBtn.innerHTML = '<i class="fas fa-rocket"></i> DESPEGAR';
        });
    }

    if(logoutBtn) {
        logoutBtn.addEventListener("click", () => {
            saveProgress();
            stopTimer();
            signOut(auth).then(() => location.reload());
        });
    }

    // ==========================================
    // C. FUNCIONES DEL JUEGO
    // ==========================================
    async function loadUserData(uid) {
        const snap = await getDoc(doc(db, "students", uid));
        if (snap.exists()) {
            currentUserData = snap.data();
            // Asegurar campos
            if(!currentUserData.unlockedLevels) currentUserData.unlockedLevels = [1];
            if(!currentUserData.medals) currentUserData.medals = {gold:0, silver:0, bronze:0};
            updateDisplay();
            updateLevelLocks();
        }
    }

    async function saveProgress() {
        if(!currentUserId) return;
        await setDoc(doc(db, "students", currentUserId), currentUserData, {merge: true});
    }

    function updateDisplay() {
        const d = currentUserData;
        if(!d) return;
        document.getElementById("scoreText").textContent = `Puntos: ${d.score || 0}`;
        document.getElementById("userDisplay").textContent = `⚡ Alumno: ${d.username}`;
        document.getElementById("levelText").textContent = `Nivel: ${currentLevel}`;
        
        const min = Math.floor((d.timeWorked||0) / 60);
        const sec = (d.timeWorked||0) % 60;
        document.getElementById("timeText").textContent = `⏱ ${min}m ${sec}s`;
    }

    function startQuestion() {
        const pool = questionsDB[currentLevel] || questionsDB[1];
        currentQuestion = pool[Math.floor(Math.random() * pool.length)];
        const qText = document.getElementById("questionText");
        const fb = document.getElementById("feedback");
        const ans = document.getElementById("answerInput");
        
        qText.textContent = currentQuestion.q;
        fb.textContent = "";
        ans.value = "";
        ans.focus();
    }

    if(checkBtn) {
        checkBtn.addEventListener("click", async () => {
            const ansInput = document.getElementById("answerInput");
            const userAns = ansInput.value.trim().toLowerCase();
            const fb = document.getElementById("feedback");
            
            if(!userAns) return;
            questionsInSession++;

            if(userAns === currentQuestion.a) {
                fb.textContent = "🔥 ¡Correcto!"; fb.style.color = "green";
                new Audio("assets/sounds/correct.mp3").play().catch(()=>{});
                currentUserData.score = (currentUserData.score || 0) + 10;
                currentUserData.totalCorrect = (currentUserData.totalCorrect || 0) + 1;
                correctInSession++;
            } else {
                fb.textContent = `❌ Era: ${currentQuestion.a}`; fb.style.color = "red";
                new Audio("assets/sounds/wrong.mp3").play().catch(()=>{});
                currentUserData.totalWrong = (currentUserData.totalWrong || 0) + 1;
            }
            
            // Barra progreso
            document.getElementById("lessonProgressBar").style.width = ((questionsInSession/SESSION_LENGTH)*100) + "%";
            updateDisplay();
            await saveProgress();

            if(questionsInSession >= SESSION_LENGTH) setTimeout(finishSession, 1500);
            else setTimeout(startQuestion, 1500);
        });
        
        // Enter key
        document.getElementById("answerInput").addEventListener("keypress", (e) => {
            if(e.key === "Enter") checkBtn.click();
        });
    }

    async function finishSession() {
        const pct = (correctInSession / SESSION_LENGTH) * 100;
        let msg = "", icon = "info";
        
        if(pct >= 80) {
            msg = "¡Nivel Completado!"; icon = "success";
            currentUserData.medals.gold++; // Simplificado
            new Audio("assets/sounds/levelup.mp3").play().catch(()=>{});
            
            const next = currentLevel + 1;
            if(next <= 3 && !currentUserData.unlockedLevels.includes(next)) {
                currentUserData.unlockedLevels.push(next);
                Swal.fire("¡Desbloqueado!", "Siguiente nivel abierto", "success");
            }
        } else {
            msg = "Sigue practicando";
        }
        
        await saveProgress();
        updateLevelLocks();
        
        Swal.fire(msg, `Aciertos: ${correctInSession}/${SESSION_LENGTH}`, icon).then(() => {
            questionsInSession = 0; correctInSession = 0;
            document.getElementById("lessonProgressBar").style.width = "0%";
            startQuestion();
        });
    }

    function updateLevelLocks() {
        if(!currentUserData.unlockedLevels) return;
        [1,2,3].forEach(lvl => {
            const el = document.querySelector(`.nav-item[onclick="selectLevel(${lvl})"]`);
            // Manejo simple de UI para locks, asumiendo estructura fija
            const lockId = `navL${lvl}`; 
            const lockEl = document.getElementById(lockId);
            if(lockEl) {
                if(currentUserData.unlockedLevels.includes(lvl)) {
                    lockEl.classList.remove("locked");
                    lockEl.innerHTML = `<i class="fas fa-unlock"></i> Nivel ${lvl}`;
                } else {
                    lockEl.classList.add("locked");
                }
            }
        });
    }
    
    // Función global para onclick en HTML
    window.selectLevel = (lvl) => {
        if(currentUserData.unlockedLevels.includes(lvl)) {
            currentLevel = lvl;
            questionsInSession = 0; correctInSession = 0;
            document.getElementById("lessonProgressBar").style.width = "0%";
            startQuestion();
        } else {
            Swal.fire("Bloqueado", "Completa el nivel anterior", "error");
        }
    };

    function startTimer() {
        if(timerInterval) clearInterval(timerInterval);
        timerInterval = setInterval(() => {
            currentUserData.timeWorked = (currentUserData.timeWorked || 0) + 1;
            if(currentUserData.timeWorked % 5 === 0) updateDisplay();
        }, 1000);
    }
    function stopTimer() { clearInterval(timerInterval); }

    // ==========================================
    // D. FUNCIONES PANEL MAESTRO
    // ==========================================
    async function loadTeacherPanel() {
        const table = document.getElementById("studentsTable");
        table.innerHTML = "<tr><td colspan='6'>Cargando...</td></tr>";
        
        const snap = await getDocs(collection(db, "students"));
        window.allStudents = [];
        snap.forEach(d => { let x = d.data(); x.uid = d.id; window.allStudents.push(x); });
        
        renderTable();
        
        // Llenar select grupos
        const sel = document.getElementById("groupSelect");
        const gpos = [...new Set(window.allStudents.map(s=>s.group))].sort();
        sel.innerHTML = '<option value="">Todos</option>';
        gpos.forEach(g => { if(g) sel.innerHTML += `<option value="${g}">${g}</option>`; });
        sel.onchange = renderTable;
    }

    function renderTable() {
        const filter = document.getElementById("groupSelect").value;
        const list = filter ? window.allStudents.filter(s=>s.group===filter) : window.allStudents;
        const table = document.getElementById("studentsTable");
        
        table.innerHTML = "";
        list.sort((a,b) => (b.score||0) - (a.score||0));
        
        list.forEach(s => {
            const row = document.createElement("tr");
            row.innerHTML = `
                <td>${s.username}</td><td>${s.group}</td><td>${Math.max(...(s.unlockedLevels||[1]))}</td>
                <td>${s.score}</td><td>${s.totalCorrect||0}</td>
                <td>
                    <button onclick="deleteSt('${s.uid}')" class="btn-delete action-btn"><i class="fas fa-trash"></i></button>
                    <button onclick="resetSt('${s.uid}')" class="btn-reset action-btn"><i class="fas fa-sync"></i></button>
                </td>
            `;
            table.appendChild(row);
        });
    }

    // Exportar funciones globales para los botones onclick de la tabla
    window.deleteSt = async (uid) => {
        if(confirm("¿Eliminar alumno?")) { await deleteDoc(doc(db,"students",uid)); loadTeacherPanel(); }
    };
    window.resetSt = async (uid) => {
        if(confirm("¿Reiniciar alumno?")) { 
            await updateDoc(doc(db,"students",uid), {score:0, unlockedLevels:[1], medals:{gold:0,silver:0,bronze:0}, totalCorrect:0, totalWrong:0}); 
            loadTeacherPanel(); 
        }
    };
});
