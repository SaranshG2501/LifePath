
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
  BookOpen,
  Flame,
  Sparkles
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
    health: 'text-red-400 bg-red-500/20 border-red-400/40',
    money: 'text-green-400 bg-green-500/20 border-green-400/40',
    happiness: 'text-yellow-400 bg-yellow-500/20 border-yellow-400/40',
    knowledge: 'text-blue-400 bg-blue-500/20 border-blue-400/40',
    relationships: 'text-purple-400 bg-purple-500/20 border-purple-400/40'
  };

  const metricEmojis = {
    health: '❤️',
    money: '💰',
    happiness: '😊',
    knowledge: '🧠',
    relationships: '👥'
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {/* Level & XP Card */}
      <Card className="bg-gradient-to-br from-slate-800/90 to-slate-700/90 border-2 border-neon-yellow/40 backdrop-blur-xl col-span-1 md:col-span-2 shadow-2xl shadow-neon-yellow/20 rounded-3xl overflow-hidden relative">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-neon-yellow via-neon-pink to-neon-purple"></div>
        <div className="absolute inset-0 bg-gradient-to-br from-neon-yellow/5 via-neon-pink/5 to-neon-purple/5"></div>
        
        <CardContent className="p-8 relative z-10">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-neon-yellow to-neon-pink rounded-2xl blur-lg opacity-75 animate-pulse"></div>
                <div className="relative p-4 bg-gradient-to-r from-neon-yellow/30 to-neon-pink/30 rounded-2xl border-2 border-neon-yellow/40">
                  <Trophy className="h-8 w-8 text-neon-yellow animate-bounce" />
                </div>
              </div>
              <div>
                <div className="text-4xl font-black text-white drop-shadow-lg flex items-center gap-2">
                  Level {userLevel}
                  <Flame className="h-6 w-6 text-neon-yellow animate-pulse" />
                </div>
                <div className="text-neon-yellow text-lg font-bold">{userXp} XP Total 🚀</div>
              </div>
            </div>
            <Badge className="bg-gradient-to-r from-neon-yellow/30 to-neon-pink/30 text-neon-yellow border-2 border-neon-yellow/40 px-4 py-2 shadow-lg font-black text-base rounded-xl">
              <Zap className="h-4 w-4 mr-2 animate-pulse" />
              ON FIRE! 🔥
            </Badge>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between text-base font-bold">
              <span className="text-white/90">Progress to Level {userLevel + 1} 🎯</span>
              <span className="text-neon-yellow font-black">{currentLevelProgress}/100 XP</span>
            </div>
            <div className="relative">
              <Progress 
                value={currentLevelProgress} 
                className="h-4 bg-slate-700/50 rounded-full border-2 border-neon-yellow/20" 
              />
              <div className="absolute inset-0 bg-gradient-to-r from-neon-yellow via-neon-pink to-neon-purple rounded-full opacity-20 animate-pulse"></div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Total Scenarios */}
      <Card className="bg-gradient-to-br from-slate-800/90 to-slate-700/90 border-2 border-neon-blue/40 backdrop-blur-xl shadow-2xl shadow-neon-blue/20 rounded-3xl overflow-hidden relative hover:scale-105 transition-transform duration-300">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-neon-blue to-neon-purple"></div>
        
        <CardContent className="p-8 text-center relative">
          <div className="flex items-center justify-center mb-4">
            <div className="relative">
              <div className="absolute inset-0 bg-neon-blue/30 rounded-2xl blur-lg animate-pulse"></div>
              <div className="relative p-4 bg-gradient-to-r from-neon-blue/30 to-neon-purple/30 rounded-2xl border-2 border-neon-blue/40">
                <BookOpen className="h-8 w-8 text-neon-blue" />
              </div>
            </div>
          </div>
          <div className="text-4xl font-black text-white mb-2 drop-shadow-lg flex items-center justify-center gap-2">
            {scenarioHistory.length}
            <Sparkles className="h-6 w-6 text-neon-blue animate-pulse" />
          </div>
          <div className="text-neon-blue text-base font-bold">Scenarios Crushed! 💪</div>
        </CardContent>
      </Card>

      {/* Average Score */}
      <Card className="bg-gradient-to-br from-slate-800/90 to-slate-700/90 border-2 border-neon-green/40 backdrop-blur-xl shadow-2xl shadow-neon-green/20 rounded-3xl overflow-hidden relative hover:scale-105 transition-transform duration-300">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-neon-green to-neon-blue"></div>
        
        <CardContent className="p-8 text-center relative">
          <div className="flex items-center justify-center mb-4">
            <div className="relative">
              <div className="absolute inset-0 bg-neon-green/30 rounded-2xl blur-lg animate-pulse"></div>
              <div className="relative p-4 bg-gradient-to-r from-neon-green/30 to-neon-blue/30 rounded-2xl border-2 border-neon-green/40">
                <Target className="h-8 w-8 text-neon-green" />
              </div>
            </div>
          </div>
          <div className="text-4xl font-black text-white mb-2 drop-shadow-lg flex items-center justify-center gap-2">
            {getAverageScore()}
            <Star className="h-6 w-6 text-neon-green animate-pulse" />
          </div>
          <div className="text-neon-green text-base font-bold">Average Score 🎯</div>
        </CardContent>
      </Card>

      {/* Decision Metrics */}
      <Card className="bg-gradient-to-br from-slate-800/90 to-slate-700/90 border-2 border-neon-purple/40 backdrop-blur-xl col-span-1 md:col-span-2 lg:col-span-4 shadow-2xl shadow-neon-purple/20 rounded-3xl overflow-hidden relative">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-neon-purple via-neon-pink to-neon-yellow"></div>
        <div className="absolute inset-0 bg-gradient-to-br from-neon-purple/5 via-neon-pink/5 to-neon-yellow/5"></div>
        
        <CardContent className="p-8 relative z-10">
          <div className="flex items-center gap-4 mb-8">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-neon-purple to-neon-pink rounded-2xl blur-lg opacity-75 animate-pulse"></div>
              <div className="relative p-3 bg-gradient-to-r from-neon-purple/30 to-neon-pink/30 rounded-2xl border-2 border-neon-purple/40">
                <TrendingUp className="h-7 w-7 text-neon-purple" />
              </div>
            </div>
            <div>
              <h3 className="text-3xl font-black text-white drop-shadow-lg">Decision Power 💯</h3>
              <p className="text-slate-300 text-lg font-medium">Your legendary stats & achievements</p>
            </div>
            <Badge className="bg-gradient-to-r from-neon-purple/30 to-neon-pink/30 text-neon-purple border-2 border-neon-purple/40 shadow-lg px-4 py-2 font-black text-base rounded-xl ml-auto">
              <Sparkles className="h-4 w-4 mr-2 animate-pulse" />
              EPIC PERFORMANCE ⚡
            </Badge>
          </div>
          
          {scenarioHistory.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
              {Object.entries(averageMetrics).map(([metric, value]) => {
                const Icon = metricIcons[metric as keyof typeof metricIcons];
                const colorClass = metricColors[metric as keyof typeof metricColors];
                const emoji = metricEmojis[metric as keyof typeof metricEmojis];
                const percentage = Math.min((value / 120) * 100, 100);
                
                return (
                  <div key={metric} className={`bg-gradient-to-br from-slate-700/80 to-slate-600/80 rounded-2xl p-6 border-2 ${colorClass.split(' ')[2]} hover:shadow-lg transition-all duration-300 hover:scale-105 relative overflow-hidden`}>
                    <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent"></div>
                    
                    <div className="flex items-center gap-3 mb-4 relative z-10">
                      <div className={`p-3 rounded-2xl ${colorClass.split(' ')[1]} border-2 ${colorClass.split(' ')[2]}`}>
                        <Icon className={`h-6 w-6 ${colorClass.split(' ')[0]}`} />
                      </div>
                      <div>
                        <span className="text-white font-bold capitalize text-lg flex items-center gap-1">
                          {metric} {emoji}
                        </span>
                      </div>
                    </div>
                    
                    <div className="text-4xl font-black text-white mb-3 drop-shadow-lg relative z-10">{value}</div>
                    
                    <div className="relative z-10 mb-2">
                      <Progress value={percentage} className="h-3 bg-slate-600/50 rounded-full" />
                    </div>
                    
                    <div className="text-sm text-white/80 font-bold relative z-10">
                      {percentage.toFixed(0)}% optimal 🎯
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="relative inline-block">
                <div className="absolute inset-0 bg-gradient-to-r from-slate-700/60 to-slate-600/60 rounded-full blur-lg"></div>
                <div className="relative p-8 bg-gradient-to-r from-slate-700/80 to-slate-600/80 rounded-full border-2 border-slate-600/40">
                  <Award className="h-16 w-16 text-slate-400" />
                </div>
              </div>
              <div className="text-slate-300 text-2xl font-bold mb-3 mt-6">No epic stats yet! 🎮</div>
              <div className="text-slate-400 text-lg">Complete scenarios to unlock your legendary metrics! 🚀</div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ProfileStats;
