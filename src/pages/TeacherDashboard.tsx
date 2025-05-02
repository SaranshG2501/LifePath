
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useGameContext } from '@/context/GameContext';
import { useToast } from '@/components/ui/use-toast';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScenarioCard } from '@/components/ScenarioCard';
import { scenarios } from '@/data/scenarios';
import {
  Play,
  Pause,
  Users,
  BarChart,
  Clock,
  ChevronRight,
  FileText,
  LayoutDashboard,
  CheckCircle,
  ListCheck,
  ArrowRight,
  CircleX,
} from 'lucide-react';
import { 
  getClassrooms, 
  getClassroom, 
  createClassroom,
  startClassroomScenario,
  advanceClassroomScene,
  onClassroomUpdated,
  onVotesUpdated
} from '@/lib/firebase';
import TeacherClassroomManager from '@/components/classroom/TeacherClassroomManager';

const TeacherDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { userProfile, currentUser } = useAuth();
  const { toast } = useToast();
  const { setClassroomId, gameMode, setGameMode } = useGameContext();
  
  const [classrooms, setClassrooms] = useState<any[]>([]);
  const [activeClassroom, setActiveClassroom] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [votes, setVotes] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState('classrooms');
  
  // Fetch teacher's classrooms
  useEffect(() => {
    const fetchClassrooms = async () => {
      if (!currentUser) return;
      
      try {
        setIsLoading(true);
        const teacherClassrooms = await getClassrooms(currentUser.uid);
        setClassrooms(teacherClassrooms);
        
        // If there's an active classroom, set it
        const active = teacherClassrooms.find(c => c.isActive);
        if (active) {
          setActiveClassroom(active);
          setClassroomId(active.id);
        }
      } catch (error) {
        console.error('Error fetching classrooms:', error);
        toast({
          title: 'Error',
          description: 'Failed to load your classrooms.',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchClassrooms();
  }, [currentUser, toast, setClassroomId]);
  
  // Set up real-time listeners when active classroom changes
  useEffect(() => {
    if (!activeClassroom) return;
    
    // Listen for classroom updates
    const unsubscribeClassroom = onClassroomUpdated(
      activeClassroom.id,
      (updatedClassroom) => {
        setActiveClassroom(updatedClassroom);
      }
    );
    
    // Listen for votes
    const unsubscribeVotes = onVotesUpdated(
      activeClassroom.id,
      (updatedVotes) => {
        setVotes(updatedVotes);
      }
    );
    
    return () => {
      unsubscribeClassroom();
      unsubscribeVotes();
    };
  }, [activeClassroom]);
  
  const handleCreateClassroom = async () => {
    if (!currentUser) {
      toast({
        title: "Login Required",
        description: "Please login to create a classroom.",
        variant: "destructive",
      });
      return;
    }
    
    try {
      const classroomName = `${userProfile?.displayName || 'Teacher'}'s Class`;
      const newClassroom = await createClassroom(
        currentUser.uid,
        classroomName,
        "A virtual classroom for interactive learning"
      );
      
      // Update local state
      setClassrooms(prev => [...prev, newClassroom]);
      setActiveClassroom(newClassroom);
      setClassroomId(newClassroom.id);
      setGameMode("classroom");
      
      toast({
        title: "Classroom Created",
        description: `Your classroom has been created with code: ${newClassroom.classCode}`,
      });
    } catch (error) {
      console.error('Error creating classroom:', error);
      toast({
        title: 'Error',
        description: 'Failed to create classroom.',
        variant: 'destructive',
      });
    }
  };
  
  const handleStartScenario = async (scenarioId: string) => {
    if (!activeClassroom) {
      toast({
        title: "No Active Classroom",
        description: "Please select or create a classroom first.",
        variant: "destructive",
      });
      return;
    }
    
    try {
      // Find the scenario and get its first scene
      const scenario = scenarios.find(s => s.id === scenarioId);
      if (!scenario) {
        toast({
          title: "Error",
          description: "Scenario not found.",
          variant: "destructive",
        });
        return;
      }
      
      const startScene = scenario.scenes.find(s => s.id === "start");
      if (!startScene) {
        toast({
          title: "Error",
          description: "Start scene not found in this scenario.",
          variant: "destructive",
        });
        return;
      }
      
      // Update the classroom with active scenario
      await startClassroomScenario(activeClassroom.id, scenarioId, "start");
      
      // Navigate to game page
      navigate('/game');
      
      toast({
        title: "Scenario Started",
        description: "Your students can now join and participate.",
      });
    } catch (error) {
      console.error('Error starting scenario:', error);
      toast({
        title: 'Error',
        description: 'Failed to start the scenario.',
        variant: 'destructive',
      });
    }
  };
  
  const handleAdvanceScene = async (nextSceneId: string) => {
    if (!activeClassroom) return;
    
    try {
      await advanceClassroomScene(activeClassroom.id, nextSceneId);
      
      toast({
        title: "Scene Advanced",
        description: "Moving to the next part of the story.",
      });
    } catch (error) {
      console.error('Error advancing scene:', error);
      toast({
        title: 'Error',
        description: 'Failed to advance to the next scene.',
        variant: 'destructive',
      });
    }
  };
  
  // Redirect if not logged in or not a teacher
  useEffect(() => {
    if (!currentUser && !isLoading) {
      navigate('/auth');
      toast({
        title: "Login Required",
        description: "Please log in to access the teacher dashboard.",
      });
    } else if (userProfile && userProfile.role !== 'teacher' && !isLoading) {
      navigate('/');
      toast({
        title: "Access Denied",
        description: "This area is only accessible to teachers.",
      });
    }
  }, [currentUser, userProfile, isLoading, navigate, toast]);

  // Render loading state
  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col gap-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-white gradient-heading">
              Teacher Dashboard
            </h1>
            <p className="text-white/70 mt-1">
              Manage your virtual classrooms and interactive scenarios
            </p>
          </div>
          
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              onClick={() => setGameMode(gameMode === 'classroom' ? 'individual' : 'classroom')}
              className="border-primary/20 bg-black/20 text-white hover:bg-primary/10"
            >
              {gameMode === 'classroom' ? (
                <>
                  <Users className="mr-2 h-4 w-4 text-primary" />
                  Classroom Mode
                </>
              ) : (
                <>
                  <Users className="mr-2 h-4 w-4" />
                  Switch to Classroom Mode
                </>
              )}
            </Button>
            
            {!activeClassroom && (
              <Button 
                variant="default" 
                onClick={handleCreateClassroom}
                className="bg-primary hover:bg-primary/90 text-white"
              >
                <Play className="mr-2 h-4 w-4" />
                Create Classroom
              </Button>
            )}
          </div>
        </div>
        
        {activeClassroom ? (
          <div className="bg-black/20 rounded-lg p-4 border border-white/10">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3 mb-4">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-medium text-white">{activeClassroom.name}</h2>
                  <Badge className="bg-green-500/20 text-green-300 border-0">Active</Badge>
                </div>
                <p className="text-sm text-white/70">
                  Class Code: <span className="font-mono font-bold">{activeClassroom.classCode}</span>
                </p>
              </div>
              
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="border-white/20 text-white">
                  {activeClassroom.students?.length || 0} Students
                </Badge>
                
                {activeClassroom.activeScenario ? (
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="border-primary/20 bg-black/20 text-white hover:bg-primary/10"
                    onClick={() => navigate('/game')}
                  >
                    <Play className="mr-1 h-4 w-4 text-primary" />
                    Resume Scenario
                  </Button>
                ) : (
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="border-primary/20 bg-black/20 text-white hover:bg-primary/10"
                    onClick={() => setActiveTab('scenarios')}
                  >
                    <Play className="mr-1 h-4 w-4 text-primary" />
                    Start Scenario
                  </Button>
                )}
              </div>
            </div>
            
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="w-full grid grid-cols-3 bg-black/20 border-white/10 p-1">
                <TabsTrigger value="classrooms" className="data-[state=active]:bg-primary/20">
                  <LayoutDashboard className="mr-1 h-4 w-4" />
                  Classroom
                </TabsTrigger>
                <TabsTrigger value="scenarios" className="data-[state=active]:bg-primary/20">
                  <FileText className="mr-1 h-4 w-4" />
                  Scenarios
                </TabsTrigger>
                <TabsTrigger value="metrics" className="data-[state=active]:bg-primary/20">
                  <BarChart className="mr-1 h-4 w-4" />
                  Analytics
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="classrooms" className="mt-4">
                <TeacherClassroomManager 
                  classroom={activeClassroom} 
                  onRefresh={() => {}} 
                />
              </TabsContent>
              
              <TabsContent value="scenarios" className="mt-4">
                <div className="space-y-4">
                  <h3 className="font-medium text-lg text-white">Choose a Scenario to Start</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {scenarios.map(scenario => (
                      <Card 
                        key={scenario.id}
                        className="bg-black/30 border-primary/20 overflow-hidden hover:border-primary/40 transition-all hover:shadow-md hover:shadow-primary/10"
                      >
                        <div className="h-40 relative">
                          <img 
                            src={scenario.thumbnail} 
                            alt={scenario.title} 
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>
                          <div className="absolute bottom-2 left-2">
                            <Badge className="bg-primary/30 text-white border-0">
                              {scenario.category}
                            </Badge>
                          </div>
                        </div>
                        <CardHeader className="py-3">
                          <CardTitle className="text-white text-lg">{scenario.title}</CardTitle>
                          <CardDescription className="line-clamp-2 text-white/70">
                            {scenario.description}
                          </CardDescription>
                        </CardHeader>
                        <CardFooter className="pt-0 pb-3">
                          <Button 
                            className="w-full bg-primary hover:bg-primary/90"
                            onClick={() => handleStartScenario(scenario.id)}
                          >
                            <Play className="mr-2 h-4 w-4" />
                            Start for Class
                          </Button>
                        </CardFooter>
                      </Card>
                    ))}
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="metrics" className="mt-4">
                <div className="space-y-6">
                  <div className="bg-black/30 rounded-lg p-4 border border-white/10">
                    <h3 className="font-medium mb-4 text-white">Classroom Activity</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="bg-black/20 p-3 rounded-lg border border-white/5">
                        <p className="text-white/70 text-sm">Total Students</p>
                        <div className="text-2xl font-bold text-white mt-1">
                          {activeClassroom.students?.length || 0}
                        </div>
                      </div>
                      <div className="bg-black/20 p-3 rounded-lg border border-white/5">
                        <p className="text-white/70 text-sm">Scenarios Started</p>
                        <div className="text-2xl font-bold text-white mt-1">
                          {activeClassroom.scenariosStarted?.length || 0}
                        </div>
                      </div>
                      <div className="bg-black/20 p-3 rounded-lg border border-white/5">
                        <p className="text-white/70 text-sm">Avg. Engagement</p>
                        <div className="text-2xl font-bold text-white mt-1">
                          78%
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-black/30 rounded-lg p-4 border border-white/10">
                    <h3 className="font-medium mb-4 text-white">Student Performance</h3>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center text-white/70 text-sm">
                        <span>Student</span>
                        <span>Progress</span>
                      </div>
                      
                      {(activeClassroom.students || []).slice(0, 5).map((student: any, index: number) => (
                        <div key={student.id || index} className="space-y-1">
                          <div className="flex justify-between items-center">
                            <div className="flex items-center gap-2">
                              <Avatar className="h-8 w-8">
                                <AvatarFallback className="bg-primary/20 text-white">
                                  {student.name?.charAt(0) || 'S'}
                                </AvatarFallback>
                              </Avatar>
                              <span className="text-white">{student.name || `Student ${index + 1}`}</span>
                            </div>
                            <span className="text-white">{Math.floor(Math.random() * 100)}%</span>
                          </div>
                          <Progress value={Math.floor(Math.random() * 100)} className="h-2 bg-white/10" />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        ) : (
          <Card className="bg-black/30 border-primary/20 overflow-hidden">
            <CardHeader>
              <CardTitle className="text-white text-xl">Welcome to Teacher Dashboard</CardTitle>
              <CardDescription className="text-white/70">
                Create your first classroom to get started
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center py-8 gap-4">
                <Users className="h-16 w-16 text-primary/40" />
                <p className="text-white/70 text-center max-w-md">
                  Create a classroom to start interactive sessions with your students. 
                  Students will be able to join using a class code.
                </p>
                <Button 
                  onClick={handleCreateClassroom}
                  className="mt-2 bg-primary hover:bg-primary/90"
                >
                  <Play className="mr-2 h-4 w-4" />
                  Create Your First Classroom
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {classrooms.map(classroom => (
            <Card 
              key={classroom.id} 
              className={`bg-black/30 border-primary/20 overflow-hidden hover:shadow-md transition-all ${
                activeClassroom?.id === classroom.id ? 'border-primary' : ''
              }`}
            >
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <CardTitle className="text-white">{classroom.name}</CardTitle>
                  {classroom.isActive && (
                    <Badge className="bg-green-500/20 text-green-300 border-0">Active</Badge>
                  )}
                </div>
                <CardDescription className="text-white/70">
                  {classroom.students?.length || 0} students enrolled
                </CardDescription>
              </CardHeader>
              <CardContent className="pb-0">
                <div className="flex items-center gap-2 text-sm text-white/70">
                  <Users className="h-4 w-4" />
                  <span>Class Code:</span>
                  <code className="bg-black/40 px-2 py-0.5 rounded text-primary font-mono">
                    {classroom.classCode}
                  </code>
                </div>
              </CardContent>
              <CardFooter className="pt-3">
                <Button 
                  variant="ghost" 
                  className="text-primary w-full justify-start"
                  onClick={() => {
                    setActiveClassroom(classroom);
                    setClassroomId(classroom.id);
                  }}
                >
                  {activeClassroom?.id === classroom.id ? (
                    <>
                      <CheckCircle className="mr-2 h-4 w-4" />
                      Selected
                    </>
                  ) : (
                    <>
                      <ArrowRight className="mr-2 h-4 w-4" />
                      Select Classroom
                    </>
                  )}
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TeacherDashboard;
