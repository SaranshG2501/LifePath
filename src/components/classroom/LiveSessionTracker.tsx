
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Eye, EyeOff, AlertTriangle, Wifi } from 'lucide-react';
import { LiveSession, SessionParticipant, onLiveSessionUpdated, onSessionParticipantsUpdated, sendSessionMessage, SessionMessage } from '@/lib/firebase';
import { useAuth } from '@/context/AuthContext';
import SessionStats from './SessionStats';
import SessionMessaging from './SessionMessaging';
import VotingResults from './VotingResults';
import ParticipantsList from './ParticipantsList';

interface LiveSessionTrackerProps {
  session: LiveSession;
  onAdvanceScene: (nextSceneId: string) => void;
  onEndSession: () => void;
  isTeacher: boolean;
}

interface Message {
  id: string;
  text: string;
  timestamp: number;
  author: string;
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
  const [messages, setMessages] = useState<Message[]>([]);
  const { currentUser } = useAuth();

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

  // Listen for session updates
  useEffect(() => {
    if (!session.id) return;

    const unsubscribe = onLiveSessionUpdated(session.id, (updatedSession) => {
      if (updatedSession?.messages) {
        const sessionMessages: Message[] = updatedSession.messages.map((msg: SessionMessage, index: number) => ({
          id: `${msg.timestamp || Date.now()}-${index}`,
          text: msg.text,
          timestamp: msg.timestamp,
          author: msg.author
        }));
        setMessages(sessionMessages);
      }
    });

    return unsubscribe;
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

  const handleSendMessage = async (messageText: string) => {
    if (!isTeacher || !currentUser || !session.id) return;
    
    try {
      const messageObj: SessionMessage = {
        text: messageText,
        timestamp: Date.now(),
        author: 'Teacher'
      };
      
      // Send message to Firebase
      await sendSessionMessage(session.id, messageObj);
      
      // Update local state immediately for better UX
      const localMessage: Message = {
        id: `${Date.now()}-${Math.random()}`,
        text: messageText,
        timestamp: Date.now(),
        author: 'Teacher'
      };
      setMessages(prev => [...prev, localMessage]);
      
      console.log("Message sent successfully:", messageObj);
    } catch (error) {
      console.error("Error sending message:", error);
    }
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
              <Wifi className="h-3 w-3 text-green-400" />
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
                className="border-purple-500/20 text-purple-400 hover:bg-purple-500/10 text-xs"
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
        <SessionStats 
          participantCount={participantCount}
          responseRate={responseRate}
          totalVotes={totalVotes}
        />

        <SessionMessaging 
          messages={messages}
          isTeacher={isTeacher}
          onSendMessage={handleSendMessage}
        />

        <VotingResults 
          choiceStats={choiceStats}
          participantCount={participantCount}
          showResults={showResults}
        />

        <ParticipantsList 
          participants={participants}
          showResults={showResults}
          getParticipantChoice={getParticipantChoice}
        />
      </CardContent>
    </Card>
  );
};

export default LiveSessionTracker;
