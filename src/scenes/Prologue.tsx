import React, { useState, useEffect } from 'react';
import { Flashlight } from '../components/Flashlight';
import { Typewriter } from '../components/Typewriter';
import { Glitch } from '../components/Glitch';
import { HintBox } from '../components/HintBox';
import { SceneBackground } from '../components/SceneBackground';
import { ScoreDisplay } from '../components/ScoreDisplay';
import { AchievementToast } from '../components/AchievementToast';
import { Timer } from '../components/Timer';
import { QualityRating } from '../components/QualityRating';
import { ExpertFeedback } from '../components/ExpertFeedback';
import { TechDashboard } from '../components/TechDashboard';
import { VillageExplorer } from '../components/VillageExplorer';
import { RandomEvent, RandomEventGenerator, type RandomEvent as RandomEventType } from '../components/RandomEvent';
import { FeedbackAnimation, feedbackManager, type Feedback } from '../components/FeedbackAnimation';
import { soundEffects } from '../utils/soundEffects';
import { useGame } from '../hooks/useGame';
import { Search, ZapOff, AlertTriangle, FileText, CheckCircle2, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';
import type { Achievement } from '../types/game';

type Phase = 'intro' | 'explore' | 'puzzle' | 'classify' | 'outro';

interface Clue {
  id: string;
  label: string;
  found: boolean;
  icon: React.ReactNode;
  x: string;
  y: string;
  desc: string;
}

export function Prologue({ onComplete }: { onComplete?: () => void }) {
  const { state, addScore, deductScore, unlockAchievement, recordAttempt, recordError, recordSuccess, resetChapterStats, completeChapter } = useGame();
  
  const [phase, setPhase] = useState<Phase>('intro');
  const [introStep, setIntroStep] = useState(0);
  const [outroStep, setOutroStep] = useState(0);
  const [showNextBtn, setShowNextBtn] = useState(false);
  
  // 失败提示系统状态
  const [attempts, setAttempts] = useState(0);
  const [showHint, setShowHint] = useState(false);
  const [hintLevel, setHintLevel] = useState<1 | 2 | 3>(1);
  
  // 成就弹窗状态
  const [currentAchievement, setCurrentAchievement] = useState<Achievement | null>(null);
  
  // 纯科学情感增强状态
  const [qualityRating, setQualityRating] = useState(5);
  const [showExpertFeedback, setShowExpertFeedback] = useState(false);
  const [expertFeedback, setExpertFeedback] = useState({ type: 'info' as const, message: '', expert: '' });
  
  // 新增：随机事件和反馈系统
  const [randomEvent, setRandomEvent] = useState<RandomEventType | null>(null);
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [eventGenerator] = useState(() => new RandomEventGenerator());
  
  // 初始化时重置章节统计
  useEffect(() => {
    resetChapterStats();
    soundEffects.setEnabled(true);
  }, [resetChapterStats]);
  const [timerPaused, setTimerPaused] = useState(true);
  const [timeBonus, setTimeBonus] = useState(0);
  
  const [clues, setClues] = useState<Clue[]>([
    { id: 'bridge', label: '栏杆高度异常', desc: '断桥的栏杆低矮且破损，起不到防护作用。', found: false, icon: <AlertTriangle className="w-8 h-8 text-yellow-500" />, x: '25%', y: '55%' },
    { id: 'station', label: '枯水期经常停电', desc: '废弃的水电站，枯水期根本无法提供稳定的市电。', found: false, icon: <ZapOff className="w-8 h-8 text-blue-500" />, x: '75%', y: '35%' },
    { id: 'chief', label: '村民夜间看急诊', desc: '老村长叹气："村里老人多，半夜经常要去镇上看急诊，摸黑过桥太危险了。"', found: false, icon: <Search className="w-8 h-8 text-green-500" />, x: '50%', y: '70%' },
    { id: 'moss', label: '桥面湿滑有青苔', desc: '桥面常年潮湿，长满青苔，雨天更加湿滑危险。', found: false, icon: <AlertTriangle className="w-8 h-8 text-orange-500" />, x: '40%', y: '45%' },
    { id: 'elderly', label: '老人视力不佳', desc: '村里多是老年人，夜间视力差，看不清路况。', found: false, icon: <Search className="w-8 h-8 text-purple-500" />, x: '60%', y: '60%' },
  ]);

  const [selectedClue, setSelectedClue] = useState<string | null>(null);
  const [matches, setMatches] = useState<Record<string, string>>({});
  
  // 需求分类阶段状态
  const [classifications, setClassifications] = useState<Record<string, string>>({});
  const [selectedRequirement, setSelectedRequirement] = useState<string | null>(null);
  const [classifyAttempts, setClassifyAttempts] = useState(0);

  const allCluesFound = clues.every(c => c.found);
  
  useEffect(() => {
    if (phase === 'explore' && allCluesFound) {
      setTimeout(() => {
        setPhase('puzzle');
        setTimerPaused(false); // 开始倒计时
      }, 2000);
    }
  }, [allCluesFound, phase]);
  
  // 监听成就解锁
  useEffect(() => {
    const prevUnlocked = state.unlockedAchievements.length;
    if (state.unlockedAchievements.length > prevUnlocked) {
      const latestAchievement = state.unlockedAchievements[state.unlockedAchievements.length - 1];
      const achievement = state.achievements[latestAchievement];
      if (achievement) {
        setCurrentAchievement(achievement);
      }
    }
  }, [state.unlockedAchievements, state.achievements]);

  const handleClueClick = (id: string) => {
    soundEffects.click();
    setClues(prev => prev.map(c => c.id === id ? { ...c, found: true } : c));
    
    // 发现线索时有20%概率触发突发状况事件
    if (Math.random() < 0.2) {
      const event = eventGenerator.getRandomEvent('prologue', 'trouble');
      if (event) {
        soundEffects.randomEvent();
        setRandomEvent(event);
      }
    }
  };

  const handleMatch = (targetId: string) => {
    if (selectedClue) {
      // 检查是否正确匹配（5个线索）
      const isCorrect = 
        (selectedClue === 'chief' && targetId === 'req') ||
        (selectedClue === 'station' && targetId === 'const') ||
        (selectedClue === 'bridge' && targetId === 'prob') ||
        (selectedClue === 'moss' && targetId === 'env') ||
        (selectedClue === 'elderly' && targetId === 'user');
      
      if (!isCorrect) {
        // 播放错误音效
        soundEffects.error();
        
        // 显示错误反馈动画
        feedbackManager.showError('匹配错误！请重新思考线索与需求的关系');
        feedbackManager.showScore(-5);
        
        // 错误匹配 - 记录尝试并显示提示
        const newAttempts = attempts + 1;
        setAttempts(newAttempts);
        recordAttempt('prologue', 'requirement_matching', false, `错误匹配: ${selectedClue} -> ${targetId}`);
        recordError('prologue'); // 使用新的惩罚系统
        
        // 降低质量评级
        const newRating = Math.max(1, qualityRating - 1);
        setQualityRating(newRating);
        
        // 显示专家反馈
        const feedback = getExpertFeedback(newRating, newAttempts);
        setExpertFeedback(feedback);
        setShowExpertFeedback(true);
        
        // 根据尝试次数显示不同级别的提示
        if (newAttempts === 1) {
          setHintLevel(1);
          setShowHint(true);
        } else if (newAttempts === 2) {
          setHintLevel(2);
          setShowHint(true);
          // 触发随机事件：专家访问
          if (Math.random() < 0.3) {
            const event = eventGenerator.getRandomEvent('prologue', 'expert');
            if (event) {
              soundEffects.randomEvent();
              setRandomEvent(event);
            }
          }
        } else if (newAttempts >= 3) {
          setHintLevel(3);
          setShowHint(true);
          soundEffects.warning();
        }
        
        // 质量不达标 - 强制重新开始
        if (newRating <= 1) {
          setTimeout(() => {
            soundEffects.warning();
            alert('设计质量不达标！\n技术方案被专家组驳回\n需要重新进行需求分析\n-50分');
            deductScore(50, 'prologue');
            // 重置状态
            setQualityRating(5);
            setAttempts(0);
            setMatches({});
            setSelectedClue(null);
            setShowHint(false);
          }, 2000);
        }
        
        // 不保存错误匹配
        setSelectedClue(null);
        return;
      }
      
      // 正确匹配
      soundEffects.match();
      feedbackManager.showSuccess('匹配正确！');
      recordSuccess(); // 重置连续错误
      
      setMatches(prev => {
        const newMatches = { ...prev };
        Object.keys(newMatches).forEach(key => {
          if (newMatches[key] === targetId) {
            delete newMatches[key];
          }
        });
        newMatches[selectedClue] = targetId;
        return newMatches;
      });
      setSelectedClue(null);
      recordAttempt('prologue', 'requirement_matching', true);
      
      // 触发幸运事件（15%概率）
      if (Math.random() < 0.15) {
        const event = eventGenerator.getRandomEvent('prologue', 'lucky');
        if (event) {
          soundEffects.randomEvent();
          setRandomEvent(event);
        }
      }
    } else {
      // Unmatch if already matched
      setMatches(prev => {
        const newMatches = { ...prev };
        Object.keys(newMatches).forEach(key => {
          if (newMatches[key] === targetId) {
            delete newMatches[key];
          }
        });
        return newMatches;
      });
    }
  };

  // 专家反馈函数
  const getExpertFeedback = (rating: number, attempts: number) => {
    if (rating === 4) {
      return {
        type: 'warning' as const,
        message: '这个方案有待商榷，建议重新考虑需求分析的准确性...',
        expert: '技术顾问'
      };
    } else if (rating === 3) {
      return {
        type: 'warning' as const,
        message: '注意！设计偏离了标准的需求分析流程，请仔细核对',
        expert: '项目经理'
      };
    } else if (rating === 2) {
      return {
        type: 'error' as const,
        message: '严重警告！需求分析存在重大缺陷，必须立即纠正',
        expert: '总工程师'
      };
    } else {
      return {
        type: 'error' as const,
        message: '该方案存在根本性错误，不符合工程标准',
        expert: '评审委员会'
      };
    }
  };

  // 倒计时结束处理
  const handleTimeout = () => {
    setTimerPaused(true);
    alert('时间到！项目延期\n未能在规定时间内完成需求分析\n-20分');
    deductScore(20, 'prologue');
    setQualityRating(prev => Math.max(1, prev - 1));
  };

  // 完成时的时间奖励
  const handleTimerComplete = (remainingTime: number) => {
    const totalTime = 300; // 5分钟
    const percentage = (remainingTime / totalTime) * 100;
    
    if (percentage > 50) {
      setTimeBonus(10);
      addScore(10, 'prologue');
      setExpertFeedback({
        type: 'success',
        message: '出色的时间管理！提前完成需求分析工作',
        expert: '项目经理'
      });
      setShowExpertFeedback(true);
    } else if (percentage > 30) {
      setTimeBonus(5);
      addScore(5, 'prologue');
    }
  };

  const isPuzzleComplete = 
    matches['chief'] === 'req' && 
    matches['station'] === 'const' && 
    matches['bridge'] === 'prob' &&
    matches['moss'] === 'env' &&
    matches['elderly'] === 'user';
  
  // 完成第一阶段匹配时的处理
  useEffect(() => {
    if (isPuzzleComplete && phase === 'puzzle') {
      // 播放成功音效
      soundEffects.success();
      
      // 根据尝试次数给分（5个线索，难度更高）
      if (attempts === 0) {
        addScore(40, 'prologue'); // 完美表现：40分
        feedbackManager.showScore(40);
        feedbackManager.showAchievement('需求分析师');
        const achievement = state.achievements['requirement_analyst'];
        unlockAchievement('requirement_analyst');
        setCurrentAchievement(achievement);
        
        // 完美表现的专家反馈
        setExpertFeedback({
          type: 'success',
          message: '完美的需求分析！零失误完成5个线索匹配，展现了卓越的专业水准',
          expert: '院士评审'
        });
        setShowExpertFeedback(true);
      } else if (attempts <= 2) {
        addScore(35, 'prologue'); // 优秀：35分
        feedbackManager.showScore(35);
        setExpertFeedback({
          type: 'success',
          message: '优秀的需求分析能力，全面考虑了各类因素',
          expert: '技术专家'
        });
        setShowExpertFeedback(true);
      } else if (attempts <= 4) {
        addScore(30, 'prologue'); // 良好：30分
        feedbackManager.showScore(30);
      } else if (attempts <= 6) {
        addScore(25, 'prologue'); // 及格：25分
        feedbackManager.showScore(25);
      } else {
        addScore(20, 'prologue'); // 勉强通过：20分
        feedbackManager.showScore(20);
      }
      
      if (allCluesFound) {
        const achievement = state.achievements['clue_hunter'];
        unlockAchievement('clue_hunter');
        setTimeout(() => {
          setCurrentAchievement(achievement);
          feedbackManager.showAchievement('问题猎手');
        }, 500);
      }
      
      // 进入需求分类阶段
      setTimeout(() => {
        soundEffects.pageTransition();
        setPhase('classify');
      }, 1500);
    }
  }, [isPuzzleComplete, phase, attempts, allCluesFound, addScore, unlockAchievement, state.achievements]);
  
  // 需求分类处理函数
  const handleClassify = (categoryId: string) => {
    if (selectedRequirement) {
      // 检查分类是否正确
      const isCorrect = 
        (selectedRequirement === 'req' && categoryId === 'functional') ||
        (selectedRequirement === 'prob' && categoryId === 'functional') ||
        (selectedRequirement === 'const' && categoryId === 'constraint') ||
        (selectedRequirement === 'env' && categoryId === 'constraint') ||
        (selectedRequirement === 'user' && categoryId === 'non-functional');
      
      if (!isCorrect) {
        soundEffects.error();
        feedbackManager.showError('分类错误！请重新思考需求的性质');
        feedbackManager.showScore(-3);
        setClassifyAttempts(prev => prev + 1);
        recordError('prologue');
        setSelectedRequirement(null);
        return;
      }
      
      // 正确分类
      soundEffects.match();
      feedbackManager.showSuccess('分类正确！');
      recordSuccess();
      
      setClassifications(prev => {
        const newClassifications = { ...prev };
        Object.keys(newClassifications).forEach(key => {
          if (newClassifications[key] === categoryId) {
            delete newClassifications[key];
          }
        });
        newClassifications[selectedRequirement] = categoryId;
        return newClassifications;
      });
      setSelectedRequirement(null);
    } else {
      setClassifications(prev => {
        const newClassifications = { ...prev };
        Object.keys(newClassifications).forEach(key => {
          if (newClassifications[key] === categoryId) {
            delete newClassifications[key];
          }
        });
        return newClassifications;
      });
    }
  };
  
  // 检查分类是否完成
  const isClassifyComplete = 
    classifications['req'] === 'functional' &&
    classifications['prob'] === 'functional' &&
    classifications['const'] === 'constraint' &&
    classifications['env'] === 'constraint' &&
    classifications['user'] === 'non-functional';
  
  // 完成分类阶段时的处理
  useEffect(() => {
    if (isClassifyComplete && phase === 'classify') {
      soundEffects.chapterComplete();
      
      // 根据分类错误次数给分
      if (classifyAttempts === 0) {
        addScore(30, 'prologue');
        feedbackManager.showScore(30);
        setExpertFeedback({
          type: 'success',
          message: '完美的需求分类！准确理解了各类需求的本质',
          expert: '需求工程专家'
        });
        setShowExpertFeedback(true);
      } else if (classifyAttempts <= 2) {
        addScore(25, 'prologue');
        feedbackManager.showScore(25);
      } else if (classifyAttempts <= 4) {
        addScore(20, 'prologue');
        feedbackManager.showScore(20);
      } else {
        addScore(15, 'prologue');
        feedbackManager.showScore(15);
      }
      
      setTimeout(() => {
        soundEffects.pageTransition();
        setPhase('outro');
      }, 1500);
    }
  }, [isClassifyComplete, phase, classifyAttempts, addScore]);
  
  // 提示消息
  const getHintMessage = () => {
    if (hintLevel === 1) {
      return '似乎有些不对劲……再仔细想想？';
    } else if (hintLevel === 2) {
      return '注意区分"用户需求"（谁需要什么）和"系统约束"（环境限制）。';
    } else {
      return '让我们回顾一下需求分析的核心概念。';
    }
  };
  
  const getKnowledgePoint = () => {
    if (hintLevel === 3) {
      return {
        title: '需求分析',
        content: '需求分析包括：用户需求（关注使用者的需要）、系统约束（环境和资源限制）、问题定义（识别核心问题）。',
        example: '• 用户需求：村民夜间看急诊需要安全照明\n• 系统约束：枯水期经常停电，不能完全依赖市电\n• 发现问题：断桥栏杆存在安全隐患',
      };
    }
    return undefined;
  };

  return (
    <SceneBackground scene="prologue">
      <div className="relative z-10 w-full h-screen text-slate-200 font-sans overflow-hidden tech-grid flex flex-col">
        {/* 纯科学情感增强组件 */}
        {phase === 'puzzle' && (
          <>
            <Timer
              duration={300}
              onTimeout={handleTimeout}
              onComplete={handleTimerComplete}
              paused={timerPaused}
            />
            <QualityRating rating={qualityRating} />
            <TechDashboard
              metrics={[
                { 
                  label: '分析准确率', 
                  value: Math.max(0, 100 - attempts * 15), 
                  unit: '%', 
                  status: attempts === 0 ? 'good' : attempts <= 2 ? 'warning' : 'danger',
                  trend: attempts === 0 ? 'stable' : 'down'
                },
                { 
                  label: '设计质量', 
                  value: qualityRating, 
                  unit: '星', 
                  status: qualityRating >= 4 ? 'good' : qualityRating >= 3 ? 'warning' : 'danger',
                  trend: qualityRating === 5 ? 'stable' : 'down'
                },
                { 
                  label: '错误次数', 
                  value: attempts, 
                  unit: '次', 
                  status: attempts === 0 ? 'good' : attempts <= 2 ? 'warning' : 'danger',
                  trend: attempts > 0 ? 'up' : 'stable'
                }
              ]}
              predictedRank={
                state.totalScore >= 120 ? 'S级' :
                state.totalScore >= 100 ? 'A级' :
                state.totalScore >= 80 ? 'B级' :
                state.totalScore >= 60 ? 'C级' :
                state.totalScore >= 40 ? 'D级' : 'F级'
              }
            />
          </>
        )}
        
        <ExpertFeedback
          type={expertFeedback.type}
          message={expertFeedback.message}
          expert={expertFeedback.expert}
          show={showExpertFeedback}
          onClose={() => setShowExpertFeedback(false)}
        />
        
        {/* 随机事件 */}
        <RandomEvent
          event={randomEvent}
          onClose={() => setRandomEvent(null)}
        />
        
        {/* 反馈动画 */}
        <FeedbackAnimation
          feedback={feedback}
          onComplete={() => setFeedback(null)}
        />
        
        {/* Header */}
        <header className="p-4 border-b border-slate-800 flex justify-between items-center bg-black/50 backdrop-blur-sm">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-blue-600" />
          <span className="font-mono text-sm tracking-widest text-slate-400">技术设计调查组 // 项目编号: TD-001</span>
        </div>
        <div className="flex items-center gap-4">
          <div className="font-mono text-xs text-slate-500">
            {phase === 'intro' && 'SYS.INIT'}
            {phase === 'explore' && 'SCANNING...'}
            {phase === 'puzzle' && 'DATA.ANALYSIS'}
            {phase === 'outro' && 'CASE.UPDATED'}
          </div>
          <ScoreDisplay score={state.totalScore} />
        </div>
      </header>
      
      {/* 成就解锁弹窗 */}
      <AchievementToast 
        achievement={currentAchievement} 
        onClose={() => setCurrentAchievement(null)} 
      />

      {/* Main Content */}
      <main className="flex-1 relative">
        <AnimatePresence mode="wait">
          
          {/* INTRO PHASE */}
          {phase === 'intro' && (
            <motion.div 
              key="intro"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 flex flex-col items-center justify-center p-8 max-w-3xl mx-auto text-lg leading-relaxed"
            >
              <div className="space-y-6 min-h-[200px]">
                {introStep >= 0 && (
                  <p><Typewriter text="李家坳村口的断桥近期发生了三起" onComplete={() => setTimeout(() => setIntroStep(1), 500)} />
                  {introStep >= 1 && <span className="mx-1 text-red-400 font-bold">安全事故</span>}
                  {introStep >= 1 && <Typewriter text="，村民在夜间通过时多次跌落受伤。" onComplete={() => setTimeout(() => setIntroStep(2), 1000)} />}</p>
                )}
                
                {introStep >= 2 && (
                  <p><Typewriter text="省级安全检查组要求立即进行技术评估。你作为技术设计调查组成员，需要运用" onComplete={() => setTimeout(() => setIntroStep(3), 500)} />
                  {introStep >= 3 && <span className="mx-1 text-blue-400 font-bold">需求分析方法</span>}
                  {introStep >= 3 && <Typewriter text="找出问题根源。" onComplete={() => setTimeout(() => setIntroStep(4), 1000)} />}</p>
                )}

                {introStep >= 4 && (
                  <p className="text-blue-400 font-mono text-sm mt-8">
                    <Typewriter text="> 任务：前往现场调查，收集技术线索，完成需求分析报告。" onComplete={() => setTimeout(() => setPhase('explore'), 500)} />
                  </p>
                )}
              </div>
            </motion.div>
          )}

          {/* EXPLORE PHASE - 村庄探索 */}
          {phase === 'explore' && (
            <motion.div 
              key="explore"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0"
            >
              <VillageExplorer
                onClueCollected={(clueId, clueLabel) => {
                  // 更新线索状态
                  setClues(prev => prev.map(c => 
                    c.id === clueId ? { ...c, found: true } : c
                  ));
                  
                  // 播放音效和显示反馈
                  soundEffects.success();
                  feedbackManager.showSuccess(`发现线索：${clueLabel}`);
                  recordSuccess();
                  
                  // 触发随机事件
                  if (Math.random() < 0.2) {
                    const event = eventGenerator.getRandomEvent('prologue', 'discovery');
                    if (event) {
                      soundEffects.randomEvent();
                      setRandomEvent(event);
                    }
                  }
                }}
                onAllCluesCollected={() => {
                  // 所有线索收集完毕
                  soundEffects.chapterComplete();
                  feedbackManager.showAchievement('线索收集完成！');
                }}
                collectedClues={clues.filter(c => c.found).map(c => c.id)}
              />
            </motion.div>
          )}

          {/* PUZZLE PHASE */}
          {phase === 'puzzle' && (
            <motion.div 
              key="puzzle"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 flex flex-col items-center justify-center p-8 bg-slate-950"
            >
              <div className="max-w-4xl w-full">
                <h2 className="text-2xl font-bold mb-2 text-blue-400 flex items-center gap-2">
                  <FileText className="w-6 h-6" />
                  档案袋：现象分析与术语匹配
                </h2>
                <p className="text-slate-400 mb-8 font-mono text-sm">将收集到的现场线索，匹配到对应的工程术语中。先点击左侧线索，再点击右侧目标。</p>

                <div className="grid grid-cols-2 gap-12">
                  {/* Clues List */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-slate-300 border-b border-slate-800 pb-2">现场线索</h3>
                    {clues.map(clue => {
                      const isMatched = Object.values(matches).includes(clue.id);
                      return (
                        <motion.button
                          key={clue.id}
                          onClick={() => !isMatched && setSelectedClue(clue.id)}
                          className={cn(
                            "w-full text-left p-4 rounded border transition-all",
                            isMatched ? "bg-slate-900 border-slate-800 text-slate-600 cursor-not-allowed" :
                            selectedClue === clue.id ? "bg-blue-900/30 border-blue-500 text-blue-300 shadow-[0_0_15px_rgba(59,130,246,0.2)]" :
                            "bg-slate-900/50 border-slate-700 text-slate-300 hover:border-slate-500"
                          )}
                        >
                          <div className="flex items-center gap-3">
                            {clue.icon}
                            <span>{clue.label}</span>
                          </div>
                        </motion.button>
                      )
                    })}
                  </div>

                  {/* Targets List */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-slate-300 border-b border-slate-800 pb-2">技术设计要素</h3>
                    {[
                      { id: 'req', label: '用户需求', desc: '需要安全照明' },
                      { id: 'const', label: '系统约束', desc: '不能完全依赖市电' },
                      { id: 'prob', label: '发现问题', desc: '桥梁存在安全隐患' },
                      { id: 'env', label: '环境因素', desc: '外部环境影响' },
                      { id: 'user', label: '用户特征', desc: '使用者特点' }
                    ].map(target => {
                      const matchedClueId = Object.keys(matches).find(key => matches[key] === target.id);
                      const matchedClue = clues.find(c => c.id === matchedClueId);
                      const isCorrect = 
                        (target.id === 'req' && matchedClueId === 'chief') ||
                        (target.id === 'const' && matchedClueId === 'station') ||
                        (target.id === 'prob' && matchedClueId === 'bridge') ||
                        (target.id === 'env' && matchedClueId === 'moss') ||
                        (target.id === 'user' && matchedClueId === 'elderly');

                      return (
                        <div
                          key={target.id}
                          onClick={() => handleMatch(target.id)}
                          className={cn(
                            "w-full p-4 rounded border-2 border-dashed transition-all",
                            matchedClue ? (isCorrect ? "bg-green-900/20 border-green-500/50 cursor-pointer" : "bg-red-900/20 border-red-500/50 cursor-pointer") :
                            selectedClue ? "border-blue-500/50 bg-blue-900/10 cursor-pointer hover:bg-blue-900/20" :
                            "border-slate-800 bg-black/50"
                          )}
                        >
                          <div className="flex justify-between items-center mb-2">
                            <span className="font-bold text-slate-200">{target.label}</span>
                            <span className="text-xs text-slate-500">{target.desc}</span>
                          </div>
                          <div className="min-h-[40px] flex items-center">
                            {matchedClue ? (
                              <div className="flex items-center gap-2 text-sm text-slate-300">
                                <ArrowRight className="w-4 h-4 text-slate-500" />
                                {matchedClue.label}
                                {isCorrect ? <CheckCircle2 className="w-4 h-4 text-green-500 ml-2" /> : <AlertTriangle className="w-4 h-4 text-red-500 ml-2" />}
                              </div>
                            ) : (
                              <span className="text-sm text-slate-600 italic">等待匹配...</span>
                            )}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>

                {/* 提示框 */}
                {showHint && (
                  <div className="mt-8">
                    <HintBox
                      level={hintLevel}
                      message={getHintMessage()}
                      knowledgePoint={getKnowledgePoint()}
                      onClose={() => setShowHint(false)}
                    />
                  </div>
                )}

                {isPuzzleComplete && (
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-12 text-center"
                  >
                    <p className="text-green-400 mb-4">✓ 第一阶段完成！准备进入需求分类...</p>
                  </motion.div>
                )}
              </div>
            </motion.div>
          )}

          {/* CLASSIFY PHASE - 需求分类 */}
          {phase === 'classify' && (
            <motion.div 
              key="classify"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 flex flex-col items-center justify-center p-8 bg-slate-950"
            >
              <div className="max-w-4xl w-full">
                <h2 className="text-2xl font-bold mb-2 text-blue-400 flex items-center gap-2">
                  <FileText className="w-6 h-6" />
                  第二阶段：需求分类
                </h2>
                <p className="text-slate-400 mb-8 font-mono text-sm">
                  将已识别的需求进行分类。先点击左侧需求，再点击右侧分类。
                </p>

                <div className="grid grid-cols-2 gap-12">
                  {/* Requirements List */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-slate-300 border-b border-slate-800 pb-2">已识别需求</h3>
                    {[
                      { id: 'req', label: '用户需求', desc: '需要安全照明' },
                      { id: 'const', label: '系统约束', desc: '不能完全依赖市电' },
                      { id: 'prob', label: '发现问题', desc: '桥梁存在安全隐患' },
                      { id: 'env', label: '环境因素', desc: '外部环境影响' },
                      { id: 'user', label: '用户特征', desc: '使用者特点' }
                    ].map(req => {
                      const isClassified = Object.values(classifications).includes(req.id);
                      return (
                        <motion.button
                          key={req.id}
                          onClick={() => !isClassified && setSelectedRequirement(req.id)}
                          className={cn(
                            "w-full text-left p-4 rounded border transition-all",
                            isClassified ? "bg-slate-900 border-slate-800 text-slate-600 cursor-not-allowed" :
                            selectedRequirement === req.id ? "bg-blue-900/30 border-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.3)]" :
                            "bg-slate-900/50 border-slate-700 hover:border-blue-500/50 cursor-pointer"
                          )}
                          whileHover={!isClassified ? { scale: 1.02 } : {}}
                          whileTap={!isClassified ? { scale: 0.98 } : {}}
                        >
                          <div className="font-bold text-slate-200 mb-1">{req.label}</div>
                          <div className="text-xs text-slate-500">{req.desc}</div>
                        </motion.button>
                      );
                    })}
                  </div>

                  {/* Categories List */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-slate-300 border-b border-slate-800 pb-2">需求分类</h3>
                    {[
                      { 
                        id: 'functional', 
                        label: '功能性需求', 
                        desc: '系统必须提供的功能',
                        examples: '照明、防护等直接功能'
                      },
                      { 
                        id: 'non-functional', 
                        label: '非功能性需求', 
                        desc: '系统的质量属性',
                        examples: '可靠性、安全性、可用性'
                      },
                      { 
                        id: 'constraint', 
                        label: '约束条件', 
                        desc: '设计和实施的限制',
                        examples: '成本、环境、技术限制'
                      }
                    ].map(category => {
                      const classifiedReqId = Object.keys(classifications).find(key => classifications[key] === category.id);
                      const classifiedReq = classifiedReqId ? 
                        [
                          { id: 'req', label: '用户需求' },
                          { id: 'const', label: '系统约束' },
                          { id: 'prob', label: '发现问题' },
                          { id: 'env', label: '环境因素' },
                          { id: 'user', label: '用户特征' }
                        ].find(r => r.id === classifiedReqId) : null;
                      
                      const isCorrect = 
                        (category.id === 'functional' && (classifiedReqId === 'req' || classifiedReqId === 'prob')) ||
                        (category.id === 'non-functional' && classifiedReqId === 'user') ||
                        (category.id === 'constraint' && (classifiedReqId === 'const' || classifiedReqId === 'env'));

                      return (
                        <div
                          key={category.id}
                          onClick={() => handleClassify(category.id)}
                          className={cn(
                            "w-full p-4 rounded border-2 border-dashed transition-all",
                            classifiedReq ? (isCorrect ? "bg-green-900/20 border-green-500/50 cursor-pointer" : "bg-red-900/20 border-red-500/50 cursor-pointer") :
                            selectedRequirement ? "border-blue-500/50 bg-blue-900/10 cursor-pointer hover:bg-blue-900/20" :
                            "border-slate-800 bg-black/50"
                          )}
                        >
                          <div className="font-bold text-slate-200 mb-1">{category.label}</div>
                          <div className="text-xs text-slate-500 mb-2">{category.desc}</div>
                          <div className="text-xs text-slate-600 italic mb-2">示例：{category.examples}</div>
                          <div className="min-h-[30px] flex items-center">
                            {classifiedReq ? (
                              <div className="flex items-center gap-2 text-sm text-slate-300">
                                <ArrowRight className="w-4 h-4 text-slate-500" />
                                {classifiedReq.label}
                                {isCorrect ? <CheckCircle2 className="w-4 h-4 text-green-500 ml-2" /> : <AlertTriangle className="w-4 h-4 text-red-500 ml-2" />}
                              </div>
                            ) : (
                              <span className="text-sm text-slate-600 italic">等待分类...</span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {isClassifyComplete && (
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-12 text-center"
                  >
                    <p className="text-green-400 mb-4">✓ 需求分类完成！生成分析报告...</p>
                  </motion.div>
                )}
              </div>
            </motion.div>
          )}

          {/* OUTRO PHASE */}
          {phase === 'outro' && (
            <motion.div 
              key="outro"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center"
            >
              <CheckCircle2 className="w-16 h-16 text-green-500 mb-6" />
              <h2 className="text-3xl font-bold text-white mb-4 tracking-widest">序章 完成</h2>
              <div className="max-w-2xl text-slate-300 space-y-4 leading-relaxed">
                {outroStep >= 0 && (
                  <p>
                    <Typewriter text="通过系统的需求分析，你成功识别了三个关键技术要素：用户需求、系统约束和问题定义。" speed={30} onComplete={() => setOutroStep(1)} />
                  </p>
                )}
                {outroStep >= 1 && (
                  <p>
                    <Typewriter text="事故的根本原因是：夜间照明不足、桥梁防护设施缺失、电力供应不稳定。" speed={30} onComplete={() => setOutroStep(2)} />
                  </p>
                )}
                {outroStep >= 2 && (
                  <p className="text-blue-400 font-mono mt-8">
                    <Typewriter text="> 下一步：前往老工程师的住处，调查那个发出异响的自动化设备。" speed={30} onComplete={() => setShowNextBtn(true)} />
                  </p>
                )}
                {showNextBtn && (
                  <button
                    onClick={() => {
                      completeChapter('prologue', state.chapterScores.prologue);
                      onComplete?.();
                    }}
                    className="mt-8 px-8 py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded shadow-[0_0_20px_rgba(37,99,235,0.4)] transition-all animate-fade-in"
                  >
                    进入第一章
                  </button>
                )}
              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </main>
      </div>
    </SceneBackground>
  );
}
