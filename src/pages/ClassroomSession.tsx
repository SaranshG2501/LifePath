import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useGameContext } from '@/context/GameContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Users, Clock } from 'lucide-react';
import {
  onClassroomSessionUpdate,
  submitClassroomVote,
  getSceneVotes,
  onClassroomVotesUpdate,
} from '@/lib/classroomFirebase';
import type { ClassroomSession as ClassroomSessionType, ClassroomVote } from '@/types/game';

const ClassroomSession = () => {
  const { sessionId } = useParams<{ sessionId: string }>();
  const { currentUser, userProfile } = useAuth();
  const { scenarios } = useGameContext();
  const { toast } = useToast();
  const navigate = useNavigate();

  const [session, setSession] = useState<ClassroomSessionType | null>(null);
  const [votes, setVotes] = useState<ClassroomVote[]>([]);
  const [hasVoted, setHasVoted] = useState(false);

  useEffect(() => {
    if (!sessionId || !currentUser) {
      navigate('/');
      return;
    }

    const unsubSession = onClassroomSessionUpdate(sessionId, (updated) => {
      if (!updated) {
        toast({
          title: 'Session Ended',
          description: 'This classroom session has ended',
        });
        navigate('/');
        return;
      }
      setSession(updated);
    });

    return () => unsubSession();
  }, [sessionId, currentUser]);

  useEffect(() => {
    if (session?.currentSceneId && sessionId) {
      const unsubVotes = onClassroomVotesUpdate(
        sessionId,
        session.currentSceneId,
        (updatedVotes) => {
          setVotes(updatedVotes);
          const userVote = updatedVotes.find(v => v.userId === currentUser?.uid);
          setHasVoted(!!userVote);
        }
      );

      // Reset hasVoted when scene changes
      setHasVoted(false);

      return () => unsubVotes();
    }
  }, [session?.currentSceneId, sessionId, currentUser]);

  const handleVote = async (choiceId: string) => {
    if (!sessionId || !currentUser || !userProfile || !session?.currentSceneId) return;

    try {
      await submitClassroomVote(
        sessionId,
        session.currentSceneId,
        choiceId,
        currentUser.uid,
        userProfile.username || currentUser.email || 'Student'
      );

      setHasVoted(true);

      toast({
        title: 'Vote Submitted',
        description: 'Waiting for others...',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to submit vote',
        variant: 'destructive',
      });
    }
  };

  const getCurrentScene = () => {
    if (!session?.scenarioId || !session?.currentSceneId) return null;
    const scenario = scenarios.find(s => s.id === session.scenarioId);
    return scenario?.scenes.find(s => s.id === session.currentSceneId);
  };

  const currentScene = getCurrentScene();
  const scenario = scenarios.find(s => s.id === session?.scenarioId);

  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-lg">Loading session...</div>
      </div>
    );
  }

  if (session.status === 'waiting' || !currentScene) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="w-full max-w-2xl">
          <CardHeader>
            <CardTitle className="text-3xl text-center">
              {session.name}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6 text-center">
            <div className="flex items-center justify-center gap-2 text-muted-foreground">
              <Users className="h-5 w-5" />
              <span>{session.participants.length} students here</span>
            </div>
            <div className="space-y-2">
              <Clock className="h-12 w-12 mx-auto text-muted-foreground animate-pulse" />
              <p className="text-xl">Waiting for teacher to start...</p>
              <p className="text-sm text-muted-foreground">
                Your teacher will begin the scenario soon
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (session.status === 'paused') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="w-full max-w-2xl">
          <CardContent className="py-12 text-center">
            <Badge className="mb-4 bg-yellow-500">Paused</Badge>
            <p className="text-xl">Session paused by teacher</p>
            <p className="text-sm text-muted-foreground mt-2">Please wait...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-4xl mx-auto py-8">
        {/* Header */}
        <div className="mb-6 text-center">
          <Badge className="mb-2">{scenario?.category}</Badge>
          <h1 className="text-3xl font-bold mb-2">{scenario?.title}</h1>
          <div className="flex items-center justify-center gap-4 text-sm text-muted-foreground">
            <span className="flex items-center gap-1">
              <Users className="h-4 w-4" />
              {session.participants.length} students
            </span>
            <span>•</span>
            <span>{votes.length} voted</span>
          </div>
        </div>

        {/* Scene */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>{currentScene.title}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-lg leading-relaxed">{currentScene.description}</p>
          </CardContent>
        </Card>

        {/* Choices */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">What should we do?</h2>
          {hasVoted ? (
            <Card className="bg-green-500/10 border-green-500">
              <CardContent className="py-6 text-center">
                <p className="text-lg font-medium">✓ Vote submitted!</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Waiting for teacher to advance...
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {currentScene.choices.map((choice) => (
                <Card
                  key={choice.id}
                  className="cursor-pointer hover:border-primary transition-all"
                  onClick={() => handleVote(choice.id)}
                >
                  <CardContent className="py-6">
                    <p className="text-lg font-medium mb-2">{choice.text}</p>
                    {choice.tooltip && (
                      <p className="text-sm text-muted-foreground">{choice.tooltip}</p>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ClassroomSession;
