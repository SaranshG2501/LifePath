
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Clock, Trophy, TrendingUp, Users, BookOpen, Star, Sparkles, Crown, Zap, Award, Target, Gamepad2, Flame, Rocket, Bolt, Gem, Shield } from 'lucide-react';
import { ScenarioHistory } from '@/lib/firebase';

interface ScenarioHistoryDetailProps {
  history: ScenarioHistory | null;
  open: boolean;
  onClose: () => void;
}

// Enhanced timestamp conversion function
const safeConvertTimestamp = (timestamp: any): Date => {
  if (!timestamp) return new Date();
  
  // Handle Firebase Timestamp
  if (timestamp && typeof timestamp === 'object' && timestamp.toDate) {
    try {
      return timestamp.toDate();
    } catch (error) {
      console.warn('Failed to convert Firebase timestamp:', error);
      return new Date();
    }
  }
  
  // Handle Date object
  if (timestamp instanceof Date) {
    return timestamp;
  }
  
  // Handle string or number
  try {
    return new Date(timestamp);
  } catch (error) {
    console.warn('Failed to convert timestamp:', error);
    return new Date();
  }
};

const ScenarioHistoryDetail: React.FC<ScenarioHistoryDetailProps> = ({
  history,
  open,
  onClose,
}) => {
  if (!history) return null;

  const completedDate = safeConvertTimestamp(history.completedAt);
  const totalChoices = history.choices?.length || 0;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[85vh] overflow-y-auto bg-gradient-to-br from-slate-900/98 via-purple-900/20 to-slate-800/98 border-2 border-neon-purple/50 backdrop-blur-xl shadow-2xl shadow-neon-purple/40 rounded-2xl animate-scale-in">
        
        {/* Epic animated background */}
        <div className="absolute inset-0 bg-gradient-to-br from-neon-blue/8 via-neon-purple/8 to-neon-pink/8 opacity-60 rounded-2xl animate-pulse-slow"></div>
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-neon-purple/25 to-transparent rounded-full blur-2xl animate-float"></div>
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-neon-blue/25 to-transparent rounded-full blur-xl animate-pulse-glow"></div>

        <DialogHeader className="pb-4 relative z-10">
          <DialogTitle className="text-2xl font-black gradient-heading flex items-center gap-3 mb-2">
            <div className="p-3 bg-gradient-to-r from-neon-yellow/40 to-neon-orange/40 rounded-2xl border-2 border-neon-yellow/60 animate-glow shadow-xl shadow-neon-yellow/40">
              <Crown className="h-6 w-6 text-neon-yellow drop-shadow-lg animate-pulse" />
            </div>
            <div className="flex flex-col">
              <span className="bg-gradient-to-r from-neon-yellow via-neon-pink to-neon-blue bg-clip-text text-transparent drop-shadow-lg">
                🏆 LEGENDARY QUEST COMPLETE! 🎮
              </span>
            </div>
          </DialogTitle>
          <div className="text-lg text-neon-blue font-bold flex items-center gap-2">
            <Rocket className="h-5 w-5 text-neon-cyan animate-bounce-light" />
            {history.scenarioTitle || 'Epic Life Adventure'}
            <Sparkles className="h-4 w-4 text-neon-pink animate-pulse" />
          </div>
        </DialogHeader>

        <div className="space-y-5 relative z-10">
          {/* Compact Summary Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <Card className="teen-card bg-gradient-to-br from-neon-blue/20 to-neon-cyan/20 border-2 border-neon-blue/50 hover:border-neon-blue/70 transition-all duration-300 hover:scale-105 shadow-lg shadow-neon-blue/30 animate-scale-in">
              <CardContent className="p-4 flex items-center gap-3">
                <div className="p-2 bg-gradient-to-r from-neon-blue/40 to-neon-cyan/40 rounded-xl border-2 border-neon-blue/60 shadow-lg shadow-neon-blue/40">
                  <Clock className="h-5 w-5 text-neon-blue drop-shadow-lg" />
                </div>
                <div>
                  <p className="text-xs text-neon-blue font-bold mb-1 uppercase tracking-wider">⚡ COMPLETED</p>
                  <p className="text-white font-bold text-base mb-1">
                    {completedDate.toLocaleDateString()}
                  </p>
                  <p className="text-xs text-white/70 font-medium flex items-center gap-1">
                    <Star className="h-3 w-3 text-neon-yellow" />
                    LEGENDARY! 🔥
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="teen-card bg-gradient-to-br from-neon-green/20 to-neon-lime/20 border-2 border-neon-green/50 hover:border-neon-green/70 transition-all duration-300 hover:scale-105 shadow-lg shadow-neon-green/30 animate-scale-in" style={{ animationDelay: '0.1s' }}>
              <CardContent className="p-4 flex items-center gap-3">
                <div className="p-2 bg-gradient-to-r from-neon-green/40 to-neon-lime/40 rounded-xl border-2 border-neon-green/60 shadow-lg shadow-neon-green/40">
                  <Gamepad2 className="h-5 w-5 text-neon-green drop-shadow-lg" />
                </div>
                <div>
                  <p className="text-xs text-neon-green font-bold mb-1 uppercase tracking-wider">🎯 MOVES</p>
                  <p className="text-white font-bold text-base mb-1">{totalChoices}</p>
                  <p className="text-xs text-white/70 font-medium flex items-center gap-1">
                    <Shield className="h-3 w-3 text-neon-green" />
                    MASTER! ⚡
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="teen-card bg-gradient-to-br from-neon-purple/20 to-neon-pink/20 border-2 border-neon-purple/50 hover:border-neon-purple/70 transition-all duration-300 hover:scale-105 shadow-lg shadow-neon-purple/30 animate-scale-in" style={{ animationDelay: '0.2s' }}>
              <CardContent className="p-4 flex items-center gap-3">
                <div className="p-2 bg-gradient-to-r from-neon-purple/40 to-neon-pink/40 rounded-xl border-2 border-neon-purple/60 shadow-lg shadow-neon-purple/40">
                  <Trophy className="h-5 w-5 text-neon-purple drop-shadow-lg" />
                </div>
                <div>
                  <p className="text-xs text-neon-purple font-bold mb-1 uppercase tracking-wider">⭐ SCORE</p>
                  <p className="text-white font-bold text-base mb-1">
                    {history.finalMetrics ? Object.values(history.finalMetrics).reduce((a, b) => a + b, 0) : 'EPIC'}
                  </p>
                  <p className="text-xs text-white/70 font-medium flex items-center gap-1">
                    <Gem className="h-3 w-3 text-neon-pink" />
                    AMAZING! 💎
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Compact Final Metrics */}
          {history.finalMetrics && (
            <Card className="teen-card bg-gradient-to-br from-slate-800/90 to-slate-700/90 border-2 border-neon-yellow/50 hover:border-neon-yellow/70 transition-all duration-300 shadow-lg shadow-neon-yellow/30 rounded-2xl animate-scale-in" style={{ animationDelay: '0.3s' }}>
              <CardHeader className="pb-3">
                <CardTitle className="text-white flex items-center gap-3 text-lg font-black">
                  <div className="p-2 bg-gradient-to-r from-neon-yellow/40 to-neon-orange/40 rounded-xl border-2 border-neon-yellow/60 shadow-lg shadow-neon-yellow/40">
                    <Star className="h-5 w-5 text-neon-yellow drop-shadow-lg animate-pulse" />
                  </div>
                  <span className="bg-gradient-to-r from-neon-yellow via-neon-pink to-neon-blue bg-clip-text text-transparent">
                    🌟 YOUR LIFE POWER STATS
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                  {Object.entries(history.finalMetrics).map(([key, value]) => {
                    let color = '';
                    let icon = '';
                    let bgGradient = '';
                    let shadowColor = '';
                    switch(key) {
                      case 'health':
                        color = 'text-red-400';
                        bgGradient = 'from-red-500/30 to-red-400/30 border-red-400/60';
                        shadowColor = 'shadow-red-500/40';
                        icon = '❤️';
                        break;
                      case 'money':
                        color = 'text-green-400';
                        bgGradient = 'from-green-500/30 to-green-400/30 border-green-400/60';
                        shadowColor = 'shadow-green-500/40';
                        icon = '💰';
                        break;
                      case 'happiness':
                        color = 'text-yellow-400';
                        bgGradient = 'from-yellow-500/30 to-yellow-400/30 border-yellow-400/60';
                        shadowColor = 'shadow-yellow-500/40';
                        icon = '😊';
                        break;
                      case 'knowledge':
                        color = 'text-blue-400';
                        bgGradient = 'from-blue-500/30 to-blue-400/30 border-blue-400/60';
                        shadowColor = 'shadow-blue-500/40';
                        icon = '📚';
                        break;
                      case 'relationships':
                        color = 'text-purple-400';
                        bgGradient = 'from-purple-500/30 to-purple-400/30 border-purple-400/60';
                        shadowColor = 'shadow-purple-500/40';
                        icon = '👥';
                        break;
                      default:
                        color = 'text-gray-400';
                        bgGradient = 'from-gray-500/30 to-gray-400/30 border-gray-400/60';
                        shadowColor = 'shadow-gray-500/40';
                        icon = '⭐';
                    }
                    
                    return (
                      <div key={key} className={`p-3 rounded-2xl bg-gradient-to-br ${bgGradient} border-2 hover:scale-105 transition-all duration-300 text-center animate-scale-in shadow-lg ${shadowColor}`}>
                        <div className="flex items-center justify-center gap-2 mb-2">
                          <span className="text-xl drop-shadow-lg">{icon}</span>
                          <span className={`text-xs font-bold capitalize ${color} uppercase tracking-wider`}>{key}</span>
                        </div>
                        <div className={`text-xl font-black ${color} mb-1 drop-shadow-lg`}>{value || 0}</div>
                        <div className="text-xs text-white/70 font-bold">
                          {value >= 80 ? (
                            <span className="text-neon-yellow flex items-center justify-center gap-1">
                              <Crown className="h-3 w-3" />
                              GODLIKE! 🔥
                            </span>
                          ) : value >= 60 ? (
                            <span className="text-neon-blue flex items-center justify-center gap-1">
                              <Star className="h-3 w-3" />
                              AMAZING! ✨
                            </span>
                          ) : value >= 40 ? (
                            <span className="text-neon-green flex items-center justify-center gap-1">
                              <Trophy className="h-3 w-3" />
                              GREAT! 👍
                            </span>
                          ) : (
                            <span className="text-neon-orange flex items-center justify-center gap-1">
                              <Zap className="h-3 w-3" />
                              POWER UP! 💪
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Compact Choice History */}
          {history.choices && history.choices.length > 0 ? (
            <Card className="teen-card bg-gradient-to-br from-slate-800/90 to-slate-700/90 border-2 border-neon-blue/50 hover:border-neon-blue/70 transition-all duration-300 shadow-lg shadow-neon-blue/30 rounded-2xl animate-scale-in" style={{ animationDelay: '0.4s' }}>
              <CardHeader className="pb-3">
                <CardTitle className="text-white flex items-center gap-3 text-lg font-black">
                  <div className="p-2 bg-gradient-to-r from-neon-blue/40 to-neon-cyan/40 rounded-xl border-2 border-neon-blue/60 shadow-lg shadow-neon-blue/40">
                    <BookOpen className="h-5 w-5 text-neon-blue drop-shadow-lg animate-pulse" />
                  </div>
                  <span className="bg-gradient-to-r from-neon-blue via-neon-purple to-neon-pink bg-clip-text text-transparent">
                    🎯 YOUR EPIC CHOICES
                  </span>
                  <Badge className="bg-gradient-to-r from-neon-blue/40 to-neon-purple/40 text-neon-blue border-2 border-neon-blue/60 px-3 py-1 shadow-lg font-bold text-sm rounded-xl">
                    <Zap className="h-3 w-3 mr-1 animate-pulse" />
                    {history.choices.length} MOVES
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {history.choices.map((choice, index) => {
                  const choiceText = choice?.choiceText || `Epic Power Move ${index + 1}`;
                  const sceneTitle = choice?.sceneId || `Scene ${index + 1}`;
                  const timestamp = safeConvertTimestamp(choice?.timestamp);
                  const metricChanges = choice?.metricChanges || {};
                  
                  return (
                    <div key={index} className="bg-gradient-to-br from-slate-800/80 to-slate-700/80 rounded-2xl p-4 border-2 border-neon-purple/30 hover:border-neon-purple/50 transition-all duration-300 hover:scale-[1.02] shadow-lg hover:shadow-lg hover:shadow-neon-purple/30 animate-fade-in relative overflow-hidden">
                      
                      {/* Compact background effects */}
                      <div className="absolute top-0 right-0 w-12 h-12 bg-gradient-to-bl from-neon-purple/20 to-transparent rounded-full blur-xl animate-pulse-slow"></div>
                      
                      <div className="relative z-10">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <div className="p-1 bg-gradient-to-r from-neon-purple/40 to-neon-pink/40 rounded-xl border-2 border-neon-purple/60 shadow-lg shadow-neon-purple/40">
                              <Target className="h-3 w-3 text-neon-purple drop-shadow-lg" />
                            </div>
                            <Badge className="bg-gradient-to-r from-neon-purple/40 to-neon-pink/40 text-neon-purple border-2 border-neon-purple/60 px-2 py-1 shadow-lg font-bold text-xs rounded-xl">
                              <Award className="h-2 w-2 mr-1" />
                              MOVE #{index + 1}
                            </Badge>
                          </div>
                          <span className="text-xs text-neon-blue font-bold bg-neon-blue/20 px-2 py-1 rounded-lg border border-neon-blue/40 shadow-sm">
                            ⏰ {timestamp.toLocaleString()}
                          </span>
                        </div>
                        
                        <div className="mb-3">
                          <h4 className="text-white font-bold text-sm mb-2 flex items-center gap-2">
                            <Rocket className="h-3 w-3 text-neon-cyan animate-bounce-light" />
                            🎬 {sceneTitle}
                            <Sparkles className="h-3 w-3 text-neon-pink animate-pulse" />
                          </h4>
                        </div>
                        
                        <div className="bg-gradient-to-r from-neon-blue/20 to-neon-purple/20 p-3 rounded-2xl border-2 border-neon-blue/50 mb-3 hover:border-neon-blue/70 transition-all duration-300 shadow-lg shadow-neon-blue/20">
                          <p className="text-xs text-neon-blue font-bold mb-1 flex items-center gap-1 uppercase tracking-wider">
                            <Bolt className="h-2 w-2 animate-pulse" />
                            YOUR CHOICE:
                          </p>
                          <p className="text-white font-medium text-sm leading-relaxed drop-shadow-lg">
                            {choiceText}
                          </p>
                        </div>
                        
                        {metricChanges && Object.keys(metricChanges).length > 0 && (
                          <div>
                            <p className="text-sm text-neon-yellow font-bold mb-2 flex items-center gap-1">
                              <TrendingUp className="h-3 w-3 animate-bounce-light" />
                              ⚡ IMPACT:
                            </p>
                            <div className="flex flex-wrap gap-2">
                              {Object.entries(metricChanges).map(([key, value]) => {
                                if (!value || value === 0) return null;
                                
                                let color = '';
                                let icon = '';
                                let bgGradient = '';
                                const numValue = typeof value === 'number' ? value : parseInt(String(value)) || 0;
                                
                                switch(key) {
                                  case 'health':
                                    color = numValue > 0 ? 'text-red-400' : 'text-red-500';
                                    bgGradient = numValue > 0 ? 'from-red-500/30 to-red-400/30 border-red-400/60' : 'from-red-500/20 to-red-400/20 border-red-500/50';
                                    icon = '❤️';
                                    break;
                                  case 'money':
                                    color = numValue > 0 ? 'text-green-400' : 'text-green-500';
                                    bgGradient = numValue > 0 ? 'from-green-500/30 to-green-400/30 border-green-400/60' : 'from-green-500/20 to-green-400/20 border-green-500/50';
                                    icon = '💰';
                                    break;
                                  case 'happiness':
                                    color = numValue > 0 ? 'text-yellow-400' : 'text-yellow-500';
                                    bgGradient = numValue > 0 ? 'from-yellow-500/30 to-yellow-400/30 border-yellow-400/60' : 'from-yellow-500/20 to-yellow-400/20 border-yellow-500/50';
                                    icon = '😊';
                                    break;
                                  case 'knowledge':
                                    color = numValue > 0 ? 'text-blue-400' : 'text-blue-500';
                                    bgGradient = numValue > 0 ? 'from-blue-500/30 to-blue-400/30 border-blue-400/60' : 'from-blue-500/20 to-blue-400/20 border-blue-500/50';
                                    icon = '📚';
                                    break;
                                  case 'relationships':
                                    color = numValue > 0 ? 'text-purple-400' : 'text-purple-500';
                                    bgGradient = numValue > 0 ? 'from-purple-500/30 to-purple-400/30 border-purple-400/60' : 'from-purple-500/20 to-purple-400/20 border-purple-500/50';
                                    icon = '👥';
                                    break;
                                  default:
                                    color = numValue > 0 ? 'text-gray-400' : 'text-gray-500';
                                    bgGradient = numValue > 0 ? 'from-gray-500/30 to-gray-400/30 border-gray-400/60' : 'from-gray-500/20 to-gray-400/20 border-gray-500/50';
                                    icon = '⭐';
                                }
                                
                                return (
                                  <div key={key} className={`px-3 py-1 rounded-xl bg-gradient-to-r ${bgGradient} border-2 flex items-center gap-1 hover:scale-105 transition-all duration-300 animate-scale-in shadow-lg`}>
                                    <span className="text-sm drop-shadow-lg">{icon}</span>
                                    <div>
                                      <div className="flex items-center gap-1">
                                        <span className={`capitalize font-bold ${color} text-xs`}>{key}</span>
                                        <span className={`font-black text-sm ${color} drop-shadow-lg`}>{numValue > 0 ? '+' : ''}{numValue}</span>
                                      </div>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          ) : (
            <Card className="teen-card p-4 text-center rounded-2xl border-2 border-neon-blue/40 bg-gradient-to-br from-slate-800/90 to-slate-700/90 shadow-lg shadow-neon-blue/20 animate-scale-in" style={{ animationDelay: '0.4s' }}>
              <div className="flex flex-col items-center gap-3">
                <div className="p-3 bg-gradient-to-r from-neon-blue/30 to-neon-purple/30 rounded-full border-2 border-neon-blue/50 animate-pulse-glow shadow-lg shadow-neon-blue/40">
                  <BookOpen className="h-6 w-6 text-neon-blue drop-shadow-lg" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-white mb-2 flex items-center justify-center gap-2">
                    No Details Available! 
                    <Gamepad2 className="h-4 w-4 text-neon-purple animate-bounce-light" />
                  </h2>
                  <p className="text-white/70 font-medium text-sm mb-1">This might be an older scenario.</p>
                  <p className="text-neon-blue text-sm font-bold flex items-center justify-center gap-1">
                    <Bolt className="h-3 w-3 animate-pulse" />
                    Future adventures will show all choices! 
                    <Rocket className="h-3 w-3 animate-bounce-light" />
                  </p>
                </div>
              </div>
            </Card>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ScenarioHistoryDetail;
