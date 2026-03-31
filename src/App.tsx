/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { GameProvider } from './contexts/GameContext';
import { useGame } from './hooks/useGame';
import { ChapterSwitcher } from './components/ChapterSwitcher';
import { Prologue } from './scenes/Prologue';
import { Chapter1 } from './scenes/Chapter1';
import { Chapter2 } from './scenes/Chapter2';
import { Chapter3 } from './scenes/Chapter3';
import { Ending } from './scenes/Ending';

function GameContent() {
  const { state, setCurrentChapter, resetGame } = useGame();
  const [showEnding, setShowEnding] = useState(false);

  // 调试日志
  useEffect(() => {
    console.log('[App] 当前章节:', state.currentChapter);
    console.log('[App] 总分:', state.totalScore);
    console.log('[App] 已解锁成就:', state.unlockedAchievements);
  }, [state.currentChapter, state.totalScore, state.unlockedAchievements]);

  const handlePrologueComplete = () => {
    console.log('[App] 序章完成，切换到第一章');
    setCurrentChapter('chapter1');
  };

  const handleChapter1Complete = () => {
    console.log('[App] 第一章完成，切换到第二章');
    setCurrentChapter('chapter2');
  };

  const handleChapter2Complete = () => {
    console.log('[App] 第二章完成，切换到第三章');
    setCurrentChapter('chapter3');
  };

  const handleChapter3Complete = () => {
    console.log('[App] 第三章完成，显示结局');
    setShowEnding(true);
  };

  const handleRestart = () => {
    console.log('[App] 重新开始游戏');
    setShowEnding(false);
    setCurrentChapter('prologue');
  };

  // 显示结局
  if (showEnding) {
    return (
      <>
        <ChapterSwitcher
          currentChapter="ending"
          onChapterChange={(chapterId) => {
            if (chapterId === 'ending') return;
            setShowEnding(false);
            setCurrentChapter(chapterId);
          }}
          completedChapters={state.completedChapters}
        />
        <Ending onRestart={handleRestart} />
      </>
    );
  }

  return (
    <>
      <ChapterSwitcher
        currentChapter={state.currentChapter}
        onChapterChange={setCurrentChapter}
        completedChapters={state.completedChapters}
      />
      {state.currentChapter === 'prologue' && <Prologue onComplete={handlePrologueComplete} />}
      {state.currentChapter === 'chapter1' && <Chapter1 onComplete={handleChapter1Complete} />}
      {state.currentChapter === 'chapter2' && <Chapter2 onComplete={handleChapter2Complete} />}
      {state.currentChapter === 'chapter3' && <Chapter3 onComplete={handleChapter3Complete} />}
    </>
  );
}

export default function App() {
  return (
    <GameProvider>
      <GameContent />
    </GameProvider>
  );
}
