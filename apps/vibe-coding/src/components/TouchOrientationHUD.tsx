import React from 'react';
import { Moon, Sun, Smartphone } from 'lucide-react';
import { ContactType, OrientationState } from '../types';

interface TouchOrientationHUDProps {
  contactType: ContactType;
  orientation: OrientationState;
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
  onSimulateTilt?: () => void;
}

export const TouchOrientationHUD: React.FC<TouchOrientationHUDProps> = ({
  contactType,
  orientation,
  theme,
  onToggleTheme,
  onSimulateTilt,
}) => {
  return (
    <div className="absolute top-3 sm:top-5 left-3 sm:left-6 z-40 pointer-events-auto flex items-center gap-2">
      {/* Botón de Tema (Light Aurora First por defecto) */}
      <button
        onClick={onToggleTheme}
        className="w-11 h-11 sm:w-12 sm:h-12 rounded-full liquid-glass flex items-center justify-center text-[#533B87] dark:text-[#D6C8FA] active:scale-95 transition-all shadow-sm cursor-pointer"
        aria-label="Cambiar tema"
        title="Alternar Modo Claro / Oscuro"
      >
        {theme === 'light' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
      </button>

      {/* Indicador de Inclinación / Gravedad Espacial */}
      <button
        onClick={onSimulateTilt}
        className="h-11 sm:h-12 px-3 rounded-full liquid-glass flex items-center gap-1.5 text-xs text-[#5E6475] dark:text-[#A1A7B8] active:scale-95 transition-all shadow-sm cursor-pointer"
        title="Inclinación física de la tableta (giroscopio)"
        aria-label="Inclinación espacial"
      >
        <Smartphone
          className="w-4 h-4 transition-transform duration-200 text-[#533B87] dark:text-[#D6C8FA]"
          style={{
            transform: `rotate(${Math.round(orientation.tiltX * 0.5)}deg)`,
          }}
        />
        <span className="text-[10px] font-semibold tabular-nums">
          {Math.round(orientation.tiltX)}°
        </span>
      </button>

      {/* Badge transitorio de contacto de palma o multidedo */}
      {contactType === 'palm_press' && (
        <div className="animate-fade-in px-3 py-1.5 rounded-full bg-[#00F2FE]/20 border border-[#00F2FE]/50 text-[#1E1633] dark:text-white text-[10px] font-bold flex items-center gap-1.5 backdrop-blur-md">
          <span className="w-2 h-2 rounded-full bg-[#00F2FE] animate-ping" />
          <span>Palma</span>
        </div>
      )}
    </div>
  );
};
