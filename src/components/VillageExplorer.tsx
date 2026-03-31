/**
 * 村庄探索组件 - 像素风格的2D探索游戏
 * 玩家可以上下左右移动，与NPC对话获取线索
 */
import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { User, MessageCircle, MapPin, ChevronUp, ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react';
import { soundEffects } from '../utils/soundEffects';
import { cn } from '../lib/utils';

// NPC角色定义
interface NPC {
  id: string;
  name: string;
  x: number;
  y: number;
  avatar: string;
  dialogues: {
    initial: string;
    clue?: {
      id: string;
      text: string;
      label: string;
    };
    afterClue?: string;
  };
  hasClue: boolean;
}

// 地图障碍物
interface Obstacle {
  x: number;
  y: number;
  width: number;
  height: number;
  type: 'building' | 'tree' | 'water' | 'bridge';
  label?: string;
}

interface VillageExplorerProps {
  onClueCollected: (clueId: string, clueLabel: string) => void;
  onAllCluesCollected: () => void;
  collectedClues: string[];
}

const TILE_SIZE = 48; // 每个格子的大小（增大以显示更多细节）
const MAP_WIDTH = 18; // 地图宽度（格子数）
const MAP_HEIGHT = 13; // 地图高度（格子数）

// 粒子效果
interface Particle {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  type: 'sparkle' | 'dust' | 'leaf';
  color: string;
}

// NPC数据
const NPCS: NPC[] = [
  {
    id: 'chief',
    name: '老村长',
    x: 10,
    y: 7,
    avatar: '👴',
    dialogues: {
      initial: '年轻人，你来得正好！我们村里老人多，半夜经常要去镇上看急诊...',
      clue: {
        id: 'chief',
        text: '老村长叹气："村里老人多，半夜经常要去镇上看急诊，摸黑过桥太危险了。"',
        label: '村民夜间看急诊'
      },
      afterClue: '希望你能帮我们设计一个好的照明方案！'
    },
    hasClue: true
  },
  {
    id: 'engineer',
    name: '李师傅',
    x: 15,
    y: 5,
    avatar: '👷',
    dialogues: {
      initial: '我在桥头调试路灯，但这个废弃水电站枯水期根本没电...',
      clue: {
        id: 'station',
        text: '废弃的水电站，枯水期根本无法提供稳定的市电。',
        label: '枯水期经常停电'
      },
      afterClue: '必须找到不依赖市电的供电方案才行。'
    },
    hasClue: true
  },
  {
    id: 'elder',
    name: '王奶奶',
    x: 5,
    y: 10,
    avatar: '👵',
    dialogues: {
      initial: '我年纪大了，晚上看不清路，特别是下雨天...',
      clue: {
        id: 'elderly',
        text: '村里多是老年人，夜间视力差，看不清路况。',
        label: '老人视力不佳'
      },
      afterClue: '要是有明亮的路灯就好了。'
    },
    hasClue: true
  },
  {
    id: 'farmer',
    name: '张大叔',
    x: 8,
    y: 12,
    avatar: '🧑‍🌾',
    dialogues: {
      initial: '你去看看那座桥吧，栏杆都坏了，太危险了！',
      clue: {
        id: 'bridge',
        text: '断桥的栏杆低矮且破损，起不到防护作用。',
        label: '栏杆高度异常'
      },
      afterClue: '一定要注意安全啊！'
    },
    hasClue: true
  },
  {
    id: 'child',
    name: '小明',
    x: 12,
    y: 10,
    avatar: '👦',
    dialogues: {
      initial: '桥上好滑啊！上次我差点摔倒，都是青苔...',
      clue: {
        id: 'moss',
        text: '桥面常年潮湿，长满青苔，雨天更加湿滑危险。',
        label: '桥面湿滑有青苔'
      },
      afterClue: '你要小心点哦！'
    },
    hasClue: true
  }
];

// 地图障碍物
const OBSTACLES: Obstacle[] = [
  // 房屋
  { x: 3, y: 3, width: 3, height: 3, type: 'building', label: '村委会' },
  { x: 13, y: 3, width: 3, height: 3, type: 'building', label: '李师傅家' },
  { x: 3, y: 9, width: 2, height: 2, type: 'building', label: '王奶奶家' },
  { x: 7, y: 11, width: 2, height: 2, type: 'building', label: '张大叔家' },
  
  // 树木
  { x: 1, y: 1, width: 1, height: 1, type: 'tree' },
  { x: 18, y: 2, width: 1, height: 1, type: 'tree' },
  { x: 2, y: 13, width: 1, height: 1, type: 'tree' },
  { x: 17, y: 12, width: 1, height: 1, type: 'tree' },
  
  // 河流
  { x: 0, y: 6, width: 6, height: 2, type: 'water' },
  { x: 8, y: 6, width: 12, height: 2, type: 'water' },
  
  // 桥
  { x: 6, y: 6, width: 2, height: 2, type: 'bridge', label: '断桥' }
];

export function VillageExplorer({ onClueCollected, onAllCluesCollected, collectedClues }: VillageExplorerProps) {
  const [playerX, setPlayerX] = useState(9);
  const [playerY, setPlayerY] = useState(6);
  const [direction, setDirection] = useState<'up' | 'down' | 'left' | 'right'>('down');
  const [currentDialogue, setCurrentDialogue] = useState<{ npc: NPC; text: string } | null>(null);
  const [showControls, setShowControls] = useState(true);
  const [particles, setParticles] = useState<Particle[]>([]);
  const [isWalking, setIsWalking] = useState(false);
  const [walkFrame, setWalkFrame] = useState(0);
  const [cameraShake, setCameraShake] = useState(0);

  // 检查碰撞
  const checkCollision = useCallback((x: number, y: number): boolean => {
    // 地图边界
    if (x < 0 || x >= MAP_WIDTH || y < 0 || y >= MAP_HEIGHT) return true;
    
    // 障碍物碰撞
    for (const obstacle of OBSTACLES) {
      if (obstacle.type === 'bridge') continue; // 桥可以通过
      if (
        x >= obstacle.x &&
        x < obstacle.x + obstacle.width &&
        y >= obstacle.y &&
        y < obstacle.y + obstacle.height
      ) {
        return true;
      }
    }
    
    return false;
  }, []);

  // 移动玩家
  const movePlayer = (dx: number, dy: number, dir: 'up' | 'down' | 'left' | 'right') => {
    const newX = playerX + dx;
    const newY = playerY + dy;
    
    if (checkCollision(newX, newY)) {
      soundEffects.error();
      setCameraShake(5);
      setTimeout(() => setCameraShake(0), 100);
      return;
    }
    
    setPlayerX(newX);
    setPlayerY(newY);
    setDirection(dir);
    setIsWalking(true);
    setTimeout(() => setIsWalking(false), 200);
    
    // 添加脚步尘土效果
    addParticles(playerX, playerY, 'dust', 2);
    
    soundEffects.click();
  };

  // 粒子系统更新
  useEffect(() => {
    const interval = setInterval(() => {
      setParticles(prev => 
        prev
          .map(p => ({
            ...p,
            x: p.x + p.vx,
            y: p.y + p.vy,
            life: p.life - 1,
            vy: p.vy + 0.1 // 重力
          }))
          .filter(p => p.life > 0)
      );
    }, 50);
    return () => clearInterval(interval);
  }, []);

  // 行走动画
  useEffect(() => {
    if (isWalking) {
      const interval = setInterval(() => {
        setWalkFrame(prev => (prev + 1) % 4);
      }, 150);
      return () => clearInterval(interval);
    }
  }, [isWalking]);

  // 添加粒子效果
  const addParticles = useCallback((x: number, y: number, type: Particle['type'], count: number = 3) => {
    const newParticles: Particle[] = [];
    for (let i = 0; i < count; i++) {
      newParticles.push({
        id: Date.now() + Math.random(),
        x: x * TILE_SIZE + TILE_SIZE / 2,
        y: y * TILE_SIZE + TILE_SIZE / 2,
        vx: (Math.random() - 0.5) * 2,
        vy: (Math.random() - 0.5) * 2 - 1,
        life: type === 'sparkle' ? 30 : 20,
        maxLife: type === 'sparkle' ? 30 : 20,
        type,
        color: type === 'sparkle' ? '#ffd700' : type === 'dust' ? '#d4a574' : '#90ee90'
      });
    }
    setParticles(prev => [...prev, ...newParticles]);
  }, []);

  // 键盘控制
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (currentDialogue) return; // 对话中不能移动
      
      switch (e.key) {
        case 'ArrowUp':
        case 'w':
        case 'W':
          e.preventDefault();
          movePlayer(0, -1, 'up');
          break;
        case 'ArrowDown':
        case 's':
        case 'S':
          e.preventDefault();
          movePlayer(0, 1, 'down');
          break;
        case 'ArrowLeft':
        case 'a':
        case 'A':
          e.preventDefault();
          movePlayer(-1, 0, 'left');
          break;
        case 'ArrowRight':
        case 'd':
        case 'D':
          e.preventDefault();
          movePlayer(1, 0, 'right');
          break;
        case 'Enter':
        case ' ':
          e.preventDefault();
          checkNPCInteraction();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [playerX, playerY, currentDialogue, movePlayer]);

  // 检查NPC交互
  const checkNPCInteraction = useCallback(() => {
    const nearbyNPC = NPCS.find(
      npc => Math.abs(npc.x - playerX) + Math.abs(npc.y - playerY) <= 1
    );

    if (nearbyNPC) {
      const hasCollected = collectedClues.includes(nearbyNPC.id);
      
      if (nearbyNPC.hasClue && !hasCollected) {
        // 显示线索对话
        setCurrentDialogue({
          npc: nearbyNPC,
          text: nearbyNPC.dialogues.clue!.text
        });
        onClueCollected(nearbyNPC.dialogues.clue!.id, nearbyNPC.dialogues.clue!.label);
        // 添加闪光粒子效果
        addParticles(nearbyNPC.x, nearbyNPC.y, 'sparkle', 8);
      } else if (hasCollected && nearbyNPC.dialogues.afterClue) {
        // 显示收集后的对话
        setCurrentDialogue({
          npc: nearbyNPC,
          text: nearbyNPC.dialogues.afterClue
        });
      } else {
        // 显示初始对话
        setCurrentDialogue({
          npc: nearbyNPC,
          text: nearbyNPC.dialogues.initial
        });
      }
      soundEffects.success();
    }
  }, [playerX, playerY, collectedClues]);

  // 关闭对话
  const closeDialogue = useCallback(() => {
    if (currentDialogue && currentDialogue.npc.hasClue && currentDialogue.npc.dialogues.clue) {
      const hasCollected = collectedClues.includes(currentDialogue.npc.id);
      
      if (!hasCollected) {
        // 收集线索
        soundEffects.success();
        onClueCollected(
          currentDialogue.npc.dialogues.clue.id,
          currentDialogue.npc.dialogues.clue.label
        );
        
        // 检查是否收集完所有线索
        if (collectedClues.length + 1 >= NPCS.filter(npc => npc.hasClue).length) {
          setTimeout(() => {
            onAllCluesCollected();
          }, 1000);
        }
      }
    }
    
    setCurrentDialogue(null);
  }, [currentDialogue, collectedClues, onClueCollected, onAllCluesCollected]);

  // 获取玩家精灵图标
  const getPlayerSprite = () => {
    switch (direction) {
      case 'up': return '🚶';
      case 'down': return '🚶';
      case 'left': return '🚶';
      case 'right': return '🚶';
    }
  };

  return (
    <div className="relative w-full h-full flex items-center justify-center bg-gradient-to-br from-indigo-950 via-slate-900 to-purple-950 overflow-hidden">
      {/* 背景装饰 */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-0 left-0 w-96 h-96 bg-blue-500 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-purple-500 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-cyan-500 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
      </div>
      
      {/* 地图容器 */}
      <div 
        className="relative rounded-2xl overflow-hidden shadow-[0_0_60px_rgba(59,130,246,0.5)] border-4 border-blue-500/30 backdrop-blur-sm"
        style={{
          width: MAP_WIDTH * TILE_SIZE,
          height: MAP_HEIGHT * TILE_SIZE,
          background: 'linear-gradient(135deg, #1e3a5f 0%, #0f172a 50%, #1a1f3a 100%)',
          boxShadow: '0 0 80px rgba(59, 130, 246, 0.4), inset 0 0 60px rgba(0, 0, 0, 0.5)'
        }}
      >
        {/* 动态网格背景 */}
        <div className="absolute inset-0 opacity-20">
          {Array.from({ length: MAP_HEIGHT }).map((_, y) => (
            <div key={y} className="flex">
              {Array.from({ length: MAP_WIDTH }).map((_, x) => (
                <div
                  key={`${x}-${y}`}
                  className="border border-cyan-500/20 transition-all hover:border-cyan-400/40 hover:bg-cyan-500/5"
                  style={{ width: TILE_SIZE, height: TILE_SIZE }}
                />
              ))}
            </div>
          ))}
        </div>
        
        {/* 光效层 */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute inset-0 bg-gradient-to-t from-transparent via-blue-500/5 to-transparent animate-pulse" />
        </div>

        {/* 障碍物 */}
        {OBSTACLES.map((obstacle, idx) => (
          <motion.div
            key={idx}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: idx * 0.05 }}
            className={cn(
              "absolute transition-all duration-300",
              obstacle.type === 'building' && "bg-gradient-to-br from-slate-700 via-slate-800 to-slate-900 border-2 border-blue-500/40 rounded-lg shadow-[0_0_20px_rgba(59,130,246,0.3)] hover:shadow-[0_0_30px_rgba(59,130,246,0.5)]",
              obstacle.type === 'tree' && "bg-gradient-to-br from-emerald-700 to-green-900 rounded-full shadow-[0_0_15px_rgba(16,185,129,0.4)] border-2 border-emerald-500/30",
              obstacle.type === 'water' && "bg-gradient-to-br from-blue-600/60 via-cyan-600/50 to-blue-800/60 backdrop-blur-sm animate-pulse shadow-[0_0_25px_rgba(6,182,212,0.5)]",
              obstacle.type === 'bridge' && "bg-gradient-to-br from-amber-800 via-yellow-900 to-amber-950 border-2 border-yellow-600/50 shadow-[0_0_20px_rgba(251,191,36,0.4)] rounded"
            )}
            style={{
              left: obstacle.x * TILE_SIZE,
              top: obstacle.y * TILE_SIZE,
              width: obstacle.width * TILE_SIZE,
              height: obstacle.height * TILE_SIZE
            }}
          >
            {obstacle.label && (
              <div className="absolute inset-0 flex items-center justify-center text-xs font-bold bg-black/30 backdrop-blur-sm rounded">
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-300 to-cyan-300 drop-shadow-[0_0_8px_rgba(59,130,246,0.8)]">
                  {obstacle.label}
                </span>
              </div>
            )}
          </motion.div>
        ))}

        {/* NPCs */}
        {NPCS.map((npc) => {
          const hasCollected = collectedClues.includes(npc.id);
          const isNearby = Math.abs(npc.x - playerX) + Math.abs(npc.y - playerY) <= 1;
          
          return (
            <motion.div
              key={npc.id}
              className="absolute flex flex-col items-center z-10"
              style={{
                left: npc.x * TILE_SIZE,
                top: npc.y * TILE_SIZE,
                width: TILE_SIZE,
                height: TILE_SIZE
              }}
              initial={{ scale: 0, opacity: 0 }}
              animate={{
                scale: isNearby ? 1.3 : 1,
                opacity: 1
              }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
            >
              {/* NPC发光背景 */}
              {isNearby && (
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-blue-500/30 to-purple-500/30 rounded-full blur-xl"
                  animate={{
                    scale: [1, 1.5, 1],
                    opacity: [0.3, 0.6, 0.3]
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                />
              )}
              
              {/* NPC头像 */}
              <div className={cn(
                "text-3xl relative z-10 transition-all duration-300",
                isNearby && "drop-shadow-[0_0_15px_rgba(59,130,246,0.8)]"
              )}>
                {npc.avatar}
              </div>
              
              {/* NPC名字 */}
              <div className={cn(
                "text-xs font-bold mt-1 whitespace-nowrap px-2 py-0.5 rounded-full transition-all duration-300",
                isNearby 
                  ? "bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-[0_0_15px_rgba(59,130,246,0.6)]" 
                  : "bg-slate-800/80 text-slate-300 border border-slate-600/50"
              )}>
                {npc.name}
              </div>
              
              {/* 任务提示 */}
              {isNearby && !hasCollected && npc.hasClue && (
                <motion.div
                  initial={{ opacity: 0, y: -10, scale: 0 }}
                  animate={{ 
                    opacity: 1, 
                    y: [-8, -12, -8],
                    scale: 1
                  }}
                  transition={{
                    y: {
                      duration: 1.5,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }
                  }}
                  className="absolute -top-8 bg-gradient-to-r from-yellow-400 to-orange-500 text-black text-xs px-3 py-1 rounded-full font-bold shadow-[0_0_20px_rgba(251,191,36,0.8)] border-2 border-yellow-300"
                >
                  💬 按Enter对话
                </motion.div>
              )}
              
              {/* 完成标记 */}
              {hasCollected && (
                <motion.div
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  className="absolute -top-8 text-2xl"
                >
                  <span className="drop-shadow-[0_0_10px_rgba(34,197,94,0.8)]">✅</span>
                </motion.div>
              )}
            </motion.div>
          );
        })}

        {/* 粒子效果层 */}
        <div className="absolute inset-0 pointer-events-none z-30">
          {particles.map(particle => (
            <motion.div
              key={particle.id}
              className="absolute w-2 h-2 rounded-full"
              style={{
                left: particle.x,
                top: particle.y,
                backgroundColor: particle.color,
                opacity: particle.life / particle.maxLife,
                boxShadow: `0 0 ${particle.type === 'sparkle' ? '8px' : '4px'} ${particle.color}`
              }}
              initial={{ scale: 1 }}
              animate={{ scale: particle.type === 'sparkle' ? [1, 1.5, 0.5] : [1, 0.8, 0.3] }}
              transition={{ duration: 0.5 }}
            />
          ))}
        </div>

        {/* 玩家 */}
        <motion.div
          className="absolute z-20 flex items-center justify-center"
          style={{
            left: playerX * TILE_SIZE,
            top: playerY * TILE_SIZE,
            width: TILE_SIZE,
            height: TILE_SIZE,
            transform: `translateX(${cameraShake}px)`
          }}
          animate={{
            rotate: direction === 'left' ? -90 : direction === 'right' ? 90 : direction === 'down' ? 180 : 0,
            y: isWalking ? [0, -4, 0] : 0
          }}
          transition={{ 
            type: "spring", 
            stiffness: 500, 
            damping: 30,
            y: { duration: 0.2 }
          }}
        >
          {/* 玩家光环 */}
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-cyan-400/40 to-blue-500/40 rounded-full blur-lg"
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.4, 0.7, 0.4]
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
          
          {/* 玩家角色 */}
          <div className="text-4xl relative z-10 drop-shadow-[0_0_20px_rgba(6,182,212,1)]">
            {getPlayerSprite()}
          </div>
        </motion.div>

        {/* CRT扫描线效果 */}
        <div className="absolute inset-0 pointer-events-none z-40 opacity-10">
          <div 
            className="absolute inset-0"
            style={{
              backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0, 0, 0, 0.3) 2px, rgba(0, 0, 0, 0.3) 4px)',
              animation: 'scanline 8s linear infinite'
            }}
          />
        </div>

        {/* 像素化滤镜效果 */}
        <div className="absolute inset-0 pointer-events-none z-40 mix-blend-overlay opacity-5">
          <div 
            className="absolute inset-0"
            style={{
              backgroundImage: 'repeating-conic-gradient(rgba(255,255,255,0.1) 0% 25%, transparent 0% 50%) 50% / 4px 4px'
            }}
          />
        </div>
      </div>

      {/* 对话框 */}
      <AnimatePresence>
        {currentDialogue && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.9 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className="absolute bottom-8 left-1/2 -translate-x-1/2 w-[650px] max-w-[90vw]"
          >
            {/* 对话框背景光晕 */}
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/30 to-purple-500/30 rounded-2xl blur-2xl" />
            
            {/* 对话框主体 */}
            <div className="relative bg-gradient-to-br from-slate-900/95 via-slate-800/95 to-slate-900/95 border-2 border-blue-500/50 rounded-2xl p-6 shadow-[0_0_60px_rgba(59,130,246,0.4)] backdrop-blur-xl">
              {/* 顶部装饰条 */}
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-cyan-500 rounded-t-2xl" />
              
              <div className="flex items-start gap-4">
                {/* NPC头像 */}
                <motion.div 
                  className="text-5xl relative"
                  animate={{
                    scale: [1, 1.1, 1],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-500/30 to-purple-500/30 rounded-full blur-xl" />
                  <div className="relative z-10 drop-shadow-[0_0_15px_rgba(59,130,246,0.8)]">
                    {currentDialogue.npc.avatar}
                  </div>
                </motion.div>
                
                <div className="flex-1">
                  {/* NPC名字 */}
                  <div className="text-xl font-bold mb-3 bg-gradient-to-r from-blue-400 via-purple-400 to-cyan-400 text-transparent bg-clip-text drop-shadow-[0_0_10px_rgba(59,130,246,0.5)]">
                    {currentDialogue.npc.name}
                  </div>
                  
                  {/* 对话内容 */}
                  <div className="text-slate-100 leading-relaxed text-base bg-slate-800/30 rounded-lg p-4 border border-slate-700/50">
                    {currentDialogue.text}
                  </div>
                </div>
              </div>
              
              {/* 继续按钮 */}
              <motion.button
                onClick={closeDialogue}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="mt-4 w-full px-6 py-3 bg-gradient-to-r from-blue-600 via-purple-600 to-cyan-600 hover:from-blue-500 hover:via-purple-500 hover:to-cyan-500 text-white font-bold rounded-xl transition-all shadow-[0_0_30px_rgba(59,130,246,0.5)] hover:shadow-[0_0_40px_rgba(59,130,246,0.7)] border border-blue-400/30"
              >
                <span className="flex items-center justify-center gap-2">
                  继续 <kbd className="px-2 py-1 bg-white/20 rounded text-xs">Enter</kbd>
                </span>
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 控制提示 */}
      {showControls && (
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="absolute top-4 right-4"
        >
          {/* 背景光晕 */}
          <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-blue-500/20 rounded-xl blur-xl" />
          
          <div className="relative bg-gradient-to-br from-slate-900/95 via-slate-800/95 to-slate-900/95 border-2 border-purple-500/40 rounded-xl p-4 text-sm shadow-[0_0_30px_rgba(168,85,247,0.3)] backdrop-blur-xl">
            <div className="flex items-center justify-between mb-3">
              <div className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-400 font-bold flex items-center gap-2">
                🎮 操作说明
              </div>
              <button
                onClick={() => setShowControls(false)}
                className="text-slate-500 hover:text-slate-300 transition-colors"
              >
                ✕
              </button>
            </div>
            <div className="space-y-2 text-slate-300">
              <div className="flex items-center gap-2 bg-slate-800/50 rounded px-2 py-1">
                <kbd className="px-2 py-1 bg-slate-700 rounded text-xs">↑↓←→</kbd>
                <span className="text-xs">或</span>
                <kbd className="px-2 py-1 bg-slate-700 rounded text-xs">WASD</kbd>
                <span className="text-xs">移动</span>
              </div>
              <div className="flex items-center gap-2 bg-slate-800/50 rounded px-2 py-1">
                <kbd className="px-2 py-1 bg-slate-700 rounded text-xs">Enter</kbd>
                <span className="text-xs">/</span>
                <kbd className="px-2 py-1 bg-slate-700 rounded text-xs">空格</kbd>
                <span className="text-xs">对话</span>
              </div>
              <div className="text-yellow-400 mt-3 bg-yellow-500/10 rounded px-2 py-1.5 border border-yellow-500/30 text-xs">
                💡 找到5位村民收集线索
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* 线索收集进度 */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="absolute top-4 left-4"
      >
        {/* 背景光晕 */}
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-cyan-500/20 rounded-xl blur-xl" />
        
        <div className="relative bg-gradient-to-br from-slate-900/95 via-slate-800/95 to-slate-900/95 border-2 border-blue-500/40 rounded-xl p-4 shadow-[0_0_30px_rgba(59,130,246,0.3)] backdrop-blur-xl min-w-[200px]">
          <div className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400 font-bold mb-3 flex items-center gap-2">
            📋 线索收集进度
          </div>
          
          {/* 进度数字 */}
          <div className="text-3xl font-bold mb-3 text-center">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-400 drop-shadow-[0_0_10px_rgba(34,197,94,0.5)]">
              {collectedClues.length}
            </span>
            <span className="text-slate-500 mx-1">/</span>
            <span className="text-slate-400">
              {NPCS.filter(npc => npc.hasClue).length}
            </span>
          </div>
          
          {/* 进度条 */}
          <div className="w-full h-2 bg-slate-700 rounded-full overflow-hidden mb-3">
            <motion.div
              className="h-full bg-gradient-to-r from-blue-500 via-cyan-500 to-green-500 shadow-[0_0_10px_rgba(59,130,246,0.8)]"
              initial={{ width: 0 }}
              animate={{ 
                width: `${(collectedClues.length / NPCS.filter(npc => npc.hasClue).length) * 100}%` 
              }}
              transition={{ type: "spring", stiffness: 100, damping: 15 }}
            />
          </div>
          
          {/* NPC列表 */}
          <div className="space-y-1.5">
            {NPCS.filter(npc => npc.hasClue).map(npc => {
              const collected = collectedClues.includes(npc.id);
              return (
                <motion.div
                  key={npc.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className={cn(
                    "text-sm flex items-center gap-2 px-2 py-1 rounded transition-all",
                    collected 
                      ? "bg-green-500/20 border border-green-500/30 text-green-400" 
                      : "bg-slate-800/30 border border-slate-700/30 text-slate-500"
                  )}
                >
                  <span className="text-base">
                    {collected ? '✅' : '⭕'}
                  </span>
                  <span>{npc.name}</span>
                </motion.div>
              );
            })}
          </div>
        </div>
      </motion.div>

      {/* 移动按钮（移动端） */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        className="absolute bottom-24 right-8 grid grid-cols-3 gap-2 md:hidden"
      >
        <div />
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={() => movePlayer(0, -1, 'up')}
          className="w-14 h-14 bg-gradient-to-br from-slate-700 to-slate-800 hover:from-slate-600 hover:to-slate-700 rounded-xl flex items-center justify-center text-white shadow-[0_0_20px_rgba(100,116,139,0.5)] border border-slate-600/50 transition-all"
        >
          <ChevronUp className="w-6 h-6" />
        </motion.button>
        <div />
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={() => movePlayer(-1, 0, 'left')}
          className="w-14 h-14 bg-gradient-to-br from-slate-700 to-slate-800 hover:from-slate-600 hover:to-slate-700 rounded-xl flex items-center justify-center text-white shadow-[0_0_20px_rgba(100,116,139,0.5)] border border-slate-600/50 transition-all"
        >
          <ChevronLeft className="w-6 h-6" />
        </motion.button>
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={checkNPCInteraction}
          className="w-14 h-14 bg-gradient-to-br from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 rounded-xl flex items-center justify-center text-white shadow-[0_0_30px_rgba(59,130,246,0.6)] border border-blue-400/50 transition-all"
        >
          <MessageCircle className="w-6 h-6" />
        </motion.button>
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={() => movePlayer(1, 0, 'right')}
          className="w-14 h-14 bg-gradient-to-br from-slate-700 to-slate-800 hover:from-slate-600 hover:to-slate-700 rounded-xl flex items-center justify-center text-white shadow-[0_0_20px_rgba(100,116,139,0.5)] border border-slate-600/50 transition-all"
        >
          <ChevronRight className="w-6 h-6" />
        </motion.button>
        <div />
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={() => movePlayer(0, 1, 'down')}
          className="w-14 h-14 bg-gradient-to-br from-slate-700 to-slate-800 hover:from-slate-600 hover:to-slate-700 rounded-xl flex items-center justify-center text-white shadow-[0_0_20px_rgba(100,116,139,0.5)] border border-slate-600/50 transition-all"
        >
          <ChevronDown className="w-6 h-6" />
        </motion.button>
        <div />
      </motion.div>
    </div>
  );
}
