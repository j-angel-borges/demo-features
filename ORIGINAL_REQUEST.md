# Original User Request

## Initial Request — 2026-09-02T11:59:27Z

<USER_REQUEST>
Suite de 3 micro-PWAs interconectadas y especializadas para demostraciones comerciales independientes (Isla Dinámica Multimodal, Experimento Skinner Box y Dashboard Parental Observador en Vivo) conectadas en tiempo real a Firebase Firestore y Gemini en GCP `quarz-group`, con despliegue multiobjetivo en Firebase Hosting (`.web.app`). Conserva y optimiza estrictamente el Zentry DNA, su colorimetría canónica (Púrpura #533B87, Lavanda #D6C8FA, Menta #C2F4E7, Glacial #EBF1F5, Slate #4A5160, Dark #080D1A) y el sistema visual Liquid Glass con física de resortes elásticos.

Working directory: D:\1_jose_angel\1_GitHub\Zentry\demo-features
Integrity mode: demo

## Requirements

### R1. Isla Dinámica Multimodal (Backpage PWA)
- **Contenedor Aislado (Backpage)**: Aplicación web responsiva (Mobile/Tablet) bloqueada en pantalla completa con física elástica (spring bounce) y estética Liquid Glass (Zentry DNA).
- **Cámara Líquida & Conmutador Triple**: Al pulsar el icono de cámara (sin texto), la isla se expande fluidamente hacia abajo. Selector superior de 3 modos con cámara real del dispositivo (getUserMedia): Cámara Trasera (environment), Cámara Frontal (user) y Modo Dual (estilo BeReal con ventana superpuesta PiP).
- **Agente Multimodal en Vivo (GCP quarz-group)**: Botón circular inferior que activa/desactiva la sesión de voz/visión continua de ultra-baja latencia con Gemini 2.5 Flash (sin thinking mode para respuesta inmediata), capturando fotogramas periódicos del stream de video y respondiendo por voz en español.
- **Botones de Esquinas para Acciones Visuales**:
  - Icono Paisaje: Captura instantánea y transformación generativa (Opción 1: Mejorar escena; Opción 2: Convertir a Cómic, Pixel Art, Videojuego o estilo aleatorio inferido por comprensión espacial).
  - Icono Signo de Interrogación: Captura de imagen donde el usuario toca cualquier área/objeto para que la IA reconozca el elemento y devuelva una explicación concisa, pedagógica y rápida.
  - Icono Herramienta: Reconocimiento de escena con deliberación y propuesta de 2 alternativas útiles de rediseño/transformación (ej. modificar arquitectura vs. ambiente futurista 3D).

### R2. Skinner Box (Simulador de Adicción al Scroll por Refuerzo Variable)
- **Fundamentación de Condicionamiento Operante**: Replicación y exageración del programa de refuerzo de razón variable de B.F. Skinner ("palancazo" = scroll).
- **Dinámica de Decaimiento Temporal**:
  - Inicio: Contenidos horizontales largos (30 a 45s) de alto valor (ciencia, divulgación, lecturas).
  - Aceleración: A mayor número de scrolls, la duración media de los contenidos se reduce drásticamente (10s, 8s, 5s) hacia temas dopaminérgicos y formatos rápidos, intercalando esporádicamente videos largos para alimentar la expectativa de recompensa.
- **Versiones Diferenciadas**: Selector de catálogo para Niños (curado/educativo a hiper-fragmentado) y Adultos.
- **Telemetría de Sesión en Firestore (quarz-group)**: Registro con botones de Iniciar y Finalizar sesión: contador de scrolls (palancazos), temas consumidos, porcentaje de retención por video, contenidos completados al 100% y curva temporal de duración.

### R3. Dashboard Parental (Observador en Vivo & Feature Hub)
- **Estructura Base**: Esqueleto visual inspirado en zentry-parent-dashboard manteniendo la ficha/perfil del menor y la subida de documentos.
- **Visor en Tiempo Real de la Isla Dinámica**: Métricas de herramientas utilizadas, capturas y consultas IA.
- **Visor en Vivo de la Caja de Skinner**: Panel de telemetría reactiva que muestra en tiempo real desde un segundo dispositivo cómo el scroll del menor está siendo capturado (conteo de scrolls en vivo, porcentaje de retención actual, velocidad de consumo y gráfica de fragmentación).

### R4. Arquitectura de Despliegue & Conexión GCP (quarz-group)
- 3 proyectos Vite/React independientes con TypeScript y Tailwind CSS v4 alojados en subdirectorios dentro de demo-features.
- Configuración de firebase.json con soporte para multi-site hosting en quarz-group (ej: zentry-island-demo.web.app, zentry-skinner-demo.web.app, zentry-parent-demo.web.app).
- Llamadas directas al SDK de Gemini / Vertex AI para visión y síntesis de voz, con persistencia en colecciones de Firestore (sessions_skinner, island_telemetry, devices_live).

## Acceptance Criteria

### 1. Isla Dinámica & Experiencia Multimodal
- [ ] Animación fluida a 60fps de despliegue y colapso liquid glass al activar la cámara sin textos distractores.
- [ ] Conmutación funcional entre Cámara Trasera, Frontal y Modo Dual BeReal con acceso a navigator.mediaDevices.
- [ ] Sesión de voz continua interactiva de baja latencia con Gemini 2.5 Flash activada/desactivada desde el botón circular.
- [ ] Los 3 botones de esquina (Paisaje, Interrogación y Herramienta) capturan el fotograma actual y ejecutan sus flujos de visión e interacción.

### 2. Skinner Box & Mecánicas de Refuerzo
- [ ] Transición progresiva del catálogo: inicia con 30-45s y decae dinámicamente hasta 5-10s según la frecuencia de scroll acumulada.
- [ ] Modalidad dual Niño / Adulto con contenido ajustado.
- [ ] Botones de control de sesión (Iniciar/Finalizar) con cálculo de porcentaje de retención por ítem y guardado íntegro en Firestore.

### 3. Sincronización en Tiempo Real con el Dashboard
- [ ] El Dashboard Parental recibe y grafica en vivo los eventos de scroll y métricas de Skinner Box desde Firestore sin necesidad de refrescar la página.
- [ ] Interfaz pulida, lista para demo comercial en 3 URLs independientes de Firebase Hosting.

</USER_REQUEST>

## Follow-up — 2026-09-03T18:57:37Z

<USER_REQUEST>
Suite comercial Zentry de 3 micro-PWAs interconectadas: transformación de Skinner Box a una experiencia pura de Shorts/TikTok sin métricas visibles para el menor, centralización del control de sesión en el Dashboard Parental con metáfora interactiva de Máquina Tragamonedas (iconos SVG vectoriales y palanca reactiva en tiempo real), módulo de Reportería Científica con selector manual, y configuración de despliegue multiobjetivo en GCP `quarz-group` para `skinner-box.web.app`, `parental-feature.web.app` e `isla-dinamica.web.app`.

Working directory: D:\1_jose_angel\1_GitHub\Zentry\demo-features
Integrity mode: demo

## Requirements

### R1. Skinner Box: Experiencia Pura de Consumo (Formato YouTube Shorts / TikTok)
- Eliminar de la interfaz de Skinner Box (`apps/skinner-box`) todos los botones de control de sesión ("Iniciar Sesión", "Finalizar Sesión"), contadores de velocidad RPM, métricas analíticas y modales de resumen.
- El menor debe percibir únicamente un reproductor vertical inmersivo idéntico a YouTube Shorts / TikTok: scroll vertical continuo, reproducción de video fluida con audio conmutable, overlay social nativo (Like, Compartir, Sonido, Perfil) y respuesta visual instantánea.
- La telemetría de comportamiento (frecuencia de scroll, duración de visualización por video, porcentaje de retención y temas consumidos) se emite de forma transparente y silenciosa en tiempo real hacia el bus de sincronización.
- Mantiene el bloqueo inmediato de seguridad si el padre lo activa desde el Dashboard Parental.

### R2. Dashboard Parental: Master de Sesión y Metáfora de Tragamonedas (Factor WOW)
- Incorporar en el Parental Dashboard (`apps/parent-dashboard`) los controles maestros de sesión: botón para **Iniciar Sesión**, **Finalizar Sesión** y **Reiniciar Prueba**.
- Implementar la vista interactiva **`[ 🎰 Metáfora Casino (Factor WOW) ]`** en el Observador Skinner:
  - Estructura física retro-futurista Liquid Glass de máquina tragamonedas (Slot Machine).
  - **Palanca mecánica animada** que desciende físicamente en tiempo real con física de resorte (Framer Motion) cada vez que el menor hace scroll en su dispositivo.
  - **Rodillos giratorios dopamínicos** construidos estrictamente con **iconos vectoriales SVG / Lucide** (prohibición absoluta de emojis para evitar fallos de renderizado): rayos de dopamina (`Zap`), temporizador de 5s (`Clock`), recompensa variable (`Sparkles`), fragmentación cognitiva (`Brain`), validación (`Heart`) y alerta compulsiva (`BellRing`).
  - **Disparador de Jackpot Dopamínico**: cuando el menor pasa menos de 7 segundos en un video y salta rápidamente, se activa la animación de *Jackpot* con destellos luminosos, lluvia de partículas y explicación pedagógica visible para el padre.

### R3. Módulo de Reportería Científica de Activación Manual
- El presentador o padre debe tener el **control manual exclusivo** sobre cuándo visualizar el reporte (`viewMode: 'report'`) a través del selector de vistas del Observador Skinner.
- **Semáforo Continuo de Salud Digital**:
  - Medidor gráfico de alta precisión calibrado de Verde (Consumo Consciente / Retención >30s) a Rojo (Doomscrolling Hiper-fragmentado / Retención <8s).
- **Recomendaciones Prácticas de Hábitos en el Mundo Real (Offline)**:
  - Generadas automáticamente a partir de los temas que captaron el interés del menor (ej. Naturaleza -> Paseo a reserva ecológica o zoológico; Ciencia -> Experimentos caseros o planetario; Arte -> Pintura y modelado; Deportes -> Actividades motoras grupales).
- **Fundamentación Académica Formal**:
  - Citas indexadas de literatura científica: B.F. Skinner (1953, Refuerzo de Razón Variable), Wolfram Schultz (1998, Predicción de Recompensa Dopaminérgica), Jean Twenge (2018, Bienestar Psicológico y Pantallas), Adam Alter (2017, Tecnología Adictiva) y directrices de la OMS (2019).

### R4. Configuración Multiobjetivo de Firebase Hosting (GCP quarz-group)
- Configurar `.firebaserc` y optimizar `firebase.json` en `demo-features` para el despliegue directo sobre el proyecto GCP `quarz-group`.
- Mapeo canónico de los 3 sitios independientes:
  - `isla-dinamica.web.app` ➔ `apps/isla-dinamica/dist`
  - `skinner-box.web.app` ➔ `apps/skinner-box/dist`
  - `parental-feature.web.app` ➔ `apps/parent-dashboard/dist`
- Verificación exhaustiva de compilación limpia de producción (`npm run build`) para las 3 micro-PWAs y la librería compartida.

---

## Acceptance Criteria

### 1. Interfaz Limpia en Skinner Box
- [ ] La aplicación Skinner Box carece por completo de botones "Iniciar / Finalizar Sesión" o estadísticas analíticas en la vista del usuario.
- [ ] La experiencia emula 1:1 la interfaz de YouTube Shorts / TikTok con scroll gestual vertical y reproducción multimedia fluida.
- [ ] Las métricas de scroll y retención se envían en segundo plano al bus de sincronización en tiempo real (< 5ms).

### 2. Tragamonedas y Control en Dashboard Parental
- [ ] El Dashboard Parental dispone de los controles de "Iniciar Sesión" y "Finalizar Sesión" de la Caja de Skinner.
- [ ] La palanca de la tragamonedas desciende y rebota mecánicamente cada vez que el usuario desliza la pantalla en la Skinner Box.
- [ ] Los rodillos utilizan exclusivamente iconos vectoriales SVG sin emojis.
- [ ] Los saltos rápidos de video disparan visualmente la alerta de Jackpot Dopamínico.

### 3. Reporte Científico & Hábitos
- [ ] El reporte se visualiza únicamente cuando el presentador selecciona manualmente la pestaña correspondiente.
- [ ] El semáforo muestra de forma clara el grado de salud del consumo (Verde a Rojo).
- [ ] Se despliegan sugerencias de actividades en el mundo real derivadas de los temas consumidos.
- [ ] Se presentan las citas formales de los 5 papers científicos clave.

### 4. Despliegue en GCP quarz-group
- [ ] El archivo `.firebaserc` contiene el proyecto `quarz-group` y los 3 targets de hosting vinculados.
- [ ] El archivo `firebase.json` contiene la configuración de cabeceras, permisos PWA y redirecciones para `isla-dinamica`, `skinner-box` y `parental-feature`.
- [ ] El comando `npm run build` compila al 100% sin errores de TypeScript ni de bundler.

</USER_REQUEST>
