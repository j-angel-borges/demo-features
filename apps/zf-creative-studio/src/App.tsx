import React, { useState } from 'react';
import { DynamicIsland } from './components/island/DynamicIsland';
import { ZentryFreeCanvasScreen } from './components/ZentryFreeCanvasScreen';

export const App: React.FC = () => {
  // Tema de la aplicación: CLARO según solicitud del usuario
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  return (
    <div className="w-full h-[100dvh] overflow-hidden bg-[#F8F6FE] text-[#1E1633] relative select-none fixed inset-0 font-sans">
      {/* Barra de Resplandor Superior Mesa de Trabajo */}
      <div className="top-glow-bar absolute top-0 inset-x-0 z-50 pointer-events-none" />

      {/* Specular Ambient Glow Optics para tema claro Aurora */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-gradient-to-b from-[#533B87]/8 via-[#C2F4E7]/25 to-transparent blur-3xl pointer-events-none z-0" />
      <div className="absolute -bottom-20 -right-20 w-80 h-80 bg-[#D6C8FA]/35 rounded-full blur-3xl pointer-events-none z-0" />
      <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-[#FCE7F3]/50 rounded-full blur-3xl pointer-events-none z-0" />

      {/* CENTRO SUPERIOR: ISLA DINÁMICA MANTENIDA ESTRICTAMENTE OSCURA PARA CONTRASTE */}
      <div className="absolute top-1.5 sm:top-2 left-1/2 -translate-x-1/2 z-40 w-full max-w-[430px] px-2 sm:px-3 pointer-events-none flex justify-center dark">
        <div className="pointer-events-auto w-full flex justify-center dark text-[#EBF1F5]">
          <DynamicIsland
            theme="dark"
            onThemeToggle={() => {}}
          />
        </div>
      </div>

      {/* ÁREA PRINCIPAL: LIENZO Y ESTUDIO CREATIVO WOW EN TEMA CLARO */}
      <main className="w-full h-full relative z-10 flex flex-col overflow-hidden">
        <ZentryFreeCanvasScreen />
      </main>
    </div>
  );
};

export default App;
