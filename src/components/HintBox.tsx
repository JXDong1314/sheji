/**
 * 提示框组件 - 显示分层提示信息
 */
import { motion, AnimatePresence } from 'motion/react';
import { AlertCircle, Lightbulb, BookOpen, X } from 'lucide-react';
import { cn } from '../lib/utils';

interface HintBoxProps {
  level: 1 | 2 | 3;
  message: string;
  knowledgePoint?: {
    title: string;
    content: string;
    example?: string;
  };
  onClose?: () => void;
  className?: string;
}

export function HintBox({ level, message, knowledgePoint, onClose, className }: HintBoxProps) {
  const getIcon = () => {
    switch (level) {
      case 1:
        return <AlertCircle className="w-5 h-5 text-yellow-400" />;
      case 2:
        return <Lightbulb className="w-5 h-5 text-orange-400" />;
      case 3:
        return <BookOpen className="w-5 h-5 text-blue-400" />;
    }
  };

  const getTitle = () => {
    switch (level) {
      case 1:
        return '温和提示';
      case 2:
        return '具体提示';
      case 3:
        return '知识点回顾';
    }
  };

  const getBorderColor = () => {
    switch (level) {
      case 1:
        return 'border-yellow-500/50';
      case 2:
        return 'border-orange-500/50';
      case 3:
        return 'border-blue-500/50';
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -20, scale: 0.95 }}
        transition={{ type: 'spring', stiffness: 300, damping: 25 }}
        className={cn(
          "relative bg-slate-900/95 border-2 rounded-lg p-4 shadow-2xl backdrop-blur-sm",
          getBorderColor(),
          className
        )}
      >
        {/* 关闭按钮 */}
        {onClose && (
          <button
            onClick={onClose}
            className="absolute top-2 right-2 p-1 hover:bg-slate-800 rounded transition-colors"
          >
            <X className="w-4 h-4 text-slate-400" />
          </button>
        )}

        {/* 标题栏 */}
        <div className="flex items-center gap-2 mb-3">
          {getIcon()}
          <span className="font-bold text-slate-200">{getTitle()}</span>
          <span className="text-xs text-slate-500 ml-auto">第{level}次失败</span>
        </div>

        {/* 提示消息 */}
        <p className="text-slate-300 mb-3">{message}</p>

        {/* 知识点卡片（仅level 3显示） */}
        {level === 3 && knowledgePoint && (
          <div className="mt-4 p-4 bg-slate-800/50 border border-slate-700 rounded">
            <div className="flex items-center gap-2 mb-2">
              <BookOpen className="w-4 h-4 text-blue-400" />
              <h4 className="font-bold text-blue-400">{knowledgePoint.title}</h4>
            </div>
            <p className="text-sm text-slate-300 mb-2">{knowledgePoint.content}</p>
            {knowledgePoint.example && (
              <div className="mt-2 p-2 bg-slate-900/50 border-l-2 border-blue-500 text-xs text-slate-400">
                <span className="font-bold text-blue-400">本题中：</span>
                <p className="mt-1">{knowledgePoint.example}</p>
              </div>
            )}
          </div>
        )}

        {/* 底部操作 */}
        {level === 3 && (
          <div className="mt-4 flex justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-bold rounded transition-colors"
            >
              我明白了
            </button>
          </div>
        )}
      </motion.div>
    </AnimatePresence>
  );
}
