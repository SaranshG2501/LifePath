
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { School, Users, User, Calendar, BookOpen, Play, LogOut, Star, Trophy, Clock, GraduationCap, Award, TrendingUp } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { getUserClassrooms, getClassrooms, Classroom, convertTimestampToDate, Timestamp } from '@/lib/firebase';
import { ScenarioHistory } from '@/lib/firebase';
import ScenarioHistoryDetail from '@/components/ScenarioHistoryDetail';

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
            },
            {
              sceneId: 'scene3',
              choiceId: 'choice1',
              choiceText: 'Create a monthly budget plan',
              timestamp: new Date(Date.now() - 172800000 + 2700000),
              metricChanges: { knowledge: 25, relationships: 5 }
            }
          ],
          finalMetrics: { health: 85, money: 120, happiness: 80, knowledge: 95, relationships: 75 }
        },
        {
          scenarioId: 'career-decision',
          scenarioTitle: 'Career Path Explorer',
          startedAt: new Date(Date.now() - 86400000),
          completedAt: new Date(Date.now() - 86400000 + 2700000),
          choices: [
            {
              sceneId: 'scene1',
              choiceId: 'choice2',
              choiceText: 'Pursue higher education in computer science',
              timestamp: new Date(Date.now() - 86400000 + 900000),
              metricChanges: { knowledge: 30, money: -15 }
            },
            {
              sceneId: 'scene2',
              choiceId: 'choice1',
              choiceText: 'Network with industry professionals',
              timestamp: new Date(Date.now() - 86400000 + 1800000),
              metricChanges: { relationships: 20, happiness: 15 }
            }
          ],
          finalMetrics: { health: 78, money: 85, happiness: 90, knowledge: 110, relationships: 85 }
        },
        {
          scenarioId: 'health-wellness',
          scenarioTitle: 'Wellness Journey',
          startedAt: new Date(Date.now() - 259200000),
          completedAt: new Date(Date.now() - 259200000 + 5400000),
          choices: [
            {
              sceneId: 'scene1',
              choiceId: 'choice1',
              choiceText: 'Join a local gym and start regular workouts',
              timestamp: new Date(Date.now() - 259200000 + 1800000),
              metricChanges: { health: 25, happiness: 10 }
            },
            {
              sceneId: 'scene2',
              choiceId: 'choice2',
              choiceText: 'Adopt a balanced diet with meal planning',
              timestamp: new Date(Date.now() - 259200000 + 3600000),
              metricChanges: { health: 20, knowledge: 10 }
            }
          ],
          finalMetrics: { health: 105, money: 95, happiness: 85, knowledge: 80, relationships: 70 }
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

  const getTotalScore = () => {
    return scenarioHistory.reduce((total, history) => {
      if (history.finalMetrics) {
        return total + Object.values(history.finalMetrics).reduce((a, b) => a + b, 0);
      }
      return total;
    }, 0);
  };

  const getAverageScore = () => {
    if (scenarioHistory.length === 0) return 0;
    return Math.round(getTotalScore() / scenarioHistory.length);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Enhanced Header */}
        <div className="flex flex-col sm:flex-row justify-between items-center mb-10">
          <div className="text-center sm:text-left mb-4 sm:mb-0">
            <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent mb-3">
              My Profile
            </h1>
            <p className="text-slate-300 text-lg">Track your learning journey and celebrate your achievements</p>
          </div>
          <Button 
            onClick={handleLogout}
            variant="outline" 
            className="border-red-500/40 bg-red-900/30 text-red-300 hover:bg-red-800/40 hover:border-red-400/60 transition-all duration-200 px-6 py-3"
          >
            <LogOut className="h-5 w-5 mr-2" />
            Logout
          </Button>
        </div>

        {/* Enhanced User Profile Card */}
        {userProfile && (
          <Card className="bg-gradient-to-r from-slate-800/60 to-slate-700/60 border-slate-600/50 backdrop-blur-lg mb-8 shadow-2xl overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 via-purple-500/5 to-pink-500/5"></div>
            <CardHeader className="relative pb-6">
              <div className="flex flex-col sm:flex-row items-center gap-6">
                <div className="relative">
                  <Avatar className="h-24 w-24 border-4 border-gradient-to-r from-blue-500/50 to-purple-500/50 shadow-2xl">
                    <AvatarFallback className="bg-gradient-to-br from-purple-500/40 to-blue-500/40 text-white text-2xl font-bold">
                      {userProfile.username?.charAt(0)?.toUpperCase() || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="absolute -bottom-2 -right-2 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full p-2">
                    <Star className="h-4 w-4 text-white" />
                  </div>
                </div>
                
                <div className="flex-1 text-center sm:text-left">
                  <div className="text-white font-bold text-3xl mb-2">{userProfile.username}</div>
                  <div className="text-slate-300 text-lg mb-4">{userProfile.email}</div>
                  
                  <div className="flex flex-wrap justify-center sm:justify-start items-center gap-4">
                    <Badge className="bg-gradient-to-r from-blue-500/30 to-purple-500/30 text-blue-200 border-blue-400/30 px-4 py-2 text-sm font-medium">
                      <GraduationCap className="h-4 w-4 mr-2" />
                      {userProfile.role}
                    </Badge>
                    
                    <div className="flex items-center gap-2 bg-gradient-to-r from-yellow-500/20 to-orange-500/20 rounded-full px-4 py-2 border border-yellow-400/30">
                      <Trophy className="h-4 w-4 text-yellow-400" />
                      <span className="text-yellow-200 font-semibold">Level {userProfile.level || 1}</span>
                    </div>
                    
                    <div className="flex items-center gap-2 bg-slate-700/50 rounded-full px-4 py-2 border border-slate-600/50">
                      <TrendingUp className="h-4 w-4 text-green-400" />
                      <span className="text-slate-300 font-medium">{userProfile.xp || 0} XP</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardHeader>
          </Card>
        )}

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="bg-gradient-to-br from-blue-500/10 to-blue-600/10 border-blue-500/30 backdrop-blur-sm">
            <CardContent className="p-6 text-center">
              <div className="flex items-center justify-center mb-3">
                <div className="p-3 bg-blue-500/20 rounded-full">
                  <School className="h-8 w-8 text-blue-400" />
                </div>
              </div>
              <div className="text-3xl font-bold text-white mb-1">{classrooms.length}</div>
              <div className="text-blue-300 text-sm">Classrooms</div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-500/10 to-purple-600/10 border-purple-500/30 backdrop-blur-sm">
            <CardContent className="p-6 text-center">
              <div className="flex items-center justify-center mb-3">
                <div className="p-3 bg-purple-500/20 rounded-full">
                  <BookOpen className="h-8 w-8 text-purple-400" />
                </div>
              </div>
              <div className="text-3xl font-bold text-white mb-1">{scenarioHistory.length}</div>
              <div className="text-purple-300 text-sm">Scenarios Completed</div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-500/10 to-green-600/10 border-green-500/30 backdrop-blur-sm">
            <CardContent className="p-6 text-center">
              <div className="flex items-center justify-center mb-3">
                <div className="p-3 bg-green-500/20 rounded-full">
                  <Award className="h-8 w-8 text-green-400" />
                </div>
              </div>
              <div className="text-3xl font-bold text-white mb-1">{getAverageScore()}</div>
              <div className="text-green-300 text-sm">Average Score</div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
          {/* Enhanced Classrooms Section */}
          <Card className="bg-slate-800/50 border-slate-700/50 backdrop-blur-sm shadow-2xl">
            <CardHeader className="pb-4">
              <CardTitle className="text-white flex items-center gap-3 text-xl">
                <div className="p-2 bg-green-500/20 rounded-lg">
                  <School className="h-6 w-6 text-green-400" />
                </div>
                My Classrooms
                <Badge className="ml-2 bg-green-500/20 text-green-300 border-green-500/30">
                  {classrooms.length}
                </Badge>
              </CardTitle>
              <CardDescription className="text-slate-400 text-base">
                {userProfile?.role === 'student' 
                  ? "Classrooms you've joined and are actively participating in"
                  : "Classrooms you've created and are managing"
                }
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loadingClassrooms ? (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-400 mx-auto mb-4"></div>
                  <div className="text-slate-400">Loading your classrooms...</div>
                </div>
              ) : classrooms.length > 0 ? (
                <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
                  {classrooms.map((classroom) => (
                    <div key={classroom.id} className="bg-gradient-to-r from-slate-700/40 to-slate-600/40 rounded-xl p-5 border border-slate-600/40 hover:border-slate-500/60 transition-all duration-200 group">
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex-1">
                          <h3 className="text-white font-semibold text-lg mb-1 group-hover:text-blue-300 transition-colors">
                            {classroom.name}
                          </h3>
                          {classroom.description && (
                            <p className="text-slate-300 text-sm line-clamp-2 mb-2">{classroom.description}</p>
                          )}
                        </div>
                        <Badge className="bg-green-500/20 text-green-300 border-green-500/30 ml-3">
                          Active
                        </Badge>
                      </div>
                      
                      <Separator className="bg-slate-600/50 my-3" />
                      
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div className="flex items-center gap-2 text-blue-300">
                          <Users className="h-4 w-4" />
                          <span className="font-medium">{classroom.students?.length || 0} students</span>
                        </div>
                        <div className="flex items-center gap-2 text-purple-300">
                          <Calendar className="h-4 w-4" />
                          <span>
                            {classroom.createdAt ? formatDate(classroom.createdAt) : 'Recently'}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="p-4 bg-slate-700/30 rounded-full w-fit mx-auto mb-4">
                    <School className="h-12 w-12 text-slate-500" />
                  </div>
                  <div className="text-slate-400 mb-2 text-lg font-medium">
                    {userProfile?.role === 'student' 
                      ? "No classrooms joined yet"
                      : "No classrooms created yet"
                    }
                  </div>
                  <div className="text-slate-500">
                    {userProfile?.role === 'student' 
                      ? "Ask your teacher for a class code to get started"
                      : "Create your first classroom to begin teaching"
                    }
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Enhanced Scenario History Section */}
          <Card className="bg-slate-800/50 border-slate-700/50 backdrop-blur-sm shadow-2xl">
            <CardHeader className="pb-4">
              <CardTitle className="text-white flex items-center gap-3 text-xl">
                <div className="p-2 bg-purple-500/20 rounded-lg">
                  <Trophy className="h-6 w-6 text-purple-400" />
                </div>
                Learning History
                <Badge className="ml-2 bg-purple-500/20 text-purple-300 border-purple-500/30">
                  {scenarioHistory.length}
                </Badge>
              </CardTitle>
              <CardDescription className="text-slate-400 text-base">
                Your completed scenarios and achievements in your learning journey
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loadingHistory ? (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-purple-400 mx-auto mb-4"></div>
                  <div className="text-slate-400">Loading your learning history...</div>
                </div>
              ) : scenarioHistory.length > 0 ? (
                <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
                  {scenarioHistory.map((history, index) => (
                    <div key={index} className="bg-gradient-to-r from-slate-700/40 to-slate-600/40 rounded-xl p-5 border border-slate-600/40 hover:border-slate-500/60 transition-all duration-200 group">
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex-1">
                          <h3 className="text-white font-semibold text-lg mb-2 group-hover:text-purple-300 transition-colors">
                            {history.scenarioTitle}
                          </h3>
                          <div className="flex items-center gap-2 text-sm text-slate-400 mb-3">
                            <Clock className="h-3 w-3" />
                            <span>
                              Completed {history.completedAt ? formatDate(history.completedAt) : 'Recently'}
                            </span>
                          </div>
                        </div>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => openHistoryDialog(history)} 
                          className="border-purple-500/40 bg-purple-900/30 text-purple-300 hover:bg-purple-800/40 hover:border-purple-400/60 transition-all"
                        >
                          View Details
                        </Button>
                      </div>
                      
                      <Separator className="bg-slate-600/50 my-3" />
                      
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-4">
                          <span className="text-green-400 font-medium">
                            {history.choices?.length || 0} decisions made
                          </span>
                          {history.finalMetrics && (
                            <span className="text-yellow-400 font-medium">
                              Total Score: {Object.values(history.finalMetrics).reduce((a, b) => a + b, 0)}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-1">
                          <Star className="h-4 w-4 text-yellow-400" />
                          <span className="text-yellow-300 font-medium">
                            {history.finalMetrics ? Math.round(Object.values(history.finalMetrics).reduce((a, b) => a + b, 0) / 5) : 0}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="p-4 bg-slate-700/30 rounded-full w-fit mx-auto mb-4">
                    <BookOpen className="h-12 w-12 text-slate-500" />
                  </div>
                  <div className="text-slate-400 mb-2 text-lg font-medium">No scenarios completed yet</div>
                  <div className="text-slate-500">Start playing scenarios to build your learning history</div>
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
