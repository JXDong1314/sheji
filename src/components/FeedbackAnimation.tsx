/**
 * 即时反馈动画组件
 */
import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle, XCircle, Star, TrendingUp, TrendingDown } from 'lucide-react';
import { useEffect, useState } from 'react';

export type FeedbackType = 'success' | 'error' | 'score' | 'achievement';

export interface Feedback {
  id: string;
  type: FeedbackType;
  message: string;
  value?: number;
  position?: { x: number; y: number };
}

interface FeedbackAnimationProps {
  feedback: Feedback | null;
  onComplete?: () => void;
}

export function FeedbackAnimation({ feedback, onComplete }: FeedbackAnimationProps) {
  useEffect(() => {
    if (feedback) {
      const timer = setTimeout(() => {
        onComplete?.();
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [feedback, onComplete]);

  if (!feedback) return null;

  const renderFeedback = () => {
    switch (feedback.type) {
      case 'success':
        return <SuccessFeedback message={feedback.message} />;
      case 'error':
        return <ErrorFeedback message={feedback.message} />;
      case 'score':
        return <ScoreFeedback value={feedback.value || 0} position={feedback.position} />;
      case 'achievement':
        return <AchievementFeedback message={feedback.message} />;
      default:
        return null;
    }
  };

  return (
    <AnimatePresence>
      {renderFeedback()}
    </AnimatePresence>
  );
}

// 成功反馈
function SuccessFeedback({ message }: { message: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.5 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.5 }}
      className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50"
    >
      <div className="bg-green-900/90 border-2 border-green-500 rounded-lg p-6 backdrop-blur-sm shadow-[0_0_30px_rgba(34,197,94,0.5)]">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.1, type: 'spring', stiffness: 200 }}
          className="flex items-center gap-4"
        >
          <CheckCircle className="w-12 h-12 text-green-400" />
          <div>
            <div className="text-2xl font-bold text-green-400">正确！</div>
            <div className="text-slate-300 text-sm mt-1">{message}</div>
          </div>
        </motion.div>

        {/* 粒子效果 */}
        {[...Array(8)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 bg-green-400 rounded-full"
            initial={{ 
              x: 0, 
              y: 0, 
              opacity: 1,
              scale: 1
            }}
            animate={{ 
              x: Math.cos(i * Math.PI / 4) * 100,
              y: Math.sin(i * Math.PI / 4) * 100,
              opacity: 0,
              scale: 0
            }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            style={{
              left: '50%',
              top: '50%'
            }}
          />
        ))}
      </div>
    </motion.div>
  );
}

// 错误反馈
function ErrorFeedback({ message }: { message: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ 
        opacity: 1, 
        x: [0, -10, 10, -10, 10, 0],
      }}
      exit={{ opacity: 0, x: 20 }}
      transition={{ 
        x: { duration: 0.5, times: [0, 0.2, 0.4, 0.6, 0.8, 1] }
      }}
      className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50"
    >
      <div className="bg-red-900/90 border-2 border-red-500 rounded-lg p-6 backdrop-blur-sm shadow-[0_0_30px_rgba(239,68,68,0.5)]">
        <div className="flex items-center gap-4">
          <XCircle className="w-12 h-12 text-red-400" />
          <div>
            <div className="text-2xl font-bold text-red-400">错误！</div>
            <div className="text-slate-300 text-sm mt-1">{message}</div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// 分数反馈
function ScoreFeedback({ value, position }: { value: number; position?: { x: number; y: number } }) {
  const isPositive = value > 0;
  const Icon = isPositive ? TrendingUp : TrendingDown;
  const color = isPositive ? 'text-green-400' : 'text-red-400';

  return (
    <motion.div
      initial={{ 
        opacity: 0, 
        y: 0,
        x: position?.x || 0,
        scale: 0.5
      }}
      animate={{ 
        opacity: [0, 1, 1, 0],
        y: -100,
        scale: [0.5, 1.2, 1, 0.8]
      }}
      transition={{ duration: 2, ease: 'easeOut' }}
      className="fixed z-50 pointer-events-none"
      style={{
        left: position?.x || '50%',
        top: position?.y || '50%'
      }}
    >
      <div className={`flex items-center gap-2 text-3xl font-bold ${color} drop-shadow-[0_0_10px_currentColor]`}>
        <Icon className="w-8 h-8" />
        {isPositive ? '+' : ''}{value}
      </div>
    </motion.div>
  );
}

// 成就解锁反馈
function AchievementFeedback({ message }: { message: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 50, scale: 0.8 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -50, scale: 0.8 }}
      className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50"
    >
      <div className="bg-yellow-900/90 border-2 border-yellow-500 rounded-lg p-4 backdrop-blur-sm shadow-[0_0_30px_rgba(234,179,8,0.5)]">
        <div className="flex items-center gap-3">
          <motion.div
            animate={{ rotate: [0, 360] }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          >
            <Star className="w-8 h-8 text-yellow-400 fill-yellow-400" />
          </motion.div>
          <div>
            <div className="text-sm font-bold text-yellow-400">成就解锁！</div>
            <div className="text-slate-300 text-xs mt-1">{message}</div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// 反馈管理器
export class FeedbackManager {
  private feedbacks: Feedback[] = [];
  private listeners: ((feedback: Feedback | null) => void)[] = [];

  subscribe(listener: (feedback: Feedback | null) => void) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  private notify(feedback: Feedback | null) {
    this.listeners.forEach(listener => listener(feedback));
  }

  showSuccess(message: string) {
    const feedback: Feedback = {
      id: Date.now().toString(),
      type: 'success',
      message
    };
    this.notify(feedback);
  }

  showError(message: string) {
    const feedback: Feedback = {
      id: Date.now().toString(),
      type: 'error',
      message
    };
    this.notify(feedback);
  }

  showScore(value: number, position?: { x: number; y: number }) {
    const feedback: Feedback = {
      id: Date.now().toString(),
      type: 'score',
      message: '',
      value,
      position
    };
    this.notify(feedback);
  }

  showAchievement(message: string) {
    const feedback: Feedback = {
      id: Date.now().toString(),
      type: 'achievement',
      message
    };
    this.notify(feedback);
  }

  clear() {
    this.notify(null);
  }
}

// 全局反馈管理器实例
export const feedbackManager = new FeedbackManager();
