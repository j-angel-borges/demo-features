import React, { useMemo } from 'react';
import { TrendingDown, Star, Sparkles } from 'lucide-react';
import type { DecayCurvePoint } from '@zentry/shared';

interface DecayCurveChartProps {
  decayCurveData: DecayCurvePoint[];
  currentScroll: number;
}

export const DecayCurveChart: React.FC<DecayCurveChartProps> = ({
  decayCurveData,
  currentScroll,
}) => {
  const width = 540;
  const height = 180;
  const padding = { top: 25, right: 30, bottom: 30, left: 45 };

  // Compute boundaries
  const maxScroll = Math.max(50, currentScroll + 5, ...decayCurveData.map((d) => d.scrollIndex));
  const maxDuration = 50; // max seconds scale

  const xScale = (scrollIdx: number) => {
    return padding.left + (scrollIdx / maxScroll) * (width - padding.left - padding.right);
  };

  const yScale = (durationSec: number) => {
    return height - padding.bottom - (durationSec / maxDuration) * (height - padding.top - padding.bottom);
  };

  // Generate SVG polyline string for nominal duration line
  const polylinePoints = useMemo(() => {
    if (decayCurveData.length === 0) return '';
    return decayCurveData
      .map((p) => `${xScale(p.scrollIndex).toFixed(1)},${yScale(p.nominalDurationSeconds).toFixed(1)}`)
      .join(' ');
  }, [decayCurveData, maxScroll]);

  // Generate SVG polyline string for actual watched duration
  const actualPolylinePoints = useMemo(() => {
    if (decayCurveData.length === 0) return '';
    return decayCurveData
      .map((p) => `${xScale(p.scrollIndex).toFixed(1)},${yScale(p.actualViewSeconds).toFixed(1)}`)
      .join(' ');
  }, [decayCurveData, maxScroll]);

  const latestPoint = decayCurveData[decayCurveData.length - 1] || {
    scrollIndex: 0,
    nominalDurationSeconds: 45,
    actualViewSeconds: 40,
    retentionPct: 88,
    isJackpot: false,
    timestamp: Date.now(),
  };

  return (
    <div className="glass-panel rounded-2xl p-5 relative overflow-hidden border border-[#D6C8FA]/40 dark:border-[#D6C8FA]/20 flex flex-col justify-between">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-violet-100 dark:bg-[#533B87]/40 border border-violet-200 dark:border-[#D6C8FA]/25 text-[#533B87] dark:text-[#D6C8FA]">
            <TrendingDown className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#533B87] dark:text-[#D6C8FA]">
              Curva de Decaimiento Temporal en Vivo
            </h4>
            <p className="text-[11px] text-slate-600 dark:text-slate-400">
              Fragmentación de atención: 45s (Educativo) → 5s (Dopamínico) con Jackpots VR-7
            </p>
          </div>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-3 text-[10px]">
          <div className="flex items-center gap-1">
            <span className="w-2.5 h-1 bg-[#533B87] dark:bg-[#D6C8FA] rounded-full inline-block" />
            <span className="text-slate-700 dark:text-slate-300 font-medium">Nominal</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-2.5 h-1 bg-[#10B981] dark:bg-[#C2F4E7] rounded-full inline-block" />
            <span className="text-slate-700 dark:text-slate-300 font-medium">Vista Real</span>
          </div>
          <div className="flex items-center gap-1 text-amber-700 dark:text-[#FBBF24] font-bold">
            <Star className="w-3 h-3 fill-amber-500" />
            <span>Jackpot</span>
          </div>
        </div>
      </div>

      {/* SVG Chart */}
      <div className="w-full overflow-x-auto my-1">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-44 overflow-visible"
        >
          <defs>
            <linearGradient id="areaGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#533B87" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#533B87" stopOpacity="0.0" />
            </linearGradient>
            <filter id="pulseGlow" x="-30%" y="-30%" width="160%" height="160%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Grid Lines */}
          {[10, 20, 30, 40, 50].map((val) => (
            <g key={`y-grid-${val}`}>
              <line
                x1={padding.left}
                y1={yScale(val)}
                x2={width - padding.right}
                y2={yScale(val)}
                className="stroke-slate-300 dark:stroke-[#533B87]"
                strokeOpacity="0.5"
                strokeDasharray="3 3"
              />
              <text
                x={padding.left - 8}
                y={yScale(val) + 3}
                className="fill-slate-600 dark:fill-slate-400"
                fontSize="9"
                fontFamily="monospace"
                textAnchor="end"
              >
                {val}s
              </text>
            </g>
          ))}

          {/* X Grid Lines & Labels */}
          {[0, 10, 20, 30, 40, 50].filter((v) => v <= maxScroll).map((val) => (
            <g key={`x-grid-${val}`}>
              <line
                x1={xScale(val)}
                y1={padding.top}
                x2={xScale(val)}
                y2={height - padding.bottom}
                className="stroke-slate-300 dark:stroke-[#533B87]"
                strokeOpacity="0.5"
              />
              <text
                x={xScale(val)}
                y={height - padding.bottom + 14}
                className="fill-slate-600 dark:fill-slate-400"
                fontSize="9"
                fontFamily="monospace"
                textAnchor="middle"
              >
                #{val}
              </text>
            </g>
          ))}

          {/* Base Axes */}
          <line
            x1={padding.left}
            y1={height - padding.bottom}
            x2={width - padding.right}
            y2={height - padding.bottom}
            className="stroke-slate-400 dark:stroke-[#D6C8FA]"
            strokeOpacity="0.5"
          />
          <line
            x1={padding.left}
            y1={padding.top}
            x2={padding.left}
            y2={height - padding.bottom}
            className="stroke-slate-400 dark:stroke-[#D6C8FA]"
            strokeOpacity="0.5"
          />

          {/* Lines */}
          {actualPolylinePoints && (
            <polyline
              fill="none"
              stroke="#10B981"
              className="dark:stroke-[#C2F4E7]"
              strokeWidth="2"
              strokeDasharray="4 2"
              strokeOpacity="0.9"
              points={actualPolylinePoints}
            />
          )}

          {polylinePoints && (
            <polyline
              fill="none"
              stroke="#533B87"
              className="dark:stroke-[#D6C8FA]"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              points={polylinePoints}
            />
          )}

          {/* Data Points */}
          {decayCurveData.map((p, idx) => {
            const cx = xScale(p.scrollIndex);
            const cy = yScale(p.nominalDurationSeconds);
            const cyActual = yScale(p.actualViewSeconds);

            return (
              <g key={`point-${idx}`}>
                {/* Connector line between nominal and actual */}
                <line
                  x1={cx}
                  y1={cy}
                  x2={cx}
                  y2={cyActual}
                  stroke="#533B87"
                  strokeWidth="1"
                  strokeOpacity="0.6"
                />

                {/* Actual view point */}
                <circle
                  cx={cx}
                  cy={cyActual}
                  r="3.5"
                  fill={p.retentionPct >= 80 ? '#10B981' : p.retentionPct >= 40 ? '#F59E0B' : '#EF4444'}
                  stroke="#FFFFFF"
                  strokeWidth="1"
                />

                {/* Nominal Point or Jackpot Star */}
                {p.isJackpot ? (
                  <g transform={`translate(${cx - 7}, ${cy - 7})`}>
                    <polygon
                      points="7,0 9,5 14,5 10,8 12,13 7,10 2,13 4,8 0,5 5,5"
                      fill="#F59E0B"
                      stroke="#FFFFFF"
                      strokeWidth="0.8"
                      filter="url(#pulseGlow)"
                    />
                  </g>
                ) : (
                  <circle
                    cx={cx}
                    cy={cy}
                    r="4"
                    fill="#533B87"
                    stroke="#D6C8FA"
                    strokeWidth="1.5"
                  />
                )}
              </g>
            );
          })}

          {/* Live Pulsing Head Cursor */}
          <g transform={`translate(${xScale(latestPoint.scrollIndex)}, ${yScale(latestPoint.nominalDurationSeconds)})`}>
            <circle r="9" fill="#533B87" fillOpacity="0.4" className="animate-ping" />
            <circle r="5.5" fill="#533B87" className="dark:fill-[#D6C8FA]" stroke="#FFFFFF" strokeWidth="1.5" filter="url(#pulseGlow)" />
          </g>
        </svg>
      </div>

      {/* Footer Metrics */}
      <div className="flex items-center justify-between text-[11px] text-slate-600 dark:text-slate-400 pt-2 border-t border-slate-200 dark:border-white/10">
        <span className="flex items-center gap-1 text-[#533B87] dark:text-[#D6C8FA] font-bold">
          <Sparkles className="w-3.5 h-3.5 text-[#1B6E5E] dark:text-[#C2F4E7]" />
          Punto Actual: Scroll #{latestPoint.scrollIndex} ({latestPoint.nominalDurationSeconds}s target)
        </span>
        <span className="font-mono text-[#1B6E5E] dark:text-[#C2F4E7] font-bold">
          Retención de Punto: {latestPoint.retentionPct}%
        </span>
      </div>
    </div>
  );
};
