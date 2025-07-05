
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Users, 
  BookOpen, 
  Play, 
  Clock, 
  GraduationCap,
  Plus,
  Search,
  Wifi,
  Radio,
  Loader2,
  AlertTriangle
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useGameContext } from '@/context/GameContext';
import { useToast } from '@/hooks/use-toast';
import { 
  getUserClassrooms, 
  joinClassroomByCode, 
  Classroom,
  getActiveSession,
  LiveSession,
  joinLiveSession,
  onClassroomUpdated
} from '@/lib/firebase';
import { useNavigate } from 'react-router-dom';

const StudentClassroomView = () => {
  const { currentUser, userProfile } = useAuth();
  const { setClassroomId, setGameMode, startScenario, setCurrentScene } = useGameContext();
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const [classrooms, setClassrooms] = useState<Classroom[]>([]);
  const [loading, setLoading] = useState(true);
  const [joinCode, setJoinCode] = useState('');
  const [joining, setJoining] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeSessions, setActiveSessions] = useState<Record<string, LiveSession>>({});
  const [joiningSession, setJoiningSession] = useState<string | null>(null);
  const [removedFromClassrooms, setRemovedFromClassrooms] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (currentUser && userProfile?.role === 'student') {
      fetchClassrooms();
    }
  }, [currentUser, userProfile]);

  // Set up real-time listeners for each classroom with enhanced removal detection
  useEffect(() => {
    if (classrooms.length === 0) return;

    const unsubscribes: (() => void)[] = [];

    classrooms.forEach(classroom => {
      if (classroom.id) {
        const unsubscribe = onClassroomUpdated(classroom.id, async (updatedClassroom) => {
          // Check if student is still in the classroom
          const isStillMember = updatedClassroom.students?.some(student => 
            student.id === currentUser?.uid || student.userId === currentUser?.uid
          );
          
          if (!isStillMember && !removedFromClassrooms.has(classroom.id!)) {
            console.log("Student removed from classroom:", classroom.id);
            
            // Mark as removed to prevent duplicate notifications
            setRemovedFromClassrooms(prev => new Set(prev).add(classroom.id!));
            
            // Remove from local state
            setClassrooms(prev => prev.filter(c => c.id !== classroom.id));
            
            toast({
              title: "Removed from Classroom",
              description: `You have been removed from "${classroom.name}" by your teacher.`,
              variant: "destructive",
            });
            
            return;
          }
          
          // Update classroom in local state
          setClassrooms(prev => 
            prev.map(c => c.id === updatedClassroom.id ? updatedClassroom : c)
          );
          
          // Check for active session
          if (updatedClassroom.activeSessionId) {
            try {
              const activeSession = await getActiveSession(updatedClassroom.id!);
              if (activeSession) {
                setActiveSessions(prev => ({
                  ...prev,
                  [updatedClassroom.id!]: activeSession
                }));
              }
            } catch (error) {
              console.error("Error fetching active session:", error);
            }
          } else {
            setActiveSessions(prev => {
              const newSessions = { ...prev };
              delete newSessions[updatedClassroom.id!];
              return newSessions;
            });
          }
        });
        unsubscribes.push(unsubscribe);
      }
    });

    return () => {
      unsubscribes.forEach(unsubscribe => unsubscribe());
    };
  }, [classrooms.length, currentUser?.uid, removedFromClassrooms, toast]);

  const fetchClassrooms = async () => {
    if (!currentUser) return;
    
    try {
      setLoading(true);
      const userClassrooms = await getUserClassrooms(currentUser.uid, 'student');
      console.log("Fetched student classrooms:", userClassrooms);
      setClassrooms(userClassrooms);
      
      // Reset removed tracking when fetching fresh data
      setRemovedFromClassrooms(new Set());
    } catch (error) {
      console.error('Error fetching classrooms:', error);
      toast({
        title: "Error",
        description: "Failed to load your classrooms.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleJoinClassroom = async () => {
    if (!joinCode.trim()) {
      toast({
        title: "Class Code Required",
        description: "Please enter a valid class code.",
        variant: "destructive",
      });
      return;
    }

    if (!currentUser || !userProfile) {
      toast({
        title: "Login Required",
        description: "Please log in to join a classroom.",
        variant: "destructive",
      });
      return;
    }

    try {
      setJoining(true);
      
      const joinedClassroom = await joinClassroomByCode(
        joinCode.trim().toUpperCase(),
        currentUser.uid,
        userProfile.displayName || 'Student'
      );

      if (joinedClassroom) {
        toast({
          title: "Successfully Joined!",
          description: `Welcome to ${joinedClassroom.name}`,
        });
        
        setJoinCode('');
        await fetchClassrooms();
      }
    } catch (error) {
      console.error('Error joining classroom:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to join classroom. Please try again.",
        variant: "destructive",
      });
    } finally {
      setJoining(false);
    }
  };

  const handleJoinLiveSession = async (classroom: Classroom, session: LiveSession) => {
    if (!currentUser || !userProfile) return;

    setJoiningSession(session.id!);
    try {
      console.log("Joining live session smoothly:", session.id);
      
      // Set classroom context first
      setClassroomId(classroom.id!);
      setGameMode("classroom");
      
      // Join the session
      const sessionData = await joinLiveSession(session.id!, currentUser.uid, userProfile.displayName || 'Student');
      
      if (sessionData && sessionData.status === 'active') {
        // Start the scenario
        startScenario(sessionData.scenarioId);
        
        // Sync to current scene if teacher has progressed
        if (sessionData.currentSceneId) {
          setTimeout(() => {
            setCurrentScene(sessionData.currentSceneId);
          }, 500);
        }
        
        toast({
          title: "🎯 Joined Live Session!",
          description: `Successfully connected to "${session.scenarioTitle}"`,
        });
        
        navigate('/game');
      } else {
        throw new Error("Session is not active");
      }
    } catch (error) {
      console.error("Error joining live session:", error);
      toast({
        title: "Connection Failed",
        description: "Failed to join the live session. Please try again.",
        variant: "destructive",
      });
    } finally {
      setJoiningSession(null);
    }
  };

  const filteredClassrooms = classrooms.filter(classroom =>
    classroom.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (classroom.teacherName && classroom.teacherName.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  if (!currentUser || !userProfile || userProfile.role !== 'student') {
    return null;
  }

  return (
    <div className="space-y-6">
      {/* Join Classroom Section */}
      <Card className="bg-black/30 border-primary/20">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Plus className="h-5 w-5 text-primary" />
            Join a New Classroom
          </CardTitle>
          <CardDescription className="text-white/70">
            Enter the class code provided by your teacher
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Input
              placeholder="Enter class code (e.g., LIFE-1234)"
              value={joinCode}
              onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
              className="bg-black/40 border-white/20 text-white"
              disabled={joining}
            />
            <Button 
              onClick={handleJoinClassroom}
              disabled={joining || !joinCode.trim()}
              className="bg-primary hover:bg-primary/90 min-w-[80px]"
            >
              {joining ? "Joining..." : "Join"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* My Classrooms Section */}
      <Card className="bg-black/30 border-primary/20">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-white flex items-center gap-2">
              <GraduationCap className="h-5 w-5 text-primary" />
              My Classrooms ({classrooms.length})
            </CardTitle>
            <Button 
              variant="outline" 
              size="sm"
              onClick={fetchClassrooms}
              disabled={loading}
              className="border-white/20 bg-black/20 text-white hover:bg-white/10"
            >
              {loading ? "Loading..." : "Refresh"}
            </Button>
          </div>
          
          {classrooms.length > 0 && (
            <div className="relative mt-2">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-white/50" />
              <Input
                placeholder="Search classrooms or teachers..."
                className="pl-8 bg-black/20 border-white/20 text-white"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          )}
        </CardHeader>
        
        <CardContent>
          {loading ? (
            <div className="text-center py-8">
              <div className="text-white/70">Loading your classrooms...</div>
            </div>
          ) : filteredClassrooms.length > 0 ? (
            <ScrollArea className="h-[400px] pr-4">
              <div className="space-y-4">
                {filteredClassrooms.map((classroom) => {
                  const activeSession = activeSessions[classroom.id!];
                  const isJoining = joiningSession === activeSession?.id;
                  
                  return (
                    <div key={classroom.id} className="bg-black/20 rounded-lg p-4 border border-white/10">
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex-1">
                          <h3 className="text-white font-medium text-lg">{classroom.name}</h3>
                          <p className="text-white/70 text-sm">
                            Teacher: {classroom.teacherName || 'Unknown'}
                          </p>
                          {classroom.description && (
                            <p className="text-white/60 text-sm mt-1">{classroom.description}</p>
                          )}
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <Badge className="bg-blue-500/20 text-blue-300 border-0">
                            {classroom.students?.length || 0} students
                          </Badge>
                          
                          {activeSession && (
                            <Badge className="bg-green-500/20 text-green-300 border-0">
                              <Wifi className="h-3 w-3 mr-1" />
                              Live
                            </Badge>
                          )}
                        </div>
                      </div>
                      
                      <Separator className="bg-white/10 my-3" />
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4 text-sm text-white/70">
                          <div className="flex items-center gap-1">
                            <Users className="h-4 w-4" />
                            <span>{classroom.students?.length || 0} students</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            <span>
                              Joined {classroom.createdAt ? 
                                new Date((classroom.createdAt as any).seconds * 1000).toLocaleDateString() : 
                                'recently'
                              }
                            </span>
                          </div>
                        </div>
                        
                        {activeSession ? (
                          <Button 
                            size="sm"
                            onClick={() => handleJoinLiveSession(classroom, activeSession)}
                            disabled={isJoining}
                            className="bg-green-500 hover:bg-green-600 text-white"
                          >
                            {isJoining ? (
                              <>
                                <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                                Joining...
                              </>
                            ) : (
                              <>
                                <Radio className="h-4 w-4 mr-1" />
                                Join Live Session
                              </>
                            )}
                          </Button>
                        ) : (
                          <Button 
                            variant="outline" 
                            size="sm"
                            disabled
                            className="border-white/20 bg-black/20 text-white/50"
                          >
                            <Play className="h-4 w-4 mr-1" />
                            No Active Session
                          </Button>
                        )}
                      </div>
                      
                      {activeSession && (
                        <div className="mt-3 p-3 bg-green-500/10 rounded-md border border-green-500/20">
                          <div className="flex items-center gap-2 text-green-300">
                            <Radio className="h-4 w-4" />
                            <span className="font-medium">Live Session Active</span>
                          </div>
                          <div className="text-green-200 text-sm mt-1">
                            Scenario: {activeSession.scenarioTitle}
                          </div>
                          <div className="text-green-200/70 text-xs mt-1">
                            {activeSession.participants.length} students participating
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </ScrollArea>
          ) : searchTerm ? (
            <div className="text-center py-8">
              <Search className="h-12 w-12 text-white/30 mx-auto mb-2" />
              <div className="text-white/70">No classrooms match your search</div>
            </div>
          ) : (
            <div className="text-center py-8">
              <BookOpen className="h-12 w-12 text-white/30 mx-auto mb-2" />
              <div className="text-white/70 mb-2">You haven't joined any classrooms yet</div>
              <div className="text-white/50 text-sm">Use the class code from your teacher to join your first classroom</div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default StudentClassroomView;
