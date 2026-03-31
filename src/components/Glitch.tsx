/**
 * 专业技术高亮组件（替代原Glitch恐怖效果）
 * 用于突出显示重要的技术术语和关键信息
 */
export function Glitch({ text, className = '' }: { text: string, className?: string }) {
  return (
    <span className={`tech-highlight ${className}`}>
      {text}
    </span>
  );
}
