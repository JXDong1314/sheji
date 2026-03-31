/**
 * 场景背景图组件
 * 用于显示各章节的背景图片，带有CSS滤镜效果
 */
import React from 'react';
import { cn } from '../lib/utils';

interface SceneBackgroundProps {
  scene: 'prologue' | 'chapter1' | 'chapter2' | 'chapter3' | 'ending';
  className?: string;
  overlay?: boolean;
  children?: React.ReactNode;
}

const SCENE_IMAGES = {
  prologue: '/images/scenes/prologue_bridge.png',
  chapter1: '/images/scenes/chapter1_hut.png',
  chapter2: '/images/scenes/chapter2_forge.png',
  chapter3: '/images/scenes/chapter3_lamppost.png',
  ending: '/images/scenes/ending_hope.png',
};

export function SceneBackground({ scene, className, overlay = true, children }: SceneBackgroundProps) {
  return (
    <div className="relative w-full h-full">
      {/* 背景图片 */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `url(${SCENE_IMAGES[scene]})`,
          filter: 'brightness(0.7) contrast(1.1)',
        }}
      />
      
      {/* 暗色叠加层（可选） */}
      {overlay && (
        <div className="absolute inset-0 bg-black/60" />
      )}
      
      {/* 内容层 - 直接渲染children，保持原有布局 */}
      {children}
    </div>
  );
}
