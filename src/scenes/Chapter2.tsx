/**
 * 第二章：工程师的技术图纸
 * 教学知识点：技术语言、标准化、优选法
 */
import React, { useState, useEffect } from 'react';
import { Typewriter } from '../components/Typewriter';
import { Glitch } from '../components/Glitch';
import { SceneBackground } from '../components/SceneBackground';
import { ScoreDisplay } from '../components/ScoreDisplay';
import { AchievementToast } from '../components/AchievementToast';
import { RandomEvent, RandomEventGenerator, type RandomEvent as RandomEventType } from '../components/RandomEvent';
import { FeedbackAnimation, feedbackManager, type Feedback } from '../components/FeedbackAnimation';
import { soundEffects } from '../utils/soundEffects';
import { useGame } from '../hooks/useGame';
import { FileText, Ruler, CheckCircle2, Hammer, Wrench, AlertCircle, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';
import type { Achievement } from '../types/game';

type Phase = 'intro' | 'language' | 'standard' | 'optimize' | 'outro';

// 技术语言选项
const LANGUAGE_OPTIONS = [
  { id: 'folk', label: '民间俗语', desc: '"铁棍子"、"亮灯的东西"', correct: false },
  { id: 'vague', label: '模糊描述', desc: '"大概3米高"、"差不多就行"', correct: false },
  { id: 'technical', label: '技术语言', desc: '"Φ60mm镀锌钢管"、"高度3000mm±10mm"', correct: true },
];

// 标准化选项
const STANDARD_OPTIONS = [
  { id: 'custom', label: '各村自定', desc: '每个村子按自己想法做，五花八门', correct: false },
  { id: 'partial', label: '部分统一', desc: '只统一高度，其他随意', correct: false },
  { id: 'unified', label: '完全标准化', desc: '统一材料、尺寸、工艺、安装规范', correct: true },
];

// 优选法选项（材料选择）
const MATERIAL_OPTIONS = [
  { id: 'wood', label: '木质灯杆', icon: <Hammer className="w-6 h-6" />, pros: '便宜、易加工', cons: '易腐烂、寿命短（2-3年）', score: 3 },
  { id: 'iron', label: '铸铁灯杆', icon: <Wrench className="w-6 h-6" />, pros: '坚固、传统', cons: '易生锈、笨重、难维护', score: 5 },
  { id: 'steel', label: '镀锌钢管', icon: <Zap className="w-6 h-6" />, pros: '防锈、轻便、标准化', cons: '成本略高', score: 10 },
];

export function Chapter2({ onComplete }: { onComplete?: () => void }) {
  const { state, addScore, unlockAchievement, recordError, recordSuccess, resetChapterStats } = useGame();
  
  const [phase, setPhase] = useState<Phase>('intro');
  const [introStep, setIntroStep] = useState(0);
  const [outroStep, setOutroStep] = useState(0);
  const [showNextBtn, setShowNextBtn] = useState(false);
  
  // 成就弹窗状态
  const [currentAchievement, setCurrentAchievement] = useState<Achievement | null>(null);
  
  // 随机事件和反馈系统
  const [randomEvent, setRandomEvent] = useState<RandomEventType | null>(null);
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [eventGenerator] = useState(() => new RandomEventGenerator());
  
  // 错误追踪
  const [languageAttempts, setLanguageAttempts] = useState(0);
  const [standardAttempts, setStandardAttempts] = useState(0);
  const [optimizeAttempts, setOptimizeAttempts] = useState(0);
  
  // 初始化时重置章节统计
  useEffect(() => {
    resetChapterStats();
    soundEffects.setEnabled(true);
  }, [resetChapterStats]);
  
  // 技术语言阶段
  const [selectedLanguage, setSelectedLanguage] = useState<string | null>(null);
  const [languageConfirmed, setLanguageConfirmed] = useState(false);
  
  // 标准化阶段
  const [selectedStandard, setSelectedStandard] = useState<string | null>(null);
  const [standardConfirmed, setStandardConfirmed] = useState(false);
  
  // 优选法阶段
  const [selectedMaterial, setSelectedMaterial] = useState<string | null>(null);
  const [materialConfirmed, setMaterialConfirmed] = useState(false);

  // 自动推进逻辑
  useEffect(() => {
    if (languageConfirmed && phase === 'language') {
      setTimeout(() => setPhase('standard'), 2000);
    }
  }, [languageConfirmed, phase]);

  useEffect(() => {
    if (standardConfirmed && phase === 'standard') {
      setTimeout(() => setPhase('optimize'), 2000);
    }
  }, [standardConfirmed, phase]);

  useEffect(() => {
    if (materialConfirmed && phase === 'optimize') {
      console.log('[Chapter2] 材料已确认，2秒后切换到outro');
      setTimeout(() => {
        console.log('[Chapter2] 切换到outro阶段');
        setPhase('outro');
      }, 2000);
    }
  }, [materialConfirmed, phase]);

  // 调试：监控phase变化
  useEffect(() => {
    console.log('[Chapter2] 当前阶段:', phase);
  }, [phase]);

  const handleLanguageConfirm = () => {
    soundEffects.click();
    const option = LANGUAGE_OPTIONS.find(o => o.id === selectedLanguage);
    if (option?.correct) {
      soundEffects.success();
      feedbackManager.showSuccess('技术语言规范正确！');
      addScore(20, 'chapter2');
      feedbackManager.showScore(20);
      recordSuccess();
      const achievement = state.achievements['tech_language_master'];
      unlockAchievement('tech_language_master');
      setCurrentAchievement(achievement);
    } else {
      soundEffects.error();
      feedbackManager.showError('技术语言不够规范');
      addScore(5, 'chapter2');
      feedbackManager.showScore(5);
      setLanguageAttempts(prev => prev + 1);
      recordError('chapter2');
      
      // 触发随机事件
      if (Math.random() < 0.3) {
        const event = eventGenerator.getRandomEvent('chapter1', 'trouble');
        if (event) {
          soundEffects.randomEvent();
          setRandomEvent(event);
        }
      }
    }
    setLanguageConfirmed(true);
  };

  const handleStandardConfirm = () => {
    soundEffects.click();
    const option = STANDARD_OPTIONS.find(o => o.id === selectedStandard);
    if (option?.correct) {
      soundEffects.success();
      feedbackManager.showSuccess('标准化方案正确！');
      addScore(20, 'chapter2');
      feedbackManager.showScore(20);
      recordSuccess();
    } else {
      soundEffects.error();
      feedbackManager.showError('标准化程度不足');
      addScore(5, 'chapter2');
      feedbackManager.showScore(5);
      setStandardAttempts(prev => prev + 1);
      recordError('chapter2');
    }
    setStandardConfirmed(true);
  };

  const handleMaterialConfirm = () => {
    soundEffects.click();
    const material = MATERIAL_OPTIONS.find(m => m.id === selectedMaterial);
    if (material) {
      if (material.id === 'steel') {
        soundEffects.success();
        feedbackManager.showSuccess('最优材料选择！');
        addScore(material.score, 'chapter2');
        feedbackManager.showScore(material.score);
        recordSuccess();
        const achievement = state.achievements['optimization_expert'];
        unlockAchievement('optimization_expert');
        setTimeout(() => setCurrentAchievement(achievement), 500);
      } else {
        soundEffects.match();
        feedbackManager.showSuccess('材料已选择');
        addScore(material.score, 'chapter2');
        feedbackManager.showScore(material.score);
        setOptimizeAttempts(prev => prev + 1);
        if (material.score < 10) {
          recordError('chapter2');
        } else {
          recordSuccess();
        }
      }
    }
    setMaterialConfirmed(true);
  };

  return (
    <SceneBackground scene="chapter2">
      <div className="relative z-10 w-full h-screen text-slate-200 font-sans overflow-hidden tech-grid flex flex-col">
        {/* Header */}
        <header className="p-4 border-b border-slate-800 flex justify-between items-center bg-black/50 backdrop-blur-sm">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-blue-600" />
            <span className="font-mono text-sm tracking-widest text-slate-400">技术设计调查组 // 项目编号: TD-003</span>
          </div>
          <div className="flex items-center gap-4">
            <div className="font-mono text-xs text-slate-500">
              {phase === 'intro' && 'CH2.INIT'}
              {phase === 'language' && 'TECH.LANGUAGE'}
              {phase === 'standard' && 'STANDARDIZATION'}
              {phase === 'optimize' && 'OPTIMIZATION'}
              {phase === 'outro' && 'CH2.COMPLETE'}
            </div>
            <ScoreDisplay score={state.totalScore} />
          </div>
        </header>
        
        {/* 成就解锁弹窗 */}
        <AchievementToast 
          achievement={currentAchievement} 
          onClose={() => setCurrentAchievement(null)} 
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

        <main className="flex-1 relative overflow-auto">
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
                    <p><Typewriter text="你来到村里的铁匠铺，老铁匠递给你一张李师傅留下的设计图纸。" onComplete={() => setTimeout(() => setIntroStep(1), 500)} />
                    </p>
                  )}
                  
                  {introStep >= 1 && (
                    <p><Typewriter text="图纸上用" onComplete={() => setTimeout(() => setIntroStep(2), 300)} />
                    {introStep >= 2 && <span className="mx-1 text-red-400 font-bold">红色标注</span>}
                    {introStep >= 2 && <Typewriter text="写着密密麻麻的符号，老铁匠说这是李师傅留下的路灯灯柱设计图。" onComplete={() => setTimeout(() => setIntroStep(3), 1000)} />}</p>
                  )}

                  {introStep >= 3 && (
                    <p><Typewriter text='但图纸上的描述极其混乱："铁棍子大概三米高"、"亮灯的东西装上面"……这样的图纸根本无法施工！' onComplete={() => setTimeout(() => setIntroStep(4), 1000)} /></p>
                  )}

                  {introStep >= 4 && (
                    <p className="text-blue-400 font-mono text-sm mt-8">
                      <Typewriter text="> 任务：将混乱的民间描述转化为规范的技术文档。" onComplete={() => setTimeout(() => setPhase('language'), 500)} />
                    </p>
                  )}
                </div>
              </motion.div>
            )}

            {/* LANGUAGE PHASE - 技术语言 */}
            {phase === 'language' && (
              <motion.div 
                key="language"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 flex flex-col items-center justify-center p-8"
              >
                <div className="max-w-4xl w-full">
                  <h2 className="text-3xl font-bold text-white mb-2 text-center">技术语言规范化</h2>
                  <p className="text-slate-400 text-center mb-8">选择正确的技术描述方式</p>

                  <div className="grid grid-cols-1 gap-4 mb-8">
                    {LANGUAGE_OPTIONS.map((option) => (
                      <motion.button
                        key={option.id}
                        onClick={() => !languageConfirmed && setSelectedLanguage(option.id)}
                        disabled={languageConfirmed}
                        className={cn(
                          "p-6 rounded-lg border-2 transition-all text-left",
                          selectedLanguage === option.id
                            ? languageConfirmed
                              ? option.correct
                                ? "border-green-500 bg-green-900/20"
                                : "border-red-500 bg-red-900/20"
                              : "border-blue-500 bg-blue-900/20"
                            : "border-slate-700 bg-slate-900/50 hover:border-slate-600",
                          languageConfirmed && "cursor-not-allowed opacity-70"
                        )}
                        whileHover={!languageConfirmed ? { scale: 1.02 } : {}}
                        whileTap={!languageConfirmed ? { scale: 0.98 } : {}}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h3 className="text-xl font-bold text-white mb-2">{option.label}</h3>
                            <p className="text-slate-300 text-sm">{option.desc}</p>
                          </div>
                          {languageConfirmed && selectedLanguage === option.id && (
                            option.correct ? (
                              <CheckCircle2 className="w-6 h-6 text-green-500 flex-shrink-0 ml-4" />
                            ) : (
                              <AlertCircle className="w-6 h-6 text-red-500 flex-shrink-0 ml-4" />
                            )
                          )}
                        </div>
                      </motion.button>
                    ))}
                  </div>

                  {selectedLanguage && !languageConfirmed && (
                    <motion.button
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      onClick={handleLanguageConfirm}
                      className="w-full px-8 py-4 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded shadow-[0_0_20px_rgba(59,130,246,0.4)] transition-all"
                    >
                      确认选择
                    </motion.button>
                  )}

                  {languageConfirmed && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="text-center text-slate-400 mt-4"
                    >
                      <p>正在进入下一阶段...</p>
                    </motion.div>
                  )}
                </div>
              </motion.div>
            )}

            {/* STANDARD PHASE - 标准化 */}
            {phase === 'standard' && (
              <motion.div 
                key="standard"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 flex flex-col items-center justify-center p-8"
              >
                <div className="max-w-4xl w-full">
                  <h2 className="text-3xl font-bold text-white mb-2 text-center">标准化设计</h2>
                  <p className="text-slate-400 text-center mb-8">李家坳周边有10个村子都需要安装路灯，应该如何设计？</p>

                  <div className="grid grid-cols-1 gap-4 mb-8">
                    {STANDARD_OPTIONS.map((option) => (
                      <motion.button
                        key={option.id}
                        onClick={() => !standardConfirmed && setSelectedStandard(option.id)}
                        disabled={standardConfirmed}
                        className={cn(
                          "p-6 rounded-lg border-2 transition-all text-left",
                          selectedStandard === option.id
                            ? standardConfirmed
                              ? option.correct
                                ? "border-green-500 bg-green-900/20"
                                : "border-red-500 bg-red-900/20"
                              : "border-blue-500 bg-blue-900/20"
                            : "border-slate-700 bg-slate-900/50 hover:border-slate-600",
                          standardConfirmed && "cursor-not-allowed opacity-70"
                        )}
                        whileHover={!standardConfirmed ? { scale: 1.02 } : {}}
                        whileTap={!standardConfirmed ? { scale: 0.98 } : {}}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h3 className="text-xl font-bold text-white mb-2">{option.label}</h3>
                            <p className="text-slate-300 text-sm">{option.desc}</p>
                          </div>
                          {standardConfirmed && selectedStandard === option.id && (
                            option.correct ? (
                              <CheckCircle2 className="w-6 h-6 text-green-500 flex-shrink-0 ml-4" />
                            ) : (
                              <AlertCircle className="w-6 h-6 text-red-500 flex-shrink-0 ml-4" />
                            )
                          )}
                        </div>
                      </motion.button>
                    ))}
                  </div>

                  {selectedStandard && !standardConfirmed && (
                    <motion.button
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      onClick={handleStandardConfirm}
                      className="w-full px-8 py-4 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded shadow-[0_0_20px_rgba(59,130,246,0.4)] transition-all"
                    >
                      确认选择
                    </motion.button>
                  )}

                  {standardConfirmed && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="text-center text-slate-400 mt-4"
                    >
                      <p>正在进入下一阶段...</p>
                    </motion.div>
                  )}
                </div>
              </motion.div>
            )}

            {/* OPTIMIZE PHASE - 优选法 */}
            {phase === 'optimize' && (
              <motion.div 
                key="optimize"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 flex flex-col items-center justify-center p-8"
              >
                <div className="max-w-4xl w-full">
                  <h2 className="text-3xl font-bold text-white mb-2 text-center">优选法：材料选择</h2>
                  <p className="text-slate-400 text-center mb-8">综合考虑成本、寿命、维护难度，选择最优方案</p>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                    {MATERIAL_OPTIONS.map((material) => (
                      <motion.button
                        key={material.id}
                        onClick={() => !materialConfirmed && setSelectedMaterial(material.id)}
                        disabled={materialConfirmed}
                        className={cn(
                          "p-6 rounded-lg border-2 transition-all",
                          selectedMaterial === material.id
                            ? materialConfirmed
                              ? material.score === 10
                                ? "border-green-500 bg-green-900/20"
                                : "border-yellow-500 bg-yellow-900/20"
                              : "border-blue-500 bg-blue-900/20"
                            : "border-slate-700 bg-slate-900/50 hover:border-slate-600",
                          materialConfirmed && "cursor-not-allowed opacity-70"
                        )}
                        whileHover={!materialConfirmed ? { scale: 1.05 } : {}}
                        whileTap={!materialConfirmed ? { scale: 0.95 } : {}}
                      >
                        <div className="flex flex-col items-center text-center">
                          <div className="mb-4 text-orange-400">{material.icon}</div>
                          <h3 className="text-lg font-bold text-white mb-3">{material.label}</h3>
                          <div className="space-y-2 text-sm">
                            <p className="text-green-400">✓ {material.pros}</p>
                            <p className="text-red-400">✗ {material.cons}</p>
                          </div>
                          {materialConfirmed && selectedMaterial === material.id && (
                            <div className="mt-4 text-yellow-400 font-bold">
                              +{material.score} 分
                            </div>
                          )}
                        </div>
                      </motion.button>
                    ))}
                  </div>

                  {selectedMaterial && !materialConfirmed && (
                    <motion.button
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      onClick={handleMaterialConfirm}
                      className="w-full px-8 py-4 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded shadow-[0_0_20px_rgba(59,130,246,0.4)] transition-all"
                    >
                      确认选择
                    </motion.button>
                  )}

                  {materialConfirmed && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="text-center text-slate-400 mt-4"
                    >
                      <p>正在生成最终方案...</p>
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
                <h2 className="text-3xl font-bold text-white mb-4 tracking-widest">第二章 完成</h2>
                <div className="max-w-2xl text-slate-300 space-y-4 leading-relaxed">
                  {outroStep >= 0 && (
                    <p>
                      <Typewriter text="通过技术语言、标准化设计和优选法，你将混乱的草图转化为了规范的工程图纸。" speed={30} onComplete={() => setOutroStep(1)} />
                    </p>
                  )}
                  {outroStep >= 1 && (
                    <p>
                      <Typewriter text="老铁匠恍然大悟：原来李师傅是在用自己的方式记录技术方案！" speed={30} onComplete={() => setOutroStep(2)} />
                    </p>
                  )}
                  {outroStep >= 2 && (
                    <p className="text-blue-400 font-mono mt-8">
                      <Typewriter text="> 下一步：前往村口，检查新安装的路灯系统的人机工程问题。" speed={30} onComplete={() => setShowNextBtn(true)} />
                    </p>
                  )}
                  {showNextBtn && (
                    <button
                      onClick={onComplete}
                      className="mt-8 px-8 py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded shadow-[0_0_20px_rgba(59,130,246,0.4)] transition-all animate-fade-in"
                    >
                      进入第三章
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
