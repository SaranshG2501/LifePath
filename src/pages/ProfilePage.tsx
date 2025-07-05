import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useGameContext } from '@/context/GameContext';
import ScenarioHistoryCard from '@/components/profile/ScenarioHistoryCard';
import ProfileStats from '@/components/profile/ProfileStats';
import ScenarioHistoryDetail from '@/components/ScenarioHistoryDetail';
import { 
  ArrowLeft, 
  User, 
  Trophy, 
  Calendar,
  Star,
  Zap,
  Heart,
  DollarSign,
  Users,
  BookOpen,
  TrendingUp,
  Award,
  Sparkles,
  Crown,
  Shield,
  Gamepad2,
  History,
  LogOut,
  Flame,
  Rocket,
  Bolt,
  Gem,
  Target,
  RefreshCw
} from 'lucide-react';
import { ScenarioHistory } from '@/lib/firebase';

// Define interfaces to match the expected types for the cards
interface ScenarioChoice {
  sceneId: string;
  choiceId: string;
  choiceText: string;
  timestamp: any;
  metricChanges?: Record<string, number>;
}

interface LocalScenarioHistory {
  scenarioId: string;
  scenarioTitle?: string;
  startedAt?: any;
  completedAt: any;
  finalMetrics?: Record<string, number>;
  choices?: ScenarioChoice[];
}

const ProfilePage = () => {
  const navigate = useNavigate();
  const { userProfile, logout } = useAuth();
  const { scenarioHistory, isScenarioHistoryLoading, fetchScenarioHistory, refreshScenarioHistory } = useGameContext();
  const [selectedHistory, setSelectedHistory] = useState<ScenarioHistory | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  console.log("ProfilePage rendering");
  console.log("ProfilePage - userProfile:", userProfile);
  console.log("ProfilePage - scenarioHistory:", scenarioHistory);
  console.log("ProfilePage - scenarioHistory length:", scenarioHistory?.length || 0);
  console.log("ProfilePage - isScenarioHistoryLoading:", isScenarioHistoryLoading);

  // Enhanced history refresh function
  const handleRefreshHistory = async () => {
    setIsRefreshing(true);
    try {
      if (refreshScenarioHistory) {
        await refreshScenarioHistory();
      }
    } catch (error) {
      console.error('Failed to refresh history:', error);
    } finally {
      setIsRefreshing(false);
    }
  };

  // Auto-refresh on component mount
  useEffect(() => {
    if (fetchScenarioHistory) {
      fetchScenarioHistory();
    }
  }, [fetchScenarioHistory]);

  const handleViewDetails = (scenario: LocalScenarioHistory) => {
    const mappedHistory: ScenarioHistory = {
      scenarioId: scenario.scenarioId,
      scenarioTitle: scenario.scenarioTitle,
      startedAt: scenario.startedAt || scenario.completedAt,
      completedAt: scenario.completedAt,
      finalMetrics: {
        health: scenario.finalMetrics?.health || 0,
        money: scenario.finalMetrics?.money || 0,
        happiness: scenario.finalMetrics?.happiness || 0,
        knowledge: scenario.finalMetrics?.knowledge || 0,
        relationships: scenario.finalMetrics?.relationships || 0,
      },
      choices: scenario.choices?.map(choice => ({
        sceneId: choice.sceneId,
        choiceId: choice.choiceId,
        choiceText: choice.choiceText,
        timestamp: choice.timestamp,
        metricChanges: choice.metricChanges
      }))
    };
    
    setSelectedHistory(mappedHistory);
    setIsDetailOpen(true);
  };

  const getUserRoleDisplay = () => {
    if (!userProfile?.role) return 'Guest';
    return userProfile.role.charAt(0).toUpperCase() + userProfile.role.slice(1);
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const mockAchievements = [
    {
      id: 1,
      title: 'First Epic Quest',
      description: 'Complete your first legendary scenario',
      icon: Star,
      unlocked: scenarioHistory && scenarioHistory.length >= 1,
      rarity: 'common'
    },
    {
      id: 2,
      title: 'Money Wizard',
      description: 'Master 5 financial power moves',
      icon: DollarSign,
      unlocked: scenarioHistory && scenarioHistory.length >= 3,
      rarity: 'rare'
    },
    {
      id: 3,
      title: 'Social Legend',
      description: 'Dominate relationship scenarios',
      icon: Heart,
      unlocked: scenarioHistory && scenarioHistory.length >= 5,
      rarity: 'epic'
    },
    {
      id: 4,
      title: 'Knowledge God',
      description: 'Unlock wisdom in 10 epic quests',
      icon: BookOpen,
      unlocked: scenarioHistory && scenarioHistory.length >= 10,
      rarity: 'legendary'
    }
  ];

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'common': return 'text-gray-400 border-gray-400/50';
      case 'rare': return 'text-neon-blue border-neon-blue/50';
      case 'epic': return 'text-neon-purple border-neon-purple/50';
      case 'legendary': return 'text-neon-yellow border-neon-yellow/50';
      default: return 'text-gray-400 border-gray-400/50';
    }
  };

  // Show loading state
  if (isScenarioHistoryLoading) {
    console.log("ProfilePage showing loading state");
    return (
      <div className="container mx-auto px-4 py-6 md:py-8 animate-fade-in">
        <div className="flex justify-center items-center min-h-screen">
          <div className="text-center">
            <div className="relative">
              <div className="animate-spin rounded-full h-20 w-20 border-4 border-neon-blue/30 border-t-neon-blue mx-auto mb-6"></div>
              <div className="absolute inset-0 animate-ping rounded-full h-20 w-20 border-2 border-neon-purple/20 mx-auto"></div>
            </div>
            <p className="text-white/80 text-xl font-bold flex items-center justify-center gap-2">
              <Zap className="h-6 w-6 text-neon-blue animate-pulse" />
              Loading your epic profile...
              <Bolt className="h-6 w-6 text-neon-yellow animate-bounce-light" />
            </p>
          </div>
        </div>
      </div>
    );
  }

  console.log("ProfilePage rendering main content with scenario count:", scenarioHistory?.length || 0);

  return (
    <div className="container mx-auto px-4 py-6 md:py-8 animate-fade-in min-h-screen bg-gradient-to-br from-slate-900 via-purple-900/20 to-slate-800">
      {/* Enhanced floating background elements */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-20 left-10 w-40 h-40 bg-gradient-to-r from-neon-blue/10 to-neon-purple/10 rounded-full blur-3xl animate-float"></div>
        <div className="absolute bottom-20 right-10 w-56 h-56 bg-gradient-to-r from-neon-pink/10 to-neon-yellow/10 rounded-full blur-3xl animate-pulse-slow"></div>
        <div className="absolute top-1/2 left-1/2 w-32 h-32 bg-gradient-to-r from-neon-green/10 to-neon-cyan/10 rounded-full blur-2xl animate-pulse-glow"></div>
      </div>

      <div className="relative z-10">
        <div className="flex justify-between items-center mb-8">
          <Button 
            variant="ghost" 
            onClick={() => navigate('/')} 
            className="flex items-center gap-3 rounded-2xl text-white border-2 border-white/20 hover:bg-white/10 hover:scale-105 transition-all duration-300 px-6 py-3 font-bold shadow-lg hover:shadow-xl backdrop-blur-sm"
          >
            <ArrowLeft size={20} />
            Back to Home
          </Button>
          
          <div className="flex items-center gap-4">
            <Button 
              variant="outline" 
              onClick={handleRefreshHistory}
              disabled={isRefreshing}
              className="flex items-center gap-2 rounded-2xl border-2 border-neon-blue/60 bg-gradient-to-r from-neon-blue/20 to-neon-cyan/20 text-neon-blue hover:bg-gradient-to-r hover:from-neon-blue/30 hover:to-neon-cyan/30 hover:border-neon-blue/80 transition-all duration-300 px-6 py-3 font-bold hover:scale-105 shadow-lg hover:shadow-neon-blue/30"
            >
              <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
              {isRefreshing ? 'Refreshing...' : 'Refresh History'}
            </Button>
            
            <Button 
              variant="outline" 
              onClick={handleLogout}
              className="flex items-center gap-2 rounded-2xl border-2 border-red-400/60 bg-gradient-to-r from-red-900/40 to-red-800/40 text-red-300 hover:bg-gradient-to-r hover:from-red-800/60 hover:to-red-700/60 hover:border-red-300/80 transition-all duration-300 px-6 py-3 font-bold hover:scale-105 shadow-lg hover:shadow-red-500/30"
            >
              <LogOut className="h-4 w-4" />
              Logout
            </Button>
          </div>
        </div>

        <div className="max-w-6xl mx-auto space-y-10">
          <Card className="teen-card p-10 text-center animate-scale-in bg-gradient-to-br from-slate-800/90 to-slate-700/90 border-4 border-neon-purple/50 shadow-2xl shadow-neon-purple/20 rounded-3xl">
            <div className="flex flex-col items-center gap-8">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-neon-blue via-neon-purple to-neon-pink rounded-full blur-3xl opacity-75 animate-pulse-slow"></div>
                <div className="relative w-32 h-32 bg-gradient-to-r from-neon-blue/40 to-neon-purple/40 rounded-full flex items-center justify-center border-4 border-neon-purple/80 shadow-2xl shadow-neon-purple/50">
                  <User className="h-16 w-16 text-neon-blue drop-shadow-lg" />
                </div>
              </div>
              
              <div className="space-y-4">
                <h1 className="text-4xl md:text-5xl font-black gradient-heading flex items-center justify-center gap-3">
                  <Crown className="h-12 w-12 text-neon-yellow animate-pulse" />
                  {userProfile?.displayName || 'Epic Hero'}
                  <Gem className="h-10 w-10 text-neon-pink animate-bounce-light" />
                </h1>
                <div className="flex items-center justify-center gap-3">
                  <Shield className="h-6 w-6 text-neon-purple" />
                  <span className="text-neon-purple font-black text-xl">{getUserRoleDisplay()}</span>
                  <Sparkles className="h-5 w-5 text-neon-pink animate-pulse" />
                </div>
                <p className="text-white/80 text-lg font-bold flex items-center justify-center gap-2">
                  <Calendar className="h-5 w-5 text-neon-blue" />
                  Joined November 2024 - Epic Journey Begins!
                  <Rocket className="h-5 w-5 text-neon-cyan animate-bounce-light" />
                </p>
              </div>
            </div>
          </Card>

          <ProfileStats 
            scenarioHistory={scenarioHistory || []}
            userLevel={1}
            userXp={(scenarioHistory?.length || 0) * 50}
          />

          {scenarioHistory && scenarioHistory.length > 0 ? (
            <Card className="teen-card p-10 animate-scale-in bg-gradient-to-br from-slate-800/90 to-slate-700/90 border-4 border-neon-blue/50 shadow-2xl shadow-neon-blue/20 rounded-3xl" style={{ animationDelay: '0.2s' }}>
              <div className="flex items-center gap-6 mb-8">
                <div className="p-4 bg-gradient-to-r from-neon-blue/30 to-neon-purple/30 rounded-2xl border-4 border-neon-blue/60 shadow-xl shadow-neon-blue/40">
                  <History className="h-8 w-8 text-neon-blue drop-shadow-lg" />
                </div>
                <div className="flex-1">
                  <h2 className="text-3xl font-black text-white flex items-center gap-3">
                    Your Epic Adventure Chronicle
                    <Bolt className="h-8 w-8 text-neon-yellow animate-pulse" />
                  </h2>
                  <p className="text-white/80 font-bold text-lg">Relive your legendary scenarios and power moves</p>
                </div>
                <Badge className="bg-gradient-to-r from-neon-blue/40 to-neon-purple/40 text-neon-blue border-4 border-neon-blue/60 px-6 py-4 shadow-xl font-black text-xl rounded-2xl">
                  <Zap className="h-5 w-5 mr-2 animate-pulse" />
                  {scenarioHistory.length} COMPLETED
                  <Trophy className="h-5 w-5 ml-2 text-neon-yellow" />
                </Badge>
              </div>

              <div className="space-y-8">
                {scenarioHistory.map((scenario, index) => {
                  const mappedScenario: LocalScenarioHistory = {
                    scenarioId: scenario.scenarioId,
                    scenarioTitle: scenario.scenarioTitle,
                    startedAt: scenario.startedAt,
                    completedAt: scenario.completedAt,
                    finalMetrics: scenario.finalMetrics,
                    choices: scenario.choices?.map(choice => ({
                      sceneId: choice.sceneId || '',
                      choiceId: choice.choiceId || '',
                      choiceText: choice.choiceText || '',
                      timestamp: choice.timestamp,
                      metricChanges: choice.metricChanges
                    })) || []
                  };

                  return (
                    <div key={`${scenario.scenarioId}-${index}`} className="relative">
                      <ScenarioHistoryCard 
                        scenario={mappedScenario}
                        index={index}
                      />
                      <Button 
                        onClick={() => handleViewDetails(mappedScenario)}
                        className="absolute top-4 right-4 bg-gradient-to-r from-neon-purple/30 to-neon-pink/30 text-neon-purple border-2 border-neon-purple/50 hover:bg-gradient-to-r hover:from-neon-purple/50 hover:to-neon-pink/50 hover:border-neon-purple/80 transition-all duration-300 px-4 py-2 font-bold rounded-xl hover:scale-105 shadow-lg hover:shadow-neon-purple/30"
                      >
                        <Target className="h-4 w-4 mr-2" />
                        View Epic Details
                        <Sparkles className="h-4 w-4 ml-2 animate-pulse" />
                      </Button>
                    </div>
                  );
                })}
              </div>
            </Card>
          ) : (
            <Card className="teen-card p-10 text-center animate-scale-in bg-gradient-to-br from-slate-800/90 to-slate-700/90 border-4 border-neon-blue/50 shadow-2xl shadow-neon-blue/20 rounded-3xl" style={{ animationDelay: '0.2s' }}>
              <div className="flex flex-col items-center gap-6">
                <div className="p-6 bg-gradient-to-r from-neon-blue/30 to-neon-purple/30 rounded-full border-4 border-neon-blue/60 animate-pulse-glow shadow-xl shadow-neon-blue/40">
                  <History className="h-12 w-12 text-neon-blue drop-shadow-lg" />
                </div>
                <div>
                  <h2 className="text-3xl font-black text-white mb-4 flex items-center justify-center gap-3">
                    No Epic Adventures Yet!
                    <Rocket className="h-8 w-8 text-neon-cyan animate-bounce-light" />
                  </h2>
                  <p className="text-white/80 mb-8 text-lg font-bold">
                    Start your first legendary scenario to see your epic journey unfold here.
                  </p>
                  <Button 
                    onClick={() => navigate('/game')}
                    className="btn-primary text-xl px-10 py-5 hover:scale-110 transition-all duration-300 bg-gradient-to-r from-neon-blue/30 to-neon-purple/30 border-4 border-neon-blue/60 text-neon-blue hover:from-neon-blue/50 hover:to-neon-purple/50 hover:border-neon-blue/80 font-black rounded-2xl shadow-2xl hover:shadow-neon-blue/40"
                  >
                    <Zap className="h-6 w-6 mr-3" />
                    Start Your First Epic Quest
                    <Sparkles className="h-5 w-5 ml-3 animate-pulse" />
                  </Button>
                </div>
              </div>
            </Card>
          )}

          {mockAchievements.some(achievement => achievement.unlocked) && (
            <Card className="teen-card p-8 animate-scale-in" style={{ animationDelay: '0.3s' }}>
              <div className="flex items-center gap-4 mb-6">
                <div className="p-3 bg-gradient-to-r from-neon-yellow/20 to-neon-orange/20 rounded-xl border-2 border-neon-yellow/40">
                  <Award className="h-6 w-6 text-neon-yellow" />
                </div>
                <div>
                  <h2 className="text-2xl font-black text-white">Achievements</h2>
                  <p className="text-white/70">Your epic accomplishments</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {mockAchievements.filter(achievement => achievement.unlocked).map((achievement, index) => (
                  <Card 
                    key={achievement.id}
                    className={`p-6 border-2 transition-all duration-300 hover:scale-105 animate-scale-in bg-gradient-to-br from-slate-800/90 to-slate-700/90 ${getRarityColor(achievement.rarity)} shadow-lg hover:shadow-xl`}
                    style={{ animationDelay: `${0.4 + index * 0.1}s` }}
                  >
                    <div className="flex items-start gap-4">
                      <div className={`p-3 rounded-xl border-2 ${getRarityColor(achievement.rarity)} bg-gradient-to-r from-current/10 to-current/5`}>
                        <achievement.icon className={`h-6 w-6 ${getRarityColor(achievement.rarity).split(' ')[0]}`} />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-bold text-white">
                            {achievement.title}
                          </h3>
                          <Badge 
                            variant="outline" 
                            className={`text-xs px-2 py-1 ${getRarityColor(achievement.rarity)}`}
                          >
                            {achievement.rarity}
                          </Badge>
                        </div>
                        <p className="text-sm text-white/70">
                          {achievement.description}
                        </p>
                      </div>
                      <Sparkles className="h-5 w-5 text-neon-yellow animate-pulse" />
                    </div>
                  </Card>
                ))}
              </div>
            </Card>
          )}

          <Card className="bg-gradient-to-r from-neon-purple/20 to-neon-pink/20 border-4 border-neon-purple/50 p-10 text-center animate-scale-in rounded-3xl shadow-2xl shadow-neon-purple/20" style={{ animationDelay: '0.6s' }}>
            <div className="flex flex-col items-center gap-6">
              <div className="p-6 bg-gradient-to-r from-neon-purple/30 to-neon-pink/30 rounded-full border-4 border-neon-purple/60 shadow-xl shadow-neon-purple/40">
                <Gamepad2 className="h-12 w-12 text-neon-purple drop-shadow-lg" />
              </div>
              <div>
                <h2 className="text-3xl font-black gradient-heading mb-4 flex items-center justify-center gap-3">
                  Ready for Your Next Epic Adventure?
                  <Crown className="h-8 w-8 text-neon-yellow animate-pulse" />
                </h2>
                <p className="text-white/80 mb-8 text-lg font-bold">
                  Jump back into LifePath and continue leveling up your legendary decision-making powers!
                </p>
                <Button 
                  onClick={() => navigate('/game')}
                  className="btn-primary text-xl px-10 py-5 hover:scale-110 transition-all duration-300 bg-gradient-to-r from-neon-purple/30 to-neon-pink/30 border-4 border-neon-purple/60 text-neon-purple hover:from-neon-purple/50 hover:to-neon-pink/50 hover:border-neon-purple/80 font-black rounded-2xl shadow-2xl hover:shadow-neon-purple/40"
                >
                  <Zap className="h-6 w-6 mr-3" />
                  Start New Epic Scenario
                  <Bolt className="h-5 w-5 ml-3 animate-bounce-light" />
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Enhanced History Detail Modal */}
      <ScenarioHistoryDetail 
        history={selectedHistory}
        open={isDetailOpen}
        onClose={() => {
          setIsDetailOpen(false);
          setSelectedHistory(null);
        }}
      />
    </div>
  );
};

export default ProfilePage;
