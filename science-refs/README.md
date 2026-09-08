# Repositorio de Evidencia Científica y Especificaciones Técnicas (Zentry Science-Refs)

Bienvenido a la biblioteca canónica de referencias científicas y especificaciones matemáticas para el desarrollo del **Factor WOW** en el ecosistema **Zentry Commercial Demo Suite** (`apps/skinner-box`, `apps/parent-dashboard`, `packages/shared`).

Este directorio fue diseñado bajo el protocolo **/deep-research** para ser consumido de manera autónoma tanto por **agentes de inteligencia artificial (LLM coding agents)** como por ingenieros de software e investigadores pedagógicos.

---

## 🧭 Índice de Archivos y Responsabilidades

| Archivo | Formato | Propósito Principal | Consumidor Recomendado |
| :--- | :--- | :--- | :--- |
| **[`00_INDEX_CATALOG.json`](./00_INDEX_CATALOG.json)** | JSON Machine-Readable | Catálogo exhaustivo indexable con metadatos estructurados, DOIs, PMIDs y mapeo de vectores. | Agentes IA (Ingesta automática de contexto) |
| **[`01_OPERANT_CONDITIONING_SLOT_MACHINE_NEUROBIOLOGY.md`](./01_OPERANT_CONDITIONING_SLOT_MACHINE_NEUROBIOLOGY.md)** | Markdown + Frontmatter | Fundamentación de la Caja de Skinner, programas de razón variable (VR-7), error de predicción fásico de dopamina (Schultz) y diseño del Tragamonedas en código. | Agente UI/UX & Engine Dev (`apps/parent-dashboard`) |
| **[`02_ATTENTION_DECAY_AND_COGNITIVE_FRAGMENTATION.md`](./02_ATTENTION_DECAY_AND_COGNITIVE_FRAGMENTATION.md)** | Markdown + Frontmatter | Evidencia neurocognitiva del daño por micro-videos ($40\text{s} \to 5\text{s}$), degradación ejecutiva y fórmula matemática del Índice de Salud de Consumo ($I_{sc}$). | Agente de Algoritmos & Telemetría (`apps/skinner-box`) |
| **[`03_ATTENTION_RESTORATION_THEORY_AND_OFFLINE_INTERVENTIONS.md`](./03_ATTENTION_RESTORATION_THEORY_AND_OFFLINE_INTERVENTIONS.md)** | Markdown + Frontmatter | Teoría de Restauración de la Atención (ART), macro-estudio ABCD (2026), y matriz de prescripciones offline (Zoológicos, Deporte, Maker Labs). | Agente de Recomendaciones & Pitch Comercial |
| **[`04_ALGORITHMIC_SCORING_AND_RECOMMENDATION_ENGINE_SPEC.md`](./04_ALGORITHMIC_SCORING_AND_RECOMMENDATION_ENGINE_SPEC.md)** | Markdown + Frontmatter | Contratos de interfaces TypeScript, esquemas de Firestore, máquina de estados FSM del casino, interpolación cromática (Rojo-Ámbar-Verde) y tests unitarios. | Agente Full-Stack Implementation & Hardening |

---

## 🔬 Matriz de Correlación: Del Paper Científico a la Línea de Código

```
[PAPER CIENTÍFICO INDEXADO]
          │
          ▼
   Schultz et al. (PNAS 2024) / Su et al. (NeuroImage 2021)
   └── VTA & Dopamine Phasic Reward Loop
          │
          ▼
   [EVENTO TELEMÉTRICO EN SKINNER-BOX]
   └── Dwell Time < 6s (Skip Impulsivo)
          │
          ▼
   [ANIMACIÓN REACTIVA EN PARENT-DASHBOARD]
   └── Máquina Tragamonedas: Palanca baja + ¡JACKPOT DOPAMINA 777!
          │
          ▼
   [REPORTE POST-SESIÓN]
   └── Cálculo I_sc (Zhai et al. 2025 / Christakis 2018) -> Barra Roja/Ámbar/Verde
          │
          ▼
   [PRESCRIPCIÓN OFFLINE BASADA EN ART]
   └── Kaplan (1995) / Fowler et al. ABCD Study (2026) -> Actividad Prescriptiva
```

---

## 🤖 Directrices para Agentes de Código IA

Cuando un agente de IA reciba la tarea de codificar o refactorizar estas funcionalidades:
1. **Verificar Tipos Canónicos:** Importar las interfaces desde `@zentry/shared` según se especifica en [`04_ALGORITHMIC_SCORING_AND_RECOMMENDATION_ENGINE_SPEC.md`](./04_ALGORITHMIC_SCORING_AND_RECOMMENDATION_ENGINE_SPEC.md).
2. **Respetar Umbrales Empíricos:**
   - Salto impulsivo (*Impulsive Skip*): $T_{\text{dwell}} < 6.0\text{ s}$.
   - Retención óptima de foco: $T_{\text{dwell}} \ge 25.0\text{ s}$.
   - Razón Variable de Refuerzo: Distribución centrada en $k = 7$ interacciones (VR-7).
3. **Citar Fuentes en la UI:** Las tarjetas de prescripción en el Dashboard Parental deben renderizar el botón *"Ver Sustento Científico"*, desplegando el título del paper, autores, revista y enlace activo DOI/PMID para dotar a la plataforma de autoridad médica y científica incontrovertible.
