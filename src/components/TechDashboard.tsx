import { motion } from 'motion/react';
import { TrendingUp, TrendingDown, Minus, Activity } from 'lucide-react';

interface Metric {
  label: string;
  value: number;
  unit: string;
  status: 'good' | 'warning' | 'danger';
  trend?: 'up' | 'down' | 'stable';
}

interface TechDashboardProps {
  metrics: Metric[];
  predictedRank: string;
  show?: boolean;
}

export function TechDashboard({ metrics, predictedRank, show = true }: TechDashboardProps) {
  if (!show) return null;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'good': return 'text-green-400';
      case 'warning': return 'text-yellow-400';
      case 'danger': return 'text-red-400';
      default: return 'text-slate-400';
    }
  };

  const getTrendIcon = (trend?: string) => {
    switch (trend) {
      case 'up': return <TrendingUp className="w-4 h-4 text-green-400" />;
      case 'down': return <TrendingDown className="w-4 h-4 text-red-400" />;
      default: return <Minus className="w-4 h-4 text-slate-400" />;
    }
  };

  const getRankColor = (rank: string) => {
    if (rank.includes('S')) return 'text-yellow-400';
    if (rank.includes('A')) return 'text-blue-400';
    if (rank.includes('B')) return 'text-green-400';
    if (rank.includes('C')) return 'text-orange-400';
    if (rank.includes('D')) return 'text-red-400';
    if (rank.includes('F')) return 'text-red-600';
    return 'text-slate-400';
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.3 }}
      className="fixed right-4 top-32 z-40"
    >
      <div className="bg-slate-900/90 border-2 border-slate-700 rounded-lg p-4 w-64 backdrop-blur-sm">
        <h3 className="text-white font-bold mb-3 flex items-center gap-2">
          <Activity className="w-5 h-5 text-blue-400" />
          项目仪表盘
        </h3>
        
        <div className="space-y-3">
          {metrics.map((metric, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 + index * 0.1 }}
              className="flex items-center justify-between"
            >
              <div className="flex-1">
                <div className="text-slate-400 text-xs">{metric.label}</div>
                <div className={`font-bold ${getStatusColor(metric.status)}`}>
                  {metric.value}{metric.unit}
                </div>
              </div>
              {metric.trend && (
                <div className="ml-2">
                  {getTrendIcon(metric.trend)}
                </div>
              )}
            </motion.div>
          ))}
        </div>

        <div className="mt-4 pt-4 border-t border-slate-700">
          <div className="text-slate-400 text-xs mb-1">预测结局</div>
          <div className={`font-bold text-lg ${getRankColor(predictedRank)}`}>
            {predictedRank}
          </div>
          {(predictedRank.includes('D') || predictedRank.includes('F')) && (
            <div className="text-xs text-red-400 mt-1">
              ⚠️ 警告：质量不达标
            </div>
          )}
          {predictedRank.includes('S') && (
            <div className="text-xs text-yellow-400 mt-1">
              🌟 优秀！继续保持
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
