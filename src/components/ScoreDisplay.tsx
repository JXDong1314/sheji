/**
 * 评分显示组件
 * 在游戏界面右上角显示当前总分
 */
import React from 'react';
import { motion } from 'motion/react';
import { Trophy } from 'lucide-react';

interface ScoreDisplayProps {
  score: number;
  className?: string;
}

export function ScoreDisplay({ score, className }: ScoreDisplayProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex items-center gap-2 px-4 py-2 bg-slate-900/80 border border-slate-700 rounded-lg backdrop-blur-sm ${className}`}
    >
      <Trophy className="w-5 h-5 text-yellow-500" />
      <div className="flex flex-col">
        <span className="text-xs text-slate-500 font-mono">总分</span>
        <motion.span
          key={score}
          initial={{ scale: 1.5, color: '#fbbf24' }}
          animate={{ scale: 1, color: '#ffffff' }}
          transition={{ duration: 0.3 }}
          className="text-xl font-bold text-white font-mono"
        >
          {score}
        </motion.span>
      </div>
    </motion.div>
  );
}
