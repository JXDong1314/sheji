/**
 * 结局场景
 * 根据总分显示不同等级的结局（S/A/B/C）
 */
import React, { useState, useEffect } from 'react';
import { Typewriter } from '../components/Typewriter';
import { SceneBackground } from '../components/SceneBackground';
import { useGame } from '../hooks/useGame';
import { Trophy, Star, Award, Medal, RotateCcw } from 'lucide-react';
import { motion } from 'motion/react';
import type { EndingRank } from '../types/game';

interface EndingContent {
  rank: EndingRank;
  title: string;
  subtitle: string;
  description: string[];
  color: string;
  icon: React.ReactNode;
}

const ENDING_CONTENTS: Record<EndingRank, EndingContent> = {
  S: {
    rank: 'S',
    title: '科学之光',
    subtitle: '完美的技术设计专家',
    description: [
      '你以卓越的专业能力，完美解决了李家坳村的所有技术难题。',
      '从需求分析到人机关系，每一个环节都体现了严谨的科学思维。',
      '村民们学会了用科学的眼光看待技术问题，安全意识大幅提升。',
      '你的设计方案被推广到周边十个村庄，成为乡村技术改造的典范。',
    ],
    color: 'from-yellow-500 to-orange-500',
    icon: <Trophy className="w-24 h-24" />,
  },
  A: {
    rank: 'A',
    title: '技术能手',
    subtitle: '优秀的问题解决者',
    description: [
      '你展现了扎实的技术功底，成功破解了大部分谜题。',
      '虽然有些细节还不够完美，但整体方案科学合理。',
      '村民们对你的工作表示认可，安全事故得到有效遏制。',
      '这次经历让你更加理解技术设计中"以人为本"的重要性。',
    ],
    color: 'from-blue-500 to-cyan-500',
    icon: <Award className="w-24 h-24" />,
  },
  B: {
    rank: 'B',
    title: '初窥门径',
    subtitle: '合格的技术学徒',
    description: [
      '你基本掌握了技术设计的核心概念，解决了主要问题。',
      '但在一些关键环节上还需要更多的思考和学习。',
      '村里的安全隐患得到了改善，但仍有优化空间。',
      '继续努力，你会成为更优秀的技术设计师。',
    ],
    color: 'from-green-500 to-emerald-500',
    icon: <Medal className="w-24 h-24" />,
  },
  C: {
    rank: 'C',
    title: '需要提高',
    subtitle: '技术设计的探索者',
    description: [
      '你勇敢地面对了技术难题，但还需要加强基础知识的学习。',
      '很多设计决策缺乏科学依据，导致方案不够理想。',
      '不过，这次经历让你认识到了技术设计的复杂性。',
      '建议重新学习相关知识点，再次挑战这些谜题。',
    ],
    color: 'from-slate-500 to-gray-500',
    icon: <Star className="w-24 h-24" />,
  },
  D: {
    rank: 'D',
    title: '设计失败',
    subtitle: '危险的技术方案',
    description: [
      '你的设计方案存在严重缺陷，给村民带来了新的安全隐患。',
      '路灯系统虽然安装完成，但频繁故障，甚至引发了触电事故。',
      '村民们对你的工作非常不满，技术设计调查组的声誉受到质疑。',
      '你必须从头开始，认真学习技术设计的基础知识。',
    ],
    color: 'from-orange-600 to-red-600',
    icon: <Star className="w-24 h-24" />,
  },
  F: {
    rank: 'F',
    title: '灾难性失败',
    subtitle: '不合格的技术人员',
    description: [
      '你的错误决策导致了严重的安全事故，多名村民受伤。',
      '路灯系统完全失效，村里再次陷入黑暗之中。',
      '村民们对技术改造失去信心，安全隐患依然存在。',
      '你被调离岗位，建议重新接受系统的技术培训。',
    ],
    color: 'from-red-700 to-black',
    icon: <Star className="w-24 h-24" />,
  },
};

export function Ending({ onRestart }: { onRestart?: () => void }) {
  const { state, calculateEnding, resetGame } = useGame();
  const [step, setStep] = useState(0);
  const [showStats, setShowStats] = useState(false);
  
  const ending = calculateEnding();
  const content = ENDING_CONTENTS[ending];

  useEffect(() => {
    const timer = setTimeout(() => setShowStats(true), 2000);
    return () => clearTimeout(timer);
  }, []);

  const handleRestart = () => {
    if (window.confirm('确定要重新开始游戏吗？当前进度将会丢失。')) {
      resetGame();
      if (onRestart) onRestart();
    }
  };

  return (
    <SceneBackground scene="ending">
      <div className="relative z-10 w-full h-screen text-slate-200 font-sans overflow-hidden crt flex flex-col items-center justify-center p-8">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="max-w-4xl w-full"
        >
          {/* 等级图标 */}
          <motion.div
            initial={{ y: -50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3, type: 'spring' }}
            className={`flex flex-col items-center mb-8 bg-gradient-to-br ${content.color} p-8 rounded-2xl`}
          >
            <div className="text-white mb-4">{content.icon}</div>
            <div className="text-6xl font-bold text-white mb-2">{content.rank} 级</div>
            <h1 className="text-4xl font-bold text-white mb-2">{content.title}</h1>
            <p className="text-xl text-white/80">{content.subtitle}</p>
          </motion.div>

          {/* 结局描述 */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="bg-slate-900/80 border-2 border-slate-700 rounded-xl p-8 mb-8 backdrop-blur-sm"
          >
            <div className="space-y-4 text-lg leading-relaxed">
              {content.description.map((text, index) => (
                <motion.p
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 1 + index * 0.3 }}
                  className="text-slate-300"
                >
                  {text}
                </motion.p>
              ))}
            </div>
          </motion.div>

          {/* 统计数据 */}
          {showStats && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8"
            >
              <div className="bg-slate-900/80 border border-slate-700 rounded-lg p-4 text-center">
                <div className="text-3xl font-bold text-yellow-400">{state.totalScore}</div>
                <div className="text-sm text-slate-400 mt-1">总分</div>
              </div>
              <div className="bg-slate-900/80 border border-slate-700 rounded-lg p-4 text-center">
                <div className="text-3xl font-bold text-blue-400">{state.unlockedAchievements.length}</div>
                <div className="text-sm text-slate-400 mt-1">解锁成就</div>
              </div>
              <div className="bg-slate-900/80 border border-slate-700 rounded-lg p-4 text-center">
                <div className="text-3xl font-bold text-green-400">{state.completedChapters.length}</div>
                <div className="text-sm text-slate-400 mt-1">完成章节</div>
              </div>
              <div className="bg-slate-900/80 border border-slate-700 rounded-lg p-4 text-center">
                <div className="text-3xl font-bold text-purple-400">{state.totalAttempts}</div>
                <div className="text-sm text-slate-400 mt-1">总尝试次数</div>
              </div>
            </motion.div>
          )}

          {/* 成就列表 */}
          {showStats && state.unlockedAchievements.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="bg-slate-900/80 border border-slate-700 rounded-xl p-6 mb-8"
            >
              <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <Trophy className="w-6 h-6 text-yellow-400" />
                已解锁成就
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {state.unlockedAchievements.map(achievementId => {
                  const achievement = state.achievements[achievementId];
                  return (
                    <div
                      key={achievementId}
                      className="flex items-center gap-3 p-3 bg-slate-800/50 rounded-lg border border-slate-600"
                    >
                      <Trophy className="w-5 h-5 text-yellow-400 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="font-bold text-white text-sm">{achievement.name}</div>
                        <div className="text-xs text-slate-400 truncate">{achievement.description}</div>
                      </div>
                      <div className="text-yellow-400 font-bold text-sm">+{achievement.points}</div>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          )}

          {/* 操作按钮 */}
          {showStats && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1 }}
              className="flex gap-4 justify-center"
            >
              <button
                onClick={handleRestart}
                className="flex items-center gap-2 px-8 py-4 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded shadow-[0_0_20px_rgba(37,99,235,0.4)] transition-all"
              >
                <RotateCcw className="w-5 h-5" />
                重新开始
              </button>
            </motion.div>
          )}

          {/* 制作信息 */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 2 }}
            className="text-center mt-8 text-slate-500 text-sm"
          >
            <p>《技术设计方法论：互动教学游戏》</p>
            <p className="mt-1">一款寓教于乐的工程设计教学游戏</p>
          </motion.div>
        </motion.div>
      </div>
    </SceneBackground>
  );
}
