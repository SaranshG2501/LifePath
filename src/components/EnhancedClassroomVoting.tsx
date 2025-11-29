import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Users, BarChart, ArrowRight, Clock, CheckCircle, Wifi } from 'lucide-react';
import { useGameContext } from '@/context/GameContext';
import { useAuth } from '@/context/AuthContext';
import { Scene, Choice } from '@/types/game';
import { recordStudentVote, getScenarioVotes, onVotesUpdated, getActiveSession, onLiveSessionUpdated, submitLiveChoice, advanceLiveSession, updateStudentPresence } from '@/lib/firebase';
import { Badge } from '@/components/ui/badge';

interface EnhancedClassroomVotingProps {
  scene: Scene;
}

const EnhancedClassroomVoting: React.FC<EnhancedClassroomVotingProps> = ({ scene }) => {
  const { 
    classroomId,
    revealVotes, 
    setRevealVotes, 
    userRole,
    makeChoice,
    setCurrentScene,
    gameState,
    syncMirrorMomentsFromSession
  } = useGameContext();
  
  const { currentUser } = useAuth();
  const [votes, setVotes] = useState<any[]>([]);
  const [hasVoted, setHasVoted] = useState(false);
  const [selectedChoice, setSelectedChoice] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [liveSession, setLiveSession] = useState<any>(null);
  
  // Check for active live session
  useEffect(() => {
    const checkLiveSession = async () => {
      if (!classroomId) return;
      
      try {
        const activeSession = await getActiveSession(classroomId);
        if (activeSession) {
          setLiveSession(activeSession);
        }
      } catch (error) {
        console.error("Error checking live session:", error);
      }
    };
    
    checkLiveSession();
  }, [classroomId]);
  
  // Update presence when scene changes (student viewing scene)
  useEffect(() => {
    if (userRole === 'student' && liveSession?.id && currentUser && scene.id) {
      updateStudentPresence(liveSession.id, currentUser.uid, {
        currentSceneId: scene.id,
        isTyping: false
      });
    }
  }, [userRole, liveSession?.id, currentUser, scene.id]);
  
  // Set up real-time listeners for live session updates with proper sync
  useEffect(() => {
    if (!classroomId) return;
    
    let unsubscribeLiveSession: (() => void) | undefined;
    
    if (liveSession?.id) {
      // Use live session real-time updates
      unsubscribeLiveSession = onLiveSessionUpdated(liveSession.id, (updatedSession) => {
        console.log('[VOTING_SYNC] Session update:', {
          sessionSceneId: updatedSession.currentSceneId,
          localSceneId: scene.id,
          userRole,
          choicesCount: Object.keys(updatedSession.currentChoices || {}).length
        });

        setLiveSession(updatedSession);
        
        // Handle session ended - kick out students
        if (updatedSession.status === 'ended') {
          console.log('[VOTING_SYNC] Session ended - component will unmount');
          return;
        }
        
        // Sync scene changes from teacher to students - CRITICAL SECTION
        const sceneMismatch = updatedSession.currentSceneId && updatedSession.currentSceneId !== scene.id;
        
        if (userRole === 'student' && sceneMismatch) {
          console.log('[VOTING_SYNC] Scene mismatch - syncing student to:', updatedSession.currentSceneId);
          
          // IMMEDIATELY reset all vote-related state
          setHasVoted(false);
          setSelectedChoice(null);
          setIsSubmitting(false);
          
          // Update to new scene
          setCurrentScene(updatedSession.currentSceneId);
          
          return; // Exit early, next update will handle vote checking for new scene
        }

        // Sync mirror moments setting for students
        if (userRole === 'student' && updatedSession.mirrorMomentsEnabled !== undefined) {
          syncMirrorMomentsFromSession(updatedSession.mirrorMomentsEnabled);
        }
        
        // Convert live session choices to votes format for display
        const liveVotes = Object.entries(updatedSession.currentChoices || {}).map(([studentId, choiceId]) => ({
          studentId,
          choiceId,
          timestamp: new Date()
        }));
        setVotes(liveVotes);
        
        // Check vote status ONLY if scene IDs match (no sync needed)
        if (updatedSession.currentSceneId === scene.id) {
          console.log('[VOTING_SYNC] Scene IDs match - checking vote status');
          
          if (currentUser) {
            const userChoice = updatedSession.currentChoices?.[currentUser.uid];
            const hasVotedForScene = !!userChoice;
            
            console.log('[VOTING_SYNC] Vote status:', {
              userId: currentUser.uid,
              userChoice,
              hasVotedForScene
            });
            
            if (hasVotedForScene) {
              setHasVoted(true);
              setSelectedChoice(userChoice);
            } else {
              setHasVoted(false);
              setSelectedChoice(null);
            }
          }
        } else if (!sceneMismatch) {
          // Scene IDs don't match but no teacher sync needed (teacher view)
          console.log('[VOTING_SYNC] No scene sync needed for teacher');
        }
      });
    }
    
    return () => {
      if (unsubscribeLiveSession) unsubscribeLiveSession();
    };
  }, [classroomId, currentUser, liveSession?.id, userRole, scene.id, setCurrentScene, syncMirrorMomentsFromSession]);

  const totalVotes = votes.length;
  
  const getVoteCount = (choiceId: string) => {
    return votes.filter(vote => vote.choiceId === choiceId).length;
  };
  
  const getVotePercentage = (choiceId: string) => {
    if (!totalVotes) return 0;
    return Math.round((getVoteCount(choiceId) / totalVotes) * 100);
  };

  const handleChoiceClick = async (choiceId: string) => {
    if (userRole === 'student' && !hasVoted) {
      console.log('[VOTING_CLICK] Student submitting vote:', {
        choiceId,
        sceneId: scene.id,
        sessionId: liveSession?.id
      });
      
      setSelectedChoice(choiceId);
      setIsSubmitting(true);
      
      try {
        if (currentUser && classroomId) {
          if (liveSession?.id) {
            // Update presence to show no longer typing
            await updateStudentPresence(liveSession.id, currentUser.uid, {
              isTyping: false
            });
            
            await submitLiveChoice(liveSession.id, currentUser.uid, choiceId, scene.id);
            console.log('[VOTING_CLICK] Vote submitted successfully');
          }
          setHasVoted(true);
        }
      } catch (error) {
        console.error('[VOTING_CLICK] Error recording vote:', error);
        setSelectedChoice(null);
        setHasVoted(false);
      } finally {
        setIsSubmitting(false);
      }
    } else if (userRole === 'teacher') {
      if (!revealVotes) {
        setRevealVotes(true);
      } else {
        // Teacher advancing to next scene
        if (liveSession?.id) {
          const choice = scene.choices.find(c => c.id === choiceId);
          if (choice && choice.nextSceneId) {
            try {
              console.log('[VOTING_CLICK] Teacher advancing to:', choice.nextSceneId);
              await advanceLiveSession(liveSession.id, choice.nextSceneId);
            } catch (error) {
              console.error("[VOTING_CLICK] Error advancing:", error);
            }
          }
        }
        makeChoice(choiceId);
      }
    } else {
      console.log('[VOTING_CLICK] Click blocked:', {
        userRole,
        hasVoted,
        isSubmitting
      });
    }
  };

  const handleContinue = () => {
    // Get the choice with the most votes
    if (totalVotes > 0) {
      const voteCounts: Record<string, number> = {};
      votes.forEach(vote => {
        voteCounts[vote.choiceId] = (voteCounts[vote.choiceId] || 0) + 1;
      });
      
      const topChoiceId = Object.entries(voteCounts)
        .sort(([, a], [, b]) => (b as number) - (a as number))[0][0];
      
      makeChoice(topChoiceId);
    }
  };

  return (
    <Card className="w-full max-w-4xl mx-auto bg-black/40 border-primary/20 backdrop-blur-lg shadow-xl animate-fade-in">
      <CardHeader>
        <div className="flex items-center justify-center gap-2 mb-2">
          <Users className="h-5 w-5 text-primary" />
          <CardTitle className="text-xl text-white">Classroom Decision</CardTitle>
          {liveSession && (
            <Badge className="bg-green-500/20 text-green-300 border-0">
              <Wifi className="h-3 w-3 mr-1" />
              Live
            </Badge>
          )}
        </div>
        <CardDescription className="text-center text-white/80">
          {userRole === 'teacher' 
            ? 'Review class votes and advance the scenario' 
            : hasVoted 
              ? 'Waiting for teacher to continue' 
              : 'Cast your vote on what should happen next'}
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        {/* Question under Classroom Decision */}
        <div className="bg-black/30 rounded-lg p-4 border border-primary/20 mb-4">
          <CardTitle className="text-white text-lg mb-2">{scene.title}</CardTitle>
          <CardDescription className="text-white/90">{scene.description}</CardDescription>
        </div>

        <div className="bg-black/20 rounded-lg p-3 mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BarChart className="h-5 w-5 text-primary" />
            <span className="text-white font-medium">Votes: {totalVotes}</span>
            {liveSession && (
              <Badge className="bg-blue-500/20 text-blue-300 border-0 text-xs">
                Scene: {liveSession.currentSceneId}
              </Badge>
            )}
          </div>
          
          {userRole === 'teacher' && (
            <Button 
              variant="outline"
              size="sm"
              onClick={() => setRevealVotes(!revealVotes)}
              className="border-white/20 bg-black/40 text-white hover:bg-white/10"
            >
              {revealVotes ? 'Hide Results' : 'Show Results'}
            </Button>
          )}
        </div>
        
        <div className="space-y-4">
          {scene.choices.map((choice) => (
            <div key={choice.id} className="space-y-2">
              <Button
                variant="outline"
                className={`w-full justify-between py-6 px-4 text-left border ${
                  hasVoted && selectedChoice === choice.id
                    ? 'border-primary/70 bg-primary/20'
                    : revealVotes && getVotePercentage(choice.id) > 0
                    ? 'border-primary/30 bg-primary/10'
                    : 'border-white/10 bg-black/30'
                } hover:bg-white/10 text-white relative overflow-hidden ${
                  isSubmitting ? 'opacity-50 cursor-not-allowed' : ''
                }`}
                onClick={() => !isSubmitting && handleChoiceClick(choice.id)}
                onMouseEnter={() => {
                  if (userRole === 'student' && !hasVoted && liveSession?.id && currentUser) {
                    updateStudentPresence(liveSession.id, currentUser.uid, { isTyping: true });
                  }
                }}
                onMouseLeave={() => {
                  if (userRole === 'student' && !hasVoted && liveSession?.id && currentUser) {
                    updateStudentPresence(liveSession.id, currentUser.uid, { isTyping: false });
                  }
                }}
                disabled={isSubmitting || (userRole === 'student' && hasVoted)}
              >
                <span className="text-base">{choice.text}</span>
                
                {(revealVotes || (hasVoted && selectedChoice === choice.id)) && (
                  <div className="flex items-center gap-1">
                    <span className="text-sm text-white/80">{getVoteCount(choice.id)} votes</span>
                    <span className="font-mono font-bold">{getVotePercentage(choice.id)}%</span>
                  </div>
                )}
                
                {hasVoted && selectedChoice === choice.id && !revealVotes && (
                  <Badge className="absolute top-2 right-2 bg-primary/60 text-white">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Your vote
                  </Badge>
                )}
              </Button>
              
              {revealVotes && (
                <Progress 
                  value={getVotePercentage(choice.id)} 
                  className="h-2 bg-white/20" 
                />
              )}
            </div>
          ))}
        </div>
      </CardContent>
      
      <CardFooter className="flex justify-center pt-4">
        {userRole === 'teacher' && revealVotes && (
          <div className="text-center">
            <p className="text-white/80 text-sm mb-3">
              Click on a choice above to advance the scenario
            </p>
          </div>
        )}
        
        {userRole === 'student' && (
          <div className="text-white/80 text-center flex items-center gap-2">
            {hasVoted ? (
              <>
                <Clock className="h-5 w-5 inline-block" />
                Waiting for teacher to continue...
              </>
            ) : (
              <>
                <Users className="h-5 w-5 inline-block" />
                Choose what happens next
              </>
            )}
          </div>
        )}
      </CardFooter>
    </Card>
  );
};

export default EnhancedClassroomVoting;
