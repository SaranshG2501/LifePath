import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useToast } from '@/components/ui/use-toast';
import { useGameContext } from '@/context/GameContext';
import { useAuth } from '@/context/AuthContext';
import { 
  Users, Copy, CheckCircle, PlusCircle, School, 
  User, UserPlus, CircleAlert, SendHorizontal,
  MessageSquare
} from 'lucide-react';

interface ClassroomManagementProps {
  isTeacher: boolean;
}

const ClassroomManagement: React.FC<ClassroomManagementProps> = ({ isTeacher }) => {
  const [classCode, setClassCode] = useState('');
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();
  const { classroomId, setClassroomId, gameMode, setGameMode } = useGameContext();
  const { currentUser } = useAuth();
  
  // For demo only - in a real app this would be generated on the backend
  const demoClassCode = 'LIFE-4325';
  
  // Generate a class code when a teacher creates a classroom
  const handleCreateClassroom = () => {
    if (!currentUser) {
      toast({
        title: "Login Required",
        description: "Please login to create a classroom.",
        variant: "destructive",
      });
      return;
    }
    
    // In a real app, this would send a request to the backend
    setClassroomId(demoClassCode);
    setGameMode("classroom");
    
    toast({
      title: "Classroom Created",
      description: "Your classroom has been created successfully.",
    });
  };
  
  const handleCopyCode = () => {
    navigator.clipboard.writeText(classroomId || demoClassCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    
    toast({
      title: "Class code copied",
      description: "Share this code with your students.",
    });
  };
  
  const handleJoinClass = () => {
    if (!currentUser) {
      toast({
        title: "Login Required", 
        description: "Please login to join a classroom.",
        variant: "destructive",
      });
      return;
    }
    
    if (!classCode) {
      toast({
        title: "Error",
        description: "Please enter a class code.",
        variant: "destructive",
      });
      return;
    }
    
    // In a real app, this would validate the class code
    setClassroomId(classCode);
    setGameMode("classroom");
    
    toast({
      title: "Joined classroom",
      description: "You've successfully joined the classroom.",
    });
    
    setClassCode('');
  };
  
  const handleSendMessage = () => {
    toast({
      title: "Message sent",
      description: "Your message has been sent to the class.",
    });
  };
  
  // Show classroom status indicator
  const renderClassroomStatus = () => {
    if (classroomId) {
      return (
        <div className="bg-black/20 rounded-lg p-4 border border-white/10">
          <h3 className="font-medium mb-2 text-white">Active Classroom</h3>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <p className="text-white/70 text-sm">Share this code with your students:</p>
              <div className="flex items-center gap-2 mt-1">
                <code className="bg-black/40 px-3 py-1 rounded text-primary font-mono">
                  {classroomId}
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
      );
    }
    
    // For teachers, show create classroom button
    if (isTeacher) {
      return (
        <div className="bg-black/20 rounded-lg p-4 border border-white/10">
          <h3 className="font-medium mb-3 text-white">Create a Classroom</h3>
          <Button 
            onClick={handleCreateClassroom}
            className="w-full bg-primary hover:bg-primary/90"
          >
            <PlusCircle className="mr-2 h-4 w-4" />
            Create Classroom
          </Button>
        </div>
      );
    }
    
    // For students, show join classroom form
    return (
      <div className="bg-black/20 rounded-lg p-4 border border-white/10">
        <h3 className="font-medium mb-3 text-white">Join a Classroom</h3>
        <div className="flex gap-2">
          <Input 
            placeholder="Enter class code" 
            value={classCode}
            onChange={(e) => setClassCode(e.target.value)}
            className="bg-black/20 border-white/20 text-white"
          />
          <Button 
            className="bg-primary hover:bg-primary/90"
            onClick={handleJoinClass}
          >
            Join
          </Button>
        </div>
      </div>
    );
  };
  
  return (
    <Card className="w-full bg-black/30 border-primary/20 backdrop-blur-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-white">
          {isTeacher ? (
            <>
              <School className="h-5 w-5 text-primary" />
              Classroom Management
            </>
          ) : (
            <>
              <Users className="h-5 w-5 text-primary" />
              My Classrooms
            </>
          )}
        </CardTitle>
        <CardDescription className="text-white/70">
          {isTeacher 
            ? "Create and manage your virtual classrooms" 
            : "Join and participate in classroom activities"}
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        {isTeacher ? (
          <div className="space-y-6">
            {renderClassroomStatus()}
            
            {classroomId && (
              <Tabs defaultValue="students">
                <TabsList className="w-full grid grid-cols-3 bg-black/20 border-white/10 p-1">
                  <TabsTrigger value="students" className="data-[state=active]:bg-primary/20">
                    Students
                  </TabsTrigger>
                  <TabsTrigger value="scenarios" className="data-[state=active]:bg-primary/20">
                    Scenarios
                  </TabsTrigger>
                  <TabsTrigger value="discussion" className="data-[state=active]:bg-primary/20">
                    Discussion
                  </TabsTrigger>
                </TabsList>
                
                <TabsContent value="students" className="mt-4">
                  <div className="flex justify-between items-center mb-3">
                    <h3 className="font-medium text-white">Enrolled Students (18)</h3>
                    <Button variant="outline" size="sm" className="border-white/20 bg-black/20 text-white hover:bg-white/10">
                      <UserPlus className="mr-1 h-4 w-4" />
                      Add
                    </Button>
                  </div>
                  
                  <div className="space-y-2">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <div 
                        key={i} 
                        className="bg-black/20 rounded-lg p-3 flex items-center justify-between"
                      >
                        <div className="flex items-center gap-2">
                          <Avatar className="h-8 w-8 border border-white/20">
                            <AvatarFallback className="bg-primary/20 text-white">
                              {['A', 'B', 'C', 'D', 'E'][i]}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="text-white">Student {i + 1}</div>
                            <div className="text-xs text-white/60">Last active: Today</div>
                          </div>
                        </div>
                        <Badge className="bg-primary/20 text-primary/90 border-0">
                          {['Active', 'Completed', 'Started', 'Active', 'Not Started'][i]}
                        </Badge>
                      </div>
                    ))}
                    
                    <div className="text-center text-white/60 text-sm pt-2">
                      <Button variant="ghost" size="sm" className="text-primary">
                        View all students
                      </Button>
                    </div>
                  </div>
                </TabsContent>
                
                <TabsContent value="scenarios" className="mt-4">
                  <div className="flex justify-between items-center mb-3">
                    <h3 className="font-medium text-white">Classroom Scenarios</h3>
                    <Button variant="outline" size="sm" className="border-white/20 bg-black/20 text-white hover:bg-white/10">
                      <PlusCircle className="mr-1 h-4 w-4" />
                      Assign
                    </Button>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="bg-black/30 rounded-lg p-3 border border-green-500/30">
                      <div className="flex justify-between items-start">
                        <h4 className="text-white font-medium">College Choice</h4>
                        <Badge className="bg-green-500/20 text-green-300 border-0">Active</Badge>
                      </div>
                      <p className="text-sm text-white/70 mt-1">Deciding between different college options</p>
                      <div className="flex justify-between items-center mt-3">
                        <div className="text-xs text-white/60">
                          14/18 students completed
                        </div>
                        <Button variant="ghost" size="sm" className="text-primary">
                          View Results
                        </Button>
                      </div>
                    </div>
                    
                    <div className="bg-black/20 rounded-lg p-3 border border-white/10">
                      <div className="flex justify-between items-start">
                        <h4 className="text-white font-medium">Climate Council</h4>
                        <Badge className="bg-blue-500/20 text-blue-300 border-0">Upcoming</Badge>
                      </div>
                      <p className="text-sm text-white/70 mt-1">Environmental decision-making exercise</p>
                      <div className="flex justify-between items-center mt-3">
                        <div className="text-xs text-white/60">
                          Scheduled for next week
                        </div>
                        <Button variant="ghost" size="sm" className="text-primary">
                          Edit
                        </Button>
                      </div>
                    </div>
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
                    
                    <div className="mt-4 pt-4 border-t border-white/10">
                      <div className="text-sm text-white/70">
                        Recent messages will appear here
                      </div>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            )}
          </div>
        ) : (
          <div className="space-y-6">
            {renderClassroomStatus()}
            
            {classroomId && (
              <div>
                <h3 className="font-medium mb-3 text-white">Your Classrooms</h3>
                <div className="space-y-3">
                  <div className="bg-black/30 rounded-lg p-3 border border-green-500/30">
                    <div className="flex justify-between items-start">
                      <h4 className="text-white font-medium">Psychology 101</h4>
                      <Badge className="bg-green-500/20 text-green-300 border-0">Active</Badge>
                    </div>
                    <p className="text-sm text-white/70 mt-1">Teacher: Ms. Johnson</p>
                    <div className="flex justify-between items-center mt-3">
                      <div className="text-xs text-white/60">
                        Current scenario: College Choice
                      </div>
                      <Button variant="ghost" size="sm" className="text-primary">
                        Enter
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
      
      <CardFooter>
        <div className="w-full text-center text-white/60 text-sm flex items-center justify-center gap-1 pt-2">
          <CircleAlert className="h-4 w-4 text-primary" />
          {isTeacher 
            ? "Students will see your assigned scenarios in their dashboard" 
            : "Your teacher will notify you when new scenarios are available"}
        </div>
      </CardFooter>
    </Card>
  );
};

export default ClassroomManagement;
