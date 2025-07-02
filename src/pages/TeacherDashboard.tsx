
/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, School, Users, PlusCircle, Search, Loader2, Play, Radio } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useGameContext } from '@/context/GameContext';
import { 
  getUserClassrooms, 
  createClassroom, 
  Classroom, 
  createLiveSession,
  endLiveSession,
  getActiveSession,
  LiveSession,
  onClassroomUpdated
} from '@/lib/firebase';
import ScenarioCard from '@/components/ScenarioCard';
import TeacherClassroomManager from '@/components/classroom/TeacherClassroomManager';
import ActiveSessionCard from '@/components/classroom/ActiveSessionCard';
import { scenarios } from '@/data/scenarios';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';

const TeacherDashboard = () => {
  const { userProfile, currentUser } = useAuth();
  const { setUserRole, startScenario, setClassroomId, setGameMode } = useGameContext();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [classrooms, setClassrooms] = useState<Classroom[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedClassroom, setSelectedClassroom] = useState<Classroom | null>(null);
  const [activeSession, setActiveSession] = useState<LiveSession | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [className, setClassName] = useState('');
  const [classDescription, setClassDescription] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [isEndingSession, setIsEndingSession] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [startingSession, setStartingSession] = useState<string | null>(null);
  
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
        
        if (fetchedClassrooms.length > 0 && !selectedClassroom) {
          setSelectedClassroom(fetchedClassrooms[0]);
        }
        
        setUserRole('teacher');
      } catch (error) {
        console.error('Error fetching classrooms:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchClassrooms();
  }, [currentUser, navigate, setUserRole, selectedClassroom]);

  // Listen for active session updates
  useEffect(() => {
    if (!selectedClassroom?.id) {
      setActiveSession(null);
      return;
    }

    console.log("Setting up classroom listener for:", selectedClassroom.id);
    
    const unsubscribe = onClassroomUpdated(selectedClassroom.id, async (classroom) => {
      console.log("Classroom updated:", classroom.activeSessionId);
      
      if (classroom.activeSessionId) {
        try {
          const session = await getActiveSession(classroom.id!);
          setActiveSession(session);
        } catch (error) {
          console.error("Error fetching active session:", error);
          setActiveSession(null);
        }
      } else {
        setActiveSession(null);
      }
    });

    return () => unsubscribe();
  }, [selectedClassroom?.id]);
  
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
        
        setClassrooms(prev => [...prev, newClassroom]);
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

  const handleEndSession = async () => {
    if (!activeSession?.id || !selectedClassroom?.id) return;

    try {
      setIsEndingSession(true);
      
      const resultPayload = {
        choices: activeSession.currentChoices || {},
        summary: `Session completed for "${activeSession.scenarioTitle}"`
      };
      
      await endLiveSession(activeSession.id, selectedClassroom.id, resultPayload);
      setActiveSession(null);
      
      toast({
        title: "Session Ended",
        description: "The live session has been ended successfully.",
      });
    } catch (error) {
      console.error("Error ending session:", error);
      toast({
        title: "Error",
        description: "Failed to end the session. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsEndingSession(false);
    }
  };

  const handleViewSession = () => {
    if (selectedClassroom?.id && activeSession) {
      setClassroomId(selectedClassroom.id);
      setGameMode("classroom");
      startScenario(activeSession.scenarioId);
      navigate('/game');
    }
  };

  const handleStartLiveScenario = async (scenarioId: string) => {
    if (!selectedClassroom || !currentUser) {
      toast({
        title: "Classroom Required",
        description: "Please select a classroom before starting a live scenario.",
        variant: "destructive",
      });
      return;
    }

    if (activeSession) {
      toast({
        title: "Session Already Active",
        description: "Please end the current session before starting a new one.",
        variant: "destructive",
      });
      return;
    }

    setStartingSession(scenarioId);
    try {
      const scenario = scenarios.find(s => s.id === scenarioId);
      if (!scenario) {
        throw new Error("Scenario not found");
      }

      console.log("Starting live session smoothly for:", scenario.title);

      // Create live session
      const liveSession = await createLiveSession(
        selectedClassroom.id!,
        currentUser.uid,
        scenarioId,
        scenario.title,
        scenario.scenes[0].id
      );

      console.log("Live session created:", liveSession);

      setActiveSession(liveSession);
      setClassroomId(selectedClassroom.id!);
      setGameMode("classroom");
      startScenario(scenarioId);
      
      toast({
        title: "🚀 Live Session Started!",
        description: `Students will receive immediate notifications to join "${scenario.title}"`,
      });
      
      navigate('/game');
    } catch (error) {
      console.error("Error starting live scenario:", error);
      toast({
        title: "Error",
        description: "Failed to start live scenario. Please try again.",
        variant: "destructive",
      });
    } finally {
      setStartingSession(null);
    }
  };

  const handleScenarioClick = (scenarioId: string) => {
    if (selectedClassroom) {
      if (activeSession) {
        toast({
          title: "Session Already Active",
          description: "Please end the current session before starting a new one.",
          variant: "destructive",
        });
        return;
      }
      
      // For teachers with classrooms, default to live session
      handleStartLiveScenario(scenarioId);
    } else {
      startScenario(scenarioId);
      navigate('/game');
    }
  };
  
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
              Manage your classrooms and create live learning experiences
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

          {/* Active Session Status */}
          {activeSession && (
            <ActiveSessionCard
              session={activeSession}
              onEndSession={handleEndSession}
              onViewSession={handleViewSession}
              isEnding={isEndingSession}
            />
          )}
          
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
                        <div className="flex items-center gap-2">
                          {classroom.activeSessionId && (
                            <Badge className="bg-green-500/20 text-green-300 border-0 text-xs">
                              Live
                            </Badge>
                          )}
                          <Badge className="bg-black/40 text-primary border-0">
                            {classroom.students?.length || 0} students
                          </Badge>
                        </div>
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
                  {selectedClassroom && !activeSession && (
                    <Button
                      onClick={() => handleStartLiveScenario(scenarios[0].id)}
                      className="bg-green-500 hover:bg-green-600"
                      disabled={!!startingSession}
                    >
                      <Radio className="mr-2 h-4 w-4" />
                      {startingSession ? "Starting..." : "Quick Start Live Session"}
                    </Button>
                  )}
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
                  ? `Manage ${selectedClassroom.students?.length || 0} students and start live scenarios` 
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
        <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
          Available Scenarios
          {selectedClassroom && !activeSession && (
            <Badge className="bg-blue-500/20 text-blue-300 border-0">
              Click to start live session
            </Badge>
          )}
          {activeSession && (
            <Badge className="bg-orange-500/20 text-orange-300 border-0">
              End current session to start new scenario
            </Badge>
          )}
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {scenarios.slice(0, 6).map((scenario) => {
            const isStarting = startingSession === scenario.id;
            
            return (
              <div key={scenario.id} className="relative">
                <ScenarioCard 
                  scenario={scenario}
                  onStart={handleScenarioClick}
                  onClick={() => handleScenarioClick(scenario.id)}
                  disabled={!!activeSession || isStarting}
                />
                {selectedClassroom && !activeSession && !isStarting && (
                  <div className="absolute top-2 right-2">
                    <Badge className="bg-green-500/20 text-green-300 border-0 text-xs">
                      Live Ready
                    </Badge>
                  </div>
                )}
                {isStarting && (
                  <div className="absolute inset-0 bg-black/50 rounded-lg flex items-center justify-center">
                    <div className="flex flex-col items-center gap-2">
                      <Loader2 className="h-8 w-8 text-green-400 animate-spin" />
                      <Badge className="bg-green-500/20 text-green-300 border-0">
                        Starting Live Session...
                      </Badge>
                    </div>
                  </div>
                )}
                {activeSession && !isStarting && (
                  <div className="absolute inset-0 bg-black/50 rounded-lg flex items-center justify-center">
                    <Badge className="bg-orange-500/20 text-orange-300 border-0">
                      Session Active
                    </Badge>
                  </div>
                )}
              </div>
            );
          })}
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
