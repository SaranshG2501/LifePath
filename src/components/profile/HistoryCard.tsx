
import React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Calendar,
  Star,
  Target,
  Trophy,
  Heart,
  DollarSign,
  Users,
  Brain,
  Zap
} from 'lucide-react';

interface HistoryItem {
  id: string;
  scenarioId: string;
  title: string;
  completedAt: string;
  score: number;
  choices: number;
  metrics: {
    health: number;
    money: number;
    happiness: number;
    knowledge: number;
    relationships: number;
  };
}

interface HistoryCardProps {
  item: HistoryItem;
}

const HistoryCard: React.FC<HistoryCardProps> = ({ item }) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric'
    });
  };

  const getMetricIcon = (metric: string) => {
    const icons: Record<string, any> = {
      health: Heart,
      money: DollarSign,
      happiness: Star,
      knowledge: Brain,
      relationships: Users
    };
    return icons[metric] || Star;
  };

  const getMetricColor = (metric: string) => {
    const colors: Record<string, string> = {
      health: 'text-red-400',
      money: 'text-green-400',
      happiness: 'text-yellow-400',
      knowledge: 'text-blue-400',
      relationships: 'text-purple-400'
    };
    return colors[metric] || 'text-gray-400';
  };

  return (
    <Card className="p-4 bg-gradient-to-br from-slate-800/90 to-slate-700/90 border-2 border-neon-purple/30 hover:border-neon-purple/50 transition-all duration-300 hover:scale-[1.02] shadow-lg hover:shadow-neon-purple/20 rounded-xl">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <h3 className="text-base font-bold text-white mb-1">{item.title}</h3>
          <div className="flex items-center gap-3 text-xs text-white/70">
            <div className="flex items-center gap-1">
              <Calendar className="h-3 w-3 text-neon-blue" />
              <span>{formatDate(item.completedAt)}</span>
            </div>
            <Badge variant="outline" className="bg-neon-green/20 text-neon-green border-neon-green/30 text-xs px-2 py-1">
              <Trophy className="h-2 w-2 mr-1" />
              {item.score}
            </Badge>
          </div>
        </div>
        <div className="flex items-center gap-1 text-xs text-neon-purple">
          <Target className="h-3 w-3" />
          <span className="font-bold">{item.choices} moves</span>
        </div>
      </div>

      <div className="grid grid-cols-5 gap-2">
        {Object.entries(item.metrics).map(([metric, value]) => {
          const Icon = getMetricIcon(metric);
          const colorClass = getMetricColor(metric);
          
          return (
            <div key={metric} className="text-center">
              <div className="p-1 bg-slate-700/50 rounded-lg border border-white/10 mb-1">
                <Icon className={`h-3 w-3 ${colorClass} mx-auto`} />
              </div>
              <div className={`text-sm font-bold ${colorClass}`}>{value}</div>
            </div>
          );
        })}
      </div>
    </Card>
  );
};

export default HistoryCard;
