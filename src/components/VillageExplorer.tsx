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

const TILE_SIZE = 40; // 每个格子的大小
const MAP_WIDTH = 20; // 地图宽度（格子数）
const MAP_HEIGHT = 15; // 地图高度（格子数）

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
  const [playerX, setPlayerX] = useState(10);
  const [playerY, setPlayerY] = useState(12);
  const [direction, setDirection] = useState<'up' | 'down' | 'left' | 'right'>('up');
  const [currentDialogue, setCurrentDialogue] = useState<{ npc: NPC; text: string } | null>(null);
  const [showControls, setShowControls] = useState(true);

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
  const movePlayer = useCallback((dx: number, dy: number, newDirection: 'up' | 'down' | 'left' | 'right') => {
    const newX = playerX + dx;
    const newY = playerY + dy;
    
    setDirection(newDirection);
    
    if (!checkCollision(newX, newY)) {
      setPlayerX(newX);
      setPlayerY(newY);
      soundEffects.click();
    }
  }, [playerX, playerY, checkCollision]);

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
    // 检查玩家周围是否有NPC
    const nearbyNPC = NPCS.find(npc => {
      const distance = Math.abs(npc.x - playerX) + Math.abs(npc.y - playerY);
      return distance <= 1; // 相邻格子
    });

    if (nearbyNPC) {
      soundEffects.match();
      
      // 判断是否已收集该线索
      const hasCollected = collectedClues.includes(nearbyNPC.id);
      
      if (hasCollected) {
        // 已收集，显示后续对话
        setCurrentDialogue({
          npc: nearbyNPC,
          text: nearbyNPC.dialogues.afterClue || nearbyNPC.dialogues.initial
        });
      } else if (nearbyNPC.hasClue && nearbyNPC.dialogues.clue) {
        // 未收集，显示线索对话
        setCurrentDialogue({
          npc: nearbyNPC,
          text: nearbyNPC.dialogues.clue.text
        });
      } else {
        // 无线索，显示初始对话
        setCurrentDialogue({
          npc: nearbyNPC,
          text: nearbyNPC.dialogues.initial
        });
      }
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
    <div className="relative w-full h-full flex items-center justify-center bg-gradient-to-b from-slate-900 to-slate-800">
      {/* 地图容器 */}
      <div 
        className="relative border-4 border-slate-700 rounded-lg overflow-hidden shadow-2xl"
        style={{
          width: MAP_WIDTH * TILE_SIZE,
          height: MAP_HEIGHT * TILE_SIZE,
          background: 'linear-gradient(to bottom, #1e293b 0%, #0f172a 100%)'
        }}
      >
        {/* 网格背景 */}
        <div className="absolute inset-0 opacity-10">
          {Array.from({ length: MAP_HEIGHT }).map((_, y) => (
            <div key={y} className="flex">
              {Array.from({ length: MAP_WIDTH }).map((_, x) => (
                <div
                  key={`${x}-${y}`}
                  className="border border-slate-600"
                  style={{ width: TILE_SIZE, height: TILE_SIZE }}
                />
              ))}
            </div>
          ))}
        </div>

        {/* 障碍物 */}
        {OBSTACLES.map((obstacle, idx) => (
          <div
            key={idx}
            className={cn(
              "absolute transition-all",
              obstacle.type === 'building' && "bg-slate-700 border-2 border-slate-600 rounded",
              obstacle.type === 'tree' && "bg-green-800 rounded-full",
              obstacle.type === 'water' && "bg-blue-900 opacity-70",
              obstacle.type === 'bridge' && "bg-amber-900 border-2 border-amber-700"
            )}
            style={{
              left: obstacle.x * TILE_SIZE,
              top: obstacle.y * TILE_SIZE,
              width: obstacle.width * TILE_SIZE,
              height: obstacle.height * TILE_SIZE
            }}
          >
            {obstacle.label && (
              <div className="absolute inset-0 flex items-center justify-center text-xs text-slate-300 font-bold">
                {obstacle.label}
              </div>
            )}
          </div>
        ))}

        {/* NPCs */}
        {NPCS.map((npc) => {
          const hasCollected = collectedClues.includes(npc.id);
          const isNearby = Math.abs(npc.x - playerX) + Math.abs(npc.y - playerY) <= 1;
          
          return (
            <motion.div
              key={npc.id}
              className="absolute flex flex-col items-center"
              style={{
                left: npc.x * TILE_SIZE,
                top: npc.y * TILE_SIZE,
                width: TILE_SIZE,
                height: TILE_SIZE
              }}
              animate={{
                scale: isNearby ? 1.2 : 1
              }}
            >
              <div className="text-2xl">{npc.avatar}</div>
              <div className="text-xs text-slate-300 font-bold mt-1 whitespace-nowrap">
                {npc.name}
              </div>
              {isNearby && !hasCollected && npc.hasClue && (
                <motion.div
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="absolute -top-6 bg-yellow-500 text-black text-xs px-2 py-1 rounded-full font-bold"
                >
                  ❗
                </motion.div>
              )}
              {hasCollected && (
                <div className="absolute -top-6 text-green-500 text-lg">
                  ✓
                </div>
              )}
            </motion.div>
          );
        })}

        {/* 玩家 */}
        <motion.div
          className="absolute z-20 flex items-center justify-center text-3xl"
          style={{
            left: playerX * TILE_SIZE,
            top: playerY * TILE_SIZE,
            width: TILE_SIZE,
            height: TILE_SIZE
          }}
          animate={{
            rotate: direction === 'left' ? -90 : direction === 'right' ? 90 : direction === 'down' ? 180 : 0
          }}
        >
          {getPlayerSprite()}
        </motion.div>
      </div>

      {/* 对话框 */}
      <AnimatePresence>
        {currentDialogue && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="absolute bottom-8 left-1/2 -translate-x-1/2 w-[600px] bg-slate-900 border-4 border-slate-700 rounded-lg p-6 shadow-2xl"
          >
            <div className="flex items-start gap-4">
              <div className="text-4xl">{currentDialogue.npc.avatar}</div>
              <div className="flex-1">
                <div className="text-xl font-bold text-blue-400 mb-2">
                  {currentDialogue.npc.name}
                </div>
                <div className="text-slate-200 leading-relaxed">
                  {currentDialogue.text}
                </div>
              </div>
            </div>
            <button
              onClick={closeDialogue}
              className="mt-4 w-full px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded transition-all"
            >
              继续 (Enter)
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 控制提示 */}
      {showControls && (
        <div className="absolute top-4 right-4 bg-slate-900/90 border-2 border-slate-700 rounded-lg p-4 text-sm">
          <div className="flex items-center justify-between mb-2">
            <div className="text-blue-400 font-bold">操作说明</div>
            <button
              onClick={() => setShowControls(false)}
              className="text-slate-500 hover:text-slate-300"
            >
              ✕
            </button>
          </div>
          <div className="space-y-1 text-slate-300">
            <div>↑↓←→ 或 WASD - 移动</div>
            <div>Enter/空格 - 对话</div>
            <div className="text-yellow-400 mt-2">💡 找到5位村民收集线索</div>
          </div>
        </div>
      )}

      {/* 线索收集进度 */}
      <div className="absolute top-4 left-4 bg-slate-900/90 border-2 border-slate-700 rounded-lg p-4">
        <div className="text-blue-400 font-bold mb-2">线索收集进度</div>
        <div className="text-2xl font-bold text-white">
          {collectedClues.length} / {NPCS.filter(npc => npc.hasClue).length}
        </div>
        <div className="mt-2 space-y-1">
          {NPCS.filter(npc => npc.hasClue).map(npc => (
            <div
              key={npc.id}
              className={cn(
                "text-sm",
                collectedClues.includes(npc.id) ? "text-green-400" : "text-slate-500"
              )}
            >
              {collectedClues.includes(npc.id) ? '✓' : '○'} {npc.name}
            </div>
          ))}
        </div>
      </div>

      {/* 移动按钮（移动端） */}
      <div className="absolute bottom-24 right-8 grid grid-cols-3 gap-2 md:hidden">
        <div />
        <button
          onClick={() => movePlayer(0, -1, 'up')}
          className="w-12 h-12 bg-slate-700 hover:bg-slate-600 rounded flex items-center justify-center text-white"
        >
          <ChevronUp />
        </button>
        <div />
        <button
          onClick={() => movePlayer(-1, 0, 'left')}
          className="w-12 h-12 bg-slate-700 hover:bg-slate-600 rounded flex items-center justify-center text-white"
        >
          <ChevronLeft />
        </button>
        <button
          onClick={checkNPCInteraction}
          className="w-12 h-12 bg-blue-600 hover:bg-blue-500 rounded flex items-center justify-center text-white"
        >
          <MessageCircle />
        </button>
        <button
          onClick={() => movePlayer(1, 0, 'right')}
          className="w-12 h-12 bg-slate-700 hover:bg-slate-600 rounded flex items-center justify-center text-white"
        >
          <ChevronRight />
        </button>
        <div />
        <button
          onClick={() => movePlayer(0, 1, 'down')}
          className="w-12 h-12 bg-slate-700 hover:bg-slate-600 rounded flex items-center justify-center text-white"
        >
          <ChevronDown />
        </button>
        <div />
      </div>
    </div>
  );
}
