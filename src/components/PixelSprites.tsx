/**
 * 像素风格精灵图组件 - 使用CSS绘制的像素艺术
 */
import React from 'react';

// NPC角色组件
export const VillageChiefSprite = () => (
  <div className="relative w-12 h-12 pixel-perfect" style={{ imageRendering: 'pixelated' }}>
    {/* 老村长 - 白胡子老人 */}
    <div className="absolute inset-0 flex flex-col items-center justify-center">
      {/* 头部 */}
      <div className="w-8 h-8 bg-gradient-to-br from-amber-100 to-amber-200 rounded-sm border-2 border-amber-800 relative">
        {/* 眼睛 */}
        <div className="absolute top-2 left-1.5 w-1.5 h-1.5 bg-slate-800 rounded-full" />
        <div className="absolute top-2 right-1.5 w-1.5 h-1.5 bg-slate-800 rounded-full" />
        {/* 胡子 */}
        <div className="absolute bottom-0 left-0 right-0 h-3 bg-gradient-to-b from-slate-100 to-slate-300 rounded-b" />
      </div>
      {/* 帽子 */}
      <div className="absolute -top-1 w-10 h-2 bg-gradient-to-r from-red-700 to-red-800 rounded-t-lg" />
    </div>
  </div>
);

export const EngineerSprite = () => (
  <div className="relative w-12 h-12 pixel-perfect" style={{ imageRendering: 'pixelated' }}>
    {/* 工程师 - 戴安全帽 */}
    <div className="absolute inset-0 flex flex-col items-center justify-center">
      {/* 安全帽 */}
      <div className="absolute top-0 w-10 h-3 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-t-lg border-2 border-yellow-700" />
      {/* 头部 */}
      <div className="w-8 h-8 bg-gradient-to-br from-amber-100 to-amber-200 rounded-sm border-2 border-amber-800 relative mt-2">
        {/* 眼睛 */}
        <div className="absolute top-2 left-1.5 w-1.5 h-1.5 bg-slate-800 rounded-full" />
        <div className="absolute top-2 right-1.5 w-1.5 h-1.5 bg-slate-800 rounded-full" />
        {/* 微笑 */}
        <div className="absolute bottom-2 left-2 right-2 h-0.5 bg-slate-700 rounded-full" />
      </div>
      {/* 工作服 */}
      <div className="absolute bottom-0 w-10 h-4 bg-gradient-to-br from-blue-600 to-blue-800 rounded-b border-2 border-blue-900" />
    </div>
  </div>
);

export const ElderlyWomanSprite = () => (
  <div className="relative w-12 h-12 pixel-perfect" style={{ imageRendering: 'pixelated' }}>
    {/* 老奶奶 - 灰发慈祥 */}
    <div className="absolute inset-0 flex flex-col items-center justify-center">
      {/* 头发 */}
      <div className="absolute top-0 w-10 h-3 bg-gradient-to-br from-slate-300 to-slate-400 rounded-t-lg" />
      {/* 头部 */}
      <div className="w-8 h-8 bg-gradient-to-br from-amber-100 to-amber-200 rounded-sm border-2 border-amber-800 relative mt-1">
        {/* 眼睛 */}
        <div className="absolute top-2 left-1.5 w-1.5 h-1.5 bg-slate-800 rounded-full" />
        <div className="absolute top-2 right-1.5 w-1.5 h-1.5 bg-slate-800 rounded-full" />
        {/* 慈祥的笑容 */}
        <div className="absolute bottom-2 left-1.5 right-1.5 h-1 border-b-2 border-slate-700 rounded-full" />
      </div>
      {/* 衣服 */}
      <div className="absolute bottom-0 w-10 h-4 bg-gradient-to-br from-purple-700 to-purple-900 rounded-b border-2 border-purple-950" />
    </div>
  </div>
);

export const FarmerSprite = () => (
  <div className="relative w-12 h-12 pixel-perfect" style={{ imageRendering: 'pixelated' }}>
    {/* 农民 - 草帽 */}
    <div className="absolute inset-0 flex flex-col items-center justify-center">
      {/* 草帽 */}
      <div className="absolute top-0 w-11 h-2 bg-gradient-to-br from-yellow-700 to-yellow-900 rounded-full border-2 border-yellow-950" />
      {/* 头部 */}
      <div className="w-8 h-8 bg-gradient-to-br from-amber-200 to-amber-300 rounded-sm border-2 border-amber-900 relative mt-1">
        {/* 眼睛 */}
        <div className="absolute top-2 left-1.5 w-1.5 h-1.5 bg-slate-800 rounded-full" />
        <div className="absolute top-2 right-1.5 w-1.5 h-1.5 bg-slate-800 rounded-full" />
        {/* 微笑 */}
        <div className="absolute bottom-2 left-2 right-2 h-0.5 bg-slate-700 rounded-full" />
      </div>
      {/* 工作服 */}
      <div className="absolute bottom-0 w-10 h-4 bg-gradient-to-br from-green-700 to-green-900 rounded-b border-2 border-green-950" />
    </div>
  </div>
);

export const ChildSprite = () => (
  <div className="relative w-12 h-12 pixel-perfect" style={{ imageRendering: 'pixelated' }}>
    {/* 小孩 - 活泼 */}
    <div className="absolute inset-0 flex flex-col items-center justify-center">
      {/* 头发 */}
      <div className="absolute top-0 w-8 h-2 bg-gradient-to-br from-slate-800 to-slate-900 rounded-t-lg" />
      {/* 头部 */}
      <div className="w-7 h-7 bg-gradient-to-br from-amber-100 to-amber-200 rounded-sm border-2 border-amber-800 relative mt-1">
        {/* 大眼睛 */}
        <div className="absolute top-1.5 left-1 w-2 h-2 bg-slate-800 rounded-full" />
        <div className="absolute top-1.5 right-1 w-2 h-2 bg-slate-800 rounded-full" />
        {/* 开心的笑容 */}
        <div className="absolute bottom-1 left-1 right-1 h-1 border-b-2 border-slate-700 rounded-full" />
      </div>
      {/* 衣服 */}
      <div className="absolute bottom-0 w-9 h-4 bg-gradient-to-br from-red-500 to-red-700 rounded-b border-2 border-red-900" />
    </div>
  </div>
);

export const PlayerSprite = () => (
  <div className="relative w-12 h-12 pixel-perfect" style={{ imageRendering: 'pixelated' }}>
    {/* 玩家 - 探险者 */}
    <div className="absolute inset-0 flex flex-col items-center justify-center">
      {/* 帽子 */}
      <div className="absolute top-0 w-9 h-2 bg-gradient-to-br from-slate-600 to-slate-800 rounded-t-lg border-2 border-slate-900" />
      {/* 头部 */}
      <div className="w-8 h-8 bg-gradient-to-br from-amber-100 to-amber-200 rounded-sm border-2 border-amber-800 relative mt-1">
        {/* 眼睛 */}
        <div className="absolute top-2 left-1.5 w-1.5 h-1.5 bg-slate-800 rounded-full" />
        <div className="absolute top-2 right-1.5 w-1.5 h-1.5 bg-slate-800 rounded-full" />
        {/* 坚定的表情 */}
        <div className="absolute bottom-2 left-2 right-2 h-0.5 bg-slate-700" />
      </div>
      {/* 背包 */}
      <div className="absolute bottom-0 right-0 w-4 h-5 bg-gradient-to-br from-amber-700 to-amber-900 rounded border-2 border-amber-950" />
      {/* 衣服 */}
      <div className="absolute bottom-0 w-10 h-4 bg-gradient-to-br from-cyan-600 to-cyan-800 rounded-b border-2 border-cyan-950" />
    </div>
  </div>
);

// 地图元素组件
export const TreeSprite = ({ size = 48 }: { size?: number }) => (
  <div className="relative pixel-perfect" style={{ width: size, height: size, imageRendering: 'pixelated' }}>
    {/* 树冠 */}
    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-10 h-10 bg-gradient-to-br from-emerald-500 to-emerald-700 rounded-full border-2 border-emerald-900 shadow-lg" />
    {/* 树干 */}
    <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-3 h-6 bg-gradient-to-br from-amber-800 to-amber-950 border-2 border-amber-950 rounded-sm" />
  </div>
);

export const HouseSprite = ({ size = 96, label }: { size?: number; label?: string }) => (
  <div className="relative pixel-perfect" style={{ width: size, height: size, imageRendering: 'pixelated' }}>
    {/* 屋顶 */}
    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-1/2 bg-gradient-to-br from-red-600 to-red-800 clip-triangle border-2 border-red-950" 
         style={{ clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)' }} />
    {/* 墙壁 */}
    <div className="absolute bottom-0 w-full h-1/2 bg-gradient-to-br from-slate-600 to-slate-800 border-2 border-slate-950 rounded-b-lg" />
    {/* 门 */}
    <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1/4 h-1/3 bg-gradient-to-br from-amber-800 to-amber-950 border-2 border-amber-950 rounded-t-lg" />
    {/* 窗户 */}
    <div className="absolute top-1/2 left-1/4 w-1/6 h-1/6 bg-gradient-to-br from-cyan-300 to-cyan-500 border border-slate-900" />
    <div className="absolute top-1/2 right-1/4 w-1/6 h-1/6 bg-gradient-to-br from-cyan-300 to-cyan-500 border border-slate-900" />
    {label && (
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-xs font-bold text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] bg-black/30 px-2 py-1 rounded">
          {label}
        </span>
      </div>
    )}
  </div>
);

export const BridgeSprite = ({ size = 96 }: { size?: number }) => (
  <div className="relative pixel-perfect" style={{ width: size, height: size, imageRendering: 'pixelated' }}>
    {/* 桥面 */}
    <div className="absolute inset-0 bg-gradient-to-br from-amber-700 to-amber-900 border-2 border-amber-950">
      {/* 木板纹理 */}
      <div className="absolute inset-0 flex flex-col justify-around">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="h-0.5 bg-amber-950/30" />
        ))}
      </div>
      {/* 栏杆 */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-amber-950" />
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-amber-950" />
    </div>
  </div>
);

export const WaterTile = ({ size = 48 }: { size?: number }) => (
  <div className="relative pixel-perfect animate-pulse" style={{ width: size, height: size, imageRendering: 'pixelated' }}>
    <div className="absolute inset-0 bg-gradient-to-br from-blue-500 via-cyan-500 to-blue-600">
      {/* 波纹效果 */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-white rounded-full animate-ping" />
        <div className="absolute top-3/4 right-1/3 w-1.5 h-1.5 bg-white rounded-full animate-ping" style={{ animationDelay: '0.5s' }} />
      </div>
    </div>
  </div>
);

// 获取NPC精灵组件
export function getNPCSprite(npcId: string) {
  switch (npcId) {
    case 'chief': return <VillageChiefSprite />;
    case 'engineer': return <EngineerSprite />;
    case 'elder': return <ElderlyWomanSprite />;
    case 'farmer': return <FarmerSprite />;
    case 'child': return <ChildSprite />;
    default: return <div className="text-3xl">👤</div>;
  }
}
