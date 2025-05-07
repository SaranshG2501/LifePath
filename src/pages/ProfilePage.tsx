
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/context/AuthContext';
import { useGameContext } from '@/context/GameContext';
import { getClassroomByCode, joinClassroom } from '@/lib/firebase';
import ScenarioCard from '@/components/ScenarioCard';
import ScenarioHistoryDetail from '@/components/ScenarioHistoryDetail';
import AchievementSection from '@/components/AchievementSection';
import { BookOpen, Trophy, History, Users, ArrowRight, Award, GraduationCap } from 'lucide-react';

const ProfilePage = () => {
  const [isJoiningClass, setIsJoiningClass] = useState(false);
  const [classCode, setClassCode] = useState('');
  const [tabSelect, setTabSelect] = useState('scenarios');
  const [selectedScenarioHistory, setSelectedScenarioHistory] = useState<string | null>(null);
  
  const { userProfile, refreshUserProfile } = useAuth();
  const { scenarios, startScenario, resetGame, setGameMode, setClassroomId } = useGameContext();
  const { toast } = useToast();
  const navigate = useNavigate();
  
  useEffect(() => {
    if (!userProfile) {
      navigate('/auth');
    }
  }, [userProfile, navigate]);
  
  const handleStartScenario = (scenarioId: string) => {
    resetGame();
    setGameMode('individual');
    startScenario(scenarioId);
    navigate('/game');
  };
  
  const handleJoinClass = async () => {
    if (!classCode || !userProfile) return;
    
    try {
      setIsJoiningClass(true);
      
      // Get classroom data
      const classroom = await getClassroomByCode(classCode);
      
      if (!classroom) {
        toast({
          title: "Class not found",
          description: "Please check the class code and try again.",
          variant: "destructive"
        });
        return;
      }
      
      // Join the classroom
      const updatedClassroom = await joinClassroom(
        classroom.id, 
        userProfile.id,
        userProfile.displayName
      );
      
      if (updatedClassroom) {
        // Set game context
        setGameMode('classroom');
        setClassroomId(updatedClassroom.id);
        
        // Refresh user profile to get updated classrooms
        await refreshUserProfile();
        
        toast({
          title: "Class joined successfully",
          description: `You have joined ${updatedClassroom.name}`,
        });
        
        // Navigate to the game page if there's an active scenario
        if (updatedClassroom.activeScenario) {
          navigate('/game');
        }
      }
    } catch (error: any) {
      console.error("Error joining class:", error);
      toast({
        title: "Failed to join class",
        description: error.message || "An unexpected error occurred",
        variant: "destructive"
      });
    } finally {
      setIsJoiningClass(false);
      setClassCode('');
    }
  };
  
  // Handle scenario history selection
  const showScenarioDetails = (historyId: string) => {
    setSelectedScenarioHistory(historyId);
  };
  
  if (!userProfile) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }
  
  const completedScenariosCount = userProfile.completedScenarios?.length || 0;
  const totalScenariosCount = scenarios?.length || 1;
  const progressPercentage = Math.round((completedScenariosCount / totalScenariosCount) * 100);
  
  const userMetrics = userProfile.metrics || {
    health: 50,
    money: 50,
    happiness: 50,
    knowledge: 50,
    relationships: 50
  };
  
  return (
    <div className="container mx-auto py-6 px-4">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* User Profile Section */}
        <div className="lg:col-span-1 space-y-6">
          <Card className="bg-black/40 backdrop-blur-md border-white/10 overflow-hidden">
            <div className="h-24 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500"></div>
            <div className="p-6 -mt-12">
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-indigo-400 to-purple-600 flex items-center justify-center text-white text-3xl font-bold border-4 border-background shadow-xl">
                {userProfile.displayName.charAt(0).toUpperCase()}
              </div>
              
              <div className="mt-4">
                <h2 className="text-2xl font-bold text-white">{userProfile.displayName}</h2>
                <p className="text-white/60">@{userProfile.username}</p>
                
                <div className="flex items-center mt-2 space-x-2">
                  <Badge variant="outline" className="bg-primary/20 text-primary border-primary/30">
                    {userProfile.role === 'teacher' ? 'Teacher' : 'Student'}
                  </Badge>
                  
                  <Badge variant="outline" className="bg-amber-500/20 text-amber-300 border-amber-500/30">
                    Level {userProfile.level}
                  </Badge>
                </div>
                
                <div className="mt-4">
                  <div className="flex justify-between mb-1">
                    <span className="text-xs text-white/70">XP: {userProfile.xp}</span>
                    <span className="text-xs text-white/70">Next Level: {(userProfile.level + 1) * 100}</span>
                  </div>
                  <Progress value={userProfile.xp % 100} className="h-2" />
                </div>
                
                <div className="mt-6 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-white/80">Scenarios Completed:</span>
                    <span className="text-white font-medium">{completedScenariosCount} / {totalScenariosCount}</span>
                  </div>
                  <Progress value={progressPercentage} className="h-2" />
                </div>
                
                <div className="mt-6 grid grid-cols-2 gap-2">
                  <Button 
                    variant="secondary" 
                    className="w-full"
                    onClick={() => setTabSelect('scenarios')}
                  >
                    <BookOpen className="mr-2 h-4 w-4" />
                    Scenarios
                  </Button>
                  
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button 
                        variant="outline" 
                        className="w-full bg-white/5 border-white/20 hover:bg-white/10"
                      >
                        <Users className="mr-2 h-4 w-4" />
                        Join Class
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="bg-black/80 border-white/10 text-white">
                      <DialogHeader>
                        <DialogTitle>Join a Classroom</DialogTitle>
                        <DialogDescription className="text-white/70">
                          Enter the class code provided by your teacher.
                        </DialogDescription>
                      </DialogHeader>
                      <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                          <label className="text-right text-white/70 col-span-1">
                            Class Code
                          </label>
                          <Input
                            placeholder="Enter class code"
                            value={classCode}
                            onChange={(e) => setClassCode(e.target.value)}
                            className="col-span-3 bg-black/50 border-white/20"
                          />
                        </div>
                      </div>
                      <DialogFooter>
                        <Button 
                          onClick={handleJoinClass} 
                          disabled={isJoiningClass}
                          className="gap-2"
                        >
                          {isJoiningClass ? 'Joining...' : 'Join Class'}
                          <ArrowRight className="h-4 w-4" />
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>
            </div>
          </Card>
          
          <AchievementSection userProfile={userProfile} />
        </div>
        
        {/* Main Content Section */}
        <div className="lg:col-span-2">
          <Tabs defaultValue="scenarios" value={tabSelect} onValueChange={setTabSelect}>
            <div className="flex justify-between items-center mb-4">
              <TabsList className="bg-black/30 border border-white/10">
                <TabsTrigger value="scenarios" className="data-[state=active]:bg-primary/20">
                  <BookOpen className="mr-2 h-4 w-4" />
                  Scenarios
                </TabsTrigger>
                <TabsTrigger value="history" className="data-[state=active]:bg-primary/20">
                  <History className="mr-2 h-4 w-4" />
                  History
                </TabsTrigger>
                <TabsTrigger value="classrooms" className="data-[state=active]:bg-primary/20">
                  <GraduationCap className="mr-2 h-4 w-4" />
                  Classrooms
                </TabsTrigger>
              </TabsList>
            </div>
            
            <TabsContent value="scenarios" className="mt-0">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {scenarios.map((scenario) => (
                  <ScenarioCard
                    key={scenario.id}
                    scenario={scenario}
                    isCompleted={userProfile.completedScenarios?.includes(scenario.id) || false}
                    onStart={() => handleStartScenario(scenario.id)}
                  />
                ))}
              </div>
            </TabsContent>
            
            <TabsContent value="history" className="mt-0">
              {userProfile.history && userProfile.history.length > 0 ? (
                <div className="space-y-4">
                  {selectedScenarioHistory ? (
                    <div>
                      <Button 
                        variant="link" 
                        className="pl-0 text-primary mb-2"
                        onClick={() => setSelectedScenarioHistory(null)}
                      >
                        ← Back to history
                      </Button>
                      <ScenarioHistoryDetail 
                        historyId={selectedScenarioHistory}
                        userId={userProfile.id}
                      />
                    </div>
                  ) : (
                    <Card className="bg-black/40 backdrop-blur-md border-white/10">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <History className="h-5 w-5 text-primary" />
                          Scenario History
                        </CardTitle>
                        <CardDescription>
                          View your completed scenarios
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <ScrollArea className="h-[400px] pr-4">
                          <div className="space-y-4">
                            {userProfile.history.map((item) => (
                              <div 
                                key={item.id} 
                                className="bg-black/20 p-4 rounded-lg cursor-pointer hover:bg-black/30 transition-colors"
                                onClick={() => showScenarioDetails(item.id)}
                              >
                                <h3 className="font-medium text-white">{item.scenarioTitle}</h3>
                                <div className="text-xs text-white/60 mt-1">
                                  {item.completedAt?.seconds ? 
                                    new Date(item.completedAt.seconds * 1000).toLocaleDateString() : 
                                    'Unknown date'}
                                </div>
                                <div className="flex flex-wrap gap-2 mt-3">
                                  {item.finalMetrics && Object.entries(item.finalMetrics).map(([key, value]) => (
                                    <Badge key={key} variant="outline" className="bg-white/5">
                                      {key}: {value}
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                            ))}
                          </div>
                        </ScrollArea>
                      </CardContent>
                    </Card>
                  )}
                </div>
              ) : (
                <Card className="bg-black/40 backdrop-blur-md border-white/10">
                  <CardHeader className="text-center">
                    <CardTitle>No History Yet</CardTitle>
                    <CardDescription>
                      Complete scenarios to see your history here
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="flex justify-center">
                    <Button variant="outline" onClick={() => setTabSelect('scenarios')}>
                      <BookOpen className="mr-2 h-4 w-4" />
                      Browse Scenarios
                    </Button>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
            
            <TabsContent value="classrooms" className="mt-0">
              <Card className="bg-black/40 backdrop-blur-md border-white/10">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <GraduationCap className="h-5 w-5 text-primary" />
                    My Classrooms
                  </CardTitle>
                  <CardDescription>
                    View and manage your classroom memberships
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {userProfile.classrooms && userProfile.classrooms.length > 0 ? (
                    <div className="grid gap-4">
                      {/* Classrooms list would go here */}
                      <div className="p-4 bg-black/20 rounded-lg">
                        <p className="text-white/70">You are a member of {userProfile.classrooms.length} classroom(s).</p>
                        <p className="text-white/70 mt-2">View your classrooms and activities through the classroom interface.</p>
                        <Button 
                          className="mt-4"
                          onClick={() => {
                            setGameMode('classroom');
                            navigate('/game');
                          }}
                        >
                          <GraduationCap className="mr-2 h-4 w-4" />
                          Go to Classroom
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-6">
                      <GraduationCap className="h-12 w-12 mx-auto text-white/20 mb-3" />
                      <h3 className="text-lg font-medium text-white mb-1">No Classrooms Joined</h3>
                      <p className="text-white/70 mb-4">Join a classroom using a class code from your teacher</p>
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="outline">Join a Classroom</Button>
                        </DialogTrigger>
                        <DialogContent className="bg-black/80 border-white/10 text-white">
                          <DialogHeader>
                            <DialogTitle>Join a Classroom</DialogTitle>
                            <DialogDescription className="text-white/70">
                              Enter the class code provided by your teacher.
                            </DialogDescription>
                          </DialogHeader>
                          <div className="grid gap-4 py-4">
                            <div className="grid grid-cols-4 items-center gap-4">
                              <label className="text-right text-white/70 col-span-1">
                                Class Code
                              </label>
                              <Input
                                placeholder="Enter class code"
                                value={classCode}
                                onChange={(e) => setClassCode(e.target.value)}
                                className="col-span-3 bg-black/50 border-white/20"
                              />
                            </div>
                          </div>
                          <DialogFooter>
                            <Button 
                              onClick={handleJoinClass} 
                              disabled={isJoiningClass}
                              className="gap-2"
                            >
                              {isJoiningClass ? 'Joining...' : 'Join Class'}
                              <ArrowRight className="h-4 w-4" />
                            </Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                    </div>
                  )}
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
