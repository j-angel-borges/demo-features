import React, { useState } from 'react';
import { Compass, Leaf, FlaskConical, Palette, Trophy, CalendarCheck, Clock, BookOpen } from 'lucide-react';
import { CANONICAL_SCIENTIFIC_PAPERS } from '@zentry/shared';

interface OfflineHabitRecommendationsProps {
  topicDistribution: Record<string, number>;
  totalScrolls?: number;
}

export interface HabitCard {
  id: string;
  category: 'naturaleza' | 'ciencia' | 'arte' | 'deportes';
  title: string;
  sourceTopic: string;
  badgeLabel: string;
  icon: React.ReactNode;
  color: string;
  description: string;
  neuroGoal: string;
  materials: string;
  timeEstimate: string;
  actionCall: string;
  citation?: {
    authors: string;
    year: number;
    title: string;
    journal: string;
    doi: string;
    keyFinding: string;
  };
}

export const cardNat01: HabitCard = {
  id: 'hab_nat_01',
  category: 'naturaleza',
  title: 'Expedición a Reserva Ecológica o Zoológico / Acuario Local',
  sourceTopic: 'Biología Marina & Vida Silvestre',
  badgeLabel: 'Naturaleza & Biodiversidad',
  icon: <Leaf className="w-4 h-4" />,
  color: '#10B981',
  description:
    'Traslada el interés visual por ballenas y vida salvaje al mundo físico tridimensional. Visita un acuario, zoológico o reserva botánica para observar conductas animales reales sin filtros algorítmicos.',
  neuroGoal: 'Restaura la atención tónica sostenida mediante estimulación sensorial no artificial multicanal.',
  materials: 'Lupa infantil, libreta de notas, binoculares o guía ilustrada de aves.',
  timeEstimate: 'Sábado o Domingo (2 - 3 horas)',
  actionCall: 'Planificar expedición de fin de semana',
  citation: CANONICAL_SCIENTIFIC_PAPERS.KAPLAN_1995_ART,
};

export const cardNat02: HabitCard = {
  id: 'hab_nat_02',
  category: 'naturaleza',
  title: 'Safari Botánico Urbano & Bitácora de Campo Ilustrada',
  sourceTopic: 'Exploración Botánica',
  badgeLabel: 'Naturaleza & Observación',
  icon: <Compass className="w-4 h-4" />,
  color: '#10B981',
  description:
    'Recorrer un parque o jardín cercano para recolectar hojas, identificar especies nativas y dibujar a mano en una libreta de explorador las texturas de cortezas y plantas.',
  neuroGoal: 'Entrena la observación pasiva y reduce la necesidad de retroalimentación de recompensa inmediata.',
  materials: 'Cuaderno de dibujo, lápices de grafito o colores, cinta adhesiva para muestras secas.',
  timeEstimate: '45 minutos al aire libre',
  actionCall: 'Crear la libreta de explorador hoy',
  citation: CANONICAL_SCIENTIFIC_PAPERS.FOWLER_2026_ABCD,
};

export const cardSci01: HabitCard = {
  id: 'hab_sci_01',
  category: 'ciencia',
  title: 'Laboratorio Casero: Volcán Eruptivo & Prisma Óptico Casero',
  sourceTopic: 'Ciencia & Experimentos Físicos',
  badgeLabel: 'Ciencia Experimental',
  icon: <FlaskConical className="w-4 h-4" />,
  color: '#3B82F6',
  description:
    'Reemplaza los videos de curiosidades aceleradas con física y química tangible: erupción controlada de bicarbonato con vinagre, descomposición de luz blanca con agua y espejo, o lámpara de lava con aceite.',
  neuroGoal: 'Estimula el razonamiento causal secuencial y entrena la tolerancia a la frustración empírica.',
  materials: 'Bicarbonato de sodio, vinagre, colorante vegetal, linterna, vaso transparente.',
  timeEstimate: '60 minutos en familia',
  actionCall: 'Agendar tarde de experimentos caseros',
  citation: CANONICAL_SCIENTIFIC_PAPERS.ZIMMERMAN_2002,
};

export const cardArt01: HabitCard = {
  id: 'hab_art_01',
  category: 'arte',
  title: 'Taller de Modelado con Arcilla / Plastilina & Pintura al Óleo',
  sourceTopic: 'Arte & Creatividad Táctil',
  badgeLabel: 'Expresión Tridimensional',
  icon: <Palette className="w-4 h-4" />,
  color: '#EC4899',
  description:
    'Modelar con arcilla o plastilina los personajes o criaturas observadas en los videos. La resistencia física del material reactiva la propiocepción y canaliza la motricidad impulsiva.',
  neuroGoal: 'Desarrolla la motricidad fina, paciencia constructiva y memoria espacial profunda.',
  materials: 'Arcilla de secado al aire o plastilina no tóxica, témperas, pinceles y mantel.',
  timeEstimate: '90 minutos en mesa de trabajo',
  actionCall: 'Preparar rincón de modelado',
  citation: CANONICAL_SCIENTIFIC_PAPERS.CHRISTAKIS_2019,
};

export const cardDep01: HabitCard = {
  id: 'hab_dep_01',
  category: 'deportes',
  title: 'Circuito de Agilidad Motora en Parque & Deportes en Equipo',
  sourceTopic: 'Acción, Velocidad & Gaming',
  badgeLabel: 'Actividad Motora Grupal',
  icon: <Trophy className="w-4 h-4" />,
  color: '#F59E0B',
  description:
    'Canaliza la necesidad de velocidad e hiperactividad con esfuerzo físico cardiovascular real: partido de fútbol, básquetbol, patinaje o circuito de carreras de obstáculos con amigos.',
  neuroGoal: 'Libera endorfinas y dopamina natural por esfuerzo motor, mitigando el síndrome de abstinencia digital.',
  materials: 'Balón deportivo, conos o botellas plásticas para marcar obstáculos, calzado deportivo.',
  timeEstimate: '2 horas en campo abierto',
  actionCall: 'Organizar salida deportiva familiar',
  citation: CANONICAL_SCIENTIFIC_PAPERS.XIAO_2026_BRAIN_BEHAV,
};

export function generateOfflineHabits(topicDistribution: Record<string, number>): HabitCard[] {
  const topics = Object.entries(topicDistribution || {});
  const list: HabitCard[] = [];

  const hasTopic = (keywords: string[]) => {
    return topics.some(([t]) =>
      keywords.some((k) => t.toLowerCase().includes(k.toLowerCase()))
    );
  };

  // 1. Matched primary cards (1 per matched domain)
  if (
    hasTopic(['biolog', 'ballena', 'océano', 'oceano', 'naturaleza', 'animal', 'selva', 'fauna']) ||
    topics.length === 0
  ) {
    list.push(cardNat01);
  }
  if (
    hasTopic(['ciencia', 'espacio', 'químic', 'quimic', 'física', 'fisica', 'experimento', 'robot', 'astronom']) ||
    topics.length === 0
  ) {
    list.push(cardSci01);
  }
  if (
    hasTopic(['arte', 'pintura', 'dibujo', 'modelado', 'música', 'musica', 'creativ', 'animac', 'manualidad']) ||
    topics.length === 0
  ) {
    list.push(cardArt01);
  }
  if (
    hasTopic(['deporte', 'gaming', 'juego', 'carrera', 'futbol', 'fútbol', 'accion', 'acción', 'shorts']) ||
    topics.length === 0
  ) {
    list.push(cardDep01);
  }

  // 2. Fill remaining slots up to 4 cards if list has fewer than 4
  const fallbacks = [cardNat02, cardSci01, cardArt01, cardDep01, cardNat01];
  for (const fb of fallbacks) {
    if (list.length >= 4) break;
    if (!list.some((item) => item.id === fb.id)) {
      list.push(fb);
    }
  }

  return list.slice(0, 4);
}

export const OfflineHabitRecommendations: React.FC<OfflineHabitRecommendationsProps> = ({
  topicDistribution,
}) => {
  const [expandedCitationId, setExpandedCitationId] = useState<string | null>(null);

  const getRecommendations = (): HabitCard[] => {
    return generateOfflineHabits(topicDistribution);
  };

  const recommendations = getRecommendations();

  return (
    <div className="glass-panel rounded-2xl p-6 border border-[#D6C8FA]/40 dark:border-[#D6C8FA]/20">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-emerald-100 dark:bg-[#10B981]/30 border border-emerald-200 dark:border-[#10B981]/40 text-emerald-700 dark:text-[#C2F4E7]">
            <Compass className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold uppercase tracking-wider text-[#533B87] dark:text-[#D6C8FA]">
              Recomendaciones de Hábitos en el Mundo Real (Offline)
            </h4>
            <p className="text-xs text-slate-600 dark:text-slate-400">
              Actividades físicas familiares generadas automáticamente a partir de los temas consumidos
            </p>
          </div>
        </div>

        <span className="text-xs font-bold text-slate-600 dark:text-slate-300 flex items-center gap-1">
          <CalendarCheck className="w-4 h-4 text-emerald-500" />
          Plan de Compensación Conductual
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {recommendations.map((habit) => (
          <div
            key={habit.id}
            className="p-4 rounded-xl bg-slate-50 dark:bg-[#080D1A]/70 border border-slate-200 dark:border-[#D6C8FA]/15 flex flex-col justify-between hover:border-violet-300 dark:hover:border-[#D6C8FA]/40 transition-all shadow-sm"
          >
            <div>
              <div className="flex items-center justify-between gap-2 mb-2">
                <span
                  className="px-2.5 py-0.5 rounded-md text-[10px] font-bold flex items-center gap-1"
                  style={{
                    backgroundColor: `${habit.color}15`,
                    color: habit.color,
                    border: `1px solid ${habit.color}35`,
                  }}
                >
                  {habit.icon}
                  {habit.badgeLabel}
                </span>
                <span className="text-[10px] text-slate-500 dark:text-slate-400 flex items-center gap-1 font-mono">
                  <Clock className="w-3 h-3" />
                  {habit.timeEstimate}
                </span>
              </div>

              <h5 className="text-xs font-bold text-slate-900 dark:text-[#EBF1F5] mb-1.5 leading-snug">
                {habit.title}
              </h5>

              <p className="text-xs text-slate-600 dark:text-slate-300 mb-3 leading-relaxed">
                {habit.description}
              </p>

              <div className="p-2.5 rounded-lg bg-white/70 dark:bg-[#131B30]/70 border border-slate-200 dark:border-slate-800 text-[11px] space-y-1 mb-3">
                <div className="text-slate-700 dark:text-slate-300">
                  <strong className="text-[#533B87] dark:text-[#C2F4E7]">Impacto Neurológico:</strong>{' '}
                  {habit.neuroGoal}
                </div>
                <div className="text-slate-500 dark:text-slate-400">
                  <strong className="text-slate-700 dark:text-slate-300">Materiales:</strong>{' '}
                  {habit.materials}
                </div>
              </div>

              {/* Expandable Scientific Citation Badge (DOC_TECNICO Section 6.2) */}
              {habit.citation && (
                <div className="mb-3 pt-2 border-t border-slate-200/60 dark:border-slate-800/60">
                  <button
                    type="button"
                    onClick={() => setExpandedCitationId(expandedCitationId === habit.id ? null : habit.id)}
                    className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-violet-100/70 hover:bg-violet-200/70 dark:bg-[#533B87]/30 dark:hover:bg-[#533B87]/50 text-[#533B87] dark:text-[#C2F4E7] border border-violet-200/60 dark:border-[#D6C8FA]/20 flex items-center gap-1.5 transition-all cursor-pointer"
                  >
                    <BookOpen className="w-3 h-3 text-[#533B87] dark:text-[#C2F4E7]" />
                    <span>{expandedCitationId === habit.id ? 'Ocultar Fundamento Científico' : 'Ver Fundamento Científico (Paper)'}</span>
                  </button>
                  {expandedCitationId === habit.id && (
                    <div className="mt-2 p-2.5 rounded-lg bg-white/90 dark:bg-slate-900/90 border border-[#D6C8FA]/40 dark:border-[#D6C8FA]/20 text-[10px] space-y-1 animate-fadeIn">
                      <div className="font-bold text-slate-800 dark:text-white">
                        {habit.citation.authors} ({habit.citation.year}). {habit.citation.title}
                      </div>
                      <div className="text-slate-600 dark:text-slate-300 italic">
                        {habit.citation.journal}
                      </div>
                      <div className="text-slate-700 dark:text-slate-300">
                        <strong className="text-[#533B87] dark:text-[#C2F4E7]">Hallazgo clave:</strong> {habit.citation.keyFinding}
                      </div>
                      <div>
                        <a
                          href={habit.citation.doi}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-violet-600 dark:text-[#C2F4E7] hover:underline font-mono text-[9px]"
                        >
                          DOI: {habit.citation.doi}
                        </a>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="pt-2 border-t border-slate-200 dark:border-slate-800/80 flex items-center justify-between text-xs">
              <span className="text-[10px] text-slate-500 dark:text-slate-400 truncate max-w-[180px]">
                Derivado de: <strong>{habit.sourceTopic}</strong>
              </span>
              <button
                type="button"
                className="px-2.5 py-1 rounded-lg bg-violet-100 hover:bg-violet-200 dark:bg-[#533B87]/40 dark:hover:bg-[#533B87]/60 text-[#533B87] dark:text-[#D6C8FA] font-bold text-[11px] transition-all cursor-pointer"
              >
                {habit.actionCall}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
