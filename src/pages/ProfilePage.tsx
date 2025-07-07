
import React from 'react';
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
  Crown,
  Shield,
  LogOut,
  RefreshCw,
  Target,
  Heart,
  DollarSign,
  Users,
  Brain,
  Smile
} from 'lucide-react';
import { ProfileStats } from '@/components/profile/ProfileStats';
import { HistoryCard } from '@/components/profile/HistoryCard';

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

  // Convert scenarioHistory to match ProfileStats expected format
  const convertedHistory = scenarioHistory.map(item => ({
    scenarioId: item.scenarioId,
    scenarioTitle: item.title,
    startedAt: new Date(item.completedAt),
    completedAt: new Date(item.completedAt),
    choices: [],
    finalMetrics: item.metrics
  }));

  if (isHistoryLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-purple-500/30 border-t-purple-500 mx-auto mb-4"></div>
          <p className="text-white/80 text-lg">Loading your profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <Button 
            variant="outline" 
            onClick={() => navigate('/')} 
            className="text-white border-white/20 hover:border-purple-400 hover:bg-purple-500/20"
          >
            <ArrowLeft size={16} className="mr-2" />
            Back to Home
          </Button>
          
          <div className="flex items-center gap-3">
            <Button 
              variant="outline" 
              onClick={handleRefreshHistory}
              className="text-white border-white/20 hover:border-blue-400 hover:bg-blue-500/20"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
            
            <Button 
              variant="outline" 
              onClick={handleLogout}
              className="text-white border-red-400/50 hover:border-red-400 hover:bg-red-500/20"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>

        {/* Profile Header */}
        <Card className="p-6 mb-8 bg-slate-800/50 border-slate-700">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center">
              <User className="h-8 w-8 text-white" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-2xl font-bold text-white">
                  {userProfile?.displayName || 'Epic Hero'}
                </h1>
                <Crown className="h-5 w-5 text-yellow-400" />
              </div>
              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4 text-purple-400" />
                <span className="text-purple-300">{getUserRoleDisplay()}</span>
              </div>
            </div>
          </div>
        </Card>

        {/* Stats Section */}
        <ProfileStats 
          scenarioHistory={convertedHistory} 
          userLevel={1} 
          userXp={0} 
        />

        {/* Adventure History */}
        <Card className="p-6 bg-slate-800/50 border-slate-700">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <Trophy className="h-6 w-6 text-purple-400" />
              <div>
                <h2 className="text-xl font-bold text-white">Adventure History</h2>
                <p className="text-slate-400">Your completed scenarios</p>
              </div>
            </div>
            <Badge variant="secondary" className="bg-purple-500/20 text-purple-300">
              {scenarioHistory.length} Completed
            </Badge>
          </div>

          {scenarioHistory.length > 0 ? (
            <div className="grid gap-4">
              {scenarioHistory.map((item) => (
                <HistoryCard key={item.id} item={item} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Target className="h-16 w-16 text-slate-500 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-white mb-2">No Adventures Yet</h3>
              <p className="text-slate-400 mb-6">Complete your first scenario to see your progress here</p>
              <Button 
                onClick={() => navigate('/game')}
                className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600"
              >
                Start Your First Adventure
              </Button>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};

export default ProfilePage;
