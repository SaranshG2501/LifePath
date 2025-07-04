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
  History
} from 'lucide-react';

const ProfilePage = () => {
  const navigate = useNavigate();
  const { userProfile } = useAuth();
  const { scenarioHistory } = useGameContext();

  console.log("ProfilePage - userProfile:", userProfile);
  console.log("ProfilePage - scenarioHistory:", scenarioHistory);

  const mockUserData = {
    username: userProfile?.displayName || 'Young Explorer',
    level: 12,
    xp: 2450,
    joinDate: 'November 2024'
  };

  const getUserRoleDisplay = () => {
    if (!userProfile?.role) return 'Guest';
    return userProfile.role.charAt(0).toUpperCase() + userProfile.role.slice(1);
  };

  const mockAchievements = [
    {
      id: 1,
      title: 'First Steps',
      description: 'Complete your first scenario',
      icon: Star,
      unlocked: scenarioHistory.length >= 1,
      rarity: 'common'
    },
    {
      id: 2,
      title: 'Money Master',
      description: 'Make 5 smart financial decisions',
      icon: DollarSign,
      unlocked: scenarioHistory.length >= 3,
      rarity: 'rare'
    },
    {
      id: 3,
      title: 'Social Butterfly',
      description: 'Excel in relationship scenarios',
      icon: Heart,
      unlocked: scenarioHistory.length >= 5,
      rarity: 'epic'
    },
    {
      id: 4,
      title: 'Scholar',
      description: 'Boost knowledge in 10 scenarios',
      icon: BookOpen,
      unlocked: scenarioHistory.length >= 10,
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

  return (
    <div className="container mx-auto px-4 py-6 md:py-8 animate-fade-in">
      <Button 
        variant="ghost" 
        onClick={() => navigate('/')} 
        className="mb-6 flex items-center gap-2 rounded-xl text-white border border-white/10 hover:bg-white/10 hover:scale-105 transition-all duration-300"
      >
        <ArrowLeft size={16} />
        Back to Home
      </Button>

      <div className="max-w-6xl mx-auto space-y-8">
        {/* Profile Header */}
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
                {mockUserData.username}
              </h1>
              <div className="flex items-center justify-center gap-2">
                <Shield className="h-5 w-5 text-neon-purple" />
                <span className="text-neon-purple font-bold">{getUserRoleDisplay()}</span>
                <Sparkles className="h-4 w-4 text-neon-pink animate-pulse" />
              </div>
              <p className="text-white/70">
                Joined {mockUserData.joinDate}
              </p>
            </div>
          </div>
        </Card>

        {/* Decision Metrics */}
        <ProfileStats 
          scenarioHistory={scenarioHistory || []}
          userLevel={mockUserData.level}
          userXp={mockUserData.xp}
        />

        {/* Scenario History */}
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
              {scenarioHistory.map((scenario, index) => (
                <ScenarioHistoryCard 
                  key={`${scenario.scenarioId}-${index}`}
                  scenario={{
                    scenarioId: scenario.scenarioId,
                    title: scenario.scenarioTitle,
                    completedAt: scenario.completedAt,
                    finalMetrics: scenario.finalMetrics,  
                    choices: scenario.choices
                  }}
                  index={index}
                />
              ))}
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

        {/* Achievements */}
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
            {mockAchievements.map((achievement, index) => (
              <Card 
                key={achievement.id}
                className={`p-6 border-2 transition-all duration-300 hover:scale-105 animate-scale-in ${
                  achievement.unlocked 
                    ? `bg-gradient-to-br from-slate-800/90 to-slate-700/90 ${getRarityColor(achievement.rarity)} shadow-lg hover:shadow-xl` 
                    : 'bg-slate-800/50 border-slate-600/30 opacity-60'
                }`}
                style={{ animationDelay: `${0.4 + index * 0.1}s` }}
              >
                <div className="flex items-start gap-4">
                  <div className={`p-3 rounded-xl border-2 ${
                    achievement.unlocked 
                      ? `${getRarityColor(achievement.rarity)} bg-gradient-to-r from-current/10 to-current/5` 
                      : 'border-slate-600/30 bg-slate-700/30'
                  }`}>
                    <achievement.icon className={`h-6 w-6 ${
                      achievement.unlocked 
                        ? getRarityColor(achievement.rarity).split(' ')[0]
                        : 'text-slate-500'
                    }`} />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className={`font-bold ${
                        achievement.unlocked ? 'text-white' : 'text-slate-400'
                      }`}>
                        {achievement.title}
                      </h3>
                      <Badge 
                        variant="outline" 
                        className={`text-xs px-2 py-1 ${getRarityColor(achievement.rarity)}`}
                      >
                        {achievement.rarity}
                      </Badge>
                    </div>
                    <p className={`text-sm ${
                      achievement.unlocked ? 'text-white/70' : 'text-slate-500'
                    }`}>
                      {achievement.description}
                    </p>
                  </div>
                  {achievement.unlocked && (
                    <Sparkles className="h-5 w-5 text-neon-yellow animate-pulse" />
                  )}
                </div>
              </Card>
            ))}
          </div>
        </Card>

        {/* Call to Action */}
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
