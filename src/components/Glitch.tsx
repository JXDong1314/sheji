export function Glitch({ text, className = '' }: { text: string, className?: string }) {
  return (
    <span className={`glitch font-bold text-red-500 ${className}`} data-text={text}>
      {text}
    </span>
  );
}
