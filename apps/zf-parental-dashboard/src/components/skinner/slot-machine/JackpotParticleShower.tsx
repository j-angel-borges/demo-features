import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Zap, Brain, Heart, Star } from 'lucide-react';

interface Particle {
  id: number;
  xStart: number;
  xEnd: number;
  yEnd: number;
  scale: number;
  rotation: number;
  iconType: 'sparkles' | 'zap' | 'brain' | 'heart' | 'star';
  color: string;
  delay: number;
  duration: number;
}

export const JackpotParticleShower: React.FC = () => {
  const particles: Particle[] = useMemo(() => {
    const list: Particle[] = [];
    const colors = ['#FBBF24', '#D6C8FA', '#C2F4E7', '#F472B6', '#EF4444', '#60A5FA'];
    const types: Particle['iconType'][] = ['sparkles', 'zap', 'brain', 'heart', 'star'];

    // Generate 36 animated vector particles
    for (let i = 0; i < 36; i++) {
      list.push({
        id: i,
        xStart: (i % 6 - 2.5) * 80 + (Math.random() * 40 - 20),
        xEnd: (Math.random() - 0.5) * 600,
        yEnd: Math.random() * 320 + 180,
        scale: Math.random() * 0.6 + 0.7,
        rotation: Math.random() * 720 - 360,
        iconType: types[i % types.length],
        color: colors[i % colors.length],
        delay: Math.random() * 0.6,
        duration: Math.random() * 1.5 + 2.0, // Raining over ~2.0 to 3.5s
      });
    }
    return list;
  }, []);

  const renderIcon = (type: Particle['iconType'], color: string) => {
    switch (type) {
      case 'sparkles':
        return <Sparkles className="w-5 h-5" style={{ color }} />;
      case 'zap':
        return <Zap className="w-5 h-5" style={{ color }} />;
      case 'brain':
        return <Brain className="w-5 h-5" style={{ color }} />;
      case 'heart':
        return <Heart className="w-5 h-5" style={{ color }} />;
      default:
        return <Star className="w-5 h-5" style={{ color }} />;
    }
  };

  return (
    <div className="absolute inset-0 pointer-events-none z-30 overflow-hidden flex items-center justify-center">
      {/* Background Strobe Flash Overlay */}
      <motion.div
        className="absolute inset-0 bg-amber-400/20 mix-blend-screen"
        initial={{ opacity: 0 }}
        animate={{ opacity: [0, 0.8, 0.1, 0.7, 0.1, 0] }}
        transition={{ duration: 1.5, repeat: 2 }}
      />

      {/* Raining Particles Cascade */}
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute top-1/4"
          initial={{
            x: p.xStart,
            y: -60,
            scale: 0,
            opacity: 1,
            rotate: 0,
          }}
          animate={{
            x: p.xEnd,
            y: p.yEnd,
            scale: [0, p.scale, p.scale * 0.85],
            opacity: [1, 1, 0],
            rotate: p.rotation,
          }}
          transition={{
            duration: p.duration,
            delay: p.delay,
            ease: 'easeOut',
          }}
        >
          <div
            className="p-1.5 rounded-full bg-black/70 border border-white/30 shadow-lg backdrop-blur-sm"
            style={{ filter: `drop-shadow(0 0 10px ${p.color})` }}
          >
            {renderIcon(p.iconType, p.color)}
          </div>
        </motion.div>
      ))}
    </div>
  );
};
