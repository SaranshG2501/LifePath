/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect, useCallback } from 'react';
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
import { School, Plus, Users, Play, Trash2, AlertTriangle, Calendar, Clock, BookOpen, StopCircle, Loader2 } from 'lucide-react';
import { 
  getUserClassrooms, 
  deleteClassroom, 
  Classroom, 
  convertTimestampToDate, 
  createClassroom, 
  createLiveSession, 
  endLiveSession,
  onSnapshot,
  collection,
  where,
  query,
  db
} from '@/lib/firebase';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import LiveSessionStartDialog from '@/components/classroom/LiveSessionStartDialog';
import AnimatedBackground from '@/components/AnimatedBackground';
import AnimatedCounter from '@/components/AnimatedCounter';

const TeacherDashboard = () => {
  console.log("TeacherDashboard component rendered");
  
  const { scenarios, startScenario, setGameMode } = useGameContext();
  const { currentUser } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  
  // Core state
  const [classrooms, setClassrooms] = useState<Classroom[]>([]);
  const [selectedClassroom, setSelectedClassroom] = useState<Classroom | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  
  // Action states
  const [deleting, setDeleting] = useState<string | null>(null);
  const [creatingSession, setCreatingSession] = useState<string | null>(null);
  const [endingSession, setEndingSession] = useState<string | null>(null);

  // Modal states
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [classNameInput, setClassNameInput] = useState('');
  const [classDescriptionInput, setClassDescriptionInput] = useState('');
  const [isCreatingClassroom, setIsCreatingClassroom] = useState(false);

  // Live session dialog state
  const [sessionStartDialog, setSessionStartDialog] = useState<{
    isOpen: boolean;
    classroom: Classroom | null;
    scenario: any;
  }>({
    isOpen: false,
    classroom: null,
    scenario: null
  });

  // Computed stats
  const totalStudents = classrooms.reduce((sum, c) => sum + (c.students?.length || 0), 0);
  const activeSessions = classrooms.filter(c => c.activeSessionId).length;

  // Load classrooms with real-time updates
  useEffect(() => {
    if (!currentUser?.uid) {
      setLoading(false);
      return;
    }

    console.log("Setting up real-time classroom listener for teacher:", currentUser.uid);
    
    // Set up real-time listener for teacher's classrooms
    const classroomsQuery = query(
      collection(db, 'classrooms'),
      where('teacherId', '==', currentUser.uid)
    );

    const unsubscribe = onSnapshot(classroomsQuery, 
      (snapshot) => {
        console.log("Classroom snapshot received. Docs:", snapshot.docs.length);
        
        const updatedClassrooms = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Classroom[];
        
        console.log("Updated classrooms:", updatedClassrooms);
        setClassrooms(updatedClassrooms);
        
        // Update selected classroom if it exists
        if (selectedClassroom) {
          const updatedSelected = updatedClassrooms.find(c => c.id === selectedClassroom.id);
          if (updatedSelected) {
            setSelectedClassroom(updatedSelected);
          }
        }
        
        setLoading(false);
      },
      (error) => {
        console.error("Error in classroom listener:", error);
        setLoading(false);
        toast({
          title: "Connection Error",
          description: "Failed to sync classroom data. Please refresh the page.",
          variant: "destructive",
        });
      }
    );

    return () => {
      console.log("Cleaning up classroom listener");
      unsubscribe();
    };
  }, [currentUser?.uid, selectedClassroom?.id, toast]);

  // Manual refresh function
  const handleRefresh = useCallback(async () => {
    if (!currentUser?.uid) return;
    
    setRefreshing(true);
    try {
      console.log("Manual refresh triggered");
      const freshClassrooms = await getUserClassrooms(currentUser.uid, 'teacher');
      setClassrooms(freshClassrooms);
      
      // Update selected classroom
      if (selectedClassroom) {
        const updatedSelected = freshClassrooms.find(c => c.id === selectedClassroom.id);
        if (updatedSelected) {
          setSelectedClassroom(updatedSelected);
        }
      }
      
      toast({
        title: "Refreshed",
        description: "Classroom data has been updated.",
      });
    } catch (error) {
      console.error("Error during manual refresh:", error);
      toast({
        title: "Error",
        description: "Failed to refresh classroom data.",
        variant: "destructive",
      });
    } finally {
      setRefreshing(false);
    }
  }, [currentUser?.uid, selectedClassroom?.id, toast]);

  // Create classroom
  const handleCreateClassroom = async () => {
    if (!currentUser?.uid) {
      toast({
        title: "Login Required",
        description: "Please login to create a classroom",
        variant: "destructive"
      });
      return;
    }
    
    if (!classNameInput.trim()) {
      toast({
        title: "Class Name Required",
        description: "Please enter a name for your classroom",
        variant: "destructive"
      });
      return;
    }

    setIsCreatingClassroom(true);
    try {
      console.log("Creating classroom:", classNameInput);
      const newClassroom = await createClassroom(
        currentUser.uid, 
        classNameInput.trim(), 
        classDescriptionInput.trim()
      );
      
      toast({
        title: "Classroom Created",
        description: `Your classroom '${classNameInput}' has been created successfully with code: ${newClassroom.classCode}`
      });

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
        variant: "destructive"
      });
    } finally {
      setIsCreatingClassroom(false);
    }
  };

  // Delete classroom
  const handleDeleteClassroom = async (classroomId: string, classroomName: string) => {
    if (!currentUser?.uid) return;
    
    setDeleting(classroomId);
    try {
      console.log("Deleting classroom:", classroomId);
      await deleteClassroom(classroomId, currentUser.uid);

      // Close selected classroom if it was the deleted one
      if (selectedClassroom?.id === classroomId) {
        setSelectedClassroom(null);
      }
      
      toast({
        title: "Classroom Deleted",
        description: `"${classroomName}" has been permanently deleted. All students have been removed and related data cleared.`
      });
    } catch (error) {
      console.error('Error deleting classroom:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to delete classroom. Please try again.",
        variant: "destructive"
      });
    } finally {
      setDeleting(null);
    }
  };

  // Start live session
  const handleStartLiveSession = async (classroom: Classroom, scenario: any, mirrorMomentsEnabled: boolean) => {
    if (!currentUser?.uid || !classroom.id) return;
    
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

      toast({
        title: "Live Session Started!",
        description: `"${scenario.title}" is now live for ${classroom.name}`
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
        variant: "destructive"
      });
    } finally {
      setCreatingSession(null);
    }
  };

  // End live session
  const handleEndLiveSession = async (classroom: Classroom) => {
    if (!currentUser?.uid || !classroom.id || !classroom.activeSessionId) return;
    
    setEndingSession(classroom.id);
    try {
      console.log("Ending live session for classroom:", classroom.id);
      await endLiveSession(classroom.activeSessionId, classroom.id);

      toast({
        title: "Session Ended",
        description: `Live session has been ended. All students have been notified.`
      });
    } catch (error) {
      console.error('Error ending live session:', error);
      
      // Check if it's a permissions error but the session actually ended
      if (error instanceof Error && error.message.includes('permissions')) {
        toast({
          title: "Session Ended",
          description: "Live session has been ended (with permission warning - this is normal)."
        });
      } else {
        toast({
          title: "Error",
          description: error instanceof Error ? error.message : "Failed to end live session. Please try again.",
          variant: "destructive"
        });
      }
    } finally {
      setEndingSession(null);
    }
  };

  // Handle scenario selection for live session
  const handleStartScenario = (id: string) => {
    startScenario(id);
    navigate('/game');
  };

  // Handle live session dialog
  const handleLiveSessionClick = (classroom: Classroom, scenario: any) => {
    setSessionStartDialog({
      isOpen: true,
      classroom,
      scenario
    });
  };

  return (
    <div className="relative min-h-screen pt-20">
      <AnimatedBackground />
      
      <div className="container mx-auto px-3 py-6 sm:px-4 sm:py-8 relative z-10">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 sm:mb-8 animate-card-reveal">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2 gradient-heading animate-text-reveal">
              Teacher Dashboard
            </h1>
            <p className="text-white/70 animate-text-reveal" style={{ animationDelay: '0.1s' }}>
              Manage your classrooms and scenarios
            </p>
          </div>
          <Button 
            onClick={() => setIsCreateModalOpen(true)} 
            className="glow-button w-full sm:w-auto animate-card-reveal" 
            style={{ animationDelay: '0.2s' }}
          >
            <Plus className="h-4 w-4 mr-2" />
            Create Classroom
          </Button>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8 animate-card-reveal" style={{ animationDelay: '0.1s' }}>
          <Card className="teen-card hover:shadow-primary/20 transition-all duration-300">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-full animate-pulse-glow">
                  <School className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-white/70 text-sm">Total Classrooms</p>
                  <AnimatedCounter target={classrooms.length} className="text-2xl font-bold text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="teen-card hover:shadow-primary/20 transition-all duration-300">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-br from-secondary/20 to-accent/20 rounded-full animate-pulse-glow">
                  <Users className="h-5 w-5 text-secondary" />
                </div>
                <div>
                  <p className="text-white/70 text-sm">Total Students</p>
                  <AnimatedCounter target={totalStudents} className="text-2xl font-bold text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="teen-card hover:shadow-primary/20 transition-all duration-300">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-br from-accent/20 to-primary/20 rounded-full animate-pulse-glow">
                  <BookOpen className="h-5 w-5 text-accent" />
                </div>
                <div>
                  <p className="text-white/70 text-sm">Active Sessions</p>
                  <AnimatedCounter target={activeSessions} className="text-2xl font-bold text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Classrooms Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-white flex items-center gap-2 animate-text-reveal">
              <School className="h-6 w-6 text-primary" />
              Your Classrooms (<AnimatedCounter target={classrooms.length} />)
            </h2>
            <Button 
              variant="outline" 
              size="sm"
              className="border-white/20 bg-black/20 text-white hover:bg-white/10"
              onClick={handleRefresh}
              disabled={refreshing}
            >
              {refreshing ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : null}
              Refresh
            </Button>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {[1, 2, 3].map(i => (
                <Card key={i} className="bg-black/20 border-white/10 animate-pulse">
                  <CardHeader>
                    <div className="h-6 bg-white/10 rounded mb-2"></div>
                    <div className="h-4 bg-white/10 rounded w-2/3"></div>
                  </CardHeader>
                  <CardContent>
                    <div className="h-4 bg-white/10 rounded mb-4"></div>
                    <div className="h-10 bg-white/10 rounded"></div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : classrooms.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {classrooms.map((classroom, index) => (
                <Card 
                  key={classroom.id} 
                  className="teen-card hover:shadow-primary/20 transition-all duration-300 animate-card-reveal"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-white text-lg animate-text-reveal">
                          {classroom.name}
                        </CardTitle>
                        <CardDescription className="text-white/70 mt-1 animate-text-reveal" style={{ animationDelay: '0.1s' }}>
                          {classroom.description || "No description"}
                        </CardDescription>
                      </div>
                      <div className="flex items-center gap-2 ml-2">
                        {classroom.activeSessionId && (
                          <Badge className="bg-green-500/20 text-green-300 border-0 text-xs animate-pulse-glow">
                            Live
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
                              {deleting === classroom.id ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <Trash2 className="h-4 w-4" />
                              )}
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
                    <div className="space-y-3">
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2 text-white/70 animate-text-reveal">
                          <Users className="h-4 w-4" />
                          <span><AnimatedCounter target={classroom.students?.length || 0} /> Students</span>
                        </div>
                        <div className="flex items-center gap-2 text-white/70 animate-text-reveal">
                          <Calendar className="h-4 w-4" />
                          <span>{convertTimestampToDate(classroom.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                      
                      <div className="flex gap-2">
                        <Button 
                          onClick={() => setSelectedClassroom(classroom)}
                          variant="outline"
                          size="sm"
                          className="flex-1 border-white/20 bg-black/20 text-white hover:bg-white/10"
                        >
                          <School className="h-4 w-4 mr-1" />
                          Manage
                        </Button>
                        
                        {classroom.activeSessionId ? (
                          <Button 
                            onClick={() => handleEndLiveSession(classroom)}
                            variant="destructive"
                            size="sm"
                            disabled={endingSession === classroom.id}
                          >
                            {endingSession === classroom.id ? (
                              <Loader2 className="h-4 w-4 animate-spin mr-1" />
                            ) : (
                              <StopCircle className="h-4 w-4 mr-1" />
                            )}
                            End
                          </Button>
                        ) : (
                          <Button 
                            onClick={() => handleLiveSessionClick(classroom, scenarios[0])}
                            variant="default"
                            size="sm"
                            disabled={creatingSession === classroom.id || !scenarios.length}
                          >
                            {creatingSession === classroom.id ? (
                              <Loader2 className="h-4 w-4 animate-spin mr-1" />
                            ) : (
                              <Play className="h-4 w-4 mr-1" />
                            )}
                            Start
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="teen-card">
              <CardContent className="p-8 text-center">
                <School className="h-16 w-16 text-white/30 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">No Classrooms Yet</h3>
                <p className="text-white/70 mb-4">
                  Create your first classroom to start teaching with interactive scenarios.
                </p>
                <Button onClick={() => setIsCreateModalOpen(true)} className="glow-button">
                  <Plus className="h-4 w-4 mr-2" />
                  Create Your First Classroom
                </Button>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Selected Classroom Details */}
        {selectedClassroom && (
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                <School className="h-6 w-6 text-primary" />
                {selectedClassroom.name}
              </h2>
              <Button 
                variant="outline" 
                size="sm"
                className="border-white/20 bg-black/20 text-white hover:bg-white/10"
                onClick={() => setSelectedClassroom(null)}
              >
                Close
              </Button>
            </div>
            
            <Card className="teen-card">
              <CardContent className="p-6">
                <TeacherClassroomManager 
                  classroom={selectedClassroom}
                  onRefresh={handleRefresh}
                />
              </CardContent>
            </Card>
          </div>
        )}

        {/* Scenarios Section */}
        <div>
          <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2 animate-text-reveal">
            <Play className="h-6 w-6 text-primary" />
            Available Scenarios
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {scenarios.map((scenario, index) => (
              <div key={scenario.id} className="animate-card-reveal" style={{ animationDelay: `${index * 0.1}s` }}>
                <ScenarioCard 
                  scenario={scenario} 
                  onStart={handleStartScenario}
                />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Create Classroom Modal */}
      <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
        <DialogContent className="bg-black/90 border border-white/10">
          <DialogHeader>
            <DialogTitle className="text-white">Create New Classroom</DialogTitle>
            <DialogDescription className="text-white/70">
              Set up a new classroom to start teaching with interactive scenarios.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div>
              <label className="text-white text-sm font-medium mb-2 block">
                Classroom Name *
              </label>
              <Input
                placeholder="e.g., Grade 10 Life Skills"
                value={classNameInput}
                onChange={(e) => setClassNameInput(e.target.value)}
                className="bg-black/20 border-white/20 text-white"
              />
            </div>
            
            <div>
              <label className="text-white text-sm font-medium mb-2 block">
                Description (Optional)
              </label>
              <Input
                placeholder="Brief description of your classroom"
                value={classDescriptionInput}
                onChange={(e) => setClassDescriptionInput(e.target.value)}
                className="bg-black/20 border-white/20 text-white"
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsCreateModalOpen(false)}
              className="border-white/20 bg-black/20 text-white hover:bg-white/10"
            >
              Cancel
            </Button>
            <Button
              onClick={handleCreateClassroom}
              disabled={isCreatingClassroom || !classNameInput.trim()}
              className="glow-button"
            >
              {isCreatingClassroom ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Plus className="h-4 w-4 mr-2" />
              )}
              Create Classroom
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Live Session Start Dialog */}
      {sessionStartDialog.classroom && sessionStartDialog.scenario && (
        <LiveSessionStartDialog
          isOpen={sessionStartDialog.isOpen}
          onClose={() => setSessionStartDialog({ isOpen: false, classroom: null, scenario: null })}
          scenarioTitle={sessionStartDialog.scenario.title}
          classroomName={sessionStartDialog.classroom.name}
          onStart={(mirrorMomentsEnabled) => handleStartLiveSession(sessionStartDialog.classroom!, sessionStartDialog.scenario, mirrorMomentsEnabled)}
          isStarting={creatingSession === sessionStartDialog.classroom.id}
        />
      )}
    </div>
  );
};

export default TeacherDashboard;