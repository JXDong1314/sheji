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
import { Wind, Sun, Volume2, VolumeX, Lightbulb, LightbulbOff, Scissors, CheckCircle2, Zap, Battery, ToggleLeft, Mic, ArrowRight, Settings } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';
import type { Achievement } from '../types/game';

type Phase = 'intro' | 'blackbox' | 'screening' | 'outro';

const POWER_OPTIONS = [
  { id: 'grid', label: '市电直连', icon: <Zap className="w-6 h-6" />, desc: '依赖村庄电网，枯水期易断电' },
  { id: 'battery', label: '铅酸蓄电池', icon: <Battery className="w-6 h-6" />, desc: '需定期人工充电，维护成本高' },
  { id: 'hybrid', label: '风光互补发电', icon: <Wind className="w-6 h-6" />, desc: '利用自然风光，独立供电不断电' },
];

const CONTROL_OPTIONS = [
  { id: 'manual', label: '人工拉线开关', icon: <ToggleLeft className="w-6 h-6" />, desc: '需要专人每天傍晚开启、清晨关闭' },
  { id: 'voice', label: '声控开关', icon: <Mic className="w-6 h-6" />, desc: '需要发出声音才能亮，野外无人时无效' },
  { id: 'light', label: '光敏自动控制', icon: <Sun className="w-6 h-6" />, desc: '天黑自动亮起，天亮自动熄灭，无人值守' },
];

export function Chapter1({ onComplete }: { onComplete?: () => void }) {
  const { state, addScore, recordError, recordSuccess, resetChapterStats, completeChapter } = useGame();
  
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
  
  // 初始化时重置章节统计
  useEffect(() => {
    resetChapterStats();
    soundEffects.setEnabled(true);
  }, [resetChapterStats]);
  
  // Blackbox state
  const [speakerCut, setSpeakerCut] = useState(false);
  const [lightConnected, setLightConnected] = useState(true);
  const [blackboxAttempts, setBlackboxAttempts] = useState(0);
  
  // Screening state
  const [powerIdx, setPowerIdx] = useState(0);
  const [controlIdx, setControlIdx] = useState(0);
  const [isLocked, setIsLocked] = useState(false);
  const [screeningAttempts, setScreeningAttempts] = useState(0);

  const isBlackboxSolved = speakerCut && lightConnected;
  const isScreeningSolved = isLocked && POWER_OPTIONS[powerIdx].id === 'hybrid' && CONTROL_OPTIONS[controlIdx].id === 'light';

  useEffect(() => {
    if (phase === 'blackbox' && isBlackboxSolved) {
      setTimeout(() => setPhase('screening'), 3000);
    }
  }, [isBlackboxSolved, phase]);

  // 键盘事件监听 - 处理Enter键推进对话
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        
        // Intro阶段：推进对话
        if (phase === 'intro') {
          if (introStep < 4) {
            setIntroStep(prev => prev + 1);
          } else {
            setPhase('blackbox');
          }
        }
        
        // Outro阶段：推进对话或进入下一章
        if (phase === 'outro') {
          if (outroStep < 2) {
            setOutroStep(prev => prev + 1);
          } else if (!showNextBtn) {
            setShowNextBtn(true);
          } else {
            // 点击进入下一章按钮
            completeChapter('chapter1', state.chapterScores.chapter1);
            onComplete?.();
          }
        }
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [phase, introStep, outroStep, showNextBtn, completeChapter, state.chapterScores.chapter1, onComplete]);

  return (
    <SceneBackground scene="chapter1">
      <div className="relative z-10 w-full h-screen text-slate-200 font-sans overflow-hidden tech-grid flex flex-col">
        {/* Header */}
        <header className="p-4 border-b border-slate-800 flex justify-between items-center bg-black/50 backdrop-blur-sm">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-blue-600" />
          <span className="font-mono text-sm tracking-widest text-slate-400">技术设计调查组 // 项目编号: TD-002</span>
        </div>
        <div className="flex items-center gap-4">
          <div className="font-mono text-xs text-slate-500">
            {phase === 'intro' && 'CH1.INIT'}
            {phase === 'blackbox' && 'BLACKBOX.ANALYSIS'}
            {phase === 'screening' && 'SYSTEM.DESIGN'}
            {phase === 'outro' && 'CH1.COMPLETE'}
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
                  <p><Typewriter text="在村长带领下，你找到了村里的老工程师李师傅。" /></p>
                )}
                
                {introStep >= 1 && (
                  <p><Typewriter text="他正在桥头调试一个自制的路灯装置。这个设备偶尔会发出" />
                  {introStep >= 2 && <span className="mx-1 text-orange-400 font-bold">刺耳的电流声</span>}
                  {introStep >= 2 && <Typewriter text="，让村民感到不安。" />}</p>
                )}

                {introStep >= 3 && (
                  <p><Typewriter text="经过检查，你发现这是一个设计不完善的自动路灯原型。李师傅缺乏系统设计经验，把多个功能模块混在了一起。" /></p>
                )}

                {introStep >= 4 && (
                  <p className="text-blue-400 font-mono text-sm mt-8">
                    <Typewriter text="> 任务：使用【黑箱法】测试输入输出，剪断错误连线，保留核心功能。" />
                  </p>
                )}
                
                {/* 提示按Enter继续 */}
                {introStep < 4 && (
                  <p className="text-slate-500 text-sm mt-4 animate-pulse">按 Enter 或 空格 继续...</p>
                )}
              </div>
            </motion.div>
          )}

          {/* BLACKBOX PHASE */}
          {phase === 'blackbox' && (
            <motion.div 
              key="blackbox"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 flex flex-col items-center justify-center p-8 bg-slate-950"
            >
              <div className="max-w-4xl w-full">
                <h2 className="text-2xl font-bold mb-2 text-blue-400 flex items-center gap-2">
                  <Settings className="w-6 h-6" />
                  黑箱法：系统功能剥离
                </h2>
                <p className="text-slate-400 mb-12 font-mono text-sm">
                  观察输入与输出的关系。点击连接线进行剪断或修复，消除噪音，保留照明。
                </p>

                <div className="flex items-center justify-between gap-4 bg-slate-900/50 p-8 rounded-xl border border-slate-800 relative">
                  
                  {/* Inputs */}
                  <div className="flex flex-col gap-12 z-10">
                    <div className="flex items-center gap-4 bg-black/50 p-4 rounded border border-slate-700">
                      <Wind className="w-8 h-8 text-blue-400 animate-[spin_3s_linear_infinite]" />
                      <div>
                        <div className="font-bold text-slate-200">风力发电机</div>
                        <div className="text-xs text-slate-500">输入: 动能</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 bg-black/50 p-4 rounded border border-slate-700">
                      <Sun className="w-8 h-8 text-yellow-400" />
                      <div>
                        <div className="font-bold text-slate-200">光敏电阻</div>
                        <div className="text-xs text-slate-500">输入: 光照信号</div>
                      </div>
                    </div>
                  </div>

                  {/* The Black Box */}
                  <div className={cn(
                    "w-64 h-64 bg-slate-800 border-4 border-slate-600 rounded-lg flex items-center justify-center relative z-10 transition-all",
                    !speakerCut ? "animate-[shake_0.5s_infinite] border-red-900/50 shadow-[0_0_30px_rgba(220,38,38,0.2)]" : "border-blue-500/50 shadow-[0_0_30px_rgba(59,130,246,0.2)]"
                  )}>
                    <div className="absolute inset-0 opacity-20 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCI+PHBhdGggZD0iTTAgMGg0MHY0MEgwVjB6bTIwIDIwYzAtMTEuMDQ2IDguOTU0LTIwIDIwLTIwczIwIDguOTU0IDIwIDIwLTguOTU0IDIwLTIwIDIwLTIwLTguOTU0LTIwLTIwem0wLTE4QTE4IDE4IDAgMCAwIDIgMjBhMTggMTggMCAwIDAgMTggMTggMTggMTggMCAwIDAgMTgtMThBMTggMTggMCAwIDAgMjAgMnoiIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSIgZmlsbC1ydWxlPSJldmVub2RkIi8+PC9zdmc+')] mix-blend-overlay" />
                    <div className="text-center">
                      {!speakerCut ? (
                        <Glitch text="未知装置" className="text-2xl font-bold text-orange-500" />
                      ) : (
                        <span className="text-2xl font-bold text-blue-400 tracking-widest">控制中枢</span>
                      )}
                      <div className="text-xs text-slate-500 mt-2 font-mono">BLACK_BOX_SYSTEM</div>
                    </div>
                  </div>

                  {/* Outputs */}
                  <div className="flex flex-col gap-12 z-10">
                    {/* Speaker Output */}
                    <div className="flex items-center gap-4 relative">
                      {/* Wire to Speaker */}
                      <div 
                        className="absolute right-full w-24 h-2 -translate-y-1/2 top-1/2 flex items-center justify-center cursor-pointer group"
                        onClick={() => {
                          soundEffects.click();
                          if (!speakerCut) {
                            soundEffects.disconnect();
                            feedbackManager.showSuccess('剪断噪音线路！');
                            recordSuccess();
                          } else {
                            soundEffects.connect();
                            feedbackManager.showError('重新连接了噪音线路');
                            setBlackboxAttempts(prev => prev + 1);
                            recordError('chapter1');
                          }
                          setSpeakerCut(!speakerCut);
                        }}
                      >
                        <div className={cn(
                          "w-full h-1 transition-all",
                          speakerCut ? "bg-red-500/20 border-t border-b border-dashed border-red-500/50" : "bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.8)]"
                        )} />
                        <div className="absolute opacity-0 group-hover:opacity-100 bg-slate-800 p-2 rounded-full border border-slate-600 shadow-xl transition-opacity">
                          <Scissors className="w-5 h-5 text-slate-300" />
                        </div>
                      </div>

                      <div className={cn(
                        "flex items-center gap-4 p-4 rounded border transition-all w-48",
                        speakerCut ? "bg-black/50 border-slate-800 opacity-50" : "bg-red-900/20 border-red-500/50"
                      )}>
                        {speakerCut ? <VolumeX className="w-8 h-8 text-slate-600" /> : <Volume2 className="w-8 h-8 text-red-500 animate-pulse" />}
                        <div>
                          <div className={cn("font-bold", speakerCut ? "text-slate-500" : "text-red-400")}>破喇叭</div>
                          <div className="text-xs text-slate-500">输出: 噪音</div>
                        </div>
                      </div>
                    </div>

                    {/* Light Output */}
                    <div className="flex items-center gap-4 relative">
                      {/* Wire to Light */}
                      <div 
                        className="absolute right-full w-24 h-2 -translate-y-1/2 top-1/2 flex items-center justify-center cursor-pointer group"
                        onClick={() => {
                          soundEffects.click();
                          if (lightConnected) {
                            soundEffects.disconnect();
                            feedbackManager.showError('断开了照明线路！');
                            setBlackboxAttempts(prev => prev + 1);
                            recordError('chapter1');
                          } else {
                            soundEffects.connect();
                            feedbackManager.showSuccess('连接照明线路！');
                            recordSuccess();
                          }
                          setLightConnected(!lightConnected);
                        }}
                      >
                        <div className={cn(
                          "w-full h-1 transition-all",
                          !lightConnected ? "bg-slate-700 border-t border-b border-dashed border-slate-600" : "bg-blue-400 shadow-[0_0_10px_rgba(96,165,250,0.8)]"
                        )} />
                        <div className="absolute opacity-0 group-hover:opacity-100 bg-slate-800 p-2 rounded-full border border-slate-600 shadow-xl transition-opacity">
                          <Scissors className="w-5 h-5 text-slate-300" />
                        </div>
                      </div>

                      <div className={cn(
                        "flex items-center gap-4 p-4 rounded border transition-all w-48",
                        !lightConnected ? "bg-black/50 border-slate-800 opacity-50" : "bg-blue-900/20 border-blue-500/50"
                      )}>
                        {lightConnected ? <Lightbulb className="w-8 h-8 text-yellow-400 drop-shadow-[0_0_10px_rgba(250,204,21,0.8)]" /> : <LightbulbOff className="w-8 h-8 text-slate-600" />}
                        <div>
                          <div className={cn("font-bold", !lightConnected ? "text-slate-500" : "text-blue-300")}>照明灯泡</div>
                          <div className="text-xs text-slate-500">输出: 光源</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {isBlackboxSolved && (
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-8 text-center bg-green-900/20 border border-green-500/50 p-4 rounded text-green-400"
                  >
                    <CheckCircle2 className="w-6 h-6 inline-block mr-2" />
                    噪音源已切断，核心照明功能保留。系统已净化。
                  </motion.div>
                )}
              </div>
            </motion.div>
          )}

          {/* SCREENING PHASE */}
          {phase === 'screening' && (
            <motion.div 
              key="screening"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 flex flex-col items-center justify-center p-8 bg-slate-950"
            >
              <div className="max-w-5xl w-full">
                <h2 className="text-2xl font-bold mb-2 text-blue-400 flex items-center gap-2">
                  <Settings className="w-6 h-6" />
                  筛选法：方案重构
                </h2>
                <p className="text-slate-400 mb-8 font-mono text-sm">
                  根据序章的【需求分析】（枯水期停电、野外无人值守），在拉霸机上锁定最优的动力与控制组合。
                </p>

                <div className="grid grid-cols-2 gap-12">
                  {/* Power Slot */}
                  <div className="bg-slate-900 border border-slate-700 rounded-xl p-6 text-center shadow-2xl relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-8 bg-gradient-to-b from-slate-900 to-transparent z-10 pointer-events-none" />
                    <div className="absolute bottom-0 left-0 w-full h-8 bg-gradient-to-t from-slate-900 to-transparent z-10 pointer-events-none" />
                    
                    <h3 className="text-slate-400 font-mono mb-6 uppercase tracking-widest">动力源 (Power)</h3>
                    
                    <div className="relative h-40 flex items-center justify-center">
                      <AnimatePresence mode="popLayout">
                        <motion.div
                          key={powerIdx}
                          initial={{ y: 50, opacity: 0 }}
                          animate={{ y: 0, opacity: 1 }}
                          exit={{ y: -50, opacity: 0 }}
                          transition={{ type: "spring", stiffness: 300, damping: 30 }}
                          className={cn(
                            "flex flex-col items-center gap-4 p-4 rounded-lg border-2 w-full cursor-pointer transition-colors",
                            isLocked ? (POWER_OPTIONS[powerIdx].id === 'hybrid' ? "border-green-500 bg-green-900/20" : "border-red-500 bg-red-900/20") : "border-blue-500/50 bg-blue-900/10 hover:bg-blue-900/30"
                          )}
                          onClick={() => !isLocked && setPowerIdx((prev) => (prev + 1) % POWER_OPTIONS.length)}
                        >
                          {POWER_OPTIONS[powerIdx].icon}
                          <div className="font-bold text-xl">{POWER_OPTIONS[powerIdx].label}</div>
                          <div className="text-xs text-slate-400">{POWER_OPTIONS[powerIdx].desc}</div>
                        </motion.div>
                      </AnimatePresence>
                    </div>
                    
                    {!isLocked && <div className="mt-6 text-xs text-slate-500 animate-pulse">点击卡片切换方案</div>}
                  </div>

                  {/* Control Slot */}
                  <div className="bg-slate-900 border border-slate-700 rounded-xl p-6 text-center shadow-2xl relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-8 bg-gradient-to-b from-slate-900 to-transparent z-10 pointer-events-none" />
                    <div className="absolute bottom-0 left-0 w-full h-8 bg-gradient-to-t from-slate-900 to-transparent z-10 pointer-events-none" />
                    
                    <h3 className="text-slate-400 font-mono mb-6 uppercase tracking-widest">控制方式 (Control)</h3>
                    
                    <div className="relative h-40 flex items-center justify-center">
                      <AnimatePresence mode="popLayout">
                        <motion.div
                          key={controlIdx}
                          initial={{ y: 50, opacity: 0 }}
                          animate={{ y: 0, opacity: 1 }}
                          exit={{ y: -50, opacity: 0 }}
                          transition={{ type: "spring", stiffness: 300, damping: 30 }}
                          className={cn(
                            "flex flex-col items-center gap-4 p-4 rounded-lg border-2 w-full cursor-pointer transition-colors",
                            isLocked ? (CONTROL_OPTIONS[controlIdx].id === 'light' ? "border-green-500 bg-green-900/20" : "border-red-500 bg-red-900/20") : "border-blue-500/50 bg-blue-900/10 hover:bg-blue-900/30"
                          )}
                          onClick={() => !isLocked && setControlIdx((prev) => (prev + 1) % CONTROL_OPTIONS.length)}
                        >
                          {CONTROL_OPTIONS[controlIdx].icon}
                          <div className="font-bold text-xl">{CONTROL_OPTIONS[controlIdx].label}</div>
                          <div className="text-xs text-slate-400">{CONTROL_OPTIONS[controlIdx].desc}</div>
                        </motion.div>
                      </AnimatePresence>
                    </div>

                    {!isLocked && <div className="mt-6 text-xs text-slate-500 animate-pulse">点击卡片切换方案</div>}
                  </div>
                </div>

                <div className="mt-12 text-center">
                  {!isLocked ? (
                    <button 
                      onClick={() => {
                        soundEffects.click();
                        setIsLocked(true);
                        
                        // 检查方案是否正确
                        const isCorrect = POWER_OPTIONS[powerIdx].id === 'hybrid' && CONTROL_OPTIONS[controlIdx].id === 'light';
                        
                        if (isCorrect) {
                          soundEffects.success();
                          feedbackManager.showSuccess('方案验证通过！');
                          
                          // 根据黑箱法和筛选法的错误次数给分
                          const totalAttempts = blackboxAttempts + screeningAttempts;
                          if (totalAttempts === 0) {
                            addScore(40, 'chapter1');
                            feedbackManager.showScore(40);
                          } else if (totalAttempts <= 2) {
                            addScore(35, 'chapter1');
                            feedbackManager.showScore(35);
                          } else if (totalAttempts <= 4) {
                            addScore(30, 'chapter1');
                            feedbackManager.showScore(30);
                          } else {
                            addScore(25, 'chapter1');
                            feedbackManager.showScore(25);
                          }
                        } else {
                          soundEffects.error();
                          feedbackManager.showError('方案不符合需求约束！');
                          feedbackManager.showScore(-10);
                          setScreeningAttempts(prev => prev + 1);
                          recordError('chapter1');
                          
                          // 触发随机事件
                          if (Math.random() < 0.3) {
                            const event = eventGenerator.getRandomEvent('chapter1', 'trouble');
                            if (event) {
                              soundEffects.randomEvent();
                              setRandomEvent(event);
                            }
                          }
                        }
                      }}
                      className="px-12 py-4 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded shadow-[0_0_20px_rgba(37,99,235,0.4)] transition-all text-lg tracking-widest"
                    >
                      锁定方案
                    </button>
                  ) : (
                    <motion.div 
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                    >
                      {isScreeningSolved ? (
                        <div className="space-y-6">
                          <div className="inline-flex items-center gap-2 bg-green-900/30 border border-green-500 text-green-400 px-6 py-3 rounded-full font-bold">
                            <CheckCircle2 className="w-6 h-6" />
                            方案验证通过：完美匹配需求约束！
                          </div>
                          <div>
                            <button 
                              onClick={() => {
                                soundEffects.chapterComplete();
                                setPhase('outro');
                              }}
                              className="px-8 py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded shadow-[0_0_20px_rgba(37,99,235,0.4)] transition-all"
                            >
                              生成设计图纸
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-6">
                          <div className="inline-flex items-center gap-2 bg-red-900/30 border border-red-500 text-red-400 px-6 py-3 rounded-full font-bold">
                            <VolumeX className="w-6 h-6" />
                            方案验证失败：无法满足实际环境需求。
                          </div>
                          <div>
                            <button 
                              onClick={() => setIsLocked(false)}
                              className="px-8 py-3 bg-slate-700 hover:bg-slate-600 text-white font-bold rounded transition-all"
                            >
                              重新筛选
                            </button>
                          </div>
                        </div>
                      )}
                    </motion.div>
                  )}
                </div>
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
              <h2 className="text-3xl font-bold text-white mb-4 tracking-widest">第一章 完成</h2>
              <div className="max-w-2xl text-slate-300 space-y-4 leading-relaxed">
                {outroStep >= 0 && (
                  <p>
                    <Typewriter text="通过黑箱法，你排除了无用的噪音干扰；通过筛选法，你找到了最适合李家坳的供电与控制方案。" speed={30} />
                  </p>
                )}
                {outroStep >= 1 && (
                  <p>
                    <Typewriter text="李师傅的自制装置终于被改造成了科学的风光互补自动路灯核心模块。" speed={30} />
                  </p>
                )}
                {outroStep >= 2 && (
                  <p className="text-blue-400 font-mono mt-8">
                    <Typewriter text="> 下一步：寻找铁匠打造灯柱，但需要先解读李师傅留下的技术图纸。" speed={30} />
                  </p>
                )}
                
                {/* 提示按Enter继续 */}
                {!showNextBtn && (
                  <p className="text-slate-500 text-sm mt-4 animate-pulse">按 Enter 或 空格 继续...</p>
                )}
                
                {showNextBtn && (
                  <button
                    onClick={() => {
                      completeChapter('chapter1', state.chapterScores.chapter1);
                      onComplete?.();
                    }}
                    className="mt-8 px-8 py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded shadow-[0_0_20px_rgba(37,99,235,0.4)] transition-all animate-fade-in"
                  >
                    进入第二章
                  </button>
                )}
              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </main>

      {/* CSS for shake animation */}
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          10%, 30%, 50%, 70%, 90% { transform: translateX(-5px) rotate(-2deg); }
          20%, 40%, 60%, 80% { transform: translateX(5px) rotate(2deg); }
        }
      `}} />
      </div>
    </SceneBackground>
  );
}
