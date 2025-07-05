
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
  Zap,
  Clock
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
    try {
      return new Date(dateString).toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric',
        year: 'numeric'
      });
    } catch {
      return 'Recently';
    }
  };

  const formatTime = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleTimeString('en-US', { 
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return '';
    }
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

  const getScoreColor = (score: number) => {
    if (score >= 400) return 'text-green-400 border-green-500/30 bg-green-500/20';
    if (score >= 300) return 'text-blue-400 border-blue-500/30 bg-blue-500/20';
    if (score >= 200) return 'text-yellow-400 border-yellow-500/30 bg-yellow-500/20';
    return 'text-orange-400 border-orange-500/30 bg-orange-500/20';
  };

  return (
    <Card className="p-4 bg-gradient-to-br from-slate-800/90 to-slate-700/90 border-2 border-purple-500/30 hover:border-purple-500/50 transition-all duration-300 hover:scale-[1.02] shadow-lg hover:shadow-purple-500/20 rounded-xl group">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <h3 className="text-sm font-bold text-white mb-1 group-hover:text-purple-400 transition-colors">
            {item.title}
          </h3>
          <div className="flex items-center gap-3 text-xs text-white/70">
            <div className="flex items-center gap-1">
              <Calendar className="h-3 w-3 text-blue-400" />
              <span>{formatDate(item.completedAt)}</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="h-3 w-3 text-purple-400" />
              <span>{formatTime(item.completedAt)}</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge className={`text-xs px-2 py-1 border ${getScoreColor(item.score)}`}>
            <Trophy className="h-2 w-2 mr-1" />
            {item.score}
          </Badge>
          <div className="flex items-center gap-1 text-xs text-purple-400">
            <Target className="h-3 w-3" />
            <span className="font-bold">{item.choices}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-5 gap-2">
        {Object.entries(item.metrics).map(([metric, value]) => {
          const Icon = getMetricIcon(metric);
          const colorClass = getMetricColor(metric);
          
          return (
            <div key={metric} className="text-center">
              <div className="p-1 bg-slate-700/50 rounded-lg border border-white/10 mb-1 group-hover:border-purple-500/30 transition-colors">
                <Icon className={`h-3 w-3 ${colorClass} mx-auto`} />
              </div>
              <div className={`text-xs font-bold ${colorClass}`}>{value}</div>
              <div className="text-xs text-white/50 capitalize">{metric}</div>
            </div>
          );
        })}
      </div>

      {/* Progress indicator */}
      <div className="mt-3 pt-3 border-t border-white/10">
        <div className="flex justify-between items-center text-xs text-white/60">
          <span>Journey Progress</span>
          <span>{Math.round((item.score / 500) * 100)}% Complete</span>
        </div>
        <div className="w-full bg-slate-700 rounded-full h-1.5 mt-1">
          <div 
            className="bg-gradient-to-r from-purple-500 to-pink-500 h-1.5 rounded-full transition-all duration-500"
            style={{ width: `${Math.min((item.score / 500) * 100, 100)}%` }}
          ></div>
        </div>
      </div>
    </Card>
  );
};

export default HistoryCard;
