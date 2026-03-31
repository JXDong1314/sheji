import { useState, useEffect } from 'react';

export function Typewriter({ text, onComplete, speed = 50, className }: { text: string, onComplete?: () => void, speed?: number, className?: string }) {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    setCurrentIndex(0);
  }, [text]);

  useEffect(() => {
    if (currentIndex < text.length) {
      const timer = setTimeout(() => {
        setCurrentIndex(prev => prev + 1);
      }, speed);
      return () => clearTimeout(timer);
    }
  }, [currentIndex, text.length, speed]);

  useEffect(() => {
    if (currentIndex === text.length && text.length > 0) {
      if (onComplete) {
        onComplete();
      }
    }
    // We intentionally omit onComplete from the dependency array.
    // This ensures onComplete is only called once when currentIndex reaches text.length,
    // even if the parent component re-renders and provides a new onComplete function.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentIndex, text.length]);

  return <span className={className}>{text.substring(0, currentIndex)}</span>;
}
