
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { School, Users, LogOut, GraduationCap, Trophy, TrendingUp, Sparkles, Calendar } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { getUserClassrooms, getClassrooms, Classroom, convertTimestampToDate, Timestamp, getUserScenarioHistory } from '@/lib/firebase';
import ProfileStats from '@/components/profile/ProfileStats';
import ScenarioHistoryTable from '@/components/profile/ScenarioHistoryTable';

interface HistoryEntry {
  scenarioId: string;
  scenarioTitle: string;
  completedAt: Date;
  choices: {
    sceneTitle: string;
    choiceText: string;
    metricChanges: Record<string, number>;
  }[];
  finalMetrics: {
    health: number;
    money: number;
    happiness: number;
    knowledge: number;
    relationships: number;
  };
}

const ProfilePage = () => {
  const { userProfile, currentUser, logout } = useAuth();
  const [classrooms, setClassrooms] = useState<Classroom[]>([]);
  const [loadingClassrooms, setLoadingClassrooms] = useState(true);
  const [scenarioHistory, setScenarioHistory] = useState<HistoryEntry[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(true);

  useEffect(() => {
    if (currentUser && userProfile) {
      fetchClassrooms();
      fetchScenarioHistory();
    }
  }, [currentUser, userProfile]);

  const fetchScenarioHistory = async () => {
    if (!currentUser) return;
    
    try {
      setLoadingHistory(true);
      const history = await getUserScenarioHistory(currentUser.uid);
      
      // Transform Firebase data to component format
      const transformedHistory: HistoryEntry[] = history.map(entry => ({
        scenarioId: entry.scenarioId,
        scenarioTitle: entry.scenarioTitle,
        completedAt: convertTimestampToDate(entry.completedAt),
        choices: entry.choices.map(choice => ({
          sceneTitle: choice.sceneId, // In a real app, you'd map this to actual scene titles
          choiceText: choice.choiceText,
          metricChanges: choice.metricChanges || {}
        })),
        finalMetrics: entry.finalMetrics
      }));
      
      setScenarioHistory(transformedHistory);
    } catch (error) {
      console.error('Error fetching scenario history:', error);
    } finally {
      setLoadingHistory(false);
    }
  };

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

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  const formatDate = (dateValue: Date | Timestamp): string => {
    if (dateValue instanceof Date) {
      return dateValue.toLocaleDateString();
    }
    return convertTimestampToDate(dateValue).toLocaleDateString();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-[#1A1F2C] to-purple-900">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
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

        {/* User Profile Card */}
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
                    <Sparkles className="h-4 w-4 text-white" />
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
        <ProfileStats 
          scenarioHistory={scenarioHistory}
          userLevel={userProfile?.level || 1}
          userXp={userProfile?.xp || 0}
        />

        {/* Classrooms Section */}
        <Card className="bg-slate-800/50 border-slate-700/50 backdrop-blur-sm shadow-2xl mb-8">
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

        {/* Scenario History Section */}
        {loadingHistory ? (
          <Card className="bg-slate-800/50 border-slate-700/50">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-400 mx-auto mb-4"></div>
              <div className="text-slate-400">Loading your scenario history...</div>
            </CardContent>
          </Card>
        ) : (
          <ScenarioHistoryTable history={scenarioHistory} />
        )}
      </div>
    </div>
  );
};

export default ProfilePage;
