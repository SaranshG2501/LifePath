
import React, { useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useGameContext } from '@/context/GameContext';
import { 
  ArrowLeft, 
  User, 
  Trophy, 
  Calendar,
  Star,
  Zap,
  Crown,
  Shield,
  Gamepad2,
  History,
  LogOut,
  Rocket,
  Bolt,
  Gem,
  RefreshCw,
  Sparkles,
  Target,
  Award,
  TrendingUp
} from 'lucide-react';

const ProfilePage = () => {
  const navigate = useNavigate();
  const { userProfile, logout } = useAuth();
  const { scenarioHistory, isHistoryLoading, refreshHistory } = useGameContext();

  const handleRefreshHistory = () => {
    refreshHistory();
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

  const getTotalScore = () => {
    return scenarioHistory.reduce((total, item) => total + item.score, 0);
  };

  const getAverageScore = () => {
    if (scenarioHistory.length === 0) return 0;
    return Math.round(getTotalScore() / scenarioHistory.length);
  };

  if (isHistoryLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-purple-900 flex items-center justify-center">
        <div className="text-center">
          <div className="relative mb-4">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-purple-500/30 border-t-purple-500 mx-auto"></div>
            <div className="absolute inset-0 animate-ping rounded-full h-16 w-16 border-2 border-purple-500/20 mx-auto"></div>
          </div>
          <p className="text-white/80 text-lg font-semibold flex items-center justify-center gap-2">
            <Zap className="h-5 w-5 text-purple-400 animate-pulse" />
            Loading your profile...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-purple-900 p-4">
      {/* Background decoration */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-20 left-10 w-32 h-32 bg-purple-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-40 h-40 bg-blue-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10 max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <Button 
            variant="outline" 
            onClick={() => navigate('/')} 
            className="flex items-center gap-2 text-white border-white/20 hover:border-purple-400 hover:bg-purple-500/20 transition-all duration-300"
          >
            <ArrowLeft size={16} />
            Back to Home
          </Button>
          
          <div className="flex items-center gap-3">
            <Button 
              variant="outline" 
              onClick={handleRefreshHistory}
              className="flex items-center gap-2 text-white border-white/20 hover:border-blue-400 hover:bg-blue-500/20 transition-all duration-300"
            >
              <RefreshCw className="h-4 w-4" />
              Refresh
            </Button>
            
            <Button 
              variant="outline" 
              onClick={handleLogout}
              className="flex items-center gap-2 text-white border-red-400/50 hover:border-red-400 hover:bg-red-500/20 transition-all duration-300"
            >
              <LogOut className="h-4 w-4" />
              Logout
            </Button>
          </div>
        </div>

        {/* Profile Header Card */}
        <Card className="p-8 text-center bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl border border-white/20 shadow-2xl mb-8 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 via-blue-500/10 to-purple-500/10"></div>
          
          <div className="relative z-10 flex flex-col items-center gap-4">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-500 via-blue-500 to-purple-500 rounded-full blur-xl opacity-60 animate-pulse"></div>
              <div className="relative w-20 h-20 bg-gradient-to-r from-purple-500/30 to-blue-500/30 rounded-full flex items-center justify-center border-4 border-white/30 backdrop-blur-sm">
                <User className="h-10 w-10 text-white" />
              </div>
            </div>
            
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 via-blue-400 to-purple-400 bg-clip-text text-transparent flex items-center justify-center gap-3 mb-2">
                <Crown className="h-6 w-6 text-yellow-400" />
                {userProfile?.displayName || 'Epic Hero'}
                <Gem className="h-6 w-6 text-purple-400" />
              </h1>
              <div className="flex items-center justify-center gap-2">
                <Shield className="h-4 w-4 text-purple-400" />
                <span className="text-purple-300 font-semibold">{getUserRoleDisplay()}</span>
              </div>
            </div>
          </div>
        </Card>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="p-6 text-center bg-gradient-to-br from-blue-500/20 to-blue-600/20 backdrop-blur-xl border border-blue-400/30 hover:border-blue-400/50 transition-all duration-300 hover:scale-105">
            <div className="flex items-center justify-center mb-3">
              <div className="p-3 bg-blue-500/30 rounded-full">
                <Target className="h-8 w-8 text-blue-300" />
              </div>
            </div>
            <div className="text-3xl font-bold text-white mb-1">{scenarioHistory.length}</div>
            <div className="text-blue-300 font-medium">Adventures Completed</div>
          </Card>

          <Card className="p-6 text-center bg-gradient-to-br from-green-500/20 to-green-600/20 backdrop-blur-xl border border-green-400/30 hover:border-green-400/50 transition-all duration-300 hover:scale-105">
            <div className="flex items-center justify-center mb-3">
              <div className="p-3 bg-green-500/30 rounded-full">
                <Trophy className="h-8 w-8 text-green-300" />
              </div>
            </div>
            <div className="text-3xl font-bold text-white mb-1">{getTotalScore()}</div>
            <div className="text-green-300 font-medium">Total Score</div>
          </Card>

          <Card className="p-6 text-center bg-gradient-to-br from-purple-500/20 to-purple-600/20 backdrop-blur-xl border border-purple-400/30 hover:border-purple-400/50 transition-all duration-300 hover:scale-105">
            <div className="flex items-center justify-center mb-3">
              <div className="p-3 bg-purple-500/30 rounded-full">
                <Star className="h-8 w-8 text-purple-300" />
              </div>
            </div>
            <div className="text-3xl font-bold text-white mb-1">{getAverageScore()}</div>
            <div className="text-purple-300 font-medium">Average Score</div>
          </Card>
        </div>

        {/* Adventure History Section */}
        <Card className="p-8 bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl border border-white/20 shadow-2xl mb-8 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 via-blue-500/5 to-purple-500/5"></div>
          
          <div className="relative z-10">
            <div className="flex items-center gap-4 mb-6">
              <div className="p-3 bg-gradient-to-r from-purple-500/30 to-blue-500/30 rounded-xl border border-purple-400/30">
                <History className="h-6 w-6 text-purple-300" />
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-white mb-1">Adventure History</h2>
                <p className="text-white/70">Your legendary journey through life scenarios</p>
              </div>
              <Badge className="bg-gradient-to-r from-purple-500/30 to-blue-500/30 text-purple-200 border border-purple-400/30 px-4 py-2">
                <Award className="h-4 w-4 mr-2" />
                {scenarioHistory.length} Completed
              </Badge>
            </div>

            {scenarioHistory.length > 0 ? (
              <div className="space-y-4">
                {scenarioHistory.map((item) => (
                  <Card key={item.id} className="p-6 bg-gradient-to-r from-slate-800/60 to-slate-700/60 backdrop-blur-sm border border-white/10 hover:border-purple-400/30 transition-all duration-300 hover:scale-[1.02]">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h3 className="text-lg font-bold text-white mb-2 hover:text-purple-400 transition-colors">
                          {item.title}
                        </h3>
                        <div className="flex items-center gap-4 text-sm text-white/70">
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-blue-400" />
                            <span>{new Date(item.completedAt).toLocaleDateString()}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Target className="h-4 w-4 text-purple-400" />
                            <span>{item.choices} choices made</span>
                          </div>
                        </div>
                      </div>
                      <Badge className="bg-gradient-to-r from-yellow-500/20 to-orange-500/20 text-yellow-300 border border-yellow-400/30 px-3 py-1">
                        <Trophy className="h-3 w-3 mr-1" />
                        {item.score} pts
                      </Badge>
                    </div>

                    <div className="grid grid-cols-5 gap-3">
                      {Object.entries(item.metrics).map(([metric, value]) => (
                        <div key={metric} className="text-center">
                          <div className="p-2 bg-slate-700/50 rounded-lg border border-white/10 mb-2">
                            {metric === 'health' && <span className="text-red-400 text-lg">❤️</span>}
                            {metric === 'money' && <span className="text-green-400 text-lg">💰</span>}
                            {metric === 'happiness' && <span className="text-yellow-400 text-lg">😊</span>}
                            {metric === 'knowledge' && <span className="text-blue-400 text-lg">🧠</span>}
                            {metric === 'relationships' && <span className="text-purple-400 text-lg">👥</span>}
                          </div>
                          <div className="text-sm font-bold text-white">{value}</div>
                          <div className="text-xs text-white/60 capitalize">{metric}</div>
                        </div>
                      ))}
                    </div>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="p-4 bg-gradient-to-r from-purple-500/20 to-blue-500/20 rounded-full w-20 h-20 mx-auto mb-4 flex items-center justify-center">
                  <Rocket className="h-10 w-10 text-purple-300" />
                </div>
                <h3 className="text-xl font-bold text-white mb-3">Ready for Your First Adventure?</h3>
                <p className="text-white/70 mb-6 max-w-md mx-auto">
                  Start your legendary journey by completing your first life scenario and watch your story unfold!
                </p>
                <Button 
                  onClick={() => navigate('/game')}
                  className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white px-8 py-3 text-lg font-semibold transition-all duration-300 hover:scale-105"
                >
                  <Zap className="h-5 w-5 mr-2" />
                  Begin Your Quest
                  <Sparkles className="h-5 w-5 ml-2" />
                </Button>
              </div>
            )}
          </div>
        </Card>

        {/* Call to Action */}
        <Card className="bg-gradient-to-r from-purple-500/20 to-blue-500/20 border border-purple-400/30 p-8 text-center backdrop-blur-xl shadow-2xl">
          <div className="flex flex-col items-center gap-4">
            <div className="p-4 bg-gradient-to-r from-purple-500/30 to-blue-500/30 rounded-full border border-purple-400/30">
              <Gamepad2 className="h-8 w-8 text-purple-300" />
            </div>
            <div>
              <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent mb-3">
                Continue Your Epic Journey
              </h2>
              <p className="text-white/70 mb-6 max-w-lg mx-auto">
                Each scenario shapes your story. Discover new challenges and make decisions that define your path!
              </p>
              <Button 
                onClick={() => navigate('/game')}
                className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white px-8 py-3 text-lg font-semibold transition-all duration-300 hover:scale-105"
              >
                <Bolt className="h-5 w-5 mr-2" />
                Start New Adventure
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default ProfilePage;
