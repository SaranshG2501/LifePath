
/* eslint-disable @typescript-eslint/no-explicit-any */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useGameContext } from '@/context/GameContext';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { School, Play, Users, Book, LogIn, ArrowRight, MessageSquare, Loader2, Activity } from 'lucide-react';
import { getClassroomByCode, joinClassroom, getUserClassrooms, getActiveSession, Classroom } from '@/lib/firebase';
import { scenarios } from '@/data/scenarios';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';

interface StudentClassroomViewProps {
  onClassroomJoined?: (classroomId: string) => void;
}

const StudentClassroomView: React.FC<StudentClassroomViewProps> = ({ onClassroomJoined }) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { userProfile, currentUser, refreshUserProfile } = useAuth();
  const { setClassroomId, startScenario, setGameMode } = useGameContext();
  
  const [classCode, setClassCode] = useState('');
  const [myClassrooms, setMyClassrooms] = useState<Classroom[]>([]);
  const [activeScenarios, setActiveScenarios] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isJoinDialogOpen, setIsJoinDialogOpen] = useState(false);
  const [joinError, setJoinError] = useState('');
  const [classroomToJoin, setClassroomToJoin] = useState<any>(null);
  
  // Fetch user's classrooms and active scenarios
  useEffect(() => {
    const fetchUserClassrooms = async () => {
      if (!currentUser) return;
      
      try {
        setIsLoading(true);
        console.log("Fetching student classrooms for:", currentUser.uid);
        
        const classrooms = await getUserClassrooms(currentUser.uid, 'student');
        console.log("Student classrooms:", classrooms);
        setMyClassrooms(classrooms);
        
        // Check for active scenarios in each classroom
        const activeScenariosList = [];
        for (const classroom of classrooms) {
          if (classroom.id) {
            const activeSession = await getActiveSession(classroom.id);
            if (activeSession) {
              const scenario = scenarios.find(s => s.id === activeSession.scenarioId);
              if (scenario) {
                activeScenariosList.push({
                  ...activeSession,
                  classroom,
                  scenario
                });
              }
            }
          }
        }
        setActiveScenarios(activeScenariosList);
      } catch (error) {
        console.error('Error fetching student classrooms:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchUserClassrooms();
  }, [currentUser]);
  
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
      
      const foundClassroom = await getClassroomByCode(classCode);
      console.log("Found classroom:", foundClassroom);
      
      if (!foundClassroom) {
        setJoinError("The class code you entered does not exist.");
        setIsJoinDialogOpen(true);
        return;
      }
      
      // Check if already joined
      const isAlreadyJoined = myClassrooms.some(c => c.id === foundClassroom.id);
      if (isAlreadyJoined) {
        setJoinError("You are already a member of this classroom.");
        setIsJoinDialogOpen(true);
        return;
      }
      
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
      
      const displayName = userProfile?.displayName || currentUser.email?.split('@')[0] || 'Student';
      console.log("Joining as:", displayName);
      
      const joinedClassroom = await joinClassroom(
        classroomToJoin.id, 
        currentUser.uid, 
        displayName
      );
      
      console.log("Joined classroom:", joinedClassroom);
      
      if (joinedClassroom && joinedClassroom.id) {
        // Update local state
        setMyClassrooms(prev => [...prev, joinedClassroom]);
        
        // Refresh user profile
        if (refreshUserProfile) {
          await refreshUserProfile();
        }
        
        if (onClassroomJoined) {
          onClassroomJoined(joinedClassroom.id);
        }
        
        toast({
          title: "Joined Classroom",
          description: `You have joined ${joinedClassroom.name}!`,
        });
        
        setClassCode('');
        setIsJoinDialogOpen(false);
        setClassroomToJoin(null);
      } else {
        throw new Error("Failed to join classroom");
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
  
  const handleJoinScenario = (activeScenario: any) => {
    setClassroomId(activeScenario.classroomId);
    setGameMode("classroom");
    startScenario(activeScenario.scenarioId);
    navigate('/game');
    
    toast({
      title: "Joining Activity",
      description: `Joining "${activeScenario.scenario.title}" in ${activeScenario.classroom.name}`,
    });
  };
  
  return (
    <div className="space-y-6">
      {/* Join New Classroom Card */}
      <Card className="bg-gradient-to-br from-indigo-900/40 to-purple-900/40 border-white/10 backdrop-blur-md">
        <CardHeader>
          <CardTitle className="text-xl text-white flex items-center gap-2">
            <School className="h-5 w-5 text-blue-300" />
            Join Classroom
          </CardTitle>
          <CardDescription className="text-white/70">
            Enter a class code to join a new classroom
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Input 
              placeholder="Enter class code (e.g., LIFE-1234)" 
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
        </CardContent>
      </Card>

      {/* My Classrooms */}
      <Card className="bg-gradient-to-br from-green-900/40 to-teal-900/40 border-white/10 backdrop-blur-md">
        <CardHeader>
          <CardTitle className="text-xl text-white flex items-center gap-2">
            <Users className="h-5 w-5 text-green-300" />
            My Classrooms ({myClassrooms.length})
          </CardTitle>
          <CardDescription className="text-white/70">
            Classrooms you've joined
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-4">
              <Loader2 className="h-6 w-6 text-primary animate-spin" />
            </div>
          ) : myClassrooms.length > 0 ? (
            <div className="grid gap-3">
              {myClassrooms.map((classroom) => (
                <div 
                  key={classroom.id}
                  className="bg-black/30 rounded-lg p-4 border border-white/10"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-white font-medium">{classroom.name}</h3>
                      <p className="text-sm text-white/70">
                        <Users className="h-3 w-3 inline mr-1" />
                        {classroom.students?.length || 0} students
                      </p>
                      {classroom.description && (
                        <p className="text-xs text-white/60 mt-1">{classroom.description}</p>
                      )}
                    </div>
                    <Badge className="bg-green-500/20 text-green-300 border-0">
                      Member
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <School className="h-12 w-12 text-white/20 mx-auto mb-2" />
              <p className="text-white/70">No classrooms joined yet</p>
              <p className="text-white/50 text-sm">Enter a class code above to join your first classroom</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Active Scenarios */}
      <Card className="bg-gradient-to-br from-orange-900/40 to-red-900/40 border-white/10 backdrop-blur-md">
        <CardHeader>
          <CardTitle className="text-xl text-white flex items-center gap-2">
            <Activity className="h-5 w-5 text-orange-300" />
            Active Scenarios ({activeScenarios.length})
          </CardTitle>
          <CardDescription className="text-white/70">
            Join ongoing classroom activities
          </CardDescription>
        </CardHeader>
        <CardContent>
          {activeScenarios.length > 0 ? (
            <div className="grid gap-3">
              {activeScenarios.map((activeScenario) => (
                <div 
                  key={`${activeScenario.classroomId}-${activeScenario.scenarioId}`}
                  className="bg-black/30 rounded-lg p-4 border border-orange-500/20"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="text-white font-medium">{activeScenario.scenario.title}</h3>
                      <p className="text-sm text-white/70">
                        In {activeScenario.classroom.name}
                      </p>
                      <p className="text-xs text-white/60 mt-1">
                        {activeScenario.scenario.description}
                      </p>
                      <div className="flex items-center gap-2 mt-2">
                        <Badge className="bg-orange-500/20 text-orange-300 border-0">
                          Live
                        </Badge>
                        <span className="text-xs text-white/60">
                          {activeScenario.participants?.length || 0} participants
                        </span>
                      </div>
                    </div>
                    <Button 
                      size="sm" 
                      className="bg-orange-500 hover:bg-orange-600 text-white ml-4"
                      onClick={() => handleJoinScenario(activeScenario)}
                    >
                      <Play className="mr-1 h-4 w-4" />
                      Join
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Book className="h-12 w-12 text-white/20 mx-auto mb-2" />
              <p className="text-white/70">No active scenarios</p>
              <p className="text-white/50 text-sm">Your teachers will start activities here</p>
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* Join Classroom Dialog */}
      <AlertDialog open={isJoinDialogOpen} onOpenChange={setIsJoinDialogOpen}>
        <AlertDialogContent className="bg-gradient-to-br from-indigo-900/80 to-purple-900/80 border border-white/10 backdrop-blur-md">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-white">
              {joinError ? "Error" : "Join Classroom"}
            </AlertDialogTitle>
            <AlertDialogDescription className="text-white/70">
              {joinError || (
                classroomToJoin && `Join "${classroomToJoin.name}"?`
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel 
              className="bg-black/50 border-white/20 text-white hover:bg-black/30"
              onClick={() => {
                setJoinError('');
                setClassroomToJoin(null);
              }}
            >
              Cancel
            </AlertDialogCancel>
            {!joinError && (
              <AlertDialogAction
                onClick={handleJoinClass}
                className="bg-indigo-600 text-white hover:bg-indigo-700"
                disabled={isLoading}
              >
                {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Join"}
              </AlertDialogAction>
            )}
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default StudentClassroomView;
