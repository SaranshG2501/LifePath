
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { School, Users, User, Calendar, BookOpen, Play, LogOut, Star, Trophy, Clock } from 'lucide-react';
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
        // For teachers, get classrooms they created
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
      // Create mock history with proper types
      const mockHistory: ScenarioHistory[] = [
        {
          scenarioId: 'financial-literacy',
          scenarioTitle: 'Financial Literacy Challenge',
          startedAt: new Date(Date.now() - 172800000), // 2 days ago
          completedAt: new Date(Date.now() - 172800000 + 3600000), // 1 hour later
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
          startedAt: new Date(Date.now() - 86400000), // 1 day ago
          completedAt: new Date(Date.now() - 86400000 + 2700000), // 45 minutes later
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
          startedAt: new Date(Date.now() - 259200000), // 3 days ago
          completedAt: new Date(Date.now() - 259200000 + 5400000), // 1.5 hours later
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header with Logout */}
        <div className="flex justify-between items-center mb-8">
          <div className="text-center flex-1">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              My Profile
            </h1>
            <p className="text-slate-300 mt-2">Manage your learning journey and achievements</p>
          </div>
          <Button 
            onClick={handleLogout}
            variant="outline" 
            className="border-red-500/30 bg-red-900/20 text-red-300 hover:bg-red-800/30 flex items-center gap-2"
          >
            <LogOut className="h-4 w-4" />
            Logout
          </Button>
        </div>

        {/* User Information Card */}
        {userProfile && (
          <Card className="bg-slate-800/50 border-slate-700/50 backdrop-blur-sm mb-8 shadow-2xl">
            <CardHeader className="pb-4">
              <CardTitle className="text-white flex items-center gap-3">
                <div className="p-2 bg-blue-500/20 rounded-lg">
                  <User className="h-6 w-6 text-blue-400" />
                </div>
                User Profile
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-6">
                <Avatar className="h-20 w-20 border-2 border-purple-500/30 shadow-lg">
                  <AvatarFallback className="bg-gradient-to-br from-purple-500/30 to-blue-500/30 text-white text-xl font-bold">
                    {userProfile.username?.charAt(0)?.toUpperCase() || 'U'}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="text-white font-semibold text-2xl mb-1">{userProfile.username}</div>
                  <div className="text-slate-300 mb-3">{userProfile.email}</div>
                  <div className="flex items-center gap-3">
                    <Badge className="bg-gradient-to-r from-blue-500/20 to-purple-500/20 text-blue-300 border-blue-500/30 px-3 py-1">
                      {userProfile.role}
                    </Badge>
                    <div className="flex items-center gap-2 text-yellow-400">
                      <Star className="h-4 w-4" />
                      <span className="text-sm font-medium">Level {userProfile.level || 1}</span>
                    </div>
                    <div className="text-sm text-slate-400">
                      {userProfile.xp || 0} XP
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* My Classrooms Section */}
          <Card className="bg-slate-800/50 border-slate-700/50 backdrop-blur-sm shadow-2xl">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-3">
                <div className="p-2 bg-green-500/20 rounded-lg">
                  <School className="h-6 w-6 text-green-400" />
                </div>
                My Classrooms ({classrooms.length})
              </CardTitle>
              <CardDescription className="text-slate-400">
                {userProfile?.role === 'student' 
                  ? "Classrooms you've joined"
                  : "Classrooms you've created"
                }
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loadingClassrooms ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-400 mx-auto mb-4"></div>
                  <div className="text-slate-400">Loading classrooms...</div>
                </div>
              ) : classrooms.length > 0 ? (
                <div className="space-y-4 max-h-80 overflow-y-auto">
                  {classrooms.map((classroom) => (
                    <div key={classroom.id} className="bg-slate-700/30 rounded-lg p-4 border border-slate-600/30 hover:border-slate-500/50 transition-colors">
                      <div className="flex justify-between items-start mb-3">
                        <h3 className="text-white font-semibold">{classroom.name}</h3>
                        <Badge className="bg-green-500/20 text-green-300 border-green-500/30">
                          Active
                        </Badge>
                      </div>
                      
                      {classroom.description && (
                        <p className="text-slate-300 text-sm mb-3 line-clamp-2">{classroom.description}</p>
                      )}
                      
                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <div className="flex items-center gap-2 text-blue-300">
                          <Users className="h-4 w-4" />
                          <span>{classroom.students?.length || 0} students</span>
                        </div>
                        <div className="flex items-center gap-2 text-purple-300">
                          <Calendar className="h-4 w-4" />
                          <span>
                            {classroom.createdAt ? 
                              convertTimestampToDate(classroom.createdAt).toLocaleDateString() : 
                              'Recently'
                            }
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <School className="h-16 w-16 text-slate-500 mx-auto mb-4 opacity-50" />
                  <div className="text-slate-400 mb-2">
                    {userProfile?.role === 'student' 
                      ? "No classrooms joined yet"
                      : "No classrooms created yet"
                    }
                  </div>
                  <div className="text-slate-500 text-sm">
                    {userProfile?.role === 'student' 
                      ? "Ask your teacher for a class code"
                      : "Create your first classroom to get started"
                    }
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Scenario History Section */}
          <Card className="bg-slate-800/50 border-slate-700/50 backdrop-blur-sm shadow-2xl">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-3">
                <div className="p-2 bg-purple-500/20 rounded-lg">
                  <Trophy className="h-6 w-6 text-purple-400" />
                </div>
                Scenario History
              </CardTitle>
              <CardDescription className="text-slate-400">
                Your completed learning scenarios and achievements
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loadingHistory ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-400 mx-auto mb-4"></div>
                  <div className="text-slate-400">Loading history...</div>
                </div>
              ) : scenarioHistory.length > 0 ? (
                <div className="space-y-4 max-h-80 overflow-y-auto">
                  {scenarioHistory.map((history, index) => (
                    <div key={index} className="bg-slate-700/30 rounded-lg p-4 border border-slate-600/30 hover:border-slate-500/50 transition-colors">
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex-1">
                          <h3 className="text-white font-semibold mb-1">{history.scenarioTitle}</h3>
                          <div className="flex items-center gap-2 text-sm text-slate-400">
                            <Clock className="h-3 w-3" />
                            <span>
                              Completed {history.completedAt ? 
                                new Date(history.completedAt).toLocaleDateString() : 
                                'Recently'
                              }
                            </span>
                          </div>
                        </div>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => openHistoryDialog(history)} 
                          className="border-purple-500/30 bg-purple-900/20 text-purple-300 hover:bg-purple-800/30"
                        >
                          View Details
                        </Button>
                      </div>
                      
                      <div className="flex items-center gap-4 text-xs">
                        <span className="text-green-400">
                          {history.choices?.length || 0} choices made
                        </span>
                        {history.finalMetrics && (
                          <span className="text-yellow-400">
                            Score: {Object.values(history.finalMetrics).reduce((a, b) => a + b, 0)}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <BookOpen className="h-16 w-16 text-slate-500 mx-auto mb-4 opacity-50" />
                  <div className="text-slate-400 mb-2">No scenarios completed yet</div>
                  <div className="text-slate-500 text-sm">Start playing scenarios to build your history</div>
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
