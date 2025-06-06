
/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/context/AuthContext';
import { useGameContext } from '@/context/GameContext';
import { useNavigate } from 'react-router-dom';
import { 
  User, 
  Trophy, 
  Target, 
  BookOpen, 
  Users, 
  Play,
  Award,
  TrendingUp,
  Calendar,
  Star,
  LogOut
} from 'lucide-react';
import { getUserClassrooms, Classroom } from '@/lib/firebase';
import StudentClassroomView from '@/components/classroom/StudentClassroomView';
import ClassroomAccessGuard from '@/components/classroom/ClassroomAccessGuard';

const ProfilePage = () => {
  const { currentUser, userProfile, logout, refreshUserProfile } = useAuth();
  const { scenarios } = useGameContext();
  const navigate = useNavigate();
  const [classrooms, setClassrooms] = useState<Classroom[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUserData = async () => {
      if (!currentUser) {
        navigate('/auth');
        return;
      }

      try {
        // Refresh user profile to get latest data
        await refreshUserProfile();
        const userClassrooms = await getUserClassrooms(currentUser.uid);
        setClassrooms(userClassrooms);
      } catch (error) {
        console.error('Error loading user data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadUserData();
  }, [currentUser, navigate, refreshUserProfile]);

  // Refresh data when component mounts or user profile changes
  useEffect(() => {
    if (userProfile) {
      console.log('User profile updated:', userProfile);
    }
  }, [userProfile]);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  if (!currentUser || !userProfile) {
    return (
      <ClassroomAccessGuard>
        <div className="container mx-auto px-4 py-8">
          <Card className="max-w-md mx-auto bg-black/30 border-primary/20">
            <CardContent className="p-6 text-center">
              <User className="h-12 w-12 text-white/30 mx-auto mb-4" />
              <p className="text-white/70">Please sign in to view your profile.</p>
            </CardContent>
          </Card>
        </div>
      </ClassroomAccessGuard>
    );
  }

  const completedCount = userProfile.completedScenarios?.length || 0;
  const totalScenarios = scenarios.length;
  const completionPercentage = totalScenarios > 0 ? (completedCount / totalScenarios) * 100 : 0;

  // Calculate average metrics from scenario history
  const calculateAverageMetrics = () => {
    if (!userProfile.history || userProfile.history.length === 0) {
      return { environmental: 50, social: 50, economic: 50 };
    }

    const totals = userProfile.history.reduce((acc, scenario) => {
      const metrics = scenario.finalMetrics || scenario.metrics;
      return {
        environmental: acc.environmental + (metrics.environmental || 0),
        social: acc.social + (metrics.social || 0),
        economic: acc.economic + (metrics.economic || 0)
      };
    }, { environmental: 0, social: 0, economic: 0 });

    const count = userProfile.history.length;
    return {
      environmental: Math.round(totals.environmental / count),
      social: Math.round(totals.social / count),
      economic: Math.round(totals.economic / count)
    };
  };

  const averageMetrics = calculateAverageMetrics();

  return (
    <ClassroomAccessGuard>
      <div className="container mx-auto px-4 py-8">
        <header className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center">
                {userProfile.photoURL ? (
                  <img 
                    src={userProfile.photoURL} 
                    alt={userProfile.displayName} 
                    className="w-14 h-14 rounded-full object-cover"
                  />
                ) : (
                  <User className="w-8 h-8 text-primary" />
                )}
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white">
                  {userProfile.displayName || 'Student'}
                </h1>
                <div className="flex items-center gap-2 mt-1">
                  <Badge className="bg-primary/20 text-primary border-0">
                    Level {userProfile.level || 1}
                  </Badge>
                  <Badge className="bg-blue-500/20 text-blue-300 border-0 capitalize">
                    {userProfile.role}
                  </Badge>
                </div>
              </div>
            </div>
            <Button 
              onClick={handleLogout}
              variant="outline"
              className="border-red-500/30 text-red-400 hover:bg-red-500/10"
            >
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </Button>
          </div>
        </header>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 bg-black/20 border-white/10">
            <TabsTrigger value="overview" className="data-[state=active]:bg-primary/20">
              Overview
            </TabsTrigger>
            <TabsTrigger value="classrooms" className="data-[state=active]:bg-primary/20">
              Classrooms
            </TabsTrigger>
            <TabsTrigger value="progress" className="data-[state=active]:bg-primary/20">
              Progress
            </TabsTrigger>
            <TabsTrigger value="history" className="data-[state=active]:bg-primary/20">
              History
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card className="bg-black/30 border-primary/20">
                <CardContent className="p-4 flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary/20 rounded-lg flex items-center justify-center">
                    <Trophy className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-white">{userProfile.xp || 0}</div>
                    <div className="text-xs text-white/70">Total XP</div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-black/30 border-primary/20">
                <CardContent className="p-4 flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center">
                    <Target className="w-5 h-5 text-green-400" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-white">{completedCount}</div>
                    <div className="text-xs text-white/70">Completed</div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-black/30 border-primary/20">
                <CardContent className="p-4 flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
                    <Users className="w-5 h-5 text-blue-400" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-white">{classrooms.length}</div>
                    <div className="text-xs text-white/70">Classrooms</div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-black/30 border-primary/20">
                <CardContent className="p-4 flex items-center gap-3">
                  <div className="w-10 h-10 bg-orange-500/20 rounded-lg flex items-center justify-center">
                    <Award className="w-5 h-5 text-orange-400" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-white">{userProfile.badges?.length || 0}</div>
                    <div className="text-xs text-white/70">Badges</div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="bg-black/30 border-primary/20">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-primary" />
                    Average Performance
                  </CardTitle>
                  <CardDescription className="text-white/70">
                    Your average metrics across all completed scenarios
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-white/70">Environmental</span>
                      <span className="text-white">{averageMetrics.environmental}%</span>
                    </div>
                    <Progress value={averageMetrics.environmental} className="h-2" />
                  </div>
                  
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-white/70">Social</span>
                      <span className="text-white">{averageMetrics.social}%</span>
                    </div>
                    <Progress value={averageMetrics.social} className="h-2" />
                  </div>
                  
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-white/70">Economic</span>
                      <span className="text-white">{averageMetrics.economic}%</span>
                    </div>
                    <Progress value={averageMetrics.economic} className="h-2" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-black/30 border-primary/20">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <BookOpen className="w-5 h-5 text-primary" />
                    Learning Progress
                  </CardTitle>
                  <CardDescription className="text-white/70">
                    Track your scenario completion progress
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-white/70">Scenarios Completed</span>
                      <span className="text-white">{completedCount}/{totalScenarios}</span>
                    </div>
                    <Progress value={completionPercentage} className="h-3" />
                  </div>
                  
                  <Button 
                    className="w-full bg-primary hover:bg-primary/90"
                    onClick={() => navigate('/game')}
                  >
                    <Play className="mr-2 h-4 w-4" />
                    Continue Learning
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="classrooms">
            <StudentClassroomView />
          </TabsContent>

          <TabsContent value="progress" className="space-y-6">
            <Card className="bg-black/30 border-primary/20">
              <CardHeader>
                <CardTitle className="text-white">Detailed Progress</CardTitle>
                <CardDescription className="text-white/70">
                  Your learning journey and achievements
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium text-white mb-3">Completion Status</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {scenarios.slice(0, 6).map((scenario) => {
                      const isCompleted = userProfile.completedScenarios?.includes(scenario.id);
                      return (
                        <div 
                          key={scenario.id}
                          className={`p-3 rounded-lg border ${
                            isCompleted 
                              ? 'bg-green-500/10 border-green-500/30' 
                              : 'bg-black/20 border-white/10'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            {isCompleted ? (
                              <Star className="w-4 h-4 text-green-400" />
                            ) : (
                              <div className="w-4 h-4 rounded-full border-2 border-white/30" />
                            )}
                            <span className="text-sm text-white font-medium">
                              {scenario.title}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {userProfile.badges && userProfile.badges.length > 0 && (
                  <div>
                    <h3 className="text-lg font-medium text-white mb-3">Badges Earned</h3>
                    <div className="flex flex-wrap gap-2">
                      {userProfile.badges.map((badge, index) => (
                        <Badge 
                          key={index}
                          className="bg-yellow-500/20 text-yellow-300 border-0"
                        >
                          <Award className="w-3 h-3 mr-1" />
                          {badge}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="history" className="space-y-6">
            <Card className="bg-black/30 border-primary/20">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-primary" />
                  Scenario History
                </CardTitle>
                <CardDescription className="text-white/70">
                  Review your past scenario performances
                </CardDescription>
              </CardHeader>
              <CardContent>
                {userProfile.history && userProfile.history.length > 0 ? (
                  <div className="space-y-4">
                    {userProfile.history.slice(0, 5).map((scenario, index) => (
                      <div 
                        key={index}
                        className="p-4 bg-black/20 rounded-lg border border-white/10"
                      >
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="font-medium text-white">{scenario.scenarioTitle}</h4>
                          <Badge className="bg-primary/20 text-primary border-0 text-xs">
                            {scenario.completedAt ? new Date((scenario.completedAt as any).seconds * 1000).toLocaleDateString() : 'Recently'}
                          </Badge>
                        </div>
                        <div className="grid grid-cols-3 gap-4 text-sm">
                          <div>
                            <span className="text-white/70">Environmental: </span>
                            <span className="text-green-400">{scenario.finalMetrics?.environmental || scenario.metrics?.environmental || 0}</span>
                          </div>
                          <div>
                            <span className="text-white/70">Social: </span>
                            <span className="text-blue-400">{scenario.finalMetrics?.social || scenario.metrics?.social || 0}</span>
                          </div>
                          <div>
                            <span className="text-white/70">Economic: </span>
                            <span className="text-yellow-400">{scenario.finalMetrics?.economic || scenario.metrics?.economic || 0}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <BookOpen className="w-12 h-12 text-white/30 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-white mb-2">No History Yet</h3>
                    <p className="text-white/70 mb-4">
                      Start completing scenarios to see your history here.
                    </p>
                    <Button 
                      onClick={() => navigate('/game')}
                      className="bg-primary hover:bg-primary/90"
                    >
                      <Play className="mr-2 h-4 w-4" />
                      Start First Scenario
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </ClassroomAccessGuard>
  );
};

export default ProfilePage;
