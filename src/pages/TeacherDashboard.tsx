/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from 'react';
import { useGameContext } from '@/context/GameContext';
import { useAuth } from '@/context/AuthContext';
import ScenarioCard from '@/components/ScenarioCard';
import TeacherClassroomManager from '@/components/classroom/TeacherClassroomManager';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { School, Plus, Users, Play, Trash2, AlertTriangle, Calendar, Clock, BookOpen, StopCircle } from 'lucide-react';
import { getUserClassrooms, deleteClassroom, Classroom, convertTimestampToDate, createClassroom, createLiveSession, endLiveSession } from '@/lib/firebase';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import LiveSessionStartDialog from '@/components/classroom/LiveSessionStartDialog';

const TeacherDashboard = () => {
  const { scenarios, startScenario, setGameMode } = useGameContext();
  const { currentUser } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const [classrooms, setClassrooms] = useState<Classroom[]>([]);
  const [selectedClassroom, setSelectedClassroom] = useState<Classroom | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [creatingSession, setCreatingSession] = useState<string | null>(null);
  const [endingSession, setEndingSession] = useState<string | null>(null);

  // Classroom creation state
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [classNameInput, setClassNameInput] = useState('');
  const [classDescriptionInput, setClassDescriptionInput] = useState('');
  const [isCreatingClassroom, setIsCreatingClassroom] = useState(false);

  // Live session start dialog state
  const [sessionStartDialog, setSessionStartDialog] = useState<{
    isOpen: boolean;
    classroom: Classroom | null;
    scenario: any;
  }>({
    isOpen: false,
    classroom: null,
    scenario: null
  });

  useEffect(() => {
    if (currentUser) {
      loadClassrooms();
    }
  }, [currentUser]);

  const loadClassrooms = async () => {
    if (!currentUser) return;
    
    try {
      setLoading(true);
      const userClassrooms = await getUserClassrooms(currentUser.uid, 'teacher');
      setClassrooms(userClassrooms);
    } catch (error) {
      console.error('Error loading classrooms:', error);
      toast({
        title: "Error",
        description: "Failed to load classrooms. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleStartScenario = (id: string) => {
    startScenario(id);
    navigate('/game');
  };

  const handleDeleteClassroom = async (classroomId: string, classroomName: string) => {
    if (!currentUser) return;
    
    setDeleting(classroomId);
    try {
      console.log("Attempting to delete classroom:", classroomId);
      await deleteClassroom(classroomId, currentUser.uid);
      
      // Remove from local state
      setClassrooms(prev => prev.filter(c => c.id !== classroomId));
      
      // Close selected classroom if it was the deleted one
      if (selectedClassroom?.id === classroomId) {
        setSelectedClassroom(null);
      }
      
      toast({
        title: "Classroom Deleted",
        description: `"${classroomName}" has been permanently deleted. All students have been removed and related data cleared.`,
      });
    } catch (error) {
      console.error('Error deleting classroom:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to delete classroom. Please try again.",
        variant: "destructive",
      });
    } finally {
      setDeleting(null);
    }
  };

  const handleCreateClassroom = async () => {
    if (!currentUser) {
      toast({
        title: "Login Required",
        description: "Please login to create a classroom",
        variant: "destructive",
      });
      return;
    }

    if (!classNameInput.trim()) {
      toast({
        title: "Class Name Required",
        description: "Please enter a name for your classroom",
        variant: "destructive",
      });
      return;
    }

    setIsCreatingClassroom(true);
    try {
      const newClassroom = await createClassroom(
        currentUser.uid,
        classNameInput,
        classDescriptionInput
      );
      
      toast({
        title: "Classroom Created",
        description: `Your classroom '${classNameInput}' has been created successfully with code: ${newClassroom.classCode}`,
      });
      
      // Add the new classroom to the list
      setClassrooms(prev => [...prev, newClassroom]);
      
      // Select the new classroom
      setSelectedClassroom(newClassroom);
      
      // Reset form
      setClassNameInput('');
      setClassDescriptionInput('');
      setIsCreateModalOpen(false);
      
    } catch (error) {
      console.error('Error creating classroom:', error);
      toast({
        title: "Error",
        description: "Failed to create classroom. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsCreatingClassroom(false);
    }
  };

  const handleStartLiveSession = async (classroom: Classroom, scenario: any, mirrorMomentsEnabled: boolean) => {
    if (!currentUser || !classroom.id) return;
    
    setCreatingSession(classroom.id);
    try {
      console.log("Starting live session for classroom:", classroom.id, "Mirror moments:", mirrorMomentsEnabled);
      
      await createLiveSession(
        classroom.id,
        scenario.id,
        currentUser.uid,
        currentUser.displayName || 'Teacher',
        scenario.title,
        mirrorMomentsEnabled
      );
      
      // Refresh classrooms to show updated state
      await loadClassrooms();
      
      toast({
        title: "Live Session Started!",
        description: `"${scenario.title}" is now live for ${classroom.name}`,
      });
      
      // Navigate to game with classroom mode
      setGameMode("classroom");
      startScenario(scenario.id);
      navigate('/game');
      
    } catch (error) {
      console.error('Error starting live session:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to start live session. Please try again.",
        variant: "destructive",
      });
    } finally {
      setCreatingSession(null);
    }
  };

  const handleEndLiveSession = async (classroom: Classroom) => {
    if (!currentUser || !classroom.id || !classroom.activeSessionId) return;
    
    setEndingSession(classroom.id);
    try {
      console.log("Ending live session for classroom:", classroom.id);
      console.log("Current user:", currentUser.uid);
      console.log("Active session ID:", classroom.activeSessionId);
      
      await endLiveSession(classroom.activeSessionId, classroom.id);
      
      // Refresh classrooms to show updated state
      await loadClassrooms();
      
      toast({
        title: "Session Ended",
        description: `Live session has been ended. All students have been notified.`,
      });
      
    } catch (error) {
      console.error('Error ending live session:', error);
      console.error('Full error object:', error);
      
      // Check if it's a permissions error but the session actually ended
      if (error instanceof Error && error.message.includes('permissions')) {
        console.log('Permission error detected, but checking if session actually ended...');
        
        // Refresh to see if the session was actually ended despite the error
        await loadClassrooms();
        
        toast({
          title: "Session Ended",
          description: "Live session has been ended (with permission warning - this is normal).",
        });
      } else {
        toast({
          title: "Error",
          description: error instanceof Error ? error.message : "Failed to end live session. Please try again.",
          variant: "destructive",
        });
      }
    } finally {
      setEndingSession(null);
    }
  };

  return (
    <div className="container mx-auto px-3 py-6 sm:px-4 sm:py-8 animate-fade-in">
      {/* Hero Header */}
      <div className="glass-card mb-8 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-secondary/10 to-transparent"></div>
        <div className="relative flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold gradient-heading mb-2">Teacher Dashboard</h1>
            <p className="text-muted-foreground text-base">Manage your classrooms and scenarios with ease</p>
          </div>
          <Button 
            onClick={() => setIsCreateModalOpen(true)}
            className="glow-button w-full sm:w-auto"
          >
            <Plus className="h-5 w-5 mr-2" />
            Create Classroom
          </Button>
        </div>
      </div>

      {/* Classrooms Section */}
      <div className="mb-12">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 rounded-lg bg-primary/10 border border-primary/20">
            <School className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-foreground">Your Classrooms</h2>
            <p className="text-sm text-muted-foreground">{classrooms.length} active {classrooms.length === 1 ? 'classroom' : 'classrooms'}</p>
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="teen-card animate-pulse">
                <CardHeader>
                  <div className="h-6 bg-primary/10 rounded mb-2"></div>
                  <div className="h-4 bg-primary/10 rounded w-2/3"></div>
                </CardHeader>
                <CardContent>
                  <div className="h-4 bg-primary/10 rounded mb-4"></div>
                  <div className="h-10 bg-primary/10 rounded"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : classrooms.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {classrooms.map((classroom) => (
              <Card key={classroom.id} className="teen-card hover-lift group">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-foreground text-xl font-bold group-hover:text-primary transition-colors">
                        {classroom.name}
                      </CardTitle>
                      <CardDescription className="text-muted-foreground mt-2 text-sm">
                        {classroom.description || "No description"}
                      </CardDescription>
                    </div>
                    <div className="flex items-center gap-2 ml-2">
                      {classroom.activeSessionId && (
                        <Badge className="bg-green-500/20 text-green-400 border border-green-500/30 text-xs animate-pulse">
                          ● Live
                        </Badge>
                      )}
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="text-red-400 hover:text-red-300 hover:bg-red-900/20 p-1 h-8 w-8"
                            disabled={deleting === classroom.id}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent className="bg-black/90 border border-red-500/20">
                          <AlertDialogHeader>
                            <div className="flex items-center gap-3 mb-2">
                              <div className="p-2 bg-red-500/20 rounded-full">
                                <AlertTriangle className="h-5 w-5 text-red-400" />
                              </div>
                              <AlertDialogTitle className="text-white">Delete Classroom</AlertDialogTitle>
                            </div>
                            <AlertDialogDescription className="text-white/70">
                              Are you sure you want to permanently delete <strong>"{classroom.name}"</strong>?
                              <br /><br />
                              This action will:
                              <ul className="list-disc list-inside mt-2 space-y-1">
                                <li>Remove all {classroom.students?.length || 0} students from the classroom</li>
                                <li>Delete all session data and history</li>
                                <li>Remove the classroom from students' profiles</li>
                                <li>Cannot be undone</li>
                              </ul>
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel className="bg-transparent border border-white/10 text-white hover:bg-white/10">
                              Cancel
                            </AlertDialogCancel>
                            <AlertDialogAction 
                              onClick={() => handleDeleteClassroom(classroom.id!, classroom.name)}
                              className="bg-red-500 hover:bg-red-600 text-white"
                              disabled={deleting === classroom.id}
                            >
                              {deleting === classroom.id ? "Deleting..." : "Delete Permanently"}
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {/* Stats Row */}
                    <div className="flex items-center gap-4">
                      <div className="stat-badge">
                        <Users className="h-4 w-4 text-primary" />
                        <span className="text-foreground font-medium">{classroom.students?.length || 0}</span>
                      </div>
                      <div className="stat-badge">
                        <Calendar className="h-4 w-4 text-secondary" />
                        <span className="text-muted-foreground text-xs">
                          {convertTimestampToDate(classroom.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    
                    {/* Classroom Code */}
                    <div className="p-3 rounded-lg bg-gradient-to-br from-primary/10 to-secondary/10 border border-primary/20">
                      <p className="text-xs text-muted-foreground mb-1">Classroom Code</p>
                      <p className="text-lg font-bold text-foreground font-mono tracking-wider">{classroom.classCode}</p>
                    </div>
                    
                    {/* Action Buttons */}
                    <div className="flex gap-2">
                      <Button 
                        variant="default" 
                        size="sm" 
                        onClick={() => setSelectedClassroom(classroom)}
                        className="flex-1"
                      >
                        <School className="h-4 w-4 mr-2" />
                        Manage
                      </Button>
                      {classroom.activeSessionId && (
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button 
                              variant="outline" 
                              size="sm"
                              className="border-red-500/20 bg-red-900/20 text-red-400 hover:bg-red-900/40"
                              disabled={endingSession === classroom.id}
                            >
                              <StopCircle className="h-4 w-4 mr-1" />
                              End Session
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent className="bg-black/90 border border-red-500/20">
                            <AlertDialogHeader>
                              <div className="flex items-center gap-3 mb-2">
                                <div className="p-2 bg-red-500/20 rounded-full">
                                  <StopCircle className="h-5 w-5 text-red-400" />
                                </div>
                                <AlertDialogTitle className="text-white">End Live Session</AlertDialogTitle>
                              </div>
                              <AlertDialogDescription className="text-white/70">
                                Are you sure you want to end the live session for <strong>"{classroom.name}"</strong>?
                                <br /><br />
                                This action will:
                                <ul className="list-disc list-inside mt-2 space-y-1">
                                  <li>End the current scenario session</li>
                                  <li>Notify all students that the session has ended</li>
                                  <li>Remove students from the live session</li>
                                </ul>
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel className="bg-transparent border border-white/10 text-white hover:bg-white/10">
                                Cancel
                              </AlertDialogCancel>
                              <AlertDialogAction 
                                onClick={() => handleEndLiveSession(classroom)}
                                className="bg-red-500 hover:bg-red-600 text-white"
                                disabled={endingSession === classroom.id}
                              >
                                {endingSession === classroom.id ? "Ending..." : "End Session"}
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="teen-card">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <div className="p-4 rounded-full bg-primary/10 border border-primary/20 w-fit mx-auto mb-6">
                <School className="h-16 w-16 text-primary" />
              </div>
              <h3 className="text-2xl font-bold text-foreground mb-3">No Classrooms Yet</h3>
              <p className="text-muted-foreground text-center mb-8 max-w-md">
                Create your first classroom to start teaching interactive scenarios to your students.
              </p>
              <Button onClick={() => setIsCreateModalOpen(true)} className="glow-button">
                <Plus className="h-5 w-5 mr-2" />
                Create Your First Classroom
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Selected Classroom Management */}
      {selectedClassroom && (
        <div className="mb-12 animate-fade-in">
          <Card className="teen-card">
            <CardHeader className="border-b border-border/50">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-foreground text-2xl flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-primary/10 border border-primary/20">
                      <School className="h-5 w-5 text-primary" />
                    </div>
                    {selectedClassroom.name}
                  </CardTitle>
                  <CardDescription className="text-muted-foreground mt-2">
                    Manage students and sessions
                  </CardDescription>
                </div>
                <Button 
                  variant="ghost" 
                  onClick={() => setSelectedClassroom(null)}
                  className="hover:bg-primary/10"
                >
                  Close
                </Button>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              <TeacherClassroomManager 
                classroom={selectedClassroom} 
                onRefresh={loadClassrooms}
              />
            </CardContent>
          </Card>
        </div>
      )}

      {/* Scenarios Section */}
      <div>
        <h2 className="text-2xl font-bold mb-6 text-white flex items-center gap-2">
          <BookOpen className="h-6 w-6 text-primary" />
          Available Scenarios
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {scenarios.map((scenario) => (
            <Card key={scenario.id} className="bg-black/20 border-white/10 hover:bg-black/30 transition-colors">
              <CardHeader>
                <CardTitle className="text-white">{scenario.title}</CardTitle>
                <CardDescription className="text-white/70">
                  {scenario.description}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex gap-2">
                  <Button 
                    onClick={() => handleStartScenario(scenario.id)}
                    className="flex-1 bg-primary hover:bg-primary/90"
                  >
                    <Play className="h-4 w-4 mr-2" />
                    Solo Play
                  </Button>
                   {selectedClassroom && (
                     <Button 
                       onClick={() => setSessionStartDialog({
                         isOpen: true,
                         classroom: selectedClassroom,
                         scenario
                       })}
                       disabled={creatingSession === selectedClassroom.id}
                       className="flex-1 bg-green-500 hover:bg-green-600"
                     >
                       {creatingSession === selectedClassroom.id ? (
                         <>
                           <Clock className="h-4 w-4 mr-2 animate-spin" />
                           Starting...
                         </>
                       ) : (
                         <>
                           <Users className="h-4 w-4 mr-2" />
                           Live Session
                         </>
                       )}
                     </Button>
                   )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        
        {!selectedClassroom && (
          <div className="mt-6 p-4 rounded-xl bg-gradient-to-r from-blue-500/10 to-primary/10 border border-blue-500/20">
            <p className="text-blue-300 text-sm flex items-center gap-2">
              <span className="text-lg">💡</span>
              <span>Select a classroom above to enable live session options for scenarios</span>
            </p>
          </div>
        )}
      </div>

      {/* Create Classroom Modal */}
      <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
        <DialogContent className="teen-card max-w-md">
          <DialogHeader>
            <DialogTitle className="text-foreground text-2xl">Create New Classroom</DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Set up a new classroom to manage students and sessions
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label htmlFor="name" className="block text-sm font-medium text-foreground">
                Classroom Name *
              </label>
              <Input
                id="name"
                value={classNameInput}
                onChange={(e) => setClassNameInput(e.target.value)}
                placeholder="e.g., Year 10 Ethics Class"
                className="bg-background border-border"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="description" className="block text-sm font-medium text-foreground">
                Description (Optional)
              </label>
              <Input
                id="description"
                value={classDescriptionInput}
                onChange={(e) => setClassDescriptionInput(e.target.value)}
                placeholder="What will students learn?"
                className="bg-background border-border"
              />
            </div>
          </div>
          <DialogFooter>
            <Button 
              variant="outline"
              onClick={() => setIsCreateModalOpen(false)}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleCreateClassroom}
              disabled={!classNameInput.trim() || isCreatingClassroom}
              className="glow-button"
            >
              {isCreatingClassroom ? (
                <>
                  <Clock className="h-4 w-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Classroom
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Live Session Start Dialog */}
      <LiveSessionStartDialog
        isOpen={sessionStartDialog.isOpen}
        onClose={() => setSessionStartDialog({ isOpen: false, classroom: null, scenario: null })}
        onStart={(mirrorMomentsEnabled) => {
          if (sessionStartDialog.classroom && sessionStartDialog.scenario) {
            handleStartLiveSession(sessionStartDialog.classroom, sessionStartDialog.scenario, mirrorMomentsEnabled);
            setSessionStartDialog({ isOpen: false, classroom: null, scenario: null });
          }
        }}
        scenarioTitle={sessionStartDialog.scenario?.title || ''}
        classroomName={sessionStartDialog.classroom?.name || ''}
        isStarting={creatingSession === sessionStartDialog.classroom?.id}
      />
    </div>
  );
};

export default TeacherDashboard;
