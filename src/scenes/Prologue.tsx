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
import { useGame } from '../hooks/useGame';
import { Search, ZapOff, AlertTriangle, FileText, CheckCircle2, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';
import type { Achievement } from '../types/game';

type Phase = 'intro' | 'explore' | 'puzzle' | 'outro';

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
  const { state, addScore, deductScore, unlockAchievement, recordAttempt } = useGame();
  
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
  const [timerPaused, setTimerPaused] = useState(true);
  const [timeBonus, setTimeBonus] = useState(0);
  
  const [clues, setClues] = useState<Clue[]>([
    { id: 'bridge', label: '栏杆高度异常', desc: '断桥的栏杆低矮且破损，起不到防护作用。', found: false, icon: <AlertTriangle className="w-8 h-8 text-yellow-500" />, x: '25%', y: '55%' },
    { id: 'station', label: '枯水期经常停电', desc: '废弃的水电站，枯水期根本无法提供稳定的市电。', found: false, icon: <ZapOff className="w-8 h-8 text-blue-500" />, x: '75%', y: '35%' },
    { id: 'chief', label: '村民夜间看急诊', desc: '老村长叹气：“村里老人多，半夜经常要去镇上看急诊，摸黑过桥太危险了。”', found: false, icon: <Search className="w-8 h-8 text-green-500" />, x: '50%', y: '70%' },
  ]);

  const [selectedClue, setSelectedClue] = useState<string | null>(null);
  const [matches, setMatches] = useState<Record<string, string>>({});

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
    setClues(prev => prev.map(c => c.id === id ? { ...c, found: true } : c));
  };

  const handleMatch = (targetId: string) => {
    if (selectedClue) {
      // 检查是否正确匹配
      const isCorrect = 
        (selectedClue === 'chief' && targetId === 'req') ||
        (selectedClue === 'station' && targetId === 'const') ||
        (selectedClue === 'bridge' && targetId === 'prob');
      
      if (!isCorrect) {
        // 错误匹配 - 记录尝试并显示提示
        const newAttempts = attempts + 1;
        setAttempts(newAttempts);
        recordAttempt('prologue', 'requirement_matching', false, `错误匹配: ${selectedClue} -> ${targetId}`);
        
        // 降低质量评级
        const newRating = Math.max(1, qualityRating - 1);
        setQualityRating(newRating);
        
        // 增加扣分力度 - 每次错误扣5分
        deductScore(5, 'prologue');
        
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
        } else if (newAttempts >= 3) {
          setHintLevel(3);
          setShowHint(true);
        }
        
        // 质量不达标 - 强制重新开始
        if (newRating <= 1) {
          setTimeout(() => {
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

  const isPuzzleComplete = matches['chief'] === 'req' && matches['station'] === 'const' && matches['bridge'] === 'prob';
  
  // 完成谜题时的处理
  useEffect(() => {
    if (isPuzzleComplete && phase === 'puzzle') {
      setTimerPaused(true); // 停止倒计时
      
      // 根据尝试次数给分
      if (attempts === 0) {
        addScore(25, 'prologue');
        const achievement = state.achievements['requirement_analyst'];
        unlockAchievement('requirement_analyst');
        setCurrentAchievement(achievement);
        
        // 完美表现的专家反馈
        setExpertFeedback({
          type: 'success',
          message: '完美的需求分析！零失误完成所有匹配，展现了专业水准',
          expert: '院士评审'
        });
        setShowExpertFeedback(true);
      } else if (attempts <= 2) {
        addScore(20, 'prologue');
        setExpertFeedback({
          type: 'success',
          message: '优秀的需求分析能力，方案合理可行',
          expert: '技术专家'
        });
        setShowExpertFeedback(true);
      } else if (attempts <= 4) {
        addScore(15, 'prologue');
      } else {
        addScore(10, 'prologue');
      }
      
      if (allCluesFound) {
        const achievement = state.achievements['clue_hunter'];
        unlockAchievement('clue_hunter');
        setTimeout(() => setCurrentAchievement(achievement), 500);
      }
      
      setTimeout(() => setPhase('outro'), 1500);
    }
  }, [isPuzzleComplete, phase, attempts, allCluesFound, addScore, unlockAchievement, state.achievements]);
  
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

          {/* EXPLORE PHASE */}
          {phase === 'explore' && (
            <motion.div 
              key="explore"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0"
            >
              <Flashlight active={!allCluesFound}>
                <div className="w-full h-full relative bg-slate-900/20">
                  {/* Background hints */}
                  <div className="absolute inset-0 opacity-10 pointer-events-none" style={{
                    backgroundImage: 'radial-gradient(circle at 50% 50%, #1e293b 0%, #000 100%)'
                  }} />
                  
                  {clues.map((clue) => (
                    <motion.button
                      key={clue.id}
                      className={cn(
                        "absolute p-4 rounded-full transition-all duration-300",
                        clue.found ? "bg-slate-800/80 border border-slate-600" : "hover:bg-white/20 hover:shadow-lg"
                      )}
                      style={{ left: clue.x, top: clue.y, transform: 'translate(-50%, -50%)' }}
                      onClick={() => handleClueClick(clue.id)}
                      whileHover={{ scale: 1.15 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      {clue.icon}
                      {clue.found && (
                        <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-48 bg-black/90 border border-slate-700 p-2 text-xs text-slate-300 rounded shadow-xl z-20">
                          <p className="font-bold text-white mb-1">{clue.label}</p>
                          <p>{clue.desc}</p>
                        </div>
                      )}
                    </motion.button>
                  ))}

                  {/* UI Overlay */}
                  <div className="absolute bottom-8 left-1/2 -translate-x-1/2 text-center pointer-events-none">
                    <p className="font-mono text-sm text-slate-400 bg-black/50 px-4 py-2 rounded-full backdrop-blur">
                      {allCluesFound ? "线索收集完毕，准备进行分析..." : "在黑暗中移动鼠标/手指寻找线索"}
                    </p>
                  </div>
                </div>
              </Flashlight>
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
                      { id: 'prob', label: '发现问题', desc: '桥梁存在安全隐患' }
                    ].map(target => {
                      const matchedClueId = Object.keys(matches).find(key => matches[key] === target.id);
                      const matchedClue = clues.find(c => c.id === matchedClueId);
                      const isCorrect = 
                        (target.id === 'req' && matchedClueId === 'chief') ||
                        (target.id === 'const' && matchedClueId === 'station') ||
                        (target.id === 'prob' && matchedClueId === 'bridge');

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
                    <button 
                      onClick={() => setPhase('outro')}
                      className="px-8 py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded shadow-[0_0_20px_rgba(37,99,235,0.4)] transition-all"
                    >
                      生成分析报告
                    </button>
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
                    onClick={onComplete}
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
