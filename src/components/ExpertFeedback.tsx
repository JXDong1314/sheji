import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { AlertTriangle, CheckCircle, XCircle, Info } from 'lucide-react';

interface ExpertFeedbackProps {
  type: 'success' | 'warning' | 'error' | 'info';
  message: string;
  expert: string;
  show: boolean;
  onClose?: () => void;
  autoClose?: boolean;
  duration?: number;
}

export function ExpertFeedback({ 
  type, 
  message, 
  expert, 
  show, 
  onClose,
  autoClose = true,
  duration = 3000
}: ExpertFeedbackProps) {
  const config = {
    success: {
      icon: <CheckCircle className="w-6 h-6" />,
      bg: 'bg-green-900/90',
      border: 'border-green-500',
      text: 'text-green-400',
      shadow: 'shadow-[0_0_20px_rgba(34,197,94,0.3)]'
    },
    warning: {
      icon: <AlertTriangle className="w-6 h-6" />,
      bg: 'bg-yellow-900/90',
      border: 'border-yellow-500',
      text: 'text-yellow-400',
      shadow: 'shadow-[0_0_20px_rgba(234,179,8,0.3)]'
    },
    error: {
      icon: <XCircle className="w-6 h-6" />,
      bg: 'bg-red-900/90',
      border: 'border-red-500',
      text: 'text-red-400',
      shadow: 'shadow-[0_0_20px_rgba(239,68,68,0.3)]'
    },
    info: {
      icon: <Info className="w-6 h-6" />,
      bg: 'bg-blue-900/90',
      border: 'border-blue-500',
      text: 'text-blue-400',
      shadow: 'shadow-[0_0_20px_rgba(59,130,246,0.3)]'
    }
  };

  const style = config[type];

  React.useEffect(() => {
    if (show && autoClose && onClose) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [show, autoClose, onClose, duration]);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, y: -50, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -50, scale: 0.9 }}
          transition={{ type: 'spring', stiffness: 200, damping: 20 }}
          className="fixed top-24 left-1/2 -translate-x-1/2 z-50 max-w-md"
        >
          <div className={`${style.bg} border-2 ${style.border} ${style.shadow} rounded-lg p-4 backdrop-blur-sm`}>
            <div className="flex items-start gap-3">
              <div className={style.text}>
                {style.icon}
              </div>
              <div className="flex-1">
                <div className="font-bold text-white mb-1 flex items-center gap-2">
                  💬 {expert}
                </div>
                <div className="text-slate-300 text-sm leading-relaxed">
                  {message}
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
