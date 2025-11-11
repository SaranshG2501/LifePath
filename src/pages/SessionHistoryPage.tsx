import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import { getTeacherSessionHistory, getSessionParticipants, getClassroom, convertTimestampToDate } from '@/lib/firebase';
import { History, Users, Calendar, Clock, BookOpen, ArrowLeft, TrendingUp, Award } from 'lucide-react';
import { LiveSession } from '@/lib/firebase';

const SessionHistoryPage = () => {
  const { currentUser } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const [sessions, setSessions] = useState<(LiveSession & { classroomName?: string; participantCount?: number })[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSession, setSelectedSession] = useState<(LiveSession & { classroomName?: string; participantDetails?: any[] }) | null>(null);
  const [loadingDetails, setLoadingDetails] = useState(false);

  useEffect(() => {
    if (currentUser) {
      loadSessionHistory();
    }
  }, [currentUser]);

  const loadSessionHistory = async () => {
    if (!currentUser) return;
    
    try {
      setLoading(true);
      const history = await getTeacherSessionHistory(currentUser.uid);
      
      // Enrich with classroom names and participant counts
      const enrichedHistory = await Promise.all(
        history.map(async (session) => {
          try {
            const classroom = await getClassroom(session.classroomId);
            return {
              ...session,
              classroomName: classroom?.name || 'Unknown Classroom',
              participantCount: session.participants?.length || 0
            };
          } catch (error) {
            console.error('Error enriching session:', error);
            return {
              ...session,
              classroomName: 'Unknown Classroom',
              participantCount: session.participants?.length || 0
            };
          }
        })
      );
      
      setSessions(enrichedHistory);
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

  const loadSessionDetails = async (session: LiveSession & { classroomName?: string }) => {
    if (!session.id) return;
    
    try {
      setLoadingDetails(true);
      const participantDetails = await getSessionParticipants(session.id);
      setSelectedSession({ ...session, participantDetails });
    } catch (error) {
      console.error('Error loading session details:', error);
      toast({
        title: "Error",
        description: "Failed to load session details.",
        variant: "destructive",
      });
    } finally {
      setLoadingDetails(false);
    }
  };

  const formatDuration = (startedAt: any, endedAt: any) => {
    try {
      const start = convertTimestampToDate(startedAt);
      const end = convertTimestampToDate(endedAt);
      const durationMs = end.getTime() - start.getTime();
      const minutes = Math.floor(durationMs / 60000);
      return `${minutes} min`;
    } catch {
      return 'N/A';
    }
  };

  const calculateStats = () => {
    const totalSessions = sessions.length;
    const totalParticipants = sessions.reduce((sum, s) => sum + (s.participantCount || 0), 0);
    const avgParticipants = totalSessions > 0 ? Math.round(totalParticipants / totalSessions) : 0;
    
    return { totalSessions, totalParticipants, avgParticipants };
  };

  const stats = calculateStats();

  if (!currentUser) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="teen-card">
          <CardContent className="p-8 text-center">
            <p className="text-muted-foreground">Please log in to view session history.</p>
            <Button onClick={() => navigate('/auth')} className="mt-4">
              Log In
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-3 py-6 sm:px-4 sm:py-8 animate-fade-in">
      {/* Header */}
      <div className="glass-card mb-8 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-secondary/10 to-transparent"></div>
        <div className="relative">
          <div className="flex items-start justify-between gap-4 mb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10 border border-primary/20">
                <History className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h1 className="text-3xl sm:text-4xl font-bold gradient-heading">Session History</h1>
                <p className="text-muted-foreground text-base">Review past live sessions and student participation</p>
              </div>
            </div>
            <Button 
              variant="outline" 
              onClick={() => navigate('/teacher')}
              className="border-primary/30"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
          </div>

          {/* Stats Overview */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6">
            <div className="stat-badge flex-col items-start p-4 bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20">
              <div className="flex items-center gap-2 mb-1">
                <TrendingUp className="h-4 w-4 text-primary" />
                <span className="text-xs text-muted-foreground">Total Sessions</span>
              </div>
              <p className="text-2xl font-bold text-foreground">{stats.totalSessions}</p>
            </div>
            <div className="stat-badge flex-col items-start p-4 bg-gradient-to-br from-secondary/10 to-secondary/5 border border-secondary/20">
              <div className="flex items-center gap-2 mb-1">
                <Users className="h-4 w-4 text-secondary" />
                <span className="text-xs text-muted-foreground">Total Participants</span>
              </div>
              <p className="text-2xl font-bold text-foreground">{stats.totalParticipants}</p>
            </div>
            <div className="stat-badge flex-col items-start p-4 bg-gradient-to-br from-accent/10 to-accent/5 border border-accent/20">
              <div className="flex items-center gap-2 mb-1">
                <Award className="h-4 w-4 text-accent" />
                <span className="text-xs text-muted-foreground">Avg Participants</span>
              </div>
              <p className="text-2xl font-bold text-foreground">{stats.avgParticipants}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Session List */}
      {loading ? (
        <Card className="teen-card">
          <CardContent className="p-8">
            <div className="text-center text-muted-foreground">Loading session history...</div>
          </CardContent>
        </Card>
      ) : sessions.length === 0 ? (
        <Card className="teen-card">
          <CardContent className="p-8 text-center">
            <History className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
            <p className="text-muted-foreground mb-2">No session history yet</p>
            <p className="text-sm text-muted-foreground/70">Start live sessions from your classrooms to see them here</p>
            <Button onClick={() => navigate('/teacher')} className="mt-4">
              Go to Dashboard
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card className="teen-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-foreground">
              <BookOpen className="h-5 w-5" />
              Past Sessions
            </CardTitle>
            <CardDescription>Click on a session to view detailed participation data</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-primary/10 hover:bg-transparent">
                    <TableHead className="text-primary">Date</TableHead>
                    <TableHead className="text-primary">Scenario</TableHead>
                    <TableHead className="text-primary">Classroom</TableHead>
                    <TableHead className="text-primary">Participants</TableHead>
                    <TableHead className="text-primary">Duration</TableHead>
                    <TableHead className="text-primary">Mirror Moments</TableHead>
                    <TableHead className="text-primary">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sessions.map((session) => (
                    <TableRow 
                      key={session.id} 
                      className="border-primary/10 hover:bg-primary/5 cursor-pointer transition-colors"
                      onClick={() => loadSessionDetails(session)}
                    >
                      <TableCell className="text-foreground">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          {convertTimestampToDate(session.startedAt).toLocaleDateString()}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {convertTimestampToDate(session.startedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </TableCell>
                      <TableCell className="font-medium text-foreground">{session.scenarioTitle}</TableCell>
                      <TableCell className="text-foreground">{session.classroomName}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Users className="h-4 w-4 text-secondary" />
                          <span className="text-foreground font-medium">{session.participantCount}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Clock className="h-4 w-4" />
                          {session.endedAt ? formatDuration(session.startedAt, session.endedAt) : 'N/A'}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge 
                          className={session.mirrorMomentsEnabled 
                            ? "bg-green-500/20 text-green-400 border-0" 
                            : "bg-gray-500/20 text-gray-400 border-0"
                          }
                        >
                          {session.mirrorMomentsEnabled ? 'Enabled' : 'Disabled'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            loadSessionDetails(session);
                          }}
                          className="text-primary hover:text-primary/80"
                        >
                          View Details
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Session Details Modal */}
      {selectedSession && (
        <div 
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedSession(null)}
        >
          <Card 
            className="teen-card max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-foreground">{selectedSession.scenarioTitle}</CardTitle>
                  <CardDescription className="mt-2">
                    {selectedSession.classroomName} • {convertTimestampToDate(selectedSession.startedAt).toLocaleDateString()}
                  </CardDescription>
                </div>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => setSelectedSession(null)}
                  className="text-muted-foreground hover:text-foreground"
                >
                  ✕
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {loadingDetails ? (
                <div className="text-center text-muted-foreground py-8">Loading participant details...</div>
              ) : (
                <div className="space-y-6">
                  {/* Session Info */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="stat-badge flex-col items-start p-3">
                      <span className="text-xs text-muted-foreground mb-1">Total Participants</span>
                      <span className="text-xl font-bold text-foreground">{selectedSession.participantDetails?.length || 0}</span>
                    </div>
                    <div className="stat-badge flex-col items-start p-3">
                      <span className="text-xs text-muted-foreground mb-1">Duration</span>
                      <span className="text-xl font-bold text-foreground">
                        {selectedSession.endedAt ? formatDuration(selectedSession.startedAt, selectedSession.endedAt) : 'N/A'}
                      </span>
                    </div>
                  </div>

                  {/* Participants List */}
                  <div>
                    <h3 className="text-lg font-semibold text-foreground mb-3 flex items-center gap-2">
                      <Users className="h-5 w-5 text-primary" />
                      Participants
                    </h3>
                    {selectedSession.participantDetails && selectedSession.participantDetails.length > 0 ? (
                      <div className="space-y-2">
                        {selectedSession.participantDetails.map((participant: any) => (
                          <div 
                            key={participant.id} 
                            className="flex items-center justify-between p-3 rounded-lg bg-primary/5 border border-primary/10"
                          >
                            <div>
                              <p className="font-medium text-foreground">{participant.studentName}</p>
                              <p className="text-xs text-muted-foreground">
                                Joined: {convertTimestampToDate(participant.joinedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </p>
                            </div>
                            <Badge 
                              className={participant.isActive 
                                ? "bg-green-500/20 text-green-400 border-0" 
                                : "bg-gray-500/20 text-gray-400 border-0"
                              }
                            >
                              {participant.isActive ? 'Active' : 'Left'}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-muted-foreground text-sm">No participant data available</p>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default SessionHistoryPage;
