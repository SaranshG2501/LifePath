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
import { School, Plus, Users, Trash2, AlertTriangle, Calendar, BookOpen, Loader2, RefreshCw } from 'lucide-react';
import { getUserClassrooms, deleteClassroom, Classroom, convertTimestampToDate, createClassroom, createLiveSession, endLiveSession, db } from '@/lib/firebase';
import { onSnapshot, collection, query, where } from 'firebase/firestore';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import AnimatedBackground from '@/components/AnimatedBackground';
import AnimatedCounter from '@/components/AnimatedCounter';

const TeacherDashboard = () => {
  const { scenarios, startScenario, setGameMode } = useGameContext();
  const { currentUser, userProfile } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  // State management
  const [classrooms, setClassrooms] = useState<Classroom[]>([]);
  const [selectedClassroom, setSelectedClassroom] = useState<Classroom | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [actionStates, setActionStates] = useState({
    deleting: null as string | null,
    creatingSession: null as string | null,
    endingSession: null as string | null,
  });

  // Create classroom modal state
  const [createModal, setCreateModal] = useState({
    isOpen: false,
    name: '',
    description: '',
    creating: false,
  });

  // Real-time classroom updates
  useEffect(() => {
    if (!currentUser?.uid) return;

    console.log('Setting up real-time classroom listener for teacher:', currentUser.uid);
    
    const classroomsQuery = query(
      collection(db, 'classrooms'),
      where('teacherId', '==', currentUser.uid)
    );

    const unsubscribe = onSnapshot(classroomsQuery, (snapshot) => {
      console.log('Real-time classroom update received:', snapshot.docs.length, 'classrooms');
      
      const updatedClassrooms = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Classroom[];
      
      console.log('Updated classrooms:', updatedClassrooms);
      setClassrooms(updatedClassrooms);
      setLoading(false);
      
      // Update selected classroom if it exists in the updated list
      if (selectedClassroom) {
        const updatedSelected = updatedClassrooms.find(c => c.id === selectedClassroom.id);
        if (updatedSelected) {
          setSelectedClassroom(updatedSelected);
        } else {
          // Classroom was deleted
          setSelectedClassroom(null);
        }
      }
    }, (error) => {
      console.error('Error in classroom listener:', error);
      setLoading(false);
      toast({
        title: "Connection Error",
        description: "Failed to sync classroom data. Please refresh the page.",
        variant: "destructive",
      });
    });

    return () => {
      console.log('Cleaning up classroom listener');
      unsubscribe();
    };
  }, [currentUser?.uid, selectedClassroom, toast]);

  // Manual refresh function
  const handleRefresh = useCallback(async () => {
    if (!currentUser?.uid) return;
    
    setRefreshing(true);
    try {
      console.log('Manual refresh triggered for user:', currentUser.uid);
      const freshClassrooms = await getUserClassrooms(currentUser.uid, 'teacher');
      console.log('Manual refresh result:', freshClassrooms);
      setClassrooms(freshClassrooms);
      
      toast({
        title: "Refreshed",
        description: "Classroom data updated successfully.",
      });
    } catch (error) {
      console.error('Manual refresh failed:', error);
      toast({
        title: "Refresh Failed",
        description: "Could not update classroom data. Please try again.",
        variant: "destructive",
      });
    } finally {
      setRefreshing(false);
    }
  }, [currentUser?.uid, toast]);

  // Create classroom function
  const handleCreateClassroom = async () => {
    if (!currentUser?.uid) {
      toast({
        title: "Authentication Required",
        description: "Please login to create a classroom.",
        variant: "destructive",
      });
      return;
    }

    if (!createModal.name.trim()) {
      toast({
        title: "Name Required",
        description: "Please enter a classroom name.",
        variant: "destructive",
      });
      return;
    }

    setCreateModal(prev => ({ ...prev, creating: true }));
    
    try {
      console.log('Creating classroom:', createModal.name);
      const newClassroom = await createClassroom(
        currentUser.uid,
        createModal.name.trim(),
        createModal.description.trim()
      );
      
      console.log('Classroom created successfully:', newClassroom);
      
      toast({
        title: "Classroom Created",
        description: `"${createModal.name}" created with code: ${newClassroom.classCode}`,
      });

      // Reset modal and select new classroom
      setCreateModal({
        isOpen: false,
        name: '',
        description: '',
        creating: false,
      });
      
      setSelectedClassroom(newClassroom);
      
    } catch (error) {
      console.error('Error creating classroom:', error);
      toast({
        title: "Creation Failed",
        description: "Could not create classroom. Please try again.",
        variant: "destructive",
      });
    } finally {
      setCreateModal(prev => ({ ...prev, creating: false }));
    }
  };

  // Delete classroom function
  const handleDeleteClassroom = async (classroomId: string, classroomName: string) => {
    if (!currentUser?.uid) return;

    setActionStates(prev => ({ ...prev, deleting: classroomId }));
    
    try {
      console.log('Deleting classroom:', classroomId);
      await deleteClassroom(classroomId, currentUser.uid);
      
      // Close selected classroom if it was deleted
      if (selectedClassroom?.id === classroomId) {
        setSelectedClassroom(null);
      }
      
      toast({
        title: "Classroom Deleted",
        description: `"${classroomName}" has been permanently deleted.`,
      });
      
    } catch (error) {
      console.error('Error deleting classroom:', error);
      toast({
        title: "Deletion Failed",
        description: error instanceof Error ? error.message : "Could not delete classroom.",
        variant: "destructive",
      });
    } finally {
      setActionStates(prev => ({ ...prev, deleting: null }));
    }
  };

  // Start live session function
  const handleStartLiveSession = async (classroom: Classroom, scenario: any, mirrorMomentsEnabled: boolean) => {
    if (!currentUser?.uid || !classroom.id) return;

    setActionStates(prev => ({ ...prev, creatingSession: classroom.id! }));
    
    try {
      console.log('Starting live session:', { classroomId: classroom.id, scenarioId: scenario.id });
      await createLiveSession(
        classroom.id,
        scenario.id,
        currentUser.uid,
        userProfile?.displayName || currentUser.displayName || 'Teacher',
        scenario.title,
        mirrorMomentsEnabled
      );

      toast({
        title: "Session Started",
        description: `"${scenario.title}" is now live for ${classroom.name}`,
      });

      // Navigate to game
      setGameMode("classroom");
      startScenario(scenario.id);
      navigate('/game');
      
    } catch (error) {
      console.error('Error starting live session:', error);
      toast({
        title: "Session Start Failed",
        description: error instanceof Error ? error.message : "Could not start live session.",
        variant: "destructive",
      });
    } finally {
      setActionStates(prev => ({ ...prev, creatingSession: null }));
    }
  };

  // End live session function
  const handleEndLiveSession = async (classroom: Classroom) => {
    if (!currentUser?.uid || !classroom.id || !classroom.activeSessionId) return;

    setActionStates(prev => ({ ...prev, endingSession: classroom.id! }));
    
    try {
      console.log('Ending live session:', classroom.activeSessionId);
      await endLiveSession(classroom.activeSessionId, classroom.id);
      
      toast({
        title: "Session Ended",
        description: "Live session ended successfully.",
      });
      
    } catch (error) {
      console.error('Error ending live session:', error);
      toast({
        title: "End Session Failed",
        description: "Could not end live session. Please try again.",
        variant: "destructive",
      });
    } finally {
      setActionStates(prev => ({ ...prev, endingSession: null }));
    }
  };

  // Start individual scenario
  const handleStartScenario = (scenarioId: string) => {
    startScenario(scenarioId);
    navigate('/game');
  };

  // Calculate stats
  const stats = {
    totalClassrooms: classrooms.length,
    totalStudents: classrooms.reduce((sum, c) => sum + (c.students?.length || 0), 0),
    activeSessions: classrooms.filter(c => c.activeSessionId).length,
  };

  console.log('Dashboard render - stats:', stats);

  if (!currentUser) {
    return (
      <div className="relative min-h-screen pt-20 flex items-center justify-center">
        <AnimatedBackground />
        <Card className="teen-card max-w-md mx-auto">
          <CardContent className="p-6 text-center">
            <p className="text-white">Please login to access the teacher dashboard.</p>
            <Button onClick={() => navigate('/auth')} className="mt-4">
              Go to Login
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen pt-20">
      <AnimatedBackground />
      
      <div className="container mx-auto px-3 py-6 sm:px-4 sm:py-8 relative z-10">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8 animate-fade-in">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2 gradient-heading">
              Teacher Dashboard
            </h1>
            <p className="text-white/70">
              Manage your classrooms and scenarios
            </p>
          </div>
          
          <div className="flex gap-2">
            <Button 
              variant="outline"
              onClick={handleRefresh}
              disabled={refreshing}
              className="border-white/20 bg-black/20 text-white hover:bg-white/10"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            
            <Button 
              onClick={() => setCreateModal(prev => ({ ...prev, isOpen: true }))}
              className="glow-button"
            >
              <Plus className="h-4 w-4 mr-2" />
              Create Classroom
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8 animate-fade-in">
          <Card className="teen-card hover:shadow-primary/20 transition-all duration-300">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-full">
                  <School className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-white/70 text-sm">Total Classrooms</p>
                  <AnimatedCounter target={stats.totalClassrooms} className="text-2xl font-bold text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="teen-card hover:shadow-primary/20 transition-all duration-300">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-br from-secondary/20 to-accent/20 rounded-full">
                  <Users className="h-5 w-5 text-secondary" />
                </div>
                <div>
                  <p className="text-white/70 text-sm">Total Students</p>
                  <AnimatedCounter target={stats.totalStudents} className="text-2xl font-bold text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="teen-card hover:shadow-primary/20 transition-all duration-300">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-br from-accent/20 to-primary/20 rounded-full">
                  <BookOpen className="h-5 w-5 text-accent" />
                </div>
                <div>
                  <p className="text-white/70 text-sm">Active Sessions</p>
                  <AnimatedCounter target={stats.activeSessions} className="text-2xl font-bold text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Classrooms Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-white flex items-center gap-2">
              <School className="h-6 w-6 text-primary" />
              Your Classrooms (<AnimatedCounter target={stats.totalClassrooms} />)
            </h2>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
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
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {classrooms.map((classroom, index) => (
                <Card 
                  key={classroom.id} 
                  className="teen-card hover:shadow-primary/20 transition-all duration-300 animate-scale-in"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-white text-lg">
                          {classroom.name}
                        </CardTitle>
                        <CardDescription className="text-white/70 mt-1">
                          {classroom.description || "No description"}
                        </CardDescription>
                      </div>
                      
                      <div className="flex items-center gap-2 ml-2">
                        {classroom.activeSessionId && (
                          <Badge className="bg-green-500/20 text-green-300 border-0 animate-pulse">
                            Live
                          </Badge>
                        )}
                        
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="text-red-400 hover:text-red-300 hover:bg-red-900/20 p-1 h-8 w-8"
                              disabled={actionStates.deleting === classroom.id}
                            >
                              {actionStates.deleting === classroom.id ? (
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
                                <AlertDialogTitle className="text-white">
                                  Delete Classroom
                                </AlertDialogTitle>
                              </div>
                              <AlertDialogDescription className="text-white/70">
                                Are you sure you want to permanently delete <strong>"{classroom.name}"</strong>?
                                <br /><br />
                                This will remove all {classroom.students?.length || 0} students and cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel className="bg-transparent border border-white/10 text-white hover:bg-white/10">
                                Cancel
                              </AlertDialogCancel>
                              <AlertDialogAction 
                                onClick={() => handleDeleteClassroom(classroom.id!, classroom.name)}
                                className="bg-red-500 hover:bg-red-600 text-white"
                                disabled={actionStates.deleting === classroom.id}
                              >
                                {actionStates.deleting === classroom.id ? "Deleting..." : "Delete"}
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
                        <div className="flex items-center gap-2 text-white/70">
                          <Users className="h-4 w-4" />
                          <span>{classroom.students?.length || 0} Students</span>
                        </div>
                        <div className="flex items-center gap-2 text-white/70">
                          <Calendar className="h-4 w-4" />
                          <span>{convertTimestampToDate(classroom.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                      
                      <Button 
                        onClick={() => setSelectedClassroom(classroom)}
                        className="w-full glow-button-sm"
                        variant={selectedClassroom?.id === classroom.id ? "default" : "outline"}
                      >
                        {selectedClassroom?.id === classroom.id ? "Managing" : "Manage"}
                      </Button>
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
                  Create your first classroom to start teaching with LifePath scenarios.
                </p>
                <Button 
                  onClick={() => setCreateModal(prev => ({ ...prev, isOpen: true }))}
                  className="glow-button"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Create Your First Classroom
                </Button>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Selected Classroom Details */}
        {selectedClassroom && (
          <div className="mb-8 animate-fade-in">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-white">
                Classroom Details: {selectedClassroom.name}
              </h3>
              <Button 
                variant="ghost" 
                onClick={() => setSelectedClassroom(null)}
                className="text-white/70 hover:text-white hover:bg-white/10"
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
        {scenarios && scenarios.length > 0 && (
          <div className="animate-fade-in">
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
              <BookOpen className="h-6 w-6 text-primary" />
              Available Scenarios
            </h2>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {scenarios.map((scenario, index) => (
                <div 
                  key={scenario.id}
                  className="animate-scale-in"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <ScenarioCard
                    scenario={scenario}
                    onStart={handleStartScenario}
                    isTeacherDashboard={true}
                    selectedClassroom={selectedClassroom}
                    onStartLiveSession={selectedClassroom ? handleStartLiveSession : undefined}
                    onEndLiveSession={selectedClassroom ? handleEndLiveSession : undefined}
                  />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Create Classroom Modal */}
      <Dialog open={createModal.isOpen} onOpenChange={(open) => 
        setCreateModal(prev => ({ ...prev, isOpen: open }))
      }>
        <DialogContent className="bg-black/90 border border-white/10">
          <DialogHeader>
            <DialogTitle className="text-white">Create New Classroom</DialogTitle>
            <DialogDescription className="text-white/70">
              Set up a new classroom to start teaching with LifePath scenarios.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <label className="text-white text-sm font-medium mb-2 block">
                Classroom Name *
              </label>
              <Input
                placeholder="e.g., Period 3 Life Skills"
                value={createModal.name}
                onChange={(e) => setCreateModal(prev => ({ ...prev, name: e.target.value }))}
                className="bg-black/20 border-white/20 text-white"
                disabled={createModal.creating}
              />
            </div>
            
            <div>
              <label className="text-white text-sm font-medium mb-2 block">
                Description (Optional)
              </label>
              <Textarea
                placeholder="Brief description of your classroom..."
                value={createModal.description}
                onChange={(e) => setCreateModal(prev => ({ ...prev, description: e.target.value }))}
                className="bg-black/20 border-white/20 text-white resize-none"
                rows={3}
                disabled={createModal.creating}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setCreateModal(prev => ({ ...prev, isOpen: false }))}
              disabled={createModal.creating}
              className="bg-transparent border-white/20 text-white hover:bg-white/10"
            >
              Cancel
            </Button>
            <Button 
              onClick={handleCreateClassroom}
              disabled={createModal.creating || !createModal.name.trim()}
              className="glow-button"
            >
              {createModal.creating ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
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
    </div>
  );
};

export default TeacherDashboard;