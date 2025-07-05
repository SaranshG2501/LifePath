
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Clock, Trophy, TrendingUp, Users, BookOpen, Star, Sparkles, Crown, Zap, Award, Target, Gamepad2 } from 'lucide-react';
import { ScenarioHistory } from '@/lib/firebase';
import { convertTimestampToDate } from '@/lib/firebase';

interface ScenarioHistoryDetailProps {
  history: ScenarioHistory | null;
  open: boolean;
  onClose: () => void;
}

const ScenarioHistoryDetail: React.FC<ScenarioHistoryDetailProps> = ({
  history,
  open,
  onClose,
}) => {
  if (!history) return null;

  const completedDate = history.completedAt ? convertTimestampToDate(history.completedAt) : new Date();
  const totalChoices = history.choices?.length || 0;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto bg-gradient-to-br from-slate-900/95 via-purple-900/20 to-slate-800/95 border-2 border-neon-purple/30 backdrop-blur-xl shadow-2xl shadow-neon-purple/20">
        
        {/* Animated background pattern */}
        <div className="absolute inset-0 bg-gradient-to-br from-neon-blue/5 via-neon-purple/5 to-neon-pink/5 opacity-50"></div>
        <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-bl from-neon-purple/20 to-transparent rounded-full blur-3xl animate-pulse-slow"></div>
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-gradient-to-tr from-neon-blue/20 to-transparent rounded-full blur-2xl animate-float"></div>

        <DialogHeader className="pb-6 relative z-10">
          <DialogTitle className="text-3xl font-black gradient-heading flex items-center gap-3 mb-2">
            <div className="p-3 bg-gradient-to-r from-neon-yellow/20 to-neon-orange/20 rounded-2xl border-2 border-neon-yellow/40 animate-glow">
              <Crown className="h-8 w-8 text-neon-yellow" />
            </div>
            🎮 EPIC ADVENTURE COMPLETE!
          </DialogTitle>
          <div className="text-xl text-neon-blue font-bold">
            {history.scenarioTitle || 'Amazing Life Scenario'}
          </div>
        </DialogHeader>

        <div className="space-y-8 relative z-10">
          {/* Gamified Summary Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="teen-card hover-lift bg-gradient-to-br from-neon-blue/10 to-neon-cyan/10 border-2 border-neon-blue/30 hover:border-neon-blue/50 transition-all duration-300">
              <CardContent className="p-6 flex items-center gap-4">
                <div className="p-4 bg-gradient-to-r from-neon-blue/20 to-neon-cyan/20 rounded-2xl border-2 border-neon-blue/40 animate-pulse-glow">
                  <Clock className="h-10 w-10 text-neon-blue" />
                </div>
                <div>
                  <p className="text-sm text-neon-blue font-bold mb-1">QUEST COMPLETED</p>
                  <p className="text-white font-black text-lg">
                    {completedDate.toLocaleDateString()}
                  </p>
                  <p className="text-xs text-white/60">Epic achievement unlocked! 🏆</p>
                </div>
              </CardContent>
            </Card>

            <Card className="teen-card hover-lift bg-gradient-to-br from-neon-green/10 to-neon-lime/10 border-2 border-neon-green/30 hover:border-neon-green/50 transition-all duration-300">
              <CardContent className="p-6 flex items-center gap-4">
                <div className="p-4 bg-gradient-to-r from-neon-green/20 to-neon-lime/20 rounded-2xl border-2 border-neon-green/40 animate-bounce-light">
                  <Gamepad2 className="h-10 w-10 text-neon-green" />
                </div>
                <div>
                  <p className="text-sm text-neon-green font-bold mb-1">DECISIONS MADE</p>
                  <p className="text-white font-black text-lg">{totalChoices}</p>
                  <p className="text-xs text-white/60">Master strategist! 🎯</p>
                </div>
              </CardContent>
            </Card>

            <Card className="teen-card hover-lift bg-gradient-to-br from-neon-purple/10 to-neon-pink/10 border-2 border-neon-purple/30 hover:border-neon-purple/50 transition-all duration-300">
              <CardContent className="p-6 flex items-center gap-4">
                <div className="p-4 bg-gradient-to-r from-neon-purple/20 to-neon-pink/20 rounded-2xl border-2 border-neon-purple/40 animate-rotate-glow">
                  <Trophy className="h-10 w-10 text-neon-purple" />
                </div>
                <div>
                  <p className="text-sm text-neon-purple font-bold mb-1">FINAL POWER LEVEL</p>
                  <p className="text-white font-black text-lg">
                    {history.finalMetrics ? Object.values(history.finalMetrics).reduce((a, b) => a + b, 0) : 'LEGENDARY'}
                  </p>
                  <p className="text-xs text-white/60">Incredible score! ⚡</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Gamified Final Metrics */}
          {history.finalMetrics && (
            <Card className="teen-card bg-gradient-to-br from-slate-800/90 to-slate-700/90 border-2 border-neon-yellow/30 hover:border-neon-yellow/50 transition-all duration-300 shadow-xl shadow-neon-yellow/10">
              <CardHeader className="pb-4">
                <CardTitle className="text-white flex items-center gap-3 text-2xl font-black">
                  <div className="p-3 bg-gradient-to-r from-neon-yellow/20 to-neon-orange/20 rounded-xl border-2 border-neon-yellow/40">
                    <Star className="h-6 w-6 text-neon-yellow" />
                  </div>
                  🌟 YOUR EPIC LIFE STATS
                  <Sparkles className="h-6 w-6 text-neon-pink animate-pulse" />
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
                  {Object.entries(history.finalMetrics).map(([key, value]) => {
                    let color = '';
                    let icon = '';
                    let bgGradient = '';
                    switch(key) {
                      case 'health':
                        color = 'text-red-300';
                        bgGradient = 'from-red-500/20 to-red-400/20 border-red-400/40';
                        icon = '❤️';
                        break;
                      case 'money':
                        color = 'text-green-300';
                        bgGradient = 'from-green-500/20 to-green-400/20 border-green-400/40';
                        icon = '💰';
                        break;
                      case 'happiness':
                        color = 'text-yellow-300';
                        bgGradient = 'from-yellow-500/20 to-yellow-400/20 border-yellow-400/40';
                        icon = '😊';
                        break;
                      case 'knowledge':
                        color = 'text-blue-300';
                        bgGradient = 'from-blue-500/20 to-blue-400/20 border-blue-400/40';
                        icon = '📚';
                        break;
                      case 'relationships':
                        color = 'text-purple-300';
                        bgGradient = 'from-purple-500/20 to-purple-400/20 border-purple-400/40';
                        icon = '👥';
                        break;
                      default:
                        color = 'text-gray-300';
                        bgGradient = 'from-gray-500/20 to-gray-400/20 border-gray-400/40';
                        icon = '⭐';
                    }
                    
                    return (
                      <div key={key} className={`p-4 rounded-2xl bg-gradient-to-br ${bgGradient} border-2 hover:scale-105 transition-all duration-300 text-center animate-scale-in`}>
                        <div className="flex items-center justify-center gap-2 mb-2">
                          <span className="text-2xl">{icon}</span>
                          <span className={`text-sm font-black capitalize ${color}`}>{key}</span>
                        </div>
                        <div className={`text-3xl font-black ${color} mb-1`}>{value || 0}</div>
                        <div className="text-xs text-white/60 font-medium">
                          {value >= 80 ? 'GODLIKE! 🔥' : value >= 60 ? 'AMAZING! ✨' : value >= 40 ? 'GREAT! 👍' : 'KEEP GOING! 💪'}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Enhanced Choice History with Gamification */}
          {history.choices && history.choices.length > 0 ? (
            <Card className="teen-card bg-gradient-to-br from-slate-800/90 to-slate-700/90 border-2 border-neon-blue/30 hover:border-neon-blue/50 transition-all duration-300 shadow-xl shadow-neon-blue/10">
              <CardHeader className="pb-4">
                <CardTitle className="text-white flex items-center gap-3 text-2xl font-black">
                  <div className="p-3 bg-gradient-to-r from-neon-blue/20 to-neon-cyan/20 rounded-xl border-2 border-neon-blue/40">
                    <BookOpen className="h-6 w-6 text-neon-blue" />
                  </div>
                  🎯 YOUR LEGENDARY ADVENTURE JOURNEY
                  <Badge className="bg-gradient-to-r from-neon-blue/30 to-neon-purple/30 text-neon-blue border-2 border-neon-blue/40 px-4 py-2 shadow-lg font-black text-base rounded-xl">
                    <Zap className="h-4 w-4 mr-2 animate-pulse" />
                    {history.choices.length} Epic Choices
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-8">
                {history.choices.map((choice, index) => {
                  console.log(`Rendering choice ${index + 1}:`, choice);
                  
                  // Use only properties that exist on ScenarioChoice type
                  const choiceText = choice?.choiceText || `Epic Decision ${index + 1}`;
                  const sceneTitle = choice?.sceneId || `Adventure Scene ${index + 1}`;
                  
                  // Handle timestamp safely
                  let timestamp: Date;
                  try {
                    if (choice?.timestamp) {
                      timestamp = convertTimestampToDate(choice.timestamp);
                    } else {
                      timestamp = new Date();
                    }
                  } catch (error) {
                    console.warn('Invalid timestamp for choice:', choice?.timestamp);
                    timestamp = new Date();
                  }
                  
                  // Handle metric changes safely - only use properties that exist
                  const metricChanges = choice?.metricChanges || {};
                  
                  return (
                    <div key={index} className="bg-gradient-to-br from-slate-800/70 to-slate-700/70 rounded-3xl p-8 border-2 border-neon-purple/20 hover:border-neon-purple/40 transition-all duration-300 hover:scale-[1.02] shadow-lg hover:shadow-xl hover:shadow-neon-purple/20 animate-fade-in relative overflow-hidden">
                      
                      {/* Background glow effect */}
                      <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-neon-purple/10 to-transparent rounded-full blur-xl"></div>
                      
                      <div className="relative z-10">
                        <div className="flex items-start justify-between mb-6">
                          <div className="flex items-center gap-4">
                            <div className="p-3 bg-gradient-to-r from-neon-purple/20 to-neon-pink/20 rounded-2xl border-2 border-neon-purple/40">
                              <Target className="h-6 w-6 text-neon-purple" />
                            </div>
                            <Badge className="bg-gradient-to-r from-neon-purple/30 to-neon-pink/30 text-neon-purple border-2 border-neon-purple/40 px-4 py-2 shadow-lg font-black text-base rounded-xl">
                              <Award className="h-4 w-4 mr-2" />
                              Quest #{index + 1}
                            </Badge>
                          </div>
                          <span className="text-xs text-neon-blue font-bold bg-neon-blue/10 px-3 py-2 rounded-full border border-neon-blue/30">
                            ⏰ {timestamp.toLocaleString()}
                          </span>
                        </div>
                        
                        {/* Scene/Question context */}
                        <div className="mb-6">
                          <h4 className="text-white font-black text-xl mb-3 flex items-center gap-2">
                            🎬 {sceneTitle}
                            <Sparkles className="h-5 w-5 text-neon-pink animate-pulse" />
                          </h4>
                        </div>
                        
                        {/* The actual choice made */}
                        <div className="bg-gradient-to-r from-neon-blue/15 to-neon-purple/15 p-6 rounded-2xl border-2 border-neon-blue/30 mb-6 hover:border-neon-blue/50 transition-all duration-300">
                          <p className="text-xs text-neon-blue font-black mb-3 flex items-center gap-2">
                            <Zap className="h-4 w-4 animate-pulse" />
                            YOUR LEGENDARY CHOICE:
                          </p>
                          <p className="text-white font-bold text-lg leading-relaxed">
                            {choiceText}
                          </p>
                        </div>
                        
                        {/* Impact/Consequences with gamification */}
                        {metricChanges && Object.keys(metricChanges).length > 0 && (
                          <div>
                            <p className="text-sm text-neon-yellow font-black mb-4 flex items-center gap-2">
                              <TrendingUp className="h-5 w-5 animate-bounce-light" />
                              ⚡ POWER-UP EFFECTS ON YOUR LIFE:
                            </p>
                            <div className="flex flex-wrap gap-3">
                              {Object.entries(metricChanges).map(([key, value]) => {
                                if (!value || value === 0) return null;
                                
                                let color = '';
                                let icon = '';
                                let bgGradient = '';
                                let effectText = '';
                                const numValue = typeof value === 'number' ? value : parseInt(String(value)) || 0;
                                
                                switch(key) {
                                  case 'health':
                                    color = numValue > 0 ? 'text-red-300' : 'text-red-500';
                                    bgGradient = numValue > 0 ? 'from-red-500/20 to-red-400/20 border-red-400/40' : 'from-red-500/10 to-red-400/10 border-red-500/30';
                                    icon = '❤️';
                                    effectText = numValue > 0 ? 'HEALTH BOOST!' : 'Health Hit';
                                    break;
                                  case 'money':
                                    color = numValue > 0 ? 'text-green-300' : 'text-green-500';
                                    bgGradient = numValue > 0 ? 'from-green-500/20 to-green-400/20 border-green-400/40' : 'from-green-500/10 to-green-400/10 border-green-500/30';
                                    icon = '💰';
                                    effectText = numValue > 0 ? 'MONEY GAINED!' : 'Money Lost';
                                    break;
                                  case 'happiness':
                                    color = numValue > 0 ? 'text-yellow-300' : 'text-yellow-500';
                                    bgGradient = numValue > 0 ? 'from-yellow-500/20 to-yellow-400/20 border-yellow-400/40' : 'from-yellow-500/10 to-yellow-400/10 border-yellow-500/30';
                                    icon = '😊';
                                    effectText = numValue > 0 ? 'JOY SURGE!' : 'Happiness Dip';
                                    break;
                                  case 'knowledge':
                                    color = numValue > 0 ? 'text-blue-300' : 'text-blue-500';
                                    bgGradient = numValue > 0 ? 'from-blue-500/20 to-blue-400/20 border-blue-400/40' : 'from-blue-500/10 to-blue-400/10 border-blue-500/30';
                                    icon = '📚';
                                    effectText = numValue > 0 ? 'WISDOM UP!' : 'Knowledge Loss';
                                    break;
                                  case 'relationships':
                                    color = numValue > 0 ? 'text-purple-300' : 'text-purple-500';
                                    bgGradient = numValue > 0 ? 'from-purple-500/20 to-purple-400/20 border-purple-400/40' : 'from-purple-500/10 to-purple-400/10 border-purple-500/30';
                                    icon = '👥';
                                    effectText = numValue > 0 ? 'BONDS STRONGER!' : 'Relations Strained';
                                    break;
                                  default:
                                    color = numValue > 0 ? 'text-gray-300' : 'text-gray-500';
                                    bgGradient = numValue > 0 ? 'from-gray-500/20 to-gray-400/20 border-gray-400/40' : 'from-gray-500/10 to-gray-400/10 border-gray-500/30';
                                    icon = '⭐';
                                    effectText = numValue > 0 ? 'STAT UP!' : 'Stat Down';
                                }
                                
                                return (
                                  <div key={key} className={`px-4 py-3 rounded-2xl bg-gradient-to-r ${bgGradient} border-2 flex items-center gap-3 hover:scale-105 transition-all duration-300 animate-scale-in`}>
                                    <span className="text-xl">{icon}</span>
                                    <div>
                                      <div className={`text-xs font-black ${color} mb-1`}>{effectText}</div>
                                      <div className="flex items-center gap-2">
                                        <span className={`capitalize font-bold ${color}`}>{key}</span>
                                        <span className={`font-black text-lg ${color}`}>{numValue > 0 ? '+' : ''}{numValue}</span>
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
            <Card className="teen-card p-8 text-center">
              <div className="flex flex-col items-center gap-4">
                <div className="p-4 bg-gradient-to-r from-neon-blue/20 to-neon-purple/20 rounded-full border-2 border-neon-blue/40 animate-pulse">
                  <BookOpen className="h-12 w-12 text-neon-blue" />
                </div>
                <div>
                  <h2 className="text-2xl font-black text-white mb-2">No Adventure Details Available! 🎮</h2>
                  <p className="text-white/70 font-medium">This might be an older completed scenario.</p>
                  <p className="text-neon-blue text-sm mt-2 font-bold">Future adventures will show all your epic decisions! ⚡</p>
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
