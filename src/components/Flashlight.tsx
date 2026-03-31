import React, { useState, useEffect, useRef } from 'react';

export function Flashlight({ children, active = true }: { children: React.ReactNode, active?: boolean }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [mousePos, setMousePos] = useState({ x: '50%', y: '50%' });
  const [hasInteracted, setHasInteracted] = useState(false);

  useEffect(() => {
    if (!active) return;
    
    const handleMouseMove = (e: MouseEvent) => {
      if (containerRef.current) {
        setHasInteracted(true);
        const rect = containerRef.current.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        setMousePos({ x: `${x}px`, y: `${y}px` });
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (containerRef.current && e.touches.length > 0) {
        setHasInteracted(true);
        const rect = containerRef.current.getBoundingClientRect();
        const x = e.touches[0].clientX - rect.left;
        const y = e.touches[0].clientY - rect.top;
        setMousePos({ x: `${x}px`, y: `${y}px` });
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('touchmove', handleTouchMove);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('touchmove', handleTouchMove);
    };
  }, [active]);

  return (
    <div 
      ref={containerRef} 
      className="relative w-full h-full overflow-hidden bg-black"
    >
      {/* Hidden background that gets revealed */}
      <div 
        className="absolute inset-0 w-full h-full transition-opacity duration-300"
        style={{
          opacity: active ? 1 : 0.3,
          ...(active ? {
            maskImage: `radial-gradient(circle 400px at ${mousePos.x} ${mousePos.y}, black 0%, black 30%, transparent 100%)`,
            WebkitMaskImage: `radial-gradient(circle 400px at ${mousePos.x} ${mousePos.y}, black 0%, black 30%, transparent 100%)`
          } : {})
        }}
      >
        {children}
      </div>
      
      {/* Overlay for when flashlight is off or to add ambient darkness */}
      {active && (
        <div className="absolute inset-0 pointer-events-none bg-black/50 mix-blend-multiply" />
      )}
      
      {/* 初始提示 */}
      {active && !hasInteracted && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-50">
          <div className="bg-black/90 border-2 border-blue-500 px-8 py-4 rounded-lg">
            <p className="text-blue-400 text-xl font-bold">👆 移动鼠标开始探索</p>
          </div>
        </div>
      )}
    </div>
  );
}
