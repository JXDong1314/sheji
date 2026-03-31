import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Clock } from 'lucide-react';

interface TimerProps {
  duration: number; // 秒
  onTimeout: () => void;
  onComplete?: (remainingTime: number) => void;
  paused?: boolean;
}

export function Timer({ duration, onTimeout, onComplete, paused = false }: TimerProps) {
  const [timeLeft, setTimeLeft] = useState(duration);
  const [isWarning, setIsWarning] = useState(false);
  const [isCritical, setIsCritical] = useState(false);

  useEffect(() => {
    if (paused) return;

    if (timeLeft <= 0) {
      onTimeout();
      return;
    }

    if (timeLeft <= 10) {
      setIsCritical(true);
    } else if (timeLeft <= 30) {
      setIsWarning(true);
    }

    const timer = setInterval(() => {
      setTimeLeft(prev => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, onTimeout, paused]);

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const percentage = (timeLeft / duration) * 100;

  return (
    <motion.div
      className={`fixed top-4 left-1/2 -translate-x-1/2 z-50 ${
        isCritical ? 'animate-pulse' : ''
      }`}
      animate={isCritical ? { scale: [1, 1.1, 1] } : {}}
      transition={{ repeat: Infinity, duration: 0.5 }}
    >
      <div className={`px-6 py-3 rounded-lg border-2 backdrop-blur-sm ${
        isCritical 
          ? 'bg-red-900/90 border-red-500 shadow-[0_0_30px_rgba(239,68,68,0.5)]' 
          : isWarning
          ? 'bg-yellow-900/90 border-yellow-500 shadow-[0_0_20px_rgba(234,179,8,0.3)]'
          : 'bg-slate-900/90 border-slate-700'
      }`}>
        <div className="flex items-center gap-3">
          <Clock className={`w-5 h-5 ${
            isCritical ? 'text-red-400' : isWarning ? 'text-yellow-400' : 'text-slate-400'
          }`} />
          <div>
            <div className="text-xs text-slate-400 mb-1">⏰ 项目截止时间</div>
            <div className={`text-2xl font-bold font-mono ${
              isCritical ? 'text-red-400' : isWarning ? 'text-yellow-400' : 'text-white'
            }`}>
              {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
            </div>
          </div>
        </div>
        <div className="mt-2 w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
          <motion.div
            className={`h-full ${
              isCritical ? 'bg-red-500' : isWarning ? 'bg-yellow-500' : 'bg-blue-500'
            }`}
            initial={{ width: '100%' }}
            animate={{ width: `${percentage}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
        {isCritical && (
          <div className="text-xs text-red-400 mt-1 text-center font-bold">
            ⚠️ 紧急！时间即将耗尽
          </div>
        )}
      </div>
    </motion.div>
  );
}
