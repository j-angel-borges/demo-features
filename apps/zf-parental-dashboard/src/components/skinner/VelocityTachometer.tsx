import React from 'react';
import { Gauge, AlertTriangle, Zap } from 'lucide-react';
import type { TachometerReading } from '../../types';

interface VelocityTachometerProps {
  tachometer: TachometerReading;
}

export const VelocityTachometer: React.FC<VelocityTachometerProps> = ({ tachometer }) => {
  const { rpm, zone, needleAngle, statusText } = tachometer;

  const isAlert = zone === 'alert';
  const isWarning = zone === 'warning';

  return (
    <div
      className={`glass-panel rounded-2xl p-5 relative overflow-hidden border ${
        isAlert
          ? 'border-red-400 dark:border-[#F87171]/50 shadow-[0_0_25px_rgba(248,113,113,0.2)]'
          : isWarning
          ? 'border-amber-300 dark:border-[#FBBF24]/40'
          : 'border-[#D6C8FA]/40 dark:border-[#D6C8FA]/20'
      } flex flex-col justify-between transition-all duration-300`}
    >
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <div
            className={`p-1.5 rounded-lg border ${
              isAlert
                ? 'bg-red-100 border-red-200 text-red-700 dark:bg-[#F87171]/20 dark:border-[#F87171]/40 dark:text-[#F87171]'
                : isWarning
                ? 'bg-amber-100 border-amber-200 text-amber-800 dark:bg-[#FBBF24]/20 dark:border-[#FBBF24]/40 dark:text-[#FBBF24]'
                : 'bg-violet-100 border-violet-200 text-[#533B87] dark:bg-[#533B87]/40 dark:border-[#D6C8FA]/25 dark:text-[#D6C8FA]'
            }`}
          >
            {isAlert ? <Zap className="w-4 h-4 animate-bounce" /> : <Gauge className="w-4 h-4" />}
          </div>
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#533B87] dark:text-[#D6C8FA]">
              Tacómetro de Velocidad
            </h4>
            <p className="text-[11px] text-slate-600 dark:text-slate-400">Frecuencia de scroll (RPM)</p>
          </div>
        </div>

        <span
          className={`text-xs font-mono font-bold px-2 py-0.5 rounded-full border ${
            isAlert
              ? 'bg-red-50 border-red-300 text-red-800 dark:bg-[#F87171]/20 dark:border-[#F87171]/50 dark:text-[#F87171] animate-pulse'
              : isWarning
              ? 'bg-amber-50 border-amber-300 text-amber-800 dark:bg-[#FBBF24]/20 dark:border-[#FBBF24]/40 dark:text-[#FBBF24]'
              : 'bg-emerald-50 border-emerald-300 text-emerald-800 dark:bg-[#C2F4E7]/20 dark:border-[#C2F4E7]/40 dark:text-[#C2F4E7]'
          }`}
        >
          {rpm.toFixed(1)} RPM
        </span>
      </div>

      {/* Speedometer Arc Gauge Visual */}
      <div className="my-2 flex flex-col items-center justify-center relative">
        <svg viewBox="0 0 200 110" className="w-44 h-24 overflow-visible">
          <defs>
            <linearGradient id="tachGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#10B981" />
              <stop offset="45%" stopColor="#F59E0B" />
              <stop offset="85%" stopColor="#EF4444" />
            </linearGradient>
          </defs>

          {/* Background Arc Track */}
          <path
            d="M 20 100 A 80 80 0 0 1 180 100"
            fill="none"
            className="stroke-slate-200 dark:stroke-slate-800"
            strokeWidth="14"
            strokeLinecap="round"
          />

          {/* Active Gradient Arc Track */}
          <path
            d="M 20 100 A 80 80 0 0 1 180 100"
            fill="none"
            stroke="url(#tachGrad)"
            strokeWidth="10"
            strokeLinecap="round"
            strokeDasharray="251.2"
            strokeDashoffset={Math.max(0, 251.2 - ((Math.min(rpm, 180) / 180) * 251.2))}
            style={{
              transition: 'stroke-dashoffset 0.4s ease-out',
            }}
          />

          {/* Zone Dividers */}
          <line x1="20" y1="100" x2="30" y2="100" className="stroke-slate-400 dark:stroke-[#080D1A]" strokeWidth="2" />
          <line x1="100" y1="20" x2="100" y2="30" className="stroke-slate-400 dark:stroke-[#080D1A]" strokeWidth="2" />
          <line x1="180" y1="100" x2="170" y2="100" className="stroke-slate-400 dark:stroke-[#080D1A]" strokeWidth="2" />

          {/* Needle */}
          <g
            transform={`translate(100, 100) rotate(${needleAngle})`}
            style={{ transition: 'transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)' }}
          >
            <polygon points="-3,-10 3,-10 1,-75 -1,-75" fill="#533B87" className="dark:fill-[#EBF1F5]" filter="drop-shadow(0 0 4px rgba(83,59,135,0.4))" />
            <circle cx="0" cy="0" r="7" fill="#533B87" stroke="#D6C8FA" strokeWidth="2" />
            <circle cx="0" cy="0" r="3" fill="#C2F4E7" />
          </g>
        </svg>

        {/* Legend Scale */}
        <div className="w-full flex justify-between px-3 -mt-2 text-[9px] font-mono text-slate-600 dark:text-slate-400 font-semibold">
          <span>0 (Calmo)</span>
          <span>15+ (Dopamina)</span>
          <span>180 RPM</span>
        </div>
      </div>

      {/* Alert Banner */}
      <div
        className={`flex items-center gap-1.5 p-2 rounded-xl text-[11px] font-semibold mt-1 border ${
          isAlert
            ? 'bg-red-50 border-red-200 text-red-700 dark:bg-red-950/40 dark:border-red-500/30 dark:text-red-300 animate-pulse'
            : isWarning
            ? 'bg-amber-50 border-amber-200 text-amber-800 dark:bg-amber-950/40 dark:border-amber-500/30 dark:text-amber-300'
            : 'bg-emerald-50 border-emerald-200 text-emerald-800 dark:bg-emerald-950/40 dark:border-emerald-500/30 dark:text-emerald-300'
        }`}
      >
        {isAlert && <AlertTriangle className="w-3.5 h-3.5 shrink-0" />}
        <span className="truncate">{statusText}</span>
      </div>
    </div>
  );
};
