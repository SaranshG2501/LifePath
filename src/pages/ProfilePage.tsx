
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useGameContext } from '@/context/GameContext';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { 
  User, School, Trophy, History, BarChart, 
  Users, LogOut, BookOpen, Gamepad2, Award, 
  BadgeCheck, BarChart2, Sparkles
} from 'lucide-react';

const ProfilePage: React.FC = () => {
  const { userRole } = useGameContext();
  const { userProfile, logout, isLoading } = useAuth();
  const navigate = useNavigate();
  const [xpProgress, setXpProgress] = useState(0);
  
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
    }
  }, [userProfile]);
  
  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
    } catch (error) {
      console.error("Error logging out:", error);
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
    return null; // Will redirect in useEffect
  }
  
  // Default values for new users with proper null checks
  const defaultProfile = {
    username: userProfile.username || 'User',
    email: userProfile.email || '',
    role: userProfile.role || userRole || 'student',
    xp: userProfile.xp || 0,
    level: userProfile.level || 1,
    completedScenarios: userProfile.completedScenarios || [],
    badges: userProfile.badges || [],
    classrooms: userProfile.classrooms || [],
    history: userProfile.history || []
  };
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* User Info Card */}
        <Card className="lg:col-span-1 bg-black/30 border-primary/20 backdrop-blur-md">
          <CardHeader className="pb-2">
            <div className="flex justify-center mb-4">
              <div className="relative w-24 h-24 rounded-full bg-gradient-to-r from-primary to-secondary flex items-center justify-center">
                <span className="text-4xl font-bold text-white">
                  {defaultProfile.username.charAt(0).toUpperCase()}
                </span>
                <div className="absolute bottom-0 right-0 bg-black/50 rounded-full p-1">
                  {defaultProfile.role === 'teacher' ? (
                    <School className="h-5 w-5 text-primary animate-pulse-slow" />
                  ) : (
                    <User className="h-5 w-5 text-primary animate-pulse-slow" />
                  )}
                </div>
              </div>
            </div>
            <CardTitle className="text-center text-xl font-bold gradient-heading text-white">
              {defaultProfile.username}
            </CardTitle>
            <CardDescription className="text-center flex items-center justify-center gap-1 text-white/70">
              {defaultProfile.role === 'teacher' ? (
                <>
                  <School className="h-4 w-4" />
                  Teacher
                </>
              ) : (
                <>
                  <User className="h-4 w-4" />
                  Student
                </>
              )}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm font-medium text-white/70">Level {defaultProfile.level}</span>
                  <span className="text-sm font-medium text-white/70">{defaultProfile.xp} XP</span>
                </div>
                <Progress value={xpProgress} className="h-2 bg-white/10" />
                <div className="flex justify-end mt-1">
                  <span className="text-xs text-white/50">{Math.round(xpProgress)}% to Level {defaultProfile.level + 1}</span>
                </div>
              </div>
              
              <div className="bg-black/20 rounded-lg p-4">
                <h3 className="font-medium mb-2 flex items-center gap-1 text-white">
                  <Trophy className="h-4 w-4 text-primary" />
                  Badges Earned
                </h3>
                <div className="flex flex-wrap gap-2">
                  {defaultProfile.badges && defaultProfile.badges.length > 0 ? (
                    defaultProfile.badges.map((badge: any, index: number) => (
                      <Badge 
                        key={index}
                        variant="outline"
                        className="bg-black/40 border-primary/30 text-white py-1"
                      >
                        {badge.name || badge}
                      </Badge>
                    ))
                  ) : (
                    <div className="text-white/50 text-sm">No badges earned yet</div>
                  )}
                </div>
              </div>
              
              <div className="bg-black/20 rounded-lg p-4">
                <h3 className="font-medium mb-2 flex items-center gap-1 text-white">
                  <BookOpen className="h-4 w-4 text-primary" />
                  Completed Scenarios
                </h3>
                <div className="text-sm text-white/80">
                  {(defaultProfile.completedScenarios && defaultProfile.completedScenarios.length) || 0} scenarios completed
                </div>
              </div>
              
              <Button 
                variant="outline" 
                className="w-full border-white/20 bg-black/20 text-white hover:bg-white/10"
                onClick={handleLogout}
              >
                <LogOut className="mr-2 h-4 w-4" />
                Log Out
              </Button>
            </div>
          </CardContent>
        </Card>
        
        {/* Main Content Area */}
        <div className="lg:col-span-2 space-y-6">
          <Tabs defaultValue="dashboard" className="w-full">
            <TabsList className="w-full grid grid-cols-3 bg-black/20 border-white/10 p-1">
              <TabsTrigger value="dashboard" className="data-[state=active]:bg-primary/20">
                Dashboard
              </TabsTrigger>
              <TabsTrigger value="classrooms" className="data-[state=active]:bg-primary/20">
                {userRole === 'teacher' ? 'My Classes' : 'My Classrooms'}
              </TabsTrigger>
              <TabsTrigger value="history" className="data-[state=active]:bg-primary/20">
                History
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="dashboard" className="mt-4">
              <Card className="bg-black/20 border-primary/20">
                <CardHeader>
                  <CardTitle className="text-xl font-bold gradient-heading flex items-center gap-2 text-white">
                    <Sparkles className="h-5 w-5 text-primary animate-pulse-slow" />
                    Your Progress
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-black/20 rounded-lg p-4 flex flex-col">
                      <h3 className="font-medium mb-3 flex items-center gap-1 text-white">
                        <Award className="h-4 w-4 text-primary" />
                        Achievements
                      </h3>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-white/80">Scenarios Completed</span>
                        <span className="font-mono text-white">
                          {(defaultProfile.completedScenarios && defaultProfile.completedScenarios.length) || 0}/10
                        </span>
                      </div>
                      <Progress 
                        value={(defaultProfile.completedScenarios && defaultProfile.completedScenarios.length * 10) || 0} 
                        className="h-2 mb-4 bg-white/10" 
                      />
                      
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-white/80">Badges Earned</span>
                        <span className="font-mono text-white">
                          {(defaultProfile.badges && defaultProfile.badges.length) || 0}/8
                        </span>
                      </div>
                      <Progress 
                        value={(defaultProfile.badges && defaultProfile.badges.length * 12.5) || 0} 
                        className="h-2 bg-white/10" 
                      />
                    </div>
                    
                    <div className="bg-black/20 rounded-lg p-4 flex flex-col">
                      <h3 className="font-medium mb-3 flex items-center gap-1 text-white">
                        <BarChart className="h-4 w-4 text-primary" />
                        Decision Metrics
                      </h3>
                      <div className="space-y-3 flex-grow">
                        <div>
                          <div className="flex justify-between mb-1 text-white/80">
                            <span>Analytical Decisions</span>
                            <span className="font-mono">67%</span>
                          </div>
                          <Progress value={67} className="h-2 bg-white/10" />
                        </div>
                        <div>
                          <div className="flex justify-between mb-1 text-white/80">
                            <span>Emotional Decisions</span>
                            <span className="font-mono">42%</span>
                          </div>
                          <Progress value={42} className="h-2 bg-white/10" />
                        </div>
                        <div>
                          <div className="flex justify-between mb-1 text-white/80">
                            <span>Risk-Taking</span>
                            <span className="font-mono">58%</span>
                          </div>
                          <Progress value={58} className="h-2 bg-white/10" />
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-6">
                    <h3 className="font-medium mb-3 flex items-center gap-1 text-white">
                      <Gamepad2 className="h-4 w-4 text-primary" />
                      Recent Activity
                    </h3>
                    <div className="bg-black/20 rounded-lg overflow-hidden">
                      <div className="grid grid-cols-3 gap-2 p-3 border-b border-white/10">
                        <div className="font-medium text-white/80">Scenario</div>
                        <div className="font-medium text-white/80">Date</div>
                        <div className="font-medium text-white/80 text-right">Score</div>
                      </div>
                      {defaultProfile.history && defaultProfile.history.length > 0 ? (
                        defaultProfile.history.map((item: any, index: number) => (
                          <div 
                            key={index} 
                            className="grid grid-cols-3 gap-2 p-3 border-b border-white/5 last:border-0 hover:bg-white/5"
                          >
                            <div className="text-white">{item.scenarioId?.replace(/-/g, ' ') || 'Unknown Scenario'}</div>
                            <div className="text-white/70">{item.date || 'N/A'}</div>
                            <div className="text-right font-mono text-white">{item.score || 0}%</div>
                          </div>
                        ))
                      ) : (
                        <div className="p-3 text-white/50 text-center">No activity recorded yet</div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="classrooms" className="mt-4">
              <Card className="bg-black/20 border-primary/20">
                <CardHeader>
                  <CardTitle className="text-xl font-bold gradient-heading flex items-center gap-2 text-white">
                    <Users className="h-5 w-5 text-primary animate-pulse-slow" />
                    {userRole === 'teacher' ? 'My Classes' : 'My Classrooms'}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {defaultProfile.classrooms && defaultProfile.classrooms.length > 0 ? (
                      defaultProfile.classrooms.map((classroom: any, index: number) => (
                        <div 
                          key={index} 
                          className="bg-black/30 rounded-lg p-4 border border-white/10 hover:border-primary/30 transition-colors cursor-pointer"
                        >
                          <h3 className="font-medium mb-2 text-white">{classroom.name || `Classroom ${index+1}`}</h3>
                          {userRole === 'teacher' ? (
                            <div className="text-sm text-white/70 flex items-center gap-1">
                              <Users className="h-4 w-4" />
                              {classroom.students || 0} students
                            </div>
                          ) : (
                            <div className="text-sm text-white/70 flex items-center gap-1">
                              <School className="h-4 w-4" />
                              Teacher: {classroom.teacher || 'Unknown'}
                            </div>
                          )}
                          
                          <div className="mt-3 flex justify-end">
                            <Button variant="outline" size="sm" className="border-white/20 bg-black/20 text-white hover:bg-white/10">
                              {userRole === 'teacher' ? 'Manage Class' : 'View Activities'}
                            </Button>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="col-span-2 bg-black/20 rounded-lg p-4 text-white/60 text-center">
                        No classrooms found
                      </div>
                    )}
                    
                    <div className="bg-black/10 rounded-lg border border-dashed border-white/20 p-4 flex flex-col items-center justify-center text-center hover:bg-black/20 transition-colors cursor-pointer">
                      <div className="rounded-full bg-white/5 p-3 mb-2">
                        <Users className="h-5 w-5 text-primary" />
                      </div>
                      <h3 className="font-medium text-white">
                        {userRole === 'teacher' ? 'Create New Class' : 'Join a Classroom'}
                      </h3>
                      <p className="text-sm text-white/60 mt-1">
                        {userRole === 'teacher' 
                          ? 'Set up a new classroom for your students' 
                          : 'Enter a class code to join'}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="history" className="mt-4">
              <Card className="bg-black/20 border-primary/20">
                <CardHeader>
                  <CardTitle className="text-xl font-bold gradient-heading flex items-center gap-2 text-white">
                    <History className="h-5 w-5 text-primary animate-pulse-slow" />
                    Your History
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="bg-black/20 rounded-lg overflow-hidden">
                    <div className="grid grid-cols-4 gap-2 p-3 border-b border-white/10">
                      <div className="font-medium text-white/80">Scenario</div>
                      <div className="font-medium text-white/80">Date</div>
                      <div className="font-medium text-white/80">Score</div>
                      <div className="font-medium text-white/80 text-right">Actions</div>
                    </div>
                    {defaultProfile.history && defaultProfile.history.length > 0 ? (
                      defaultProfile.history.map((item: any, index: number) => (
                        <div 
                          key={index} 
                          className="grid grid-cols-4 gap-2 p-3 border-b border-white/5 last:border-0 hover:bg-white/5"
                        >
                          <div className="text-white capitalize">{item.scenarioId?.replace(/-/g, ' ') || 'Unknown'}</div>
                          <div className="text-white/70">{item.date || 'N/A'}</div>
                          <div className="font-mono text-white">{item.score || 0}%</div>
                          <div className="text-right">
                            <Button variant="ghost" size="sm" className="text-primary hover:bg-primary/10 hover:text-primary">
                              View Details
                            </Button>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="p-3 text-white/50 text-center">No history available</div>
                    )}
                  </div>
                  
                  <div className="mt-6">
                    <h3 className="font-medium mb-3 flex items-center gap-1 text-white">
                      <BarChart2 className="h-4 w-4 text-primary" />
                      Decision Analytics
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="bg-black/30 rounded-lg p-4 border border-white/10">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="text-white">Health Choices</h4>
                          <Badge className="bg-green-500/20 text-green-300 border-0">
                            +12%
                          </Badge>
                        </div>
                        <div className="text-3xl font-bold text-white">72%</div>
                        <div className="text-xs text-white/60 mt-1">Positive health decisions</div>
                      </div>
                      
                      <div className="bg-black/30 rounded-lg p-4 border border-white/10">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="text-white">Financial Choices</h4>
                          <Badge className="bg-red-500/20 text-red-300 border-0">
                            -5%
                          </Badge>
                        </div>
                        <div className="text-3xl font-bold text-white">63%</div>
                        <div className="text-xs text-white/60 mt-1">Positive financial decisions</div>
                      </div>
                      
                      <div className="bg-black/30 rounded-lg p-4 border border-white/10">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="text-white">Relationship Choices</h4>
                          <Badge className="bg-blue-500/20 text-blue-300 border-0">
                            +8%
                          </Badge>
                        </div>
                        <div className="text-3xl font-bold text-white">81%</div>
                        <div className="text-xs text-white/60 mt-1">Positive relationship decisions</div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
