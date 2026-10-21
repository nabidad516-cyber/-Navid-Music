import React, { useState, useEffect } from 'react';
import { Wifi, Battery, Volume2, ShieldCheck } from 'lucide-react';

interface AndroidStatusBarProps {
  isPlaying?: boolean;
}

export const AndroidStatusBar: React.FC<AndroidStatusBarProps> = ({ isPlaying = false }) => {
  const [timeStr, setTimeStr] = useState('11:35');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const hours = now.getHours().toString().padStart(2, '0');
      const mins = now.getMinutes().toString().padStart(2, '0');
      setTimeStr(`${hours}:${mins}`);
    };
    updateTime();
    const interval = setInterval(updateTime, 10000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="w-full flex items-center justify-between px-5 py-2 text-xs font-medium tracking-tight select-none opacity-85 z-20">
      <div className="flex items-center gap-2">
        <span className="font-semibold text-white/90">{timeStr}</span>
        {isPlaying && (
          <span className="flex items-center gap-1 text-[10px] text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded-full border border-emerald-500/20">
            <Volume2 className="w-2.5 h-2.5 animate-pulse" />
            <span>AudioFX</span>
          </span>
        )}
      </div>

      <div className="flex items-center gap-2 text-white/80">
        <span className="text-[10px] tracking-wider font-bold">5G</span>
        <Wifi className="w-3.5 h-3.5" />
        <div className="flex items-center gap-1">
          <span className="text-[10px] font-mono">92%</span>
          <Battery className="w-3.5 h-3.5 rotate-90" />
        </div>
      </div>
    </div>
  );
};
