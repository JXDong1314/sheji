/**
 * 章节切换组件 - 左侧导航面板
 * 允许玩家自由切换章节
 */
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronLeft, ChevronRight, Home, BookOpen, Wrench, FileText, Users, Trophy } from 'lucide-react';
import { cn } from '../lib/utils';
import type { ChapterId } from '../types/game';

interface Chapter {
  id: ChapterId;
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  color: string;
  gradient: string;
}

const CHAPTERS: Chapter[] = [
  {
    id: 'prologue',
    title: '序章',
    subtitle: '需求分析',
    icon: <Home className="w-5 h-5" />,
    color: 'from-blue-500 to-cyan-500',
    gradient: 'from-blue-500/20 to-cyan-500/20'
  },
  {
    id: 'chapter1',
    title: '第一章',
    subtitle: '黑箱法与筛选法',
    icon: <Wrench className="w-5 h-5" />,
    color: 'from-purple-500 to-pink-500',
    gradient: 'from-purple-500/20 to-pink-500/20'
  },
  {
    id: 'chapter2',
    title: '第二章',
    subtitle: '技术语言与标准化',
    icon: <FileText className="w-5 h-5" />,
    color: 'from-orange-500 to-red-500',
    gradient: 'from-orange-500/20 to-red-500/20'
  },
  {
    id: 'chapter3',
    title: '第三章',
    subtitle: '人机工程学',
    icon: <Users className="w-5 h-5" />,
    color: 'from-green-500 to-emerald-500',
    gradient: 'from-green-500/20 to-emerald-500/20'
  },
  {
    id: 'ending',
    title: '结局',
    subtitle: '项目总结',
    icon: <Trophy className="w-5 h-5" />,
    color: 'from-yellow-500 to-amber-500',
    gradient: 'from-yellow-500/20 to-amber-500/20'
  }
];

interface ChapterSwitcherProps {
  currentChapter: ChapterId;
  onChapterChange: (chapterId: ChapterId) => void;
  completedChapters: ChapterId[];
}

export function ChapterSwitcher({ currentChapter, onChapterChange, completedChapters }: ChapterSwitcherProps) {
  const [isExpanded, setIsExpanded] = useState(true);

  return (
    <motion.div
      initial={{ x: -300 }}
      animate={{ x: 0 }}
      className="fixed left-0 top-0 h-screen z-50 flex"
    >
      {/* 主面板 */}
      <motion.div
        animate={{ width: isExpanded ? 280 : 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className="relative overflow-hidden"
      >
        {/* 背景光晕 */}
        <div className="absolute inset-0 bg-gradient-to-r from-slate-900/98 to-slate-800/95 backdrop-blur-xl" />
        <div className="absolute inset-0 bg-gradient-to-b from-blue-500/5 via-purple-500/5 to-cyan-500/5" />
        
        {/* 内容 */}
        <div className="relative h-full flex flex-col p-4">
          {/* 标题 */}
          <div className="mb-6">
            <div className="flex items-center gap-3 mb-2">
              <BookOpen className="w-6 h-6 text-blue-400" />
              <h2 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">
                章节导航
              </h2>
            </div>
            <p className="text-xs text-slate-400 ml-9">
              点击切换章节
            </p>
          </div>

          {/* 章节列表 */}
          <div className="flex-1 space-y-2 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent">
            {CHAPTERS.map((chapter, index) => {
              const isActive = currentChapter === chapter.id;
              const isCompleted = completedChapters.includes(chapter.id);
              const isLocked = index > 0 && !completedChapters.includes(CHAPTERS[index - 1].id) && !isActive;

              return (
                <motion.button
                  key={chapter.id}
                  onClick={() => !isLocked && onChapterChange(chapter.id)}
                  disabled={isLocked}
                  whileHover={!isLocked ? { scale: 1.02, x: 4 } : {}}
                  whileTap={!isLocked ? { scale: 0.98 } : {}}
                  className={cn(
                    "w-full text-left rounded-xl transition-all duration-300 relative overflow-hidden group",
                    isActive && "ring-2 ring-blue-400/50",
                    isLocked && "opacity-50 cursor-not-allowed"
                  )}
                >
                  {/* 背景 */}
                  <div className={cn(
                    "absolute inset-0 transition-opacity duration-300",
                    isActive 
                      ? `bg-gradient-to-r ${chapter.gradient} opacity-100`
                      : "bg-slate-800/50 opacity-0 group-hover:opacity-100"
                  )} />
                  
                  {/* 左侧彩色条 */}
                  <div className={cn(
                    "absolute left-0 top-0 bottom-0 w-1 transition-all duration-300",
                    isActive ? `bg-gradient-to-b ${chapter.color}` : "bg-transparent group-hover:bg-slate-600"
                  )} />

                  {/* 内容 */}
                  <div className="relative p-3 pl-4">
                    <div className="flex items-start gap-3">
                      {/* 图标 */}
                      <div className={cn(
                        "mt-0.5 transition-all duration-300",
                        isActive 
                          ? `text-transparent bg-clip-text bg-gradient-to-r ${chapter.color}`
                          : "text-slate-400 group-hover:text-slate-300"
                      )}>
                        {chapter.icon}
                      </div>

                      {/* 文字 */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className={cn(
                            "font-bold text-sm transition-all duration-300",
                            isActive
                              ? `text-transparent bg-clip-text bg-gradient-to-r ${chapter.color}`
                              : "text-slate-200 group-hover:text-white"
                          )}>
                            {chapter.title}
                          </h3>
                          
                          {/* 状态标记 */}
                          {isCompleted && !isActive && (
                            <span className="text-green-400 text-xs">✓</span>
                          )}
                          {isLocked && (
                            <span className="text-slate-500 text-xs">🔒</span>
                          )}
                        </div>
                        
                        <p className={cn(
                          "text-xs transition-all duration-300 truncate",
                          isActive
                            ? "text-slate-300"
                            : "text-slate-500 group-hover:text-slate-400"
                        )}>
                          {chapter.subtitle}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* 激活指示器 */}
                  {isActive && (
                    <motion.div
                      layoutId="activeChapter"
                      className={cn(
                        "absolute inset-0 border-2 rounded-xl pointer-events-none",
                        `border-gradient-to-r ${chapter.color}`
                      )}
                      transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    />
                  )}
                </motion.button>
              );
            })}
          </div>

          {/* 底部信息 */}
          <div className="mt-4 pt-4 border-t border-slate-700/50">
            <div className="text-xs text-slate-400 space-y-1">
              <div className="flex items-center justify-between">
                <span>已完成章节</span>
                <span className="text-green-400 font-bold">
                  {completedChapters.length} / {CHAPTERS.length}
                </span>
              </div>
              <div className="w-full h-1.5 bg-slate-700 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-green-500 to-emerald-500"
                  initial={{ width: 0 }}
                  animate={{ 
                    width: `${(completedChapters.length / CHAPTERS.length) * 100}%` 
                  }}
                  transition={{ type: "spring", stiffness: 100, damping: 15 }}
                />
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* 展开/收起按钮 */}
      <motion.button
        onClick={() => setIsExpanded(!isExpanded)}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="relative w-8 h-16 bg-gradient-to-r from-slate-800/95 to-slate-700/95 backdrop-blur-xl border-r border-t border-b border-slate-600/50 rounded-r-xl flex items-center justify-center text-slate-400 hover:text-white transition-colors shadow-[0_0_20px_rgba(100,116,139,0.3)] self-center"
      >
        <motion.div
          animate={{ rotate: isExpanded ? 0 : 180 }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
        >
          <ChevronLeft className="w-4 h-4" />
        </motion.div>
      </motion.button>
    </motion.div>
  );
}
