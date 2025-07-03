
import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useGameContext } from '@/context/GameContext';
import { 
  ArrowLeft, 
  User, 
  Trophy, 
  Target, 
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
  Flame,
  Shield,
  Gamepad2
} from 'lucide-react';

const ProfilePage = () => {
  const navigate = useNavigate();
  const { userProfile } = useAuth();
  const { userStats, achievements } = useGameContext();

  const mockUserData = {
    username: userProfile?.displayName || 'Young Explorer',
    level: 12,
    xp: 2450,
    nextLevelXp: 3000,
    totalScenarios: 15,
    streak: 7,
    rank: 'Rising Star',
    joinDate: 'November 2024'
  };

  const statCards = [
    {
      icon: Trophy,
      label: 'Level',
      value: mockUserData.level,
      color: 'text-neon-yellow',
      bgColor: 'from-neon-yellow/20 to-neon-orange/20',
      borderColor: 'border-neon-yellow/40'
    },
    {
      icon: Target,
      label: 'Scenarios Completed',
      value: mockUserData.totalScenarios,
      color: 'text-neon-blue',
      bgColor: 'from-neon-blue/20 to-neon-cyan/20',
      borderColor: 'border-neon-blue/40'
    },
    {
      icon: Flame,
      label: 'Day Streak',
      value: mockUserData.streak,
      color: 'text-neon-red',
      bgColor: 'from-neon-red/20 to-neon-pink/20',
      borderColor: 'border-neon-red/40'
    },
    {
      icon: Crown,
      label: 'Rank',
      value: mockUserData.rank,
      color: 'text-neon-purple',
      bgColor: 'from-neon-purple/20 to-neon-magenta/20',
      borderColor: 'border-neon-purple/40'
    }
  ];

  const mockAchievements = [
    {
      id: 1,
      title: 'First Steps',
      description: 'Complete your first scenario',
      icon: Star,
      unlocked: true,
      rarity: 'common'
    },
    {
      id: 2,
      title: 'Money Master',
      description: 'Make 5 smart financial decisions',
      icon: DollarSign,
      unlocked: true,
      rarity: 'rare'
    },
    {
      id: 3,
      title: 'Social Butterfly',
      description: 'Excel in relationship scenarios',
      icon: Heart,
      unlocked: true,
      rarity: 'epic'
    },
    {
      id: 4,
      title: 'Scholar',
      description: 'Boost knowledge in 10 scenarios',
      icon: BookOpen,
      unlocked: false,
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

      <div className="max-w-4xl mx-auto space-y-8">
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
                <span className="text-neon-purple font-bold">{mockUserData.rank}</span>
                <Sparkles className="h-4 w-4 text-neon-pink animate-pulse" />
              </div>
              <p className="text-white/70">
                Joined {mockUserData.joinDate} • Level {mockUserData.level}
              </p>
            </div>

            <div className="w-full max-w-md space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-white/70">Level Progress</span>
                <span className="text-sm font-bold text-neon-blue">
                  {mockUserData.xp} / {mockUserData.nextLevelXp} XP
                </span>
              </div>
              <Progress 
                value={(mockUserData.xp / mockUserData.nextLevelXp) * 100} 
                className="h-3 bg-slate-700/50"
              />
            </div>
          </div>
        </Card>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          {statCards.map((stat, index) => (
            <Card 
              key={stat.label}
              className={`teen-card p-6 text-center hover-lift animate-scale-in border-2 ${stat.borderColor} bg-gradient-to-br ${stat.bgColor}`}
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="space-y-3">
                <div className={`mx-auto w-12 h-12 rounded-xl bg-gradient-to-r ${stat.bgColor} flex items-center justify-center border-2 ${stat.borderColor}`}>
                  <stat.icon className={`h-6 w-6 ${stat.color}`} />
                </div>
                <div>
                  <div className={`text-2xl font-black ${stat.color}`}>
                    {stat.value}
                  </div>
                  <div className="text-sm text-white/70 font-medium">
                    {stat.label}
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>

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

        <Card className="teen-card p-8 animate-scale-in" style={{ animationDelay: '0.5s' }}>
          <div className="flex items-center gap-4 mb-6">
            <div className="p-3 bg-gradient-to-r from-neon-green/20 to-neon-blue/20 rounded-xl border-2 border-neon-green/40">
              <TrendingUp className="h-6 w-6 text-neon-green" />
            </div>
            <div>
              <h2 className="text-2xl font-black text-white">Quick Stats</h2>
              <p className="text-white/70">Your journey at a glance</p>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-3xl font-black text-neon-blue mb-2">89%</div>
              <div className="text-sm text-white/70">Smart Choices</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-black text-neon-purple mb-2">42</div>
              <div className="text-sm text-white/70">Friends Made</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-black text-neon-green mb-2">$2.3K</div>
              <div className="text-sm text-white/70">Money Saved</div>
            </div>
          </div>
        </Card>

        <Card className="bg-gradient-to-r from-neon-purple/10 to-neon-pink/10 border-2 border-neon-purple/30 p-8 text-center animate-scale-in" style={{ animationDelay: '0.6s' }}>
          <div className="flex flex-col items-center gap-4">
            <div className="p-4 bg-gradient-to-r from-neon-purple/20 to-neon-pink/20 rounded-full border-2 border-neon-purple/40">
              <Gamepad2 className="h-8 w-8 text-neon-purple animate-bounce" />
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
