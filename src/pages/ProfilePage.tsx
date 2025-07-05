
import React, { useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useGameContext } from '@/context/GameContext';
import HistoryCard from '@/components/profile/HistoryCard';
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
  Sparkles
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
      <div className="container mx-auto px-4 py-4 animate-fade-in">
        <div className="flex justify-center items-center min-h-screen">
          <div className="text-center">
            <div className="relative">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-neon-blue/30 border-t-neon-blue mx-auto mb-3"></div>
              <div className="absolute inset-0 animate-ping rounded-full h-12 w-12 border-2 border-neon-purple/20 mx-auto"></div>
            </div>
            <p className="text-white/80 text-sm font-bold flex items-center justify-center gap-2">
              <Zap className="h-4 w-4 text-neon-blue animate-pulse" />
              Loading your epic profile...
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-3 py-3 animate-fade-in min-h-screen bg-gradient-to-br from-slate-900 via-purple-900/10 to-slate-800">
      {/* Background elements */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-10 left-5 w-16 h-16 bg-gradient-to-r from-neon-blue/6 to-neon-purple/6 rounded-full blur-2xl animate-float"></div>
        <div className="absolute bottom-10 right-5 w-20 h-20 bg-gradient-to-r from-neon-pink/6 to-neon-yellow/6 rounded-full blur-2xl animate-pulse-slow"></div>
      </div>

      <div className="relative z-10 max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-4">
          <Button 
            variant="ghost" 
            onClick={() => navigate('/')} 
            className="flex items-center gap-2 text-sm"
          >
            <ArrowLeft size={16} />
            Back to Home
          </Button>
          
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              onClick={handleRefreshHistory}
              className="flex items-center gap-2 text-xs px-4 py-2"
            >
              <RefreshCw className="h-3 w-3" />
              Refresh
            </Button>
            
            <Button 
              variant="outline" 
              onClick={handleLogout}
              className="flex items-center gap-2 text-xs px-4 py-2 border-red-400/50 text-red-300 hover:border-red-300/70"
            >
              <LogOut className="h-3 w-3" />
              Logout
            </Button>
          </div>
        </div>

        {/* Profile Header */}
        <Card className="p-4 text-center bg-gradient-to-br from-slate-800/90 to-slate-700/90 border-2 border-neon-purple/40 shadow-lg rounded-xl mb-4">
          <div className="flex flex-col items-center gap-2">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-neon-blue via-neon-purple to-neon-pink rounded-full blur-xl opacity-50"></div>
              <div className="relative w-12 h-12 bg-gradient-to-r from-neon-blue/30 to-neon-purple/30 rounded-full flex items-center justify-center border-2 border-neon-purple/60">
                <User className="h-6 w-6 text-neon-blue" />
              </div>
            </div>
            
            <div>
              <h1 className="text-lg font-black gradient-heading flex items-center justify-center gap-2">
                <Crown className="h-4 w-4 text-neon-yellow" />
                {userProfile?.displayName || 'Epic Hero'}
                <Gem className="h-4 w-4 text-neon-pink" />
              </h1>
              <div className="flex items-center justify-center gap-2 text-xs">
                <Shield className="h-3 w-3 text-neon-purple" />
                <span className="text-neon-purple font-bold">{getUserRoleDisplay()}</span>
              </div>
            </div>
          </div>
        </Card>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 mb-4">
          <Card className="p-3 text-center bg-gradient-to-br from-slate-800/90 to-slate-700/90 border border-neon-blue/30">
            <div className="text-lg font-bold text-white">{scenarioHistory.length}</div>
            <div className="text-xs text-neon-blue font-medium">Completed</div>
          </Card>
          <Card className="p-3 text-center bg-gradient-to-br from-slate-800/90 to-slate-700/90 border border-neon-green/30">
            <div className="text-lg font-bold text-white">{getTotalScore()}</div>
            <div className="text-xs text-neon-green font-medium">Total Score</div>
          </Card>
          <Card className="p-3 text-center bg-gradient-to-br from-slate-800/90 to-slate-700/90 border border-neon-purple/30">
            <div className="text-lg font-bold text-white">{getAverageScore()}</div>
            <div className="text-xs text-neon-purple font-medium">Average</div>
          </Card>
        </div>

        {/* History Section */}
        {scenarioHistory.length > 0 ? (
          <Card className="p-4 bg-gradient-to-br from-slate-800/90 to-slate-700/90 border-2 border-neon-blue/40 shadow-lg rounded-xl mb-4">
            <div className="flex items-center gap-2 mb-3">
              <div className="p-1 bg-gradient-to-r from-neon-blue/25 to-neon-purple/25 rounded-lg border border-neon-blue/50">
                <History className="h-4 w-4 text-neon-blue" />
              </div>
              <div className="flex-1">
                <h2 className="text-sm font-black text-white">Your Epic Adventures</h2>
              </div>
              <Badge className="bg-gradient-to-r from-neon-blue/30 to-neon-purple/30 text-neon-blue border border-neon-blue/50 px-2 py-1 text-xs">
                <Zap className="h-2 w-2 mr-1" />
                {scenarioHistory.length} COMPLETED
              </Badge>
            </div>

            <div className="space-y-2">
              {scenarioHistory.map((item) => (
                <HistoryCard key={item.id} item={item} />
              ))}
            </div>
          </Card>
        ) : (
          <Card className="p-6 text-center bg-gradient-to-br from-slate-800/90 to-slate-700/90 border-2 border-neon-blue/40 shadow-lg rounded-xl mb-4">
            <div className="flex flex-col items-center gap-3">
              <div className="p-3 bg-gradient-to-r from-neon-blue/25 to-neon-purple/25 rounded-full border border-neon-blue/50">
                <History className="h-6 w-6 text-neon-blue" />
              </div>
              <div>
                <h2 className="text-base font-bold text-white mb-2 flex items-center justify-center gap-2">
                  No Epic Adventures Yet!
                  <Rocket className="h-4 w-4 text-neon-cyan" />
                </h2>
                <p className="text-white/70 mb-4 text-sm">
                  Start your first legendary scenario to see your epic journey unfold here.
                </p>
                <Button 
                  onClick={() => navigate('/game')}
                  className="px-6 py-2 text-sm"
                >
                  <Zap className="h-4 w-4 mr-2" />
                  Start Your First Quest
                  <Sparkles className="h-4 w-4 ml-2" />
                </Button>
              </div>
            </div>
          </Card>
        )}

        {/* Call to Action */}
        <Card className="bg-gradient-to-r from-neon-purple/15 to-neon-pink/15 border-2 border-neon-purple/40 p-4 text-center rounded-xl shadow-lg">
          <div className="flex flex-col items-center gap-3">
            <div className="p-2 bg-gradient-to-r from-neon-purple/25 to-neon-pink/25 rounded-full border border-neon-purple/50">
              <Gamepad2 className="h-5 w-5 text-neon-purple" />
            </div>
            <div>
              <h2 className="text-base font-bold gradient-heading mb-2">Ready for Your Next Adventure?</h2>
              <p className="text-white/70 mb-3 text-sm">
                Jump back into LifePath and continue your legendary journey!
              </p>
              <Button 
                onClick={() => navigate('/game')}
                className="px-6 py-2 text-sm"
              >
                <Bolt className="h-4 w-4 mr-2" />
                Start New Scenario
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default ProfilePage;
