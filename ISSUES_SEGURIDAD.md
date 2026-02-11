# 🔐 Reporte de Seguridad - Inglés Para Todos

**Fecha:** 11 de Febrero, 2026  
**Auditor:** GitHub Copilot Security Agent  
**Severidad General:** 🔴 ALTA

---

## 📋 Resumen Ejecutivo

Se identificaron **5 vulnerabilidades críticas y de alta severidad** que requieren atención inmediata:

| # | Vulnerabilidad | Severidad | Estado | Archivos Afectados |
|---|---------------|-----------|--------|-------------------|
| 1 | Credenciales expuestas | 🔴 CRÍTICA | ⚠️ Abierta | index.html, creador.html |
| 2 | Inyección XSS (innerHTML) | 🔴 ALTA | ⚠️ Abierta | index.html (33 usos), creador.html (3 usos) |
| 3 | Almacenamiento inseguro | 🟡 MEDIA | ⚠️ Abierta | js/storage.js, index.html |
| 4 | Sin validación CSRF | 🟡 MEDIA | ⚠️ Abierta | Todos los formularios |
| 5 | CDN sin integridad (SRI) | 🟡 MEDIA | ⚠️ Abierta | index.html, creador.html |

---

## 🔴 VULNERABILIDAD #1: Credenciales Firebase Expuestas

### Descripción
Las credenciales de Firebase están hardcodeadas directamente en el código fuente HTML, visibles para cualquier usuario que inspeccione el código.

### Ubicación
**Archivo:** `index.html` (línea 510)  
**Archivo:** `creador.html` (línea 691)

### Código Vulnerable
```javascript
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
```

### Riesgo
- ✗ Cualquiera puede usar estas credenciales
- ✗ Abuso de la base de datos Firestore
- ✗ Consumo no autorizado de recursos
- ✗ Modificación/eliminación de datos
- ✗ Costos inesperados en Firebase

### Impacto
**CRÍTICO** - Puede resultar en:
- Pérdida de datos de usuarios
- Manipulación de contenido
- Cargos económicos significativos
- Violación de privacidad (GDPR)

### Solución Recomendada

#### Paso 1: Regenerar Credenciales
1. Ir a Firebase Console
2. Project Settings → General
3. Regenerar Web API Key
4. Crear nuevas credenciales

#### Paso 2: Implementar Firebase App Check
```javascript
// Proteger acceso a Firebase
import { initializeAppCheck, ReCaptchaV3Provider } from "firebase/app-check";

const appCheck = initializeAppCheck(app, {
  provider: new ReCaptchaV3Provider('YOUR-RECAPTCHA-SITE-KEY'),
  isTokenAutoRefreshEnabled: true
});
```

#### Paso 3: Configurar Reglas de Seguridad en Firestore
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Solo usuarios autenticados
    match /students/{studentId} {
      allow read, write: if request.auth != null && request.auth.uid == studentId;
    }
    
    // Solo profesores pueden leer todos los estudiantes
    match /students/{document=**} {
      allow read: if request.auth != null && 
                     get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'teacher';
    }
  }
}
```

#### Paso 4: Variables de Entorno (para futuro)
```javascript
// .env (NO COMMITEAR)
VITE_FIREBASE_API_KEY=your-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-auth-domain
// ...

// En código
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  // ...
};
```

---

## 🔴 VULNERABILIDAD #2: Cross-Site Scripting (XSS)

### Descripción
Uso extensivo de `innerHTML` sin sanitización, permitiendo inyección de código HTML/JavaScript malicioso.

### Ubicación
- **index.html**: 33 instancias de `innerHTML`
- **creador.html**: 3 instancias de `innerHTML`

### Ejemplos de Código Vulnerable

#### Ejemplo 1: Entrada de usuario sin sanitizar
```javascript
// VULNERABLE - línea ~1518 index.html
div.innerHTML = `<div class="shop-icon">${item.icon || '🖼️'}</div>
                 <div>${item.name}</div>`;
```

Si `item.name` contiene: `<img src=x onerror=alert('XSS')>`  
Se ejecutará código malicioso.

#### Ejemplo 2: Contenido dinámico
```javascript
// VULNERABLE
document.getElementById("lessonSelect").innerHTML = opciones;
```

### Riesgo
- ✗ Ejecución de JavaScript malicioso
- ✗ Robo de credenciales/cookies
- ✗ Phishing
- ✗ Redirección maliciosa
- ✗ Modificación de contenido

### Impacto
**ALTO** - Puede resultar en:
- Compromiso de cuentas de usuario
- Robo de datos personales
- Distribución de malware

### Solución Recomendada

#### Opción 1: Usar textContent/createTextNode
```javascript
// SEGURO
const nameElement = document.createElement('div');
nameElement.textContent = item.name; // Escapa automáticamente
```

#### Opción 2: Sanitizar con DOMPurify
```html
<!-- Incluir DOMPurify -->
<script src="https://cdn.jsdelivr.net/npm/dompurify@3.0.6/dist/purify.min.js"></script>
```

```javascript
// SEGURO
div.innerHTML = DOMPurify.sanitize(`<div>${item.name}</div>`);
```

#### Opción 3: Template Strings seguros
```javascript
// SEGURO - Escapar HTML
function escapeHTML(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

div.innerHTML = `<div>${escapeHTML(item.name)}</div>`;
```

### Líneas Específicas a Corregir

| Archivo | Línea Aprox. | Código | Riesgo |
|---------|-------------|---------|--------|
| index.html | 1518 | `div.innerHTML = \`...\${item.name}...\`` | ALTO |
| index.html | 1547 | `innerHTML = ""` | BAJO (vacío) |
| index.html | Variable | Múltiples usos de innerHTML | VARIABLE |

---

## 🟡 VULNERABILIDAD #3: Almacenamiento Inseguro

### Descripción
Datos sensibles almacenados en `localStorage` sin encriptación.

### Ubicación
Múltiples archivos usando localStorage:
- `js/storage.js`
- `index.html` (inline)
- `creador.html` (inline)

### Código Vulnerable
```javascript
// INSEGURO - Datos en texto plano
localStorage.setItem('myLang', lang);
localStorage.setItem('myTheme', theme);
localStorage.setItem('geminiApiKey', apiKey); // ¡MUY CRÍTICO!

// Cualquier script puede leer esto
const apiKey = localStorage.getItem('geminiApiKey');
```

### Riesgo
- ✗ localStorage accesible por cualquier script
- ✗ Vulnerable a XSS
- ✗ Datos persistentes incluso después de cerrar sesión
- ✗ No hay expiración automática
- ✗ API Keys en texto plano

### Impacto
**MEDIO-ALTO** - Puede resultar en:
- Robo de API Keys (Gemini)
- Suplantación de identidad
- Acceso no autorizado

### Solución Recomendada

#### Para Datos No Sensibles
```javascript
// Usar sessionStorage para datos temporales
sessionStorage.setItem('myLang', lang);
sessionStorage.setItem('myTheme', theme);
```

#### Para Datos Sensibles
```javascript
// NO almacenar API Keys en el cliente
// Usar backend proxy

// O si es absolutamente necesario, encriptar:
import CryptoJS from 'crypto-js';

const SECRET_KEY = 'user-specific-key'; // Derivada del usuario

function encryptData(data) {
  return CryptoJS.AES.encrypt(data, SECRET_KEY).toString();
}

function decryptData(ciphertext) {
  const bytes = CryptoJS.AES.decrypt(ciphertext, SECRET_KEY);
  return bytes.toString(CryptoJS.enc.Utf8);
}

localStorage.setItem('data', encryptData(apiKey));
```

#### Mejor Práctica: Usar Backend
```javascript
// API Keys NUNCA deben estar en el cliente
// Crear endpoint en backend
const response = await fetch('/api/gemini', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${userToken}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({ prompt })
});
```

---

## 🟡 VULNERABILIDAD #4: Sin Protección CSRF

### Descripción
Los formularios y acciones no tienen tokens CSRF, permitiendo ataques de falsificación de solicitudes entre sitios.

### Ubicación
Todos los formularios en:
- Login/Registro (index.html)
- Panel de profesor (creador.html)
- Acciones de Firebase (update, delete)

### Código Vulnerable
```javascript
// SIN PROTECCIÓN CSRF
db.collection("students").doc(usuarioActual).update({
  score: datosUsuario.score,
  inventory: datosUsuario.inventory
});

// Un sitio malicioso podría hacer esta llamada
```

### Riesgo
- ✗ Acciones no autorizadas
- ✗ Modificación de datos sin consentimiento
- ✗ Compras/transacciones fraudulentas

### Impacto
**MEDIO** - Puede resultar en:
- Modificación de puntuaciones
- Compras no autorizadas en la tienda
- Cambios de configuración

### Solución Recomendada

#### Implementar Tokens CSRF
```javascript
// Generar token único por sesión
function generateCSRFToken() {
  return crypto.randomUUID();
}

const csrfToken = generateCSRFToken();
sessionStorage.setItem('csrfToken', csrfToken);

// Incluir en todas las solicitudes
db.collection("students").doc(usuarioActual).update({
  score: datosUsuario.score,
  _csrf: csrfToken
});

// Validar en reglas de Firestore
// o en Cloud Functions
```

#### Firebase Cloud Functions con Validación
```javascript
exports.updateScore = functions.https.onCall((data, context) => {
  // Verificar autenticación
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'Usuario no autenticado');
  }
  
  // Verificar que el usuario solo modifica sus propios datos
  if (context.auth.uid !== data.userId) {
    throw new functions.https.HttpsError('permission-denied', 'No autorizado');
  }
  
  // Validar datos
  if (typeof data.score !== 'number' || data.score < 0) {
    throw new functions.https.HttpsError('invalid-argument', 'Score inválido');
  }
  
  // Actualizar
  return admin.firestore()
    .collection('students')
    .doc(context.auth.uid)
    .update({ score: data.score });
});
```

---

## 🟡 VULNERABILIDAD #5: CDN Sin Subresource Integrity (SRI)

### Descripción
Scripts cargados desde CDN sin verificación de integridad, vulnerable a ataques si el CDN es comprometido.

### Ubicación
**index.html** y **creador.html**

### Código Vulnerable
```html
<!-- SIN SRI -->
<script src="https://cdn.jsdelivr.net/npm/sweetalert2@11"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js"></script>
```

### Riesgo
- ✗ Si el CDN es comprometido, puede servir código malicioso
- ✗ Ataques MITM pueden modificar el script
- ✗ No hay forma de verificar que el archivo no fue alterado

### Impacto
**MEDIO** - Puede resultar en:
- Ejecución de código malicioso
- Robo de datos
- Compromiso total de la aplicación

### Solución Recomendada

#### Agregar Atributos SRI
```html
<!-- CON SRI -->
<script 
  src="https://cdn.jsdelivr.net/npm/sweetalert2@11.10.5/dist/sweetalert2.all.min.js" 
  integrity="sha384-6u8mHV0k8kU3wklLd6K+B7vp4SkL6vGKcJkGdHIL9vfhGPLf0QkOv9k7TqUTH3wv" 
  crossorigin="anonymous">
</script>

<script 
  src="https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js" 
  integrity="sha512-r22gChDnGvBylk90+2e/ycr3RVrDi8DIOkIGNhJlKfG2h5WqX0XUg6ixGn8GN73K8VRJvF4BSsmJYgOGrI4bvw==" 
  crossorigin="anonymous">
</script>
```

#### Generar Hashes SRI
```bash
# Descargar el archivo
curl -o sweetalert2.js https://cdn.jsdelivr.net/npm/sweetalert2@11.10.5/dist/sweetalert2.all.min.js

# Generar hash SHA-384
openssl dgst -sha384 -binary sweetalert2.js | openssl base64 -A

# Resultado: sha384-HASH_AQUÍ
```

#### Herramientas Online
- [SRI Hash Generator](https://www.srihash.org/)
- [KeyCDN SRI Hash Generator](https://tools.keycdn.com/sri)

---

## 📊 Análisis Adicional de Seguridad

### Validación de Entrada

#### Problemas Encontrados
```javascript
// Sin validación de tipo
document.getElementById("answerInput").value

// Sin límite de longitud
textarea.value

// Sin sanitización
userName.textContent = auth.currentUser.displayName;
```

#### Recomendaciones
```javascript
// Validar y sanitizar
function validateInput(input, maxLength = 100) {
  if (!input || typeof input !== 'string') return '';
  return input.trim().slice(0, maxLength);
}

const answer = validateInput(document.getElementById("answerInput").value, 200);
```

### Headers de Seguridad

Agregar en servidor o hosting:
```
Content-Security-Policy: default-src 'self'; script-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net https://cdnjs.cloudflare.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
X-XSS-Protection: 1; mode=block
Referrer-Policy: strict-origin-when-cross-origin
Permissions-Policy: geolocation=(), microphone=(self), camera=()
```

---

## ✅ Plan de Remediación

### Fase 1: Inmediato (Esta Semana)
- [ ] Regenerar credenciales de Firebase
- [ ] Implementar reglas de seguridad en Firestore
- [ ] Remover API Keys de localStorage
- [ ] Agregar SRI a scripts CDN

### Fase 2: Corto Plazo (2 Semanas)
- [ ] Implementar sanitización de HTML (DOMPurify)
- [ ] Reemplazar innerHTML por métodos seguros
- [ ] Implementar Firebase App Check
- [ ] Agregar validación de entrada

### Fase 3: Mediano Plazo (1 Mes)
- [ ] Migrar a Cloud Functions para operaciones sensibles
- [ ] Implementar sistema de tokens CSRF
- [ ] Configurar Content Security Policy
- [ ] Audit completo con herramientas automatizadas

### Fase 4: Largo Plazo (3 Meses)
- [ ] Implementar backend proxy para API calls
- [ ] Migrar a arquitectura más segura
- [ ] Penetration testing profesional
- [ ] Certificación de seguridad

---

## 🛠️ Herramientas Recomendadas

### Para Desarrollo
- **ESLint Security Plugin**: Detecta patrones inseguros
- **Snyk**: Escaneo de dependencias vulnerables
- **OWASP ZAP**: Testing de seguridad web
- **npm audit**: Auditoría de paquetes npm

### Para Testing
```bash
# Instalar herramientas
npm install -D eslint-plugin-security
npm install -D snyk

# Ejecutar auditorías
npm audit
snyk test
```

### Configuración ESLint
```json
{
  "plugins": ["security"],
  "extends": ["plugin:security/recommended"],
  "rules": {
    "security/detect-object-injection": "error",
    "security/detect-unsafe-regex": "error",
    "security/detect-non-literal-regexp": "error"
  }
}
```

---

## 📚 Referencias

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Firebase Security Rules](https://firebase.google.com/docs/rules)
- [Content Security Policy](https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP)
- [Subresource Integrity](https://developer.mozilla.org/en-US/docs/Web/Security/Subresource_Integrity)
- [XSS Prevention Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Cross_Site_Scripting_Prevention_Cheat_Sheet.html)

---

## 📝 Notas Finales

Este reporte identifica las vulnerabilidades más críticas del proyecto. Es importante abordarlas en orden de prioridad:

1. **Críticas** (Inmediato): Credenciales expuestas
2. **Altas** (Urgente): XSS, Almacenamiento inseguro
3. **Medias** (Importante): CSRF, SRI

La seguridad es un proceso continuo. Después de implementar estas correcciones, se recomienda:
- Auditorías de seguridad regulares
- Monitoreo de logs y actividad sospechosa
- Actualización de dependencias
- Capacitación del equipo en prácticas seguras

---

**Confidencial** - Este documento contiene información sensible sobre vulnerabilidades de seguridad.  
**Fecha de expiración:** Después de remediar todas las vulnerabilidades críticas.
