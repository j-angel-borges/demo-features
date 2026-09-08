import React from 'react';
import { motion } from 'framer-motion';
import { Mic, MicOff, Sparkles } from 'lucide-react';

interface VoiceOrbProps {
  isConnected: boolean;
  isSpeaking: boolean;
  amplitude: number;
  waveform: number[];
  latestTranscript?: string;
  onToggle: () => void;
}

export const VoiceOrb: React.FC<VoiceOrbProps> = ({
  isConnected,
  isSpeaking,
  amplitude,
  waveform,
  latestTranscript,
  onToggle,
}) => {
  // Scale factor based on amplitude
  const scale = 1 + amplitude * 0.35;

  return (
    <div className="flex flex-col items-center justify-center space-y-2">
      {/* Dynamic Transcript Subtitle Pill */}
      {isConnected && latestTranscript && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-[320px] px-3.5 py-1.5 rounded-full bg-white/95 dark:bg-[#080D1A]/95 text-center text-xs text-slate-900 dark:text-zentry-glacial font-medium truncate border border-slate-300 dark:border-zentry-lavanda/30 shadow-md"
        >
          <span className="text-[#533B87] dark:text-zentry-menta font-bold mr-1">IA:</span>
          {latestTranscript}
        </motion.div>
      )}

      {/* Main Interactive Spherical Orb */}
      <div className="relative flex items-center justify-center">
        {/* Outer Ripple 1 */}
        {isConnected && (
          <motion.div
            animate={{
              scale: [scale * 1.1, scale * 1.45, scale * 1.1],
              opacity: [0.6, 0.15, 0.6],
            }}
            transition={{ repeat: Infinity, duration: 2.2, ease: 'easeInOut' }}
            className="absolute w-20 h-20 rounded-full bg-emerald-400/30 blur-md pointer-events-none"
          />
        )}

        {/* Outer Ripple 2 (Purple) */}
        {isConnected && (
          <motion.div
            animate={{
              scale: [scale * 1.3, scale * 1.7, scale * 1.3],
              opacity: [0.4, 0.05, 0.4],
            }}
            transition={{ repeat: Infinity, duration: 3.0, ease: 'easeInOut', delay: 0.4 }}
            className="absolute w-20 h-20 rounded-full bg-[#533B87]/30 blur-lg pointer-events-none"
          />
        )}

        {/* Central Core Button */}
        <motion.button
          onClick={onToggle}
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.94 }}
          style={{ transform: `scale(${scale})` }}
          className={`relative z-10 w-16 h-16 rounded-full flex flex-col items-center justify-center transition-all duration-300 shadow-xl border-2 cursor-pointer ${
            isConnected
              ? 'bg-gradient-to-br from-[#533B87] via-[#44326E] to-[#533B87] border-emerald-400 text-white shadow-emerald-500/20'
              : 'bg-white dark:bg-zentry-dark/90 border-slate-300 dark:border-zentry-lavanda/30 text-slate-600 dark:text-zentry-glacial/60 hover:border-[#533B87]'
          }`}
          title={isConnected ? 'Desactivar agente multimodal' : 'Activar Gemini 2.5 Flash Live'}
        >
          {isConnected ? (
            <>
              {isSpeaking ? (
                <Sparkles className="w-6 h-6 text-[#C2F4E7] animate-spin" style={{ animationDuration: '4s' }} />
              ) : (
                <Mic className="w-6 h-6 text-[#C2F4E7]" />
              )}
              {/* Micro waveform bar inside orb */}
              <div className="flex items-center space-x-0.5 mt-1">
                {waveform.slice(0, 5).map((v, i) => (
                  <div
                    key={i}
                    className="w-0.5 rounded-full bg-[#C2F4E7] transition-all duration-75"
                    style={{ height: `${Math.max(3, v * 12)}px` }}
                  />
                ))}
              </div>
            </>
          ) : (
            <MicOff className="w-6 h-6" />
          )}
        </motion.button>
      </div>

      {/* Latency badge */}
      {isConnected && (
        <div className="flex items-center space-x-1.5 text-[10px] text-[#533B87] dark:text-zentry-menta/80 font-bold tracking-wider">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
          <span>GEMINI 2.5 FLASH • &lt;800ms</span>
        </div>
      )}
    </div>
  );
};
