
/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, School, Users, BookOpen, BarChart3, PlusCircle, Search, Loader2 } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useGameContext } from '@/context/GameContext';
import { getClassrooms, getUserClassrooms, createClassroom, Classroom } from '@/lib/firebase';
import ScenarioCard from '@/components/ScenarioCard';
import TeacherClassroomManager from '@/components/classroom/TeacherClassroomManager';
import { scenarios } from '@/data/scenarios';
import { useToast } from '@/components/ui/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';

const TeacherDashboard = () => {
  const { userProfile, currentUser } = useAuth();
  const { setUserRole, startScenario, setClassroomId, setGameMode } = useGameContext();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [activeTab, setActiveTab] = useState("classrooms");
  const [classrooms, setClassrooms] = useState<Classroom[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedClassroom, setSelectedClassroom] = useState<Classroom | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [className, setClassName] = useState('');
  const [classDescription, setClassDescription] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Fetch teacher's classrooms
  useEffect(() => {
    const fetchClassrooms = async () => {
      if (!currentUser) {
        navigate('/auth');
        return;
      }
      
      try {
        setLoading(true);
        const fetchedClassrooms = await getUserClassrooms(currentUser.uid, 'teacher');
        console.log("Fetched classrooms:", fetchedClassrooms);
        setClassrooms(fetchedClassrooms);
        
        // If classrooms exist, select the first one by default
        if (fetchedClassrooms.length > 0) {
          setSelectedClassroom(fetchedClassrooms[0]);
        }
        
        // Ensure the role is set to teacher
        setUserRole('teacher');
      } catch (error) {
        console.error('Error fetching classrooms:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchClassrooms();
  }, [currentUser, navigate, setUserRole]);
  
  const handleCreateClassroom = async () => {
    if (!currentUser) {
      toast({
        title: "Login Required",
        description: "Please login to create a classroom",
        variant: "destructive",
      });
      return;
    }

    if (!className.trim()) {
      toast({
        title: "Class Name Required",
        description: "Please enter a name for your classroom",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsCreating(true);
      console.log("Creating classroom with name:", className);
      
      const newClassroom = await createClassroom(
        currentUser.uid,
        className,
        classDescription
      );
      
      console.log("Classroom created:", newClassroom);
      
      if (newClassroom && newClassroom.id) {
        setClassroomId(newClassroom.id);
        setGameMode("classroom");
        
        toast({
          title: "Classroom Created",
          description: `Your classroom '${className}' has been created successfully with code: ${newClassroom.classCode}`,
        });
        
        // Add the new classroom to the list
        setClassrooms(prev => [...prev, newClassroom]);
        
        // Select the new classroom
        setSelectedClassroom(newClassroom);
        
        setIsCreateModalOpen(false);
        setClassName('');
        setClassDescription('');
        await handleRefresh();
      } else {
        throw new Error("Failed to create classroom");
      }
    } catch (error) {
      console.error('Error creating classroom:', error);
      toast({
        title: "Error",
        description: "Failed to create classroom. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsCreating(false);
    }
  };
  
  const handleRefresh = async () => {
    if (!currentUser) return;
    
    try {
      setLoading(true);
      const fetchedClassrooms = await getUserClassrooms(currentUser.uid, 'teacher');
      console.log("Refreshed classrooms:", fetchedClassrooms);
      setClassrooms(fetchedClassrooms);
      
      // Update selected classroom with refreshed data
      if (selectedClassroom) {
        const updatedSelectedClassroom = fetchedClassrooms.find(c => c.id === selectedClassroom.id);
        setSelectedClassroom(updatedSelectedClassroom || fetchedClassrooms[0]);
      }
    } catch (error) {
      console.error('Error refreshing classrooms:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleScenarioClick = (scenarioId: string) => {
    startScenario(scenarioId);
    navigate('/game');
  };
  
  // Filter classrooms based on search term
  const filteredClassrooms = classrooms.filter(classroom => 
    classroom.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (!currentUser) {
    navigate('/auth');
    return null;
  }
  
  return (
    <div className="container mx-auto px-4 py-8">
      <header className="mb-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-white flex items-center gap-2">
              <School className="h-8 w-8 text-primary" />
              Teacher Dashboard
            </h1>
            <p className="text-white/70 mt-2">
              Manage your classrooms and track student progress
            </p>
          </div>
          <Button 
            onClick={() => setIsCreateModalOpen(true)}
            className="bg-primary hover:bg-primary/90 hidden md:flex"
          >
            <PlusCircle className="mr-2 h-4 w-4" />
            Create Classroom
          </Button>
        </div>
      </header>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-1 space-y-6">
          <Card className="bg-black/30 border-primary/20">
            <CardHeader>
              <CardTitle className="text-white">Teacher Profile</CardTitle>
              <CardDescription className="text-white/70">
                {userProfile?.displayName || 'Teacher'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-black/20 rounded-lg p-4 flex flex-col items-center">
                    <Users className="h-6 w-6 text-primary mb-1" />
                    <div className="text-2xl font-bold text-white">
                      {classrooms.reduce((total, classroom) => total + (classroom.students?.length || 0), 0)}
                    </div>
                    <div className="text-xs text-white/70">Students</div>
                  </div>
                  
                  <div className="bg-black/20 rounded-lg p-4 flex flex-col items-center">
                    <School className="h-6 w-6 text-primary mb-1" />
                    <div className="text-2xl font-bold text-white">
                      {classrooms.length}
                    </div>
                    <div className="text-xs text-white/70">Classrooms</div>
                  </div>
                </div>
                
                <Button 
                  variant="default" 
                  className="w-full bg-primary hover:bg-primary/90"
                  onClick={() => navigate('/game')}
                >
                  Start New Scenario
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-black/30 border-primary/20">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-white">My Classrooms</CardTitle>
                <Button 
                  variant="outline" 
                  size="sm"
                  className="border-white/20 bg-black/20 text-white hover:bg-white/10"
                  onClick={() => setIsCreateModalOpen(true)}
                >
                  <PlusCircle className="h-4 w-4" />
                </Button>
              </div>
              <div className="relative mt-2">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-white/50" />
                <Input
                  placeholder="Search classrooms..."
                  className="pl-8 bg-black/20 border-white/20 text-white w-full"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex justify-center py-4">
                  <Loader2 className="h-6 w-6 text-primary animate-spin" />
                </div>
              ) : filteredClassrooms.length > 0 ? (
                <ScrollArea className="h-[300px] pr-4">
                  <div className="space-y-3">
                    {filteredClassrooms.map((classroom) => (
                      <Button 
                        key={classroom.id} 
                        variant="outline" 
                        className={`w-full justify-between border-white/20 bg-black/20 hover:bg-white/10 ${
                          selectedClassroom?.id === classroom.id ? 'border-primary text-primary' : 'text-white'
                        }`}
                        onClick={() => setSelectedClassroom(classroom)}
                      >
                        <div className="flex flex-col items-start text-left">
                          <span>{classroom.name}</span>
                          <span className="text-xs opacity-70">
                            Created: {classroom.createdAt ? new Date((classroom.createdAt as any).seconds * 1000).toLocaleDateString() : 'Recently'}
                          </span>
                        </div>
                        <Badge className="bg-black/40 text-primary border-0">
                          {classroom.students?.length || 0} students
                        </Badge>
                      </Button>
                    ))}
                  </div>
                </ScrollArea>
              ) : (
                <div className="text-center py-4">
                  {searchTerm ? (
                    <p className="text-white/70">No classrooms match your search</p>
                  ) : (
                    <>
                      <p className="text-white/70 mb-3">No classrooms created yet</p>
                      <Button 
                        onClick={() => setIsCreateModalOpen(true)}
                        className="bg-primary hover:bg-primary/90"
                      >
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Create Classroom
                      </Button>
                    </>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
        
        <div className="md:col-span-2">
          <Card className="bg-black/30 border-primary/20">
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle className="text-white">
                  {selectedClassroom ? selectedClassroom.name : "Classroom Management"}
                </CardTitle>
                <div className="flex gap-2">
                  {!selectedClassroom && (
                    <Button 
                      onClick={() => setIsCreateModalOpen(true)}
                      className="bg-primary hover:bg-primary/90"
                    >
                      <PlusCircle className="mr-2 h-4 w-4" />
                      Create Classroom
                    </Button>
                  )}
                  <Button 
                    variant="outline" 
                    className="border-white/20 bg-black/20 text-white hover:bg-white/10"
                    onClick={handleRefresh}
                    disabled={loading}
                  >
                    {loading ? 
                      <Loader2 className="h-4 w-4 animate-spin" /> 
                      : "Refresh"
                    }
                  </Button>
                </div>
              </div>
              <CardDescription className="text-white/70">
                {selectedClassroom 
                  ? `Manage ${selectedClassroom.students?.length || 0} students` 
                  : "Create and manage your classrooms"}
              </CardDescription>
            </CardHeader>
            
            <CardContent>
              {selectedClassroom ? (
                <TeacherClassroomManager 
                  classroom={selectedClassroom}
                  onRefresh={handleRefresh}
                />
              ) : (
                <div className="flex flex-col items-center justify-center py-12">
                  <School className="h-16 w-16 text-white/20 mb-4" />
                  <h3 className="text-xl font-medium text-white mb-2">No Classroom Selected</h3>
                  <p className="text-white/70 text-center max-w-md mb-4">
                    Create a new classroom to start engaging with your students through interactive scenarios.
                  </p>
                  <Button 
                    className="bg-primary hover:bg-primary/90"
                    onClick={() => setIsCreateModalOpen(true)}
                  >
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Create New Classroom
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
      
      <div className="mt-8">
        <h2 className="text-2xl font-bold text-white mb-6">Available Scenarios</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {scenarios.slice(0, 6).map((scenario) => (
            <ScenarioCard 
              key={scenario.id}
              scenario={scenario}
              onStart={handleScenarioClick}
              onClick={() => handleScenarioClick(scenario.id)}
            />
          ))}
        </div>
      </div>

      {/* Create Classroom Modal */}
      <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
        <DialogContent className="bg-black/95 border border-primary/20 text-white">
          <DialogHeader>
            <DialogTitle className="text-white text-xl">Create a Classroom</DialogTitle>
            <DialogDescription className="text-white/70">
              Fill out the form below to create your virtual classroom.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <label className="text-sm text-white/70">Classroom Name</label>
              <Input
                value={className}
                onChange={(e) => setClassName(e.target.value)}
                placeholder="e.g., Introduction to Psychology"
                className="bg-black/40 border-white/20 text-white"
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm text-white/70">Description (Optional)</label>
              <Input
                value={classDescription}
                onChange={(e) => setClassDescription(e.target.value)}
                placeholder="Brief description of your class"
                className="bg-black/40 border-white/20 text-white"
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setIsCreateModalOpen(false)}
              className="border-white/20 text-white hover:bg-white/10"
            >
              Cancel
            </Button>
            <Button 
              onClick={handleCreateClassroom}
              disabled={isCreating}
              className="bg-primary hover:bg-primary/90"
            >
              {isCreating ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <>Create Classroom</>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TeacherDashboard;
