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
  Award,
  Sparkles,
  Crown,
  Shield,
  Gamepad2,
  History,
  LogOut,
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

  console.log("ProfilePage rendering with scenarioHistory:", scenarioHistory);

  const handleRefreshHistory = async () => {
    setIsRefreshing(true);
    try {
      console.log("🔄 Refreshing scenario history...");
      if (refreshScenarioHistory) {
        await refreshScenarioHistory();
      }
    } catch (error) {
      console.error('Failed to refresh history:', error);
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    console.log("ProfilePage mounted, fetching history");
    if (fetchScenarioHistory) {
      fetchScenarioHistory();
    }
  }, [fetchScenarioHistory]);

  const handleViewDetails = (scenario: LocalScenarioHistory) => {
    console.log("Opening details for scenario:", scenario);
    
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
    
    console.log("Mapped history for detail view:", mappedHistory);
    setSelectedHistory(mappedHistory);
    setIsDetailOpen(true);
  };

  const getUserRoleDisplay = () => {
    if (!userProfile?.role) return 'Epic Hero';
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

  if (isScenarioHistoryLoading) {
    return (
      <div className="container mx-auto px-4 py-4 animate-fade-in">
        <div className="flex justify-center items-center min-h-screen">
          <div className="text-center">
            <div className="relative">
              <div className="animate-spin rounded-full h-16 w-16 border-4 border-neon-blue/30 border-t-neon-blue mx-auto mb-4"></div>
              <div className="absolute inset-0 animate-ping rounded-full h-16 w-16 border-2 border-neon-purple/20 mx-auto"></div>
            </div>
            <p className="text-white/80 text-lg font-bold flex items-center justify-center gap-2">
              <Zap className="h-5 w-5 text-neon-blue animate-pulse" />
              Loading your epic profile...
              <Bolt className="h-5 w-5 text-neon-yellow animate-bounce-light" />
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-3 py-3 animate-fade-in min-h-screen bg-gradient-to-br from-slate-900 via-purple-900/10 to-slate-800">
      {/* Compact floating background elements */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-10 left-5 w-20 h-20 bg-gradient-to-r from-neon-blue/6 to-neon-purple/6 rounded-full blur-2xl animate-float"></div>
        <div className="absolute bottom-10 right-5 w-24 h-24 bg-gradient-to-r from-neon-pink/6 to-neon-yellow/6 rounded-full blur-2xl animate-pulse-slow"></div>
        <div className="absolute top-1/2 left-1/2 w-16 h-16 bg-gradient-to-r from-neon-green/6 to-neon-cyan/6 rounded-full blur-xl animate-pulse-glow"></div>
      </div>

      <div className="relative z-10">
        <div className="flex justify-between items-center mb-4">
          <Button 
            variant="ghost" 
            onClick={() => navigate('/')} 
            className="flex items-center gap-2 rounded-full text-white border-2 border-white/20 hover:bg-white/10 hover:scale-105 transition-all duration-300 px-6 py-3 font-bold shadow-lg hover:shadow-xl backdrop-blur-sm bg-gradient-to-r from-slate-800/80 to-slate-700/80 hover:border-neon-blue/40 hover:shadow-neon-blue/20"
          >
            <ArrowLeft size={18} />
            Back to Home
          </Button>
          
          <div className="flex items-center gap-3">
            <Button 
              variant="outline" 
              onClick={handleRefreshHistory}
              disabled={isRefreshing}
              className="flex items-center gap-2 rounded-full border-2 border-neon-blue/50 bg-gradient-to-r from-neon-blue/15 to-neon-cyan/15 text-neon-blue hover:bg-gradient-to-r hover:from-neon-blue/25 hover:to-neon-cyan/25 hover:border-neon-blue/70 transition-all duration-300 px-6 py-3 font-bold hover:scale-105 shadow-lg hover:shadow-neon-blue/20 backdrop-blur-sm"
            >
              <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
              {isRefreshing ? 'Refreshing...' : 'Refresh'}
            </Button>
            
            <Button 
              variant="outline" 
              onClick={handleLogout}
              className="flex items-center gap-2 rounded-full border-2 border-red-400/50 bg-gradient-to-r from-red-900/30 to-red-800/30 text-red-300 hover:bg-gradient-to-r hover:from-red-800/50 hover:to-red-700/50 hover:border-red-300/70 transition-all duration-300 px-6 py-3 font-bold hover:scale-105 shadow-lg hover:shadow-red-500/20 backdrop-blur-sm"
            >
              <LogOut className="h-4 w-4" />
              Logout
            </Button>
          </div>
        </div>

        <div className="max-w-4xl mx-auto space-y-4">
          <Card className="teen-card p-4 text-center animate-scale-in bg-gradient-to-br from-slate-800/90 to-slate-700/90 border-2 border-neon-purple/40 shadow-xl shadow-neon-purple/15 rounded-2xl">
            <div className="flex flex-col items-center gap-3">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-neon-blue via-neon-purple to-neon-pink rounded-full blur-2xl opacity-50 animate-pulse-slow"></div>
                <div className="relative w-16 h-16 bg-gradient-to-r from-neon-blue/30 to-neon-purple/30 rounded-full flex items-center justify-center border-2 border-neon-purple/60 shadow-xl shadow-neon-purple/40">
                  <User className="h-8 w-8 text-neon-blue drop-shadow-lg" />
                </div>
              </div>
              
              <div className="space-y-1">
                <h1 className="text-xl md:text-2xl font-black gradient-heading flex items-center justify-center gap-2">
                  <Crown className="h-6 w-6 text-neon-yellow animate-pulse" />
                  {userProfile?.displayName || 'Epic Hero'}
                  <Gem className="h-5 w-5 text-neon-pink animate-bounce-light" />
                </h1>
                <div className="flex items-center justify-center gap-2">
                  <Shield className="h-4 w-4 text-neon-purple" />
                  <span className="text-neon-purple font-bold">{getUserRoleDisplay()}</span>
                  <Sparkles className="h-4 w-4 text-neon-pink animate-pulse" />
                </div>
                <p className="text-white/70 text-sm font-medium flex items-center justify-center gap-2">
                  <Calendar className="h-3 w-3 text-neon-blue" />
                  Epic Journey Begins!
                  <Rocket className="h-3 w-3 text-neon-cyan animate-bounce-light" />
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
            <Card className="teen-card p-4 animate-scale-in bg-gradient-to-br from-slate-800/90 to-slate-700/90 border-2 border-neon-blue/40 shadow-xl shadow-neon-blue/15 rounded-2xl" style={{ animationDelay: '0.2s' }}>
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-gradient-to-r from-neon-blue/25 to-neon-purple/25 rounded-xl border-2 border-neon-blue/50 shadow-lg shadow-neon-blue/30">
                  <History className="h-5 w-5 text-neon-blue drop-shadow-lg" />
                </div>
                <div className="flex-1">
                  <h2 className="text-lg font-black text-white flex items-center gap-2">
                    Your Epic Adventure Chronicle
                    <Bolt className="h-5 w-5 text-neon-yellow animate-pulse" />
                  </h2>
                  <p className="text-white/70 font-medium text-sm">Relive your legendary scenarios and power moves</p>
                </div>
                <Badge className="bg-gradient-to-r from-neon-blue/30 to-neon-purple/30 text-neon-blue border-2 border-neon-blue/50 px-4 py-2 shadow-lg font-bold rounded-full">
                  <Zap className="h-3 w-3 mr-1 animate-pulse" />
                  {scenarioHistory.length} COMPLETED
                  <Trophy className="h-3 w-3 ml-1 text-neon-yellow" />
                </Badge>
              </div>

              <div className="space-y-3">
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
                        className="absolute top-3 right-3 bg-gradient-to-r from-neon-purple/25 to-neon-pink/25 text-neon-purple border-2 border-neon-purple/40 hover:bg-gradient-to-r hover:from-neon-purple/40 hover:to-neon-pink/40 hover:border-neon-purple/60 transition-all duration-300 px-4 py-2 font-bold rounded-full hover:scale-105 shadow-lg hover:shadow-neon-purple/20 text-xs backdrop-blur-sm"
                      >
                        <Target className="h-3 w-3 mr-1" />
                        View Details
                        <Sparkles className="h-3 w-3 ml-1 animate-pulse" />
                      </Button>
                    </div>
                  );
                })}
              </div>
            </Card>
          ) : (
            <Card className="teen-card p-6 text-center animate-scale-in bg-gradient-to-br from-slate-800/90 to-slate-700/90 border-2 border-neon-blue/40 shadow-xl shadow-neon-blue/15 rounded-2xl" style={{ animationDelay: '0.2s' }}>
              <div className="flex flex-col items-center gap-4">
                <div className="p-4 bg-gradient-to-r from-neon-blue/25 to-neon-purple/25 rounded-full border-2 border-neon-blue/50 animate-pulse-glow shadow-lg shadow-neon-blue/30">
                  <History className="h-8 w-8 text-neon-blue drop-shadow-lg" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white mb-3 flex items-center justify-center gap-2">
                    No Epic Adventures Yet!
                    <Rocket className="h-6 w-6 text-neon-cyan animate-bounce-light" />
                  </h2>
                  <p className="text-white/70 mb-6 text-base font-medium">
                    Start your first legendary scenario to see your epic journey unfold here.
                  </p>
                  <Button 
                    onClick={() => navigate('/game')}
                    className="btn-primary px-8 py-4 hover:scale-110 transition-all duration-300 bg-gradient-to-r from-neon-blue/25 to-neon-purple/25 border-2 border-neon-blue/50 text-neon-blue hover:from-neon-blue/40 hover:to-neon-purple/40 hover:border-neon-blue/70 font-bold rounded-full shadow-xl hover:shadow-neon-blue/30 text-lg backdrop-blur-sm"
                  >
                    <Zap className="h-5 w-5 mr-2" />
                    Start Your First Epic Quest
                    <Sparkles className="h-5 w-5 ml-2 animate-pulse" />
                  </Button>
                </div>
              </div>
            </Card>
          )}

          {mockAchievements.some(achievement => achievement.unlocked) && (
            <Card className="teen-card p-4 animate-scale-in" style={{ animationDelay: '0.3s' }}>
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-gradient-to-r from-neon-yellow/20 to-neon-orange/20 rounded-lg border border-neon-yellow/30">
                  <Award className="h-4 w-4 text-neon-yellow" />
                </div>
                <div>
                  <h2 className="font-bold text-white">Achievements</h2>
                  <p className="text-white/60 text-sm">Your epic accomplishments</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {mockAchievements.filter(achievement => achievement.unlocked).map((achievement, index) => (
                  <Card 
                    key={achievement.id}
                    className={`p-3 border transition-all duration-300 hover:scale-105 animate-scale-in bg-gradient-to-br from-slate-800/90 to-slate-700/90 ${getRarityColor(achievement.rarity)} shadow-lg hover:shadow-xl rounded-xl`}
                    style={{ animationDelay: `${0.4 + index * 0.1}s` }}
                  >
                    <div className="flex items-start gap-2">
                      <div className={`p-1 rounded-lg border ${getRarityColor(achievement.rarity)} bg-gradient-to-r from-current/10 to-current/5`}>
                        <achievement.icon className={`h-4 w-4 ${getRarityColor(achievement.rarity).split(' ')[0]}`} />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-bold text-white text-sm">
                            {achievement.title}
                          </h3>
                          <Badge 
                            variant="outline" 
                            className={`text-xs px-1 py-0.5 ${getRarityColor(achievement.rarity)}`}
                          >
                            {achievement.rarity}
                          </Badge>
                        </div>
                        <p className="text-xs text-white/60">
                          {achievement.description}
                        </p>
                      </div>
                      <Sparkles className="h-3 w-3 text-neon-yellow animate-pulse" />
                    </div>
                  </Card>
                ))}
              </div>
            </Card>
          )}

          <Card className="bg-gradient-to-r from-neon-purple/15 to-neon-pink/15 border-2 border-neon-purple/40 p-6 text-center animate-scale-in rounded-2xl shadow-xl shadow-neon-purple/15" style={{ animationDelay: '0.6s' }}>
            <div className="flex flex-col items-center gap-4">
              <div className="p-4 bg-gradient-to-r from-neon-purple/25 to-neon-pink/25 rounded-full border-2 border-neon-purple/50 shadow-lg shadow-neon-purple/30">
                <Gamepad2 className="h-8 w-8 text-neon-purple drop-shadow-lg" />
              </div>
              <div>
                <h2 className="text-xl font-bold gradient-heading mb-3 flex items-center justify-center gap-2">
                  Ready for Your Next Epic Adventure?
                  <Crown className="h-6 w-6 text-neon-yellow animate-pulse" />
                </h2>
                <p className="text-white/70 mb-6 text-base font-medium">
                  Jump back into LifePath and continue leveling up your legendary decision-making powers!
                </p>
                <Button 
                  onClick={() => navigate('/game')}
                  className="btn-primary px-8 py-4 hover:scale-110 transition-all duration-300 bg-gradient-to-r from-neon-purple/25 to-neon-pink/25 border-2 border-neon-purple/50 text-neon-purple hover:from-neon-purple/40 hover:to-neon-pink/40 hover:border-neon-purple/70 font-bold rounded-full shadow-xl hover:shadow-neon-purple/30 text-lg backdrop-blur-sm"
                >
                  <Zap className="h-5 w-5 mr-2" />
                  Start New Epic Scenario
                  <Bolt className="h-5 w-5 ml-2 animate-bounce-light" />
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </div>

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
