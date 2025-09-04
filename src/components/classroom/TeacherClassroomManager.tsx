import React, { useState, useEffect } from 'react';
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
  AlertCircle
} from 'lucide-react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { 
  onClassroomUpdated, 
  getActiveSession, 
  ClassroomStudent, 
  convertTimestampToDate, 
  removeStudentFromClassroom, 
  sendClassroomMessage, 
  getClassroomMessages, 
  onClassroomMessagesUpdated, 
  ClassroomMessage 
} from '@/lib/firebase';
import { useAuth } from '@/context/AuthContext';

interface TeacherClassroomManagerProps {
  classroom: any;
  onRefresh: () => void;
}

const TeacherClassroomManager: React.FC<TeacherClassroomManagerProps> = ({
  classroom,
  onRefresh
}) => {
  // State management
  const [currentClassroom, setCurrentClassroom] = useState(classroom);
  const [copied, setCopied] = useState(false);
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<ClassroomMessage[]>([]);
  const [activeSession, setActiveSession] = useState<any>(null);
  const [actionStates, setActionStates] = useState({
    refreshing: false,
    sendingMessage: false,
    removingStudent: null as string | null,
  });

  const { toast } = useToast();
  const { currentUser, userProfile } = useAuth();
  
  // Update classroom when prop changes
  useEffect(() => {
    setCurrentClassroom(classroom);
  }, [classroom]);
  
  // Set up real-time listener for classroom updates
  useEffect(() => {
    if (!classroom?.id) return;
    
    console.log('Setting up classroom updates listener for:', classroom.id);
    
    const unsubscribe = onClassroomUpdated(classroom.id, (updatedClassroom) => {
      console.log('Classroom updated:', updatedClassroom);
      setCurrentClassroom(updatedClassroom);
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
        setActiveSession(session);
      } catch (error) {
        console.error("Error checking active session:", error);
      }
    };
    
    checkActiveSession();
  }, [classroom?.id]);
  
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
  const handleCopyCode = async () => {
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
  };
  
  // Refresh classroom data
  const handleRefreshClassroom = async () => {
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
  };
  
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
                
                {activeSession && (
                  <Badge className="bg-blue-500/20 text-blue-300 border-0 justify-center">
                    Live Session Running
                  </Badge>
                )}
              </div>
            </div>
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
          >
            <UserPlus className="mr-2 h-4 w-4" />
            Invite Students
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
                            convertTimestampToDate(student.joinedAt).toLocaleDateString() : 
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
                className="absolute right-2 top-1/2 -translate-y-1/2 h-7 w-7 p-0 bg-primary/20 hover:bg-primary/30 text-white"
                onClick={handleSendMessage}
                disabled={actionStates.sendingMessage || !message.trim()}
              >
                {actionStates.sendingMessage ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <SendHorizontal className="h-4 w-4" />
                )}
              </Button>
            </div>
            
            {/* Messages Feed */}
            <div className="border-t border-white/10 pt-4 max-h-[300px] overflow-y-auto">
              {messages && messages.length > 0 ? (
                <div className="space-y-3">
                  {messages.map((msg, index) => (
                    <div key={msg.id || index} className="bg-black/20 rounded-lg p-3 hover:bg-black/30 transition-colors">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-primary flex items-center gap-2">
                          {msg.senderRole === 'teacher' ? '👨‍🏫' : '👨‍🎓'} {msg.senderName}
                        </span>
                        <span className="text-xs text-white/50">
                          {msg.timestamp ? convertTimestampToDate(msg.timestamp).toLocaleString() : 'Just now'}
                        </span>
                      </div>
                      <div className="text-white text-sm">{msg.text}</div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6">
                  <MessageSquare className="h-12 w-12 text-white/20 mx-auto mb-3" />
                  <p className="text-white/60 text-sm">
                    No announcements yet. Send your first message to the class.
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default TeacherClassroomManager;