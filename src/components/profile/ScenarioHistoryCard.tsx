
import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Calendar, 
  ChevronDown, 
  ChevronUp, 
  Star, 
  Brain, 
  Heart, 
  DollarSign, 
  Users, 
  Zap,
  Target,
  Award,
  Sparkles
} from 'lucide-react';

interface ScenarioChoice {
  sceneId: string;
  choiceId: string;
  choiceText: string;
  timestamp: any;
  metricChanges?: Record<string, number>;
}

interface ScenarioHistory {
  scenarioId: string;
  title?: string;
  completedAt: any;
  finalMetrics?: Record<string, number>;
  choices?: ScenarioChoice[];
}

interface ScenarioHistoryCardProps {
  scenario: ScenarioHistory;
  index: number;
}

const ScenarioHistoryCard: React.FC<ScenarioHistoryCardProps> = ({ scenario, index }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const getScenarioTitle = (id: string) => {
    const titles: Record<string, string> = {
      'first-job': '🎯 Your First Job Adventure',
      'college-debt': '🎓 College Debt Dilemma',
      'friendship-drama': '👥 Friendship Drama',
      'family-conflict': '🏠 Family Conflict',
      'social-media': '📱 Social Media Crisis'
    };
    return titles[id] || `🌟 Scenario ${id}`;
  };

  const formatDate = (timestamp: any) => {
    if (!timestamp) return 'Recently';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
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

  const totalScore = scenario.finalMetrics 
    ? Object.values(scenario.finalMetrics).reduce((a: number, b: number) => (a || 0) + (b || 0), 0)
    : 0;

  return (
    <Card className="teen-card p-6 hover-lift border-2 border-neon-blue/20 hover:border-neon-blue/40 bg-gradient-to-br from-slate-800/90 to-slate-700/90 backdrop-blur-xl relative overflow-hidden">
      
      {/* Background pattern */}
      <div className="absolute inset-0 bg-gradient-to-br from-neon-blue/5 to-neon-purple/5 opacity-50"></div>
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-neon-purple/10 to-transparent rounded-full blur-2xl"></div>
      
      <div className="relative z-10">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-gradient-to-r from-neon-blue/20 to-neon-purple/20 rounded-xl border-2 border-neon-blue/30">
                <Target className="h-5 w-5 text-neon-blue" />
              </div>
              <h3 className="text-xl font-black text-white">
                {getScenarioTitle(scenario.scenarioId)}
              </h3>
            </div>
            
            <div className="flex items-center gap-4 text-sm text-white/70 mb-3">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-neon-purple" />
                <span className="font-medium">{formatDate(scenario.completedAt)}</span>
              </div>
              <Badge variant="outline" className="bg-gradient-to-r from-neon-green/20 to-neon-blue/20 text-neon-green border-neon-green/30 font-bold">
                <Award className="h-3 w-3 mr-1" />
                Score: {totalScore}
              </Badge>
            </div>
          </div>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
            className="rounded-xl hover:bg-neon-purple/20 text-neon-purple border-2 border-transparent hover:border-neon-purple/30 transition-all duration-300"
          >
            {isExpanded ? (
              <>
                <ChevronUp className="h-4 w-4 mr-1" />
                <span className="font-bold">Less</span>
              </>
            ) : (
              <>
                <ChevronDown className="h-4 w-4 mr-1" />
                <span className="font-bold">More</span>
              </>
            )}
          </Button>
        </div>

        {/* Quick metrics preview */}
        {scenario.finalMetrics && (
          <div className="grid grid-cols-5 gap-2 mb-4">
            {Object.entries(scenario.finalMetrics).map(([metric, value]) => {
              const Icon = getMetricIcon(metric);
              const colorClass = getMetricColor(metric);
              
              return (
                <div key={metric} className="text-center">
                  <div className={`inline-flex items-center justify-center p-2 rounded-xl bg-gradient-to-r from-slate-700/60 to-slate-600/60 border border-white/10 mb-1`}>
                    <Icon className={`h-4 w-4 ${colorClass}`} />
                  </div>
                  <div className={`text-lg font-bold ${colorClass}`}>{String(value || 0)}</div>
                  <div className="text-xs text-white/60 capitalize font-medium">{metric}</div>
                </div>
              );
            })}
          </div>
        )}

        {/* Expanded content */}
        {isExpanded && (
          <div className="mt-6 space-y-4">
            <div className="border-t border-white/10 pt-4">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-gradient-to-r from-neon-yellow/20 to-neon-orange/20 rounded-xl border-2 border-neon-yellow/30">
                  <Zap className="h-5 w-5 text-neon-yellow" />
                </div>
                <h4 className="text-lg font-black text-white">Your Epic Choices 🚀</h4>
              </div>
              
              {scenario.choices && scenario.choices.length > 0 ? (
                <div className="space-y-3">
                  {scenario.choices.map((choice, choiceIndex) => (
                    <div key={choiceIndex} className="bg-gradient-to-r from-slate-700/60 to-slate-600/60 rounded-2xl p-4 border border-white/10 hover:border-neon-blue/30 transition-all duration-300">
                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-r from-neon-blue/30 to-neon-purple/30 rounded-full flex items-center justify-center border-2 border-neon-blue/40">
                          <span className="text-sm font-black text-neon-blue">{choiceIndex + 1}</span>
                        </div>
                        <div className="flex-1">
                          <div className="text-white font-bold mb-1">Scene {choiceIndex + 1}</div>
                          <div className="text-white/90 text-sm leading-relaxed">{choice.choiceText}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-white/60">
                  <Sparkles className="h-12 w-12 mx-auto mb-3 text-neon-purple" />
                  <p className="font-medium">No detailed choices recorded for this scenario 📝</p>
                  <p className="text-sm mt-1">Future scenarios will show all your epic decisions! 🎮</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </Card>
  );
};

export default ScenarioHistoryCard;
