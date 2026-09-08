import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';
import { SPRING_PRESETS } from '@zentry/shared';

interface MechanicalLeverProps {
  isPulled: boolean;
  onManualPull?: () => void;
  disabled?: boolean;
}

export const MechanicalLever: React.FC<MechanicalLeverProps> = ({
  isPulled,
  onManualPull,
  disabled = false,
}) => {
  return (
    <div
      className={`relative flex flex-col items-center select-none ${
        disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
      }`}
      onClick={() => {
        if (!disabled && onManualPull) {
          onManualPull();
        }
      }}
      title="Palanca Mecánica de Refuerzo Variable (B.F. Skinner)"
    >
      {/* Upper Mount Housing */}
      <div className="w-10 h-6 rounded-t-xl bg-gradient-to-b from-slate-700 to-slate-900 border border-slate-600 shadow-md" />

      {/* Pivot Gear Base */}
      <div className="relative w-14 h-14 rounded-full bg-gradient-to-br from-slate-600 via-slate-800 to-black border-2 border-[#D6C8FA]/40 shadow-xl flex items-center justify-center">
        {/* Inner mechanical axis */}
        <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-amber-500 to-yellow-300 shadow-inner flex items-center justify-center">
          <div className="w-2 h-2 rounded-full bg-black/70" />
        </div>

        {/* Lever Arm & Knob */}
        <motion.div
          className="absolute bottom-7 left-1/2 w-3.5 origin-bottom flex flex-col items-center pointer-events-none"
          style={{ originX: 0.5, originY: 1 }}
          animate={{
            rotate: isPulled ? 68 : 0,
            scaleY: isPulled ? 0.92 : 1,
          }}
          transition={SPRING_PRESETS.leverBounce}
        >
          {/* Glowing Ruby Spherical Knob */}
          <motion.div
            className="w-11 h-11 -mb-1 rounded-full bg-gradient-to-tr from-red-700 via-red-500 to-rose-300 border-2 border-white/60 shadow-[0_0_20px_rgba(239,68,68,0.85)] flex items-center justify-center"
            animate={{ scale: isPulled ? 1.15 : 1 }}
            transition={{ duration: 0.2 }}
          >
            {/* Specular gloss highlight */}
            <div className="w-3.5 h-3.5 rounded-full bg-white/50 blur-[1px] -mt-3 -ml-3" />
          </motion.div>

          {/* Chrome Metallic Shaft */}
          <div className="w-3.5 h-36 bg-gradient-to-r from-slate-400 via-white to-slate-500 rounded-b-md shadow-md border-x border-slate-300" />
        </motion.div>

        {/* Friction Spark Flash at Pivot on pull */}
        {isPulled && (
          <motion.div
            initial={{ scale: 0, opacity: 1 }}
            animate={{ scale: 2, opacity: 0 }}
            transition={{ duration: 0.4 }}
            className="absolute -top-3 text-amber-300 pointer-events-none"
          >
            <Sparkles className="w-6 h-6 animate-spin" />
          </motion.div>
        )}
      </div>

      {/* Lower Chassis Bracket Base */}
      <div className="w-10 h-8 rounded-b-xl bg-gradient-to-t from-slate-700 to-slate-900 border border-slate-600 shadow-md flex items-center justify-center">
        <span className="text-[9px] font-mono font-bold text-slate-400 tracking-wider">PULL</span>
      </div>
    </div>
  );
};
