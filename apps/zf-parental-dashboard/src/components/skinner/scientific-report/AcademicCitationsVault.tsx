import React, { useState } from 'react';
import { BookOpen, ChevronDown, ChevronUp, GraduationCap } from 'lucide-react';

interface CitationItem {
  id: string;
  indexCode: string;
  authorYear: string;
  title: string;
  publication: string;
  conceptTitle: string;
  executiveSummary: string;
  neuroMechanism: string;
  zentryTranslation: string;
}

export const AcademicCitationsVault: React.FC = () => {
  const [expandedId, setExpandedId] = useState<string | null>('cit_skinner_1953');

  const citations: CitationItem[] = [
    {
      id: 'cit_skinner_1953',
      indexCode: '[SKIN-1953]',
      authorYear: 'B.F. Skinner (1953)',
      title: 'Science and Human Behavior',
      publication: 'Macmillan / The Free Press, New York.',
      conceptTitle: 'Programas de Refuerzo de Razón Variable (Variable Ratio - VR)',
      executiveSummary:
        'Demostración empírica fundamental de que las recompensas administradas tras un número aleatorio e impredecible de respuestas motoras generan la tasa más alta de emisión conductual y la máxima resistencia a la extinción conductual.',
      neuroMechanism:
        'El organismo mantiene la expectativa dopaminérgica en estado activo continuo porque cualquier intento subsiguiente ("swipe" o palancazo) puede contener la recompensa de máximo valor.',
      zentryTranslation:
        'Demuestra a los padres que la resistencia del menor a soltar el dispositivo no es desobediencia voluntaria, sino condicionamiento operante de precisión algorítmica.',
    },
    {
      id: 'cit_schultz_1998',
      indexCode: '[SCHU-1998]',
      authorYear: 'Wolfram Schultz (1998)',
      title: 'Predictive Reward Signal of Dopamine Neurons',
      publication: 'Journal of Neurophysiology, 80(1), 1–27. https://doi.org/10.1152/jn.1998.80.1.1',
      conceptTitle: 'Error de Predicción de Recompensa Dopaminérgica (Reward Prediction Error - RPE)',
      executiveSummary:
        'Descubrimiento neurofisiológico de que las neuronas dopaminérgicas mesolímbicas no codifican el placer pasivo del estímulo, sino la discrepancia fásica entre la recompensa anticipada y la efectivamente recibida.',
      neuroMechanism:
        'La incertidumbre intrínseca al siguiente video corto genera descargas fásicas de dopamina en el núcleo accumbens previas al consumo del contenido, estimulando la compulsión de búsqueda.',
      zentryTranslation:
        'Explica con evidencia científica por qué los micro-videos en bucle generan mayor adicción que una película completa de 90 minutos: la anticipación continua de novedad secuestra el sistema de recompensa.',
    },
    {
      id: 'cit_twenge_2018',
      indexCode: '[TWEN-2018]',
      authorYear: 'Jean M. Twenge et al. (2018)',
      title: 'Increases in Depressive Symptoms, Suicide-Related Outcomes, and Suicide Rates Among U.S. Adolescents After 2010 and Links to New Media Screen Time',
      publication: 'Clinical Psychological Science, 6(1), 3–17. https://doi.org/10.1177/2167702617723376',
      conceptTitle: 'Fragmentación Atencional y Desregulación Afectiva por Pantallas',
      executiveSummary:
        'Investigación longitudinal poblacional que vincula el consumo intensivo de micro-contenidos sin pausas naturales con un acortamiento crítico de la ventana atencional, irritabilidad y perturbación de los ciclos circadianos infantiles.',
      neuroMechanism:
        'La sobreestimulación sensorial nocturna y la luz azul-violeta inhiben la secreción de melatonina pineal, suprimiendo las fases de sueño profundo (NREM 3) y consolidación mnémica en el hipocampo.',
      zentryTranslation:
        'Justifica el Modo Calidez Circadiano automático y los límites de consumo en horario nocturno integrados en Zentry para salvaguardar el descanso reparador del niño.',
    },
    {
      id: 'cit_alter_2017',
      indexCode: '[ALTE-2017]',
      authorYear: 'Adam Alter (2017)',
      title: 'Irresistible: The Rise of Addictive Technology and the Business of Keeping Us Hooked',
      publication: 'Penguin Press, New York / NYU Stern School of Business.',
      conceptTitle: 'Supresión Sistemática de Platos de Parada (Stopping Cues)',
      executiveSummary:
        'Análisis crítico de los patrones oscuros en el diseño de software que erradican deliberadamente los delimitadores naturales (finales de capítulo, páginas numeradas o cortes comerciales) mediante scroll infinito y reproducción ininterrumpida.',
      neuroMechanism:
        'Al eliminar las pausas estructurales, el lóbulo frontal en formación del menor nunca activa el control inhibitorio ejecutivo voluntario, manteniéndose en modo de navegación automática.',
      zentryTranslation:
        'Sustenta la función de Pausa Consciente de Zentry, que restituye deliberadamente "platos de parada" pedagógicos para devolver la deliberación consciente al menor.',
    },
    {
      id: 'cit_who_2019',
      indexCode: '[WHO-2019]',
      authorYear: 'Organización Mundial de la Salud (OMS / WHO) (2019)',
      title: 'Guidelines on Physical Activity, Sedentary Behaviour and Sleep for Children Under 5 Years of Age',
      publication: 'World Health Organization, Ginebra, Suiza. Licence: CC BY-NC-SA 3.0 IGO.',
      conceptTitle: 'Sustitución Activa: Del Sedentarismo Digital al Movimiento Físico',
      executiveSummary:
        'Directrices de salud pública infantil que establecen la necesidad urgente de limitar el tiempo sedentario pasivo frente a pantallas y reemplazarlo activamente por juego físico tridimensional no estructurado y socialización directa.',
      neuroMechanism:
        'El movimiento corporal en ambientes naturales estimula la neurogénesis en el hipocampo, mejora la propiocepción neuromuscular y promueve la integración interhemisférica.',
      zentryTranslation:
        'Directriz internacional que valida nuestro módulo de Hábitos en el Mundo Real (Offline) como el pilar fundamental del cierre de sesión en Zentry.',
    },
  ];

  return (
    <div className="glass-panel rounded-2xl p-6 border border-[#D6C8FA]/40 dark:border-[#D6C8FA]/20">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-violet-100 dark:bg-[#533B87]/40 border border-violet-200 dark:border-[#D6C8FA]/25 text-[#533B87] dark:text-[#D6C8FA]">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold uppercase tracking-wider text-[#533B87] dark:text-[#D6C8FA]">
              Fundamentación Académica Formal (5 Citas Indexadas)
            </h4>
            <p className="text-xs text-slate-600 dark:text-slate-400">
              Literatura científica revisada por pares que sustenta los modelos neuroconductuales de Zentry
            </p>
          </div>
        </div>

        <span className="text-xs font-mono font-bold text-[#533B87] dark:text-[#C2F4E7] bg-violet-50 dark:bg-[#533B87]/30 px-3 py-1 rounded-full border border-violet-200 dark:border-[#D6C8FA]/20 flex items-center gap-1.5">
          <GraduationCap className="w-3.5 h-3.5" />
          APA 7ma Edición
        </span>
      </div>

      <div className="space-y-3">
        {citations.map((cit) => {
          const isExpanded = expandedId === cit.id;
          return (
            <div
              key={cit.id}
              className="rounded-xl border border-slate-200 dark:border-[#D6C8FA]/15 bg-slate-50/70 dark:bg-[#080D1A]/60 overflow-hidden transition-all"
            >
              <button
                type="button"
                onClick={() => setExpandedId(isExpanded ? null : cit.id)}
                className="w-full p-4 text-left flex items-center justify-between gap-3 hover:bg-slate-100/60 dark:hover:bg-[#131B30]/60 transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <span className="px-2 py-0.5 rounded font-mono text-[11px] font-bold bg-violet-100 dark:bg-[#533B87]/50 text-[#533B87] dark:text-[#D6C8FA] shrink-0">
                    {cit.indexCode}
                  </span>
                  <div>
                    <h5 className="text-xs font-bold text-slate-900 dark:text-[#EBF1F5]">
                      {cit.authorYear} — {cit.conceptTitle}
                    </h5>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 italic truncate max-w-xl">
                      {cit.title} ({cit.publication})
                    </p>
                  </div>
                </div>

                <div className="text-slate-400 shrink-0">
                  {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </div>
              </button>

              {isExpanded && (
                <div className="px-4 pb-4 pt-1 border-t border-slate-200 dark:border-slate-800 text-xs space-y-3 bg-white/40 dark:bg-black/20">
                  <div>
                    <span className="font-bold text-[#533B87] dark:text-[#D6C8FA] block text-[11px] uppercase tracking-wide mb-0.5">
                      Resumen Ejecutivo de la Evidencia
                    </span>
                    <p className="text-slate-700 dark:text-slate-300 leading-relaxed text-[11px]">
                      {cit.executiveSummary}
                    </p>
                  </div>

                  <div className="p-3 rounded-xl bg-violet-50/80 dark:bg-[#533B87]/20 border border-violet-200/60 dark:border-[#D6C8FA]/20">
                    <span className="font-bold text-violet-900 dark:text-[#C2F4E7] block text-[11px] uppercase tracking-wide mb-0.5">
                      Mecanismo Neurobiológico Implicado
                    </span>
                    <p className="text-slate-700 dark:text-slate-300 leading-relaxed text-[11px]">
                      {cit.neuroMechanism}
                    </p>
                  </div>

                  <div className="p-3 rounded-xl bg-emerald-50/80 dark:bg-emerald-950/20 border border-emerald-200/60 dark:border-emerald-500/20">
                    <span className="font-bold text-emerald-900 dark:text-[#C2F4E7] block text-[11px] uppercase tracking-wide mb-0.5">
                      Traducción Pedagógica Zentry para la Familia
                    </span>
                    <p className="text-slate-700 dark:text-slate-300 leading-relaxed text-[11px]">
                      {cit.zentryTranslation}
                    </p>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
