import React, { useMemo } from 'react';
import { Gauge, Info } from 'lucide-react';
import type { SkinnerSessionRecord } from '@zentry/shared';

interface DigitalHealthTrafficLightProps {
  session: SkinnerSessionRecord;
}

export const DigitalHealthTrafficLight: React.FC<DigitalHealthTrafficLightProps> = ({ session }) => {
  const {
    meanViewSeconds,
    healthScore,
    needleAngle,
    zoneLabel,
    zoneColor,
    fragmentationPct,
    diagnosticText,
  } = useMemo(() => {
    const points = session.decayCurveData || [];
    let meanSec = 0;
    if (points.length > 0) {
      const sum = points.reduce((acc, p) => acc + (p.actualViewSeconds || 0), 0);
      meanSec = sum / points.length;
    } else if (session.totalScrolls > 0) {
      meanSec = (session.totalDurationSeconds || 0) / session.totalScrolls;
    } else {
      meanSec = ((session.averageRetentionPct || 70) / 100) * (session.activeNominalDuration || 45);
    }

    // Continuous score calibration [0, 100]
    let score = 0;
    if (meanSec >= 30) {
      score = Math.min(100, 80 + ((meanSec - 30) / 15) * 20);
    } else if (meanSec >= 15) {
      score = 50 + ((meanSec - 15) / 15) * 30;
    } else if (meanSec >= 8) {
      score = 25 + ((meanSec - 8) / 7) * 25;
    } else {
      score = Math.max(0, (meanSec / 8) * 25);
    }

    // Needle Angle [-90 deg, +90 deg]
    const angle = -90 + (score / 100) * 180;

    // Fragmentation Rate (< 8s)
    const fastSkips = points.filter((p) => (p.actualViewSeconds || 0) < 8).length;
    const fragPct =
      points.length > 0
        ? Math.round((fastSkips / points.length) * 100)
        : meanSec < 8
        ? 85
        : 15;

    // Zone derivation
    let label = 'Consumo Consciente';
    let color = '#10B981';
    let diagnostic =
      'El menor mantiene un procesamiento atencional profundo y voluntario (>30s por estímulo). La capacidad de retención prefrontal no presenta signos de captura compulsiva.';

    if (meanSec < 8) {
      label = 'Doomscrolling Hiper-fragmentado';
      color = '#EF4444';
      diagnostic =
        'Alerta de Condicionamiento Operante Severo (<8s por video). El menor ejecuta palancazos compulsivos buscando picos inmediatos de dopamina fásica sin procesar la información.';
    } else if (meanSec < 15) {
      label = 'Búsqueda Acelerada de Novedad';
      color = '#F97316';
      diagnostic =
        'Impaciencia dopaminérgica emergente (8s - 15s). Descarte acelerado de contenidos cuando el gancho inmediato decae. Umbral de riesgo de fatiga cognitiva.';
    } else if (meanSec < 30) {
      label = 'Atención Fluctuante (Transición)';
      color = '#F59E0B';
      diagnostic =
        'Nivel de exploración selectiva moderada (15s - 30s). Atención mixta con momentos de concentración alternados con saltos exploratorios.';
    }

    return {
      meanViewSeconds: meanSec,
      healthScore: Math.round(score),
      needleAngle: angle,
      zoneLabel: label,
      zoneColor: color,
      fragmentationPct: fragPct,
      diagnosticText: diagnostic,
    };
  }, [session]);

  return (
    <div className="glass-panel rounded-2xl p-6 border border-[#D6C8FA]/40 dark:border-[#D6C8FA]/20 relative overflow-hidden">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-violet-100 dark:bg-[#533B87]/40 border border-violet-200 dark:border-[#D6C8FA]/25 text-[#533B87] dark:text-[#D6C8FA]">
            <Gauge className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold uppercase tracking-wider text-[#533B87] dark:text-[#D6C8FA]">
              Semáforo Continuo de Salud Digital
            </h4>
            <p className="text-xs text-slate-600 dark:text-slate-400">
              Calibración continua de Verde (Consciente &gt;30s) a Rojo (Doomscrolling &lt;8s)
            </p>
          </div>
        </div>

        {/* Live Zone Status Badge */}
        <div
          className="px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 shadow-sm"
          style={{
            backgroundColor: `${zoneColor}18`,
            color: zoneColor,
            border: `1px solid ${zoneColor}40`,
          }}
        >
          <span className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: zoneColor }} />
          <span>{zoneLabel}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
        {/* SVG Continuous Semi-Circular Gauge */}
        <div className="lg:col-span-6 flex flex-col items-center justify-center relative">
          <svg viewBox="0 0 240 140" className="w-full max-w-[280px]">
            <defs>
              <linearGradient id="trafficLightGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#EF4444" />
                <stop offset="30%" stopColor="#F97316" />
                <stop offset="65%" stopColor="#F59E0B" />
                <stop offset="100%" stopColor="#10B981" />
              </linearGradient>
            </defs>

            {/* Gauge Background Track */}
            <path
              d="M 20 120 A 100 100 0 0 1 220 120"
              fill="none"
              stroke="#E2E8F0"
              strokeWidth="16"
              strokeLinecap="round"
              className="dark:stroke-[#1E293B]"
            />

            {/* Continuous Color Gradient Arc */}
            <path
              d="M 20 120 A 100 100 0 0 1 220 120"
              fill="none"
              stroke="url(#trafficLightGradient)"
              strokeWidth="16"
              strokeLinecap="round"
              strokeDasharray="314.16"
              strokeDashoffset="0"
            />

            {/* Dial Needle */}
            <g transform={`rotate(${needleAngle}, 120, 120)`} className="transition-transform duration-700 ease-out">
              <line
                x1="120"
                y1="120"
                x2="120"
                y2="32"
                stroke="#4A5160"
                strokeWidth="4"
                strokeLinecap="round"
                className="dark:stroke-white"
              />
              <polygon points="116,35 124,35 120,24" fill={zoneColor} />
              <circle cx="120" cy="120" r="10" fill="#533B87" stroke="#FFFFFF" strokeWidth="3" />
            </g>

            {/* Threshold Numerical Annotations */}
            <text x="20" y="136" fontSize="10" fill="#EF4444" fontWeight="bold">
              0s (Rojo)
            </text>
            <text x="75" y="55" fontSize="9" fill="#F97316" fontWeight="bold">
              8s
            </text>
            <text x="120" y="20" fontSize="9" fill="#F59E0B" fontWeight="bold" textAnchor="middle">
              15s
            </text>
            <text x="175" y="55" fontSize="9" fill="#10B981" fontWeight="bold">
              &gt;30s (Verde)
            </text>
          </svg>

          {/* Large Digital Metric */}
          <div className="text-center mt-1">
            <div className="text-3xl font-extrabold font-mono" style={{ color: zoneColor }}>
              {meanViewSeconds.toFixed(1)}s
            </div>
            <p className="text-xs font-semibold text-slate-600 dark:text-slate-300">
              Retención Media por Video
            </p>
          </div>
        </div>

        {/* Diagnostic Breakdown & Analytics */}
        <div className="lg:col-span-6 space-y-3">
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-[#080D1A]/80 border border-slate-200 dark:border-[#D6C8FA]/15">
            <div className="flex items-start gap-2.5">
              <Info className="w-4 h-4 mt-0.5 shrink-0" style={{ color: zoneColor }} />
              <div>
                <h5 className="text-xs font-bold text-slate-800 dark:text-[#EBF1F5] mb-1">
                  Diagnóstico Clínico-Conductual
                </h5>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  {diagnosticText}
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#080D1A]/60 border border-slate-200 dark:border-[#D6C8FA]/15">
              <span className="text-slate-500 dark:text-slate-400 block text-[11px]">Salud Digital Zentry</span>
              <span className="text-lg font-bold font-mono text-[#533B87] dark:text-[#C2F4E7]">
                {healthScore} / 100
              </span>
            </div>
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#080D1A]/60 border border-slate-200 dark:border-[#D6C8FA]/15">
              <span className="text-slate-500 dark:text-slate-400 block text-[11px]">Tasa Fragmentación (&lt;8s)</span>
              <span className="text-lg font-bold font-mono text-rose-500">
                {fragmentationPct}%
              </span>
            </div>
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#080D1A]/60 border border-slate-200 dark:border-[#D6C8FA]/15">
              <span className="text-slate-500 dark:text-slate-400 block text-[11px]">Velocidad de Scroll</span>
              <span className="text-lg font-bold font-mono text-[#533B87] dark:text-[#D6C8FA]">
                {(session.currentScrollVelocity || 0).toFixed(1)} RPM
              </span>
            </div>
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#080D1A]/60 border border-slate-200 dark:border-[#D6C8FA]/15">
              <span className="text-slate-500 dark:text-slate-400 block text-[11px]">Palancazos Acumulados</span>
              <span className="text-lg font-bold font-mono text-slate-900 dark:text-white">
                {session.totalScrolls} scrolls
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
