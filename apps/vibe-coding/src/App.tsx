import React, { useState, useEffect } from 'react';
import { BioMorphCanvas } from './components/BioMorphCanvas';
import { vibeTelemetry } from './services/vibeTelemetryService';

export const App: React.FC = () => {
  // Regla SSOT Zentry: Light Aurora como tema predeterminado
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  const handleToggleTheme = () => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  useEffect(() => {
    // Sincronización inicial silenciosa
    vibeTelemetry.flushToFirestore().catch(() => {});
  }, []);

  return (
    <div
      data-theme={theme}
      className={`w-full h-[100dvh] overflow-hidden ${theme === 'dark' ? 'dark' : ''}`}
    >
      <BioMorphCanvas theme={theme} onToggleTheme={handleToggleTheme} />
    </div>
  );
};

export default App;
