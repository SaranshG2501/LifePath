
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
    health: 'text-neon-red bg-red-500/20 border-neon-red/40',
    money: 'text-neon-green bg-green-500/20 border-neon-green/40',
    happiness: 'text-neon-yellow bg-yellow-500/20 border-neon-yellow/40',
    knowledge: 'text-neon-blue bg-blue-500/20 border-neon-blue/40',
    relationships: 'text-neon-purple bg-purple-500/20 border-neon-purple/40'
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {/* Level & XP Card with Neon Theme */}
      <Card className="bg-gradient-to-br from-neon-yellow/10 via-neon-pink/10 to-neon-purple/10 border-neon-yellow/40 backdrop-blur-sm col-span-1 md:col-span-2 shadow-lg shadow-neon-yellow/10">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-gradient-to-r from-neon-yellow/20 to-neon-pink/20 rounded-full border border-neon-yellow/30">
                <Trophy className="h-6 w-6 text-neon-yellow" />
              </div>
              <div>
                <div className="text-2xl font-bold text-white drop-shadow-lg">Level {userLevel}</div>
                <div className="text-neon-yellow text-sm font-medium">{userXp} XP Total</div>
              </div>
            </div>
            <Badge className="bg-gradient-to-r from-neon-yellow/20 to-neon-pink/20 text-neon-yellow border-neon-yellow/40 px-3 py-1 shadow-lg">
              <Zap className="h-3 w-3 mr-1" />
              Active
            </Badge>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-white/80">Progress to Level {userLevel + 1}</span>
              <span className="text-neon-yellow font-medium">{currentLevelProgress}/100 XP</span>
            </div>
            <Progress 
              value={currentLevelProgress} 
              className="h-2 bg-slate-700/50" 
            />
          </div>
        </CardContent>
      </Card>

      {/* Total Scenarios with Neon Theme */}
      <Card className="bg-gradient-to-br from-neon-blue/10 to-neon-purple/10 border-neon-blue/40 backdrop-blur-sm shadow-lg shadow-neon-blue/10">
        <CardContent className="p-6 text-center">
          <div className="flex items-center justify-center mb-3">
            <div className="p-3 bg-gradient-to-r from-neon-blue/20 to-neon-purple/20 rounded-full border border-neon-blue/30">
              <BookOpen className="h-6 w-6 text-neon-blue" />
            </div>
          </div>
          <div className="text-2xl font-bold text-white mb-1 drop-shadow-lg">{scenarioHistory.length}</div>
          <div className="text-neon-blue text-sm font-medium">Scenarios Completed</div>
        </CardContent>
      </Card>

      {/* Average Score with Neon Theme */}
      <Card className="bg-gradient-to-br from-neon-green/10 to-neon-blue/10 border-neon-green/40 backdrop-blur-sm shadow-lg shadow-neon-green/10">
        <CardContent className="p-6 text-center">
          <div className="flex items-center justify-center mb-3">
            <div className="p-3 bg-gradient-to-r from-neon-green/20 to-neon-blue/20 rounded-full border border-neon-green/30">
              <Target className="h-6 w-6 text-neon-green" />
            </div>
          </div>
          <div className="text-2xl font-bold text-white mb-1 drop-shadow-lg">{getAverageScore()}</div>
          <div className="text-neon-green text-sm font-medium">Average Score</div>
        </CardContent>
      </Card>

      {/* Decision Metrics with Enhanced Neon Theme */}
      <Card className="bg-gradient-to-br from-slate-800/80 to-slate-700/80 border-neon-purple/40 backdrop-blur-sm col-span-1 md:col-span-2 lg:col-span-4 shadow-lg shadow-neon-purple/10">
        <CardContent className="p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-gradient-to-r from-neon-purple/20 to-neon-pink/20 rounded-lg border border-neon-purple/30">
              <TrendingUp className="h-5 w-5 text-neon-purple" />
            </div>
            <h3 className="text-xl font-bold text-white drop-shadow-lg">Decision Metrics</h3>
            <Badge className="bg-gradient-to-r from-neon-purple/20 to-neon-pink/20 text-neon-purple border-neon-purple/40 shadow-lg">
              Average Performance
            </Badge>
          </div>
          
          {scenarioHistory.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {Object.entries(averageMetrics).map(([metric, value]) => {
                const Icon = metricIcons[metric as keyof typeof metricIcons];
                const colorClass = metricColors[metric as keyof typeof metricColors];
                const percentage = Math.min((value / 120) * 100, 100);
                
                return (
                  <div key={metric} className={`bg-gradient-to-br from-slate-700/60 to-slate-600/60 rounded-xl p-4 border ${colorClass.split(' ')[2]} hover:shadow-lg transition-all duration-300`}>
                    <div className="flex items-center gap-2 mb-3">
                      <div className={`p-2 rounded-full ${colorClass.split(' ')[1]} border ${colorClass.split(' ')[2]}`}>
                        <Icon className={`h-4 w-4 ${colorClass.split(' ')[0]}`} />
                      </div>
                      <span className="text-white font-medium capitalize text-sm">
                        {metric}
                      </span>
                    </div>
                    <div className="text-2xl font-bold text-white mb-2 drop-shadow-lg">{value}</div>
                    <Progress value={percentage} className="h-2 bg-slate-600/50" />
                    <div className="text-xs text-white/60 mt-1">
                      {percentage.toFixed(0)}% optimal
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="p-4 bg-gradient-to-r from-slate-700/40 to-slate-600/40 rounded-full w-fit mx-auto mb-4 border border-slate-600/30">
                <Award className="h-8 w-8 text-slate-400" />
              </div>
              <div className="text-slate-300 text-lg font-medium mb-2">No metrics yet</div>
              <div className="text-slate-400">Complete scenarios to see your decision patterns</div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ProfileStats;
