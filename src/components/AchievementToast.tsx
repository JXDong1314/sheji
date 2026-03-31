/**
 * 成就解锁弹窗组件
 * 当玩家解锁成就时显示动画提示
 */
import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Trophy, Star, Sparkles } from 'lucide-react';
import type { Achievement } from '../types/game';

interface AchievementToastProps {
  achievement: Achievement | null;
  onClose: () => void;
}

export function AchievementToast({ achievement, onClose }: AchievementToastProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (achievement) {
      setIsVisible(true);
      const timer = setTimeout(() => {
        setIsVisible(false);
        setTimeout(onClose, 300);
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [achievement, onClose]);

  if (!achievement) return null;

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: -100, scale: 0.8 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -50, scale: 0.9 }}
          transition={{ type: 'spring', stiffness: 300, damping: 25 }}
          className="fixed top-20 left-1/2 -translate-x-1/2 z-50 pointer-events-none"
        >
          <div className="relative bg-gradient-to-br from-yellow-900/95 to-orange-900/95 border-2 border-yellow-500 rounded-xl p-6 shadow-2xl backdrop-blur-md min-w-[400px]">
            {/* 光效背景 */}
            <div className="absolute inset-0 bg-gradient-to-r from-yellow-500/20 to-orange-500/20 rounded-xl animate-pulse" />
            
            {/* 星星装饰 */}
            <div className="absolute -top-2 -right-2">
              <Sparkles className="w-8 h-8 text-yellow-400 animate-spin" style={{ animationDuration: '3s' }} />
            </div>
            <div className="absolute -bottom-2 -left-2">
              <Star className="w-6 h-6 text-yellow-300 animate-pulse" />
            </div>

            <div className="relative flex items-start gap-4">
              {/* 图标 */}
              <div className="flex-shrink-0 w-16 h-16 bg-yellow-500/20 rounded-full flex items-center justify-center border-2 border-yellow-400">
                <Trophy className="w-8 h-8 text-yellow-400" />
              </div>

              {/* 内容 */}
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs font-bold text-yellow-300 uppercase tracking-wider">成就解锁</span>
                  <span className="text-yellow-400">✨</span>
                </div>
                <h3 className="text-xl font-bold text-white mb-1">{achievement.name}</h3>
                <p className="text-sm text-yellow-100/80">{achievement.description}</p>
                
                {/* 奖励分数 */}
                {achievement.points > 0 && (
                  <div className="mt-3 inline-flex items-center gap-1 px-3 py-1 bg-yellow-500/20 border border-yellow-400/50 rounded-full">
                    <Star className="w-4 h-4 text-yellow-400" />
                    <span className="text-sm font-bold text-yellow-300">+{achievement.points} 分</span>
                  </div>
                )}
              </div>
            </div>

            {/* 进度条 */}
            <motion.div
              initial={{ width: '100%' }}
              animate={{ width: '0%' }}
              transition={{ duration: 4, ease: 'linear' }}
              className="absolute bottom-0 left-0 h-1 bg-yellow-400/50 rounded-b-xl"
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
