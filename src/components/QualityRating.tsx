import { motion } from 'motion/react';
import { Star } from 'lucide-react';

interface QualityRatingProps {
  rating: number; // 1-5
  maxRating?: number;
  onChange?: (rating: number) => void;
}

export function QualityRating({ rating, maxRating = 5 }: QualityRatingProps) {
  const getStatusText = () => {
    if (rating >= 5) return '完美';
    if (rating >= 4) return '优秀';
    if (rating >= 3) return '良好';
    if (rating >= 2) return '需改进';
    return '不合格';
  };

  const getStatusColor = () => {
    if (rating >= 4) return 'text-green-400';
    if (rating >= 3) return 'text-yellow-400';
    if (rating >= 2) return 'text-orange-400';
    return 'text-red-400';
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      className="fixed top-4 right-4 z-50"
    >
      <div className="bg-slate-900/90 border-2 border-slate-700 rounded-lg px-4 py-3 backdrop-blur-sm">
        <div className="text-slate-400 text-xs mb-2">📊 设计质量</div>
        <div className="flex gap-1 mb-2">
          {Array.from({ length: maxRating }).map((_, index) => (
            <motion.div
              key={index}
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ 
                delay: index * 0.1,
                type: 'spring',
                stiffness: 200
              }}
            >
              <Star
                className={`w-6 h-6 transition-all ${
                  index < rating
                    ? 'fill-yellow-400 text-yellow-400 drop-shadow-[0_0_8px_rgba(250,204,21,0.5)]'
                    : 'text-slate-600'
                }`}
              />
            </motion.div>
          ))}
        </div>
        <div className={`text-sm font-bold ${getStatusColor()}`}>
          {getStatusText()}
        </div>
        {rating <= 2 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-xs text-red-400 mt-2"
          >
            ⚠️ 质量不达标
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}
