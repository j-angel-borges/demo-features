# PROMPT MAESTRO DE IMPLEMENTACIÓN: ISLA DINÁMICA AGÉNTICA & RELOJ CIRCADIANO

Copia y pega el siguiente bloque íntegro en la nueva sesión de Antigravity dentro de `apps/isla-dinamica` (o en la raíz de `demo-features`) para arrancar la construcción técnica de inmediato:

```markdown
Actúa como un Ingeniero Principal Frontend, UX Designer y Especialista en Inteligencia Artificial de Zentry. Tu objetivo es implementar la evolución de la PWA **Isla Dinámica** (`apps/isla-dinamica` dentro de `D:\1_jose_angel\1_GitHub\Zentry\demo-features\apps\isla-dinamica`) para transformarla de un simple visor de cámara a una **Demostración Agéntica y de Ritmo Circadiano** adaptada a niños de 2 a 11 años.

---

### 1. Documentos y Especificaciones de Referencia
Antes de modificar el código, consulta y respeta:
1. **Visión del Autor:** `D:\1_jose_angel\prompt-feature incompleto 06-09.md`
2. **Documento Técnico Factor WOW:** `D:\1_jose_angel\1_GitHub\Zentry\demo-features\DOC_TECNICO_MEJORAS_FACTOR_WOW.md`
3. **Referencias Científicas (ART y Neurobiología):** `D:\1_jose_angel\1_GitHub\Zentry\demo-features\science-refs\`
4. **Estado Actual de la App:** `apps/isla-dinamica/src/App.tsx` y `apps/isla-dinamica/src/components/DynamicIsland.tsx`

---

### 2. Objetivos y Alcance Técnico

#### FASE 1: Integración del Icono Zentry y Modo Agéntico en la Cápsula
* **Archivo:** `apps/isla-dinamica/src/components/DynamicIsland.tsx`
* **Estado Compacto (Píldora en Reposo - 42px):**
  * Actualmente solo contiene el indicador de estado/mic a la izquierda y el botón de cámara a la derecha.
  * Incorporar el **Icono Z (Emblema vectorial de Zentry)** en la cápsula.
* **Comportamiento del Icono Z:**
  * Al hacer clic en la cámara: Mantiene el comportamiento actual (expansión para visión multimodal del entorno).
  * Al hacer clic en la **Z**: Despliega la **Cápsula Agéntica del Copiloto Zentry (Agentic OS Mode)**:
    * Expansión animada de resorte (*Spring Physics* a 60fps con `framer-motion`).
    * **Orbe Agéntico de Voz:** Escucha la voz del niño y ofrece chips táctiles de un solo toque (*Zero-text / Icon-first*) para niños pequeños.
    * **Capacidades Agénticas del Copiloto:**
      1. Operar el tema del dispositivo (*"Zentry, modo noche"* $\to$ conmuta a paleta nocturna y atenúa brillos).
      2. Consultar ritmo biológico (*"Zentry, ¿cuánto tiempo me queda?"* $\to$ el reloj circadiano se ilumina y el agente responde en 1 frase amable).
      3. Sugerir pausas activas (*"Zentry, estoy aburrido"* $\to$ propone retos físicos del mundo real basados en ART).
* **System Prompt y Guardarraíles:**
  * Integrar en `useGeminiLive.ts` / `services/aiService.ts` las directivas estrictas para niños: texto limpio sin emojis, calidez pedagógica, máximo 1-2 oraciones habladas, prohibición total de términos condescendientes.

---

#### FASE 2: Widget de Reloj Circadiano Simbólico (Aprovechamiento del Lienzo)
* **Archivo Nuevo:** `apps/isla-dinamica/src/components/CircadianClockWidget.tsx`
* **Montaje:** En `apps/isla-dinamica/src/App.tsx`, ubicado en el tercio superior justo debajo de la Isla Dinámica.
* **Diseño y Neurobiología del Widget:**
  * Dial central con estilo *Liquid Glass* (`backdrop-filter: blur(20px)`, bordes especulares y tokens de la paleta Zentry).
  * Despliegue de la hora numérica grande y clara con tipografía limpia.
  * **Anillo Orbital Progresivo de 360° (Borde Circadiano Simbólico):**
    * Los niños no interpretan horas abstractas; interpretan el color de la luz solar.
    * El borde circular SVG avanza de forma proporcional a la hora solar del día ($0\text{h} \to 24\text{h}$):
      * **Mañana (06:00 - 12:00):** Amarillo solar brillante y dorado (`#FACC15`).
      * **Tarde (12:00 - 18:30):** Naranja cálido y ámbar fuego (`#FB923C` $\to$ `#F97316`).
      * **Noche / Descanso (18:30 - 06:00):** Azul índigo profundo (`#1E1B4B`), púrpura Zentry (`#533B87`) y micro-estrellas brillantes.
    * Un pequeño glifo solar o lunar viaja a lo largo del perímetro circular señalando la posición exacta del ciclo.
    * Animación suave con interpolación trigonométrica al cargar y actualizarse cada minuto.

---

#### FASE 3: Widgets de Soporte en el Lienzo Inferior
* Aprovechar el resto del espacio vertical de la pantalla para crear un entorno de sistema operativo vivo y elegante:
  * **Tarjeta de Estado Biológico:** Un indicador minimalista del nivel de luz natural y recomendación de energía (ej: *"Hora de crear y jugar"* de día, *"Modo calma y estrellas"* de noche).
  * **Botón de Enlace Rápido:** Acceso directo para saltar a las otras experiencias del ecosistema Zentry (Skinner Box o Z-Art).

---

#### FASE 4: Telemetría y Sincronización con Dashboard Parental
* Cada cambio de fase circadiana y cada acción agéntica ejecutada desde la Isla Dinámica debe emitir un evento liviano a la colección de Firestore `/island_telemetry` usando los helpers existentes en `@zentry/shared` (`src/services/firebase.ts`).
* Esto permite que en una pantalla secundaria, el padre observe en tiempo real cómo su hijo interactúa con el copiloto y cómo progresa su ciclo de descanso.

---

### 3. Criterios de Calidad y Validación
1. **Compilación Limpia:** Ejecuta `npm run build` en `apps/isla-dinamica` y asegura que compile con **0 errores de TypeScript**.
2. **Fluidez 60 FPS:** Las transiciones de apertura de la Isla con el Icono Z y el giro del borde solar del reloj deben ser fluidas y naturales.
3. **Preservar la Funcionalidad Existente:** El modo cámara actual (BeReal PiP, Gemini Live y herramientas de esquina) debe seguir funcionando intacto al pulsar el icono de la cámara.
```
