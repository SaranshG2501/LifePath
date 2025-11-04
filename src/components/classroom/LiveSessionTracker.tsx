import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Users, Clock, BarChart3, CheckCircle, Loader2, Eye, EyeOff, BookOpen } from 'lucide-react';
import { LiveSession, SessionParticipant, onLiveSessionUpdated, onSessionParticipantsUpdated } from '@/lib/firebase';
import { useGameContext } from '@/context/GameContext';
import { scenarios } from '@/data/scenarios';

interface LiveSessionTrackerProps {
  session: LiveSession;
  onAdvanceScene: (nextSceneId: string) => void;
  onEndSession: () => void;
  isTeacher: boolean;
}

const LiveSessionTracker: React.FC<LiveSessionTrackerProps> = ({
  session,
  onAdvanceScene,
  onEndSession,
  isTeacher
}) => {
  const [participants, setParticipants] = useState<SessionParticipant[]>([]);
  const [choiceStats, setChoiceStats] = useState<Record<string, number>>({});
  const [showResults, setShowResults] = useState(false);
  const { gameState } = useGameContext();

  // Get the current scene from session data, not from gameState
  const getCurrentScene = () => {
    if (!session.scenarioId || !session.currentSceneId) {
      return null;
    }
    
    const scenario = scenarios.find(s => s.id === session.scenarioId);
    if (!scenario) {
      return null;
    }
    
    const scene = scenario.scenes.find(scene => scene.id === session.currentSceneId);
    return scene || null;
  };

  const currentScene = getCurrentScene();

  useEffect(() => {
    if (!session.id) return;

    const unsubscribeParticipants = onSessionParticipantsUpdated(session.id, (updatedParticipants) => {
      setParticipants(updatedParticipants);
    });
    
    return () => {
      unsubscribeParticipants();
    };
  }, [session.id]);

  useEffect(() => {
    // Calculate choice statistics from live session choices
    const stats: Record<string, number> = {};
    if (session.currentChoices) {
      Object.values(session.currentChoices).forEach(choice => {
        stats[choice] = (stats[choice] || 0) + 1;
      });
    }
    setChoiceStats(stats);
  }, [session.currentChoices]);

  const totalVotes = Object.values(choiceStats).reduce((sum, count) => sum + count, 0);
  const participantCount = participants.length;
  const responseRate = participantCount > 0 ? (totalVotes / participantCount) * 100 : 0;

  const getParticipantChoice = (participantId: string) => {
    return session.currentChoices?.[participantId];
  };


  return (
    <div className="space-y-4">

      {/* Live Session Tracker */}
      <Card className="bg-black/30 border-blue-500/20">
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-white flex items-center gap-2">
                <div className="relative">
                  <div className="absolute h-3 w-3 rounded-full bg-green-400 animate-ping"></div>
                  <div className="relative h-3 w-3 rounded-full bg-green-400"></div>
                </div>
                Live Session Active
              </CardTitle>
              <CardDescription className="text-white/70">
                {session.scenarioTitle} - Scene: {session.currentSceneId}
              </CardDescription>
            </div>
            {isTeacher && (
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setShowResults(!showResults)}
                  className="border-blue-500/20 text-blue-400 hover:bg-blue-500/10"
                >
                  {showResults ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  {showResults ? 'Hide' : 'Show'} Results
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={onEndSession}
                  className="border-red-500/20 text-red-400 hover:bg-red-500/10"
                >
                  End Session
                </Button>
              </div>
            )}
          </div>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-black/20 rounded-lg p-3 text-center">
              <div className="flex items-center justify-center gap-1 mb-1">
                <Users className="h-4 w-4 text-blue-400" />
              </div>
              <div className="text-lg font-bold text-white">{participantCount}</div>
              <div className="text-xs text-white/70">Participants</div>
            </div>
            
            <div className="bg-black/20 rounded-lg p-3 text-center">
              <div className="flex items-center justify-center gap-1 mb-1">
                <BarChart3 className="h-4 w-4 text-green-400" />
              </div>
              <div className="text-lg font-bold text-white">{Math.round(responseRate)}%</div>
              <div className="text-xs text-white/70">Response Rate</div>
            </div>
            
            <div className="bg-black/20 rounded-lg p-3 text-center">
              <div className="flex items-center justify-center gap-1 mb-1">
                <Clock className="h-4 w-4 text-orange-400" />
              </div>
              <div className="text-lg font-bold text-white">{totalVotes}</div>
              <div className="text-xs text-white/70">Votes Cast</div>
            </div>
          </div>

          {showResults && Object.keys(choiceStats).length > 0 && (
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-white">Current Voting Results:</h4>
              {Object.entries(choiceStats).map(([choiceId, count]) => (
                <div key={choiceId} className="flex justify-between items-center bg-black/20 rounded p-2">
                  <span className="text-white/80 text-sm">Choice {choiceId}</span>
                  <Badge className="bg-blue-500/20 text-blue-300 border-0">
                    {count} votes ({participantCount > 0 ? Math.round((count / participantCount) * 100) : 0}%)
                  </Badge>
                </div>
              ))}
            </div>
          )}

          <div className="space-y-2">
            <h4 className="text-sm font-medium text-white">Active Participants:</h4>
            <div className="grid grid-cols-1 gap-2 max-h-32 overflow-y-auto">
              {participants.length > 0 ? participants.map((participant) => {
                const hasVoted = getParticipantChoice(participant.studentId);
                return (
                  <div key={participant.studentId} className="flex items-center gap-2 bg-black/20 rounded p-2">
                    <Avatar className="h-6 w-6">
                      <AvatarFallback className="bg-blue-500/20 text-white text-xs">
                        {participant.studentName.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-white/80 text-sm truncate flex-1">{participant.studentName}</span>
                    {showResults && hasVoted && (
                      <Badge className="bg-green-500/20 text-green-300 border-0 text-xs">
                        Choice {hasVoted}
                      </Badge>
                    )}
                    {hasVoted ? (
                      <CheckCircle className="h-4 w-4 text-green-400" />
                    ) : (
                      <Loader2 className="h-4 w-4 text-orange-400 animate-spin" />
                    )}
                  </div>
                );
              }) : (
                <div className="text-white/60 text-sm text-center py-2">
                  Waiting for students to join...
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default LiveSessionTracker;
