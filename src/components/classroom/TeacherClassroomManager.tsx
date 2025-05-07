
/* eslint-disable @typescript-eslint/no-explicit-any */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useToast } from '@/hooks/use-toast';
import { scenarios } from '@/data/scenarios';
import { Copy, CheckCircle, Users, UserPlus, Trash, MessageSquare, SendHorizontal, Book, Play } from 'lucide-react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ClassroomStudent, startClassroomScenario, addClassroomMessage, getStudentProgress } from '@/lib/firebase';
import { useGameContext } from '@/context/GameContext';

interface TeacherClassroomManagerProps {
  classroom: any;
  onRefresh: () => void;
}

const TeacherClassroomManager: React.FC<TeacherClassroomManagerProps> = ({
  classroom,
  onRefresh
}) => {
  const navigate = useNavigate();
  const [copied, setCopied] = useState(false);
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<any[]>([]);
  const [selectedScenario, setSelectedScenario] = useState<string | null>(null);
  const [studentProgress, setStudentProgress] = useState<any[]>([]);
  const { toast } = useToast();
  const { startScenario, setClassroomId } = useGameContext();
  
  // Initialize messages from classroom if available
  useEffect(() => {
    if (classroom && classroom.messages) {
      setMessages(classroom.messages);
    }
    
    // Set active scenario if one is running
    if (classroom && classroom.activeScenario) {
      setSelectedScenario(classroom.activeScenario);
    }
    
    // Fetch student progress if classroom exists
    if (classroom && classroom.id) {
      fetchStudentProgress();
    }
  }, [classroom]);
  
  const fetchStudentProgress = async () => {
    if (!classroom || !classroom.id) return;
    
    try {
      const progress = await getStudentProgress(classroom.id);
      setStudentProgress(progress);
    } catch (error) {
      console.error('Error fetching student progress:', error);
    }
  };
  
  const handleCopyCode = () => {
    navigator.clipboard.writeText(classroom.classCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    
    toast({
      title: "Class code copied",
      description: "Share this code with your students to join.",
    });
  };
  
  const handleRemoveStudent = (studentId: string) => {
    // In a real app, this would remove a student from the classroom
    toast({
      title: "Student removed",
      description: "The student has been removed from your classroom.",
    });
    onRefresh(); // Refresh classroom data
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
    
    try {
      // Create the message object
      const newMessage = {
        text: message,
        sentAt: new Date(),
        sender: 'teacher'
      };
      
      // Update messages locally first for immediate feedback
      setMessages([newMessage, ...messages]);
      
      // Send to database
      if (classroom && classroom.id) {
        await addClassroomMessage(classroom.id, newMessage);
      }
      
      toast({
        title: "Message sent",
        description: "Your message has been sent to all students.",
      });
      
      setMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive",
      });
    }
  };
  
  const handleStartScenario = async () => {
    if (!selectedScenario || !classroom || !classroom.id) {
      toast({
        title: "Error",
        description: "Please select a scenario to start.",
        variant: "destructive",
      });
      return;
    }
    
    try {
      // Find the scenario and its initial scene
      const scenario = scenarios.find(s => s.id === selectedScenario);
      if (!scenario || !scenario.scenes || scenario.scenes.length === 0) {
        throw new Error("Invalid scenario selected");
      }
      
      const initialScene = scenario.scenes[0].id;
      
      // Update the classroom with the new active scenario
      await startClassroomScenario(classroom.id, selectedScenario, initialScene);
      
      // Send a message to the class
      const scenarioMessage = {
        text: `New activity started: "${scenario.title}". Join now!`,
        sentAt: new Date(),
        sender: 'teacher'
      };
      
      await addClassroomMessage(classroom.id, scenarioMessage);
      
      // Update the local state
      setMessages([scenarioMessage, ...messages]);
      
      toast({
        title: "Activity Started",
        description: `"${scenario.title}" is now active for your students.`,
      });
      
      // Optional: Teacher can also start playing the scenario
      const startNow = window.confirm("Do you want to preview the activity now?");
      if (startNow) {
        setClassroomId(classroom.id);
        startScenario(selectedScenario);
        navigate('/game');
      } else {
        // Refresh classroom data
        onRefresh();
      }
    } catch (error) {
      console.error('Error starting scenario:', error);
      toast({
        title: "Error",
        description: "Failed to start the activity. Please try again.",
        variant: "destructive",
      });
    }
  };
  
  const getStudentProgressStatus = (studentId: string) => {
    if (!studentProgress || studentProgress.length === 0) return "Not Started";
    
    const progress = studentProgress.find(p => p.studentId === studentId);
    if (!progress) return "Not Started";
    
    return "Completed";
  };
  
  return (
    <div className="space-y-6">
      <div>
        <h3 className="font-medium mb-3 text-white">Classroom Information</h3>
        <div className="bg-black/20 rounded-lg p-4 border border-white/10">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <p className="text-white/70 text-sm">Share this code with your students:</p>
              <div className="flex items-center gap-2 mt-1">
                <code className="bg-black/40 px-3 py-1 rounded text-primary font-mono">
                  {classroom.classCode}
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
            
            <div>
              <Badge className="bg-green-500/20 text-green-300 border-0">
                <div className="flex items-center gap-1">
                  <div className="relative">
                    <div className="absolute h-2 w-2 rounded-full bg-green-400 animate-ping"></div>
                    <div className="relative h-2 w-2 rounded-full bg-green-400"></div>
                  </div>
                  Active
                </div>
              </Badge>
            </div>
          </div>
        </div>
      </div>
      
      <Tabs defaultValue="students">
        <TabsList className="w-full grid grid-cols-3 bg-black/20 border-white/10 p-1">
          <TabsTrigger value="students" className="data-[state=active]:bg-primary/20">
            Students
          </TabsTrigger>
          <TabsTrigger value="scenarios" className="data-[state=active]:bg-primary/20">
            Activities
          </TabsTrigger>
          <TabsTrigger value="discussion" className="data-[state=active]:bg-primary/20">
            Discussion
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="students" className="mt-4">
          <div className="flex justify-between items-center mb-3">
            <h3 className="font-medium text-white flex items-center gap-1">
              <Users className="h-4 w-4 text-primary" />
              Students ({classroom.students?.length || 0})
            </h3>
            <Button variant="outline" size="sm" className="border-white/20 bg-black/20 text-white hover:bg-white/10">
              <UserPlus className="mr-1 h-4 w-4" />
              Invite
            </Button>
          </div>
          
          {classroom.students?.length > 0 ? (
            <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
              {(classroom.students || []).map((student: ClassroomStudent, i: number) => (
                <div 
                  key={student.id || i} 
                  className="bg-black/20 rounded-lg p-3 flex items-center justify-between"
                >
                  <div className="flex items-center gap-2">
                    <Avatar className="h-8 w-8 border border-white/20">
                      <AvatarFallback className="bg-primary/20 text-white">
                        {student.name?.charAt(0) || 'S'}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="text-white">{student.name || `Student ${i + 1}`}</div>
                      <div className="text-xs text-white/60">Joined: {student.joinedAt ? new Date((student.joinedAt as any).seconds * 1000).toLocaleDateString() : 'Recently'}</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-1">
                    <Badge className={`${
                      getStudentProgressStatus(student.id) === 'Completed' ? 'bg-green-500/20 text-green-300' :
                      classroom.activeScenario ? 'bg-blue-500/20 text-blue-300' : 
                      'bg-orange-500/20 text-orange-300'
                    } border-0`}>
                      {getStudentProgressStatus(student.id) === 'Completed' ? 'Completed' :
                       classroom.activeScenario ? 'Activity Available' : 'No Activity'}
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
                            Are you sure you want to remove this student from your classroom?
                            They will no longer have access to classroom activities.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel className="bg-transparent border border-white/10 text-white hover:bg-white/10">
                            Cancel
                          </AlertDialogCancel>
                          <AlertDialogAction 
                            onClick={() => handleRemoveStudent(student.id)}
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
        </TabsContent>
        
        <TabsContent value="scenarios" className="mt-4">
          <div className="bg-black/20 rounded-lg p-4 border border-white/10 mb-4">
            <h3 className="font-medium mb-3 text-white flex items-center gap-1">
              <Book className="h-4 w-4 text-primary" />
              Start an Activity
            </h3>
            
            <div className="space-y-3">
              <div>
                <label className="text-sm text-white/70 mb-1 block">Select a Scenario</label>
                <Select value={selectedScenario || ''} onValueChange={setSelectedScenario}>
                  <SelectTrigger className="bg-black/30 border-white/20 text-white">
                    <SelectValue placeholder="Choose a scenario" />
                  </SelectTrigger>
                  <SelectContent className="bg-black/90 border-white/10 text-white">
                    {scenarios.map(scenario => (
                      <SelectItem key={scenario.id} value={scenario.id}>
                        {scenario.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <Button 
                className="w-full bg-primary hover:bg-primary/90"
                onClick={handleStartScenario}
                disabled={!selectedScenario}
              >
                <Play className="mr-2 h-4 w-4" />
                Start Activity for Class
              </Button>
              
              <p className="text-xs text-white/60 text-center">
                This will make the activity available to all students in your classroom.
              </p>
            </div>
          </div>
          
          <div className="bg-black/20 rounded-lg p-4 border border-white/10">
            <h3 className="font-medium mb-3 text-white">Current Status</h3>
            
            {classroom.activeScenario ? (
              <div className="bg-black/30 rounded-lg p-3 border border-green-500/30">
                <div className="flex justify-between items-start">
                  <h4 className="text-white font-medium">
                    {scenarios.find(s => s.id === classroom.activeScenario)?.title || "Active Scenario"}
                  </h4>
                  <Badge className="bg-green-500/20 text-green-300 border-0">Active</Badge>
                </div>
                <p className="text-sm text-white/70 mt-1">
                  {scenarios.find(s => s.id === classroom.activeScenario)?.description || "Students can join this activity now."}
                </p>
                <div className="mt-3">
                  <Button
                    variant="outline"
                    size="sm" 
                    className="border-white/20 bg-black/20 text-white hover:bg-white/10"
                    onClick={() => {
                      setClassroomId(classroom.id);
                      startScenario(classroom.activeScenario!);
                      navigate('/game');
                    }}
                  >
                    <Play className="mr-1 h-4 w-4" />
                    Preview
                  </Button>
                </div>
              </div>
            ) : (
              <div className="text-center text-white/70 py-3">
                No active scenario. Start one for your students!
              </div>
            )}
          </div>
        </TabsContent>
        
        <TabsContent value="discussion" className="mt-4">
          <div className="bg-black/20 rounded-lg p-4 border border-white/10">
            <h3 className="font-medium mb-3 text-white flex items-center gap-1">
              <MessageSquare className="h-4 w-4 text-primary" />
              Class Announcement
            </h3>
            
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
              >
                <SendHorizontal className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="mt-4 pt-4 border-t border-white/10 max-h-[200px] overflow-y-auto">
              {messages && messages.length > 0 ? (
                <div className="space-y-3">
                  {messages.map((msg, index) => (
                    <div key={index} className="bg-black/20 rounded-md p-3">
                      <div className="text-white">{msg.text}</div>
                      <div className="text-xs text-white/50 mt-1">
                        {msg.sentAt ? new Date(msg.sentAt instanceof Date ? msg.sentAt : msg.sentAt.seconds * 1000).toLocaleString() : 'Just now'}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-sm text-white/70 text-center">
                  No messages yet. Send your first announcement!
                </div>
              )}
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default TeacherClassroomManager;
