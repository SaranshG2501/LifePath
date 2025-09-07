import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { 
  Copy, 
  CheckCircle, 
  Users, 
  UserPlus, 
  Trash, 
  MessageSquare, 
  SendHorizontal, 
  RefreshCw, 
  Loader2,
  Radio,
  AlertCircle,
  BookOpen,
  Play,
  StopCircle,
  Calendar
} from 'lucide-react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  onClassroomUpdated, 
  getActiveSession, 
  removeStudentFromClassroom, 
  sendClassroomMessage, 
  getClassroomMessages, 
  onClassroomMessagesUpdated,
  createLiveSession,
  endLiveSession,
  ClassroomMessage
} from '@/lib/firebase';
import { useAuth } from '@/context/AuthContext';
import { useGameContext } from '@/context/GameContext';
import { useNavigate } from 'react-router-dom';
import ScenarioCard from '@/components/ScenarioCard';

interface ClassroomStudent {
  id: string;
  name: string;
  joinedAt: any;
}

// ClassroomMessage interface imported from firebase.ts

interface Classroom {
  id: string;
  name: string;
  description?: string;
  teacherId: string;
  teacherName?: string;
  students: ClassroomStudent[];
  activeSessionId?: string | null;
  classCode: string;
  isActive: boolean;
  createdAt: any;
}

interface TeacherClassroomManagerProps {
  classroom: Classroom;
  onRefresh: () => void;
}

const TeacherClassroomManager: React.FC<TeacherClassroomManagerProps> = ({
  classroom,
  onRefresh
}) => {
  // State management
  const [currentClassroom, setCurrentClassroom] = useState<Classroom>(classroom);
  const [copied, setCopied] = useState(false);
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<ClassroomMessage[]>([]);
  const [activeSession, setActiveSession] = useState<any>(null);
  const [actionStates, setActionStates] = useState({
    refreshing: false,
    sendingMessage: false,
    removingStudent: null as string | null,
    creatingSession: false,
    endingSession: false,
  });

  // Live session modal state
  const [liveSessionModal, setLiveSessionModal] = useState({
    isOpen: false,
    selectedScenario: null as any,
    mirrorMomentsEnabled: false,
  });

  const { toast } = useToast();
  const { currentUser, userProfile } = useAuth();
  const { scenarios, startScenario, setGameMode } = useGameContext();
  const navigate = useNavigate();
  
  // Update classroom when prop changes
  useEffect(() => {
    setCurrentClassroom(classroom);
  }, [classroom]);
  
  // Set up real-time listener for classroom updates
  useEffect(() => {
    if (!classroom?.id) return;
    
    console.log('Setting up classroom updates listener for:', classroom.id);
    
    const unsubscribe = onClassroomUpdated(classroom.id, (updatedClassroom) => {
      console.log('Classroom updated via listener:', updatedClassroom);
      setCurrentClassroom(updatedClassroom as Classroom);
      onRefresh(); // Trigger parent refresh
    });
    
    return () => {
      console.log('Cleaning up classroom updates listener');
      unsubscribe();
    };
  }, [classroom?.id, onRefresh]);
  
  // Check for active sessions
  useEffect(() => {
    const checkActiveSession = async () => {
      if (!classroom?.id) return;
      
      try {
        const session = await getActiveSession(classroom.id);
        console.log('Active session check result:', session);
        setActiveSession(session);
      } catch (error) {
        console.error("Error checking active session:", error);
      }
    };
    
    checkActiveSession();
  }, [classroom?.id, currentClassroom.activeSessionId]);
  
  // Set up real-time listener for classroom messages
  useEffect(() => {
    if (!classroom?.id) return;
    
    console.log('Setting up messages listener for:', classroom.id);
    
    // Load initial messages
    const loadMessages = async () => {
      try {
        const initialMessages = await getClassroomMessages(classroom.id);
        setMessages(initialMessages);
      } catch (error) {
        console.error("Error loading initial messages:", error);
      }
    };
    
    loadMessages();
    
    // Set up real-time listener
    const unsubscribe = onClassroomMessagesUpdated(classroom.id, (updatedMessages) => {
      setMessages(updatedMessages);
    });
    
    return () => {
      console.log('Cleaning up messages listener');
      unsubscribe();
    };
  }, [classroom?.id]);
  
  // Copy classroom code
  const handleCopyCode = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(currentClassroom.classCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      
      toast({
        title: "Code Copied",
        description: "Class code copied to clipboard. Share with students.",
      });
    } catch (error) {
      console.error('Failed to copy:', error);
      toast({
        title: "Copy Failed",
        description: "Could not copy code. Please copy manually.",
        variant: "destructive",
      });
    }
  }, [currentClassroom.classCode, toast]);
  
  // Refresh classroom data
  const handleRefreshClassroom = useCallback(async () => {
    setActionStates(prev => ({ ...prev, refreshing: true }));
    
    try {
      await onRefresh();
      toast({
        title: "Refreshed",
        description: "Classroom data updated successfully.",
      });
    } catch (error) {
      console.error("Error refreshing:", error);
      toast({
        title: "Refresh Failed",
        description: "Could not refresh data. Please try again.",
        variant: "destructive",
      });
    } finally {
      setActionStates(prev => ({ ...prev, refreshing: false }));
    }
  }, [onRefresh, toast]);
  
  // Remove student from classroom
  const handleRemoveStudent = async (studentId: string, studentName: string) => {
    if (!currentClassroom?.id) return;

    setActionStates(prev => ({ ...prev, removingStudent: studentId }));
    
    try {
      console.log('Removing student:', { studentId, studentName, classroomId: currentClassroom.id });
      
      const success = await removeStudentFromClassroom(currentClassroom.id, studentId);
      
      if (success) {
        toast({
          title: "Student Removed",
          description: `${studentName} has been removed from the classroom.`,
        });
        
        // Trigger refresh after a short delay
        setTimeout(() => {
          onRefresh();
        }, 500);
      }
    } catch (error) {
      console.error("Error removing student:", error);
      
      let errorMessage = "Failed to remove student. Please try again.";
      
      if (error instanceof Error) {
        if (error.message.includes('Permission denied')) {
          errorMessage = "You don't have permission to remove this student.";
        } else if (error.message.includes('not found')) {
          errorMessage = "Student not found or already removed.";
        } else {
          errorMessage = error.message;
        }
      }
      
      toast({
        title: "Removal Failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setActionStates(prev => ({ ...prev, removingStudent: null }));
    }
  };
  
  // Send message to classroom
  const handleSendMessage = async () => {
    if (!message.trim()) {
      toast({
        title: "Empty Message",
        description: "Please enter a message to send.",
        variant: "destructive",
      });
      return;
    }
    
    if (!currentUser || !userProfile) {
      toast({
        title: "Authentication Required",
        description: "Please login to send messages.",
        variant: "destructive",
      });
      return;
    }
    
    setActionStates(prev => ({ ...prev, sendingMessage: true }));
    
    try {
      await sendClassroomMessage(
        currentClassroom.id,
        currentUser.uid,
        userProfile.displayName || userProfile.username || currentUser.displayName || 'Teacher',
        'teacher',
        message.trim()
      );
      
      toast({
        title: "Message Sent",
        description: "Your announcement has been sent to all students.",
      });
      
      setMessage('');
    } catch (error) {
      console.error("Error sending message:", error);
      toast({
        title: "Send Failed",
        description: "Could not send message. Please try again.",
        variant: "destructive",
      });
    } finally {
      setActionStates(prev => ({ ...prev, sendingMessage: false }));
    }
  };

  // Start live session
  const handleStartLiveSession = async () => {
    if (!currentUser?.uid || !currentClassroom.id || !liveSessionModal.selectedScenario) return;

    setActionStates(prev => ({ ...prev, creatingSession: true }));
    
    try {
      console.log('Starting live session:', {
        classroomId: currentClassroom.id,
        scenarioId: liveSessionModal.selectedScenario.id,
        mirrorMomentsEnabled: liveSessionModal.mirrorMomentsEnabled
      });

      await createLiveSession(
        currentClassroom.id,
        liveSessionModal.selectedScenario.id,
        currentUser.uid,
        userProfile?.displayName || currentUser.displayName || 'Teacher',
        liveSessionModal.selectedScenario.title,
        liveSessionModal.mirrorMomentsEnabled
      );

      toast({
        title: "Session Started",
        description: `"${liveSessionModal.selectedScenario.title}" is now live!`,
      });

      // Reset modal and navigate to game
      setLiveSessionModal({
        isOpen: false,
        selectedScenario: null,
        mirrorMomentsEnabled: false,
      });

      setGameMode("classroom");
      startScenario(liveSessionModal.selectedScenario.id);
      navigate('/game');
      
    } catch (error) {
      console.error('Error starting live session:', error);
      toast({
        title: "Session Start Failed",
        description: error instanceof Error ? error.message : "Could not start live session.",
        variant: "destructive",
      });
    } finally {
      setActionStates(prev => ({ ...prev, creatingSession: false }));
    }
  };

  // End live session
  const handleEndLiveSession = async () => {
    if (!currentUser?.uid || !currentClassroom.id || !currentClassroom.activeSessionId) return;

    setActionStates(prev => ({ ...prev, endingSession: true }));
    
    try {
      console.log('Ending live session:', currentClassroom.activeSessionId);
      await endLiveSession(currentClassroom.activeSessionId, currentClassroom.id);
      
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
      setActionStates(prev => ({ ...prev, endingSession: false }));
    }
  };
  
  const studentsList = currentClassroom?.students || [];
  
  return (
    <div className="space-y-6">
      {/* Classroom Information */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-white flex items-center gap-2">
            <Radio className="h-5 w-5 text-primary" />
            Classroom Information
          </h3>
          <Button 
            variant="outline" 
            size="sm"
            className="border-white/20 bg-black/20 text-white hover:bg-white/10"
            onClick={handleRefreshClassroom}
            disabled={actionStates.refreshing}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${actionStates.refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
        
        <Card className="bg-black/20 border-white/10">
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex-1">
                <p className="text-white/70 text-sm mb-2">Share this code with students:</p>
                <div className="flex items-center gap-3">
                  <code className="bg-black/40 px-4 py-2 rounded-lg text-primary font-mono text-lg border border-primary/20">
                    {currentClassroom.classCode}
                  </code>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="text-white hover:bg-white/10 p-2"
                    onClick={handleCopyCode}
                  >
                    {copied ? (
                      <CheckCircle className="h-4 w-4 text-green-400" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>
              
              <div className="flex flex-col gap-2">
                <Badge className="bg-green-500/20 text-green-300 border-0 justify-center">
                  <div className="flex items-center gap-2">
                    <div className="relative">
                      <div className="absolute h-2 w-2 rounded-full bg-green-400 animate-ping"></div>
                      <div className="relative h-2 w-2 rounded-full bg-green-400"></div>
                    </div>
                    Active Classroom
                  </div>
                </Badge>
                
                {currentClassroom.activeSessionId && (
                  <Badge className="bg-blue-500/20 text-blue-300 border-0 justify-center">
                    Live Session Running
                  </Badge>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Live Session Controls */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-white flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-primary" />
            Live Session Management
          </h3>
        </div>

        <Card className="bg-black/20 border-white/10">
          <CardContent className="p-4">
            {currentClassroom.activeSessionId ? (
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Badge className="bg-green-500/20 text-green-300 border-0 animate-pulse">
                      <div className="flex items-center gap-2">
                        <div className="relative">
                          <div className="absolute h-2 w-2 rounded-full bg-green-400 animate-ping"></div>
                          <div className="relative h-2 w-2 rounded-full bg-green-400"></div>
                        </div>
                        Session Active
                      </div>
                    </Badge>
                  </div>
                  <p className="text-white/70 text-sm">
                    A live session is currently running for this classroom.
                  </p>
                  <p className="text-white text-sm mt-1">
                    Students can join using the classroom code above.
                  </p>
                </div>
                
                <Button 
                  onClick={handleEndLiveSession}
                  disabled={actionStates.endingSession}
                  className="bg-red-500/20 text-red-300 border border-red-500/30 hover:bg-red-500/30"
                >
                  {actionStates.endingSession ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Ending...
                    </>
                  ) : (
                    <>
                      <StopCircle className="h-4 w-4 mr-2" />
                      End Session
                    </>
                  )}
                </Button>
              </div>
            ) : (
              <div className="text-center py-4">
                <Calendar className="h-12 w-12 text-white/20 mx-auto mb-3" />
                <h4 className="text-white font-medium mb-2">No Active Session</h4>
                <p className="text-white/60 text-sm mb-4">
                  Start a live session to engage with your students in real-time.
                </p>
                <Button 
                  onClick={() => setLiveSessionModal(prev => ({ ...prev, isOpen: true }))}
                  className="glow-button"
                  disabled={studentsList.length === 0}
                >
                  <Play className="h-4 w-4 mr-2" />
                  Start Live Session
                </Button>
                {studentsList.length === 0 && (
                  <p className="text-white/50 text-xs mt-2">
                    Add students to start a session
                  </p>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      
      {/* Students Management */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-white flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" />
            Students ({studentsList.length})
          </h3>
          <Button 
            variant="outline" 
            size="sm" 
            className="border-white/20 bg-black/20 text-white hover:bg-white/10"
            onClick={handleCopyCode}
          >
            <UserPlus className="mr-2 h-4 w-4" />
            Share Code
          </Button>
        </div>
        
        <Card className="bg-black/20 border-white/10">
          <CardContent className="p-4">
            {studentsList.length > 0 ? (
              <div className="space-y-3 max-h-[400px] overflow-y-auto">
                {studentsList.map((student: ClassroomStudent, index: number) => (
                  <div 
                    key={student.id || index} 
                    className="bg-black/20 rounded-lg p-4 flex items-center justify-between hover:bg-black/30 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10 border border-white/20">
                        <AvatarFallback className="bg-primary/20 text-white font-semibold">
                          {student.name?.charAt(0)?.toUpperCase() || 'S'}
                        </AvatarFallback>
                      </Avatar>
                      
                      <div>
                        <div className="font-medium text-white">
                          {student.name || `Student ${index + 1}`}
                        </div>
                        <div className="text-xs text-white/60">
                          Joined: {student.joinedAt ? 
                            new Date(student.joinedAt.seconds * 1000).toLocaleDateString() : 
                            'Recently'
                          }
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Badge className={`border-0 ${
                        index % 3 === 0 ? 'bg-green-500/20 text-green-300' : 
                        index % 3 === 1 ? 'bg-blue-500/20 text-blue-300' : 
                        'bg-orange-500/20 text-orange-300'
                      }`}>
                        {index % 3 === 0 ? 'Active' : index % 3 === 1 ? 'Completed' : 'In Progress'}
                      </Badge>
                      
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="text-red-400 hover:text-red-300 hover:bg-red-900/20 p-2 h-8 w-8"
                            disabled={actionStates.removingStudent === student.id}
                          >
                            {actionStates.removingStudent === student.id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Trash className="h-4 w-4" />
                            )}
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent className="bg-black/90 border border-red-500/20">
                          <AlertDialogHeader>
                            <div className="flex items-center gap-3 mb-2">
                              <div className="p-2 bg-red-500/20 rounded-full">
                                <AlertCircle className="h-5 w-5 text-red-400" />
                              </div>
                              <AlertDialogTitle className="text-white">Remove Student</AlertDialogTitle>
                            </div>
                            <AlertDialogDescription className="text-white/70">
                              Are you sure you want to remove <strong>{student.name}</strong> from your classroom?
                              <br /><br />
                              They will lose access to classroom activities and will need a new invitation to rejoin.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel className="bg-transparent border border-white/10 text-white hover:bg-white/10">
                              Cancel
                            </AlertDialogCancel>
                            <AlertDialogAction 
                              onClick={() => handleRemoveStudent(student.id, student.name)}
                              className="bg-red-500 hover:bg-red-600 text-white"
                              disabled={actionStates.removingStudent === student.id}
                            >
                              {actionStates.removingStudent === student.id ? "Removing..." : "Remove Student"}
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Users className="h-16 w-16 text-white/20 mx-auto mb-4" />
                <h4 className="text-white font-medium mb-2">No Students Yet</h4>
                <p className="text-white/60 text-sm mb-4">
                  Share your classroom code with students to get started.
                </p>
                <Button 
                  onClick={handleCopyCode}
                  variant="outline"
                  className="border-white/20 bg-black/20 text-white hover:bg-white/10"
                >
                  <Copy className="h-4 w-4 mr-2" />
                  Copy Class Code
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      
      {/* Classroom Announcements */}
      <div>
        <h3 className="font-semibold mb-4 text-white flex items-center gap-2">
          <MessageSquare className="h-5 w-5 text-primary" />
          Classroom Announcements
        </h3>
        
        <Card className="bg-black/20 border-white/10">
          <CardContent className="p-4">
            {/* Send Message */}
            <div className="relative mb-4">
              <Input 
                placeholder="Send an announcement to your class..." 
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && handleSendMessage()}
                className="pr-12 bg-black/20 border-white/20 text-white placeholder:text-white/50"
                disabled={actionStates.sendingMessage}
              />
              <Button 
                size="sm" 
                onClick={handleSendMessage}
                disabled={actionStates.sendingMessage || !message.trim()}
                className="absolute right-1 top-1/2 -translate-y-1/2 h-8 px-3 glow-button-sm"
              >
                {actionStates.sendingMessage ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <SendHorizontal className="h-4 w-4" />
                )}
              </Button>
            </div>
            
            {/* Messages List */}
            <div className="space-y-2 max-h-[300px] overflow-y-auto">
              {messages.length > 0 ? (
                messages.map((msg) => (
                  <div 
                    key={msg.id} 
                    className="bg-black/20 rounded-lg p-3 border-l-4 border-primary/30"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-white font-medium text-sm">
                        {msg.senderName}
                      </span>
                      <span className="text-white/50 text-xs">
                        {msg.timestamp ? new Date(msg.timestamp.seconds * 1000).toLocaleString() : 'Now'}
                      </span>
                    </div>
                    <p className="text-white/80 text-sm">{msg.text}</p>
                  </div>
                ))
              ) : (
                <div className="text-center py-6">
                  <MessageSquare className="h-12 w-12 text-white/20 mx-auto mb-2" />
                  <p className="text-white/60 text-sm">No announcements yet</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Live Session Modal */}
      <Dialog 
        open={liveSessionModal.isOpen} 
        onOpenChange={(open) => setLiveSessionModal(prev => ({ ...prev, isOpen: open }))}
      >
        <DialogContent className="bg-black/90 border border-white/10 max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-white flex items-center gap-2">
              <Play className="h-5 w-5 text-primary" />
              Start Live Session
            </DialogTitle>
            <DialogDescription className="text-white/70">
              Choose a scenario to run with your students in real-time.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <h4 className="text-white font-medium mb-3">Select Scenario:</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-h-[300px] overflow-y-auto">
                {scenarios.map((scenario) => (
                  <Card 
                    key={scenario.id}
                    className={`cursor-pointer transition-all duration-200 ${
                      liveSessionModal.selectedScenario?.id === scenario.id
                        ? 'ring-2 ring-primary bg-primary/10 border-primary/30'
                        : 'bg-black/20 border-white/10 hover:bg-black/30'
                    }`}
                    onClick={() => setLiveSessionModal(prev => ({ 
                      ...prev, 
                      selectedScenario: scenario 
                    }))}
                  >
                    <CardContent className="p-4">
                      <h5 className="text-white font-medium mb-2">{scenario.title}</h5>
                      <p className="text-white/60 text-sm">{scenario.description}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <Badge className="bg-blue-500/20 text-blue-300 border-0 text-xs">
                          {scenario.category}
                        </Badge>
                        <Badge className="bg-green-500/20 text-green-300 border-0 text-xs">
                          ~{Math.ceil(scenario.scenes.length * 2)}min
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="mirrorMoments"
                checked={liveSessionModal.mirrorMomentsEnabled}
                onCheckedChange={(checked) => 
                  setLiveSessionModal(prev => ({ 
                    ...prev, 
                    mirrorMomentsEnabled: checked as boolean 
                  }))
                }
              />
              <label 
                htmlFor="mirrorMoments"
                className="text-white text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Enable Mirror Moments (reflection questions)
              </label>
            </div>
          </div>
          
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setLiveSessionModal(prev => ({ ...prev, isOpen: false }))}
              disabled={actionStates.creatingSession}
              className="border-white/20 bg-transparent text-white hover:bg-white/10"
            >
              Cancel
            </Button>
            <Button
              onClick={handleStartLiveSession}
              disabled={actionStates.creatingSession || !liveSessionModal.selectedScenario}
              className="glow-button"
            >
              {actionStates.creatingSession ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Starting...
                </>
              ) : (
                <>
                  <Play className="h-4 w-4 mr-2" />
                  Start Session
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TeacherClassroomManager;