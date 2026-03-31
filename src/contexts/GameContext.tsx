/**
 * 游戏全局状态管理 Context
 */
import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import type { 
  GameState, 
  GameContextType, 
  ChapterId, 
  AchievementId, 
  KnowledgePointId,
  EndingRank,
  KnowledgePoint
} from '../types/game';

// 初始化成就数据
const initialAchievements = {
  clue_hunter: { id: 'clue_hunter' as const, name: '问题猎手', description: '敏锐的观察力是科学调查的第一步', icon: '🔍', unlocked: false, points: 10 },
  requirement_analyst: { id: 'requirement_analyst' as const, name: '需求分析师', description: '精准识别用户需求、系统约束和问题定义', icon: '📋', unlocked: false, points: 15 },
  blackbox_master: { id: 'blackbox_master' as const, name: '黑箱大师', description: '透过输入输出关系，洞察系统本质', icon: '⚙️', unlocked: false, points: 15 },
  screening_expert: { id: 'screening_expert' as const, name: '筛选专家', description: '在众多组合中，精准筛选出最优解', icon: '🎰', unlocked: false, points: 15 },
  tech_language_master: { id: 'tech_language_master' as const, name: '技术语言大师', description: '精通技术语言规范化表达', icon: '📝', unlocked: false, points: 15 },
  optimization_expert: { id: 'optimization_expert' as const, name: '优化专家', description: '运用优选法找到最佳方案', icon: '⚖️', unlocked: false, points: 15 },
  hmi_master: { id: 'hmi_master' as const, name: '人机关系大师', description: '完美平衡安全、高效、健康、舒适', icon: '🤝', unlocked: false, points: 20 },
  speedrunner: { id: 'speedrunner' as const, name: '速通者', description: '效率与质量并重的真正高手', icon: '⚡', unlocked: false, points: 10 },
  perfectionist: { id: 'perfectionist' as const, name: '完美主义者', description: '追求极致，不容瑕疵', icon: '🎯', unlocked: false, points: 20 },
  knowledge_seeker: { id: 'knowledge_seeker' as const, name: '知识渊博', description: '求知若渴，温故知新', icon: '📚', unlocked: false, points: 10 },
  persistent: { id: 'persistent' as const, name: '不屈不挠', description: '失败是成功之母，坚持就是胜利', icon: '🔄', unlocked: false, points: 10 },
  s_rank_investigator: { id: 's_rank_investigator' as const, name: 'S级调查员', description: '科学之光的化身', icon: '🌟', unlocked: false, points: 30 },
  achievement_hunter: { id: 'achievement_hunter' as const, name: '全成就收集者', description: '技术设计领域的全能王者', icon: '🏆', unlocked: false, points: 50 },
};

// 初始化知识点数据
const initialKnowledgePoints = {
  requirement_analysis: { id: 'requirement_analysis' as const, name: '需求分析', description: '识别用户需求、系统约束和问题定义', mastery: 'not_started' as const },
  blackbox_method: { id: 'blackbox_method' as const, name: '黑箱法', description: '通过输入输出关系分析系统功能', mastery: 'not_started' as const },
  screening_method: { id: 'screening_method' as const, name: '筛选法', description: '功能元排列组合筛选最优方案', mastery: 'not_started' as const },
  drawing_skills: { id: 'drawing_skills' as const, name: '绘图技巧', description: '徒手绘制标准的技术草图', mastery: 'not_started' as const },
  ergonomics: { id: 'ergonomics' as const, name: '人机关系', description: '考虑生理、心理、环境因素优化设计', mastery: 'not_started' as const },
};

// 初始化章节进度
const initialChapters = {
  prologue: { id: 'prologue' as const, completed: false, attempts: 0, score: 0 },
  chapter1: { id: 'chapter1' as const, completed: false, attempts: 0, score: 0 },
  chapter2: { id: 'chapter2' as const, completed: false, attempts: 0, score: 0 },
  chapter3: { id: 'chapter3' as const, completed: false, attempts: 0, score: 0 },
  ending: { id: 'ending' as const, completed: false, attempts: 0, score: 0 },
};

// 初始游戏状态
const initialState: GameState = {
  currentChapter: 'prologue',
  completedChapters: [],
  totalScore: 0,
  chapterScores: {
    prologue: 0,
    chapter1: 0,
    chapter2: 0,
    chapter3: 0,
    ending: 0,
  },
  achievements: initialAchievements,
  unlockedAchievements: [],
  knowledgePoints: initialKnowledgePoints,
  chapters: initialChapters,
  puzzleAttempts: [],
  endingRank: null,
  startTime: Date.now(),
  totalPlayTime: 0,
  totalAttempts: 0,
  totalHintsUsed: 0,
  totalErrors: 0,
  currentChapterErrors: 0,
  currentChapterHints: 0,
  timePenalty: 0,
  qualityRating: 5,
  consecutiveErrors: 0,
};

const GameContext = createContext<GameContextType | undefined>(undefined);

export function GameProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<GameState>(() => {
    // 尝试从 localStorage 恢复状态
    const saved = localStorage.getItem('game_state');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse saved game state:', e);
        return initialState;
      }
    }
    return initialState;
  });

  // 自动保存状态到 localStorage
  useEffect(() => {
    localStorage.setItem('game_state', JSON.stringify(state));
  }, [state]);

  // 章节管理
  const setCurrentChapter = useCallback((chapterId: ChapterId) => {
    setState(prev => ({ ...prev, currentChapter: chapterId }));
  }, []);

  const completeChapter = useCallback((chapterId: ChapterId, score: number) => {
    setState(prev => {
      const newCompletedChapters = prev.completedChapters.includes(chapterId)
        ? prev.completedChapters
        : [...prev.completedChapters, chapterId];

      return {
        ...prev,
        completedChapters: newCompletedChapters,
        chapters: {
          ...prev.chapters,
          [chapterId]: {
            ...prev.chapters[chapterId],
            completed: true,
            score,
            endTime: Date.now(),
          },
        },
      };
    });
  }, []);

  // 评分管理
  const addScore = useCallback((points: number, chapterId?: ChapterId) => {
    setState(prev => {
      const newState = {
        ...prev,
        totalScore: prev.totalScore + points,
      };

      if (chapterId) {
        newState.chapterScores = {
          ...prev.chapterScores,
          [chapterId]: prev.chapterScores[chapterId] + points,
        };
      }

      console.log(`[Score] +${points} (Total: ${newState.totalScore})`);
      return newState;
    });
  }, []);

  const deductScore = useCallback((points: number, chapterId?: ChapterId) => {
    setState(prev => {
      const newState = {
        ...prev,
        totalScore: Math.max(0, prev.totalScore - points),
      };

      if (chapterId) {
        newState.chapterScores = {
          ...prev.chapterScores,
          [chapterId]: Math.max(0, prev.chapterScores[chapterId] - points),
        };
      }

      console.log(`[Score] -${points} (Total: ${newState.totalScore})`);
      return newState;
    });
  }, []);

  // 成就管理
  const unlockAchievement = useCallback((achievementId: AchievementId) => {
    setState(prev => {
      // 安全检查：确保成就存在
      if (!prev.achievements[achievementId]) {
        console.error(`[Achievement] 成就不存在: ${achievementId}`);
        return prev;
      }
      
      // 检查是否已解锁
      if (prev.achievements[achievementId].unlocked) {
        return prev;
      }

      console.log(`[Achievement] Unlocked: ${prev.achievements[achievementId].name}`);

      return {
        ...prev,
        achievements: {
          ...prev.achievements,
          [achievementId]: {
            ...prev.achievements[achievementId],
            unlocked: true,
            unlockedAt: Date.now(),
          },
        },
        unlockedAchievements: [...prev.unlockedAchievements, achievementId],
      };
    });
  }, []);

  const checkAchievement = useCallback((achievementId: AchievementId) => {
    return state.achievements[achievementId].unlocked;
  }, [state.achievements]);

  // 知识点管理
  const updateKnowledgePoint = useCallback((pointId: KnowledgePointId, mastery: KnowledgePoint['mastery']) => {
    setState(prev => ({
      ...prev,
      knowledgePoints: {
        ...prev.knowledgePoints,
        [pointId]: {
          ...prev.knowledgePoints[pointId],
          mastery,
        },
      },
    }));
  }, []);

  // 解谜记录
  const recordAttempt = useCallback((chapterId: ChapterId, puzzleId: string, success: boolean, error?: string) => {
    setState(prev => {
      const existingAttempt = prev.puzzleAttempts.find(
        a => a.chapterId === chapterId && a.puzzleId === puzzleId
      );

      const newAttempts = existingAttempt
        ? prev.puzzleAttempts.map(a =>
            a.chapterId === chapterId && a.puzzleId === puzzleId
              ? {
                  ...a,
                  attempts: a.attempts + 1,
                  solved: success || a.solved,
                  errors: error ? [...a.errors, error] : a.errors,
                }
              : a
          )
        : [
            ...prev.puzzleAttempts,
            {
              chapterId,
              puzzleId,
              attempts: 1,
              hintsUsed: 0,
              solved: success,
              errors: error ? [error] : [],
            },
          ];

      return {
        ...prev,
        puzzleAttempts: newAttempts,
        totalAttempts: prev.totalAttempts + 1,
        totalErrors: error ? prev.totalErrors + 1 : prev.totalErrors,
      };
    });
  }, []);

  const recordHint = useCallback((chapterId: ChapterId, puzzleId: string) => {
    setState(prev => {
      const newAttempts = prev.puzzleAttempts.map(a =>
        a.chapterId === chapterId && a.puzzleId === puzzleId
          ? { ...a, hintsUsed: a.hintsUsed + 1 }
          : a
      );

      return {
        ...prev,
        puzzleAttempts: newAttempts,
        totalHintsUsed: prev.totalHintsUsed + 1,
        currentChapterHints: prev.currentChapterHints + 1,
      };
    });
  }, []);

  // 惩罚系统方法
  const recordError = useCallback((chapterId: ChapterId) => {
    setState(prev => {
      const errorCount = prev.currentChapterErrors + 1;
      const consecutiveErrors = prev.consecutiveErrors + 1;
      
      // 计算扣分（递增惩罚）
      let penalty = 0;
      if (errorCount === 1) penalty = 5;
      else if (errorCount === 2) penalty = 10;
      else if (errorCount === 3) penalty = 15;
      else penalty = 20;
      
      // 计算质量评级下降
      let qualityDelta = 0;
      if (errorCount <= 2) qualityDelta = -1;
      else qualityDelta = -2;
      
      const newQuality = Math.max(1, prev.qualityRating + qualityDelta);
      const newScore = Math.max(0, prev.totalScore - penalty);
      const newChapterScore = Math.max(0, prev.chapterScores[chapterId] - penalty);
      
      return {
        ...prev,
        totalScore: newScore,
        chapterScores: {
          ...prev.chapterScores,
          [chapterId]: newChapterScore,
        },
        currentChapterErrors: errorCount,
        consecutiveErrors,
        qualityRating: newQuality,
        totalErrors: prev.totalErrors + 1,
      };
    });
  }, []);

  const recordSuccess = useCallback(() => {
    setState(prev => ({
      ...prev,
      consecutiveErrors: 0, // 重置连续错误
    }));
  }, []);

  const addTimePenalty = useCallback((seconds: number) => {
    setState(prev => ({
      ...prev,
      timePenalty: prev.timePenalty + seconds,
    }));
  }, []);

  const updateQualityRating = useCallback((delta: number) => {
    setState(prev => ({
      ...prev,
      qualityRating: Math.max(1, Math.min(5, prev.qualityRating + delta)),
    }));
  }, []);

  const resetChapterStats = useCallback(() => {
    setState(prev => ({
      ...prev,
      currentChapterErrors: 0,
      currentChapterHints: 0,
      consecutiveErrors: 0,
      qualityRating: 5,
    }));
  }, []);

  // 结局计算 - 更严格的评分标准
  const calculateEnding = useCallback((): EndingRank => {
    const score = state.totalScore;
    const errors = state.totalErrors;
    
    // 如果错误次数过多，直接降级
    if (errors > 20) return 'F';  // 灾难性失败
    if (errors > 15) return 'D';  // 设计失败
    
    // 基于分数的评级（更严格）
    if (score >= 120) return 'S';  // 完美表现
    if (score >= 100) return 'A';  // 优秀
    if (score >= 80) return 'B';   // 良好
    if (score >= 60) return 'C';   // 及格
    if (score >= 40) return 'D';   // 不及格
    return 'F';  // 失败
  }, [state.totalScore, state.totalErrors]);

  // 重置游戏
  const resetGame = useCallback(() => {
    setState(initialState);
    localStorage.removeItem('game_state');
    console.log('[Game] Reset to initial state');
  }, []);

  const value: GameContextType = {
    state,
    setCurrentChapter,
    completeChapter,
    addScore,
    deductScore,
    unlockAchievement,
    checkAchievement,
    updateKnowledgePoint,
    recordAttempt,
    recordHint,
    recordError,
    recordSuccess,
    addTimePenalty,
    updateQualityRating,
    resetChapterStats,
    calculateEnding,
    resetGame,
  };

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
}

export function useGame() {
  const context = useContext(GameContext);
  if (context === undefined) {
    throw new Error('useGame must be used within a GameProvider');
  }
  return context;
}
