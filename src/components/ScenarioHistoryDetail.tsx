import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Clock, Trophy, TrendingUp, Users, BookOpen, Star, Sparkles, Crown, Zap, Award, Target, Gamepad2, Flame, Rocket, Bolt, Gem, Shield } from 'lucide-react';
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
      <DialogContent className="max-w-6xl max-h-[95vh] overflow-y-auto bg-gradient-to-br from-slate-900/98 via-purple-900/40 to-slate-800/98 border-4 border-neon-purple/50 backdrop-blur-2xl shadow-2xl shadow-neon-purple/40 rounded-3xl">
        
        {/* Enhanced animated background pattern */}
        <div className="absolute inset-0 bg-gradient-to-br from-neon-blue/10 via-neon-purple/10 to-neon-pink/10 opacity-70 rounded-3xl"></div>
        <div className="absolute top-0 right-0 w-56 h-56 bg-gradient-to-bl from-neon-purple/30 to-transparent rounded-full blur-3xl animate-pulse-slow"></div>
        <div className="absolute bottom-0 left-0 w-40 h-40 bg-gradient-to-tr from-neon-blue/30 to-transparent rounded-full blur-2xl animate-float"></div>
        <div className="absolute top-1/2 left-1/2 w-32 h-32 bg-gradient-to-r from-neon-pink/20 to-neon-yellow/20 rounded-full blur-xl animate-pulse-glow"></div>

        <DialogHeader className="pb-8 relative z-10">
          <DialogTitle className="text-4xl font-black gradient-heading flex items-center gap-4 mb-4">
            <div className="p-4 bg-gradient-to-r from-neon-yellow/30 to-neon-orange/30 rounded-3xl border-4 border-neon-yellow/60 animate-glow shadow-2xl shadow-neon-yellow/40">
              <Crown className="h-10 w-10 text-neon-yellow drop-shadow-lg" />
            </div>
            <div className="flex flex-col">
              <span className="bg-gradient-to-r from-neon-yellow via-neon-pink to-neon-blue bg-clip-text text-transparent animate-shimmer">
                🏆 LEGENDARY QUEST COMPLETE! 🎮
              </span>
              <div className="flex items-center gap-2 mt-2">
                <Flame className="h-6 w-6 text-neon-orange animate-bounce-light" />
                <span className="text-lg text-neon-orange font-bold">EPIC ACHIEVEMENT UNLOCKED!</span>
                <Gem className="h-6 w-6 text-neon-pink animate-pulse" />
              </div>
            </div>
          </DialogTitle>
          <div className="text-2xl text-neon-blue font-black flex items-center gap-3">
            <Rocket className="h-8 w-8 text-neon-cyan animate-bounce-light" />
            {history.scenarioTitle || 'Amazing Life Adventure'}
            <Bolt className="h-6 w-6 text-neon-yellow animate-pulse" />
          </div>
        </DialogHeader>

        <div className="space-y-10 relative z-10">
          {/* Enhanced Gamified Summary Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="teen-card hover-lift bg-gradient-to-br from-neon-blue/20 to-neon-cyan/20 border-4 border-neon-blue/50 hover:border-neon-blue/80 transition-all duration-500 transform hover:scale-105 shadow-2xl shadow-neon-blue/30">
              <CardContent className="p-8 flex items-center gap-6">
                <div className="p-6 bg-gradient-to-r from-neon-blue/30 to-neon-cyan/30 rounded-3xl border-4 border-neon-blue/60 animate-pulse-glow shadow-xl shadow-neon-blue/40">
                  <Clock className="h-12 w-12 text-neon-blue drop-shadow-lg" />
                </div>
                <div>
                  <p className="text-sm text-neon-blue font-black mb-2 uppercase tracking-wider">⚡ QUEST COMPLETED</p>
                  <p className="text-white font-black text-2xl mb-1">
                    {completedDate.toLocaleDateString()}
                  </p>
                  <p className="text-sm text-white/80 font-bold flex items-center gap-1">
                    <Star className="h-4 w-4 text-neon-yellow" />
                    LEGENDARY ACHIEVEMENT! 🔥
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="teen-card hover-lift bg-gradient-to-br from-neon-green/20 to-neon-lime/20 border-4 border-neon-green/50 hover:border-neon-green/80 transition-all duration-500 transform hover:scale-105 shadow-2xl shadow-neon-green/30">
              <CardContent className="p-8 flex items-center gap-6">
                <div className="p-6 bg-gradient-to-r from-neon-green/30 to-neon-lime/30 rounded-3xl border-4 border-neon-green/60 animate-bounce-light shadow-xl shadow-neon-green/40">
                  <Gamepad2 className="h-12 w-12 text-neon-green drop-shadow-lg" />
                </div>
                <div>
                  <p className="text-sm text-neon-green font-black mb-2 uppercase tracking-wider">🎯 POWER MOVES</p>
                  <p className="text-white font-black text-2xl mb-1">{totalChoices}</p>
                  <p className="text-sm text-white/80 font-bold flex items-center gap-1">
                    <Shield className="h-4 w-4 text-neon-green" />
                    MASTER STRATEGIST! ⚡
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="teen-card hover-lift bg-gradient-to-br from-neon-purple/20 to-neon-pink/20 border-4 border-neon-purple/50 hover:border-neon-purple/80 transition-all duration-500 transform hover:scale-105 shadow-2xl shadow-neon-purple/30">
              <CardContent className="p-8 flex items-center gap-6">
                <div className="p-6 bg-gradient-to-r from-neon-purple/30 to-neon-pink/30 rounded-3xl border-4 border-neon-purple/60 animate-rotate-glow shadow-xl shadow-neon-purple/40">
                  <Trophy className="h-12 w-12 text-neon-purple drop-shadow-lg" />
                </div>
                <div>
                  <p className="text-sm text-neon-purple font-black mb-2 uppercase tracking-wider">⭐ FINAL SCORE</p>
                  <p className="text-white font-black text-2xl mb-1">
                    {history.finalMetrics ? Object.values(history.finalMetrics).reduce((a, b) => a + b, 0) : 'GODLIKE'}
                  </p>
                  <p className="text-sm text-white/80 font-bold flex items-center gap-1">
                    <Gem className="h-4 w-4 text-neon-pink" />
                    INCREDIBLE POWER! 💎
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Ultra Enhanced Final Metrics */}
          {history.finalMetrics && (
            <Card className="teen-card bg-gradient-to-br from-slate-800/95 to-slate-700/95 border-4 border-neon-yellow/50 hover:border-neon-yellow/80 transition-all duration-500 shadow-2xl shadow-neon-yellow/20 rounded-3xl">
              <CardHeader className="pb-6">
                <CardTitle className="text-white flex items-center gap-4 text-3xl font-black">
                  <div className="p-4 bg-gradient-to-r from-neon-yellow/30 to-neon-orange/30 rounded-2xl border-4 border-neon-yellow/60 shadow-xl shadow-neon-yellow/40">
                    <Star className="h-8 w-8 text-neon-yellow drop-shadow-lg" />
                  </div>
                  <div className="flex flex-col">
                    <span className="bg-gradient-to-r from-neon-yellow via-neon-pink to-neon-blue bg-clip-text text-transparent">
                      🌟 YOUR ULTIMATE LIFE POWER STATS
                    </span>
                    <div className="flex items-center gap-2 mt-1">
                      <Sparkles className="h-6 w-6 text-neon-pink animate-pulse" />
                      <span className="text-lg text-neon-orange font-bold">MAXIMUM POTENTIAL UNLOCKED!</span>
                      <Flame className="h-6 w-6 text-neon-orange animate-bounce-light" />
                    </div>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-8">
                  {Object.entries(history.finalMetrics).map(([key, value]) => {
                    let color = '';
                    let icon = '';
                    let bgGradient = '';
                    let shadowColor = '';
                    switch(key) {
                      case 'health':
                        color = 'text-red-300';
                        bgGradient = 'from-red-500/30 to-red-400/30 border-red-400/60';
                        shadowColor = 'shadow-red-500/40';
                        icon = '❤️';
                        break;
                      case 'money':
                        color = 'text-green-300';
                        bgGradient = 'from-green-500/30 to-green-400/30 border-green-400/60';
                        shadowColor = 'shadow-green-500/40';
                        icon = '💰';
                        break;
                      case 'happiness':
                        color = 'text-yellow-300';
                        bgGradient = 'from-yellow-500/30 to-yellow-400/30 border-yellow-400/60';
                        shadowColor = 'shadow-yellow-500/40';
                        icon = '😊';
                        break;
                      case 'knowledge':
                        color = 'text-blue-300';
                        bgGradient = 'from-blue-500/30 to-blue-400/30 border-blue-400/60';
                        shadowColor = 'shadow-blue-500/40';
                        icon = '📚';
                        break;
                      case 'relationships':
                        color = 'text-purple-300';
                        bgGradient = 'from-purple-500/30 to-purple-400/30 border-purple-400/60';
                        shadowColor = 'shadow-purple-500/40';
                        icon = '👥';
                        break;
                      default:
                        color = 'text-gray-300';
                        bgGradient = 'from-gray-500/30 to-gray-400/30 border-gray-400/60';
                        shadowColor = 'shadow-gray-500/40';
                        icon = '⭐';
                    }
                    
                    return (
                      <div key={key} className={`p-6 rounded-3xl bg-gradient-to-br ${bgGradient} border-4 hover:scale-110 transition-all duration-500 text-center animate-scale-in shadow-xl ${shadowColor} hover:shadow-2xl`}>
                        <div className="flex items-center justify-center gap-3 mb-3">
                          <span className="text-3xl drop-shadow-lg">{icon}</span>
                          <span className={`text-sm font-black capitalize ${color} uppercase tracking-wider`}>{key}</span>
                        </div>
                        <div className={`text-4xl font-black ${color} mb-2 drop-shadow-lg`}>{value || 0}</div>
                        <div className="text-sm text-white/80 font-black">
                          {value >= 80 ? (
                            <span className="text-neon-yellow flex items-center justify-center gap-1">
                              <Crown className="h-4 w-4" />
                              GODLIKE! 🔥
                            </span>
                          ) : value >= 60 ? (
                            <span className="text-neon-blue flex items-center justify-center gap-1">
                              <Star className="h-4 w-4" />
                              AMAZING! ✨
                            </span>
                          ) : value >= 40 ? (
                            <span className="text-neon-green flex items-center justify-center gap-1">
                              <Trophy className="h-4 w-4" />
                              GREAT! 👍
                            </span>
                          ) : (
                            <span className="text-neon-orange flex items-center justify-center gap-1">
                              <Zap className="h-4 w-4" />
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

          {/* Mega Enhanced Choice History */}
          {history.choices && history.choices.length > 0 ? (
            <Card className="teen-card bg-gradient-to-br from-slate-800/95 to-slate-700/95 border-4 border-neon-blue/50 hover:border-neon-blue/80 transition-all duration-500 shadow-2xl shadow-neon-blue/20 rounded-3xl">
              <CardHeader className="pb-6">
                <CardTitle className="text-white flex items-center gap-4 text-3xl font-black">
                  <div className="p-4 bg-gradient-to-r from-neon-blue/30 to-neon-cyan/30 rounded-2xl border-4 border-neon-blue/60 shadow-xl shadow-neon-blue/40">
                    <BookOpen className="h-8 w-8 text-neon-blue drop-shadow-lg" />
                  </div>
                  <div className="flex flex-col">
                    <span className="bg-gradient-to-r from-neon-blue via-neon-purple to-neon-pink bg-clip-text text-transparent">
                      🎯 YOUR EPIC ADVENTURE CHRONICLE
                    </span>
                    <Badge className="bg-gradient-to-r from-neon-blue/40 to-neon-purple/40 text-neon-blue border-4 border-neon-blue/60 px-6 py-3 shadow-xl font-black text-lg rounded-2xl mt-2 self-start">
                      <Zap className="h-5 w-5 mr-2 animate-pulse" />
                      {history.choices.length} LEGENDARY CHOICES
                      <Bolt className="h-5 w-5 ml-2 animate-bounce-light" />
                    </Badge>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-10">
                {history.choices.map((choice, index) => {
                  console.log(`Rendering choice ${index + 1}:`, choice);
                  
                  const choiceText = choice?.choiceText || `Epic Power Move ${index + 1}`;
                  const sceneTitle = choice?.sceneId || `Adventure Scene ${index + 1}`;
                  
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
                  
                  const metricChanges = choice?.metricChanges || {};
                  
                  return (
                    <div key={index} className="bg-gradient-to-br from-slate-800/80 to-slate-700/80 rounded-3xl p-10 border-4 border-neon-purple/30 hover:border-neon-purple/60 transition-all duration-500 hover:scale-[1.02] shadow-xl hover:shadow-2xl hover:shadow-neon-purple/30 animate-fade-in relative overflow-hidden transform">
                      
                      {/* Enhanced background effects */}
                      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-neon-purple/20 to-transparent rounded-full blur-2xl animate-pulse-slow"></div>
                      <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-neon-blue/15 to-transparent rounded-full blur-xl animate-float"></div>
                      
                      <div className="relative z-10">
                        <div className="flex items-start justify-between mb-8">
                          <div className="flex items-center gap-6">
                            <div className="p-4 bg-gradient-to-r from-neon-purple/30 to-neon-pink/30 rounded-3xl border-4 border-neon-purple/60 shadow-xl shadow-neon-purple/40">
                              <Target className="h-8 w-8 text-neon-purple drop-shadow-lg" />
                            </div>
                            <Badge className="bg-gradient-to-r from-neon-purple/40 to-neon-pink/40 text-neon-purple border-4 border-neon-purple/60 px-6 py-3 shadow-xl font-black text-lg rounded-2xl">
                              <Award className="h-5 w-5 mr-2" />
                              POWER MOVE #{index + 1}
                              <Gem className="h-5 w-5 ml-2 animate-pulse" />
                            </Badge>
                          </div>
                          <span className="text-sm text-neon-blue font-black bg-neon-blue/20 px-4 py-3 rounded-2xl border-2 border-neon-blue/40 shadow-lg">
                            ⏰ {timestamp.toLocaleString()}
                          </span>
                        </div>
                        
                        <div className="mb-8">
                          <h4 className="text-white font-black text-2xl mb-4 flex items-center gap-3">
                            <Rocket className="h-7 w-7 text-neon-cyan animate-bounce-light" />
                            🎬 {sceneTitle}
                            <Sparkles className="h-6 w-6 text-neon-pink animate-pulse" />
                            <Flame className="h-6 w-6 text-neon-orange animate-bounce-light" />
                          </h4>
                        </div>
                        
                        <div className="bg-gradient-to-r from-neon-blue/20 to-neon-purple/20 p-8 rounded-3xl border-4 border-neon-blue/50 mb-8 hover:border-neon-blue/80 transition-all duration-500 shadow-xl shadow-neon-blue/20">
                          <p className="text-sm text-neon-blue font-black mb-4 flex items-center gap-2 uppercase tracking-wider">
                            <Bolt className="h-5 w-5 animate-pulse" />
                            YOUR LEGENDARY DECISION:
                            <Crown className="h-5 w-5 text-neon-yellow" />
                          </p>
                          <p className="text-white font-bold text-xl leading-relaxed drop-shadow-lg">
                            {choiceText}
                          </p>
                        </div>
                        
                        {metricChanges && Object.keys(metricChanges).length > 0 && (
                          <div>
                            <p className="text-lg text-neon-yellow font-black mb-6 flex items-center gap-3">
                              <TrendingUp className="h-6 w-6 animate-bounce-light" />
                              ⚡ EPIC LIFE IMPACT EXPLOSION:
                              <Gem className="h-6 w-6 text-neon-pink animate-pulse" />
                            </p>
                            <div className="flex flex-wrap gap-4">
                              {Object.entries(metricChanges).map(([key, value]) => {
                                if (!value || value === 0) return null;
                                
                                let color = '';
                                let icon = '';
                                let bgGradient = '';
                                let effectText = '';
                                let shadowColor = '';
                                const numValue = typeof value === 'number' ? value : parseInt(String(value)) || 0;
                                
                                switch(key) {
                                  case 'health':
                                    color = numValue > 0 ? 'text-red-300' : 'text-red-500';
                                    bgGradient = numValue > 0 ? 'from-red-500/30 to-red-400/30 border-red-400/60' : 'from-red-500/20 to-red-400/20 border-red-500/50';
                                    shadowColor = 'shadow-red-500/40';
                                    icon = '❤️';
                                    effectText = numValue > 0 ? 'HEALTH SURGE!' : 'Health Impact';
                                    break;
                                  case 'money':
                                    color = numValue > 0 ? 'text-green-300' : 'text-green-500';
                                    bgGradient = numValue > 0 ? 'from-green-500/30 to-green-400/30 border-green-400/60' : 'from-green-500/20 to-green-400/20 border-green-500/50';
                                    shadowColor = 'shadow-green-500/40';
                                    icon = '💰';
                                    effectText = numValue > 0 ? 'WEALTH BOOST!' : 'Money Impact';
                                    break;
                                  case 'happiness':
                                    color = numValue > 0 ? 'text-yellow-300' : 'text-yellow-500';
                                    bgGradient = numValue > 0 ? 'from-yellow-500/30 to-yellow-400/30 border-yellow-400/60' : 'from-yellow-500/20 to-yellow-400/20 border-yellow-500/50';
                                    shadowColor = 'shadow-yellow-500/40';
                                    icon = '😊';
                                    effectText = numValue > 0 ? 'JOY EXPLOSION!' : 'Happiness Impact';
                                    break;
                                  case 'knowledge':
                                    color = numValue > 0 ? 'text-blue-300' : 'text-blue-500';
                                    bgGradient = numValue > 0 ? 'from-blue-500/30 to-blue-400/30 border-blue-400/60' : 'from-blue-500/20 to-blue-400/20 border-blue-500/50';
                                    shadowColor = 'shadow-blue-500/40';
                                    icon = '📚';
                                    effectText = numValue > 0 ? 'BRAIN POWER!' : 'Knowledge Impact';
                                    break;
                                  case 'relationships':
                                    color = numValue > 0 ? 'text-purple-300' : 'text-purple-500';
                                    bgGradient = numValue > 0 ? 'from-purple-500/30 to-purple-400/30 border-purple-400/60' : 'from-purple-500/20 to-purple-400/20 border-purple-500/50';
                                    shadowColor = 'shadow-purple-500/40';
                                    icon = '👥';
                                    effectText = numValue > 0 ? 'SOCIAL POWER!' : 'Relations Impact';
                                    break;
                                  default:
                                    color = numValue > 0 ? 'text-gray-300' : 'text-gray-500';
                                    bgGradient = numValue > 0 ? 'from-gray-500/30 to-gray-400/30 border-gray-400/60' : 'from-gray-500/20 to-gray-400/20 border-gray-500/50';
                                    shadowColor = 'shadow-gray-500/40';
                                    icon = '⭐';
                                    effectText = numValue > 0 ? 'POWER UP!' : 'Stat Impact';
                                }
                                
                                return (
                                  <div key={key} className={`px-6 py-4 rounded-3xl bg-gradient-to-r ${bgGradient} border-4 flex items-center gap-4 hover:scale-110 transition-all duration-500 animate-scale-in shadow-xl ${shadowColor}`}>
                                    <span className="text-2xl drop-shadow-lg">{icon}</span>
                                    <div>
                                      <div className={`text-sm font-black ${color} mb-1 uppercase tracking-wider`}>{effectText}</div>
                                      <div className="flex items-center gap-2">
                                        <span className={`capitalize font-black ${color} text-lg`}>{key}</span>
                                        <span className={`font-black text-2xl ${color} drop-shadow-lg`}>{numValue > 0 ? '+' : ''}{numValue}</span>
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
            <Card className="teen-card p-10 text-center rounded-3xl border-4 border-neon-blue/40 bg-gradient-to-br from-slate-800/90 to-slate-700/90 shadow-2xl shadow-neon-blue/20">
              <div className="flex flex-col items-center gap-6">
                <div className="p-6 bg-gradient-to-r from-neon-blue/30 to-neon-purple/30 rounded-full border-4 border-neon-blue/60 animate-pulse-glow shadow-xl shadow-neon-blue/40">
                  <BookOpen className="h-16 w-16 text-neon-blue drop-shadow-lg" />
                </div>
                <div>
                  <h2 className="text-3xl font-black text-white mb-3 flex items-center justify-center gap-2">
                    No Adventure Details Available! 
                    <Gamepad2 className="h-8 w-8 text-neon-purple animate-bounce-light" />
                  </h2>
                  <p className="text-white/80 font-bold text-lg mb-2">This might be an older completed scenario.</p>
                  <p className="text-neon-blue text-lg font-black flex items-center justify-center gap-2">
                    <Bolt className="h-5 w-5 animate-pulse" />
                    Future adventures will show all your epic decisions! 
                    <Rocket className="h-5 w-5 animate-bounce-light" />
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
