# 📚 Inglés Para Todos - MASTER V60 AI ULTRA

![Version](https://img.shields.io/badge/version-V60-blue)
![PWA](https://img.shields.io/badge/PWA-enabled-green)
![Firebase](https://img.shields.io/badge/Firebase-integrated-orange)
![License](https://img.shields.io/badge/license-MIT-lightgrey)

> 🎓 Plataforma educativa gamificada para aprender inglés de manera interactiva

## 🌟 Características Principales

### 🎮 Gamificación Completa
- **Sistema de Puntos**: Gana puntos por respuestas correctas
- **Niveles Progresivos**: 10 puntos = 1 nivel, niveles desbloqueables
- **Logros**: Sistema de insignias y recompensas
- **Ranking**: Tabla de líderes para competir con otros estudiantes

### 📱 Progressive Web App (PWA)
- ✅ Funciona 100% offline
- ✅ Instalable en móviles y escritorio
- ✅ Actualizaciones automáticas
- ✅ Caché inteligente con Service Worker

### 🎯 Modalidades de Aprendizaje
- 🎧 **Listening**: Comprensión auditiva con audio nativo
- 🗣️ **Speaking**: Práctica de pronunciación con reconocimiento de voz
- ✍️ **Writing**: Ejercicios de escritura y traducción

### 👨‍🏫 Panel de Profesor
- Visualización de progreso de estudiantes
- Estadísticas y análisis con gráficos (Chart.js)
- Exportación de datos (Excel, PDF)
- Gestión de contenido educativo

### 🛒 Sistema de Tienda
- **Avatares**: Personaliza tu emoji de perfil
- **Marcos**: Efectos visuales (oro, fuego, neón, arcoíris)
- **Temas**: Esquemas de color oscuro/claro
- **Compras**: Usa tus puntos ganados

### 🌍 Multiidioma
- Español
- English
- Cambio instantáneo de idioma

## 🚀 Inicio Rápido

### Requisitos
- Navegador moderno (Chrome, Firefox, Safari, Edge)
- Conexión a internet (solo para sincronización)

### Instalación Local

1. **Clonar el repositorio**
```bash
git clone https://github.com/pepejoeck-codeclass/ingles-para-todos.git
cd ingles-para-todos
```

2. **Abrir en navegador**
```bash
# Opción 1: Servidor simple con Python
python -m http.server 8000

# Opción 2: Servidor con Node.js
npx http-server

# Opción 3: Live Server (VS Code)
# Instalar extensión "Live Server" y hacer clic derecho > "Open with Live Server"
```

3. **Acceder a la aplicación**
```
http://localhost:8000
```

### Instalación como PWA

1. Abrir la aplicación en el navegador
2. Buscar el ícono de instalación en la barra de direcciones
3. Hacer clic en "Instalar" o "Agregar a pantalla de inicio"
4. ¡Listo! Ahora funciona como app nativa

## 📂 Estructura del Proyecto

```
ingles-para-todos/
│
├── 📄 index.html              # Aplicación principal (119 KB)
├── 📄 creador.html            # Panel de administración (44 KB)
├── 📄 prueba.html             # Página de prueba
├── 📄 manifest.json           # Configuración PWA
├── 📄 service-worker.js       # Worker de caché offline
│
├── 📁 css/
│   └── styles.css             # Estilos personalizados adicionales
│
├── 📁 js/                     # Módulos JavaScript ES6
│   ├── app.js                 # Inicialización de la app
│   ├── gameLogic.js           # Lógica del juego
│   ├── storage.js             # Gestión de datos locales
│   ├── ui.js                  # Componentes de interfaz
│   └── i18n.js                # Internacionalización
│
└── 📁 assets/
    ├── 📁 images/             # Logos y recursos visuales
    ├── 📁 sounds/             # Efectos de sonido
    │   ├── correct.mp3        # Sonido de respuesta correcta
    │   ├── wrong.mp3          # Sonido de respuesta incorrecta
    │   └── levelup.mp3        # Sonido de subida de nivel
    └── 📁 audio/              # Audio de lecciones
```

## 🛠️ Tecnologías

### Frontend
- **HTML5** - Estructura semántica
- **CSS3** - Estilos y animaciones
- **JavaScript ES6** - Lógica modular

### Backend / Servicios
- **Firebase Authentication** - Sistema de usuarios
- **Cloud Firestore** - Base de datos en tiempo real
- **Firebase Hosting** - Despliegue (opcional)

### Librerías
| Librería | Versión | Uso |
|----------|---------|-----|
| SweetAlert2 | 11 | Notificaciones y alertas |
| Chart.js | Latest | Gráficos y estadísticas |
| XLSX | 0.18.5 | Exportación a Excel |
| html2pdf.js | 0.10.1 | Generación de PDFs |
| Font Awesome | 6.4.0 | Iconos |
| Google Fonts | - | Tipografía (Nunito) |

### APIs
- **Web Speech API** - Reconocimiento de voz
- **Firebase API** - Autenticación y base de datos
- **Gemini AI** (opcional) - Generación de contenido

## 💻 Uso

### Para Estudiantes

1. **Registro/Login**
   - Crear cuenta con email y contraseña
   - O usar Google Sign-In

2. **Seleccionar Nivel**
   - Empezar en Nivel 1
   - Desbloquear niveles superiores con puntos

3. **Elegir Modalidad**
   - Listening: Escuchar y comprender
   - Speaking: Hablar y practicar pronunciación
   - Writing: Escribir y traducir

4. **Ganar Puntos**
   - Respuestas correctas = +1 punto
   - 10 puntos = +1 nivel
   - Usa puntos en la tienda

5. **Personalizar**
   - Comprar avatares, marcos y temas
   - Cambiar idioma de la interfaz
   - Activar modo oscuro

### Para Profesores

1. **Acceder al Panel**
   - Navegar a `creador.html`
   - Login con cuenta de profesor

2. **Ver Progreso**
   - Estadísticas de estudiantes
   - Gráficos de rendimiento
   - Tiempo de estudio

3. **Exportar Datos**
   - Excel (XLSX)
   - PDF con gráficos
   - Filtrar por fecha/estudiante

4. **Gestionar Contenido**
   - Agregar/editar lecciones
   - Crear ejercicios personalizados
   - Configurar niveles

## 🎨 Personalización

### Temas Disponibles
- **Claro**: Fondo blanco, texto oscuro
- **Oscuro**: Fondo oscuro, texto claro
- **Océano**: Azul profundo
- **Sunset**: Naranja/rosa
- **Forest**: Verde natural

### Marcos de Avatar
- 🥇 Gold (Dorado)
- 🔥 Fire (Fuego animado)
- 💎 Diamond (Diamante brillante)
- 🌈 Rainbow (Arcoíris)
- ⚡ Neon (Neón brillante)

## 📊 Sistema de Progresión

### Niveles
```
Nivel 1:  0-9 puntos    (Principiante)
Nivel 2:  10-19 puntos  (Básico)
Nivel 3:  20-29 puntos  (Intermedio)
Nivel 4:  30-39 puntos  (Intermedio-Alto)
...
Nivel N:  (N-1)*10 - N*10 puntos
```

### Logros
- 🏆 **Primer Paso**: Completa tu primera lección
- 🔥 **Racha de 7**: 7 días consecutivos
- 💯 **Perfección**: 10 respuestas correctas seguidas
- 🌟 **Maestro**: Alcanza nivel 10
- 👑 **Leyenda**: Alcanza nivel 20

## 🔐 Seguridad

⚠️ **IMPORTANTE**: Este proyecto tiene vulnerabilidades de seguridad identificadas.  
Ver [ISSUES_SEGURIDAD.md](./ISSUES_SEGURIDAD.md) para detalles completos.

### Problemas Conocidos
- Credenciales de Firebase expuestas en código
- Uso de `innerHTML` sin sanitización (XSS)
- localStorage sin encriptación
- CDN sin Subresource Integrity (SRI)

### Plan de Remediación
Ver documento [ISSUES_SEGURIDAD.md](./ISSUES_SEGURIDAD.md) para:
- Lista completa de vulnerabilidades
- Priorización de correcciones
- Código de ejemplo para soluciones

## 📈 Análisis del Proyecto

Para un análisis técnico completo, ver [ANALISIS_PROYECTO.md](./ANALISIS_PROYECTO.md)

Incluye:
- Arquitectura detallada
- Análisis de rendimiento
- Evaluación de código
- Recomendaciones de mejora

## 🧪 Testing

### Manual
```bash
# Abrir en navegador
open index.html

# Probar funcionalidades:
1. Login/Registro
2. Completar lecciones
3. Subir de nivel
4. Comprar en tienda
5. Exportar datos (profesor)
```

### Offline
```bash
# Instalar PWA
# Desconectar internet
# Verificar funcionalidad offline
```

## 🚀 Deployment

### Firebase Hosting

1. **Instalar Firebase CLI**
```bash
npm install -g firebase-tools
```

2. **Login**
```bash
firebase login
```

3. **Inicializar proyecto**
```bash
firebase init hosting
```

4. **Deploy**
```bash
firebase deploy
```

### Netlify

1. Conectar repositorio de GitHub
2. Configurar build:
   - Build command: (ninguno)
   - Publish directory: `/`
3. Deploy automático en cada commit

### GitHub Pages

1. Ir a Settings → Pages
2. Seleccionar branch `main`
3. Guardar
4. Acceder en `https://username.github.io/ingles-para-todos`

## 🤝 Contribuir

### Reportar Bugs
Usar [GitHub Issues](https://github.com/pepejoeck-codeclass/ingles-para-todos/issues)

### Solicitar Features
Crear un issue con el tag `enhancement`

### Pull Requests
1. Fork el proyecto
2. Crear rama feature (`git checkout -b feature/AmazingFeature`)
3. Commit cambios (`git commit -m 'Add AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abrir Pull Request

## 📝 Roadmap

### V61 (Próximo)
- [ ] Corregir vulnerabilidades de seguridad
- [ ] Implementar tests unitarios
- [ ] Optimizar rendimiento

### V62 (Futuro)
- [ ] Modo multijugador
- [ ] Desafíos diarios
- [ ] Sistema de mentores
- [ ] Integración con Google Classroom

### V63 (Ideas)
- [ ] App móvil nativa (React Native)
- [ ] Realidad aumentada para vocabulario
- [ ] Conversaciones con IA
- [ ] Certificados de finalización

## 📄 Licencia

Este proyecto está bajo la Licencia MIT - ver archivo [LICENSE](LICENSE) para detalles.

## 👥 Autores

- **PepeJoeck** - *Desarrollo inicial* - [@pepejoeck-codeclass](https://github.com/pepejoeck-codeclass)

## 🙏 Agradecimientos

- Estudiantes y profesores que usan la plataforma
- Comunidad de Firebase
- Todos los contribuidores open source

## 📞 Soporte

- **Email**: [Crear issue](https://github.com/pepejoeck-codeclass/ingles-para-todos/issues)
- **Documentación**: Ver carpeta `/docs`
- **FAQ**: [Wiki del proyecto](https://github.com/pepejoeck-codeclass/ingles-para-todos/wiki)

## 🔗 Enlaces Útiles

- [Documentación de Firebase](https://firebase.google.com/docs)
- [PWA Documentation](https://web.dev/progressive-web-apps/)
- [Web Speech API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Speech_API)

---

**Hecho con ❤️ por la comunidad de aprendizaje de inglés**

*Última actualización: 11 de Febrero, 2026*
