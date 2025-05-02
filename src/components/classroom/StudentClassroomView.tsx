
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useGameContext } from '@/context/GameContext';
import { useToast } from '@/components/ui/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { School, Play, Users, Book, LogIn, ArrowRight, MessageSquare } from 'lucide-react';
import { getClassroomByCode, joinClassroom, onClassroomUpdated, getScenarioVotes } from '@/lib/firebase';
import { scenarios } from '@/data/scenarios';

interface StudentClassroomViewProps {
  onClassroomJoined?: (classroomId: string) => void;
}

interface ClassroomStudent {
  id: string;
  name: string;
  joinedAt: any;
}

const StudentClassroomView: React.FC<StudentClassroomViewProps> = ({ onClassroomJoined }) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { userProfile, currentUser } = useAuth();
  const { classroomId, setClassroomId, startScenario, gameMode, setGameMode } = useGameContext();
  
  const [classCode, setClassCode] = useState('');
  const [classroom, setClassroom] = useState<any>(null);
  const [activeScenario, setActiveScenario] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<any[]>([]);
  
  // Fetch classroom data if we already have an ID
  useEffect(() => {
    const fetchClassroom = async () => {
      if (!classroomId) return;
      
      try {
        setIsLoading(true);
        // Set up real-time listener for classroom updates
        const unsubscribe = onClassroomUpdated(classroomId, (classroom) => {
          setClassroom(classroom);
          
          // If classroom has an active scenario, fetch it
          if (classroom.activeScenario) {
            const scenario = scenarios.find(s => s.id === classroom.activeScenario);
            setActiveScenario(scenario || null);
          } else {
            setActiveScenario(null);
          }
        });
        
        // Clean up listener on unmount
        return () => unsubscribe();
      } catch (error) {
        console.error('Error fetching classroom:', error);
        toast({
          title: 'Error',
          description: 'Failed to load classroom data.',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchClassroom();
  }, [classroomId, toast]);
  
  const handleJoinClass = async () => {
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
    
    try {
      setIsLoading(true);
      
      // Validate class code
      const foundClassroom = await getClassroomByCode(classCode);
      
      if (!foundClassroom) {
        toast({
          title: "Invalid Class Code",
          description: "The class code you entered does not exist.",
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }
      
      // Join the classroom
      await joinClassroom(
        foundClassroom.id, 
        currentUser.uid, 
        userProfile?.displayName || 'Student'
      );
      
      // Update local state
      setClassroom(foundClassroom);
      setClassroomId(foundClassroom.id);
      setGameMode("classroom");
      
      if (onClassroomJoined) {
        onClassroomJoined(foundClassroom.id);
      }
      
      toast({
        title: "Joined Classroom",
        description: `You have joined ${foundClassroom.name}!`,
      });
      
      setClassCode('');
    } catch (error) {
      console.error('Error joining classroom:', error);
      toast({
        title: 'Error',
        description: 'Failed to join classroom.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleStartScenario = () => {
    if (classroom?.activeScenario) {
      navigate('/game');
      
      toast({
        title: "Joining Classroom Activity",
        description: "You're joining the current classroom activity.",
      });
    }
  };
  
  return (
    <div className="space-y-6">
      <Card className="bg-black/30 border-primary/20 overflow-hidden">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <School className="h-5 w-5 text-primary" />
              <CardTitle className="text-xl text-white">Classroom</CardTitle>
            </div>
            {classroom && (
              <Badge className="bg-green-500/20 text-green-300 border-0">
                Joined
              </Badge>
            )}
          </div>
          <CardDescription className="text-white/70">
            {classroom 
              ? "Participate in interactive learning activities" 
              : "Join a classroom to participate in interactive learning"}
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          {!classroom ? (
            <div className="bg-black/20 rounded-lg p-4 border border-white/10">
              <h3 className="font-medium mb-3 text-white">Join a Classroom</h3>
              <div className="flex gap-2">
                <Input 
                  placeholder="Enter class code" 
                  value={classCode}
                  onChange={(e) => setClassCode(e.target.value)}
                  className="bg-black/20 border-white/20 text-white"
                  disabled={isLoading}
                />
                <Button 
                  className="bg-primary hover:bg-primary/90"
                  onClick={handleJoinClass}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <div className="animate-spin h-5 w-5 border-2 border-white/20 border-t-white rounded-full"></div>
                  ) : (
                    <>
                      <LogIn className="mr-1 h-4 w-4" />
                      Join
                    </>
                  )}
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="bg-black/20 rounded-lg p-4 border border-white/10">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-lg font-medium text-white">{classroom.name}</h3>
                    <p className="text-sm text-white/70">
                      <Users className="h-3 w-3 inline mr-1" /> {classroom.students?.length || 0} students
                    </p>
                  </div>
                  
                  {classroom.activeScenario && (
                    <Button 
                      size="sm" 
                      className="bg-primary hover:bg-primary/90"
                      onClick={handleStartScenario}
                    >
                      <Play className="mr-1 h-4 w-4" />
                      Join Activity
                    </Button>
                  )}
                </div>
                
                <Separator className="my-3 bg-white/10" />
                
                {activeScenario ? (
                  <div>
                    <div className="flex items-center gap-2 text-white mb-2">
                      <Book className="h-4 w-4 text-primary" />
                      <span className="font-medium">Current Activity:</span> {activeScenario.title}
                    </div>
                    <p className="text-sm text-white/70">
                      {activeScenario.description}
                    </p>
                  </div>
                ) : (
                  <p className="text-white/70 text-center py-2">
                    No active scenario. Waiting for teacher to start an activity...
                  </p>
                )}
              </div>
              
              <div className="bg-black/20 rounded-lg p-4 border border-white/10">
                <h3 className="font-medium mb-3 text-white flex items-center gap-1">
                  <MessageSquare className="h-4 w-4 text-primary" />
                  Class Messages
                </h3>
                
                <div className="min-h-[120px] max-h-[200px] overflow-y-auto">
                  {messages.length > 0 ? (
                    <div className="space-y-2">
                      {messages.map((msg, i) => (
                        <div key={i} className="bg-black/30 rounded p-2">
                          <div className="flex items-center gap-1 text-primary/90 text-sm font-medium">
                            <span>Teacher</span>
                            <span className="text-white/50 text-xs">• {new Date(msg.timestamp).toLocaleTimeString()}</span>
                          </div>
                          <p className="text-white/90 mt-1">{msg.text}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <p className="text-white/50 text-sm">No messages yet</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default StudentClassroomView;
