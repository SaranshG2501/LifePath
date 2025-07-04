
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

interface LocalScenarioHistory {
  scenarioId: string;
  scenarioTitle: string;
  startedAt: Date;
  completedAt: Date;
  choices: any[];
  finalMetrics: Record<string, number>;
}

interface ProfileStatsProps {
  scenarioHistory: LocalScenarioHistory[];
  userLevel: number;
  userXp: number;
}

const ProfileStats: React.FC<ProfileStatsProps> = ({ scenarioHistory, userLevel, userXp }) => {
  console.log("ProfileStats rendering with scenarioHistory:", scenarioHistory);
  console.log("ProfileStats scenarioHistory length:", scenarioHistory?.length || 0);

  const getTotalScore = () => {
    if (!scenarioHistory || scenarioHistory.length === 0) {
      console.log("No scenario history for total score calculation");
      return 0;
    }
    
    const total = scenarioHistory.reduce((total, history) => {
      if (history.finalMetrics && typeof history.finalMetrics === 'object') {
        const metricsSum = Object.values(history.finalMetrics).reduce((a, b) => {
          const numA = typeof a === 'number' ? a : 0;
          const numB = typeof b === 'number' ? b : 0;
          return numA + numB;
        }, 0);
        return total + (typeof metricsSum === 'number' ? metricsSum : 0);
      }
      return total;
    }, 0);
    
    console.log("Calculated total score:", total);
    return total;
  };

  const getAverageScore = () => {
    if (!scenarioHistory || scenarioHistory.length === 0) {
      console.log("No scenario history for average score calculation");
      return 0;
    }
    const totalScore = getTotalScore();
    const average = Math.round(totalScore / scenarioHistory.length);
    console.log("Calculated average score:", average);
    return average;
  };

  const getMetricAverages = () => {
    if (!scenarioHistory || scenarioHistory.length === 0) {
      console.log("No scenario history for metric averages");
      return { health: 0, money: 0, happiness: 0, knowledge: 0, relationships: 0 };
    }

    const totals = { health: 0, money: 0, happiness: 0, knowledge: 0, relationships: 0 };
    let validScenarios = 0;

    scenarioHistory.forEach(history => {
      if (history.finalMetrics && typeof history.finalMetrics === 'object') {
        validScenarios++;
        Object.entries(history.finalMetrics).forEach(([key, value]) => {
          if (key in totals && typeof value === 'number') {
            totals[key as keyof typeof totals] += value;
          }
        });
      }
    });

    if (validScenarios === 0) {
      console.log("No valid scenarios found for averages");
      return { health: 0, money: 0, happiness: 0, knowledge: 0, relationships: 0 };
    }

    const averages = Object.fromEntries(
      Object.entries(totals).map(([key, value]) => [
        key, 
        Math.round(value / validScenarios)
      ])
    ) as typeof totals;

    console.log("Calculated metric averages:", averages);
    return averages;
  };

  const averageMetrics = getMetricAverages();
  const totalScore = getTotalScore();
  const averageScore = getAverageScore();
  const completedScenarios = scenarioHistory?.length || 0;

  const metricIcons = {
    health: Heart,
    money: DollarSign,
    happiness: Star,
    knowledge: Brain,
    relationships: Users
  };

  const metricColors = {
    health: 'text-red-500',
    money: 'text-green-500',
    happiness: 'text-yellow-500',
    knowledge: 'text-blue-500',
    relationships: 'text-purple-500'
  };

  console.log("ProfileStats final render data:", {
    completedScenarios,
    averageScore,
    totalScore,
    averageMetrics
  });

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      {/* Total Scenarios */}
      <Card className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/20">
        <CardContent className="p-6 text-center">
          <div className="flex items-center justify-center mb-4">
            <div className="p-3 bg-blue-500/20 rounded-full">
              <BookOpen className="h-8 w-8 text-blue-400" />
            </div>
          </div>
          <div className="text-3xl font-bold text-white mb-2">{completedScenarios}</div>
          <div className="text-blue-400 font-medium">Scenarios Completed</div>
        </CardContent>
      </Card>

      {/* Average Score */}
      <Card className="bg-gradient-to-r from-green-500/10 to-blue-500/10 border border-green-500/20">
        <CardContent className="p-6 text-center">
          <div className="flex items-center justify-center mb-4">
            <div className="p-3 bg-green-500/20 rounded-full">
              <Target className="h-8 w-8 text-green-400" />
            </div>
          </div>
          <div className="text-3xl font-bold text-white mb-2">{averageScore}</div>
          <div className="text-green-400 font-medium">Average Score</div>
        </CardContent>
      </Card>

      {/* Total Score */}
      <Card className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/20">
        <CardContent className="p-6 text-center">
          <div className="flex items-center justify-center mb-4">
            <div className="p-3 bg-purple-500/20 rounded-full">
              <Trophy className="h-8 w-8 text-purple-400" />
            </div>
          </div>
          <div className="text-3xl font-bold text-white mb-2">{totalScore}</div>
          <div className="text-purple-400 font-medium">Total Score</div>
        </CardContent>
      </Card>

      {/* Decision Metrics */}
      <Card className="bg-gradient-to-r from-slate-800/50 to-slate-700/50 border border-slate-600/30 col-span-1 md:col-span-3">
        <CardContent className="p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-xl">
              <TrendingUp className="h-6 w-6 text-blue-400" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white">Decision Metrics</h3>
              <p className="text-slate-400">Your average performance across all scenarios</p>
            </div>
          </div>
          
          {completedScenarios > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {Object.entries(averageMetrics).map(([metric, value]) => {
                const Icon = metricIcons[metric as keyof typeof metricIcons];
                const colorClass = metricColors[metric as keyof typeof metricColors];
                
                return (
                  <div key={metric} className="bg-slate-700/30 rounded-lg p-4 text-center">
                    <div className="flex items-center justify-center mb-2">
                      <Icon className={`h-6 w-6 ${colorClass}`} />
                    </div>
                    <div className="text-2xl font-bold text-white mb-1">{value}</div>
                    <div className="text-sm text-slate-400 capitalize">{metric}</div>
                    <Progress value={Math.min(100, Math.max(0, value))} className="h-2 mt-2" />
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8">
              <Award className="h-16 w-16 text-slate-500 mx-auto mb-4" />
              <div className="text-slate-400 text-lg mb-2">No metrics yet!</div>
              <div className="text-slate-500">Complete scenarios to see your decision-making stats</div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ProfileStats;
