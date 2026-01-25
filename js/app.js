// --- CONFIGURACIÓN DE FIREBASE ---
// 1. Reemplaza este objeto con el que copiaste de tu consola de Firebase
const firebaseConfig = {
    apiKey: "AIzaSyD-ejemplo-clave-api",
    authDomain: "tu-proyecto.firebaseapp.com",
    databaseURL: "https://tu-proyecto-default-rtdb.firebaseio.com",
    projectId: "tu-proyecto",
    storageBucket: "tu-proyecto.appspot.com",
    messagingSenderId: "123456789",
    appId: "1:123456789:web:abcdef"
};

// Inicializar Firebase
if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}
const db = firebase.database();

// --- VARIABLES GLOBALES ---
let currentUser = null;
let currentScore = 0;

// --- FUNCIONES DE NAVEGACIÓN ---
function showScreen(screenId) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    document.getElementById(screenId).classList.add('active');
}

function showTeacherLogin() {
    document.getElementById('teacher-login-form').classList.remove('hidden');
}

// --- LOGIN MAESTRO ---
function loginTeacher() {
    const user = document.getElementById('teacher-user').value.trim();
    const pass = document.getElementById('teacher-pass').value.trim();

    // Verificación fija solicitada
    if (user === "Jose de Jesus Ramos Flores" && pass === "161286") {
        currentUser = { name: user, role: 'teacher' };
        alert("¡Bienvenido Profesor Jose de Jesus!");
        showScreen('teacher-dashboard');
        initTeacherView(); // Iniciar monitoreo en tiempo real
    } else {
        alert("Usuario o contraseña incorrectos");
    }
}

// --- LOGIN ALUMNO ---
function loginStudent() {
    const name = document.getElementById('student-name').value.trim();
    const grade = document.getElementById('student-grade').value;
    const group = document.getElementById('student-group').value;

    if (!name || !grade || !group) {
        alert("Por favor llena todos los datos");
        return;
    }

    // Crear ID único simple (nombre + grado + grupo sin espacios)
    const studentId = (name + grade + group).replace(/\s+/g, '').toLowerCase();

    currentUser = {
        id: studentId,
        name: name,
        grade: grade,
        group: group,
        role: 'student'
    };

    // 1. Guardar/Actualizar usuario en base de datos
    // 2. Marcar como conectado (Online)
    const userRef = db.ref('students/' + studentId);
    
    userRef.update({
        name: name,
        grade: grade,
        group: group,
        lastLogin: new Date().toISOString(),
        online: true
    }).then(() => {
        // Escuchar cambios en su puntaje para mostrarlo
        userRef.child('score').once('value', (snapshot) => {
            currentScore = snapshot.val() || 0;
            document.getElementById('display-score').innerText = currentScore;
            document.getElementById('welcome-msg').innerText = `Hola, ${name}`;
            
            // Configurar desconexión automática (para quitar "En línea" si cierra la pestaña)
            userRef.child('online').onDisconnect().set(false);
            
            showScreen('student-dashboard');
        });
    });
}

function logout() {
    if (currentUser && currentUser.role === 'student') {
        // Marcar offline al salir manualmente
        db.ref('students/' + currentUser.id).update({ online: false });
    }
    currentUser = null;
    location.reload(); // Recargar página para limpiar
}

// --- LÓGICA DE LECCIONES (EJEMPLO) ---
// Puedes agregar más preguntas aquí
const lessons = {
    1: [
        { q: "¿Cómo se dice 'Rojo' en inglés?", options: ["Blue", "Red", "Green"], correct: 1 },
        { q: "¿Cómo se dice 'Azul' en inglés?", options: ["Blue", "Yellow", "Pink"], correct: 0 }
    ],
    2: [
        { q: "¿Qué número es 'One'?", options: ["1", "5", "10"], correct: 0 },
        { q: "¿Qué número es 'Ten'?", options: ["2", "10", "0"], correct: 1 }
    ]
};

function startLesson(level) {
    showScreen('lesson-screen');
    const questions = lessons[level];
    const container = document.getElementById('question-container');
    container.innerHTML = ""; // Limpiar

    let scoreInLesson = 0;

    questions.forEach((item, index) => {
        const div = document.createElement('div');
        div.innerHTML = `<p><strong>${index + 1}. ${item.q}</strong></p>`;
        
        item.options.forEach((opt, optIndex) => {
            const btn = document.createElement('button');
            btn.innerText = opt;
            btn.onclick = () => {
                // Lógica simple de respuesta
                if (optIndex === item.correct) {
                    alert("¡Correcto! +10 puntos");
                    scoreInLesson += 10;
                } else {
                    alert("Incorrecto");
                }
                // Al responder la última...
                if (index === questions.length - 1) {
                    finishLesson(scoreInLesson);
                }
            };
            div.appendChild(btn);
        });
        container.appendChild(div);
    });
}

function finishLesson(points) {
    if (currentUser.role === 'student') {
        // Guardar progreso en la nube
        const newTotal = currentScore + points;
        db.ref('students/' + currentUser.id).update({
            score: newTotal
        });
        currentScore = newTotal;
        alert(`Lección terminada. Ganaste ${points} puntos.`);
        showScreen('student-dashboard');
        document.getElementById('display-score').innerText = currentScore;
    }
}

function returnToDashboard() {
    showScreen('student-dashboard');
}

// --- VISTA DEL MAESTRO (TIEMPO REAL) ---
function initTeacherView() {
    const studentsRef = db.ref('students');
    const tableBody = document.querySelector('#students-table tbody');
    const onlineCountSpan = document.getElementById('online-count');

    // Escuchar cambios en tiempo real en la base de datos
    studentsRef.on('value', (snapshot) => {
        const data = snapshot.val();
        tableBody.innerHTML = ""; // Limpiar tabla
        let onlineCount = 0;

        if (data) {
            // Convertir objeto de objetos a array
            Object.values(data).forEach(student => {
                const tr = document.createElement('tr');
                
                // Estado Online/Offline
                let statusHtml = '<span class="offline-badge">🔴 Offline</span>';
                if (student.online === true) {
                    statusHtml = '<span class="online-badge">🟢 En línea</span>';
                    onlineCount++;
                }

                tr.innerHTML = `
                    <td>${statusHtml}</td>
                    <td>${student.name}</td>
                    <td>${student.grade}° ${student.group}</td>
                    <td>${student.score || 0}</td>
                    <td>${student.lastLogin ? new Date(student.lastLogin).toLocaleDateString() : '-'}</td>
                `;
                tableBody.appendChild(tr);
            });
        }
        onlineCountSpan.innerText = onlineCount;
    });
}
