
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
import ProfileStats from '@/components/profile/ProfileStats';

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
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900/20 to-blue-900/30 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-purple-500/30 border-t-purple-500 mx-auto mb-4"></div>
          <p className="text-white/80 text-lg">Loading your profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900/20 to-blue-900/30 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <Button 
            variant="outline" 
            onClick={() => navigate('/')} 
            className="text-white border-white/20 hover:border-purple-400 hover:bg-purple-500/20 backdrop-blur-sm"
          >
            <ArrowLeft size={16} className="mr-2" />
            Back to Home
          </Button>
          
          <div className="flex items-center gap-3">
            <Button 
              variant="outline" 
              onClick={handleRefreshHistory}
              className="text-white border-white/20 hover:border-blue-400 hover:bg-blue-500/20 backdrop-blur-sm"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
            
            <Button 
              variant="outline" 
              onClick={handleLogout}
              className="text-white border-red-400/50 hover:border-red-400 hover:bg-red-500/20 backdrop-blur-sm"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>

        {/* Profile Hero Section */}
        <div className="relative mb-12">
          <div className="absolute inset-0 bg-gradient-to-r from-purple-600/20 via-blue-600/20 to-pink-600/20 rounded-3xl blur-xl"></div>
          <Card className="relative p-8 bg-gradient-to-br from-slate-800/90 via-slate-800/80 to-slate-900/90 border-2 border-purple-500/30 backdrop-blur-xl rounded-3xl">
            <div className="flex items-center gap-6">
              <div className="relative">
                <div className="w-20 h-20 bg-gradient-to-r from-purple-500 via-blue-500 to-pink-500 rounded-full flex items-center justify-center p-1">
                  <div className="w-full h-full bg-slate-800 rounded-full flex items-center justify-center">
                    <User className="h-10 w-10 text-white" />
                  </div>
                </div>
                <div className="absolute -top-2 -right-2">
                  <Crown className="h-8 w-8 text-yellow-400 drop-shadow-lg" />
                </div>
              </div>
              
              <div className="flex-1">
                <div className="flex items-center gap-4 mb-3">
                  <h1 className="text-3xl font-black text-white bg-gradient-to-r from-purple-400 via-blue-400 to-pink-400 bg-clip-text text-transparent">
                    {userProfile?.displayName || 'Epic Hero'}
                  </h1>
                  <Badge className="bg-gradient-to-r from-purple-500/20 to-blue-500/20 text-purple-300 border-purple-500/30 px-3 py-1">
                    <Shield className="h-4 w-4 mr-2" />
                    {getUserRoleDisplay()}
                  </Badge>
                </div>
                
                <p className="text-slate-300 text-lg">
                  Welcome to your adventure dashboard! 🚀
                </p>
              </div>
            </div>
          </Card>
        </div>

        {/* Stats Section */}
        <ProfileStats 
          scenarioHistory={convertedHistory} 
          userLevel={1} 
          userXp={0} 
        />

        {/* Quick Actions */}
        <Card className="p-6 bg-gradient-to-br from-slate-800/90 via-slate-800/80 to-slate-900/90 border-2 border-blue-500/30 backdrop-blur-xl rounded-3xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-xl">
                <Target className="h-6 w-6 text-blue-400" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">Ready for Adventure?</h3>
                <p className="text-slate-400">Start a new scenario and continue your journey!</p>
              </div>
            </div>
            
            <Button 
              onClick={() => navigate('/game')}
              className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white border-0 px-8 py-3 text-lg font-bold shadow-lg hover:shadow-purple-500/25"
            >
              <Star className="h-5 w-5 mr-2" />
              Start Adventure
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default ProfilePage;
