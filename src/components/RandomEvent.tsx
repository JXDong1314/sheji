/**
 * 随机事件系统组件
 */
import { motion, AnimatePresence } from 'motion/react';
import { AlertTriangle, Sparkles, Users, Clock } from 'lucide-react';
import { useEffect, useState } from 'react';

export type EventType = 'trouble' | 'lucky' | 'expert' | 'pressure';

export interface RandomEvent {
  id: string;
  type: EventType;
  title: string;
  description: string;
  effect: string;
  icon: React.ReactNode;
  duration?: number;
}

interface RandomEventProps {
  event: RandomEvent | null;
  onClose: () => void;
}

const eventStyles = {
  trouble: {
    bg: 'bg-orange-900/20',
    border: 'border-orange-500/50',
    glow: 'shadow-[0_0_30px_rgba(249,115,22,0.3)]',
    icon: 'text-orange-400'
  },
  lucky: {
    bg: 'bg-green-900/20',
    border: 'border-green-500/50',
    glow: 'shadow-[0_0_30px_rgba(34,197,94,0.3)]',
    icon: 'text-green-400'
  },
  expert: {
    bg: 'bg-blue-900/20',
    border: 'border-blue-500/50',
    glow: 'shadow-[0_0_30px_rgba(59,130,246,0.3)]',
    icon: 'text-blue-400'
  },
  pressure: {
    bg: 'bg-red-900/20',
    border: 'border-red-500/50',
    glow: 'shadow-[0_0_30px_rgba(239,68,68,0.3)]',
    icon: 'text-red-400'
  }
};

export function RandomEvent({ event, onClose }: RandomEventProps) {
  const [autoCloseTimer, setAutoCloseTimer] = useState<number | null>(null);

  useEffect(() => {
    if (event && event.duration) {
      const timer = window.setTimeout(() => {
        onClose();
      }, event.duration);
      setAutoCloseTimer(timer);
      return () => clearTimeout(timer);
    }
  }, [event, onClose]);

  if (!event) return null;

  const style = eventStyles[event.type];

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, scale: 0.8, y: -50 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.8, y: -50 }}
        className="fixed top-8 left-1/2 -translate-x-1/2 z-50 max-w-md w-full mx-4"
      >
        <div className={`${style.bg} ${style.border} ${style.glow} border-2 rounded-lg p-6 backdrop-blur-sm`}>
          {/* 关闭按钮 */}
          <button
            onClick={onClose}
            className="absolute top-2 right-2 text-slate-400 hover:text-slate-200 transition-colors"
          >
            ✕
          </button>

          {/* 图标和标题 */}
          <div className="flex items-start gap-4 mb-4">
            <div className={`${style.icon} flex-shrink-0`}>
              {event.icon}
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-bold text-slate-100 mb-2">
                {event.title}
              </h3>
              <p className="text-slate-300 text-sm leading-relaxed">
                {event.description}
              </p>
            </div>
          </div>

          {/* 效果说明 */}
          <div className="mt-4 pt-4 border-t border-slate-700">
            <div className="flex items-center gap-2 text-sm">
              <span className="text-slate-400">效果：</span>
              <span className={`${style.icon} font-semibold`}>
                {event.effect}
              </span>
            </div>
          </div>

          {/* 自动关闭进度条 */}
          {event.duration && (
            <motion.div
              className={`mt-4 h-1 ${style.bg} rounded-full overflow-hidden`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <motion.div
                className={`h-full ${style.border.replace('border-', 'bg-')}`}
                initial={{ width: '100%' }}
                animate={{ width: '0%' }}
                transition={{ duration: event.duration / 1000, ease: 'linear' }}
              />
            </motion.div>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

// 随机事件生成器
export class RandomEventGenerator {
  private usedEvents: Set<string> = new Set();

  // Prologue 事件池
  private prologueEvents = {
    trouble: [
      {
        id: 'prologue_rain',
        type: 'trouble' as const,
        title: '突然下起大雨',
        description: '一场突如其来的大雨让部分线索变得模糊不清...',
        effect: '1个线索暂时隐藏，需要额外操作显示',
        icon: <AlertTriangle className="w-8 h-8" />,
        duration: 5000
      },
      {
        id: 'prologue_crowd',
        type: 'trouble' as const,
        title: '村民围观',
        description: '好奇的村民们围了过来，七嘴八舌地讨论着...',
        effect: '分析时间增加30秒',
        icon: <Users className="w-8 h-8" />,
        duration: 5000
      }
    ],
    lucky: [
      {
        id: 'prologue_chief_hint',
        type: 'lucky' as const,
        title: '老村长的回忆',
        description: '老村长突然想起了一个重要的细节！',
        effect: '获得额外线索提示，+5分',
        icon: <Sparkles className="w-8 h-8" />,
        duration: 5000
      },
      {
        id: 'prologue_document',
        type: 'lucky' as const,
        title: '发现旧档案',
        description: '在村委会找到了一份关于桥梁的旧档案...',
        effect: '降低1次错误惩罚',
        icon: <Sparkles className="w-8 h-8" />,
        duration: 5000
      }
    ],
    expert: [
      {
        id: 'prologue_engineer',
        type: 'expert' as const,
        title: '资深工程师路过',
        description: '一位路过的资深工程师愿意提供一次免费咨询...',
        effect: '获得1次免费高质量提示',
        icon: <Users className="w-8 h-8" />,
        duration: 5000
      }
    ],
    pressure: [
      {
        id: 'prologue_urgent',
        type: 'pressure' as const,
        title: '村民催促',
        description: '村民们希望尽快解决照明问题，时间紧迫！',
        effect: '剩余时间-2分钟，完成后+10分',
        icon: <Clock className="w-8 h-8" />,
        duration: 5000
      }
    ]
  };

  // Chapter1 事件池
  private chapter1Events = {
    trouble: [
      {
        id: 'chapter1_short',
        type: 'trouble' as const,
        title: '电路板进水短路',
        description: '工作台上的水杯打翻了，电路板部分短路！',
        effect: '随机断开1-2个连接',
        icon: <AlertTriangle className="w-8 h-8" />,
        duration: 5000
      }
    ],
    lucky: [
      {
        id: 'chapter1_notebook',
        type: 'lucky' as const,
        title: '李师傅的笔记',
        description: '在工具箱里发现了李师傅留下的技术笔记！',
        effect: '获得黑箱法提示，+5分',
        icon: <Sparkles className="w-8 h-8" />,
        duration: 5000
      }
    ],
    expert: [
      {
        id: 'chapter1_expert',
        type: 'expert' as const,
        title: '电子工程师指导',
        description: '一位电子工程师愿意帮你检查电路设计...',
        effect: '获得1次免费提示',
        icon: <Users className="w-8 h-8" />,
        duration: 5000
      }
    ]
  };

  getRandomEvent(chapter: string, eventType?: EventType): RandomEvent | null {
    const events = chapter === 'prologue' ? this.prologueEvents : this.chapter1Events;
    
    if (eventType) {
      const pool = events[eventType];
      if (!pool || pool.length === 0) return null;
      
      const availableEvents = pool.filter(e => !this.usedEvents.has(e.id));
      if (availableEvents.length === 0) return null;
      
      const event = availableEvents[Math.floor(Math.random() * availableEvents.length)];
      this.usedEvents.add(event.id);
      return event;
    }

    // 随机选择事件类型
    const types: EventType[] = ['trouble', 'lucky', 'expert', 'pressure'];
    const weights = [0.2, 0.15, 0.3, 0.25]; // 概率权重
    
    const random = Math.random();
    let cumulative = 0;
    let selectedType: EventType = 'trouble';
    
    for (let i = 0; i < types.length; i++) {
      cumulative += weights[i];
      if (random <= cumulative) {
        selectedType = types[i];
        break;
      }
    }

    return this.getRandomEvent(chapter, selectedType);
  }

  reset() {
    this.usedEvents.clear();
  }
}
