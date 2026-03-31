/**
 * 游戏状态类型定义
 */

export type ChapterId = 'prologue' | 'chapter1' | 'chapter2' | 'chapter3' | 'ending';

export type EndingRank = 'S' | 'A' | 'B' | 'C' | 'D' | 'F' | null;

export type AchievementId = 
  | 'clue_hunter'          // 问题猎手
  | 'requirement_analyst'  // 需求分析师
  | 'blackbox_master'      // 黑箱大师
  | 'screening_expert'     // 筛选专家
  | 'tech_language_master' // 技术语言大师
  | 'optimization_expert'  // 优化专家
  | 'hmi_master'           // 人机关系大师
  | 'speedrunner'          // 速通者
  | 'perfectionist'        // 完美主义者
  | 'knowledge_seeker'     // 知识渊博
  | 'persistent'           // 不屈不挠
  | 's_rank_investigator'  // S级调查员
  | 'achievement_hunter';  // 全成就收集者

export type KnowledgePointId =
  | 'requirement_analysis'  // 需求分析
  | 'blackbox_method'       // 黑箱法
  | 'screening_method'      // 筛选法
  | 'drawing_skills'        // 绘图技巧
  | 'ergonomics';           // 人机关系

export interface Achievement {
  id: AchievementId;
  name: string;
  description: string;
  icon: string;
  unlocked: boolean;
  unlockedAt?: number;
}

export interface KnowledgePoint {
  id: KnowledgePointId;
  name: string;
  description: string;
  mastery: 'excellent' | 'good' | 'needs_improvement' | 'not_started';
}

export interface ChapterProgress {
  id: ChapterId;
  completed: boolean;
  attempts: number;
  score: number;
  startTime?: number;
  endTime?: number;
}

export interface PuzzleAttempt {
  chapterId: ChapterId;
  puzzleId: string;
  attempts: number;
  hintsUsed: number;
  solved: boolean;
  errors: string[];
}

export interface GameState {
  // 基础进度
  currentChapter: ChapterId;
  completedChapters: ChapterId[];
  
  // 评分系统
  totalScore: number;
  chapterScores: Record<ChapterId, number>;
  
  // 成就系统
  achievements: Record<AchievementId, Achievement>;
  unlockedAchievements: AchievementId[];
  
  // 知识点掌握度
  knowledgePoints: Record<KnowledgePointId, KnowledgePoint>;
  
  // 章节进度
  chapters: Record<ChapterId, ChapterProgress>;
  
  // 解谜尝试记录
  puzzleAttempts: PuzzleAttempt[];
  
  // 结局
  endingRank: EndingRank;
  
  // 游戏时间
  startTime: number;
  totalPlayTime: number;
  
  // 统计数据
  totalAttempts: number;
  totalHintsUsed: number;
  totalErrors: number;
}

export interface GameContextType {
  state: GameState;
  
  // 章节管理
  setCurrentChapter: (chapterId: ChapterId) => void;
  completeChapter: (chapterId: ChapterId, score: number) => void;
  
  // 评分管理
  addScore: (points: number, chapterId?: ChapterId) => void;
  deductScore: (points: number, chapterId?: ChapterId) => void;
  
  // 成就管理
  unlockAchievement: (achievementId: AchievementId) => void;
  checkAchievement: (achievementId: AchievementId) => boolean;
  
  // 知识点管理
  updateKnowledgePoint: (pointId: KnowledgePointId, mastery: KnowledgePoint['mastery']) => void;
  
  // 解谜记录
  recordAttempt: (chapterId: ChapterId, puzzleId: string, success: boolean, error?: string) => void;
  recordHint: (chapterId: ChapterId, puzzleId: string) => void;
  
  // 结局计算
  calculateEnding: () => EndingRank;
  
  // 重置游戏
  resetGame: () => void;
}
