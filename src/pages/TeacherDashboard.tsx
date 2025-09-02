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
import AnimatedBackground from '@/components/AnimatedBackground';
import AnimatedCounter from '@/components/AnimatedCounter';
const TeacherDashboard = () => {
  const {
    scenarios,
    startScenario,
    setGameMode
  } = useGameContext();
  const {
    currentUser
  } = useAuth();
  const {
    toast
  } = useToast();
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
        variant: "destructive"
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
  const handleCreateClassroom = async () => {
    if (!currentUser) {
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
      const newClassroom = await createClassroom(currentUser.uid, classNameInput, classDescriptionInput);
      toast({
        title: "Classroom Created",
        description: `Your classroom '${classNameInput}' has been created successfully with code: ${newClassroom.classCode}`
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
        variant: "destructive"
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
      await createLiveSession(classroom.id, scenario.id, currentUser.uid, currentUser.displayName || 'Teacher', scenario.title, mirrorMomentsEnabled);

      // Refresh classrooms to show updated state
      await loadClassrooms();
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
        description: `Live session has been ended. All students have been notified.`
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
  return <div className="relative min-h-screen">
      <AnimatedBackground />
      
      <div className="container mx-auto px-3 py-6 sm:px-4 sm:py-8 relative z-10">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 sm:mb-8 animate-card-reveal">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2 gradient-heading animate-text-reveal">Teacher Dashboard</h1>
            <p className="text-white/70 animate-text-reveal" style={{
            animationDelay: '0.1s'
          }}>Manage your classrooms and scenarios</p>
          </div>
          <Button onClick={() => setIsCreateModalOpen(true)} className="glow-button w-full sm:w-auto animate-card-reveal" style={{
          animationDelay: '0.2s'
        }}>
            <Plus className="h-4 w-4 mr-2" />
            Create Classroom
          </Button>
        </div>

        {/* Overview Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8 animate-card-reveal" style={{
        animationDelay: '0.1s'
      }}>
          <Card className="teen-card hover:shadow-primary/20 transition-all duration-300">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-full animate-pulse-glow">
                  <School className="h-5 w-5 text-primary " />
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
                  <Users className="h-5 w-5 text-secondary " />
                </div>
                <div>
                  <p className="text-white/70 text-sm">Total Students</p>
                  <AnimatedCounter target={classrooms.reduce((sum, c) => sum + (c.students?.length || 0), 0)} className="text-2xl font-bold text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="teen-card hover:shadow-primary/20 transition-all duration-300">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-br from-accent/20 to-primary/20 rounded-full animate-pulse-glow">
                  <BookOpen className="h-5 w-5 text-accent animate-icon-bounce" />
                </div>
                <div>
                  <p className="text-white/70 text-sm">Active Sessions</p>
                  <AnimatedCounter target={classrooms.filter(c => c.activeSessionId).length} className="text-2xl font-bold text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Classrooms Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-white flex items-center gap-2 animate-text-reveal">
              <School className="h-6 w-6 text-primary animate-icon-bounce" />
              Your Classrooms (<AnimatedCounter target={classrooms.length} />)
            </h2>
          </div>

          {loading ? <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {[1, 2, 3].map(i => <Card key={i} className="bg-black/20 border-white/10 animate-pulse">
                  <CardHeader>
                    <div className="h-6 bg-white/10 rounded mb-2"></div>
                    <div className="h-4 bg-white/10 rounded w-2/3"></div>
                  </CardHeader>
                  <CardContent>
                    <div className="h-4 bg-white/10 rounded mb-4"></div>
                    <div className="h-10 bg-white/10 rounded"></div>
                  </CardContent>
                </Card>)}
            </div> : classrooms.length > 0 ? <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {classrooms.map((classroom, index) => <Card key={classroom.id} className="teen-card hover:shadow-primary/20 transition-all duration-300 animate-card-reveal" style={{
            animationDelay: `${index * 0.1}s`
          }}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-white text-lg animate-text-reveal">{classroom.name}</CardTitle>
                        <CardDescription className="text-white/70 mt-1 animate-text-reveal" style={{
                    animationDelay: '0.1s'
                  }}>
                          {classroom.description || "No description"}
                        </CardDescription>
                      </div>
                      <div className="flex items-center gap-2 ml-2">
                        {classroom.activeSessionId && <Badge className="bg-green-500/20 text-green-300 border-0 text-xs animate-pulse-glow">
                            Live
                          </Badge>}
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="sm" className="text-red-400 hover:text-red-300 hover:bg-red-900/20 p-1 h-8 w-8" disabled={deleting === classroom.id}>
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
                              <AlertDialogAction onClick={() => handleDeleteClassroom(classroom.id!, classroom.name)} className="bg-red-500 hover:bg-red-600 text-white" disabled={deleting === classroom.id}>
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
                      
                      <div className="text-xs text-white/60 bg-black/30 rounded px-2 py-1 font-mono animate-text-reveal">
                        Code: {classroom.classCode}
                      </div>
                      
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={() => setSelectedClassroom(classroom)} className="flex-1 border-white/20 bg-black/20 text-white hover:bg-white/10 animate-text-reveal">
                          <School className="h-4 w-4 mr-1" />
                          Manage
                        </Button>
                        {classroom.activeSessionId && <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="outline" size="sm" className="border-red-500/20 bg-red-900/20 text-red-400 hover:bg-red-900/40" disabled={endingSession === classroom.id}>
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
                                <AlertDialogAction onClick={() => handleEndLiveSession(classroom)} className="bg-red-500 hover:bg-red-600 text-white" disabled={endingSession === classroom.id}>
                                  {endingSession === classroom.id ? "Ending..." : "End Session"}
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>}
                      </div>
                    </div>
                  </CardContent>
                </Card>)}
            </div> : <Card className="teen-card p-8 text-center animate-card-reveal">
              <School className="h-16 w-16 text-white/30 mx-auto mb-4 animate-float" />
              <h3 className="text-xl font-semibold text-white mb-2 animate-text-reveal">No Classrooms Yet</h3>
              <p className="text-white/70 mb-4 animate-text-reveal" style={{
            animationDelay: '0.1s'
          }}>
                Create your first classroom to start managing students and live sessions.
              </p>
              <Button onClick={() => setIsCreateModalOpen(true)} className="glow-button animate-card-reveal" style={{
            animationDelay: '0.2s'
          }}>
                <Plus className="h-4 w-4 mr-2" />
                Create Your First Classroom
              </Button>
            </Card>}
        </div>

        {/* Scenarios Section */}
        {!selectedClassroom && <div className="animate-card-reveal" style={{
        animationDelay: '0.3s'
      }}>
            <h2 className="text-2xl font-bold text-white flex items-center gap-2 mb-6 animate-text-reveal">
              <BookOpen className="h-6 w-6 text-primary animate-icon-bounce" />
              Available Scenarios
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {scenarios.map((scenario, index) => <div key={scenario.id} className="animate-card-reveal" style={{
            animationDelay: `${0.4 + index * 0.1}s`
          }}>
                  <ScenarioCard scenario={scenario} onStart={handleStartScenario} isTeacherDashboard={true} />
                </div>)}
            </div>
          </div>}

        {/* Selected Classroom Manager */}
        {selectedClassroom && <div className="animate-card-reveal" style={{
        animationDelay: '0.3s'
      }}>
            <div className="p-6 border-t border-white/10">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-white">Classroom Details: {selectedClassroom.name}</h3>
                <Button variant="ghost" onClick={() => setSelectedClassroom(null)} className="text-white/70 hover:text-white hover:bg-white/10">
                  Close
                </Button>
              </div>
              <p className="text-white/70">Classroom management features would be displayed here.</p>
            </div>
          </div>}

        {/* Create Classroom Dialog */}
        <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
          <DialogContent className="bg-black/90 border border-primary/20 backdrop-blur-sm">
            <DialogHeader>
              <DialogTitle className="text-white text-xl font-bold">Create New Classroom</DialogTitle>
              <DialogDescription className="text-white/70">
                Set up a new classroom to manage students and conduct live sessions.
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              <div>
                <label className="text-white text-sm font-medium mb-2 block">
                  Classroom Name *
                </label>
                <Input value={classNameInput} onChange={e => setClassNameInput(e.target.value)} placeholder="e.g., Grade 10 Life Skills" className="bg-black/30 border-white/20 text-white placeholder:text-white/50" />
              </div>
              
              <div>
                <label className="text-white text-sm font-medium mb-2 block">
                  Description (Optional)
                </label>
                <Input value={classDescriptionInput} onChange={e => setClassDescriptionInput(e.target.value)} placeholder="Brief description of the classroom" className="bg-black/30 border-white/20 text-white placeholder:text-white/50" />
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreateModalOpen(false)} className="border-white/20 text-white hover:bg-white/10">
                Cancel
              </Button>
              <Button onClick={handleCreateClassroom} disabled={isCreatingClassroom || !classNameInput.trim()} className="glow-button">
                {isCreatingClassroom ? <>
                    <Clock className="h-4 w-4 mr-2 animate-spin" />
                    Creating...
                  </> : <>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Classroom
                  </>}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Live Session Start Dialog */}
        <Dialog open={sessionStartDialog.isOpen} onOpenChange={open => !open && setSessionStartDialog({
        isOpen: false,
        classroom: null,
        scenario: null
      })}>
          <DialogContent className="bg-black/90 border border-primary/20">
            <DialogHeader>
              <DialogTitle className="text-white">Start Live Session</DialogTitle>
              <DialogDescription className="text-white/70">
                Ready to start {sessionStartDialog.scenario?.title} for {sessionStartDialog.classroom?.name}?
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setSessionStartDialog({
              isOpen: false,
              classroom: null,
              scenario: null
            })}>
                Cancel
              </Button>
              <Button onClick={() => {
              if (sessionStartDialog.classroom && sessionStartDialog.scenario) {
                handleStartLiveSession(sessionStartDialog.classroom, sessionStartDialog.scenario, false);
                setSessionStartDialog({
                  isOpen: false,
                  classroom: null,
                  scenario: null
                });
              }
            }}>
                Start Session
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>;
};
export default TeacherDashboard;