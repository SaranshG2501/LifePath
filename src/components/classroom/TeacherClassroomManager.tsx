
/* eslint-disable @typescript-eslint/no-explicit-any */

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useToast } from '@/hooks/use-toast';
import { Copy, CheckCircle, Users, UserPlus, Trash, X, MessageSquare, SendHorizontal, RefreshCw, Loader2 } from 'lucide-react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { onClassroomUpdated, getActiveSession, ClassroomStudent, convertTimestampToDate, removeStudentFromClassroom, sendClassroomMessage, getClassroomMessages, onClassroomMessagesUpdated, ClassroomMessage } from '@/lib/firebase';
import { useAuth } from '@/context/AuthContext';

interface TeacherClassroomManagerProps {
  classroom: any;
  onRefresh: () => void;
}

const TeacherClassroomManager: React.FC<TeacherClassroomManagerProps> = ({
  classroom,
  onRefresh
}) => {
  const [copied, setCopied] = useState(false);
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<ClassroomMessage[]>([]);
  const [currentClassroom, setCurrentClassroom] = useState(classroom);
  const [activeSession, setActiveSession] = useState<any>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [sendingMessage, setSendingMessage] = useState(false);
  const { toast } = useToast();
  const { currentUser, userProfile } = useAuth();
  
  // Set up real-time listener for classroom updates
  useEffect(() => {
    if (!classroom?.id) return;
    
    console.log("Setting up classroom listener for:", classroom.id);
    
    const unsubscribe = onClassroomUpdated(classroom.id, (updatedClassroom) => {
      console.log("Classroom updated in real-time:", updatedClassroom);
      setCurrentClassroom(updatedClassroom);
    });
    
    return () => unsubscribe();
  }, [classroom?.id]);
  
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
    
    console.log("Setting up messages listener for classroom:", classroom.id);
    
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
      console.log("Messages updated in real-time:", updatedMessages);
      setMessages(updatedMessages);
    });
    
    return () => unsubscribe();
  }, [classroom?.id]);
  
  const handleCopyCode = () => {
    navigator.clipboard.writeText(currentClassroom.classCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    
    toast({
      title: "Class code copied",
      description: "Share this code with your students to join.",
    });
  };
  
  const handleRefreshClassroom = async () => {
    setRefreshing(true);
    try {
      await onRefresh();
      toast({
        title: "Refreshed",
        description: "Classroom data has been updated.",
      });
    } catch (error) {
      console.error("Error refreshing:", error);
    } finally {
      setRefreshing(false);
    }
  };
  
  const handleRemoveStudent = async (studentId: string, studentName: string) => {
    try {
      await removeStudentFromClassroom(currentClassroom.id, studentId);
      
      toast({
        title: "Student removed",
        description: `${studentName} has been removed from your classroom.`,
      });
      
      // Refresh the classroom data
      onRefresh();
    } catch (error) {
      console.error("Error removing student:", error);
      toast({
        title: "Error",
        description: "Failed to remove student. Please try again.",
        variant: "destructive",
      });
    }
  };
  
  const handleSendMessage = async () => {
    if (!message.trim()) {
      toast({
        title: "Empty message",
        description: "Please enter a message to send.",
        variant: "destructive",
      });
      return;
    }
    
    if (!currentUser || !userProfile) {
      toast({
        title: "Authentication required",
        description: "Please login to send messages.",
        variant: "destructive",
      });
      return;
    }
    
    setSendingMessage(true);
    try {
      await sendClassroomMessage(
        currentClassroom.id,
        currentUser.uid,
        userProfile.displayName || userProfile.username || 'Teacher',
        'teacher',
        message.trim()
      );
      
      toast({
        title: "Message sent",
        description: "Your message has been sent to all students.",
      });
      
      setMessage('');
    } catch (error) {
      console.error("Error sending message:", error);
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSendingMessage(false);
    }
  };
  
  const studentsList = currentClassroom?.students || [];
  console.log("Current students list:", studentsList);
  
  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-medium text-white">Classroom Information</h3>
          <Button 
            variant="outline" 
            size="sm"
            className="border-white/20 bg-black/20 text-white hover:bg-white/10"
            onClick={handleRefreshClassroom}
            disabled={refreshing}
          >
            <RefreshCw className={`h-4 w-4 mr-1 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
        <div className="bg-black/20 rounded-lg p-4 border border-white/10">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <p className="text-white/70 text-sm">Share this code with your students:</p>
              <div className="flex items-center gap-2 mt-1">
                <code className="bg-black/40 px-3 py-1 rounded text-primary font-mono">
                  {currentClassroom.classCode}
                </code>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="text-white hover:bg-white/10"
                  onClick={handleCopyCode}
                >
                  {copied ? <CheckCircle className="h-4 w-4 text-green-400" /> : <Copy className="h-4 w-4" />}
                </Button>
              </div>
            </div>
            
            <div className="flex gap-2">
              <Badge className="bg-green-500/20 text-green-300 border-0">
                <div className="flex items-center gap-1">
                  <div className="relative">
                    <div className="absolute h-2 w-2 rounded-full bg-green-400 animate-ping"></div>
                    <div className="relative h-2 w-2 rounded-full bg-green-400"></div>
                  </div>
                  Active
                </div>
              </Badge>
              
              {activeSession && (
                <Badge className="bg-blue-500/20 text-blue-300 border-0">
                  Live Session
                </Badge>
              )}
            </div>
          </div>
        </div>
      </div>
      
      <div>
        <div className="flex justify-between items-center mb-3">
          <h3 className="font-medium text-white flex items-center gap-1">
            <Users className="h-4 w-4 text-primary" />
            Students ({studentsList.length})
          </h3>
          <Button variant="outline" size="sm" className="border-white/20 bg-black/20 text-white hover:bg-white/10">
            <UserPlus className="mr-1 h-4 w-4" />
            Invite
          </Button>
        </div>
        
        {studentsList.length > 0 ? (
          <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
            {studentsList.map((student: ClassroomStudent, i: number) => (
              <div 
                key={student.id || i} 
                className="bg-black/20 rounded-lg p-3 flex items-center justify-between"
              >
                <div className="flex items-center gap-2">
                  <Avatar className="h-8 w-8 border border-white/20">
                    <AvatarFallback className="bg-primary/20 text-white">
                      {student.name?.charAt(0)?.toUpperCase() || 'S'}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="text-white">{student.name || `Student ${i + 1}`}</div>
                    <div className="text-xs text-white/60">
                      Joined: {student.joinedAt ? 
                        convertTimestampToDate(student.joinedAt).toLocaleDateString() : 
                        'Recently'
                      }
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-1">
                  <Badge className={`${
                    i % 3 === 0 ? 'bg-green-500/20 text-green-300' : 
                    i % 3 === 1 ? 'bg-blue-500/20 text-blue-300' : 
                    'bg-orange-500/20 text-orange-300'
                  } border-0`}>
                    {i % 3 === 0 ? 'Active' : i % 3 === 1 ? 'Completed' : 'Started'}
                  </Badge>
                  
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="ghost" size="sm" className="text-white/70 hover:text-white hover:bg-white/10">
                        <Trash className="h-4 w-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent className="bg-black/90 border border-white/10">
                      <AlertDialogHeader>
                        <AlertDialogTitle className="text-white">Remove Student</AlertDialogTitle>
                        <AlertDialogDescription className="text-white/70">
                          Are you sure you want to remove {student.name} from your classroom?
                          They will no longer have access to classroom activities.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel className="bg-transparent border border-white/10 text-white hover:bg-white/10">
                          Cancel
                        </AlertDialogCancel>
                        <AlertDialogAction 
                          onClick={() => handleRemoveStudent(student.id, student.name)}
                          className="bg-red-500 hover:bg-red-600 text-white"
                        >
                          Remove
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-black/20 rounded-lg p-6 flex flex-col items-center justify-center text-center">
            <Users className="h-12 w-12 text-white/30 mb-2" />
            <h4 className="text-white font-medium">No Students Yet</h4>
            <p className="text-white/70 text-sm mt-1">
              Share your class code with students to join your classroom.
            </p>
          </div>
        )}
      </div>
      
      <div>
        <h3 className="font-medium mb-3 text-white flex items-center gap-1">
          <MessageSquare className="h-4 w-4 text-primary" />
          Class Announcement
        </h3>
        <div className="bg-black/20 rounded-lg p-4 border border-white/10">
          <div className="relative">
            <Input 
              placeholder="Send a message to your class..." 
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="pr-10 bg-black/20 border-white/20 text-white"
            />
            <Button 
              size="sm" 
              className="absolute right-1 top-1 h-7 bg-primary/20 hover:bg-primary/30 text-white"
              onClick={handleSendMessage}
              disabled={sendingMessage || !message.trim()}
            >
              {sendingMessage ? <Loader2 className="h-4 w-4 animate-spin" /> : <SendHorizontal className="h-4 w-4" />}
            </Button>
          </div>
          
          <div className="mt-4 pt-4 border-t border-white/10 max-h-[200px] overflow-y-auto">
            {messages && messages.length > 0 ? (
              <div className="space-y-3">
                {messages.map((msg, index) => (
                  <div key={msg.id || index} className="bg-black/20 rounded-md p-3">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-blue-300 font-medium">
                        {msg.senderRole === 'teacher' ? '👨‍🏫 ' : '👨‍🎓 '}{msg.senderName}
                      </span>
                      <span className="text-xs text-white/50">
                        {msg.timestamp ? convertTimestampToDate(msg.timestamp).toLocaleString() : 'Just now'}
                      </span>
                    </div>
                    <div className="text-white">{msg.text}</div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-sm text-white/70">
                Recent messages will appear here
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeacherClassroomManager;
