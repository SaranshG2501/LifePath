import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useGameContext } from '@/context/GameContext';
import ScenarioHistoryCard from '@/components/profile/ScenarioHistoryCard';
import ProfileStats from '@/components/profile/ProfileStats';
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
  LogOut
} from 'lucide-react';

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
  completedAt: any;
  finalMetrics?: Record<string, number>;
  choices?: ScenarioChoice[];
}

const ProfilePage = () => {
  const navigate = useNavigate();
  const { userProfile, logout } = useAuth();
  const { scenarioHistory, isScenarioHistoryLoading } = useGameContext();

  console.log("ProfilePage rendering");
  console.log("ProfilePage - userProfile:", userProfile);
  console.log("ProfilePage - scenarioHistory:", scenarioHistory);
  console.log("ProfilePage - scenarioHistory length:", scenarioHistory?.length || 0);
  console.log("ProfilePage - isScenarioHistoryLoading:", isScenarioHistoryLoading);

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
      title: 'First Steps',
      description: 'Complete your first scenario',
      icon: Star,
      unlocked: scenarioHistory && scenarioHistory.length >= 1,
      rarity: 'common'
    },
    {
      id: 2,
      title: 'Money Master',
      description: 'Make 5 smart financial decisions',
      icon: DollarSign,
      unlocked: scenarioHistory && scenarioHistory.length >= 3,
      rarity: 'rare'
    },
    {
      id: 3,
      title: 'Social Butterfly',
      description: 'Excel in relationship scenarios',
      icon: Heart,
      unlocked: scenarioHistory && scenarioHistory.length >= 5,
      rarity: 'epic'
    },
    {
      id: 4,
      title: 'Scholar',
      description: 'Boost knowledge in 10 scenarios',
      icon: BookOpen,
      unlocked: scenarioHistory && scenarioHistory.length >= 10,
      rarity: 'legendary'
    }
  ];

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'common': return 'text-gray-400 border-gray-400/30';
      case 'rare': return 'text-neon-blue border-neon-blue/30';
      case 'epic': return 'text-neon-purple border-neon-purple/30';
      case 'legendary': return 'text-neon-yellow border-neon-yellow/30';
      default: return 'text-gray-400 border-gray-400/30';
    }
  };

  // Show loading state
  if (isScenarioHistoryLoading) {
    console.log("ProfilePage showing loading state");
    return (
      <div className="container mx-auto px-4 py-6 md:py-8 animate-fade-in">
        <div className="flex justify-center items-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-neon-blue mx-auto mb-4"></div>
            <p className="text-white/70">Loading your profile...</p>
          </div>
        </div>
      </div>
    );
  }

  console.log("ProfilePage rendering main content with scenario count:", scenarioHistory?.length || 0);

  return (
    <div className="container mx-auto px-4 py-6 md:py-8 animate-fade-in">
      <div className="flex justify-between items-center mb-6">
        <Button 
          variant="ghost" 
          onClick={() => navigate('/')} 
          className="flex items-center gap-2 rounded-xl text-white border border-white/10 hover:bg-white/10 hover:scale-105 transition-all duration-300"
        >
          <ArrowLeft size={16} />
          Back to Home
        </Button>
        
        <Button 
          variant="outline" 
          onClick={handleLogout}
          className="flex items-center gap-2 rounded-xl border-2 border-red-400/60 bg-gradient-to-r from-red-900/40 to-red-800/40 text-red-300 hover:bg-gradient-to-r hover:from-red-800/60 hover:to-red-700/60 hover:border-red-300/80 transition-all duration-300 px-6 py-3 font-bold hover:scale-105 shadow-lg hover:shadow-red-500/30"
        >
          <LogOut className="h-4 w-4" />
          Logout
        </Button>
      </div>

      <div className="max-w-6xl mx-auto space-y-8">
        <Card className="teen-card p-8 text-center animate-scale-in">
          <div className="flex flex-col items-center gap-6">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-neon-blue to-neon-purple rounded-full blur-2xl opacity-75 animate-pulse"></div>
              <div className="relative w-24 h-24 bg-gradient-to-r from-neon-blue/30 to-neon-purple/30 rounded-full flex items-center justify-center border-4 border-neon-purple/50">
                <User className="h-12 w-12 text-neon-blue" />
              </div>
            </div>
            
            <div className="space-y-2">
              <h1 className="text-3xl md:text-4xl font-black gradient-heading">
                {userProfile?.displayName || 'User'}
              </h1>
              <div className="flex items-center justify-center gap-2">
                <Shield className="h-5 w-5 text-neon-purple" />
                <span className="text-neon-purple font-bold">{getUserRoleDisplay()}</span>
                <Sparkles className="h-4 w-4 text-neon-pink animate-pulse" />
              </div>
              <p className="text-white/70">
                Joined November 2024
              </p>
            </div>
          </div>
        </Card>

        {/* Debug info - remove this in production */}
        <Card className="bg-yellow-500/10 border border-yellow-500/30 p-4">
          <div className="text-yellow-400 text-sm">
            Debug Info: Found {scenarioHistory?.length || 0} scenarios in history
            {scenarioHistory && scenarioHistory.length > 0 && (
              <div className="mt-2">
                Latest scenario: {scenarioHistory[scenarioHistory.length - 1]?.scenarioTitle}
              </div>
            )}
          </div>
        </Card>

        <ProfileStats 
          scenarioHistory={scenarioHistory || []}
          userLevel={1}
          userXp={(scenarioHistory?.length || 0) * 50}
        />

        {scenarioHistory && scenarioHistory.length > 0 ? (
          <Card className="teen-card p-8 animate-scale-in" style={{ animationDelay: '0.2s' }}>
            <div className="flex items-center gap-4 mb-6">
              <div className="p-3 bg-gradient-to-r from-neon-blue/20 to-neon-purple/20 rounded-xl border-2 border-neon-blue/40">
                <History className="h-6 w-6 text-neon-blue" />
              </div>
              <div>
                <h2 className="text-2xl font-black text-white">Your Epic Journey</h2>
                <p className="text-white/70">Relive your amazing scenarios and choices</p>
              </div>
              <Badge className="bg-gradient-to-r from-neon-blue/30 to-neon-purple/30 text-neon-blue border-2 border-neon-blue/40 px-4 py-2 shadow-lg font-black text-base rounded-xl ml-auto">
                <Zap className="h-4 w-4 mr-2 animate-pulse" />
                {scenarioHistory.length} Completed
              </Badge>
            </div>

            <div className="space-y-6">
              {scenarioHistory.map((scenario, index) => {
                const mappedScenario: LocalScenarioHistory = {
                  scenarioId: scenario.scenarioId,
                  scenarioTitle: scenario.scenarioTitle,
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
                  <ScenarioHistoryCard 
                    key={`${scenario.scenarioId}-${index}`}
                    scenario={mappedScenario}
                    index={index}
                  />
                );
              })}
            </div>
          </Card>
        ) : (
          <Card className="teen-card p-8 text-center animate-scale-in" style={{ animationDelay: '0.2s' }}>
            <div className="flex flex-col items-center gap-4">
              <div className="p-4 bg-gradient-to-r from-neon-blue/20 to-neon-purple/20 rounded-full border-2 border-neon-blue/40">
                <History className="h-8 w-8 text-neon-blue" />
              </div>
              <div>
                <h2 className="text-2xl font-black text-white mb-2">No Adventures Yet!</h2>
                <p className="text-white/70 mb-6">
                  Start your first scenario to see your epic journey unfold here.
                </p>
                <Button 
                  onClick={() => navigate('/game')}
                  className="btn-primary text-lg px-8 py-4 hover:scale-110 transition-all duration-300"
                >
                  <Zap className="h-5 w-5 mr-2" />
                  Start Your First Adventure
                  <Sparkles className="h-4 w-4 ml-2 animate-pulse" />
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

        <Card className="bg-gradient-to-r from-neon-purple/10 to-neon-pink/10 border-2 border-neon-purple/30 p-8 text-center animate-scale-in" style={{ animationDelay: '0.6s' }}>
          <div className="flex flex-col items-center gap-4">
            <div className="p-4 bg-gradient-to-r from-neon-purple/20 to-neon-pink/20 rounded-full border-2 border-neon-purple/40">
              <Gamepad2 className="h-8 w-8 text-neon-purple" />
            </div>
            <div>
              <h2 className="text-2xl font-black gradient-heading mb-2">
                Ready for Your Next Adventure?
              </h2>
              <p className="text-white/70 mb-6">
                Jump back into LifePath and continue leveling up your decision-making skills!
              </p>
              <Button 
                onClick={() => navigate('/game')}
                className="btn-primary text-lg px-8 py-4 hover:scale-110 transition-all duration-300"
              >
                <Zap className="h-5 w-5 mr-2" />
                Start New Scenario
                <Sparkles className="h-4 w-4 ml-2 animate-pulse" />
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default ProfilePage;
