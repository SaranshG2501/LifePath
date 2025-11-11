import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { getTeacherSessionHistory, getSessionParticipants, LiveSession, SessionParticipant, convertTimestampToDate, getClassroom } from '@/lib/firebase';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { History, Users, Calendar, Clock, BookOpen, ArrowLeft, ChevronRight } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

interface SessionWithDetails extends LiveSession {
  classroomName?: string;
  participantCount?: number;
}

const SessionHistoryPage = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [sessions, setSessions] = useState<SessionWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSession, setSelectedSession] = useState<SessionWithDetails | null>(null);
  const [participants, setParticipants] = useState<SessionParticipant[]>([]);
  const [loadingParticipants, setLoadingParticipants] = useState(false);

  useEffect(() => {
    if (!currentUser) {
      navigate('/auth');
      return;
    }
    loadSessionHistory();
  }, [currentUser]);

  const loadSessionHistory = async () => {
    if (!currentUser) return;
    
    try {
      setLoading(true);
      const sessionHistory = await getTeacherSessionHistory(currentUser.uid);
      
      // Enrich sessions with classroom names and participant counts
      const enrichedSessions = await Promise.all(
        sessionHistory.map(async (session) => {
          try {
            const classroom = await getClassroom(session.classroomId);
            return {
              ...session,
              classroomName: classroom?.name || 'Unknown Classroom',
              participantCount: session.participants?.length || 0
            };
          } catch (error) {
            console.error('Error fetching classroom:', error);
            return {
              ...session,
              classroomName: 'Unknown Classroom',
              participantCount: session.participants?.length || 0
            };
          }
        })
      );
      
      setSessions(enrichedSessions);
    } catch (error) {
      console.error('Error loading session history:', error);
      toast({
        title: "Error",
        description: "Failed to load session history. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = async (session: SessionWithDetails) => {
    setSelectedSession(session);
    setLoadingParticipants(true);
    
    try {
      if (session.id) {
        const sessionParticipants = await getSessionParticipants(session.id);
        setParticipants(sessionParticipants);
      }
    } catch (error) {
      console.error('Error loading participants:', error);
      toast({
        title: "Error",
        description: "Failed to load participant details.",
        variant: "destructive",
      });
    } finally {
      setLoadingParticipants(false);
    }
  };

  const formatDuration = (startedAt: any, endedAt: any) => {
    if (!startedAt || !endedAt) return 'N/A';
    
    const start = convertTimestampToDate(startedAt);
    const end = convertTimestampToDate(endedAt);
    const durationMs = end.getTime() - start.getTime();
    const minutes = Math.floor(durationMs / 60000);
    
    if (minutes < 1) return '< 1 min';
    if (minutes < 60) return `${minutes} min`;
    
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return `${hours}h ${remainingMinutes}m`;
  };

  return (
    <div className="container mx-auto px-3 py-6 sm:px-4 sm:py-8 animate-fade-in">
      {/* Header */}
      <div className="glass-card mb-8 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-secondary/10 to-transparent"></div>
        <div className="relative">
          <Button
            variant="ghost"
            onClick={() => navigate('/teacher')}
            className="mb-4 -ml-2 hover:bg-primary/10"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-3 rounded-lg bg-primary/10 border border-primary/20">
              <History className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold gradient-heading">Session History</h1>
              <p className="text-muted-foreground text-base mt-1">
                View past live sessions and student participation
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Sessions List */}
      {loading ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="teen-card animate-pulse">
              <CardHeader>
                <Skeleton className="h-6 w-3/4 mb-2" />
                <Skeleton className="h-4 w-1/2" />
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-2/3" />
                  <Skeleton className="h-10 w-full mt-4" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : sessions.length === 0 ? (
        <Card className="teen-card text-center py-12">
          <CardContent>
            <div className="flex flex-col items-center gap-4">
              <div className="p-4 rounded-full bg-primary/10 border border-primary/20">
                <History className="h-12 w-12 text-primary" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-foreground mb-2">No Session History</h3>
                <p className="text-muted-foreground">
                  You haven't conducted any live sessions yet.
                </p>
              </div>
              <Button onClick={() => navigate('/teacher')} className="mt-4">
                Start Your First Session
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {sessions.map((session) => (
            <Card key={session.id} className="teen-card hover-lift group">
              <CardHeader>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <CardTitle className="text-foreground text-xl font-bold group-hover:text-primary transition-colors flex items-center gap-2">
                      <BookOpen className="h-5 w-5 text-primary" />
                      {session.scenarioTitle}
                    </CardTitle>
                    <p className="text-muted-foreground text-sm mt-2">
                      {session.classroomName}
                    </p>
                  </div>
                  <Badge className="bg-primary/20 text-primary border border-primary/30">
                    Ended
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Stats */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="stat-badge flex-col items-start">
                      <div className="flex items-center gap-2 mb-1">
                        <Users className="h-4 w-4 text-primary" />
                        <span className="text-xs text-muted-foreground">Participants</span>
                      </div>
                      <span className="text-foreground font-bold text-lg">{session.participantCount || 0}</span>
                    </div>
                    <div className="stat-badge flex-col items-start">
                      <div className="flex items-center gap-2 mb-1">
                        <Clock className="h-4 w-4 text-secondary" />
                        <span className="text-xs text-muted-foreground">Duration</span>
                      </div>
                      <span className="text-foreground font-bold text-lg">
                        {formatDuration(session.startedAt, session.endedAt)}
                      </span>
                    </div>
                  </div>

                  {/* Date */}
                  <div className="p-3 rounded-lg bg-gradient-to-br from-primary/10 to-secondary/10 border border-primary/20">
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="h-4 w-4 text-primary" />
                      <span className="text-muted-foreground">Started:</span>
                      <span className="text-foreground font-medium">
                        {session.startedAt
                          ? convertTimestampToDate(session.startedAt).toLocaleString()
                          : 'Unknown'}
                      </span>
                    </div>
                  </div>

                  {/* Mirror Moments Badge */}
                  {session.mirrorMomentsEnabled && (
                    <Badge variant="outline" className="bg-accent/20 border-accent/30 text-accent">
                      Mirror Moments Enabled
                    </Badge>
                  )}

                  {/* View Details Button */}
                  <Button
                    variant="default"
                    className="w-full group/btn"
                    onClick={() => handleViewDetails(session)}
                  >
                    View Details
                    <ChevronRight className="h-4 w-4 ml-2 group-hover/btn:translate-x-1 transition-transform" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Participant Details Dialog */}
      <Dialog open={selectedSession !== null} onOpenChange={() => setSelectedSession(null)}>
        <DialogContent className="sm:max-w-[600px] bg-background/95 backdrop-blur-xl border border-primary/20">
          <DialogHeader>
            <DialogTitle className="text-2xl gradient-heading">
              {selectedSession?.scenarioTitle}
            </DialogTitle>
            <p className="text-muted-foreground text-sm">
              {selectedSession?.classroomName}
            </p>
          </DialogHeader>

          <div className="space-y-6 mt-4">
            {/* Session Info */}
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-lg bg-primary/10 border border-primary/20">
                <div className="flex items-center gap-2 mb-2">
                  <Calendar className="h-4 w-4 text-primary" />
                  <span className="text-xs text-muted-foreground">Started</span>
                </div>
                <p className="text-sm font-medium text-foreground">
                  {selectedSession?.startedAt
                    ? convertTimestampToDate(selectedSession.startedAt).toLocaleString()
                    : 'Unknown'}
                </p>
              </div>
              <div className="p-4 rounded-lg bg-secondary/10 border border-secondary/20">
                <div className="flex items-center gap-2 mb-2">
                  <Clock className="h-4 w-4 text-secondary" />
                  <span className="text-xs text-muted-foreground">Duration</span>
                </div>
                <p className="text-sm font-medium text-foreground">
                  {formatDuration(selectedSession?.startedAt, selectedSession?.endedAt)}
                </p>
              </div>
            </div>

            {/* Participants */}
            <div>
              <h3 className="text-lg font-bold text-foreground mb-3 flex items-center gap-2">
                <Users className="h-5 w-5 text-primary" />
                Participants ({participants.length})
              </h3>

              {loadingParticipants ? (
                <div className="space-y-2">
                  {[1, 2, 3].map((i) => (
                    <Skeleton key={i} className="h-12 w-full" />
                  ))}
                </div>
              ) : participants.length === 0 ? (
                <div className="text-center py-8 px-4 rounded-lg bg-muted/10 border border-muted/20">
                  <p className="text-muted-foreground">No participants joined this session</p>
                </div>
              ) : (
                <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2">
                  {participants.map((participant, index) => (
                    <div
                      key={participant.studentId}
                      className="p-3 rounded-lg bg-card border border-border hover:border-primary/30 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-sm font-bold text-white">
                            {index + 1}
                          </div>
                          <div>
                            <p className="font-medium text-foreground">{participant.studentName}</p>
                            <p className="text-xs text-muted-foreground">
                              Joined: {convertTimestampToDate(participant.joinedAt).toLocaleTimeString()}
                            </p>
                          </div>
                        </div>
                        <Badge
                          variant={participant.isActive ? "default" : "secondary"}
                          className={participant.isActive ? "bg-green-500/20 text-green-400 border-green-500/30" : ""}
                        >
                          {participant.isActive ? "Active" : "Left"}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SessionHistoryPage;
