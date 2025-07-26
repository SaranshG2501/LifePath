
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Trophy, 
  Star, 
  Target, 
  TrendingUp, 
  Award, 
  Zap,
  Brain,
  Heart,
  DollarSign,
  Users,
  BookOpen
} from 'lucide-react';
import { ScenarioHistory } from '@/lib/firebase';

interface ProfileStatsProps {
  scenarioHistory: ScenarioHistory[];
  userLevel: number;
  userXp: number;
}

const ProfileStats: React.FC<ProfileStatsProps> = ({ scenarioHistory, userLevel, userXp }) => {
  const getTotalScore = () => {
    return scenarioHistory.reduce((total, history) => {
      if (history.finalMetrics) {
        return total + Object.values(history.finalMetrics).reduce((a, b) => a + b, 0);
      }
      return total;
    }, 0);
  };

  const getAverageScore = () => {
    if (scenarioHistory.length === 0) return 0;
    return Math.round(getTotalScore() / scenarioHistory.length);
  };

  const getMetricAverages = () => {
    if (scenarioHistory.length === 0) {
      return { health: 0, money: 0, happiness: 0, knowledge: 0, relationships: 0 };
    }

    const totals = scenarioHistory.reduce((acc, history) => {
      if (history.finalMetrics) {
        Object.entries(history.finalMetrics).forEach(([key, value]) => {
          acc[key] = (acc[key] || 0) + value;
        });
      }
      return acc;
    }, {} as Record<string, number>);

    return Object.fromEntries(
      Object.entries(totals).map(([key, value]) => [
        key, 
        Math.round(value / scenarioHistory.length)
      ])
    );
  };

  const averageMetrics = getMetricAverages();
  const nextLevelXp = userLevel * 100;
  const currentLevelProgress = (userXp % 100);

  const metricIcons = {
    health: Heart,
    money: DollarSign,
    happiness: Star,
    knowledge: Brain,
    relationships: Users
  };

  const metricColors = {
    health: 'text-red-400 bg-red-500/20 border-red-500/30',
    money: 'text-green-400 bg-green-500/20 border-green-500/30',
    happiness: 'text-yellow-400 bg-yellow-500/20 border-yellow-500/30',
    knowledge: 'text-blue-400 bg-blue-500/20 border-blue-500/30',
    relationships: 'text-purple-400 bg-purple-500/20 border-purple-500/30'
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
      {/* Level & XP Card */}
      <Card className="bg-gradient-to-br from-yellow-500/10 to-orange-500/10 border-yellow-500/30 backdrop-blur-sm col-span-1 sm:col-span-2">
        <CardContent className="p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row items-center justify-between mb-3 sm:mb-4 gap-3">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="p-2 sm:p-3 bg-yellow-500/20 rounded-full">
                <Trophy className="h-5 w-5 sm:h-6 sm:w-6 text-yellow-400" />
              </div>
              <div className="text-center sm:text-left">
                <div className="text-xl sm:text-2xl font-bold text-white">Level {userLevel}</div>
                <div className="text-yellow-300 text-xs sm:text-sm">{userXp} XP Total</div>
              </div>
            </div>
            <Badge className="bg-yellow-500/20 text-yellow-300 border-yellow-500/30 px-2 py-1 sm:px-3 sm:py-1 text-xs">
              <Zap className="h-3 w-3 mr-1" />
              Active
            </Badge>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-xs sm:text-sm">
              <span className="text-white/70">Progress to Level {userLevel + 1}</span>
              <span className="text-yellow-300 font-medium">{currentLevelProgress}/100 XP</span>
            </div>
            <Progress value={currentLevelProgress} className="h-2 bg-slate-700" />
          </div>
        </CardContent>
      </Card>

      {/* Total Scenarios */}
      <Card className="bg-gradient-to-br from-blue-500/10 to-blue-600/10 border-blue-500/30 backdrop-blur-sm">
        <CardContent className="p-4 sm:p-6 text-center">
          <div className="flex items-center justify-center mb-2 sm:mb-3">
            <div className="p-2 sm:p-3 bg-blue-500/20 rounded-full">
              <BookOpen className="h-5 w-5 sm:h-6 sm:w-6 text-blue-400" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-bold text-white mb-1">{scenarioHistory.length}</div>
          <div className="text-blue-300 text-xs sm:text-sm">Scenarios Completed</div>
        </CardContent>
      </Card>

      {/* Average Score */}
      <Card className="bg-gradient-to-br from-green-500/10 to-green-600/10 border-green-500/30 backdrop-blur-sm">
        <CardContent className="p-4 sm:p-6 text-center">
          <div className="flex items-center justify-center mb-2 sm:mb-3">
            <div className="p-2 sm:p-3 bg-green-500/20 rounded-full">
              <Target className="h-5 w-5 sm:h-6 sm:w-6 text-green-400" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-bold text-white mb-1">{getAverageScore()}</div>
          <div className="text-green-300 text-xs sm:text-sm">Average Score</div>
        </CardContent>
      </Card>

      {/* Decision Metrics */}
      <Card className="bg-gradient-to-br from-slate-800/60 to-slate-700/60 border-slate-600/50 backdrop-blur-sm col-span-1 sm:col-span-2 lg:col-span-4">
        <CardContent className="p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
            <div className="p-1.5 sm:p-2 bg-purple-500/20 rounded-lg">
              <TrendingUp className="h-4 w-4 sm:h-5 sm:w-5 text-purple-400" />
            </div>
            <h3 className="text-lg sm:text-xl font-bold text-white">Decision Metrics</h3>
            <Badge className="bg-purple-500/20 text-purple-300 border-purple-500/30 text-xs sm:text-sm">
              Average Performance
            </Badge>
          </div>
          
          {scenarioHistory.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
              {Object.entries(averageMetrics).map(([metric, value]) => {
                const Icon = metricIcons[metric as keyof typeof metricIcons];
                const colorClass = metricColors[metric as keyof typeof metricColors];
                const percentage = Math.min((value / 120) * 100, 100);
                
                return (
                  <div key={metric} className={`bg-slate-700/40 rounded-lg sm:rounded-xl p-3 sm:p-4 border ${colorClass.split(' ')[2]}`}>
                    <div className="flex items-center gap-1 sm:gap-2 mb-2 sm:mb-3">
                      <div className={`p-1.5 sm:p-2 rounded-full ${colorClass.split(' ')[1]}`}>
                        <Icon className={`h-3 w-3 sm:h-4 sm:w-4 ${colorClass.split(' ')[0]}`} />
                      </div>
                      <span className="text-white font-medium capitalize text-xs sm:text-sm">
                        {metric}
                      </span>
                    </div>
                    <div className="text-xl sm:text-2xl font-bold text-white mb-1 sm:mb-2">{value}</div>
                    <Progress value={percentage} className="h-1.5 sm:h-2 bg-slate-600" />
                    <div className="text-xs text-white/60 mt-1">
                      {percentage.toFixed(0)}% optimal
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="p-4 bg-slate-700/30 rounded-full w-fit mx-auto mb-4">
                <Award className="h-8 w-8 text-slate-500" />
              </div>
              <div className="text-slate-400 text-lg font-medium mb-2">No metrics yet</div>
              <div className="text-slate-500">Complete scenarios to see your decision patterns</div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ProfileStats;
