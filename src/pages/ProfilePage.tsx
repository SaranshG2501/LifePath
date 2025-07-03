
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { School, Users, User, Calendar, BookOpen, Play, LogOut, Star, Trophy, Clock, GraduationCap, Award, TrendingUp, Sparkles } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { getUserClassrooms, getClassrooms, Classroom, convertTimestampToDate, Timestamp } from '@/lib/firebase';
import { ScenarioHistory } from '@/lib/firebase';
import ScenarioHistoryDetail from '@/components/ScenarioHistoryDetail';
import ProfileStats from '@/components/profile/ProfileStats';

const ProfilePage = () => {
  const { userProfile, currentUser, logout } = useAuth();
  const [classrooms, setClassrooms] = useState<Classroom[]>([]);
  const [loadingClassrooms, setLoadingClassrooms] = useState(true);
  const [scenarioHistory, setScenarioHistory] = useState<ScenarioHistory[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [selectedHistory, setSelectedHistory] = useState<ScenarioHistory | null>(null);
  const [isHistoryDialogOpen, setIsHistoryDialogOpen] = useState(false);

  useEffect(() => {
    if (currentUser && userProfile) {
      fetchClassrooms();
      loadScenarioHistory();
    }
  }, [currentUser, userProfile]);

  const fetchClassrooms = async () => {
    if (!currentUser || !userProfile) return;
    
    try {
      setLoadingClassrooms(true);
      let userClassrooms: Classroom[] = [];
      
      if (userProfile.role === 'student') {
        userClassrooms = await getUserClassrooms(currentUser.uid, 'student');
      } else if (userProfile.role === 'teacher') {
        userClassrooms = await getClassrooms(currentUser.uid);
      }
      
      setClassrooms(userClassrooms);
    } catch (error) {
      console.error('Error fetching classrooms:', error);
    } finally {
      setLoadingClassrooms(false);
    }
  };

  const loadScenarioHistory = async () => {
    if (!currentUser) return;
    try {
      setLoadingHistory(true);
      // Since getUserScenarioHistory doesn't exist, we'll use mock data for now
      const mockHistory: ScenarioHistory[] = [
        {
          scenarioId: 'financial-literacy',
          scenarioTitle: 'Financial Literacy Challenge',
          startedAt: new Date(Date.now() - 172800000),
          completedAt: new Date(Date.now() - 172800000 + 3600000),
          choices: [
            {
              sceneId: 'scene1',
              choiceId: 'choice1',
              choiceText: 'Invest in index funds for long-term growth',
              timestamp: new Date(Date.now() - 172800000 + 900000),
              metricChanges: { money: 50, knowledge: 15 }
            },
            {
              sceneId: 'scene2',
              choiceId: 'choice2',
              choiceText: 'Open a high-yield savings account',
              timestamp: new Date(Date.now() - 172800000 + 1800000),
              metricChanges: { money: 20, happiness: 10 }
            }
          ],
          finalMetrics: { health: 85, money: 120, happiness: 80, knowledge: 95, relationships: 75 }
        }
      ];
      setScenarioHistory(mockHistory);
    } catch (error) {
      console.error("Error fetching scenario history:", error);
    } finally {
      setLoadingHistory(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  const openHistoryDialog = (history: ScenarioHistory) => {
    setSelectedHistory(history);
    setIsHistoryDialogOpen(true);
  };

  const closeHistoryDialog = () => {
    setIsHistoryDialogOpen(false);
    setSelectedHistory(null);
  };

  const formatDate = (dateValue: Date | Timestamp): string => {
    if (dateValue instanceof Date) {
      return dateValue.toLocaleDateString();
    }
    return convertTimestampToDate(dateValue).toLocaleDateString();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900/80 to-indigo-900">
      <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width=\"60\" height=\"60\" viewBox=\"0 0 60 60\" xmlns=\"http://www.w3.org/2000/svg\"%3E%3Cg fill=\"none\" fill-rule=\"evenodd\"%3E%3Cg fill=\"%23A566FF\" fill-opacity=\"0.03\"%3E%3Cpath d=\"M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-10"></div>
      
      <div className="container mx-auto px-4 py-8 max-w-7xl relative z-10">
        {/* Enhanced Header */}
        <div className="flex flex-col sm:flex-row justify-between items-center mb-10">
          <div className="text-center sm:text-left mb-4 sm:mb-0">
            <h1 className="text-6xl font-black bg-gradient-to-r from-neon-blue via-neon-purple to-neon-pink bg-clip-text text-transparent mb-3 drop-shadow-2xl animate-float">
              My Profile
            </h1>
            <p className="text-slate-300 text-lg font-medium">Level up your journey & flex your achievements 🚀</p>
          </div>
          <Button 
            onClick={handleLogout}
            variant="outline" 
            className="border-red-400/60 bg-gradient-to-r from-red-900/40 to-red-800/40 text-red-300 hover:bg-gradient-to-r hover:from-red-800/60 hover:to-red-700/60 hover:border-red-300/80 transition-all duration-300 px-6 py-3 shadow-lg hover:shadow-red-500/20 rounded-xl font-semibold"
          >
            <LogOut className="h-5 w-5 mr-2" />
            Logout
          </Button>
        </div>

        {/* Enhanced User Profile Card */}
        {userProfile && (
          <Card className="bg-gradient-to-br from-slate-800/90 to-slate-700/90 border-2 border-neon-purple/40 backdrop-blur-xl mb-8 shadow-2xl shadow-neon-purple/20 overflow-hidden relative rounded-3xl">
            <div className="absolute inset-0 bg-gradient-to-r from-neon-blue/5 via-neon-purple/10 to-neon-pink/5"></div>
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-neon-blue via-neon-purple to-neon-pink"></div>
            
            <CardHeader className="relative pb-8">
              <div className="flex flex-col sm:flex-row items-center gap-8">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-neon-purple to-neon-pink rounded-full blur-lg opacity-75 animate-pulse"></div>
                  <Avatar className="h-28 w-28 border-4 border-neon-purple/60 shadow-2xl shadow-neon-purple/30 relative z-10">
                    <AvatarFallback className="bg-gradient-to-br from-neon-purple/80 to-neon-pink/80 text-white text-3xl font-black">
                      {userProfile.username?.charAt(0)?.toUpperCase() || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="absolute -bottom-3 -right-3 bg-gradient-to-r from-neon-yellow to-neon-pink rounded-full p-3 animate-bounce shadow-lg">
                    <Sparkles className="h-5 w-5 text-white" />
                  </div>
                </div>
                
                <div className="flex-1 text-center sm:text-left">
                  <div className="text-white font-black text-4xl mb-3 drop-shadow-lg">{userProfile.username}</div>
                  <div className="text-slate-200 text-xl mb-6 font-medium">{userProfile.email}</div>
                  
                  <div className="flex flex-wrap justify-center sm:justify-start items-center gap-4">
                    <Badge className="bg-gradient-to-r from-neon-blue/30 to-neon-purple/30 text-neon-blue border-2 border-neon-blue/40 px-6 py-3 text-base font-bold shadow-lg rounded-xl hover:scale-105 transition-transform">
                      <GraduationCap className="h-5 w-5 mr-2" />
                      {userProfile.role}
                    </Badge>
                    
                    <div className="flex items-center gap-3 bg-gradient-to-r from-neon-yellow/20 to-neon-pink/20 rounded-2xl px-6 py-3 border-2 border-neon-yellow/40 shadow-lg hover:scale-105 transition-transform">
                      <Trophy className="h-5 w-5 text-neon-yellow animate-bounce" />
                      <span className="text-neon-yellow font-black text-lg">Level {userProfile.level || 1}</span>
                    </div>
                    
                    <div className="flex items-center gap-3 bg-gradient-to-r from-neon-green/20 to-neon-blue/20 rounded-2xl px-6 py-3 border-2 border-neon-green/40 shadow-lg hover:scale-105 transition-transform">
                      <TrendingUp className="h-5 w-5 text-neon-green" />
                      <span className="text-neon-green font-bold text-lg">{userProfile.xp || 0} XP</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardHeader>
          </Card>
        )}

        {/* Enhanced Stats Overview */}
        <ProfileStats 
          scenarioHistory={scenarioHistory}
          userLevel={userProfile?.level || 1}
          userXp={userProfile?.xp || 0}
        />

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
          {/* Enhanced Classrooms Section */}
          <Card className="bg-gradient-to-br from-slate-800/90 to-slate-700/90 border-2 border-neon-green/40 backdrop-blur-xl shadow-2xl shadow-neon-green/20 rounded-3xl overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-neon-green to-neon-blue"></div>
            
            <CardHeader className="pb-6">
              <CardTitle className="text-white flex items-center gap-4 text-2xl font-black">
                <div className="p-3 bg-gradient-to-r from-neon-green/30 to-neon-blue/30 rounded-2xl border-2 border-neon-green/40 shadow-lg">
                  <School className="h-7 w-7 text-neon-green" />
                </div>
                My Classrooms
                <Badge className="bg-gradient-to-r from-neon-green/20 to-neon-blue/20 text-neon-green border-2 border-neon-green/40 px-4 py-2 font-bold rounded-xl">
                  {classrooms.length}
                </Badge>
              </CardTitle>
              <CardDescription className="text-slate-300 text-lg font-medium">
                {userProfile?.role === 'student' 
                  ? "Your learning squads & active adventures 🎯"
                  : "Classrooms you're crushing it with 💪"
                }
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loadingClassrooms ? (
                <div className="text-center py-16">
                  <div className="animate-spin rounded-full h-16 w-16 border-4 border-neon-green border-t-transparent mx-auto mb-6"></div>
                  <div className="text-slate-300 text-xl font-medium">Loading your classrooms...</div>
                </div>
              ) : classrooms.length > 0 ? (
                <div className="space-y-6 max-h-96 overflow-y-auto pr-2">
                  {classrooms.map((classroom) => (
                    <div key={classroom.id} className="bg-gradient-to-r from-slate-700/80 to-slate-600/80 rounded-2xl p-6 border-2 border-neon-green/20 hover:border-neon-green/50 transition-all duration-300 group hover:shadow-lg hover:shadow-neon-green/20 hover:scale-[1.02]">
                      <div className="flex justify-between items-start mb-5">
                        <div className="flex-1">
                          <h3 className="text-white font-black text-xl mb-2 group-hover:text-neon-green transition-colors">
                            {classroom.name}
                          </h3>
                          {classroom.description && (
                            <p className="text-slate-300 text-base line-clamp-2 mb-3 font-medium">{classroom.description}</p>
                          )}
                        </div>
                        <Badge className="bg-gradient-to-r from-neon-green/30 to-neon-blue/30 text-neon-green border-2 border-neon-green/40 ml-4 px-4 py-2 font-bold rounded-xl">
                          🔥 Active
                        </Badge>
                      </div>
                      
                      <Separator className="bg-slate-600/50 my-4" />
                      
                      <div className="grid grid-cols-2 gap-6">
                        <div className="flex items-center gap-3 text-neon-blue">
                          <Users className="h-5 w-5" />
                          <span className="font-bold text-base">{classroom.students?.length || 0} students</span>
                        </div>
                        <div className="flex items-center gap-3 text-neon-purple">
                          <Calendar className="h-5 w-5" />
                          <span className="font-medium">
                            {classroom.createdAt ? formatDate(classroom.createdAt) : 'Recently'}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-16">
                  <div className="p-6 bg-gradient-to-r from-slate-700/60 to-slate-600/60 rounded-full w-fit mx-auto mb-6 border-2 border-slate-600/40">
                    <School className="h-16 w-16 text-slate-400" />
                  </div>
                  <div className="text-slate-300 mb-3 text-2xl font-bold">
                    {userProfile?.role === 'student' 
                      ? "No squads joined yet! 🤷‍♀️"
                      : "No classrooms created yet! 📚"
                    }
                  </div>
                  <div className="text-slate-400 text-lg">
                    {userProfile?.role === 'student' 
                      ? "Get that class code and join the fun! 🎉"
                      : "Create your first classroom and start teaching! 🚀"
                    }
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Enhanced Scenario History Section */}
          <Card className="bg-gradient-to-br from-slate-800/90 to-slate-700/90 border-2 border-neon-purple/40 backdrop-blur-xl shadow-2xl shadow-neon-purple/20 rounded-3xl overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-neon-purple to-neon-pink"></div>
            
            <CardHeader className="pb-6">
              <CardTitle className="text-white flex items-center gap-4 text-2xl font-black">
                <div className="p-3 bg-gradient-to-r from-neon-purple/30 to-neon-pink/30 rounded-2xl border-2 border-neon-purple/40 shadow-lg">
                  <Trophy className="h-7 w-7 text-neon-purple animate-bounce" />
                </div>
                Learning History
                <Badge className="bg-gradient-to-r from-neon-purple/20 to-neon-pink/20 text-neon-purple border-2 border-neon-purple/40 px-4 py-2 font-bold rounded-xl">
                  {scenarioHistory.length}
                </Badge>
              </CardTitle>
              <CardDescription className="text-slate-300 text-lg font-medium">
                Your epic wins & legendary achievements 🏆✨
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loadingHistory ? (
                <div className="text-center py-16">
                  <div className="animate-spin rounded-full h-16 w-16 border-4 border-neon-purple border-t-transparent mx-auto mb-6"></div>
                  <div className="text-slate-300 text-xl font-medium">Loading your epic history...</div>
                </div>
              ) : scenarioHistory.length > 0 ? (
                <div className="space-y-6 max-h-96 overflow-y-auto pr-2">
                  {scenarioHistory.map((history, index) => (
                    <div key={index} className="bg-gradient-to-r from-slate-700/80 to-slate-600/80 rounded-2xl p-6 border-2 border-neon-purple/20 hover:border-neon-purple/50 transition-all duration-300 group hover:shadow-lg hover:shadow-neon-purple/20 hover:scale-[1.02]">
                      <div className="flex justify-between items-start mb-5">
                        <div className="flex-1">
                          <h3 className="text-white font-black text-xl mb-3 group-hover:text-neon-purple transition-colors">
                            {history.scenarioTitle}
                          </h3>
                          <div className="flex items-center gap-3 text-slate-300 mb-4">
                            <Clock className="h-4 w-4" />
                            <span className="font-medium">
                              Completed {history.completedAt ? formatDate(history.completedAt) : 'Recently'} 🎯
                            </span>
                          </div>
                        </div>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => openHistoryDialog(history)} 
                          className="border-2 border-neon-purple/40 bg-gradient-to-r from-neon-purple/20 to-neon-pink/20 text-neon-purple hover:bg-gradient-to-r hover:from-neon-purple/30 hover:to-neon-pink/30 hover:border-neon-purple/60 transition-all shadow-lg hover:shadow-neon-purple/30 font-bold rounded-xl px-6 py-3"
                        >
                          View Details ✨
                        </Button>
                      </div>
                      
                      <Separator className="bg-slate-600/50 my-4" />
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-6">
                          <span className="text-neon-green font-bold text-base">
                            🎯 {history.choices?.length || 0} decisions
                          </span>
                          {history.finalMetrics && (
                            <span className="text-neon-yellow font-bold text-base">
                              💯 Score: {Object.values(history.finalMetrics).reduce((a, b) => a + b, 0)}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2 bg-gradient-to-r from-neon-yellow/20 to-neon-pink/20 rounded-xl px-4 py-2 border border-neon-yellow/40">
                          <Star className="h-5 w-5 text-neon-yellow animate-pulse" />
                          <span className="text-neon-yellow font-black text-lg">
                            {history.finalMetrics ? Math.round(Object.values(history.finalMetrics).reduce((a, b) => a + b, 0) / 5) : 0}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-16">
                  <div className="p-6 bg-gradient-to-r from-slate-700/60 to-slate-600/60 rounded-full w-fit mx-auto mb-6 border-2 border-slate-600/40">
                    <BookOpen className="h-16 w-16 text-slate-400" />
                  </div>
                  <div className="text-slate-300 mb-3 text-2xl font-bold">No epic adventures yet! 🎮</div>
                  <div className="text-slate-400 text-lg">Start playing scenarios to build your legend! 🚀</div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <ScenarioHistoryDetail
          history={selectedHistory}
          open={isHistoryDialogOpen}
          onClose={closeHistoryDialog}
        />
      </div>
    </div>
  );
};

export default ProfilePage;
