import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged } 
    from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { getFirestore, doc, setDoc, getDoc, getDocs, collection, updateDoc, deleteDoc, writeBatch } 
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

document.addEventListener("DOMContentLoaded", () => {
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
          exportBtn = document.getElementById("exportBtn"),
          resetMonthlyBtn = document.getElementById("resetMonthlyBtn"),
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
          timeText = document.getElementById("timeText");

    let currentUserId = null; 
    let currentUserData = {};
    let timerInterval = null;
    let currentQuestion = null;

    onAuthStateChanged(auth, async (user) => {
        if (user) {
            currentUserId = user.uid;
            await loadUserData(user.uid);
            showStudentInterface();
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
            alert("❌ Ingresa un correo y una contraseña de al menos 6 caracteres.");
            return;
        }

        loginBtn.disabled = true;
        loginBtn.textContent = "Procesando...";

        try {
            await signInWithEmailAndPassword(auth, email, password);
        } catch (error) {
            if (error.code === 'auth/user-not-found' || error.code === 'auth/invalid-credential' || error.code === 'auth/wrong-password') {
                if (!name || !grade || !group) {
                    alert("⚠️ No encontramos ese usuario. Para crear cuenta nueva, completa Nombre, Grado y Grupo.");
                    loginBtn.disabled = false;
                    loginBtn.textContent = "Entrar / Registrarse";
                    return;
                }
                try {
                    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
                    const user = userCredential.user;
                    await setDoc(doc(db, "students", user.uid), {
                        uid: user.uid,
                        username: name, grade: grade, group: group, email: email,
                        score: 0, level: 1, stars: 0, timeWorked: 0,
                        lastLogin: new Date().toISOString()
                    });
                    alert("✅ ¡Cuenta creada exitosamente!");
                } catch (regError) { alert("Error al registrar: " + regError.message); }
            } else { alert("Error de acceso: " + error.message); }
        }
        loginBtn.disabled = false;
        loginBtn.textContent = "Entrar / Registrarse";
    });

    async function loadUserData(uid) {
        try {
            const docRef = doc(db, "students", uid);
            const docSnap = await getDoc(docRef);
            if (docSnap.exists()) {
                currentUserData = docSnap.data();
                updateDisplay();
            }
        } catch (e) { console.error("Error cargando datos", e); }
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
        scoreText.textContent = `${currentUserData.score || 0} puntos`;
        levelText.textContent = `Nivel ${currentUserData.level || 1}`;
        starsText.textContent = `⭐ Estrellas: ${currentUserData.stars || 0}`;
        const t = currentUserData.timeWorked || 0;
        const min = Math.floor(t / 60), sec = t % 60;
        timeText.textContent = `⏱ Tiempo: ${min}m ${sec}s`;
        userDisplay.textContent = `👤 Hola, ${currentUserData.username || 'Alumno'}`;
    }

    function startTimer() {
        if (timerInterval) clearInterval(timerInterval);
        timerInterval = setInterval(() => {
            if(!currentUserData.timeWorked) currentUserData.timeWorked = 0;
            currentUserData.timeWorked++;
            updateDisplay();
            if (currentUserData.timeWorked % 10 === 0) saveProgress();
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

    checkBtn.addEventListener("click", async () => {
        if (!currentQuestion) return;
        const userAns = answerInput.value.trim().toLowerCase();
        if (userAns === currentQuestion.a) {
            feedback.textContent = "🔥 ¡Excelente!";
            feedback.style.color = "green";
            soundCorrect.play().catch(()=>{});
            currentUserData.score = (currentUserData.score || 0) + 10;
            currentUserData.stars = (currentUserData.stars || 0) + 1;
            if (currentUserData.score % 50 === 0) {
                currentUserData.level = (currentUserData.level || 1) + 1;
                soundLevel.play().catch(()=>{});
            }
            currentQuestion = null;
        } else {
            feedback.textContent = "❌ Intenta de nuevo";
            feedback.style.color = "red";
            soundError.play().catch(()=>{});
        }
        updateDisplay();
        await saveProgress(); 
    });

    // --- ACCIONES MAESTRO ---

    // 1. Cambiar Grupo
    window.changeGroup = async (uid) => {
        const newGroup = prompt("Escribe el nuevo grupo:");
        if (newGroup) {
            try {
                await updateDoc(doc(db, "students", uid), { group: newGroup.toUpperCase() });
                alert("Grupo actualizado");
                loadTeacherPanel();
            } catch (e) { alert("Error al cambiar grupo"); }
        }
    };

    // 2. Borrar Alumno
    window.deleteStudent = async (uid, name) => {
        if (confirm(`¿Eliminar a ${name}? Se perderá todo su progreso.`)) {
            try {
                await deleteDoc(doc(db, "students", uid));
                alert("Alumno eliminado");
                loadTeacherPanel();
            } catch (e) { alert("Error al eliminar"); }
        }
    };

    // 3. Reiniciar Alumno Individual (NUEVO)
    window.resetStudent = async (uid, name) => {
        if (confirm(`¿Reiniciar puntos de ${name} a cero?`)) {
            try {
                await updateDoc(doc(db, "students", uid), {
                    score: 0, stars: 0, level: 1, timeWorked: 0
                });
                alert(`Progreso de ${name} reiniciado.`);
                loadTeacherPanel();
            } catch (e) { alert("Error al reiniciar alumno"); }
        }
    };

    // 4. Reiniciar TODOS
    resetMonthlyBtn.addEventListener("click", async () => {
        if (confirm("⚠️ ¿REINICIAR A TODOS? Esto pondrá los puntos de TODOS los alumnos en 0.")) {
            resetMonthlyBtn.disabled = true;
            resetMonthlyBtn.textContent = "Procesando...";
            try {
                const querySnapshot = await getDocs(collection(db, "students"));
                const batch = writeBatch(db);
                querySnapshot.forEach((documento) => {
                    const studentRef = doc(db, "students", documento.id);
                    batch.update(studentRef, { score: 0, stars: 0, level: 1, timeWorked: 0 });
                });
                await batch.commit();
                alert("✅ ¡Todo el progreso ha sido reiniciado!");
                loadTeacherPanel();
            } catch (e) { alert("Error al reiniciar."); }
            resetMonthlyBtn.disabled = false;
            resetMonthlyBtn.textContent = "🗓️ Reiniciar TODOS";
        }
    });

    async function loadTeacherPanel() {
        studentsTable.innerHTML = "<tr><td colspan='8'>Cargando...</td></tr>";
        const querySnapshot = await getDocs(collection(db, "students"));
        let allStudents = [];
        querySnapshot.forEach((doc) => { 
            let data = doc.data();
            data.uid = doc.id;
            allStudents.push(data); 
        });

        const groups = [...new Set(allStudents.map(s => s.group))];
        groupSelect.innerHTML = '<option value="">Todos los grupos</option>';
        groups.forEach(g => {
            const opt = document.createElement("option");
            opt.value = g; opt.textContent = `Grupo ${g}`;
            groupSelect.appendChild(opt);
        });

        const filter = groupSelect.value;
        let filtered = filter ? allStudents.filter(s => s.group === filter) : allStudents;
        filtered.sort((a, b) => b.score - a.score);

        studentsTable.innerHTML = "";
        filtered.forEach(s => {
            const row = document.createElement("tr");
            const t = s.timeWorked || 0;
            const min = Math.floor(t / 60), sec = t % 60;
            row.innerHTML = `
                <td>${s.username}</td><td>${s.grade}</td><td>${s.group}</td><td>${s.score}</td><td>${s.level}</td><td>${s.stars}</td><td>${min}m ${sec}s</td>
                <td>
                    <button onclick="changeGroup('${s.uid}')" style="background:#ffc107; border:none; padding:3px 5px; cursor:pointer;" title="Cambiar Grupo">Gr.</button>
                    <button onclick="resetStudent('${s.uid}', '${s.username}')" style="background:#007bff; color:white; border:none; padding:3px 5px; cursor:pointer;" title="Reiniciar puntos">🔄</button>
                    <button onclick="deleteStudent('${s.uid}', '${s.username}')" style="background:#dc3545; color:white; border:none; padding:3px 5px; cursor:pointer;" title="Borrar alumno">X</button>
                </td>`;
            studentsTable.appendChild(row);
        });
    }

    refreshTeacherBtn.addEventListener("click", loadTeacherPanel);
    groupSelect.addEventListener("change", loadTeacherPanel);

    teacherLoginBtn.addEventListener("click", () => {
        if (teacherUser.value === TEACHER_USER && teacherPass.value === TEACHER_PASS) {
            teacherLogin.style.display = "none";
            teacherPanel.style.display = "block";
            loadTeacherPanel();
        } else { alert("Maestro no reconocido"); }
    });

    logoutBtn.addEventListener("click", () => {
        saveProgress(); stopTimer();
        signOut(auth).then(() => { location.reload(); });
    });

    openTeacherBtn.addEventListener("click", () => {
        loginCard.style.display = "none";
        teacherLogin.style.display = "block";
    });

    closeTeacherPanel.addEventListener("click", () => {
        teacherPanel.style.display = "none";
        loginCard.style.display = "block";
    });
    
    closeTeacherLogin.addEventListener("click", () => {
        teacherLogin.style.display = "none";
        loginCard.style.display = "block";
    });

    themeToggle.addEventListener("click", () => {
        document.body.classList.toggle("dark");
        localStorage.setItem("theme", document.body.classList.contains("dark") ? "dark" : "light");
    });
    if (localStorage.getItem("theme") === "dark") document.body.classList.add("dark");

    hamburger.addEventListener("click", (e) => {
        e.stopPropagation();
        nav.classList.toggle("active");
    });

    function showStudentInterface() {
        loginCard.style.display = "none";
        mainContent.style.display = "block";
        logoutBtn.style.display = "inline-block";
        startTimer();
    }

    function showLoginInterface() {
        loginCard.style.display = "block";
        mainContent.style.display = "none";
        logoutBtn.style.display = "none";
    }
});
