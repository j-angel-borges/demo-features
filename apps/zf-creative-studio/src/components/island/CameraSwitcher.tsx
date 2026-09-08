import React from 'react';
import { Camera, User, Layers } from 'lucide-react';
import type { CameraMode } from '@zentry/shared';

interface CameraSwitcherProps {
  currentMode: CameraMode;
  onSelectMode: (mode: CameraMode) => void;
  isDualFallbackActive?: boolean;
}

export const CameraSwitcher: React.FC<CameraSwitcherProps> = ({
  currentMode,
  onSelectMode,
  isDualFallbackActive,
}) => {
  const modes: Array<{ id: CameraMode; label: string; icon: React.ReactNode }> = [
    { id: 'environment', label: 'Trasera', icon: <Camera className="w-3.5 h-3.5" /> },
    { id: 'user', label: 'Frontal', icon: <User className="w-3.5 h-3.5" /> },
    { id: 'dual_bereal', label: 'Dual BeReal', icon: <Layers className="w-3.5 h-3.5" /> },
  ];

  return (
    <div className="flex items-center justify-center space-x-1 p-1 rounded-full zentry-liquid-pill">
      {modes.map((m) => {
        const isActive = currentMode === m.id;
        return (
          <button
            key={m.id}
            onClick={() => onSelectMode(m.id)}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all duration-200 cursor-pointer ${
              isActive
                ? 'bg-[#533B87] text-white shadow-md border border-[#533B87]'
                : 'text-slate-700 dark:text-zentry-glacial/70 hover:text-slate-900 dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5'
            }`}
          >
            {m.icon}
            <span>{m.label}</span>
            {m.id === 'dual_bereal' && isDualFallbackActive && (
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500" title="Compositor Fallback Activo" />
            )}
          </button>
        );
      })}
    </div>
  );
};
