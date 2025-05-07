
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/context/AuthContext';
import { useGameContext } from '@/context/GameContext';
import { Plus, Book, Users, ChevronRight, RefreshCw, Share2 } from 'lucide-react';
import { createClassroom, getUserClassrooms, startClassroomScenario } from '@/lib/firebase';
import { Classroom } from '@/lib/firebase';

const TeacherDashboard = () => {
  const [classrooms, setClassrooms] = useState<Classroom[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [newClassName, setNewClassName] = useState('');
  const [newClassDescription, setNewClassDescription] = useState('');
  
  const { userProfile } = useAuth();
  const { setGameMode, startScenario, resetGame, scenarios, setClassroomId } = useGameContext();
  const { toast } = useToast();
  const navigate = useNavigate();
  
  useEffect(() => {
    // Redirect if not logged in or not a teacher
    if (!userProfile) {
      navigate('/auth');
      return;
    }
    
    if (userProfile && userProfile.role !== 'teacher') {
      navigate('/profile');
      return;
    }
    
    // Set classroom mode
    setGameMode('classroom');
    
    // Load teacher's classrooms
    loadClassrooms();
  }, [userProfile, navigate]);
  
  const loadClassrooms = async () => {
    if (!userProfile) return;
    
    try {
      setIsLoading(true);
      const loadedClassrooms = await getUserClassrooms(userProfile.id, 'teacher');
      setClassrooms(loadedClassrooms);
    } catch (error) {
      console.error('Error loading classrooms:', error);
      toast({
        title: 'Error',
        description: 'Failed to load your classrooms',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleCreateClassroom = async () => {
    if (!userProfile || !newClassName.trim()) return;
    
    try {
      setIsCreating(true);
      const newClassroom = await createClassroom(
        userProfile.id,
        newClassName,
        userProfile.displayName,
        newClassDescription
      );
      
      setClassrooms([...classrooms, newClassroom]);
      setNewClassName('');
      setNewClassDescription('');
      
      toast({
        title: 'Classroom Created',
        description: `${newClassName} has been created successfully`,
      });
    } catch (error: any) {
      toast({
        title: 'Creation Failed',
        description: error.message || 'Could not create classroom',
        variant: 'destructive',
      });
    } finally {
      setIsCreating(false);
    }
  };
  
  const handleEnterClassroom = (classroom: Classroom) => {
    setClassroomId(classroom.id);
    navigate('/game');
  };
  
  const handleStartScenario = (classroom: Classroom, scenarioId: string, initialSceneId: string) => {
    resetGame();
    setGameMode('classroom');
    setClassroomId(classroom.id);
    startScenario(scenarioId);
    
    // Update database with scenario selection
    startClassroomScenario(classroom.id, scenarioId, initialSceneId);
    
    navigate('/game');
  };
  
  if (!userProfile) {
    return <div className="container mx-auto p-8 text-center">Loading...</div>;
  }
  
  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white">Teacher Dashboard</h1>
          <p className="text-white/70">Manage your classrooms and scenarios</p>
        </div>
        
        <div className="flex gap-2">
          <Button variant="outline" onClick={loadClassrooms} className="bg-white/5 border-white/20">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          
          <Dialog>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                New Classroom
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-black/80 border-white/10 text-white">
              <DialogHeader>
                <DialogTitle>Create New Classroom</DialogTitle>
                <DialogDescription className="text-white/70">
                  Set up a new classroom for your students
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <label className="text-right text-white/70 col-span-1">Name</label>
                  <Input
                    placeholder="Enter classroom name"
                    value={newClassName}
                    onChange={(e) => setNewClassName(e.target.value)}
                    className="col-span-3 bg-black/50 border-white/20"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <label className="text-right text-white/70 col-span-1">Description</label>
                  <Input
                    placeholder="Optional description"
                    value={newClassDescription}
                    onChange={(e) => setNewClassDescription(e.target.value)}
                    className="col-span-3 bg-black/50 border-white/20"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button 
                  onClick={handleCreateClassroom} 
                  disabled={isCreating || !newClassName}
                >
                  {isCreating ? 'Creating...' : 'Create Classroom'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>
      
      <Tabs defaultValue="classrooms">
        <TabsList className="bg-black/30 border border-white/10">
          <TabsTrigger value="classrooms" className="data-[state=active]:bg-primary/20">
            <Users className="mr-2 h-4 w-4" />
            My Classrooms
          </TabsTrigger>
          <TabsTrigger value="scenarios" className="data-[state=active]:bg-primary/20">
            <Book className="mr-2 h-4 w-4" />
            Available Scenarios
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="classrooms" className="mt-6">
          {isLoading ? (
            <div className="text-center py-12">
              <div className="h-8 w-8 border-4 border-t-primary border-white/20 rounded-full animate-spin mx-auto"></div>
              <p className="mt-4 text-white/70">Loading your classrooms...</p>
            </div>
          ) : classrooms.length > 0 ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {classrooms.map((classroom) => (
                <Card key={classroom.id} className="bg-black/40 backdrop-blur-md border-white/10">
                  <CardHeader>
                    <CardTitle className="text-white">{classroom.name}</CardTitle>
                    <CardDescription>
                      {classroom.students?.length || 0} student{classroom.students?.length !== 1 ? 's' : ''}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-sm text-white/70">
                      Class Code: <span className="font-mono bg-black/30 px-2 py-1 rounded">{classroom.classCode}</span>
                    </div>
                    
                    {classroom.activeScenario && (
                      <div className="mt-4 p-3 bg-primary/20 border border-primary/40 rounded-lg">
                        <h4 className="font-semibold text-primary">Active Scenario</h4>
                        <p className="text-sm text-white/80">
                          {scenarios.find(s => s.id === classroom.activeScenario)?.title || 'Unknown scenario'}
                        </p>
                      </div>
                    )}
                  </CardContent>
                  <CardFooter className="flex flex-col gap-2">
                    <Button 
                      className="w-full justify-between"
                      onClick={() => handleEnterClassroom(classroom)}
                    >
                      Manage Classroom
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                    
                    <Button
                      variant="outline"
                      className="w-full justify-between bg-white/5 border-white/20"
                    >
                      Share Class Code
                      <Share2 className="h-4 w-4" />
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="bg-black/40 backdrop-blur-md border-white/10">
              <CardHeader>
                <CardTitle>No Classrooms Yet</CardTitle>
                <CardDescription>Create your first classroom to get started</CardDescription>
              </CardHeader>
              <CardContent className="text-center">
                <Users className="h-16 w-16 mx-auto text-white/20 mb-4" />
                <p className="text-white/70 mb-4">
                  Classrooms let you manage students and run scenarios as a group
                </p>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      Create First Classroom
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="bg-black/80 border-white/10 text-white">
                    <DialogHeader>
                      <DialogTitle>Create New Classroom</DialogTitle>
                      <DialogDescription className="text-white/70">
                        Set up a new classroom for your students
                      </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="grid grid-cols-4 items-center gap-4">
                        <label className="text-right text-white/70 col-span-1">Name</label>
                        <Input
                          placeholder="Enter classroom name"
                          value={newClassName}
                          onChange={(e) => setNewClassName(e.target.value)}
                          className="col-span-3 bg-black/50 border-white/20"
                        />
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <label className="text-right text-white/70 col-span-1">Description</label>
                        <Input
                          placeholder="Optional description"
                          value={newClassDescription}
                          onChange={(e) => setNewClassDescription(e.target.value)}
                          className="col-span-3 bg-black/50 border-white/20"
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button 
                        onClick={handleCreateClassroom} 
                        disabled={isCreating || !newClassName}
                      >
                        {isCreating ? 'Creating...' : 'Create Classroom'}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </CardContent>
            </Card>
          )}
        </TabsContent>
        
        <TabsContent value="scenarios" className="mt-6">
          {classrooms.length === 0 ? (
            <Card className="bg-black/40 backdrop-blur-md border-white/10">
              <CardHeader>
                <CardTitle>Create a Classroom First</CardTitle>
                <CardDescription>
                  You need to create a classroom before you can assign scenarios
                </CardDescription>
              </CardHeader>
              <CardContent className="text-center">
                <Button onClick={() => document.querySelector('[data-value="classrooms"]')?.dispatchEvent(new Event('click'))}>
                  Go to Classrooms Tab
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-8">
              {scenarios.map((scenario) => (
                <Card key={scenario.id} className="bg-black/40 backdrop-blur-md border-white/10">
                  <CardHeader>
                    <CardTitle className="text-white">{scenario.title}</CardTitle>
                    <CardDescription>{scenario.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <p className="text-sm text-white/70">
                        Duration: {scenario.estimatedTime || '15-20 minutes'}
                      </p>
                      
                      <div className="flex flex-wrap gap-2 mt-2">
                        {scenario.tags && scenario.tags.map((tag: string) => (
                          <span 
                            key={tag} 
                            className="bg-white/10 text-white/80 px-2 py-1 rounded text-xs"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <div className="w-full">
                      <p className="text-sm text-white/70 mb-3">Select a classroom to start this scenario:</p>
                      <div className="grid gap-2">
                        {classrooms.map((classroom) => {
                          // Get the first scene ID for this scenario to use as starting point
                          const firstSceneId = scenario.scenes.length > 0 ? scenario.scenes[0].id : '';
                          
                          return (
                            <Button 
                              key={classroom.id} 
                              variant="secondary" 
                              className="justify-between"
                              onClick={() => handleStartScenario(classroom, scenario.id, firstSceneId)}
                            >
                              {classroom.name}
                              <ChevronRight className="h-4 w-4" />
                            </Button>
                          );
                        })}
                      </div>
                    </div>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default TeacherDashboard;
