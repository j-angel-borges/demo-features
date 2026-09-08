import React from 'react';
import { motion } from 'framer-motion';
import { Smartphone, Palette, ShieldCheck, ExternalLink } from 'lucide-react';

interface EcosystemQuickLinksProps {
  className?: string;
}

export const EcosystemQuickLinks: React.FC<EcosystemQuickLinksProps> = ({ className = '' }) => {
  const links = [
    {
      name: 'Skinner Box',
      desc: 'Atención & Hábitos',
      icon: <Smartphone className="w-4 h-4 text-purple-600 dark:text-purple-300" />,
      url: 'http://localhost:5174',
      badge: '5174',
    },
    {
      name: 'Z-Art Studio',
      desc: 'Lienzo Creativo',
      icon: <Palette className="w-4 h-4 text-emerald-600 dark:text-emerald-300" />,
      url: 'http://localhost:5176',
      badge: '5176',
    },
    {
      name: 'Control Parental',
      desc: 'Telemetría en Vivo',
      icon: <ShieldCheck className="w-4 h-4 text-sky-600 dark:text-sky-300" />,
      url: 'http://localhost:5175',
      badge: '5175',
    },
  ];

  const handleOpen = (url: string) => {
    window.open(url, '_blank');
  };

  return (
    <div className={`w-full max-w-[380px] mx-auto select-none ${className}`}>
      <div className="flex items-center justify-between mb-1.5 px-1">
        <span className="text-[10px] font-mono font-bold tracking-wider text-slate-500 dark:text-slate-400 uppercase">
          Ecosistema Zentry
        </span>
        <span className="text-[9px] font-mono text-slate-400 dark:text-slate-500">
          Suite Demo
        </span>
      </div>

      <div className="grid grid-cols-3 gap-2">
        {links.map((link) => (
          <motion.button
            key={link.name}
            whileHover={{ scale: 1.04, y: -2 }}
            whileTap={{ scale: 0.96 }}
            onClick={() => handleOpen(link.url)}
            className="flex flex-col items-center justify-between p-2.5 rounded-2xl bg-white/75 dark:bg-[#0B1020]/75 border border-[#D6C8FA]/40 dark:border-[#D6C8FA]/15 shadow-sm hover:shadow-md hover:border-[#533B87] dark:hover:border-[#C2F4E7] transition-all cursor-pointer group text-center"
          >
            <div className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-white/10 flex items-center justify-center mb-1.5 group-hover:scale-110 transition-transform">
              {link.icon}
            </div>

            <div className="w-full">
              <div className="text-[11px] font-bold text-slate-900 dark:text-[#EBF1F5] truncate leading-tight flex items-center justify-center gap-0.5">
                <span>{link.name}</span>
                <ExternalLink className="w-2.5 h-2.5 opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
              <div className="text-[9px] text-slate-500 dark:text-slate-400 truncate">
                {link.desc}
              </div>
            </div>
          </motion.button>
        ))}
      </div>
    </div>
  );
};
