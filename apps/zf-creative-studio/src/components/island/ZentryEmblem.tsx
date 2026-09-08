import React from 'react';
import { motion } from 'framer-motion';

interface ZentryEmblemProps {
  size?: number;
  className?: string;
  isGlowing?: boolean;
  onClick?: (e: React.MouseEvent) => void;
  title?: string;
}

export const ZentryEmblem: React.FC<ZentryEmblemProps> = ({
  size = 28,
  className = '',
  isGlowing = false,
  onClick,
  title = 'Zentry OS',
}) => {
  return (
    <motion.div
      whileHover={{ scale: 1.08 }}
      whileTap={{ scale: 0.92 }}
      onClick={onClick}
      title={title}
      style={{ width: size, height: size }}
      className={`relative flex items-center justify-center rounded-xl cursor-pointer select-none ${className}`}
    >
      {/* Specular Ambient Glow */}
      {isGlowing && (
        <div className="absolute inset-0 rounded-xl bg-gradient-to-tr from-[#533B87] via-[#D6C8FA] to-[#C2F4E7] opacity-75 blur-md animate-pulse pointer-events-none" />
      )}

      {/* Outer Specular Gradient Ring */}
      <div className="relative w-full h-full rounded-xl bg-gradient-to-tr from-[#533B87] via-[#8468BE] to-[#D6C8FA] p-[1.5px] shadow-sm flex items-center justify-center">
        {/* Core Jewel Container */}
        <div className="w-full h-full rounded-[10px] bg-gradient-to-br from-[#120E24] to-[#080D1A] flex items-center justify-center overflow-hidden border border-white/10 shadow-inner">
          {/* Vectorial Zentry Z Glyph */}
          <svg
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="w-3/5 h-3/5 drop-shadow-[0_0_6px_rgba(214,200,250,0.8)]"
          >
            <defs>
              <linearGradient id="zentryZGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#C2F4E7" />
                <stop offset="50%" stopColor="#D6C8FA" />
                <stop offset="100%" stopColor="#533B87" />
              </linearGradient>
            </defs>
            <path
              d="M5 6H19L8.5 17.5H19"
              stroke="url(#zentryZGrad)"
              strokeWidth="3.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
      </div>
    </motion.div>
  );
};
