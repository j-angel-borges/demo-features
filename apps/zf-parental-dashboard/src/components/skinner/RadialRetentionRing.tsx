import React from 'react';
import { Eye, Clock } from 'lucide-react';

interface RadialRetentionRingProps {
  retentionPct: number;
  elapsedSeconds: number;
  nominalDuration: number;
  color: string;
  label: string;
  offset: number;
}

export const RadialRetentionRing: React.FC<RadialRetentionRingProps> = ({
  retentionPct,
  elapsedSeconds,
  nominalDuration,
  color,
  label,
  offset,
}) => {
  const radius = 44;
  const circumference = 2 * Math.PI * radius;

  return (
    <div className="glass-panel rounded-2xl p-5 relative overflow-hidden border border-[#D6C8FA]/40 dark:border-[#D6C8FA]/20 flex flex-col justify-between">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-violet-100 dark:bg-[#533B87]/40 border border-violet-200 dark:border-[#D6C8FA]/25 text-[#533B87] dark:text-[#D6C8FA]">
            <Eye className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#533B87] dark:text-[#D6C8FA]">
              Retención de Video
            </h4>
            <p className="text-[11px] text-slate-600 dark:text-slate-400">Tiempo consumido vs duración</p>
          </div>
        </div>

        <span
          className="text-[10px] font-bold px-2 py-0.5 rounded-full border"
          style={{
            borderColor: color,
            backgroundColor: `${color}18`,
            color: color === '#C2F4E7' ? '#0D9488' : color,
          }}
        >
          {retentionPct >= 80 ? 'Completo' : retentionPct >= 40 ? 'En Progreso' : 'Salto Rápido'}
        </span>
      </div>

      {/* Radial SVG Ring */}
      <div className="flex items-center justify-center my-2 relative">
        <svg className="w-28 h-28 transform -rotate-90">
          {/* Background Track */}
          <circle
            cx="56"
            cy="56"
            r={radius}
            className="stroke-slate-200 dark:stroke-slate-800"
            strokeWidth="8"
            fill="transparent"
          />
          {/* Progress Indicator */}
          <circle
            cx="56"
            cy="56"
            r={radius}
            stroke={color}
            strokeWidth="8"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            fill="transparent"
            className="transition-all duration-500 ease-out"
            style={{
              filter: `drop-shadow(0 0 6px ${color}88)`,
            }}
          />
        </svg>

        {/* Center Percentage Display */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <span className="text-2xl font-mono font-bold text-slate-900 dark:text-[#EBF1F5] tracking-tight">
            {retentionPct}%
          </span>
          <span className="text-[10px] font-medium text-slate-500 dark:text-slate-400">Retención</span>
        </div>
      </div>

      {/* Time Breakdown Subtitle */}
      <div className="flex items-center justify-between text-[11px] text-slate-600 dark:text-slate-400 pt-2 border-t border-slate-200 dark:border-white/10">
        <div className="flex items-center gap-1.5">
          <Clock className="w-3.5 h-3.5 text-[#533B87] dark:text-[#D6C8FA]" />
          <span>
            {elapsedSeconds}s / <span className="text-[#533B87] dark:text-[#D6C8FA] font-semibold">{nominalDuration}s</span>
          </span>
        </div>
        <span className="text-[10px] font-bold" style={{ color: color === '#C2F4E7' ? '#0D9488' : color }}>
          {label}
        </span>
      </div>
    </div>
  );
};
