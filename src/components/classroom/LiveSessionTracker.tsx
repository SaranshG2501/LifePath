
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Users, Clock, BarChart3, CheckCircle, Loader2, Eye, EyeOff, AlertTriangle, MessageCircle, Send } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { LiveSession, SessionParticipant, onLiveSessionUpdated, onSessionParticipantsUpdated } from '@/lib/firebase';

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
  const [messages, setMessages] = useState<Array<{id: string, text: string, timestamp: number}>>([]);
  const [newMessage, setNewMessage] = useState('');

  useEffect(() => {
    if (!session.id) return;

    console.log("Setting up participants listener for session:", session.id);
    const unsubscribeParticipants = onSessionParticipantsUpdated(session.id, (updatedParticipants) => {
      console.log("Participants updated:", updatedParticipants);
      setParticipants(updatedParticipants);
    });
    
    return () => {
      unsubscribeParticipants();
    };
  }, [session.id]);

  useEffect(() => {
    // Calculate choice statistics from live session choices
    console.log("Calculating choice stats from:", session.currentChoices);
    const stats: Record<string, number> = {};
    if (session.currentChoices) {
      Object.values(session.currentChoices).forEach(choice => {
        stats[choice] = (stats[choice] || 0) + 1;
      });
    }
    setChoiceStats(stats);
  }, [session.currentChoices]);

  // Listen for session messages
  useEffect(() => {
    if (session.messages) {
      setMessages(session.messages.map((msg, index) => ({
        id: `${index}`,
        text: msg,
        timestamp: Date.now() - (session.messages!.length - index) * 1000
      })));
    }
  }, [session.messages]);

  const sendMessage = async () => {
    if (!newMessage.trim()) return;
    
    // Add message to local state immediately for better UX
    const messageObj = {
      id: Date.now().toString(),
      text: newMessage,
      timestamp: Date.now()
    };
    
    setMessages(prev => [...prev, messageObj]);
    setNewMessage('');
    
    // TODO: Implement Firebase message sending
    console.log("Sending message:", newMessage);
  };

  const totalVotes = Object.values(choiceStats).reduce((sum, count) => sum + count, 0);
  const participantCount = participants.length;
  const responseRate = participantCount > 0 ? (totalVotes / participantCount) * 100 : 0;

  const getParticipantChoice = (participantId: string) => {
    return session.currentChoices?.[participantId];
  };

  return (
    <Card className="bg-black/30 border-blue-500/20">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-white flex items-center gap-2 text-sm">
              <div className="relative">
                <div className="absolute h-2 w-2 rounded-full bg-green-400 animate-ping"></div>
                <div className="relative h-2 w-2 rounded-full bg-green-400"></div>
              </div>
              Live Session Active
            </CardTitle>
            <CardDescription className="text-white/70 text-xs">
              {session.scenarioTitle} - Scene: {session.currentSceneId}
            </CardDescription>
          </div>
          {isTeacher && (
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setShowResults(!showResults)}
                className="border-blue-500/20 text-blue-400 hover:bg-blue-500/10 text-xs"
              >
                {showResults ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                {showResults ? 'Hide' : 'Show'} Results
              </Button>
              <Button 
                variant="destructive"
                size="sm"
                onClick={onEndSession}
                className="bg-red-500 hover:bg-red-600 text-white border-0 text-xs"
              >
                <AlertTriangle className="h-3 w-3 mr-1" />
                End Session
              </Button>
            </div>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="space-y-3">
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-black/20 rounded-lg p-2 text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              <Users className="h-3 w-3 text-blue-400" />
            </div>
            <div className="text-sm font-bold text-white">{participantCount}</div>
            <div className="text-xs text-white/70">Participants</div>
          </div>
          
          <div className="bg-black/20 rounded-lg p-2 text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              <BarChart3 className="h-3 w-3 text-green-400" />
            </div>
            <div className="text-sm font-bold text-white">{Math.round(responseRate)}%</div>
            <div className="text-xs text-white/70">Response Rate</div>
          </div>
          
          <div className="bg-black/20 rounded-lg p-2 text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              <Clock className="h-3 w-3 text-orange-400" />
            </div>
            <div className="text-sm font-bold text-white">{totalVotes}</div>
            <div className="text-xs text-white/70">Votes Cast</div>
          </div>
        </div>

        {/* Class Messages Section */}
        <div className="bg-black/20 rounded-lg p-3">
          <div className="flex items-center gap-2 mb-2">
            <MessageCircle className="h-3 w-3 text-blue-400" />
            <h4 className="text-xs font-medium text-white">Class Messages</h4>
          </div>
          
          <div className="space-y-1 max-h-20 overflow-y-auto mb-2">
            {messages.length > 0 ? messages.slice(-3).map((message) => (
              <div key={message.id} className="text-xs text-white/80 bg-blue-500/10 rounded p-1">
                <span className="text-blue-400">[Teacher]</span> {message.text}
              </div>
            )) : (
              <div className="text-xs text-white/50 text-center py-1">
                No messages yet
              </div>
            )}
          </div>
          
          {isTeacher && (
            <div className="flex gap-1">
              <Input
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Send message to class..."
                className="text-xs h-7 bg-black/20 border-white/10 text-white"
                onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
              />
              <Button 
                size="sm" 
                onClick={sendMessage}
                className="h-7 px-2 bg-blue-500 hover:bg-blue-600"
                disabled={!newMessage.trim()}
              >
                <Send className="h-3 w-3" />
              </Button>
            </div>
          )}
        </div>

        {showResults && Object.keys(choiceStats).length > 0 && (
          <div className="space-y-1">
            <h4 className="text-xs font-medium text-white">Current Voting Results:</h4>
            {Object.entries(choiceStats).map(([choiceId, count]) => (
              <div key={choiceId} className="flex justify-between items-center bg-black/20 rounded p-1">
                <span className="text-white/80 text-xs">Choice {choiceId}</span>
                <Badge className="bg-blue-500/20 text-blue-300 border-0 text-xs">
                  {count} votes ({participantCount > 0 ? Math.round((count / participantCount) * 100) : 0}%)
                </Badge>
              </div>
            ))}
          </div>
        )}

        <div className="space-y-1">
          <h4 className="text-xs font-medium text-white">Active Participants:</h4>
          <div className="grid grid-cols-1 gap-1 max-h-24 overflow-y-auto">
            {participants.length > 0 ? participants.map((participant) => {
              const hasVoted = getParticipantChoice(participant.studentId);
              return (
                <div key={participant.studentId} className="flex items-center gap-2 bg-black/20 rounded p-1">
                  <Avatar className="h-4 w-4">
                    <AvatarFallback className="bg-blue-500/20 text-white text-xs">
                      {participant.studentName.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-white/80 text-xs truncate flex-1">{participant.studentName}</span>
                  {showResults && hasVoted && (
                    <Badge className="bg-green-500/20 text-green-300 border-0 text-xs">
                      Choice {hasVoted}
                    </Badge>
                  )}
                  {hasVoted ? (
                    <CheckCircle className="h-3 w-3 text-green-400" />
                  ) : (
                    <Loader2 className="h-3 w-3 text-orange-400 animate-spin" />
                  )}
                </div>
              );
            }) : (
              <div className="text-white/60 text-xs text-center py-1">
                Waiting for students to join...
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default LiveSessionTracker;
