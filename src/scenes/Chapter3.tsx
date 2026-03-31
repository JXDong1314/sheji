/**
 * 第三章：路灯下的村长
 * 教学知识点：人机关系（安全、高效、健康、舒适）
 */
import React, { useState, useEffect } from 'react';
import { Typewriter } from '../components/Typewriter';
import { Glitch } from '../components/Glitch';
import { SceneBackground } from '../components/SceneBackground';
import { ScoreDisplay } from '../components/ScoreDisplay';
import { AchievementToast } from '../components/AchievementToast';
import { useGame } from '../hooks/useGame';
import { Shield, Zap, Heart, Smile, CheckCircle2, AlertTriangle, User } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';
import type { Achievement } from '../types/game';

type Phase = 'intro' | 'analysis' | 'design' | 'outro';

// 人机关系四要素评估
interface HMIFactor {
  id: string;
  name: string;
  icon: React.ReactNode;
  description: string;
  options: {
    id: string;
    label: string;
    score: number;
    feedback: string;
  }[];
}

const HMI_FACTORS: HMIFactor[] = [
  {
    id: 'safety',
    name: '安全性',
    icon: <Shield className="w-6 h-6" />,
    description: '路灯是否会对村民造成危险？',
    options: [
      { id: 'high', label: '3米高灯杆 + 防触电设计', score: 10, feedback: '高度合理，村民无法触及电气部分' },
      { id: 'medium', label: '1.5米矮杆 + 裸露电线', score: 3, feedback: '高度过低，儿童可能触碰到危险部位' },
      { id: 'low', label: '地面安装 + 无防护', score: 0, feedback: '极度危险！村民可能直接接触高压电' },
    ],
  },
  {
    id: 'efficiency',
    name: '高效性',
    icon: <Zap className="w-6 h-6" />,
    description: '路灯能否有效完成照明任务？',
    options: [
      { id: 'high', label: '光敏自动控制 + LED灯', score: 10, feedback: '自动开关，节能高效，无需人工干预' },
      { id: 'medium', label: '定时开关 + 节能灯', score: 5, feedback: '需要定期调整时间，夏冬季不适配' },
      { id: 'low', label: '手动开关 + 白炽灯', score: 2, feedback: '需要专人每天操作，耗电量大' },
    ],
  },
  {
    id: 'health',
    name: '健康性',
    icon: <Heart className="w-6 h-6" />,
    description: '路灯是否影响村民健康？',
    options: [
      { id: 'high', label: '暖色温 + 防眩光设计', score: 10, feedback: '光线柔和，不刺眼，不影响睡眠' },
      { id: 'medium', label: '冷白光 + 普通灯罩', score: 5, feedback: '光线偏冷，可能影响部分人睡眠' },
      { id: 'low', label: '强光直射 + 无灯罩', score: 0, feedback: '刺眼强光严重影响视力和睡眠质量' },
    ],
  },
  {
    id: 'comfort',
    name: '舒适性',
    icon: <Smile className="w-6 h-6" />,
    description: '路灯使用体验如何？',
    options: [
      { id: 'high', label: '智能感应 + 静音运行', score: 10, feedback: '无需操作，完全静音，体验极佳' },
      { id: 'medium', label: '遥控开关 + 轻微噪音', score: 5, feedback: '需要遥控器，风扇有轻微噪音' },
      { id: 'low', label: '拉线开关 + 嗡嗡声', score: 2, feedback: '需要走到灯下拉线，镇流器噪音大' },
    ],
  },
];

export function Chapter3({ onComplete }: { onComplete?: () => void }) {
  const { state, addScore, unlockAchievement } = useGame();
  
  const [phase, setPhase] = useState<Phase>('intro');
  const [introStep, setIntroStep] = useState(0);
  const [outroStep, setOutroStep] = useState(0);
  const [showNextBtn, setShowNextBtn] = useState(false);
  
  // 成就弹窗状态
  const [currentAchievement, setCurrentAchievement] = useState<Achievement | null>(null);
  
  // 人机关系评估选择
  const [selections, setSelections] = useState<Record<string, string>>({});
  const [confirmed, setConfirmed] = useState(false);
  const [totalScore, setTotalScore] = useState(0);

  const allSelected = Object.keys(selections).length === HMI_FACTORS.length;

  const handleConfirm = () => {
    let score = 0;
    let perfectCount = 0;
    
    HMI_FACTORS.forEach(factor => {
      const selectedOption = factor.options.find(opt => opt.id === selections[factor.id]);
      if (selectedOption) {
        score += selectedOption.score;
        if (selectedOption.score === 10) perfectCount++;
      }
    });
    
    setTotalScore(score);
    addScore(score, 'chapter3');
    
    if (perfectCount === 4) {
      const achievement = state.achievements['hmi_master'];
      unlockAchievement('hmi_master');
      setCurrentAchievement(achievement);
    }
    
    setConfirmed(true);
    setTimeout(() => setPhase('outro'), 3000);
  };

  return (
    <SceneBackground scene="chapter3">
      <div className="relative z-10 w-full h-screen text-slate-200 font-sans overflow-hidden tech-grid flex flex-col">
        {/* Header */}
        <header className="p-4 border-b border-slate-800 flex justify-between items-center bg-black/50 backdrop-blur-sm">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-blue-600" />
            <span className="font-mono text-sm tracking-widest text-slate-400">技术设计调查组 // 项目编号: TD-004</span>
          </div>
          <div className="flex items-center gap-4">
            <div className="font-mono text-xs text-slate-500">
              {phase === 'intro' && 'CH3.INIT'}
              {phase === 'analysis' && 'HMI.ANALYSIS'}
              {phase === 'design' && 'DESIGN.OPTIMIZE'}
              {phase === 'outro' && 'CH3.COMPLETE'}
            </div>
            <ScoreDisplay score={state.totalScore} />
          </div>
        </header>
        
        {/* 成就解锁弹窗 */}
        <AchievementToast 
          achievement={currentAchievement} 
          onClose={() => setCurrentAchievement(null)} 
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
                    <p><Typewriter text="村口新装的路灯终于亮起来了，村长激动地召集全村人来观看。" onComplete={() => setTimeout(() => setIntroStep(1), 500)} />
                    </p>
                  )}
                  
                  {introStep >= 1 && (
                    <p><Typewriter text="但就在这时，一个小孩突然" onComplete={() => setTimeout(() => setIntroStep(2), 300)} />
                    {introStep >= 2 && <span className="mx-1 text-orange-400 font-bold">大叫起来</span>}
                    {introStep >= 2 && <Typewriter text="！村民们发现，孩子的手被灯杆上裸露的电线电伤了。" onComplete={() => setTimeout(() => setIntroStep(3), 1000)} />}</p>
                  )}

                  {introStep >= 3 && (
                    <p><Typewriter text='村长慌忙解释："这灯是按图纸装的啊！"你仔细检查后发现，图纸虽然技术规范，但完全没有考虑人的因素。' onComplete={() => setTimeout(() => setIntroStep(4), 1000)} /></p>
                  )}

                  {introStep >= 4 && (
                    <p className="text-blue-400 font-mono text-sm mt-8">
                      <Typewriter text="> 任务：从人机关系角度重新设计路灯系统。" onComplete={() => setTimeout(() => setPhase('analysis'), 500)} />
                    </p>
                  )}
                </div>
              </motion.div>
            )}

            {/* ANALYSIS PHASE - 人机关系评估 */}
            {phase === 'analysis' && (
              <motion.div 
                key="analysis"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 p-8 overflow-auto"
              >
                <div className="max-w-6xl mx-auto">
                  <h2 className="text-3xl font-bold text-white mb-2 text-center">人机关系设计</h2>
                  <p className="text-slate-400 text-center mb-8">从四个维度评估和优化路灯设计</p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                    {HMI_FACTORS.map((factor) => (
                      <motion.div
                        key={factor.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-slate-900/50 border border-slate-700 rounded-lg p-6"
                      >
                        <div className="flex items-center gap-3 mb-4">
                          <div className="text-purple-400">{factor.icon}</div>
                          <div>
                            <h3 className="text-xl font-bold text-white">{factor.name}</h3>
                            <p className="text-sm text-slate-400">{factor.description}</p>
                          </div>
                        </div>

                        <div className="space-y-2">
                          {factor.options.map((option) => (
                            <button
                              key={option.id}
                              onClick={() => !confirmed && setSelections(prev => ({ ...prev, [factor.id]: option.id }))}
                              disabled={confirmed}
                              className={cn(
                                "w-full p-3 rounded border-2 text-left transition-all text-sm",
                                selections[factor.id] === option.id
                                  ? confirmed
                                    ? option.score === 10
                                      ? "border-green-500 bg-green-900/20"
                                      : option.score >= 5
                                      ? "border-yellow-500 bg-yellow-900/20"
                                      : "border-red-500 bg-red-900/20"
                                    : "border-blue-500 bg-blue-900/20"
                                  : "border-slate-600 bg-slate-800/50 hover:border-slate-500",
                                confirmed && "cursor-not-allowed"
                              )}
                            >
                              <div className="flex items-start justify-between gap-2">
                                <span className="flex-1">{option.label}</span>
                                {confirmed && selections[factor.id] === option.id && (
                                  <span className="text-yellow-400 font-bold text-xs">+{option.score}</span>
                                )}
                              </div>
                              {confirmed && selections[factor.id] === option.id && (
                                <p className="mt-2 text-xs text-slate-400">{option.feedback}</p>
                              )}
                            </button>
                          ))}
                        </div>
                      </motion.div>
                    ))}
                  </div>

                  {allSelected && !confirmed && (
                    <motion.button
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      onClick={handleConfirm}
                      className="w-full max-w-md mx-auto block px-8 py-4 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded shadow-[0_0_20px_rgba(59,130,246,0.4)] transition-all"
                    >
                      确认设计方案
                    </motion.button>
                  )}

                  {confirmed && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="text-center mt-6"
                    >
                      <div className="inline-block px-8 py-4 bg-slate-900/80 border-2 border-purple-500 rounded-lg">
                        <p className="text-slate-400 mb-2">综合评分</p>
                        <p className="text-4xl font-bold text-purple-400">{totalScore} / 40</p>
                        <p className="text-sm text-slate-500 mt-2">正在生成最终方案...</p>
                      </div>
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
                <h2 className="text-3xl font-bold text-white mb-4 tracking-widest">第三章 完成</h2>
                <div className="max-w-2xl text-slate-300 space-y-4 leading-relaxed">
                  {outroStep >= 0 && (
                    <p>
                      <Typewriter text='通过人机关系分析，你重新设计了路灯系统，让它不仅技术先进，更符合人的需求。' speed={30} onComplete={() => setOutroStep(1)} />
                    </p>
                  )}
                  {outroStep >= 1 && (
                    <p>
                      <Typewriter text='受伤的孩子康复后，村长感慨："原来技术不仅要科学，更要以人为本！"' speed={30} onComplete={() => setOutroStep(2)} />
                    </p>
                  )}
                  {outroStep >= 2 && (
                    <p className="text-blue-400 font-mono mt-8">
                      <Typewriter text='> 所有谜题已解开，真相即将揭晓……' speed={30} onComplete={() => setShowNextBtn(true)} />
                    </p>
                  )}
                  {showNextBtn && (
                    <button
                      onClick={onComplete}
                      className="mt-8 px-8 py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded shadow-[0_0_20px_rgba(59,130,246,0.4)] transition-all animate-fade-in"
                    >
                      查看结局
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
