
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useGameContext } from '@/context/GameContext';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { ScenarioHistory } from '@/lib/firebase';
import ScenarioHistoryDetail from '@/components/ScenarioHistoryDetail';
import ClassroomJoinLink from '@/components/classroom/ClassroomJoinLink';
import StudentClassroomView from '@/components/classroom/StudentClassroomView';
import AchievementSection from '@/components/AchievementSection';
import { 
  User, School, Trophy, History, BarChart, 
  Users, LogOut, BookOpen, Gamepad2, Award, 
  BadgeCheck, BarChart2, Sparkles, Calendar, 
  TrendingUp, LineChart, Play
} from 'lucide-react';

const ProfilePage: React.FC = () => {
  const { userRole } = useGameContext();
  const { userProfile, currentUser, logout, isLoading } = useAuth();
  const navigate = useNavigate();
  const [xpProgress, setXpProgress] = useState(0);
  const [selectedHistory, setSelectedHistory] = useState<ScenarioHistory | null>(null);
  const [isHistoryDetailOpen, setIsHistoryDetailOpen] = useState(false);
  const [expandedHistoryIndex, setExpandedHistoryIndex] = useState<number | null>(null);

  // State for user history
  const [userHistory, setUserHistory] = useState<ScenarioHistory[]>([]);

  useEffect(() => {
    // Redirect to login if not authenticated
    if (!isLoading && !userProfile) {
      navigate('/auth');
    }
  }, [userProfile, isLoading, navigate]);

  useEffect(() => {
    if (userProfile) {
      // Calculate XP progress to next level
      const xpToNextLevel = 1000;
      const progress = ((userProfile.xp || 0) % xpToNextLevel) / xpToNextLevel * 100;
      setXpProgress(progress);
      
      // Set user history
      setUserHistory(userProfile.history || []);
    }
  }, [userProfile]);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  const toggleHistoryExpand = (index: number) => {
    if (expandedHistoryIndex === index) {
      setExpandedHistoryIndex(null);
    } else {
      setExpandedHistoryIndex(index);
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 flex justify-center items-center min-h-[80vh]">
        <div className="text-white text-xl">Loading profile...</div>
      </div>
    );
  }
  
  if (!userProfile) {
    return null; // Redirecting handled in useEffect
  }

  const formatDate = (timestamp: any) => {
    if (!timestamp) return 'Unknown';
    try {
      if (timestamp.seconds) {
        return new Date(timestamp.seconds * 1000).toLocaleDateString();
      }
      if (timestamp instanceof Date) {
        return timestamp.toLocaleDateString();
      }
      return 'Unknown';
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Unknown';
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent mb-6 text-center md:text-left">
        My Profile
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Left column - User Profile */}
        <div className="lg:col-span-1 space-y-6">
          {/* User Card */}
          <Card className="bg-gradient-to-br from-indigo-900/40 to-purple-900/40 border-white/10 backdrop-blur-md overflow-hidden shadow-lg">
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle className="text-2xl text-white">
                  {userProfile?.displayName || (currentUser?.email ? currentUser.email.split('@')[0] : 'User')}
                </CardTitle>
                <Badge className="bg-indigo-500/30 text-indigo-200 border-0">
                  {userRole === 'teacher' ? 'Teacher' : 'Student'}
                </Badge>
              </div>
              <CardDescription className="text-white/70">
                {currentUser?.email}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* XP Level */}
              <div className="bg-black/20 p-3 rounded-lg">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-indigo-300" />
                    <span className="text-white font-medium">Level {userProfile?.level || 1}</span>
                  </div>
                  <Badge className="bg-blue-500/30 text-blue-200 border-0">
                    {userProfile?.xp || 0} XP
                  </Badge>
                </div>
                <div className="mt-2 h-2 bg-black/30 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-indigo-500 to-purple-500"
                    style={{ width: `${((userProfile?.xp || 0) % 100) || 0}%` }}
                  ></div>
                </div>
              </div>

              {/* User Stats */}
              <div className="grid grid-cols-2 gap-2">
                <div className="bg-black/20 p-3 rounded-lg text-center">
                  <div className="text-lg font-semibold text-white">
                    {userProfile?.completedScenarios?.length || 0}
                  </div>
                  <div className="text-xs text-white/70">Scenarios Completed</div>
                </div>
                <div className="bg-black/20 p-3 rounded-lg text-center">
                  <div className="text-lg font-semibold text-white">
                    {userProfile?.badges?.length || 0}
                  </div>
                  <div className="text-xs text-white/70">Badges Earned</div>
                </div>
              </div>

              {/* Current Metrics */}
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <LineChart className="h-4 w-4 text-indigo-300" />
                  <h3 className="text-white font-medium">Current Stats</h3>
                </div>
                {userProfile?.metrics ? (
                  <div className="grid grid-cols-2 gap-2">
                    {Object.entries(userProfile.metrics).map(([key, value]) => (
                      <div key={key} className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-indigo-400"></div>
                        <span className="text-sm text-white/90 capitalize">{key}:</span>
                        <span className="text-sm font-medium text-white">{String(value)}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-sm text-white/50 text-center py-2">
                    No stats available yet
                  </div>
                )}
              </div>
            </CardContent>
            
            <CardFooter className="border-t border-white/10 pt-4">
              <Button className="w-full bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600" onClick={handleLogout}>
                <LogOut className="mr-2 h-4 w-4" />
                Log Out
              </Button>
            </CardFooter>
          </Card>

          {/* Badges Section */}
          <AchievementSection userProfile={userProfile} />
        </div>

        {/* Right column - Scenario History and Classes */}
        <div className="lg:col-span-2 space-y-6">
          {/* User's Classrooms */}
          {userRole === 'student' && (
            <Card className="bg-gradient-to-br from-indigo-900/40 to-purple-900/40 border-white/10 backdrop-blur-md overflow-hidden shadow-lg">
              <CardHeader className="pb-2">
                <CardTitle className="text-xl text-white flex items-center gap-2">
                  <School className="h-5 w-5 text-indigo-300" />
                  My Classrooms
                </CardTitle>
              </CardHeader>
              <CardContent>
                <StudentClassroomView />
              </CardContent>
              <CardFooter className="border-t border-white/10 pt-4">
                <ClassroomJoinLink />
              </CardFooter>
            </Card>
          )}
        
          {/* Scenario History */}
          <Card className="bg-gradient-to-br from-indigo-900/40 to-purple-900/40 border-white/10 backdrop-blur-md overflow-hidden shadow-lg">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-xl text-white flex items-center gap-2">
                  <History className="h-5 w-5 text-indigo-300" />
                  Scenario History
                </CardTitle>
              </div>
              <CardDescription className="text-white/70">
                Your previously completed scenarios
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-4">
              {userHistory && userHistory.length > 0 ? (
                <div className="space-y-4 max-h-[400px] overflow-y-auto pr-1">
                  {userHistory.map((history, index) => (
                    <ScenarioHistoryDetail key={index} history={history} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 bg-black/20 rounded-lg">
                  <BookOpen className="h-12 w-12 text-white/30 mx-auto mb-2" />
                  <h3 className="text-white font-medium">No Completed Scenarios</h3>
                  <p className="text-white/70 mt-1 max-w-xs mx-auto">
                    Complete your first scenario to see your history here.
                  </p>
                  <Button className="mt-4 bg-indigo-600 hover:bg-indigo-700" onClick={() => navigate('/')}>
                    <Play className="mr-2 h-4 w-4" />
                    Start a Scenario
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
