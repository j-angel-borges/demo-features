import React from 'react';
import { motion } from 'framer-motion';
import { RefreshCw } from 'lucide-react';

interface BeRealPipProps {
  pipVideoRef: React.RefObject<HTMLVideoElement>;
  snapshotBase64: string | null;
  isDualFallbackActive: boolean;
  onRefreshFallbackSnapshot?: () => void;
  onSwapPrimarySecondary?: () => void;
}

export const BeRealPip: React.FC<BeRealPipProps> = ({
  pipVideoRef,
  snapshotBase64,
  isDualFallbackActive,
  onRefreshFallbackSnapshot,
  onSwapPrimarySecondary,
}) => {

  return (
    <motion.div
      drag
      dragConstraints={{ left: 12, top: 12, right: 240, bottom: 320 }}
      dragElastic={0.15}
      dragMomentum={false}
      initial={{ scale: 0.8, opacity: 0, x: 220, y: 20 }}
      animate={{ scale: 1, opacity: 1, x: 220, y: 20 }}
      exit={{ scale: 0.8, opacity: 0 }}
      whileHover={{ scale: 1.04 }}
      whileTap={{ scale: 0.98 }}
      className="absolute z-20 w-24 h-32 rounded-2xl overflow-hidden cursor-grab active:cursor-grabbing zentry-liquid-card shadow-2xl border-2 border-zentry-lavanda/40"
      onClick={(e) => {
        // If clicking swap button vs dragging
        if ((e.target as HTMLElement).closest('.pip-refresh-btn')) {
          e.stopPropagation();
          if (onRefreshFallbackSnapshot) onRefreshFallbackSnapshot();
        }
      }}
      onDoubleClick={() => {
        if (onSwapPrimarySecondary) onSwapPrimarySecondary();
      }}
    >
      {/* Fallback image or Video Element */}
      {isDualFallbackActive && snapshotBase64 ? (
        <img
          src={snapshotBase64}
          alt="BeReal Selfie Snap"
          className="w-full h-full object-cover"
        />
      ) : (
        <video
          ref={pipVideoRef}
          autoPlay
          playsInline
          muted
          className="w-full h-full object-cover -scale-x-100"
        />
      )}

      {/* Glass overlay badge */}
      <div className="absolute top-1.5 left-1.5 px-1.5 py-0.5 rounded-full bg-black/60 backdrop-blur-md text-[9px] font-semibold text-zentry-menta border border-zentry-menta/30">
        BeReal
      </div>

      {/* Snap Refresh Button for Fallback mode */}
      {isDualFallbackActive && onRefreshFallbackSnapshot && (
        <button
          className="pip-refresh-btn absolute bottom-1.5 right-1.5 p-1 rounded-full bg-black/60 hover:bg-zentry-purpura text-zentry-glacial backdrop-blur-md transition-colors"
          title="Actualizar captura frontal"
        >
          <RefreshCw className="w-3 h-3" />
        </button>
      )}
    </motion.div>
  );
};
