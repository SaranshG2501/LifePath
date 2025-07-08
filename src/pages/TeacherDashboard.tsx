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
import { School, Plus, Users, Play, Trash2, AlertTriangle, Calendar, Clock, BookOpen } from 'lucide-react';
import { getUserClassrooms, deleteClassroom, Classroom, convertTimestampToDate, createClassroom, createLiveSession } from '@/lib/firebase';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';

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

  // Classroom creation state
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [classNameInput, setClassNameInput] = useState('');
  const [classDescriptionInput, setClassDescriptionInput] = useState('');
  const [isCreatingClassroom, setIsCreatingClassroom] = useState(false);

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

  const handleStartLiveSession = async (classroom: Classroom, scenario: any) => {
    if (!currentUser || !classroom.id) return;
    
    setCreatingSession(classroom.id);
    try {
      console.log("Starting live session for classroom:", classroom.id);
      
      await createLiveSession(
        classroom.id,
        scenario.id,
        currentUser.uid,
        currentUser.displayName || 'Teacher',
        scenario.title
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

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Teacher Dashboard</h1>
          <p className="text-white/70">Manage your classrooms and scenarios</p>
        </div>
        <Button 
          onClick={() => setIsCreateModalOpen(true)}
          className="bg-blue-500 hover:bg-blue-600 text-white"
        >
          <Plus className="h-4 w-4 mr-2" />
          Create Classroom
        </Button>
      </div>

      {/* Classrooms Section */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <School className="h-6 w-6 text-primary" />
            Your Classrooms ({classrooms.length})
          </h2>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {classrooms.map((classroom) => (
              <Card key={classroom.id} className="bg-black/20 border-white/10 hover:bg-black/30 transition-colors">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-white text-lg">{classroom.name}</CardTitle>
                      <CardDescription className="text-white/70 mt-1">
                        {classroom.description || "No description"}
                      </CardDescription>
                    </div>
                    <div className="flex items-center gap-2 ml-2">
                      {classroom.activeSessionId && (
                        <Badge className="bg-green-500/20 text-green-300 border-0 text-xs">
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
                    
                    <div className="text-xs text-white/60 bg-black/30 rounded px-2 py-1 font-mono">
                      Code: {classroom.classCode}
                    </div>
                    
                    <div className="flex gap-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => setSelectedClassroom(classroom)}
                        className="flex-1 border-white/20 bg-black/20 text-white hover:bg-white/10"
                      >
                        <School className="h-4 w-4 mr-1" />
                        Manage
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="bg-black/20 border-white/10">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <School className="h-16 w-16 text-white/30 mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">No Classrooms Yet</h3>
              <p className="text-white/70 text-center mb-6 max-w-md">
                Create your first classroom to start teaching interactive scenarios to your students.
              </p>
              <Button onClick={() => setIsCreateModalOpen(true)} className="bg-primary hover:bg-primary/90">
                <Plus className="h-4 w-4 mr-2" />
                Create Your First Classroom
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Selected Classroom Management */}
      {selectedClassroom && (
        <div className="mb-8">
          <Card className="bg-black/20 border-white/10">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-white flex items-center gap-2">
                    <School className="h-5 w-5 text-primary" />
                    {selectedClassroom.name}
                  </CardTitle>
                  <CardDescription className="text-white/70">
                    Classroom Management
                  </CardDescription>
                </div>
                <Button 
                  variant="ghost" 
                  onClick={() => setSelectedClassroom(null)}
                  className="text-white/70 hover:text-white"
                >
                  Close
                </Button>
              </div>
            </CardHeader>
            <CardContent>
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
                      onClick={() => handleStartLiveSession(selectedClassroom, scenario)}
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
          <div className="mt-4 p-4 bg-blue-900/20 rounded-lg border border-blue-500/20">
            <p className="text-blue-300 text-sm">
              💡 Select a classroom above to enable live session options for scenarios
            </p>
          </div>
        )}
      </div>

      {/* Create Classroom Modal */}
      <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Classroom</DialogTitle>
            <DialogDescription>
              Enter details for your new classroom
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label htmlFor="name" className="block text-sm font-medium text-white">
                Classroom Name
              </label>
              <Input
                id="name"
                value={classNameInput}
                onChange={(e) => setClassNameInput(e.target.value)}
                placeholder="My Awesome Classroom"
                className="bg-black/20 border-white/10 text-white"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="description" className="block text-sm font-medium text-white">
                Description (Optional)
              </label>
              <Input
                id="description"
                value={classDescriptionInput}
                onChange={(e) => setClassDescriptionInput(e.target.value)}
                placeholder="What will students learn in this classroom?"
                className="bg-black/20 border-white/10 text-white"
              />
            </div>
          </div>
          <DialogFooter>
            <Button 
              onClick={handleCreateClassroom}
              disabled={!classNameInput.trim() || isCreatingClassroom}
              className="bg-blue-500 hover:bg-blue-600"
            >
              {isCreatingClassroom ? (
                <>
                  <Clock className="h-4 w-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                "Create Classroom"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TeacherDashboard;
