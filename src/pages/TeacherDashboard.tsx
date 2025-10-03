import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useGameContext } from '@/context/GameContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Users, Play, Pause, StopCircle, Trash2, SkipForward, Copy } from 'lucide-react';
import { 
  createClassroomSession, 
  getTeacherClassrooms,
  deleteClassroomSession,
  onClassroomSessionUpdate,
  onClassroomParticipantsUpdate,
  getClassroomParticipants,
  startClassroomScenario,
  advanceClassroomScene,
  updateClassroomStatus,
  endClassroomSession,
  removeStudentFromClassroom,
  onClassroomVotesUpdate,
  getSceneVotes
} from '@/lib/classroomFirebase';
import { ClassroomSession, ClassroomParticipant, ClassroomVote, VoteStats } from '@/types/game';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const TeacherDashboard = () => {
  const { currentUser, userProfile } = useAuth();
  const { scenarios } = useGameContext();
  const { toast } = useToast();
  const navigate = useNavigate();

  const [classrooms, setClassrooms] = useState<ClassroomSession[]>([]);
  const [sessionName, setSessionName] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedSession, setSelectedSession] = useState<ClassroomSession | null>(null);
  const [participants, setParticipants] = useState<ClassroomParticipant[]>([]);
  const [votes, setVotes] = useState<ClassroomVote[]>([]);
  const [showControlPanel, setShowControlPanel] = useState(false);

  useEffect(() => {
    if (!currentUser || userProfile?.role !== 'teacher') {
      navigate('/');
      return;
    }
    loadClassrooms();
  }, [currentUser, userProfile]);

  useEffect(() => {
    if (selectedSession) {
      const unsubSession = onClassroomSessionUpdate(selectedSession.id, (updated) => {
        if (updated) {
          setSelectedSession(updated);
        }
      });

      const unsubParticipants = onClassroomParticipantsUpdate(selectedSession.id, setParticipants);

      let unsubVotes: (() => void) | null = null;
      if (selectedSession.currentSceneId) {
        unsubVotes = onClassroomVotesUpdate(
          selectedSession.id,
          selectedSession.currentSceneId,
          setVotes
        );
      }

      return () => {
        unsubSession();
        unsubParticipants();
        unsubVotes?.();
      };
    }
  }, [selectedSession?.id, selectedSession?.currentSceneId]);

  const loadClassrooms = async () => {
    if (!currentUser) return;
    try {
      const sessions = await getTeacherClassrooms(currentUser.uid);
      // Ensure participants is always an array
      const sessionsWithDefaults = sessions.map(session => ({
        ...session,
        participants: session.participants || []
      }));
      setClassrooms(sessionsWithDefaults.sort((a, b) => b.createdAt - a.createdAt));
    } catch (error) {
      console.error('Error loading classrooms:', error);
    }
  };

  const handleCreateSession = async () => {
    if (!currentUser || !userProfile || !sessionName.trim()) return;
    
    setLoading(true);
    try {
      const session = await createClassroomSession(
        currentUser.uid,
        userProfile.username || currentUser.email || 'Teacher',
        sessionName
      );
      
      toast({
        title: 'Session Created',
        description: `Join code: ${session.code}`,
      });
      
      setSessionName('');
      await loadClassrooms();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to create session',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleStartScenario = async (scenarioId: string) => {
    if (!selectedSession) return;
    
    const scenario = scenarios.find(s => s.id === scenarioId);
    if (!scenario || !scenario.scenes[0]) return;

    try {
      await startClassroomScenario(
        selectedSession.id,
        scenarioId,
        scenario.scenes[0].id
      );
      
      toast({
        title: 'Scenario Started',
        description: scenario.title,
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to start scenario',
        variant: 'destructive',
      });
    }
  };

  const handleAdvanceScene = async () => {
    if (!selectedSession || !selectedSession.scenarioId || !selectedSession.currentSceneId) return;

    const scenario = scenarios.find(s => s.id === selectedSession.scenarioId);
    if (!scenario) return;

    const currentScene = scenario.scenes.find(s => s.id === selectedSession.currentSceneId);
    if (!currentScene) return;

    // Determine next scene based on majority vote
    const voteStats = calculateVoteStats();
    const winningChoice = voteStats.sort((a, b) => b.count - a.count)[0];
    
    if (!winningChoice) {
      toast({
        title: 'No Votes',
        description: 'Wait for students to vote',
        variant: 'destructive',
      });
      return;
    }

    const choice = currentScene.choices.find(c => c.id === winningChoice.choiceId);
    if (!choice) return;

    try {
      await advanceClassroomScene(selectedSession.id, choice.nextSceneId);
      
      toast({
        title: 'Scene Advanced',
        description: 'Moving to next act',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to advance scene',
        variant: 'destructive',
      });
    }
  };

  const handlePauseResume = async () => {
    if (!selectedSession) return;
    
    const newStatus = selectedSession.status === 'active' ? 'paused' : 'active';
    try {
      await updateClassroomStatus(selectedSession.id, newStatus);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update status',
        variant: 'destructive',
      });
    }
  };

  const handleEndSession = async (sessionId: string) => {
    try {
      await endClassroomSession(sessionId);
      toast({
        title: 'Session Ended',
      });
      setSelectedSession(null);
      await loadClassrooms();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to end session',
        variant: 'destructive',
      });
    }
  };

  const handleDeleteSession = async (sessionId: string) => {
    try {
      await deleteClassroomSession(sessionId);
      toast({
        title: 'Session Deleted',
      });
      if (selectedSession?.id === sessionId) {
        setSelectedSession(null);
      }
      await loadClassrooms();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete session',
        variant: 'destructive',
      });
    }
  };

  const handleRemoveStudent = async (userId: string) => {
    if (!selectedSession) return;
    
    try {
      await removeStudentFromClassroom(selectedSession.id, userId);
      toast({
        title: 'Student Removed',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to remove student',
        variant: 'destructive',
      });
    }
  };

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    toast({
      title: 'Code Copied',
      description: code,
    });
  };

  const calculateVoteStats = (): VoteStats[] => {
    if (!selectedSession?.currentSceneId) return [];

    const scenario = scenarios.find(s => s.id === selectedSession.scenarioId);
    if (!scenario) return [];

    const currentScene = scenario.scenes.find(s => s.id === selectedSession.currentSceneId);
    if (!currentScene || !currentScene.choices) return [];

    const voteCounts: Record<string, { count: number; voters: string[] }> = {};
    
    currentScene.choices.forEach(choice => {
      voteCounts[choice.id] = { count: 0, voters: [] };
    });

    votes.forEach(vote => {
      if (voteCounts[vote.choiceId]) {
        voteCounts[vote.choiceId].count++;
        voteCounts[vote.choiceId].voters.push(vote.username);
      }
    });

    const totalVotes = votes.length;

    return Object.entries(voteCounts).map(([choiceId, data]) => ({
      choiceId,
      count: data.count,
      percentage: totalVotes > 0 ? (data.count / totalVotes) * 100 : 0,
      voters: data.voters,
    }));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-500';
      case 'paused': return 'bg-yellow-500';
      case 'ended': return 'bg-gray-500';
      default: return 'bg-blue-500';
    }
  };

  const getCurrentScene = () => {
    if (!selectedSession?.scenarioId || !selectedSession?.currentSceneId) return null;
    const scenario = scenarios.find(s => s.id === selectedSession.scenarioId);
    return scenario?.scenes.find(s => s.id === selectedSession.currentSceneId);
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Teacher Dashboard</h1>
          <p className="text-muted-foreground">Manage your classroom sessions</p>
        </div>

        {/* Create Session */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Create New Session</CardTitle>
            <CardDescription>Start a new classroom experience</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4">
              <Input
                placeholder="Session name (e.g., Period 3 - Decision Making)"
                value={sessionName}
                onChange={(e) => setSessionName(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleCreateSession()}
              />
              <Button onClick={handleCreateSession} disabled={loading || !sessionName.trim()}>
                Create Session
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Active Sessions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {classrooms.map((session) => (
            <Card key={session.id} className="relative">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      {session.name}
                      <Badge className={getStatusColor(session.status)}>
                        {session.status}
                      </Badge>
                    </CardTitle>
                    <div className="flex items-center gap-2 mt-3">
                      <div className="bg-primary/10 px-4 py-2 rounded-lg border-2 border-primary/20">
                        <span className="font-mono text-xl font-bold text-foreground tracking-wider">
                          {session.code}
                        </span>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => copyCode(session.code)}
                        className="h-10"
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSelectedSession(session);
                        getClassroomParticipants(session.id).then(setParticipants);
                        setShowControlPanel(true);
                      }}
                    >
                      <Users className="h-4 w-4 mr-1" />
                      Manage
                    </Button>
                    {session.status === 'ended' && (
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDeleteSession(session.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Users className="h-4 w-4" />
                  <span>{session.participants?.length || 0} participants</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Control Panel Dialog */}
        <Dialog open={showControlPanel} onOpenChange={setShowControlPanel}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {selectedSession?.name}
                <Badge className={`ml-2 ${getStatusColor(selectedSession?.status || '')}`}>
                  {selectedSession?.status}
                </Badge>
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-6">
              {/* Scenario Selection */}
              {!selectedSession?.scenarioId && (
                <Card>
                  <CardHeader>
                    <CardTitle>Start Scenario</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Select onValueChange={handleStartScenario}>
                      <SelectTrigger>
                        <SelectValue placeholder="Choose a scenario" />
                      </SelectTrigger>
                      <SelectContent>
                        {scenarios.map((scenario) => (
                          <SelectItem key={scenario.id} value={scenario.id}>
                            {scenario.title}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </CardContent>
                </Card>
              )}

              {/* Control Buttons */}
              {selectedSession?.scenarioId && (
                <Card>
                  <CardHeader>
                    <CardTitle>Controls</CardTitle>
                  </CardHeader>
                  <CardContent className="flex gap-2">
                    <Button
                      variant="outline"
                      onClick={handlePauseResume}
                    >
                      {selectedSession.status === 'active' ? (
                        <><Pause className="h-4 w-4 mr-2" /> Pause</>
                      ) : (
                        <><Play className="h-4 w-4 mr-2" /> Resume</>
                      )}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={handleAdvanceScene}
                      disabled={votes.length === 0}
                    >
                      <SkipForward className="h-4 w-4 mr-2" />
                      Next Scene
                    </Button>
                    <Button
                      variant="destructive"
                      onClick={() => selectedSession && handleEndSession(selectedSession.id)}
                    >
                      <StopCircle className="h-4 w-4 mr-2" />
                      End Session
                    </Button>
                  </CardContent>
                </Card>
              )}

              {/* Current Scene & Votes */}
              {getCurrentScene() && (
                <Card>
                  <CardHeader>
                    <CardTitle>Live Votes</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {calculateVoteStats().map((stat) => {
                        const currentScene = getCurrentScene();
                        const choice = currentScene?.choices?.find(c => c.id === stat.choiceId);
                        if (!choice) return null;
                        return (
                          <div key={stat.choiceId} className="border rounded-lg p-4">
                            <div className="flex justify-between mb-2">
                              <span className="font-medium">{choice.text}</span>
                              <span className="text-muted-foreground">
                                {stat.count} votes ({stat.percentage.toFixed(0)}%)
                              </span>
                            </div>
                            <div className="w-full bg-secondary rounded-full h-2">
                              <div
                                className="bg-primary h-2 rounded-full transition-all"
                                style={{ width: `${stat.percentage}%` }}
                              />
                            </div>
                            {stat.voters && stat.voters.length > 0 && (
                              <div className="mt-2 text-sm text-muted-foreground">
                                {stat.voters.join(', ')}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Participants */}
              <Card>
                <CardHeader>
                  <CardTitle>Participants ({participants.length})</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {participants.map((participant) => (
                      <div key={participant.id} className="flex justify-between items-center p-2 border rounded">
                        <span>{participant.username}</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveStudent(participant.userId)}
                        >
                          Remove
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default TeacherDashboard;
