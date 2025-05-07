
/* eslint-disable @typescript-eslint/no-explicit-any */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useGameContext } from '@/context/GameContext';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { School, Play, Users, Book, LogIn, ArrowRight, MessageSquare, Loader2 } from 'lucide-react';
import { getClassroomByCode, joinClassroom, onClassroomUpdated, getScenarioVotes, Classroom } from '@/lib/firebase';
import { scenarios } from '@/data/scenarios';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';

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
  const { userProfile, currentUser, refreshUserProfile } = useAuth();
  const { classroomId, setClassroomId, startScenario, gameMode, setGameMode } = useGameContext();
  
  const [classCode, setClassCode] = useState('');
  const [classroom, setClassroom] = useState<Classroom | null>(null);
  const [activeScenario, setActiveScenario] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<any[]>([]);
  const [isJoinDialogOpen, setIsJoinDialogOpen] = useState(false);
  const [joinError, setJoinError] = useState('');
  const [classroomToJoin, setClassroomToJoin] = useState<any>(null);
  
  // Fetch classroom data if we already have an ID
  useEffect(() => {
    const fetchClassroom = async () => {
      if (!classroomId) return;
      
      try {
        setIsLoading(true);
        console.log("Setting up classroom listener for:", classroomId);
        
        // Set up real-time listener for classroom updates
        const unsubscribe = onClassroomUpdated(classroomId, (classroom) => {
          console.log("Classroom updated:", classroom);
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
  
  const handleCheckClassCode = async () => {
    if (!currentUser) {
      toast({
        title: "Login Required",
        description: "Please login to join a classroom.",
        variant: "destructive",
      });
      navigate('/auth');
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
      setJoinError('');
      console.log("Checking classroom with code:", classCode);
      
      // Validate class code
      const foundClassroom = await getClassroomByCode(classCode);
      console.log("Found classroom:", foundClassroom);
      
      if (!foundClassroom) {
        setJoinError("The class code you entered does not exist.");
        setIsJoinDialogOpen(true);
        return;
      }
      
      // Store the classroom to join
      setClassroomToJoin(foundClassroom);
      setIsJoinDialogOpen(true);
    } catch (error) {
      console.error('Error checking classroom code:', error);
      setJoinError("Failed to verify class code. Please try again.");
      setIsJoinDialogOpen(true);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleJoinClass = async () => {
    if (!classroomToJoin || !currentUser) return;
    
    try {
      setIsLoading(true);
      setJoinError('');
      
      // Join the classroom with our new implementation
      const displayName = userProfile?.displayName || currentUser.email?.split('@')[0] || 'Student';
      console.log("Joining as:", displayName);
      
      const joinedClassroom = await joinClassroom(
        classroomToJoin.id, 
        currentUser.uid, 
        displayName
      );
      
      console.log("Joined classroom:", joinedClassroom);
      
      // Check if joinedClassroom is properly defined
      if (joinedClassroom && joinedClassroom.id) {
        // Update local state
        setClassroom(joinedClassroom);
        setClassroomId(joinedClassroom.id);
        setGameMode("classroom");
        
        // Refresh user profile to get updated classrooms list
        if (refreshUserProfile) {
          await refreshUserProfile();
        }
        
        // Trigger callback if provided
        if (onClassroomJoined) {
          onClassroomJoined(joinedClassroom.id);
        }
        
        toast({
          title: "Joined Classroom",
          description: `You have joined ${joinedClassroom.name}!`,
        });
        
        // Reset form
        setClassCode('');
        setIsJoinDialogOpen(false);
      } else {
        throw new Error("Failed to join classroom - incomplete response");
      }
    } catch (error: any) {
      console.error('Error joining classroom:', error);
      setJoinError(error.message || 'Failed to join classroom');
      toast({
        title: 'Error',
        description: error.message || 'Failed to join classroom. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleStartScenario = () => {
    if (classroom?.activeScenario) {
      startScenario(classroom.activeScenario);
      navigate('/game');
      
      toast({
        title: "Joining Classroom Activity",
        description: "You're joining the current classroom activity.",
      });
    }
  };
  
  return (
    <div className="space-y-6">
      <Card className="bg-gradient-to-br from-indigo-900/40 to-purple-900/40 border-white/10 backdrop-blur-md overflow-hidden shadow-lg">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <School className="h-5 w-5 text-blue-300" />
              <CardTitle className="text-xl text-white">Classroom</CardTitle>
            </div>
            {classroom && (
              <Badge className="bg-blue-500/30 text-blue-200 border-0">
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
            <div className="bg-black/30 rounded-lg p-4 border border-white/10">
              <h3 className="font-medium mb-3 text-white">Join a Classroom</h3>
              <div className="flex gap-2">
                <Input 
                  placeholder="Enter class code" 
                  value={classCode}
                  onChange={(e) => setClassCode(e.target.value.toUpperCase())}
                  className="bg-black/20 border-white/20 text-white"
                  disabled={isLoading}
                />
                <Button 
                  className="bg-blue-500 hover:bg-blue-600 text-white"
                  onClick={handleCheckClassCode}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
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
              <div className="bg-black/30 rounded-lg p-4 border border-white/10">
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
                      className="bg-blue-500 hover:bg-blue-600 text-white"
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
                      <Book className="h-4 w-4 text-blue-300" />
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
              
              <div className="bg-black/30 rounded-lg p-4 border border-white/10">
                <h3 className="font-medium mb-3 text-white flex items-center gap-1">
                  <MessageSquare className="h-4 w-4 text-blue-300" />
                  Class Messages
                </h3>
                
                <div className="min-h-[120px] max-h-[200px] overflow-y-auto">
                  {messages.length > 0 ? (
                    <div className="space-y-2">
                      {messages.map((msg, i) => (
                        <div key={i} className="bg-black/30 rounded p-2">
                          <div className="flex items-center gap-1 text-blue-300 text-sm font-medium">
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
      
      {/* Join Classroom Dialog */}
      <AlertDialog open={isJoinDialogOpen} onOpenChange={setIsJoinDialogOpen}>
        <AlertDialogContent className="bg-gradient-to-br from-indigo-900/80 to-purple-900/80 border border-white/10 backdrop-blur-md">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-white">
              {joinError ? "Classroom Not Found" : "Join Classroom"}
            </AlertDialogTitle>
            <AlertDialogDescription className="text-white/70">
              {joinError ? joinError : (
                classroomToJoin && `You're about to join "${classroomToJoin.name}" class. Continue?`
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel 
              className="bg-black/50 border-white/20 text-white hover:bg-black/30"
              onClick={() => setJoinError('')}
            >
              Cancel
            </AlertDialogCancel>
            {!joinError && (
              <AlertDialogAction
                onClick={handleJoinClass}
                className="bg-indigo-600 text-white hover:bg-indigo-700"
                disabled={isLoading}
              >
                {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Join Class"}
              </AlertDialogAction>
            )}
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default StudentClassroomView;
