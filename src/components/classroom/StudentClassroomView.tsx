
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Users, UserPlus, LogIn, ExternalLink, Loader2 } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useGameContext } from '@/context/GameContext';
import { getUserClassrooms, joinClassroomByCode, Classroom } from '@/lib/firebase';

const StudentClassroomView = () => {
  const [classCode, setClassCode] = useState('');
  const [isJoining, setIsJoining] = useState(false);
  const [classrooms, setClassrooms] = useState<Classroom[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { currentUser, userProfile } = useAuth();
  const { setGameMode, setClassroomId, userRole } = useGameContext();
  const { toast } = useToast();

  // Load user's classrooms on mount
  useEffect(() => {
    const loadClassrooms = async () => {
      if (!currentUser || userRole !== 'student') {
        setIsLoading(false);
        return;
      }

      try {
        const userClassrooms = await getUserClassrooms(currentUser.uid, 'student');
        console.log("Loaded student classrooms:", userClassrooms);
        setClassrooms(userClassrooms);
      } catch (error) {
        console.error("Error loading classrooms:", error);
        toast({
          title: "Error",
          description: "Failed to load your classrooms.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadClassrooms();
  }, [currentUser, userRole, toast]);

  // FIXED: Enhanced join classroom function with proper error handling
  const handleJoinClassroom = async () => {
    if (!classCode.trim()) {
      toast({
        title: "Class Code Required",
        description: "Please enter a valid class code.",
        variant: "destructive",
      });
      return;
    }

    if (!currentUser || !userProfile) {
      toast({
        title: "Authentication Required",
        description: "Please log in to join a classroom.",
        variant: "destructive",
      });
      return;
    }

    setIsJoining(true);
    try {
      console.log("Attempting to join classroom with code:", classCode);
      
      const classroom = await joinClassroomByCode(
        classCode.trim().toUpperCase(),
        currentUser.uid,
        userProfile.displayName || 'Student'
      );

      if (classroom) {
        console.log("Successfully joined classroom:", classroom);
        
        // Update local state
        setClassrooms(prev => {
          const exists = prev.some(c => c.id === classroom.id);
          return exists ? prev : [...prev, classroom];
        });
        
        setClassCode('');
        
        toast({
          title: "✅ Joined Classroom!",
          description: `Welcome to "${classroom.name}" taught by ${classroom.teacherName || 'Teacher'}`,
        });
      } else {
        throw new Error("Failed to join classroom");
      }
    } catch (error) {
      console.error("Error joining classroom:", error);
      
      // Enhanced error messages based on error type
      let errorMessage = "Failed to join classroom. Please check the code and try again.";
      
      if (error instanceof Error) {
        if (error.message.includes('Invalid')) {
          errorMessage = "Invalid classroom code. Please check and try again.";
        } else if (error.message.includes('permission')) {
          errorMessage = "You don't have permission to join this classroom.";
        } else if (error.message.includes('already')) {
          errorMessage = "You are already a member of this classroom.";
        }
      }
      
      toast({
        title: "Join Failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsJoining(false);
    }
  };

  const handleSelectClassroom = (classroom: Classroom) => {
    if (classroom.id) {
      setClassroomId(classroom.id);
      setGameMode("classroom");
      
      toast({
        title: "Classroom Selected",
        description: `Switched to "${classroom.name}" classroom mode.`,
      });
    }
  };

  if (!currentUser || userRole !== 'student') {
    return (
      <Card className="bg-black/20 border-white/10">
        <CardContent className="p-6 text-center">
          <Users className="h-12 w-12 text-white/30 mx-auto mb-4" />
          <p className="text-white/70">Please log in as a student to access classrooms.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Join Classroom Section - ALWAYS VISIBLE */}
      <Card className="bg-black/20 border-white/10">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <UserPlus className="h-5 w-5 text-blue-300" />
            Join a Classroom
          </CardTitle>
          <CardDescription className="text-white/70">
            Enter the class code provided by your teacher to join their classroom.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Input
              placeholder="Enter class code (e.g., LIFE-1234)"
              value={classCode}
              onChange={(e) => setClassCode(e.target.value.toUpperCase())}
              className="bg-black/20 border-white/20 text-white"
              onKeyPress={(e) => e.key === 'Enter' && handleJoinClassroom()}
              disabled={isJoining}
            />
            <Button 
              onClick={handleJoinClassroom} 
              disabled={isJoining || !classCode.trim()}
              className="bg-blue-500 hover:bg-blue-600 text-white"
            >
              {isJoining ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <LogIn className="h-4 w-4" />
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* My Classrooms Section */}
      <Card className="bg-black/20 border-white/10">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Users className="h-5 w-5 text-blue-300" />
            My Classrooms ({classrooms.length})
          </CardTitle>
          <CardDescription className="text-white/70">
            Classrooms you've joined will appear here.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-white/50" />
              <span className="ml-2 text-white/70">Loading classrooms...</span>
            </div>
          ) : classrooms.length > 0 ? (
            <div className="space-y-3">
              {classrooms.map((classroom) => (
                <div 
                  key={classroom.id} 
                  className="bg-black/20 rounded-lg p-4 border border-white/10 hover:border-blue-300/30 transition-all"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-white font-medium">{classroom.name}</h4>
                      <p className="text-white/60 text-sm">
                        Teacher: {classroom.teacherName || 'Unknown'}
                      </p>
                      <p className="text-white/50 text-xs">
                        Code: {classroom.classCode}
                      </p>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      {classroom.activeSessionId && (
                        <Badge className="bg-green-500/20 text-green-300 border-0">
                          Live Session
                        </Badge>
                      )}
                      
                      <Button 
                        size="sm" 
                        onClick={() => handleSelectClassroom(classroom)}
                        className="bg-blue-500 hover:bg-blue-600 text-white"
                      >
                        <ExternalLink className="h-4 w-4 mr-1" />
                        Enter
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Users className="h-12 w-12 text-white/30 mx-auto mb-4" />
              <h4 className="text-white font-medium mb-2">No Classrooms Yet</h4>
              <p className="text-white/70 text-sm">
                Use the join classroom feature above to get started.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default StudentClassroomView;
